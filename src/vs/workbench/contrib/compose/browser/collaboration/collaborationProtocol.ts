/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { encodeHex, VSBuffer } from '../../../../../base/common/buffer.js';

// Compose > Collaboration: what Pollis copies send each other in a session (internal-reports/collaboration-spec.md).
// The session layer is general: typed messages, a channel (the whole session or one participant) and a host,
// so classrooms and games can later use it beside Side by Side.

/** Trystero's app id: rooms of other apps never meet ours. */
export const COLLABORATION_APP_ID = 'pollis.org/collaboration';

/** The version of the messages below; a copy refuses messages of another version. */
export const PROTOCOL_VERSION = 1;

/** The most participants in a session, the host included; an invited agent does not count. */
export const MAX_PARTICIPANTS = 5;

/** The seats of a class (Classroom): the most students in it, the tutor aside. */
export const CLASS_SEATS = 30;

/** The longest answer of an agent in the chat, in characters. */
export const MAX_AGENT_ANSWER = 20_000;

/** The most files an agent shares with one answer. */
export const MAX_AGENT_FILES = 5;

/** The largest image in the chat, in bytes; larger ones are downscaled, or refused. */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** The largest editor or notebook shared (Share My Editor), in bytes, as text. */
export const MAX_SHARE_BYTES = 2 * 1024 * 1024;

/** The largest dataset shared (Share Dataset), in bytes, as CSV text. */
export const MAX_DATASET_BYTES = 5 * 1024 * 1024;

/** The largest file or DuckDB database shared in the chat (Add > File, Add > Database), in bytes, before base64. */
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Above this size a transfer shows a progress bar on both sides. */
export const PROGRESS_THRESHOLD_BYTES = 1024 * 1024;

/** The largest message a copy accepts from another, in bytes: a capped item encoded as text, with room to spare. */
export const MAX_RECEIVE_BYTES = 8 * 1024 * 1024;

/** How the participants are introduced to each other: free public nostr relays, or public mqtt brokers. */
export type SignallingStrategy = 'nostr' | 'mqtt';

/**
 * The way of working, fixed when the session starts: each in their own editor, editing the host's folder together, or
 * a class, where each student is connected to the tutor (the host) only.
 */
export type SessionMode = 'sideBySide' | 'samePage' | 'class';

export type ParticipantRole = 'host' | 'guest';

/** The whole session, or the participant id of a private channel. */
export type Channel = 'all' | string;

/** Sent to each participant on meeting them. The host's says whether a newcomer is admitted. */
export interface IHelloPayload {
	readonly name: string;
	readonly role: ParticipantRole;
	/** The language the participant reads the chat in, for translation later. */
	readonly language: string;
	readonly mode: SessionMode;
	/** Only from the host of a Same Page session: the name of the folder it shares. */
	readonly folder?: string;
	/** Only from the host: whether the newcomer may stay; false when the session is full or locked. */
	readonly admitted?: boolean;
	/** Only from the host, when the newcomer may not stay: why. In a class, 'seatTaken' sends them to a free seat. */
	readonly refused?: 'full' | 'locked' | 'seatTaken';
	/** With 'seatTaken': the seats still free. */
	readonly freeSeats?: readonly number[];
}

/** The host's settings of the session (Session Settings), sent to everyone when they change and to each newcomer. */
export interface ISettingsPayload {
	/** Whether the session is locked: nobody new is admitted, even with the invitation. */
	readonly locked: boolean;
	/** In a Same Page session, the participants who may only watch the files, by Trystero id; the others may edit them. */
	readonly watching: readonly string[];
	/** In a class, whether every message goes to the whole class; otherwise a student's goes to the tutor only. */
	readonly classChat?: boolean;
}

export interface IChatPayload {
	readonly id: string;
	readonly text: string;
	/** A data URL of an image, at most MAX_IMAGE_BYTES once decoded. */
	readonly image?: string;
	/** When the message is the answer of an agent the sender invited (Invite an Agent): the agent's id. */
	readonly agent?: string;
	/** Only from the tutor of a class: a student's message passed on to the class, with the student's name. */
	readonly from?: string;
}

