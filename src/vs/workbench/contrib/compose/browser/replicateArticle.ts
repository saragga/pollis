/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../base/common/buffer.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { FileAccess } from '../../../../base/common/network.js';
import { basename, dirname, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService, SIDE_GROUP } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { parseToml } from '../../model/browser/common/tomlPanelData.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { REPLICATEARTICLE_METADATA } from '../../model/browser/webviews/replicateArticle.data.js';
import { buildWebviewHtml } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { ARTICLE_DATA_SCRIPT, ARTICLE_DATA_STYLE, ArticleDataMessage, articleDataHtml, articleDataText, createArticleData, draftName, IArticleDataKind, IArticleDataRecord, IArticleDataServices, isArticleDataMessage, makesFolder, openRecordArticle, parseTable, readTables, replaceTomlBlocks, setTomlValue, table, text, tomlString } from './articleAndData.js';
import { AgentTask } from './modelRouting.js';
import { methodFromReplication, openUserMethod, userMethodsFolder } from './newMethods.js';
import { EXPLAIN_DIFFERENCES_COMMAND_ID, PLAN_REPLICATION_COMMAND_ID, REPLICATE_WITH_AGENT_COMMAND_ID, skillFile, startAgent } from './pollisAgents.js';

// Compose > Replication > Replicate an Article...: a replication of a published analysis, made from its article.
// A replication is a folder of ~/.pollis/replications with replication.toml, which holds the article's link and
// the input tables, the published results it must reproduce in targets/*.csv, and results.csv, which the
// replication's notebook writes when it runs in the folder: Pollis.replicate and Pollis.compare put each published
// value there beside Julia's. Its page has five steps. Article and Data is the first step of Create New Method too
// (articleAndData.ts). Plan says, for each target, how it is computed: by Julia packages, by code of the notebook's
// own, or by a new method, which Make a Method starts on the New Method page with the replication's article, data and
// that target; the plan-replication skill proposes it. A replication never needs a method to go on. Replicate hands
// the replication to the user's coding agent, with the replicate-article skill of the Pollis Agents plugin and the
// user's notes in INSTRUCTIONS.md: it writes the notebook, NAME.ipynb, and runs it. Compare lists the published values
// of results.csv that Julia does not reproduce, table by table, each with the kind of its difference and an
// explanation, typed in or proposed by the explain-differences skill. Record and Share reads results.csv too: the
// replication is full when every published value is reproduced, to the printed decimals or within the noise of a
// simulation, else partial, unless the user says otherwise with a reason. Add to My Replications marks it done,
// and Browse Replications (workflowLibrary.ts) lists it under Done by You, the others under In Progress. Data may
// be shared with a replication only if its terms allow it: the page warns of each input with no licence stated.

export const REPLICATE_ARTICLE_COMMAND_ID = 'pollis.replication.replicateArticle';
/** Browse Replications, registered in workflowLibrary.ts: the user's replications and those shipped with Pollis. */
export const BROWSE_REPLICATIONS_COMMAND_ID = 'chiara.statistics.wfl_sl';

const RECORD_FILE = 'replication.toml';
const RESULTS_FILE = 'results.csv';
const INSTRUCTIONS_FILE = 'INSTRUCTIONS.md';
/** Pollis' Julia functions, Pollis.replicate and Pollis.compare among them, which a coding agent includes in its own Julia session. */
const POLLIS_JL = ['extensions', 'language-julia', 'scripts', 'terminalserver', 'Pollis.jl'];

/** Full: every published value reproduced; partial: some. */
type ReplicationStatus = 'full' | 'partial';

/** How a target is computed: by Julia packages, by code of the notebook's own, or by a new method. */
type PlanWay = 'package' | 'notebook' | 'method';
const PLAN_WAYS: readonly string[] = ['package', 'notebook', 'method'];

/** The plan of a target, in `[plan.NAME]`. */
interface IPlanEntry {
	readonly target: string;
	readonly way?: PlanWay;
	/** The Julia packages that compute it, e.g. `GLM, StatsBase`. */
	readonly packages: string;
	readonly note: string;
	/** The folder name of the method Make a Method made for it, in ~/.pollis/methods. */
	readonly method?: string;
}

/** What a difference between a published value and Julia's comes from. */
const DIFFERENCE_KINDS: readonly string[] = ['misprint', 'rounding', 'not replicable', 'unexplained'];

/** The explanation of a value not reproduced, in `[[differences]]`, by its target and row. */
interface IDifference {
	readonly target: string;
	readonly row: string;
	readonly kind: string;
	readonly explanation: string;
}

/** A published value of results.csv beside Julia's. */
interface IResultRow {
	readonly table: string;
	readonly row: string;
	readonly published: string;
	readonly julia: string;
	readonly se?: string;
	readonly verdict: string;
	readonly reproduced: boolean;
}

/** What results.csv says of the published values, in all and by table. */
interface IResults {
	readonly values: number;
	readonly reproduced: number;
	readonly tables: readonly { readonly name: string; readonly values: number; readonly reproduced: number }[];
	readonly rows: readonly IResultRow[];
}

/** A replication, as its page shows it: its folder and replication.toml, with what Article and Data shows of it. */
interface IReplication extends IArticleDataRecord {
	readonly title: string;
	readonly citation?: string;
	readonly doi?: string;
	/** Added to the user's replications: Browse Replications lists it under Done by You. */
	readonly done: boolean;
	/** The status the user set, with its reason; without it, the status follows from the results. */
	readonly status?: ReplicationStatus;
	readonly statusReason?: string;
	readonly results?: IResults;
	/** The notes for a coding agent, in INSTRUCTIONS.md. */
	readonly instructions: string;
	/** The replication's notebook, `NAME.ipynb`, when it exists. */
	readonly notebook?: string;
	/** The plan of each target, in the targets' order. */
	readonly plan: readonly IPlanEntry[];
	readonly differences: readonly IDifference[];
}

function replicationsFolder(pathService: IPathService): URI {
	return joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'replications');
}

/**
 * The published values of results.csv and those reproduced: a value compared exactly is reproduced when Julia's
 * agrees with it to all its printed decimals, one compared with the noise of a simulation when it is within it.
 */
async function readResults(fileService: IFileService, folder: URI): Promise<IResults | undefined> {
	const file = joinPath(folder, RESULTS_FILE);
	if (!await fileService.exists(file)) {
		return undefined;
	}
	const { header, rows } = parseTable((await fileService.readFile(file)).value.toString(), Number.MAX_SAFE_INTEGER);
	const column = (name: string) => header.indexOf(name);
	const [table, label, kind, published, julia, se, printed, same, verdict] = ['table', 'row', 'kind', 'published', 'julia', 'se', 'printed_decimals', 'same_decimals', 'verdict'].map(column);
	if ([table, label, kind, published, julia, se, printed, same, verdict].some(index => index < 0)) {
		return undefined;
	}
	const tables = new Map<string, { name: string; values: number; reproduced: number }>();
	const results: IResultRow[] = [];
	for (const row of rows) {
		const name = row[table] ?? '';
		let entry = tables.get(name);
		if (!entry) {
			entry = { name, values: 0, reproduced: 0 };
			tables.set(name, entry);
		}
		entry.values++;
		const reproduced = row[kind] === 'noise'
			? row[verdict] === 'within noise'
			: !!row[same] && Number(row[same]) >= Math.max(Number(row[printed]), 0);
		if (reproduced) {
			entry.reproduced++;
		}
		results.push({ table: name, row: row[label] ?? '', published: row[published] ?? '', julia: row[julia] ?? '', se: row[se] || undefined, verdict: row[verdict] ?? '', reproduced });
	}
	const all = [...tables.values()];
	return { values: results.length, reproduced: results.filter(row => row.reproduced).length, tables: all, rows: results };
}

