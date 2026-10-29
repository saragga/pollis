/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RunOnceScheduler } from '../../../../base/common/async.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { hasKey } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { POLLIS_DOCUMENTS } from '../../../browser/actions/helpActions.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { customCopyOverlayUri, resolveCustomCopy } from '../../model/browser/common/customCopyFileSystem.js';
import { IPollisMenuNode, IPollisViewsService } from '../../pollisViews/common/pollisViews.js';
import { IToolboxPanelsService } from '../common/toolboxPanels.js';
import { PANEL_WIKIS } from './panelWikis.data.js';
import { toolboxDocumentPdf } from './toolboxDocumentsPage.js';
import { installedVignettes, isVignetteCompiled, IVignette, registryVignettes, vignettePdf, vignetteSources } from './vignettesPage.js';

// Ask Pollis: what it reads. The Julia extension asks for this list when the REPL starts, after the documents are
// compiled, and ask_index.jl cuts each file into the passages of PollisDocuments.duckdb. The package vignettes are
// those of Help > Documentation > Package Vignettes, of the packages on this computer and of the others in the
// registry: a vignette not compiled yet, or changed since in a package developed, comes with what to compile it from,
// and the Julia extension compiles it before the index is made. When the registry cannot be read, its vignettes are
// those it listed last.

export const ASK_POLLIS_SOURCES_COMMAND_ID = 'pollis.askPollis.sources';

/** A file Ask Pollis reads, as ask_index.jl takes it. */
interface IAskPollisSource {
	readonly kind: 'document' | 'wiki' | 'vignette';
	/** The document's title; for a wiki, its panel's, the wiki's own heading added by ask_index.jl; for a vignette, its package's, NAME.jl. */
	readonly title: string;
	/** The file's path; a PDF not compiled yet, or a wiki still "Not written yet.", is left out by ask_index.jl. */
	readonly file: string;
	// allow-any-unicode-next-line
	/** Where the menu bar opens a wiki's panel: `Model › Regression › Linear Models`, else empty. */
	readonly menu: string;
	/** The toolbox the file comes with, else empty. */
	readonly toolbox: string;
	/** For a vignette not compiled, or older than its sources: what the Julia extension compiles `file` from. */
	readonly compile?: { readonly source: string; readonly name: string };
}

/** The vignettes the registry listed when it was last read, for when it cannot be. */
const REGISTRY_VIGNETTES_KEY = 'pollis.askPollis.registryVignettes';

/** The place in the menu bar of each menu item, by its command: its menu and the submenus that lead to it. */
function menuPaths(tree: readonly IPollisMenuNode[]): Map<string, string> {
	const paths = new Map<string, string>();
	const walk = (nodes: readonly IPollisMenuNode[], path: readonly string[]) => {
		for (const node of nodes) {
			if (node.children) {
				walk(node.children, [...path, node.title]);
			} else if (!paths.has(node.id)) {
				// allow-any-unicode-next-line
				paths.set(node.id, path.join(' › '));
			}
		}
	};
	walk(tree, []);
	return paths;
}

