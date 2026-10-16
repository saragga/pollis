/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../../nls.js';
import { Action2, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { webviewGenericCspSource } from '../../../webview/common/webview.js';
import { WebviewInput } from '../../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { COLLABORATION_MEDIA, trysteroBundleUrl } from './collaborationChat.js';
import { describeConnection, ICollaborationService, TEST_CONNECTION_COMMAND_ID } from './collaborationService.js';

// Compose > Collaboration > Test Connection... (task 5.1 as a feature): Pollis checks the connection itself.
// Whether this network reaches the servers that introduce the participants (the public nostr relays and
// mqtt brokers), whether direct connections can work (what the STUN servers see: no answer means UDP is
// blocked, a different mapping for each server means a strict NAT), the relay (TURN, not set up yet),
// and, in a session, whether each participant is connected directly or through the relay.

/** The STUN servers Trystero uses by default; each is asked separately so their answers can be compared. */
const STUN_SERVERS = ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'];

type TestMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'copy'; readonly text: string };

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

async function openTestConnectionPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const collaborationService = accessor.get(ICollaborationService);
	const clipboardService = accessor.get(IClipboardService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		openPage.webview.postMessage({ command: 'run' });
		return;
	}
	const title = localize('testConnection.title', "Test Connection");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [COLLABORATION_MEDIA] },
			extension: undefined,
		},
		'pollis.collaborationTestConnection',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());
	openPage = webviewInput;

	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: TestMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			const connections = await collaborationService.connectionStats();
			webviewInput.webview.postMessage({
				command: 'session',
				inSession: collaborationService.inSession,
				connections: connections.map(connection => ({ name: connection.name, direct: connection.direct, description: describeConnection(connection) })),
			});
		} else if (message.command === 'copy') {
			await clipboardService.writeText(message.text);
		}
	}));
}

