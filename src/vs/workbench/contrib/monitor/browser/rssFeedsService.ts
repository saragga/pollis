/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { disposableTimeout, IntervalTimer, timeout } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { ConfigurationTarget, IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IRequestContext, IRequestOptions } from '../../../../base/parts/request/common/request.js';
import { asText, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { decodeEntities } from '../../../../platform/alertsMailbox/common/alertEmails.js';
import { ALERT_SOURCES, AlertSource, IAlertEmail, IAlertsMailbox, IAlertsMailboxPosition } from '../../../../platform/alertsMailbox/common/alertsMailbox.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { ARXIV_TOPIC, DEFAULT_FEEDS, findCatalogueFeed, PUBMED_SEARCH, RENAMED_TOPICS, requestSpacing, youtubeFeedUrl } from './rssCatalogue.js';
import { findOxfordFeeds } from './oxfordJournals.js';
import { FetchText, IArticleRecord, lookUpArticle } from './articleLookup.js';

// Explore > Monitor > RSS Feeds: the feeds the user follows, by topic, read by Pollis itself (RSS 2.0 and Atom, and
// PubMed searches, YouTube channels and podcasts), with the items kept between sessions and which of them have been
// read. A feed unsubscribed is no longer read, but its items stay. The welcome page shows the newest unread ones of
// the feeds shown there. Every item received is also added to
// the archive, JSON Lines files in ~/.pollis/rss/items that the PollisRSS database of the Databases view reads, and
// every item added to Zotero to ~/.pollis/rss/zotero.jsonl, its zotero view. Podcast episodes downloaded go to
// ~/.pollis/rss/episodes, and are listed in ~/.pollis/rss/episodes.jsonl, its episodes view.

export const RSS_FEEDS_SETTING = 'pollis.rss.feeds';
// The topics hidden on the welcome page, before it was set by feed: read once, to hide their feeds there instead
const LEGACY_HIDDEN_TOPICS_SETTING = 'pollis.rss.welcomeHiddenTopics';
const WELCOME_HIDDEN_FEEDS_SETTING = 'pollis.rss.welcomeHiddenFeeds';
const HIDDEN_FEEDS_SETTING = 'pollis.rss.hiddenFeeds';
const UNSUBSCRIBED_FEEDS_SETTING = 'pollis.rss.unsubscribedFeeds';
const REMOVED_FEEDS_SETTING = 'pollis.rss.removedFeeds';
const DISPLAY_DAYS_SETTING = 'pollis.rss.displayDays';
const ALERTS_MAILBOX_SETTING = 'pollis.rss.alertsMailbox';
/** The display periods offered, in days; 0 shows every item kept. */
export const DISPLAY_DAYS = [7, 30, 90, 0] as const;
const DAY = 24 * 60 * 60 * 1000;
// The topic of a feed the setting and the catalogue give none
export const OTHER_TOPIC = 'Other';

// The feeds as last read, and the ids of the items read.
const FEEDS_KEY = 'pollis.rss.items';
const READ_KEY = 'pollis.rss.read';
// The ids of the items added to Zotero, and the files of the episodes downloaded by item id.
const ZOTERO_KEY = 'pollis.rss.zotero';
const EPISODES_KEY = 'pollis.rss.episodes';
// Set once the items kept before the archive existed have been added to it.
const ARCHIVED_KEY = 'pollis.rss.archived';
// Set once the feeds followed have been moved to the topics renamed, and the catalogue's arXiv feeds to their subjects.
const TOPICS_MOVED_KEY = 'pollis.rss.topicsMoved3';
// The alerts found in the alerts mailbox, with their articles, and where its last reading stopped; its password is a secret.
const EMAIL_ALERTS_KEY = 'pollis.rss.emailAlerts';
const ALERTS_MAILBOX_POSITION_KEY = 'pollis.rss.alertsMailboxPosition';
const ALERTS_MAILBOX_PASSWORD_KEY = 'pollis.rss.alertsMailboxPassword';
// The ISSN of the journal of each feed of the user's own, found by looking up its first items; null when it is no journal's.
const JOURNAL_FEEDS_KEY = 'pollis.rss.journalFeeds';
// The time between the lookups of two articles of the email alerts at Crossref and OpenAlex, and how Pollis introduces
// itself to them (Crossref's polite pool asks for a contact).
const ARTICLE_LOOKUP_SPACING = 250;
const SCHOLARLY_USER_AGENT = 'Pollis (https://pollis.org; mailto:contact@pollis.org)';
// The longest summary kept for an item.
const MAX_SUMMARY = 400;
// The server Zotero runs on this computer for its browser connectors, which adds items to the library.
const ZOTERO_CONNECTOR = 'http://127.0.0.1:23119/connector';
const CHECK_INTERVAL = 60 * 60 * 1000;
// The items kept for each feed: the newest, since an arXiv feed lists a whole day of papers.
const MAX_ITEMS = 200;

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'pollisRssFeeds',
	title: localize('rss.configurationTitle', "Pollis RSS Feeds"),
	type: 'object',
	properties: {
		[RSS_FEEDS_SETTING]: {
			type: 'array',
			items: {
				anyOf: [
					{ type: 'string' },
					{
						type: 'object',
						required: ['url'],
						properties: {
							url: { type: 'string', description: localize('rss.feedUrl', "The address of the feed.") },
							topic: { type: 'string', description: localize('rss.feedTopic', "The topic the feed is listed under.") },
							name: { type: 'string', description: localize('rss.feedName', "The name shown for the feed, instead of its own title.") },
						},
					},
				],
			},
			default: DEFAULT_FEEDS,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('rss.feedsSetting', "The RSS and Atom feeds shown in **Explore > Monitor > RSS Feeds** and on the welcome page: an address, or an address with a topic and a name."),
		},
		[WELCOME_HIDDEN_FEEDS_SETTING]: {
			type: 'array',
			items: { type: 'string' },
			default: [],
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('rss.welcomeHiddenFeedsSetting', "The addresses of the feeds of **Explore > Monitor > RSS Feeds** whose news the welcome page does not show."),
		},
		[UNSUBSCRIBED_FEEDS_SETTING]: {
			type: 'array',
			items: { type: 'string' },
			default: [],
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('rss.unsubscribedFeedsSetting', "The addresses of the feeds of **Explore > Monitor > RSS Feeds** that are no longer read. Their items stay, and are still shown."),
		},
		[REMOVED_FEEDS_SETTING]: {
			type: 'array',
			items: {
				type: 'object',
				required: ['url', 'title'],
				properties: {
					url: { type: 'string', description: localize('rss.removedUrl', "The address of the feed.") },
					title: { type: 'string', description: localize('rss.removedTitle', "The name the feed was shown with.") },
					topic: { type: 'string', description: localize('rss.removedTopic', "The topic the feed was listed under.") },
					name: { type: 'string', description: localize('rss.removedName', "The name the feed was given, if any.") },
					followed: { type: 'boolean', description: localize('rss.removedFollowed', "Whether the feed was followed when it was removed, rather than only offered by the catalogue.") },
				},
			},
			default: [],
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('rss.removedFeedsSetting', "The feeds removed from **Explore > Monitor > RSS Feeds**, which **Add Feed > Undo Remove...** brings back."),
		},
		[HIDDEN_FEEDS_SETTING]: {
			type: 'array',
			items: { type: 'string' },
			default: [],
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('rss.hiddenFeedsSetting', "The addresses of the feeds of **Explore > Monitor > RSS Feeds** whose items are not shown, there or on the welcome page. They are still read and archived."),
		},
		[ALERTS_MAILBOX_SETTING]: {
			type: 'object',
			properties: {
				server: { type: 'string', description: localize('rss.mailboxServer', "The IMAP server of the mailbox, such as imap.gmail.com.") },
				port: { type: 'number', default: 993, description: localize('rss.mailboxPort', "The port of the IMAP server, with TLS.") },
				user: { type: 'string', description: localize('rss.mailboxUser', "The email address, or the user name, the mailbox is opened with.") },
				folder: { type: 'string', default: 'INBOX', description: localize('rss.mailboxFolder', "The folder the alerts arrive in.") },
			},
			default: {},
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('rss.alertsMailboxSetting', "The email address the alerts of Google Scholar, JSTOR, HeinOnline and other sources are sent to, which **Explore > Monitor > RSS Feeds** reads, read only, to make a feed of each alert. Set it with **Add Feed > Alerts Mailbox...**, which keeps the password in the system's keychain."),
		},
		[DISPLAY_DAYS_SETTING]: {
			type: 'number',
			enum: [...DISPLAY_DAYS],
			enumDescriptions: [
				localize('rss.days7', "The last 7 days"),
				localize('rss.days30', "The last 30 days"),
				localize('rss.days90', "The last 90 days"),
				localize('rss.daysAll', "Every item kept"),
			],
			default: 30,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('rss.displayDaysSetting', "How far back **Explore > Monitor > RSS Feeds** and the welcome page show items, in days; 0 shows every item kept. Items without a date are always shown."),
		},
	},
});

