/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
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
import { ByteSize, IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProgressService, ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { asJson, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../../common/editor.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { ITerminalInstance, ITerminalInstanceService, ITerminalService } from '../../terminal/browser/terminal.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { LIBRARY_PAGE_HELPERS, LIBRARY_PAGE_STYLE } from './libraryPage.js';
import { AgentTask, agentCommandFor } from './modelRouting.js';
import { voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';

// Compose > New Panels and Toolboxes and Compose > Methods hold tasks: you go there to get something
// done (Create a Panel, Package a Toolbox, Write a Method...), and a coding agent of your choice does it in
// a terminal. Compose > Coding Agents chooses that agent and Compose > Agent Skills holds the library of the skills the tasks
// use: read them or run one with your agent; the Coding Agents page installs them in an agent. Create Panels from a Request runs Create a Panel on the request file open in the
// editor, which lists the panels to write, with no questions asked. The skills and their scripts come
// from the Pollis Agents plugin, Trumpingtons/pollis-skills (plugins/pollis-agents, its files listed in
// files.json), downloaded to ~/.pollis/agents/pollis-agents each time a skill starts. The agent is
// started with a first message that points it at the skill's SKILL.md, so any agent that reads files and
// runs commands can follow it, whether on a cloud model or a local one. The Methods tasks (Write a
// Method, Write a Vignette, Prepare for Registration, in newMethods.ts, buttons on each
// method's page) give the agent the method's folder and its test command beside the skill (skillFile).

const PLUGIN_URL = 'https://raw.githubusercontent.com/Trumpingtons/pollis-skills/main/plugins/pollis-agents';

export const AGENT_COMMAND_SETTING = 'pollis.agents.command';
export const PROMPT_PLACEHOLDER = '{prompt}';

// The commands of the agent tasks (the menus themselves are in compose.contribution.ts)
export const CREATE_PANEL_COMMAND_ID = 'pollis.agents.createPanel';
export const CREATE_PANELS_FROM_REQUEST_COMMAND_ID = 'pollis.agents.createPanelsFromRequest';
export const PACKAGE_TOOLBOX_COMMAND_ID = 'pollis.agents.packageToolbox';
export const WRITE_METHOD_COMMAND_ID = 'pollis.newMethods.writeMethod';
export const PREPARE_REGISTRATION_COMMAND_ID = 'pollis.newMethods.prepareRegistration';
export const WRITE_VIGNETTE_COMMAND_ID = 'pollis.newMethods.writeVignette';
export const CHOOSE_AGENT_COMMAND_ID = 'pollis.agents.chooseAgent';

// The commands of Compose > Coding Agents and Agent Skills
export const BROWSE_SKILLS_COMMAND_ID = 'pollis.skills.browse';
/** Starts the coding agent on a skill of the plugin, given its folder and title, from the pages that offer one. */
export const RUN_SKILL_COMMAND_ID = 'pollis.skills.run';

// The Pollis Agents plugin in its Claude Code marketplace, and the file that marks a skill folder Pollis installed in another agent
const MARKETPLACE = 'Trumpingtons/pollis-skills';
const PLUGIN_ID = 'pollis-agents@pollis';
const INSTALLED_MARKER = '.pollis-skill';

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
	/** The task, for its tier in Model Routing. */
	readonly task: AgentTask;
}

const CREATE_PANEL: IPollisSkill = {
	folder: 'create-panel',
	title: localize('pollisAgents.createPanel.terminal', "Create a Panel"),
	task: 'createPanel',
	prompt: skillFile => localize('pollisAgents.createPanel.prompt', "Read the skill {0} and follow its instructions to create a new Pollis panel with me.", skillFile),
};

const CREATE_PANELS_FROM_REQUEST: IPollisSkill = {
	folder: 'create-panel',
	title: localize('pollisAgents.createPanelsFromRequest.terminal', "Create Panels from a Request"),
	prompt: (skillFile, requestFile) => localize('pollisAgents.createPanelsFromRequest.prompt', "Read the skill {0} and follow its instructions to create the panels of the request file {1}, without asking me questions.", skillFile, requestFile),
	request: true,
	task: 'createPanelsFromRequest',
};

const PACKAGE_TOOLBOX: IPollisSkill = {
	folder: 'package-toolbox',
	title: localize('pollisAgents.packageToolbox.terminal', "Package a Toolbox"),
	task: 'packageToolbox',
	prompt: skillFile => localize('pollisAgents.packageToolbox.prompt', "Read the skill {0} and follow its instructions to package a Pollis toolbox with me.", skillFile),
};

// A request file calls toolbox(...) and panel(...) in Julia, or has [toolbox] and [[panel]] tables in TOML
const REQUEST_PATTERN = /^\s*(?:(?:toolbox|panel)\s*\(|\[\[panel\]\])/m;

const REQUEST_TEMPLATE = [
	'# Pollis panel request: the panels you want, one panel(...) for each. Fill it in, then choose',
	'# Compose > New Panels and Toolboxes > Create Panels from a Request... with this file open.',
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
			markdownDescription: localize('pollisAgents.command', "The command that starts the coding agent for the agent tasks of the Compose menu, with `{prompt}` where the first message goes, for example `claude {prompt}` or `opencode --prompt {prompt}`. Without `{prompt}`, the message is copied to the clipboard to paste into the agent. Empty: Pollis opens the Coding Agents page to choose one. Use **Compose > Coding Agents** to change it."),
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
 * Coding Agents page instead. A `task` runs on the command line of its tier in Model Routing, when the tier
 * has one and its program is on this computer; otherwise on the main agent, saying so when the program is
 * missing. The agent starts in `cwd`, else the first workspace folder, else the home folder. Returns its
 * terminal, or `undefined` when no agent started.
 */
export async function startAgent(accessor: ServicesAccessor, title: string, prompt: string, cwd?: URI, task?: AgentTask): Promise<ITerminalInstance | undefined> {
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

	const environment = await terminalEnvironment(terminalInstanceService);
	let command = configurationService.getValue<string>(AGENT_COMMAND_SETTING)?.trim();
	let name = title;
	const routed = task && agentCommandFor(configurationService, task);
	if (routed) {
		const routedProgram = commandWords(routed.command)[0];
		if (await findProgram(routedProgram, environment, fileService)) {
			command = routed.command;
			name = localize('pollisAgents.tierTitle', "{0} ({1})", title, routed.tier.label);
		} else if (command) {
			notificationService.info(localize('pollisAgents.tierMissing', "{0} tier: '{1}' isn't installed on this computer, so the main coding agent runs {2}.", routed.tier.label, routedProgram, title));
		}
	}
	if (!command) {
		notificationService.info(localize('pollisAgents.chooseFirst', "Choose the coding agent Pollis starts, then run {0} again.", title));
		await commandService.executeCommand(CHOOSE_AGENT_COMMAND_ID);
		return undefined;
	}
	const [program, ...args] = commandWords(command);
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
			name: localize('pollisAgents.terminalName', "Pollis Agents: {0}", name),
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
	await instantiationService.invokeFunction(startAgent, skill.title, prompt, requestFile && dirname(requestFile), skill.task);
}

/** The SKILL.md of a skill of the latest plugin, downloaded first; undefined when there is no copy at all. */
export async function skillFile(accessor: ServicesAccessor, folder: string): Promise<URI | undefined> {
	const pathService = accessor.get(IPathService);
	const instantiationService = accessor.get(IInstantiationService);
	if (!await instantiationService.invokeFunction(updateSkills)) {
		return undefined;
	}
	return joinPath(pluginFolder(pathService), 'skills', folder, 'SKILL.md');
}

/** A skill in the downloaded plugin, as its folder and its SKILL.md describe it. */
interface ISkillInfo {
	/** Its folder in the plugin's `skills/` folder, e.g. `create-panel`. */
	readonly folder: string;
	/** The first `# ` heading of its SKILL.md, e.g. `Create a Panel`; else its name. */
	readonly title: string;
	/** Its description, without the triggers. */
	readonly description: string;
	/** The requests that start it, from the `Triggers include '...'` end of its description. */
	readonly triggers: readonly string[];
	/** Its files, as paths in its folder, SKILL.md first. */
	readonly files: readonly string[];
	readonly size: string;
	/** Its folder in the downloaded plugin. */
	readonly location: URI;
}

/** The Compose tasks that run a skill, as the skills page lists them. */
const SKILL_TASKS: readonly { readonly folder: string; readonly title: string; readonly command: string }[] = [
	{ folder: CREATE_PANEL.folder, title: CREATE_PANEL.title, command: CREATE_PANEL_COMMAND_ID },
	{ folder: CREATE_PANELS_FROM_REQUEST.folder, title: CREATE_PANELS_FROM_REQUEST.title, command: CREATE_PANELS_FROM_REQUEST_COMMAND_ID },
	{ folder: PACKAGE_TOOLBOX.folder, title: PACKAGE_TOOLBOX.title, command: PACKAGE_TOOLBOX_COMMAND_ID },
	{ folder: 'write-method', title: localize('pollisAgents.writeMethod.task', "Write a Method"), command: WRITE_METHOD_COMMAND_ID },
	{ folder: 'write-vignette', title: localize('pollisAgents.writeVignette.task', "Write a Vignette"), command: WRITE_VIGNETTE_COMMAND_ID },
	{ folder: 'prepare-method', title: localize('pollisAgents.prepareRegistration.task', "Prepare for Registration"), command: PREPARE_REGISTRATION_COMMAND_ID },
];

/** The skills of the downloaded plugin, from their folders and the front matter and heading of their SKILL.md files. */
async function readSkills(fileService: IFileService, folder: URI): Promise<ISkillInfo[]> {
	const skills: ISkillInfo[] = [];
	const stat = await fileService.resolve(joinPath(folder, 'skills'));
	for (const child of stat.children ?? []) {
		const file = joinPath(child.resource, 'SKILL.md');
		if (!child.isDirectory || !await fileService.exists(file)) {
			continue;
		}
		const text = (await fileService.readFile(file)).value.toString();
		const parts = /^---\r?\n(?<frontMatter>[\s\S]*?)\r?\n---(?<body>[\s\S]*)$/.exec(text)?.groups;
		const field = (key: string) => new RegExp(`^${key}:\\s*"?(?<value>.*?)"?\\s*$`, 'm').exec(parts?.frontMatter ?? '')?.groups?.value;
		const [description, triggers = ''] = (field('description') ?? '').split(/\s*Triggers include\s*/);

		const files: { path: string; size: number }[] = [];
		const walk = async (resource: URI, prefix: string): Promise<void> => {
			for (const entry of (await fileService.resolve(resource, { resolveMetadata: true })).children ?? []) {
				if (entry.isDirectory) {
					await walk(entry.resource, `${prefix}${entry.name}/`);
				} else {
					files.push({ path: prefix + entry.name, size: entry.size });
				}
			}
		};
		await walk(child.resource, '');
		files.sort((a, b) => a.path === 'SKILL.md' ? -1 : b.path === 'SKILL.md' ? 1 : a.path.localeCompare(b.path));

		skills.push({
			folder: child.name,
			title: /^# (?<title>.+)$/m.exec(parts?.body ?? text)?.groups?.title.trim() ?? field('name') ?? child.name,
			description,
			triggers: [...triggers.matchAll(/'(?<trigger>[^']+)'/g)].map(match => match.groups!.trigger),
			files: files.map(entry => entry.path),
			size: ByteSize.formatSize(files.reduce((total, entry) => total + entry.size, 0)),
			location: child.resource,
		});
	}
	return skills.sort((a, b) => a.title.localeCompare(b.title));
}

type SkillsMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'view'; readonly folder: string; readonly path: string }
	| { readonly command: 'run'; readonly folder: string }
	| { readonly command: 'task'; readonly id: string }
	| { readonly command: 'codingAgent' };

/** The open skills page, so a second request shows the same page. */
let skillsPage: WebviewInput | undefined;

/**
 * Opens the skills page, in the look of the Replications and Methods libraries: a table of the
 * skills of the latest plugin, with the Compose tasks that use each, the requests that start
 * it and its files. A skill opens in the editor, or runs with the chosen coding agent.
 */
async function browseSkills(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const fileService = accessor.get(IFileService);
	const editorService = accessor.get(IEditorService);
	const commandService = accessor.get(ICommandService);
	const instantiationService = accessor.get(IInstantiationService);
	const folder = pluginFolder(accessor.get(IPathService));

	if (skillsPage && !skillsPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(skillsPage, skillsPage.group ?? -1, false);
		return;
	}
	if (!await instantiationService.invokeFunction(updateSkills)) {
		return;
	}
	const skills = await readSkills(fileService, folder);
	const title = localize('pollisSkills.browse.title', "Agent Skills");
	const webviewInput = skillsPage = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.skillsLibrary',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(skillsPageHtml(title));

	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => {
		if (skillsPage === webviewInput) {
			skillsPage = undefined;
		}
		disposables.dispose();
	}));

	disposables.add(webviewInput.webview.onMessage((e: { message: SkillsMessage }) => {
		const message = e.message;
		const skill = message.command === 'view' || message.command === 'run' ? skills.find(candidate => candidate.folder === message.folder) : undefined;
		if (message.command === 'ready') {
			webviewInput.webview.postMessage({
				command: 'entries',
				entries: skills.map(({ location, ...rest }) => ({
					...rest,
					tasks: SKILL_TASKS.filter(task => task.folder === rest.folder).map(task => ({ id: task.command, title: task.title })),
				})),
			});
		} else if (message.command === 'view' && skill?.files.includes(message.path)) {
			editorService.openEditor({ resource: joinPath(skill.location, ...message.path.split('/')) });
		} else if (message.command === 'run' && skill) {
			instantiationService.invokeFunction(startAgent, skill.title, localize('pollisSkills.runPrompt', "Read the skill {0} and follow its instructions with me.", joinPath(skill.location, 'SKILL.md').fsPath));
		} else if (message.command === 'task' && SKILL_TASKS.some(task => task.command === message.id)) {
			commandService.executeCommand(message.id);
		} else if (message.command === 'codingAgent') {
			commandService.executeCommand(CHOOSE_AGENT_COMMAND_ID);
		}
	}));
}

/** The skills page: its texts come from here, its entries from the `entries` message. */
function skillsPageHtml(title: string): string {
	const text = {
		skill: localize('pollisSkills.skill', "Skill"),
		tasks: localize('pollisSkills.tasks', "Tasks"),
		requests: localize('pollisSkills.requests', "Example Requests"),
		files: localize('pollisSkills.files', "Files"),
		size: localize('pollisSkills.size', "Size"),
		view: localize('pollisSkills.view', "View Skill"),
		run: localize('pollisSkills.run', "Run with My Agent"),
		noTask: localize('pollisSkills.noTask', "None: run it with your agent"),
		moreRequests: localize('pollisSkills.moreRequests', "{0} more"),
		more: localize('pollisSkills.more', "more"),
		less: localize('pollisSkills.less', "less"),
	};
	const intro = localize('pollisSkills.intro', "A skill is the know-how a coding agent reads to do a task: the agent tasks of the Compose menu use these, and any coding agent can follow them. This is the latest version of each, downloaded when the page opens. Click a name to read its {0}, or run it with your coding agent.", '<code>SKILL.md</code>');
	const installIntro = localize('pollisSkills.installIntro', "To install the skills in your coding agent, so that it uses them in any folder, even outside Pollis:");
	const installLink = localize('pollisSkills.installLink', "Compose > Coding Agents");
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		${voiceButtonsCss}
${LIBRARY_PAGE_STYLE}
	.name { width: 40%; }
	.links { margin-top: 6px; }
	.install { max-width: 900px; margin: 0 0 20px 0; padding: 12px 16px; line-height: 1.4; border-left: 3px solid var(--vscode-textLink-foreground); background: color-mix(in srgb, var(--vscode-textLink-foreground) 8%, transparent); }
	.task { display: block; margin: 0 0 4px 0; font-size: 12px; text-align: left; }
	.request::before { content: '\u201C'; }
	.request::after { content: '\u201D'; }
	</style>
</head>
<body>
<div class="container">
	<div class="title-row">
		<h1>${title}</h1>
		${voiceButtonsHtml}
	</div>
	<p class="subtitle">${intro}</p>
	<div class="install">${installIntro} <button class="link" id="codingAgent">${installLink}</button></div>
	<table>
		<thead><tr>
			<th>${text.skill}</th><th>${text.tasks}</th><th>${text.requests}</th><th>${text.files}</th><th>${text.size}</th>
		</tr></thead>
		<tbody id="entries"></tbody>
	</table>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	const TEXT = ${JSON.stringify(text)};
	/** A skill with more example requests than this shows the rest on request. */
	const LISTED = 4;
	const body = document.getElementById('entries');
	document.getElementById('codingAgent').addEventListener('click', () => vscode.postMessage({ command: 'codingAgent' }));

${LIBRARY_PAGE_HELPERS}

	function nameCell(row, skill) {
		const td = cell(row, 'name');
		const title = element('div', 'title', skill.title);
		title.addEventListener('click', () => vscode.postMessage({ command: 'view', folder: skill.folder, path: 'SKILL.md' }));
		td.appendChild(title);
		td.appendChild(element('div', 'file', skill.folder + '/SKILL.md'));
		const description = element('p', 'description clamped', skill.description);
		td.appendChild(description);
		// The toggle shows only when the description is longer than its three lines
		const toggle = link(TEXT.more, () => {
			const clamped = description.classList.toggle('clamped');
			toggle.textContent = clamped ? TEXT.more : TEXT.less;
		});
		toggle.classList.add('small');
		td.appendChild(toggle);
		requestAnimationFrame(() => { toggle.hidden = description.scrollHeight <= description.clientHeight; });
		const links = element('div', 'links');
		links.appendChild(link(TEXT.view, () => vscode.postMessage({ command: 'view', folder: skill.folder, path: 'SKILL.md' })));
		links.appendChild(link(TEXT.run, () => vscode.postMessage({ command: 'run', folder: skill.folder })));
		td.appendChild(links);
	}

	function tasksCell(row, skill) {
		const td = cell(row);
		if (!skill.tasks.length) {
			td.appendChild(element('span', 'small', TEXT.noTask));
		}
		for (const task of skill.tasks) {
			const button = link(task.title, () => vscode.postMessage({ command: 'task', id: task.id }));
			button.classList.add('task');
			td.appendChild(button);
		}
	}

	function requestsCell(row, skill) {
		const td = cell(row);
		const chips = skill.triggers.map(trigger => element('span', 'package request', trigger));
		chips.forEach((chip, index) => { chip.hidden = index >= LISTED; td.appendChild(chip); });
		if (chips.length > LISTED) {
			const toggle = link(TEXT.moreRequests.replace('{0}', chips.length - LISTED), () => {
				const hidden = !chips[LISTED].hidden;
				chips.slice(LISTED).forEach(chip => { chip.hidden = hidden; });
				toggle.textContent = hidden ? TEXT.moreRequests.replace('{0}', chips.length - LISTED) : TEXT.less;
			});
			toggle.classList.add('small');
			td.appendChild(toggle);
		}
	}

	function filesCell(row, skill) {
		const td = cell(row, 'nowrap');
		for (const path of skill.files) {
			const line = element('div', 'small');
			line.appendChild(link(path, () => vscode.postMessage({ command: 'view', folder: skill.folder, path })));
			td.appendChild(line);
		}
	}

	function render(skills) {
		body.textContent = '';
		for (const skill of skills) {
			const row = element('tr');
			nameCell(row, skill);
			tasksCell(row, skill);
			requestsCell(row, skill);
			filesCell(row, skill);
			cell(row, 'nowrap').textContent = skill.size;
			body.appendChild(row);
		}
	}

	window.addEventListener('message', event => {
		if (event.data.command === 'entries') {
			render(event.data.entries);
		}
	});
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

/** Where the skills are installed for an agent other than Claude Code: the personal skills folder of Codex and OpenCode. */
function personalSkillsFolder(pathService: IPathService): URI {
	return joinPath(pathService.userHome({ preferLocal: true }), '.agents', 'skills');
}

/**
 * Whether the skills are installed in the agent: in Claude Code, the Pollis Agents plugin is in its list of
 * installed plugins; in any other agent, ~/.agents/skills has a skill folder Pollis put there.
 */
export async function skillsInstalled(agent: ICodingAgent, fileService: IFileService, pathService: IPathService): Promise<boolean> {
	try {
		if (commandWords(agent.command)[0] === 'claude') {
			const plugins = await fileService.readFile(joinPath(pathService.userHome({ preferLocal: true }), '.claude', 'plugins', 'installed_plugins.json'));
			return plugins.value.toString().includes(`"${PLUGIN_ID}"`);
		}
		const folders = (await fileService.resolve(personalSkillsFolder(pathService))).children ?? [];
		for (const folder of folders) {
			if (folder.isDirectory && await fileService.exists(joinPath(folder.resource, INSTALLED_MARKER))) {
				return true;
			}
		}
	} catch {
		// No list of plugins, or no skills folder: not installed
	}
	return false;
}

/**
 * Installs the skills in a coding agent, from the Coding Agents page, so that it uses them in any folder
 * without going through Pollis: in Claude Code, the Pollis Agents plugin from its marketplace, in a terminal;
 * in any other agent, the skill folders copied to ~/.agents/skills, the folder Codex and OpenCode
 * read personal skills from. A folder there that Pollis did not put there (it has no
 * INSTALLED_MARKER) is left as it is. The skills that run the plugin's scripts look for them in
 * ~/.pollis/agents/pollis-agents.
 */
export async function installSkills(accessor: ServicesAccessor, agent: ICodingAgent): Promise<void> {
	const terminalService = accessor.get(ITerminalService);
	const fileService = accessor.get(IFileService);
	const notificationService = accessor.get(INotificationService);
	const instantiationService = accessor.get(IInstantiationService);
	const pathService = accessor.get(IPathService);

	if (commandWords(agent.command)[0] === 'claude') {
		const instance = await terminalService.createTerminal({ config: { name: localize('pollisSkills.install.terminal', "Install Pollis Skills") } });
		terminalService.setActiveInstance(instance);
		await terminalService.revealTerminal(instance);
		await instance.sendText(`claude plugin marketplace add ${MARKETPLACE} && claude plugin install ${PLUGIN_ID}`, true);
		return;
	}

	if (!await instantiationService.invokeFunction(updateSkills)) {
		return;
	}
	const target = personalSkillsFolder(pathService);
	const source = joinPath(pluginFolder(pathService), 'skills');
	const installed: string[] = [];
	const skipped: string[] = [];
	try {
		for (const child of (await fileService.resolve(source)).children ?? []) {
			if (!child.isDirectory) {
				continue;
			}
			const destination = joinPath(target, child.name);
			if (await fileService.exists(destination) && !await fileService.exists(joinPath(destination, INSTALLED_MARKER))) {
				skipped.push(child.name);
				continue;
			}
			await fileService.copy(child.resource, destination, true);
			await fileService.writeFile(joinPath(destination, INSTALLED_MARKER), VSBuffer.fromString(localize('pollisSkills.installed.marker', "Installed by Pollis from {0}; installing again replaces this folder.\n", MARKETPLACE)));
			installed.push(child.name);
		}
	} catch (error) {
		notificationService.error(localize('pollisSkills.installCopy.error', "Could not install the Pollis skills in {0}: {1}", target.fsPath, toErrorMessage(error)));
		return;
	}
	notificationService.info(skipped.length
		? localize('pollisSkills.installCopy.doneSkipped', "Installed {0} Pollis skills in {1}. Not installed, because a skill of that name that Pollis did not install is there: {2}.", installed.length, target.fsPath, skipped.join(', '))
		: localize('pollisSkills.installCopy.done', "Installed {0} Pollis skills in {1}. {2} uses them in any folder.", installed.length, target.fsPath, agent.label));
}

const category = localize2('pollisNewPanels.category', "New Panels and Toolboxes");

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
			id: RUN_SKILL_COMMAND_ID,
			title: localize2('pollisSkills.runSkill', "Run an Agent Skill"),
			f1: false,
		});
	}
	async run(accessor: ServicesAccessor, folder: string, title: string): Promise<void> {
		const instantiationService = accessor.get(IInstantiationService);
		const file = await instantiationService.invokeFunction(skillFile, folder);
		if (file) {
			await instantiationService.invokeFunction(startAgent, title, localize('pollisSkills.runSkillPrompt', "Read the skill {0} and follow its instructions with me.", file.fsPath));
		}
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: BROWSE_SKILLS_COMMAND_ID,
			title: localize2('pollisSkills.browse', "Agent Skills"),
			category: localize2('pollisSkills.category', "Compose"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return browseSkills(accessor);
	}
});
