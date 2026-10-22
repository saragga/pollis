/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../base/common/buffer.js';
import { parse } from '../../../../base/common/json.js';
import { applyEdits, setProperty } from '../../../../base/common/jsonEdit.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { ITerminalInstanceService, ITerminalService } from '../../terminal/browser/terminal.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { commandLine, IMcpServer, MCP_SERVERS, MCP_SERVERS_COMMAND_ID, shellWord, UV_INSTALL_URL } from '../common/mcpServers.js';
import { CHOOSE_AGENT_COMMAND_ID, CODING_AGENTS, commandWords, findProgram, terminalEnvironment } from './pollisAgents.js';
import { OPEN_LINK_COMMAND_ID } from '../../monitor/browser/openLink.js';

// Compose > MCP Servers: a short, curated library of MCP servers (common/mcpServers.ts), which the coding agent
// of Compose > Coding Agents can use to look things up while it works: search a source, read its notes, fetch
// its data. Remote servers are run by their provider; local ones run on the user's computer with uvx, and each
// says who makes it and links to its source or terms. Pollis adds a server to the user's own agent, for every
// folder, with the agent's own command or configuration file, in a terminal so that the user sees it; sign-in
// (OAuth) happens in the agent and the browser, and Pollis holds no token. Whether a server is added, and
// whether uv is installed, is read again each time the page is shown again or Pollis gets the focus back.

/** How Pollis adds a server to an agent, signs in to it and removes it, and where the agent keeps it. */
interface IMcpAgent {
	/** The agent's label in CODING_AGENTS. */
	readonly agent: string;
	/** Its configuration file, from the home folder. */
	readonly config: readonly string[];
	/** Whether the server is in the configuration file's text. */
	readonly has: (text: string, server: IMcpServer) => boolean;
	/** The command lines; without `add` or `remove`, Pollis edits the configuration file itself. Only servers with `signIn` are signed in to. */
	readonly add?: (server: IMcpServer) => string;
	readonly signIn: (server: IMcpServer) => string;
	readonly remove?: (server: IMcpServer) => string;
}

/** The `mcpServers`, or `mcp`, object of a JSON or JSONC configuration file. */
function jsonServers(text: string, key: string): Record<string, unknown> {
	const value = (parse(text) as Record<string, unknown> | undefined)?.[key];
	return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

/** The environment of a local server as options of an agent's add command. */
function environmentOptions(server: IMcpServer, option: string): string {
	return Object.entries(server.env ?? {}).map(([key, value]) => ` ${option} ${shellWord(`${key}=${value}`)}`).join('');
}

/** The command line of a local server, quoted for the shell. */
function localCommand(server: IMcpServer): string {
	return (server.command ?? []).map(shellWord).join(' ');
}

const MCP_AGENTS: readonly IMcpAgent[] = [
	{
		agent: 'Claude Code',
		config: ['.claude.json'],
		has: (text, server) => Object.keys(jsonServers(text, 'mcpServers')).includes(server.name),
		// The name goes before the variadic -e, and the local server's command after --
		add: server => server.url
			? `claude mcp add --transport http --scope user ${server.name} ${shellWord(server.url)}`
			: `claude mcp add --scope user ${server.name}${environmentOptions(server, '-e')} -- ${localCommand(server)}`,
		signIn: server => `claude mcp login ${server.name}`,
		remove: server => `claude mcp remove --scope user ${server.name}`,
	},
	{
		agent: 'Codex',
		config: ['.codex', 'config.toml'],
		has: (text, server) => new RegExp(`^\\s*\\[mcp_servers\\.("?)${server.name}\\1\\]`, 'm').test(text),
		add: server => server.url
			? `codex mcp add ${server.name} --url ${shellWord(server.url)}`
			: `codex mcp add ${server.name}${environmentOptions(server, '--env')} -- ${localCommand(server)}`,
		signIn: server => `codex mcp login ${server.name}`,
		remove: server => `codex mcp remove ${server.name}`,
	},
	{
		agent: 'OpenCode',
		config: ['.config', 'opencode', 'opencode.json'],
		has: (text, server) => Object.keys(jsonServers(text, 'mcp')).includes(server.name),
		signIn: server => `opencode mcp auth ${server.name}`,
	},
];

type McpMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'codingAgent' }
	| { readonly command: 'add' | 'signIn' | 'remove'; readonly server: string; readonly agent: string }
	| { readonly command: 'link'; readonly url: string };

