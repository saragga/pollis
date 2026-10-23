/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Codicon } from '../../../../base/common/codicons.js';
import { fromNow } from '../../../../base/common/date.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { AlertCondition, AlertSeverity, ChartRange, describeCondition, describeFiredAlert, describeItems, describeSubject, formatValue, FORM_8K_ITEMS, IAlert, IAlertsService, IFiredAlert, isStatistical } from './alertsService.js';
import { ECONOMIC_SOURCES, EconomicSource, seriesExample, seriesPage, SERIES_PAGES, sourceName } from './economicSeries.js';
import { IEventStudiesService, SHOW_EVENT_STUDIES_COMMAND_ID } from './eventStudiesService.js';
import { OPEN_LINK_COMMAND_ID } from './openLink.js';
import { voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';

// Explore > Alerts > Add Alert...: a page with a form to add an alert (the symbol, looked up at Yahoo Finance, the
// condition, the value, how it shows and how often it fires), or an alert on SEC filings (the company, looked up at
// the SEC's EDGAR with its recent filings, and the forms), or an alert on an economic series (the series, looked up at
// FRED, the ECB, the IMF or the World Bank with its latest values, and the condition on its new value).
// Explore > Alerts > Alerts: a page with the alerts and their latest values, to pause, resume or remove, and the
// alerts that fired, newest first.
// A quote page: the latest value of a symbol, its day and year ranges, its chart with the user's alerts on it drawn
// across, and Add Alert; Pollis's own page, without the advertisements of Yahoo Finance's. On the Alerts page, a click
// on an alert's symbol opens the same quote and chart in a panel under it, one at a time.

export const ADD_ALERT_COMMAND_ID = 'pollis.alerts.add';
export const SHOW_ALERTS_COMMAND_ID = 'pollis.alerts.show';
export const SHOW_FIRED_ALERTS_COMMAND_ID = 'pollis.alerts.showFired';
export const SHOW_QUOTE_COMMAND_ID = 'pollis.alerts.showQuote';

/** Opens the quote page of `symbol`. */
export async function openQuotePage(commandService: ICommandService, symbol: string): Promise<void> {
	await commandService.executeCommand(SHOW_QUOTE_COMMAND_ID, symbol);
}

/** When an alert fired, to the second, and the move that fired it: "21 Oct, 14:32:46: 339.98 \u2192 340.13 USD, 2 hr ago". */
function describeFiredMove(fired: IFiredAlert): string {
	const time = new Date(fired.time).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
	if (fired.filing) {
		return localize('alerts.firedFiling', "{0}: {1}, {2}", time, describeItems(fired.filing.items) || fired.filing.description || fired.filing.form, fromNow(fired.time, true));
	}
	const value = formatValue(fired.value, fired.currency);
	return fired.previousValue !== undefined
		? localize('alerts.firedMove', "{0}: {1} \u2192 {2}, {3}", time, formatValue(fired.previousValue), value, fromNow(fired.time, true))
		: localize('alerts.firedAt', "{0}: {1}, {2}", time, value, fromNow(fired.time, true));
}

/** The codicon of a severity. */
export function severityIcon(severity: AlertSeverity): ThemeIcon {
	return severity === 'error' ? Codicon.error : severity === 'warning' ? Codicon.warning : Codicon.info;
}

/** Who an alert on filings is on: one company, several, or every company of an industry. */
type FilingsScope = 'company' | 'companies' | 'industry' | 'everyone';

type AlertsMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'lookUp'; readonly symbol: string }
	| { readonly command: 'chart'; readonly symbol: string; readonly range: ChartRange }
	| { readonly command: 'add'; readonly symbol: string; readonly condition: AlertCondition; readonly threshold: number; readonly halfLife?: number; readonly severity: AlertSeverity; readonly repeat: boolean }
	| { readonly command: 'backtest'; readonly key: string; readonly symbol: string; readonly source?: EconomicSource; readonly condition: AlertCondition; readonly threshold: number; readonly halfLife?: number }
	| { readonly command: 'openNotebook'; readonly symbol: string; readonly name?: string; readonly source?: EconomicSource; readonly condition: AlertCondition; readonly threshold: number; readonly halfLife?: number }
	| { readonly command: 'lookUpFiler'; readonly company: string }
	| { readonly command: 'lookUpCompanies'; readonly companies: string }
	| { readonly command: 'lookUpIndustry'; readonly sic: string }
	| { readonly command: 'searchFilings'; readonly scope: FilingsScope; readonly company: string; readonly phrase: string; readonly forms: readonly string[]; readonly items: readonly string[] }
	| { readonly command: 'addFilings'; readonly scope: FilingsScope; readonly company: string; readonly phrase: string; readonly forms: readonly string[]; readonly items: readonly string[]; readonly severity: AlertSeverity; readonly repeat: boolean; readonly eventStudy: boolean }
	| { readonly command: 'lookUpSeries'; readonly source: EconomicSource; readonly id: string }
	| { readonly command: 'addSeries'; readonly source: EconomicSource; readonly id: string; readonly condition: AlertCondition; readonly threshold: number; readonly halfLife?: number; readonly severity: AlertSeverity; readonly repeat: boolean }
	| { readonly command: 'setFredKey' }
	| { readonly command: 'setContact' }
	| { readonly command: 'openUrl'; readonly url: string }
	| { readonly command: 'pause'; readonly id: string; readonly paused: boolean }
	| { readonly command: 'remove'; readonly id: string }
	| { readonly command: 'setEventStudy'; readonly id: string; readonly eventStudy: boolean }
	| { readonly command: 'eventStudy'; readonly alertId: string; readonly folder?: string }
	| { readonly command: 'markRead'; readonly ids: readonly string[] }
	| { readonly command: 'dismiss'; readonly id: string }
	| { readonly command: 'clearFired' }
	| { readonly command: 'openFile' }
	| { readonly command: 'showAlerts' }
	| { readonly command: 'addFor'; readonly symbol: string }
	| { readonly command: 'openYahoo'; readonly symbol: string };

/** The three pages: Add Alert, with the form; Alerts, with the alerts and those that fired; and the quote of a symbol. */
type PageKind = 'add' | 'alerts' | 'quote';

/**
 * Where a page opens: the form, on quotes, on filings or on an economic series of a source, with a symbol (or company,
 * or series) filled in or not; the top of the alerts; the fired alerts; or the quote of a symbol, or of none yet.
 */
type PagePlace = { readonly section: 'add'; readonly symbol?: string; readonly filings?: boolean; readonly economic?: EconomicSource } | { readonly section: 'fired' } | { readonly section: 'alerts'; readonly alertId?: string } | { readonly section: 'quote'; readonly symbol?: string };

const openPages = new Map<PageKind, { readonly input: WebviewInput; readonly show: (place: PagePlace) => void }>();

