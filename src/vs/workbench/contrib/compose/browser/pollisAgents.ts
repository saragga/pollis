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
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProgressService, ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { IQuickInputService, IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { asJson, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../../common/editor.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { ITerminalInstance, ITerminalInstanceService, ITerminalService } from '../../terminal/browser/terminal.js';

// Compose > Pollis Agents holds tasks: you go there to get something done (Create a Panel, Package a
// Toolbox, Write a Method...), and a coding agent of your choice does it in a terminal. Compose > Pollis
// Skills is the library of the skills those tasks use: read them, run one with your agent, or install
// them in Claude Code. Create Panels from a Request runs Create a Panel on the request file open in the
// editor, which lists the panels to write, with no questions asked. The skills and their scripts come
// from the Pollis Agents plugin, Trumpingtons/pollis-plugins (plugins/pollis-agents, its files listed in
// files.json), downloaded to ~/.pollis/agents/pollis-agents each time a skill starts. The agent is
// started with a first message that points it at the skill's SKILL.md, so any agent that reads files and
// runs commands can follow it, whether on a cloud model or a local one. Tasks without a skill (those of
// New Methods) start the agent with their own first message (startAgent).

const PLUGIN_URL = 'https://raw.githubusercontent.com/Trumpingtons/pollis-plugins/main/plugins/pollis-agents';

export const AGENT_COMMAND_SETTING = 'pollis.agents.command';
export const PROMPT_PLACEHOLDER = '{prompt}';

// The commands of Compose > Pollis Agents (the menu itself is in compose.contribution.ts)
export const CREATE_PANEL_COMMAND_ID = 'pollis.agents.createPanel';
export const CREATE_PANELS_FROM_REQUEST_COMMAND_ID = 'pollis.agents.createPanelsFromRequest';
export const PACKAGE_TOOLBOX_COMMAND_ID = 'pollis.agents.packageToolbox';
export const CHOOSE_AGENT_COMMAND_ID = 'pollis.agents.chooseAgent';

// The commands of Compose > Pollis Skills
export const BROWSE_SKILLS_COMMAND_ID = 'pollis.skills.browse';
export const INSTALL_SKILLS_COMMAND_ID = 'pollis.skills.install';

// The Pollis Agents plugin in its Claude Code marketplace
const MARKETPLACE = 'Trumpingtons/pollis-plugins';
const PLUGIN_ID = 'pollis-agents@pollis';

/** A coding agent Pollis knows how to start with a first message, on a cloud model or a local one. */
export interface ICodingAgent {
	readonly label: string;
	/** The command line that starts it, with `{prompt}` where the first message goes. */
	readonly command: string;
	/** Its install page. */
	readonly url: string;
	/** The command line that starts it on a local model, when that takes another command. */
	readonly localCommand?: string;
}

export const CODING_AGENTS: readonly ICodingAgent[] = [
	{ label: 'Claude Code', command: 'claude {prompt}', url: 'https://claude.com/claude-code', localCommand: 'ollama launch claude -- {prompt}' },
	{ label: 'Codex', command: 'codex {prompt}', url: 'https://developers.openai.com/codex/cli', localCommand: 'codex --oss {prompt}' },
	{ label: 'GitHub Copilot CLI', command: 'copilot -i {prompt}', url: 'https://github.com/features/copilot/cli', localCommand: 'ollama launch copilot -- -i {prompt}' },
	{ label: 'OpenCode', command: 'opencode --prompt {prompt}', url: 'https://opencode.ai', localCommand: 'ollama launch opencode -- --prompt {prompt}' },
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
			markdownDescription: localize('pollisAgents.command', "The command that starts the coding agent for the Compose menu (Pollis Agents, Orchestration, Reports), with `{prompt}` where the first message goes, for example `claude {prompt}` or `opencode --prompt {prompt}`. Without `{prompt}`, the message is copied to the clipboard to paste into the agent. Empty: Pollis opens the Coding Agent page to choose one. Use **Compose > Choose Coding Agent...** to change it."),
		},
	},
});