/** The server to scroll to once the page has its servers, when it was opened for one. */
let revealServer: string | undefined;

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the MCP Servers page, or shows it again when it is open; given a server's name, scrolls to it. */
async function openMcpServersPage(accessor: ServicesAccessor, server: string | undefined): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const fileService = accessor.get(IFileService);
	const terminalInstanceService = accessor.get(ITerminalInstanceService);
	const terminalService = accessor.get(ITerminalService);
	const hostService = accessor.get(IHostService);
	const commandService = accessor.get(ICommandService);
	const pathService = accessor.get(IPathService);
	const notificationService = accessor.get(INotificationService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		if (server) {
			openPage.webview.postMessage({ command: 'reveal', server });
		}
		return;
	}
	revealServer = server;
	const title = localize('mcpServers.title', "MCP Servers");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.mcpServers',
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

	const configFile = (mcpAgent: IMcpAgent) => joinPath(pathService.userHome({ preferLocal: true }), ...mcpAgent.config);
	const readConfig = async (mcpAgent: IMcpAgent): Promise<string> => {
		try {
			return (await fileService.readFile(configFile(mcpAgent))).value.toString();
		} catch {
			return '';
		}
	};

	// For each server, each agent Pollis can add it to: installed or not, and whether the server is added; and whether uv is installed
	const sendState = async () => {
		const environment = await terminalEnvironment(terminalInstanceService);
		const uv = !!await findProgram('uvx', environment, fileService);
		const agents = await Promise.all(MCP_AGENTS.map(async mcpAgent => {
			const agent = CODING_AGENTS.find(item => item.label === mcpAgent.agent);
			const installed = !!agent && !!await findProgram(commandWords(agent.command)[0], environment, fileService);
			const text = installed ? await readConfig(mcpAgent) : '';
			let added: string[] = [];
			try {
				added = MCP_SERVERS.filter(server => mcpAgent.has(text, server)).map(server => server.name);
			} catch {
				// A configuration file Pollis cannot read counts as one without the server
			}
			return { label: mcpAgent.agent, installed, added };
		}));
		const unsupported = CODING_AGENTS.map(agent => agent.label).filter(label => !MCP_AGENTS.some(mcpAgent => mcpAgent.agent === label));
		const servers = MCP_SERVERS.map(item => ({ ...item, commandLine: item.command ? commandLine(item) : undefined }));
		webviewInput.webview.postMessage({ command: 'state', servers, agents, unsupported, uv, reveal: revealServer });
		revealServer = undefined;
	};

	const runInTerminal = async (name: string, lines: string[]) => {
		const instance = await terminalService.createTerminal({ config: { name } });
		terminalService.setActiveInstance(instance);
		await terminalService.revealTerminal(instance);
		await instance.sendText(lines.join(' && '), true);
	};

	// OpenCode has no command that adds a server, so Pollis writes it in its configuration file, keeping the rest
	const editOpenCode = async (mcpAgent: IMcpAgent, server: IMcpServer, add: boolean) => {
		const text = await readConfig(mcpAgent) || '{\n\t"$schema": "https://opencode.ai/config.json"\n}\n';
		const value = !add ? undefined : server.url
			? { type: 'remote', url: server.url }
			: { type: 'local', command: server.command, ...(server.env ? { environment: server.env } : {}) };
		const edits = setProperty(text, ['mcp', server.name], value, { tabSize: 2, insertSpaces: false, eol: '\n' });
		await fileService.writeFile(configFile(mcpAgent), VSBuffer.fromString(applyEdits(text, edits)));
	};

	disposables.add(webviewInput.webview.onDidFocus(() => sendState()));
	disposables.add(hostService.onDidChangeFocus(focused => {
		if (focused) {
			sendState();
		}
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: McpMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			sendState();
		} else if (message.command === 'codingAgent') {
			commandService.executeCommand(CHOOSE_AGENT_COMMAND_ID);
		} else if (message.command === 'link' && (message.url === UV_INSTALL_URL || MCP_SERVERS.some(server => server.page === message.url))) {
			commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
		} else if (message.command === 'add' || message.command === 'signIn' || message.command === 'remove') {
			const server = MCP_SERVERS.find(item => item.name === message.server);
			const mcpAgent = MCP_AGENTS.find(item => item.agent === message.agent);
			if (!server || !mcpAgent) {
				return;
			}
			const terminalName = localize('mcpServers.terminal', "{0} in {1}", server.label, mcpAgent.agent);
			try {
				if (message.command === 'add') {
					const signIn = server.signIn ? [mcpAgent.signIn(server)] : [];
					if (mcpAgent.add) {
						await runInTerminal(terminalName, [mcpAgent.add(server), ...signIn]);
					} else {
						await editOpenCode(mcpAgent, server, true);
						if (signIn.length) {
							await runInTerminal(terminalName, signIn);
						}
					}
				} else if (message.command === 'signIn' && server.signIn) {
					await runInTerminal(terminalName, [mcpAgent.signIn(server)]);
				} else if (message.command === 'signIn') {
					return;
				} else if (mcpAgent.remove) {
					await runInTerminal(terminalName, [mcpAgent.remove(server)]);
				} else {
					await editOpenCode(mcpAgent, server, false);
				}
			} catch (error) {
				notificationService.error(localize('mcpServers.failed', "Could not change {0} in {1}: {2}", server.label, mcpAgent.agent, error instanceof Error ? error.message : String(error)));
			}
			sendState();
		}
	}));
}

