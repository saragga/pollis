/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { mainWindow } from '../../../../base/browser/window.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, MutableDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { AppResourcePath, FileAccess } from '../../../../base/common/network.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { FEWEST_ROWS, rowsChoiceCss, sortHeadingsCss, sortHint } from '../../model/browser/webviews/webviewPager.js';
import { spinnerCss } from '../../model/browser/webviews/webviewScaffold.js';
import { AskTopic, IAskPollisEvalItem, IAskPollisService } from '../common/askPollis.js';

// What the two pages that evaluate models share, Evaluate Answering Models (compareModelsPage.ts, compareModelsRun.ts)
// and Evaluate Embedding Models (compareEmbeddingsPage.ts, compareEmbeddingsRun.ts): the test sets, the Standard one
// that Pollis ships and the user's in ~/.pollis/ask/sets; the test set a page shows, with the questions ticked; the
// samples of a run for the charts, the memory free and what the servers of the models did; and the parts of the pages
// that show them (the models on this computer, the test set, the charts and Model Servers).

/** The Standard test set, which Pollis ships, reviewed by hand: a newer Pollis may update it, and it cannot be changed. */
const SHIPPED_TEST_SET: AppResourcePath = 'vs/workbench/contrib/compose/browser/media/ask/evals.json';

/** The name of the Standard test set among the test sets: the user's have names of their own. */
export const STANDARD_TEST_SET = '';

/** A moment of a run, every SAMPLE_SECONDS, for the charts of the page: the memory free and the tokens used until then. */
export interface ICompareSample {
	/** Since the run started. */
	readonly seconds: number;
	/** In bytes; nothing when it could not be read. */
	readonly free?: number;
	readonly tokensRead: number;
	readonly tokensWritten: number;
	/** What the servers of the models on this computer did since the sample before. */
	readonly events?: readonly ICompareServerEvent[];
	/** The phases of the run begun since the sample before. */
	readonly phases?: readonly IComparePhase[];
}

/** The start of a phase of a run, a line on the charts: such as the search of the passages, the answers or the ratings. */
export interface IComparePhase {
	/** Since the run started. */
	readonly seconds: number;
	/** A key of the page's phases: search, answer or judge for the answering models, embed or search for the embedding ones. */
	readonly phase: string;
}

/**
 * A moment of the server of a model on this computer: loading, loaded, stopped or not started; or, for the embedding
 * model, the passages of questions found before, which it was not loaded for.
 */
export interface ICompareServerEvent {
	/** Since the run started. */
	readonly seconds: number;
	readonly model: string;
	readonly event: 'loading' | 'ready' | 'stopped' | 'failed' | 'reused';
	/** With `reused`, how many questions of how many had their passages found before. */
	readonly reused?: readonly [number, number];
	/** The size of the model file, in bytes, when loading. */
	readonly bytes?: number;
	/** The memory free just after, in bytes. */
	readonly free?: number;
}

/** The moments of the servers after the one numbered `after`, and the number of the last (language-julia.pollisLlamaServerEvents). */
interface IServerEvents {
	readonly last: number;
	readonly events: readonly { readonly id: number; readonly time: number; readonly model: string; readonly event: Exclude<ICompareServerEvent['event'], 'reused'>; readonly bytes?: number; readonly free?: number }[];
}

/** The samples of the last run, and the computer's memory, the top of the chart of the memory free. */
export interface ICompareSamples {
	readonly memory?: number;
	readonly samples: readonly ICompareSample[];
}

const SAMPLE_SECONDS = 2;

/** Whether `value` is a question of a test set, as RAGTools.jl writes it. */
export function isEvalItem(value: unknown): value is IAskPollisEvalItem {
	const item = value as IAskPollisEvalItem;
	return !!item && typeof item === 'object' && typeof item.question === 'string' && typeof item.answer === 'string'
		&& typeof item.context === 'string' && typeof item.source === 'string' && !!item.question.trim();
}

/** A question of a test set with only its four fields, in RAGTools.jl's order. */
export function evalItem(item: IAskPollisEvalItem): IAskPollisEvalItem {
	return { source: item.source, context: item.context, question: item.question, answer: item.answer };
}

/** The questions of a file of RAGTools.jl, or nothing when it holds none. */
export function parseEvalItems(text: string): IAskPollisEvalItem[] | undefined {
	try {
		const parsed = JSON.parse(text);
		return Array.isArray(parsed) ? parsed.filter(isEvalItem).map(evalItem) : undefined;
	} catch {
		return undefined;
	}
}

