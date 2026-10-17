/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { isMacintosh, isWindows } from '../../../../base/common/platform.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { ITerminalInstanceService } from '../../terminal/browser/terminal.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { CHOOSE_AGENT_COMMAND_ID, CODING_AGENTS, findProgram, terminalEnvironment } from './pollisAgents.js';

// Compose > Local Models > Local Model Runners: a page of the programs that serve local models on
// this computer, each marked installed or with a link to its install page, and how each coding agent of
// Compose > Coding Agents reaches each runner. A model downloaded from Hugging Face or Kaggle (the other two
// entries of the menu) runs only through a runner. Which runners are installed is looked up again when the
// page is shown again or Pollis gets the focus back, after an install.

export const LOCAL_MODEL_RUNNERS_COMMAND_ID = 'pollis.localModels.runners';

/** A program that serves local models on this computer, where to find it, and how each agent reaches it, by agent label. */
interface ILocalRunner {
	readonly label: string;
	readonly note: string;
	readonly url: string;
	/** The program, looked for in the PATH, and the places an installer puts it, `~` for the home folder. */
	readonly program: string;
	readonly places: readonly string[];
	readonly agents: { readonly [agent: string]: string };
	/** Whether it runs only on macOS, so the page shows it only there. */
	readonly macOnly?: boolean;
}

const LOCAL_RUNNERS: readonly ILocalRunner[] = [
	{
		label: 'Ollama',
		note: localize('localRunners.ollamaNote', "OpenAI and Anthropic APIs, port 11434"),
		url: 'https://ollama.com',
		program: 'ollama',
		places: isMacintosh ? ['/Applications/Ollama.app'] : isWindows ? ['~/AppData/Local/Programs/Ollama/ollama'] : [],
		agents: { 'Claude Code': 'ollama launch', 'Cline': 'cline auth --provider ollama', 'Codex': 'ollama launch, --oss', 'GitHub Copilot CLI': 'ollama launch', 'OpenCode': 'ollama launch' },
	},
	{
		label: 'LM Studio',
		note: localize('localRunners.lmStudioNote', "OpenAI and Anthropic APIs, port 1234; runs MLX models on Apple silicon"),
		url: 'https://lmstudio.ai',
		program: 'lms',
		places: ['~/.lmstudio/bin/lms', ...(isMacintosh ? ['/Applications/LM Studio.app'] : [])],
		agents: { 'Claude Code': 'ANTHROPIC_BASE_URL', 'Cline': 'cline auth --provider lmstudio', 'Codex': '--oss --local-provider lmstudio', 'GitHub Copilot CLI': 'COPILOT_PROVIDER_BASE_URL', 'OpenCode': 'opencode.json' },
	},
	{
		label: 'llama.cpp',
		note: localize('localRunners.llamaCppNote', "llama-server: OpenAI and Anthropic APIs, port 8080"),
		url: 'https://github.com/ggml-org/llama.cpp',
		program: 'llama-server',
		places: [],
		agents: { 'Claude Code': 'ANTHROPIC_BASE_URL', 'Cline': 'cline auth --provider openai-compatible', 'Codex': '~/.codex/config.toml', 'GitHub Copilot CLI': 'COPILOT_PROVIDER_BASE_URL', 'OpenCode': 'opencode.json' },
	},
	{
		label: 'Apple MLX',
		note: localize('localRunners.mlxNote', "Apple silicon; mlx_lm.server: OpenAI API, port 8080"),
		url: 'https://github.com/ml-explore/mlx-lm',
		program: 'mlx_lm.server',
		places: [],
		macOnly: true,
		agents: { 'Claude Code': localize('localRunners.throughLmStudio', "Through LM Studio"), 'Cline': 'cline auth --provider openai-compatible', 'Codex': '~/.codex/config.toml', 'GitHub Copilot CLI': 'COPILOT_PROVIDER_BASE_URL', 'OpenCode': 'opencode.json' },
	},
];

type RunnersMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'codingAgent' }
	| { readonly command: 'link'; readonly url: string };

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the Local Model Runners page, or shows it again when it is open. */
async function openLocalModelRunnersPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const fileService = accessor.get(IFileService);
	const terminalInstanceService = accessor.get(ITerminalInstanceService);
	const openerService = accessor.get(IOpenerService);
	const hostService = accessor.get(IHostService);
	const commandService = accessor.get(ICommandService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('localRunners.title', "Local Model Runners");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.localModelRunners',
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

	// A runner is installed when its program is in the PATH or in one of the places its installer uses
	const sendState = async () => {
		const environment = await terminalEnvironment(terminalInstanceService);
		const home = (environment['HOME'] ?? environment['USERPROFILE'] ?? '').replace(/\\/g, '/');
		const runners = await Promise.all(LOCAL_RUNNERS.filter(runner => !runner.macOnly || isMacintosh).map(async runner => {
			let path = await findProgram(runner.program, environment, fileService);
			for (const place of runner.places) {
				if (path || (place.startsWith('~') && !home)) {
					continue;
				}
				path = await findProgram(place.replace(/^~/, home), environment, fileService);
			}
			return { ...runner, path };
		}));
		webviewInput.webview.postMessage({
			command: 'state',
			runners,
			agents: CODING_AGENTS.map(agent => agent.label).sort((a, b) => a.localeCompare(b)),
		});
	};
	disposables.add(webviewInput.webview.onDidFocus(() => sendState()));
	disposables.add(hostService.onDidChangeFocus(focused => {
		if (focused) {
			sendState();
		}
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: RunnersMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			sendState();
		} else if (message.command === 'codingAgent') {
			commandService.executeCommand(CHOOSE_AGENT_COMMAND_ID);
		} else if (message.command === 'link' && LOCAL_RUNNERS.some(runner => runner.url === message.url)) {
			openerService.open(URI.parse(message.url), { openExternal: true });
		}
	}));
}