/** The page: its texts come from here, the servers and the agents from the `state` message. */
function pageHtml(): string {
	const text = {
		title: localize('mcpServers.title', "MCP Servers"),
		intro: localize('mcpServers.intro', "An MCP server lets your coding agent look things up while it works with you: search a data source, read its notes, fetch its data. Add a server to your agent once and it can use it in any folder. When a server needs an account, you sign in from the agent, in your browser; Pollis keeps no password or token."),
		rule: localize('mcpServers.rule', "Remote servers are run by their provider; local servers run on your computer, with uv. Each server says who makes it and links to its source or terms. The panels still give you the reproducible Julia code."),
		endpoint: localize('mcpServers.endpoint', "Endpoint"),
		command: localize('mcpServers.command', "Command"),
		tools: localize('mcpServers.tools', "Tools"),
		requires: localize('mcpServers.requires', "Requires"),
		about: localize('mcpServers.about', "About This Server and Its Terms"),
		uvMissing: localize('mcpServers.uvMissing', "uv is not installed on this computer:"),
		uvInstall: localize('mcpServers.uvInstall', "Install uv"),
		agent: localize('mcpServers.agent', "Coding Agent"),
		status: localize('mcpServers.status', "In This Agent"),
		added: localize('mcpServers.added', "Added"),
		addSignIn: localize('mcpServers.addSignIn', "Add and Sign In"),
		add: localize('mcpServers.add', "Add"),
		signInAgain: localize('mcpServers.signIn', "Sign In"),
		remove: localize('mcpServers.remove', "Remove"),
		notInstalled: localize('mcpServers.notInstalled', "Agent not installed"),
		notYet: localize('mcpServers.notYet', "Sign-in to MCP servers is not documented for this agent yet"),
		agentsHint: localize('mcpServers.agentsHint', "Install and choose your agent on"),
		agentsLink: localize('mcpServers.agentsLink', "Compose > Coding Agents"),
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
		h2 { font-size: 18px; font-weight: 600; margin: 0; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 8px 0; line-height: 1.4; max-width: 900px; }
		.hint { color: var(--vscode-descriptionForeground); margin: 0 0 20px 0; line-height: 1.4; max-width: 900px; }
		.server { border: 1px solid var(--vscode-widget-border); border-radius: 6px; padding: 16px 18px; margin: 0 0 20px 0; box-shadow: inset 3px 0 0 var(--vscode-textLink-foreground); }
		.provider { color: var(--vscode-descriptionForeground); margin: 2px 0 10px 0; }
		.description { margin: 0 0 12px 0; line-height: 1.4; }
		.facts { display: grid; grid-template-columns: max-content 1fr; gap: 6px 16px; margin: 0 0 12px 0; line-height: 1.4; }
		.facts dt { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); padding-top: 2px; }
		.facts dd { margin: 0; }
		.facts ul { margin: 0; padding-left: 18px; }
		code { font-family: var(--vscode-editor-font-family); font-size: 12px; }
		table { width: 100%; border-collapse: collapse; margin-top: 8px; }
		th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); }
		th.agent { width: 40%; }
		td { vertical-align: top; padding: 8px; border-bottom: 1px solid var(--vscode-widget-border); line-height: 1.4; }
		tr:hover td { background: var(--vscode-list-hoverBackground); }
		.name { font-weight: 600; }
		.small { font-size: 12px; color: var(--vscode-descriptionForeground); }
		.added { color: var(--vscode-testing-iconPassed); }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.link:hover { text-decoration: underline; }
		.separator { color: var(--vscode-descriptionForeground); margin: 0 6px; }
		.warning { margin: 0 0 12px 0; color: var(--vscode-editorWarning-foreground); }
	</style>