/** A feed the user follows, as the setting gives it. */
export interface IRssFeedEntry {
	readonly url: string;
	readonly topic?: string;
	readonly name?: string;
}

export interface IRssItem {
	/** The item's guid, else its link: what marks it read. */
	readonly id: string;
	readonly title: string;
	readonly link: string;
	/** Milliseconds since 1970, or 0 when the feed gives no date. */
	readonly date: number;
	/** The start of the item's text, without markup. */
	readonly summary?: string;
	/** A picture of the item: a video's thumbnail, a podcast's cover. */
	readonly image?: string;
	/** The audio or video file of a podcast episode. */
	readonly media?: string;
	/** Whether the item is a video (a YouTube video, or a video podcast's episode) or an audio episode. */
	readonly mediaType?: 'video' | 'audio';
	/** The ISSNs of the article's journal, when the feed names them (PubMed). */
	readonly issns?: readonly string[];
}

export interface IRssFeed {
	readonly url: string;
	/** The name the setting gives, else the catalogue's, else the feed's own title, else its address. */
	readonly title: string;
	readonly topic: string;
	/** Newest first. */
	readonly items: readonly IRssItem[];
	/** Set when the feed could not be read the last time it was looked up. */
	readonly error?: boolean;
}

/** A feed removed from the page, as it was then; `followed` when it was followed, not only offered by the catalogue. */
export interface IRemovedFeed extends IRssFeedEntry {
	readonly title: string;
	readonly followed: boolean;
}

/** The start of the address of an email alert's feed, which Pollis makes from the alerts mailbox. */
export const EMAIL_ALERT_PREFIX = 'email-alert:';

/** An alert found in the alerts mailbox: the address of its feed, its name and its source. */
export interface IEmailAlert {
	readonly url: string;
	readonly name: string;
	readonly source: AlertSource;
}

/** An alert as kept: its name, source and articles, newest first. */
interface IStoredAlert {
	readonly name: string;
	readonly source: AlertSource;
	readonly items: readonly IRssItem[];
}

export const IRssFeedsService = createDecorator<IRssFeedsService>('pollisRssFeedsService');

export interface IRssFeedsService {
	readonly _serviceBrand: undefined;
	/** Fires when feeds are read or added or removed, when items are marked read or unread, added to Zotero or downloaded, and when a feed is subscribed, shown or hidden. */
	readonly onDidChange: Event<void>;
	/** The feeds, in the order of the setting. */
	getFeeds(): readonly IRssFeed[];
	isRead(id: string): boolean;
	/** Marks the items `ids` read, and returns those that were not read before. */
	markRead(ids: readonly string[]): readonly string[];
	markUnread(ids: readonly string[]): void;
	/** Reads every feed again. */
	refresh(): Promise<void>;
	/** Follows the feeds `added` and stops following the feeds at the addresses `removed`, in one change of the setting. */
	updateFeeds(added: readonly IRssFeedEntry[], removed: readonly string[]): Promise<void>;
	/** Takes the feeds `urls` off the page for good, followed or only offered by the catalogue, until {@link restoreFeeds}. */
	removeFeeds(urls: readonly string[]): Promise<void>;
	/** The feeds removed, the last removed last. */
	getRemovedFeeds(): readonly IRemovedFeed[];
	/** Brings the removed feeds `urls` back as they were: followed again, or offered again by the catalogue. */
	restoreFeeds(urls: readonly string[]): Promise<void>;
	/** Whether the feed at `url` is read; a feed unsubscribed is not, but its items stay. */
	isSubscribed(url: string): boolean;
	setSubscribed(urls: readonly string[], subscribed: boolean): Promise<void>;
	/** Whether the newest unread items of the feed at `url` are on the welcome page. */
	isFeedOnWelcomePage(url: string): boolean;
	setFeedsOnWelcomePage(urls: readonly string[], shown: boolean): Promise<void>;
	/** Whether the items of the feed at `url` are shown; a feed not shown is still read and archived. */
	isFeedShown(url: string): boolean;
	setFeedsShown(urls: readonly string[], shown: boolean): Promise<void>;
	/** How far back items are shown, in days; 0 for every item kept. */
	getDisplayDays(): number;
	setDisplayDays(days: number): Promise<void>;
	/** The items of `feed` of the display period, shown or not. */
	getItemsInPeriod(feed: IRssFeed): readonly IRssItem[];
	/** The items of `feed` to show: none when the feed is not shown, else those of the display period. */
	getShownItems(feed: IRssFeed): readonly IRssItem[];
	/** The feed of the YouTube channel at an address, `@handle` or channel id; undefined when there is none. */
	findYouTubeFeed(channel: string): Promise<{ readonly url: string; readonly name?: string } | undefined>;
	/**
	 * The feeds at an address: the address itself when it is a feed; for a journal's page at Wiley, Taylor & Francis,
	 * SAGE or Elsevier, the feed of its tables of contents; for one at Oxford Academic, its feeds of the current issue,
	 * the advance articles and the open access articles; else the feeds the page lists. Empty when there are none.
	 */
	findFeeds(address: string): Promise<readonly { readonly url: string; readonly name?: string }[]>;
	/** The alerts mailbox, when one is set. */
	getAlertsMailbox(): IAlertsMailbox | undefined;
	/** Reads `mailbox` with `password`, and keeps both when it can be read; returns the server's message when not. */
	setAlertsMailbox(mailbox: IAlertsMailbox, password: string): Promise<string | undefined>;
	/**
	 * The alerts found in the alerts mailbox (Google Scholar, JSTOR, HeinOnline and other sources), read again first,
	 * one feed each, by source and name; undefined when there is no mailbox or it cannot be read.
	 */
	getEmailAlerts(): Promise<readonly IEmailAlert[] | undefined>;
	/**
	 * The libraries and collections of the Zotero open on this computer, and the one selected in it; undefined when
	 * Zotero is not open.
	 */
	getZoteroTargets(): Promise<{ readonly selected: string; readonly targets: readonly IZoteroTarget[] } | undefined>;
	/**
	 * Adds the item `id` to Zotero, in the library or collection `target` named `targetName`, and records it in the
	 * PollisRSS database. False when Zotero did not take it.
	 */
	addToZotero(id: string, target: string, targetName: string): Promise<boolean>;
	/** Whether the item `id` was added to Zotero. */
	isInZotero(id: string): boolean;
	/**
	 * Downloads the audio or video file of the podcast episode `id` to ~/.pollis/rss/episodes, by feed, and records it
	 * in the PollisRSS database; returns the file, or undefined when it could not be downloaded.
	 */
	downloadEpisode(id: string): Promise<URI | undefined>;
	/** The file of the episode `id`, when it was downloaded. */
	getEpisodeFile(id: string): URI | undefined;
	/**
	 * The ISSNs of the journal the item `id` of the feed at `url` is from: the catalogue's for its feeds, the one found
	 * at Crossref and OpenAlex for an email alert's article, or, for a feed of the user's own, the one found for its
	 * first items. Empty when the item is not known to be a journal's.
	 */
	getJournalIssns(url: string, id: string): readonly string[];
}

/** A library (`L1`) or collection (`C12`) of Zotero, and how deep it is in the tree of collections. */
export interface IZoteroTarget {
	readonly id: string;
	readonly name: string;
	readonly level: number;
}

