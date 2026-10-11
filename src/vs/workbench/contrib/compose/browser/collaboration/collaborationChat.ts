/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { FileAccess } from '../../../../../base/common/network.js';
import { localize } from '../../../../../nls.js';
import { asWebviewUri, webviewGenericCspSource } from '../../../webview/common/webview.js';
import { IWirePacket } from './collaborationTransport.js';
import { MAX_IMAGE_BYTES, MAX_RECEIVE_BYTES, PROGRESS_THRESHOLD_BYTES, SignallingStrategy } from './collaborationProtocol.js';

// The Collaboration chat page. As in p2p-live-share (whose chat it adapts: messages with images pasted or
// dragged in), the page holds the Trystero room, so the connection lives as long as the chat; the session
// itself (who is who, admission, delivery in order) is the workbench's, in collaborationService.ts.
// The page shows what the workbench tells it to and sends what it is asked to.

/** The folder of the vendored Trystero bundles, which the chat and Test Connection pages load. */
export const COLLABORATION_MEDIA = FileAccess.asFileUri('vs/workbench/contrib/compose/browser/media/collaboration');

/** The URL a page loads the Trystero bundle of a strategy from. */
export function trysteroBundleUrl(strategy: SignallingStrategy): string {
	return asWebviewUri(FileAccess.asFileUri(`vs/workbench/contrib/compose/browser/media/collaboration/trystero-${strategy}.js`)).toString(true);
}

/** A line of the chat: a message, or a notice such as "B joined". */
export interface IChatEntry {
	readonly kind: 'message' | 'notice';
	readonly name?: string;
	readonly mine?: boolean;
	readonly text: string;
	readonly image?: string;
	readonly time: number;
}

export interface IChatParticipant {
	/** Trystero's id of the participant, for the progress bars' names. */
	readonly peerId: string;
	readonly name: string;
	readonly host: boolean;
	readonly you: boolean;
}

/** A participant's connection, as WebRTC reports it. */
export interface IPeerConnectionStats {
	readonly peerId: string;
	/** The candidate types of the pair in use: host, srflx and prflx are direct, relay is through the relay. */
	readonly localType?: string;
	readonly remoteType?: string;
	readonly protocol?: string;
	/** Round trip in seconds. */
	readonly roundTrip?: number;
}

/** From the workbench to the page. */
export type ChatPageMessage =
	| { readonly command: 'join'; readonly bundleUrl: string; readonly appId: string; readonly roomId: string; readonly password: string }
	| { readonly command: 'send'; readonly id: number; readonly peerId: string; readonly packet: IWirePacket }
	| { readonly command: 'leave' }
	| { readonly command: 'show'; readonly entry: IChatEntry }
	| { readonly command: 'participants'; readonly participants: readonly IChatParticipant[] }
	| { readonly command: 'session'; readonly code: string; readonly status: string; readonly ended: boolean }
	| { readonly command: 'stats'; readonly id: number };

/** From the page to the workbench. */
export type ChatWorkbenchMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'joined'; readonly selfId: string }
	| { readonly command: 'joinError'; readonly error: string }
	| { readonly command: 'peerJoin'; readonly peerId: string }
	| { readonly command: 'peerLeave'; readonly peerId: string }
	| { readonly command: 'packet'; readonly peerId: string; readonly packet: IWirePacket }
	| { readonly command: 'sent'; readonly id: number; readonly error?: string }
	| { readonly command: 'stats'; readonly id: number; readonly peers: readonly IPeerConnectionStats[] }
	| { readonly command: 'sendChat'; readonly text: string; readonly image?: string }
	| { readonly command: 'notice'; readonly text: string }
	| { readonly command: 'copyInvitation' }
	| { readonly command: 'testConnection' }
	| { readonly command: 'leaveSession' };

