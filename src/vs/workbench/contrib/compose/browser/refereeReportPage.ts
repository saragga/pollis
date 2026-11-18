/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RunOnceScheduler } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { basename, extname, joinPath } from '../../../../base/common/resources.js';
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
import { folderUri } from '../../model/browser/handlers/scaffold.handler.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { parseToml } from '../../model/browser/common/tomlPanelData.js';
import { REFEREEREPORT_METADATA } from '../../model/browser/webviews/refereeReport.data.js';
import { buildWebviewHtml } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { ITerminalInstanceService, ITerminalService } from '../../terminal/browser/terminal.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { compareCss } from './compareShared.js';
import { freeStudyName, IOrchestrationCell, orchestrationCss, orchestrationPageJs, startStudyAgent, stopAgentRun, studiesFolder, studyStepText, StudyRuns, tomlString, unattendedCells, validStudyName } from './orchestration.js';
import { pollisJlPath, skillFile } from './pollisAgents.js';

// Referee Report, from Compose > Orchestration (compose.contribution.ts): several coding agents referee the same draft of
// a research paper, each on its own and in a role (Methods, Contribution and Literature, Data and Reproducibility,
// Exposition, Devil's Advocate or General), and another agent, the editor, reads the draft and their reports and writes
// the decision letter. A page of the scaffold in the Time Arrow style, in six steps: 1, Draft (Prepare the Draft copies
// the draft, a PDF turned into text with the Poppler tools, and the authors' code and data, if any, into the study);
// 2, Referees; 3, Reports, each referee with the skill referee-report; 4, Editor, with the skill edit-referee-reports;
// 5, Decision; 6, Next Round, a new study for the revised draft, whose referees get their report of the round before,
// the editor's letter and the authors' response. A study is a folder, orchestration/referee-report/<study> of the
// Pollis Workspace: study.toml; paper/ (paper.pdf, .tex, .md or .txt, paper.txt, code/); previous/ in a later round
// (LETTER.md, response.*); referee-1 to referee-N, each with SKILL.md, TASK.md, data/, REPORT.md and report.toml;
// editor/, with SKILL.md, TASK.md, data/, reports/, LETTER.md and decision.toml.

export const REFEREE_REPORT_COMMAND_ID = 'pollis.orchestration.refereeReport';

const KIND = 'referee-report';
const REFEREE_SKILL = 'referee-report';
const EDITOR_SKILL = 'edit-referee-reports';
const STUDY_FILE = 'study.toml';
const PAPER_FOLDER = 'paper';
const PREVIOUS_FOLDER = 'previous';
const REPORT_FILE = 'REPORT.md';
const REPORT_TOML = 'report.toml';
const LETTER_FILE = 'LETTER.md';
const DECISION_TOML = 'decision.toml';
const EDITOR = 'editor';
const MIN_REFEREES = 2;
const MAX_REFEREES = 5;
const DEFAULT_REFEREES = 3;

/** The kinds of draft a referee reads. */
const DRAFT_EXTENSIONS = ['pdf', 'tex', 'md', 'txt'];

/** The roles a referee can take, in the order the referees get them at first. */
const ROLES = ['methods', 'contribution', 'data', 'exposition', 'advocate', 'general'] as const;
type Role = typeof ROLES[number];

function roleNames(): Record<Role, string> {
	return {
		methods: localize('refereeReport.role.methods', "Methods"),
		contribution: localize('refereeReport.role.contribution', "Contribution and Literature"),
		data: localize('refereeReport.role.data', "Data and Reproducibility"),
		exposition: localize('refereeReport.role.exposition', "Exposition"),
		advocate: localize('refereeReport.role.advocate', "Devil's Advocate"),
		general: localize('refereeReport.role.general', "General"),
	};
}

/** The recommendations and decisions, as report.toml and decision.toml write them. */
const VERDICTS = ['accept', 'minor', 'major', 'reject'] as const;

function verdictNames(): Record<typeof VERDICTS[number], string> {
	return {
		accept: localize('refereeReport.accept', "Accept"),
		minor: localize('refereeReport.minor', "Minor Revision"),
		major: localize('refereeReport.major', "Major Revision"),
		reject: localize('refereeReport.reject', "Reject"),
	};
}

/** What the user sets in step 1. */
interface IDraftInputs {
	readonly name: string;
	readonly draft: string;
	readonly field: string;
	readonly journal: string;
	/** The folder of the authors' code and data, or ''. */
	readonly code: string;
}

interface IRefereeEntry {
	readonly agent: string;
	readonly model: string;
	readonly label: string;
	readonly role: Role;
}

interface ICellEntry {
	readonly agent: string;
	readonly model: string;
	readonly label: string;
}

/** A study as its study.toml records it: one round of review of one draft. */
interface IStudy {
	readonly folder: URI;
	readonly name: string;
	readonly round: number;
	/** The study of the round before, or ''. */
	readonly previous: string;
	/** The draft's file in paper/, such as paper.pdf. */
	readonly draft: string;
	readonly field: string;
	readonly journal: string;
	readonly code: boolean;
	/** The authors' response to the round before, its file in previous/, or ''. */
	readonly response: string;
	readonly created: string;
	readonly referees: readonly IRefereeEntry[];
	readonly editor?: ICellEntry;
}

/** The runs of the referees and editors of every study started since Pollis started. */
const runs = new StudyRuns();

type RefereeReportMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'prepare'; readonly inputs: IDraftInputs }
	| { readonly command: 'choose'; readonly what: 'draft' | 'code' | 'revised' | 'response'; readonly value: string }
	| { readonly command: 'startReferees'; readonly referees: readonly { readonly agent: string; readonly model: string; readonly role: string }[] }
	| { readonly command: 'startEditor'; readonly cell: { readonly agent: string; readonly model: string } }
	| { readonly command: 'nextRound'; readonly draft: string; readonly response: string }
	| { readonly command: 'load'; readonly name: string }
	| { readonly command: 'newStudy' }
	| { readonly command: 'open'; readonly agent: string; readonly what: 'report' | 'letter' | 'terminal' | 'stop' }
	| { readonly command: 'restart'; readonly agent: string; readonly cell: { readonly agent: string; readonly model: string }; readonly role?: string };

/** The open page, so a second request shows the same page. */
let openPage: WebviewInput | undefined;

