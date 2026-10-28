/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { basename } from '../../../../base/common/path.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { ITerminalInstanceService } from '../../terminal/browser/terminal.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { AGENT_TASK_TIERS_SETTING, AGENT_TASKS, AGENT_TIERS, agentTiers, cellAvailable, CLOUD_MODELS_SETTING, CLOUD_PREFIX, cloudModels, DEFAULT_TIER_CELLS, ITierCell, LOCAL_PREFIX, MODEL_ROUTING_COMMAND_ID, modelName, OLD_AGENT_COMMAND_SETTING, OLD_AGENT_TIER_MODELS_SETTING, OLD_AGENT_TIERS_SETTING, runsLocalModels, taskTier, TIER_CELLS_SETTING, tierCells, tierOfName, tierRun } from './modelRouting.js';
import { CHOOSE_AGENT_COMMAND_ID, codingAgents, commandWords, findProgram, ICodingAgent, OTHER_AGENTS_SETTING, otherAgentEntries, terminalEnvironment } from './pollisAgents.js';
import { IInstalledModel, MODELS_INSTALLED_COMMAND_ID } from './modelsInstalledPage.js';
import { REPORTS_AGENT_COMMAND_SETTING } from './reports.js';
import { voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';

// Compose > Orchestration > Model Tasks and Routing: a table whose columns are the coding agents, those Pollis
// knows and those of Compose > Coding Agents named by the user, and whose rows are the models: the cloud models
// of CLOUD_MODELS_SETTING and the chat models on this computer. A cell holds the name of
// a tier, Light, Standard, Strong or one the user types, such as Max, which makes a new tier; a tier is in one
// cell only, so typing it in another moves it there, and clearing a cell takes its tier out. A cell where the
// agent cannot run the model shows a dash. Below, a table of the agent tasks with the tier each runs on, its
// default or the user's choice, and the skills it runs. The choices are saved in the settings at once
// (modelRouting.ts); the page follows changes made in the settings while it is open. ModelRoutingMigration moves
// the tiers of before, each a command line and a local model, into the cells once.

type RoutingMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'place'; readonly agent: string; readonly model: string; readonly label: string }
	| { readonly command: 'task'; readonly task: string; readonly tier: string }
	| { readonly command: 'codingAgents' }
	| { readonly command: 'modelsInstalled' }
	| { readonly command: 'cloudModels' };

