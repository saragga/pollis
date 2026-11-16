/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { FileAccess } from '../../../../../base/common/network.js';
import { localize } from '../../../../../nls.js';
import { asWebviewUri, webviewGenericCspSource } from '../../../webview/common/webview.js';
import { composerSendSvg } from '../../../model/browser/webviews/webviewScaffold.js';
import { composerAddCss, composerAddHtml, composerAddScript } from '../composerAdd.js';
import { composerVoiceCss, composerVoiceHtml, composerVoiceScript } from '../composerVoice.js';
import { IWirePacket } from './collaborationTransport.js';
import { GameValues, IFolderEntry, IGameDecision, IGameTable, MAX_FILE_BYTES, MAX_IMAGE_BYTES, MAX_RECEIVE_BYTES, PROGRESS_THRESHOLD_BYTES, SignallingStrategy } from './collaborationProtocol.js';

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

/** A dataset card: who shared what, its size and first rows; its buttons ask the workbench by id. */
export interface IChatDataset {
	readonly id: string;
	readonly fileName: string;
	readonly rows: number;
	readonly columns: number;
	readonly size: string;
	readonly header: readonly string[];
	readonly head: readonly (readonly string[])[];
	readonly formulas: boolean;
}

/** A file card: who shared which file and its size; its buttons, Save As and for a database Attach, ask the workbench by id. */
export interface IChatFile {
	readonly id: string;
	readonly fileName: string;
	readonly size: string;
	readonly database: boolean;
}

/** A line of the chat: a message, a notice such as "B joined", or a dataset or file another participant shared. */
export interface IChatEntry {
	readonly kind: 'message' | 'notice' | 'dataset' | 'file';
	readonly name?: string;
	readonly mine?: boolean;
	readonly text: string;
	readonly image?: string;
	readonly dataset?: IChatDataset;
	readonly file?: IChatFile;
	/** In a game, the tables of a round's results. */
	readonly tables?: readonly IGameTable[];
	readonly time: number;
}

/**
 * A game, as the column beside the chat shows it: to the facilitator, the teams, who submitted and Next Round;
 * to a player, their team's decisions for the round, with Submit.
 */
export interface IChatGame {
	readonly title: string;
	readonly description: string;
	readonly roundLabel: string;
	readonly rounds: number;
	/** 0 before the game starts, rounds + 1 once it is over. */
	readonly round: number;
	readonly facilitator: boolean;
	/** For the facilitator: whether a round is being played, the teams, and the players in none yet. */
	readonly running?: boolean;
	readonly teams?: readonly { readonly name: string; readonly members: readonly string[]; readonly submittedBy?: string }[];
	readonly waiting?: readonly string[];
	/** For a player: their team, its decisions and their values, and who submitted them. */
	readonly team?: number;
	readonly teamName?: string;
	readonly decisions?: readonly IGameDecision[];
	readonly values?: GameValues;
	readonly submittedBy?: string;
}

