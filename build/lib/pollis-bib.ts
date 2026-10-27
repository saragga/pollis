/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The Pollis references. One JSON file, data/references.json of the PollisReferences.jl package, holds
// every work referenced in Pollis (`references`) and the citation counts observed for them (`counts`);
// Pollis is built with the file as it is at the commit in build/PollisReferences.commit. The panel
// TOMLs, the Compose notebooks and the methods refer to a work by its key only; everything else is
// built from the file: the panels' references, pollis.bib, the notebooks' and methods' citations, and
// references.json, the works and counts with the panels that cite them, which Pollis ships.

import * as fs from 'fs';
import * as path from 'path';
import { parseToml } from '../../src/vs/workbench/contrib/model/browser/common/tomlPanelData.ts';
import { pinnedPackageFile } from './pollis-packages.ts';

/** One work: a row of the `references` table. */
export interface IReference {
	readonly key: string;
	readonly type: string;
	readonly title: string;
	/** `Last, First`, in the order of the work; an organisation's name whole. */
	readonly authors: string[] | null;
	readonly author_kind: 'persons' | 'organisation' | 'unknown';
	/** False when some authors could not be found. */
	readonly authors_complete: boolean;
	readonly year: number;
	readonly released: string | null;
	readonly journal: string | null;
	readonly booktitle: string | null;
	readonly editors: string[] | null;
	readonly publisher: string | null;
	readonly address: string | null;
	readonly edition: string | null;
	readonly volume: string | null;
	readonly number: string | null;
	readonly pages: string | null;
	readonly institution: string | null;
	readonly report_number: string | null;
	readonly isbn: string | null;
	readonly issn: string | null;
	readonly doi: string | null;
	readonly arxiv: string | null;
	readonly openalex: string | null;
	readonly url: string | null;
	readonly oa_url: string | null;
	readonly abstract: string | null;
	readonly abstract_source: string | null;
	readonly keywords: string[] | null;
	readonly keywords_source: string | null;
	readonly legacy_key: string | null;
	readonly source: string | null;
	readonly retrieved: string | null;
	readonly checked: boolean;
	readonly open_access: boolean;
}

/** One citation count: a row of the `counts` table. */
interface ICount {
	readonly key: string;
	readonly count: number;
	readonly source: string;
	readonly date: string;
}

/** The references of PollisReferences.jl, read whole. */
export interface IReferencesDatabase {
	readonly references: ReadonlyMap<string, IReference>;
	readonly counts: readonly ICount[];
}

/** The generated library: pollis.bib, references.json and the problems found in the sources. */
export interface IPollisBib {
	readonly bibtex: string;
	readonly dump: string;
	readonly works: number;
	readonly occurrences: number;
	/** Keys in the sources that PollisReferences.jl does not have. */
	readonly unknownKeys: string[];
}

/** The folder of pollis.bib and references.json, from the repository's root. */
export const REFERENCES_FOLDER = 'src/vs/workbench/contrib/model/browser/media/references';

/** The fields of a work in their order, each null until the work's own JSON gives it: the file leaves out those not known. */
const REFERENCE_FIELDS: readonly (keyof IReference)[] = ['key', 'type', 'title', 'authors', 'author_kind', 'authors_complete', 'year', 'released', 'journal', 'booktitle', 'editors', 'publisher', 'address', 'edition', 'volume', 'number', 'pages', 'institution', 'report_number', 'isbn', 'issn', 'doi', 'arxiv', 'openalex', 'url', 'oa_url', 'abstract', 'abstract_source', 'keywords', 'keywords_source', 'legacy_key', 'source', 'retrieved', 'checked', 'open_access'];

export async function readReferencesDatabase(repoRoot: string): Promise<IReferencesDatabase> {
	const file = JSON.parse(await pinnedPackageFile(repoRoot, { name: 'PollisReferences', file: 'references.json', clone: 'POLLIS_REFERENCES' })) as { references: Partial<IReference>[]; counts: ICount[] };
	const empty = Object.fromEntries(REFERENCE_FIELDS.map(field => [field, null]));
	const references = file.references.map(reference => ({ ...empty, ...reference }) as IReference).sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
	const order = (a: ICount, b: ICount) => a.key < b.key ? -1 : a.key > b.key ? 1 : a.source < b.source ? -1 : a.source > b.source ? 1 : a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
	return { references: new Map(references.map(reference => [reference.key, reference])), counts: [...file.counts].sort(order) };
}

