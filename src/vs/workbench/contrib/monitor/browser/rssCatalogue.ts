/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { SHIPPED_CATALOGUE } from './rssCatalogue.data.js';

// The feeds Explore > RSS > RSS Feeds offers, by topic: those of PollisRSS.jl, as PollisDB copies them into
// ~/.pollis/rss/catalogue.json, else those this Pollis was built with. The topic names are stored with the feeds the
// user follows, so they are not translated.

export const JULIA_TOPIC = 'Julia';
export const ARXIV_TOPIC = 'arXiv';
export const MEDICINE_TOPIC = 'Medicine and Biomedical Research';
/**
 * The topics renamed or split, by their old names: their catalogue feeds are now under the catalogue's topics, and the
 * others under the new name; the catalogue's arXiv feeds, once under arXiv, are under their subjects. The videos and
 * podcasts of the catalogue are under their subjects too, and the user's own stay under Videos and Podcasts.
 */
export const RENAMED_TOPICS: Readonly<Record<string, string>> = { 'Science': 'General Science', 'Finance Journals': 'Finance Research', 'Arts and Music': 'Art', 'Classics and Religion': 'Religion', 'Architecture': 'Architecture and Urbanism', 'Videos and Podcasts': 'Videos and Podcasts' };

/**
 * The catalogue's feeds moved to another topic, by address, with the topic they were under: a feed followed or removed
 * under that topic gets its new one.
 */
export const MOVED_FEEDS: Readonly<Record<string, string>> = {
	'https://www.nber.org/rss/newap.xml': 'Economics and Central Banks',
	'https://www.nber.org/rss/newcf.xml': 'Economics and Central Banks',
	'https://nep.repec.org/rss/nep-cfn.rss.xml': 'Economics and Central Banks',
};

/**
 * A feed of the catalogue: its name, its address and, when it matters, the id of a note shown beside it (see
 * `catalogueNote`).
 */
export interface IRssCatalogueFeed {
	readonly name: string;
	readonly url: string;
	readonly note?: string;
	/** Whether the feed is a podcast's; a YouTube channel is known by its address. */
	readonly media?: 'audio';
	/** The ISSNs of the journal whose feed it is, print and electronic, by which its levels and metrics are found. */
	readonly issns?: readonly string[];
}

export interface IRssCatalogueTopic {
	readonly topic: string;
	readonly feeds: readonly IRssCatalogueFeed[];
}

/** The data of PollisRSS.jl: the topics with their feeds, and the feeds Pollis follows at first. */
export interface IRssCatalogue {
	readonly topics: readonly IRssCatalogueTopic[];
	readonly defaults: readonly { readonly url: string; readonly topic: string }[];
}

// Searches are feeds too: arXiv answers a search with an Atom feed, PubMed with the ids of the articles found, read
// through NCBI's E-utilities.
const ARXIV_SEARCH = 'https://export.arxiv.org/api/query?';
export const PUBMED_SEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?';

/** The address of the arXiv search `query`, newest papers first. */
export function arxivSearchUrl(query: string): string {
	return `${ARXIV_SEARCH}search_query=${encodeURIComponent(query)}&sortBy=submittedDate&sortOrder=descending&max_results=50`;
}

/** The name of the arXiv search `query`. */
export function arxivSearchName(query: string): string {
	return `arXiv: ${query}`;
}

/** The name of the PubMed search `term`. */
export function pubmedSearchName(term: string): string {
	return `PubMed: ${term}`;
}

/** The address of the PubMed search `term`, the articles most recently added first. */
/** The feed of a YouTube channel's newest videos, from the channel's id (`UC` and 22 more characters). */
export function youtubeFeedUrl(channelId: string): string {
	return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
}

export function pubmedSearchUrl(term: string): string {
	return `${PUBMED_SEARCH}db=pubmed&retmode=json&retmax=50&term=${encodeURIComponent(term)}`;
}

let catalogue: IRssCatalogue = SHIPPED_CATALOGUE;

/** The catalogue's topics, with their feeds. */
export function rssCatalogueTopics(): readonly IRssCatalogueTopic[] {
	return catalogue.topics;
}

/** The feeds Pollis follows at first. The user chooses the rest from the catalogue. */
export function defaultFeeds(): IRssCatalogue['defaults'] {
	return catalogue.defaults;
}

/** Offers the feeds of `data`, the JSON of PollisRSS.jl, instead, when it is a catalogue with feeds. */
export function setRssCatalogue(data: unknown): boolean {
	const { topics, defaults } = (data && typeof data === 'object' ? data : {}) as Partial<IRssCatalogue>;
	const valid = Array.isArray(topics) && topics.length > 0 && topics.every(topic => typeof topic?.topic === 'string' && Array.isArray(topic.feeds) && topic.feeds.every((feed: Partial<IRssCatalogueFeed> | undefined) => typeof feed?.name === 'string' && typeof feed.url === 'string'));
	if (valid) {
		catalogue = { topics, defaults: Array.isArray(defaults) ? defaults : SHIPPED_CATALOGUE.defaults };
	}
	return valid;
}

/** The text of the note `id` of a catalogue feed; nothing for an id this Pollis does not know. */
export function catalogueNote(id: string | undefined): string | undefined {
	switch (id) {
		case 'paywall': return localize('rss.notePaywall', "Headlines; articles behind a paywall");
		case 'busy': return localize('rss.noteBusy', "Hundreds of papers a day");
		case 'weekdays': return localize('rss.noteWeekdays', "New papers on weekdays");
		case 'preprints': return localize('rss.notePreprints', "Preprints, not yet peer reviewed");
		case 'youtube': return localize('rss.noteYoutube', "YouTube channel");
		case 'podcast': return localize('rss.notePodcast', "Podcast");
		case 'readersLinks': return localize('rss.noteReadersLinks', "Links chosen by its readers");
		case 'newEntries': return localize('rss.noteNewEntries', "New and revised entries");
		case 'weekly': return localize('rss.noteWeekly', "New working papers each week");
		default: return undefined;
	}
}

/** A catalogue feed by its address. */
export function findCatalogueFeed(url: string): { topic: string; feed: IRssCatalogueFeed } | undefined {
	for (const { topic, feeds } of catalogue.topics) {
		const feed = feeds.find(feed => feed.url === url);
		if (feed) {
			return { topic, feed };
		}
	}
	return undefined;
}

/**
 * Whether requests to the host of `url` must be spaced out: arXiv asks for 3 seconds, NCBI allows 3 a second, and
 * Oxford Academic answers 429 Too Many Requests to a few a second.
 */
export function requestSpacing(url: string): number {
	return url.startsWith(ARXIV_SEARCH) ? 3000 : url.startsWith('https://eutils.ncbi.nlm.nih.gov/') ? 400 : url.startsWith('https://academic.oup.com/rss/') ? 1000 : 0;
}
