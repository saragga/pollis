/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { parseToml, TomlValue } from '../../model/browser/common/tomlPanelData.js';
import { sendToJuliaRepl } from '../../model/browser/handlers/model.handler.js';
import { voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';
import { IToolboxPanelsService, IToolboxTopicInfo } from '../common/toolboxPanels.js';
import { LIBRARY_PAGE_HELPERS, LIBRARY_PAGE_STYLE } from './libraryPage.js';
import { TOPIC_MAPS_COMMAND_ID } from './toolboxExtensions.js';

// Topic Maps: the maps the installed toolboxes give under their topics, such as At War, Conquests, Places and Journeys
// of the Historical Geography and Archaeology Toolbox. Each topic is a menu item of its toolbox (toolboxExtensions.ts),
// which opens this page on it; toolboxes that give the same topic id share it. A map is a work under a topic, a [[maps]]
// table of its toolbox's maps file: the battles of the Greco-Persian Wars under At War, the places Herodotus names under
// Places. The page lists the maps of a topic, with the work, kind, years, region and source of each, and Draw the Map
// sends the map's Julia code to the REPL. What is wrong in a maps file is listed under the table, naming the toolbox
// and the map.

/** The kinds of a map's work: what happened, what tradition tells, or what an author made up. */
const KINDS = ['historical', 'legendary', 'fictional'] as const;
type MapKind = typeof KINDS[number];

/** A map as the page shows it. */
interface ITopicMap {
	/** The extension id and the map's id, which find it again. */
	readonly key: string;
	readonly topic: string;
	readonly title: string;
	readonly work: string;
	readonly kind: MapKind;
	readonly since: number;
	readonly upto: number;
	readonly region: string;
	readonly description: string;
	readonly source: string;
	readonly sourceUrl: string;
	readonly licence: string;
	readonly licenceUrl: string;
	readonly code: string;
	readonly toolbox: string;
}

type TopicMapsMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'draw'; readonly key: string }
	| { readonly command: 'copy'; readonly key: string }
	| { readonly command: 'openLink'; readonly url: string };

/** The fields every map must give, as text. */
const TEXT_FIELDS = ['id', 'topic', 'title', 'work', 'kind', 'region', 'source', 'licence', 'code'] as const;

