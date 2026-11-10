/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../base/common/buffer.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { FileAccess } from '../../../../base/common/network.js';
import { isWindows } from '../../../../base/common/platform.js';
import { basename, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { IEditorService, SIDE_GROUP } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { parseToml } from '../../model/browser/common/tomlPanelData.js';
import { ITerminalService } from '../../terminal/browser/terminal.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { PREPARE_REGISTRATION_COMMAND_ID, skillFile, startAgent, WRITE_METHOD_COMMAND_ID, WRITE_VIGNETTE_COMMAND_ID } from './pollisAgents.js';
import { AgentTask } from './modelRouting.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { NEWMETHOD_METADATA } from '../../model/browser/webviews/newMethod.data.js';
import { buildWebviewHtml } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { appendToml, ARTICLE_DATA_SCRIPT, ARTICLE_DATA_STYLE, ArticleDataMessage, articleDataHtml, articleDataText, createArticleData, draftName, IArticleDataKind, IArticleDataRecord, IArticleDataServices, inputBlock, isArticleDataMessage, IStudyInput, makesFolder, openRecordArticle, readTables, setTomlValue, table, text, tomlString, withPaths } from './articleAndData.js';

// Compose > Replication > Create Article Method (Browse Article Methods, which lists them, is in workflowLibrary.ts).
// A method is a folder of ~/.pollis/methods with method.toml, its code in src/NAME.jl (module NAME),
// the published results it must reproduce in targets/*.csv and the user's notes for a coding agent in
// INSTRUCTIONS.md. New Method opens the page of a new method with no folder: the first thing typed or added makes it, named after the title, else NewMethod
// while it is still empty. Each method opens on its own page beside the article, shown in the integrated browser in an in-memory session. The article
// and the input data are only links in method.toml: the page reads the data into memory to show it, and
// nothing of either is written to disk, not even a cache. Only when the user asks, Save a Copy... keeps a
// copy outside Pollis (by default in the data folder of a Pollis Workspace) and records its path as `local`;
// the page then reads the copy, falling back to the link if it is gone. Everything is done on the pages,
// with no pickers: tables are added, the method renamed and its article set with forms on the page. Package
// and Publish, a step of the page, runs media/methods/package.jl, which makes the package NAME.jl in
// ~/.pollis/packages, its tests the target tables computed from the data downloaded from the links, runs
// them and, if asked, pushes the package to GitHub when they all pass and registers it in the Pollis
// registry when it also meets the registry rules (a name of at least 5 characters, a usage example, a
// docstring for every exported name). Three tasks hand a method to the user's coding agent, with the skills
// of the Pollis Agents plugin: Write a Method... (write-method: the code that reproduces the targets), Write
// a Vignette... (write-vignette: the method's documentation) and Prepare for Registration...
// (prepare-method: the rules). Their commands, run without a method, open Browse Article Methods.

export const CREATE_METHOD_COMMAND_ID = 'pollis.newMethods.create';
export const PACKAGE_METHOD_COMMAND_ID = 'pollis.newMethods.package';
/** Browse Article Methods, registered in workflowLibrary.ts: the user's methods and the methods shipped with Pollis. */
export const BROWSE_METHODS_COMMAND_ID = 'pollis.compose.createMethod';

const GITHUB_OWNER_SETTING = 'pollis.newMethods.githubOwner';
const REGISTRY_SETTING = 'pollis.newMethods.registry';
const DEFAULT_REGISTRY = 'https://github.com/Trumpingtons/PollisRegistry';
const PACKAGE_SCRIPT = 'vs/workbench/contrib/compose/browser/media/methods/package.jl';
const INSTRUCTIONS_FILE = 'INSTRUCTIONS.md';
const VIGNETTE_INSTRUCTIONS_FILE = 'VIGNETTE.md';

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'pollisNewMethods',
	title: localize('newMethods.configurationTitle', "Article Methods"),
	type: 'object',
	properties: {
		[GITHUB_OWNER_SETTING]: {
			type: 'string',
			default: 'Trumpingtons',
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('newMethods.githubOwner', "The GitHub user or organization that **Package and Publish**, on the page of an article method, pushes method packages to."),
		},
		[REGISTRY_SETTING]: {
			type: 'string',
			default: DEFAULT_REGISTRY,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('newMethods.registry', "The Julia package registry that **Package and Publish**, on the page of an article method, registers method packages in, when they meet the Pollis registry rules. Their vignettes are listed in its `Vignettes.toml`, which Help > Documentation > Package Vignettes shows."),
		},
	},
});

/** A method, as its page shows it: its folder and method.toml, with what Article and Data shows of it. */
interface IMethod extends IArticleDataRecord {
	readonly title: string;
	/** The citations of the method's articles, its own first, then those of `[[articles]]`. */
	readonly citation?: string;
	readonly instructions: string;
	/** The vignette's title, the method's by default. */
	readonly vignetteTitle: string;
	/** The notes for a coding agent on the vignette, in VIGNETTE.md. */
	readonly vignetteInstructions: string;
	/** The vignette's LaTeX file and PDF, `vignette/NAME.tex` and `.pdf`, when they exist. */
	readonly vignette?: string;
	readonly vignettePdf?: string;
}

function methodsFolder(pathService: IPathService): URI {
	return joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'methods');
}

/** Reads a method folder; undefined when it has no method.toml. */
async function readMethod(fileService: IFileService, folder: URI): Promise<IMethod | undefined> {
	const tomlFile = joinPath(folder, 'method.toml');
	if (!await fileService.exists(tomlFile)) {
		return undefined;
	}
	const toml = parseToml((await fileService.readFile(tomlFile)).value.toString());
	const { inputs, targets } = await readTables(fileService, folder, toml);
	const name = text(toml.name) ?? basename(folder);
	const title = text(toml.title) ?? name;
	const doi = text(toml.doi);
	const readText = async (file: URI) => await fileService.exists(file) ? (await fileService.readFile(file)).value.toString() : '';
	const existing = async (path: string) => await fileService.exists(joinPath(folder, ...path.split('/'))) ? path : undefined;
	return {
		folder,
		name,
		title,
		// The method's article, then the others whose tables are targets too ([[articles]])
		citation: [toml, ...(Array.isArray(toml.articles) ? toml.articles : [])].map(article => text(table(article).citation)).filter(Boolean).join(' ') || undefined,
		article: text(toml.article) ?? (doi ? `https://doi.org/${doi}` : undefined),
		articleLocal: text(toml.article_local),
		inputs,
		targets,
		instructions: await readText(joinPath(folder, INSTRUCTIONS_FILE)),
		vignetteTitle: text(toml.vignette_title) ?? title,
		vignetteInstructions: await readText(joinPath(folder, VIGNETTE_INSTRUCTIONS_FILE)),
		vignette: await existing(`vignette/${name}.tex`),
		vignettePdf: await existing(`vignette/${name}.pdf`),
	};
}

