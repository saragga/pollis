/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { IUtilityProcessWorkerWorkbenchService } from '../../../services/utilityProcess/electron-browser/utilityProcessWorkerWorkbenchService.js';
import { ASK_CHAT_MODEL, ASK_CLOUD_PROVIDERS, ASK_EMBEDDING_CONTEXT, ASK_EMBEDDING_MODEL, ASK_LOCAL_PREFIX, ASK_PASSAGES, ASK_QUERY_PREFIX, ASK_RERANK_CONTEXT, ASK_SIMILARITY_PREFIX, askCloudModel, askPollisMessages, askShares, embeddingPrefixes, IAskPassageMatch, IAskPollisAnswer, IAskPollisAttachment, IAskPollisChatRequest, IAskPollisFound, IAskPollisIndex, IAskPollisIndexedDocument, IAskPollisIndexStatus, IAskPollisNamedIndex, IAskPollisPassage, IAskPollisReranked, IAskPollisSearchRequest, IAskPollisSearchResult, IAskPollisSearchStamp, IAskPollisService, IAskPollisTurn, IAskTopicCounts, IBenchmarkAnswer, IBenchmarkRun, ICompareRun, ICompareRunSummary, IEmbeddingDone, IEmbeddingEvaluated, IEmbeddingEvaluation, IEmbeddingProgress, IEmbeddingRequest, IEmbeddingRun, IEmbeddingRunSummary, IRerankRun, IRerankRunSummary, IRetrievalEmbeddingRequest, IRetrievalEvaluation, IRetrievalQuery, IRetrievalRerankDone, IRetrievalRerankRequest } from '../common/askPollis.js';
import { IDuckDBFunctionKind } from '../../databases/common/duckdbHelp.js';

/** What the command of the Julia extension that starts a llama.cpp server answers (pollisLlamaServer.ts). */
interface ILlamaServerAnswer {
	readonly url?: string;
	/** The model's name in the server's API. */
	readonly model?: string;
	readonly error?: string;
}

/**
 * The search of Ask Pollis: the index in a utility process, started when first asked and again when it has ended; the
 * embedding model in a llama.cpp server of the Julia extension, only when the passages were embedded with the model of
 * the setting, which is then on this computer, so that a search downloads nothing. The answer is written by the chat
 * model of this computer, in a server of the Julia extension too, or by the cloud model of pollis.ask.answerWith.
 */
class AskPollisService extends Disposable implements IAskPollisService {

	declare readonly _serviceBrand: undefined;

	// The proxy kept in an object: awaited itself, its `then` would be taken for a method of the process, never answered
	private index: Promise<{ readonly proxy: IAskPollisIndex }> | undefined;

	private readonly _onDidEmbed = this._register(new Emitter<IEmbeddingProgress>());
	readonly onDidEmbed = this._onDidEmbed.event;

	constructor(
		@IUtilityProcessWorkerWorkbenchService private readonly utilityProcessWorkerWorkbenchService: IUtilityProcessWorkerWorkbenchService,
		@ICommandService private readonly commandService: ICommandService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@ISecretStorageService private readonly secretStorageService: ISecretStorageService,
		@IProductService private readonly productService: IProductService,
	) {
		super();
	}

	private get(): Promise<{ readonly proxy: IAskPollisIndex }> {
		this.index ??= (async () => {
			const worker = this._register(await this.utilityProcessWorkerWorkbenchService.createWorker({
				moduleId: 'vs/workbench/contrib/compose/node/askPollisMain',
				type: 'askPollis',
				name: 'ask-pollis',
			}));
			worker.onDidTerminate.then(() => this.index = undefined);
			const proxy = ProxyChannel.toService<IAskPollisIndex>(worker.client.getChannel('askPollis'));
			this._register(proxy.onDidEmbed(e => this._onDidEmbed.fire(e)));
			return { proxy };
		})();
		return this.index;
	}

	async collections(): Promise<readonly string[]> {
		const { proxy } = await this.get();
		return (await proxy.status())?.collections ?? [];
	}

