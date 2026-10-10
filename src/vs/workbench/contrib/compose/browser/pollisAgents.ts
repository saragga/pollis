/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { Schemas } from '../../../../base/common/network.js';
import { join } from '../../../../base/common/path.js';
import { IProcessEnvironment, isWindows } from '../../../../base/common/platform.js';
import { dirname, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProgressService, ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { IQuickInputService, IQuickPickItem, IQuickPickSeparator } from '../../../../platform/quickinput/common/quickInput.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { asJson, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../../common/editor.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { ITerminalInstanceService, ITerminalService } from '../../terminal/browser/terminal.js';

// Pollis Agents, in the Compose menu: two skills (Create a Panel, Package a Toolbox) that a coding
// agent of the user's choice runs in a terminal; Create Panels from a Request runs Create a Panel on
// the request file open in the editor, which lists the panels to write, with no questions asked. The skills and their scripts come from the Pollis
// Agents plugin, Trumpingtons/pollis-plugins (plugins/pollis-agents, its files listed in files.json),
// downloaded to ~/.pollis/agents/pollis-agents each time a skill starts. The agent is started with a
// first message that points it at the skill's SKILL.md, so any agent that reads files and runs
// commands can follow it, whether on a cloud model or a local one.

const PLUGIN_URL = 'https://raw.githubusercontent.com/Trumpingtons/pollis-plugins/main/plugins/pollis-agents';

const AGENT_COMMAND_SETTING = 'pollis.agents.command';
const PROMPT_PLACEHOLDER = '{prompt}';

// The commands of Compose > Pollis Agents (the menu itself is in compose.contribution.ts)
export const CREATE_PANEL_COMMAND_ID = 'pollis.agents.createPanel';
export const CREATE_PANELS_FROM_REQUEST_COMMAND_ID = 'pollis.agents.createPanelsFromRequest';
export const PACKAGE_TOOLBOX_COMMAND_ID = 'pollis.agents.packageToolbox';
export const CHOOSE_AGENT_COMMAND_ID = 'pollis.agents.chooseAgent';

/** A coding agent Pollis knows how to start with a first message. */
interface ICodingAgent {
	readonly label: string;
	/** The command line that starts it, with `{prompt}` where the first message goes. */
	readonly command: string;
	/** Its install page. */
	readonly url: string;
	/** Whether it can run on local models (Ollama, LM Studio). */
	readonly localModels?: boolean;
}

const CODING_AGENTS: readonly ICodingAgent[] = [
	{ label: 'Claude Code', command: 'claude {prompt}', url: 'https://claude.com/claude-code' },
	{ label: 'Codex', command: 'codex {prompt}', url: 'https://developers.openai.com/codex/cli' },
	{ label: 'Gemini CLI', command: 'gemini -i {prompt}', url: 'https://geminicli.com' },
	{ label: 'GitHub Copilot CLI', command: 'copilot -i {prompt}', url: 'https://github.com/features/copilot/cli' },
	{ label: 'Cursor Agent', command: 'cursor-agent {prompt}', url: 'https://cursor.com/cli' },
	{ label: 'OpenCode', command: 'opencode --prompt {prompt}', url: 'https://opencode.ai', localModels: true },
	{ label: 'Goose', command: 'goose run -s -t {prompt}', url: 'https://github.com/block/goose', localModels: true },
];

/** A skill of the Pollis Agents plugin. */
interface IPollisSkill {
	/** Its folder in the plugin's `skills/` folder. */
	readonly folder: string;
	/** The terminal's name. */
	readonly title: string;
	/** The first message to the agent, given the paths of the skill's SKILL.md and of the request file. */
	readonly prompt: (skillFile: string, requestFile: string) => string;
	/** Whether the skill works on the request file open in the editor; the agent then starts in the file's folder. */
	readonly request?: boolean;
}

const CREATE_PANEL: IPollisSkill = {
	folder: 'create-panel',
	title: localize('pollisAgents.createPanel.terminal', "Create a Panel"),
	prompt: skillFile => localize('pollisAgents.createPanel.prompt', "Read the skill {0} and follow its instructions to create a new Pollis panel with me.", skillFile),
};

const CREATE_PANELS_FROM_REQUEST: IPollisSkill = {
	folder: 'create-panel',
	title: localize('pollisAgents.createPanelsFromRequest.terminal', "Create Panels from a Request"),
	prompt: (skillFile, requestFile) => localize('pollisAgents.createPanelsFromRequest.prompt', "Read the skill {0} and follow its instructions to create the panels of the request file {1}, without asking me questions.", skillFile, requestFile),
	request: true,
};

const PACKAGE_TOOLBOX: IPollisSkill = {
	folder: 'package-toolbox',
	title: localize('pollisAgents.packageToolbox.terminal', "Package a Toolbox"),
	prompt: skillFile => localize('pollisAgents.packageToolbox.prompt', "Read the skill {0} and follow its instructions to package a Pollis toolbox with me.", skillFile),
};

// A request file calls toolbox(...) and panel(...) in Julia, or has [toolbox] and [[panel]] tables in TOML
const REQUEST_PATTERN = /^\s*(?:(?:toolbox|panel)\s*\(|\[\[panel\]\])/m;

const REQUEST_TEMPLATE = [
	'# Pollis panel request: the panels you want, one panel(...) for each. Fill it in, then choose',
	'# Compose > Pollis Agents > Create Panels from a Request... with this file open.',
	'',
	'# The toolbox the panels go in. name: pollis-toolbox- then lower case letters, digits and hyphens.',
	'toolbox(name = "pollis-toolbox-mycourse", displayName = "My Course", author = "Your Name")',
	'',
	'# topic, and methods (1 to 8: the tabs of the panel). Optional: audience ("students", "research"...),',
	'# packages (the Julia packages to use), menu (Compose, Explore, Model, Simulate or Optimise,',
	'# then " > " and the title of a submenu), notes (anything else the agent should know).',
	'panel(topic = "Scatterplot smoothing", audience = "students",',
	'      methods = ["LOESS", "Smoothing splines"],',
	'      menu = "Model > My Course")',
	'',
	'# Many panels at once: a loop.',
	'# for (topic, methods) in ["Kernel density estimation" => ["Gaussian kernel", "Epanechnikov kernel"],',
	'#                          "Quantile regression" => ["Linear quantile regression"]]',
	'#     panel(topic = topic, audience = "students", methods = methods, menu = "Model > My Course")',
	'# end',
	'',
].join('\n');

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'pollisAgents',
	title: localize('pollisAgents.configurationTitle', "Pollis Agents"),
	type: 'object',
	properties: {
		[AGENT_COMMAND_SETTING]: {
			type: 'string',
			default: '',
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('pollisAgents.command', "The command that starts the coding agent for Pollis Agents (Compose menu), with `{prompt}` where the first message goes, for example `claude {prompt}` or `opencode --prompt {prompt}`. Without `{prompt}`, the message is copied to the clipboard to paste into the agent. Empty: Pollis asks which agent to use. Use **Pollis Agents: Choose Coding Agent...** to change it."),
		},
	},
});