/** Reads a replication folder; undefined when it has no replication.toml. */
async function readReplication(fileService: IFileService, folder: URI): Promise<IReplication | undefined> {
	const tomlFile = joinPath(folder, RECORD_FILE);
	if (!await fileService.exists(tomlFile)) {
		return undefined;
	}
	const toml = parseToml((await fileService.readFile(tomlFile)).value.toString());
	const { inputs, targets } = await readTables(fileService, folder, toml);
	const name = text(toml.name) ?? basename(folder);
	const doi = text(toml.doi);
	const status = text(toml.status);
	const instructions = joinPath(folder, INSTRUCTIONS_FILE);
	const notebook = `${name}.ipynb`;
	const plan = targets.map(target => {
		const entry = table(table(toml.plan)[target.name]);
		const way = text(entry.way);
		return { target: target.name, way: way && PLAN_WAYS.includes(way) ? way as PlanWay : undefined, packages: text(entry.packages) ?? '', note: text(entry.note) ?? '', method: text(entry.method) };
	});
	const differences = (Array.isArray(toml.differences) ? toml.differences : []).map(value => table(value)).map(entry => ({
		target: text(entry.target) ?? '',
		row: text(entry.row) ?? '',
		kind: DIFFERENCE_KINDS.includes(text(entry.kind) ?? '') ? text(entry.kind)! : 'unexplained',
		explanation: text(entry.explanation) ?? '',
	})).filter(entry => entry.target);
	return {
		folder,
		name,
		title: text(toml.title) ?? name,
		citation: text(toml.citation),
		doi,
		article: text(toml.article) ?? (doi ? `https://doi.org/${doi}` : undefined),
		articleLocal: text(toml.article_local),
		inputs,
		targets,
		done: toml.done === true,
		status: status === 'full' || status === 'partial' ? status : undefined,
		statusReason: text(toml.status_reason),
		results: await readResults(fileService, folder),
		instructions: await fileService.exists(instructions) ? (await fileService.readFile(instructions)).value.toString() : '',
		notebook: await fileService.exists(joinPath(folder, notebook)) ? notebook : undefined,
		plan,
		differences,
	};
}

/** The replications in ~/.pollis/replications: the folders with a replication.toml. */
async function readReplications(fileService: IFileService, pathService: IPathService): Promise<IReplication[]> {
	const root = replicationsFolder(pathService);
	if (!await fileService.exists(root)) {
		return [];
	}
	const replications: IReplication[] = [];
	for (const child of (await fileService.resolve(root)).children ?? []) {
		const replication = child.isDirectory ? await readReplication(fileService, child.resource) : undefined;
		if (replication) {
			replications.push(replication);
		}
	}
	return replications.sort((a, b) => a.title.localeCompare(b.title));
}

function replicationToml(name: string, title: string): string {
	return [
		'# A Pollis replication (Compose > Replication > Replicate an Article...). Its page shows the article and the',
		'# tables; the replication\'s notebook, run in this folder, writes results.csv, which Record and Share reads.',
		'#',
		'#   targets/*.csv   the published results: the row labels in the first column, the values as printed',
		'#   inputs/*.csv    tables typed in from the article',
		`#   ${RESULTS_FILE}     each published value beside Julia's, written by Pollis.replicate and Pollis.compare`,
		'',
		`name = "${name}"`,
		`title = ${tomlString(title)}`,
		'',
		'# The article whose analysis is replicated. article is a link to read it (its PDF or its web page): Pollis',
		'# opens it in the integrated browser and keeps no copy. Without it, the DOI\'s page opens.',
		'citation = ""',
		'doi = ""',
		'article = ""',
		'',
		'# done: listed in Browse Replications under Done by You. status is "full" or "partial" when set by hand,',
		'# status_reason saying why; when it is empty, the status follows from results.csv.',
		'done = false',
		'status = ""',
		'status_reason = ""',
		'',
		'# The input tables are links, or files in inputs/ typed in from the article: Pollis reads each link into',
		'# memory to show it, and no copy is kept. licence is the terms the data\'s provider states: data may be',
		'# shared with the replication only if they allow it.',
		'#   [inputs.grunfeld]',
		'#   url = "https://..."              or file = "inputs/grunfeld.csv", a table typed in from the article',
		'#   source = "Where the data comes from"',
		'#   licence = "CC BY 4.0"',
		'#   delim = ","                      the default; or ";", "tab", "whitespace"',
		'#   columns = ["firm", "year"]       only for a file without a header line',
		'#   skipto = 2                       the line of the first row, when the lines before it are not a header',
		'#   limit = 100                      the number of rows to read, when the file goes on after them',
		'',
		'# The plan, one table for each target: how it is computed. way is "package" (the Julia packages in',
		'# packages), "notebook" (code of the notebook\'s own) or "method" (a new method, made by Make a Method).',
		'#   [plan.table3_2]',
		'#   way = "package"',
		'#   packages = "GLM"',
		'#   note = "Logit of column 2 on the regressors of Section 3"',
		'',
		'# The explanation of each published value Julia does not reproduce: its target and row as in results.csv,',
		'# its kind ("misprint", "rounding", "not replicable" or "unexplained") and why.',
		'#   [[differences]]',
		'#   target = "table3_2"',
		'#   row = "income, (2)"',
		'#   kind = "misprint"',
		'#   explanation = "Two digits swapped: the standard error of the same row gives 0.153"',
		'',
		'# One table for each target: where it is published.',
		'',
	].join('\n');
}

/** Makes a replication folder: replication.toml and targets/. Returns the folder. */
async function newReplication(fileService: IFileService, pathService: IPathService, name: string, title: string): Promise<URI> {
	const folder = joinPath(replicationsFolder(pathService), name);
	await fileService.writeFile(joinPath(folder, RECORD_FILE), VSBuffer.fromString(replicationToml(name, title)));
	await fileService.createFolder(joinPath(folder, 'targets'));
	return folder;
}

/** Whether a replication is still as it was made: no article, tables, instructions, notebook or results, and not done. */
function isEmptyReplication(replication: IReplication): boolean {
	return !replication.article && !replication.articleLocal && !replication.inputs.length && !replication.targets.length && !replication.instructions.trim() && !replication.notebook && !replication.results && !replication.done;
}

/** An agent task of a replication: its tier, its skill, what it needs, its terminal's name and its first message. */
interface IReplicationTask {
	readonly task: AgentTask;
	readonly skill: string;
	/** Why the replication is not ready for the task, else undefined. */
	readonly needs: (replication: IReplication) => string | undefined;
	readonly terminal: (replication: IReplication) => string;
	readonly prompt: (skill: string, replication: IReplication, pollis: string) => string;
}

/** The agent tasks of a replication, by their command. */
const REPLICATION_TASKS: { readonly [command: string]: IReplicationTask } = {
	[PLAN_REPLICATION_COMMAND_ID]: {
		task: 'planReplication',
		skill: 'plan-replication',
		needs: needsArticleAndTargets,
		terminal: replication => localize('replicateArticle.plan.terminal', "Plan {0}", replication.title),
		prompt: (skill, replication) => localize('replicateArticle.plan.prompt', "Read the skill {0} and follow its instructions to plan the Pollis replication in {1} with me.", skill, replication.folder.fsPath),
	},
	[REPLICATE_WITH_AGENT_COMMAND_ID]: {
		task: 'replicateArticle',
		skill: 'replicate-article',
		needs: needsArticleAndTargets,
		terminal: replication => localize('replicateArticle.agent.terminal', "Replicate {0}", replication.title),
		prompt: (skill, replication, pollis) => localize('replicateArticle.agent.prompt', "Read the skill {0} and follow its instructions to replicate the article of the Pollis replication in {1} with me. Pollis' Julia functions, Pollis.replicate and Pollis.compare among them, are in {2}.", skill, replication.folder.fsPath, pollis),
	},
	[EXPLAIN_DIFFERENCES_COMMAND_ID]: {
		task: 'explainDifferences',
		skill: 'explain-differences',
		needs: replication => !replication.results
			? localize('replicateArticle.explain.noResults', "{0} has no results yet: Replicate writes them to results.csv.", replication.title)
			: replication.results.reproduced === replication.results.values
				? localize('replicateArticle.explain.none', "Julia reproduces every published value of {0}: there is no difference to explain.", replication.title)
				: undefined,
		terminal: replication => localize('replicateArticle.explain.terminal', "Differences of {0}", replication.title),
		prompt: (skill, replication, pollis) => localize('replicateArticle.explain.prompt', "Read the skill {0} and follow its instructions to explain the differences of the Pollis replication in {1} with me. Pollis' Julia functions, Pollis.replicate and Pollis.compare among them, are in {2}.", skill, replication.folder.fsPath, pollis),
	},
};

