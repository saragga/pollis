/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { hasKey } from '../../../../base/common/types.js';
import { localize, localize2 } from '../../../../nls.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { FEWEST_ROWS, rowsChoiceScript, sortHeadingsScript, storedRows, storeRows } from '../../model/browser/webviews/webviewPager.js';
import { RETRIEVALBENCHMARKS_METADATA } from '../../model/browser/webviews/retrievalBenchmarks.data.js';
import { choiceSwitchCss, choiceSwitchHtml, choiceSwitchJs } from '../../model/browser/webviews/scaffoldShared.js';
import { buildWebviewHtml, spinnerSvg } from '../../model/browser/webviews/webviewScaffold.js';
import { ASK_EMBEDDING_MODEL, embeddingPrefixes, IAskPollisEvalItem, IAskPollisService, IEmbeddingRun, IEmbeddingRunModel, IRerankRun, IRerankRunModel, RETRIEVAL_BENCHMARKS, RETRIEVAL_CANDIDATES, RETRIEVAL_CUT, retrievalBenchmarkName } from '../common/askPollis.js';
import { askAnswerCss, askAnswerScript } from './askPollisWebview.js';
import { ICompareProgress } from './compareModelsRun.js';
import { NO_RERANKER } from './compareRerankersRun.js';
import { compareChartsHtml, compareChartsScript, compareCommonScript, compareCss, compareLocalCard, compareSharedText, meanInterval } from './compareShared.js';
import { IInstalledModel } from './modelsInstalledPage.js';
import { IRetrievalEnd, RetrievalBenchmarksRunner } from './retrievalBenchmarksRun.js';

// Benchmark Embedding and Reranking Models, from Compose > Knowledge for AI Models > Benchmark Embedding and
// Reranking Models... (compose.contribution.ts): the embedding models or the rerankers of this computer, run on the retrieval
// benchmarks of PollisBenchmarks.duckdb, SciFact and SCIDOCS, as BEIR runs them (retrievalBenchmarksRun.ts). One page, in
// five steps, as Benchmark Answering Models: 1, the benchmark; 2, the sample: all its queries, or a simple random sample
// of them, the seed drawing the same sample again; 3, the kind of model, on a switch, and the models; 4, Run; 5, the
// results of a run: for each model, nDCG@10 with its 95% interval and Recall@10, its speed and its memory, and the
// nDCG@10 of each query. A published benchmark says how a model does in general, not on Pollis's documents: the models of
// Ask Pollis are chosen in Evaluate Embedding Models and Evaluate Reranking Models, so this page has no Use for Ask
// Pollis. The choices are remembered for the next time.

export const RETRIEVAL_BENCHMARKS_COMMAND_ID = 'pollis.retrievalBenchmarks';

/** The kind of model a run runs. */
type RetrievalKind = 'embedding' | 'reranking';

/** The benchmark chosen, by its id. */
const BENCHMARK_KEY = 'pollis.retrievalBenchmarks.benchmark';
/** The sample of each benchmark, under its id: its size, none for all the queries, and its seed. */
const SAMPLES_KEY = 'pollis.retrievalBenchmarks.samples';
/** The kind of model chosen. */
const KIND_KEY = 'pollis.retrievalBenchmarks.kind';
/** The models chosen of each kind, by their values. */
const CHOSEN_KEY = 'pollis.retrievalBenchmarks.chosen';

/** A benchmark of the page; PollisBenchmarks.duckdb has its queries and its documents. */
interface IRetrievalEntry {
	readonly id: string;
	readonly name: string;
	readonly measures: string;
	readonly relevant: string;
	/** The documents its queries are searched among, at the revision of PollisBenchmarks. */
	readonly documents: number;
	readonly source: string;
}

function retrievalEntries(): readonly IRetrievalEntry[] {
	const entries: Record<string, Omit<IRetrievalEntry, 'id' | 'name'>> = {
		scifact: {
			measures: localize('retrievalBenchmarks.scifact', "Finding scientific evidence: each query is a claim, searched among abstracts of research papers."),
			relevant: localize('retrievalBenchmarks.scifactRelevant', "The abstracts that support or refute the claim."),
			documents: 5183,
			source: 'https://huggingface.co/datasets/BeIR/scifact',
		},
		scidocs: {
			measures: localize('retrievalBenchmarks.scidocs', "Finding related papers: each query is the title of a paper, searched among papers of many fields."),
			relevant: localize('retrievalBenchmarks.scidocsRelevant', "The papers linked to it by citation."),
			documents: 25657,
			source: 'https://huggingface.co/datasets/BeIR/scidocs',
		},
	};
	return RETRIEVAL_BENCHMARKS.filter(benchmark => entries[benchmark.id]).map(benchmark => ({ id: benchmark.id, name: benchmark.name, ...entries[benchmark.id] }));
}

/** The sample of a benchmark: its size, none for all the queries, and the seed that draws it. */
interface IStoredSample {
	readonly size?: number;
	readonly seed: number;
}

const DEFAULT_SAMPLE: IStoredSample = { seed: 1 };

/**
 * The queries of the sample `sample` of `items`: all of them, in the benchmark's order, when its size is none or not
 * below their number; else a simple random sample of that size, drawn by a Fisher-Yates shuffle with the generator
 * mulberry32 seeded with its seed, so that the same seed draws the same queries again, kept in the benchmark's order.
 */
function drawQueries(items: readonly IAskPollisEvalItem[], sample: IStoredSample): IAskPollisEvalItem[] {
	if (sample.size === undefined || sample.size >= items.length) {
		return [...items];
	}
	let state = sample.seed >>> 0;
	const random = () => {
		state = (state + 0x6D2B79F5) >>> 0;
		let value = Math.imul(state ^ (state >>> 15), 1 | state);
		value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
	const order = items.map((_item, index) => index);
	for (let index = 0; index < sample.size; index++) {
		const other = index + Math.floor(random() * (order.length - index));
		[order[index], order[other]] = [order[other], order[index]];
	}
	return order.slice(0, Math.max(1, sample.size)).sort((a, b) => a - b).map(index => items[index]);
}

type RetrievalBenchmarksMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'chooseBenchmark'; readonly id: string }
	| { readonly command: 'sample'; readonly id: string; readonly sample: IStoredSample }
	| { readonly command: 'kind'; readonly kind: RetrievalKind }
	| { readonly command: 'choose'; readonly chosen: readonly string[] }
	| { readonly command: 'rows'; readonly rows: number }
	| { readonly command: 'run' }
	| { readonly command: 'stop' }
	| { readonly command: 'showRun'; readonly id: string }
	| { readonly command: 'deleteRun'; readonly id: string };

