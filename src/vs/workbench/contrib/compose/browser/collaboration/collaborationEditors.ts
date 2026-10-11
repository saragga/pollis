/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../../base/common/buffer.js';
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../../../base/common/map.js';
import { basename, dirname, isEqual } from '../../../../../base/common/resources.js';
import { URI } from '../../../../../base/common/uri.js';
import { EditOperation } from '../../../../../editor/common/core/editOperation.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { localize } from '../../../../../nls.js';
import { IEnvironmentService } from '../../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { InMemoryFileSystemProvider } from '../../../../../platform/files/common/inMemoryFilesystemProvider.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { EditorResourceAccessor, EditorsOrder, IEditorIdentifier, SideBySideEditor } from '../../../../common/editor.js';
import { EditorInput } from '../../../../common/editor/editorInput.js';
import { AbstractTextResourceEditorInput } from '../../../../common/editor/textResourceEditorInput.js';
import { GroupDirection, GroupsOrder, IEditorGroup, IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IEditorService, SIDE_GROUP } from '../../../../services/editor/common/editorService.js';
import { BrowserEditorInput } from '../../../browserView/common/browserEditorInput.js';
import { plutoNotebookFile, plutoNotebookId } from '../../../model/browser/commands/pluto.command.js';
import { CellEditType, NotebookData } from '../../../notebook/common/notebookCommon.js';
import { NotebookEditorInput } from '../../../notebook/common/notebookEditorInput.js';
import { INotebookService } from '../../../notebook/common/notebookService.js';
import { IEditorSharedPayload } from './collaborationProtocol.js';

// Compose > Collaboration, Share My Editor (internal-reports/collaboration-spec.md): a participant shares a
// snapshot of an editor or a notebook, without outputs; the others see it read-only beside their own editor,
// and can copy it into theirs or compare it with theirs. The snapshots live in memory only. A Pluto notebook,
// a page in the internal browser, is shared as its file, which Pluto reloads when a copy replaces it.

/** The scheme of the shared snapshots: pollis-shared:/<sharer>/<file name>, read-only. */
export const SHARED_EDITOR_SCHEME = 'pollis-shared';

export interface ISharedSnapshot {
	readonly sharer: string;
	readonly time: number;
	readonly payload: IEditorSharedPayload;
}

export type ShareableKind = 'text' | 'notebook' | 'pluto';

/** Whether an editor can be shared, and how: a text editor, saved or untitled, a notebook or a Pluto page; not a shared one. */
export function shareableKind(editor: EditorInput): ShareableKind | undefined {
	if (editor.resource?.scheme === SHARED_EDITOR_SCHEME) {
		return undefined;
	}
	if (editor instanceof NotebookEditorInput) {
		return 'notebook';
	}
	if (editor instanceof BrowserEditorInput) {
		return plutoNotebookId(editor.url) ? 'pluto' : undefined;
	}
	return editor instanceof AbstractTextResourceEditorInput ? 'text' : undefined;
}

/** Whether my editor of a kind takes a snapshot: a notebook's a notebook, a Pluto notebook's a Pluto page or a text editor. */
function takes(kind: ShareableKind, payload: IEditorSharedPayload): boolean {
	if (payload.kind === 'notebook') {
		return kind === 'notebook';
	}
	return kind === 'text' || (kind === 'pluto' && payload.pluto === true);
}

export class SharedEditors extends Disposable {

	private readonly _onDidChange = this._register(new Emitter<void>());
	/** Fires when a snapshot arrives or is replaced. */
	readonly onDidChange = this._onDidChange.event;

	private readonly provider = this._register(new InMemoryFileSystemProvider());
	private readonly snapshots = new ResourceMap<ISharedSnapshot>();
	/** Each sharer's latest snapshot: sharing again replaces it. */
	private readonly latest = new Map<string, URI>();

	constructor(
		/** Shows a notice in the chat of the session. */
		private readonly notice: (text: string) => void,
		@IFileService private readonly fileService: IFileService,
		@IEnvironmentService private readonly environmentService: IEnvironmentService,
		@IEditorService private readonly editorService: IEditorService,
		@IEditorGroupsService private readonly editorGroupsService: IEditorGroupsService,
		@ITextModelService private readonly textModelService: ITextModelService,
		@INotebookService private readonly notebookService: INotebookService,
		@INotificationService private readonly notificationService: INotificationService,
	) {
		super();
		// Read-only for the editors; the snapshots are written to the provider directly
		this.provider.setReadOnly(true);
		this._register(fileService.registerProvider(SHARED_EDITOR_SCHEME, this.provider));
		this.closeRestored();
	}