export interface IChatParticipant {
	/** Trystero's id of the participant, for the progress bars' names. */
	readonly peerId: string;
	readonly name: string;
	readonly host: boolean;
	readonly you: boolean;
	/** In a Same Page session, whether the host lets the participant only watch the files (Session Settings). */
	readonly watching: boolean;
	/** Whether this is an agent a participant invited, and whether it is answering now. */
	readonly agent: boolean;
	readonly answering: boolean;
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
	/** Joins a room; `key` names it, as several can be joined at once (the seats of a class). */
	| { readonly command: 'join'; readonly bundleUrl: string; readonly appId: string; readonly roomId: string; readonly password: string; readonly key: string }
	| { readonly command: 'send'; readonly id: number; readonly peerId: string; readonly packet: IWirePacket }
	/** Leaves one room, or, with no key, all of them. */
	| { readonly command: 'leave'; readonly key?: string }
	| { readonly command: 'show'; readonly entry: IChatEntry }
	| { readonly command: 'participants'; readonly participants: readonly IChatParticipant[] }
	| { readonly command: 'session'; readonly code: string; readonly status: string; readonly ended: boolean }
	| { readonly command: 'stats'; readonly id: number }
	| { readonly command: 'filesPanel'; readonly folder: string }
	| { readonly command: 'folder'; readonly path: string; readonly entries: readonly IFolderEntry[]; readonly error?: string }
	| { readonly command: 'filesChanged' }
	| { readonly command: 'filesClosed' }
	| { readonly command: 'game'; readonly game: IChatGame };

/** From the page to the workbench. */
export type ChatWorkbenchMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'joined'; readonly selfId: string }
	| { readonly command: 'joinError'; readonly error: string }
	/** Someone was met in a room, `key`; a peer is in one room at a time, the last where it was met. */
	| { readonly command: 'peerJoin'; readonly peerId: string; readonly key: string }
	| { readonly command: 'peerLeave'; readonly peerId: string }
	| { readonly command: 'packet'; readonly peerId: string; readonly packet: IWirePacket }
	| { readonly command: 'sent'; readonly id: number; readonly error?: string }
	| { readonly command: 'stats'; readonly id: number; readonly peers: readonly IPeerConnectionStats[] }
	| { readonly command: 'sendChat'; readonly text: string; readonly image?: string }
	| { readonly command: 'notice'; readonly text: string }
	| { readonly command: 'copyInvitation' }
	| { readonly command: 'testConnection' }
	| { readonly command: 'leaveSession' }
	| { readonly command: 'dataset'; readonly id: string; readonly action: 'preview' | 'save' | 'load' }
	| { readonly command: 'pickDataset' }
	| { readonly command: 'pickDatabase' }
	| { readonly command: 'sendFile'; readonly fileName: string; readonly content: string }
	| { readonly command: 'file'; readonly id: string; readonly action: 'save' | 'attach' }
	| { readonly command: 'voiceLanguage'; readonly value: string }
	| { readonly command: 'voiceWriteIn'; readonly value: string }
	| { readonly command: 'listFolder'; readonly path: string }
	| { readonly command: 'openFile'; readonly path: string }
	| { readonly command: 'submitDecisions'; readonly values: Record<string, number | string> }
	| { readonly command: 'nextRound' };

