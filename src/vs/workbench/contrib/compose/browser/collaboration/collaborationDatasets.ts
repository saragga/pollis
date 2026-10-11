/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../../base/common/buffer.js';
import { basename } from '../../../../../base/common/resources.js';
import { URI } from '../../../../../base/common/uri.js';
import { localize } from '../../../../../nls.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IDialogService, IFileDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { IEnvironmentService } from '../../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { sendToJuliaRepl } from '../../../model/browser/handlers/model.handler.js';
import { IDatasetSharedPayload, MAX_DATASET_BYTES } from './collaborationProtocol.js';

// Compose > Collaboration, Share Dataset (internal-reports/collaboration-spec.md, with its safety rules): a
// participant shares a CSV file, or a Julia table from the table viewer written out as CSV; the others get a
// card in the chat with the first rows and Preview, Save to My Workspace and Load into My Julia Session.
// A dataset is plain text, nothing runs when it arrives, and names from it reach generated code only escaped.

/** The rows a dataset card shows. */
const HEAD_ROWS = 5;

/** What a CSV text holds, as far as a card and loading it need. */
export interface IDatasetSummary {
	readonly delimiter: ',' | ';' | '\t';
	readonly header: readonly string[];
	/** The data rows, without the header. */
	readonly rows: number;
	readonly head: readonly (readonly string[])[];
	/** Whether some cell starts with =, +, - or @ and is not a number, which a spreadsheet may read as a formula. */
	readonly formulas: boolean;
}

/** A dataset another participant shared, kept until the session ends. */
export interface IReceivedDataset {
	readonly sharer: string;
	readonly payload: IDatasetSharedPayload;
	readonly summary: IDatasetSummary;
	/** Where the receiver saved it, which loading then uses. */
	saved?: URI;
}

/** The delimiter of a CSV text: the one of comma, semicolon and tab that its first line has most of, outside quotes. */
function detectDelimiter(content: string): ',' | ';' | '\t' {
	const counts = { ',': 0, ';': 0, '\t': 0 };
	let quoted = false;
	for (const character of content.slice(0, 64 * 1024)) {
		if (character === '"') {
			quoted = !quoted;
		} else if (!quoted && (character === '\n' || character === '\r')) {
			break;
		} else if (!quoted && (character === ',' || character === ';' || character === '\t')) {
			counts[character]++;
		}
	}
	return counts[';'] > counts[','] && counts[';'] >= counts['\t'] ? ';' : counts['\t'] > counts[','] ? '\t' : ',';
}

/** Whether a cell could be read as a formula by a spreadsheet: not a signed number, with a decimal point or comma. */
function looksLikeFormula(cell: string): boolean {
	return /^[=+\-@]/.test(cell) && !/^[+-][\d.,]+(?:[eE][+-]?\d+)?%?$/.test(cell);
}

/**
 * Reads a CSV text (RFC 4180: quoted fields may hold the delimiter, quotes doubled and line breaks): the header,
 * the number of rows and the first rows. Undefined when it is not a dataset: empty, a header without names, or
 * holding NUL characters, as binary files do.
 */
export function summarizeCsv(content: string): IDatasetSummary | undefined {
	if (!content.trim() || content.includes('\u0000')) {
		return undefined;
	}
	const text = content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
	const delimiter = detectDelimiter(text);
	let header: string[] | undefined;
	const head: string[][] = [];
	let rows = 0;
	let formulas = false;
	let record: string[] = [];
	let field = '';
	let quoted = false;
	const endRecord = () => {
		record.push(field);
		field = '';
		const blank = record.length === 1 && record[0] === '';
		if (!blank) {
			if (!header) {
				header = record;
			} else {
				rows++;
				if (head.length < HEAD_ROWS) {
					head.push(record);
				}
				formulas ||= record.some(looksLikeFormula);
			}
		}
		record = [];
	};
	for (let i = 0; i < text.length; i++) {
		const character = text[i];
		if (quoted) {
			if (character === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i++;
				} else {
					quoted = false;
				}
			} else {
				field += character;
			}
		} else if (character === '"' && field === '') {
			quoted = true;
		} else if (character === delimiter) {
			record.push(field);
			field = '';
		} else if (character === '\n' || character === '\r') {
			if (character === '\r' && text[i + 1] === '\n') {
				i++;
			}
			endRecord();
		} else {
			field += character;
		}
	}
	if (field !== '' || record.length) {
		endRecord();
	}
	const names: string[] | undefined = header;
	if (!names || names.every(name => !name.trim())) {
		return undefined;
	}
	return { delimiter, header: names, rows, head, formulas };
}

