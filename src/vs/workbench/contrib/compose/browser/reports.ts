/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RunOnceScheduler } from '../../../../base/common/async.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { FileAccess } from '../../../../base/common/network.js';
import { basename, basenameOrAuthority, dirname, extname, isEqual, joinPath } from '../../../../base/common/resources.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { BrowserViewCommandId } from '../../../../platform/browserView/common/browserView.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { FileChangeType, IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { registerThemingParticipant } from '../../../../platform/theme/common/themeService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ResourceContextKey } from '../../../common/contextkeys.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { debugIconStartForeground } from '../../debug/browser/debugColors.js';
import { CUSTOM_COPY_KINDS, resolveCustomCopy } from '../../model/browser/common/customCopyFileSystem.js';
import { sendToJuliaRepl } from '../../model/browser/handlers/model.handler.js';
import { findPollisWorkspace, NEW_POLLIS_WORKSPACE_COMMAND_ID } from '../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { skillFile, startAgent } from './pollisAgents.js';

// Compose > Reports: a notebook (a workflow, a notebook tutorial or the user's own) as a LaTeX report or
// as beamer slides, in reports/NAME of the open Pollis Workspace, written by Pollis in its Julia REPL with
// no coding agent (media/reports/reports.jl). It runs the notebook, saves each cell's printed output and
// figure, and writes a draft .tex of the markdown cells with them; when the workflow has a LaTeX template
// (a latex/ folder beside the notebook, or beside the shipped workflow), it copies the template instead
// and runs its make.jl for the figures and tables. A .tex already in the folder is kept, so exporting
// again refreshes the numbers and keeps the user's edits. PollisTeX.jl (Tectonic) compiles it; the .tex
// opens in a tab and the PDF beside it in the integrated browser. Each .tex tab has a Compile LaTeX
// button, which saves and compiles it again in the Julia REPL. Polish with Agent... hands the .tex to a
// coding agent (its tier in Model Tasks and Routing, Light by default) that follows the polish-report
// skill of the Pollis Agents plugin with notebook.md, the notebook as short Markdown, so it neither reads
// the notebook's JSON nor runs it.

export const EXPORT_NOTEBOOK_LATEX_COMMAND_ID = 'pollis.reports.notebookLatex';
export const MAKE_NOTEBOOK_SLIDES_COMMAND_ID = 'pollis.reports.notebookSlides';
export const COMPILE_LATEX_COMMAND_ID = 'pollis.reports.compileLatex';
export const POLISH_REPORT_COMMAND_ID = 'pollis.reports.polish';
export const REPORTS_AGENT_COMMAND_SETTING = 'pollis.reports.agentCommand';

const SCRIPT = 'vs/workbench/contrib/compose/browser/media/reports/reports.jl';
// The folder of pollis.bib, every reference in Pollis, which Tectonic searches for \bibliography{pollis}
const LIBRARY = 'vs/workbench/contrib/model/browser/media/references';
const WORKFLOWS = 'vs/workbench/contrib/compose/browser/media/workflows';
const REPORTS_FOLDER = 'reports';
/** How long an export waits for the PDF before it stops watching (a first run may install packages). */
const EXPORT_TIMEOUT = 30 * 60 * 1000;
/** How long Compile LaTeX waits for the PDF to change before it stops watching. */
const COMPILE_TIMEOUT = 15 * 60 * 1000;
/** The Compile LaTeX button: a play triangle, green like Run and Debug's start. */
const compileLatexIcon = registerIcon('reports-compile-latex', Codicon.play, localize('reports.compileLatexIcon', "Icon for the Compile LaTeX action."));

registerThemingParticipant((theme, collector) => {
	const color = theme.getColor(debugIconStartForeground);
	if (color) {
		collector.addRule(`.monaco-workbench ${ThemeIcon.asCSSSelector(compileLatexIcon)} { color: ${color}; }`);
	}
});

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'pollisReports',
	title: localize('reports.configurationTitle', "Pollis Reports"),
	type: 'object',
	properties: {
		[REPORTS_AGENT_COMMAND_SETTING]: {
			type: 'string',
			default: '',
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('reports.agentCommand', "The command that started the coding agent of **Compose > Reports > Polish with Agent...**. Pollis moves it to the Light tier of `#pollis.agents.tierCells#`."),
			markdownDeprecationMessage: localize('reports.agentCommandDeprecated', "Polish with Agent now runs on a tier of **Compose > Orchestration > Model Tasks and Routing**, Light by default."),
		},
	},
});