</head>
<body>
<div class="container">
	<h1>${text.title}</h1>
	<p class="subtitle">${text.intro}</p>
	<p class="hint">${text.rule} ${text.agentsHint} <button class="link" id="codingAgent">${text.agentsLink}</button></p>
	<div id="servers"></div>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const UV_INSTALL_URL = ${JSON.stringify(UV_INSTALL_URL)};
	const servers = document.getElementById('servers');

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	function action(label, command, server, agent) {
		const button = element('button', 'link', label);
		button.addEventListener('click', () => vscode.postMessage({ command, server, agent }));
		return button;
	}

	function render(state) {
		servers.textContent = '';
		for (const server of state.servers) {
			const card = element('div', 'server');
			card.id = 'server-' + server.name;
			card.appendChild(element('h2', '', server.label));
			card.appendChild(element('div', 'provider', server.provider));
			card.appendChild(element('p', 'description', server.description));
			const facts = element('dl', 'facts');
			facts.appendChild(element('dt', '', server.url ? TEXT.endpoint : TEXT.command));
			const endpoint = element('dd');
			endpoint.appendChild(element('code', '', server.url || server.commandLine));
			facts.appendChild(endpoint);
			facts.appendChild(element('dt', '', TEXT.tools));
			const tools = element('dd');
			const list = element('ul');
			for (const tool of server.tools) {
				list.appendChild(element('li', '', tool));
			}
			tools.appendChild(list);
			facts.appendChild(tools);
			facts.appendChild(element('dt', '', TEXT.requires));
			facts.appendChild(element('dd', '', server.requires));
			card.appendChild(facts);
			if (server.command && server.command[0] === 'uvx' && !state.uv) {
				const warning = element('p', 'warning', TEXT.uvMissing + ' ');
				const install = element('button', 'link', TEXT.uvInstall);
				install.addEventListener('click', () => vscode.postMessage({ command: 'link', url: UV_INSTALL_URL }));
				warning.appendChild(install);
				card.appendChild(warning);
			}
			const about = element('button', 'link', TEXT.about);
			about.addEventListener('click', () => vscode.postMessage({ command: 'link', url: server.page }));
			card.appendChild(about);

			// Each agent: added, with Sign In and Remove; not added, with Add and Sign In; or not installed
			const table = element('table');
			const head = element('tr');
			head.appendChild(element('th', 'agent', TEXT.agent));
			head.appendChild(element('th', '', TEXT.status));
			table.appendChild(element('thead')).appendChild(head);
			const body = element('tbody');
			for (const agent of state.agents) {
				const row = element('tr');
				row.appendChild(element('td', 'name', agent.label));
				const status = element('td');
				if (!agent.installed) {
					status.appendChild(element('span', 'small', TEXT.notInstalled));
				} else if (agent.added.includes(server.name)) {
					status.appendChild(element('span', 'added', TEXT.added));
					if (server.signIn) {
						status.appendChild(element('span', 'separator', '\\u00b7'));
						status.appendChild(action(TEXT.signInAgain, 'signIn', server.name, agent.label));
					}
					status.appendChild(element('span', 'separator', '\\u00b7'));
					status.appendChild(action(TEXT.remove, 'remove', server.name, agent.label));
				} else {
					status.appendChild(action(server.signIn ? TEXT.addSignIn : TEXT.add, 'add', server.name, agent.label));
				}
				row.appendChild(status);
				body.appendChild(row);
			}
			for (const label of state.unsupported) {
				const row = element('tr');
				row.appendChild(element('td', 'name', label));
				row.appendChild(element('td', 'small', TEXT.notYet));
				body.appendChild(row);
			}
			table.appendChild(body);
			card.appendChild(table);
			servers.appendChild(card);
		}
		if (state.reveal) {
			reveal(state.reveal);
		}
	}

	function reveal(name) {
		const card = document.getElementById('server-' + name);
		if (card) {
			card.scrollIntoView({ block: 'start' });
		}
	}

	document.getElementById('codingAgent').addEventListener('click', () => vscode.postMessage({ command: 'codingAgent' }));

	window.addEventListener('message', event => {
		if (event.data.command === 'state') {
			render(event.data);
		} else if (event.data.command === 'reveal') {
			reveal(event.data.server);
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
			id: MCP_SERVERS_COMMAND_ID,
			title: localize2('mcpServers.action', "MCP Servers"),
			category: localize2('mcpServers.category', "Compose"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor, server?: unknown): Promise<void> {
		return openMcpServersPage(accessor, typeof server === 'string' ? server : undefined);
	}
});
