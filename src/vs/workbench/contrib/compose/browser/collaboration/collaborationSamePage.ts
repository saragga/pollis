/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------------------------
 *  The design of the files of a session (the host holds a Yjs document for each file open in the session and passes
 *  each change to those who have it open; a participant's undo undoes their own changes only; the others' cursors
 *  with their names) is adapted from p2p-live-share (src/fs/host.ts, src/fs/guest.ts, src/fs/common.ts and
 *  src/ui/selections.ts), https://github.com/KermanX/p2p-live-share, under the MIT License:
 *
 *  Copyright 2025 _Kerman
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 *  associated documentation files (the "Software"), to deal in the Software without restriction,
 *  including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *  and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 *  subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all copies or substantial
 *  portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 *  LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 *  NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 *  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 *  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *--------------------------------------------------------------------------------------------*/

import { DeferredPromise, RunOnceScheduler, timeout } from '../../../../../base/common/async.js';
import { decodeBase64, encodeBase64, VSBuffer } from '../../../../../base/common/buffer.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { hash } from '../../../../../base/common/hash.js';
import { MarkdownString } from '../../../../../base/common/htmlContent.js';
import { Disposable, DisposableMap, DisposableStore, IDisposable, IReference, toDisposable } from '../../../../../base/common/lifecycle.js';
import { isEqualOrParent, joinPath } from '../../../../../base/common/resources.js';
import { URI } from '../../../../../base/common/uri.js';
import { createCSSRule } from '../../../../../base/browser/domStylesheets.js';
import { localize } from '../../../../../nls.js';
import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { UndoCommand, RedoCommand } from '../../../../../editor/browser/editorExtensions.js';
import { ICodeEditorService } from '../../../../../editor/browser/services/codeEditorService.js';
import { IPosition, Position } from '../../../../../editor/common/core/position.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { ISingleEditOperation } from '../../../../../editor/common/core/editOperation.js';
import { IModelDeltaDecoration, ITextModel, TrackedRangeStickiness } from '../../../../../editor/common/model.js';
import { IModelContentChangedEvent } from '../../../../../editor/common/textModelEvents.js';
import { IResolvedTextEditorModel, ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { createFileSystemProviderError, FileChangeType, FileOperationError, FileOperationResult, FileSystemProviderCapabilities, FileSystemProviderErrorCode, FileType, IFileChange, IFileDeleteOptions, IFileOverwriteOptions, IFileService, IFileSystemProviderWithFileReadWriteCapability, IFileWriteOptions, IStat, IWatchOptions } from '../../../../../platform/files/common/files.js';
import { IUndoRedoService } from '../../../../../platform/undoRedo/common/undoRedo.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { TextFileEditorModel } from '../../../../services/textfile/common/textFileEditorModel.js';
import { ITextFileEditorModel, ITextFileService } from '../../../../services/textfile/common/textfiles.js';
import * as Y from '../media/collaboration/yjs.js';
import { Envelope, FileRequestError, FileRequestOp, ICursorPayload, IFileResponsePayload, IFolderEntry, ITextSavedPayload, ITextUpdatePayload, MAX_SHARE_BYTES } from './collaborationProtocol.js';

// Compose > Collaboration, Same Page sessions (internal-reports/collaboration-spec.md): the host shares one folder,
// and everyone edits the text of its files together. The host answers the others' requests for the folder's entries
// and files, holds a Yjs document for each file open in the session, bound to its own text model of the file, and passes
// each change on to the participants who have the file open. The others see the folder through a file system of the
// scheme pollis-session, in their own window, beside their own folder, and may only edit the text of its files.

/** The scheme of the host's files as the others see them: pollis-session:/<path in the shared folder>. */
export const SESSION_FILES_SCHEME = 'pollis-session';

/** How long a participant waits for the host to answer a request. */
const REQUEST_TIMEOUT = 30_000;
/** How often a participant's cursor is sent at most. */
const CURSOR_INTERVAL = 150;
/** How long the host waits after a change in its folder before telling the others. */
const FOLDER_CHANGE_DELAY = 1000;
/** Above this priority, Undo and Redo of a shared file come before the editor's own (10000, in coreCommands.ts). */
const UNDO_PRIORITY = 10100;
/** The colours of the others' cursors, one for each participant in turn. */
const CURSOR_COLOURS = ['#e8a33d', '#3794ff', '#4ec9b0', '#c586c0', '#f14c4c'];

/** What the session gives the files of a Same Page session: sending, and who is there. */
export interface ISamePageLink {
	send<E extends Envelope>(type: E['type'], payload: E['payload'], peers: readonly string[]): void;
	/** The other participants admitted, by Trystero id. */
	others(): readonly string[];
	nameOf(peerId: string): string | undefined;
	/** Whether a participant may change the files, or may only watch them (Session Settings). */
	canEdit(peerId: string): boolean;
	notice(text: string): void;
}

/** The origin of a change made here in an editor. */
const LOCAL_ORIGIN = { local: true };
/** The origin of a document's first text, which is nobody's to undo. */
const INITIAL_ORIGIN = { initial: true };

interface IRemoteOrigin {
	readonly remote: string;
}

function isRemote(origin: Y.Origin): origin is IRemoteOrigin {
	return !!origin && typeof origin === 'object' && typeof (origin as Partial<IRemoteOrigin>).remote === 'string';
}

/** A text with its line ends as a document of the session keeps them: \n only. */
function lf(text: string): string {
	return text.replace(/\r\n?/g, '\n');
}

/** The characters a model's line end has beyond the one of \n. */
function eolExtra(model: ITextModel): number {
	return model.getEOL().length - 1;
}

/** The place in the document's text of a position of the model. */
function documentOffset(model: ITextModel, position: IPosition): number {
	return model.getOffsetAt(position) - (position.lineNumber - 1) * eolExtra(model);
}

/** The position of the model of a place in the document's text, which counts each line end as one character. */
function modelPosition(model: ITextModel, offset: number): Position {
	const extra = eolExtra(model);
	if (!extra) {
		return model.getPositionAt(offset);
	}
	const lineStart = (line: number) => model.getOffsetAt({ lineNumber: line, column: 1 }) - (line - 1) * extra;
	let low = 1;
	let high = model.getLineCount();
	while (low < high) {
		const middle = Math.ceil((low + high) / 2);
		if (lineStart(middle) <= offset) {
			low = middle;
		} else {
			high = middle - 1;
		}
	}
	return new Position(low, Math.min(offset - lineStart(low) + 1, model.getLineMaxColumn(low)));
}

function toBase64(bytes: Uint8Array): string {
	return encodeBase64(VSBuffer.wrap(bytes));
}

function fromBase64(text: string): Uint8Array {
	return decodeBase64(text).buffer;
}

/** The hash of a text as a document keeps it, which tells whether two participants have the same text. */
function textHash(text: string): number {
	return hash(lf(text));
}

/**
 * Keeps a text model and the text of a Yjs document the same: the model's changes go into the document, and the
 * document's changes from the others, or from undoing, into the model. The model's own undo stack is emptied after
 * each change from elsewhere, since it no longer matches the text; Undo and Redo use the document's instead, which
 * holds only the changes made here.
 */
class TextBinding extends Disposable {

	readonly undoManager: Y.UndoManager;
	private readonly text: Y.Text;
	private applying = false;
	/** Where the last change from the document ended, in the document's text, for the cursor after an undo. */
	private changedAt = 0;

	constructor(
		readonly model: ITextModel,
		readonly doc: Y.Doc,
		private readonly undoRedoService: IUndoRedoService,
		private readonly onDidChangeFromDocument: () => void,
	) {
		super();
		this.text = doc.getText();
		this.undoManager = new Y.UndoManager(this.text, { trackedOrigins: new Set([LOCAL_ORIGIN]) });
		const observer = (event: Y.YTextEvent) => {
			if (event.transaction.origin !== LOCAL_ORIGIN) {
				this.applyToModel(event.delta);
			}
		};
		this.text.observe(observer);
		this._register(toDisposable(() => {
			this.text.unobserve(observer);
			this.undoManager.destroy();
		}));
		this._register(model.onDidChangeContent(event => this.applyToDocument(event)));
		// The document may have changed while the model was being made
		if (lf(model.getValue()) !== this.text.toString()) {
			this.replaceModel();
		}
	}

	/** Undoes or redoes this participant's last change; returns where the cursor goes, or undefined when there was none. */
	undoOrRedo(kind: 'undo' | 'redo'): Position | undefined {
		const item = kind === 'undo' ? this.undoManager.undo() : this.undoManager.redo();
		return item ? modelPosition(this.model, this.changedAt) : undefined;
	}

	private applyToDocument(event: IModelContentChangedEvent): void {
		if (this.applying) {
			return;
		}
		if (event.isFlush) {
			// The whole text was replaced, as when the file was read again from the disk
			const value = lf(this.model.getValue());
			if (value === this.text.toString()) {
				return;
			}
			this.doc.transact(() => {
				this.text.delete(0, this.text.length);
				this.text.insert(0, value);
			}, LOCAL_ORIGIN);
			return;
		}
		if (event.isEolChange) {
			// Only the line ends changed, which the document keeps as \n
			return;
		}
		const extra = eolExtra(this.model);
		// Each change is given in the text before the event: applied from the last to the first, each place stays right
		const changes = [...event.changes].sort((a, b) => b.rangeOffset - a.rangeOffset);
		this.doc.transact(() => {
			for (const change of changes) {
				const start = change.rangeOffset - (change.range.startLineNumber - 1) * extra;
				const length = change.rangeLength - (change.range.endLineNumber - change.range.startLineNumber) * extra;
				if (length > 0) {
					this.text.delete(start, length);
				}
				if (change.text) {
					this.text.insert(start, lf(change.text));
				}
			}
		}, LOCAL_ORIGIN);
	}

	private applyToModel(delta: readonly Y.Delta[]): void {
		const edits: ISingleEditOperation[] = [];
		// A place in the text before the change, and in the text after it
		let before = 0;
		let after = 0;
		let first = true;
		for (const part of delta) {
			if (part.retain) {
				before += part.retain;
				after += part.retain;
			} else if (typeof part.insert === 'string') {
				const at = modelPosition(this.model, before);
				edits.push({ range: Range.fromPositions(at), text: part.insert });
				after += part.insert.length;
			} else if (part.delete) {
				edits.push({ range: Range.fromPositions(modelPosition(this.model, before), modelPosition(this.model, before + part.delete)), text: null });
				before += part.delete;
			} else {
				continue;
			}
			if (first) {
				this.changedAt = after;
				first = false;
			}
		}
		if (!edits.length) {
			return;
		}
		this.applying = true;
		try {
			this.model.applyEdits(edits);
		} finally {
			this.applying = false;
		}
		this.undoRedoService.removeElements(this.model.uri);
		if (this.model.getValueLength() - (this.model.getLineCount() - 1) * eolExtra(this.model) !== this.text.length) {
			this.replaceModel();
		}
		this.onDidChangeFromDocument();
	}

	/** Makes the model's text that of the document, as one change that cannot be undone. */
	private replaceModel(): void {
		this.applying = true;
		try {
			this.model.applyEdits([{ range: this.model.getFullModelRange(), text: this.text.toString() }]);
		} finally {
			this.applying = false;
		}
		this.undoRedoService.removeElements(this.model.uri);
	}
}

interface IPeerCursor {
	path?: string;
	anchor?: Y.RelativePosition;
	head?: Y.RelativePosition;
	model?: ITextModel;
	decorations: string[];
}

/** Escapes a name for the content of a CSS rule. */
function cssString(text: string): string {
	return `"${text.replace(/[^A-Za-z0-9 ]/gu, character => `\\${character.codePointAt(0)!.toString(16)} `)}"`;
}

/**
 * The cursors of the session: this participant's, sent to the others while it is in a file of the session, and each
 * other participant's, shown in its colour with its name, in the editors of that file.
 */
class SessionCursors extends Disposable {

	private readonly peers = new Map<string, IPeerCursor>();
	private readonly classes = new Map<string, number>();
	private nextClass = 0;
	private readonly sendScheduler = this._register(new RunOnceScheduler(() => this.sendCursor(), CURSOR_INTERVAL));
	private lastEditor: ICodeEditor | undefined;
	private sentPath: string | undefined;

	constructor(
		private readonly link: ISamePageLink,
		/** The model and document of a path of the session, when the file is open here. */
		private readonly locate: (path: string) => TextBinding | undefined,
		/** The path in the session of a model, when it is one of the session's files. */
		private readonly pathOf: (model: ITextModel) => string | undefined,
		codeEditorService: ICodeEditorService,
	) {
		super();
		const editorListeners = this._register(new DisposableMap<ICodeEditor>());
		const watch = (editor: ICodeEditor) => editorListeners.set(editor, editor.onDidChangeCursorSelection(() => {
			if (editor.hasTextFocus()) {
				this.lastEditor = editor;
				this.sendScheduler.schedule();
			}
		}));
		codeEditorService.listCodeEditors().forEach(watch);
		this._register(codeEditorService.onCodeEditorAdd(watch));
		this._register(codeEditorService.onCodeEditorRemove(editor => editorListeners.deleteAndDispose(editor)));
		this._register(toDisposable(() => {
			for (const peerId of [...this.peers.keys()]) {
				this.remove(peerId);
			}
		}));
	}

	/** A cursor from another participant. */
	receive(peerId: string, cursor: ICursorPayload): void {
		const name = this.link.nameOf(peerId);
		if (!name) {
			return;
		}
		const peer = this.peers.get(peerId) ?? { decorations: [] };
		this.peers.set(peerId, peer);
		const decode = (value: unknown) => typeof value === 'string' ? Y.decodeRelativePosition(fromBase64(value)) : undefined;
		peer.path = typeof cursor.path === 'string' ? cursor.path : undefined;
		peer.anchor = decode(cursor.anchor);
		peer.head = decode(cursor.head);
		this.render(peerId, peer, name);
	}

	/** Shows again the cursors in a file whose text has changed. */
	refresh(path: string): void {
		for (const [peerId, peer] of this.peers) {
			const name = this.link.nameOf(peerId);
			if (peer.path === path && name) {
				this.render(peerId, peer, name);
			}
		}
	}

	/** Removes a participant's cursor, when they leave. */
	remove(peerId: string): void {
		const peer = this.peers.get(peerId);
		if (peer?.model && !peer.model.isDisposed()) {
			peer.model.deltaDecorations(peer.decorations, []);
		}
		this.peers.delete(peerId);
	}

	/** Sends the cursor again, to someone who has just opened a file. */
	resend(): void {
		this.sentPath = undefined;
		this.sendScheduler.schedule();
	}

	private render(peerId: string, peer: IPeerCursor, name: string): void {
		const binding = peer.path === undefined ? undefined : this.locate(peer.path);
		const decorations: IModelDeltaDecoration[] = [];
		const anchor = binding && peer.anchor && Y.createAbsolutePositionFromRelativePosition(peer.anchor, binding.doc);
		const head = binding && peer.head && Y.createAbsolutePositionFromRelativePosition(peer.head, binding.doc);
		if (binding && anchor && head) {
			const style = this.styleOf(peerId, name);
			const from = modelPosition(binding.model, anchor.index);
			const to = modelPosition(binding.model, head.index);
			const hoverMessage = new MarkdownString().appendText(name);
			if (!from.equals(to)) {
				decorations.push({ range: Range.fromPositions(from, to), options: { description: 'pollis-session-selection', className: `pollis-session-selection-${style}`, stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges, hoverMessage } });
			}
			decorations.push({ range: Range.fromPositions(to), options: { description: 'pollis-session-cursor', beforeContentClassName: `pollis-session-cursor-${style}`, stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges, hoverMessage } });
		}
		const model = binding?.model;
		if (peer.model && peer.model !== model && !peer.model.isDisposed()) {
			peer.model.deltaDecorations(peer.decorations, []);
			peer.decorations = [];
		}
		peer.model = model;
		peer.decorations = model ? model.deltaDecorations(peer.decorations, decorations) : [];
	}

	/** The style of a participant's cursor: a colour, and their name above it. */
	private styleOf(peerId: string, name: string): number {
		let style = this.classes.get(peerId);
		if (style === undefined) {
			style = this.nextClass++;
			this.classes.set(peerId, style);
			const colour = CURSOR_COLOURS[style % CURSOR_COLOURS.length];
			createCSSRule(`.monaco-editor .pollis-session-selection-${style}`, `background-color: ${colour}40;`);
			createCSSRule(`.monaco-editor .pollis-session-cursor-${style}`, `position: relative; border-left: 2px solid ${colour}; margin-left: -1px;`);
			createCSSRule(`.monaco-editor .pollis-session-cursor-${style}::after`, `content: ${cssString(name)}; position: absolute; left: -2px; top: -1.1em; padding: 0 3px; font-size: 10px; line-height: 1.1em; white-space: nowrap; color: #ffffff; background-color: ${colour}; border-radius: 2px; pointer-events: none; z-index: 10;`);
		}
		return style;
	}

	private sendCursor(): void {
		const editor = this.lastEditor;
		const model = editor?.getModel();
		const selection = editor?.getSelection();
		const path = model ? this.pathOf(model) : undefined;
		const binding = path === undefined ? undefined : this.locate(path);
		const peers = this.link.others();
		if (!peers.length) {
			return;
		}
		if (!model || !selection || path === undefined || !binding) {
			if (this.sentPath !== undefined) {
				this.sentPath = undefined;
				this.link.send<Envelope & { type: 'cursor' }>('cursor', {}, peers);
			}
			return;
		}
		const encode = (position: IPosition) => toBase64(Y.encodeRelativePosition(Y.createRelativePositionFromTypeIndex(binding.doc.getText(), documentOffset(model, position))));
		this.sentPath = path;
		this.link.send<Envelope & { type: 'cursor' }>('cursor', { path, anchor: encode(selection.getSelectionStart()), head: encode(selection.getPosition()) }, peers);
	}
}

/** What both sides of a Same Page session do: Undo and Redo of a shared file, and the cursors. */
abstract class SamePageFiles extends Disposable {

	private readonly _onDidChangeFolder = this._register(new Emitter<void>());
	/** Fires when the shared folder's entries may have changed. */
	readonly onDidChangeFolder = this._onDidChangeFolder.event;

	protected readonly cursors: SessionCursors;

	constructor(
		protected readonly link: ISamePageLink,
		/** The name of the shared folder. */
		readonly folderName: string,
		codeEditorService: ICodeEditorService,
		protected readonly undoRedoService: IUndoRedoService,
	) {
		super();
		this.cursors = this._register(new SessionCursors(link, path => this.bindingOf(path), model => this.pathOf(model.uri), codeEditorService));
		const undoOrRedo = (kind: 'undo' | 'redo') => {
			const editor = codeEditorService.getFocusedCodeEditor();
			const model = editor?.getModel();
			const path = model ? this.pathOf(model.uri) : undefined;
			const binding = path === undefined ? undefined : this.bindingOf(path);
			if (!editor || !binding || binding.model !== model) {
				return false;
			}
			if (!this.canEditHere()) {
				// A watcher's file is read-only: nothing to undo
				return true;
			}
			const position = binding.undoOrRedo(kind);
			if (position) {
				editor.setPosition(position);
				editor.revealPosition(position);
			}
			return true;
		};
		this._register(UndoCommand.addImplementation(UNDO_PRIORITY, 'collaboration-same-page', () => undoOrRedo('undo')));
		this._register(RedoCommand.addImplementation(UNDO_PRIORITY, 'collaboration-same-page', () => undoOrRedo('redo')));
	}

	/** The entries of a folder of the session, '' for the shared folder itself. */
	abstract list(path: string): Promise<readonly IFolderEntry[]>;

	/** Opens a file of the session in an editor. */
	abstract openInEditor(path: string): Promise<void>;

	/** A message of a Same Page session from another participant. */
	abstract receive(peerId: string, data: Envelope): void;

	/** Someone left the session, or lost the connection. */
	abstract peerLeft(peerId: string): void;

	/** Whether this participant may change the files; a watcher may not. */
	protected canEditHere(): boolean {
		return true;
	}

	/** The binding of a file of the session open here, by its path. */
	protected abstract bindingOf(path: string): TextBinding | undefined;

	/** The path in the session of a resource, when it is one of the session's files. */
	protected abstract pathOf(resource: URI): string | undefined;

	protected folderChanged(): void {
		this._onDidChangeFolder.fire();
	}

	protected makeBinding(model: ITextModel, doc: Y.Doc, path: string): TextBinding {
		return new TextBinding(model, doc, this.undoRedoService, () => this.cursors.refresh(path));
	}
}

/** Thrown when the host refuses a request; carries the reason. */
class FileRequestFailure extends Error {
	constructor(readonly reason: FileRequestError) {
		super(reason);
	}
}

/** The parts of a path of the session, or undefined when it would leave the shared folder or enter .git. */
function pathParts(path: string): string[] | undefined {
	if (typeof path !== 'string' || path.includes('\\')) {
		return undefined;
	}
	const parts = path.split('/').filter(part => part.length);
	return parts.some(part => part === '.' || part === '..' || part === '.git') ? undefined : parts;
}

interface IHostFile {
	readonly path: string;
	readonly doc: Y.Doc;
	readonly binding: TextBinding;
	readonly reference: IReference<IResolvedTextEditorModel>;
	/** The participants who have the file open. */
	readonly trackers: Set<string>;
}

/** The host's side: answers the others' requests, and holds the documents of the files open in the session. */
export class SamePageHost extends SamePageFiles {

	private readonly files = new Map<string, IHostFile>();
	private readonly opening = new Map<string, Promise<IHostFile>>();
	private readonly folderScheduler = this._register(new RunOnceScheduler(() => {
		this.link.send<Envelope & { type: 'filesChanged' }>('filesChanged', {}, this.link.others());
		this.folderChanged();
	}, FOLDER_CHANGE_DELAY));

	constructor(
		link: ISamePageLink,
		readonly root: URI,
		folderName: string,
		@IFileService private readonly fileService: IFileService,
		@ITextModelService private readonly textModelService: ITextModelService,
		@ITextFileService private readonly textFileService: ITextFileService,
		@IEditorService private readonly editorService: IEditorService,
		@ICodeEditorService codeEditorService: ICodeEditorService,
		@IUndoRedoService undoRedoService: IUndoRedoService,
	) {
		super(link, folderName, codeEditorService, undoRedoService);
		this._register(fileService.watch(root, { recursive: true, excludes: ['**/.git/**'] }));
		this._register(fileService.onDidFilesChange(event => {
			if (event.affects(root, FileChangeType.ADDED, FileChangeType.DELETED)) {
				this.folderScheduler.schedule();
			}
		}));
		this._register(textFileService.files.onDidSave(event => {
			const path = this.pathOf(event.model.resource);
			const file = path === undefined ? undefined : this.files.get(path);
			if (file?.trackers.size) {
				const saved: ITextSavedPayload = { path: file.path, hash: textHash(event.model.textEditorModel?.getValue() ?? '') };
				this.link.send<Envelope & { type: 'textSaved' }>('textSaved', saved, [...file.trackers]);
			}
		}));
		this._register(toDisposable(() => {
			for (const file of this.files.values()) {
				file.binding.dispose();
				file.doc.destroy();
				file.reference.dispose();
			}
			this.files.clear();
		}));
	}

	async list(path: string): Promise<readonly IFolderEntry[]> {
		const resource = this.resourceOf(path);
		const stat = await this.fileService.resolve(resource);
		if (!stat.isDirectory) {
			throw new FileRequestFailure('notFound');
		}
		return (stat.children ?? [])
			.filter(child => child.name !== '.git')
			.map(child => ({ name: child.name, folder: child.isDirectory }))
			.sort((a, b) => a.folder === b.folder ? a.name.localeCompare(b.name) : a.folder ? -1 : 1);
	}

	async openInEditor(path: string): Promise<void> {
		await this.editorService.openEditor({ resource: this.resourceOf(path) });
	}

	receive(peerId: string, data: Envelope): void {
		switch (data.type) {
			case 'fileRequest':
				this.answer(peerId, data.payload.id, data.payload.op, data.payload.path);
				break;
			case 'textUpdate': {
				const file = typeof data.payload.path === 'string' ? this.files.get(data.payload.path) : undefined;
				// A watcher's changes are not taken: its copy takes the host's text again when it becomes a watcher
				if (file?.trackers.has(peerId) && this.link.canEdit(peerId) && typeof data.payload.update === 'string') {
					Y.applyUpdateV2(file.doc, fromBase64(data.payload.update), { remote: peerId });
					const others = [...file.trackers].filter(id => id !== peerId);
					if (others.length) {
						this.link.send<Envelope & { type: 'textUpdate' }>('textUpdate', { path: file.path, update: data.payload.update }, others);
					}
				}
				break;
			}
			case 'cursor':
				this.cursors.receive(peerId, data.payload);
				break;
		}
	}

	peerLeft(peerId: string): void {
		for (const file of this.files.values()) {
			file.trackers.delete(peerId);
		}
		this.cursors.remove(peerId);
	}

	protected bindingOf(path: string): TextBinding | undefined {
		return this.files.get(path)?.binding;
	}

	protected pathOf(resource: URI): string | undefined {
		if (!isEqualOrParent(resource, this.root)) {
			return undefined;
		}
		const path = resource.path.slice(this.root.path.length).replace(/^\/+/, '');
		return this.files.has(path) ? path : undefined;
	}

	private resourceOf(path: string): URI {
		const parts = pathParts(path);
		if (!parts) {
			throw new FileRequestFailure('notAllowed');
		}
		const resource = parts.length ? joinPath(this.root, ...parts) : this.root;
		if (!isEqualOrParent(resource, this.root)) {
			throw new FileRequestFailure('notAllowed');
		}
		return resource;
	}

	private async answer(peerId: string, id: number, op: FileRequestOp, path: string): Promise<void> {
		if (typeof id !== 'number' || typeof path !== 'string') {
			return;
		}
		let response: IFileResponsePayload;
		try {
			response = { id, ...await this.perform(peerId, op, path) };
		} catch (error) {
			response = { id, error: requestError(error) };
		}
		this.link.send<Envelope & { type: 'fileResponse' }>('fileResponse', response, [peerId]);
	}

	private async perform(peerId: string, op: FileRequestOp, path: string): Promise<Omit<IFileResponsePayload, 'id'>> {
		switch (op) {
			case 'list':
				return { entries: await this.list(path) };
			case 'stat': {
				const stat = await this.fileService.stat(this.resourceOf(path));
				return { folder: stat.isDirectory, size: stat.size, mtime: stat.mtime };
			}
			case 'open': {
				const file = await this.openFile(path);
				file.trackers.add(peerId);
				this.cursors.resend();
				return { state: toBase64(Y.encodeStateAsUpdateV2(file.doc)) };
			}
			case 'close':
				this.files.get(path)?.trackers.delete(peerId);
				return {};
			case 'save': {
				const file = this.files.get(path);
				if (!file) {
					throw new FileRequestFailure('notFound');
				}
				if (!this.link.canEdit(peerId)) {
					throw new FileRequestFailure('notAllowed');
				}
				await this.textFileService.save(file.reference.object.textEditorModel.uri);
				return {};
			}
			default:
				throw new FileRequestFailure('notAllowed');
		}
	}

	/** The document of a file, made from the host's text model of it the first time someone opens it. */
	private openFile(path: string): Promise<IHostFile> {
		const resource = this.resourceOf(path);
		const normal = (pathParts(path) ?? []).join('/');
		const existing = this.files.get(normal);
		if (existing) {
			return Promise.resolve(existing);
		}
		let opening = this.opening.get(normal);
		if (!opening) {
			opening = this.makeFile(normal, resource).finally(() => this.opening.delete(normal));
			this.opening.set(normal, opening);
		}
		return opening;
	}

	private async makeFile(path: string, resource: URI): Promise<IHostFile> {
		const stat = await this.fileService.stat(resource);
		if (stat.isDirectory) {
			throw new FileRequestFailure('notFound');
		}
		if (stat.size > MAX_SHARE_BYTES) {
			throw new FileRequestFailure('tooLarge');
		}
		const head = await this.fileService.readFile(resource, { length: 8192 });
		if (head.value.buffer.includes(0)) {
			throw new FileRequestFailure('binary');
		}
		const reference = await this.textModelService.createModelReference(resource);
		const model = reference.object.textEditorModel;
		const doc = new Y.Doc();
		doc.transact(() => doc.getText().insert(0, lf(model.getValue())), INITIAL_ORIGIN);
		const trackers = new Set<string>();
		doc.on('updateV2', (update, origin) => {
			// A change from another participant is passed on where it arrives; this sends the host's own
			if (!isRemote(origin) && trackers.size) {
				this.link.send<Envelope & { type: 'textUpdate' }>('textUpdate', { path, update: toBase64(update) }, [...trackers]);
			}
		});
		const file: IHostFile = { path, doc, binding: this.makeBinding(model, doc, path), reference, trackers };
		this.files.set(path, file);
		return file;
	}
}

/** The reason of a refusal, from an error while answering a request. */
function requestError(error: unknown): FileRequestError {
	if (error instanceof FileRequestFailure) {
		return error.reason;
	}
	if (error instanceof FileOperationError) {
		return error.fileOperationResult === FileOperationResult.FILE_NOT_FOUND ? 'notFound'
			: error.fileOperationResult === FileOperationResult.FILE_TOO_LARGE ? 'tooLarge'
				: 'failed';
	}
	return 'failed';
}

interface IGuestFile {
	/** Replaced by the host's when this participant becomes a watcher, which drops any change of theirs on its way. */
	doc: Y.Doc;
	/** The time the file was opened, given as its time of change, so that saving never sees it as changed elsewhere. */
	readonly mtime: number;
	binding?: TextBinding;
}

/**
 * Another participant's side: the host's folder as the file system pollis-session, whose files open as documents
 * kept with the host's. Only the text of the host's files can be changed: nothing can be created, renamed or deleted.
 */
export class SamePageGuest extends SamePageFiles implements IFileSystemProviderWithFileReadWriteCapability {

	private readonly _onDidChangeCapabilities = this._register(new Emitter<void>());
	readonly onDidChangeCapabilities = this._onDidChangeCapabilities.event;
	private readonly _onDidChangeFile = this._register(new Emitter<readonly IFileChange[]>());
	readonly onDidChangeFile = this._onDidChangeFile.event;

	private readonly files = new Map<string, IGuestFile>();
	private readonly opening = new Map<string, Promise<IGuestFile>>();
	private readonly pending = new Map<number, DeferredPromise<IFileResponsePayload>>();
	private nextRequestId = 1;
	/** Whether the host lets this participant edit the files (Session Settings); newcomers may. */
	private canEdit = true;

	constructor(
		link: ISamePageLink,
		private readonly hostId: string,
		folderName: string,
		@IFileService fileService: IFileService,
		@ITextFileService private readonly textFileService: ITextFileService,
		@IEditorService private readonly editorService: IEditorService,
		@ICodeEditorService codeEditorService: ICodeEditorService,
		@IUndoRedoService undoRedoService: IUndoRedoService,
	) {
		super(link, folderName, codeEditorService, undoRedoService);
		this._register(fileService.registerProvider(SESSION_FILES_SCHEME, this));
		const modelListeners = this._register(new DisposableStore());
		this._register(textFileService.files.onDidResolve(event => this.bind(event.model, modelListeners)));
		this._register(toDisposable(() => {
			for (const pending of this.pending.values()) {
				pending.error(createFileSystemProviderError(localize('samePage.ended', "The session has ended."), FileSystemProviderErrorCode.Unavailable));
			}
			for (const file of this.files.values()) {
				file.binding?.dispose();
				file.doc.destroy();
			}
			this.files.clear();
		}));
	}

	get capabilities(): FileSystemProviderCapabilities {
		return FileSystemProviderCapabilities.FileReadWrite | FileSystemProviderCapabilities.PathCaseSensitive | (this.canEdit ? 0 : FileSystemProviderCapabilities.Readonly);
	}

	get readOnlyMessage(): MarkdownString | undefined {
		return this.canEdit ? undefined : new MarkdownString().appendText(localize('samePage.watching', "{0}, who hosts the session, lets you watch the files but not change them.", this.link.nameOf(this.hostId) ?? ''));
	}

	/**
	 * The host made this participant a watcher, or let them edit again. A watcher's files are read-only, and each is
	 * opened again from the host, since the host does not take changes of theirs still on their way.
	 */
	setCanEdit(canEdit: boolean): void {
		if (canEdit === this.canEdit) {
			return;
		}
		this.canEdit = canEdit;
		if (!canEdit) {
			// A dirty model is not read again, so would not become read-only; a watcher cannot save anyway
			for (const path of this.files.keys()) {
				const model = this.textFileService.files.get(this.resourceOf(path));
				if (model instanceof TextFileEditorModel && model.isDirty()) {
					model.setDirty(false);
				}
			}
		}
		this._onDidChangeCapabilities.fire();
		if (!canEdit) {
			this.takeHostText();
		}
	}

	async list(path: string): Promise<readonly IFolderEntry[]> {
		const response = await this.request('list', path);
		return Array.isArray(response.entries)
			? response.entries.filter(entry => typeof entry?.name === 'string' && pathParts(entry.name)?.length === 1).map(entry => ({ name: entry.name, folder: entry.folder === true }))
			: [];
	}

	async openInEditor(path: string): Promise<void> {
		await this.editorService.openEditor({ resource: this.resourceOf(path) });
	}

	receive(peerId: string, data: Envelope): void {
		if (peerId !== this.hostId) {
			if (data.type === 'cursor') {
				this.cursors.receive(peerId, data.payload);
			}
			return;
		}
		switch (data.type) {
			case 'fileResponse': {
				const pending = this.pending.get(data.payload.id);
				this.pending.delete(data.payload.id);
				pending?.complete(data.payload);
				break;
			}
			case 'textUpdate':
				this.onTextUpdate(data.payload);
				break;
			case 'textSaved':
				this.onTextSaved(data.payload);
				break;
			case 'filesChanged':
				this.folderChanged();
				break;
			case 'cursor':
				this.cursors.receive(peerId, data.payload);
				break;
		}
	}

	peerLeft(peerId: string): void {
		this.cursors.remove(peerId);
	}

	/**
	 * The host is back after its connection dropped: changes made meanwhile on either side were not delivered, so each
	 * file is opened again, which brings the host's text, and this participant's text is sent to it; Yjs merges both.
	 */
	reconnected(): void {
		for (const [path, file] of this.files) {
			if (this.canEdit) {
				this.link.send<Envelope & { type: 'textUpdate' }>('textUpdate', { path, update: toBase64(Y.encodeStateAsUpdateV2(file.doc)) }, [this.hostId]);
			}
			this.request('open', path).then(response => {
				if (typeof response.state === 'string' && this.files.get(path) === file) {
					Y.applyUpdateV2(file.doc, fromBase64(response.state), { remote: this.hostId });
				}
			}, () => { /* the host will say so in the chat if the file is gone */ });
		}
	}

	protected override canEditHere(): boolean {
		return this.canEdit;
	}

	protected bindingOf(path: string): TextBinding | undefined {
		return this.files.get(path)?.binding;
	}

	private resourceOf(path: string): URI {
		return URI.from({ scheme: SESSION_FILES_SCHEME, path: `/${path}` });
	}

	protected pathOf(resource: URI): string | undefined {
		return resource.scheme === SESSION_FILES_SCHEME ? resource.path.replace(/^\/+/, '') : undefined;
	}

	// ---- The file system of the host's folder ----

	watch(_resource: URI, _opts: IWatchOptions): IDisposable {
		return Disposable.None;
	}

	async stat(resource: URI): Promise<IStat> {
		const path = this.pathOf(resource) ?? '';
		if (!path) {
			return { type: FileType.Directory, ctime: 0, mtime: 0, size: 0 };
		}
		const file = this.files.get(path);
		if (file) {
			return { type: FileType.File, ctime: file.mtime, mtime: file.mtime, size: file.doc.getText().length };
		}
		const response = await this.request('stat', path);
		return { type: response.folder ? FileType.Directory : FileType.File, ctime: response.mtime ?? 0, mtime: response.mtime ?? 0, size: response.size ?? 0 };
	}

	async readdir(resource: URI): Promise<[string, FileType][]> {
		return (await this.list(this.pathOf(resource) ?? '')).map(entry => [entry.name, entry.folder ? FileType.Directory : FileType.File]);
	}

	async readFile(resource: URI): Promise<Uint8Array> {
		const file = await this.openFile(this.pathOf(resource) ?? '');
		return VSBuffer.fromString(file.doc.getText().toString()).buffer;
	}

	async writeFile(resource: URI, content: Uint8Array, _opts: IFileWriteOptions): Promise<void> {
		const path = this.pathOf(resource) ?? '';
		const file = this.files.get(path);
		if (!file) {
			throw this.notAllowed();
		}
		// What is saved must be the text edited together: an editor that is not a text editor, such as a Jupyter
		// notebook's, keeps its changes apart from it, and the host would save its own copy without them
		if (lf(VSBuffer.wrap(content).toString().replace(/^\uFEFF/, '')) !== file.doc.getText().toString()) {
			throw createFileSystemProviderError(localize('samePage.notTextEdited', "{0} cannot be saved to the host's copy: only the text of files open in a text editor is edited together, and notebooks are not yet. Save As keeps a copy on this computer; Share My Editor sends it to the others.", path), FileSystemProviderErrorCode.NoPermissions);
		}
		if (!this.canEdit) {
			throw createFileSystemProviderError(this.readOnlyMessage?.value ?? '', FileSystemProviderErrorCode.NoPermissions);
		}
		// The text is already the session's: saving asks the host to write its own copy to its disk
		await this.request('save', path);
	}

	async mkdir(_resource: URI): Promise<void> {
		throw this.notAllowed();
	}

	async delete(_resource: URI, _opts: IFileDeleteOptions): Promise<void> {
		throw this.notAllowed();
	}

	async rename(_from: URI, _to: URI, _opts: IFileOverwriteOptions): Promise<void> {
		throw this.notAllowed();
	}

	private notAllowed(): Error {
		return createFileSystemProviderError(localize('samePage.notAllowed', "In a Same Page session you can edit the text of the host's files, but not create, rename or delete files."), FileSystemProviderErrorCode.NoPermissions);
	}

	private async request(op: FileRequestOp, path: string): Promise<IFileResponsePayload> {
		const id = this.nextRequestId++;
		const pending = new DeferredPromise<IFileResponsePayload>();
		this.pending.set(id, pending);
		this.link.send<Envelope & { type: 'fileRequest' }>('fileRequest', { id, op, path }, [this.hostId]);
		const response = await Promise.race([pending.p, timeout(REQUEST_TIMEOUT).then(() => undefined)]);
		this.pending.delete(id);
		if (!response) {
			throw createFileSystemProviderError(localize('samePage.noAnswer', "The host did not answer."), FileSystemProviderErrorCode.Unavailable);
		}
		if (response.error) {
			throw providerError(response.error, path);
		}
		return response;
	}

	private openFile(path: string): Promise<IGuestFile> {
		const existing = this.files.get(path);
		if (existing) {
			return Promise.resolve(existing);
		}
		let opening = this.opening.get(path);
		if (!opening) {
			opening = this.request('open', path).then(response => {
				if (typeof response.state !== 'string') {
					throw providerError('failed', path);
				}
				const file: IGuestFile = { doc: this.makeDoc(path, response.state), mtime: Date.now() };
				this.files.set(path, file);
				return file;
			}).finally(() => this.opening.delete(path));
			this.opening.set(path, opening);
		}
		return opening;
	}

	/** The document of a file from the host's state of it, whose changes made here go to the host. */
	private makeDoc(path: string, state: string): Y.Doc {
		const doc = new Y.Doc();
		Y.applyUpdateV2(doc, fromBase64(state), { remote: this.hostId });
		doc.on('updateV2', (update, origin) => {
			if (!isRemote(origin) && this.canEdit) {
				this.link.send<Envelope & { type: 'textUpdate' }>('textUpdate', { path, update: toBase64(update) }, [this.hostId]);
			}
		});
		return doc;
	}

	/** Opens each file again from the host, in place of this participant's document of it, and shows the host's text. */
	private async takeHostText(): Promise<void> {
		for (const [path, file] of [...this.files]) {
			let state: string | undefined;
			try {
				state = (await this.request('open', path)).state;
			} catch {
				continue; // the host will say so in the chat if the file is gone
			}
			if (typeof state !== 'string' || this.files.get(path) !== file) {
				continue;
			}
			const previous = file.doc;
			const model = file.binding?.model;
			file.binding?.dispose();
			file.doc = this.makeDoc(path, state);
			file.binding = model && !model.isDisposed() ? this.makeBinding(model, file.doc, path) : undefined;
			previous.destroy();
		}
		this.cursors.resend();
	}

	/** Binds a text model of a file of the session, once it is made, to the file's document. */
	private bind(model: ITextFileEditorModel, listeners: DisposableStore): void {
		const path = this.pathOf(model.resource);
		const file = path === undefined ? undefined : this.files.get(path);
		const textModel = model.textEditorModel;
		if (path === undefined || !file || !textModel || file.binding?.model === textModel) {
			return;
		}
		file.binding?.dispose();
		file.binding = this.makeBinding(textModel, file.doc, path);
		listeners.add(Event.once(textModel.onWillDispose)(() => {
			// The editors of the file are all closed: the file leaves the session here
			if (this.files.get(path) === file) {
				file.binding?.dispose();
				file.doc.destroy();
				this.files.delete(path);
				this.request('close', path).catch(() => { /* the session may have ended */ });
			}
		}));
		this.cursors.resend();
	}

	private onTextUpdate(update: ITextUpdatePayload): void {
		const file = typeof update.path === 'string' ? this.files.get(update.path) : undefined;
		if (file && typeof update.update === 'string') {
			Y.applyUpdateV2(file.doc, fromBase64(update.update), { remote: this.hostId });
		}
	}

	/** The host saved a file: shown as saved here too, when the text here is the one saved. */
	private onTextSaved(saved: ITextSavedPayload): void {
		const file = typeof saved.path === 'string' ? this.files.get(saved.path) : undefined;
		if (!file || textHash(file.doc.getText().toString()) !== saved.hash) {
			return;
		}
		const model = this.textFileService.files.get(this.resourceOf(saved.path));
		if (model instanceof TextFileEditorModel && model.isDirty()) {
			model.setDirty(false);
		}
	}
}

/** The error of the file system for a refusal of the host. */
function providerError(reason: FileRequestError, path: string): Error {
	switch (reason) {
		case 'notFound':
			return createFileSystemProviderError(localize('samePage.notFound', "{0} is not in the shared folder.", path), FileSystemProviderErrorCode.FileNotFound);
		case 'notAllowed':
			return createFileSystemProviderError(localize('samePage.pathNotAllowed', "{0} is outside what the host shares.", path), FileSystemProviderErrorCode.NoPermissions);
		case 'tooLarge':
			return createFileSystemProviderError(localize('samePage.tooLarge', "{0} is too large to edit together (the limit is {1} MB).", path, MAX_SHARE_BYTES / 1024 / 1024), FileSystemProviderErrorCode.FileTooLarge);
		case 'binary':
			return createFileSystemProviderError(localize('samePage.binary', "{0} is not a text file: only text files can be edited together.", path), FileSystemProviderErrorCode.NoPermissions);
		default:
			return createFileSystemProviderError(localize('samePage.failed', "The host could not open {0}.", path), FileSystemProviderErrorCode.Unknown);
	}
}
