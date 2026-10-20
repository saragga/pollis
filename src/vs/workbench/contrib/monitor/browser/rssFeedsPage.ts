/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../base/common/buffer.js';
import { fromNow } from '../../../../base/common/date.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IQuickInputService, IQuickPickItem, IQuickPickSeparator } from '../../../../platform/quickinput/common/quickInput.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { ARXIV_TOPIC, arxivSearchName, arxivSearchUrl, findCatalogueFeed, JULIA_TOPIC, MEDICINE_TOPIC, PUBMED_SEARCH, pubmedSearchName, pubmedSearchUrl, RSS_CATALOGUE, youtubeFeedUrl } from './rssCatalogue.js';
import { ALERT_SOURCES, AlertSource } from '../../../../platform/alertsMailbox/common/alertsMailbox.js';
import { DISPLAY_DAYS, EMAIL_ALERT_PREFIX, IRssFeed, IRssFeedEntry, IRssFeedsService } from './rssFeedsService.js';
import { describeJournal, IJournalScoresService } from './journalScores.js';

// Explore > Monitor > RSS Feeds: the feeds on the left by topic, with ticks for Subscribed, Here and Welcome Page and
// their unread and total counts; the items of the topic or feed selected (or of all) on the right, newest first, those
// of the display period and of the feeds ticked Here, a journal's tagged with its level and metrics, which Journals filters.
// Opening an item opens it in the browser and marks it read.

export const RSS_FEEDS_COMMAND_ID = 'pollis.monitor.rssFeeds';

type FeedsMessage =
	| { readonly command: 'ready'; readonly journals: JournalFilter }
	| { readonly command: 'journals'; readonly journals: JournalFilter }
	| { readonly command: 'open'; readonly id: string }
	| { readonly command: 'openMedia'; readonly id: string }
	| { readonly command: 'zotero'; readonly id: string }
	| { readonly command: 'download'; readonly id: string }
	| { readonly command: 'exportOpml' }
	| { readonly command: 'subscribe' | 'show' | 'welcome'; readonly urls: readonly string[]; readonly value: boolean }
	| { readonly command: 'days'; readonly days: number }
	| { readonly command: 'day'; readonly day: string }
	| { readonly command: 'markUnread'; readonly id: string }
	| { readonly command: 'add' }
	| { readonly command: 'remove'; readonly url: string }
	| { readonly command: 'refresh' };

/** The choices of Journals: the levels of the Norwegian register, open access, and the quartiles of SJR and SNIP once imported. */
type JournalFilter = 'all' | 'academic' | 'leading' | 'openAccess' | 'sjrQ1' | 'sjrQ12' | 'snip';

/** What Journals filters an item of a journal by. */
interface IJournalFacts {
	readonly level?: string;
	readonly openAccess: boolean;
	readonly sjrQuartile?: string;
	readonly snip?: number;
}

