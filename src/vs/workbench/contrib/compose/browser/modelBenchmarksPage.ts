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
import { MODELBENCHMARKS_METADATA } from '../../model/browser/webviews/modelBenchmarks.data.js';
import { buildWebviewHtml, spinnerSvg } from '../../model/browser/webviews/webviewScaffold.js';
import { askAnswerScript } from './askPollisWebview.js';
import { ICompareProgress } from './compareModelsRun.js';
import { compareChartsHtml, compareChartsScript, compareCommonScript, compareCss, compareLocalCard, compareSharedText } from './compareShared.js';
import { IBenchmarkAnswer, IBenchmarkEnd, IBenchmarkInfo, IBenchmarkModel, IBenchmarkQuestion, IBenchmarkRun, IBenchmarkSampleRequest, IBenchmarkSettings, ModelBenchmarksRunner } from './modelBenchmarksRun.js';
import { IInstalledModel } from './modelsInstalledPage.js';

// Model Benchmarks, from Compose > Local AI Models > Model Benchmarks... (compose.contribution.ts): the chat models
// of this computer run on published benchmarks, on a stratified random sample of their questions. One page, in five
// steps: 1, the benchmark, downloaded once; 2, the sample: the strata to draw from, how many questions, shared in
// proportion to the strata or equally, and the seed, which draws the same sample again; 3, the models and how they
// answer; 4, Run, which draws the sample and has each model answer its questions, one model after the other and alone
// in memory (modelBenchmarksRun.ts, model_benchmarks.jl); 5, the results of a run: each model's score with its 95%
// interval, its score in each stratum, the answers that could not be read or were cut off, how fast it answered and
// the memory it took, and each question with each model's answer. The choices are remembered for the next time.

export const MODEL_BENCHMARKS_COMMAND_ID = 'pollis.modelBenchmarks';

/** The benchmark chosen, by its id. */
const BENCHMARK_KEY = 'pollis.modelBenchmarks.benchmark';
/** The sample of each benchmark: its size, allocation, seed and the strata left out, under the benchmark's id. */
const SAMPLES_KEY = 'pollis.modelBenchmarks.samples';
/** The models chosen, by their values. */
const CHOSEN_KEY = 'pollis.modelBenchmarks.chosen';
/** How the models answer. */
const SETTINGS_KEY = 'pollis.modelBenchmarks.settings';

/** A benchmark of the page; model_benchmarks.jl has its files, its prompts and its grading. */
interface IBenchmarkEntry {
	readonly id: string;
	readonly name: string;
	readonly measures: string;
	/** What its strata are, or nothing for a benchmark without strata. */
	readonly strata?: string;
	readonly answer: string;
	readonly source: string;
	readonly bytes: number;
}

function benchmarkEntries(): readonly IBenchmarkEntry[] {
	return [
		{
			id: 'mmlu-pro',
			name: 'MMLU-Pro',
			measures: localize('modelBenchmarks.mmluPro', "Knowledge and reasoning in 14 subjects, from law and economics to physics: questions with ten options, harder than those of MMLU."),
			strata: localize('modelBenchmarks.subject', "Subject"),
			answer: localize('modelBenchmarks.mmluProAnswer', "The letter of the option, read from \"the answer is (X)\" as MMLU-Pro's own scripts read it."),
			source: 'https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro',
			bytes: 4187042,
		},
		{
			id: 'gsm8k',
			name: 'GSM8K',
			measures: localize('modelBenchmarks.gsm8k', "Grade-school mathematics: word problems of two to eight steps of arithmetic, answered with a number."),
			answer: localize('modelBenchmarks.gsm8kAnswer', "The number of \"The answer is N\", or else the last number of the answer, compared with the right one."),
			source: 'https://huggingface.co/datasets/openai/gsm8k',
			bytes: 2725633,
		},
	];
}

/**
 * A score a model's makers published on a benchmark, as their model card gives it: the model by its name without its
 * quantisation, lower case; with thinking on or off when the card gives both.
 */
interface IPublishedScore {
	readonly benchmark: string;
	readonly model: string;
	readonly thinking?: boolean;
	readonly score: number;
	readonly setting: string;
	readonly source: string;
}

function publishedScores(): readonly IPublishedScore[] {
	const qwen = 'https://huggingface.co/Qwen/Qwen3.5-0.8B';
	const qwenNoThinking = localize('modelBenchmarks.qwenNoThinking', "Qwen's model card, thinking off; temperature 1.0, top-p 0.95, top-k 20, presence penalty 1.5; full precision");
	const qwenThinking = localize('modelBenchmarks.qwenThinking', "Qwen's model card, thinking on; temperature 1.0, top-p 0.95, top-k 20, presence penalty 1.5; full precision");
	const llama = 'https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md';
	const llamaSetting = localize('modelBenchmarks.llamaSetting', "Meta's model card: 8 worked examples first, the answer worked step by step; bf16");
	const gemmaSetting = localize('modelBenchmarks.gemmaSetting', "Google's model card, for the instruction-tuned model; the card does not give the prompt, the examples, thinking or the precision");
	return [
		{ benchmark: 'mmlu-pro', model: 'gemma-4-e4b-it', score: 0.694, setting: gemmaSetting, source: 'https://huggingface.co/google/gemma-4-E4B-it' },
		{ benchmark: 'mmlu-pro', model: 'qwen3.5-0.8b', thinking: false, score: 0.297, setting: qwenNoThinking, source: qwen },
		{ benchmark: 'mmlu-pro', model: 'qwen3.5-0.8b', thinking: true, score: 0.423, setting: qwenThinking, source: qwen },
		{ benchmark: 'mmlu-pro', model: 'qwen3.5-2b', thinking: false, score: 0.553, setting: qwenNoThinking, source: 'https://huggingface.co/Qwen/Qwen3.5-2B' },
		{ benchmark: 'mmlu-pro', model: 'qwen3.5-2b', thinking: true, score: 0.665, setting: qwenThinking, source: 'https://huggingface.co/Qwen/Qwen3.5-2B' },
		{ benchmark: 'gsm8k', model: 'llama-3.2-1b-instruct', score: 0.444, setting: llamaSetting, source: llama },
		{ benchmark: 'gsm8k', model: 'llama-3.2-3b-instruct', score: 0.777, setting: llamaSetting, source: llama },
	];
}

/** A local model's name without its quantisation, which its file name ends with, lower case, as the published scores name it. */
function plainModelName(label: string): string {
	return label.replace(/[-._](?:UD-)?(?:I?Q\d\w*|MXFP4\w*|B?F16|F32)$/i, '').toLowerCase();
}

/** The score published for `label` on `benchmark`, with thinking as in the run, if its makers published one. */
function publishedScore(benchmark: string, label: string, thinking: boolean): IPublishedScore | undefined {
	const model = plainModelName(label);
	return publishedScores().find(score => score.benchmark === benchmark && score.model === model && (score.thinking === undefined || score.thinking === thinking));
}

/** The sample of a benchmark as the page keeps it: the strata left out rather than those in, so that all are in at first. */
interface IStoredSample {
	readonly size: number;
	readonly allocation: 'proportional' | 'equal';
	readonly seed: number;
	readonly leftOut: readonly string[];
}