	async collectionIndexes(): Promise<readonly IAskPollisNamedIndex[]> {
		const { proxy } = await this.get();
		const indexes: IAskPollisNamedIndex[] = [];
		for (const file of await proxy.collectionFiles()) {
			// An index being built cannot be read, and is listed once it is
			const status = await proxy.status(file);
			if (status?.passages && status.collections.length) {
				indexes.push({ name: status.collections[0], file, embeddingModel: status.embedder, queryPrefix: embeddingPrefixes(status.embedder).query });
			}
		}
		return indexes;
	}

	/**
	 * The passages of PollisDocuments, as `collections` chooses them, and of the collections of `collectionIndexes`, each
	 * searched in its own index: most from the one nearest the question, when their embedding models are the same and so
	 * their distances can be compared, else from the first; the rest shared, as among the collections of PollisDocuments.
	 * Asked in a panel, PollisDocuments, which holds the panel's passages, comes first.
	 */
	async search(request: IAskPollisSearchRequest): Promise<IAskPollisSearchResult> {
		const others = request.index ? [] : request.collectionIndexes ?? [];
		if (!others.length) {
			return this.searchIndex(request);
		}
		const count = request.passages ?? (this.configurationService.getValue<number>('pollis.ask.passages') || ASK_PASSAGES);
		const withPollis = request.collections === undefined || request.collections.length > 0;
		const pollisModel = this.configurationService.getValue<string>('pollis.ask.embeddingModel')?.trim() || ASK_EMBEDDING_MODEL;
		const targets: { readonly request: IAskPollisSearchRequest; readonly model: string }[] = [
			...(withPollis ? [{ request: { ...request, collectionIndexes: undefined, passages: count }, model: pollisModel }] : []),
			...others.map(index => ({ request: { question: request.question, passages: count, index }, model: index.embeddingModel })),
		];
		const found = await Promise.all(targets.map(target => this.searchIndex(target.request)));
		let order = targets.map((_, i) => i);
		const comparable = found.every(result => result.distance !== undefined) && targets.every(target => target.model === targets[0].model);
		if (comparable && !(withPollis && request.panel)) {
			order = order.sort((a, b) => found[a].distance! - found[b].distance!);
		}
		const counts = askShares(count, order.length);
		const passages: IAskPollisPassage[] = [];
		const searched: string[] = [];
		for (const [position, i] of order.entries()) {
			// PollisDocuments shares among its own collections and the panel's passages, so it is searched again for fewer
			const result = withPollis && i === 0 && counts[position] < count ? await this.searchIndex({ ...targets[0].request, passages: counts[position] }) : found[i];
			passages.push(...result.passages.slice(0, counts[position]));
			searched.push(...result.searched);
		}
		const pollis = withPollis ? found[0] : undefined;
		const wordsOnly = pollis?.wordsOnly === 'notIndexed' && passages.length ? undefined : pollis?.wordsOnly ?? found.find(result => result.wordsOnly)?.wordsOnly;
		const error = pollis?.error ?? found.find(result => result.error)?.error;
		const collections = pollis?.collections ?? await this.collections();
		return {
			passages,
			searched,
			collections,
			...(wordsOnly ? { wordsOnly } : {}),
			...(error ? { error } : {}),
			...(pollis?.panelMissing ? { panelMissing: true } : {}),
		};
	}

	/** The passages of one index: PollisDocuments, or the collection of `request.index`. */
	private async searchIndex(request: IAskPollisSearchRequest): Promise<IAskPollisSearchResult> {
		const { proxy } = await this.get();
		const passages = request.passages ?? (this.configurationService.getValue<number>('pollis.ask.passages') || ASK_PASSAGES);
		const status = await proxy.status(request.index?.file);
		if (!status) {
			return { passages: [], searched: [], collections: [], wordsOnly: 'notIndexed' };
		}
		// A collection's index has its own embedding model, PollisDocuments that of the setting
		const model = request.index?.embeddingModel ?? (this.configurationService.getValue<string>('pollis.ask.embeddingModel')?.trim() || ASK_EMBEDDING_MODEL);
		if (!status.embedded) {
			return proxy.search({ ...request, passages, wordsOnly: 'notEmbedded' });
		}
		if (status.embedder !== model) {
			return proxy.search({ ...request, passages, wordsOnly: 'otherModel' });
		}
		let server: ILlamaServerAnswer | undefined;
		try {
			server = await this.commandService.executeCommand<ILlamaServerAnswer>('language-julia.pollisLlamaServer', { model, embeddings: true, context: ASK_EMBEDDING_CONTEXT });
		} catch (err) {
			server = { error: err instanceof Error ? err.message : String(err) };
		}
		if (!server?.url) {
			return proxy.search({ ...request, passages, wordsOnly: 'modelNotStarted', error: server?.error });
		}
		const prefix = request.index?.queryPrefix ?? (this.configurationService.getValue<string>('pollis.ask.queryPrefix')?.trim() || ASK_QUERY_PREFIX);
		return proxy.search({ ...request, passages, embedding: { url: server.url, input: prefix.replace('{text}', request.question) } });
	}