interface IStoredFeed {
	readonly title: string;
	readonly items: readonly IRssItem[];
}

/**
 * Reads the feeds from the window, where only the feeds that allow it (CORS) can be read; the desktop reads them from
 * the main process instead (see ../electron-browser/rssFeedsService.ts).
 */
export class RssFeedsService extends Disposable implements IRssFeedsService {

	declare readonly _serviceBrand: undefined;

	private readonly _onDidChange = this._register(new Emitter<void>());
	readonly onDidChange = this._onDidChange.event;

	private stored: Record<string, IStoredFeed>;
	private read: Set<string>;
	private zotero: Set<string>;
	private episodes: Record<string, string>;
	private readonly failed = new Set<string>();
	private refreshing: Promise<void> | undefined;
	private alerts: Record<string, IStoredAlert>;
	private readingMailbox: Promise<boolean> | undefined;
	private mailboxFailed = false;
	private readonly archiveFolder: URI;
	// The articles of the email alerts, looked up one after another, for the PollisJournals database
	private readonly articlesFile: URI;
	private lookingUp: Promise<void> = Promise.resolve();
	// The ISSN of the journal of each email alert's article found, by item id, and of the user's own feeds, by address
	private readonly articleIssns = new Map<string, string>();
	private journalFeeds: Record<string, string | null>;