/** The page: its texts come from here, the runners and the agents from the `state` message. */
function pageHtml(): string {
	const text = {
		title: localize('localRunners.title', "Local Model Runners"),
		intro: localize('localRunners.intro', "A local model runs only through a runner, a program that loads the model and serves it on this computer, free and private. Get models from Hugging Face or Kaggle, the other entries of this menu, or through the runner itself."),
		runner: localize('localRunners.runner', "Runner"),
		program: localize('localRunners.program', "Program"),
		status: localize('localRunners.status', "On This Computer"),
		installed: localize('localRunners.installed', "Runner Installed"),
		installRunner: localize('localRunners.installRunner', "Install Runner"),
		agentsTitle: localize('localRunners.agentsTitle', "How Each Agent Reaches a Runner"),
		agentsIntro: localize('localRunners.agentsIntro', "A coding agent uses a local model through a runner; each cell says how. The agent's local command line is on"),
		agentsLink: localize('localRunners.agentsLink', "Compose > Coding Agents"),
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
		table { width: 100%; border-collapse: collapse; }
		th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); }
		td { vertical-align: top; padding: 10px 8px; border-bottom: 1px solid var(--vscode-widget-border); line-height: 1.4; }
		tr:hover td { background: var(--vscode-list-hoverBackground); }
		.name { font-size: 14px; font-weight: 600; }
		.small { font-size: 12px; color: var(--vscode-descriptionForeground); }
		code { font-family: var(--vscode-editor-font-family); font-size: 12px; }
		.installed { color: var(--vscode-testing-iconPassed); }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.link:hover { text-decoration: underline; }
		th.runner { width: 40%; } th.program { width: 30%; }
		table.local td:first-child { box-shadow: inset 3px 0 0 var(--vscode-textLink-foreground); padding-left: 12px; }
		table.local tr:not(:hover) td { background: color-mix(in srgb, var(--vscode-textLink-foreground) 5%, transparent); }
	</style>
</head>
<body>
<div class="container">
	<h1>${text.title}</h1>
	<p class="subtitle">${text.intro}</p>
	<table class="local">
		<thead><tr><th class="runner">${text.runner}</th><th class="program">${text.program}</th><th>${text.status}</th></tr></thead>
		<tbody id="runners"></tbody>
	</table>
	<h2>${text.agentsTitle}</h2>
	<p class="hint">${text.agentsIntro} <button class="link" id="codingAgent">${text.agentsLink}</button></p>
	<table class="local">
		<thead><tr id="agentsHead"></tr></thead>
		<tbody id="agents"></tbody>
	</table>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const runners = document.getElementById('runners');
	const agentsHead = document.getElementById('agentsHead');
	const agents = document.getElementById('agents');

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	function render(state) {
		// The runners: installed, with where, or a link to install it
		runners.textContent = '';
		for (const runner of state.runners) {
			const row = element('tr');
			const name = element('td');
			name.appendChild(element('div', 'name', runner.label));
			name.appendChild(element('div', 'small', runner.note));
			row.appendChild(name);
			const program = element('td');
			program.appendChild(element('code', '', runner.program));
			row.appendChild(program);
			const status = element('td');
			if (runner.path) {
				const installed = element('div', 'installed', TEXT.installed);
				installed.title = runner.path;
				status.appendChild(installed);
			} else {
				const install = element('button', 'link', TEXT.installRunner);
				install.addEventListener('click', () => vscode.postMessage({ command: 'link', url: runner.url }));
				status.appendChild(install);
			}
			row.appendChild(status);
			runners.appendChild(row);
		}
		// How each agent reaches each runner: a row each, a column for each agent
		agentsHead.textContent = '';
		agentsHead.appendChild(element('th', '', TEXT.runner));
		for (const agent of state.agents) {
			agentsHead.appendChild(element('th', '', agent));
		}
		agents.textContent = '';
		for (const runner of state.runners) {
			const row = element('tr');
			row.appendChild(element('td', 'name', runner.label));
			for (const agent of state.agents) {
				const cell = element('td');
				cell.appendChild(element('code', '', runner.agents[agent] || '-'));
				row.appendChild(cell);
			}
			agents.appendChild(row);
		}
	}

	document.getElementById('codingAgent').addEventListener('click', () => vscode.postMessage({ command: 'codingAgent' }));

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
			id: LOCAL_MODEL_RUNNERS_COMMAND_ID,
			title: localize2('localRunners.action', "Local Model Runners"),
			category: localize2('localRunners.category', "Compose"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openLocalModelRunnersPage(accessor);
	}
});
