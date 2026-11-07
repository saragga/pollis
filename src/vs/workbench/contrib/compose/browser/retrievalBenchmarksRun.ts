/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter, Event } from '../../../../base/common/event.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ASK_CHAT_MODEL, ASK_EMBEDDING_CONTEXT, ASK_RERANK_CONTEXT, IAskPollisEvalItem, IAskPollisService, IEmbeddingRun, IEmbeddingRunFound, IEmbeddingRunModel, IRerankRun, IRerankRunFound, IRerankRunModel, IRetrievalQuery, RETRIEVAL_CANDIDATES, RETRIEVAL_CUT, retrievalBenchmarkName } from '../common/askPollis.js';
import { ICompareProgress } from './compareModelsRun.js';
import { NO_RERANKER } from './compareRerankersRun.js';
import { CompareSampler, ICompareSample, ICompareSamples } from './compareShared.js';

// What Benchmark Embedding and Reranking Models runs (retrievalBenchmarksPage.ts): the queries of a retrieval benchmark
// of PollisBenchmarks.duckdb among its own documents, as BEIR runs them. Each model, one after the other and alone in
// memory (the embedding model of Ask Pollis and its chat model stopped before): an embedding model embeds the documents
// it has not embedded yet, into the cache of embeddings that Ask Pollis takes its passages from, then searches each
// query among them by meaning alone (IAskPollisService.evaluateRetrieval); a reranker puts in its order the
// RETRIEVAL_CANDIDATES documents BM25 finds for each query (IAskPollisService.rerankRetrieval), and the order of BM25 is
// scored too. Each query is scored by the first RETRIEVAL_CUT documents, nDCG@10 and Recall@10. The memory a model's
// server takes is the memory free before it started less the memory free when it was done. The runs are kept in
// Comparisons.duckdb, with those of Evaluate Embedding Models and Evaluate Reranking Models, marked with their benchmark.

/** What a run ends with: the run of the embedding models or of the rerankers, or why it could not be done. */
export interface IRetrievalEnd {
	readonly embedding?: IEmbeddingRun;
	readonly reranking?: IRerankRun;
	readonly error?: string;
	readonly stopped?: boolean;
}

interface ILlamaServerAnswer {
	readonly url?: string;
	readonly error?: string;
}

/** Why a run gave nothing, from the search process. */
function retrievalError(error: string | undefined): string | undefined {
	switch (error) {
		case undefined:
			return undefined;
		case 'notBenchmarks':
			return localize('retrievalBenchmarks.notBenchmarks', "~/.pollis/databases/PollisBenchmarks.duckdb could not be read: PollisBenchmarks.jl makes it when the Julia REPL starts.");
		case 'notEmbedded':
			return localize('retrievalBenchmarks.notEmbedded', "No document could be embedded with this model.");
		case 'noScores':
			return localize('retrievalBenchmarks.noScores', "The reranker gave no scores.");
		default:
			return error;
	}
}

/** What the progress says while the server of a model starts, the `place`th of `count`. */
function startingText(label: string, place: number, count: number): string {
	return localize('retrievalBenchmarks.starting', "Starting {0} ({1} of {2})...", label, place, count);
}

/** Why a model gave nothing when its server did not say. */
function notStartedText(): string {
	return localize('retrievalBenchmarks.notStarted', "The model could not be started.");
}

/** The queries of `items`, the queries of a benchmark as its test set holds them: the id, the text and the relevant documents. */
function queriesOf(items: readonly IAskPollisEvalItem[]): IRetrievalQuery[] {
	return items.map(item => ({ id: item.source, text: item.question, relevant: item.relevant ?? [] }));
}

export class RetrievalBenchmarksRunner {

	private readonly _onDidProgress = new Emitter<ICompareProgress | undefined>();
	/** How far the run has come, and nothing once it has ended. */
	readonly onDidProgress = this._onDidProgress.event;

	private readonly _onDidEnd = new Emitter<IRetrievalEnd>();
	readonly onDidEnd = this._onDidEnd.event;