/** A row of the table: a model, as the cells store it, its name, what it is and the agents that can run it. */
interface IModelRow {
	readonly model: string;
	readonly name: string;
	readonly kind: 'cloud' | 'local';
	/** For a local model: it is not on this computer. */
	readonly note?: 'missing';
	/** For each agent, in the order of the columns, whether it can run the model. */
	readonly available: readonly boolean[];
}

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the Model Tasks and Routing page, or shows it again when it is open. */
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
	const title = localize('modelRouting.title', "Model Tasks and Routing");
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

	// The rows and the cells as last shown, so a name typed in a cell replaces the tier shown there
	let rows: readonly IModelRow[] = [];
	let cells: readonly { readonly tier: string; readonly agent: string; readonly model: string }[] = [];

	// Which agents are installed, and the models on this computer, are looked up each time the page loads, is
	// shown again or Pollis gets the focus back, after an install.
	const sendState = async () => {
		const environment = await terminalEnvironment(terminalInstanceService);
		const agents = codingAgents(configurationService);
		const clouds = cloudModels(configurationService);
		const installed = (await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels') ?? []).filter(model => model.kind !== 'embedding');
		const available = (model: string, tools = true) => agents.map(agent => tools && cellAvailable(agent, model, clouds));

		// A tier on a local model is in the row of its file, or of the model the Julia extension found it on
		// (an `hf:` file); one not on this computer gets a row of its own
		const missing: IModelRow[] = [];
		cells = Object.entries(tierCells(configurationService)).map(([tier, cell]) => {
			if (!cell.model.startsWith(LOCAL_PREFIX)) {
				return { tier, ...cell };
			}
			const value = cell.model.slice(LOCAL_PREFIX.length);
			const model = installed.find(candidate => candidate.file === value) ?? installed.find(candidate => candidate.tiers.includes(tier));
			if (!model && !missing.some(row => row.model === cell.model)) {
				missing.push({ model: cell.model, name: modelName(value), kind: 'local', note: 'missing', available: available(cell.model) });
			}
			return { tier, agent: cell.agent, model: model ? LOCAL_PREFIX + model.file : cell.model };
		});
		rows = [
			...clouds.map((cloud): IModelRow => ({ model: CLOUD_PREFIX + cloud.name, name: cloud.name, kind: 'cloud', available: available(CLOUD_PREFIX + cloud.name) })),
			...installed.map((model): IModelRow => ({ model: LOCAL_PREFIX + model.file, name: model.name, kind: 'local', available: available(LOCAL_PREFIX + model.file, model.tools !== false) })),
			...missing,
		];
		webviewInput.webview.postMessage({
			command: 'state',
			agents: await Promise.all(agents.map(async agent => ({ label: agent.label, installed: !!await findProgram(commandWords(agent.command)[0], environment, fileService) }))),
			rows,
			cells,
			tiers: agentTiers(configurationService).map(tier => ({ ...tier, placed: !!tierRun(configurationService, tier.id, agents) })),
			tasks: AGENT_TASKS.map(task => {
				const current = taskTier(configurationService, task.id);
				return { ...task, current, overridden: current !== task.tier };
			}),
		});
	};
	disposables.add(webviewInput.webview.onDidFocus(() => sendState()));
	disposables.add(hostService.onDidChangeFocus(focused => {
		if (focused) {
			sendState();
		}
	}));
	disposables.add(configurationService.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration(TIER_CELLS_SETTING) || e.affectsConfiguration(CLOUD_MODELS_SETTING) || e.affectsConfiguration(AGENT_TASK_TIERS_SETTING) || e.affectsConfiguration(OTHER_AGENTS_SETTING)) {
			sendState();
		}
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: RoutingMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			sendState();
		} else if (message.command === 'place') {
			const column = codingAgents(configurationService).findIndex(agent => agent.label === message.agent);
			if (column < 0 || !rows.find(row => row.model === message.model)?.available[column]) {
				return;
			}
			// The tier shown in the cell comes out of it; the name typed goes in, moved from its cell if it had one
			const updated: Record<string, ITierCell> = { ...tierCells(configurationService) };
			const shown = cells.find(cell => cell.agent === message.agent && cell.model === message.model);
			if (shown) {
				delete updated[shown.tier];
			}
			const label = message.label.trim();
			if (label) {
				const tier = tierOfName(configurationService, label);
				delete updated[tier];
				updated[tier] = { agent: message.agent, model: message.model };
			}
			await configurationService.updateValue(TIER_CELLS_SETTING, updated);
			// The tasks set to a tier of your own that is in no cell any more go back to their defaults
			const tiers = agentTiers(configurationService);
			const overrides = configurationService.getValue<Record<string, string>>(AGENT_TASK_TIERS_SETTING) ?? {};
			const kept = Object.fromEntries(Object.entries(overrides).filter(([, tier]) => tiers.some(info => info.id === tier)));
			if (Object.keys(kept).length !== Object.keys(overrides).length) {
				await configurationService.updateValue(AGENT_TASK_TIERS_SETTING, kept);
			}
		} else if (message.command === 'task' && AGENT_TASKS.some(task => task.id === message.task) && agentTiers(configurationService).some(tier => tier.id === message.tier)) {
			// The default tier is no override: the task follows its default if that ever changes
			const others = { ...configurationService.getValue<Record<string, string>>(AGENT_TASK_TIERS_SETTING) };
			delete others[message.task];
			const isDefault = AGENT_TASKS.find(task => task.id === message.task)!.tier === message.tier;
			await configurationService.updateValue(AGENT_TASK_TIERS_SETTING, isDefault ? others : { ...others, [message.task]: message.tier });
		} else if (message.command === 'codingAgents') {
			commandService.executeCommand(CHOOSE_AGENT_COMMAND_ID);
		} else if (message.command === 'modelsInstalled') {
			commandService.executeCommand(MODELS_INSTALLED_COMMAND_ID);
		} else if (message.command === 'cloudModels') {
			commandService.executeCommand('workbench.action.openSettings', CLOUD_MODELS_SETTING);
		}
	}));
}

