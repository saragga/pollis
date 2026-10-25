/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Pollis: reading references the user brings: BibTeX (and BibLaTeX), RIS, CSL-JSON and lists of DOIs, each work read as
// the user's references have it (IReference), without a key: the key is given when it is saved.

import { IReference, referenceOfBibTeX } from './referenceLibrary.js';

/** One entry of a BibTeX file. */
interface IBibEntry {
	readonly key: string;
	/** Its type, as written: article, book... */
	readonly type: string;
	/** Field values with braces and quotes removed, keyed by lower-case field name. */
	readonly fields: { readonly [name: string]: string };
	/** Where the entry sits in the file, so it can be removed without touching the others. */
	readonly start: number;
	readonly end: number;
}

/** Index of the delimiter closing the `{` or `(` at `open`, skipping nested braces; -1 if unbalanced. */
function matchingDelimiter(source: string, open: number): number {
	const close = source[open] === '(' ? ')' : '}';
	let depth = 0;
	for (let i = open + 1; i < source.length; i++) {
		const c = source[i];
		if (c === '{') {
			depth++;
		} else if (c === '}') {
			if (depth === 0) {
				return close === '}' ? i : -1;
			}
			depth--;
		} else if (c === close && depth === 0) {
			return i;
		}
	}
	return -1;
}

/** Parse the `name = value` fields of a BibTeX entry body; values may be `{...}`, `"..."`, bare words or `#` concatenations. */
function parseBibFields(body: string): { [name: string]: string } {
	const fields: { [name: string]: string } = {};
	let i = 0;
	while (i < body.length) {
		const name = /^[\s,]*(?<name>[\w:.-]+)\s*=\s*/.exec(body.slice(i));
		if (!name?.groups) {
			break;
		}
		i += name[0].length;
		let value = '';
		while (i < body.length) {
			if (body[i] === '{') {
				const end = matchingDelimiter(body, i);
				if (end < 0) {
					return fields;
				}
				value += body.slice(i + 1, end);
				i = end + 1;
			} else if (body[i] === '"') {
				let j = i + 1;
				for (let depth = 0; j < body.length && (body[j] !== '"' || depth > 0); j++) {
					depth += body[j] === '{' ? 1 : body[j] === '}' ? -1 : 0;
				}
				value += body.slice(i + 1, j);
				i = j + 1;
			} else {
				const word = /^[^,#\s]*/.exec(body.slice(i))?.[0] ?? '';
				value += word;
				i += word.length;
			}
			const concat = /^\s*#\s*/.exec(body.slice(i));
			if (!concat) {
				break;
			}
			i += concat[0].length;
		}
		// A brace that ends a control word, as in Stra{\ss}e, leaves a space so that the word stays apart from the letters after it
		fields[name.groups.name.toLowerCase()] = value.replace(/(?<command>\\[A-Za-z]+)\}/g, '$<command> ').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
	}
	return fields;
}

/** A bundled reference hidden by the user: a `@comment{pollis-hide: <title>}` block. */
interface IBibHidden {
	readonly title: string;
	readonly start: number;
	readonly end: number;
}

/** The contents of a references file. */
interface IBibFile {
	readonly entries: IBibEntry[];
	readonly hidden: IBibHidden[];
}

