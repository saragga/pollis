/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../base/common/buffer.js';
import { timeout } from '../../../../base/common/async.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { hasKey } from '../../../../base/common/types.js';
import { localize, localize2 } from '../../../../nls.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
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
import { COMPAREMODELS_METADATA } from '../../model/browser/webviews/compareModels.data.js';
import { buildWebviewHtml, spinnerSvg } from '../../model/browser/webviews/webviewScaffold.js';
import { ASK_CLOUD_MODELS, ASK_CLOUD_PROVIDERS, ASK_LOCAL_PREFIX, askCloudModel, askPassageLabel, AskTopic, IAskPollisEvalItem, IAskPollisNamedIndex, IAskPollisPassage, IAskPollisService, IAskTopicCounts, ICompareRun, ICompareRunModel } from '../common/askPollis.js';
import { ASK_DEFAULT_STRATEGY, askPollisStrategy, askStrategyLabel, IAskPollisStrategiesService } from '../common/askPollisStrategies.js';
import { IToolboxPanelsService } from '../common/toolboxPanels.js';
import { askAnswerCss, askAnswerScript, askMenuCss, askMenuScript, askOpenPassage, askPassageView, askSearchInLabel, ASK_CHEVRON } from './askPollisWebview.js';
import { CompareModelsRunner, compareFigures, ComparePassages, ICompareEnd, ICompareProgress, isClosed, QUESTION_COUNTS, retrievalLine } from './compareModelsRun.js';
import { compareChartsHtml, compareChartsScript, compareCommonScript, compareCss, compareLocalCard, compareSharedText, compareTestSetHeadHtml, compareTestSetHtml, compareTestSetScript, CompareTestSetChoice, evalItemsText, mergeEvalItems, parseEvalItems, STANDARD_TEST_SET, isShippedTestSet, topicLabel } from './compareShared.js';
import { IInstalledModel } from './modelsInstalledPage.js';

// Evaluate Answering Models, from Ask Pollis and Compose > Local AI Models > Evaluate Answering Models... (compose.contribution.ts): the chat
// models of this computer and the cloud models of Ask Pollis, compared on the questions of a test set, the same
// passages and the same instruction for every model, each answer scored against the right answer by the embedding
// model of the search and, if any, rated by one or two judges (compareModelsRun.ts). One page, in four steps: 1, the models to compare; 2, the questions, of the test set chosen,
// the Standard one that Pollis ships or one of the user's, a copy of another (Save As...) or a new one (New Set...),
// those ticked being the ones asked, all when none is; in the user's sets, Change This Set makes them from the
// documents with a model (Make Questions...), adds them by hand (Add, or Add to the Test Set... under an answer of Ask
// Pollis), imports them and deletes the ticked ones, and every set can be exported; 3, the judges, none, one or two, the Repeats and Run;
// 4, the results of the run shown, this one or an earlier one: the figures of each model, then its questions with
// each model's rating, a click on one showing each model's answer side by side. The choices are remembered for the
// next time.

export const COMPARE_MODELS_COMMAND_ID = 'pollis.compareModels';
/** Opens Evaluate Answering Models at Add, with a question, its answer and the passages to choose from: {question, answer, passages}. */
export const COMPARE_MODELS_ADD_COMMAND_ID = 'pollis.compareModels.add';
/** Opens Evaluate Answering Models with the answering strategy of the id given chosen. */
export const COMPARE_MODELS_STRATEGY_COMMAND_ID = 'pollis.compareModels.strategy';

/** The models chosen, by their values, kept for the next time the page opens. */
const CHOSEN_KEY = 'pollis.compareModels.chosen';
/** The judges, one or two, by their values. */
const JUDGES_KEY = 'pollis.compareModels.judges';
const QUESTIONS_BY_KEY = 'pollis.compareModels.questionsBy';
const REPEATS_KEY = 'pollis.compareModels.repeats';
/** The strategy of Ask Pollis the runs use, by its id. */
const STRATEGY_KEY = 'pollis.compareModels.strategy';
/** Where the passages of the runs come from: found (Open Library Answering), the question's own (Open Book Answering) or none (Closed Book Answering). */
const PASSAGES_KEY = 'pollis.compareModels.passages';
/** What Search In chose for Open Library Answering: Auto when empty. */
const SEARCH_IN_KEY = 'pollis.compareModels.searchIn';
const PASSAGES: readonly ComparePassages[] = ['library', 'own', 'none'];

/** `value` if it is one of the passages settings, else Found in the Library. */
function passagesOf(value: unknown): ComparePassages {
	return PASSAGES.find(passages => passages === value) ?? 'library';
}
/** How many questions of each topic Make Questions writes. */
const COUNTS_KEY = 'pollis.compareModels.questionCounts';
/** The most questions of a topic that Make Questions writes at a time. */
const MOST_QUESTIONS = 200;
/** The topics of the questions, in the order of their counts beside Make Questions... */
const TOPICS: readonly AskTopic[] = ['pollis', 'julia', 'panels', 'articles', 'packageApis'];
/** The test set chosen, by its name, the Standard one being ''. */
const TEST_SET_KEY = 'pollis.compareModels.testSet';
/** The questions ticked in each test set, by their text, under the set's name. */
const TICKED_KEY = 'pollis.compareModels.ticked';
/** The model that makes the questions, the first time: a cloud model, so that no local model is downloaded for it. The judge is None the first time. */
const DEFAULT_QUESTIONS_BY = 'claude-sonnet-5-5';
const REPEATS = [1, 2, 3, 5];
/** What a local model needs besides its file, for its context and its work, in bytes. */
const MODEL_MARGIN = 1.5 * 1024 ** 3;

/** A question, its answer and the passages to choose from, for Add. */
export interface ICompareModelsAdd {
	readonly question: string;
	readonly answer: string;
	readonly passages: readonly IAskPollisPassage[];
}

type CompareModelsMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'choose'; readonly chosen: readonly string[] }
	| { readonly command: 'settings'; readonly judges: readonly string[]; readonly questionsBy: string; readonly repeats: number; readonly strategy: string; readonly passages: string; readonly searchIn?: readonly string[]; readonly counts: IAskTopicCounts }
	| { readonly command: 'rows'; readonly rows: number }
	| { readonly command: 'makeQuestions' }
	| { readonly command: 'run'; readonly questions: readonly string[] }
	| { readonly command: 'stop' }
	| { readonly command: 'findPassages'; readonly question: string }
	| { readonly command: 'add'; readonly question: string; readonly answer: string; readonly passage: number }
	| { readonly command: 'delete'; readonly questions: readonly string[] }
	| { readonly command: 'import' }
	| { readonly command: 'chooseSet'; readonly name: string }
	| { readonly command: 'tick'; readonly questions: readonly string[] }
	| { readonly command: 'saveAs' }
	| { readonly command: 'newSet' }
	| { readonly command: 'export' }
	| { readonly command: 'showRun'; readonly id: string }
	| { readonly command: 'deleteRun'; readonly id: string }
	| { readonly command: 'open'; readonly question: number; readonly passage: number };

/** The runner of the window, made the first time the page opens, so that a run goes on when the page is closed. */
let runner: CompareModelsRunner | undefined;

/** The open page, so a second request shows it again. */
let openPage: { readonly input: WebviewInput; add(add: ICompareModelsAdd): void; strategy(id: string): void } | undefined;

function storedList(storageService: IStorageService, key: string, fallback: readonly string[]): string[] {
	try {
		const stored = JSON.parse(storageService.get(key, StorageScope.APPLICATION, JSON.stringify(fallback)));
		return Array.isArray(stored) ? stored.filter((value): value is string => typeof value === 'string') : [...fallback];
	} catch {
		return [...fallback];
	}
}

/** A count of questions for each topic, each a whole number from 0 to MOST_QUESTIONS; QUESTION_COUNTS for what is not one. */
function questionCounts(value: unknown): IAskTopicCounts {
	const given = value && typeof value === 'object' ? value as Record<string, unknown> : {};
	const count = (topic: AskTopic) => typeof given[topic] === 'number' && Number.isFinite(given[topic]) ? Math.min(MOST_QUESTIONS, Math.max(0, Math.round(given[topic] as number))) : QUESTION_COUNTS[topic];
	return Object.fromEntries(TOPICS.map(topic => [topic, count(topic)])) as Record<AskTopic, number>;
}

function storedCounts(storageService: IStorageService): IAskTopicCounts {
	try {
		return questionCounts(JSON.parse(storageService.get(COUNTS_KEY, StorageScope.APPLICATION, '{}')));
	} catch {
		return QUESTION_COUNTS;
	}
}

/** An answer of Ask Pollis without its citations, the right answer to start from, which Add lets you correct. */
function withoutCitations(answer: string): string {
	return answer.replace(/\s*\[\d+(?:\s*,\s*\d+)*\]/g, '').trim();
}