const DEFAULT_SAMPLE: IStoredSample = { size: 140, allocation: 'equal', seed: 1, leftOut: [] };
const DEFAULT_SETTINGS: IBenchmarkSettings = { shots: 0, reasoning: true, thinking: false, maxTokens: 2048 };

/** The longest question shown in the table of a run; the whole of it opens with its answers. */
const QUESTION_SHOWN = 400;

/** The longest answer, in tokens, of the answer alone without thinking, as model_benchmarks.jl sets it for such a run. */
const ANSWER_ONLY_TOKENS = 32;

type ModelBenchmarksMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'chooseBenchmark'; readonly id: string }
	| { readonly command: 'download'; readonly id: string }
	| { readonly command: 'sample'; readonly id: string; readonly sample: IStoredSample }
	| { readonly command: 'choose'; readonly chosen: readonly string[] }
	| { readonly command: 'settings'; readonly settings: IBenchmarkSettings }
	| { readonly command: 'rows'; readonly rows: number }
	| { readonly command: 'run' }
	| { readonly command: 'stop' }
	| { readonly command: 'showRun'; readonly id: string }
	| { readonly command: 'deleteRun'; readonly id: string }
	| { readonly command: 'answers'; readonly question: string };

/** The runner of the window, made the first time the page opens, so that a run goes on when the page is closed. */
let runner: ModelBenchmarksRunner | undefined;

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

function readStored<T>(storageService: IStorageService, key: string, fallback: T): T {
	try {
		return JSON.parse(storageService.get(key, StorageScope.APPLICATION, '')) as T;
	} catch {
		return fallback;
	}
}