/** The page: its texts come from here, the agents, models, tiers and tasks from the `state` message. */
function pageHtml(): string {
	const text = {
		title: localize('modelRouting.title', "Model Tasks and Routing"),
		intro: localize('modelRouting.intro', "Every agent task of the Compose menu runs on a tier: Light, Standard, Strong or one of your own. A tier is a cell of the table below: the agent of its column on the model of its row. Type a tier's name in a cell to put it there; a name that is no tier yet, such as Max, makes a new tier. A tier is in one cell only: typed in another cell, it moves there. Clear a cell to take its tier out. A dash marks a model the agent cannot run."),
		localIntro: localize('modelRouting.localIntro', "The local models run on this computer with the {0} that comes with Pollis: free, and nothing leaves the computer. Claude Code, OpenCode and Codex can run them; an agent needs a model that can call tools, about 4B parameters or more, and Pollis gives it a context of 32k tokens.", '<span class="yellow">llama.cpp</span>'),
		models: localize('modelRouting.models', "Models"),
		codeAgents: localize('modelRouting.codeAgents', "Code Agents"),
		cloudModels: localize('modelRouting.cloud', "Cloud"),
		localModels: localize('modelRouting.local', "Local"),
		missing: localize('modelRouting.missing', "Not on this computer"),
		noLocalModels: localize('modelRouting.noLocalModels', "No chat model on this computer yet"),
		installed: localize('modelRouting.installed', "Installed"),
		notInstalled: localize('modelRouting.notInstalled', "Not installed"),
		cellHint: localize('modelRouting.cellHint', "A tier's name, or empty"),
		agentsHint: localize('modelRouting.agentsHint', "Agents of your own are added in"),
		agentsLink: localize('modelRouting.agentsLink', "Compose > Coding Agents"),
		localHint: localize('modelRouting.localHint', "The local models are the chat models of"),
		localLink: localize('modelRouting.localLink', "Compose > Local Models > Models Installed"),
		cloudHint: localize('modelRouting.cloudHint', "The cloud models, and the arguments that choose each in each agent, are a setting:"),
		cloudLink: localize('modelRouting.cloudLink', "Edit Cloud Models"),
		tasksTitle: localize('modelRouting.tasksTitle', "Tasks"),
		tasksIntro: localize('modelRouting.tasksIntro', "The tier each task runs on. A tier you choose replaces the task's default; choosing the default again goes back to it. A skill started from Compose > Agent Skills runs on Standard."),
		task: localize('modelRouting.task', "Task"),
		menu: localize('modelRouting.menu', "Menu"),
		runsOn: localize('modelRouting.runsOn', "Runs On"),
		skills: localize('modelRouting.skills', "Skills"),
		defaultTier: localize('modelRouting.defaultTier', "{0} (Default)"),
		notPlaced: localize('modelRouting.notPlaced', "In no cell of the table: the task cannot run"),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		${voiceButtonsCss}
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 1100px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		h2 { font-size: 16px; font-weight: 600; margin: 28px 0 4px 0; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; line-height: 1.4; max-width: 900px; }
		.hint { color: var(--vscode-descriptionForeground); margin: 8px 0 0 0; line-height: 1.4; max-width: 900px; }
		code { font-family: var(--vscode-editor-font-family); font-size: 12px; background: var(--vscode-textPreformat-background); border-radius: 3px; padding: 0 3px; }
		/* The skills and llama.cpp, in the yellow of the menu paths */
		code, .yellow { color: #e8a33d; }
		body.vscode-light code, body.vscode-light .yellow { color: #a8650d; }
		table { width: 100%; border-collapse: collapse; }
		th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); vertical-align: bottom; }
		td { vertical-align: middle; padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); line-height: 1.4; }
		tr:hover td { background: var(--vscode-list-hoverBackground); }
		.name { font-size: 14px; font-weight: 600; }
		.small { font-size: 12px; color: var(--vscode-descriptionForeground); }
		th .small { text-transform: none; letter-spacing: 0; font-weight: 400; }
		.installed { color: var(--vscode-testing-iconPassed); }
		.warning { color: var(--vscode-editorWarning-foreground); }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.link:hover { text-decoration: underline; }
		/* A group of rows, cloud or local, under a heading of its own */
		#matrix tr.section td { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); padding-top: 16px; }
		#matrix tr.section:hover td { background: none; }
		/* The models' column as wide as its names, each agent's column as wide as its cells */
		#matrix { width: auto; }
		#matrix th.agentHead, #matrix td.cell { width: 170px; min-width: 170px; }
		#matrix th.agentHead { text-align: center; }
		/* Code Agents over the agents' columns, with a line under it from the first to the last */
		#matrix th.agentsGroup { text-align: center; padding-bottom: 4px; }
		#matrix th.groupBlank { border-bottom: none; }
		#matrix td.modelName { padding-left: 24px; padding-right: 40px; white-space: nowrap; }
		#matrix td.cell input { width: 100%; border-color: var(--vscode-focusBorder); text-align: center; }
		#matrix td.cell input.placed { font-weight: 600; }
		/* The suggestions of the tiers' names open as one types, with no arrow in the field */
		#matrix td.cell input::-webkit-calendar-picker-indicator { display: none !important; }
		td.dashCell { text-align: center; }
		.dash { color: var(--vscode-descriptionForeground); }
		input, select { font-family: var(--vscode-font-family); font-size: 12px; padding: 4px 6px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
		select { color: var(--vscode-dropdown-foreground); background: var(--vscode-dropdown-background); border-color: var(--vscode-dropdown-border, var(--vscode-widget-border)); }
		select.overridden { color: var(--vscode-textLink-foreground); }
		/* The tiers of the tasks, all as wide as the cells of the table above, whatever their names */
		#tasks select { width: 170px; }
		input:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); }
		th.taskName { width: 30%; } th.menu { width: 22%; } th.runsOn { width: 24%; }
	</style>
