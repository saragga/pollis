/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { timeout } from '../../../../base/common/async.js';
import { hasKey } from '../../../../base/common/types.js';
import { stringHash } from '../../../../base/common/hash.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IRequestContext } from '../../../../base/parts/request/common/request.js';
import { localize, localize2 } from '../../../../nls.js';
import { IAction, toAction } from '../../../../base/common/actions.js';
import { getFlatActionBarActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { Action2, IMenuService, MenuId, MenuItemAction, registerAction2, SubmenuItemAction } from '../../../../platform/actions/common/actions.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { asJson, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { API_PROVIDERS, ProviderRequests } from '../../model/browser/common/apiProviders.js';
import { readReferences, ReferenceFormat } from '../../model/browser/common/referenceImport.js';
import { findReference, ICitationCount, IReference, IReferenceVersion, nameAsReference, ReferenceLibrary, referenceBibTeX } from '../../model/browser/common/referenceLibrary.js';
import { spinnerCss, spinnerSvg, voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';
import { FEWEST_ROWS, rowsChoiceCss, rowsChoiceScript, sortHeadingsCss, sortHeadingsScript, sortHint, stickyHeadCss, storedRows, storeRows } from '../../model/browser/webviews/webviewPager.js';
import { describeJournal, IJournalScoresService } from '../../monitor/browser/journalScores.js';
import { OPEN_LINK_COMMAND_ID } from '../../monitor/browser/openLink.js';
import { ISnowballArticle, SNOWBALL_SEARCH_COMMAND_ID } from '../common/snowballSearch.js';
import { IToolboxPanelsService } from '../common/toolboxPanels.js';
import { BROWSE_REFERENCES_COMMAND_ID } from './browseReferencesPage.js';

// Compose > Literature Radar > Discover Literature: the articles that stand out on a topic, searched by topic, field, years, citations,
// influence and journal ranking in two free, open indexes of scholarly works, OpenAlex and Semantic Scholar, or in
// either. Each lists its 200 most cited; the two lists are merged by DOI. The versions of one work an index keeps apart, as a
// preprint and its article, are each a row of their own, grouped under the most cited, their counts never added up. OpenAlex has each article's citation percentile
// against its field and year and its journal's 2-year mean citedness; Semantic Scholar has its influential citations,
// those that build on the article. The Norwegian level and the SJR quartile the user imported come from PollisJournals.
// The articles the user picks are kept, and saved to the user's References (~/.pollis/references) with their versions
// and citation counts, for a replication among other uses.
// Compose > Literature Radar > Import References: the same page for references the user brings, as BibTeX (or BibLaTeX),
// RIS, CSL-JSON or a list of DOIs, looked up in the two indexes, by DOI or else by title, or kept as the file has them;
// the same actions work on them, and ticks for many at once.

export const LITERATURE_RADAR_COMMAND_ID = 'pollis.compose.literatureRadar';
export const IMPORT_REFERENCES_COMMAND_ID = 'pollis.compose.importReferences';

/** What the page is for: searching the indexes (Discover Literature) or the references the user brings (Import References). */
type PageMode = 'discover' | 'import';

/**
 * OpenAlex's fields, the second of the four levels of its topics, by id, with their own English names, and the broader
 * fields of study of Semantic Scholar that hold them.
 */
const FIELDS: readonly (readonly [number, string, string])[] = [
	[11, 'Agricultural and Biological Sciences', 'Agricultural and Food Sciences,Biology'],
	[12, 'Arts and Humanities', 'Art,History,Philosophy,Linguistics'],
	[13, 'Biochemistry, Genetics and Molecular Biology', 'Biology,Chemistry'],
	[14, 'Business, Management and Accounting', 'Business'],
	[15, 'Chemical Engineering', 'Chemistry,Engineering'],
	[16, 'Chemistry', 'Chemistry'],
	[17, 'Computer Science', 'Computer Science'],
	[18, 'Decision Sciences', 'Business,Economics,Mathematics'],
	[35, 'Dentistry', 'Medicine'],
	[19, 'Earth and Planetary Sciences', 'Geology,Geography'],
	[20, 'Economics, Econometrics and Finance', 'Economics,Business'],
	[21, 'Energy', 'Engineering,Environmental Science'],
	[22, 'Engineering', 'Engineering'],
	[23, 'Environmental Science', 'Environmental Science'],
	[36, 'Health Professions', 'Medicine'],
	[24, 'Immunology and Microbiology', 'Biology,Medicine'],
	[25, 'Materials Science', 'Materials Science'],
	[26, 'Mathematics', 'Mathematics'],
	[27, 'Medicine', 'Medicine'],
	[28, 'Neuroscience', 'Biology,Medicine,Psychology'],
	[29, 'Nursing', 'Medicine'],
	[30, 'Pharmacology, Toxicology and Pharmaceutics', 'Medicine,Chemistry'],
	[31, 'Physics and Astronomy', 'Physics'],
	[32, 'Psychology', 'Psychology'],
	[33, 'Social Sciences', 'Sociology,Political Science,Education,Law,Geography'],
	[34, 'Veterinary', 'Agricultural and Food Sciences,Biology,Medicine'],
];

type Sources = 'both' | 'openAlex' | 'semanticScholar';
type SearchIn = 'titleAndAbstract' | 'title';
/** The indexes that give a key of one's own. */
type KeyIndex = 'openAlex' | 'semanticScholar';
type Influence = 'any' | 'top10' | 'top1';
type JournalQuality = 'any' | 'cited' | 'level2' | 'level1' | 'sjrQ1' | 'sjrQ2';
/** What a record of a work is: the publisher's, a preprint, a working paper, or a copy in a repository. */
type VersionKind = 'published' | 'preprint' | 'workingPaper' | 'repository';

/** A version of a work whose citing works are searched, by its records: those it has. */
interface ICitedWork {
	readonly openAlexId?: string;
	readonly semanticScholarId?: string;
	readonly doi?: string;
}

interface IDiscoverQuery {
	readonly sources: Sources;
	/** For a branch of the search tree: only the works that cite this one, any of its versions. */
	readonly cites?: readonly ICitedWork[];
	readonly topic: string;
	readonly searchIn: SearchIn;
	/** The years, up to ten, of the recent citations counted. */
	readonly recentYears: number;
	readonly field: number;
	readonly from: number;
	readonly to: number;
	readonly citations: number;
	readonly influence: Influence;
	readonly quality: JournalQuality;
	/** The least 2-year mean citedness of the journal, for `cited`. */
	readonly cited: number;
	readonly openOnly: boolean;
}

/** How an imported work was looked up in OpenAlex: found by its DOI or by its title, not found, or not looked up. */
type ImportMatch = 'doi' | 'title' | 'none' | 'unchecked';

/** A work the user imported: its reference as the file has it, and how it was looked up. */
interface IImportedWork {
	readonly reference: Omit<IReference, 'key'>;
	readonly match: ImportMatch;
}

/** An article found, as the page lists it and keeps it when picked. */
interface IDiscoveredArticle {
	/** Its DOI, or else the id of the index that found it: openalex:W2008599190, s2:66929d84... */
	readonly id: string;
	readonly doi?: string;
	/** Its page: at doi.org, or else in the index that found it. */
	readonly link: string;
	readonly title: string;
	readonly year: number;
	readonly authors: readonly string[];
	readonly journal?: string;
	/** The journal's tag and tooltip: its level, citedness and quartile. */
	readonly journalTag?: string;
	readonly journalDetails?: string;
	/** Times cited, as each index counts them. */
	readonly citedOpenAlex?: number;
	readonly citedSemanticScholar?: number;
	readonly influential?: number;
	readonly fwci?: number;
	/** Its citation percentile against its field and year, from 0 to 100. */
	readonly percentile?: number;
	/** Times cited in the last `recentYears` years, as OpenAlex counts them. */
	readonly recent?: number;
	readonly openUrl?: string;
	readonly version: VersionKind;
	/** The work, shared by its versions listed, when more than one is: its title and first author, in lower case. */
	readonly work?: string;
	/** Its record in OpenAlex: W2008599190. */
	readonly openAlexId?: string;
	/** Its record in Semantic Scholar, so that a record is a row once. */
	readonly semanticScholarId?: string;
	/** For a work imported, rather than found: its id is then its DOI, or else `import:` and a hash of its title, year and first author. */
	readonly imported?: IImportedWork;
}

/** An article as an index found it, before the two lists are merged. */
interface IFoundArticle extends Omit<IDiscoveredArticle, 'journalTag' | 'journalDetails'> {
	/** The ISSNs of its journal, to look up its level and quartile. */
	readonly issns: readonly string[];
}

/** What an index found: its most cited articles and how many it has; or why it found nothing. */
type IndexAnswer = {
	readonly articles: readonly IFoundArticle[];
	readonly found: number;
	/** For a search in titles Semantic Scholar cannot make: the papers found in title or abstract, when more than the titles checked. */
	readonly checkedOf?: number;
	/** For the works citing one: Semantic Scholar's citing works checked, when it has more. */
	readonly citingChecked?: number;
} | {
	readonly problem: string;
	/** It could not be reached, or asked to wait: worth asking again. */
	readonly busy?: boolean;
};

type DiscoverMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'rows'; readonly rows: number }
	| { readonly command: 'checkSaved' }
	| { readonly command: 'search'; readonly query: IDiscoverQuery }
	| { readonly command: 'reconcile'; readonly indexes: readonly KeyIndex[] }
	| { readonly command: 'setKey'; readonly index: KeyIndex }
	| { readonly command: 'getKey'; readonly index: KeyIndex }
	| { readonly command: 'openUrl'; readonly url: string }
	| { readonly command: 'abstract'; readonly id: string }
	| { readonly command: 'pick'; readonly article: IDiscoveredArticle }
	| { readonly command: 'unpick'; readonly ids: readonly string[] }
	| { readonly command: 'save'; readonly ids: readonly string[] }
	| { readonly command: 'browse'; readonly ids: readonly string[] }
	| { readonly command: 'copyBibtex'; readonly ids: readonly string[] }
	| { readonly command: 'snowball'; readonly ids: readonly string[] }
	| { readonly command: 'panels'; readonly ids: readonly string[] }
	| { readonly command: 'openPanel'; readonly id: string }
	| { readonly command: 'showInPanels'; readonly ids: readonly string[]; readonly panels: readonly string[] }
	| { readonly command: 'openPdfs'; readonly ids: readonly string[] }
	| { readonly command: 'import'; readonly text: string; readonly lookUp: boolean }
	| { readonly command: 'chooseFile'; readonly lookUp: boolean }
	| { readonly command: 'lookUp'; readonly ids: readonly string[] };

/** A work as OpenAlex lists it, the fields asked for only. */
export interface IOpenAlexWork {
	readonly id: string;
	readonly doi?: string | null;
	readonly title?: string | null;
	readonly publication_year?: number | null;
	readonly type?: string | null;
	readonly abstract_inverted_index?: Record<string, readonly number[]> | null;
	readonly cited_by_count?: number;
	readonly fwci?: number | null;
	readonly citation_normalized_percentile?: { readonly value?: number | null } | null;
	readonly counts_by_year?: readonly { readonly year: number; readonly cited_by_count: number }[];
	readonly primary_location?: { readonly source?: { readonly display_name?: string; readonly type?: string | null; readonly issn?: readonly string[] | null } | null } | null;
	readonly open_access?: { readonly is_oa?: boolean; readonly oa_url?: string | null } | null;
	readonly locations?: readonly { readonly is_oa?: boolean; readonly landing_page_url?: string | null; readonly pdf_url?: string | null }[] | null;
	readonly authorships?: readonly { readonly author?: { readonly display_name?: string } }[];
	readonly biblio?: { readonly volume?: string | null; readonly issue?: string | null; readonly first_page?: string | null; readonly last_page?: string | null } | null;
	readonly keywords?: readonly { readonly display_name?: string }[];
}

/** A paper as Semantic Scholar lists it, the fields asked for only. */
interface ISemanticScholarPaper {
	readonly paperId: string;
	readonly externalIds?: { readonly DOI?: string; readonly ArXiv?: string } | null;
	readonly title?: string | null;
	readonly year?: number | null;
	readonly venue?: string | null;
	readonly publicationVenue?: { readonly name?: string; readonly issn?: string } | null;
	readonly citationCount?: number;
	readonly influentialCitationCount?: number;
	readonly publicationTypes?: readonly string[] | null;
	readonly openAccessPdf?: { readonly url?: string | null } | null;
	readonly authors?: readonly { readonly name?: string }[];
	readonly abstract?: string | null;
	readonly s2FieldsOfStudy?: readonly { readonly category?: string }[] | null;
}

/** The fields of a work asked of OpenAlex. */
const OPENALEX_SELECT = 'id,doi,title,publication_year,type,cited_by_count,fwci,citation_normalized_percentile,counts_by_year,primary_location,open_access,locations,authorships';
// Sites that turn the internal browser away, as IEEE Xplore does: a free copy elsewhere is read instead, when there is one
const TURNS_AWAY = /(^|\.)ieeexplore\.ieee\.org$/i;
/** The fields of a paper asked of Semantic Scholar. */
const SEMANTIC_SCHOLAR_FIELDS = 'title,year,authors,venue,publicationVenue,citationCount,influentialCitationCount,publicationTypes,externalIds,openAccessPdf';
// Semantic Scholar lists at most 1,000 citing works a request
const CITING_LISTED = 1000;
// The key of when the page was Compose > Replication > Discover, so the articles kept then stay kept
const SELECTED_KEY = 'pollis.replication.discover.selected';
// The references imported, as Import References keeps them
const IMPORTED_KEY = 'pollis.literature.imported';
// The search tree the page once kept, removed when the page opens
const TREE_KEY = 'pollis.replication.discover.tree';
/** The kinds of work listed: articles, reviews and surveys, conference papers, preprints, working papers (reports), books and their chapters. */
export const OPENALEX_TYPES = 'article|review|conference-paper|preprint|report|book|book-chapter';
/** The kinds of paper Semantic Scholar lists that are left out; a paper with no kind, as many classics, is kept. */
const SEMANTIC_SCHOLAR_LEFT_OUT = new Set(['Editorial', 'LettersAndComments', 'News']);
/** Each index: where it gives its free key, the user's key in the keychain, and how it is asked. */
const KEYS: Record<KeyIndex, typeof API_PROVIDERS[KeyIndex]> = API_PROVIDERS;
// OpenAlex lists at most 200 works a request, each request costing the same; Semantic Scholar's first 200 likewise
const LISTED = 200;
const CALL_SITE = 'pollis.literatureRadar';
/** The fields of a work asked of OpenAlex when it is saved, for its reference. */
const OPENALEX_SAVE_SELECT = `${OPENALEX_SELECT},biblio,keywords,abstract_inverted_index`;
/** The time between the lookups of two articles saved. */
const SAVE_SPACING = 250;
/** The time between two searches by title of works imported. */
const TITLE_SPACING = 100;
/** The years of the recent citations of works imported, as Discover Literature has them at first. */
const IMPORT_RECENT_YEARS = 5;
/** The DOIs asked of Semantic Scholar a request, at most. */
const SEMANTIC_SCHOLAR_BATCH = 500;

/** The page open of each mode. */
const openPages = new Map<PageMode, WebviewInput>();

/** The OpenAlex filter of `query`; commas part its filters, so the topic has none. */
function openAlexFilter(query: IDiscoverQuery): string {
	const filters = [`type:${OPENALEX_TYPES}`, `publication_year:${query.from}-${query.to}`];
	const cited = (query.cites ?? []).flatMap(version => version.openAlexId ? [version.openAlexId] : []);
	if (cited.length) {
		filters.push(`cites:${cited.join('|')}`);
	}
	if (query.topic) {
		filters.push(`${query.searchIn === 'title' ? 'title' : 'title_and_abstract'}.search:${query.topic.replace(/,/g, ' ')}`);
	}
	if (query.field) {
		filters.push(`primary_topic.field.id:${query.field}`);
	}
	if (query.citations > 0) {
		filters.push(`cited_by_count:>${query.citations - 1}`);
	}
	if (query.influence !== 'any') {
		filters.push(`citation_normalized_percentile.is_in_top_${query.influence === 'top1' ? 1 : 10}_percent:true`);
	}
	if (query.quality === 'cited' && query.cited > 0) {
		filters.push(`primary_location.source.summary_stats.2yr_mean_citedness:>${query.cited}`);
	}
	if (query.openOnly) {
		filters.push('open_access.is_oa:true');
	}
	return filters.join(',');
}

/** The parameters of Semantic Scholar's bulk search for `query`; its AND is `+`, its OR `|`. */
function semanticScholarParameters(query: IDiscoverQuery): string {
	const parameters = [
		`query=${encodeURIComponent(query.topic.replace(/\bAND\b/g, '+').replace(/\bOR\b/g, '|'))}`,
		`year=${query.from}-${query.to}`,
		'sort=citationCount:desc',
		`fields=${SEMANTIC_SCHOLAR_FIELDS}`,
	];
	const fields = FIELDS.find(([id]) => id === query.field)?.[2];
	if (fields) {
		parameters.push(`fieldsOfStudy=${encodeURIComponent(fields)}`);
	}
	if (query.citations > 0) {
		parameters.push(`minCitationCount=${query.citations}`);
	}
	if (query.openOnly) {
		parameters.push('openAccessPdf');
	}
	return parameters.join('&');
}

/** Whether a paper citing a work meets `query`, as Semantic Scholar's search would have checked it: its years, citations, field, openness and topic. */
function citingPaperMeets(paper: ISemanticScholarPaper, query: IDiscoverQuery, topic: ((text: string) => boolean) | undefined): boolean {
	const fields = FIELDS.find(([id]) => id === query.field)?.[2].split(',');
	return !!paper.year && paper.year >= query.from && paper.year <= query.to
		&& (paper.citationCount ?? 0) >= query.citations
		&& (!query.openOnly || !!paper.openAccessPdf?.url)
		&& (!fields || !!paper.s2FieldsOfStudy?.some(field => field.category && fields.includes(field.category)))
		&& (!topic || topic(query.searchIn === 'title' ? paper.title ?? '' : `${paper.title ?? ''} ${paper.abstract ?? ''}`));
}

/** The article of a Semantic Scholar `paper` with a title and year. */
function semanticScholarArticle(paper: ISemanticScholarPaper): IFoundArticle {
	const doi = paper.externalIds?.DOI?.toLowerCase() || undefined;
	return {
		id: doi ?? `s2:${paper.paperId}`,
		doi,
		link: doi ? `https://doi.org/${doi}` : `https://www.semanticscholar.org/paper/${paper.paperId}`,
		title: paper.title!,
		year: paper.year!,
		authors: (paper.authors ?? []).map(author => author.name).filter((name): name is string => !!name),
		journal: paper.publicationVenue?.name || paper.venue || undefined,
		issns: paper.publicationVenue?.issn ? [paper.publicationVenue.issn] : [],
		citedSemanticScholar: paper.citationCount ?? 0,
		influential: paper.influentialCitationCount,
		openUrl: readableUrl([paper.openAccessPdf?.url, paper.externalIds?.ArXiv ? `https://arxiv.org/abs/${paper.externalIds.ArXiv}` : undefined]),
		version: semanticScholarVersion(paper, doi),
		semanticScholarId: paper.paperId,
	};
}

/** The words of `text`, in lower case and without accents. */
export function titleWords(text: string): string[] {
	return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[\p{L}\p{N}]+/gu) ?? [];
}

/** Whether OpenAlex has `work` from a repository, as arXiv, HAL or SSRN, not from its publisher. */
function isRepository(work: IOpenAlexWork): boolean {
	return work.primary_location?.source?.type === 'repository';
}