/** The words of a command line; a word in double quotes may contain spaces. */
export function commandWords(command: string): string[] {
	return (command.match(/"[^"]*"|\S+/g) ?? []).map(word => word.replace(/^"(.*)"$/, '$1'));
}

/** The environment the terminal starts programs with, for its PATH. */
export async function terminalEnvironment(terminalInstanceService: ITerminalInstanceService): Promise<IProcessEnvironment> {
	const backend = await terminalInstanceService.getBackend();
	return (await backend?.getShellEnvironment()) ?? (await backend?.getEnvironment()) ?? {};
}

/** The full path of a program, looked for in the PATH like a shell does; undefined when it is not there. */
export async function findProgram(program: string, environment: IProcessEnvironment, fileService: IFileService): Promise<string | undefined> {
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

/** The folder the Pollis Agents plugin is downloaded to. */
function pluginFolder(pathService: IPathService): URI {
	return joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'agents', 'pollis-agents');
}

/** Downloads the latest skills, falling back to the copy from last time; false when there is none. */
async function updateSkills(accessor: ServicesAccessor): Promise<boolean> {
	const notificationService = accessor.get(INotificationService);
	const fileService = accessor.get(IFileService);
	const requestService = accessor.get(IRequestService);
	const progressService = accessor.get(IProgressService);
	const folder = pluginFolder(accessor.get(IPathService));
	try {
		await progressService.withProgress({ location: ProgressLocation.Notification, title: localize('pollisAgents.downloading', "Getting the Pollis Agents skills...") }, () => downloadPlugin(requestService, fileService, folder));
	} catch (error) {
		if (!await fileService.exists(joinPath(folder, 'files.json'))) {
			notificationService.error(localize('pollisAgents.downloadError', "Could not get the Pollis Agents skills: {0}", toErrorMessage(error)));
			return false;
		}
		notificationService.warn(localize('pollisAgents.offline', "Could not update the Pollis Agents skills ({0}); using the copy from last time.", toErrorMessage(error)));
	}
	return true;
}

/**
 * Starts the chosen coding agent in a terminal with a first message; when none is chosen yet, it opens the
 * Coding Agent page instead. `command` overrides the chosen agent's command line (Reports' cheaper agent). The
 * agent starts in `cwd`, else the first workspace folder, else the home folder. Returns its terminal, or
 * `undefined` when no agent started.
 */
export async function startAgent(accessor: ServicesAccessor, title: string, prompt: string, cwd?: URI, command?: string): Promise<ITerminalInstance | undefined> {
	const configurationService = accessor.get(IConfigurationService);
	const notificationService = accessor.get(INotificationService);
	const fileService = accessor.get(IFileService);
	const terminalService = accessor.get(ITerminalService);
	const terminalInstanceService = accessor.get(ITerminalInstanceService);
	const clipboardService = accessor.get(IClipboardService);
	const openerService = accessor.get(IOpenerService);
	const workspaceContextService = accessor.get(IWorkspaceContextService);
	const pathService = accessor.get(IPathService);
	const commandService = accessor.get(ICommandService);

	command = command?.trim() || configurationService.getValue<string>(AGENT_COMMAND_SETTING)?.trim();
	if (!command) {
		notificationService.info(localize('pollisAgents.chooseFirst', "Choose the coding agent Pollis starts, then run {0} again.", title));
		await commandService.executeCommand(CHOOSE_AGENT_COMMAND_ID);
		return undefined;
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
		return undefined;
	}

	const hasPlaceholder = args.includes(PROMPT_PLACEHOLDER);
	const agentArgs = args.map(arg => arg === PROMPT_PLACEHOLDER ? prompt : arg);
	// A Windows batch file (an npm-installed agent) runs through the command interpreter
	const batch = isWindows && /\.(cmd|bat)$/i.test(executable);
	const instance = await terminalService.createTerminal({
		config: {
			name: localize('pollisAgents.terminalName', "Pollis Agents: {0}", title),
			executable: batch ? (environment['ComSpec'] ?? 'cmd.exe') : executable,
			args: batch ? ['/d', '/c', executable, ...agentArgs] : agentArgs,
			cwd: cwd ?? workspaceContextService.getWorkspace().folders.find(folder => folder.uri.scheme === Schemas.file)?.uri ?? pathService.userHome({ preferLocal: true }),
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
	return instance;
}

/** Starts the chosen coding agent in a terminal, with a first message that points it at the skill. */
async function runSkill(accessor: ServicesAccessor, skill: IPollisSkill): Promise<void> {
	const notificationService = accessor.get(INotificationService);
	const fileService = accessor.get(IFileService);
	const workspaceContextService = accessor.get(IWorkspaceContextService);
	const pathService = accessor.get(IPathService);
	const editorService = accessor.get(IEditorService);
	const textFileService = accessor.get(ITextFileService);
	const instantiationService = accessor.get(IInstantiationService);

	let requestFile: URI | undefined;
	if (skill.request) {
		requestFile = await activeRequestFile(editorService, textFileService, fileService);
		if (!requestFile) {
			// No request open: open panels.jl in the workspace folder, from the template when it is new
			const workspaceFolder = workspaceContextService.getWorkspace().folders.find(folder => folder.uri.scheme === Schemas.file)?.uri;
			const template = joinPath(workspaceFolder ?? pathService.userHome({ preferLocal: true }), 'panels.jl');
			if (!await fileService.exists(template)) {
				await fileService.writeFile(template, VSBuffer.fromString(REQUEST_TEMPLATE));
			}
			await editorService.openEditor({ resource: template });
			notificationService.info(localize('pollisAgents.request.fill', "Write the panels you want in {0}, then choose Create Panels from a Request... again with it open.", template.fsPath));
			return;
		}
	}

	if (!await instantiationService.invokeFunction(updateSkills)) {
		return;
	}
	const skillFile = joinPath(pluginFolder(pathService), 'skills', skill.folder, 'SKILL.md');
	const prompt = skill.prompt(skillFile.fsPath, requestFile?.fsPath ?? '');
	await instantiationService.invokeFunction(startAgent, skill.title, prompt, requestFile && dirname(requestFile));
}

/** A skill in the downloaded plugin, as its SKILL.md describes it. */
interface ISkillInfo {
	readonly name: string;
	readonly description: string;
	readonly file: URI;
}

/** The skills of the downloaded plugin, from the front matter of their SKILL.md files. */
async function readSkills(fileService: IFileService, folder: URI): Promise<ISkillInfo[]> {
	const skills: ISkillInfo[] = [];
	const stat = await fileService.resolve(joinPath(folder, 'skills'));
	for (const child of stat.children ?? []) {
		const file = joinPath(child.resource, 'SKILL.md');
		if (!child.isDirectory || !await fileService.exists(file)) {
			continue;
		}
		const text = (await fileService.readFile(file)).value.toString();
		const frontMatter = /^---\r?\n(?<body>[\s\S]*?)\r?\n---/.exec(text)?.groups?.body ?? '';
		const field = (key: string) => new RegExp(`^${key}:\\s*"?(?<value>.*?)"?\\s*$`, 'm').exec(frontMatter)?.groups?.value;
		skills.push({ name: field('name') ?? child.name, description: field('description') ?? '', file });
	}
	return skills.sort((a, b) => a.name.localeCompare(b.name));
}

interface ISkillPickItem extends IQuickPickItem {
	readonly skill: ISkillInfo;
}

interface ISkillActionItem extends IQuickPickItem {
	readonly run: () => Promise<unknown>;
}

/** Lists the skills; for the one picked, shows it or runs it with the chosen coding agent. */
async function browseSkills(accessor: ServicesAccessor): Promise<void> {
	const quickInputService = accessor.get(IQuickInputService);
	const fileService = accessor.get(IFileService);
	const editorService = accessor.get(IEditorService);
	const instantiationService = accessor.get(IInstantiationService);
	const folder = pluginFolder(accessor.get(IPathService));

	if (!await instantiationService.invokeFunction(updateSkills)) {
		return;
	}
	const pick = await quickInputService.pick<ISkillPickItem>((await readSkills(fileService, folder)).map(skill => ({
		label: skill.name,
		detail: skill.description.replace(/\s*Triggers include.*$/, ''),
		skill,
	})), {
		title: localize('pollisSkills.browse.title', "Pollis Skills"),
		placeHolder: localize('pollisSkills.browse.placeholder', "A skill is the know-how a coding agent reads to do a task; the Pollis Agents tasks use these"),
		matchOnDetail: true,
	});
	if (!pick) {
		return;
	}
	const skill = pick.skill;
	const action = await quickInputService.pick<ISkillActionItem>([
		{ label: localize('pollisSkills.view', "View Skill"), detail: localize('pollisSkills.viewDetail', "Opens its SKILL.md"), run: () => editorService.openEditor({ resource: skill.file }) },
		{
			label: localize('pollisSkills.run', "Run with My Agent"),
			detail: localize('pollisSkills.runDetail', "Starts your coding agent with this skill, to do its task with you"),
			run: () => instantiationService.invokeFunction(startAgent, skill.name, localize('pollisSkills.runPrompt', "Read the skill {0} and follow its instructions with me.", skill.file.fsPath)),
		},
	], { title: skill.name });
	await action?.run();
}

/** Installs the Pollis Agents plugin in Claude Code from its marketplace, in a terminal. */
async function installSkills(accessor: ServicesAccessor): Promise<void> {
	const terminalService = accessor.get(ITerminalService);
	const dialogService = accessor.get(IDialogService);
	const { confirmed } = await dialogService.confirm({
		message: localize('pollisSkills.install.confirm', "Install the Pollis skills in Claude Code?"),
		detail: localize('pollisSkills.install.detail', "Claude Code then uses them in any folder, without going through Pollis. Pollis runs them with any coding agent without installing them. This adds the marketplace {0} and installs the plugin {1}.", MARKETPLACE, PLUGIN_ID),
		primaryButton: localize({ key: 'pollisSkills.install.button', comment: ['&& denotes a mnemonic'] }, "&&Install"),
	});
	if (!confirmed) {
		return;
	}
	const instance = await terminalService.createTerminal({ config: { name: localize('pollisSkills.install.terminal', "Install Pollis Skills") } });
	terminalService.setActiveInstance(instance);
	await terminalService.revealTerminal(instance);
	await instance.sendText(`claude plugin marketplace add ${MARKETPLACE} && claude plugin install ${PLUGIN_ID}`, true);
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
			id: BROWSE_SKILLS_COMMAND_ID,
			title: localize2('pollisSkills.browse', "Browse Skills..."),
			category: localize2('pollisSkills.category', "Pollis Skills"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return browseSkills(accessor);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: INSTALL_SKILLS_COMMAND_ID,
			title: localize2('pollisSkills.install', "Install in Claude Code..."),
			category: localize2('pollisSkills.category', "Pollis Skills"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return installSkills(accessor);
	}
});
