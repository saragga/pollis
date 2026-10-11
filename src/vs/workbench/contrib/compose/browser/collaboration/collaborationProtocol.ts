/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
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

/** The largest image in the chat, in bytes; larger ones are downscaled, or refused. */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** The largest editor or notebook shared (Share My Editor), in bytes, as text. */
export const MAX_SHARE_BYTES = 2 * 1024 * 1024;

/** Above this size a transfer shows a progress bar on both sides. */
export const PROGRESS_THRESHOLD_BYTES = 1024 * 1024;

/** The largest message a copy accepts from another, in bytes: a capped item encoded as text, with room to spare. */
export const MAX_RECEIVE_BYTES = 8 * 1024 * 1024;

/** How the participants are introduced to each other: free public nostr relays, or public mqtt brokers. */
export type SignallingStrategy = 'nostr' | 'mqtt';

/** The way of working, fixed when the session starts. Same Page comes later. */
export type SessionMode = 'sideBySide';

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
	/** Only from the host: whether the newcomer may stay; false when the session is full. */
	readonly admitted?: boolean;
}

export interface IChatPayload {
	readonly id: string;
	readonly text: string;
	/** A data URL of an image, at most MAX_IMAGE_BYTES once decoded. */
	readonly image?: string;
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
	| IEnvelopeBase<'bye', IByePayload>;

export type EnvelopeType = Envelope['type'];

/** An envelope for the whole session, or for one participant. */
export function envelope<E extends Envelope>(type: E['type'], payload: E['payload'], channel: Channel = 'all'): E {
	const result: IEnvelopeBase<E['type'], E['payload']> = { v: PROTOCOL_VERSION, type, channel, sentAt: Date.now(), payload };
	return result as E;
}

/** Whether something received is an envelope this copy understands. */
export function isEnvelope(value: unknown): value is Envelope {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const candidate = value as Partial<Envelope>;
	return candidate.v === PROTOCOL_VERSION
		&& (candidate.type === 'hello' || candidate.type === 'chat' || candidate.type === 'editorShared' || candidate.type === 'bye')
		&& typeof candidate.channel === 'string'
		&& !!candidate.payload && typeof candidate.payload === 'object';
}

/** Whether a data URL is an image the chat shows: PNG, JPEG, GIF or WebP, in base64, within the cap. */
export function isAcceptableImage(dataUrl: string): boolean {
	const match = /^data:image\/(?:png|jpeg|gif|webp);base64,(?<data>[A-Za-z0-9+/=]+)$/.exec(dataUrl);
	return !!match?.groups && imageBytes(dataUrl) <= MAX_IMAGE_BYTES;
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
const CODE_PATTERN = /(?<code>[0-9A-Za-z]{5}(?:-[0-9A-Za-z]{5}){3})(?<mqtt>@mqtt)?/;

export interface ISessionCode {
	/** The code as shown, in groups of five. */
	readonly code: string;
	readonly strategy: SignallingStrategy;
}

/** A new random session code. */
export function newSessionCode(strategy: SignallingStrategy): ISessionCode {
	const bytes = crypto.getRandomValues(new Uint8Array(20));
	const characters = Array.from(bytes, byte => CODE_ALPHABET[byte % 32]).join('');
	return { code: characters.match(/.{5}/g)!.join('-'), strategy };
}

/** The code written as text, with the introduction servers when they are not the default. */
export function formatSessionCode(code: ISessionCode): string {
	return code.strategy === 'mqtt' ? `${code.code}@mqtt` : code.code;
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
	return { code, strategy: match.groups.mqtt ? 'mqtt' : 'nostr' };
}

/** The Trystero room of a session: a hash of its code, so the room name does not reveal the code. */
export async function roomIdOf(code: ISessionCode): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', VSBuffer.fromString(`pollis-session:${code.code}`).buffer);
	return encodeHex(VSBuffer.wrap(new Uint8Array(digest)));
}
