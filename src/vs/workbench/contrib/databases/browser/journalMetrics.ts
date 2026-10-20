/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Pollis: the journal metrics the user exports from Journal Citation Reports (JIF, JCI), Scopus (CiteScore), SCImago
// (SJR) and CWTS (SNIP), read from their CSV or Excel files into a row per journal, year and category: the JSON Lines
// files of ~/.pollis/journals/metrics, which the metrics view of the PollisJournals database reads. Their licences
// let the user keep them, not Pollis publish them, so they are imported, never downloaded. The Excel files can be
// large (CWTS's sheet is over 400 MB unzipped), so they are read as streams, a row at a time.

/** A line of a metrics file: the columns of the metrics view, null where the source has no such metric. */
export interface IJournalMetricsRow {
	readonly source: JournalMetricsSource;
	readonly year: number | null;
	readonly title: string | null;
	readonly issn: string | null;
	readonly eissn: string | null;
	readonly category: string | null;
	readonly jif: number | null;
	readonly jif_5year: number | null;
	readonly jif_quartile: string | null;
	readonly jci: number | null;
	readonly citescore: number | null;
	readonly citescore_quartile: string | null;
	readonly sjr: number | null;
	readonly sjr_quartile: string | null;
	readonly h_index: number | null;
	readonly snip: number | null;
	readonly ipp: number | null;
	readonly imported: string;
}

export type JournalMetricsSource = 'JCR' | 'Scopus' | 'SCImago' | 'CWTS';

type Metric = 'title' | 'issn' | 'eissn' | 'category' | 'year' | 'jif' | 'jif_5year' | 'jif_quartile' | 'jci' | 'citescore' | 'citescore_quartile' | 'sjr' | 'sjr_quartile' | 'h_index' | 'snip' | 'ipp';

/** A header, as the columns of each source are found: lower case, single spaces. */
type HeaderMatch = string | RegExp;

/** The columns of each source, by the headers its files have had; the first header found is taken. */
const SOURCES: Record<JournalMetricsSource, { readonly detect: readonly HeaderMatch[]; readonly columns: Partial<Record<Metric, readonly HeaderMatch[]>>; readonly year?: RegExp }> = {
	JCR: {
		detect: [/^(journal name|full journal title)$/, /jif/],
		columns: {
			title: ['journal name', 'full journal title'],
			issn: ['issn'],
			eissn: ['eissn'],
			category: ['category'],
			jif: [/^\d{4} jif$/, 'journal impact factor', 'jif'],
			jif_5year: [/^5 year jif$/, /5[- ]year/],
			jif_quartile: ['jif quartile'],
			jci: [/^\d{4} jci$/, 'jci'],
		},
		year: /^(?<year>\d{4}) jif$/,
	},
	Scopus: {
		detect: [/^(scopus source id|sourcerecord id)$/, /^citescore/],
		columns: {
			title: ['title', 'source title'],
			issn: ['print issn', 'issn'],
			eissn: ['e-issn', 'eissn'],
			category: ['scopus sub-subject area', 'scopus asjc code (sub-subject area)', 'subject area'],
			citescore: [/^citescore( \d{4})?$/],
			citescore_quartile: ['quartile'],
			sjr: [/^sjr( \d{4})?$/],
			snip: [/^snip( \d{4})?$/],
		},
		year: /^citescore (?<year>\d{4})$/,
	},
	SCImago: {
		detect: ['sourceid', /^sjr$/],
		columns: {
			title: ['title'],
			issn: ['issn'],
			category: ['categories'],
			sjr: ['sjr'],
			sjr_quartile: ['sjr best quartile'],
			h_index: ['h index'],
		},
	},
	CWTS: {
		detect: ['source title', 'snip', 'ipp'],
		columns: {
			title: ['source title'],
			issn: ['print issn'],
			eissn: ['electronic issn'],
			year: ['year'],
			snip: ['snip'],
			ipp: ['ipp'],
		},
	},
};

function normalizeHeader(header: string): string {
	return header.replace(/\s+/g, ' ').trim().toLowerCase();
}

