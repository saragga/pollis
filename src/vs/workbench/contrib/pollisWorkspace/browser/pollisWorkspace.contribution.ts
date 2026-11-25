/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../base/common/buffer.js';
import { mnemonicButtonLabel } from '../../../../base/common/labels.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../base/common/network.js';
import { isAbsolute } from '../../../../base/common/path.js';
import { basename, extUriBiasedIgnorePathCase, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ConfigurationTarget, IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IPathService } from '../../../services/path/common/pathService.js';

// The Pollis Workspace: an ordinary folder, marked by pollis.toml, for the user's own work and the copies they
// choose to save, outside Pollis. Pollis itself keeps preferences and machine state (~/.pollis and its user
// data folder). A workspace has a folder for each kind of file, which Pollis looks in first: pollis.toml names
// them, so that a folder renamed there is still found (internal-reports/pollis-workspace-spec.md). Pollis remembers
// where the workspace is in the setting pollis.workspace.location, so that it is found in a window where it is not open.

export const NEW_POLLIS_WORKSPACE_COMMAND_ID = 'pollis.workspace.new';
export const OPEN_POLLIS_WORKSPACE_COMMAND_ID = 'pollis.workspace.open';

const MARKER_FILE = 'pollis.toml';

/** The setting that remembers the folder of the user's Pollis Workspace, the last one created or opened. */
const LOCATION_SETTING = 'pollis.workspace.location';

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'pollisWorkspace',
	title: localize('pollisWorkspace.configurationTitle', "Pollis Workspace"),
	type: 'object',
	properties: {
		[LOCATION_SETTING]: {
			type: 'string',
			default: '',
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('pollisWorkspace.locationSetting', "The full path of the folder of your Pollis Workspace, where Pollis saves your work and the copies you choose to save, also when the workspace is not open in the window. Pollis sets it when you create or open a Pollis Workspace, or open a folder that is one; a Pollis Workspace open in the window is used before it."),
		},
	},
});

/** The kinds of file a Pollis Workspace has a folder for. */
export type PollisWorkspaceFolder = 'data' | 'knowledge_base' | 'reports' | 'methods' | 'workflows' | 'panels' | 'toolboxes' | 'programs' | 'orchestration' | 'games' | 'works' | 'changes';

/** The folder of each kind, as a new workspace names it, what its README says it holds, and its subfolders. */
const FOLDERS: Readonly<Record<PollisWorkspaceFolder, { readonly name: string; readonly readme: string; readonly subfolders?: readonly string[] }>> = {
	data: { name: 'data', readme: 'Datasets of your own, and the copies of articles and data saved with Save a Copy... (Compose > Article Replication) and the WRDS page.' },
	knowledge_base: { name: 'knowledge_base', readme: 'Your own books, articles and reports, as PDF, Markdown or text files, which the Knowledge Base (Compose > Knowledge for AI Models) lists with its own texts and indexes. A text is of the type of its folder: books/, articles/ or reports/. Your references, the works you save or add in Pollis with your corrections, citation counts and abstracts, are in references/.', subfolders: ['books', 'articles', 'reports'] },
	reports: { name: 'reports', readme: 'The reports and slides that Pollis writes from notebooks, one folder each.' },
	methods: { name: 'methods', readme: 'Your methods, one folder each.' },
	workflows: { name: 'workflows', readme: 'Your workflows.' },
	panels: { name: 'panels', readme: 'Your panels, which Compose > New Panels writes with your coding agent, each its TOML with its wiki and notebook folders.' },
	toolboxes: { name: 'toolboxes', readme: 'The toolboxes you make to share your panels, for a course say, which Compose > Package a Toolbox... builds with your coding agent, one folder each: its spec, toolbox.toml, which menu entries it holds and in what order, the sources of its vignette, its README, and the .vsix files built from it, in dist/. The toolboxes you install stay in Pollis.' },
	programs: { name: 'programs', readme: 'The programs and libraries compiled from your Julia code on the pages of Compose > Compilation Lab: executables in executables/ and shared libraries in shared_libraries/, one folder for each tool that compiled them, Rust crates in rust/, DuckDB extensions in duckdb_extensions/, and WebAssembly modules in webassembly/.', subfolders: ['executables', 'shared_libraries', 'rust', 'duckdb_extensions', 'webassembly'] },
	orchestration: { name: 'orchestration', readme: 'The studies of Compose > Orchestration, where coding agents work on research together, one folder each: those of Many Analysts in many-analysts/, each with its question, its data, a folder for each analyst and the results.', subfolders: ['many-analysts'] },
	games: { name: 'games', readme: 'The games of Compose > Simulation Games that you ran as facilitator, by case and then one folder each: game.toml with its teams and seed, and a folder for each round with the teams\' decisions, the state of the model and the results; and, in cases, the cases you write with Compose > Simulation Games > Create a Simulation Game...' },
	works: { name: 'works', readme: 'The scanned works you read in Explore > OCR Files and Snippets and add to the workspace, one folder each: its record, work.toml, with its contents, its own words and its glossary, and its snippets in snippets/, each with its corrections and translations. The scans themselves stay in ~/.pollis/works.' },
	changes: { name: 'changes', readme: 'Your changes to the panels, workflows, wikis and notebooks that come with Pollis and its toolboxes, one small file each.' },
};