/** The article of an OpenAlex `work` with a title and year, its citations since `since` the recent ones. */
function openAlexArticle(work: IOpenAlexWork, since: number): IFoundArticle {
	const id = openAlexIdOf(work);
	const doi = work.doi?.replace(/^https:\/\/doi\.org\//, '').toLowerCase() || undefined;
	const percentile = work.citation_normalized_percentile?.value;
	return {
		id: doi ?? `openalex:${id}`,
		doi,
		link: doi ? `https://doi.org/${doi}` : `https://openalex.org/${id}`,
		title: work.title!,
		year: work.publication_year!,
		authors: (work.authorships ?? []).map(authorship => authorship.author?.display_name).filter((name): name is string => !!name),
		journal: work.primary_location?.source?.display_name,
		// A repository, as arXiv or HAL, is not a journal to rank
		issns: isRepository(work) ? [] : work.primary_location?.source?.issn ?? [],
		citedOpenAlex: work.cited_by_count ?? 0,
		fwci: work.fwci ?? undefined,
		percentile: typeof percentile === 'number' ? Math.round(percentile * 1000) / 10 : undefined,
		recent: (work.counts_by_year ?? []).reduce((sum, count) => count.year >= since ? sum + count.cited_by_count : sum, 0),
		openUrl: work.open_access?.is_oa ? readableUrl([work.open_access.oa_url, ...(work.locations ?? []).filter(location => location.is_oa).map(location => location.pdf_url || location.landing_page_url)]) : undefined,
		version: work.type === 'preprint' ? 'preprint' : work.type === 'report' ? 'workingPaper' : isRepository(work) ? 'repository' : 'published',
		openAlexId: id,
	};
}

/** Whether the internal browser can show `url`: not at a site that turns it away. */
function readable(url: string): boolean {
	try {
		return !TURNS_AWAY.test(new URL(url).hostname);
	} catch {
		return false;
	}
}

/** The free copy to read, of `urls`, the index's best first: the first the internal browser can show, or else the best. */
function readableUrl(urls: readonly (string | null | undefined)[]): string | undefined {
	const free = urls.filter((url): url is string => !!url);
	return free.find(readable) ?? free[0];
}

export function openAlexIdOf(work: IOpenAlexWork): string {
	return work.id.replace('https://openalex.org/', '');
}

/** What a Semantic Scholar paper is, by where it is: a preprint in arXiv, SSRN or another preprint server, or else the publisher's. */
function semanticScholarVersion(paper: ISemanticScholarPaper, doi: string | undefined): VersionKind {
	const venue = paper.publicationVenue?.name || paper.venue || '';
	return /arxiv|ssrn|rxiv|preprint|research square/i.test(venue) || doi?.startsWith('10.48550/') || doi?.startsWith('10.2139/') || !doi && paper.externalIds?.ArXiv ? 'preprint' : 'published';
}

/** The text of an abstract OpenAlex keeps as its words with their positions. */
function invertedText(index: Record<string, readonly number[]>): string {
	const words: string[] = [];
	for (const [word, positions] of Object.entries(index)) {
		for (const position of positions) {
			words[position] = word;
		}
	}
	return words.filter(word => word !== undefined).join(' ');
}

/** The first year of the recent citations of `query`: the current year, though not over, is one of them. */
function recentSince(query: IDiscoverQuery): number {
	return new Date().getFullYear() - query.recentYears + 1;
}

/**
 * Whether `a` and `b` are versions of one work, as a preprint and its article: the same title, but for case, accents
 * and punctuation, and first authors who share a name. The year is not compared, a preprint's being often earlier.
 */
export function sameWork(a: Pick<IFoundArticle, 'title' | 'authors'>, b: Pick<IFoundArticle, 'title' | 'authors'>): boolean {
	if (titleWords(a.title).join(' ') !== titleWords(b.title).join(' ')) {
		return false;
	}
	const names = new Set(titleWords(a.authors[0] ?? '').filter(word => word.length > 1));
	return titleWords(b.authors[0] ?? '').some(word => names.has(word));
}

/** The work of `article`, the same for its versions: its title and its first author's last name, in lower case. */
function workOf(article: Pick<IFoundArticle, 'title' | 'authors'>): string {
	return `${titleWords(article.title).join(' ')} / ${titleWords(article.authors[0] ?? '').at(-1) ?? ''}`;
}

/**
 * `articles` in groups, the versions of each work together: the most cited of the two indexes' counts first, then its
 * other versions, the most cited first. Each version keeps its own counts.
 */
function groupVersions(articles: readonly IFoundArticle[]): IFoundArticle[][] {
	const cited = (article: IFoundArticle) => Math.max(article.citedOpenAlex ?? -1, article.citedSemanticScholar ?? -1);
	// Versions have the same title, so only those are compared
	const groups: IFoundArticle[][] = [];
	const byTitle = new Map<string, IFoundArticle[][]>();
	for (const article of articles) {
		const title = titleWords(article.title).join(' ');
		const candidates = byTitle.get(title) ?? [];
		const group = candidates.find(members => members.some(member => sameWork(member, article)));
		if (group) {
			group.push(article);
		} else {
			groups.push([article]);
			byTitle.set(title, [...candidates, groups[groups.length - 1]]);
		}
	}
	return groups.map(members => members.sort((a, b) => cited(b) - cited(a) || Number(b.version === 'published') - Number(a.version === 'published')));
}

/**
 * Whether a title holds `topic`, read as the indexes read it: AND, or a space, takes all, OR either, quotes a phrase,
 * brackets group. A word matches a word of the title that starts with it, as `variable` matches `variables`.
 */
function titleMatcher(topic: string): (title: string) => boolean {
	const tokens = topic.match(/"[^"]*"|\(|\)|[^\s()"]+/g) ?? [];
	let index = 0;
	type Test = (title: string) => boolean;
	const term = (): Test => {
		const token = tokens[index++];
		if (token === '(') {
			const test = either();
			if (tokens[index] === ')') {
				index++;
			}
			return test;
		}
		const wanted = titleWords(token ?? '');
		if (!wanted.length) {
			return () => true;
		}
		// A phrase, or a word: its words one after another
		return title => {
			const found = titleWords(title);
			return found.some((_, start) => wanted.every((word, offset) => found[start + offset]?.startsWith(word)));
		};
	};
	const all = (): Test => {
		const tests = [term()];
		while (index < tokens.length && tokens[index] !== 'OR' && tokens[index] !== ')') {
			if (tokens[index] === 'AND') {
				index++;
			} else {
				tests.push(term());
			}
		}
		return title => tests.every(test => test(title));
	};
	const either = (): Test => {
		const tests = [all()];
		while (tokens[index] === 'OR') {
			index++;
			tests.push(all());
		}
		return title => tests.some(test => test(title));
	};
	return tokens.length ? either() : () => true;
}

