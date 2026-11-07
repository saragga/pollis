/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter, Event } from '../../../../base/common/event.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { ASK_CHAT_MODEL, ASK_EMBEDDING_MODEL, ASK_PASSAGES, ASK_RERANK_CONTEXT, ASK_RERANK_WIDER, IAskPollisEvalItem, IAskPollisFound, IAskPollisPassage, IAskPollisSearchRequest, IAskPollisService, IRerankRun, IRerankRunFound, IRerankRunModel, RETRIEVAL_CANDIDATES, RETRIEVAL_CUT, retrievalBenchmarkName } from '../common/askPollis.js';
import { askPollisStrategy, askStrategySearchKey } from '../common/askPollisStrategies.js';
import { ICompareProgress } from './compareModelsRun.js';
import { CompareSampler, CompareTestSets, ICompareSample, ICompareSamples } from './compareShared.js';

// What Evaluate Reranking Models runs (compareRerankersPage.ts): the passages of each question of the test set are found
// once, as Ask Pollis finds them when a reranker is set, ASK_RERANK_WIDER times those it gives (those found before with
// the same search stamp taken again, as Evaluate Answering Models does); then each local reranker, one after the other
// and alone in memory (the embedding model of the search and the chat model stopped before), puts the same passages in
// its order. Where the passage a question was made from is then shows each reranker; the order of the search, with no
// reranker, is measured too. The memory a reranker's server takes is the memory free before it started less the memory
// free when it was done. The run is kept in Comparisons.duckdb.
// A retrieval benchmark of PollisBenchmarks.duckdb is run on its own documents, as BEIR reranks them: the
// RETRIEVAL_CANDIDATES documents BM25 finds for each query, which each reranker puts in its order; each query is scored
// by the first RETRIEVAL_CUT documents (IAskPollisService.rerankRetrieval), and the order of BM25 is scored too.

/** What a run ends with, or why it could not be done. */
export interface IRerankEnd {
	readonly run?: IRerankRun;
	readonly error?: string;
	readonly stopped?: boolean;
}

interface ILlamaServerAnswer {
	readonly url?: string;
	readonly error?: string;
}

/** The value of no reranker in a run: the passages in the order of the search. */
export const NO_RERANKER = '';

/**
 * The position, from 0, of the passage a question was made from among `passages`: that of its wiki for a question of the
 * Panel FAQ, that of its text as the documents have it now (`text`) for the others; -1 when it is not among them, and
 * undefined when the question's passage is not known.
 */
function ownPosition(item: IAskPollisEvalItem, text: string | undefined, passages: readonly IAskPollisPassage[]): number | undefined {
	if (item.wikiFile) {
		return passages.findIndex(passage => passage.kind === 'wiki' && passage.file.replace(/\\/g, '/').endsWith(`/${item.wikiFile}`));
	}
	return text === undefined ? undefined : passages.findIndex(passage => passage.text === text);
}

export class CompareRerankersRunner {

	private readonly _onDidProgress = new Emitter<ICompareProgress | undefined>();
	/** How far the run has come, and nothing once it has ended. */
	readonly onDidProgress = this._onDidProgress.event;

	private readonly _onDidEnd = new Emitter<IRerankEnd>();
	readonly onDidEnd = this._onDidEnd.event;

	private _running = false;
	private stopped = false;
	private _progress: ICompareProgress | undefined;
	private readonly sampler: CompareSampler;
	/** A new sample of the run; the first of a run starts its charts again. */
	readonly onDidSample: Event<ICompareSample>;
	readonly sets: CompareTestSets;

	constructor(
		@IAskPollisService private readonly askPollisService: IAskPollisService,
		@ICommandService private readonly commandService: ICommandService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IFileService fileService: IFileService,
		@IPathService pathService: IPathService,
		@IProductService private readonly productService: IProductService,
	) {
		this.sampler = new CompareSampler(commandService);
		this.onDidSample = this.sampler.onDidSample;
		this.sets = new CompareTestSets(fileService, pathService);
	}

