/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as tls from 'tls';
import { alertOf, alertSourceOf, parseAlertEmail } from '../common/alertEmails.js';
import { IAlertEmail, IAlertsMailbox, IAlertsMailboxPosition, IAlertsMailboxService } from '../common/alertsMailbox.js';

// Pollis: reads the alerts mailbox over IMAP with TLS, read only: the folder is examined, not selected, and the
// messages are fetched with BODY.PEEK, so none is marked read, moved or deleted. Only the commands this needs are
// spoken, and the MIME of the messages is decoded here, without a library.

const TIMEOUT = 30_000;
// At most this many messages are read at a time, the newest; the first time, those of the last year.
const MAX_MESSAGES = 300;
const FETCH_BATCH = 20;
const DAY = 24 * 60 * 60 * 1000;

export class AlertsMailboxService implements IAlertsMailboxService {

	async read(mailbox: IAlertsMailbox, password: string, position: IAlertsMailboxPosition | undefined): Promise<{ readonly position: IAlertsMailboxPosition; readonly emails: readonly IAlertEmail[] }> {
		const connection = await ImapConnection.open(mailbox.server, mailbox.port);
		try {
			await connection.command(`LOGIN ${quote(mailbox.user)} ${quote(password)}`);
			const examined = await connection.command(`EXAMINE ${quote(mailbox.folder)}`);
			const uidValidity = Number(/\[UIDVALIDITY (?<value>\d+)\]/i.exec(examined.map(line => line.text).join('\n'))?.groups?.value ?? 0);
			// The folder's UIDs start again when its UIDVALIDITY changes: then it is read as the first time
			const from = position && position.uidValidity === uidValidity ? position.lastUid : 0;
			const search = await connection.command(from ? `UID SEARCH UID ${from + 1}:*` : `UID SEARCH SINCE ${imapDate(new Date(Date.now() - 365 * DAY))}`);
			// `n:*` always includes the last message, even when its UID is below n
			const uids = search.flatMap(line => /^\* SEARCH\b/i.test(line.text) ? line.text.slice(8).trim().split(/\s+/).filter(Boolean).map(Number) : []).filter(uid => uid > from).sort((a, b) => a - b).slice(-MAX_MESSAGES);
			const emails: IAlertEmail[] = [];
			for (let index = 0; index < uids.length; index += FETCH_BATCH) {
				const fetched = await connection.command(`UID FETCH ${uids.slice(index, index + FETCH_BATCH).join(',')} (UID INTERNALDATE BODY.PEEK[])`);
				for (const line of fetched) {
					const raw = line.literals[line.literals.length - 1];
					if (/^\* \d+ FETCH\b/i.test(line.text) && raw) {
						const internalDate = /INTERNALDATE "(?<date>[^"]+)"/i.exec(line.text)?.groups?.date;
						const email = toAlertEmail(raw, internalDate ? Date.parse(internalDate.trim().replace(/^(?<day>\d{1,2})-(?<month>\w{3})-(?<year>\d{4})/, '$<day> $<month> $<year>')) : NaN);
						if (email) {
							emails.push(email);
						}
					}
				}
			}
			await connection.command('LOGOUT').catch(() => undefined);
			return { position: { uidValidity, lastUid: Math.max(from, ...uids) }, emails };
		} finally {
			connection.close();
		}
	}
}

/** A response line of the server, with the literals (`{size}` and the bytes after it) it holds. */
interface IImapLine {
	readonly text: string;
	readonly literals: readonly Buffer[];
}

class ImapConnection {

	private buffer = Buffer.alloc(0);
	private waiting: (() => void) | undefined;
	private failure: Error | undefined;
	private tag = 0;

	private constructor(private readonly socket: tls.TLSSocket) {
		socket.setTimeout(TIMEOUT, () => socket.destroy(new Error('The mail server did not answer.')));
		socket.on('data', (data: Buffer) => {
			this.buffer = Buffer.concat([this.buffer, data]);
			this.wake();
		});
		socket.on('error', error => {
			this.failure ??= error;
			this.wake();
		});
		socket.on('close', () => {
			this.failure ??= new Error('The mail server closed the connection.');
			this.wake();
		});
	}