</head>
<body>
<div class="container">
	<div class="title-row">
		<h1>${text.title}</h1>
		${voiceButtonsHtml}
	</div>
	<p class="subtitle">${text.intro}</p>
	<p class="subtitle">${text.localIntro}</p>
	<table id="matrix">
		<thead id="matrixHead"></thead>
		<tbody id="matrixBody"></tbody>
	</table>
	<datalist id="tierNames"></datalist>
	<p class="hint">${text.agentsHint} <button class="link" id="codingAgents">${text.agentsLink}</button>.
		${text.localHint} <button class="link" id="modelsInstalled">${text.localLink}</button>.
		${text.cloudHint} <button class="link" id="cloudModels">${text.cloudLink}</button>.</p>
	<h2>${text.tasksTitle}</h2>
	<p class="hint">${text.tasksIntro}</p>
	<table>
		<thead><tr><th class="taskName">${text.task}</th><th class="menu">${text.menu}</th><th class="runsOn">${text.runsOn}</th><th>${text.skills}</th></tr></thead>
		<tbody id="tasks"></tbody>
	</table>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	const TEXT = ${JSON.stringify(text)};
	const matrixHead = document.getElementById('matrixHead');
	const matrixBody = document.getElementById('matrixBody');
	const tasksBody = document.getElementById('tasks');
	const tierNames = document.getElementById('tierNames');

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	/** A cell where the agent can run the model: the name of the tier in it, which a change saves. */
	function cellInput(agent, row, tier) {
		const input = element('input', tier ? 'placed' : '');
		input.spellcheck = false;
		input.placeholder = TEXT.cellHint;
		input.setAttribute('list', 'tierNames');
		input.value = tier ? tier.label : '';
		input.addEventListener('change', () => vscode.postMessage({ command: 'place', agent, model: row.model, label: input.value }));
		input.addEventListener('keydown', e => {
			if (e.key === 'Enter') { input.blur(); }
			if (e.key === 'Escape') { input.value = tier ? tier.label : ''; input.blur(); }
		});
		return input;
	}

	function render(state) {
		tierNames.textContent = '';
		for (const tier of state.tiers) {
			const option = element('option');
			option.value = tier.label;
			tierNames.appendChild(option);
		}

		// The table, unless a cell is being typed in
		if (!matrixBody.contains(document.activeElement)) {
			matrixHead.textContent = '';
			const group = element('tr');
			group.appendChild(element('th', 'groupBlank'));
			const agentsGroup = element('th', 'agentsGroup', TEXT.codeAgents);
			agentsGroup.colSpan = state.agents.length;
			group.appendChild(agentsGroup);
			matrixHead.appendChild(group);
			const head = element('tr');
			head.appendChild(element('th', '', TEXT.models));
			for (const agent of state.agents) {
				const th = element('th', 'agentHead');
				th.appendChild(element('div', '', agent.label));
				th.appendChild(element('div', 'small ' + (agent.installed ? 'installed' : 'warning'), agent.installed ? TEXT.installed : TEXT.notInstalled));
				head.appendChild(th);
			}
			matrixHead.appendChild(head);

			matrixBody.textContent = '';
			const section = label => {
				const tr = element('tr', 'section');
				const td = element('td', '', label);
				td.colSpan = state.agents.length + 1;
				tr.appendChild(td);
				matrixBody.appendChild(tr);
			};
			let kind = '';
			for (const row of state.rows) {
				if (row.kind !== kind) {
					section(row.kind === 'cloud' ? TEXT.cloudModels : TEXT.localModels);
					kind = row.kind;
				}
				const tr = element('tr');
				const name = element('td', 'modelName');
				name.appendChild(element('div', 'name', row.name));
				if (row.note === 'missing') { name.appendChild(element('div', 'small warning', TEXT.missing)); }
				tr.appendChild(name);
				state.agents.forEach((agent, column) => {
					const td = element('td', row.available[column] ? 'cell' : 'cell dashCell');
					if (row.available[column]) {
						const cell = state.cells.find(cell => cell.agent === agent.label && cell.model === row.model);
						td.appendChild(cellInput(agent.label, row, cell && state.tiers.find(tier => tier.id === cell.tier)));
					} else {
						td.appendChild(element('span', 'dash', '—'));
					}
					tr.appendChild(td);
				});
				matrixBody.appendChild(tr);
			}
			// The local models' heading comes even with none, to say there are none
			if (kind !== 'local') {
				section(TEXT.localModels);
				const tr = element('tr');
				const td = element('td', 'small', TEXT.noLocalModels);
				td.colSpan = state.agents.length + 1;
				tr.appendChild(td);
				matrixBody.appendChild(tr);
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
			select.value = task.current;
			select.addEventListener('change', () => vscode.postMessage({ command: 'task', task: task.id, tier: select.value }));
			choice.appendChild(select);
			if (!state.tiers.find(tier => tier.id === task.current)?.placed) {
				choice.appendChild(element('div', 'small warning', TEXT.notPlaced));
			}
			row.appendChild(choice);
			const skills = element('td', task.skills.length ? 'skills' : 'dashCell');
			for (const skill of task.skills) {
				skills.appendChild(element('div', '', '')).appendChild(element('code', '', skill));
			}
			if (!task.skills.length) {
				skills.appendChild(element('span', 'small', '—'));
			}
			row.appendChild(skills);
			tasksBody.appendChild(row);
		}
	}

	for (const id of ['codingAgents', 'modelsInstalled', 'cloudModels']) {
		document.getElementById(id).addEventListener('click', () => vscode.postMessage({ command: id }));
	}
	window.addEventListener('message', event => {
		if (event.data.command === 'state') {
			render(event.data);
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
			title: localize2('modelRouting.action', "Model Tasks and Routing"),
			category: localize2('modelRouting.category', "Compose"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openModelRoutingPage(accessor);
	}
});

/**
 * Moves the tiers of before into the cells of the table, once: each tier that had a command line or a local model
 * goes to the cell of its agent, an agent Pollis knows, one of Claude Code's models when its command line named
 * one, or else an agent of your own named after its program, on its local model if it had one. The main agent ran
 * the tiers with no command line, and Polish with Agent had a setting of its own, which goes to Light. The tiers
 * that had nothing, or whose cell is taken, keep their default cells when those are free. Then the old settings
 * are cleared, and the tasks set to the main agent go back to their defaults.
 */
class ModelRoutingMigration implements IWorkbenchContribution {
	static readonly ID = 'workbench.contrib.pollisModelRoutingMigration';

	constructor(@IConfigurationService configurationService: IConfigurationService) {
		const oldSettings = [OLD_AGENT_COMMAND_SETTING, OLD_AGENT_TIERS_SETTING, OLD_AGENT_TIER_MODELS_SETTING, REPORTS_AGENT_COMMAND_SETTING];
		const overrides = configurationService.getValue<Record<string, string>>(AGENT_TASK_TIERS_SETTING) ?? {};
		const hasMain = Object.values(overrides).includes('main');
		if (!hasMain && oldSettings.every(setting => configurationService.inspect(setting).userValue === undefined)) {
			return;
		}
		(async () => {
			if (configurationService.inspect(TIER_CELLS_SETTING).userValue === undefined) {
				const main = configurationService.inspect<string>(OLD_AGENT_COMMAND_SETTING).userValue?.trim() ?? '';
				const lines: Record<string, string> = { ...configurationService.inspect<Record<string, string>>(OLD_AGENT_TIERS_SETTING).userValue };
				const models: Record<string, string> = { ...configurationService.inspect<Record<string, string>>(OLD_AGENT_TIER_MODELS_SETTING).userValue };
				const reports = configurationService.inspect<string>(REPORTS_AGENT_COMMAND_SETTING).userValue?.trim();
				if (reports && !lines.light?.trim()) {
					lines.light = reports;
				}
				const agents: ICodingAgent[] = [...codingAgents(configurationService)];
				const others = otherAgentEntries(configurationService);
				const clouds = cloudModels(configurationService);
				const cells: Record<string, ITierCell> = {};
				const taken = (cell: ITierCell) => Object.values(cells).some(other => other.agent === cell.agent && other.model === cell.model);
				for (const { id } of AGENT_TIERS) {
					const line = lines[id]?.trim() || (models[id]?.trim() ? main : '');
					if (!line) {
						continue;
					}
					let agent = agents.find(candidate => candidate.command === line);
					let model = '';
					for (const candidate of agent ? [] : agents) {
						const cloud = clouds.find(cloud => cloud.agents[candidate.label] && candidate.command.replace(/^\s*("[^"]*"|\S+)/, `$1 ${cloud.agents[candidate.label].trim()}`) === line);
						if (cloud) {
							agent = candidate;
							model = CLOUD_PREFIX + cloud.name;
							break;
						}
					}
					if (!agent) {
						const program = basename(commandWords(line)[0] ?? '').replace(/\.(exe|cmd|bat)$/i, '') || 'agent';
						let name = program;
						for (let number = 2; agents.some(candidate => candidate.label.toLowerCase() === name.toLowerCase()); number++) {
							name = `${program} ${number}`;
						}
						agent = { label: name, command: line, url: '' };
						agents.push(agent);
						others.push({ name, command: line });
					}
					const local = models[id]?.trim();
					if (local && runsLocalModels(agent.command)) {
						model = LOCAL_PREFIX + local;
					}
					// A tier on the agent's own default model has no row, and keeps its default cell
					if (model && !taken({ agent: agent.label, model })) {
						cells[id] = { agent: agent.label, model };
					}
				}
				for (const { id } of AGENT_TIERS) {
					const cell = DEFAULT_TIER_CELLS[id as keyof typeof DEFAULT_TIER_CELLS];
					if (!cells[id] && !taken(cell)) {
						cells[id] = cell;
					}
				}
				if (others.length !== otherAgentEntries(configurationService).length) {
					await configurationService.updateValue(OTHER_AGENTS_SETTING, others);
				}
				await configurationService.updateValue(TIER_CELLS_SETTING, cells);
			}
			for (const setting of oldSettings) {
				if (configurationService.inspect(setting).userValue !== undefined) {
					await configurationService.updateValue(setting, undefined);
				}
			}
			if (hasMain) {
				await configurationService.updateValue(AGENT_TASK_TIERS_SETTING, Object.fromEntries(Object.entries(overrides).filter(([, tier]) => tier !== 'main')));
			}
		})();
	}
}

registerWorkbenchContribution2(ModelRoutingMigration.ID, ModelRoutingMigration, WorkbenchPhase.Eventually);
