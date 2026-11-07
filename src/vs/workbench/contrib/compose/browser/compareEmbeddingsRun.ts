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
import { ASK_CHAT_MODEL, ASK_EMBEDDING_CONTEXT, IAskPollisEvalItem, IAskPollisService, IEmbeddingRun, IEmbeddingRunFound, IEmbeddingRunModel, retrievalBenchmarkName } from '../common/askPollis.js';
import { ICompareProgress } from './compareModelsRun.js';
import { CompareSampler, CompareTestSets, ICompareSample, ICompareSamples } from './compareShared.js';

// What Evaluate Embedding Models runs (compareEmbeddingsPage.ts): each local embedding model, one after the other and
// alone in memory (the embedding model of Ask Pollis and its chat model stopped before), embeds the passages of the
// index that embeddings.duckdb does not have yet with it, so that each passage is embedded once by each model, ever;
// then the questions of the test set are searched with its embeddings as Ask Pollis would (IAskPollisService.evaluateEmbedding):
// where each question's own passage is among those given, and among all passages by meaning only. The memory its
// server takes is the memory free before it started less the memory free when it was done. The run is kept in Comparisons.duckdb.
// A retrieval benchmark of PollisBenchmarks.duckdb is run the same way on its own documents, in place of the index: each
// model embeds those it has not embedded yet, into the same cache, then searches each query among them by meaning
// alone, and each query is scored by the documents found first (IAskPollisService.evaluateRetrieval), as BEIR scores them.

/** What a run ends with, or why it could not be done. */
export interface IEmbeddingEnd {
	readonly run?: IEmbeddingRun;
	readonly error?: string;
	readonly stopped?: boolean;
}

interface ILlamaServerAnswer {
	readonly url?: string;
	readonly error?: string;
}

/** Why the evaluation of a model gave nothing, from the search process. */
function evaluationError(error: string | undefined): string | undefined {
	switch (error) {
		case undefined:
			return undefined;
		case 'notIndexed':
			return localize('compareEmbeddings.notIndexed', "Ask Pollis has no index yet: it is built when the Julia REPL starts.");
		case 'notEmbedded':
			return localize('compareEmbeddings.notEmbedded', "No passage could be embedded with this model.");
		case 'notBenchmarks':
			return localize('compareEmbeddings.notBenchmarks', "~/.pollis/databases/PollisBenchmarks.duckdb could not be read: PollisBenchmarks.jl makes it when the Julia REPL starts.");
		default:
			return error;
	}
}

export class CompareEmbeddingsRunner {

	private readonly _onDidProgress = new Emitter<ICompareProgress | undefined>();
	/** How far the run has come, and nothing once it has ended. */
	readonly onDidProgress = this._onDidProgress.event;

	private readonly _onDidEnd = new Emitter<IEmbeddingEnd>();
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

	private end(end: IEmbeddingEnd): IEmbeddingEnd {
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
	async run(models: readonly IEmbeddingRunModel[], items: readonly IAskPollisEvalItem[], benchmark?: string): Promise<IEmbeddingEnd> {
		if (this._running) {
			return { error: localize('compareEmbeddings.busy', "Wait for the run to end, or stop it.") };
		}
		if (!models.length) {
			return { error: localize('compareEmbeddings.noModels', "Choose the embedding models to evaluate, above.") };
		}
		if (!items.length) {
			return { error: localize('compareEmbeddings.noItems', "No questions in this test set.") };
		}
		this._running = true;
		this.stopped = false;
		const started = Date.now();
		await this.sampler.start();
		await this.askPollisService.stopSearchModel();
		await this.commandService.executeCommand('language-julia.pollisStopLlamaServer', { model: this.configurationService.getValue<string>('pollis.ask.chatModel')?.trim() || ASK_CHAT_MODEL }).catch(() => undefined);
		const measured: IEmbeddingRunModel[] = [];
		const found: IEmbeddingRunFound[] = [];
		let passages = 0;
		let current = 0;
		const name = benchmark && retrievalBenchmarkName(benchmark);
		const listener = this.askPollisService.onDidEmbed(e => this.report(e.phase === 'embed'
			? name
				? localize('compareEmbeddings.embeddingDocuments', "Embedding the documents of {0} with {1} ({2} of {3})...", name, models[current].label, current + 1, models.length)
				: localize('compareEmbeddings.embedding', "Embedding the passages with {0} ({1} of {2})...", models[current].label, current + 1, models.length)
			: name
				? localize('compareEmbeddings.searchingQueries', "Searching the queries of {0} with {1} ({2} of {3})...", name, models[current].label, current + 1, models.length)
				: localize('compareEmbeddings.searching', "Searching the questions with {0} ({1} of {2})...", models[current].label, current + 1, models.length), e.done, e.total));
		try {
			for (const [i, model] of models.entries()) {
				if (this.stopped) {
					break;
				}
				current = i;
				this.report(localize('compareEmbeddings.starting', "Starting {0} ({1} of {2})...", model.label, i + 1, models.length));
				const before = await this.availableMemory();
				const server = await Promise.resolve(this.commandService.executeCommand<ILlamaServerAnswer>('language-julia.pollisLlamaServer', { model: model.value, embeddings: true, context: ASK_EMBEDDING_CONTEXT })).catch((err): ILlamaServerAnswer => ({ error: String(err) }));
				if (!server?.url) {
					measured.push({ ...model, error: server?.error ?? localize('compareEmbeddings.notStarted', "The model could not be started.") });
					continue;
				}
				try {
					this.sampler.mark('embed');
					const request = { model: model.value, url: server.url, passagePrefix: model.passage };
					const done = benchmark ? await this.askPollisService.embedRetrieval({ ...request, benchmark }) : await this.askPollisService.embedPassages(request);
					this.sampler.mark('search');
					const evaluated = this.stopped ? undefined : benchmark
						? await this.askPollisService.evaluateRetrieval({ ...request, benchmark, queryPrefix: model.query, queries: items.map(item => ({ id: item.source, text: item.question, relevant: item.relevant ?? [] })) })
						: await this.askPollisService.evaluateEmbedding({ ...request, queryPrefix: model.query, questions: items.map(item => ({ question: item.question, context: item.context })) });
					const after = await this.availableMemory();
					passages = evaluated?.passages || passages;
					evaluated?.found.forEach((result, question) => found.push({ ...result, question, model: model.value }));
					measured.push({
						...model,
						dimensions: evaluated?.dimensions || undefined,
						memory: before !== undefined && after !== undefined ? Math.max(0, before - after) : undefined,
						perSecond: done.embedded && done.seconds ? done.embedded / done.seconds : undefined,
						error: evaluationError(evaluated?.error ?? (done.embedded ? undefined : done.error)),
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
			summary: { id: generateUuid(), started, pollis: this.productService.pollisVersion ?? this.productService.version, models: measured, questions: items.length, passages, ...(benchmark ? { benchmark } : {}) },
			questions: items,
			found,
		};
		if (found.length) {
			await this.askPollisService.saveEmbeddingRun(run);
		}
		return this.end({ run, stopped: this.stopped });
	}
}