/** The chat page: its texts come from here, the session from the workbench's messages; `language` is that of dictation. */
export function chatPageHtml(language: string, writeIn: string): string {
	const text = {
		title: localize('collaborationChat.title', "Collaboration Chat"),
		participants: localize('collaborationChat.participants', "Participants:"),
		host: localize('collaborationChat.host', "host"),
		you: localize('collaborationChat.you', "you"),
		watching: localize('collaborationChat.watching', "watching"),
		agent: localize('collaborationChat.agent', "agent"),
		answering: localize('collaborationChat.answering', "answering..."),
		copyInvitation: localize('collaborationChat.copyInvitation', "Copy Invitation"),
		copied: localize('collaborationChat.copied', "Copied"),
		testConnection: localize('collaborationChat.testConnection', "Test Connection"),
		leave: localize('collaborationChat.leave', "Leave Session"),
		placeholder: localize('collaborationChat.placeholder', "Write a message; paste an image, or drag in an image or a file. Enter sends, Shift+Enter starts a new line."),
		send: localize('collaborationChat.send', "Send"),
		add: localize('collaborationChat.add', "Add an Image, a File, a Dataset or a Database"),
		addImage: localize('collaborationChat.addImage', "Image"),
		addFile: localize('collaborationChat.addFile', "File"),
		addDataset: localize('collaborationChat.addDataset', "Dataset"),
		addDatabase: localize('collaborationChat.addDatabase', "Database"),
		fileTooLarge: localize('collaborationChat.fileTooLarge', "{0} is too large to share in the chat (the limit is {1} MB): send it the usual way.", '{0}', MAX_FILE_BYTES / 1024 / 1024),
		fileShared: localize('collaborationChat.fileShared', "Shared {0}, {1}", '{0}', '{1}'),
		fileNote: localize('collaborationChat.fileNote', "Pollis does not open or run shared files: save it, and open it only if you trust it."),
		saveFile: localize('collaborationChat.saveFile', "Save As..."),
		databaseShared: localize('collaborationChat.databaseShared', "Shared the DuckDB database {0}, {1}", '{0}', '{1}'),
		databaseNote: localize('collaborationChat.databaseNote', "Attach opens it read-only in your Julia session and shows its tables in the Databases view. Views in a database can read files on your computer when queried: attach only databases from people you trust."),
		attachDatabase: localize('collaborationChat.attachDatabase', "Attach in My Julia Session"),
		removeImage: localize('collaborationChat.removeImage', "Remove Image"),
		sending: localize('collaborationChat.sending', "Sending {0} to {1}", '{0}', '{1}'),
		receiving: localize('collaborationChat.receiving', "Receiving {0} from {1}", '{0}', '{1}'),
		aMessage: localize('collaborationChat.aMessage', "a message"),
		imageTooLarge: localize('collaborationChat.imageTooLarge', "This image is too large for the chat, even reduced (the limit is {0} MB): send it the usual way.", MAX_IMAGE_BYTES / 1024 / 1024),
		notAnImage: localize('collaborationChat.notAnImage', "Only images can go in the chat."),
		datasetShared: localize('collaborationChat.datasetShared', "Shared {0}: {1} rows × {2} columns, {3}", '{0}', '{1}', '{2}', '{3}'),
		preview: localize('collaborationChat.preview', "Preview"),
		saveDataset: localize('collaborationChat.saveDataset', "Save to My Workspace"),
		loadDataset: localize('collaborationChat.loadDataset', "Load into My Julia Session"),
		formulas: localize('collaborationChat.formulas', "Some cells start with =, +, - or @: a spreadsheet may read them as formulas, so check them before opening this file in one."),
		ended: localize('collaborationChat.ended', "The session has ended. Start or join another from Compose > Collaboration."),
		filesOf: localize('collaborationChat.filesOf', "Files of {0}", '{0}'),
		filesHint: localize('collaborationChat.filesHint', "Click a file to edit it with the others."),
		filesEmpty: localize('collaborationChat.filesEmpty', "No files."),
		gameNotStarted: localize('collaborationChat.gameNotStarted', "Not started yet: the players are split into teams when the game starts."),
		roundOf: localize('collaborationChat.roundOf', "{0} {1} of {2}", '{0}', '{1}', '{2}'),
		gameOver: localize('collaborationChat.gameOver', "The game is over."),
		playing: localize('collaborationChat.playing', "Playing the round..."),
		startGame: localize('collaborationChat.startGame', "Start the Game"),
		nextRound: localize('collaborationChat.nextRound', "Next Round"),
		submittedBy: localize('collaborationChat.submittedBy', "Submitted by {0}", '{0}'),
		notSubmitted: localize('collaborationChat.notSubmitted', "Not submitted yet"),
		nobody: localize('collaborationChat.nobody', "Nobody yet"),
		notInTeam: localize('collaborationChat.notInTeam', "In no team yet: {0}", '{0}'),
		waitingForTeam: localize('collaborationChat.waitingForTeam', "Waiting to be placed in a team."),
		yourTeam: localize('collaborationChat.yourTeam', "Your team: {0}", '{0}'),
		submit: localize('collaborationChat.submit', "Submit Our Decisions"),
		submitHint: localize('collaborationChat.submitHint', "Anyone in the team can submit; the last submitted before the round is played counts. A team that submits nothing plays its last round's decisions again."),
		decisionUnit: localize('collaborationChat.decisionUnit', "{0} ({1})", '{0}', '{1}'),
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
		.main { flex: 1; display: flex; min-height: 0; }
		#messages { flex: 1; min-width: 0; overflow-y: auto; padding: 8px 12px; }
		/* Same Page: the files of the shared folder, beside the messages */
		#files { width: 240px; flex: none; overflow: auto; padding: 6px 0; border-right: 1px solid var(--vscode-widget-border); }
		#files[hidden] { display: none; }
		#files .title { padding: 0 10px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		#files .hint, #files .empty { padding: 0 10px 4px 10px; font-size: 11px; color: var(--vscode-descriptionForeground); }
		#files .node { display: flex; align-items: center; gap: 4px; padding-top: 1px; padding-bottom: 1px; padding-right: 8px; cursor: pointer; white-space: nowrap; }
		#files .node:hover { background: var(--vscode-list-hoverBackground); }
		#files .twisty { width: 12px; flex: none; color: var(--vscode-descriptionForeground); }
		#files .twisty.closed::before { content: '\\25B8'; }
		#files .twisty.open::before { content: '\\25BE'; }
		#files .name { overflow: hidden; text-overflow: ellipsis; }
		/* A game: the round, and the teams or the team's decisions, beside the messages */
		#game { width: 300px; flex: none; overflow: auto; padding: 6px 10px; border-left: 1px solid var(--vscode-widget-border); }
		#game[hidden] { display: none; }
		#game .title { font-weight: 600; }
		#game .hint, #game .muted { font-size: 11px; color: var(--vscode-descriptionForeground); }
		#game .round { margin: 6px 0; font-weight: 600; }
		#game .team { margin: 6px 0; }
		#game .field { margin: 8px 0; }
		#game .field label { display: block; font-weight: 600; margin-bottom: 2px; }
		#game .field input, #game .field select { width: 100%; font: inherit; padding: 2px 4px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); }
		#game .actions { margin: 8px 0; }
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
		/* The composer: one rounded box with the attached image, the text and the microphone, and below them the + (Image, File, Dataset, Database) on the left and the send arrow on the right */
		.composer { padding: 8px 10px 6px 10px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 14px; }
		.composer:focus-within { border-color: var(--vscode-focusBorder); }
		#attachment { display: none; align-items: center; gap: 8px; margin-bottom: 6px; }
		#attachment img { max-height: 64px; border: 1px solid var(--vscode-widget-border); border-radius: 6px; }
		.composer .top { display: flex; align-items: flex-start; gap: 6px; }
		textarea { display: block; flex: 1; min-width: 0; width: 100%; resize: none; min-height: 24px; max-height: 160px; font: inherit; padding: 2px 2px; color: inherit; background: transparent; border: none; outline: none; }
		.tools { display: flex; align-items: center; gap: 2px; margin-top: 4px; }
		.tools .add { margin-right: auto; }
		button.icon { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; padding: 0; border-radius: 50%; color: var(--vscode-foreground); background: transparent; }
		button.icon:hover { background: var(--vscode-toolbar-hoverBackground); }
		button.icon svg { width: 18px; height: 18px; }
		button.icon.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.icon.primary:hover { background: var(--vscode-button-hoverBackground); }
		button.icon.primary.idle { opacity: 0.4; }
		button { font: inherit; padding: 4px 12px; border: none; box-shadow: inset 0 0 0 1px var(--vscode-button-background); border-radius: 2px; cursor: pointer; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); white-space: nowrap; font-size: 11px; opacity: 0.7; }
		/* As the code buttons below a panel's Example Code: dimmed until pointed at, the blue one not */
		button:not(:disabled):hover, button.current, button.primary { opacity: 1; }
		button:hover { background: var(--vscode-button-secondaryHoverBackground); }
		button.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.primary:hover { background: var(--vscode-button-hoverBackground); }
		button:disabled { opacity: 0.5; cursor: default; }
		.dataset { margin-top: 4px; padding: 6px 8px; border: 1px solid var(--vscode-widget-border); border-radius: 4px; max-width: 720px; }
		.dataset .summary { font-weight: 600; }
		.dataset .table { overflow-x: auto; margin: 6px 0; }
		.dataset table { border-collapse: collapse; font-family: var(--vscode-editor-font-family); font-size: 12px; }
		.dataset th, .dataset td { border: 1px solid var(--vscode-widget-border); padding: 1px 6px; white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis; text-align: left; }
		.dataset th { background: var(--vscode-editorWidget-background); }
		.dataset .warning { color: var(--vscode-editorWarning-foreground); margin: 4px 0; }
		.dataset .actions { display: flex; flex-wrap: wrap; gap: 6px; }
		.file .note { color: var(--vscode-descriptionForeground); margin: 4px 0; }
		/* The + menu: Image, File, Dataset and Database, above the + */
		${composerAddCss}
		.link { color: var(--vscode-textLink-foreground); background: none; padding: 0; }
		.link:hover { background: none; text-decoration: underline; }
		${composerVoiceCss}
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
	<div class="main">
		<aside id="files" hidden>
			<div class="title" id="filesTitle"></div>
			<div class="hint">${text.filesHint}</div>
			<div id="tree"></div>
		</aside>
		<div id="messages"></div>
		<aside id="game" hidden></aside>
	</div>
	<div id="progress"></div>
	<footer>
		<div class="composer">
			<div id="attachment"><img id="attachmentImage" alt=""><button class="link" id="removeImage">${text.removeImage}</button></div>
			<div class="top">
				<textarea id="input" rows="1" placeholder="${text.placeholder}"></textarea>
			</div>
			<div class="tools">
				${composerAddHtml({ add: text.add, image: text.addImage, file: text.addFile, dataset: text.addDataset, database: text.addDatabase })}
				${composerVoiceHtml(language, writeIn)}
				<button class="icon primary idle" id="send" title="${text.send}" aria-label="${text.send}">${composerSendSvg}</button>
			</div>
		</div>
	</footer>
<script type="module">
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const MAX_FILE_BYTES = ${MAX_FILE_BYTES};
	const MAX_RECEIVE_BYTES = ${MAX_RECEIVE_BYTES};
	const PROGRESS_THRESHOLD_BYTES = ${PROGRESS_THRESHOLD_BYTES};
	const $ = id => document.getElementById(id);
	const messages = $('messages'), input = $('input'), progressArea = $('progress');

	// ---- The Trystero room: joined, sent to and left as the workbench asks ----

	// The rooms joined, by key: the session's one room, or the seats of a class; and the room of each peer met
	const rooms = new Map(), peerRooms = new Map();
	let ended = false, joinedPosted = false;
	const names = new Map();

	async function join(message) {
		const trystero = await import(message.bundleUrl);
		const key = message.key;
		if (rooms.has(key)) {
			return;
		}
		const room = trystero.joinRoom({
			appId: message.appId,
			password: message.password,
			maxReceiveBytes: MAX_RECEIVE_BYTES,
		}, message.roomId, {
			onJoinError: details => vscode.postMessage({ command: 'joinError', error: details.error }),
		});
		const packets = room.makeAction('pollis', {
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
		room.onPeerJoin = peerId => {
			peerRooms.set(peerId, key);
			vscode.postMessage({ command: 'peerJoin', peerId, key });
		};
		room.onPeerLeave = peerId => {
			// A peer met since in another room has not left
			if (peerRooms.get(peerId) !== key) {
				return;
			}
			peerRooms.delete(peerId);
			removeBar('in:' + peerId);
			vscode.postMessage({ command: 'peerLeave', peerId });
		};
		rooms.set(key, { room, packets });
		if (!joinedPosted) {
			joinedPosted = true;
			vscode.postMessage({ command: 'joined', selfId: trystero.selfId });
		}
	}

	function leaveRoom(key) {
		const entry = rooms.get(key);
		if (!entry) {
			return;
		}
		rooms.delete(key);
		for (const [peerId, roomKey] of [...peerRooms]) {
			if (roomKey === key) {
				peerRooms.delete(peerId);
			}
		}
		entry.room.leave();
	}

	async function send(message) {
		const size = JSON.stringify(message.packet).length;
		const key = 'out:' + message.id;
		if (size > PROGRESS_THRESHOLD_BYTES) {
			progressBar(key, TEXT.sending, message.peerId, size);
		}
		try {
			const entry = rooms.get(peerRooms.get(message.peerId));
			if (!entry) {
				throw new Error('not connected to ' + message.peerId);
			}
			await entry.packets.send(message.packet, {
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
		const connections = [...rooms.entries()].flatMap(([key, entry]) => Object.entries(entry.room.getPeers()).filter(([peerId]) => peerRooms.get(peerId) === key));
		for (const [peerId, connection] of connections) {
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
		if (entry.kind !== 'notice') {
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
		if (entry.dataset) {
			element.append(datasetCard(entry.dataset));
		}
		if (entry.file) {
			element.append(fileCard(entry.file));
		}
		for (const table of entry.tables || []) {
			element.append(resultsCard(table));
		}
		messages.append(element);
		if (follow) {
			messages.scrollTop = messages.scrollHeight;
		}
	}

	// A dataset card: its texts are set as text, never as HTML, since names and cells come from the sharer
	function datasetCard(dataset) {
		const card = document.createElement('div');
		card.className = 'dataset';
		const summary = document.createElement('div');
		summary.className = 'summary';
		summary.textContent = TEXT.datasetShared.replace('{0}', dataset.fileName).replace('{1}', dataset.rows).replace('{2}', dataset.columns).replace('{3}', dataset.size);
		const tableArea = document.createElement('div');
		tableArea.className = 'table';
		const table = document.createElement('table');
		const headerRow = table.insertRow();
		for (const name of dataset.header) {
			const cell = document.createElement('th');
			cell.textContent = name;
			cell.title = name;
			headerRow.append(cell);
		}
		for (const row of dataset.head) {
			const tableRow = table.insertRow();
			for (const value of row) {
				const cell = tableRow.insertCell();
				cell.textContent = value;
				cell.title = value;
			}
		}
		tableArea.append(table);
		card.append(summary, tableArea);
		if (dataset.formulas) {
			const warning = document.createElement('div');
			warning.className = 'warning';
			warning.textContent = TEXT.formulas;
			card.append(warning);
		}
		const actions = document.createElement('div');
		actions.className = 'actions';
		for (const [action, label] of [['preview', TEXT.preview], ['save', TEXT.saveDataset], ['load', TEXT.loadDataset]]) {
			const button = document.createElement('button');
			button.textContent = label;
			button.addEventListener('click', () => vscode.postMessage({ command: 'dataset', id: dataset.id, action }));
			actions.append(button);
		}
		card.append(actions);
		return card;
	}

	// A file card: name and size as text, Save As, and for a database Attach; the file itself stays with the workbench
	function fileCard(file) {
		const card = document.createElement('div');
		card.className = 'dataset file';
		const summary = document.createElement('div');
		summary.className = 'summary';
		summary.textContent = (file.database ? TEXT.databaseShared : TEXT.fileShared).replace('{0}', file.fileName).replace('{1}', file.size);
		const note = document.createElement('div');
		note.className = 'note';
		note.textContent = file.database ? TEXT.databaseNote : TEXT.fileNote;
		const actions = document.createElement('div');
		actions.className = 'actions';
		for (const [action, label] of file.database ? [['save', TEXT.saveFile], ['attach', TEXT.attachDatabase]] : [['save', TEXT.saveFile]]) {
			const button = document.createElement('button');
			button.textContent = label;
			button.addEventListener('click', () => vscode.postMessage({ command: 'file', id: file.id, action }));
			actions.append(button);
		}
		card.append(summary, note, actions);
		return card;
	}

	// A table of a game's results: its cells set as text
	function resultsCard(table) {
		const card = document.createElement('div');
		card.className = 'dataset';
		const summary = document.createElement('div');
		summary.className = 'summary';
		summary.textContent = table.title;
		const tableArea = document.createElement('div');
		tableArea.className = 'table';
		const element = document.createElement('table');
		const headerRow = element.insertRow();
		for (const name of table.columns) {
			const cell = document.createElement('th');
			cell.textContent = name;
			headerRow.append(cell);
		}
		for (const row of table.rows) {
			const tableRow = element.insertRow();
			for (const value of row) {
				tableRow.insertCell().textContent = value;
			}
		}
		tableArea.append(element);
		card.append(summary, tableArea);
		return card;
	}

	// ---- A game: the facilitator's teams and Next Round, or a player's decisions for their team ----

	let gameKey = '', lastGame;
	function showGame(game) {
		const area = $('game');
		// A player's form is drawn again only when something in it changed, so what they are typing stays
		const key = JSON.stringify(game) + ended;
		if (key === gameKey) {
			return;
		}
		gameKey = key;
		area.hidden = false;
		area.replaceChildren();
		const line = (className, text) => {
			const element = document.createElement('div');
			element.className = className;
			element.textContent = text;
			area.append(element);
			return element;
		};
		line('title', game.title);
		if (game.description) {
			line('hint', game.description);
		}
		line('round', game.round < 1 ? TEXT.gameNotStarted : game.round > game.rounds ? TEXT.gameOver : TEXT.roundOf.replace('{0}', game.roundLabel).replace('{1}', game.round).replace('{2}', game.rounds));
		if (game.facilitator) {
			for (const team of game.teams || []) {
				const element = line('team', '');
				const name = document.createElement('b');
				name.textContent = team.name;
				const members = document.createElement('div');
				members.className = 'muted';
				members.textContent = team.members.length ? team.members.join(', ') : TEXT.nobody;
				const status = document.createElement('div');
				status.textContent = team.submittedBy ? TEXT.submittedBy.replace('{0}', team.submittedBy) : TEXT.notSubmitted;
				element.append(name, members);
				if (game.round >= 1 && game.round <= game.rounds) {
					element.append(status);
				}
			}
			if (game.waiting && game.waiting.length) {
				line('muted', TEXT.notInTeam.replace('{0}', game.waiting.join(', ')));
			}
			const actions = line('actions', '');
			const button = document.createElement('button');
			button.textContent = game.running ? TEXT.playing : game.round < 1 ? TEXT.startGame : TEXT.nextRound;
			button.disabled = ended || game.running || game.round > game.rounds;
			button.addEventListener('click', () => vscode.postMessage({ command: 'nextRound' }));
			actions.append(button);
			return;
		}
		if (!game.team) {
			if (game.round <= game.rounds) {
				line('muted', TEXT.waitingForTeam);
			}
			return;
		}
		line('team', TEXT.yourTeam.replace('{0}', game.teamName));
		if (game.round < 1 || game.round > game.rounds) {
			return;
		}
		const inputs = [];
		for (const decision of game.decisions || []) {
			const field = line('field', '');
			const label = document.createElement('label');
			label.textContent = decision.unit ? TEXT.decisionUnit.replace('{0}', decision.label).replace('{1}', decision.unit) : decision.label;
			let input;
			if (decision.kind === 'choice') {
				input = document.createElement('select');
				for (const option of decision.options) {
					const element = document.createElement('option');
					element.value = option.value;
					element.textContent = option.label;
					input.append(element);
				}
			} else {
				input = document.createElement('input');
				input.type = 'number';
				input.min = decision.min;
				input.max = decision.max;
				input.step = decision.step ?? 'any';
			}
			input.value = String(game.values?.[decision.key] ?? decision.default);
			input.disabled = ended;
			label.htmlFor = input.id = 'decision-' + decision.key;
			field.append(label, input);
			if (decision.help) {
				const help = document.createElement('div');
				help.className = 'hint';
				help.textContent = decision.help;
				field.append(help);
			}
			inputs.push([decision, input]);
		}
		const actions = line('actions', '');
		const button = document.createElement('button');
		button.textContent = TEXT.submit;
		button.disabled = ended;
		button.addEventListener('click', () => {
			const values = {};
			for (const [decision, input] of inputs) {
				values[decision.key] = decision.kind === 'choice' ? input.value : Number(input.value);
			}
			vscode.postMessage({ command: 'submitDecisions', values });
		});
		actions.append(button);
		line('', game.submittedBy ? TEXT.submittedBy.replace('{0}', game.submittedBy) : TEXT.notSubmitted);
		line('hint', TEXT.submitHint);
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
			const roles = [participant.host ? TEXT.host : '', participant.you ? TEXT.you : '', participant.watching ? TEXT.watching : '', participant.agent ? TEXT.agent : '', participant.answering ? TEXT.answering : ''].filter(Boolean);
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
		$('send').classList.toggle('idle', !input.value.trim() && !image);
	}

	${composerAddScript('input', MAX_IMAGE_BYTES)}

	// Images over the cap, or very large, are reduced: longest side 1600 px as PNG, then as JPEG
	async function prepareImage(file) {
		const image = await composerReduceImage(file);
		if (image.dataUrl) {
			attach(image.dataUrl);
		} else {
			vscode.postMessage({ command: 'notice', text: image.error === 'notAnImage' ? TEXT.notAnImage : TEXT.imageTooLarge });
		}
	}

	// Any other file is sent as it is, in base64, within the cap
	async function shareFile(file) {
		if (file.size > MAX_FILE_BYTES) {
			vscode.postMessage({ command: 'notice', text: TEXT.fileTooLarge.replace('{0}', file.name) });
			return;
		}
		const dataUrl = await composerReadAsDataUrl(file);
		vscode.postMessage({ command: 'sendFile', fileName: file.name, content: dataUrl.slice(dataUrl.indexOf(',') + 1) });
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
		input.style.height = Math.min(input.scrollHeight, 160) + 'px';
		// The send arrow is dimmed while there is nothing to send
		$('send').classList.toggle('idle', !input.value.trim() && !image);
	}

	input.addEventListener('input', resize);
	${composerVoiceScript('input')}
	input.addEventListener('keydown', e => {
		if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
			e.preventDefault();
			sendChat();
		}
	});
	$('send').addEventListener('click', sendChat);
	composerAdd({ image: prepareImage, file: shareFile });
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
				for (const key of message.key ? [message.key] : [...rooms.keys()]) {
					leaveRoom(key);
				}
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
				for (const id of ['send', 'add', 'copyInvitation', 'leave']) {
					$(id).disabled = ended;
				}
				if (ended) {
					closeAddMenu();
				}
				input.disabled = ended;
				if (lastGame) {
					showGame(lastGame);
				}
				break;
			case 'stats': stats(message.id); break;
			case 'filesPanel':
				expanded.clear();
				folderElements.clear();
				$('filesTitle').textContent = TEXT.filesOf.replace('{0}', message.folder);
				$('files').hidden = false;
				vscode.postMessage({ command: 'listFolder', path: '' });
				break;
			case 'folder': showFolder(message.path, message.entries, message.error); break;
			case 'filesChanged': vscode.postMessage({ command: 'listFolder', path: '' }); break;
			case 'filesClosed': $('files').hidden = true; break;
			case 'game': lastGame = message.game; showGame(message.game); break;
		}
	});

	// ---- Same Page: the files of the shared folder, listed as the workbench answers ----

	const expanded = new Set();
	const folderElements = new Map();

	function showFolder(path, entries, error) {
		const container = path === '' ? $('tree') : folderElements.get(path);
		if (!container) {
			return;
		}
		container.replaceChildren();
		if (error || !entries.length) {
			const note = document.createElement('div');
			note.className = 'empty';
			note.textContent = error || TEXT.filesEmpty;
			container.append(note);
			return;
		}
		const depth = path === '' ? 0 : path.split('/').length;
		for (const entry of entries) {
			const child = path === '' ? entry.name : path + '/' + entry.name;
			const row = document.createElement('div');
			row.className = 'node';
			row.style.paddingLeft = (10 + depth * 12) + 'px';
			row.title = child;
			const twisty = document.createElement('span');
			twisty.className = 'twisty' + (entry.folder ? (expanded.has(child) ? ' open' : ' closed') : '');
			const name = document.createElement('span');
			name.className = 'name';
			name.textContent = entry.name;
			row.append(twisty, name);
			container.append(row);
			if (!entry.folder) {
				row.addEventListener('click', () => vscode.postMessage({ command: 'openFile', path: child }));
				continue;
			}
			const children = document.createElement('div');
			container.append(children);
			folderElements.set(child, children);
			row.addEventListener('click', () => {
				if (expanded.has(child)) {
					expanded.delete(child);
					children.replaceChildren();
					twisty.className = 'twisty closed';
				} else {
					expanded.add(child);
					twisty.className = 'twisty open';
					vscode.postMessage({ command: 'listFolder', path: child });
				}
			});
			if (expanded.has(child)) {
				vscode.postMessage({ command: 'listFolder', path: child });
			}
		}
	}
	vscode.postMessage({ command: 'ready' });
	input.focus();
</script>
</body>
</html>`;
}
