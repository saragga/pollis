/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RunOnceScheduler } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { basename, joinPath } from '../../../../base/common/resources.js';
import { hasKey } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { sendToJuliaRepl } from '../../model/browser/handlers/model.handler.js';
import { folderUri } from '../../model/browser/handlers/scaffold.handler.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { parseToml } from '../../model/browser/common/tomlPanelData.js';
import { MANYANALYSTS_METADATA } from '../../model/browser/webviews/manyAnalysts.data.js';
import { buildWebviewHtml } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { ITerminalInstance, ITerminalInstanceService, ITerminalService } from '../../terminal/browser/terminal.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { compareCss } from './compareShared.js';
import { freeStudyName, IOrchestrationCell, studiesFolder, unattendedCells, unattendedRun, validStudyName } from './orchestration.js';
import { launchAgent, pollisJlPath, skillFile } from './pollisAgents.js';

// Many Analysts, from Compose > Orchestration (compose.contribution.ts): several coding agents get the same question
// and the same data, each answers it alone in a folder of its own, and the page shows how far their estimates
// spread. A page of the scaffold in the Time Arrow style, in four steps: 1, Question and Data (LaLonde's job
// training data, or a file of the user's own); 2, Analysts, each a cell of Model Tasks and Routing; 3, Runs, every
// analyst at once, unattended (orchestration.ts), each followed by its terminal and the files it writes; 4,
// Results, after Pollis has run each analysis again in Julia: the estimates in order, their spread and the choices
// behind them. A study is a folder, orchestration/many-analysts/<study> of the Pollis Workspace: study.toml, data/
// for a file of the user's own, analyst-1 to analyst-N, each with the analyse-independently skill as SKILL.md, its
// task as TASK.md and, once it has run, analysis.jl, estimate.toml, choices.toml and REPORT.md, then results.json.

export const MANY_ANALYSTS_COMMAND_ID = 'pollis.orchestration.manyAnalysts';

const KIND = 'many-analysts';
const SKILL = 'analyse-independently';
const STUDY_FILE = 'study.toml';
const RESULTS_FILE = 'results.json';
const MIN_ANALYSTS = 3;
const MAX_ANALYSTS = 12;
const DEFAULT_ANALYSTS = 5;

/** The datasets of PollisDatasets of the example: the NSW experiment and LaLonde's six comparison groups. */
const EXAMPLE_DATASETS = ['nsw', 'cps1', 'cps2', 'cps3', 'psid1', 'psid2', 'psid3'];

/** The number fields of estimate.toml, which analysis.jl writes. */
const ESTIMATE_FIELDS = ['estimate', 'std_error', 'ci_low', 'ci_high', 'n'] as const;

/** The kinds of choice of choices.toml, which the analyst writes. */
const CHOICE_FIELDS = ['sample', 'outcome', 'controls', 'estimator', 'standard_errors'] as const;

type DataKind = 'example' | 'file';

/** What the user sets in steps 1 and 2. */
interface IStudyInputs {
	readonly name: string;
	readonly question: string;
	readonly estimate: string;
	readonly data: DataKind;
	readonly file: string;
	readonly description: string;
	readonly analysts: readonly { readonly agent: string; readonly model: string }[];
}

/** A study as its study.toml records it. */
interface IStudy extends IStudyInputs {
	readonly folder: URI;
	readonly created: string;
	readonly analysts: readonly { readonly agent: string; readonly model: string; readonly label: string }[];
}

type EstimateField = typeof ESTIMATE_FIELDS[number];
type IEstimate = Readonly<Record<EstimateField, number>>;

/** An analyst's line of results.json, checked. */
interface IAnalystResult {
	readonly analyst: number;
	readonly reported?: IEstimate;
	readonly rerun?: IEstimate;
	/** Whether Pollis ran analysis.jl again: false when there is none. */
	readonly reran: boolean;
	readonly choices: Readonly<Record<string, string>>;
}

/** A run of an analyst's agent, while its terminal is there. */
interface IAnalystRun {
	readonly terminal: ITerminalInstance;
	readonly started: number;
	ended?: number;
	exitCode?: number;
}

/** The runs of every study started since Pollis started, by study folder and analyst. */
const runs = new Map<string, Map<number, IAnalystRun>>();

/** Called when a run ends, to draw the page again, while it is open. */
let onRunEnded: (() => void) | undefined;

type ManyAnalystsMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'start'; readonly inputs: IStudyInputs }
	| { readonly command: 'load'; readonly name: string }
	| { readonly command: 'newStudy' }
	| { readonly command: 'collect' }
	| { readonly command: 'open'; readonly analyst: number; readonly what: 'report' | 'code' | 'terminal' | 'log' }
	| { readonly command: 'chooseFile'; readonly value: string };

/** The open page, so a second request shows the same page. */
let openPage: WebviewInput | undefined;

/** The inputs of steps 1 and 2 as the page sent them, checked; undefined when they are not well formed. */
function checkedInputs(value: unknown): IStudyInputs | undefined {
	if (!value || typeof value !== 'object') {
		return undefined;
	}
	const record = value as Record<string, unknown>;
	const text = (key: string) => typeof record[key] === 'string' ? record[key] as string : undefined;
	const analysts = Array.isArray(record.analysts) ? record.analysts.filter((analyst): analyst is { agent: string; model: string } => typeof analyst?.agent === 'string' && typeof analyst?.model === 'string') : [];
	const [name, question, estimate, data, file, description] = ['name', 'question', 'estimate', 'data', 'file', 'description'].map(text);
	if (name === undefined || question === undefined || estimate === undefined || (data !== 'example' && data !== 'file') || file === undefined || description === undefined) {
		return undefined;
	}
	return { name: name.trim(), question: question.trim(), estimate: estimate.trim(), data, file: file.trim(), description: description.trim(), analysts: analysts.map(analyst => ({ agent: analyst.agent, model: analyst.model })) };
}

/** A TOML string: JSON's escapes are TOML's. */
function tomlString(value: string): string {
	return JSON.stringify(value);
}

function studyToml(study: IStudy): string {
	const lines = [
		'# Many Analysts: a study of Compose > Orchestration in Pollis',
		`question = ${tomlString(study.question)}`,
		`estimate = ${tomlString(study.estimate)}`,
		`data = ${tomlString(study.data)}`,
		...(study.data === 'file' ? [`file = ${tomlString(study.file)}`, `description = ${tomlString(study.description)}`] : [`datasets = [${EXAMPLE_DATASETS.map(tomlString).join(', ')}]`]),
		`created = ${tomlString(study.created)}`,
	];
	for (const analyst of study.analysts) {
		lines.push('', '[[analysts]]', `agent = ${tomlString(analyst.agent)}`, `model = ${tomlString(analyst.model)}`, `label = ${tomlString(analyst.label)}`);
	}
	return lines.join('\n') + '\n';
}