function needsArticleAndTargets(replication: IReplication): string | undefined {
	if (!replication.article && !replication.articleLocal) {
		return localize('replicateArticle.agent.noArticle', "{0} has no article yet: set its link in Article and Data.", replication.title);
	}
	return replication.targets.length ? undefined : localize('replicateArticle.agent.noTargets', "{0} has no target tables yet, so nothing to compare with: add them in Article and Data.", replication.title);
}

/**
 * Hands a replication to the user's coding agent for one of its tasks, on the task's tier, with the task's skill.
 * From elsewhere than its page, with no folder, Browse Replications opens to pick one.
 */
async function runReplicationTask(accessor: ServicesAccessor, command: string, folder: URI | undefined): Promise<void> {
	const fileService = accessor.get(IFileService);
	const instantiationService = accessor.get(IInstantiationService);
	const commandService = accessor.get(ICommandService);
	const task = REPLICATION_TASKS[command];
	const replication = folder && await readReplication(fileService, URI.from(folder));
	if (!replication) {
		await commandService.executeCommand(BROWSE_REPLICATIONS_COMMAND_ID);
		return;
	}
	const missing = task.needs(replication);
	if (missing) {
		throw new Error(missing);
	}
	const skill = await instantiationService.invokeFunction(skillFile, task.skill);
	if (!skill) {
		return;
	}
	const pollis = joinPath(dirname(FileAccess.asFileUri('')), ...POLLIS_JL).fsPath;
	await instantiationService.invokeFunction(startAgent, task.terminal(replication), task.prompt(skill.fsPath, replication, pollis), replication.folder, task.task);
}

/** Article and Data of a replication: its record is replication.toml, its targets only say where they are published, and its inputs have a licence. */
const REPLICATION_KIND: IArticleDataKind = {
	recordFile: RECORD_FILE,
	targetFields: '',
	licences: true,
	tableExists: name => localize('replicateArticle.table.nameExists', "The replication already has a table {0}.", name),
	articlePrompt: (skill, folder, kind, tables) => kind === 'targets'
		? localize('replicateArticle.fromArticle.targets', "Read the skill {0} and follow its instructions to type in the tables {1} of the article of the Pollis replication in {2} as target tables.", skill, tables, folder.fsPath)
		: localize('replicateArticle.fromArticle.inputs', "Read the skill {0} and follow its instructions to type in the tables {1} of the article of the Pollis replication in {2} as input data.", skill, tables, folder.fsPath),
};

type ReplicationMessage =
	| ArticleDataMessage
	| { readonly command: 'ready' | 'planWithAgent' | 'replicate' | 'explainWithAgent' }
	| { readonly command: 'setPlan'; readonly rows: readonly { readonly target: string; readonly way: string; readonly packages: string; readonly note: string }[] }
	| { readonly command: 'makeMethod' | 'openMethod'; readonly target: string }
	| { readonly command: 'setExplanations'; readonly rows: readonly { readonly target: string; readonly row: string; readonly kind: string; readonly explanation: string }[] }
	| { readonly command: 'instructions'; readonly text: string }
	| { readonly command: 'setTitle'; readonly title: string }
	| { readonly command: 'setStatus'; readonly status: string; readonly reason: string }
	| { readonly command: 'setDone'; readonly done: boolean }
	| { readonly command: 'open'; readonly file: string };

/** The commands of the page's agent tasks, by the message that starts each. */
const AGENT_COMMANDS = {
	planWithAgent: PLAN_REPLICATION_COMMAND_ID,
	replicate: REPLICATE_WITH_AGENT_COMMAND_ID,
	explainWithAgent: EXPLAIN_DIFFERENCES_COMMAND_ID,
};

/** The open pages, by replication folder, so a second request shows the same page. */
const openPages = new Map<string, WebviewInput>();

/**
 * Opens a replication: its article in the integrated browser and, beside it, its page, the five steps of making
 * it, updated as its files change. `step` is the step to show. With no folder, it opens a new replication with
 * nothing on disk: the first thing typed or added makes its folder, named after its title, else NewReplication;
 * a new replication still empty when its page closes is deleted.
 */
