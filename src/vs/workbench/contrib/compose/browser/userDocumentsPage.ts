/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RunOnceScheduler } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { hash } from '../../../../base/common/hash.js';
import { DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { basename, dirname, extname, isEqualOrParent, joinPath, relativePath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IProgressService, ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { LIBRARY_PAGE_HELPERS, LIBRARY_PAGE_STYLE } from './libraryPage.js';
import { ONE_BLUE_BUTTON_CSS, ONE_BLUE_BUTTON_JS, voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';
import { findPollisWorkspace, NEW_POLLIS_WORKSPACE_COMMAND_ID, OPEN_POLLIS_WORKSPACE_COMMAND_ID, pollisWorkspaceFolder } from '../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { openPdfInViewer } from '../../../common/pdfViewer.js';
import { fileStem } from '../common/collateLatex.js';

// Help > Documentation > User Documents: the documents the user writes, in LaTeX, in the documents folder of their
// Pollis Workspace: a .tex file there, or in a folder of its own, that has a \documentclass. Pollis compiles a document
// with PollisTeX when it is opened and its sources have changed since it was last compiled, with the Julia extension's
// command language-julia.pollisCompileVignette (scripts/terminalserver/compile_vignette.jl), as it compiles the
// vignettes of packages and toolboxes: the .tex and .bib files, style files and pictures beside the main file, and its
// resources/ folder (and chapters/, for a book of Collate Documents). The PDF goes to ~/.pollis/documents/user/FOLDER/NAME.pdf, FOLDER a hash of the folder of its
// sources, and opens in Pollis's PDF Viewer. The page follows the folder, and lists the documents again when a file in
// it, or in its folders, changes.
//
// Edit the LaTeX Source, in the PDF Viewer's title bar, runs pollis.documents.editSource with the source the PDF names
// (scripts/terminalserver/document_source.jl): a document of the user's opens in the editor; any other, of Help >
// Documentation, a package or a toolbox, is copied into the documents folder, documents/NAME/, from the copy of its
// sources beside its PDF, and opens there, a document of the user's from then on.

const USER_DOCUMENTS_COMMAND_ID = 'pollis.documentation.user';

const COMPILE_VIGNETTE_COMMAND_ID = 'language-julia.pollisCompileVignette';

/** The command of Edit the LaTeX Source in the PDF Viewer (extensions/pdf-viewer): (source: string), as the PDF names it. */
const EDIT_SOURCE_COMMAND_ID = 'pollis.documents.editSource';

/** The files beside the main file that make a document, as compile_vignette.jl takes them (document_source.jl). */
const DOCUMENT_EXTENSIONS = ['.tex', '.bib', '.sty', '.cls', '.bst', '.png', '.jpg', '.jpeg', '.pdf'];

/** The setting that remembers the Pollis Workspace (pollisWorkspace.contribution.ts): a new one is followed. */
const WORKSPACE_LOCATION_SETTING = 'pollis.workspace.location';

/** A document of the user's: the folder of its sources and its main file. */
interface IUserDocument {
	readonly title: string;
	/** The folder of its sources: its main .tex, the other .tex and .bib files and a resources/ folder. */
	readonly folder: URI;
	/** The main file's name, without .tex. */
	readonly name: string;
	/** The main file. */
	readonly file: URI;
	/** The main file's path in the documents folder, which finds the document again. */
	readonly path: string;
	/** The last change to its sources, in milliseconds. */
	readonly changed: number;
}

/** A document as the page shows it. */
interface IListedDocument {
	readonly path: string;
	readonly title: string;
	/** When its sources last changed, as the page shows it. */
	readonly changed: string;
	/** Whether its PDF is older than its sources, or not made yet. */
	readonly stale: boolean;
}

type UserDocumentsMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'open'; readonly path: string }
	| { readonly command: 'edit'; readonly path: string }
	| { readonly command: 'new' }
	| { readonly command: 'folder' }
	| { readonly command: 'newWorkspace' }
	| { readonly command: 'openWorkspace' };

/** The title of a LaTeX document, from its \title, without its line breaks and commands, else undefined. */
function documentTitle(source: string): string | undefined {
	const title = /\\title\s*(?:\[[^\]]*\])?\s*\{(?<title>[^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/.exec(source)?.groups?.title;
	const plain = title?.replace(/\\\\/g, ' ').replace(/\\[a-zA-Z]+\*?/g, '').replace(/[{}~]/g, ' ').replace(/\s+/g, ' ').trim();
	return plain || undefined;
}

/** The last change, in milliseconds, to the files of a document's folder that compile_vignette.jl copies. */
async function lastChange(fileService: IFileService, folder: URI): Promise<number> {
	let latest = 0;
	const walk = async (resource: URI, inResources: boolean) => {
		const stat = await fileService.resolve(resource, { resolveMetadata: true }).catch(() => undefined);
		for (const child of stat?.children ?? []) {
			if (child.isDirectory) {
				if (inResources || child.name === 'resources' || child.name === 'chapters') {
					await walk(child.resource, true);
				}
			} else if (inResources || DOCUMENT_EXTENSIONS.includes(extname(child.resource).toLowerCase())) {
				latest = Math.max(latest, child.mtime);
			}
		}
	};
	await walk(folder, false);
	return latest;
}

/** The documents of the documents folder: its .tex files, and those of its folders, that have a \documentclass. */
async function listDocuments(fileService: IFileService, root: URI): Promise<IUserDocument[]> {
	const documents: IUserDocument[] = [];
	const readFolder = async (folder: URI, descend: boolean) => {
		const stat = await fileService.resolve(folder).catch(() => undefined);
		const children = stat?.children ?? [];
		const files = children.filter(child => !child.isDirectory && extname(child.resource) === '.tex');
		let changed: number | undefined;
		for (const file of files) {
			const source = await fileService.readFile(file.resource).then(content => content.value.toString(), () => '');
			if (!/^[^%\n]*\\documentclass/m.test(source)) {
				continue;
			}
			changed ??= await lastChange(fileService, folder);
			const name = basename(file.resource).slice(0, -'.tex'.length);
			documents.push({ title: documentTitle(source) ?? name, folder, name, file: file.resource, path: relativePath(root, file.resource) ?? name, changed });
		}
		if (descend) {
			for (const child of children.filter(child => child.isDirectory && child.name !== 'resources' && child.name !== 'chapters' && !child.name.startsWith('.'))) {
				await readFolder(child.resource, false);
			}
		}
	};
	await readFolder(root, true);
	return documents.sort((a, b) => a.title.localeCompare(b.title));
}

/** Where a document's PDF is compiled to: ~/.pollis/documents/user/FOLDER/NAME.pdf, FOLDER a hash of its folder. */
function userDocumentPdf(userHome: URI, document: IUserDocument): URI {
	return userDocumentPdfOf(userHome, document.folder, document.name);
}

/** Where the document NAME.tex of `folder` is compiled to, as User Documents compiles it (collateDocumentsPage.ts too). */
export function userDocumentPdfOf(userHome: URI, folder: URI, name: string): URI {
	return joinPath(userHome, '.pollis', 'documents', 'user', (hash(folder.toString()) >>> 0).toString(16), `${name}.pdf`);
}

/** A new document's sources: an article with its title, which XeTeX compiles as it is. */
function newDocumentSource(title: string): string {
	return [
		'\\documentclass[11pt]{article}',
		'\\usepackage[margin=2.5cm]{geometry}',
		'\\usepackage{graphicx}',
		'\\usepackage{hyperref}',
		'',
		`\\title{${title.replace(/[\\{}]/g, '')}}`,
		'\\author{}',
		'\\date{\\today}',
		'',
		'\\begin{document}',
		'\\maketitle',
		'',
		'\\section{Introduction}',
		'',
		'',
		'\\end{document}',
		'',
	].join('\n');
}

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the User Documents page, or shows it again when it is open. */
async function openUserDocumentsPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const commandService = accessor.get(ICommandService);
	const progressService = accessor.get(IProgressService);
	const notificationService = accessor.get(INotificationService);
	const contextService = accessor.get(IWorkspaceContextService);
	const configurationService = accessor.get(IConfigurationService);
	const editorService = accessor.get(IEditorService);
	const quickInputService = accessor.get(IQuickInputService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('userDocuments.title', "User Documents");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.userDocuments',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());
	openPage = webviewInput;

	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));

	const userHome = pathService.userHome({ preferLocal: true });
	let root: URI | undefined;
	let documents: IUserDocument[] = [];
	const watcher = disposables.add(new MutableDisposable<DisposableStore>());

	// The documents of the documents folder, with whether each needs compiling, sent again when a file there changes
	const sendDocuments = async () => {
		const workspace = await findPollisWorkspace(contextService, fileService, configurationService);
		const folder = workspace ? await pollisWorkspaceFolder(fileService, workspace, 'documents') : undefined;
		root = folder;
		documents = folder ? await listDocuments(fileService, folder) : [];
		// The folder and its folders, each watched on its own: a correlated watcher does not follow subfolders
		watcher.value = undefined;
		if (folder) {
			const store = new DisposableStore();
			const refresh = store.add(new RunOnceScheduler(() => sendDocuments(), 500));
			const watched = await fileService.resolve(folder).then(stat => [folder, ...(stat.children ?? []).filter(child => child.isDirectory && !child.name.startsWith('.')).map(child => child.resource)], () => [folder]);
			for (const resource of watched) {
				store.add(store.add(fileService.createWatcher(resource, { recursive: false, excludes: [] })).onDidChange(() => refresh.schedule()));
			}
			watcher.value = store;
		}
		const listed: IListedDocument[] = await Promise.all(documents.map(async document => {
			const compiled = await fileService.stat(userDocumentPdf(userHome, document)).then(stat => stat.mtime, () => 0);
			return {
				path: document.path,
				title: document.title,
				changed: new Date(document.changed).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
				stale: compiled < document.changed,
			};
		}));
		webviewInput.webview.postMessage({ command: 'documents', folder: folder?.fsPath, documents: listed });
	};
	disposables.add(contextService.onDidChangeWorkspaceFolders(() => sendDocuments()));
	disposables.add(configurationService.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration(WORKSPACE_LOCATION_SETTING)) {
			sendDocuments();
		}
	}));

	// A document's PDF: compiled from its sources when they changed since it was last compiled, then the copy compiled
	const openDocument = async (document: IUserDocument) => {
		const pdf = userDocumentPdf(userHome, document);
		const compiled = await fileService.stat(pdf).then(stat => stat.mtime, () => 0);
		if (compiled < await lastChange(fileService, document.folder)) {
			let answer: { pdf?: string; error?: string } | undefined;
			await progressService.withProgress({ location: ProgressLocation.Window, title: localize('userDocuments.compiling', "Compiling {0}", document.title) }, async () => {
				try {
					answer = await commandService.executeCommand(COMPILE_VIGNETTE_COMMAND_ID, {
						source: document.folder.fsPath,
						name: document.name,
						pdf: pdf.fsPath,
						own: true,
					});
				} catch {
					// The Julia extension is disabled, or not activated yet
				}
			});
			if (!answer?.pdf) {
				notificationService.error(answer?.error === 'noJulia'
					? localize('userDocuments.needsJulia', "Julia is needed to compile {0}, with PollisTeX.", document.title)
					: answer?.error && answer.error !== 'failed'
						? localize('userDocuments.compileError', "Could not compile {0}: {1}", document.title, answer.error)
						: localize('userDocuments.compileFailed', "Could not compile {0}: Julia stopped, or has not started yet.", document.title));
				return;
			}
			sendDocuments();
		}
		openPdfInViewer(commandService, pdf);
	};

	// A new document: its title asked, its file named after it, opened in the editor
	const newDocument = async () => {
		if (!root) {
			return;
		}
		const folder = root;
		const documentTitle = await quickInputService.input({
			title: localize('userDocuments.newTitle', "New Document"),
			prompt: localize('userDocuments.newPrompt', "The title of the document. Its file is named after it, in the documents folder of your Pollis Workspace."),
			validateInput: async value => value.trim() ? undefined : localize('userDocuments.newEmpty', "Type a title."),
		});
		if (!documentTitle?.trim()) {
			return;
		}
		const stem = fileStem(documentTitle, 'document');
		let file = joinPath(folder, `${stem}.tex`);
		for (let n = 2; await fileService.exists(file); n++) {
			file = joinPath(folder, `${stem}_${n}.tex`);
		}
		await fileService.writeFile(file, VSBuffer.fromString(newDocumentSource(documentTitle.trim())));
		await editorService.openEditor({ resource: file });
	};

	disposables.add(webviewInput.webview.onMessage((e: { message: UserDocumentsMessage }) => {
		const message = e.message;
		switch (message.command) {
			case 'ready':
				sendDocuments();
				break;
			case 'open': {
				const document = documents.find(document => document.path === message.path);
				if (document) {
					openDocument(document);
				}
				break;
			}
			case 'edit': {
				const document = documents.find(document => document.path === message.path);
				if (document) {
					editorService.openEditor({ resource: document.file });
				}
				break;
			}
			case 'new':
				newDocument();
				break;
			case 'folder':
				if (root) {
					commandService.executeCommand('revealFileInOS', root);
				}
				break;
			case 'newWorkspace':
				commandService.executeCommand(NEW_POLLIS_WORKSPACE_COMMAND_ID);
				break;
			case 'openWorkspace':
				commandService.executeCommand(OPEN_POLLIS_WORKSPACE_COMMAND_ID);
				break;
		}
	}));
}

