/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { timeout } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { escapeRegExpCharacters } from '../../../../base/common/strings.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { asJson, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { CREDENTIALS } from '../../model/browser/common/credentials.js';
import { IPrNewswireService } from './prNewswireService.js';
import { IRssFeedsService } from './rssFeedsService.js';

// Explore > Media Coverage: what the news said about a company, a ticker or a phrase over a period.
// Google News's search and Yahoo Finance's headlines of a ticker, shown only (their feeds are for personal reading);
// the New York Times's Article Search and the Guardian's Open Platform, with the user's own free keys; and, when the
// user ticks it, PR Newswire's releases, which Pollis keeps from its feeds (prNewswireService.ts).
// Headlines, sources, times and links only: never an article's text.

export const IMediaCoverageService = createDecorator<IMediaCoverageService>('mediaCoverageService');

export type CoverageSource = 'googleNews' | 'yahoo' | 'newYorkTimes' | 'guardian' | 'prNewswire';

/** The sources, in the order the page lists them. */
export const COVERAGE_SOURCES: readonly CoverageSource[] = ['googleNews', 'yahoo', 'newYorkTimes', 'guardian', 'prNewswire'];

/** The sources searched only with the user's own key. */
export type KeyedSource = 'newYorkTimes' | 'guardian';

export const KEYED_SOURCES: readonly KeyedSource[] = ['newYorkTimes', 'guardian'];

/** Where the user gets a free key of each keyed source. */
export const KEY_PAGES: { readonly [source in KeyedSource]: string } = {
	newYorkTimes: 'https://developer.nytimes.com/get-started',
	guardian: 'https://open-platform.theguardian.com/access/',
};

export interface ICoverageQuery {
	/** The words to look for, as Google News reads them: "Apple Inc" iPhone, with quotes for a phrase. */
	readonly words: string;
	/** A ticker: Yahoo Finance's headlines of it. */
	readonly ticker?: string;
	/** In milliseconds since 1970. */
	readonly start: number;
	readonly end: number;
	/** The sources to search. */
	readonly sources: readonly CoverageSource[];
}

/** How many of a source's articles were listed, of all those it found. */
export interface ICoverageCount {
	readonly source: CoverageSource;
	readonly listed: number;
	readonly total: number;
}

export interface ICoverageItem {
	readonly source: CoverageSource;
	readonly title: string;
	/** Who published it: a news site's domain or a publisher. */
	readonly outlet: string;
	/** In milliseconds since 1970. */
	readonly time: number;
	readonly url: string;
}

export interface ICoverage {
	readonly query: ICoverageQuery;
	readonly items: readonly ICoverageItem[];
	/** The starts of the timeline's buckets, in milliseconds since 1970, and their length. */
	readonly times: readonly number[];
	readonly bucket: number;
	/** The articles listed in each bucket. */
	readonly articles: readonly number[];
	/** The sources that could not be reached, or refused the query. */
	readonly failed: readonly CoverageSource[];
	/** The keyed sources asked for without a key. */
	readonly noKey: readonly KeyedSource[];
	/** The sources that found more articles than they list. */
	readonly counts: readonly ICoverageCount[];
}

/** The news of a company around a time: its first newswire release, and the articles. */
export interface IEventCoverage {
	/** The earliest newswire release from a day before the time to two hours after it. */
	readonly release?: ICoverageItem;
	/** The articles from a day before the time to a day after it, oldest first. */
	readonly items: readonly ICoverageItem[];
}