async function openReplicationPage(accessor: ServicesAccessor, existing?: URI, step?: string): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const fileService = accessor.get(IFileService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const commandService = accessor.get(ICommandService);
	const fileDialogService = accessor.get(IFileDialogService);
	const requestService = accessor.get(IRequestService);
	const progressService = accessor.get(IProgressService);
	const contextService = accessor.get(IWorkspaceContextService);
	const pathService = accessor.get(IPathService);
	const environmentService = accessor.get(IEnvironmentService);
	const instantiationService = accessor.get(IInstantiationService);
	const openerService = accessor.get(IOpenerService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const storageService = accessor.get(IStorageService);

	const draft = !existing;
	// Whether the replication's folder exists: a new replication has none until the first thing is typed or added
	let created = !!existing;
	// A new replication's title until the user gives it one
	const draftTitle = localize('replicateArticle.draft.title', "New Replication");
	const root = replicationsFolder(pathService);
	if (existing) {
		const open = openPages.get(existing.toString());
		if (open && !open.isDisposed()) {
			webviewWorkbenchService.revealWebview(open, open.group ?? -1, false);
			if (step) {
				open.webview.postMessage({ command: 'step', step });
			}
			return;
		}
	}
	// Until it is made, a new replication is only in memory, its folder where it would go
	let folder = existing ?? joinPath(root, 'NewReplication');
	const initial: IReplication | undefined = created ? await readReplication(fileService, folder) : { folder, name: basename(folder), title: draftTitle, inputs: [], targets: [], done: false, instructions: '', plan: [], differences: [] };
	if (!initial) {
		return;
	}
	let replication: IReplication = initial;
	const articleServices: IArticleDataServices = { fileService, fileDialogService, requestService, progressService, contextService, pathService, environmentService, editorService, commandService, instantiationService };
	await openRecordArticle(articleServices, replication);
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: replication.title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.replicateArticle',
		replication.title,
		undefined,
		{ group: replication.article || replication.articleLocal ? SIDE_GROUP : undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());
	if (created) {
		openPages.set(folder.toString(), webviewInput);
	}

	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'replicateArticle', draftTitle, REPLICATEARTICLE_METADATA.replicateArticle, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));
	disposables.add(webviewInput.webview.onDidDispose(async () => {
		disposables.dispose();
		if (!created) {
			return;
		}
		openPages.delete(folder.toString());
		const left = draft ? await readReplication(fileService, folder) : undefined;
		if (left && left.title === draftTitle && isEmptyReplication(left)) {
			await fileService.del(folder, { recursive: true });
		}
	}));

	const recordFile = () => joinPath(folder, RECORD_FILE);
	const post = () => {
		webviewInput.webview.postMessage({ command: 'replication', replication: { ...replication, folder: replication.folder.fsPath }, draft: draft && replication.title === draftTitle });
		articleData.postInputs();
	};
	const reload = disposables.add(new RunOnceScheduler(async () => {
		replication = await readReplication(fileService, folder) ?? replication;
		post();
	}, 300));
	const watch = () => {
		for (const location of [folder, joinPath(folder, 'targets'), joinPath(folder, 'inputs')]) {
			const watcher = disposables.add(fileService.createWatcher(location, { recursive: false, excludes: [] }));
			disposables.add(watcher.onDidChange(() => reload.schedule()));
		}
	};
	if (created) {
		watch();
	}
	// Makes a new replication's folder, once, named after its title
	let creating: Promise<void> | undefined;
	const create = (title: string) => creating ??= (async () => {
		folder = await newReplication(fileService, pathService, await draftName(fileService, root, title, 'NewReplication'), title || draftTitle);
		replication = await readReplication(fileService, folder) ?? replication;
		created = true;
		openPages.set(folder.toString(), webviewInput);
		watch();
	})();
	// What a new replication's folder is made for: the first thing typed or added
	const makes = (message: ReplicationMessage) => {
		if (isArticleDataMessage(message)) {
			return makesFolder(message);
		}
		switch (message.command) {
			case 'setTitle': return !!message.title.trim();
			case 'instructions': return !!message.text.trim();
			case 'setStatus': case 'setDone': case 'open': return true;
			default: return false;
		}
	};

	const run = async (action: () => Promise<void>) => {
		try {
			await action();
		} catch (error) {
			notificationService.error(toErrorMessage(error));
		}
	};
	// A form of the page: its error is shown under it, and it closes when done
	const submit = async (form: string, action: () => Promise<void>) => {
		try {
			await action();
			webviewInput.webview.postMessage({ command: 'formDone', form });
		} catch (error) {
			webviewInput.webview.postMessage({ command: 'formError', form, message: toErrorMessage(error) });
		}
	};
	const update = async () => {
		replication = await readReplication(fileService, folder) ?? replication;
		post();
	};
	const articleData = createArticleData(articleServices, REPLICATION_KIND, { webview: webviewInput.webview, record: () => replication, reload: update, submit, run });

	disposables.add(webviewInput.webview.onMessage(async (e: { message: ReplicationMessage }) => {
		const message = e.message;
		if (!created && makes(message)) {
			try {
				await create(message.command === 'setTitle' ? message.title.trim() : '');
			} catch (error) {
				notificationService.error(toErrorMessage(error));
				return;
			}
		}
		if (message.command === 'ready') {
			post();
			if (step) {
				webviewInput.webview.postMessage({ command: 'step', step });
			}
		} else if (isArticleDataMessage(message)) {
			articleData.handle(message);
		} else if (message.command === 'planWithAgent' || message.command === 'replicate' || message.command === 'explainWithAgent') {
			const command = AGENT_COMMANDS[message.command];
			run(async () => {
				if (!created) {
					throw new Error(localize('replicateArticle.agent.empty', "Start with the article and its tables, in Article and Data."));
				}
				await commandService.executeCommand(command, folder);
			});
		} else if (message.command === 'setPlan') {
			submit('plan', async () => {
				// The plan of each target, its method kept; a target with nothing planned has no table
				const blocks = message.rows.filter(row => replication.targets.some(target => target.name === row.target)).map(row => {
					const method = replication.plan.find(entry => entry.target === row.target)?.method;
					const way = PLAN_WAYS.includes(row.way) ? row.way : '';
					return way || row.packages.trim() || row.note.trim() || method
						? `[plan.${row.target}]\nway = ${tomlString(way)}\npackages = ${tomlString(row.packages.trim())}\nnote = ${tomlString(row.note.trim())}\n${method ? `method = ${tomlString(method)}\n` : ''}`
						: '';
				}).filter(Boolean);
				await replaceTomlBlocks(fileService, recordFile(), header => header.startsWith('[plan.'), blocks.join('\n'));
				await update();
			});
		} else if (message.command === 'makeMethod') {
			run(async () => {
				const target = replication.targets.find(candidate => candidate.name === message.target);
				if (!target) {
					return;
				}
				const entry = replication.plan.find(candidate => candidate.target === target.name);
				const method = await instantiationService.invokeFunction(methodFromReplication, {
					title: replication.title === draftTitle ? target.name : replication.title,
					citation: replication.citation,
					doi: replication.doi,
					article: replication.article,
					folder,
					inputs: replication.inputs,
					targets: [{ name: target.name, source: target.source }],
				});
				const block = `[plan.${target.name}]\nway = "method"\npackages = ${tomlString(entry?.packages ?? '')}\nnote = ${tomlString(entry?.note ?? '')}\nmethod = ${tomlString(method)}\n`;
				await replaceTomlBlocks(fileService, recordFile(), header => header === `[plan.${target.name}]`, block);
				await update();
			});
		} else if (message.command === 'openMethod') {
			run(async () => {
				const method = replication.plan.find(entry => entry.target === message.target)?.method;
				const methodFolder = method && joinPath(userMethodsFolder(pathService), method);
				if (!methodFolder || !await fileService.exists(methodFolder)) {
					throw new Error(localize('replicateArticle.method.gone', "The method {0} is no longer in ~/.pollis/methods.", method ?? ''));
				}
				await instantiationService.invokeFunction(openUserMethod, methodFolder.toString());
			});
		} else if (message.command === 'setExplanations') {
			submit('explanations', async () => {
				const blocks = message.rows.filter(row => row.explanation.trim() || (row.kind && row.kind !== 'unexplained')).map(row =>
					`[[differences]]\ntarget = ${tomlString(row.target)}\nrow = ${tomlString(row.row)}\nkind = ${tomlString(DIFFERENCE_KINDS.includes(row.kind) ? row.kind : 'unexplained')}\nexplanation = ${tomlString(row.explanation.trim())}\n`);
				// The explanations of values no longer shown, as those reproduced since, are kept
				const shown = new Set(message.rows.map(row => `${row.target}\n${row.row}`));
				const kept = replication.differences.filter(entry => !shown.has(`${entry.target}\n${entry.row}`)).map(entry =>
					`[[differences]]\ntarget = ${tomlString(entry.target)}\nrow = ${tomlString(entry.row)}\nkind = ${tomlString(entry.kind)}\nexplanation = ${tomlString(entry.explanation)}\n`);
				await replaceTomlBlocks(fileService, recordFile(), header => header === '[[differences]]', [...kept, ...blocks].join('\n'));
				await update();
			});
		} else if (message.command === 'instructions') {
			if (created) {
				run(() => fileService.writeFile(joinPath(folder, INSTRUCTIONS_FILE), VSBuffer.fromString(message.text)).then(() => undefined));
			}
		} else if (message.command === 'setTitle') {
			run(async () => {
				const title = message.title.trim() || replication.name;
				await setTomlValue(fileService, recordFile(), undefined, 'title', title);
				webviewInput.setWebviewTitle(title);
				await update();
			});
		} else if (message.command === 'setStatus') {
			submit('status', async () => {
				const status = message.status === 'full' || message.status === 'partial' ? message.status : '';
				const reason = message.reason.trim();
				if (status && !reason) {
					throw new Error(localize('replicateArticle.status.noReason', "Say why the replication is {0}, as the results say otherwise or say nothing yet.", status === 'full' ? localize('replicateArticle.status.fullWord', "full") : localize('replicateArticle.status.partialWord', "partial")));
				}
				await setTomlValue(fileService, recordFile(), undefined, 'status', status);
				await setTomlValue(fileService, recordFile(), undefined, 'status_reason', status ? reason : '');
				await update();
			});
		} else if (message.command === 'setDone') {
			run(async () => {
				await setTomlValue(fileService, recordFile(), undefined, 'done', message.done);
				await update();
			});
		} else if (message.command === 'open') {
			const files = [RECORD_FILE, replication.notebook, ...(replication.results ? [RESULTS_FILE] : []), ...replication.targets.map(target => target.file), ...replication.inputs.map(input => input.file)];
			if (files.includes(message.file)) {
				run(async () => { await editorService.openEditor({ resource: joinPath(folder, ...message.file.split('/')) }); });
			}
		}
	}));
}

