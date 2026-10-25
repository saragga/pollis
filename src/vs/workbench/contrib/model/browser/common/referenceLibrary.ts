/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Pollis: the references of Pollis and of the user. Those of Pollis come with it (media/references/references.json, made
// from references.duckdb by compile-toml); the user's are lines of JSON in ~/.pollis/references/, appended to, the last
// line of a row winning: references.jsonl (the works the user saved or added, and corrections of Pollis' works, by key),
// counts.jsonl (citation counts, dated), versions.jsonl (the records of a work in an index: the article, a preprint...)
// and panels.jsonl (what the user added to or hid from the References of a panel). PollisDB.build_references makes the
// PollisReferences database of them: pollis_* tables, user_* views and all_references, which this module mirrors.

import { VSBuffer } from '../../../../../base/common/buffer.js';
import { FileAccess } from '../../../../../base/common/network.js';
import { joinPath } from '../../../../../base/common/resources.js';
import { URI } from '../../../../../base/common/uri.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IModelPaper } from './model.types.js';

/** A work: a row of pollis_references or user_references. Empty fields are left out. */
export interface IReference {
	readonly key: string;
	readonly type: string;
	readonly title: string;
	/** `Last, First`, in the order of the work; an organisation's name whole. */
	readonly authors?: readonly string[];
	readonly author_kind?: 'persons' | 'organisation' | 'unknown';
	/** False when some authors could not be found. */
	readonly authors_complete?: boolean;
	readonly year?: number;
	/** When it came out, for a work dated to the minute, as an FOMC statement. */
	readonly released?: string;
	readonly journal?: string;
	readonly booktitle?: string;
	readonly editors?: readonly string[];
	readonly publisher?: string;
	readonly address?: string;
	readonly edition?: string;
	readonly volume?: string;
	readonly number?: string;
	readonly pages?: string;
	readonly institution?: string;
	readonly report_number?: string;
	readonly isbn?: string;
	readonly issn?: string;
	readonly doi?: string;
	readonly arxiv?: string;
	readonly openalex?: string;
	readonly url?: string;
	readonly oa_url?: string;
	readonly abstract?: string;
	readonly abstract_source?: string;
	readonly keywords?: readonly string[];
	readonly keywords_source?: string;
	/** For a work the user added, its key before (a pasted BibTeX entry's own key). */
	readonly legacy_key?: string;
	/** Where its fields came from: crossref, datacite, openalex, semanticscholar, literature radar, manual. */
	readonly source?: string;
	readonly retrieved?: string;
	readonly checked?: boolean;
	readonly open_access?: boolean;
	/** The user's only: the work of Pollis this one is, when Pollis brought it after the user had added it. */
	readonly pollis_key?: string;
	/** The user's only: the work this one was merged into, whose key this one's now is another of; Undo Merge drops it. */
	readonly merged_into?: string;
	/** The user's only: when the row was written, in UTC. */
	readonly saved?: string;
	/** The user's only: the row is removed (a correction undone, a work deleted). */
	readonly removed?: boolean;
}

/** A citation count, dated when observed. */
export interface ICitationCount {
	readonly key: string;
	readonly count: number;
	/** openalex, semanticscholar or crossref. */
	readonly source: string;
	readonly date: string;
	/** The index's id of the version counted: W2008599190 at OpenAlex, a paperId at Semantic Scholar. */
	readonly record?: string;
	/** The user's only: the count is removed, with its version. */
	readonly removed?: boolean;
}

/** A version of a work: its record in an index, as the published article, a preprint or a working paper. */
export interface IReferenceVersion {
	readonly key: string;
	readonly record: string;
	/** openalex or semanticscholar. */
	readonly index: string;
	/** published, preprint, workingPaper or repository. */
	readonly kind: string;
	readonly doi?: string;
	readonly title?: string;
	readonly venue?: string;
	readonly year?: number;
	readonly url?: string;
	readonly added: string;
	readonly removed?: boolean;
}

/** What the user chose about a work in the References of a panel: added to it (shown) or hidden from it. */
export interface IPanelChoice {
	readonly panel: string;
	readonly key: string;
	readonly shown: boolean;
	readonly changed: string;
}

/** A panel of Pollis with references: its id, title and the keys of the works its References cite. */
export interface IPollisPanel {
	readonly id: string;
	readonly title: string;
	/** What the panel covers, in one line: its models' labels. */
	readonly description?: string;
	/** The commands that open the panel. */
	readonly commands?: readonly string[];
	readonly keys: readonly string[];
}

/** What comes with Pollis: its references, their citation counts and the panels that cite them. */
interface IPollisReferences {
	readonly references: readonly IReference[];
	readonly counts: readonly ICitationCount[];
	readonly panels: readonly IPollisPanel[];
}

/** A work in all_references, with where it comes from. */
export interface ILibraryReference extends IReference {
	/** pollis: as Pollis has it; corrected: Pollis' work as the user corrected it; user: the user's own. */
	readonly origin: 'pollis' | 'corrected' | 'user';
}

/** What is known of a work sought in the library: any of its ids, or its title and authors. */
export interface IWorkSought {
	readonly title: string;
	/** As the index writes them, `First Last` or `Last, First`. */
	readonly authors: readonly string[];
	readonly doi?: string;
	readonly arxiv?: string;
	/** Records of the work in the indexes: W2008599190, a Semantic Scholar paperId. */
	readonly records?: readonly string[];
}

/** The references of Pollis, as it ships them. */
const POLLIS_REFERENCES = 'vs/workbench/contrib/model/browser/media/references/references.json';

let pollisReferences: Promise<IPollisReferences> | undefined;

/** ~/.pollis/references, in the home folder `userHome`. */
export function referencesFolderOf(userHome: URI): URI {
	return joinPath(userHome, '.pollis', 'references');
}

/** The rows of a JSON Lines `text`, a line cut short skipped. */
function parseLines<T>(text: string): T[] {
	const rows: T[] = [];
	for (const line of text.split('\n')) {
		if (line.trim()) {
			try {
				rows.push(JSON.parse(line));
			} catch {
				// A line cut short: the next
			}
		}
	}
	return rows;
}

/** The last row of each identity, in the order first seen; those removed left out. */
function latest<T extends object>(rows: readonly T[], identity: (row: T) => string): Map<string, T> {
	const kept = new Map<string, T>();
	for (const row of rows) {
		kept.set(identity(row), row);
	}
	for (const [id, row] of kept) {
		if ((row as { readonly removed?: boolean }).removed) {
			kept.delete(id);
		}
	}
	return kept;
}

/** The words of `text`, in lower case and without accents. */
function words(text: string): string[] {
	return text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[{}]/g, '').match(/[\p{L}\p{N}]+/gu) ?? [];
}

