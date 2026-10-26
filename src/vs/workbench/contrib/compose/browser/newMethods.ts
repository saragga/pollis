/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { streamToBuffer, VSBuffer } from '../../../../base/common/buffer.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { FileAccess } from '../../../../base/common/network.js';
import { isWindows } from '../../../../base/common/platform.js';
import { basename, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { BrowserViewCommandId } from '../../../../platform/browserView/common/browserView.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProgressService, ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { asText, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IEditorService, SIDE_GROUP } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { parseToml, TomlValue } from '../../model/browser/common/tomlPanelData.js';
import { defaultCopyFolder, isInsidePollis } from '../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { ITerminalService } from '../../terminal/browser/terminal.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { AGENT_BADGE_CSS, AGENT_ICON } from './agentBadge.js';
import { PREPARE_REGISTRATION_COMMAND_ID, skillFile, startAgent, WRITE_METHOD_COMMAND_ID, WRITE_VIGNETTE_COMMAND_ID } from './pollisAgents.js';
import { AgentTask } from './modelRouting.js';
import { voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';

// Compose > Under Construction..., formerly Compose > Methods > Create Methods (Browse Methods, which lists them, is in workflowLibrary.ts).
// A method is a folder of ~/.pollis/methods with method.toml, its code in src/NAME.jl (module NAME),
// the published results it must reproduce in targets/*.csv and the user's notes for a coding agent in
// INSTRUCTIONS.md. Create Methods opens the page of a new method with no folder: the first thing typed or added makes it, named after the title, else NewMethod
// while it is still empty. Each method opens on its own page beside the article, shown in the integrated browser in an in-memory session. The article
// and the input data are only links in method.toml: the page reads the data into memory to show it, and
// nothing of either is written to disk, not even a cache. Only when the user asks, Save a Copy... keeps a
// copy outside Pollis (by default in the data folder of a Pollis Workspace) and records its path as `local`;
// the page then reads the copy, falling back to the link if it is gone. Everything is done on the pages,
// with no pickers: tables are added, the method renamed and its article set with forms on the page. Package
// and Publish, a tab of the page, runs media/methods/package.jl, which makes the package NAME.jl in
// ~/.pollis/packages, its tests the target tables computed from the data downloaded from the links, runs
// them and, if asked, pushes the package to GitHub when they all pass and registers it in the Pollis
// registry when it also meets the registry rules (a name of at least 5 characters, a usage example, a
// docstring for every exported name). Three tasks hand a method to the user's coding agent, with the skills
// of the Pollis Agents plugin: Write a Method... (write-method: the code that reproduces the targets), Write
// a Vignette... (write-vignette: the method's documentation) and Prepare for Registration...
// (prepare-method: the rules). Their commands, run without a method, open Browse Methods.

export const CREATE_METHOD_COMMAND_ID = 'pollis.newMethods.create';
export const PACKAGE_METHOD_COMMAND_ID = 'pollis.newMethods.package';
/** Browse Methods, registered in workflowLibrary.ts: the user's methods and the methods shipped with Pollis. */
export const BROWSE_METHODS_COMMAND_ID = 'pollis.compose.createMethod';

const GITHUB_OWNER_SETTING = 'pollis.newMethods.githubOwner';
const REGISTRY_SETTING = 'pollis.newMethods.registry';
const DEFAULT_REGISTRY = 'https://github.com/Trumpingtons/PollisRegistry';
const DATASETS_URL = 'https://raw.githubusercontent.com/Trumpingtons/PollisDatasets.jl/main';
const PACKAGE_SCRIPT = 'vs/workbench/contrib/compose/browser/media/methods/package.jl';
const INSTRUCTIONS_FILE = 'INSTRUCTIONS.md';
const VIGNETTE_INSTRUCTIONS_FILE = 'VIGNETTE.md';
/** The rows of an input table the page shows. */
const PREVIEW_ROWS = 10;

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'pollisNewMethods',
	title: localize('newMethods.configurationTitle', "Methods"),
	type: 'object',
	properties: {
		[GITHUB_OWNER_SETTING]: {
			type: 'string',
			default: 'Trumpingtons',
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('newMethods.githubOwner', "The GitHub user or organization that **Package and Publish** (Compose > Methods) pushes method packages to."),
		},
		[REGISTRY_SETTING]: {
			type: 'string',
			default: DEFAULT_REGISTRY,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('newMethods.registry', "The Julia package registry that **Package and Publish** (Compose > Methods) registers method packages in, when they meet the Pollis registry rules. Their vignettes are listed in its `Vignettes.toml`, which Help > Documentation > Package Vignettes shows."),
		},
	},
});

/** The rows of a table as the page shows them. */
interface ITableContent {
	readonly header: readonly string[];
	readonly rows: readonly (readonly string[])[];
	readonly rowCount: number;
}

/** An input table: a link to the data, read into memory when shown, or a file of the method typed in. */
interface IMethodInput {
	/** Its variable name in the calls. */
	readonly name: string;
	readonly url?: string;
	/** The path in the method folder of a table typed in, e.g. `inputs/prices.csv`. */
	readonly file?: string;
	readonly source?: string;
	/** `,` (the default), `;`, `tab` or `whitespace`. */
	readonly delim?: string;
	/** The column names of a file without a header line. */
	readonly columns?: readonly string[];
	/** The line of the first row, when lines before it are not the header (the header is then left out too). */
	readonly skipto?: number;
	/** The number of rows to read, when the file goes on after them. */
	readonly limit?: number;
	/** The path of a copy the user saved, read instead of the link while it exists. */
	readonly local?: string;
}

/** A target table: the published results, typed in as printed. */
interface IMethodTarget extends ITableContent {
	readonly name: string;
	/** The path in the method folder, e.g. `targets/table1.csv`. */
	readonly file: string;
	readonly source?: string;
	/** The Julia call that computes it. */
	readonly call?: string;
}

interface IMethod {
	readonly folder: URI;
	readonly name: string;
	readonly title: string;
	readonly citation?: string;
	/** The link to read the article: its own, or its DOI's. */
	readonly article?: string;
	/** The path of a copy of the article the user saved, opened instead of the link while it exists. */
	readonly articleLocal?: string;
	readonly inputs: readonly IMethodInput[];
	readonly targets: readonly IMethodTarget[];
	readonly instructions: string;
	/** The vignette's title, the method's by default. */
	readonly vignetteTitle: string;
	/** The notes for a coding agent on the vignette, in VIGNETTE.md. */
	readonly vignetteInstructions: string;
	/** The vignette's LaTeX file and PDF, `vignette/NAME.tex` and `.pdf`, when they exist. */
	readonly vignette?: string;
	readonly vignettePdf?: string;
}

/** The fields of a line of a delimited file; with `,` or `;`, a field in double quotes may hold the delimiter and doubled quotes. */
function fields(line: string, delim = ','): string[] {
	if (delim === 'whitespace') {
		return line.trim().split(/\s+/);
	}
	if (delim === 'tab') {
		return line.split('\t');
	}
	const separator = delim === ';' ? ';' : ',';
	const result: string[] = [];
	for (const match of line.matchAll(new RegExp(`(?:^|${separator})(?:"(?<quoted>(?:[^"]|"")*)"|(?<plain>[^${separator}]*))`, 'g'))) {
		result.push(match.groups!.quoted !== undefined ? match.groups!.quoted.replace(/""/g, '"') : match.groups!.plain ?? '');
	}
	return result;
}

/** The first rows of a delimited text, its header the first line unless the column names are given; `skipto` and `rows` (an input's `limit`) as in {@link IMethodInput}. */
function parseTable(content: string, limit: number, delim?: string, columns?: readonly string[], skipto?: number, rows?: number): ITableContent {
	const all = content.replace(/\r\n?/g, '\n').split('\n');
	const lines = (skipto ? all.slice(skipto - 1) : all).filter(line => line.trim());
	const body = (columns || skipto ? lines : lines.slice(1)).slice(0, rows);
	return {
		header: columns ?? fields(all.find(line => line.trim()) ?? '', delim),
		rows: body.slice(0, limit).map(line => fields(line, delim)),
		rowCount: body.length,
	};
}

