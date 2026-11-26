/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LcsDiff } from '../../../../base/common/diff/diff.js';
import { Event } from '../../../../base/common/event.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

// OCR Files and Snippets (../browser/ocrFilesPage.ts): scanned works read page by page beside their text, passages cut
// out and corrected as snippets, translated by a local model and read aloud (docs/workflows/workflow_ocr_files.tex).
// A work is a folder, ~/.pollis/works/<id>/, with its record, work.toml, its snippets, snippets/*.toml, and the copy of
// its source, source/: the scan's text, the words of each page with their boxes, and the page images. The page reads
// and writes the record and the snippets; a utility process (../node/ocrFiles.ts) downloads the sources, reads their
// words and checks them against the dictionaries.

/** The commands of the menu items of Explore > OCR Files and Snippets, each opening the page at its step or acting on the work open. */
export const OCR_FILES_COMMANDS = {
	openWork: 'pollis.ocrFiles.openWork',
	works: 'pollis.ocrFiles.works',
	read: 'pollis.ocrFiles.read',
	extract: 'pollis.ocrFiles.extract',
	translate: 'pollis.ocrFiles.translate',
	readAloud: 'pollis.ocrFiles.readAloud',
	snippets: 'pollis.ocrFiles.snippets',
	glossary: 'pollis.ocrFiles.glossary',
	addToWorkspace: 'pollis.ocrFiles.addToWorkspace',
} as const;

/** The steps of the page, in their order. */
export type OcrStep = 'open' | 'read' | 'parts' | 'extract' | 'translate' | 'aloud' | 'use';

/** The folder of the works, in the home folder; a work in the Pollis Workspace is in its works folder. */
export const OCR_WORKS_FOLDER = '.pollis/works';

/** Where the scan of a work is: one of an Internet Archive item, a Project Gutenberg ebook or a local PDF. */
export interface IOcrScan {
	/** The Internet Archive item's identifier: archive.org/details/<archive>. */
	readonly archive?: string;
	/** The Project Gutenberg ebook's number. */
	readonly gutenberg?: number;
	/** A local PDF: its SHA-256, the fingerprint by which it is found again, and the path it had. */
	readonly sha256?: string;
	readonly path?: string;
	/** Printed page plus `offset` is the scan's page, for a scan without the Internet Archive's page numbers. */
	readonly offset?: number;
}

/** An entry of a work's contents: its label, and its printed pages, `12-30`, or `12-` to the next entry. */
export interface IOcrContentsEntry {
	readonly label: string;
	readonly pages: string;
}

/** A name or a term, with its agreed translation into each language, by the language's code. */
export interface IOcrGlossaryTerm {
	readonly term: string;
	readonly translations: Readonly<Record<string, string>>;
}

/** The record of a work, work.toml. Every field but `id` and the scan is optional. */
export interface IOcrWork {
	readonly id: string;
	readonly title?: string;
	readonly author?: string;
	readonly editor?: string;
	readonly translator?: string;
	readonly year?: number;
	/** The languages of the text, as codes (`fr`, `nl`), the language of most of it first. */
	readonly languages: readonly string[];
	readonly entryType?: string;
	readonly referenceKey?: string;
	readonly summary?: string;
	readonly summarySource?: string;
	readonly scan: IOcrScan;
	readonly contents: readonly IOcrContentsEntry[];
	/** The work's own words that the dictionaries do not know, accepted once: names, old spellings. */
	readonly words: readonly string[];
	readonly glossary: readonly IOcrGlossaryTerm[];
}

/** A correction of a snippet: the scan's reading and the corrected word, on the scan's page. */
export interface IOcrCorrection {
	readonly read: string;
	readonly corrected: string;
	readonly page?: number;
}

/** A translation of a snippet, labelled with the model that made it and the day. */
export interface IOcrTranslation {
	readonly language: string;
	readonly model: string;
	/** The day, `2026-11-25`. */
	readonly made: string;
	readonly text: string;
}

/** A snippet: a passage of a work, its place, its corrected text, the corrections made and its translations. */
export interface IOcrSnippet {
	/** Its file name in the work's snippets folder, without `.toml`. */
	readonly name: string;
	readonly work: string;
	readonly label: string;
	readonly language: string;
	/** The scan's pages it comes from, `37-38`. */
	readonly pages?: string;
	/** Its paragraphs, separated by blank lines. */
	readonly text: string;
	readonly corrections: readonly IOcrCorrection[];
	readonly translations: readonly IOcrTranslation[];
	/** The other fields of a snippet written by hand, such as `letter = 499`, kept as they are. */
	readonly other?: Readonly<Record<string, string | number | boolean>>;
}