/** Parse a BibTeX file: its entries and its `pollis-hide` comments, skipping other `@comment`, `@string` and `@preamble` blocks. */
export function parseBibTeX(source: string): IBibFile {
	const entries: IBibEntry[] = [];
	const hidden: IBibHidden[] = [];
	const header = /@\s*(?<type>[A-Za-z]+)\s*[{(]/g;
	let match: RegExpExecArray | null;
	while ((match = header.exec(source)) !== null) {
		const open = header.lastIndex - 1;
		const end = matchingDelimiter(source, open);
		if (end < 0) {
			break;
		}
		header.lastIndex = end + 1;
		const type = match.groups?.type ?? '';
		const body = source.slice(open + 1, end);
		if (/^comment$/i.test(type)) {
			const hide = /^\s*pollis-hide:\s*(?<title>[\s\S]*?)\s*$/.exec(body);
			if (hide?.groups) {
				hidden.push({ title: normaliseBibText(hide.groups.title), start: match.index, end: end + 1 });
			}
			continue;
		}
		if (/^(string|preamble)$/i.test(type)) {
			continue;
		}
		const comma = body.indexOf(',');
		entries.push({
			key: (comma < 0 ? body : body.slice(0, comma)).trim(),
			type,
			fields: comma < 0 ? {} : parseBibFields(body.slice(comma + 1)),
			start: match.index,
			end: end + 1,
		});
	}
	return { entries, hidden };
}

/** Text as BibTeX field values are compared: without braces, whitespace collapsed. */
export function normaliseBibText(text: string): string {
	return text.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
}

/** The formats a text of references can be in. */
export type ReferenceFormat = 'bibtex' | 'ris' | 'csl' | 'dois';

/** The works read from a text of references. */
export interface IReferencesRead {
	readonly format: ReferenceFormat;
	readonly references: Omit<IReference, 'key'>[];
	/** Entries that could not be read as a work: without a title, or a DOI for a list of DOIs. */
	readonly unread: number;
}

/** The combining marks of LaTeX's accents: \"o, \'e, \c c... */
const ACCENTS: Record<string, string> = {
	'"': '̈', '\'': '́', '`': '̀', '^': '̂', '~': '̃', '=': '̄', '.': '̇',
	'c': '̧', 'v': '̌', 'u': '̆', 'H': '̋', 'k': '̨',
};
/** The letters LaTeX writes as commands. */
const LETTERS: Record<string, string> = { ss: 'ß', o: 'ø', O: 'Ø', aa: 'å', AA: 'Å', ae: 'æ', AE: 'Æ', oe: 'œ', OE: 'Œ', l: 'ł', L: 'Ł', i: 'i' };

/** A BibTeX value, its braces already gone, with LaTeX's accents and special letters as the characters they are. */
function latexText(text: string): string {
	return text
		.replace(/\\(?<accent>["'`^~=.])\s*(?<letter>[A-Za-z])/g, (_, accent: string, letter: string) => letter + ACCENTS[accent])
		.replace(/\\(?<accent>[cvuHk])\s+(?<letter>[A-Za-z])/g, (_, accent: string, letter: string) => letter + ACCENTS[accent])
		.replace(/\\(?<letter>ss|aa|AA|ae|AE|oe|OE|o|O|l|L|i)\b\s*/g, (_, letter: string) => LETTERS[letter])
		.normalize('NFC');
}

/** BibTeX's types of the BibLaTeX types it lacks. */
const BIBLATEX_TYPES: Record<string, string> = { report: 'techreport', thesis: 'phdthesis', mastersthesis: 'phdthesis', inbook: 'incollection', online: 'misc', electronic: 'misc', unpublished: 'misc', conference: 'inproceedings', proceedings: 'book' };

/** A work of `fields`, as BibTeX names them, of BibTeX `type`, with the `abstract` and `keywords` the BibTeX converter leaves out. */
function referenceOfFields(type: string, fields: { readonly [name: string]: string | undefined }, legacyKey: string | undefined): Omit<IReference, 'key'> | undefined {
	const given = Object.fromEntries(Object.entries(fields).filter((entry): entry is [string, string] => !!entry[1]?.trim()));
	if (!given.title) {
		return undefined;
	}
	const { key, ...reference } = referenceOfBibTeX('', BIBLATEX_TYPES[type.toLowerCase()] ?? type, given, legacyKey || undefined);
	const keywords = given.keywords?.split(/\s*[,;]\s*/).filter(keyword => keyword);
	return {
		...reference,
		authors_complete: reference.authors?.length ? reference.authors_complete : undefined,
		abstract: given.abstract,
		abstract_source: given.abstract ? 'import' : undefined,
		keywords: keywords?.length ? keywords : undefined,
		keywords_source: keywords?.length ? 'import' : undefined,
		source: 'import',
	};
}

/** The works of a BibTeX or BibLaTeX text. */
function readBibTeX(text: string): IReferencesRead {
	const { entries } = parseBibTeX(text);
	const references: Omit<IReference, 'key'>[] = [];
	for (const entry of entries) {
		const fields = Object.fromEntries(Object.entries(entry.fields).map(([name, value]) => [name, name === 'url' || name === 'doi' ? value : latexText(value)]));
		const reference = referenceOfFields(entry.type, {
			...fields,
			year: fields.year ?? fields.date,
			journal: fields.journal ?? fields.journaltitle,
			address: fields.address ?? fields.location,
			archiveprefix: fields.archiveprefix ?? fields.eprinttype,
		}, entry.key);
		if (reference) {
			references.push(reference);
		}
	}
	return { format: 'bibtex', references, unread: entries.length - references.length };
}

/** BibTeX's types of RIS's. */
const RIS_TYPES: Record<string, string> = { JOUR: 'article', EJOUR: 'article', MGZN: 'article', NEWS: 'article', BOOK: 'book', EBOOK: 'book', EDBOOK: 'book', CHAP: 'incollection', ECHAP: 'incollection', CONF: 'inproceedings', CPAPER: 'inproceedings', RPRT: 'techreport', THES: 'phdthesis' };

/** The works of a RIS text: its records, from `TY  -` to `ER  -`, lines without a tag continuing the one before. */
function readRis(text: string): IReferencesRead {
	const records: Map<string, string[]>[] = [];
	let record: Map<string, string[]> | undefined;
	let last: string[] | undefined;
	for (const line of text.split(/\r?\n/)) {
		const tagged = /^(?<tag>[A-Z][A-Z0-9])  -\s?(?<value>.*)$/.exec(line);
		if (!tagged?.groups) {
			if (last && line.trim()) {
				last[last.length - 1] += ' ' + line.trim();
			}
			continue;
		}
		const { tag, value } = tagged.groups;
		if (tag === 'TY') {
			record = new Map();
			records.push(record);
		}
		if (tag === 'ER') {
			record = undefined;
			last = undefined;
			continue;
		}
		if (record) {
			last = record.get(tag) ?? [];
			last.push(value.trim());
			record.set(tag, last);
		}
	}
	const references: Omit<IReference, 'key'>[] = [];
	for (const fields of records) {
		const first = (...tags: string[]) => tags.map(tag => fields.get(tag)?.find(value => value)).find(value => value);
		const all = (...tags: string[]) => tags.flatMap(tag => fields.get(tag) ?? []).filter(value => value);
		const type = RIS_TYPES[first('TY') ?? ''] ?? 'misc';
		const container = first('T2', 'JF', 'JO', 'JA', 'BT', 'T3');
		const start = first('SP');
		const end = first('EP');
		const isbn = type === 'book' || type === 'incollection';
		const reference = referenceOfFields(type, {
			title: first('TI', 'T1', 'CT') ?? (type === 'book' ? first('BT') : undefined),
			author: all('AU', 'A1').join(' and '),
			editor: all('ED', 'A2').join(' and ') || undefined,
			year: first('PY', 'Y1', 'DA')?.match(/\d{4}/)?.[0],
			journal: type === 'incollection' || type === 'inproceedings' ? undefined : container,
			booktitle: type === 'incollection' || type === 'inproceedings' ? container : undefined,
			volume: first('VL'),
			number: first('IS', 'M1'),
			pages: start && end && end !== start ? `${start}--${end}` : start,
			publisher: first('PB'),
			address: first('CY', 'PP'),
			institution: type === 'techreport' || type === 'phdthesis' ? first('PB') : undefined,
			isbn: isbn ? first('SN') : undefined,
			issn: isbn ? undefined : first('SN'),
			doi: first('DO')?.replace(/^https?:\/\/(dx\.)?doi\.org\//i, ''),
			url: first('UR'),
			abstract: first('AB', 'N2'),
			keywords: all('KW').join(', '),
		}, first('ID'));
		if (reference) {
			references.push(reference);
		}
	}
	return { format: 'ris', references, unread: records.length - references.length };
}

/** A person or organisation of CSL-JSON. */
interface ICslName {
	readonly family?: string;
	readonly given?: string;
	readonly literal?: string;
}

/** BibTeX's types of CSL's. */
const CSL_TYPES: Record<string, string> = {
	'article-journal': 'article', 'article': 'article', 'article-magazine': 'article', 'article-newspaper': 'article', 'review': 'article',
	'book': 'book', 'chapter': 'incollection', 'paper-conference': 'inproceedings', 'report': 'techreport', 'thesis': 'phdthesis',
};

/** The works of a CSL-JSON text: an array of items, or one item. */
function readCsl(text: string): IReferencesRead {
	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		return { format: 'csl', references: [], unread: 1 };
	}
	const items: Record<string, unknown>[] = (Array.isArray(parsed) ? parsed : [parsed]).filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
	const references: Omit<IReference, 'key'>[] = [];
	for (const item of items) {
		const value = (name: string) => typeof item[name] === 'string' || typeof item[name] === 'number' ? String(item[name]).trim() || undefined : undefined;
		const names = (name: string) => (Array.isArray(item[name]) ? item[name] as ICslName[] : [])
			.map(person => person.literal ? person.literal : [person.family, person.given].filter(part => part).join(', '))
			.filter(person => person).join(' and ') || undefined;
		const issued = item.issued as { readonly 'date-parts'?: readonly (readonly (number | string)[])[]; readonly raw?: string } | undefined;
		const year = issued?.['date-parts']?.[0]?.[0] ?? issued?.raw?.match(/\d{4}/)?.[0];
		const type = CSL_TYPES[value('type') ?? ''] ?? 'misc';
		const container = value('container-title');
		const keywords = Array.isArray(item.keyword) ? item.keyword.join(', ') : value('keyword');
		const reference = referenceOfFields(type, {
			title: value('title'),
			author: names('author'),
			editor: names('editor'),
			year: year !== undefined ? String(year) : undefined,
			journal: type === 'incollection' || type === 'inproceedings' ? undefined : container,
			booktitle: type === 'incollection' || type === 'inproceedings' ? container : undefined,
			volume: value('volume'),
			number: value('issue') ?? value('number'),
			pages: value('page')?.replace(/(?<!-)-(?!-)/, '--'),
			publisher: value('publisher'),
			address: value('publisher-place'),
			institution: type === 'techreport' || type === 'phdthesis' ? value('publisher') : undefined,
			isbn: value('ISBN'),
			issn: value('ISSN'),
			doi: value('DOI'),
			url: value('URL'),
			abstract: value('abstract'),
			keywords,
		}, value('id'));
		if (reference) {
			references.push(reference);
		}
	}
	return { format: 'csl', references, unread: items.length - references.length };
}

/** The DOIs of a text, once each, in lower case, as `10.1257/aer.91.5.1369`, with or without `https://doi.org/` before it. */
function readDois(text: string): IReferencesRead {
	const dois = new Set((text.match(/\b10\.\d{4,9}\/[^\s"'<>]+/g) ?? []).map(doi => doi.replace(/[.,;)\]]+$/, '').toLowerCase()));
	return { format: 'dois', references: [...dois].map(doi => ({ type: 'misc', title: doi, doi, source: 'import' })), unread: 0 };
}

/** The works of a text of references, its format told by its look: CSL-JSON, RIS, BibTeX, or else a list of DOIs. */
export function readReferences(text: string): IReferencesRead {
	const trimmed = text.trim();
	if (/^[[{]/.test(trimmed)) {
		return readCsl(trimmed);
	}
	if (/^TY  -/m.test(trimmed)) {
		return readRis(trimmed);
	}
	if (/@\s*[A-Za-z]+\s*[{(]/.test(trimmed)) {
		return readBibTeX(trimmed);
	}
	return readDois(trimmed);
}