/** The value of a field as trimmed text, or '' when it is not text. */
function text(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

/** Whether a link may be opened from the page: https only. */
function isHttps(url: string): boolean {
	return /^https:\/\/[^\s]+$/.test(url);
}

/**
 * The maps of a toolbox's maps file, those that give every field as they must; what is wrong in the others goes to
 * `problems`, each naming the toolbox and the map.
 */
function readMaps(content: string, extensionId: string, toolbox: string, topics: readonly IToolboxTopicInfo[], problems: string[]): ITopicMap[] {
	let data: TomlValue;
	try {
		data = parseToml(content);
	} catch (error) {
		problems.push(localize('topicMaps.unreadable', "{0}: the maps file cannot be read: {1}", toolbox, String(error)));
		return [];
	}
	const raw = Array.isArray(data.maps) ? data.maps as TomlValue[] : [];
	const maps: ITopicMap[] = [];
	for (const [index, entry] of raw.entries()) {
		const id = text(entry.id);
		const label = id ? `${toolbox}, ${id}` : localize('topicMaps.mapNumber', "{0}, map {1}", toolbox, index + 1);
		const missing = TEXT_FIELDS.filter(field => !text(entry[field]));
		const wrong: string[] = missing.map(field => localize('topicMaps.missing', "{0} has no {1}", label, field));
		const topic = text(entry.topic);
		if (topic && !topics.some(({ id }) => id === topic)) {
			wrong.push(localize('topicMaps.topic', "{0}: the topic {1} is not one of the toolbox's topics", label, topic));
		}
		const kind = text(entry.kind);
		if (kind && !(KINDS as readonly string[]).includes(kind)) {
			wrong.push(localize('topicMaps.kind', "{0}: the kind must be historical, legendary or fictional, not {1}", label, kind));
		}
		const since = entry.since;
		const upto = entry.upto;
		if (typeof since !== 'number' || typeof upto !== 'number' || !Number.isInteger(since) || !Number.isInteger(upto) || since > upto) {
			wrong.push(localize('topicMaps.years', "{0}: since and upto must be whole years, negative before the Common Era, since not after upto", label));
		}
		const sourceUrl = text(entry.sourceUrl);
		const licenceUrl = text(entry.licenceUrl);
		if ((sourceUrl && !isHttps(sourceUrl)) || (licenceUrl && !isHttps(licenceUrl))) {
			wrong.push(localize('topicMaps.links', "{0}: the links of the source and the licence must start with https://", label));
		}
		if (id && maps.some(map => map.key === `${extensionId}/${id}`)) {
			wrong.push(localize('topicMaps.duplicate', "{0}: another map of the toolbox has the same id", label));
		}
		if (wrong.length) {
			problems.push(...wrong);
			continue;
		}
		maps.push({
			key: `${extensionId}/${id}`,
			topic,
			title: text(entry.title),
			work: text(entry.work),
			kind: kind as MapKind,
			since: since as number,
			upto: upto as number,
			region: text(entry.region),
			description: text(entry.description),
			source: text(entry.source),
			sourceUrl,
			licence: text(entry.licence),
			licenceUrl,
			code: typeof entry.code === 'string' ? entry.code.replace(/^\n+|\s+$/g, '') : '',
			toolbox,
		});
	}
	return maps;
}

/** The open page, so a second request shows it again, on the topic asked for. */
let openPage: WebviewInput | undefined;

/** Opens the Topic Maps page on a topic, or shows it again on that topic when it is open. */
async function openTopicMapsPage(accessor: ServicesAccessor, topicId?: string): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const toolboxPanelsService = accessor.get(IToolboxPanelsService);
	const fileService = accessor.get(IFileService);
	const commandService = accessor.get(ICommandService);
	const clipboardService = accessor.get(IClipboardService);
	const openerService = accessor.get(IOpenerService);
	const notificationService = accessor.get(INotificationService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		if (topicId) {
			openPage.webview.postMessage({ command: 'select', topic: topicId });
		}
		return;
	}
	const title = localize('topicMaps.title', "Topic Maps");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.topicMaps',
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

	// The maps of the installed toolboxes, read again when a toolbox is installed or removed
	let maps: ITopicMap[] = [];
	let selected = topicId;
	const sendMaps = async () => {
		const topics: IToolboxTopicInfo[] = [];
		const read: ITopicMap[] = [];
		const problems: string[] = [];
		for (const toolbox of toolboxPanelsService.getToolboxes()) {
			const topicMaps = toolbox.topicMaps;
			if (!topicMaps) {
				continue;
			}
			// A topic another toolbox gave first keeps that toolbox's title and description
			topics.push(...topicMaps.topics.filter(topic => !topics.some(other => other.id === topic.id)));
			try {
				const content = (await fileService.readFile(topicMaps.file)).value.toString();
				read.push(...readMaps(content, toolbox.extensionId, toolbox.extensionName, topicMaps.topics, problems));
			} catch {
				problems.push(localize('topicMaps.noFile', "{0}: the maps file {1} cannot be read", toolbox.extensionName, topicMaps.file.path));
			}
		}
		maps = read;
		if (!selected || !topics.some(topic => topic.id === selected)) {
			selected = topics[0]?.id;
		}
		webviewInput.webview.postMessage({ command: 'maps', topics, maps, problems, selected });
	};
	disposables.add(toolboxPanelsService.onDidChange(() => sendMaps()));

	disposables.add(webviewInput.webview.onMessage((e: { message: TopicMapsMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			sendMaps();
		} else if (message.command === 'draw' || message.command === 'copy') {
			const map = maps.find(map => map.key === message.key);
			if (!map) {
				return;
			}
			if (message.command === 'copy') {
				clipboardService.writeText(map.code);
				return;
			}
			sendToJuliaRepl(map.code, commandService).then(sent => {
				if (!sent) {
					notificationService.warn(localize('topicMaps.noRepl', "The Julia REPL could not be started to draw {0}.", map.title));
				}
			});
		} else if (message.command === 'openLink' && typeof message.url === 'string' && isHttps(message.url)) {
			openerService.open(URI.parse(message.url));
		}
	}));
}