/** The text of a test set, as JSON3.read(file, Vector{QAEvalItem}) reads it back. */
export function evalItemsText(items: readonly IAskPollisEvalItem[]): string {
	return JSON.stringify(items.map(evalItem), undefined, 1);
}

/** `items` and those of `added` that are not among them, by their question. */
export function mergeEvalItems(items: readonly IAskPollisEvalItem[], added: readonly IAskPollisEvalItem[]): IAskPollisEvalItem[] {
	const known = new Set(items.map(item => item.question.trim()));
	return [...items, ...added.filter(item => !known.has(item.question.trim()) && known.add(item.question.trim()))];
}

/** The folder of the files of Ask Pollis, ~/.pollis/ask. */
export async function askFolder(pathService: IPathService): Promise<URI> {
	return joinPath(await pathService.userHome({ preferLocal: true }), '.pollis', 'ask');
}

/** The test sets: the Standard one, which Pollis ships, and the user's, each a file of ~/.pollis/ask/sets. */
export class CompareTestSets {

	constructor(
		private readonly fileService: IFileService,
		private readonly pathService: IPathService,
	) { }

	private async folder(): Promise<URI> {
		return joinPath(await askFolder(this.pathService), 'sets');
	}

	/** The names of the user's test sets, each a file of ~/.pollis/ask/sets, in alphabetical order. */
	async names(): Promise<string[]> {
		try {
			const folder = await this.fileService.resolve(await this.folder());
			return (folder.children ?? [])
				.filter(child => !child.isDirectory && child.name.endsWith('.json'))
				.map(child => child.name.slice(0, -'.json'.length))
				.sort((a, b) => a.localeCompare(b));
		} catch {
			return [];
		}
	}

	/** The questions of the test set `name`: the Standard one from Pollis, the user's from their file; empty when it cannot be read. */
	async read(name: string): Promise<IAskPollisEvalItem[]> {
		try {
			const file = name === STANDARD_TEST_SET ? FileAccess.asFileUri(SHIPPED_TEST_SET) : joinPath(await this.folder(), `${name}.json`);
			return parseEvalItems((await this.fileService.readFile(file)).value.toString()) ?? [];
		} catch {
			return [];
		}
	}

	/** Writes the user's test set `name`, made when it is new; the Standard one is never written. */
	async write(name: string, items: readonly IAskPollisEvalItem[]): Promise<void> {
		if (name !== STANDARD_TEST_SET) {
			await this.fileService.writeFile(joinPath(await this.folder(), `${name}.json`), VSBuffer.fromString(evalItemsText(items)));
		}
	}
}

/** Samples the memory free, the tokens used and what the models' servers did every SAMPLE_SECONDS during a task, for the charts of a page. */
export class CompareSampler extends Disposable {

	private readonly _onDidSample = this._register(new Emitter<ICompareSample>());
	/** A new sample of the task; the first of a task starts its charts again. */
	readonly onDidSample = this._onDidSample.event;

	private _samples: ICompareSamples = { samples: [] };
	private readonly sampling = this._register(new MutableDisposable());
	/** The tokens read and written until now in the task, which the task counts. */
	tokens = { read: 0, written: 0 };
	/** When the samples started, and the phases begun and the moments of the task itself since the last sample. */
	private sampled = { started: 0, phases: [] as IComparePhase[], events: [] as ICompareServerEvent[] };

	constructor(private readonly commandService: ICommandService) {
		super();
	}

	/** The samples of the task running, or of the last one. */
	get samples(): ICompareSamples {
		return this._samples;
	}

	async start(): Promise<void> {
		this.tokens = { read: 0, written: 0 };
		const memory = await this.commandService.executeCommand<number>('language-julia.pollisTotalMemory').catch(() => undefined);
		const samples: ICompareSample[] = [];
		this._samples = { memory: typeof memory === 'number' ? memory : undefined, samples };
		const started = Date.now();
		this.sampled = { started, phases: [], events: [] };
		let after = (await this.commandService.executeCommand<IServerEvents>('language-julia.pollisLlamaServerEvents').catch(() => undefined))?.last ?? 0;
		const sample = async () => {
			const free = await this.commandService.executeCommand<number>('language-julia.pollisAvailableMemory').catch(() => undefined);
			const servers = await this.commandService.executeCommand<IServerEvents>('language-julia.pollisLlamaServerEvents', { after }).catch(() => undefined);
			if (this._samples.samples !== samples) {
				return;
			}
			// Two samples asking at once would get the same moments
			const fresh = servers?.events.filter(event => event.id > after);
			after = Math.max(after, servers?.last ?? 0);
			const events = [...this.sampled.events.splice(0), ...fresh?.map(({ time, model, event, bytes, free }) => ({ seconds: Math.max(0, (time - started) / 1000), model, event, bytes, free })) ?? []];
			const phases = this.sampled.phases.splice(0);
			const next: ICompareSample = { seconds: (Date.now() - started) / 1000, free: typeof free === 'number' ? free : undefined, tokensRead: this.tokens.read, tokensWritten: this.tokens.written, events: events.length ? events : undefined, phases: phases.length ? phases : undefined };
			samples.push(next);
			this._onDidSample.fire(next);
		};
		const handle = mainWindow.setInterval(sample, SAMPLE_SECONDS * 1000);
		this.sampling.value = toDisposable(() => {
			mainWindow.clearInterval(handle);
			sample();
		});
		await sample();
	}