async function readStudy(fileService: IFileService, folder: URI): Promise<IStudy | undefined> {
	try {
		const toml = parseToml((await fileService.readFile(joinPath(folder, STUDY_FILE))).value.toString());
		const text = (key: string) => typeof toml[key] === 'string' ? toml[key] as string : '';
		const analysts = (Array.isArray(toml.analysts) ? toml.analysts as Record<string, unknown>[] : []).map(entry => {
			const value = (key: string) => typeof entry?.[key] === 'string' ? entry[key] as string : '';
			return { agent: value('agent'), model: value('model'), label: value('label') || value('agent') };
		});
		return { folder, name: basename(folder), question: text('question'), estimate: text('estimate'), data: text('data') === 'file' ? 'file' : 'example', file: text('file'), description: text('description'), created: text('created'), analysts };
	} catch {
		return undefined;
	}
}

/** The study's task, as each analyst reads it in TASK.md. */
function taskText(study: IStudy, analysts: number): string {
	const data = study.data === 'example'
		? localize('manyAnalysts.task.exampleData', "The datasets {0} of PollisDatasets: LaLonde's data of the National Supported Work (NSW) experiment, a job training programme, and six nonexperimental comparison groups from the Current Population Survey (CPS) and the Panel Study of Income Dynamics (PSID). Load each with `using PollisDatasets; d = dataset(\"nsw\")`, a table whose columns are `d.treat`, `d.age`..., and read what its columns are with `datasetinfo(\"nsw\")`.", EXAMPLE_DATASETS.map(id => `\`${id}\``).join(', '))
		: localize('manyAnalysts.task.fileData', "The file `data/{0}` of this folder. {1}", basename(URI.file(study.file)), study.description);
	return [
		localize('manyAnalysts.task.title', "# Your Task"),
		'',
		localize('manyAnalysts.task.intro', "You are one of {0} analysts who answer the same question on the same data, each on their own. Follow SKILL.md, in this folder.", analysts),
		'',
		localize('manyAnalysts.task.question', "## The Question"),
		'',
		study.question,
		'',
		localize('manyAnalysts.task.estimate', "## The Estimate to Report"),
		'',
		study.estimate,
		'',
		localize('manyAnalysts.task.data', "## The Data"),
		'',
		data,
		'',
		localize('manyAnalysts.task.julia', "## Running Julia"),
		'',
		localize('manyAnalysts.task.juliaText', "Run your analysis from this folder with the command below, which gives Julia the packages of Pollis, PollisDatasets among them:"),
		'',
		'```sh',
		`julia -L "${pollisJlPath()}" analysis.jl`,
		'```',
		'',
	].join('\n');
}