	/** How far the run has come, or nothing when none runs. */
	get progress(): ICompareProgress | undefined {
		return this._progress;
	}

	get running(): boolean {
		return this._running;
	}

	/** The samples of the run running, or of the last one. */
	get samples(): ICompareSamples {
		return this.sampler.samples;
	}

	private report(text: string, done = 0, total = 0): void {
		this._progress = { text, done, total };
		this._onDidProgress.fire(this._progress);
	}

	private end(end: IRerankEnd): IRerankEnd {
		this.sampler.stop();
		this._running = false;
		this._progress = undefined;
		this._onDidProgress.fire(undefined);
		this._onDidEnd.fire(end);
		return end;
	}

	stop(): void {
		this.stopped = true;
		this.askPollisService.stopEmbedding().catch(() => undefined);
	}

	private availableMemory(): Promise<number | undefined> {
		return Promise.resolve(this.commandService.executeCommand<number>('language-julia.pollisAvailableMemory')).catch(() => undefined);
	}

	/** Runs `items`, the questions of a test set, or the queries of the retrieval benchmark `benchmark` among its documents. */
	async run(models: readonly IRerankRunModel[], items: readonly IAskPollisEvalItem[], benchmark?: string): Promise<IRerankEnd> {
		if (this._running) {
			return { error: localize('compareRerankers.busy', "Wait for the run to end, or stop it.") };
		}
		if (!models.length) {
			return { error: localize('compareRerankers.noModels', "Choose the reranking models to evaluate, above.") };
		}
		if (!items.length) {
			return { error: localize('compareRerankers.noItems', "No questions in this test set.") };
		}
		this._running = true;
		this.stopped = false;
		const started = Date.now();
		await this.sampler.start();
		this.sampler.mark('search');
		if (benchmark) {
			return this.runBenchmark(models, items, benchmark, started);
		}

		// The passages of each question, found once for every reranker, as Ask Pollis finds them with a reranker set;
		// those found before with the same search stamp are taken again, as Evaluate Answering Models takes them
		const kept = this.configurationService.getValue<number>('pollis.ask.passages') || ASK_PASSAGES;
		const strategy = askPollisStrategy(undefined);
		const requests: IAskPollisSearchRequest[] = items.map(item => ({ question: item.question, passages: kept * ASK_RERANK_WIDER }));
		const keys = requests.map(request => askStrategySearchKey(strategy, request));
		const stamp = await this.askPollisService.searchStamp();
		const before = stamp ? await this.askPollisService.foundBefore(stamp.key, keys).catch(() => []) : [];
		const passages: (readonly IAskPollisPassage[])[] = [];
		const toKeep: IAskPollisFound[] = [];
		for (let index = 0; index < items.length; index++) {
			if (this.stopped) {
				break;
			}
			const known = before[index];
			if (known) {
				passages.push(known);
				continue;
			}
			this.report(localize('compareRerankers.finding', "Finding the passages of question {0} of {1}...", index + 1, items.length), index, items.length);
			const result = await this.askPollisService.search(requests[index]);
			passages.push(result.passages);
			// Only a search by meaning and words is kept: one by words only, when the embedding model did not start, is not the same
			if (stamp && !result.wordsOnly) {
				toKeep.push({ question: keys[index], passages: result.passages });
			}
		}
		if (stamp && toKeep.length) {
			await this.askPollisService.keepFound(stamp.key, toKeep).catch(() => undefined);
		}
		if (passages.length && !passages.some(found => found.length)) {
			return this.end({ error: localize('compareRerankers.nothingFound', "No passages were found: Pollis may not have indexed its documents yet.") });
		}
		// The rerankers alone in memory: the embedding model of the search and the chat model of Ask Pollis are stopped
		await this.askPollisService.stopSearchModel();
		await this.commandService.executeCommand('language-julia.pollisStopLlamaServer', { model: this.configurationService.getValue<string>('pollis.ask.chatModel')?.trim() || ASK_CHAT_MODEL }).catch(() => undefined);

		// The passage each question was made from, by its text as the documents have it now
		const asked = items.slice(0, passages.length);
		const matches = await this.askPollisService.matches(asked.map(item => item.context || '')).catch(() => undefined);
		const texts = asked.map((item, index) => item.context ? matches?.[index]?.text : undefined);

		const found: IRerankRunFound[] = [];
		// The order of the search, with no reranker
		for (const [index, item] of asked.entries()) {
			const position = ownPosition(item, texts[index], passages[index]);
			if (position !== undefined) {
				found.push({ question: index, model: NO_RERANKER, place: position + 1 });
			}
		}
		const measured: IRerankRunModel[] = [{ value: NO_RERANKER, label: localize('compareRerankers.noReranker', "No Reranker") }];

		this.sampler.mark('rerank');
		for (const [i, model] of models.entries()) {
			if (this.stopped) {
				break;
			}
			this.report(localize('compareRerankers.starting', "Starting {0} ({1} of {2})...", model.label, i + 1, models.length));
			const memoryBefore = await this.availableMemory();
			const server = await Promise.resolve(this.commandService.executeCommand<ILlamaServerAnswer>('language-julia.pollisLlamaServer', { model: model.value, reranking: true, context: ASK_RERANK_CONTEXT })).catch((err): ILlamaServerAnswer => ({ error: String(err) }));
			if (!server?.url) {
				measured.push({ ...model, error: server?.error ?? localize('compareRerankers.notStarted', "The model could not be started.") });
				continue;
			}
			let error: string | undefined;
			try {
				for (const [index, item] of asked.entries()) {
					if (this.stopped) {
						break;
					}
					this.report(localize('compareRerankers.reranking', "Reranking with {0} ({1} of {2}): question {3} of {4}...", model.label, i + 1, models.length, index + 1, asked.length), index, asked.length);
					const position = ownPosition(item, texts[index], passages[index]);
					if (position === undefined || !passages[index].length) {
						continue;
					}
					const start = Date.now();
					const reranked = await this.askPollisService.rerank(model.value, item.question, passages[index]);
					const ms = Date.now() - start;
					const scores = reranked.scores;
					if (!scores) {
						error ??= reranked.error || localize('compareRerankers.noScores', "The reranker gave no scores.");
						continue;
					}
					// Its place in the reranker's order: one more than the passages scored higher, the earlier first on a tie
					const place = position < 0 ? 0 : 1 + scores.filter((score, other) => score > scores[position] || (score === scores[position] && other < position)).length;
					found.push({ question: index, model: model.value, place, ms });
				}
				const memoryAfter = await this.availableMemory();
				measured.push({ ...model, memory: memoryBefore !== undefined && memoryAfter !== undefined ? Math.max(0, memoryBefore - memoryAfter) : undefined, error });
			} finally {
				await this.commandService.executeCommand('language-julia.pollisStopLlamaServer', { model: model.value, reranking: true, context: ASK_RERANK_CONTEXT }).catch(() => undefined);
			}
		}

		const run: IRerankRun = {
			summary: {
				id: generateUuid(),
				started,
				pollis: this.productService.pollisVersion ?? this.productService.version,
				models: measured,
				questions: asked.length,
				found: kept * ASK_RERANK_WIDER,
				kept,
				embedder: this.configurationService.getValue<string>('pollis.ask.embeddingModel')?.trim() || ASK_EMBEDDING_MODEL,
			},
			questions: asked,
			found,
		};
		if (found.some(result => result.model !== NO_RERANKER)) {
			await this.askPollisService.saveRerankRun(run);
		}
		return this.end({ run, stopped: this.stopped });
	}