/** Opens the page of `place`, or shows it again there when it is open. */
function openAlertsPage(accessor: ServicesAccessor, place: PagePlace): void {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const alertsService = accessor.get(IAlertsService);
	const eventStudiesService = accessor.get(IEventStudiesService);
	const editorService = accessor.get(IEditorService);
	const commandService = accessor.get(ICommandService);
	const quickInputService = accessor.get(IQuickInputService);
	const dialogService = accessor.get(IDialogService);

	const kind: PageKind = place.section === 'add' ? 'add' : place.section === 'quote' ? 'quote' : 'alerts';
	const openPage = openPages.get(kind);
	if (openPage && !openPage.input.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage.input, openPage.input.group ?? -1, false);
		openPage.show(place);
		return;
	}
	const title = kind === 'add' ? localize('alerts.addTitle', "Add Alert") : kind === 'quote' ? localize('alerts.quoteTitle', "Quote") : localize('alerts.title', "Alerts");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		kind === 'add' ? 'pollis.addAlert' : kind === 'quote' ? 'pollis.quote' : 'pollis.alerts',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml(kind));

	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPages.delete(kind);
		disposables.dispose();
	}));

	// Where to go once the page is ready, and then whenever the page is asked for again
	let pending: PagePlace | undefined = place;
	let ready = false;
	const show = (place: PagePlace) => {
		if (ready) {
			webviewInput.webview.postMessage({ command: 'show', ...place });
		} else {
			pending = place;
		}
	};
	openPages.set(kind, { input: webviewInput, show });

	const sendState = () => {
		webviewInput.webview.postMessage({
			command: 'state',
			alerts: alertsService.getAlerts().map(alert => {
				const state = alertsService.getState(alert.id);
				if (alert.condition === 'newFiling') {
					// Several companies or an industry: the newest filing that fired, from whom, or none yet
					const several = !!alert.ciks?.length || !!alert.sic || !!alert.everyone || !!alert.phrase;
					const looked = fromNow(state?.checked ?? Date.now(), true);
					return {
						id: alert.id,
						symbol: alert.symbol,
						name: describeSubject(alert),
						condition: describeCondition(alert),
						severity: alert.severity,
						repeat: alert.repeat,
						paused: !!alert.paused,
						filings: true,
						eventStudy: !!alert.eventStudy,
						url: alert.sic
							? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&SIC=${encodeURIComponent(alert.sic)}&owner=include&count=100`
							: alert.ciks?.length || alert.everyone ? undefined : `https://www.sec.gov/edgar/browse/?CIK=${encodeURIComponent(alert.symbol)}`,
						value: state?.error
							? state.noContact ? localize('alerts.needsContact', "Needs your SEC contact: set it on the Add Alert page, under SEC Filings") : localize('alerts.notFound', "Could not be looked up")
							: several && state?.filing?.name ? localize('alerts.latestFilingFrom', "Latest filing: {0} from {1}, filed {2}; looked at {3}", state.filing.form, state.filing.name, state.filing.filed, looked)
								: several && state?.since ? localize('alerts.noFilingYet', "No filing yet; looked at {0}", looked)
									: state?.filing ? localize('alerts.latestFiling', "Latest filing: {0}, filed {1}; looked at {2}", state.filing.form, state.filing.filed, looked) : localize('alerts.notYet', "Not looked up yet"),
					};
				}
				if (alert.source) {
					// The latest value and its period, or what keeps it from being looked up
					return {
						id: alert.id,
						symbol: alert.symbol,
						name: alert.name || alert.symbol,
						condition: describeCondition(alert),
						severity: alert.severity,
						repeat: alert.repeat,
						paused: !!alert.paused,
						economic: sourceName(alert.source),
						url: seriesPage(alert.source, alert.symbol),
						value: state?.installing ? localize('alerts.installingStatistics', "Julia is installing OnlineStats.jl, which computes the condition") : state?.error
							? state.noKey ? localize('alerts.needsFredKey', "Needs your FRED key: set it on the Add Alert page, under Economic Data") : state.noJulia ? localize('alerts.needsJulia', "Needs Julia, which computes the condition with OnlineStats.jl") : localize('alerts.notFound', "Could not be looked up")
							: state?.value !== undefined && state.period !== undefined ? localize('alerts.seriesValue', "{0} for {1}; looked at {2}", formatValue(state.value), state.period, fromNow(state.checked ?? Date.now(), true)) : localize('alerts.notYet', "Not looked up yet"),
					};
				}
				return {
					id: alert.id,
					symbol: alert.symbol,
					name: alert.name || alert.symbol,
					condition: describeCondition(alert),
					conditionKind: alert.condition,
					threshold: alert.threshold,
					severity: alert.severity,
					repeat: alert.repeat,
					paused: !!alert.paused,
					value: state?.installing ? localize('alerts.installingStatistics', "Julia is installing OnlineStats.jl, which computes the condition") : state?.error ? state.noJulia ? localize('alerts.needsJulia', "Needs Julia, which computes the condition with OnlineStats.jl") : localize('alerts.notFound', "Could not be looked up") : state?.value !== undefined ? localize('alerts.valueAt', "{0}, {1}", formatValue(state.value, state.currency), fromNow(state.quoted ?? state.checked ?? Date.now(), true)) : localize('alerts.notYet', "Not looked up yet"),
				};
			}),
			fired: alertsService.getFired().slice(0, 100).map(fired => ({
				id: fired.id,
				symbol: fired.symbol,
				text: describeFiredAlert(fired),
				alertId: fired.alertId,
				conditionKind: fired.condition,
				threshold: fired.threshold,
				value: fired.value,
				time: fired.time,
				when: describeFiredMove(fired),
				severity: fired.severity,
				unread: !alertsService.isRead(fired.id),
				filingUrl: fired.filing?.url,
				// An economic series: its source, and its page there
				economic: fired.source && sourceName(fired.source),
				seriesUrl: fired.source && seriesPage(fired.source, fired.symbol),
				// A filing's alert: the study of its filings, or one to start while the alert is there
				study: fired.filing && studyOf(fired.alertId),
				canStudy: !!fired.filing && alertsService.getAlerts().some(alert => alert.id === fired.alertId),
			})),
		});
	};
	const studyOf = (alertId: string) => eventStudiesService.getStudies().find(study => study.alert === alertId)?.folder;
	disposables.add(alertsService.onDidChange(() => sendState()));
	disposables.add(eventStudiesService.onDidChange(() => sendState()));

	disposables.add(webviewInput.webview.onMessage(async (e: { message: AlertsMessage }) => {
		const message = e.message;
		switch (message.command) {
			case 'ready': {
				ready = true;
				sendState();
				if (pending) {
					show(pending);
					pending = undefined;
				}
				break;
			}
			case 'lookUp': {
				const quote = await alertsService.getQuote(message.symbol);
				webviewInput.webview.postMessage({
					command: 'quote',
					symbol: message.symbol,
					quote: quote && {
						symbol: quote.symbol,
						name: quote.name || quote.symbol,
						value: quote.value,
						currency: quote.currency,
						previousClose: quote.previousClose,
						time: quote.time,
						dayHigh: quote.dayHigh,
						dayLow: quote.dayLow,
						yearHigh: quote.yearHigh,
						yearLow: quote.yearLow,
						volume: quote.volume,
						exchange: quote.exchange,
					},
				});
				if (kind === 'quote' && quote) {
					webviewInput.setWebviewTitle(quote.symbol);
				}
				break;
			}
			case 'backtest': {
				const result = await alertsService.backtest({ symbol: message.symbol, source: message.source, condition: message.condition, threshold: message.threshold, halfLife: message.halfLife });
				webviewInput.webview.postMessage({ command: 'backtest', key: message.key, result: typeof result === 'object' ? result : undefined, problem: typeof result === 'string' ? result : undefined });
				break;
			}
			case 'openNotebook': {
				const notebook = await alertsService.writeNotebook({ symbol: message.symbol, name: message.name, source: message.source, condition: message.condition, threshold: message.threshold, halfLife: message.halfLife });
				if (typeof notebook === 'object') {
					await editorService.openEditor({ resource: notebook });
				}
				break;
			}
			case 'chart': {
				const chart = await alertsService.getChart(message.symbol, message.range);
				webviewInput.webview.postMessage({ command: 'chart', symbol: message.symbol, range: message.range, chart });
				break;
			}
			case 'add': {
				const quote = await alertsService.getQuote(message.symbol);
				if (!quote || !Number.isFinite(message.threshold)) {
					break;
				}
				await alertsService.addAlert({ symbol: quote.symbol, name: quote.name, condition: message.condition, threshold: message.threshold, halfLife: message.halfLife, severity: message.severity, repeat: message.repeat });
				webviewInput.webview.postMessage({ command: 'added', text: localize('alerts.added', "Pollis will alert you when {0} {1}. It looks the value up every minute while Pollis is open; the quotes are delayed by up to about 20 minutes, depending on the exchange.", quote.name || quote.symbol, describeCondition(message)) });
				break;
			}
			case 'lookUpFiler': {
				const contact = await alertsService.getSecContact();
				const filer = contact ? await alertsService.getFiler(message.company) : undefined;
				webviewInput.webview.postMessage({
					command: 'filer',
					company: message.company,
					noContact: !contact,
					filer: filer && { cik: filer.cik, name: filer.name, tickers: filer.tickers, filings: filer.filings.slice(0, 12) },
				});
				break;
			}
			case 'lookUpCompanies': {
				const contact = await alertsService.getSecContact();
				const companies = contact ? await alertsService.getCompanies(message.companies.split(',')) : undefined;
				webviewInput.webview.postMessage({ command: 'companies', companies: message.companies, noContact: !contact, found: companies?.found, unknown: companies?.unknown });
				break;
			}
			case 'lookUpIndustry': {
				const contact = await alertsService.getSecContact();
				const industry = contact ? await alertsService.getIndustry(message.sic) : undefined;
				webviewInput.webview.postMessage({ command: 'industry', sic: message.sic, noContact: !contact, industry: industry && { sic: industry.sic, name: industry.name, count: industry.ciks.length } });
				break;
			}
			case 'searchFilings': {
				const contact = await alertsService.getSecContact();
				const phrase = message.phrase.trim();
				const result = contact && phrase ? await alertsService.searchFilings({ ...filingsWho(message.scope, message.company), phrase, forms: cleanForms(message.forms), items: cleanItems(message.items) }, SEARCH_PREVIEW_DAYS) : undefined;
				webviewInput.webview.postMessage({
					command: 'searched',
					phrase: message.phrase,
					noContact: !contact,
					count: result?.filings.length,
					more: result?.more,
					filings: result?.filings.slice(-50).reverse(),
				});
				break;
			}
			case 'addFilings': {
				const forms = cleanForms(message.forms);
				const items = cleanItems(message.items);
				const phrase = message.phrase.trim() || undefined;
				const condition = describeCondition({ condition: 'newFiling', threshold: 0, forms, items, phrase });
				const alert = { condition: 'newFiling' as const, threshold: 0, forms: forms.length ? forms : undefined, items: items.length ? items : undefined, phrase, eventStudy: message.eventStudy || undefined, severity: message.severity, repeat: message.repeat };
				// With a phrase, EDGAR's full-text search, which goes back as far as needed; without, on several companies or an industry, its latest filings
				const howOften = phrase
					? localize('alerts.addedSearch', "It searches the full text of EDGAR's filings every 15 minutes while Pollis is open.")
					: localize('alerts.addedFeed', "It looks at EDGAR's latest filings every 15 minutes while Pollis is open, which go back about a day.");
				if (message.scope === 'everyone') {
					if (!phrase) {
						break;
					}
					await alertsService.addAlert({ ...alert, symbol: 'EDGAR', name: '', everyone: true });
					webviewInput.webview.postMessage({ command: 'added', text: localize('alerts.addedFilingsEveryone', "Pollis will alert you when any company {0}. {1}", condition, howOften) });
					break;
				}
				if (message.scope === 'companies') {
					const found = (await alertsService.getCompanies(message.company.split(',')))?.found;
					if (!found?.length) {
						break;
					}
					const names = found.map(company => company.name).join(', ');
					await alertsService.addAlert({ ...alert, symbol: found.map(company => company.cik).join(','), name: names, ciks: found.map(company => company.cik) });
					webviewInput.webview.postMessage({ command: 'added', text: localize('alerts.addedFilingsCompanies', "Pollis will alert you when one of {0} {1}. {2}", names, condition, howOften) });
					break;
				}
				if (message.scope === 'industry') {
					const industry = await alertsService.getIndustry(message.company);
					if (!industry) {
						break;
					}
					await alertsService.addAlert({ ...alert, symbol: `SIC ${industry.sic}`, name: industry.name, sic: industry.sic });
					webviewInput.webview.postMessage({ command: 'added', text: localize('alerts.addedFilingsIndustry', "Pollis will alert you when a company in {0} (SIC {1}) {2}. {3}", industry.name, industry.sic, condition, howOften) });
					break;
				}
				const filer = await alertsService.getFiler(message.company);
				if (!filer) {
					break;
				}
				await alertsService.addAlert({ ...alert, symbol: filer.cik, name: filer.name });
				webviewInput.webview.postMessage({ command: 'added', text: localize('alerts.addedFilings', "Pollis will alert you when {0} {1}. {2}", filer.name, condition, phrase ? howOften : localize('alerts.addedCompany', "It looks at the SEC's EDGAR every 15 minutes while Pollis is open.")) });
				break;
			}
			case 'lookUpSeries': {
				const series = ECONOMIC_SOURCES.includes(message.source) ? await alertsService.getSeries(message.source, message.id, SERIES_PREVIEW_COUNT) : undefined;
				webviewInput.webview.postMessage({ command: 'series', source: message.source, id: message.id, noKey: series === 'noKey', series: typeof series === 'object' ? series : undefined });
				break;
			}
			case 'addSeries': {
				const series = ECONOMIC_SOURCES.includes(message.source) ? await alertsService.getSeries(message.source, message.id, 1) : undefined;
				const threshold = message.condition === 'newValue' ? 0 : message.threshold;
				if (typeof series !== 'object' || !Number.isFinite(threshold)) {
					break;
				}
				await alertsService.addAlert({ symbol: series.id, source: message.source, name: series.title, condition: message.condition, threshold, halfLife: message.halfLife, severity: message.severity, repeat: message.repeat });
				webviewInput.webview.postMessage({ command: 'added', text: localize('alerts.addedSeries', "Pollis will alert you when {0} {1}. It looks the series up at {2} every hour while Pollis is open.", series.title, message.condition === 'newValue' || isStatistical(message.condition) ? describeCondition(message) : localize('alerts.addedSeriesCondition', "has a new value {0}", describeCondition({ condition: message.condition, threshold })), sourceName(message.source)) });
				break;
			}
			case 'setFredKey': {
				const key = await quickInputService.input({
					prompt: localize('alerts.fredKeyPrompt', "Your FRED API key, free from the St. Louis Fed. It is kept in your keychain; the FRED panel uses it too."),
					password: true,
					ignoreFocusLost: true,
				});
				if (key?.trim()) {
					await alertsService.setFredKey(key.trim());
					webviewInput.webview.postMessage({ command: 'contactSet' });
				}
				break;
			}
			case 'setContact': {
				const contact = await quickInputService.input({
					prompt: localize('alerts.contactPrompt', "SEC contact: your name and email (e.g. Jane Doe jane@example.com). The SEC asks for it with every request; the EDGAR panel uses it too."),
					placeHolder: 'Jane Doe jane@example.com',
					value: await alertsService.getSecContact(),
					ignoreFocusLost: true,
					validateInput: async value => value.includes('@') ? undefined : localize('alerts.contactInvalid', "Your name and an email address"),
				});
				if (contact?.trim()) {
					await alertsService.setSecContact(contact.trim());
					webviewInput.webview.postMessage({ command: 'contactSet' });
				}
				break;
			}
			case 'openUrl':
				// Only the SEC's pages, the filings and the filers at EDGAR, and the pages of the economic series
				if (message.url.startsWith('https://www.sec.gov/') || SERIES_PAGES.some(page => message.url.startsWith(page))) {
					await commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
				}
				break;
			case 'pause':
				alertsService.setPaused(message.id, message.paused);
				break;
			case 'setEventStudy':
				alertsService.setEventStudy(message.id, message.eventStudy);
				break;
			case 'eventStudy': {
				// Its study, or the Event Studies page with the alert chosen for a new one
				const folder = studyOf(message.alertId);
				await commandService.executeCommand(SHOW_EVENT_STUDIES_COMMAND_ID, folder, folder ? undefined : message.alertId);
				break;
			}
			case 'remove': {
				// Its fired alerts go with it, or stay in Fired Alerts
				const alert = alertsService.getAlerts().find(alert => alert.id === message.id);
				const fired = alertsService.getFired().filter(fired => fired.alertId === message.id).map(fired => fired.id);
				if (!alert) {
					break;
				}
				if (!fired.length) {
					await alertsService.removeAlert(alert.id);
					break;
				}
				const { result } = await dialogService.prompt<'withFired' | 'alertOnly' | undefined>({
					type: 'warning',
					message: localize('alerts.removeMessage', "Remove the alert on {0}?", describeSubject(alert)),
					detail: localize('alerts.removeDetail', "It has fired {0} times. Its fired alerts can go with it or stay in Fired Alerts.", fired.length),
					buttons: [
						{ label: localize({ key: 'alerts.removeWithFired', comment: ['&& denotes a mnemonic'] }, "Remove Alert &&and Fired Alerts"), run: () => 'withFired' },
						{ label: localize({ key: 'alerts.removeAlertOnly', comment: ['&& denotes a mnemonic'] }, "Remove Alert &&Only"), run: () => 'alertOnly' },
					],
					cancelButton: { run: () => undefined },
				});
				if (result) {
					await alertsService.removeAlert(alert.id);
					if (result === 'withFired') {
						await alertsService.removeFired(fired);
					}
				}
				break;
			}
			case 'markRead':
				alertsService.markRead(message.ids);
				break;
			case 'dismiss':
				await alertsService.removeFired([message.id]);
				break;
			case 'clearFired': {
				const count = alertsService.getFired().length;
				const { confirmed } = await dialogService.confirm({
					message: localize('alerts.clearConfirm', "Clear all {0} fired alerts?", count),
					detail: localize('alerts.clearDetail', "They are taken out of Fired Alerts and cannot be brought back. Your alerts stay as they are."),
					primaryButton: localize({ key: 'alerts.clearButton', comment: ['&& denotes a mnemonic'] }, "&&Clear"),
				});
				if (confirmed) {
					await alertsService.clearFired();
				}
				break;
			}
			case 'openFile':
				await editorService.openEditor({ resource: alertsService.alertsFile });
				break;
			case 'showAlerts':
				await commandService.executeCommand(SHOW_ALERTS_COMMAND_ID);
				break;
			case 'addFor':
				await commandService.executeCommand(ADD_ALERT_COMMAND_ID, message.symbol);
				break;
			case 'openYahoo':
				await commandService.executeCommand(OPEN_LINK_COMMAND_ID, `https://finance.yahoo.com/quote/${encodeURIComponent(message.symbol)}`);
				break;
		}
	}));
}

// How many days back Search on the Add Alert page looks, to show how often an alert with a phrase would fire
const SEARCH_PREVIEW_DAYS = 30;
// How many of an economic series' latest values Look Up charts
const SERIES_PREVIEW_COUNT = 120;

/** The forms typed on the Add Alert page, upper case, once each. */
function cleanForms(forms: readonly string[]): string[] {
	return [...new Set(forms.map(form => String(form).trim().toUpperCase()).filter(form => form))];
}

/** The 8-K items ticked on the Add Alert page, those Pollis knows, in their order. */
function cleanItems(items: readonly string[]): string[] {
	return FORM_8K_ITEMS.map(([item]) => item).filter(item => items.includes(item));
}

