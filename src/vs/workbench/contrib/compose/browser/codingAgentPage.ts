/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { ITerminalInstanceService } from '../../terminal/browser/terminal.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { AGENT_COMMAND_SETTING, CHOOSE_AGENT_COMMAND_ID, CODING_AGENTS, commandWords, findProgram, installSkills, PROMPT_PLACEHOLDER, skillsInstalled, terminalEnvironment } from './pollisAgents.js';
import { MODEL_ROUTING_COMMAND_ID } from './modelRouting.js';
import { LOCAL_MODEL_RUNNERS_COMMAND_ID } from './localModelRunnersPage.js';
import { OPEN_LINK_COMMAND_ID } from '../../monitor/browser/openLink.js';

// Compose > Coding Agents: a page of the coding agents Pollis knows, all of which run on local and
// cloud models, in alphabetical order, each marked installed on this computer or with a link to its
// install page, whether it has the Pollis skills, with a link to install them, and a button to use it; a field for any other agent's command; a link to Model Routing,
// which sends some tasks to other models; and a link to Local Model Runners, the programs that serve the
// local models. The choice is saved in the settings at once; the page follows changes made in the settings
// while it is open.

type AgentMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'use'; readonly line: string }
	| { readonly command: 'routing' }
	| { readonly command: 'runners' }
	| { readonly command: 'installSkills'; readonly agent: string }
	| { readonly command: 'link'; readonly url: string };

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the Coding Agents page, or shows it again when it is open. */
async function openCodingAgentPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const configurationService = accessor.get(IConfigurationService);
	const fileService = accessor.get(IFileService);
	const terminalInstanceService = accessor.get(ITerminalInstanceService);
	const hostService = accessor.get(IHostService);
	const commandService = accessor.get(ICommandService);
	const pathService = accessor.get(IPathService);
	const instantiationService = accessor.get(IInstantiationService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('codingAgent.title', "Coding Agents");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.codingAgent',
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

	// Which agents are installed is looked up each time the page loads, is shown again or Pollis gets the
	// focus back, after an install, and so are the skills of the installed ones. A local command can be used when
	// its own program is there too (Ollama).
	const sendState = async () => {
		const environment = await terminalEnvironment(terminalInstanceService);
		const found = (command: string) => findProgram(commandWords(command)[0], environment, fileService);
		const agents = await Promise.all(CODING_AGENTS.map(async agent => {
			const installed = !!await found(agent.command);
			const localProgram = agent.localCommand ? commandWords(agent.localCommand)[0] : undefined;
			const localMissing = localProgram && localProgram !== commandWords(agent.command)[0] && !await found(agent.localCommand!) ? localProgram : undefined;
			const skills = installed && await skillsInstalled(agent, fileService, pathService);
			return { ...agent, installed, localMissing, skills };
		}));
		webviewInput.webview.postMessage({
			command: 'state',
			agents,
			current: configurationService.getValue<string>(AGENT_COMMAND_SETTING)?.trim() ?? '',
		});
	};
	disposables.add(webviewInput.webview.onDidFocus(() => sendState()));
	disposables.add(hostService.onDidChangeFocus(focused => {
		if (focused) {
			sendState();
		}
	}));
	disposables.add(configurationService.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration(AGENT_COMMAND_SETTING)) {
			sendState();
		}
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: AgentMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			sendState();
		} else if (message.command === 'use' && message.line.trim()) {
			configurationService.updateValue(AGENT_COMMAND_SETTING, message.line.trim());
		} else if (message.command === 'routing') {
			commandService.executeCommand(MODEL_ROUTING_COMMAND_ID);
		} else if (message.command === 'installSkills') {
			// Claude Code installs its plugin in a terminal: the page shows it when it gets the focus back
			const agent = CODING_AGENTS.find(agent => agent.label === message.agent);
			if (agent) {
				await instantiationService.invokeFunction(installSkills, agent);
				sendState();
			}
		} else if (message.command === 'runners') {
			commandService.executeCommand(LOCAL_MODEL_RUNNERS_COMMAND_ID);
		} else if (message.command === 'link' && CODING_AGENTS.some(item => item.url === message.url)) {
			commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
		}
	}));
}