/** A finite number of a parsed JSON value, else undefined. */
function finite(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** The five numbers of an estimate.toml, as results.json gives them; undefined when one is missing. */
function estimateOf(value: unknown): IEstimate | undefined {
	if (!value || typeof value !== 'object') {
		return undefined;
	}
	const record = value as Record<string, unknown>;
	const numbers: Partial<Record<EstimateField, number>> = {};
	for (const field of ESTIMATE_FIELDS) {
		const number = finite(record[field]);
		if (number === undefined) {
			return undefined;
		}
		numbers[field] = number;
	}
	return numbers as IEstimate;
}

/** The analysts of results.json, checked; undefined when there is none or it cannot be read. */
async function readResults(fileService: IFileService, folder: URI): Promise<{ collected: string; analysts: IAnalystResult[] } | undefined> {
	try {
		const json = JSON.parse((await fileService.readFile(joinPath(folder, RESULTS_FILE))).value.toString());
		const analysts: IAnalystResult[] = [];
		for (const entry of Array.isArray(json?.analysts) ? json.analysts : []) {
			const analyst = finite(entry?.analyst);
			if (analyst === undefined) {
				continue;
			}
			const choices: Record<string, string> = {};
			for (const field of CHOICE_FIELDS) {
				const value = entry?.choices?.[field];
				choices[field] = Array.isArray(value) ? value.map(String).join(', ') : value === undefined || value === null ? '' : String(value);
			}
			analysts.push({ analyst, reported: estimateOf(entry.reported), rerun: estimateOf(entry.rerun), reran: hasKey(entry, { rerun: true }), choices });
		}
		return { collected: typeof json?.collected === 'string' ? json.collected : '', analysts };
	} catch {
		return undefined;
	}
}

/** Whether two estimates agree: the same n, and the other numbers within a millionth of each other. */
function sameEstimate(a: IEstimate, b: IEstimate): boolean {
	const close = (x: number, y: number) => Math.abs(x - y) <= 1e-6 * Math.max(1, Math.abs(x), Math.abs(y));
	return a.n === b.n && close(a.estimate, b.estimate) && close(a.std_error, b.std_error) && close(a.ci_low, b.ci_low) && close(a.ci_high, b.ci_high);
}

/** The quantile `p` of sorted numbers, interpolated between the two nearest (type 7 of Hyndman and Fan). */
function quantile(sorted: readonly number[], p: number): number {
	const position = (sorted.length - 1) * p;
	const below = Math.floor(position);
	const above = Math.min(below + 1, sorted.length - 1);
	return sorted[below] + (position - below) * (sorted[above] - sorted[below]);
}

/**
 * The Julia code that runs each analyst's analysis.jl again, in a new Julia process, in an empty folder with only
 * the study's data, and collects into results.json what each analyst reported, what the rerun gave and its choices.
 */
function collectCode(study: IStudy, analysts: number): string {
	return String.raw`# Many Analysts: run each analyst's analysis.jl again, in a new Julia process and an empty folder with only the
# study's data, then collect what each reported, what the rerun gave and the choices into results.json
import TOML
let study = raw"${study.folder.fsPath}", pollis = raw"${pollisJlPath()}", analysts = ${analysts}, copy_data = ${study.data === 'file'}
	read_toml(file) = isfile(file) ? (try TOML.parsefile(file) catch; nothing end) : nothing
	escaped(s) = join(c == '"' ? "\\\"" : c == '\\' ? "\\\\" : c < ' ' ? "\\u" * string(UInt16(c), base = 16, pad = 4) : string(c) for c in s)
	function to_json(x)
		x === nothing && return "null"
		x isa Bool && return string(x)
		x isa Integer && return string(x)
		x isa Real && return isfinite(x) ? repr(Float64(x)) : "null"
		x isa AbstractString && return "\"" * escaped(x) * "\""
		x isa AbstractDict && return "{" * join([to_json(string(k)) * ":" * to_json(v) for (k, v) in x], ",") * "}"
		x isa AbstractVector && return "[" * join(map(to_json, x), ",") * "]"
		return to_json(string(x))
	end
	results = Dict{String, Any}[]
	for k in 1:analysts
		folder = joinpath(study, "analyst-$k")
		entry = Dict{String, Any}("analyst" => k, "reported" => read_toml(joinpath(folder, "estimate.toml")), "choices" => read_toml(joinpath(folder, "choices.toml")))
		if isfile(joinpath(folder, "analysis.jl"))
			dir = mktempdir()
			cp(joinpath(folder, "analysis.jl"), joinpath(dir, "analysis.jl"))
			copy_data && cp(joinpath(study, "data"), joinpath(dir, "data"))
			println("Analyst $k: running analysis.jl again")
			command = Cmd(Cmd([Base.julia_cmd().exec; "-L"; pollis; "analysis.jl"]); dir = dir)
			ok = open(log -> success(pipeline(command; stdout = log, stderr = log)), joinpath(folder, "rerun.log"), "w")
			entry["rerun"] = ok ? read_toml(joinpath(dir, "estimate.toml")) : nothing
			ok || println("Analyst $k: analysis.jl failed, see ", joinpath(folder, "rerun.log"))
		end
		push!(results, entry)
	end
	write(joinpath(study, "${RESULTS_FILE}"), to_json(Dict("collected" => Libc.strftime("%Y-%m-%d %H:%M", time()), "analysts" => results)))
	println("Collected into ", joinpath(study, "${RESULTS_FILE}"))
end`;
}

/** Opens the Many Analysts page, or shows it when it is open. */
async function openManyAnalystsPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const fileService = accessor.get(IFileService);
	const editorService = accessor.get(IEditorService);
	const commandService = accessor.get(ICommandService);
	const openerService = accessor.get(IOpenerService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const pathService = accessor.get(IPathService);
	const storageService = accessor.get(IStorageService);
	const contextService = accessor.get(IWorkspaceContextService);
	const configurationService = accessor.get(IConfigurationService);
	const fileDialogService = accessor.get(IFileDialogService);
	const terminalService = accessor.get(ITerminalService);
	const terminalInstanceService = accessor.get(ITerminalInstanceService);
	const progressService = accessor.get(IProgressService);
	const instantiationService = accessor.get(IInstantiationService);
	const launchServices = { terminalService, terminalInstanceService, fileService, commandService, progressService, workspaceContextService: contextService, pathService };

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('manyAnalysts.title', "Many Analysts");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.manyAnalysts',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml());
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'manyAnalysts', title, MANYANALYSTS_METADATA.manyAnalysts, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));

	/** The study shown in steps 3 and 4, once started or opened; its folder is watched. */
	let current: IStudy | undefined;
	const watcher = disposables.add(new MutableDisposable<DisposableStore>());
	const refresh = disposables.add(new RunOnceScheduler(() => sendState(), 300));
	onRunEnded = () => refresh.schedule();

	const watch = (study: IStudy | undefined) => {
		current = study;
		if (!study) {
			watcher.clear();
			return;
		}
		// The study's folder, for results.json, and each analyst's, for the files it writes
		const store = new DisposableStore();
		for (const folder of [study.folder, ...study.analysts.map((_, index) => joinPath(study.folder, `analyst-${index + 1}`))]) {
			const fileWatcher = store.add(fileService.createWatcher(folder, { recursive: false, excludes: [] }));
			store.add(fileWatcher.onDidChange(() => refresh.schedule()));
		}
		watcher.value = store;
	};

	/** The status of each analyst of the current study: from its run while its terminal is there, else from its files. */
	const analystsState = async (study: IStudy) => {
		const studyRuns = runs.get(study.folder.toString());
		return Promise.all(study.analysts.map(async (analyst, index) => {
			const k = index + 1;
			const folder = joinPath(study.folder, `analyst-${k}`);
			const [started, hasEstimate, hasChoices, hasReport, hasCode, hasLog] = await Promise.all(['TASK.md', 'estimate.toml', 'choices.toml', 'REPORT.md', 'analysis.jl', 'rerun.log'].map(file => fileService.exists(joinPath(folder, file))));
			const run = studyRuns?.get(k);
			const finished = hasEstimate && hasChoices;
			const status = run && run.ended === undefined ? 'running'
				: finished ? 'done'
					: run ? 'failed'
						: started ? 'ended' : 'waiting';
			return {
				label: analyst.label,
				status,
				started: run?.started,
				ended: run?.ended,
				exitCode: run?.exitCode,
				hasReport,
				hasCode,
				hasLog,
				hasTerminal: !!run && !run.terminal.isDisposed,
			};
		}));
	};

	/** The results of the current study, as the page draws them: each analyst's, then the spread of the estimates. */
	const resultsState = async (study: IStudy) => {
		const results = await readResults(fileService, study.folder);
		if (!results) {
			return undefined;
		}
		const rows = results.analysts.filter(row => row.analyst >= 1 && row.analyst <= study.analysts.length).map(row => ({
			analyst: row.analyst,
			label: study.analysts[row.analyst - 1].label,
			reported: row.reported,
			rerun: row.rerun,
			reproduced: row.reported && row.rerun ? sameEstimate(row.reported, row.rerun) : undefined,
			rerunFailed: row.reran && !row.rerun,
			choices: row.choices,
		}));
		const estimates = rows.flatMap(row => row.reported ? [row.reported.estimate] : []).sort((a, b) => a - b);
		const errors = rows.flatMap(row => row.reported ? [row.reported.std_error] : []).sort((a, b) => a - b);
		const mean = estimates.reduce((sum, x) => sum + x, 0) / Math.max(estimates.length, 1);
		const spread = estimates.length >= 2 ? {
			count: estimates.length,
			median: quantile(estimates, 0.5),
			q1: quantile(estimates, 0.25),
			q3: quantile(estimates, 0.75),
			min: estimates[0],
			max: estimates[estimates.length - 1],
			nonstandardError: Math.sqrt(estimates.reduce((sum, x) => sum + (x - mean) ** 2, 0) / (estimates.length - 1)),
			medianStdError: quantile(errors, 0.5),
		} : undefined;
		return { collected: results.collected, rows, spread };
	};

	const studyNames = async (root: URI): Promise<string[]> => {
		if (!await fileService.exists(root)) {
			return [];
		}
		const stat = await fileService.resolve(root, { resolveMetadata: true });
		const studies = [];
		for (const child of stat.children ?? []) {
			if (child.isDirectory && await fileService.exists(joinPath(child.resource, STUDY_FILE))) {
				studies.push(child);
			}
		}
		return studies.sort((a, b) => b.mtime - a.mtime).map(child => child.name);
	};

	let cells: IOrchestrationCell[] = [];
	const sendState = async () => {
		const root = await studiesFolder(contextService, fileService, pathService, KIND);
		const studies = await studyNames(root);
		const study = current && await readStudy(fileService, current.folder);
		post({
			command: 'state',
			root: root.fsPath,
			studies,
			cells,
			suggestion: freeStudyName('nsw-training', studies),
			study: study && {
				name: study.name,
				question: study.question,
				estimate: study.estimate,
				data: study.data,
				file: study.file,
				description: study.description,
				analysts: await analystsState(study),
				results: await resultsState(study),
			},
		});
	};

	/** Checks the inputs of steps 1 and 2; returns why they cannot start, else undefined. */
	const problem = async (inputs: IStudyInputs, root: URI): Promise<string | undefined> => {
		if (!validStudyName(inputs.name)) {
			return localize('manyAnalysts.badName', "The study's name is its folder's: letters, digits, hyphens and underscores, starting with a letter or digit.");
		}
		if (await fileService.exists(joinPath(root, inputs.name))) {
			return localize('manyAnalysts.taken', "There is a study {0} already: open it from the list, or give the new one another name.", inputs.name);
		}
		if (!inputs.question.trim() || !inputs.estimate.trim()) {
			return localize('manyAnalysts.noQuestion', "Write the question, and the estimate every analyst must report.");
		}
		if (inputs.data === 'file' && (!inputs.file.trim() || !await fileService.exists(URI.file(inputs.file.trim())))) {
			return localize('manyAnalysts.noFile', "Choose the file of your data.");
		}
		if (inputs.analysts.length < MIN_ANALYSTS || inputs.analysts.length > MAX_ANALYSTS) {
			return localize('manyAnalysts.count', "A study has from {0} to {1} analysts.", MIN_ANALYSTS, MAX_ANALYSTS);
		}
		if (inputs.analysts.some(analyst => !cells.some(cell => cell.agent === analyst.agent && cell.model === analyst.model))) {
			return localize('manyAnalysts.noCell', "Choose an agent and a model for every analyst.");
		}
		return undefined;
	};

	/** Writes the study's folder and starts every analyst, each in its own folder and terminal. */
	const start = async (inputs: IStudyInputs) => {
		const root = await studiesFolder(contextService, fileService, pathService, KIND);
		const reason = await problem(inputs, root);
		if (reason) {
			post({ command: 'startProblem', text: reason });
			return;
		}
		const skill = await instantiationService.invokeFunction(skillFile, SKILL);
		if (!skill || !await fileService.exists(skill)) {
			post({ command: 'startProblem', text: localize('manyAnalysts.noSkill', "The skill {0} of the Pollis Agents plugin could not be found.", SKILL) });
			return;
		}
		const folder = joinPath(root, inputs.name);
		const file = inputs.data === 'file' ? URI.file(inputs.file.trim()) : undefined;
		const study: IStudy = {
			...inputs,
			folder,
			file: file ? `data/${basename(file)}` : '',
			created: new Date().toISOString().slice(0, 16).replace('T', ' '),
			analysts: inputs.analysts.map(analyst => ({ ...analyst, label: cells.find(cell => cell.agent === analyst.agent && cell.model === analyst.model)!.label })),
		};
		await fileService.writeFile(joinPath(folder, STUDY_FILE), VSBuffer.fromString(studyToml(study)));
		if (file) {
			await fileService.copy(file, joinPath(folder, 'data', basename(file)));
			await fileService.writeFile(joinPath(folder, 'data', 'README.md'), VSBuffer.fromString(`# ${basename(file)}\n\n${inputs.description.trim()}\n`));
		}
		current = study;

		const studyRuns = new Map<number, IAnalystRun>();
		runs.set(folder.toString(), studyRuns);
		const task = taskText(study, study.analysts.length);
		const prompt = localize('manyAnalysts.prompt', "Read SKILL.md and TASK.md in this folder and follow them: answer the question of TASK.md on your own, without asking me anything.");
		for (const [index, analyst] of study.analysts.entries()) {
			const k = index + 1;
			const analystFolder = joinPath(folder, `analyst-${k}`);
			await fileService.copy(skill, joinPath(analystFolder, 'SKILL.md'), true);
			await fileService.writeFile(joinPath(analystFolder, 'TASK.md'), VSBuffer.fromString(task));
			if (file) {
				await fileService.copy(joinPath(folder, 'data'), joinPath(analystFolder, 'data'), true);
			}
			const run = unattendedRun(configurationService, analyst);
			const launched = run ? await launchAgent(launchServices, {
				name: localize('manyAnalysts.terminal', "Many Analysts: {0}, Analyst {1} ({2})", study.name, k, analyst.label),
				run,
				prompt,
				cwd: analystFolder,
				focus: k === 1,
			}) : 'missing';
			if (typeof launched === 'string') {
				notificationService.error(launched === 'missing'
					? localize('manyAnalysts.missing', "Analyst {0} did not start: {1} cannot be run on this computer.", k, analyst.label)
					: localize('manyAnalysts.failed', "Analyst {0} did not start: {1}", k, launched));
				continue;
			}
			const analystRun: IAnalystRun = { terminal: launched, started: Date.now() };
			studyRuns.set(k, analystRun);
			const runStore = new DisposableStore();
			runStore.add(launched.onExit(exit => {
				analystRun.ended = Date.now();
				analystRun.exitCode = typeof exit === 'number' ? exit : undefined;
				onRunEnded?.();
			}));
			runStore.add(launched.onDisposed(() => {
				analystRun.ended ??= Date.now();
				runStore.dispose();
				onRunEnded?.();
			}));
		}
		watch(study);
		await sendState();
	};

	const openFile = async (analyst: number, what: 'report' | 'code' | 'terminal' | 'log') => {
		if (!current) {
			return;
		}
		if (what === 'terminal') {
			const run = runs.get(current.folder.toString())?.get(analyst);
			if (run && !run.terminal.isDisposed) {
				terminalService.setActiveInstance(run.terminal);
				await terminalService.revealTerminal(run.terminal);
			}
			return;
		}
		const file = { report: 'REPORT.md', code: 'analysis.jl', log: 'rerun.log' }[what];
		await editorService.openEditor({ resource: joinPath(current.folder, `analyst-${analyst}`, file) });
	};

	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		onRunEnded = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: ManyAnalystsMessage }) => {
		const message = e.message;
		try {
			if (message.command === 'ready') {
				cells = await unattendedCells(configurationService, commandService, terminalInstanceService, fileService);
				await sendState();
			} else if (message.command === 'start' && hasKey(message, { inputs: true })) {
				const inputs = checkedInputs(message.inputs);
				if (inputs) {
					await start(inputs);
				}
			} else if (message.command === 'load' && hasKey(message, { name: true }) && validStudyName(message.name)) {
				const root = await studiesFolder(contextService, fileService, pathService, KIND);
				watch(await readStudy(fileService, joinPath(root, message.name)));
				await sendState();
			} else if (message.command === 'newStudy') {
				watch(undefined);
				await sendState();
			} else if (message.command === 'collect' && current) {
				await sendToJuliaRepl(collectCode(current, current.analysts.length), commandService);
				post({ command: 'collecting' });
			} else if (message.command === 'open' && hasKey(message, { analyst: true, what: true }) && Number.isInteger(message.analyst) && ['report', 'code', 'terminal', 'log'].includes(message.what)) {
				await openFile(message.analyst, message.what);
			} else if (message.command === 'chooseFile' && hasKey(message, { value: true })) {
				const home = await pathService.userHome({ preferLocal: true });
				const value = folderUri(message.value, home);
				const picked = await fileDialogService.showOpenDialog({
					title: localize('manyAnalysts.chooseFile', "Choose the Data"),
					canSelectFiles: true,
					canSelectFolders: false,
					canSelectMany: false,
					filters: [{ name: localize('manyAnalysts.dataFiles', "Data"), extensions: ['csv', 'tsv', 'parquet', 'arrow', 'json', 'xlsx', 'duckdb'] }],
					defaultUri: await fileService.exists(value) ? value : home,
				});
				if (picked?.[0]) {
					post({ command: 'file', value: picked[0].fsPath });
				}
			}
		} catch (error) {
			notificationService.error(toErrorMessage(error));
		}
	}));
}

