/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DeferredPromise, timeout } from '../../../../../base/common/async.js';
import { decodeBase64, VSBuffer } from '../../../../../base/common/buffer.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { language } from '../../../../../base/common/platform.js';
import { generateUuid } from '../../../../../base/common/uuid.js';
import { localize } from '../../../../../nls.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ConfirmResult, IDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { createDecorator, IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { IQuickInputService, IQuickPickItem } from '../../../../../platform/quickinput/common/quickInput.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../../platform/storage/common/storage.js';
import { EditorInput } from '../../../../common/editor/editorInput.js';
import { GroupDirection, IEditorGroup, IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { ILifecycleService } from '../../../../services/lifecycle/common/lifecycle.js';
import { WebviewInput } from '../../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { ChatPageMessage, ChatWorkbenchMessage, chatPageHtml, COLLABORATION_MEDIA, IChatEntry, IPeerConnectionStats, trysteroBundleUrl } from './collaborationChat.js';
import { COLLABORATION_APP_ID, envelope, Envelope, formatSessionCode, IByePayload, IChatPayload, base64Bytes, IDatasetSharedPayload, IEditorSharedPayload, IFileSharedPayload, IHelloPayload, isAcceptableImage, isDuckDbFile, isEnvelope, ISessionCode, MAX_DATASET_BYTES, MAX_FILE_BYTES, MAX_IMAGE_BYTES, MAX_PARTICIPANTS, MAX_RECEIVE_BYTES, MAX_SHARE_BYTES, newSessionCode, parseSessionCode, ParticipantRole, roomIdOf, SignallingStrategy } from './collaborationProtocol.js';
import { datasetFileName, formatBytes, IReceivedDataset, IReceivedFile, SharedDatasets, sharedFileName, summarizeCsv } from './collaborationDatasets.js';
import { ISharedSnapshot, shareableKind, SharedEditors } from './collaborationEditors.js';
import { getVoiceLanguage, getVoiceWriteIn, setVoiceLanguage, setVoiceWriteIn } from '../composerVoice.js';
import { IWirePacket, ReliableDelivery } from './collaborationTransport.js';

// Compose > Collaboration sessions (internal-reports/collaboration-spec.md): starting, joining and leaving
// a session, the chat with its images and files, Share My Editor (collaborationEditors.ts) and Share Dataset (collaborationDatasets.ts). The host is the participant who started the session: they admit up to
// MAX_PARTICIPANTS, and when they leave the session ends. Nothing is stored after the session.

export const SIGNALLING_SETTING = 'pollis.collaboration.signalling';
export const TEST_CONNECTION_COMMAND_ID = 'pollis.collaboration.testConnection';

const NAME_STORAGE_KEY = 'pollis.collaboration.name';
/** How long a newcomer waits to meet the host before giving up. */
const JOIN_TIMEOUT = 45_000;
/** How long the others wait for a host whose connection dropped before the session ends. */
const HOST_RETURN_TIMEOUT = 60_000;
/** How long a participant leaving waits for the others to hear goodbye. */
const BYE_TIMEOUT = 1500;
/** How long a request for connection statistics waits for the chat page. */
const STATS_TIMEOUT = 3000;

export interface IParticipantConnection {
	readonly name: string;
	readonly host: boolean;
	/** True for a direct connection, false through the relay, undefined while connecting. */
	readonly direct: boolean | undefined;
	readonly roundTripMs: number | undefined;
	readonly stats: IPeerConnectionStats;
}

export const ICollaborationService = createDecorator<ICollaborationService>('collaborationService');

export interface ICollaborationService {
	readonly _serviceBrand: undefined;

	/** Fires when a session starts or ends. */
	readonly onDidChangeSession: Event<void>;

	/** Whether this copy is in a session, joining or joined. */
	readonly inSession: boolean;

	/** Starts a Side by Side session, as its host, and copies the invitation. */
	startSession(): Promise<void>;

	/** Joins a session from a code or an invitation; asks for it when none is given. */
	joinSession(invitation?: string): Promise<void>;

	/** Leaves the session; for the host, after confirming, this ends it for everyone. */
	leaveSession(): Promise<void>;

	/** Copies the invitation to the clipboard. */
	copyInvitation(): Promise<void>;

	/** Lists the participants and their connections. */
	showParticipants(): Promise<void>;

	/** Shows the chat of the session. */
	openChat(): void;

	/** The connection to each other participant; empty outside a session. */
	connectionStats(): Promise<readonly IParticipantConnection[]>;

	/** Fires when another participant's snapshot arrives or is replaced. */
	readonly onDidChangeShared: Event<void>;

	/** The snapshot shown by a shared editor, or undefined for any other. */
	sharedSnapshot(resource: URI): ISharedSnapshot | undefined;

	/** Shares a snapshot of an editor or a notebook with the others (Share My Editor). */
	shareEditor(editor: EditorInput): Promise<void>;

	/** Replaces my editor's content with a shared snapshot (Copy to My Editor). */
	copyToMyEditor(resource: URI): Promise<void>;

	/** Opens the diff of a shared snapshot and my editor (Compare with Mine). */
	compareWithMine(resource: URI): Promise<void>;

	/** Shares a dataset with the others, after confirming: a CSV file, or CSV text such as a Julia table written out. */
	shareDataset(dataset: URI | { readonly fileName: string; readonly content: string }): Promise<void>;
}

interface IParticipant {
	readonly peerId: string;
	readonly name: string;
	readonly role: ParticipantRole;
	readonly language: string;
}

/** One session, from joining to the end; the chat page stays open afterwards to be read. */
class Session extends Disposable {

	private readonly _onDidEnd = this._register(new Emitter<void>());
	readonly onDidEnd = this._onDidEnd.event;

	/** The other participants who have said hello, by Trystero id. */
	private readonly participants = new Map<string, IParticipant>();
	/** Everyone Trystero is connected to, admitted or not. */
	private readonly connected = new Set<string>();
	/** Newcomers the host admitted who have not said hello yet. */
	private readonly admitting = new Set<string>();
	private readonly delivery: ReliableDelivery;
	private readonly pendingSends = new Map<number, DeferredPromise<void>>();
	private readonly pendingStats = new Map<number, DeferredPromise<readonly IPeerConnectionStats[]>>();
	private readonly waitTimer = this._register(new MutableDisposable());
	/** The datasets the others shared, by id, for their cards' buttons. */
	private readonly datasets = new Map<string, IReceivedDataset>();
	/** The files and databases the others shared, by id, for their cards' buttons. */
	private readonly files = new Map<string, IReceivedFile>();
	private nextRequestId = 1;
	private selfId: string | undefined;
	private hostId: string | undefined;
	private admitted: boolean;
	private ended = false;
	private status = '';

	constructor(
		readonly code: ISessionCode,
		readonly role: ParticipantRole,
		readonly name: string,
		private readonly page: WebviewInput,
		private readonly onCopyInvitation: () => void,
		private readonly onTestConnection: () => void,
		private readonly onLeave: () => void,
		private readonly onEditorShared: (sharer: string, payload: IEditorSharedPayload) => void,
		private readonly onDatasetAction: (dataset: IReceivedDataset, action: 'preview' | 'save' | 'load') => void,
		private readonly onPickDataset: () => void,
		private readonly onPickDatabase: () => void,
		private readonly onFileAction: (file: IReceivedFile, action: 'save' | 'attach') => void,
		private readonly onVoiceChoice: (choice: 'voiceLanguage' | 'voiceWriteIn', value: string) => void,
	) {
		super();
		this.admitted = role === 'host';
		this.delivery = this._register(new ReliableDelivery(
			(peerId, packet) => this.sendPacket(peerId, packet),
			(action, data, peerId) => this.receive(action, data, peerId),
		));
		this._register(page.webview.onMessage(e => this.onPageMessage(e.message as ChatWorkbenchMessage)));
		this._register({
			dispose: () => {
				for (const pending of [...this.pendingSends.values(), ...this.pendingStats.values()]) {
					pending.error(new Error('session ended'));
				}
			}
		});
	}

	get isLive(): boolean {
		return !this.ended;
	}

	get invitation(): string {
		return localize('collaboration.invitation', "{0} invites you to a Pollis Side by Side session. In Pollis, choose Compose > Collaboration > Join Session... and paste this invitation, or the code: {1}", this.role === 'host' ? this.name : this.hostName, formatSessionCode(this.code));
	}

	private get hostName(): string {
		return (this.hostId && this.participants.get(this.hostId)?.name) || '';
	}

	/** Shows a notice in the chat. */
	notice(text: string): void {
		this.post({ command: 'show', entry: { kind: 'notice', text, time: Date.now() } });
	}

	/** Leaves: says goodbye, waits briefly for it to be heard, and leaves the room. */
	async leave(): Promise<void> {
		if (this.ended) {
			return;
		}
		const bye = envelope<Envelope & { type: 'bye' }>('bye', { reason: this.role === 'host' ? 'ended' : 'left' });
		await Promise.race([this.delivery.send('bye', bye as unknown as IJson, [...this.participants.keys()]), timeout(BYE_TIMEOUT)]);
		this.end(this.role === 'host'
			? localize('collaboration.youEnded', "You ended the session.")
			: localize('collaboration.youLeft', "You left the session."));
	}

	/** Ends the session here: leaves the room, keeps the chat to be read. */
	end(reason: string): void {
		if (this.ended) {
			return;
		}
		this.ended = true;
		this.waitTimer.clear();
		this.notice(reason);
		this.post({ command: 'leave' });
		this.postSession();
		this._onDidEnd.fire();
	}

	/** Called when the chat page has been closed, so the room is gone with it. */
	pageClosed(): void {
		this.ended = true;
		this._onDidEnd.fire();
	}

	async stats(): Promise<readonly IParticipantConnection[]> {
		if (this.ended) {
			return [];
		}
		const id = this.nextRequestId++;
		const pending = new DeferredPromise<readonly IPeerConnectionStats[]>();
		this.pendingStats.set(id, pending);
		this.post({ command: 'stats', id });
		const peers = await Promise.race([pending.p, timeout(STATS_TIMEOUT).then(() => [])]).catch(() => []);
		this.pendingStats.delete(id);
		return [...this.participants.values()].map(participant => {
			const stats = peers.find(peer => peer.peerId === participant.peerId) ?? { peerId: participant.peerId };
			const types = [stats.localType, stats.remoteType];
			return {
				name: participant.name,
				host: participant.role === 'host',
				direct: stats.localType ? !types.includes('relay') : undefined,
				roundTripMs: stats.roundTrip === undefined ? undefined : Math.round(stats.roundTrip * 1000),
				stats,
			};
		});
	}

	participantList(): readonly { readonly name: string; readonly host: boolean; readonly you: boolean }[] {
		return [
			{ name: this.name, host: this.role === 'host', you: true },
			...[...this.participants.values()].map(participant => ({ name: participant.name, host: participant.role === 'host', you: false })),
		];
	}

	// ---- The chat page ----

	private post(message: ChatPageMessage): void {
		this.page.webview.postMessage(message);
	}

	private async onPageMessage(message: ChatWorkbenchMessage): Promise<void> {
		switch (message.command) {
			case 'ready':
				this.post({ command: 'join', bundleUrl: trysteroBundleUrl(this.code.strategy), appId: COLLABORATION_APP_ID, roomId: await roomIdOf(this.code), password: this.code.code });
				this.postParticipants();
				this.setStatus(this.role === 'host'
					? localize('collaboration.waitingForOthers', "Waiting for others to join: send them the invitation (Copy Invitation).")
					: localize('collaboration.joining', "Joining the session..."));
				if (this.role === 'host') {
					this.notice(localize('collaboration.started', "Session started. The invitation is in the clipboard: send it to the others by email or in a message. Anyone with it can join, up to {0} participants.", MAX_PARTICIPANTS));
				} else {
					this.startWaiting(JOIN_TIMEOUT, () => this.end(localize('collaboration.notReached', "Could not reach the session. Check the code, and that the person who invited you is still in the session; Test Connection shows whether this network lets Pollis through.")));
				}
				break;
			case 'joined':
				this.selfId = message.selfId;
				break;
			case 'joinError':
				this.end(localize('collaboration.joinError', "Could not join the session: {0}", message.error));
				break;
			case 'peerJoin':
				this.onPeerJoin(message.peerId);
				break;
			case 'peerLeave':
				this.onPeerLeave(message.peerId);
				break;
			case 'packet':
				if (!this.ended) {
					this.delivery.receive(message.packet, message.peerId);
				}
				break;
			case 'sent': {
				const pending = this.pendingSends.get(message.id);
				this.pendingSends.delete(message.id);
				if (message.error) {
					pending?.error(new Error(message.error));
				} else {
					pending?.complete();
				}
				break;
			}
			case 'stats':
				this.pendingStats.get(message.id)?.complete(message.peers);
				break;
			case 'sendChat':
				this.sendChat(message.text, message.image);
				break;
			case 'notice':
				this.notice(message.text);
				break;
			case 'copyInvitation':
				this.onCopyInvitation();
				break;
			case 'testConnection':
				this.onTestConnection();
				break;
			case 'leaveSession':
				this.onLeave();
				break;
			case 'dataset': {
				const dataset = this.datasets.get(message.id);
				if (dataset) {
					this.onDatasetAction(dataset, message.action);
				}
				break;
			}
			case 'pickDataset':
				this.onPickDataset();
				break;
			case 'pickDatabase':
				this.onPickDatabase();
				break;
			case 'sendFile':
				this.shareFile(message.fileName, message.content, false);
				break;
			case 'file': {
				const file = this.files.get(message.id);
				if (file && (message.action === 'save' || file.database)) {
					this.onFileAction(file, message.action);
				}
				break;
			}
			case 'voiceLanguage':
			case 'voiceWriteIn':
				this.onVoiceChoice(message.command, message.value);
				break;
		}
	}

	private sendPacket(peerId: string, packet: IWirePacket): Promise<void> {
		if (this.ended && packet.a !== 'bye') {
			return Promise.reject(new Error('session ended'));
		}
		const id = this.nextRequestId++;
		const pending = new DeferredPromise<void>();
		this.pendingSends.set(id, pending);
		this.post({ command: 'send', id, peerId, packet });
		return pending.p;
	}

	private postParticipants(): void {
		this.post({
			command: 'participants',
			participants: [
				{ peerId: this.selfId ?? '', name: this.name, host: this.role === 'host', you: true },
				...[...this.participants.values()].map(participant => ({ peerId: participant.peerId, name: participant.name, host: participant.role === 'host', you: false })),
			],
		});
	}

	private setStatus(status: string): void {
		this.status = status;
		this.postSession();
	}

	private postSession(): void {
		this.post({ command: 'session', code: formatSessionCode(this.code), status: this.status, ended: this.ended });
	}

	private startWaiting(ms: number, onTimeout: () => void): void {
		const handle = setTimeout(onTimeout, ms);
		this.waitTimer.value = { dispose: () => clearTimeout(handle) };
	}

	// ---- Meeting, admitting and losing participants ----

	private hello(admitted?: boolean): IJson {
		const payload: IHelloPayload = { name: this.name, role: this.role, language, mode: 'sideBySide', ...(admitted === undefined ? {} : { admitted }) };
		return envelope<Envelope & { type: 'hello' }>('hello', payload) as unknown as IJson;
	}

	private onPeerJoin(peerId: string): void {
		if (this.ended) {
			return;
		}
		this.connected.add(peerId);
		if (this.role === 'host') {
			const full = this.participants.size + this.admitting.size + 1 >= MAX_PARTICIPANTS;
			if (!full) {
				this.admitting.add(peerId);
			}
			this.delivery.send('hello', this.hello(!full), [peerId]);
		} else if (this.admitted) {
			this.delivery.send('hello', this.hello(), [peerId]);
		}
	}

	private onPeerLeave(peerId: string): void {
		this.connected.delete(peerId);
		this.admitting.delete(peerId);
		this.delivery.removePeer(peerId);
		const participant = this.participants.get(peerId);
		if (!participant || this.ended) {
			return;
		}
		this.participants.delete(peerId);
		this.postParticipants();
		if (participant.role === 'host') {
			// The host's connection dropped without goodbye: wait for it to come back
			this.setStatus(localize('collaboration.hostLost', "Lost the connection to {0}, who hosts the session; waiting for it to come back...", participant.name));
			this.startWaiting(HOST_RETURN_TIMEOUT, () => this.end(localize('collaboration.hostGone', "{0}, who hosts the session, did not come back: the session has ended.", participant.name)));
		} else {
			this.notice(localize('collaboration.lostConnection', "{0} lost the connection.", participant.name));
			this.updateWaitingStatus();
		}
	}

	private onHello(peerId: string, hello: IHelloPayload): void {
		if (hello.role === 'host') {
			if (this.role === 'host') {
				return;
			}
			if (hello.admitted === false) {
				this.end(localize('collaboration.full', "The session is full: it already has {0} participants.", MAX_PARTICIPANTS));
				return;
			}
			const returning = this.admitted;
			this.hostId = peerId;
			this.waitTimer.clear();
			this.participants.set(peerId, { peerId, name: hello.name, role: 'host', language: hello.language });
			this.postParticipants();
			this.setStatus('');
			if (returning) {
				this.notice(localize('collaboration.hostBack', "{0} is back.", hello.name));
				return;
			}
			this.admitted = true;
			const others = [...this.participants.values()].filter(participant => participant.role !== 'host').map(participant => participant.name);
			this.notice(others.length
				? localize('collaboration.joinedWithOthers', "You joined {0}'s session, with {1}.", hello.name, others.join(', '))
				: localize('collaboration.joinedSession', "You joined {0}'s session.", hello.name));
			this.delivery.send('hello', this.hello(), [...this.connected]);
			return;
		}

		const known = this.participants.has(peerId);
		this.admitting.delete(peerId);
		this.participants.set(peerId, { peerId, name: hello.name, role: 'guest', language: hello.language });
		if (this.admitted && !known) {
			this.postParticipants();
			this.notice(localize('collaboration.joined', "{0} joined.", hello.name));
			this.updateWaitingStatus();
		}
	}

	private updateWaitingStatus(): void {
		if (this.role === 'host') {
			this.setStatus(this.participants.size ? '' : localize('collaboration.waitingForOthers', "Waiting for others to join: send them the invitation (Copy Invitation)."));
		}
	}

	// ---- Messages ----

	private receive(action: string, data: IJson, peerId: string): void {
		if (this.ended || !isEnvelope(data) || data.type !== action) {
			return;
		}
		switch (data.type) {
			case 'hello':
				if (typeof data.payload.name === 'string' && data.payload.name.trim()) {
					this.onHello(peerId, { ...data.payload, name: data.payload.name.trim().slice(0, 40) });
				}
				break;
			case 'chat':
				this.onChat(peerId, data.payload);
				break;
			case 'editorShared':
				this.onSharedEditor(peerId, data.payload);
				break;
			case 'datasetShared':
				this.onSharedDataset(peerId, data.payload);
				break;
			case 'fileShared':
				this.onSharedFile(peerId, data.payload, false);
				break;
			case 'databaseShared':
				this.onSharedFile(peerId, data.payload, true);
				break;
			case 'bye':
				this.onBye(peerId, data.payload);
				break;
		}
	}

	private onChat(peerId: string, chat: IChatPayload): void {
		const participant = this.participants.get(peerId);
		if (!participant || typeof chat.text !== 'string') {
			return;
		}
		const image = typeof chat.image === 'string' && isAcceptableImage(chat.image) ? chat.image : undefined;
		this.post({ command: 'show', entry: { kind: 'message', name: participant.name, text: chat.text, image, time: Date.now() } });
	}

	private onSharedEditor(peerId: string, shared: IEditorSharedPayload): void {
		const participant = this.participants.get(peerId);
		if (!participant || typeof shared.fileName !== 'string' || typeof shared.content !== 'string' || (shared.kind !== 'text' && shared.kind !== 'notebook')) {
			return;
		}
		this.notice(localize('collaboration.editorShared', "{0} shared their {1}.", participant.name, shared.fileName));
		this.onEditorShared(participant.name, { fileName: shared.fileName, kind: shared.kind, content: shared.content, languageId: typeof shared.languageId === 'string' ? shared.languageId : undefined, pluto: shared.pluto === true });
	}

	/** Sends a snapshot of my editor to everyone in the session. */
	shareEditor(shared: IEditorSharedPayload): void {
		if (this.ended) {
			return;
		}
		if (VSBuffer.fromString(shared.content).byteLength > MAX_SHARE_BYTES) {
			this.notice(localize('collaboration.shareTooLarge', "{0} is too large to share (the limit is {1} MB).", shared.fileName, MAX_SHARE_BYTES / 1024 / 1024));
			return;
		}
		const peers = [...this.participants.keys()];
		if (!peers.length) {
			this.notice(localize('collaboration.nobodyToShareWith', "Nobody else is in the session yet, so {0} was not shared.", shared.fileName));
			return;
		}
		this.notice(localize('collaboration.youShared', "You shared your {0}.", shared.fileName));
		this.delivery.send('editorShared', envelope<Envelope & { type: 'editorShared' }>('editorShared', shared) as unknown as IJson, peers);
	}

	/** A dataset from another participant: checked, and shown as a card; nothing runs until a button is pressed. */
	private onSharedDataset(peerId: string, shared: IDatasetSharedPayload): void {
		const participant = this.participants.get(peerId);
		if (!participant || typeof shared.id !== 'string' || typeof shared.fileName !== 'string' || typeof shared.content !== 'string') {
			return;
		}
		const fileName = datasetFileName(shared.fileName);
		const bytes = VSBuffer.fromString(shared.content).byteLength;
		const summary = bytes <= MAX_DATASET_BYTES ? summarizeCsv(shared.content) : undefined;
		if (!summary) {
			this.notice(localize('collaboration.datasetRefused', "{0} shared {1}, but it is not a CSV dataset within {2} MB, so it was refused.", participant.name, fileName, MAX_DATASET_BYTES / 1024 / 1024));
			return;
		}
		const id = generateUuid();
		this.datasets.set(id, { sharer: participant.name, payload: { id, fileName, content: shared.content }, summary });
		this.post({
			command: 'show',
			entry: {
				kind: 'dataset', name: participant.name, text: '', time: Date.now(),
				dataset: { id, fileName, rows: summary.rows, columns: summary.header.length, size: formatBytes(bytes), header: summary.header, head: summary.head, formulas: summary.formulas },
			},
		});
	}

	/** Sends a dataset to everyone in the session; the caller has confirmed it. */
	shareDataset(fileName: string, content: string, rows: number, columns: number): void {
		if (this.ended) {
			return;
		}
		// The CSV within its cap, and the message carrying it, quotes escaped, within what the others accept
		const bytes = VSBuffer.fromString(content).byteLength;
		if (bytes > MAX_DATASET_BYTES || VSBuffer.fromString(JSON.stringify(content)).byteLength > MAX_RECEIVE_BYTES - 64 * 1024) {
			this.notice(localize('collaboration.datasetTooLargeToSend', "{0} is too large to share ({1}; the limit is {2} MB): send it the usual way.", fileName, formatBytes(bytes), MAX_DATASET_BYTES / 1024 / 1024));
			return;
		}
		const peers = [...this.participants.keys()];
		if (!peers.length) {
			this.notice(localize('collaboration.nobodyToShareWith', "Nobody else is in the session yet, so {0} was not shared.", fileName));
			return;
		}
		this.notice(localize('collaboration.youSharedDataset', "You shared {0}: {1} rows × {2} columns.", fileName, rows, columns));
		const shared: IDatasetSharedPayload = { id: generateUuid(), fileName, content };
		this.delivery.send('datasetShared', envelope<Envelope & { type: 'datasetShared' }>('datasetShared', shared) as unknown as IJson, peers);
	}

	/** A file or database from another participant: checked, and shown as a card; a file can only be saved, never opened. */
	private onSharedFile(peerId: string, shared: IFileSharedPayload, database: boolean): void {
		const participant = this.participants.get(peerId);
		if (!participant || typeof shared.id !== 'string' || typeof shared.fileName !== 'string' || typeof shared.content !== 'string') {
			return;
		}
		const fileName = sharedFileName(shared.fileName) || 'file';
		const bytes = base64Bytes(shared.content);
		if (bytes === undefined || bytes > MAX_FILE_BYTES || (database && !isDuckDbFile(decodeBase64(shared.content.slice(0, 16)).buffer))) {
			this.notice(database
				? localize('collaboration.databaseRefused', "{0} shared {1}, but it is not a DuckDB database within {2} MB, so it was refused.", participant.name, fileName, MAX_FILE_BYTES / 1024 / 1024)
				: localize('collaboration.fileRefused', "{0} shared {1}, but it is not a file within {2} MB, so it was refused.", participant.name, fileName, MAX_FILE_BYTES / 1024 / 1024));
			return;
		}
		const id = generateUuid();
		this.files.set(id, { sharer: participant.name, payload: { id, fileName, content: shared.content }, database });
		this.post({ command: 'show', entry: { kind: 'file', name: participant.name, text: '', time: Date.now(), file: { id, fileName, size: formatBytes(bytes), database } } });
	}

	/** Sends a file or a database, as base64, to everyone in the session; a database has been confirmed. */
	shareFile(fileName: string, content: string, database: boolean): void {
		if (this.ended || typeof fileName !== 'string' || typeof content !== 'string') {
			return;
		}
		const name = sharedFileName(fileName) || 'file';
		const bytes = base64Bytes(content);
		if (bytes === undefined || bytes > MAX_FILE_BYTES) {
			this.notice(localize('collaboration.fileTooLarge', "{0} is too large to share in the chat (the limit is {1} MB): send it the usual way.", name, MAX_FILE_BYTES / 1024 / 1024));
			return;
		}
		const peers = [...this.participants.keys()];
		if (!peers.length) {
			this.notice(localize('collaboration.nobodyToShareWith', "Nobody else is in the session yet, so {0} was not shared.", name));
			return;
		}
		this.notice(database
			? localize('collaboration.youSharedDatabase', "You shared the database {0} ({1}).", name, formatBytes(bytes))
			: localize('collaboration.youSharedFile', "You shared {0} ({1}).", name, formatBytes(bytes)));
		const shared: IFileSharedPayload = { id: generateUuid(), fileName: name, content };
		const type = database ? 'databaseShared' : 'fileShared';
		this.delivery.send(type, envelope<Envelope & { type: typeof type }>(type, shared) as unknown as IJson, peers);
	}

	private onBye(peerId: string, bye: IByePayload): void {
		const participant = this.participants.get(peerId);
		if (!participant) {
			return;
		}
		this.participants.delete(peerId);
		this.delivery.removePeer(peerId);
		this.postParticipants();
		if (participant.role === 'host' || bye.reason === 'ended') {
			this.end(localize('collaboration.hostEnded', "{0} ended the session.", participant.name));
		} else {
			this.notice(localize('collaboration.left', "{0} left.", participant.name));
			this.updateWaitingStatus();
		}
	}

	private sendChat(text: string, image: string | undefined): void {
		if (this.ended) {
			return;
		}
		if (image && !isAcceptableImage(image)) {
			this.notice(localize('collaboration.imageTooLarge', "This image is too large for the chat (the limit is {0} MB): send it the usual way.", MAX_IMAGE_BYTES / 1024 / 1024));
			return;
		}
		const entry: IChatEntry = { kind: 'message', name: this.name, mine: true, text, image, time: Date.now() };
		this.post({ command: 'show', entry });
		const peers = [...this.participants.keys()];
		if (!peers.length) {
			this.notice(localize('collaboration.nobodyYet', "Nobody else is in the session yet, so the message was not sent."));
			return;
		}
		const chat: IChatPayload = image ? { id: generateUuid(), text, image } : { id: generateUuid(), text };
		this.delivery.send('chat', envelope<Envelope & { type: 'chat' }>('chat', chat) as unknown as IJson, peers);
	}
}

type IJson = null | string | number | boolean | IJson[] | { [key: string]: IJson };

export class CollaborationService extends Disposable implements ICollaborationService {
	declare readonly _serviceBrand: undefined;

	private readonly _onDidChangeSession = this._register(new Emitter<void>());
	readonly onDidChangeSession = this._onDidChangeSession.event;

	private readonly session = this._register(new MutableDisposable<Session>());
	/** The chat page, open during the session and after it ends, until closed. */
	private page: WebviewInput | undefined;
	private readonly pageDisposables = this._register(new DisposableStore());
	private readonly sharedEditors: SharedEditors;
	private readonly sharedDatasets: SharedDatasets;
	readonly onDidChangeShared: Event<void>;

	constructor(
		@IWebviewWorkbenchService private readonly webviewWorkbenchService: IWebviewWorkbenchService,
		@IEditorGroupsService private readonly editorGroupsService: IEditorGroupsService,
		@IQuickInputService private readonly quickInputService: IQuickInputService,
		@IStorageService private readonly storageService: IStorageService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IClipboardService private readonly clipboardService: IClipboardService,
		@INotificationService private readonly notificationService: INotificationService,
		@IDialogService private readonly dialogService: IDialogService,
		@ICommandService private readonly commandService: ICommandService,
		@IInstantiationService instantiationService: IInstantiationService,
		@ILifecycleService lifecycleService: ILifecycleService,
	) {
		super();
		// The chat page is not restored after a reload, so neither should its group be: closing the page removes it
		this._register(lifecycleService.onBeforeShutdown(() => {
			const page = this.page;
			const group = page?.group === undefined ? undefined : this.editorGroupsService.getGroup(page.group);
			if (page && group) {
				page.closeHandler = undefined;
				group.closeEditor(page);
			}
		}));
		this.sharedEditors = this._register(instantiationService.createInstance(SharedEditors, (text: string) => this.session.value?.notice(text)));
		this.onDidChangeShared = this.sharedEditors.onDidChange;
		this.sharedDatasets = instantiationService.createInstance(SharedDatasets, (text: string) => this.session.value?.notice(text));
	}

	get inSession(): boolean {
		return !!this.session.value?.isLive;
	}

	async startSession(): Promise<void> {
		if (this.alreadyInSession()) {
			return;
		}
		const name = await this.askName();
		if (!name) {
			return;
		}
		const strategy = this.configurationService.getValue<SignallingStrategy>(SIGNALLING_SETTING) === 'mqtt' ? 'mqtt' : 'nostr';
		const session = this.begin(newSessionCode(strategy), 'host', name);
		await this.clipboardService.writeText(session.invitation);
	}

	async joinSession(invitation?: string): Promise<void> {
		if (this.alreadyInSession()) {
			return;
		}
		let code = invitation ? parseSessionCode(invitation) : undefined;
		if (!code) {
			const text = await this.quickInputService.input({
				title: localize('collaboration.joinTitle', "Join Session"),
				prompt: localize('collaboration.joinPrompt', "Paste the invitation, or type the session code"),
				placeHolder: 'XXXXX-XXXXX-XXXXX-XXXXX',
				ignoreFocusLost: true,
				validateInput: async value => value.trim() && !parseSessionCode(value) ? localize('collaboration.noCode', "No session code here: it has four groups of five letters and digits.") : undefined,
			});
			code = text ? parseSessionCode(text) : undefined;
			if (!code) {
				return;
			}
		}
		const name = await this.askName();
		if (name) {
			this.begin(code, 'guest', name);
		}
	}

	async leaveSession(): Promise<void> {
		const session = this.session.value;
		if (!session?.isLive) {
			this.notificationService.info(localize('collaboration.notInSession', "You are not in a session. Start or join one from Compose > Collaboration."));
			return;
		}
		if (await this.confirmLeave(session)) {
			await session.leave();
		}
	}

	async copyInvitation(): Promise<void> {
		const session = this.session.value;
		if (!session?.isLive) {
			this.notificationService.info(localize('collaboration.notInSession', "You are not in a session. Start or join one from Compose > Collaboration."));
			return;
		}
		await this.clipboardService.writeText(session.invitation);
		this.notificationService.info(localize('collaboration.invitationCopied', "The invitation is in the clipboard: send it to the people you want to invite."));
	}

	async showParticipants(): Promise<void> {
		const session = this.session.value;
		if (!session?.isLive) {
			this.notificationService.info(localize('collaboration.notInSession', "You are not in a session. Start or join one from Compose > Collaboration."));
			return;
		}
		const connections = await session.stats();
		const items: IQuickPickItem[] = session.participantList().map(participant => {
			const connection = participant.you ? undefined : connections.find(item => item.name === participant.name);
			const roles = [participant.host ? localize('collaboration.hostRole', "host") : '', participant.you ? localize('collaboration.youRole', "you") : ''].filter(Boolean).join(', ');
			return { label: participant.name, description: roles, detail: connection ? describeConnection(connection) : undefined };
		});
		this.quickInputService.pick(items, { title: localize('collaboration.participantsTitle', "Participants ({0} of at most {1})", items.length, MAX_PARTICIPANTS) });
	}

	openChat(): void {
		if (this.page && !this.page.isDisposed()) {
			this.webviewWorkbenchService.revealWebview(this.page, this.page.group ?? this.editorGroupsService.activeGroup, false);
			return;
		}
		this.notificationService.info(localize('collaboration.notInSession', "You are not in a session. Start or join one from Compose > Collaboration."));
	}

	async connectionStats(): Promise<readonly IParticipantConnection[]> {
		return this.session.value?.stats() ?? [];
	}

	sharedSnapshot(resource: URI): ISharedSnapshot | undefined {
		return this.sharedEditors.snapshot(resource);
	}

	async shareEditor(editor: EditorInput): Promise<void> {
		const session = this.session.value;
		if (!session?.isLive) {
			this.notificationService.info(localize('collaboration.notInSession', "You are not in a session. Start or join one from Compose > Collaboration."));
			return;
		}
		const shared = await this.sharedEditors.capture(editor);
		if (!shared) {
			if (!shareableKind(editor)) {
				this.notificationService.info(localize('collaboration.cannotShare', "Only a text editor, a notebook or a Pluto notebook can be shared."));
			}
			return;
		}
		session.shareEditor(shared);
	}

	copyToMyEditor(resource: URI): Promise<void> {
		return this.sharedEditors.copyToMine(resource);
	}

	compareWithMine(resource: URI): Promise<void> {
		return this.sharedEditors.compareWithMine(resource);
	}

	async shareDataset(dataset: URI | { readonly fileName: string; readonly content: string }): Promise<void> {
		const session = this.session.value;
		if (!session?.isLive) {
			this.notificationService.info(localize('collaboration.notInSession', "You are not in a session. Start or join one from Compose > Collaboration."));
			return;
		}
		const read = URI.isUri(dataset) ? await this.sharedDatasets.read(dataset) : dataset;
		if (!read) {
			return;
		}
		const fileName = datasetFileName(read.fileName);
		const summary = summarizeCsv(read.content);
		if (!summary) {
			session.notice(localize('collaboration.datasetInvalid', "{0} is not a CSV dataset (it needs a header row), so it was not shared.", fileName));
			return;
		}
		if (await this.sharedDatasets.confirmShare(fileName, read.content, summary)) {
			session.shareDataset(fileName, read.content, summary.rows, summary.header.length);
		}
	}

	private alreadyInSession(): boolean {
		if (this.inSession) {
			this.notificationService.info(localize('collaboration.alreadyInSession', "You are already in a session: leave it first (Compose > Collaboration > Leave Session)."));
			this.openChat();
			return true;
		}
		return false;
	}

	private async askName(): Promise<string | undefined> {
		const name = await this.quickInputService.input({
			title: localize('collaboration.nameTitle', "Your Name"),
			prompt: localize('collaboration.namePrompt', "Your name, as the others in the session will see it"),
			value: this.storageService.get(NAME_STORAGE_KEY, StorageScope.APPLICATION, ''),
			ignoreFocusLost: true,
			validateInput: async value => value.trim() ? undefined : localize('collaboration.nameEmpty', "Please give a name."),
		});
		const trimmed = name?.trim().slice(0, 40);
		if (trimmed) {
			this.storageService.store(NAME_STORAGE_KEY, trimmed, StorageScope.APPLICATION, StorageTarget.USER);
		}
		return trimmed;
	}

	private async confirmLeave(session: Session): Promise<boolean> {
		const { confirmed } = await this.dialogService.confirm(session.role === 'host'
			? {
				message: localize('collaboration.confirmEnd', "End the session for everyone?"),
				detail: localize('collaboration.confirmEndDetail', "You host this session, so when you leave it ends for all participants. The chat is not kept."),
				primaryButton: localize({ key: 'collaboration.endButton', comment: ['&& denotes a mnemonic'] }, "&&End Session"),
			}
			: {
				message: localize('collaboration.confirmLeave', "Leave the session?"),
				detail: localize('collaboration.confirmLeaveDetail', "The chat is not kept."),
				primaryButton: localize({ key: 'collaboration.leaveButton', comment: ['&& denotes a mnemonic'] }, "&&Leave Session"),
			});
		return confirmed;
	}

	/** Opens a new chat page and starts the session in it. */
	private begin(code: ISessionCode, role: ParticipantRole, name: string): Session {
		const page = this.openPage();
		const session = new Session(
			code, role, name, page,
			() => this.clipboardService.writeText(this.session.value?.invitation ?? ''),
			() => this.commandService.executeCommand(TEST_CONNECTION_COMMAND_ID),
			() => this.leaveSession(),
			(sharer, shared) => this.sharedEditors.receive(sharer, shared).catch(error => this.notificationService.error(localize('collaboration.cannotShow', "Could not show {0}'s {1}: {2}", sharer, shared.fileName, String(error)))),
			(dataset, action) => {
				const done = action === 'preview' ? this.sharedEditors.preview(dataset.sharer, dataset.payload.fileName, dataset.payload.content)
					: action === 'save' ? this.sharedDatasets.save(dataset)
						: this.sharedDatasets.load(dataset);
				done.catch(error => this.notificationService.error(localize('collaboration.datasetActionFailed', "Could not use {0}'s {1}: {2}", dataset.sharer, dataset.payload.fileName, String(error))));
			},
			() => this.sharedDatasets.pick().then(picked => picked && this.shareDataset(picked)).catch(error => this.notificationService.error(String(error))),
			() => this.sharedDatasets.pickDatabase().then(picked => picked && this.session.value?.shareFile(picked.fileName, picked.content, true)).catch(error => this.notificationService.error(String(error))),
			(file, action) => (action === 'save' ? this.sharedDatasets.saveFile(file) : this.sharedDatasets.attachDatabase(file))
				.catch(error => this.notificationService.error(localize('collaboration.fileActionFailed', "Could not use {0}'s {1}: {2}", file.sharer, file.payload.fileName, String(error)))),
			(choice, value) => (choice === 'voiceLanguage' ? setVoiceLanguage : setVoiceWriteIn)(this.storageService, value),
		);
		this.session.value = session;
		session.onDidEnd(() => this._onDidChangeSession.fire());
		this._onDidChangeSession.fire();
		return session;
	}

	/** Removes the chat page's group, unless it is the only one. */
	private removePageGroup(group: IEditorGroup): void {
		if (this.editorGroupsService.getGroup(group.id) && this.editorGroupsService.count > 1) {
			this.editorGroupsService.removeGroup(group);
		}
	}

	/** The chat page, below the editors; one from an earlier session is replaced. */
	private openPage(): WebviewInput {
		this.pageDisposables.clear();
		const previousGroup = this.page?.group === undefined ? undefined : this.editorGroupsService.getGroup(this.page.group);
		this.page?.dispose();
		if (previousGroup?.isEmpty) {
			this.removePageGroup(previousGroup);
		}
		const title = localize('collaborationChat.title', "Collaboration Chat");
		// Always in its own group below the editors, locked so that the editors opened later go above it
		const activeGroup = this.editorGroupsService.activeGroup;
		const group = this.editorGroupsService.addGroup(activeGroup, GroupDirection.DOWN);
		const page = this.webviewWorkbenchService.openWebview(
			{
				title,
				options: { retainContextWhenHidden: true },
				contentOptions: { allowScripts: true, localResourceRoots: [COLLABORATION_MEDIA] },
				extension: undefined,
			},
			'pollis.collaborationChat',
			title,
			undefined,
			{ group, preserveFocus: false }
		);
		page.webview.setHtml(chatPageHtml(getVoiceLanguage(this.storageService), getVoiceWriteIn(this.storageService)));
		group.lock(true);
		this.pageDisposables.add(group.onDidCloseEditor(() => {
			// After the editor part, which removes an empty group itself when workbench.editor.closeEmptyGroups is on
			queueMicrotask(() => {
				if (group.isEmpty) {
					this.removePageGroup(group);
				}
			});
		}));
		// Closing the chat leaves the session, since the connection lives in it
		page.closeHandler = {
			showConfirm: () => !!this.session.value?.isLive,
			confirm: async () => {
				const session = this.session.value;
				if (!session?.isLive) {
					return ConfirmResult.DONT_SAVE;
				}
				if (!await this.confirmLeave(session)) {
					return ConfirmResult.CANCEL;
				}
				await session.leave();
				return ConfirmResult.DONT_SAVE;
			},
		};
		this.pageDisposables.add(page.webview.onDidDispose(() => {
			if (this.page === page) {
				this.page = undefined;
				this.session.value?.pageClosed();
				this.session.clear();
			}
		}));
		this.page = page;
		return page;
	}
}

/** A participant's connection in words: direct or through the relay, and the round trip. */
export function describeConnection(connection: IParticipantConnection): string {
	if (connection.direct === undefined) {
		return localize('collaboration.connecting', "Connecting...");
	}
	const kind = connection.direct
		? localize('collaboration.direct', "Direct connection")
		: localize('collaboration.relay', "Through the relay");
	return connection.roundTripMs === undefined ? kind : localize('collaboration.roundTrip', "{0}, {1} ms round trip", kind, connection.roundTripMs);
}