	static async open(host: string, port: number): Promise<ImapConnection> {
		const socket = tls.connect({ host, port, servername: host });
		const connection = new ImapConnection(socket);
		const greeting = await connection.readLine();
		if (!/^\* (?:OK|PREAUTH)\b/i.test(greeting.text)) {
			connection.close();
			throw new Error(greeting.text);
		}
		return connection;
	}

	/** Sends `command`, and returns the server's untagged lines; rejects with its message when it does not say OK. */
	async command(command: string): Promise<IImapLine[]> {
		const tag = `P${++this.tag}`;
		this.socket.write(`${tag} ${command}\r\n`);
		const lines: IImapLine[] = [];
		for (; ;) {
			const line = await this.readLine();
			if (line.text.startsWith(`${tag} `)) {
				const status = line.text.slice(tag.length + 1);
				if (!/^OK\b/i.test(status)) {
					throw new Error(status.replace(/^(?:NO|BAD)\s+/i, '').replace(/^\[[^\]]*\]\s*/, '') || status);
				}
				return lines;
			}
			lines.push(line);
		}
	}

	close(): void {
		this.socket.destroy();
	}

	private async readLine(): Promise<IImapLine> {
		let text = '';
		const literals: Buffer[] = [];
		for (; ;) {
			const end = await this.until(() => this.buffer.indexOf('\r\n'));
			const line = this.buffer.subarray(0, end).toString('latin1');
			this.buffer = this.buffer.subarray(end + 2);
			text += line;
			const size = /\{(?<size>\d+)\}$/.exec(line)?.groups?.size;
			if (size === undefined) {
				return { text, literals };
			}
			const length = Number(size);
			await this.until(() => this.buffer.length >= length ? length : -1);
			literals.push(this.buffer.subarray(0, length));
			this.buffer = this.buffer.subarray(length);
		}
	}

	/** Waits until `find` finds what it looks for in the bytes received, and returns where. */
	private async until(find: () => number): Promise<number> {
		for (; ;) {
			const found = find();
			if (found >= 0) {
				return found;
			}
			if (this.failure) {
				throw this.failure;
			}
			await new Promise<void>(resolve => this.waiting = resolve);
		}
	}

	private wake(): void {
		const waiting = this.waiting;
		this.waiting = undefined;
		waiting?.();
	}
}

/** `value` as an IMAP quoted string. */
function quote(value: string): string {
	return `"${value.replace(/[\\"]/g, '\\$&')}"`;
}

function imapDate(date: Date): string {
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return `${date.getUTCDate()}-${months[date.getUTCMonth()]}-${date.getUTCFullYear()}`;
}