/** A query from the page, its numbers checked; Semantic Scholar alone has no percentiles or journal citedness to check. */
function checkQuery(query: IDiscoverQuery): IDiscoverQuery {
	const year = new Date().getFullYear();
	const whole = (value: unknown, min: number, max: number, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
	const from = whole(query.from, 1600, year, 1600);
	const sources = (['both', 'openAlex', 'semanticScholar'] as const).includes(query.sources) ? query.sources : 'both';
	const quality = (['any', 'cited', 'level2', 'level1', 'sjrQ1', 'sjrQ2'] as const).includes(query.quality) ? query.quality : 'any';
	return {
		sources,
		topic: typeof query.topic === 'string' ? query.topic.trim() : '',
		searchIn: query.searchIn === 'title' ? 'title' : 'titleAndAbstract',
		recentYears: whole(query.recentYears, 1, 10, 5),
		field: FIELDS.some(([id]) => id === query.field) ? query.field : 0,
		from,
		to: whole(query.to, from, year, year),
		citations: whole(query.citations, 0, 10_000_000, 0),
		influence: sources !== 'semanticScholar' && (['any', 'top10', 'top1'] as const).includes(query.influence) ? query.influence : 'any',
		quality: sources === 'semanticScholar' && quality === 'cited' ? 'any' : quality,
		cited: typeof query.cited === 'number' && Number.isFinite(query.cited) ? Math.max(0, query.cited) : 0,
		openOnly: query.openOnly === true,
		cites: checkCited(query.cites),
	};
}

// The versions of a cited work asked for at most
const CITED_VERSIONS = 20;

/** The records of the versions of a cited work from the page, those that are text; none when it has none. */
function checkCited(cites: readonly ICitedWork[] | undefined): readonly ICitedWork[] | undefined {
	if (!Array.isArray(cites)) {
		return undefined;
	}
	const text = (value: unknown) => typeof value === 'string' && value ? value : undefined;
	const checked = cites.slice(0, CITED_VERSIONS).flatMap(version => {
		if (!version || typeof version !== 'object') {
			return [];
		}
		const records = { openAlexId: text(version.openAlexId), semanticScholarId: text(version.semanticScholarId), doi: text(version.doi) };
		return records.openAlexId || records.semanticScholarId || records.doi ? [records] : [];
	});
	return checked.length ? checked : undefined;
}

/** The BibTeX type of an OpenAlex work's type; a preprint, as one in arXiv, is misc. */
const BIBTEX_TYPES: Record<string, string> = {
	'article': 'article', 'review': 'article', 'conference-paper': 'inproceedings', 'report': 'techreport', 'book': 'book',
	'book-chapter': 'incollection', 'dissertation': 'phdthesis',
};

/** Its record in Semantic Scholar: the paperId the page kept, or the one of its id when Semantic Scholar alone listed it. */
function semanticScholarIdOf(article: IDiscoveredArticle): string | undefined {
	return article.semanticScholarId ?? (article.id.startsWith('s2:') ? article.id.slice('s2:'.length) : undefined);
}

/** The reference, without its key, of an `article` saved: as OpenAlex has it (`work`), or else as the page listed it. */
function referenceOf(article: IDiscoveredArticle, work: IOpenAlexWork | undefined): Omit<IReference, 'key'> {
	const type = BIBTEX_TYPES[work?.type ?? ''] ?? (article.version === 'workingPaper' ? 'techreport' : article.version === 'published' ? 'article' : 'misc');
	const names = work?.authorships?.map(authorship => authorship.author?.display_name).filter((name): name is string => !!name);
	const venue = work?.primary_location?.source?.display_name ?? article.journal;
	const biblio = work?.biblio;
	const pages = biblio?.first_page && biblio.last_page && biblio.last_page !== biblio.first_page ? `${biblio.first_page}--${biblio.last_page}` : biblio?.first_page ?? undefined;
	const abstract = work?.abstract_inverted_index ? invertedText(work.abstract_inverted_index) : undefined;
	const keywords = work?.keywords?.map(keyword => keyword.display_name).filter((name): name is string => !!name);
	const oaUrl = work?.open_access?.oa_url ?? article.openUrl;
	return {
		type,
		title: work?.title ?? article.title,
		authors: (names?.length ? names : article.authors).map(nameAsReference),
		author_kind: 'persons',
		authors_complete: true,
		year: work?.publication_year ?? article.year,
		journal: type === 'article' || type === 'misc' ? venue : undefined,
		booktitle: type === 'inproceedings' || type === 'incollection' ? venue : undefined,
		publisher: type === 'book' ? venue : undefined,
		institution: type === 'techreport' ? venue : undefined,
		volume: biblio?.volume ?? undefined,
		number: type === 'techreport' ? undefined : biblio?.issue ?? undefined,
		pages,
		doi: article.doi,
		arxiv: article.doi?.startsWith('10.48550/arxiv.') ? article.doi.slice('10.48550/arxiv.'.length) : undefined,
		openalex: work ? openAlexIdOf(work) : article.openAlexId,
		url: article.link,
		oa_url: oaUrl,
		abstract: abstract || undefined,
		abstract_source: abstract ? 'openalex' : undefined,
		keywords: keywords?.length ? keywords : undefined,
		keywords_source: keywords?.length ? 'openalex' : undefined,
		source: 'literature radar',
		retrieved: new Date().toISOString().slice(0, 10),
		open_access: work?.open_access?.is_oa ?? !!article.openUrl,
	};
}

/** The reference, without its key, of an imported `article`: the fields of the user's file, OpenAlex's (`work`) filling those it lacks. */
function importedReferenceOf(article: IDiscoveredArticle, work: IOpenAlexWork | undefined): Omit<IReference, 'key'> {
	const own = article.imported!.reference;
	if (!work) {
		return { ...own, openalex: own.openalex ?? article.openAlexId };
	}
	const given = Object.fromEntries(Object.entries(own).filter(([, value]) => value !== undefined && !(Array.isArray(value) && !value.length)));
	return { ...referenceOf(article, work), ...given, source: 'import' };
}

/** `Last, First`, as references have names, as the page shows them: `First Last`. */
function displayName(name: string): string {
	const comma = name.indexOf(', ');
	return comma < 0 ? name : `${name.slice(comma + 2)} ${name.slice(0, comma)}`;
}

/** The article the page lists for a work imported, as the user's file has it, not yet looked up. */
function importedArticle(reference: Omit<IReference, 'key'>): IDiscoveredArticle {
	const work = `${titleWords(reference.title).join(' ')}/${reference.year ?? ''}/${reference.authors?.[0] ?? ''}`;
	return {
		id: reference.doi ?? `import:${(stringHash(work, 0) >>> 0).toString(16)}`,
		doi: reference.doi,
		link: reference.doi ? `https://doi.org/${reference.doi}` : reference.url ?? '',
		title: reference.title,
		year: reference.year ?? 0,
		authors: (reference.authors ?? []).map(displayName),
		journal: reference.journal ?? reference.booktitle ?? reference.institution ?? reference.publisher,
		openUrl: reference.oa_url,
		version: reference.type === 'techreport' ? 'workingPaper' : reference.arxiv ? 'preprint' : 'published',
		imported: { reference, match: 'unchecked' },
	};
}

/** Whether an imported `article` was found in OpenAlex, so that OpenAlex is asked for it again; one not looked up, or not found, is kept as the file has it. */
function lookedUp(article: IDiscoveredArticle): boolean {
	return !article.imported || article.imported.match === 'doi' || article.imported.match === 'title';
}

/**
 * Where each command the menu bar shows now is, by command id: the titles of the menus down to it, e.g.
 * `Model > Regression`. The active Pollis View and the toolboxes the user published decide what is there.
 */
function menuPaths(menuService: IMenuService, contextKeyService: IContextKeyService): Map<string, string> {
	const paths = new Map<string, string>();
	const walk = (actions: readonly IAction[], titles: readonly string[]) => {
		for (const action of actions) {
			if (action instanceof SubmenuItemAction) {
				walk(action.actions, [...titles, action.label.replace(/&&/g, '')]);
			} else if (action instanceof MenuItemAction && titles.length && !paths.has(action.id)) {
				paths.set(action.id, titles.join(' \u203a '));
			}
		}
	};
	walk(getFlatActionBarActions(menuService.getMenuActions(MenuId.MenubarMainMenu, contextKeyService)), []);
	return paths;
}

function openLiteratureRadar(accessor: ServicesAccessor, mode: PageMode): void {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const requestService = accessor.get(IRequestService);
	const secretStorageService = accessor.get(ISecretStorageService);
	const providers = new ProviderRequests(requestService, secretStorageService, CALL_SITE);
	const storageService = accessor.get(IStorageService);
	const journalScoresService = accessor.get(IJournalScoresService);
	const commandService = accessor.get(ICommandService);
	const quickInputService = accessor.get(IQuickInputService);
	const clipboardService = accessor.get(IClipboardService);
	const contextKeyService = accessor.get(IContextKeyService);
	const menuService = accessor.get(IMenuService);
	const notificationService = accessor.get(INotificationService);
	const toolboxPanelsService = accessor.get(IToolboxPanelsService);
	const fileDialogService = accessor.get(IFileDialogService);
	const fileService = accessor.get(IFileService);
	const library = new ReferenceLibrary(fileService, accessor.get(IPathService).userHome({ preferLocal: true }));
	storageService.remove(TREE_KEY, StorageScope.PROFILE);

	const openPage = openPages.get(mode);
	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = mode === 'import' ? localize('import.title', "Import References") : localize('discover.title', "Discover Literature");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		mode === 'import' ? 'pollis.importReferences' : 'pollis.literatureRadar',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml(mode, storedRows(storageService, 'discover', FEWEST_ROWS)));
	openPages.set(mode, webviewInput);
	const selectedKey = mode === 'import' ? IMPORTED_KEY : SELECTED_KEY;

	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPages.delete(mode);
		disposables.dispose();
	}));

	// Only the latest search's answer is shown
	let searches = 0;
	const getSelected = (): IDiscoveredArticle[] => {
		try {
			return JSON.parse(storageService.get(selectedKey, StorageScope.PROFILE, '[]'));
		} catch {
			return [];
		}
	};
	const setSelected = (selected: readonly IDiscoveredArticle[]) => {
		storageService.store(selectedKey, JSON.stringify(selected), StorageScope.PROFILE, StorageTarget.USER);
		webviewInput.webview.postMessage({ command: 'selected', selected });
	};
	const postState = async () => {
		webviewInput.webview.postMessage({
			command: 'state',
			keys: {
				openAlex: !!await secretStorageService.get(KEYS.openAlex.credential.secretKey),
				semanticScholar: !!await secretStorageService.get(KEYS.semanticScholar.credential.secretKey),
			},
			sjr: journalScoresService.getMetricsSources().includes('SCImago'),
			selected: getSelected(),
			saved: await getSaved(),
		});
	};

	/**
	 * The selected articles saved to References, with their keys: those of which this version, by its records, or else its
	 * DOI, is there; a work imported also when References has it by its DOI, or its title and first author.
	 */
	const getSaved = async (): Promise<[string, string][]> => {
		const selected = getSelected();
		const [versions, all] = await Promise.all([library.versions(), selected.some(article => article.imported) ? library.allReferences() : []]);
		const records = new Map(versions.map(version => [version.record, version.key]));
		const dois = new Map(versions.flatMap(version => version.doi ? [[version.doi.toLowerCase(), version.key] as const] : []));
		return selected.flatMap((article): [string, string][] => {
			const ids = [article.openAlexId, semanticScholarIdOf(article)].filter((id): id is string => !!id);
			const key = (ids.length ? ids.map(id => records.get(id)).find(key => key) : article.doi ? dois.get(article.doi.toLowerCase()) : undefined)
				?? (article.imported ? findReference(all, { title: article.imported.reference.title, authors: article.imported.reference.authors ?? [], doi: article.doi, arxiv: article.imported.reference.arxiv })?.key : undefined);
			return key ? [[article.id, key]] : [];
		});
	};

	/** OpenAlex's record of `article`, with what its reference needs: by its id, or else its DOI; undefined when OpenAlex has none or cannot be reached. */
	const getOpenAlexWork = async (article: IDiscoveredArticle): Promise<IOpenAlexWork | undefined> => {
		const id = article.openAlexId ? encodeURIComponent(article.openAlexId) : article.doi ? `doi:${encodeURIComponent(article.doi)}` : undefined;
		if (!id) {
			return undefined;
		}
		try {
			const context = await providers.ask(KEYS.openAlex, { url: `https://api.openalex.org/works/${id}?select=${OPENALEX_SAVE_SELECT}` });
			return context && isSuccess(context) ? await asJson<IOpenAlexWork>(context) ?? undefined : undefined;
		} catch {
			return undefined;
		}
	};

	/**
	 * Saves the selected articles with `ids` to References, one after another. A work Pollis or the user already has keeps
	 * its key and gets no new reference; another becomes one of the user's, with a key in Pollis' convention, its fields,
	 * abstract and keywords from OpenAlex (or as the page listed it, when OpenAlex has no record of it). Either way, the
	 * article's records in the two indexes are added as versions of the work, and their citation counts, dated today.
	 * Returns how many could not be saved.
	 */
	const save = async (ids: readonly string[]): Promise<number> => {
		const articles = getSelected().filter(article => ids.includes(article.id));
		let failed = 0;
		for (const [index, article] of articles.entries()) {
			const asks = lookedUp(article);
			if (index && asks) {
				await timeout(SAVE_SPACING);
			}
			try {
				const work = asks ? await getOpenAlexWork(article) : undefined;
				const openAlexId = article.openAlexId ?? (work ? openAlexIdOf(work) : undefined);
				const semanticScholarId = semanticScholarIdOf(article);
				const reference = article.imported ? importedReferenceOf(article, work) : referenceOf(article, work);
				const found = await library.find({ title: reference.title, authors: reference.authors ?? [], doi: article.doi, arxiv: reference.arxiv, records: [openAlexId, semanticScholarId].filter((id): id is string => !!id) });
				let key = found?.key;
				if (!key) {
					// The abstract OpenAlex has, or else Semantic Scholar's
					const abstract = reference.abstract ?? (asks ? (await getAbstracts(abstractId(article))).abstracts.find(found => found.source === 'Semantic Scholar')?.text : undefined);
					key = await library.newKey(reference);
					await library.saveReference({ ...reference, key, abstract, abstract_source: reference.abstract_source ?? (abstract ? 'semanticscholar' : undefined) });
				}
				const added = new Date().toISOString();
				const date = added.slice(0, 10);
				const version = { key, kind: article.version, doi: article.doi, title: article.title, venue: article.journal, year: article.year, url: article.link, added };
				const versions: IReferenceVersion[] = [];
				const counts: ICitationCount[] = [];
				if (openAlexId) {
					versions.push({ ...version, record: openAlexId, index: 'openalex' });
					if (article.citedOpenAlex !== undefined) {
						counts.push({ key, count: article.citedOpenAlex, source: 'openalex', date, record: openAlexId });
					}
				}
				if (semanticScholarId) {
					versions.push({ ...version, record: semanticScholarId, index: 'semanticscholar' });
					if (article.citedSemanticScholar !== undefined) {
						counts.push({ key, count: article.citedSemanticScholar, source: 'semanticscholar', date, record: semanticScholarId });
					}
				}
				await library.addVersions(versions);
				await library.addCounts(counts);
			} catch {
				failed++;
			}
		}
		webviewInput.webview.postMessage({ command: 'saved', saved: await getSaved(), failed });
		return failed;
	};

	/**
	 * The keys in References of the selected articles with `ids`, those not there saved first, and what to tell of it:
	 * how many were saved, and how many could not be, and are left out.
	 */
	const keysOf = async (ids: readonly string[]): Promise<{ keys: string[]; notes: string[] }> => {
		const before = new Map(await getSaved());
		const unsaved = ids.filter(id => !before.has(id));
		const failed = unsaved.length ? await save(unsaved) : 0;
		const after = new Map(await getSaved());
		const notes: string[] = [];
		if (unsaved.length > failed) {
			notes.push(localize('discover.savedFirst', "Saved to PollisReferences first: {0}.", unsaved.length - failed));
		}
		if (failed) {
			notes.push(localize('discover.leftOut', "Left out, as they could not be saved to your references: {0}.", failed));
		}
		return { keys: [...new Set(ids.flatMap(id => after.get(id) ?? []))], notes };
	};
	const tell = (notes: readonly string[], error?: boolean) => {
		webviewInput.webview.postMessage({ command: 'done', message: notes.join(' '), error });
	};

	/** Shows the selected articles with `ids` that are in References in Browse References; nothing is saved. */
	const browse = async (ids: readonly string[]): Promise<void> => {
		const saved = new Map(await getSaved());
		const keys = [...new Set(ids.flatMap(id => saved.get(id) ?? []))];
		const missing = ids.filter(id => !saved.has(id)).length;
		if (!keys.length) {
			tell([localize('discover.noneInReferences', "None of the ticked articles is in your references yet: Save to PollisReferences first.")], true);
			return;
		}
		tell(missing ? [localize('discover.notInReferences', "Not in your references, so not shown: {0}.", missing)] : []);
		await commandService.executeCommand(BROWSE_REFERENCES_COMMAND_ID, keys);
	};

	/** Opens the Snowball Search Map with the selected articles with `ids` as seeds: by their keys those in References, the others as they are listed. */
	const snowball = async (ids: readonly string[]): Promise<void> => {
		const saved = new Map(await getSaved());
		const chosen = getSelected().filter(article => ids.includes(article.id));
		const keys = [...new Set(chosen.flatMap(article => saved.get(article.id) ?? []))];
		const articles = chosen.filter(article => !saved.has(article.id)).map((article): ISnowballArticle => ({
			id: article.id, doi: article.doi, openAlexId: article.openAlexId, semanticScholarId: semanticScholarIdOf(article), title: article.title, year: article.year,
			authors: article.authors, journal: article.journal, cited: Math.max(article.citedOpenAlex ?? 0, article.citedSemanticScholar ?? 0), link: article.link,
		}));
		tell([]);
		await commandService.executeCommand(SNOWBALL_SEARCH_COMMAND_ID, { keys, articles });
	};

	/**
	 * Copies the BibTeX entries of the selected articles with `ids`, as pollis.bib has its works, nothing saved: a work in
	 * References as it is there, with its key; another with its fields from OpenAlex (or as the page listed it) and the key
	 * it would get if saved now.
	 */
	const copyBibtex = async (ids: readonly string[]) => {
		const [saved, all] = await Promise.all([getSaved(), library.allReferences()]);
		const keys = new Map(saved);
		const given: string[] = [];
		const entries: string[] = [];
		for (const article of getSelected().filter(article => ids.includes(article.id))) {
			const key = keys.get(article.id);
			const known = key !== undefined ? all.find(reference => reference.key === key) : undefined;
			if (known) {
				if (!entries.some(entry => entry.startsWith(`@${known.type}{${known.key},`))) {
					entries.push(referenceBibTeX(known));
				}
				continue;
			}
			const work = lookedUp(article) ? await getOpenAlexWork(article) : undefined;
			const reference = article.imported ? importedReferenceOf(article, work) : referenceOf(article, work);
			const newKey = await library.newKey(reference, given);
			given.push(newKey);
			entries.push(referenceBibTeX({ ...reference, key: newKey }));
		}
		if (entries.length) {
			await clipboardService.writeText(entries.join('\n\n') + '\n');
		}
		tell([entries.length === 1 ? localize('discover.bibtexCopiedOne', "1 BibTeX entry copied.") : localize('discover.bibtexCopied', "{0} BibTeX entries copied.", entries.length)], !entries.length);
	};

	/**
	 * The panels the menu bar shows now, Pollis' own and the toolboxes', each with the command that opens it, where it
	 * is, what it covers and the keys its References cite.
	 */
	const menuPanels = async () => {
		const paths = menuPaths(menuService, contextKeyService);
		const { panels } = await library.pollis();
		const toolboxPanels = toolboxPanelsService.getToolboxes().flatMap(toolbox => toolbox.panels.map(panel => ({ ...panel, commands: [panel.command] })));
		return [...panels, ...toolboxPanels].flatMap(panel => {
			const command = panel.commands?.find(command => paths.has(command));
			return command ? [{ id: panel.id, title: panel.title, description: panel.description ?? '', keys: panel.keys, command, path: paths.get(command)! }] : [];
		});
	};

	/**
	 * The panels the ticked articles can be shown in, as the page's chooser lists them: those in the menus now, with
	 * where, what they cover, how many works their References show and how many of the selected articles with `ids`.
	 */
	const postPanels = async (ids: readonly string[]) => {
		const [panels, choices, saved] = await Promise.all([menuPanels(), library.allPanelChoices(), getSaved()]);
		const keys = new Set(saved.filter(([id]) => ids.includes(id)).map(([, key]) => key));
		const listed = panels.map(panel => {
			const shown = new Set(panel.keys);
			for (const choice of choices.filter(choice => choice.panel === panel.id)) {
				if (choice.shown) {
					shown.add(choice.key);
				} else {
					shown.delete(choice.key);
				}
			}
			return { id: panel.id, title: panel.title, path: panel.path, description: panel.description, cites: shown.size, citesTicked: [...keys].filter(key => shown.has(key)).length };
		});
		listed.sort((a, b) => a.path.localeCompare(b.path) || a.title.localeCompare(b.title));
		webviewInput.webview.postMessage({ command: 'panels', panels: listed });
	};

	/** Opens the panel `id` as its menu item does. */
	const openPanel = async (id: string) => {
		const command = (await menuPanels()).find(panel => panel.id === id)?.command;
		if (command) {
			await commandService.executeCommand(command);
		}
	};

	/** Shows the selected articles with `ids` in the References of the panels with ids `chosen`, those not in References saved there first. */
	const showInPanels = async (ids: readonly string[], chosen: readonly string[]) => {
		const panels = (await menuPanels()).filter(panel => chosen.includes(panel.id));
		const titles = panels.map(panel => panel.title);
		const { keys, notes } = await keysOf(ids);
		if (!keys.length || !titles.length) {
			tell(notes, true);
			return;
		}
		for (const panel of panels) {
			for (const key of keys) {
				await library.choose(panel.id, key, true);
			}
		}
		notes.unshift(titles.length === 1
			? localize('discover.shownInPanel', "Shown in the References of {0}: {1}.", titles[0], keys.length)
			: localize('discover.shownInPanels', "Shown in the References of {0}: {1} each.", titles.join(', '), keys.length));
		tell(notes);
	};

	/** Opens in the internal browser the open-access copies of the selected articles with `ids`. */
	const openPdfs = async (ids: readonly string[]) => {
		const articles = getSelected().filter(article => ids.includes(article.id));
		const open = articles.flatMap(article => article.openUrl && /^https?:\/\//.test(article.openUrl) ? [article.openUrl] : []);
		for (const url of new Set(open)) {
			await commandService.executeCommand(OPEN_LINK_COMMAND_ID, url);
		}
		const notes = open.length ? [localize('discover.pdfsOpened', "Open-access copies opened: {0}.", open.length)] : [];
		if (open.length < articles.length) {
			notes.push(localize('discover.noOpenCopy', "Without an open-access copy known: {0}.", articles.length - open.length));
		}
		tell(notes, !open.length);
	};
	disposables.add(journalScoresService.onDidChange(() => postState()));

	/** A request to Semantic Scholar, with the user's key if any, asked `attempts` times, each a little later, while it is busy. */
	const askSemanticScholar = (url: string, data?: string, attempts?: number, abandoned?: () => boolean): Promise<IRequestContext | undefined> =>
		providers.ask(KEYS.semanticScholar, { url, data, attempts, abandoned });

	/** Semantic Scholar's paper, citations and influential citations of the works with `dois`, by DOI; undefined when it cannot be reached. */
	const getSemanticScholarCounts = async (dois: readonly string[], attempts?: number, abandoned?: () => boolean): Promise<Map<string, { paperId: string; cited: number; influential?: number }> | undefined> => {
		if (!dois.length) {
			return new Map();
		}
		try {
			const context = await askSemanticScholar('https://api.semanticscholar.org/graph/v1/paper/batch?fields=citationCount,influentialCitationCount', JSON.stringify({ ids: dois.map(doi => `DOI:${doi}`) }), attempts, abandoned);
			const papers = context && isSuccess(context) ? await asJson<({ paperId: string; citationCount?: number; influentialCitationCount?: number } | null)[]>(context) : undefined;
			if (!Array.isArray(papers)) {
				return undefined;
			}
			// In the order asked, null for a DOI it does not know
			const counts = new Map<string, { paperId: string; cited: number; influential?: number }>();
			papers.forEach((paper, index) => {
				if (paper && typeof paper.citationCount === 'number') {
					counts.set(dois[index], { paperId: paper.paperId, cited: paper.citationCount, influential: paper.influentialCitationCount });
				}
			});
			return counts;
		} catch {
			return undefined;
		}
	};

	/** Whether the journal with `issns` meets `quality`, of those PollisJournals knows. */
	const meetsQuality = (quality: JournalQuality, issns: readonly string[]): boolean => {
		if (quality === 'any' || quality === 'cited') {
			return true;
		}
		const scores = journalScoresService.getScores(issns);
		switch (quality) {
			case 'level2': return scores?.level === '2';
			case 'level1': return scores?.level === '1' || scores?.level === '2';
			case 'sjrQ1':
			case 'sjrQ2': {
				const quartile = scores?.metrics.find(value => value.sjrQuartile)?.sjrQuartile;
				return !!quartile && (quartile === 'Q1' || quality === 'sjrQ2' && quartile === 'Q2');
			}
		}
	};

	/** OpenAlex's most cited articles for `query`, and what is left of its budget today. */
	/**
	 * OpenAlex's articles with `dois`, by DOI, a hundred to a request: those Semantic Scholar alone listed, often
	 * articles whose publisher gives OpenAlex no abstract to search; undefined when it cannot be reached.
	 */
	const getOpenAlexArticles = async (dois: readonly string[], since: number): Promise<Map<string, IFoundArticle> | undefined> => {
		// A comma parts OpenAlex's filters and a bar its alternatives
		const asked = dois.filter(doi => !/[,|]/.test(doi));
		const articles = new Map<string, IFoundArticle>();
		try {
			for (let start = 0; start < asked.length; start += 100) {
				const filter = `doi:${asked.slice(start, start + 100).join('|')}`;
				const context = await providers.ask(KEYS.openAlex, { url: `https://api.openalex.org/works?filter=${encodeURIComponent(filter)}&per_page=100&select=${OPENALEX_SELECT}` });
				const answer = context && isSuccess(context) ? await asJson<{ results?: IOpenAlexWork[] }>(context) : undefined;
				if (!answer?.results) {
					return undefined;
				}
				// Of records that share a DOI, as a copy in HAL and the publisher's, the publisher's
				for (const work of answer.results.filter(work => work.title && work.publication_year)) {
					const article = openAlexArticle(work, since);
					const other = article.doi ? articles.get(article.doi) : undefined;
					if (article.doi && (!other || other.version !== 'published' && article.version === 'published')) {
						articles.set(article.doi, article);
					}
				}
			}
			return articles;
		} catch {
			return undefined;
		}
	};

	/**
	 * The abstracts of the article with `id` each index has, asked of both at once, and the indexes that could not be
	 * reached; one that answers it does not know the article, or has no abstract of it, is neither.
	 */
	const getAbstracts = async (id: string): Promise<{ abstracts: { source: string; text: string }[]; unreachable: string[] }> => {
		const doi = id.startsWith('openalex:') || id.startsWith('s2:') ? undefined : id;
		const openAlexUrl = id.startsWith('openalex:') ? `https://api.openalex.org/works/${encodeURIComponent(id.slice('openalex:'.length))}` : doi ? `https://api.openalex.org/works/doi:${encodeURIComponent(doi)}` : undefined;
		const semanticScholarUrl = id.startsWith('s2:') ? `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(id.slice('s2:'.length))}` : doi ? `https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(doi)}` : undefined;
		// The text, null for none, undefined when not reached
		const ask = async <T>(url: string | undefined, request: (url: string) => Promise<IRequestContext | undefined>, text: (answer: T) => string | undefined): Promise<string | null | undefined> => {
			if (!url) {
				return null;
			}
			try {
				const context = await request(url);
				if (context?.res.statusCode === 404) {
					return null;
				}
				const answer = context && isSuccess(context) ? await asJson<T>(context) : undefined;
				return answer ? text(answer) || null : undefined;
			} catch {
				return undefined;
			}
		};
		const [openAlex, semanticScholar] = await Promise.all([
			ask<Pick<IOpenAlexWork, 'abstract_inverted_index'>>(openAlexUrl,
				url => providers.ask(KEYS.openAlex, { url: `${url}?select=abstract_inverted_index` }),
				work => work.abstract_inverted_index ? invertedText(work.abstract_inverted_index) : undefined),
			ask<{ abstract?: string | null }>(semanticScholarUrl, url => askSemanticScholar(`${url}?fields=abstract`), paper => paper.abstract || undefined),
		]);
		const abstracts: { source: string; text: string }[] = [];
		const unreachable: string[] = [];
		for (const [source, text] of [['OpenAlex', openAlex], ['Semantic Scholar', semanticScholar]] as const) {
			if (text) {
				abstracts.push({ source, text });
			} else if (text === undefined) {
				unreachable.push(source);
			}
		}
		return { abstracts, unreachable };
	};

	/** The id the indexes are asked for the abstract of `article` by: an imported work's record in OpenAlex, or its DOI; none for one without either. */
	const abstractId = (article: IDiscoveredArticle): string => !article.imported ? article.id : article.openAlexId ? `openalex:${article.openAlexId}` : article.doi ?? '';

	/** The abstracts of the selected article with `id`: an imported work's from the user's file, or else the indexes'. */
	const abstractsOf = async (id: string): Promise<{ abstracts: { source: string; text: string }[]; unreachable: string[]; note?: string }> => {
		const article = getSelected().find(article => article.id === id);
		if (!article?.imported) {
			return getAbstracts(id);
		}
		if (article.imported.reference.abstract) {
			return { abstracts: [{ source: localize('import.yourFile', "your file"), text: article.imported.reference.abstract }], unreachable: [] };
		}
		const asked = abstractId(article);
		return asked ? getAbstracts(asked) : { abstracts: [], unreachable: [], note: localize('import.noAbstract', "Your file has no abstract of it, and without a DOI the indexes are not asked: Look Up Ticked may find it.") };
	};

	/** Tells the page how an import, or a lookup, goes. */
	const importStatus = (message: string) => webviewInput.webview.postMessage({ command: 'importStatus', message });

	/**
	 * OpenAlex's article for an imported `article` without a DOI OpenAlex knows, by its title: one of the first ten found
	 * whose title and first author are the same, the published version first. `stop` when OpenAlex cannot be reached or
	 * asks to wait, its budget used up.
	 */
	const findByTitle = async (article: IDiscoveredArticle, since: number): Promise<IFoundArticle | undefined | 'stop'> => {
		const words = titleWords(article.title).join(' ');
		if (!words) {
			return undefined;
		}
		const url = `https://api.openalex.org/works?filter=${encodeURIComponent(`title.search:${words}`)}&per_page=10&select=${OPENALEX_SELECT}`;
		try {
			const context = await providers.ask(KEYS.openAlex, { url });
			const answer = context && isSuccess(context) ? await asJson<{ results?: IOpenAlexWork[] }>(context) : undefined;
			if (!answer?.results) {
				return 'stop';
			}
			const found = answer.results.filter(work => work.title && work.publication_year).map(work => openAlexArticle(work, since))
				.filter(found => article.authors.length ? sameWork(found, article) : titleWords(found.title).join(' ') === words && (!article.year || Math.abs(found.year - article.year) <= 1));
			return found.find(found => found.version === 'published') ?? found[0];
		} catch {
			return 'stop';
		}
	};

	/**
	 * Looks up the imported works with `ids` in OpenAlex, by their DOIs, a hundred to a request, and those it does not find
	 * by their titles, one request each; then in Semantic Scholar, by the DOIs known, for its counts. Each is marked as
	 * found by DOI or by title, not found, or, when an index could not be reached, not looked up. Returns what to tell of it.
	 */
	const lookUp = async (ids: readonly string[]): Promise<string[]> => {
		const asked = getSelected().filter(article => article.imported && ids.includes(article.id));
		if (!asked.length) {
			return [];
		}
		const since = new Date().getFullYear() - IMPORT_RECENT_YEARS + 1;
		importStatus(localize('import.lookingUpDois', "Looking up {0} references in OpenAlex...", asked.length));
		const dois = asked.flatMap(article => article.doi ? [article.doi] : []);
		const byDoi = dois.length ? await getOpenAlexArticles(dois, since) : new Map<string, IFoundArticle>();
		const notes: string[] = [];
		const byTitle = new Map<string, IFoundArticle>();
		// Those not looked up: all when OpenAlex could not be reached, else those after it stopped answering
		const unchecked = new Set<string>();
		if (!byDoi) {
			asked.forEach(article => unchecked.add(article.id));
		} else {
			const titled = asked.filter(article => !article.doi || !byDoi.has(article.doi));
			for (const [index, article] of titled.entries()) {
				if (unchecked.size) {
					unchecked.add(article.id);
					continue;
				}
				importStatus(localize('import.lookingUpTitles', "Looking up by title in OpenAlex: {0} of {1}...", index + 1, titled.length));
				const found = await findByTitle(article, since);
				if (found === 'stop') {
					unchecked.add(article.id);
				} else if (found) {
					byTitle.set(article.id, found);
				}
				await timeout(TITLE_SPACING);
			}
		}
		if (unchecked.size) {
			notes.push(localize('import.openAlexStopped', "OpenAlex could not be reached, or its budget for today is used up: {0} not looked up. A free key of your own has a budget of its own.", unchecked.size));
		}
		// Semantic Scholar's counts, by the DOIs known, those found by title among them
		const known = [...new Set(asked.flatMap(article => {
			const doi = article.doi ?? byTitle.get(article.id)?.doi;
			return doi ? [doi] : [];
		}))];
		const counts = new Map<string, { paperId: string; cited: number; influential?: number }>();
		if (known.length) {
			importStatus(localize('import.lookingUpSemanticScholar', "Asking Semantic Scholar for the counts of {0} references...", known.length));
		}
		for (let start = 0; start < known.length; start += SEMANTIC_SCHOLAR_BATCH) {
			const found = await getSemanticScholarCounts(known.slice(start, start + SEMANTIC_SCHOLAR_BATCH), 2);
			if (!found) {
				notes.push(localize('import.semanticScholarStopped', "Semantic Scholar could not be reached, or was too busy: its counts are missing."));
				break;
			}
			found.forEach((count, doi) => counts.set(doi, count));
		}
		const updated = getSelected().map((article): IDiscoveredArticle => {
			if (!article.imported || !ids.includes(article.id) || unchecked.has(article.id)) {
				return article;
			}
			const viaDoi = article.doi ? byDoi?.get(article.doi) : undefined;
			const found = viaDoi ?? byTitle.get(article.id);
			const doi = article.doi ?? found?.doi;
			const count = doi ? counts.get(doi) : undefined;
			const scores = found?.issns.length ? journalScoresService.getScores(found.issns) : undefined;
			const journal = scores ? describeJournal(scores) : undefined;
			// A DOI alone, as pasted, takes its title, authors and year from OpenAlex
			const bare = article.imported.reference.title === article.doi ? found : undefined;
			const reference = bare ? { ...article.imported.reference, title: bare.title, authors: bare.authors.map(nameAsReference), year: bare.year, journal: bare.journal } : article.imported.reference;
			return {
				...article,
				doi,
				link: article.link || found?.link || '',
				title: reference.title,
				authors: bare ? bare.authors : article.authors,
				year: reference.year ?? article.year,
				journal: article.journal ?? found?.journal,
				journalTag: journal?.tag || undefined,
				journalDetails: journal?.details || undefined,
				citedOpenAlex: found?.citedOpenAlex,
				recent: found?.recent,
				fwci: found?.fwci,
				percentile: found?.percentile,
				openUrl: article.openUrl ?? found?.openUrl,
				version: found?.version ?? article.version,
				openAlexId: found?.openAlexId,
				semanticScholarId: count?.paperId,
				citedSemanticScholar: count?.cited,
				influential: count?.influential,
				imported: { reference, match: viaDoi ? 'doi' : found ? 'title' : 'none' },
			};
		});
		setSelected(updated);
		const done = updated.filter(article => ids.includes(article.id) && !unchecked.has(article.id));
		const tally = (match: ImportMatch) => done.filter(article => article.imported?.match === match).length;
		notes.unshift(localize('import.lookedUp', "Found in OpenAlex: {0} by DOI, {1} by title; not found: {2}.", tally('doi'), tally('title'), tally('none')));
		return notes;
	};

	/** The names of the formats, as the page tells them. */
	const formatNames: Record<ReferenceFormat, string> = { bibtex: 'BibTeX', ris: 'RIS', csl: 'CSL-JSON', dois: localize('import.doiList', "a list of DOIs") };

	/**
	 * Adds the works of `text` to the table, those already there left out, and looks them up when `look` (a list of DOIs
	 * always is: a DOI alone has no title). Returns what to tell of it, and whether nothing could be added.
	 */
	const importReferences = async (text: string, look: boolean): Promise<{ notes: string[]; failed: boolean }> => {
		const read = readReferences(text);
		const selected = getSelected();
		const listed = new Set(selected.map(article => article.id));
		const added: IDiscoveredArticle[] = [];
		for (const reference of read.references) {
			const article = importedArticle(reference);
			if (!listed.has(article.id)) {
				listed.add(article.id);
				added.push(article);
			}
		}
		if (!read.references.length) {
			return { notes: [localize('import.nothing', "No references found: the text is not BibTeX, RIS or CSL-JSON, and has no DOIs.")], failed: true };
		}
		setSelected([...selected, ...added]);
		const notes = [read.references.length === 1
			? localize('import.readOne', "1 reference read, from {0}.", formatNames[read.format])
			: localize('import.read', "{0} references read, from {1}.", read.references.length, formatNames[read.format])];
		if (read.references.length > added.length) {
			notes.push(localize('import.repeated', "Already in the table, so not added again: {0}.", read.references.length - added.length));
		}
		if (read.unread) {
			notes.push(localize('import.unread', "Without a title, so left out: {0}.", read.unread));
		}
		if (added.length && (look || read.format === 'dois')) {
			notes.push(...await lookUp(added.map(article => article.id)));
		}
		return { notes, failed: false };
	};

	/** Imports the files the user chooses, one after another. */
	const chooseFiles = async (look: boolean) => {
		const files = await fileDialogService.showOpenDialog({
			title: localize('import.chooseTitle', "Import References"),
			canSelectFiles: true,
			canSelectMany: true,
			filters: [{ name: localize('import.filter', "References (BibTeX, RIS, CSL-JSON, DOIs)"), extensions: ['bib', 'bibtex', 'ris', 'json', 'txt'] }],
		});
		if (!files?.length) {
			webviewInput.webview.postMessage({ command: 'imported', message: '', error: false });
			return;
		}
		const notes: string[] = [];
		let failed = true;
		for (const file of files) {
			try {
				const answer = await importReferences((await fileService.readFile(file)).value.toString(), look);
				notes.push(files.length > 1 ? `${file.path.split('/').pop()}: ${answer.notes.join(' ')}` : answer.notes.join(' '));
				failed &&= answer.failed;
			} catch {
				notes.push(localize('import.unreadable', "{0} could not be read.", file.path.split('/').pop()));
			}
		}
		webviewInput.webview.postMessage({ command: 'imported', message: notes.join(' '), error: failed });
	};

	const searchOpenAlex = async (query: IDiscoverQuery): Promise<IndexAnswer & { readonly budget?: number }> => {
		const since = recentSince(query);
		const url = `https://api.openalex.org/works?filter=${encodeURIComponent(openAlexFilter(query))}&sort=cited_by_count:desc&per_page=${LISTED}&select=${OPENALEX_SELECT}`;
		try {
			const context = await providers.ask(KEYS.openAlex, { url });
			if (!context) {
				return { problem: localize('discover.openAlexNotReached', "OpenAlex could not be reached, or refused the search.") };
			}
			// What is left of the day's budget, as a share of it, both of which OpenAlex gives in dollars
			const left = Number(context.res.headers['x-ratelimit-remaining-usd']);
			const limit = Number(context.res.headers['x-ratelimit-limit-usd']);
			const budget = left >= 0 && limit > 0 ? Math.min(left / limit, 1) : undefined;
			if (context.res.statusCode === 429) {
				return {
					problem: await providers.key(KEYS.openAlex)
						? localize('discover.keyBudgetUsed', "Your OpenAlex key has used up its budget for today. It starts again tomorrow.")
						: localize('discover.budgetUsed', "The free budget of OpenAlex, shared with everyone on your network, is used up for today. It starts again tomorrow; a free key of your own has a budget of its own."),
				};
			}
			const answer = isSuccess(context) ? await asJson<{ meta?: { count?: number }; results?: IOpenAlexWork[] }>(context) : undefined;
			if (!answer?.results) {
				return { problem: localize('discover.openAlexNotReached', "OpenAlex could not be reached, or refused the search.") };
			}
			// Each record a row, a copy in a repository with its article's DOI by its OpenAlex id
			const ids = new Set<string>();
			const articles = answer.results.filter(work => work.title && work.publication_year).map(work => {
				const article = openAlexArticle(work, since);
				const id = ids.has(article.id) ? `openalex:${article.openAlexId}` : article.id;
				ids.add(id);
				return { ...article, id };
			});
			return { articles, found: answer.meta?.count ?? articles.length, budget };
		} catch {
			return { problem: localize('discover.openAlexNotReached', "OpenAlex could not be reached, or refused the search.") };
		}
	};

	/** Semantic Scholar's most cited articles for `query`, asked `attempts` times while it is busy. */
	const searchSemanticScholar = async (query: IDiscoverQuery, attempts?: number, abandoned?: () => boolean): Promise<IndexAnswer> => {
		const problem = localize('discover.semanticScholarNotReached', "Semantic Scholar could not be reached, or is too busy just now.");
		try {
			const context = await askSemanticScholar(`https://api.semanticscholar.org/graph/v1/paper/search/bulk?${semanticScholarParameters(query)}`, undefined, attempts, abandoned);
			const answer = context && isSuccess(context) ? await asJson<{ total?: number; data?: ISemanticScholarPaper[] }>(context) : undefined;
			if (!answer) {
				return { problem, busy: true };
			}
			// It searches titles and abstracts together: for titles alone, the titles of the papers it sent are checked
			const inTitle = query.searchIn === 'title' ? titleMatcher(query.topic) : undefined;
			const papers = (answer.data ?? []).filter(paper => paper.title && paper.year
				&& !paper.publicationTypes?.every(type => SEMANTIC_SCHOLAR_LEFT_OUT.has(type))
				&& (!inTitle || inTitle(paper.title)));
			const articles = papers.slice(0, LISTED).map(semanticScholarArticle);
			if (!inTitle) {
				return { articles, found: answer.total ?? articles.length };
			}
			const sent = answer.data?.length ?? 0;
			return { articles, found: papers.length, checkedOf: (answer.total ?? 0) > sent ? answer.total : undefined };
		} catch {
			return { problem, busy: true };
		}
	};

	/**
	 * Semantic Scholar's works citing any version of a work, the first thousand it lists of each version, together, those
	 * that meet the query, the most cited first: its citations list takes no filters. A version it has no record of is
	 * left out. Each request is asked `attempts` times while it is busy.
	 */
	const searchCitingSemanticScholar = async (query: IDiscoverQuery, cites: readonly ICitedWork[], attempts?: number, abandoned?: () => boolean): Promise<IndexAnswer> => {
		const unknown = localize('discover.semanticScholarUnknown', "Semantic Scholar has no record of this work.");
		const problem = localize('discover.semanticScholarNotReached', "Semantic Scholar could not be reached, or is too busy just now.");
		const records = [...new Set(cites.flatMap(version => version.semanticScholarId ? [version.semanticScholarId] : version.doi ? [`DOI:${version.doi}`] : []))];
		if (!records.length) {
			return { problem: unknown };
		}
		const abstracts = query.topic && query.searchIn !== 'title' ? ',abstract' : '';
		const citing = new Map<string, ISemanticScholarPaper>();
		let known = 0;
		let more = false;
		try {
			for (const record of records) {
				const context = await askSemanticScholar(`https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(record)}/citations?fields=${SEMANTIC_SCHOLAR_FIELDS},s2FieldsOfStudy${abstracts}&limit=${CITING_LISTED}`, undefined, attempts, abandoned);
				if (context?.res.statusCode === 404) {
					continue;
				}
				const answer = context && isSuccess(context) ? await asJson<{ next?: number; data?: { citingPaper?: ISemanticScholarPaper }[] }>(context) : undefined;
				if (!answer) {
					return { problem, busy: true };
				}
				known++;
				more ||= typeof answer.next === 'number';
				for (const citation of answer.data ?? []) {
					if (citation.citingPaper?.paperId) {
						citing.set(citation.citingPaper.paperId, citation.citingPaper);
					}
				}
			}
		} catch {
			return { problem, busy: true };
		}
		if (!known) {
			return { problem: unknown };
		}
		const topic = query.topic ? titleMatcher(query.topic) : undefined;
		const papers = [...citing.values()]
			.filter(paper => paper.title && !paper.publicationTypes?.every(type => SEMANTIC_SCHOLAR_LEFT_OUT.has(type)) && citingPaperMeets(paper, query, topic))
			.sort((a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0));
		return { articles: papers.slice(0, LISTED).map(semanticScholarArticle), found: papers.length, citingChecked: more ? CITING_LISTED : undefined };
	};

	/** OpenAlex's id of the cited work, by its DOI when the page has none: its citing works are filtered by it. */
	const citedOpenAlexId = async (cites: ICitedWork): Promise<string | undefined> => {
		if (cites.openAlexId || !cites.doi) {
			return cites.openAlexId;
		}
		try {
			const context = await providers.ask(KEYS.openAlex, { url: `https://api.openalex.org/works/doi:${encodeURIComponent(cites.doi)}?select=id` });
			const work = context && isSuccess(context) ? await asJson<Pick<IOpenAlexWork, 'id'>>(context) : undefined;
			return work?.id ? openAlexIdOf(work as IOpenAlexWork) : undefined;
		} catch {
			return undefined;
		}
	};

	/** Asks `indexes` for their counts of the articles the other alone listed in the latest search; undefined until it is listed. */
	let reconcileSources: ((indexes: readonly KeyIndex[]) => Promise<void>) | undefined;

	/** A search: only the latest one's answer is shown. */
	const search = async (asked: IDiscoverQuery) => {
		const id = ++searches;
		reconcileSources = undefined;
		// With a key of the user's, OpenAlex's budget is theirs: the page tells what is left of the shared one only
		const openAlexKeyed = !!await providers.key(KEYS.openAlex);
		const cites = asked.cites && asked.sources !== 'semanticScholar'
			? await Promise.all(asked.cites.map(async version => ({ ...version, openAlexId: await citedOpenAlexId(version) })))
			: asked.cites;
		const openAlexId = cites?.some(version => version.openAlexId);
		const query: IDiscoverQuery = { ...asked, cites };
		const openAlexUnknown: IndexAnswer = { problem: localize('discover.openAlexUnknown', "OpenAlex has no record of this work, or could not be reached.") };
		const [openAlex, semanticScholar] = await Promise.all([
			query.sources === 'semanticScholar' ? undefined : cites && !openAlexId ? openAlexUnknown : searchOpenAlex(query),
			query.sources === 'openAlex' ? undefined : cites ? searchCitingSemanticScholar(query, cites) : searchSemanticScholar(query),
		]);
		if (searches !== id) {
			return;
		}
		// Semantic Scholar too busy for the search, it is asked again in the background, OpenAlex's articles listed meanwhile
		const retrying = !!semanticScholar && hasKey(semanticScholar, { problem: true }) && !!semanticScholar.busy && !!openAlex && hasKey(openAlex, { articles: true });
		await present(retrying ? undefined : semanticScholar, retrying ? 'searching' : undefined, 'results');
		if (!retrying || searches !== id) {
			return;
		}
		const again = cites ? await searchCitingSemanticScholar(query, cites, 4, () => searches !== id) : await searchSemanticScholar(query, 4, () => searches !== id);
		if (searches === id) {
			await present(again, undefined, 'counts');
		}

		/**
		 * The table of the two answers, posted as `command`: 'results' a new one, 'counts' the same filled in. `pending`, while
		 * Semantic Scholar's search is asked again.
		 */
		async function present(semanticScholar: IndexAnswer | undefined, pending: 'searching' | undefined, command: 'results' | 'counts'): Promise<void> {
			const answered = [openAlex, semanticScholar].filter(answer => answer && hasKey(answer, { articles: true }));
			const problems = [openAlex, semanticScholar].flatMap(answer => answer && hasKey(answer, { problem: true }) ? [answer.problem] : []);
			// The indexes that gave nothing this time, whose columns the page shows marked
			const unavailable: KeyIndex[] = [...(openAlex && hasKey(openAlex, { problem: true }) ? ['openAlex' as const] : []), ...(semanticScholar && hasKey(semanticScholar, { problem: true }) ? ['semanticScholar' as const] : [])];
			// The notification, not the page, tells what a key would change
			const semanticScholarKeyless = !await secretStorageService.get(KEYS.semanticScholar.credential.secretKey);
			const keyAdvice = unavailable.includes('semanticScholar') && semanticScholarKeyless;
			if (searches !== id) {
				return;
			}
			if (!answered.length) {
				tellProblems(problems, keyAdvice);
				webviewInput.webview.postMessage({ command: 'error', message: problems.join(' ') });
				return;
			}
			const notes: string[] = [];
			const counted = (name: string, answer: IndexAnswer | undefined) => {
				if (answer && hasKey(answer, { articles: true })) {
					notes.push(answer.found > LISTED
						? localize('discover.foundMany', "{0}: {1} articles found, the {2} most cited listed.", name, answer.found.toLocaleString(), LISTED)
						: localize('discover.found', "{0}: {1} articles found.", name, answer.found.toLocaleString()));
				}
			};
			counted('OpenAlex', openAlex);
			counted('Semantic Scholar', semanticScholar);
			if (semanticScholar && hasKey(semanticScholar, { articles: true }) && semanticScholar.checkedOf) {
				notes.push(localize('discover.titlesChecked', "Semantic Scholar cannot search titles alone: the titles of its 1,000 most cited of the {0} found in title or abstract were checked.", semanticScholar.checkedOf.toLocaleString()));
			}
			if (semanticScholar && hasKey(semanticScholar, { articles: true }) && semanticScholar.citingChecked) {
				notes.push(localize('discover.citingChecked', "Semantic Scholar: the first {0} works it lists as citing each version of this work were checked; it has more.", semanticScholar.citingChecked.toLocaleString()));
			}

			// The two lists merged where they have the same version: by DOI, or by title and first author when neither has a DOI, as
			// two copies of a preprint; an article Semantic Scholar alone found is left out when the query asks what only OpenAlex can
			// tell, its percentile or its journal's citedness, unless it is another version of one OpenAlex listed
			const merged = new Map<string, IFoundArticle>();
			const openAlexArticles = openAlex && hasKey(openAlex, { articles: true }) ? openAlex.articles : [];
			for (const article of openAlexArticles) {
				merged.set(article.id, article);
			}
			const openAlexOnly = query.influence !== 'any' || query.quality === 'cited' && query.cited > 0;
			const openAlexAnswered = !!openAlex && hasKey(openAlex, { articles: true });
			if (openAlexOnly && !openAlexAnswered && semanticScholar && hasKey(semanticScholar, { articles: true })) {
				notes.push(localize('discover.notApplied', "Influence and 2-Year Mean Citedness are OpenAlex's: not applied this time."));
			}
			let both = 0;
			let unchecked = 0;
			for (const article of semanticScholar && hasKey(semanticScholar, { articles: true }) ? semanticScholar.articles : []) {
				const other = merged.get(article.id)
					?? (!article.doi ? openAlexArticles.find(candidate => !candidate.doi && candidate.citedSemanticScholar === undefined && sameWork(candidate, article)) : undefined);
				if (other) {
					both++;
					merged.set(other.id, {
						...other,
						citedSemanticScholar: article.citedSemanticScholar,
						influential: article.influential,
						openUrl: readableUrl([other.openUrl, article.openUrl]),
						issns: other.issns.length ? other.issns : article.issns,
						semanticScholarId: article.semanticScholarId,
					});
				} else if (openAlexOnly && openAlexAnswered && !openAlexArticles.some(candidate => sameWork(candidate, article))) {
					unchecked++;
				} else {
					merged.set(article.id, article);
				}
			}
			if (answered.length === 2) {
				notes.push(localize('discover.merged', "{0} articles, {1} found by both.", merged.size.toLocaleString(), both.toLocaleString()));
			}
			if (unchecked) {
				notes.push(localize('discover.unchecked', "{0} found by Semantic Scholar alone are left out: Influence and 2-Year Mean Citedness are OpenAlex's, which did not list them.", unchecked.toLocaleString()));
			}

			// The citations, by each index's count, of the articles the other alone listed, and OpenAlex's journal of those
			// Semantic Scholar gives none; by DOI, of a row that is its DOI's, not a copy's. Asked only when the user reconciles
			// the sources, each index on its own, and those it answered for not asked again
			const listed = [...merged.values()];
			const unreconciled: Record<KeyIndex, Set<string>> = {
				openAlex: new Set(openAlexAnswered ? listed.filter(article => article.citedOpenAlex === undefined && article.doi === article.id).map(article => article.doi!) : []),
				semanticScholar: new Set(listed.filter(article => article.citedSemanticScholar === undefined && article.doi === article.id).map(article => article.doi!)),
			};
			const fromOpenAlex = new Map<string, IFoundArticle>();
			const counts = new Map<string, { paperId: string; cited: number; influential?: number }>();
			const asking = new Set<KeyIndex>();
			// The indexes whose last reconciling failed
			const failed = new Set<KeyIndex>();
			const reconcileProblems: Record<KeyIndex, string> = {
				openAlex: localize('discover.noOpenAlexCounts', "OpenAlex could not be reached again: the citation counts of the articles Semantic Scholar alone listed are missing."),
				// It answered the search, then asked the requests for these counts to wait
				semanticScholar: localize('discover.noInfluential', "Semantic Scholar answered the search but was too busy to give its counts of the articles OpenAlex alone found."),
			};

			/** The table, posted as `command`; `told`, the problems the notifications tell. */
			const post = (command: 'results' | 'counts', told: readonly string[], keyAdviceNow: boolean) => {
				const notesNow = [...notes];
				const problemsNow = [...problems, ...[...failed].map(index => reconcileProblems[index])];
				const { articles, versions, kept } = fill();
				if (versions) {
					notesNow.push(localize('discover.versionsNote', "{0} are other versions of a work listed, as a preprint or a copy in a repository: each with its own counts, under the work's most cited version.", versions.toLocaleString()));
				}
				if (query.quality !== 'any' && query.quality !== 'cited') {
					notesNow.push(localize('discover.inJournals', "{0} of them in the journals chosen.", kept.toLocaleString()));
				}
				const budget = openAlex && hasKey(openAlex, { articles: true }) ? openAlex.budget : undefined;
				if (budget !== undefined && !openAlexKeyed) {
					notesNow.push(localize('discover.budget', "Left of OpenAlex's shared budget today: {0}%.", Math.round(budget * 100)));
				}
				tellProblems(told, keyAdviceNow);
				// Nothing to reconcile while Semantic Scholar's search is asked again
				const reconcile = pending ? undefined : { openAlex: unreconciled.openAlex.size, semanticScholar: unreconciled.semanticScholar.size };
				webviewInput.webview.postMessage({ command, articles, notes: notesNow, problems: problemsNow, unavailable, asking: [...asking], reconcile, searchPending: pending === 'searching', recentYears: query.recentYears });
			};
			/** The rows, with the counts each index gave of the articles the other alone listed. */
			const fill = () => {
				// A record found by DOI that another row already is, as the preprint Semantic Scholar has made one with its article, is not shown twice
				const usedOpenAlex = new Set(listed.map(article => article.openAlexId));
				const usedSemanticScholar = new Set(listed.map(article => article.semanticScholarId));
				const filled = listed.map((article): IFoundArticle => {
					let other = article.doi === article.id ? fromOpenAlex.get(article.doi) : undefined;
					let count = article.doi === article.id ? counts.get(article.doi) : undefined;
					if (other && (article.citedOpenAlex !== undefined || usedOpenAlex.has(other.openAlexId))) {
						other = undefined;
					}
					if (count && (article.citedSemanticScholar !== undefined || usedSemanticScholar.has(count.paperId))) {
						count = undefined;
					}
					usedOpenAlex.add(other?.openAlexId);
					usedSemanticScholar.add(count?.paperId);
					return {
						...article,
						journal: article.journal ?? other?.journal,
						issns: article.issns.length ? article.issns : other?.issns ?? [],
						citedOpenAlex: article.citedOpenAlex ?? other?.citedOpenAlex,
						recent: article.recent ?? other?.recent,
						fwci: article.fwci ?? other?.fwci,
						percentile: article.percentile ?? other?.percentile,
						openAlexId: article.openAlexId ?? other?.openAlexId,
						citedSemanticScholar: article.citedSemanticScholar ?? count?.cited,
						influential: article.influential ?? count?.influential,
					};
				});
				// A work is kept with all its versions when one of them is in a journal chosen
				const groups = groupVersions(filled).filter(members => members.some(article => meetsQuality(query.quality, article.issns)));
				const kept = groups.flatMap(members => members.length > 1 ? members.map(article => ({ ...article, work: workOf(members[0]) })) : members);
				const articles = kept.map(({ issns, ...article }): IDiscoveredArticle => {
					const scores = issns.length ? journalScoresService.getScores(issns) : undefined;
					const journal = scores ? describeJournal(scores) : undefined;
					return {
						...article,
						journalTag: journal?.tag || undefined,
						journalDetails: journal?.details || undefined,
					};
				});
				return { articles, versions: kept.length - groups.length, kept: kept.length };
			};

			// The search's problems told once, when Semantic Scholar's search is not asked again
			post(command, pending ? [] : problems, keyAdvice);
			if (pending) {
				return;
			}
			reconcileSources = async indexes => {
				const asked = indexes.filter(index => !asking.has(index) && unreconciled[index].size);
				if (!asked.length || searches !== id) {
					return;
				}
				for (const index of asked) {
					asking.add(index);
				}
				post('counts', [], false);
				// The two at once, as they are different services: each fills in, and stops turning, when it answers
				await Promise.all(asked.map(async index => {
					const dois = [...unreconciled[index]];
					const answered = await ask(index, dois);
					if (searches !== id) {
						return;
					}
					asking.delete(index);
					if (answered) {
						for (const doi of dois) {
							unreconciled[index].delete(doi);
						}
						failed.delete(index);
					} else {
						failed.add(index);
					}
					post('counts', answered ? [] : [reconcileProblems[index]], !answered && index === 'semanticScholar' && semanticScholarKeyless);
				}));
			};
			/** Whether `index` answered for the works with `dois`; Semantic Scholar asked four times, as it asks to wait at busy times. */
			const ask = async (index: KeyIndex, dois: readonly string[]): Promise<boolean> => {
				if (index === 'openAlex') {
					const found = await getOpenAlexArticles(dois, recentSince(query));
					found?.forEach((article, doi) => fromOpenAlex.set(doi, article));
					return !!found;
				}
				const found = await getSemanticScholarCounts(dois, 4, () => searches !== id);
				found?.forEach((count, doi) => counts.set(doi, count));
				return !!found;
			};
		}
	};

	/**
	 * What went wrong in a search, shown as it comes and kept in the notifications, where it stays after the page has moved
	 * on; with `keyAdvice`, what a Semantic Scholar key would change, and Add Key...
	 */
	const tellProblems = (problems: readonly string[], keyAdvice: boolean) => {
		if (!problems.length) {
			return;
		}
		const advice = keyAdvice ? [localize('discover.semanticScholarWaitWithoutKey', "Without a key, Semantic Scholar asks searches to wait at busy times; a key has a rate of its own.")] : [];
		notificationService.notify({
			severity: Severity.Warning,
			message: localize('discover.problemsNotification', "Discover Literature: {0}", [...problems, ...advice].join(' ')),
			actions: keyAdvice ? { primary: [toAction({ id: 'discover.addSemanticScholarKey', label: localize('discover.addKey', "Add Key..."), run: () => askKey('semanticScholar') })] } : undefined,
		});
	};

	/** Ask for the key of `index`, kept in the system's keychain; an empty one forgets it. */
	const askKey = async (index: KeyIndex) => {
		const key = await quickInputService.input({
			password: true,
			title: index === 'openAlex' ? localize('discover.keyTitle', "OpenAlex: API Key") : localize('discover.semanticScholarKeyTitle', "Semantic Scholar: API Key"),
			prompt: localize('discover.keyPrompt', "Kept in the system's keychain. Leave it empty to forget the key."),
			ignoreFocusLost: true,
		});
		if (key !== undefined) {
			if (key.trim()) {
				await secretStorageService.set(KEYS[index].credential.secretKey, key.trim());
			} else {
				await secretStorageService.delete(KEYS[index].credential.secretKey);
			}
			await postState();
		}
	};

	disposables.add(webviewInput.webview.onMessage(async (e: { message: DiscoverMessage }) => {
		const message = e.message;
		switch (message.command) {
			case 'ready':
				await postState();
				break;
			case 'search':
				await search(checkQuery(message.query));
				break;
			case 'reconcile':
				if (Array.isArray(message.indexes)) {
					await reconcileSources?.(message.indexes.filter(index => index === 'openAlex' || index === 'semanticScholar'));
				}
				break;
			case 'setKey':
				if (KEYS[message.index]) {
					await askKey(message.index);
				}
				break;
			case 'getKey':
				if (KEYS[message.index]) {
					await commandService.executeCommand(OPEN_LINK_COMMAND_ID, KEYS[message.index].keyPage);
				}
				break;
			case 'rows':
				storeRows(storageService, 'discover', message.rows);
				break;
			case 'openUrl':
				if (/^https?:\/\//.test(message.url)) {
					await commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
				}
				break;
			case 'abstract':
				if (typeof message.id === 'string') {
					webviewInput.webview.postMessage({ command: 'abstract', id: message.id, ...await abstractsOf(message.id) });
				}
				break;
			case 'import':
				if (typeof message.text === 'string') {
					const answer = await importReferences(message.text, message.lookUp === true);
					webviewInput.webview.postMessage({ command: 'imported', message: answer.notes.join(' '), error: answer.failed, clear: !answer.failed });
				}
				break;
			case 'chooseFile':
				await chooseFiles(message.lookUp === true);
				break;
			case 'lookUp':
				if (Array.isArray(message.ids)) {
					const notes = await lookUp(message.ids.filter(id => typeof id === 'string'));
					webviewInput.webview.postMessage({ command: 'imported', message: notes.join(' '), error: false });
				}
				break;
			case 'pick': {
				const selected = getSelected();
				if (typeof message.article?.id === 'string' && !selected.some(article => article.id === message.article.id)) {
					setSelected([...selected, message.article]);
				}
				break;
			}
			case 'unpick':
				if (Array.isArray(message.ids)) {
					setSelected(getSelected().filter(article => !message.ids.includes(article.id)));
				}
				break;
			case 'save':
				if (Array.isArray(message.ids)) {
					await save(message.ids.filter(id => typeof id === 'string'));
				}
				break;
			case 'checkSaved':
				webviewInput.webview.postMessage({ command: 'inReferences', saved: await getSaved() });
				break;
			case 'browse':
				if (Array.isArray(message.ids)) {
					await browse(message.ids.filter(id => typeof id === 'string'));
				}
				break;
			case 'snowball':
				if (Array.isArray(message.ids)) {
					await snowball(message.ids.filter(id => typeof id === 'string'));
				}
				break;
			case 'copyBibtex':
			case 'openPdfs':
			case 'panels':
				if (Array.isArray(message.ids)) {
					const ids = message.ids.filter(id => typeof id === 'string');
					await (message.command === 'copyBibtex' ? copyBibtex(ids) : message.command === 'openPdfs' ? openPdfs(ids) : postPanels(ids));
				}
				break;
			case 'openPanel':
				if (typeof message.id === 'string') {
					await openPanel(message.id);
				}
				break;
			case 'showInPanels':
				if (Array.isArray(message.ids) && Array.isArray(message.panels)) {
					await showInPanels(message.ids.filter(id => typeof id === 'string'), message.panels.filter(id => typeof id === 'string'));
				}
				break;
		}
	}));
}