/** The page: its texts come from here, the agents and the settings from the `state` message. */
function pageHtml(): string {
	const text = {
		title: localize('codingAgent.title', "Coding Agents"),
		intro: localize('codingAgent.intro', "The coding agent Pollis starts in a terminal for every agent task of the Compose menu: New Panels and Toolboxes, Methods, Orchestration and Reports. Pollis gives it a first message that points it at the task's instructions, so any agent that reads files and runs commands will do, on a cloud model or on a local one."),
		agent: localize('codingAgent.agent', "Agent"),
		command: localize('codingAgent.command', "Command"),
		status: localize('codingAgent.status', "On This Computer"),
		installed: localize('codingAgent.installed', "Agent Installed"),
		installAgent: localize('codingAgent.installAgent', "Install Agent"),
		localSection: localize('codingAgent.localSection', "Local and Cloud Models"),
		localSectionNote: localize('codingAgent.localSectionNote', "Ollama, LM Studio: free, private, on this computer"),
		local: localize('codingAgent.local', "Local:"),
		use: localize('codingAgent.use', "Use"),
		inUse: localize('codingAgent.inUse', "In Use"),
		skillsInstalled: localize('codingAgent.skillsInstalled', "Skills Installed"),
		installSkills: localize('codingAgent.installSkills', "Install Skills"),
		updateSkills: localize('codingAgent.updateSkills', "Update"),
		skillsHint: localize('codingAgent.skillsHint', "The Pollis skills, so that the agent uses them in any folder, even outside Pollis"),
		installFirst: localize('codingAgent.installFirst', "Install the agent first"),
		installProgramFirst: localize('codingAgent.installProgramFirst', "Install {0} first"),
		notInstalled: localize('codingAgent.notInstalled', "{0} isn't installed on this computer"),
		none: localize('codingAgent.none', "No coding agent is chosen yet: pick one below."),
		currentIs: localize('codingAgent.currentIs', "In use:"),
		otherTitle: localize('codingAgent.otherTitle', "Other Agent"),
		otherIntro: localize('codingAgent.otherIntro', "Any other agent's command line, with {0} where the first message goes, for example: aider --message {0}. Without {0}, the message is copied to the clipboard to paste into the agent.", PROMPT_PLACEHOLDER),
		routingTitle: localize('codingAgent.routingTitle', "Other Models for Some Tasks"),
		routingIntro: localize('codingAgent.routingIntro', "Small tasks, like Polish with Agent, can run on a cheaper, faster or local model, and hard ones on a stronger one:"),
		routingLink: localize('codingAgent.routingLink', "Compose > Orchestration > Model Routing"),
		runnersTitle: localize('codingAgent.runnersTitle', "Local Model Runners"),
		runnersIntro: localize('codingAgent.runnersIntro', "A local command needs a runner, such as Ollama or LM Studio, which serves the local models. Which runners are installed, and how each agent reaches each one:"),
		runnersLink: localize('codingAgent.runnersLink', "Compose > Local Models > Local Model Runners"),
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
		.current { margin: 0 0 16px 0; }
		table { width: 100%; border-collapse: collapse; }
		th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); }
		td { vertical-align: top; padding: 10px 8px; border-bottom: 1px solid var(--vscode-widget-border); line-height: 1.4; }
		tr:hover td { background: var(--vscode-list-hoverBackground); }
		tr.chosen td { background: var(--vscode-list-inactiveSelectionBackground); }
		.name { font-size: 14px; font-weight: 600; }
		.small { font-size: 12px; color: var(--vscode-descriptionForeground); }
		code, input { font-family: var(--vscode-editor-font-family); font-size: 12px; }
		.installed { color: var(--vscode-testing-iconPassed); }
		.warning { color: var(--vscode-editorWarning-foreground); margin-left: 10px; }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.link:hover { text-decoration: underline; }
		button.action { font: inherit; padding: 3px 12px; border: none; border-radius: 2px; cursor: pointer; color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.action:hover { background: var(--vscode-button-hoverBackground); }
		button.action:disabled { cursor: default; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
		.row { display: flex; gap: 8px; max-width: 700px; }
		input { flex: 1; padding: 4px 6px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
		input:focus { outline: 1px solid var(--vscode-focusBorder); }
		.right { text-align: right; white-space: nowrap; }
		.uses { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
		th.agent { width: 30%; } th.command { width: 34%; } th.status { width: 20%; }
		.section { display: flex; align-items: center; gap: 8px; margin: 24px 0 4px 0; }
		.section-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
		.section.local { color: var(--vscode-textLink-foreground); }
		.section-note { font-size: 12px; color: var(--vscode-descriptionForeground); }
		.section svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; }
		.rule { flex: 1; height: 1px; background: linear-gradient(to right, var(--vscode-textLink-foreground), transparent); }
		table.local td:first-child { box-shadow: inset 3px 0 0 var(--vscode-textLink-foreground); padding-left: 12px; }
		table.local tr:not(:hover):not(.chosen) td { background: color-mix(in srgb, var(--vscode-textLink-foreground) 5%, transparent); }
		.skills { margin-top: 6px; }
		.variant { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
	</style>
</head>
<body>
<div class="container">
	<h1>${text.title}</h1>
	<p class="subtitle">${text.intro}</p>
	<p class="current" id="current"></p>
	<div class="section local">
		<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="4" width="8" height="8" rx="1"/><path d="M6 1v3M10 1v3M6 12v3M10 12v3M1 6h3M1 10h3M12 6h3M12 10h3"/></svg>
		<span class="section-title">${text.localSection}</span><span class="section-note">${text.localSectionNote}</span><span class="rule"></span>
	</div>
	<table class="local">
		<thead><tr><th class="agent">${text.agent}</th><th class="command">${text.command}</th><th class="status">${text.status}</th><th></th></tr></thead>
		<tbody id="local"></tbody>
	</table>
	<h2>${text.otherTitle}</h2>
	<p class="hint">${text.otherIntro}</p>
	<div class="row"><input id="other" spellcheck="false"><button class="action" id="useOther">${text.use}</button></div>
	<h2>${text.routingTitle}</h2>
	<p class="hint">${text.routingIntro} <button class="link" id="routing">${text.routingLink}</button></p>
	<h2>${text.runnersTitle}</h2>
	<p class="hint">${text.runnersIntro} <button class="link" id="runners">${text.runnersLink}</button></p>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const local = document.getElementById('local');
	const other = document.getElementById('other');

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	function render(state) {
		const current = document.getElementById('current');
		current.textContent = '';
		if (state.current) {
			current.appendChild(document.createTextNode(TEXT.currentIs + ' '));
			current.appendChild(element('code', '', state.current));
			// The agent in use, when it is one of these, may not be on this computer (yet)
			for (const agent of state.agents) {
				const missing = !agent.installed ? agent.label : agent.localCommand === state.current ? agent.localMissing : undefined;
				if ((agent.command === state.current || agent.localCommand === state.current) && missing) {
					current.appendChild(element('span', 'warning', TEXT.notInstalled.replace('{0}', missing)));
				}
			}
		} else {
			current.textContent = TEXT.none;
		}
		local.textContent = '';
		const agents = state.agents.slice().sort((a, b) => a.label.localeCompare(b.label));
		for (const agent of agents) {
			const chosen = agent.command === state.current || agent.localCommand === state.current;
			const row = element('tr', chosen ? 'chosen' : '');
			const name = element('td');
			name.appendChild(element('div', 'name', agent.label));
			row.appendChild(name);
			const command = element('td');
			command.appendChild(element('code', '', agent.command));
			if (agent.localCommand) {
				// The local variant: its own command, chosen with its own Use button below the other
				const variant = element('div', 'variant small');
				variant.appendChild(document.createTextNode(TEXT.local + ' '));
				variant.appendChild(element('code', '', agent.localCommand));
				command.appendChild(variant);
			}
			row.appendChild(command);
			const status = element('td');
			// Installed, or a link to install it
			if (!agent.installed) {
				const install = element('button', 'link', TEXT.installAgent);
				install.addEventListener('click', () => vscode.postMessage({ command: 'link', url: agent.url }));
				status.appendChild(install);
			} else {
				status.appendChild(element('div', 'installed', TEXT.installed));
				// The Pollis skills: installed, with a link to update them, or a link to install them
				const skills = element('div', 'skills');
				skills.title = TEXT.skillsHint;
				const installSkills = () => vscode.postMessage({ command: 'installSkills', agent: agent.label });
				if (agent.skills) {
					skills.appendChild(element('span', 'installed', TEXT.skillsInstalled));
					skills.appendChild(document.createTextNode(' \u00B7 '));
					const update = element('button', 'link small', TEXT.updateSkills);
					update.addEventListener('click', installSkills);
					skills.appendChild(update);
				} else {
					const install = element('button', 'link', TEXT.installSkills);
					install.addEventListener('click', installSkills);
					skills.appendChild(install);
				}
				status.appendChild(skills);
			}
			row.appendChild(status);
			const action = element('td', 'right');
			const uses = element('div', 'uses');
			for (const line of agent.localCommand ? [agent.command, agent.localCommand] : [agent.command]) {
				// An agent, or a local program, not on this computer cannot be chosen
				const unavailable = !agent.installed ? TEXT.installFirst : line === agent.localCommand && agent.localMissing ? TEXT.installProgramFirst.replace('{0}', agent.localMissing) : '';
				const use = element('button', 'action', line === state.current ? TEXT.inUse : TEXT.use);
				use.disabled = line === state.current || !!unavailable;
				if (unavailable && line !== state.current) {
					use.title = unavailable;
				}
				use.addEventListener('click', () => vscode.postMessage({ command: 'use', line }));
				uses.appendChild(use);
			}
			action.appendChild(uses);
			row.appendChild(action);
			local.appendChild(row);
		}
		// The field shows the command in use when it is none of the listed agents
		if (document.activeElement !== other) {
			other.value = state.agents.some(agent => agent.command === state.current || agent.localCommand === state.current) ? '' : state.current;
		}
	}

	document.getElementById('useOther').addEventListener('click', () => {
		if (other.value.trim()) {
			vscode.postMessage({ command: 'use', line: other.value });
		}
	});
	other.addEventListener('keydown', e => { if (e.key === 'Enter') { document.getElementById('useOther').click(); } });
	document.getElementById('routing').addEventListener('click', () => vscode.postMessage({ command: 'routing' }));
	document.getElementById('runners').addEventListener('click', () => vscode.postMessage({ command: 'runners' }));

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
			id: CHOOSE_AGENT_COMMAND_ID,
			title: localize2('pollisAgents.chooseAgent', "Coding Agents"),
			category: localize2('pollisAgents.category', "Compose"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openCodingAgentPage(accessor);
	}
});