	constructor(
		@IRequestService private readonly requestService: IRequestService,
		@IStorageService private readonly storageService: IStorageService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IFileService private readonly fileService: IFileService,
		@IPathService pathService: IPathService,
		@ISecretStorageService private readonly secretStorageService: ISecretStorageService,
	) {
		super();
		// Julia reads the archive on this machine, so it lives in the local home folder
		this.archiveFolder = joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'rss', 'items');
		this.articlesFile = joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'journals', 'articles.jsonl');
		this.stored = this.readStorage<Record<string, IStoredFeed>>(FEEDS_KEY, {});
		this.read = new Set(this.readStorage<string[]>(READ_KEY, []));
		this.zotero = new Set(this.readStorage<string[]>(ZOTERO_KEY, []));
		this.episodes = this.readStorage<Record<string, string>>(EPISODES_KEY, {});
		this.alerts = this.readStorage<Record<string, IStoredAlert>>(EMAIL_ALERTS_KEY, {});
		this.journalFeeds = this.readStorage<Record<string, string | null>>(JOURNAL_FEEDS_KEY, {});
		this.readArticleIssns();

		// After the constructor, so that a subclass can read the feeds its own way
		this._register(disposableTimeout(() => {
			this.migrateWelcomeTopics();
			this.moveTopics();
			this.refresh();
		}));
		const timer = this._register(new IntervalTimer());
		timer.cancelAndSet(() => this.refresh(), CHECK_INTERVAL);
		this._register(this.configurationService.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration(RSS_FEEDS_SETTING) || e.affectsConfiguration(UNSUBSCRIBED_FEEDS_SETTING)) {
				// Shown at once; a feed followed or subscribed again is then read, after a reading under way, which may not include it
				this._onDidChange.fire();
				this.refreshAfterCurrent();
			} else if (e.affectsConfiguration(WELCOME_HIDDEN_FEEDS_SETTING) || e.affectsConfiguration(HIDDEN_FEEDS_SETTING) || e.affectsConfiguration(DISPLAY_DAYS_SETTING)) {
				this._onDidChange.fire();
			}
		}));
	}

	getFeeds(): readonly IRssFeed[] {
		return this.getEntries().map(({ url, topic, name }) => {
			const catalogue = findCatalogueFeed(url);
			return {
				url,
				title: name || catalogue?.feed.name || this.stored[url]?.title || url,
				topic: topic || catalogue?.topic || OTHER_TOPIC,
				items: this.stored[url]?.items ?? [],
				error: (this.failed.has(url) && this.isSubscribed(url)) || undefined,
			};
		});
	}

	isRead(id: string): boolean {
		return this.read.has(id);
	}

	markRead(ids: readonly string[]): readonly string[] {
		const unread = [...new Set(ids)].filter(id => !this.read.has(id));
		if (unread.length) {
			unread.forEach(id => this.read.add(id));
			this.storeRead();
			this._onDidChange.fire();
		}
		return unread;
	}

	markUnread(ids: readonly string[]): void {
		const read = ids.filter(id => this.read.delete(id));
		if (read.length) {
			this.storeRead();
			this._onDidChange.fire();
		}
	}

	refresh(): Promise<void> {
		this.refreshing ??= this.readAll().finally(() => this.refreshing = undefined);
		return this.refreshing;
	}

	/** Reads the feeds again once the reading under way, if any, is over. */
	private async refreshAfterCurrent(): Promise<void> {
		await this.refreshing;
		await this.refresh();
	}

	async updateFeeds(added: readonly IRssFeedEntry[], removed: readonly string[]): Promise<void> {
		// The setting's own entries are kept as they are written, addresses or objects
		const value = this.configurationService.getValue<unknown>(RSS_FEEDS_SETTING);
		const current: unknown[] = Array.isArray(value) ? value : [];
		const kept = current.filter(entry => !removed.includes(toEntry(entry)?.url ?? ''));
		const urls = new Set(kept.map(entry => toEntry(entry)?.url));
		const fresh = added.filter(entry => !urls.has(entry.url));
		if (fresh.length || kept.length !== current.length) {
			await this.configurationService.updateValue(RSS_FEEDS_SETTING, [...kept, ...fresh], ConfigurationTarget.USER);
		}
		// A feed added again that was unsubscribed is read again, and one removed before is no longer
		if (added.some(entry => !this.isSubscribed(entry.url))) {
			await this.setSubscribed(added.map(entry => entry.url), true);
		}
		await this.forgetRemoved(added.map(entry => entry.url));
	}

	async removeFeeds(urls: readonly string[]): Promise<void> {
		const value = this.configurationService.getValue<unknown>(RSS_FEEDS_SETTING);
		const entries = (Array.isArray(value) ? value : []).map(toEntry);
		const removed = urls.map((url): IRemovedFeed => {
			const entry = entries.find(entry => entry?.url === url);
			const catalogue = findCatalogueFeed(url);
			return {
				url,
				title: this.getFeeds().find(feed => feed.url === url)?.title ?? catalogue?.feed.name ?? url,
				topic: entry ? entry.topic : catalogue?.topic,
				name: entry?.name,
				followed: !!entry,
			};
		});
		const others = this.getRemovedFeeds().filter(feed => !urls.includes(feed.url));
		await this.configurationService.updateValue(REMOVED_FEEDS_SETTING, [...others, ...removed], ConfigurationTarget.USER);
		await this.updateFeeds([], urls);
	}

	getRemovedFeeds(): readonly IRemovedFeed[] {
		const value = this.configurationService.getValue<unknown>(REMOVED_FEEDS_SETTING);
		return (Array.isArray(value) ? value : []).flatMap((value): IRemovedFeed[] => {
			const entry = toEntry(value);
			const { title, followed } = value as Partial<IRemovedFeed>;
			return entry ? [{ ...entry, title: typeof title === 'string' && title ? title : entry.url, followed: followed === true }] : [];
		});
	}

	async restoreFeeds(urls: readonly string[]): Promise<void> {
		const followed = this.getRemovedFeeds().filter(feed => feed.followed && urls.includes(feed.url));
		await this.updateFeeds(followed.map(({ url, topic, name }) => ({ url, topic, name })), []);
		await this.forgetRemoved(urls);
	}

	/** Takes `urls` out of the feeds removed. */
	private async forgetRemoved(urls: readonly string[]): Promise<void> {
		const removed = this.getRemovedFeeds();
		if (removed.some(feed => urls.includes(feed.url))) {
			await this.configurationService.updateValue(REMOVED_FEEDS_SETTING, removed.filter(feed => !urls.includes(feed.url)), ConfigurationTarget.USER);
		}
	}

	isSubscribed(url: string): boolean {
		return !this.getStrings(UNSUBSCRIBED_FEEDS_SETTING).includes(url);
	}

	async setSubscribed(urls: readonly string[], subscribed: boolean): Promise<void> {
		await this.updateList(UNSUBSCRIBED_FEEDS_SETTING, urls, !subscribed);
	}

	isFeedOnWelcomePage(url: string): boolean {
		return !this.getStrings(WELCOME_HIDDEN_FEEDS_SETTING).includes(url);
	}

	async setFeedsOnWelcomePage(urls: readonly string[], shown: boolean): Promise<void> {
		await this.updateList(WELCOME_HIDDEN_FEEDS_SETTING, urls, !shown);
	}

	/** Adds `urls` to the list of the setting `key`, or takes them out of it. */
	private async updateList(key: string, urls: readonly string[], add: boolean): Promise<void> {
		const others = this.getStrings(key).filter(url => !urls.includes(url));
		await this.configurationService.updateValue(key, add ? [...others, ...urls] : others, ConfigurationTarget.USER);
	}

	/** The topics hidden on the welcome page before it was set by feed: their feeds are hidden there instead. */
	private async migrateWelcomeTopics(): Promise<void> {
		const topics = this.getStrings(LEGACY_HIDDEN_TOPICS_SETTING);
		if (topics.length) {
			await this.setFeedsOnWelcomePage(this.getFeeds().filter(feed => topics.includes(feed.topic)).map(feed => feed.url), false);
			await this.configurationService.updateValue(LEGACY_HIDDEN_TOPICS_SETTING, undefined, ConfigurationTarget.USER);
		}
	}

	/** Once: the feeds followed or removed under a topic renamed or split, or a catalogue's arXiv feed under arXiv, get their new topic. */
	private async moveTopics(): Promise<void> {
		if (this.storageService.getBoolean(TOPICS_MOVED_KEY, StorageScope.APPLICATION, false)) {
			return;
		}
		for (const key of [RSS_FEEDS_SETTING, REMOVED_FEEDS_SETTING]) {
			// Only the user's own value: the default feeds have their new topics already
			const value = this.configurationService.inspect<unknown>(key).userValue;
			if (!Array.isArray(value)) {
				continue;
			}
			let moved = false;
			const entries = value.map(value => {
				const entry = toEntry(value);
				const topic = entry?.topic && (Object.hasOwn(RENAMED_TOPICS, entry.topic) ? findCatalogueFeed(entry.url)?.topic ?? RENAMED_TOPICS[entry.topic] : entry.topic === ARXIV_TOPIC ? findCatalogueFeed(entry.url)?.topic : undefined);
				if (!topic) {
					return value;
				}
				moved = true;
				return { ...value, topic };
			});
			if (moved) {
				await this.configurationService.updateValue(key, entries, ConfigurationTarget.USER);
			}
		}
		this.storageService.store(TOPICS_MOVED_KEY, true, StorageScope.APPLICATION, StorageTarget.MACHINE);
	}

	isFeedShown(url: string): boolean {
		return !this.getStrings(HIDDEN_FEEDS_SETTING).includes(url);
	}

	async setFeedsShown(urls: readonly string[], shown: boolean): Promise<void> {
		await this.updateList(HIDDEN_FEEDS_SETTING, urls, !shown);
	}

	getDisplayDays(): number {
		const days = this.configurationService.getValue<unknown>(DISPLAY_DAYS_SETTING);
		return typeof days === 'number' && days >= 0 ? days : 30;
	}

	async setDisplayDays(days: number): Promise<void> {
		await this.configurationService.updateValue(DISPLAY_DAYS_SETTING, days, ConfigurationTarget.USER);
	}

	getShownItems(feed: IRssFeed): readonly IRssItem[] {
		return this.isFeedShown(feed.url) ? this.getItemsInPeriod(feed) : [];
	}

	getItemsInPeriod(feed: IRssFeed): readonly IRssItem[] {
		const days = this.getDisplayDays();
		const since = Date.now() - days * DAY;
		return days ? feed.items.filter(item => !item.date || item.date >= since) : feed.items;
	}

	async findYouTubeFeed(channel: string): Promise<{ readonly url: string; readonly name?: string } | undefined> {
		channel = channel.trim();
		const id = /(?:^|channel\/|channel_id=)(?<id>UC[\w-]{22})(?:$|[/?&])/.exec(channel)?.groups?.id;
		if (id) {
			return { url: youtubeFeedUrl(id) };
		}
		// A handle or another address of the channel: its page names the channel's id
		const address = /^https?:\/\//.test(channel) ? channel : `https://www.youtube.com/${channel.startsWith('@') ? channel : '@' + channel}`;
		const page = await this.fetchText(address).catch(() => undefined);
		const found = page && (/"externalId":"(?<id>UC[\w-]{22})"/.exec(page) ?? /channel_id=(?<id>UC[\w-]{22})/.exec(page))?.groups?.id;
		if (!found) {
			return undefined;
		}
		const name = /<meta property="og:title" content="(?<name>[^"]*)"/.exec(page)?.groups?.name;
		return { url: youtubeFeedUrl(found), name: name ? decodeEntities(name) : undefined };
	}

	getAlertsMailbox(): IAlertsMailbox | undefined {
		const value = this.configurationService.getValue<Partial<IAlertsMailbox> | undefined>(ALERTS_MAILBOX_SETTING);
		return value && typeof value.server === 'string' && value.server && typeof value.user === 'string' && value.user
			? { server: value.server, port: typeof value.port === 'number' ? value.port : 993, user: value.user, folder: typeof value.folder === 'string' && value.folder ? value.folder : 'INBOX' }
			: undefined;
	}

	async setAlertsMailbox(mailbox: IAlertsMailbox, password: string): Promise<string | undefined> {
		try {
			const { position, emails } = await this.readAlertsMailbox(mailbox, password, undefined);
			// Another mailbox's alerts are not this one's
			this.alerts = {};
			emails.forEach(email => this.addAlertEmail(email));
			await this.secretStorageService.set(ALERTS_MAILBOX_PASSWORD_KEY, password);
			await this.configurationService.updateValue(ALERTS_MAILBOX_SETTING, mailbox, ConfigurationTarget.USER);
			this.storeAlerts(mailbox, position);
			this.mailboxFailed = false;
			return undefined;
		} catch (error) {
			return error instanceof Error ? error.message : String(error);
		}
	}

	async getEmailAlerts(): Promise<readonly IEmailAlert[] | undefined> {
		if (!await this.readMailbox()) {
			return undefined;
		}
		const sources = Object.keys(ALERT_SOURCES);
		return Object.entries(this.alerts)
			.map(([id, alert]) => ({ url: EMAIL_ALERT_PREFIX + id, name: alert.name, source: alert.source }))
			.sort((a, b) => sources.indexOf(a.source) - sources.indexOf(b.source) || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
	}

	/** Reads the alerts mailbox, once at a time; false when there is none or it cannot be read. */
	private readMailbox(): Promise<boolean> {
		this.readingMailbox ??= (async () => {
			const mailbox = this.getAlertsMailbox();
			const password = mailbox && await this.secretStorageService.get(ALERTS_MAILBOX_PASSWORD_KEY);
			if (!mailbox || !password) {
				return false;
			}
			const stored = this.readStorage<Partial<IAlertsMailboxPosition> & { mailbox?: string }>(ALERTS_MAILBOX_POSITION_KEY, {});
			const position = stored.mailbox === mailboxKey(mailbox) && typeof stored.uidValidity === 'number' && typeof stored.lastUid === 'number' ? { uidValidity: stored.uidValidity, lastUid: stored.lastUid } : undefined;
			try {
				const read = await this.readAlertsMailbox(mailbox, password, position);
				read.emails.forEach(email => this.addAlertEmail(email));
				this.storeAlerts(mailbox, read.position);
				this.mailboxFailed = false;
			} catch {
				this.mailboxFailed = true;
			}
			return !this.mailboxFailed;
		})().finally(() => this.readingMailbox = undefined);
		return this.readingMailbox;
	}

	/** Adds the articles of an alert email to its alert, which takes the name of its latest email. */
	private addAlertEmail(email: IAlertEmail): void {
		const items = new Map<string, IRssItem>();
		const fresh = email.articles.map((article): IRssItem => ({ id: article.link, title: article.title, link: article.link, date: email.date, summary: article.summary || undefined }));
		for (const item of [...fresh, ...(this.alerts[email.id]?.items ?? [])]) {
			if (!items.has(item.id)) {
				items.set(item.id, item);
			}
		}
		this.alerts[email.id] = { name: email.name, source: email.source, items: [...items.values()].sort((a, b) => b.date - a.date).slice(0, MAX_ITEMS) };
	}

	private storeAlerts(mailbox: IAlertsMailbox, position: IAlertsMailboxPosition): void {
		this.storageService.store(EMAIL_ALERTS_KEY, JSON.stringify(this.alerts), StorageScope.APPLICATION, StorageTarget.MACHINE);
		this.storageService.store(ALERTS_MAILBOX_POSITION_KEY, JSON.stringify({ mailbox: mailboxKey(mailbox), ...position }), StorageScope.APPLICATION, StorageTarget.MACHINE);
	}

	/** The alert emails of `mailbox` after `position`: only the desktop can read a mailbox (../electron-browser/rssFeedsService.ts). */
	protected readAlertsMailbox(_mailbox: IAlertsMailbox, _password: string, _position: IAlertsMailboxPosition | undefined): Promise<{ readonly position: IAlertsMailboxPosition; readonly emails: readonly IAlertEmail[] }> {
		return Promise.reject(new Error(localize('rss.mailboxDesktopOnly', "Only the desktop app can read a mailbox.")));
	}

	async findFeeds(address: string): Promise<readonly { readonly url: string; readonly name?: string }[]> {
		address = address.trim();
		// Oxford Academic's journal pages turn away requests that do not come from a browser, and their feeds' numbers do not follow from the address
		const oxford = findOxfordFeeds(address);
		if (oxford) {
			return oxford;
		}
		const page = await this.fetchText(address).catch(() => undefined);
		const feed = page ? parseFeed(page) : undefined;
		if (feed) {
			return [{ url: address, name: feed.title || undefined }];
		}
		// Publishers' journal pages turn away requests that do not come from a browser: their feeds follow from the address
		const journalFeed = await this.journalFeedUrl(address);
		if (journalFeed) {
			const text = await this.fetchText(journalFeed).catch(() => undefined);
			const found = text ? parseFeed(text) : undefined;
			return found ? [{ url: journalFeed, name: found.title || undefined }] : [];
		}
		if (!page) {
			return [];
		}
		// The feeds a web page lists in its head: <link rel="alternate" type="application/rss+xml" href="...">
		const feeds: { url: string; name?: string }[] = [];
		for (const [tag] of page.matchAll(/<link\b[^>]*>/gi)) {
			const value = (name: string) => {
				const found = new RegExp(`\\s${name}\\s*=\\s*["'](?<value>[^"']*)["']`, 'i').exec(tag)?.groups?.value;
				return found === undefined ? undefined : decodeEntities(found);
			};
			const href = value('href');
			if (/\balternate\b/i.test(value('rel') ?? '') && /^application\/(?:rss|atom)\+xml$/i.test(value('type') ?? '') && href) {
				const url = new URL(href, address).toString();
				if (!feeds.some(feed => feed.url === url)) {
					feeds.push({ url, name: value('title') || undefined });
				}
			}
		}
		return feeds;
	}

	/**
	 * The feed of the newest issues of the journal at `address`, a page of Wiley, Taylor & Francis, SAGE or Elsevier
	 * (whose journal is found by the name in the address, through Crossref); undefined for other addresses.
	 */
	private async journalFeedUrl(address: string): Promise<string | undefined> {
		let url: URL;
		try {
			url = new URL(address);
		} catch {
			return undefined;
		}
		const host = url.hostname.replace(/^www\./, '');
		const path = url.pathname;
		if (host === 'onlinelibrary.wiley.com') {
			const issn = /^\/(?:journal|toc)\/(?<issn>\d{7}[\dx])/i.exec(path)?.groups?.issn;
			return issn && `https://onlinelibrary.wiley.com/feed/${issn}/most-recent`;
		}
		if (host === 'tandfonline.com') {
			const code = /^\/(?:journals|toc|loi)\/(?<code>[a-z]+\d*)/i.exec(path)?.groups?.code;
			return code && `https://www.tandfonline.com/feed/rss/${code}`;
		}
		if (host === 'journals.sagepub.com') {
			const code = /^\/(?:home|toc|loi)\/(?<code>[a-z]+)/i.exec(path)?.groups?.code;
			return code && `https://journals.sagepub.com/action/showFeed?ui=0&mi=ehikzz&ai=2b4&jc=${code}&type=etoc&feed=rss`;
		}
		if (host === 'sciencedirect.com') {
			const slug = /^\/journal\/(?<slug>[\w-]+)/.exec(path)?.groups?.slug;
			const issn = slug && await this.elsevierIssn(slug.replace(/-/g, ' '));
			return issn && `https://rss.sciencedirect.com/publication/science/${issn}`;
		}
		return undefined;
	}

	/** The ISSN, without its hyphen, of the Elsevier journal named `title`, as Crossref lists it. */
	private async elsevierIssn(title: string): Promise<string | undefined> {
		const text = await this.fetchText(`https://api.crossref.org/journals?rows=20&query=${encodeURIComponent(title)}`).catch(() => undefined);
		try {
			const journals = text ? (JSON.parse(text) as { message?: { items?: { title?: string; publisher?: string; ISSN?: string[] }[] } }).message?.items ?? [] : [];
			const simple = (name: string) => name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();
			const journal = journals.find(journal => /elsevier/i.test(journal.publisher ?? '') && simple(journal.title ?? '') === simple(title));
			return journal?.ISSN?.[0]?.replace('-', '').toUpperCase();
		} catch {
			return undefined;
		}
	}

	async getZoteroTargets(): Promise<{ readonly selected: string; readonly targets: readonly IZoteroTarget[] } | undefined> {
		try {
			const selection = await this.postJson<{ libraryID?: number; id?: number | null; targets?: IZoteroTarget[] }>('getSelectedCollection', {});
			if (!selection?.targets?.length) {
				return undefined;
			}
			return { selected: selection.id ? `C${selection.id}` : `L${selection.libraryID ?? 1}`, targets: selection.targets };
		} catch {
			return undefined;
		}
	}

	isInZotero(id: string): boolean {
		return this.zotero.has(id);
	}

	getJournalIssns(url: string, id: string): readonly string[] {
		if (url.startsWith(EMAIL_ALERT_PREFIX)) {
			const issn = this.articleIssns.get(id);
			return issn ? [issn] : [];
		}
		if (url.startsWith(PUBMED_SEARCH)) {
			return this.stored[url]?.items.find(item => item.id === id)?.issns ?? [];
		}
		const catalogueFeed = findCatalogueFeed(url);
		if (catalogueFeed) {
			return catalogueFeed.feed.issns ?? [];
		}
		const issn = this.journalFeeds[url];
		return issn ? [issn] : [];
	}

	/** The ISSNs of the journals of the email alerts' articles found before, from ~/.pollis/journals/articles.jsonl. */
	private async readArticleIssns(): Promise<void> {
		try {
			const content = await this.fileService.readFile(this.articlesFile);
			for (const line of content.value.toString().split('\n')) {
				const record: Partial<IArticleRecord> | undefined = line ? JSON.parse(line) : undefined;
				if (record?.id && record.issn_l) {
					this.articleIssns.set(record.id, record.issn_l);
				}
			}
			this._onDidChange.fire();
		} catch {
			// No article looked up yet
		}
	}

	getEpisodeFile(id: string): URI | undefined {
		return this.episodes[id] ? URI.parse(this.episodes[id]) : undefined;
	}

	async downloadEpisode(id: string): Promise<URI | undefined> {
		const feed = this.getFeeds().find(feed => feed.items.some(item => item.id === id));
		const item = feed?.items.find(item => item.id === id);
		if (!feed || !item?.media) {
			return undefined;
		}
		// Named after the feed and the episode, with the extension of the file's address
		const safe = (name: string) => name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100) || 'Episode';
		const extension = /\.(?<extension>mp3|m4a|m4v|mp4|aac|ogg|opus|wav|mov)(?:[?#]|$)/i.exec(item.media)?.groups?.extension.toLowerCase() ?? (item.mediaType === 'video' ? 'mp4' : 'mp3');
		const file = joinPath(this.archiveFolder, '..', 'episodes', safe(feed.title), `${safe(item.title)}.${extension}`);
		try {
			const context = await this.request({ type: 'GET', url: item.media, callSite: 'pollis.rss.episode' });
			if (!isSuccess(context)) {
				return undefined;
			}
			await this.fileService.writeFile(file, context.stream);
		} catch {
			return undefined;
		}
		this.episodes[id] = file.toString();
		this.storageService.store(EPISODES_KEY, JSON.stringify(this.episodes), StorageScope.APPLICATION, StorageTarget.MACHINE);
		this._onDidChange.fire();
		const line = JSON.stringify({ id, feed: feed.url, title: item.title, link: item.link, media: item.media, file: file.fsPath, downloaded: new Date().toISOString() }) + '\n';
		try {
			await this.fileService.writeFile(joinPath(this.archiveFolder, '..', 'episodes.jsonl'), VSBuffer.fromString(line), { append: true });
		} catch {
			// The episode is downloaded all the same
		}
		return file;
	}

	async addToZotero(id: string, target: string, targetName: string): Promise<boolean> {
		const feed = this.getFeeds().find(feed => feed.items.some(item => item.id === id));
		const item = feed?.items.find(item => item.id === id);
		if (!feed || !item) {
			return false;
		}
		// A connector's save: the items go where Zotero's selection is, and then to the target the session asks for
		const sessionID = `pollis-${Date.now()}-${Math.random().toString(36).slice(2)}`;
		try {
			await this.postJson('saveItems', { sessionID, uri: item.link, items: [toZoteroItem(item, feed)] });
			await this.postJson('updateSession', { sessionID, target });
		} catch {
			return false;
		}
		this.zotero.add(id);
		this.storageService.store(ZOTERO_KEY, JSON.stringify([...this.zotero]), StorageScope.APPLICATION, StorageTarget.MACHINE);
		this._onDidChange.fire();
		// The record of the PollisRSS database: added to, never rewritten, like the archive
		const line = JSON.stringify({ id, feed: feed.url, title: item.title, link: item.link, added: new Date().toISOString(), collection: targetName }) + '\n';
		try {
			await this.fileService.writeFile(joinPath(this.archiveFolder, '..', 'zotero.jsonl'), VSBuffer.fromString(line), { append: true });
		} catch {
			// Zotero has the item all the same
		}
		return true;
	}

	/** Posts `body` to the Zotero connector's `endpoint`, and returns the JSON it answers, if any. */
	private async postJson<T>(endpoint: string, body: object): Promise<T | undefined> {
		const context = await this.request({
			type: 'POST',
			url: `${ZOTERO_CONNECTOR}/${endpoint}`,
			data: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json', 'X-Zotero-Connector-API-Version': '3' },
			timeout: 10000,
			callSite: 'pollis.rss.zotero',
		});
		if (!isSuccess(context)) {
			throw new Error(`Zotero: ${context.res.statusCode}`);
		}
		// Zotero answers a save with 201 and no body, which is a success all the same
		const text = await asText(context);
		return text ? JSON.parse(text) as T : undefined;
	}

	private getStrings(setting: string): string[] {
		const value = this.configurationService.getValue<unknown>(setting);
		return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
	}

	/** The feeds of the setting, each address once. */
	private getEntries(): IRssFeedEntry[] {
		const value = this.configurationService.getValue<unknown>(RSS_FEEDS_SETTING);
		const entries = new Map<string, IRssFeedEntry>();
		for (const entry of Array.isArray(value) ? value.map(toEntry) : []) {
			if (entry && !entries.has(entry.url)) {
				entries.set(entry.url, entry);
			}
		}
		return [...entries.values()];
	}

	private async readAll(): Promise<void> {
		// The feeds unsubscribed are not read, but their items are kept
		const urls = this.getEntries().map(entry => entry.url);
		const subscribed = urls.filter(url => this.isSubscribed(url));
		// The email alerts' feeds are made from the alerts mailbox, read first
		if (subscribed.some(url => url.startsWith(EMAIL_ALERT_PREFIX))) {
			await this.readMailbox();
		}
		// The items not kept before, for the archive: at first, every item kept
		const seeded = this.storageService.getBoolean(ARCHIVED_KEY, StorageScope.APPLICATION, false);
		const received = new Map<string, IRssItem[]>(seeded ? [] : Object.entries(this.stored).map(([url, feed]) => [url, [...feed.items]]));
		const read = async (url: string) => {
			const feed = await this.readFeed(url);
			if (!feed) {
				this.failed.add(url);
				return;
			}
			this.failed.delete(url);
			const known = new Set(this.stored[url]?.items.map(item => item.id));
			const fresh = feed.items.filter(item => !known.has(item.id));
			if (fresh.length) {
				received.set(url, [...(received.get(url) ?? []), ...fresh]);
			}
			// A feed lists only its latest items (arXiv lists none at weekends): the items read before are kept.
			const items = new Map<string, IRssItem>();
			for (const item of [...feed.items, ...(this.stored[url]?.items ?? [])]) {
				if (!items.has(item.id)) {
					items.set(item.id, item);
				}
			}
			this.stored[url] = {
				title: feed.title || this.stored[url]?.title || '',
				items: [...items.values()].sort((a, b) => b.date - a.date).slice(0, MAX_ITEMS),
			};
		};
		// arXiv's and NCBI's searches and Oxford Academic's feeds are read one after another, as they ask; the other feeds all at once
		const spaced = subscribed.filter(url => requestSpacing(url));
		await Promise.all([
			...subscribed.filter(url => !requestSpacing(url)).map(read),
			(async () => {
				for (const [index, url] of spaced.entries()) {
					if (index) {
						await timeout(requestSpacing(url));
					}
					await read(url);
				}
			})(),
		]);
		// Feeds no longer followed are forgotten, and so are the read marks of items no longer kept.
		this.stored = Object.fromEntries(urls.filter(url => this.stored[url]).map(url => [url, this.stored[url]]));
		const kept = new Set(Object.values(this.stored).flatMap(feed => feed.items.map(item => item.id)));
		this.read = new Set([...this.read].filter(id => kept.has(id)));
		this.zotero = new Set([...this.zotero].filter(id => kept.has(id)));
		this.storageService.store(ZOTERO_KEY, JSON.stringify([...this.zotero]), StorageScope.APPLICATION, StorageTarget.MACHINE);
		// The files stay; the episodes view still lists them
		this.episodes = Object.fromEntries(Object.entries(this.episodes).filter(([id]) => kept.has(id)));
		this.storageService.store(EPISODES_KEY, JSON.stringify(this.episodes), StorageScope.APPLICATION, StorageTarget.MACHINE);
		this.storageService.store(FEEDS_KEY, JSON.stringify(this.stored), StorageScope.APPLICATION, StorageTarget.MACHINE);
		this.storeRead();
		this._onDidChange.fire();
		if (await this.archive(received)) {
			this.storageService.store(ARCHIVED_KEY, true, StorageScope.APPLICATION, StorageTarget.MACHINE);
		}
		this.lookUpArticles([...received].filter(([url]) => url.startsWith(EMAIL_ALERT_PREFIX)).flatMap(([, items]) => items));
		this.lookUpJournalFeeds();
	}

	/** Crossref and OpenAlex, with Pollis introduced as they ask; `answered` records that one of them answered. */
	private scholarlyFetch(answered?: { value: boolean }): FetchText {
		return async (url: string) => {
			const context = await this.request({ type: 'GET', url, headers: { 'User-Agent': SCHOLARLY_USER_AGENT }, timeout: 10000, callSite: 'pollis.rss.articles' });
			const text = isSuccess(context) ? (await asText(context)) ?? undefined : undefined;
			if (answered && text !== undefined) {
				answered.value = true;
			}
			return text;
		};
	}

	/**
	 * Finds, once, whether each feed of the user's own with items is a journal's, after the lookups under way: its
	 * first items are looked up at Crossref and OpenAlex until one is found, whose journal's ISSN is kept. A feed is
	 * marked as no journal's only when the services answered, so that a feed read offline is looked up again.
	 */
	private lookUpJournalFeeds(): void {
		const feeds = this.getFeeds().filter(feed => feed.items.length && this.journalFeeds[feed.url] === undefined && !feed.url.startsWith(EMAIL_ALERT_PREFIX)
			&& !feed.url.startsWith(PUBMED_SEARCH) && !feed.url.startsWith(youtubeFeedUrl('')) && !findCatalogueFeed(feed.url) && !feed.url.includes('arxiv.org'));
		if (!feeds.length) {
			return;
		}
		this.lookingUp = this.lookingUp.then(async () => {
			for (const feed of feeds) {
				const answered = { value: false };
				const fetchText = this.scholarlyFetch(answered);
				let issn: string | null = null;
				for (const item of feed.items.slice(0, 3)) {
					await timeout(ARTICLE_LOOKUP_SPACING);
					try {
						issn = (await lookUpArticle(item.id, item.title, item.link, fetchText)).issn_l;
					} catch {
						// Offline, or a service that failed: the next item
					}
					if (issn) {
						break;
					}
				}
				if (issn || answered.value) {
					this.journalFeeds[feed.url] = issn;
					this.storageService.store(JOURNAL_FEEDS_KEY, JSON.stringify(this.journalFeeds), StorageScope.APPLICATION, StorageTarget.MACHINE);
					if (issn) {
						this._onDidChange.fire();
					}
				}
			}
		});
	}

	/**
	 * Looks up the articles of the email alerts' `items` at Crossref and OpenAlex in the background, one after another
	 * and after those still being looked up, and adds what is found to ~/.pollis/journals/articles.jsonl, which the
	 * articles view of the PollisJournals database reads. An item looked up twice, as by two windows, is added
	 * twice, and the view keeps its latest line.
	 */
	private lookUpArticles(items: readonly IRssItem[]): void {
		if (!items.length) {
			return;
		}
		const fetchText = this.scholarlyFetch();
		this.lookingUp = this.lookingUp.then(async () => {
			for (const [index, item] of items.entries()) {
				if (index) {
					await timeout(ARTICLE_LOOKUP_SPACING);
				}
				try {
					const record = await lookUpArticle(item.id, item.title, item.link, fetchText);
					if (record.issn_l) {
						this.articleIssns.set(record.id, record.issn_l);
						this._onDidChange.fire();
					}
					await this.fileService.writeFile(this.articlesFile, VSBuffer.fromString(JSON.stringify(record) + '\n'), { append: true });
				} catch {
					// Offline, or a service that failed: the next item
				}
			}
		});
	}

	/**
	 * Adds the items `received`, by feed address, to the archive: a line of JSON per item in the file of the month they
	 * were received in, ~/.pollis/rss/items/YYYY-MM.jsonl. The files are only ever added to; an item received again,
	 * as by two windows, is added again, and the PollisRSS database keeps its first line. True when written.
	 */
	private async archive(received: ReadonlyMap<string, readonly IRssItem[]>): Promise<boolean> {
		const feeds = new Map(this.getFeeds().map(feed => [feed.url, feed]));
		const now = new Date();
		const lines = [...received].flatMap(([url, items]) => items.map(item => JSON.stringify({
			id: item.id,
			feed: url,
			feed_title: feeds.get(url)?.title ?? url,
			topic: feeds.get(url)?.topic ?? OTHER_TOPIC,
			title: item.title,
			link: item.link,
			published: item.date ? new Date(item.date).toISOString() : null,
			received: now.toISOString(),
			summary: item.summary ?? null,
			image: item.image ?? null,
			media: item.media ?? null,
			media_type: item.mediaType ?? null,
		}) + '\n'));
		if (!lines.length) {
			return true;
		}
		const file = joinPath(this.archiveFolder, `${now.toISOString().slice(0, 7)}.jsonl`);
		try {
			await this.fileService.writeFile(file, VSBuffer.fromString(lines.join('')), { append: true });
			return true;
		} catch {
			return false;
		}
	}

	private async readFeed(url: string): Promise<IStoredFeed | undefined> {
		try {
			if (url.startsWith(PUBMED_SEARCH)) {
				return await this.readPubmedSearch(url);
			}
			if (url.startsWith(EMAIL_ALERT_PREFIX)) {
				const alert = this.alerts[url.slice(EMAIL_ALERT_PREFIX.length)];
				return this.mailboxFailed ? undefined : { title: alert ? `${ALERT_SOURCES[alert.source]}: ${alert.name}` : '', items: alert?.items ?? [] };
			}
			const text = await this.fetchText(url);
			return text ? parseFeed(text) : undefined;
		} catch {
			return undefined;
		}
	}

	/**
	 * The articles a PubMed search finds, the ones most recently added first: their ids from esearch, then their
	 * titles from esummary, dated by when they were added to PubMed.
	 */
	private async readPubmedSearch(url: string): Promise<IStoredFeed | undefined> {
		const search = await this.fetchText(url);
		const ids = search ? (JSON.parse(search) as { esearchresult?: { idlist?: string[] } }).esearchresult?.idlist : undefined;
		if (!ids) {
			return undefined;
		}
		if (!ids.length) {
			return { title: '', items: [] };
		}
		await timeout(requestSpacing(url));
		const summary = await this.fetchText(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(',')}`);
		const result = summary ? (JSON.parse(summary) as { result?: Record<string, IPubmedSummary> }).result : undefined;
		if (!result) {
			return undefined;
		}
		const items: IRssItem[] = [];
		for (const id of ids) {
			const article = result[id];
			if (article?.title) {
				const added = article.history?.find(entry => entry.pubstatus === 'entrez')?.date ?? article.pubdate ?? '';
				const time = Date.parse(added);
				const issns = [article.issn, article.essn].filter((issn): issn is string => !!issn);
				items.push({
					id: `pubmed:${id}`,
					title: decodeEntities(article.title.replace(/<[^>]*>/g, '')),
					link: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
					date: isNaN(time) ? 0 : time,
					summary: article.source || undefined,
					issns: issns.length ? issns : undefined,
				});
			}
		}
		return { title: '', items };
	}

	/** The text at `url`; undefined when the request fails. */
	private async fetchText(url: string): Promise<string | undefined> {
		const context = await this.request({ type: 'GET', url, callSite: 'pollis.rss.feed' });
		return isSuccess(context) ? (await asText(context)) ?? undefined : undefined;
	}

	protected request(options: IRequestOptions): Promise<IRequestContext> {
		return this.requestService.request(options, CancellationToken.None);
	}

	private storeRead(): void {
		this.storageService.store(READ_KEY, JSON.stringify([...this.read]), StorageScope.APPLICATION, StorageTarget.USER);
	}

	private readStorage<T>(key: string, fallback: T): T {
		try {
			return JSON.parse(this.storageService.get(key, StorageScope.APPLICATION, '')) ?? fallback;
		} catch {
			return fallback;
		}
	}
}

/** An article of a PubMed esummary: its title, journal, publication date and when it entered PubMed (`entrez`). */
interface IPubmedSummary {
	readonly title?: string;
	/** The journal. */
	readonly source?: string;
	/** The journal's print and electronic ISSNs, empty when it has none. */
	readonly issn?: string;
	readonly essn?: string;
	readonly pubdate?: string;
	readonly history?: readonly { readonly pubstatus?: string; readonly date?: string }[];
}

/**
 * `item` of `feed` as Zotero saves it: a preprint (arXiv, medRxiv, bioRxiv), a journal article (PubMed), a video, a
 * podcast episode, else a web page.
 */
function toZoteroItem(item: IRssItem, feed: IRssFeed): Record<string, unknown> {
	const date = item.date ? new Date(item.date).toISOString().slice(0, 10) : undefined;
	// Zotero downloads the PDF of an open-access article and attaches it, when the publisher lets it
	const pdf = openAccessPdf(item.link);
	const attachments = pdf ? [{ url: pdf, title: 'Full Text PDF', mimeType: 'application/pdf' }] : [];
	const common = { title: item.title, url: item.link, date, abstractNote: item.summary, accessDate: new Date().toISOString().slice(0, 19).replace('T', ' '), attachments, notes: [], tags: [] };
	if (item.id.startsWith('pubmed:')) {
		return { ...common, itemType: 'journalArticle', abstractNote: undefined, publicationTitle: item.summary, extra: `PMID: ${item.id.slice(7)}` };
	}
	const repository = /arxiv\.org/.test(item.link) || feed.topic === ARXIV_TOPIC ? 'arXiv' : /medrxiv\.org/.test(item.link) ? 'medRxiv' : /biorxiv\.org/.test(item.link) ? 'bioRxiv' : undefined;
	if (repository) {
		return { ...common, itemType: 'preprint', repository };
	}
	if (/^https:\/\/journals\.plos\.org\//.test(item.link)) {
		return { ...common, itemType: 'journalArticle', publicationTitle: feed.title };
	}
	if (item.mediaType === 'video') {
		return { ...common, itemType: 'videoRecording', studio: feed.title };
	}
	if (item.mediaType === 'audio') {
		return { ...common, itemType: 'podcast', seriesTitle: feed.title };
	}
	return { ...common, itemType: 'webpage', websiteTitle: feed.title };
}

/**
 * The PDF of the open-access article at `link`: an arXiv, bioRxiv or medRxiv preprint, or a PLOS article; undefined
 * for any other.
 */
function openAccessPdf(link: string): string | undefined {
	const arxiv = /^https?:\/\/(?:export\.)?arxiv\.org\/abs\/(?<id>[^?#]+)/.exec(link)?.groups;
	if (arxiv) {
		return `https://arxiv.org/pdf/${arxiv.id}`;
	}
	const preprint = /^(?<base>https?:\/\/(?:www\.)?(?:bio|med)rxiv\.org\/content\/[^?#]+?)(?:\.full)?(?:[?#]|$)/.exec(link)?.groups;
	if (preprint) {
		return `${preprint.base}.full.pdf`;
	}
	const plos = /^(?<base>https:\/\/journals\.plos\.org\/\w+\/article)\?id=(?<doi>[^&#]+)/.exec(link)?.groups;
	return plos ? `${plos.base}/asset?id=${plos.doi}.PDF` : undefined;
}

/** A feed of the setting: an address, or an object with one; undefined for anything else. */
function toEntry(value: unknown): IRssFeedEntry | undefined {
	const entry: Partial<IRssFeedEntry> | undefined = typeof value === 'string' ? { url: value } : value && typeof value === 'object' ? value : undefined;
	if (!entry || typeof entry.url !== 'string' || !/^https?:\/\//.test(entry.url) && !entry.url.startsWith(EMAIL_ALERT_PREFIX)) {
		return undefined;
	}
	return {
		url: entry.url,
		topic: typeof entry.topic === 'string' && entry.topic.trim() ? entry.topic.trim() : undefined,
		name: typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : undefined,
	};
}

/**
 * The title and items of an RSS (2.0 or 1.0) or Atom feed; undefined when `text` is neither. Read with regular
 * expressions: the workbench's Trusted Types policy does not let DOMParser parse a string.
 */
function parseFeed(text: string): IStoredFeed | undefined {
	text = text.replace(/<!--[\s\S]*?-->/g, '');
	const atom = /<feed[\s>]/.test(text);
	if (!atom && !/<(?:rss|rdf:RDF)[\s>]/.test(text)) {
		return undefined;
	}
	// The text of the first element `name` in `xml`, its CDATA unwrapped, tags removed and entities decoded.
	const elementText = (xml: string, ...names: string[]) => {
		for (const name of names) {
			const content = new RegExp(`<${name}(?:\\s[^>]*?)?(?<!/)>(?<content>[\\s\\S]*?)</${name}>`).exec(xml)?.groups?.content;
			const value = content && decodeEntities(content.replace(/<!\[CDATA\[(?<data>[\s\S]*?)\]\]>/g, (_, data: string) => data.replace(/<[^>]*>/g, ' ')).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
			if (value) {
				return value;
			}
		}
		return '';
	};
	const blocks = (name: string) => Array.from(text.matchAll(new RegExp(`<${name}[\\s>][\\s\\S]*?</${name}>`, 'g')), match => match[0]);
	const attribute = (tag: string, name: string) => {
		const value = new RegExp(`\\s${name}\\s*=\\s*["'](?<value>[^"']*)["']`).exec(tag)?.groups?.value;
		return value === undefined ? undefined : decodeEntities(value);
	};
	const tags = (xml: string, name: string) => Array.from(xml.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g')), match => match[0]);
	const web = (url: string | undefined) => url && /^https?:\/\//.test(url) ? url : undefined;
	const toItem = (xml: string, id: string, title: string, address: string, date: string): IRssItem | undefined => {
		// Pictures, audio and video: Media RSS (YouTube, news), podcasts' enclosures and iTunes covers
		const enclosure = tags(xml, 'enclosure').find(tag => /^(?:audio|video)\//.test(attribute(tag, 'type') ?? ''));
		const media = web(enclosure && attribute(enclosure, 'url'));
		// A podcast's episode may have no page of its own: its link is then the episode's file
		const link = web(address) ?? media;
		if (!link) {
			return undefined;
		}
		const time = Date.parse(date);
		const picture = tags(xml, 'media:thumbnail')[0]
			?? tags(xml, 'media:content').find(tag => attribute(tag, 'medium') === 'image' || /^image\//.test(attribute(tag, 'type') ?? ''))
			?? tags(xml, 'enclosure').find(tag => /^image\//.test(attribute(tag, 'type') ?? ''));
		const image = web(picture ? attribute(picture, 'url') : tags(xml, 'itunes:image').map(tag => attribute(tag, 'href'))[0]);
		// Else the link tells: a video's page (Bloomberg's /news/videos/, YouTube, Vimeo) or an audio one (/audio/, /podcasts/)
		const mediaType = /<yt:videoId>/.test(xml) || attribute(enclosure ?? '', 'type')?.startsWith('video/') ? 'video'
			: media ? 'audio'
				: /^https?:\/\/(?:[\w-]+\.)*(?:youtube\.com\/(?:watch|shorts\/)|youtu\.be\/|vimeo\.com\/\d)|\/videos?\//i.test(link) ? 'video'
					: /\/(?:audio|podcasts?)\//i.test(link) ? 'audio' : undefined;
		const summary = elementText(xml, 'description', 'summary', 'media:description', 'itunes:summary', 'content').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
		return {
			id: id || link,
			title: title || link,
			link,
			date: isNaN(time) ? 0 : time,
			summary: summary ? (summary.length > MAX_SUMMARY ? summary.slice(0, MAX_SUMMARY).replace(/\s+\S*$/, '') + '\u2026' : summary) : undefined,
			image,
			media,
			mediaType,
		};
	};

	// The feed's title is the first one, before its items
	const head = text.split(atom ? /<entry[\s>]/ : /<item[\s>]/)[0];
	const items = atom
		? blocks('entry').map(entry => {
			// Atom: the link is the `alternate` one, the default relation
			const links = tags(entry, 'link');
			const link = links.find(tag => (attribute(tag, 'rel') ?? 'alternate') === 'alternate') ?? links[0];
			return toItem(entry, elementText(entry, 'id'), elementText(entry, 'title'), link ? attribute(link, 'href') ?? '' : '', elementText(entry, 'published', 'updated'));
		})
		: blocks('item').map(item => toItem(item, elementText(item, 'guid'), elementText(item, 'title'), elementText(item, 'link'), elementText(item, 'pubDate', 'dc:date')));
	return { title: elementText(head, 'title'), items: items.filter(item => !!item) };
}

/** What tells a mailbox from another: its user, server and folder. */
function mailboxKey(mailbox: IAlertsMailbox): string {
	return `${mailbox.user}@${mailbox.server}:${mailbox.port}/${mailbox.folder}`;
}

registerSingleton(IRssFeedsService, RssFeedsService, InstantiationType.Delayed);