/** The alert in the message `raw`, dated `received`; undefined when it is not an alert email or has no articles. */
function toAlertEmail(raw: Buffer, received: number): IAlertEmail | undefined {
	const { headers, body } = splitMessage(raw.toString('latin1'));
	const content = readPart(headers, body);
	const html = content.html ?? (content.text ?? '').replace(/(?<link>https?:\/\/[^\s<>"]+)/g, '<a href="$<link>">$<link></a>');
	const from = decodeWords(headers.get('from') ?? '');
	const source = alertSourceOf(from, html);
	const articles = source ? parseAlertEmail(source, html) : [];
	if (!source || !articles.length) {
		return undefined;
	}
	const sent = Date.parse(headers.get('date') ?? '');
	return { source, ...alertOf(source, decodeWords(headers.get('subject') ?? '')), date: isNaN(received) ? (isNaN(sent) ? Date.now() : sent) : received, articles };
}

/** The headers (names in lower case, folded lines joined) and the body of a message or part, as latin1 text. */
function splitMessage(message: string): { readonly headers: Map<string, string>; readonly body: string } {
	const end = /\r?\n\r?\n/.exec(message);
	const head = end ? message.slice(0, end.index) : message;
	const headers = new Map<string, string>();
	for (const line of head.replace(/\r?\n[ \t]+/g, ' ').split(/\r?\n/)) {
		const colon = line.indexOf(':');
		const name = line.slice(0, colon).trim().toLowerCase();
		if (colon > 0 && !headers.has(name)) {
			headers.set(name, line.slice(colon + 1).trim());
		}
	}
	return { headers, body: end ? message.slice(end.index + end[0].length) : '' };
}

/** The first HTML and plain text of a part, looking into multiparts. */
function readPart(headers: Map<string, string>, body: string): { html?: string; text?: string } {
	const type = headers.get('content-type') ?? 'text/plain';
	const parameter = (name: string) => new RegExp(`;\\s*${name}\\s*=\\s*(?:"(?<quoted>[^"]*)"|(?<plain>[^;\\s]+))`, 'i').exec(type)?.groups;
	if (/^multipart\//i.test(type)) {
		const boundary = parameter('boundary');
		const delimiter = boundary && (boundary.quoted ?? boundary.plain);
		const result: { html?: string; text?: string } = {};
		if (delimiter) {
			const parts = body.split(`--${delimiter}`).slice(1);
			for (const part of parts) {
				if (part.startsWith('--')) {
					break;
				}
				const { headers, body } = splitMessage(part.replace(/^\r?\n/, ''));
				const found = readPart(headers, body);
				result.html ??= found.html;
				result.text ??= found.text;
			}
		}
		return result;
	}
	const isHtml = /^text\/html/i.test(type);
	if (!isHtml && !/^text\/plain/i.test(type) || /^attachment/i.test(headers.get('content-disposition') ?? '')) {
		return {};
	}
	const encoding = (headers.get('content-transfer-encoding') ?? '').toLowerCase();
	const bytes = encoding === 'base64' ? Buffer.from(body.replace(/[^A-Za-z0-9+/=]/g, ''), 'base64')
		: encoding === 'quoted-printable' ? decodeQuotedPrintable(body, false)
			: Buffer.from(body, 'latin1');
	const charset = parameter('charset');
	const decoded = decodeCharset(bytes, charset?.quoted ?? charset?.plain);
	return isHtml ? { html: decoded } : { text: decoded };
}

function decodeQuotedPrintable(text: string, header: boolean): Buffer {
	const source = header ? text.replace(/_/g, ' ') : text.replace(/=\r?\n/g, '');
	const bytes: number[] = [];
	for (let index = 0; index < source.length; index++) {
		const hex = source.slice(index + 1, index + 3);
		if (source[index] === '=' && /^[0-9A-Fa-f]{2}$/.test(hex)) {
			bytes.push(parseInt(hex, 16));
			index += 2;
		} else {
			bytes.push(source.charCodeAt(index) & 0xff);
		}
	}
	return Buffer.from(bytes);
}

function decodeCharset(bytes: Buffer, charset: string | undefined): string {
	try {
		return new TextDecoder(charset || 'utf-8').decode(bytes);
	} catch {
		return new TextDecoder('utf-8').decode(bytes);
	}
}

/** A header with its encoded words (`=?charset?B|Q?text?=`) decoded; the header itself is latin1 text of UTF-8 bytes. */
function decodeWords(value: string): string {
	const decoded = value
		.replace(/(?<=\?=)\s+(?==\?)/g, '')
		.replace(/=\?(?<charset>[^?]+)\?(?<encoding>[BbQq])\?(?<text>[^?]*)\?=/g, (_, charset: string, encoding: string, text: string) =>
			Buffer.from(decodeCharset(encoding.toUpperCase() === 'B' ? Buffer.from(text, 'base64') : decodeQuotedPrintable(text, true), charset.replace(/\*.*$/, ''))).toString('latin1'));
	return decodeCharset(Buffer.from(decoded, 'latin1'), 'utf-8');
}
