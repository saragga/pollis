/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { mainWindow } from '../../../../base/browser/window.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { ASK_CHAT_MODEL } from '../common/askPollis.js';
import { ICompareProgress } from './compareModelsRun.js';
import { CompareSampler, ICompareSample, ICompareSamples } from './compareShared.js';

// What Model Benchmarks runs (modelBenchmarksPage.ts), in a hidden Julia process of the Julia extension
// (language-julia.pollisModelBenchmarks, model_benchmarks.jl, which a notebook loads too): a benchmark downloaded once
// into ~/.pollis/benchmarks/data; and a run, whose sample the script draws, stratified, with its seed, then each local
// model chosen, one after the other and alone in memory (the chat model of Ask Pollis stopped before), answering the
// questions of the sample, each answer graded as it comes. The run is kept in ~/.pollis/benchmarks/runs, by the script:
// <id>.json, the benchmark, the settings, the sample and the figures of each model; <id>.jsonl, the answers. One runner
// per window, so that a run goes on when the page is closed.

/** A question of a benchmark downloaded, as model_benchmarks.jl keeps it in questions.jsonl. */
export interface IBenchmarkQuestion {
	readonly id: string;
	readonly stratum: string;
	readonly question: string;
	readonly choices: readonly string[];
	readonly answer: string;
}

/** A stratum of a benchmark downloaded, and its number of questions. */
export interface IBenchmarkStratum {
	readonly name: string;
	readonly count: number;
}

/** What info.json says of a benchmark downloaded. */
export interface IBenchmarkInfo {
	readonly benchmark: string;
	/** The revision of the dataset on Hugging Face the questions come from. */
	readonly revision?: string;
	readonly downloaded: string;
	readonly count: number;
	readonly strata: readonly IBenchmarkStratum[];
}

/** The sample a run asks for: how many questions, from which strata (all when none is named), shared how, drawn with which seed. */
export interface IBenchmarkSampleRequest {
	readonly size: number;
	readonly strata?: readonly string[];
	readonly allocation: 'proportional' | 'equal';
	readonly seed: number;
}

/** How the models answer: the examples shown first, worked answers or the answer alone, thinking, and the most tokens of an answer. */
export interface IBenchmarkSettings {
	readonly shots: number;
	readonly reasoning: boolean;
	readonly thinking: boolean;
	readonly maxTokens: number;
}

export interface IBenchmarkModel {
	readonly value: string;
	readonly label: string;
	readonly size?: string;
}

/** A model's figures in a run, as model_benchmarks.jl computes them (figures). */
export interface IBenchmarkFigures {
	readonly value: string;
	readonly label: string;
	readonly questions: number;
	readonly failed: number;
	readonly score: number | null;
	readonly half: number | null;
	readonly right: number;
	/** The probability that answers picked at random would get as many right or more; null for a benchmark without options, absent in a run kept before it was measured. */
	readonly byChance?: number | null;
	readonly strata: readonly { readonly name: string; readonly asked: number; readonly right: number }[];
	readonly unread: number;
	readonly cutOff: number;
	readonly firstTokenMs: number | null;
	readonly readingSpeed: number | null;
	readonly writingSpeed: number | null;
	readonly seconds: number | null;
	readonly writtenTokens: number | null;
	readonly memory: number | null;
	readonly error: string | null;
}

/** A run as kept in <id>.json. */
export interface IBenchmarkRun {
	readonly id: string;
	readonly started: number;
	readonly pollis: string;
	readonly benchmark: string;
	/** The revision of the dataset on Hugging Face its questions came from. */
	readonly revision?: string;
	readonly settings: IBenchmarkSettings;
	readonly sample: {
		readonly seed: number;
		readonly allocation: string;
		readonly size: number;
		readonly strata: readonly { readonly name: string; readonly population: number; readonly size: number }[];
		readonly questions: readonly string[];
	};
	readonly models: readonly (IBenchmarkModel & { readonly error?: string })[];
	readonly figures?: readonly IBenchmarkFigures[];
}

/** An answer of a run, as kept in <id>.jsonl. */
export interface IBenchmarkAnswer {
	readonly model: string;
	readonly id: string;
	readonly stratum: string;
	readonly extracted?: string | null;
	readonly correct?: boolean;
	readonly text?: string;
	readonly finish?: string;
	readonly error?: string;
}

/** What a task ends with, or why it could not be done. */
export interface IBenchmarkEnd {
	readonly info?: IBenchmarkInfo;
	readonly run?: string;
	readonly error?: string;
	readonly stopped?: boolean;
}

interface IScriptAnswer {
	readonly lines?: readonly { readonly info?: IBenchmarkInfo; readonly run?: string }[];
	readonly errors?: { readonly [model: string]: string };
	readonly error?: string;
}

