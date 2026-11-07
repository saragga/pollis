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
import { ConfigurationTarget, IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
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
import { COMPARERERANKERS_METADATA } from '../../model/browser/webviews/compareRerankers.data.js';
import { buildWebviewHtml, spinnerSvg } from '../../model/browser/webviews/webviewScaffold.js';
import { ASK_PASSAGES, ASK_RERANK_WIDER, IAskPollisService, IRerankRun, IRerankRunModel, RETRIEVAL_CANDIDATES, RETRIEVAL_CUT, retrievalBenchmarkName } from '../common/askPollis.js';
import { askAnswerCss, askAnswerScript, askModelName } from './askPollisWebview.js';
import { COMPARE_MODELS_COMMAND_ID } from './compareModelsPage.js';
import { ICompareProgress } from './compareModelsRun.js';
import { CompareRerankersRunner, IRerankEnd, NO_RERANKER } from './compareRerankersRun.js';
import { compareChartsHtml, compareChartsScript, compareCommonScript, compareCss, compareLocalCard, compareSharedText, compareTestSetHeadHtml, compareTestSetHtml, compareTestSetScript, CompareTestSetChoice, meanInterval } from './compareShared.js';
import { IInstalledModel } from './modelsInstalledPage.js';

// Evaluate Reranking Models, from Compose > Knowledge for AI Models > Evaluate Reranking Models... (compose.contribution.ts):
// the rerankers of this computer, compared on the questions of a test set of Evaluate Answering Models, which the sets
// are changed in. One page, in four steps, as Evaluate Embedding Models: 1, the rerankers to compare; 2, the questions,
// those ticked being the ones run, all when none is; 3, Run, which finds the passages of each question once, as Ask
// Pollis finds them with a reranker set, then has each reranker put them in its order (compareRerankersRun.ts); 4, the
// results of the run shown: for each reranker, and for the order of the search with none, how often the passage a
// question was made from is among those Ask Pollis gives, and where; how fast it reranks a question and the memory it
// takes; Use for Ask Pollis makes it the reranker of Ask Pollis. The choices are remembered for the next time. The test
// sets include the retrieval benchmarks of PollisBenchmarks.duckdb, SciFact and SCIDOCS: each reranker puts in its order
// the documents BM25 finds for each query among the benchmark's own, and is scored by nDCG@10 and Recall@10, as BEIR scores them.

export const COMPARE_RERANKERS_COMMAND_ID = 'pollis.compareRerankers';

/** The rerankers chosen, by their values. */
const CHOSEN_KEY = 'pollis.compareRerankers.chosen';
/** The test set chosen, by its name, the Standard one being ''. */
const TEST_SET_KEY = 'pollis.compareRerankers.testSet';
/** The questions ticked in each test set, by their text, under the set's name. */
const TICKED_KEY = 'pollis.compareRerankers.ticked';

type CompareRerankersMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'choose'; readonly chosen: readonly string[] }
	| { readonly command: 'rows'; readonly rows: number }
	| { readonly command: 'run'; readonly questions: readonly string[] }
	| { readonly command: 'stop' }
	| { readonly command: 'chooseSet'; readonly name: string }
	| { readonly command: 'tick'; readonly questions: readonly string[] }
	| { readonly command: 'changeSets' }
	| { readonly command: 'showRun'; readonly id: string }
	| { readonly command: 'deleteRun'; readonly id: string }
	| { readonly command: 'use'; readonly model: string };

/** The runner of the window, made the first time the page opens, so that a run goes on when the page is closed. */
let runner: CompareRerankersRunner | undefined;

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

function mean(values: readonly number[]): number | undefined {
	return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined;
}

