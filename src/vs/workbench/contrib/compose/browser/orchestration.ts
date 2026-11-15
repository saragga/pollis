/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../base/common/buffer.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { isWindows } from '../../../../base/common/platform.js';
import { basename, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { ITerminalInstance, ITerminalInstanceService } from '../../terminal/browser/terminal.js';
import { findPollisWorkspace, pollisWorkspaceFolderPath } from '../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { cellAvailable, CLOUD_PREFIX, cloudModels, IAgentCommand, ICellRun, cellRun, LOCAL_PREFIX, modelName } from './modelRouting.js';
import { IInstalledModel } from './modelsInstalledPage.js';
import { CODING_AGENTS, commandWords, findProgram, IAgentLaunchServices, knownAgent, launchAgent, terminalEnvironment } from './pollisAgents.js';

// What the pages of Compose > Orchestration share, where several coding agents work on the same research at once
// (Many Analysts, in manyAnalystsPage.ts): the command lines that run an agent to the end with no one to answer
// it, the cells of Model Tasks and Routing a page offers, and the folder of its studies. A page launches each run
// with launchAgent (pollisAgents.ts) and follows it by its terminal and by the files it writes.

/** An agent and a model a page can run unattended: a cell of Model Tasks and Routing, with its name. */
export interface IOrchestrationCell {
	readonly agent: string;
	/** CLOUD_PREFIX and a cloud model's name, or LOCAL_PREFIX and a local model's file. */
	readonly model: string;
	/** Agent and model, as the page shows them, such as `Claude Code · Claude Sonnet`. */
	readonly label: string;
}

/** The agents that run unattended, those that come with Pollis, with the command lines that do it; an agent of the user's own has none, so the pages do not offer it. */
function unattendedAgents(): IAgentCommand[] {
	return CODING_AGENTS.map(agent => ({ label: agent.label, command: agent.unattended }));
}

/**
 * The cells a page can run unattended: each agent that comes with Pollis installed on this computer with each
 * cloud model it has arguments for, then with each local chat model that can call tools, when it runs local models.
 */
export async function unattendedCells(configurationService: IConfigurationService, commandService: ICommandService, terminalInstanceService: ITerminalInstanceService, fileService: IFileService): Promise<IOrchestrationCell[]> {
	const environment = await terminalEnvironment(terminalInstanceService);
	const clouds = cloudModels(configurationService);
	const installed = (await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels') ?? []).filter(model => model.kind !== 'embedding' && model.kind !== 'reranker' && model.tools !== false);
	const cells: IOrchestrationCell[] = [];
	for (const agent of unattendedAgents()) {
		if (!await findProgram(commandWords(agent.command)[0], environment, fileService)) {
			continue;
		}
		const models = [
			...clouds.map(cloud => ({ model: CLOUD_PREFIX + cloud.name, name: cloud.name })),
			...installed.map(model => ({ model: LOCAL_PREFIX + model.file, name: model.name })),
		];
		for (const model of models) {
			if (cellAvailable(agent, model.model, clouds)) {
				cells.push({ agent: agent.label, model: model.model, label: localize('orchestration.cellLabel', "{0} · {1}", agent.label, model.name) });
			}
		}
	}
	return cells;
}

/** What a cell runs unattended: its command line, with its model's arguments, and its local model; undefined when it can run no more. */
export function unattendedRun(configurationService: IConfigurationService, cell: { readonly agent: string; readonly model: string }): ICellRun | undefined {
	return cellRun(configurationService, cell, unattendedAgents());
}

/**
 * The folder of a page's studies, `kind` such as `many-analysts`: in the folder orchestration of the open Pollis
 * Workspace, otherwise in ~/.pollis/orchestration.
 */
export async function studiesFolder(contextService: IWorkspaceContextService, fileService: IFileService, pathService: IPathService, kind: string): Promise<URI> {
	const workspace = await findPollisWorkspace(contextService, fileService);
	return workspace
		? joinPath(await pollisWorkspaceFolderPath(fileService, workspace, 'orchestration'), kind)
		: joinPath(await pathService.userHome({ preferLocal: true }), '.pollis', 'orchestration', kind);
}

/** Whether a study's name can be its folder's: letters, digits, hyphens and underscores, 1 to 60 of them. */
export function validStudyName(name: string): boolean {
	return /^[A-Za-z0-9][A-Za-z0-9_-]{0,59}$/.test(name);
}

/** The name of a study's folder: `base`, else `base-2`, `base-3`... the first of them not in `taken`. */
export function freeStudyName(base: string, taken: readonly string[]): string {
	let name = base;
	for (let index = 2; taken.includes(name); index++) {
		name = `${base}-${index}`;
	}
	return name;
}

/** A run of an agent of a study, while Pollis runs: its terminal, when it started and ended, its exit code, and whether the user stopped it. */
export interface IStudyAgentRun {
	readonly terminal: ITerminalInstance;
	readonly started: number;
	ended?: number;
	exitCode?: number;
	stopped?: boolean;
}

/**
 * Stops a running agent: its process ends, and its terminal stays open with what it wrote. Windows has no signals,
 * so there the agent gets Ctrl+C, as in its terminal.
 */
export async function stopAgentRun(run: IStudyAgentRun | undefined): Promise<void> {
	if (!run || run.ended !== undefined) {
		return;
	}
	run.stopped = true;
	if (isWindows) {
		await run.terminal.sendText('\x03', false);
	} else {
		await run.terminal.sendSignal('SIGTERM');
	}
}

/**
 * The runs of the agents of a page's studies since Pollis started, by study folder and by the agent's folder in it
 * (`analyst-1`, `proposer-2`, `coder`...), and what to call when one ends, set by the page while it is open.
 */
export class StudyRuns {
	private readonly runs = new Map<string, Map<string, IStudyAgentRun>>();
	onEnded: (() => void) | undefined;

	get(study: URI, key: string): IStudyAgentRun | undefined {
		return this.runs.get(study.toString())?.get(key);
	}

	/** Follows the run of an agent until its terminal closes. */
	follow(study: URI, key: string, terminal: ITerminalInstance): void {
		let studyRuns = this.runs.get(study.toString());
		if (!studyRuns) {
			studyRuns = new Map();
			this.runs.set(study.toString(), studyRuns);
		}
		const run: IStudyAgentRun = { terminal, started: Date.now() };
		studyRuns.set(key, run);
		const store = new DisposableStore();
		store.add(terminal.onExit(exit => {
			run.ended = Date.now();
			run.exitCode = typeof exit === 'number' ? exit : undefined;
			this.onEnded?.();
		}));
		store.add(terminal.onDisposed(() => {
			run.ended ??= Date.now();
			store.dispose();
			this.onEnded?.();
		}));
	}

	/**
	 * An agent's status, as the pages show it: running while its terminal runs; stopped once the user stopped it; done
	 * once `doneFile` is in its folder; failed when its run ended without it; ended when it ran before Pollis started
	 * and left no `doneFile`; waiting before its TASK.md is written.
	 */
	async state(fileService: IFileService, study: URI, key: string, label: string, doneFile: string) {
		const folder = joinPath(study, key);
		const [started, done] = await Promise.all([fileService.exists(joinPath(folder, 'TASK.md')), fileService.exists(joinPath(folder, doneFile))]);
		const run = this.get(study, key);
		const status = run && run.ended === undefined ? 'running'
			: run?.stopped ? 'stopped'
				: done ? 'done'
					: run ? 'failed'
						: started ? 'ended' : 'waiting';
		return { key, label, status, started: run?.started, ended: run?.ended, exitCode: run?.exitCode, hasFile: done, hasTerminal: !!run && !run.terminal.isDisposed };
	}
}

/** What a page gives startStudyAgent: the agent's folder in the study, its cell, skill and task, and its terminal. */
export interface IStudyAgentStart {
	readonly study: URI;
	/** The agent's folder in the study, such as `analyst-1`. */
	readonly key: string;
	readonly cell: { readonly agent: string; readonly model: string; readonly label: string };
	readonly skill: URI;
	readonly task: string;
	/** A folder of the study the agent gets a copy of, as `data/`, when there is one. */
	readonly data?: URI;
	readonly terminalName: string;
	readonly focus: boolean;
}

/**
 * Starts an agent of a study in its folder, with the skill as SKILL.md, its task as TASK.md and a copy of the data,
 * unattended, recorded in TRANSCRIPT.md and .transcript/ of its folder, and follows its run in `runs`; says why in a notification when it cannot start.
 */
export async function startStudyAgent(launchServices: IAgentLaunchServices, configurationService: IConfigurationService, notificationService: INotificationService, runs: StudyRuns, start: IStudyAgentStart): Promise<void> {
	const { fileService } = launchServices;
	const folder = joinPath(start.study, start.key);
	await fileService.copy(start.skill, joinPath(folder, 'SKILL.md'), true);
	await fileService.writeFile(joinPath(folder, 'TASK.md'), VSBuffer.fromString(start.task));
	if (start.data && await fileService.exists(start.data)) {
		await fileService.copy(start.data, joinPath(folder, 'data'), true);
	}
	const run = unattendedRun(configurationService, start.cell);
	const prompt = localize('orchestration.prompt', "Read SKILL.md and TASK.md in this folder and follow them, without asking me anything.");
	const known = knownAgent(start.cell.agent);
	const model = start.cell.model.startsWith(CLOUD_PREFIX) ? start.cell.model.slice(CLOUD_PREFIX.length) : modelName(start.cell.model.slice(LOCAL_PREFIX.length));
	const record = known && { folder, format: known.events, title: start.cell.label, agent: start.cell.agent, model };
	const launched = run ? await launchAgent(launchServices, { name: start.terminalName, run, prompt, cwd: folder, focus: start.focus, record }) : 'missing';
	if (typeof launched === 'string') {
		notificationService.error(launched === 'missing'
			? localize('orchestration.missing', "{0} did not start: it cannot be run on this computer.", start.cell.label)
			: localize('orchestration.failed', "{0} did not start: {1}", start.cell.label, launched));
		return;
	}
	runs.follow(start.study, start.key, launched);
}

/**
 * Julia functions that write a value as JSON with no package: `escaped(s)` and `to_json(x)`, for nothing, Bool,
 * numbers (null when not finite), strings, dictionaries and vectors. A page's Julia code puts them in its own scope.
 */
export const JULIA_TO_JSON = String.raw`	escaped(s) = join(c == '"' ? "\\\"" : c == '\\' ? "\\\\" : c < ' ' ? "\\u" * string(UInt16(c), base = 16, pad = 4) : string(c) for c in s)
	function to_json(x)
		x === nothing && return "null"
		x isa Bool && return string(x)
		x isa Integer && return string(x)
		x isa Real && return isfinite(x) ? repr(Float64(x)) : "null"
		x isa AbstractString && return "\"" * escaped(x) * "\""
		x isa AbstractDict && return "{" * join([to_json(string(k)) * ":" * to_json(v) for (k, v) in x], ",") * "}"
		x isa AbstractVector && return "[" * join(map(to_json, x), ",") * "]"
		x isa NamedTuple && return to_json(Dict(string(k) => v for (k, v) in pairs(x)))
		return to_json(string(x))
	end`;

/** Where a study's data come from: the example, LaLonde's job training data, or a file of the user's own. */
export type DataKind = 'example' | 'file';

/** The datasets of PollisDatasets of the example: the NSW experiment and LaLonde's six comparison groups. */
export const EXAMPLE_DATASETS = ['nsw', 'cps1', 'cps2', 'cps3', 'psid1', 'psid2', 'psid3'];

/** The question of the example, as a page first shows it. */
export function exampleQuestion(): string {
	return localize('manyAnalysts.exampleQuestion', "What is the effect of the National Supported Work job training programme on the earnings of the men who took part, in 1978?");
}

/** The estimate of the example, as a page first shows it. */
export function exampleEstimate(): string {
	return localize('manyAnalysts.exampleEstimate', "The average effect of the programme on the earnings of the men who took part (the average treatment effect on the treated), in 1978 dollars, with its standard error and 95% confidence interval.");
}

/** What the example's data are, as HTML under the choice of data. */
export function exampleDataHint(): string {
	return localize('manyAnalysts.exampleHint', "The National Supported Work (NSW) experiment, a job training programme that assigned men at random, with the earnings of its treated and control men ({0}), and six groups of men from two surveys ({1}), which LaLonde (1986) set in place of the experiment's controls to see whether nonexperimental methods find the experiment's effect. Each analyst loads them from PollisDatasets.", '<code>nsw</code>', '<code>cps1</code>&ndash;<code>cps3</code>, <code>psid1</code>&ndash;<code>psid3</code>');
}

/** The data of a study, as an agent's TASK.md describes them: how to load the example's datasets, or the file of the agent's folder. */
export function studyDataText(study: { readonly data: DataKind; readonly file: string; readonly description: string }): string {
	return study.data === 'example'
		? localize('manyAnalysts.task.exampleData', "The datasets {0} of PollisDatasets: LaLonde's data of the National Supported Work (NSW) experiment, a job training programme, and six nonexperimental comparison groups from the Current Population Survey (CPS) and the Panel Study of Income Dynamics (PSID). Load each with `using PollisDatasets; d = dataset(\"nsw\")`, a table whose columns are `d.treat`, `d.age`..., and read what its columns are with `datasetinfo(\"nsw\")`.", EXAMPLE_DATASETS.map(id => `\`${id}\``).join(', '))
		: localize('manyAnalysts.task.fileData', "The file `data/{0}` of this folder. {1}", basename(URI.file(study.file)), study.description);
}

/** A TOML string: JSON's escapes are TOML's. */
export function tomlString(value: string): string {
	return JSON.stringify(value);
}

/** The quantile `p` of sorted numbers, interpolated between the two nearest (type 7 of Hyndman and Fan). */
export function quantile(sorted: readonly number[], p: number): number {
	const position = (sorted.length - 1) * p;
	const below = Math.floor(position);
	const above = Math.min(below + 1, sorted.length - 1);
	return sorted[below] + (position - below) * (sorted[above] - sorted[below]);
}

/** The texts of step 1 of an orchestration page, Question and Data. */
export function studyStepText() {
	return {
		study: localize('manyAnalysts.study', "Study"),
		studyTooltip: localize('manyAnalysts.studyTooltip', "The name of the study's folder"),
		earlierNone: localize('manyAnalysts.earlierNone', "Earlier studies..."),
		newStudy: localize('manyAnalysts.newStudy', "New Study"),
		studyFolder: localize('manyAnalysts.studyFolder', "Each study is a folder in {0}.", '<span class="yellow" id="root"></span>'),
		data: localize('manyAnalysts.data', "Data"),
		example: localize('manyAnalysts.example', "LaLonde's Job Training"),
		ownFile: localize('manyAnalysts.ownFile', "A File of Your Own"),
		exampleHint: exampleDataHint(),
		file: localize('manyAnalysts.file', "File"),
		choose: localize('manyAnalysts.choose', "Choose..."),
		description: localize('manyAnalysts.description', "What the Columns Are"),
		descriptionPlaceholder: localize('manyAnalysts.descriptionPlaceholder', "One line for each column: its name, what it measures and its unit"),
		fileHint: localize('manyAnalysts.fileHint', "The file is copied into the study's folder, and each agent gets a copy of its own, with what the columns are."),
		question: localize('manyAnalysts.question', "Question"),
		questionHint: localize('manyAnalysts.questionHint', "In plain words, as you would ask a colleague."),
		exampleQuestion: exampleQuestion(),
		estimate: localize('manyAnalysts.estimate', "Estimate to Report"),
		estimateHint: localize('manyAnalysts.estimateHint', "What every analysis must report, and its unit: without a common estimate the answers cannot be compared."),
		exampleEstimate: exampleEstimate(),
		between: localize('manyAnalysts.between', "{0} to {1}"),
	};
}

/** Step 1 of an orchestration page: the study's name and folder, its data, the question and the estimate to report. */
export function studyStepHtml(text: ReturnType<typeof studyStepText>): string {
	return `
		<div class="row">
			<span class="small" title="${text.studyTooltip}">${text.study}</span> <input type="text" id="name" spellcheck="false">
			<select id="earlier"><option value="">${text.earlierNone}</option></select>
			<button class="link" id="newStudy" hidden>${text.newStudy}</button>
		</div>
		<p class="small">${text.studyFolder}</p>
		<div class="row choices"><span class="small">${text.data}</span>
			<label><input type="radio" name="data" value="example" checked> ${text.example}</label>
			<label><input type="radio" name="data" value="file"> ${text.ownFile}</label>
		</div>
		<p class="hint" id="exampleHint">${text.exampleHint}</p>
		<div id="fileFields" hidden>
			<div class="row"><span class="small">${text.file}</span> <input type="text" id="file" spellcheck="false"> <button class="action" id="chooseFile">${text.choose}</button></div>
			<label class="small field-label" for="description">${text.description}</label>
			<textarea id="description" class="ma-text" rows="4" placeholder="${text.descriptionPlaceholder}"></textarea>
			<p class="hint">${text.fileHint}</p>
		</div>
		<label class="small field-label" for="question">${text.question}</label>
		<textarea id="question" class="ma-text" rows="2"></textarea>
		<p class="hint">${text.questionHint}</p>
		<label class="small field-label" for="estimate">${text.estimate}</label>
		<textarea id="estimate" class="ma-text" rows="2"></textarea>
		<p class="hint">${text.estimateHint}</p>
`;
}

/** The styles the orchestration pages share: their fields, the agents' grid, tables, figures and the status of a run. */
export const orchestrationCss = `
		input[type=text] { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-panel-border)); border-radius: 2px; padding: 3px 6px; min-width: 18em; }
		input[type=text]:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		#file { min-width: 32em; }
		.field-label { display: block; margin: 12px 0 4px 0; }
		.ma-text { max-width: 900px; }
		.choices label { margin-right: 16px; }
		.analysts { display: grid; grid-template-columns: max-content minmax(0, 360px); gap: 6px 12px; align-items: center; margin-top: 8px; }
		.analysts select { width: 100%; }
		table.ma { width: auto; max-width: 100%; }
		table.ma td.choice { max-width: 220px; }
		.ma-figures { display: flex; flex-wrap: wrap; gap: 8px 32px; margin: 8px 0; }
		.ma-note { color: var(--vscode-descriptionForeground); max-width: 80ch; }
		.ma-figure .value { font-size: 18px; font-variant-numeric: tabular-nums; }
		.status-running { color: var(--vscode-textLink-foreground); }
		.status-failed, .status-ended { color: var(--vscode-errorForeground); }
		.links .link + .link { margin-left: 10px; }
`;

/**
 * Functions the scripts of the orchestration pages share, which need `TEXT.between`: escapeHtml, format and interval
 * for numbers, cellKey for an agent and model as an option's value, dataKind and drawData for step 1, and elapsed
 * for the time of a run.
 */
export const orchestrationPageJs = `
	function escapeHtml(value) {
		return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
	}
	function format(x) {
		if (typeof x !== 'number' || !isFinite(x)) {
			return '';
		}
		// The digits with a point for decimals, the thousands apart by a narrow no-break space, as a comma is the decimal
		// separator in many countries, and a minus sign, which a dash between two numbers cannot be taken for
		const rounded = Math.abs(x) >= 1000 ? Math.round(x) : Number(x.toPrecision(4));
		const [whole, fraction] = Math.abs(rounded).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 6 }).split('.');
		return (rounded < 0 ? '\\u2212' : '') + whole.replace(/\\B(?=(\\d{3})+(?!\\d))/g, '\\u202F') + (fraction ? '.' + fraction : '');
	}
	/** Two numbers as an interval, "a to b": a dash between them would read as a minus sign. */
	function interval(low, high) {
		return TEXT.between.replace('{0}', format(low)).replace('{1}', format(high));
	}
	/** The key of an agent and model, as the value of an option: a character that HTML keeps in an attribute separates them. */
	function cellKey(cell) {
		return encodeURIComponent(cell.agent) + '/' + encodeURIComponent(cell.model);
	}
	function dataKind() {
		const radio = document.querySelector('input[name=data]:checked');
		return radio ? radio.value : 'example';
	}
	function drawData() {
		const kind = dataKind();
		document.getElementById('exampleHint').hidden = kind !== 'example';
		document.getElementById('fileFields').hidden = kind !== 'file';
	}
	function elapsed(run) {
		if (!run.started) {
			return '';
		}
		const seconds = Math.round(((run.ended || Date.now()) - run.started) / 1000);
		return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
	}
`;
