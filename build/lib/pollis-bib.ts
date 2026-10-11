/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';
import { parseToml } from '../../src/vs/workbench/contrib/model/browser/common/tomlPanelData.ts';

/** One place a work is referenced: its fields as written there. */
interface IOccurrence {
	/** Where it comes from, e.g. `panel dcm` or `notebook workflows/panel`. */
	readonly source: string;
	/** The panel id or the notebook folder, listed in the entry's `pollis-used-in` field. */
	readonly usedIn: string;
	readonly fields: Map<string, string>;
	/** Authors as a list of `Last, First`. */
	readonly authors: string[];
}

/** One work of the library, merged from all its occurrences. */
interface IWork {
	readonly occurrences: IOccurrence[];
}

/** The generated library: the BibTeX source and the conflicts found while merging. */
export interface IPollisBib {
	readonly bibtex: string;
	readonly works: number;
	readonly occurrences: number;
	readonly conflicts: string[];
}

/** Fields compared across occurrences of one work; a disagreement is reported as a conflict. */
const COMPARED_FIELDS = ['year', 'journal', 'author'];

/** Field order in the generated entries. */
const FIELD_ORDER = ['author', 'title', 'journal', 'volume', 'number', 'pages', 'year', 'doi', 'url'];

/** Text as fields are compared: lower case, without braces, accents, punctuation or repeated spaces. */
function normalise(text: string): string {
	return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[{}]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function normaliseDoi(doi: string): string {
	return doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').toLowerCase();
}

/**
 * Split a TOML `authors` string into `Last, First` names. Three styles occur: `Bezanson, Jeff; Edelman, Alan`,
 * `Lawson, C. L., & Hanson, R. J.` and `Guilherme Bodin and Raphael Saavedra`. An organisation, such as
 * `European Central Bank`, is braced so that BibTeX keeps it whole.
 */
function splitAuthors(authors: string): string[] {
	// `et al.` is BibTeX's `and others`
	const etAl = /,?\s+et al\.?$/.test(authors.trim());
	const names = splitNames(authors.trim().replace(/,?\s+et al\.?$/, ''));
	return etAl ? [...names, 'others'] : names;
}

function splitNames(text: string): string[] {
	if (text.includes(';') || / and /.test(text) || (!text.includes(',') && text.includes('&'))) {
		return text.split(/;| and | & /).map(name => name.trim()).filter(name => name);
	}
	if (!text.includes(',') && text.split(/\s+/).length > 2) {
		return [`{${text}}`];
	}
	const parts = text.replace(/,?\s*&\s*/g, ', ').split(/\s*,\s*/).filter(part => part);
	const isInitials = (part: string) => /^(\p{Lu}[\p{Ll}]?\.?[\s-]*)+$/u.test(part);
	if (parts.length >= 2 && parts.length % 2 === 0 && parts.every((part, index) => index % 2 === 0 || isInitials(part))) {
		const names: string[] = [];
		for (let i = 0; i < parts.length; i += 2) {
			names.push(`${parts[i]}, ${parts[i + 1]}`);
		}
		return names;
	}
	return [text];
}

/** Parse the fields of one BibTeX entry, e.g. a workflow notebook's `article.bibtex`. */
function parseBibtexEntry(source: string): Map<string, string> {
	const fields = new Map<string, string>();
	const body = source.slice(source.indexOf(',') + 1);
	const fieldPattern = /(?<name>[a-zA-Z-]+)\s*=\s*/g;
	let match: RegExpExecArray | null;
	while ((match = fieldPattern.exec(body))) {
		let index = fieldPattern.lastIndex;
		let value = '';
		if (body[index] === '{') {
			let depth = 0;
			const start = index;
			for (; index < body.length; index++) {
				if (body[index] === '{') { depth++; }
				if (body[index] === '}' && --depth === 0) { break; }
			}
			value = body.slice(start + 1, index);
		} else {
			const end = body.slice(index).search(/[,}\n]/);
			value = body.slice(index, end < 0 ? undefined : index + end).replace(/^"|"$/g, '');
		}
		fields.set(match.groups!.name.toLowerCase(), value.replace(/\s+/g, ' ').trim());
		fieldPattern.lastIndex = index + 1;
	}
	return fields;
}

