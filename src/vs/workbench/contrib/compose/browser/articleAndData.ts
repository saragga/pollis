/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { streamToBuffer, VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { basename, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { BrowserViewCommandId } from '../../../../platform/browserView/common/browserView.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IProgressService, ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { asText, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { TomlValue } from '../../model/browser/common/tomlPanelData.js';
import { defaultCopyFolder, isInsidePollis } from '../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { IWebview } from '../../webview/browser/webview.js';
import { skillFile, startAgent } from './pollisAgents.js';

// Article and Data, the first step of the pages that start from an article: Create New Method (newMethods.ts) and
// Replicate an Article (replicateArticle.ts). A record file in the page's folder, method.toml or replication.toml,
// holds the article's link and the tables: input tables, links read into memory with no copy kept or tables typed
// in from the article, in `[inputs.NAME]`; target tables, the published results as printed, in targets/NAME.csv with
// `[targets.NAME]`. Only when the user asks, Save a Copy... keeps a copy outside Pollis and records its path as `local`.
// This file has the step's reading and writing of the record, its texts, HTML, style and script, and the handling of
// its messages; each page adds its own steps around it.

export const DATASETS_URL = 'https://raw.githubusercontent.com/Trumpingtons/PollisDatasets.jl/main';
/** The rows of an input table the page shows. */
const PREVIEW_ROWS = 10;

/** The rows of a table as the page shows them. */
export interface ITableContent {
	readonly header: readonly string[];
	readonly rows: readonly (readonly string[])[];
	readonly rowCount: number;
}

/** An input table: a link to the data, read into memory when shown, or a file of the folder typed in. */
export interface IStudyInput {
	/** Its variable name in the calls. */
	readonly name: string;
	readonly url?: string;
	/** The path in the folder of a table typed in, e.g. `inputs/prices.csv`. */
	readonly file?: string;
	readonly source?: string;
	/** The terms the data's provider states, e.g. `CC BY 4.0`. */
	readonly licence?: string;
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
export interface IStudyTarget extends ITableContent {
	readonly name: string;
	/** The path in the folder, e.g. `targets/table1.csv`. */
	readonly file: string;
	readonly source?: string;
	/** The Julia call that computes it, for a method. */
	readonly call?: string;
}

/** What Article and Data shows and changes of a method or a replication. */
export interface IArticleDataRecord {
	readonly folder: URI;
	readonly name: string;
	/** The link to read the article: its own, or its DOI's. */
	readonly article?: string;
	/** The path of a copy of the article the user saved, opened instead of the link while it exists. */
	readonly articleLocal?: string;
	readonly inputs: readonly IStudyInput[];
	readonly targets: readonly IStudyTarget[];
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

/** The first rows of a delimited text, its header the first line unless the column names are given; `skipto` and `rows` (an input's `limit`) as in {@link IStudyInput}. */
export function parseTable(content: string, limit: number, delim?: string, columns?: readonly string[], skipto?: number, rows?: number): ITableContent {
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

/** A TOML value that is a non-empty string, else undefined. */
export function text(value: unknown): string | undefined {
	return typeof value === 'string' && value ? value : undefined;
}

/** A TOML value that is a table, else an empty one. */
export function table(value: unknown): TomlValue {
	return value && typeof value === 'object' ? value as TomlValue : {};
}

/** The input and target tables of a folder, from its record's `[inputs]` and `[targets]` and its targets/*.csv. */
export async function readTables(fileService: IFileService, folder: URI, toml: TomlValue): Promise<{ inputs: IStudyInput[]; targets: IStudyTarget[] }> {
	const inputs: IStudyInput[] = [];
	for (const [name, value] of Object.entries(table(toml.inputs))) {
		const spec = table(value);
		const url = text(spec.url);
		const file = text(spec.file);
		if (url || file) {
			const columns = Array.isArray(spec.columns) ? spec.columns.filter((column): column is string => typeof column === 'string') : undefined;
			inputs.push({ name, url, file, source: text(spec.source), licence: text(spec.licence), delim: text(spec.delim), columns: columns?.length ? columns : undefined, skipto: count(spec.skipto), limit: count(spec.limit), local: text(spec.local) });
		}
	}
	const targets: IStudyTarget[] = [];
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
	return { inputs: inputs.sort((a, b) => a.name.localeCompare(b.name)), targets: targets.sort((a, b) => a.name.localeCompare(b.name)) };
}

/** A TOML string. */
export function tomlString(value: string): string {
	return `"${value.replace(/[\\"]/g, '\\$&')}"`;
}

/** A Julia variable name made from a file name or a link. */
function variableName(file: string): string {
	const name = file.replace(/[?#].*$/, '').replace(/^.*\//, '').replace(/\.\w+$/, '').replace(/\W+/g, '_').replace(/^(?=\d)/, '_');
	return name || 'data';
}

/** Appends a block of TOML to a record file. */
export async function appendToml(fileService: IFileService, file: URI, block: string): Promise<void> {
	const content = (await fileService.readFile(file)).value.toString();
	await fileService.writeFile(file, VSBuffer.fromString(content.replace(/\n*$/, '\n\n') + block));
}

/**
 * Sets a string or boolean value in a record file: at the top level, or in the table `[section]`. An existing line
 * of the key is replaced; otherwise the line goes after the top level's last value, or after the table's header.
 */
export async function setTomlValue(fileService: IFileService, file: URI, section: string | undefined, key: string, value: string | boolean): Promise<void> {
	const lines = (await fileService.readFile(file)).value.toString().split('\n');
	const header = section === undefined ? -1 : lines.findIndex(line => line.trim() === `[${section}]`);
	if (section !== undefined && header < 0) {
		throw new Error(localize('articleData.toml.noSection', "{0} has no [{1}] table.", basename(file), section));
	}
	const next = lines.findIndex((line, index) => index > header && /^\s*\[/.test(line));
	const end = next < 0 ? lines.length : next;
	const line = `${key} = ${typeof value === 'string' ? tomlString(value) : value}`;
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

/**
 * Replaces the blocks of a record file whose header line, `[name]` or `[[name]]`, `isHeader` picks: they are removed,
 * each up to the next header, and `blocks` is appended in their place.
 */
export async function replaceTomlBlocks(fileService: IFileService, file: URI, isHeader: (header: string) => boolean, blocks: string): Promise<void> {
	const kept: string[] = [];
	let removing = false;
	for (const line of (await fileService.readFile(file)).value.toString().split('\n')) {
		if (/^\s*\[/.test(line)) {
			removing = isHeader(line.trim());
		}
		if (!removing) {
			kept.push(line);
		}
	}
	const content = kept.join('\n').replace(/\n*$/, '\n');
	await fileService.writeFile(file, VSBuffer.fromString(blocks ? `${content}\n${blocks.replace(/\n*$/, '\n')}` : content));
}

/** The `[inputs.NAME]` table of an input, as a record file writes it; `licences` for a replication's. */
export function inputBlock(input: IStudyInput, licences: boolean): string {
	return [
		`[inputs.${input.name}]`,
		input.url ? `url = ${tomlString(input.url)}` : `file = ${tomlString(input.file ?? '')}`,
		`source = ${tomlString(input.source ?? '')}`,
		...(licences ? [`licence = ${tomlString(input.licence ?? '')}`] : []),
		...(input.delim ? [`delim = ${tomlString(input.delim)}`] : []),
		...(input.columns ? [`columns = [${input.columns.map(tomlString).join(', ')}]`] : []),
		...(input.skipto ? [`skipto = ${input.skipto}`] : []),
		...(input.limit ? [`limit = ${input.limit}`] : []),
		'',
	].join('\n');
}

export function validateLink(value: string): string | undefined {
	return /^https?:\/\/\S+$/.test(value.trim()) ? undefined : localize('articleData.link.invalid', "A link starting with https://");
}

async function download(requestService: IRequestService, url: string): Promise<string> {
	const context = await requestService.request({ type: 'GET', url, callSite: 'articleData.data' }, CancellationToken.None);
	if (!isSuccess(context)) {
		throw new Error(localize('articleData.downloadFailed', "Reading {0} failed (server returned {1}).", url, context.res.statusCode ?? '?'));
	}
	return (await asText(context)) ?? '';
}

async function downloadBytes(requestService: IRequestService, url: string): Promise<VSBuffer> {
	const context = await requestService.request({ type: 'GET', url, callSite: 'articleData.copy' }, CancellationToken.None);
	if (!isSuccess(context)) {
		throw new Error(localize('articleData.downloadFailed', "Reading {0} failed (server returned {1}).", url, context.res.statusCode ?? '?'));
	}
	return streamToBuffer(context.stream);
}

/** The services of Article and Data, taken from the accessor when its page opens. */
export interface IArticleDataServices {
	readonly fileService: IFileService;
	readonly fileDialogService: IFileDialogService;
	readonly requestService: IRequestService;
	readonly progressService: IProgressService;
	readonly contextService: IWorkspaceContextService;
	readonly pathService: IPathService;
	readonly environmentService: IEnvironmentService;
	readonly editorService: IEditorService;
	readonly commandService: ICommandService;
	readonly instantiationService: IInstantiationService;
}

/**
 * Saves a copy of a link's file where the user chooses, never inside Pollis, and returns its path. The save
 * dialog starts in the data folder of an open Pollis Workspace, else in the first open folder.
 */
async function saveCopy(services: IArticleDataServices, url: string, fileName: string): Promise<string | undefined> {
	const { fileService, fileDialogService, requestService, progressService, contextService, pathService, environmentService } = services;
	const folder = await defaultCopyFolder(contextService, fileService);
	const target = await fileDialogService.showSaveDialog({
		title: localize('articleData.copy.title', "Save a Copy outside Pollis"),
		defaultUri: folder ? joinPath(folder, fileName) : undefined,
	});
	if (!target) {
		return undefined;
	}
	if (isInsidePollis(target, pathService, environmentService)) {
		throw new Error(localize('articleData.copy.insidePollis', "Copies are kept outside Pollis, e.g. in a Pollis Workspace (File > New Pollis Workspace...): choose a place outside {0}.", target.fsPath));
	}
	const bytes = await progressService.withProgress({ location: ProgressLocation.Notification, title: localize('articleData.copy.progress', "Saving a copy of {0}...", url) }, () => downloadBytes(requestService, url));
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

/** A dataset of PollisDatasets, as the page lists it. */
interface IDataset {
	readonly id: string;
	readonly title: string;
	readonly domain: string;
	/** The terms its provider states. */
	readonly licence?: string;
}

/** The datasets of PollisDatasets, from its catalogue. */
async function datasetCatalogue(requestService: IRequestService): Promise<IDataset[]> {
	const catalogue = await download(requestService, `${DATASETS_URL}/datasets.toml`);
	const datasets: IDataset[] = [];
	for (const block of catalogue.split(/^\[\[datasets\]\]\s*$/m).slice(1)) {
		const field = (key: string) => new RegExp(`^${key} = "(?<value>[^"]*)"`, 'm').exec(block)?.groups?.value;
		const id = field('id');
		if (id && /^[\w-]+$/.test(id)) {
			datasets.push({ id, title: field('title') ?? id, domain: field('domain') ?? '', licence: field('licence') });
		}
	}
	return datasets;
}

/** What differs between the pages that have Article and Data: their record, their words and what they show. */
export interface IArticleDataKind {
	/** The record file in the folder: `method.toml` or `replication.toml`. */
	readonly recordFile: string;
	/** The lines of a new target's table after its `source`, e.g. a method's `call` and `tolerance`. */
	readonly targetFields: string;
	/** Whether an input gets a `licence` and the page warns when it has none (a replication). */
	readonly licences: boolean;
	/** The error of a table name already used: `{0}` is the name. */
	readonly tableExists: (name: string) => string;
	/** What Add from Article asks the coding agent, given the skill's file, the folder, the kind of tables and their numbers. */
	readonly articlePrompt: (skill: string, folder: URI, kind: 'inputs' | 'targets', tables: string) => string;
}

/** The messages of Article and Data. */
export type ArticleDataMessage =
	| { readonly command: 'openArticle' | 'saveArticle' | 'addTargetFiles' | 'catalogue' }
	| { readonly command: 'setArticle'; readonly url: string }
	| { readonly command: 'addLink'; readonly url: string; readonly name: string; readonly delim: string }
	| { readonly command: 'addDataset'; readonly id: string }
	| { readonly command: 'addInput' | 'addTarget'; readonly name: string }
	| { readonly command: 'fromArticle'; readonly kind: 'inputs' | 'targets'; readonly tables: string }
	| { readonly command: 'saveInput'; readonly name: string };

const ARTICLE_DATA_COMMANDS: ReadonlySet<string> = new Set(['openArticle', 'saveArticle', 'addTargetFiles', 'catalogue', 'setArticle', 'addLink', 'addDataset', 'addInput', 'addTarget', 'fromArticle', 'saveInput']);

/** Whether a page's message is one of Article and Data's. */
export function isArticleDataMessage(message: { readonly command: string }): message is ArticleDataMessage {
	return ARTICLE_DATA_COMMANDS.has(message.command);
}

/** Whether a message makes a new record's folder, as the first thing added to it (Add from Article needs the article's link first). */
export function makesFolder(message: ArticleDataMessage): boolean {
	switch (message.command) {
		case 'setArticle': case 'addLink': case 'addDataset': case 'addInput': case 'addTarget': case 'addTargetFiles': return true;
		default: return false;
	}
}

/** A free provisional name for a new folder of `root`, after its title when it has one, else `base`: NewMethod, NewMethod2... */
export async function draftName(fileService: IFileService, root: URI, title: string, base: string): Promise<string> {
	const fromTitle = title.split(/[^A-Za-z0-9]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
	const start = /^[A-Z]/.test(fromTitle) ? fromTitle : base;
	const taken = new Set(((await fileService.exists(root)) ? (await fileService.resolve(root)).children ?? [] : []).map(child => child.name.toLowerCase()));
	for (let n = 1; ; n++) {
		const name = n === 1 ? start : `${start}${n}`;
		if (!taken.has(name.toLowerCase())) {
			return name;
		}
	}
}

/** Opens a record's article: the saved copy, while it exists, in the PDF Viewer, else the link in the integrated browser. */
export async function openRecordArticle(services: IArticleDataServices, record: IArticleDataRecord): Promise<void> {
	const local = record.articleLocal && await services.fileService.exists(URI.file(record.articleLocal)) ? URI.file(record.articleLocal) : undefined;
	if (local) {
		await services.editorService.openEditor({ resource: local, options: { revealIfOpened: true } });
	} else if (record.article) {
		await services.commandService.executeCommand(BrowserViewCommandId.Open, { url: record.article, reuseUrlFilter: record.article, ephemeral: true });
	}
}

/** The page around Article and Data: its webview, its record, and how it reports a form's outcome. */
export interface IArticleDataHost {
	readonly webview: IWebview;
	/** The record as last read. */
	record(): IArticleDataRecord;
	/** Reads the record again and shows it. */
	reload(): Promise<void>;
	/** Runs a form's action: its error is shown under the form, which closes when done. */
	submit(form: string, action: () => Promise<void>): void;
	/** Runs an action, its error shown as a notification. */
	run(action: () => Promise<void>): void;
}

/** Article and Data on a page: what the page calls to show its tables and to handle its messages. */
export interface IArticleData {
	/** Sends each input table to the page, read into memory once for each link. */
	postInputs(): void;
	handle(message: ArticleDataMessage): void;
}

/** Article and Data for a page, with its services, its kind and its host. */
export function createArticleData(services: IArticleDataServices, kind: IArticleDataKind, host: IArticleDataHost): IArticleData {
	const { fileService, requestService, editorService, fileDialogService, instantiationService } = services;
	const recordFile = () => joinPath(host.record().folder, kind.recordFile);
	const openArticle = () => openRecordArticle(services, host.record());

	// A saved copy, when the user made one and it is still there
	const copy = async (local: string | undefined) => local && await fileService.exists(URI.file(local)) ? URI.file(local) : undefined;

	// The input tables, read into memory once for each link, or from the copy the user saved or the file typed in
	const data = new Map<string, Promise<string>>();
	const read = async (input: IStudyInput) => {
		const local = input.file ? joinPath(host.record().folder, ...input.file.split('/')) : await copy(input.local);
		return local ? (await fileService.readFile(local)).value.toString() : download(requestService, input.url ?? '');
	};
	const postInputs = () => {
		for (const input of host.record().inputs) {
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
				value => host.webview.postMessage({ command: 'input', name: input.name, table: parseTable(value, PREVIEW_ROWS, input.delim, input.columns, input.skipto, input.limit) }),
				error => host.webview.postMessage({ command: 'input', name: input.name, error: toErrorMessage(error) })
			);
		}
	};

	/** Throws when a table name is not a variable name or the record already has a table of that name. */
	const checkTableName = (name: string) => {
		if (!TABLE_NAME.test(name)) {
			throw new Error(localize('articleData.table.nameInvalid', "A table's name: letters, digits and underscores, not starting with a digit."));
		}
		const record = host.record();
		if ([...record.inputs, ...record.targets].some(other => other.name === name)) {
			throw new Error(kind.tableExists(name));
		}
	};
	const targetBlock = (name: string) => `[targets.${name}]\nsource = ""\n${kind.targetFields}`;
	const licenceLine = (licence = '') => kind.licences ? `licence = ${tomlString(licence)}\n` : '';

	let datasets: Promise<IDataset[]> | undefined;

	const handle = (message: ArticleDataMessage) => {
		const record = host.record();
		const folder = record.folder;
		if (message.command === 'setArticle') {
			host.submit('article', async () => {
				const url = message.url.trim();
				const invalid = validateLink(url);
				if (invalid) {
					throw new Error(invalid);
				}
				await setTomlValue(fileService, recordFile(), undefined, 'article', url);
				await host.reload();
				await openArticle();
			});
		} else if (message.command === 'addLink') {
			host.submit('link', async () => {
				const url = message.url.trim();
				const name = message.name.trim();
				const invalid = validateLink(url);
				if (invalid) {
					throw new Error(invalid);
				}
				checkTableName(name);
				const separator = DELIMITERS.includes(message.delim) ? message.delim : ',';
				await appendToml(fileService, recordFile(), `[inputs.${name}]\nurl = ${tomlString(url)}\nsource = ""\n${licenceLine()}${separator === ',' ? '' : `delim = ${tomlString(separator)}\n`}`);
			});
		} else if (message.command === 'catalogue') {
			datasets ??= datasetCatalogue(requestService);
			datasets.then(
				items => host.webview.postMessage({ command: 'catalogue', items }),
				error => {
					datasets = undefined;
					host.webview.postMessage({ command: 'formError', form: 'datasets', message: toErrorMessage(error) });
				}
			);
		} else if (message.command === 'addDataset') {
			host.submit('datasets', async () => {
				const dataset = (await datasets)?.find(candidate => candidate.id === message.id);
				if (dataset) {
					const name = variableName(dataset.id);
					checkTableName(name);
					await appendToml(fileService, recordFile(), `[inputs.${name}]\nurl = ${tomlString(`${DATASETS_URL}/data/${dataset.id}.csv`)}\nsource = ${tomlString(`PollisDatasets: ${dataset.title}`)}\n${licenceLine(dataset.licence)}`);
				}
			});
		} else if (message.command === 'addInput') {
			// An empty input table, a file of the folder to type in from the article, opened
			host.submit('input', async () => {
				const name = message.name.trim();
				checkTableName(name);
				const file = joinPath(folder, 'inputs', `${name}.csv`);
				await fileService.writeFile(file, VSBuffer.fromString('Column 1,Column 2\n,\n,\n'));
				await appendToml(fileService, recordFile(), `[inputs.${name}]\nfile = ${tomlString(`inputs/${name}.csv`)}\nsource = ""\n${licenceLine()}`);
				await editorService.openEditor({ resource: file });
			});
		} else if (message.command === 'addTarget') {
			// An empty target table, to type in from the article, opened
			host.submit('target', async () => {
				const name = message.name.trim();
				checkTableName(name);
				const file = joinPath(folder, 'targets', `${name}.csv`);
				await fileService.writeFile(file, VSBuffer.fromString('label,Column 1,Column 2\nRow 1,,\nRow 2,,\n'));
				await appendToml(fileService, recordFile(), targetBlock(name));
				await editorService.openEditor({ resource: file });
			});
		} else if (message.command === 'fromArticle') {
			const form = message.kind === 'targets' ? 'targetArticle' : 'inputArticle';
			host.submit(form, async () => {
				const tables = message.tables.trim();
				if (!tables) {
					throw new Error(localize('articleData.fromArticle.noTables', "The numbers of the tables, e.g. 3.2, 5.8"));
				}
				if (!record.article && !record.articleLocal) {
					throw new Error(localize('articleData.fromArticle.noArticle', "Set the article's link first."));
				}
				const skill = await instantiationService.invokeFunction(skillFile, 'tables-from-article');
				if (skill) {
					await instantiationService.invokeFunction(startAgent, localize('articleData.fromArticle.terminal', "Tables of {0}", record.name), kind.articlePrompt(skill.fsPath, folder, message.kind, tables), folder, 'tablesFromArticle');
				}
			});
		} else if (message.command === 'addTargetFiles') {
			// Target tables from CSV files the user picks, then the record for their sources
			host.run(async () => {
				const files = await fileDialogService.showOpenDialog({ canSelectMany: true, filters: [{ name: 'CSV', extensions: ['csv'] }] });
				for (const file of files ?? []) {
					const name = variableName(basename(file));
					await fileService.copy(file, joinPath(folder, 'targets', `${name}.csv`), true);
					await appendToml(fileService, recordFile(), targetBlock(name));
				}
				if (files?.length) {
					await editorService.openEditor({ resource: recordFile() });
				}
			});
		} else if (message.command === 'openArticle') {
			host.run(openArticle);
		} else if (message.command === 'saveArticle') {
			host.run(async () => {
				if (record.article) {
					const local = await saveCopy(services, record.article, copyName(record.article, record.name, '.pdf'));
					if (local) {
						await setTomlValue(fileService, recordFile(), undefined, 'article_local', local);
					}
				}
			});
		} else if (message.command === 'saveInput') {
			host.run(async () => {
				const input = record.inputs.find(candidate => candidate.name === message.name);
				if (input?.url) {
					const local = await saveCopy(services, input.url, copyName(input.url, input.name, '.csv'));
					if (local) {
						await setTomlValue(fileService, recordFile(), `inputs.${input.name}`, 'local', local);
					}
				}
			});
		}
	};

	return { postInputs, handle };
}

/** The words of Article and Data that differ between a method and a replication. */
export interface IArticleDataWords {
	readonly articleIntro: string;
	readonly inputsIntro: string;
	readonly targetsIntro: string;
	readonly emptyInputHint: string;
	readonly targetFilesHint: string;
	readonly targetArticleHint: string;
	readonly noTargets: string;
}

/** The texts of Article and Data, with a page's own words. */
export function articleDataText(words: IArticleDataWords) {
	return {
		...words,
		article: localize('articleData.article', "Article"),
		inputs: localize('articleData.inputs', "Input Tables"),
		targets: localize('articleData.targets', "Target Tables"),
		articleLink: localize('articleData.articleLink', "Article Link"),
		saveCopy: localize('articleData.saveCopy', "Save a Copy..."),
		copy: localize('articleData.copy', "Copy: {0} (read instead of the link while it exists)"),
		emptyTable: localize('articleData.emptyTable', "Empty Table"),
		addLink: localize('articleData.addLink', "Add from a Link"),
		addDatasets: localize('articleData.addDatasets', "Add from PollisDatasets"),
		addFromArticle: localize('articleData.addFromArticle', "Add from Article"),
		targetFiles: localize('articleData.targetFiles', "Add from CSV Files"),
		chooseFiles: localize('articleData.chooseFiles', "Choose CSV Files..."),
		link: localize('articleData.link', "Link to the data"),
		tableName: localize('articleData.tableName', "Name of the table"),
		tableNamePlaceholder: localize('articleData.tableNamePlaceholder', "e.g. table2_5"),
		delim: localize('articleData.delim', "Columns separated by"),
		comma: localize('articleData.delim.comma', "Commas"),
		whitespace: localize('articleData.delim.whitespace', "Spaces (aligned columns)"),
		tab: localize('articleData.delim.tab', "Tabs"),
		semicolon: localize('articleData.delim.semicolon', "Semicolons"),
		emptyTargetHint: localize('articleData.target.emptyDetail', "Type in the published table: row labels in the first column, the values as printed"),
		articleTables: localize('articleData.articleTables', "Numbers of the tables in the article"),
		articleTablesPlaceholder: localize('articleData.articleTablesPlaceholder', "e.g. 3.2, 5.8"),
		inputArticleHint: localize('articleData.inputArticleHint', "Your coding agent reads the article and types the tables in as input tables, every value as printed. Check them against the article."),
		ask: localize('articleData.ask', "Ask Agent"),
		add: localize('articleData.add', "Add"),
		added: localize('articleData.added', "Added"),
		cancel: localize('articleData.cancel', "Cancel"),
		save: localize('articleData.save', "Save"),
		filter: localize('articleData.filter', "Filter the datasets"),
		loadingCatalogue: localize('articleData.catalogue', "Getting the PollisDatasets catalogue..."),
		size: localize('articleData.size', "{0} rows, {1} columns"),
		firstRows: localize('articleData.firstRows', "first {0} shown"),
		loading: localize('articleData.loading', "Reading..."),
		noInputs: localize('articleData.noInputs', "No input tables yet."),
		call: localize('articleData.call', "Call"),
		noCall: localize('articleData.noCall', "No call yet: write it in method.toml"),
		noSource: localize('articleData.noSource', "No source yet"),
		licence: localize('articleData.licence', "Licence: {0}"),
		noLicence: localize('articleData.noLicence', "No licence stated: before sharing the replication, ask the data's owner whether it may be shared, and write the terms in the input's licence."),
	};
}

/** The HTML of Article and Data: its tabs Article, Input Tables and Target Tables, each with its forms. */
export function articleDataHtml(text: ReturnType<typeof articleDataText>): string {
	return `
		<div class="tabs">
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
				<button class="action choice" data-group="inputs" data-choice="inputArticle">${text.addFromArticle}</button>
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
				<button class="action choice" data-group="targets" data-choice="targetArticle">${text.addFromArticle}</button>
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
`;
}

/** The styles of a page with Article and Data: the editable title and the draft's note, then the panes', kept inside them, away from Learn More and Ask Pollis. */
export const ARTICLE_DATA_STYLE = `
		h1[contenteditable] { display: inline-block; min-width: 120px; padding: 0 2px; border-radius: 2px; cursor: text; }
		h1[contenteditable]:hover { outline: 1px dashed var(--vscode-descriptionForeground); }
		h1[contenteditable]:focus { outline: 1px solid var(--vscode-focusBorder); }
		[hidden] { display: none !important; }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.link:hover { text-decoration: underline; }
		.notice { display: block; font-size: 12px; border-left: 3px solid var(--vscode-focusBorder); padding: 6px 10px; margin: 8px 0 0 0; max-width: 1000px; }
		.step-link .step-number { width: 16px; height: 16px; font-size: 10px; margin-right: 3px; }
		.step-pane {
			* { box-sizing: border-box; }
			h2 { font-size: 15px; font-weight: 600; margin: 24px 0 8px 0; }
			.intro, .small { color: var(--vscode-descriptionForeground); }
			.intro { margin: 0 0 12px 0; line-height: 1.4; max-width: 900px; }
			.small { font-size: 12px; }
			.actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 12px 0; }
			button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; box-shadow: inset 0 0 0 1px var(--vscode-button-background); border-radius: 2px; padding: 4px 12px; cursor: pointer; font-size: 11px; opacity: 0.7; }
			/* As the code buttons below a panel's Example Code: dimmed until pointed at, the blue one not */
			button.action:not(:disabled):hover, button.action.current, button.action.primary { opacity: 1; }
			button.action:hover { background: var(--vscode-button-secondaryHoverBackground); }
			button.action:disabled { cursor: default; opacity: 0.6; }
			button.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
			button.primary:hover { background: var(--vscode-button-hoverBackground); }
			.error { color: var(--vscode-errorForeground); }
			.warning { color: var(--vscode-editorWarning-foreground); }
			.form { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 10px; margin: 0 0 12px 0; padding: 10px 12px; border: 1px solid var(--vscode-widget-border); border-radius: 4px; max-width: 1000px; }
			.form label { display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: var(--vscode-descriptionForeground); }
			.form .error { flex-basis: 100%; margin: 0; }
			.form .error:empty { display: none; }
			input, select { font-family: var(--vscode-font-family); font-size: 13px; padding: 4px 6px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
			input.wide { width: 420px; max-width: 100%; }
			input:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); }
			.tabs { display: flex; flex-wrap: wrap; gap: 16px; border-bottom: 1px solid var(--vscode-widget-border); margin: 0 0 12px 0; }
			.tab { font: inherit; font-size: 12px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--vscode-descriptionForeground); padding: 4px 0; cursor: pointer; }
			.tab.selected { color: var(--vscode-foreground); border-bottom-color: var(--vscode-focusBorder); }
			code { font-family: var(--vscode-editor-font-family); color: var(--vscode-textPreformat-foreground); background: var(--vscode-textPreformat-background); border-radius: 3px; padding: 0 3px; }
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
		}`;

/**
 * The script of Article and Data, after the page's `TEXT` (with {@link articleDataText}) and `OPTIONS`
 * (`{ calls, licences }`: whether the targets show their calls, and the inputs their licences). It also has the
 * forms of the whole page: a page adds its own to `FORMS`, and its fields are saved, cancelled and refreshed as
 * these are. The page shows the record with `showArticleData(record)` and passes each message to
 * `articleDataMessage(message)`, which says whether it was one of Article and Data's.
 */
export const ARTICLE_DATA_SCRIPT = `
	const DATASETS_URL = ${JSON.stringify(DATASETS_URL)};
	const inputBoxes = new Map();
	let record;
	let catalogue;

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	const value = id => document.getElementById(id).value;
	const set = (id, text) => { document.getElementById(id).value = text; };

	// What each form or field sends; a page adds its own
	const FORMS = {
		article: { send: () => ({ command: 'setArticle', url: value('articleUrl') }) },
		input: { send: () => ({ command: 'addInput', name: value('inputName') }) },
		link: { send: () => ({ command: 'addLink', url: value('linkUrl'), name: value('linkName'), delim: value('linkDelim') }) },
		inputArticle: { send: () => ({ command: 'fromArticle', kind: 'inputs', tables: value('inputTables') }) },
		target: { send: () => ({ command: 'addTarget', name: value('targetName') }) },
		targetArticle: { send: () => ({ command: 'fromArticle', kind: 'targets', tables: value('targetTables') }) },
	};
	// The forms whose inputs are emptied once done, for the next table
	const CLEARED_FORMS = ['input', 'link', 'inputArticle', 'target', 'targetArticle'];

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

	// A step's pane, opened and brought into view from a note or by the host
	function openStep(name) {
		const pane = document.getElementById('step-' + name);
		pane.classList.remove('collapsed');
		pane.scrollIntoView({ block: 'start' });
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
		set('articleUrl', record.article || '');
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
	document.querySelectorAll('[data-part]').forEach(tab => tab.addEventListener('click', () => select('part', tab.dataset.part)));

	// The table's name follows the link until the user types one
	const linkName = document.getElementById('linkName');
	document.getElementById('linkUrl').addEventListener('input', e => {
		if (!linkName.dataset.typed) {
			const name = e.target.value.replace(/[?#].*$/, '').replace(/^.*\\//, '').replace(/\\.\\w+$/, '').replace(/\\W+/g, '_').replace(/^(?=\\d)/, '_');
			linkName.value = name;
		}
	});
	linkName.addEventListener('input', () => { linkName.dataset.typed = linkName.value ? '1' : ''; });

	function renderDatasets() {
		const container = document.getElementById('datasets');
		if (!catalogue) { return; }
		container.textContent = '';
		const filter = value('datasetFilter').trim().toLowerCase();
		const used = new Set((record ? record.inputs : []).map(input => input.url));
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

	// Whether an input's terms are stated: PollisDatasets writes "None stated; ..." when its provider gives none
	const licenceStated = input => !!input.licence && !/^none stated/i.test(input.licence);

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
			if (OPTIONS.licences) {
				if (input.licence) {
					box.appendChild(element('div', 'small', TEXT.licence.replace('{0}', input.licence)));
				}
				if (!licenceStated(input)) {
					box.appendChild(element('div', 'small warning', TEXT.noLicence));
				}
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
			if (OPTIONS.calls) {
				box.appendChild(element('div', target.call ? 'call' : 'call small', target.call ? TEXT.call + ': ' + target.call : TEXT.noCall));
			}
			box.appendChild(grid(target));
			container.appendChild(box);
		}
	}

	// The saved value of each field, which Cancel puts back. A field is refreshed from the record unless
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
	document.querySelectorAll('button[data-cancel]').forEach(button => button.addEventListener('click', () => revert(button.dataset.cancel)));

	// A note whose placeholders, {0} and so on, are steps of the page, as links that open them: steps maps each to [id, number, title]
	function stepLinks(container, template, steps) {
		container.textContent = '';
		for (const part of template.split(/({\\d})/)) {
			const step = steps[part];
			if (!step) {
				container.appendChild(document.createTextNode(part));
				continue;
			}
			const link = element('button', 'link step-link');
			link.appendChild(element('span', 'step-number', step[1]));
			link.appendChild(document.createTextNode(step[2]));
			link.addEventListener('click', () => openStep(step[0]));
			container.appendChild(link);
		}
	}

	// The heading is the page's title, edited in place: Enter saves it, Escape or leaving it puts back title()
	const heading = document.querySelector('.title-row h1');
	function editableHeading(hint, title, save) {
		heading.contentEditable = 'plaintext-only';
		heading.spellcheck = false;
		heading.title = hint;
		heading.addEventListener('keydown', e => {
			if (e.key === 'Enter') {
				e.preventDefault();
				const typed = heading.textContent.trim();
				if (typed) { save(typed); }
				heading.blur();
			} else if (e.key === 'Escape') {
				heading.blur();
			}
		});
		heading.addEventListener('blur', () => { heading.textContent = title(); });
	}

	// Shows the record in Article and Data
	function showArticleData(shown) {
		record = shown;
		refresh('articleUrl', record.article || '');
		renderInputs(record.inputs);
		renderTargets(record.targets);
		renderDatasets();
	}

	// Handles a message of Article and Data, or of the page's forms; false for one of the page's own
	function articleDataMessage(message) {
		if (message.command === 'input') {
			showInput(message);
		} else if (message.command === 'step') {
			openStep(message.step);
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
			if (CLEARED_FORMS.includes(message.form)) {
				clearForm(message.form);
				if (message.form === 'link') { delete linkName.dataset.typed; }
			}
		} else {
			return false;
		}
		return true;
	}
`;