/** A DOI as compared: lower case, without its address. */
function normaliseDoi(doi: string | undefined): string | undefined {
	return doi?.trim().replace(/^(https?:\/\/(dx\.)?doi\.org\/|doi:\s*)/i, '').toLowerCase() || undefined;
}

/**
 * The surname as written, from `Last, First`, `Last, Jr., First` or `First Last`; in `First van der Last` it starts at
 * the first lower-case particle.
 */
function personSurname(name: string): string {
	if (name.includes(',')) {
		return name.split(',')[0].trim();
	}
	const parts = name.split(/\s+/).filter(part => part);
	const particle = parts.findIndex((part, index) => index > 0 && part[0] === part[0].toLowerCase() && part[0] !== part[0].toUpperCase());
	return particle > 0 ? parts.slice(particle).join(' ') : parts.at(-1) ?? '';
}

/** `First Last`, as OpenAlex and Semantic Scholar write a name, as `Last, First`. */
export function nameAsReference(name: string): string {
	if (name.includes(',')) {
		return name.trim();
	}
	const surname = personSurname(name);
	const given = name.slice(0, name.length - surname.length).trim();
	return given ? `${surname}, ${given}` : surname;
}

/** Text in ASCII letters: ß as ss, ø as o, accents removed. */
function asciiLetters(text: string): string {
	const replaced = text.replace(/ß/g, 'ss').replace(/Ø/g, 'O').replace(/ø/g, 'o').replace(/Ł/g, 'L').replace(/ł/g, 'l').replace(/Æ/g, 'AE').replace(/æ/g, 'ae');
	return replaced.normalize('NFKD').replace(/[^\x00-\x7f]/g, '');
}