/** The references of every panel TOML. */
function panelOccurrences(webviewsDir: string): IOccurrence[] {
	const occurrences: IOccurrence[] = [];
	for (const file of fs.readdirSync(webviewsDir).filter(f => f.endsWith('.toml')).sort()) {
		const panel = file.replace(/\.toml$/, '');
		const data = parseToml(fs.readFileSync(path.join(webviewsDir, file), 'utf-8')) as { references?: Record<string, unknown>[] };
		for (const reference of data.references ?? []) {
			if (reference.separator || typeof reference.title !== 'string') {
				continue;
			}
			const fields = new Map<string, string>([['title', reference.title], ['year', String(reference.year ?? '')]]);
			for (const name of ['journal', 'doi', 'url']) {
				if (typeof reference[name] === 'string' && reference[name]) {
					fields.set(name, reference[name] as string);
				}
			}
			const authors = splitAuthors(String(reference.authors ?? ''));
			fields.set('author', authors.join(' and '));
			occurrences.push({ source: `panel ${panel}`, usedIn: panel, fields, authors });
		}
	}
	return occurrences;
}

/** The articles of the Compose notebooks (workflows, benchmarks, methods), from their `pollis.workflow` metadata. */
function notebookOccurrences(composeMediaDir: string): IOccurrence[] {
	const occurrences: IOccurrence[] = [];
	for (const library of fs.readdirSync(composeMediaDir).sort()) {
		const libraryDir = path.join(composeMediaDir, library);
		if (!fs.statSync(libraryDir).isDirectory()) {
			continue;
		}
		for (const folder of fs.readdirSync(libraryDir).sort()) {
			const folderDir = path.join(libraryDir, folder);
			if (!fs.statSync(folderDir).isDirectory()) {
				continue;
			}
			for (const notebook of fs.readdirSync(folderDir).filter(f => f.endsWith('.ipynb'))) {
				const metadata = JSON.parse(fs.readFileSync(path.join(folderDir, notebook), 'utf-8')).metadata;
				const bibtex: string | undefined = metadata?.pollis?.workflow?.article?.bibtex;
				if (!bibtex) {
					continue;
				}
				const fields = parseBibtexEntry(bibtex);
				const authors = (fields.get('author') ?? '').split(/\s+and\s+/).map(name => name.trim()).filter(name => name);
				occurrences.push({ source: `notebook ${library}/${folder}`, usedIn: `${library}/${folder}`, fields, authors });
			}
		}
	}
	return occurrences;
}

/** The first author's last name, as names are compared. */
function firstLastName(occurrence: IOccurrence): string {
	const first = occurrence.authors[0] ?? '';
	const lastName = normalise(first.includes(',') ? first.split(',')[0] : first.split(/\s+/).pop() ?? first);
	// A name with an umlaut is also written with ae, oe or ue (Waechter, Schuetze)
	return lastName.replace(/([aou])e/g, '$1');
}

/**
 * Group occurrences into works: the same DOI or the same title, and the same first author. Two works
 * that share a DOI but not their first author are kept apart and reported: one of the DOIs is wrong.
 */
function mergeWorks(occurrences: IOccurrence[], conflicts: string[]): IWork[] {
	const works: IOccurrence[][] = [];
	const byDoi = new Map<string, IOccurrence[]>();
	const byTitle = new Map<string, IOccurrence[]>();
	for (const occurrence of occurrences) {
		const doi = occurrence.fields.get('doi');
		const title = normalise(occurrence.fields.get('title') ?? '');
		const sameAuthor = (candidate: IOccurrence[] | undefined) => candidate?.some(o => firstLastName(o) === firstLastName(occurrence)) ? candidate : undefined;
		const doiWork = doi ? byDoi.get(normaliseDoi(doi)) : undefined;
		if (doiWork && !sameAuthor(doiWork)) {
			conflicts.push(`doi ${doi}: "${occurrence.fields.get('title')}" (${occurrence.source}) and "${doiWork[0].fields.get('title')}" (${doiWork[0].source}) are different works`);
		}
		const work = sameAuthor(doiWork) ?? sameAuthor(byTitle.get(title));
		if (work) {
			work.push(occurrence);
		} else {
			works.push([occurrence]);
		}
		const target = work ?? works[works.length - 1];
		if (doi && !byDoi.has(normaliseDoi(doi))) {
			byDoi.set(normaliseDoi(doi), target);
		}
		if (!byTitle.has(title)) {
			byTitle.set(title, target);
		}
	}
	return works.map(group => ({ occurrences: group }));
}

/** The value most occurrences give a field (the fuller one on a tie), and the other values given. */
function chooseValue(work: IWork, field: string): { value: string | undefined; others: string[] } {
	const counts = new Map<string, { value: string; count: number }>();
	for (const occurrence of work.occurrences) {
		const value = occurrence.fields.get(field);
		if (!value) {
			continue;
		}
		const key = field === 'author' ? occurrence.authors.map(name => normalise(name.split(',')[0])).join('|') : normalise(value);
		const entry = counts.get(key);
		if (entry) {
			entry.count++;
		} else {
			counts.set(key, { value, count: 1 });
		}
	}
	const ranked = [...counts.values()].sort((a, b) => b.count - a.count || b.value.length - a.value.length);
	return { value: ranked[0]?.value, others: ranked.slice(1).map(entry => entry.value) };
}