/** Why a word is flagged. */
export type OcrFlag =
	/** In none of the dictionaries of the work's languages. */
	| 'dictionary'
	/** In a dictionary, but the OCR itself was unsure of it. */
	| 'confidence'
	/** Another scan of the same edition reads it otherwise. */
	| 'secondScan'
	/** The language model finds that it does not fit its sentence. */
	| 'model';

/** A word of a page of the scan, with its box on the page image and the OCR's confidence. */
export interface IOcrWord {
	readonly text: string;
	/** Left, top, right, bottom, in the pixels of the scan's page. */
	readonly box: readonly [number, number, number, number];
	/** From 0 to 100; none when the source gives none (a PDF's text, a Gutenberg ebook). */
	readonly confidence?: number;
	/** The line and the paragraph of the page it is in, numbered from 0. */
	readonly line: number;
	readonly paragraph: number;
	readonly flag?: OcrFlag;
	/** The corrections the checks suggest, the likeliest first. */
	readonly suggestions?: readonly string[];
}

/** A page of a work, as the Read step shows it. */
export interface IOcrPage {
	/** The scan's page, numbered from 1. */
	readonly page: number;
	readonly pages: number;
	/** The page's printed number, when known. */
	readonly printed?: string;
	readonly width: number;
	readonly height: number;
	readonly words: readonly IOcrWord[];
	/** The page image on this computer; none for a source without images (a Gutenberg ebook), or one not fetched yet. */
	readonly image?: string;
}

/** What a source gives when a work is opened: what its record is filled with. */
export interface IOcrSourceInfo {
	readonly title?: string;
	readonly author?: string;
	readonly year?: number;
	readonly languages: readonly string[];
	readonly pages: number;
	readonly contents: readonly IOcrContentsEntry[];
	/** For an Internet Archive item, its volume and the edition's date, by which other copies are found. */
	readonly volume?: string;
	/** Whether the source has page images, which a Gutenberg ebook has not. */
	readonly images: boolean;
	/** The usual difference between a scan page and its printed number, for the pages whose number the source does not give. */
	readonly offset?: number;
	readonly summary?: string;
	readonly summarySource?: string;
}

/** The settings of the checks: the work's languages, its year (for its period's spellings) and its own words. */
export interface IOcrCheck {
	readonly languages: readonly string[];
	readonly year?: number;
	readonly words: readonly string[];
}

/** A word of an extract flagged for correction, where it is in the text and on the scan. */
export interface IOcrFlagged {
	/** Where it is in the extract's text, in characters. */
	readonly start: number;
	readonly end: number;
	readonly word: string;
	readonly page: number;
	readonly box?: readonly [number, number, number, number];
	readonly confidence?: number;
	readonly flag: OcrFlag;
	readonly suggestions: readonly string[];
}

/** The text of the chosen pages, paragraphs separated by blank lines, and the words flagged in it. */
export interface IOcrExtract {
	readonly text: string;
	readonly flagged: readonly IOcrFlagged[];
	/** The sizes of the page images, by page, for the pieces of the scan beside the flagged words. */
	readonly images: readonly { readonly page: number; readonly image?: string; readonly width: number; readonly height: number }[];
	/** Where the text of each page starts in `text`, in the order of the pages. */
	readonly pageStarts: readonly { readonly page: number; readonly start: number }[];
}

/** Another copy of a work at the Internet Archive, which a second scan is read from. */
export interface IOcrCopy {
	readonly identifier: string;
	readonly title: string;
	readonly date?: string;
	readonly volume?: string;
	readonly contributor?: string;
}

/** A word another copy reads otherwise, where it is in the extract's text. */
export interface IOcrDisagreement {
	readonly start: number;
	readonly end: number;
	readonly word: string;
	readonly other: string;
}

/** The scan's size and the free disk space, for the choice between fetching pages when shown and downloading them all. */
export interface IOcrScanSize {
	readonly pages: number;
	/** The pages already on this computer. */
	readonly fetched: number;
	/** The size of all the page images, estimated from those fetched or from one, in bytes. */
	readonly bytes: number;
	readonly free?: number;
}

/** How far a download has come. */
export interface IOcrProgress {
	readonly folder: string;
	readonly phase: 'text' | 'words' | 'images' | 'dictionary' | 'copy';
	readonly done: number;
	readonly total: number;
}