	async collectionStatus(file: string): Promise<IAskPollisIndexStatus | undefined> {
		const { proxy } = await this.get();
		return proxy.status(file);
	}

	async indexedDocuments(file: string): Promise<readonly IAskPollisIndexedDocument[] | undefined> {
		const { proxy } = await this.get();
		return proxy.indexedDocuments(file);
	}

	async documentPassages(file: string, document: string, count: number): Promise<readonly IAskPollisPassage[]> {
		const { proxy } = await this.get();
		return proxy.documentPassages(file, document, count);
	}

	async rerank(model: string, question: string, passages: readonly IAskPollisPassage[]): Promise<IAskPollisReranked> {
		let server: ILlamaServerAnswer | undefined;
		try {
			server = await this.commandService.executeCommand<ILlamaServerAnswer>('language-julia.pollisLlamaServer', { model, reranking: true, context: ASK_RERANK_CONTEXT });
		} catch (err) {
			server = { error: err instanceof Error ? err.message : String(err) };
		}
		if (!server?.url) {
			return { error: server?.error ?? '' };
		}
		const { proxy } = await this.get();
		return proxy.rerank(server.url, question, passages.map(passage => passage.text));
	}

	async searchStamp(): Promise<IAskPollisSearchStamp | undefined> {
		const { proxy } = await this.get();
		const status = await proxy.status();
		const embedder = this.configurationService.getValue<string>('pollis.ask.embeddingModel')?.trim() || ASK_EMBEDDING_MODEL;
		// Searched by its words only, or by an index whose build time is not known
		if (!status?.embedded || status.embedder !== embedder || !status.builtAt) {
			return undefined;
		}
		const passages = this.configurationService.getValue<number>('pollis.ask.passages') || ASK_PASSAGES;
		const prefix = this.configurationService.getValue<string>('pollis.ask.queryPrefix')?.trim() || ASK_QUERY_PREFIX;
		const pollis = `${this.productService.pollisVersion ?? this.productService.version} ${this.productService.commit ?? ''}`;
		return { key: JSON.stringify([status.builtAt, status.passages, status.embedded, embedder, prefix, passages, pollis]), embedder };
	}

	async foundBefore(key: string, questions: readonly string[]): Promise<readonly (readonly IAskPollisPassage[] | undefined)[]> {
		const { proxy } = await this.get();
		return proxy.foundBefore(key, questions);
	}

	async keepFound(key: string, found: readonly IAskPollisFound[]): Promise<void> {
		const { proxy } = await this.get();
		await proxy.keepFound(key, found);
	}

	async stopSearchModel(): Promise<void> {
		const model = this.configurationService.getValue<string>('pollis.ask.embeddingModel')?.trim() || ASK_EMBEDDING_MODEL;
		// The request that started it, by which the Julia extension knows its server
		await this.commandService.executeCommand('language-julia.pollisStopLlamaServer', { model, embeddings: true, context: ASK_EMBEDDING_CONTEXT }).catch(() => undefined);
	}