/** The words of a command line; a word in double quotes may contain spaces. */
function commandWords(command: string): string[] {
	return (command.match(/"[^"]*"|\S+/g) ?? []).map(word => word.replace(/^"(.*)"$/, '$1'));
}

/** The environment the terminal starts programs with, for its PATH. */
async function terminalEnvironment(terminalInstanceService: ITerminalInstanceService): Promise<IProcessEnvironment> {
	const backend = await terminalInstanceService.getBackend();
	return (await backend?.getShellEnvironment()) ?? (await backend?.getEnvironment()) ?? {};
}

/** The full path of a program, looked for in the PATH like a shell does; undefined when it is not there. */
async function findProgram(program: string, environment: IProcessEnvironment, fileService: IFileService): Promise<string | undefined> {
	const extensions = isWindows ? ['.exe', '.cmd', '.bat', ''] : [''];
	if (/[\\/]/.test(program)) {
		for (const extension of extensions) {
			if (await fileService.exists(URI.file(program + extension))) {
				return program + extension;
			}
		}
		return undefined;
	}
	const pathKey = Object.keys(environment).find(key => key.toUpperCase() === 'PATH');
	const folders = (pathKey ? environment[pathKey] ?? '' : '').split(isWindows ? ';' : ':').filter(folder => folder);
	for (const folder of folders) {
		for (const extension of extensions) {
			const candidate = join(folder, program + extension);
			if (await fileService.exists(URI.file(candidate))) {
				return candidate;
			}
		}
	}
	return undefined;
}

interface IAgentPickItem extends IQuickPickItem {
	readonly command?: string;
}

/** Asks which coding agent to use, marking the ones found on this computer, and saves the answer. */
async function chooseAgent(accessor: ServicesAccessor): Promise<string | undefined> {
	const quickInputService = accessor.get(IQuickInputService);
	const configurationService = accessor.get(IConfigurationService);
	const fileService = accessor.get(IFileService);
	const environment = await terminalEnvironment(accessor.get(ITerminalInstanceService));

	const current = configurationService.getValue<string>(AGENT_COMMAND_SETTING) ?? '';
	const items: (IAgentPickItem | IQuickPickSeparator)[] = [];
	for (const agent of CODING_AGENTS) {
		const found = await findProgram(commandWords(agent.command)[0], environment, fileService);
		items.push({
			label: agent.label,
			description: found ? localize('pollisAgents.found', "installed") : localize('pollisAgents.notFound', "not found on this computer"),
			detail: agent.localModels ? localize('pollisAgents.localModels', "Can also run on local models (Ollama, LM Studio)") : undefined,
			command: agent.command,
			picked: agent.command === current,
		});
	}
	items.push({ type: 'separator' });
	items.push({ label: localize('pollisAgents.other', "Other Command..."), description: CODING_AGENTS.some(agent => agent.command === current) ? undefined : current || undefined });

	const pick = await quickInputService.pick(items, {
		title: localize('pollisAgents.choose.title', "Coding Agent for Pollis Agents"),
		placeHolder: localize('pollisAgents.choose.placeholder', "Pick the coding agent that runs the Pollis Agents skills"),
	});
	if (!pick) {
		return undefined;
	}
	const command = pick.command ?? (await quickInputService.input({
		title: localize('pollisAgents.other.title', "Command That Starts the Coding Agent"),
		prompt: localize('pollisAgents.other.prompt', "Write {0} where the first message goes, for example: aider --message {0}. Without it, the message is copied to the clipboard.", PROMPT_PLACEHOLDER),
		value: CODING_AGENTS.some(agent => agent.command === current) ? '' : current,
		validateInput: async value => value.trim() ? undefined : localize('pollisAgents.other.empty', "Write the command."),
	}))?.trim();
	if (!command) {
		return undefined;
	}
	await configurationService.updateValue(AGENT_COMMAND_SETTING, command);
	return command;
}

/** Downloads the plugin's files (the list in its files.json) into a folder, replacing the old copies. */
async function downloadPlugin(requestService: IRequestService, fileService: IFileService, folder: URI): Promise<void> {
	const get = async (file: string) => {
		const context = await requestService.request({ type: 'GET', url: `${PLUGIN_URL}/${file}`, callSite: 'pollisAgents.download' }, CancellationToken.None);
		if (!isSuccess(context)) {
			throw new Error(localize('pollisAgents.downloadFailed', "The download of {0} failed (server returned {1}).", file, context.res.statusCode ?? '?'));
		}
		return context;
	};
	const list = await asJson<{ files?: unknown }>(await get('files.json'));
	const files = Array.isArray(list?.files) ? list.files.filter((file): file is string => typeof file === 'string' && /^[\w-]+(\.[\w-]+)*(\/[\w-]+(\.[\w-]+)*)*$/.test(file)) : [];
	if (!files.length) {
		throw new Error(localize('pollisAgents.noFiles', "The Pollis Agents plugin lists no files."));
	}
	for (const file of files) {
		await fileService.writeFile(joinPath(folder, ...file.split('/')), (await get(file)).stream);
	}
}

/** The request file shown in the active editor, saved first; undefined when the active editor shows none. */
async function activeRequestFile(editorService: IEditorService, textFileService: ITextFileService, fileService: IFileService): Promise<URI | undefined> {
	const resource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
	if (resource?.scheme !== Schemas.file || !/\.(jl|toml)$/i.test(resource.path)) {
		return undefined;
	}
	if (textFileService.isDirty(resource)) {
		await textFileService.save(resource);
	}
	return REQUEST_PATTERN.test((await fileService.readFile(resource)).value.toString()) ? resource : undefined;
}

/** Starts the chosen coding agent in a terminal, with a first message that points it at the skill. */
async function runSkill(accessor: ServicesAccessor, skill: IPollisSkill): Promise<void> {
	const configurationService = accessor.get(IConfigurationService);
	const notificationService = accessor.get(INotificationService);
	const fileService = accessor.get(IFileService);
	const requestService = accessor.get(IRequestService);
	const progressService = accessor.get(IProgressService);
	const terminalService = accessor.get(ITerminalService);
	const terminalInstanceService = accessor.get(ITerminalInstanceService);
	const clipboardService = accessor.get(IClipboardService);
	const openerService = accessor.get(IOpenerService);
	const workspaceContextService = accessor.get(IWorkspaceContextService);
	const pathService = accessor.get(IPathService);
	const commandService = accessor.get(ICommandService);
	const editorService = accessor.get(IEditorService);
	const textFileService = accessor.get(ITextFileService);

	const workspaceFolder = workspaceContextService.getWorkspace().folders.find(folder => folder.uri.scheme === Schemas.file)?.uri;
	let requestFile: URI | undefined;
	if (skill.request) {
		requestFile = await activeRequestFile(editorService, textFileService, fileService);
		if (!requestFile) {
			// No request open: open panels.jl in the workspace folder, from the template when it is new
			const template = joinPath(workspaceFolder ?? pathService.userHome({ preferLocal: true }), 'panels.jl');
			if (!await fileService.exists(template)) {
				await fileService.writeFile(template, VSBuffer.fromString(REQUEST_TEMPLATE));
			}
			await editorService.openEditor({ resource: template });
			notificationService.info(localize('pollisAgents.request.fill', "Write the panels you want in {0}, then choose Create Panels from a Request... again with it open.", template.fsPath));
			return;
		}
	}

	let command: string | undefined = configurationService.getValue<string>(AGENT_COMMAND_SETTING)?.trim();
	if (!command) {
		command = await commandService.executeCommand<string>(CHOOSE_AGENT_COMMAND_ID);
		if (!command) {
			return;
		}
	}
	const [program, ...args] = commandWords(command);
	const environment = await terminalEnvironment(terminalInstanceService);
	const executable = await findProgram(program, environment, fileService);
	if (!executable) {
		const agent = CODING_AGENTS.find(agent => commandWords(agent.command)[0] === program);
		notificationService.prompt(Severity.Error, localize('pollisAgents.missing', "The coding agent '{0}' was not found on this computer. Install it, or choose another one.", agent?.label ?? program), [
			...(agent ? [{ label: localize('pollisAgents.install', "Open Install Page"), run: () => openerService.open(URI.parse(agent.url)) }] : []),
			{ label: localize('pollisAgents.chooseAction', "Choose Coding Agent"), run: () => commandService.executeCommand(CHOOSE_AGENT_COMMAND_ID) },
		]);
		return;
	}

	const pluginFolder = joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'agents', 'pollis-agents');
	const skillFile = joinPath(pluginFolder, 'skills', skill.folder, 'SKILL.md');
	try {
		await progressService.withProgress({ location: ProgressLocation.Notification, title: localize('pollisAgents.downloading', "Getting the Pollis Agents skills...") }, () => downloadPlugin(requestService, fileService, pluginFolder));
	} catch (error) {
		if (!await fileService.exists(skillFile)) {
			notificationService.error(localize('pollisAgents.downloadError', "Could not get the Pollis Agents skills: {0}", toErrorMessage(error)));
			return;
		}
		notificationService.warn(localize('pollisAgents.offline', "Could not update the Pollis Agents skills ({0}); using the copy from last time.", toErrorMessage(error)));
	}

	const prompt = skill.prompt(skillFile.fsPath, requestFile?.fsPath ?? '');
	const hasPlaceholder = args.includes(PROMPT_PLACEHOLDER);
	const agentArgs = args.map(arg => arg === PROMPT_PLACEHOLDER ? prompt : arg);
	// A Windows batch file (an npm-installed agent) runs through the command interpreter
	const batch = isWindows && /\.(cmd|bat)$/i.test(executable);
	const instance = await terminalService.createTerminal({
		config: {
			name: localize('pollisAgents.terminalName', "Pollis Agents: {0}", skill.title),
			executable: batch ? (environment['ComSpec'] ?? 'cmd.exe') : executable,
			args: batch ? ['/d', '/c', executable, ...agentArgs] : agentArgs,
			cwd: (requestFile && dirname(requestFile)) ?? workspaceFolder ?? pathService.userHome({ preferLocal: true }),
			waitOnExit: true,
		},
	});
	terminalService.setActiveInstance(instance);
	await terminalService.revealTerminal(instance);
	await instance.focusWhenReady(true);
	if (!hasPlaceholder) {
		await clipboardService.writeText(prompt);
		notificationService.info(localize('pollisAgents.paste', "The first message for the agent is in the clipboard: paste it into the agent to start."));
	}
}

const category = localize2('pollisAgents.category', "Pollis Agents");

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: CREATE_PANEL_COMMAND_ID,
			title: localize2('pollisAgents.createPanel', "Create a Panel..."),
			category,
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return runSkill(accessor, CREATE_PANEL);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: CREATE_PANELS_FROM_REQUEST_COMMAND_ID,
			title: localize2('pollisAgents.createPanelsFromRequest', "Create Panels from a Request..."),
			category,
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return runSkill(accessor, CREATE_PANELS_FROM_REQUEST);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: PACKAGE_TOOLBOX_COMMAND_ID,
			title: localize2('pollisAgents.packageToolbox', "Package a Toolbox..."),
			category,
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return runSkill(accessor, PACKAGE_TOOLBOX);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: CHOOSE_AGENT_COMMAND_ID,
			title: localize2('pollisAgents.chooseAgent', "Choose Coding Agent..."),
			category,
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<string | undefined> {
		return chooseAgent(accessor);
	}
});