/** The page: its texts come from here, the topics and maps from the `maps` message. */
function pageHtml(): string {
	const text = {
		title: localize('topicMaps.title', "Topic Maps"),
		search: localize('topicMaps.search', "Search maps"),
		empty: localize('topicMaps.empty', "No installed toolbox gives maps under this topic yet."),
		noTopics: localize('topicMaps.noTopics', "No installed toolbox gives topic maps."),
		noMatch: localize('topicMaps.noMatch', "No map matches."),
		map: localize('topicMaps.map', "Map"),
		kind: localize('topicMaps.kindColumn', "Kind"),
		years: localize('topicMaps.yearsColumn', "Years"),
		region: localize('topicMaps.regionColumn', "Region"),
		source: localize('topicMaps.sourceColumn', "Source"),
		toolbox: localize('topicMaps.toolboxColumn', "Toolbox"),
		kinds: {
			historical: localize('topicMaps.historical', "Historical"),
			legendary: localize('topicMaps.legendary', "Legendary"),
			fictional: localize('topicMaps.fictional', "Fictional"),
		},
		bce: localize('topicMaps.bce', "{0} BCE"),
		draw: localize('topicMaps.draw', "Draw the Map"),
		copy: localize('topicMaps.copy', "Copy Code"),
		drawHint: localize('topicMaps.drawHint', "Draw the Map runs this code in the Julia REPL; the map opens in Pollis."),
		problems: localize('topicMaps.problems', "Maps left out"),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>${LIBRARY_PAGE_STYLE}
		${voiceButtonsCss}
	.hint { color: var(--vscode-descriptionForeground); margin: 0 0 8px 0; line-height: 1.4; max-width: 900px; }
	.tabs { display: flex; flex-wrap: wrap; gap: 16px; border-bottom: 1px solid var(--vscode-widget-border); margin: 0 0 12px 0; }
	.tab { font: inherit; font-size: 13px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--vscode-descriptionForeground); padding: 4px 0; cursor: pointer; }
	.tab.selected { color: var(--vscode-foreground); border-bottom-color: var(--vscode-focusBorder); }
	.search { width: 100%; max-width: 420px; margin: 0 0 8px 0; padding: 4px 6px; font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
	.search:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
	.work { color: var(--vscode-descriptionForeground); margin: 2px 0 0 0; }
	.details td { background: var(--vscode-textBlockQuote-background); }
	tr.details:hover td { background: var(--vscode-textBlockQuote-background); }
	pre.code { margin: 0 0 8px 0; padding: 8px; overflow-x: auto; font-family: var(--vscode-editor-font-family); font-size: 12px; background: var(--vscode-textCodeBlock-background); border-radius: 2px; }
	.buttons { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
	.buttons button { font: inherit; font-size: 12px; padding: 4px 10px; border-radius: 2px; border: 1px solid var(--vscode-button-border, transparent); cursor: pointer; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
	.buttons button.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
	.problems { margin: 16px 0 0 0; color: var(--vscode-descriptionForeground); }
	.problems summary { cursor: pointer; }
	.problems li { margin: 2px 0; }</style>
</head>
<body>
<div class="container">
	<div class="title-row">
		<h1 id="heading">${text.title}</h1>
		${voiceButtonsHtml}
	</div>
	<p class="subtitle" id="intro"></p>
	<div class="tabs" id="tabs" role="tablist"></div>
	<input class="search" id="search" type="search" placeholder="${text.search}" aria-label="${text.search}">
	<p class="hint" id="note" hidden></p>
	<table id="table" hidden>
		<thead><tr><th class="name">${text.map}</th><th>${text.kind}</th><th>${text.years}</th><th>${text.region}</th><th>${text.source}</th><th>${text.toolbox}</th></tr></thead>
		<tbody id="maps"></tbody>
	</table>
	<details class="problems" id="problems" hidden><summary>${text.problems}</summary><ul id="problemList"></ul></details>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	const TEXT = ${JSON.stringify(text)};
	${LIBRARY_PAGE_HELPERS}

	let topics = [];
	let maps;
	let selected;
	let open;
	const search = document.getElementById('search');

	// A year as the page writes it: 499 BCE, 1337
	function year(value) {
		return value < 0 ? TEXT.bce.replace('{0}', String(-value)) : String(value);
	}

	function years(map) {
		if (map.since === map.upto) {
			return year(map.since);
		}
		// Both before the Common Era: 499-449 BCE
		return map.upto < 0 ? TEXT.bce.replace('{0}', (-map.since) + '\\u2013' + (-map.upto)) : year(map.since) + '\\u2013' + year(map.upto);
	}

	function matches(map) {
		const query = search.value.trim().toLowerCase();
		return map.topic === selected && (!query || [map.title, map.work, map.region, map.source, map.description].some(field => (field || '').toLowerCase().includes(query)));
	}

	function openLink(label, url) {
		return url ? link(label, () => vscode.postMessage({ command: 'openLink', url })) : element('span', '', label);
	}

	// (a) the map's title, its work and what it shows, (b) its kind, (c) its years, (d) its region, (e) its source and licence, (f) its toolbox
	function row(map) {
		const row = element('tr');
		const name = cell(row, 'name');
		const title = element('div', 'title', map.title);
		title.tabIndex = 0;
		title.setAttribute('role', 'button');
		title.setAttribute('aria-expanded', String(open === map.key));
		const toggle = () => { open = open === map.key ? undefined : map.key; render(); };
		title.addEventListener('click', toggle);
		title.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); } });
		name.appendChild(title);
		name.appendChild(element('div', 'work', map.work));
		if (map.description) {
			name.appendChild(element('p', 'description clamped', map.description));
		}
		cell(row).textContent = TEXT.kinds[map.kind];
		cell(row, 'nowrap').textContent = years(map);
		cell(row).textContent = map.region;
		const source = cell(row);
		source.appendChild(openLink(map.source, map.sourceUrl));
		const licence = element('div', 'small');
		licence.appendChild(openLink(map.licence, map.licenceUrl));
		source.appendChild(licence);
		cell(row, 'small').textContent = map.toolbox;
		return row;
	}

	// Under an open map: its code, and the buttons that draw it and copy it
	function details(map) {
		const row = element('tr', 'details');
		const td = cell(row);
		td.colSpan = 6;
		td.appendChild(element('p', 'hint', TEXT.drawHint));
		td.appendChild(element('pre', 'code', map.code));
		const buttons = element('div', 'buttons');
		const draw = element('button', 'primary', TEXT.draw);
		draw.addEventListener('click', () => vscode.postMessage({ command: 'draw', key: map.key }));
		const copy = element('button', '', TEXT.copy);
		copy.addEventListener('click', () => vscode.postMessage({ command: 'copy', key: map.key }));
		buttons.appendChild(draw);
		buttons.appendChild(copy);
		td.appendChild(buttons);
		return row;
	}

	function renderTabs() {
		const tabs = document.getElementById('tabs');
		tabs.textContent = '';
		for (const topic of topics) {
			const tab = element('button', 'tab' + (topic.id === selected ? ' selected' : ''), topic.title);
			tab.setAttribute('role', 'tab');
			tab.setAttribute('aria-selected', String(topic.id === selected));
			tab.addEventListener('click', () => select(topic.id));
			tabs.appendChild(tab);
		}
		tabs.hidden = topics.length < 2;
		const topic = topics.find(topic => topic.id === selected);
		document.getElementById('heading').textContent = topic ? topic.title : TEXT.title;
		document.getElementById('intro').textContent = topic ? topic.description : '';
	}

	function render() {
		if (!maps) {
			return;
		}
		renderTabs();
		const shown = maps.filter(matches).sort((a, b) => a.since - b.since || a.title.localeCompare(b.title));
		const body = document.getElementById('maps');
		body.textContent = '';
		for (const map of shown) {
			body.appendChild(row(map));
			if (open === map.key) {
				body.appendChild(details(map));
			}
		}
		document.getElementById('table').hidden = !shown.length;
		const note = document.getElementById('note');
		note.textContent = shown.length ? '' : !topics.length ? TEXT.noTopics : maps.some(map => map.topic === selected) ? TEXT.noMatch : TEXT.empty;
		note.hidden = !!shown.length;
		search.hidden = !topics.length;
	}

	function select(topic) {
		if (topics.some(other => other.id === topic)) {
			selected = topic;
			open = undefined;
			render();
		}
	}

	search.addEventListener('input', render);
	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'maps') {
			topics = message.topics;
			maps = message.maps;
			selected = message.selected;
			const problems = document.getElementById('problems');
			const list = document.getElementById('problemList');
			list.textContent = '';
			for (const problem of message.problems) {
				list.appendChild(element('li', '', problem));
			}
			problems.hidden = !message.problems.length;
			render();
		} else if (message.command === 'select') {
			select(message.topic);
		}
	});
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

CommandsRegistry.registerCommand(TOPIC_MAPS_COMMAND_ID, (accessor, topic?: unknown) => openTopicMapsPage(accessor, typeof topic === 'string' ? topic : undefined));
