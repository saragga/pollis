/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { fromNow } from '../../../../base/common/date.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { escape } from '../../../../base/common/strings.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { ALERT_SOURCES, AlertSource } from '../../../../platform/alertsMailbox/common/alertsMailbox.js';
import { ARXIV_TOPIC, arxivSearchName, arxivSearchUrl, findCatalogueFeed, MEDICINE_TOPIC, pubmedSearchName, pubmedSearchUrl, rssCatalogueTopics } from './rssCatalogue.js';
import { ADD_FEED_COMMAND_ID, getTopics, RSS_FEEDS_COMMAND_ID } from './rssFeedsPage.js';
import { IRssFeedEntry, IRssFeedsService, IRssItem, OTHER_TOPIC } from './rssFeedsService.js';
import { OPEN_LINK_COMMAND_ID } from './openLink.js';
import { voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';

// Add Feed: a feed from a PubMed or arXiv search, its newest results previewed before it is added; a feed at an
// address (a journal's or website's page, or a YouTube channel); the alerts of the alerts mailbox; and the feeds the
// user added, to remove, with those removed, to bring back.

type SearchSource = 'pubmed' | 'arxiv';

type AddFeedMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'previewSearch'; readonly request: number; readonly source: SearchSource; readonly query: string }
	| { readonly command: 'find'; readonly request: number; readonly address: string }
	| { readonly command: 'previewAddress'; readonly request: number; readonly url: string; readonly name?: string }
	| { readonly command: 'add'; readonly url: string; readonly name: string; readonly topic: string }
	| { readonly command: 'remove' | 'restore'; readonly url: string }
	| { readonly command: 'showFeeds' | 'listAlerts' }
	| { readonly command: 'connect'; readonly user: string; readonly server: string; readonly password: string }
	| { readonly command: 'follow'; readonly url: string; readonly name: string; readonly follow: boolean }
	| { readonly command: 'openLink' | 'openHelp'; readonly url: string };

/** The newest results a preview shows. */
const PREVIEW_SIZE = 10;

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the Add Feed page, or shows it again when it is open. */
async function openAddFeedPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const rssFeedsService = accessor.get(IRssFeedsService);
	const dialogService = accessor.get(IDialogService);
	const commandService = accessor.get(ICommandService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('addFeed.title', "Add Feed");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.addFeed',
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

	const followedUrls = () => new Set(rssFeedsService.getFeeds().map(feed => feed.url));
	const sendState = () => {
		const followed = rssFeedsService.getFeeds();
		webviewInput.webview.postMessage({
			command: 'state',
			topics: getTopics([OTHER_TOPIC, ...followed.map(feed => feed.topic), ...rssCatalogueTopics().map(({ topic }) => topic)]),
			// The feeds the user added, not the catalogue's, which the RSS Feeds page lists and removes
			added: followed.filter(feed => !findCatalogueFeed(feed.url)).map(feed => ({ url: feed.url, title: feed.title, topic: feed.topic })),
			removed: [...rssFeedsService.getRemovedFeeds()].reverse().map(feed => ({ url: feed.url, title: feed.title, topic: feed.topic ?? '' })),
			mailbox: rssFeedsService.getAlertsMailbox(),
		});
	};
	// The newest items of the feed at `url`, as the page shows them
	const preview = async (request: number, url: string, name: string, topic: string) => {
		const items = await rssFeedsService.previewFeed(url);
		webviewInput.webview.postMessage({
			command: 'preview',
			request,
			url,
			name,
			topic,
			followed: followedUrls().has(url),
			error: !items,
			count: items?.length ?? 0,
			items: (items ?? []).slice(0, PREVIEW_SIZE).map(item => toPreviewItem(item)),
		});
	};
	disposables.add(rssFeedsService.onDidChange(() => sendState()));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: AddFeedMessage }) => {
		const message = e.message;
		switch (message.command) {
			case 'ready':
				sendState();
				break;
			case 'previewSearch': {
				const query = message.query.trim();
				if (message.source === 'pubmed') {
					await preview(message.request, pubmedSearchUrl(query), pubmedSearchName(query), MEDICINE_TOPIC);
				} else {
					await preview(message.request, arxivSearchUrl(query), arxivSearchName(query), ARXIV_TOPIC);
				}
				break;
			}
			case 'find': {
				// A YouTube channel by its address, @handle or id; else a feed, or the feeds a page leads to
				const address = message.address.trim();
				const feeds = /youtube\.com\/|^@|^UC[\w-]{22}$/.test(address)
					? [await rssFeedsService.findYouTubeFeed(address)].filter(feed => !!feed)
					: await rssFeedsService.findFeeds(address);
				webviewInput.webview.postMessage({ command: 'found', request: message.request, feeds });
				break;
			}
			case 'previewAddress':
				await preview(message.request, message.url, message.name ?? '', OTHER_TOPIC);
				break;
			case 'add': {
				const entry: IRssFeedEntry = { url: message.url, topic: message.topic.trim() || OTHER_TOPIC, name: message.name.trim() || undefined };
				await rssFeedsService.updateFeeds([entry], []);
				webviewInput.webview.postMessage({ command: 'added', url: message.url });
				break;
			}
			case 'remove': {
				const feed = rssFeedsService.getFeeds().find(feed => feed.url === message.url);
				if (feed) {
					const { confirmed } = await dialogService.confirm({
						message: localize('addFeed.removeConfirm', "Remove the feed '{0}'?", feed.title),
						detail: localize('addFeed.removeDetail', "It moves to Removed Feeds on this page, to bring back as it was."),
						primaryButton: localize({ key: 'addFeed.removeButton', comment: ['&& denotes a mnemonic'] }, "&&Remove"),
					});
					if (confirmed) {
						await rssFeedsService.removeFeeds([message.url]);
					}
				}
				break;
			}
			case 'restore':
				await rssFeedsService.restoreFeeds([message.url]);
				break;
			case 'connect': {
				// Kept only once the mailbox can be read; the password goes to the system's keychain
				const [server, port] = message.server.trim().split(':');
				const error = await rssFeedsService.setAlertsMailbox({ server, port: port ? Number(port) : 993, user: message.user.trim(), folder: rssFeedsService.getAlertsMailbox()?.folder ?? 'INBOX' }, message.password);
				webviewInput.webview.postMessage({ command: 'connected', error });
				sendState();
				break;
			}
			case 'listAlerts': {
				// The alerts in the mailbox, by source in the order ALERT_SOURCES lists them
				const alerts = await rssFeedsService.getEmailAlerts();
				const sources = Object.keys(ALERT_SOURCES) as AlertSource[];
				const followed = followedUrls();
				webviewInput.webview.postMessage({
					command: 'alerts',
					error: !alerts,
					alerts: [...alerts ?? []].sort((a, b) => sources.indexOf(a.source) - sources.indexOf(b.source)).map(alert => ({
						url: alert.url,
						source: ALERT_SOURCES[alert.source],
						name: alert.name,
						followed: followed.has(alert.url),
					})),
				});
				break;
			}
			case 'follow':
				if (message.follow) {
					await rssFeedsService.updateFeeds([{ url: message.url, topic: EMAIL_ALERTS_TOPIC, name: message.name }], []);
				} else {
					await rssFeedsService.updateFeeds([], [message.url]);
				}
				break;
			case 'showFeeds':
				await commandService.executeCommand(RSS_FEEDS_COMMAND_ID);
				break;
			case 'openLink':
				if (/^https:\/\//.test(message.url)) {
					await commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
				}
				break;
			case 'openHelp':
				// Syntax help opens in Pollis's own browser, beside the page
				if (/^https:\/\//.test(message.url)) {
					await commandService.executeCommand('workbench.action.browser.open', message.url);
				}
				break;
		}
	}));
}

