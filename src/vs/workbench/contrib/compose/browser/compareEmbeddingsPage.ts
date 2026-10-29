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
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { FEWEST_ROWS, rowsChoiceScript, sortHeadingsScript, storedRows, storeRows } from '../../model/browser/webviews/webviewPager.js';
import { spinnerSvg } from '../../model/browser/webviews/webviewScaffold.js';
import { OPEN_LINK_COMMAND_ID } from '../../monitor/browser/openLink.js';
import { ASK_EMBEDDING_MODEL, ASK_PASSAGE_PREFIX, ASK_PASSAGES, ASK_QUERY_PREFIX, embeddingPrefixes, IAskPollisService, IEmbeddingRun, IEmbeddingRunModel } from '../common/askPollis.js';
import { askAnswerCss, askAnswerScript } from './askPollisWebview.js';
import { CompareEmbeddingsRunner, IEmbeddingEnd } from './compareEmbeddingsRun.js';
import { COMPARE_MODELS_COMMAND_ID } from './compareModelsPage.js';
import { ICompareProgress } from './compareModelsRun.js';
import { compareChartsHtml, compareChartsScript, compareCommonScript, compareCss, compareLocalCard, compareSharedText, compareTestSetHtml, compareTestSetScript, CompareTestSetChoice } from './compareShared.js';
import { IInstalledModel } from './modelsInstalledPage.js';

// Evaluate Embedding Models, from Compose > Local Models > Evaluate Embedding Models... (compose.contribution.ts): the
// embedding models of this computer, compared on the questions of a test set of Evaluate Answering Models, which the
// sets are changed in. One page, in four steps: 1, the models to compare; 2, the questions, those ticked being the ones
// searched, all when none is; 3, Run, which embeds the passages each model has not embedded yet, once ever, into the
// cache that the index of Ask Pollis takes them from too, then searches each question as Ask Pollis would
// (compareEmbeddingsRun.ts); 4, the results of the run shown: for each model, how often the passage a question was made
// from is among those Ask Pollis gives, and where, with words and meaning, and by meaning alone; how fast it embeds a
// question and searches, the memory it takes and the size of its index; Use for Ask Pollis makes it the embedding model
// of Ask Pollis. The choices are remembered for the next time.

export const COMPARE_EMBEDDINGS_COMMAND_ID = 'pollis.compareEmbeddings';

/** The models chosen, by their values. */
const CHOSEN_KEY = 'pollis.compareEmbeddings.chosen';
/** The test set chosen, by its name, the Standard one being ''. */
const TEST_SET_KEY = 'pollis.compareEmbeddings.testSet';
/** The questions ticked in each test set, by their text, under the set's name. */
const TICKED_KEY = 'pollis.compareEmbeddings.ticked';
/** The packages of the evaluation, on the Powered by line. */
const POWERED_BY = [
	{ name: 'llama.cpp', url: 'https://github.com/ggml-org/llama.cpp' },
	{ name: 'DuckDB', url: 'https://duckdb.org' },
];

type CompareEmbeddingsMessage =
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
	| { readonly command: 'use'; readonly model: string }
	| { readonly command: 'openUrl'; readonly url: string };

/** The runner of the window, made the first time the page opens, so that a run goes on when the page is closed. */
let runner: CompareEmbeddingsRunner | undefined;

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

/** A place found, NULL in the database coming as null. */
function place(value: number | null | undefined): number | undefined {
	return typeof value === 'number' ? value : undefined;
}