export interface IMediaCoverageService {
	readonly _serviceBrand: undefined;
	/** The coverage of `query`. */
	getCoverage(query: ICoverageQuery): Promise<ICoverage>;
	/**
	 * The news of the company named `name`, whose ticker is `ticker`, around `time`; undefined when Google News cannot
	 * be reached and PR Newswire has nothing.
	 */
	getEventCoverage(name: string, time: number, ticker?: string): Promise<IEventCoverage | undefined>;
	/** The sources the user ticked. */
	getSources(): readonly CoverageSource[];
	setSources(sources: readonly CoverageSource[]): void;
	hasKey(source: KeyedSource): Promise<boolean>;
	/** Keeps `key` in the system's keychain, or forgets it when empty. */
	setKey(source: KeyedSource, key: string): Promise<void>;
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** What the chart marks: nothing, the FOMC's releases, the SEC filings of the ticker, or a time the user gives. */
export type CoverageMarks = 'none' | 'fomc' | 'filings' | 'time';

/** What Media Coverage opens with: an event study's event asks for the news around it. */
export interface IMediaCoverageRequest {
	readonly words: string;
	readonly ticker?: string;
	/** In milliseconds since 1970. */
	readonly start: number;
	readonly end: number;
	readonly marks: CoverageMarks;
	/** The time marked, for `time`. */
	readonly time?: number;
}

const SOURCES_KEY = 'pollis.mediaCoverage.sources';
const DEFAULT_SOURCES: readonly CoverageSource[] = ['googleNews', 'yahoo', 'newYorkTimes', 'guardian'];
// The pages asked of the New York Times (10 articles each, at most 5 requests a minute) and of the Guardian (200 each)
const NEW_YORK_TIMES_PAGES = 5;
const GUARDIAN_PAGES = 5;

// The newswires companies publish their results on, as Google News names them, and how to ask it for their releases
const WIRES = /^(?:globenewswire|business ?wire|pr ?newswire|access ?newswire|accesswire)$/i;
const WIRE_SEARCH = '(globenewswire OR businesswire OR prnewswire OR accesswire)';
// How long after the time a release still counts as the company's
const RELEASE_AFTER = 2 * HOUR;

/** A company's name without its legal form, to look for in the news: Apple Inc. is "Apple". */
export function newsName(name: string): string {
	const short = name.replace(/\/[a-z]{2,3}\/?/gi, ' ').replace(/[,.]/g, ' ').replace(/\s+(?:inc|incorporated|corp|corporation|co|company|ltd|limited|plc|sa|ag|nv|se|holdings?|group|the)\b/gi, ' ').replace(/\s+/g, ' ').trim();
	return short ? `"${short}"` : '';
}

/** Whether an item is a newswire's release. */
export function isRelease(item: ICoverageItem): boolean {
	return WIRES.test(item.outlet.trim());
}

/**
 * The phrases and words of a Google News query, in lower case and without its operators: "Apple Inc" iPhone gives
 * apple inc and iphone.
 */
function queryTerms(words: string): string[] {
	const terms: string[] = [];
	for (const match of words.matchAll(/"(?<phrase>[^"]+)"|(?<word>[^\s"]+)/g)) {
		const term = (match.groups?.phrase ?? match.groups?.word ?? '').replace(/^\(+|\)+$/g, '').trim().toLowerCase();
		if (term && term !== 'or' && term !== 'and' && !term.startsWith('-') && !term.includes(':')) {
			terms.push(term);
		}
	}
	return terms;
}

/** A Google News query without what only Google News reads: after:, site: and the like. */
function searchWords(words: string): string {
	return words.split(/\s+/).filter(word => !/^-?[a-z]+:/i.test(word)).join(' ');
}

interface IKeyedResult {
	readonly items: readonly ICoverageItem[];
	readonly total: number;
}

interface INewYorkTimesAnswer {
	readonly response?: {
		readonly docs?: readonly { readonly web_url: string; readonly pub_date: string; readonly source?: string; readonly headline?: { readonly main?: string } }[];
		// meta in the API's first form, metadata in its second
		readonly meta?: { readonly hits?: number };
		readonly metadata?: { readonly hits?: number };
	};
}

interface IGuardianAnswer {
	readonly response?: {
		readonly status?: string;
		readonly total?: number;
		readonly pages?: number;
		readonly results?: readonly { readonly webUrl: string; readonly webTitle: string; readonly webPublicationDate: string }[];
	};
}

