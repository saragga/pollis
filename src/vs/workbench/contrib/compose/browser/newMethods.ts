/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
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
import { IQuickInputService, IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
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

// Compose > New Methods > Create Method and Package and Publish (Library is in workflowLibrary.ts).
// A method is a folder of ~/.pollis/methods with method.toml, its code in src/NAME.jl (module NAME),
// the published results it must reproduce in targets/*.csv and the user's notes for a coding agent in
// INSTRUCTIONS.md. The article and the input data are only links in method.toml: Create Method opens the
// article in the integrated browser, in an in-memory session, beside the method's page, and reads the
// data into memory to show it: nothing of either is written to disk, not even a cache. Only when the user
// asks, Save a Copy... keeps a copy outside Pollis (by default in the data folder of a Pollis Workspace) and
// records its path as `local`; the page then reads the copy, falling back to the link if it is gone. Package and Publish runs media/methods/package.jl, which makes the
// package NAME.jl in ~/.pollis/packages, its tests the target tables computed from the data downloaded
// from the links, runs them and, if asked, pushes the package to GitHub when they all pass.

export const CREATE_METHOD_COMMAND_ID = 'pollis.newMethods.create';
export const PACKAGE_METHOD_COMMAND_ID = 'pollis.newMethods.package';

const GITHUB_OWNER_SETTING = 'pollis.newMethods.githubOwner';
const DATASETS_URL = 'https://raw.githubusercontent.com/Trumpingtons/PollisDatasets.jl/main';
const PACKAGE_SCRIPT = 'vs/workbench/contrib/compose/browser/media/methods/package.jl';
const INSTRUCTIONS_FILE = 'INSTRUCTIONS.md';
/** The rows of an input table the page shows. */
const PREVIEW_ROWS = 10;

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'pollisNewMethods',
	title: localize('newMethods.configurationTitle', "New Methods"),
	type: 'object',
	properties: {
		[GITHUB_OWNER_SETTING]: {
			type: 'string',
			default: 'Trumpingtons',
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('newMethods.githubOwner', "The GitHub user or organization that **Package and Publish** (Compose > New Methods) pushes method packages to."),
		},
	},
});

/** The rows of a table as the page shows them. */
interface ITableContent {
	readonly header: readonly string[];
	readonly rows: readonly (readonly string[])[];
	readonly rowCount: number;
}