/** A run shown: of the embedding models, or of the rerankers. */
type ShownRun = { readonly kind: 'embedding'; readonly run: IEmbeddingRun } | { readonly kind: 'reranking'; readonly run: IRerankRun };

/** What a model found for a query, as both kinds of run keep it. */
interface IScored {
	readonly question: number;
	readonly model: string;
	readonly ndcg?: number;
	readonly recall?: number;
}

/** The runner of the window, made the first time the page opens, so that a run goes on when the page is closed. */
let runner: RetrievalBenchmarksRunner | undefined;

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** The numbers of `values`, the NULLs of the database left out. */
function numbers(values: readonly (number | null | undefined)[]): number[] {
	return values.filter(value => typeof value === 'number');
}

/** The nDCG@10 of `model`, its mean and the half-width of its interval, and its Recall@10, over the queries of `found`. */
function scores(found: readonly IScored[], model: string) {
	const own = found.filter(result => result.model === model);
	const ndcg = meanInterval(numbers(own.map(result => result.ndcg)));
	return { ndcg: ndcg.mean, ndcgHalf: ndcg.half, recall: meanInterval(numbers(own.map(result => result.recall))).mean };
}

/** Where a model of this computer runs, and its size. */
function whereText(size: string | undefined): string {
	return [localize('retrievalBenchmarks.thisComputer', "This Computer"), size].filter(part => part).join(' \u00b7 ');
}

/** The figures of each embedding model of a run. */
function embeddingFigures(run: IEmbeddingRun) {
	return run.summary.models.map(model => {
		const found = run.found.filter(result => result.model === model.value);
		return {
			value: model.value,
			label: model.label,
			where: whereText(model.size),
			...scores(run.found, model.value),
			queryMs: meanInterval(found.map(result => result.queryMs)).mean,
			searchMs: meanInterval(found.map(result => result.searchMs)).mean,
			perSecond: model.perSecond,
			memory: model.memory,
			dimensions: model.dimensions,
			indexBytes: model.dimensions ? model.dimensions * 4 * run.summary.passages : undefined,
			query: model.query,
			error: model.error,
		};
	});
}

/** The figures of each reranker of a run, and of the order of BM25. */
function rerankFigures(run: IRerankRun) {
	return run.summary.models.map(model => ({
		value: model.value,
		label: model.label,
		where: model.value === NO_RERANKER ? localize('retrievalBenchmarks.bm25Order', "Order of BM25") : whereText(model.size),
		...scores(run.found, model.value),
		ms: meanInterval(numbers(run.found.filter(result => result.model === model.value).map(result => result.ms))).mean,
		memory: model.memory,
		error: model.error,
	}));
}

async function openRetrievalBenchmarksPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const commandService = accessor.get(ICommandService);
	const configurationService = accessor.get(IConfigurationService);
	const storageService = accessor.get(IStorageService);
	const askPollisService = accessor.get(IAskPollisService);
	const hostService = accessor.get(IHostService);
	const openerService = accessor.get(IOpenerService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const run = runner ??= accessor.get(IInstantiationService).createInstance(RetrievalBenchmarksRunner);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('retrievalBenchmarks.title', "Benchmark Embedding and Reranking Models");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.retrievalBenchmarks',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	const entries = retrievalEntries();
	webviewInput.webview.setHtml(pageHtml(storedRows(storageService, 'retrievalBenchmarks', FEWEST_ROWS), entries));
	const post = (message: object) => webviewInput.webview.postMessage(message);

	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'retrievalBenchmarks', title, RETRIEVALBENCHMARKS_METADATA.retrievalBenchmarks, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));

	let benchmark = storageService.get(BENCHMARK_KEY, StorageScope.APPLICATION, entries[0].id);
	if (!entries.some(entry => entry.id === benchmark)) {
		benchmark = entries[0].id;
	}
	let samples: { [id: string]: IStoredSample } = {};
	try {
		samples = JSON.parse(storageService.get(SAMPLES_KEY, StorageScope.APPLICATION, '{}')) ?? {};
	} catch {
		// Kept by an older Pollis: the default samples
	}
	const sampleOf = (id: string): IStoredSample => ({ ...DEFAULT_SAMPLE, ...samples[id] });
	/** The queries of each benchmark, by its id, read once from PollisBenchmarks.duckdb; none when it could not be read. */
	const queries = new Map<string, IAskPollisEvalItem[]>();
	const queriesOf = async (id: string) => {
		let items = queries.get(id);
		if (!items) {
			items = ((await askPollisService.retrievalQueries(id).catch(() => undefined)) ?? []).map(query => ({ source: query.id, context: '', question: query.text, answer: '', relevant: query.relevant }));
			if (items.length) {
				queries.set(id, items);
			}
		}
		return items;
	};
	let kind: RetrievalKind = storageService.get(KIND_KEY, StorageScope.APPLICATION) === 'reranking' ? 'reranking' : 'embedding';
	const chosen: Record<RetrievalKind, string[]> = { embedding: [], reranking: [] };
	try {
		const stored = JSON.parse(storageService.get(CHOSEN_KEY, StorageScope.APPLICATION, '{}'));
		for (const key of ['embedding', 'reranking'] as const) {
			chosen[key] = Array.isArray(stored?.[key]) ? stored[key].filter((value: unknown): value is string => typeof value === 'string') : [];
		}
	} catch {
		// Kept by an older Pollis: none chosen
	}
	let embeddingModels: readonly (IEmbeddingRunModel & { readonly bytes?: number })[] = [];
	let rerankModels: readonly (IRerankRunModel & { readonly bytes?: number })[] = [];
	let shown: ShownRun | undefined;

	const status = (text: string, error = false) => post({ command: 'status', text, error });

	const postBenchmarks = async () => {
		const counts = await Promise.all(entries.map(async entry => (await queriesOf(entry.id)).length));
		post({ command: 'benchmarks', benchmarks: entries.map((entry, index) => ({ id: entry.id, count: counts[index], sample: sampleOf(entry.id) })), chosen: benchmark });
	};

	/** The runs of the benchmarks of both kinds, the latest first: those of the test sets are the Evaluate pages'. */
	const listRuns = async () => {
		const [embedding, reranking] = await Promise.all([askPollisService.embeddingRuns(), askPollisService.rerankRuns()]);
		return [
			...embedding.filter(summary => summary.benchmark).map(summary => ({ kind: 'embedding' as const, summary })),
			...reranking.filter(summary => summary.benchmark).map(summary => ({ kind: 'reranking' as const, summary })),
		].sort((a, b) => b.summary.started - a.summary.started);
	};

	const postRun = () => {
		if (!shown) {
			post({ command: 'run', run: undefined });
			return;
		}
		const { summary, questions } = shown.run;
		const found: readonly IScored[] = shown.run.found;
		const among = shown.kind === 'reranking' ? meanInterval(numbers(shown.run.found.filter(result => result.model === NO_RERANKER).map(result => result.among))).mean : undefined;
		post({
			command: 'run',
			run: {
				id: summary.id,
				kind: shown.kind,
				started: summary.started,
				pollis: summary.pollis,
				benchmark: retrievalBenchmarkName(summary.benchmark ?? ''),
				documents: shown.kind === 'embedding' ? shown.run.summary.passages : undefined,
				found: shown.kind === 'reranking' ? shown.run.summary.found : undefined,
				kept: shown.kind === 'reranking' ? shown.run.summary.kept : undefined,
				among,
				figures: shown.kind === 'embedding' ? embeddingFigures(shown.run) : rerankFigures(shown.run),
				questions: questions.map((item, index) => ({
					question: item.question,
					source: item.source,
					ndcg: Object.fromEntries(found.filter(result => result.question === index && typeof result.ndcg === 'number').map(result => [result.model, result.ndcg])),
				})),
			},
		});
	};

	const postRuns = async () => {
		const runs = await listRuns();
		post({
			command: 'runs',
			runs: runs.map(({ kind, summary }) => ({
				id: summary.id,
				kind,
				started: summary.started,
				benchmark: retrievalBenchmarkName(summary.benchmark ?? ''),
				models: (summary.models as readonly { readonly value: string; readonly label: string }[]).filter(model => model.value !== NO_RERANKER).map(model => model.label),
				questions: summary.questions,
			})),
			shown: shown?.run.summary.id,
		});
	};

	const showRun = async (id: string | undefined) => {
		const listed = id ? (await listRuns()).find(candidate => candidate.summary.id === id) : undefined;
		if (listed?.kind === 'embedding') {
			const loaded = await askPollisService.loadEmbeddingRun(listed.summary.id);
			shown = loaded && { kind: 'embedding', run: loaded };
		} else if (listed?.kind === 'reranking') {
			const loaded = await askPollisService.loadRerankRun(listed.summary.id);
			shown = loaded && { kind: 'reranking', run: loaded };
		} else {
			shown = undefined;
		}
		postRun();
		await postRuns();
	};

	// The models of the kind chosen on this computer are looked up when the page is ready, shown again or Pollis gets the focus back, so that one
	// downloaded since is listed; with `changed`, they are sent only if they are not the ones listed, so that a click on a model is not lost to the list drawn again
	const postModels = async (changed?: boolean) => {
		const installed = (await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels').catch(() => undefined) ?? []).filter(installedModel => installedModel.kind === (kind === 'embedding' ? 'embedding' : 'reranker'));
		const listed: readonly { readonly value: string }[] = kind === 'embedding' ? embeddingModels : rerankModels;
		if (changed && installed.map(installedModel => installedModel.value ?? installedModel.file).join('\n') === listed.map(model => model.value).join('\n')) {
			return;
		}
		if (kind === 'embedding') {
			// The model of Ask Pollis with the prefixes of its settings, when they are set; the others with those they were trained with
			const inUse = configurationService.getValue<string>('pollis.ask.embeddingModel')?.trim() || ASK_EMBEDDING_MODEL;
			const passage = configurationService.getValue<string>('pollis.ask.passagePrefix')?.trim();
			const query = configurationService.getValue<string>('pollis.ask.queryPrefix')?.trim();
			embeddingModels = installed.map(installedModel => {
				const value = installedModel.value ?? installedModel.file;
				const prefixes = embeddingPrefixes(installedModel.file);
				return {
					value,
					label: installedModel.name,
					size: installedModel.sizeLabel,
					bytes: installedModel.bytes,
					passage: value === inUse && passage ? passage : prefixes.passage,
					query: value === inUse && query ? query : prefixes.query,
				};
			});
		} else {
			rerankModels = installed.map(installedModel => ({ value: installedModel.value ?? installedModel.file, label: installedModel.name, size: installedModel.sizeLabel, bytes: installedModel.bytes }));
		}
		const models: readonly { readonly value: string; readonly label: string; readonly size?: string; readonly bytes?: number }[] = kind === 'embedding' ? embeddingModels : rerankModels;
		post({ command: 'models', kind, models: models.map(({ value, label, size, bytes }) => ({ value, label, local: true, size, bytes })), chosen: chosen[kind] });
	};

	const ended = async (end: IRetrievalEnd) => {
		const ran = end.embedding ?? end.reranking;
		if (ran) {
			const kept = end.embedding ? end.embedding.found.length > 0 : !!end.reranking?.found.some(result => result.model !== NO_RERANKER);
			if (kept) {
				shown = end.embedding ? { kind: 'embedding', run: end.embedding } : end.reranking && { kind: 'reranking', run: end.reranking };
			}
			postRun();
			await postRuns();
			const models: readonly { readonly label: string; readonly error?: string }[] = ran.summary.models;
			const failed = models.filter(model => model.error).map(model => localize('retrievalBenchmarks.modelFailed', "{0}: {1}", model.label, model.error!));
			const stopped = end.embedding
				? localize('retrievalBenchmarks.embeddingStopped', "Stopped: the documents embedded until then are kept, for the next run.")
				: localize('retrievalBenchmarks.rerankingStopped', "Stopped: the queries reranked until then are shown.");
			status(end.error ?? (failed.length ? failed.join(' ') : end.stopped ? stopped : ''), !!end.error || !!failed.length);
		} else {
			status(end.error ?? '', !!end.error);
		}
		post({ command: 'running', running: false });
	};

	/** Runs the sample of the benchmark chosen with the models chosen of the kind chosen. */
	const startRun = async () => {
		const items = drawQueries(await queriesOf(benchmark), sampleOf(benchmark));
		post({ command: 'running', running: true });
		const running = kind === 'embedding'
			? run.runEmbedding(embeddingModels.filter(model => chosen.embedding.includes(model.value)).map(({ value, label, size, passage, query }) => ({ value, label, size, passage, query })), items, benchmark)
			: run.runReranking(rerankModels.filter(model => chosen.reranking.includes(model.value)).map(({ value, label, size }) => ({ value, label, size })), items, benchmark);
		running.then(end => {
			// The checks before any work, which end nothing
			if (!end.embedding && !end.reranking && end.error && !run.running) {
				status(end.error, true);
				post({ command: 'running', running: false });
			}
		});
	};

	disposables.add(run.onDidProgress((progress: ICompareProgress | undefined) => post({ command: 'progress', progress })));
	disposables.add(run.onDidSample(sample => post({ command: 'sample', sample, memory: run.samples.memory, first: run.samples.samples.length === 1 })));
	disposables.add(run.onDidEnd(end => ended(end)));
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onDidFocus(() => postModels(true)));
	disposables.add(hostService.onDidChangeFocus(focused => {
		if (focused) {
			postModels(true);
		}
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: RetrievalBenchmarksMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			await postBenchmarks();
			await postModels();
			await showRun(shown?.run.summary.id ?? (await listRuns())[0]?.summary.id);
			post({ command: 'running', running: run.running });
			post({ command: 'progress', progress: run.progress });
			post({ command: 'samples', samples: run.samples });
		} else if (message.command === 'chooseBenchmark' && hasKey(message, { id: true })) {
			if (entries.some(entry => entry.id === message.id)) {
				benchmark = message.id;
				storageService.store(BENCHMARK_KEY, benchmark, StorageScope.APPLICATION, StorageTarget.USER);
			}
		} else if (message.command === 'sample' && hasKey(message, { id: true, sample: true })) {
			samples[message.id] = { size: typeof message.sample.size === 'number' ? message.sample.size : undefined, seed: Number(message.sample.seed) || 0 };
			storageService.store(SAMPLES_KEY, JSON.stringify(samples), StorageScope.APPLICATION, StorageTarget.USER);
		} else if (message.command === 'kind' && hasKey(message, { kind: true })) {
			kind = message.kind === 'reranking' ? 'reranking' : 'embedding';
			storageService.store(KIND_KEY, kind, StorageScope.APPLICATION, StorageTarget.USER);
			await postModels();
		} else if (message.command === 'choose' && hasKey(message, { chosen: true })) {
			chosen[kind] = [...message.chosen];
			storageService.store(CHOSEN_KEY, JSON.stringify(chosen), StorageScope.APPLICATION, StorageTarget.USER);
		} else if (message.command === 'rows' && hasKey(message, { rows: true })) {
			storeRows(storageService, 'retrievalBenchmarks', message.rows);
		} else if (message.command === 'run') {
			await startRun();
		} else if (message.command === 'stop') {
			run.stop();
		} else if (message.command === 'showRun' && hasKey(message, { id: true })) {
			await showRun(message.id);
		} else if (message.command === 'deleteRun' && hasKey(message, { id: true })) {
			if (shown?.kind === 'reranking') {
				await askPollisService.deleteRerankRun(message.id);
			} else {
				await askPollisService.deleteEmbeddingRun(message.id);
			}
			await showRun((await listRuns())[0]?.summary.id);
		}
	}));
}

