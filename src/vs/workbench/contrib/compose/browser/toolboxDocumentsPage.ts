/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { BrowserViewCommandId } from '../../../../platform/browserView/common/browserView.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProgressService, ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { LIBRARY_PAGE_HELPERS, LIBRARY_PAGE_STYLE } from './libraryPage.js';
import { voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';
import { IToolboxDocumentInfo, IToolboxInfo, IToolboxPanelsService } from '../common/toolboxPanels.js';

// Help > Documentation > Toolboxes: the documentation the installed toolboxes bring, listed in the `documents` of their
// pollisToolboxes contribution (toolboxExtensions.ts). A toolbox ships a document's LaTeX sources, not a PDF: Pollis
// compiles the document with PollisTeX the first time it is opened, as it does a package vignette (the Julia
// extension's command language-julia.pollisCompileVignette, scripts/terminalserver/compile_vignette.jl), into
// ~/.pollis/documents/toolboxes/EXTENSION-VERSION/NAME.pdf, and opens it in the integrated browser. A new version of the
// toolbox compiles its documents again.

export const TOOLBOX_DOCUMENTS_COMMAND_ID = 'pollis.documentation.toolboxes';

const COMPILE_VIGNETTE_COMMAND_ID = 'language-julia.pollisCompileVignette';

/** A document as the page shows it, with its toolbox. */
interface IListedDocument {
	/** The extension id, the toolbox id and the document's name, which find it again. */
	readonly key: string;
	readonly title: string;
	readonly description: string;
	readonly toolbox: string;
	readonly extensionId: string;
	readonly version: string;
}

type ToolboxDocumentsMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'open'; readonly key: string };

function documentKey(toolbox: IToolboxInfo, document: IToolboxDocumentInfo): string {
	return `${toolbox.extensionId}/${toolbox.id}/${document.name}`;
}