/** An input table: a link to the data, read into memory when shown. */
interface IMethodInput {
	/** Its variable name in the calls. */
	readonly name: string;
	readonly url: string;
	readonly source?: string;
	/** `,` (the default), `;`, `tab` or `whitespace`. */
	readonly delim?: string;
	/** The column names of a file without a header line. */
	readonly columns?: readonly string[];
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

/** The first rows of a delimited text, its header the first line unless the column names are given. */
function parseTable(content: string, limit: number, delim?: string, columns?: readonly string[]): ITableContent {
	const lines = content.replace(/\r\n?/g, '\n').split('\n').filter(line => line.trim());
	const body = columns ? lines : lines.slice(1);
	return {
		header: columns ?? fields(lines[0] ?? '', delim),
		rows: body.slice(0, limit).map(line => fields(line, delim)),
		rowCount: body.length,
	};
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
		if (url) {
			const columns = Array.isArray(spec.columns) ? spec.columns.filter((column): column is string => typeof column === 'string') : undefined;
			inputs.push({ name, url, source: text(spec.source), delim: text(spec.delim), columns: columns?.length ? columns : undefined, local: text(spec.local) });
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

	const instructionsFile = joinPath(folder, INSTRUCTIONS_FILE);
	const name = text(toml.name) ?? basename(folder);
	const doi = text(toml.doi);
	return {
		folder,
		name,
		title: text(toml.title) ?? name,
		citation: text(toml.citation),
		article: text(toml.article) ?? (doi ? `https://doi.org/${doi}` : undefined),
		articleLocal: text(toml.article_local),
		inputs: inputs.sort((a, b) => a.name.localeCompare(b.name)),
		targets: targets.sort((a, b) => a.name.localeCompare(b.name)),
		instructions: await fileService.exists(instructionsFile) ? (await fileService.readFile(instructionsFile)).value.toString() : '',
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
		'# A Pollis method (Compose > New Methods). Create Method shows the article and the tables; Package and',
		`# Publish turns this folder into the Julia package ${name}.jl, its tests the target tables.`,
		'#',
		'#   targets/*.csv     the published results: the row labels in the first column, the values as printed',
		`#   src/${name}.jl     the code: module ${name}`,
		`#   ${INSTRUCTIONS_FILE}   notes for a coding agent`,
		'',
		`name = "${name}"`,
		`title = ${tomlString(title)}`,
		'author = ""',
		'description = ""',
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
		'# The input tables are links too: Pollis reads each into memory to show it, and the package\'s tests',
		'# download it; no copy is kept. In the calls, each is a variable named after its table here.',
		'#   [inputs.grunfeld]',
		'#   url = "https://..."',
		'#   source = "Where the data comes from"',
		'#   delim = ","                      the default; or ";", "tab", "whitespace"',
		'#   columns = ["firm", "year"]       only for a file without a header line',
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

/** Asks for a name, a title and the article's link, makes the method folder and returns it. */
async function newMethod(quickInputService: IQuickInputService, fileService: IFileService, pathService: IPathService): Promise<URI | undefined> {
	const root = methodsFolder(pathService);
	const name = (await quickInputService.input({
		title: localize('newMethods.name.title', "Create Method"),
		prompt: localize('newMethods.name.prompt', "The method's package name: a capital letter, then letters and digits, e.g. PanelRandomEffects"),
		validateInput: async value => {
			if (!/^[A-Z][A-Za-z0-9]*$/.test(value)) {
				return localize('newMethods.name.invalid', "A capital letter, then letters and digits.");
			}
			return await fileService.exists(joinPath(root, value)) ? localize('newMethods.name.exists', "There is already a method {0}.", value) : undefined;
		},
	}))?.trim();
	if (!name) {
		return undefined;
	}
	const title = (await quickInputService.input({
		title: localize('newMethods.title.title', "Create Method"),
		prompt: localize('newMethods.title.prompt', "The method's title, e.g. Panel random effects"),
	}))?.trim() || name;
	const article = (await quickInputService.input({
		title: localize('newMethods.article.title', "Create Method"),
		prompt: localize('newMethods.article.prompt', "A link to the article (its PDF or its web page), opened in the integrated browser; no copy is kept. Leave empty to add it later."),
		validateInput: async value => value.trim() ? validateLink(value) : undefined,
	}))?.trim() ?? '';
	const folder = joinPath(root, name);
	await fileService.writeFile(joinPath(folder, 'method.toml'), VSBuffer.fromString(methodToml(name, title, article)));
	await fileService.writeFile(joinPath(folder, 'src', `${name}.jl`), VSBuffer.fromString(moduleCode(name)));
	await fileService.writeFile(joinPath(folder, INSTRUCTIONS_FILE), VSBuffer.fromString(''));
	await fileService.createFolder(joinPath(folder, 'targets'));
	return folder;
}

interface IPick<T> extends IQuickPickItem {
	readonly value: T;
}

/** The services that adding a table needs. */
interface ITableServices {
	readonly quickInputService: IQuickInputService;
	readonly fileService: IFileService;
	readonly fileDialogService: IFileDialogService;
	readonly requestService: IRequestService;
	readonly progressService: IProgressService;
	readonly editorService: IEditorService;
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

/** Adds an input table: the link to a dataset of PollisDatasets or to any data file. */
async function addInput({ quickInputService, requestService, progressService, fileService }: ITableServices, folder: URI): Promise<void> {
	const kind = await quickInputService.pick<IPick<'datasets' | 'link'>>([
		{ label: localize('newMethods.input.link', "From a Link..."), detail: localize('newMethods.input.linkDetail', "A delimited text file on the web, e.g. the data published with the article"), value: 'link' },
		{ label: localize('newMethods.input.datasets', "From PollisDatasets..."), value: 'datasets' },
	], { title: localize('newMethods.input.title', "Add Input Table") });
	if (kind?.value === 'link') {
		const url = (await quickInputService.input({
			title: localize('newMethods.input.linkTitle', "Link to the Data"),
			prompt: localize('newMethods.input.linkPrompt', "Pollis reads it into memory to show it and keeps no copy"),
			validateInput: async value => validateLink(value),
		}))?.trim();
		if (!url) {
			return;
		}
		const name = (await quickInputService.input({
			title: localize('newMethods.input.nameTitle', "Name of the Table"),
			prompt: localize('newMethods.input.namePrompt', "Its variable name in the calls"),
			value: variableName(url),
			validateInput: async value => /^[A-Za-z_]\w*$/.test(value) ? undefined : localize('newMethods.input.nameInvalid', "Letters, digits and underscores, not starting with a digit."),
		}))?.trim();
		if (!name) {
			return;
		}
		const delim = await quickInputService.pick<IPick<string>>([
			{ label: localize('newMethods.delim.comma', "Commas"), value: ',' },
			{ label: localize('newMethods.delim.whitespace', "Spaces (aligned columns)"), value: 'whitespace' },
			{ label: localize('newMethods.delim.tab', "Tabs"), value: 'tab' },
			{ label: localize('newMethods.delim.semicolon', "Semicolons"), value: ';' },
		], { title: localize('newMethods.delim.title', "The Columns Are Separated by") });
		if (!delim) {
			return;
		}
		await appendToml(fileService, folder, `[inputs.${name}]\nurl = ${tomlString(url)}\nsource = ""\n${delim.value === ',' ? '' : `delim = ${tomlString(delim.value)}\n`}`);
	} else if (kind?.value === 'datasets') {
		const catalogue = await progressService.withProgress({ location: ProgressLocation.Notification, title: localize('newMethods.catalogue', "Getting the PollisDatasets catalogue...") }, () => download(requestService, `${DATASETS_URL}/datasets.toml`));
		const items: IPick<string>[] = [];
		for (const match of catalogue.matchAll(/^id = "(?<id>[\w-]+)"\s*\ntitle = "(?<title>[^"]*)"\s*\ndomain = "(?<domain>[^"]*)"/gm)) {
			items.push({ label: match.groups!.title, description: match.groups!.id, detail: match.groups!.domain, value: match.groups!.id });
		}
		const picks = await quickInputService.pick(items, { canPickMany: true, matchOnDescription: true, matchOnDetail: true, title: localize('newMethods.input.datasetsTitle', "Add Input Tables from PollisDatasets") });
		for (const pick of picks ?? []) {
			await appendToml(fileService, folder, `[inputs.${variableName(pick.value)}]\nurl = ${tomlString(`${DATASETS_URL}/data/${pick.value}.csv`)}\nsource = ${tomlString(`PollisDatasets: ${pick.label}`)}\n`);
		}
	}
}

/** Adds a target table: a CSV file, or an empty one to fill in from the article. */
async function addTarget({ quickInputService, fileService, fileDialogService, editorService }: ITableServices, folder: URI): Promise<void> {
	const targetBlock = (name: string) => `[targets.${name}]\nsource = ""\ncall = ""\ntolerance = 0\n`;
	const kind = await quickInputService.pick<IPick<'empty' | 'file'>>([
		{ label: localize('newMethods.target.empty', "New Empty Table..."), detail: localize('newMethods.target.emptyDetail', "Type in the published table: row labels in the first column, the values as printed"), value: 'empty' },
		{ label: localize('newMethods.target.file', "From a CSV File..."), value: 'file' },
	], { title: localize('newMethods.target.title', "Add Target Table") });
	if (kind?.value === 'file') {
		const files = await fileDialogService.showOpenDialog({ canSelectMany: true, filters: [{ name: 'CSV', extensions: ['csv'] }] });
		for (const file of files ?? []) {
			const name = variableName(basename(file));
			await fileService.copy(file, joinPath(folder, 'targets', `${name}.csv`), true);
			await appendToml(fileService, folder, targetBlock(name));
		}
		if (files?.length) {
			await editorService.openEditor({ resource: joinPath(folder, 'method.toml') });
		}
	} else if (kind?.value === 'empty') {
		const name = (await quickInputService.input({
			title: localize('newMethods.target.nameTitle', "New Target Table"),
			prompt: localize('newMethods.target.namePrompt', "The table's name, e.g. table2_5"),
			validateInput: async value => /^[A-Za-z_]\w*$/.test(value) ? undefined : localize('newMethods.target.nameInvalid', "Letters, digits and underscores, not starting with a digit."),
		}))?.trim();
		if (!name) {
			return;
		}
		const file = joinPath(folder, 'targets', `${name}.csv`);
		await fileService.writeFile(file, VSBuffer.fromString('label,Column 1,Column 2\nRow 1,,\nRow 2,,\n'));
		await appendToml(fileService, folder, targetBlock(name));
		await editorService.openEditor({ resource: file });
	}
}

type MethodMessage =
	| { readonly command: 'ready' | 'addInput' | 'addTarget' | 'package' | 'openArticle' | 'setArticle' | 'saveArticle' }
	| { readonly command: 'saveInput'; readonly name: string }
	| { readonly command: 'open'; readonly file: string }
	| { readonly command: 'instructions'; readonly text: string };

/** The open pages, by method folder, so a second request shows the same page. */
const openPages = new Map<string, WebviewInput>();

/**
 * Opens a method: its article in the integrated browser and, beside it, its page with the input tables
 * (read into memory from their links), the target tables and the instructions for a coding agent,
 * updated as the method's files change.
 */
async function openMethodPage(accessor: ServicesAccessor, folder: URI): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const fileService = accessor.get(IFileService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const commandService = accessor.get(ICommandService);
	const quickInputService = accessor.get(IQuickInputService);
	const fileDialogService = accessor.get(IFileDialogService);
	const requestService = accessor.get(IRequestService);
	const progressService = accessor.get(IProgressService);
	const contextService = accessor.get(IWorkspaceContextService);
	const pathService = accessor.get(IPathService);
	const environmentService = accessor.get(IEnvironmentService);

	const open = openPages.get(folder.toString());
	if (open && !open.isDisposed()) {
		webviewWorkbenchService.revealWebview(open, open.group ?? -1, false);
		return;
	}
	let method = await readMethod(fileService, folder);
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
	openPages.set(folder.toString(), webviewInput);

	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPages.delete(folder.toString());
		disposables.dispose();
	}));

	// The input tables, read into memory once for each link, or from the copy the user saved
	const data = new Map<string, Promise<string>>();
	const read = async (input: IMethodInput) => {
		const local = await copy(input.local);
		return local ? (await fileService.readFile(local)).value.toString() : download(requestService, input.url);
	};
	const postInputs = () => {
		for (const input of method?.inputs ?? []) {
			const key = `${input.url}\n${input.local ?? ''}`;
			let content = data.get(key);
			if (!content) {
				content = read(input);
				data.set(key, content);
			}
			content.then(
				value => webviewInput.webview.postMessage({ command: 'input', name: input.name, table: parseTable(value, PREVIEW_ROWS, input.delim, input.columns) }),
				error => webviewInput.webview.postMessage({ command: 'input', name: input.name, error: toErrorMessage(error) })
			);
		}
	};
	const post = () => {
		webviewInput.webview.postMessage({ command: 'method', method: method && { ...method, folder: method.folder.fsPath } });
		postInputs();
	};
	const reload = disposables.add(new RunOnceScheduler(async () => {
		method = await readMethod(fileService, folder) ?? method;
		post();
	}, 300));
	for (const location of [folder, joinPath(folder, 'targets')]) {
		const watcher = disposables.add(fileService.createWatcher(location, { recursive: false, excludes: [] }));
		disposables.add(watcher.onDidChange(() => reload.schedule()));
	}

	const services: ITableServices = { quickInputService, fileService, fileDialogService, requestService, progressService, editorService };
	const copyServices: ICopyServices = { fileService, fileDialogService, requestService, progressService, contextService, pathService, environmentService };
	const run = async (action: () => Promise<void>) => {
		try {
			await action();
		} catch (error) {
			notificationService.error(toErrorMessage(error));
		}
	};

	disposables.add(webviewInput.webview.onMessage((e: { message: MethodMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			post();
		} else if (message.command === 'addInput') {
			run(() => addInput(services, folder));
		} else if (message.command === 'addTarget') {
			run(() => addTarget(services, folder));
		} else if (message.command === 'package') {
			commandService.executeCommand(PACKAGE_METHOD_COMMAND_ID, folder);
		} else if (message.command === 'openArticle') {
			run(openArticle);
		} else if (message.command === 'setArticle') {
			run(async () => {
				const url = (await quickInputService.input({
					title: localize('newMethods.setArticle.title', "Link to the Article"),
					prompt: localize('newMethods.setArticle.prompt', "Its PDF or its web page, opened in the integrated browser; no copy is kept"),
					value: method?.article ?? '',
					validateInput: async value => validateLink(value),
				}))?.trim();
				if (url) {
					await setArticle(fileService, folder, url);
					method = await readMethod(fileService, folder) ?? method;
					await openArticle();
				}
			});
		} else if (message.command === 'saveArticle') {
			run(async () => {
				if (method?.article) {
					const local = await saveCopy(copyServices, method.article, copyName(method.article, method.name, '.pdf'));
					if (local) {
						await setTomlValue(fileService, folder, undefined, 'article_local', local);
					}
				}
			});
		} else if (message.command === 'saveInput') {
			run(async () => {
				const input = method?.inputs.find(candidate => candidate.name === message.name);
				if (input) {
					const local = await saveCopy(copyServices, input.url, copyName(input.url, input.name, '.csv'));
					if (local) {
						await setTomlValue(fileService, folder, `inputs.${input.name}`, 'local', local);
					}
				}
			});
		} else if (message.command === 'instructions') {
			run(() => fileService.writeFile(joinPath(folder, INSTRUCTIONS_FILE), VSBuffer.fromString(message.text)).then(() => undefined));
		} else if (message.command === 'open' && method) {
			const files = ['method.toml', `src/${method.name}.jl`, INSTRUCTIONS_FILE, ...method.targets.map(target => target.file)];
			if (files.includes(message.file)) {
				run(async () => { await editorService.openEditor({ resource: joinPath(folder, ...message.file.split('/')) }); });
			}
		}
	}));
}

/** The page: its texts come from here, the method from the `method` message and each input table from an `input` message. */
function pageHtml(): string {
	const text = {
		inputs: localize('newMethods.page.inputs', "Input Tables"),
		inputsIntro: localize('newMethods.page.inputsIntro', "The data the method is computed from, read into memory from its links: no copy is kept. In the calls, each table is a variable named after it."),
		targets: localize('newMethods.page.targets', "Target Tables"),
		targetsIntro: localize('newMethods.page.targetsIntro', "The published results the method must reproduce: every printed value becomes a test of the package."),
		instructions: localize('newMethods.page.instructions', "Instructions"),
		instructionsIntro: localize('newMethods.page.instructionsIntro', "Notes for a coding agent: what the method does, where in the article, what to watch for. Saved in INSTRUCTIONS.md, beside the method's links and tables, which the agent reads too."),
		instructionsPlaceholder: localize('newMethods.page.instructionsPlaceholder', "e.g. Table 2.5 on page 24 reports the Swamy-Arora estimator; the variance components are in the last two rows."),
		addInput: localize('newMethods.page.addInput', "Add Input Table..."),
		addTarget: localize('newMethods.page.addTarget', "Add Target Table..."),
		openArticle: localize('newMethods.page.openArticle', "Open Article"),
		setArticle: localize('newMethods.page.setArticle', "Set Article Link..."),
		saveCopy: localize('newMethods.page.saveCopy', "Save a Copy..."),
		copy: localize('newMethods.page.copy', "Copy: {0} (read instead of the link while it exists)"),
		editToml: localize('newMethods.page.editToml', "Edit method.toml"),
		openCode: localize('newMethods.page.openCode', "Open Code"),
		package: localize('newMethods.page.package', "Package and Publish..."),
		size: localize('newMethods.page.size', "{0} rows, {1} columns"),
		firstRows: localize('newMethods.page.firstRows', "first {0} shown"),
		loading: localize('newMethods.page.loading', "Reading..."),
		noInputs: localize('newMethods.page.noInputs', "No input tables yet."),
		noTargets: localize('newMethods.page.noTargets', "No target tables yet. Without data and expected results there is no new method."),
		call: localize('newMethods.page.call', "Call"),
		noCall: localize('newMethods.page.noCall', "No call yet: write it in method.toml"),
		noSource: localize('newMethods.page.noSource', "No source yet"),
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
		.container { padding: 20px; }
		h1 { font-size: 26px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.subtitle, .intro, .small { color: var(--vscode-descriptionForeground); }
		.subtitle { margin: 0 0 12px 0; line-height: 1.4; }
		.intro { margin: 0 0 12px 0; line-height: 1.4; }
		.small { font-size: 12px; }
		.actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 12px 0; }
		button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; border-radius: 2px; padding: 4px 12px; cursor: pointer; }
		button.action:hover { background: var(--vscode-button-secondaryHoverBackground); }
		button.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.primary:hover { background: var(--vscode-button-hoverBackground); }
		.tabs { display: flex; gap: 20px; border-bottom: 1px solid var(--vscode-widget-border); margin: 16px 0 12px 0; }
		.tab { font: inherit; font-size: 13px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--vscode-descriptionForeground); padding: 6px 0; cursor: pointer; }
		.tab.selected { color: var(--vscode-foreground); border-bottom-color: var(--vscode-focusBorder); }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.link:hover { text-decoration: underline; }
		.table { margin: 0 0 20px 0; }
		.table-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 12px; margin: 0 0 4px 0; }
		.table-name { font-size: 14px; font-weight: 600; }
		.call { font-family: var(--vscode-editor-font-family); font-size: 12px; margin: 0 0 6px 0; }
		.error { color: var(--vscode-errorForeground); }
		.scroll { overflow-x: auto; }
		table { border-collapse: collapse; }
		th { font-size: 12px; font-weight: 600; text-align: left; padding: 3px 10px; border-bottom: 1px solid var(--vscode-widget-border); white-space: nowrap; }
		td { padding: 3px 10px; border-bottom: 1px solid var(--vscode-widget-border); font-family: var(--vscode-editor-font-family); font-size: 12px; white-space: nowrap; }
		td.number { text-align: right; }
		textarea { width: 100%; min-height: 320px; font-family: var(--vscode-editor-font-family); font-size: 13px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); padding: 8px; resize: vertical; }
		textarea:focus { outline: 1px solid var(--vscode-focusBorder); }
	</style>