/** A panel and the keys of the works its References cite, in their order. */
interface IPanelReferences {
	readonly id: string;
	readonly title: string;
	/** What the panel covers, in one line: its models' labels. */
	readonly description?: string;
	/** The commands that open the panel, as the contribution files register them. */
	readonly commands?: readonly string[];
	readonly keys: readonly string[];
}

/** The contribution files that register the commands opening the panels. */
const PANEL_CONTRIBUTIONS = ['model/browser/model.contribution.ts', 'explore/browser/explore.contribution.ts', 'simulate/browser/simulate.contribution.ts', 'optimise/browser/optimise.contribution.ts'];

/**
 * The commands that open each panel, by panel id: a command registered to open the panel imported from its
 * `commands/<id>.command.ts` (or to call that file's own opening function), directly or through a function of the
 * same file that does. A command registered some other way is not found.
 */
export function panelCommands(repoRoot: string): Map<string, string[]> {
	const contribDir = path.join(repoRoot, 'src/vs/workbench/contrib');
	const commands = new Map<string, string[]>();
	for (const file of PANEL_CONTRIBUTIONS) {
		const source = fs.readFileSync(path.join(contribDir, file), 'utf-8');
		const constants = new Map([...source.matchAll(/const (?<name>\w+)\s*=\s*'(?<value>[^']+)'/g)].map(match => [match.groups!.name, match.groups!.value]));
		const imports = new Map([...source.matchAll(/import \{ (?<name>\w+) \} from '(?<from>[^']+\.command)\.js'/g)].map(match => [match.groups!.name, path.join(contribDir, path.dirname(file), `${match.groups!.from}.ts`)]));
		const opening = new Map([...source.matchAll(/^const (?<name>\w+) = \([^)]*\) => openScaffoldWebview\(accessor, (?<panel>\w+)/gm)].map(match => [match.groups!.name, match.groups!.panel]));
		for (const match of source.matchAll(/^CommandsRegistry\.registerCommand\((?:'(?<literal>[^']+)'|(?<constant>\w+)), (?:[^=\n]*=>\s*\{?\s*(?:openScaffoldWebview\(accessor, (?<panel>\w+)|(?<opener>\w+)\(\s*accessor)|(?<passed>\w+)\))/gm)) {
			const command = match.groups!.literal ?? constants.get(match.groups!.constant!);
			const opener = match.groups!.opener ?? match.groups!.passed!;
			const from = imports.get(match.groups!.panel ?? opening.get(opener) ?? opener);
			// A panel with its own opening function, not the scaffold's, has the id its file is named with
			const id = from && fs.existsSync(from) ? /^\tid: '(?<id>[^']+)'/m.exec(fs.readFileSync(from, 'utf-8'))?.groups?.id ?? path.basename(from, '.command.ts') : undefined;
			if (command && id) {
				commands.set(id, [...commands.get(id) ?? [], command]);
			}
		}
	}
	return commands;
}

/** The panels with references, by id: their titles, what they cover, the commands that open them and the keys they cite. */
function panelReferences(repoRoot: string): IPanelReferences[] {
	const webviewsDir = path.join(repoRoot, 'src/vs/workbench/contrib/model/browser/webviews');
	const commands = panelCommands(repoRoot);
	const panels: IPanelReferences[] = [];
	for (const file of fs.readdirSync(webviewsDir).filter(f => f.endsWith('.toml')).sort()) {
		const data = parseToml(fs.readFileSync(path.join(webviewsDir, file), 'utf-8')) as { meta?: { title?: unknown }; models?: Record<string, unknown>[]; references?: Record<string, unknown>[] };
		const keys = (data.references ?? []).flatMap(reference => typeof reference.key === 'string' ? [reference.key] : []);
		if (keys.length) {
			const id = file.replace(/\.toml$/, '');
			const labels = [...new Set((data.models ?? []).flatMap(model => typeof model.label === 'string' && model.label.trim() ? [model.label.trim()] : []))];
			panels.push({
				id,
				title: typeof data.meta?.title === 'string' ? data.meta.title : id,
				description: labels.length ? labels.join(' \u00b7 ') : undefined,
				commands: commands.get(id),
				keys: [...new Set(keys)],
			});
		}
	}
	return panels;
}

/** The references as text: each work and each count on its own lines, empty fields left out; then the panels that cite them. */
function referencesDump(database: IReferencesDatabase, panels: readonly IPanelReferences[]): string {
	const references = [...database.references.values()].map(reference => Object.fromEntries(Object.entries(reference).filter(([, value]) => value !== null)));
	return JSON.stringify({ references, counts: database.counts, panels }, null, '\t') + '\n';
}

/** The venue as one line shows it: the journal, the proceedings or book, the publisher or the institution. */
function venue(reference: IReference): string | undefined {
	return reference.journal ?? reference.booktitle ?? reference.publisher ?? reference.institution ?? undefined;
}

/** The authors as a panel lists them: `Last, First; Last, First`, with `et al.` when some were not found. */
function authorsLine(reference: IReference): string {
	const authors = (reference.authors ?? []).join('; ');
	return reference.authors_complete ? authors : `${authors} et al.`.trim();
}

/** A person's initials: `Rolland E.` → `R. E.`, `Jean-Pierre` → `J.-P.`. */
function initials(given: string): string {
	return given.split(/\s+/).filter(name => name).map(name => name.split('-').map(part => `${part.replace(/\.$/, '').charAt(0)}.`).join('-')).join(' ');
}

/**
 * The citation the methods and Compose notebooks show, e.g. `Fama, E. F. and French, K. R. (1993).
 * Common risk factors in the returns on stocks and bonds. Journal of Financial Economics 33(1), 3-56.`
 */
function citation(reference: IReference): string {
	const names = (reference.authors ?? []).map(name => {
		if (reference.author_kind !== 'persons' || !name.includes(',')) {
			return name;
		}
		const [last, given] = name.split(/,\s*(.*)/s);
		return given ? `${last}, ${initials(given)}` : last;
	});
	if (!reference.authors_complete) {
		names.push('others');
	}
	const authors = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] ?? '';
	const title = /[.?!]$/.test(reference.title) ? reference.title : `${reference.title}.`;
	const pages = reference.pages?.replace(/--/g, '-');
	let where: string | undefined;
	if (reference.type === 'article') {
		const issue = reference.volume ? `${reference.volume}${reference.number ? `(${reference.number})` : ''}` : undefined;
		where = [[reference.journal, issue].filter(part => part).join(' '), issue ? undefined : reference.number].filter(part => part).join(', ');
	} else if (reference.type === 'inproceedings' || reference.type === 'incollection') {
		where = reference.booktitle ? `In ${reference.booktitle}` : undefined;
	} else {
		where = venue(reference);
	}
	const rest = [where, pages].filter(part => part).join(', ');
	return `${authors ? `${authors} ` : ''}(${reference.year === 0 ? 'n.d.' : reference.year}). ${title}${rest ? ` ${rest}.` : ''}`;
}