/** A snapshot of an editor (Share My Editor): its text, or a notebook without its outputs. Sharing again replaces it. */
export interface IEditorSharedPayload {
	/** The file's name, with its extension, so the language or the notebook type follows. */
	readonly fileName: string;
	readonly kind: 'text' | 'notebook';
	/** The text, or the notebook in its own file format, at most MAX_SHARE_BYTES. */
	readonly content: string;
	/** For text, the editor's language, which an untitled file's name does not tell. */
	readonly languageId?: string;
	/** Whether the text is a Pluto notebook, which Copy and Compare match with a Pluto page of the receiver's. */
	readonly pluto?: boolean;
	/** When the snapshot is a file an agent the sender invited wrote in its answer: the agent's id. */
	readonly agent?: string;
	/** Only from the tutor of a class: a student's snapshot shown to the class (Show to the Class), or passed on within their breakout group, with the student's name. */
	readonly from?: string;
	/** Only from the tutor, with from: the breakout group within which the student's snapshot was passed on. */
	readonly group?: number;
}

/** A decision each team makes in a round of a game, as its case describes it. */
export interface IGameDecision {
	readonly key: string;
	readonly label: string;
	readonly kind: 'number' | 'choice';
	readonly help?: string;
	/** For a number: its unit, bounds and step. */
	readonly unit?: string;
	readonly min?: number;
	readonly max?: number;
	readonly step?: number;
	/** For a choice: the values, each with its label. */
	readonly options?: readonly { readonly value: string; readonly label: string }[];
	readonly default: number | string;
	/** In a case: whether the decision is made once for each other team still in the game, such as a bid for each rival. A team's form has it as key.team, such as bid.2. */
	readonly rivals?: boolean;
	/** In a case: the kinds of team that make it, by key, every team when missing; and the rounds it is made in, every round when missing. */
	readonly sides?: readonly string[];
	readonly rounds?: readonly number[];
}

/** A team's values for the decisions of a round, by key. */
export type GameValues = Readonly<Record<string, number | string>>;

/** A news item of a game, as the players who read it see it: the round it came in, and the roles it is for, when not everyone. */
export interface IGameNews {
	readonly round: number;
	readonly title: string;
	readonly text: string;
	readonly for?: readonly string[];
}

/** A role in a team of a game: its key, its name, and the decisions it sets, every one when `decides` is missing. */
export interface IGameRole {
	readonly key: string;
	readonly label: string;
	readonly decides?: readonly string[];
}

/**
 * In a game (Simulation Games), what a player sees, sent by the facilitator: on joining, on being placed in a
 * team, when a round opens, and when someone in their team submits its decisions.
 */
export interface IGamePayload {
	readonly title: string;
	readonly description: string;
	/** What a round is called, such as Year, and how many there are. */
	readonly roundLabel: string;
	readonly rounds: number;
	/** The name of each round, when the case gives them, such as Due Diligence. */
	readonly roundNames?: readonly string[];
	/** The round being decided: 0 before the game starts, rounds + 1 once it is over. */
	readonly round: number;
	/** The player's team, none until the facilitator places them in one. */
	readonly team?: number;
	readonly teamName?: string;
	readonly decisions: readonly IGameDecision[];
	/** The team's values for the round: those submitted, else last round's, else the case's defaults. */
	readonly values?: GameValues;
	/** Who in the team submitted the values, when someone has this round. */
	readonly submittedBy?: string;
	/** How the teams are organised (such as Departments), the briefing every player reads, and the roles in a team. */
	readonly structure?: string;
	readonly briefing?: string;
	readonly roles?: readonly IGameRole[];
	/** Once the game has started: the player's roles, by key, with their briefings, the others in the team, each with their roles, and the roles that have not submitted this round. */
	readonly yourRoles?: readonly string[];
	readonly roleBriefings?: Readonly<Record<string, string>>;
	readonly members?: readonly string[];
	readonly waitingFor?: readonly string[];
	/** The news released so far that the player reads, oldest first. */
	readonly news?: readonly IGameNews[];
	/** When the player's team has left the game (a company bought, say): why, as the model says it. */
	readonly out?: string;
	/** Whether teams can write to each other (negotiations), and, once the game has started, the other teams. */
	readonly negotiations?: boolean;
	readonly otherTeams?: readonly { readonly team: number; readonly name: string }[];
	/** Whether the teams trade on a market (Trading Floor) in place of a form of decisions; its book comes in market envelopes. */
	readonly market?: boolean;
}

/** A price of a market's order book, with the shares bid or offered at it. */
export interface IMarketLevel {
	readonly price: number;
	readonly quantity: number;
}

/** A trade on a market: its price, its shares, and when it was made. */
export interface IMarketTrade {
	readonly price: number;
	readonly quantity: number;
	readonly time: number;
}