/** The methods in ~/.pollis/methods: the folders with a method.toml. */
async function readMethods(fileService: IFileService, pathService: IPathService): Promise<IMethod[]> {
	const root = methodsFolder(pathService);
	if (!await fileService.exists(root)) {
		return [];
	}
	const methods: IMethod[] = [];
	for (const child of (await fileService.resolve(root)).children ?? []) {
		const method = child.isDirectory ? await readMethod(fileService, child.resource) : undefined;
		if (method) {
			methods.push(method);
		}
	}
	return methods.sort((a, b) => a.title.localeCompare(b.title));
}

function methodToml(name: string, title: string, article: string): string {
	return [
		'# A Pollis article method (Compose > Replication). Create Method shows the article and the tables; Package and',
		`# Publish turns this folder into the Julia package ${name}.jl, its tests the target tables.`,
		'#',
		'#   targets/*.csv     the published results: the row labels in the first column, the values as printed',
		`#   src/${name}.jl     the code: module ${name}`,
		`#   ${INSTRUCTIONS_FILE}   notes for a coding agent on the method`,
		`#   ${VIGNETTE_INSTRUCTIONS_FILE}       notes for a coding agent on the vignette (vignette/${name}.tex)`,
		'',
		`name = "${name}"`,
		`title = ${tomlString(title)}`,
		'vignette_title = ""',
		'author = ""',
		'description = ""',
		'# The topic, e.g. "Survival Analysis", and the license: choose one, e.g. MIT, or another whose text is in a',
		'# LICENSE file here. Without a license nobody may reuse the package, so others cannot build on it.',
		'topic = ""',
		'license = ""',
		'',
		'# The article whose tables are the targets. article is a link to read it (its PDF or its web page):',
		'# Pollis opens it in the integrated browser and keeps no copy. Without it, the DOI\'s page opens.',
		'citation = ""',
		'doi = ""',
		`article = ${tomlString(article)}`,
		'',
		'# The Julia packages the code uses, e.g. ["Distributions"]',
		'packages = []',
		'',
		'# The input tables are links too, or files in inputs/ typed in from the article: Pollis reads each link',
		'# into memory to show it, and the package\'s tests download it; no copy is kept. In the calls, each is a',
		'# variable named after its table here.',
		'#   [inputs.grunfeld]',
		'#   url = "https://..."              or file = "inputs/grunfeld.csv", a table typed in from the article',
		'#   source = "Where the data comes from"',
		'#   delim = ","                      the default; or ";", "tab", "whitespace"',
		'#   columns = ["firm", "year"]       only for a file without a header line',
		'#   skipto = 2                       the line of the first row, when the lines before it are not a header',
		'#   limit = 100                      the number of rows to read, when the file goes on after them',
		'',
		'# One table for each target: where it is published, the Julia call that computes it from the inputs',
		'# (Tables.jl column tables) and the units of the last printed digit it may be off by. The call returns',
		'# a matrix laid out like the target, without its label column.',
		'',
	].join('\n');
}

function moduleCode(name: string): string {
	return [
		`module ${name}`,
		'',
		'export estimate',
		'',
		'"""',
		'    estimate(data)',
		'',
		'The method: from a Tables.jl column table, the matrix laid out like the target table, its rows and',
		'columns in the same order, without the label column.',
		'"""',
		'function estimate(data)',
		'\terror("Write the method here")',
		'end',
		'',
		'end',
		'',
	].join('\n');
}

/** Checks a package name for a method: a capital letter, then letters and digits, not used by another method. */
async function validateName(fileService: IFileService, root: URI, value: string, current?: string): Promise<string | undefined> {
	if (!/^[A-Z][A-Za-z0-9]*$/.test(value)) {
		return localize('newMethods.name.invalid', "A capital letter, then letters and digits.");
	}
	return value !== current && await fileService.exists(joinPath(root, value)) ? localize('newMethods.name.exists', "There is already a method {0}.", value) : undefined;
}

/** Makes a method folder: method.toml, the module in src/, INSTRUCTIONS.md and targets/. Returns the folder. */
async function newMethod(fileService: IFileService, pathService: IPathService, name: string, title: string, article: string): Promise<URI> {
	const folder = joinPath(methodsFolder(pathService), name);
	await fileService.writeFile(joinPath(folder, 'method.toml'), VSBuffer.fromString(methodToml(name, title || name, article)));
	await fileService.writeFile(joinPath(folder, 'src', `${name}.jl`), VSBuffer.fromString(moduleCode(name)));
	await fileService.writeFile(joinPath(folder, INSTRUCTIONS_FILE), VSBuffer.fromString(''));
	await fileService.createFolder(joinPath(folder, 'targets'));
	return folder;
}

/** Whether a method is still as it was made: no article, tables or instructions, and its code untouched. */
async function isEmptyMethod(fileService: IFileService, method: IMethod): Promise<boolean> {
	if (method.article || method.articleLocal || method.inputs.length || method.targets.length || method.instructions.trim() || method.vignetteInstructions.trim() || method.vignette) {
		return false;
	}
	const code = joinPath(method.folder, 'src', `${method.name}.jl`);
	return !await fileService.exists(code) || (await fileService.readFile(code)).value.toString() === moduleCode(method.name);
}

/**
 * Gives a method a new package name and title: method.toml, the module and file in src/, the vignette and the folder.
 * Returns the method's folder, new when the name changed.
 */
async function renameMethod(fileService: IFileService, pathService: IPathService, method: IMethod, name: string, title: string): Promise<URI> {
	const root = methodsFolder(pathService);
	let folder = method.folder;
	await setTomlValue(fileService, joinPath(folder, 'method.toml'), undefined, 'title', title || name);
	if (name !== method.name) {
		const oldCode = joinPath(folder, 'src', `${method.name}.jl`);
		const newCode = joinPath(folder, 'src', `${name}.jl`);
		if (await fileService.exists(oldCode)) {
			const code = (await fileService.readFile(oldCode)).value.toString();
			await fileService.writeFile(newCode, VSBuffer.fromString(code.replace(new RegExp(`^module\\s+${method.name}\\b`, 'm'), `module ${name}`)));
			await fileService.del(oldCode);
		}
		// The files named after the package: the vignette
		for (const [from, to] of [[`vignette/${method.name}.tex`, `vignette/${name}.tex`], [`vignette/${method.name}.pdf`, `vignette/${name}.pdf`]]) {
			const source = joinPath(folder, ...from.split('/'));
			if (await fileService.exists(source)) {
				await fileService.move(source, joinPath(folder, ...to.split('/')));
			}
		}
		await setTomlValue(fileService, joinPath(folder, 'method.toml'), undefined, 'name', name);
		const target = joinPath(root, name);
		if (basename(folder) !== name) {
			await fileService.move(folder, target);
			folder = target;
		}
	}
	return folder;
}