function matches(header: string, match: HeaderMatch): boolean {
	return typeof match === 'string' ? header === match : match.test(header);
}

/** The column of the first of `matches` that a header has, or -1. */
function columnOf(headers: readonly string[], candidates: readonly HeaderMatch[]): number {
	for (const match of candidates) {
		const index = headers.findIndex(header => matches(header, match));
		if (index >= 0) {
			return index;
		}
	}
	return -1;
}

/** The source whose headers `row` has, if it is a header row. */
function detectSource(row: readonly string[]): JournalMetricsSource | undefined {
	const headers = row.map(normalizeHeader);
	// SCImago and Scopus files both have an SJR column, and CWTS's a title: the most specific first
	return (['SCImago', 'Scopus', 'JCR', 'CWTS'] as const).find(source => SOURCES[source].detect.every(match => headers.some(header => matches(header, match))));
}

/** An ISSN as NNNN-NNNX, from the forms the sources give it in (with or without the hyphen, as a number that lost its zeros). */
function normalizeIssn(value: string | undefined): string | null {
	const digits = value?.replace(/[^0-9xX]/g, '').toUpperCase();
	if (!digits || digits.length > 8 || digits.length < 5) {
		return null;
	}
	const padded = digits.padStart(8, '0');
	return `${padded.slice(0, 4)}-${padded.slice(4)}`;
}

/** A number, with a decimal comma where the file uses them; null for what is no number (JCR's "<0.1", "N/A"). */
function parseNumber(value: string | undefined, decimalComma: boolean): number | null {
	const text = value?.trim();
	if (!text) {
		return null;
	}
	const number = Number(decimalComma ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, ''));
	return Number.isFinite(number) ? number : null;
}

/**
 * Reads the rows of a metrics file into lines, once its header row is found among its first rows (JCR's exports
 * start with a title line). Throws when no source's headers are found.
 */
export class JournalMetricsReader {

	private source: JournalMetricsSource | undefined;
	private columns: Partial<Record<Metric, number>> = {};
	private headerYear: number | undefined;
	private rowsSeen = 0;
	private readonly imported = new Date().toISOString();
	/** The year of the rows when neither a Year column nor a header gives it: the file name's, or the user's. */
	defaultYear: number | undefined;

	constructor(private readonly decimalComma: boolean) { }

	get detected(): JournalMetricsSource | undefined {
		return this.source;
	}

	/** Whether the rows have a year, by a Year column or a header (else the file name's, or the user's, is taken). */
	get hasYear(): boolean {
		return this.columns.year !== undefined || this.headerYear !== undefined;
	}

	/** The line of `row`, or undefined for a row before the header, the header itself, or a row with no ISSN or title. */
	read(row: readonly string[]): IJournalMetricsRow | undefined {
		if (!this.source) {
			if (++this.rowsSeen > 20) {
				throw new Error('header');
			}
			this.source = detectSource(row);
			if (this.source) {
				const headers = row.map(normalizeHeader);
				const { columns, year } = SOURCES[this.source];
				for (const [metric, candidates] of Object.entries(columns) as [Metric, readonly HeaderMatch[]][]) {
					const index = columnOf(headers, candidates);
					if (index >= 0) {
						this.columns[metric] = index;
					}
				}
				const found = year && headers.map(header => year.exec(header)?.groups?.year).find(Boolean);
				this.headerYear = found ? Number(found) : undefined;
			}
			return undefined;
		}
		const text = (metric: Metric) => {
			const index = this.columns[metric];
			const value = index === undefined ? undefined : row[index]?.trim();
			return value ? value : undefined;
		};
		const number = (metric: Metric) => parseNumber(text(metric), this.decimalComma);
		// SCImago lists a journal's ISSNs in one cell, "15424863, 00279424"
		const issns = (text('issn') ?? '').split(/[,;]\s*/);
		const issn = normalizeIssn(issns[0]);
		const eissn = normalizeIssn(text('eissn') ?? issns[1]);
		const title = text('title') ?? null;
		if (!issn && !eissn && !title) {
			return undefined;
		}
		const label = (metric: Metric) => text(metric) ?? null;
		return {
			source: this.source,
			year: number('year') ?? this.headerYear ?? this.defaultYear ?? null,
			title,
			issn,
			eissn,
			category: label('category'),
			jif: number('jif'),
			jif_5year: number('jif_5year'),
			jif_quartile: label('jif_quartile'),
			jci: number('jci'),
			citescore: number('citescore'),
			citescore_quartile: label('citescore_quartile'),
			sjr: number('sjr'),
			sjr_quartile: label('sjr_quartile'),
			h_index: number('h_index'),
			snip: number('snip'),
			ipp: number('ipp'),
			imported: this.imported,
		};
	}
}