/** Whether Journals lets an item through: an item not known to be a journal's always passes. */
function passesJournalFilter(filter: JournalFilter, journal: IJournalFacts | undefined): boolean {
	if (!journal) {
		return true;
	}
	switch (filter) {
		case 'academic': return journal.level === '1' || journal.level === '2';
		case 'leading': return journal.level === '2';
		case 'openAccess': return journal.openAccess;
		case 'sjrQ1': return journal.sjrQuartile === 'Q1';
		case 'sjrQ12': return journal.sjrQuartile === 'Q1' || journal.sjrQuartile === 'Q2';
		case 'snip': return (journal.snip ?? 0) > 1;
		default: return true;
	}
}

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the RSS Feeds page, or shows it again when it is open. */
async function openRssFeedsPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const rssFeedsService = accessor.get(IRssFeedsService);
	const openerService = accessor.get(IOpenerService);
	const quickInputService = accessor.get(IQuickInputService);
	const dialogService = accessor.get(IDialogService);
	const fileDialogService = accessor.get(IFileDialogService);
	const fileService = accessor.get(IFileService);
	const notificationService = accessor.get(INotificationService);
	const journalScoresService = accessor.get(IJournalScoresService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('rss.title', "RSS Feeds");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.rssFeeds',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());
	openPage = webviewInput;

	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));

	// The day chosen with On a Day..., as YYYY-MM-DD, for this page only; undefined for the period of Items From
	let day: string | undefined;
	// The tag of an item of a journal and what Journals filters it by; undefined for an item not known to be a journal's
	const journalOf = (url: string, id: string) => {
		const scores = journalScoresService.getScores(rssFeedsService.getJournalIssns(url, id));
		if (!scores) {
			return undefined;
		}
		const { tag, details } = describeJournal(scores);
		return {
			tag,
			details,
			level: scores.level,
			openAccess: !!(scores.openAccess || scores.doaj),
			sjrQuartile: scores.metrics.find(value => value.source === 'SCImago')?.sjrQuartile,
			snip: scores.metrics.find(value => value.source === 'CWTS')?.snip,
		};
	};
	// The choice of Journals, which the page keeps between sessions and sends when it is ready
	let journals: JournalFilter = 'all';
	// The items of the period or the day that pass Journals, which the counts count too
	const itemsOf = (feed: IRssFeed) => (day ? feed.items.filter(item => item.date && localDay(item.date) === day) : rssFeedsService.getItemsInPeriod(feed))
		.filter(item => passesJournalFilter(journals, journalOf(feed.url, item.id)));
	const sendState = (refreshing = false) => {
		const followed = rssFeedsService.getFeeds();
		// The catalogue's feeds not followed are listed too, unsubscribed (ticking Subscribed follows them), but not those removed
		const urls = new Set(followed.map(feed => feed.url));
		const removed = new Set(rssFeedsService.getRemovedFeeds().map(feed => feed.url));
		const offered: IRssFeed[] = RSS_CATALOGUE.flatMap(({ topic, feeds }) => feeds.filter(feed => !urls.has(feed.url) && !removed.has(feed.url)).map(feed => ({ url: feed.url, title: feed.name, topic, items: [] })));
		// Each topic's feeds in alphabetical order, followed or not
		const feeds = [...followed, ...offered].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
		webviewInput.webview.postMessage({
			command: 'state',
			refreshing,
			days: rssFeedsService.getDisplayDays(),
			day,
			// The days with items kept, marked in the calendar of On a Day...
			itemDays: [...new Set(followed.flatMap(feed => feed.items).filter(item => item.date).map(item => localDay(item.date!)))],
			topics: getTopics(feeds.map(feed => feed.topic)),
			// The choices of Journals that need metrics imported
			metricsSources: journalScoresService.getMetricsSources(),
			feeds: feeds.map(feed => ({
				url: feed.url,
				title: feed.title,
				topic: feed.topic,
				error: !!feed.error,
				media: feedMedia(feed),
				followed: urls.has(feed.url),
				subscribed: urls.has(feed.url) && rssFeedsService.isSubscribed(feed.url),
				shown: rssFeedsService.isFeedShown(feed.url),
				onWelcome: rssFeedsService.isFeedOnWelcomePage(feed.url),
				// The counts of the period or the day, shown here or not
				unread: itemsOf(feed).filter(item => !rssFeedsService.isRead(item.id)).length,
				total: itemsOf(feed).length,
				// Whether the feed has items kept, shown or not (hidden, or older than Items From)
				kept: feed.items.length > 0,
				items: (rssFeedsService.isFeedShown(feed.url) ? itemsOf(feed) : []).map(item => ({
					id: item.id,
					title: item.title,
					age: item.date ? fromNow(item.date, true) : '',
					date: item.date,
					read: rssFeedsService.isRead(item.id),
					inZotero: rssFeedsService.isInZotero(item.id),
					downloaded: !!rssFeedsService.getEpisodeFile(item.id),
					summary: item.summary,
					image: item.image,
					mediaType: item.mediaType,
					media: !!item.media,
					journal: journalOf(feed.url, item.id),
				})),
			})),
		});
	};
	const refresh = async () => {
		sendState(true);
		await rssFeedsService.refresh();
		sendState();
	};
	// The Zotero library or collection items were last added to, offered first the next time
	let zoteroTarget: string | undefined;
	const addToZotero = async (id: string) => {
		const zotero = await rssFeedsService.getZoteroTargets();
		if (!zotero) {
			notificationService.warn(localize('rss.zoteroClosed', "Zotero is not open. Open Zotero 7 or later on this computer and try again."));
			return;
		}
		const items = zotero.targets.map(target => ({ id: target.id, label: '\u2003'.repeat(target.level) + target.name }));
		const active = items.find(item => item.id === (zoteroTarget ?? zotero.selected));
		const picked = items.length === 1 ? items[0] : await quickInputService.pick(items, {
			title: localize('rss.zoteroTitle', "Add to Zotero"),
			placeHolder: localize('rss.zoteroPlaceholder', "The library or collection to add the item to"),
			activeItem: active,
		});
		if (!picked) {
			return;
		}
		zoteroTarget = picked.id;
		if (await rssFeedsService.addToZotero(id, picked.id, picked.label.trim())) {
			notificationService.info(localize('rss.zoteroAdded', "Added to Zotero: {0}.", picked.label.trim()));
		} else {
			notificationService.error(localize('rss.zoteroFailed', "Zotero did not add the item. Check that Zotero is open and not busy, and try again."));
		}
	};
	const exportOpml = async () => {
		const file = await fileDialogService.showSaveDialog({
			title: localize('rss.exportTitle', "Export as OPML"),
			defaultUri: joinPath(await fileDialogService.defaultFilePath(), 'Pollis Feeds.opml'),
			filters: [{ name: 'OPML', extensions: ['opml'] }],
		});
		if (file) {
			await fileService.writeFile(file, VSBuffer.fromString(toOpml(rssFeedsService.getFeeds())));
			notificationService.info(localize('rss.exported', "Saved {0}. In Zotero, choose File > New Feed > From OPML... and pick this file. PubMed searches and email alerts are left out, since only Pollis reads them.", file.fsPath));
		}
	};
	disposables.add(rssFeedsService.onDidChange(() => sendState()));
	disposables.add(journalScoresService.onDidChange(() => sendState()));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: FeedsMessage }) => {
		const message = e.message;
		switch (message.command) {
			case 'ready':
				journals = message.journals;
				refresh();
				break;
			case 'journals':
				journals = message.journals;
				sendState();
				break;
			case 'open':
			case 'openMedia': {
				const item = rssFeedsService.getFeeds().flatMap(feed => feed.items).find(item => item.id === message.id);
				const link = message.command === 'openMedia' ? item?.media : item?.link;
				if (item && link) {
					rssFeedsService.markRead([item.id]);
					openerService.open(URI.parse(link), { openExternal: true });
				}
				break;
			}
			case 'zotero':
				await addToZotero(message.id);
				break;
			case 'download': {
				const file = rssFeedsService.getEpisodeFile(message.id) ?? await rssFeedsService.downloadEpisode(message.id);
				if (file) {
					notificationService.prompt(Severity.Info, localize('rss.downloaded', "Episode saved: {0}.", file.fsPath), [{
						label: localize('rss.openFolder', "Open Folder"),
						run: () => openerService.open(URI.joinPath(file, '..'), { openExternal: true }),
					}]);
				} else {
					notificationService.error(localize('rss.downloadFailed', "The episode could not be downloaded. Check the internet connection and try again."));
				}
				break;
			}
			case 'exportOpml':
				await exportOpml();
				break;
			case 'subscribe': {
				// A catalogue feed not followed yet is added to the feeds, under its topic
				const followed = new Set(rssFeedsService.getFeeds().map(feed => feed.url));
				const added = message.value ? message.urls.filter(url => !followed.has(url)) : [];
				if (added.length) {
					await rssFeedsService.updateFeeds(added.map(url => ({ url, topic: findCatalogueFeed(url)?.topic })), []);
				}
				await rssFeedsService.setSubscribed(message.urls.filter(url => followed.has(url)), message.value);
				break;
			}
			case 'show':
				await rssFeedsService.setFeedsShown(message.urls, message.value);
				break;
			case 'welcome':
				await rssFeedsService.setFeedsOnWelcomePage(message.urls, message.value);
				break;
			case 'days':
				day = undefined;
				await rssFeedsService.setDisplayDays(message.days);
				sendState();
				break;
			case 'day':
				day = message.day;
				sendState();
				break;
			case 'markUnread':
				rssFeedsService.markUnread([message.id]);
				break;
			case 'add':
				await addFeeds(quickInputService, rssFeedsService, notificationService);
				break;
			case 'remove': {
				// A feed followed, or one the catalogue offers; Add Feed > Undo Remove... brings it back
				const title = rssFeedsService.getFeeds().find(feed => feed.url === message.url)?.title ?? findCatalogueFeed(message.url)?.feed.name;
				if (title) {
					const { confirmed } = await dialogService.confirm({
						message: localize('rss.removeConfirm', "Remove the feed '{0}'?", title),
						detail: localize('rss.removeDetail', "Add Feed > Undo Remove... brings it back."),
						primaryButton: localize({ key: 'rss.removeButton', comment: ['&& denotes a mnemonic'] }, "&&Remove"),
					});
					if (confirmed) {
						await rssFeedsService.removeFeeds([message.url]);
					}
				}
				break;
			}
			case 'refresh':
				refresh();
				break;
		}
	}));
}

/**
 * The feeds as OPML, an outline per topic, which feed readers and Zotero import. PubMed searches are left out: they
 * answer JSON, which only Pollis reads.
 */