</head>
<body>
<div class="container">
	<h1 id="title"></h1>
	<p class="subtitle" id="subtitle"></p>
	<p class="small" id="articleCopy" hidden></p>
	<div class="actions">
		<button class="action" id="openArticle" data-command="openArticle">${text.openArticle}</button>
		<button class="action" data-command="setArticle">${text.setArticle}</button>
		<button class="action" id="saveArticle" data-command="saveArticle">${text.saveCopy}</button>
		<button class="action" data-command="open" data-file="method.toml">${text.editToml}</button>
		<button class="action" id="code" data-command="open">${text.openCode}</button>
		<button class="action primary" data-command="package">${text.package}</button>
	</div>
	<div class="tabs">
		<button class="tab selected" data-tab="inputs">${text.inputs}</button>
		<button class="tab" data-tab="targets">${text.targets}</button>
		<button class="tab" data-tab="instructions">${text.instructions}</button>
	</div>
	<section id="tab-inputs">
		<p class="intro">${text.inputsIntro}</p>
		<div class="actions"><button class="action" data-command="addInput">${text.addInput}</button></div>
		<div id="inputs"></div>
	</section>
	<section id="tab-targets" hidden>
		<p class="intro">${text.targetsIntro}</p>
		<div class="actions"><button class="action" data-command="addTarget">${text.addTarget}</button></div>
		<div id="targets"></div>
	</section>
	<section id="tab-instructions" hidden>
		<p class="intro">${text.instructionsIntro}</p>
		<textarea id="instructions" placeholder="${text.instructionsPlaceholder}"></textarea>
	</section>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const inputBoxes = new Map();

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	document.querySelectorAll('button[data-command]').forEach(button => {
		button.addEventListener('click', () => vscode.postMessage({ command: button.dataset.command, file: button.dataset.file }));
	});

	document.querySelectorAll('.tab').forEach(tab => {
		tab.addEventListener('click', () => {
			document.querySelectorAll('.tab').forEach(other => other.classList.toggle('selected', other === tab));
			document.querySelectorAll('section').forEach(section => { section.hidden = section.id !== 'tab-' + tab.dataset.tab; });
		});
	});

	const instructions = document.getElementById('instructions');
	let saveTimer;
	instructions.addEventListener('input', () => {
		clearTimeout(saveTimer);
		saveTimer = setTimeout(() => vscode.postMessage({ command: 'instructions', text: instructions.value }), 500);
	});

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
			box.appendChild(tableHead(input.name, input.source));
			box.appendChild(element('div', 'call small', input.url));
			if (input.local) {
				box.appendChild(element('div', 'call small', TEXT.copy.replace('{0}', input.local)));
			}
			const save = element('button', 'link small', TEXT.saveCopy);
			save.addEventListener('click', () => vscode.postMessage({ command: 'saveInput', name: input.name }));
			box.firstChild.appendChild(save);
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

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'input') {
			showInput(message);
			return;
		}
		if (message.command !== 'method') {
			return;
		}
		const method = message.method;
		document.getElementById('title').textContent = method.title;
		document.getElementById('subtitle').textContent = (method.citation ? method.citation + ' \\u2014 ' : '') + method.folder;
		document.getElementById('openArticle').hidden = !method.article && !method.articleLocal;
		document.getElementById('saveArticle').hidden = !method.article;
		const articleCopy = document.getElementById('articleCopy');
		articleCopy.hidden = !method.articleLocal;
		articleCopy.textContent = method.articleLocal ? TEXT.copy.replace('{0}', method.articleLocal) : '';
		document.getElementById('code').dataset.file = 'src/' + method.name + '.jl';
		if (document.activeElement !== instructions) {
			instructions.value = method.instructions;
		}
		renderInputs(method.inputs);
		renderTargets(method.targets);
	});
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

