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
import { CHOOSE_AGENT_COMMAND_ID, CODING_AGENTS, commandWords, findProgram, installSkills, OTHER_AGENTS_SETTING, otherAgentEntries, PROMPT_PLACEHOLDER, skillsInstalled, terminalEnvironment } from './pollisAgents.js';
import { OPEN_LINK_COMMAND_ID } from '../../monitor/browser/openLink.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../../workbench/services/editor/common/editorService.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { CODINGAGENT_METADATA } from '../../model/browser/webviews/codingAgent.data.js';
import { buildWebviewHtml } from '../../model/browser/webviews/webviewScaffold.js';

// Compose > Coding Agents, in the Minimal style of the scaffold: a page of the coding agents Pollis knows, all of which run on local and
// cloud models, in alphabetical order, each marked installed on this computer or with a link to its
// install page, and whether it has the Pollis skills, with a link to install them; and agents of your own,
// each a name and a command line, saved once both are filled, which Model Tasks and Routing then offers by
// name; + adds one. Which agent and model a task runs on is chosen in Model Tasks and Routing. The agents of
// your own are saved in the settings at once; the page follows changes made in the settings while it is open.

type AgentMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'saveOther'; readonly index: number; readonly name: string; readonly line: string }
	| { readonly command: 'removeOther'; readonly index: number }
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
	const openerService = accessor.get(IOpenerService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const storageService = accessor.get(IStorageService);

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
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'codingAgent', title, CODINGAGENT_METADATA.codingAgent, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));

	// Which agents are installed is looked up each time the page loads, is shown again or Pollis gets the
	// focus back, after an install, and so are the skills of the installed ones.
	const sendState = async () => {
		const environment = await terminalEnvironment(terminalInstanceService);
		const found = (command: string) => findProgram(commandWords(command)[0], environment, fileService);
		const agents = await Promise.all(CODING_AGENTS.map(async agent => {
			const installed = !!await found(agent.command);
			const skills = installed && await skillsInstalled(agent, fileService, pathService);
			return { ...agent, installed, skills };
		}));
		webviewInput.webview.postMessage({
			command: 'state',
			agents,
			others: otherAgentEntries(configurationService),
		});
	};
	disposables.add(webviewInput.webview.onDidFocus(() => sendState()));
	disposables.add(hostService.onDidChangeFocus(focused => {
		if (focused) {
			sendState();
		}
	}));
	disposables.add(configurationService.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration(OTHER_AGENTS_SETTING)) {
			sendState();
		}
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: AgentMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			sendState();
		} else if (message.command === 'saveOther' && message.name.trim() && message.line.trim()) {
			// The row at that index replaced, or a new one added at the end
			const others = otherAgentEntries(configurationService);
			others.splice(Math.min(Math.max(message.index, 0), others.length), 1, { name: message.name.trim(), command: message.line.trim() });
			await configurationService.updateValue(OTHER_AGENTS_SETTING, others);
		} else if (message.command === 'removeOther') {
			const others = otherAgentEntries(configurationService);
			if (message.index >= 0 && message.index < others.length) {
				others.splice(message.index, 1);
				await configurationService.updateValue(OTHER_AGENTS_SETTING, others);
			}
		} else if (message.command === 'installSkills') {
			// Claude Code installs its plugin in a terminal: the page shows it when it gets the focus back
			const agent = CODING_AGENTS.find(agent => agent.label === message.agent);
			if (agent) {
				await instantiationService.invokeFunction(installSkills, agent);
				sendState();
			}
		} else if (message.command === 'link' && CODING_AGENTS.some(item => item.url === message.url)) {
			commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
		}
	}));
}