/** The day of `date`, in this computer's time zone, as YYYY-MM-DD. */
function localDay(date: number): string {
	const d = new Date(date);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toOpml(feeds: readonly IRssFeed[]): string {
	const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	const followed = feeds.filter(feed => !feed.url.startsWith(PUBMED_SEARCH) && !feed.url.startsWith(EMAIL_ALERT_PREFIX));
	const outlines = getTopics(followed.map(feed => feed.topic)).map(topic => [
		`\t\t<outline text="${escape(topic)}" title="${escape(topic)}">`,
		...followed.filter(feed => feed.topic === topic).map(feed => `\t\t\t<outline type="rss" text="${escape(feed.title)}" title="${escape(feed.title)}" xmlUrl="${escape(feed.url)}"/>`),
		'\t\t</outline>',
	].join('\n'));
	return `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n\t<head>\n\t\t<title>Pollis RSS Feeds</title>\n\t</head>\n\t<body>\n${outlines.join('\n')}\n\t</body>\n</opml>\n`;
}

/** The `topics`, once each, in alphabetical order but for Julia, first. */
function getTopics(topics: readonly string[]): string[] {
	return [...new Set(topics)].sort((a, b) => Number(b === JULIA_TOPIC) - Number(a === JULIA_TOPIC) || a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

interface IAddChoice extends IQuickPickItem {
	readonly choice: 'emailAlerts' | 'alertsMailbox' | 'arxiv' | 'pubmed' | 'youtube' | 'address' | 'undoRemove';
}

// The topic of the email alerts' feeds.
const EMAIL_ALERTS_TOPIC = 'Email Alerts';

// The IMAP servers of the common email providers, by the domain of the address.
const IMAP_SERVERS: readonly [RegExp, string][] = [
	[/^(?:gmail|googlemail)\.com$/, 'imap.gmail.com'],
	[/^(?:icloud|me|mac)\.com$/, 'imap.mail.me.com'],
	[/^yahoo\./, 'imap.mail.yahoo.com'],
	[/^fastmail\./, 'imap.fastmail.com'],
	[/^gmx\./, 'imap.gmx.com'],
];

interface ICatalogueItem extends IQuickPickItem {
	readonly entry: IRssFeedEntry;
}

/** A topic for a new feed: one of the catalogue's or the user's, or a new one; undefined when none is chosen. */
/**
 * Whether a feed is of videos or a podcast's: a YouTube channel, a podcast of the catalogue, or a feed of the user's
 * whose items are all videos or all audio. A news feed with a video now and then, as Bloomberg's, is neither.
 */
function feedMedia(feed: IRssFeed): 'video' | 'audio' | undefined {
	if (feed.url.startsWith(youtubeFeedUrl(''))) {
		return 'video';
	}
	const catalogueFeed = findCatalogueFeed(feed.url);
	if (catalogueFeed) {
		return catalogueFeed.feed.media;
	}
	const mediaType = feed.items[0]?.mediaType;
	return mediaType && feed.items.every(item => item.mediaType === mediaType) ? mediaType : undefined;
}

async function pickTopic(quickInputService: IQuickInputService, rssFeedsService: IRssFeedsService, title: string, first?: string): Promise<string | undefined> {
	const newTopic = localize('rss.newTopic', "New Topic...");
	const topics = getTopics([...(first ? [first] : []), ...RSS_CATALOGUE.map(({ topic }) => topic), ...rssFeedsService.getFeeds().map(feed => feed.topic)]);
	if (first) {
		topics.sort((a, b) => Number(b === first) - Number(a === first));
	}
	const picked = await quickInputService.pick([...topics.map(topic => ({ label: topic })), { type: 'separator' }, { label: newTopic }], { title, placeHolder: localize('rss.topicPlaceholder', "The topic to list the feed under") });
	return picked?.label === newTopic
		? (await quickInputService.input({ title, prompt: localize('rss.newTopicPrompt', "The name of the new topic") }))?.trim()
		: picked?.label;
}

/**
 * Add Feed > Alerts Mailbox...: the address the alerts are sent to, its IMAP server and its password, kept once the
 * mailbox can be read. False when none is set.
 */
async function setAlertsMailbox(quickInputService: IQuickInputService, rssFeedsService: IRssFeedsService, notificationService: INotificationService): Promise<boolean> {
	const title = localize('rss.mailboxTitle', "Alerts Mailbox");
	const current = rssFeedsService.getAlertsMailbox();
	const user = (await quickInputService.input({
		title,
		value: current?.user,
		placeHolder: 'my.alerts@gmail.com',
		prompt: localize('rss.mailboxUserPrompt', "The email address the alerts are sent to: best one used only for them, as Pollis makes a feed of every alert that arrives there"),
		validateInput: async value => /^\S+$/.test(value.trim()) ? undefined : localize('rss.mailboxUserInvalid', "Enter the email address"),
	}))?.trim();
	if (!user) {
		return false;
	}
	const domain = user.split('@')[1]?.toLowerCase() ?? '';
	const guess = current?.user === user ? `${current.server}${current.port === 993 ? '' : `:${current.port}`}` : IMAP_SERVERS.find(([pattern]) => pattern.test(domain))?.[1] ?? (domain ? `imap.${domain}` : '');
	const server = (await quickInputService.input({
		title,
		value: guess,
		prompt: localize('rss.mailboxServerPrompt', "The IMAP server of the mailbox, as its provider gives it; add :port when it is not 993"),
		validateInput: async value => /^[\w.-]+(?::\d+)?$/.test(value.trim()) ? undefined : localize('rss.mailboxServerInvalid', "Enter a server, such as imap.gmail.com"),
	}))?.trim();
	if (!server) {
		return false;
	}
	const password = await quickInputService.input({
		title,
		password: true,
		prompt: localize('rss.mailboxPasswordPrompt', "The mailbox's password, or an app password where the provider asks for one (Gmail, iCloud, Yahoo). It is kept in the system's keychain."),
	});
	if (!password) {
		return false;
	}
	const [host, port] = server.split(':');
	const error = await rssFeedsService.setAlertsMailbox({ server: host, port: port ? Number(port) : 993, user, folder: current?.folder ?? 'INBOX' }, password);
	if (error) {
		notificationService.error(localize('rss.mailboxFailed', "The mailbox could not be read: {0}. Check the address, the server and the password; Gmail, iCloud and Yahoo need an app password, and IMAP turned on.", error));
		return false;
	}
	return true;
}

/**
 * Add Feed: the alerts in the alerts mailbox, ticked when followed (unticking one stops following it), the mailbox,
 * an arXiv or PubMed search, a YouTube channel, or a feed at another address under a topic of the user's choosing.
 */
async function addFeeds(quickInputService: IQuickInputService, rssFeedsService: IRssFeedsService, notificationService: INotificationService): Promise<void> {
	const title = localize('rss.addTitle', "Add Feed");
	const choice = await quickInputService.pick<IAddChoice>([
		{ choice: 'emailAlerts', label: localize('rss.addEmailAlerts', "Email Alerts..."), detail: localize('rss.addEmailAlertsDetail', "The alerts of Google Scholar, JSTOR, HeinOnline and other sources sent to your alerts mailbox, which Pollis turns into feeds") },
		{ choice: 'alertsMailbox', label: localize('rss.addAlertsMailbox', "Alerts Mailbox..."), detail: localize('rss.addAlertsMailboxDetail', "The email address your alerts are sent to, which Pollis reads on this computer") },
		{ choice: 'arxiv', label: localize('rss.addArxiv', "arXiv Search..."), detail: localize('rss.addArxivDetail', "The newest papers matching a search") },
		{ choice: 'pubmed', label: localize('rss.addPubmed', "PubMed Search..."), detail: localize('rss.addPubmedDetail', "The articles matching a search, as PubMed adds them") },
		{ choice: 'youtube', label: localize('rss.addYoutube', "YouTube Channel..."), detail: localize('rss.addYoutubeDetail', "The newest videos of a channel") },
		{ choice: 'address', label: localize('rss.addAddress', "Other Address..."), detail: localize('rss.addAddressDetail', "A feed, or a journal's or website's page, whose feed is found") },
		{ type: 'separator' },
		{ choice: 'undoRemove', label: localize('rss.undoRemove', "Undo Remove..."), detail: localize('rss.undoRemoveDetail', "The feeds removed, to bring back as they were") },
	], { title });
	switch (choice?.choice) {
		case 'undoRemove': {
			const removed = rssFeedsService.getRemovedFeeds();
			if (!removed.length) {
				notificationService.info(localize('rss.noneRemoved', "No feed has been removed."));
				break;
			}
			// The last removed first
			const picked = await quickInputService.pick([...removed].reverse().map(feed => ({ label: feed.title, description: feed.topic, url: feed.url })), { title, canPickMany: true, matchOnDescription: true, placeHolder: localize('rss.undoRemovePlaceholder', "Tick the feeds to bring back") });
			if (picked?.length) {
				await rssFeedsService.restoreFeeds(picked.map(item => item.url));
			}
			break;
		}
		case 'alertsMailbox':
			if (await setAlertsMailbox(quickInputService, rssFeedsService, notificationService)) {
				notificationService.info(localize('rss.mailboxSet', "Pollis now reads the alerts mailbox {0}. Choose Add Feed > Email Alerts... to follow its alerts.", rssFeedsService.getAlertsMailbox()?.user ?? ''));
			}
			break;
		case 'emailAlerts': {
			if (!rssFeedsService.getAlertsMailbox() && !await setAlertsMailbox(quickInputService, rssFeedsService, notificationService)) {
				break;
			}
			const alerts = await rssFeedsService.getEmailAlerts();
			if (!alerts) {
				notificationService.warn(localize('rss.emailAlertsFailed', "The alerts mailbox could not be read. Check the internet connection, or set it again with Add Feed > Alerts Mailbox...."));
				break;
			}
			if (!alerts.length) {
				notificationService.info(localize('rss.emailAlertsEmpty', "No alert has arrived at {0} yet. Set up alerts at Google Scholar, JSTOR, HeinOnline and other sources to be sent there: the Email Alerts skill in Compose > Agent Skills shows how.", rssFeedsService.getAlertsMailbox()?.user ?? ''));
				break;
			}
			const followed = new Set(rssFeedsService.getFeeds().map(feed => feed.url));
			const items = (Object.keys(ALERT_SOURCES) as AlertSource[]).flatMap((source): (ICatalogueItem | IQuickPickSeparator)[] => {
				const ofSource = alerts.filter(alert => alert.source === source);
				return ofSource.length ? [
					{ type: 'separator', label: ALERT_SOURCES[source] },
					...ofSource.map(alert => ({ label: alert.name, picked: followed.has(alert.url), entry: { url: alert.url, topic: EMAIL_ALERTS_TOPIC, name: `${ALERT_SOURCES[source]}: ${alert.name}` } })),
				] : [];
			});
			const picked = await quickInputService.pick(items, { title: localize('rss.emailAlertsTitle', "Email Alerts"), canPickMany: true, placeHolder: localize('rss.emailAlertsPlaceholder', "Tick the alerts to follow") });
			if (picked) {
				const urls = new Set(picked.map(item => item.entry.url));
				await rssFeedsService.updateFeeds(picked.map(item => item.entry).filter(entry => !followed.has(entry.url)), alerts.map(alert => alert.url).filter(url => followed.has(url) && !urls.has(url)));
			}
			break;
		}
		case 'arxiv': {
			const query = (await quickInputService.input({
				title: localize('rss.arxivTitle', "arXiv Search"),
				placeHolder: 'abs:"survival analysis" AND cat:stat.ME',
				prompt: localize('rss.arxivPrompt', "Words to search for, or fields: ti: title, au: author, abs: abstract, cat: category; combine them with AND, OR and ANDNOT"),
			}))?.trim();
			if (query) {
				await rssFeedsService.updateFeeds([{ url: arxivSearchUrl(query), topic: ARXIV_TOPIC, name: arxivSearchName(query) }], []);
			}
			break;
		}
		case 'pubmed': {
			const term = (await quickInputService.input({
				title: localize('rss.pubmedTitle', "PubMed Search"),
				placeHolder: '"Cox proportional hazards"[Title/Abstract]',
				prompt: localize('rss.pubmedPrompt', "A search as written in PubMed, with field tags such as [Title/Abstract], [Author] or [MeSH Terms]"),
			}))?.trim();
			if (term) {
				await rssFeedsService.updateFeeds([{ url: pubmedSearchUrl(term), topic: MEDICINE_TOPIC, name: pubmedSearchName(term) }], []);
			}
			break;
		}
		case 'address': {
			// A feed, a journal's page or another web page: the feeds it leads to are looked up; when none, it is asked again
			let feeds: readonly { readonly url: string; readonly name?: string }[] = [];
			let value = '';
			let prompt = localize('rss.addPrompt', "The address of an RSS or Atom feed, or of a journal's or website's page");
			while (!feeds.length) {
				value = (await quickInputService.input({
					title,
					value,
					placeHolder: 'https://onlinelibrary.wiley.com/journal/14680262',
					prompt,
					validateInput: async value => /^https?:\/\/\S+$/.test(value.trim()) ? undefined : localize('rss.addInvalid', "Enter an address that starts with https://"),
				}))?.trim() ?? '';
				if (!value) {
					return;
				}
				feeds = await rssFeedsService.findFeeds(value);
				prompt = localize('rss.addNotFound', "No feed found at this address. On the journal's or website's page, look for an RSS link and copy its address (Oxford journals: the RSS icon on the journal's page).");
			}
			const feed = feeds.length === 1 ? feeds[0] : (await quickInputService.pick(feeds.map(feed => ({ label: feed.name ?? feed.url, description: feed.name ? feed.url : undefined, feed })), { title, placeHolder: localize('rss.pickFeed', "The page lists several feeds: choose one") }))?.feed;
			if (!feed) {
				break;
			}
			const topic = await pickTopic(quickInputService, rssFeedsService, title);
			if (topic) {
				await rssFeedsService.updateFeeds([{ url: feed.url, topic, name: feed.name }], []);
			}
			break;
		}
		case 'youtube': {
			const youtubeTitle = localize('rss.youtubeTitle', "YouTube Channel");
			// The channel's page is looked up once the address is entered; when no channel is found, it is asked again
			let feed: { readonly url: string; readonly name?: string } | undefined;
			let value = '';
			let prompt = localize('rss.youtubePrompt', "The channel's address, its @handle or its channel id (UC...)");
			while (!feed) {
				value = (await quickInputService.input({ title: youtubeTitle, value, placeHolder: 'https://www.youtube.com/@wsj', prompt }))?.trim() ?? '';
				if (!value) {
					return;
				}
				feed = await rssFeedsService.findYouTubeFeed(value);
				prompt = localize('rss.youtubeNotFound', "No channel found. Open the channel on YouTube and copy its address, or its channel id from About > Share Channel > Copy Channel ID.");
			}
			const topic = await pickTopic(quickInputService, rssFeedsService, youtubeTitle);
			if (topic) {
				await rssFeedsService.updateFeeds([{ url: feed.url, topic, name: feed.name }], []);
			}
			break;
		}
	}
}

/** The page: its texts come from here, the feeds and their items from the `state` message. */
function pageHtml(): string {
	const text = {
		title: localize('rss.title', "RSS Feeds"),
		intro: localize('rss.intro', "News from the feeds you follow, by topic, read every hour. Open an item to read it in the browser; the newest unread ones of the feeds you choose are also on the welcome page."),
		addFeed: localize('rss.addFeed', "Add Feed"),
		refresh: localize('rss.refresh', "Refresh"),
		refreshing: localize('rss.refreshing', "Reading the feeds..."),
		allFeeds: localize('rss.allFeeds', "All Feeds"),
		collapseAll: localize('rss.collapseAll', "Collapse All Topics"),
		restoreTopics: localize('rss.restoreTopics', "Restore Topics"),
		remove: localize('rss.remove', "Remove"),
		noItems: localize('rss.noItems', "No items yet."),
		noItemsShown: localize('rss.noItemsShown', "No items shown."),
		noFeeds: localize('rss.noFeeds', "No feeds. Add one with Add Feed."),
		error: localize('rss.error', "Could not be read the last time; the items shown are the ones read before."),
		feedsColumn: localize('rss.feedsColumn', "Feeds"),
		subscribed: localize('rss.subscribed', "Subscribed"),
		display: localize('rss.display', "Display"),
		here: localize('rss.here', "Here"),
		welcomePage: localize('rss.welcomePage', "Welcome Page"),
		counts: localize('rss.counts', "Unread / Total"),
		subscribedTooltip: localize('rss.subscribedTooltip', "Subscribed: Pollis reads the feed every hour. Unsubscribed, it is no longer read, but its items stay."),
		hereTooltip: localize('rss.hereTooltip', "Display the items here. A feed not displayed here is not on the welcome page either, but is still read and archived."),
		welcomeTooltip: localize('rss.welcomeTooltip', "Display the newest unread items on the welcome page"),
		countsTooltip: localize('rss.countsTooltip', "{0} unread of {1}, in the period of Items From"),
		markUnread: localize('rss.markUnread', "Mark Unread"),
		previous: localize('rss.previous', "Previous"),
		next: localize('rss.next', "Next"),
		pageOf: localize('rss.pageOf', "Page {0} of {1}"),
		inZotero: localize('rss.inZotero', "In Zotero"),
		download: localize('rss.download', "Download Episode"),
		downloaded: localize('rss.downloadedLink', "Downloaded"),
		period: localize('rss.period', "Items From"),
		onDay: localize('rss.onDay', "On a Day..."),
		previousMonth: localize('rss.previousMonth', "Previous Month"),
		nextMonth: localize('rss.nextMonth', "Next Month"),
		hasItems: localize('rss.hasItems', "Items on this day"),
		dayNote: localize('rss.dayNote', "Only the latest items of each feed are kept here, and the archive goes back only to the day you started following it: a feed cannot tell what happened before then."),
		days: Object.fromEntries(DISPLAY_DAYS.map(days => [days, days ? localize('rss.lastDays', "The Last {0} Days", days) : localize('rss.allDays', "All Items Kept")])),
		watch: localize('rss.watch', "Watch"),
		video: localize('rss.videoFeed', "Videos"),
		podcast: localize('rss.podcastFeed', "Podcast"),
		listen: localize('rss.listen', "Listen"),
		addToZotero: localize('rss.addToZotero', "Add to Zotero"),
		exportOpml: localize('rss.exportOpml', "Export as OPML"),
		journals: localize('rss.journals', "Journals"),
		journalFilters: {
			all: localize('rss.journalsAll', "All"),
			academic: localize('rss.journalsAcademic', "Academic (Level 1 or 2)"),
			leading: localize('rss.journalsLeading', "Leading (Level 2)"),
			openAccess: localize('rss.journalsOpenAccess', "Open Access"),
			sjrQ1: localize('rss.journalsSjrQ1', "SJR Q1"),
			sjrQ12: localize('rss.journalsSjrQ12', "SJR Q1\u2013Q2"),
			snip: localize('rss.journalsSnip', "SNIP Above 1"),
		},
		journalDescriptions: {
			all: localize('rss.journalsAllDetail', "Every item, whatever its journal"),
			academic: localize('rss.journalsAcademicDetail', "The items of the journals the Norwegian register ranks as academic: level 1, or level 2, its leading journals. Items not from a journal stay."),
			leading: localize('rss.journalsLeadingDetail', "The items of the journals at level 2 of the Norwegian register, the leading journals of their field. Items not from a journal stay."),
			openAccess: localize('rss.journalsOpenAccessDetail', "The items of the journals whose articles are all open access (OpenAlex), or that are in the Directory of Open Access Journals. Items not from a journal stay."),
			sjrQ1: localize('rss.journalsSjrQ1Detail', "The items of the journals in the top quarter of SJR (SCImago) in at least one of their categories, in the latest year imported. Items not from a journal stay."),
			sjrQ12: localize('rss.journalsSjrQ12Detail', "The items of the journals in the top half of SJR (SCImago) in at least one of their categories, in the latest year imported. Items not from a journal stay."),
			snip: localize('rss.journalsSnipDetail', "The items of the journals cited more than the average of their field: SNIP (CWTS) above 1, in the latest year imported. Items not from a journal stay."),
		},
		journalsTooltip: localize('rss.journalsTooltip', "The levels are the Norwegian register's, built into Pollis; the choices of SJR and SNIP appear once their metrics are imported (Databases > PollisJournals > Import Journal Metrics...). The counts follow the choice."),
		exportOpmlTooltip: localize('rss.exportOpmlTooltip', "Save the feeds you follow as an OPML file, to follow them in Zotero or another feed reader"),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 1100px; margin: 0 auto; padding: 24px; }
		.header { display: flex; align-items: flex-end; gap: 16px; }
		.header h1 { flex: 1; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; line-height: 1.4; max-width: 900px; }
		button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; border-radius: 2px; padding: 4px 12px; cursor: pointer; margin-bottom: 8px; }
		button.action:hover { background: var(--vscode-button-secondaryHoverBackground); }
		button.action.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.action.primary:hover { background: var(--vscode-button-hoverBackground); }
		.panes { display: flex; gap: 16px; align-items: flex-start; }
		.feeds { flex: 0 0 50%; border-top: 1px solid var(--vscode-widget-border); }
		.items { flex: 1; min-width: 0; border-top: 1px solid var(--vscode-widget-border); }
		.feed { display: flex; align-items: center; gap: 8px; padding: 8px; border-bottom: 1px solid var(--vscode-widget-border); cursor: pointer; }
		.feed:hover { background: var(--vscode-list-hoverBackground); }
		.feed.selected { background: var(--vscode-list-inactiveSelectionBackground); box-shadow: inset 3px 0 0 var(--vscode-textLink-foreground); }
		.feed .name { flex: 1; min-width: 0; line-height: 1.4; }
		.feed .name .title { display: flex; align-items: center; gap: 6px; }
		.feed .name .media { display: inline-flex; flex-shrink: 0; color: var(--vscode-descriptionForeground); }
		.feed .error { font-size: 11px; color: var(--vscode-errorForeground); }
		.count { flex: none; width: 88px; white-space: nowrap; font-size: 11px; font-weight: 600; text-align: center; padding: 1px 0; border-radius: 9px; color: var(--vscode-badge-foreground); background: var(--vscode-badge-background); }
		.count.zero { color: var(--vscode-descriptionForeground); background: none; font-weight: normal; }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; font-size: 12px; }
		.link:hover { text-decoration: underline; }
		.feed .remove { visibility: hidden; }
		.feed:hover .remove, .feed:focus-within .remove { visibility: visible; }
		.item { width: 100%; text-align: left; font: inherit; color: inherit; background: none; border: none; border-bottom: 1px solid var(--vscode-widget-border); padding: 8px; cursor: pointer; line-height: 1.4; }
		.item:hover { background: var(--vscode-list-hoverBackground); }
		.item .itemTitle { font-weight: 600; }
		.item.read .itemTitle { font-weight: normal; color: var(--vscode-descriptionForeground); }
		.item .meta { font-size: 11px; color: var(--vscode-descriptionForeground); }
		.empty { color: var(--vscode-descriptionForeground); padding: 12px 8px; }
		.pager { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 12px 8px; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.pager .link:disabled { color: var(--vscode-disabledForeground); cursor: default; text-decoration: none; }
		.topic { font-weight: 600; }
		.feed .chevron { flex: none; display: flex; color: var(--vscode-foreground); background: none; border: none; padding: 0; cursor: pointer; transition: transform 0.1s; }
		.feed.collapsed .chevron { transform: rotate(-90deg); }
		.feed .subscribed, .columns .subscribed { flex: none; width: 72px; display: flex; justify-content: center; }
		.feed .here, .columns .here { flex: none; width: 40px; display: flex; justify-content: center; }
		.feed .welcome, .columns .welcome { flex: none; width: 88px; display: flex; justify-content: center; }
		/* The colours of the macOS window buttons: red off, green on, half and half when only some are on */
		.feed .tick { width: 12px; height: 12px; margin: 0; padding: 0; border: none; border-radius: 50%; background: #FF5F57; cursor: pointer; }
		.feed .tick[aria-checked="true"] { background: #28C840; }
		.feed .tick[aria-checked="mixed"] { background: linear-gradient(90deg, #28C840 50%, #FF5F57 50%); }
		.feed .tick:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: 2px; }
		.feed .indent { flex: none; width: 16px; }
		.feed.inTopic .indent { width: 40px; }
		.feed.hiddenFeed .name, .feed.unsubscribed .name { color: var(--vscode-disabledForeground); }
		.columns { display: flex; align-items: center; gap: 8px; padding: 4px 8px; font-size: 11px; color: var(--vscode-descriptionForeground); border-bottom: 1px solid var(--vscode-widget-border); }
		.columns { align-items: flex-end; }
		.columns .fill { flex: 1; }
		.columns .group { flex: none; display: flex; flex-direction: column; gap: 3px; }
		.columns .groupTitle { text-align: center; padding-bottom: 2px; border-bottom: 1px solid var(--vscode-descriptionForeground); }
		.columns .groupColumns { display: flex; gap: 8px; }
		.columns .countColumn { flex: none; width: 88px; text-align: center; white-space: nowrap; }
		.period { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.dayPicker { position: relative; margin: 0 0 8px -6px; }
		.dayButton { font: inherit; font-size: 12px; color: var(--vscode-dropdown-foreground); background: var(--vscode-dropdown-background); border: 1px solid var(--vscode-dropdown-border); border-radius: 2px; padding: 2px 6px; cursor: pointer; }
		.calendar { position: absolute; top: calc(100% + 4px); left: 0; z-index: 10; padding: 8px; font-size: 12px; color: var(--vscode-foreground); background: var(--vscode-editorWidget-background); border: 1px solid var(--vscode-widget-border); border-radius: 4px; box-shadow: 0 2px 8px var(--vscode-widget-shadow); }
		.calendar .month { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; font-weight: 600; }
		.calendar .month button { font: inherit; color: var(--vscode-foreground); background: none; border: none; padding: 0 6px; cursor: pointer; }
		.calendar .month button:disabled { color: var(--vscode-disabledForeground); cursor: default; }
		.calendar .grid { display: grid; grid-template-columns: repeat(7, 28px); gap: 2px; text-align: center; }
		.calendar .weekday { color: var(--vscode-descriptionForeground); font-size: 11px; }
		.calendar .date { font: inherit; height: 24px; color: var(--vscode-descriptionForeground); background: none; border: 1px solid transparent; border-radius: 3px; padding: 0; cursor: pointer; }
		.calendar .date.hasItems { color: var(--vscode-foreground); font-weight: 600; }
		.calendar .date:hover:not(:disabled) { background: var(--vscode-list-hoverBackground); }
		.calendar .date.today { border-color: var(--vscode-focusBorder); }
		.calendar .date.chosen { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		.calendar .date:disabled { color: var(--vscode-disabledForeground); cursor: default; }
		.note { font-size: 12px; color: var(--vscode-descriptionForeground); padding: 8px; border-bottom: 1px solid var(--vscode-widget-border); line-height: 1.4; }
		.period select { font: inherit; color: var(--vscode-dropdown-foreground); background: var(--vscode-dropdown-background); border: 1px solid var(--vscode-dropdown-border); border-radius: 2px; padding: 2px 4px; }
		.item { display: flex; gap: 10px; }
		.item .thumb { flex: none; width: 96px; height: 54px; object-fit: cover; border-radius: 3px; background: var(--vscode-widget-border); }
		.item .text { flex: 1; min-width: 0; }
		.item .summary { font-size: 12px; color: var(--vscode-descriptionForeground); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
		.item .play, .item .zotero, .item .download, .item .unread { margin-left: 8px; }
		.item .zotero.link, .item .unread { visibility: hidden; }
		.item .journal { margin-left: 8px; padding: 0 6px; white-space: nowrap; border-radius: 9px; border: 1px solid var(--vscode-charts-purple); color: var(--vscode-charts-purple); }
		.item:hover .zotero.link, .item:focus .zotero.link, .item:hover .unread, .item:focus .unread { visibility: visible; }
	</style>
</head>
<body>
<div class="container">
	<div class="header">
		<h1>${text.title}</h1>
		<label class="period">${text.period}<select id="days">${DISPLAY_DAYS.map(days => `<option value="${days}">${text.days[days]}</option>`).join('')}<option value="day">${text.onDay}</option></select></label><span class="dayPicker"><button id="day" class="dayButton" hidden></button><div class="calendar" id="calendar" hidden></div></span>
		<label class="period">${text.journals}<select id="journals"></select></label>
		<button class="action primary" id="add">${text.addFeed}</button>
		<button class="action" id="refresh">${text.refresh}</button>
		<button class="action" id="exportOpml" title="${text.exportOpmlTooltip}">${text.exportOpml}</button>
	</div>
	<p class="subtitle" id="subtitle">${text.intro}</p>
	<div class="panes">
		<div class="feeds" id="feeds"></div>
		<div class="items">
			<div id="items"></div>
		</div>
	</div>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const feedsElement = document.getElementById('feeds');
	const itemsElement = document.getElementById('items');
	const subtitle = document.getElementById('subtitle');
	// What the right shows: 'feed:' and an address, 'topic:' and a topic, or undefined for all the feeds
	let selected;
	// The page of the items shown, from 0, of PAGE_SIZE items each; back to the first when the choice changes
	const PAGE_SIZE = 100;
	let page = 0;
	let state = { topics: [], feeds: [], metricsSources: [] };
	// The topics collapsed, and those opened that start collapsed (no feed subscribed), kept between sessions
	const collapsed = new Set((vscode.getState() || {}).collapsed || []);
	const opened = new Set((vscode.getState() || {}).opened || []);
	// The chevron of All Feeds collapses all topics, leaving 'collapsed' and 'opened' alone, so that opening it again
	// restores each topic as it was; the topics opened meanwhile, one by one, are in 'openedWhileAllCollapsed'
	let allCollapsed = !!(vscode.getState() || {}).allCollapsed;
	const openedWhileAllCollapsed = new Set((vscode.getState() || {}).openedWhileAllCollapsed || []);
	function isCollapsed(topic) {
		if (allCollapsed) {
			return !openedWhileAllCollapsed.has(topic);
		}
		return collapsed.has(topic) || (!opened.has(topic) && !state.feeds.some(feed => feed.topic === topic && feed.subscribed));
	}
	// The choice of Journals, kept between sessions too
	let journalFilter = (vscode.getState() || {}).journalFilter || 'all';
	function saveCollapsed() {
		vscode.setState({ collapsed: [...collapsed], opened: [...opened], allCollapsed, openedWhileAllCollapsed: [...openedWhileAllCollapsed], journalFilter });
	}
	const journalsElement = document.getElementById('journals');
	// The choices of Journals: those of SJR and SNIP only once SCImago's and CWTS's metrics are imported
	function renderJournalChoices() {
		const choices = ['all', 'academic', 'leading', 'openAccess']
			.concat(state.metricsSources.includes('SCImago') ? ['sjrQ1', 'sjrQ12'] : [])
			.concat(state.metricsSources.includes('CWTS') ? ['snip'] : []);
		// A choice no longer offered, its metrics deleted, goes back to All
		if (!choices.includes(journalFilter)) {
			chooseJournals('all');
		}
		journalsElement.textContent = '';
		for (const choice of choices) {
			const option = element('option', '', TEXT.journalFilters[choice]);
			option.value = choice;
			option.title = TEXT.journalDescriptions[choice];
			journalsElement.appendChild(option);
		}
		journalsElement.value = journalFilter;
		// The open list of a select shows no hovers on every system: the select itself describes the choice made
		journalsElement.title = TEXT.journalDescriptions[journalFilter] + '\\n\\n' + TEXT.journalsTooltip;
	}
	function chooseJournals(choice) {
		journalFilter = choice;
		page = 0;
		saveCollapsed();
		vscode.postMessage({ command: 'journals', journals: choice });
	}
	journalsElement.addEventListener('change', () => chooseJournals(journalsElement.value));
	const VIDEO = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linejoin="round"><rect x="1.5" y="4" width="9" height="8" rx="1.5"/><path d="M10.5 7l4-2.5v7l-4-2.5z"/></svg>';
	const PODCAST = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round"><rect x="5.5" y="1.5" width="5" height="8" rx="2.5"/><path d="M3 7.5a5 5 0 0 0 10 0M8 12.5v2M5.5 14.5h5"/></svg>';
	const CHEVRON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3.15 5.65a.5.5 0 0 1 .7 0L8 9.79l4.15-4.14a.5.5 0 0 1 .7.7l-4.5 4.5a.5.5 0 0 1-.7 0l-4.5-4.5a.5.5 0 0 1 0-.7Z"/></svg>';

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	function select(key) {
		selected = key;
		page = 0;
		render();
	}

	function onActivate(row, action) {
		row.tabIndex = 0;
		row.addEventListener('click', action);
		row.addEventListener('keydown', event => { if (event.target === row && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); action(); } });
	}

	function countBadge(feeds) {
		// Feeds not read, never subscribed or with nothing kept: a dash rather than 0 / 0
		if (feeds.length && feeds.every(feed => !feed.subscribed && !feed.total)) {
			return element('span', 'count zero', '\\u2013');
		}
		const unread = feeds.reduce((sum, feed) => sum + feed.unread, 0);
		const total = feeds.reduce((sum, feed) => sum + feed.total, 0);
		const count = element('span', 'count' + (unread ? '' : ' zero'), unread + ' / ' + total);
		count.title = TEXT.countsTooltip.replace('{0}', String(unread)).replace('{1}', String(total));
		return count;
	}

	// The three ticks of a feed, or of a topic's feeds (partly ticked when only some of them are)
	function tickCells(row, feeds) {
		for (const [column, property, command, tooltip] of [
			['subscribed', 'subscribed', 'subscribe', TEXT.subscribedTooltip],
			['here', 'shown', 'show', TEXT.hereTooltip],
			['welcome', 'onWelcome', 'welcome', TEXT.welcomeTooltip],
		]) {
			const all = feeds.every(feed => feed[property]);
			const checked = all ? 'true' : feeds.some(feed => feed[property]) ? 'mixed' : 'false';
			row.appendChild(tickCell(column, checked, tooltip, value => vscode.postMessage({ command, urls: feeds.map(feed => feed.url), value })));
		}
	}

	function topicRow(topic) {
		const key = 'topic:' + topic;
		const row = element('div', 'feed topic' + (selected === key ? ' selected' : '') + (isCollapsed(topic) ? ' collapsed' : ''));
		const feeds = state.feeds.filter(feed => feed.topic === topic);
		const chevron = element('button', 'chevron');
		chevron.innerHTML = CHEVRON;
		chevron.addEventListener('click', event => {
			event.stopPropagation();
			if (allCollapsed) {
				if (openedWhileAllCollapsed.has(topic)) {
					openedWhileAllCollapsed.delete(topic);
				} else {
					openedWhileAllCollapsed.add(topic);
				}
			} else if (isCollapsed(topic)) {
				collapsed.delete(topic);
				opened.add(topic);
			} else {
				collapsed.add(topic);
				opened.delete(topic);
			}
			saveCollapsed();
			render();
		});
		row.appendChild(chevron);
		row.appendChild(element('div', 'name', topic));
		tickCells(row, feeds);
		row.appendChild(countBadge(feeds));
		onActivate(row, () => select(key));
		return row;
	}

	// A cell of the column 'subscribed', 'here' or 'welcome' with a circle, which leaves the row's selection alone:
	// green when ticked ('true'), half green and half red when only some of a topic's feeds are ('mixed'), red otherwise; a click ticks all unless all are
	function tickCell(column, checked, tooltip, onChange) {
		const cell = element('span', column);
		const tick = element('button', 'tick');
		tick.setAttribute('role', 'checkbox');
		tick.setAttribute('aria-checked', checked);
		tick.setAttribute('aria-label', tooltip);
		tick.title = tooltip;
		tick.addEventListener('click', event => { event.stopPropagation(); onChange(checked !== 'true'); });
		tick.addEventListener('keydown', event => event.stopPropagation());
		cell.appendChild(tick);
		return cell;
	}

	// The row of a feed, or with no feed the row All Feeds, counting the feeds 'counted'
	function feedRow(title, feed, counted) {
		const url = feed && feed.url;
		const key = url && 'feed:' + url;
		const row = element('div', 'feed' + (url ? ' inTopic' : '') + (selected === key ? ' selected' : '') + (feed && !feed.shown ? ' hiddenFeed' : '') + (feed && !feed.subscribed ? ' unsubscribed' : '') + (!feed && allCollapsed ? ' collapsed' : ''));
		row.tabIndex = 0;
		if (feed) {
			row.appendChild(element('span', 'indent'));
		} else {
			const chevron = element('button', 'chevron');
			chevron.innerHTML = CHEVRON;
			chevron.title = allCollapsed ? TEXT.restoreTopics : TEXT.collapseAll;
			chevron.setAttribute('aria-label', chevron.title);
			chevron.addEventListener('click', event => {
				event.stopPropagation();
				allCollapsed = !allCollapsed;
				openedWhileAllCollapsed.clear();
				saveCollapsed();
				render();
			});
			chevron.addEventListener('keydown', event => event.stopPropagation());
			row.appendChild(chevron);
		}
		const name = element('div', 'name');
		const titleElement = name.appendChild(element('div', 'title', title));
		// A feed of videos or a podcast has its icon after its name
		if (feed && feed.media) {
			const media = titleElement.appendChild(element('span', 'media'));
			media.innerHTML = feed.media === 'video' ? VIDEO : PODCAST;
			media.title = feed.media === 'video' ? TEXT.video : TEXT.podcast;
			media.setAttribute('aria-label', media.title);
		}
		if (url) {
			row.title = url;
		}
		if (feed && feed.error) {
			name.appendChild(element('div', 'error', TEXT.error));
		}
		row.appendChild(name);
		if (url) {
			const remove = element('button', 'link remove', TEXT.remove);
			remove.addEventListener('click', event => { event.stopPropagation(); vscode.postMessage({ command: 'remove', url }); });
			row.appendChild(remove);
		}
		if (feed) {
			tickCells(row, [feed]);
		} else {
			['subscribed', 'here', 'welcome'].forEach(column => row.appendChild(element('span', column)));
		}
		row.appendChild(countBadge(counted));
		onActivate(row, () => select(key));
		return row;
	}

	function isShown(feed) {
		return !selected || selected === 'feed:' + feed.url || selected === 'topic:' + feed.topic;
	}

	function render() {
		if (selected && !state.feeds.some(feed => selected === 'feed:' + feed.url || selected === 'topic:' + feed.topic)) {
			selected = undefined;
		}
		subtitle.textContent = state.refreshing ? TEXT.refreshing : TEXT.intro;
		feedsElement.textContent = '';
		if (!state.feeds.length) {
			feedsElement.appendChild(element('div', 'empty', TEXT.noFeeds));
		} else {
			const columns = element('div', 'columns');
			columns.appendChild(element('span', 'fill', TEXT.feedsColumn));
			columns.appendChild(element('span', 'subscribed', TEXT.subscribed));
			// Here and Welcome Page under one title, Display, with a rule under it
			const display = element('span', 'group');
			display.appendChild(element('span', 'groupTitle', TEXT.display));
			const displayColumns = element('span', 'groupColumns');
			displayColumns.appendChild(element('span', 'here', TEXT.here));
			displayColumns.appendChild(element('span', 'welcome', TEXT.welcomePage));
			display.appendChild(displayColumns);
			columns.appendChild(display);
			columns.appendChild(element('span', 'countColumn', TEXT.counts));
			feedsElement.appendChild(columns);
			feedsElement.appendChild(feedRow(TEXT.allFeeds, undefined, state.feeds));
			for (const topic of state.topics) {
				const feeds = state.feeds.filter(feed => feed.topic === topic);
				feedsElement.appendChild(topicRow(topic));
				if (!isCollapsed(topic)) {
					for (const feed of feeds) {
						feedsElement.appendChild(feedRow(feed.title, feed, [feed]));
					}
				}
			}
		}
		const oneFeed = selected && selected.startsWith('feed:');
		const shown = state.feeds.filter(isShown)
			.flatMap(feed => feed.items.map(item => ({ ...item, feed: feed.title })))
			.sort((a, b) => b.date - a.date);
		itemsElement.textContent = '';
		if (state.day) {
			itemsElement.appendChild(element('div', 'note', TEXT.dayNote));
		}
		if (!shown.length) {
			itemsElement.appendChild(element('div', 'empty', state.feeds.some(feed => isShown(feed) && feed.kept) ? TEXT.noItemsShown : TEXT.noItems));
		}
		const pages = Math.ceil(shown.length / PAGE_SIZE);
		page = Math.max(0, Math.min(page, pages - 1));
		// The pager above the items and again under them
		if (pages > 1) {
			itemsElement.appendChild(pager(pages));
		}
		for (const item of shown.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)) {
			const row = element('button', 'item' + (item.read ? ' read' : ''));
			if (item.image) {
				const thumb = element('img', 'thumb');
				thumb.src = item.image;
				thumb.alt = '';
				thumb.loading = 'lazy';
				thumb.addEventListener('error', () => thumb.remove());
				row.appendChild(thumb);
			}
			const content = element('div', 'text');
			content.appendChild(element('div', 'itemTitle', item.title));
			if (item.summary) {
				content.appendChild(element('div', 'summary', item.summary));
			}
			const meta = element('div', 'meta', oneFeed ? item.age : [item.feed, item.age].filter(Boolean).join(' \\u00b7 '));
			if (item.mediaType || item.media) {
				// A video or an audio page plays on its page; a podcast episode's file opens in the browser's player
				const play = element('span', 'link play', '\\u25b6 ' + (item.mediaType === 'video' ? TEXT.watch : TEXT.listen));
				play.addEventListener('click', event => { event.stopPropagation(); vscode.postMessage({ command: item.media ? 'openMedia' : 'open', id: item.id }); });
				meta.appendChild(play);
			}
			if (item.media) {
				// A podcast episode's file can be kept: Download Episode saves it, Downloaded shows where
				const download = element('span', 'link download', item.downloaded ? TEXT.downloaded : TEXT.download);
				download.addEventListener('click', event => { event.stopPropagation(); vscode.postMessage({ command: 'download', id: item.id }); });
				meta.appendChild(download);
			}
			if (item.journal && item.journal.tag) {
				const journal = meta.appendChild(element('span', 'journal', item.journal.tag));
				journal.title = item.journal.details;
			}
			if (item.inZotero) {
				meta.appendChild(element('span', 'zotero', TEXT.inZotero));
			} else {
				const zotero = element('span', 'link zotero', TEXT.addToZotero);
				zotero.addEventListener('click', event => { event.stopPropagation(); vscode.postMessage({ command: 'zotero', id: item.id }); });
				meta.appendChild(zotero);
			}
			if (item.read) {
				const unread = element('span', 'link unread', TEXT.markUnread);
				unread.addEventListener('click', event => { event.stopPropagation(); vscode.postMessage({ command: 'markUnread', id: item.id }); });
				meta.appendChild(unread);
			}
			content.appendChild(meta);
			row.appendChild(content);
			row.addEventListener('click', () => vscode.postMessage({ command: 'open', id: item.id }));
			itemsElement.appendChild(row);
		}
		if (pages > 1) {
			itemsElement.appendChild(pager(pages));
		}
	}

	// Previous, Page X of Y and Next, above and under the items; a new page is shown from its top
	function pager(pages) {
		const bar = element('div', 'pager');
		const turn = (label, to) => {
			const button = element('button', 'link', label);
			button.disabled = to < 0 || to >= pages;
			button.addEventListener('click', () => {
				page = to;
				render();
				// Only when the items' top is out of sight, as after the pager under them: the page stays put otherwise
				if (itemsElement.getBoundingClientRect().top < 0) {
					itemsElement.scrollIntoView({ block: 'start' });
				}
			});
			return button;
		};
		bar.appendChild(turn(TEXT.previous, page - 1));
		bar.appendChild(element('span', '', TEXT.pageOf.replace('{0}', String(page + 1)).replace('{1}', String(pages))));
		bar.appendChild(turn(TEXT.next, page + 1));
		return bar;
	}

	const daysElement = document.getElementById('days');
	const dayElement = document.getElementById('day');
	// Today in this computer's time zone, as YYYY-MM-DD
	function today() {
		const now = new Date();
		return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
	}
	const calendarElement = document.getElementById('calendar');
	// The day chosen last, kept when going back to a period; the month shown in the calendar, as its first day
	let chosenDay = '';
	let month = new Date();
	function chooseDay(day) {
		page = 0;
		chosenDay = day;
		vscode.postMessage({ command: 'day', day });
	}
	daysElement.addEventListener('change', () => {
		page = 0;
		if (daysElement.value === 'day') {
			// On a Day... starts on today, or on the day chosen before, with the calendar open
			chooseDay(chosenDay || today());
			openCalendar();
		} else {
			closeCalendar();
			vscode.postMessage({ command: 'days', days: Number(daysElement.value) });
		}
	});
	dayElement.addEventListener('click', event => {
		event.stopPropagation();
		if (calendarElement.hidden) {
			openCalendar();
		} else {
			closeCalendar();
		}
	});
	// A month at a time, from Monday; days to come cannot be chosen, days with items kept are in bold
	function openCalendar() {
		const [year, monthIndex] = (chosenDay || today()).split('-').map(Number);
		month = new Date(year, monthIndex - 1, 1);
		calendarElement.hidden = false;
		renderCalendar();
	}
	function closeCalendar() {
		calendarElement.hidden = true;
	}
	function renderCalendar() {
		calendarElement.textContent = '';
		const header = element('div', 'month');
		const turn = (label, title, delta) => {
			const button = element('button', '', label);
			button.title = title;
			const to = new Date(month.getFullYear(), month.getMonth() + delta, 1);
			button.disabled = delta > 0 && to > new Date();
			button.addEventListener('click', event => { event.stopPropagation(); month = to; renderCalendar(); });
			return button;
		};
		header.appendChild(turn('\u2039', TEXT.previousMonth, -1));
		header.appendChild(element('span', '', month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })));
		header.appendChild(turn('\u203a', TEXT.nextMonth, 1));
		calendarElement.appendChild(header);
		const grid = element('div', 'grid');
		for (let i = 0; i < 7; i++) {
			// 5 January 1970 was a Monday
			grid.appendChild(element('span', 'weekday', new Date(1970, 0, 5 + i).toLocaleDateString(undefined, { weekday: 'narrow' })));
		}
		for (let i = 0; i < (month.getDay() + 6) % 7; i++) {
			grid.appendChild(element('span'));
		}
		const itemDays = new Set(state.itemDays);
		const last = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
		for (let date = 1; date <= last; date++) {
			const day = month.getFullYear() + '-' + String(month.getMonth() + 1).padStart(2, '0') + '-' + String(date).padStart(2, '0');
			const button = element('button', 'date' + (itemDays.has(day) ? ' hasItems' : '') + (day === today() ? ' today' : '') + (day === state.day ? ' chosen' : ''), String(date));
			if (itemDays.has(day)) {
				button.title = TEXT.hasItems;
			}
			button.disabled = day > today();
			button.addEventListener('click', event => { event.stopPropagation(); closeCalendar(); chooseDay(day); });
			grid.appendChild(button);
		}
		calendarElement.appendChild(grid);
	}
	calendarElement.addEventListener('click', event => event.stopPropagation());
	document.addEventListener('click', closeCalendar);
	document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeCalendar(); } });
	document.getElementById('add').addEventListener('click', () => vscode.postMessage({ command: 'add' }));
	document.getElementById('refresh').addEventListener('click', () => vscode.postMessage({ command: 'refresh' }));
	document.getElementById('exportOpml').addEventListener('click', () => vscode.postMessage({ command: 'exportOpml' }));

	window.addEventListener('message', event => {
		if (event.data.command === 'state') {
			state = event.data;
			daysElement.value = state.day ? 'day' : String(state.days);
			dayElement.hidden = !state.day;
			if (state.day) {
				chosenDay = state.day;
				const [year, monthIndex, date] = state.day.split('-').map(Number);
				dayElement.textContent = new Date(year, monthIndex - 1, date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
			} else {
				closeCalendar();
			}
			if (!calendarElement.hidden) {
				renderCalendar();
			}
			renderJournalChoices();
			render();
		}
	});
	vscode.postMessage({ command: 'ready', journals: journalFilter });
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: RSS_FEEDS_COMMAND_ID,
			title: localize2('rss.action', "RSS Feeds"),
			category: localize2('rss.category', "Explore"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openRssFeedsPage(accessor);
	}
});