/** Who an alert on filings is on, from the page's scope and its company, CIKs separated by commas, or SIC code. */
function filingsWho(scope: FilingsScope, company: string): Pick<IAlert, 'symbol' | 'ciks' | 'sic' | 'everyone'> {
	switch (scope) {
		case 'everyone': return { symbol: 'EDGAR', everyone: true };
		case 'industry': return { symbol: `SIC ${company}`, sic: company };
		case 'companies': return { symbol: company, ciks: company.split(',').map(cik => cik.trim()).filter(cik => /^\d+$/.test(cik)) };
		default: return { symbol: company };
	}
}

function pageHtml(kind: PageKind): string {
	const text = {
		title: localize('alerts.title', "Alerts"),
		addIntro: localize('alerts.addIntro', "Choose a symbol at Yahoo Finance and when to be alerted. Pollis looks its value up every minute while it is open; the quotes are delayed by up to about 20 minutes, depending on the exchange."),
		addIntroFilings: localize('alerts.addIntroFilings', "Choose a company and the forms to be alerted of. Pollis looks at its filings at the SEC's EDGAR every 15 minutes while it is open, and tells you when a new one is published."),
		intro: localize('alerts.intro', "Pollis looks up the values of your alerts at Yahoo Finance every minute while it is open, and tells you when one meets its condition. The quotes are delayed by up to about 20 minutes, depending on the exchange. Alerts on SEC filings look at EDGAR every 15 minutes."),
		watch: localize('alerts.watch', "Alert On"),
		sourceQuote: localize('alerts.sourceQuote', "A Quote"),
		sourceFilings: localize('alerts.sourceFilings', "SEC Filings"),
		sourceEconomic: localize('alerts.sourceEconomic', "Economic Data"),
		addIntroEconomic: localize('alerts.addIntroEconomic', "Choose a series at FRED, the ECB, the IMF or the World Bank and when to be alerted. Pollis looks it up every hour while it is open, and tells you when it publishes a new value, or a new value that meets your condition."),
		economicFrom: localize('alerts.economicFrom', "From"),
		economicSources: Object.fromEntries(ECONOMIC_SOURCES.map(source => [source, sourceName(source)])),
		series: localize('alerts.series', "Series"),
		seriesHints: {
			fred: localize('alerts.seriesHintFred', "A FRED series ID, such as {0}, UNRATE, GDPC1 or FEDFUNDS", seriesExample('fred')),
			ecb: localize('alerts.seriesHintEcb', "A dataset and series key of the ECB Data Portal, such as {0}", seriesExample('ecb')),
			imf: localize('alerts.seriesHintImf', "An IMF dataflow and series key, such as {0}", seriesExample('imf')),
			worldBank: localize('alerts.seriesHintWorldBank', "A country and a World Bank indicator, such as {0}", seriesExample('worldBank')),
		},
		seriesUnknown: localize('alerts.seriesUnknown', "{0} does not know {1}, or could not be reached."),
		seriesLatest: localize('alerts.seriesLatest', "Latest: {0} for {1}"),
		noFredKey: localize('alerts.noFredKey', "FRED asks for a free API key, as on the FRED panel."),
		setFredKey: localize('alerts.setFredKey', "Set FRED Key"),
		openSeriesHint: localize('alerts.openSeriesHint', "Opens the series at its source"),
		change: localize('alerts.change', "Change"),
		company: localize('alerts.company', "Company"),
		companyHint: localize('alerts.companyHint', "A ticker (AAPL) or the SEC's CIK (320193)"),
		scope: localize('alerts.scope', "For"),
		scopes: {
			company: localize('alerts.scopeCompany', "One Company"),
			companies: localize('alerts.scopeCompanies', "Several Companies"),
			industry: localize('alerts.scopeIndustry', "An Industry"),
			everyone: localize('alerts.scopeEveryone', "Every Company"),
		},
		everyoneHint: localize('alerts.everyoneHint', "Every company at the SEC: only with Contains, as there are thousands of filings a day"),
		contains: localize('alerts.contains', "Contains"),
		containsHint: localize('alerts.containsHint', "Words the filing must contain, in EDGAR's full-text search: an exact phrase in quotes, such as \"going concern\"; OR between alternatives. Optional, except for Every Company."),
		search: localize('alerts.search', "Search"),
		searching: localize('alerts.searching', "Searching..."),
		searchFound: localize('alerts.searchFound', "{0} filings of the last 30 days contain {1}"),
		searchMore: localize('alerts.searchMore', "More than {0} filings of the last 30 days contain {1}"),
		searchCaption: localize('alerts.searchCaption', "The newest first, each opening the document that has it: about how often the alert would fire"),
		searchNone: localize('alerts.searchNone', "No filing of the last 30 days contains it, or the SEC could not be reached."),
		companies: localize('alerts.companies', "Companies"),
		companiesHint: localize('alerts.companiesHint', "Tickers or CIKs, separated by commas: AAPL, MSFT, 1018724"),
		industry: localize('alerts.industry', "Industry"),
		industryHint: localize('alerts.industryHint', "The SEC's SIC code of the industry, such as 2834 for pharmaceuticals. Every company the SEC files under it, listed or not."),
		sicCodes: localize('alerts.sicCodes', "SIC Codes"),
		sicCodesHint: localize('alerts.sicCodesHint', "Opens the SEC's list of SIC codes in your browser"),
		companiesFound: localize('alerts.companiesFound', "{0} companies: {1}"),
		companiesUnknown: localize('alerts.companiesUnknown', "Not known to the SEC: {0}"),
		industryFound: localize('alerts.industryFound', "{0} (SIC {1}): {2} companies"),
		industryUnknown: localize('alerts.industryUnknown', "The SEC files no company under SIC {0}, or could not be reached."),
		feedNote: localize('alerts.feedNote', "Pollis looks for them in EDGAR's latest filings, which go back about a day: filings made while Pollis is closed for longer are missed."),
		forms: localize('alerts.forms', "Forms"),
		formsHint: localize('alerts.formsHint', "Separated by commas, such as 10-K, 10-Q, 8-K; an amendment (10-K/A) counts as its form. Leave it empty for every filing."),
		filerUnknown: localize('alerts.filerUnknown', "The SEC does not know {0}, or could not be reached."),
		noContact: localize('alerts.noContact', "The SEC asks for your name and email with every request, as on the EDGAR panel."),
		setContact: localize('alerts.setContact', "Set Contact"),
		recentFilings: localize('alerts.recentFilings', "Recent filings: those of the forms and items chosen in bold"),
		items: localize('alerts.items', "8-K Items"),
		itemsHint: localize('alerts.itemsHint', "An 8-K fires only when it reports one of the items ticked; none ticked, every 8-K fires. Most 8-Ks also have 9.01, their exhibits."),
		formItems: FORM_8K_ITEMS,
		edgar: localize('alerts.edgar', "EDGAR"),
		openEdgarHint: localize('alerts.openEdgarHint', "Opens its filings at the SEC's EDGAR in your browser"),
		openFiling: localize('alerts.openFilingLink', "Open Filing"),
		startStudy: localize('alerts.startStudy', "Start Event Study"),
		startStudyHint: localize('alerts.startStudyHint', "Opens Event Studies with this alert chosen for a new study of its filings"),
		openStudy: localize('alerts.openStudy', "Open Event Study"),
		eventStudy: localize('alerts.eventStudy', "Event Study"),
		autoStudy: localize('alerts.autoStudy', "Start One When It Fires"),
		autoStudyRow: localize('alerts.autoStudyRow', "Auto Event Study"),
		autoStudyHint: localize('alerts.autoStudyHint', "When it fires and has no event study yet, one starts: benchmark ^GSPC, market-adjusted, 30 minutes before to 2 hours after the filing and the next open. The filings of the 30 days before are among its events."),
		addTitle: localize('alerts.addTitle', "Add Alert"),
		symbol: localize('alerts.symbol', "Symbol"),
		symbolHint: localize('alerts.symbolHint', "An index (^GSPC), a share (AAPL), a future (BZ=F) or a currency (EURUSD=X)"),
		lookUp: localize('alerts.lookUp', "Look Up"),
		ranges: {
			'1d': localize('alerts.range1d', "1 Day"),
			'5d': localize('alerts.range5d', "5 Days"),
			'1mo': localize('alerts.range1mo', "1 Month"),
			'6mo': localize('alerts.range6mo', "6 Months"),
		},
		previousClose: localize('alerts.previousClose', "Previous close"),
		loadingChart: localize('alerts.loadingChart', "Loading the chart..."),
		noChart: localize('alerts.noChart', "No values to chart for this span."),
		lookingUp: localize('alerts.lookingUp', "Looking it up..."),
		unknown: localize('alerts.symbolUnknown', "Yahoo Finance does not know {0}, or could not be reached."),
		condition: localize('alerts.condition', "Alert Me When It"),
		conditions: {
			crossesAbove: localize('alerts.crossesAbove', "Crosses Above"),
			crossesBelow: localize('alerts.crossesBelow', "Crosses Below"),
			above: localize('alerts.above', "Is Above"),
			below: localize('alerts.below', "Is Below"),
			movesBy: localize('alerts.movesBy', "Moves By"),
			newValue: localize('alerts.newValue', "Publishes a New Value"),
			changesBy: localize('alerts.changesBy', "Changes By"),
			unusualMove: localize('alerts.unusualMove', "Moves Unusually"),
			leavesBand: localize('alerts.leavesBand', "Leaves Its Band"),
			beyondQuantile: localize('alerts.beyondQuantile', "Moves Beyond a Quantile"),
			newExtreme: localize('alerts.newExtreme', "Makes a New High or Low"),
		},
		economicHints: {
			newValue: localize('alerts.newValueDescription', "When the source publishes a value for a new period."),
			crossesAbove: localize('alerts.seriesCrossesAboveDescription', "When a new value is above it and the value before was not."),
			crossesBelow: localize('alerts.seriesCrossesBelowDescription', "When a new value is below it and the value before was not."),
			above: localize('alerts.seriesAboveDescription', "When a new value is above it."),
			below: localize('alerts.seriesBelowDescription', "When a new value is below it."),
			changesBy: localize('alerts.changesByDescription', "When a new value is up or down from the value before by the change or more."),
			unusualMove: localize('alerts.seriesUnusualMoveDescription', "When a new value's change is larger than this many standard deviations of the changes before it. Computed by OnlineStats.jl in Julia."),
			leavesBand: localize('alerts.seriesLeavesBandDescription', "When a new value leaves the band of this many standard deviations around the mean: once, until a value is back within. Computed by OnlineStats.jl in Julia."),
			beyondQuantile: localize('alerts.seriesBeyondQuantileDescription', "When a new value's change is beyond this quantile of the changes before it: above 50 a rise, below 50 a fall. Computed by OnlineStats.jl in Julia."),
			newExtreme: localize('alerts.seriesNewExtremeDescription', "When a new value is above the highest or below the lowest of this many values before it. Computed by OnlineStats.jl in Julia."),
		},
		conditionHints: {
			crossesAbove: localize('alerts.crossesAboveDescription', "When it goes from below the value to above it."),
			crossesBelow: localize('alerts.crossesBelowDescription', "When it goes from above the value to below it."),
			above: localize('alerts.aboveDescription', "While it is above the value: once, until it is back below."),
			below: localize('alerts.belowDescription', "While it is below the value: once, until it is back above."),
			movesBy: localize('alerts.movesByDescription', "When it moves up or down by more than a percentage since the previous close."),
			unusualMove: localize('alerts.unusualMoveDescription', "When its move since the minute before is larger than this many standard deviations of the moves before it. Computed by OnlineStats.jl in Julia."),
			leavesBand: localize('alerts.leavesBandDescription', "When it leaves the band of this many standard deviations around its mean: once, until it is back within. Computed by OnlineStats.jl in Julia."),
			beyondQuantile: localize('alerts.beyondQuantileDescription', "When its move since the minute before is beyond this quantile of the moves before it: above 50 a rise, below 50 a fall. Computed by OnlineStats.jl in Julia."),
			newExtreme: localize('alerts.newExtremeDescription', "When it goes above the highest or below the lowest of this many minutes before it. Computed by OnlineStats.jl in Julia."),
		},
		value: localize('alerts.value', "Value"),
		percent: localize('alerts.percent', "Move, in Per Cent"),
		deviations: localize('alerts.deviations', "Standard Deviations"),
		quantile: localize('alerts.quantile', "Quantile, in Per Cent"),
		window: localize('alerts.window', "Values Before It"),
		halfLife: localize('alerts.halfLife', "Half-Life, in Values"),
		halfLifeHint: localize('alerts.halfLifeDescription', "After how many values a value weighs half as much in the mean and the standard deviation."),
		computing: localize('alerts.computing', "Computing what it would have done, with OnlineStats.jl..."),
		openNotebook: localize('alerts.openNotebook', "Open Notebook"),
		openNotebookHint: localize('alerts.openNotebookHint', "Computes it in a Julia notebook with OnlineStats.jl, over the same values, to check it and try other settings"),
		backtestMinutes: localize('alerts.backtestMinutes', "Each minute of the regular sessions of the last five days."),
		neverFired: localize('alerts.neverFired', "It would not have fired over these values."),
		firedOnce: localize('alerts.firedOnce', "It would have fired once over these values."),
		firedTimes: localize('alerts.firedTimes', "It would have fired {0} times over these values."),
		backtestProblems: {
			noJulia: localize('alerts.backtestNoJulia', "Julia is needed to compute this condition, with OnlineStats.jl."),
			installing: localize('alerts.backtestInstalling', "Julia is installing OnlineStats.jl, the first time it is needed. Try again in a minute."),
			noKey: localize('alerts.backtestNoKey', "Needs your FRED key."),
			failed: localize('alerts.backtestFailed', "What it would have done could not be computed."),
		},
		severity: localize('alerts.severity', "Shows As"),
		severities: {
			info: localize('alerts.info', "Information"),
			warning: localize('alerts.warning', "Warning"),
			error: localize('alerts.error', "Error"),
		},
		repeat: localize('alerts.repeat', "Fires"),
		everyTime: localize('alerts.everyTime', "Every Time"),
		everyTimeHint: localize('alerts.everyTimeDescription', "Again each time the condition is met anew"),
		once: localize('alerts.once', "Once"),
		onceHint: localize('alerts.onceDescription', "Paused once it fires"),
		add: localize('alerts.addButton', "Add Alert"),
		seeAlerts: localize('alerts.seeAlerts', "See Your Alerts"),
		yourAlerts: localize('alerts.yourAlerts', "Your Alerts"),
		openFile: localize('alerts.openFile', "Open alerts.json"),
		noAlerts: localize('alerts.noAlerts', "No alerts yet. Add one above."),
		pause: localize('alerts.pauseButton', "Pause"),
		resume: localize('alerts.resumeButton', "Resume"),
		remove: localize('alerts.removeButton', "Remove"),
		paused: localize('alerts.paused', "Paused"),
		openQuote: localize('alerts.openQuote', "Show its quote"),
		quoteTitle: localize('alerts.quoteTitle', "Quote"),
		quoteIntro: localize('alerts.quoteIntro', "The latest value at Yahoo Finance, delayed by up to about 20 minutes depending on the exchange, with your alerts on it drawn across the chart."),
		previousCloseLabel: localize('alerts.previousCloseLabel', "Previous Close"),
		dayRange: localize('alerts.dayRange', "Day Range"),
		yearRange: localize('alerts.yearRange', "52-Week Range"),
		volume: localize('alerts.volume', "Volume"),
		asOf: localize('alerts.asOf', "As of {0}"),
		addFor: localize('alerts.addFor', "Add Alert"),
		openYahoo: localize('alerts.openYahoo', "Open at Yahoo Finance"),
		openYahooHint: localize('alerts.openYahooHint', "Opens Yahoo Finance's page in your browser"),
		fired: localize('alerts.firedTitle', "Fired Alerts"),
		markAllRead: localize('alerts.markAllRead', "Mark All Read"),
		markRead: localize('alerts.markRead', "Mark Read"),
		dismiss: localize('alerts.dismiss', "Dismiss"),
		dismissHint: localize('alerts.dismissHint', "Takes it out of Fired Alerts"),
		clearFired: localize('alerts.clearFired', "Clear"),
		clearFiredHint: localize('alerts.clearFiredHint', "Takes every fired alert out of Fired Alerts"),
		noneFired: localize('alerts.noneFired', "No alert has fired yet."),
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
		.container { max-width: 1100px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		h2 { font-size: 18px; font-weight: 400; margin: 0; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 24px 0; line-height: 1.4; max-width: 900px; }
		[hidden] { display: none !important; }
		.sectionHeader { display: flex; align-items: baseline; justify-content: space-between; margin: 24px 0 8px 0; }
		#alertsSection { margin-top: 0; }
		.form { padding: 16px; border-radius: 4px; background: var(--vscode-welcomePage-tileBackground, var(--vscode-editorWidget-background)); flex: 0 1 1000px; min-width: 0; container-type: inline-size; }
		.formGrid { display: grid; grid-template-columns: max-content minmax(0, 1fr) max-content minmax(0, 1fr); gap: 12px 16px; align-items: baseline; }
		.formGrid > .c1 { grid-column: 1; }
		.formGrid > .c2 { grid-column: 2; }
		.formGrid > .c3 { grid-column: 3; margin-left: 16px; }
		.formGrid > .c4 { grid-column: 4; }
		.formGrid > .r1 { grid-row: 1; }
		.formGrid > .r2 { grid-row: 2; }
		.formGrid > .r3 { grid-row: 3; }
		.formGrid > .r4 { grid-row: 4; }
		.formGrid > .r5 { grid-row: 5; }
		.form .formGrid > .added { grid-column: 3 / -1; grid-row: 5; margin-left: 16px; }
		@container (max-width: 720px) {
			.formGrid { grid-template-columns: max-content minmax(0, 1fr); }
			.form .formGrid > * { grid-row: auto; grid-column: auto; margin-left: 0; }
			.form .formGrid > .added { grid-column: 1 / -1; }
		}
		.addLayout { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
		.chartPane { flex: 1 1 360px; min-width: 0; padding: 16px; border-radius: 4px; background: var(--vscode-welcomePage-tileBackground, var(--vscode-editorWidget-background)); }
		.chartHeader { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
		.chartHeader .chartTitle { font-weight: 600; }
		.ranges { display: flex; gap: 4px; }
		.ranges button { font: inherit; font-size: 11px; color: var(--vscode-foreground); background: none; border: 1px solid transparent; border-radius: 2px; padding: 1px 6px; cursor: pointer; }
		.ranges button:hover { background: var(--vscode-toolbar-hoverBackground); }
		input#symbol.series { width: 340px; }
		.ranges button.chosen { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		#chart { display: block; width: 100%; height: 240px; }
		#chart .series { fill: none; stroke: var(--vscode-textLink-foreground); stroke-width: 1.5; }
		#chart .area { fill: var(--vscode-textLink-foreground); opacity: 0.08; }
		#chart .grid { stroke: var(--vscode-widget-border); stroke-width: 1; }
		#chart .previous { stroke: var(--vscode-descriptionForeground); stroke-dasharray: 2 3; }
		#chart .threshold { stroke: var(--vscode-editorInfo-foreground); stroke-width: 1.5; stroke-dasharray: 6 4; }
		#chart .threshold.warning { stroke: var(--vscode-editorWarning-foreground); }
		#chart .threshold.error { stroke: var(--vscode-editorError-foreground); }
		#chart .threshold.chosen { stroke-width: 2; stroke-dasharray: none; }
		#chart .firedDot { fill: var(--vscode-editorInfo-foreground); stroke: var(--vscode-editor-background); stroke-width: 1.5; }
		#chart .firedDot.warning { fill: var(--vscode-editorWarning-foreground); }
		#chart .firedDot.error { fill: var(--vscode-editorError-foreground); }
		#chart text.firedLabel { fill: var(--vscode-foreground); }
		#chart text { font-size: 10px; fill: var(--vscode-descriptionForeground); }
		#chart text.thresholdLabel { fill: var(--vscode-foreground); }
		#chart .cursor { stroke: var(--vscode-descriptionForeground); stroke-width: 1; }
		#chart .dot { fill: var(--vscode-textLink-foreground); }
		#chart .band { fill: none; stroke: var(--vscode-charts-orange); stroke-width: 1; stroke-dasharray: 4 3; }
		#chart .wouldFire { fill: var(--vscode-charts-red); stroke: var(--vscode-editor-background); stroke-width: 1; }
		.chartHeader .chartLabel { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; min-width: 0; }
		.chartCaption { font-size: 11px; color: var(--vscode-descriptionForeground); }
		.form label.field { color: var(--vscode-foreground); }
		.form .hint { font-size: 12px; color: var(--vscode-descriptionForeground); margin-top: 4px; line-height: 1.4; }
		.form .row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
		input[type="text"], input[type="number"], select { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 4px 6px; }
		input[type="text"] { width: 200px; text-transform: uppercase; }
		input[type="number"] { width: 160px; }
		input:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		.choice { display: inline-flex; align-items: center; gap: 4px; margin-right: 16px; cursor: pointer; }
		.quote { font-size: 12px; color: var(--vscode-descriptionForeground); }
		.quote.error { color: var(--vscode-errorForeground); }
		button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; border-radius: 2px; padding: 4px 12px; cursor: pointer; }
		button.action:hover { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.primary:hover { background: var(--vscode-button-hoverBackground); }
		button:disabled, button:disabled:hover { opacity: 0.5; cursor: default; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
		.added { grid-column: 1 / -1; font-size: 12px; color: var(--vscode-descriptionForeground); line-height: 1.4; }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; font-size: 12px; }
		.link:hover { text-decoration: underline; }
		.list { border-top: 1px solid var(--vscode-widget-border); }
		.entry { display: flex; align-items: center; gap: 12px; padding: 8px; border-bottom: 1px solid var(--vscode-widget-border); border-left: 3px solid var(--vscode-editorInfo-foreground); }
		.entry.warning { border-left-color: var(--vscode-editorWarning-foreground); }
		.entry.error { border-left-color: var(--vscode-editorError-foreground); }
		.entry .text { flex: 1; min-width: 0; line-height: 1.4; }
		.entry .name { font-weight: 600; }
		.entry .meta { font-size: 11px; color: var(--vscode-descriptionForeground); }
		.entry.paused .name, .entry.read .name { font-weight: normal; color: var(--vscode-descriptionForeground); }
		.entry .actions { display: flex; gap: 12px; }
		.headerActions { display: flex; gap: 12px; }
		.empty { color: var(--vscode-descriptionForeground); padding: 12px 8px; }
		.quoteInfo { flex: 0 1 340px; min-width: 0; padding: 16px; border-radius: 4px; background: var(--vscode-welcomePage-tileBackground, var(--vscode-editorWidget-background)); }
		.quoteInfo .row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
		.quoteInfo .name { font-size: 16px; font-weight: 600; margin-top: 16px; }
		.quoteInfo .exchange { font-size: 12px; color: var(--vscode-descriptionForeground); }
		.quoteInfo .price { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
		.quoteInfo .value { font-size: 28px; font-weight: 300; }
		.quoteInfo .change.up { color: var(--vscode-charts-green); }
		.quoteInfo .change.down { color: var(--vscode-charts-red); }
		.quoteInfo .asOf { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 2px; }
		.stats { display: grid; grid-template-columns: max-content 1fr; gap: 6px 16px; margin: 16px 0; font-size: 12px; }
		.stats .label { color: var(--vscode-descriptionForeground); }
		.quoteActions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
		.list > .addLayout { padding: 12px 0 12px 11px; border-bottom: 1px solid var(--vscode-widget-border); }
		.list > .addLayout .quoteInfo .name { margin-top: 0; }
		.entry.expanded { background: var(--vscode-list-inactiveSelectionBackground); }
		.sourceRow { margin-bottom: 12px; }
		.sourceRow .field { margin-right: 16px; }
		.sourceRow .scope { display: inline-flex; align-items: center; margin-left: 16px; padding-left: 16px; border-left: 1px solid var(--vscode-widget-border, transparent); }
		input#forms { width: 260px; }
		.items { max-height: 156px; max-width: 360px; overflow-y: auto; padding: 4px 8px; border: 1px solid var(--vscode-widget-border); border-radius: 2px; }
		.items label { display: block; padding: 1px 0; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.filing { display: grid; grid-template-columns: max-content 80px minmax(0, 1fr); gap: 12px; padding: 4px 0; border-bottom: 1px solid var(--vscode-widget-border); font-size: 12px; color: var(--vscode-descriptionForeground); }
		.filing.match { font-weight: 600; color: var(--vscode-foreground); }
		.filing .link { text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	</style>
</head>
<body>
<div class="container">
	<div class="title-row">
		<h1>${kind === 'add' ? text.addTitle : kind === 'quote' ? text.quoteTitle : text.title}</h1>
		${voiceButtonsHtml}
	</div>
	<p class="subtitle" id="subtitle">${kind === 'add' ? text.addIntro : kind === 'quote' ? text.quoteIntro : text.intro}</p>

	<div class="addLayout" id="layout"${kind === 'alerts' ? ' hidden' : ''}>
	<div class="quoteInfo"${kind === 'add' ? ' hidden' : ''}>
		<div class="row"${kind === 'alerts' ? ' hidden' : ''}>
			<input type="text" id="quoteSymbol" spellcheck="false" autocomplete="off" aria-label="${text.symbol}">
			<button class="action" id="quoteLookUp">${text.lookUp}</button>
		</div>
		<div class="quote" id="quoteStatus"></div>
		<div id="quoteDetails" hidden>
			<div class="name" id="quoteName"></div>
			<div class="exchange" id="quoteExchange"></div>
			<div class="price"><span class="value" id="quoteValue"></span><span class="change" id="quoteChange"></span></div>
			<div class="asOf" id="quoteAsOf"></div>
			<div class="stats" id="quoteStats"></div>
			<div class="quoteActions"${kind === 'alerts' ? ' hidden' : ''}>
				<button class="action primary" id="addFor">${text.addFor}</button>
				<button class="link" id="openYahoo" title="${text.openYahooHint}">${text.openYahoo}</button>
				<button class="link" id="quoteYourAlerts">${text.yourAlerts}</button>
			</div>
		</div>
	</div>
	<div class="form" id="form"${kind === 'add' ? '' : ' hidden'}>
		<div class="row sourceRow">
			<span class="field">${text.watch}</span>
			<label class="choice"><input type="radio" name="source" value="quote" checked>${text.sourceQuote}</label>
			<label class="choice"><input type="radio" name="source" value="filings">${text.sourceFilings}</label>
			<label class="choice"><input type="radio" name="source" value="economic">${text.sourceEconomic}</label>
			<span class="scope" id="economicRow" hidden>
				<span class="field">${text.economicFrom}</span>
				${ECONOMIC_SOURCES.map((source, index) => `<label class="choice"><input type="radio" name="economic" value="${source}"${index === 0 ? ' checked' : ''}>${text.economicSources[source]}</label>`).join('')}
			</span>
			<span class="scope" id="scopeRow" hidden>
				<span class="field">${text.scope}</span>
				<label class="choice"><input type="radio" name="scope" value="company" checked>${text.scopes.company}</label>
				<label class="choice"><input type="radio" name="scope" value="companies">${text.scopes.companies}</label>
				<label class="choice"><input type="radio" name="scope" value="industry">${text.scopes.industry}</label>
				<label class="choice"><input type="radio" name="scope" value="everyone">${text.scopes.everyone}</label>
			</span>
		</div>
		<div class="formGrid">
		<label class="field c1 r1" for="symbol" id="symbolLabel">1. ${text.symbol}</label>
		<div class="c2 r1">
			<div class="row">
				<input type="text" id="symbol" spellcheck="false" autocomplete="off">
				<button class="action" id="lookUp">${text.lookUp}</button>
				<span class="quote" id="quote"></span>
				<button class="link" id="setContact" hidden>${text.setContact}</button>
				<button class="link" id="setFredKey" hidden>${text.setFredKey}</button>
			</div>
			<div class="hint"><span id="symbolHint">${text.symbolHint}</span> <button class="link" id="sicCodes" title="${text.sicCodesHint}" hidden>${text.sicCodes}</button></div>
			<div class="hint" id="feedNote" hidden>${text.feedNote}</div>
		</div>
		<label class="field c1 r2" for="condition" id="conditionLabel">2. ${text.condition}</label>
		<div class="c2 r2">
			<input type="text" id="forms" spellcheck="false" autocomplete="off" value="10-K, 10-Q, 8-K" hidden>
			<select id="condition">
				<option value="crossesAbove">${text.conditions.crossesAbove}</option>
				<option value="crossesBelow">${text.conditions.crossesBelow}</option>
				<option value="above">${text.conditions.above}</option>
				<option value="below">${text.conditions.below}</option>
				<option value="movesBy">${text.conditions.movesBy}</option>
				<option value="newValue" hidden>${text.conditions.newValue}</option>
				<option value="changesBy" hidden>${text.conditions.changesBy}</option>
				<option value="unusualMove">${text.conditions.unusualMove}</option>
				<option value="leavesBand">${text.conditions.leavesBand}</option>
				<option value="beyondQuantile">${text.conditions.beyondQuantile}</option>
				<option value="newExtreme">${text.conditions.newExtreme}</option>
			</select>
			<div class="hint" id="conditionHint"></div>
		</div>
		<label class="field c1 r3" for="threshold" id="thresholdLabel">3. ${text.value}</label>
		<div class="c2 r3" id="thresholdCell"><input type="number" id="threshold" step="any"></div>
		<label class="field c1 r3" id="itemsLabel" hidden>${text.items}</label>
		<div class="c2 r3" id="itemsCell" hidden>
			<div class="items" id="items"></div>
			<div class="hint">${text.itemsHint}</div>
		</div>
		<label class="field c1 r4" for="contains" id="containsLabel" hidden>3. ${text.contains}</label>
		<div class="c2 r4" id="containsCell" hidden>
			<div class="row">
				<input type="text" id="contains" spellcheck="false" autocomplete="off">
				<button class="action" id="search">${text.search}</button>
			</div>
			<div class="hint">${text.containsHint}</div>
		</div>
		<label class="field c1 r4" for="halfLife" id="halfLifeLabel" hidden>${text.halfLife}</label>
		<div class="c2 r4" id="halfLifeCell" hidden>
			<input type="number" id="halfLife" step="any" min="1" value="60">
			<div class="hint">${text.halfLifeHint}</div>
		</div>
		<span class="field c3 r1">4. ${text.severity}</span>
		<div class="c4 r1">
			<label class="choice"><input type="radio" name="severity" value="info" checked>${text.severities.info}</label>
			<label class="choice"><input type="radio" name="severity" value="warning">${text.severities.warning}</label>
			<label class="choice"><input type="radio" name="severity" value="error">${text.severities.error}</label>
		</div>
		<span class="field c3 r2">5. ${text.repeat}</span>
		<div class="c4 r2">
			<label class="choice" title="${text.everyTimeHint}"><input type="radio" name="repeat" value="true" checked>${text.everyTime}</label>
			<label class="choice" title="${text.onceHint}"><input type="radio" name="repeat" value="false">${text.once}</label>
			<div class="hint" id="repeatHint"></div>
		</div>
		<span class="field c3 r3" id="eventStudyLabel" hidden>6. ${text.eventStudy}</span>
		<div class="c4 r3" id="eventStudyCell" hidden>
			<label class="choice" title="${text.autoStudyHint}"><input type="checkbox" id="eventStudy">${text.autoStudy}</label>
			<div class="hint">${text.autoStudyHint}</div>
		</div>
		<span class="c3 r4"></span>
		<div class="c4 r4"><button class="action primary" id="add" disabled>${text.add}</button></div>
		<div class="added" id="added" hidden><span id="addedText"></span> <button class="link" id="seeAlerts">${text.seeAlerts}</button></div>
		</div>
	</div>
	<div class="chartPane" id="chartPane" hidden>
		<div class="chartHeader">
			<span class="chartLabel"><span class="chartTitle" id="chartTitle"></span><span class="chartCaption" id="chartCaption"></span></span>
			<span class="ranges" id="ranges"></span>
		</div>
		<svg id="chart" xmlns="http://www.w3.org/2000/svg"></svg>
		<div class="chartCaption" id="backtestNote" hidden><span id="backtestText"></span> <button class="link" id="openNotebook" title="${text.openNotebookHint}" hidden>${text.openNotebook}</button></div>
	</div>
	<div class="chartPane" id="filingsPane" hidden>
		<div class="chartHeader">
			<span class="chartLabel"><span class="chartTitle" id="filerTitle"></span><span class="chartCaption" id="filerCaption"></span></span>
		</div>
		<div class="chartCaption" id="filingsCaption">${text.recentFilings}</div>
		<div id="filingsList"></div>
	</div>
	</div>

	<div id="lists"${kind === 'alerts' ? '' : ' hidden'}>
	<div class="sectionHeader" id="alertsSection"><h2>${text.yourAlerts}</h2><button class="link" id="openFile">${text.openFile}</button></div>
	<div class="list" id="alerts"></div>

	<div class="sectionHeader" id="firedSection"><h2>${text.fired}</h2><span class="headerActions"><button class="link" id="markAllRead" hidden>${text.markAllRead}</button><button class="link" id="clearFired" title="${text.clearFiredHint}" hidden>${text.clearFired}</button></span></div>
	<div class="list" id="fired"></div>
	</div>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	const TEXT = ${JSON.stringify(text)};
	const KIND = ${JSON.stringify(kind)};
	const symbolElement = document.getElementById(KIND === 'add' ? 'symbol' : 'quoteSymbol');
	const quoteElement = document.getElementById(KIND === 'add' ? 'quote' : 'quoteStatus');
	// On the Alerts page, the alert or fired alert whose panel is open, if any
	let expanded;
	const conditionElement = document.getElementById('condition');
	const thresholdElement = document.getElementById('threshold');
	const addElement = document.getElementById('add');
	const addedElement = document.getElementById('added');
	// The quote of the symbol looked up last; the alert is added only for a symbol Yahoo Finance knows
	let quote;
	let lookedUp = '';
	let state = { alerts: [], fired: [] };
	// Add Alert on a quote, on a company's SEC filings or on an economic series, and the company looked up last, with its recent filings
	let source = 'quote';
	// For an economic series: where it is published
	let economicSource = 'fred';
	const setFredKeyElement = document.getElementById('setFredKey');
	let filer;
	// For filings: on one company, several, or an industry; and the companies or the industry looked up last
	let scope = 'company';
	let group;
	// What Search found for the phrase: the filings of the last 30 days that contain it
	let searched;
	const containsElement = document.getElementById('contains');
	function phrase() {
		return containsElement.value.trim();
	}
	const formsElement = document.getElementById('forms');
	const itemsElement = document.getElementById('items');
	for (const [item, name] of TEXT.formItems) {
		const label = document.createElement('label');
		const box = document.createElement('input');
		box.type = 'checkbox';
		box.value = item;
		label.title = item + ' ' + name;
		label.append(box, ' ' + item + ' ' + name);
		itemsElement.appendChild(label);
	}
	// The 8-K items, in place of the value, on filings whose forms take in 8-Ks
	function showItems() {
		const shown = filings() && hasEightK();
		document.getElementById('itemsLabel').hidden = !shown;
		document.getElementById('itemsCell').hidden = !shown;
	}
	const setContactElement = document.getElementById('setContact');

	function element(tag, className, text) {
		const result = document.createElement(tag);
		if (className) {
			result.className = className;
		}
		if (text !== undefined) {
			result.textContent = text;
		}
		return result;
	}
	function format(template, ...values) {
		return template.replace(/{(\\d+)}/g, (match, index) => values[Number(index)] ?? match);
	}

	function lookUp() {
		const symbol = symbolElement.value.trim().toUpperCase();
		if (!symbol || symbol === lookedUp) {
			return;
		}
		lookedUp = symbol;
		quote = undefined;
		filer = undefined;
		group = undefined;
		setContactElement.hidden = true;
		setFredKeyElement.hidden = true;
		quoteElement.className = 'quote';
		quoteElement.textContent = TEXT.lookingUp;
		updateForm();
		vscode.postMessage(economic() ? { command: 'lookUpSeries', source: economicSource, id: symbol }
			: !filings() ? { command: 'lookUp', symbol }
			: scope === 'companies' ? { command: 'lookUpCompanies', companies: symbol }
				: scope === 'industry' ? { command: 'lookUpIndustry', sic: symbol }
					: { command: 'lookUpFiler', company: symbol });
	}
	function filings() {
		return source === 'filings';
	}
	function economic() {
		return source === 'economic';
	}
	function chosenForms() {
		return formsElement.value.split(',').map(form => form.trim().toUpperCase()).filter(form => form);
	}
	// The 8-K items ticked, when the forms take in 8-Ks
	function hasEightK() {
		const forms = chosenForms();
		return !forms.length || forms.includes('8-K') || forms.includes('8-K/A');
	}
	function chosenItems() {
		return hasEightK() ? [...itemsElement.querySelectorAll('input:checked')].map(input => input.value) : [];
	}
	// The same test as the alert's: one of the forms, an amendment counting as its form, and for an 8-K one of the items
	function matchesFiling(filing, forms, items) {
		const form = filing.form.replace(/\\/A$/, '');
		return (!forms.length || forms.some(wanted => filing.form === wanted || form === wanted))
			&& (!items.length || form !== '8-K' || items.some(item => (filing.items || []).includes(item)));
	}
	function itemNames(items) {
		const names = new Map(TEXT.formItems);
		const shown = (items || []).filter(item => item !== '9.01' || items.length === 1).map(item => names.get(item) || item);
		return shown.join('; ');
	}
	// The form for a quote or for filings: the labels and hints of its fields, and the fields it has
	function setSource(value) {
		source = value;
		document.querySelector('input[name="source"][value="' + value + '"]').checked = true;
		symbolElement.value = '';
		lookedUp = '';
		quote = undefined;
		filer = undefined;
		quoteElement.className = 'quote';
		quoteElement.textContent = '';
		setContactElement.hidden = true;
		setFredKeyElement.hidden = true;
		addedElement.hidden = true;
		document.getElementById('subtitle').textContent = filings() ? TEXT.addIntroFilings : economic() ? TEXT.addIntroEconomic : TEXT.addIntro;
		document.getElementById('scopeRow').hidden = !filings();
		document.getElementById('economicRow').hidden = !economic();
		document.getElementById('ranges').hidden = economic();
		symbolElement.classList.toggle('series', economic());
		// A quote moves by a percentage since the previous close; a series publishes new values, which change from the one before
		for (const option of conditionElement.options) {
			option.hidden = economic() ? option.value === 'movesBy' : option.value === 'newValue' || option.value === 'changesBy';
		}
		conditionElement.value = economic() ? 'newValue' : 'crossesAbove';
		setScope('company');
		const conditionLabel = document.getElementById('conditionLabel');
		conditionLabel.textContent = '2. ' + (filings() ? TEXT.forms : TEXT.condition);
		conditionLabel.htmlFor = filings() ? 'forms' : 'condition';
		formsElement.hidden = !filings();
		conditionElement.hidden = filings();
		document.getElementById('thresholdLabel').hidden = filings();
		document.getElementById('thresholdCell').hidden = filings();
		document.getElementById('eventStudyLabel').hidden = !filings();
		document.getElementById('eventStudyCell').hidden = !filings();
		showItems();
		fillThreshold();
		updateForm();
	}
	// On filings, one company, several or an industry: the label and hint of the field, and the look-up cleared
	function setScope(value) {
		scope = value;
		document.querySelector('input[name="scope"][value="' + value + '"]').checked = true;
		symbolElement.value = '';
		lookedUp = '';
		filer = undefined;
		group = undefined;
		quoteElement.className = 'quote';
		quoteElement.textContent = '';
		setContactElement.hidden = true;
		addedElement.hidden = true;
		const label = economic() ? TEXT.series : !filings() ? TEXT.symbol : scope === 'companies' ? TEXT.companies : scope === 'industry' ? TEXT.industry : TEXT.company;
		const hint = economic() ? TEXT.seriesHints[economicSource] : !filings() ? TEXT.symbolHint : scope === 'companies' ? TEXT.companiesHint : scope === 'industry' ? TEXT.industryHint : TEXT.companyHint;
		document.getElementById('symbolLabel').textContent = '1. ' + label;
		document.getElementById('symbolHint').textContent = hint;
		document.getElementById('sicCodes').hidden = !filings() || scope !== 'industry';
		// Every company has nothing to look up
		symbolElement.disabled = filings() && scope === 'everyone';
		document.getElementById('lookUp').disabled = filings() && scope === 'everyone';
		if (filings() && scope === 'everyone') {
			document.getElementById('symbolLabel').textContent = '1. ' + TEXT.scopes.everyone;
			document.getElementById('symbolHint').textContent = TEXT.everyoneHint;
		}
		document.getElementById('containsLabel').hidden = !filings();
		document.getElementById('containsCell').hidden = !filings();
		searched = undefined;
		updateForm();
	}
	// The company's recent filings, those of the forms chosen in bold, each opening at the SEC
	function renderFilings() {
		const pane = document.getElementById('filingsPane');
		// What Search found, once it answers, in place of the company's recent filings
		const found = searched && !searched.pending;
		pane.hidden = !filings() || (!filer && !found);
		if (pane.hidden) {
			return;
		}
		if (found) {
			renderSearched();
			return;
		}
		document.getElementById('filingsCaption').textContent = TEXT.recentFilings;
		document.getElementById('filerTitle').textContent = filer.name + ' (CIK ' + filer.cik + ')';
		document.getElementById('filerCaption').textContent = filer.tickers.join(', ');
		const forms = chosenForms();
		const items = chosenItems();
		const list = document.getElementById('filingsList');
		list.replaceChildren();
		for (const filing of filer.filings) {
			const row = element('div', 'filing' + (matchesFiling(filing, forms, items) ? ' match' : ''));
			const open = element('button', 'link', itemNames(filing.items) || filing.description || filing.form);
			open.title = filing.url;
			open.addEventListener('click', () => vscode.postMessage({ command: 'openUrl', url: filing.url }));
			row.append(element('span', '', filing.filed), element('span', '', filing.form), open);
			list.appendChild(row);
		}
	}
	// The filings Search found, newest first, each opening the document that has the phrase
	function renderSearched() {
		document.getElementById('filerTitle').textContent = searched.count === undefined ? TEXT.searchNone
			: format(searched.more ? TEXT.searchMore : TEXT.searchFound, searched.count.toLocaleString(), searched.phrase);
		document.getElementById('filerCaption').textContent = '';
		document.getElementById('filingsCaption').textContent = searched.count ? TEXT.searchCaption : '';
		const list = document.getElementById('filingsList');
		list.replaceChildren();
		for (const filing of searched.filings || []) {
			const row = element('div', 'filing match');
			const open = element('button', 'link', filing.name + ': ' + (itemNames(filing.items) || filing.description || filing.form));
			open.title = filing.url;
			open.addEventListener('click', () => vscode.postMessage({ command: 'openUrl', url: filing.url }));
			row.append(element('span', '', filing.filed), element('span', '', filing.form), open);
			list.appendChild(row);
		}
	}
	// Who the alert is on, for the host: the company's CIK, the companies' CIKs, the SIC code, or no one for every company
	function who() {
		return scope === 'company' ? (filer ? filer.cik : '') : scope === 'everyone' ? '' : (group ? group.key : '');
	}
	function search() {
		if (!phrase() || (scope !== 'everyone' && !who())) {
			return;
		}
		searched = { phrase: phrase(), pending: true };
		quoteElement.className = 'quote';
		quoteElement.textContent = TEXT.searching;
		vscode.postMessage({ command: 'searchFilings', scope, company: who(), phrase: phrase(), forms: chosenForms(), items: chosenItems() });
	}
	function percent() {
		return conditionElement.value === 'movesBy';
	}
	// The conditions computed by OnlineStats.jl, from the values the alert looks at
	const STATISTICAL = ['unusualMove', 'leavesBand', 'beyondQuantile', 'newExtreme'];
	function statistical() {
		return !filings() && STATISTICAL.includes(conditionElement.value);
	}
	function usesDeviations() {
		return !filings() && (conditionElement.value === 'unusualMove' || conditionElement.value === 'leavesBand');
	}
	const halfLifeElement = document.getElementById('halfLife');
	// What the statistical condition of the form would have done over the values it would look at, asked for once the form rests
	let backtest;
	let backtestTimer;
	function requestBacktest() {
		const valid = statistical() && quote && !addElement.disabled;
		const key = valid ? JSON.stringify([economic() ? economicSource : '', quote.symbol, conditionElement.value, Number(thresholdElement.value), usesDeviations() ? Number(halfLifeElement.value) : 0]) : undefined;
		if ((backtest && backtest.key) === key) {
			return;
		}
		clearTimeout(backtestTimer);
		backtest = key ? { key } : undefined;
		drawChart();
		if (!key) {
			return;
		}
		const request = {
			command: 'backtest',
			key,
			symbol: quote.symbol,
			source: economic() ? economicSource : undefined,
			condition: conditionElement.value,
			threshold: Number(thresholdElement.value),
			halfLife: usesDeviations() ? Number(halfLifeElement.value) : undefined,
		};
		backtest.request = request;
		backtestTimer = setTimeout(() => vscode.postMessage(request), 400);
	}
	document.getElementById('openNotebook').addEventListener('click', () => backtest && quote && vscode.postMessage({ ...backtest.request, command: 'openNotebook', name: quote.name }));
	// The value starts at the current price, or at 2 per cent for Moves By, or at the latest change for Changes By
	function fillThreshold() {
		if (statistical()) {
			const condition = conditionElement.value;
			// A day's minutes of a quote, two years of a monthly series
			thresholdElement.value = condition === 'unusualMove' ? '3' : condition === 'leavesBand' ? '2' : condition === 'beyondQuantile' ? '99' : economic() ? '24' : '390';
			thresholdElement.min = '0';
			return;
		}
		const changesBy = conditionElement.value === 'changesBy';
		thresholdElement.value = percent() ? '2' : changesBy ? String(quote && quote.lastChange ? Number(Math.abs(quote.lastChange).toPrecision(2)) : 1) : quote ? String(quote.value) : '';
		thresholdElement.min = percent() || changesBy ? '0' : '';
	}
	// The chart of the symbol looked up, with the previous close and the alert's value drawn across it
	const SVG = 'http://www.w3.org/2000/svg';
	const chartPane = document.getElementById('chartPane');
	const chartElement = document.getElementById('chart');
	const chartCaption = document.getElementById('chartCaption');
	let chartRange = '1d';
	let chart;
	for (const range of Object.keys(TEXT.ranges)) {
		const button = element('button', '', TEXT.ranges[range]);
		button.dataset.range = range;
		button.addEventListener('click', () => { chartRange = range; requestChart(); });
		document.getElementById('ranges').appendChild(button);
	}
	function requestChart() {
		chart = undefined;
		for (const button of document.querySelectorAll('#ranges button')) {
			button.classList.toggle('chosen', button.dataset.range === chartRange);
		}
		chartCaption.textContent = TEXT.loadingChart;
		drawChart();
		vscode.postMessage({ command: 'chart', symbol: quote.symbol, range: chartRange });
	}
	function svg(tag, attributes, text) {
		const result = document.createElementNS(SVG, tag);
		for (const [name, value] of Object.entries(attributes)) {
			result.setAttribute(name, String(value));
		}
		if (text !== undefined) {
			result.textContent = text;
		}
		return result;
	}
	function formatNumber(value) {
		const digits = Math.abs(value) >= 100 ? 2 : Math.abs(value) >= 1 ? 4 : 6;
		return value.toLocaleString(undefined, { maximumFractionDigits: digits });
	}
	function formatTime(time, range = chartRange) {
		const date = new Date(time);
		return range === '1d' ? date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
			: range === '6mo' ? date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
			: date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
	}
	// The values an alert fires at: its value, or the previous close moved up and down by its percentage
	function linesOf(condition, threshold, severity) {
		if (!Number.isFinite(threshold)) {
			return [];
		}
		// A statistical condition has a band of its own, drawn from what it would have done
		if (condition === 'newValue' || STATISTICAL.includes(condition)) {
			return [];
		}
		// A series' next value fires when it is the change away from the latest
		if (condition === 'changesBy') {
			return quote && threshold > 0 ? [{ value: quote.value + threshold, label: '+' + formatNumber(threshold), severity }, { value: quote.value - threshold, label: '\u2212' + formatNumber(threshold), severity }] : [];
		}
		if (condition !== 'movesBy') {
			return [{ value: threshold, label: formatNumber(threshold), severity }];
		}
		const base = chart && chart.previousClose !== undefined ? chart.previousClose : quote && quote.value;
		return base && threshold > 0 ? [{ value: base * (1 + threshold / 100), label: '+' + threshold + '%', severity }, { value: base * (1 - threshold / 100), label: '-' + threshold + '%', severity }] : [];
	}
	// On the quote page, those of the user's alerts on the symbol that are not paused, and in a panel of the Alerts
	// page, the alert of the panel among them, drawn solid; else the alert of the form
	function thresholdLines() {
		if (KIND !== 'add') {
			if (!quote) {
				return [];
			}
			const chosenId = expanded && (expanded.alertId || expanded.id);
			const alerts = state.alerts.filter(alert => !alert.filings && !alert.economic && alert.symbol === quote.symbol && (!alert.paused || alert.id === chosenId));
			const lines = alerts.flatMap(alert => linesOf(alert.conditionKind, alert.threshold, alert.severity).map(line => ({ ...line, chosen: alert.id === chosenId })));
			// A fired alert whose alert was removed since
			if (expanded && expanded.fired && !alerts.some(alert => alert.id === expanded.alertId)) {
				lines.push(...linesOf(expanded.fired.conditionKind, expanded.fired.threshold, expanded.fired.severity).map(line => ({ ...line, chosen: true })));
			}
			return lines;
		}
		if (thresholdElement.value.trim() === '') {
			return [];
		}
		return linesOf(conditionElement.value, Number(thresholdElement.value), document.querySelector('input[name="severity"]:checked').value);
	}
	function drawChart() {
		chartPane.hidden = !quote;
		chartElement.replaceChildren();
		const backtestNote = document.getElementById('backtestNote');
		backtestNote.hidden = !backtest;
		document.getElementById('ranges').hidden = economic() || !!backtest;
		if (!quote) {
			chart = undefined;
			return;
		}
		document.getElementById('chartTitle').textContent = quote.name + ' (' + quote.symbol + ')';
		// A statistical condition: the values it would look at, with its band and where it would have fired
		const result = backtest && backtest.result;
		const view = backtest ? result && { times: result.times || result.values.map((_, index) => index), labels: result.periods, values: result.values, lower: result.lower, upper: result.upper, fired: result.fired } : chart;
		if (backtest) {
			const count = result ? result.fired.length : 0;
			document.getElementById('openNotebook').hidden = !result;
			document.getElementById('backtestText').textContent = !backtest.done ? TEXT.computing
				: !result ? TEXT.backtestProblems[backtest.problem] || TEXT.backtestProblems.failed
				: [result.times ? TEXT.backtestMinutes : '', count === 0 ? TEXT.neverFired : count === 1 ? TEXT.firedOnce : format(TEXT.firedTimes, count)].filter(text => text).join(' ');
			chartCaption.textContent = '';
		}
		if (!view) {
			return;
		}
		if (view.values.length < 2) {
			chartCaption.textContent = TEXT.noChart;
			return;
		}
		const width = chartElement.clientWidth || 400;
		const height = chartElement.clientHeight || 240;
		const left = 56, right = 44, top = 8, bottom = 20;
		const lines = thresholdLines();
		// The 1 day chart starts at the previous close, so the previous close is shown with it only
		const previous = !backtest && chartRange === '1d' ? view.previousClose : undefined;
		// When a fired alert of the panel fired, at the value it fired at, if the chart reaches back that far
		const fired = !backtest && expanded && expanded.fired && expanded.fired.time >= view.times[0] ? expanded.fired : undefined;
		const band = (view.lower || []).concat(view.upper || []).filter(value => value !== null && value !== undefined);
		const all = view.values.concat(lines.map(line => line.value), previous !== undefined ? [previous] : [], fired ? [fired.value] : [], band);
		let min = Math.min(...all), max = Math.max(...all);
		const pad = (max - min) * 0.06 || Math.abs(max) * 0.01 || 1;
		min -= pad;
		max += pad;
		// The x of a value by its position, so that nights and weekends take no room
		const x = index => left + (width - left - right) * index / (view.values.length - 1);
		const y = value => top + (height - top - bottom) * (max - value) / (max - min);
		for (const value of [max - pad, (min + max) / 2, min + pad]) {
			chartElement.appendChild(svg('line', { class: 'grid', x1: left, x2: width - right, y1: y(value), y2: y(value) }));
			chartElement.appendChild(svg('text', { x: left - 6, y: y(value) + 3, 'text-anchor': 'end' }, formatNumber(value)));
		}
		// A series has its periods for times
		const timeLabel = index => view.labels ? view.labels[index] : formatTime(view.times[index], backtest ? '5d' : chartRange);
		chartElement.appendChild(svg('text', { x: left, y: height - 4 }, timeLabel(0)));
		chartElement.appendChild(svg('text', { x: width - right, y: height - 4, 'text-anchor': 'end' }, timeLabel(view.values.length - 1)));
		const points = view.values.map((value, index) => x(index).toFixed(1) + ',' + y(value).toFixed(1));
		chartElement.appendChild(svg('path', { class: 'area', d: 'M' + x(0) + ',' + y(min) + ' L' + points.join(' L') + ' L' + x(view.values.length - 1) + ',' + y(min) + ' Z' }));
		chartElement.appendChild(svg('polyline', { class: 'series', points: points.join(' ') }));
		if (previous !== undefined) {
			chartElement.appendChild(svg('line', { class: 'previous', x1: left, x2: width - right, y1: y(previous), y2: y(previous) }));
			chartElement.appendChild(svg('text', { x: left + 4, y: y(previous) - 4 }, TEXT.previousClose));
		}
		for (const line of lines) {
			chartElement.appendChild(svg('line', { class: 'threshold ' + line.severity + (line.chosen ? ' chosen' : ''), x1: left, x2: width - right, y1: y(line.value), y2: y(line.value) }));
			chartElement.appendChild(svg('text', { class: 'thresholdLabel', x: width - right + 4, y: y(line.value) + 3 }, line.label));
		}
		// The band, broken where there were not values enough yet, and the values it would have fired on
		for (const side of [view.lower, view.upper]) {
			const known = index => side[index] !== null && side[index] !== undefined;
			const path = (side || []).map((value, index) => known(index) ? (index > 0 && known(index - 1) ? 'L' : 'M') + x(index).toFixed(1) + ',' + y(value).toFixed(1) : '').join(' ').trim();
			if (path) {
				chartElement.appendChild(svg('path', { class: 'band', d: path }));
			}
		}
		for (const index of view.fired || []) {
			chartElement.appendChild(svg('circle', { class: 'wouldFire', cx: x(index), cy: y(view.values[index]), r: 3 }));
		}
		const lastIndex = view.values.length - 1;
		chartElement.appendChild(svg('circle', { class: 'dot', cx: x(lastIndex), cy: y(view.values[lastIndex]), r: 3 }));
		if (fired) {
			let index = 0;
			while (index < lastIndex && view.times[index + 1] <= fired.time) {
				index++;
			}
			chartElement.appendChild(svg('circle', { class: 'firedDot ' + fired.severity, cx: x(index), cy: y(fired.value), r: 4.5 }));
			const time = new Date(fired.time).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
			chartElement.appendChild(svg('text', { class: 'firedLabel', x: x(index), y: y(fired.value) - 8, 'text-anchor': x(index) > width / 2 ? 'end' : 'start' }, time));
		}
		const cursor = svg('line', { class: 'cursor', y1: top, y2: height - bottom, visibility: 'hidden' });
		chartElement.appendChild(cursor);
		const caption = index => timeLabel(index) + ': ' + formatNumber(view.values[index]);
		chartCaption.textContent = caption(lastIndex);
		chartElement.onmousemove = event => {
			const box = chartElement.getBoundingClientRect();
			const index = Math.max(0, Math.min(lastIndex, Math.round((event.clientX - box.left - left) / (width - left - right) * lastIndex)));
			cursor.setAttribute('x1', String(x(index)));
			cursor.setAttribute('x2', String(x(index)));
			cursor.setAttribute('visibility', 'visible');
			chartCaption.textContent = caption(index);
		};
		chartElement.onmouseleave = () => {
			cursor.setAttribute('visibility', 'hidden');
			chartCaption.textContent = caption(lastIndex);
		};
	}
	new ResizeObserver(() => drawChart()).observe(chartElement);

	function updateForm() {
		drawChart();
		renderFilings();
		document.getElementById('halfLifeLabel').hidden = !usesDeviations();
		document.getElementById('halfLifeCell').hidden = !usesDeviations();
		if (filings()) {
			document.getElementById('conditionHint').textContent = TEXT.formsHint;
			addElement.disabled = scope === 'everyone' ? !phrase() : scope === 'company' ? !filer : !group;
			document.getElementById('feedNote').hidden = scope === 'company' || scope === 'everyone' || !!phrase();
			document.getElementById('search').disabled = !phrase() || (scope !== 'everyone' && !who());
			return;
		}
		// Publishes a New Value has no value to choose
		const newValue = economic() && conditionElement.value === 'newValue';
		const changesBy = economic() && conditionElement.value === 'changesBy';
		document.getElementById('conditionHint').textContent = (economic() ? TEXT.economicHints : TEXT.conditionHints)[conditionElement.value];
		const condition = conditionElement.value;
		const statisticalLabel = usesDeviations() ? TEXT.deviations : condition === 'beyondQuantile' ? TEXT.quantile : TEXT.window;
		document.getElementById('thresholdLabel').textContent = '3. ' + (statistical() ? statisticalLabel : percent() ? TEXT.percent : changesBy ? TEXT.change : TEXT.value);
		document.getElementById('thresholdLabel').hidden = newValue;
		document.getElementById('thresholdCell').hidden = newValue;
		const threshold = Number(thresholdElement.value);
		const halfLife = Number(halfLifeElement.value);
		// A quantile strictly between 0 and 100 and not the median, a high or low of two values at least, a half-life of one at least
		const statisticalInvalid = statistical() && (threshold <= 0 || (condition === 'beyondQuantile' && (threshold >= 100 || threshold === 50)) || (condition === 'newExtreme' && threshold < 2)
			|| (usesDeviations() && (!Number.isFinite(halfLife) || halfLife < 1)));
		addElement.disabled = !quote || (!newValue && (thresholdElement.value.trim() === '' || !Number.isFinite(threshold) || ((percent() || changesBy) && threshold <= 0) || statisticalInvalid));
		requestBacktest();
	}

	symbolElement.addEventListener('keydown', event => {
		if (event.key === 'Enter') {
			lookUp();
		}
	});
	symbolElement.addEventListener('input', () => {
		addedElement.hidden = true;
		if (symbolElement.value.trim().toUpperCase() !== lookedUp) {
			quote = undefined;
			filer = undefined;
			group = undefined;
			searched = undefined;
			quoteElement.textContent = '';
			updateForm();
		}
	});
	symbolElement.addEventListener('change', lookUp);
	document.getElementById('lookUp').addEventListener('click', lookUp);
	for (const radio of document.querySelectorAll('input[name="source"]')) {
		radio.addEventListener('change', () => setSource(radio.value));
	}
	for (const radio of document.querySelectorAll('input[name="scope"]')) {
		radio.addEventListener('change', () => setScope(radio.value));
	}
	for (const radio of document.querySelectorAll('input[name="economic"]')) {
		radio.addEventListener('change', () => setEconomicSource(radio.value));
	}
	// The source of an economic series: the hint of the field, and the look-up cleared
	function setEconomicSource(value) {
		economicSource = value;
		document.querySelector('input[name="economic"][value="' + value + '"]').checked = true;
		setScope('company');
	}
	document.getElementById('sicCodes').addEventListener('click', () => vscode.postMessage({ command: 'openUrl', url: 'https://www.sec.gov/search-filings/standard-industrial-classification-sic-code-list' }));
	// A change to what is searched for clears what Search found
	function clearSearched() {
		if (searched) {
			searched = undefined;
			quoteElement.textContent = '';
		}
	}
	formsElement.addEventListener('input', () => { clearSearched(); showItems(); renderFilings(); });
	itemsElement.addEventListener('change', () => { clearSearched(); renderFilings(); });
	containsElement.addEventListener('input', () => { clearSearched(); addedElement.hidden = true; updateForm(); });
	containsElement.addEventListener('keydown', event => {
		if (event.key === 'Enter') {
			search();
		}
	});
	document.getElementById('search').addEventListener('click', search);
	setContactElement.addEventListener('click', () => vscode.postMessage({ command: 'setContact' }));
	setFredKeyElement.addEventListener('click', () => vscode.postMessage({ command: 'setFredKey' }));
	conditionElement.addEventListener('change', () => { fillThreshold(); updateForm(); });
	thresholdElement.addEventListener('input', updateForm);
	halfLifeElement.addEventListener('input', updateForm);
	for (const radio of document.querySelectorAll('input[name="severity"]')) {
		radio.addEventListener('change', updateForm);
	}
	addElement.addEventListener('click', () => {
		if (addElement.disabled) {
			return;
		}
		if (filings()) {
			vscode.postMessage({
				command: 'addFilings',
				scope,
				company: who(),
				phrase: phrase(),
				forms: chosenForms(),
				items: chosenItems(),
				severity: document.querySelector('input[name="severity"]:checked').value,
				repeat: document.querySelector('input[name="repeat"]:checked').value === 'true',
				eventStudy: document.getElementById('eventStudy').checked,
			});
			addElement.disabled = true;
			return;
		}
		if (economic()) {
			vscode.postMessage({
				command: 'addSeries',
				source: economicSource,
				id: quote.symbol,
				condition: conditionElement.value,
				threshold: Number(thresholdElement.value),
				halfLife: usesDeviations() ? Number(halfLifeElement.value) : undefined,
				severity: document.querySelector('input[name="severity"]:checked').value,
				repeat: document.querySelector('input[name="repeat"]:checked').value === 'true',
			});
			addElement.disabled = true;
			return;
		}
		vscode.postMessage({
			command: 'add',
			symbol: quote.symbol,
			condition: conditionElement.value,
			threshold: Number(thresholdElement.value),
			halfLife: usesDeviations() ? Number(halfLifeElement.value) : undefined,
			severity: document.querySelector('input[name="severity"]:checked').value,
			repeat: document.querySelector('input[name="repeat"]:checked').value === 'true',
		});
		addElement.disabled = true;
	});
	document.getElementById('seeAlerts').addEventListener('click', () => vscode.postMessage({ command: 'showAlerts' }));
	document.getElementById('openFile').addEventListener('click', () => vscode.postMessage({ command: 'openFile' }));
	document.getElementById('markAllRead').addEventListener('click', () => vscode.postMessage({ command: 'markRead', ids: state.fired.filter(fired => fired.unread).map(fired => fired.id) }));
	document.getElementById('clearFired').addEventListener('click', () => vscode.postMessage({ command: 'clearFired' }));

	// The quote page: the value, its change since the previous close, and the day's and the year's ranges
	function renderQuote() {
		document.getElementById('quoteDetails').hidden = !quote;
		if (!quote) {
			return;
		}
		document.getElementById('quoteName').textContent = quote.name + ' (' + quote.symbol + ')';
		document.getElementById('quoteExchange').textContent = [quote.exchange, quote.currency].filter(Boolean).join(' \u00b7 ');
		document.getElementById('quoteValue').textContent = formatNumber(quote.value);
		const changeElement = document.getElementById('quoteChange');
		if (quote.previousClose) {
			const change = quote.value - quote.previousClose;
			const sign = change > 0 ? '+' : change < 0 ? '\u2212' : '';
			changeElement.textContent = sign + formatNumber(Math.abs(change)) + ' (' + sign + Math.abs(change / quote.previousClose * 100).toFixed(2) + '%)';
			changeElement.className = 'change' + (change > 0 ? ' up' : change < 0 ? ' down' : '');
		} else {
			changeElement.textContent = '';
		}
		document.getElementById('quoteAsOf').textContent = format(TEXT.asOf, new Date(quote.time).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }));
		const range = (low, high) => low !== undefined && high !== undefined ? formatNumber(low) + ' \u2013 ' + formatNumber(high) : undefined;
		const stats = [
			[TEXT.previousCloseLabel, quote.previousClose !== undefined ? formatNumber(quote.previousClose) : undefined],
			[TEXT.dayRange, range(quote.dayLow, quote.dayHigh)],
			[TEXT.yearRange, range(quote.yearLow, quote.yearHigh)],
			[TEXT.volume, quote.volume ? quote.volume.toLocaleString(undefined, { notation: 'compact', maximumFractionDigits: 2 }) : undefined],
		];
		const statsElement = document.getElementById('quoteStats');
		statsElement.replaceChildren();
		for (const [label, value] of stats) {
			if (value !== undefined) {
				statsElement.append(element('span', 'label', label), element('span', '', value));
			}
		}
	}
	document.getElementById('quoteLookUp').addEventListener('click', lookUp);
	document.getElementById('addFor').addEventListener('click', () => quote && vscode.postMessage({ command: 'addFor', symbol: quote.symbol }));
	document.getElementById('openYahoo').addEventListener('click', () => quote && vscode.postMessage({ command: 'openYahoo', symbol: quote.symbol }));
	document.getElementById('quoteYourAlerts').addEventListener('click', () => vscode.postMessage({ command: 'showAlerts' }));
	// The quote page, and an open panel of the Alerts page, look the value and the chart up again every minute while shown
	let refreshing = false;
	setInterval(() => {
		if (KIND !== 'add' && quote && document.visibilityState === 'visible') {
			refreshing = true;
			vscode.postMessage({ command: 'lookUp', symbol: quote.symbol });
		}
	}, 60000);

	// Opens the panel of an alert or a fired alert under its row, or closes it when it is the one open
	const layoutElement = document.getElementById('layout');
	function toggle(entry) {
		refreshing = false;
		if (expanded && expanded.id === entry.id) {
			expanded = undefined;
			quote = undefined;
			lookedUp = '';
			layoutElement.hidden = true;
			render();
			return;
		}
		expanded = entry;
		quote = undefined;
		renderQuote();
		drawChart();
		// A fired alert's chart reaches back to when it fired
		const age = entry.fired ? Date.now() - entry.fired.time : 0;
		const day = 24 * 60 * 60 * 1000;
		chartRange = age < day ? '1d' : age < 5 * day ? '5d' : age < 30 * day ? '1mo' : '6mo';
		symbolElement.value = entry.symbol;
		lookedUp = '';
		lookUp();
		layoutElement.hidden = false;
		render();
	}
	// Puts the open panel under its row, or closes it when its alert is gone
	function placePanel() {
		if (KIND !== 'alerts' || !expanded) {
			return;
		}
		const row = document.querySelector('.entry[data-key="' + expanded.id + '"]');
		if (!row) {
			expanded = undefined;
			quote = undefined;
			lookedUp = '';
			layoutElement.hidden = true;
			return;
		}
		row.classList.add('expanded');
		row.after(layoutElement);
	}

	function render() {
		if (layoutElement.parentElement && layoutElement.parentElement.classList.contains('list')) {
			document.querySelector('.container').appendChild(layoutElement);
		}
		const alertsElement = document.getElementById('alerts');
		alertsElement.replaceChildren();
		if (!state.alerts.length) {
			alertsElement.appendChild(element('div', 'empty', TEXT.noAlerts));
		}
		for (const alert of state.alerts) {
			const row = element('div', 'entry ' + alert.severity + (alert.paused ? ' paused' : ''));
			row.dataset.key = alert.id;
			const textElement = element('div', 'text');
			textElement.appendChild(element('div', 'name', alert.name + ' ' + alert.condition));
			textElement.appendChild(element('div', 'meta', alert.value + ' \\u00b7 ' + (alert.repeat ? TEXT.everyTime : TEXT.once) + (alert.paused ? ' \\u00b7 ' + TEXT.paused : '')));
			row.appendChild(textElement);
			const actions = element('div', 'actions');
			// A quote opens under the alert; filings, at the SEC; a series, at its source
			const open = element('button', 'link', alert.filings ? TEXT.edgar : alert.economic || alert.symbol);
			open.title = alert.filings ? TEXT.openEdgarHint : alert.economic ? TEXT.openSeriesHint : TEXT.openQuote;
			open.addEventListener('click', () => alert.filings || alert.economic ? vscode.postMessage({ command: 'openUrl', url: alert.url }) : toggle({ id: alert.id, symbol: alert.symbol }));
			const pause = element('button', 'link', alert.paused ? TEXT.resume : TEXT.pause);
			pause.addEventListener('click', () => vscode.postMessage({ command: 'pause', id: alert.id, paused: !alert.paused }));
			const remove = element('button', 'link', TEXT.remove);
			remove.addEventListener('click', () => vscode.postMessage({ command: 'remove', id: alert.id }));
			// On filings: whether an event study starts when it fires
			if (alert.filings) {
				const auto = element('label', 'choice');
				auto.title = TEXT.autoStudyHint;
				const checkbox = element('input');
				checkbox.type = 'checkbox';
				checkbox.checked = alert.eventStudy;
				checkbox.addEventListener('change', () => vscode.postMessage({ command: 'setEventStudy', id: alert.id, eventStudy: checkbox.checked }));
				auto.append(checkbox, TEXT.autoStudyRow);
				actions.appendChild(auto);
			}
			// Several companies have no one page at the SEC, and the IMF's series none to link to
			if ((alert.filings || alert.economic) && !alert.url) {
				open.hidden = true;
			}
			actions.append(open, pause, remove);
			row.appendChild(actions);
			alertsElement.appendChild(row);
		}

		const firedElement = document.getElementById('fired');
		firedElement.replaceChildren();
		if (!state.fired.length) {
			firedElement.appendChild(element('div', 'empty', TEXT.noneFired));
		}
		for (const fired of state.fired) {
			const row = element('div', 'entry ' + fired.severity + (fired.unread ? '' : ' read'));
			row.dataset.key = fired.id;
			const textElement = element('div', 'text');
			textElement.appendChild(element('div', 'name', fired.text));
			textElement.appendChild(element('div', 'meta', fired.when));
			row.appendChild(textElement);
			const actions = element('div', 'actions');
			const open = element('button', 'link', fired.filingUrl ? TEXT.openFiling : fired.economic || fired.symbol);
			open.title = fired.filingUrl ? fired.filingUrl : fired.economic ? TEXT.openSeriesHint : TEXT.openQuote;
			open.hidden = !!fired.economic && !fired.seriesUrl;
			open.addEventListener('click', () => {
				if (fired.unread) {
					vscode.postMessage({ command: 'markRead', ids: [fired.id] });
				}
				if (fired.filingUrl || fired.economic) {
					vscode.postMessage({ command: 'openUrl', url: fired.filingUrl || fired.seriesUrl });
					return;
				}
				toggle({ id: fired.id, symbol: fired.symbol, alertId: fired.alertId, fired });
			});
			actions.appendChild(open);
			if (fired.study || fired.canStudy) {
				const study = element('button', 'link', fired.study ? TEXT.openStudy : TEXT.startStudy);
				if (!fired.study) {
					study.title = TEXT.startStudyHint;
				}
				study.addEventListener('click', () => vscode.postMessage({ command: 'eventStudy', alertId: fired.alertId, folder: fired.study }));
				actions.appendChild(study);
			}
			if (fired.unread) {
				const read = element('button', 'link', TEXT.markRead);
				read.addEventListener('click', () => vscode.postMessage({ command: 'markRead', ids: [fired.id] }));
				actions.appendChild(read);
			}
			const dismiss = element('button', 'link', TEXT.dismiss);
			dismiss.title = TEXT.dismissHint;
			dismiss.addEventListener('click', () => vscode.postMessage({ command: 'dismiss', id: fired.id }));
			actions.appendChild(dismiss);
			row.appendChild(actions);
			firedElement.appendChild(row);
		}
		document.getElementById('markAllRead').hidden = !state.fired.some(fired => fired.unread);
		document.getElementById('clearFired').hidden = !state.fired.length;
		placePanel();
	}

	// The alert whose panel the Welcome page asked to open, once the alerts are known
	let openingAlert;
	function openAlert() {
		const alert = openingAlert && state.alerts.find(alert => alert.id === openingAlert);
		if (!alert) {
			return;
		}
		openingAlert = undefined;
		if (!alert.filings && !alert.economic && (!expanded || expanded.id !== alert.id)) {
			toggle({ id: alert.id, symbol: alert.symbol });
		}
		document.querySelector('.entry[data-key="' + alert.id + '"]').scrollIntoView({ block: 'nearest' });
	}

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			state = message;
			render();
			openAlert();
			if (KIND !== 'add') {
				drawChart();
			}
		} else if (message.command === 'quote') {
			if (message.symbol !== lookedUp) {
				return;
			}
			if (refreshing) {
				// A refresh keeps the chart shown until the new one comes, and the last quote if Yahoo does not answer
				refreshing = false;
				if (message.quote) {
					quote = message.quote;
					renderQuote();
					vscode.postMessage({ command: 'chart', symbol: quote.symbol, range: chartRange });
				}
				return;
			}
			quote = message.quote;
			quoteElement.className = quote ? 'quote' : 'quote error';
			quoteElement.textContent = quote ? '' : format(TEXT.unknown, message.symbol);
			if (!quote) {
				lookedUp = '';
			}
			fillThreshold();
			updateForm();
			renderQuote();
			if (quote) {
				requestChart();
			}
		} else if (message.command === 'backtest') {
			if (backtest && backtest.key === message.key) {
				backtest = { ...backtest, result: message.result, problem: message.problem, done: true };
				drawChart();
			}
		} else if (message.command === 'series') {
			if (message.id !== lookedUp || !economic() || message.source !== economicSource) {
				return;
			}
			const series = message.series;
			const observations = series ? series.observations : [];
			const latest = observations[observations.length - 1];
			// The series as a quote, its latest value and the change from the one before, and its values as the chart
			quote = latest ? {
				symbol: series.id,
				name: series.title,
				value: latest.value,
				lastChange: observations.length > 1 ? latest.value - observations[observations.length - 2].value : undefined,
			} : undefined;
			quoteElement.className = quote ? 'quote' : 'quote error';
			quoteElement.textContent = quote
				? [format(TEXT.seriesLatest, formatNumber(latest.value), latest.period), series.frequency, series.units].filter(text => text).join(' \u00b7 ')
				: message.noKey ? TEXT.noFredKey : format(TEXT.seriesUnknown, TEXT.economicSources[message.source], message.id);
			setFredKeyElement.hidden = !message.noKey;
			if (!quote) {
				lookedUp = '';
			}
			chart = quote ? { times: observations.map((observation, index) => index), labels: observations.map(observation => observation.period), values: observations.map(observation => observation.value) } : undefined;
			fillThreshold();
			updateForm();
		} else if (message.command === 'filer') {
			if (message.company !== lookedUp || !filings()) {
				return;
			}
			filer = message.filer;
			quoteElement.className = filer ? 'quote' : 'quote error';
			quoteElement.textContent = filer ? '' : message.noContact ? TEXT.noContact : format(TEXT.filerUnknown, message.company);
			setContactElement.hidden = !message.noContact;
			if (!filer) {
				lookedUp = '';
			}
			updateForm();
		} else if (message.command === 'companies' || message.command === 'industry') {
			const key = message.command === 'companies' ? message.companies : message.sic;
			if (key !== lookedUp || !filings() || scope !== (message.command === 'companies' ? 'companies' : 'industry')) {
				return;
			}
			const found = message.command === 'companies' ? message.found && message.found.length && message.found : message.industry;
			group = found ? { key: message.command === 'companies' ? message.found.map(company => company.cik).join(',') : message.industry.sic } : undefined;
			quoteElement.className = group ? 'quote' : 'quote error';
			quoteElement.textContent = message.noContact ? TEXT.noContact
				: message.command === 'industry'
					? group ? format(TEXT.industryFound, message.industry.name, message.industry.sic, message.industry.count.toLocaleString()) : format(TEXT.industryUnknown, message.sic)
					: [group ? format(TEXT.companiesFound, message.found.length, message.found.map(company => company.name).join(', ')) : '', message.unknown && message.unknown.length ? format(TEXT.companiesUnknown, message.unknown.join(', ')) : (group ? '' : format(TEXT.filerUnknown, message.companies))].filter(text => text).join('. ');
			setContactElement.hidden = !message.noContact;
			if (!group) {
				lookedUp = '';
			}
			updateForm();
		} else if (message.command === 'searched') {
			if (!searched || message.phrase.trim() !== searched.phrase) {
				return;
			}
			searched = message;
			quoteElement.className = message.noContact ? 'quote error' : 'quote';
			quoteElement.textContent = message.noContact ? TEXT.noContact : '';
			setContactElement.hidden = !message.noContact;
			renderFilings();
		} else if (message.command === 'contactSet') {
			lookedUp = '';
			lookUp();
		} else if (message.command === 'chart') {
			if (!quote || message.symbol !== quote.symbol || message.range !== chartRange) {
				return;
			}
			if (economic()) {
				return;
			}
			chart = message.chart || { times: [], values: [] };
			drawChart();
		} else if (message.command === 'added') {
			document.getElementById('addedText').textContent = message.text;
			addedElement.hidden = false;
			symbolElement.value = '';
			lookedUp = '';
			quote = undefined;
			filer = undefined;
			group = undefined;
			searched = undefined;
			containsElement.value = '';
			quoteElement.textContent = '';
			fillThreshold();
			updateForm();
		} else if (message.command === 'show') {
			if (message.section === 'add' || message.section === 'quote') {
				// Asked for with a symbol, the form is the one of its kind: a quote, a company's filings, or a series of a source
				const kindOf = message.economic ? 'economic' : message.filings ? 'filings' : 'quote';
				if (KIND === 'add' && message.symbol && kindOf !== source) {
					setSource(kindOf);
				}
				if (KIND === 'add' && message.symbol && message.economic && message.economic !== economicSource) {
					setEconomicSource(message.economic);
				} else if (KIND === 'add' && message.symbol && message.filings && scope !== 'company') {
					setScope('company');
				}
				if (message.symbol) {
					symbolElement.value = message.symbol;
					lookUp();
				}
				symbolElement.focus();
			} else if (message.section === 'fired') {
				document.getElementById('firedSection').scrollIntoView({ block: 'start' });
			} else {
				window.scrollTo(0, 0);
				openingAlert = message.alertId;
				openAlert();
			}
		}
	});
	updateForm();
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: ADD_ALERT_COMMAND_ID,
			title: localize2('alerts.addAction', "Add Alert..."),
			category: localize2('alerts.category', "Explore"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor, symbol?: string, source?: 'filings' | EconomicSource): void {
		const economic = ECONOMIC_SOURCES.find(economic => economic === source);
		openAlertsPage(accessor, { section: 'add', symbol: typeof symbol === 'string' ? symbol.trim().toUpperCase() : undefined, filings: source === 'filings', economic });
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: SHOW_ALERTS_COMMAND_ID,
			title: localize2('alerts.showAction', "Alerts"),
			category: localize2('alerts.category', "Explore"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor, alertId?: string): void {
		openAlertsPage(accessor, { section: 'alerts', alertId: typeof alertId === 'string' ? alertId : undefined });
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: SHOW_FIRED_ALERTS_COMMAND_ID,
			title: localize2('alerts.showFiredAction', "Fired Alerts"),
			category: localize2('alerts.category', "Explore"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): void {
		openAlertsPage(accessor, { section: 'fired' });
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: SHOW_QUOTE_COMMAND_ID,
			title: localize2('alerts.showQuoteAction', "Quote..."),
			category: localize2('alerts.category', "Explore"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor, symbol?: string): void {
		openAlertsPage(accessor, { section: 'quote', symbol: typeof symbol === 'string' ? symbol.trim().toUpperCase() : undefined });
	}
});
