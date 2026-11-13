/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Pollis: the user's references live in knowledge_base/references/ of the Pollis Workspace open (referenceLibrary.ts).
// When a window opens one, this names its folder in ~/.pollis/references/workspace.txt and has the Julia extension
// build the PollisReferences database again, so that its views read it; and offers once to move there the references
// the user kept in ~/.pollis/references before.

import { Event } from '../../../../base/common/event.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { findPollisWorkspace, OPEN_POLLIS_WORKSPACE_COMMAND_ID, pollisWorkspaceFolder } from '../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { referencesFolderOf, setWorkspaceReferences, USER_REFERENCE_FILES, WORKSPACE_POINTER } from './common/referenceLibrary.js';

/** The command of the Julia extension that builds the PollisReferences database again. */
const BUILD_REFERENCES_COMMAND_ID = 'language-julia.pollisBuildReferences';

/** Set once the user has answered whether to move the references of ~/.pollis/references into a Pollis Workspace. */
const MOVE_ANSWERED_KEY = 'pollis.references.moveAnswered';

/** The user's references in the Pollis Workspace of this window. */
class PollisUserReferences extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'pollis.userReferences';

	/** Whether the notification asking for a Pollis Workspace is showing. */
	private asking = false;

	constructor(
		@IWorkspaceContextService private readonly contextService: IWorkspaceContextService,
		@IFileService private readonly fileService: IFileService,
		@IPathService private readonly pathService: IPathService,
		@ICommandService private readonly commandService: ICommandService,
		@INotificationService private readonly notificationService: INotificationService,
		@IDialogService private readonly dialogService: IDialogService,
		@IStorageService private readonly storageService: IStorageService,
	) {
		super();
		this.update();
		this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.update()));
	}

	/** Gives the library the folder of the user's references in this window's Pollis Workspace, and makes it the one the database reads. */
	private update(): void {
		const folder = this.workspaceFolder();
		setWorkspaceReferences({ folder, askForWorkspace: () => this.askForWorkspace() });
		folder.then(found => found && this.opened(found)).catch(onUnexpectedError);
	}

	/** knowledge_base/references of the Pollis Workspace open; undefined without one. */
	private async workspaceFolder(): Promise<URI | undefined> {
		const workspace = await findPollisWorkspace(this.contextService, this.fileService);
		return workspace && joinPath(await pollisWorkspaceFolder(this.fileService, workspace, 'knowledge_base'), 'references');
	}

	/** With the folder `folder` of a Pollis Workspace: the references kept before moved there, if the user wants, and the database made to read it. */
	private async opened(folder: URI): Promise<void> {
		if (!await this.fileService.exists(folder)) {
			await this.fileService.createFolder(folder);
		}
		const home = referencesFolderOf(await this.pathService.userHome());
		await this.offerMove(home, folder);
		const pointer = joinPath(home, WORKSPACE_POINTER);
		const named = await this.fileService.readFile(pointer).then(content => content.value.toString().trim(), () => '');
		if (named !== folder.fsPath) {
			await this.fileService.writeFile(pointer, VSBuffer.fromString(`${folder.fsPath}\n`));
			// Without the Julia extension yet, the REPL's next start builds it
			await this.commandService.executeCommand(BUILD_REFERENCES_COMMAND_ID).catch(() => undefined);
		}
	}

	/** Offers to move the user's references of ~/.pollis/references, `home`, into `folder`, until the user answers. */
	private async offerMove(home: URI, folder: URI): Promise<void> {
		if (this.storageService.getBoolean(MOVE_ANSWERED_KEY, StorageScope.APPLICATION, false)) {
			return;
		}
		const lines = await this.fileService.readFile(joinPath(home, 'references.jsonl')).then(content => content.value.toString(), () => '');
		const keys = new Set<string>();
		for (const line of lines.split('\n')) {
			try {
				const key = line.trim() && JSON.parse(line).key;
				if (typeof key === 'string') {
					keys.add(key);
				}
			} catch {
				// A line cut short
			}
		}
		if (!keys.size) {
			return;
		}
		const { result } = await this.dialogService.prompt<'move' | 'keep' | 'later'>({
			type: Severity.Info,
			message: localize('userReferences.move', "Move Your References into This Pollis Workspace?"),
			detail: keys.size === 1
				? localize('userReferences.moveDetailOne', "Pollis keeps the works you save or add, your corrections and their citation counts in {0}. One work of yours is in {1}: Pollis moves it there, with its records and counts.", folder.fsPath, home.fsPath)
				: localize('userReferences.moveDetail', "Pollis keeps the works you save or add, your corrections and their citation counts in {0}. {1} works of yours are in {2}: Pollis moves them there, with their records and counts.", folder.fsPath, keys.size, home.fsPath),
			buttons: [
				{ label: localize({ key: 'userReferences.moveButton', comment: ['&& denotes a mnemonic'] }, "&&Move"), run: () => 'move' },
				{ label: localize({ key: 'userReferences.keepButton', comment: ['&& denotes a mnemonic'] }, "&&Don't Move"), run: () => 'keep' },
			],
			cancelButton: { label: localize('userReferences.later', "Not Now"), run: () => 'later' },
		});
		if (result === 'later') {
			return;
		}
		if (result === 'move') {
			for (const name of USER_REFERENCE_FILES) {
				const source = joinPath(home, name);
				const content = await this.fileService.readFile(source).then(file => file.value, () => undefined);
				if (content) {
					// After what the folder has, so that the rows moved win, as the last line of a row does
					await this.fileService.writeFile(joinPath(folder, name), content, { append: true });
					await this.fileService.del(source);
				}
			}
		}
		this.storageService.store(MOVE_ANSWERED_KEY, true, StorageScope.APPLICATION, StorageTarget.USER);
	}

	/** Tells the user, once at a time, that their references are saved in a Pollis Workspace, with a button that opens one. */
	private askForWorkspace(): void {
		if (this.asking) {
			return;
		}
		this.asking = true;
		const handle = this.notificationService.prompt(Severity.Info, localize('userReferences.noWorkspace', "Your references are kept in the knowledge_base/references folder of a Pollis Workspace: open one to save them."), [{
			label: localize('userReferences.openWorkspace', "Open a Pollis Workspace..."),
			run: () => this.commandService.executeCommand(OPEN_POLLIS_WORKSPACE_COMMAND_ID),
		}]);
		Event.once(handle.onDidClose)(() => this.asking = false);
	}
}

registerWorkbenchContribution2(PollisUserReferences.ID, PollisUserReferences, WorkbenchPhase.BlockRestore);