function isRole(value: unknown): value is Role {
	return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

function checkedCell(value: unknown): { agent: string; model: string } | undefined {
	const cell = value as { agent?: unknown; model?: unknown } | undefined;
	return typeof cell?.agent === 'string' && typeof cell.model === 'string' ? { agent: cell.agent, model: cell.model } : undefined;
}

/** The inputs of step 1 as the page sent them, checked. */
function checkedInputs(value: unknown): IDraftInputs | undefined {
	if (!value || typeof value !== 'object') {
		return undefined;
	}
	const { name, draft, field, journal, code } = value as Record<string, unknown>;
	if (typeof name !== 'string' || typeof draft !== 'string' || typeof field !== 'string' || typeof journal !== 'string' || typeof code !== 'string') {
		return undefined;
	}
	return { name: name.trim(), draft: draft.trim(), field: field.trim(), journal: journal.trim(), code: code.trim() };
}

/** A one-line value for study.toml: line breaks become spaces. */
function oneLine(value: string): string {
	return tomlString(value.replace(/\s+/g, ' ').trim());
}

function studyToml(study: IStudy): string {
	const lines = [
		'# Referee Report: a study of Compose > Orchestration in Pollis, one round of review of a draft',
		`round = ${study.round}`,
		`previous = ${tomlString(study.previous)}`,
		`draft = ${tomlString(study.draft)}`,
		`field = ${oneLine(study.field)}`,
		`journal = ${oneLine(study.journal)}`,
		`code = ${study.code}`,
		`response = ${tomlString(study.response)}`,
		`created = ${tomlString(study.created)}`,
	];
	if (study.editor) {
		lines.push(`editor_agent = ${tomlString(study.editor.agent)}`, `editor_model = ${tomlString(study.editor.model)}`, `editor_label = ${tomlString(study.editor.label)}`);
	}
	for (const referee of study.referees) {
		lines.push('', '[[referees]]', `agent = ${tomlString(referee.agent)}`, `model = ${tomlString(referee.model)}`, `label = ${tomlString(referee.label)}`, `role = ${tomlString(referee.role)}`);
	}
	return lines.join('\n') + '\n';
}

async function readStudy(fileService: IFileService, folder: URI): Promise<IStudy | undefined> {
	try {
		const toml = parseToml((await fileService.readFile(joinPath(folder, STUDY_FILE))).value.toString());
		const text = (key: string) => typeof toml[key] === 'string' ? toml[key] as string : '';
		const referees: IRefereeEntry[] = [];
		for (const entry of Array.isArray(toml.referees) ? toml.referees as Record<string, unknown>[] : []) {
			if (typeof entry?.agent === 'string' && typeof entry.model === 'string') {
				referees.push({ agent: entry.agent, model: entry.model, label: typeof entry.label === 'string' ? entry.label : entry.agent, role: isRole(entry.role) ? entry.role : 'general' });
			}
		}
		const editor = text('editor_agent') && text('editor_model') ? { agent: text('editor_agent'), model: text('editor_model'), label: text('editor_label') || text('editor_agent') } : undefined;
		return {
			folder, name: basename(folder), round: typeof toml.round === 'number' ? toml.round : 1, previous: text('previous'), draft: text('draft'), field: text('field'),
			journal: text('journal'), code: toml.code === true, response: text('response'), created: text('created'), referees, editor,
		};
	} catch {
		return undefined;
	}
}

/** A TOML file of an agent's folder, parsed; undefined when it is not there or cannot be read. */
async function readToml(fileService: IFileService, file: URI): Promise<Record<string, unknown> | undefined> {
	try {
		return parseToml((await fileService.readFile(file)).value.toString());
	} catch {
		return undefined;
	}
}

/** A referee's report.toml, checked. */
function recommendationOf(toml: Record<string, unknown> | undefined) {
	if (!toml || typeof toml.recommendation !== 'string' || !(VERDICTS as readonly string[]).includes(toml.recommendation)) {
		return undefined;
	}
	const count = (key: string) => typeof toml[key] === 'number' && Number.isFinite(toml[key]) ? toml[key] as number : undefined;
	return { recommendation: toml.recommendation, confidence: count('confidence'), major: count('major'), minor: count('minor'), summary: typeof toml.summary === 'string' ? toml.summary : '' };
}

/** The editor's decision.toml, checked. */
function decisionOf(toml: Record<string, unknown> | undefined) {
	if (!toml || typeof toml.decision !== 'string' || !(VERDICTS as readonly string[]).includes(toml.decision)) {
		return undefined;
	}
	return { decision: toml.decision, required: typeof toml.required === 'number' ? toml.required : undefined, summary: typeof toml.summary === 'string' ? toml.summary : '' };
}

/** What a referee or the editor reads of the paper, as TASK.md lists it. */
function paperLines(study: IStudy, hasText: boolean, editor: boolean): string[] {
	const lines = [
		localize('refereeReport.task.field', "- Field: {0}", study.field || localize('refereeReport.task.notGiven', "not given")),
		localize('refereeReport.task.journal', "- Journal: {0}", study.journal || localize('refereeReport.task.noJournal', "not named; judge it as a good general journal of the field would")),
		localize('refereeReport.task.round', "- Round: {0}", study.round),
		localize('refereeReport.task.draft', "- The draft: `data/{0}`", study.draft),
	];
	if (hasText) {
		lines.push(localize('refereeReport.task.text', "- Its text, page by page, each page after a form feed: `data/paper.txt`"));
	}
	lines.push(study.code ? localize('refereeReport.task.code', "- The authors' code and data: `data/code/`") : localize('refereeReport.task.noCode', "- The authors gave no code or data."));
	if (study.round > 1 && editor) {
		lines.push(localize('refereeReport.task.editorPrevious', "- The round before: `data/previous/`, with your letter of it and, if they wrote one, the authors' response"));
	} else if (study.round > 1) {
		lines.push(localize('refereeReport.task.previous', "- The round before: `data/previous/`, with your report of it, the editor's letter and, if they wrote one, the authors' response"));
	}
	return lines;
}

/** A referee's task, as it reads it in TASK.md. */
function refereeTask(study: IStudy, index: number, hasText: boolean): string {
	const role = roleNames()[study.referees[index].role];
	return [
		localize('refereeReport.task.title', "# Your Task"),
		'',
		localize('refereeReport.task.intro', "You are Referee {0} of the {1} referees of the paper in `data/`, in the role **{2}**. Each referee reports on its own, and an editor then reads every report. Follow SKILL.md, in this folder.", index + 1, study.referees.length, role),
		'',
		localize('refereeReport.task.paper', "## The Paper"),
		'',
		...paperLines(study, hasText, false),
		'',
		localize('refereeReport.task.julia', "## Running Julia"),
		'',
		localize('refereeReport.task.juliaText', "To check the authors' Julia code or a computation of the draft, run Julia with the command below, which gives Julia the packages of Pollis:"),
		'',
		'```sh',
		`julia -L "${pollisJlPath()}" file.jl`,
		'```',
		'',
	].join('\n');
}

/** The editor's task, as it reads it in TASK.md: the paper and each referee with its role and report. */
function editorTask(study: IStudy, hasText: boolean, reported: readonly boolean[]): string {
	const names = roleNames();
	return [
		localize('refereeReport.editorTask.title', "# Your Task"),
		'',
		localize('refereeReport.editorTask.intro', "You are the editor of the paper in `data/`. Its referees have reported, each on its own and in a role. Follow SKILL.md, in this folder."),
		'',
		localize('refereeReport.task.paper', "## The Paper"),
		'',
		...paperLines(study, hasText, true),
		'',
		localize('refereeReport.editorTask.referees', "## The Referees"),
		'',
		...study.referees.map((referee, index) => reported[index]
			? localize('refereeReport.editorTask.reported', "- Referee {0}, {1}: `reports/referee-{0}.md` and `reports/referee-{0}.toml`", index + 1, names[referee.role])
			: localize('refereeReport.editorTask.missing', "- Referee {0}, {1}: wrote no report", index + 1, names[referee.role])),
		'',
	].join('\n');
}

/** Opens the Referee Report page, or shows it when it is open. */
async function openRefereeReportPage(accessor: ServicesAccessor): Promise<void> {
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
	const terminalService = accessor.get(ITerminalService);
	const terminalInstanceService = accessor.get(ITerminalInstanceService);
	const progressService = accessor.get(IProgressService);
	const instantiationService = accessor.get(IInstantiationService);
	const fileDialogService = accessor.get(IFileDialogService);
	const launchServices = { terminalService, terminalInstanceService, fileService, commandService, progressService, workspaceContextService: contextService, pathService };

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('refereeReport.title', "Referee Report");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.refereeReport',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml());
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'refereeReport', title, REFEREEREPORT_METADATA.refereeReport, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));

	/** The study shown in steps 2 to 6, once prepared or opened; its folders are watched. */
	let current: IStudy | undefined;
	const watcher = disposables.add(new MutableDisposable<DisposableStore>());
	const refresh = disposables.add(new RunOnceScheduler(() => sendState(), 300));
	runs.onEnded = () => refresh.schedule();
	const home = await pathService.userHome({ preferLocal: true });

	const watch = (study: IStudy | undefined) => {
		current = study;
		if (!study) {
			watcher.clear();
			return;
		}
		const store = new DisposableStore();
		const folders = [study.folder, joinPath(study.folder, PAPER_FOLDER), joinPath(study.folder, EDITOR), ...Array.from({ length: MAX_REFEREES }, (_, index) => joinPath(study.folder, `referee-${index + 1}`))];
		for (const folder of folders) {
			const fileWatcher = store.add(fileService.createWatcher(folder, { recursive: false, excludes: [] }));
			store.add(fileWatcher.onDidChange(() => refresh.schedule()));
		}
		watcher.value = store;
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

	/**
	 * Copies a document into a folder as `<base>.<extension>`, and a PDF's text, page by page, as `<base>.txt`, with
	 * the Poppler tools; gives the file's name, or 'installing' while the tools are installed.
	 */
	const copyDocument = async (source: URI, folder: URI, base: string): Promise<string | 'installing'> => {
		const extension = extname(source).toLowerCase().replace(/^\./, '');
		const file = `${base}.${extension}`;
		const target = joinPath(folder, file);
		await fileService.copy(source, target, true);
		if (extension !== 'pdf') {
			return file;
		}
		const answer = await commandService.executeCommand<{ error?: string }>('language-julia.pollisPoppler', {
			op: 'run', tool: 'pdftotext', args: ['-enc', 'UTF-8', target.fsPath, joinPath(folder, `${base}.txt`).fsPath],
		}).catch(() => undefined);
		return answer?.error === 'installing' ? 'installing' : file;
	};

	/** The number of pages of paper.txt, by its form feeds, or undefined when there is no text. */
	const pagesOf = async (study: IStudy): Promise<number | undefined> => {
		try {
			const text = (await fileService.readFile(joinPath(study.folder, PAPER_FOLDER, 'paper.txt'))).value.toString();
			return study.draft.endsWith('.pdf') ? Math.max(1, text.replace(/\f\s*$/, '').split('\f').length) : undefined;
		} catch {
			return undefined;
		}
	};

	/** Whether a PDF draft's text was written, as paper.txt; a draft of text is read as it is. */
	const hasPaperText = async (study: IStudy) => study.draft.endsWith('.pdf') && fileService.exists(joinPath(study.folder, PAPER_FOLDER, 'paper.txt'));

	let cells: IOrchestrationCell[] = [];
	const sendState = async () => {
		const root = await studiesFolder(contextService, fileService, configurationService, pathService, KIND);
		const studies = await studyNames(root);
		const study = current && await readStudy(fileService, current.folder);
		let previousReferees: { agent: string; model: string; role: Role }[] = [];
		if (study && !study.referees.length && study.previous) {
			const previous = await readStudy(fileService, joinPath(root, study.previous));
			previousReferees = previous?.referees.map(referee => ({ agent: referee.agent, model: referee.model, role: referee.role })) ?? [];
		}
		const editorRun = study?.editor && await runs.state(fileService, study.folder, EDITOR, study.editor.label, LETTER_FILE);
		post({
			command: 'state',
			root: root.fsPath,
			studies,
			cells,
			suggestion: freeStudyName('draft', studies),
			study: study && {
				name: study.name,
				round: study.round,
				previous: study.previous,
				draft: study.draft,
				field: study.field,
				journal: study.journal,
				code: study.code,
				pages: await pagesOf(study),
				previousReferees,
				referees: await Promise.all(study.referees.map(async (entry, index) => {
					const key = `referee-${index + 1}`;
					return {
						...await runs.state(fileService, study.folder, key, entry.label, REPORT_FILE),
						agent: entry.agent, model: entry.model, role: entry.role,
						report: recommendationOf(await readToml(fileService, joinPath(study.folder, key, REPORT_TOML))),
					};
				})),
				editor: editorRun && study.editor && { ...editorRun, agent: study.editor.agent, model: study.editor.model },
				decision: decisionOf(await readToml(fileService, joinPath(study.folder, EDITOR, DECISION_TOML))),
			},
		});
	};

	/** Writes the study's folder: the draft, its text and the authors' code and data, in paper/. */
	const prepare = async (inputs: IDraftInputs) => {
		const root = await studiesFolder(contextService, fileService, configurationService, pathService, KIND);
		const problem = (text: string) => post({ command: 'problem', step: 'prepare', text });
		if (!validStudyName(inputs.name)) {
			problem(localize('refereeReport.badName', "The study's name is its folder's: letters, digits, hyphens and underscores, starting with a letter or digit."));
			return;
		}
		if (await fileService.exists(joinPath(root, inputs.name))) {
			problem(localize('refereeReport.taken', "There is a study {0} already: open it from the list, or give the new one another name.", inputs.name));
			return;
		}
		const draft = folderUri(inputs.draft, home);
		if (!inputs.draft || !await fileService.exists(draft) || !DRAFT_EXTENSIONS.includes(extname(draft).toLowerCase().replace(/^\./, ''))) {
			problem(localize('refereeReport.noDraft', "Choose the draft: a PDF, LaTeX, Markdown or text file."));
			return;
		}
		const code = inputs.code ? folderUri(inputs.code, home) : undefined;
		if (code && !(await fileService.stat(code).then(stat => stat.isDirectory, () => false))) {
			problem(localize('refereeReport.noCode', "The folder of code and data is not there: choose it again, or leave it empty."));
			return;
		}
		const folder = joinPath(root, inputs.name);
		const copied = await copyDocument(draft, joinPath(folder, PAPER_FOLDER), 'paper');
		if (copied === 'installing') {
			await fileService.del(folder, { recursive: true });
			problem(localize('refereeReport.installing', "The PDF tools are being installed, to read the draft's text: press Prepare the Draft again in a minute."));
			return;
		}
		if (code) {
			await fileService.copy(code, joinPath(folder, PAPER_FOLDER, 'code'), true);
		}
		const study: IStudy = {
			folder, name: inputs.name, round: 1, previous: '', draft: copied, field: inputs.field, journal: inputs.journal, code: !!code, response: '',
			created: new Date().toISOString().slice(0, 16).replace('T', ' '), referees: [],
		};
		await fileService.writeFile(joinPath(folder, STUDY_FILE), VSBuffer.fromString(studyToml(study)));
		watch(study);
		await sendState();
	};

	/**
	 * An agent's folder before it starts: the paper in data/ and, in a later round, data/previous/ with the study's
	 * previous/ (the editor's letter and the authors' response) and the agent's own report of the round before.
	 */
	const fillAgentFolder = async (study: IStudy, key: string) => {
		const folder = joinPath(study.folder, key);
		await fileService.copy(joinPath(study.folder, PAPER_FOLDER), joinPath(folder, 'data'), true);
		if (study.round > 1 && await fileService.exists(joinPath(study.folder, PREVIOUS_FOLDER))) {
			await fileService.copy(joinPath(study.folder, PREVIOUS_FOLDER), joinPath(folder, 'data', 'previous'), true);
			const root = await studiesFolder(contextService, fileService, configurationService, pathService, KIND);
			const own = joinPath(root, study.previous, key, REPORT_FILE);
			if (key !== EDITOR && await fileService.exists(own)) {
				await fileService.copy(own, joinPath(folder, 'data', 'previous', REPORT_FILE), true);
			}
		}
	};

	const skillOf = async (name: string, step: string) => {
		const skill = await instantiationService.invokeFunction(skillFile, name);
		if (!skill || !await fileService.exists(skill)) {
			post({ command: 'problem', step, text: localize('refereeReport.noSkill', "The skill {0} of the Pollis Agents plugin could not be found.", name) });
			return undefined;
		}
		return skill;
	};

	const startReferee = async (study: IStudy, index: number, skill: URI, focus: boolean) => {
		const key = `referee-${index + 1}`;
		await fillAgentFolder(study, key);
		const entry = study.referees[index];
		await startStudyAgent(launchServices, configurationService, notificationService, runs, {
			study: study.folder, key, cell: entry, skill, focus, task: refereeTask(study, index, await hasPaperText(study)),
			terminalName: localize('refereeReport.terminal', "Referee Report: {0}, Referee {1}, {2} ({3})", study.name, index + 1, roleNames()[entry.role], entry.label),
		});
	};

	/** Starts every referee at once, each in its folder with the skill, its task and the paper. */
	const startReferees = async (chosen: { agent: string; model: string; role: string }[]) => {
		const study = current && await readStudy(fileService, current.folder);
		if (!study) {
			return;
		}
		if (chosen.length < MIN_REFEREES || chosen.length > MAX_REFEREES) {
			post({ command: 'problem', step: 'start', text: localize('refereeReport.count', "From {0} to {1} referees read the draft.", MIN_REFEREES, MAX_REFEREES) });
			return;
		}
		const referees = chosen.map(choice => {
			const cell = cells.find(other => other.agent === choice.agent && other.model === choice.model);
			return cell && isRole(choice.role) ? { agent: cell.agent, model: cell.model, label: cell.label, role: choice.role } : undefined;
		});
		if (referees.some(referee => !referee)) {
			post({ command: 'problem', step: 'start', text: localize('refereeReport.noCell', "Choose a role, an agent and a model for every referee.") });
			return;
		}
		const skill = await skillOf(REFEREE_SKILL, 'start');
		if (!skill) {
			return;
		}
		const withReferees: IStudy = { ...study, referees: referees.map(referee => referee!) };
		await fileService.writeFile(joinPath(study.folder, STUDY_FILE), VSBuffer.fromString(studyToml(withReferees)));
		watch(withReferees);
		for (const index of withReferees.referees.keys()) {
			await startReferee(withReferees, index, skill, index === 0);
		}
		await sendState();
	};

	/** Starts the editor, with the paper and every report written, in reports/. */
	const startEditor = async (study: IStudy, cell: IOrchestrationCell, step: string) => {
		const skill = await skillOf(EDITOR_SKILL, step);
		if (!skill) {
			return;
		}
		const withEditor: IStudy = { ...study, editor: { agent: cell.agent, model: cell.model, label: cell.label } };
		await fileService.writeFile(joinPath(study.folder, STUDY_FILE), VSBuffer.fromString(studyToml(withEditor)));
		await fillAgentFolder(withEditor, EDITOR);
		const reported: boolean[] = [];
		for (const index of withEditor.referees.keys()) {
			const key = `referee-${index + 1}`;
			const report = joinPath(study.folder, key, REPORT_FILE);
			reported.push(await fileService.exists(report));
			if (reported[index]) {
				await fileService.copy(report, joinPath(study.folder, EDITOR, 'reports', `${key}.md`), true);
				const toml = joinPath(study.folder, key, REPORT_TOML);
				if (await fileService.exists(toml)) {
					await fileService.copy(toml, joinPath(study.folder, EDITOR, 'reports', `${key}.toml`), true);
				}
			}
		}
		watch(withEditor);
		await startStudyAgent(launchServices, configurationService, notificationService, runs, {
			study: study.folder, key: EDITOR, cell: withEditor.editor!, skill, focus: true, task: editorTask(withEditor, await hasPaperText(study), reported),
			terminalName: localize('refereeReport.editorTerminal', "Referee Report: {0}, Editor ({1})", study.name, cell.label),
		});
		await sendState();
	};

	const refereesRunning = (study: IStudy) => study.referees.some((_, index) => {
		const run = runs.get(study.folder, `referee-${index + 1}`);
		return run && run.ended === undefined;
	});

	const editorStart = async (chosen: { agent: string; model: string }) => {
		const study = current && await readStudy(fileService, current.folder);
		if (!study || !study.referees.length) {
			return;
		}
		if (refereesRunning(study)) {
			post({ command: 'problem', step: 'editor', text: localize('refereeReport.waitReferees', "Wait for the referees to end, or stop them in Reports.") });
			return;
		}
		const cell = cells.find(other => other.agent === chosen.agent && other.model === chosen.model);
		if (!cell) {
			post({ command: 'problem', step: 'editor', text: localize('refereeReport.noEditorCell', "Choose an agent and a model for the editor.") });
			return;
		}
		await startEditor(study, cell, 'editor');
	};

	/**
	 * Starts a referee or the editor again, the others left as they are: on the agent, model and role now chosen for
	 * it, in its folder emptied, its earlier work moved to the Trash.
	 */
	const restart = async (key: string, chosenCell: { agent: string; model: string }, role: string | undefined) => {
		const study = current && await readStudy(fileService, current.folder);
		if (!study) {
			return;
		}
		const step = key === EDITOR ? 'editor' : 'runs';
		const run = runs.get(study.folder, key);
		if (run && run.ended === undefined) {
			post({ command: 'problem', step, text: localize('refereeReport.stillRunning', "It is running: stop it first, then restart it.") });
			return;
		}
		const cell = cells.find(other => other.agent === chosenCell.agent && other.model === chosenCell.model);
		if (!cell) {
			post({ command: 'problem', step, text: localize('refereeReport.noRestartCell', "Choose an agent and a model for it, then restart it.") });
			return;
		}
		const folder = joinPath(study.folder, key);
		if (key === EDITOR) {
			if (refereesRunning(study)) {
				post({ command: 'problem', step, text: localize('refereeReport.waitReferees', "Wait for the referees to end, or stop them in Reports.") });
				return;
			}
			if (await fileService.exists(folder)) {
				await fileService.del(folder, { recursive: true, useTrash: true });
			}
			await startEditor(study, cell, step);
			return;
		}
		const index = Number(/^referee-(\d+)$/.exec(key)?.[1]) - 1;
		if (!(index >= 0 && index < study.referees.length)) {
			return;
		}
		const skill = await skillOf(REFEREE_SKILL, step);
		if (!skill) {
			return;
		}
		const withReferees: IStudy = { ...study, referees: study.referees.map((entry, i) => i === index ? { agent: cell.agent, model: cell.model, label: cell.label, role: isRole(role) ? role : entry.role } : entry) };
		await fileService.writeFile(joinPath(study.folder, STUDY_FILE), VSBuffer.fromString(studyToml(withReferees)));
		if (await fileService.exists(folder)) {
			await fileService.del(folder, { recursive: true, useTrash: true });
		}
		watch(withReferees);
		await startReferee(withReferees, index, skill, true);
		await sendState();
	};

	/**
	 * Makes the study of the next round: the revised draft and its text in paper/, the authors' code and data of this
	 * round, and in previous/ the editor's letter and the authors' response; its referees are chosen in step 2, at first
	 * as in this round, and each gets its own report of this round.
	 */
	const nextRound = async (draftPath: string, responsePath: string) => {
		const study = current && await readStudy(fileService, current.folder);
		if (!study) {
			return;
		}
		const problem = (text: string) => post({ command: 'problem', step: 'next', text });
		const letter = joinPath(study.folder, EDITOR, LETTER_FILE);
		if (!await fileService.exists(letter)) {
			problem(localize('refereeReport.needLetter', "The editor's letter comes first: start the editor in Editor."));
			return;
		}
		const draft = folderUri(draftPath, home);
		if (!draftPath || !await fileService.exists(draft) || !DRAFT_EXTENSIONS.includes(extname(draft).toLowerCase().replace(/^\./, ''))) {
			problem(localize('refereeReport.noRevised', "Choose the revised draft: a PDF, LaTeX, Markdown or text file."));
			return;
		}
		const response = responsePath ? folderUri(responsePath, home) : undefined;
		if (response && (!await fileService.exists(response) || !DRAFT_EXTENSIONS.includes(extname(response).toLowerCase().replace(/^\./, '')))) {
			problem(localize('refereeReport.noResponse', "The authors' response is not there, or is not a PDF, LaTeX, Markdown or text file: choose it again, or leave it empty."));
			return;
		}
		const root = await studiesFolder(contextService, fileService, configurationService, pathService, KIND);
		const name = freeStudyName(`${study.name.replace(/-round-\d+$/, '')}-round-${study.round + 1}`, await studyNames(root));
		const folder = joinPath(root, name);
		const copied = await copyDocument(draft, joinPath(folder, PAPER_FOLDER), 'paper');
		const copiedResponse = copied !== 'installing' && response ? await copyDocument(response, joinPath(folder, PREVIOUS_FOLDER), 'response') : undefined;
		if (copied === 'installing' || copiedResponse === 'installing') {
			await fileService.del(folder, { recursive: true });
			problem(localize('refereeReport.installingNext', "The PDF tools are being installed, to read the text: press Start the Next Round again in a minute."));
			return;
		}
		if (study.code) {
			await fileService.copy(joinPath(study.folder, PAPER_FOLDER, 'code'), joinPath(folder, PAPER_FOLDER, 'code'), true);
		}
		await fileService.copy(letter, joinPath(folder, PREVIOUS_FOLDER, LETTER_FILE), true);
		const next: IStudy = {
			folder, name, round: study.round + 1, previous: study.name, draft: copied, field: study.field, journal: study.journal, code: study.code,
			response: copiedResponse ?? '', created: new Date().toISOString().slice(0, 16).replace('T', ' '), referees: [],
		};
		await fileService.writeFile(joinPath(folder, STUDY_FILE), VSBuffer.fromString(studyToml(next)));
		watch(next);
		post({ command: 'nextMade', name });
		await sendState();
	};

	const openFile = async (key: string, what: 'report' | 'letter' | 'terminal' | 'stop') => {
		if (!current || !(key === EDITOR || /^referee-\d+$/.test(key))) {
			return;
		}
		if (what === 'stop') {
			await stopAgentRun(runs.get(current.folder, key));
			return;
		}
		if (what === 'terminal') {
			const run = runs.get(current.folder, key);
			if (run && !run.terminal.isDisposed) {
				terminalService.setActiveInstance(run.terminal);
				await terminalService.revealTerminal(run.terminal);
			}
			return;
		}
		const file = joinPath(current.folder, key, what === 'letter' ? LETTER_FILE : REPORT_FILE);
		if (await fileService.exists(file)) {
			await editorService.openEditor({ resource: file });
		}
	};

	const choose = async (what: 'draft' | 'code' | 'revised' | 'response', value: string) => {
		const start = value ? folderUri(value, home) : home;
		const folder = what === 'code';
		const picked = await fileDialogService.showOpenDialog({
			title: what === 'code' ? localize('refereeReport.chooseCode', "Choose the Folder of the Authors' Code and Data")
				: what === 'response' ? localize('refereeReport.chooseResponse', "Choose the Authors' Response")
					: what === 'revised' ? localize('refereeReport.chooseRevised', "Choose the Revised Draft") : localize('refereeReport.chooseDraft', "Choose the Draft"),
			canSelectFiles: !folder,
			canSelectFolders: folder,
			canSelectMany: false,
			filters: folder ? undefined : [{ name: localize('refereeReport.documents', "Documents"), extensions: DRAFT_EXTENSIONS }],
			defaultUri: await fileService.exists(start) ? start : home,
		});
		if (picked?.[0]) {
			post({ command: 'chosen', what, value: picked[0].fsPath });
		}
	};

	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		runs.onEnded = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: RefereeReportMessage }) => {
		const message = e.message;
		try {
			if (message.command === 'ready') {
				cells = await unattendedCells(configurationService, commandService, terminalInstanceService, fileService);
				await sendState();
			} else if (message.command === 'prepare' && hasKey(message, { inputs: true })) {
				const inputs = checkedInputs(message.inputs);
				if (inputs) {
					await prepare(inputs);
				}
			} else if (message.command === 'choose' && hasKey(message, { what: true, value: true }) && ['draft', 'code', 'revised', 'response'].includes(message.what) && typeof message.value === 'string') {
				await choose(message.what, message.value);
			} else if (message.command === 'startReferees' && hasKey(message, { referees: true }) && Array.isArray(message.referees)) {
				const chosen = message.referees.flatMap(referee => {
					const cell = checkedCell(referee);
					return cell && typeof referee.role === 'string' ? [{ ...cell, role: referee.role }] : [];
				});
				await startReferees(chosen);
			} else if (message.command === 'startEditor' && hasKey(message, { cell: true })) {
				const cell = checkedCell(message.cell);
				if (cell) {
					await editorStart(cell);
				}
			} else if (message.command === 'nextRound' && hasKey(message, { draft: true, response: true }) && typeof message.draft === 'string' && typeof message.response === 'string') {
				await nextRound(message.draft.trim(), message.response.trim());
			} else if (message.command === 'load' && hasKey(message, { name: true }) && validStudyName(message.name)) {
				const root = await studiesFolder(contextService, fileService, configurationService, pathService, KIND);
				watch(await readStudy(fileService, joinPath(root, message.name)));
				await sendState();
			} else if (message.command === 'newStudy') {
				watch(undefined);
				await sendState();
			} else if (message.command === 'open' && hasKey(message, { agent: true, what: true }) && typeof message.agent === 'string' && ['report', 'letter', 'terminal', 'stop'].includes(message.what)) {
				await openFile(message.agent, message.what);
			} else if (message.command === 'restart' && hasKey(message, { agent: true, cell: true }) && typeof message.agent === 'string') {
				const cell = checkedCell(message.cell);
				if (cell) {
					await restart(message.agent, cell, typeof message.role === 'string' ? message.role : undefined);
				}
			}
		} catch (error) {
			notificationService.error(toErrorMessage(error));
		}
	}));
}