	async similarities(pairs: readonly (readonly [string, string])[]): Promise<readonly number[] | undefined> {
		const { proxy } = await this.get();
		const status = await proxy.status();
		const model = this.configurationService.getValue<string>('pollis.ask.embeddingModel')?.trim() || ASK_EMBEDDING_MODEL;
		// Only the model the index was embedded with, which is then on this computer, so that nothing is downloaded for it
		if (!status?.embedded || status.embedder !== model) {
			return undefined;
		}
		let server: ILlamaServerAnswer | undefined;
		try {
			server = await this.commandService.executeCommand<ILlamaServerAnswer>('language-julia.pollisLlamaServer', { model, embeddings: true, context: ASK_EMBEDDING_CONTEXT });
		} catch {
			return undefined;
		}
		if (!server?.url) {
			return undefined;
		}
		const prefix = this.configurationService.getValue<string>('pollis.ask.queryPrefix')?.trim() || ASK_SIMILARITY_PREFIX;
		try {
			return await proxy.similarities(server.url, pairs.map(([a, b]) => [prefix.replace('{text}', a), prefix.replace('{text}', b)] as const));
		} catch {
			return undefined;
		}
	}

	async answer(turns: readonly IAskPollisTurn[], question: string, passages: readonly IAskPollisPassage[], onText: (text: string) => void, token: CancellationToken, answerWith?: string, attachments?: readonly IAskPollisAttachment[], collection?: string): Promise<IAskPollisAnswer> {
		const cloud = askCloudModel(answerWith ?? this.configurationService.getValue<string>('pollis.ask.answerWith'));
		let chat: Omit<IAskPollisChatRequest, 'id' | 'messages'>;
		if (cloud) {
			// The key only from Secret Storage, and only to its provider's API
			const provider = ASK_CLOUD_PROVIDERS[cloud.provider];
			const key = await this.secretStorageService.get(provider.secretKey);
			if (!key) {
				return { model: cloud.label, noKey: provider };
			}
			chat = { provider: cloud.provider, url: provider.url, model: cloud.id, key };
		} else {
			const model = answerWith?.startsWith(ASK_LOCAL_PREFIX) ? answerWith.slice(ASK_LOCAL_PREFIX.length) : this.configurationService.getValue<string>('pollis.ask.chatModel')?.trim() || ASK_CHAT_MODEL;
			let server: ILlamaServerAnswer | undefined;
			try {
				server = await this.commandService.executeCommand<ILlamaServerAnswer>('language-julia.pollisLlamaServer', { model });
			} catch (err) {
				server = { error: err instanceof Error ? err.message : String(err) };
			}
			if (!server?.url) {
				return { model: server?.model ?? model, error: server?.error };
			}
			chat = { provider: 'local', url: server.url, model: server.model ?? model };
		}
		const name = cloud?.label ?? chat.model;
		if (token.isCancellationRequested) {
			return { model: name };
		}
		const { proxy } = await this.get();
		const id = generateUuid();
		const store = new DisposableStore();
		store.add(proxy.onDidChat(e => {
			if (e.id === id) {
				onText(e.text);
			}
		}));
		store.add(token.onCancellationRequested(() => proxy.stop(id)));
		try {
			// A model of this computer does not see images yet
			const seen = (attached: readonly IAskPollisAttachment[] | undefined) => cloud ? attached : attached?.filter(attachment => attachment.kind !== 'image');
			const end = await proxy.chat({ ...chat, id, messages: askPollisMessages(turns.map(turn => ({ ...turn, attachments: seen(turn.attachments) })), question, passages, seen(attachments), collection) });
			return { model: name, ...end };
		} finally {
			store.dispose();
		}
	}

	async describeDatabase(path: string): Promise<string> {
		const { proxy } = await this.get();
		return proxy.describeDatabase(path);
	}

	async duckdbFunction(name: string): Promise<readonly IDuckDBFunctionKind[]> {
		const { proxy } = await this.get();
		return proxy.duckdbFunction(name);
	}

	async spread(counts: IAskTopicCounts): Promise<readonly IAskPollisPassage[]> {
		const { proxy } = await this.get();
		return proxy.spread(counts);
	}

	async matches(texts: readonly string[]): Promise<readonly (IAskPassageMatch | undefined)[] | undefined> {
		const { proxy } = await this.get();
		return proxy.matches(texts);
	}

	async wikiPassages(wikiFile: string): Promise<readonly IAskPollisPassage[]> {
		const { proxy } = await this.get();
		return proxy.wikiPassages(wikiFile);
	}