function median(values: readonly number[]): number | undefined {
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return !sorted.length ? undefined : sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** A number kept, NULL in the database coming as null. */
function defined(value: number | null | undefined): number | undefined {
	return typeof value === 'number' ? value : undefined;
}

/** The figures of each reranker of a run, and of the order of the search. */
function rerankFigures(run: IRerankRun) {
	const kept = run.summary.kept;
	return run.summary.models.map(model => {
		const found = run.found.filter(result => result.model === model.value);
		const places = found.map(result => defined(result.place)).filter(value => value !== undefined);
		const given = places.filter(value => value > 0 && value <= kept);
		const ndcg = meanInterval(found.map(result => result.ndcg).filter(value => typeof value === 'number'));
		return {
			value: model.value,
			label: model.label,
			where: model.value === NO_RERANKER ? (run.summary.benchmark ? localize('compareRerankers.bm25Order', "Order of BM25") : localize('compareRerankers.searchOrder', "Order of the Search")) : [localize('compareRerankers.thisComputer', "This Computer"), model.size].filter(part => part).join(' · '),
			found: places.length ? given.length / places.length : undefined,
			place: mean(given),
			allPlace: median(places.filter(value => value > 0)),
			ndcg: ndcg.mean,
			ndcgHalf: ndcg.half,
			recall: mean(found.map(result => result.recall).filter(value => typeof value === 'number')),
			ms: mean(found.map(result => defined(result.ms)).filter(value => value !== undefined)),
			memory: model.memory,
			error: model.error,
		};
	});
}

async function openCompareRerankersPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const commandService = accessor.get(ICommandService);
	const configurationService = accessor.get(IConfigurationService);
	const storageService = accessor.get(IStorageService);
	const askPollisService = accessor.get(IAskPollisService);
	const dialogService = accessor.get(IDialogService);
	const hostService = accessor.get(IHostService);
	const openerService = accessor.get(IOpenerService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const run = runner ??= accessor.get(IInstantiationService).createInstance(CompareRerankersRunner);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('compareRerankers.title', "Evaluate Reranking Models");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.compareRerankers',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml(storedRows(storageService, 'compareRerankers', FEWEST_ROWS)));
	const post = (message: object) => webviewInput.webview.postMessage(message);

	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'compareRerankers', title, COMPARERERANKERS_METADATA.compareRerankers, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));
	let listed: readonly (IRerankRunModel & { readonly bytes?: number })[] = [];
	let chosen: string[] = [];
	try {
		chosen = JSON.parse(storageService.get(CHOSEN_KEY, StorageScope.APPLICATION, '[]'));
	} catch {
		// Kept by an older Pollis: none chosen
	}
	const testSet = new CompareTestSetChoice(storageService, askPollisService, run.sets, { testSet: TEST_SET_KEY, ticked: TICKED_KEY }, post, undefined, true);
	let shown: IRerankRun | undefined;

	const status = (text: string, error = false) => post({ command: 'status', text, error });
	const current = () => configurationService.getValue<string>('pollis.ask.reranker')?.trim() || NO_RERANKER;

	const postRun = (latest?: string) => {
		const baseline = shown?.found.filter(result => result.model === NO_RERANKER && defined(result.place) !== undefined) ?? [];
		// Of a benchmark, the share of the relevant documents of a query among all those BM25 found, on average
		const among = shown?.found.filter(result => result.model === NO_RERANKER).map(result => defined(result.among)).filter(value => value !== undefined) ?? [];
		post({
			command: 'run',
			run: shown && {
				id: shown.summary.id,
				started: shown.summary.started,
				pollis: shown.summary.pollis,
				found: shown.summary.found,
				kept: shown.summary.kept,
				embedder: askModelName(shown.summary.embedder),
				benchmark: shown.summary.benchmark && retrievalBenchmarkName(shown.summary.benchmark),
				among: shown.summary.benchmark ? mean(among) : baseline.length ? baseline.filter(result => result.place! > 0).length / baseline.length : undefined,
				figures: rerankFigures(shown),
				questions: shown.questions.map((item, index) => ({
					question: item.question,
					source: item.source,
					places: Object.fromEntries(shown!.found.filter(result => result.question === index).map(result => [result.model, defined(shown!.summary.benchmark ? result.ndcg : result.place)])),
				})),
			},
			current: current(),
			latest,
		});
	};

	const postRuns = async () => {
		const runs = await askPollisService.rerankRuns();
		post({ command: 'runs', runs: runs.map(summary => ({ id: summary.id, started: summary.started, models: summary.models.filter(model => model.value !== NO_RERANKER).map(model => model.label), questions: summary.questions, benchmark: summary.benchmark && retrievalBenchmarkName(summary.benchmark) })), shown: shown?.summary.id });
	};

	const showRun = async (id: string | undefined) => {
		shown = id ? await askPollisService.loadRerankRun(id) : undefined;
		postRun();
		await postRuns();
	};

	// The rerankers on this computer are looked up when the page is ready, shown again or Pollis gets the focus back, so that one downloaded since is listed;
	// with `changed`, they are sent only if they are not the ones listed, so that a click on a model is not lost to the list drawn again
	const postModels = async (changed?: boolean) => {
		const installed = (await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels').catch(() => undefined) ?? []).filter(installedModel => installedModel.kind === 'reranker');
		if (changed && installed.map(installedModel => installedModel.value ?? installedModel.file).join('\n') === listed.map(model => model.value).join('\n')) {
			return;
		}
		listed = installed.map(installedModel => ({ value: installedModel.value ?? installedModel.file, label: installedModel.name, size: installedModel.sizeLabel, bytes: installedModel.bytes }));
		post({ command: 'models', models: listed.map(({ value, label, size, bytes }) => ({ value, label, local: true, size, bytes })), chosen });
	};

	const ended = async (end: IRerankEnd) => {
		if (end.run) {
			const reranked = end.run.found.some(result => result.model !== NO_RERANKER);
			shown = reranked ? end.run : shown;
			postRun(reranked ? end.run.summary.id : undefined);
			await postRuns();
			const failed = end.run.summary.models.filter(model => model.error).map(model => localize('compareRerankers.modelFailed', "{0}: {1}", model.label, model.error!));
			status(end.error ?? (failed.length ? failed.join(' ') : end.stopped ? localize('compareRerankers.runStopped', "Stopped: the questions reranked until then are shown.") : ''), !!end.error || !!failed.length);
		} else {
			status(end.error ?? '', !!end.error);
		}
		post({ command: 'running', running: false });
	};

	/** Makes `value`, a reranker of the run shown or none, the reranker of Ask Pollis. */
	const use = async (value: string) => {
		const model = shown?.summary.models.find(candidate => candidate.value === value);
		if (!model || !shown) {
			return;
		}
		const none = value === NO_RERANKER;
		// A run of a benchmark kept its own numbers of documents: Ask Pollis finds and gives those of its settings
		const kept = shown.summary.benchmark ? configurationService.getValue<number>('pollis.ask.passages') || ASK_PASSAGES : shown.summary.kept;
		const found = shown.summary.benchmark ? kept * ASK_RERANK_WIDER : shown.summary.found;
		const { confirmed } = await dialogService.confirm({
			message: none
				? localize('compareRerankers.useNoneConfirm', "Use no reranker for Ask Pollis?")
				: localize('compareRerankers.useConfirm', "Use {0} for Ask Pollis?", model.label),
			detail: none
				? localize('compareRerankers.useNoneDetail', "Ask Pollis then gives the first {0} passages of the search, in the order the search found them.", kept)
				: localize('compareRerankers.useDetail', "Ask Pollis then finds {0} passages for each question, and {1} chooses the {2} it gives.", found, model.label, kept),
			primaryButton: localize({ key: 'compareRerankers.useButton', comment: ['&& denotes a mnemonic'] }, "&&Use for Ask Pollis"),
		});
		if (!confirmed) {
			return;
		}
		await configurationService.updateValue('pollis.ask.reranker', none ? undefined : model.value, ConfigurationTarget.USER);
		postRun();
		status(none
			? localize('compareRerankers.usedNone', "Ask Pollis now gives the passages in the order of the search.")
			: localize('compareRerankers.used', "Ask Pollis now chooses its passages with {0}.", model.label));
	};

	/** Runs the questions ticked, by their text, or all of them when none is. */
	const startRun = (questions: readonly string[]) => {
		const ticked = new Set(questions);
		post({ command: 'running', running: true });
		run.run(listed.filter(model => chosen.includes(model.value)).map(({ value, label, size }) => ({ value, label, size })), ticked.size ? testSet.items.filter(item => ticked.has(item.question)) : testSet.items, testSet.benchmark).then(end => {
			// The checks before any work, which end nothing
			if (!end.run && end.error && !run.running) {
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
	disposables.add(webviewInput.webview.onMessage(async (e: { message: CompareRerankersMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			await postModels();
			await testSet.choose(testSet.name);
			await showRun(shown?.summary.id ?? (await askPollisService.rerankRuns())[0]?.id);
			post({ command: 'running', running: run.running });
			post({ command: 'progress', progress: run.progress });
			post({ command: 'samples', samples: run.samples });
		} else if (message.command === 'choose' && hasKey(message, { chosen: true })) {
			chosen = [...message.chosen];
			storageService.store(CHOSEN_KEY, JSON.stringify(chosen), StorageScope.APPLICATION, StorageTarget.USER);
		} else if (message.command === 'rows' && hasKey(message, { rows: true })) {
			storeRows(storageService, 'compareRerankers', message.rows);
		} else if (message.command === 'run' && hasKey(message, { questions: true })) {
			startRun(message.questions);
		} else if (message.command === 'stop') {
			run.stop();
		} else if (message.command === 'chooseSet' && hasKey(message, { name: true })) {
			await testSet.choose(message.name);
		} else if (message.command === 'tick' && hasKey(message, { questions: true })) {
			testSet.storeTicks(testSet.name, message.questions);
		} else if (message.command === 'changeSets') {
			await commandService.executeCommand(COMPARE_MODELS_COMMAND_ID);
		} else if (message.command === 'showRun' && hasKey(message, { id: true })) {
			await showRun(message.id);
		} else if (message.command === 'deleteRun' && hasKey(message, { id: true })) {
			await askPollisService.deleteRerankRun(message.id);
			await showRun((await askPollisService.rerankRuns())[0]?.id);
		} else if (message.command === 'use' && hasKey(message, { model: true })) {
			await use(message.model);
		}
	}));
}

/** The page: its texts come from here; the models, the questions and the runs from the messages. */
function pageHtml(rows: number): string {
	const text = {
		...compareSharedText(),
		title: localize('compareRerankers.title', "Evaluate Reranking Models"),
		intro: localize('compareRerankers.intro', "Which reranker should choose the passages that Ask Pollis answers from? With a reranker set, Ask Pollis finds {0} times the passages it gives, and the reranker reads the question with each of them and keeps the best. Each question of a test set was made from a passage: each reranker chosen puts the same passages in its order, and the page shows how often that passage is among those Ask Pollis gives, and where, beside the order of the search with no reranker.", ASK_RERANK_WIDER),
		models: localize('compareRerankers.models', "Models"),
		noLocal: localize('compareRerankers.noLocal', "No reranking model on this computer yet: Compose > Local AI Models downloads them."),
		questionsIntro: localize('compareRerankers.questionsIntro', "The test sets of Evaluate Answering Models: each question with the passage it was made from. Tick the questions to run, a click anywhere on a row ticks it; with none ticked, Run takes them all."),
		standardHint: localize('compareRerankers.standardHint', "Standard comes with Pollis. Your own test sets are made and changed in Evaluate Answering Models."),
		benchmarkHint: localize('compareRerankers.benchmarkHint', "{0} comes with Pollis, in ~/.pollis/databases/PollisBenchmarks.duckdb: its queries, each with the documents relevant to it. For each query, BM25 finds {1} of the benchmark's own documents, not those of Ask Pollis, and each reranker puts them in its order; each query is scored by the first {2}, as BEIR scores them.", '{0}', RETRIEVAL_CANDIDATES, RETRIEVAL_CUT),
		changeSets: localize('compareRerankers.changeSets', "Change the Test Sets..."),
		noItems: localize('compareRerankers.noItems', "No questions in this test set: Change the Test Sets... puts them in."),
		runSection: localize('compareRerankers.runSection', "Run"),
		runIntro: localize('compareRerankers.runIntro', "The passages of each question are found once, with the embedding model of Ask Pollis; then each reranker chosen, one after the other, alone in memory, puts them in its order."),
		run: localize('compareRerankers.run', "Run"),
		runMany: localize('compareRerankers.runMany', "Run {0} Questions With {1} Models", '{0}', '{1}'),
		runOneQuestion: localize('compareRerankers.runOneQuestion', "Run 1 Question With {1} Models", '{0}', '{1}'),
		runOneModel: localize('compareRerankers.runOneModel', "Run {0} Questions With 1 Model", '{0}', '{1}'),
		runOneOne: localize('compareRerankers.runOneOne', "Run 1 Question With 1 Model"),
		runNeeds: localize('compareRerankers.runNeeds', "Choose at least one model, and a test set with questions."),
		stop: localize('compareRerankers.stop', "Stop"),
		chartsHint: localize('compareRerankers.chartsHint', "Every 2 seconds of the run."),
		phases: { search: localize('compareRerankers.phaseSearch', "Search"), rerank: localize('compareRerankers.phaseRerank', "Reranking") },
		results: localize('compareRerankers.results', "Results"),
		earlierRuns: localize('compareRerankers.earlierRuns', "Run"),
		deleteRun: localize('compareRerankers.deleteRun', "Delete Run"),
		noRuns: localize('compareRerankers.noRuns', "No run yet: choose the models and the questions, then Run."),
		runLine: localize('compareRerankers.runLine', "{0}, Pollis {1}: {2} questions, {3} passages found for each by {4}, of which Ask Pollis gives {5}.", '{0}', '{1}', '{2}', '{3}', '{4}', '{5}'),
		amongLine: localize('compareRerankers.amongLine', "The passage a question was made from was among those found for {0} of the questions: no reranker can do better.", '{0}'),
		runLineBenchmark: localize('compareRerankers.runLineBenchmark', "{0}, Pollis {1}: {2} queries of {3}, {4} documents found for each by BM25, of which the first {5} are scored.", '{0}', '{1}', '{2}', '{3}', '{4}', '{5}'),
		amongLineBenchmark: localize('compareRerankers.amongLineBenchmark', "BM25 found {0} of the relevant documents of a query, on average: no reranker can do better.", '{0}'),
		runOption: localize('compareRerankers.runOption', "{0}: {1}, {2} questions", '{0}', '{1}', '{2}'),
		runOptionBenchmark: localize('compareRerankers.runOptionBenchmark', "{0}: {1}, {2}, {3} queries", '{0}', '{1}', '{2}', '{3}'),
		where: localize('compareRerankers.where', "Where"),
		found: localize('compareRerankers.found', "Found"),
		foundHint: localize('compareRerankers.foundHint', "How often the passage a question was made from is among the passages Ask Pollis gives, the first in the reranker's order"),
		place: localize('compareRerankers.place', "Place"),
		placeHint: localize('compareRerankers.placeHint', "Its place among them when it is found, on average: 1 is the first"),
		allPlace: localize('compareRerankers.allPlace', "Place Among All Found"),
		allPlaceHint: localize('compareRerankers.allPlaceHint', "Its place among all the passages found, in the reranker's order, the median"),
		ndcg: localize('compareRerankers.ndcg', "nDCG@{0}", RETRIEVAL_CUT),
		ndcgHint: localize('compareRerankers.ndcgHint', "How well the first {0} documents in the reranker's order are ranked, from 0 to 1, 1 when the relevant ones come first: the average over the queries, with its 95% interval", RETRIEVAL_CUT),
		recall: localize('compareRerankers.recall', "Recall@{0}", RETRIEVAL_CUT),
		recallHint: localize('compareRerankers.recallHint', "The share of the relevant documents of a query among the first {0} in the reranker's order, on average", RETRIEVAL_CUT),
		ms: localize('compareRerankers.ms', "Reranking, ms"),
		msHint: localize('compareRerankers.msHint', "The milliseconds to rerank the passages of a question, on average"),
		memory: localize('compareRerankers.memory', "Memory, GB"),
		memoryHint: localize('compareRerankers.memoryHint', "The memory its server took: the memory free before it started, less the memory free when it was done"),
		error: localize('compareRerankers.error', "Error"),
		use: localize('compareRerankers.use', "Use for Ask Pollis"),
		inUse: localize('compareRerankers.inUse', "In Use"),
		questionsPart: localize('compareRerankers.questionsPart', "Questions"),
		questionsPartIntro: localize('compareRerankers.questionsPartIntro', "Each question of this run, with the place of its passage among all the passages found, in the order of each reranker; Ask Pollis gives the first {0}. A dash when it is not among those found.", '{0}'),
		questionsPartBenchmarkIntro: localize('compareRerankers.questionsPartBenchmarkIntro', "Each query of this run, with the nDCG@{0} of the first {0} documents in the order of each reranker: 1 when the relevant documents come first, 0 when none is among them.", RETRIEVAL_CUT),
	};
	return buildWebviewHtml({
		title: text.title,
		introHtml: text.intro,
		extraCss: `
		${compareCss}
		${askAnswerCss}
		td.given { font-weight: 600; }
`,
		steps: [
			{
				id: 'step-models',
				title: text.models,
				headHtml: '<span class="small" id="chosenCount"></span>',
				bodyHtml: `
	<div class="models">${compareLocalCard(text)}</div>
`,
			},
			{
				id: 'step-questions',
				title: text.questions,
				headHtml: compareTestSetHeadHtml(text),
				bodyHtml: `
	${compareTestSetHtml(text, text.questionsIntro, `<span class="bar"><button class="action current" id="changeSets">${text.changeSets}</button></span>`)}
`,
			},
			{
				id: 'step-run',
				title: text.runSection,
				bodyHtml: `
	<p class="hint">${text.runIntro}</p>
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
	<table id="results" hidden>
		<thead><tr id="resultsHead"></tr></thead>
		<tbody id="resultsBody"></tbody>
	</table>
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
	${askAnswerScript()}
	${rowsChoiceScript()}
	${sortHeadingsScript()}

	let models = [];
	let items = [];
	let run;
	let current;
	let rows = ${rows};
	let running = false;
	// Whether the test set shown is the Standard one
	let standard = true;
	// The questions of the test set: the page shown, their order, and those ticked, which Run takes, by their text
	let page = 0;
	const itemSort = { column: 'number', descending: false };
	const ticked = new Set();
	// The questions of the run shown: the page shown and their order
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

	/** Run, with how many questions it takes and with how many models; Stop while it runs. */
	function updateRun() {
		const button = document.getElementById('run');
		const questions = ticked.size || items.length;
		const count = chosenValues().length;
		button.disabled = !running && (!questions || !count);
		button.title = button.disabled ? TEXT.runNeeds : '';
		button.textContent = running ? TEXT.stop : button.disabled ? TEXT.run : format(questions === 1 ? (count === 1 ? TEXT.runOneOne : TEXT.runOneQuestion) : count === 1 ? TEXT.runOneModel : TEXT.runMany, questions, count);
	}
	function setRunning(value) {
		running = value;
		updateRun();
	}
	${compareTestSetScript}
	function testSetChanged() {
		updateRun();
	}
	function renderTables() {
		render();
		renderFound();
	}
	document.getElementById('run').addEventListener('click', () => {
		statusId = 'runStatus';
		vscode.postMessage(running ? { command: 'stop' } : { command: 'run', questions: [...ticked] });
	});
	document.getElementById('testSet').addEventListener('change', event => {
		statusId = 'setStatus';
		vscode.postMessage({ command: 'chooseSet', name: event.target.value });
	});
	document.getElementById('changeSets').addEventListener('click', () => vscode.postMessage({ command: 'changeSets' }));
	document.getElementById('untick').addEventListener('click', () => {
		ticked.clear();
		ticksChanged();
		render();
	});

	function percent(value) {
		return value === undefined || value === null ? '-' : Math.round(100 * value) + '%';
	}
	function placeText(value) {
		return value === undefined || value === null || value === 0 ? '-' : String(value);
	}

	function renderFound() {
		const part = document.getElementById('questionsPart');
		part.hidden = !run || !run.questions.length;
		if (part.hidden) { return; }
		document.getElementById('questionsPartIntro').textContent = run.benchmark ? TEXT.questionsPartBenchmarkIntro : format(TEXT.questionsPartIntro, run.kept);
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
		// By a reranker, the questions whose passage it put first, then those it put further down, then the others; of a benchmark, by nDCG
		const value = (question, column) => {
			if (!column.startsWith('model:')) { return question[column] || ''; }
			const found = question.places[column.slice(6)];
			if (run.benchmark) { return found ?? -1; }
			return found ? found : 1000000;
		};
		for (const question of pageOf(sortedBy(run.questions, foundSort, value), foundPage)) {
			const row = element('tr');
			const cell = element('td', 'asked', question.question);
			cell.title = question.source;
			row.appendChild(cell);
			for (const figures of run.figures) {
				const found = question.places[figures.value];
				// The places among those Ask Pollis gives in bold; of a benchmark, the nDCG of the query
				row.appendChild(run.benchmark ? element('td', 'number', fixed(found, 2)) : element('td', 'number' + (found > 0 && found <= run.kept ? ' given' : ''), placeText(found)));
			}
			body.appendChild(row);
		}
		fillPagers(['foundPagerTop', 'foundPager'], run.questions.length, pages, foundPage, to => { foundPage = to; });
	}

	function renderRun() {
		const head = document.getElementById('resultsHead');
		const body = document.getElementById('resultsBody');
		head.textContent = '';
		body.textContent = '';
		document.getElementById('results').hidden = !run;
		document.getElementById('runLine').textContent = !run ? TEXT.noRuns : run.benchmark
			? format(TEXT.runLineBenchmark, new Date(run.started).toLocaleString(), run.pollis, run.questions.length, run.benchmark, run.found, run.kept)
			: format(TEXT.runLine, new Date(run.started).toLocaleString(), run.pollis, run.questions.length, run.found, run.embedder, run.kept);
		document.getElementById('amongLine').textContent = run && run.among !== undefined ? format(run.benchmark ? TEXT.amongLineBenchmark : TEXT.amongLine, percent(run.among)) : '';
		document.getElementById('deleteRun').hidden = !run;
		// A run that ends shows itself, even in a pane left closed
		if (run) { document.getElementById('step-results').classList.remove('collapsed'); }
		if (!run) { return; }
		// A column for each reranker, the best first by how often it gave the passage, then by its place, or by its nDCG on a benchmark; a row for each figure
		const sorted = [...run.figures].sort((a, b) => run.benchmark
			? (b.ndcg ?? -1) - (a.ndcg ?? -1)
			: (b.found ?? -1) - (a.found ?? -1) || (a.place ?? Infinity) - (b.place ?? Infinity));
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
		if (run.benchmark) {
			line(TEXT.ndcg, TEXT.ndcgHint, figures => figures.ndcg === undefined ? '-' : fixed(figures.ndcg, 3) + (figures.ndcgHalf === undefined ? '' : ' \\u00b1 ' + fixed(figures.ndcgHalf, 3)));
			line(TEXT.recall, TEXT.recallHint, figures => percent(figures.recall));
		} else {
			line(TEXT.found, TEXT.foundHint, figures => percent(figures.found));
			line(TEXT.place, TEXT.placeHint, figures => fixed(figures.place, 1));
			line(TEXT.allPlace, TEXT.allPlaceHint, figures => fixed(figures.allPlace, 0));
		}
		line(TEXT.ms, TEXT.msHint, figures => fixed(figures.ms, 0));
		line(TEXT.memory, TEXT.memoryHint, figures => figures.memory > 0 ? (figures.memory / 1024 ** 3).toFixed(1) : '-');
		if (sorted.some(figures => figures.error)) { line(TEXT.error, '', figures => figures.error || '', 'small'); }
		// Use for Ask Pollis: the one blue button on the best, In Use on the reranker of Ask Pollis, or on the search with none
		const row = element('tr');
		row.appendChild(element('td'));
		sorted.forEach((figures, index) => {
			const cell = element('td', 'number');
			if (figures.value === current) {
				cell.appendChild(element('span', 'small', TEXT.inUse));
			} else if (!figures.error) {
				const button = element('button', 'action' + (index === 0 ? ' current' : ''), TEXT.use);
				button.addEventListener('click', () => {
					statusId = 'runStatus';
					vscode.postMessage({ command: 'use', model: figures.value });
				});
				cell.appendChild(button);
			}
			row.appendChild(cell);
		});
		body.appendChild(row);
	}

	${compareChartsScript}

	const runsSelect = document.getElementById('runs');
	runsSelect.addEventListener('change', () => vscode.postMessage({ command: 'showRun', id: runsSelect.value }));
	document.getElementById('deleteRun').addEventListener('click', () => { if (run) { vscode.postMessage({ command: 'deleteRun', id: run.id }); } });

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'models') {
			models = message.models;
			renderLocal(message.chosen);
			updateChosen();
		} else if (message.command === 'sets') {
			showSets(message);
		} else if (message.command === 'items') {
			showItems(message);
		} else if (message.command === 'run') {
			if (message.run?.id !== run?.id) { foundPage = 0; }
			run = message.run;
			current = message.current;
			renderRun();
			renderFound();
		} else if (message.command === 'runs') {
			runsSelect.textContent = '';
			for (const summary of message.runs) {
				const started = new Date(summary.started).toLocaleString();
				runsSelect.appendChild(new Option(summary.benchmark ? format(TEXT.runOptionBenchmark, started, summary.models.join(', '), summary.benchmark, summary.questions) : format(TEXT.runOption, started, summary.models.join(', '), summary.questions), summary.id));
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
			id: COMPARE_RERANKERS_COMMAND_ID,
			title: localize2('compareRerankers.action', "Evaluate Reranking Models..."),
			category: Categories.Help,
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openCompareRerankersPage(accessor);
	}
});
