/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { agentTiers, MODEL_ROUTING_COMMAND_ID, TIER_CELLS_SETTING } from './modelRouting.js';
import { voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';
import { sortHeadingsCss, sortHeadingsScript, sortHint } from '../../model/browser/webviews/webviewPager.js';

// Compose > Local Models > Models Installed: a page of the GGUF models on this computer, those Pollis downloaded
// and those in the Hugging Face cache, which the llama.cpp that comes with Pollis runs. Each shows its kind, what it
// reads (images and audio through the projector beside it), whether it calls tools (from its chat template), its size,
// where it is, the Model Tasks and Routing tiers that run on it, a link to show it in its folder, and Other Versions: the other files of its repository on Hugging Face
// (other quantisations, its projector), each with its size and a link to download it. A click on a column's
// header sorts the models by it; they are sorted by name at first. The models are
// looked up again (language-julia.pollisInstalledModels) when the page is shown again, Pollis gets the focus back
// or a tier's model changes.

export const MODELS_INSTALLED_COMMAND_ID = 'pollis.localModels.installed';

/** A model on this computer, as language-julia.pollisInstalledModels answers it. */
export interface IInstalledModel {
	readonly file: string;
	/** The model's value in the settings: `hf:` for a file in ~/.pollis/models, else its path. */
	readonly value?: string;
	readonly name: string;
	readonly sizeLabel?: string;
	readonly kind?: 'chat' | 'embedding';
	readonly bytes: number;
	readonly pollis: boolean;
	readonly repository?: string;
	readonly media: readonly ('image' | 'audio')[];
	readonly tools?: boolean;
	readonly tiers: readonly string[];
}

/** A file of a model's repository, as language-julia.pollisModelVersions answers it. */
interface IModelVersion {
	readonly value: string;
	readonly name: string;
	readonly bytes: number;
	readonly projector: boolean;
	readonly installed: boolean;
}

type ModelsMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'routing' }
	| { readonly command: 'reveal'; readonly file: string }
	| { readonly command: 'versions'; readonly file: string }
	| { readonly command: 'download'; readonly file: string; readonly value: string };

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the Models Installed page, or shows it again when it is open. */
async function openModelsInstalledPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const hostService = accessor.get(IHostService);
	const commandService = accessor.get(ICommandService);
	const configurationService = accessor.get(IConfigurationService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('modelsInstalled.title', "Models Installed");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.modelsInstalled',
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

	let models: readonly IInstalledModel[] = [];
	const sendState = async () => {
		models = await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels') ?? [];
		webviewInput.webview.postMessage({
			command: 'state',
			models: models.map(model => ({ ...model, tiers: agentTiers(configurationService).filter(tier => model.tiers.includes(tier.id)).map(tier => tier.label) })),
		});
	};
	// The files offered under each model, so that only those are downloaded
	const offered = new Map<string, readonly IModelVersion[]>();
	const sendVersions = async (file: string) => {
		const answer = await commandService.executeCommand<IModelVersion[] | { error: string }>('language-julia.pollisModelVersions', file);
		const versions = Array.isArray(answer) ? answer : [];
		offered.set(file, versions);
		webviewInput.webview.postMessage({ command: 'versions', file, versions, error: Array.isArray(answer) ? undefined : answer?.error });
	};
	disposables.add(webviewInput.webview.onDidFocus(() => sendState()));
	disposables.add(hostService.onDidChangeFocus(focused => {
		if (focused) {
			sendState();
		}
	}));
	disposables.add(configurationService.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration(TIER_CELLS_SETTING)) {
			sendState();
		}
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: ModelsMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			sendState();
		} else if (message.command === 'routing') {
			commandService.executeCommand(MODEL_ROUTING_COMMAND_ID);
		} else if (message.command === 'reveal' && models.some(model => model.file === message.file)) {
			commandService.executeCommand('revealFileInOS', URI.file(message.file));
		} else if (message.command === 'versions' && models.some(model => model.file === message.file)) {
			sendVersions(message.file);
		} else if (message.command === 'download' && offered.get(message.file)?.some(version => version.value === message.value)) {
			await commandService.executeCommand<boolean>('language-julia.pollisDownloadModel', message.value);
			webviewInput.webview.postMessage({ command: 'downloaded', value: message.value });
			await sendState();
			sendVersions(message.file);
		}
	}));
}