/** The year in a file name, as SCImago's "scimagojr 2024.csv" has it. */
export function yearOfFileName(name: string): number | undefined {
	const year = /(?:^|\D)(?<year>(?:19|20)\d{2})(?:\D|$)/.exec(name)?.groups?.year;
	return year ? Number(year) : undefined;
}

// --- CSV

/** The rows of a CSV file, its delimiter (comma, semicolon or tab) the one its first lines have most of. */
export function readCsv(text: string): { readonly rows: string[][]; readonly delimiter: string } {
	const sample = text.slice(0, 20000).split(/\r?\n/).slice(0, 20).join('\n');
	const delimiter = [',', ';', '\t'].map(d => ({ d, count: sample.split(d).length })).sort((a, b) => b.count - a.count)[0].d;
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let quoted = false;
	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		if (quoted) {
			if (char === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i++;
				} else {
					quoted = false;
				}
			} else {
				field += char;
			}
		} else if (char === '"' && !field) {
			quoted = true;
		} else if (char === delimiter) {
			row.push(field);
			field = '';
		} else if (char === '\n' || char === '\r') {
			if (char === '\r' && text[i + 1] === '\n') {
				i++;
			}
			row.push(field);
			rows.push(row);
			row = [];
			field = '';
		} else {
			field += char;
		}
	}
	if (field || row.length) {
		row.push(field);
		rows.push(row);
	}
	return { rows, delimiter };
}

// --- Excel (xlsx): a zip of XML files, read with the browser's DecompressionStream

interface IZipEntry {
	readonly name: string;
	readonly method: number;
	readonly offset: number;
	readonly size: number;
}

/** The files of the zip archive `bytes`, from its central directory. */
function zipEntries(bytes: Uint8Array): Map<string, IZipEntry> {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	let end = bytes.length - 22;
	while (end >= 0 && view.getUint32(end, true) !== 0x06054b50) {
		end--;
	}
	if (end < 0) {
		throw new Error('zip');
	}
	const count = view.getUint16(end + 10, true);
	let at = view.getUint32(end + 16, true);
	const decoder = new TextDecoder();
	const entries = new Map<string, IZipEntry>();
	for (let i = 0; i < count && view.getUint32(at, true) === 0x02014b50; i++) {
		const method = view.getUint16(at + 10, true);
		const size = view.getUint32(at + 20, true);
		const nameLength = view.getUint16(at + 28, true);
		const extraLength = view.getUint16(at + 30, true);
		const commentLength = view.getUint16(at + 32, true);
		const local = view.getUint32(at + 42, true);
		const name = decoder.decode(bytes.subarray(at + 46, at + 46 + nameLength));
		// The data follows the local header, whose name and extra field may differ in length from the central one's
		const offset = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
		entries.set(name, { name, method, offset, size });
		at += 46 + nameLength + extraLength + commentLength;
	}
	return entries;
}

/** The text of a zip entry, as it is unzipped. */
function entryStream(bytes: Uint8Array, entry: IZipEntry): ReadableStream<string> {
	const data = new Blob([bytes.slice(entry.offset, entry.offset + entry.size)]).stream();
	return (entry.method === 8 ? data.pipeThrough(new DecompressionStream('deflate-raw')) : data).pipeThrough(new TextDecoderStream());
}

