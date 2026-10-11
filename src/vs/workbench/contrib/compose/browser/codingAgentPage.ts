/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { isMacintosh } from '../../../../base/common/platform.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITerminalInstanceService } from '../../terminal/browser/terminal.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { AGENT_COMMAND_SETTING, CHOOSE_AGENT_COMMAND_ID, CODING_AGENTS, commandWords, findProgram, PROMPT_PLACEHOLDER, terminalEnvironment } from './pollisAgents.js';
import { REPORTS_AGENT_COMMAND_SETTING } from './reports.js';

// Compose > Choose Coding Agent: a page of the coding agents Pollis knows, all of which run on local and
// cloud models, in alphabetical order, each marked installed or not found on this computer, with its
// install page and a button to use it; a field for any other agent's command; the optional cheaper agent of
// Reports' Polish with Agent; and the local model runners, with how each agent reaches each one. The choice is saved in the settings at once; the page follows changes made
// in the settings while it is open.

/** A program that serves local models on this computer, and how each agent reaches it, by agent label. */
interface ILocalRunner {
	readonly label: string;
	readonly note: string;
	readonly url: string;
	readonly agents: { readonly [agent: string]: string };
	/** Whether it runs only on macOS, so the page shows it only there. */
	readonly macOnly?: boolean;
}

const LOCAL_RUNNERS: readonly ILocalRunner[] = [
	{
		label: 'Ollama',
		note: localize('codingAgent.ollamaNote', "OpenAI and Anthropic APIs, port 11434"),
		url: 'https://ollama.com',
		agents: { 'Claude Code': 'ollama launch', 'Codex': 'ollama launch, --oss', 'GitHub Copilot CLI': 'ollama launch', 'OpenCode': 'ollama launch' },
	},
	{
		label: 'LM Studio',
		note: localize('codingAgent.lmStudioNote', "OpenAI and Anthropic APIs, port 1234; runs MLX models on Apple silicon"),
		url: 'https://lmstudio.ai',
		agents: { 'Claude Code': 'ANTHROPIC_BASE_URL', 'Codex': '--oss --local-provider lmstudio', 'GitHub Copilot CLI': 'COPILOT_PROVIDER_BASE_URL', 'OpenCode': 'opencode.json' },
	},
	{
		label: 'llama.cpp',
		note: localize('codingAgent.llamaCppNote', "llama-server: OpenAI and Anthropic APIs, port 8080"),
		url: 'https://github.com/ggml-org/llama.cpp',
		agents: { 'Claude Code': 'ANTHROPIC_BASE_URL', 'Codex': '~/.codex/config.toml', 'GitHub Copilot CLI': 'COPILOT_PROVIDER_BASE_URL', 'OpenCode': 'opencode.json' },
	},
	{
		label: 'Apple MLX',
		note: localize('codingAgent.mlxNote', "Apple silicon; mlx_lm.server: OpenAI API, port 8080"),
		url: 'https://github.com/ml-explore/mlx-lm',
		macOnly: true,
		agents: { 'Claude Code': localize('codingAgent.throughLmStudio', "Through LM Studio"), 'Codex': '~/.codex/config.toml', 'GitHub Copilot CLI': 'COPILOT_PROVIDER_BASE_URL', 'OpenCode': 'opencode.json' },
	},
];

type AgentMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'use'; readonly line: string }
	| { readonly command: 'reports'; readonly line: string }
	| { readonly command: 'link'; readonly url: string };

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the Coding Agent page, or shows it again when it is open. */
async function openCodingAgentPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const configurationService = accessor.get(IConfigurationService);
	const fileService = accessor.get(IFileService);
	const terminalInstanceService = accessor.get(ITerminalInstanceService);
	const openerService = accessor.get(IOpenerService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('codingAgent.title', "Coding Agent");
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

	// Which agents are installed is looked up again each time the page loads
	const sendState = async () => {
		const environment = await terminalEnvironment(terminalInstanceService);
		const agents = await Promise.all(CODING_AGENTS.map(async agent => ({
			...agent,
			installed: !!await findProgram(commandWords(agent.command)[0], environment, fileService),
		})));
		webviewInput.webview.postMessage({
			command: 'state',
			agents,
			runners: LOCAL_RUNNERS.filter(runner => !runner.macOnly || isMacintosh),
			current: configurationService.getValue<string>(AGENT_COMMAND_SETTING)?.trim() ?? '',
			reports: configurationService.getValue<string>(REPORTS_AGENT_COMMAND_SETTING)?.trim() ?? '',
		});
	};
	disposables.add(configurationService.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration(AGENT_COMMAND_SETTING) || e.affectsConfiguration(REPORTS_AGENT_COMMAND_SETTING)) {
			sendState();
		}
	}));
	disposables.add(webviewInput.webview.onMessage((e: { message: AgentMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			sendState();
		} else if (message.command === 'use' && message.line.trim()) {
			configurationService.updateValue(AGENT_COMMAND_SETTING, message.line.trim());
		} else if (message.command === 'reports') {
			configurationService.updateValue(REPORTS_AGENT_COMMAND_SETTING, message.line.trim());
		} else if (message.command === 'link' && [...CODING_AGENTS, ...LOCAL_RUNNERS].some(item => item.url === message.url)) {
			openerService.open(URI.parse(message.url), { openExternal: true });
		}
	}));
}