/** The documents of Help > Documentation, the panel wikis (the user's copy when there is one), those of the toolboxes and the package vignettes. */
async function askPollisSources(accessor: ServicesAccessor): Promise<IAskPollisSource[]> {
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const extensionService = accessor.get(IExtensionService);
	const pollisViewsService = accessor.get(IPollisViewsService);
	const toolboxPanelsService = accessor.get(IToolboxPanelsService);
	const requestService = accessor.get(IRequestService);
	const configurationService = accessor.get(IConfigurationService);
	const storageService = accessor.get(IStorageService);

	const userHome = pathService.userHome({ preferLocal: true });
	const paths = menuPaths(pollisViewsService.getMenuTree());
	const sources: IAskPollisSource[] = Object.entries(POLLIS_DOCUMENTS).map(([file, title]) => ({
		kind: 'document',
		title,
		file: joinPath(userHome, '.pollis', 'documents', file).fsPath,
		menu: '',
		toolbox: '',
	}));

	// The wiki a panel opens, the user's copy when there is one
	const wiki = async (file: string, title: string, menu: string, toolbox: string) => {
		const resolved = await resolveCustomCopy(fileService, pathService, 'wiki', customCopyOverlayUri('wiki', file));
		if (resolved) {
			sources.push({ kind: 'wiki', title, file: resolved.fsPath, menu, toolbox });
		}
	};

	for (const panel of PANEL_WIKIS) {
		const command = panel.commands.find(command => paths.has(command));
		const menu = command !== undefined ? paths.get(command)! : '';
		for (const entry of panel.wikis) {
			if (hasKey(entry, { bundled: true }) && entry.bundled) {
				await wiki(entry.file, panel.title, menu, '');
			}
		}
	}

	for (const toolbox of toolboxPanelsService.getToolboxes()) {
		for (const document of toolbox.documents) {
			sources.push({ kind: 'document', title: document.title, file: toolboxDocumentPdf(userHome, toolbox, document).fsPath, menu: '', toolbox: toolbox.title });
		}
		// The wikis are in the extension's wiki/<folder>/, the folder named after its panel (or another name)
		const extension = await extensionService.getExtension(toolbox.extensionId);
		if (!extension) {
			continue;
		}
		const folders = await resolveChildren(fileService, joinPath(extension.extensionLocation, 'wiki'));
		for (const folder of folders.filter(folder => folder.isDirectory)) {
			const panel = toolbox.panels.find(panel => panel.id === folder.name);
			const menu = panel ? paths.get(panel.command) ?? '' : '';
			for (const file of (await resolveChildren(fileService, folder.resource)).filter(file => !file.isDirectory && file.name.endsWith('.md'))) {
				await wiki(`${folder.name}/${file.name}`, panel?.title ?? toolbox.title, menu, toolbox.title);
			}
		}
	}

	// The vignettes of the packages on this computer, then those of the registry for the other packages
	const installed = await installedVignettes(fileService, pathService);
	const read = await registryVignettes(requestService, configurationService);
	let registry = read.vignettes;
	if (read.error) {
		try {
			registry = JSON.parse(storageService.get(REGISTRY_VIGNETTES_KEY, StorageScope.APPLICATION, '[]'));
		} catch {
			registry = [];
		}
	} else {
		storageService.store(REGISTRY_VIGNETTES_KEY, JSON.stringify(registry), StorageScope.APPLICATION, StorageTarget.MACHINE);
	}
	const vignettes: IVignette[] = [...installed, ...registry.filter(entry => !installed.some(other => other.package === entry.package))];
	for (const entry of vignettes) {
		const title = `${entry.package}.jl`;
		if (entry.source) {
			const pdf = vignettePdf(userHome, entry);
			const compiled = await isVignetteCompiled(fileService, entry, pdf);
			sources.push({ kind: 'vignette', title, file: pdf.fsPath, menu: '', toolbox: '', ...(compiled ? {} : { compile: vignetteSources(entry) }) });
		} else if (entry.pdf.startsWith('file:')) {
			// Published with a PDF on this computer, and no sources; one only on GitHub is left out
			sources.push({ kind: 'vignette', title, file: URI.parse(entry.pdf).fsPath, menu: '', toolbox: '' });
		}
	}
	return sources;
}

/** The files and folders in `folder`, none when it does not exist. */
async function resolveChildren(fileService: IFileService, folder: URI): Promise<readonly { readonly name: string; readonly resource: URI; readonly isDirectory: boolean }[]> {
	try {
		return (await fileService.resolve(folder)).children ?? [];
	} catch {
		return [];
	}
}

CommandsRegistry.registerCommand(ASK_POLLIS_SOURCES_COMMAND_ID, accessor => askPollisSources(accessor));

/** Has the Julia extension index the documents again when a toolbox is installed, updated or removed, its wikis and documents with it. */
class AskPollisToolboxReindex extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.askPollisToolboxReindex';

	constructor(
		@IToolboxPanelsService toolboxPanelsService: IToolboxPanelsService,
		@ICommandService commandService: ICommandService,
	) {
		super();
		// A few seconds after the last change, since installing several toolboxes changes them several times
		const reindex = this._register(new RunOnceScheduler(() => commandService.executeCommand('language-julia.pollisIndexDocuments').catch(() => {
			// The Julia extension is disabled, or not activated yet: the REPL's start indexes them
		}), 3000));
		this._register(toolboxPanelsService.onDidChange(() => reindex.schedule()));
	}
}

registerWorkbenchContribution2(AskPollisToolboxReindex.ID, AskPollisToolboxReindex, WorkbenchPhase.Eventually);