/** Where a toolbox document's PDF is compiled to, under the user's home: ~/.pollis/documents/toolboxes/EXTENSION-VERSION/NAME.pdf. */
export function toolboxDocumentPdf(userHome: URI, toolbox: IToolboxInfo, document: IToolboxDocumentInfo): URI {
	return joinPath(userHome, '.pollis', 'documents', 'toolboxes', `${toolbox.extensionId}-${toolbox.version}`, `${document.name}.pdf`);
}

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the Toolbox Documentation page, or shows it again when it is open. */
async function openToolboxDocumentsPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const toolboxPanelsService = accessor.get(IToolboxPanelsService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const commandService = accessor.get(ICommandService);
	const progressService = accessor.get(IProgressService);
	const notificationService = accessor.get(INotificationService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('toolboxDocuments.title', "Toolbox Documentation");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.toolboxDocuments',
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

	// The documents of the installed toolboxes, sent again when a toolbox is installed or removed
	const sendDocuments = () => {
		const documents: IListedDocument[] = toolboxPanelsService.getToolboxes().flatMap(toolbox => toolbox.documents.map(document => ({
			key: documentKey(toolbox, document),
			title: document.title,
			description: document.description ?? '',
			toolbox: toolbox.title,
			extensionId: toolbox.extensionId,
			version: toolbox.version,
		}))).sort((a, b) => a.toolbox.localeCompare(b.toolbox) || a.title.localeCompare(b.title));
		webviewInput.webview.postMessage({ command: 'documents', documents });
	};
	disposables.add(toolboxPanelsService.onDidChange(() => sendDocuments()));

	// A document's PDF: compiled from its sources the first time, then the copy compiled
	const openDocument = async (toolbox: IToolboxInfo, document: IToolboxDocumentInfo) => {
		const pdf = toolboxDocumentPdf(pathService.userHome({ preferLocal: true }), toolbox, document);
		if (!await fileService.exists(pdf)) {
			let answer: { pdf?: string; error?: string } | undefined;
			await progressService.withProgress({ location: ProgressLocation.Window, title: localize('toolboxDocuments.compiling', "Compiling {0}", document.title) }, async () => {
				try {
					answer = await commandService.executeCommand(COMPILE_VIGNETTE_COMMAND_ID, {
						source: document.folder.fsPath,
						name: document.name,
						pdf: pdf.fsPath,
					});
				} catch {
					// The Julia extension is disabled, or not activated yet
				}
			});
			if (!answer?.pdf) {
				notificationService.error(answer?.error === 'noJulia'
					? localize('toolboxDocuments.needsJulia', "Julia is needed to compile {0}, with PollisTeX.", document.title)
					: answer?.error && answer.error !== 'failed'
						? localize('toolboxDocuments.compileError', "Could not compile {0}: {1}", document.title, answer.error)
						: localize('toolboxDocuments.compileFailed', "Could not compile {0}: Julia stopped, or has not started yet.", document.title));
				return;
			}
		}
		commandService.executeCommand(BrowserViewCommandId.Open, pdf.toString(true));
	};

	disposables.add(webviewInput.webview.onMessage((e: { message: ToolboxDocumentsMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			sendDocuments();
		} else if (message.command === 'open') {
			for (const toolbox of toolboxPanelsService.getToolboxes()) {
				const document = toolbox.documents.find(document => documentKey(toolbox, document) === message.key);
				if (document) {
					openDocument(toolbox, document);
					return;
				}
			}
		}
	}));
}

/** The page: its texts come from here, the documents from the `documents` message. */
function pageHtml(): string {
	const text = {
		title: localize('toolboxDocuments.title', "Toolbox Documentation"),
		intro: localize('toolboxDocuments.intro', "The documentation of the toolboxes installed in Pollis. Pollis compiles a document from its LaTeX sources, with PollisTeX, the first time it is opened. Click a title to read it."),
		search: localize('toolboxDocuments.search', "Search documents"),
		empty: localize('toolboxDocuments.empty', "No installed toolbox brings documentation yet."),
		noMatch: localize('toolboxDocuments.noMatch', "No document matches."),
		document: localize('toolboxDocuments.document', "Document"),
		toolbox: localize('toolboxDocuments.toolbox', "Toolbox"),
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
	<input class="search" id="search" type="search" placeholder="${text.search}" aria-label="${text.search}">
	<p class="hint" id="note" hidden></p>
	<table id="table" hidden>
		<thead><tr><th class="name">${text.document}</th><th>${text.toolbox}</th></tr></thead>
		<tbody id="documents"></tbody>
	</table>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	const TEXT = ${JSON.stringify(text)};
	${LIBRARY_PAGE_HELPERS}

	let documents;
	const search = document.getElementById('search');

	function matches(entry) {
		const query = search.value.trim().toLowerCase();
		return !query || [entry.title, entry.description, entry.toolbox, entry.extensionId].some(field => (field || '').toLowerCase().includes(query));
	}

	// (a) the document and its description, (b) its toolbox, the extension and its version
	function row(entry) {
		const row = element('tr');
		const name = cell(row, 'name');
		const title = element('div', 'title', entry.title);
		title.addEventListener('click', () => vscode.postMessage({ command: 'open', key: entry.key }));
		name.appendChild(title);
		if (entry.description) {
			name.appendChild(element('p', 'description clamped', entry.description));
		}
		const toolbox = cell(row);
		toolbox.appendChild(element('div', '', entry.toolbox));
		toolbox.appendChild(element('div', 'small file', entry.extensionId + ' ' + entry.version));
		return row;
	}

	function render() {
		if (!documents) {
			return;
		}
		const shown = documents.filter(matches);
		const body = document.getElementById('documents');
		body.textContent = '';
		for (const entry of shown) {
			body.appendChild(row(entry));
		}
		document.getElementById('table').hidden = !shown.length;
		const note = document.getElementById('note');
		note.textContent = shown.length ? '' : documents.length ? TEXT.noMatch : TEXT.empty;
		note.hidden = !!shown.length;
	}

	search.addEventListener('input', render);
	window.addEventListener('message', event => {
		if (event.data.command === 'documents') {
			documents = event.data.documents;
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
			id: TOOLBOX_DOCUMENTS_COMMAND_ID,
			title: {
				...localize2('toolboxDocuments.action', "Toolbox Documentation"),
				mnemonicTitle: localize({ key: 'miToolboxDocuments', comment: ['&& denotes a mnemonic'] }, "&&Toolboxes"),
			},
			category: Categories.Help,
			f1: true,
			// Help > Documentation, defined in workbench/browser/actions/helpActions.ts, after Packages
			menu: { id: MenuId.for('MenubarHelpDocumentationMenu'), group: '1_packages', order: 2 },
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openToolboxDocumentsPage(accessor);
	}
});