/** A path as a Julia raw string, which keeps Windows backslashes; only a double quote needs escaping. */
function juliaPath(resource: URI): string {
	return `raw"${resource.fsPath.replace(/"/g, '\\"')}"`;
}

/** The two kinds of document: a LaTeX article or beamer slides. */
interface IReportKind {
	/** The document's file name, without `.tex`. */
	readonly file: string;
	readonly title: string;
	readonly kind: string;
}

const REPORT: IReportKind = { file: 'report', title: localize('reports.reportTitle', "Report"), kind: localize('reports.reportKind', "a report") };
const SLIDES: IReportKind = { file: 'slides', title: localize('reports.slidesTitle', "Slides"), kind: localize('reports.slidesKind', "slides") };

/** The first file of an editor with this extension: the active one, else a visible one (a page of Pollis may be active). */
function editorFile(editorService: IEditorService, extension: string): URI | undefined {
	const active = editorService.activeEditor?.resource;
	if (active && extname(active) === extension) {
		return active;
	}
	return editorService.visibleEditors.map(editor => editor.resource).find(resource => resource && extname(resource) === extension);
}

/** The notebook in an editor, else one the user picks, starting in ~/.pollis/workflows. */
async function pickNotebook(editorService: IEditorService, fileDialogService: IFileDialogService, fileService: IFileService, pathService: IPathService): Promise<URI | undefined> {
	const open = editorFile(editorService, '.ipynb');
	if (open) {
		return open;
	}
	const workflows = joinPath(await pathService.userHome({ preferLocal: true }), '.pollis', 'workflows');
	const picked = await fileDialogService.showOpenDialog({
		title: localize('reports.pickNotebook', "Choose a Notebook"),
		canSelectFiles: true,
		canSelectFolders: false,
		canSelectMany: false,
		filters: [{ name: localize('reports.notebooks', "Notebooks"), extensions: ['ipynb'] }],
		defaultUri: await fileService.exists(workflows) ? workflows : undefined,
	});
	return picked?.[0];
}

/** Opens the PDF in the integrated browser beside the editor, or reloads it there. */
function showPdf(commandService: ICommandService, pdf: URI): Promise<unknown> {
	const url = pdf.toString(true);
	return commandService.executeCommand(BrowserViewCommandId.Open, { url, reuseUrlFilter: url, openToSide: true });
}

/** Calls `show` each time the PDF is written, until the returned store is disposed. */
function watchPdf(fileService: IFileService, pdf: URI, show: () => Promise<unknown>): DisposableStore {
	const disposables = new DisposableStore();
	const reload = disposables.add(new RunOnceScheduler(show, 500));
	const watcher = disposables.add(fileService.createWatcher(dirname(pdf), { recursive: false, excludes: [] }));
	disposables.add(watcher.onDidChange(e => {
		if (e.contains(pdf, FileChangeType.ADDED, FileChangeType.UPDATED)) {
			reload.schedule();
		}
	}));
	return disposables;
}

/**
 * The LaTeX template of a notebook's document: a latex/ folder beside the notebook holding the document's
 * .tex, else, for the user's copy of a shipped workflow (~/.pollis/workflows/NAME), the shipped one's.
 */
async function findTemplate(fileService: IFileService, pathService: IPathService, notebook: URI, kind: IReportKind): Promise<URI | undefined> {
	const own = joinPath(dirname(notebook), 'latex');
	if (await fileService.exists(joinPath(own, `${kind.file}.tex`))) {
		return own;
	}
	const workflows = joinPath(await pathService.userHome({ preferLocal: true }), '.pollis', 'workflows');
	if (isEqual(dirname(dirname(notebook)), workflows)) {
		const shipped = joinPath(FileAccess.asFileUri(WORKFLOWS), basename(dirname(notebook)), 'latex');
		if (await fileService.exists(joinPath(shipped, `${kind.file}.tex`))) {
			return shipped;
		}
	}
	return undefined;
}