/** The page: its texts come from here, the agents and the settings from the `state` message. */
function pageHtml(): string {
	const text = {
		title: localize('codingAgent.title', "Coding Agent"),
		intro: localize('codingAgent.intro', "The coding agent Pollis starts in a terminal for every agent task of the Compose menu: Pollis Agents, Orchestration and Reports. Pollis gives it a first message that points it at the task's instructions, so any agent that reads files and runs commands will do, on a cloud model or on a local one."),
		agent: localize('codingAgent.agent', "Agent"),
		command: localize('codingAgent.command', "Command"),
		status: localize('codingAgent.status', "On This Computer"),
		installed: localize('codingAgent.installed', "Installed"),
		notFound: localize('codingAgent.notFound', "Not found"),
		installPage: localize('codingAgent.installPage', "Install Page"),
		localSection: localize('codingAgent.localSection', "Local and Cloud Models"),
		localSectionNote: localize('codingAgent.localSectionNote', "Ollama, LM Studio: free, private, on this computer"),
		local: localize('codingAgent.local', "Local:"),
		use: localize('codingAgent.use', "Use"),
		inUse: localize('codingAgent.inUse', "In Use"),
		none: localize('codingAgent.none', "No coding agent is chosen yet: pick one below."),
		currentIs: localize('codingAgent.currentIs', "In use:"),
		otherTitle: localize('codingAgent.otherTitle', "Other Agent"),
		otherIntro: localize('codingAgent.otherIntro', "Any other agent's command line, with {0} where the first message goes, for example: aider --message {0}. Without {0}, the message is copied to the clipboard to paste into the agent.", PROMPT_PLACEHOLDER),
		reportsTitle: localize('codingAgent.reportsTitle', "Agent for Polish with Agent (Reports)"),
		reportsIntro: localize('codingAgent.reportsIntro', "Polishing a report Pollis has already written is a small task, which a cheaper, faster model does well. Give the command line of that agent, for example: claude --model haiku {0}. Empty: the agent above.", PROMPT_PLACEHOLDER),
		reportsPlaceholder: localize('codingAgent.reportsPlaceholder', "The agent above"),
		runnersTitle: localize('codingAgent.runnersTitle', "Local Model Runners"),
		runnersNote: localize('codingAgent.runnersNote', "They serve the local models; each cell says how the agent reaches the runner"),
		runner: localize('codingAgent.runner', "Runner"),
		save: localize('codingAgent.save', "Save"),
		saved: localize('codingAgent.saved', "Saved"),
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
		.missing { color: var(--vscode-descriptionForeground); }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.link:hover { text-decoration: underline; }
		button.action { font: inherit; padding: 3px 12px; border: none; border-radius: 2px; cursor: pointer; color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.action:hover { background: var(--vscode-button-hoverBackground); }
		button.action:disabled { cursor: default; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
		.row { display: flex; gap: 8px; max-width: 700px; }
		input { flex: 1; padding: 4px 6px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
		input:focus { outline: 1px solid var(--vscode-focusBorder); }
		.right { text-align: right; white-space: nowrap; }
		th.agent { width: 30%; } th.command { width: 34%; } th.status { width: 20%; }
		.section { display: flex; align-items: center; gap: 8px; margin: 24px 0 4px 0; }
		.section-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
		.section.local { color: var(--vscode-textLink-foreground); }
		.section-note { font-size: 12px; color: var(--vscode-descriptionForeground); }
		.section svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; }
		.rule { flex: 1; height: 1px; background: linear-gradient(to right, var(--vscode-textLink-foreground), transparent); }
		table.local td:first-child { box-shadow: inset 3px 0 0 var(--vscode-textLink-foreground); padding-left: 12px; }
		table.local tr:not(:hover):not(.chosen) td { background: color-mix(in srgb, var(--vscode-textLink-foreground) 5%, transparent); }
		.variant { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
		button.secondary { font: inherit; font-size: 12px; padding: 1px 8px; border: none; border-radius: 2px; cursor: pointer; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
		button.secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
		button.secondary:disabled { cursor: default; opacity: 0.6; }
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
	<h2>${text.reportsTitle}</h2>
	<p class="hint">${text.reportsIntro}</p>
	<div class="row"><input id="reports" spellcheck="false" placeholder="${text.reportsPlaceholder}"><button class="action" id="saveReports">${text.save}</button></div>
	<div class="section local">
		<span class="section-title">${text.runnersTitle}</span><span class="section-note">${text.runnersNote}</span><span class="rule"></span>
	</div>
	<table class="local">
		<thead><tr id="runnersHead"></tr></thead>
		<tbody id="runners"></tbody>
	</table>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const local = document.getElementById('local');
	const other = document.getElementById('other');
	const runnersHead = document.getElementById('runnersHead');
	const runners = document.getElementById('runners');
	const reports = document.getElementById('reports');

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
				// The local variant: its own command, chosen with its own button
				const variant = element('div', 'variant small');
				variant.appendChild(document.createTextNode(TEXT.local + ' '));
				variant.appendChild(element('code', '', agent.localCommand));
				const useLocal = element('button', 'secondary', agent.localCommand === state.current ? TEXT.inUse : TEXT.use);
				useLocal.disabled = agent.localCommand === state.current;
				useLocal.addEventListener('click', () => vscode.postMessage({ command: 'use', line: agent.localCommand }));
				variant.appendChild(useLocal);
				command.appendChild(variant);
			}
			row.appendChild(command);
			const status = element('td');
			status.appendChild(element('div', agent.installed ? 'installed' : 'missing', agent.installed ? TEXT.installed : TEXT.notFound));
			const install = element('button', 'link small', TEXT.installPage);
			install.addEventListener('click', () => vscode.postMessage({ command: 'link', url: agent.url }));
			status.appendChild(install);
			row.appendChild(status);
			const action = element('td', 'right');
			const use = element('button', 'action', agent.command === state.current ? TEXT.inUse : TEXT.use);
			use.disabled = agent.command === state.current;
			use.addEventListener('click', () => vscode.postMessage({ command: 'use', line: agent.command }));
			action.appendChild(use);
			row.appendChild(action);
			local.appendChild(row);
		}
		// The runners: a row each, a column for each agent
		runnersHead.textContent = '';
		runnersHead.appendChild(element('th', '', TEXT.runner));
		for (const agent of agents) {
			runnersHead.appendChild(element('th', '', agent.label));
		}
		runners.textContent = '';
		for (const runner of state.runners) {
			const row = element('tr');
			const name = element('td');
			name.appendChild(element('div', 'name', runner.label));
			name.appendChild(element('div', 'small', runner.note));
			const page = element('button', 'link small', TEXT.installPage);
			page.addEventListener('click', () => vscode.postMessage({ command: 'link', url: runner.url }));
			name.appendChild(page);
			row.appendChild(name);
			for (const agent of agents) {
				const cell = element('td');
				cell.appendChild(element('code', '', runner.agents[agent.label] || '-'));
				row.appendChild(cell);
			}
			runners.appendChild(row);
		}
		// The field shows the command in use when it is none of the listed agents
		if (document.activeElement !== other) {
			other.value = state.agents.some(agent => agent.command === state.current || agent.localCommand === state.current) ? '' : state.current;
		}
		if (document.activeElement !== reports) {
			reports.value = state.reports;
		}
	}

	function flash(button, label) {
		const before = button.textContent;
		button.textContent = label;
		setTimeout(() => { button.textContent = before; }, 1500);
	}

	document.getElementById('useOther').addEventListener('click', () => {
		if (other.value.trim()) {
			vscode.postMessage({ command: 'use', line: other.value });
		}
	});
	other.addEventListener('keydown', e => { if (e.key === 'Enter') { document.getElementById('useOther').click(); } });
	const saveReports = document.getElementById('saveReports');
	saveReports.addEventListener('click', () => {
		vscode.postMessage({ command: 'reports', line: reports.value });
		flash(saveReports, TEXT.saved);
	});
	reports.addEventListener('keydown', e => { if (e.key === 'Enter') { saveReports.click(); } });

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
			title: localize2('pollisAgents.chooseAgent', "Choose Coding Agent..."),
			category: localize2('pollisAgents.category', "Pollis Agents"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openCodingAgentPage(accessor);
	}
});