/** The folders that pollis.toml names in its [folders] table, by kind: each a path inside the workspace. */
function namedFolders(toml: string): Partial<Record<PollisWorkspaceFolder, string>> {
	const named: Partial<Record<PollisWorkspaceFolder, string>> = {};
	let inFolders = false;
	for (const line of toml.split(/\r?\n/)) {
		const table = /^\s*\[(?<table>[^\]]+)\]/.exec(line);
		if (table) {
			inFolders = table.groups!.table.trim() === 'folders';
			continue;
		}
		const entry = inFolders ? /^\s*(?<kind>\w+)\s*=\s*"(?<path>[^"]*)"/.exec(line) : null;
		const path = entry?.groups!.path.trim();
		// A path inside the workspace only: not absolute, and never up out of it
		if (entry && Object.hasOwn(FOLDERS, entry.groups!.kind) && path && !/^([a-zA-Z]:|[\\/])/.test(path) && !path.split(/[\\/]/).includes('..')) {
			named[entry.groups!.kind as PollisWorkspaceFolder] = path;
		}
	}
	return named;
}

/** The first folder open in the window that is a Pollis Workspace. */
async function findOpenPollisWorkspace(contextService: IWorkspaceContextService, fileService: IFileService): Promise<URI | undefined> {
	for (const folder of contextService.getWorkspace().folders) {
		if (await fileService.exists(joinPath(folder.uri, MARKER_FILE))) {
			return folder.uri;
		}
	}
	return undefined;
}

/**
 * The Pollis Workspace: the first folder open in the window that is one, else the one the setting remembers, when it
 * is still a Pollis Workspace.
 */
export async function findPollisWorkspace(contextService: IWorkspaceContextService, fileService: IFileService, configurationService: IConfigurationService): Promise<URI | undefined> {
	const open = await findOpenPollisWorkspace(contextService, fileService);
	if (open) {
		return open;
	}
	const remembered = rememberedPollisWorkspace(configurationService);
	return remembered && await fileService.exists(joinPath(remembered, MARKER_FILE)) ? remembered : undefined;
}

/** The folder the setting remembers as the user's Pollis Workspace, when it holds a full path. */
function rememberedPollisWorkspace(configurationService: IConfigurationService): URI | undefined {
	const path = configurationService.getValue<string>(LOCATION_SETTING)?.trim();
	return path && isAbsolute(path) ? URI.file(path) : undefined;
}

/** Remembers `folder` as the user's Pollis Workspace, when it is a folder of this computer. */
async function rememberPollisWorkspace(configurationService: IConfigurationService, folder: URI): Promise<void> {
	if (folder.scheme === Schemas.file && configurationService.getValue<string>(LOCATION_SETTING) !== folder.fsPath) {
		await configurationService.updateValue(LOCATION_SETTING, folder.fsPath, ConfigurationTarget.USER);
	}
}

/** Remembers the Pollis Workspace open in the window, when Pollis starts and when the folders of the window change. */
class RememberPollisWorkspace extends Disposable implements IWorkbenchContribution {
	static readonly ID = 'workbench.contrib.rememberPollisWorkspace';

	constructor(
		@IWorkspaceContextService private readonly contextService: IWorkspaceContextService,
		@IFileService private readonly fileService: IFileService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
	) {
		super();
		this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.remember()));
		this.remember();
	}

	private async remember(): Promise<void> {
		const open = await findOpenPollisWorkspace(this.contextService, this.fileService);
		if (open) {
			await rememberPollisWorkspace(this.configurationService, open);
		}
	}
}

registerWorkbenchContribution2(RememberPollisWorkspace.ID, RememberPollisWorkspace, WorkbenchPhase.Eventually);

/**
 * The folder of `kind` in the Pollis Workspace `workspace`, as its pollis.toml names it, else as a new workspace
 * names it; made, with its README, the first time it is needed in a workspace that does not have it.
 */