	/** Marks on the charts that `phase` of the task begins now. */
	mark(phase: string): void {
		this.sampled.phases.push({ seconds: (Date.now() - this.sampled.started) / 1000, phase });
	}

	/** A moment of the task itself, such as passages found before, among those of the servers. */
	note(event: Omit<ICompareServerEvent, 'seconds'>): void {
		this.sampled.events.push({ seconds: (Date.now() - this.sampled.started) / 1000, ...event });
	}

	/** Stops the samples, with a last one. */
	stop(): void {
		this.sampling.clear();
	}
}

/** The name of a topic, beside Make Questions... and in the Topic column; none for a question whose topic is not known. */
export function topicLabel(topic: AskTopic | undefined): string {
	switch (topic) {
		case 'pollis': return localize('compareModels.topicPollis', "Pollis");
		case 'julia': return localize('compareModels.topicJulia', "Julia Language");
		case 'panels': return localize('compareModels.topicPanels', "Topic Panels");
		default: return '';
	}
}

function storedTicks(storageService: IStorageService, key: string): Record<string, string[]> {
	try {
		const stored = JSON.parse(storageService.get(key, StorageScope.APPLICATION, '{}'));
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

/** The test set a page shows, which it remembers for the next time, with the questions ticked in each test set. */
export class CompareTestSetChoice {

	/** The name of the test set shown, STANDARD_TEST_SET for the Standard one. */
	name: string;
	items: IAskPollisEvalItem[] = [];
	private readonly ticks: Record<string, string[]>;

	constructor(
		private readonly storageService: IStorageService,
		private readonly askPollisService: IAskPollisService,
		private readonly sets: CompareTestSets,
		private readonly keys: { readonly testSet: string; readonly ticked: string },
		private readonly post: (message: object) => void,
	) {
		this.name = storageService.get(keys.testSet, StorageScope.APPLICATION, STANDARD_TEST_SET);
		this.ticks = storedTicks(storageService, keys.ticked);
	}

	/** The questions ticked in the test set `name`. */
	ticked(name = this.name): readonly string[] {
		return this.ticks[name] ?? [];
	}

	storeTicks(name: string, questions: readonly string[]): void {
		if (questions.length) {
			this.ticks[name] = [...questions];
		} else {
			delete this.ticks[name];
		}
		this.storageService.store(this.keys.ticked, JSON.stringify(this.ticks), StorageScope.APPLICATION, StorageTarget.USER);
	}

	/** Shows the test set `name`, a name among the user's sets or the Standard one, and remembers it for the next time. */
	async choose(name: string): Promise<void> {
		const names = await this.sets.names();
		this.name = names.includes(name) ? name : STANDARD_TEST_SET;
		this.storageService.store(this.keys.testSet, this.name, StorageScope.APPLICATION, StorageTarget.USER);
		this.post({ command: 'sets', sets: names, chosen: this.name, ticked: this.ticked() });
		this.items = await this.sets.read(this.name);
		await this.postItems();
	}

	/** Reads the test set shown again, after a change. */
	async reload(): Promise<void> {
		this.items = await this.sets.read(this.name);
		await this.postItems();
	}

	async postItems(): Promise<void> {
		// The topic of each question by its passage, as the documents have it now; none for a passage no longer in the documents, or when there is no index
		const matches = await this.askPollisService.matches(this.items.map(item => item.context));
		this.post({ command: 'items', items: this.items.map((item, index) => ({ number: index + 1, question: item.question, answer: item.answer, source: item.source, context: matches?.[index]?.text ?? item.context, present: !matches || matches[index] !== undefined, topic: topicLabel(matches?.[index]?.topic) })) });
	}
}

/** The strings of the parts of the pages that both pages show. */
export function compareSharedText() {
	return {
		thisComputer: localize('compareModels.onThisComputer', "On This Computer"),
		parameters: localize('compareModels.parameters', "Parameters"),
		quantisation: localize('compareModels.quantisation', "Quantisation"),
		download: localize('compareModels.download', "Download"),
		gigabytes: localize('compareModels.gigabytes', "{0} GB"),
		chooseAll: localize('compareModels.chooseAll', "Choose all or none"),
		chosenNone: localize('compareModels.chosenNone', "No model chosen"),
		chosenOne: localize('compareModels.chosenOne', "1 model chosen"),
		chosenMany: localize('compareModels.chosenMany', "{0} models chosen"),
		questions: localize('compareModels.questions', "Questions"),
		testSet: localize('compareModels.testSet', "Test Set"),
		standard: localize('compareModels.standard', "Standard"),
		yoursHint: localize('compareModels.yoursHint', "Yours, in {0}: every change is saved as you make it, the ticks too.", '{0}'),
		countTicked: localize('compareModels.countTicked', "{0} of {1} ticked", '{0}', '{1}'),
		untick: localize('compareModels.untick', "Untick All"),
		tickAll: localize('compareModels.tickAll', "Tick all or none of the questions, on every page"),
		topic: localize('compareModels.topic', "Topic"),
		number: localize('compareModels.number', "#"),
		poweredBy: localize('compareModels.poweredBy', "Powered by:"),
		memoryChart: localize('compareModels.memoryChart', "Free Memory"),
		memoryNow: localize('compareModels.memoryNow', "{0} GB free of {1} GB"),
		memoryFree: localize('compareModels.memoryFree', "{0} GB free"),
		servers: localize('compareModels.servers', "Model Servers"),
		serversHint: localize('compareModels.serversHint', "When each model on this computer was loaded into memory and stopped, with the memory free just before it loaded, then once it was loaded and once it had stopped."),
		freeBefore: localize('compareModels.freeBefore', "{0} GB free before"),
		serverLoading: localize('compareModels.serverLoading', "Loading, a file of {0} GB"),
		serverLoadingFile: localize('compareModels.serverLoadingFile', "Loading"),
		serverReady: localize('compareModels.serverReady', "Loaded in {0} s"),
		serverStopped: localize('compareModels.serverStopped', "Stopped"),
		serverFailed: localize('compareModels.serverFailed', "Did not start"),
		serverReused: localize('compareModels.serverReused', "Not loaded for {0} of {1} questions: their passages as found before, with the same index and settings"),
		question: localize('compareModels.question', "Question"),
		source: localize('compareModels.source', "Source"),
		gone: localize('compareModels.gone', "No longer in the documents"),
		model: localize('compareModels.model', "Model"),
		previous: localize('compareModels.previous', "Previous"),
		next: localize('compareModels.next', "Next"),
		page: localize('compareModels.page', "Page {0} of {1}"),
		count: localize('compareModels.count', "{0} questions"),
		sortHint: sortHint(),
	};
}

/** The strings a page gives the parts it shares: those of both pages, and a few of its own. */
type CompareText = ReturnType<typeof compareSharedText> & { readonly noLocal: string; readonly noItems: string; readonly standardHint: string; readonly chartsHint: string };

/** The style of both pages. */
export const compareCss = `
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
		/* A question of Answers opens its answers side by side: the colour of a link */
		td.asked { color: var(--vscode-textLink-foreground); }
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
		/* The memory free and the tokens used during a run */
		.charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin: 8px 0 4px 0; max-width: 1000px; }
		.chart { position: relative; padding-bottom: 10px; }
		.chart .now { font-size: 12px; margin: 0 0 6px 0; font-variant-numeric: tabular-nums; display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
		.chart svg { display: block; width: 100%; height: 140px; }
		.chart .grid { stroke: var(--vscode-widget-border); stroke-width: 1; }
		.chart .axis { fill: var(--vscode-descriptionForeground); font-size: 10px; font-variant-numeric: tabular-nums; }
		.chart .line { fill: none; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
		.chart .line.series-0 { stroke: var(--vscode-charts-blue); }
		.chart .line.series-1 { stroke: var(--vscode-charts-orange); }
		.chart .swatch { display: inline-block; width: 12px; height: 2px; border-radius: 1px; margin-right: 6px; vertical-align: middle; }
		.chart .swatch.series-0 { background: var(--vscode-charts-blue); }
		.chart .swatch.series-1 { background: var(--vscode-charts-orange); }
		/* Each phase of the run in a shade of the line's colour, lighter for the earlier ones */
		.chart .line.series-0.phase-0 { stroke: color-mix(in srgb, var(--vscode-charts-blue) 45%, var(--vscode-editor-background)); }
		.chart .line.series-0.phase-1 { stroke: color-mix(in srgb, var(--vscode-charts-blue) 70%, var(--vscode-editor-background)); }
		.chart .line.series-1.phase-0 { stroke: color-mix(in srgb, var(--vscode-charts-orange) 45%, var(--vscode-editor-background)); }
		.chart .line.series-1.phase-1 { stroke: color-mix(in srgb, var(--vscode-charts-orange) 70%, var(--vscode-editor-background)); }
		.chart .cross { stroke: var(--vscode-descriptionForeground); stroke-width: 1; stroke-dasharray: 2 2; }
		.servers { max-height: 220px; overflow-y: auto; margin-top: 16px; max-width: 1000px; }
		.servers table { width: 100%; border-collapse: collapse; font-size: 12px; font-variant-numeric: tabular-nums; }
		.servers td { padding: 2px 12px 2px 0; white-space: nowrap; }
		.servers td.model { white-space: normal; word-break: break-word; }
		.chart .tip { position: absolute; pointer-events: none; background: var(--vscode-editorHoverWidget-background); border: 1px solid var(--vscode-editorHoverWidget-border); color: var(--vscode-editorHoverWidget-foreground); padding: 4px 8px; border-radius: 3px; font-size: 12px; white-space: nowrap; font-variant-numeric: tabular-nums; }
		.powered-by { margin: 4px 0 16px 0; line-height: 1.4; display: flex; align-items: baseline; flex-wrap: wrap; }
		.package-link { color: var(--vscode-textLink-foreground); text-decoration: none; cursor: pointer; }
		.package-link:hover { text-decoration: underline; }
		input.count { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 4px 6px; width: 64px; }
		input.count:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		.counts { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
		.counts label { display: inline-flex; gap: 6px; align-items: center; }
`;

/** The table of the models on this computer, to choose those to evaluate. */
export function compareLocalCard(text: CompareText): string {
	return `
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
		</div>`;
}

/** The second step, the questions of the test set chosen, with `tools` beside the test set. */
export function compareTestSetHtml(text: CompareText, intro: string, tools: string): string {
	return `
	<div class="head"><h2 class="section"><span class="step">2</span>${text.questions}</h2><span class="small" id="count"></span><button class="link" id="untick" hidden>${text.untick}</button></div>
	<p class="hint">${intro}</p>
	<div class="settings">
		<label class="field"><span class="small">${text.testSet}</span><select id="testSet"></select></label>
		${tools}
	</div>
	<p class="small setHint" id="setHint"></p>
	<div class="small status" id="setStatus"></div>
	<p class="hint" id="noItems" hidden>${text.noItems}</p>
	<div class="pager" id="pagerTop" hidden></div>
	<table id="items" hidden>
		<thead><tr id="itemsHead"></tr></thead>
		<tbody id="itemsBody"></tbody>
	</table>
	<div class="pager" id="pager" hidden></div>`;
}

/** The charts of a run, the memory free and `tokensChart` (none on a page whose models count no tokens), and Model Servers. */
export function compareChartsHtml(text: CompareText, tokensChart = ''): string {
	return `
	<div id="charts" hidden>
		<div class="charts">
			<div class="card chart" id="memoryChart"><h3>${text.memoryChart}</h3><div class="now" id="memoryNow"></div><svg role="img" aria-label="${text.memoryChart}"></svg><div class="tip" hidden></div></div>
			${tokensChart}
		</div>
		<p class="small">${text.chartsHint}</p>
		<div class="card servers" id="servers" hidden><h3>${text.servers}</h3><table><tbody id="serversBody"></tbody></table><p class="small">${text.serversHint}</p></div>
	</div>`;
}

/**
 * The script both pages share: the formats, the package links, the one blue button of each bar, the table of the models
 * on this computer, the status lines, the sorted headings and the pagers. A page defines TEXT, POWERED_BY, SPINNER,
 * models, rows, statusId, updateRun(), which the choice of models calls, and renderTables(), which the pagers call.
 */
/**
 * The script every page of Compose's workflows has: format(), fixed(), yellow(), the packages of its Powered by, and
 * one blue button in each bar; with esc() and element() of askAnswerScript(), and POWERED_BY and vscode set.
 */
export const pageCommonScript = `
	function format(template, ...values) {
		return template.replace(/\\{(\\d+)\\}/g, (match, index) => String(values[Number(index)]));
	}
	function fixed(value, digits) {
		return value === undefined || value === null ? '-' : value.toFixed(digits);
	}

	// The packages of the evaluation, each opening its page in the internal browser
	const packageLinks = document.getElementById('package-links');
	POWERED_BY.forEach((pkg, index) => {
		if (index > 0) { packageLinks.appendChild(document.createTextNode(', ')); }
		const link = element('a', 'package-link', pkg.name);
		link.href = '#';
		link.title = pkg.url;
		link.addEventListener('click', event => {
			event.preventDefault();
			vscode.postMessage({ command: 'openUrl', url: pkg.url });
		});
		packageLinks.appendChild(link);
	});

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

	/** A message with its packages and files in the yellow. */
	function yellow(text) {
		return esc(text).replace(/(?<name>[A-Za-z0-9]+\\.jl\\b|~\\/\\.pollis\\/[\\w.\\/-]*\\w)/g, '<span class="yellow">$<name></span>');
	}
`;

/** The script of both Evaluate pages: the common one, the models to choose, the status and the order of the questions. */
export const compareCommonScript = `${pageCommonScript}
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

	function setStatus(text, error, spinning, percent) {
		for (const id of ['setStatus', 'runStatus']) {
			const status = document.getElementById(id);
			status.innerHTML = id === statusId ? yellow(text || '') : '';
			status.classList.toggle('error', id === statusId && !!error);
		}
		if (spinning && text) { document.getElementById(statusId).insertAdjacentHTML('afterbegin', SPINNER + (percent === undefined ? '' : '<span class="percent">' + percent + '%</span>')); }
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
						renderTables();
					});
					return button;
				};
				pager.append(link(TEXT.previous, current - 1), element('span', '', format(TEXT.page, current + 1, pages)), link(TEXT.next, current + 1));
			}
			pager.append(rowsChoice(rows, chosen => {
				turn(firstPageAfter(current, rows, chosen));
				rows = chosen;
				vscode.postMessage({ command: 'rows', rows });
				renderTables();
			}));
		}
	}
`;

/**
 * The script of the test set's questions, to tick those to ask. A page defines items, ticked, standard, page,
 * itemSort, and testSetChanged(), called when the questions or the ticks change.
 */
export const compareTestSetScript = `
	/** Keeps the ticks of the test set for the next time. */
	function ticksChanged() {
		vscode.postMessage({ command: 'tick', questions: [...ticked] });
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
		allBox.id = 'tickAll';
		allBox.title = TEXT.tickAll;
		allBox.addEventListener('change', () => {
			for (const item of items) { if (allBox.checked) { ticked.add(item.question); } else { ticked.delete(item.question); } }
			ticksChanged();
			render();
		});
		all.appendChild(allBox);
		head.appendChild(all);
		const resort = () => {
			page = 0;
			render();
		};
		sortHeading(head, TEXT.number, 'number', 'number', itemSort, resort);
		sortHeading(head, TEXT.question, 'question', '', itemSort, resort);
		sortHeading(head, TEXT.topic, 'topic', '', itemSort, resort);
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
			row.appendChild(element('td', 'number small', String(item.number)));
			const question = element('td', '', item.question);
			question.title = item.answer;
			row.appendChild(question);
			row.appendChild(element('td', 'small topic', item.topic));
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
		const tickedItems = items.filter(item => ticked.has(item.question)).length;
		const allBox = document.getElementById('tickAll');
		if (allBox) {
			allBox.checked = items.length > 0 && tickedItems === items.length;
			allBox.indeterminate = tickedItems > 0 && tickedItems < items.length;
		}
		document.getElementById('count').textContent = !items.length ? '' : ticked.size ? format(TEXT.countTicked, ticked.size, items.length) : format(TEXT.count, items.length);
		document.getElementById('untick').hidden = !ticked.size;
		testSetChanged();
	}
	/** The test sets to choose from and the one shown, with its ticks. */
	function showSets(message) {
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
		testSetChanged();
	}
	/** The questions of the test set shown: the ticks of those no longer in it go. */
	function showItems(message) {
		items = message.items;
		const present = new Set(items.map(item => item.question));
		const before = ticked.size;
		for (const question of [...ticked]) { if (!present.has(question)) { ticked.delete(question); } }
		if (ticked.size !== before) { ticksChanged(); }
		render();
	}
`;

/** The script of the charts and of Model Servers; the phases are the keys of TEXT.phases, each in a shade by its place. */
export const compareChartsScript = `
	// The memory free and the tokens used during the run, a sample every two seconds
	let samples = { memory: undefined, samples: [] };
	function svgElement(tag, attributes) {
		const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
		for (const [name, value] of Object.entries(attributes)) { node.setAttribute(name, String(value)); }
		return node;
	}
	function gigabytes(bytes) {
		return (bytes / 1024 ** 3).toFixed(1);
	}
	function tokenCount(tokens) {
		return tokens >= 1e6 ? (tokens / 1e6).toFixed(1) + 'M' : tokens >= 1e4 ? Math.round(tokens / 1e3) + 'k' : tokens >= 1e3 ? (tokens / 1e3).toFixed(1) + 'k' : String(tokens);
	}
	function clock(seconds) {
		const whole = Math.round(seconds);
		return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
	}
	/** The smallest of 1, 2 and 5 times a power of ten at or above \`value\`, the top of an axis. */
	function niceTop(value) {
		if (!(value > 0)) { return 1000; }
		const power = 10 ** Math.floor(Math.log10(value));
		return [1, 2, 5, 10].map(step => step * power).find(top => top >= value);
	}
	/** A line chart of \`series\` ({values, className}) over the seconds of the samples, from 0 to \`top\`; a hover shows \`tip\` of the nearest sample. */
	function drawChart(chart, series, top, label, tip) {
		const svg = chart.querySelector('svg');
		const tipBox = chart.querySelector('.tip');
		const list = samples.samples;
		const width = svg.clientWidth || 300;
		const height = 140;
		const left = 40;
		const right = 8;
		const above = 6;
		const below = 18;
		svg.textContent = '';
		svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
		// A minute wide at least, so that the first samples do not fill the chart
		const span = Math.max(list.length ? list[list.length - 1].seconds : 0, 60);
		const x = seconds => left + (width - left - right) * seconds / span;
		const y = value => above + (height - above - below) * (1 - value / top);
		for (const fraction of [0, 0.5, 1]) {
			svg.appendChild(svgElement('line', { class: 'grid', x1: left, x2: width - right, y1: y(top * fraction), y2: y(top * fraction) }));
			const text = svgElement('text', { class: 'axis', x: left - 6, y: y(top * fraction) + 3, 'text-anchor': 'end' });
			text.textContent = label(top * fraction);
			svg.appendChild(text);
		}
		for (const [seconds, anchor] of [[0, 'start'], [span, 'end']]) {
			const text = svgElement('text', { class: 'axis', x: x(seconds), y: height - 4, 'text-anchor': anchor });
			text.textContent = clock(seconds);
			svg.appendChild(text);
		}
		// The phases of the run, each named at the top where it begins; a label too close to the one before goes a line lower
		const phases = samples.samples.flatMap(sample => sample.phases || []);
		let labelEnd = -Infinity;
		let labelRow = 0;
		for (const { seconds, phase } of phases) {
			const at = x(Math.min(seconds, span));
			labelRow = at + 3 < labelEnd ? 1 - labelRow : 0;
			const text = svgElement('text', { class: 'axis', x: at + 3, y: above + 9 + 11 * labelRow, 'text-anchor': 'start' });
			text.textContent = TEXT.phases[phase];
			svg.appendChild(text);
			labelEnd = Math.max(labelEnd, at + 3 + text.getComputedTextLength() + 6);
		}
		const phaseAt = seconds => phases.filter(mark => mark.seconds <= seconds).pop()?.phase ?? Object.keys(TEXT.phases)[0];
		for (const { values, className } of series) {
			const points = list.map((sample, index) => [sample.seconds, values[index]]).filter(([, value]) => typeof value === 'number');
			// A line for each phase, in its shade, from the last point of the phase before so that the line is unbroken
			const segments = [];
			for (const point of points) {
				const phase = phaseAt(point[0]);
				const last = segments[segments.length - 1];
				if (last?.phase === phase) {
					last.points.push(point);
				} else {
					segments.push({ phase, points: last ? [last.points[last.points.length - 1], point] : [point] });
				}
			}
			for (const segment of segments) {
				svg.appendChild(svgElement('polyline', { class: 'line ' + className + ' phase-' + Object.keys(TEXT.phases).indexOf(segment.phase), points: segment.points.map(([seconds, value]) => x(seconds).toFixed(1) + ',' + y(value).toFixed(1)).join(' ') }));
			}
		}
		const cross = svgElement('line', { class: 'cross', y1: above, y2: height - below, visibility: 'hidden' });
		svg.appendChild(cross);
		svg.onmousemove = event => {
			if (!list.length) { return; }
			const box = svg.getBoundingClientRect();
			const seconds = (event.clientX - box.left - left) / (width - left - right) * span;
			let nearest = 0;
			for (let index = 1; index < list.length; index++) {
				if (Math.abs(list[index].seconds - seconds) < Math.abs(list[nearest].seconds - seconds)) { nearest = index; }
			}
			const at = x(list[nearest].seconds);
			cross.setAttribute('x1', at);
			cross.setAttribute('x2', at);
			cross.setAttribute('visibility', 'visible');
			tipBox.textContent = clock(list[nearest].seconds) + '   ' + tip(list[nearest]);
			tipBox.hidden = false;
			const frame = chart.getBoundingClientRect();
			tipBox.style.left = Math.max(4, Math.min(box.left - frame.left + at + 8, chart.clientWidth - tipBox.offsetWidth - 4)) + 'px';
			tipBox.style.top = (box.top - frame.top + 4) + 'px';
		};
		svg.onmouseleave = () => {
			cross.setAttribute('visibility', 'hidden');
			tipBox.hidden = true;
		};
	}
	function swatch(className, text) {
		return '<span><span class="swatch ' + className + '"></span>' + esc(text) + '</span>';
	}
	function renderCharts() {
		const list = samples.samples;
		document.getElementById('charts').hidden = !list.length;
		if (!list.length) { return; }
		const latest = list[list.length - 1];
		const frees = list.map(sample => sample.free);
		const memory = samples.memory || 1.1 * Math.max(1, ...frees.filter(free => typeof free === 'number'));
		document.getElementById('memoryNow').innerHTML = latest.free === undefined ? '-' : swatch('series-0', format(TEXT.memoryNow, gigabytes(latest.free), gigabytes(memory)));
		drawChart(document.getElementById('memoryChart'), [{ values: frees, className: 'series-0' }], memory, gigabytes, sample => sample.free === undefined ? '-' : format(TEXT.memoryFree, gigabytes(sample.free)));
		renderServers();
		// The tokens, on the page whose models count them
		if (document.getElementById('tokensChart')) {
			document.getElementById('tokensNow').innerHTML = swatch('series-0', format(TEXT.tokensRead, tokenCount(latest.tokensRead))) + swatch('series-1', format(TEXT.tokensWritten, tokenCount(latest.tokensWritten)));
			drawChart(document.getElementById('tokensChart'), [{ values: list.map(sample => sample.tokensRead), className: 'series-0' }, { values: list.map(sample => sample.tokensWritten), className: 'series-1' }], niceTop(Math.max(...list.map(sample => sample.tokensRead), ...list.map(sample => sample.tokensWritten))), tokenCount, sample => format(TEXT.tokensRead, tokenCount(sample.tokensRead)) + ', ' + format(TEXT.tokensWritten, tokenCount(sample.tokensWritten)));
		}
	}
	/** What the servers of the models on this computer did during the run, each moment with the memory free just after. */
	function renderServers() {
		const events = samples.samples.flatMap(sample => sample.events || []);
		document.getElementById('servers').hidden = !events.length;
		const body = document.getElementById('serversBody');
		const pinned = body.parentElement.parentElement;
		const atEnd = pinned.scrollTop + pinned.clientHeight >= pinned.scrollHeight - 4;
		body.textContent = '';
		const loading = new Map();
		for (const event of events) {
			let what = TEXT.serverStopped;
			if (event.event === 'loading') {
				loading.set(event.model, event.seconds);
				what = typeof event.bytes === 'number' ? format(TEXT.serverLoading, gigabytes(event.bytes)) : TEXT.serverLoadingFile;
			} else if (event.event === 'ready') {
				what = format(TEXT.serverReady, Math.round(event.seconds - (loading.get(event.model) ?? event.seconds)));
			} else if (event.event === 'failed') {
				what = TEXT.serverFailed;
			} else if (event.event === 'reused') {
				what = format(TEXT.serverReused, event.reused[0], event.reused[1]);
			}
			const row = document.createElement('tr');
			for (const [className, text] of [['', clock(event.seconds)], ['model', event.model], ['', what], ['', typeof event.free === 'number' ? format(event.event === 'loading' ? TEXT.freeBefore : TEXT.memoryFree, gigabytes(event.free)) : '']]) {
				const cell = document.createElement('td');
				cell.className = className;
				cell.textContent = text;
				row.appendChild(cell);
			}
			body.appendChild(row);
		}
		// The latest moment kept in view while the run goes on, unless scrolled up to read
		if (atEnd) { pinned.scrollTop = pinned.scrollHeight; }
	}
	window.addEventListener('resize', renderCharts);
`;