/** The figures of each model of a run. */
function embeddingFigures(run: IEmbeddingRun) {
	return run.summary.models.map(model => {
		const found = run.found.filter(result => result.model === model.value);
		const hybrid = found.map(result => place(result.hybrid)).filter(value => value !== undefined);
		const meaning = found.map(result => place(result.meaning)).filter(value => value !== undefined);
		const hits = hybrid.filter(value => value > 0);
		return {
			value: model.value,
			label: model.label,
			where: [localize('compareEmbeddings.thisComputer', "This Computer"), model.size].filter(part => part).join(' · '),
			found: hybrid.length ? hits.length / hybrid.length : undefined,
			place: mean(hits),
			meaningFound: meaning.length ? meaning.filter(value => value <= ASK_PASSAGES).length / meaning.length : undefined,
			meaningPlace: median(meaning),
			queryMs: mean(found.map(result => result.queryMs)),
			searchMs: mean(found.map(result => result.searchMs)),
			memory: model.memory,
			dimensions: model.dimensions,
			indexBytes: model.dimensions ? model.dimensions * 4 * run.summary.passages : undefined,
			perSecond: model.perSecond,
			error: model.error,
			passage: model.passage,
			query: model.query,
		};
	});
}

async function openCompareEmbeddingsPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const commandService = accessor.get(ICommandService);
	const configurationService = accessor.get(IConfigurationService);
	const storageService = accessor.get(IStorageService);
	const askPollisService = accessor.get(IAskPollisService);
	const dialogService = accessor.get(IDialogService);
	const hostService = accessor.get(IHostService);
	const run = runner ??= accessor.get(IInstantiationService).createInstance(CompareEmbeddingsRunner);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('compareEmbeddings.title', "Evaluate Embedding Models");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.compareEmbeddings',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml(storedRows(storageService, 'compareEmbeddings', FEWEST_ROWS)));
	const post = (message: object) => webviewInput.webview.postMessage(message);

	const disposables = new DisposableStore();
	let listed: readonly (IEmbeddingRunModel & { readonly bytes?: number })[] = [];
	let chosen: string[] = [];
	try {
		chosen = JSON.parse(storageService.get(CHOSEN_KEY, StorageScope.APPLICATION, '[]'));
	} catch {
		// Kept by an older Pollis: none chosen
	}
	const testSet = new CompareTestSetChoice(storageService, askPollisService, run.sets, { testSet: TEST_SET_KEY, ticked: TICKED_KEY }, post);
	let shown: IEmbeddingRun | undefined;

	const status = (text: string, error = false) => post({ command: 'status', text, error });
	const current = () => configurationService.getValue<string>('pollis.ask.embeddingModel')?.trim() || ASK_EMBEDDING_MODEL;

	const postRun = (latest?: string) => {
		post({
			command: 'run',
			run: shown && {
				id: shown.summary.id,
				started: shown.summary.started,
				pollis: shown.summary.pollis,
				passages: shown.summary.passages,
				figures: embeddingFigures(shown),
				questions: shown.questions.map((item, index) => ({
					question: item.question,
					source: item.source,
					places: Object.fromEntries(shown!.found.filter(result => result.question === index).map(result => [result.model, { hybrid: place(result.hybrid), meaning: place(result.meaning) }])),
				})),
			},
			current: current(),
			latest,
		});
	};

	const postRuns = async () => {
		const runs = await askPollisService.embeddingRuns();
		post({ command: 'runs', runs: runs.map(summary => ({ id: summary.id, started: summary.started, models: summary.models.map(model => model.label), questions: summary.questions })), shown: shown?.summary.id });
	};

	const showRun = async (id: string | undefined) => {
		shown = id ? await askPollisService.loadEmbeddingRun(id) : undefined;
		postRun();
		await postRuns();
	};

	// The models on this computer are looked up when the page is ready, shown again or Pollis gets the focus back, so that one downloaded since is listed;
	// with `changed`, they are sent only if they are not the ones listed, so that a click on a model is not lost to the list drawn again
	const postModels = async (changed?: boolean) => {
		const installed = (await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels').catch(() => undefined) ?? []).filter(installedModel => installedModel.kind === 'embedding');
		if (changed && installed.map(installedModel => installedModel.value ?? installedModel.file).join('\n') === listed.map(model => model.value).join('\n')) {
			return;
		}
		// The model of Ask Pollis with the prefixes of its settings, when they are set
		const inUse = current();
		const passage = configurationService.getValue<string>('pollis.ask.passagePrefix')?.trim();
		const query = configurationService.getValue<string>('pollis.ask.queryPrefix')?.trim();
		listed = installed.map(installedModel => {
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
		post({ command: 'models', models: listed.map(({ value, label, size, bytes }) => ({ value, label, local: true, size, bytes })), chosen });
	};

	const ended = async (end: IEmbeddingEnd) => {
		if (end.run) {
			shown = end.run.found.length ? end.run : shown;
			postRun(end.run.found.length ? end.run.summary.id : undefined);
			await postRuns();
			const failed = end.run.summary.models.filter(model => model.error).map(model => localize('compareEmbeddings.modelFailed', "{0}: {1}", model.label, model.error!));
			status(end.error ?? (failed.length ? failed.join(' ') : end.stopped ? localize('compareEmbeddings.runStopped', "Stopped: the passages embedded until then are kept, for the next run.") : ''), !!end.error || !!failed.length);
		} else {
			status(end.error ?? '', !!end.error);
		}
		post({ command: 'running', running: false });
	};

	/** Makes `value`, a model of the run shown, the embedding model of Ask Pollis, with the prefixes it was run with, and makes the index again. */
	const use = async (value: string) => {
		const model = shown?.summary.models.find(candidate => candidate.value === value);
		if (!model) {
			return;
		}
		const { confirmed } = await dialogService.confirm({
			message: localize('compareEmbeddings.useConfirm', "Use {0} for Ask Pollis?", model.label),
			detail: localize('compareEmbeddings.useDetail', "Ask Pollis then finds the passages by their meaning with {0}, with the prefixes of this run. The index of Ask Pollis is made again with it: the passages this run embedded are not embedded again.", model.label),
			primaryButton: localize({ key: 'compareEmbeddings.useButton', comment: ['&& denotes a mnemonic'] }, "&&Use for Ask Pollis"),
		});
		if (!confirmed) {
			return;
		}
		await configurationService.updateValue('pollis.ask.embeddingModel', model.value === ASK_EMBEDDING_MODEL ? undefined : model.value, ConfigurationTarget.USER);
		await configurationService.updateValue('pollis.ask.passagePrefix', model.passage === ASK_PASSAGE_PREFIX ? undefined : model.passage, ConfigurationTarget.USER);
		await configurationService.updateValue('pollis.ask.queryPrefix', model.query === ASK_QUERY_PREFIX ? undefined : model.query, ConfigurationTarget.USER);
		await commandService.executeCommand('language-julia.pollisIndexDocuments').catch(() => undefined);
		postRun();
		status(localize('compareEmbeddings.used', "Ask Pollis now finds passages with {0}; its index is being made again.", model.label));
	};

	/** Runs the questions ticked, by their text, or all of them when none is. */
	const startRun = (questions: readonly string[]) => {
		const ticked = new Set(questions);
		post({ command: 'running', running: true });
		run.run(listed.filter(model => chosen.includes(model.value)).map(({ value, label, size, passage, query }) => ({ value, label, size, passage, query })), ticked.size ? testSet.items.filter(item => ticked.has(item.question)) : testSet.items).then(end => {
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
	disposables.add(webviewInput.webview.onMessage(async (e: { message: CompareEmbeddingsMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			await postModels();
			await testSet.choose(testSet.name);
			await showRun(shown?.summary.id ?? (await askPollisService.embeddingRuns())[0]?.id);
			post({ command: 'running', running: run.running });
			post({ command: 'progress', progress: run.progress });
			post({ command: 'samples', samples: run.samples });
		} else if (message.command === 'choose' && hasKey(message, { chosen: true })) {
			chosen = [...message.chosen];
			storageService.store(CHOSEN_KEY, JSON.stringify(chosen), StorageScope.APPLICATION, StorageTarget.USER);
		} else if (message.command === 'rows' && hasKey(message, { rows: true })) {
			storeRows(storageService, 'compareEmbeddings', message.rows);
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
			await askPollisService.deleteEmbeddingRun(message.id);
			await showRun((await askPollisService.embeddingRuns())[0]?.id);
		} else if (message.command === 'use' && hasKey(message, { model: true })) {
			await use(message.model);
		} else if (message.command === 'openUrl' && hasKey(message, { url: true }) && POWERED_BY.some(pkg => pkg.url === message.url)) {
			await commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
		}
	}));
}

/** The page: its texts come from here; the models, the questions and the runs from the messages. */
function pageHtml(rows: number): string {
	const text = {
		...compareSharedText(),
		title: localize('compareEmbeddings.title', "Evaluate Embedding Models"),
		intro: localize('compareEmbeddings.intro', "Which model should find the passages that Ask Pollis answers from? Each question of a test set was made from a passage: each model chosen searches every question as Ask Pollis would, and the page shows how often that passage is found, and where. Each passage is embedded once by each model, ever: a later run, and the index of Ask Pollis, take it from {0}.", '<span class="yellow">~/.pollis/documents/embeddings.duckdb</span>'),
		models: localize('compareEmbeddings.models', "Models"),
		noLocal: localize('compareEmbeddings.noLocal', "No embedding model on this computer yet: Compose > Local Models downloads them."),
		questionsIntro: localize('compareEmbeddings.questionsIntro', "The test sets of Evaluate Answering Models: each question with the passage it was made from. Tick the questions to search, a click anywhere on a row ticks it; with none ticked, Run searches them all."),
		standardHint: localize('compareEmbeddings.standardHint', "Standard comes with Pollis. Your own test sets are made and changed in Evaluate Answering Models."),
		changeSets: localize('compareEmbeddings.changeSets', "Change the Test Sets..."),
		noItems: localize('compareEmbeddings.noItems', "No questions in this test set: Change the Test Sets... puts them in."),
		runSection: localize('compareEmbeddings.runSection', "Run"),
		runIntro: localize('compareEmbeddings.runIntro', "Each model chosen, one after the other, alone in memory, first embeds the passages it has not embedded yet, which takes some minutes the first time; then it searches each question."),
		run: localize('compareEmbeddings.run', "Run"),
		runMany: localize('compareEmbeddings.runMany', "Run {0} Questions With {1} Models", '{0}', '{1}'),
		runOneQuestion: localize('compareEmbeddings.runOneQuestion', "Run 1 Question With {1} Models", '{0}', '{1}'),
		runOneModel: localize('compareEmbeddings.runOneModel', "Run {0} Questions With 1 Model", '{0}', '{1}'),
		runOneOne: localize('compareEmbeddings.runOneOne', "Run 1 Question With 1 Model"),
		runNeeds: localize('compareEmbeddings.runNeeds', "Choose at least one model, and a test set with questions."),
		stop: localize('compareEmbeddings.stop', "Stop"),
		chartsHint: localize('compareEmbeddings.chartsHint', "Every 2 seconds of the run."),
		phases: { embed: localize('compareEmbeddings.phaseEmbed', "Embedding"), search: localize('compareEmbeddings.phaseSearch', "Search") },
		results: localize('compareEmbeddings.results', "Results"),
		earlierRuns: localize('compareEmbeddings.earlierRuns', "Run"),
		deleteRun: localize('compareEmbeddings.deleteRun', "Delete Run"),
		noRuns: localize('compareEmbeddings.noRuns', "No run yet: choose the models and the questions, then Run."),
		runLine: localize('compareEmbeddings.runLine', "{0}, Pollis {1}: {2} questions, among {3} passages.", '{0}', '{1}', '{2}', '{3}'),
		runOption: localize('compareEmbeddings.runOption', "{0}: {1}, {2} questions", '{0}', '{1}', '{2}'),
		where: localize('compareEmbeddings.where', "Where"),
		found: localize('compareEmbeddings.found', "Found"),
		foundHint: localize('compareEmbeddings.foundHint', "How often the passage a question was made from is among the {0} passages Ask Pollis gives, found by words and meaning together", ASK_PASSAGES),
		place: localize('compareEmbeddings.place', "Place"),
		placeHint: localize('compareEmbeddings.placeHint', "Its place among them when it is found, on average: 1 is the first"),
		meaningFound: localize('compareEmbeddings.meaningFound', "Found by Meaning"),
		meaningFoundHint: localize('compareEmbeddings.meaningFoundHint', "How often it is among the first {0} passages by meaning alone", ASK_PASSAGES),
		meaningPlace: localize('compareEmbeddings.meaningPlace', "Place by Meaning"),
		meaningPlaceHint: localize('compareEmbeddings.meaningPlaceHint', "Its place among all the passages by meaning alone, the median"),
		queryMs: localize('compareEmbeddings.queryMs', "Question, ms"),
		queryMsHint: localize('compareEmbeddings.queryMsHint', "The milliseconds to embed a question, on average"),
		searchMs: localize('compareEmbeddings.searchMs', "Search, ms"),
		searchMsHint: localize('compareEmbeddings.searchMsHint', "The milliseconds to find the passages, by words and meaning, on average"),
		perSecond: localize('compareEmbeddings.perSecond', "Passages a Second"),
		perSecondHint: localize('compareEmbeddings.perSecondHint', "How fast it embedded the passages, when this run embedded any"),
		memory: localize('compareEmbeddings.memory', "Memory, GB"),
		memoryHint: localize('compareEmbeddings.memoryHint', "The memory its server took: the memory free before it started, less the memory free when it was done"),
		dimensions: localize('compareEmbeddings.dimensions', "Dimensions"),
		indexSize: localize('compareEmbeddings.indexSize', "Index, MB"),
		indexSizeHint: localize('compareEmbeddings.indexSizeHint', "The size of the embeddings of all the passages"),
		queryPrefix: localize('compareEmbeddings.queryPrefix', "Question Prefix"),
		error: localize('compareEmbeddings.error', "Error"),
		use: localize('compareEmbeddings.use', "Use for Ask Pollis"),
		inUse: localize('compareEmbeddings.inUse', "In Use"),
		questionsPart: localize('compareEmbeddings.questionsPart', "Questions"),
		questionsPartIntro: localize('compareEmbeddings.questionsPartIntro', "Each question of this run, with the place of its passage for each model: among those Ask Pollis gives, then by meaning alone; - when it is not among them."),
		places: localize('compareEmbeddings.places', "{0} · {1}", '{0}', '{1}'),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		${compareCss}
		${askAnswerCss}
	</style>
</head>
<body>
<div class="container">
	<h1>${text.title}</h1>
	<div class="powered-by">${text.poweredBy}&nbsp;<span id="package-links"></span></div>
	<p class="subtitle">${text.intro}</p>
	<div class="head"><h2 class="section"><span class="step">1</span>${text.models}</h2><span class="small" id="chosenCount"></span></div>
	<div class="models">${compareLocalCard(text)}</div>

	${compareTestSetHtml(text, text.questionsIntro, `<span class="bar"><button class="action current" id="changeSets">${text.changeSets}</button></span>`)}

	<h2 class="section"><span class="step">3</span>${text.runSection}</h2>
	<p class="hint">${text.runIntro}</p>
	<div class="settings"><span class="bar"><button class="action current" id="run" disabled>${text.run}</button></span></div>
	<div class="small status" id="runStatus"></div>
	${compareChartsHtml(text)}

	<h2 class="section"><span class="step">4</span>${text.results}</h2>
	<div class="row">
		<span class="small">${text.earlierRuns}</span> <select id="runs"></select>
		<button class="link" id="deleteRun">${text.deleteRun}</button>
	</div>
	<p class="hint" id="runLine"></p>
	<table id="results" hidden>
		<thead><tr id="resultsHead"></tr></thead>
		<tbody id="resultsBody"></tbody>
	</table>
	<div id="questionsPart" hidden>
		<h3 class="part">${text.questionsPart}</h3>
		<p class="hint">${text.questionsPartIntro}</p>
		<div class="pager" id="foundPagerTop" hidden></div>
		<table id="found">
			<thead><tr id="foundHead"></tr></thead>
			<tbody id="foundBody"></tbody>
		</table>
		<div class="pager" id="foundPager" hidden></div>
	</div>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const POWERED_BY = ${JSON.stringify(POWERED_BY)};
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
	// The questions of the test set: the page shown, their order, and those ticked, which Run searches, by their text
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

	/** Run, with how many questions it searches and with how many models; Stop while it runs. */
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
	/** The place of a question's passage for a model: among those given, 0 when it is not, then by meaning alone. */
	function places(question, model) {
		return question.places[model] || {};
	}
	function placeText(value, most) {
		return value === undefined || value === null || value === 0 || (most && value > most) ? '-' : String(value);
	}

	function renderFound() {
		const part = document.getElementById('questionsPart');
		part.hidden = !run || !run.questions.length;
		if (part.hidden) { return; }
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
		// By a model, the questions whose passage it found first, then those it found further down, then the others
		const value = (question, column) => {
			if (!column.startsWith('model:')) { return question[column] || ''; }
			const found = places(question, column.slice(6));
			return found.hybrid ? found.hybrid : 1000000 + (found.meaning ?? 1000000);
		};
		for (const question of pageOf(sortedBy(run.questions, foundSort, value), foundPage)) {
			const row = element('tr');
			const cell = element('td', 'asked', question.question);
			cell.title = question.source;
			row.appendChild(cell);
			for (const figures of run.figures) {
				const found = places(question, figures.value);
				row.appendChild(element('td', 'number', format(TEXT.places, placeText(found.hybrid), placeText(found.meaning))));
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
		document.getElementById('runLine').textContent = run ? format(TEXT.runLine, new Date(run.started).toLocaleString(), run.pollis, run.questions.length, run.passages) : TEXT.noRuns;
		document.getElementById('deleteRun').hidden = !run;
		if (!run) { return; }
		// A column for each model, the best first by how often it found the passage, then by its place; a row for each figure
		const sorted = [...run.figures].sort((a, b) => (b.found ?? -1) - (a.found ?? -1) || (a.place ?? Infinity) - (b.place ?? Infinity));
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
		line(TEXT.found, TEXT.foundHint, figures => percent(figures.found));
		line(TEXT.place, TEXT.placeHint, figures => fixed(figures.place, 1));
		line(TEXT.meaningFound, TEXT.meaningFoundHint, figures => percent(figures.meaningFound));
		line(TEXT.meaningPlace, TEXT.meaningPlaceHint, figures => fixed(figures.meaningPlace, 0));
		line(TEXT.queryMs, TEXT.queryMsHint, figures => fixed(figures.queryMs, 0));
		line(TEXT.searchMs, TEXT.searchMsHint, figures => fixed(figures.searchMs, 0));
		line(TEXT.perSecond, TEXT.perSecondHint, figures => fixed(figures.perSecond, 0));
		line(TEXT.memory, TEXT.memoryHint, figures => figures.memory > 0 ? (figures.memory / 1024 ** 3).toFixed(1) : '-');
		line(TEXT.dimensions, '', figures => figures.dimensions ? String(figures.dimensions) : '-');
		line(TEXT.indexSize, TEXT.indexSizeHint, figures => figures.indexBytes ? (figures.indexBytes / 1024 ** 2).toFixed(0) : '-');
		line(TEXT.queryPrefix, '', figures => figures.query, 'small');
		if (sorted.some(figures => figures.error)) { line(TEXT.error, '', figures => figures.error || '', 'small'); }
		// Use for Ask Pollis: the one blue button on the best model, In Use on the model of Ask Pollis
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
				runsSelect.appendChild(new Option(format(TEXT.runOption, new Date(summary.started).toLocaleString(), summary.models.join(', '), summary.questions), summary.id));
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
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: COMPARE_EMBEDDINGS_COMMAND_ID,
			title: localize2('compareEmbeddings.action', "Evaluate Embedding Models..."),
			category: Categories.Help,
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openCompareEmbeddingsPage(accessor);
	}
});