/** The last word of a surname, in ASCII letters: O'Neill as Oneill, El-Ghaoui as ElGhaoui. */
function surnameWord(surname: string): string {
	const word = asciiLetters(surname.replace(/[{}]/g, '').split(/\s+/).filter(part => part).at(-1) ?? '');
	const [first, ...rest] = word.split(/['’]/);
	return first.replace(/[^A-Za-z]/g, '') + rest.join('').replace(/[^A-Za-z]/g, '').toLowerCase();
}

/** Acronyms of the organisations Pollis cites, as its keys have them. */
const KNOWN_ACRONYMS: Record<string, string> = {
	'U.S. Securities and Exchange Commission': 'SEC', 'European Central Bank': 'ECB', 'International Monetary Fund': 'IMF', 'R Core Team': 'RCT',
	'Organisation for Economic Co-operation and Development': 'OECD', 'Bank for International Settlements': 'BIS', 'World Bank': 'WB',
};

/** An organisation's part of a key: its acronym, or the first three letters of a one-word name. */
function organisationAcronym(name: string): string {
	const plain = name.replace(/[{}]/g, '').replace(/\bcontributors\b/g, 'Contributors').replace(/,?\s+(Inc|Ltd|LLC|Corp|GmbH|plc)\.?$/, '');
	if (KNOWN_ACRONYMS[plain]) {
		return KNOWN_ACRONYMS[plain];
	}
	if (/^[A-Z][a-z]+$/.test(plain)) {
		return plain.slice(0, 3);
	}
	return plain.split(/[\s-]+/).filter(word => /^[A-Z]/.test(word)).map(word => word.replace(/[^A-Z]/g, '')).join('');
}

/**
 * The key a work's authors and year make, before its letter: a sole author's surname, three letters (`Ham1994`); the
 * initials of up to five authors' surnames, with `...` after them for more or for authors not all found (`FF1993`,
 * `BMRSK...2020`); an organisation's acronym (`IMF2020`); `U` for none.
 */
function keyPrefix(reference: Pick<IReference, 'authors' | 'author_kind' | 'authors_complete' | 'year'>): string {
	const authors = reference.authors ?? [];
	let part: string;
	if (reference.author_kind === 'organisation' && authors.length) {
		part = organisationAcronym(authors[0]);
	} else if (!authors.length) {
		part = 'U';
	} else {
		const surnames = authors.map(author => surnameWord(personSurname(author)));
		if (surnames.length === 1) {
			part = surnames[0].slice(0, 1).toUpperCase() + surnames[0].slice(1, 3).toLowerCase();
		} else {
			part = surnames.slice(0, 5).filter(word => word).map(word => word[0].toUpperCase()).join('');
			if (surnames.length > 5) {
				part += '...';
			}
		}
	}
	if (reference.authors_complete === false && !part.endsWith('...')) {
		part += '...';
	}
	const year = reference.year && /^\d{4}$/.test(String(reference.year)) ? String(reference.year) : '0000';
	return part + year;
}

/** The letter of the `index`th key of a prefix: a to z, then aa, ab... */
function keySuffix(index: number): string {
	const letters = 'abcdefghijklmnopqrstuvwxyz';
	return index < 26 ? letters[index] : letters[Math.floor(index / 26) - 1] + letters[index % 26];
}

/** The venue as one line shows it: the journal, the proceedings or book, the publisher or the institution. */
export function referenceVenue(reference: IReference): string | undefined {
	return reference.journal ?? reference.booktitle ?? reference.publisher ?? reference.institution;
}

/** A work as a panel lists it. */
export function referencePaper(reference: IReference): IModelPaper {
	const authors = (reference.authors ?? []).join('; ');
	return {
		key: reference.key,
		type: reference.type as IModelPaper['type'],
		title: reference.title,
		authors: reference.authors_complete === false ? `${authors} et al.`.trim() : authors,
		year: reference.year ?? 0,
		journal: referenceVenue(reference),
		doi: reference.doi,
		url: reference.url,
		openAccess: reference.open_access ?? !!reference.oa_url,
	};
}

/** Escape the characters BibTeX treats specially in a field value. */
function escapeValue(field: string, value: string): string {
	return field === 'url' || field === 'doi' ? value : value.replace(/(?<!\\)([&%#_])/g, '\\$1');
}

/** The BibTeX entry of a work, as pollis.bib has the works of Pollis. */
export function referenceBibTeX(reference: IReference): string {
	const names = (reference.authors ?? []).map(name => reference.author_kind === 'organisation' ? `{${name}}` : name);
	if (reference.authors_complete === false) {
		names.push('others');
	}
	const fields: [string, string | undefined][] = [
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
		['year', reference.year ? String(reference.year) : undefined],
		['isbn', reference.isbn],
		['doi', reference.doi],
		['eprint', reference.arxiv],
		['url', reference.url],
	];
	if (reference.arxiv) {
		fields.push(['archiveprefix', 'arXiv']);
	}
	const lines = fields.filter(([, value]) => value).map(([name, value]) => `  ${name.padEnd(7)} = {${escapeValue(name, value!)}}`);
	return `@${reference.type}{${reference.key},\n${lines.join(',\n')}\n}`;
}

/**
 * A work of a BibTeX entry, with the key `key`: its `type` (article, book...) and its fields, braces and quotes removed,
 * by lower-case name. `others` among the authors marks them as not all found; `{Name}` alone, an organisation.
 */
export function referenceOfBibTeX(key: string, type: string, fields: { readonly [name: string]: string }, legacyKey?: string): IReference {
	const field = (name: string) => fields[name]?.replace(/\\([&%#_])/g, '$1').trim() || undefined;
	const names = (field('author') ?? '').split(/\s+and\s+/i).map(name => name.trim()).filter(name => name);
	const complete = !names.some(name => /^others$/i.test(name));
	const authors = names.filter(name => !/^others$/i.test(name));
	const bibType = type.toLowerCase();
	const known = ['article', 'book', 'inproceedings', 'incollection', 'techreport', 'phdthesis', 'misc'].includes(bibType) ? bibType : 'misc';
	const year = Number(field('year')?.match(/\d{4}/)?.[0]) || undefined;
	return {
		key,
		type: known,
		title: field('title') ?? key,
		authors: authors.map(nameAsReference),
		author_kind: authors.length ? 'persons' : 'unknown',
		authors_complete: complete,
		year,
		journal: field('journal') ?? (known === 'misc' ? field('howpublished') : undefined),
		booktitle: field('booktitle'),
		editors: field('editor')?.split(/\s+and\s+/i).map(name => name.trim()),
		publisher: field('publisher'),
		address: field('address'),
		edition: field('edition'),
		volume: field('volume'),
		number: known === 'techreport' ? undefined : field('number'),
		report_number: known === 'techreport' ? field('number') : undefined,
		pages: field('pages'),
		institution: field('institution') ?? field('school'),
		isbn: field('isbn'),
		issn: field('issn'),
		doi: normaliseDoi(field('doi')),
		arxiv: /arxiv/i.test(field('archiveprefix') ?? '') ? field('eprint') : undefined,
		url: field('url'),
		legacy_key: legacyKey,
		source: 'manual',
	};
}

/**
 * The key of all_references that `key` is: the work it was merged into, or the work of Pollis it now is, followed through
 * every merge.
 */
function resolveKey(user: ReadonlyMap<string, IReference>, key: string): string {
	const seen = new Set<string>();
	let row = user.get(key);
	while (row && (row.merged_into ?? row.pollis_key) && !seen.has(key)) {
		seen.add(key);
		key = (row.merged_into ?? row.pollis_key)!;
		row = user.get(key);
	}
	return key;
}

/** A work's fields alone, without those the user's row has about the row. */
function workFields(reference: IReference): IReference {
	const { origin, pollis_key, merged_into, saved, removed, ...fields } = reference as ILibraryReference;
	return fields;
}

/** Without the fields that are undefined, so that a line of JSON has only what is known. */
function compact<T extends object>(row: T): T {
	return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined && value !== null)) as T;
}

/**
 * The references of Pollis and of the user. Reads the user's files whenever asked, so that it shows what another window
 * appended; writes only by appending a line.
 */
export class ReferenceLibrary {

	private readonly folder: URI;

	constructor(
		private readonly fileService: IFileService,
		userHome: URI,
	) {
		this.folder = referencesFolderOf(userHome);
	}

	/**
	 * The references of Pollis, their citation counts and the panels that cite them, read once: the works and counts of
	 * PollisReferences.jl, which PollisDB copies into package.json, when they have every key the panels cite, else
	 * those this Pollis came with.
	 */
	pollis(): Promise<IPollisReferences> {
		pollisReferences ??= (async () => {
			try {
				const shipped = JSON.parse((await this.fileService.readFile(FileAccess.asFileUri(POLLIS_REFERENCES))).value.toString());
				const panels: IPollisPanel[] = shipped.panels ?? [];
				let { references = [], counts = [] }: { references?: IReference[]; counts?: ICitationCount[] } = shipped;
				try {
					const latest = JSON.parse((await this.fileService.readFile(joinPath(this.folder, 'package.json'))).value.toString());
					const keys = new Set((latest.references ?? []).map((reference: IReference) => reference.key));
					if (keys.size && panels.every(panel => panel.keys.every(key => keys.has(key)))) {
						({ references, counts = [] } = latest);
					}
				} catch {
					// Not installed yet: the references this Pollis came with
				}
				return { references, counts, panels };
			} catch {
				pollisReferences = undefined;
				return { references: [], counts: [], panels: [] };
			}
		})();
		return pollisReferences;
	}

	private async readLines<T>(name: string): Promise<T[]> {
		try {
			return parseLines<T>((await this.fileService.readFile(joinPath(this.folder, name))).value.toString());
		} catch {
			// No file yet
			return [];
		}
	}

	private async append(name: string, rows: readonly object[]): Promise<void> {
		if (rows.length) {
			const text = rows.map(row => JSON.stringify(compact(row)) + '\n').join('');
			await this.fileService.writeFile(joinPath(this.folder, name), VSBuffer.fromString(text), { append: true });
		}
	}

	/** Every key ever given to a work of the user's, removed or not: a key is never given twice. */
	private async userKeys(): Promise<Set<string>> {
		return new Set((await this.readLines<IReference>('references.jsonl')).map(row => row.key));
	}

	/** The user's works and corrections (user_references), by key. */
	async userReferences(): Promise<Map<string, IReference>> {
		return latest(await this.readLines<IReference>('references.jsonl'), row => row.key);
	}

	/** Every work once (all_references): those of Pollis, as the user corrected them, and the user's that Pollis does not have. */
	async allReferences(): Promise<ILibraryReference[]> {
		const [{ references }, user] = await Promise.all([this.pollis(), this.reconcile()]);
		const pollisKeys = new Set(references.map(reference => reference.key));
		const all = references.map((reference): ILibraryReference => {
			const corrected = user.get(reference.key);
			return corrected ? { ...corrected, origin: 'corrected' } : { ...reference, origin: 'pollis' };
		}).filter(reference => !user.get(reference.key)?.merged_into);
		for (const reference of user.values()) {
			if (!pollisKeys.has(reference.key) && !reference.pollis_key && !reference.merged_into) {
				all.push({ ...reference, origin: 'user' });
			}
		}
		return all;
	}

	/**
	 * The user's works, with a `pollis_key` written for each that a work of Pollis now is, as when Pollis brings, in an update,
	 * a work the user had saved: the user's key keeps working, and all_references shows Pollis' work.
	 */
	private async reconcile(): Promise<Map<string, IReference>> {
		const [{ references }, user, versions] = await Promise.all([this.pollis(), this.userReferences(), this.readLines<IReferenceVersion>('versions.jsonl')]);
		const pollisKeys = new Set(references.map(reference => reference.key));
		const found: IReference[] = [];
		for (const reference of user.values()) {
			if (pollisKeys.has(reference.key) || reference.pollis_key || reference.merged_into) {
				continue;
			}
			const records = versions.filter(version => version.key === reference.key).map(version => version.record);
			const same = findReference(references, { title: reference.title, authors: reference.authors ?? [], doi: reference.doi, arxiv: reference.arxiv, records: [...records, ...reference.openalex ? [reference.openalex] : []] });
			if (same) {
				found.push({ ...reference, pollis_key: same.key, saved: new Date().toISOString() });
			}
		}
		if (found.length) {
			await this.append('references.jsonl', found);
			for (const reference of found) {
				user.set(reference.key, reference);
			}
		}
		return user;
	}

	/** The work of all_references that `work` is, if any: by a record of it, its DOI or arXiv id, or else its title and first author. */
	async find(work: IWorkSought): Promise<ILibraryReference | undefined> {
		const [all, versions] = await Promise.all([this.allReferences(), this.versions()]);
		const records = new Set(work.records ?? []);
		const byVersion = versions.find(version => records.has(version.record) || !!work.doi && normaliseDoi(version.doi) === normaliseDoi(work.doi));
		return (byVersion && all.find(reference => reference.key === byVersion.key)) ?? findReference(all, work);
	}

	/** A new key for a work of the user's: its prefix (as `keyPrefix` makes it) and the first letter no work, nor `alsoTaken`, has. */
	async newKey(reference: Pick<IReference, 'authors' | 'author_kind' | 'authors_complete' | 'year'>, alsoTaken: Iterable<string> = []): Promise<string> {
		const [{ references }, userKeys] = await Promise.all([this.pollis(), this.userKeys()]);
		const taken = new Set([...references.map(work => work.key), ...userKeys, ...alsoTaken]);
		const prefix = keyPrefix(reference);
		let index = 0;
		while (taken.has(prefix + keySuffix(index))) {
			index++;
		}
		return prefix + keySuffix(index);
	}

	/** Write `reference` as the user's: a new work, a correction of Pollis' work with its key, or a new version of either. */
	async saveReference(reference: IReference): Promise<void> {
		await this.append('references.jsonl', [{ ...reference, saved: new Date().toISOString() }]);
	}

	/** Remove the user's row with `key`: a correction undone, or a work of the user's deleted. */
	async removeReference(key: string): Promise<void> {
		const reference = (await this.userReferences()).get(key);
		if (reference) {
			await this.append('references.jsonl', [{ key, type: reference.type, title: reference.title, removed: true, saved: new Date().toISOString() }]);
		}
	}

	/** The citation counts of Pollis and of the user (all_counts), under the keys of all_references. */
	async counts(): Promise<ICitationCount[]> {
		const [{ counts }, user, userCounts] = await Promise.all([this.pollis(), this.userReferences(), this.readLines<ICitationCount>('counts.jsonl')]);
		const userLatest = latest(userCounts, count => `${count.key}\n${count.source}\n${count.date}\n${count.record}`);
		return [...counts.map(count => ({ ...count, key: resolveKey(user, count.key) })), ...[...userLatest.values()].map(count => ({ ...count, key: resolveKey(user, count.key) }))];
	}

	async addCounts(counts: readonly ICitationCount[]): Promise<void> {
		await this.append('counts.jsonl', counts);
	}

	/** The versions of the works (all_versions), under the keys of all_references. */
	async versions(): Promise<IReferenceVersion[]> {
		const [user, versions] = await Promise.all([this.userReferences(), this.readLines<IReferenceVersion>('versions.jsonl')]);
		return [...latest(versions, version => `${version.key}\n${version.record}`).values()].map(version => ({ ...version, key: resolveKey(user, version.key) }));
	}

	async addVersions(versions: readonly IReferenceVersion[]): Promise<void> {
		await this.append('versions.jsonl', versions);
	}

	/** What the user chose about the works in the References of `panel` (user_panels), by key, a merged work's under the key it was merged into. */
	async panelChoices(panel: string): Promise<Map<string, IPanelChoice>> {
		return new Map((await this.allPanelChoices()).filter(choice => choice.panel === panel).map(choice => [choice.key, choice]));
	}

	/**
	 * What the user chose about the works in the References of every panel (user_panels), a merged work's under the key it
	 * was merged into: of the choices of a work and of those merged into it, the latest.
	 */
	async allPanelChoices(): Promise<IPanelChoice[]> {
		const [user, choices] = await Promise.all([this.userReferences(), this.readLines<IPanelChoice>('panels.jsonl')]);
		const resolved = new Map<string, IPanelChoice>();
		for (const choice of latest(choices, choice => `${choice.panel}\n${choice.key}`).values()) {
			const key = resolveKey(user, choice.key);
			const id = `${choice.panel}\n${key}`;
			const other = resolved.get(id);
			if (!other || choice.changed >= other.changed) {
				resolved.set(id, { ...choice, key });
			}
		}
		return [...resolved.values()];
	}

	/** The keys merged into another work, each with the key of all_references it now is. */
	async aliases(): Promise<Map<string, string>> {
		const user = await this.userReferences();
		return new Map([...user.values()].filter(row => row.merged_into).map(row => [row.key, resolveKey(user, row.key)]));
	}

	/**
	 * Make one work of `a` and `b`, the works of all_references with those keys: it keeps the key of the two that sorts
	 * first, with the fields of `kept`, one of the two; the other key is merged into it, so that what cites it finds the
	 * work, and stays taken. The record of the work whose fields go becomes a version of the one kept.
	 */
	async merge(a: string, b: string, kept: string): Promise<void> {
		const all = await this.allReferences();
		const workA = all.find(work => work.key === a);
		const workB = all.find(work => work.key === b);
		if (!workA || !workB || a === b || (kept !== a && kept !== b)) {
			return;
		}
		const [survivor, alias] = a < b ? [workA, workB] : [workB, workA];
		const dropped = kept === survivor.key ? alias : survivor;
		const fields = kept === survivor.key ? survivor : alias;
		const saved = new Date().toISOString();
		const rows: IReference[] = [];
		if (fields !== survivor) {
			rows.push({ ...workFields(fields), key: survivor.key, saved });
		}
		rows.push({ ...workFields(alias), key: alias.key, merged_into: survivor.key, saved });
		const versions = await this.versions();
		if (dropped.openalex && !versions.some(version => version.record === dropped.openalex)) {
			await this.addVersions([{
				key: dropped.key, record: dropped.openalex, index: 'openalex', kind: dropped.arxiv && !dropped.doi ? 'preprint' : 'published',
				doi: dropped.doi, title: dropped.title, venue: referenceVenue(dropped), year: dropped.year, url: dropped.doi ? `https://doi.org/${dropped.doi}` : dropped.url, added: saved,
			}]);
		}
		await this.append('references.jsonl', rows);
	}

	/**
	 * Undo the merge of `alias` into another work: each of the two gets back the row it had before, or none, and the version
	 * the merge added goes; the key it took from the other stays with that work only if changed since.
	 */
	async unmerge(alias: string): Promise<void> {
		const rows = await this.readLines<IReference>('references.jsonl');
		const merge = rows.findLast(row => row.key === alias);
		if (!merge?.merged_into || !merge.saved) {
			return;
		}
		const saved = new Date().toISOString();
		const restored: IReference[] = [];
		const restore = (key: string) => {
			const own = rows.filter(row => row.key === key);
			const at = own.findLastIndex(row => row.saved === merge.saved);
			// The fields the work had before, unless changed since the merge
			if (at >= 0 && at === own.length - 1) {
				const before = own[at - 1];
				restored.push(before ? { ...before, saved } : { key, type: own[at].type, title: own[at].title, removed: true, saved });
			}
		};
		restore(alias);
		restore(merge.merged_into);
		const versions = await this.readLines<IReferenceVersion>('versions.jsonl');
		await this.append('versions.jsonl', [...latest(versions, version => `${version.key}\n${version.record}`).values()]
			.filter(version => version.added === merge.saved && (version.key === alias || version.key === merge.merged_into))
			.map(version => ({ ...version, removed: true })));
		await this.append('references.jsonl', restored);
	}

	/**
	 * Delete the user's work `key`, with its versions and citation counts, and take it off the panels it was added to.
	 * Only for a work of the user's: a correction of a work of Pollis is undone with `removeReference`.
	 */
	async removeWork(key: string): Promise<void> {
		const [versions, counts, choices] = await Promise.all([
			this.readLines<IReferenceVersion>('versions.jsonl'),
			this.readLines<ICitationCount>('counts.jsonl'),
			this.allPanelChoices(),
		]);
		const now = new Date().toISOString();
		await this.append('versions.jsonl', [...latest(versions, version => `${version.key}\n${version.record}`).values()].filter(version => version.key === key).map(version => ({ ...version, added: now, removed: true })));
		await this.append('counts.jsonl', [...latest(counts, count => `${count.key}\n${count.source}\n${count.date}\n${count.record}`).values()].filter(count => count.key === key).map(count => ({ ...count, removed: true })));
		await this.append('panels.jsonl', choices.filter(choice => choice.key === key && choice.shown).map(choice => ({ panel: choice.panel, key, shown: false, changed: now })));
		await this.removeReference(key);
	}

	/** Show the work `key` in the References of `panel`, or hide it there. */
	async choose(panel: string, key: string, shown: boolean): Promise<void> {
		await this.append('panels.jsonl', [{ panel, key, shown, changed: new Date().toISOString() }]);
	}
}

/** The work of `references` that `work` is: the same DOI, arXiv id or OpenAlex record, or else the same title and first author's surname. */
export function findReference<T extends IReference>(references: readonly T[], work: IWorkSought): T | undefined {
	const doi = normaliseDoi(work.doi);
	const records = new Set(work.records ?? []);
	const byId = references.find(reference => doi && normaliseDoi(reference.doi) === doi || work.arxiv && reference.arxiv === work.arxiv || reference.openalex && records.has(reference.openalex));
	if (byId) {
		return byId;
	}
	const title = words(work.title).join(' ');
	const surname = words(personSurname(work.authors[0] ?? '')).at(-1);
	return title ? references.find(reference => words(reference.title).join(' ') === title && (!surname || !reference.authors?.length || words(personSurname(reference.authors[0])).at(-1) === surname)) : undefined;
}