	private _running = false;
	private stopped = false;
	private _progress: ICompareProgress | undefined;
	private readonly sampler: CompareSampler;
	/** A new sample of the run; the first of a run starts its charts again. */
	readonly onDidSample: Event<ICompareSample>;

	constructor(
		@IAskPollisService private readonly askPollisService: IAskPollisService,
		@ICommandService private readonly commandService: ICommandService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IProductService private readonly productService: IProductService,
	) {
		this.sampler = new CompareSampler(commandService);
		this.onDidSample = this.sampler.onDidSample;
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

	private end(end: IRetrievalEnd): IRetrievalEnd {
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

	/** Why a run cannot start, before any work: another running, no model or no query. */
	private refused(models: number, items: number): string | undefined {
		if (this._running) {
			return localize('retrievalBenchmarks.busy', "Wait for the run to end, or stop it.");
		}
		if (!models) {
			return localize('retrievalBenchmarks.noModels', "Choose the models to run, above.");
		}
		if (!items) {
			return localize('retrievalBenchmarks.noItems', "No queries: ~/.pollis/databases/PollisBenchmarks.duckdb may not have this benchmark yet.");
		}
		return undefined;
	}

	/** Starts a run: the samples of the charts, and the embedding model of the search and the chat model of Ask Pollis stopped, so that each model runs alone in memory. */
	private async begin(): Promise<number> {
		this._running = true;
		this.stopped = false;
		const started = Date.now();
		await this.sampler.start();
		await this.askPollisService.stopSearchModel();
		await this.commandService.executeCommand('language-julia.pollisStopLlamaServer', { model: this.configurationService.getValue<string>('pollis.ask.chatModel')?.trim() || ASK_CHAT_MODEL }).catch(() => undefined);
		return started;
	}

	/** The embedding models `models` on the queries `items` of the benchmark `benchmark`. */
	async runEmbedding(models: readonly IEmbeddingRunModel[], items: readonly IAskPollisEvalItem[], benchmark: string): Promise<IRetrievalEnd> {
		const refused = this.refused(models.length, items.length);
		if (refused) {
			return { error: refused };
		}
		const started = await this.begin();
		const name = retrievalBenchmarkName(benchmark);
		const queries = queriesOf(items);
		const measured: IEmbeddingRunModel[] = [];
		const found: IEmbeddingRunFound[] = [];
		let documents = 0;
		let current = 0;
		const listener = this.askPollisService.onDidEmbed(e => this.report(e.phase === 'embed'
			? localize('retrievalBenchmarks.embedding', "Embedding the documents of {0} with {1} ({2} of {3})...", name, models[current].label, current + 1, models.length)
			: localize('retrievalBenchmarks.searching', "Searching the queries of {0} with {1} ({2} of {3})...", name, models[current].label, current + 1, models.length), e.done, e.total));
		try {
			for (const [i, model] of models.entries()) {
				if (this.stopped) {
					break;
				}
				current = i;
				this.report(startingText(model.label, i + 1, models.length));
				const before = await this.availableMemory();
				const server = await Promise.resolve(this.commandService.executeCommand<ILlamaServerAnswer>('language-julia.pollisLlamaServer', { model: model.value, embeddings: true, context: ASK_EMBEDDING_CONTEXT })).catch((err): ILlamaServerAnswer => ({ error: String(err) }));
				if (!server?.url) {
					measured.push({ ...model, error: server?.error ?? notStartedText() });
					continue;
				}
				try {
					const request = { benchmark, model: model.value, url: server.url, passagePrefix: model.passage };
					this.sampler.mark('embed');
					const done = await this.askPollisService.embedRetrieval(request);
					this.sampler.mark('search');
					const evaluated = this.stopped ? undefined : await this.askPollisService.evaluateRetrieval({ ...request, queryPrefix: model.query, queries });
					const after = await this.availableMemory();
					documents = evaluated?.passages || documents;
					evaluated?.found.forEach((result, question) => found.push({ ...result, question, model: model.value }));
					measured.push({
						...model,
						dimensions: evaluated?.dimensions || undefined,
						memory: before !== undefined && after !== undefined ? Math.max(0, before - after) : undefined,
						perSecond: done.embedded && done.seconds ? done.embedded / done.seconds : undefined,
						error: retrievalError(evaluated?.error ?? (done.embedded ? undefined : done.error)),
					});
				} finally {
					await this.commandService.executeCommand('language-julia.pollisStopLlamaServer', { model: model.value, embeddings: true, context: ASK_EMBEDDING_CONTEXT }).catch(() => undefined);
				}
			}
		} catch (err) {
			listener.dispose();
			return this.end({ error: err instanceof Error ? err.message : String(err) });
		}
		listener.dispose();
		const run: IEmbeddingRun = {
			summary: { id: generateUuid(), started, pollis: this.productService.pollisVersion ?? this.productService.version, models: measured, questions: items.length, passages: documents, benchmark },
			questions: items,
			found,
		};
		if (found.length) {
			await this.askPollisService.saveEmbeddingRun(run);
		}
		return this.end({ embedding: run, stopped: this.stopped });
	}

	/** The rerankers `models` on the queries `items` of the benchmark `benchmark`, with the order of BM25. */
	async runReranking(models: readonly IRerankRunModel[], items: readonly IAskPollisEvalItem[], benchmark: string): Promise<IRetrievalEnd> {
		const refused = this.refused(models.length, items.length);
		if (refused) {
			return { error: refused };
		}
		const started = await this.begin();
		const name = retrievalBenchmarkName(benchmark);
		const queries = queriesOf(items);
		let current: IRerankRunModel | undefined;
		const finding = localize('retrievalBenchmarks.finding', "Finding the documents of the queries of {0} with BM25...", name);
		const listener = this.askPollisService.onDidEmbed(e => {
			if (e.phase === 'rerank') {
				this.report(current
					? localize('retrievalBenchmarks.reranking', "Reranking the queries of {0} with {1} ({2} of {3})...", name, current.label, models.indexOf(current) + 1, models.length)
					: finding, e.done, e.total);
			}
		});
		try {
			// The order of BM25, with no reranker
			this.sampler.mark('search');
			this.report(finding);
			const searched = await this.askPollisService.rerankRetrieval({ benchmark, queries });
			if (!searched.found.length) {
				return this.end(this.stopped ? { stopped: true } : { error: retrievalError(searched.error ?? 'notBenchmarks') });
			}
			const found: IRerankRunFound[] = searched.found.map(result => ({ question: result.query, model: NO_RERANKER, ndcg: result.ndcg, recall: result.recall, among: result.among }));
			const measured: IRerankRunModel[] = [{ value: NO_RERANKER, label: localize('retrievalBenchmarks.noReranker', "No Reranker") }];

			this.sampler.mark('rerank');
			for (const [i, model] of models.entries()) {
				if (this.stopped) {
					break;
				}
				current = model;
				this.report(startingText(model.label, i + 1, models.length));
				const before = await this.availableMemory();
				const server = await Promise.resolve(this.commandService.executeCommand<ILlamaServerAnswer>('language-julia.pollisLlamaServer', { model: model.value, reranking: true, context: ASK_RERANK_CONTEXT })).catch((err): ILlamaServerAnswer => ({ error: String(err) }));
				if (!server?.url) {
					measured.push({ ...model, error: server?.error ?? notStartedText() });
					continue;
				}
				try {
					const reranked = await this.askPollisService.rerankRetrieval({ benchmark, queries, model: model.value, url: server.url });
					found.push(...reranked.found.map(result => ({ question: result.query, model: model.value, ndcg: result.ndcg, recall: result.recall, ms: result.ms })));
					const after = await this.availableMemory();
					measured.push({ ...model, memory: before !== undefined && after !== undefined ? Math.max(0, before - after) : undefined, error: retrievalError(reranked.error) });
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
			return this.end({ reranking: run, stopped: this.stopped });
		} catch (err) {
			return this.end({ error: err instanceof Error ? err.message : String(err) });
		} finally {
			listener.dispose();
		}
	}
}