/** The page: its texts come from here; it runs the checks itself and asks the workbench for the session. */
function pageHtml(): string {
	const text = {
		title: localize('testConnection.title', "Test Connection"),
		intro: localize('testConnection.intro', "Whether this network lets Pollis sessions through. The participants are introduced to each other by free public servers; then each pair connects directly, peer to peer, unless the network blocks it, when the connection needs a relay. Run it on each computer before a session, and compare."),
		runAgain: localize('testConnection.runAgain', "Run Again"),
		copy: localize('testConnection.copy', "Copy Results"),
		copied: localize('testConnection.copied', "Copied"),
		introduction: localize('testConnection.introduction', "Introduction Servers"),
		nostr: localize('testConnection.nostr', "Nostr relays (the default)"),
		mqtt: localize('testConnection.mqtt', "MQTT brokers (the alternative, Settings: Pollis Collaboration Signalling)"),
		reachable: localize('testConnection.reachable', "{0} of {1} reachable", '{0}', '{1}'),
		checking: localize('testConnection.checking', "Checking..."),
		direct: localize('testConnection.direct', "Direct Connections"),
		stunAnswered: localize('testConnection.stunAnswered', "{0}: this computer is seen as {1}", '{0}', '{1}'),
		stunSilent: localize('testConnection.stunSilent', "{0}: no answer", '{0}'),
		sameMapping: localize('testConnection.sameMapping', "The network shows the same address to every server: direct connections should work."),
		changingMapping: localize('testConnection.changingMapping', "The network shows a different address to each server (a strict NAT): connections with some participants may need the relay."),
		udpBlocked: localize('testConnection.udpBlocked', "No STUN server answered: this network seems to block UDP, so connections will need the relay."),
		oneServer: localize('testConnection.oneServer', "Only one STUN server answered, so the network's behaviour could not be compared; direct connections may still work."),
		relay: localize('testConnection.relay', "Relay (TURN)"),
		relayNotSetUp: localize('testConnection.relayNotSetUp', "Not set up yet. Until it is, two participants whose networks both block direct connections cannot connect."),
		session: localize('testConnection.session', "This Session"),
		noSession: localize('testConnection.noSession', "Not in a session. In a session, this shows whether each participant is connected directly or through the relay."),
		noParticipants: localize('testConnection.noParticipants', "Nobody else is in the session yet."),
		summary: localize('testConnection.summary', "Summary"),
		summaryGood: localize('testConnection.summaryGood', "This network should let Pollis sessions through, with direct connections."),
		summaryNoIntroduction: localize('testConnection.summaryNoIntroduction', "Pollis cannot reach any introduction server from this network, so sessions cannot start here: a firewall or proxy may block secure WebSockets (wss). Try another network, such as a phone's hotspot."),
		summaryNoNostr: localize('testConnection.summaryNoNostr', "The nostr relays are blocked here but the MQTT brokers are reachable: set Settings > Pollis Collaboration Signalling to mqtt, and start the session with that."),
		summaryNeedsRelay: localize('testConnection.summaryNeedsRelay', "Sessions can start here, but direct connections are limited, so some participants may need the relay, which is not set up yet."),
	};
	const csp = `default-src 'none'; style-src 'unsafe-inline'; connect-src wss: https:; script-src ${webviewGenericCspSource} 'unsafe-inline';`;
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="${csp}">
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 900px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		h2 { font-size: 16px; font-weight: 600; margin: 24px 0 6px 0; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; line-height: 1.4; }
		.line { margin: 4px 0; line-height: 1.4; }
		.good { color: var(--vscode-testing-iconPassed); }
		.bad { color: var(--vscode-testing-iconFailed); }
		.muted { color: var(--vscode-descriptionForeground); }
		details { margin: 2px 0 6px 16px; color: var(--vscode-descriptionForeground); font-size: 12px; }
		details code { font-family: var(--vscode-editor-font-family); }
		#summary { font-size: 14px; padding: 10px 12px; border-left: 3px solid var(--vscode-focusBorder); background: var(--vscode-textBlockQuote-background); }
		.buttons { display: flex; gap: 8px; margin: 12px 0; }
		button { font: inherit; padding: 4px 12px; border: none; border-radius: 2px; cursor: pointer; color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button:hover { background: var(--vscode-button-hoverBackground); }
		button.secondary { color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
		button:disabled { opacity: 0.5; cursor: default; }
	</style>
</head>
<body>
<div class="container">
	<h1>${text.title}</h1>
	<p class="subtitle">${text.intro}</p>
	<h2>${text.summary}</h2>
	<div id="summary" class="muted">${text.checking}</div>
	<div class="buttons">
		<button id="run">${text.runAgain}</button>
		<button class="secondary" id="copy">${text.copy}</button>
	</div>
	<h2>${text.introduction}</h2>
	<div id="introduction"></div>
	<h2>${text.direct}</h2>
	<div id="direct"></div>
	<h2>${text.relay}</h2>
	<div class="line muted">${text.relayNotSetUp}</div>
	<h2>${text.session}</h2>
	<div id="session"></div>
</div>
<script type="module">
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const STUN_SERVERS = ${JSON.stringify(STUN_SERVERS)};
	const BUNDLES = ${JSON.stringify({ nostr: trysteroBundleUrl('nostr'), mqtt: trysteroBundleUrl('mqtt') })};
	const $ = id => document.getElementById(id);
	const format = (template, ...values) => values.reduce((result, value, index) => result.replace('{' + index + '}', value), template);
	let results = {};
	let running = false;

	function line(parent, content, kind) {
		const element = document.createElement('div');
		element.className = 'line' + (kind ? ' ' + kind : '');
		element.textContent = content;
		parent.append(element);
		return element;
	}

	// Opening a secure WebSocket shows whether this network lets the introduction through
	function probe(url, protocol) {
		return new Promise(resolve => {
			let socket;
			const done = ok => {
				clearTimeout(timer);
				try { socket?.close(); } catch { }
				resolve(ok);
			};
			const timer = setTimeout(() => done(false), 6000);
			try {
				socket = protocol ? new WebSocket(url, protocol) : new WebSocket(url);
				socket.onopen = () => done(true);
				socket.onerror = () => done(false);
			} catch {
				done(false);
			}
		});
	}

	async function checkIntroduction() {
		const area = $('introduction');
		area.textContent = '';
		const groups = [['nostr', TEXT.nostr, undefined], ['mqtt', TEXT.mqtt, 'mqtt']];
		for (const [strategy, label] of groups) {
			line(area, label + ': ' + TEXT.checking).id = 'intro-' + strategy;
		}
		await Promise.all(groups.map(async ([strategy, label, protocol]) => {
			const urls = (await import(BUNDLES[strategy])).defaultRelayUrls;
			const answers = await Promise.all(urls.map(async url => [url, await probe(url, protocol)]));
			const reachable = answers.filter(([, ok]) => ok).length;
			results[strategy] = { reachable, total: urls.length, answers };
			const element = $('intro-' + strategy);
			element.textContent = label + ': ' + format(TEXT.reachable, reachable, urls.length);
			element.className = 'line ' + (reachable ? 'good' : 'bad');
			const details = document.createElement('details');
			const summary = document.createElement('summary');
			summary.textContent = urls.length + ' URLs';
			details.append(summary);
			for (const [url, ok] of answers) {
				const item = document.createElement('div');
				const code = document.createElement('code');
				code.textContent = url;
				item.append(ok ? '\\u2713 ' : '\\u2717 ', code);
				details.append(item);
			}
			element.after(details);
		}));
	}

	// What address the STUN servers see this computer at. Asked one at a time, each answer shows a server is
	// reachable; asked together, the same local port mapped to different public ports means a strict NAT.
	async function askStun(servers) {
		const connection = new RTCPeerConnection({ iceServers: servers.map(urls => ({ urls })) });
		const seen = [];
		connection.onicecandidate = e => {
			if (e.candidate && e.candidate.type === 'srflx' && e.candidate.protocol === 'udp') {
				seen.push({ address: e.candidate.address, port: e.candidate.port, base: e.candidate.relatedPort });
			}
		};
		connection.createDataChannel('probe');
		await connection.setLocalDescription(await connection.createOffer());
		await new Promise(resolve => {
			const timer = setTimeout(resolve, 6000);
			connection.onicegatheringstatechange = () => {
				if (connection.iceGatheringState === 'complete') {
					clearTimeout(timer);
					resolve();
				}
			};
		});
		connection.close();
		return seen;
	}

	async function checkDirect() {
		const area = $('direct');
		area.textContent = '';
		line(area, TEXT.checking, 'muted');
		const [answers, together] = await Promise.all([Promise.all(STUN_SERVERS.map(server => askStun([server]))), askStun(STUN_SERVERS)]);
		area.textContent = '';
		const answered = answers.filter(seen => seen.length).length;
		STUN_SERVERS.forEach((server, index) => {
			const seen = answers[index];
			line(area, seen.length
				? format(TEXT.stunAnswered, server.replace('stun:', ''), [...new Set(seen.map(item => item.address + ':' + item.port))].join(', '))
				: format(TEXT.stunSilent, server.replace('stun:', '')), seen.length ? 'good' : 'bad');
		});
		const byBase = new Map();
		for (const item of together) {
			const key = item.address + '|' + (item.base || 0);
			byBase.set(key, (byBase.get(key) || new Set()).add(item.port));
		}
		const changing = [...byBase.values()].some(ports => ports.size > 1);
		let verdict, kind;
		if (!answered) {
			verdict = TEXT.udpBlocked; kind = 'bad';
		} else if (changing) {
			verdict = TEXT.changingMapping; kind = 'bad';
		} else if (answered < STUN_SERVERS.length) {
			verdict = TEXT.oneServer; kind = 'muted';
		} else {
			verdict = TEXT.sameMapping; kind = 'good';
		}
		line(area, verdict, kind);
		results.direct = { answered, changing, verdict };
	}

	function showSession(message) {
		const area = $('session');
		area.textContent = '';
		if (!message.inSession) {
			line(area, TEXT.noSession, 'muted');
		} else if (!message.connections.length) {
			line(area, TEXT.noParticipants, 'muted');
		} else {
			for (const connection of message.connections) {
				line(area, connection.name + ': ' + connection.description, connection.direct === false ? 'bad' : connection.direct ? 'good' : 'muted');
			}
		}
		results.session = message;
	}

	function summarise() {
		const nostr = results.nostr?.reachable || 0, mqtt = results.mqtt?.reachable || 0;
		const summary = $('summary');
		summary.className = '';
		if (!nostr && !mqtt) {
			summary.textContent = TEXT.summaryNoIntroduction;
		} else if (!nostr) {
			summary.textContent = TEXT.summaryNoNostr;
		} else if (!results.direct?.answered || results.direct?.changing) {
			summary.textContent = TEXT.summaryNeedsRelay;
		} else {
			summary.textContent = TEXT.summaryGood;
		}
	}

	async function run() {
		if (running) {
			return;
		}
		running = true;
		results = {};
		$('run').disabled = true;
		$('summary').className = 'muted';
		$('summary').textContent = TEXT.checking;
		vscode.postMessage({ command: 'ready' });
		await Promise.allSettled([checkIntroduction(), checkDirect()]);
		summarise();
		$('run').disabled = false;
		running = false;
	}

	$('run').addEventListener('click', run);
	$('copy').addEventListener('click', () => {
		const report = [$('summary').textContent, '', ...['introduction', 'direct', 'session'].map(id => $(id).innerText)].join('\\n');
		vscode.postMessage({ command: 'copy', text: report });
		$('copy').textContent = TEXT.copied;
		setTimeout(() => { $('copy').textContent = TEXT.copy; }, 1500);
	});
	window.addEventListener('message', event => {
		if (event.data.command === 'session') {
			showSession(event.data);
		} else if (event.data.command === 'run') {
			run();
		}
	});
	run();
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: TEST_CONNECTION_COMMAND_ID,
			title: localize2('collaboration.testConnectionCommand', "Test Connection..."),
			category: localize2('collaboration.category', "Collaboration"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openTestConnectionPage(accessor);
	}
});