async function openCompareModelsPage(accessor: ServicesAccessor, add?: ICompareModelsAdd, strategyId?: string): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const commandService = accessor.get(ICommandService);
	const storageService = accessor.get(IStorageService);
	const askPollisService = accessor.get(IAskPollisService);
	const toolboxPanelsService = accessor.get(IToolboxPanelsService);
	const strategiesService = accessor.get(IAskPollisStrategiesService);
	const fileService = accessor.get(IFileService);
	const fileDialogService = accessor.get(IFileDialogService);
	const dialogService = accessor.get(IDialogService);
	const hostService = accessor.get(IHostService);
	const quickInputService = accessor.get(IQuickInputService);
	const openerService = accessor.get(IOpenerService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const pathService = accessor.get(IPathService);
	const run = runner ??= accessor.get(IInstantiationService).createInstance(CompareModelsRunner);

	if (openPage && !openPage.input.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage.input, openPage.input.group ?? -1, false);
		if (add) {
			openPage.add(add);
		}
		if (strategyId) {
			openPage.strategy(strategyId);
		}
		return;
	}
	const title = localize('compareModels.title', "Evaluate Answering Models");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.compareModels',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml(storedRows(storageService, 'compareModels', FEWEST_ROWS)));
	const post = (message: object) => webviewInput.webview.postMessage(message);

	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'compareModels', title, COMPAREMODELS_METADATA.compareModels, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));
	// The models listed, those on this computer first
	let listed: readonly (ICompareRunModel & { readonly bytes?: number; readonly provider?: string })[] = [];
	let chosen = storedList(storageService, CHOSEN_KEY, []);
	let judges = storedList(storageService, JUDGES_KEY, []);
	let questionsBy = storageService.get(QUESTIONS_BY_KEY, StorageScope.APPLICATION, DEFAULT_QUESTIONS_BY);
	let repeats = storageService.getNumber(REPEATS_KEY, StorageScope.APPLICATION, 1);
	// Its id as stored, a strategy of a file among them, checked once the files are read
	let strategy = strategyId ?? storageService.get(STRATEGY_KEY, StorageScope.APPLICATION, ASK_DEFAULT_STRATEGY);
	let passages = passagesOf(storageService.get(PASSAGES_KEY, StorageScope.APPLICATION));
	let searchIn = storedList(storageService, SEARCH_IN_KEY, []);
	let counts = storedCounts(storageService);
	const testSet = new CompareTestSetChoice(storageService, askPollisService, run.sets, { testSet: TEST_SET_KEY, ticked: TICKED_KEY }, post, () => toolboxPanelsService.getToolboxes().flatMap(toolbox => toolbox.panels.flatMap(panel => panel.faq)));
	let shown: ICompareRun | undefined;
	// The passages Add chooses from: those an answer of Ask Pollis was written from, or those found for the question
	let addPassages: readonly IAskPollisPassage[] = [];
	let pendingAdd = add;

	const model = (value: string) => listed.find(candidate => candidate.value === value);

	const status = (text: string, error = false) => post({ command: 'status', text, error });

	const postRun = (latest?: string) => {
		const where = (candidate: ICompareRunModel) => candidate.local
			? [localize('compareModels.thisComputer', "This Computer"), candidate.size].filter(part => part).join(' · ')
			: ASK_CLOUD_PROVIDERS[askCloudModel(candidate.value)?.provider ?? 'anthropic'].label;
		post({
			command: 'run',
			run: shown && {
				id: shown.summary.id,
				started: shown.summary.started,
				pollis: shown.summary.pollis,
				judges: shown.summary.judges,
				repeats: shown.summary.repeats,
				strategy: askStrategyLabel(shown.summary.strategy, strategiesService.getStrategies()),
				searchIn: askSearchInLabel(shown.summary.searchIn ?? []),
				openBook: !!shown.summary.openBook,
				closedBook: !!shown.summary.closedBook,
				figures: compareFigures(shown).map(figures => ({ ...figures, where: where(figures) })),
				retrieval: retrievalLine(shown),
				questions: shown.questions.map(question => ({
					question: question.item.question, answer: question.item.answer, source: question.item.source, context: question.item.context, passages: question.passages.map(askPassageView),
					...(isClosed(question.item) ? { choices: question.item.choices, rightChoice: question.item.rightChoice, explanation: question.item.explanation } : {}),
				})),
				answers: shown.answers.map(answer => ({ ...answer, scores: shown!.scores.filter(score => score.answer === answer.id), unrated: shown!.unrated.filter(unrated => unrated.answer === answer.id) })),
			},
			latest,
		});
	};

	const postRuns = async () => {
		const runs = await askPollisService.runs();
		post({ command: 'runs', runs: runs.map(summary => ({ id: summary.id, started: summary.started, models: summary.models.map(candidate => candidate.label), questions: summary.questions })), shown: shown?.summary.id });
	};

	const showRun = async (id: string | undefined) => {
		shown = id ? await askPollisService.loadRun(id) : undefined;
		postRun();
		await postRuns();
	};

	const postAdd = (passages: readonly IAskPollisPassage[], fill?: { readonly question: string; readonly answer: string }) => {
		addPassages = passages;
		post({ command: 'addPassages', passages: passages.map(askPassageView), fill });
	};

	const writeItems = async (next: IAskPollisEvalItem[]) => {
		testSet.items = next;
		await run.sets.write(testSet.name, testSet.items);
		await testSet.postItems();
	};

	/** Whether the test set chosen can be changed, which the Standard one cannot: if not, says so. */
	const changeable = () => {
		if (testSet.name === STANDARD_TEST_SET) {
			status(localize('compareModels.standardFixed', "The Standard test set cannot be changed: Save As... makes a copy of it that you can change, and New Set... an empty one."), true);
			return false;
		}
		if (isShippedTestSet(testSet.name)) {
			status(localize('compareModels.panelFaqFixed', "The Panel FAQ test set cannot be changed: it is made from the FAQ of the panels. Save As... makes a copy of it that you can change."), true);
			return false;
		}
		return true;
	};

	/** A name for a new test set of the user's, which no other set has, or nothing when they cancel. */
	const askSetName = async (prompt: string) => {
		const taken = new Set([localize('compareModels.standard', "Standard"), ...await run.sets.names()].map(name => name.toLowerCase()));
		const name = await quickInputService.input({
			prompt,
			validateInput: async value => {
				const trimmed = value.trim();
				if (!trimmed) {
					return localize('compareModels.setNameEmpty', "The name of the test set.");
				}
				if (/[\\/:*?"<>|]/.test(trimmed) || trimmed.startsWith('.')) {
					return localize('compareModels.setNameCharacters', "A name without / \\ : * ? \" < > |, not starting with a dot.");
				}
				return taken.has(trimmed.toLowerCase()) ? localize('compareModels.setNameTaken', "There is already a test set {0}.", trimmed) : undefined;
			},
		});
		return name?.trim() || undefined;
	};

	/** Saves the questions shown as the new test set of the user's that they name, empty for New Set..., and shows it. */
	const saveSet = async (copy: boolean) => {
		const name = await askSetName(copy
			? localize('compareModels.saveAsPrompt', "The name of the copy of this test set, kept in ~/.pollis/ask/sets")
			: localize('compareModels.newSetPrompt', "The name of the new test set, kept in ~/.pollis/ask/sets"));
		if (!name) {
			return;
		}
		await run.sets.write(name, copy ? testSet.items : []);
		if (copy) {
			testSet.storeTicks(name, testSet.ticked());
		}
		await testSet.choose(name);
		status(localize('compareModels.setSaved', "The test set {0}, with {1} questions, is in ~/.pollis/ask/sets/{0}.json.", name, testSet.items.length));
	};

	// The models on this computer are looked up when the page is ready, shown again or Pollis gets the focus back, so that one downloaded since is listed;
	// with `changed`, they are sent only if they are not the ones listed, so that a click on a model is not lost to the list drawn again;
	// the memory free is looked again each time, for the warning above Run
	const postModels = async (changed?: boolean) => {
		const installed = (await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels').catch(() => undefined) ?? []).filter(installedModel => installedModel.kind !== 'embedding' && installedModel.kind !== 'reranker');
		if (changed && installed.map(installedModel => ASK_LOCAL_PREFIX + installedModel.file).join('\n') === listed.filter(model => model.local).map(model => model.value).join('\n')) {
			await postMemory();
			return;
		}
		listed = [
			...installed.map(installedModel => ({ value: ASK_LOCAL_PREFIX + installedModel.file, label: installedModel.name, local: true, size: installedModel.sizeLabel, bytes: installedModel.bytes })),
			...ASK_CLOUD_MODELS.map(cloud => ({ value: cloud.id, label: cloud.label, local: false, provider: ASK_CLOUD_PROVIDERS[cloud.provider].label })),
		];
		// What Search In offers: the collections of PollisDocuments, then the indexes of the Knowledge Base and of Retrieval-Augmented Generation
		const [collections, indexes] = await Promise.all([askPollisService.collections(), askPollisService.collectionIndexes()]).catch((): [string[], IAskPollisNamedIndex[]] => [[], []]);
		const searchable = [...collections, ...indexes.map(index => index.name).filter(name => !collections.includes(name))];
		post({ command: 'models', models: listed.map(({ value, label, local, size, bytes, provider }) => ({ value, label, local, size, bytes, provider })), chosen, judges, questionsBy, repeats, strategy, passages, searchable, searchIn, counts });
		await postMemory();
	};

	/** Warns, above Run, of the local models chosen that need more memory than is free now, which would answer slowly and slow down the computer. */
	const postMemory = async () => {
		const available = await commandService.executeCommand<number>('language-julia.pollisAvailableMemory').catch(() => undefined);
		// The models compared and the judges on this computer: they run one at a time, so each must fit by itself
		const big = typeof available === 'number' ? listed.filter(model => model.local && (chosen.includes(model.value) || judges.includes(model.value)) && model.bytes && model.bytes + MODEL_MARGIN > available) : [];
		const gigabytes = (bytes: number) => (bytes / 1024 ** 3).toFixed(1);
		const names = big.map(model => localize('compareModels.memoryModel', "{0}, about {1} GB", model.label, gigabytes(model.bytes! + MODEL_MARGIN))).join('; ');
		post({
			command: 'memory', text: !big.length ? '' : big.length === 1
				? localize('compareModels.memoryOne', "Only {0} GB of memory are free now, and {1}: it would answer slowly and slow down the whole computer. Close other apps, or choose a smaller model.", gigabytes(available!), names)
				: localize('compareModels.memoryMany', "Only {0} GB of memory are free now, and these models need more: {1}. They would answer slowly and slow down the whole computer. Close other apps, or choose smaller models.", gigabytes(available!), names),
		});
	};

	const ended = async (end: ICompareEnd) => {
		if (end.items) {
			await testSet.reload();
			status(end.stopped
				? localize('compareModels.madeStopped', "Stopped: {0} questions made, added to the test set.", end.items.length)
				: localize('compareModels.made', "{0} questions made, added to the test set. Read them before a run: a question that its passage does not answer is better deleted.", end.items.length));
		} else if (end.run) {
			shown = end.run.answers.length ? end.run : shown;
			postRun(end.run.answers.length ? end.run.summary.id : undefined);
			await postRuns();
			status(end.error ?? (end.stopped ? localize('compareModels.runStopped', "Stopped: the answers given until then are kept, without the ratings not yet made.") : ''), !!end.error);
		} else {
			status(end.error ?? '', !!end.error);
		}
		post({ command: 'running', running: false });
		// The warning measured again once the models of the run have left memory, which the system takes a moment to free
		await timeout(2000);
		if (!disposables.isDisposed) {
			await postMemory();
		}
	};

	// The answering strategies to run with, Pollis' own and the user's, listed again when a file of them changes
	const postStrategies = () => post({ command: 'strategies', strategies: strategiesService.getStrategies().map(askStrategy => ({ value: askStrategy.id, label: askStrategy.label, title: askStrategy.description })) });
	disposables.add(strategiesService.onDidChange(() => postStrategies()));
	disposables.add(run.onDidProgress((progress: ICompareProgress | undefined) => post({ command: 'progress', progress })));
	disposables.add(run.onDidSample(sample => post({ command: 'sample', sample, memory: run.samples.memory, first: run.samples.samples.length === 1 })));
	disposables.add(run.onDidEnd(end => ended(end)));
	openPage = {
		input: webviewInput,
		add: next => postAdd(next.passages, { question: next.question, answer: withoutCitations(next.answer) }),
		strategy: id => {
			strategy = askPollisStrategy(id, strategiesService.getStrategies()).id;
			storageService.store(STRATEGY_KEY, strategy, StorageScope.APPLICATION, StorageTarget.USER);
			postModels();
		},
	};

	const chosenModels = () => listed.filter(candidate => chosen.includes(candidate.value)).map(({ value, label, local, size }) => ({ value, label, local, size }));

	const makeQuestions = async () => {
		if (!changeable()) {
			return;
		}
		const by = model(questionsBy);
		if (!by) {
			status(localize('compareModels.noQuestionsBy', "Choose the model that makes the questions, beside Make Questions..."), true);
			return;
		}
		const total = TOPICS.reduce((sum, topic) => sum + counts[topic], 0);
		if (!total) {
			status(localize('compareModels.noCounts', "Give how many questions to make, beside Make Questions..."), true);
			return;
		}
		const { confirmed } = await dialogService.confirm({
			message: localize('compareModels.makeConfirm', "Make {0} questions from the documents with {1}?", total, by.label),
			detail: by.local
				? localize('compareModels.makeLocal', "Each question is written from a passage of Pollis' documents, on this computer. It takes some minutes.")
				: localize('compareModels.makeCloud', "Each of {0} passages of Pollis' documents is sent to {1}, with your own key, which writes a question that the passage answers, and its answer.", total, by.label),
			primaryButton: localize({ key: 'compareModels.makeButton', comment: ['&& denotes a mnemonic'] }, "&&Make Questions"),
		});
		if (!confirmed) {
			return;
		}
		post({ command: 'running', running: true });
		run.makeQuestions(questionsBy, testSet.name, counts);
	};

	/** Runs the questions ticked, by their text, or all of them when none is. */
	const startRun = (questions: readonly string[]) => {
		const runJudges = judges.map(model).filter(candidate => !!candidate).map(({ value, label, local, size }) => ({ value, label, local, size }));
		const ticked = new Set(questions);
		post({ command: 'running', running: true });
		run.run(chosenModels(), runJudges, repeats, ticked.size ? testSet.items.filter(item => ticked.has(item.question)) : testSet.items, strategy, passages, searchIn).then(end => {
			// The checks before any work, which end nothing
			if (!end.run && end.error && !run.running) {
				status(end.error, true);
				post({ command: 'running', running: false });
			}
		});
	};

	const importItems = async () => {
		if (!changeable()) {
			return;
		}
		const files = await fileDialogService.showOpenDialog({ title: localize('compareModels.importTitle', "Import Questions"), canSelectMany: false, filters: [{ name: 'JSON', extensions: ['json'] }] });
		if (!files?.length) {
			return;
		}
		const imported = parseEvalItems((await fileService.readFile(files[0])).value.toString());
		if (!imported) {
			status(localize('compareModels.importNone', "That file holds no questions: a test set is a JSON array of questions, each with its source, context, question and answer, as RAGTools.jl writes it."), true);
			return;
		}
		const next = mergeEvalItems(testSet.items, imported);
		const added = next.length - testSet.items.length;
		await writeItems(next);
		status(localize('compareModels.imported', "{0} questions added; {1} were already in the test set.", added, imported.length - added));
	};

	const exportItems = async () => {
		const target = await fileDialogService.showSaveDialog({ title: localize('compareModels.exportTitle', "Export Questions"), filters: [{ name: 'JSON', extensions: ['json'] }] });
		if (target) {
			await fileService.writeFile(target, VSBuffer.fromString(evalItemsText(testSet.items)));
			status(localize('compareModels.exported', "{0} questions exported.", testSet.items.length));
		}
	};

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
	disposables.add(webviewInput.webview.onMessage(async (e: { message: CompareModelsMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			await strategiesService.loaded;
			strategy = askPollisStrategy(strategy, strategiesService.getStrategies()).id;
			postStrategies();
			await postModels();
			await testSet.choose(testSet.name);
			const latest = (await askPollisService.runs())[0];
			await showRun(shown?.summary.id ?? latest?.id);
			post({ command: 'running', running: run.running });
			post({ command: 'progress', progress: run.progress });
			post({ command: 'samples', samples: run.samples });
			if (pendingAdd) {
				openPage?.add(pendingAdd);
				pendingAdd = undefined;
			}
		} else if (message.command === 'choose' && hasKey(message, { chosen: true })) {
			chosen = [...message.chosen];
			storageService.store(CHOSEN_KEY, JSON.stringify(chosen), StorageScope.APPLICATION, StorageTarget.USER);
			await postMemory();
		} else if (message.command === 'settings' && hasKey(message, { judges: true })) {
			judges = message.judges.filter(value => value).slice(0, 2);
			questionsBy = message.questionsBy;
			repeats = REPEATS.includes(message.repeats) ? message.repeats : 1;
			strategy = askPollisStrategy(message.strategy, strategiesService.getStrategies()).id;
			passages = passagesOf(message.passages);
			searchIn = Array.isArray(message.searchIn) ? message.searchIn.filter(name => typeof name === 'string') : [];
			counts = questionCounts(message.counts);
			storageService.store(COUNTS_KEY, JSON.stringify(counts), StorageScope.APPLICATION, StorageTarget.USER);
			storageService.store(JUDGES_KEY, JSON.stringify(judges), StorageScope.APPLICATION, StorageTarget.USER);
			storageService.store(QUESTIONS_BY_KEY, questionsBy, StorageScope.APPLICATION, StorageTarget.USER);
			storageService.store(REPEATS_KEY, repeats, StorageScope.APPLICATION, StorageTarget.USER);
			storageService.store(STRATEGY_KEY, strategy, StorageScope.APPLICATION, StorageTarget.USER);
			storageService.store(PASSAGES_KEY, passages, StorageScope.APPLICATION, StorageTarget.USER);
			storageService.store(SEARCH_IN_KEY, JSON.stringify(searchIn), StorageScope.APPLICATION, StorageTarget.USER);
			await postMemory();
		} else if (message.command === 'rows' && hasKey(message, { rows: true })) {
			storeRows(storageService, 'compareModels', message.rows);
		} else if (message.command === 'makeQuestions') {
			await makeQuestions();
		} else if (message.command === 'run' && hasKey(message, { questions: true })) {
			startRun(message.questions);
		} else if (message.command === 'stop') {
			run.stop();
		} else if (message.command === 'findPassages' && hasKey(message, { question: true }) && message.question.trim()) {
			postAdd((await askPollisService.search({ question: message.question.trim() })).passages);
		} else if (message.command === 'add' && hasKey(message, { passage: true })) {
			const passage = addPassages[message.passage];
			if (!passage || !message.question.trim() || !message.answer.trim() || !changeable()) {
				return;
			}
			const next = mergeEvalItems(testSet.items, [{ source: askPassageLabel(passage), context: passage.text, question: message.question.trim(), answer: message.answer.trim() }]);
			if (next.length === testSet.items.length) {
				status(localize('compareModels.addKnown', "That question is already in the test set."), true);
				return;
			}
			await writeItems(next);
			addPassages = [];
			post({ command: 'added' });
			status(localize('compareModels.addDone', "The question is added to the test set."));
		} else if (message.command === 'delete' && hasKey(message, { questions: true }) && changeable()) {
			const deleted = new Set(message.questions);
			await writeItems(testSet.items.filter(item => !deleted.has(item.question)));
		} else if (message.command === 'import') {
			await importItems();
		} else if (message.command === 'chooseSet' && hasKey(message, { name: true })) {
			await testSet.choose(message.name);
		} else if (message.command === 'tick' && hasKey(message, { questions: true })) {
			testSet.storeTicks(testSet.name, message.questions);
		} else if (message.command === 'saveAs') {
			await saveSet(true);
		} else if (message.command === 'newSet') {
			await saveSet(false);
		} else if (message.command === 'export') {
			await exportItems();
		} else if (message.command === 'showRun' && hasKey(message, { id: true })) {
			await showRun(message.id);
		} else if (message.command === 'deleteRun' && hasKey(message, { id: true })) {
			await askPollisService.deleteRun(message.id);
			await showRun((await askPollisService.runs())[0]?.id);
		} else if (message.command === 'open' && hasKey(message, { question: true })) {
			const passage = shown?.questions[message.question]?.passages[message.passage];
			if (passage) {
				askOpenPassage(commandService, passage);
			}
		}
	}));
}

/** The page: its texts come from here; the models, the questions and the runs from the messages. */
function pageHtml(rows: number): string {
	const text = {
		...compareSharedText(),
		title: localize('compareModels.title', "Evaluate Answering Models"),
		intro: localize('compareModels.introScores', "Which model should answer Ask Pollis? Each model chosen answers every question of the test set from the same passages, with the same instruction, so that what differs is the model alone. Each answer gets an answer score, how near it is to the right answer by the embedding model of the search, and, if you choose one, a judge's rating against the right answer, with {0}. The local models run one after the other, each alone in memory.", '<span class="yellow">PromptingTools.jl</span>'),
		models: localize('compareModels.models', "Models"),
		cloud: localize('compareModels.inTheCloud', "In the Cloud, With Your Own Key"),
		cloudShort: localize('compareModels.cloud', "In the Cloud"),
		provider: localize('compareModels.provider', "Provider"),
		noLocal: localize('compareModels.noLocal', "No chat model on this computer yet: Compose > Local AI Models downloads them."),
		judge: localize('compareModels.judge', "Judge"),
		secondJudge: localize('compareModels.secondJudge', "Second Judge"),
		none: localize('compareModels.none', "None"),
		repeats: localize('compareModels.repeats', "Repeats"),
		strategy: localize('compareModels.strategy', "Strategy"),
		searchIn: localize('compareModels.searchIn', "Search In"),
		strategyHint: localize('compareModels.strategyHint', "The answering strategy of Ask Pollis that finds the passages and asks the models, as Help > Ask Pollis does: the strategies can be compared on the same test set."),
		passages: localize('compareModels.passages', "Passages"),
		passagesLibrary: localize('compareModels.passagesLibrary', "Found in the Library"),
		passagesOwn: localize('compareModels.passagesOwn', "The Question's Own Passage"),
		passagesNone: localize('compareModels.passagesNone', "None"),
		passagesHint: localize('compareModels.passagesHintNone', "Found in the Library: the strategy finds the passages in the documents, as Ask Pollis does, which tests the search and the answer together (Open Library Answering). The Question's Own Passage: each model is given the passage the question was made from, or the wiki of a question of the Panel FAQ, with no search, which tests the answer alone (Open Book Answering). None: each model is given no passage and answers from what it learned in training alone (Closed Book Answering), which shows the questions a model answers without the documents."),
		runOpenLibrary: localize('compareModels.runOpenLibrarySearchIn', "Open Library Answering, with the strategy {0}, Search In: {1}.", '{0}', '{1}'),
		runOpenBook: localize('compareModels.runOpenBook', "Open Book Answering: each model was given the question's own passage."),
		runClosedBook: localize('compareModels.runClosedBook', "Closed Book Answering: each model was given no passage."),
		repeatsHint: localize('compareModels.repeatsHint', "How many times each model answers each question: more than once shows how much its answers vary, in Spread."),
		run: localize('compareModels.run', "Run"),
		runSection: localize('compareModels.runSection', "Run"),
		runIntro: localize('compareModels.runIntroScores', "Each model chosen answers each question to ask, as many times as Repeats, and each answer gets its answer score; the judge, and the second judge if there is one, then rate every answer against the right answer. With Judge set to None, the run costs no tokens beyond the answers."),
		runMany: localize('compareModels.runMany', "Run {0} Questions With {1} Models", '{0}', '{1}'),
		runOneQuestion: localize('compareModels.runOneQuestion', "Run 1 Question With {1} Models", '{0}', '{1}'),
		runOneModel: localize('compareModels.runOneModel', "Run {0} Questions With 1 Model", '{0}', '{1}'),
		runOneOne: localize('compareModels.runOneOne', "Run 1 Question With 1 Model"),
		runNeeds: localize('compareModels.runNeeds', "Choose at least one model, and a test set with questions."),
		stop: localize('compareModels.stop', "Stop"),
		questionsIntro: localize('compareModels.questionsIntro', "The test set, as {0} writes it: each question with the passage it was made from and its right answer. Tick the questions to ask, a click anywhere on a row ticks it; with none ticked, Run asks them all.", '<span class="yellow">RAGTools.jl</span>'),
		standardHint: localize('compareModels.standardHint', "Standard comes with Pollis: a newer Pollis may update it, and it cannot be changed. Save As... makes a copy of it that you can change, and New Set... an empty one."),
		saveAs: localize('compareModels.saveAs', "Save As..."),
		newSet: localize('compareModels.newSet', "New Set..."),
		changeSet: localize('compareModels.changeSet', "Change This Set"),
		standardChange: localize('compareModels.standardChange', "The Standard test set cannot be changed: Save As... makes a copy of it that you can change."),
		changeIntro: localize('compareModels.changeIntroCounts', "Make Questions... writes new questions from the documents with the model chosen in By, as many of each topic as given below it: Pollis, from Pollis' own documents; Julia Language, from the Julia Manual; Topic Panels, from the wikis of the panels and the vignettes of the toolboxes. Add takes one of your own; Import... reads those of a file; Delete Ticked removes the ticked ones."),
		questionCounts: localize('compareModels.questionCounts', "Questions to make:"),
		topics: TOPICS.map(topic => ({ topic, label: topicLabel(topic) })),
		tokensChart: localize('compareModels.tokensChart', "Tokens"),
		tokensRead: localize('compareModels.tokensRead', "{0} read"),
		tokensWritten: localize('compareModels.tokensWritten', "{0} written"),
		chartsHint: localize('compareModels.chartsHint', "Every 2 seconds of the run. The tokens of the answers, then of the judges, as each model's API counts them."),
		phases: { search: localize('compareModels.phaseSearch', "Search"), answer: localize('compareModels.phaseAnswer', "Answers"), judge: localize('compareModels.phaseJudge', "Ratings") },
		makeQuestions: localize('compareModels.makeQuestions', "Make Questions..."),
		questionsBy: localize('compareModels.questionsBy', "By"),
		add: localize('compareModels.add', "Add"),
		import: localize('compareModels.import', "Import..."),
		export: localize('compareModels.export', "Export..."),
		delete: localize('compareModels.deleteTicked', "Delete Ticked"),
		noItems: localize('compareModels.noItemsNow', "No questions yet: Make Questions..., Add and Import..., in Change This Set below, put them in."),
		rightAnswer: localize('compareModels.rightAnswer', "The right answer"),
		passage: localize('compareModels.passage', "The passage it was made from"),
		answers: localize('compareModels.answers', "Answers"),
		answersIntro: localize('compareModels.answersIntroClosed', "The questions of this run, with each model's share of right answers for a closed question, and for an open one its rating by the first judge, or its answer score when the run has no judge, then the seconds each took to answer. Click a question to see each model's answer side by side, with its sources, seconds, the option it chose or its answer score and ratings, and the right answer."),
		answerPlaceholder: localize('compareModels.answerPlaceholder', "The right answer"),
		questionPlaceholder: localize('compareModels.questionPlaceholder', "A question that the documents answer"),
		findPassages: localize('compareModels.findPassages', "Find Passages"),
		choosePassage: localize('compareModels.choosePassage', "The passage that answers it:"),
		cancel: localize('compareModels.cancel', "Cancel"),
		results: localize('compareModels.results', "Results"),
		earlierRuns: localize('compareModels.earlierRuns', "Run"),
		deleteRun: localize('compareModels.deleteRun', "Delete Run"),
		noRuns: localize('compareModels.noRuns', "No run yet: choose the models and the questions, then Run."),
		runLine: localize('compareModels.runLine', "{0}, Pollis {1}: {2} questions, judged by {3}.", '{0}', '{1}', '{2}', '{3}'),
		runLineRepeats: localize('compareModels.runLineRepeats', "{0}, Pollis {1}: {2} questions, each asked {4} times, judged by {3}.", '{0}', '{1}', '{2}', '{3}', '{4}'),
		runLineUnjudged: localize('compareModels.runLineUnjudged', "{0}, Pollis {1}: {2} questions, with no judge.", '{0}', '{1}', '{2}'),
		runLineUnjudgedRepeats: localize('compareModels.runLineUnjudgedRepeats', "{0}, Pollis {1}: {2} questions, each asked {3} times, with no judge.", '{0}', '{1}', '{2}', '{3}'),
		runOption: localize('compareModels.runOption', "{0}: {1}, {2} questions", '{0}', '{1}', '{2}'),
		and: localize('compareModels.and', "{0} and {1}", '{0}', '{1}'),
		where: localize('compareModels.where', "Where"),
		score: localize('compareModels.score', "Score"),
		scoreBy: localize('compareModels.scoreBy', "Score by {0}", '{0}'),
		scoreHint: localize('compareModels.scoreHintRight', "The judge's rating of the answers against the right answers, from 1 to 5, on average; in a run before these ratings, against the passages found, the mean of the five parts after it"),
		answerScore: localize('compareModels.answerScore', "Answer Score"),
		answerScoreHint: localize('compareModels.answerScoreHint', "How near the answers are to the right answers in meaning, on average: the cosine similarity of their embeddings by the embedding model of the search, from -1 to 1, higher being nearer. It needs no judge"),
		answerScoreOf: localize('compareModels.answerScoreOf', "Answer score {0}", '{0}'),
		rightAnswers: localize('compareModels.rightAnswers', "Right Answers"),
		rightAnswersHint: localize('compareModels.rightAnswersHint', "Of the answers to the closed questions, those that chose the right option, and their share. An answer with no option that can be read counts as wrong"),
		rightAnswersValue: localize('compareModels.rightAnswersValue', "{0} of {1} ({2}%)", '{0}', '{1}', '{2}'),
		byChance: localize('compareModels.byChance', "By Chance"),
		byChanceHint: localize('compareModels.byChanceHint', "The probability of as many right answers or more by guessing, each option of a question as likely as the others (the Poisson binomial distribution). The smaller it is, the less the right answers can be put down to luck"),
		byChanceBelow: localize('compareModels.byChanceBelow', "< 0.001"),
		options: localize('compareModels.options', "The options"),
		explanation: localize('compareModels.explanation', "Why"),
		chose: localize('compareModels.chose', "Chose {0}: right", '{0}'),
		choseWrong: localize('compareModels.choseWrong', "Chose {0}: wrong", '{0}'),
		choseNone: localize('compareModels.choseNone', "No option could be read: wrong"),
		relevance: localize('compareModels.relevance', "Relevance"),
		completeness: localize('compareModels.completeness', "Completeness"),
		clarity: localize('compareModels.clarity', "Clarity"),
		consistency: localize('compareModels.consistency', "Consistency"),
		helpfulness: localize('compareModels.helpfulness', "Helpfulness"),
		notScored: localize('compareModels.notScored', "Not Scored"),
		notScoredHint: localize('compareModels.notScoredHint', "The answers not given, or not rated by every judge"),
		firstWordHeading: localize('compareModels.firstWordHeading', "First Word"),
		firstWordHint: localize('compareModels.firstWordHint', "From the question sent to the first word of the answer, in milliseconds, on average"),
		secondsHeading: localize('compareModels.secondsHeading', "Seconds"),
		readingHeading: localize('compareModels.readingHeading', "Reading"),
		readingHint: localize('compareModels.readingHint', "How fast a local model read the instruction, the passages and the question, in tokens per second"),
		writingHeading: localize('compareModels.writingHeading', "Writing"),
		writingHint: localize('compareModels.writingHint', "How fast a local model wrote the answer, in tokens per second"),
		tokens: localize('compareModels.tokens', "Tokens"),
		tokensHint: localize('compareModels.tokensHint', "The tokens read and written for an answer, on average, as the model's API counts them"),
		spread: localize('compareModels.spread', "Spread"),
		spreadHint: localize('compareModels.spreadHint', "How much the rating by the first judge, and the seconds, of the same question vary from one asking to the next: their standard deviation, on average"),
		spreadValue: localize('compareModels.spreadValue', "{0} points, {1} s", '{0}', '{1}'),
		firstWord: localize('compareModels.firstWord', "First word {0} ms", '{0}'),
		seconds: localize('compareModels.seconds', "{0} s", '{0}'),
		secondsOf: localize('compareModels.secondsOf', "{0}, Seconds", '{0}'),
		reading: localize('compareModels.reading', "Reading {0} tokens/s", '{0}'),
		writing: localize('compareModels.writing', "Writing {0} tokens/s", '{0}'),
		ratedBy: localize('compareModels.ratedBy', "{0}: {1}", '{0}', '{1}'),
		notRatedBy: localize('compareModels.notRatedBy', "Not rated by {0}: {1}", '{0}', '{1}'),
		repeat: localize('compareModels.repeat', "Asking {0}", '{0}'),
		noAnswer: localize('compareModels.noAnswer', "No answer."),
	};
	return buildWebviewHtml({
		title: text.title,
		introHtml: text.intro,
		extraCss: `
		${compareCss}
		${askAnswerCss}
		${askMenuCss}
		/* Search In, as a select of the settings */
		#searchInButton { width: 260px; justify-content: space-between; font-size: 13px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 4px 6px; }
		#searchInButton:disabled { opacity: 0.5; cursor: default; }
		#searchInLabel { overflow: hidden; text-overflow: ellipsis; }
`,
		steps: [
			{
				id: 'step-models',
				title: text.models,
				headHtml: '<span class="small" id="chosenCount"></span>',
				bodyHtml: `
	<div class="models">
		${compareLocalCard(text)}
		<div class="card">
			<h3>${text.cloud}</h3>
			<table id="cloudTable">
				<thead><tr>
					<th class="check"><input type="checkbox" class="all" title="${text.chooseAll}"></th>
					<th>${text.model}</th>
					<th>${text.provider}</th>
				</tr></thead>
				<tbody id="cloudBody"></tbody>
			</table>
		</div>
	</div>
`,
			},
			{
				id: 'step-questions',
				title: text.questions,
				headHtml: compareTestSetHeadHtml(text),
				bodyHtml: `
	${compareTestSetHtml(text, text.questionsIntro, `<span class="bar"><button class="action current" id="saveAs">${text.saveAs}</button><button class="action" id="newSet">${text.newSet}</button><button class="action" id="export">${text.export}</button></span>`)}
	<div class="illus-section collapsed change" id="changeSection">
		<button class="illus-toggle" id="changeToggle">
			<span class="illus-chevron"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.976 10.072l-4.054-4.014-.92.92 4.49 4.45.978.01 4.525-4.46-.918-.92-4.101 4.014z"/></svg></span>
			${text.changeSet}
		</button>
		<div class="illus-body">
			<p class="hint" id="standardChange">${text.standardChange}</p>
			<div id="changeTools" hidden>
				<p class="hint">${text.changeIntro}</p>
				<div class="row">
					<span class="bar" id="itemActions">
						<button class="action current" id="makeQuestions">${text.makeQuestions}</button>
						<span class="small">${text.questionsBy}</span> <select id="questionsBy"></select>
						<button class="action" id="add">${text.add}</button>
						<button class="action" id="import">${text.import}</button>
						<button class="action" id="delete" disabled>${text.delete}</button>
					</span>
				</div>
				<div class="row counts" id="counts">
					<span class="small">${text.questionCounts}</span>
					${text.topics.map(({ topic, label }) => `<label><span class="small">${label}</span><input type="number" class="count" id="count-${topic}" min="0" max="${MOST_QUESTIONS}" step="1"></label>`).join('')}
				</div>
				<div class="addForm" id="addForm" hidden>
					<textarea id="addQuestion" rows="2" placeholder="${text.questionPlaceholder}"></textarea>
					<textarea id="addAnswer" rows="3" placeholder="${text.answerPlaceholder}" style="margin-top: 6px"></textarea>
					<div class="row"><span class="bar"><button class="action current" id="findPassages">${text.findPassages}</button></span></div>
					<div id="addChoices"></div>
					<div class="row"><span class="bar"><button class="action current" id="addDone" disabled>${text.add}</button><button class="action" id="addCancel">${text.cancel}</button></span></div>
				</div>
			</div>
		</div>
	</div>
`,
			},
			{
				id: 'step-run',
				title: text.runSection,
				bodyHtml: `
	<p class="hint">${text.runIntro}</p>
	<div class="small warning" id="memory" hidden></div>
	<div class="settings">
		<label class="field"><span class="small">${text.judge}</span><select id="judge"></select></label>
		<label class="field"><span class="small">${text.secondJudge}</span><select id="secondJudge"></select></label>
		<label class="field" title="${text.passagesHint}"><span class="small">${text.passages}</span><select id="passages"><option value="library">${text.passagesLibrary}</option><option value="own">${text.passagesOwn}</option><option value="none">${text.passagesNone}</option></select></label>
		<div class="field"><span class="small">${text.searchIn}</span><span class="anchor"><button class="picker" id="searchInButton" aria-haspopup="menu" aria-expanded="false" aria-label="${text.searchIn}"><span id="searchInLabel"></span>${ASK_CHEVRON}</button><div class="menu left" id="searchInMenu" role="menu" hidden></div></span></div>
		<label class="field" title="${text.strategyHint}"><span class="small">${text.strategy}</span><select id="strategy"></select></label>
		<label class="field" title="${text.repeatsHint}"><span class="small">${text.repeats}</span><select id="repeats">${REPEATS.map(count => `<option value="${count}">${count}</option>`).join('')}</select></label>
		<span class="bar"><button class="action current" id="run" disabled>${text.run}</button></span>
	</div>
	<div class="small status" id="runStatus"></div>
	${compareChartsHtml(text, `<div class="card chart" id="tokensChart"><h3>${text.tokensChart}</h3><div class="now" id="tokensNow"></div><svg role="img" aria-label="${text.tokensChart}"></svg><div class="tip" hidden></div></div>`)}
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
	<p class="hint" id="retrieval"></p>
	<table id="results" hidden>
		<thead><tr id="resultsHead"></tr></thead>
		<tbody id="resultsBody"></tbody>
	</table>
	<div id="answersPart" hidden>
		<h3 class="part">${text.answers}</h3>
		<p class="hint">${text.answersIntro}</p>
		<div class="pager" id="answersPagerTop" hidden></div>
		<table id="answers">
			<thead><tr id="answersHead"></tr></thead>
			<tbody id="answersBody"></tbody>
		</table>
		<div class="pager" id="answersPager" hidden></div>
	</div>
`,
			},
		],
		pageScriptJs: `
	const TEXT = ${JSON.stringify(text)};
	const SPINNER = '${spinnerSvg}';
	${askAnswerScript()}
	${askMenuScript()}
	${rowsChoiceScript()}
	${sortHeadingsScript()}

	let models = [];
	let items = [];
	let run;
	let rows = ${rows};
	let running = false;
	// Whether the test set shown is the Standard one, which cannot be changed
	let standard = true;
	// The questions of the test set: the page shown, their order, and those ticked, which Run asks, by their text
	let page = 0;
	const itemSort = { column: 'number', descending: false };
	const ticked = new Set();
	// The answers of the run shown: the page shown, their order, and the question open, by its place in the run
	let answersPage = 0;
	const answerSort = { column: 'question', descending: false };
	let opened;
	// The messages show under the test set or under Run, for what was clicked last
	let statusId = 'runStatus';

	${compareCommonScript}
	/** The second judge only with a first one: with Judge set to None, it is None too. */
	function secondJudgeEnabled() {
		const second = document.getElementById('secondJudge');
		second.disabled = !document.getElementById('judge').value;
		if (second.disabled) { second.value = ''; }
	}

	// Search In: where the strategy finds the passages, as in Ask Pollis, None aside, which Passages has
	const searchIn = searchInPicker(document.getElementById('searchInButton'), document.getElementById('searchInMenu'), document.getElementById('searchInLabel'), false, settings);

	/** The strategy finds the passages, where Search In says: they have nothing to do when each model is given the question's own passage, or none. */
	function strategyEnabled() {
		const library = document.getElementById('passages').value === 'library';
		document.getElementById('strategy').disabled = !library;
		document.getElementById('searchInButton').disabled = !library;
	}

	function settings() {
		secondJudgeEnabled();
		const counts = Object.fromEntries(TEXT.topics.map(({ topic }) => [topic, Number(document.getElementById('count-' + topic).value) || 0]));
		strategyEnabled();
		vscode.postMessage({ command: 'settings', judges: [document.getElementById('judge').value, document.getElementById('secondJudge').value], questionsBy: document.getElementById('questionsBy').value, repeats: Number(document.getElementById('repeats').value), strategy: document.getElementById('strategy').value, passages: document.getElementById('passages').value, searchIn: searchIn.choice(), counts });
	}

	function fillSelect(select, chosen, none) {
		select.textContent = '';
		if (none) { select.appendChild(new Option(TEXT.none, '')); }
		for (const [label, local] of [[TEXT.thisComputer, true], [TEXT.cloudShort, false]]) {
			const group = models.filter(model => model.local === local);
			if (!group.length) { continue; }
			const optgroup = document.createElement('optgroup');
			optgroup.label = label;
			for (const model of group) {
				const { name, quant } = local ? splitName(model.label) : { name: model.label, quant: '' };
				optgroup.appendChild(new Option(quant ? name + ' (' + quant + ')' : name, model.value));
			}
			select.appendChild(optgroup);
		}
		select.value = models.some(model => model.value === chosen) ? chosen : none ? '' : (models.find(model => !model.local) || models[0] || {}).value || '';
	}

	// The answering strategies to run with, and the one chosen
	let chosenStrategy = '';
	function renderStrategies(strategies) {
		const select = document.getElementById('strategy');
		select.replaceChildren(...strategies.map(askStrategy => {
			const option = new Option(askStrategy.label, askStrategy.value);
			option.title = askStrategy.title;
			return option;
		}));
		if (chosenStrategy) { select.value = chosenStrategy; }
	}

	function renderModels(chosen, judges, questionsBy, repeats, strategy, passages, searchable, chosenSearchIn, counts) {
		renderLocal(chosen);
		const cloud = document.getElementById('cloudBody');
		cloud.textContent = '';
		for (const model of models.filter(model => !model.local)) {
			cloud.appendChild(modelRow(model, [[model.label, 'name'], [model.provider || '', 'small']], chosen));
		}
		updateChosen();
		fillSelect(document.getElementById('judge'), judges[0], true);
		fillSelect(document.getElementById('secondJudge'), judges[1], true);
		secondJudgeEnabled();
		fillSelect(document.getElementById('questionsBy'), questionsBy, false);
		document.getElementById('repeats').value = String(repeats);
		chosenStrategy = strategy;
		document.getElementById('strategy').value = strategy;
		document.getElementById('passages').value = passages;
		searchIn.offer(searchable);
		searchIn.set(chosenSearchIn);
		strategyEnabled();
		for (const { topic } of TEXT.topics) { document.getElementById('count-' + topic).value = String(counts[topic]); }
	}
	document.querySelector('.models').addEventListener('change', event => {
		if (event.target.classList.contains('all')) {
			for (const box of event.target.closest('table').querySelectorAll('tbody input')) { box.checked = event.target.checked; }
		}
		updateChosen();
		vscode.postMessage({ command: 'choose', chosen: chosenValues() });
	});
	for (const id of ['judge', 'secondJudge', 'questionsBy', 'repeats', 'passages', 'strategy', ...TEXT.topics.map(({ topic }) => 'count-' + topic)]) {
		document.getElementById(id).addEventListener('change', settings);
	}

	/** Run, with how many questions it asks and with how many models; Stop while it runs. */
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
		setChangeable();
	}
	/** The tools that change the test set, only for one of the user's; the blue on the first one that can be clicked. */
	function setChangeable() {
		document.getElementById('standardChange').hidden = !standard;
		document.getElementById('changeTools').hidden = standard;
		document.getElementById('makeQuestions').disabled = running;
		document.getElementById('delete').disabled = !ticked.size;
		const bar = document.getElementById('itemActions');
		if (bar.querySelector('button.current')?.disabled) {
			bar.querySelector('button.current').classList.remove('current');
			bar.querySelector('button.action:not(:disabled)')?.classList.add('current');
		}
	}
	${compareTestSetScript}
	function testSetChanged() {
		setChangeable();
		updateRun();
	}
	function renderTables() {
		render();
		renderAnswers();
	}
	/** Sends a message about the test set, whose answer shows under it. */
	function setMessage(message) {
		statusId = 'setStatus';
		vscode.postMessage(message);
	}
	document.getElementById('run').addEventListener('click', () => {
		statusId = 'runStatus';
		vscode.postMessage(running ? { command: 'stop' } : { command: 'run', questions: [...ticked] });
	});
	document.getElementById('makeQuestions').addEventListener('click', () => setMessage({ command: 'makeQuestions' }));
	document.getElementById('import').addEventListener('click', () => setMessage({ command: 'import' }));
	document.getElementById('testSet').addEventListener('change', event => setMessage({ command: 'chooseSet', name: event.target.value }));
	document.getElementById('saveAs').addEventListener('click', () => setMessage({ command: 'saveAs' }));
	document.getElementById('newSet').addEventListener('click', () => setMessage({ command: 'newSet' }));
	document.getElementById('export').addEventListener('click', () => setMessage({ command: 'export' }));
	document.getElementById('delete').addEventListener('click', () => {
		setMessage({ command: 'delete', questions: [...ticked] });
		ticked.clear();
		ticksChanged();
		updateTicked();
	});
	document.getElementById('untick').addEventListener('click', () => {
		ticked.clear();
		ticksChanged();
		render();
	});
	const changeSection = document.getElementById('changeSection');
	document.getElementById('changeToggle').addEventListener('click', () => changeSection.classList.toggle('collapsed'));

	// Add: the question and its answer, then the passage that answers it, among those found or those of the answer of Ask Pollis
	const addForm = document.getElementById('addForm');
	const addQuestion = document.getElementById('addQuestion');
	const addAnswer = document.getElementById('addAnswer');
	const addChoices = document.getElementById('addChoices');
	const addDone = document.getElementById('addDone');
	function openAdd(fill) {
		changeSection.classList.remove('collapsed');
		addForm.hidden = false;
		if (fill) {
			addQuestion.value = fill.question;
			addAnswer.value = fill.answer;
		}
		changeSection.scrollIntoView({ block: 'nearest' });
		addQuestion.focus();
	}
	function closeAdd() {
		addForm.hidden = true;
		addQuestion.value = '';
		addAnswer.value = '';
		addChoices.textContent = '';
		addDone.disabled = true;
	}
	function renderChoices(passages) {
		addChoices.textContent = '';
		addDone.disabled = true;
		if (!passages.length) { return; }
		addChoices.appendChild(element('div', 'small', TEXT.choosePassage));
		passages.forEach((passage, index) => {
			const label = element('label', 'choice');
			const radio = element('input');
			radio.type = 'radio';
			radio.name = 'addPassage';
			radio.value = String(index);
			radio.addEventListener('change', () => { addDone.disabled = !addQuestion.value.trim() || !addAnswer.value.trim(); });
			const body = element('span');
			body.appendChild(element('div', '', passage.title));
			body.appendChild(element('div', 'small', [passage.where, passage.heading].filter(part => part).join(' \\u00b7 ')));
			body.title = passage.text;
			label.append(radio, body);
			addChoices.appendChild(label);
		});
	}
	for (const box of [addQuestion, addAnswer]) {
		box.addEventListener('input', () => { addDone.disabled = !addChoices.querySelector('input:checked') || !addQuestion.value.trim() || !addAnswer.value.trim(); });
	}
	document.getElementById('add').addEventListener('click', () => openAdd());
	document.getElementById('addCancel').addEventListener('click', closeAdd);
	document.getElementById('findPassages').addEventListener('click', () => {
		if (addQuestion.value.trim()) { setMessage({ command: 'findPassages', question: addQuestion.value }); }
	});
	addDone.addEventListener('click', () => {
		const choice = addChoices.querySelector('input:checked');
		if (choice) { setMessage({ command: 'add', question: addQuestion.value, answer: addAnswer.value, passage: Number(choice.value) }); }
	});

	/**
	 * The rating of a model for a question of the run shown, by its place in the run, by the first judge or, in a run
	 * with no judge, its answer score, on average over its askings.
	 */
	function questionScore(index, model) {
		const judge = run.judges[0];
		const answers = run.answers.filter(answer => answer.question === index && answer.model === model);
		const closed = run.questions[index]?.choices;
		const values = closed
			? answers.map(answer => answer.choice === run.questions[index].rightChoice ? 1 : 0)
			: judge
			? answers.flatMap(answer => answer.scores.filter(score => score.judge === judge).map(score => score.final))
			: answers.map(answer => answer.similarity).filter(value => typeof value === 'number');
		return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined;
	}

	/** The seconds a model took to answer a question, the mean of its repeats. */
	function questionSeconds(index, model) {
		const seconds = run.answers.filter(answer => answer.question === index && answer.model === model && answer.timings).map(answer => answer.timings.seconds);
		return seconds.length ? seconds.reduce((sum, value) => sum + value, 0) / seconds.length : undefined;
	}



	/** The figures of an answer: the time to its first word, its seconds and, for a local model, how fast it read and wrote. */
	function answerFigures(timings) {
		const parts = [];
		if (timings.firstWord !== undefined && timings.firstWord !== null) { parts.push(TEXT.firstWord.replace('{0}', String(Math.round(timings.firstWord)))); }
		parts.push(TEXT.seconds.replace('{0}', timings.seconds.toFixed(1)));
		if (timings.reading !== undefined && timings.reading !== null) { parts.push(TEXT.reading.replace('{0}', timings.reading.toFixed(0))); }
		if (timings.writing !== undefined && timings.writing !== null) { parts.push(TEXT.writing.replace('{0}', timings.writing.toFixed(1))); }
		return parts.join(' \\u00b7 ');
	}

	/** Each model's answers to a question of the run side by side, with their Sources, figures and ratings; and the right answer. */
	function detail(asked, columns) {
		const row = element('tr', 'detail');
		const cell = element('td');
		cell.colSpan = columns;
		const right = element('div', 'right');
		const letter = choice => 'ABCDEFGHIJ'[choice];
		if (asked.choices) {
			right.appendChild(element('h3', 'small', TEXT.options));
			const list = element('ol', 'choices');
			list.type = 'A';
			asked.choices.forEach((choice, index) => list.appendChild(element('li', index === asked.rightChoice ? 'chosen' : '', choice)));
			right.appendChild(list);
			if (asked.explanation) { right.appendChild(element('div', 'small', TEXT.explanation + ': ' + asked.explanation)); }
		} else {
			right.appendChild(element('h3', 'small', TEXT.rightAnswer));
			right.appendChild(element('div', '', asked.answer));
		}
		if (asked.source) {
			right.appendChild(element('div', 'small', TEXT.passage + ': ' + asked.source));
			right.lastChild.title = asked.context;
		}
		cell.appendChild(right);
		const columnsBox = element('div', 'columns');
		for (const figures of run.figures) {
			const column = element('div', 'column');
			column.appendChild(element('h4', '', figures.label));
			column.appendChild(element('div', 'small', figures.where));
			const answers = run.answers.filter(answer => answer.question === asked.index && answer.model === figures.value).sort((a, b) => a.repeat - b.repeat);
			if (!answers.length) { column.appendChild(element('div', 'small', TEXT.noAnswer)); }
			for (const answer of answers) {
				const block = element('div', 'asking');
				if (answers.length > 1) { block.appendChild(element('div', 'small', format(TEXT.repeat, answer.repeat + 1))); }
				if (answer.timings) { block.appendChild(element('div', 'small figures', answerFigures(answer.timings))); }
				if (asked.choices && !answer.error) {
					block.appendChild(element('div', 'small', typeof answer.choice !== 'number' ? TEXT.choseNone : format(answer.choice === asked.rightChoice ? TEXT.chose : TEXT.choseWrong, '(' + letter(answer.choice) + ')')));
				}
				if (typeof answer.similarity === 'number') { block.appendChild(element('div', 'small', format(TEXT.answerScoreOf, answer.similarity.toFixed(2)))); }
				for (const score of answer.scores) {
					// The five parts of a rating against the passages, in a run before the ratings against the right answer
					const parts = ['relevance', 'completeness', 'clarity', 'consistency', 'helpfulness'].filter(part => typeof score[part] === 'number').map(part => TEXT[part] + ' ' + score[part]);
					const line = element('div', 'small', format(TEXT.ratedBy, score.judge, score.final.toFixed(2)) + (parts.length ? ' (' + parts.join(' \\u00b7 ') + ')' : ''));
					line.title = score.rationale;
					block.appendChild(line);
				}
				for (const unrated of answer.unrated) { block.appendChild(element('div', 'small error', format(TEXT.notRatedBy, unrated.judge, unrated.error))); }
				if (answer.error) { block.appendChild(element('div', 'small error', answer.error)); }
				const answerBox = element('div', 'answer');
				answerBox.innerHTML = markdown(answer.answer, asked.passages.length);
				const sources = element('div', 'sources');
				renderSources(sources, asked.passages, answer.answer, true, passage => vscode.postMessage({ command: 'open', question: asked.index, passage }));
				block.append(answerBox, sources);
				column.appendChild(block);
			}
			columnsBox.appendChild(column);
		}
		cell.appendChild(columnsBox);
		row.appendChild(cell);
		return row;
	}
	document.getElementById('answersBody').addEventListener('click', event => showSource(event, 'asking'));

	/** The questions of the run shown, with each model's rating: a click on one shows their answers side by side. */
	function renderAnswers() {
		const part = document.getElementById('answersPart');
		part.hidden = !run || !run.questions.length;
		if (part.hidden) { return; }
		const head = document.getElementById('answersHead');
		head.textContent = '';
		const resort = () => {
			answersPage = 0;
			renderAnswers();
		};
		sortHeading(head, TEXT.question, 'question', '', answerSort, resort);
		for (const figures of run.figures) { sortHeading(head, figures.label, 'model:' + figures.value, 'number', answerSort, resort); }
		for (const figures of run.figures) { sortHeading(head, format(TEXT.secondsOf, figures.label), 'seconds:' + figures.value, 'number', answerSort, resort); }
		const asked = run.questions.map((question, index) => ({ ...question, index }));
		const size = rowsPerPage(rows, asked.length);
		const pages = Math.max(1, Math.ceil(asked.length / size));
		answersPage = Math.min(answersPage, pages - 1);
		const body = document.getElementById('answersBody');
		body.textContent = '';
		const value = (question, column) => column.startsWith('model:') ? questionScore(question.index, column.slice(6)) : column.startsWith('seconds:') ? questionSeconds(question.index, column.slice(8)) : question[column] || '';
		for (const question of pageOf(sortedBy(asked, answerSort, value), answersPage)) {
			const row = element('tr', 'item' + (opened === question.index ? ' open' : ''));
			const cell = element('td', 'asked', question.question);
			cell.title = question.answer;
			row.appendChild(cell);
			for (const figures of run.figures) { row.appendChild(element('td', 'number', fixed(questionScore(question.index, figures.value), 2))); }
			for (const figures of run.figures) { row.appendChild(element('td', 'number', fixed(questionSeconds(question.index, figures.value), 1))); }
			row.addEventListener('click', () => {
				opened = opened === question.index ? undefined : question.index;
				renderAnswers();
			});
			body.appendChild(row);
			if (opened === question.index) { body.appendChild(detail(question, 1 + 2 * run.figures.length)); }
		}
		fillPagers(['answersPagerTop', 'answersPager'], asked.length, pages, answersPage, to => { answersPage = to; });
	}

	function renderRun() {
		const head = document.getElementById('resultsHead');
		const body = document.getElementById('resultsBody');
		head.textContent = '';
		body.textContent = '';
		document.getElementById('results').hidden = !run;
		document.getElementById('runLine').textContent = !run ? TEXT.noRuns : (run.judges.length
			? format(run.repeats > 1 ? TEXT.runLineRepeats : TEXT.runLine, new Date(run.started).toLocaleString(), run.pollis, run.questions.length, run.judges.length > 1 ? format(TEXT.and, run.judges[0], run.judges[1]) : run.judges[0], run.repeats)
			: format(run.repeats > 1 ? TEXT.runLineUnjudgedRepeats : TEXT.runLineUnjudged, new Date(run.started).toLocaleString(), run.pollis, run.questions.length, run.repeats)) + ' ' + (run.openBook ? TEXT.runOpenBook : run.closedBook ? TEXT.runClosedBook : format(TEXT.runOpenLibrary, run.strategy, run.searchIn));
		document.getElementById('retrieval').textContent = run ? run.retrieval : '';
		document.getElementById('deleteRun').hidden = !run;
		// A run that ends shows itself, even in a pane left closed
		if (run) { document.getElementById('step-results').classList.remove('collapsed'); }
		if (!run) { return; }
		// A column for each model, the best first by the first judge, or by the answer score in a run with no judge; a row for each figure
		const best = figures => figures.closed ? figures.right / figures.closed : run.judges.length ? figures.scores[0] ?? -1 : figures.similarity ?? -2;
		const sorted = [...run.figures].sort((a, b) => best(b) - best(a));
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
		if (run.figures.some(figures => figures.closed)) {
			line(TEXT.rightAnswers, TEXT.rightAnswersHint, figures => figures.closed ? format(TEXT.rightAnswersValue, figures.right, figures.closed, (100 * figures.right / figures.closed).toFixed(1)) : '-');
			line(TEXT.byChance, TEXT.byChanceHint, figures => typeof figures.byChance !== 'number' ? '-' : figures.byChance < 0.001 ? TEXT.byChanceBelow : figures.byChance.toFixed(3));
		}
		if (run.figures.some(figures => figures.similarity !== undefined)) { line(TEXT.answerScore, TEXT.answerScoreHint, figures => fixed(figures.similarity, 2)); }
		run.judges.forEach((judge, index) => line(run.judges.length > 1 ? format(TEXT.scoreBy, judge) : TEXT.score, TEXT.scoreHint, figures => fixed(figures.scores[index], 2)));
		// The five parts only in a run before the ratings against the right answer
		for (const part of ['relevance', 'completeness', 'clarity', 'consistency', 'helpfulness']) {
			if (run.figures.some(figures => figures[part] !== undefined)) { line(TEXT[part], '', figures => fixed(figures[part], 2)); }
		}
		line(TEXT.notScored, TEXT.notScoredHint, figures => String(figures.notScored));
		line(TEXT.firstWordHeading, TEXT.firstWordHint, figures => fixed(figures.firstWord, 0));
		line(TEXT.secondsHeading, '', figures => fixed(figures.seconds, 1));
		line(TEXT.readingHeading, TEXT.readingHint, figures => fixed(figures.reading, 0));
		line(TEXT.writingHeading, TEXT.writingHint, figures => fixed(figures.writing, 1));
		line(TEXT.tokens, TEXT.tokensHint, figures => figures.tokensRead === undefined && figures.tokensWritten === undefined ? '-' : fixed(figures.tokensRead, 0) + ' / ' + fixed(figures.tokensWritten, 0));
		if (run.repeats > 1) { line(TEXT.spread, TEXT.spreadHint, figures => format(TEXT.spreadValue, fixed(figures.spreadScore, 2), fixed(figures.spreadSeconds, 1))); }
	}

	${compareChartsScript}

	const runsSelect = document.getElementById('runs');
	runsSelect.addEventListener('change', () => vscode.postMessage({ command: 'showRun', id: runsSelect.value }));
	document.getElementById('deleteRun').addEventListener('click', () => { if (run) { vscode.postMessage({ command: 'deleteRun', id: run.id }); } });

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'models') {
			models = message.models;
			renderModels(message.chosen, message.judges, message.questionsBy, message.repeats, message.strategy, message.passages, message.searchable, message.searchIn, message.counts);
		} else if (message.command === 'strategies') {
			renderStrategies(message.strategies);
		} else if (message.command === 'sets') {
			showSets(message);
		} else if (message.command === 'items') {
			if (!standard && !message.items.length) { changeSection.classList.remove('collapsed'); }
			showItems(message);
		} else if (message.command === 'run') {
			if (message.run?.id !== run?.id) {
				opened = undefined;
				answersPage = 0;
			}
			run = message.run;
			renderRun();
			renderAnswers();
		} else if (message.command === 'runs') {
			runsSelect.textContent = '';
			for (const summary of message.runs) {
				runsSelect.appendChild(new Option(format(TEXT.runOption, new Date(summary.started).toLocaleString(), summary.models.join(', '), summary.questions), summary.id));
			}
			runsSelect.value = message.shown || '';
			runsSelect.disabled = !message.runs.length;
		} else if (message.command === 'memory') {
			const memory = document.getElementById('memory');
			memory.textContent = message.text;
			memory.hidden = !message.text;
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
		} else if (message.command === 'addPassages') {
			openAdd(message.fill);
			renderChoices(message.passages);
		} else if (message.command === 'added') {
			closeAdd();
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: COMPARE_MODELS_COMMAND_ID,
			title: localize2('compareModels.action', "Evaluate Answering Models..."),
			category: Categories.Help,
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openCompareModelsPage(accessor);
	}
});

CommandsRegistry.registerCommand(COMPARE_MODELS_ADD_COMMAND_ID, (accessor: ServicesAccessor, add: ICompareModelsAdd) => openCompareModelsPage(accessor, add));
CommandsRegistry.registerCommand(COMPARE_MODELS_STRATEGY_COMMAND_ID, (accessor: ServicesAccessor, strategyId: string) => openCompareModelsPage(accessor, undefined, typeof strategyId === 'string' ? strategyId : undefined));