function pageHtml(): string {
	const text = {
		intro: localize('manyAnalysts.intro', "Many Analysts gives the same question and the same data to several coding agents, each of which answers it on its own, in a folder of its own, as a researcher would. Different teams given the same data reach different answers, through the sample, the controls, the estimator and the standard errors each chooses; Many Analysts shows how far the estimates spread, and which choices move them. The example asks for the effect of a job training programme on earnings, with LaLonde's data."),
		questionAndData: localize('manyAnalysts.questionAndData', "Question and Data"),
		study: localize('manyAnalysts.study', "Study"),
		studyTooltip: localize('manyAnalysts.studyTooltip', "The name of the study's folder"),
		earlier: localize('manyAnalysts.earlier', "Open a Study"),
		earlierNone: localize('manyAnalysts.earlierNone', "Earlier studies..."),
		newStudy: localize('manyAnalysts.newStudy', "New Study"),
		studyFolder: localize('manyAnalysts.studyFolder', "Each study is a folder in {0}.", '<span class="yellow" id="root"></span>'),
		data: localize('manyAnalysts.data', "Data"),
		example: localize('manyAnalysts.example', "LaLonde's Job Training"),
		ownFile: localize('manyAnalysts.ownFile', "A File of Your Own"),
		exampleHint: localize('manyAnalysts.exampleHint', "The National Supported Work (NSW) experiment, a job training programme that assigned men at random, with the earnings of its treated and control men ({0}), and six groups of men from two surveys ({1}), which LaLonde (1986) set in place of the experiment's controls to see whether nonexperimental methods find the experiment's effect. Each analyst loads them from PollisDatasets.", '<code>nsw</code>', '<code>cps1</code>&ndash;<code>cps3</code>, <code>psid1</code>&ndash;<code>psid3</code>'),
		file: localize('manyAnalysts.file', "File"),
		choose: localize('manyAnalysts.choose', "Choose..."),
		description: localize('manyAnalysts.description', "What the Columns Are"),
		descriptionPlaceholder: localize('manyAnalysts.descriptionPlaceholder', "One line for each column: its name, what it measures and its unit"),
		fileHint: localize('manyAnalysts.fileHint', "The file is copied into the study's folder, and each analyst gets a copy of its own, with what the columns are."),
		question: localize('manyAnalysts.question', "Question"),
		questionHint: localize('manyAnalysts.questionHint', "In plain words, as you would ask a colleague."),
		exampleQuestion: localize('manyAnalysts.exampleQuestion', "What is the effect of the National Supported Work job training programme on the earnings of the men who took part, in 1978?"),
		estimate: localize('manyAnalysts.estimate', "Estimate to Report"),
		estimateHint: localize('manyAnalysts.estimateHint', "What every analyst must report, and its unit: without a common estimate the answers cannot be compared."),
		exampleEstimate: localize('manyAnalysts.exampleEstimate', "The average effect of the programme on the earnings of the men who took part (the average treatment effect on the treated), in 1978 dollars, with its standard error and 95% confidence interval."),
		analysts: localize('manyAnalysts.analysts', "Analysts"),
		howMany: localize('manyAnalysts.howMany', "How Many"),
		analyst: localize('manyAnalysts.analyst', "Analyst {0}"),
		analystsHint: localize('manyAnalysts.analystsHint', "Each analyst is a coding agent on a model: those of Model Tasks and Routing that can run to the end with no one to answer them, which are Claude Code, Codex and OpenCode, installed on this computer. Different models give a fairer spread than one model several times."),
		repeated: localize('manyAnalysts.repeated', "{0} is chosen more than once: one model tends to make the same choices each time, so its analysts spread less than different researchers would."),
		noCells: localize('manyAnalysts.noCells', "No coding agent that can run on its own was found on this computer: install Claude Code, Codex or OpenCode, then open this page again."),
		runs: localize('manyAnalysts.runs', "Runs"),
		runsHint: localize('manyAnalysts.runsHint', "Start writes the study's folder and starts every analyst at once, each in a terminal of its own and in its own folder, with the analyse-independently skill and the task: it sees the question, the data and its folder, never the other analysts'. It edits files only in its folder, and Claude Code runs no command but Julia. An analyst runs for several minutes, and each run is billed by its agent's provider, as any run of the agent is."),
		start: localize('manyAnalysts.start', "Start the Analysts"),
		status: localize('manyAnalysts.status', "Status"),
		time: localize('manyAnalysts.time', "Time"),
		open: localize('manyAnalysts.open', "Open"),
		statuses: {
			waiting: localize('manyAnalysts.waiting', "Waiting"),
			running: localize('manyAnalysts.running', "Running"),
			done: localize('manyAnalysts.done', "Done"),
			failed: localize('manyAnalysts.failedStatus', "Ended without results"),
			ended: localize('manyAnalysts.ended', "Ended without results"),
		},
		exit: localize('manyAnalysts.exit', "exit code {0}"),
		report: localize('manyAnalysts.report', "Report"),
		code: localize('manyAnalysts.code', "Code"),
		terminal: localize('manyAnalysts.terminalLink', "Terminal"),
		log: localize('manyAnalysts.log', "Rerun Log"),
		noStudy: localize('manyAnalysts.noStudy', "No study is running: start one, or open an earlier one in step 1."),
		results: localize('manyAnalysts.results', "Results"),
		resultsHint: localize('manyAnalysts.resultsHint', "Check and Collect runs each analyst's analysis.jl again in the Julia REPL, in a new Julia process and an empty folder with only the data, and checks that it gives the numbers the analyst reported; then it collects every estimate and choice into {0}. Run it once the analysts are done.", '<span class="yellow">results.json</span>'),
		collect: localize('manyAnalysts.collect', "Check and Collect"),
		collecting: localize('manyAnalysts.collecting', "Sent to the Julia REPL: each analysis runs there again, then the results show here."),
		collected: localize('manyAnalysts.collected', "Collected {0}."),
		spread: localize('manyAnalysts.spread', "The Spread"),
		median: localize('manyAnalysts.median', "Median Estimate"),
		iqr: localize('manyAnalysts.iqr', "Interquartile Range (Q1 to Q3)"),
		between: localize('manyAnalysts.between', "{0} to {1}"),
		range: localize('manyAnalysts.range', "Range"),
		nse: localize('manyAnalysts.nse', "Nonstandard Error*"),
		nseNote: localize('manyAnalysts.nseNote', "* The standard deviation of the analysts' estimates: the uncertainty that comes from the analysts' choices, as the standard error measures the uncertainty that comes from the data. The term comes from Menkveld and 342 coauthors (2024), \"Nonstandard Errors\", in the Journal of Finance. They gave 164 research teams the same hypotheses to test on the same data, and found the spread across the teams sizable, and larger than the teams themselves expected."),
		nseTooltip: localize('manyAnalysts.nseTooltip', "The standard deviation of the estimates across the analysts"),
		medianSe: localize('manyAnalysts.medianSe', "Median Standard Error"),
		ratio: localize('manyAnalysts.ratio', "The nonstandard error is {0} times the median standard error the analysts reported."),
		fewResults: localize('manyAnalysts.fewResults', "The spread needs the estimates of two analysts or more."),
		estimates: localize('manyAnalysts.estimates', "The Estimates"),
		plotHint: localize('manyAnalysts.plotHint', "Each analyst's estimate and 95% confidence interval, in order; the band is the interquartile range and the dashed line the median. An estimate in red did not come out the same when Pollis ran the analysis again."),
		choices: localize('manyAnalysts.choices', "The Choices"),
		agentModel: localize('manyAnalysts.agentModel', "Agent and Model"),
		estimateColumn: localize('manyAnalysts.estimateColumn', "Estimate"),
		stdError: localize('manyAnalysts.stdError', "Std. Error"),
		interval: localize('manyAnalysts.interval', "95% Interval"),
		n: localize('manyAnalysts.n', "n"),
		choiceNames: {
			sample: localize('manyAnalysts.sample', "Sample"),
			outcome: localize('manyAnalysts.outcome', "Outcome"),
			controls: localize('manyAnalysts.controls', "Controls"),
			estimator: localize('manyAnalysts.estimator', "Estimator"),
			standard_errors: localize('manyAnalysts.standardErrors', "Standard Errors"),
		},
		reproduced: localize('manyAnalysts.reproduced', "Reproduced"),
		yes: localize('manyAnalysts.yes', "Yes"),
		no: localize('manyAnalysts.no', "No: {0}"),
		rerunFailed: localize('manyAnalysts.rerunFailed', "Failed"),
		notChecked: localize('manyAnalysts.notChecked', "Not checked"),
		noEstimate: localize('manyAnalysts.noEstimate', "No estimate"),
	};
	return buildWebviewHtml({
		title: localize('manyAnalysts.title', "Many Analysts"),
		introHtml: text.intro,
		omitPoweredBy: !MANYANALYSTS_METADATA.manyAnalysts.packages.length,
		extraCss: `
		${compareCss}
		.missing { color: var(--vscode-errorForeground); }
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
		.ma-plot { max-width: 900px; margin: 8px 0 16px 0; }
		.ma-plot text { fill: var(--vscode-foreground); font-size: 11px; font-family: var(--vscode-font-family); }
		.ma-plot .axis { stroke: var(--vscode-widget-border); }
		.ma-plot .band { fill: var(--vscode-editor-selectionBackground); opacity: 0.35; }
		.ma-plot .median { stroke: var(--vscode-descriptionForeground); stroke-dasharray: 4 3; }
		.ma-plot .interval { stroke: var(--vscode-foreground); stroke-width: 1.5; }
		.ma-plot .point { fill: var(--vscode-foreground); }
		.ma-plot .off .interval { stroke: var(--vscode-errorForeground); }
		.ma-plot .off .point { fill: var(--vscode-errorForeground); }
		.status-running { color: var(--vscode-textLink-foreground); }
		.status-failed, .status-ended { color: var(--vscode-errorForeground); }
		.links .link + .link { margin-left: 10px; }
`,
		steps: [
			{
				id: 'step-question',
				title: text.questionAndData,
				bodyHtml: `
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
`,
			},
			{
				id: 'step-analysts',
				title: text.analysts,
				bodyHtml: `
		<p class="hint">${text.analystsHint}</p>
		<div class="row"><span class="small">${text.howMany}</span> <select id="count">${Array.from({ length: MAX_ANALYSTS - MIN_ANALYSTS + 1 }, (_, i) => MIN_ANALYSTS + i).map(n => `<option value="${n}"${n === DEFAULT_ANALYSTS ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
		<div class="analysts" id="analysts"></div>
		<p class="warning" id="repeated" hidden></p>
		<p class="warning" id="noCells" hidden>${text.noCells}</p>
`,
			},
			{
				id: 'step-runs',
				title: text.runs,
				bodyHtml: `
		<p class="hint">${text.runsHint}</p>
		<div class="settings"><span class="bar"><button class="action current" id="start">${text.start}</button></span></div>
		<div class="small status missing" id="startProblem"></div>
		<p class="hint" id="noStudy">${text.noStudy}</p>
		<table class="ma" id="runTable" hidden>
			<thead><tr><th>${localize('manyAnalysts.analystColumn', "Analyst")}</th><th>${text.agentModel}</th><th>${text.status}</th><th class="number">${text.time}</th><th>${text.open}</th></tr></thead>
			<tbody id="runRows"></tbody>
		</table>
`,
			},
			{
				id: 'step-results',
				title: text.results,
				bodyHtml: `
		<p class="hint">${text.resultsHint}</p>
		<div class="settings"><span class="bar"><button class="action" id="collect">${text.collect}</button></span></div>
		<div class="small status" id="collectStatus"></div>
		<div id="results" hidden>
			<h3 class="part">${text.spread}</h3>
			<div id="spread"></div>
			<h3 class="part">${text.estimates}</h3>
			<p class="hint">${text.plotHint}</p>
			<div class="ma-plot" id="plot"></div>
			<h3 class="part">${text.choices}</h3>
			<table class="ma">
				<thead><tr><th>${localize('manyAnalysts.analystColumn', "Analyst")}</th><th>${text.agentModel}</th><th class="number">${text.estimateColumn}</th><th class="number">${text.stdError}</th><th class="number">${text.interval}</th><th class="number">${text.n}</th>${Object.values(text.choiceNames).map(name => `<th>${name}</th>`).join('')}<th>${text.reproduced}</th><th>${text.open}</th></tr></thead>
				<tbody id="choiceRows"></tbody>
			</table>
		</div>
`,
			},
		],
		pageScriptJs: `
	const TEXT = ${JSON.stringify(text)};
	const CHOICES = ${JSON.stringify(CHOICE_FIELDS)};
	const DEFAULT_ANALYSTS = ${DEFAULT_ANALYSTS};
	const nameInput = document.getElementById('name');
	const earlier = document.getElementById('earlier');
	const fileInput = document.getElementById('file');
	const description = document.getElementById('description');
	const question = document.getElementById('question');
	const estimate = document.getElementById('estimate');
	const count = document.getElementById('count');
	const analystsBox = document.getElementById('analysts');
	let state = undefined;
	/** The cell chosen for each analyst, kept when the number of analysts changes. */
	let chosen = [];
	let timer = undefined;

	function escapeHtml(value) {
		return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
	}
	/** Two numbers as an interval, "a to b": a dash between them would read as a minus sign. */
	function interval(low, high) {
		return TEXT.between.replace('{0}', format(low)).replace('{1}', format(high));
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
	/** The key of an agent and model, as the value of an option: a character that HTML keeps in an attribute separates them. */
	function cellKey(cell) {
		return encodeURIComponent(cell.agent) + '/' + encodeURIComponent(cell.model);
	}
	function dataKind() {
		const radio = document.querySelector('input[name=data]:checked');
		return radio ? radio.value : 'example';
	}
	function locked() {
		return !!(state && state.study);
	}

	/** The analysts' choices: at first the cells in turn, so that the models differ. */
	function drawAnalysts() {
		const cells = state ? state.cells : [];
		const n = Number(count.value);
		while (chosen.length < n && cells.length) {
			chosen.push(cellKey(cells[chosen.length % cells.length]));
		}
		analystsBox.innerHTML = '';
		for (let i = 0; i < n; i++) {
			const label = document.createElement('span');
			label.className = 'small';
			label.textContent = TEXT.analyst.replace('{0}', String(i + 1));
			const select = document.createElement('select');
			select.innerHTML = cells.map(cell => '<option value="' + escapeHtml(cellKey(cell)) + '">' + escapeHtml(cell.label) + '</option>').join('');
			select.value = chosen[i] || '';
			select.disabled = locked();
			select.addEventListener('change', () => { chosen[i] = select.value; checkRepeated(); });
			analystsBox.append(label, select);
		}
		document.getElementById('noCells').hidden = cells.length > 0 || locked();
		checkRepeated();
	}
	function checkRepeated() {
		const warning = document.getElementById('repeated');
		const seen = new Map();
		const n = Number(count.value);
		let repeated = '';
		for (const key of chosen.slice(0, n)) {
			seen.set(key, (seen.get(key) || 0) + 1);
			if (seen.get(key) === 2 && !repeated) {
				const cell = state.cells.find(c => cellKey(c) === key);
				repeated = cell ? cell.label : '';
			}
		}
		warning.hidden = !repeated || locked();
		warning.textContent = TEXT.repeated.replace('{0}', repeated);
	}
	function drawData() {
		const kind = dataKind();
		document.getElementById('exampleHint').hidden = kind !== 'example';
		document.getElementById('fileFields').hidden = kind !== 'file';
	}

	function inputs() {
		const n = Number(count.value);
		const analysts = chosen.slice(0, n).map(key => state.cells.find(c => cellKey(c) === key)).filter(c => c).map(c => ({ agent: c.agent, model: c.model }));
		return { name: nameInput.value.trim() || nameInput.placeholder, question: question.value, estimate: estimate.value, data: dataKind(), file: fileInput.value, description: description.value, analysts };
	}

	function elapsed(run) {
		if (!run.started) {
			return '';
		}
		const seconds = Math.round(((run.ended || Date.now()) - run.started) / 1000);
		return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
	}
	function link(label, analyst, what) {
		return '<button class="link" data-analyst="' + analyst + '" data-what="' + what + '">' + escapeHtml(label) + '</button>';
	}
	function drawRuns() {
		const study = state.study;
		document.getElementById('noStudy').hidden = !!study;
		document.getElementById('runTable').hidden = !study;
		document.getElementById('start').disabled = !!study || !state.cells.length;
		if (!study) {
			return;
		}
		document.getElementById('runRows').innerHTML = study.analysts.map((run, i) => {
			const status = TEXT.statuses[run.status] + (run.status === 'failed' && typeof run.exitCode === 'number' ? ' (' + TEXT.exit.replace('{0}', run.exitCode) + ')' : '');
			const links = [run.hasReport ? link(TEXT.report, i + 1, 'report') : '', run.hasCode ? link(TEXT.code, i + 1, 'code') : '', run.hasTerminal ? link(TEXT.terminal, i + 1, 'terminal') : ''].filter(x => x).join('');
			return '<tr><td>' + (i + 1) + '</td><td>' + escapeHtml(run.label) + '</td><td class="status-' + run.status + '">' + escapeHtml(status) + '</td><td class="number" data-run="' + i + '">' + elapsed(run) + '</td><td class="links">' + links + '</td></tr>';
		}).join('');
		clearInterval(timer);
		if (study.analysts.some(run => run.status === 'running')) {
			timer = setInterval(() => {
				for (const cell of document.querySelectorAll('td[data-run]')) {
					cell.textContent = elapsed(state.study.analysts[Number(cell.dataset.run)]);
				}
			}, 1000);
		}
	}

	/** The estimates in order, each with its interval, over the band of the interquartile range and the median. */
	function plot(rows, spread) {
		const shown = rows.filter(row => row.reported).sort((a, b) => a.reported.estimate - b.reported.estimate);
		if (!shown.length) {
			return '';
		}
		const width = 800, left = 290, right = 20, top = 10, rowHeight = 24, axisHeight = 28;
		const height = top + shown.length * rowHeight + axisHeight;
		let low = Math.min(...shown.map(row => Math.min(row.reported.ci_low, row.reported.estimate)));
		let high = Math.max(...shown.map(row => Math.max(row.reported.ci_high, row.reported.estimate)));
		if (high === low) {
			high += 1;
			low -= 1;
		}
		const pad = (high - low) * 0.05;
		low -= pad;
		high += pad;
		const x = v => left + (v - low) / (high - low) * (width - left - right);
		const step = Math.pow(10, Math.floor(Math.log10((high - low) / 4)));
		const nice = [1, 2, 5, 10].map(m => m * step).find(s => (high - low) / s <= 6) || step * 10;
		const ticks = [];
		for (let t = Math.ceil(low / nice) * nice; t <= high; t += nice) {
			ticks.push(t);
		}
		const bottom = top + shown.length * rowHeight;
		let svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" width="100%" role="img">';
		if (spread) {
			svg += '<rect class="band" x="' + x(spread.q1) + '" y="' + top + '" width="' + Math.max(1, x(spread.q3) - x(spread.q1)) + '" height="' + (bottom - top) + '"></rect>';
			svg += '<line class="median" x1="' + x(spread.median) + '" x2="' + x(spread.median) + '" y1="' + top + '" y2="' + bottom + '"></line>';
		}
		if (low < 0 && high > 0) {
			svg += '<line class="axis" x1="' + x(0) + '" x2="' + x(0) + '" y1="' + top + '" y2="' + bottom + '"></line>';
		}
		svg += '<line class="axis" x1="' + left + '" x2="' + (width - right) + '" y1="' + bottom + '" y2="' + bottom + '"></line>';
		for (const t of ticks) {
			svg += '<line class="axis" x1="' + x(t) + '" x2="' + x(t) + '" y1="' + bottom + '" y2="' + (bottom + 4) + '"></line>';
			svg += '<text x="' + x(t) + '" y="' + (bottom + 16) + '" text-anchor="middle">' + format(Number(t.toPrecision(6))) + '</text>';
		}
		shown.forEach((row, i) => {
			const y = top + i * rowHeight + rowHeight / 2;
			svg += '<g class="' + (row.reproduced === false || row.rerunFailed ? 'off' : '') + '">';
			svg += '<text x="' + (left - 10) + '" y="' + (y + 4) + '" text-anchor="end">' + escapeHtml(TEXT.analyst.replace('{0}', String(row.analyst)) + ' · ' + row.label) + '</text>';
			svg += '<line class="interval" x1="' + x(row.reported.ci_low) + '" x2="' + x(row.reported.ci_high) + '" y1="' + y + '" y2="' + y + '"></line>';
			svg += '<circle class="point" cx="' + x(row.reported.estimate) + '" cy="' + y + '" r="4"></circle>';
			svg += '</g>';
		});
		return svg + '</svg>';
	}
	function figure(label, value, tooltip) {
		return '<div class="ma-figure"' + (tooltip ? ' title="' + escapeHtml(tooltip) + '"' : '') + '><div class="small">' + escapeHtml(label) + '</div><div class="value">' + value + '</div></div>';
	}
	function drawResults() {
		const study = state.study;
		const results = study && study.results;
		document.getElementById('collect').disabled = !study;
		// The one blue button is the next thing to do: Start before a study, Check and Collect once every analyst has ended
		document.getElementById('start').classList.toggle('current', !study);
		document.getElementById('collect').classList.toggle('current', !!study && !results && !study.analysts.some(run => run.status === 'running'));
		document.getElementById('results').hidden = !results;
		const status = document.getElementById('collectStatus');
		if (results && results.collected) {
			status.textContent = TEXT.collected.replace('{0}', results.collected);
		} else if (!study) {
			status.textContent = '';
		}
		if (!results) {
			return;
		}
		const spread = results.spread;
		document.getElementById('spread').innerHTML = spread
			? '<div class="ma-figures">' + figure(TEXT.median, format(spread.median)) + figure(TEXT.iqr, interval(spread.q1, spread.q3)) + figure(TEXT.range, interval(spread.min, spread.max)) + figure(TEXT.nse, format(spread.nonstandardError), TEXT.nseTooltip) + figure(TEXT.medianSe, format(spread.medianStdError)) + '</div>'
				+ (spread.medianStdError > 0 ? '<p class="hint">' + escapeHtml(TEXT.ratio.replace('{0}', format(spread.nonstandardError / spread.medianStdError))) + '</p>' : '')
				+ '<p class="small ma-note">' + escapeHtml(TEXT.nseNote) + '</p>'
			: '<p class="hint">' + escapeHtml(TEXT.fewResults) + '</p>';
		document.getElementById('plot').innerHTML = plot(results.rows, spread);
		document.getElementById('choiceRows').innerHTML = results.rows.map(row => {
			const r = row.reported;
			const reproduced = row.rerunFailed ? '<span class="error">' + escapeHtml(TEXT.rerunFailed) + '</span>'
				: row.reproduced === true ? escapeHtml(TEXT.yes)
					: row.reproduced === false ? '<span class="error">' + escapeHtml(TEXT.no.replace('{0}', format(row.rerun.estimate))) + '</span>'
						: escapeHtml(TEXT.notChecked);
			const numbers = r
				? '<td class="number">' + format(r.estimate) + '</td><td class="number">' + format(r.std_error) + '</td><td class="number">' + interval(r.ci_low, r.ci_high) + '</td><td class="number">' + format(r.n) + '</td>'
				: '<td colspan="4" class="small">' + escapeHtml(TEXT.noEstimate) + '</td>';
			const links = [link(TEXT.report, row.analyst, 'report'), link(TEXT.code, row.analyst, 'code'), row.rerunFailed || row.reproduced === false ? link(TEXT.log, row.analyst, 'log') : ''].filter(x => x).join('');
			return '<tr><td>' + row.analyst + '</td><td>' + escapeHtml(row.label) + '</td>' + numbers + CHOICES.map(field => '<td class="choice small">' + escapeHtml(row.choices[field] || '') + '</td>').join('') + '<td>' + reproduced + '</td><td class="links">' + links + '</td></tr>';
		}).join('');
	}

	function draw() {
		const study = state.study;
		document.getElementById('root').textContent = state.root;
		earlier.innerHTML = '<option value="">' + escapeHtml(TEXT.earlierNone) + '</option>' + state.studies.map(name => '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>').join('');
		earlier.value = study ? study.name : '';
		document.getElementById('newStudy').hidden = !study;
		for (const field of [nameInput, fileInput, description, question, estimate, count]) {
			field.disabled = !!study;
		}
		for (const radio of document.querySelectorAll('input[name=data]')) {
			radio.disabled = !!study;
		}
		document.getElementById('chooseFile').disabled = !!study;
		if (study) {
			nameInput.value = study.name;
			question.value = study.question;
			estimate.value = study.estimate;
			fileInput.value = study.file;
			description.value = study.description;
			for (const radio of document.querySelectorAll('input[name=data]')) {
				radio.checked = radio.value === study.data;
			}
			count.value = String(study.analysts.length);
			chosen = [];
			analystsBox.innerHTML = '';
			study.analysts.forEach((run, i) => {
				const label = document.createElement('span');
				label.className = 'small';
				label.textContent = TEXT.analyst.replace('{0}', String(i + 1));
				const value = document.createElement('span');
				value.textContent = run.label;
				analystsBox.append(label, value);
			});
			document.getElementById('repeated').hidden = true;
			document.getElementById('noCells').hidden = true;
		} else {
			nameInput.value = '';
			nameInput.placeholder = state.suggestion;
			drawAnalysts();
		}
		drawData();
		drawRuns();
		drawResults();
	}

	nameInput.addEventListener('input', () => { document.getElementById('startProblem').textContent = ''; });
	for (const radio of document.querySelectorAll('input[name=data]')) {
		radio.addEventListener('change', drawData);
	}
	count.addEventListener('change', drawAnalysts);
	earlier.addEventListener('change', () => {
		vscode.postMessage(earlier.value ? { command: 'load', name: earlier.value } : { command: 'newStudy' });
	});
	document.getElementById('newStudy').addEventListener('click', () => vscode.postMessage({ command: 'newStudy' }));
	document.getElementById('chooseFile').addEventListener('click', () => vscode.postMessage({ command: 'chooseFile', value: fileInput.value }));
	document.getElementById('start').addEventListener('click', () => {
		document.getElementById('startProblem').textContent = '';
		vscode.postMessage({ command: 'start', inputs: inputs() });
	});
	document.getElementById('collect').addEventListener('click', () => vscode.postMessage({ command: 'collect' }));
	document.body.addEventListener('click', event => {
		const target = event.target.closest('button[data-what]');
		if (target) {
			vscode.postMessage({ command: 'open', analyst: Number(target.dataset.analyst), what: target.dataset.what });
		}
	});

	question.value = TEXT.exampleQuestion;
	estimate.value = TEXT.exampleEstimate;
	count.value = String(DEFAULT_ANALYSTS);
	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			const wasLocked = locked();
			state = message;
			if (wasLocked && !state.study) {
				question.value = TEXT.exampleQuestion;
				estimate.value = TEXT.exampleEstimate;
				fileInput.value = '';
				description.value = '';
				count.value = String(DEFAULT_ANALYSTS);
				for (const radio of document.querySelectorAll('input[name=data]')) {
					radio.checked = radio.value === 'example';
				}
			}
			draw();
		} else if (message.command === 'file') {
			fileInput.value = message.value;
		} else if (message.command === 'startProblem') {
			document.getElementById('startProblem').textContent = message.text;
		} else if (message.command === 'collecting') {
			document.getElementById('collectStatus').textContent = TEXT.collecting;
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({ id: MANY_ANALYSTS_COMMAND_ID, title: localize2('manyAnalysts.action', "Many Analysts..."), category: localize2('orchestration.category', "Orchestration"), f1: true });
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openManyAnalystsPage(accessor);
	}
});