/** The chat page: its texts come from here, the session from the workbench's messages. */
export function chatPageHtml(): string {
	const text = {
		title: localize('collaborationChat.title', "Collaboration Chat"),
		participants: localize('collaborationChat.participants', "Participants:"),
		host: localize('collaborationChat.host', "host"),
		you: localize('collaborationChat.you', "you"),
		copyInvitation: localize('collaborationChat.copyInvitation', "Copy Invitation"),
		copied: localize('collaborationChat.copied', "Copied"),
		testConnection: localize('collaborationChat.testConnection', "Test Connection"),
		leave: localize('collaborationChat.leave', "Leave Session"),
		placeholder: localize('collaborationChat.placeholder', "Write a message; paste or drag in an image. Enter sends, Shift+Enter starts a new line."),
		send: localize('collaborationChat.send', "Send"),
		addImage: localize('collaborationChat.addImage', "Add Image"),
		removeImage: localize('collaborationChat.removeImage', "Remove Image"),
		sending: localize('collaborationChat.sending', "Sending {0} to {1}", '{0}', '{1}'),
		receiving: localize('collaborationChat.receiving', "Receiving {0} from {1}", '{0}', '{1}'),
		aMessage: localize('collaborationChat.aMessage', "a message"),
		imageTooLarge: localize('collaborationChat.imageTooLarge', "This image is too large for the chat, even reduced (the limit is {0} MB): send it the usual way.", MAX_IMAGE_BYTES / 1024 / 1024),
		notAnImage: localize('collaborationChat.notAnImage', "Only images can go in the chat."),
		ended: localize('collaborationChat.ended', "The session has ended. Start or join another from Compose > Collaboration."),
	};
	const csp = `default-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; connect-src wss: https:; script-src ${webviewGenericCspSource} 'unsafe-inline';`;
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="${csp}">
	<style>
		* { box-sizing: border-box; }
		html, body { height: 100%; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); display: flex; flex-direction: column; }
		header { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 6px 12px; border-bottom: 1px solid var(--vscode-widget-border); }
		header .people { flex: 1; min-width: 200px; }
		.person { display: inline-block; margin-right: 10px; }
		.person .role { color: var(--vscode-descriptionForeground); }
		.code { font-family: var(--vscode-editor-font-family); font-size: 12px; color: var(--vscode-descriptionForeground); }
		.status { padding: 4px 12px; color: var(--vscode-descriptionForeground); font-style: italic; }
		.status:empty { display: none; }
		#messages { flex: 1; overflow-y: auto; padding: 8px 12px; }
		.entry { margin: 0 0 8px 0; line-height: 1.4; }
		.entry .meta { font-size: 11px; color: var(--vscode-descriptionForeground); }
		.entry .meta b { color: var(--vscode-foreground); font-weight: 600; margin-right: 6px; }
		.entry .text { white-space: pre-wrap; overflow-wrap: anywhere; }
		.entry img { display: block; max-width: min(100%, 480px); max-height: 360px; margin-top: 4px; border: 1px solid var(--vscode-widget-border); cursor: zoom-in; }
		.entry img.large { max-width: 100%; max-height: none; cursor: zoom-out; }
		.entry.mine .meta b { color: var(--vscode-textLink-foreground); }
		.entry.notice { color: var(--vscode-descriptionForeground); font-style: italic; }
		#progress { padding: 0 12px; }
		.bar { margin: 4px 0; font-size: 11px; color: var(--vscode-descriptionForeground); }
		.bar progress { width: 100%; height: 6px; }
		footer { border-top: 1px solid var(--vscode-widget-border); padding: 8px 12px; }
		#attachment { display: none; align-items: center; gap: 8px; margin-bottom: 6px; }
		#attachment img { max-height: 64px; border: 1px solid var(--vscode-widget-border); }
		.composer { display: flex; gap: 8px; align-items: flex-end; }
		textarea { flex: 1; resize: none; min-height: 36px; max-height: 160px; font: inherit; padding: 6px 8px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, transparent); border-radius: 2px; }
		textarea:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		body.dragging footer { outline: 2px dashed var(--vscode-focusBorder); outline-offset: -4px; }
		button { font: inherit; padding: 4px 12px; border: none; border-radius: 2px; cursor: pointer; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); white-space: nowrap; }
		button:hover { background: var(--vscode-button-secondaryHoverBackground); }
		button.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.primary:hover { background: var(--vscode-button-hoverBackground); }
		button:disabled { opacity: 0.5; cursor: default; }
		.link { color: var(--vscode-textLink-foreground); background: none; padding: 0; }
		.link:hover { background: none; text-decoration: underline; }
	</style>
