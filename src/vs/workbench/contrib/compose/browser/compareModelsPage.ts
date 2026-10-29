/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../base/common/buffer.js';
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
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { FEWEST_ROWS, rowsChoiceCss, rowsChoiceScript, sortHeadingsCss, sortHeadingsScript, sortHint, storedRows, storeRows } from '../../model/browser/webviews/webviewPager.js';
import { spinnerCss, spinnerSvg } from '../../model/browser/webviews/webviewScaffold.js';
import { ASK_CLOUD_MODELS, ASK_CLOUD_PROVIDERS, ASK_LOCAL_PREFIX, askCloudModel, askPassageLabel, IAskPollisEvalItem, IAskPollisPassage, IAskPollisService, ICompareRun, ICompareRunModel } from '../common/askPollis.js';
import { askAnswerCss, askAnswerScript, askOpenPassage, askPassageView } from './askPollisWebview.js';
import { CompareModelsRunner, compareFigures, ICompareEnd, ICompareProgress, evalItemsText, mergeEvalItems, parseEvalItems, QUESTIONS_TO_MAKE, retrievalLine, STANDARD_TEST_SET } from './compareModelsRun.js';
import { IInstalledModel } from './modelsInstalledPage.js';

// Evaluate Models, from Ask Pollis and Compose > Local Models > Evaluate Models... (compose.contribution.ts): the chat
// models of this computer and the cloud models of Ask Pollis, compared on the questions of a test set, the same
// passages and the same instruction for every model, the answers rated by one or two judges with RAGTools.jl
// (compareModelsRun.ts). One page, in four steps: 1, the models to compare; 2, the questions, of the test set chosen,
// the Standard one that Pollis ships or one of the user's, a copy of another (Save As...) or a new one (New Set...),
// those ticked being the ones asked, all when none is; in the user's sets, Change This Set makes them from the
// documents with a model (Make Questions...), adds them by hand (Add, or Add to the Test Set... under an answer of Ask
// Pollis), imports them and deletes the ticked ones, and every set can be exported; 3, the judges, the Repeats and Run;
// 4, the results of the run shown, this one or an earlier one: the figures of each model, then its questions with
// each model's rating, a click on one showing each model's answer side by side. The choices are remembered for the
// next time.

export const COMPARE_MODELS_COMMAND_ID = 'pollis.compareModels';
/** Opens Evaluate Models at Add, with a question, its answer and the passages to choose from: {question, answer, passages}. */
export const COMPARE_MODELS_ADD_COMMAND_ID = 'pollis.compareModels.add';

/** The models chosen, by their values, kept for the next time the page opens. */
const CHOSEN_KEY = 'pollis.compareModels.chosen';
/** The judges, one or two, by their values. */
const JUDGES_KEY = 'pollis.compareModels.judges';
const QUESTIONS_BY_KEY = 'pollis.compareModels.questionsBy';
const REPEATS_KEY = 'pollis.compareModels.repeats';
/** The test set chosen, by its name, the Standard one being ''. */
const TEST_SET_KEY = 'pollis.compareModels.testSet';
/** The questions ticked in each test set, by their text, under the set's name. */
const TICKED_KEY = 'pollis.compareModels.ticked';
/** The judge, and the model that makes the questions, the first time: a cloud model, so that no local model is downloaded for it. */
const DEFAULT_JUDGE = 'claude-sonnet-5-5';
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
	| { readonly command: 'settings'; readonly judges: readonly string[]; readonly questionsBy: string; readonly repeats: number }
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
let openPage: { readonly input: WebviewInput; add(add: ICompareModelsAdd): void } | undefined;

function storedList(storageService: IStorageService, key: string, fallback: readonly string[]): string[] {
	try {
		const stored = JSON.parse(storageService.get(key, StorageScope.APPLICATION, JSON.stringify(fallback)));
		return Array.isArray(stored) ? stored.filter((value): value is string => typeof value === 'string') : [...fallback];
	} catch {
		return [...fallback];
	}
}

function storedTicks(storageService: IStorageService): Record<string, string[]> {
	try {
		const stored = JSON.parse(storageService.get(TICKED_KEY, StorageScope.APPLICATION, '{}'));
		const ticks: Record<string, string[]> = {};
		for (const [name, questions] of Object.entries(stored && typeof stored === 'object' ? stored : {})) {
			if (Array.isArray(questions)) {
				ticks[name] = questions.filter((question): question is string => typeof question === 'string');
			}
		}
		return ticks;
	} catch {
		return {};
	}
}

/** An answer of Ask Pollis without its citations, the right answer to start from, which Add lets you correct. */
function withoutCitations(answer: string): string {
	return answer.replace(/\s*\[\d+(?:\s*,\s*\d+)*\]/g, '').trim();
}