/** The page: its texts come from here, the documents from the `documents` message. */
function pageHtml(): string {
	const text = {
		title: localize('userDocuments.title', "User Documents"),
		intro: localize('userDocuments.intro', "The documents you write yourself, in LaTeX, kept in the documents folder of your Pollis Workspace: a .tex file there, or in a folder of its own, with its .bib files and its images in resources/. Pollis compiles a document with PollisTeX when you open it and it has changed since it was last compiled. Click a title to read it. A document of Pollis, a guide or a vignette, becomes one of yours with Edit the LaTeX Source, in the title bar of the PDF Viewer."),
		folder: localize('userDocuments.folder', "Folder:"),
		newDocument: localize('userDocuments.newDocument', "New Document..."),
		openFolder: localize('userDocuments.openFolder', "Open the Folder"),
		noWorkspace: localize('userDocuments.noWorkspace', "Your documents are kept in a Pollis Workspace, and there is none yet. Create one, or open the one you have."),
		newWorkspace: localize('userDocuments.newWorkspace', "New Pollis Workspace..."),
		openWorkspace: localize('userDocuments.openWorkspace', "Open Pollis Workspace..."),
		search: localize('userDocuments.search', "Search documents"),
		empty: localize('userDocuments.empty', "There are no documents in the folder yet. New Document... starts one."),
		noMatch: localize('userDocuments.noMatch', "No document matches."),
		document: localize('userDocuments.document', "Document"),
		changed: localize('userDocuments.changed', "Last Changed"),
		edit: localize('userDocuments.edit', "Edit"),
		stale: localize('userDocuments.stale', "Compiles when opened"),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>${LIBRARY_PAGE_STYLE}
		${voiceButtonsCss}
	.hint { color: var(--vscode-descriptionForeground); margin: 0 0 8px 0; line-height: 1.4; max-width: 900px; }
	.where { margin: 0 0 8px 0; color: var(--vscode-descriptionForeground); }
	.bar { display: flex; gap: 8px; align-items: center; margin: 0 0 12px 0; }
	button.action { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; box-shadow: inset 0 0 0 1px var(--vscode-button-background); border-radius: 4px; padding: 4px 10px; font-size: 11px; cursor: pointer; opacity: 0.7; white-space: nowrap; }
	button.action:hover { opacity: 1; }
	${ONE_BLUE_BUTTON_CSS}
	.search { width: 100%; max-width: 420px; margin: 0 0 8px 0; padding: 4px 6px; font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
	.search:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }</style>
</head>
<body>
<div class="container">
	<div class="title-row">
		<h1>${text.title}</h1>
		${voiceButtonsHtml}
	</div>
	<p class="subtitle">${text.intro}</p>
	<div id="workspace" hidden>
		<p class="where">${text.folder} <code class="pollisPath" id="folder"></code></p>
		<div class="bar">
			<button class="action" id="new">${text.newDocument}</button>
			<button class="action" id="reveal">${text.openFolder}</button>
		</div>
		<input class="search" id="search" type="search" placeholder="${text.search}" aria-label="${text.search}">
	</div>
	<div id="noWorkspace" hidden>
		<p class="hint">${text.noWorkspace}</p>
		<div class="bar">
			<button class="action" id="newWorkspace">${text.newWorkspace}</button>
			<button class="action" id="openWorkspace">${text.openWorkspace}</button>
		</div>
	</div>
	<p class="hint" id="note" hidden></p>
	<table id="table" hidden>
		<thead><tr><th class="name">${text.document}</th><th>${text.changed}</th></tr></thead>
		<tbody id="documents"></tbody>
	</table>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	${ONE_BLUE_BUTTON_JS}
	const TEXT = ${JSON.stringify(text)};
	${LIBRARY_PAGE_HELPERS}

	let documents;
	let folder;
	const search = document.getElementById('search');

	for (const [id, command] of [['new', 'new'], ['reveal', 'folder'], ['newWorkspace', 'newWorkspace'], ['openWorkspace', 'openWorkspace']]) {
		document.getElementById(id).addEventListener('click', () => vscode.postMessage({ command }));
	}

	function matches(entry) {
		const query = search.value.trim().toLowerCase();
		return !query || [entry.title, entry.path].some(field => (field || '').toLowerCase().includes(query));
	}

	// (a) the document's title, its file and Edit, (b) when its sources last changed, and whether it compiles when opened
	function row(entry) {
		const row = element('tr');
		const name = cell(row, 'name');
		const title = element('div', 'title', entry.title);
		title.addEventListener('click', () => vscode.postMessage({ command: 'open', path: entry.path }));
		name.appendChild(title);
		name.appendChild(element('div', 'small file', entry.path));
		const links = element('div', 'links');
		links.appendChild(link(TEXT.edit, () => vscode.postMessage({ command: 'edit', path: entry.path })));
		name.appendChild(links);
		const changed = cell(row);
		changed.appendChild(element('div', '', entry.changed));
		if (entry.stale) {
			changed.appendChild(element('div', 'small', TEXT.stale));
		}
		return row;
	}

	function render() {
		if (!documents) {
			return;
		}
		document.getElementById('workspace').hidden = !folder;
		document.getElementById('noWorkspace').hidden = !!folder;
		document.getElementById('folder').textContent = folder || '';
		const shown = documents.filter(matches);
		const body = document.getElementById('documents');
		body.textContent = '';
		for (const entry of shown) {
			body.appendChild(row(entry));
		}
		document.getElementById('table').hidden = !shown.length;
		const note = document.getElementById('note');
		note.textContent = !folder || shown.length ? '' : documents.length ? TEXT.noMatch : TEXT.empty;
		note.hidden = !folder || !!shown.length;
	}

	search.addEventListener('input', render);
	window.addEventListener('message', event => {
		if (event.data.command === 'documents') {
			documents = event.data.documents;
			folder = event.data.folder;
			render();
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
			id: USER_DOCUMENTS_COMMAND_ID,
			title: {
				...localize2('userDocuments.action', "User Documents"),
				mnemonicTitle: localize({ key: 'miUserDocuments', comment: ['&& denotes a mnemonic'] }, "&&User Documents"),
			},
			category: Categories.Help,
			f1: true,
			// Help > Documentation, defined in workbench/browser/actions/helpActions.ts, after Package Vignettes, Toolbox Vignettes and Panel Wikis
			menu: { id: MenuId.for('MenubarHelpDocumentationMenu'), group: '1_packages', order: 4 },
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openUserDocumentsPage(accessor);
	}
});

/**
 * Edit the LaTeX Source of a PDF that names its source (`~/...` from the home folder, or a full path): a document in
 * the documents folder opens in the editor; any other is copied there first, into documents/NAME/, from the folder of
 * its main file, the copy of its sources beside its PDF, unless that copy is there already.
 */
async function editDocumentSource(accessor: ServicesAccessor, source: string): Promise<void> {
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const contextService = accessor.get(IWorkspaceContextService);
	const configurationService = accessor.get(IConfigurationService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const commandService = accessor.get(ICommandService);

	const userHome = pathService.userHome({ preferLocal: true });
	const file = source.startsWith('~/') ? joinPath(userHome, source.slice(2)) : URI.file(source);
	const workspace = await findPollisWorkspace(contextService, fileService, configurationService);
	if (!workspace) {
		notificationService.prompt(Severity.Info,
			localize('editSource.noWorkspace', "Your copy of a document goes in the documents folder of a Pollis Workspace: make one, or open yours, then choose Edit the LaTeX Source again."),
			[
				{ label: localize('editSource.newWorkspace', "New Pollis Workspace..."), run: () => commandService.executeCommand(NEW_POLLIS_WORKSPACE_COMMAND_ID) },
				{ label: localize('editSource.openWorkspace', "Open Pollis Workspace..."), run: () => commandService.executeCommand(OPEN_POLLIS_WORKSPACE_COMMAND_ID) },
			]);
		return;
	}
	if (!await fileService.exists(file)) {
		notificationService.warn(localize('editSource.missing', "The LaTeX source of this PDF is not on this computer: the PDF names {0}.", source));
		return;
	}
	const documents = await pollisWorkspaceFolder(fileService, workspace, 'documents');
	if (isEqualOrParent(file, documents)) {
		await editorService.openEditor({ resource: file });
		return;
	}
	const name = basename(file).replace(/\.tex$/i, '') || 'document';
	const target = joinPath(documents, name);
	const main = joinPath(target, basename(file));
	const openUserDocuments = { label: localize('editSource.userDocuments', "Open User Documents"), run: () => commandService.executeCommand(USER_DOCUMENTS_COMMAND_ID) };
	if (await fileService.exists(main)) {
		await editorService.openEditor({ resource: main });
		notificationService.prompt(Severity.Info,
			localize('editSource.copyThere', "Your copy of {0}, made before, is open. To start again from Pollis's, delete the folder {1} first.", basename(file), target.fsPath),
			[openUserDocuments]);
		return;
	}
	try {
		const folder = await fileService.resolve(dirname(file));
		for (const child of folder.children ?? []) {
			await fileService.copy(child.resource, joinPath(target, child.name), false);
		}
	} catch (error) {
		notificationService.error(localize('editSource.copyFailed', "Could not copy the LaTeX source of {0} into {1}: {2}", basename(file), target.fsPath, String(error)));
		return;
	}
	await editorService.openEditor({ resource: main });
	notificationService.prompt(Severity.Info,
		localize('editSource.copied', "A copy of {0} is in the documents folder of your Pollis Workspace, in {1}: edit it there, and User Documents compiles it.", basename(file), name),
		[openUserDocuments]);
}

CommandsRegistry.registerCommand(EDIT_SOURCE_COMMAND_ID, (accessor, source: unknown) => typeof source === 'string' ? editDocumentSource(accessor, source) : undefined);