async function openModelBenchmarksPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const commandService = accessor.get(ICommandService);
	const storageService = accessor.get(IStorageService);
	const hostService = accessor.get(IHostService);
	const openerService = accessor.get(IOpenerService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const run = runner ??= accessor.get(IInstantiationService).createInstance(ModelBenchmarksRunner);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('modelBenchmarks.title', "Model Benchmarks");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.modelBenchmarks',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	const entries = benchmarkEntries();
	webviewInput.webview.setHtml(pageHtml(storedRows(storageService, 'modelBenchmarks', FEWEST_ROWS), entries));
	const post = (message: object) => webviewInput.webview.postMessage(message);

	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'modelBenchmarks', title, MODELBENCHMARKS_METADATA.modelBenchmarks, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));

	let benchmark = storageService.get(BENCHMARK_KEY, StorageScope.APPLICATION, entries[0].id);
	if (!entries.some(entry => entry.id === benchmark)) {
		benchmark = entries[0].id;
	}
	const samples = readStored<{ [id: string]: IStoredSample }>(storageService, SAMPLES_KEY, {});
	let chosen = readStored<string[]>(storageService, CHOSEN_KEY, []);
	let settings = { ...DEFAULT_SETTINGS, ...readStored<Partial<IBenchmarkSettings>>(storageService, SETTINGS_KEY, {}) };
	let listed: readonly (IBenchmarkModel & { readonly bytes?: number })[] = [];
	const infos = new Map<string, IBenchmarkInfo | undefined>();
	/** The questions of each benchmark, by id, read once. */
	const questions = new Map<string, Map<string, IBenchmarkQuestion>>();
	let shown: IBenchmarkRun | undefined;
	let shownAnswers: IBenchmarkAnswer[] = [];

	const status = (text: string, error = false) => post({ command: 'status', text, error });
	const sampleOf = (id: string): IStoredSample => ({ ...DEFAULT_SAMPLE, ...samples[id] });

	const postBenchmarks = async () => {
		for (const entry of entries) {
			infos.set(entry.id, await run.info(entry.id));
		}
		post({
			command: 'benchmarks',
			benchmarks: entries.map(entry => ({ id: entry.id, info: infos.get(entry.id), sample: sampleOf(entry.id) })),
			chosen: benchmark,
		});
	};

	const questionsOf = async (id: string) => {
		let byId = questions.get(id);
		if (!byId) {
			byId = new Map((await run.questions(id)).map(question => [question.id, question]));
			if (byId.size) {
				questions.set(id, byId);
			}
		}
		return byId;
	};

	const postRun = async (latest?: string) => {
		if (!shown) {
			post({ command: 'run', run: undefined, latest });
			return;
		}
		const byId = await questionsOf(shown.benchmark);
		const entry = entries.find(candidate => candidate.id === shown!.benchmark);
		const answersOf = new Map<string, { [model: string]: { extracted?: string | null; correct?: boolean; error?: boolean; cutOff?: boolean } }>();
		for (const answer of shownAnswers) {
			const answers = answersOf.get(answer.id) ?? {};
			answers[answer.model] = { extracted: answer.extracted, correct: answer.correct, error: answer.error !== undefined, cutOff: answer.finish === 'length' };
			answersOf.set(answer.id, answers);
		}
		post({
			command: 'run',
			run: {
				id: shown.id,
				started: shown.started,
				pollis: shown.pollis,
				benchmark: entry?.name ?? shown.benchmark,
				strataLabel: entry?.strata,
				settings: shown.settings,
				sample: { seed: shown.sample.seed, allocation: shown.sample.allocation, size: shown.sample.size, strata: shown.sample.strata },
				figures: (shown.figures ?? []).map(figures => ({ ...figures, size: shown!.models.find(model => model.value === figures.value)?.size, published: publishedScore(shown!.benchmark, figures.label, shown!.settings.thinking) })),
				questions: shown.sample.questions.map((id, index) => {
					const question = byId.get(id);
					const text = question?.question ?? '';
					return {
						number: index + 1,
						id,
						stratum: question?.stratum ?? '',
						question: text.length > QUESTION_SHOWN ? `${text.slice(0, QUESTION_SHOWN)}...` : text,
						right: question?.answer ?? '',
						answers: answersOf.get(id) ?? {},
					};
				}),
			},
			latest,
		});
	};

	const postRuns = async () => {
		const runs = await run.runs();
		post({
			command: 'runs',
			runs: runs.map(summary => ({ id: summary.id, started: summary.started, benchmark: entries.find(entry => entry.id === summary.benchmark)?.name ?? summary.benchmark, models: summary.models.map(model => model.label), questions: summary.sample.size })),
			shown: shown?.id,
		});
	};

	const showRun = async (id: string | undefined, latest?: string) => {
		shown = id ? await run.loadRun(id) : undefined;
		shownAnswers = shown ? await run.loadAnswers(shown.id) : [];
		await postRun(latest);
		await postRuns();
	};

	/** The whole question and each model's answer to it, in the run shown. */
	const postAnswers = async (id: string) => {
		if (!shown) {
			return;
		}
		const question = (await questionsOf(shown.benchmark)).get(id);
		post({
			command: 'answers',
			question: id,
			text: question?.question ?? '',
			choices: question?.choices ?? [],
			right: question?.answer ?? '',
			answers: shownAnswers.filter(answer => answer.id === id).map(answer => ({
				model: answer.model,
				label: shown!.models.find(model => model.value === answer.model)?.label ?? answer.model,
				text: answer.error ?? answer.text ?? '',
				extracted: answer.extracted,
				correct: answer.correct,
				error: answer.error !== undefined,
				cutOff: answer.finish === 'length',
			})),
		});
	};

	// The chat models on this computer are looked up when the page is ready, shown again or Pollis gets the focus back, so that one downloaded since is listed;
	// with `changed`, they are sent only if they are not the ones listed, so that a click on a model is not lost to the list drawn again
	const postModels = async (changed?: boolean) => {
		const installed = (await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels').catch(() => undefined) ?? []).filter(installedModel => installedModel.kind !== 'embedding' && installedModel.kind !== 'reranker');
		if (changed && installed.map(installedModel => installedModel.value ?? installedModel.file).join('\n') === listed.map(model => model.value).join('\n')) {
			return;
		}
		listed = installed.map(installedModel => ({ value: installedModel.value ?? installedModel.file, label: installedModel.name, size: installedModel.sizeLabel, bytes: installedModel.bytes }));
		post({ command: 'models', models: listed.map(({ value, label, size, bytes }) => ({ value, label, local: true, size, bytes })), chosen });
	};

	const ended = async (end: IBenchmarkEnd) => {
		if (end.info) {
			await postBenchmarks();
			status(localize('modelBenchmarks.downloaded', "{0} downloaded: {1} questions.", entries.find(entry => entry.id === end.info!.benchmark)?.name ?? end.info.benchmark, end.info.count));
		} else if (end.run) {
			await showRun(end.run, end.run);
			status(end.error ?? (end.stopped ? localize('modelBenchmarks.runStopped', "Stopped: the questions answered until then are shown.") : ''), !!end.error);
		} else {
			status(end.error ?? '', !!end.error);
		}
		post({ command: 'running', running: false });
	};

	const startRun = () => {
		const info = infos.get(benchmark);
		if (!info) {
			status(localize('modelBenchmarks.notDownloaded', "Download the benchmark first, above."), true);
			return;
		}
		const stored = sampleOf(benchmark);
		const strata = info.strata.map(stratum => stratum.name).filter(name => !stored.leftOut.includes(name));
		const sample: IBenchmarkSampleRequest = { size: stored.size, allocation: stored.allocation, seed: stored.seed, strata: strata.length === info.strata.length ? undefined : strata };
		post({ command: 'running', running: true });
		run.run(benchmark, sample, settings, listed.filter(model => chosen.includes(model.value)).map(({ value, label, size }) => ({ value, label, size }))).then(end => {
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
	// The run running shown in Results, each answer as it is kept
	disposables.add(run.onDidAnswer(id => showRun(id)));
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
	disposables.add(webviewInput.webview.onMessage(async (e: { message: ModelBenchmarksMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			post({ command: 'settings', settings });
			await postBenchmarks();
			await postModels();
			await showRun(shown?.id ?? (await run.runs())[0]?.id);
			post({ command: 'running', running: run.running });
			post({ command: 'progress', progress: run.progress });
			post({ command: 'samples', samples: run.samples });
		} else if (message.command === 'chooseBenchmark' && hasKey(message, { id: true })) {
			benchmark = message.id;
			storageService.store(BENCHMARK_KEY, benchmark, StorageScope.APPLICATION, StorageTarget.USER);
		} else if (message.command === 'download' && hasKey(message, { id: true })) {
			const entry = entries.find(candidate => candidate.id === message.id);
			if (entry) {
				post({ command: 'running', running: true });
				run.download(entry.id, entry.name).then(end => {
					if (!end.info && end.error && !run.running) {
						status(end.error, true);
						post({ command: 'running', running: false });
					}
				});
			}
		} else if (message.command === 'sample' && hasKey(message, { id: true, sample: true })) {
			samples[message.id] = message.sample;
			storageService.store(SAMPLES_KEY, JSON.stringify(samples), StorageScope.APPLICATION, StorageTarget.USER);
		} else if (message.command === 'choose' && hasKey(message, { chosen: true })) {
			chosen = [...message.chosen];
			storageService.store(CHOSEN_KEY, JSON.stringify(chosen), StorageScope.APPLICATION, StorageTarget.USER);
		} else if (message.command === 'settings' && hasKey(message, { settings: true })) {
			settings = { ...DEFAULT_SETTINGS, ...message.settings };
			storageService.store(SETTINGS_KEY, JSON.stringify(settings), StorageScope.APPLICATION, StorageTarget.USER);
		} else if (message.command === 'rows' && hasKey(message, { rows: true })) {
			storeRows(storageService, 'modelBenchmarks', message.rows);
		} else if (message.command === 'run') {
			startRun();
		} else if (message.command === 'stop') {
			run.stop();
		} else if (message.command === 'showRun' && hasKey(message, { id: true })) {
			await showRun(message.id);
		} else if (message.command === 'deleteRun' && hasKey(message, { id: true })) {
			await run.deleteRun(message.id);
			await showRun((await run.runs())[0]?.id);
		} else if (message.command === 'answers' && hasKey(message, { question: true })) {
			await postAnswers(message.question);
		}
	}));
}

/** The page: its texts come from here; the benchmarks, the models and the runs from the messages. */
function pageHtml(rows: number, entries: readonly IBenchmarkEntry[]): string {
	const text = {
		...compareSharedText(),
		title: localize('modelBenchmarks.title', "Model Benchmarks"),
		intro: localize('modelBenchmarks.intro', "How well do the chat models of this computer do on published benchmarks? Choose a benchmark, draw a stratified random sample of its questions, and each model chosen answers them, one after the other, alone in memory. Each answer is graded as the benchmark grades it, and each model has its score with its 95% interval, its score in each stratum, how fast it answered and the memory it took."),
		benchmarkSection: localize('modelBenchmarks.benchmarkSection', "Benchmark"),
		benchmarkIntro: localize('modelBenchmarks.benchmarkIntro', "Each benchmark is downloaded once from Hugging Face into {0}, its questions and the worked examples that a prompt can show first.", '{0}'),
		benchmark: localize('modelBenchmarks.benchmark', "Benchmark"),
		measures: localize('modelBenchmarks.measures', "What It Measures"),
		answerRead: localize('modelBenchmarks.answerRead', "Answer Graded"),
		strataColumn: localize('modelBenchmarks.strataColumn', "Strata"),
		downloadedColumn: localize('modelBenchmarks.downloadedColumn', "On This Computer"),
		notDownloaded: localize('modelBenchmarks.notDownloadedYet', "Not yet"),
		downloadButton: localize('modelBenchmarks.downloadButton', "Download {0}", '{0}'),
		downloadAgain: localize('modelBenchmarks.downloadAgain', "Downloaded on {0}: {1} questions.", '{0}', '{1}'),
		downloadSize: localize('modelBenchmarks.downloadSize', "{0} MB", '{0}'),
		sourceLink: localize('modelBenchmarks.sourceLink', "Source"),
		noStrata: localize('modelBenchmarks.noStrata', "None"),
		sampleSection: localize('modelBenchmarks.sampleSection', "Sample"),
		sampleIntro: localize('modelBenchmarks.sampleIntro', "A stratified random sample: the questions of each stratum ticked are drawn at random, as many as the allocation gives it, at least one each when the sample allows. The same seed draws the same sample again, so that runs of different models or settings ask the same questions."),
		sampleIntroSimple: localize('modelBenchmarks.sampleIntroSimple', "A simple random sample: {0} has no strata. The same seed draws the same sample again, so that runs of different models or settings ask the same questions.", '{0}'),
		sampleNeeds: localize('modelBenchmarks.sampleNeeds', "Download the benchmark above to draw its sample."),
		size: localize('modelBenchmarks.size', "Questions"),
		allocation: localize('modelBenchmarks.allocation', "Allocation"),
		equal: localize('modelBenchmarks.equal', "Equal: as Many in Each Stratum"),
		proportional: localize('modelBenchmarks.proportional', "Proportional to Each Stratum"),
		seed: localize('modelBenchmarks.seed', "Seed"),
		newSeed: localize('modelBenchmarks.newSeed', "New Seed"),
		stratum: localize('modelBenchmarks.stratum', "Stratum"),
		population: localize('modelBenchmarks.population', "Questions"),
		inSample: localize('modelBenchmarks.inSample', "In the Sample"),
		tickAllStrata: localize('modelBenchmarks.tickAllStrata', "Tick all or none of the strata"),
		precision: localize('modelBenchmarks.precision', "{0} questions of the {1} of the strata ticked: the 95% interval of a score is at most {2} points on either side.", '{0}', '{1}', '{2}'),
		precisionNone: localize('modelBenchmarks.precisionNone', "{0} questions of the {1} of the strata ticked. A stratum with one question has no variance that can be measured: with two questions at least in each, the score has its 95% interval.", '{0}', '{1}'),
		modelsSection: localize('modelBenchmarks.modelsSection', "Models"),
		noLocal: localize('modelBenchmarks.noLocal', "No chat model on this computer yet: Compose > Local AI Models downloads them."),
		examples: localize('modelBenchmarks.examples', "Examples First"),
		examplesNone: localize('modelBenchmarks.examplesNone', "None"),
		answers: localize('modelBenchmarks.answers', "Answers"),
		reasoningOn: localize('modelBenchmarks.reasoningOn', "Worked Step by Step"),
		reasoningOff: localize('modelBenchmarks.reasoningOff', "The Answer Only"),
		thinking: localize('modelBenchmarks.thinking', "Thinking"),
		thinkingOff: localize('modelBenchmarks.thinkingOff', "Off"),
		thinkingOn: localize('modelBenchmarks.thinkingOn', "On, for the Models That Think"),
		maxTokens: localize('modelBenchmarks.maxTokens', "Longest Answer, Tokens"),
		settingsHint: localize('modelBenchmarks.settingsHint', "The examples are the benchmark's own worked answers, shown before each question. An answer longer than the longest allowed is cut off, and counted as such in the results."),
		answerOnlyTokens: localize('modelBenchmarks.answerOnlyTokens', "The answer alone, with thinking off, is cut off at {0} tokens: room for the answer and a short sentence.", ANSWER_ONLY_TOKENS),
		runSection: localize('modelBenchmarks.runSection', "Run"),
		runIntro: localize('modelBenchmarks.runIntro', "The sample is drawn, then each model chosen, one after the other and alone in memory, answers its questions. A run can be stopped: the answers given until then are kept."),
		run: localize('modelBenchmarks.run', "Run"),
		runMany: localize('modelBenchmarks.runMany', "Run {0} Questions With {1} Models", '{0}', '{1}'),
		runOneModel: localize('modelBenchmarks.runOneModel', "Run {0} Questions With 1 Model", '{0}', '{1}'),
		runNeeds: localize('modelBenchmarks.runNeeds', "Download the benchmark, choose at least one model and a sample of one question at least."),
		stop: localize('modelBenchmarks.stop', "Stop"),
		chartsHint: localize('modelBenchmarks.chartsHint', "Every 2 seconds of the run."),
		tokensChart: localize('compareModels.tokensChart', "Tokens"),
		tokensRead: localize('compareModels.tokensRead', "{0} read"),
		tokensWritten: localize('compareModels.tokensWritten', "{0} written"),
		phases: { answer: localize('modelBenchmarks.phaseAnswer', "Answering") },
		results: localize('modelBenchmarks.results', "Results"),
		earlierRuns: localize('modelBenchmarks.earlierRuns', "Run"),
		deleteRun: localize('modelBenchmarks.deleteRun', "Delete Run"),
		noRuns: localize('modelBenchmarks.noRuns', "No run yet: choose the benchmark, the sample and the models, then Run."),
		runLine: localize('modelBenchmarks.runLine', "{0}, Pollis {1}: {2}, {3} questions drawn with the seed {4}, {5} allocation.", '{0}', '{1}', '{2}', '{3}', '{4}', '{5}'),
		benchmarkRevision: localize('modelBenchmarks.benchmarkRevision', "{0} at revision {1}", '{0}', '{1}'),
		settingsLine: localize('modelBenchmarks.settingsLine', "{0} examples first; {1}; thinking {2}; at most {3} tokens an answer.", '{0}', '{1}', '{2}', '{3}'),
		runOption: localize('modelBenchmarks.runOption', "{0}: {1}, {2}, {3} questions", '{0}', '{1}', '{2}', '{3}'),
		where: localize('modelBenchmarks.where', "Where"),
		score: localize('modelBenchmarks.score', "Score"),
		scoreHint: localize('modelBenchmarks.scoreHint', "The share of right answers, each stratum weighted by its share of the questions of the strata ticked"),
		interval: localize('modelBenchmarks.interval', "95% Interval"),
		intervalHint: localize('modelBenchmarks.intervalHint', "The points on either side of the score within which the score on all the questions of the strata ticked lies, 95 times in 100; none when a stratum has one question only"),
		right: localize('modelBenchmarks.right', "Right Answers"),
		rightOf: localize('modelBenchmarks.rightOf', "{0} of {1}", '{0}', '{1}'),
		byChance: localize('modelBenchmarks.byChance', "By Chance"),
		byChanceHint: localize('modelBenchmarks.byChanceHint', "The probability that answers picked at random among each question's options would get as many right or more; a dash for a benchmark whose answers are numbers"),
		byChanceBelow: localize('modelBenchmarks.byChanceBelow', "< 0.001"),
		unread: localize('modelBenchmarks.unread', "Could Not Be Read"),
		unreadHint: localize('modelBenchmarks.unreadHint', "The answers in which no answer could be found, counted as wrong"),
		cutOff: localize('modelBenchmarks.cutOff', "Cut Off"),
		cutOffHint: localize('modelBenchmarks.cutOffHint', "The answers that reached the longest allowed before they ended"),
		firstToken: localize('modelBenchmarks.firstToken', "First Token, ms"),
		firstTokenHint: localize('modelBenchmarks.firstTokenHint', "The milliseconds from the question sent to the first token of the answer, the median: reading the question, then writing one token, as llama-server measures them"),
		reading: localize('modelBenchmarks.reading', "Reading, Tokens/s"),
		readingHint: localize('modelBenchmarks.readingHint', "How fast the model read the prompt, the median"),
		writing: localize('modelBenchmarks.writing', "Writing, Tokens/s"),
		writingHint: localize('modelBenchmarks.writingHint', "How fast the model wrote its answer, the median"),
		seconds: localize('modelBenchmarks.seconds', "Seconds an Answer"),
		secondsHint: localize('modelBenchmarks.secondsHint', "From the question sent to the end of the answer, on average"),
		tokens: localize('modelBenchmarks.tokens', "Tokens an Answer"),
		tokensHint: localize('modelBenchmarks.tokensHint', "The tokens of an answer, on average"),
		memory: localize('modelBenchmarks.memory', "Memory, GB"),
		memoryHint: localize('modelBenchmarks.memoryHint', "The memory the model took: the memory free before its server started, less the least memory free while it answered"),
		failed: localize('modelBenchmarks.failedAnswers', "Not Answered"),
		failedHint: localize('modelBenchmarks.failedHint', "The questions the model's server gave no answer to"),
		error: localize('modelBenchmarks.error', "Error"),
		published: localize('modelBenchmarks.published', "Published"),
		publishedHint: localize('modelBenchmarks.publishedHint', "The score the model's makers published on all the questions, with their own prompt and settings: a hover shows them, a click opens the model card"),
		byStratum: localize('modelBenchmarks.byStratum', "By Stratum"),
		byStratumIntro: localize('modelBenchmarks.byStratumIntro', "The share of right answers of each model in each stratum, with the questions asked."),
		questionsPart: localize('modelBenchmarks.questionsPart', "Questions"),
		questionsPartIntro: localize('modelBenchmarks.questionsPartIntro', "Each question of the sample, with the right answer and each model's: green when right, red when wrong, a dash when none could be read. A click on a question shows it whole, with each model's answer."),
		rightAnswer: localize('modelBenchmarks.rightAnswer', "Right Answer"),
		options: localize('modelBenchmarks.options', "Options"),
		cutOffMark: localize('modelBenchmarks.cutOffMark', "Cut off"),
		notAnswered: localize('modelBenchmarks.notAnswered', "Not answered"),
		answerGiven: localize('modelBenchmarks.answerGiven', "Answer read: {0}", '{0}'),
		answerNone: localize('modelBenchmarks.answerNone', "No answer could be read"),
	};
	const benchmarkRows = entries.map(entry => `
			<tr class="item benchmark" data-id="${entry.id}">
				<td class="check"><input type="radio" name="benchmark" value="${entry.id}"></td>
				<td class="name">${entry.name}</td>
				<td>${entry.measures}</td>
				<td class="small">${entry.answer}</td>
				<td>${entry.strata ?? text.noStrata}</td>
				<td class="number downloaded" data-id="${entry.id}">${text.notDownloaded}</td>
				<td><a href="${entry.source}">${text.sourceLink}</a></td>
			</tr>`).join('');
	return buildWebviewHtml({
		title: text.title,
		introHtml: text.intro,
		extraCss: `
		${compareCss}
		tr.benchmark.chosen td.name { font-weight: 600; }
		td.name { white-space: nowrap; }
		.sizes { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px 20px; margin-top: 12px; }
		input.seed { width: 96px; }
		#strataTable { width: auto; min-width: 420px; margin-top: 12px; }
		#strataTable tr.left-out td { color: var(--vscode-disabledForeground); }
		.precision { margin-top: 10px; }
		td.right-answer { color: var(--vscode-charts-green); }
		td.wrong-answer { color: var(--vscode-errorForeground); }
		td.asked { cursor: pointer; }
		.column pre { white-space: pre-wrap; word-break: break-word; font-family: var(--vscode-editor-font-family); font-size: 12px; margin: 6px 0 0 0; }
		.column .verdict.right-answer { color: var(--vscode-charts-green); }
		.column .verdict.wrong-answer { color: var(--vscode-errorForeground); }
		.whole { white-space: pre-wrap; margin: 0 0 8px 0; }
		ol.choices { margin: 4px 0 12px 0; padding-left: 24px; }
		ol.choices li.right-choice { font-weight: 600; }
`,
		steps: [
			{
				id: 'step-benchmark',
				title: text.benchmarkSection,
				headHtml: '<span class="small" id="benchmarkChosen"></span>',
				bodyHtml: `
	<p class="hint">${text.benchmarkIntro.replace('{0}', '<span class="yellow">~/.pollis/benchmarks/data</span>')}</p>
	<table id="benchmarks">
		<thead><tr><th class="check"></th><th>${text.benchmark}</th><th>${text.measures}</th><th>${text.answerRead}</th><th>${text.strataColumn}</th><th class="number">${text.downloadedColumn}</th><th></th></tr></thead>
		<tbody>${benchmarkRows}</tbody>
	</table>
	<div class="settings"><span class="bar"><button class="action current" id="download"></button></span></div>
	<div class="small status" id="setStatus"></div>
`,
			},
			{
				id: 'step-sample',
				title: text.sampleSection,
				headHtml: '<span class="small" id="sampleCount"></span>',
				bodyHtml: `
	<p class="hint" id="sampleIntro"></p>
	<p class="hint" id="sampleNeeds" hidden>${text.sampleNeeds}</p>
	<div id="sampleForm" hidden>
		<div class="sizes">
			<label class="field"><span class="small">${text.size}</span><input type="number" class="count" id="sampleSize" min="1"></label>
			<label class="field" id="allocationField"><span class="small">${text.allocation}</span><select id="allocation">
				<option value="equal">${text.equal}</option>
				<option value="proportional">${text.proportional}</option>
			</select></label>
			<label class="field"><span class="small">${text.seed}</span><input type="number" class="count seed" id="seed" min="0"></label>
			<button class="link" id="newSeed">${text.newSeed}</button>
		</div>
		<table id="strataTable">
			<thead><tr><th class="check"><input type="checkbox" class="all" id="allStrata" title="${text.tickAllStrata}"></th><th id="stratumHead">${text.stratum}</th><th class="number">${text.population}</th><th class="number">${text.inSample}</th></tr></thead>
			<tbody id="strataBody"></tbody>
		</table>
		<p class="small precision" id="precision"></p>
	</div>
`,
			},
			{
				id: 'step-models',
				title: text.modelsSection,
				headHtml: '<span class="small" id="chosenCount"></span>',
				bodyHtml: `
	<div class="models">${compareLocalCard(text)}</div>
	<div class="settings">
		<label class="field"><span class="small">${text.examples}</span><select id="shots">
			<option value="0">${text.examplesNone}</option><option value="1">1</option><option value="3">3</option><option value="5">5</option>
		</select></label>
		<label class="field"><span class="small">${text.answers}</span><select id="reasoning">
			<option value="true">${text.reasoningOn}</option><option value="false">${text.reasoningOff}</option>
		</select></label>
		<label class="field"><span class="small">${text.thinking}</span><select id="thinking">
			<option value="false">${text.thinkingOff}</option><option value="true">${text.thinkingOn}</option>
		</select></label>
		<label class="field"><span class="small">${text.maxTokens}</span><select id="maxTokens">
			<option value="${ANSWER_ONLY_TOKENS}" hidden>${ANSWER_ONLY_TOKENS}</option><option value="256">256</option><option value="512">512</option><option value="1024">1024</option><option value="2048">2048</option><option value="4096">4096</option>
		</select></label>
	</div>
	<p class="small">${text.settingsHint} ${text.answerOnlyTokens}</p>
`,
			},
			{
				id: 'step-run',
				title: text.runSection,
				bodyHtml: `
	<p class="hint">${text.runIntro}</p>
	<div class="settings"><span class="bar"><button class="action current" id="run" disabled>${text.run}</button></span></div>
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
	<p class="hint" id="settingsLine"></p>
	<table id="results" hidden>
		<thead><tr id="resultsHead"></tr></thead>
		<tbody id="resultsBody"></tbody>
	</table>
	<div id="strataPart" hidden>
		<h3 class="part">${text.byStratum}</h3>
		<p class="hint">${text.byStratumIntro}</p>
		<table id="byStratum" class="auto">
			<thead><tr id="byStratumHead"></tr></thead>
			<tbody id="byStratumBody"></tbody>
		</table>
	</div>
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
`,
			},
		],
		pageScriptJs: `
	const TEXT = ${JSON.stringify(text)};
	const ANSWER_ONLY_TOKENS = ${ANSWER_ONLY_TOKENS};
	const SPINNER = '${spinnerSvg}';
	const ENTRIES = ${JSON.stringify(entries.map(entry => ({ id: entry.id, name: entry.name, strata: entry.strata, bytes: entry.bytes })))};
	${askAnswerScript()}
	${rowsChoiceScript()}
	${sortHeadingsScript()}

	let models = [];
	let benchmarks = [];
	let chosenBenchmark;
	let settings;
	let run;
	let rows = ${rows};
	let running = false;
	// The questions of the run shown: the page shown, their order, and the one open with its answers
	let foundPage = 0;
	const foundSort = { column: 'number', descending: false };
	let openQuestion;
	let openAnswers;
	let statusId = 'setStatus';

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

	// The benchmark: a click anywhere on its row chooses it; Download fetches it, or fetches it again
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
			row.querySelector('td.downloaded').textContent = item && item.info ? new Date(item.info.downloaded).toLocaleDateString() : TEXT.notDownloaded;
		}
		const entry = entryOf(chosenBenchmark);
		const item = current();
		document.getElementById('benchmarkChosen').textContent = entry ? entry.name : '';
		const download = document.getElementById('download');
		download.textContent = format(TEXT.downloadButton, entry ? entry.name : '') + ' (' + format(TEXT.downloadSize, entry ? (entry.bytes / 1e6).toFixed(1) : '-') + ')';
		download.disabled = running;
		document.getElementById('download').hidden = !!(item && item.info);
		if (item && item.info && statusId === 'setStatus' && !running) {
			setStatus(format(TEXT.downloadAgain, new Date(item.info.downloaded).toLocaleDateString(), item.info.count), false, false);
		}
		renderSample();
	}
	document.getElementById('download').addEventListener('click', () => {
		statusId = 'setStatus';
		vscode.postMessage({ command: 'download', id: chosenBenchmark });
	});

	/**
	 * The questions of each stratum for a sample of \`size\`, as model_benchmarks.jl allocates them (allocate): one each at
	 * least when the size allows, the rest in proportion to the populations or equally, by largest remainders, a
	 * stratum never given more than it has.
	 */
	function allocate(size, populations, allocation) {
		const count = populations.length;
		const sizes = populations.map(() => 0);
		let left = Math.min(size, populations.reduce((sum, value) => sum + value, 0));
		if (left >= count) {
			for (let index = 0; index < count; index++) { sizes[index] = Math.min(1, populations[index]); }
			left -= sizes.reduce((sum, value) => sum + value, 0);
		}
		while (left > 0) {
			const open = populations.map((population, index) => index).filter(index => sizes[index] < populations[index]);
			if (!open.length) { break; }
			const weights = open.map(index => allocation === 'equal' ? 1 : populations[index]);
			const total = weights.reduce((sum, value) => sum + value, 0);
			const quotas = weights.map(weight => left * weight / total);
			const whole = quotas.map(Math.floor);
			const order = quotas.map((quota, index) => index).sort((a, b) => (quotas[b] - whole[b]) - (quotas[a] - whole[a]) || a - b);
			for (const index of order.slice(0, left - whole.reduce((sum, value) => sum + value, 0))) { whole[index] += 1; }
			let given = 0;
			open.forEach((index, at) => {
				const take = Math.min(whole[at], populations[index] - sizes[index]);
				sizes[index] += take;
				given += take;
			});
			left -= given;
			if (!given) { break; }
		}
		return sizes;
	}

	function storedSample() {
		return current() ? current().sample : undefined;
	}
	function saveSample(sample) {
		const item = current();
		if (!item) { return; }
		item.sample = sample;
		vscode.postMessage({ command: 'sample', id: item.id, sample });
		renderSample();
	}
	/** The strata ticked with the questions the sample draws from each, as the run will draw them. */
	function plannedStrata() {
		const item = current();
		if (!item || !item.info) { return []; }
		const sample = item.sample;
		const ticked = item.info.strata.filter(stratum => !sample.leftOut.includes(stratum.name));
		const sizes = allocate(sample.size, ticked.map(stratum => stratum.count), sample.allocation);
		return item.info.strata.map(stratum => {
			const at = ticked.indexOf(stratum);
			return { name: stratum.name, count: stratum.count, ticked: at >= 0, size: at >= 0 ? sizes[at] : 0 };
		});
	}
	function plannedSize() {
		return plannedStrata().reduce((sum, stratum) => sum + stratum.size, 0);
	}
	function renderSample() {
		const item = current();
		const entry = entryOf(chosenBenchmark);
		const ready = !!(item && item.info);
		document.getElementById('sampleForm').hidden = !ready;
		document.getElementById('sampleNeeds').hidden = ready;
		const stratified = !!(entry && entry.strata);
		document.getElementById('sampleIntro').textContent = stratified ? TEXT.sampleIntro : format(TEXT.sampleIntroSimple, entry ? entry.name : '');
		document.getElementById('allocationField').hidden = !stratified;
		document.getElementById('strataTable').hidden = !stratified;
		if (!ready) {
			document.getElementById('sampleCount').textContent = '';
			updateRun();
			return;
		}
		const sample = item.sample;
		document.getElementById('sampleSize').value = sample.size;
		document.getElementById('allocation').value = sample.allocation;
		document.getElementById('seed').value = sample.seed;
		document.getElementById('stratumHead').textContent = entry.strata || TEXT.stratum;
		const planned = plannedStrata();
		const body = document.getElementById('strataBody');
		body.textContent = '';
		for (const stratum of planned) {
			const row = element('tr', 'model' + (stratum.ticked ? ' chosen' : ' left-out'));
			const check = element('td', 'check');
			const box = element('input');
			box.type = 'checkbox';
			box.checked = stratum.ticked;
			check.appendChild(box);
			row.appendChild(check);
			row.appendChild(element('td', 'name', stratum.name || '-'));
			row.appendChild(element('td', 'number', String(stratum.count)));
			row.appendChild(element('td', 'number', stratum.ticked ? String(stratum.size) : '-'));
			row.addEventListener('click', () => {
				const leftOut = stratum.ticked ? [...sample.leftOut, stratum.name] : sample.leftOut.filter(name => name !== stratum.name);
				saveSample({ ...sample, leftOut });
			});
			body.appendChild(row);
		}
		const all = document.getElementById('allStrata');
		const tickedCount = planned.filter(stratum => stratum.ticked).length;
		all.checked = tickedCount === planned.length;
		all.indeterminate = tickedCount > 0 && tickedCount < planned.length;
		// The widest 95% interval the sample can give, that of a score of one half in each stratum
		const ticked = planned.filter(stratum => stratum.ticked);
		const population = ticked.reduce((sum, stratum) => sum + stratum.count, 0);
		const size = ticked.reduce((sum, stratum) => sum + stratum.size, 0);
		const measured = ticked.every(stratum => stratum.size !== 1);
		let variance = 0;
		for (const stratum of ticked) {
			if (stratum.size > 1) {
				const weight = stratum.count / population;
				variance += weight * weight * (1 - stratum.size / stratum.count) * 0.25 / (stratum.size - 1);
			}
		}
		const half = 100 * 1.96 * Math.sqrt(variance);
		document.getElementById('precision').textContent = !size ? '' : measured ? format(TEXT.precision, size, population, half.toFixed(1)) : format(TEXT.precisionNone, size, population);
		document.getElementById('sampleCount').textContent = size ? format(TEXT.count, size) : '';
		updateRun();
	}
	document.getElementById('allStrata').addEventListener('click', event => {
		event.stopPropagation();
		const item = current();
		if (!item || !item.info) { return; }
		saveSample({ ...item.sample, leftOut: event.target.checked ? [] : item.info.strata.map(stratum => stratum.name) });
	});
	document.getElementById('sampleSize').addEventListener('change', event => {
		const value = Math.max(1, Math.round(Number(event.target.value) || 1));
		saveSample({ ...storedSample(), size: value });
	});
	document.getElementById('allocation').addEventListener('change', event => saveSample({ ...storedSample(), allocation: event.target.value }));
	document.getElementById('seed').addEventListener('change', event => saveSample({ ...storedSample(), seed: Math.max(0, Math.round(Number(event.target.value) || 0)) }));
	document.getElementById('newSeed').addEventListener('click', () => saveSample({ ...storedSample(), seed: Math.floor(Math.random() * 100000) }));

	// How the models answer
	function renderSettings() {
		document.getElementById('shots').value = String(settings.shots);
		document.getElementById('reasoning').value = String(settings.reasoning);
		document.getElementById('thinking').value = String(settings.thinking);
		// The answer alone without thinking has its own longest answer, the run's; the one chosen is kept for the others
		const longest = document.getElementById('maxTokens');
		const answerOnly = !settings.reasoning && !settings.thinking;
		longest.disabled = answerOnly;
		longest.value = String(answerOnly ? ANSWER_ONLY_TOKENS : settings.maxTokens);
		longest.title = answerOnly ? TEXT.answerOnlyTokens : '';
	}
	for (const id of ['shots', 'reasoning', 'thinking', 'maxTokens']) {
		document.getElementById(id).addEventListener('change', () => {
			const longest = document.getElementById('maxTokens');
			settings = {
				shots: Number(document.getElementById('shots').value),
				reasoning: document.getElementById('reasoning').value === 'true',
				thinking: document.getElementById('thinking').value === 'true',
				maxTokens: longest.disabled ? settings.maxTokens : Number(longest.value),
			};
			vscode.postMessage({ command: 'settings', settings });
			renderSettings();
		});
	}

	/** Run, with how many questions it asks and with how many models; Stop while it runs. */
	function updateRun() {
		const button = document.getElementById('run');
		const item = current();
		const questions = item && item.info ? plannedSize() : 0;
		const count = chosenValues().length;
		button.disabled = !running && (!questions || !count);
		button.title = button.disabled ? TEXT.runNeeds : '';
		button.textContent = running ? TEXT.stop : button.disabled ? TEXT.run : format(count === 1 ? TEXT.runOneModel : TEXT.runMany, questions, count);
		document.getElementById('download').disabled = running;
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
		return value === undefined || value === null ? '-' : (100 * value).toFixed(1) + '%';
	}
	/** The probability of doing as well by chance, with three decimals, or below 0.001. */
	function chance(value) {
		return value === undefined || value === null ? '-' : value < 0.001 ? TEXT.byChanceBelow : value.toFixed(3);
	}
	function points(value) {
		return value === undefined || value === null ? '-' : '\\u00b1' + (100 * value).toFixed(1);
	}

	function renderRun() {
		const head = document.getElementById('resultsHead');
		const body = document.getElementById('resultsBody');
		head.textContent = '';
		body.textContent = '';
		const figures = run ? [...run.figures].sort((a, b) => (b.score ?? -1) - (a.score ?? -1)) : [];
		document.getElementById('results').hidden = !run || !figures.length;
		document.getElementById('runLine').textContent = run ? format(TEXT.runLine, new Date(run.started).toLocaleString(), run.pollis, run.revision ? format(TEXT.benchmarkRevision, run.benchmark, run.revision.slice(0, 7)) : run.benchmark, run.sample.size, run.sample.seed, run.sample.allocation === 'equal' ? TEXT.equal : TEXT.proportional) : TEXT.noRuns;
		document.getElementById('settingsLine').textContent = run ? format(TEXT.settingsLine, run.settings.shots, run.settings.reasoning ? TEXT.reasoningOn : TEXT.reasoningOff, run.settings.thinking ? TEXT.thinkingOn : TEXT.thinkingOff, run.settings.maxTokens) : '';
		document.getElementById('deleteRun').hidden = !run;
		// A run that ends shows itself, even in a pane left closed
		if (run) { document.getElementById('step-results').classList.remove('collapsed'); }
		renderStrata(figures);
		if (!run || !figures.length) { return; }
		// A column for each model, the best score first; a row for each figure
		head.appendChild(element('th', '', TEXT.model));
		for (const model of figures) {
			const th = element('th', 'number', splitName(model.label).name);
			th.title = model.label;
			head.appendChild(th);
		}
		const line = (label, hint, value, className) => {
			const row = element('tr');
			const name = element('td', '', label);
			if (hint) { name.title = hint; }
			row.appendChild(name);
			for (const model of figures) { row.appendChild(element('td', className ?? 'number', value(model))); }
			body.appendChild(row);
		};
		line(TEXT.where, '', model => [TEXT.thisComputer, model.size].filter(part => part).join(' \\u00b7 '), 'small');
		line(TEXT.score, TEXT.scoreHint, model => percent(model.score));
		line(TEXT.interval, TEXT.intervalHint, model => points(model.half));
		line(TEXT.right, '', model => format(TEXT.rightOf, model.right, model.questions));
		line(TEXT.byChance, TEXT.byChanceHint, model => chance(model.byChance));
		line(TEXT.unread, TEXT.unreadHint, model => String(model.unread));
		line(TEXT.cutOff, TEXT.cutOffHint, model => String(model.cutOff));
		if (figures.some(model => model.failed)) { line(TEXT.failed, TEXT.failedHint, model => String(model.failed)); }
		line(TEXT.firstToken, TEXT.firstTokenHint, model => fixed(model.firstTokenMs, 0));
		line(TEXT.reading, TEXT.readingHint, model => fixed(model.readingSpeed, 0));
		line(TEXT.writing, TEXT.writingHint, model => fixed(model.writingSpeed, 1));
		line(TEXT.seconds, TEXT.secondsHint, model => fixed(model.seconds, 1));
		line(TEXT.tokens, TEXT.tokensHint, model => fixed(model.writtenTokens, 0));
		line(TEXT.memory, TEXT.memoryHint, model => model.memory > 0 ? (model.memory / 1024 ** 3).toFixed(1) : '-');
		// The score the model's makers published, with their setting and a link to it
		if (figures.some(model => model.published)) {
			const row = element('tr');
			const name = element('td', '', TEXT.published);
			name.title = TEXT.publishedHint;
			row.appendChild(name);
			for (const model of figures) {
				const cell = element('td', 'number');
				if (model.published) {
					const link = element('a', '', percent(model.published.score));
					link.href = model.published.source;
					link.title = model.published.setting;
					cell.appendChild(link);
				} else {
					cell.textContent = '-';
				}
				row.appendChild(cell);
			}
			body.appendChild(row);
		}
		if (figures.some(model => model.error)) { line(TEXT.error, '', model => model.error || '', 'small'); }
	}

	function renderStrata(figures) {
		const part = document.getElementById('strataPart');
		part.hidden = !run || !figures.length || !run.strataLabel || run.sample.strata.length < 2;
		if (part.hidden) { return; }
		const head = document.getElementById('byStratumHead');
		const body = document.getElementById('byStratumBody');
		head.textContent = '';
		body.textContent = '';
		head.appendChild(element('th', '', run.strataLabel));
		head.appendChild(element('th', 'number', TEXT.population));
		for (const model of figures) {
			const th = element('th', 'number', splitName(model.label).name);
			th.title = model.label;
			head.appendChild(th);
		}
		for (const stratum of run.sample.strata) {
			const row = element('tr');
			row.appendChild(element('td', '', stratum.name));
			row.appendChild(element('td', 'number', String(stratum.population)));
			for (const model of figures) {
				const own = model.strata.find(candidate => candidate.name === stratum.name);
				row.appendChild(element('td', 'number', own && own.asked ? percent(own.right / own.asked) + ' (' + format(TEXT.rightOf, own.right, own.asked) + ')' : '-'));
			}
			body.appendChild(row);
		}
	}

	function renderFound() {
		const part = document.getElementById('questionsPart');
		part.hidden = !run || !run.questions.length || !run.figures.length;
		if (part.hidden) { return; }
		const figures = run.figures;
		const head = document.getElementById('foundHead');
		head.textContent = '';
		const resort = () => {
			foundPage = 0;
			renderFound();
		};
		sortHeading(head, TEXT.number, 'number', 'number', foundSort, resort);
		if (run.strataLabel) { sortHeading(head, run.strataLabel, 'stratum', '', foundSort, resort); }
		sortHeading(head, TEXT.question, 'question', '', foundSort, resort);
		head.appendChild(element('th', '', TEXT.rightAnswer));
		for (const model of figures) { sortHeading(head, splitName(model.label).name, 'model:' + model.value, '', foundSort, resort); }
		const size = rowsPerPage(rows, run.questions.length);
		const pages = Math.max(1, Math.ceil(run.questions.length / size));
		foundPage = Math.min(foundPage, pages - 1);
		const body = document.getElementById('foundBody');
		body.textContent = '';
		// By a model, its right answers first
		const value = (question, column) => {
			if (column === 'number') { return question.number; }
			if (!column.startsWith('model:')) { return question[column] || ''; }
			const answer = question.answers[column.slice(6)];
			return !answer ? '' : answer.correct ? 2 : answer.extracted ? 1 : 0;
		};
		for (const question of pageOf(sortedBy(run.questions, foundSort, value), foundPage)) {
			const row = element('tr', 'item' + (openQuestion === question.id ? ' open' : ''));
			row.appendChild(element('td', 'number', String(question.number)));
			if (run.strataLabel) { row.appendChild(element('td', 'small', question.stratum)); }
			row.appendChild(element('td', 'asked', question.question));
			row.appendChild(element('td', 'number', question.right));
			for (const model of figures) {
				const answer = question.answers[model.value];
				const cell = element('td', 'number' + (!answer || answer.error ? '' : answer.correct ? ' right-answer' : ' wrong-answer'), !answer ? '' : answer.error ? TEXT.notAnswered : answer.extracted || '-');
				if (answer && answer.cutOff) { cell.title = TEXT.cutOffMark; }
				row.appendChild(cell);
			}
			row.addEventListener('click', () => {
				openQuestion = openQuestion === question.id ? undefined : question.id;
				openAnswers = undefined;
				if (openQuestion) { vscode.postMessage({ command: 'answers', question: question.id }); }
				renderFound();
			});
			body.appendChild(row);
			if (openQuestion === question.id && openAnswers && openAnswers.question === question.id) {
				body.appendChild(detailRow(openAnswers, 3 + (run.strataLabel ? 1 : 0) + figures.length));
			}
		}
		fillPagers(['foundPagerTop', 'foundPager'], run.questions.length, pages, foundPage, to => { foundPage = to; });
	}

	/** The question whole, with its options, and each model's answer side by side. */
	function detailRow(detail, columnCount) {
		const row = element('tr', 'detail');
		const cell = element('td');
		cell.colSpan = columnCount;
		cell.appendChild(element('p', 'whole', detail.text));
		if (detail.choices.length) {
			const list = element('ol', 'choices');
			list.type = 'A';
			detail.choices.forEach((choice, index) => {
				list.appendChild(element('li', String.fromCharCode(65 + index) === detail.right ? 'right-choice' : '', choice));
			});
			cell.appendChild(list);
		}
		cell.appendChild(element('p', 'right', TEXT.rightAnswer + ': ' + detail.right));
		const columns = element('div', 'columns');
		for (const answer of detail.answers) {
			const column = element('div', 'column');
			column.appendChild(element('h4', '', splitName(answer.label).name));
			const verdict = answer.error ? TEXT.notAnswered : answer.extracted ? format(TEXT.answerGiven, answer.extracted) : TEXT.answerNone;
			column.appendChild(element('div', 'small verdict ' + (answer.error ? '' : answer.correct ? 'right-answer' : 'wrong-answer'), verdict + (answer.cutOff ? ' \\u00b7 ' + TEXT.cutOffMark : '')));
			column.appendChild(element('pre', '', answer.text));
			columns.appendChild(column);
		}
		cell.appendChild(columns);
		row.appendChild(cell);
		return row;
	}

	${compareChartsScript}

	const runsSelect = document.getElementById('runs');
	runsSelect.addEventListener('change', () => vscode.postMessage({ command: 'showRun', id: runsSelect.value }));
	document.getElementById('deleteRun').addEventListener('click', () => { if (run) { vscode.postMessage({ command: 'deleteRun', id: run.id }); } });

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'benchmarks') {
			benchmarks = message.benchmarks;
			chosenBenchmark = message.chosen;
			renderBenchmarks();
		} else if (message.command === 'settings') {
			settings = message.settings;
			renderSettings();
		} else if (message.command === 'models') {
			models = message.models;
			renderLocal(message.chosen);
			updateChosen();
		} else if (message.command === 'run') {
			if (message.run?.id !== run?.id) {
				foundPage = 0;
				openQuestion = undefined;
				openAnswers = undefined;
			}
			run = message.run;
			renderRun();
			renderFound();
		} else if (message.command === 'answers') {
			openAnswers = message;
			renderFound();
		} else if (message.command === 'runs') {
			runsSelect.textContent = '';
			for (const summary of message.runs) {
				runsSelect.appendChild(new Option(format(TEXT.runOption, new Date(summary.started).toLocaleString(), summary.benchmark, summary.models.join(', '), summary.questions), summary.id));
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
			id: MODEL_BENCHMARKS_COMMAND_ID,
			title: localize2('modelBenchmarks.action', "Model Benchmarks..."),
			category: Categories.Help,
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openModelBenchmarksPage(accessor);
	}
});