/** An order a desk has on the book: its side, price, shares still to trade, and who placed it. */
export interface IMarketOrder {
	readonly id: string;
	readonly side: 'buy' | 'sell';
	readonly price: number;
	readonly quantity: number;
	readonly by: string;
}

/** A team's desk on a market: its cash, its shares and its orders on the book. */
export interface IMarketDesk {
	readonly cash: number;
	readonly shares: number;
	readonly orders: readonly IMarketOrder[];
}

/**
 * In a market game, the market as the facilitator's copy keeps it, sent to every player whenever it changes: the
 * period being traded, whether it is open and for how many more seconds, the book's best prices, the last trades,
 * and the player's team's desk.
 */
export interface IMarketPayload {
	readonly round: number;
	readonly open: boolean;
	readonly remaining: number;
	readonly asset: string;
	readonly unit: string;
	readonly tick: number;
	readonly maxOrder: number;
	readonly bids: readonly IMarketLevel[];
	readonly asks: readonly IMarketLevel[];
	readonly trades: readonly IMarketTrade[];
	readonly last?: number;
	readonly volume: number;
	readonly desk?: IMarketDesk;
	/** Why the player's last order was refused, for that player alone. */
	readonly refused?: string;
}

/** A player's order for their team's desk: buy or sell shares at a price or better. */
export interface IOrderPayload {
	readonly round: number;
	readonly side: 'buy' | 'sell';
	readonly price: number;
	readonly quantity: number;
}

/** A player cancels one of their team's orders. */
export interface ICancelOrderPayload {
	readonly round: number;
	readonly id: string;
}

/**
 * In a game, a message between two teams (negotiations), which the facilitator's copy passes on and the facilitator
 * reads: from a player, with the team it is for; from the facilitator, to the players of both teams, with who wrote it
 * and from which team.
 */
export interface INegotiationPayload {
	readonly id: string;
	readonly text: string;
	readonly to: number;
	readonly from?: string;
	readonly fromTeam?: number;
}

/** A player's decisions for their team in a round; the last submitted before the round is played counts. */
export interface IDecisionsPayload {
	readonly round: number;
	readonly values: GameValues;
}

/** A table of a game's results, its cells written out by the facilitator's copy. */
export interface IGameTable {
	readonly title: string;
	readonly columns: readonly string[];
	readonly rows: readonly (readonly string[])[];
}

/** The results of a round, sent by the facilitator: the table every player sees and the team's own. */
export interface IGameResultsPayload {
	readonly round: number;
	readonly text?: string;
	/** What the model says to the player's team alone. */
	readonly teamText?: string;
	readonly tables: readonly IGameTable[];
}

/**
 * In a class, the breakout group a student is in (Split into Breakout Groups), sent by the tutor to each student in a
 * group when the groups start or change, when the tutor visits or leaves the group, and when everyone is brought back.
 */
export interface IGroupPayload {
	/** The group's number, from 1; none when everyone is back in the class. */
	readonly group?: number;
	/** The names of the others in the group. */
	readonly members?: readonly string[];
	/** Whether the tutor is visiting the group, so that the tutor's messages go to it alone. */
	readonly visiting?: boolean;
}

/**
 * An agent a participant invited (Invite an Agent): it runs on their computer, and they send its answers. Sent to
 * everyone when it joins, starts or stops answering, and leaves, and to each newcomer.
 */
export interface IAgentPayload {
	readonly id: string;
	/** Its name, by which a message starting with @ and the name asks it something. */
	readonly name: string;
	readonly state: 'present' | 'answering' | 'left';
}

/** A dataset (Share Dataset): a CSV file, or a Julia table written out as CSV. Plain text only, never a Julia object. */
export interface IDatasetSharedPayload {
	readonly id: string;
	/** The file's name, with its extension; the receiver keeps only its base name. */
	readonly fileName: string;
	/** The CSV text, at most MAX_DATASET_BYTES. */
	readonly content: string;
	/** Only from the tutor of a class: a student's dataset passed on within their breakout group, with the student's name. */
	readonly from?: string;
}

/** A file shared in the chat (Add > File), kept as bytes and never opened or run, the receiver can only save it;
 * or a DuckDB database (Add > Database), which the receiver can also attach, read-only, in their Julia session. */
export interface IFileSharedPayload {
	readonly id: string;
	/** The file's name, with its extension; the receiver keeps only its base name. */
	readonly fileName: string;
	/** The bytes in base64, at most MAX_FILE_BYTES once decoded. */
	readonly content: string;
	/** Only from the tutor of a class: a student's file passed on within their breakout group, with the student's name. */
	readonly from?: string;
}