/** The styles of the replication page: Article and Data's, then those of Plan, Compare and Record and Share. */
const PAGE_STYLE = `${ARTICLE_DATA_STYLE}
		.step-head .soon { font-size: 12px; color: var(--vscode-descriptionForeground); }
		.step-pane {
			.results { margin: 0 0 14px 0; max-width: 900px; }
			.results .total { font-weight: 600; margin: 0 0 4px 0; }
			.results table { margin: 6px 0 0 0; }
			.licences { margin: 0 0 14px 0; max-width: 900px; }
			.licences ul { margin: 4px 0 0 0; padding-left: 18px; }
			td input.wide { width: 260px; }
			td select, td input { font-size: 12px; padding: 2px 4px; }
			td .link { white-space: nowrap; }
		}`;

/**
 * The replication page, in the Time Arrow style of the scaffold, a pane for each of its five steps: its texts come
 * from here, the replication from the `replication` message and each input table from an `input` message.
 */
function pageHtml(): string {
	const text = {
		...articleDataText({
			articleIntro: localize('replicateArticle.page.articleIntro', "The article whose analysis you replicate. Pollis opens it in the integrated browser and keeps no copy unless you save one."),
			inputsIntro: localize('replicateArticle.page.inputsIntro', "The data the article's analysis uses: links, read into memory with no copy kept, or tables typed in from the article. Each input says where its data comes from and the terms its provider states."),
			targetsIntro: localize('replicateArticle.page.targetsIntro', "The published results the replication must reproduce, as printed: Record and Share counts how many of their values Julia gives."),
			emptyInputHint: localize('replicateArticle.input.emptyDetail', "A table of the replication, inputs/NAME.csv, opened to type in: a header line of column names, then the values"),
			targetFilesHint: localize('replicateArticle.page.targetFilesHint', "CSV files of published tables, copied into the replication: row labels in the first column, the values as printed"),
			targetArticleHint: localize('replicateArticle.page.targetArticleHint', "Your coding agent reads the article and types the tables in as target tables, every value as printed. Check them against the article: the comparison is only as right as the targets."),
			noTargets: localize('replicateArticle.page.noTargets', "No target tables yet: they are what the replication is compared with."),
		}),
		intro: localize('replicateArticle.page.intro', "A replication reproduces a published analysis on its data: every value the article prints is set beside Julia's. The steps below make one, with the article open beside this page."),
		headingHint: localize('replicateArticle.heading.hint', "The replication's title: click to change it, Enter saves, Escape cancels."),
		draftHint: localize('replicateArticle.draft.hint', "A new replication: start with its article and tables in {0}. Nothing is saved until you type or add something, and its folder is named after its title."),
		// The steps
		stepArticle: localize('replicateArticle.step.article', "Article and Data"),
		stepPlan: localize('replicateArticle.step.plan', "Plan"),
		stepReplicate: localize('replicateArticle.step.replicate', "Replicate"),
		stepCompare: localize('replicateArticle.step.compare', "Compare"),
		stepRecord: localize('replicateArticle.step.record', "Record and Share"),
		soon: localize('replicateArticle.soon', "Not available yet"),
		// 2. Plan
		planIntro: localize('replicateArticle.page.planIntro', "How each target table is computed: by Julia packages, by code of the notebook's own, or by a new method. A replication needs no method of its own when a package or a few lines of code compute the table: Make a Method is for a method no Julia package has, which others can then install and reuse."),
		planHint: localize('replicateArticle.page.planHint', "Plan with Agent asks your coding agent to read the article and propose the plan, which you check and save. The plan is optional: Replicate works without it."),
		targetColumn: localize('replicateArticle.plan.target', "Target"),
		wayColumn: localize('replicateArticle.plan.way', "Computed By"),
		packagesColumn: localize('replicateArticle.plan.packages', "Julia Packages"),
		noteColumn: localize('replicateArticle.plan.note', "Note"),
		wayNone: localize('replicateArticle.plan.none', "Not planned"),
		wayPackage: localize('replicateArticle.plan.package', "Julia Packages"),
		wayNotebook: localize('replicateArticle.plan.notebook', "Notebook Code"),
		wayMethod: localize('replicateArticle.plan.method', "New Method"),
		packagesPlaceholder: localize('replicateArticle.plan.packagesPlaceholder', "e.g. GLM, StatsBase"),
		savePlan: localize('replicateArticle.plan.save', "Save Plan"),
		planWithAgent: localize('replicateArticle.plan.agent', "Plan with Agent"),
		makeMethod: localize('replicateArticle.plan.makeMethod', "Make a Method"),
		openMethod: localize('replicateArticle.plan.openMethod', "Open Method {0}"),
		planned: localize('replicateArticle.plan.planned', "{0} of {1} targets planned"),
		noPlanTargets: localize('replicateArticle.plan.noTargets', "No target tables yet: add them in Article and Data, then plan how each is computed."),
		// 3. Replicate
		replicateIntro: localize('replicateArticle.page.replicateIntro', "The replication's notebook: the analysis in Julia, run on the input tables, each published value printed beside Julia's. Your coding agent writes it from the article and runs it, and it writes the comparisons to results.csv."),
		instructions: localize('replicateArticle.page.instructions', "Instructions"),
		instructionsIntro: localize('replicateArticle.page.instructionsIntro', "Notes for a coding agent: where in the article each table is computed, the choices it leaves unsaid, what to watch for. Saved in INSTRUCTIONS.md, which the agent reads with the links and tables."),
		instructionsPlaceholder: localize('replicateArticle.page.instructionsPlaceholder', "e.g. Table 3 uses the 1990-2005 sample of Section 4, not the full one; the standard errors are clustered by state."),
		replicate: localize('replicateArticle.replicate', "Replicate with Agent"),
		openNotebook: localize('replicateArticle.openNotebook', "Open Notebook"),
		noNotebook: localize('replicateArticle.noNotebook', "No notebook yet: Replicate with Agent asks your coding agent to write it, once the article and its target tables are in Article and Data."),
		notebook: localize('replicateArticle.notebook', "Notebook: {0}"),
		// 4. Compare
		compareIntro: localize('replicateArticle.page.compareIntro', "The published values Julia does not reproduce, table by table, from results.csv."),
		allReproduced: localize('replicateArticle.allReproduced', "Julia reproduces every published value."),
		showAll: localize('replicateArticle.showAll', "Show every value"),
		rowColumn: localize('replicateArticle.rowColumn', "Value"),
		publishedColumn: localize('replicateArticle.publishedColumn', "Published"),
		juliaColumn: localize('replicateArticle.juliaColumn', "Julia"),
		seColumn: localize('replicateArticle.seColumn', "Standard Error"),
		verdictColumn: localize('replicateArticle.verdictColumn', "Comparison"),
		differing: localize('replicateArticle.differing', "{0} of {1} values not reproduced"),
		kindColumn: localize('replicateArticle.kindColumn', "Kind"),
		explanationColumn: localize('replicateArticle.explanationColumn', "Explanation"),
		kinds: {
			'misprint': localize('replicateArticle.kind.misprint', "Misprint"),
			'rounding': localize('replicateArticle.kind.rounding', "Rounding"),
			'not replicable': localize('replicateArticle.kind.notReplicable', "Not Replicable"),
			'unexplained': localize('replicateArticle.kind.unexplained', "Unexplained"),
		},
		explanationPlaceholder: localize('replicateArticle.explanationPlaceholder', "e.g. Two digits swapped: the t statistic of the row gives 0.153"),
		saveExplanations: localize('replicateArticle.saveExplanations', "Save Explanations"),
		explainWithAgent: localize('replicateArticle.explain.button', "Explain with Agent"),
		explainHint: localize('replicateArticle.explainHint', "Each difference gets a kind, Misprint, Rounding, Not Replicable or Unexplained, and why: Unexplained is an answer too. Explain with Agent asks your coding agent to look into each and propose them, which you check."),
		explained: localize('replicateArticle.explained', "Differences: {0} explained, {1} unexplained."),
		// 5. Record and Share
		recordIntro: localize('replicateArticle.page.recordIntro', "The replication is full when Julia reproduces every published value: to all the decimals printed, or within the noise of a simulation. Otherwise it is partial."),
		noResults: localize('replicateArticle.noResults', "No results yet: the replication's notebook writes them to {0} when it runs in the replication's folder, through Pollis.replicate and Pollis.compare."),
		total: localize('replicateArticle.total', "{0} of {1} published values reproduced"),
		tableColumn: localize('replicateArticle.tableColumn', "Table"),
		valuesColumn: localize('replicateArticle.valuesColumn', "Values"),
		reproducedColumn: localize('replicateArticle.reproducedColumn', "Reproduced"),
		openResults: localize('replicateArticle.openResults', "Open results.csv"),
		statusLabel: localize('replicateArticle.status.label', "Status"),
		fromResults: localize('replicateArticle.status.fromResults', "From the results ({0})"),
		fromNoResults: localize('replicateArticle.status.fromNoResults', "From the results (none yet)"),
		full: localize('replicateArticle.status.full', "Full"),
		partial: localize('replicateArticle.status.partial', "Partial"),
		reason: localize('replicateArticle.status.reason', "Reason"),
		reasonPlaceholder: localize('replicateArticle.status.reasonPlaceholder', "e.g. Table 3 is printed with a typo in its third row"),
		statusHint: localize('replicateArticle.status.hint', "Set the status yourself only with a reason, which is kept with it in replication.toml."),
		statusFull: localize('replicateArticle.status.isFull', "Full replication"),
		statusPartial: localize('replicateArticle.status.isPartial', "Partial replication"),
		licencesHeading: localize('replicateArticle.licences', "Inputs with no licence stated"),
		licencesHint: localize('replicateArticle.licences.hint', "Before sharing the replication, ask the owner of each one whether its data may be shared, and write the terms in its licence in replication.toml."),
		addToMine: localize('replicateArticle.addToMine', "Add to My Replications"),
		backToProgress: localize('replicateArticle.backToProgress', "Move Back to In Progress"),
		doneHint: localize('replicateArticle.done.hint', "Browse Replications lists the replication under Done by You."),
		inProgressHint: localize('replicateArticle.inProgress.hint', "Browse Replications lists the replication under In Progress."),
		extractWorkflow: localize('replicateArticle.extractWorkflow', "Extract a Workflow..."),
		editToml: localize('replicateArticle.editToml', "Edit replication.toml"),
	};
	return buildWebviewHtml({
		// The replication's title, from the `replication` message
		title: '',
		omitPoweredBy: !REPLICATEARTICLE_METADATA.replicateArticle.packages.length,
		introHtml: `${text.intro}<span class="notice" id="draftHint" hidden></span>`,
		extraCss: PAGE_STYLE,
		steps: [
			{
				id: 'step-article',
				title: text.stepArticle,
				bodyHtml: articleDataHtml(text),
			},
			{
				id: 'step-plan',
				title: text.stepPlan,
				headHtml: '<span class="soon" id="planHead"></span>',
				bodyHtml: `
		<p class="intro">${text.planIntro}</p>
		<div id="plan"></div>
		<div class="actions" id="planActions">
			<button class="action current" data-submit="plan">${text.savePlan}</button>
			<button class="action" data-command="planWithAgent">${text.planWithAgent}</button>
		</div>
		<p class="error small" id="error-plan"></p>
		<p class="small">${text.planHint}</p>
`,
			},
			{
				id: 'step-replicate',
				title: text.stepReplicate,
				bodyHtml: `
		<p class="intro">${text.replicateIntro}</p>
		<h2>${text.instructions}</h2>
		<p class="intro">${text.instructionsIntro}</p>
		<textarea id="instructions" placeholder="${text.instructionsPlaceholder}"></textarea>
		<div class="actions">
			<button class="action current" data-command="replicate">${text.replicate}</button>
			<button class="action" id="openNotebook" data-command="open" hidden>${text.openNotebook}</button>
			<button class="action" data-command="open" data-file="replication.toml">${text.editToml}</button>
		</div>
		<p class="small" id="notebookState"></p>
`,
			},
			{
				id: 'step-compare',
				title: text.stepCompare,
				headHtml: '<span class="soon" id="compareHead"></span>',
				bodyHtml: `
		<p class="intro">${text.compareIntro}</p>
		<p class="small"><label class="check"><input type="checkbox" id="showAll"> ${text.showAll}</label></p>
		<div id="differences"></div>
		<div id="explain" hidden>
			<div class="actions">
				<button class="action current" data-submit="explanations">${text.saveExplanations}</button>
				<button class="action" data-command="explainWithAgent">${text.explainWithAgent}</button>
			</div>
			<p class="error small" id="error-explanations"></p>
			<p class="small">${text.explainHint}</p>
		</div>
`,
			},
			{
				id: 'step-record',
				title: text.stepRecord,
				headHtml: '<span class="soon" id="statusHead"></span>',
				bodyHtml: `
		<p class="intro">${text.recordIntro}</p>
		<div class="results" id="results"></div>
		<div class="field">
			<label>${text.statusLabel}<select id="status">
				<option value="" id="statusFromResults"></option>
				<option value="full">${text.full}</option>
				<option value="partial">${text.partial}</option>
			</select></label>
			<label>${text.reason}<input class="wide" id="statusReason" placeholder="${text.reasonPlaceholder}"></label>
			<button class="action" data-submit="status">${text.save}</button>
			<button class="action" data-cancel="statusReason">${text.cancel}</button>
			<p class="small hint">${text.statusHint}</p>
			<p class="error small" id="error-status"></p>
		</div>
		<div class="licences warning small" id="licences" hidden></div>
		<div class="actions">
			<button class="action current" id="done"></button>
			<button class="action" disabled title="${text.soon}">${text.extractWorkflow}</button>
			<button class="action" data-command="open" data-file="replication.toml">${text.editToml}</button>
		</div>
		<p class="small" id="doneHint"></p>
`,
			},
		],
		pageScriptJs: `
	const TEXT = ${JSON.stringify(text)};
	const OPTIONS = { calls: false, licences: true };
	${ARTICLE_DATA_SCRIPT}
	let replication;
	// Whether the plan or the explanations have changes not saved yet, which a new state of the record keeps
	let planEdited = false;
	let explanationsEdited = false;

	// 2. Plan: a row for each target, how it is computed, saved together
	FORMS.plan = { send: () => ({ command: 'setPlan', rows: [...document.querySelectorAll('[data-plan]')].map(row => ({
		target: row.dataset.plan,
		way: row.querySelector('select').value,
		packages: row.querySelector('.packages').value,
		note: row.querySelector('.note').value,
	})) }) };
	document.getElementById('plan').addEventListener('input', () => { planEdited = true; });
	document.getElementById('plan').addEventListener('change', () => { planEdited = true; });

	function option(select, value, label) {
		const node = element('option', '', label);
		node.value = value;
		select.appendChild(node);
	}

	function renderPlan() {
		const container = document.getElementById('plan');
		// What the user typed and has not saved, by target, kept
		const typed = new Map(planEdited ? [...container.querySelectorAll('[data-plan]')].map(row => [row.dataset.plan, {
			way: row.querySelector('select').value, packages: row.querySelector('.packages').value, note: row.querySelector('.note').value,
		}]) : []);
		container.textContent = '';
		const plan = replication.plan;
		document.getElementById('planActions').hidden = !plan.length;
		document.getElementById('planHead').textContent = plan.length ? TEXT.planned.replace('{0}', plan.filter(entry => entry.way).length).replace('{1}', plan.length) : '';
		if (!plan.length) {
			container.appendChild(element('p', 'small', TEXT.noPlanTargets));
			return;
		}
		const scroll = element('div', 'scroll');
		const table = element('table');
		const header = element('tr');
		[TEXT.targetColumn, TEXT.wayColumn, TEXT.packagesColumn, TEXT.noteColumn, ''].forEach(label => header.appendChild(element('th', '', label)));
		table.appendChild(header);
		for (const entry of plan) {
			const shown = typed.get(entry.target) || entry;
			const row = element('tr');
			row.dataset.plan = entry.target;
			const name = element('td');
			name.appendChild(element('div', 'table-name', entry.target));
			const target = replication.targets.find(candidate => candidate.name === entry.target);
			name.appendChild(element('div', 'small', (target && target.source) || TEXT.noSource));
			row.appendChild(name);
			const way = element('select');
			option(way, '', TEXT.wayNone);
			option(way, 'package', TEXT.wayPackage);
			option(way, 'notebook', TEXT.wayNotebook);
			option(way, 'method', TEXT.wayMethod);
			way.value = shown.way || '';
			row.appendChild(element('td')).appendChild(way);
			const packages = element('input', 'packages');
			packages.value = shown.packages;
			packages.placeholder = TEXT.packagesPlaceholder;
			row.appendChild(element('td')).appendChild(packages);
			const note = element('input', 'note wide');
			note.value = shown.note;
			row.appendChild(element('td')).appendChild(note);
			// A new method: Make a Method starts it, then Open Method opens it
			const method = element('td');
			const showMethod = () => {
				method.textContent = '';
				if (entry.method) {
					method.appendChild(element('button', 'link small', TEXT.openMethod.replace('{0}', entry.method))).addEventListener('click', () => vscode.postMessage({ command: 'openMethod', target: entry.target }));
				} else if (way.value === 'method') {
					method.appendChild(element('button', 'link small', TEXT.makeMethod)).addEventListener('click', () => vscode.postMessage({ command: 'makeMethod', target: entry.target }));
				}
			};
			way.addEventListener('change', showMethod);
			showMethod();
			row.appendChild(method);
			table.appendChild(row);
		}
		scroll.appendChild(table);
		container.appendChild(scroll);
	}

	// 4. Compare: the explanation of each value not reproduced, saved together
	const differenceKey = (table, row) => table + '\n' + row;
	FORMS.explanations = { send: () => ({ command: 'setExplanations', rows: [...document.querySelectorAll('[data-difference]')].map(row => ({
		target: row.dataset.table,
		row: row.dataset.row,
		kind: row.querySelector('select').value,
		explanation: row.querySelector('input').value,
	})) }) };
	document.getElementById('differences').addEventListener('input', () => { explanationsEdited = true; });
	document.getElementById('differences').addEventListener('change', event => { if (event.target.id !== 'showAll') { explanationsEdited = true; } });

	// The form of Record and Share: the status, saved with its reason
	FORMS.status = { send: () => ({ command: 'setStatus', status: value('status'), reason: value('statusReason') }) };
	document.getElementById('status').addEventListener('change', event => { event.target.dataset.edited = '1'; });
	document.querySelector('button[data-cancel="statusReason"]').addEventListener('click', () => revert('status'));
	document.getElementById('done').addEventListener('click', () => vscode.postMessage({ command: 'setDone', done: !replication.done }));

	// The notes are saved as they are typed
	const instructions = document.getElementById('instructions');
	let instructionsTimer;
	instructions.addEventListener('input', () => {
		clearTimeout(instructionsTimer);
		instructionsTimer = setTimeout(() => vscode.postMessage({ command: 'instructions', text: instructions.value }), 500);
	});
	document.getElementById('showAll').addEventListener('change', () => renderDifferences(replication && replication.results));

	editableHeading(TEXT.headingHint, () => replication ? replication.title : '', title => {
		vscode.postMessage({ command: 'setTitle', title });
		replication = { ...replication, title };
	});

	// The status the results give, full when every published value is reproduced
	const computed = results => results ? (results.reproduced === results.values ? 'full' : 'partial') : undefined;

	// The note of a replication with no results.csv yet
	function noResults(container) {
		const parts = TEXT.noResults.split('{0}');
		const note = element('p', 'small', parts[0]);
		note.appendChild(element('code', '', 'results.csv'));
		note.appendChild(document.createTextNode(parts[1] || ''));
		container.appendChild(note);
	}

	// The values Julia does not reproduce, or all of them, table by table
	function renderDifferences(results) {
		const container = document.getElementById('differences');
		const typed = new Map(explanationsEdited ? [...container.querySelectorAll('[data-difference]')].map(row => [differenceKey(row.dataset.table, row.dataset.row), {
			kind: row.querySelector('select').value, explanation: row.querySelector('input').value,
		}]) : []);
		const saved = new Map(replication.differences.map(entry => [differenceKey(entry.target, entry.row), entry]));
		container.textContent = '';
		const head = document.getElementById('compareHead');
		document.getElementById('explain').hidden = !results || results.reproduced === results.values;
		if (!results) {
			head.textContent = '';
			noResults(container);
			return;
		}
		const differing = results.values - results.reproduced;
		head.textContent = differing ? TEXT.differing.replace('{0}', differing).replace('{1}', results.values) : TEXT.allReproduced;
		const all = document.getElementById('showAll').checked;
		if (!differing && !all) {
			container.appendChild(element('p', 'small', TEXT.allReproduced));
			return;
		}
		const noise = results.rows.some(row => row.se);
		for (const name of [...new Set(results.rows.map(row => row.table))]) {
			const rows = results.rows.filter(row => row.table === name && (all || !row.reproduced));
			if (!rows.length) {
				continue;
			}
			const box = element('div', 'table');
			box.appendChild(element('div', 'table-name', name));
			const scroll = element('div', 'scroll');
			const table = element('table');
			const header = element('tr');
			[TEXT.rowColumn, TEXT.publishedColumn, TEXT.juliaColumn, ...(noise ? [TEXT.seColumn] : []), TEXT.verdictColumn, TEXT.kindColumn, TEXT.explanationColumn].forEach(label => header.appendChild(element('th', '', label)));
			table.appendChild(header);
			for (const row of rows) {
				const tr = element('tr');
				tr.appendChild(element('td', '', row.row));
				tr.appendChild(element('td', 'number', row.published));
				tr.appendChild(element('td', 'number', row.julia));
				if (noise) { tr.appendChild(element('td', 'number', row.se || '')); }
				tr.appendChild(element('td', row.reproduced ? '' : 'warning', row.verdict));
				if (row.reproduced) {
					tr.appendChild(element('td'));
					tr.appendChild(element('td'));
				} else {
					// Its kind and explanation: as typed and not saved, else as saved, else Unexplained
					const shown = typed.get(differenceKey(row.table, row.row)) || saved.get(differenceKey(row.table, row.row)) || { kind: 'unexplained', explanation: '' };
					tr.dataset.difference = '1';
					tr.dataset.table = row.table;
					tr.dataset.row = row.row;
					const kind = element('select');
					for (const [value, label] of Object.entries(TEXT.kinds)) { option(kind, value, label); }
					kind.value = shown.kind;
					tr.appendChild(element('td')).appendChild(kind);
					const explanation = element('input', 'wide');
					explanation.value = shown.explanation;
					explanation.placeholder = TEXT.explanationPlaceholder;
					tr.appendChild(element('td')).appendChild(explanation);
				}
				table.appendChild(tr);
			}
			scroll.appendChild(table);
			box.appendChild(scroll);
			container.appendChild(box);
		}
		const open = element('button', 'link small', TEXT.openResults);
		open.addEventListener('click', () => vscode.postMessage({ command: 'open', file: 'results.csv' }));
		container.appendChild(open);
	}

	function renderResults(results) {
		const container = document.getElementById('results');
		container.textContent = '';
		if (!results) {
			noResults(container);
			return;
		}
		container.appendChild(element('p', 'total', TEXT.total.replace('{0}', results.reproduced).replace('{1}', results.values)));
		// The values not reproduced whose difference has a kind other than Unexplained
		const kinds = new Map(replication.differences.map(entry => [differenceKey(entry.target, entry.row), entry.kind]));
		const differing = results.rows.filter(row => !row.reproduced);
		if (differing.length) {
			const explained = differing.filter(row => (kinds.get(differenceKey(row.table, row.row)) || 'unexplained') !== 'unexplained').length;
			container.appendChild(element('p', 'small', TEXT.explained.replace('{0}', explained).replace('{1}', differing.length - explained)));
		}
		const table = element('table');
		const head = element('tr');
		[TEXT.tableColumn, TEXT.valuesColumn, TEXT.reproducedColumn].forEach(label => head.appendChild(element('th', '', label)));
		table.appendChild(head);
		for (const entry of results.tables) {
			const row = element('tr');
			row.appendChild(element('td', '', entry.name));
			row.appendChild(element('td', 'number', String(entry.values)));
			row.appendChild(element('td', 'number' + (entry.reproduced < entry.values ? ' warning' : ''), String(entry.reproduced)));
			table.appendChild(row);
		}
		container.appendChild(table);
		const open = element('button', 'link small', TEXT.openResults);
		open.addEventListener('click', () => vscode.postMessage({ command: 'open', file: 'results.csv' }));
		container.appendChild(open);
	}

	function renderLicences(inputs) {
		const container = document.getElementById('licences');
		const missing = inputs.filter(input => !licenceStated(input));
		container.hidden = !missing.length;
		container.textContent = '';
		container.appendChild(element('div', '', TEXT.licencesHeading));
		const list = element('ul');
		missing.forEach(input => list.appendChild(element('li', '', input.name + (input.source ? ' (' + input.source + ')' : ''))));
		container.appendChild(list);
		container.appendChild(element('div', '', TEXT.licencesHint));
	}

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'formDone' && message.form === 'plan') { planEdited = false; }
		if (message.command === 'formDone' && message.form === 'explanations') { explanationsEdited = false; }
		if (articleDataMessage(message) || message.command !== 'replication') {
			return;
		}
		replication = message.replication;
		const draftHint = document.getElementById('draftHint');
		draftHint.hidden = !message.draft;
		stepLinks(draftHint, TEXT.draftHint, { '{0}': ['article', '1', TEXT.stepArticle] });
		if (document.activeElement !== heading) { heading.textContent = replication.title; }
		// 1. Article and Data
		showArticleData(replication);
		// 2. Plan
		renderPlan();
		// 3. Replicate
		refresh('instructions', replication.instructions);
		const openNotebook = document.getElementById('openNotebook');
		openNotebook.hidden = !replication.notebook;
		openNotebook.dataset.file = replication.notebook || '';
		document.getElementById('notebookState').textContent = replication.notebook ? TEXT.notebook.replace('{0}', replication.notebook) : TEXT.noNotebook;
		// 4. Compare
		renderDifferences(replication.results);
		// 5. Record and Share
		renderResults(replication.results);
		const fromResults = computed(replication.results);
		document.getElementById('statusFromResults').textContent = fromResults ? TEXT.fromResults.replace('{0}', fromResults === 'full' ? TEXT.full : TEXT.partial) : TEXT.fromNoResults;
		refresh('status', replication.status || '');
		refresh('statusReason', replication.statusReason || '');
		const status = replication.status || fromResults;
		document.getElementById('statusHead').textContent = status ? (status === 'full' ? TEXT.statusFull : TEXT.statusPartial) : '';
		renderLicences(replication.inputs);
		document.getElementById('done').textContent = replication.done ? TEXT.backToProgress : TEXT.addToMine;
		document.getElementById('doneHint').textContent = replication.done ? TEXT.doneHint : TEXT.inProgressHint;
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

/** A replication of the user's, as Browse Replications lists it. */
export interface IReplicationSummary {
	/** The replication's folder, as a URI string. */
	readonly id: string;
	readonly name: string;
	readonly title: string;
	readonly citation?: string;
	readonly inputs: number;
	readonly targets: number;
	/** No article, tables or results yet. */
	readonly empty: boolean;
	/** Not added to the user's replications yet. */
	readonly inProgress: boolean;
}

/** The user's replications, the folders of ~/.pollis/replications with a replication.toml, for Browse Replications. */
export async function readReplicationSummaries(fileService: IFileService, pathService: IPathService): Promise<IReplicationSummary[]> {
	return (await readReplications(fileService, pathService)).map(replication => ({
		id: replication.folder.toString(),
		name: replication.name,
		title: replication.title,
		citation: replication.citation,
		inputs: replication.inputs.length,
		targets: replication.targets.length,
		empty: isEmptyReplication(replication),
		inProgress: !replication.done,
	}));
}

/** The folder holding the user's replications, which Browse Replications watches. */
export function userReplicationsFolder(pathService: IPathService): URI {
	return replicationsFolder(pathService);
}

/** Opens the page of one of the user's replications, by its id. */
export async function openUserReplication(accessor: ServicesAccessor, id: string): Promise<void> {
	return openReplicationPage(accessor, URI.parse(id));
}

/**
 * Deletes replications of the user's, by id, or all the empty ones, after asking: their folders go to the trash
 * and their pages close.
 */
export async function deleteUserReplications(accessor: ServicesAccessor, which: string | 'empty'): Promise<void> {
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const dialogService = accessor.get(IDialogService);
	const replications = await readReplications(fileService, pathService);
	const doomed = which === 'empty' ? replications.filter(isEmptyReplication) : replications.filter(replication => replication.folder.toString() === which);
	if (!doomed.length) {
		return;
	}
	const { confirmed } = await dialogService.confirm(which === 'empty'
		? {
			message: localize('replicateArticle.deleteEmpty.confirm', "Delete {0} empty replications?", doomed.length),
			detail: localize('replicateArticle.deleteEmpty.detail', "Replications with no article, tables or results: {0}. Their folders go to the trash.", doomed.map(replication => replication.name).join(', ')),
			primaryButton: localize({ key: 'replicateArticle.delete.button', comment: ['&& denotes a mnemonic'] }, "&&Delete"),
		}
		: {
			message: localize('replicateArticle.delete.confirm', "Delete the replication {0}?", doomed[0].title),
			detail: localize('replicateArticle.delete.detail', "Its folder {0} goes to the trash, with its tables and results.", doomed[0].folder.fsPath),
			primaryButton: localize({ key: 'replicateArticle.delete.button', comment: ['&& denotes a mnemonic'] }, "&&Delete"),
		});
	if (!confirmed) {
		return;
	}
	for (const replication of doomed) {
		openPages.get(replication.folder.toString())?.dispose();
		await fileService.del(replication.folder, { recursive: true, useTrash: true });
	}
}

registerAction2(class extends Action2 {
	constructor() {
		super({ id: REPLICATE_ARTICLE_COMMAND_ID, title: localize2('replicateArticle.open', "Replicate an Article..."), category: localize2('replication.category', "Replication"), f1: true });
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openReplicationPage(accessor);
	}
});

for (const [id, title] of [
	[PLAN_REPLICATION_COMMAND_ID, localize2('replicateArticle.planWithAgent', "Plan with Agent...")],
	[REPLICATE_WITH_AGENT_COMMAND_ID, localize2('replicateArticle.replicateWithAgent', "Replicate with Agent...")],
	[EXPLAIN_DIFFERENCES_COMMAND_ID, localize2('replicateArticle.explainWithAgent', "Explain the Differences with Agent...")],
] as const) {
	registerAction2(class extends Action2 {
		constructor() {
			super({ id, title, category: localize2('replication.category', "Replication"), f1: true });
		}
		run(accessor: ServicesAccessor, folder?: URI): Promise<void> {
			return runReplicationTask(accessor, id, folder);
		}
	});
}