/** A received file name reduced to a safe base name ending in .csv: no folders, no `..`, no characters files cannot have. */
export function datasetFileName(fileName: string): string {
	const base = fileName.split(/[\\/]/).pop() ?? '';
	const cleaned = base.replace(/[:*?"<>|\u0000-\u001f]/g, '_').replace(/^\.+/, '').trim().slice(0, 100);
	if (!cleaned) {
		return 'dataset.csv';
	}
	return /\.csv$/i.test(cleaned) ? cleaned : `${cleaned}.csv`;
}

/** A size in words: kB below a megabyte, else MB. */
export function formatBytes(bytes: number): string {
	return bytes < 1024 * 1024
		? localize('collaboration.kilobytes', "{0} kB", Math.max(1, Math.round(bytes / 1024)))
		: localize('collaboration.megabytes', "{0} MB", (bytes / 1024 / 1024).toFixed(1));
}

const JULIA_KEYWORDS = new Set(['baremodule', 'begin', 'break', 'catch', 'const', 'continue', 'do', 'else', 'elseif', 'end', 'export', 'false', 'finally', 'for', 'function', 'global', 'if', 'import', 'let', 'local', 'macro', 'module', 'quote', 'return', 'struct', 'true', 'try', 'using', 'while', 'abstract', 'mutable', 'primitive', 'type', 'outer', 'public']);

/** A Julia variable name made from a file name: letters, digits and underscores only. */
function juliaVariableName(fileName: string): string {
	const name = fileName.replace(/\.csv$/i, '').replace(/[^A-Za-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
	if (!name || JULIA_KEYWORDS.has(name)) {
		return 'shared_data';
	}
	return /^[0-9]/.test(name) ? `data_${name}` : name;
}

/** A Julia string literal: backslashes, quotes and $ escaped, so the text stays text. */
function juliaString(text: string): string {
	return `"${text.replace(/[\\"$]/g, character => `\\${character}`).replace(/\n/g, '\\n').replace(/\r/g, '\\r')}"`;
}

/** The line that loads a CSV file into the Julia session as a Tables.columntable (never a DataFrame). */
function juliaLoadCode(file: URI, delimiter: IDatasetSummary['delimiter']): string {
	const variable = juliaVariableName(basename(file));
	const delim = delimiter === ',' ? '' : delimiter === ';' ? `; delim = ';'` : `; delim = '\\t'`;
	return `Pollis.packages("CSV", "Tables"); using CSV, Tables; ${variable} = CSV.read(${juliaString(file.fsPath)}, Tables.columntable${delim}); Tables.schema(${variable})`;
}

/** Reading a dataset to share, confirming it, and saving or loading one received. */
export class SharedDatasets {

	constructor(
		/** Shows a notice in the chat of the session. */
		private readonly notice: (text: string) => void,
		@IFileService private readonly fileService: IFileService,
		@IFileDialogService private readonly fileDialogService: IFileDialogService,
		@IDialogService private readonly dialogService: IDialogService,
		@IEnvironmentService private readonly environmentService: IEnvironmentService,
		@IWorkspaceContextService private readonly workspaceContextService: IWorkspaceContextService,
		@IPathService private readonly pathService: IPathService,
		@ICommandService private readonly commandService: ICommandService,
	) { }

	/** A CSV file read as text; undefined, with a notice, when it is too large or not UTF-8 text. */
	async read(resource: URI): Promise<{ readonly fileName: string; readonly content: string } | undefined> {
		const fileName = basename(resource);
		const stat = await this.fileService.stat(resource);
		if (stat.size > MAX_DATASET_BYTES) {
			this.notice(localize('collaboration.datasetTooLarge', "{0} is too large to share ({1}; the limit is {2} MB): send it the usual way.", fileName, formatBytes(stat.size), MAX_DATASET_BYTES / 1024 / 1024));
			return undefined;
		}
		const bytes = (await this.fileService.readFile(resource)).value.buffer;
		try {
			return { fileName, content: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
		} catch {
			this.notice(localize('collaboration.datasetNotText', "{0} is not a CSV file in UTF-8 text, so it was not shared.", fileName));
			return undefined;
		}
	}

	/** Asks before sharing: everyone gets a copy they keep, and the invitation works like a key. */
	async confirmShare(fileName: string, content: string, summary: IDatasetSummary): Promise<boolean> {
		const { confirmed } = await this.dialogService.confirm({
			message: localize('collaboration.confirmDataset', "Share {0} with everyone in the session?", fileName),
			detail: localize('collaboration.confirmDatasetDetail', "{0} rows × {1} columns, {2}. Every participant gets a copy and keeps it. Anyone with the invitation can join and receive what is shared, so do not share personal or confidential data in a session whose invitation has gone around.", summary.rows, summary.header.length, formatBytes(VSBuffer.fromString(content).byteLength)),
			primaryButton: localize({ key: 'collaboration.shareDatasetButton', comment: ['&& denotes a mnemonic'] }, "&&Share Dataset"),
		});
		return confirmed;
	}

	/** Saves a dataset where the receiver chooses, by default in the first workspace folder. */
	async save(dataset: IReceivedDataset): Promise<void> {
		const fileName = datasetFileName(dataset.payload.fileName);
		const folder = this.workspaceContextService.getWorkspace().folders[0]?.uri ?? await this.pathService.userHome();
		const target = await this.fileDialogService.showSaveDialog({
			title: localize('collaboration.saveDatasetTitle', "Save {0}'s Dataset", dataset.sharer),
			defaultUri: URI.joinPath(folder, fileName),
			filters: [{ name: localize('collaboration.csvFiles', "CSV Files"), extensions: ['csv'] }],
		});
		if (!target) {
			return;
		}
		await this.fileService.writeFile(target, VSBuffer.fromString(dataset.payload.content));
		dataset.saved = target;
		this.notice(localize('collaboration.datasetSaved', "You saved {0}'s {1} as {2}.", dataset.sharer, fileName, target.fsPath));
	}

	/** Loads a dataset into the Julia session: from where it was saved, else from a copy in Pollis's cache. */
	async load(dataset: IReceivedDataset): Promise<void> {
		let file = dataset.saved;
		if (!file || !await this.fileService.exists(file)) {
			file = URI.joinPath(this.environmentService.cacheHome, 'pollis-collaboration', dataset.payload.id.replace(/[^A-Za-z0-9-]/g, ''), datasetFileName(dataset.payload.fileName));
			await this.fileService.writeFile(file, VSBuffer.fromString(dataset.payload.content));
		}
		if (await sendToJuliaRepl(juliaLoadCode(file, dataset.summary.delimiter), this.commandService)) {
			this.notice(localize('collaboration.datasetLoaded', "You loaded {0}'s {1} into your Julia session as {2}.", dataset.sharer, datasetFileName(dataset.payload.fileName), juliaVariableName(basename(file))));
		}
	}
}