function pageHtml(mode: PageMode, rows: number): string {
	const year = new Date().getFullYear();
	const text = {
		mode,
		title: mode === 'import' ? localize('import.title', "Import References") : localize('discover.title', "Discover Literature"),
		intro: mode === 'import'
			? localize('import.intro', "References you bring, from BibTeX (or BibLaTeX), RIS, CSL-JSON or a list of DOIs, the format told by the text itself. They can be looked up in OpenAlex and Semantic Scholar, two free, open indexes of scholarly works, for their citation counts and the fields your file lacks, or kept just as your file has them. The actions below work on the ticked ones.")
			: localize('discover.intro', "The most cited articles on a topic, from OpenAlex and Semantic Scholar, two free, open indexes of scholarly works, with how they stand against the articles of their field and year and how many citations build on them. Tick the ones you want to select them and have them in Actions."),
		sources: localize('discover.sources', "Indexes"),
		bothSources: localize('discover.bothSources', "OpenAlex and Semantic Scholar"),
		sourcesHint: localize('discover.sourcesHint', "Together they find more: each lists its 200 most cited, and the two lists are merged. Semantic Scholar's fields are broader than OpenAlex's; Influence and 2-Year Mean Citedness are OpenAlex's."),
		topic: localize('discover.topic', "Topic"),
		searchIn: localize('discover.searchIn', "Search In"),
		inTitleAndAbstract: localize('discover.inTitleAndAbstract', "Title and Abstract"),
		inTitle: localize('discover.inTitle', "Title"),
		topicHint: localize('discover.topicHint', "Words in the title or abstract. AND, or a space, takes articles with all the words: bootstrap AND jackknife; OR takes either: bootstrap OR jackknife. Quotes keep a phrase together: \"instrumental variables\" finds the phrase, instrumental AND variables the two words anywhere."),
		field: localize('discover.field', "Field"),
		anyField: localize('discover.anyField', "Any Field"),
		fieldHint: localize('discover.fieldHint', "OpenAlex's field of the article's main topic."),
		years: localize('discover.years', "Years"),
		from: localize('discover.from', "From"),
		to: localize('discover.to', "To"),
		citations: localize('discover.citations', "Citations"),
		atLeast: localize('discover.atLeast', "At Least"),
		citationsHint: localize('discover.citationsHint', "Times cited since publication, as each index counts them."),
		recentCitations: localize('discover.recentCitations', "Recent Citations"),
		inTheLast: localize('discover.inTheLast', "In the Last"),
		yearsUnit: localize('discover.yearsUnit', "Years"),
		recentHint: localize('discover.recentHint', "Not a criterion of the search: a column of the results, the citations in the last years, up to ten, this year included, to show whether a classic is still cited today. OpenAlex counts citations year by year for the last ten years; Semantic Scholar does not."),
		recentColumn: localize('discover.recentColumn', "Last {0} Years"),
		recentColumnHint: localize('discover.recentColumnHint', "Times cited in the last {0} years, this year included (OpenAlex)"),
		influence: localize('discover.influence', "Influence"),
		anyInfluence: localize('discover.anyInfluence', "Any"),
		top10: localize('discover.top10', "Top 10% of Its Field and Year"),
		top1: localize('discover.top1', "Top 1% of Its Field and Year"),
		influenceHint: localize('discover.influenceHint', "By OpenAlex's citation percentile, against the articles of the same field and year. Semantic Scholar's influential citations, those that build on the article, are in their own column."),
		quality: localize('discover.quality', "Journal Ranking"),
		anyJournal: localize('discover.anyJournal', "Any Journal"),
		cited: localize('discover.cited', "2-Year Mean Citedness Above"),
		level2: localize('discover.level2', "Norwegian Level 2 (Leading)"),
		level1: localize('discover.level1', "Norwegian Level 1 or 2"),
		sjrQ1: localize('discover.sjrQ1', "SJR Q1"),
		sjrQ2: localize('discover.sjrQ2', "SJR Q1 or Q2"),
		qualityHint: localize('discover.qualityHint', "OpenAlex's 2-year mean citedness of the journal, close to an impact factor, needs nothing installed. The Norwegian register's levels come with the PollisJournals database, and SJR's quartiles once SCImago's file is imported (Databases: Import Journal Metrics...). These two are checked on the articles listed."),
		noSjr: localize('discover.noSjr', "SJR: SCImago's file not imported."),
		openOnly: localize('discover.openOnly', "Only Articles Anyone Can Read"),
		openOnlyHint: localize('discover.openOnlyHint', "Articles you can read at no cost, from the publisher or a repository."),
		key: localize('discover.key', "OpenAlex Key"),
		noKey: localize('discover.noKey', "No key: searches share OpenAlex's free budget of about 100 searches, with everyone on your network. A free key, which OpenAlex gives for your email, has a much larger free budget of its own; Pollis keeps it in the system's keychain."),
		hasKey: localize('discover.hasKey', "Your key is set: a free budget of its own."),
		semanticScholarKey: localize('discover.semanticScholarKey', "Semantic Scholar Key"),
		unavailableIndex: localize('discover.unavailableIndex', "Gave nothing for this search: see the note above the table"),
		countsPending: localize('discover.countsPending', "Asking Semantic Scholar for its counts of the articles OpenAlex alone found: they fill in when they come"),
		countsPendingOpenAlex: localize('discover.countsPendingOpenAlex', "Asking OpenAlex for its counts of the articles Semantic Scholar alone found: they fill in when they come"),
		reconcile: localize('discover.reconcile', "Reconcile Sources"),
		reconcileHint: localize('discover.reconcileHint', "Asks each source, both at once, for its counts of the articles the other alone found"),
		reconcileOpenAlex: localize('discover.reconcileOpenAlex', "OpenAlex ({0})"),
		reconcileOpenAlexHint: localize('discover.reconcileOpenAlexHint', "Asks OpenAlex for its counts of the {0} articles Semantic Scholar alone found"),
		reconcileSemanticScholar: localize('discover.reconcileSemanticScholar', "Semantic Scholar ({0})"),
		reconcileSemanticScholarHint: localize('discover.reconcileSemanticScholarHint', "Asks Semantic Scholar for its counts of the {0} articles OpenAlex alone found"),
		searchPending: localize('discover.searchPending', "Semantic Scholar was too busy for the search: asking it again, a little later each time; its articles and counts fill in when they come"),
		noSemanticScholarKey: localize('discover.noSemanticScholarKey', "No key: searches share Semantic Scholar's pool with everyone who has none, and at busy times it asks them to wait. A free key, which Semantic Scholar gives on a form asking your name, email and use, has a rate of its own; Pollis keeps it in the system's keychain."),
		hasSemanticScholarKey: localize('discover.hasSemanticScholarKey', "Your key is set: a rate of its own."),
		setKey: localize('discover.setKey', "Set Key..."),
		changeKey: localize('discover.changeKey', "Change Key..."),
		getKey: localize('discover.getKey', "Get a Free Key"),
		search: localize('discover.search', "Search"),
		searching: localize('discover.searching', "Searching..."),
		results: localize('discover.results', "Articles"),
		noResults: localize('discover.noResults', "Nothing found."),
		pick: localize('discover.pick', "Select"),
		year: localize('discover.year', "Year"),
		sortHint: sortHint(),
		article: localize('discover.article', "Article"),
		journal: localize('discover.journal', "Journal"),
		openAlex: localize('discover.openAlexColumns', "OpenAlex"),
		semanticScholar: localize('discover.semanticScholarColumns', "Semantic Scholar"),
		sincePublishing: localize('discover.sincePublishing', "Since Publishing"),
		sincePublishingHint: localize('discover.sincePublishingHint', "Times cited since publication"),
		influential: localize('discover.influential', "Influential"),
		fwci: localize('discover.fwci', "FWCI"),
		percentile: localize('discover.percentile', "Percentile"),
		influentialHint: localize('discover.influentialHint', "Citations that build on the article (Semantic Scholar)"),
		fwciHint: localize('discover.fwciHint', "Field-weighted citation impact: its citations over those of the average article of its field and year (OpenAlex)"),
		percentileHint: localize('discover.percentileHint', "Its citation percentile against the articles of its field and year (OpenAlex)"),
		openRead: localize('discover.openRead', "Read"),
		oneVersion: localize('discover.oneVersion', "+1 version"),
		versions: localize('discover.versions', "+{0} versions"),
		hideVersions: localize('discover.hideVersions', "Hide versions"),
		versionsHint: localize('discover.versionsHint', "Other records of this work, as its preprint or a copy in a repository, each with its own counts: never added up"),
		published: localize('discover.published', "Published"),
		preprint: localize('discover.preprint', "Preprint"),
		workingPaper: localize('discover.workingPaper', "Working paper"),
		repository: localize('discover.repository', "Repository copy"),
		versionIn: localize('discover.versionIn', "{0} in {1}"),
		onlyAs: localize('discover.onlyAs', "{0} has it only as its {1}"),
		onlyAsIn: localize('discover.onlyAsIn', "{0} has it only as its {1}, in {2}"),
		asPublished: localize('discover.asPublished', "published version"),
		asPreprint: localize('discover.asPreprint', "preprint"),
		asWorkingPaper: localize('discover.asWorkingPaper', "working paper"),
		asRepository: localize('discover.asRepository', "repository copy"),
		bothIndexes: localize('discover.bothIndexes', "OpenAlex and Semantic Scholar"),
		abstract: localize('discover.abstract', "Abstract"),
		abstractFrom: localize('discover.abstractFrom', "From {0}"),
		abstractLoading: localize('discover.abstractLoading', "Asking OpenAlex and Semantic Scholar for its abstract..."),
		noAbstract: localize('discover.noAbstract', "Neither OpenAlex nor Semantic Scholar has its abstract."),
		noAbstractFrom: localize('discover.noAbstractFrom', "{0} has no abstract of it."),
		unreachable: localize('discover.abstractUnreachable', "{0} could not be reached, or is too busy just now."),
		tryAgain: localize('discover.tryAgain', "Try Again"),
		sortedByCited: localize('discover.sortedByCited', "Sorted by the larger of the two Since Publishing counts; click a heading to sort by it."),
		noSearchWords: localize('discover.noSearchWords', "None of the search words is in this abstract: the index found them elsewhere, or in a longer text than it gives."),
		previous: localize('discover.previous', "Previous"),
		next: localize('discover.next', "Next"),
		pageOf: localize('discover.pageOf', "Page {0} of {1}"),
		etAl: localize('discover.etAl', "{0} et al."),
		selected: localize('discover.actions', "Actions"),
		noSelected: localize('discover.noSelected', "None yet: tick an article to select it."),
		actOn: localize('discover.actOn', "Act on this article"),
		actOnHint: localize('discover.actOnHint', "The actions below work on the ticked articles; an unticked one stays in this table, and \u00d7 removes it."),
		subset: localize('discover.subset', "Select"),
		subsetHint: localize('discover.subsetHint', "The selected articles the actions below work on"),
		see: localize('discover.see', "See in References"),
		seeHint: localize('discover.seeHint', "Shows the ticked articles already in your references (all_references in the PollisReferences database) in Browse References; nothing is saved"),
		showInPanel: localize('discover.showInPanel', "Show in Panel..."),
		showInPanelHint: localize('discover.showInPanelHint', "Lists the panels whose References can show the ticked articles, for you to choose; those not in your references are saved there only when you confirm"),
		chooserHint: localize('discover.chooserHint', "Tick the panels whose References should show the ticked articles. Open shows a panel without choosing it; nothing is saved until you confirm."),
		panelFilter: localize('discover.panelFilter', "Search panels by name, menu or model"),
		panelsLoading: localize('discover.panelsLoading', "Listing the panels..."),
		noPanels: localize('discover.noPanels', "No panel matches."),
		openPanel: localize('discover.openPanel', "Open"),
		panelCitesOne: localize('discover.panelCitesOne', "Cites 1 work"),
		panelCites: localize('discover.panelCites', "Cites {0} works"),
		panelCitesTickedOne: localize('discover.panelCitesTickedOne', "already shows 1 of the ticked articles"),
		panelCitesTicked: localize('discover.panelCitesTicked', "already shows {0} of the ticked articles"),
		showInOnePanel: localize('discover.showInOnePanel', "Show in 1 Panel"),
		showInPanels: localize('discover.showInPanels', "Show in {0} Panels"),
		chooseNoPanel: localize('discover.chooseNoPanel', "Show in Panels"),
		cancelChooser: localize('discover.cancelChooser', "Cancel"),
		copyBibtex: localize('discover.copyBibtex', "Copy BibTeX"),
		copyBibtexHint: localize('discover.copyBibtexHint', "Copies the BibTeX entries of the ticked articles, ready to paste into a paper; nothing is saved to your references"),
		openPdfs: localize('discover.openPdfs', "Open PDFs"),
		openPdfsHint: localize('discover.openPdfsHint', "Opens the open-access copies of the ticked articles in the internal browser"),
		snowball: localize('discover.snowball', "Snowball Search..."),
		snowballHint: localize('discover.snowballHint', "Opens the Snowball Search Map with the ticked articles as seeds; those not in your references are kept in the map, not saved"),
		tickAll: localize('discover.tickAll', "Tick all or none"),
		removeArticle: localize('discover.removeArticle', "Remove from this table"),
		save: localize('discover.save', "Save to PollisReferences"),
		saveHint: localize('discover.saveHint', "Saves the ticked articles not yet in your references"),
		saving: localize('discover.saving', "Saving..."),
		notSaved: localize('discover.notSaved', "{0} could not be saved to your references."),
		noImported: localize('import.noImported', "None yet: import references above."),
		paste: localize('import.paste', "Paste"),
		files: localize('import.files', "Files"),
		filesHint: localize('import.filesHint', "{0}, {1}, {2} or {3}, one or many.", '<code>.bib</code>', '<code>.ris</code>', '<code>.json</code>', '<code>.txt</code>'),
		pasteHint: localize('import.pasteHint', "{0} or {1} entries, {2} records, {3}, or DOIs, one or many, with or without {4}.", '<code>BibTeX</code>', '<code>BibLaTeX</code>', '<code>RIS</code>', '<code>CSL-JSON</code>', '<code>https://doi.org/</code>'),
		importPasted: localize('import.importPasted', "Import"),
		chooseFile: localize('import.chooseFile', "Choose Files..."),
		importing: localize('import.importing', "Importing..."),
		lookUp: localize('import.lookUp', "Look Up in OpenAlex and Semantic Scholar"),
		lookUpHint: localize('import.lookUpHint', "By DOI, a hundred to a request, or else by title, one request each: for citation counts, journal rankings, open-access copies, and the fields your file lacks; your file's fields are kept. Unticked, the references are kept as your file has them, and nothing is sent; a list of DOIs is always looked up, as a DOI alone has no title."),
		tick: localize('import.tick', "Tick"),
		tickAllLink: localize('import.tickAll', "All"),
		tickNone: localize('import.tickNone', "None"),
		tickFound: localize('import.tickFound', "Found"),
		tickNotFound: localize('import.tickNotFound', "Not Found"),
		tickUnchecked: localize('import.tickUnchecked', "Not Looked Up"),
		tickUnsaved: localize('import.tickUnsaved', "Not Yet Saved"),
		tickedCount: localize('import.tickedCount', "{0} of {1} ticked"),
		lookUpTicked: localize('import.lookUpTicked', "Look Up Ticked"),
		lookUpTickedHint: localize('import.lookUpTickedHint', "Looks up the ticked references in OpenAlex and Semantic Scholar, again for those looked up already"),
		removeUnticked: localize('import.removeUnticked', "Remove Unticked..."),
		removeQuestion: localize('import.removeQuestion', "Remove the {0} unticked references from this table? Your references (PollisReferences) keep those saved there."),
		removeQuestionOne: localize('import.removeQuestionOne', "Remove the unticked reference from this table? Your references (PollisReferences) keep it if it is saved there."),
		remove: localize('import.remove', "Remove"),
		matchDoi: localize('import.matchDoi', "Found in OpenAlex by DOI"),
		matchTitle: localize('import.matchTitle', "Found in OpenAlex by title"),
		matchNone: localize('import.matchNone', "Not found in OpenAlex"),
		matchUnchecked: localize('import.matchUnchecked', "Not looked up"),
		citedIn: localize('import.citedIn', "cited {0} ({1})"),
		inReferences: localize('import.inReferences', "In your references"),
	};
	const fields = [...FIELDS].sort((a, b) => a[1].localeCompare(b[1]));
	const searchForm = `	<div class="pane">
		<div class="formGrid">
			<label for="sources">${text.sources}</label>
			<div>
				<select id="sources"><option value="both">${text.bothSources}</option><option value="openAlex">OpenAlex</option><option value="semanticScholar">Semantic Scholar</option></select>
				<div class="hint">${text.sourcesHint}</div>
			</div>
			<label for="topic">${text.topic}</label>
			<div>
				<div class="row"><input type="text" id="topic" spellcheck="false" autocomplete="off"><select id="searchIn" aria-label="${text.searchIn}"><option value="titleAndAbstract">${text.inTitleAndAbstract}</option><option value="title">${text.inTitle}</option></select></div>
				<div class="hint">${text.topicHint}</div>
			</div>
			<label for="field">${text.field}</label>
			<div>
				<select id="field"><option value="0">${text.anyField}</option>${fields.map(([id, name]) => `<option value="${id}">${name}</option>`).join('')}</select>
				<div class="hint">${text.fieldHint}</div>
			</div>
			<span>${text.years}</span>
			<div class="row"><label for="from">${text.from}</label><input type="number" id="from" min="1600" max="${year}" value="1950"><label for="to">${text.to}</label><input type="number" id="to" min="1600" max="${year}" value="${year}"></div>
			<label for="citations">${text.citations}</label>
			<div><div class="row"><span>${text.atLeast}</span><input type="number" id="citations" min="0" step="100" value="100"></div><div class="hint">${text.citationsHint}</div></div>
			<label for="influence">${text.influence}</label>
			<div>
				<select id="influence"><option value="any">${text.anyInfluence}</option><option value="top10">${text.top10}</option><option value="top1">${text.top1}</option></select>
				<div class="hint">${text.influenceHint}</div>
			</div>
			<label for="quality">${text.quality}</label>
			<div>
				<div class="row">
					<select id="quality">
						<option value="any">${text.anyJournal}</option>
						<option value="cited">${text.cited}</option>
						<option value="level2">${text.level2}</option>
						<option value="level1">${text.level1}</option>
						<option value="sjrQ1">${text.sjrQ1}</option>
						<option value="sjrQ2">${text.sjrQ2}</option>
					</select>
					<input type="number" id="cited" min="0" step="0.5" value="3" aria-label="${text.cited}" hidden>
				</div>
				<div class="hint">${text.qualityHint} <span id="noSjr" hidden>${text.noSjr}</span></div>
			</div>
			<span></span>
			<div><label><input type="checkbox" id="openOnly"> ${text.openOnly}</label><div class="hint">${text.openOnlyHint}</div></div>
			<div class="separator"></div>
			<label for="recentYears">${text.recentCitations}</label>
			<div><div class="row"><span>${text.inTheLast}</span><input type="number" id="recentYears" min="1" max="10" value="5"><span>${text.yearsUnit}</span></div><div class="hint">${text.recentHint}</div></div>
			<span>${text.key}</span>
			<div class="hint" id="openAlexKey"></div>
			<span>${text.semanticScholarKey}</span>
			<div class="hint" id="semanticScholarKey"></div>
			<span></span>
			<div><button class="action primary" id="search" disabled>${text.search}</button></div>
		</div>
		<div class="status" id="status" hidden></div>
	</div>

	<div id="results" hidden>
		<div class="sectionHeader">
			<h2>${text.results}</h2>
			<div class="reconcile" id="reconcile" hidden>
				<button id="reconcileBoth" title="${text.reconcileHint}">${text.reconcile}</button>
				<div class="sources"><button id="reconcileOpenAlex"></button><button id="reconcileSemanticScholar"></button></div>
			</div>
		</div>
		<div class="sortNote" id="sortNote">${text.sortedByCited}</div>
		<div id="pagerAbove"></div>
		<table id="resultsTable" class="stickyHead">
			<thead id="resultsHead"></thead>
			<tbody id="items"></tbody>
		</table>
		<div id="pagerUnder"></div>
		<div class="empty" id="noResults" hidden>${text.noResults}</div>
	</div>`;
	const importForm = `	<div class="pane" id="importPane">
		<div class="formGrid">
			<span>${text.files}</span>
			<div><button class="action current" id="chooseFile">${text.chooseFile}</button><div class="hint">${text.filesHint}</div></div>
			<label for="pasted">${text.paste}</label>
			<div>
				<textarea id="pasted" spellcheck="false" autocomplete="off"></textarea>
				<div class="hint">${text.pasteHint}</div>
			</div>
			<span></span>
			<div><label><input type="checkbox" id="lookUp" checked> ${text.lookUp}</label><div class="hint">${text.lookUpHint}</div></div>
			<span>${text.key}</span>
			<div class="hint" id="openAlexKey"></div>
			<span>${text.semanticScholarKey}</span>
			<div class="hint" id="semanticScholarKey"></div>
			<span></span>
			<div class="row"><button class="action" id="importPasted" disabled>${text.importPasted}</button></div>
		</div>
		<div class="status" id="status" hidden></div>
	</div>`;
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		${voiceButtonsCss}
		${rowsChoiceCss}
		${stickyHeadCss}
		${sortHeadingsCss}
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 1200px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		h2 { font-size: 18px; font-weight: 400; margin: 0; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 24px 0; line-height: 1.4; max-width: 900px; }
		[hidden] { display: none !important; }
		.sectionHeader { display: flex; align-items: baseline; gap: 16px; margin: 24px 0 8px 0; }
		.sectionHeader h2 { flex: 1; }
		.pane { padding: 16px; border-radius: 4px; background: var(--vscode-welcomePage-tileBackground, var(--vscode-editorWidget-background)); }
		.formGrid { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 12px 16px; align-items: baseline; }
		.separator { grid-column: 1 / -1; border-top: 1px solid var(--vscode-textLink-foreground); }
		/* The formats and extensions read, in the yellow of the menu paths of Add Feed and Journal Metrics */
		code { font: inherit; color: #e8a33d; }
		body.vscode-light code { color: #a8650d; }
		.hint { font-size: 12px; color: var(--vscode-descriptionForeground); margin-top: 4px; line-height: 1.4; max-width: 760px; }
		.row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
		input[type="text"], input[type="number"], select { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 4px 6px; }
		input:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		input#topic { width: 480px; max-width: 100%; }
		input[type="number"] { width: 100px; }
		select { width: 300px; }
		button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; border-radius: 2px; padding: 4px 12px; cursor: pointer; }
		button.action:hover { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.primary:hover { background: var(--vscode-button-hoverBackground); }
		button:disabled, button:disabled:hover { opacity: 0.5; cursor: default; }
		td.actions { white-space: nowrap; }
		th input, td input { margin: 0 4px 0 0; vertical-align: middle; }
		button.removeArticle { font: inherit; font-size: 14px; line-height: 1; color: var(--vscode-descriptionForeground); background: none; border: none; padding: 0 4px; cursor: pointer; }
		button.removeArticle:hover { color: var(--vscode-foreground); }
		.actionBar { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 8px 0; }
		/* The actions on the ticked articles in one row, as wide as the page, each as wide as the others */
		#actionBar { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); }
		/* The actions on the ticked articles look as the code buttons below a panel's Example Code */
		#actionBar > button.action { font-size: 11px; padding: 4px 10px; border-radius: 4px; box-shadow: inset 0 0 0 1px var(--vscode-button-background); opacity: 0.7; }
		#actionBar > button.action:not(:disabled):hover, #actionBar > button.action.current { opacity: 1; }
		#actionBar > button.action:disabled { opacity: 0.35; }
		/* The arrow of an action that leaves the page, drawn here as \\curvearrowright: the system fonts draw it oddly */
		.leaves { width: 1.3em; height: 1em; vertical-align: -0.12em; margin-right: 4px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
		/* One action blue: the first at first, then the last enabled one the pointer was on */
		.actionBar > button.action.current, #importPane button.action.current, #removeConfirm > button.action.current { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		/* Import, before there is anything to import, is a greyed blue button */
		#importPane button.action:disabled { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		.savedMark { color: var(--vscode-descriptionForeground); }
		.chooser { margin: 8px 0; }
		.chooser input#panelFilter { width: 480px; max-width: 100%; margin: 8px 0; }
		.panelList { max-height: 360px; overflow-y: auto; border-top: 1px solid var(--vscode-widget-border); }
		.panelRow { display: flex; align-items: flex-start; gap: 8px; padding: 6px 4px; border-bottom: 1px solid var(--vscode-widget-border); }
		.panelRow > label { flex: 1; display: flex; gap: 8px; cursor: pointer; min-width: 0; }
		.panelRow > label > div { min-width: 0; }
		.panelPath, .panelMeta { font-size: 11px; color: var(--vscode-descriptionForeground); }
		.panelDescription { font-size: 12px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.panelMeta .citesTicked { color: var(--vscode-charts-purple); }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; text-align: left; }
		.link:hover { text-decoration: underline; }
		.hint .link { font-size: 12px; }
		.pager { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 12px 8px; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.pager .link { font-size: 12px; }
		.pager .link:disabled { color: var(--vscode-disabledForeground); cursor: default; text-decoration: none; }
		.status { font-size: 12px; color: var(--vscode-descriptionForeground); margin-top: 8px; line-height: 1.4; }
		/* No articles at all in red; what is missing from a table in amber */
		.status.error { color: var(--vscode-errorForeground); }
		.status .problem { color: var(--vscode-editorWarning-foreground); }
		/* Turning while an index is still asked for counts */
		${spinnerCss}
		table { width: 100%; border-collapse: collapse; font-size: 12px; }
		th { text-align: left; font-weight: normal; color: var(--vscode-descriptionForeground); padding: 4px 8px; border-bottom: 1px solid var(--vscode-widget-border); white-space: nowrap; }
		th.group { text-align: center; color: var(--vscode-foreground); }
		th.number, td.number { text-align: right; }
		/* The counts' headings in two lines when the page is narrow, rather than the articles' titles in many */
		#resultsTable th.number { white-space: normal; }
		/* The line under an index stops short of the next, so that the columns under each are seen to be its own */
		#resultsTable th.group { border-bottom: none; box-shadow: none; background-image: linear-gradient(var(--vscode-widget-border), var(--vscode-widget-border)); background-size: calc(100% - 16px) 1px; background-position: center bottom; background-repeat: no-repeat; }
		td { padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); vertical-align: top; }
		td.number { white-space: nowrap; font-variant-numeric: tabular-nums; }
		td.journal { max-width: 240px; }
		.authors { color: var(--vscode-descriptionForeground); margin-top: 2px; }
		.versionLine { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 4px; }
		.versionLine .pill { margin-left: 6px; padding: 0 6px; border-radius: 9px; border: 1px solid var(--vscode-widget-border); font-size: 11px; }
		tr.version td.title { padding-left: 20px; box-shadow: inset 2px 0 0 var(--vscode-tree-indentGuidesStroke); }
		tr.abstract td { padding: 4px 8px 12px 8px; }
		.abstractText { max-height: 240px; overflow-y: auto; font-size: 12px; line-height: 1.5; margin-bottom: 8px; }
		.abstractSource { font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 2px; }
		mark { background: var(--vscode-editor-findMatchHighlightBackground); color: inherit; }
		.tag { display: inline-block; margin-top: 4px; padding: 0 6px; font-size: 11px; border-radius: 9px; border: 1px solid var(--vscode-charts-purple); color: var(--vscode-charts-purple); }
		.sortNote { font-size: 12px; color: var(--vscode-descriptionForeground); margin: 0 8px 4px 8px; }
		.empty { color: var(--vscode-descriptionForeground); padding: 12px 8px; }
		/* Reconcile Sources over the two sources, as one button: blue, the only one in its row, the part under the pointer brighter */
		.reconcile { display: inline-flex; flex-direction: column; border-radius: 2px; overflow: hidden; color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		.reconcile button { font: inherit; color: inherit; background: none; border: none; padding: 3px 12px; cursor: pointer; }
		.reconcile button:hover:not(:disabled) { background: var(--vscode-button-hoverBackground); }
		.reconcile .sources { display: flex; border-top: 1px solid var(--vscode-button-separator, transparent); }
		.reconcile .sources button { flex: 1; font-size: 11px; white-space: nowrap; }
		.reconcile .sources button + button { border-left: 1px solid var(--vscode-button-separator, transparent); }
		textarea#pasted { width: 100%; min-height: 140px; resize: vertical; font-family: var(--vscode-editor-font-family); font-size: 12px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 6px; }
		textarea#pasted:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		/* Ticks for many references at once, above the table */
		.bulk { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; font-size: 12px; margin: 0 8px 8px 8px; color: var(--vscode-descriptionForeground); }
		.bulk .link { font-size: 12px; }
		.bulk .spacer { flex: 1; }
		.confirm { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 0 0 8px 0; }
		.confirm span { flex: 1; }
	</style>
</head>
<body>
<div class="container">
	<div class="title-row">
		<h1>${text.title}</h1>
		${voiceButtonsHtml}
	</div>
	<p class="subtitle">${text.intro}</p>

${mode === 'import' ? importForm : searchForm}
	<div class="sectionHeader"><h2>${text.selected}</h2></div>
	<div class="sortNote" id="actOnNote" hidden>${text.actOnHint}</div>
	${mode === 'import' ? `<div class="bulk" id="bulkBar" hidden>
		<span>${text.tick}:</span>
		<button class="link" data-tick="all">${text.tickAllLink}</button>
		<button class="link" data-tick="none">${text.tickNone}</button>
		<button class="link" data-tick="found">${text.tickFound}</button>
		<button class="link" data-tick="notFound">${text.tickNotFound}</button>
		<button class="link" data-tick="unchecked">${text.tickUnchecked}</button>
		<button class="link" data-tick="unsaved">${text.tickUnsaved}</button>
		<span id="tickedCount"></span>
		<span class="spacer"></span>
		<button class="link" id="lookUpTicked" title="${text.lookUpTickedHint}">${text.lookUpTicked}</button>
		<button class="link" id="removeUnticked">${text.removeUnticked}</button>
	</div>
	<div class="pane confirm" id="removeConfirm" hidden>
		<span id="removeQuestion"></span>
		<button class="action current" id="removeYes">${text.remove}</button>
		<button class="action" id="cancelRemove">${text.cancelChooser}</button>
	</div>` : ''}
	<table id="selectedTable" hidden>
		<thead><tr><th title="${text.subsetHint}"><input type="checkbox" id="tickAll" title="${text.tickAll}" aria-label="${text.tickAll}">${text.subset}</th><th>${text.year}</th><th>${text.article}</th><th>${text.journal}</th><th></th></tr></thead>
		<tbody id="selectedItems"></tbody>
	</table>
	<div class="actionBar" id="actionBar" hidden>
		<button class="action current" id="saveTicked" title="${text.saveHint}">${text.save}</button>
		<button class="action" id="seeTicked" title="${text.seeHint}">${text.see}</button>
		<button class="action" id="showInPanel" title="${text.showInPanelHint}">${text.showInPanel}</button>
		<button class="action" id="copyBibtex" title="${text.copyBibtexHint}">${text.copyBibtex}</button>
		<button class="action" id="openPdfs" title="${text.openPdfsHint}">${text.openPdfs}</button>
		<button class="action" id="snowball" title="${text.snowballHint}"><svg class="leaves" viewBox="0 0 16 12" aria-hidden="true"><path d="M2 10 C2 2.5 13 2.5 13 9.5"/><path d="M10.2 7 L13 10 L15.6 6.8"/></svg>${text.snowball}</button>
	</div>
	<div class="pane chooser" id="panelChooser" hidden>
		<div class="hint">${text.chooserHint}</div>
		<input type="text" id="panelFilter" placeholder="${text.panelFilter}" aria-label="${text.panelFilter}">
		<div class="panelList" id="panelList"></div>
		<div class="actionBar" id="chooserBar">
			<button class="action current" id="showChosen">${text.chooseNoPanel}</button>
			<button class="action" id="cancelChooser">${text.cancelChooser}</button>
		</div>
	</div>
	<div class="status" id="actionStatus" hidden></div>
	<div class="empty" id="noSelected">${mode === 'import' ? text.noImported : text.noSelected}</div>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	const TEXT = ${JSON.stringify(text)};
	const topicElement = document.getElementById('topic');
	const fieldElement = document.getElementById('field');
	const sourcesElement = document.getElementById('sources');
	const influenceElement = document.getElementById('influence');
	const qualityElement = document.getElementById('quality');
	const citedElement = document.getElementById('cited');
	const searchElement = document.getElementById('search');
	const statusElement = document.getElementById('status');
	// Import References: whether an import, or a lookup, is being made
	let importing = false;
	// The articles of the last search; the topic of the one being asked, if any
	let articles = [];
	let recentYears = 5;
	let searching = false;
	let askedTopic = '';
	// The page of the articles shown, from 0, of the rows the user chose (0 for all); back to the first on a new search or sort
	let rows = ${rows};
	let page = 0;
	${rowsChoiceScript()}
	${sortHeadingsScript()}
	// The abstracts asked for, by article id: a list, or undefined while asking; those opened; the topic searched
	const abstracts = new Map();
	const opened = new Set();
	// The works whose other versions are shown
	const expanded = new Set();
	let searchedTopic = '';
	let selected = [];
	// The selected articles in References (their keys by id), and the ids of those being saved
	let saved = new Map();
	const saving = new Set();
	// The kept articles unticked in Actions: every other kept article is acted on
	const unticked = new Set();
	// The panels the chooser lists, undefined while they are asked for, and the ids of those ticked there
	let panels;
	const chosen = new Set();
	let sjr = false;
	// At first by the larger of the two counts of citations
	let sort = { column: 'cited', descending: true };
	// The indexes that gave nothing in the last search: their columns are shown, marked
	let unavailable = [];
	// The indexes asked, as the user reconciles the sources, for their counts of the articles the other alone found
	let asking = [];
	// Of the articles listed, how many each index can still be asked about; undefined while there is nothing to reconcile
	let reconcile;
	// Whether Semantic Scholar's search is asked again, in the background
	let searchPending = false;
	// Two curved arrows, as VS Code's sync icon
	const SPINNER = '${spinnerSvg}';
	const COLUMNS = [
		{ id: 'pick', label: TEXT.pick },
		{ id: 'year', label: TEXT.year, sortable: true },
		{ id: 'title', label: TEXT.article, sortable: true },
		{ id: 'journal', label: TEXT.journal, sortable: true },
		{ id: 'citedOpenAlex', index: 'openAlex', group: TEXT.openAlex, label: TEXT.sincePublishing, sortable: true, number: true, hint: TEXT.sincePublishingHint },
		{ id: 'recent', index: 'openAlex', group: TEXT.openAlex, label: TEXT.recentColumn, sortable: true, number: true, hint: TEXT.recentColumnHint },
		{ id: 'fwci', index: 'openAlex', group: TEXT.openAlex, label: TEXT.fwci, sortable: true, number: true, digits: 1, hint: TEXT.fwciHint },
		{ id: 'percentile', index: 'openAlex', group: TEXT.openAlex, label: TEXT.percentile, sortable: true, number: true, digits: 1, hint: TEXT.percentileHint },
		{ id: 'citedSemanticScholar', index: 'semanticScholar', group: TEXT.semanticScholar, label: TEXT.sincePublishing, sortable: true, number: true, hint: TEXT.sincePublishingHint },
		{ id: 'influential', index: 'semanticScholar', group: TEXT.semanticScholar, label: TEXT.influential, sortable: true, number: true, hint: TEXT.influentialHint },
	];

	function format(template, ...values) {
		return template.replace(/\\{(\\d+)\\}/g, (match, index) => values[index] !== undefined ? String(values[index]) : match);
	}

	function setStatus(message, error, problems) {
		statusElement.textContent = message;
		statusElement.className = error ? 'status error' : 'status';
		// What went wrong after the notes, in amber
		if (problems?.length) {
			const problem = document.createElement('span');
			problem.className = 'problem';
			problem.textContent = (message ? ' ' : '') + problems.join(' ');
			statusElement.appendChild(problem);
		}
		statusElement.hidden = !message && !problems?.length;
	}

	function updateForm() {
		if (!searchElement) {
			return;
		}
		// Semantic Scholar alone has no percentiles or journal citedness
		const openAlex = sourcesElement.value !== 'semanticScholar';
		influenceElement.disabled = !openAlex;
		if (!openAlex) {
			influenceElement.value = 'any';
			if (qualityElement.value === 'cited') {
				qualityElement.value = 'any';
			}
		}
		qualityElement.querySelector('option[value="cited"]').disabled = !openAlex;
		searchElement.disabled = searching || !topicElement.value.trim() && fieldElement.value === '0';
		citedElement.hidden = qualityElement.value !== 'cited';
		document.getElementById('noSjr').hidden = sjr;
	}

	function number(id) {
		const value = document.getElementById(id).valueAsNumber;
		return Number.isFinite(value) ? value : undefined;
	}

	function formQuery() {
		return {
			sources: sourcesElement.value,
			topic: topicElement.value,
			searchIn: document.getElementById('searchIn').value,
			recentYears: number('recentYears') ?? 5,
			field: Number(fieldElement.value),
			from: number('from'),
			to: number('to'),
			citations: number('citations') ?? 0,
			influence: influenceElement.value,
			quality: qualityElement.value,
			cited: number('cited') ?? 0,
			openOnly: document.getElementById('openOnly').checked,
		};
	}

	/** Asks the indexes with the form's filters. */
	function search() {
		if (searchElement.disabled) {
			return;
		}
		searching = true;
		reconcile = undefined;
		renderReconcile();
		askedTopic = topicElement.value;
		setStatus(TEXT.searching, false);
		updateForm();
		vscode.postMessage({ command: 'search', query: formQuery() });
	}

	function authorsOf(article) {
		return article.authors.length > 3 ? format(TEXT.etAl, article.authors[0]) : article.authors.join(', ');
	}

	/** The article's title, a link, with its authors under it and, when open, a link to read it. */
	function articleCell(article) {
		const cell = document.createElement('td');
		// An imported work with neither a DOI nor a URL has no page to open
		const link = document.createElement(article.link ? 'button' : 'span');
		link.textContent = article.title;
		if (article.link) {
			link.className = 'link';
			link.title = article.link;
			link.addEventListener('click', () => vscode.postMessage({ command: 'openUrl', url: article.link }));
		}
		const authors = document.createElement('div');
		authors.className = 'authors';
		authors.textContent = authorsOf(article);
		if (article.openUrl) {
			const read = document.createElement('button');
			read.className = 'link';
			read.textContent = TEXT.openRead;
			read.title = article.openUrl;
			read.addEventListener('click', () => vscode.postMessage({ command: 'openUrl', url: article.openUrl }));
			authors.append(' \\u00b7 ', read);
		}
		const toggle = document.createElement('button');
		toggle.className = 'link';
		toggle.textContent = TEXT.abstract;
		toggle.setAttribute('aria-expanded', String(opened.has(article.id)));
		toggle.addEventListener('click', () => {
			if (opened.delete(article.id)) {
				renderArticles();
				return;
			}
			opened.add(article.id);
			if (!abstracts.has(article.id)) {
				abstracts.set(article.id, undefined);
				vscode.postMessage({ command: 'abstract', id: article.id });
			}
			renderArticles();
		});
		authors.append(' \\u00b7 ', toggle);
		cell.append(link, authors);
		return cell;
	}

	/**
	 * What a version of a work is and which index holds it, and, on the work's main row, the pill that shows its other
	 * versions, others, and, for an index that has none of this version's counts, the version of the work it has instead.
	 */
	function versionLine(article, others) {
		const line = document.createElement('div');
		line.className = 'versionLine';
		const index = article.citedOpenAlex !== undefined && article.citedSemanticScholar !== undefined ? TEXT.bothIndexes
			: article.citedOpenAlex !== undefined ? TEXT.openAlex : TEXT.semanticScholar;
		const parts = [format(TEXT.versionIn, TEXT[article.version] || TEXT.published, index)];
		for (const [count, name] of [['citedOpenAlex', TEXT.openAlex], ['citedSemanticScholar', TEXT.semanticScholar]]) {
			const other = article[count] === undefined && others.find(version => version[count] !== undefined);
			if (other) {
				const kind = TEXT['as' + other.version[0].toUpperCase() + other.version.slice(1)] || TEXT.asPublished;
				parts.push(other.journal ? format(TEXT.onlyAsIn, name, kind, other.journal) : format(TEXT.onlyAs, name, kind));
			}
		}
		line.textContent = parts.join(' \u00b7 ');
		if (others.length) {
			const pill = document.createElement('button');
			pill.className = 'link pill';
			pill.textContent = expanded.has(article.work) ? TEXT.hideVersions : others.length === 1 ? TEXT.oneVersion : format(TEXT.versions, others.length);
			pill.title = TEXT.versionsHint;
			pill.setAttribute('aria-expanded', String(expanded.has(article.work)));
			pill.addEventListener('click', () => {
				if (!expanded.delete(article.work)) {
					expanded.add(article.work);
				}
				renderResults();
			});
			line.appendChild(pill);
		}
		return line;
	}

	/** The words of a text, in lower case and without accents. */
	function plainWords(text) {
		return text.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').match(/[\\p{L}\\p{N}]+/gu) || [];
	}

	/** The abstracts of an article under its row, the words of the topic searched marked, as the indexes match them: by their start. */
	function abstractRow(article, columns) {
		const row = document.createElement('tr');
		row.className = 'abstract';
		const cell = document.createElement('td');
		cell.colSpan = columns;
		row.appendChild(cell);
		const answer = abstracts.get(article.id);
		const note = text => cell.appendChild(Object.assign(document.createElement('div'), { className: 'abstractSource', textContent: text }));
		if (!answer) {
			note(TEXT.abstractLoading);
			return row;
		}
		if (answer.note) {
			note(answer.note);
			return row;
		}
		const list = answer.abstracts;
		const terms = plainWords(searchedTopic.replace(/\\b(AND|OR)\\b/g, ' '));
		for (const { source, text } of list) {
			const block = document.createElement('div');
			block.className = 'abstractText';
			let marked = 0;
			for (const part of text.split(/([\\p{L}\\p{N}]+)/u)) {
				const word = plainWords(part)[0];
				if (word && terms.some(term => word.startsWith(term))) {
					block.appendChild(Object.assign(document.createElement('mark'), { textContent: part }));
					marked++;
				} else {
					block.appendChild(document.createTextNode(part));
				}
			}
			const label = format(TEXT.abstractFrom, source) + (terms.length && !marked ? ' \\u00b7 ' + TEXT.noSearchWords : '');
			cell.append(Object.assign(document.createElement('div'), { className: 'abstractSource', textContent: label }), block);
		}
		// What is missing: an index with none, or one not reached, to be asked again
		if (!list.length && !answer.unreachable.length) {
			note(TEXT.noAbstract);
		} else if (list.length === 1 && !answer.unreachable.length) {
			note(format(TEXT.noAbstractFrom, list[0].source === 'OpenAlex' ? 'Semantic Scholar' : 'OpenAlex'));
		}
		for (const source of answer.unreachable) {
			const line = note(format(TEXT.unreachable, source) + ' ');
			const again = Object.assign(document.createElement('button'), { className: 'link', textContent: TEXT.tryAgain });
			again.addEventListener('click', () => {
				abstracts.set(article.id, undefined);
				vscode.postMessage({ command: 'abstract', id: article.id });
				renderArticles();
			});
			line.appendChild(again);
		}
		return row;
	}

	function journalCell(article) {
		const cell = document.createElement('td');
		cell.className = 'journal';
		cell.textContent = article.journal || '';
		if (article.journalTag) {
			const tag = document.createElement('div');
			tag.className = 'tag';
			tag.textContent = article.journalTag;
			tag.title = article.journalDetails || '';
			cell.append(tag);
		}
		return cell;
	}

	function numberCell(value, digits) {
		const cell = document.createElement('td');
		cell.className = 'number';
		cell.textContent = value === undefined || value === null ? '' : value.toLocaleString(undefined, { maximumFractionDigits: digits || 0 });
		return cell;
	}

	function sortValue(article, column) {
		if (column === 'cited') {
			return Math.max(article.citedOpenAlex ?? -Infinity, article.citedSemanticScholar ?? -Infinity);
		}
		const value = article[column];
		return column === 'title' || column === 'journal' ? (value || '').toLowerCase() : value === undefined ? -Infinity : value;
	}

	/** Whether the index is still being asked, its columns turning: for its counts, or Semantic Scholar for its search again. */
	function pendingIndex(index) {
		return asking.includes(index) || searchPending && index === 'semanticScholar';
	}

	/** Reconcile Sources, with how many articles each index can still be asked about; one not asked while it is being asked. */
	function renderReconcile() {
		const block = document.getElementById('reconcile');
		block.hidden = !reconcile;
		if (!reconcile) {
			return;
		}
		const open = index => reconcile[index] > 0 && !asking.includes(index);
		for (const [index, name] of [['openAlex', 'OpenAlex'], ['semanticScholar', 'SemanticScholar']]) {
			const button = document.getElementById('reconcile' + name);
			button.textContent = format(TEXT['reconcile' + name], reconcile[index].toLocaleString());
			button.title = format(TEXT['reconcile' + name + 'Hint'], reconcile[index].toLocaleString());
			button.disabled = !open(index);
		}
		document.getElementById('reconcileBoth').disabled = !open('openAlex') && !open('semanticScholar');
	}

	/** The columns, but for the counts no article listed has: an index not asked, or not reached. */
	function shownColumns() {
		return COLUMNS.filter(column => !column.number || unavailable.includes(column.index) || pendingIndex(column.index)
			|| articles.some(article => article[column.id] !== undefined));
	}

	/** Two rows: the index above its columns, and the columns of no index spanning both. */
	function renderHead() {
		const head = document.getElementById('resultsHead');
		head.textContent = '';
		document.getElementById('sortNote').hidden = sort.column !== 'cited';
		const groups = document.createElement('tr');
		const labels = document.createElement('tr');
		head.append(groups, labels);
		let group;
		for (const column of shownColumns()) {
			const th = document.createElement('th');
			if (!column.group) {
				th.rowSpan = 2;
			} else if (group?.textContent === column.group) {
				group.colSpan++;
			} else {
				group = document.createElement('th');
				group.className = 'group' + (unavailable.includes(column.index) ? ' unavailable' : '');
				group.colSpan = 1;
				group.textContent = column.group;
				if (unavailable.includes(column.index)) {
					group.title = TEXT.unavailableIndex;
				} else if (pendingIndex(column.index)) {
					group.title = column.index === 'openAlex' ? TEXT.countsPendingOpenAlex : searchPending ? TEXT.searchPending : TEXT.countsPending;
					group.insertAdjacentHTML('afterbegin', SPINNER);
				}
				groups.appendChild(group);
			}
			th.className = (column.sortable ? 'sortable' : '') + (column.number ? ' number' : '') + (unavailable.includes(column.index) ? ' unavailable' : '');
			const sorted = sort.column === column.id || sort.column === 'cited' && (column.id === 'citedOpenAlex' || column.id === 'citedSemanticScholar');
			setSortArrow(th, format(column.label, recentYears), sorted, sort.descending);
			if (column.hint) {
				th.title = format(column.hint, recentYears);
			} else if (column.sortable) {
				th.title = TEXT.sortHint;
			}
			if (column.sortable) {
				th.addEventListener('click', () => {
					sort = { column: column.id, descending: sort.column === column.id ? !sort.descending : column.number || column.id === 'year' };
					page = 0;
					renderResults();
				});
			}
			(column.group ? labels : groups).appendChild(th);
		}
	}

	function renderResults() {
		renderHead();
		const body = document.getElementById('items');
		body.textContent = '';
		const sign = sort.descending ? -1 : 1;
		// The versions of a work, its most cited first, as a block ranked by that one
		const groups = new Map();
		for (const article of articles) {
			const key = article.work || article.id;
			groups.set(key, [...(groups.get(key) || []), article]);
		}
		const sorted = [...groups.values()].sort(([a], [b]) => {
			const x = sortValue(a, sort.column);
			const y = sortValue(b, sort.column);
			return x < y ? -sign : x > y ? sign : 0;
		});
		const size = rowsPerPage(rows, sorted.length);
		const pages = Math.ceil(sorted.length / size);
		page = Math.max(0, Math.min(page, pages - 1));
		// The pager above the articles and again under them, with the Rows choice while there are more than the fewest rows
		for (const id of ['pagerAbove', 'pagerUnder']) {
			document.getElementById(id).replaceChildren(...(sorted.length > ${FEWEST_ROWS} ? [pager(pages)] : []));
		}
		const shown = sorted.slice(page * size, (page + 1) * size).flatMap(members => expanded.has(members[0].work) ? members : [members[0]]);
		for (const article of shown) {
			const members = article.work ? groups.get(article.work) : [article];
			const main = members[0] === article;
			const row = document.createElement('tr');
			row.className = main ? '' : 'version';
			const pick = document.createElement('td');
			const box = document.createElement('input');
			box.type = 'checkbox';
			box.checked = selected.some(other => other.id === article.id);
			box.setAttribute('aria-label', TEXT.pick);
			box.addEventListener('change', () => vscode.postMessage(box.checked ? { command: 'pick', article } : { command: 'unpick', ids: [article.id] }));
			pick.appendChild(box);
			const yearCell = document.createElement('td');
			yearCell.textContent = article.year;
			const titleCell = articleCell(article);
			titleCell.className = 'title';
			if (members.length > 1) {
				titleCell.appendChild(versionLine(article, main ? members.slice(1) : []));
			}
			row.append(pick, yearCell, titleCell, journalCell(article), ...shownColumns().filter(column => column.number).map(column => numberCell(article[column.id], column.digits)));
			body.appendChild(row);
			if (opened.has(article.id)) {
				body.appendChild(abstractRow(article, row.children.length));
			}
		}
		document.getElementById('noResults').hidden = articles.length > 0;
	}

	// Previous, Page X of Y and Next, above and under the articles; a new page is shown from its top
	function pager(pages) {
		const bar = document.createElement('div');
		bar.className = 'pager';
		const turn = (label, to) => {
			const button = document.createElement('button');
			button.className = 'link';
			button.textContent = label;
			button.disabled = to < 0 || to >= pages;
			button.addEventListener('click', () => {
				page = to;
				renderResults();
				// Only when the table's top is out of sight, as after the pager under it: the page stays put otherwise
				const table = document.getElementById('resultsTable');
				if (table.getBoundingClientRect().top < 0) {
					document.getElementById('pagerAbove').scrollIntoView({ block: 'start' });
				}
			});
			return button;
		};
		if (pages > 1) {
			const position = document.createElement('span');
			position.textContent = format(TEXT.pageOf, page + 1, pages);
			bar.append(turn(TEXT.previous, page - 1), position, turn(TEXT.next, page + 1));
		}
		bar.append(rowsChoice(rows, chosen => {
			page = firstPageAfter(page, rows, chosen);
			rows = chosen;
			vscode.postMessage({ command: 'rows', rows });
			renderResults();
		}));
		return bar;
	}

	/** The articles of the last search, if any, and those in Actions: each may show its abstract. */
	function renderArticles() {
		if (articles.length) {
			renderResults();
		}
		renderSelected();
	}

	/** How an imported work was looked up, its counts, and whether it is in References. */
	function matchLine(article) {
		const line = document.createElement('div');
		line.className = 'versionLine';
		const parts = [TEXT['match' + article.imported.match[0].toUpperCase() + article.imported.match.slice(1)]];
		if (article.citedOpenAlex !== undefined) {
			parts.push(format(TEXT.citedIn, article.citedOpenAlex.toLocaleString(), TEXT.openAlex));
		}
		if (article.citedSemanticScholar !== undefined) {
			parts.push(format(TEXT.citedIn, article.citedSemanticScholar.toLocaleString(), TEXT.semanticScholar));
		}
		if (saved.has(article.id)) {
			parts.push(TEXT.inReferences);
		}
		line.textContent = parts.join(' \u00b7 ');
		return line;
	}

	/** Ticks the kept articles that pass the test, and unticks the others. */
	function tickOnly(test) {
		unticked.clear();
		selected.filter(article => !test(article)).forEach(article => unticked.add(article.id));
		renderSelected();
		if (!document.getElementById('panelChooser').hidden) {
			requestPanels();
		}
	}

	function renderSelected() {
		const body = document.getElementById('selectedItems');
		body.textContent = '';
		for (const article of selected) {
			const row = document.createElement('tr');
			const tick = document.createElement('td');
			const box = document.createElement('input');
			box.type = 'checkbox';
			box.checked = !unticked.has(article.id);
			box.setAttribute('aria-label', TEXT.actOn);
			box.addEventListener('change', () => {
				if (box.checked) {
					unticked.delete(article.id);
				} else {
					unticked.add(article.id);
				}
				renderSelected();
				if (!document.getElementById('panelChooser').hidden) {
					requestPanels();
				}
			});
			tick.appendChild(box);
			const yearCell = document.createElement('td');
			yearCell.textContent = article.year || '';
			const removeCell = document.createElement('td');
			const remove = document.createElement('button');
			remove.className = 'removeArticle';
			remove.textContent = '\u00d7';
			remove.title = TEXT.removeArticle;
			remove.setAttribute('aria-label', TEXT.removeArticle);
			remove.addEventListener('click', () => {
				unticked.delete(article.id);
				vscode.postMessage({ command: 'unpick', ids: [article.id] });
			});
			removeCell.appendChild(remove);
			const titleCell = articleCell(article);
			if (article.imported) {
				titleCell.appendChild(matchLine(article));
			}
			row.append(tick, yearCell, titleCell, journalCell(article), removeCell);
			body.appendChild(row);
			if (opened.has(article.id)) {
				body.appendChild(abstractRow(article, row.children.length));
			}
		}
		const ticked = selected.filter(article => !unticked.has(article.id));
		const bulkBar = document.getElementById('bulkBar');
		if (bulkBar) {
			bulkBar.hidden = selected.length === 0;
			document.getElementById('tickedCount').textContent = format(TEXT.tickedCount, ticked.length.toLocaleString(), selected.length.toLocaleString());
			document.getElementById('lookUpTicked').disabled = importing || ticked.length === 0;
			document.getElementById('removeUnticked').disabled = ticked.length === selected.length;
			if (ticked.length === selected.length) {
				document.getElementById('removeConfirm').hidden = true;
			}
		}
		const tickAll = document.getElementById('tickAll');
		tickAll.checked = selected.length > 0 && ticked.length === selected.length;
		tickAll.indeterminate = ticked.length > 0 && ticked.length < selected.length;
		const saveButton = document.getElementById('saveTicked');
		saveButton.textContent = saving.size ? TEXT.saving : TEXT.save;
		saveButton.disabled = unsavedTicked().length === 0;
		for (const id of ['seeTicked', 'showInPanel', 'copyBibtex', 'snowball']) {
			document.getElementById(id).disabled = ticked.length === 0;
		}
		if (!ticked.length) {
			closeChooser();
		}
		document.getElementById('openPdfs').disabled = !ticked.some(article => article.openUrl);
		document.getElementById('actionBar').hidden = selected.length === 0;
		document.getElementById('actOnNote').hidden = selected.length === 0;
		document.getElementById('selectedTable').hidden = selected.length === 0;
		document.getElementById('noSelected').hidden = selected.length > 0;
		sizeButtons();
	}

	/** Gives the buttons of each shown action bar the width of the widest; those of the ticked articles share the page's width. */
	function sizeButtons() {
		for (const bar of document.querySelectorAll('.actionBar:not(#actionBar)')) {
			const buttons = [...bar.querySelectorAll('button.action')];
			buttons.forEach(button => button.style.width = '');
			const width = Math.max(0, ...buttons.map(button => button.offsetWidth));
			if (width) {
				buttons.forEach(button => button.style.width = width + 'px');
			}
		}
	}

	/** The ids of the ticked kept articles not in References nor being saved. */
	function unsavedTicked() {
		return selected.filter(article => !unticked.has(article.id) && !saved.has(article.id) && !saving.has(article.id)).map(article => article.id);
	}

	function saveArticles(ids) {
		ids.forEach(id => saving.add(id));
		setActionStatus('');
		renderSelected();
		vscode.postMessage({ command: 'save', ids });
	}

	/** Asks for an action on the ticked articles; those it saves to References first are shown as being saved. */
	function act(command, saves) {
		if (saves) {
			unsavedTicked().forEach(id => saving.add(id));
		}
		setActionStatus('');
		renderSelected();
		vscode.postMessage({ command, ids: selected.filter(article => !unticked.has(article.id)).map(article => article.id) });
	}

	/** The ids of the ticked kept articles. */
	function tickedIds() {
		return selected.filter(article => !unticked.has(article.id)).map(article => article.id);
	}

	/** Asks for the panels the ticked articles can be shown in, for the chooser. */
	function requestPanels() {
		vscode.postMessage({ command: 'panels', ids: tickedIds() });
	}

	function openChooser() {
		const chooser = document.getElementById('panelChooser');
		if (chooser.hidden) {
			chosen.clear();
			panels = undefined;
			document.getElementById('panelFilter').value = '';
			chooser.hidden = false;
			renderPanels();
		}
		setActionStatus('');
		requestPanels();
		document.getElementById('panelFilter').focus();
	}

	function closeChooser() {
		document.getElementById('panelChooser').hidden = true;
		chosen.clear();
	}

	function renderPanels() {
		const list = document.getElementById('panelList');
		list.textContent = '';
		const showButton = document.getElementById('showChosen');
		showButton.textContent = chosen.size === 0 ? TEXT.chooseNoPanel : chosen.size === 1 ? TEXT.showInOnePanel : format(TEXT.showInPanels, chosen.size);
		showButton.disabled = chosen.size === 0;
		sizeButtons();
		if (!panels) {
			const loading = document.createElement('div');
			loading.className = 'empty';
			loading.textContent = TEXT.panelsLoading;
			list.appendChild(loading);
			return;
		}
		const words = document.getElementById('panelFilter').value.toLowerCase().split(/\s+/).filter(word => word);
		const shown = panels.filter(panel => {
			const text = (panel.title + ' ' + panel.path + ' ' + panel.description).toLowerCase();
			return chosen.has(panel.id) || words.every(word => text.includes(word));
		});
		for (const panel of shown) {
			const row = document.createElement('div');
			row.className = 'panelRow';
			const label = document.createElement('label');
			const box = document.createElement('input');
			box.type = 'checkbox';
			box.checked = chosen.has(panel.id);
			box.addEventListener('change', () => {
				if (box.checked) {
					chosen.add(panel.id);
				} else {
					chosen.delete(panel.id);
				}
				renderPanels();
			});
			const about = document.createElement('div');
			const title = document.createElement('div');
			title.textContent = panel.title;
			const path = document.createElement('div');
			path.className = 'panelPath';
			path.textContent = panel.path;
			about.append(title, path);
			if (panel.description) {
				const description = document.createElement('div');
				description.className = 'panelDescription';
				description.textContent = panel.description;
				description.title = panel.description;
				about.appendChild(description);
			}
			const meta = document.createElement('div');
			meta.className = 'panelMeta';
			meta.textContent = panel.cites === 1 ? TEXT.panelCitesOne : format(TEXT.panelCites, panel.cites);
			if (panel.citesTicked) {
				const citesTicked = document.createElement('span');
				citesTicked.className = 'citesTicked';
				citesTicked.textContent = panel.citesTicked === 1 ? TEXT.panelCitesTickedOne : format(TEXT.panelCitesTicked, panel.citesTicked);
				meta.append(' \u00b7 ', citesTicked);
			}
			about.appendChild(meta);
			label.append(box, about);
			const open = document.createElement('button');
			open.className = 'link';
			open.textContent = TEXT.openPanel;
			open.addEventListener('click', () => vscode.postMessage({ command: 'openPanel', id: panel.id }));
			row.append(label, open);
			list.appendChild(row);
		}
		if (!shown.length) {
			const none = document.createElement('div');
			none.className = 'empty';
			none.textContent = TEXT.noPanels;
			list.appendChild(none);
		}
	}

	function setActionStatus(message, error) {
		const status = document.getElementById('actionStatus');
		status.textContent = message;
		status.className = error ? 'status error' : 'status';
		status.hidden = !message;
	}

	function renderKey(index, hasKey) {
		const hint = document.getElementById(index + 'Key');
		const openAlex = index === 'openAlex';
		hint.textContent = (hasKey ? (openAlex ? TEXT.hasKey : TEXT.hasSemanticScholarKey) : (openAlex ? TEXT.noKey : TEXT.noSemanticScholarKey)) + ' ';
		const setKey = document.createElement('button');
		setKey.className = 'link';
		setKey.textContent = hasKey ? TEXT.changeKey : TEXT.setKey;
		setKey.addEventListener('click', () => vscode.postMessage({ command: 'setKey', index }));
		hint.append(setKey);
		if (!hasKey) {
			const getKey = document.createElement('button');
			getKey.className = 'link';
			getKey.textContent = TEXT.getKey;
			getKey.addEventListener('click', () => vscode.postMessage({ command: 'getKey', index }));
			hint.append(' \\u00b7 ', getKey);
		}
	}

	if (searchElement) {
		topicElement.addEventListener('input', updateForm);
		topicElement.addEventListener('keydown', event => {
			if (event.key === 'Enter') {
				search();
			}
		});
		fieldElement.addEventListener('change', updateForm);
		sourcesElement.addEventListener('change', updateForm);
		qualityElement.addEventListener('change', updateForm);
		searchElement.addEventListener('click', search);
		document.getElementById('reconcileBoth').addEventListener('click', () => vscode.postMessage({ command: 'reconcile', indexes: ['openAlex', 'semanticScholar'] }));
		document.getElementById('reconcileOpenAlex').addEventListener('click', () => vscode.postMessage({ command: 'reconcile', indexes: ['openAlex'] }));
		document.getElementById('reconcileSemanticScholar').addEventListener('click', () => vscode.postMessage({ command: 'reconcile', indexes: ['semanticScholar'] }));
	} else {
		const pasted = document.getElementById('pasted');
		const lookUpBox = document.getElementById('lookUp');
		const updateImport = () => {
			const importButton = document.getElementById('importPasted');
			const chooseButton = document.getElementById('chooseFile');
			importButton.disabled = importing || !pasted.value.trim();
			chooseButton.disabled = importing;
			// Once there is something pasted, Import is the next step and takes the blue; without it, Choose Files has it back
			importButton.classList.toggle('current', !importButton.disabled);
			chooseButton.classList.toggle('current', importButton.disabled);
		};
		const startImport = message => {
			importing = true;
			setStatus(TEXT.importing, false);
			updateImport();
			renderSelected();
			vscode.postMessage(message);
		};
		pasted.addEventListener('input', updateImport);
		document.getElementById('importPasted').addEventListener('click', () => startImport({ command: 'import', text: pasted.value, lookUp: lookUpBox.checked }));
		document.getElementById('chooseFile').addEventListener('click', () => startImport({ command: 'chooseFile', lookUp: lookUpBox.checked }));
		const tests = {
			all: () => true,
			none: () => false,
			found: article => article.imported?.match === 'doi' || article.imported?.match === 'title',
			notFound: article => article.imported?.match === 'none',
			unchecked: article => article.imported?.match === 'unchecked',
			unsaved: article => !saved.has(article.id),
		};
		for (const link of document.querySelectorAll('[data-tick]')) {
			link.addEventListener('click', () => tickOnly(tests[link.dataset.tick]));
		}
		document.getElementById('lookUpTicked').addEventListener('click', () => startImport({ command: 'lookUp', ids: tickedIds() }));
		document.getElementById('removeUnticked').addEventListener('click', () => {
			const count = selected.filter(article => unticked.has(article.id)).length;
			document.getElementById('removeQuestion').textContent = count === 1 ? TEXT.removeQuestionOne : format(TEXT.removeQuestion, count.toLocaleString());
			document.getElementById('removeConfirm').hidden = false;
		});
		document.getElementById('removeYes').addEventListener('click', () => {
			const ids = selected.filter(article => unticked.has(article.id)).map(article => article.id);
			document.getElementById('removeConfirm').hidden = true;
			ids.forEach(id => unticked.delete(id));
			vscode.postMessage({ command: 'unpick', ids });
		});
		document.getElementById('cancelRemove').addEventListener('click', () => document.getElementById('removeConfirm').hidden = true);
		window.addEventListener('message', event => {
			const message = event.data;
			if (message.command === 'importStatus') {
				setStatus(message.message, false);
			} else if (message.command === 'imported') {
				importing = false;
				if (message.clear) {
					pasted.value = '';
				}
				setStatus(message.message, message.error);
				updateImport();
				renderSelected();
			}
		});
	}
	for (const bar of [document.getElementById('actionBar'), document.getElementById('chooserBar'), document.getElementById('importPane'), document.getElementById('removeConfirm')].filter(bar => bar)) {
		bar.addEventListener('mouseover', event => {
			const button = event.target.closest('button.action');
			if (button && !button.disabled && !button.classList.contains('current')) {
				bar.querySelector('button.current')?.classList.remove('current');
				button.classList.add('current');
			}
		});
	}
	document.getElementById('saveTicked').addEventListener('click', () => saveArticles(unsavedTicked()));
	document.getElementById('seeTicked').addEventListener('click', () => act('browse', false));
	document.getElementById('showInPanel').addEventListener('click', openChooser);
	document.getElementById('panelFilter').addEventListener('input', renderPanels);
	document.getElementById('showChosen').addEventListener('click', () => {
		const ids = [...chosen];
		closeChooser();
		unsavedTicked().forEach(id => saving.add(id));
		setActionStatus('');
		renderSelected();
		vscode.postMessage({ command: 'showInPanels', ids: tickedIds(), panels: ids });
	});
	document.getElementById('cancelChooser').addEventListener('click', closeChooser);
	document.getElementById('copyBibtex').addEventListener('click', () => act('copyBibtex', false));
	document.getElementById('openPdfs').addEventListener('click', () => act('openPdfs', false));
	document.getElementById('snowball').addEventListener('click', () => act('snowball', false));
	document.getElementById('tickAll').addEventListener('change', event => {
		if (event.target.checked) {
			unticked.clear();
		} else {
			selected.forEach(article => unticked.add(article.id));
		}
		renderSelected();
		if (!document.getElementById('panelChooser').hidden) {
			requestPanels();
		}
	});

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			sjr = message.sjr;
			selected = message.selected;
			saved = new Map(message.saved);
			renderKey('openAlex', message.keys.openAlex);
			renderKey('semanticScholar', message.keys.semanticScholar);
			renderSelected();
			updateForm();
		} else if (message.command === 'inReferences') {
			saved = new Map(message.saved);
			renderSelected();
		} else if (message.command === 'saved') {
			saved = new Map(message.saved);
			saving.clear();
			setActionStatus(message.failed ? format(TEXT.notSaved, message.failed) : '', true);
			renderSelected();
		} else if (message.command === 'panels') {
			panels = message.panels;
			for (const id of [...chosen]) {
				if (!panels.some(panel => panel.id === id)) {
					chosen.delete(id);
				}
			}
			renderPanels();
		} else if (message.command === 'done') {
			setActionStatus(message.message, message.error);
		} else if (message.command === 'selected') {
			selected = message.selected;
			renderSelected();
			if (articles.length) {
				renderResults();
			}
		} else if (message.command === 'abstract') {
			abstracts.set(message.id, { abstracts: message.abstracts, unreachable: message.unreachable, note: message.note });
			if (opened.has(message.id)) {
				renderArticles();
			}
		} else if (message.command === 'results') {
			articles = message.articles;
			recentYears = message.recentYears;
			unavailable = message.unavailable ?? [];
			asking = message.asking ?? [];
			reconcile = message.reconcile;
			searchPending = !!message.searchPending;
			searchedTopic = askedTopic;
			sort = { column: 'cited', descending: true };
			page = 0;
			searching = false;
			document.getElementById('results').hidden = false;
			renderResults();
			renderReconcile();
			setStatus(message.notes.join(' '), false, message.problems);
			updateForm();
		} else if (message.command === 'counts') {
			// Semantic Scholar's articles or counts, come in the background: the table stays as it is sorted, paged and ticked
			articles = message.articles;
			unavailable = message.unavailable ?? [];
			asking = message.asking ?? [];
			reconcile = message.reconcile;
			searchPending = !!message.searchPending;
			renderResults();
			renderReconcile();
			setStatus(message.notes.join(' '), false, message.problems);
		} else if (message.command === 'error') {
			searching = false;
			searchPending = false;
			asking = [];
			reconcile = undefined;
			renderReconcile();
			setStatus(message.message, true);
			updateForm();
		}
	});
	updateForm();
	(topicElement || document.getElementById('pasted')).focus();
	// What another page removed from References can be saved again when this one is back in front
	window.addEventListener('focus', () => vscode.postMessage({ command: 'checkSaved' }));
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: LITERATURE_RADAR_COMMAND_ID,
			title: localize2('discover.open', "Discover Literature"),
			category: localize2('compose.category', "Compose"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): void {
		openLiteratureRadar(accessor, 'discover');
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: IMPORT_REFERENCES_COMMAND_ID,
			title: localize2('import.open', "Import References"),
			category: localize2('compose.category', "Compose"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): void {
		openLiteratureRadar(accessor, 'import');
	}
});