interface IScriptProgress {
	readonly status: 'starting' | 'installing' | 'loading' | 'running';
	readonly done: number;
	readonly total: number;
	readonly model: number;
	readonly models: number;
	readonly tokens?: readonly [number, number];
	/** The run's id, once its sample is drawn. */
	readonly run?: string;
}

/** The folder of Model Benchmarks, ~/.pollis/benchmarks. */
export async function benchmarksFolder(pathService: IPathService): Promise<URI> {
	return joinPath(await pathService.userHome({ preferLocal: true }), '.pollis', 'benchmarks');
}

export class ModelBenchmarksRunner {

	private readonly _onDidProgress = new Emitter<ICompareProgress | undefined>();
	/** How far the task has come, and nothing once it has ended. */
	readonly onDidProgress = this._onDidProgress.event;

	private readonly _onDidEnd = new Emitter<IBenchmarkEnd>();
	readonly onDidEnd = this._onDidEnd.event;

	private readonly _onDidAnswer = new Emitter<string>();
	/** The id of the run running, each time one of its models starts or a new answer of it is kept. */
	readonly onDidAnswer = this._onDidAnswer.event;

	private _running = false;
	private stopped = false;
	private _progress: ICompareProgress | undefined;
	private readonly sampler: CompareSampler;
	/** A new sample of the run; the first of a run starts its charts again. */
	readonly onDidSample: Event<ICompareSample>;

	constructor(
		@ICommandService private readonly commandService: ICommandService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IFileService private readonly fileService: IFileService,
		@IPathService private readonly pathService: IPathService,
		@IProductService private readonly productService: IProductService,
	) {
		this.sampler = new CompareSampler(commandService);
		this.onDidSample = this.sampler.onDidSample;
	}

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

	private end(end: IBenchmarkEnd): IBenchmarkEnd {
		this.sampler.stop();
		this._running = false;
		this._progress = undefined;
		this._onDidProgress.fire(undefined);
		this._onDidEnd.fire(end);
		return end;
	}

	stop(): void {
		this.stopped = true;
		this.commandService.executeCommand('language-julia.pollisModelBenchmarksStop').catch(() => undefined);
	}

	/** What went wrong, in words: Julia not found, or the script's own message. */
	private errorText(error: string): string {
		return error === 'noJulia'
			? localize('modelBenchmarks.noJulia', "Julia was not found: Pollis runs the benchmarks with Julia.")
			: error === 'running'
				? localize('modelBenchmarks.busy', "Wait for the run to end, or stop it.")
				: error === 'failed' ? localize('modelBenchmarks.failed', "The benchmark could not be run.") : error;
	}

	/** Runs `job` in the hidden Julia process, with `models` after it, its progress reported with `label(progress)`. */
	private async script(job: object, models: readonly IBenchmarkModel[], label: (progress: IScriptProgress) => string): Promise<IScriptAnswer> {
		let answered: string | undefined;
		const poll = mainWindow.setInterval(async () => {
			const progress = await this.commandService.executeCommand<IScriptProgress>('language-julia.pollisModelBenchmarksProgress').catch(() => undefined);
			if (!progress || !this._running) {
				return;
			}
			// A model started, or an answer kept: the run as it now is
			const now = progress.run ? `${progress.run}/${progress.model}/${progress.done}` : undefined;
			if (progress.run && now !== answered) {
				answered = now;
				this._onDidAnswer.fire(progress.run);
			}
			if (progress.tokens) {
				this.sampler.tokens = { read: progress.tokens[0], written: progress.tokens[1] };
			}
			this.report(label(progress), progress.done, progress.total);
		}, 1000);
		try {
			return await this.commandService.executeCommand<IScriptAnswer>('language-julia.pollisModelBenchmarks', { job, models }) ?? { error: 'failed' };
		} catch (err) {
			return { error: err instanceof Error ? err.message : String(err) };
		} finally {
			mainWindow.clearInterval(poll);
		}
	}

	/** Downloads `benchmark` into ~/.pollis/benchmarks/data, once. */
	async download(benchmark: string, name: string): Promise<IBenchmarkEnd> {
		if (this._running) {
			return { error: this.errorText('running') };
		}
		this._running = true;
		this.stopped = false;
		this.report(localize('modelBenchmarks.downloading', "Downloading {0}...", name));
		const answer = await this.script({ task: 'download', benchmark }, [], progress => progress.status === 'installing'
			? localize('modelBenchmarks.installing', "Installing JSON3.jl, the first time only.")
			: localize('modelBenchmarks.downloadingStep', "Downloading {0}: step {1} of {2}...", name, progress.done + 1, progress.total));
		const info = answer.lines?.find(line => line.info)?.info;
		return this.end(info ? { info } : { error: this.errorText(answer.error ?? 'failed') });
	}