/** The page: its texts come from here; the benchmarks, the models and the runs from the messages. */
function pageHtml(rows: number, entries: readonly IRetrievalEntry[]): string {
	const text = {
		...compareSharedText(),
		title: localize('retrievalBenchmarks.title', "Benchmark Embedding and Reranking Models"),
		intro: localize('retrievalBenchmarks.intro', "How do the embedding models and the rerankers of this computer do on published retrieval benchmarks? Each benchmark is a set of queries, each with the documents relevant to it, searched among the benchmark's own documents, and each query is scored by the first {0} documents found, as BEIR scores them. A published benchmark says how a model does in general, not on Pollis's documents: the models of Ask Pollis are chosen in Evaluate Embedding Models and Evaluate Reranking Models, on questions made from Pollis's own documents.", RETRIEVAL_CUT),
		models: localize('retrievalBenchmarks.models', "Models"),
		toEmbedding: localize('retrievalBenchmarks.toEmbedding', "Show the Embedding Models"),
		toReranking: localize('retrievalBenchmarks.toReranking', "Show the Reranking Models"),
		embeddingModels: localize('retrievalBenchmarks.embeddingModels', "Embedding Models"),
		rerankingModels: localize('retrievalBenchmarks.rerankingModels', "Reranking Models"),
		embeddingKindHint: localize('retrievalBenchmarks.embeddingKindHint', "Each embedding model embeds the documents of the benchmark it has not embedded yet, once ever, then searches each query among them by meaning alone."),
		rerankingKindHint: localize('retrievalBenchmarks.rerankingKindHint', "For each query, BM25 finds {0} documents of the benchmark by their words, and each reranker puts them in its order; the order of BM25 is scored too, as No Reranker.", RETRIEVAL_CANDIDATES),
		noLocal: localize('retrievalBenchmarks.noLocalEmbedding', "No embedding model on this computer yet: Compose > Local AI Models downloads them."),
		noLocalReranking: localize('retrievalBenchmarks.noLocalReranking', "No reranking model on this computer yet: Compose > Local AI Models downloads them."),
		benchmarkStep: localize('retrievalBenchmarks.benchmarkStep', "Benchmark"),
		benchmarkIntro: localize('retrievalBenchmarks.benchmarkIntro', "The queries and the documents of each benchmark come with Pollis, in {0}, at a fixed revision of their source. A model searches the benchmark's own documents, not those of Ask Pollis.", '{0}'),
		benchmark: localize('retrievalBenchmarks.benchmark', "Benchmark"),
		measures: localize('retrievalBenchmarks.measures', "What It Measures"),
		relevantColumn: localize('retrievalBenchmarks.relevantColumn', "Relevant Documents"),
		queriesColumn: localize('retrievalBenchmarks.queriesColumn', "Queries"),
		documentsColumn: localize('retrievalBenchmarks.documentsColumn', "Documents"),
		sourceLink: localize('retrievalBenchmarks.sourceLink', "Source"),
		noItems: localize('retrievalBenchmarks.noItems', "No queries: ~/.pollis/databases/PollisBenchmarks.duckdb may not have this benchmark yet. PollisBenchmarks.jl makes it when the Julia REPL starts."),
		question: localize('retrievalBenchmarks.query', "Query"),
		count: localize('retrievalBenchmarks.count', "{0} queries", '{0}'),
		sampleSection: localize('retrievalBenchmarks.sampleSection', "Sample"),
		sampleIntro: localize('retrievalBenchmarks.sampleIntro', "All the queries, or a simple random sample of them: the benchmarks have no strata. Only a run of all the queries can be set beside the results published. A sample is quicker, above all for the rerankers, which read each query with each of its {0} documents; an embedding model embeds all the documents of the benchmark in any case, once. The same seed draws the same sample again, so that runs of different models search the same queries.", RETRIEVAL_CANDIDATES),
		sampleNeeds: localize('retrievalBenchmarks.sampleNeeds', "The queries of the benchmark could not be read."),
		size: localize('retrievalBenchmarks.size', "Queries"),
		allQueries: localize('retrievalBenchmarks.allQueries', "All Queries"),
		seed: localize('retrievalBenchmarks.seed', "Seed"),
		newSeed: localize('retrievalBenchmarks.newSeed', "New Seed"),
		sampleAll: localize('retrievalBenchmarks.sampleAll', "All the {0} queries, as the results published are computed.", '{0}'),
		sampleSome: localize('retrievalBenchmarks.sampleSome', "{0} of the {1} queries, drawn at random with the seed {2}.", '{0}', '{1}', '{2}'),
		runSection: localize('retrievalBenchmarks.runSection', "Run"),
		embeddingRunIntro: localize('retrievalBenchmarks.embeddingRunIntro', "Each embedding model chosen, one after the other, alone in memory, first embeds the documents it has not embedded yet, which takes some minutes the first time; then it searches each query."),
		rerankingRunIntro: localize('retrievalBenchmarks.rerankingRunIntro', "BM25 first finds the documents of each query; then each reranker chosen, one after the other, alone in memory, puts them in its order, which takes long: each reranker reads every query with each of its documents."),
		run: localize('retrievalBenchmarks.run', "Run"),
		runMany: localize('retrievalBenchmarks.runMany', "Run {0} Queries With {1} Models", '{0}', '{1}'),
		runOneQuestion: localize('retrievalBenchmarks.runOneQuestion', "Run 1 Query With {1} Models", '{0}', '{1}'),
		runOneModel: localize('retrievalBenchmarks.runOneModel', "Run {0} Queries With 1 Model", '{0}', '{1}'),
		runOneOne: localize('retrievalBenchmarks.runOneOne', "Run 1 Query With 1 Model"),
		runNeeds: localize('retrievalBenchmarks.runNeeds', "Choose a benchmark with queries, and at least one model."),
		stop: localize('retrievalBenchmarks.stop', "Stop"),
		chartsHint: localize('retrievalBenchmarks.chartsHint', "Every 2 seconds of the run."),
		phases: {
			embed: localize('retrievalBenchmarks.phaseEmbed', "Embedding"),
			search: localize('retrievalBenchmarks.phaseSearch', "Search"),
			rerank: localize('retrievalBenchmarks.phaseRerank', "Reranking"),
		},
		results: localize('retrievalBenchmarks.results', "Results"),
		earlierRuns: localize('retrievalBenchmarks.earlierRuns', "Run"),
		deleteRun: localize('retrievalBenchmarks.deleteRun', "Delete Run"),
		noRuns: localize('retrievalBenchmarks.noRuns', "No run yet: choose the benchmark, the sample and the models, then Run."),
		descriptive: localize('retrievalBenchmarks.descriptive', "Descriptive Statistics"),
		embeddingRunLine: localize('retrievalBenchmarks.embeddingRunLine', "{0}, Pollis {1}: {2} queries of {3}, searched by meaning among its {4} documents.", '{0}', '{1}', '{2}', '{3}', '{4}'),
		rerankingRunLine: localize('retrievalBenchmarks.rerankingRunLine', "{0}, Pollis {1}: {2} queries of {3}, the {4} documents BM25 found for each put in order by each reranker, of which the first {5} are scored.", '{0}', '{1}', '{2}', '{3}', '{4}', '{5}'),
		amongLine: localize('retrievalBenchmarks.amongLine', "BM25 found {0} of the relevant documents of a query, on average: no reranker can do better.", '{0}'),
		runOption: localize('retrievalBenchmarks.runOption', "{0}, {1} on {2}: {3}, {4} queries", '{0}', '{1}', '{2}', '{3}', '{4}'),
		embeddingKind: localize('retrievalBenchmarks.embeddingKind', "Embedding"),
		rerankingKind: localize('retrievalBenchmarks.rerankingKind', "Reranking"),
		where: localize('retrievalBenchmarks.where', "Where"),
		ndcg: localize('retrievalBenchmarks.ndcg', "nDCG@{0}", RETRIEVAL_CUT),
		ndcgHint: localize('retrievalBenchmarks.ndcgHint', "How well the first {0} documents of a query are ranked, from 0 to 1, 1 when the relevant ones come first: the average over the queries, with its 95% interval", RETRIEVAL_CUT),
		recall: localize('retrievalBenchmarks.recall', "Recall@{0}", RETRIEVAL_CUT),
		recallHint: localize('retrievalBenchmarks.recallHint', "The share of the relevant documents of a query among the first {0}, on average", RETRIEVAL_CUT),
		queryMs: localize('retrievalBenchmarks.queryMs', "Query, ms"),
		queryMsHint: localize('retrievalBenchmarks.queryMsHint', "The milliseconds to embed a query, on average"),
		searchMs: localize('retrievalBenchmarks.searchMs', "Search, ms"),
		searchMsHint: localize('retrievalBenchmarks.searchMsHint', "The milliseconds to find the documents of a query by meaning, on average"),
		perSecond: localize('retrievalBenchmarks.perSecond', "Documents a Second"),
		perSecondHint: localize('retrievalBenchmarks.perSecondHint', "How fast it embedded the documents, when this run embedded any"),
		ms: localize('retrievalBenchmarks.ms', "Reranking, ms"),
		msHint: localize('retrievalBenchmarks.msHint', "The milliseconds to rerank the documents of a query, on average"),
		memory: localize('retrievalBenchmarks.memory', "Memory, GB"),
		memoryHint: localize('retrievalBenchmarks.memoryHint', "The memory its server took: the memory free before it started, less the memory free when it was done"),
		dimensions: localize('retrievalBenchmarks.dimensions', "Dimensions"),
		indexSize: localize('retrievalBenchmarks.indexSize', "Index, MB"),
		indexSizeHint: localize('retrievalBenchmarks.indexSizeHint', "The size of the embeddings of all the documents"),
		queryPrefix: localize('retrievalBenchmarks.queryPrefix', "Query Prefix"),
		error: localize('retrievalBenchmarks.error', "Error"),
		questionsPart: localize('retrievalBenchmarks.questionsPart', "Queries"),
		embeddingQuestionsIntro: localize('retrievalBenchmarks.embeddingQuestionsIntro', "Each query of this run, with the nDCG@{0} of the documents each model found for it: 1 when the relevant documents are the first found, 0 when none is among the first {0}.", RETRIEVAL_CUT),
		rerankingQuestionsIntro: localize('retrievalBenchmarks.rerankingQuestionsIntro', "Each query of this run, with the nDCG@{0} of the first {0} documents in the order of each reranker and of BM25: 1 when the relevant documents come first, 0 when none is among them.", RETRIEVAL_CUT),
	};
	const benchmarkRows = entries.map(entry => `
			<tr class="item benchmark" data-id="${entry.id}">
				<td class="check"><input type="radio" name="benchmark" value="${entry.id}"></td>
				<td class="name">${entry.name}</td>
				<td>${entry.measures}</td>
				<td class="small">${entry.relevant}</td>
				<td class="number queries" data-id="${entry.id}">-</td>
				<td class="number">${entry.documents.toLocaleString('en-US')}</td>
				<td><a href="${entry.source}">${text.sourceLink}</a></td>
			</tr>`).join('');
	return buildWebviewHtml({
		title: text.title,
		introHtml: text.intro,
		omitNextSteps: true,
		extraCss: `
		${compareCss}
		${askAnswerCss}
		${choiceSwitchCss}
		tr.benchmark.chosen td.name { font-weight: 600; }
		td.name { white-space: nowrap; }
		.sizes { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px 20px; margin-top: 12px; }
		input.seed { width: 96px; }
		.sample-line { margin-top: 10px; }
		.choice-switch { margin: 0 0 8px 0; }
`,
		steps: [
			{
				id: 'step-benchmark',
				title: text.benchmarkStep,
				headHtml: '<span class="small" id="benchmarkChosen"></span>',
				bodyHtml: `
	<p class="hint">${text.benchmarkIntro.replace('{0}', '<span class="yellow">~/.pollis/databases/PollisBenchmarks.duckdb</span>')}</p>
	<table id="benchmarks">
		<thead><tr><th class="check"></th><th>${text.benchmark}</th><th>${text.measures}</th><th>${text.relevantColumn}</th><th class="number">${text.queriesColumn}</th><th class="number">${text.documentsColumn}</th><th></th></tr></thead>
		<tbody>${benchmarkRows}</tbody>
	</table>
	<div class="small status" id="setStatus"></div>
`,
			},
			{
				id: 'step-sample',
				title: text.sampleSection,
				headHtml: '<span class="small" id="sampleCount"></span>',
				bodyHtml: `
	<p class="hint">${text.sampleIntro}</p>
	<p class="hint" id="sampleNeeds" hidden>${text.sampleNeeds}</p>
	<div id="sampleForm" hidden>
		<div class="sizes">
			<label class="field"><span class="small">${text.size}</span><input type="number" class="count" id="sampleSize" min="1"></label>
			<button class="link" id="allQueries">${text.allQueries}</button>
			<label class="field"><span class="small">${text.seed}</span><input type="number" class="count seed" id="seed" min="0"></label>
			<button class="link" id="newSeed">${text.newSeed}</button>
		</div>
		<p class="small sample-line" id="sampleLine"></p>
	</div>
`,
			},
			{
				id: 'step-models',
				title: text.models,
				headHtml: '<span class="small" id="chosenCount"></span>',
				bodyHtml: `
	${choiceSwitchHtml('kind', text.embeddingModels, text.rerankingModels, text.toEmbedding, text.toReranking)}
	<p class="small" id="kindHint"></p>
	<div class="models">${compareLocalCard(text)}</div>
`,
			},
			{
				id: 'step-run',
				title: text.runSection,
				bodyHtml: `
	<p class="hint" id="runIntro"></p>
	<div class="settings"><span class="bar"><button class="action current" id="run" disabled>${text.run}</button></span></div>
	<div class="small status" id="runStatus"></div>
	${compareChartsHtml(text)}
`,
			},
			{
				id: 'step-results',
				title: text.results,
				bodyHtml: `
	<div class="row">
		<span class="small">${text.earlierRuns}</span> <select id="runs"></select>
		<button class="link" id="deleteRun">${text.deleteRun}</button>
	</div>
	<p class="hint" id="runLine"></p>
	<p class="hint" id="amongLine"></p>
	<div id="descriptivePart" hidden>
		<h3 class="part">${text.descriptive}</h3>
		<table id="results">
			<thead><tr id="resultsHead"></tr></thead>
			<tbody id="resultsBody"></tbody>
		</table>
	</div>
	<div id="questionsPart" hidden>
		<h3 class="part">${text.questionsPart}</h3>
		<p class="hint" id="questionsPartIntro"></p>
		<div class="pager" id="foundPagerTop" hidden></div>
		<table id="found">
			<thead><tr id="foundHead"></tr></thead>
			<tbody id="foundBody"></tbody>
		</table>
		<div class="pager" id="foundPager" hidden></div>
	</div>
`,
			},
		],
		pageScriptJs: `
	const TEXT = ${JSON.stringify(text)};
	const SPINNER = '${spinnerSvg}';
	const ENTRIES = ${JSON.stringify(entries.map(entry => ({ id: entry.id, name: entry.name })))};
	${askAnswerScript()}
	${rowsChoiceScript()}
	${sortHeadingsScript()}
	${choiceSwitchJs}

	let models = [];
	let kind = 'embedding';
	let benchmarks = [];
	let chosenBenchmark;
	let run;
	let rows = ${rows};
	let running = false;
	// The queries of the run shown: the page shown and their order
	let foundPage = 0;
	const foundSort = { column: 'question', descending: false };
	let statusId = 'runStatus';

	${compareCommonScript}
	document.querySelector('.models').addEventListener('change', event => {
		if (event.target.classList.contains('all')) {
			for (const box of event.target.closest('table').querySelectorAll('tbody input')) { box.checked = event.target.checked; }
		}
		updateChosen();
		vscode.postMessage({ command: 'choose', chosen: chosenValues() });
	});

	function entryOf(id) {
		return ENTRIES.find(entry => entry.id === id);
	}
	function current() {
		return benchmarks.find(item => item.id === chosenBenchmark);
	}

	// The benchmark: a click anywhere on its row chooses it
	for (const row of document.querySelectorAll('tr.benchmark')) {
		row.addEventListener('click', event => {
			if (event.target.closest('a')) { return; }
			chosenBenchmark = row.dataset.id;
			vscode.postMessage({ command: 'chooseBenchmark', id: chosenBenchmark });
			renderBenchmarks();
		});
	}
	function renderBenchmarks() {
		for (const row of document.querySelectorAll('tr.benchmark')) {
			const item = benchmarks.find(candidate => candidate.id === row.dataset.id);
			row.querySelector('input').checked = row.dataset.id === chosenBenchmark;
			row.classList.toggle('chosen', row.dataset.id === chosenBenchmark);
			row.querySelector('td.queries').textContent = item && item.count ? item.count.toLocaleString('en-US') : '-';
		}
		const entry = entryOf(chosenBenchmark);
		const item = current();
		document.getElementById('benchmarkChosen').textContent = entry ? entry.name : '';
		if (statusId === 'setStatus' || (item && !item.count)) {
			statusId = 'setStatus';
			setStatus(item && !item.count ? TEXT.noItems : '', !!(item && !item.count), false);
		}
		renderSample();
	}

	/** The sample of the benchmark chosen: all its queries, or as many as its size drawn with its seed. */
	function sampleSize() {
		const item = current();
		if (!item || !item.count) { return 0; }
		return item.sample.size === undefined ? item.count : Math.min(item.sample.size, item.count);
	}
	function saveSample(sample) {
		const item = current();
		if (!item) { return; }
		item.sample = sample.size !== undefined && sample.size >= item.count ? { seed: sample.seed } : sample;
		vscode.postMessage({ command: 'sample', id: item.id, sample: item.sample });
		renderSample();
	}
	function renderSample() {
		const item = current();
		const ready = !!(item && item.count);
		document.getElementById('sampleForm').hidden = !ready;
		document.getElementById('sampleNeeds').hidden = ready;
		const size = sampleSize();
		document.getElementById('sampleCount').textContent = size ? format(TEXT.count, size) : '';
		if (ready) {
			document.getElementById('sampleSize').value = size;
			document.getElementById('sampleSize').max = item.count;
			document.getElementById('seed').value = item.sample.seed;
			const all = size === item.count;
			document.getElementById('allQueries').hidden = all;
			document.getElementById('seed').disabled = all;
			document.getElementById('newSeed').disabled = all;
			document.getElementById('sampleLine').textContent = all ? format(TEXT.sampleAll, item.count) : format(TEXT.sampleSome, size, item.count, item.sample.seed);
		}
		updateRun();
	}
	document.getElementById('sampleSize').addEventListener('change', event => {
		const item = current();
		if (!item) { return; }
		saveSample({ ...item.sample, size: Math.max(1, Math.round(Number(event.target.value) || 1)) });
	});
	document.getElementById('allQueries').addEventListener('click', () => {
		const item = current();
		if (item) { saveSample({ seed: item.sample.seed }); }
	});
	document.getElementById('seed').addEventListener('change', event => {
		const item = current();
		if (item) { saveSample({ ...item.sample, seed: Math.max(0, Math.round(Number(event.target.value) || 0)) }); }
	});
	document.getElementById('newSeed').addEventListener('click', () => {
		const item = current();
		if (item) { saveSample({ ...item.sample, seed: Math.floor(Math.random() * 100000) }); }
	});

	// The kind of model, on the switch: its hint, the models of this computer of that kind, and what Run does
	const showSwitch = choiceSwitch('kind', reranking => {
		showKind(reranking ? 'reranking' : 'embedding');
		vscode.postMessage({ command: 'kind', kind });
	});
	function showKind(value) {
		kind = value;
		showSwitch(kind === 'reranking');
		document.getElementById('kindHint').textContent = kind === 'embedding' ? TEXT.embeddingKindHint : TEXT.rerankingKindHint;
		document.getElementById('noLocal').textContent = kind === 'embedding' ? TEXT.noLocal : TEXT.noLocalReranking;
		document.getElementById('runIntro').textContent = kind === 'embedding' ? TEXT.embeddingRunIntro : TEXT.rerankingRunIntro;
	}

	/** Run, with how many queries it takes and with how many models; Stop while it runs. */
	function updateRun() {
		const button = document.getElementById('run');
		const questions = sampleSize();
		const count = chosenValues().length;
		button.disabled = !running && (!questions || !count);
		button.title = button.disabled ? TEXT.runNeeds : '';
		button.textContent = running ? TEXT.stop : button.disabled ? TEXT.run : format(questions === 1 ? (count === 1 ? TEXT.runOneOne : TEXT.runOneQuestion) : count === 1 ? TEXT.runOneModel : TEXT.runMany, questions, count);
	}
	function setRunning(value) {
		running = value;
		updateRun();
	}
	function renderTables() {
		renderFound();
	}
	document.getElementById('run').addEventListener('click', () => {
		statusId = 'runStatus';
		vscode.postMessage(running ? { command: 'stop' } : { command: 'run' });
	});

	function percent(value) {
		return value === undefined || value === null ? '-' : Math.round(100 * value) + '%';
	}

	/** Each query of the run shown, with its nDCG@10 for each model. */
	function renderFound() {
		const part = document.getElementById('questionsPart');
		part.hidden = !run || !run.questions.length;
		if (part.hidden) { return; }
		document.getElementById('questionsPartIntro').textContent = run.kind === 'embedding' ? TEXT.embeddingQuestionsIntro : TEXT.rerankingQuestionsIntro;
		const head = document.getElementById('foundHead');
		head.textContent = '';
		const resort = () => {
			foundPage = 0;
			renderFound();
		};
		sortHeading(head, TEXT.question, 'question', '', foundSort, resort);
		for (const figures of run.figures) { sortHeading(head, figures.label, 'model:' + figures.value, 'number', foundSort, resort); }
		const size = rowsPerPage(rows, run.questions.length);
		const pages = Math.max(1, Math.ceil(run.questions.length / size));
		foundPage = Math.min(foundPage, pages - 1);
		const body = document.getElementById('foundBody');
		body.textContent = '';
		// By a model, the queries it ranked best first
		const value = (question, column) => column.startsWith('model:') ? question.ndcg[column.slice(6)] ?? -1 : question[column] || '';
		for (const question of pageOf(sortedBy(run.questions, foundSort, value), foundPage)) {
			const row = element('tr');
			const cell = element('td', 'asked', question.question);
			cell.title = question.source;
			row.appendChild(cell);
			for (const figures of run.figures) { row.appendChild(element('td', 'number', fixed(question.ndcg[figures.value], 2))); }
			body.appendChild(row);
		}
		fillPagers(['foundPagerTop', 'foundPager'], run.questions.length, pages, foundPage, to => { foundPage = to; });
	}

	/** The figures of each model of the run shown, the best first by its nDCG@10. */
	function renderRun() {
		const head = document.getElementById('resultsHead');
		const body = document.getElementById('resultsBody');
		head.textContent = '';
		body.textContent = '';
		document.getElementById('descriptivePart').hidden = !run;
		const started = run && new Date(run.started).toLocaleString();
		document.getElementById('runLine').textContent = !run ? TEXT.noRuns : run.kind === 'embedding'
			? format(TEXT.embeddingRunLine, started, run.pollis, run.questions.length, run.benchmark, run.documents)
			: format(TEXT.rerankingRunLine, started, run.pollis, run.questions.length, run.benchmark, run.found, run.kept);
		document.getElementById('amongLine').textContent = run && run.among !== undefined ? format(TEXT.amongLine, percent(run.among)) : '';
		document.getElementById('deleteRun').hidden = !run;
		// A run that ends shows itself, even in a pane left closed
		if (run) { document.getElementById('step-results').classList.remove('collapsed'); }
		if (!run) { return; }
		const sorted = [...run.figures].sort((a, b) => (b.ndcg ?? -1) - (a.ndcg ?? -1));
		head.appendChild(element('th', '', TEXT.model));
		for (const figures of sorted) { head.appendChild(element('th', 'number', figures.label)); }
		const line = (label, hint, value, className) => {
			const row = element('tr');
			const name = element('td', '', label);
			if (hint) { name.title = hint; }
			row.appendChild(name);
			for (const figures of sorted) { row.appendChild(element('td', className ?? 'number', value(figures))); }
			body.appendChild(row);
		};
		line(TEXT.where, '', figures => figures.where, 'small');
		line(TEXT.ndcg, TEXT.ndcgHint, figures => figures.ndcg === undefined ? '-' : fixed(figures.ndcg, 3) + (figures.ndcgHalf === undefined ? '' : ' \\u00b1 ' + fixed(figures.ndcgHalf, 3)));
		line(TEXT.recall, TEXT.recallHint, figures => percent(figures.recall));
		if (run.kind === 'embedding') {
			line(TEXT.queryMs, TEXT.queryMsHint, figures => fixed(figures.queryMs, 0));
			line(TEXT.searchMs, TEXT.searchMsHint, figures => fixed(figures.searchMs, 0));
			line(TEXT.perSecond, TEXT.perSecondHint, figures => fixed(figures.perSecond, 0));
		} else {
			line(TEXT.ms, TEXT.msHint, figures => fixed(figures.ms, 0));
		}
		line(TEXT.memory, TEXT.memoryHint, figures => figures.memory > 0 ? (figures.memory / 1024 ** 3).toFixed(1) : '-');
		if (run.kind === 'embedding') {
			line(TEXT.dimensions, '', figures => figures.dimensions ? String(figures.dimensions) : '-');
			line(TEXT.indexSize, TEXT.indexSizeHint, figures => figures.indexBytes ? (figures.indexBytes / 1024 ** 2).toFixed(0) : '-');
			line(TEXT.queryPrefix, '', figures => figures.query, 'small');
		}
		if (sorted.some(figures => figures.error)) { line(TEXT.error, '', figures => figures.error || '', 'small'); }
	}

	${compareChartsScript}

	const runsSelect = document.getElementById('runs');
	runsSelect.addEventListener('change', () => vscode.postMessage({ command: 'showRun', id: runsSelect.value }));
	document.getElementById('deleteRun').addEventListener('click', () => { if (run) { vscode.postMessage({ command: 'deleteRun', id: run.id }); } });

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'models') {
			showKind(message.kind);
			models = message.models;
			renderLocal(message.chosen);
			updateChosen();
		} else if (message.command === 'benchmarks') {
			benchmarks = message.benchmarks;
			chosenBenchmark = message.chosen;
			renderBenchmarks();
		} else if (message.command === 'run') {
			if (message.run?.id !== run?.id) { foundPage = 0; }
			run = message.run;
			renderRun();
			renderFound();
		} else if (message.command === 'runs') {
			runsSelect.textContent = '';
			for (const summary of message.runs) {
				runsSelect.appendChild(new Option(format(TEXT.runOption, new Date(summary.started).toLocaleString(), summary.kind === 'embedding' ? TEXT.embeddingKind : TEXT.rerankingKind, summary.benchmark, summary.models.join(', '), summary.questions), summary.id));
			}
			runsSelect.value = message.shown || '';
			runsSelect.disabled = !message.runs.length;
		} else if (message.command === 'running') {
			setRunning(message.running);
		} else if (message.command === 'samples') {
			samples = { memory: message.samples.memory, samples: [...message.samples.samples] };
			renderCharts();
		} else if (message.command === 'sample') {
			if (message.first) { samples = { memory: message.memory, samples: [] }; }
			samples.samples.push(message.sample);
			renderCharts();
		} else if (message.command === 'progress') {
			if (message.progress) { setStatus(message.progress.text, false, true, message.progress.total ? Math.floor(100 * message.progress.done / message.progress.total) : undefined); }
		} else if (message.command === 'status') {
			setStatus(message.text, message.error, false);
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: RETRIEVAL_BENCHMARKS_COMMAND_ID,
			title: localize2('retrievalBenchmarks.action', "Benchmark Embedding and Reranking Models..."),
			category: Categories.Help,
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openRetrievalBenchmarksPage(accessor);
	}
});