async function openCompareModelsPage(accessor: ServicesAccessor, add?: ICompareModelsAdd): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const commandService = accessor.get(ICommandService);
	const storageService = accessor.get(IStorageService);
	const askPollisService = accessor.get(IAskPollisService);
	const fileService = accessor.get(IFileService);
	const fileDialogService = accessor.get(IFileDialogService);
	const dialogService = accessor.get(IDialogService);
	const hostService = accessor.get(IHostService);
	const quickInputService = accessor.get(IQuickInputService);
	const run = runner ??= accessor.get(IInstantiationService).createInstance(CompareModelsRunner);

	if (openPage && !openPage.input.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage.input, openPage.input.group ?? -1, false);
		if (add) {
			openPage.add(add);
		}
		return;
	}
	const title = localize('compareModels.title', "Evaluate Models");
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
	// The models listed, those on this computer first
	let listed: readonly (ICompareRunModel & { readonly bytes?: number; readonly provider?: string })[] = [];
	let chosen = storedList(storageService, CHOSEN_KEY, []);
	let judges = storedList(storageService, JUDGES_KEY, [DEFAULT_JUDGE]);
	let questionsBy = storageService.get(QUESTIONS_BY_KEY, StorageScope.APPLICATION, DEFAULT_JUDGE);
	let repeats = storageService.getNumber(REPEATS_KEY, StorageScope.APPLICATION, 1);
	let testSet = storageService.get(TEST_SET_KEY, StorageScope.APPLICATION, STANDARD_TEST_SET);
	const ticks = storedTicks(storageService);
	const storeTicks = (name: string, questions: readonly string[]) => {
		if (questions.length) {
			ticks[name] = [...questions];
		} else {
			delete ticks[name];
		}
		storageService.store(TICKED_KEY, JSON.stringify(ticks), StorageScope.APPLICATION, StorageTarget.USER);
	};
	let items: IAskPollisEvalItem[] = [];
	let shown: ICompareRun | undefined;
	// The passages Add chooses from: those an answer of Ask Pollis was written from, or those found for the question
	let addPassages: readonly IAskPollisPassage[] = [];
	let pendingAdd = add;

	const model = (value: string) => listed.find(candidate => candidate.value === value);

	const status = (text: string, error = false) => post({ command: 'status', text, error });

	const postItems = async () => {
		const present = await askPollisService.present(items.map(item => item.context));
		post({ command: 'items', items: items.map((item, index) => ({ question: item.question, answer: item.answer, source: item.source, context: item.context, present: present[index] !== false })) });
	};

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
				figures: compareFigures(shown).map(figures => ({ ...figures, where: where(figures) })),
				retrieval: retrievalLine(shown),
				questions: shown.questions.map(question => ({ question: question.item.question, answer: question.item.answer, source: question.item.source, context: question.item.context, passages: question.passages.map(askPassageView) })),
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
		items = next;
		await run.writeTestSet(testSet, items);
		await postItems();
	};

	/** Whether the test set chosen can be changed, which the Standard one cannot: if not, says so. */
	const changeable = () => {
		if (testSet === STANDARD_TEST_SET) {
			status(localize('compareModels.standardFixed', "The Standard test set cannot be changed: Save As... makes a copy of it that you can change, and New Set... an empty one."), true);
			return false;
		}
		return true;
	};

	/** Shows the test set `name`, a name among the user's sets or the Standard one, and remembers it for the next time. */
	const chooseSet = async (name: string) => {
		const sets = await run.testSets();
		testSet = sets.includes(name) ? name : STANDARD_TEST_SET;
		storageService.store(TEST_SET_KEY, testSet, StorageScope.APPLICATION, StorageTarget.USER);
		post({ command: 'sets', sets, chosen: testSet, ticked: ticks[testSet] ?? [] });
		items = await run.readTestSet(testSet);
		await postItems();
	};

	/** A name for a new test set of the user's, which no other set has, or nothing when they cancel. */
	const askSetName = async (prompt: string) => {
		const taken = new Set([localize('compareModels.standard', "Standard"), ...await run.testSets()].map(name => name.toLowerCase()));
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
		await run.writeTestSet(name, copy ? items : []);
		if (copy) {
			storeTicks(name, ticks[testSet] ?? []);
		}
		await chooseSet(name);
		status(localize('compareModels.setSaved', "The test set {0}, with {1} questions, is in ~/.pollis/ask/sets/{0}.json.", name, items.length));
	};

	// The models on this computer are looked up when the page is ready, shown again or Pollis gets the focus back, so that one downloaded since is listed;
	// with `changed`, they are sent only if they are not the ones listed, so that a click on a model is not lost to the list drawn again;
	// the memory free is looked again each time, for the warning above Run
	const postModels = async (changed?: boolean) => {
		const installed = (await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels').catch(() => undefined) ?? []).filter(installedModel => installedModel.kind !== 'embedding');
		if (changed && installed.map(installedModel => ASK_LOCAL_PREFIX + installedModel.file).join('\n') === listed.filter(model => model.local).map(model => model.value).join('\n')) {
			await postMemory();
			return;
		}
		listed = [
			...installed.map(installedModel => ({ value: ASK_LOCAL_PREFIX + installedModel.file, label: installedModel.name, local: true, size: installedModel.sizeLabel, bytes: installedModel.bytes })),
			...ASK_CLOUD_MODELS.map(cloud => ({ value: cloud.id, label: cloud.label, local: false, provider: ASK_CLOUD_PROVIDERS[cloud.provider].label })),
		];
		post({ command: 'models', models: listed.map(({ value, label, local, size, bytes, provider }) => ({ value, label, local, size, bytes, provider })), chosen, judges, questionsBy, repeats });
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
			items = await run.readTestSet(testSet);
			await postItems();
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
	};

	disposables.add(run.onDidProgress((progress: ICompareProgress | undefined) => post({ command: 'progress', progress })));
	disposables.add(run.onDidEnd(end => ended(end)));
	openPage = {
		input: webviewInput,
		add: next => postAdd(next.passages, { question: next.question, answer: withoutCitations(next.answer) }),
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
		const { confirmed } = await dialogService.confirm({
			message: localize('compareModels.makeConfirm', "Make {0} questions from the documents with {1}?", QUESTIONS_TO_MAKE, by.label),
			detail: by.local
				? localize('compareModels.makeLocal', "Each question is written from a passage of Pollis' documents, on this computer. It takes some minutes.")
				: localize('compareModels.makeCloud', "Each of {0} passages of Pollis' documents is sent to {1}, with your own key, which writes a question that the passage answers, and its answer.", QUESTIONS_TO_MAKE, by.label),
			primaryButton: localize({ key: 'compareModels.makeButton', comment: ['&& denotes a mnemonic'] }, "&&Make Questions"),
		});
		if (!confirmed) {
			return;
		}
		post({ command: 'running', running: true });
		run.makeQuestions(questionsBy, testSet);
	};

	/** Runs the questions ticked, by their text, or all of them when none is. */
	const startRun = (questions: readonly string[]) => {
		const runJudges = judges.map(model).filter(candidate => !!candidate).map(({ value, label, local, size }) => ({ value, label, local, size }));
		if (!runJudges.length) {
			status(localize('compareModels.noJudge', "Choose the judge, beside Run."), true);
			return;
		}
		const ticked = new Set(questions);
		post({ command: 'running', running: true });
		run.run(chosenModels(), runJudges, repeats, ticked.size ? items.filter(item => ticked.has(item.question)) : items).then(end => {
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
		const next = mergeEvalItems(items, imported);
		const added = next.length - items.length;
		await writeItems(next);
		status(localize('compareModels.imported', "{0} questions added; {1} were already in the test set.", added, imported.length - added));
	};

	const exportItems = async () => {
		const target = await fileDialogService.showSaveDialog({ title: localize('compareModels.exportTitle', "Export Questions"), filters: [{ name: 'JSON', extensions: ['json'] }] });
		if (target) {
			await fileService.writeFile(target, VSBuffer.fromString(evalItemsText(items)));
			status(localize('compareModels.exported', "{0} questions exported.", items.length));
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
			await postModels();
			await chooseSet(testSet);
			const latest = (await askPollisService.runs())[0];
			await showRun(shown?.summary.id ?? latest?.id);
			post({ command: 'running', running: run.running });
			post({ command: 'progress', progress: run.progress });
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
			storageService.store(JUDGES_KEY, JSON.stringify(judges), StorageScope.APPLICATION, StorageTarget.USER);
			storageService.store(QUESTIONS_BY_KEY, questionsBy, StorageScope.APPLICATION, StorageTarget.USER);
			storageService.store(REPEATS_KEY, repeats, StorageScope.APPLICATION, StorageTarget.USER);
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
			const next = mergeEvalItems(items, [{ source: askPassageLabel(passage), context: passage.text, question: message.question.trim(), answer: message.answer.trim() }]);
			if (next.length === items.length) {
				status(localize('compareModels.addKnown', "That question is already in the test set."), true);
				return;
			}
			await writeItems(next);
			addPassages = [];
			post({ command: 'added' });
			status(localize('compareModels.addDone', "The question is added to the test set."));
		} else if (message.command === 'delete' && hasKey(message, { questions: true }) && changeable()) {
			const deleted = new Set(message.questions);
			await writeItems(items.filter(item => !deleted.has(item.question)));
		} else if (message.command === 'import') {
			await importItems();
		} else if (message.command === 'chooseSet' && hasKey(message, { name: true })) {
			await chooseSet(message.name);
		} else if (message.command === 'tick' && hasKey(message, { questions: true })) {
			storeTicks(testSet, message.questions);
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
		title: localize('compareModels.title', "Evaluate Models"),
		intro: localize('compareModels.intro', "Which model should answer Ask Pollis? Each model chosen answers every question of the test set from the same passages, with the same instruction, so that what differs is the model alone; a judge then rates each answer, with {0}. The local models run one after the other, each alone in memory.", '<span class="yellow">RAGTools.jl</span>'),
		models: localize('compareModels.models', "Models"),
		thisComputer: localize('compareModels.onThisComputer', "On This Computer"),
		cloud: localize('compareModels.inTheCloud', "In the Cloud, With Your Own Key"),
		cloudShort: localize('compareModels.cloud', "In the Cloud"),
		parameters: localize('compareModels.parameters', "Parameters"),
		quantisation: localize('compareModels.quantisation', "Quantisation"),
		download: localize('compareModels.download', "Download"),
		gigabytes: localize('compareModels.gigabytes', "{0} GB"),
		provider: localize('compareModels.provider', "Provider"),
		chooseAll: localize('compareModels.chooseAll', "Choose all or none"),
		chosenNone: localize('compareModels.chosenNone', "No model chosen"),
		chosenOne: localize('compareModels.chosenOne', "1 model chosen"),
		chosenMany: localize('compareModels.chosenMany', "{0} models chosen"),
		noLocal: localize('compareModels.noLocal', "No chat model on this computer yet: Compose > Local Models downloads them."),
		judge: localize('compareModels.judge', "Judge"),
		secondJudge: localize('compareModels.secondJudge', "Second Judge"),
		none: localize('compareModels.none', "None"),
		repeats: localize('compareModels.repeats', "Repeats"),
		repeatsHint: localize('compareModels.repeatsHint', "How many times each model answers each question: more than once shows how much its answers vary, in Spread."),
		run: localize('compareModels.run', "Run"),
		runSection: localize('compareModels.runSection', "Run"),
		runIntro: localize('compareModels.runIntro', "Each model chosen answers each question to ask, as many times as Repeats; the judge, and the second judge if there is one, then rate every answer."),
		runMany: localize('compareModels.runMany', "Run {0} Questions With {1} Models", '{0}', '{1}'),
		runOneQuestion: localize('compareModels.runOneQuestion', "Run 1 Question With {1} Models", '{0}', '{1}'),
		runOneModel: localize('compareModels.runOneModel', "Run {0} Questions With 1 Model", '{0}', '{1}'),
		runOneOne: localize('compareModels.runOneOne', "Run 1 Question With 1 Model"),
		runNeeds: localize('compareModels.runNeeds', "Choose at least one model, and a test set with questions."),
		stop: localize('compareModels.stop', "Stop"),
		questions: localize('compareModels.questions', "Questions"),
		questionsIntro: localize('compareModels.questionsIntro', "The test set, as {0} writes it: each question with the passage it was made from and its right answer. Tick the questions to ask, a click anywhere on a row ticks it; with none ticked, Run asks them all.", '<span class="yellow">RAGTools.jl</span>'),
		testSet: localize('compareModels.testSet', "Test Set"),
		standard: localize('compareModels.standard', "Standard"),
		standardHint: localize('compareModels.standardHint', "Standard comes with Pollis: a newer Pollis may update it, and it cannot be changed. Save As... makes a copy of it that you can change, and New Set... an empty one."),
		yoursHint: localize('compareModels.yoursHint', "Yours, in {0}: every change is saved as you make it, the ticks too.", '{0}'),
		saveAs: localize('compareModels.saveAs', "Save As..."),
		newSet: localize('compareModels.newSet', "New Set..."),
		countTicked: localize('compareModels.countTicked', "{0} of {1} ticked", '{0}', '{1}'),
		untick: localize('compareModels.untick', "Untick All"),
		tickPage: localize('compareModels.tickPage', "Tick all or none of this page"),
		changeSet: localize('compareModels.changeSet', "Change This Set"),
		standardChange: localize('compareModels.standardChange', "The Standard test set cannot be changed: Save As... makes a copy of it that you can change."),
		changeIntro: localize('compareModels.changeIntro', "Make Questions... writes {0} new questions from the documents with the model chosen in By; Add takes one of your own; Import... reads those of a file; Delete Ticked removes the ticked ones.", QUESTIONS_TO_MAKE),
		makeQuestions: localize('compareModels.makeQuestions', "Make Questions..."),
		questionsBy: localize('compareModels.questionsBy', "By"),
		add: localize('compareModels.add', "Add"),
		import: localize('compareModels.import', "Import..."),
		export: localize('compareModels.export', "Export..."),
		delete: localize('compareModels.deleteTicked', "Delete Ticked"),
		noItems: localize('compareModels.noItemsNow', "No questions yet: Make Questions..., Add and Import..., in Change This Set below, put them in."),
		question: localize('compareModels.question', "Question"),
		source: localize('compareModels.source', "Source"),
		gone: localize('compareModels.gone', "No longer in the documents"),
		rightAnswer: localize('compareModels.rightAnswer', "The right answer"),
		passage: localize('compareModels.passage', "The passage it was made from"),
		answers: localize('compareModels.answers', "Answers"),
		answersIntro: localize('compareModels.answersIntro', "The questions of this run, with each model's rating by the first judge, then the seconds each took to answer. Click a question to see each model's answer side by side, with its sources, seconds and ratings, and the right answer."),
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
		runOption: localize('compareModels.runOption', "{0}: {1}, {2} questions", '{0}', '{1}', '{2}'),
		and: localize('compareModels.and', "{0} and {1}", '{0}', '{1}'),
		model: localize('compareModels.model', "Model"),
		where: localize('compareModels.where', "Where"),
		score: localize('compareModels.score', "Score"),
		scoreBy: localize('compareModels.scoreBy', "Score by {0}", '{0}'),
		scoreHint: localize('compareModels.scoreHint', "The judge's rating of the answers, from 1 to 5, on average: the mean of the five parts after it"),
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
		previous: localize('compareModels.previous', "Previous"),
		next: localize('compareModels.next', "Next"),
		page: localize('compareModels.page', "Page {0} of {1}"),
		count: localize('compareModels.count', "{0} questions"),
		sortHint: sortHint(),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		* { box-sizing: border-box; }
		[hidden] { display: none !important; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 1400px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		h2.section { font-size: 18px; font-weight: 400; margin: 28px 0 6px 0; }
		/* The four steps: the models, the questions, Run and the results */
		.step { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; margin-right: 10px; font-size: 12px; font-weight: 600; color: var(--vscode-badge-foreground); background: var(--vscode-badge-background); vertical-align: 2px; }
		.head { display: flex; align-items: baseline; gap: 16px; }
		.head h2.section { flex: 1; }
		.head .link { font-size: 12px; }
		h3.part { font-size: 14px; font-weight: 600; margin: 24px 0 4px 0; }
		.setHint { margin: 6px 0 0 0; }
		.illus-section { margin: 0 0 20px 0; }
		.illus-toggle { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--vscode-textLink-foreground); font-size: 13px; font-family: var(--vscode-font-family); cursor: pointer; padding: 0 0 6px 0; user-select: none; }
		.illus-toggle:hover { text-decoration: underline; }
		.illus-chevron { display: inline-flex; align-items: center; transition: transform 0.15s; flex-shrink: 0; }
		.illus-section.collapsed .illus-chevron { transform: rotate(-90deg); }
		.illus-section.collapsed .illus-body { display: none; }
		.illus-body { background: var(--vscode-textCodeBlock-background); border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 16px 20px; overflow-x: auto; }
		.illus-section.change { margin-top: 12px; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; line-height: 1.4; max-width: 900px; }
		.hint { color: var(--vscode-descriptionForeground); margin: 0 0 8px 0; line-height: 1.4; max-width: 900px; }
		.small { font-size: 12px; color: var(--vscode-descriptionForeground); line-height: 1.4; }
		textarea { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 6px 8px; width: 100%; resize: vertical; min-height: 40px; line-height: 1.4; }
		select { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 4px 6px; }
		textarea:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		.row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
		.row .grow { flex: 1; }
		.bar { display: flex; gap: 8px; align-items: center; }
		button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; border-radius: 2px; padding: 4px 12px; cursor: pointer; }
		.bar > button.action.current { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button:disabled { opacity: 0.5; cursor: default; }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.link:hover { text-decoration: underline; }
		.models { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: 16px; align-items: start; }
		@media (max-width: 900px) { .models { grid-template-columns: minmax(0, 1fr); } }
		.card { border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 10px 12px 6px 12px; min-width: 0; }
		.card h3 { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); margin: 0 0 6px 0; }
		.models td, .models th { padding: 4px 8px; vertical-align: middle; }
		.models tbody tr:last-child td { border-bottom: none; }
		tr.model { cursor: pointer; }
		tr.model:hover td { background: var(--vscode-list-hoverBackground); }
		tr.model.chosen td.name { font-weight: 600; }
		.settings { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px 20px; margin-top: 16px; }
		.field { display: flex; flex-direction: column; gap: 4px; }
		.field select { width: 260px; }
		.field select#repeats { width: 72px; }
		select#questionsBy { width: 260px; }
		.status { margin: 8px 0; display: flex; align-items: center; gap: 6px; }
		.warning { margin: 8px 0; color: var(--vscode-editorWarning-foreground); }
		.error { color: var(--vscode-errorForeground); }
		/* The packages and the files, in the yellow of the menu paths */
		.yellow { color: #e8a33d; }
		body.vscode-light .yellow { color: #a8650d; }
		table { border-collapse: collapse; width: 100%; }
		th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); vertical-align: top; }
		th { font-weight: 600; color: var(--vscode-descriptionForeground); font-size: 12px; }
		td.number, th.number { text-align: right; white-space: nowrap; }
		tr.item { cursor: pointer; }
		tr.item:hover td { background: var(--vscode-list-hoverBackground); }
		tr.item.open td { background: var(--vscode-list-inactiveSelectionBackground); }
		td.check, th.check { width: 24px; }
		/* A column for each model: as wide as its figures, not the whole page */
		table#results { width: auto; }
		#results td.small { text-align: right; }
		td.origin { width: 24%; }
		tr.detail > td { padding: 12px 8px 16px 8px; }
		.right { margin: 0 0 12px 0; max-width: 900px; }
		.columns { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
		.column { border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 12px; min-width: 0; }
		.column h4 { font-size: 14px; font-weight: 600; margin: 0 0 2px 0; }
		.column .figures { margin: 4px 0 8px 0; }
		.column .asking + .asking { margin-top: 12px; padding-top: 8px; border-top: 1px dashed var(--vscode-widget-border); }
		.addForm { border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 12px; margin: 8px 0; max-width: 900px; }
		.addForm label.choice { display: flex; gap: 8px; align-items: baseline; padding: 4px 0; cursor: pointer; }
		.pager { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 8px; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.pager .link { font-size: 12px; }
		.pager .link:disabled { color: var(--vscode-disabledForeground); cursor: default; text-decoration: none; }
		${rowsChoiceCss}
		${sortHeadingsCss}
		${spinnerCss}
		.percent { font-weight: 600; font-variant-numeric: tabular-nums; margin-right: 8px; }
		${askAnswerCss}
	</style>
</head>
<body>
<div class="container">
	<h1>${text.title}</h1>
	<p class="subtitle">${text.intro}</p>
	<div class="head"><h2 class="section"><span class="step">1</span>${text.models}</h2><span class="small" id="chosenCount"></span></div>
	<div class="models">
		<div class="card">
			<h3>${text.thisComputer}</h3>
			<table id="localTable" hidden>
				<thead><tr>
					<th class="check"><input type="checkbox" class="all" title="${text.chooseAll}"></th>
					<th class="sortable" data-sort="name" data-label="${text.model}" title="${text.sortHint}"></th>
					<th class="sortable number" data-sort="parameters" data-label="${text.parameters}" title="${text.sortHint}"></th>
					<th>${text.quantisation}</th>
					<th class="sortable number" data-sort="bytes" data-label="${text.download}" title="${text.sortHint}"></th>
				</tr></thead>
				<tbody id="localBody"></tbody>
			</table>
			<p class="small" id="noLocal" hidden>${text.noLocal}</p>
		</div>
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

	<div class="head"><h2 class="section"><span class="step">2</span>${text.questions}</h2><span class="small" id="count"></span><button class="link" id="untick" hidden>${text.untick}</button></div>
	<p class="hint">${text.questionsIntro}</p>
	<div class="settings">
		<label class="field"><span class="small">${text.testSet}</span><select id="testSet"></select></label>
		<span class="bar"><button class="action current" id="saveAs">${text.saveAs}</button><button class="action" id="newSet">${text.newSet}</button><button class="action" id="export">${text.export}</button></span>
	</div>
	<p class="small setHint" id="setHint"></p>
	<div class="small status" id="setStatus"></div>
	<p class="hint" id="noItems" hidden>${text.noItems}</p>
	<div class="pager" id="pagerTop" hidden></div>
	<table id="items" hidden>
		<thead><tr id="itemsHead"></tr></thead>
		<tbody id="itemsBody"></tbody>
	</table>
	<div class="pager" id="pager" hidden></div>
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

	<h2 class="section"><span class="step">3</span>${text.runSection}</h2>
	<p class="hint">${text.runIntro}</p>
	<div class="small warning" id="memory" hidden></div>
	<div class="settings">
		<label class="field"><span class="small">${text.judge}</span><select id="judge"></select></label>
		<label class="field"><span class="small">${text.secondJudge}</span><select id="secondJudge"></select></label>
		<label class="field" title="${text.repeatsHint}"><span class="small">${text.repeats}</span><select id="repeats">${REPEATS.map(count => `<option value="${count}">${count}</option>`).join('')}</select></label>
		<span class="bar"><button class="action current" id="run" disabled>${text.run}</button></span>
	</div>
	<div class="small status" id="runStatus"></div>

	<h2 class="section"><span class="step">4</span>${text.results}</h2>
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
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const SPINNER = '${spinnerSvg}';
	${askAnswerScript()}
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
	const itemSort = { column: 'question', descending: false };
	const ticked = new Set();
	// The answers of the run shown: the page shown, their order, and the question open, by its place in the run
	let answersPage = 0;
	const answerSort = { column: 'question', descending: false };
	let opened;
	// The messages show under the test set or under Run, for what was clicked last
	let statusId = 'runStatus';

	function format(template, ...values) {
		return template.replace(/\\{(\\d+)\\}/g, (match, index) => String(values[Number(index)]));
	}
	function fixed(value, digits) {
		return value === undefined || value === null ? '-' : value.toFixed(digits);
	}
	function settings() {
		vscode.postMessage({ command: 'settings', judges: [document.getElementById('judge').value, document.getElementById('secondJudge').value], questionsBy: document.getElementById('questionsBy').value, repeats: Number(document.getElementById('repeats').value) });
	}

	// One blue button in each bar: the last one the pointer was on
	for (const bar of document.querySelectorAll('.bar')) {
		bar.addEventListener('mouseover', event => {
			const button = event.target.closest('button.action');
			if (button && !button.disabled && !button.classList.contains('current')) {
				bar.querySelector('button.current')?.classList.remove('current');
				button.classList.add('current');
			}
		});
	}

	/** A local model's name without its quantisation, which its file name ends with, and the quantisation. */
	function splitName(label) {
		const match = /[-._](?<quant>(?:UD-)?(?:I?Q\\d\\w*|MXFP4\\w*|B?F16|F32))$/i.exec(label);
		return match ? { name: label.slice(0, match.index), quant: match.groups.quant } : { name: label, quant: '' };
	}
	/** The parameters of a size such as 8B or 32x2.4B, for sorting. */
	function parameterCount(size) {
		const match = /^(?:(?<experts>\\d+)x)?(?<count>[\\d.]+)(?<unit>[KMBT])/i.exec(size || '');
		return match ? (Number(match.groups.experts) || 1) * Number(match.groups.count) * { K: 1e3, M: 1e6, B: 1e9, T: 1e12 }[match.groups.unit.toUpperCase()] : 0;
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

	let modelSort = { column: 'name', descending: false };
	/** A model's row: a click anywhere on it ticks it. */
	function modelRow(model, cells, chosen) {
		const row = element('tr', 'model');
		const check = element('td', 'check');
		const box = element('input');
		box.type = 'checkbox';
		box.value = model.value;
		box.checked = chosen.includes(model.value);
		check.appendChild(box);
		row.appendChild(check);
		for (const [text, className] of cells) { row.appendChild(element('td', className, text)); }
		row.addEventListener('click', event => {
			if (event.target !== box) {
				box.checked = !box.checked;
				box.dispatchEvent(new Event('change', { bubbles: true }));
			}
		});
		return row;
	}
	function chosenValues() {
		return [...document.querySelectorAll('.models tbody input:checked')].map(box => box.value);
	}
	/** The boxes that choose all the models of a table, the count beside Models, and Run. */
	function updateChosen() {
		for (const table of document.querySelectorAll('.models table')) {
			const boxes = [...table.querySelectorAll('tbody input')];
			const count = boxes.filter(box => box.checked).length;
			const all = table.querySelector('input.all');
			all.checked = boxes.length > 0 && count === boxes.length;
			all.indeterminate = count > 0 && count < boxes.length;
			for (const box of boxes) { box.closest('tr').classList.toggle('chosen', box.checked); }
		}
		const count = chosenValues().length;
		document.getElementById('chosenCount').textContent = count === 0 ? TEXT.chosenNone : count === 1 ? TEXT.chosenOne : format(TEXT.chosenMany, count);
		updateRun();
	}
	function renderLocal(chosen) {
		const local = models.filter(model => model.local).map(model => ({ ...model, ...splitName(model.label) }));
		document.getElementById('localTable').hidden = !local.length;
		document.getElementById('noLocal').hidden = local.length > 0;
		const key = { name: model => model.name.toLowerCase(), parameters: model => parameterCount(model.size), bytes: model => model.bytes || 0 }[modelSort.column];
		local.sort((a, b) => {
			const x = key(a);
			const y = key(b);
			return (x < y ? -1 : x > y ? 1 : a.name.localeCompare(b.name)) * (modelSort.descending ? -1 : 1);
		});
		const body = document.getElementById('localBody');
		body.textContent = '';
		for (const model of local) {
			const row = modelRow(model, [[model.name, 'name'], [model.size || '-', 'number'], [model.quant || '-', ''], [model.bytes ? format(TEXT.gigabytes, (model.bytes / 1e9).toFixed(1)) : '-', 'number']], chosen);
			row.title = model.label;
			body.appendChild(row);
		}
		for (const header of document.querySelectorAll('#localTable th.sortable')) {
			setSortArrow(header, header.dataset.label, header.dataset.sort === modelSort.column, modelSort.descending);
		}
		updateChosen();
	}
	for (const header of document.querySelectorAll('#localTable th.sortable')) {
		header.addEventListener('click', () => {
			modelSort = { column: header.dataset.sort, descending: modelSort.column === header.dataset.sort && !modelSort.descending };
			renderLocal(chosenValues());
		});
	}

	function renderModels(chosen, judges, questionsBy, repeats) {
		renderLocal(chosen);
		const cloud = document.getElementById('cloudBody');
		cloud.textContent = '';
		for (const model of models.filter(model => !model.local)) {
			cloud.appendChild(modelRow(model, [[model.label, 'name'], [model.provider || '', 'small']], chosen));
		}
		updateChosen();
		fillSelect(document.getElementById('judge'), judges[0], false);
		fillSelect(document.getElementById('secondJudge'), judges[1], true);
		fillSelect(document.getElementById('questionsBy'), questionsBy, false);
		document.getElementById('repeats').value = String(repeats);
	}
	document.querySelector('.models').addEventListener('change', event => {
		if (event.target.classList.contains('all')) {
			for (const box of event.target.closest('table').querySelectorAll('tbody input')) { box.checked = event.target.checked; }
		}
		updateChosen();
		vscode.postMessage({ command: 'choose', chosen: chosenValues() });
	});
	for (const id of ['judge', 'secondJudge', 'questionsBy', 'repeats']) {
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
	/** A message with its packages and files in the yellow. */
	function yellow(text) {
		return esc(text).replace(/(?<name>[A-Za-z0-9]+\\.jl\\b|~\\/\\.pollis\\/[\\w.\\/-]*\\w)/g, '<span class="yellow">$<name></span>');
	}
	function setStatus(text, error, spinning, percent) {
		for (const id of ['setStatus', 'runStatus']) {
			const status = document.getElementById(id);
			status.innerHTML = id === statusId ? yellow(text || '') : '';
			status.classList.toggle('error', id === statusId && !!error);
		}
		if (spinning && text) { document.getElementById(statusId).insertAdjacentHTML('afterbegin', SPINNER + (percent === undefined ? '' : '<span class="percent">' + percent + '%</span>')); }
	}
	/** Keeps the ticks of the test set for the next time. */
	function ticksChanged() {
		vscode.postMessage({ command: 'tick', questions: [...ticked] });
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

	/** The rating of a model for a question of the run shown, by its place in the run, by the first judge, on average over its askings. */
	function questionScore(index, model) {
		const judge = run.judges[0];
		const finals = run.answers.filter(answer => answer.question === index && answer.model === model).flatMap(answer => answer.scores.filter(score => score.judge === judge).map(score => score.final));
		return finals.length ? finals.reduce((sum, value) => sum + value, 0) / finals.length : undefined;
	}

	/** The seconds a model took to answer a question, the mean of its repeats. */
	function questionSeconds(index, model) {
		const seconds = run.answers.filter(answer => answer.question === index && answer.model === model && answer.timings).map(answer => answer.timings.seconds);
		return seconds.length ? seconds.reduce((sum, value) => sum + value, 0) / seconds.length : undefined;
	}

	/** The questions in the order chosen, by a column of text or by a model's rating, those without a value last. */
	function sortedBy(list, sort, value) {
		const empty = cell => cell === undefined || cell === '';
		return [...list].sort((a, b) => {
			const x = value(a, sort.column), y = value(b, sort.column);
			if (empty(x) || empty(y)) {
				return empty(x) && empty(y) ? a.question.localeCompare(b.question) : empty(x) ? 1 : -1;
			}
			const order = typeof x === 'number' ? x - y : x.localeCompare(y);
			return (sort.descending ? -order : order) || a.question.localeCompare(b.question);
		});
	}
	function pageOf(list, current) {
		const size = rowsPerPage(rows, list.length);
		return list.slice(current * size, (current + 1) * size);
	}
	/** A heading that sorts its table by its column, the other way round at a second click; by a model, the best first. */
	function sortHeading(head, label, column, className, sort, resort) {
		const th = element('th', 'sortable' + (className ? ' ' + className : ''));
		th.title = TEXT.sortHint;
		setSortArrow(th, label, sort.column === column, sort.descending);
		th.addEventListener('click', () => {
			sort.descending = sort.column === column ? !sort.descending : column.startsWith('model:');
			sort.column = column;
			resort();
		});
		head.appendChild(th);
	}
	/** The pagers above and below a table, at the page \`current\` of \`pages\`: \`turn\` sets the page to show. */
	function fillPagers(ids, shown, pages, current, turn) {
		for (const pager of ids.map(id => document.getElementById(id))) {
			pager.textContent = '';
			pager.hidden = shown <= ${FEWEST_ROWS};
			if (pages > 1) {
				const link = (label, to) => {
					const button = element('button', 'link', label);
					button.disabled = to < 0 || to >= pages;
					button.addEventListener('click', () => {
						turn(to);
						render();
						renderAnswers();
					});
					return button;
				};
				pager.append(link(TEXT.previous, current - 1), element('span', '', format(TEXT.page, current + 1, pages)), link(TEXT.next, current + 1));
			}
			pager.append(rowsChoice(rows, chosen => {
				turn(firstPageAfter(current, rows, chosen));
				rows = chosen;
				vscode.postMessage({ command: 'rows', rows });
				render();
				renderAnswers();
			}));
		}
	}

	function shownItems() {
		return pageOf(sortedBy(items, itemSort, (item, column) => item[column] || ''), page);
	}
	/** The questions of the test set, to tick those that Run asks: a click anywhere on a row ticks it. */
	function render() {
		const head = document.getElementById('itemsHead');
		head.textContent = '';
		const all = element('th', 'check');
		const allBox = element('input');
		allBox.type = 'checkbox';
		allBox.id = 'tickPage';
		allBox.title = TEXT.tickPage;
		allBox.addEventListener('change', () => {
			for (const item of shownItems()) { if (allBox.checked) { ticked.add(item.question); } else { ticked.delete(item.question); } }
			ticksChanged();
			render();
		});
		all.appendChild(allBox);
		head.appendChild(all);
		const resort = () => {
			page = 0;
			render();
		};
		sortHeading(head, TEXT.question, 'question', '', itemSort, resort);
		sortHeading(head, TEXT.source, 'source', 'origin', itemSort, resort);
		const size = rowsPerPage(rows, items.length);
		const pages = Math.max(1, Math.ceil(items.length / size));
		page = Math.min(page, pages - 1);
		const body = document.getElementById('itemsBody');
		body.textContent = '';
		for (const item of shownItems()) {
			const row = element('tr', 'item');
			const check = element('td', 'check');
			const box = element('input');
			box.type = 'checkbox';
			box.checked = ticked.has(item.question);
			const tick = () => {
				if (box.checked) { ticked.add(item.question); } else { ticked.delete(item.question); }
				ticksChanged();
				updateTicked();
			};
			box.addEventListener('change', tick);
			check.appendChild(box);
			row.appendChild(check);
			const question = element('td', '', item.question);
			question.title = item.answer;
			row.appendChild(question);
			const source = element('td', 'origin small', item.source);
			source.title = item.context;
			if (!item.present) { source.appendChild(element('div', 'error', TEXT.gone)); }
			row.appendChild(source);
			row.addEventListener('click', event => {
				if (event.target !== box) {
					box.checked = !box.checked;
					tick();
				}
			});
			body.appendChild(row);
		}
		fillPagers(['pagerTop', 'pager'], items.length, pages, page, to => { page = to; });
		document.getElementById('items').hidden = !items.length;
		document.getElementById('noItems').hidden = !!items.length;
		updateTicked();
	}
	/** The count of the questions and of those ticked, the box that ticks the page, Delete Ticked and Run. */
	function updateTicked() {
		const shown = shownItems();
		const onPage = shown.filter(item => ticked.has(item.question)).length;
		const allBox = document.getElementById('tickPage');
		if (allBox) {
			allBox.checked = shown.length > 0 && onPage === shown.length;
			allBox.indeterminate = onPage > 0 && onPage < shown.length;
		}
		document.getElementById('count').textContent = !items.length ? '' : ticked.size ? format(TEXT.countTicked, ticked.size, items.length) : format(TEXT.count, items.length);
		document.getElementById('untick').hidden = !ticked.size;
		setChangeable();
		updateRun();
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
		right.appendChild(element('h3', 'small', TEXT.rightAnswer));
		right.appendChild(element('div', '', asked.answer));
		right.appendChild(element('div', 'small', TEXT.passage + ': ' + asked.source));
		right.lastChild.title = asked.context;
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
				for (const score of answer.scores) {
					const line = element('div', 'small', format(TEXT.ratedBy, score.judge, score.final.toFixed(2)) + ' (' + [TEXT.relevance + ' ' + score.relevance, TEXT.completeness + ' ' + score.completeness, TEXT.clarity + ' ' + score.clarity, TEXT.consistency + ' ' + score.consistency, TEXT.helpfulness + ' ' + score.helpfulness].join(' \\u00b7 ') + ')');
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
			const cell = element('td', '', question.question);
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
		document.getElementById('runLine').textContent = run
			? format(run.repeats > 1 ? TEXT.runLineRepeats : TEXT.runLine, new Date(run.started).toLocaleString(), run.pollis, run.questions.length, run.judges.length > 1 ? format(TEXT.and, run.judges[0], run.judges[1]) : run.judges[0] || '-', run.repeats)
			: TEXT.noRuns;
		document.getElementById('retrieval').textContent = run ? run.retrieval : '';
		document.getElementById('deleteRun').hidden = !run;
		if (!run) { return; }
		// A column for each model, the best first by the first judge; a row for each figure
		const sorted = [...run.figures].sort((a, b) => (b.scores[0] ?? -1) - (a.scores[0] ?? -1));
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
		run.judges.forEach((judge, index) => line(run.judges.length > 1 ? format(TEXT.scoreBy, judge) : TEXT.score, TEXT.scoreHint, figures => fixed(figures.scores[index], 2)));
		for (const part of ['relevance', 'completeness', 'clarity', 'consistency', 'helpfulness']) { line(TEXT[part], '', figures => fixed(figures[part], 2)); }
		line(TEXT.notScored, TEXT.notScoredHint, figures => String(figures.notScored));
		line(TEXT.firstWordHeading, TEXT.firstWordHint, figures => fixed(figures.firstWord, 0));
		line(TEXT.secondsHeading, '', figures => fixed(figures.seconds, 1));
		line(TEXT.readingHeading, TEXT.readingHint, figures => fixed(figures.reading, 0));
		line(TEXT.writingHeading, TEXT.writingHint, figures => fixed(figures.writing, 1));
		line(TEXT.tokens, TEXT.tokensHint, figures => figures.tokensRead === undefined && figures.tokensWritten === undefined ? '-' : fixed(figures.tokensRead, 0) + ' / ' + fixed(figures.tokensWritten, 0));
		if (run.repeats > 1) { line(TEXT.spread, TEXT.spreadHint, figures => format(TEXT.spreadValue, fixed(figures.spreadScore, 2), fixed(figures.spreadSeconds, 1))); }
	}

	const runsSelect = document.getElementById('runs');
	runsSelect.addEventListener('change', () => vscode.postMessage({ command: 'showRun', id: runsSelect.value }));
	document.getElementById('deleteRun').addEventListener('click', () => { if (run) { vscode.postMessage({ command: 'deleteRun', id: run.id }); } });

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'models') {
			models = message.models;
			renderModels(message.chosen, message.judges, message.questionsBy, message.repeats);
		} else if (message.command === 'sets') {
			const select = document.getElementById('testSet');
			select.textContent = '';
			select.appendChild(new Option(TEXT.standard, ''));
			for (const name of message.sets) { select.appendChild(new Option(name, name)); }
			select.value = message.chosen;
			standard = !message.chosen;
			ticked.clear();
			for (const question of message.ticked) { ticked.add(question); }
			document.getElementById('setHint').innerHTML = standard
				? esc(TEXT.standardHint)
				: esc(TEXT.yoursHint).replace('{0}', '<span class="yellow">' + esc('~/.pollis/ask/sets/' + message.chosen + '.json') + '</span>');
			setChangeable();
		} else if (message.command === 'items') {
			items = message.items;
			const present = new Set(items.map(item => item.question));
			const before = ticked.size;
			for (const question of [...ticked]) { if (!present.has(question)) { ticked.delete(question); } }
			if (ticked.size !== before) { ticksChanged(); }
			if (!standard && !items.length) { changeSection.classList.remove('collapsed'); }
			render();
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
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: COMPARE_MODELS_COMMAND_ID,
			title: localize2('compareModels.action', "Evaluate Models..."),
			category: Categories.Help,
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openCompareModelsPage(accessor);
	}
});

CommandsRegistry.registerCommand(COMPARE_MODELS_ADD_COMMAND_ID, (accessor: ServicesAccessor, add: ICompareModelsAdd) => openCompareModelsPage(accessor, add));