</head>
<body>
	<header>
		<div class="people"><span id="people"></span> <span class="code" id="code"></span></div>
		<button id="copyInvitation">${text.copyInvitation}</button>
		<button id="testConnection">${text.testConnection}</button>
		<button id="leave">${text.leave}</button>
	</header>
	<div class="status" id="status"></div>
	<div id="messages"></div>
	<div id="progress"></div>
	<footer>
		<div id="attachment"><img id="attachmentImage" alt=""><button class="link" id="removeImage">${text.removeImage}</button></div>
		<div class="composer">
			<textarea id="input" rows="1" placeholder="${text.placeholder}"></textarea>
			<button id="addImage" title="${text.addImage}">${text.addImage}</button>
			<button class="primary" id="send">${text.send}</button>
			<input type="file" id="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden>
		</div>
	</footer>
<script type="module">
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const MAX_IMAGE_BYTES = ${MAX_IMAGE_BYTES};
	const MAX_RECEIVE_BYTES = ${MAX_RECEIVE_BYTES};
	const PROGRESS_THRESHOLD_BYTES = ${PROGRESS_THRESHOLD_BYTES};
	const $ = id => document.getElementById(id);
	const messages = $('messages'), input = $('input'), progressArea = $('progress');

	// ---- The Trystero room: joined, sent to and left as the workbench asks ----

	let room, packets, ended = false;
	const names = new Map();

	async function join(message) {
		const trystero = await import(message.bundleUrl);
		room = trystero.joinRoom({
			appId: message.appId,
			password: message.password,
			maxReceiveBytes: MAX_RECEIVE_BYTES,
		}, message.roomId, {
			onJoinError: details => vscode.postMessage({ command: 'joinError', error: details.error }),
		});
		packets = room.makeAction('pollis', {
			onReceive: context => {
				if (context.byteLength > MAX_RECEIVE_BYTES) {
					return false;
				}
				if (context.byteLength > PROGRESS_THRESHOLD_BYTES) {
					progressBar('in:' + context.peerId, TEXT.receiving, context.peerId, context.byteLength);
				}
				return true;
			},
			onReceiveProgress: (progress, context) => updateBar('in:' + context.peerId, progress),
			onMessage: (packet, context) => {
				removeBar('in:' + context.peerId);
				vscode.postMessage({ command: 'packet', peerId: context.peerId, packet });
			},
		});
		room.onPeerJoin = peerId => vscode.postMessage({ command: 'peerJoin', peerId });
		room.onPeerLeave = peerId => {
			removeBar('in:' + peerId);
			vscode.postMessage({ command: 'peerLeave', peerId });
		};
		vscode.postMessage({ command: 'joined', selfId: trystero.selfId });
	}

	async function send(message) {
		const size = JSON.stringify(message.packet).length;
		const key = 'out:' + message.id;
		if (size > PROGRESS_THRESHOLD_BYTES) {
			progressBar(key, TEXT.sending, message.peerId, size);
		}
		try {
			await packets.send(message.packet, {
				target: message.peerId,
				onProgress: size > PROGRESS_THRESHOLD_BYTES ? progress => updateBar(key, progress) : undefined,
			});
			vscode.postMessage({ command: 'sent', id: message.id });
		} catch (error) {
			vscode.postMessage({ command: 'sent', id: message.id, error: String(error) });
		} finally {
			removeBar(key);
		}
	}

	// Which connection each participant is on: the candidate pair in use, and its round trip
	async function stats(id) {
		const peers = [];
		for (const [peerId, connection] of Object.entries(room ? room.getPeers() : {})) {
			const report = new Map();
			(await connection.getStats()).forEach(entry => report.set(entry.id, entry));
			let pair;
			for (const entry of report.values()) {
				if (entry.type === 'transport' && entry.selectedCandidatePairId) {
					pair = report.get(entry.selectedCandidatePairId);
				}
			}
			if (!pair) {
				pair = [...report.values()].find(entry => entry.type === 'candidate-pair' && entry.nominated && entry.state === 'succeeded');
			}
			const local = pair && report.get(pair.localCandidateId);
			const remote = pair && report.get(pair.remoteCandidateId);
			peers.push({ peerId, localType: local?.candidateType, remoteType: remote?.candidateType, protocol: local?.protocol, roundTrip: pair?.currentRoundTripTime });
		}
		vscode.postMessage({ command: 'stats', id, peers });
	}

	// ---- Progress bars, above about 1 MB ----

	function progressBar(key, label, peerId, bytes) {
		removeBar(key);
		const bar = document.createElement('div');
		bar.className = 'bar';
		bar.id = 'bar-' + key;
		const caption = document.createElement('div');
		const size = (bytes / 1024 / 1024).toFixed(1) + ' MB';
		caption.textContent = label.replace('{0}', size).replace('{1}', names.get(peerId) || '');
		const meter = document.createElement('progress');
		meter.max = 1;
		meter.value = 0;
		bar.append(caption, meter);
		progressArea.append(bar);
	}
	function updateBar(key, progress) {
		const meter = document.querySelector('#bar-' + CSS.escape(key) + ' progress');
		if (meter) {
			meter.value = progress;
		}
	}
	function removeBar(key) {
		document.getElementById('bar-' + key)?.remove();
	}

	// ---- The chat ----

	function show(entry) {
		const element = document.createElement('div');
		element.className = 'entry ' + entry.kind + (entry.mine ? ' mine' : '');
		const time = new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		if (entry.kind === 'message') {
			const meta = document.createElement('div');
			meta.className = 'meta';
			const name = document.createElement('b');
			name.textContent = entry.name;
			meta.append(name, time);
			element.append(meta);
		}
		if (entry.text) {
			const body = document.createElement('div');
			body.className = 'text';
			body.textContent = entry.kind === 'notice' ? time + '  ' + entry.text : entry.text;
			element.append(body);
		}
		const atBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight < 40;
		const follow = atBottom || entry.mine;
		if (entry.image) {
			const image = document.createElement('img');
			image.src = entry.image;
			image.addEventListener('click', () => image.classList.toggle('large'));
			// The image has no height until it loads: scroll again then
			image.addEventListener('load', () => {
				if (follow) {
					messages.scrollTop = messages.scrollHeight;
				}
			}, { once: true });
			element.append(image);
		}
		messages.append(element);
		if (follow) {
			messages.scrollTop = messages.scrollHeight;
		}
	}

	function showParticipants(participants) {
		const people = $('people');
		people.textContent = '';
		const label = document.createElement('span');
		label.textContent = TEXT.participants + ' ';
		people.append(label);
		for (const participant of participants) {
			const person = document.createElement('span');
			person.className = 'person';
			person.textContent = participant.name;
			const roles = [participant.host ? TEXT.host : '', participant.you ? TEXT.you : ''].filter(Boolean);
			if (roles.length) {
				const role = document.createElement('span');
				role.className = 'role';
				role.textContent = ' (' + roles.join(', ') + ')';
				person.append(role);
			}
			people.append(person);
		}
	}

	let image;
	function attach(dataUrl) {
		image = dataUrl;
		$('attachmentImage').src = dataUrl || '';
		$('attachment').style.display = dataUrl ? 'flex' : 'none';
	}

	const imageBytes = dataUrl => Math.floor((dataUrl.length - dataUrl.indexOf(',') - 1) * 3 / 4);
	const readAsDataUrl = file => new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});

	// Images over the cap, or very large, are reduced: longest side 1600 px as PNG, then as JPEG
	async function prepareImage(file) {
		if (!/^image\\/(png|jpeg|gif|webp)$/.test(file.type)) {
			vscode.postMessage({ command: 'notice', text: TEXT.notAnImage });
			return;
		}
		const original = await readAsDataUrl(file);
		const picture = new Image();
		picture.src = original;
		await picture.decode();
		if (imageBytes(original) <= MAX_IMAGE_BYTES && Math.max(picture.width, picture.height) <= 2400) {
			attach(original);
			return;
		}
		const scale = Math.min(1, 1600 / Math.max(picture.width, picture.height));
		const canvas = document.createElement('canvas');
		canvas.width = Math.round(picture.width * scale);
		canvas.height = Math.round(picture.height * scale);
		canvas.getContext('2d').drawImage(picture, 0, 0, canvas.width, canvas.height);
		let reduced = canvas.toDataURL('image/png');
		if (imageBytes(reduced) > MAX_IMAGE_BYTES) {
			reduced = canvas.toDataURL('image/jpeg', 0.9);
		}
		if (imageBytes(reduced) > MAX_IMAGE_BYTES) {
			vscode.postMessage({ command: 'notice', text: TEXT.imageTooLarge });
			return;
		}
		attach(reduced);
	}

	function sendChat() {
		const textValue = input.value.trim();
		if (ended || (!textValue && !image)) {
			return;
		}
		vscode.postMessage({ command: 'sendChat', text: textValue, image });
		input.value = '';
		attach(undefined);
		resize();
	}

	function resize() {
		input.style.height = 'auto';
		input.style.height = Math.min(input.scrollHeight + 2, 160) + 'px';
	}

	input.addEventListener('input', resize);
	input.addEventListener('keydown', e => {
		if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
			e.preventDefault();
			sendChat();
		}
	});
	input.addEventListener('paste', e => {
		const file = [...(e.clipboardData?.files || [])].find(item => item.type.startsWith('image/'));
		if (file) {
			e.preventDefault();
			prepareImage(file);
		}
	});
	document.body.addEventListener('dragover', e => { e.preventDefault(); document.body.classList.add('dragging'); });
	document.body.addEventListener('dragleave', () => document.body.classList.remove('dragging'));
	document.body.addEventListener('drop', e => {
		e.preventDefault();
		document.body.classList.remove('dragging');
		const file = e.dataTransfer?.files?.[0];
		if (file) {
			prepareImage(file);
		}
	});
	$('send').addEventListener('click', sendChat);
	$('addImage').addEventListener('click', () => $('file').click());
	$('file').addEventListener('change', () => {
		const file = $('file').files[0];
		$('file').value = '';
		if (file) {
			prepareImage(file);
		}
	});
	$('removeImage').addEventListener('click', () => attach(undefined));
	$('copyInvitation').addEventListener('click', () => {
		vscode.postMessage({ command: 'copyInvitation' });
		const button = $('copyInvitation');
		button.textContent = TEXT.copied;
		setTimeout(() => { button.textContent = TEXT.copyInvitation; }, 1500);
	});
	$('testConnection').addEventListener('click', () => vscode.postMessage({ command: 'testConnection' }));
	$('leave').addEventListener('click', () => vscode.postMessage({ command: 'leaveSession' }));

	window.addEventListener('message', event => {
		const message = event.data;
		switch (message.command) {
			case 'join': join(message).catch(error => vscode.postMessage({ command: 'joinError', error: String(error) })); break;
			case 'send': send(message); break;
			case 'leave':
				room?.leave();
				room = undefined;
				break;
			case 'show': show(message.entry); break;
			case 'participants':
				names.clear();
				for (const participant of message.participants) {
					names.set(participant.peerId, participant.name);
				}
				showParticipants(message.participants);
				break;
			case 'session':
				$('code').textContent = message.code;
				$('status').textContent = message.ended ? TEXT.ended : message.status;
				ended = message.ended;
				for (const id of ['send', 'addImage', 'copyInvitation', 'leave']) {
					$(id).disabled = ended;
				}
				input.disabled = ended;
				break;
			case 'stats': stats(message.id); break;
		}
	});
	vscode.postMessage({ command: 'ready' });
	input.focus();
</script>
</body>
</html>`;
}