/** The work of a utility process (../node/ocrFiles.ts): `folder` is always a work's source folder, ~/.pollis/works/<id>/source. */
export interface IOcrFiles {
	readonly onDidProgress: Event<IOcrProgress>;
	/** Downloads an Internet Archive item's text, words, contents and page numbers, and reads its record. */
	openArchive(identifier: string, folder: string): Promise<IOcrSourceInfo>;
	/** Downloads a Project Gutenberg ebook's text, and reads its record and headings. */
	openGutenberg(ebook: number, folder: string): Promise<IOcrSourceInfo>;
	/**
	 * Reads the words of a local PDF from what Poppler wrote in `folder`, text.html (pdftotext -bbox-layout), and its
	 * outline, outline.xml (pdftohtml -xml), when there is one; `info` is pdfinfo's output.
	 */
	openPdf(folder: string, info: string): Promise<IOcrSourceInfo>;
	/** The SHA-256 of a file, in hexadecimal. */
	fingerprint(path: string): Promise<string>;
	/** The page `page` of the work with its words checked; its image fetched for an Internet Archive item when `fetchImage`. */
	page(folder: string, page: number, check: IOcrCheck, fetchImage: boolean): Promise<IOcrPage>;
	/** The text of `pages`, its paragraphs joined across lines and pages, and its words flagged. */
	extract(folder: string, pages: readonly number[], check: IOcrCheck): Promise<IOcrExtract>;
	/** Whether each word is in a dictionary of `check`, or one of the work's words: the words not, with suggestions. */
	checkText(text: string, check: IOcrCheck): Promise<readonly IOcrFlagged[]>;
	/** The other copies of an Internet Archive item's edition. */
	otherCopies(identifier: string): Promise<readonly IOcrCopy[]>;
	/** The words of `text`, from the pages `pages` of the work, that another copy, `identifier`, reads otherwise. */
	compare(folder: string, identifier: string, text: string, pages: readonly number[]): Promise<readonly IOcrDisagreement[]>;
	scanSize(folder: string): Promise<IOcrScanSize>;
	/** Downloads every page image not on this computer yet; `stopDownload` stops it. */
	downloadScan(folder: string): Promise<IOcrScanSize>;
	stopDownload(folder: string): Promise<void>;
	/** The printed page numbers of the scan, by scan page from 1: '' where none is known. */
	printedPages(folder: string): Promise<readonly string[]>;
	/** The pages of a Project Gutenberg ebook in its HTML version, at Project Gutenberg or its mirror; undefined when neither has one. */
	ebookPages(folder: string): Promise<IOcrEbookPages | undefined>;
}

/**
 * The pages of a Project Gutenberg ebook in its HTML version, which has no pages of its own: the address of a page, with
 * `{page}` where its number goes and `{text}` where words that begin it go, in a text fragment that takes the browser to
 * them; and those words, page by page from 1, written as they go in an address: two runs of words joined by `&text=`,
 * the browser going to the first it finds, one run, or '' for a page with none to find.
 */
export interface IOcrEbookPages {
	readonly url: string;
	readonly texts: readonly string[];
}

export const IOcrFilesService = createDecorator<IOcrFilesService>('ocrFilesService');

/** The utility process of OCR Files and Snippets, started when first asked. */
export interface IOcrFilesService extends IOcrFiles {
	readonly _serviceBrand: undefined;
}

// The record and the snippets in TOML, in the forms that Pollis's reader of TOML (tomlPanelData.ts) reads back as they
// were: one-line strings in double quotes without backslashes or double quotes, in single quotes with double quotes,
// and every other text in a block of three single quotes, which that reader and TOML itself take as it is.