/** The items without the same story twice: the first one listed keeps it. */
function distinct(items: readonly ICoverageItem[]): ICoverageItem[] {
	const seen = new Set<string>();
	return items.filter(item => {
		const key = item.url.replace(/[?#].*$/, '');
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

export class MediaCoverageService implements IMediaCoverageService {

	declare readonly _serviceBrand: undefined;

	constructor(
		@IRssFeedsService private readonly rssFeedsService: IRssFeedsService,
		@IPrNewswireService private readonly prNewswireService: IPrNewswireService,
		@IRequestService private readonly requestService: IRequestService,
		@ISecretStorageService private readonly secretStorageService: ISecretStorageService,
		@IStorageService private readonly storageService: IStorageService,
	) { }

	getSources(): readonly CoverageSource[] {
		let sources: readonly CoverageSource[] = DEFAULT_SOURCES;
		try {
			const stored = this.storageService.get(SOURCES_KEY, StorageScope.APPLICATION);
			if (stored) {
				sources = (JSON.parse(stored) as CoverageSource[]).filter(source => COVERAGE_SOURCES.includes(source));
			}
		} catch {
			// The defaults
		}
		// PR Newswire's releases are kept only while it is ticked, which its reader remembers
		return [...sources.filter(source => source !== 'prNewswire'), ...this.prNewswireService.forMediaCoverage ? ['prNewswire' as const] : []];
	}

	setSources(sources: readonly CoverageSource[]): void {
		this.storageService.store(SOURCES_KEY, JSON.stringify(sources.filter(source => source !== 'prNewswire')), StorageScope.APPLICATION, StorageTarget.USER);
		this.prNewswireService.setWanted('mediaCoverage', sources.includes('prNewswire'));
	}

	async hasKey(source: KeyedSource): Promise<boolean> {
		return !!await this.secretStorageService.get(CREDENTIALS[source].secretKey);
	}

	async setKey(source: KeyedSource, key: string): Promise<void> {
		if (key.trim()) {
			await this.secretStorageService.set(CREDENTIALS[source].secretKey, key.trim());
		} else {
			await this.secretStorageService.delete(CREDENTIALS[source].secretKey);
		}
	}

	async getCoverage(query: ICoverageQuery): Promise<ICoverage> {
		const end = Math.min(query.end, Date.now());
		const start = Math.min(query.start, end);
		const span = end - start;
		// Hours up to three days, days up to half a year, else weeks
		const bucket = span <= 3 * DAY ? HOUR : span <= 183 * DAY ? DAY : 7 * DAY;
		const first = Math.floor(start / bucket) * bucket;
		const times: number[] = [];
		for (let time = first; time < end; time += bucket) {
			times.push(time);
		}
		const index = (time: number) => Math.floor((time - first) / bucket);
		const failed: CoverageSource[] = [];
		const noKey: KeyedSource[] = [];
		const counts: ICoverageCount[] = [];
		const words = query.words.trim();
		const ticker = query.ticker?.trim().toUpperCase();
		const wants = (source: CoverageSource) => query.sources.includes(source);
		const keyed = async (source: KeyedSource, search: (key: string) => Promise<IKeyedResult | undefined>) => {
			if (!wants(source) || !words) {
				return [];
			}
			const key = await this.secretStorageService.get(CREDENTIALS[source].secretKey);
			if (!key) {
				noKey.push(source);
				return [];
			}
			const result = await search(key);
			if (!result) {
				failed.push(source);
				return [];
			}
			if (result.total > result.items.length) {
				counts.push({ source, listed: result.items.length, total: result.total });
			}
			return result.items;
		};

		const [googleNews, yahoo, newYorkTimes, guardian, prNewswire] = await Promise.all([
			wants('googleNews') && words ? this.getGoogleNews(words, start, end) : Promise.resolve([]),
			wants('yahoo') && ticker ? this.getYahoo(ticker) : Promise.resolve([]),
			keyed('newYorkTimes', key => this.getNewYorkTimes(words, start, end, key)),
			keyed('guardian', key => this.getGuardian(words, start, end, key)),
			wants('prNewswire') ? this.getPrNewswire(words, ticker, start, end) : Promise.resolve([]),
		]);
		if (!googleNews) {
			failed.push('googleNews');
		}
		if (!yahoo) {
			failed.push('yahoo');
		}

		// The same story may come from several sources: the first one listed keeps it
		const items = distinct([...prNewswire, ...newYorkTimes, ...guardian, ...yahoo ?? [], ...googleNews ?? []])
			.filter(item => item.time >= start && item.time <= end)
			.sort((a, b) => b.time - a.time);
		const articles = times.map(() => 0);
		for (const item of items) {
			const at = index(item.time);
			if (at >= 0 && at < times.length) {
				articles[at]++;
			}
		}

		return {
			query: { ...query, start, end },
			items,
			times,
			bucket,
			articles,
			failed,
			noKey,
			counts,
		};
	}

	async getEventCoverage(name: string, time: number, ticker?: string): Promise<IEventCoverage | undefined> {
		const words = newsName(name);
		if (!words) {
			return { items: [] };
		}
		const start = time - DAY;
		const end = time + DAY;
		// The plain search may leave the release out among the articles about it, so the wires are asked apart
		const [releases, articles, prNewswire] = await Promise.all([
			this.getGoogleNews(`${words} ${WIRE_SEARCH}`, start, end),
			this.getGoogleNews(words, start, end),
			this.getPrNewswire(words, ticker, start, end),
		]);
		if (!releases && !articles && !prNewswire.length) {
			return undefined;
		}
		// PR Newswire's own items first: they keep the release, with the wire's time to the second
		const items = distinct([...prNewswire, ...releases ?? [], ...articles ?? []])
			.filter(item => item.time >= start && item.time <= end)
			.sort((a, b) => a.time - b.time);
		return { release: items.find(item => isRelease(item) && item.time <= time + RELEASE_AFTER), items };
	}

	/** Yahoo Finance's latest headlines of `ticker`; undefined when it does not answer. */
	private async getYahoo(ticker: string): Promise<readonly ICoverageItem[] | undefined> {
		const items = await this.rssFeedsService.previewFeed(`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(ticker)}&region=US&lang=en-US`);
		return items?.filter(item => item.date).map(item => ({ source: 'yahoo' as const, title: item.title, outlet: 'Yahoo Finance', time: item.date, url: item.link.replace(/\?\.tsrc=rss$/, '') }));
	}

	/**
	 * PR Newswire's releases over the period that Pollis kept from its feeds: those whose title and summary hold all
	 * the query's words, or whose summary gives the ticker, as in (NYSE: ABC).
	 */
	private async getPrNewswire(words: string, ticker: string | undefined, start: number, end: number): Promise<readonly ICoverageItem[]> {
		const terms = queryTerms(words);
		const tickerPattern = ticker ? new RegExp(`\\([^()]*:\\s*${escapeRegExpCharacters(ticker)}\\b[^()]*\\)`, 'i') : undefined;
		if (!terms.length && !tickerPattern) {
			return [];
		}
		const releases = await this.prNewswireService.search(start, end);
		return releases.filter(release => {
			const text = `${release.title} ${release.summary ?? ''}`;
			const lower = text.toLowerCase();
			return (terms.length > 0 && terms.every(term => lower.includes(term))) || !!tickerPattern?.test(text);
		}).map(release => ({ source: 'prNewswire' as const, title: release.title, outlet: 'PR Newswire', time: release.time, url: release.link }));
	}

	/** The New York Times's Article Search over the period, newest first, a page of 10 at a time; undefined when it refuses. */
	private async getNewYorkTimes(words: string, start: number, end: number, key: string): Promise<IKeyedResult | undefined> {
		const day = (time: number) => new Date(time).toISOString().slice(0, 10).replace(/-/g, '');
		const items: ICoverageItem[] = [];
		let total = 0;
		for (let page = 0; page < NEW_YORK_TIMES_PAGES; page++) {
			const answer = await this.fetchJson<INewYorkTimesAnswer>(`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${encodeURIComponent(searchWords(words))}&begin_date=${day(start)}&end_date=${day(end)}&sort=newest&page=${page}&api-key=${encodeURIComponent(key)}`);
			const response = answer?.response;
			if (!response) {
				// Past the first page, the limit of 5 requests a minute: what came is kept
				return page ? { items, total } : undefined;
			}
			total = response.metadata?.hits ?? response.meta?.hits ?? 0;
			for (const doc of response.docs ?? []) {
				const time = Date.parse(doc.pub_date);
				if (doc.web_url && doc.headline?.main && !isNaN(time)) {
					items.push({ source: 'newYorkTimes', title: doc.headline.main, outlet: doc.source || 'The New York Times', time, url: doc.web_url });
				}
			}
			if (!response.docs?.length || items.length >= total) {
				break;
			}
		}
		return { items, total };
	}

	/** The Guardian's content search over the period, newest first, a page of 200 at a time; undefined when it refuses. */
	private async getGuardian(words: string, start: number, end: number, key: string): Promise<IKeyedResult | undefined> {
		const day = (time: number) => new Date(time).toISOString().slice(0, 10);
		const items: ICoverageItem[] = [];
		let total = 0;
		for (let page = 1; page <= GUARDIAN_PAGES; page++) {
			if (page > 1) {
				// A request a second
				await timeout(1000);
			}
			const response = (await this.fetchJson<IGuardianAnswer>(`https://content.guardianapis.com/search?q=${encodeURIComponent(searchWords(words))}&from-date=${day(start)}&to-date=${day(end)}&order-by=newest&page-size=200&page=${page}&api-key=${encodeURIComponent(key)}`))?.response;
			if (response?.status !== 'ok') {
				return page > 1 ? { items, total } : undefined;
			}
			total = response.total ?? 0;
			for (const result of response.results ?? []) {
				const time = Date.parse(result.webPublicationDate);
				if (result.webUrl && result.webTitle && !isNaN(time)) {
					items.push({ source: 'guardian', title: result.webTitle, outlet: 'The Guardian', time, url: result.webUrl });
				}
			}
			if (page >= (response.pages ?? 0)) {
				break;
			}
		}
		return { items, total };
	}

	private async fetchJson<T>(url: string): Promise<T | undefined> {
		try {
			const context = await this.requestService.request({ type: 'GET', url, timeout: 20000, callSite: 'pollis.mediaCoverage' }, CancellationToken.None);
			return isSuccess(context) ? await asJson<T>(context) ?? undefined : undefined;
		} catch {
			return undefined;
		}
	}

	/** Google News's search of `words` over the period; its titles end with the publisher's name. */
	private async getGoogleNews(words: string, start: number, end: number): Promise<readonly ICoverageItem[] | undefined> {
		const day = (time: number) => new Date(time).toISOString().slice(0, 10);
		const search = `${words} after:${day(start - DAY)} before:${day(end + DAY)}`;
		const items = await this.rssFeedsService.previewFeed(`https://news.google.com/rss/search?q=${encodeURIComponent(search)}&hl=en-US&gl=US&ceid=US:en`);
		return items?.filter(item => item.date).map(item => {
			const split = /^(?<title>.*\S)\s+-\s+(?<outlet>[^-]+)$/.exec(item.title)?.groups;
			return { source: 'googleNews' as const, title: split?.title ?? item.title, outlet: split?.outlet.trim() ?? 'Google News', time: item.date, url: item.link };
		});
	}
}

registerSingleton(IMediaCoverageService, MediaCoverageService, InstantiationType.Delayed);
