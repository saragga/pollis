/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { IUtilityProcessWorkerWorkbenchService } from '../../../services/utilityProcess/electron-browser/utilityProcessWorkerWorkbenchService.js';
import { ASK_CHAT_MODEL, ASK_CLOUD_PROVIDERS, ASK_EMBEDDING_MODEL, ASK_LOCAL_PREFIX, ASK_PASSAGES, ASK_QUERY_PREFIX, askCloudModel, askPollisMessages, IAskPollisAnswer, IAskPollisChatRequest, IAskPollisIndex, IAskPollisPassage, IAskPollisSearchRequest, IAskPollisSearchResult, IAskPollisService, IAskPollisTurn, ICompareRun, ICompareRunSummary } from '../common/askPollis.js';

/**
 * The context of the embedding server, in tokens: the same as the Julia extension's when it indexes
 * (pollisDocuments.ts), so that both use the one server.
 */
const EMBEDDING_CONTEXT = 2048;

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

	constructor(
		@IUtilityProcessWorkerWorkbenchService private readonly utilityProcessWorkerWorkbenchService: IUtilityProcessWorkerWorkbenchService,
		@ICommandService private readonly commandService: ICommandService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@ISecretStorageService private readonly secretStorageService: ISecretStorageService,
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
			return { proxy: ProxyChannel.toService<IAskPollisIndex>(worker.client.getChannel('askPollis')) };
		})();
		return this.index;
	}

	async collections(): Promise<readonly string[]> {
		const { proxy } = await this.get();
		return (await proxy.status())?.collections ?? [];
	}

	async search(request: IAskPollisSearchRequest): Promise<IAskPollisSearchResult> {
		const { proxy } = await this.get();
		const passages = request.passages ?? (this.configurationService.getValue<number>('pollis.ask.passages') || ASK_PASSAGES);
		const status = await proxy.status();
		if (!status) {
			return { passages: [], searched: [], collections: [], wordsOnly: 'notIndexed' };
		}
		const model = this.configurationService.getValue<string>('pollis.ask.embeddingModel')?.trim() || ASK_EMBEDDING_MODEL;
		if (!status.embedded) {
			return proxy.search({ ...request, passages, wordsOnly: 'notEmbedded' });
		}
		if (status.embedder !== model) {
			return proxy.search({ ...request, passages, wordsOnly: 'otherModel' });
		}
		let server: ILlamaServerAnswer | undefined;
		try {
			server = await this.commandService.executeCommand<ILlamaServerAnswer>('language-julia.pollisLlamaServer', { model, embeddings: true, context: EMBEDDING_CONTEXT });
		} catch (err) {
			server = { error: err instanceof Error ? err.message : String(err) };
		}
		if (!server?.url) {
			return proxy.search({ ...request, passages, wordsOnly: 'modelNotStarted', error: server?.error });
		}
		const prefix = this.configurationService.getValue<string>('pollis.ask.queryPrefix')?.trim() || ASK_QUERY_PREFIX;
		return proxy.search({ ...request, passages, embedding: { url: server.url, input: prefix.replace('{text}', request.question) } });
	}

	async answer(turns: readonly IAskPollisTurn[], question: string, passages: readonly IAskPollisPassage[], onText: (text: string) => void, token: CancellationToken, answerWith?: string): Promise<IAskPollisAnswer> {
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
			const end = await proxy.chat({ ...chat, id, messages: askPollisMessages(turns, question, passages) });
			return { model: name, ...end };
		} finally {
			store.dispose();
		}
	}

	async spread(count: number): Promise<readonly IAskPollisPassage[]> {
		const { proxy } = await this.get();
		return proxy.spread(count);
	}

	async present(texts: readonly string[]): Promise<readonly boolean[]> {
		const { proxy } = await this.get();
		return proxy.present(texts);
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
}

registerSingleton(IAskPollisService, AskPollisService, InstantiationType.Delayed);
