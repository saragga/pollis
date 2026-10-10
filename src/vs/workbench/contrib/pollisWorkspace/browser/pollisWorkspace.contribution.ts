/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../base/common/buffer.js';
import { basename, extUriBiasedIgnorePathCase, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IPathService } from '../../../services/path/common/pathService.js';

// The Pollis Workspace: an ordinary folder, marked by pollis.toml, for the user's own work and the copies they
// choose to save, outside Pollis. Pollis itself keeps preferences and machine state (~/.pollis and its user
// data folder). Exactly what lives in a Pollis Workspace is still being decided
// (internal-reports/pollis-workspace-spec.md); for now its data/ folder receives the copies of articles and
// data made with Save a Copy... (Compose > New Methods).

export const NEW_POLLIS_WORKSPACE_COMMAND_ID = 'pollis.workspace.new';

const MARKER_FILE = 'pollis.toml';
const DATA_FOLDER = 'data';

/** The first open workspace folder that is a Pollis Workspace. */
export async function findPollisWorkspace(contextService: IWorkspaceContextService, fileService: IFileService): Promise<URI | undefined> {
	for (const folder of contextService.getWorkspace().folders) {
		if (await fileService.exists(joinPath(folder.uri, MARKER_FILE))) {
			return folder.uri;
		}
	}
	return undefined;
}

/** Where a saved copy goes by default: the data folder of an open Pollis Workspace, else the first open folder. */
export async function defaultCopyFolder(contextService: IWorkspaceContextService, fileService: IFileService): Promise<URI | undefined> {
	const workspace = await findPollisWorkspace(contextService, fileService);
	return workspace ? joinPath(workspace, DATA_FOLDER) : contextService.getWorkspace().folders[0]?.uri;
}

/** Whether a location is inside Pollis: its home folder (~/.pollis) or its user data folder. */
export function isInsidePollis(resource: URI, pathService: IPathService, environmentService: IEnvironmentService): boolean {
	const pollisHome = joinPath(pathService.userHome({ preferLocal: true }), '.pollis');
	const userData = extUriBiasedIgnorePathCase.dirname(environmentService.userRoamingDataHome);
	return [pollisHome, userData].some(folder => extUriBiasedIgnorePathCase.isEqualOrParent(resource, folder));
}

function markerToml(name: string): string {
	return [
		'# A Pollis Workspace: your own work, and the copies you choose to save, kept outside Pollis.',
		`# For now, ${DATA_FOLDER}/ receives the copies of articles and data made with Save a Copy... (Compose > New Methods).`,
		'',
		`name = "${name.replace(/[\\"]/g, '\\$&')}"`,
		'',
	].join('\n');
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: NEW_POLLIS_WORKSPACE_COMMAND_ID,
			title: localize2('pollisWorkspace.new', "New Pollis Workspace..."),
			category: localize2('pollisWorkspace.category', "Pollis"),
			f1: true,
			menu: { id: MenuId.MenubarFileMenu, group: '2_open', order: 4 },
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const fileDialogService = accessor.get(IFileDialogService);
		const fileService = accessor.get(IFileService);
		const hostService = accessor.get(IHostService);
		const pathService = accessor.get(IPathService);
		const environmentService = accessor.get(IEnvironmentService);

		const folders = await fileDialogService.showOpenDialog({
			title: localize('pollisWorkspace.pick', "Choose or Create the Folder of the Pollis Workspace"),
			openLabel: localize({ key: 'pollisWorkspace.pickLabel', comment: ['&& denotes a mnemonic'] }, "&&Make Pollis Workspace"),
			canSelectFolders: true,
			canSelectFiles: false,
			canSelectMany: false,
			defaultUri: joinPath(pathService.userHome({ preferLocal: true }), 'Documents'),
		});
		const folder = folders?.[0];
		if (!folder) {
			return;
		}
		if (isInsidePollis(folder, pathService, environmentService)) {
			throw new Error(localize('pollisWorkspace.insidePollis', "A Pollis Workspace keeps your work outside Pollis: choose a folder outside {0}.", folder.fsPath));
		}
		const marker = joinPath(folder, MARKER_FILE);
		if (!await fileService.exists(marker)) {
			await fileService.writeFile(marker, VSBuffer.fromString(markerToml(basename(folder))));
		}
		await fileService.createFolder(joinPath(folder, DATA_FOLDER));
		await hostService.openWindow([{ folderUri: folder }], { forceReuseWindow: true });
	}
});