/** Writes a notebook's report or slides in the Julia REPL, then opens the .tex and the PDF. */
async function makeReport(accessor: ServicesAccessor, kind: IReportKind): Promise<void> {
	const editorService = accessor.get(IEditorService);
	const fileDialogService = accessor.get(IFileDialogService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const contextService = accessor.get(IWorkspaceContextService);
	const notificationService = accessor.get(INotificationService);
	const commandService = accessor.get(ICommandService);

	const workspace = await findPollisWorkspace(contextService, fileService);
	if (!workspace) {
		notificationService.prompt(Severity.Info, localize('reports.noWorkspace', "Reports are written in the reports folder of a Pollis Workspace: open one or make a new one first."), [
			{ label: localize('reports.newWorkspace', "New Pollis Workspace..."), run: () => commandService.executeCommand(NEW_POLLIS_WORKSPACE_COMMAND_ID) },
		]);
		return;
	}
	const picked = await pickNotebook(editorService, fileDialogService, fileService, pathService);
	// A Notebook Tutorial opens under its own scheme: the Julia REPL runs the file behind it, the user's copy or the original
	const notebook = picked?.scheme === CUSTOM_COPY_KINDS.notebook.scheme ? await resolveCustomCopy(fileService, pathService, 'notebook', picked) : picked;
	if (!notebook) {
		return;
	}
	const name = basenameOrAuthority(notebook).replace(/\.ipynb$/, '');
	const folder = joinPath(workspace, REPORTS_FOLDER, name);
	await fileService.createFolder(folder);
	const tex = joinPath(folder, `${kind.file}.tex`);
	const pdf = joinPath(folder, `${kind.file}.pdf`);
	const template = await findTemplate(fileService, pathService, notebook, kind);

	// The first PDF opens the .tex beside the notebook and the PDF beside it; a failed run shows its errors in the REPL
	const disposables = watchPdf(fileService, pdf, async () => {
		disposables.dispose();
		await editorService.openEditor({ resource: tex, options: { pinned: true, preserveFocus: true } });
		await showPdf(commandService, pdf);
	});
	disposables.add(new RunOnceScheduler(() => disposables.dispose(), EXPORT_TIMEOUT)).schedule();

	const make = `PollisReports.make(${juliaPath(notebook)}, ${juliaPath(folder)}, :${kind.file}${template ? `; template = ${juliaPath(template)}` : ''}, library = ${juliaPath(FileAccess.asFileUri(LIBRARY))})`;
	const code = `Pollis.packages("PollisTeX", "JSON"); isdefined(Main, :PollisReports) || include(${juliaPath(FileAccess.asFileUri(SCRIPT))}); display(${make})`;
	if (!await sendToJuliaRepl(code, commandService)) {
		disposables.dispose();
	}
}

/** Starts the coding agent on the .tex in the active editor, and reloads the PDF each time it compiles it. */
async function polishReport(accessor: ServicesAccessor, resource?: URI): Promise<void> {
	const editorService = accessor.get(IEditorService);
	const textFileService = accessor.get(ITextFileService);
	const fileService = accessor.get(IFileService);
	const notificationService = accessor.get(INotificationService);
	const commandService = accessor.get(ICommandService);
	const instantiationService = accessor.get(IInstantiationService);

	const tex = resource ?? editorFile(editorService, '.tex');
	if (!tex || extname(tex) !== '.tex') {
		notificationService.info(localize('reports.openTex', "Open the .tex file of a report or of slides (Export Notebook as LaTeX... or Make Slides from a Notebook... write one), then choose Polish with Agent... again."));
		return;
	}
	await textFileService.save(tex);
	const folder = dirname(tex);
	const skill = await instantiationService.invokeFunction(skillFile, 'polish-report');
	if (!skill) {
		return;
	}
	const prompt = localize('reports.polishPrompt', "Read the skill {0} and follow its instructions to polish {1}, in this folder. The folder of pollis.bib, the Pollis library of references, is {2}.", skill.fsPath, basename(tex), FileAccess.asFileUri(LIBRARY).fsPath);
	const title = localize('reports.polishTitle', "Polish {0}", basename(tex));
	const terminal = await instantiationService.invokeFunction(startAgent, title, prompt, folder, 'polish');
	if (!terminal) {
		return;
	}
	const pdf = joinPath(folder, basenameOrAuthority(tex).replace(/\.tex$/, '.pdf'));
	const disposables = watchPdf(fileService, pdf, () => showPdf(commandService, pdf));
	disposables.add(terminal.onDisposed(() => disposables.dispose()));
}

/** Saves a .tex file, compiles it with PollisTeX in the Julia REPL and shows the PDF when it changes. */
async function compileLatex(accessor: ServicesAccessor, resource?: URI): Promise<void> {
	const editorService = accessor.get(IEditorService);
	const textFileService = accessor.get(ITextFileService);
	const fileService = accessor.get(IFileService);
	const commandService = accessor.get(ICommandService);

	const tex = resource ?? editorService.activeEditor?.resource;
	if (!tex || extname(tex) !== '.tex') {
		return;
	}
	await textFileService.save(tex);
	const pdf = joinPath(dirname(tex), basenameOrAuthority(tex).replace(/\.tex$/, '.pdf'));

	// Watches until the PDF changes or the time runs out (a failed compile leaves it as it was)
	const disposables = watchPdf(fileService, pdf, () => {
		disposables.dispose();
		return showPdf(commandService, pdf);
	});
	disposables.add(new RunOnceScheduler(() => disposables.dispose(), COMPILE_TIMEOUT)).schedule();

	// A PollisTeX older than its searchpath keyword compiles without pollis.bib
	const library = `hasmethod(PollisTeX.compile, Tuple{String}, (:searchpath,)) ? (; searchpath = [${juliaPath(FileAccess.asFileUri(LIBRARY))}]) : (;)`;
	if (!await sendToJuliaRepl(`Pollis.packages("PollisTeX"); import PollisTeX; display(PollisTeX.compile(${juliaPath(tex)}; (${library})...))`, commandService)) {
		disposables.dispose();
	}
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: EXPORT_NOTEBOOK_LATEX_COMMAND_ID,
			title: localize2('reports.notebookLatex', "Export Notebook as LaTeX..."),
			category: localize2('reports.category', "Reports"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return makeReport(accessor, REPORT);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: MAKE_NOTEBOOK_SLIDES_COMMAND_ID,
			title: localize2('reports.notebookSlides', "Make Slides from a Notebook..."),
			category: localize2('reports.category', "Reports"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return makeReport(accessor, SLIDES);
	}
});

// The notebook's own toolbar: an Export button with the two exports, where a notebook's user looks for them
const NotebookExportMenu = new MenuId('pollisNotebookExport');
MenuRegistry.appendMenuItem(MenuId.NotebookToolbar, {
	submenu: NotebookExportMenu,
	title: localize('reports.export', "Export"),
	icon: Codicon.export,
	group: 'navigation/export',
	order: 0,
	when: ContextKeyExpr.equals('notebookType', 'jupyter-notebook'),
});
MenuRegistry.appendMenuItem(NotebookExportMenu, { command: { id: EXPORT_NOTEBOOK_LATEX_COMMAND_ID, title: localize('reports.exportReport', "LaTeX Report...") }, order: 1 });
MenuRegistry.appendMenuItem(NotebookExportMenu, { command: { id: MAKE_NOTEBOOK_SLIDES_COMMAND_ID, title: localize('reports.exportSlides', "Beamer Slides...") }, order: 2 });

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: POLISH_REPORT_COMMAND_ID,
			title: localize2('reports.polish', "Polish with Agent..."),
			category: localize2('reports.category', "Reports"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor, resource?: URI): Promise<void> {
		return polishReport(accessor, URI.isUri(resource) ? resource : undefined);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: COMPILE_LATEX_COMMAND_ID,
			title: localize2('reports.compileLatex', "Compile LaTeX"),
			category: localize2('reports.category', "Reports"),
			icon: compileLatexIcon,
			f1: true,
			precondition: ContextKeyExpr.equals(ResourceContextKey.Extension.key, '.tex'),
			menu: {
				id: MenuId.EditorTitle,
				group: 'navigation',
				when: ContextKeyExpr.equals(ResourceContextKey.Extension.key, '.tex'),
			},
		});
	}
	run(accessor: ServicesAccessor, resource?: URI): Promise<void> {
		return compileLatex(accessor, URI.isUri(resource) ? resource : undefined);
	}
});
