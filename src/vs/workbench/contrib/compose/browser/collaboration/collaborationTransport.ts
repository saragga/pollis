/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------------------------
 *  Adapted from p2p-live-share (src/sync/trystero/controller.ts and src/utils.ts),
 *  https://github.com/KermanX/p2p-live-share, under the MIT License:
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

import { IntervalTimer } from '../../../../../base/common/async.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';

// Ordered, acknowledged delivery between session participants, over Trystero's data channels.
// Each message to a participant gets a sequence number; the receiver applies them in order and
// acknowledges them, and the sender sends again what is not acknowledged in time, so messages survive
// a connection that drops and comes back. Changes from p2p-live-share: no reactive scope (the session
// removes participants who leave), JSON payloads only, and a resend timeout that grows with the size
// of the message, so a large image on a slow link is not sent twice while it is still arriving.

const RESEND_TIMEOUT = 2000;
const RESEND_CHECK_INTERVAL = 2000;
/** The slowest link assumed when waiting for a large message to be acknowledged: 25 kB per second. */
const RESEND_BYTES_PER_MS = 25;
const ACK_INTERVAL = 200;

/** The action of acknowledgements; they are sent as they are, without a sequence number. */
export const ACK_ACTION = '_ack';

type JsonValue = null | string | number | boolean | JsonValue[] | { [key: string]: JsonValue };

/** What travels on the wire with each message. */
export interface IWireMetadata {
	readonly gsn?: number;
}

/** What goes over the data channel: an action, its data and the delivery metadata. */
export interface IWirePacket {
	readonly a: string;
	readonly d: JsonValue;
	readonly m?: IWireMetadata;
}

/** Sends a packet to one participant; resolves once Trystero has sent it. */
export type WireSender = (peerId: string, packet: IWirePacket) => Promise<void>;

/** Receives a message that is next in order from a participant. */
export type MessageReceiver = (action: string, data: JsonValue, peerId: string) => void;

interface IAckData {
	readonly applied: number;
	readonly received: number[];
}

interface ISendingState {
	sentAt: number;
	readonly packet: IWirePacket;
	readonly timeout: number;
}

interface IPeerState {
	sendGsn: number;
	readonly sending: Map<number, ISendingState>;
	lastApplied: number;
	readonly receiving: Map<number, { readonly action: string; readonly data: JsonValue }>;
	readonly ackExecutor: ThrottledExecutor;
}

/** Runs a task at once, then at most once every `delay` ms, keeping only the latest task meanwhile. */
class ThrottledExecutor extends Disposable {
	private timeout: ReturnType<typeof setTimeout> | undefined;
	private task: (() => void) | undefined;

	constructor(private readonly delay: number) {
		super();
		this._register({ dispose: () => clearTimeout(this.timeout) });
	}

	schedule(task: () => void): void {
		if (this.timeout === undefined) {
			task();
			this.timeout = setTimeout(() => {
				this.timeout = undefined;
				const pending = this.task;
				this.task = undefined;
				pending?.();
			}, this.delay);
		} else {
			this.task = task;
		}
	}
}

/** Ordered, acknowledged delivery to each participant. */
export class ReliableDelivery extends Disposable {

	private readonly peers = new Map<string, IPeerState>();
	private checking = false;

	constructor(
		private readonly wire: WireSender,
		private readonly receiver: MessageReceiver,
	) {
		super();
		const timer = this._register(new IntervalTimer());
		timer.cancelAndSet(() => this.resendUnacknowledged(), RESEND_CHECK_INTERVAL);
		this._register({ dispose: () => this.clear() });
	}

	/** Sends a message to the participants given, each in order with the earlier ones. */
	async send(action: string, data: JsonValue, peerIds: readonly string[]): Promise<void> {
		const timeout = RESEND_TIMEOUT + JSON.stringify(data).length / RESEND_BYTES_PER_MS;
		await Promise.allSettled(peerIds.map(peerId => {
			const peer = this.peer(peerId);
			const gsn = peer.sendGsn++;
			const state: ISendingState = { sentAt: Number.NaN, packet: { a: action, d: data, m: { gsn } }, timeout };
			peer.sending.set(gsn, state);
			return this.sendState(peerId, state);
		}));
	}

	/** Takes a packet from the wire: an acknowledgement, or a message to apply in order. */
	receive(packet: IWirePacket, peerId: string): void {
		const peer = this.peer(peerId);
		if (packet.a === ACK_ACTION) {
			const { applied, received } = packet.d as unknown as IAckData;
			for (const gsn of [...peer.sending.keys()]) {
				if (applied >= gsn || received.includes(gsn)) {
					peer.sending.delete(gsn);
				}
			}
			return;
		}

		const gsn = packet.m?.gsn;
		if (!gsn) {
			this.receiver(packet.a, packet.d, peerId);
			return;
		}
		if (gsn > peer.lastApplied) {
			peer.receiving.set(gsn, { action: packet.a, data: packet.d });
			while (true) {
				const next = peer.receiving.get(peer.lastApplied + 1);
				if (!next) {
					break;
				}
				peer.lastApplied++;
				peer.receiving.delete(peer.lastApplied);
				try {
					this.receiver(next.action, next.data, peerId);
				} catch (error) {
					console.error('Collaboration: error applying a received message', error);
				}
			}
		}
		// Acknowledge, also a message seen before, since its acknowledgement may have been lost
		peer.ackExecutor.schedule(() => {
			const ack: IAckData = { applied: peer.lastApplied, received: [...peer.receiving.keys()] };
			this.wire(peerId, { a: ACK_ACTION, d: ack as unknown as JsonValue }).catch(() => { /* sent again with the next message */ });
		});
	}

	/** Forgets a participant who left. */
	removePeer(peerId: string): void {
		this.peers.get(peerId)?.ackExecutor.dispose();
		this.peers.delete(peerId);
	}

	private peer(peerId: string): IPeerState {
		let peer = this.peers.get(peerId);
		if (!peer) {
			peer = { sendGsn: 1, sending: new Map(), lastApplied: 0, receiving: new Map(), ackExecutor: new ThrottledExecutor(ACK_INTERVAL) };
			this.peers.set(peerId, peer);
		}
		return peer;
	}

	private async sendState(peerId: string, state: ISendingState): Promise<void> {
		try {
			await this.wire(peerId, state.packet);
		} finally {
			state.sentAt = Date.now();
		}
	}

	private async resendUnacknowledged(): Promise<void> {
		if (this.checking) {
			return;
		}
		this.checking = true;
		await Promise.allSettled([...this.peers].map(async ([peerId, { sending }]) => {
			for (const [gsn, state] of sending) {
				if (state.sentAt && Date.now() - state.sentAt > state.timeout) {
					try {
						await this.sendState(peerId, state);
					} catch {
						console.error('Collaboration: failed to resend a message', peerId, gsn);
						sending.delete(gsn);
					}
				}
			}
		}));
		this.checking = false;
	}

	private clear(): void {
		for (const peerId of [...this.peers.keys()]) {
			this.removePeer(peerId);
		}
	}
}