	/**
	 * The queries of a retrieval benchmark: the RETRIEVAL_CANDIDATES documents BM25 finds for each, in its order, then each
	 * reranker, one after the other and alone in memory, putting them in its own; each query scored by the first documents.
	 */
	private async runBenchmark(models: readonly IRerankRunModel[], items: readonly IAskPollisEvalItem[], benchmark: string, started: number): Promise<IRerankEnd> {
		const name = retrievalBenchmarkName(benchmark);
		const queries = items.map(item => ({ id: item.source, text: item.question, relevant: item.relevant ?? [] }));
		let current: IRerankRunModel | undefined;
		const finding = localize('compareRerankers.findingDocuments', "Finding the documents of the queries of {0} with BM25...", name);
		const listener = this.askPollisService.onDidEmbed(e => {
			if (e.phase === 'rerank') {
				this.report(current
					? localize('compareRerankers.rerankingQueries', "Reranking the queries of {0} with {1} ({2} of {3})...", name, current.label, models.indexOf(current) + 1, models.length)
					: finding, e.done, e.total);
			}
		});
		try {
			// The rerankers alone in memory: the embedding model of the search and the chat model of Ask Pollis are stopped
			await this.askPollisService.stopSearchModel();
			await this.commandService.executeCommand('language-julia.pollisStopLlamaServer', { model: this.configurationService.getValue<string>('pollis.ask.chatModel')?.trim() || ASK_CHAT_MODEL }).catch(() => undefined);

			// The order of BM25, with no reranker
			this.report(finding);
			const searched = await this.askPollisService.rerankRetrieval({ benchmark, queries });
			if (!searched.found.length) {
				return this.end(this.stopped ? { stopped: true } : { error: searched.error === 'notBenchmarks' || !searched.error ? localize('compareRerankers.notBenchmarks', "~/.pollis/databases/PollisBenchmarks.duckdb could not be read: PollisBenchmarks.jl makes it when the Julia REPL starts.") : searched.error });
			}
			const found: IRerankRunFound[] = searched.found.map(result => ({ question: result.query, model: NO_RERANKER, ndcg: result.ndcg, recall: result.recall, among: result.among }));
			const measured: IRerankRunModel[] = [{ value: NO_RERANKER, label: localize('compareRerankers.noReranker', "No Reranker") }];

			this.sampler.mark('rerank');
			for (const [i, model] of models.entries()) {
				if (this.stopped) {
					break;
				}
				current = model;
				this.report(localize('compareRerankers.starting', "Starting {0} ({1} of {2})...", model.label, i + 1, models.length));
				const memoryBefore = await this.availableMemory();
				const server = await Promise.resolve(this.commandService.executeCommand<ILlamaServerAnswer>('language-julia.pollisLlamaServer', { model: model.value, reranking: true, context: ASK_RERANK_CONTEXT })).catch((err): ILlamaServerAnswer => ({ error: String(err) }));
				if (!server?.url) {
					measured.push({ ...model, error: server?.error ?? localize('compareRerankers.notStarted', "The model could not be started.") });
					continue;
				}
				try {
					const reranked = await this.askPollisService.rerankRetrieval({ benchmark, queries, model: model.value, url: server.url });
					found.push(...reranked.found.map(result => ({ question: result.query, model: model.value, ndcg: result.ndcg, recall: result.recall, ms: result.ms })));
					const memoryAfter = await this.availableMemory();
					const error = reranked.error === 'noScores' ? localize('compareRerankers.noScores', "The reranker gave no scores.") : reranked.error;
					measured.push({ ...model, memory: memoryBefore !== undefined && memoryAfter !== undefined ? Math.max(0, memoryBefore - memoryAfter) : undefined, error });
				} finally {
					await this.commandService.executeCommand('language-julia.pollisStopLlamaServer', { model: model.value, reranking: true, context: ASK_RERANK_CONTEXT }).catch(() => undefined);
				}
			}

			const run: IRerankRun = {
				summary: {
					id: generateUuid(),
					started,
					pollis: this.productService.pollisVersion ?? this.productService.version,
					models: measured,
					questions: items.length,
					found: RETRIEVAL_CANDIDATES,
					kept: RETRIEVAL_CUT,
					embedder: '',
					benchmark,
				},
				questions: items,
				found,
			};
			if (found.some(result => result.model !== NO_RERANKER)) {
				await this.askPollisService.saveRerankRun(run);
			}
			return this.end({ run, stopped: this.stopped });
		} catch (err) {
			return this.end({ error: err instanceof Error ? err.message : String(err) });
		} finally {
			listener.dispose();
		}
	}
}
