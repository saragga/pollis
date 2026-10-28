/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { hasKey } from '../../../../base/common/types.js';
import { localize, localize2 } from '../../../../nls.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { spinnerCss, spinnerSvg } from '../../model/browser/webviews/webviewScaffold.js';
import { ASK_CLOUD_MODELS, ASK_CLOUD_PROVIDERS, ASK_LOCAL_PREFIX } from '../common/askPollis.js';
import { askAnswerCss, askAnswerScript } from './askPollisWebview.js';
import { ICompareModel, ICompareModelsTab, ICompareModelsTabHost } from './compareModelsTabs.js';
import { oneQuestionTab } from './compareOneQuestion.js';
import { IInstalledModel } from './modelsInstalledPage.js';

// Compare Models, from Ask Pollis and Compose > Local Models > Compare Models... (compose.contribution.ts): the chat
// models of this computer, those of Compose > Local Models, and the cloud models of Ask Pollis, compared on the same
// questions, the same passages and the same instruction. The page holds the tab bar and the models chosen, remembered for the next time; each tab is a part of
// its own (compareModelsTabs.ts), with a command that opens the page at it.

export const COMPARE_MODELS_COMMAND_ID = 'pollis.compareModels';

const TABS: readonly ICompareModelsTab[] = [oneQuestionTab];

/** The models chosen, by their values, kept for the next time the page opens. */
const CHOSEN_KEY = 'pollis.compareModels.chosen';

type CompareModelsMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'choose'; readonly chosen: readonly string[] }
	// A tab's own, for its host
	| { readonly command: string; readonly tab: string };

/** The open page, so a second request shows it again, at the tab asked for. */
let openPage: { readonly input: WebviewInput; show(tab: string): void } | undefined;

async function openCompareModelsPage(accessor: ServicesAccessor, tab: string = TABS[0].id): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const commandService = accessor.get(ICommandService);
	const storageService = accessor.get(IStorageService);

	if (openPage && !openPage.input.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage.input, openPage.input.group ?? -1, false);
		openPage.show(tab);
		return;
	}
	const title = localize('compareModels.title', "Compare Models");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.compareModels',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml(tab));
	const post = (message: object) => webviewInput.webview.postMessage(message);
	openPage = { input: webviewInput, show: shown => post({ command: 'showTab', shown }) };

	const disposables = new DisposableStore();
	// The models listed, those on this computer first, and the values of those chosen
	let listed: readonly (ICompareModel & { readonly detail: string })[] = [];
	let chosen: readonly string[] = (() => {
		try {
			const stored = JSON.parse(storageService.get(CHOSEN_KEY, StorageScope.APPLICATION, '[]'));
			return Array.isArray(stored) ? stored.filter((value): value is string => typeof value === 'string') : [];
		} catch {
			return [];
		}
	})();

	const context = (id: string) => ({
		post: (message: object) => post({ ...message, tab: id }),
		models: () => listed.filter(model => chosen.includes(model.value)).map(({ value, label, file }) => ({ value, label, file })),
	});
	const hosts = new Map<string, ICompareModelsTabHost>(TABS.map(definition => [definition.id, disposables.add(definition.create(accessor, context(definition.id)))]));

	// The models on this computer are looked up each time the page is ready, so that one downloaded since is listed
	const postModels = async () => {
		const installed = (await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels').catch(() => undefined) ?? []).filter(model => model.kind !== 'embedding');
		listed = [
			...installed.map(model => ({ value: ASK_LOCAL_PREFIX + model.file, label: model.name, file: model.file, detail: model.sizeLabel ?? '' })),
			...ASK_CLOUD_MODELS.map(model => ({ value: model.id, label: model.label, detail: ASK_CLOUD_PROVIDERS[model.provider].label })),
		];
		post({ command: 'models', models: listed.map(({ value, label, file, detail }) => ({ value, label, detail, local: !!file })), chosen });
	};

	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage((e: { message: CompareModelsMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			postModels();
		} else if (message.command === 'choose' && hasKey(message, { chosen: true })) {
			chosen = message.chosen;
			storageService.store(CHOSEN_KEY, JSON.stringify(chosen), StorageScope.APPLICATION, StorageTarget.USER);
		} else if (hasKey(message, { tab: true })) {
			hosts.get(message.tab)?.onMessage(message);
		}
	}));
}