/** Escape the characters BibTeX treats specially in a field value. */
function escapeValue(field: string, value: string): string {
	return field === 'url' || field === 'doi' ? value : value.replace(/(?<!\\)([&%#_])/g, '\\$1');
}

/** The BibTeX entry of a work, with `pollis-used-in` naming where Pollis references it, if given. */
function bibtexEntry(reference: IReference, usedIn?: readonly string[]): string {
	const names = (reference.authors ?? []).map(name => reference.author_kind === 'organisation' ? `{${name}}` : name);
	if (!reference.authors_complete) {
		names.push('others');
	}
	const fields: [string, string | null | undefined][] = [
		['author', names.join(' and ')],
		['editor', reference.editors?.join(' and ')],
		['title', reference.title],
		[reference.type === 'misc' ? 'howpublished' : 'journal', reference.journal],
		['booktitle', reference.booktitle],
		['edition', reference.edition],
		['publisher', reference.publisher],
		['address', reference.address],
		['institution', reference.institution],
		['number', reference.type === 'techreport' ? reference.report_number : reference.number],
		['volume', reference.volume],
		['pages', reference.pages],
		['year', reference.year === 0 ? undefined : String(reference.year)],
		['isbn', reference.isbn],
		['doi', reference.doi],
		['eprint', reference.arxiv],
		['url', reference.url],
	];
	if (reference.arxiv) {
		fields.push(['archiveprefix', 'arXiv']);
	}
	if (usedIn?.length) {
		fields.push(['pollis-used-in', usedIn.join(', ')]);
	}
	const lines = fields.filter(([, value]) => value).map(([name, value]) => `  ${name.padEnd(7)} = {${escapeValue(name, value!)}}`);
	return `@${reference.type}{${reference.key},\n${lines.join(',\n')}\n}`;
}

/** A panel reference's fields (IModelPaper) for a work. */
function paperFields(reference: IReference): Record<string, unknown> {
	return {
		key: reference.key,
		type: reference.type,
		title: reference.title,
		authors: authorsLine(reference),
		year: reference.year,
		journal: venue(reference),
		doi: reference.doi ?? undefined,
		url: reference.url ?? undefined,
		openAccess: reference.open_access,
	};
}

/**
 * Replace each `key = "..."` reference of a parsed panel TOML with the work's fields from
 * PollisReferences.jl. A key it does not have is an error.
 */
export function expandReferenceKeys(data: Record<string, unknown>, references: ReadonlyMap<string, IReference>, file: string): void {
	if (!Array.isArray(data.references)) {
		return;
	}
	data.references = data.references.map((entry: Record<string, unknown>) => {
		if (typeof entry.key !== 'string') {
			return entry;
		}
		const reference = references.get(entry.key);
		if (!reference) {
			throw new Error(`${file}: the reference key ${entry.key} is not in PollisReferences.jl`);
		}
		return paperFields(reference);
	});
}

/** Where each key is used: the panels, Compose notebooks and methods that reference it. */
function keyOccurrences(repoRoot: string): { key: string; usedIn: string }[] {
	const occurrences: { key: string; usedIn: string }[] = [];
	const webviewsDir = path.join(repoRoot, 'src/vs/workbench/contrib/model/browser/webviews');
	for (const file of fs.readdirSync(webviewsDir).filter(f => f.endsWith('.toml')).sort()) {
		const data = parseToml(fs.readFileSync(path.join(webviewsDir, file), 'utf-8')) as { references?: Record<string, unknown>[] };
		for (const reference of data.references ?? []) {
			if (typeof reference.key === 'string') {
				occurrences.push({ key: reference.key, usedIn: file.replace(/\.toml$/, '') });
			}
		}
	}
	for (const notebook of composeNotebooks(repoRoot)) {
		const key = JSON.parse(fs.readFileSync(notebook.file, 'utf-8')).metadata?.pollis?.workflow?.article?.key;
		if (typeof key === 'string') {
			occurrences.push({ key, usedIn: notebook.usedIn });
		}
	}
	for (const method of shippedMethods(repoRoot)) {
		const key = (parseToml(fs.readFileSync(method.file, 'utf-8')) as { key?: string }).key;
		if (typeof key === 'string') {
			occurrences.push({ key, usedIn: method.usedIn });
		}
	}
	return occurrences;
}

/** The Compose notebooks (workflows, benchmarks): media/<library>/<folder>/*.ipynb. */
function composeNotebooks(repoRoot: string): { file: string; usedIn: string }[] {
	const mediaDir = path.join(repoRoot, 'src/vs/workbench/contrib/compose/browser/media');
	const notebooks: { file: string; usedIn: string }[] = [];
	for (const library of fs.readdirSync(mediaDir).sort()) {
		const libraryDir = path.join(mediaDir, library);
		if (!fs.statSync(libraryDir).isDirectory()) {
			continue;
		}
		for (const folder of fs.readdirSync(libraryDir).sort()) {
			const folderDir = path.join(libraryDir, folder);
			if (!fs.statSync(folderDir).isDirectory()) {
				continue;
			}
			for (const notebook of fs.readdirSync(folderDir).filter(f => f.endsWith('.ipynb')).sort()) {
				notebooks.push({ file: path.join(folderDir, notebook), usedIn: `${library}/${folder}` });
			}
		}
	}
	return notebooks;
}

/** The methods shipped with Pollis: media/methods/<name>/method.toml. */
function shippedMethods(repoRoot: string): { file: string; usedIn: string }[] {
	const methodsDir = path.join(repoRoot, 'src/vs/workbench/contrib/compose/browser/media/methods');
	return fs.readdirSync(methodsDir).sort()
		.map(folder => ({ file: path.join(methodsDir, folder, 'method.toml'), usedIn: `methods/${folder}` }))
		.filter(method => fs.existsSync(method.file));
}

/** A TOML basic string. */
function tomlString(value: string): string {
	return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/**
 * Bring the copies of a work in the Compose notebooks (`metadata.pollis.workflow.article`: citation,
 * doi, url and bibtex) and the shipped methods (`citation` and `doi`) up to date with PollisReferences.jl,
 * so that Pollis reads them as before. Returns the files changed.
 */
export function refreshReferenceCopies(repoRoot: string, references: ReadonlyMap<string, IReference>): string[] {
	const changed: string[] = [];
	for (const notebook of composeNotebooks(repoRoot)) {
		const text = fs.readFileSync(notebook.file, 'utf-8');
		const json = JSON.parse(text);
		const article = json.metadata?.pollis?.workflow?.article;
		const reference = typeof article?.key === 'string' ? references.get(article.key) : undefined;
		if (!reference) {
			continue;
		}
		const copy: Record<string, string> = { key: reference.key, citation: citation(reference) };
		if (reference.doi) {
			copy.doi = reference.doi;
		}
		const url = reference.url ?? (reference.doi ? `https://doi.org/${reference.doi}` : undefined);
		if (url) {
			copy.url = url;
		}
		copy.bibtex = bibtexEntry(reference);
		json.metadata.pollis.workflow.article = copy;
		const indent = /^\{\n(?<indent>\s+)"/.exec(text)?.groups?.indent ?? ' ';
		const updated = JSON.stringify(json, null, indent) + (text.endsWith('\n') ? '\n' : '');
		if (updated !== text) {
			fs.writeFileSync(notebook.file, updated, 'utf-8');
			changed.push(notebook.file);
		}
	}
	for (const method of shippedMethods(repoRoot)) {
		const text = fs.readFileSync(method.file, 'utf-8');
		const key = (parseToml(text) as { key?: string }).key;
		const reference = key ? references.get(key) : undefined;
		if (!reference) {
			continue;
		}
		let updated = text.replace(/^citation = .*$/m, `citation = ${tomlString(citation(reference))}`);
		if (reference.doi) {
			updated = /^doi = /m.test(updated)
				? updated.replace(/^doi = .*$/m, `doi = ${tomlString(reference.doi)}`)
				: updated.replace(/^(citation = .*)$/m, `$1\ndoi = ${tomlString(reference.doi)}`);
		}
		if (updated !== text) {
			fs.writeFileSync(method.file, updated, 'utf-8');
			changed.push(method.file);
		}
	}
	return changed;
}

/**
 * Generate the Pollis BibTeX library, one entry for each work of PollisReferences.jl, with `pollis-used-in`
 * naming the panels, notebooks and methods that reference it, and references.json.
 */
export function generatePollisBib(repoRoot: string, database: IReferencesDatabase): IPollisBib {
	const occurrences = keyOccurrences(repoRoot);
	const usedIn = new Map<string, Set<string>>();
	for (const occurrence of occurrences) {
		usedIn.set(occurrence.key, (usedIn.get(occurrence.key) ?? new Set()).add(occurrence.usedIn));
	}
	const unknownKeys = [...usedIn.keys()].filter(key => !database.references.has(key)).sort();
	const entries = [...database.references.values()].map(reference => bibtexEntry(reference, [...usedIn.get(reference.key) ?? []].sort()));
	const header = [
		'% The Pollis library: every work referenced in Pollis, one entry each.',
		'% Generated by the compile-toml build task from PollisReferences.jl; do not edit. Correct a work in the',
		'% package, and this file follows. `pollis-used-in` names the panels, notebooks and methods that',
		'% reference the work; BibTeX tools ignore it.',
	].join('\n');
	return {
		bibtex: `${header}\n\n${entries.join('\n\n')}\n`,
		dump: referencesDump(database, panelReferences(repoRoot)),
		works: entries.length,
		occurrences: occurrences.length,
		unknownKeys,
	};
}