// Same Page: the host shares one folder, whose files the others list and open through requests to the host. Each file
// open in a session is a Yjs document on the host, which passes every change to the participants who have it open.
// Paths are relative to the shared folder, with / between their parts.

/** What a participant asks of the host: a folder's entries, a path's kind, or to open, close or save a file. */
export type FileRequestOp = 'list' | 'stat' | 'open' | 'close' | 'save';

export interface IFileRequestPayload {
	readonly id: number;
	readonly op: FileRequestOp;
	readonly path: string;
}

/** Why the host refused a request. */
export type FileRequestError = 'notFound' | 'notAllowed' | 'tooLarge' | 'binary' | 'failed';

export interface IFolderEntry {
	readonly name: string;
	readonly folder: boolean;
}

export interface IFileResponsePayload {
	readonly id: number;
	readonly error?: FileRequestError;
	/** For list: the folder's entries, folders first. */
	readonly entries?: readonly IFolderEntry[];
	/** For stat: whether the path is a folder, and its size and time of change. */
	readonly folder?: boolean;
	readonly size?: number;
	readonly mtime?: number;
	/** For open: the Yjs document of the file, in base64. */
	readonly state?: string;
}

/** A change to a file open in the session: a Yjs update, in base64. */
export interface ITextUpdatePayload {
	readonly path: string;
	readonly update: string;
}

/** The host saved a file; `hash` is that of the text saved, so that a participant whose text is the same marks it saved. */
export interface ITextSavedPayload {
	readonly path: string;
	readonly hash: number;
}

/** Where a participant's cursor is: the file, and the two ends of the selection as Yjs relative positions in base64. */
export interface ICursorPayload {
	readonly path?: string;
	readonly anchor?: string;
	readonly head?: string;
}

/** Sent on leaving; from the host it ends the session. */
export interface IByePayload {
	readonly reason?: 'left' | 'ended';
}

interface IEnvelopeBase<T extends string, P> {
	readonly v: number;
	readonly type: T;
	readonly channel: Channel;
	readonly sentAt: number;
	readonly payload: P;
}

export type Envelope =
	| IEnvelopeBase<'hello', IHelloPayload>
	| IEnvelopeBase<'chat', IChatPayload>
	| IEnvelopeBase<'editorShared', IEditorSharedPayload>
	| IEnvelopeBase<'datasetShared', IDatasetSharedPayload>
	| IEnvelopeBase<'fileShared', IFileSharedPayload>
	| IEnvelopeBase<'databaseShared', IFileSharedPayload>
	| IEnvelopeBase<'bye', IByePayload>
	| IEnvelopeBase<'settings', ISettingsPayload>
	| IEnvelopeBase<'agent', IAgentPayload>
	| IEnvelopeBase<'group', IGroupPayload>
	| IEnvelopeBase<'game', IGamePayload>
	| IEnvelopeBase<'decisions', IDecisionsPayload>
	| IEnvelopeBase<'gameResults', IGameResultsPayload>
	| IEnvelopeBase<'negotiation', INegotiationPayload>
	| IEnvelopeBase<'order', IOrderPayload>
	| IEnvelopeBase<'cancelOrder', ICancelOrderPayload>
	| IEnvelopeBase<'market', IMarketPayload>
	| IEnvelopeBase<'fileRequest', IFileRequestPayload>
	| IEnvelopeBase<'fileResponse', IFileResponsePayload>
	| IEnvelopeBase<'textUpdate', ITextUpdatePayload>
	| IEnvelopeBase<'textSaved', ITextSavedPayload>
	| IEnvelopeBase<'filesChanged', Record<string, never>>
	| IEnvelopeBase<'cursor', ICursorPayload>;

export type EnvelopeType = Envelope['type'];

/** An envelope for the whole session, or for one participant. */
export function envelope<E extends Envelope>(type: E['type'], payload: E['payload'], channel: Channel = 'all'): E {
	const result: IEnvelopeBase<E['type'], E['payload']> = { v: PROTOCOL_VERSION, type, channel, sentAt: Date.now(), payload };
	return result as E;
}

const ENVELOPE_TYPES: ReadonlySet<string> = new Set<EnvelopeType>(['hello', 'chat', 'editorShared', 'datasetShared', 'fileShared', 'databaseShared', 'bye', 'settings', 'agent', 'group', 'game', 'decisions', 'gameResults', 'negotiation', 'order', 'cancelOrder', 'market', 'fileRequest', 'fileResponse', 'textUpdate', 'textSaved', 'filesChanged', 'cursor']);