export async function pollisWorkspaceFolder(fileService: IFileService, workspace: URI, kind: PollisWorkspaceFolder): Promise<URI> {
	const folder = await pollisWorkspaceFolderPath(fileService, workspace, kind);
	if (!await fileService.exists(folder)) {
		await makeFolder(fileService, folder, kind);
	}
	return folder;
}

/** Where the folder of `kind` is in the Pollis Workspace `workspace`, as its pollis.toml names it, without making it. */
export async function pollisWorkspaceFolderPath(fileService: IFileService, workspace: URI, kind: PollisWorkspaceFolder): Promise<URI> {
	const toml = await fileService.readFile(joinPath(workspace, MARKER_FILE)).then(content => content.value.toString(), () => '');
	return joinPath(workspace, namedFolders(toml)[kind] ?? FOLDERS[kind].name);
}

/** Where a saved copy goes by default: the data folder of the Pollis Workspace, else the first open folder. */
export async function defaultCopyFolder(contextService: IWorkspaceContextService, fileService: IFileService, configurationService: IConfigurationService): Promise<URI | undefined> {
	const workspace = await findPollisWorkspace(contextService, fileService, configurationService);
	return workspace ? pollisWorkspaceFolder(fileService, workspace, 'data') : contextService.getWorkspace().folders[0]?.uri;
}

/** Whether a location is inside Pollis: its home folder (~/.pollis) or its user data folder. */
export function isInsidePollis(resource: URI, pathService: IPathService, environmentService: IEnvironmentService): boolean {
	const pollisHome = joinPath(pathService.userHome({ preferLocal: true }), '.pollis');
	const userData = extUriBiasedIgnorePathCase.dirname(environmentService.userRoamingDataHome);
	return [pollisHome, userData].some(folder => extUriBiasedIgnorePathCase.isEqualOrParent(resource, folder));
}

/** The pollis.toml of a new Pollis Workspace named `name`, naming its folders. */
function markerToml(name: string): string {
	return [
		'# A Pollis Workspace: your own work, and the copies you choose to save, kept outside Pollis.',
		'',
		`name = "${name.replace(/[\\"]/g, '\\$&')}"`,
		'',
		'# The folder of each kind of file, which Pollis looks in first. A folder renamed on disk is renamed here too.',
		'[folders]',
		...Object.entries(FOLDERS).map(([kind, folder]) => `${kind} = "${folder.name}"`),
		'',
	].join('\n');
}

/** Makes the folder of `kind` at `folder`, with its README and its subfolders. */
async function makeFolder(fileService: IFileService, folder: URI, kind: PollisWorkspaceFolder): Promise<void> {
	await fileService.createFolder(folder);
	const readme = joinPath(folder, 'README.md');
	if (!await fileService.exists(readme)) {
		await fileService.writeFile(readme, VSBuffer.fromString(`${FOLDERS[kind].readme}\n`));
	}
	for (const subfolder of FOLDERS[kind].subfolders ?? []) {
		await fileService.createFolder(joinPath(folder, subfolder));
	}
}

/** Makes `folder` a Pollis Workspace, keeping what it has: its pollis.toml, unless it has one, and its folders. */
async function makeWorkspace(fileService: IFileService, folder: URI): Promise<void> {
	await fileService.createFolder(folder);
	const marker = joinPath(folder, MARKER_FILE);
	if (!await fileService.exists(marker)) {
		await fileService.writeFile(marker, VSBuffer.fromString(markerToml(basename(folder))));
	}
	for (const kind of Object.keys(FOLDERS) as PollisWorkspaceFolder[]) {
		await pollisWorkspaceFolder(fileService, folder, kind);
	}
}

/** The first of `folders` that exists. */
async function firstExisting(fileService: IFileService, folders: readonly (URI | undefined)[]): Promise<URI | undefined> {
	for (const folder of folders) {
		if (folder && await fileService.exists(folder)) {
			return folder;
		}
	}
	return undefined;
}