/** The page: its texts come from here, the agents and the settings from the `state` message. */
function pageHtml(): string {
	const text = {
		title: localize('codingAgent.title', "Coding Agents"),
		intro: localize('codingAgent.intro', "The agent tasks of the Compose menu, such as Create a Panel or Write a Method, run in a coding agent: Pollis opens a terminal, starts the agent and gives it the task."),
		agent: localize('codingAgent.agent', "Agent"),
		command: localize('codingAgent.command', "Command"),
		status: localize('codingAgent.status', "On This Computer"),
		installed: localize('codingAgent.installed', "Agent Installed"),
		installAgent: localize('codingAgent.installAgent', "Install Agent"),
		skillsInstalled: localize('codingAgent.skillsInstalled', "Skills Installed"),
		installSkills: localize('codingAgent.installSkills', "Install Skills"),
		updateSkills: localize('codingAgent.updateSkills', "Update"),
		skillsHint: localize('codingAgent.skillsHint', "The Pollis skills, so that the agent uses them in any folder, even outside Pollis"),
		otherTitle: localize('codingAgent.otherTitle', "Other Agents"),
		otherIntro: localize('codingAgent.otherIntro', "Agents of your own: each a name, which Model Tasks and Routing shows, and a command line, with {0} where the first message goes, for example {1}. Without {0}, the message is copied to the clipboard to paste into the agent. The + button adds another.", `<code>${PROMPT_PLACEHOLDER}</code>`, `<code>aider --message ${PROMPT_PLACEHOLDER}</code>`),
		otherName: localize('codingAgent.otherName', "Name, for example MyAgent"),
		otherCommand: localize('codingAgent.otherCommand', "Command line"),
		addOther: localize('codingAgent.addOther', "Add an Agent"),
		removeOther: localize('codingAgent.removeOther', "Remove"),
		nameTaken: localize('codingAgent.nameTaken', "There is an agent of that name already"),
	};
	return buildWebviewHtml({
		title: text.title,
		omitPoweredBy: !CODINGAGENT_METADATA.codingAgent.packages.length,
		introHtml: text.intro,
		extraCss: `
		.container { max-width: 1100px; }
		.codingAgentPage h2 { font-size: 16px; font-weight: 600; margin: 28px 0 4px 0; }
		.codingAgentPage .hint { color: var(--vscode-descriptionForeground); margin: 0 0 8px 0; line-height: 1.4; max-width: 900px; }
		.codingAgentPage table { width: 100%; border-collapse: collapse; }
		.codingAgentPage th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); }
		.codingAgentPage td { vertical-align: top; padding: 10px 8px; border-bottom: 1px solid var(--vscode-widget-border); line-height: 1.4; }
		.codingAgentPage tr:hover td { background: var(--vscode-list-hoverBackground); }
		.codingAgentPage .name { font-size: 14px; font-weight: 600; }
		.codingAgentPage .small { font-size: 12px; color: var(--vscode-descriptionForeground); }
		.codingAgentPage code, .codingAgentPage input { font-family: var(--vscode-editor-font-family); font-size: 12px; }
		/* The commands, in the yellow of the menu paths */
		.codingAgentPage code { color: #e8a33d; }
		body.vscode-light .codingAgentPage code { color: #a8650d; }
		.codingAgentPage .installed { color: var(--vscode-testing-iconPassed); }
		.codingAgentPage .warning { color: var(--vscode-editorWarning-foreground); margin-left: 10px; }
		.codingAgentPage .link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.codingAgentPage .link:hover { text-decoration: underline; }
		.codingAgentPage button.action { font: inherit; padding: 3px 12px; border: none; box-shadow: inset 0 0 0 1px var(--vscode-button-background); border-radius: 2px; cursor: pointer; color: var(--vscode-button-foreground); background: var(--vscode-button-background); font-size: 11px; }
		.codingAgentPage button.action:hover { background: var(--vscode-button-hoverBackground); }
		.codingAgentPage button.action:disabled { cursor: default; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
		.codingAgentPage .row { display: flex; gap: 8px; max-width: 700px; }
		.codingAgentPage input { flex: 1; padding: 4px 6px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
		.codingAgentPage input:focus { outline: 1px solid var(--vscode-focusBorder); }
		.codingAgentPage th.agent { width: 30%; } .codingAgentPage th.command { width: 40%; }
		.codingAgentPage input.otherName { flex: 0 0 200px; }
		.codingAgentPage .others { display: flex; flex-direction: column; gap: 8px; }
		.codingAgentPage .others .row { align-items: center; }
		.codingAgentPage .others .warning { margin-left: 0; font-size: 12px; }
		.codingAgentPage button.action.add { font-size: 14px; line-height: 16px; padding: 2px 10px; margin-top: 8px; }
		.codingAgentPage table.local td:first-child { box-shadow: inset 3px 0 0 var(--vscode-textLink-foreground); padding-left: 12px; }
		.codingAgentPage table.local tr:not(:hover) td { background: color-mix(in srgb, var(--vscode-textLink-foreground) 5%, transparent); }
		.codingAgentPage .skills { margin-top: 6px; }
`,
		bodyHtml: `
		<div class="codingAgentPage">
	<table class="local">
		<thead><tr><th class="agent">${text.agent}</th><th class="command">${text.command}</th><th>${text.status}</th></tr></thead>
		<tbody id="local"></tbody>
	</table>
	<h2>${text.otherTitle}</h2>
	<p class="hint">${text.otherIntro}</p>
	<div class="others" id="others"></div>
	<button class="action add" id="addOther" title="${text.addOther}" aria-label="${text.addOther}">+</button>
		</div>
`,
		pageScriptJs: `
	const TEXT = ${JSON.stringify(text)};
	const local = document.getElementById('local');
	const others = document.getElementById('others');
	let STATE;

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	function render(state) {
		STATE = state;
		local.textContent = '';
		const agents = state.agents.slice().sort((a, b) => a.label.localeCompare(b.label));
		for (const agent of agents) {
			const row = element('tr');
			const name = element('td');
			name.appendChild(element('div', 'name', agent.label));
			row.appendChild(name);
			const command = element('td');
			command.appendChild(element('code', '', agent.command));
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
			local.appendChild(row);
		}
		// The agents of your own; rows being edited, or added and not saved yet, are kept as they are
		if (!others.querySelector('[data-edited]') && !others.contains(document.activeElement)) {
			others.textContent = '';
			state.others.forEach((other, index) => otherRow(index, other.name, other.command));
			// With none yet, an empty row to fill in
			if (!others.children.length) {
				otherRow(0, '', '');
			}
		}
	}

	/** A row of an agent of your own: its name, its command line and Remove. */
	function otherRow(index, nameValue, commandValue, added) {
		const block = element('div');
		const row = element('div', 'row');
		const name = element('input', 'otherName');
		name.spellcheck = false;
		name.placeholder = TEXT.otherName;
		name.value = nameValue;
		const command = element('input');
		command.spellcheck = false;
		command.placeholder = TEXT.otherCommand;
		command.value = commandValue;
		const remove = element('button', 'link small', TEXT.removeOther);
		const taken = element('div', 'warning', TEXT.nameTaken);
		taken.hidden = true;
		if (added) { block.dataset.edited = 'true'; }
		row.appendChild(name);
		row.appendChild(command);
		row.appendChild(remove);
		block.appendChild(row);
		block.appendChild(taken);
		others.appendChild(block);

		// A name is needed, and one no other agent has
		const nameTaken = () => {
			const label = name.value.trim().toLowerCase();
			return STATE.agents.some(agent => agent.label.toLowerCase() === label)
				|| STATE.others.some((other, otherIndex) => otherIndex !== index && other.name.toLowerCase() === label);
		};
		const update = () => {
			const ready = !!name.value.trim() && !!command.value.trim() && !nameTaken();
			taken.hidden = !name.value.trim() || !nameTaken();
			return ready;
		};
		for (const field of [name, command]) {
			field.addEventListener('input', () => { block.dataset.edited = 'true'; update(); });
			// Saved once both are filled, when the field is left or Enter pressed
			field.addEventListener('change', () => {
				if (update()) {
					delete block.dataset.edited;
					vscode.postMessage({ command: 'saveOther', index, name: name.value, line: command.value });
				}
			});
			field.addEventListener('keydown', e => { if (e.key === 'Enter') { field.blur(); } });
		}
		remove.addEventListener('click', () => {
			block.remove();
			if (index < STATE.others.length) {
				vscode.postMessage({ command: 'removeOther', index });
			}
		});
		update();
		return name;
	}

	document.getElementById('addOther').addEventListener('click', () => {
		otherRow(others.querySelectorAll('.otherName').length, '', '', true).focus();
	});

	window.addEventListener('message', event => {
		if (event.data.command === 'state') {
			render(event.data);
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
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
