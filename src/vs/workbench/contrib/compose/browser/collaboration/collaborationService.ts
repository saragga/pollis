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
import { ConfirmResult, IDialogService, IFileDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { createDecorator, IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { INotificationService, Severity } from '../../../../../platform/notification/common/notification.js';
import { IQuickInputService, IQuickPickItem, IQuickPickSeparator } from '../../../../../platform/quickinput/common/quickInput.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../../platform/storage/common/storage.js';
import { EditorInput } from '../../../../common/editor/editorInput.js';
import { GroupDirection, IEditorGroup, IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { ILifecycleService } from '../../../../services/lifecycle/common/lifecycle.js';
import { ITerminalInstanceService } from '../../../terminal/browser/terminal.js';
import { WebviewInput } from '../../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { ChatPageMessage, ChatWorkbenchMessage, chatPageHtml, COLLABORATION_MEDIA, IChatEntry, IChatGame, IChatParticipant, IPeerConnectionStats, trysteroBundleUrl } from './collaborationChat.js';
import { basename } from '../../../../../base/common/resources.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { COLLABORATION_APP_ID, envelope, Envelope, formatSessionCode, IByePayload, IChatPayload, base64Bytes, IAgentPayload, IDatasetSharedPayload, IEditorSharedPayload, IFileSharedPayload, IDecisionsPayload, IGamePayload, IGameResultsPayload, IGroupPayload, IHelloPayload, isAcceptableImage, ISettingsPayload, isDuckDbFile, isEnvelope, ISessionCode, MAX_DATASET_BYTES, MAX_FILE_BYTES, MAX_IMAGE_BYTES, MAX_PARTICIPANTS, MAX_RECEIVE_BYTES, MAX_SHARE_BYTES, newSessionCode, parseSessionCode, ParticipantRole, roomIdOf, seatRoomIdOf, SessionMode, CLASS_SEATS, SignallingStrategy } from './collaborationProtocol.js';
import { ISamePageLink, SamePageGuest, SamePageHost } from './collaborationSamePage.js';
import { datasetFileName, formatBytes, IReceivedDataset, IReceivedFile, SharedDatasets, sharedFileName, summarizeCsv } from './collaborationDatasets.js';
import { ISharedSnapshot, shareableKind, SharedEditors } from './collaborationEditors.js';
import { getVoiceLanguage, getVoiceWriteIn, setVoiceLanguage, setVoiceWriteIn } from '../composerVoice.js';
import { IWirePacket, ReliableDelivery } from './collaborationTransport.js';
import { IAgentLink, IAgentMaterial, SessionAgent, sessionAgentCells } from './collaborationAgent.js';
import { builtInCases, checkedGame, checkedTables, checkedValues, GameRun, IGameCase, loadCase } from './collaborationGame.js';
import { MODEL_ROUTING_COMMAND_ID } from '../modelRouting.js';
import { IOrchestrationCell } from '../orchestration.js';

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

	/** Starts a Same Page session, as its host, sharing a folder whose files everyone edits together. */
	startSamePageSession(): Promise<void>;

	/** Joins a session from a code or an invitation; asks for it when none is given. */
	joinSession(invitation?: string): Promise<void>;

	/** Leaves the session; for the host, after confirming, this ends it for everyone. */
	leaveSession(): Promise<void>;

	/** Copies the invitation to the clipboard. */
	copyInvitation(): Promise<void>;

	/** Lists the participants and their connections. */
	showParticipants(): Promise<void>;

	/** The host's settings of the session: whether it is locked and, in a Same Page session, who may edit; read-only for the others. */
	sessionSettings(): Promise<void>;

	/** Invites a coding agent, which answers in the session on this computer; when one is in it, offers to remove it. */
	inviteAgent(): Promise<void>;

	/** Starts a class, as its tutor, and copies the invitation (Classroom). */
	startClassSession(): Promise<void>;

	/** Whether a shared snapshot can be shown to the class: the tutor's, from a student. */
	canShowToClass(resource: URI): boolean;

	/** Shows a student's snapshot to the rest of the class (Show to the Class). */
	showToClass(resource: URI): void;

	/** The tutor splits the class into breakout groups at random, then moves students between them; again, to change the groups. */
	breakoutGroups(): Promise<void>;

	/** The tutor chooses the breakout group their messages and shares go to, or every group. */
	visitGroup(): Promise<void>;

	/** The tutor ends the breakout groups, so the class is one again. */
	bringEveryoneBack(): void;

	/** Starts a game from a case, as its facilitator, and copies the invitation (Simulation Games). */
	hostGame(): Promise<void>;

	/** Joins a game from its invitation: the same as joining a session. */
	joinGame(): Promise<void>;

	/** The facilitator starts the game, splitting the players into teams, or plays the round being decided. */
	nextRound(): Promise<void>;

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

/** An agent another participant invited, which runs on their computer. */
interface IRemoteAgent {
	readonly id: string;
	readonly name: string;
	/** The Trystero id of the participant who invited it. */
	readonly inviterId: string;
	readonly answering: boolean;
}

/** The most entries of the chat kept for an agent to read. */
const MAX_TRANSCRIPT = 500;

/** A student of a class, on the tutor's side, and their breakout group, 0 for none. */
interface IStudent {
	readonly peerId: string;
	readonly name: string;
	readonly group: number;
}

/** An item of Split into Breakout Groups or Visit a Group: a student, or a group. */
interface IGroupItem extends IQuickPickItem {
	readonly peerId?: string;
	readonly group?: number;
}

/** An item of Session Settings: Lock the Session, or a participant who may edit. */
interface ISettingItem extends IQuickPickItem {
	readonly peerId?: string;
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
	/** Everyone the host has admitted, who may come back after losing the connection even when the session is locked. */
	private readonly admittedBefore = new Set<string>();
	/** Session Settings, set by the host: no newcomers, and in a Same Page session the participants who may only watch. */
	private locked = false;
	private watching: ReadonlySet<string> = new Set<string>();
	private settingsReceived = false;
	/** The agent this participant invited, which runs here (Invite an Agent), and whether it is answering. */
	private readonly agent = this._register(new MutableDisposable<SessionAgent>());
	private agentAnswering = false;
	/** The agents the others invited, by id. */
	private readonly remoteAgents = new Map<string, IRemoteAgent>();
	/** The chat so far and what was shared, the latest of each by sharer and file name, for an agent to read. */
	private readonly transcript: string[] = [];
	private readonly material = new Map<string, IAgentMaterial>();
	/** In a class: on the tutor's side, the student in each seat; on a student's, the seat taken; and whether the chat is the class's. */
	private readonly seats = new Map<number, string>();
	private seat = 0;
	private classChat = false;
	/**
	 * Breakout groups: on the tutor's side, the number of groups (0 when there are none), each student's group by
	 * Trystero id, and the group the tutor visits; on a student's side, their group as the tutor last sent it.
	 */
	private groupCount = 0;
	private readonly groups = new Map<string, number>();
	private visitedGroup: number | undefined;
	private myGroup: IGroupPayload = {};
	/** In a game: on the facilitator's side, the game; on a player's, what the facilitator last sent. */
	private gameRun: GameRun | undefined;
	private gameView: IGamePayload | undefined;
	private readonly delivery: ReliableDelivery;
	private readonly pendingSends = new Map<number, DeferredPromise<void>>();
	private readonly pendingStats = new Map<number, DeferredPromise<readonly IPeerConnectionStats[]>>();
	private readonly waitTimer = this._register(new MutableDisposable());
	/** In a Same Page session, the shared folder's files: the host's side or another participant's. */
	private readonly samePage = this._register(new MutableDisposable<SamePageHost | SamePageGuest>());
	private readonly samePageListener = this._register(new MutableDisposable());
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
		/** The way of working: the host's choice, which another participant learns from the host's hello. */
		private mode: SessionMode,
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
		/** Called when the host's hello says that this is a Same Page session, with the host and the folder it shares. */
		private readonly onSamePage: (hostId: string, folder: string) => void,
		/** Called when the facilitator of a game presses Next Round in the chat page. */
		private readonly onNextRound: () => void,
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
		const host = this.role === 'host' ? this.name : this.hostName;
		if (this.isGame) {
			return localize('collaboration.invitationGame', "{0} invites you to play {1}, a Pollis simulation game. In Pollis, choose Compose > Collaboration > Simulation Games > Join a Game... and paste this invitation, or the code: {2}", host, this.gameRun?.gameCase.title ?? '', formatSessionCode(this.code));
		}
		if (this.mode === 'class') {
			return localize('collaboration.invitationClass', "{0} invites you to a Pollis class. In Pollis, choose Compose > Collaboration > Join Session... and paste this invitation, or the code: {1}", host, formatSessionCode(this.code));
		}
		return this.mode === 'samePage'
			? localize('collaboration.invitationSamePage', "{0} invites you to a Pollis Same Page session, to edit the files of {1} together. In Pollis, choose Compose > Collaboration > Join Session... and paste this invitation, or the code: {2}", host, this.samePage.value?.folderName ?? '', formatSessionCode(this.code))
			: localize('collaboration.invitation', "{0} invites you to a Pollis Side by Side session. In Pollis, choose Compose > Collaboration > Join Session... and paste this invitation, or the code: {1}", host, formatSessionCode(this.code));
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
		this.agent.clear();
		if (this.samePage.value) {
			this.samePage.clear();
			this.post({ command: 'filesClosed' });
			if (this.role !== 'host') {
				this.notice(localize('collaboration.samePageEnded', "The files of the session that are open here can no longer be saved: Save As keeps a copy of one on this computer."));
			}
		}
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

	/** What the files of a Same Page session use of the session: sending, and who is there. */
	get samePageLink(): ISamePageLink {
		return {
			send: (type, payload, peers) => {
				if (!this.ended && peers.length) {
					this.delivery.send(type, envelope(type, payload) as unknown as IJson, peers);
				}
			},
			others: () => [...this.participants.keys()],
			nameOf: peerId => this.participants.get(peerId)?.name,
			canEdit: peerId => !this.watching.has(peerId),
			notice: text => this.notice(text),
		};
	}

	/** Gives the session the files of a Same Page session, and shows them in the chat page. */
	attachSamePage(side: SamePageHost | SamePageGuest): void {
		this.samePage.value = side;
		this.samePageListener.value = side.onDidChangeFolder(() => this.post({ command: 'filesChanged' }));
		this.postFilesPanel();
	}

	participantList(): readonly IChatParticipant[] {
		return [
			{ peerId: this.selfId ?? '', name: this.name, host: this.role === 'host', you: true, watching: !!this.selfId && this.watching.has(this.selfId), agent: false, answering: false },
			...[...this.participants.values()].map(participant => ({ peerId: participant.peerId, name: participant.name, host: participant.role === 'host', you: false, watching: this.watching.has(participant.peerId), agent: false, answering: false })),
			...(this.agent.value ? [{ peerId: '', name: agentDisplayName(this.agent.value.name, this.name), host: false, you: false, watching: false, agent: true, answering: this.agentAnswering }] : []),
			...[...this.remoteAgents.values()].map(agent => ({ peerId: '', name: agentDisplayName(agent.name, this.participants.get(agent.inviterId)?.name ?? ''), host: false, you: false, watching: false, agent: true, answering: agent.answering })),
		];
	}

	/** The names in the session, people's and agents', which a new agent's name must differ from. */
	namesInUse(): string[] {
		return [this.name, ...[...this.participants.values()].map(participant => participant.name), ...(this.agent.value ? [this.agent.value.name] : []), ...[...this.remoteAgents.values()].map(agent => agent.name)];
	}

	// ---- The agent this participant invited ----

	get invitedAgent(): SessionAgent | undefined {
		return this.agent.value;
	}

	/** What the agent this participant invites uses of the session. */
	get agentLink(): IAgentLink {
		return {
			transcript: () => this.transcript.join('\n\n') + '\n',
			material: () => [...this.material.values()],
			setAnswering: answering => {
				this.agentAnswering = answering;
				this.sendAgent(answering ? 'answering' : 'present', [...this.participants.keys()]);
				this.postParticipants();
			},
			answer: (text, files) => this.agentAnswer(text, files),
			notice: text => this.notice(text),
		};
	}

	inviteAgent(agent: SessionAgent): void {
		if (this.ended) {
			agent.dispose();
			return;
		}
		this.agent.value = agent;
		this.agentAnswering = false;
		this.sendAgent('present', [...this.participants.keys()]);
		this.notice(localize('collaboration.agentInvited', "You invited {0}: anyone in the session can ask it something by starting a message with @{0}. It answers on this computer, at your cost, or for nothing on a local model.", agent.name));
		this.postParticipants();
	}

	removeAgent(): void {
		const agent = this.agent.value;
		if (!agent) {
			return;
		}
		this.sendAgent('left', [...this.participants.keys()]);
		this.agent.clear();
		this.notice(localize('collaboration.agentRemoved', "{0} left the session.", agent.name));
		this.postParticipants();
	}

	private sendAgent(state: IAgentPayload['state'], peers: readonly string[]): void {
		const agent = this.agent.value;
		if (agent && !this.ended && peers.length) {
			const payload: IAgentPayload = { id: agent.id, name: agent.name, state };
			this.delivery.send('agent', envelope<Envelope & { type: 'agent' }>('agent', payload) as unknown as IJson, peers);
		}
	}

	/** The agent's answer: shown here and sent to everyone as from the agent, with the files it wrote as snapshots. */
	private agentAnswer(text: string, files: readonly { readonly fileName: string; readonly content: string }[]): void {
		const agent = this.agent.value;
		if (!agent || this.ended) {
			return;
		}
		const name = agentDisplayName(agent.name, this.name);
		this.record(name, text);
		this.post({ command: 'show', entry: { kind: 'message', name, text, time: Date.now() } });
		const peers = [...this.participants.keys()];
		if (peers.length) {
			const chat: IChatPayload = { id: generateUuid(), text, agent: agent.id };
			this.delivery.send('chat', envelope<Envelope & { type: 'chat' }>('chat', chat) as unknown as IJson, peers);
		}
		for (const file of files) {
			const shared: IEditorSharedPayload = { fileName: file.fileName, kind: 'text', content: file.content, agent: agent.id };
			this.keepMaterial(name, file.fileName, file.content);
			this.notice(localize('collaboration.agentShared', "{0} shared {1}.", name, file.fileName));
			this.onEditorShared(name, shared);
			if (peers.length) {
				this.delivery.send('editorShared', envelope<Envelope & { type: 'editorShared' }>('editorShared', shared) as unknown as IJson, peers);
			}
		}
	}

	/** A message, for the agent: kept in the chat it reads, and, when it asks the agent something, passed to it. */
	private record(name: string, text: string, ask = false): void {
		const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		this.transcript.push(`**${name}** (${time}): ${text}`);
		if (this.transcript.length > MAX_TRANSCRIPT) {
			this.transcript.shift();
		}
		const agent = this.agent.value;
		if (ask && agent?.isAskedIn(text)) {
			agent.ask(name, text);
		}
	}

	private keepMaterial(sharer: string, fileName: string, content: string): void {
		this.material.set(`${sharer}/${fileName}`, { sharer, fileName, content });
	}

	/** An agent another participant invited joined, started or stopped answering, or left. */
	private onAgent(peerId: string, payload: IAgentPayload): void {
		const inviter = this.participants.get(peerId);
		if (!inviter || typeof payload.id !== 'string' || typeof payload.name !== 'string' || !payload.name.trim()) {
			return;
		}
		const existing = this.remoteAgents.get(payload.id);
		if (existing && existing.inviterId !== peerId) {
			return;
		}
		const name = payload.name.trim().slice(0, 40);
		if (payload.state === 'left') {
			if (existing) {
				this.remoteAgents.delete(payload.id);
				this.notice(localize('collaboration.agentLeft', "{0} left the session.", agentDisplayName(existing.name, inviter.name)));
			}
		} else {
			this.remoteAgents.set(payload.id, { id: payload.id, name, inviterId: peerId, answering: payload.state === 'answering' });
			if (!existing) {
				this.notice(localize('collaboration.agentJoined', "{0} invited {1}, an agent: ask it something by starting a message with @{1}.", inviter.name, name));
			}
		}
		this.postParticipants();
	}

	/** On the tutor's side, the seat of a student who left is free again. */
	private freeSeatOf(peerId: string): void {
		for (const [seat, student] of [...this.seats]) {
			if (student === peerId) {
				this.seats.delete(seat);
			}
		}
	}

	/** The agents of a participant who left go with them. */
	private dropAgentsOf(peerId: string): void {
		for (const agent of [...this.remoteAgents.values()]) {
			if (agent.inviterId === peerId) {
				this.remoteAgents.delete(agent.id);
			}
		}
	}

	/** The name of an agent another participant invited, as an agent's message or snapshot shows it; undefined when unknown. */
	private remoteAgentName(peerId: string, agentId: string): string | undefined {
		const agent = this.remoteAgents.get(agentId);
		const inviter = this.participants.get(peerId);
		return agent && inviter && agent.inviterId === peerId ? agentDisplayName(agent.name, inviter.name) : undefined;
	}

	get isSamePage(): boolean {
		return this.mode === 'samePage';
	}

	get isClass(): boolean {
		return this.mode === 'class';
	}

	get hasClassChat(): boolean {
		return this.classChat;
	}

	get isLocked(): boolean {
		return this.locked;
	}

	// ---- Breakout groups, on the tutor's side; the tutor passes on each student's messages and shares within the group ----

	get breakoutGroupCount(): number {
		return this.groupCount;
	}

	get visitedBreakoutGroup(): number | undefined {
		return this.visitedGroup;
	}

	/** The students in the class, with their breakout groups. */
	students(): IStudent[] {
		return [...this.participants.values()].filter(participant => participant.role !== 'host').map(participant => ({ peerId: participant.peerId, name: participant.name, group: this.groupCount ? this.groups.get(participant.peerId) ?? 0 : 0 }));
	}

	/** The breakout group of a student, on the tutor's side, or 0 for none. */
	groupOf(peerId: string): number {
		return this.role === 'host' && this.groupCount ? this.groups.get(peerId) ?? 0 : 0;
	}

	/** The tutor starts or changes the breakout groups: tells each student their group and who is in it. */
	startGroups(count: number, assignment: ReadonlyMap<string, number>): void {
		if (this.role !== 'host' || this.mode !== 'class' || this.ended) {
			return;
		}
		const starting = !this.groupCount;
		const before = new Map(this.groups);
		this.groups.clear();
		for (const [peerId, group] of assignment) {
			if (this.participants.has(peerId) && group >= 1 && group <= count) {
				this.groups.set(peerId, group);
			}
		}
		this.groupCount = count;
		if (this.visitedGroup !== undefined && this.visitedGroup > count) {
			this.visitedGroup = undefined;
		}
		this.notice(starting
			? (this.isGame
				? localize('collaboration.teamsStarted', "The players are in {0} teams. A player's messages, and what they share, go to their team and to you; your own go to every team until you visit one (Visit a Group...).", count)
				: localize('collaboration.groupsStarted', "The class is in {0} breakout groups. A student's messages, and what they share, go to their group and to you; your own go to every group until you visit one (Visit a Group...).", count))
			: (this.isGame
				? localize('collaboration.teamsChanged', "The teams have changed.")
				: localize('collaboration.groupsChanged', "The breakout groups have changed.")));
		for (let group = 1; group <= count; group++) {
			const names = this.students().filter(student => student.group === group).map(student => student.name);
			this.notice(names.length
				? localize('collaboration.groupList', "{0}: {1}.", this.groupLabel(group), names.join(', '))
				: localize('collaboration.groupEmpty', "{0}: nobody yet.", this.groupLabel(group)));
		}
		this.sendGroups([...new Set([...before.keys(), ...this.groups.keys()])]);
		this.sendGame(this.students().map(student => student.peerId));
		this.postGame();
	}

	/** The tutor visits a breakout group, whose members alone then get the tutor's messages and shares, or none, for every group. */
	visitGroup(group: number | undefined): void {
		if (this.role !== 'host' || !this.groupCount || this.ended || group === this.visitedGroup) {
			return;
		}
		const previous = this.visitedGroup;
		this.visitedGroup = group;
		this.notice(group !== undefined
			? localize('collaboration.visiting', "You are visiting {0}: your messages, and what you share, go to it alone. You still see the messages of every one.", this.groupLabel(group))
			: localize('collaboration.visitingNone', "Your messages, and what you share, go to everyone again."));
		this.sendGroups([...this.groups].filter(([, member]) => member === previous || member === group).map(([peerId]) => peerId));
	}

	/** The tutor ends the breakout groups. */
	endGroups(): void {
		if (this.role !== 'host' || !this.groupCount || this.ended) {
			return;
		}
		const grouped = [...this.groups.keys()];
		this.groupCount = 0;
		this.groups.clear();
		this.visitedGroup = undefined;
		this.notice(localize('collaboration.groupsEnded', "Everyone is back in the class."));
		this.sendGroups(grouped);
	}

	/** Tells each of these students their breakout group as it is now. */
	private sendGroups(peers: readonly string[]): void {
		for (const peerId of peers) {
			if (this.participants.has(peerId)) {
				const group = this.groupOf(peerId);
				const payload: IGroupPayload = group
					? { group, members: this.groupMates(peerId).map(mate => this.participants.get(mate)!.name), visiting: this.visitedGroup === group }
					: {};
				this.delivery.send('group', envelope<Envelope & { type: 'group' }>('group', payload) as unknown as IJson, [peerId]);
			}
		}
	}

	/** A group's name: Group 2, or in a game Team 2. */
	groupLabel(group: number): string {
		return this.isGame
			? (this.gameRun?.teamName(group) ?? localize('collaboration.teamLabel', "Team {0}", group))
			: localize('collaboration.groupLabel', "Group {0}", group);
	}

	/** On the tutor's side, the others in a student's breakout group, to whom the student's messages and shares are passed on. */
	private groupMates(peerId: string): string[] {
		const group = this.groupOf(peerId);
		return group ? [...this.groups].filter(([other, member]) => member === group && other !== peerId && this.participants.has(other)).map(([other]) => other) : [];
	}

	/** A student's name as the tutor's chat shows it while the class is in breakout groups: with their group. */
	private withGroup(peerId: string, name: string): string {
		const group = this.groupOf(peerId);
		return group ? localize('collaboration.nameInGroup', "{0} ({1})", name, this.groupLabel(group)) : name;
	}

	/** Who what this participant sends goes to: everyone, or, for a tutor visiting a breakout group, that group. */
	private recipients(): string[] {
		if (this.role === 'host' && this.groupCount && this.visitedGroup !== undefined) {
			return [...this.groups].filter(([peerId, group]) => group === this.visitedGroup && this.participants.has(peerId)).map(([peerId]) => peerId);
		}
		return [...this.participants.keys()];
	}

	/** On a student's side, the breakout group the tutor sent: says in the chat what changed. */
	private onGroup(payload: IGroupPayload): void {
		const group = typeof payload.group === 'number' && Number.isInteger(payload.group) && payload.group >= 1 && payload.group <= CLASS_SEATS ? payload.group : undefined;
		const members = group && Array.isArray(payload.members)
			? payload.members.filter(member => typeof member === 'string' && member.trim()).slice(0, CLASS_SEATS).map(member => member.trim().slice(0, 40))
			: [];
		const visiting = !!group && payload.visiting === true;
		const before = this.myGroup;
		this.myGroup = group ? { group, members, visiting } : {};
		const tutor = this.hostName;
		if (!group) {
			if (before.group) {
				this.notice(localize('collaboration.backInClass', "{0} brought everyone back to the class: your messages, and what you share, go to {0}, the tutor, again, unless the class chat is on.", tutor));
			}
			return;
		}
		const label = this.groupLabel(group);
		if (group !== before.group) {
			this.notice(this.isGame
				? (members.length
					? localize('collaboration.inTeam', "You are in {0}, with {1}: your messages, and what you share, now go to your team and to {2}, who runs the game.", label, members.join(', '), tutor)
					: localize('collaboration.inTeamAlone', "You are in {0}, alone for now: your messages, and what you share, go to {1}, who runs the game.", label, tutor))
				: (members.length
					? localize('collaboration.inGroup', "You are in {0}, with {1}: your messages, and what you share, now go to your group and to {2}, the tutor.", label, members.join(', '), tutor)
					: localize('collaboration.inGroupAlone', "You are in {0}, alone for now: your messages, and what you share, go to {1}, the tutor.", label, tutor)));
		} else if (members.join('\n') !== (before.members ?? []).join('\n')) {
			this.notice(members.length
				? localize('collaboration.groupNow', "{0} is now you and {1}.", label, members.join(', '))
				: localize('collaboration.groupNowAlone', "You are alone in {0} for now.", label));
		}
		if (visiting && (!before.visiting || group !== before.group)) {
			this.notice(this.isGame
				? localize('collaboration.facilitatorVisits', "{0}, who runs the game, is visiting your team: their messages now come to your team alone.", tutor)
				: localize('collaboration.tutorVisits', "{0}, the tutor, is visiting your group: their messages now come to your group alone.", tutor));
		} else if (!visiting && before.visiting && group === before.group) {
			this.notice(this.isGame
				? localize('collaboration.facilitatorLeftTeam', "{0}, who runs the game, left your team.", tutor)
				: localize('collaboration.tutorLeftGroup', "{0}, the tutor, left your group.", tutor));
		}
	}

	/** The host changes the settings: tells everyone, and says in the chat what changed. */
	changeSettings(locked: boolean, watching: ReadonlySet<string>, classChat: boolean): void {
		if (this.role !== 'host' || this.ended) {
			return;
		}
		// A watcher whose connection dropped stays one when they come back
		const absent = [...this.watching].filter(peerId => !this.participants.has(peerId));
		this.applySettings({ locked, watching: this.mode === 'samePage' ? [...watching, ...absent] : [], classChat: this.mode === 'class' && classChat }, true);
		this.sendSettings([...this.participants.keys()]);
	}

	private sendSettings(peers: readonly string[]): void {
		if (peers.length) {
			const settings: ISettingsPayload = { locked: this.locked, watching: [...this.watching], classChat: this.classChat };
			this.delivery.send('settings', envelope<Envelope & { type: 'settings' }>('settings', settings) as unknown as IJson, peers);
		}
	}

	/** Takes the settings, from the host's choice or from the host, and says in the chat what changed. */
	private applySettings(settings: ISettingsPayload, announce: boolean): void {
		const watching = new Set(Array.isArray(settings.watching) ? settings.watching.filter(peerId => typeof peerId === 'string') : []);
		const locked = settings.locked === true;
		const classChat = settings.classChat === true;
		if (announce && locked !== this.locked) {
			this.notice(locked
				? localize('collaboration.locked', "The session is locked: nobody else can join, even with the invitation.")
				: localize('collaboration.unlocked', "The session is open again: anyone with the invitation can join."));
		}
		if (this.mode === 'class' && (announce || classChat) && classChat !== this.classChat) {
			this.notice(classChat
				? localize('collaboration.classChatOn', "The class chat is on: everyone in the class sees every message.")
				: localize('collaboration.classChatOff', "The class chat is off: a student's messages go to the tutor only."));
		}
		this.classChat = classChat;
		for (const participant of this.participantList()) {
			const was = !!participant.peerId && this.watching.has(participant.peerId);
			const is = !!participant.peerId && watching.has(participant.peerId);
			if (was === is || (!announce && !participant.you)) {
				continue;
			}
			this.notice(participant.you
				? (is ? localize('collaboration.youWatch', "You can now only watch the files: they are read-only for you.") : localize('collaboration.youEdit', "You can edit the files again."))
				: (is ? localize('collaboration.otherWatches', "{0} can now only watch the files.", participant.name) : localize('collaboration.otherEdits', "{0} can edit the files again.", participant.name)));
		}
		this.locked = locked;
		this.watching = watching;
		if (this.samePage.value instanceof SamePageGuest) {
			this.samePage.value.setCanEdit(!this.selfId || !watching.has(this.selfId));
		}
		this.postParticipants();
	}

	// ---- A game (Simulation Games): a class whose breakout groups are its teams; the model runs on the facilitator's computer ----

	get isGame(): boolean {
		return this.code.kind === 'game';
	}

	get hostedGame(): GameRun | undefined {
		return this.gameRun;
	}

	/** The facilitator's copy takes the game it runs. */
	hostGame(run: GameRun): void {
		this.gameRun = run;
		this.postGame();
	}

	/** The facilitator starts the game: the model's state before the first round, and the teams, which are the breakout groups. */
	async startGame(count: number, assignment: ReadonlyMap<string, number>): Promise<void> {
		const run = this.gameRun;
		if (!run || this.role !== 'host' || this.ended || run.round) {
			return;
		}
		this.postGame(true);
		try {
			await run.start(count);
		} finally {
			this.postGame();
		}
		if (this.ended) {
			return;
		}
		this.startGroups(count, assignment);
		this.notice(localize('collaboration.roundOpen', "{0} is open: each team submits its decisions, and Next Round plays it.", run.roundName(run.round)));
	}

	/** The facilitator plays the round with every team's decisions, sends the results, and opens the next round. */
	async playRound(): Promise<void> {
		const run = this.gameRun;
		if (!run || this.role !== 'host' || this.ended || run.round < 1 || run.isOver) {
			return;
		}
		const round = run.round;
		this.postGame(true);
		let results;
		try {
			results = await run.play();
		} finally {
			this.postGame();
		}
		if (this.ended) {
			return;
		}
		const own = run.teams.map(team => results.private.get(team.team)).filter(table => table !== undefined);
		this.post({ command: 'show', entry: { kind: 'message', name: this.name, text: results.text ?? '', tables: [results.public, ...own], time: Date.now() } });
		for (const student of this.students()) {
			const table = student.group ? results.private.get(student.group) : undefined;
			const payload: IGameResultsPayload = results.text ? { round, text: results.text, tables: table ? [results.public, table] : [results.public] } : { round, tables: table ? [results.public, table] : [results.public] };
			this.delivery.send('gameResults', envelope<Envelope & { type: 'gameResults' }>('gameResults', payload) as unknown as IJson, [student.peerId]);
		}
		this.notice(run.isOver
			? localize('collaboration.gameOver', "{0} was the last: the game is over. Its rounds are in {1}.", run.roundName(round), run.folderPath)
			: localize('collaboration.roundOpen', "{0} is open: each team submits its decisions, and Next Round plays it.", run.roundName(run.round)));
		this.sendGame(this.students().map(student => student.peerId));
		this.postGame();
	}

	/** Tells each of these players the game as it is now: the round, their team and its decisions. */
	private sendGame(peers: readonly string[]): void {
		const run = this.gameRun;
		if (!run || this.role !== 'host' || this.ended) {
			return;
		}
		for (const peerId of peers) {
			if (!this.participants.has(peerId)) {
				continue;
			}
			const team = run.round ? this.groupOf(peerId) : 0;
			const submittedBy = team ? run.submittedBy(team) : undefined;
			const payload: IGamePayload = {
				title: run.gameCase.title,
				description: run.gameCase.description,
				roundLabel: run.gameCase.roundLabel,
				rounds: run.gameCase.rounds,
				round: run.round,
				decisions: run.gameCase.decisions,
				...(team ? { team, teamName: run.teamName(team), values: run.values(team) } : {}),
				...(submittedBy ? { submittedBy } : {}),
			};
			this.delivery.send('game', envelope<Envelope & { type: 'game' }>('game', payload) as unknown as IJson, [peerId]);
		}
	}

	/** On the facilitator's side, a player's decisions for their team; the last submitted before the round is played counts. */
	private onDecisions(peerId: string, payload: IDecisionsPayload): void {
		const run = this.gameRun;
		const participant = this.participants.get(peerId);
		const team = this.groupOf(peerId);
		if (!run || !participant || !team || run.isRunning || run.round < 1 || run.isOver || payload.round !== run.round) {
			return;
		}
		run.submit(team, payload.values, participant.name);
		this.notice(localize('collaboration.decisionsIn', "{0} submitted the decisions of {1} for {2}.", participant.name, run.teamName(team), run.roundName(run.round)));
		this.sendGame([peerId, ...this.groupMates(peerId)]);
		this.postGame();
	}

	/** On a player's side, the game as the facilitator sent it: says in the chat what changed. */
	private onGame(payload: IGamePayload): void {
		const view = checkedGame(payload);
		if (!view) {
			return;
		}
		const before = this.gameView;
		this.gameView = view;
		const round = localize('collaboration.roundName', "{0} {1}", view.roundLabel, view.round);
		if (view.round !== before?.round) {
			if (view.round > view.rounds) {
				this.notice(localize('collaboration.gameOverPlayer', "The game is over."));
			} else if (view.round >= 1) {
				this.notice(localize('collaboration.roundOpenPlayer', "{0} is open: your team's decisions are beside the chat. The last submitted before {1} plays the round counts.", round, this.hostName));
			}
		} else if (view.submittedBy && (view.submittedBy !== before.submittedBy || JSON.stringify(view.values) !== JSON.stringify(before.values))) {
			this.notice(localize('collaboration.teamSubmitted', "{0} submitted your team's decisions for {1}.", view.submittedBy, round));
		}
		this.postGame();
	}

	/** On a player's side, the results of a round: the table everyone sees and the team's own. */
	private onGameResults(payload: IGameResultsPayload): void {
		const tables = checkedTables(payload.tables);
		if (tables.length) {
			const text = typeof payload.text === 'string' ? payload.text.slice(0, 2000) : '';
			this.post({ command: 'show', entry: { kind: 'message', name: this.hostName, text, tables, time: Date.now() } });
		}
	}

	/** A player submits their team's decisions from the chat page. */
	private submitDecisions(values: unknown): void {
		const view = this.gameView;
		if (this.ended || !view?.team || view.round < 1 || view.round > view.rounds || !this.hostId) {
			return;
		}
		const payload: IDecisionsPayload = { round: view.round, values: checkedValues(view.decisions, values, view.values ?? {}) };
		this.delivery.send('decisions', envelope<Envelope & { type: 'decisions' }>('decisions', payload) as unknown as IJson, [this.hostId]);
	}

	/** Shows the game beside the chat: to the facilitator, the teams and who submitted; to a player, their team's decisions. */
	private postGame(running = false): void {
		const run = this.gameRun;
		let game: IChatGame | undefined;
		if (run && this.role === 'host') {
			const students = this.students();
			game = {
				title: run.gameCase.title,
				description: run.gameCase.description,
				roundLabel: run.gameCase.roundLabel,
				rounds: run.gameCase.rounds,
				round: run.round,
				facilitator: true,
				running: running || run.isRunning,
				waiting: students.filter(student => !student.group).map(student => student.name),
				teams: run.teams.map(team => ({ name: team.name, members: students.filter(student => student.group === team.team).map(student => student.name), submittedBy: run.submittedBy(team.team) })),
			};
		} else if (this.gameView) {
			game = { ...this.gameView, facilitator: false };
		}
		if (game) {
			this.post({ command: 'game', game });
		}
	}

	// ---- The chat page ----

	private post(message: ChatPageMessage): void {
		this.page.webview.postMessage(message);
	}

	private async onPageMessage(message: ChatWorkbenchMessage): Promise<void> {
		switch (message.command) {
			case 'ready':
				this.postFilesPanel();
				if (this.mode !== 'class') {
					this.joinRoom('session', await roomIdOf(this.code));
				} else if (this.role === 'host') {
					// The tutor sits in every seat's room, where one student each meets them
					for (let seat = 1; seat <= CLASS_SEATS; seat++) {
						this.joinRoom(`seat:${seat}`, await seatRoomIdOf(this.code, seat));
					}
				} else {
					await this.takeSeat(1 + Math.floor(Math.random() * CLASS_SEATS));
				}
				this.postParticipants();
				this.postGame();
				this.setStatus(this.role === 'host'
					? localize('collaboration.waitingForOthers', "Waiting for others to join: send them the invitation (Copy Invitation).")
					: localize('collaboration.joining', "Joining the session..."));
				if (this.role === 'host') {
					this.notice(this.isGame && this.gameRun
						? localize('collaboration.gameStarted', "Game started: {0}. The invitation is in the clipboard: send it to the players. Up to {1} can join. When they have, Next Round, beside the chat, splits them into teams and opens {2}.", this.gameRun.gameCase.title, CLASS_SEATS, this.gameRun.roundName(1))
						: this.mode === 'class'
							? localize('collaboration.classStarted', "Class started. The invitation is in the clipboard: send it to the class, for example on the course page. Up to {0} students can join. Each student is connected to you only: what they share comes to you, and what you share goes to the whole class.", CLASS_SEATS)
							: localize('collaboration.started', "Session started. The invitation is in the clipboard: send it to the others by email or in a message. Anyone with it can join, up to {0} participants.", MAX_PARTICIPANTS));
				} else {
					this.waitToJoin();
				}
				break;
			case 'joined':
				this.selfId = message.selfId;
				break;
			case 'joinError':
				this.end(localize('collaboration.joinError', "Could not join the session: {0}", message.error));
				break;
			case 'peerJoin':
				this.onPeerJoin(message.peerId, message.key);
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
			case 'listFolder': {
				const side = this.samePage.value;
				if (side && typeof message.path === 'string') {
					side.list(message.path).then(
						entries => this.post({ command: 'folder', path: message.path, entries }),
						error => this.post({ command: 'folder', path: message.path, entries: [], error: String(error?.message ?? error) }),
					);
				}
				break;
			}
			case 'submitDecisions':
				this.submitDecisions(message.values);
				break;
			case 'nextRound':
				if (this.role === 'host' && this.gameRun) {
					this.onNextRound();
				}
				break;
			case 'openFile':
				if (this.samePage.value && typeof message.path === 'string') {
					this.samePage.value.openInEditor(message.path).catch(error => this.notice(localize('collaboration.cannotOpen', "Could not open {0}: {1}", message.path, String(error?.message ?? error))));
				}
				break;
		}
	}

	private postFilesPanel(): void {
		const side = this.samePage.value;
		if (side) {
			this.post({ command: 'filesPanel', folder: side.folderName });
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
		this.post({ command: 'participants', participants: this.participantList() });
		if (this.gameRun) {
			this.postGame();
		}
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

	private joinRoom(key: string, roomId: string): void {
		this.post({ command: 'join', bundleUrl: trysteroBundleUrl(this.code.strategy), appId: COLLABORATION_APP_ID, roomId, password: this.code.code, key });
	}

	private waitToJoin(): void {
		this.startWaiting(JOIN_TIMEOUT, () => this.end(localize('collaboration.notReached', "Could not reach the session. Check the code, and that the person who invited you is still in the session; Test Connection shows whether this network lets Pollis through.")));
	}

	/** A student sits in a seat of the class: joins its room, where the tutor admits them, or sends them to a free seat. */
	private async takeSeat(seat: number): Promise<void> {
		this.seat = seat;
		this.joinRoom('seat', await seatRoomIdOf(this.code, seat));
	}

	/** The seats of a class that no student holds, on the tutor's side. */
	private freeSeats(): number[] {
		const free: number[] = [];
		for (let seat = 1; seat <= CLASS_SEATS; seat++) {
			const holder = this.seats.get(seat);
			if (!holder || (!this.participants.has(holder) && !this.admitting.has(holder))) {
				free.push(seat);
			}
		}
		return free;
	}

	private hello(refused?: IHelloPayload['refused'] | false): IJson {
		const folder = this.role === 'host' && this.mode === 'samePage' ? this.samePage.value?.folderName : undefined;
		const admission = refused === undefined ? {} : refused === 'seatTaken' ? { admitted: false, refused, freeSeats: this.freeSeats() } : refused ? { admitted: false, refused } : { admitted: true };
		const payload: IHelloPayload = { name: this.name, role: this.role, language, mode: this.mode, ...(folder === undefined ? {} : { folder }), ...admission };
		return envelope<Envelope & { type: 'hello' }>('hello', payload) as unknown as IJson;
	}

	private onPeerJoin(peerId: string, key: string): void {
		if (this.ended) {
			return;
		}
		if (this.mode === 'class') {
			this.onClassPeerJoin(peerId, key);
			return;
		}
		this.connected.add(peerId);
		if (this.role === 'host') {
			const refused = this.participants.size + this.admitting.size + 1 >= MAX_PARTICIPANTS ? 'full'
				: this.locked && !this.admittedBefore.has(peerId) ? 'locked'
					: false;
			if (!refused) {
				this.admitting.add(peerId);
			}
			this.delivery.send('hello', this.hello(refused), [peerId]);
		} else if (this.admitted) {
			this.delivery.send('hello', this.hello(), [peerId]);
		}
	}

	/**
	 * Someone met in a room of a class. The tutor admits a student to a free seat, or, when someone holds it, sends
	 * them to a free one; a student waits for the tutor's hello, and never says hello to another student met there.
	 */
	private onClassPeerJoin(peerId: string, key: string): void {
		if (this.role !== 'host') {
			this.connected.add(peerId);
			if (this.admitted && peerId === this.hostId) {
				// The tutor is back after the connection dropped
				this.delivery.send('hello', this.hello(), [peerId]);
			}
			return;
		}
		const seat = Number(/^seat:(?<seat>\d+)$/.exec(key)?.groups?.seat);
		if (!seat) {
			return;
		}
		if (this.connected.has(peerId)) {
			// Met again, in another seat: a new connection, whose messages start afresh
			this.delivery.removePeer(peerId);
		}
		this.connected.add(peerId);
		const holder = this.seats.get(seat);
		if (holder && holder !== peerId && (this.participants.has(holder) || this.admitting.has(holder))) {
			this.delivery.send('hello', this.hello('seatTaken'), [peerId]);
			return;
		}
		for (const [other, student] of [...this.seats]) {
			if (student === peerId && other !== seat) {
				this.seats.delete(other);
			}
		}
		this.seats.set(seat, peerId);
		const refused = this.locked && !this.admittedBefore.has(peerId) ? 'locked' : false;
		if (!refused) {
			this.admitting.add(peerId);
		}
		this.delivery.send('hello', this.hello(refused), [peerId]);
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
		this.dropAgentsOf(peerId);
		this.samePage.value?.peerLeft(peerId);
		this.freeSeatOf(peerId);
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
			if (hello.admitted === false && hello.refused === 'seatTaken' && this.mode === 'class') {
				this.moveSeat(peerId, Array.isArray(hello.freeSeats) ? hello.freeSeats.filter(seat => Number.isInteger(seat) && seat >= 1 && seat <= CLASS_SEATS && seat !== this.seat) : []);
				return;
			}
			if (hello.admitted === false) {
				this.end(hello.refused === 'locked'
					? localize('collaboration.refusedLocked', "{0} has locked the session: nobody else can join it now.", hello.name)
					: localize('collaboration.full', "The session is full: it already has {0} participants.", MAX_PARTICIPANTS));
				return;
			}
			const returning = this.admitted;
			this.hostId = peerId;
			this.waitTimer.clear();
			this.participants.set(peerId, { peerId, name: hello.name, role: 'host', language: hello.language });
			this.sendAgent(this.agentAnswering ? 'answering' : 'present', [peerId]);
			this.postParticipants();
			this.setStatus('');
			if (returning) {
				this.notice(localize('collaboration.hostBack', "{0} is back.", hello.name));
				if (this.samePage.value instanceof SamePageGuest) {
					this.samePage.value.reconnected();
				}
				return;
			}
			this.admitted = true;
			if (hello.mode === 'samePage' && typeof hello.folder === 'string') {
				this.mode = 'samePage';
				this.onSamePage(peerId, hello.folder.slice(0, 120));
			}
			if (this.isGame) {
				this.notice(localize('collaboration.joinedGame', "You joined the game {0} runs. Your messages, and what you share, go to {0} until you are in a team; then they go to your team too.", hello.name));
				this.delivery.send('hello', this.hello(), [peerId]);
				return;
			}
			if (this.mode === 'class') {
				this.notice(localize('collaboration.joinedClass', "You joined {0}'s class. What you share, and your messages, go to {0}, the tutor, unless the class chat is on.", hello.name));
				this.delivery.send('hello', this.hello(), [peerId]);
				return;
			}
			const others = [...this.participants.values()].filter(participant => participant.role !== 'host').map(participant => participant.name);
			this.notice(others.length
				? localize('collaboration.joinedWithOthers', "You joined {0}'s session, with {1}.", hello.name, others.join(', '))
				: localize('collaboration.joinedSession', "You joined {0}'s session.", hello.name));
			this.delivery.send('hello', this.hello(), [...this.connected]);
			return;
		}
		if (this.mode === 'class' && this.role !== 'host') {
			return; // students of a class meet the tutor only
		}

		const known = this.participants.has(peerId);
		if (this.role === 'host' && !this.admitting.delete(peerId) && !known) {
			return; // refused, or met before admission
		}
		this.participants.set(peerId, { peerId, name: hello.name, role: 'guest', language: hello.language });
		this.sendAgent(this.agentAnswering ? 'answering' : 'present', [peerId]);
		if (this.role === 'host') {
			this.admittedBefore.add(peerId);
			this.sendSettings([peerId]);
			if (this.groupOf(peerId)) {
				// Back after the connection dropped: still in their breakout group
				this.sendGroups([peerId]);
			}
			this.sendGame([peerId]);
		}
		if (this.admitted && !known) {
			this.postParticipants();
			this.notice(this.mode === 'class' && this.groupCount && !this.groupOf(peerId)
				? (this.isGame
					? localize('collaboration.joinedNoTeam', "{0} joined, in no team yet: Split into Breakout Groups... places them.", hello.name)
					: localize('collaboration.joinedNoGroup', "{0} joined, in no breakout group yet: Split into Breakout Groups... places them.", hello.name))
				: localize('collaboration.joined', "{0} joined.", hello.name));
			this.updateWaitingStatus();
		}
	}

	/** The seat was taken: a student leaves its room for a free seat, or, when there is none, the class is full. */
	private moveSeat(tutorId: string, free: readonly number[]): void {
		this.post({ command: 'leave', key: 'seat' });
		this.connected.clear();
		this.delivery.removePeer(tutorId);
		if (!free.length) {
			this.end(localize('collaboration.classFull', "The class is full: all its {0} seats are taken.", CLASS_SEATS));
			return;
		}
		this.waitToJoin();
		this.takeSeat(free[Math.floor(Math.random() * free.length)]);
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
		if (this.mode === 'class' && this.role !== 'host' && data.type !== 'hello' && peerId !== this.hostId) {
			return; // a student hears the tutor only
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
			case 'agent':
				this.onAgent(peerId, data.payload);
				break;
			case 'group':
				if (this.mode === 'class' && this.role !== 'host' && peerId === this.hostId) {
					this.onGroup(data.payload);
				}
				break;
			case 'game':
				if (this.isGame && this.role !== 'host' && peerId === this.hostId) {
					this.onGame(data.payload);
				}
				break;
			case 'gameResults':
				if (this.isGame && this.role !== 'host' && peerId === this.hostId) {
					this.onGameResults(data.payload);
				}
				break;
			case 'decisions':
				if (this.role === 'host') {
					this.onDecisions(peerId, data.payload);
				}
				break;
			case 'settings':
				if (this.role !== 'host' && peerId === this.hostId) {
					this.applySettings(data.payload, this.settingsReceived);
					this.settingsReceived = true;
				}
				break;
			case 'fileRequest':
			case 'fileResponse':
			case 'textUpdate':
			case 'textSaved':
			case 'filesChanged':
			case 'cursor':
				if (this.participants.has(peerId)) {
					this.samePage.value?.receive(peerId, data);
				}
				break;
		}
	}

	private onChat(peerId: string, chat: IChatPayload): void {
		const participant = this.participants.get(peerId);
		if (!participant || typeof chat.text !== 'string') {
			return;
		}
		// An agent's answer comes from the participant who invited it, under the agent's name; a student's message in
		// the class chat comes from the tutor, under the student's name
		const relayed = participant.role === 'host' && typeof chat.from === 'string' && chat.from.trim() ? chat.from.trim().slice(0, 40) : undefined;
		const name = chat.agent !== undefined ? this.remoteAgentName(peerId, chat.agent) : relayed ?? participant.name;
		if (!name) {
			return;
		}
		const image = typeof chat.image === 'string' && isAcceptableImage(chat.image) ? chat.image : undefined;
		const shown = this.withGroup(peerId, name);
		this.post({ command: 'show', entry: { kind: 'message', name: shown, text: chat.text, image, time: Date.now() } });
		if (this.mode === 'class' && this.role === 'host' && chat.agent === undefined) {
			// The tutor passes a student's message on: within their breakout group, or, with the class chat on, to the class
			const others = this.groupCount ? this.groupMates(peerId) : this.classChat ? [...this.participants.keys()].filter(other => other !== peerId) : [];
			if (others.length) {
				const passed: IChatPayload = image ? { id: generateUuid(), text: chat.text, image, from: name } : { id: generateUuid(), text: chat.text, from: name };
				this.delivery.send('chat', envelope<Envelope & { type: 'chat' }>('chat', passed) as unknown as IJson, others);
			}
		}
		// An agent's message never asks an agent: agents do not talk among themselves
		this.record(shown, chat.text, chat.agent === undefined);
	}

	private onSharedEditor(peerId: string, shared: IEditorSharedPayload): void {
		const participant = this.participants.get(peerId);
		if (!participant || typeof shared.fileName !== 'string' || typeof shared.content !== 'string' || (shared.kind !== 'text' && shared.kind !== 'notebook')) {
			return;
		}
		// From the tutor, a student's snapshot: passed on within the breakout group, or shown to the class
		const from = participant.role === 'host' && typeof shared.from === 'string' && shared.from.trim() ? shared.from.trim().slice(0, 40) : undefined;
		const shownBy = from && typeof shared.group !== 'number' ? participant.name : undefined;
		const sharer = shared.agent !== undefined ? this.remoteAgentName(peerId, shared.agent) : from ?? participant.name;
		if (!sharer) {
			return;
		}
		this.notice(shownBy
			? (this.myGroup.visiting
				? localize('collaboration.shownToGroup', "{0} showed your group {1}'s {2}.", shownBy, sharer, shared.fileName)
				: localize('collaboration.shownToClass', "{0} showed the class {1}'s {2}.", shownBy, sharer, shared.fileName))
			: shared.agent === undefined
				? localize('collaboration.editorShared', "{0} shared their {1}.", this.withGroup(peerId, sharer), shared.fileName)
				: localize('collaboration.agentShared', "{0} shared {1}.", sharer, shared.fileName));
		this.keepMaterial(sharer, shared.fileName, shared.content);
		const payload: IEditorSharedPayload = { fileName: shared.fileName, kind: shared.kind, content: shared.content, languageId: typeof shared.languageId === 'string' ? shared.languageId : undefined, pluto: shared.pluto === true };
		this.onEditorShared(sharer, payload);
		const mates = this.groupMates(peerId);
		if (this.mode === 'class' && mates.length) {
			const passed: IEditorSharedPayload = { ...payload, from: sharer, group: this.groupOf(peerId) };
			this.delivery.send('editorShared', envelope<Envelope & { type: 'editorShared' }>('editorShared', passed) as unknown as IJson, mates);
		}
	}

	/** The tutor of a class shows a student's snapshot to the rest of the class (Show to the Class). */
	showToClass(sharer: string, shared: IEditorSharedPayload): void {
		if (this.ended || this.mode !== 'class' || this.role !== 'host') {
			return;
		}
		const peers = this.recipients().filter(peerId => this.participants.get(peerId)?.name !== sharer);
		if (!peers.length) {
			this.notice(localize('collaboration.nobodyToShow', "Nobody else is in the class yet, so {0}'s {1} was not shown.", sharer, shared.fileName));
			return;
		}
		const payload: IEditorSharedPayload = { fileName: shared.fileName, kind: shared.kind, content: shared.content, languageId: shared.languageId, pluto: shared.pluto, from: sharer };
		this.notice(localize('collaboration.youShowed', "You showed the class {0}'s {1}.", sharer, shared.fileName));
		this.delivery.send('editorShared', envelope<Envelope & { type: 'editorShared' }>('editorShared', payload) as unknown as IJson, peers);
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
		const peers = this.recipients();
		if (!peers.length) {
			this.notice(localize('collaboration.nobodyToShareWith', "Nobody else is in the session yet, so {0} was not shared.", shared.fileName));
			return;
		}
		this.notice(localize('collaboration.youShared', "You shared your {0}.", shared.fileName));
		this.keepMaterial(this.name, shared.fileName, shared.content);
		this.delivery.send('editorShared', envelope<Envelope & { type: 'editorShared' }>('editorShared', shared) as unknown as IJson, peers);
	}

	/** A dataset from another participant: checked, and shown as a card; nothing runs until a button is pressed. */
	private onSharedDataset(peerId: string, shared: IDatasetSharedPayload): void {
		const participant = this.participants.get(peerId);
		if (!participant || typeof shared.id !== 'string' || typeof shared.fileName !== 'string' || typeof shared.content !== 'string') {
			return;
		}
		const sharer = this.sharerOf(participant, shared.from);
		const shown = this.withGroup(peerId, sharer);
		const fileName = datasetFileName(shared.fileName);
		const bytes = VSBuffer.fromString(shared.content).byteLength;
		const summary = bytes <= MAX_DATASET_BYTES ? summarizeCsv(shared.content) : undefined;
		if (!summary) {
			this.notice(localize('collaboration.datasetRefused', "{0} shared {1}, but it is not a CSV dataset within {2} MB, so it was refused.", shown, fileName, MAX_DATASET_BYTES / 1024 / 1024));
			return;
		}
		const id = generateUuid();
		this.datasets.set(id, { sharer, payload: { id, fileName, content: shared.content }, summary });
		this.keepMaterial(sharer, fileName, shared.content);
		this.post({
			command: 'show',
			entry: {
				kind: 'dataset', name: shown, text: '', time: Date.now(),
				dataset: { id, fileName, rows: summary.rows, columns: summary.header.length, size: formatBytes(bytes), header: summary.header, head: summary.head, formulas: summary.formulas },
			},
		});
		const mates = this.groupMates(peerId);
		if (this.mode === 'class' && mates.length) {
			const passed: IDatasetSharedPayload = { id: generateUuid(), fileName, content: shared.content, from: sharer };
			this.delivery.send('datasetShared', envelope<Envelope & { type: 'datasetShared' }>('datasetShared', passed) as unknown as IJson, mates);
		}
	}

	/** Who shared a dataset or a file: the participant, or, from the tutor of a class, the student whose share it passes on. */
	private sharerOf(participant: IParticipant, from: unknown): string {
		return participant.role === 'host' && typeof from === 'string' && from.trim() ? from.trim().slice(0, 40) : participant.name;
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
		const peers = this.recipients();
		if (!peers.length) {
			this.notice(localize('collaboration.nobodyToShareWith', "Nobody else is in the session yet, so {0} was not shared.", fileName));
			return;
		}
		this.notice(localize('collaboration.youSharedDataset', "You shared {0}: {1} rows × {2} columns.", fileName, rows, columns));
		this.keepMaterial(this.name, fileName, content);
		const shared: IDatasetSharedPayload = { id: generateUuid(), fileName, content };
		this.delivery.send('datasetShared', envelope<Envelope & { type: 'datasetShared' }>('datasetShared', shared) as unknown as IJson, peers);
	}

	/** A file or database from another participant: checked, and shown as a card; a file can only be saved, never opened. */
	private onSharedFile(peerId: string, shared: IFileSharedPayload, database: boolean): void {
		const participant = this.participants.get(peerId);
		if (!participant || typeof shared.id !== 'string' || typeof shared.fileName !== 'string' || typeof shared.content !== 'string') {
			return;
		}
		const sharer = this.sharerOf(participant, shared.from);
		const shown = this.withGroup(peerId, sharer);
		const fileName = sharedFileName(shared.fileName) || 'file';
		const bytes = base64Bytes(shared.content);
		if (bytes === undefined || bytes > MAX_FILE_BYTES || (database && !isDuckDbFile(decodeBase64(shared.content.slice(0, 16)).buffer))) {
			this.notice(database
				? localize('collaboration.databaseRefused', "{0} shared {1}, but it is not a DuckDB database within {2} MB, so it was refused.", shown, fileName, MAX_FILE_BYTES / 1024 / 1024)
				: localize('collaboration.fileRefused', "{0} shared {1}, but it is not a file within {2} MB, so it was refused.", shown, fileName, MAX_FILE_BYTES / 1024 / 1024));
			return;
		}
		const id = generateUuid();
		this.files.set(id, { sharer, payload: { id, fileName, content: shared.content }, database });
		this.post({ command: 'show', entry: { kind: 'file', name: shown, text: '', time: Date.now(), file: { id, fileName, size: formatBytes(bytes), database } } });
		const mates = this.groupMates(peerId);
		if (this.mode === 'class' && mates.length) {
			const type = database ? 'databaseShared' : 'fileShared';
			const passed: IFileSharedPayload = { id: generateUuid(), fileName, content: shared.content, from: sharer };
			this.delivery.send(type, envelope<Envelope & { type: typeof type }>(type, passed) as unknown as IJson, mates);
		}
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
		const peers = this.recipients();
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
		const mates = this.groupMates(peerId);
		this.participants.delete(peerId);
		this.groups.delete(peerId);
		this.sendGroups(mates);
		this.dropAgentsOf(peerId);
		this.delivery.removePeer(peerId);
		this.samePage.value?.peerLeft(peerId);
		this.freeSeatOf(peerId);
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
		this.record(this.name, text, true);
		const peers = this.recipients();
		if (!peers.length) {
			this.notice(localize('collaboration.nobodyYet', "Nobody else is in the session yet, so the message was not sent."));
			return;
		}
		const chat: IChatPayload = image ? { id: generateUuid(), text, image } : { id: generateUuid(), text };
		this.delivery.send('chat', envelope<Envelope & { type: 'chat' }>('chat', chat) as unknown as IJson, peers);
	}
}

/** Places each student in the breakout group with the fewest students, ties broken at random, so a fresh split is even. */
function placeAtRandom(peerIds: readonly string[], count: number, assignment: Map<string, number>): void {
	const sizes = new Array<number>(count + 1).fill(0);
	for (const group of assignment.values()) {
		sizes[group]++;
	}
	const shuffled = [...peerIds];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	for (const peerId of shuffled) {
		const smallest = Math.min(...sizes.slice(1));
		const candidates = [];
		for (let group = 1; group <= count; group++) {
			if (sizes[group] === smallest) {
				candidates.push(group);
			}
		}
		const group = candidates[Math.floor(Math.random() * candidates.length)];
		assignment.set(peerId, group);
		sizes[group]++;
	}
}

/** An agent's name in the chat: its own, and who invited it. */
function agentDisplayName(name: string, inviter: string): string {
	return localize('collaboration.agentName', "{0} (invited by {1})", name, inviter);
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
		@IFileDialogService private readonly fileDialogService: IFileDialogService,
		@IWorkspaceContextService private readonly workspaceContextService: IWorkspaceContextService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@ITerminalInstanceService private readonly terminalInstanceService: ITerminalInstanceService,
		@IFileService private readonly fileService: IFileService,
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

	async startSamePageSession(): Promise<void> {
		if (this.alreadyInSession()) {
			return;
		}
		const root = await this.askFolder();
		if (!root) {
			return;
		}
		const folderName = basename(root) || root.path;
		const { confirmed } = await this.dialogService.confirm({
			message: localize('collaboration.confirmSamePage', "Share {0} with the session?", folderName),
			detail: localize('collaboration.confirmSamePageDetail', "Everyone who joins can open every file of {0} and its folders, except .git, and edit its text. The changes are made in your copy of each file and are written to your disk when someone saves. Nobody else can create, rename or delete files, or run anything on this computer.", folderName),
			primaryButton: localize({ key: 'collaboration.shareFolderButton', comment: ['&& denotes a mnemonic'] }, "&&Share the Folder"),
		});
		if (!confirmed) {
			return;
		}
		const name = await this.askName();
		if (!name) {
			return;
		}
		const strategy = this.configurationService.getValue<SignallingStrategy>(SIGNALLING_SETTING) === 'mqtt' ? 'mqtt' : 'nostr';
		const session = this.begin(newSessionCode(strategy), 'host', name, 'samePage');
		session.attachSamePage(this.instantiationService.createInstance(SamePageHost, session.samePageLink, root, folderName));
		await this.clipboardService.writeText(session.invitation);
	}

	async startClassSession(): Promise<void> {
		if (this.alreadyInSession()) {
			return;
		}
		const name = await this.askName();
		if (!name) {
			return;
		}
		const strategy = this.configurationService.getValue<SignallingStrategy>(SIGNALLING_SETTING) === 'mqtt' ? 'mqtt' : 'nostr';
		const session = this.begin(newSessionCode(strategy, 'class'), 'host', name, 'class');
		await this.clipboardService.writeText(session.invitation);
	}

	canShowToClass(resource: URI): boolean {
		const session = this.session.value;
		return !!session?.isLive && session.isClass && session.role === 'host' && !!this.sharedEditors.snapshot(resource);
	}

	showToClass(resource: URI): void {
		const snapshot = this.sharedEditors.snapshot(resource);
		if (snapshot && this.canShowToClass(resource)) {
			this.session.value?.showToClass(snapshot.sharer, snapshot.payload);
		}
	}

	async breakoutGroups(): Promise<void> {
		const session = this.tutorSession();
		if (!session) {
			return;
		}
		const students = session.students();
		const game = session.hostedGame;
		if (game && !game.round) {
			this.notificationService.info(localize('collaboration.teamsByNextRound', "Next Round splits the players into teams and starts the game."));
			return;
		}
		if (game) {
			// The teams of a game stay as many as they are: newcomers are placed, and players moved
			const assignment = new Map(students.filter(student => student.group).map(student => [student.peerId, student.group] as const));
			placeAtRandom(students.map(student => student.peerId).filter(peerId => !assignment.has(peerId)), session.breakoutGroupCount, assignment);
			if (await this.adjustGroups(session, localize('collaboration.teamsTitle', "Teams"), session.breakoutGroupCount, students, assignment, localize('collaboration.changeTeams', "Change the Teams"))) {
				session.startGroups(session.breakoutGroupCount, assignment);
			}
			return;
		}
		if (students.length < 2) {
			this.notificationService.info(localize('collaboration.groupsNeedStudents', "Breakout groups need at least two students in the class."));
			return;
		}
		const title = localize('collaboration.breakoutTitle', "Split into Breakout Groups");
		const current = session.breakoutGroupCount;
		const text = await this.quickInputService.input({
			title,
			prompt: localize('collaboration.groupCountPrompt', "The number of groups, from 2 to {0}: the students are split among them at random, and you can then move any of them", students.length),
			value: String(current || Math.max(2, Math.round(students.length / 3))),
			ignoreFocusLost: true,
			validateInput: async value => {
				const count = Number(value.trim());
				return Number.isInteger(count) && count >= 2 && count <= students.length ? undefined : localize('collaboration.groupCountInvalid', "Give a whole number from 2 to {0}.", students.length);
			},
		});
		const count = Number(text?.trim());
		if (!text || !Number.isInteger(count) || !session.isLive) {
			return;
		}
		// With the same number of groups, the students keep theirs and newcomers are placed; otherwise all are split afresh
		const assignment = new Map<string, number>(count === current ? students.filter(student => student.group).map(student => [student.peerId, student.group]) : []);
		placeAtRandom(students.map(student => student.peerId).filter(peerId => !assignment.has(peerId)), count, assignment);
		if (await this.adjustGroups(session, title, count, students, assignment, current ? localize('collaboration.changeGroups', "Change the Groups") : localize('collaboration.startGroups', "Start the Groups"))) {
			session.startGroups(count, assignment);
		}
	}

	/** Shows the groups, where picking a student moves them to another; true when the tutor confirms them with `startLabel`. */
	private async adjustGroups(session: Session, title: string, count: number, students: readonly IStudent[], assignment: Map<string, number>, startLabel: string): Promise<boolean> {
		const start: IGroupItem = { label: startLabel };
		let active: string | undefined;
		while (true) {
			const items: (IGroupItem | IQuickPickSeparator)[] = [start];
			for (let group = 1; group <= count; group++) {
				items.push({ type: 'separator', label: session.groupLabel(group) });
				for (const student of students.filter(student => assignment.get(student.peerId) === group)) {
					items.push({ label: student.name, description: localize('collaboration.moveStudent', "move to another group"), peerId: student.peerId });
				}
			}
			const picked = await this.quickInputService.pick(items, {
				title,
				placeHolder: localize('collaboration.groupsPlaceholder', "Choose someone to move them to another group, or confirm the groups"),
				activeItem: items.find(item => item.type !== 'separator' && item.peerId !== undefined && item.peerId === active) as IGroupItem | undefined,
			});
			if (!picked || !session.isLive) {
				return false;
			}
			if (picked === start) {
				return true;
			}
			const from = assignment.get(picked.peerId!);
			const targets: IGroupItem[] = [];
			for (let group = 1; group <= count; group++) {
				if (group !== from) {
					const names = students.filter(student => assignment.get(student.peerId) === group).map(student => student.name);
					targets.push({ label: session.groupLabel(group), description: names.join(', '), group });
				}
			}
			const target = await this.quickInputService.pick(targets, { title, placeHolder: localize('collaboration.moveTo', "Move {0} to", picked.label) });
			if (target?.group) {
				assignment.set(picked.peerId!, target.group);
			}
			active = picked.peerId;
		}
	}

	async visitGroup(): Promise<void> {
		const session = this.tutorSession();
		if (!session || !this.hasGroups(session)) {
			return;
		}
		const students = session.students();
		const visited = session.visitedBreakoutGroup;
		const here = localize('collaboration.whereYouAre', "where your messages go now");
		const items: IGroupItem[] = [
			{ label: localize('collaboration.everyGroup', "Every Group"), description: localize('collaboration.everyGroupDetail', "your messages, and what you share, go to the whole class"), detail: visited === undefined ? here : undefined, group: 0 },
		];
		for (let group = 1; group <= session.breakoutGroupCount; group++) {
			const names = students.filter(student => student.group === group).map(student => student.name);
			items.push({ label: session.groupLabel(group), description: names.length ? names.join(', ') : localize('collaboration.groupNobody', "nobody yet"), detail: visited === group ? here : undefined, group });
		}
		const picked = await this.quickInputService.pick(items, {
			title: localize('collaboration.visitTitle', "Visit a Group"),
			placeHolder: localize('collaboration.visitPlaceholder', "The group your messages, and what you share, go to; you see every group's messages wherever you are"),
			activeItem: items.find(item => (item.group || undefined) === visited),
		});
		if (picked && session.isLive) {
			session.visitGroup(picked.group || undefined);
		}
	}

	bringEveryoneBack(): void {
		const session = this.tutorSession();
		if (session?.hostedGame) {
			this.notificationService.info(localize('collaboration.teamsStay', "In a game, the teams stay until it ends."));
		} else if (session && this.hasGroups(session)) {
			session.endGroups();
		}
	}

	async hostGame(): Promise<void> {
		if (this.alreadyInSession()) {
			return;
		}
		const title = localize('collaboration.hostGameTitle', "Host a Game");
		const cases: (IQuickPickItem & { readonly gameCase?: IGameCase })[] = [];
		for (const folder of await builtInCases(this.fileService)) {
			try {
				const gameCase = await loadCase(this.fileService, folder);
				cases.push({ gameCase, label: gameCase.title, detail: gameCase.description });
			} catch {
				// A case of Pollis's own that does not load is left out
			}
		}
		const choose: IQuickPickItem & { readonly gameCase?: IGameCase } = { label: localize('collaboration.chooseCase', "Choose a Case Folder..."), description: localize('collaboration.chooseCaseDetail', "a folder with case.toml and model.jl") };
		const picked = await this.quickInputService.pick([...cases, choose], { title, placeHolder: localize('collaboration.casePlaceholder', "The case the teams play"), matchOnDetail: true });
		if (!picked) {
			return;
		}
		let gameCase = picked.gameCase;
		if (!gameCase) {
			const folder = (await this.fileDialogService.showOpenDialog({ title, canSelectFolders: true, canSelectFiles: false, canSelectMany: false }))?.[0];
			if (!folder) {
				return;
			}
			try {
				gameCase = await loadCase(this.fileService, folder);
			} catch (error) {
				this.notificationService.error(String(error?.message ?? error));
				return;
			}
		}
		const name = await this.askName();
		if (!name) {
			return;
		}
		const strategy = this.configurationService.getValue<SignallingStrategy>(SIGNALLING_SETTING) === 'mqtt' ? 'mqtt' : 'nostr';
		const session = this.begin(newSessionCode(strategy, 'game'), 'host', name, 'class');
		session.hostGame(this.instantiationService.createInstance(GameRun, gameCase));
		await this.clipboardService.writeText(session.invitation);
	}

	joinGame(): Promise<void> {
		return this.joinSession();
	}

	async nextRound(): Promise<void> {
		const session = this.session.value;
		const run = session?.isLive && session.role === 'host' ? session.hostedGame : undefined;
		if (!session || !run) {
			this.notificationService.info(localize('collaboration.nextRoundForFacilitator', "Next Round is for the facilitator of a game: host one with Compose > Collaboration > Simulation Games > Host a Game...."));
			return;
		}
		if (run.isRunning) {
			this.notificationService.info(localize('collaboration.roundRunning', "A round is being played: wait for its results."));
			return;
		}
		if (run.isOver) {
			this.notificationService.info(localize('collaboration.gameIsOver', "The game is over: its rounds are in {0}.", run.folderPath));
			return;
		}
		const gameCase = run.gameCase;
		try {
			if (!run.round) {
				// Start the game: the teams, at random and then adjusted, as many as the case allows and the players fill
				const students = session.students();
				if (students.length < gameCase.minTeams) {
					this.notificationService.info(localize('collaboration.notEnoughPlayers', "{0} needs at least {1} teams, so at least {1} players: {2} have joined so far.", gameCase.title, gameCase.minTeams, students.length));
					return;
				}
				const most = Math.min(gameCase.maxTeams, students.length);
				const title = localize('collaboration.startGameTitle', "Start the Game");
				let count = gameCase.minTeams;
				if (most > gameCase.minTeams) {
					const text = await this.quickInputService.input({
						title,
						prompt: localize('collaboration.teamCountPrompt', "The number of teams, from {0} to {1}: the players are split among them at random, and you can then move any of them", gameCase.minTeams, most),
						value: String(Math.min(most, Math.max(gameCase.minTeams, Math.round(students.length / 3)))),
						ignoreFocusLost: true,
						validateInput: async value => {
							const number = Number(value.trim());
							return Number.isInteger(number) && number >= gameCase.minTeams && number <= most ? undefined : localize('collaboration.teamCountInvalid', "Give a whole number from {0} to {1}.", gameCase.minTeams, most);
						},
					});
					count = Number(text?.trim());
					if (!text || !Number.isInteger(count) || !session.isLive) {
						return;
					}
				}
				const assignment = new Map<string, number>();
				placeAtRandom(students.map(student => student.peerId), count, assignment);
				if (await this.adjustGroups(session, title, count, students, assignment, localize('collaboration.startTheGame', "Start the Game")) && session.isLive) {
					await session.startGame(count, assignment);
				}
				return;
			}
			const missing = run.teams.filter(team => !run.submittedBy(team.team));
			if (missing.length) {
				const { confirmed } = await this.dialogService.confirm({
					message: localize('collaboration.playAnyway', "Play {0} without the decisions of {1}?", run.roundName(run.round), missing.map(team => team.name).join(', ')),
					detail: localize('collaboration.playAnywayDetail', "A team that has not submitted its decisions plays those of its last round, or, in the first, those the case starts with."),
					primaryButton: localize({ key: 'collaboration.playButton', comment: ['&& denotes a mnemonic'] }, "&&Play the Round"),
				});
				if (!confirmed || !session.isLive) {
					return;
				}
			}
			await session.playRound();
		} catch (error) {
			this.notificationService.error(String(error?.message ?? error));
		}
	}

	/** The session, when this copy is the tutor of a class; otherwise says why breakout groups are not available. */
	private tutorSession(): Session | undefined {
		const session = this.session.value;
		if (!session?.isLive) {
			this.notificationService.info(localize('collaboration.notInSession', "You are not in a session. Start or join one from Compose > Collaboration."));
			return undefined;
		}
		if (!session.isClass || session.role !== 'host') {
			this.notificationService.info(localize('collaboration.groupsForTutor', "Breakout groups are for the tutor of a class: start one with Compose > Classroom > Start Class Session...."));
			return undefined;
		}
		return session;
	}

	private hasGroups(session: Session): boolean {
		if (!session.breakoutGroupCount) {
			this.notificationService.info(localize('collaboration.noGroups', "The class is not in breakout groups: split it first (Split into Breakout Groups...)."));
			return false;
		}
		return true;
	}

	/** The folder to share: one of the workspace's folders, or another chosen in a dialog. */
	private async askFolder(): Promise<URI | undefined> {
		const folders = this.workspaceContextService.getWorkspace().folders;
		const choose = localize('collaboration.chooseFolder', "Choose a Folder...");
		let picked: URI | undefined;
		if (folders.length) {
			const items: (IQuickPickItem & { readonly folder?: URI })[] = [
				...folders.map(folder => ({ label: folder.name, description: folder.uri.fsPath, folder: folder.uri })),
				{ label: choose },
			];
			const item = await this.quickInputService.pick(items, { title: localize('collaboration.folderTitle', "Folder to Share"), placeHolder: localize('collaboration.folderPlaceholder', "The folder whose files everyone in the session edits together") });
			if (!item) {
				return undefined;
			}
			picked = item.folder;
		}
		if (!picked) {
			const chosen = await this.fileDialogService.showOpenDialog({ title: localize('collaboration.folderTitle', "Folder to Share"), canSelectFolders: true, canSelectFiles: false, canSelectMany: false, defaultUri: folders[0]?.uri });
			picked = chosen?.[0];
		}
		return picked;
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
			this.begin(code, 'guest', name, code.kind === 'session' ? 'sideBySide' : 'class');
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
			const group = participant.peerId ? session.groupOf(participant.peerId) : 0;
			const roles = [participant.host ? localize('collaboration.hostRole', "host") : '', participant.you ? localize('collaboration.youRole', "you") : '', participant.watching ? localize('collaboration.watchingRole', "watching") : '', participant.agent ? localize('collaboration.agentRole', "agent") : '', group ? localize('collaboration.groupRole', "Group {0}", group) : ''].filter(Boolean).join(', ');
			return { label: participant.name, description: roles, detail: connection ? describeConnection(connection) : undefined };
		});
		const people = session.participantList().filter(participant => !participant.agent).length;
		this.quickInputService.pick(items, { title: localize('collaboration.participantsTitle', "Participants ({0} of at most {1})", people, session.isClass ? CLASS_SEATS + 1 : MAX_PARTICIPANTS) });
	}

	async sessionSettings(): Promise<void> {
		const session = this.session.value;
		if (!session?.isLive) {
			this.notificationService.info(localize('collaboration.notInSession', "You are not in a session. Start or join one from Compose > Collaboration."));
			return;
		}
		const title = localize('collaboration.settingsTitle', "Session Settings");
		const lockedText = session.isLocked
			? localize('collaboration.settingsLocked', "Locked: nobody else can join, even with the invitation")
			: localize('collaboration.settingsOpen', "Open: anyone with the invitation can join");
		const others = session.participantList().filter(participant => !participant.host && !participant.agent);
		const editText = (participant: IChatParticipant) => participant.watching
			? localize('collaboration.settingsWatches', "Watch Only")
			: localize('collaboration.settingsEdits', "Can Edit");
		const whoMayEdit = localize('collaboration.settingsWhoMayEdit', "Who May Edit");
		const classChatText = session.hasClassChat
			? localize('collaboration.settingsClassChatOn', "Class chat: everyone in the class sees every message")
			: localize('collaboration.settingsClassChatOff', "Tutor only: a student's messages go to the tutor alone");

		if (session.role !== 'host') {
			const items: (IQuickPickItem | IQuickPickSeparator)[] = [
				{ label: lockedText },
				...(session.isClass ? [{ label: classChatText }] : []),
				...(session.isSamePage ? [{ type: 'separator' as const, label: whoMayEdit }, ...others.map(participant => ({ label: participant.name, description: editText(participant) }))] : []),
			];
			this.quickInputService.pick(items, { title, placeHolder: localize('collaboration.settingsHostOnly', "Only the host changes these settings.") });
			return;
		}

		const lockItem: ISettingItem = {
			label: localize('collaboration.settingsLock', "Lock the Session"),
			description: localize('collaboration.settingsLockDetail', "nobody else can join, even with the invitation"),
			picked: session.isLocked,
		};
		const people: ISettingItem[] = session.isSamePage
			? others.map(participant => ({ label: participant.name, description: localize('collaboration.settingsCanEdit', "can edit the files"), peerId: participant.peerId, picked: !participant.watching }))
			: [];
		const classChatItem: ISettingItem = {
			label: localize('collaboration.settingsClassChat', "Class Chat"),
			description: localize('collaboration.settingsClassChatDetail', "everyone in the class sees every message; otherwise a student's go to you only"),
			picked: session.hasClassChat,
		};
		const items: (ISettingItem | IQuickPickSeparator)[] = [
			lockItem,
			...(session.isClass ? [classChatItem] : []),
			...(people.length ? [{ type: 'separator' as const, label: whoMayEdit }, ...people] : []),
		];
		const picked = await this.quickInputService.pick(items, {
			title,
			canPickMany: true,
			placeHolder: session.isSamePage
				? localize('collaboration.settingsPlaceholder', "Tick to lock the session; untick a participant to let them only watch the files")
				: session.isClass
					? localize('collaboration.settingsPlaceholderClass', "Tick to lock the class, or to let everyone see every message")
					: localize('collaboration.settingsPlaceholderSideBySide', "Tick to lock the session"),
		});
		if (!picked || !session.isLive) {
			return;
		}
		const editors = new Set(picked.map(item => item.peerId).filter(peerId => peerId !== undefined));
		const watching = new Set(people.map(item => item.peerId!).filter(peerId => !editors.has(peerId)));
		session.changeSettings(picked.includes(lockItem), watching, picked.includes(classChatItem));
	}

	async inviteAgent(): Promise<void> {
		const session = this.session.value;
		if (!session?.isLive) {
			this.notificationService.info(localize('collaboration.notInSession', "You are not in a session. Start or join one from Compose > Collaboration."));
			return;
		}
		if (session.isClass) {
			this.notificationService.info(localize('collaboration.noAgentInClass', "An agent cannot join a class yet: invite one into a Side by Side or Same Page session."));
			return;
		}
		const current = session.invitedAgent;
		if (current) {
			const { confirmed } = await this.dialogService.confirm({
				message: localize('collaboration.removeAgent', "Remove {0} from the session?", current.name),
				detail: localize('collaboration.removeAgentDetail', "You can invite an agent again afterwards, on the same model or another."),
				primaryButton: localize({ key: 'collaboration.removeAgentButton', comment: ['&& denotes a mnemonic'] }, "&&Remove the Agent"),
			});
			if (confirmed) {
				session.removeAgent();
			}
			return;
		}
		const title = localize('collaboration.inviteAgentTitle', "Invite an Agent");
		const cells = await sessionAgentCells(this.configurationService, this.commandService, this.terminalInstanceService, this.fileService);
		if (!cells.length) {
			this.notificationService.prompt(Severity.Info, localize('collaboration.noAgents', "Invite an Agent runs Claude Code, Codex or OpenCode on this computer, on a model of Model Tasks and Routing: install one of them, or give it a model there."), [
				{ label: localize('collaboration.openRouting', "Open Model Tasks and Routing"), run: () => this.commandService.executeCommand(MODEL_ROUTING_COMMAND_ID) },
			]);
			return;
		}
		const picked = await this.quickInputService.pick(cells.map(cell => ({ label: cell.label, cell })), {
			title,
			placeHolder: localize('collaboration.agentPlaceholder', "The agent and the model that answer in the session, on this computer"),
		});
		if (!picked) {
			return;
		}
		const cell: IOrchestrationCell = picked.cell;
		const taken = session.namesInUse().map(name => name.toLocaleLowerCase());
		const name = (await this.quickInputService.input({
			title,
			prompt: localize('collaboration.agentNamePrompt', "Its name in the session: a message that starts with @ and this name asks it something"),
			value: cell.label.split(' · ').pop() ?? cell.agent,
			ignoreFocusLost: true,
			validateInput: async value => !value.trim() ? localize('collaboration.nameEmpty', "Please give a name.")
				: /[@\n]/.test(value) ? localize('collaboration.agentNameAt', "The name cannot hold @.")
					: taken.includes(value.trim().slice(0, 40).toLocaleLowerCase()) ? localize('collaboration.agentNameTaken', "Someone in the session has this name already.")
						: undefined,
		}))?.trim().slice(0, 40);
		if (!name) {
			return;
		}
		const { confirmed } = await this.dialogService.confirm({
			message: localize('collaboration.confirmAgent', "Invite {0} into the session?", name),
			detail: localize('collaboration.confirmAgentDetail', "Anyone in the session can ask {0} something by starting a message with @{0}. It answers on this computer, with {1}, at your cost, or for nothing on a local model. It reads only the chat and what is shared, in a folder of its own that is deleted when it leaves, and it cannot open your other files or reach the Internet.", name, cell.label),
			primaryButton: localize({ key: 'collaboration.inviteAgentButton', comment: ['&& denotes a mnemonic'] }, "&&Invite the Agent"),
		});
		if (!confirmed || !session.isLive) {
			return;
		}
		session.inviteAgent(this.instantiationService.createInstance(SessionAgent, name, cell, session.name, session.agentLink));
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
	private begin(code: ISessionCode, role: ParticipantRole, name: string, mode: SessionMode = 'sideBySide'): Session {
		const page = this.openPage();
		const session: Session = new Session(
			code, role, name, mode, page,
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
			(hostId, folder) => session.attachSamePage(this.instantiationService.createInstance(SamePageGuest, session.samePageLink, hostId, folder)),
			() => this.nextRound(),
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