	/** Closes the snapshots of an earlier window and their Compare editors, which a reload restores but memory no longer has. */
	private async closeRestored(): Promise<void> {
		await this.editorGroupsService.whenRestored;
		for (const group of this.editorGroupsService.groups) {
			const restored = group.editors.filter(editor => {
				const sides = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.BOTH });
				const resources = URI.isUri(sides) ? [sides] : [sides?.primary, sides?.secondary];
				return resources.some(resource => resource?.scheme === SHARED_EDITOR_SCHEME);
			});
			if (restored.length) {
				await group.closeEditors(restored);
				// Unless closing its last editor removed it already
				if (this.editorGroupsService.getGroup(group.id) && group.isEmpty && this.editorGroupsService.count > 1) {
					this.editorGroupsService.removeGroup(group);
				}
			}
		}
	}

	snapshot(resource: URI): ISharedSnapshot | undefined {
		return this.snapshots.get(resource);
	}

	/** The snapshot of an editor to share: its text, unsaved changes included, or the notebook without outputs. */
	async capture(editor: EditorInput): Promise<IEditorSharedPayload | undefined> {
		const kind = shareableKind(editor);
		if (kind === 'pluto' && editor instanceof BrowserEditorInput) {
			const file = await plutoNotebookFile(this.fileService, this.environmentService, editor.url);
			if (!file) {
				this.notificationService.info(localize('collaboration.plutoUnknown', "Pollis cannot find this Pluto notebook's file. Open it from the Pluto that Pollis starts (restart Pluto if it was started before), then share it again."));
				return undefined;
			}
			const content = (await this.fileService.readFile(file)).value.toString();
			return { fileName: basename(file), kind: 'text', content, languageId: 'julia', pluto: true };
		}
		const resource = EditorResourceAccessor.getOriginalUri(editor);
		if (!kind || kind === 'pluto' || !resource) {
			return undefined;
		}
		const fileName = basename(resource) || editor.getName();
		if (kind === 'notebook') {
			const model = this.notebookService.getNotebookTextModel(resource);
			if (!model) {
				return undefined;
			}
			const data: NotebookData = {
				metadata: model.metadata,
				cells: model.cells.map(cell => ({ source: cell.getValue(), language: cell.language, mime: cell.mime, cellKind: cell.cellKind, outputs: [], metadata: cell.metadata })),
			};
			const { serializer } = await this.notebookService.withNotebookDataProvider(model.viewType);
			return { fileName, kind, content: (await serializer.notebookToData(data)).toString() };
		}
		const reference = await this.textModelService.createModelReference(resource);
		try {
			const model = reference.object.textEditorModel;
			return { fileName, kind: 'text', content: model.getValue(), languageId: model.getLanguageId() };
		} finally {
			reference.dispose();
		}
	}

	/** Shows a snapshot from another participant, read-only, beside my editor; it replaces their previous one. */
	async receive(sharer: string, payload: IEditorSharedPayload): Promise<void> {
		const resource = URI.from({ scheme: SHARED_EDITOR_SCHEME, path: `/${safeName(sharer)}/${safeName(payload.fileName)}` });
		const previous = this.latest.get(sharer);
		try {
			await this.provider.stat(dirname(resource));
		} catch {
			await this.provider.mkdir(dirname(resource));
		}
		await this.provider.writeFile(resource, VSBuffer.fromString(payload.content).buffer, { create: true, overwrite: true, unlock: false, atomic: false });
		this.snapshots.set(resource, { sharer, time: Date.now(), payload });
		this.latest.set(sharer, resource);
		this._onDidChange.fire();

		// Where their previous snapshot is, else beside my editor
		const shown = this.editorService.findEditors(resource)[0] ?? (previous && this.editorService.findEditors(previous)[0]);
		await this.editorService.openEditor(
			{ resource, languageId: payload.kind === 'text' ? payload.languageId : undefined, options: { pinned: true, preserveFocus: true, revealIfOpened: true } },
			shown ? shown.groupId : this.groupBesideMine()
		);
		if (previous && !isEqual(previous, resource)) {
			for (const { editor, groupId } of this.editorService.findEditors(previous)) {
				await this.editorGroupsService.getGroup(groupId)?.closeEditor(editor);
			}
			this.snapshots.delete(previous);
			await this.provider.delete(previous, { recursive: false, useTrash: false, atomic: false });
		}
	}

	/** Shows a dataset another participant shared, read-only, beside my editor (Preview on its card). */
	async preview(sharer: string, fileName: string, content: string): Promise<void> {
		const folder = URI.from({ scheme: SHARED_EDITOR_SCHEME, path: `/${safeName(sharer)}` });
		const datasets = URI.joinPath(folder, 'datasets');
		for (const dir of [folder, datasets]) {
			try {
				await this.provider.stat(dir);
			} catch {
				await this.provider.mkdir(dir);
			}
		}
		const resource = URI.joinPath(datasets, safeName(fileName));
		await this.provider.writeFile(resource, VSBuffer.fromString(content).buffer, { create: true, overwrite: true, unlock: false, atomic: false });
		const shown = this.editorService.findEditors(resource)[0];
		await this.editorService.openEditor({ resource, options: { pinned: true, revealIfOpened: true } }, shown ? shown.groupId : this.groupBesideMine());
	}

	/** Replaces my editor's content with a snapshot, in one step that Undo reverts. */
	async copyToMine(resource: URI): Promise<void> {
		const snapshot = this.snapshots.get(resource);
		if (!snapshot) {
			return;
		}
		const { payload, sharer } = snapshot;
		const mine = this.myEditor(payload);
		if (!mine) {
			if (payload.kind === 'text') {
				// No editor of mine yet: the copy becomes one
				await this.editorService.openEditor({ resource: undefined, contents: payload.content, languageId: payload.languageId, options: { pinned: true } });
				return;
			}
			this.notificationService.info(localize('collaboration.noNotebookToCopyInto', "Open a notebook of yours first: Copy to My Editor replaces its cells."));
			return;
		}
		const mineResource = await this.fileOf(mine.editor);
		if (!mineResource) {
			return;
		}
		if (mine.editor instanceof BrowserEditorInput) {
			// Pluto reloads its file when it changes on disk; it keeps no undo for that
			await this.fileService.writeFile(mineResource, VSBuffer.fromString(payload.content));
			await this.editorService.openEditor(mine.editor, { preserveFocus: false }, mine.groupId);
			this.notice(localize('collaboration.copiedToPluto', "You copied {0}'s {1} into your {2}; Pluto reloads it, and Undo is not available there.", sharer, payload.fileName, mine.editor.getName()));
			return;
		}
		if (payload.kind === 'notebook') {
			const model = this.notebookService.getNotebookTextModel(mineResource);
			if (!model) {
				return;
			}
			const { serializer } = await this.notebookService.withNotebookDataProvider(model.viewType);
			const data = await serializer.dataToNotebook(VSBuffer.fromString(payload.content));
			model.applyEdits(
				[{ editType: CellEditType.Replace, index: 0, count: model.cells.length, cells: data.cells.map(cell => ({ ...cell, outputs: [] })) }],
				true, undefined, () => undefined, undefined, true
			);
		} else {
			const reference = await this.textModelService.createModelReference(mineResource);
			try {
				const model = reference.object.textEditorModel;
				model.pushStackElement();
				model.pushEditOperations([], [EditOperation.replace(model.getFullModelRange(), payload.content)], () => null);
				model.pushStackElement();
			} finally {
				reference.dispose();
			}
		}
		await this.editorService.openEditor(mine.editor, { preserveFocus: false }, mine.groupId);
		this.notice(localize('collaboration.copied', "You copied {0}'s {1} into your {2}; Undo there brings yours back.", sharer, payload.fileName, mine.editor.getName()));
	}

	/** Opens the diff editor, or the notebook diff, with the snapshot on the left and my editor on the right. */
	async compareWithMine(resource: URI): Promise<void> {
		const snapshot = this.snapshots.get(resource);
		if (!snapshot) {
			return;
		}
		const mine = this.myEditor(snapshot.payload);
		const mineResource = mine && await this.fileOf(mine.editor);
		if (!mine || !mineResource) {
			this.notificationService.info(snapshot.payload.kind === 'notebook'
				? localize('collaboration.noNotebookToCompare', "Open a notebook of yours first, to compare with.")
				: localize('collaboration.noEditorToCompare', "Open an editor of yours first, to compare with."));
			return;
		}
		await this.editorService.openEditor({
			original: { resource },
			modified: { resource: mineResource },
			label: localize('collaboration.compareLabel', "{0} ({1}) ↔ {2} (Yours)", snapshot.payload.fileName, snapshot.sharer, mine.editor.getName()),
			options: { pinned: true },
		}, mine.groupId);
	}

	/** My most recently active editor, or the one that takes a snapshot, which Copy and Compare work on. */
	private myEditor(payload?: IEditorSharedPayload): IEditorIdentifier | undefined {
		return this.editorService.getEditors(EditorsOrder.MOST_RECENTLY_ACTIVE).find(({ editor }) => {
			const kind = shareableKind(editor);
			return !!kind && (!payload || takes(kind, payload));
		});
	}

	/** The file of my editor: its resource, or a Pluto page's notebook file. */
	private async fileOf(editor: EditorInput): Promise<URI | undefined> {
		if (editor instanceof BrowserEditorInput) {
			const file = await plutoNotebookFile(this.fileService, this.environmentService, editor.url);
			if (!file) {
				this.notificationService.info(localize('collaboration.plutoUnknownMine', "Pollis cannot find your Pluto notebook's file. Open it from the Pluto that Pollis starts (restart Pluto if it was started before)."));
			}
			return file;
		}
		return EditorResourceAccessor.getOriginalUri(editor);
	}

	/** A group to the right of my editor; without one, the first group, above the chat. */
	private groupBesideMine(): IEditorGroup | typeof SIDE_GROUP {
		const mine = this.myEditor();
		const group = mine ? this.editorGroupsService.getGroup(mine.groupId) : this.editorGroupsService.getGroups(GroupsOrder.GRID_APPEARANCE)[0];
		if (!group) {
			return SIDE_GROUP;
		}
		return group.isEmpty ? group : this.editorGroupsService.addGroup(group, GroupDirection.RIGHT);
	}
}

/** A name as one path segment of a shared snapshot. */
function safeName(name: string): string {
	return name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').trim().slice(0, 100) || 'shared';
}