/** Shell quoting for a path or word typed into the terminal. */
function quote(word: string): string {
	return isWindows ? `'${word.replace(/'/g, `''`)}'` : `'${word.replace(/'/g, `'\\''`)}'`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: CREATE_METHOD_COMMAND_ID,
			title: localize2('newMethods.create', "Create Method..."),
			category: localize2('newMethods.category', "New Methods"),
			f1: true,
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const quickInputService = accessor.get(IQuickInputService);
		const fileService = accessor.get(IFileService);
		const pathService = accessor.get(IPathService);
		const notificationService = accessor.get(INotificationService);
		const instantiationService = accessor.get(IInstantiationService);
		const methods = await readMethods(fileService, pathService);
		const pick = methods.length ? await quickInputService.pick<IPick<URI | undefined>>([
			{ label: localize('newMethods.new', "New Method..."), value: undefined },
			...methods.map(method => ({ label: method.title, description: method.name, value: method.folder })),
		], { title: localize('newMethods.pick', "Create Method") }) : { label: '', value: undefined };
		if (!pick) {
			return;
		}
		try {
			const folder = pick.value ?? await newMethod(quickInputService, fileService, pathService);
			if (folder) {
				await instantiationService.invokeFunction(openMethodPage, folder);
			}
		} catch (error) {
			notificationService.error(localize('newMethods.createFailed', "Could not create the method: {0}", toErrorMessage(error)));
		}
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: PACKAGE_METHOD_COMMAND_ID,
			title: localize2('newMethods.package', "Package and Publish..."),
			category: localize2('newMethods.category', "New Methods"),
			f1: true,
		});
	}
	async run(accessor: ServicesAccessor, folder?: URI): Promise<void> {
		const quickInputService = accessor.get(IQuickInputService);
		const fileService = accessor.get(IFileService);
		const pathService = accessor.get(IPathService);
		const notificationService = accessor.get(INotificationService);
		const configurationService = accessor.get(IConfigurationService);
		const dialogService = accessor.get(IDialogService);
		const terminalService = accessor.get(ITerminalService);

		const methods = await readMethods(fileService, pathService);
		let chosen = methods.filter(method => folder && method.folder.toString() === URI.from(folder).toString());
		if (!chosen.length) {
			if (!methods.length) {
				notificationService.info(localize('newMethods.noMethods', "There are no methods to package yet: make one with Create Method."));
				return;
			}
			const picks = await quickInputService.pick(methods.map(method => ({ label: method.title, description: method.name, value: method })), {
				canPickMany: true,
				title: localize('newMethods.package.pick', "Methods to Package"),
				placeHolder: localize('newMethods.package.pickPlaceholder', "Each method becomes its own package, its tests the target tables"),
			});
			chosen = picks?.map(pick => pick.value) ?? [];
		}
		if (!chosen.length) {
			return;
		}
		const empty = chosen.filter(method => !method.targets.length);
		if (empty.length) {
			notificationService.warn(localize('newMethods.package.noTargets', "{0} has no target tables, so nothing to test: add them in Create Method.", empty.map(method => method.title).join(', ')));
			return;
		}

		const action = await quickInputService.pick<IPick<boolean>>([
			{ label: localize('newMethods.package.test', "Package and Test"), detail: localize('newMethods.package.testDetail', "Makes the packages in ~/.pollis/packages and runs their tests"), value: false },
			{ label: localize('newMethods.package.publish', "Package, Test and Push to GitHub..."), detail: localize('newMethods.package.publishDetail', "Then pushes each package whose tests all pass to its own public repository"), value: true },
		], { title: localize('newMethods.package.title', "Package and Publish") });
		if (!action) {
			return;
		}
		let owner: string | undefined;
		if (action.value) {
			owner = (await quickInputService.input({
				title: localize('newMethods.owner.title', "GitHub Owner"),
				prompt: localize('newMethods.owner.prompt', "The GitHub user or organization to push to, e.g. Trumpingtons. Pushing uses the GitHub CLI (gh), signed in."),
				value: configurationService.getValue<string>(GITHUB_OWNER_SETTING) || 'Trumpingtons',
				validateInput: async value => /^[A-Za-z0-9][A-Za-z0-9-]*$/.test(value.trim()) ? undefined : localize('newMethods.owner.invalid', "A GitHub user or organization name."),
			}))?.trim();
			if (!owner) {
				return;
			}
			const { confirmed } = await dialogService.confirm({
				message: localize('newMethods.owner.confirm', "Push to GitHub as {0}?", owner),
				detail: localize('newMethods.owner.confirmDetail', "Each package whose tests all pass goes to its own public repository: {0}.", chosen.map(method => `github.com/${owner}/${method.name}.jl`).join(', ')),
				primaryButton: localize({ key: 'newMethods.owner.push', comment: ['&& denotes a mnemonic'] }, "&&Push"),
			});
			if (!confirmed) {
				return;
			}
			await configurationService.updateValue(GITHUB_OWNER_SETTING, owner);
		}

		const packages = joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'packages');
		await fileService.createFolder(packages);
		const julia = configurationService.getValue<string>('julia.executablePath') || 'julia';
		const words = [julia, FileAccess.asFileUri(PACKAGE_SCRIPT).fsPath, packages.fsPath, ...chosen.map(method => method.folder.fsPath), ...(owner ? ['--push', owner] : [])];
		const instance = await terminalService.createTerminal({ config: { name: localize('newMethods.terminal', "Package and Publish"), cwd: packages } });
		terminalService.setActiveInstance(instance);
		await terminalService.revealTerminal(instance);
		await instance.sendText((isWindows ? '& ' : '') + words.map(quote).join(' '), true);
	}
});