/** Where Package and Publish makes the packages. */
function packagesFolder(pathService: IPathService): URI {
	return joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'packages');
}

/** The command that packages a method and runs its tests, for a coding agent to type. */
function testCommand(configurationService: IConfigurationService, pathService: IPathService, method: IMethod): string {
	const julia = configurationService.getValue<string>('julia.executablePath') || 'julia';
	return [julia, FileAccess.asFileUri(PACKAGE_SCRIPT).fsPath, packagesFolder(pathService).fsPath, method.folder.fsPath].map(word => `"${word}"`).join(' ');
}

/** Shell quoting for a path or word typed into the terminal. */
function quote(word: string): string {
	return isWindows ? `'${word.replace(/'/g, `''`)}'` : `'${word.replace(/'/g, `'\\''`)}'`;
}

/** What Package and Publish does after making the package and running its tests. */
type PublishAction = 'test' | 'push' | 'register';

/**
 * Packages a method in a terminal with media/methods/package.jl: makes the package, runs its tests and, as
 * asked, pushes it to GitHub as `owner` and registers it. Pushing is confirmed first.
 */
async function packageMethod(accessor: ServicesAccessor, method: IMethod, action: PublishAction, owner: string): Promise<void> {
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const configurationService = accessor.get(IConfigurationService);
	const dialogService = accessor.get(IDialogService);
	const terminalService = accessor.get(ITerminalService);

	if (!method.targets.length) {
		throw new Error(localize('newMethods.package.noTargets', "{0} has no target tables, so nothing to test: add them in Target Tables.", method.title));
	}
	const registry = action === 'register' ? configurationService.getValue<string>(REGISTRY_SETTING) || DEFAULT_REGISTRY : undefined;
	if (action !== 'test') {
		if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(owner)) {
			throw new Error(localize('newMethods.owner.invalid', "A GitHub user or organization name."));
		}
		const repository = `github.com/${owner}/${method.name}.jl`;
		const { confirmed } = await dialogService.confirm({
			message: localize('newMethods.owner.confirm', "Push to GitHub as {0}?", owner),
			detail: registry
				? localize('newMethods.owner.confirmRegister', "If its tests all pass, the package goes to its own public repository, {0}. If it also meets the Pollis registry rules, it is then registered in {1}.", repository, registry)
				: localize('newMethods.owner.confirmDetail', "If its tests all pass, the package goes to its own public repository, {0}.", repository),
			primaryButton: localize({ key: 'newMethods.owner.push', comment: ['&& denotes a mnemonic'] }, "&&Push"),
		});
		if (!confirmed) {
			return;
		}
		await configurationService.updateValue(GITHUB_OWNER_SETTING, owner);
	}

	const packages = packagesFolder(pathService);
	await fileService.createFolder(packages);
	const julia = configurationService.getValue<string>('julia.executablePath') || 'julia';
	const words = [julia, FileAccess.asFileUri(PACKAGE_SCRIPT).fsPath, packages.fsPath, method.folder.fsPath, ...(action !== 'test' ? ['--push', owner] : []), ...(registry ? ['--register', registry] : [])];
	const instance = await terminalService.createTerminal({ config: { name: localize('newMethods.terminal', "Package and Publish"), cwd: packages } });
	terminalService.setActiveInstance(instance);
	await terminalService.revealTerminal(instance);
	await instance.sendText((isWindows ? '& ' : '') + words.map(quote).join(' '), true);
}

/** Article and Data of a method: its record is method.toml, and each target has the call that computes it and a tolerance. */
const METHOD_KIND: IArticleDataKind = {
	recordFile: 'method.toml',
	targetFields: 'call = ""\ntolerance = 0\n',
	licences: false,
	tableExists: name => localize('newMethods.table.nameExists', "The method already has a table {0}.", name),
	// What Add from Article asks the coding agent: to follow the tables-from-article skill, given the tables and what they are
	articlePrompt: (skill, folder, kind, tables) => kind === 'targets'
		? localize('newMethods.fromArticle.targets', "Read the skill {0} and follow its instructions to type in the tables {1} of the article of the Pollis method in {2} as target tables.", skill, tables, folder.fsPath)
		: localize('newMethods.fromArticle.inputs', "Read the skill {0} and follow its instructions to type in the tables {1} of the article of the Pollis method in {2} as input data.", skill, tables, folder.fsPath),
};

/** The agent tasks of a method, by the command the pages send. */
const AGENT_TASKS: { readonly [command: string]: string } = {
	writeMethod: WRITE_METHOD_COMMAND_ID,
	writeVignette: WRITE_VIGNETTE_COMMAND_ID,
	prepareRegistration: PREPARE_REGISTRATION_COMMAND_ID,
};

type MethodMessage =
	| ArticleDataMessage
	| { readonly command: 'ready' | 'openPdf' }
	| { readonly command: 'writeMethod' | 'writeVignette' | 'prepareRegistration' }
	| { readonly command: 'setTitle' | 'setVignetteTitle'; readonly title: string }
	| { readonly command: 'setName'; readonly name: string }
	| { readonly command: 'package'; readonly action: PublishAction; readonly owner: string }
	| { readonly command: 'open'; readonly file: string }
	| { readonly command: 'instructions' | 'vignetteInstructions'; readonly text: string };

/** What a method made from a replication starts with: the replication's article and data, and the targets it is for. */
export interface IMethodSource {
	readonly title: string;
	readonly citation?: string;
	readonly doi?: string;
	readonly article?: string;
	/** The replication's folder, which holds its typed-in tables and its targets. */
	readonly folder: URI;
	readonly inputs: readonly IStudyInput[];
	readonly targets: readonly { readonly name: string; readonly source?: string }[];
}

/**
 * Makes a method from a replication whose plan says that no Julia package computes some of its targets: the
 * replication's article, all its input tables and those targets, each with no call yet, and opens the method's
 * page. Returns the method's folder name.
 */
export async function methodFromReplication(accessor: ServicesAccessor, source: IMethodSource): Promise<string> {
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const instantiationService = accessor.get(IInstantiationService);
	const name = await draftName(fileService, methodsFolder(pathService), source.title, 'NewMethod');
	const folder = await newMethod(fileService, pathService, name, source.title, source.article ?? '');
	const record = joinPath(folder, 'method.toml');
	for (const [key, value] of [['citation', source.citation], ['doi', source.doi]] as const) {
		if (value) {
			await setTomlValue(fileService, record, undefined, key, value);
		}
	}
	const blocks: string[] = [];
	for (const input of source.inputs) {
		if (input.file) {
			await fileService.copy(joinPath(source.folder, ...input.file.split('/')), joinPath(folder, ...input.file.split('/')), true);
		}
		blocks.push(inputBlock(input, false));
	}
	for (const target of source.targets) {
		await fileService.copy(joinPath(source.folder, 'targets', `${target.name}.csv`), joinPath(folder, 'targets', `${target.name}.csv`), true);
		blocks.push(`[targets.${target.name}]\nsource = ${tomlString(target.source ?? '')}\n${METHOD_KIND.targetFields}`);
	}
	await appendToml(fileService, record, blocks.join('\n'));
	await instantiationService.invokeFunction(openMethodPage, folder);
	return name;
}

/** The open pages, by method folder, so a second request shows the same page. */
const openPages = new Map<string, WebviewInput>();

/**
 * Opens a method: its article in the integrated browser and, beside it, its page, the five steps of making
 * it: Article and Data (the input tables read into memory from their links, and the target tables), Write
 * a Method, Write a Vignette, Prepare for Registration and Package and Publish, updated as the method's
 * files change. `step` is the step to show. With no folder, it opens a new method with nothing on disk:
 * the first thing typed or added makes its folder, named after its title, else NewMethod, a provisional
 * name until the user gives it a Package Name; a draft still empty when its page closes is deleted.
 */
async function openMethodPage(accessor: ServicesAccessor, existing?: URI, step?: string): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const fileService = accessor.get(IFileService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const commandService = accessor.get(ICommandService);
	const fileDialogService = accessor.get(IFileDialogService);
	const requestService = accessor.get(IRequestService);
	const progressService = accessor.get(IProgressService);
	const contextService = accessor.get(IWorkspaceContextService);
	const pathService = accessor.get(IPathService);
	const environmentService = accessor.get(IEnvironmentService);
	const configurationService = accessor.get(IConfigurationService);
	const instantiationService = accessor.get(IInstantiationService);
	const openerService = accessor.get(IOpenerService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const storageService = accessor.get(IStorageService);

	let draft = !existing;
	// Whether the method's folder exists: a new method has none until the first thing is typed or added
	let created = !!existing;
	// A draft's title until the user gives it one: its Title field shows the example instead
	const draftTitle = localize('newMethods.draft.title', "New Article Method");
	const root = methodsFolder(pathService);
	if (existing) {
		const open = openPages.get(existing.toString());
		if (open && !open.isDisposed()) {
			webviewWorkbenchService.revealWebview(open, open.group ?? -1, false);
			if (step) {
				open.webview.postMessage({ command: 'step', step });
			}
			return;
		}
	}
	// Until it is made, a new method is only in memory, its folder where it would go
	let folder = existing ?? joinPath(root, 'NewMethod');
	const initial = created ? await readMethod(fileService, folder) : { folder, name: basename(folder), title: draftTitle, inputs: [], targets: [], instructions: '', vignetteTitle: draftTitle, vignetteInstructions: '' };
	if (!initial) {
		return;
	}
	let method: IMethod = initial;
	const articleServices: IArticleDataServices = { fileService, fileDialogService, requestService, progressService, contextService, pathService, environmentService, editorService, commandService, instantiationService };
	await openRecordArticle(articleServices, method);
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: method.title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.newMethod',
		method.title,
		undefined,
		{ group: method.article || method.articleLocal ? SIDE_GROUP : undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());
	if (created) {
		openPages.set(folder.toString(), webviewInput);
	}

	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'newMethod', draftTitle, NEWMETHOD_METADATA.newMethod, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));
	disposables.add(webviewInput.webview.onDidDispose(async () => {
		disposables.dispose();
		if (!created) {
			return;
		}
		openPages.delete(folder.toString());
		const left = draft ? await readMethod(fileService, folder) : undefined;
		if (left && left.title === draftTitle && await isEmptyMethod(fileService, left)) {
			await fileService.del(folder, { recursive: true });
		}
	}));

	const post = () => {
		webviewInput.webview.postMessage({ command: 'method', method: method && { ...method, folder: method.folder.fsPath }, draft, untitled: method?.title === draftTitle, vignetteUntitled: method?.vignetteTitle === draftTitle, owner: configurationService.getValue<string>(GITHUB_OWNER_SETTING) || '' });
		articleData.postInputs();
	};
	const reload = disposables.add(new RunOnceScheduler(async () => {
		method = await readMethod(fileService, folder) ?? method;
		post();
	}, 300));
	const watch = () => {
		for (const location of [folder, joinPath(folder, 'targets'), joinPath(folder, 'inputs'), joinPath(folder, 'vignette')]) {
			const watcher = disposables.add(fileService.createWatcher(location, { recursive: false, excludes: [] }));
			disposables.add(watcher.onDidChange(() => reload.schedule()));
		}
	};
	if (created) {
		watch();
	}
	// Makes a new method's folder, once, named `name` or after `title`
	let creating: Promise<void> | undefined;
	const create = (title: string, name?: string) => creating ??= (async () => {
		folder = await newMethod(fileService, pathService, name ?? await draftName(fileService, root, title, 'NewMethod'), title || draftTitle, '');
		method = await readMethod(fileService, folder) ?? method;
		created = true;
		openPages.set(folder.toString(), webviewInput);
		watch();
	})();
	// What a new method's folder is made for: the first thing typed or added (a Package Name makes it itself)
	const makes = (message: MethodMessage) => {
		if (isArticleDataMessage(message)) {
			return makesFolder(message);
		}
		switch (message.command) {
			case 'setTitle': return !!message.title.trim();
			case 'instructions': case 'vignetteInstructions': return !!message.text.trim();
			case 'setVignetteTitle': case 'writeMethod': case 'writeVignette': case 'prepareRegistration': case 'open': return true;
			default: return false;
		}
	};

	const run = async (action: () => Promise<void>) => {
		try {
			await action();
		} catch (error) {
			notificationService.error(toErrorMessage(error));
		}
	};
	// A form of the page: its error is shown under it, and it closes when done
	const submit = async (form: string, action: () => Promise<void>) => {
		try {
			await action();
			webviewInput.webview.postMessage({ command: 'formDone', form });
		} catch (error) {
			webviewInput.webview.postMessage({ command: 'formError', form, message: toErrorMessage(error) });
		}
	};
	const articleData = createArticleData(articleServices, METHOD_KIND, {
		webview: webviewInput.webview,
		record: () => method,
		reload: async () => {
			method = await readMethod(fileService, folder) ?? method;
			post();
		},
		submit,
		run,
	});

	disposables.add(webviewInput.webview.onMessage(async (e: { message: MethodMessage }) => {
		const message = e.message;
		if (!created && makes(message)) {
			try {
				await create(message.command === 'setTitle' ? message.title.trim() : '');
			} catch (error) {
				notificationService.error(toErrorMessage(error));
				return;
			}
		}
		const current = method;
		if (!current) {
			return;
		}
		if (message.command === 'ready') {
			post();
			if (step) {
				webviewInput.webview.postMessage({ command: 'step', step });
			}
		} else if (message.command === 'writeMethod' || message.command === 'writeVignette' || message.command === 'prepareRegistration') {
			commandService.executeCommand(AGENT_TASKS[message.command], folder);
		} else if (message.command === 'setTitle') {
			submit('title', async () => {
				const title = message.title.trim() || current.name;
				await setTomlValue(fileService, joinPath(folder, 'method.toml'), undefined, 'title', title);
				webviewInput.setWebviewTitle(title);
				method = await readMethod(fileService, folder) ?? method;
				post();
			});
		} else if (message.command === 'setVignetteTitle') {
			submit('vignetteTitle', async () => {
				await setTomlValue(fileService, joinPath(folder, 'method.toml'), undefined, 'vignette_title', message.title.trim());
				method = await readMethod(fileService, folder) ?? method;
				post();
			});
		} else if (message.command === 'setName') {
			submit('name', async () => {
				const name = message.name.trim();
				const invalid = await validateName(fileService, root, name, created ? current.name : undefined);
				if (invalid) {
					throw new Error(invalid);
				}
				if (!created) {
					// A new method's folder is made with its Package Name
					await create(current.title === draftTitle ? '' : current.title, name);
					draft = false;
					post();
					return;
				}
				const renamed = await renameMethod(fileService, pathService, current, name, current.title);
				draft = false;
				if (renamed.toString() !== folder.toString()) {
					// The page reopens on the method's new folder
					webviewInput.dispose();
					await instantiationService.invokeFunction(openMethodPage, renamed, 'register');
				} else {
					post();
				}
			});
		} else if (isArticleDataMessage(message)) {
			articleData.handle(message);
		} else if (message.command === 'package') {
			submit('package', () => instantiationService.invokeFunction(packageMethod, current, message.action, message.owner.trim()));
		} else if (message.command === 'openPdf') {
			if (current.vignettePdf) {
				const pdf = joinPath(folder, ...current.vignettePdf.split('/'));
				run(async () => { await editorService.openEditor({ resource: pdf, options: { revealIfOpened: true } }); });
			}
		} else if (message.command === 'instructions' || message.command === 'vignetteInstructions') {
			const file = message.command === 'instructions' ? INSTRUCTIONS_FILE : VIGNETTE_INSTRUCTIONS_FILE;
			run(() => fileService.writeFile(joinPath(folder, file), VSBuffer.fromString(message.text)).then(() => undefined));
		} else if (message.command === 'open') {
			const files = ['method.toml', `src/${current.name}.jl`, current.vignette, ...current.targets.map(target => target.file), ...current.inputs.map(input => input.file)];
			if (files.includes(message.file)) {
				run(async () => { await editorService.openEditor({ resource: joinPath(folder, ...message.file.split('/')) }); });
			}
		}
	}));
}

/** The styles of the method page: Article and Data's, then the buttons of Package and Publish. */
const PAGE_STYLE = `${ARTICLE_DATA_STYLE}
		.step-pane {
			.publish { display: flex; flex-direction: column; gap: 12px; margin: 0 0 14px 0; max-width: 900px; }
			.publish .row { display: flex; align-items: baseline; gap: 12px; }
			.publish button { min-width: 260px; text-align: left; }
		}`;

/**
 * The method page, in the Time Arrow style of the scaffold, a pane for each of its five steps: its texts come
 * from here, the method from the `method` message and each input table from an `input` message.
 */
function pageHtml(): string {
	const text = {
		...articleDataText({
			articleIntro: localize('newMethods.page.articleIntro', "The article the method comes from. Pollis opens it in the integrated browser and keeps no copy unless you save one."),
			inputsIntro: localize('newMethods.page.inputsIntro', "The data the method is computed from: links, read into memory with no copy kept, or tables typed in from the article. In the calls, each table is a variable named after it."),
			targetsIntro: localize('newMethods.page.targetsIntro', "The published results the method must reproduce: every printed value becomes a test of the package."),
			emptyInputHint: localize('newMethods.input.emptyDetail', "A table of the method, inputs/NAME.csv, opened to type in: a header line of column names, then the values"),
			targetFilesHint: localize('newMethods.page.targetFilesHint', "CSV files of published tables, copied into the method: row labels in the first column, the values as printed"),
			targetArticleHint: localize('newMethods.page.targetArticleHint', "Your coding agent reads the article and types the tables in as target tables, every value as printed. Check them against the article: the tests are only as right as the targets."),
			noTargets: localize('newMethods.page.noTargets', "No target tables yet. Without data and expected results there is no new method."),
		}),
		intro: localize('newMethods.page.intro', "A method reproduces what an article publishes: its tables become the tests of a Julia package, which the steps below make, with the article open beside this page."),
		// The steps
		stepArticle: localize('newMethods.step.article', "Article and Data"),
		stepMethod: localize('newMethods.step.method', "Write a Method"),
		stepVignette: localize('newMethods.step.vignette', "Write a Vignette"),
		stepRegister: localize('newMethods.step.register', "Prepare for Registration"),
		stepPackage: localize('newMethods.step.package', "Package and Publish"),
		draftHint: localize('newMethods.draft.hint', "A new method: its Package Name is set in {0}. Start with its article and tables in {1}. Nothing is saved until you type or add something, and its folder is named after its title until you give it a Package Name."),
		// 2. Write a Method
		title: localize('newMethods.title.label', "Title"),
		titleHint: localize('newMethods.title.hint', "The name of the method people read."),
		titlePlaceholder: localize('newMethods.title.placeholder', "e.g. Panel Random Effects"),
		namePlaceholder: localize('newMethods.name.placeholder', "e.g. {0}"),
		headingHint: localize('newMethods.heading.hint', "The method's title: click to change it, Enter saves, Escape cancels."),
		instructions: localize('newMethods.page.instructions', "Instructions"),
		instructionsIntro: localize('newMethods.page.instructionsIntro', "Notes for a coding agent: what the method does, where in the article, what to watch for. Saved in INSTRUCTIONS.md, beside the method's links and tables, which the agent reads too."),
		instructionsPlaceholder: localize('newMethods.page.instructionsPlaceholder', "e.g. Table 2.5 on page 24 reports the Swamy-Arora estimator; the variance components are in the last two rows."),
		writeMethod: localize('newMethods.page.writeMethod', "Write Method"),
		editToml: localize('newMethods.page.editToml', "Edit method.toml"),
		openCode: localize('newMethods.page.openCode', "Open Code"),
		// 3. Write a Vignette
		vignetteTitleHint: localize('newMethods.vignetteTitle.hint', "The title of the vignette, the method's title unless you change it."),
		vignetteIntro: localize('newMethods.page.vignetteIntro', "Notes for a coding agent on the vignette: its look, its sections, the LaTeX style, the other Pollis vignettes to refer to. Saved in VIGNETTE.md; the vignette is a LaTeX file in the method's vignette folder, with its PDF beside it."),
		vignettePlaceholder: localize('newMethods.page.vignettePlaceholder', "e.g. Follow the structure of the vignette of the Baltagi method; show Table 2.5 in full in the value table."),
		writeVignette: localize('newMethods.page.writeVignette', "Write Vignette"),
		editVignette: localize('newMethods.page.editVignette', "Edit Vignette"),
		openPdf: localize('newMethods.page.openPdf', "Open PDF"),
		noVignette: localize('newMethods.page.noVignette', "No vignette yet: Write Vignette asks your coding agent for it, once the method's tests pass."),
		// 4. Prepare for Registration
		packageName: localize('newMethods.name.label', "Package Name"),
		nameHint: localize('newMethods.name.hint', "The Package Name names the method's folder, its Julia package (e.g. {0}) and the module you load with {1}. It starts with a capital letter, then only letters and digits, with no spaces; the Pollis registry asks for at least 5 characters.", '<code>PanelRandomEffects.jl</code>', '<code>using PanelRandomEffects</code>'),
		registerIntro: localize('newMethods.page.registerIntro', "The Pollis registry asks for a name of at least 5 characters, a usage example and a docstring for every exported name. Your coding agent checks the method against these rules and fixes what it can."),
		prepareRegistration: localize('newMethods.page.prepareRegistration', "Prepare for Registration"),
		// 5. Package and Publish
		packageIntro: localize('newMethods.page.packageIntro', "Makes the Julia package, its tests the target tables, and runs them in a terminal."),
		packageTest: localize('newMethods.package.test', "Package and Test"),
		packageTestDetail: localize('newMethods.package.testDetail', "Makes the package in ~/.pollis/packages, runs its tests and checks the Pollis registry rules"),
		packagePush: localize('newMethods.package.publish', "Package, Test and Push to GitHub"),
		packagePushDetail: localize('newMethods.package.publishDetail', "Then pushes the package, if its tests all pass, to its own public repository"),
		packageRegister: localize('newMethods.package.register', "Package, Test, Push and Register"),
		packageRegisterDetail: localize('newMethods.package.registerDetail', "Then registers the pushed package if it meets the Pollis registry rules"),
		owner: localize('newMethods.owner.title', "GitHub Owner"),
		ownerHint: localize('newMethods.owner.prompt', "The GitHub user or organization the two Push buttons push to. Pushing uses the GitHub CLI (gh), signed in."),
		edit: localize('newMethods.page.edit', "Edit"),
	};
	return buildWebviewHtml({
		// The method's title, from the `method` message
		title: '',
		introHtml: `${text.intro}<span class="notice" id="draftHint" hidden></span>`,
		extraCss: PAGE_STYLE,
		steps: [
			{
				id: 'step-article',
				title: text.stepArticle,
				bodyHtml: articleDataHtml(text),
			},
			{
				id: 'step-method',
				title: text.stepMethod,
				bodyHtml: `
		<div class="field">
			<label>${text.title}<input class="wide" id="title" placeholder="${text.titlePlaceholder}"></label>
			<button class="action primary" data-submit="title">${text.save}</button>
			<button class="action" data-cancel="title">${text.cancel}</button>
			<p class="small hint">${text.titleHint}</p>
			<p class="error small" id="error-title"></p>
		</div>
		<h2>${text.instructions}</h2>
		<p class="intro">${withPaths(text.instructionsIntro)}</p>
		<textarea id="instructions" placeholder="${text.instructionsPlaceholder}"></textarea>
		<div class="actions">
			<button class="action primary" data-command="writeMethod">${text.writeMethod}</button>
			<button class="action" data-command="open" data-file="method.toml">${withPaths(text.editToml)}</button>
			<button class="action open-code" data-command="open">${text.openCode}</button>
		</div>
`,
			},
			{
				id: 'step-vignette',
				title: text.stepVignette,
				bodyHtml: `
		<div class="field">
			<label>${text.title}<input class="wide" id="vignetteTitle" placeholder="${text.titlePlaceholder}"></label>
			<button class="action primary" data-submit="vignetteTitle">${text.save}</button>
			<button class="action" data-cancel="vignetteTitle">${text.cancel}</button>
			<p class="small hint">${text.vignetteTitleHint}</p>
			<p class="error small" id="error-vignetteTitle"></p>
		</div>
		<h2>${text.instructions}</h2>
		<p class="intro">${text.vignetteIntro}</p>
		<textarea id="vignetteInstructions" placeholder="${text.vignettePlaceholder}"></textarea>
		<div class="actions">
			<button class="action primary" data-command="writeVignette">${text.writeVignette}</button>
			<button class="action" id="editVignette" data-command="open">${text.editVignette}</button>
			<button class="action" id="openPdf" data-command="openPdf">${text.openPdf}</button>
		</div>
		<p class="small" id="noVignette">${text.noVignette}</p>
`,
			},
			{
				id: 'step-register',
				title: text.stepRegister,
				bodyHtml: `
		<div class="field">
			<label>${text.packageName}<input id="packageName" spellcheck="false"></label>
			<button class="action primary" data-submit="name">${text.save}</button>
			<button class="action" data-cancel="packageName">${text.cancel}</button>
			<p class="small hint">${text.nameHint}</p>
			<p class="error small" id="error-name"></p>
		</div>
		<p class="intro">${text.registerIntro}</p>
		<div class="actions">
			<button class="action primary" data-command="prepareRegistration">${text.prepareRegistration}</button>
			<button class="action open-code" data-command="open">${text.openCode}</button>
		</div>
`,
			},
			{
				id: 'step-package',
				title: text.stepPackage,
				bodyHtml: `
		<p class="intro">${text.packageIntro}</p>
		<div class="field">
			<label>${text.owner}<input id="owner" spellcheck="false"></label>
			<p class="small hint">${text.ownerHint}</p>
		</div>
		<div class="publish">
			<div class="row"><button class="action primary" data-publish="test">${text.packageTest}</button><span class="small">${text.packageTestDetail}</span></div>
			<div class="row"><button class="action" data-publish="push">${text.packagePush}</button><span class="small">${text.packagePushDetail}</span></div>
			<div class="row"><button class="action" data-publish="register">${text.packageRegister}</button><span class="small">${text.packageRegisterDetail}</span></div>
		</div>
		<p class="error small" id="error-package"></p>
`,
			},
		],
		pageScriptJs: `
	const TEXT = ${JSON.stringify(text)};
	const OPTIONS = { calls: true, licences: false };
	${ARTICLE_DATA_SCRIPT}
	let method;
	let draft = false;

	// The forms of the steps after Article and Data
	Object.assign(FORMS, {
		title: { send: () => ({ command: 'setTitle', title: value('title') }) },
		vignetteTitle: { send: () => ({ command: 'setVignetteTitle', title: value('vignetteTitle') }) },
		name: { send: () => ({ command: 'setName', name: value('packageName') }) },
	});
	document.querySelectorAll('button[data-publish]').forEach(button => button.addEventListener('click', () => {
		document.getElementById('error-package').textContent = '';
		vscode.postMessage({ command: 'package', action: button.dataset.publish, owner: value('owner') });
	}));

	// The Package Name suggested in its field: the title without spaces, PanelRandomEffects for Panel Random Effects
	function suggestName() {
		const name = value('title').split(/[^A-Za-z0-9]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
		document.getElementById('packageName').placeholder = TEXT.namePlaceholder.replace('{0}', /^[A-Z]/.test(name) ? name : 'PanelRandomEffects');
	}
	document.getElementById('title').addEventListener('input', suggestName);
	document.querySelector('button[data-cancel="title"]').addEventListener('click', suggestName);

	// The notes are saved as they are typed
	for (const [id, command] of [['instructions', 'instructions'], ['vignetteInstructions', 'vignetteInstructions']]) {
		const area = document.getElementById(id);
		let timer;
		area.addEventListener('input', () => {
			clearTimeout(timer);
			timer = setTimeout(() => vscode.postMessage({ command, text: area.value }), 500);
		});
	}

	editableHeading(TEXT.headingHint, () => method ? method.title : '', title => {
		set('title', title);
		delete document.getElementById('title').dataset.edited;
		vscode.postMessage({ command: 'setTitle', title });
		method = { ...method, title };
	});

	window.addEventListener('message', event => {
		const message = event.data;
		if (articleDataMessage(message) || message.command !== 'method') {
			return;
		}
		method = message.method;
		draft = message.draft;
		const draftHint = document.getElementById('draftHint');
		draftHint.hidden = !draft;
		stepLinks(draftHint, TEXT.draftHint, { '{0}': ['register', '4', TEXT.stepRegister], '{1}': ['article', '1', TEXT.stepArticle] });
		if (document.activeElement !== heading) { heading.textContent = method.title; }
		// 1. Article and Data
		showArticleData(method);
		// 2. Write a Method
		refresh('title', message.untitled ? '' : method.title);
		refresh('instructions', method.instructions);
		document.querySelectorAll('.open-code').forEach(button => { button.dataset.file = 'src/' + method.name + '.jl'; });
		// 3. Write a Vignette
		refresh('vignetteTitle', message.vignetteUntitled ? '' : method.vignetteTitle);
		refresh('vignetteInstructions', method.vignetteInstructions);
		const editVignette = document.getElementById('editVignette');
		editVignette.hidden = !method.vignette;
		editVignette.dataset.file = method.vignette || '';
		document.getElementById('openPdf').hidden = !method.vignettePdf;
		document.getElementById('noVignette').hidden = !!method.vignette;
		// 4. Prepare for Registration
		refresh('packageName', draft ? '' : method.name);
		suggestName();
		// 5. Package and Publish
		const owner = document.getElementById('owner');
		if (document.activeElement !== owner && !owner.value) {
			owner.value = message.owner;
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}


/** A method of the user's, as Browse Article Methods lists it. */
export interface IMethodSummary {
	/** The method's folder, as a URI string. */
	readonly id: string;
	readonly name: string;
	readonly title: string;
	readonly citation?: string;
	readonly inputs: number;
	readonly targets: number;
	/** No article, tables, instructions or code yet. */
	readonly empty: boolean;
	/** Not published yet: its package has not been pushed to GitHub. */
	readonly inProgress: boolean;
	readonly vignetteTitle: string;
	/** The vignette's PDF, as a URI string, when it exists. */
	readonly vignettePdf?: string;
}

/** Whether Package and Publish has pushed a method's package: its folder in ~/.pollis/packages has a GitHub remote. */
async function isPublished(fileService: IFileService, pathService: IPathService, method: IMethod): Promise<boolean> {
	const config = joinPath(packagesFolder(pathService), `${method.name}.jl`, '.git', 'config');
	return await fileService.exists(config) && (await fileService.readFile(config)).value.toString().includes('[remote "origin"]');
}

/** The user's methods, the folders of ~/.pollis/methods with a method.toml, for Browse Article Methods. */
export async function readMethodSummaries(fileService: IFileService, pathService: IPathService): Promise<IMethodSummary[]> {
	return Promise.all((await readMethods(fileService, pathService)).map(async method => ({
		id: method.folder.toString(),
		name: method.name,
		title: method.title,
		citation: method.citation,
		inputs: method.inputs.length,
		targets: method.targets.length,
		empty: await isEmptyMethod(fileService, method),
		inProgress: !await isPublished(fileService, pathService, method),
		vignetteTitle: method.vignetteTitle,
		vignettePdf: method.vignettePdf && joinPath(method.folder, ...method.vignettePdf.split('/')).toString(),
	})));
}

/**
 * The registry that Package and Publish registers method packages in, and the link of its `Vignettes.toml`, the
 * list of the published vignettes, when the registry is on GitHub.
 */
export function vignettesIndex(configurationService: IConfigurationService): { readonly registry: string; readonly url?: string } {
	const registry = configurationService.getValue<string>(REGISTRY_SETTING) || DEFAULT_REGISTRY;
	const github = /^https:\/\/github\.com\/(?<owner>[^/]+)\/(?<repository>[^/]+?)(?:\.git)?\/?$/.exec(registry)?.groups;
	return { registry, url: github && `https://raw.githubusercontent.com/${github.owner}/${github.repository}/HEAD/Vignettes.toml` };
}

/** The folder holding the user's methods, which Browse Article Methods watches. */
export function userMethodsFolder(pathService: IPathService): URI {
	return methodsFolder(pathService);
}

/** Opens the page of one of the user's methods, by its id. */
export async function openUserMethod(accessor: ServicesAccessor, id: string): Promise<void> {
	return openMethodPage(accessor, URI.parse(id));
}

/**
 * Deletes methods of the user's, by id, or all the empty ones, after asking: their folders go to the trash and
 * their pages close.
 */
export async function deleteUserMethods(accessor: ServicesAccessor, which: string | 'empty'): Promise<void> {
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const dialogService = accessor.get(IDialogService);
	const methods = await readMethods(fileService, pathService);
	let doomed: IMethod[];
	let message: string;
	let detail: string;
	if (which === 'empty') {
		doomed = [];
		for (const method of methods) {
			if (await isEmptyMethod(fileService, method)) {
				doomed.push(method);
			}
		}
		message = localize('newMethods.deleteEmpty.confirm', "Delete {0} empty methods?", doomed.length);
		detail = localize('newMethods.deleteEmpty.detail', "Article methods with no article, tables, instructions or code: {0}. Their folders go to the trash.", doomed.map(method => method.name).join(', '));
	} else {
		doomed = methods.filter(method => method.folder.toString() === which);
		message = localize('newMethods.delete.confirm', "Delete the method {0}?", doomed[0]?.title);
		detail = localize('newMethods.delete.detail', "Its folder {0} goes to the trash, with its tables, instructions and code.", doomed[0]?.folder.fsPath);
	}
	if (!doomed.length) {
		return;
	}
	const { confirmed } = await dialogService.confirm({
		message,
		detail,
		primaryButton: localize({ key: 'newMethods.delete.button', comment: ['&& denotes a mnemonic'] }, "&&Delete"),
	});
	if (!confirmed) {
		return;
	}
	for (const method of doomed) {
		openPages.get(method.folder.toString())?.dispose();
		await fileService.del(method.folder, { recursive: true, useTrash: true });
	}
}

/** Runs an agent task on a method, on the task's tier: from its page, with its folder; from elsewhere, Browse Article Methods opens to pick one. */
async function runMethodTask(accessor: ServicesAccessor, folder: URI | undefined, task: AgentTask, skillFolder: string, prompt: (skill: string, method: IMethod, test: string) => string, terminal: (method: IMethod) => string): Promise<void> {
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const configurationService = accessor.get(IConfigurationService);
	const instantiationService = accessor.get(IInstantiationService);
	const commandService = accessor.get(ICommandService);
	const method = folder && await readMethod(fileService, URI.from(folder));
	if (!method) {
		await commandService.executeCommand(BROWSE_METHODS_COMMAND_ID);
		return;
	}
	const skill = await instantiationService.invokeFunction(skillFile, skillFolder);
	if (!skill) {
		return;
	}
	await instantiationService.invokeFunction(startAgent, terminal(method), prompt(skill.fsPath, method, testCommand(configurationService, pathService, method)), method.folder, task);
}

const category = localize2('newMethods.category', "Article Methods");

registerAction2(class extends Action2 {
	constructor() {
		super({ id: CREATE_METHOD_COMMAND_ID, title: localize2('newMethods.create', "Create Article Method"), category, f1: true });
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openMethodPage(accessor);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({ id: PACKAGE_METHOD_COMMAND_ID, title: localize2('newMethods.package', "Package and Publish..."), category, f1: true });
	}
	async run(accessor: ServicesAccessor, folder?: URI): Promise<void> {
		if (folder) {
			return openMethodPage(accessor, URI.from(folder), 'package');
		}
		await accessor.get(ICommandService).executeCommand(BROWSE_METHODS_COMMAND_ID);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({ id: WRITE_METHOD_COMMAND_ID, title: localize2('newMethods.writeMethod', "Write a Method..."), category, f1: true });
	}
	run(accessor: ServicesAccessor, folder?: URI): Promise<void> {
		return runMethodTask(accessor, folder, 'writeMethod', 'write-method',
			(skill, method, test) => localize('newMethods.writeMethod.prompt', "Read the skill {0} and follow its instructions to write the Pollis method in {1} with me. The test command is: {2}", skill, method.folder.fsPath, test),
			method => localize('newMethods.writeMethod.terminal', "Write {0}", method.title));
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({ id: WRITE_VIGNETTE_COMMAND_ID, title: localize2('newMethods.writeVignette', "Write a Vignette..."), category, f1: true });
	}
	run(accessor: ServicesAccessor, folder?: URI): Promise<void> {
		return runMethodTask(accessor, folder, 'writeVignette', 'write-vignette',
			(skill, method, test) => localize('newMethods.writeVignette.prompt', "Read the skill {0} and follow its instructions to write the vignette of the Pollis method in {1} with me. The test command is: {2}", skill, method.folder.fsPath, test),
			method => localize('newMethods.writeVignette.terminal', "Vignette of {0}", method.title));
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({ id: PREPARE_REGISTRATION_COMMAND_ID, title: localize2('newMethods.prepareRegistration', "Prepare for Registration..."), category, f1: true });
	}
	run(accessor: ServicesAccessor, folder?: URI): Promise<void> {
		return runMethodTask(accessor, folder, 'prepareRegistration', 'prepare-method',
			(skill, method, test) => localize('newMethods.prepareRegistration.prompt', "Read the skill {0} and follow its instructions to prepare the Pollis method in {1} for registration with me. The test command is: {2}", skill, method.folder.fsPath, test),
			method => localize('newMethods.prepareRegistration.terminal', "Prepare {0}", method.title));
	}
});