/** A TOML string for `value`. */
function tomlString(value: string): string {
	if (!/[\n\r\\"]/.test(value)) {
		return `"${value}"`;
	}
	if (!/[\n\r']/.test(value)) {
		return `'${value}'`;
	}
	// A line that is only the closing quotes would end the block early
	const body = value.replace(/\r\n?/g, '\n').split('\n').map(line => line.trim() === `'''` ? `${line} ` : line).join('\n');
	return body.includes(`'''`) ? `"""\n${body.replace(/"""/g, '""\u201d')}\n"""` : `'''\n${body}\n'''`;
}

/** A bare key, or a quoted one. */
function tomlKey(key: string): string {
	return /^[A-Za-z0-9_-]+$/.test(key) ? key : tomlString(key);
}

function line(key: string, value: string | number | boolean | readonly string[] | undefined): string | undefined {
	if (value === undefined || value === '') {
		return undefined;
	}
	if (Array.isArray(value)) {
		return `${tomlKey(key)} = [${value.map(item => tomlString(item)).join(', ')}]`;
	}
	return `${tomlKey(key)} = ${typeof value === 'string' ? tomlString(value) : String(value)}`;
}

function lines(...items: (string | undefined)[]): string[] {
	return items.filter((item): item is string => item !== undefined);
}

/** The TOML of a work's record. */
export function workToml(work: IOcrWork): string {
	const out: string[] = lines(
		line('id', work.id),
		line('title', work.title),
		line('author', work.author),
		line('editor', work.editor),
		line('translator', work.translator),
		line('year', work.year),
		line('languages', work.languages),
		line('entryType', work.entryType),
		line('referenceKey', work.referenceKey),
		line('summary', work.summary),
		line('summarySource', work.summarySource),
	);
	out.push('', '[scan]', ...lines(
		line('archive', work.scan.archive),
		line('gutenberg', work.scan.gutenberg),
		line('sha256', work.scan.sha256),
		line('path', work.scan.path),
		line('offset', work.scan.offset),
	));
	for (const entry of work.contents) {
		out.push('', '[[contents]]', ...lines(line('label', entry.label), line('pages', entry.pages)));
	}
	for (const word of work.words) {
		out.push('', '[[words]]', ...lines(line('word', word)));
	}
	for (const term of work.glossary) {
		out.push('', '[[glossary]]', ...lines(line('term', term.term), ...Object.entries(term.translations).map(([language, text]) => line(language, text))));
	}
	return out.join('\n') + '\n';
}

/** The TOML of a snippet. */
export function snippetToml(snippet: IOcrSnippet): string {
	const out: string[] = lines(
		line('work', snippet.work),
		line('label', snippet.label),
		...Object.entries(snippet.other ?? {}).map(([key, value]) => line(key, value)),
		line('language', snippet.language),
		line('pages', snippet.pages),
		line('text', snippet.text),
	);
	for (const correction of snippet.corrections) {
		out.push('', '[[corrections]]', ...lines(line('read', correction.read), line('corrected', correction.corrected), line('page', correction.page)));
	}
	for (const translation of snippet.translations) {
		// The day bare, a date of TOML
		out.push('', '[[translations]]', ...lines(line('language', translation.language), line('model', translation.model)), `made = ${/^\d{4}-\d{2}-\d{2}$/.test(translation.made) ? translation.made : tomlString(translation.made)}`, ...lines(line('text', translation.text)));
	}
	return out.join('\n') + '\n';
}

/** A parsed TOML table, as Pollis's reader of TOML gives it. */
interface ITomlTable {
	readonly [key: string]: unknown;
}

function text(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim() ? value : typeof value === 'number' ? String(value) : undefined;
}

function tables(value: unknown): ITomlTable[] {
	return Array.isArray(value) ? value.filter((item): item is ITomlTable => !!item && typeof item === 'object' && !Array.isArray(item)) : [];
}

/** A work's record from its parsed TOML; `id` when the record has none, its folder's name. */
export function workFromToml(toml: ITomlTable, id: string): IOcrWork {
	const scan = (toml.scan && typeof toml.scan === 'object' ? toml.scan : {}) as ITomlTable;
	const year = typeof toml.year === 'number' ? toml.year : Number(text(toml.year));
	const gutenberg = typeof scan.gutenberg === 'number' ? scan.gutenberg : Number(text(scan.gutenberg));
	const offset = typeof scan.offset === 'number' ? scan.offset : undefined;
	return {
		id: text(toml.id) ?? id,
		title: text(toml.title),
		author: text(toml.author),
		editor: text(toml.editor),
		translator: text(toml.translator),
		year: Number.isInteger(year) ? year : undefined,
		languages: Array.isArray(toml.languages) ? toml.languages.filter((language): language is string => typeof language === 'string' && !!language.trim()) : [],
		entryType: text(toml.entryType),
		referenceKey: text(toml.referenceKey),
		summary: text(toml.summary),
		summarySource: text(toml.summarySource),
		scan: {
			archive: text(scan.archive),
			gutenberg: Number.isInteger(gutenberg) && gutenberg > 0 ? gutenberg : undefined,
			sha256: text(scan.sha256),
			path: text(scan.path),
			offset,
		},
		contents: tables(toml.contents).map(entry => ({ label: text(entry.label) ?? '', pages: text(entry.pages) ?? '' })).filter(entry => entry.label || entry.pages),
		words: tables(toml.words).map(entry => text(entry.word)).filter((word): word is string => !!word),
		glossary: tables(toml.glossary).map(entry => ({
			term: text(entry.term) ?? '',
			translations: Object.fromEntries(Object.entries(entry).filter(([key, value]) => key !== 'term' && typeof value === 'string')) as Record<string, string>,
		})).filter(term => term.term),
	};
}

/** The fields of a snippet that it has by its format; the others are kept as they are. */
const SNIPPET_FIELDS = new Set(['work', 'label', 'language', 'pages', 'text', 'corrections', 'translations']);

/** A snippet from its parsed TOML; `name` its file's name without `.toml`. */
export function snippetFromToml(toml: ITomlTable, name: string): IOcrSnippet {
	const other: Record<string, string | number | boolean> = {};
	for (const [key, value] of Object.entries(toml)) {
		if (!SNIPPET_FIELDS.has(key) && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
			other[key] = value;
		}
	}
	return {
		name,
		work: text(toml.work) ?? '',
		label: text(toml.label) ?? name,
		language: text(toml.language) ?? '',
		pages: text(toml.pages),
		text: typeof toml.text === 'string' ? toml.text : '',
		corrections: tables(toml.corrections).map(entry => ({
			read: text(entry.read) ?? '',
			corrected: text(entry.corrected) ?? '',
			page: typeof entry.page === 'number' ? entry.page : undefined,
		})).filter(correction => correction.read || correction.corrected),
		translations: tables(toml.translations).map(entry => ({
			language: text(entry.language) ?? '',
			model: text(entry.model) ?? '',
			made: text(entry.made) ?? '',
			text: typeof entry.text === 'string' ? entry.text : '',
		})).filter(translation => translation.text),
		other: Object.keys(other).length ? other : undefined,
	};
}

/**
 * The scan's pages of a range of printed pages, `12-30` or `12-` (to `next`, the first page of the next entry), by the
 * printed numbers of the scan's pages (`printed`, by scan page from 1) or else by the work's offset.
 */
export function scanPages(range: string, printed: readonly string[], offset: number, pages: number, next?: string): number[] {
	const match = /^\s*(?<from>[^-\s]+)\s*(?:-\s*(?<to>[^-\s]*))?\s*$/.exec(range);
	if (!match?.groups) {
		return [];
	}
	const toScan = (label: string): number | undefined => {
		const found = printed.indexOf(label);
		if (found >= 0) {
			return found + 1;
		}
		const number = Number(label);
		return Number.isInteger(number) ? number + offset : undefined;
	};
	const from = toScan(match.groups.from);
	const toLabel = match.groups.to;
	let to: number | undefined;
	if (toLabel === undefined) {
		to = from;
	} else if (toLabel) {
		to = toScan(toLabel);
	} else {
		const nextStart = next ? toScan(next) : undefined;
		to = nextStart !== undefined ? nextStart - 1 : pages;
	}
	if (from === undefined || to === undefined) {
		return [];
	}
	const result: number[] = [];
	for (let page = Math.max(1, from); page <= Math.min(pages, Math.max(from, to)); page++) {
		result.push(page);
	}
	return result;
}

/** The first printed page of a contents entry's range, by which the entry before it ends. */
export function firstPage(range: string): string | undefined {
	return /^\s*(?<from>[^-\s]+)/.exec(range)?.groups?.from;
}

/** A change of words between two texts: the words `read` at `start` in the first, `corrected` in the second. */
export interface IOcrWordChange {
	readonly start: number;
	readonly read: string;
	readonly corrected: string;
}

/** The words changed from `original` to `final`, compared word by word: the corrections of a snippet. */
export function wordChanges(original: string, final: string): IOcrWordChange[] {
	const words = (value: string) => [...value.matchAll(/\S+/g)].map(match => ({ word: match[0], start: match.index }));
	const before = words(original);
	const after = words(final);
	const diff = new LcsDiff({ getElements: () => before.map(item => item.word) }, { getElements: () => after.map(item => item.word) }).ComputeDiff(false);
	return diff.changes.map(change => ({
		start: before[change.originalStart]?.start ?? original.length,
		read: before.slice(change.originalStart, change.originalStart + change.originalLength).map(item => item.word).join(' '),
		corrected: after.slice(change.modifiedStart, change.modifiedStart + change.modifiedLength).map(item => item.word).join(' '),
	}));
}