/** A readable key: first author's last name and year, e.g. `breiman2001`. */
function baseKey(work: IWork): string {
	const first = work.occurrences.map(o => o.authors[0]).find(name => name) ?? 'anonymous';
	const lastName = first.includes(',') ? first.split(',')[0] : first.split(/\s+/).pop() ?? first;
	const year = chooseValue(work, 'year').value ?? '';
	return normalise(lastName).replace(/ /g, '') + year;
}

/** Escape the characters BibTeX treats specially in a field value. */
function escapeValue(field: string, value: string): string {
	return field === 'url' || field === 'doi' ? value : value.replace(/(?<!\\)([&%#_])/g, '\\$1');
}

/**
 * Generate the Pollis BibTeX library from every panel TOML and every Compose notebook's article. Each
 * work appears once, keyed by first author and year (`a`, `b` when needed), with `pollis-used-in` naming
 * the panels and notebooks that reference it. Values that disagree between occurrences are reported.
 */
export function generatePollisBib(repoRoot: string): IPollisBib {
	const contribDir = path.join(repoRoot, 'src/vs/workbench/contrib');
	const occurrences = [
		...panelOccurrences(path.join(contribDir, 'model/browser/webviews')),
		...notebookOccurrences(path.join(contribDir, 'compose/browser/media')),
	];
	const conflicts: string[] = [];
	const works = mergeWorks(occurrences, conflicts);

	const byKey = new Map<string, IWork[]>();
	for (const work of works) {
		const key = baseKey(work);
		byKey.set(key, [...(byKey.get(key) ?? []), work]);
	}

	const entries: { key: string; text: string }[] = [];
	for (const [key, group] of byKey) {
		group.sort((a, b) => normalise(chooseValue(a, 'title').value ?? '').localeCompare(normalise(chooseValue(b, 'title').value ?? '')));
		group.forEach((work, index) => {
			const workKey = group.length > 1 ? key + String.fromCharCode(97 + index) : key;
			const fields = new Map<string, string>();
			for (const field of FIELD_ORDER) {
				const { value, others } = chooseValue(work, field);
				if (value) {
					fields.set(field, value);
				}
				if (others.length && COMPARED_FIELDS.includes(field)) {
					const sources = (v: string) => work.occurrences.filter(o => o.fields.get(field) === v).map(o => o.source).join(', ');
					conflicts.push(`${workKey} ${field}: "${value}" (${sources(value!)}) vs ${others.map(v => `"${v}" (${sources(v)})`).join(' vs ')}`);
				}
			}
			// Among the occurrences that agree on the last names, the fullest author list (names rather than initials)
			const lastNames = (authors: string[]) => authors.map(name => normalise(name.split(',')[0])).join('|');
			const chosen = work.occurrences.find(o => o.fields.get('author') === fields.get('author'));
			const fullest = chosen && work.occurrences
				.filter(o => lastNames(o.authors) === lastNames(chosen.authors))
				.sort((a, b) => b.fields.get('author')!.length - a.fields.get('author')!.length)[0];
			if (fullest) {
				fields.set('author', fullest.fields.get('author')!);
			}
			const usedIn = [...new Set(work.occurrences.map(o => o.usedIn))].sort();
			const type = fields.has('journal') ? 'article' : 'misc';
			const lines = [...fields].map(([name, value]) => `  ${name.padEnd(7)} = {${escapeValue(name, value)}},`);
			lines.push(`  pollis-used-in = {${usedIn.join(', ')}}`);
			entries.push({ key: workKey, text: `@${type}{${workKey},\n${lines.join('\n')}\n}` });
		});
	}
	entries.sort((a, b) => a.key.localeCompare(b.key));

	const header = [
		'% The Pollis library: every work referenced in Pollis, cited or not, one entry each.',
		'% Generated by the compile-toml build task from the panel TOMLs and the Compose notebooks; do not edit.',
		'% Correct a reference where it is written, and this file follows. `pollis-used-in` names the panels',
		'% and notebooks that reference the work; BibTeX tools ignore it.',
	].join('\n');
	return {
		bibtex: `${header}\n\n${entries.map(entry => entry.text).join('\n\n')}\n`,
		works: entries.length,
		occurrences: occurrences.length,
		conflicts,
	};
}