	/** A run of `benchmark` on the sample `sample`, each model of `models` answering its questions in turn. */
	async run(benchmark: string, sample: IBenchmarkSampleRequest, settings: IBenchmarkSettings, models: readonly IBenchmarkModel[]): Promise<IBenchmarkEnd> {
		if (this._running) {
			return { error: this.errorText('running') };
		}
		if (!models.length) {
			return { error: localize('modelBenchmarks.noModels', "Choose the models to run, above.") };
		}
		if (!(sample.size > 0)) {
			return { error: localize('modelBenchmarks.noQuestions', "Choose how many questions to ask, above.") };
		}
		this._running = true;
		this.stopped = false;
		await this.sampler.start();
		this.sampler.mark('answer');
		// The chat model of Ask Pollis stopped, so that each model of the run is alone in memory
		await this.commandService.executeCommand('language-julia.pollisStopLlamaServer', { model: this.configurationService.getValue<string>('pollis.ask.chatModel')?.trim() || ASK_CHAT_MODEL }).catch(() => undefined);
		this.report(localize('modelBenchmarks.drawing', "Drawing the sample..."));
		const job = { task: 'start', benchmark, sample, settings, pollis: this.productService.pollisVersion ?? this.productService.version };
		const answer = await this.script(job, models, progress => {
			if (progress.status === 'installing') {
				return localize('modelBenchmarks.installing', "Installing JSON3.jl, the first time only.");
			}
			const model = models[progress.model - 1];
			if (!model) {
				return localize('modelBenchmarks.drawing', "Drawing the sample...");
			}
			return progress.status === 'running'
				? localize('modelBenchmarks.answering', "{0} ({1} of {2}): question {3} of {4}...", model.label, progress.model, progress.models, progress.done, progress.total)
				: localize('modelBenchmarks.loading', "Loading {0} into memory ({1} of {2})...", model.label, progress.model, progress.models);
		});
		const run = answer.lines?.find(line => line.run)?.run;
		if (!run) {
			return this.end({ error: this.errorText(answer.error ?? 'failed') });
		}
		const failed = Object.entries(answer.errors ?? {}).map(([value, error]) => localize('modelBenchmarks.modelFailed', "{0}: {1}", models.find(model => model.value === value)?.label ?? value, error));
		return this.end({ run, stopped: this.stopped, error: failed.length ? failed.join(' ') : undefined });
	}

	/** The runs kept, the latest first. */
	async runs(): Promise<IBenchmarkRun[]> {
		const folder = joinPath(await benchmarksFolder(this.pathService), 'runs');
		let names: string[] = [];
		try {
			names = ((await this.fileService.resolve(folder)).children ?? []).filter(child => !child.isDirectory && child.name.endsWith('.json')).map(child => child.name);
		} catch {
			return [];
		}
		const runs = await Promise.all(names.map(name => this.readJson<IBenchmarkRun>(joinPath(folder, name))));
		return runs.filter((run): run is IBenchmarkRun => !!run?.id).sort((a, b) => b.started - a.started);
	}

	async loadRun(id: string): Promise<IBenchmarkRun | undefined> {
		return this.readJson<IBenchmarkRun>(joinPath(await benchmarksFolder(this.pathService), 'runs', `${id}.json`));
	}

	/** The answers of the run `id`; a line cut off when a run was stopped is left out. */
	async loadAnswers(id: string): Promise<IBenchmarkAnswer[]> {
		return this.readLines<IBenchmarkAnswer>(joinPath(await benchmarksFolder(this.pathService), 'runs', `${id}.jsonl`));
	}

	async deleteRun(id: string): Promise<void> {
		const folder = joinPath(await benchmarksFolder(this.pathService), 'runs');
		for (const name of [`${id}.json`, `${id}.jsonl`]) {
			await this.fileService.del(joinPath(folder, name)).catch(() => undefined);
		}
	}

	/** What info.json says of `benchmark`, or nothing when it is not downloaded. */
	async info(benchmark: string): Promise<IBenchmarkInfo | undefined> {
		return this.readJson<IBenchmarkInfo>(joinPath(await benchmarksFolder(this.pathService), 'data', benchmark, 'info.json'));
	}

	async questions(benchmark: string): Promise<IBenchmarkQuestion[]> {
		return this.readLines<IBenchmarkQuestion>(joinPath(await benchmarksFolder(this.pathService), 'data', benchmark, 'questions.jsonl'));
	}

	private async readJson<T>(file: URI): Promise<T | undefined> {
		try {
			return JSON.parse((await this.fileService.readFile(file)).value.toString()) as T;
		} catch {
			return undefined;
		}
	}

	private async readLines<T>(file: URI): Promise<T[]> {
		let text: string;
		try {
			text = (await this.fileService.readFile(file)).value.toString();
		} catch {
			return [];
		}
		const values: T[] = [];
		for (const line of text.split('\n')) {
			if (line.trim()) {
				try {
					values.push(JSON.parse(line) as T);
				} catch {
					// A line cut off when the run was stopped
				}
			}
		}
		return values;
	}
}
