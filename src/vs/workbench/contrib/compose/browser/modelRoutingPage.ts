/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { ITerminalInstanceService } from '../../terminal/browser/terminal.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { AGENT_TASK_TIERS_SETTING, AGENT_TASKS, AGENT_TIERS, AGENT_TIERS_SETTING, AgentTask, AgentTierChoice, MODEL_ROUTING_COMMAND_ID, taskTier, tierCommand } from './modelRouting.js';
import { AGENT_COMMAND_SETTING, CHOOSE_AGENT_COMMAND_ID, CODING_AGENTS, commandWords, findProgram, PROMPT_PLACEHOLDER, terminalEnvironment } from './pollisAgents.js';

// Compose > Orchestration > Model Routing: a page with the command line of each tier, Light, Standard and
// Strong, each marked installed on this computer or not (its tasks then run on the main agent), and a
// table of the agent tasks with the tier each runs on, its default or the user's choice. The choices are
// saved in the settings at once (modelRouting.ts); the page follows changes made in the settings while it
// is open.

type RoutingMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'tier'; readonly tier: string; readonly line: string }
	| { readonly command: 'task'; readonly task: string; readonly tier: string }
	| { readonly command: 'chooseAgent' };

/** Command lines offered for a tier: Claude Code on each model, then every agent on its cloud and its local model. */
const SUGGESTIONS = [
	'claude --model haiku {prompt}',
	'claude --model sonnet {prompt}',
	'claude --model opus {prompt}',
	...CODING_AGENTS.flatMap(agent => agent.localCommand ? [agent.command, agent.localCommand] : [agent.command]),
];

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the Model Routing page, or shows it again when it is open. */
async function openModelRoutingPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const configurationService = accessor.get(IConfigurationService);
	const fileService = accessor.get(IFileService);
	const terminalInstanceService = accessor.get(ITerminalInstanceService);
	const commandService = accessor.get(ICommandService);
	const hostService = accessor.get(IHostService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('modelRouting.title', "Model Routing");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.modelRouting',
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

	// Whether each tier's program is installed is looked up each time the page loads, is shown again or
	// Pollis gets the focus back, after an install.
	const sendState = async () => {
		const environment = await terminalEnvironment(terminalInstanceService);
		const tiers = await Promise.all(AGENT_TIERS.map(async tier => {
			const line = tierCommand(configurationService, tier.id);
			const program = line ? commandWords(line)[0] : '';
			return { ...tier, line, program, installed: !program || !!await findProgram(program, environment, fileService) };
		}));
		const overrides = configurationService.getValue<Partial<Record<AgentTask, AgentTierChoice>>>(AGENT_TASK_TIERS_SETTING) ?? {};
		webviewInput.webview.postMessage({
			command: 'state',
			main: configurationService.getValue<string>(AGENT_COMMAND_SETTING)?.trim() ?? '',
			tiers,
			tasks: AGENT_TASKS.map(task => ({ ...task, current: taskTier(configurationService, task.id), overridden: !!overrides[task.id] })),
		});
	};
	disposables.add(webviewInput.webview.onDidFocus(() => sendState()));
	disposables.add(hostService.onDidChangeFocus(focused => {
		if (focused) {
			sendState();
		}
	}));
	disposables.add(configurationService.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration(AGENT_COMMAND_SETTING) || e.affectsConfiguration(AGENT_TIERS_SETTING) || e.affectsConfiguration(AGENT_TASK_TIERS_SETTING)) {
			sendState();
		}
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: RoutingMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			sendState();
		} else if (message.command === 'tier' && AGENT_TIERS.some(tier => tier.id === message.tier)) {
			const tiers = configurationService.getValue<Record<string, string>>(AGENT_TIERS_SETTING) ?? {};
			await configurationService.updateValue(AGENT_TIERS_SETTING, { ...tiers, [message.tier]: message.line.trim() });
			webviewInput.webview.postMessage({ command: 'formDone', form: message.tier });
		} else if (message.command === 'task' && AGENT_TASKS.some(task => task.id === message.task)) {
			// The default tier is no override: the task follows its default if that ever changes
			const others = { ...configurationService.getValue<Record<string, string>>(AGENT_TASK_TIERS_SETTING) };
			delete others[message.task];
			const isDefault = !message.tier || AGENT_TASKS.find(task => task.id === message.task)!.tier === message.tier;
			await configurationService.updateValue(AGENT_TASK_TIERS_SETTING, isDefault ? others : { ...others, [message.task]: message.tier });
		} else if (message.command === 'chooseAgent') {
			commandService.executeCommand(CHOOSE_AGENT_COMMAND_ID);
		}
	}));
}