/** The folder Documents of the user, where a Pollis Workspace is made by default. */
function documentsFolder(pathService: IPathService): URI {
	return joinPath(pathService.userHome({ preferLocal: true }), 'Documents');
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: NEW_POLLIS_WORKSPACE_COMMAND_ID,
			title: localize2('pollisWorkspace.new', "New Pollis Workspace..."),
			category: localize2('pollisWorkspace.category', "Pollis"),
			f1: true,
			menu: { id: MenuId.MenubarFileMenu, group: '3_workspace', order: 0 },
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const fileDialogService = accessor.get(IFileDialogService);
		const fileService = accessor.get(IFileService);
		const hostService = accessor.get(IHostService);
		const pathService = accessor.get(IPathService);
		const environmentService = accessor.get(IEnvironmentService);
		const configurationService = accessor.get(IConfigurationService);

		// A new folder, named in a save dialog, so that the folder it opens in never becomes the workspace by itself;
		// the name offered is one not taken yet in Documents, with no space, so that paths to it need no quoting in
		// scripts, the terminal or LaTeX
		const documents = documentsFolder(pathService);
		const name = 'PollisWorkspace';
		let offered = joinPath(documents, name);
		for (let n = 2; await fileService.exists(offered); n++) {
			offered = joinPath(documents, `${name}${n}`);
		}
		const folder = await fileDialogService.showSaveDialog({
			title: localize('pollisWorkspace.pick', "Name the Folder of the New Pollis Workspace"),
			saveLabel: mnemonicButtonLabel(localize({ key: 'pollisWorkspace.pickLabel', comment: ['&& denotes a mnemonic'] }, "&&Create")),
			defaultUri: offered,
		});
		if (!folder) {
			return;
		}
		if (isInsidePollis(folder, pathService, environmentService)) {
			throw new Error(localize('pollisWorkspace.insidePollis', "A Pollis Workspace keeps your work outside Pollis: choose a folder outside {0}.", folder.fsPath));
		}
		// A file of that name cannot hold the workspace; a folder of that name becomes it, keeping what it has
		const existing = await fileService.exists(folder) ? await fileService.stat(folder) : undefined;
		if (existing && !existing.isDirectory) {
			throw new Error(localize('pollisWorkspace.isFile', "{0} is a file: give the Pollis Workspace another name.", basename(folder)));
		}
		await makeWorkspace(fileService, folder);
		await rememberPollisWorkspace(configurationService, folder);
		await hostService.openWindow([{ folderUri: folder }], { forceReuseWindow: true });
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: OPEN_POLLIS_WORKSPACE_COMMAND_ID,
			title: localize2('pollisWorkspace.open', "Open Pollis Workspace..."),
			category: localize2('pollisWorkspace.category', "Pollis"),
			f1: true,
			menu: { id: MenuId.MenubarFileMenu, group: '3_workspace', order: 1 },
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const fileDialogService = accessor.get(IFileDialogService);
		const fileService = accessor.get(IFileService);
		const hostService = accessor.get(IHostService);
		const pathService = accessor.get(IPathService);
		const environmentService = accessor.get(IEnvironmentService);
		const configurationService = accessor.get(IConfigurationService);
		const dialogService = accessor.get(IDialogService);

		// The dialog starts in the remembered Pollis Workspace, else in the one that New makes by default, when there is one
		const documents = documentsFolder(pathService);
		const usual = [rememberedPollisWorkspace(configurationService), joinPath(documents, 'PollisWorkspace')];
		const picked = await fileDialogService.showOpenDialog({
			title: localize('pollisWorkspace.openTitle', "Open a Pollis Workspace"),
			openLabel: mnemonicButtonLabel(localize({ key: 'pollisWorkspace.openLabel', comment: ['&& denotes a mnemonic'] }, "&&Open")),
			canSelectFolders: true,
			canSelectFiles: false,
			canSelectMany: false,
			defaultUri: await firstExisting(fileService, usual) ?? documents,
		});
		const folder = picked?.[0];
		if (!folder) {
			return;
		}
		if (isInsidePollis(folder, pathService, environmentService)) {
			throw new Error(localize('pollisWorkspace.insidePollis', "A Pollis Workspace keeps your work outside Pollis: choose a folder outside {0}.", folder.fsPath));
		}
		// A folder that is not one yet becomes one if the user agrees, keeping what it has; one that is gets the folders it lacks
		if (!await fileService.exists(joinPath(folder, MARKER_FILE))) {
			const { confirmed } = await dialogService.confirm({
				message: localize('pollisWorkspace.makeIt', "Make {0} a Pollis Workspace?", basename(folder)),
				detail: localize('pollisWorkspace.makeItDetail', "Pollis adds pollis.toml and its folders, data, knowledge_base, reports, methods, workflows, panels, toolboxes, programs, orchestration, games and changes, each with a README, and keeps everything the folder has."),
				primaryButton: localize({ key: 'pollisWorkspace.makeItButton', comment: ['&& denotes a mnemonic'] }, "&&Make It a Pollis Workspace"),
			});
			if (!confirmed) {
				return;
			}
		}
		await makeWorkspace(fileService, folder);
		await rememberPollisWorkspace(configurationService, folder);
		await hostService.openWindow([{ folderUri: folder }], { forceReuseWindow: true });
	}
});