/** Whether something received is an envelope this copy understands. */
export function isEnvelope(value: unknown): value is Envelope {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const candidate = value as Partial<Envelope>;
	return candidate.v === PROTOCOL_VERSION
		&& !!candidate.type && ENVELOPE_TYPES.has(candidate.type)
		&& typeof candidate.channel === 'string'
		&& !!candidate.payload && typeof candidate.payload === 'object';
}

/** Whether a data URL is an image the chat shows: PNG, JPEG, GIF or WebP, in base64, within the cap. */
export function isAcceptableImage(dataUrl: string): boolean {
	const match = /^data:image\/(?:png|jpeg|gif|webp);base64,(?<data>[A-Za-z0-9+/=]+)$/.exec(dataUrl);
	return !!match?.groups && imageBytes(dataUrl) <= MAX_IMAGE_BYTES;
}

/** The bytes of a base64 text, or undefined when it is not base64. */
export function base64Bytes(content: string): number | undefined {
	return /^[A-Za-z0-9+/]*={0,2}$/.test(content) && content.length % 4 === 0
		? content.length * 3 / 4 - (content.endsWith('==') ? 2 : content.endsWith('=') ? 1 : 0)
		: undefined;
}

/** Whether bytes start as a DuckDB database file does: its magic, DUCK, at offset 8. */
export function isDuckDbFile(bytes: Uint8Array): boolean {
	return bytes.length >= 12 && String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === 'DUCK';
}

/** The size of a base64 data URL once decoded, in bytes. */
export function imageBytes(dataUrl: string): number {
	const comma = dataUrl.indexOf(',');
	return Math.floor((dataUrl.length - comma - 1) * 3 / 4);
}

// Session codes: 20 characters of Crockford's base32 (no I, L, O, U), about 100 bits, in groups of five.
// The code is the invitation and the secret: the room is a hash of it and the code is Trystero's password,
// which encrypts the connection setup, so the introducing servers never see it.

const CODE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CODE_PATTERN = /(?<code>[0-9A-Za-z]{5}(?:-[0-9A-Za-z]{5}){3})(?<flags>(?:@(?:mqtt|class|game))*)/;

export interface ISessionCode {
	/** The code as shown, in groups of five. */
	readonly code: string;
	readonly strategy: SignallingStrategy;
	/** A session, whose participants all join its one room; or a class, whose students join a seat each; or a game, a class with teams. */
	readonly kind: 'session' | 'class' | 'game';
}

/** A new random session code. */
export function newSessionCode(strategy: SignallingStrategy, kind: ISessionCode['kind'] = 'session'): ISessionCode {
	const bytes = crypto.getRandomValues(new Uint8Array(20));
	const characters = Array.from(bytes, byte => CODE_ALPHABET[byte % 32]).join('');
	return { code: characters.match(/.{5}/g)!.join('-'), strategy, kind };
}

/** The code written as text, with the introduction servers when they are not the default, and whether it is a class's. */
export function formatSessionCode(code: ISessionCode): string {
	return code.code + (code.strategy === 'mqtt' ? '@mqtt' : '') + (code.kind === 'session' ? '' : `@${code.kind}`);
}

/** The session code in a code typed or pasted, or in a whole invitation; undefined when there is none. */
export function parseSessionCode(text: string): ISessionCode | undefined {
	const match = CODE_PATTERN.exec(text);
	if (!match?.groups) {
		return undefined;
	}
	// Read the letters Crockford's base32 leaves out as the digits they look like
	const code = match.groups.code.toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1');
	if (/[U]/.test(code)) {
		return undefined;
	}
	const flags = match.groups.flags ?? '';
	return { code, strategy: flags.includes('@mqtt') ? 'mqtt' : 'nostr', kind: flags.includes('@game') ? 'game' : flags.includes('@class') ? 'class' : 'session' };
}

/** The Trystero room of a session: a hash of its code, so the room name does not reveal the code. */
export async function roomIdOf(code: ISessionCode): Promise<string> {
	return sha256Hex(`pollis-session:${code.code}`);
}

/** The Trystero room of a seat of a class, where one student meets the tutor. */
export async function seatRoomIdOf(code: ISessionCode, seat: number): Promise<string> {
	return sha256Hex(`pollis-session:${code.code}:seat:${seat}`);
}

async function sha256Hex(text: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', VSBuffer.fromString(text).buffer);
	return encodeHex(VSBuffer.wrap(new Uint8Array(digest)));
}
