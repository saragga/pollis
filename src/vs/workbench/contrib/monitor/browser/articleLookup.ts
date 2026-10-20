/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Pollis: the article an item of an email alert announces, found by its title: its DOI from the item's link, else from
// Crossref's bibliographic search, accepted only when the title Crossref has is the item's; then its journal, year and
// citations from OpenAlex, by DOI. Both are free and need no key. A line of ~/.pollis/journals/articles.jsonl, which
// the articles view of the PollisJournals database reads.

/** A line of articles.jsonl: what was found for an item; `doi` is null when nothing was. */
export interface IArticleRecord {
	readonly id: string;
	readonly title: string;
	readonly link: string;
	readonly doi: string | null;
	readonly openalex: string | null;
	/** The title of the article found, which may differ from the item's in case and punctuation. */
	readonly matched_title: string | null;
	readonly journal_id: string | null;
	readonly journal: string | null;
	readonly issn_l: string | null;
	readonly year: number | null;
	readonly type: string | null;
	readonly cited_by_count: number | null;
	readonly is_oa: boolean | null;
	readonly looked_up: string;
}

/** The text at `url`, or undefined when the request fails. */
export type FetchText = (url: string) => Promise<string | undefined>;

interface ICrossrefWork {
	readonly DOI?: string;
	readonly title?: readonly string[];
	readonly 'container-title'?: readonly string[];
	readonly ISSN?: readonly string[];
}

interface IOpenAlexWork {
	readonly id?: string;
	readonly title?: string | null;
	readonly publication_year?: number | null;
	readonly type?: string | null;
	readonly cited_by_count?: number | null;
	readonly open_access?: { readonly is_oa?: boolean | null };
	readonly primary_location?: { readonly source?: { readonly id?: string; readonly display_name?: string; readonly issn_l?: string | null } | null } | null;
}

const DOI = /(?<doi>10\.\d{4,9}\/[^\s?#&"<>]+)/;

/** The DOI in `link` (a publisher's address, or Google Scholar's, which holds it encoded), if any. */
function doiOf(link: string): string | undefined {
	let decoded = link;
	try {
		decoded = decodeURIComponent(link);
	} catch {
		// A link that is not encoded: as it is
	}
	const doi = DOI.exec(decoded)?.groups?.doi;
	return doi?.replace(/\/(?:full|abstract|pdf|epdf|epub)$/i, '').replace(/\.pdf$/i, '').replace(/[.,;)]+$/, '').toLowerCase();
}

/** The words of a title, lower case and without accents or punctuation. */
function words(title: string): string[] {
	return title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/<[^>]*>/g, ' ').split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

/**
 * Whether `found` is the title `wanted`: the same words, or `wanted` cut short (as Google Scholar cuts long
 * titles, with "…") at the start of `found`, or nearly the same words (a Jaccard index of 0.85 or more).
 */
export function sameTitle(wanted: string, found: string): boolean {
	const a = words(wanted.replace(/(?:…|\.\.\.)\s*$/, ''));
	const b = words(found);
	if (!a.length || !b.length) {
		return false;
	}
	if (a.join(' ') === b.join(' ')) {
		return true;
	}
	if (/(?:…|\.\.\.)\s*$/.test(wanted) && a.length >= 5 && b.join(' ').startsWith(a.slice(0, -1).join(' '))) {
		return true;
	}
	const setA = new Set(a);
	const setB = new Set(b);
	const shared = [...setA].filter(word => setB.has(word)).length;
	return shared / (setA.size + setB.size - shared) >= 0.85;
}

function parse<T>(text: string | undefined): T | undefined {
	try {
		return text ? JSON.parse(text) as T : undefined;
	} catch {
		return undefined;
	}
}

/** The work Crossref has with the title `title`, if its search finds it. */
async function findAtCrossref(title: string, fetchText: FetchText): Promise<ICrossrefWork | undefined> {
	const query = encodeURIComponent(title.replace(/(?:…|\.\.\.)\s*$/, ''));
	const answer = parse<{ message?: { items?: ICrossrefWork[] } }>(await fetchText(`https://api.crossref.org/works?query.bibliographic=${query}&rows=3&select=DOI,title,container-title,ISSN`));
	return answer?.message?.items?.find(work => work.DOI && work.title?.[0] && sameTitle(title, work.title[0]));
}

/** The work OpenAlex has with the DOI `doi`, if any: fetching one work is free. */
async function findAtOpenAlex(doi: string, fetchText: FetchText): Promise<IOpenAlexWork | undefined> {
	const work = parse<IOpenAlexWork>(await fetchText(`https://api.openalex.org/works/doi:${encodeURIComponent(doi)}?select=id,title,publication_year,type,cited_by_count,open_access,primary_location`));
	return work?.id ? work : undefined;
}

/** What Crossref and OpenAlex have for the item `id` with `title` and `link`. */
export async function lookUpArticle(id: string, title: string, link: string, fetchText: FetchText): Promise<IArticleRecord> {
	const linked = doiOf(link);
	let doi = linked;
	let work = linked ? await findAtOpenAlex(linked, fetchText) : undefined;
	let crossref: ICrossrefWork | undefined;
	if (!work) {
		// The DOI of the link, which OpenAlex does not know, is kept unless Crossref finds the title
		crossref = await findAtCrossref(title, fetchText);
		doi = crossref?.DOI?.toLowerCase() ?? linked;
		work = doi && doi !== linked ? await findAtOpenAlex(doi, fetchText) : undefined;
	}
	const source = work?.primary_location?.source;
	return {
		id,
		title,
		link,
		doi: doi ?? null,
		openalex: work?.id?.replace('https://openalex.org/', '') ?? null,
		matched_title: work?.title ?? crossref?.title?.[0] ?? null,
		journal_id: source?.id?.replace('https://openalex.org/', '') ?? null,
		journal: source?.display_name ?? crossref?.['container-title']?.[0] ?? null,
		issn_l: source?.issn_l ?? null,
		year: work?.publication_year ?? null,
		type: work?.type ?? null,
		cited_by_count: work?.cited_by_count ?? null,
		is_oa: work?.open_access?.is_oa ?? null,
		looked_up: new Date().toISOString(),
	};
}