	async saveRun(run: ICompareRun): Promise<void> {
		const { proxy } = await this.get();
		return proxy.saveRun(run);
	}

	async runs(): Promise<readonly ICompareRunSummary[]> {
		const { proxy } = await this.get();
		return proxy.runs();
	}

	async loadRun(id: string): Promise<ICompareRun | undefined> {
		const { proxy } = await this.get();
		return proxy.loadRun(id);
	}

	async deleteRun(id: string): Promise<void> {
		const { proxy } = await this.get();
		return proxy.deleteRun(id);
	}

	async embedPassages(request: IEmbeddingRequest): Promise<IEmbeddingDone> {
		const { proxy } = await this.get();
		return proxy.embedPassages(request);
	}

	async evaluateEmbedding(request: IEmbeddingEvaluation): Promise<IEmbeddingEvaluated> {
		const { proxy } = await this.get();
		return proxy.evaluateEmbedding(request);
	}

	async retrievalQueries(benchmark: string): Promise<readonly IRetrievalQuery[] | undefined> {
		const { proxy } = await this.get();
		return proxy.retrievalQueries(benchmark);
	}

	async embedRetrieval(request: IRetrievalEmbeddingRequest): Promise<IEmbeddingDone> {
		const { proxy } = await this.get();
		return proxy.embedRetrieval(request);
	}

	async evaluateRetrieval(request: IRetrievalEvaluation): Promise<IEmbeddingEvaluated> {
		const { proxy } = await this.get();
		return proxy.evaluateRetrieval(request);
	}

	async rerankRetrieval(request: IRetrievalRerankRequest): Promise<IRetrievalRerankDone> {
		const { proxy } = await this.get();
		return proxy.rerankRetrieval(request);
	}

	async stopEmbedding(): Promise<void> {
		const { proxy } = await this.get();
		return proxy.stopEmbedding();
	}

	async saveEmbeddingRun(run: IEmbeddingRun): Promise<void> {
		const { proxy } = await this.get();
		return proxy.saveEmbeddingRun(run);
	}

	async embeddingRuns(): Promise<readonly IEmbeddingRunSummary[]> {
		const { proxy } = await this.get();
		return proxy.embeddingRuns();
	}

	async loadEmbeddingRun(id: string): Promise<IEmbeddingRun | undefined> {
		const { proxy } = await this.get();
		return proxy.loadEmbeddingRun(id);
	}

	async deleteEmbeddingRun(id: string): Promise<void> {
		const { proxy } = await this.get();
		return proxy.deleteEmbeddingRun(id);
	}

	async saveRerankRun(run: IRerankRun): Promise<void> {
		const { proxy } = await this.get();
		return proxy.saveRerankRun(run);
	}

	async rerankRuns(): Promise<readonly IRerankRunSummary[]> {
		const { proxy } = await this.get();
		return proxy.rerankRuns();
	}

	async loadRerankRun(id: string): Promise<IRerankRun | undefined> {
		const { proxy } = await this.get();
		return proxy.loadRerankRun(id);
	}

	async deleteRerankRun(id: string): Promise<void> {
		const { proxy } = await this.get();
		return proxy.deleteRerankRun(id);
	}

	async importBenchmarkRuns(ids?: readonly string[]): Promise<void> {
		const { proxy } = await this.get();
		return proxy.importBenchmarkRuns(ids);
	}

	async benchmarkRuns(): Promise<readonly IBenchmarkRun[]> {
		const { proxy } = await this.get();
		return proxy.benchmarkRuns();
	}

	async loadBenchmarkRun(id: string): Promise<IBenchmarkRun | undefined> {
		const { proxy } = await this.get();
		return proxy.loadBenchmarkRun(id);
	}

	async loadBenchmarkAnswers(id: string): Promise<readonly IBenchmarkAnswer[]> {
		const { proxy } = await this.get();
		return proxy.loadBenchmarkAnswers(id);
	}

	async deleteBenchmarkRun(id: string): Promise<void> {
		const { proxy } = await this.get();
		return proxy.deleteBenchmarkRun(id);
	}
}

registerSingleton(IAskPollisService, AskPollisService, InstantiationType.Delayed);