/** The page: its texts come from here, the models from the `state` message. */
function pageHtml(): string {
	const text = {
		title: localize('modelsInstalled.title', "Models Installed"),
		intro: localize('modelsInstalled.intro', "The local models on this computer: those Pollis downloaded and those in the Hugging Face cache. Pollis runs them with {0}, which comes with it, free and private.", '<span class="yellow">llama.cpp</span>'),
		model: localize('modelsInstalled.model', "Model"),
		kind: localize('modelsInstalled.kind', "Kind"),
		reads: localize('modelsInstalled.reads', "Reads"),
		text: localize('modelsInstalled.text', "Text"),
		image: localize('modelsInstalled.image', "Image"),
		audio: localize('modelsInstalled.audio', "Audio"),
		tools: localize('modelsInstalled.tools', "Tools"),
		yes: localize('modelsInstalled.yes', "Yes"),
		no: localize('modelsInstalled.no', "No"),
		toolsTooltip: localize('modelsInstalled.toolsTooltip', "Whether the model can call tools, from its chat template: the agent of a Model Tasks and Routing tier needs a model that can."),
		sortTooltip: sortHint(),
		size: localize('modelsInstalled.size', "Size"),
		where: localize('modelsInstalled.where', "Where"),
		usedBy: localize('modelsInstalled.usedBy', "Model Tasks and Routing"),
		chat: localize('modelsInstalled.chat', "Chat"),
		embedding: localize('modelsInstalled.embedding', "Embedding"),
		pollis: localize('modelsInstalled.pollis', "Pollis"),
		huggingFace: localize('modelsInstalled.huggingFace', "Hugging Face cache"),
		showInFolder: localize('modelsInstalled.showInFolder', "Show in Folder"),
		otherVersions: localize('modelsInstalled.otherVersions', "Other Versions"),
		lookingUp: localize('modelsInstalled.lookingUp', "Looking on Hugging Face..."),
		noVersions: localize('modelsInstalled.noVersions', "Its repository has no other version."),
		projector: localize('modelsInstalled.projector', "Projector, for images or audio"),
		versionInstalled: localize('modelsInstalled.versionInstalled', "Installed"),
		download: localize('modelsInstalled.download', "Download"),
		downloading: localize('modelsInstalled.downloading', "Downloading..."),
		none: localize('modelsInstalled.none', "No local model on this computer yet. A model is downloaded the first time a panel or a Model Tasks and Routing tier uses it."),
		loading: localize('modelsInstalled.loading', "Looking for the models..."),
		routingIntro: localize('modelsInstalled.routingIntro', "Which tasks run on which local model:"),
		routingLink: localize('modelsInstalled.routingLink', "Compose > Orchestration > Model Tasks and Routing"),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		${voiceButtonsCss}
		${sortHeadingsCss}
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 1100px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; line-height: 1.4; max-width: 900px; }
		.hint { color: var(--vscode-descriptionForeground); margin: 16px 0 8px 0; line-height: 1.4; max-width: 900px; }
		table { width: 100%; border-collapse: collapse; }
		th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); }
		td { vertical-align: top; padding: 10px 8px; border-bottom: 1px solid var(--vscode-widget-border); line-height: 1.4; }
		tr:hover td { background: var(--vscode-list-hoverBackground); }
		.name { font-size: 14px; font-weight: 600; }
		.small { font-size: 12px; color: var(--vscode-descriptionForeground); }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.link:hover { text-decoration: underline; }
		.right { text-align: right; white-space: nowrap; }
		.right .link + .link { margin-left: 12px; }
		tr.versions td { padding-top: 4px; }
		.versions table td { border-bottom: none; padding: 3px 8px; }
		.installed { color: var(--vscode-testing-iconPassed); }
		/* llama.cpp, in the yellow of the menu paths */
		.yellow { color: #e8a33d; }
		body.vscode-light .yellow { color: #a8650d; }
		table.local td:first-child { box-shadow: inset 3px 0 0 var(--vscode-textLink-foreground); padding-left: 12px; }
		table.local tr:not(:hover) td { background: color-mix(in srgb, var(--vscode-textLink-foreground) 5%, transparent); }
	</style>
</head>
<body>
<div class="container">
	<div class="title-row">
		<h1>${text.title}</h1>
		${voiceButtonsHtml}
	</div>
	<p class="subtitle">${text.intro}</p>
	<table class="local">
		<thead><tr id="headers"></tr></thead>
		<tbody id="models"></tbody>
	</table>
	<p class="hint" id="none"></p>
	<p class="hint">${text.routingIntro} <button class="link" id="routing">${text.routingLink}</button></p>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	${sortHeadingsScript()}
	const TEXT = ${JSON.stringify(text)};
	const models = document.getElementById('models');
	const none = document.getElementById('none');
	none.textContent = TEXT.loading;
	// The models whose Other Versions are open, and what Hugging Face answered for each
	const open = new Set();
	const versions = new Map();
	const downloading = new Set();
	let lastState;
	// The columns, with what each sorts by, and the column sorted by
	const COLUMNS = [
		{ label: TEXT.model, key: model => model.name.toLowerCase() },
		{ label: TEXT.kind, key: model => model.kind || '' },
		{ label: TEXT.reads, key: model => model.media.length },
		{ label: TEXT.tools, title: TEXT.toolsTooltip, key: model => model.tools === undefined ? -1 : model.tools ? 1 : 0 },
		{ label: TEXT.size, key: model => model.bytes },
		{ label: TEXT.where, key: model => model.pollis ? 0 : 1 },
		{ label: TEXT.usedBy, key: model => model.tiers.join(', ') },
	];
	const sort = { column: 0, ascending: true };

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	function gigabytes(bytes) {
		return bytes >= 1e9 ? (bytes / 1e9).toFixed(1) + ' GB' : Math.round(bytes / 1e6) + ' MB';
	}

	function versionsRow(model) {
		const row = element('tr', 'versions');
		const cell = element('td');
		cell.colSpan = COLUMNS.length + 1;
		const answer = versions.get(model.file);
		if (!answer) {
			cell.appendChild(element('div', 'small', TEXT.lookingUp));
		} else if (answer.error || !answer.versions.length) {
			cell.appendChild(element('div', 'small', answer.error || TEXT.noVersions));
		} else {
			const table = element('table');
			for (const version of answer.versions) {
				const line = element('tr');
				const name = element('td');
				name.appendChild(element('div', '', version.name));
				if (version.projector) {
					name.appendChild(element('div', 'small', TEXT.projector));
				}
				line.appendChild(name);
				line.appendChild(element('td', '', gigabytes(version.bytes)));
				const action = element('td', 'right');
				if (version.installed) {
					action.appendChild(element('span', 'installed', TEXT.versionInstalled));
				} else if (downloading.has(version.value)) {
					action.appendChild(element('span', 'small', TEXT.downloading));
				} else {
					const download = element('button', 'link', TEXT.download);
					download.addEventListener('click', () => {
						downloading.add(version.value);
						render(lastState);
						vscode.postMessage({ command: 'download', file: model.file, value: version.value });
					});
					action.appendChild(download);
				}
				line.appendChild(action);
				table.appendChild(line);
			}
			cell.appendChild(table);
		}
		row.appendChild(cell);
		return row;
	}

	function renderHeaders() {
		const headers = document.getElementById('headers');
		headers.textContent = '';
		COLUMNS.forEach((column, index) => {
			const header = element('th', 'sortable');
			header.title = column.title || TEXT.sortTooltip;
			setSortArrow(header, column.label, sort.column === index, !sort.ascending);
			header.addEventListener('click', () => {
				sort.ascending = sort.column === index ? !sort.ascending : true;
				sort.column = index;
				renderHeaders();
				if (lastState) {
					render(lastState);
				}
			});
			headers.appendChild(header);
		});
		headers.appendChild(element('th'));
	}

	function render(state) {
		lastState = state;
		models.textContent = '';
		none.textContent = state.models.length ? '' : TEXT.none;
		none.style.display = state.models.length ? 'none' : '';
		// Sorted by the column chosen, then by name
		const key = COLUMNS[sort.column].key;
		const name = COLUMNS[0].key;
		const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
		const sorted = [...state.models].sort((a, b) => (sort.ascending ? 1 : -1) * compare(key(a), key(b)) || compare(name(a), name(b)));
		for (const model of sorted) {
			const row = element('tr');
			const name = element('td');
			name.appendChild(element('div', 'name', model.name));
			name.title = model.file;
			row.appendChild(name);
			row.appendChild(element('td', '', model.kind === 'embedding' ? TEXT.embedding : model.kind === 'chat' ? TEXT.chat : ''));
			row.appendChild(element('td', '', [TEXT.text, ...model.media.map(medium => medium === 'image' ? TEXT.image : TEXT.audio)].join(', ')));
			row.appendChild(element('td', model.tools ? 'installed' : '', model.tools === undefined ? '-' : model.tools ? TEXT.yes : TEXT.no));
			const size = element('td');
			size.appendChild(element('div', '', gigabytes(model.bytes)));
			if (model.sizeLabel) {
				size.appendChild(element('div', 'small', model.sizeLabel));
			}
			row.appendChild(size);
			row.appendChild(element('td', '', model.pollis ? TEXT.pollis : TEXT.huggingFace));
			row.appendChild(element('td', '', model.tiers.join(', ') || '-'));
			const action = element('td', 'right');
			const reveal = element('button', 'link', TEXT.showInFolder);
			reveal.addEventListener('click', () => vscode.postMessage({ command: 'reveal', file: model.file }));
			action.appendChild(reveal);
			if (model.repository) {
				const other = element('button', 'link', TEXT.otherVersions);
				other.addEventListener('click', () => {
					if (open.has(model.file)) {
						open.delete(model.file);
					} else {
						open.add(model.file);
						vscode.postMessage({ command: 'versions', file: model.file });
					}
					render(lastState);
				});
				action.appendChild(other);
			}
			row.appendChild(action);
			models.appendChild(row);
			if (open.has(model.file)) {
				models.appendChild(versionsRow(model));
			}
		}
	}

	renderHeaders();
	document.getElementById('routing').addEventListener('click', () => vscode.postMessage({ command: 'routing' }));

	window.addEventListener('message', event => {
		if (event.data.command === 'state') {
			render(event.data);
		} else if (event.data.command === 'downloaded') {
			// Done, or failed with its error shown: the next answer of Hugging Face says which
			downloading.delete(event.data.value);
		} else if (event.data.command === 'versions') {
			versions.set(event.data.file, event.data);
			if (lastState) {
				render(lastState);
			}
		}
	});
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: MODELS_INSTALLED_COMMAND_ID,
			title: localize2('modelsInstalled.action', "Models Installed"),
			category: localize2('modelsInstalled.category', "Compose"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openModelsInstalledPage(accessor);
	}
});
