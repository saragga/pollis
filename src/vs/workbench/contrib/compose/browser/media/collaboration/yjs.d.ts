/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The types of the parts of Yjs (https://github.com/yjs/yjs, MIT) that yjs.js bundles, written for
// Compose > Collaboration from Yjs's own declarations; see bundle-yjs.sh.

/** The origin of a transaction: whoever made the change, as passed to `transact` or `applyUpdateV2`. */
export type Origin = unknown;

export interface Transaction {
	readonly origin: Origin;
	/** Whether the change was made here rather than received in an update. */
	readonly local: boolean;
}

/** One part of a change to a text: characters kept, inserted or deleted, in order from the start. */
export interface Delta {
	readonly insert?: string | object;
	readonly delete?: number;
	readonly retain?: number;
}

export interface YTextEvent {
	readonly delta: readonly Delta[];
	readonly transaction: Transaction;
}

export interface Text {
	readonly length: number;
	insert(index: number, text: string): void;
	delete(index: number, length: number): void;
	toString(): string;
	observe(observer: (event: YTextEvent, transaction: Transaction) => void): void;
	unobserve(observer: (event: YTextEvent, transaction: Transaction) => void): void;
}

export class Doc {
	constructor();
	getText(name?: string): Text;
	transact(change: (transaction: Transaction) => void, origin?: Origin): void;
	on(event: 'updateV2', handler: (update: Uint8Array, origin: Origin) => void): void;
	off(event: 'updateV2', handler: (update: Uint8Array, origin: Origin) => void): void;
	destroy(): void;
}

export interface UndoManagerOptions {
	/** The origins whose changes are undone; changes received from others are never in it. */
	readonly trackedOrigins?: Set<Origin>;
	/** Changes closer together than this, in ms, are undone as one. */
	readonly captureTimeout?: number;
}

export interface StackItem {
	readonly meta: Map<unknown, unknown>;
}

export class UndoManager {
	constructor(type: Text, options?: UndoManagerOptions);
	undo(): StackItem | null;
	redo(): StackItem | null;
	canUndo(): boolean;
	canRedo(): boolean;
	/** Makes the next change a new undo step, apart from the changes before it. */
	stopCapturing(): void;
	destroy(): void;
}

export function applyUpdateV2(doc: Doc, update: Uint8Array, origin?: Origin): void;
export function encodeStateAsUpdateV2(doc: Doc): Uint8Array;

/** A place in a text that stays with the characters around it while others edit the text. */
export interface RelativePosition { }

export interface AbsolutePosition {
	readonly type: Text;
	readonly index: number;
}

export function createRelativePositionFromTypeIndex(type: Text, index: number): RelativePosition;
export function createAbsolutePositionFromRelativePosition(position: RelativePosition, doc: Doc): AbsolutePosition | null;
export function encodeRelativePosition(position: RelativePosition): Uint8Array;
export function decodeRelativePosition(bytes: Uint8Array): RelativePosition;