/** The page: its texts come from here, the tiers and the tasks from the `state` message. */
function pageHtml(): string {
	const text = {
		title: localize('modelRouting.title', "Model Routing"),
		intro: localize('modelRouting.intro', "Each agent task of the Compose menu runs on a tier: small tasks on Light, a fast, cheap or local model; hard ones on Strong. Give each tier the command line of an agent, with {0} where the first message goes, for example {1}. A tier left empty runs the main coding agent.", `<code>${PROMPT_PLACEHOLDER}</code>`, '<code>claude --model haiku {prompt}</code>'),
		main: localize('modelRouting.main', "Main coding agent:"),
		noMain: localize('modelRouting.noMain', "None chosen yet"),
		change: localize('modelRouting.change', "Change"),
		tiersTitle: localize('modelRouting.tiersTitle', "Tiers"),
		tier: localize('modelRouting.tier', "Tier"),
		command: localize('modelRouting.command', "Command"),
		status: localize('modelRouting.status', "On This Computer"),
		placeholder: localize('modelRouting.placeholder', "The main agent"),
		save: localize('modelRouting.save', "Save"),
		cancel: localize('modelRouting.cancel', "Cancel"),
		installed: localize('modelRouting.installed', "Installed"),
		usesMain: localize('modelRouting.usesMain', "Runs the main agent"),
		notInstalled: localize('modelRouting.notInstalled', "{0} isn't installed: its tasks run the main agent"),
		tasksTitle: localize('modelRouting.tasksTitle', "Tasks"),
		tasksIntro: localize('modelRouting.tasksIntro', "The tier each task runs on. A tier you choose replaces the task's default; choosing the default again goes back to it."),
		task: localize('modelRouting.task', "Task"),
		menu: localize('modelRouting.menu', "Menu"),
		runsOn: localize('modelRouting.runsOn', "Runs On"),
		runs: localize('modelRouting.runs', "Runs"),
		defaultTier: localize('modelRouting.defaultTier', "{0} (Default)"),
		mainAgent: localize('modelRouting.mainAgent', "Main Agent"),
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
		.container { max-width: 1100px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		h2 { font-size: 16px; font-weight: 600; margin: 28px 0 4px 0; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; line-height: 1.4; max-width: 900px; }
		.hint { color: var(--vscode-descriptionForeground); margin: 0 0 8px 0; line-height: 1.4; max-width: 900px; }
		code { font-family: var(--vscode-editor-font-family); font-size: 12px; color: var(--vscode-textPreformat-foreground); background: var(--vscode-textPreformat-background); border-radius: 3px; padding: 0 3px; }
		table { width: 100%; border-collapse: collapse; }
		th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); }
		td { vertical-align: top; padding: 10px 8px; border-bottom: 1px solid var(--vscode-widget-border); line-height: 1.4; }
		tr:hover td { background: var(--vscode-list-hoverBackground); }
		.name { font-size: 14px; font-weight: 600; }
		.small { font-size: 12px; color: var(--vscode-descriptionForeground); }
		.installed { color: var(--vscode-testing-iconPassed); }
		.warning { color: var(--vscode-editorWarning-foreground); }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; margin-left: 8px; }
		.link:hover { text-decoration: underline; }
		.row { display: flex; gap: 8px; }
		input, select { font-family: var(--vscode-editor-font-family); font-size: 12px; padding: 4px 6px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
		select { font-family: var(--vscode-font-family); color: var(--vscode-dropdown-foreground); background: var(--vscode-dropdown-background); border-color: var(--vscode-dropdown-border, var(--vscode-widget-border)); }
		select.overridden { color: var(--vscode-textLink-foreground); }
		input { flex: 1; min-width: 0; }
		input:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); }
		button.action { font: inherit; padding: 3px 12px; border: none; border-radius: 2px; cursor: pointer; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
		button.action:hover { background: var(--vscode-button-secondaryHoverBackground); }
		button.action.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.action.primary:hover { background: var(--vscode-button-hoverBackground); }
		.error { color: var(--vscode-errorForeground); margin-top: 4px; }
		[hidden] { display: none !important; }
		th.tier { width: 24%; } th.status { width: 22%; }
		th.taskName { width: 30%; } th.menu { width: 22%; } th.runsOn { width: 18%; }
	</style>
</head>
<body>
<div class="container">
	<h1>${text.title}</h1>
	<p class="subtitle">${text.intro}</p>
	<p id="main"></p>
	<h2>${text.tiersTitle}</h2>
	<table>
		<thead><tr><th class="tier">${text.tier}</th><th>${text.command}</th><th class="status">${text.status}</th></tr></thead>
		<tbody id="tiers"></tbody>
	</table>
	<datalist id="suggestions">${SUGGESTIONS.map(line => `<option value="${line}"></option>`).join('')}</datalist>
	<h2>${text.tasksTitle}</h2>
	<p class="hint">${text.tasksIntro}</p>
	<table>
		<thead><tr><th class="taskName">${text.task}</th><th class="menu">${text.menu}</th><th class="runsOn">${text.runsOn}</th><th>${text.runs}</th></tr></thead>
		<tbody id="tasks"></tbody>
	</table>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const tiersBody = document.getElementById('tiers');
	const tasksBody = document.getElementById('tasks');
	/** The tiers' fields, kept across renders so typed text survives a refresh. */
	const fields = {};
	const saved = {};

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	function tierRow(tier) {
		const row = element('tr');
		const name = element('td');
		name.appendChild(element('div', 'name', tier.label));
		name.appendChild(element('div', 'small', tier.description));
		row.appendChild(name);
		const command = element('td');
		const line = element('div', 'row');
		const input = element('input');
		input.spellcheck = false;
		input.placeholder = TEXT.placeholder;
		input.setAttribute('list', 'suggestions');
		input.addEventListener('input', () => { input.dataset.edited = 'true'; });
		const save = element('button', 'action primary', TEXT.save);
		const cancel = element('button', 'action', TEXT.cancel);
		save.addEventListener('click', () => vscode.postMessage({ command: 'tier', tier: tier.id, line: input.value }));
		cancel.addEventListener('click', () => { input.value = saved[tier.id]; delete input.dataset.edited; });
		input.addEventListener('keydown', e => {
			if (e.key === 'Enter') { save.click(); }
			if (e.key === 'Escape') { cancel.click(); }
		});
		line.appendChild(input);
		line.appendChild(save);
		line.appendChild(cancel);
		command.appendChild(line);
		row.appendChild(command);
		const status = element('td');
		row.appendChild(status);
		fields[tier.id] = { row, input, status };
		tiersBody.appendChild(row);
	}

	function render(state) {
		const main = document.getElementById('main');
		main.textContent = TEXT.main + ' ';
		main.appendChild(state.main ? element('code', '', state.main) : element('span', 'warning', TEXT.noMain));
		const change = element('button', 'link', TEXT.change);
		change.addEventListener('click', () => vscode.postMessage({ command: 'chooseAgent' }));
		main.appendChild(change);

		const lines = {};
		for (const tier of state.tiers) {
			if (!fields[tier.id]) { tierRow(tier); }
			const { input, status } = fields[tier.id];
			saved[tier.id] = tier.line;
			lines[tier.id] = tier.installed && tier.line ? tier.line : state.main;
			if (document.activeElement !== input && !input.dataset.edited) {
				input.value = tier.line;
			}
			status.textContent = '';
			if (!tier.line) {
				status.appendChild(element('span', 'small', TEXT.usesMain));
			} else if (tier.installed) {
				status.appendChild(element('span', 'installed', TEXT.installed));
			} else {
				status.appendChild(element('span', 'warning', TEXT.notInstalled.replace('{0}', tier.program)));
			}
		}

		tasksBody.textContent = '';
		for (const task of state.tasks) {
			const row = element('tr');
			row.appendChild(element('td', 'name', task.label));
			row.appendChild(element('td', 'small', task.menu));
			const choice = element('td');
			const select = element('select', task.overridden ? 'overridden' : '');
			for (const tier of state.tiers) {
				const option = element('option', '', tier.id === task.tier ? TEXT.defaultTier.replace('{0}', tier.label) : tier.label);
				option.value = tier.id;
				select.appendChild(option);
			}
			const mainOption = element('option', '', TEXT.mainAgent);
			mainOption.value = 'main';
			select.appendChild(mainOption);
			select.value = task.current;
			select.addEventListener('change', () => vscode.postMessage({ command: 'task', task: task.id, tier: select.value }));
			choice.appendChild(select);
			row.appendChild(choice);
			const runs = element('td');
			const line = task.current === 'main' ? state.main : lines[task.current];
			runs.appendChild(line ? element('code', '', line) : element('span', 'warning', TEXT.noMain));
			row.appendChild(runs);
			tasksBody.appendChild(row);
		}
	}

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			render(message);
		} else if (message.command === 'formDone' && fields[message.form]) {
			const { input } = fields[message.form];
			delete input.dataset.edited;
			input.blur();
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
			id: MODEL_ROUTING_COMMAND_ID,
			title: localize2('modelRouting.action', "Model Routing"),
			category: localize2('modelRouting.category', "Compose"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openModelRoutingPage(accessor);
	}
});