/** An item as a preview shows it: its title, its journal or source when the feed names one, and how old it is. */
function toPreviewItem(item: IRssItem): { title: string; source?: string; age: string; link: string } {
	return { title: item.title, source: item.issns ? item.summary : undefined, age: item.date ? fromNow(item.date, true) : '', link: item.link };
}

// The topic of the email alerts' feeds.
const EMAIL_ALERTS_TOPIC = 'Email Alerts';

// The IMAP servers of the common email providers, by the domain of the address; the page guesses the server from them.
const IMAP_SERVERS: readonly [RegExp, string][] = [
	[/^(?:gmail|googlemail)\.com$/, 'imap.gmail.com'],
	[/^(?:icloud|me|mac)\.com$/, 'imap.mail.me.com'],
	[/^yahoo\./, 'imap.mail.yahoo.com'],
	[/^fastmail\./, 'imap.fastmail.com'],
	[/^gmx\./, 'imap.gmx.com'],
];

/** The page: its texts come from here, the feeds from the `state` message. */
function pageHtml(): string {
	// A Pollis menu path, in the yellow of Discover Pollis
	const agentSkills = `<span class="menuPath">${escape(localize('addFeed.agentSkillsPath', "Compose > Agent Skills"))}</span>`;
	const text = {
		title: localize('addFeed.title', "Add Feed"),
		intro: localize('addFeed.intro', "Follow a search, a journal, a website or a YouTube channel. The catalogue's feeds are on the RSS Feeds page, by topic: tick Subscribed to follow one."),
		showFeeds: localize('addFeed.backToFeeds', "Back: RSS Feeds"),
		searchSection: localize('addFeed.searchSection', "From a Search"),
		searchIntro: localize('addFeed.searchIntro', "A search becomes a feed: Pollis runs it every hour, and the articles it finds that are new arrive as items. Preview the newest results first, to check the search finds what you want."),
		pubmed: 'PubMed',
		arxiv: 'arXiv',
		pubmedHelp: localize('addFeed.pubmedHelp', "A search as written in PubMed, with field tags such as [Title/Abstract], [Author], [Journal] or [MeSH Terms]; combine terms with AND, OR and NOT. The articles arrive as PubMed adds them, tagged with their journal's level and metrics."),
		arxivHelp: localize('addFeed.arxivHelp', "Words to search for, or fields: ti: title, au: author, abs: abstract, cat: category (such as stat.ME or econ.EM); combine them with AND, OR and ANDNOT. The newest papers come first."),
		pubmedSyntax: localize('addFeed.pubmedSyntax', "PubMed Search Tags"),
		arxivSyntax: localize('addFeed.arxivSyntax', "arXiv Query Syntax"),
		examples: localize('addFeed.examples', "Examples, to try with a click:"),
		close: localize('addFeed.close', "Close"),
		preview: localize('addFeed.preview', "Preview"),
		previewing: localize('addFeed.previewing', "Reading the newest results..."),
		addressSection: localize('addFeed.addressSection', "From an Address"),
		servicesTitle: localize('addFeed.servicesTitle', "Search Feeds from Other Services"),
		servicesIntro: localize('addFeed.servicesIntro', "Some services turn a search into a feed, behind a button of their own. Copy the feed's address there and paste it in the box above."),
		servicesEbsco: localize('addFeed.servicesEbsco', "<b>EBSCOhost:</b> run the search, then Share above the results, and under Create an alert, RSS Feed. It needs your library's access."),
		servicesProquest: localize('addFeed.servicesProquest', "<b>ProQuest:</b> run the search, then Save search/alert at the top of the results, and Get RSS feed. It needs your library's access."),
		servicesGoogleAlerts: localize('addFeed.servicesGoogleAlerts', "<b>Google Alerts:</b> at google.com/alerts, signed in, open Show options and set Deliver to RSS feed; the alert's RSS icon then gives its address."),
		servicesTopics: localize('addFeed.servicesTopics', "<b>NBER and RePEc NEP:</b> feeds by programme and by report, not by search; tick them under Economics and Central Banks on the RSS Feeds page, except NBER's Asset Pricing and the two Corporate Finance feeds, under Finance Research."),
		servicesEmail: localize('addFeed.servicesEmail', "<b>Google Scholar, JSTOR, HeinOnline:</b> alerts by email only; follow them From Email Alerts, below."),
		addressIntro: localize('addFeed.addressIntro', "The address of an RSS or Atom feed; of a journal's page, whose table of contents Pollis finds (Wiley, Taylor & Francis, SAGE, Elsevier, Cambridge Core, Oxford Academic); of another website, whose feeds its page lists; or of a YouTube channel, or its @handle."),
		find: localize('addFeed.find', "Find"),
		finding: localize('addFeed.finding', "Looking for feeds..."),
		notFound: localize('addFeed.notFound', "No feed found at this address. On the journal's or website's page, look for an RSS link and copy its address."),
		invalidAddress: localize('addFeed.invalidAddress', "Enter an address that starts with https://, or a YouTube @handle."),
		severalFound: localize('addFeed.severalFound', "The page lists several feeds: choose one."),
		name: localize('addFeed.name', "Name"),
		topic: localize('addFeed.topic', "Topic"),
		newTopic: localize('addFeed.newTopic', "New Topic..."),
		newTopicPlaceholder: localize('addFeed.newTopicPlaceholder', "The name of the new topic"),
		add: localize('addFeed.add', "Add Feed"),
		added: localize('addFeed.added', "Added. Its items are on the RSS Feeds page."),
		alreadyFollowed: localize('addFeed.alreadyFollowed', "You already follow this feed."),
		readError: localize('addFeed.readError', "The feed could not be read. Check the internet connection, or the search, and try again."),
		noResults: localize('addFeed.noResults', "Nothing found now. The feed can still be added: new results arrive as items when there are any."),
		resultsCount: localize('addFeed.resultsCount', "The newest {0} of the {1} items the feed has now:"),
		resultsAll: localize('addFeed.resultsAll', "The {0} items the feed has now:"),
		emailSection: localize('addFeed.emailSection', "From Email Alerts"),
		emailIntro: localize('addFeed.emailIntro', "Google Scholar, JSTOR, HeinOnline and other sources send alerts by email, not as feeds. Have them sent to an address used only for them, and Pollis turns each alert into a feed. The Email Alerts skill in {0} shows how to set the alerts up.", agentSkills),
		mailboxSet: localize('addFeed.mailboxSetTo', "Pollis reads the alerts mailbox {0}."),
		changeMailbox: localize('addFeed.changeMailbox', "Change Mailbox"),
		mailboxUser: localize('addFeed.mailboxUser', "Email Address"),
		mailboxServer: localize('addFeed.mailboxServer', "IMAP Server"),
		mailboxPassword: localize('addFeed.mailboxPassword', "Password"),
		mailboxHelp: localize('addFeed.mailboxHelp', "Best an address used only for the alerts, as Pollis makes a feed of every alert that arrives there. The server is guessed from the address; add :port when it is not 993. Gmail, iCloud and Yahoo need an app password, and IMAP turned on. The password is kept in the system's keychain, and the mailbox is only read."),
		connect: localize('addFeed.connect', "Connect"),
		cancel: localize('addFeed.cancel', "Cancel"),
		connecting: localize('addFeed.connecting', "Reading the mailbox..."),
		connectInvalid: localize('addFeed.connectInvalid', "Enter the email address, the server (such as imap.gmail.com) and the password."),
		connectFailed: localize('addFeed.connectFailed', "The mailbox could not be read: {0}. Check the address, the server and the password."),
		alertsHeading: localize('addFeed.alertsHeading', "Alerts in the Mailbox"),
		alertsHelp: localize('addFeed.alertsHelp', "Tick an alert to follow it, untick it to stop. Its items are listed under the Email Alerts topic."),
		readAgain: localize('addFeed.readAgain', "Read Again"),
		readingAlerts: localize('addFeed.readingAlerts', "Reading the alerts in the mailbox..."),
		alertsFailed: localize('addFeed.alertsFailed', "The alerts mailbox could not be read. Check the internet connection, or connect it again with Change Mailbox."),
		alertsEmpty: localize('addFeed.alertsEmpty', "No alert has arrived yet. Set up alerts at Google Scholar, JSTOR, HeinOnline and other sources to be sent to this address: the Email Alerts skill in {0} shows how.", agentSkills),
		yourSection: localize('addFeed.yourSection', "Your Feeds"),
		yourIntro: localize('addFeed.yourIntro', "The feeds you added, by topic. The catalogue's feeds are on the RSS Feeds page, where they are removed too."),
		noneAdded: localize('addFeed.noneAdded', "You have not added a feed yet."),
		remove: localize('addFeed.remove', "Remove"),
		removedSection: localize('addFeed.removedSection', "Removed Feeds"),
		restore: localize('addFeed.restore', "Restore"),
	};
	const examples = {
		pubmed: ['"Cox proportional hazards"[Title/Abstract]', '"machine learning"[MeSH Terms] AND sepsis', '"Lancet"[Journal] AND "randomized controlled trial"[Publication Type]'],
		arxiv: ['abs:"survival analysis" AND cat:stat.ME', 'cat:econ.EM', 'ti:"double machine learning"'],
	};
	const imapServers = IMAP_SERVERS.map(([pattern, server]) => [pattern.source, server]);
	const syntaxLinks = {
		pubmed: 'https://pubmed.ncbi.nlm.nih.gov/help/#search-tags',
		arxiv: 'https://info.arxiv.org/help/api/user-manual.html#query_details',
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		${voiceButtonsCss}
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 900px; margin: 0 auto; padding: 24px; }
		.header { display: flex; align-items: flex-end; gap: 16px; }
		.header h1 { flex: 1; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; line-height: 1.4; }
		button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; box-shadow: inset 0 0 0 1px var(--vscode-button-background); border-radius: 2px; padding: 4px 12px; cursor: pointer; white-space: nowrap; font-size: 11px; opacity: 0.7; }
		/* As the code buttons below a panel's Example Code: dimmed until pointed at, the blue one not */
		button.action:not(:disabled):hover, button.action.current, button.action.primary { opacity: 1; }
		button.action:hover, button.action.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.action.primary:hover { background: var(--vscode-button-hoverBackground); }
		button.action:disabled { opacity: 0.5; cursor: default; }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.link:hover { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
		details { border-top: 1px solid var(--vscode-widget-border); padding: 4px 0 12px; }
		.container > details[open] { border-top: 2px solid var(--vscode-focusBorder); margin-top: 8px; }
		summary { cursor: pointer; padding: 8px 0; font-size: 16px; font-weight: 600; list-style: none; display: flex; align-items: center; gap: 6px; }
		summary::-webkit-details-marker { display: none; }
		summary .chevron { display: inline-flex; transition: transform 0.1s; transform: rotate(-90deg); }
		details[open] > summary .chevron { transform: none; }
		.intro { color: var(--vscode-descriptionForeground); line-height: 1.45; margin: 0 0 10px 0; }
		.sources { display: inline-flex; gap: 2px; padding: 2px; border-radius: 4px; background: var(--vscode-sideBar-background); margin-bottom: 8px; }
		.sources button { font: inherit; color: var(--vscode-descriptionForeground); background: none; border: none; border-radius: 3px; padding: 3px 12px; cursor: pointer; }
		.sources button:hover { color: var(--vscode-foreground); }
		.sources button[aria-pressed="true"] { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		.row { display: flex; gap: 8px; align-items: center; }
		.field { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
		.field > span { font-size: 12px; color: var(--vscode-descriptionForeground); }
		input, select { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 4px 6px; min-width: 0; }
		input:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		.query { flex: 1; }
		.menuPath { color: #e8a33d; }
		body.vscode-light .menuPath { color: #a8650d; }
		details.note { border-top: none; padding: 0; margin-top: 10px; }
		details.note summary { font-size: 13px; font-weight: 400; padding: 2px 0; color: var(--vscode-textLink-foreground); }
		details.note ul { margin: 6px 0 0 0; padding-left: 20px; color: var(--vscode-descriptionForeground); line-height: 1.45; }
		details.note li { margin-bottom: 4px; }
		details.note b { color: var(--vscode-foreground); font-weight: 600; }
		details.note .help { margin: 6px 0 0 20px; }
		.help { font-size: 12px; color: var(--vscode-descriptionForeground); line-height: 1.45; margin: 6px 0 0 0; }
		.examples { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; margin-top: 8px; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.example { text-align: left; font-family: var(--vscode-editor-font-family); font-size: 12px; color: var(--vscode-textLink-foreground); background: var(--vscode-textCodeBlock-background); border: none; border-radius: 3px; padding: 1px 6px; cursor: pointer; }
		.example:hover { color: var(--vscode-textLink-activeForeground); }
		.status { margin: 10px 0 0 0; color: var(--vscode-descriptionForeground); }
		.status.error { color: var(--vscode-errorForeground); }
		.result { position: relative; margin-top: 10px; padding: 10px 36px 10px 12px; border-radius: 4px; background: var(--vscode-sideBar-background); }
		.result .preview { margin: 10px -36px 0 0; padding: 10px 36px 0 0; border-top: 1px solid var(--vscode-widget-border); }
		.close { position: absolute; top: 6px; right: 6px; display: inline-flex; padding: 3px; border: none; border-radius: 4px; background: none; color: var(--vscode-icon-foreground); cursor: pointer; }
		.close:hover { background: var(--vscode-toolbar-hoverBackground); }
		.alert { display: flex; gap: 6px; align-items: center; padding: 3px 0 3px 16px; cursor: pointer; }
		.result .found { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
		.result .found label { display: flex; gap: 6px; align-items: center; cursor: pointer; }
		.result .found .url { font-size: 11px; color: var(--vscode-descriptionForeground); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		.items { list-style: none; margin: 6px 0 10px 0; padding: 0; }
		.items li { padding: 5px 0; border-bottom: 1px solid var(--vscode-widget-border); line-height: 1.4; }
		.items li:last-child { border-bottom: none; }
		.items .meta { font-size: 11px; color: var(--vscode-descriptionForeground); }
		.addRow { display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap; }
		.addRow .field { min-width: 200px; }
		.done { color: var(--vscode-testing-iconPassed); }
		.feedRow { display: flex; align-items: center; gap: 8px; padding: 5px 0 5px 16px; border-bottom: 1px solid var(--vscode-widget-border); }
		.feedRow .feedName { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
		#removedFeeds h3, #removedFeeds .feedName { color: var(--vscode-errorForeground); }
		.topicName { font-weight: 600; padding: 8px 0 4px; }
		h3 { font-size: 13px; font-weight: 600; margin: 16px 0 4px; }
		.empty { color: var(--vscode-descriptionForeground); padding: 4px 0; }
	</style>
</head>
<body>
<div class="container">
	<div class="header">
		<h1>${text.title}</h1>
		<button class="link" id="showFeeds">${text.showFeeds}</button>
		${voiceButtonsHtml}
	</div>
	<p class="subtitle">${text.intro}</p>

	<details open id="addressSection">
		<summary><span class="chevron"></span>${text.addressSection}</summary>
		<p class="intro">${text.addressIntro}</p>
		<div class="row">
			<input class="query" id="address" spellcheck="false" placeholder="https://onlinelibrary.wiley.com/journal/14680262">
			<button class="action primary" id="find">${text.find}</button>
		</div>
		<div id="addressResult"></div>
		<details class="note">
			<summary><span class="chevron"></span>${text.servicesTitle}</summary>
			<p class="help">${text.servicesIntro}</p>
			<ul>
				<li>${text.servicesEbsco}</li>
				<li>${text.servicesProquest}</li>
				<li>${text.servicesGoogleAlerts}</li>
				<li>${text.servicesTopics}</li>
				<li>${text.servicesEmail}</li>
			</ul>
		</details>
	</details>

	<details open id="searchSection">
		<summary><span class="chevron"></span>${text.searchSection}</summary>
		<p class="intro">${text.searchIntro}</p>
		<div class="sources" role="group">
			<button id="sourcePubmed" aria-pressed="true">${text.pubmed}</button>
			<button id="sourceArxiv" aria-pressed="false">${text.arxiv}</button>
		</div>
		<div class="row">
			<input class="query" id="query" spellcheck="false">
			<button class="action primary" id="previewSearch">${text.preview}</button>
		</div>
		<p class="help"><span id="searchHelp"></span> <button class="link" id="syntaxLink"></button></p>
		<div class="examples" id="examples"></div>
		<div id="searchResult"></div>
	</details>

	<details id="emailSection">
		<summary><span class="chevron"></span>${text.emailSection}</summary>
		<p class="intro">${text.emailIntro}</p>
		<div class="row" id="mailboxSet" hidden>
			<span id="mailboxText" class="intro" style="margin: 0; flex: 1;"></span>
			<button class="link" id="changeMailbox">${text.changeMailbox}</button>
		</div>
		<div id="mailboxForm" hidden>
			<div class="addRow">
				<label class="field"><span>${text.mailboxUser}</span><input id="mailUser" spellcheck="false" placeholder="my.alerts@gmail.com"></label>
				<label class="field"><span>${text.mailboxServer}</span><input id="mailServer" spellcheck="false" placeholder="imap.gmail.com"></label>
				<label class="field"><span>${text.mailboxPassword}</span><input id="mailPassword" type="password"></label>
				<button class="action primary" id="connect">${text.connect}</button>
				<button class="action" id="cancelMailbox" hidden>${text.cancel}</button>
			</div>
			<p class="help">${text.mailboxHelp}</p>
			<div id="mailboxStatus"></div>
		</div>
		<div id="alertsPart" hidden>
			<h3>${text.alertsHeading} <button class="link" id="readAgain" style="font-weight: normal; margin-left: 8px;">${text.readAgain}</button></h3>
			<p class="help">${text.alertsHelp}</p>
			<div id="alertsList"></div>
		</div>
	</details>

	<details open id="yourSection">
		<summary><span class="chevron"></span>${text.yourSection}</summary>
		<p class="intro">${text.yourIntro}</p>
		<div id="addedFeeds"></div>
		<div id="removedFeeds"></div>
	</details>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	const TEXT = ${JSON.stringify(text)};
	const EXAMPLES = ${JSON.stringify(examples)};
	const SYNTAX_LINKS = ${JSON.stringify(syntaxLinks)};
	const IMAP_SERVERS = ${JSON.stringify(imapServers)}.map(([pattern, server]) => [new RegExp(pattern), server]);
	const CLOSE = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4.15 4.15a.5.5 0 0 1 .7 0L8 7.29l3.15-3.14a.5.5 0 0 1 .7.7L8.71 8l3.14 3.15a.5.5 0 0 1-.7.7L8 8.71l-3.15 3.14a.5.5 0 0 1-.7-.7L7.29 8 4.15 4.85a.5.5 0 0 1 0-.7Z"/></svg>';
	const CHEVRON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3.15 5.65a.5.5 0 0 1 .7 0L8 9.79l4.15-4.14a.5.5 0 0 1 .7.7l-4.5 4.5a.5.5 0 0 1-.7 0l-4.5-4.5a.5.5 0 0 1 0-.7Z"/></svg>';
	for (const chevron of document.querySelectorAll('.chevron')) {
		chevron.innerHTML = CHEVRON;
	}
	let state = { topics: [], added: [], removed: [], mailbox: undefined };
	// The answer to the latest request of each part, so that a slower earlier one is not shown over it
	let request = 0;
	let searchRequest = 0;
	let addressRequest = 0;
	let source = 'pubmed';
	// The query typed for each source, kept when switching between them
	const queries = { pubmed: '', arxiv: '' };

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}
	function onEnter(input, action) {
		input.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); action(); } });
	}

	// From a Search
	const queryElement = document.getElementById('query');
	const searchResult = document.getElementById('searchResult');
	function chooseSource(chosen) {
		queries[source] = queryElement.value;
		source = chosen;
		document.getElementById('sourcePubmed').setAttribute('aria-pressed', String(source === 'pubmed'));
		document.getElementById('sourceArxiv').setAttribute('aria-pressed', String(source === 'arxiv'));
		queryElement.value = queries[source];
		queryElement.placeholder = EXAMPLES[source][0];
		document.getElementById('searchHelp').textContent = source === 'pubmed' ? TEXT.pubmedHelp : TEXT.arxivHelp;
		document.getElementById('syntaxLink').textContent = source === 'pubmed' ? TEXT.pubmedSyntax : TEXT.arxivSyntax;
		const examples = document.getElementById('examples');
		examples.textContent = '';
		examples.appendChild(element('span', '', TEXT.examples));
		for (const example of EXAMPLES[source]) {
			const button = element('button', 'example', example);
			button.addEventListener('click', () => { queryElement.value = example; previewSearch(); });
			examples.appendChild(button);
		}
		searchResult.textContent = '';
	}
	document.getElementById('sourcePubmed').addEventListener('click', () => chooseSource('pubmed'));
	document.getElementById('sourceArxiv').addEventListener('click', () => chooseSource('arxiv'));
	document.getElementById('syntaxLink').addEventListener('click', () => vscode.postMessage({ command: 'openHelp', url: SYNTAX_LINKS[source] }));
	function previewSearch() {
		const query = queryElement.value.trim();
		if (!query) {
			queryElement.focus();
			return;
		}
		searchRequest = ++request;
		showStatus(searchResult, TEXT.previewing);
		vscode.postMessage({ command: 'previewSearch', request: searchRequest, source, query });
	}
	document.getElementById('previewSearch').addEventListener('click', previewSearch);
	onEnter(queryElement, previewSearch);

	// From an Address
	const addressElement = document.getElementById('address');
	const addressResult = document.getElementById('addressResult');
	function find() {
		const address = addressElement.value.trim();
		if (!address) {
			addressElement.focus();
			return;
		}
		if (!/^https:\\/\\/\\S+$/.test(address) && !/^@\\S+$/.test(address) && !/^UC[\\w-]{22}$/.test(address)) {
			showStatus(addressResult, TEXT.invalidAddress, true);
			return;
		}
		addressRequest = ++request;
		showStatus(addressResult, TEXT.finding);
		vscode.postMessage({ command: 'find', request: addressRequest, address });
	}
	document.getElementById('find').addEventListener('click', find);
	onEnter(addressElement, find);
	// The feeds found at the address: one is previewed at once; of several, the one chosen
	function showFound(feeds) {
		if (!feeds.length) {
			showStatus(addressResult, TEXT.notFound, true);
			return;
		}
		if (feeds.length === 1) {
			previewAddress(feeds[0]);
			return;
		}
		addressResult.textContent = '';
		const box = element('div', 'result');
		box.appendChild(closeButton(() => { addressResult.textContent = ''; }));
		box.appendChild(element('div', 'intro', TEXT.severalFound));
		const list = element('div', 'found');
		feeds.forEach((feed, index) => {
			const label = element('label');
			const radio = element('input');
			radio.type = 'radio';
			radio.name = 'foundFeed';
			radio.addEventListener('change', () => previewAddress(feed, box));
			const text = element('div');
			text.appendChild(element('div', '', feed.name || feed.url));
			if (feed.name) { text.appendChild(element('div', 'url', feed.url)); }
			label.append(radio, text);
			list.appendChild(label);
		});
		box.appendChild(list);
		addressResult.appendChild(box);
	}
	// The preview of a feed found: under the list of those found, when there are several
	let foundBox;
	function previewAddress(feed, box) {
		foundBox = box;
		addressRequest = ++request;
		vscode.postMessage({ command: 'previewAddress', request: addressRequest, url: feed.url, name: feed.name });
	}

	// The X at the top right of a result, which closes it
	function closeButton(close) {
		const button = element('button', 'close');
		button.innerHTML = CLOSE;
		button.title = TEXT.close;
		button.setAttribute('aria-label', TEXT.close);
		button.addEventListener('click', close);
		return button;
	}

	function showStatus(container, message, error) {
		container.textContent = '';
		container.appendChild(element('p', 'status' + (error ? ' error' : ''), message));
	}

	// A preview: the newest items, then the name and topic of the feed to add
	function showPreview(container, preview, keep) {
		// Under the feeds found, the preview is part of their box, which closes both
		const box = element('div', keep ? 'preview' : 'result preview');
		if (!keep) {
			box.appendChild(closeButton(() => { container.textContent = ''; }));
		}
		if (preview.error) {
			box.appendChild(element('p', 'status error', TEXT.readError));
		} else if (!preview.count) {
			box.appendChild(element('p', 'status', TEXT.noResults));
		} else {
			box.appendChild(element('div', 'intro', preview.count > preview.items.length
				? TEXT.resultsCount.replace('{0}', String(preview.items.length)).replace('{1}', String(preview.count))
				: TEXT.resultsAll.replace('{0}', String(preview.count))));
			const list = element('ul', 'items');
			for (const item of preview.items) {
				const li = element('li');
				const title = element('button', 'link', item.title);
				title.style.textAlign = 'left';
				title.addEventListener('click', () => vscode.postMessage({ command: 'openLink', url: item.link }));
				li.appendChild(title);
				const meta = [item.source, item.age].filter(part => part).join(', ');
				if (meta) { li.appendChild(element('div', 'meta', meta)); }
				list.appendChild(li);
			}
			box.appendChild(list);
		}
		if (preview.followed) {
			box.appendChild(element('p', 'status done', TEXT.alreadyFollowed));
		} else if (!preview.error) {
			box.appendChild(addRow(preview));
		}
		if (keep) {
			keep.querySelector('.preview')?.remove();
			keep.appendChild(box);
		} else {
			container.textContent = '';
			container.appendChild(box);
		}
	}

	// The name and topic of the feed, and Add Feed
	function addRow(preview) {
		const row = element('div', 'addRow');
		const nameField = element('label', 'field');
		nameField.appendChild(element('span', '', TEXT.name));
		const name = element('input');
		name.value = preview.name;
		nameField.appendChild(name);
		const topicField = element('label', 'field');
		topicField.appendChild(element('span', '', TEXT.topic));
		const topic = element('select');
		for (const value of state.topics) {
			const option = element('option', '', value);
			option.value = value;
			topic.appendChild(option);
		}
		const newOption = element('option', '', TEXT.newTopic);
		newOption.value = '';
		topic.appendChild(newOption);
		topic.value = preview.topic;
		const newTopic = element('input');
		newTopic.placeholder = TEXT.newTopicPlaceholder;
		newTopic.hidden = true;
		topic.addEventListener('change', () => { newTopic.hidden = topic.value !== ''; if (!newTopic.hidden) { newTopic.focus(); } });
		topicField.append(topic, newTopic);
		const add = element('button', 'action primary', TEXT.add);
		add.addEventListener('click', () => {
			const chosenTopic = topic.value || newTopic.value.trim();
			if (!chosenTopic) {
				newTopic.focus();
				return;
			}
			add.disabled = true;
			vscode.postMessage({ command: 'add', url: preview.url, name: name.value, topic: chosenTopic });
		});
		add.dataset.url = preview.url;
		row.append(nameField, topicField, add);
		return row;
	}

	// From Email Alerts: the mailbox, or the form to connect it; then its alerts, read when the section is opened
	const mailUser = document.getElementById('mailUser');
	const mailServer = document.getElementById('mailServer');
	const mailPassword = document.getElementById('mailPassword');
	const mailboxStatus = document.getElementById('mailboxStatus');
	let editingMailbox = false;
	let alertsRead = false;
	// The server is guessed from the address until it is typed
	let serverTyped = false;
	mailServer.addEventListener('input', () => { serverTyped = !!mailServer.value; });
	mailUser.addEventListener('input', () => {
		if (!serverTyped) {
			const domain = (mailUser.value.trim().split('@')[1] || '').toLowerCase();
			mailServer.value = (IMAP_SERVERS.find(([pattern]) => pattern.test(domain)) || [])[1] || (domain ? 'imap.' + domain : '');
		}
	});
	function renderMailbox() {
		const mailbox = state.mailbox;
		const showForm = !mailbox || editingMailbox;
		document.getElementById('mailboxSet').hidden = showForm;
		document.getElementById('mailboxForm').hidden = !showForm;
		document.getElementById('cancelMailbox').hidden = !mailbox;
		document.getElementById('alertsPart').hidden = showForm;
		if (mailbox) {
			document.getElementById('mailboxText').textContent = TEXT.mailboxSet.replace('{0}', mailbox.user);
		}
		if (!showForm && !alertsRead && document.getElementById('emailSection').open) {
			readAlerts();
		}
	}
	function editMailbox(editing) {
		editingMailbox = editing;
		mailboxStatus.textContent = '';
		mailPassword.value = '';
		if (editing && state.mailbox) {
			mailUser.value = state.mailbox.user;
			mailServer.value = state.mailbox.server + (state.mailbox.port === 993 ? '' : ':' + state.mailbox.port);
			serverTyped = true;
		}
		renderMailbox();
		if (editing) { mailUser.focus(); }
	}
	function connect() {
		const user = mailUser.value.trim();
		const server = mailServer.value.trim();
		if (!/^\S+@\S+$/.test(user) || !/^[\w.-]+(?::\d+)?$/.test(server) || !mailPassword.value) {
			showStatus(mailboxStatus, TEXT.connectInvalid, true);
			return;
		}
		document.getElementById('connect').disabled = true;
		showStatus(mailboxStatus, TEXT.connecting);
		vscode.postMessage({ command: 'connect', user, server, password: mailPassword.value });
	}
	function readAlerts() {
		alertsRead = true;
		showStatus(document.getElementById('alertsList'), TEXT.readingAlerts);
		vscode.postMessage({ command: 'listAlerts' });
	}
	// The alerts by source, ticked when followed
	function showAlerts(message) {
		const list = document.getElementById('alertsList');
		if (message.error || !message.alerts.length) {
			showStatus(list, message.error ? TEXT.alertsFailed : TEXT.alertsEmpty, message.error);
			// The empty message carries a menu path in yellow
			if (!message.error) {
				list.firstChild.innerHTML = TEXT.alertsEmpty;
			}
			return;
		}
		list.textContent = '';
		let source;
		for (const alert of message.alerts) {
			if (alert.source !== source) {
				source = alert.source;
				list.appendChild(element('div', 'topicName', source));
			}
			const label = element('label', 'alert');
			const box = element('input');
			box.type = 'checkbox';
			box.checked = alert.followed;
			box.addEventListener('change', () => vscode.postMessage({ command: 'follow', url: alert.url, name: alert.source + ': ' + alert.name, follow: box.checked }));
			label.append(box, element('span', '', alert.name));
			list.appendChild(label);
		}
	}
	document.getElementById('connect').addEventListener('click', connect);
	onEnter(mailPassword, connect);
	document.getElementById('changeMailbox').addEventListener('click', () => editMailbox(true));
	document.getElementById('cancelMailbox').addEventListener('click', () => editMailbox(false));
	document.getElementById('readAgain').addEventListener('click', readAlerts);
	document.getElementById('emailSection').addEventListener('toggle', () => renderMailbox());
	document.getElementById('showFeeds').addEventListener('click', () => vscode.postMessage({ command: 'showFeeds' }));

	// Your Feeds, by topic, and those removed
	function renderFeeds() {
		renderMailbox();
		const added = document.getElementById('addedFeeds');
		added.textContent = '';
		if (!state.added.length) {
			added.appendChild(element('div', 'empty', TEXT.noneAdded));
		}
		const topics = [...new Set(state.added.map(feed => feed.topic))].sort((a, b) => a.localeCompare(b));
		for (const topic of topics) {
			added.appendChild(element('div', 'topicName', topic));
			for (const feed of state.added.filter(feed => feed.topic === topic)) {
				added.appendChild(feedRow(feed, TEXT.remove, 'remove'));
			}
		}
		const removed = document.getElementById('removedFeeds');
		removed.textContent = '';
		if (state.removed.length) {
			removed.appendChild(element('h3', '', TEXT.removedSection));
			for (const feed of state.removed) {
				removed.appendChild(feedRow(feed, TEXT.restore, 'restore'));
			}
		}
	}
	function feedRow(feed, label, command) {
		const row = element('div', 'feedRow');
		const name = element('span', 'feedName', feed.title);
		name.title = feed.url;
		const button = element('button', 'link', label);
		button.addEventListener('click', () => vscode.postMessage({ command, url: feed.url }));
		row.append(name, button);
		if (command === 'restore' && feed.topic) {
			row.insertBefore(element('span', 'meta', feed.topic), button);
		}
		return row;
	}

	window.addEventListener('message', event => {
		const message = event.data;
		switch (message.command) {
			case 'state':
				state = message;
				renderFeeds();
				break;
			case 'preview':
				if (message.request === searchRequest) {
					showPreview(searchResult, message);
				} else if (message.request === addressRequest) {
					showPreview(addressResult, message, foundBox);
				}
				break;
			case 'connected':
				document.getElementById('connect').disabled = false;
				if (message.error) {
					showStatus(mailboxStatus, TEXT.connectFailed.replace('{0}', message.error), true);
				} else {
					mailPassword.value = '';
					editingMailbox = false;
					alertsRead = false;
				}
				break;
			case 'alerts':
				showAlerts(message);
				break;
			case 'found':
				if (message.request === addressRequest) {
					foundBox = undefined;
					showFound(message.feeds);
				}
				break;
			case 'added':
				for (const button of document.querySelectorAll('.addRow button')) {
					if (button.dataset.url === message.url) {
						button.closest('.addRow').replaceWith(element('p', 'status done', TEXT.added));
					}
				}
				break;
		}
	});
	chooseSource('pubmed');
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: ADD_FEED_COMMAND_ID,
			title: localize2('rss.addFeedAction', "Add Feed..."),
			category: localize2('rss.category', "Explore"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openAddFeedPage(accessor);
	}
});