/** Calls `onElement` with each `<tag>…</tag>` of `stream`, without ever holding all of its text. */
async function forEachElement(stream: ReadableStream<string>, tag: string, onElement: (element: string) => void | Promise<void>): Promise<void> {
	const reader = stream.getReader();
	const close = `</${tag}>`;
	let buffer = '';
	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}
		buffer += value;
		let start = 0;
		let stop: number;
		while ((stop = buffer.indexOf(close, start)) >= 0) {
			const open = buffer.lastIndexOf(`<${tag}`, stop);
			await onElement(buffer.slice(open, stop + close.length));
			start = stop + close.length;
		}
		buffer = buffer.slice(start);
	}
}

const ENTITIES: Record<string, string> = { lt: '<', gt: '>', amp: '&', quot: '"', apos: '\'' };

function decodeXml(text: string): string {
	return text.replace(/&(?:#x(?<hex>[0-9a-fA-F]+)|#(?<dec>\d+)|(?<name>lt|gt|amp|quot|apos));/g, (_match, hex: string | undefined, dec: string | undefined, name: string | undefined) =>
		hex ? String.fromCodePoint(parseInt(hex, 16)) : dec ? String.fromCodePoint(Number(dec)) : ENTITIES[name!]);
}

/** The text of the `<t>` runs of a shared or inline string. */
function runsText(xml: string): string {
	let text = '';
	for (const match of xml.matchAll(/<t(?:\s[^>]*)?>(?<text>[^<]*)<\/t>/g)) {
		text += match.groups!.text;
	}
	return decodeXml(text);
}

/** The column, from 0, of a cell reference like "AB12". */
function columnIndex(reference: string): number {
	let index = 0;
	for (const char of reference) {
		if (char < 'A' || char > 'Z') {
			break;
		}
		index = index * 26 + char.charCodeAt(0) - 64;
	}
	return index - 1;
}

/** Calls `onRow` with each row of the first sheet of the Excel file `bytes`, its cells as text. */
export async function readXlsx(bytes: Uint8Array, onRow: (row: string[]) => void | Promise<void>): Promise<void> {
	const entries = zipEntries(bytes);
	const text = async (name: string) => {
		const entry = entries.get(name);
		let all = '';
		if (entry) {
			const reader = entryStream(bytes, entry).getReader();
			for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
				all += chunk.value;
			}
		}
		return all;
	};
	// The first sheet, through the workbook's relationships
	const workbook = await text('xl/workbook.xml');
	const id = /<sheet\b[^>]*\br:id="(?<id>[^"]+)"/.exec(workbook)?.groups?.id;
	const relationships = await text('xl/_rels/workbook.xml.rels');
	const target = id && [...relationships.matchAll(/<Relationship\b[^>]*>/g)].map(match => match[0]).find(element => element.includes(`Id="${id}"`));
	const path = target && /Target="(?<path>[^"]+)"/.exec(target)?.groups?.path;
	const sheet = path ? (path.startsWith('/') ? path.slice(1) : `xl/${path}`) : 'xl/worksheets/sheet1.xml';
	const shared: string[] = [];
	const strings = entries.get('xl/sharedStrings.xml');
	if (strings) {
		await forEachElement(entryStream(bytes, strings), 'si', element => { shared.push(runsText(element)); });
	}
	const sheetEntry = entries.get(sheet);
	if (!sheetEntry) {
		throw new Error('sheet');
	}
	await forEachElement(entryStream(bytes, sheetEntry), 'row', async element => {
		const row: string[] = [];
		for (const cell of element.matchAll(/<c\b(?<attributes>[^>]*?)(?:\/>|>(?<inner>.*?)<\/c>)/gs)) {
			const { attributes, inner } = cell.groups!;
			const reference = /\br="(?<reference>[A-Z]+)\d*"/.exec(attributes)?.groups?.reference;
			const type = /\bt="(?<type>\w+)"/.exec(attributes)?.groups?.type;
			const value = inner ? /<v>(?<value>[^<]*)<\/v>/.exec(inner)?.groups?.value : undefined;
			const content = type === 's' ? shared[Number(value)] ?? '' : type === 'inlineStr' ? runsText(inner ?? '') : decodeXml(value ?? '');
			row[reference ? columnIndex(reference) : row.length] = content;
		}
		await onRow(Array.from(row, cell => cell ?? ''));
	});
}