function count(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined;
}

function methodsFolder(pathService: IPathService): URI {
	return joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'methods');
}

function text(value: unknown): string | undefined {
	return typeof value === 'string' && value ? value : undefined;
}

function table(value: unknown): TomlValue {
	return value && typeof value === 'object' ? value as TomlValue : {};
}

/** Reads a method folder; undefined when it has no method.toml. */
async function readMethod(fileService: IFileService, folder: URI): Promise<IMethod | undefined> {
	const tomlFile = joinPath(folder, 'method.toml');
	if (!await fileService.exists(tomlFile)) {
		return undefined;
	}
	const toml = parseToml((await fileService.readFile(tomlFile)).value.toString());

	const inputs: IMethodInput[] = [];
	for (const [name, value] of Object.entries(table(toml.inputs))) {
		const spec = table(value);
		const url = text(spec.url);
		const file = text(spec.file);
		if (url || file) {
			const columns = Array.isArray(spec.columns) ? spec.columns.filter((column): column is string => typeof column === 'string') : undefined;
			inputs.push({ name, url, file, source: text(spec.source), delim: text(spec.delim), columns: columns?.length ? columns : undefined, skipto: count(spec.skipto), limit: count(spec.limit), local: text(spec.local) });
		}
	}

	const targets: IMethodTarget[] = [];
	const targetsFolder = joinPath(folder, 'targets');
	for (const child of await fileService.exists(targetsFolder) ? (await fileService.resolve(targetsFolder)).children ?? [] : []) {
		if (child.isDirectory || !child.name.endsWith('.csv')) {
			continue;
		}
		const name = child.name.slice(0, -4);
		const spec = table(table(toml.targets)[name]);
		targets.push({
			name,
			file: `targets/${child.name}`,
			source: text(spec.source),
			call: text(spec.call),
			...parseTable((await fileService.readFile(child.resource)).value.toString(), Number.MAX_SAFE_INTEGER),
		});
	}

	const name = text(toml.name) ?? basename(folder);
	const title = text(toml.title) ?? name;
	const doi = text(toml.doi);
	const readText = async (file: URI) => await fileService.exists(file) ? (await fileService.readFile(file)).value.toString() : '';
	const existing = async (path: string) => await fileService.exists(joinPath(folder, ...path.split('/'))) ? path : undefined;
	return {
		folder,
		name,
		title,
		citation: text(toml.citation),
		article: text(toml.article) ?? (doi ? `https://doi.org/${doi}` : undefined),
		articleLocal: text(toml.article_local),
		inputs: inputs.sort((a, b) => a.name.localeCompare(b.name)),
		targets: targets.sort((a, b) => a.name.localeCompare(b.name)),
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

/** A TOML string. */
function tomlString(value: string): string {
	return `"${value.replace(/[\\"]/g, '\\$&')}"`;
}

function methodToml(name: string, title: string, article: string): string {
	return [
		'# A Pollis method (Compose > Methods). Create Method shows the article and the tables; Package and',
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

/** A Julia variable name made from a file name or a link. */
function variableName(file: string): string {
	const name = file.replace(/[?#].*$/, '').replace(/^.*\//, '').replace(/\.\w+$/, '').replace(/\W+/g, '_').replace(/^(?=\d)/, '_');
	return name || 'data';
}

async function appendToml(fileService: IFileService, folder: URI, block: string): Promise<void> {
	const file = joinPath(folder, 'method.toml');
	const content = (await fileService.readFile(file)).value.toString();
	await fileService.writeFile(file, VSBuffer.fromString(content.replace(/\n*$/, '\n\n') + block));
}

/**
 * Sets a string value in method.toml: at the top level, or in the table `[section]`. An existing line of the
 * key is replaced; otherwise the line goes after the top level's last value, or after the table's header.
 */
async function setTomlValue(fileService: IFileService, folder: URI, section: string | undefined, key: string, value: string): Promise<void> {
	const file = joinPath(folder, 'method.toml');
	const lines = (await fileService.readFile(file)).value.toString().split('\n');
	const header = section === undefined ? -1 : lines.findIndex(line => line.trim() === `[${section}]`);
	if (section !== undefined && header < 0) {
		throw new Error(localize('newMethods.toml.noSection', "method.toml has no [{0}] table.", section));
	}
	const next = lines.findIndex((line, index) => index > header && /^\s*\[/.test(line));
	const end = next < 0 ? lines.length : next;
	const line = `${key} = ${tomlString(value)}`;
	const existing = lines.findIndex((candidate, index) => index > header && index < end && new RegExp(`^\\s*${key}\\s*=`).test(candidate));
	if (existing >= 0) {
		lines[existing] = line;
	} else if (section !== undefined) {
		lines.splice(header + 1, 0, line);
	} else {
		let last = end - 1;
		while (last >= 0 && !/^\s*\w+\s*=/.test(lines[last])) {
			last--;
		}
		lines.splice(last + 1, 0, line);
	}
	await fileService.writeFile(file, VSBuffer.fromString(lines.join('\n')));
}

/** Sets the article link in method.toml. */
function setArticle(fileService: IFileService, folder: URI, url: string): Promise<void> {
	return setTomlValue(fileService, folder, undefined, 'article', url);
}

function validateLink(value: string): string | undefined {
	return /^https?:\/\/\S+$/.test(value.trim()) ? undefined : localize('newMethods.link.invalid', "A link starting with https://");
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
	await setTomlValue(fileService, folder, undefined, 'title', title || name);
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
		await setTomlValue(fileService, folder, undefined, 'name', name);
		const target = joinPath(root, name);
		if (basename(folder) !== name) {
			await fileService.move(folder, target);
			folder = target;
		}
	}
	return folder;
}

async function download(requestService: IRequestService, url: string): Promise<string> {
	const context = await requestService.request({ type: 'GET', url, callSite: 'newMethods.data' }, CancellationToken.None);
	if (!isSuccess(context)) {
		throw new Error(localize('newMethods.downloadFailed', "Reading {0} failed (server returned {1}).", url, context.res.statusCode ?? '?'));
	}
	return (await asText(context)) ?? '';
}

async function downloadBytes(requestService: IRequestService, url: string): Promise<VSBuffer> {
	const context = await requestService.request({ type: 'GET', url, callSite: 'newMethods.copy' }, CancellationToken.None);
	if (!isSuccess(context)) {
		throw new Error(localize('newMethods.downloadFailed', "Reading {0} failed (server returned {1}).", url, context.res.statusCode ?? '?'));
	}
	return streamToBuffer(context.stream);
}

/** The services that saving a copy needs. */
interface ICopyServices {
	readonly fileService: IFileService;
	readonly fileDialogService: IFileDialogService;
	readonly requestService: IRequestService;
	readonly progressService: IProgressService;
	readonly contextService: IWorkspaceContextService;
	readonly pathService: IPathService;
	readonly environmentService: IEnvironmentService;
}

/**
 * Saves a copy of a link's file where the user chooses, never inside Pollis, and returns its path. The save
 * dialog starts in the data folder of an open Pollis Workspace, else in the first open folder.
 */
async function saveCopy(services: ICopyServices, url: string, fileName: string): Promise<string | undefined> {
	const { fileService, fileDialogService, requestService, progressService, contextService, pathService, environmentService } = services;
	const folder = await defaultCopyFolder(contextService, fileService);
	const target = await fileDialogService.showSaveDialog({
		title: localize('newMethods.copy.title', "Save a Copy outside Pollis"),
		defaultUri: folder ? joinPath(folder, fileName) : undefined,
	});
	if (!target) {
		return undefined;
	}
	if (isInsidePollis(target, pathService, environmentService)) {
		throw new Error(localize('newMethods.copy.insidePollis', "Copies are kept outside Pollis, e.g. in a Pollis Workspace (File > New Pollis Workspace...): choose a place outside {0}.", target.fsPath));
	}
	const bytes = await progressService.withProgress({ location: ProgressLocation.Notification, title: localize('newMethods.copy.progress', "Saving a copy of {0}...", url) }, () => downloadBytes(requestService, url));
	await fileService.writeFile(target, bytes);
	return target.fsPath;
}

/** The file name for a copy of a link. */
function copyName(url: string, name: string, extension: string): string {
	const last = url.replace(/[?#].*$/, '').replace(/\/+$/, '').replace(/^.*\//, '');
	return /\.\w{1,5}$/.test(last) ? decodeURIComponent(last) : `${name}${extension}`;
}

/** The names of input and target tables, which are Julia variables. */
const TABLE_NAME = /^[A-Za-z_]\w*$/;
const DELIMITERS = [',', 'whitespace', 'tab', ';'];

/** Throws when a table name is not a variable name or the method already has a table of that name. */
function checkTableName(method: IMethod, name: string): void {
	if (!TABLE_NAME.test(name)) {
		throw new Error(localize('newMethods.table.nameInvalid', "A table's name: letters, digits and underscores, not starting with a digit."));
	}
	if ([...method.inputs, ...method.targets].some(table => table.name === name)) {
		throw new Error(localize('newMethods.table.nameExists', "The method already has a table {0}.", name));
	}
}

/** Adds an input table from a link to a delimited text file. */
async function addInputLink(fileService: IFileService, method: IMethod, url: string, name: string, delim: string): Promise<void> {
	const invalid = validateLink(url);
	if (invalid) {
		throw new Error(invalid);
	}
	checkTableName(method, name);
	const separator = DELIMITERS.includes(delim) ? delim : ',';
	await appendToml(fileService, method.folder, `[inputs.${name}]\nurl = ${tomlString(url)}\nsource = ""\n${separator === ',' ? '' : `delim = ${tomlString(separator)}\n`}`);
}

/** A dataset of PollisDatasets, as the page lists it. */
interface IDataset {
	readonly id: string;
	readonly title: string;
	readonly domain: string;
}

/** The datasets of PollisDatasets, from its catalogue. */
async function datasetCatalogue(requestService: IRequestService): Promise<IDataset[]> {
	const catalogue = await download(requestService, `${DATASETS_URL}/datasets.toml`);
	const datasets: IDataset[] = [];
	for (const match of catalogue.matchAll(/^id = "(?<id>[\w-]+)"\s*\ntitle = "(?<title>[^"]*)"\s*\ndomain = "(?<domain>[^"]*)"/gm)) {
		datasets.push({ id: match.groups!.id, title: match.groups!.title, domain: match.groups!.domain });
	}
	return datasets;
}

/** Adds an input table from a dataset of PollisDatasets. */
async function addDataset(fileService: IFileService, method: IMethod, dataset: IDataset): Promise<void> {
	const name = variableName(dataset.id);
	checkTableName(method, name);
	await appendToml(fileService, method.folder, `[inputs.${name}]\nurl = ${tomlString(`${DATASETS_URL}/data/${dataset.id}.csv`)}\nsource = ${tomlString(`PollisDatasets: ${dataset.title}`)}\n`);
}

function targetBlock(name: string): string {
	return `[targets.${name}]\nsource = ""\ncall = ""\ntolerance = 0\n`;
}

/** Adds an empty target table, to type in from the article, and opens it. */
async function addEmptyTarget(fileService: IFileService, editorService: IEditorService, method: IMethod, name: string): Promise<void> {
	checkTableName(method, name);
	const file = joinPath(method.folder, 'targets', `${name}.csv`);
	await fileService.writeFile(file, VSBuffer.fromString('label,Column 1,Column 2\nRow 1,,\nRow 2,,\n'));
	await appendToml(fileService, method.folder, targetBlock(name));
	await editorService.openEditor({ resource: file });
}

/** Adds target tables from CSV files the user picks, then opens method.toml for their calls. */
async function addTargetFiles(fileService: IFileService, fileDialogService: IFileDialogService, editorService: IEditorService, folder: URI): Promise<void> {
	const files = await fileDialogService.showOpenDialog({ canSelectMany: true, filters: [{ name: 'CSV', extensions: ['csv'] }] });
	for (const file of files ?? []) {
		const name = variableName(basename(file));
		await fileService.copy(file, joinPath(folder, 'targets', `${name}.csv`), true);
		await appendToml(fileService, folder, targetBlock(name));
	}
	if (files?.length) {
		await editorService.openEditor({ resource: joinPath(folder, 'method.toml') });
	}
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

/** Adds an empty input table, a file of the method to type in from the article, and opens it. */
async function addEmptyInput(fileService: IFileService, editorService: IEditorService, method: IMethod, name: string): Promise<void> {
	checkTableName(method, name);
	const file = `inputs/${name}.csv`;
	await fileService.writeFile(joinPath(method.folder, 'inputs', `${name}.csv`), VSBuffer.fromString('Column 1,Column 2\n,\n,\n'));
	await appendToml(fileService, method.folder, `[inputs.${name}]\nfile = ${tomlString(file)}\nsource = ""\n`);
	await editorService.openEditor({ resource: joinPath(method.folder, 'inputs', `${name}.csv`) });
}

/** What Add from Article asks the coding agent: to type the article's tables in as input or target tables. */
function articlePrompt(method: IMethod, kind: 'inputs' | 'targets', tables: string): string {
	const read = localize('newMethods.fromArticle.read', "Read the article of the Pollis method in {0}: its link is article in method.toml, else the page of its doi. Do not save a copy of it.", method.folder.fsPath);
	const task = kind === 'targets'
		? localize('newMethods.fromArticle.targets', "Type in its tables {0} as target tables: for each, targets/NAME.csv (NAME like table3_2) with the row labels in the first column and every value exactly as printed (the same digits and signs, never rounded or recomputed, an empty cell where the table has none), and in method.toml a [targets.NAME] table with source = \"Table 3.2, page 41 (typed in by a coding agent)\", call = \"\" and tolerance = 0.", tables)
		: localize('newMethods.fromArticle.inputs', "Type in its tables {0} as input data: for each, inputs/NAME.csv (NAME like table3_2) with a header line of column names and every value exactly as printed, and in method.toml an [inputs.NAME] table with file = \"inputs/NAME.csv\" and source = \"Table 3.2, page 41 (typed in by a coding agent)\".", tables);
	const check = localize('newMethods.fromArticle.check', "Change nothing else. Then list each table you typed in, with its size, and every value you could not read for certain, so that I can check them against the article.");
	return `${read} ${task} ${check}`;
}

/** The agent tasks of a method, by the command the pages send. */
const AGENT_TASKS: { readonly [command: string]: string } = {
	writeMethod: WRITE_METHOD_COMMAND_ID,
	writeVignette: WRITE_VIGNETTE_COMMAND_ID,
	prepareRegistration: PREPARE_REGISTRATION_COMMAND_ID,
};

type MethodMessage =
	| { readonly command: 'ready' | 'openArticle' | 'saveArticle' | 'addTargetFiles' | 'catalogue' | 'openPdf' }
	| { readonly command: 'writeMethod' | 'writeVignette' | 'prepareRegistration' }
	| { readonly command: 'setTitle' | 'setVignetteTitle'; readonly title: string }
	| { readonly command: 'setName'; readonly name: string }
	| { readonly command: 'setArticle'; readonly url: string }
	| { readonly command: 'addLink'; readonly url: string; readonly name: string; readonly delim: string }
	| { readonly command: 'addDataset'; readonly id: string }
	| { readonly command: 'addInput' | 'addTarget'; readonly name: string }
	| { readonly command: 'fromArticle'; readonly kind: 'inputs' | 'targets'; readonly tables: string }
	| { readonly command: 'package'; readonly action: PublishAction; readonly owner: string }
	| { readonly command: 'saveInput'; readonly name: string }
	| { readonly command: 'open'; readonly file: string }
	| { readonly command: 'instructions' | 'vignetteInstructions'; readonly text: string };

/** The open pages, by method folder, so a second request shows the same page. */
const openPages = new Map<string, WebviewInput>();

/** A free provisional name for a new method, after its title when it has one, else NewMethod: NewMethod, NewMethod2... */
async function draftName(fileService: IFileService, root: URI, title = ''): Promise<string> {
	const fromTitle = title.split(/[^A-Za-z0-9]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
	const base = /^[A-Z]/.test(fromTitle) ? fromTitle : 'NewMethod';
	const taken = new Set(((await fileService.exists(root)) ? (await fileService.resolve(root)).children ?? [] : []).map(child => child.name.toLowerCase()));
	for (let n = 1; ; n++) {
		const name = n === 1 ? base : `${base}${n}`;
		if (!taken.has(name.toLowerCase())) {
			return name;
		}
	}
}

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

	let draft = !existing;
	// Whether the method's folder exists: a new method has none until the first thing is typed or added
	let created = !!existing;
	// A draft's title until the user gives it one: its Title field shows the example instead
	const draftTitle = localize('newMethods.draft.title', "New Method");
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
	let method = created ? await readMethod(fileService, folder) : { folder, name: basename(folder), title: draftTitle, inputs: [], targets: [], instructions: '', vignetteTitle: draftTitle, vignetteInstructions: '' };
	if (!method) {
		return;
	}
	// A saved copy, when the user made one and it is still there, else the link
	const copy = async (local: string | undefined) => local && await fileService.exists(URI.file(local)) ? URI.file(local) : undefined;
	const openArticle = async () => {
		const local = await copy(method?.articleLocal);
		const url = local?.toString(true) ?? method?.article;
		if (url) {
			await commandService.executeCommand(BrowserViewCommandId.Open, { url, reuseUrlFilter: url, ephemeral: true });
		}
	};
	await openArticle();
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

	// The input tables, read into memory once for each link, or from the copy the user saved or the file typed in
	const data = new Map<string, Promise<string>>();
	const read = async (input: IMethodInput) => {
		const local = input.file ? joinPath(folder, ...input.file.split('/')) : await copy(input.local);
		return local ? (await fileService.readFile(local)).value.toString() : download(requestService, input.url ?? '');
	};
	const postInputs = () => {
		for (const input of method?.inputs ?? []) {
			// Files typed in are read each time, since they change
			const key = `${input.url}\n${input.local ?? ''}`;
			let content = input.file ? undefined : data.get(key);
			if (!content) {
				content = read(input);
				if (!input.file) {
					data.set(key, content);
				}
			}
			content.then(
				value => webviewInput.webview.postMessage({ command: 'input', name: input.name, table: parseTable(value, PREVIEW_ROWS, input.delim, input.columns, input.skipto, input.limit) }),
				error => webviewInput.webview.postMessage({ command: 'input', name: input.name, error: toErrorMessage(error) })
			);
		}
	};
	const post = () => {
		webviewInput.webview.postMessage({ command: 'method', method: method && { ...method, folder: method.folder.fsPath }, draft, untitled: method?.title === draftTitle, vignetteUntitled: method?.vignetteTitle === draftTitle, owner: configurationService.getValue<string>(GITHUB_OWNER_SETTING) || '' });
		postInputs();
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
		folder = await newMethod(fileService, pathService, name ?? await draftName(fileService, root, title), title || draftTitle, '');
		method = await readMethod(fileService, folder) ?? method;
		created = true;
		openPages.set(folder.toString(), webviewInput);
		watch();
	})();
	// What a new method's folder is made for: the first thing typed or added (a Package Name makes it itself)
	const makes = (message: MethodMessage) => {
		switch (message.command) {
			case 'setTitle': return !!message.title.trim();
			case 'instructions': case 'vignetteInstructions': return !!message.text.trim();
			case 'setVignetteTitle': case 'setArticle': case 'addLink': case 'addDataset': case 'addInput': case 'addTarget': case 'addTargetFiles':
			case 'writeMethod': case 'writeVignette': case 'prepareRegistration': case 'open': return true;
			default: return false;
		}
	};

	const copyServices: ICopyServices = { fileService, fileDialogService, requestService, progressService, contextService, pathService, environmentService };
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
	let datasets: Promise<IDataset[]> | undefined;

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
				await setTomlValue(fileService, folder, undefined, 'title', title);
				webviewInput.setWebviewTitle(title);
				method = await readMethod(fileService, folder) ?? method;
				post();
			});
		} else if (message.command === 'setVignetteTitle') {
			submit('vignetteTitle', async () => {
				await setTomlValue(fileService, folder, undefined, 'vignette_title', message.title.trim());
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
		} else if (message.command === 'setArticle') {
			submit('article', async () => {
				const url = message.url.trim();
				const invalid = validateLink(url);
				if (invalid) {
					throw new Error(invalid);
				}
				await setArticle(fileService, folder, url);
				method = await readMethod(fileService, folder) ?? method;
				await openArticle();
			});
		} else if (message.command === 'addLink') {
			submit('link', () => addInputLink(fileService, current, message.url.trim(), message.name.trim(), message.delim));
		} else if (message.command === 'catalogue') {
			datasets ??= datasetCatalogue(requestService);
			datasets.then(
				items => webviewInput.webview.postMessage({ command: 'catalogue', items }),
				error => {
					datasets = undefined;
					webviewInput.webview.postMessage({ command: 'formError', form: 'datasets', message: toErrorMessage(error) });
				}
			);
		} else if (message.command === 'addDataset') {
			submit('datasets', async () => {
				const dataset = (await datasets)?.find(candidate => candidate.id === message.id);
				if (dataset) {
					await addDataset(fileService, current, dataset);
				}
			});
		} else if (message.command === 'addInput') {
			submit('input', () => addEmptyInput(fileService, editorService, current, message.name.trim()));
		} else if (message.command === 'addTarget') {
			submit('target', () => addEmptyTarget(fileService, editorService, current, message.name.trim()));
		} else if (message.command === 'fromArticle') {
			const form = message.kind === 'targets' ? 'targetArticle' : 'inputArticle';
			submit(form, async () => {
				const tables = message.tables.trim();
				if (!tables) {
					throw new Error(localize('newMethods.fromArticle.noTables', "The numbers of the tables, e.g. 3.2, 5.8"));
				}
				if (!current.article && !current.articleLocal) {
					throw new Error(localize('newMethods.fromArticle.noArticle', "Set the article's link first."));
				}
				await instantiationService.invokeFunction(startAgent, localize('newMethods.fromArticle.terminal', "Tables of {0}", current.name), articlePrompt(current, message.kind, tables), folder, 'tablesFromArticle');
			});
		} else if (message.command === 'addTargetFiles') {
			run(() => addTargetFiles(fileService, fileDialogService, editorService, folder));
		} else if (message.command === 'package') {
			submit('package', () => instantiationService.invokeFunction(packageMethod, current, message.action, message.owner.trim()));
		} else if (message.command === 'openArticle') {
			run(openArticle);
		} else if (message.command === 'openPdf') {
			if (current.vignettePdf) {
				const url = joinPath(folder, ...current.vignettePdf.split('/')).toString(true);
				run(async () => { await commandService.executeCommand(BrowserViewCommandId.Open, { url, reuseUrlFilter: url }); });
			}
		} else if (message.command === 'saveArticle') {
			run(async () => {
				if (current.article) {
					const local = await saveCopy(copyServices, current.article, copyName(current.article, current.name, '.pdf'));
					if (local) {
						await setTomlValue(fileService, folder, undefined, 'article_local', local);
					}
				}
			});
		} else if (message.command === 'saveInput') {
			run(async () => {
				const input = current.inputs.find(candidate => candidate.name === message.name);
				if (input?.url) {
					const local = await saveCopy(copyServices, input.url, copyName(input.url, input.name, '.csv'));
					if (local) {
						await setTomlValue(fileService, folder, `inputs.${input.name}`, 'local', local);
					}
				}
			});
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



/** The styles of the method page. */
const PAGE_STYLE = `
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { padding: 20px; }
		h1 { font-size: 26px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		h1[contenteditable] { color: var(--vscode-textLink-foreground); display: inline-block; min-width: 120px; padding: 0 2px; border-radius: 2px; cursor: text; }
		h1[contenteditable]:hover { outline: 1px dashed var(--vscode-textLink-foreground); }
		h1[contenteditable]:focus { outline: 1px solid var(--vscode-focusBorder); }
		h2 { font-size: 15px; font-weight: 600; margin: 24px 0 8px 0; }
		.subtitle, .intro, .small { color: var(--vscode-descriptionForeground); }
		.subtitle { margin: 0 0 12px 0; line-height: 1.4; }
		.intro { margin: 0 0 12px 0; line-height: 1.4; max-width: 900px; }
		.small { font-size: 12px; }
		.actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 12px 0; }
		button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; box-shadow: inset 0 0 0 1px var(--vscode-button-background); border-radius: 2px; padding: 4px 12px; cursor: pointer; font-size: 11px; opacity: 0.7; }
		/* As the code buttons below a panel's Example Code: dimmed until pointed at, the blue one not */
		button.action:not(:disabled):hover, button.action.current, button.action.primary { opacity: 1; }
		button.action:hover { background: var(--vscode-button-secondaryHoverBackground); }
		button.action:disabled { cursor: default; opacity: 0.6; }
${AGENT_BADGE_CSS}
		button.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.primary:hover { background: var(--vscode-button-hoverBackground); }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.link:hover { text-decoration: underline; }
		.error { color: var(--vscode-errorForeground); }
		[hidden] { display: none !important; }
		.form { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 10px; margin: 0 0 12px 0; padding: 10px 12px; border: 1px solid var(--vscode-widget-border); border-radius: 4px; max-width: 1000px; }
		.form label { display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.form .error { flex-basis: 100%; margin: 0; }
		.form .error:empty { display: none; }
		input, select { font-family: var(--vscode-font-family); font-size: 13px; padding: 4px 6px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
		input.wide { width: 420px; max-width: 100%; }
		input:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); }`;

/**
 * The method page, its five steps as tabs: its texts come from here, the method from the `method` message
 * and each input table from an `input` message.
 */
function pageHtml(): string {
	const text = {
		// The steps
		stepArticle: localize('newMethods.step.article', "Article and Data"),
		stepMethod: localize('newMethods.step.method', "Write a Method"),
		stepVignette: localize('newMethods.step.vignette', "Write a Vignette"),
		stepRegister: localize('newMethods.step.register', "Prepare for Registration"),
		stepPackage: localize('newMethods.step.package', "Package and Publish"),
		draftHint: localize('newMethods.draft.hint', "A new method: its Package Name is set in {0}. Start with its article and tables in {1}. Nothing is saved until you type or add something, and its folder is named after its title until you give it a Package Name."),
		// 1. Article and Data
		article: localize('newMethods.page.article', "Article"),
		inputs: localize('newMethods.page.inputs', "Input Tables"),
		targets: localize('newMethods.page.targets', "Target Tables"),
		articleIntro: localize('newMethods.page.articleIntro', "The article the method comes from. Pollis opens it in the integrated browser and keeps no copy unless you save one."),
		articleLink: localize('newMethods.page.articleLink', "Article Link"),
		saveCopy: localize('newMethods.page.saveCopy', "Save a Copy..."),
		copy: localize('newMethods.page.copy', "Copy: {0} (read instead of the link while it exists)"),
		inputsIntro: localize('newMethods.page.inputsIntro', "The data the method is computed from: links, read into memory with no copy kept, or tables typed in from the article. In the calls, each table is a variable named after it."),
		targetsIntro: localize('newMethods.page.targetsIntro', "The published results the method must reproduce: every printed value becomes a test of the package."),
		emptyTable: localize('newMethods.page.emptyTable', "Empty Table"),
		addLink: localize('newMethods.page.addLink', "Add from a Link"),
		addDatasets: localize('newMethods.page.addDatasets', "Add from PollisDatasets"),
		addFromArticle: localize('newMethods.page.addFromArticle', "Add from Article"),
		targetFiles: localize('newMethods.page.targetFiles', "Add from CSV Files"),
		chooseFiles: localize('newMethods.page.chooseFiles', "Choose CSV Files..."),
		targetFilesHint: localize('newMethods.page.targetFilesHint', "CSV files of published tables, copied into the method: row labels in the first column, the values as printed"),
		link: localize('newMethods.page.link', "Link to the data"),
		tableName: localize('newMethods.page.tableName', "Name of the table"),
		tableNamePlaceholder: localize('newMethods.page.tableNamePlaceholder', "e.g. table2_5"),
		delim: localize('newMethods.page.delim', "Columns separated by"),
		comma: localize('newMethods.delim.comma', "Commas"),
		whitespace: localize('newMethods.delim.whitespace', "Spaces (aligned columns)"),
		tab: localize('newMethods.delim.tab', "Tabs"),
		semicolon: localize('newMethods.delim.semicolon', "Semicolons"),
		emptyInputHint: localize('newMethods.input.emptyDetail', "A table of the method, inputs/NAME.csv, opened to type in: a header line of column names, then the values"),
		emptyTargetHint: localize('newMethods.target.emptyDetail', "Type in the published table: row labels in the first column, the values as printed"),
		articleTables: localize('newMethods.page.articleTables', "Numbers of the tables in the article"),
		articleTablesPlaceholder: localize('newMethods.page.articleTablesPlaceholder', "e.g. 3.2, 5.8"),
		inputArticleHint: localize('newMethods.page.inputArticleHint', "Your coding agent reads the article and types the tables in as input tables, every value as printed. Check them against the article."),
		targetArticleHint: localize('newMethods.page.targetArticleHint', "Your coding agent reads the article and types the tables in as target tables, every value as printed. Check them against the article: the tests are only as right as the targets."),
		ask: localize('newMethods.page.ask', "Ask Agent"),
		add: localize('newMethods.page.add', "Add"),
		added: localize('newMethods.page.added', "Added"),
		cancel: localize('newMethods.page.cancel', "Cancel"),
		save: localize('newMethods.page.save', "Save"),
		filter: localize('newMethods.page.filter', "Filter the datasets"),
		loadingCatalogue: localize('newMethods.catalogue', "Getting the PollisDatasets catalogue..."),
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
		// The tables
		size: localize('newMethods.page.size', "{0} rows, {1} columns"),
		firstRows: localize('newMethods.page.firstRows', "first {0} shown"),
		loading: localize('newMethods.page.loading', "Reading..."),
		noInputs: localize('newMethods.page.noInputs', "No input tables yet."),
		noTargets: localize('newMethods.page.noTargets', "No target tables yet. Without data and expected results there is no new method."),
		call: localize('newMethods.page.call', "Call"),
		noCall: localize('newMethods.page.noCall', "No call yet: write it in method.toml"),
		noSource: localize('newMethods.page.noSource', "No source yet"),
		edit: localize('newMethods.page.edit', "Edit"),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		${voiceButtonsCss}
${PAGE_STYLE}
		.tabs { display: flex; flex-wrap: wrap; gap: 20px; border-bottom: 1px solid var(--vscode-widget-border); margin: 16px 0 12px 0; }
		.subtabs { gap: 16px; margin: 0 0 12px 0; }
		.tab { font: inherit; font-size: 13px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--vscode-descriptionForeground); padding: 6px 0; cursor: pointer; }
		.subtabs .tab { font-size: 12px; padding: 4px 0; }
		.tab.selected { color: var(--vscode-foreground); border-bottom-color: var(--vscode-focusBorder); }
		.step-number { font-size: 20px; line-height: 1; vertical-align: -2px; margin-right: 5px; color: var(--vscode-button-background); }
		code { font-family: var(--vscode-editor-font-family); color: var(--vscode-textPreformat-foreground); background: var(--vscode-textPreformat-background); border-radius: 3px; padding: 0 3px; }
		.step-link .step-number { font-size: 15px; vertical-align: -1px; margin-right: 3px; }
		.table { margin: 0 0 20px 0; }
		.table-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 12px; margin: 0 0 4px 0; }
		.table-name { font-size: 14px; font-weight: 600; }
		.call { font-family: var(--vscode-editor-font-family); font-size: 12px; margin: 0 0 6px 0; }
		.scroll { overflow-x: auto; }
		table { border-collapse: collapse; }
		th { font-size: 12px; font-weight: 600; text-align: left; padding: 3px 10px; border-bottom: 1px solid var(--vscode-widget-border); white-space: nowrap; }
		td { padding: 3px 10px; border-bottom: 1px solid var(--vscode-widget-border); font-family: var(--vscode-editor-font-family); font-size: 12px; white-space: nowrap; }
		td.number { text-align: right; }
		textarea { width: 100%; max-width: 1000px; min-height: 220px; font-family: var(--vscode-editor-font-family); font-size: 13px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); padding: 8px; resize: vertical; margin: 0 0 12px 0; }
		textarea:focus { outline: 1px solid var(--vscode-focusBorder); }
		.datasets { flex-basis: 100%; max-height: 320px; overflow-y: auto; }
		.dataset { display: flex; align-items: center; gap: 12px; padding: 4px 0; border-bottom: 1px solid var(--vscode-widget-border); }
		.dataset .grow { flex: 1; }
		.hint { flex-basis: 100%; margin: 0; }
		.field { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 10px; margin: 0 0 14px 0; max-width: 1000px; }
		.field label { display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.field .error { flex-basis: 100%; margin: 0; }
		.field .error:empty { display: none; }
		.publish { display: flex; flex-direction: column; gap: 12px; margin: 0 0 14px 0; max-width: 900px; }
		.publish .row { display: flex; align-items: baseline; gap: 12px; }
		.publish button { min-width: 260px; text-align: left; }
		.notice { border-left: 3px solid var(--vscode-focusBorder); padding: 6px 10px; margin: 0 0 12px 0; max-width: 1000px; }
	</style>
</head>
<body>
<div class="container">
	<div class="title-row">
		<h1 id="heading" contenteditable="plaintext-only" spellcheck="false" title="${text.headingHint}"></h1>
		${voiceButtonsHtml}
	</div>
	<p class="small notice" id="draftHint" hidden></p>
	<div class="tabs" id="steps">
		<button class="tab selected" data-step="article"><span class="step-number">&#9312;</span>${text.stepArticle}</button>
		<button class="tab" data-step="method"><span class="step-number">&#9313;</span>${text.stepMethod}</button>
		<button class="tab" data-step="vignette"><span class="step-number">&#9314;</span>${text.stepVignette}</button>
		<button class="tab" data-step="register"><span class="step-number">&#9315;</span>${text.stepRegister}</button>
		<button class="tab" data-step="package"><span class="step-number">&#9316;</span>${text.stepPackage}</button>
	</div>

	<section class="step" id="step-article">
		<div class="tabs subtabs">
			<button class="tab selected" data-part="article">${text.article}</button>
			<button class="tab" data-part="inputs">${text.inputs}</button>
			<button class="tab" data-part="targets">${text.targets}</button>
		</div>
		<div class="part" id="part-article">
			<p class="intro">${text.articleIntro}</p>
			<div class="field">
				<label>${text.articleLink}<input class="wide" id="articleUrl" spellcheck="false" placeholder="https://"></label>
				<button class="action primary" data-submit="article">${text.save}</button>
				<button class="action" id="articleCancel">${text.cancel}</button>
				<p class="error small" id="error-article"></p>
			</div>
		</div>
		<div class="part" id="part-inputs" hidden>
			<p class="intro">${text.inputsIntro}</p>
			<div class="actions">
				<button class="action choice primary" data-group="inputs" data-choice="input">${text.emptyTable}</button>
				<button class="action choice" data-group="inputs" data-choice="link">${text.addLink}</button>
				<button class="action choice" data-group="inputs" data-choice="datasets">${text.addDatasets}</button>
				<button class="action choice with-agent" data-group="inputs" data-choice="inputArticle">${AGENT_ICON}${text.addFromArticle}</button>
			</div>
			<div class="form" id="form-input" data-group="inputs">
				<label>${text.tableName}<input id="inputName" spellcheck="false" placeholder="${text.tableNamePlaceholder}"></label>
				<button class="action primary" data-submit="input">${text.add}</button>
				<p class="small hint">${text.emptyInputHint}</p>
				<p class="error small" id="error-input"></p>
			</div>
			<div class="form" id="form-link" data-group="inputs" hidden>
				<label>${text.link}<input class="wide" id="linkUrl" spellcheck="false" placeholder="https://"></label>
				<label>${text.tableName}<input id="linkName" spellcheck="false"></label>
				<label>${text.delim}<select id="linkDelim">
					<option value=",">${text.comma}</option>
					<option value="whitespace">${text.whitespace}</option>
					<option value="tab">${text.tab}</option>
					<option value=";">${text.semicolon}</option>
				</select></label>
				<button class="action primary" data-submit="link">${text.add}</button>
				<p class="error small" id="error-link"></p>
			</div>
			<div class="form" id="form-datasets" data-group="inputs" hidden>
				<label>${text.filter}<input class="wide" id="datasetFilter" spellcheck="false"></label>
				<p class="error small" id="error-datasets"></p>
				<div class="datasets" id="datasets"><span class="small">${text.loadingCatalogue}</span></div>
			</div>
			<div class="form" id="form-inputArticle" data-group="inputs" hidden>
				<label>${text.articleTables}<input id="inputTables" spellcheck="false" placeholder="${text.articleTablesPlaceholder}"></label>
				<button class="action primary" data-submit="inputArticle">${text.ask}</button>
				<p class="small hint">${text.inputArticleHint}</p>
				<p class="error small" id="error-inputArticle"></p>
			</div>
			<div id="inputs"></div>
		</div>
		<div class="part" id="part-targets" hidden>
			<p class="intro">${text.targetsIntro}</p>
			<div class="actions">
				<button class="action choice primary" data-group="targets" data-choice="target">${text.emptyTable}</button>
				<button class="action choice" data-group="targets" data-choice="targetFiles">${text.targetFiles}</button>
				<button class="action choice with-agent" data-group="targets" data-choice="targetArticle">${AGENT_ICON}${text.addFromArticle}</button>
			</div>
			<div class="form" id="form-target" data-group="targets">
				<label>${text.tableName}<input id="targetName" spellcheck="false" placeholder="${text.tableNamePlaceholder}"></label>
				<button class="action primary" data-submit="target">${text.add}</button>
				<p class="small hint">${text.emptyTargetHint}</p>
				<p class="error small" id="error-target"></p>
			</div>
			<div class="form" id="form-targetFiles" data-group="targets" hidden>
				<button class="action primary" data-command="addTargetFiles">${text.chooseFiles}</button>
				<p class="small hint">${text.targetFilesHint}</p>
			</div>
			<div class="form" id="form-targetArticle" data-group="targets" hidden>
				<label>${text.articleTables}<input id="targetTables" spellcheck="false" placeholder="${text.articleTablesPlaceholder}"></label>
				<button class="action primary" data-submit="targetArticle">${text.ask}</button>
				<p class="small hint">${text.targetArticleHint}</p>
				<p class="error small" id="error-targetArticle"></p>
			</div>
			<div id="targets"></div>
		</div>
	</section>

	<section class="step" id="step-method" hidden>
		<div class="field">
			<label>${text.title}<input class="wide" id="title" placeholder="${text.titlePlaceholder}"></label>
			<button class="action primary" data-submit="title">${text.save}</button>
			<button class="action" data-cancel="title">${text.cancel}</button>
			<p class="small hint">${text.titleHint}</p>
			<p class="error small" id="error-title"></p>
		</div>
		<h2>${text.instructions}</h2>
		<p class="intro">${text.instructionsIntro}</p>
		<textarea id="instructions" placeholder="${text.instructionsPlaceholder}"></textarea>
		<div class="actions">
			<button class="action primary with-agent" data-command="writeMethod">${AGENT_ICON}${text.writeMethod}</button>
			<button class="action" data-command="open" data-file="method.toml">${text.editToml}</button>
			<button class="action open-code" data-command="open">${text.openCode}</button>
		</div>
	</section>

	<section class="step" id="step-vignette" hidden>
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
			<button class="action primary with-agent" data-command="writeVignette">${AGENT_ICON}${text.writeVignette}</button>
			<button class="action" id="editVignette" data-command="open">${text.editVignette}</button>
			<button class="action" id="openPdf" data-command="openPdf">${text.openPdf}</button>
		</div>
		<p class="small" id="noVignette">${text.noVignette}</p>
	</section>

	<section class="step" id="step-register" hidden>
		<div class="field">
			<label>${text.packageName}<input id="packageName" spellcheck="false"></label>
			<button class="action primary" data-submit="name">${text.save}</button>
			<button class="action" data-cancel="packageName">${text.cancel}</button>
			<p class="small hint">${text.nameHint}</p>
			<p class="error small" id="error-name"></p>
		</div>
		<p class="intro">${text.registerIntro}</p>
		<div class="actions">
			<button class="action primary with-agent" data-command="prepareRegistration">${AGENT_ICON}${text.prepareRegistration}</button>
			<button class="action open-code" data-command="open">${text.openCode}</button>
		</div>
	</section>

	<section class="step" id="step-package" hidden>
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
	</section>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	const TEXT = ${JSON.stringify(text)};
	const DATASETS_URL = ${JSON.stringify(DATASETS_URL)};
	const inputBoxes = new Map();
	let method;
	let draft = false;
	let catalogue;

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	const value = id => document.getElementById(id).value;
	const set = (id, text) => { document.getElementById(id).value = text; };

	// What each form or field sends
	const FORMS = {
		article: { send: () => ({ command: 'setArticle', url: value('articleUrl') }) },
		input: { send: () => ({ command: 'addInput', name: value('inputName') }) },
		link: { send: () => ({ command: 'addLink', url: value('linkUrl'), name: value('linkName'), delim: value('linkDelim') }) },
		inputArticle: { send: () => ({ command: 'fromArticle', kind: 'inputs', tables: value('inputTables') }) },
		target: { send: () => ({ command: 'addTarget', name: value('targetName') }) },
		targetArticle: { send: () => ({ command: 'fromArticle', kind: 'targets', tables: value('targetTables') }) },
		title: { send: () => ({ command: 'setTitle', title: value('title') }) },
		vignetteTitle: { send: () => ({ command: 'setVignetteTitle', title: value('vignetteTitle') }) },
		name: { send: () => ({ command: 'setName', name: value('packageName') }) },
	};

	// The buttons of a group pick the one form shown below them, the picked button in blue
	function choose(group, name) {
		document.querySelectorAll('button[data-group="' + group + '"]').forEach(button => button.classList.toggle('primary', button.dataset.choice === name));
		document.querySelectorAll('.form[data-group="' + group + '"]').forEach(form => { form.hidden = form.id !== 'form-' + name; });
		if (name === 'datasets' && !catalogue) {
			vscode.postMessage({ command: 'catalogue' });
		}
		const first = document.getElementById('form-' + name).querySelector('input');
		if (first) { first.focus(); }
	}

	function clearForm(name) {
		const form = document.getElementById('form-' + name);
		if (form) {
			form.querySelectorAll('input').forEach(input => { input.value = ''; });
		}
	}

	function select(kind, name) {
		document.querySelectorAll('[data-' + kind + ']').forEach(tab => tab.classList.toggle('selected', tab.dataset[kind] === name));
		document.querySelectorAll('.' + kind).forEach(section => { section.hidden = section.id !== kind + '-' + name; });
	}

	document.querySelectorAll('button[data-command]').forEach(button => {
		button.addEventListener('click', () => vscode.postMessage({ command: button.dataset.command, file: button.dataset.file }));
	});
	document.querySelectorAll('button[data-choice]').forEach(button => button.addEventListener('click', () => choose(button.dataset.group, button.dataset.choice)));
	document.getElementById('articleCancel').addEventListener('click', () => {
		set('articleUrl', method.article || '');
		document.getElementById('error-article').textContent = '';
	});
	document.querySelectorAll('button[data-submit]').forEach(button => button.addEventListener('click', () => {
		document.getElementById('error-' + button.dataset.submit).textContent = '';
		vscode.postMessage(FORMS[button.dataset.submit].send());
	}));
	document.querySelectorAll('.form input, .field input').forEach(input => input.addEventListener('keydown', e => {
		const box = input.closest('.form, .field');
		const submit = box.querySelector('button[data-submit]');
		if (e.key === 'Enter' && submit) { submit.click(); }
		if (e.key === 'Escape' && box.classList.contains('form')) { clearForm(box.id.slice('form-'.length)); }
	}));
	document.querySelectorAll('[data-step]').forEach(tab => tab.addEventListener('click', () => select('step', tab.dataset.step)));
	document.querySelectorAll('[data-part]').forEach(tab => tab.addEventListener('click', () => select('part', tab.dataset.part)));
	document.querySelectorAll('button[data-publish]').forEach(button => button.addEventListener('click', () => {
		document.getElementById('error-package').textContent = '';
		vscode.postMessage({ command: 'package', action: button.dataset.publish, owner: value('owner') });
	}));

	// The table's name follows the link until the user types one
	const linkName = document.getElementById('linkName');
	document.getElementById('linkUrl').addEventListener('input', e => {
		if (!linkName.dataset.typed) {
			const name = e.target.value.replace(/[?#].*$/, '').replace(/^.*\\//, '').replace(/\\.\\w+$/, '').replace(/\\W+/g, '_').replace(/^(?=\\d)/, '_');
			linkName.value = name;
		}
	});
	linkName.addEventListener('input', () => { linkName.dataset.typed = linkName.value ? '1' : ''; });

	// The draft's note, its steps as links that open them
	function showDraftHint(container) {
		container.textContent = '';
		const steps = { '{0}': ['register', '\u2463', TEXT.stepRegister], '{1}': ['article', '\u2460', TEXT.stepArticle] };
		for (const part of TEXT.draftHint.split(/({[01]})/)) {
			const step = steps[part];
			if (!step) {
				container.appendChild(document.createTextNode(part));
				continue;
			}
			const link = element('button', 'link step-link');
			link.appendChild(element('span', 'step-number', step[1]));
			link.appendChild(document.createTextNode(step[2]));
			link.addEventListener('click', () => select('step', step[0]));
			container.appendChild(link);
		}
	}

	// The Package Name suggested in its field: the title without spaces, PanelRandomEffects for Panel Random Effects
	function suggestName() {
		const name = value('title').split(/[^A-Za-z0-9]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
		document.getElementById('packageName').placeholder = TEXT.namePlaceholder.replace('{0}', /^[A-Z]/.test(name) ? name : 'PanelRandomEffects');
	}
	document.getElementById('title').addEventListener('input', suggestName);

	// The notes are saved as they are typed
	for (const [id, command] of [['instructions', 'instructions'], ['vignetteInstructions', 'vignetteInstructions']]) {
		const area = document.getElementById(id);
		let timer;
		area.addEventListener('input', () => {
			clearTimeout(timer);
			timer = setTimeout(() => vscode.postMessage({ command, text: area.value }), 500);
		});
	}

	function renderDatasets() {
		const container = document.getElementById('datasets');
		if (!catalogue) { return; }
		container.textContent = '';
		const filter = value('datasetFilter').trim().toLowerCase();
		const used = new Set((method ? method.inputs : []).map(input => input.url));
		for (const dataset of catalogue) {
			if (filter && !(dataset.title + ' ' + dataset.id + ' ' + dataset.domain).toLowerCase().includes(filter)) {
				continue;
			}
			const row = element('div', 'dataset');
			const label = element('div', 'grow');
			label.appendChild(element('div', '', dataset.title));
			label.appendChild(element('div', 'small', dataset.id + ' \\u00b7 ' + dataset.domain));
			row.appendChild(label);
			const added = used.has(DATASETS_URL + '/data/' + dataset.id + '.csv');
			const add = element('button', 'action', added ? TEXT.added : TEXT.add);
			add.disabled = added;
			add.addEventListener('click', () => {
				add.disabled = true;
				document.getElementById('error-datasets').textContent = '';
				vscode.postMessage({ command: 'addDataset', id: dataset.id });
			});
			row.appendChild(add);
			container.appendChild(row);
		}
	}
	document.getElementById('datasetFilter').addEventListener('input', renderDatasets);

	function grid(content) {
		const scroll = element('div', 'scroll');
		const table = element('table');
		const headRow = element('tr');
		content.header.forEach(column => headRow.appendChild(element('th', '', column)));
		table.appendChild(headRow);
		for (const row of content.rows) {
			const tr = element('tr');
			row.forEach(value => tr.appendChild(element('td', /^-?[\\d.]+(e[-+]?\\d+)?$/i.test(value.trim()) ? 'number' : '', value)));
			table.appendChild(tr);
		}
		scroll.appendChild(table);
		return scroll;
	}

	function size(content) {
		let result = TEXT.size.replace('{0}', content.rowCount).replace('{1}', content.header.length);
		if (content.rows.length < content.rowCount) {
			result += ', ' + TEXT.firstRows.replace('{0}', content.rows.length);
		}
		return result;
	}

	function tableHead(name, source, onClick) {
		const head = element('div', 'table-head');
		head.appendChild(onClick ? element('button', 'link table-name', name) : element('span', 'table-name', name));
		if (onClick) { head.firstChild.addEventListener('click', onClick); }
		head.appendChild(element('span', 'small', source || TEXT.noSource));
		return head;
	}

	function renderInputs(inputs) {
		const container = document.getElementById('inputs');
		container.textContent = '';
		inputBoxes.clear();
		if (!inputs.length) {
			container.appendChild(element('p', 'small', TEXT.noInputs));
		}
		for (const input of inputs) {
			const box = element('div', 'table');
			const open = input.file ? () => vscode.postMessage({ command: 'open', file: input.file }) : undefined;
			box.appendChild(tableHead(input.name, input.source, open));
			box.appendChild(element('div', 'call small', input.url || input.file));
			if (input.local) {
				box.appendChild(element('div', 'call small', TEXT.copy.replace('{0}', input.local)));
			}
			if (input.url) {
				const save = element('button', 'link small', TEXT.saveCopy);
				save.addEventListener('click', () => vscode.postMessage({ command: 'saveInput', name: input.name }));
				box.firstChild.appendChild(save);
			}
			const body = element('div', 'small', TEXT.loading);
			box.appendChild(body);
			container.appendChild(box);
			inputBoxes.set(input.name, body);
		}
	}

	function showInput(message) {
		const body = inputBoxes.get(message.name);
		if (!body) {
			return;
		}
		body.textContent = '';
		body.className = message.error ? 'small error' : '';
		if (message.error) {
			body.textContent = message.error;
			return;
		}
		body.appendChild(element('div', 'small', size(message.table)));
		body.appendChild(grid(message.table));
	}

	function renderTargets(targets) {
		const container = document.getElementById('targets');
		container.textContent = '';
		if (!targets.length) {
			container.appendChild(element('p', 'small', TEXT.noTargets));
		}
		for (const target of targets) {
			const box = element('div', 'table');
			const head = tableHead(target.name, target.source, () => vscode.postMessage({ command: 'open', file: target.file }));
			head.appendChild(element('span', 'small', size(target)));
			box.appendChild(head);
			box.appendChild(element('div', target.call ? 'call' : 'call small', target.call ? TEXT.call + ': ' + target.call : TEXT.noCall));
			box.appendChild(grid(target));
			container.appendChild(box);
		}
	}

	// The saved value of each field, which Cancel puts back. A field is refreshed from the method unless
	// the user is typing in it or has typed something not saved yet, so moving between steps keeps it
	const saved = {};
	function refresh(id, text) {
		saved[id] = text;
		const field = document.getElementById(id);
		if (document.activeElement !== field && !field.dataset.edited) { field.value = text; }
	}
	document.querySelectorAll('.field input').forEach(input => input.addEventListener('input', () => { input.dataset.edited = '1'; }));
	function revert(id) {
		const field = document.getElementById(id);
		delete field.dataset.edited;
		field.value = saved[id] ?? '';
		document.getElementById('error-' + field.closest('.field').querySelector('[data-submit]').dataset.submit).textContent = '';
	}
	document.querySelectorAll('button[data-cancel]').forEach(button => button.addEventListener('click', () => {
		revert(button.dataset.cancel);
		if (button.dataset.cancel === 'title') { suggestName(); }
	}));

	// The heading is the title, edited in place: Enter saves it, Escape or leaving it puts it back
	const heading = document.getElementById('heading');
	heading.addEventListener('keydown', e => {
		if (e.key === 'Enter') {
			e.preventDefault();
			const title = heading.textContent.trim();
			if (title) {
				set('title', title);
				delete document.getElementById('title').dataset.edited;
				vscode.postMessage({ command: 'setTitle', title });
				method = { ...method, title };
			}
			heading.blur();
		} else if (e.key === 'Escape') {
			heading.blur();
		}
	});
	heading.addEventListener('blur', () => { heading.textContent = method ? method.title : ''; });

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'input') {
			showInput(message);
		} else if (message.command === 'step') {
			select('step', message.step);
		} else if (message.command === 'catalogue') {
			catalogue = message.items;
			renderDatasets();
		} else if (message.command === 'formError') {
			document.getElementById('error-' + message.form).textContent = message.message;
			if (message.form === 'datasets') { renderDatasets(); }
		} else if (message.command === 'formDone') {
			// A saved field is no longer edited; an added table empties its form for the next one
			const submitted = document.querySelector('.field [data-submit="' + message.form + '"]');
			if (submitted) {
				submitted.closest('.field').querySelectorAll('input').forEach(input => { delete input.dataset.edited; });
			}
			if (['input', 'link', 'inputArticle', 'target', 'targetArticle'].includes(message.form)) {
				clearForm(message.form);
				if (message.form === 'link') { delete linkName.dataset.typed; }
			}
		} else if (message.command === 'method') {
			method = message.method;
			draft = message.draft;
			const draftHint = document.getElementById('draftHint');
			draftHint.hidden = !draft;
			showDraftHint(draftHint);
			if (document.activeElement !== heading) { heading.textContent = method.title; }
			// 1. Article and Data
			refresh('articleUrl', method.article || '');
			renderInputs(method.inputs);
			renderTargets(method.targets);
			renderDatasets();
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
		}
	});
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}


/** A method of the user's, as Browse Methods lists it. */
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

/** The user's methods, the folders of ~/.pollis/methods with a method.toml, for Browse Methods. */
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

/** The folder holding the user's methods, which Browse Methods watches. */
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
		detail = localize('newMethods.deleteEmpty.detail', "Methods with no article, tables, instructions or code: {0}. Their folders go to the trash.", doomed.map(method => method.name).join(', '));
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

/** Runs an agent task on a method, on the task's tier: from its page, with its folder; from elsewhere, Browse Methods opens to pick one. */
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

const category = localize2('newMethods.category', "Methods");

registerAction2(class extends Action2 {
	constructor() {
		super({ id: CREATE_METHOD_COMMAND_ID, title: localize2('newMethods.create', "Create Methods"), category, f1: true });
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