function pageHtml(): string {
	const shared = studyStepText();
	const roles = roleNames();
	const text = {
		study: shared.study,
		studyTooltip: shared.studyTooltip,
		earlierNone: shared.earlierNone,
		newStudy: shared.newStudy,
		studyFolder: shared.studyFolder,
		between: shared.between,
		choose: shared.choose,
		intro: localize('refereeReport.intro', "Several coding agents referee the same draft of a research paper, each on its own and in a role: Methods, Contribution and Literature, Data and Reproducibility, Exposition, Devil's Advocate or General. Another agent, the editor, reads the draft and their reports, and writes the decision letter to the authors. A revised draft goes to the same referees in a next round."),
		draftStep: localize('refereeReport.draftStep', "Draft"),
		draft: localize('refereeReport.draft', "Draft"),
		draftHint: localize('refereeReport.draftHint', "A PDF, LaTeX, Markdown or text file. A PDF is turned into text, page by page, so that every agent can read it."),
		field: localize('refereeReport.field', "Field"),
		fieldPlaceholder: localize('refereeReport.fieldPlaceholder', "For example, labour economics"),
		journal: localize('refereeReport.journal', "Journal"),
		journalPlaceholder: localize('refereeReport.journalPlaceholder', "Optional: the journal the paper is for"),
		code: localize('refereeReport.code', "Code and Data"),
		codePlaceholder: localize('refereeReport.codePlaceholder', "Optional: the folder of the authors' code and data"),
		codeHint: localize('refereeReport.codeHint', "The draft, and the code and data if given, are copied into the study's folder, and each agent gets a copy of its own."),
		prepare: localize('refereeReport.prepare', "Prepare the Draft"),
		prepared: localize('refereeReport.prepared', "Round {0}: {1}"),
		pages: localize('refereeReport.pages', "{0} pages of text"),
		noText: localize('refereeReport.noText', "its text could not be read: the agents read the PDF"),
		withCode: localize('refereeReport.withCode', "with the authors' code and data"),
		refereesStep: localize('refereeReport.refereesStep', "Referees"),
		refereesHint: localize('refereeReport.refereesHint', "Each referee reads the whole draft, on its own and in a folder of its own, and goes deepest into its role. Different roles cover different ground, as an editor seeks; different models make the reports less alike. Each run is billed by its agent's provider, as any run of the agent is."),
		roleHelp: localize('refereeReport.roleHelp', "Methods: identification, estimation, inference and robustness. Contribution and Literature: what is new against the closest work. Data and Reproducibility: the data, the sample and the code. Exposition: the argument, tables and figures. Devil's Advocate: the strongest case against the main claim. General: the paper as a whole."),
		howMany: localize('refereeReport.howMany', "How Many"),
		refereeLabel: localize('refereeReport.refereeLabel', "Referee {0}"),
		roles,
		noCells: localize('refereeReport.noCells', "No coding agent that can run on its own was found on this computer: install one in Compose > Coding Agents, then open this page again."),
		start: localize('refereeReport.start', "Start the Referees"),
		reportsStep: localize('refereeReport.reportsStep', "Reports"),
		refereeColumn: localize('refereeReport.refereeColumn', "Referee"),
		roleColumn: localize('refereeReport.roleColumn', "Role"),
		agentModel: localize('refereeReport.agentModel', "Agent and Model"),
		status: localize('refereeReport.status', "Status"),
		time: localize('refereeReport.time', "Time"),
		recommendationColumn: localize('refereeReport.recommendationColumn', "Recommendation"),
		open: localize('refereeReport.open', "Open"),
		statuses: {
			waiting: localize('refereeReport.waiting', "Waiting"),
			running: localize('refereeReport.running', "Running"),
			stopped: localize('refereeReport.stopped', "Stopped"),
			done: localize('refereeReport.done', "Done"),
			failed: localize('refereeReport.failedStatus', "Ended without a report"),
			ended: localize('refereeReport.ended', "Ended without a report"),
		},
		editorStatuses: {
			waiting: localize('refereeReport.editorWaiting', "Waiting"),
			running: localize('refereeReport.editorRunning', "Running"),
			stopped: localize('refereeReport.editorStopped', "Stopped"),
			done: localize('refereeReport.editorDone', "Done"),
			failed: localize('refereeReport.editorFailed', "Ended without a letter"),
			ended: localize('refereeReport.editorEnded', "Ended without a letter"),
		},
		exit: localize('refereeReport.exit', "exit code {0}"),
		confidence: localize('refereeReport.confidence', "confidence {0} of 5"),
		report: localize('refereeReport.report', "Report"),
		letter: localize('refereeReport.letter', "Letter"),
		terminal: localize('refereeReport.terminalLink', "Terminal"),
		stop: localize('refereeReport.stop', "Stop"),
		restart: localize('refereeReport.restart', "Restart"),
		restartTooltip: localize('refereeReport.restartTooltip', "Start this referee again, on the role, agent and model chosen for it in Referees, in its folder emptied: its earlier work goes to the Trash"),
		restartEditorTooltip: localize('refereeReport.restartEditorTooltip', "Start the editor again, on the agent and model chosen in Editor, with the reports written now: its earlier letter goes to the Trash"),
		noRuns: localize('refereeReport.noRuns', "The referees show here once they are started."),
		editorStep: localize('refereeReport.editorStep', "Editor"),
		editorHint: localize('refereeReport.editorHint', "The editor reads the draft and every report, weighs the referees' concerns by their arguments rather than by counting recommendations, and writes the decision letter: the decision, the concerns that decide it, where the referees disagree and the revisions required."),
		editorLabel: localize('refereeReport.editorLabel', "Editor"),
		startEditor: localize('refereeReport.startEditor', "Start the Editor"),
		decisionStep: localize('refereeReport.decisionStep', "Decision"),
		noDecision: localize('refereeReport.noDecision', "The decision shows here once the editor has written the letter."),
		decisionIs: localize('refereeReport.decisionIs', "Decision"),
		required: localize('refereeReport.required', "Required Revisions"),
		agreement: localize('refereeReport.agreement', "Referees Who Recommended It"),
		agreementValue: localize('refereeReport.agreementValue', "{0} of {1}"),
		openLetter: localize('refereeReport.openLetter', "Open the Letter"),
		majorColumn: localize('refereeReport.majorColumn', "Major Concerns"),
		minorColumn: localize('refereeReport.minorColumn', "Minor Points"),
		verdicts: verdictNames(),
		nextStep: localize('refereeReport.nextStep', "Next Round"),
		nextHint: localize('refereeReport.nextHint', "Once the authors have revised the draft, the next round is a new study: the referees, at first the same roles, agents and models, each get the revised draft, their own report of this round, the editor's letter and the authors' response, and say which concerns the revision addresses."),
		revised: localize('refereeReport.revised', "Revised Draft"),
		response: localize('refereeReport.response', "Response"),
		responsePlaceholder: localize('refereeReport.responsePlaceholder', "Optional: the authors' response to the referees"),
		startNext: localize('refereeReport.startNext', "Start the Next Round"),
		nextMade: localize('refereeReport.nextMade', "The next round is the study {0}: choose its referees in Referees."),
		roundOf: localize('refereeReport.roundOf', "Round {0}, after {1}"),
		needDraft: localize('refereeReport.needDraft', "Choose the draft first."),
		studyPrepared: localize('refereeReport.studyPrepared', "The draft of this study is prepared: choose New Study for another draft."),
		needPrepare: localize('refereeReport.needPrepare', "Prepare the Draft first."),
		started: localize('refereeReport.started', "The referees of this study have started: restart one from its row in Reports, or choose New Study for another draft."),
		needReferees: localize('refereeReport.needReferees', "Start the referees first."),
		waitReferees: localize('refereeReport.waitReferees', "Wait for the referees to end, or stop them in Reports."),
		noReports: localize('refereeReport.noReports', "No referee has written a report yet."),
		editorStarted: localize('refereeReport.editorStarted', "The editor of this study has started: restart it from its row, below."),
		needLetter: localize('refereeReport.needLetter', "The editor's letter comes first: start the editor in Editor."),
		waitEditor: localize('refereeReport.waitEditor', "Wait for the editor to end, or stop it."),
		needRevised: localize('refereeReport.needRevised', "Choose the revised draft first."),
	};
	return buildWebviewHtml({
		title: localize('refereeReport.title', "Referee Report"),
		introHtml: text.intro,
		omitPoweredBy: !REFEREEREPORT_METADATA.refereeReport.packages.length,
		extraCss: `
		${compareCss}
		${orchestrationCss}
		.missing { color: var(--vscode-errorForeground); }
		#draft, #code, #revised, #response { min-width: 32em; }
		#field, #journal { min-width: 24em; }
		.rr-referees { display: grid; grid-template-columns: max-content minmax(0, 240px) minmax(0, 360px); gap: 6px 12px; align-items: center; margin-top: 8px; }
		.rr-referees select, .rr-editor select { width: 100%; }
		.rr-editor { display: grid; grid-template-columns: max-content minmax(0, 360px); gap: 6px 12px; align-items: center; margin: 8px 0; }
		td.rr-summary { max-width: 420px; color: var(--vscode-descriptionForeground); }
		.rr-verdict-accept { color: var(--vscode-testing-iconPassed, var(--vscode-charts-green)); }
		.rr-verdict-reject { color: var(--vscode-errorForeground); }
		#decisionTable { margin-top: 12px; }
`,
		steps: [
			{
				id: 'step-draft',
				title: text.draftStep,
				bodyHtml: `
		<div class="row">
			<span class="small" title="${text.studyTooltip}">${text.study}</span> <input type="text" id="name" spellcheck="false">
			<select id="earlier"><option value="">${text.earlierNone}</option></select>
			<button class="link" id="newStudy" hidden>${text.newStudy}</button>
		</div>
		<p class="small">${text.studyFolder}</p>
		<div class="row"><span class="small">${text.draft}</span> <input type="text" id="draft" spellcheck="false"> <button class="action" data-choose="draft">${text.choose}</button></div>
		<p class="hint">${text.draftHint}</p>
		<div class="row"><span class="small">${text.field}</span> <input type="text" id="field" placeholder="${text.fieldPlaceholder}"> <span class="small">${text.journal}</span> <input type="text" id="journal" placeholder="${text.journalPlaceholder}"></div>
		<div class="row"><span class="small">${text.code}</span> <input type="text" id="code" spellcheck="false" placeholder="${text.codePlaceholder}"> <button class="action" data-choose="code">${text.choose}</button></div>
		<p class="hint">${text.codeHint}</p>
		<div class="settings"><span class="bar"><button class="action current" id="prepare">${text.prepare}</button></span></div>
		<div class="small status" id="prepareStatus"></div>
		<div class="small status missing" id="prepareProblem"></div>
`,
			},
			{
				id: 'step-referees',
				title: text.refereesStep,
				bodyHtml: `
		<p class="hint">${text.refereesHint}</p>
		<p class="small ma-note">${text.roleHelp}</p>
		<div class="row"><span class="small">${text.howMany}</span> <select id="count">${Array.from({ length: MAX_REFEREES - MIN_REFEREES + 1 }, (_, i) => MIN_REFEREES + i).map(n => `<option value="${n}"${n === DEFAULT_REFEREES ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
		<div class="rr-referees" id="referees"></div>
		<p class="warning" id="noCells" hidden>${text.noCells}</p>
		<div class="settings"><span class="bar"><button class="action" id="start">${text.start}</button></span></div>
		<div class="small status missing" id="startProblem"></div>
`,
			},
			{
				id: 'step-reports',
				title: text.reportsStep,
				bodyHtml: `
		<p class="hint" id="noRuns">${text.noRuns}</p>
		<table class="ma" id="runTable" hidden>
			<thead><tr><th>${text.refereeColumn}</th><th>${text.roleColumn}</th><th>${text.agentModel}</th><th>${text.status}</th><th class="number">${text.time}</th><th>${text.recommendationColumn}</th><th>${text.open}</th></tr></thead>
			<tbody id="runRows"></tbody>
		</table>
		<div class="small status missing" id="runsProblem"></div>
`,
			},
			{
				id: 'step-editor',
				title: text.editorStep,
				bodyHtml: `
		<p class="hint">${text.editorHint}</p>
		<div class="rr-editor"><span class="small">${text.editorLabel}</span> <select id="editorCell"></select></div>
		<div class="settings"><span class="bar"><button class="action" id="startEditor">${text.startEditor}</button></span></div>
		<div class="small status missing" id="editorProblem"></div>
		<table class="ma" id="editorTable" hidden>
			<thead><tr><th>${text.agentModel}</th><th>${text.status}</th><th class="number">${text.time}</th><th>${text.open}</th></tr></thead>
			<tbody id="editorRow"></tbody>
		</table>
`,
			},
			{
				id: 'step-decision',
				title: text.decisionStep,
				bodyHtml: `
		<p class="hint" id="noDecision">${text.noDecision}</p>
		<div id="decisionBox" hidden>
			<div class="ma-figures">
				<div class="ma-figure"><div class="small">${text.decisionIs}</div><div class="value" id="decisionValue"></div></div>
				<div class="ma-figure"><div class="small">${text.required}</div><div class="value" id="requiredValue"></div></div>
				<div class="ma-figure"><div class="small">${text.agreement}</div><div class="value" id="agreementValue"></div></div>
			</div>
			<p class="ma-note" id="decisionSummary"></p>
			<button class="link" data-agent="editor" data-what="letter">${text.openLetter}</button>
			<table class="ma" id="decisionTable">
				<thead><tr><th>${text.refereeColumn}</th><th>${text.roleColumn}</th><th>${text.recommendationColumn}</th><th class="number">${text.majorColumn}</th><th class="number">${text.minorColumn}</th><th></th></tr></thead>
				<tbody id="decisionRows"></tbody>
			</table>
		</div>
`,
			},
			{
				id: 'step-next',
				title: text.nextStep,
				bodyHtml: `
		<p class="hint">${text.nextHint}</p>
		<div class="row"><span class="small">${text.revised}</span> <input type="text" id="revised" spellcheck="false"> <button class="action" data-choose="revised">${text.choose}</button></div>
		<div class="row"><span class="small">${text.response}</span> <input type="text" id="response" spellcheck="false" placeholder="${text.responsePlaceholder}"> <button class="action" data-choose="response">${text.choose}</button></div>
		<div class="settings"><span class="bar"><button class="action" id="startNext">${text.startNext}</button></span></div>
		<div class="small status" id="nextStatus"></div>
		<div class="small status missing" id="nextProblem"></div>
`,
			},
		],
		pageScriptJs: `
	const TEXT = ${JSON.stringify(text)};
	const ROLES = ${JSON.stringify(ROLES)};
	const DEFAULT_REFEREES = ${DEFAULT_REFEREES};
	const nameInput = document.getElementById('name');
	const earlier = document.getElementById('earlier');
	const count = document.getElementById('count');
	const refereesBox = document.getElementById('referees');
	const editorCell = document.getElementById('editorCell');
	const inputs = { draft: document.getElementById('draft'), field: document.getElementById('field'), journal: document.getElementById('journal'), code: document.getElementById('code'), revised: document.getElementById('revised'), response: document.getElementById('response') };
	let state = undefined;
	/** The cell and the role chosen for each referee, kept when their number changes, and the editor's cell. */
	let chosen = [];
	let chosenRoles = [];
	let chosenEditor = '';
	let timer = undefined;
${orchestrationPageJs}

	/** The referees' choices: at first the roles in order and the cells in turn, so that the models differ. */
	function drawReferees() {
		const cells = state ? state.cells : [];
		const n = Number(count.value);
		while (chosen.length < n && cells.length) {
			chosen.push(cellKey(cells[chosen.length % cells.length]));
		}
		while (chosenRoles.length < n) {
			chosenRoles.push(ROLES[chosenRoles.length % ROLES.length]);
		}
		refereesBox.innerHTML = '';
		for (let i = 0; i < n; i++) {
			const label = document.createElement('span');
			label.className = 'small';
			label.textContent = TEXT.refereeLabel.replace('{0}', String(i + 1));
			const role = document.createElement('select');
			role.innerHTML = ROLES.map(r => '<option value="' + r + '">' + escapeHtml(TEXT.roles[r]) + '</option>').join('');
			const select = document.createElement('select');
			select.innerHTML = cells.map(cell => '<option value="' + escapeHtml(cellKey(cell)) + '">' + escapeHtml(cell.label) + '</option>').join('');
			// A running referee keeps its role and model; the others may take another, for Restart
			const run = state && state.study ? state.study.referees[i] : undefined;
			if (run && run.status === 'running') {
				chosen[i] = cellKey(run);
				chosenRoles[i] = run.role;
			}
			role.value = chosenRoles[i];
			select.value = chosen[i] || '';
			role.disabled = select.disabled = !!(run && run.status === 'running');
			role.addEventListener('change', () => { chosenRoles[i] = role.value; });
			select.addEventListener('change', () => { chosen[i] = select.value; });
			refereesBox.append(label, role, select);
		}
		document.getElementById('noCells').hidden = cells.length > 0;
	}

	function drawEditorCell() {
		const cells = state ? state.cells : [];
		editorCell.innerHTML = cells.map(cell => '<option value="' + escapeHtml(cellKey(cell)) + '">' + escapeHtml(cell.label) + '</option>').join('');
		const editor = state && state.study && state.study.editor;
		if (editor && editor.status === 'running') {
			chosenEditor = cellKey(editor);
		}
		if (!chosenEditor && cells.length) {
			// At first the editor's model is one no referee has, when there is one
			const taken = new Set(chosen.slice(0, Number(count.value)));
			chosenEditor = cellKey(cells.find(cell => !taken.has(cellKey(cell))) || cells[0]);
		}
		editorCell.value = chosenEditor;
		editorCell.disabled = !!(editor && editor.status === 'running');
	}

	function link(label, agent, what, title) {
		return '<button class="link" data-agent="' + escapeHtml(agent) + '" data-what="' + what + '"' + (title ? ' title="' + escapeHtml(title) + '"' : '') + '>' + escapeHtml(label) + '</button>';
	}
	function verdict(value) {
		return '<span class="rr-verdict-' + escapeHtml(value) + '">' + escapeHtml(TEXT.verdicts[value] || value) + '</span>';
	}
	function statusText(run, statuses) {
		return statuses[run.status] + (run.status === 'failed' && typeof run.exitCode === 'number' ? ' (' + TEXT.exit.replace('{0}', run.exitCode) + ')' : '');
	}
	function drawRuns() {
		const referees = state.study ? state.study.referees : [];
		document.getElementById('runTable').hidden = !referees.length;
		document.getElementById('noRuns').hidden = referees.length > 0;
		document.getElementById('runRows').innerHTML = referees.map((run, i) => {
			const links = [run.hasFile ? link(TEXT.report, run.key, 'report') : '', run.hasTerminal ? link(TEXT.terminal, run.key, 'terminal') : '', run.status === 'running' ? link(TEXT.stop, run.key, 'stop') : link(TEXT.restart, run.key, 'restart', TEXT.restartTooltip)].filter(x => x).join('');
			const recommendation = run.report ? verdict(run.report.recommendation) + (typeof run.report.confidence === 'number' ? ' <span class="small">(' + escapeHtml(TEXT.confidence.replace('{0}', String(run.report.confidence))) + ')</span>' : '') : '';
			return '<tr><td>' + (i + 1) + '</td><td>' + escapeHtml(TEXT.roles[run.role] || run.role) + '</td><td>' + escapeHtml(run.label) + '</td><td class="status-' + run.status + '">' + escapeHtml(statusText(run, TEXT.statuses)) + '</td><td class="number" data-run="' + escapeHtml(run.key) + '">' + elapsed(run) + '</td><td>' + recommendation + '</td><td class="links">' + links + '</td></tr>';
		}).join('');
		const editor = state.study && state.study.editor;
		document.getElementById('editorTable').hidden = !editor;
		document.getElementById('editorRow').innerHTML = editor ? '<tr><td>' + escapeHtml(editor.label) + '</td><td class="status-' + editor.status + '">' + escapeHtml(statusText(editor, TEXT.editorStatuses)) + '</td><td class="number" data-run="editor">' + elapsed(editor) + '</td><td class="links">'
			+ [editor.hasFile ? link(TEXT.letter, 'editor', 'letter') : '', editor.hasTerminal ? link(TEXT.terminal, 'editor', 'terminal') : '', editor.status === 'running' ? link(TEXT.stop, 'editor', 'stop') : link(TEXT.restart, 'editor', 'restart', TEXT.restartEditorTooltip)].filter(x => x).join('') + '</td></tr>' : '';
		clearInterval(timer);
		const all = referees.concat(editor ? [editor] : []);
		if (all.some(run => run.status === 'running')) {
			timer = setInterval(() => {
				for (const cell of document.querySelectorAll('td[data-run]')) {
					const run = cell.dataset.run === 'editor' ? state.study.editor : state.study.referees.find(r => r.key === cell.dataset.run);
					cell.textContent = run ? elapsed(run) : '';
				}
			}, 1000);
		}
	}

	function drawDecision() {
		const study = state.study;
		const decision = study && study.decision;
		document.getElementById('decisionBox').hidden = !decision;
		document.getElementById('noDecision').hidden = !!decision;
		if (!decision) {
			return;
		}
		document.getElementById('decisionValue').innerHTML = verdict(decision.decision);
		document.getElementById('requiredValue').textContent = typeof decision.required === 'number' ? format(decision.required) : '';
		const reported = study.referees.filter(run => run.report);
		document.getElementById('agreementValue').textContent = TEXT.agreementValue.replace('{0}', String(reported.filter(run => run.report.recommendation === decision.decision).length)).replace('{1}', String(reported.length));
		document.getElementById('decisionSummary').textContent = decision.summary;
		document.getElementById('decisionRows').innerHTML = study.referees.map((run, i) => run.report
			? '<tr><td>' + (i + 1) + '</td><td>' + escapeHtml(TEXT.roles[run.role] || run.role) + '</td><td>' + verdict(run.report.recommendation) + '</td><td class="number">' + format(run.report.major) + '</td><td class="number">' + format(run.report.minor) + '</td><td class="rr-summary">' + escapeHtml(run.report.summary) + '</td></tr>'
			: '').join('');
	}

	/** Why a step's button cannot do its work now, or '' when it can: the buttons are never disabled, and say why when pressed. */
	function prepareBlocked() {
		return state && state.study ? TEXT.studyPrepared : !inputs.draft.value.trim() ? TEXT.needDraft : '';
	}
	function startBlocked() {
		const study = state && state.study;
		return !study ? TEXT.needPrepare
			: study.referees.length ? TEXT.started
				: !state.cells.length ? TEXT.noCells : '';
	}
	function editorBlocked() {
		const study = state && state.study;
		return !study ? TEXT.needPrepare
			: !study.referees.length ? TEXT.needReferees
				: study.referees.some(run => run.status === 'running') ? TEXT.waitReferees
					: !study.referees.some(run => run.hasFile) ? TEXT.noReports
						: study.editor ? TEXT.editorStarted
							: !state.cells.length ? TEXT.noCells : '';
	}
	function nextBlocked() {
		const study = state && state.study;
		return !study ? TEXT.needPrepare
			: study.editor && study.editor.status === 'running' ? TEXT.waitEditor
				: !(study.editor && study.editor.hasFile) ? TEXT.needLetter
					: !inputs.revised.value.trim() ? TEXT.needRevised : '';
	}

	/** The one blue button is the next thing to do; a button that can do its work clears what it said when it could not. */
	function drawButtons() {
		const ready = { prepare: !prepareBlocked(), start: !startBlocked(), editor: !editorBlocked(), next: !nextBlocked() };
		const blue = ready.prepare ? 'prepare' : ready.start ? 'start' : ready.editor ? 'editor' : ready.next ? 'next' : '';
		const ids = { prepare: 'prepare', start: 'start', editor: 'startEditor', next: 'startNext' };
		for (const step of Object.keys(ids)) {
			document.getElementById(ids[step]).classList.toggle('current', step === blue);
			if (ready[step]) {
				document.getElementById(step + 'Problem').textContent = '';
			}
		}
	}

	function draw() {
		const study = state.study;
		document.getElementById('root').textContent = state.root;
		earlier.innerHTML = '<option value="">' + escapeHtml(TEXT.earlierNone) + '</option>' + state.studies.map(name => '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>').join('');
		earlier.value = study ? study.name : '';
		document.getElementById('newStudy').hidden = !study;
		for (const element of [nameInput, inputs.draft, inputs.field, inputs.journal, inputs.code]) {
			element.disabled = !!study;
		}
		for (const button of document.querySelectorAll('button[data-choose="draft"], button[data-choose="code"]')) {
			button.disabled = !!study;
		}
		count.disabled = !!(study && study.referees.length);
		const prepareStatus = document.getElementById('prepareStatus');
		if (study) {
			nameInput.value = study.name;
			inputs.draft.value = study.draft;
			inputs.field.value = study.field;
			inputs.journal.value = study.journal;
			inputs.code.value = '';
			const facts = [typeof study.pages === 'number' ? TEXT.pages.replace('{0}', format(study.pages)) : study.draft.endsWith('.pdf') ? TEXT.noText : '', study.code ? TEXT.withCode : ''].filter(x => x).join(', ');
			prepareStatus.textContent = (study.round > 1 ? TEXT.roundOf.replace('{0}', String(study.round)).replace('{1}', study.previous) + ': ' + study.draft : TEXT.prepared.replace('{0}', String(study.round)).replace('{1}', study.draft)) + (facts ? ', ' + facts : '');
			if (study.referees.length) {
				count.value = String(study.referees.length);
			}
		} else {
			nameInput.value = '';
			nameInput.placeholder = state.suggestion;
			prepareStatus.textContent = '';
		}
		drawReferees();
		drawEditorCell();
		drawRuns();
		drawDecision();
		drawButtons();
	}

	count.addEventListener('change', () => { drawReferees(); drawButtons(); });
	editorCell.addEventListener('change', () => { chosenEditor = editorCell.value; });
	inputs.draft.addEventListener('input', () => state && drawButtons());
	inputs.revised.addEventListener('input', () => state && drawButtons());
	earlier.addEventListener('change', () => vscode.postMessage(earlier.value ? { command: 'load', name: earlier.value } : { command: 'newStudy' }));
	document.getElementById('newStudy').addEventListener('click', () => vscode.postMessage({ command: 'newStudy' }));
	for (const button of document.querySelectorAll('button[data-choose]')) {
		button.addEventListener('click', () => vscode.postMessage({ command: 'choose', what: button.dataset.choose, value: inputs[button.dataset.choose].value }));
	}
	document.getElementById('prepare').addEventListener('click', () => {
		const blocked = prepareBlocked();
		document.getElementById('prepareProblem').textContent = blocked;
		if (blocked) {
			return;
		}
		vscode.postMessage({ command: 'prepare', inputs: {
			name: nameInput.value.trim() || nameInput.placeholder,
			draft: inputs.draft.value.trim(),
			field: inputs.field.value.trim(),
			journal: inputs.journal.value.trim(),
			code: inputs.code.value.trim(),
		} });
	});
	document.getElementById('start').addEventListener('click', () => {
		const blocked = startBlocked();
		document.getElementById('startProblem').textContent = blocked;
		if (blocked) {
			return;
		}
		const n = Number(count.value);
		const referees = [];
		for (let i = 0; i < n; i++) {
			const cell = state.cells.find(c => cellKey(c) === chosen[i]);
			if (cell) {
				referees.push({ agent: cell.agent, model: cell.model, role: chosenRoles[i] });
			}
		}
		vscode.postMessage({ command: 'startReferees', referees });
	});
	document.getElementById('startEditor').addEventListener('click', () => {
		const blocked = editorBlocked();
		document.getElementById('editorProblem').textContent = blocked;
		const cell = state.cells.find(c => cellKey(c) === chosenEditor);
		if (!blocked && cell) {
			vscode.postMessage({ command: 'startEditor', cell: { agent: cell.agent, model: cell.model } });
		}
	});
	document.getElementById('startNext').addEventListener('click', () => {
		const blocked = nextBlocked();
		document.getElementById('nextProblem').textContent = blocked;
		if (!blocked) {
			document.getElementById('nextStatus').textContent = '';
			vscode.postMessage({ command: 'nextRound', draft: inputs.revised.value.trim(), response: inputs.response.value.trim() });
		}
	});
	document.body.addEventListener('click', event => {
		const target = event.target.closest('button[data-what]');
		if (!target) {
			return;
		}
		const key = target.dataset.agent;
		if (target.dataset.what === 'restart') {
			// It starts again on the role, agent and model chosen for it, else on those it had
			if (key === 'editor') {
				const cell = state.cells.find(c => cellKey(c) === chosenEditor) || state.study.editor;
				document.getElementById('editorProblem').textContent = '';
				vscode.postMessage({ command: 'restart', agent: key, cell: { agent: cell.agent, model: cell.model } });
			} else {
				const index = Number(key.replace('referee-', '')) - 1;
				const cell = state.cells.find(c => cellKey(c) === chosen[index]) || state.study.referees[index];
				document.getElementById('runsProblem').textContent = '';
				vscode.postMessage({ command: 'restart', agent: key, cell: { agent: cell.agent, model: cell.model }, role: chosenRoles[index] || state.study.referees[index].role });
			}
		} else {
			vscode.postMessage({ command: 'open', agent: key, what: target.dataset.what });
		}
	});

	count.value = String(DEFAULT_REFEREES);
	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			const wasStudy = !!(state && state.study);
			const before = state && state.study ? state.study.name : '';
			state = message;
			const study = state.study;
			// Another study: the menus show its referees, else, in a later round, those of the round before
			if (study && study.name !== before) {
				const shown = study.referees.length ? study.referees : study.previousReferees;
				if (shown.length) {
					chosen = shown.map(cellKey);
					chosenRoles = shown.map(r => r.role);
					count.value = String(shown.length);
				}
				chosenEditor = study.editor ? cellKey(study.editor) : '';
			}
			if (wasStudy && !study) {
				count.value = String(DEFAULT_REFEREES);
				for (const key of Object.keys(inputs)) {
					inputs[key].value = '';
				}
			}
			draw();
		} else if (message.command === 'problem') {
			const ids = { prepare: 'prepareProblem', start: 'startProblem', runs: 'runsProblem', editor: 'editorProblem', next: 'nextProblem' };
			document.getElementById(ids[message.step] || 'prepareProblem').textContent = message.text;
		} else if (message.command === 'chosen') {
			inputs[message.what].value = message.value;
			drawButtons();
		} else if (message.command === 'nextMade') {
			inputs.revised.value = '';
			inputs.response.value = '';
			document.getElementById('nextStatus').textContent = TEXT.nextMade.replace('{0}', message.name);
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({ id: REFEREE_REPORT_COMMAND_ID, title: localize2('refereeReport.action', "Referee Report..."), category: localize2('orchestration.category', "Orchestration"), f1: true });
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openRefereeReportPage(accessor);
	}
});