/** The page: the tab bar, the models to choose, and each tab's content, the one of `tab` shown. */
function pageHtml(tab: string): string {
	const text = {
		title: localize('compareModels.title', "Compare Models"),
		intro: localize('compareModels.intro', "Which model should answer Ask Pollis? Each model chosen is given the same question, the same passages and the same instruction, so that what differs is the model alone. The local models run one after the other, each alone in memory."),
		models: localize('compareModels.models', "Models"),
		thisComputer: localize('compareModels.onThisComputer', "On This Computer"),
		cloud: localize('compareModels.inTheCloud', "In the Cloud, With Your Own Key"),
		noLocal: localize('compareModels.noLocal', "No chat model on this computer yet: Compose > Local Models downloads them."),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 1400px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; line-height: 1.4; max-width: 900px; }
		.small { font-size: 12px; color: var(--vscode-descriptionForeground); line-height: 1.4; }
		textarea { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 6px 8px; width: 100%; resize: vertical; min-height: 56px; line-height: 1.4; }
		select { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 6px 8px; }
		textarea:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		.row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
		.row .grow { flex: 1; }
		.bar { display: flex; gap: 8px; }
		button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; border-radius: 2px; padding: 4px 12px; cursor: pointer; }
		.bar > button.action.current { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button:disabled { opacity: 0.5; cursor: default; }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.link:hover { text-decoration: underline; }
		.tabs { display: flex; align-items: center; gap: 16px; margin: 0 0 16px 0; }
		.tab { padding: 0; border: none; background: none; font: inherit; font-size: 14px; color: var(--vscode-descriptionForeground); cursor: pointer; }
		.tab:hover, .tab.active { color: var(--vscode-foreground); }
		.models { margin: 0 0 16px 0; }
		.models h3 { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); margin: 0 0 6px 0; }
		.group { display: flex; flex-wrap: wrap; gap: 4px 16px; margin: 0 0 8px 0; }
		.group label { display: flex; align-items: baseline; gap: 6px; cursor: pointer; }
		.status { margin: 6px 0; }
		.error { color: var(--vscode-errorForeground); }
		${spinnerCss}
		${askAnswerCss}
		${TABS.map(definition => definition.css).join('\n')}
	</style>
</head>
<body>
<div class="container">
	<h1>${text.title}</h1>
	<p class="subtitle">${text.intro}</p>
	<div class="tabs" id="tabs">
		${TABS.map(definition => `<button class="tab" data-tab="${definition.id}">${definition.label()}</button>`).join('')}
	</div>
	<div class="models">
		<h3>${text.models}</h3>
		<div class="small">${text.thisComputer}</div>
		<div class="group" id="local"></div>
		<div class="small">${text.cloud}</div>
		<div class="group" id="cloud"></div>
	</div>
	${TABS.map(definition => `<div class="panel" data-tab="${definition.id}" hidden>${definition.html()}</div>`).join('')}
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const SPINNER = '${spinnerSvg}';
	// Each tab's script sets its part here, and sends with postTab
	const TABS = {};
	function postTab(tab, message) {
		vscode.postMessage({ ...message, tab });
	}
	${askAnswerScript()}
	${TABS.map(definition => definition.script()).join('\n')}

	function showTab(id) {
		for (const button of document.querySelectorAll('.tab')) { button.classList.toggle('active', button.dataset.tab === id); }
		for (const panel of document.querySelectorAll('.panel')) { panel.hidden = panel.dataset.tab !== id; }
		TABS[id]?.shown?.();
	}
	document.getElementById('tabs').addEventListener('click', event => {
		const button = event.target.closest('.tab');
		if (button) { showTab(button.dataset.tab); }
	});
	// One blue button in each bar: the last one the pointer was on
	for (const bar of document.querySelectorAll('.bar')) {
		bar.addEventListener('mouseover', event => {
			const button = event.target.closest('button.action');
			if (button && !button.disabled && !button.classList.contains('current')) {
				bar.querySelector('button.current')?.classList.remove('current');
				button.classList.add('current');
			}
		});
	}

	function renderModels(models, chosen) {
		const local = document.getElementById('local');
		const cloud = document.getElementById('cloud');
		local.textContent = '';
		cloud.textContent = '';
		for (const model of models) {
			const label = element('label');
			const box = element('input');
			box.type = 'checkbox';
			box.value = model.value;
			box.checked = chosen.includes(model.value);
			label.append(box, element('span', '', model.label));
			if (model.detail) { label.appendChild(element('span', 'small', model.detail)); }
			(model.local ? local : cloud).appendChild(label);
		}
		if (!local.children.length) { local.appendChild(element('span', 'small', TEXT.noLocal)); }
	}
	document.querySelector('.models').addEventListener('change', () => {
		const chosen = [...document.querySelectorAll('.models input:checked')].map(box => box.value);
		vscode.postMessage({ command: 'choose', chosen });
	});

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'models') {
			renderModels(message.models, message.chosen);
		} else if (message.command === 'showTab') {
			showTab(message.shown);
		} else if (message.tab) {
			TABS[message.tab]?.onMessage(message);
		}
	});
	showTab(${JSON.stringify(tab)});
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: COMPARE_MODELS_COMMAND_ID,
			title: localize2('compareModels.action', "Compare Models..."),
			category: Categories.Help,
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openCompareModelsPage(accessor);
	}
});

for (const definition of TABS) {
	registerAction2(class extends Action2 {
		constructor() {
			super({ id: definition.commandId, title: definition.commandTitle, category: Categories.Help, f1: true });
		}
		run(accessor: ServicesAccessor): Promise<void> {
			return openCompareModelsPage(accessor, definition.id);
		}
	});
}
