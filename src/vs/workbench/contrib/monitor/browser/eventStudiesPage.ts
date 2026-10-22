/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IntervalTimer } from '../../../../base/common/async.js';
import { safeIntl } from '../../../../base/common/date.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { basename, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { ADD_ALERT_COMMAND_ID } from './alertsPage.js';
import { OPEN_LINK_COMMAND_ID } from './openLink.js';
import { describeCondition, describeSubject, IMinuteBar, IAlertsService } from './alertsService.js';
import { parseCsv } from './csv.js';
import { DEFAULT_BENCHMARK, DEFAULT_EVENT_PERIOD, EventModel, EventSource, EventStatus, EventTime, eventTime, IEventPeriod, IEventStudiesService, IEventStudy, IPanelResults, IPanelSettings, IStudyEvent, PANEL_ESTIMATORS, PanelEstimator, SHOW_EVENT_STUDIES_COMMAND_ID } from './eventStudiesService.js';
import { DEFAULT_FOMC_INSTRUMENTS, describeInstrument, describeRelease, FOMC_INSTRUMENTS, FOMC_PERIOD, FOMC_RELEASES, FomcRelease, instrumentMove, instrumentScale, instrumentSymbol, instrumentUnit } from './fomcReleases.js';
import { ICoverageItem, IMediaCoverageRequest, newsName } from './mediaCoverageService.js';
import { SHOW_MEDIA_COVERAGE_COMMAND_ID } from './mediaCoveragePage.js';

// Compose > Workflows > Event Studies...: a page to make an event study of the filings an alert fires (its title, the
// alert, the benchmark, the model, the event time and the periods), or of the FOMC's releases (the releases and the
// instruments), the studies made, and, for the one chosen, the cumulative average abnormal return around its events
// with its 95% band, drawn as the prices come in, the articles about them under it, and its events with their
// newswire release and EDGAR's acceptance; for FOMC releases, each instrument's average move and its move at each. Or
// a panel event study of a table of units over time (its columns and estimators), and its results: the effects by
// event time of each estimator with their 95% intervals, and its tests and estimates.

const MINUTE = 60_000;
// A minute's bar is complete a little after it ends
const SETTLE_MILLISECONDS = 2 * MINUTE;
// The fewest minute returns the market model's alpha and beta are estimated on
const MIN_ESTIMATION_RETURNS = 30;
// What PollisEventStudies.jl can group the filings by
const GROUP_BY = ['form', 'item', 'session', 'ticker'];
// The hour and the day in New York, where the market is
const newYorkHour = safeIntl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', hourCycle: 'h23' });
const newYorkDay = safeIntl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });

type EventStudiesMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'select'; readonly folder: string }
	| { readonly command: 'create'; readonly title: string; readonly source: EventSource; readonly alert: string; readonly releases: readonly FomcRelease[]; readonly instruments: readonly string[]; readonly benchmark: string; readonly model: EventModel; readonly eventTime: EventTime; readonly estimationDays: number; readonly periods: readonly IEventPeriod[]; readonly groupBy: string; readonly panel?: IPanelForm }
	| { readonly command: 'chooseData' }
	| { readonly command: 'addAlert' }
	| { readonly command: 'openUrl'; readonly url: string }
	| { readonly command: 'mediaCoverage'; readonly folder: string; readonly accession: string }
	| { readonly command: 'openFolder'; readonly folder: string }
	| { readonly command: 'openStudyFile'; readonly folder: string }
	| { readonly command: 'openNotebook'; readonly folder: string };

const DAY = 24 * 60 * 60 * 1000;
// The start of a panel study's table that is read for its columns and a preview
const DATA_SAMPLE_BYTES = 2_000_000;
const PREVIEW_ROWS = 5;

/** A panel study as the form gives it: its columns, its estimators and their keywords. */
interface IPanelForm {
	readonly unit: string;
	readonly time: string;
	readonly outcome: string;
	readonly treatedBy: 'treatment' | 'cohort';
	readonly treated: string;
	readonly estimators: readonly string[];
	readonly leads: number;
	readonly lags: number;
	readonly control: string;
	readonly method: string;
	readonly effect: string;
	readonly estimand: string;
	/** For a TATE, [first, last] or none for all; for a PTE, [one]. */
	readonly exposure: readonly number[];
	readonly family: string;
	readonly trials: string;
	readonly individual: string;
}

/** An estimator's effects by event time, with their 95% intervals, as the page draws them. */
interface IPanelSeries {
	readonly key: string;
	readonly name: string;
	readonly points: readonly { readonly x: number; readonly effect: number; readonly low: number | null; readonly high: number | null }[];
}

/** The cumulative abnormal returns of a study's events over a window, a value a minute, and their average with its 95% band. */
interface IWindowCurves {
	/** Minutes from the event's time, or from the next open. */
	readonly minutes: readonly number[];
	/** Per event, in the order of the events: the cumulative abnormal return in per cent, null where it is not known (yet). */
	readonly cars: readonly (readonly (number | null)[])[];
	readonly caar: readonly (number | null)[];
	readonly lower: readonly (number | null)[];
	readonly upper: readonly (number | null)[];
	readonly counts: readonly number[];
}

let openPage: { readonly input: WebviewInput; readonly select: (folder: string | undefined, alertId?: string) => void } | undefined;

/** Opens the page on the study in `folder`, or with the alert `alertId` chosen for a new study. */
function openEventStudiesPage(accessor: ServicesAccessor, folder: string | undefined, alertId: string | undefined): void {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const eventStudiesService = accessor.get(IEventStudiesService);
	const alertsService = accessor.get(IAlertsService);
	const editorService = accessor.get(IEditorService);
	const commandService = accessor.get(ICommandService);
	const fileDialogService = accessor.get(IFileDialogService);
	const fileService = accessor.get(IFileService);

	if (openPage && !openPage.input.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage.input, openPage.input.group ?? -1, false);
		openPage.select(folder, alertId);
		return;
	}
	const title = localize('eventStudies.title', "Event Studies");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.eventStudies',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());

	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));

	let ready = false;
	let selected = folder;
	// The alert chosen for a new study, once the page is ready
	let choosing = alertId;
	// The prices of a study come in every minute, read again only for the study shown, one reading at a time
	let sending = Promise.resolve();
	// The table chosen for a new panel study
	let chosenData: URI | undefined;

	const sendState = () => {
		const studies = eventStudiesService.getStudies();
		if (!selected || !studies.some(study => study.folder === selected)) {
			selected = studies[studies.length - 1]?.folder;
		}
		const alerts = alertsService.getAlerts().filter(alert => alert.condition === 'newFiling');
		webviewInput.webview.postMessage({
			command: 'state',
			selected,
			alerts: alerts.map(alert => ({ id: alert.id, label: localize('eventStudies.alertLabel', "{0}: {1}", describeSubject(alert), describeCondition(alert)), name: describeSubject(alert) })),
			studies: studies.map(study => {
				const events = eventStudiesService.getEvents(study.folder);
				const alert = alertsService.getAlerts().find(alert => alert.id === study.alert);
				const capturing = events.filter(event => event.status === 'capturing' || event.status === 'waiting').length;
				const fomc = study.source === 'fomc';
				if (study.panel) {
					return { folder: study.folder, title: study.title, alert: describePanel(study.panel), meta: study.panel.estimators.map(describeEstimator).join(', ') };
				}
				return {
					folder: study.folder,
					title: study.title,
					alert: fomc
						? describeReleases(study)
						: alert ? localize('eventStudies.alertLabel', "{0}: {1}", describeSubject(alert), describeCondition(alert)) : localize('eventStudies.alertRemoved', "Its alert was removed: no new events"),
					meta: !study.backfilled
						? fomc ? localize('eventStudies.readingFeed', "Reading the Federal Reserve's feed...") : localize('eventStudies.backfilling', "Looking for the filings of the 30 days before it was made...")
						: capturing
							? localize('eventStudies.eventsCapturing', "{0} events, {1} still capturing prices", events.length, capturing)
							: localize('eventStudies.events', "{0} events", events.length),
				};
			}),
		});
	};

	const sendStudy = () => {
		sending = sending.then(async () => {
			const study = eventStudiesService.getStudies().find(study => study.folder === selected);
			if (!study || !ready) {
				return;
			}
			if (study.panel) {
				await sendPanel(study, study.panel);
				return;
			}
			const events = eventStudiesService.getEvents(study.folder);
			if (study.source === 'fomc') {
				await sendReleases(study, events);
				return;
			}
			const prices = await Promise.all(events.map(event => event.ticker ? eventStudiesService.getPrices(study.folder, event.accession) : Promise.resolve(new Map<string, readonly IMinuteBar[]>())));
			const news = await Promise.all(events.map(event => eventStudiesService.getNews(study.folder, event.accession)));
			const now = Date.now();
			const times = events.map(event => eventTime(study, event));
			const opens = events.map(event => !event.duringSession ? event.nextOpen : undefined);
			// The other of the two times, as minutes from the event's: EDGAR's acceptance after the release, or the release before the acceptance
			const others = events.map((event, index) => {
				const other = study.eventTime === 'firstPublic' ? event.accepted : event.released;
				const time = times[index];
				return other !== undefined && time !== undefined ? Math.round((other - time) / MINUTE) : undefined;
			});
			const curves = study.periods.map(period => {
				const perEvent = events.map((event, index) => eventCurves(study, period, event, prices[index], now));
				return {
					name: period.name,
					nextOpen: period.nextOpen,
					filing: averageCurves(perEvent.map(curves => curves.filing), period.before, period.after, -period.before),
					open: period.nextOpen ? averageCurves(perEvent.map(curves => curves.open), 0, period.after, 0) : undefined,
					betas: perEvent.map(curves => curves.beta ?? null),
					others: [...new Set(others.filter((minute): minute is number => minute !== undefined && minute !== 0 && minute >= -period.before && minute <= period.after))],
					filingArticles: articleCounts(times, news, -period.before, period.after),
					openArticles: period.nextOpen ? articleCounts(opens, news, 0, period.after) : undefined,
				};
			});
			const when = (time: number) => new Date(time).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
			webviewInput.webview.postMessage({
				command: 'study',
				folder: study.folder,
				title: study.title,
				info: localize('eventStudies.info', "Benchmark {0}; {1}; {2}; made {3}", study.benchmark, describeModel(study), describeEventTime(study.eventTime), new Date(study.created).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })),
				capped: !!study.backfillCapped,
				backfilled: study.backfilled,
				marketModel: study.model === 'marketModel',
				firstPublic: study.eventTime === 'firstPublic',
				events: events.map((event, index) => ({
					name: event.name,
					ticker: event.ticker ?? '',
					form: event.items?.length ? `${event.form} ${event.items.join(', ')}` : event.form,
					accepted: event.accepted !== undefined ? when(event.accepted) : event.filed,
					released: event.released !== undefined ? when(event.released) : event.newsChecked !== undefined ? localize('eventStudies.noRelease', "None found") : '',
					releaseWire: event.releaseWire ?? '',
					releaseTitle: event.releaseTitle ?? '',
					releaseUrl: event.releaseUrl ?? '',
					lead: describeLead(event),
					session: describeSession(event, times[index]),
					status: describeStatus(event.status, study),
					capturing: event.status === 'capturing' || event.status === 'waiting',
					url: event.url,
					accession: event.accession,
				})),
				curves,
			});
		});
	};

	const sendReleases = async (study: IEventStudy, events: readonly IStudyEvent[]) => {
		const prices = await Promise.all(events.map(event => eventStudiesService.getPrices(study.folder, event.accession)));
		const now = Date.now();
		const when = (time: number | undefined) => time !== undefined ? new Date(time).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
		webviewInput.webview.postMessage({
			command: 'study',
			folder: study.folder,
			title: study.title,
			fomc: true,
			info: localize('eventStudies.fomcInfo', "{0}; made {1}", describeReleases(study), when(study.created)),
			capped: false,
			backfilled: study.backfilled,
			instruments: study.instruments.map(code => ({ code, label: describeInstrument(code), unit: instrumentUnit(code) })),
			curves: study.periods.map(period => ({
				name: period.name,
				instruments: study.instruments.map(code => averageCurves(events.map((event, index) => releaseCurve(period, code, event, prices[index], now)), period.before, period.after, -period.before)),
			})),
			events: events.map(event => ({
				time: when(event.accepted),
				title: event.name,
				kinds: event.form.split(' ').filter(kind => (FOMC_RELEASES as readonly string[]).includes(kind)).map(kind => describeRelease(kind as FomcRelease)).join(', '),
				bars: event.barMinutes === 5 ? localize('eventStudies.fiveMinutes', "5 min") : localize('eventStudies.oneMinute', "1 min"),
				status: describeStatus(event.status, study),
				capturing: event.status === 'capturing' || event.status === 'waiting',
				url: event.url,
				accession: event.accession,
			})),
		});
	};

	const sendPanel = async (study: IEventStudy, panel: IPanelSettings) => {
		const results = await eventStudiesService.getPanelResults(study.folder);
		const when = (time: number) => new Date(time).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
		webviewInput.webview.postMessage({
			command: 'study',
			folder: study.folder,
			title: study.title,
			panel: true,
			info: localize('eventStudies.panelInfo', "{0}; {1}; made {2}", describePanel(panel), panel.estimators.map(describeEstimator).join(', '), when(study.created)),
			capped: false,
			backfilled: true,
			written: results ? localize('eventStudies.resultsWritten', "Results written {0} by the notebook", when(results.written)) : '',
			series: results ? panelSeries(results) : [],
			lines: results ? panelLines(results) : [],
		});
	};

	const select = (folder: string | undefined, alertId?: string) => {
		if (folder) {
			selected = folder;
		}
		if (alertId) {
			choosing = alertId;
		}
		if (ready) {
			sendState();
			sendStudy();
			if (choosing) {
				webviewInput.webview.postMessage({ command: 'chooseAlert', alert: choosing });
				choosing = undefined;
			}
		}
	};
	openPage = { input: webviewInput, select };

	disposables.add(eventStudiesService.onDidChange(() => select(undefined)));
	disposables.add(alertsService.onDidChange(() => ready && sendState()));
	// Another window may be the one capturing the prices: they are read again every minute while the study shown has events capturing
	disposables.add(new IntervalTimer()).cancelAndSet(() => {
		if (ready && selected && eventStudiesService.getEvents(selected).some(event => event.status === 'capturing' || event.status === 'waiting')) {
			sendStudy();
		}
	}, MINUTE);

	disposables.add(webviewInput.webview.onMessage(async (e: { message: EventStudiesMessage }) => {
		const message = e.message;
		switch (message.command) {
			case 'ready':
				ready = true;
				select(undefined);
				break;
			case 'select':
				select(message.folder);
				break;
			case 'chooseData': {
				const files = await fileDialogService.showOpenDialog({
					title: localize('eventStudies.chooseDataTitle', "Choose the Panel's Table"),
					canSelectFiles: true,
					canSelectFolders: false,
					canSelectMany: false,
					defaultUri: await fileDialogService.defaultFilePath(),
					filters: [{ name: 'CSV', extensions: ['csv'] }],
				});
				if (!files?.length) {
					break;
				}
				const sample = await readSample(fileService, files[0]);
				chosenData = sample ? files[0] : undefined;
				webviewInput.webview.postMessage({ command: 'data', name: basename(files[0]), ...sample ?? { columns: [], preview: [], binary: [] } });
				break;
			}
			case 'create': {
				if (message.source === 'panel') {
					const panel = message.panel && panelSettings(message.panel);
					if (!chosenData || !panel) {
						break;
					}
					const study = await eventStudiesService.createStudy({
						title: message.title.trim() || localize('eventStudies.panelUntitled', "Panel Event Study"),
						source: 'panel', alert: '', releases: [], instruments: [], benchmark: '', model: 'marketAdjusted', eventTime: 'accepted', estimationDays: 5, periods: [], panel,
					}, chosenData);
					chosenData = undefined;
					select(study.folder);
					webviewInput.webview.postMessage({ command: 'created', folder: study.folder });
					break;
				}
				const periods = message.periods
					.map(period => ({ name: period.name.trim(), before: Math.max(0, Math.round(Number(period.before) || 0)), after: Math.max(1, Math.round(Number(period.after) || 0)), nextOpen: !!period.nextOpen }))
					.filter(period => period.name);
				const fomc = message.source === 'fomc';
				const study = await eventStudiesService.createStudy({
					title: message.title.trim() || localize('eventStudies.untitled', "Event Study"),
					source: fomc ? 'fomc' : 'filings',
					alert: fomc ? '' : message.alert,
					releases: fomc ? FOMC_RELEASES.filter(release => message.releases.includes(release)) : [],
					instruments: fomc ? FOMC_INSTRUMENTS.map(instrument => instrument.code).filter(code => message.instruments.includes(code)) : [],
					benchmark: message.benchmark.trim().toUpperCase() || DEFAULT_BENCHMARK,
					model: message.model === 'marketModel' ? 'marketModel' : 'marketAdjusted',
					eventTime: message.eventTime === 'accepted' || fomc ? 'accepted' : 'firstPublic',
					estimationDays: Math.min(20, Math.max(1, Math.round(message.estimationDays) || 5)),
					periods: periods.length ? periods.map(period => fomc ? { ...period, nextOpen: false } : period) : [fomc ? FOMC_PERIOD : DEFAULT_EVENT_PERIOD],
					groupBy: !fomc && GROUP_BY.includes(message.groupBy) ? message.groupBy : undefined,
				});
				select(study.folder);
				webviewInput.webview.postMessage({ command: 'created', folder: study.folder });
				break;
			}
			case 'addAlert':
				await commandService.executeCommand(ADD_ALERT_COMMAND_ID, undefined, 'filings');
				break;
			case 'openUrl':
				// Only the SEC's pages, the filings at EDGAR, the Federal Reserve's releases, and the newswire releases the studies found
				if (message.url.startsWith('https://www.sec.gov/') || message.url.startsWith('https://www.federalreserve.gov/') || eventStudiesService.getStudies().some(study => eventStudiesService.getEvents(study.folder).some(event => event.releaseUrl === message.url))) {
					await commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
				}
				break;
			case 'mediaCoverage': {
				// The news from a day before the event to a day after, with the study's kind of event marked
				const study = eventStudiesService.getStudies().find(study => study.folder === message.folder);
				const event = study && eventStudiesService.getEvents(study.folder).find(event => event.accession === message.accession);
				const time = study && event && eventTime(study, event);
				if (!study || !event || time === undefined) {
					break;
				}
				const request: IMediaCoverageRequest = study.source === 'fomc'
					? { words: '"FOMC" OR "Federal Reserve"', start: time - DAY, end: time + DAY, marks: 'fomc' }
					: { words: newsName(event.name), ticker: event.ticker, start: time - DAY, end: time + DAY, marks: event.ticker ? 'filings' : 'time', time };
				await commandService.executeCommand(SHOW_MEDIA_COVERAGE_COMMAND_ID, request);
				break;
			}
			case 'openFolder':
				await commandService.executeCommand('revealFileInOS', joinPath(eventStudiesService.studiesFolder, message.folder, 'study.toml'));
				break;
			case 'openNotebook':
				await editorService.openEditor({ resource: await eventStudiesService.getNotebook(message.folder) });
				break;
			case 'openStudyFile':
				await editorService.openEditor({ resource: joinPath(eventStudiesService.studiesFolder, message.folder, 'study.toml') });
				break;
		}
	}));
}

/** The start of a panel's table: its columns, its first rows, and the columns whose values there are all 0 or 1; undefined when it is not a table. */
async function readSample(fileService: IFileService, file: URI): Promise<{ readonly columns: readonly string[]; readonly preview: readonly (readonly string[])[]; readonly binary: readonly string[] } | undefined> {
	let content: string;
	try {
		const read = await fileService.readFile(file, { length: DATA_SAMPLE_BYTES });
		content = read.value.toString();
		// A table longer than the sample: its last row may be cut
		if (read.value.byteLength >= DATA_SAMPLE_BYTES) {
			content = content.slice(0, content.lastIndexOf('\n') + 1);
		}
	} catch {
		return undefined;
	}
	const [header, ...rows] = parseCsv(content).filter(row => row.some(field => field.trim() !== ''));
	if (!header || header.length < 3 || !rows.length) {
		return undefined;
	}
	const columns = header.map(column => column.trim());
	const binary = columns.filter((_, index) => rows.every(row => ['0', '1', 'true', 'false'].includes((row[index] ?? '').trim())));
	return { columns, preview: rows.slice(0, PREVIEW_ROWS), binary };
}

/** A panel study's settings from the form; undefined when a column is missing, or the stepped wedge has no treatment column. */
function panelSettings(form: IPanelForm): IPanelSettings | undefined {
	const estimators = PANEL_ESTIMATORS.filter(estimator => form.estimators.includes(estimator));
	const wedge = estimators.includes('stepped_wedge');
	if (!form.unit || !form.time || !form.outcome || !form.treated || !estimators.length || (wedge && form.treatedBy !== 'treatment')) {
		return undefined;
	}
	const count = (value: number, fallback: number) => Number.isFinite(value) ? Math.min(50, Math.max(0, Math.round(value))) : fallback;
	const exposure = form.exposure.filter(value => Number.isInteger(value));
	const pte = form.estimand === 'PTE';
	if (wedge && pte && exposure.length !== 1) {
		return undefined;
	}
	const leads = estimators.some(estimator => estimator !== 'stepped_wedge');
	return {
		data: 'panel.csv',
		unit: form.unit,
		time: form.time,
		outcome: form.outcome,
		cohort: form.treatedBy === 'cohort' ? form.treated : undefined,
		treatment: form.treatedBy === 'treatment' ? form.treated : undefined,
		estimators,
		leads: leads ? count(form.leads, 5) : undefined,
		lags: leads ? count(form.lags, 5) : undefined,
		control: estimators.includes('callaway_santanna') && ['never', 'notyet', 'last', 'auto'].includes(form.control) ? form.control : undefined,
		method: estimators.includes('callaway_santanna') && ['dr', 'ipw', 'reg'].includes(form.method) ? form.method : undefined,
		steppedWedge: wedge ? {
			effect: form.effect === 'ETI' || form.effect === 'TEH' ? form.effect : 'IT',
			estimand: pte ? 'PTE' : 'TATE',
			exposure: pte ? exposure[0] : exposure.length === 2 ? [Math.min(exposure[0], exposure[1]), Math.max(exposure[0], exposure[1])] : undefined,
			family: form.family === 'binomial' ? 'binomial' : 'gaussian',
			trials: form.family === 'binomial' && form.trials ? form.trials : undefined,
			individual: form.individual || undefined,
		} : undefined,
	};
}

/** A panel study's table and columns: "panel.csv: y of state by year, treated when trt is not 0". */
function describePanel(panel: IPanelSettings): string {
	const treated = panel.cohort
		? localize('eventStudies.panelCohort', "first treated at {0}", panel.cohort)
		: localize('eventStudies.panelTreatment', "treated when {0} is not 0", panel.treatment ?? '');
	return localize('eventStudies.panelColumns', "{0}: {1} of {2} by {3}, {4}", panel.data, panel.outcome, panel.unit, panel.time, treated);
}

function describeEstimator(estimator: PanelEstimator): string {
	switch (estimator) {
		case 'panel_event_study': return localize('eventStudies.estimatorPanel', "Two-Way Fixed Effects and Sun and Abraham");
		case 'callaway_santanna': return localize('eventStudies.estimatorCallaway', "Callaway and Sant'Anna");
		case 'stepped_wedge': return localize('eventStudies.estimatorWedge', "Stepped Wedge");
	}
}

/** A number of a results file, null where it is missing. */
function resultNumber(value: string | undefined): number | null {
	const number = value === undefined || value.trim() === '' ? NaN : Number(value);
	return Number.isFinite(number) ? number : null;
}

/** A number of a results file for a sentence: four significant figures. */
function figure(value: string | undefined): string {
	const number = resultNumber(value);
	return number === null ? '-' : String(Number(number.toPrecision(4)));
}

/** Each estimator's effects by event time from a panel study's results; the stepped wedge's exposure time e is event time e - 1. */
function panelSeries(results: IPanelResults): IPanelSeries[] {
	const series: IPanelSeries[] = [];
	const add = (key: string, name: string, rows: readonly Readonly<Record<string, string>>[] | undefined, x: (row: Readonly<Record<string, string>>) => number | null, column: (row: Readonly<Record<string, string>>, field: string) => string | undefined) => {
		const points = (rows ?? []).flatMap(row => {
			const at = x(row);
			const effect = resultNumber(column(row, 'effect'));
			return at === null || effect === null ? [] : [{ x: at, effect, low: resultNumber(column(row, 'low')), high: resultNumber(column(row, 'high')) }];
		});
		if (points.length) {
			series.push({ key, name, points });
		}
	};
	const panel = results.tables.get('panel-effects.csv');
	add('twfe', localize('eventStudies.seriesTwfe', "Two-Way Fixed Effects"), panel, row => resultNumber(row.event_time), (row, field) => row[`twfe_${field}`]);
	add('sa', localize('eventStudies.seriesSa', "Sun and Abraham"), panel, row => resultNumber(row.event_time), (row, field) => row[`sa_${field}`]);
	add('cs', localize('eventStudies.seriesCs', "Callaway and Sant'Anna"), results.tables.get('cs-effects.csv'), row => resultNumber(row.event_time), (row, field) => row[field]);
	// The stepped wedge has a standard error by exposure time: its interval is the effect plus or minus 1.96 of it
	add('sw', localize('eventStudies.seriesSw', "Stepped Wedge"), results.tables.get('sw-effects.csv'), row => {
		const exposure = resultNumber(row.exposure);
		return exposure === null ? null : exposure - 1;
	}, (row, field) => {
		const effect = resultNumber(row.effect);
		const se = resultNumber(row.se);
		if (field === 'effect' || effect === null || se === null) {
			return row.effect;
		}
		return String(field === 'low' ? effect - 1.96 * se : effect + 1.96 * se);
	});
	return series;
}

/** The sentences under a panel study's chart: the tests of pre-trends, Callaway and Sant'Anna's averages, the stepped wedge's estimate. */
function panelLines(results: IPanelResults): string[] {
	const lines: string[] = [];
	const test = (name: string, row: Readonly<Record<string, string>>) => {
		if (resultNumber(row.statistic) === null) {
			return localize('eventStudies.pretrendsUntested', "Pre-trends, {0}: not tested", name);
		}
		const degrees = row.test === 'F' ? `F(${row.df1}, ${row.df2})` : `chi2(${row.df1})`;
		return localize('eventStudies.pretrends', "Pre-trends, {0}: {1} = {2}, p = {3}", name, degrees, figure(row.statistic), figure(row.p));
	};
	for (const row of results.tables.get('panel-pretrends.csv') ?? []) {
		lines.push(test(row.estimator === 'Sun and Abraham' ? localize('eventStudies.seriesSa', "Sun and Abraham") : localize('eventStudies.seriesTwfe', "Two-Way Fixed Effects"), row));
	}
	for (const row of results.tables.get('cs-pretrends.csv') ?? []) {
		lines.push(test(localize('eventStudies.seriesCs', "Callaway and Sant'Anna"), row));
	}
	const aggregations: Record<string, string> = {
		'simple': localize('eventStudies.overallSimple', "simple average"),
		'event time': localize('eventStudies.overallEvent', "average over event times"),
		'cohort': localize('eventStudies.overallCohort', "average over cohorts"),
		'calendar': localize('eventStudies.overallCalendar', "average over calendar times"),
	};
	for (const row of results.tables.get('cs-overall.csv') ?? []) {
		lines.push(localize('eventStudies.overall', "Callaway and Sant'Anna, {0}: {1}, se {2}, 95% interval {3} to {4}", aggregations[row.aggregation] ?? row.aggregation, figure(row.effect), figure(row.se), figure(row.low), figure(row.high)));
	}
	for (const row of results.tables.get('sw-estimate.csv') ?? []) {
		const [first, last] = (row.exposure ?? '').split(':');
		const exposure = last !== undefined
			? localize('eventStudies.exposureTimes', "exposure times {0} to {1}", first, last)
			: localize('eventStudies.exposureTime', "exposure time {0}", first);
		lines.push(localize('eventStudies.wedgeEstimate', "Stepped wedge, {0} by {1} ({2}): {3}, se {4}, 95% interval {5} to {6}", row.estimand, row.effect, exposure, figure(row.estimate), figure(row.se), figure(row.low), figure(row.high)));
		const icc = resultNumber(row.icc);
		lines.push(icc === null
			? localize('eventStudies.wedgeSd', "Standard deviations: clusters {0}, clusters at a time {1}", figure(row.sd_cluster), figure(row.sd_cluster_time))
			: localize('eventStudies.wedgeIcc', "Intracluster correlation {0}; standard deviations: clusters {1}, clusters at a time {2}", figure(row.icc), figure(row.sd_cluster), figure(row.sd_cluster_time)));
	}
	return lines;
}

function describeModel(study: IEventStudy): string {
	return study.model === 'marketModel'
		? localize('eventStudies.marketModelDays', "market model on the {0} trading days before", study.estimationDays)
		: localize('eventStudies.marketAdjusted', "market-adjusted");
}

function describeEventTime(time: EventTime): string {
	return time === 'firstPublic'
		? localize('eventStudies.atFirstPublic', "events at their first public time")
		: localize('eventStudies.atAccepted', "events at EDGAR's acceptance");
}

/** How long the newswire release came before EDGAR's acceptance, or after it. */
function describeLead(event: IStudyEvent): string {
	if (event.released === undefined || event.accepted === undefined) {
		return '';
	}
	const minutes = Math.round(Math.abs(event.accepted - event.released) / MINUTE);
	const span = localize('eventStudies.span', "{0}:{1}", Math.floor(minutes / 60), String(minutes % 60).padStart(2, '0'));
	return event.released <= event.accepted
		? localize('eventStudies.leadBefore', "{0} before the 8-K", span)
		: localize('eventStudies.leadAfter', "{0} after the 8-K", span);
}

function describeStatus(status: EventStatus, study: IEventStudy): string {
	switch (status) {
		case 'waiting': return localize('eventStudies.waiting', "Waiting for when EDGAR accepted it");
		case 'capturing': return localize('eventStudies.capturing', "Capturing prices");
		case 'complete': return localize('eventStudies.complete', "Complete");
		case 'noTicker': return localize('eventStudies.noTicker', "No ticker: no prices");
		case 'noBars': return localize('eventStudies.noBars', "No prices at Yahoo Finance");
		case 'tooOld': return study.source === 'fomc'
			? localize('eventStudies.tooOldFiveMinutes', "Older than the 60 days of five-minute prices")
			: localize('eventStudies.tooOld', "Older than the 30 days of minute prices");
	}
}

/** The FOMC releases a study takes: "FOMC releases: Statement, Minutes". */
function describeReleases(study: IEventStudy): string {
	return localize('eventStudies.fomcReleases', "FOMC releases: {0}", study.releases.map(describeRelease).join(', '));
}

/** When the event came: during the regular session, before the open or after the close, in New York. */
function describeSession(event: IStudyEvent, time: number | undefined): string {
	if (event.duringSession === undefined || time === undefined) {
		return '';
	}
	if (event.duringSession) {
		return localize('eventStudies.duringSession', "During the session");
	}
	const hour = Number(newYorkHour.value.format(time));
	return hour < 12 ? localize('eventStudies.beforeOpen', "Before the open") : localize('eventStudies.afterClose', "After the close");
}

/** The closes of a symbol's bars, by when each bar ends (a minute after it starts, or `span`), to look up the last price at any time. */
class Prices {
	private readonly times: number[];
	private readonly closes: number[];

	constructor(bars: readonly IMinuteBar[] | undefined, span = MINUTE) {
		this.times = (bars ?? []).map(bar => bar.time + span);
		this.closes = (bars ?? []).map(bar => bar.close);
	}

	get size(): number {
		return this.times.length;
	}

	/** The last price at or before `time`; undefined before the first bar. */
	at(time: number): number | undefined {
		const index = this.lastAtOrBefore(time);
		return index >= 0 ? this.closes[index] : undefined;
	}

	/** How many minutes end after `from` and at or before `to`. */
	count(from: number, to: number): number {
		return Math.max(0, this.lastAtOrBefore(to) - this.lastAtOrBefore(from));
	}

	/** The minutes' ends before `time`, oldest first. */
	before(time: number): readonly number[] {
		return this.times.slice(0, this.lastAtOrBefore(time - 1) + 1);
	}

	private lastAtOrBefore(time: number): number {
		let low = 0;
		let high = this.times.length - 1;
		let found = -1;
		while (low <= high) {
			const middle = (low + high) >> 1;
			if (this.times[middle] <= time) {
				found = middle;
				low = middle + 1;
			} else {
				high = middle - 1;
			}
		}
		return found;
	}
}

/** The articles about the events in each minute from `from` to `to` after each event's time (or next open), all events together. */
function articleCounts(times: readonly (number | undefined)[], news: readonly (readonly ICoverageItem[])[], from: number, to: number): number[] {
	const counts = new Array<number>(to - from + 1).fill(0);
	times.forEach((time, index) => {
		if (time === undefined) {
			return;
		}
		for (const item of news[index]) {
			const minute = Math.floor((item.time - time) / MINUTE);
			if (minute >= from && minute <= to) {
				counts[minute - from]++;
			}
		}
	});
	return counts;
}

/**
 * An event's cumulative abnormal returns over a period, in per cent, from the start of the period (`before` minutes
 * before the event's time): a value a minute from the event's time, and, for an event outside the regular session,
 * from the next open; and, with the market model, its beta.
 */
function eventCurves(study: IEventStudy, period: IEventPeriod, event: IStudyEvent, bars: ReadonlyMap<string, readonly IMinuteBar[]>, now: number): { readonly filing?: (number | null)[]; readonly open?: (number | null)[]; readonly beta?: number } {
	const time = eventTime(study, event);
	if (time === undefined || !event.ticker) {
		return {};
	}
	const stock = new Prices(bars.get(event.ticker));
	const benchmark = new Prices(bars.get(study.benchmark));
	const start = time - period.before * MINUTE;
	const stockStart = stock.at(start);
	const benchmarkStart = benchmark.at(start);
	if (!stock.size || !benchmark.size || stockStart === undefined || benchmarkStart === undefined) {
		return {};
	}
	const model = study.model === 'marketModel' ? estimate(stock, benchmark, start, study.estimationDays) : undefined;
	const known = event.status === 'complete' ? Infinity : now - SETTLE_MILLISECONDS;
	const car = (time: number): number | null => {
		const price = stock.at(time);
		const level = benchmark.at(time);
		if (time > known || price === undefined || level === undefined) {
			return null;
		}
		const market = Math.log(level / benchmarkStart);
		const normal = model ? model.alpha * benchmark.count(start, time) + model.beta * market : market;
		return round((Math.log(price / stockStart) - normal) * 100);
	};
	const filing: (number | null)[] = [];
	for (let minute = -period.before; minute <= period.after; minute++) {
		filing.push(car(time + minute * MINUTE));
	}
	let open: (number | null)[] | undefined;
	if (period.nextOpen && !event.duringSession && event.nextOpen !== undefined) {
		open = [];
		for (let minute = 0; minute <= period.after; minute++) {
			open.push(car(event.nextOpen + minute * MINUTE));
		}
	}
	return { filing, open, beta: model ? round(model.beta) : undefined };
}

/**
 * An instrument's move at an FOMC release over a period, from its start (`before` minutes before the release), a value
 * a minute, in its unit; undefined when it has no prices then, as an expired contract.
 */
function releaseCurve(period: IEventPeriod, code: string, event: IStudyEvent, bars: ReadonlyMap<string, readonly IMinuteBar[]>, now: number): (number | null)[] | undefined {
	const time = event.accepted;
	if (time === undefined) {
		return undefined;
	}
	const prices = new Prices(bars.get(instrumentSymbol(code, time)), (event.barMinutes ?? 1) * MINUTE);
	const start = prices.at(time - period.before * MINUTE);
	if (start === undefined) {
		return undefined;
	}
	const scale = instrumentScale(code, time);
	const known = event.status === 'complete' ? Infinity : now - SETTLE_MILLISECONDS;
	const curve: (number | null)[] = [];
	for (let minute = -period.before; minute <= period.after; minute++) {
		const at = time + minute * MINUTE;
		const price = prices.at(at);
		curve.push(at > known || price === undefined ? null : round(instrumentMove(code, start, price, scale)));
	}
	return curve;
}

/**
 * The market model's alpha (per minute of the benchmark's session) and beta, by least squares on the minute returns of
 * the regular sessions of the `days` trading days before `start`; undefined when there are too few.
 */
function estimate(stock: Prices, benchmark: Prices, start: number, days: number): { readonly alpha: number; readonly beta: number } | undefined {
	// The benchmark trades only in the regular session: its minutes are the session's
	const minutes = benchmark.before(start);
	const dayOf = (time: number) => newYorkDay.value.format(time);
	const chosen = new Set([...new Set(minutes.map(dayOf))].slice(-days));
	const stockReturns: number[] = [];
	const benchmarkReturns: number[] = [];
	for (let index = 1; index < minutes.length; index++) {
		const time = minutes[index];
		const previous = minutes[index - 1];
		// Not across the night, and within the days chosen
		if (time - previous !== MINUTE || !chosen.has(dayOf(time))) {
			continue;
		}
		const price = stock.at(time);
		const before = stock.at(previous);
		const level = benchmark.at(time);
		const levelBefore = benchmark.at(previous);
		if (price && before && level && levelBefore) {
			stockReturns.push(Math.log(price / before));
			benchmarkReturns.push(Math.log(level / levelBefore));
		}
	}
	if (stockReturns.length < MIN_ESTIMATION_RETURNS) {
		return undefined;
	}
	const mean = (values: readonly number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
	const stockMean = mean(stockReturns);
	const benchmarkMean = mean(benchmarkReturns);
	let covariance = 0;
	let variance = 0;
	benchmarkReturns.forEach((value, index) => {
		covariance += (value - benchmarkMean) * (stockReturns[index] - stockMean);
		variance += (value - benchmarkMean) ** 2;
	});
	if (!variance) {
		return undefined;
	}
	const beta = covariance / variance;
	return { alpha: stockMean - beta * benchmarkMean, beta };
}

/** The average of the events' curves a minute at a time, with its 95% band from their cross-section, where there are two or more. */
function averageCurves(curves: readonly ((number | null)[] | undefined)[], before: number, after: number, first: number): IWindowCurves {
	const length = before + after + 1;
	const minutes = Array.from({ length }, (_, index) => first + index);
	const cars = curves.map(curve => curve ?? []);
	const caar: (number | null)[] = [];
	const lower: (number | null)[] = [];
	const upper: (number | null)[] = [];
	const counts: number[] = [];
	for (let index = 0; index < length; index++) {
		const values = cars.map(curve => curve[index]).filter((value): value is number => typeof value === 'number');
		counts.push(values.length);
		if (!values.length) {
			caar.push(null);
			lower.push(null);
			upper.push(null);
			continue;
		}
		const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
		caar.push(round(mean));
		if (values.length < 2) {
			lower.push(null);
			upper.push(null);
			continue;
		}
		const deviation = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1));
		const margin = 1.96 * deviation / Math.sqrt(values.length);
		lower.push(round(mean - margin));
		upper.push(round(mean + margin));
	}
	return { minutes, cars, caar, lower, upper, counts };
}

function round(value: number): number {
	return Math.round(value * 10_000) / 10_000;
}

function pageHtml(): string {
	const text = {
		title: localize('eventStudies.title', "Event Studies"),
		intro: localize('eventStudies.intro', "How prices move around SEC filings: the filings an alert fires are the events, and Pollis captures the minute prices of the filer's stock and of a benchmark around each, while it is open, and the news about it from Google News and PR Newswire's feeds, where the company's newswire release often comes before the 8-K. A new study starts with the filings the alert would have fired in the last 30 days, as Yahoo Finance keeps minute prices for 30 days."),
		introFomc: localize('eventStudies.introFomc', "Or how rates, yields and stocks move around the FOMC's releases: its statements, the Summary of Economic Projections and its minutes, from the Federal Reserve's feed, measured by federal funds and SOFR futures, Treasury yields, TIPS and the S&P 500."),
		introPanel: localize('eventStudies.introPanel', "Or, as a panel event study, how an outcome moves when units are treated at different times, from a table of units over time. In econometrics: states adopting a policy, firms a rule or countries a reform, estimated by two-way fixed effects, Sun and Abraham (2021) and Callaway and Sant'Anna (2021). In clinical research: a stepped-wedge trial, where clinics or hospitals cross from control to treatment one group after another, estimated by the mixed model of Hussey and Hughes (2007), with the effects by exposure time of Kenny et al. (2022)."),
		kind: localize('eventStudies.kind', "Kind"),
		marketKind: localize('eventStudies.marketKind', "Market Event Study"),
		panelKind: localize('eventStudies.panelKind', "Panel Event Study"),
		kindHint: localize('eventStudies.kindHint', "A market event study measures how prices move in the minutes around events. A panel event study measures how an outcome moves over the times after units are treated, against the units not yet or never treated: in econometrics, a policy adopted by states at different times; in clinical research, a stepped-wedge trial."),
		data: localize('eventStudies.data', "Table"),
		chooseData: localize('eventStudies.chooseData', "Choose File..."),
		noData: localize('eventStudies.noData', "No table chosen."),
		badData: localize('eventStudies.badData', "Not a table: a CSV file with a header row and three columns or more."),
		dataHint: localize('eventStudies.dataHint', "A CSV file of units over time, a row per unit and time (or per individual, unit and time), copied into the study's folder as panel.csv. Times are whole numbers: years, or quarters or months numbered in order."),
		columns: localize('eventStudies.columns', "Columns"),
		unit: localize('eventStudies.unit', "Unit"),
		time: localize('eventStudies.time', "Time"),
		outcome: localize('eventStudies.outcome', "Outcome"),
		columnsHint: localize('eventStudies.columnsHint', "The units are also the clusters of the standard errors, and the stepped wedge's clusters (clinics, hospitals, regions)."),
		treated: localize('eventStudies.treated', "Treated"),
		treatmentChoice: localize('eventStudies.treatmentChoice', "Treatment Indicator"),
		cohortChoice: localize('eventStudies.cohortChoice', "First Treated"),
		treatedHint: localize('eventStudies.treatedHint', "A treatment indicator is not 0 from the time a unit is treated; a first-treated column holds the time each unit is first treated, missing or 0 for never. The stepped wedge needs a treatment indicator."),
		estimators: localize('eventStudies.estimators', "Estimators"),
		estimatorPanel: localize('eventStudies.estimatorPanel', "Two-Way Fixed Effects and Sun and Abraham"),
		estimatorCallaway: localize('eventStudies.estimatorCallaway', "Callaway and Sant'Anna"),
		estimatorWedge: localize('eventStudies.estimatorWedge', "Stepped Wedge"),
		estimatorsHint: localize('eventStudies.estimatorsHint', "Two-way fixed effects, with Sun and Abraham's (2021) estimator, which stays right when the effects differ between cohorts; Callaway and Sant'Anna's (2021) effects of each cohort at each time; the stepped-wedge mixed model of Hussey and Hughes (2007), for clustered trials, fitted by MixedModels.jl."),
		eventTimes: localize('eventStudies.eventTimes', "Event Times"),
		leads: localize('eventStudies.leads', "Leads"),
		lags: localize('eventStudies.lags', "Lags"),
		eventTimesHint: localize('eventStudies.eventTimesHint', "The times before the first treatment (leads, for the test of pre-trends) and after it (lags) whose effects are estimated."),
		callaway: localize('eventStudies.callaway', "Callaway and Sant'Anna"),
		control: localize('eventStudies.control', "Control"),
		controlAuto: localize('eventStudies.controlAuto', "Auto"),
		controlNever: localize('eventStudies.controlNever', "Never Treated"),
		controlNotYet: localize('eventStudies.controlNotYet', "Not Yet Treated"),
		controlLast: localize('eventStudies.controlLast', "Treated Last"),
		method: localize('eventStudies.method', "Method"),
		methodDr: localize('eventStudies.methodDr', "Doubly Robust"),
		methodIpw: localize('eventStudies.methodIpw', "Inverse Probability Weighting"),
		methodReg: localize('eventStudies.methodReg', "Outcome Regression"),
		callawayHint: localize('eventStudies.callawayHint', "The control units: never treated, also those not yet treated, or those treated last; Auto takes the never treated when there are any. The estimator of each 2x2 comparison."),
		wedge: localize('eventStudies.wedge', "Stepped Wedge"),
		effect: localize('eventStudies.effect', "Effect"),
		effectIt: localize('eventStudies.effectIt', "Immediate Treatment (IT)"),
		effectEti: localize('eventStudies.effectEti', "Exposure Time Indicators (ETI)"),
		effectTeh: localize('eventStudies.effectTeh', "Heterogeneity by Exposure Time (TEH)"),
		estimand: localize('eventStudies.estimand', "Estimand"),
		tate: localize('eventStudies.tate', "Average over Exposure Times (TATE)"),
		pte: localize('eventStudies.pte', "At One Exposure Time (PTE)"),
		exposureFrom: localize('eventStudies.exposureFrom', "From"),
		exposureTo: localize('eventStudies.exposureTo', "To"),
		exposureAt: localize('eventStudies.exposureAt', "At"),
		family: localize('eventStudies.family', "Outcome Type"),
		gaussian: localize('eventStudies.gaussian', "Continuous (Gaussian)"),
		binomial: localize('eventStudies.binomial', "Binary or Counts (Binomial)"),
		trials: localize('eventStudies.trials', "Trials"),
		individual: localize('eventStudies.individual', "Individual"),
		none: localize('eventStudies.none', "None"),
		wedgeHint: localize('eventStudies.wedgeHint', "IT is one effect from the first time treated; ETI an effect for each exposure time (1 is the first time treated), averaged by TATE over the exposure times From to To (all when empty) or taken by PTE at one; TEH the same with the effects varying around their mean. A binomial outcome is 0 or 1, or successes out of the trials column. Individual, when each is observed more than once."),
		wedgeNeedsTreatment: localize('eventStudies.wedgeNeedsTreatment', "The stepped wedge needs a treatment indicator."),
		panelCaption: localize('eventStudies.panelCaption', "Effects by event time with their 95% intervals; 0 is the first time treated (the stepped wedge's exposure time 1)"),
		eventTimeAxis: localize('eventStudies.eventTimeAxis', "Event time"),
		noResults: localize('eventStudies.noResults', "No results yet: open the notebook and run it. PollisEventStudies.jl writes them to the study's results folder, and they appear here."),
		filingsSource: localize('eventStudies.filingsSource', "SEC Filings"),
		fomcSource: localize('eventStudies.fomcSource', "FOMC Releases"),
		fomcTitle: localize('eventStudies.fomcTitle', "FOMC Releases"),
		releasesHint: localize('eventStudies.releasesHint', "The releases of the Federal Reserve's Monetary Policy Press Releases feed that are the events, at the time it gives (2 p.m. in New York for the statement). The statement and the Summary of Economic Projections out at the same time are one event. A new study starts with the releases of the last 59 days: five-minute prices for those older than 30 days. Other is the rest of the feed: mostly the minutes of the Board's discount rate meetings, and now and then another announcement; the events list each release's title."),
		instruments: localize('eventStudies.instruments', "Instruments"),
		target: localize('eventStudies.target', "Target Rate Surprise"),
		path: localize('eventStudies.path', "Path and Forward Guidance"),
		information: localize('eventStudies.information', "Fed Information Effect"),
		instrumentsHint: localize('eventStudies.instrumentsHint', "Futures on rates move in basis points of the implied rate (100 less the price), yields in basis points, prices in per cent. The contract months follow from each release's month; FF1 is scaled by D / (D - d) (Kuttner 2001), and in the month's last week FF2 stands in for it. Expired contracts are gone from Yahoo Finance, so FF1 of a past month has no prices. Yahoo Finance has no 2-year yield in minutes: the 2-year note future stands for it, as a price."),
		instrument: localize('eventStudies.instrument', "Instrument"),
		fomcCaption: localize('eventStudies.fomcCaption', "Average move from the start of the period, with its 95% band; each release's in grey"),
		minutesRelease: localize('eventStudies.minutesRelease', "Minutes from the release"),
		meanAt: localize('eventStudies.meanAt', "Mean at {0} min: {1} {2} (t = {3}, {4} releases)"),
		meanAtOne: localize('eventStudies.meanAtOne', "Move at {0} min: {1} {2} (1 release)"),
		noReleases: localize('eventStudies.noReleases', "No release yet: the FOMC's releases are added as the Federal Reserve's feed lists them."),
		releaseTime: localize('eventStudies.releaseTime', "Time"),
		releaseTitle: localize('eventStudies.releaseTitle', "Release"),
		kinds: localize('eventStudies.kinds', "Kind"),
		bars: localize('eventStudies.bars', "Bars"),
		newStudy: localize('eventStudies.newStudy', "New Study"),
		studyTitle: localize('eventStudies.studyTitle', "Title"),
		alert: localize('eventStudies.alert', "Events"),
		alertHint: localize('eventStudies.alertHint', "The filings this alert fires are the events: the alert chooses their companies, forms, 8-K items and words."),
		noAlerts: localize('eventStudies.noAlerts', "No alert on SEC filings yet: add one, and the filings it fires become the events."),
		addAlert: localize('eventStudies.addAlert', "Add Alert..."),
		benchmark: localize('eventStudies.benchmark', "Benchmark"),
		benchmarkHint: localize('eventStudies.benchmarkHint', "A Yahoo Finance symbol: ^GSPC for the S&P 500. It trades only in the regular session, so after the close the stock's moves are its own."),
		model: localize('eventStudies.model', "Normal Return"),
		marketAdjusted: localize('eventStudies.marketAdjustedChoice', "Market-Adjusted"),
		marketModel: localize('eventStudies.marketModelChoice', "Market Model"),
		modelHint: localize('eventStudies.modelHint', "Market-adjusted takes the benchmark's return out. The market model takes out alpha plus beta times the benchmark's return, estimated on the minute returns of the regular sessions of the days before the period."),
		estimationDays: localize('eventStudies.estimationDays', "Estimation Days"),
		groupBy: localize('eventStudies.groupBy', "Group By"),
		groupByNone: localize('eventStudies.groupByNone', "No Groups"),
		groupByForm: localize('eventStudies.groupByForm', "Form"),
		groupByItem: localize('eventStudies.groupByItem', "8-K Item"),
		groupBySession: localize('eventStudies.groupBySession', "Session"),
		groupByTicker: localize('eventStudies.groupByTicker', "Ticker"),
		groupByHint: localize('eventStudies.groupByHint', "Optional. The notebook's report also studies the filings in groups, each with its own CAAR and tests: by form, by 8-K item (a filing with several is in the group of each), by session (during the regular session or outside it) or by ticker."),
		eventTime: localize('eventStudies.eventTime', "Event Time"),
		firstPublic: localize('eventStudies.firstPublicChoice', "First Public"),
		acceptedChoice: localize('eventStudies.acceptedChoice', "EDGAR Acceptance"),
		eventTimeHint: localize('eventStudies.eventTimeHint', "First public is the earlier of the company's newswire release (GlobeNewswire, Business Wire, PR Newswire or ACCESS Newswire, as Google News lists it, or PR Newswire's own feeds, which Pollis reads while there is a study of filings) and EDGAR's acceptance: results are often on the wires hours before the 8-K. EDGAR acceptance alone misses a reaction to an earlier release."),
		periods: localize('eventStudies.periods', "Periods"),
		periodsHint: localize('eventStudies.periodsHint', "Minutes before and after the event's time. Next Open also follows an event outside the regular session from the next open."),
		periodName: localize('eventStudies.periodName', "Name"),
		before: localize('eventStudies.before', "Before"),
		after: localize('eventStudies.after', "After"),
		nextOpen: localize('eventStudies.nextOpen', "Next Open"),
		addPeriod: localize('eventStudies.addPeriod', "Add Period"),
		removePeriod: localize('eventStudies.removePeriod', "Remove"),
		create: localize('eventStudies.create', "Make Study"),
		yourStudies: localize('eventStudies.yourStudies', "Your Studies"),
		noStudies: localize('eventStudies.noStudies', "No study yet."),
		openFolder: localize('eventStudies.openFolder', "Open Folder"),
		openStudyFile: localize('eventStudies.openStudyFile', "Edit study.toml"),
		openNotebook: localize('eventStudies.openNotebook', "Open Notebook"),
		capped: localize('eventStudies.capped', "The last 30 days had more filings than EDGAR's full-text search reads: some are not among the events."),
		period: localize('eventStudies.period', "Period"),
		fromFiling: localize('eventStudies.fromEvent', "From the Event"),
		fromOpen: localize('eventStudies.fromOpen', "From the Next Open"),
		chartCaption: localize('eventStudies.chartCaption', "Cumulative average abnormal return, per cent, with its 95% band; each event's in grey; under it, the articles about the events"),
		chartEmpty: localize('eventStudies.chartEmpty', "No prices yet."),
		minutesFirstPublic: localize('eventStudies.minutesFirstPublic', "Minutes from the first public time"),
		minutesAccepted: localize('eventStudies.minutesAccepted', "Minutes from EDGAR's acceptance"),
		minutesOpen: localize('eventStudies.minutesOpen', "Minutes from the next open"),
		otherAccepted: localize('eventStudies.otherAccepted', "8-K"),
		otherRelease: localize('eventStudies.otherRelease', "Release"),
		articles: localize('eventStudies.articles', "Articles"),
		caarAt: localize('eventStudies.caarAt', "CAAR at {0} min: {1}% (t = {2}, {3} events)"),
		caarAtOne: localize('eventStudies.caarAtOne', "CAR at {0} min: {1}% (1 event)"),
		events: localize('eventStudies.eventsHeading', "Events"),
		noEvents: localize('eventStudies.noEvents', "No event yet: the filings the alert fires from now on are added as they come."),
		released: localize('eventStudies.released', "Release"),
		accepted: localize('eventStudies.accepted', "Accepted"),
		lead: localize('eventStudies.lead', "Lead"),
		company: localize('eventStudies.company', "Company"),
		form: localize('eventStudies.form', "Form"),
		session: localize('eventStudies.session', "When"),
		status: localize('eventStudies.status', "Prices"),
		news: localize('eventStudies.news', "News"),
		newsHint: localize('eventStudies.newsHint', "Media Coverage of the day before to the day after"),
		car: localize('eventStudies.car', "CAR"),
		beta: localize('eventStudies.beta', "Beta"),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 1100px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		h2 { font-size: 18px; font-weight: 400; margin: 0; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 24px 0; line-height: 1.4; max-width: 900px; }
		[hidden] { display: none !important; }
		.sectionHeader { display: flex; align-items: baseline; gap: 16px; margin: 24px 0 8px 0; }
		.sectionHeader h2 { flex: 1; }
		.pane { padding: 16px; border-radius: 4px; background: var(--vscode-welcomePage-tileBackground, var(--vscode-editorWidget-background)); }
		.formGrid { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 12px 16px; align-items: baseline; }
		.hint { font-size: 12px; color: var(--vscode-descriptionForeground); margin-top: 4px; line-height: 1.4; }
		.row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
		.row.baseline { align-items: baseline; }
		.row .hint { margin-top: 0; }
		input[type="text"], input[type="number"], select { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 4px 6px; }
		input:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		input#studyTitle { width: 360px; max-width: 100%; }
		select#alert { max-width: 100%; }
		input#benchmark { width: 120px; text-transform: uppercase; }
		input[type="number"] { width: 72px; }
		.choice { display: inline-flex; align-items: center; gap: 4px; margin-right: 16px; cursor: pointer; }
		button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; border-radius: 2px; padding: 4px 12px; cursor: pointer; }
		button.action:hover { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.primary:hover { background: var(--vscode-button-hoverBackground); }
		button:disabled { opacity: 0.5; cursor: default; }
		button.action:disabled:hover { color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
		button.primary:disabled:hover { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; font-size: 12px; }
		.link:hover { text-decoration: underline; }
		.periods { display: grid; grid-template-columns: minmax(120px, 200px) max-content max-content max-content max-content; gap: 6px 12px; align-items: center; }
		.periods .head { font-size: 12px; color: var(--vscode-descriptionForeground); }
		.instrumentGroup { margin-bottom: 6px; }
		.instrumentGroup .head { font-size: 12px; color: var(--vscode-descriptionForeground); margin-bottom: 2px; }
		.tableScroll { overflow-x: auto; }
		.periods input[type="text"] { width: 100%; }
		.list { border-top: 1px solid var(--vscode-widget-border); }
		.entry { display: flex; align-items: center; gap: 12px; padding: 8px; border-bottom: 1px solid var(--vscode-widget-border); border-left: 3px solid transparent; cursor: pointer; }
		.entry:hover { background: var(--vscode-list-hoverBackground); }
		.entry.chosen { border-left-color: var(--vscode-focusBorder); background: var(--vscode-list-inactiveSelectionBackground); }
		.entry .text { flex: 1; min-width: 0; line-height: 1.4; }
		.entry .name { font-weight: 600; }
		.entry .meta { font-size: 11px; color: var(--vscode-descriptionForeground); }
		.empty { color: var(--vscode-descriptionForeground); padding: 12px 8px; }
		.info { font-size: 12px; color: var(--vscode-descriptionForeground); margin-bottom: 12px; line-height: 1.4; }
		.chartHeader { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
		.chartCaption { font-size: 11px; color: var(--vscode-descriptionForeground); }
		.views { display: flex; gap: 4px; }
		.views button { font: inherit; font-size: 11px; color: var(--vscode-foreground); background: none; border: 1px solid transparent; border-radius: 2px; padding: 1px 6px; cursor: pointer; }
		.views button:hover { background: var(--vscode-toolbar-hoverBackground); }
		.views button.chosen { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		#chart { display: block; width: 100%; height: 280px; }
		#chart .grid { stroke: var(--vscode-widget-border); stroke-width: 1; }
		#chart .zero { stroke: var(--vscode-descriptionForeground); stroke-width: 1; }
		#chart .event { fill: none; stroke: var(--vscode-descriptionForeground); stroke-width: 1; opacity: 0.25; }
		#chart .band { fill: var(--vscode-textLink-foreground); opacity: 0.15; }
		#chart .caar { fill: none; stroke: var(--vscode-textLink-foreground); stroke-width: 2; }
		#chart .other { stroke: var(--vscode-charts-orange); stroke-width: 1; stroke-dasharray: 4 3; }
		#chart text.other { fill: var(--vscode-charts-orange); stroke: none; }
		#chart .articles { fill: var(--vscode-descriptionForeground); opacity: 0.6; }
		#chart text { font-size: 10px; fill: var(--vscode-descriptionForeground); }
		.summary { font-size: 12px; margin-top: 8px; }
		table { width: 100%; border-collapse: collapse; font-size: 12px; }
		th { text-align: left; font-weight: normal; color: var(--vscode-descriptionForeground); padding: 4px 8px; border-bottom: 1px solid var(--vscode-widget-border); }
		td { padding: 4px 8px; border-bottom: 1px solid var(--vscode-widget-border); }
		td.number, th.number { text-align: right; font-variant-numeric: tabular-nums; }
		tr.capturing td { color: var(--vscode-descriptionForeground); }
		#panelChart { display: block; width: 100%; height: 300px; }
		#panelChart .grid { stroke: var(--vscode-widget-border); stroke-width: 1; }
		#panelChart .zero { stroke: var(--vscode-descriptionForeground); stroke-width: 1; }
		#panelChart .start { stroke: var(--vscode-descriptionForeground); stroke-width: 1; stroke-dasharray: 4 3; }
		#panelChart text { font-size: 10px; fill: var(--vscode-descriptionForeground); }
		#panelChart .line { fill: none; stroke-width: 1; opacity: 0.6; }
		#panelChart .whisker { stroke-width: 1.5; }
		.twfe { stroke: var(--vscode-charts-blue); fill: var(--vscode-charts-blue); }
		.sa { stroke: var(--vscode-charts-orange); fill: var(--vscode-charts-orange); }
		.cs { stroke: var(--vscode-charts-green); fill: var(--vscode-charts-green); }
		.sw { stroke: var(--vscode-charts-purple); fill: var(--vscode-charts-purple); }
		.legend { display: flex; gap: 16px; flex-wrap: wrap; font-size: 12px; margin-top: 6px; }
		.legend svg { vertical-align: middle; margin-right: 4px; }
		.preview { margin-top: 6px; font-size: 11px; }
		.preview td, .preview th { padding: 2px 6px; white-space: nowrap; }
		.lines div { font-size: 12px; margin-top: 4px; }
		.up { color: var(--vscode-charts-green); }
		.down { color: var(--vscode-charts-red); }
	</style>
</head>
<body>
<div class="container">
	<h1>${text.title}</h1>
	<p class="subtitle">${text.intro} ${text.introFomc} ${text.introPanel}</p>

	<div class="sectionHeader"><h2>${text.newStudy}</h2></div>
	<div class="pane">
		<div class="formGrid">
			<label for="studyTitle">${text.studyTitle}</label>
			<div><input type="text" id="studyTitle" spellcheck="false" autocomplete="off"></div>
			<span>${text.kind}</span>
			<div>
				<div class="row">
					<label class="choice"><input type="radio" name="kind" value="market" checked>${text.marketKind}</label>
					<label class="choice"><input type="radio" name="kind" value="panel">${text.panelKind}</label>
				</div>
				<div class="hint">${text.kindHint}</div>
			</div>
			<span class="marketOnly">${text.alert}</span>
			<div class="marketOnly">
				<div class="row">
					<label class="choice"><input type="radio" name="source" value="filings" checked>${text.filingsSource}</label>
					<label class="choice"><input type="radio" name="source" value="fomc">${text.fomcSource}</label>
				</div>
				<div class="filingsOnly" style="margin-top: 6px;">
					<div class="row baseline"><select id="alert" aria-label="${text.alert}"></select><span class="hint" id="noAlerts" hidden>${text.noAlerts}</span><button class="link" id="addAlert">${text.addAlert}</button></div>
					<div class="hint" id="alertHint">${text.alertHint}</div>
				</div>
				<div class="fomcOnly" style="margin-top: 6px;" hidden>
					<div class="row">${FOMC_RELEASES.map(release => `<label class="choice"><input type="checkbox" name="release" value="${release}"${release !== 'other' ? ' checked' : ''}>${describeRelease(release)}</label>`).join('')}</div>
					<div class="hint">${text.releasesHint}</div>
				</div>
			</div>
			<span class="fomcOnly" hidden>${text.instruments}</span>
			<div class="fomcOnly" hidden>
				${(['target', 'path', 'information'] as const).map(horizon => `<div class="instrumentGroup"><div class="head">${text[horizon]}</div><div class="row">${FOMC_INSTRUMENTS.filter(instrument => instrument.horizon === horizon).map(instrument => `<label class="choice" title="${describeInstrument(instrument.code)}"><input type="checkbox" name="instrument" value="${instrument.code}"${DEFAULT_FOMC_INSTRUMENTS.includes(instrument.code) ? ' checked' : ''}>${instrument.code}</label>`).join('')}</div></div>`).join('')}
				<div class="hint">${text.instrumentsHint}</div>
			</div>
			<span class="filingsOnly">${text.eventTime}</span>
			<div class="filingsOnly">
				<div class="row">
					<label class="choice"><input type="radio" name="eventTime" value="firstPublic" checked>${text.firstPublic}</label>
					<label class="choice"><input type="radio" name="eventTime" value="accepted">${text.acceptedChoice}</label>
				</div>
				<div class="hint">${text.eventTimeHint}</div>
			</div>
			<span class="panelOnly" hidden>${text.data}</span>
			<div class="panelOnly" hidden>
				<div class="row baseline"><button class="action primary" id="chooseData">${text.chooseData}</button><span id="dataName" class="hint">${text.noData}</span></div>
				<div class="tableScroll preview" id="dataPreview"></div>
				<div class="hint">${text.dataHint}</div>
			</div>
			<span class="panelOnly" hidden>${text.columns}</span>
			<div class="panelOnly" hidden>
				<div class="row">
					<label class="choice">${text.unit} <select id="panelUnit" class="column"></select></label>
					<label class="choice">${text.time} <select id="panelTime" class="column"></select></label>
					<label class="choice">${text.outcome} <select id="panelOutcome" class="column"></select></label>
				</div>
				<div class="hint">${text.columnsHint}</div>
			</div>
			<span class="panelOnly" hidden>${text.treated}</span>
			<div class="panelOnly" hidden>
				<div class="row">
					<label class="choice"><input type="radio" name="treatedBy" value="treatment" checked>${text.treatmentChoice}</label>
					<label class="choice"><input type="radio" name="treatedBy" value="cohort">${text.cohortChoice}</label>
					<select id="panelTreated" class="column" aria-label="${text.treated}"></select>
				</div>
				<div class="hint">${text.treatedHint}</div>
			</div>
			<span class="panelOnly" hidden>${text.estimators}</span>
			<div class="panelOnly" hidden>
				<div class="row">
					<label class="choice"><input type="checkbox" name="estimator" value="panel_event_study" checked>${text.estimatorPanel}</label>
					<label class="choice"><input type="checkbox" name="estimator" value="callaway_santanna">${text.estimatorCallaway}</label>
					<label class="choice"><input type="checkbox" name="estimator" value="stepped_wedge">${text.estimatorWedge}</label>
				</div>
				<div class="hint">${text.estimatorsHint}</div>
			</div>
			<span class="leadsOnly" hidden>${text.eventTimes}</span>
			<div class="leadsOnly" hidden>
				<div class="row">
					<label class="choice">${text.leads} <input type="number" id="leads" min="0" max="50" value="5"></label>
					<label class="choice">${text.lags} <input type="number" id="lags" min="0" max="50" value="5"></label>
				</div>
				<div class="hint">${text.eventTimesHint}</div>
			</div>
			<span class="csOnly" hidden>${text.callaway}</span>
			<div class="csOnly" hidden>
				<div class="row">
					<label class="choice">${text.control} <select id="control">
						<option value="auto">${text.controlAuto}</option>
						<option value="notyet">${text.controlNotYet}</option>
						<option value="never">${text.controlNever}</option>
						<option value="last">${text.controlLast}</option>
					</select></label>
					<label class="choice">${text.method} <select id="method">
						<option value="dr">${text.methodDr}</option>
						<option value="ipw">${text.methodIpw}</option>
						<option value="reg">${text.methodReg}</option>
					</select></label>
				</div>
				<div class="hint">${text.callawayHint}</div>
			</div>
			<span class="swOnly" hidden>${text.wedge}</span>
			<div class="swOnly" hidden>
				<div class="row">
					<label class="choice">${text.effect} <select id="effect">
						<option value="IT">${text.effectIt}</option>
						<option value="ETI">${text.effectEti}</option>
						<option value="TEH">${text.effectTeh}</option>
					</select></label>
					<label class="choice">${text.family} <select id="family">
						<option value="gaussian">${text.gaussian}</option>
						<option value="binomial">${text.binomial}</option>
					</select></label>
					<label class="choice" id="trialsRow" hidden>${text.trials} <select id="trials" class="column optional"></select></label>
					<label class="choice">${text.individual} <select id="individual" class="column optional"></select></label>
				</div>
				<div class="row" id="estimandRow" style="margin-top: 6px;">
					<span>${text.estimand}</span>
					<label class="choice"><input type="radio" name="estimand" value="TATE" checked>${text.tate}</label>
					<label class="choice"><input type="radio" name="estimand" value="PTE">${text.pte}</label>
					<label class="choice" id="exposureRange">${text.exposureFrom} <input type="number" id="exposureFrom" min="1"> ${text.exposureTo} <input type="number" id="exposureTo" min="1"></label>
					<label class="choice" id="exposureOne" hidden>${text.exposureAt} <input type="number" id="exposureAt" min="1"></label>
				</div>
				<div class="hint" id="wedgeNeedsTreatment" hidden>${text.wedgeNeedsTreatment}</div>
				<div class="hint">${text.wedgeHint}</div>
			</div>
			<span class="marketOnly">${text.periods}</span>
			<div class="marketOnly">
				<div class="periods" id="periods"></div>
				<div class="row" style="margin-top: 6px;"><button class="action primary" id="addPeriod">${text.addPeriod}</button></div>
				<div class="hint">${text.periodsHint}</div>
			</div>
			<label for="benchmark" class="filingsOnly">${text.benchmark}</label>
			<div class="filingsOnly"><input type="text" id="benchmark" spellcheck="false" autocomplete="off" value="${DEFAULT_BENCHMARK}"><div class="hint">${text.benchmarkHint}</div></div>
			<span class="filingsOnly">${text.model}</span>
			<div class="filingsOnly">
				<div class="row">
					<label class="choice"><input type="radio" name="model" value="marketAdjusted" checked>${text.marketAdjusted}</label>
					<label class="choice"><input type="radio" name="model" value="marketModel">${text.marketModel}</label>
					<label class="choice" id="estimationRow" hidden>${text.estimationDays} <input type="number" id="estimationDays" min="1" max="20" value="5"></label>
				</div>
				<div class="hint">${text.modelHint}</div>
			</div>
			<label for="groupBy" class="filingsOnly">${text.groupBy}</label>
			<div class="filingsOnly">
				<select id="groupBy">
					<option value="">${text.groupByNone}</option>
					<option value="form">${text.groupByForm}</option>
					<option value="item">${text.groupByItem}</option>
					<option value="session">${text.groupBySession}</option>
					<option value="ticker">${text.groupByTicker}</option>
				</select>
				<div class="hint">${text.groupByHint}</div>
			</div>
			<span></span>
			<div><button class="action primary" id="create" disabled>${text.create}</button></div>
		</div>
	</div>

	<div class="sectionHeader"><h2>${text.yourStudies}</h2></div>
	<div class="list" id="studies"></div>

	<div id="studyView" hidden>
		<div class="sectionHeader"><h2 id="studyTitleView"></h2><button class="link" id="openNotebook">${text.openNotebook}</button><button class="link" id="openStudyFile">${text.openStudyFile}</button><button class="link" id="openFolder">${text.openFolder}</button></div>
		<div class="info" id="studyInfo"></div>
		<div id="panelView" hidden>
			<div class="pane">
				<div class="chartHeader"><span class="chartCaption">${text.panelCaption}</span><span class="chartCaption" id="written"></span></div>
				<svg id="panelChart" xmlns="http://www.w3.org/2000/svg"></svg>
				<div class="legend" id="legend"></div>
				<div class="lines" id="lines"></div>
			</div>
			<div class="tableScroll" id="panelTable" style="margin-top: 16px;"></div>
		</div>
		<div id="marketView">
		<div class="pane">
			<div class="chartHeader">
				<div class="row"><span>${text.period}</span><select id="period"></select><span class="views" id="views"></span><span id="instrumentLabel" hidden>${text.instrument}</span><select id="instrument" hidden></select></div>
				<span class="chartCaption" id="chartCaption"></span>
			</div>
			<svg id="chart" xmlns="http://www.w3.org/2000/svg"></svg>
			<div class="summary" id="summary"></div>
		</div>
		<div class="sectionHeader"><h2>${text.events}</h2></div>
		<div id="events"></div>
		</div>
	</div>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const DEFAULT_PERIOD = ${JSON.stringify(DEFAULT_EVENT_PERIOD)};
	const FOMC_PERIOD = ${JSON.stringify(FOMC_PERIOD)};
	let state = { studies: [], alerts: [] };
	let study;
	let periodIndex = 0;
	let instrumentIndex = 0;
	let view = 'filing';
	let periods = [Object.assign({}, DEFAULT_PERIOD)];
	let data;
	const alertElement = document.getElementById('alert');
	const titleElement = document.getElementById('studyTitle');
	const createElement = document.getElementById('create');

	function element(tag, className, text) {
		const node = document.createElement(tag);
		if (className) {
			node.className = className;
		}
		if (text !== undefined) {
			node.textContent = text;
		}
		return node;
	}

	function svg(tag, attributes, text) {
		const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
		for (const [name, value] of Object.entries(attributes)) {
			node.setAttribute(name, String(value));
		}
		if (text !== undefined) {
			node.textContent = text;
		}
		return node;
	}

	function format(template, ...values) {
		return template.replace(/\\{(\\d+)\\}/g, (match, index) => String(values[Number(index)]));
	}

	function model() {
		return document.querySelector('input[name="model"]:checked').value;
	}

	function source() {
		return document.querySelector('input[name="source"]:checked').value;
	}

	function checked(name) {
		return [...document.querySelectorAll('input[name="' + name + '"]:checked')].map(input => input.value);
	}

	function kind() {
		return document.querySelector('input[name="kind"]:checked').value;
	}

	function value(id) {
		return document.getElementById(id).value;
	}

	function show(selector, shown) {
		document.querySelectorAll(selector).forEach(node => node.hidden = !shown);
	}

	function updateForm() {
		const panel = kind() === 'panel';
		const fomc = source() === 'fomc';
		show('.marketOnly', !panel);
		show('.filingsOnly', !panel && !fomc);
		show('.fomcOnly', !panel && fomc);
		show('.panelOnly', panel);
		document.getElementById('estimationRow').hidden = model() !== 'marketModel';
		if (panel) {
			const estimators = checked('estimator');
			const wedge = estimators.includes('stepped_wedge');
			const cohort = document.querySelector('input[name="treatedBy"]:checked').value === 'cohort';
			const pte = document.querySelector('input[name="estimand"]:checked').value === 'PTE';
			show('.leadsOnly', estimators.some(estimator => estimator !== 'stepped_wedge'));
			show('.csOnly', estimators.includes('callaway_santanna'));
			show('.swOnly', wedge);
			document.getElementById('wedgeNeedsTreatment').hidden = !cohort;
			// IT is one effect: there are no exposure times to average or pick
			document.getElementById('estimandRow').hidden = value('effect') === 'IT';
			document.getElementById('exposureRange').hidden = pte;
			document.getElementById('exposureOne').hidden = !pte;
			document.getElementById('trialsRow').hidden = value('family') !== 'binomial';
			const columns = ['panelUnit', 'panelTime', 'panelOutcome', 'panelTreated'].map(value);
			const ready = !!data && columns.every(column => column) && new Set(columns).size === columns.length && estimators.length > 0
				&& !(wedge && cohort) && !(wedge && pte && value('effect') !== 'IT' && !value('exposureAt'));
			createElement.disabled = !ready;
		} else {
			show('.leadsOnly, .csOnly, .swOnly', false);
			const ready = fomc ? checked('release').length > 0 && checked('instrument').length > 0 : !!alertElement.value;
			createElement.disabled = !ready || !periods.some(period => period.name.trim());
		}
	}

	function renderData() {
		document.getElementById('dataName').textContent = data ? data.name : TEXT.noData;
		const preview = document.getElementById('dataPreview');
		preview.textContent = '';
		const columns = data ? data.columns : [];
		// The columns guessed from their names, the treatment from the columns of 0 and 1
		const guess = (patterns, fallback) => columns.find(column => patterns.some(pattern => pattern.test(column))) ?? fallback;
		const guesses = {
			panelUnit: guess([/^(id|unit|cluster|state|county|country|firm|company|clinic|hospital|site)$/i, /id$/i], ''),
			panelTime: guess([/^(time|t|year|period|date|quarter|month|week|step)$/i], ''),
			panelOutcome: guess([/^(y|outcome|lemp|response)$/i], ''),
			panelTreated: '',
		};
		const cohort = document.querySelector('input[name="treatedBy"]:checked').value === 'cohort';
		guesses.panelTreated = cohort
			? guess([/^(g|cohort|first_?treat(ed)?|gname|first)$/i], '')
			: (data ? data.binary.find(column => !Object.values(guesses).includes(column)) : undefined) ?? guess([/^(d|treat(ed|ment)?|trt|x)$/i], '');
		document.querySelectorAll('select.column').forEach(select => {
			const previous = select.value;
			select.textContent = '';
			for (const column of ['', ...columns]) {
				const option = element('option', undefined, column || (select.classList.contains('optional') ? TEXT.none : ''));
				option.value = column;
				select.appendChild(option);
			}
			select.value = columns.includes(previous) ? previous : guesses[select.id] ?? '';
		});
		if (data && data.columns.length) {
			const table = element('table');
			const head = element('tr');
			data.columns.forEach(column => head.appendChild(element('th', undefined, column)));
			table.appendChild(head);
			for (const row of data.preview) {
				const tr = element('tr');
				data.columns.forEach((_, index) => tr.appendChild(element('td', undefined, row[index] ?? '')));
				table.appendChild(tr);
			}
			preview.appendChild(table);
		} else if (data) {
			preview.appendChild(element('div', 'hint', TEXT.badData));
		}
		updateForm();
	}

	function panelForm() {
		const number = id => value(id) === '' ? NaN : Number(value(id));
		const pte = document.querySelector('input[name="estimand"]:checked').value === 'PTE';
		return {
			unit: value('panelUnit'),
			time: value('panelTime'),
			outcome: value('panelOutcome'),
			treatedBy: document.querySelector('input[name="treatedBy"]:checked').value,
			treated: value('panelTreated'),
			estimators: checked('estimator'),
			leads: number('leads'),
			lags: number('lags'),
			control: value('control'),
			method: value('method'),
			effect: value('effect'),
			estimand: pte ? 'PTE' : 'TATE',
			exposure: (pte ? [number('exposureAt')] : [number('exposureFrom'), number('exposureTo')]).filter(Number.isFinite),
			family: value('family'),
			trials: value('trials'),
			individual: value('individual'),
		};
	}

	function renderPeriods() {
		const container = document.getElementById('periods');
		container.textContent = '';
		for (const head of [TEXT.periodName, TEXT.before, TEXT.after, TEXT.nextOpen, '']) {
			container.appendChild(element('span', 'head', head));
		}
		periods.forEach((period, index) => {
			const name = element('input');
			name.type = 'text';
			name.value = period.name;
			name.setAttribute('aria-label', TEXT.periodName);
			name.addEventListener('input', () => { period.name = name.value; updateForm(); });
			const minutes = (key, label) => {
				const input = element('input');
				input.type = 'number';
				input.min = '0';
				input.value = String(period[key]);
				input.setAttribute('aria-label', label);
				input.addEventListener('input', () => { period[key] = Number(input.value); });
				return input;
			};
			const nextOpen = element('input');
			nextOpen.type = 'checkbox';
			nextOpen.checked = period.nextOpen;
			nextOpen.setAttribute('aria-label', TEXT.nextOpen);
			nextOpen.addEventListener('change', () => { period.nextOpen = nextOpen.checked; });
			// An FOMC release is followed from its time only
			nextOpen.hidden = source() === 'fomc';
			const remove = element('button', 'link', TEXT.removePeriod);
			remove.hidden = periods.length < 2;
			remove.addEventListener('click', () => { periods.splice(index, 1); renderPeriods(); updateForm(); });
			container.append(name, minutes('before', TEXT.before), minutes('after', TEXT.after), nextOpen, remove);
		});
	}

	function renderAlerts() {
		const chosen = alertElement.value;
		alertElement.textContent = '';
		for (const alert of state.alerts) {
			const option = element('option', undefined, alert.label);
			option.value = alert.id;
			alertElement.appendChild(option);
		}
		if (state.alerts.some(alert => alert.id === chosen)) {
			alertElement.value = chosen;
		}
		alertElement.hidden = !state.alerts.length;
		document.getElementById('noAlerts').hidden = !!state.alerts.length;
		document.getElementById('alertHint').hidden = !state.alerts.length;
		updateForm();
	}

	function renderStudies() {
		const container = document.getElementById('studies');
		container.textContent = '';
		if (!state.studies.length) {
			container.appendChild(element('div', 'empty', TEXT.noStudies));
		}
		for (const entry of state.studies) {
			const row = element('div', 'entry' + (entry.folder === state.selected ? ' chosen' : ''));
			const textNode = element('div', 'text');
			textNode.append(element('div', 'name', entry.title), element('div', 'meta', entry.alert), element('div', 'meta', entry.meta));
			row.appendChild(textNode);
			row.addEventListener('click', () => vscode.postMessage({ command: 'select', folder: entry.folder }));
			container.appendChild(row);
		}
		document.getElementById('studyView').hidden = !state.selected;
	}

	function curvesShown() {
		const curves = study && study.curves[periodIndex];
		if (curves && study.fomc) {
			return curves.instruments[instrumentIndex];
		}
		return curves && (view === 'open' && curves.open ? curves.open : curves.filing);
	}

	function signed(value, digits) {
		return (value >= 0 ? '+' : '') + value.toFixed(digits);
	}

	function lastValue(values) {
		for (let index = values.length - 1; index >= 0; index--) {
			if (typeof values[index] === 'number') {
				return { index, value: values[index] };
			}
		}
		return undefined;
	}

	function percent(value) {
		return (value >= 0 ? '+' : '') + value.toFixed(2);
	}

	function renderStudy() {
		if (!study) {
			return;
		}
		document.getElementById('studyTitleView').textContent = study.title;
		document.getElementById('studyInfo').textContent = study.info + (study.capped ? '. ' + TEXT.capped : '');
		document.getElementById('panelView').hidden = !study.panel;
		document.getElementById('marketView').hidden = !!study.panel;
		if (study.panel) {
			renderPanel();
			return;
		}
		const periodElement = document.getElementById('period');
		periodElement.textContent = '';
		study.curves.forEach((curves, index) => {
			const option = element('option', undefined, curves.name);
			option.value = String(index);
			periodElement.appendChild(option);
		});
		periodIndex = Math.min(periodIndex, study.curves.length - 1);
		periodElement.value = String(periodIndex);
		const instrumentElement = document.getElementById('instrument');
		instrumentElement.textContent = '';
		instrumentElement.hidden = !study.fomc;
		document.getElementById('instrumentLabel').hidden = !study.fomc;
		document.getElementById('chartCaption').textContent = study.fomc ? TEXT.fomcCaption : TEXT.chartCaption;
		if (study.fomc) {
			study.instruments.forEach((instrument, index) => {
				const option = element('option', undefined, instrument.label + ', ' + instrument.unit);
				option.value = String(index);
				instrumentElement.appendChild(option);
			});
			instrumentIndex = Math.min(instrumentIndex, Math.max(0, study.instruments.length - 1));
			instrumentElement.value = String(instrumentIndex);
		}
		const views = document.getElementById('views');
		views.textContent = '';
		const hasOpen = !!study.curves[periodIndex].open;
		if (!hasOpen) {
			view = 'filing';
		}
		for (const [key, label] of hasOpen ? [['filing', TEXT.fromFiling], ['open', TEXT.fromOpen]] : []) {
			const button = element('button', key === view ? 'chosen' : '', label);
			button.addEventListener('click', () => { view = key; renderStudy(); });
			views.appendChild(button);
		}
		drawChart();
		renderEvents();
	}

	function renderPanel() {
		document.getElementById('written').textContent = study.written;
		const legend = document.getElementById('legend');
		legend.textContent = '';
		for (const series of study.series) {
			const item = element('span');
			const mark = svg('svg', { width: 14, height: 10 });
			mark.appendChild(svg('circle', { cx: 7, cy: 5, r: 3.5, class: series.key }));
			item.appendChild(mark);
			item.appendChild(document.createTextNode(series.name));
			legend.appendChild(item);
		}
		const lines = document.getElementById('lines');
		lines.textContent = '';
		study.lines.forEach(line => lines.appendChild(element('div', undefined, line)));
		drawPanelChart();
		// The effects as a table: a row per event time, a column per estimator
		const container = document.getElementById('panelTable');
		container.textContent = '';
		if (!study.series.length) {
			return;
		}
		const times = [...new Set(study.series.flatMap(series => series.points.map(point => point.x)))].sort((a, b) => a - b);
		const table = element('table');
		const head = element('tr');
		head.appendChild(element('th', undefined, TEXT.eventTimeAxis));
		study.series.forEach(series => head.appendChild(element('th', undefined, series.name)));
		table.appendChild(head);
		for (const time of times) {
			const row = element('tr');
			row.appendChild(element('td', undefined, String(time)));
			for (const series of study.series) {
				const point = series.points.find(point => point.x === time);
				const interval = point && point.low !== null && point.high !== null ? ' [' + figure(point.low) + ', ' + figure(point.high) + ']' : '';
				row.appendChild(element('td', undefined, point ? figure(point.effect) + interval : ''));
			}
			table.appendChild(row);
		}
		container.appendChild(table);
	}

	function figure(value) {
		return Number(value.toPrecision(4)).toString();
	}

	function drawPanelChart() {
		const chart = document.getElementById('panelChart');
		chart.textContent = '';
		const width = chart.clientWidth || 800;
		const height = chart.clientHeight || 300;
		chart.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
		if (!study.series.length) {
			chart.appendChild(svg('text', { x: width / 2, y: height / 2, 'text-anchor': 'middle' }, TEXT.noResults));
			return;
		}
		const left = 56, right = 16, top = 12, bottom = 32;
		const points = study.series.flatMap(series => series.points);
		const xs = points.map(point => point.x);
		const ys = points.flatMap(point => [point.effect, point.low, point.high]).filter(value => value !== null).concat([0]);
		const xMin = Math.min(...xs) - 0.5, xMax = Math.max(...xs) + 0.5;
		let yMin = Math.min(...ys), yMax = Math.max(...ys);
		const pad = (yMax - yMin) * 0.08 || 1;
		yMin -= pad;
		yMax += pad;
		const x = value => left + (value - xMin) / (xMax - xMin) * (width - left - right);
		const y = value => top + (yMax - value) / (yMax - yMin) * (height - top - bottom);
		const step = niceStep((yMax - yMin) / 5);
		for (let tick = Math.ceil(yMin / step) * step; tick <= yMax; tick += step) {
			chart.appendChild(svg('line', { x1: left, x2: width - right, y1: y(tick), y2: y(tick), class: 'grid' }));
			chart.appendChild(svg('text', { x: left - 6, y: y(tick) + 3, 'text-anchor': 'end' }, figure(Math.abs(tick) < step / 1e6 ? 0 : tick)));
		}
		const xStep = Math.max(1, niceStep((xMax - xMin) / 12));
		for (let tick = Math.ceil(xMin / xStep) * xStep; tick <= xMax; tick += xStep) {
			chart.appendChild(svg('text', { x: x(tick), y: height - bottom + 14, 'text-anchor': 'middle' }, String(tick)));
		}
		chart.appendChild(svg('text', { x: (left + width - right) / 2, y: height - 4, 'text-anchor': 'middle' }, TEXT.eventTimeAxis));
		chart.appendChild(svg('line', { x1: left, x2: width - right, y1: y(0), y2: y(0), class: 'zero' }));
		// The treatment starts between event times -1 and 0
		chart.appendChild(svg('line', { x1: x(-0.5), x2: x(-0.5), y1: top, y2: height - bottom, class: 'start' }));
		// Side by side at each event time, so the intervals do not cover each other
		const spread = Math.min(0.3, 0.12 * (study.series.length - 1));
		study.series.forEach((series, index) => {
			const offset = study.series.length > 1 ? -spread / 2 + spread * index / (study.series.length - 1) : 0;
			const sorted = [...series.points].sort((a, b) => a.x - b.x);
			chart.appendChild(svg('polyline', { points: sorted.map(point => x(point.x + offset) + ',' + y(point.effect)).join(' '), class: 'line ' + series.key }));
			for (const point of sorted) {
				const at = x(point.x + offset);
				if (point.low !== null && point.high !== null) {
					chart.appendChild(svg('line', { x1: at, x2: at, y1: y(point.low), y2: y(point.high), class: 'whisker ' + series.key }));
				}
				const dot = svg('circle', { cx: at, cy: y(point.effect), r: 3.5, class: series.key });
				dot.appendChild(svg('title', {}, series.name + ', ' + point.x + ': ' + figure(point.effect) + (point.low !== null && point.high !== null ? ' [' + figure(point.low) + ', ' + figure(point.high) + ']' : '')));
				chart.appendChild(dot);
			}
		});
	}

	function drawChart() {
		if (study && study.panel) {
			drawPanelChart();
			return;
		}
		const chart = document.getElementById('chart');
		chart.textContent = '';
		const curves = curvesShown();
		const summary = document.getElementById('summary');
		summary.textContent = '';
		const width = chart.clientWidth || 800;
		const height = chart.clientHeight || 280;
		chart.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
		const values = curves ? [...curves.cars.flat(), ...curves.lower, ...curves.upper, ...curves.caar].filter(value => typeof value === 'number') : [];
		if (!values.length) {
			chart.appendChild(svg('text', { x: width / 2, y: height / 2, 'text-anchor': 'middle' }, TEXT.chartEmpty));
			return;
		}
		const periodCurves = study.curves[periodIndex];
		const articles = view === 'open' && curves === periodCurves.open ? periodCurves.openArticles : periodCurves.filingArticles;
		const hasArticles = !!articles && articles.some(count => count > 0);
		// The articles' strip under the minutes axis
		const strip = hasArticles ? 28 : 0;
		const left = 56;
		const right = 12;
		const top = 12;
		const bottom = 32 + strip;
		let low = Math.min(0, ...values);
		let high = Math.max(0, ...values);
		if (high - low < 0.1) {
			high += 0.05;
			low -= 0.05;
		}
		const minutes = curves.minutes;
		const x = index => left + (width - left - right) * index / Math.max(1, minutes.length - 1);
		const y = value => top + (height - top - bottom) * (high - value) / (high - low);
		// The value axis: about five round steps
		const step = niceStep((high - low) / 5);
		for (let value = Math.ceil(low / step) * step; value <= high + 1e-9; value += step) {
			chart.appendChild(svg('line', { class: Math.abs(value) < 1e-9 ? 'zero' : 'grid', x1: left, x2: width - right, y1: y(value), y2: y(value) }));
			chart.appendChild(svg('text', { x: left - 6, y: y(value) + 3, 'text-anchor': 'end' }, value.toFixed(step < 0.1 ? 2 : 1)));
		}
		// The minutes axis: about eight round steps, and the filing (or the open) at zero
		const minuteStep = niceStep(minutes.length / 8);
		minutes.forEach((minute, index) => {
			if (minute % minuteStep === 0) {
				chart.appendChild(svg('line', { class: minute === 0 ? 'zero' : 'grid', x1: x(index), x2: x(index), y1: top, y2: height - bottom }));
				chart.appendChild(svg('text', { x: x(index), y: height - bottom + 14, 'text-anchor': 'middle' }, String(minute)));
			}
		});
		chart.appendChild(svg('text', { x: left + (width - left - right) / 2, y: height - 4, 'text-anchor': 'middle' }, view === 'open' ? TEXT.minutesOpen : study.fomc ? TEXT.minutesRelease : study.firstPublic ? TEXT.minutesFirstPublic : TEXT.minutesAccepted));
		// The other of the two times of each event, dashed: the 8-K after its release, or the release before the 8-K
		if (view !== 'open') {
			let labelled = false;
			for (const minute of periodCurves.others || []) {
				const index = minutes.indexOf(minute);
				if (index < 0) {
					continue;
				}
				chart.appendChild(svg('line', { class: 'other', x1: x(index), x2: x(index), y1: top, y2: height - bottom }));
				if (!labelled) {
					chart.appendChild(svg('text', { class: 'other', x: x(index) + 3, y: top + 9 }, study.firstPublic ? TEXT.otherAccepted : TEXT.otherRelease));
					labelled = true;
				}
			}
		}
		// The articles a minute, all events together
		if (hasArticles) {
			const stripTop = height - bottom + 20;
			const stripHeight = strip - 8;
			const most = Math.max(...articles);
			const barWidth = Math.max(1.5, (width - left - right) / Math.max(1, minutes.length - 1));
			chart.appendChild(svg('text', { x: left - 6, y: stripTop + stripHeight / 2 + 3, 'text-anchor': 'end' }, TEXT.articles));
			articles.forEach((count, index) => {
				if (count > 0) {
					const barHeight = Math.max(2, stripHeight * count / most);
					const bar = svg('rect', { class: 'articles', x: x(index) - barWidth / 2, y: stripTop + stripHeight - barHeight, width: barWidth, height: barHeight });
					bar.appendChild(svg('title', {}, minutes[index] + ': ' + count));
					chart.appendChild(bar);
				}
			});
		}
		const path = series => {
			let d = '';
			let pen = 'M';
			series.forEach((value, index) => {
				if (typeof value === 'number') {
					d += pen + x(index).toFixed(1) + ' ' + y(value).toFixed(1) + ' ';
					pen = 'L';
				} else {
					pen = 'M';
				}
			});
			return d;
		};
		for (const car of curves.cars) {
			if (car.some(value => typeof value === 'number')) {
				chart.appendChild(svg('path', { class: 'event', d: path(car) }));
			}
		}
		// The band where there are two events or more
		let band = '';
		let run = [];
		const flush = () => {
			if (run.length > 1) {
				band += 'M' + run.map(index => x(index).toFixed(1) + ' ' + y(curves.upper[index]).toFixed(1)).join(' L') + ' L' + [...run].reverse().map(index => x(index).toFixed(1) + ' ' + y(curves.lower[index]).toFixed(1)).join(' L') + ' Z ';
			}
			run = [];
		};
		curves.upper.forEach((value, index) => typeof value === 'number' ? run.push(index) : flush());
		flush();
		if (band) {
			chart.appendChild(svg('path', { class: 'band', d: band }));
		}
		chart.appendChild(svg('path', { class: 'caar', d: path(curves.caar) }));

		const last = lastValue(curves.caar);
		if (last) {
			const count = curves.counts[last.index];
			const margin = typeof curves.upper[last.index] === 'number' ? (curves.upper[last.index] - last.value) / 1.96 : undefined;
			if (study.fomc) {
				const unit = study.instruments[instrumentIndex].unit;
				summary.textContent = count > 1 && margin
					? format(TEXT.meanAt, minutes[last.index], signed(last.value, 2), unit, (last.value / margin).toFixed(2), count)
					: format(TEXT.meanAtOne, minutes[last.index], signed(last.value, 2), unit);
				return;
			}
			summary.textContent = count > 1 && margin
				? format(TEXT.caarAt, minutes[last.index], percent(last.value), (last.value / margin).toFixed(2), count)
				: format(TEXT.caarAtOne, minutes[last.index], percent(last.value));
		}
	}

	function niceStep(raw) {
		const power = Math.pow(10, Math.floor(Math.log10(raw)));
		const scaled = raw / power;
		return (scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10) * power;
	}

	/** The releases of an FOMC study, with each instrument's move at the end of the period. */
	function renderReleases(container) {
		if (!study.events.length) {
			container.appendChild(element('div', 'empty', TEXT.noReleases));
			return;
		}
		const instrumentCurves = study.curves[periodIndex].instruments;
		const table = element('table');
		const head = element('tr');
		for (const label of [TEXT.releaseTime, TEXT.releaseTitle, TEXT.kinds, TEXT.bars, TEXT.status]) {
			head.appendChild(element('th', '', label));
		}
		for (const instrument of study.instruments) {
			const cell = element('th', 'number', instrument.code);
			cell.title = instrument.label + ', ' + instrument.unit;
			head.appendChild(cell);
		}
		table.appendChild(head);
		// The newest first
		study.events.map((event, index) => ({ event, index })).reverse().forEach(({ event, index }) => {
			const row = element('tr', event.capturing ? 'capturing' : '');
			row.appendChild(element('td', '', event.time));
			const title = element('td');
			const link = element('button', 'link', event.title);
			link.addEventListener('click', () => vscode.postMessage({ command: 'openUrl', url: event.url }));
			title.append(link, ' \u00b7 ', newsLink(event));
			row.appendChild(title);
			row.appendChild(element('td', '', event.kinds));
			row.appendChild(element('td', '', event.bars));
			row.appendChild(element('td', '', event.status));
			instrumentCurves.forEach(curves => {
				const last = curves.cars[index] ? lastValue(curves.cars[index]) : undefined;
				row.appendChild(element('td', 'number' + (last ? (last.value >= 0 ? ' up' : ' down') : ''), last ? signed(last.value, 2) : ''));
			});
			table.appendChild(row);
		});
		const scroll = element('div', 'tableScroll');
		scroll.appendChild(table);
		container.appendChild(scroll);
	}

	/** A link opening Media Coverage on the news around the event. */
	function newsLink(event) {
		const news = element('button', 'link', TEXT.news);
		news.title = TEXT.newsHint;
		news.addEventListener('click', () => vscode.postMessage({ command: 'mediaCoverage', folder: study.folder, accession: event.accession }));
		return news;
	}

	function renderEvents() {
		const container = document.getElementById('events');
		container.textContent = '';
		if (study.fomc) {
			renderReleases(container);
			return;
		}
		if (!study.events.length) {
			container.appendChild(element('div', 'empty', TEXT.noEvents));
			return;
		}
		const curves = curvesShown();
		const betas = study.curves[periodIndex].betas;
		const table = element('table');
		const head = element('tr');
		for (const [label, number] of [[TEXT.released], [TEXT.accepted], [TEXT.lead], [TEXT.company], [TEXT.form], [TEXT.session], [TEXT.status], [TEXT.car + ' %', true], ...(study.marketModel ? [[TEXT.beta, true]] : [])]) {
			head.appendChild(element('th', number ? 'number' : '', label));
		}
		table.appendChild(head);
		// The newest first
		study.events.map((event, index) => ({ event, index })).reverse().forEach(({ event, index }) => {
			const row = element('tr', event.capturing ? 'capturing' : '');
			// The release's time, and its newswire opening it
			const release = element('td', '', event.released);
			if (event.releaseUrl) {
				const wire = element('button', 'link', event.releaseWire);
				wire.title = event.releaseTitle;
				wire.addEventListener('click', () => vscode.postMessage({ command: 'openUrl', url: event.releaseUrl }));
				release.append(' ', wire);
			}
			row.appendChild(release);
			row.appendChild(element('td', '', event.accepted));
			row.appendChild(element('td', '', event.lead));
			const company = element('td');
			const link = element('button', 'link', event.name + (event.ticker ? ' (' + event.ticker + ')' : ''));
			link.addEventListener('click', () => vscode.postMessage({ command: 'openUrl', url: event.url }));
			company.append(link, ' \u00b7 ', newsLink(event));
			row.appendChild(company);
			row.appendChild(element('td', '', event.form));
			row.appendChild(element('td', '', event.session));
			row.appendChild(element('td', '', event.status));
			const last = curves && curves.cars[index] ? lastValue(curves.cars[index]) : undefined;
			row.appendChild(element('td', 'number' + (last ? (last.value >= 0 ? ' up' : ' down') : ''), last ? percent(last.value) : ''));
			if (study.marketModel) {
				row.appendChild(element('td', 'number', typeof betas[index] === 'number' ? betas[index].toFixed(2) : ''));
			}
			table.appendChild(row);
		});
		container.appendChild(table);
	}

	document.querySelectorAll('input[name="model"]').forEach(input => input.addEventListener('change', updateForm));
	document.querySelectorAll('input[name="kind"], input[name="estimator"], input[name="estimand"], select.column, #effect, #family, #exposureAt').forEach(input => input.addEventListener('change', updateForm));
	document.getElementById('exposureAt').addEventListener('input', updateForm);
	// A treatment indicator or a first-treated column: guess the column again
	document.querySelectorAll('input[name="treatedBy"]').forEach(input => input.addEventListener('change', () => {
		document.getElementById('panelTreated').value = '';
		renderData();
	}));
	document.getElementById('chooseData').addEventListener('click', () => vscode.postMessage({ command: 'chooseData' }));
	document.querySelectorAll('input[name="release"], input[name="instrument"]').forEach(input => input.addEventListener('change', updateForm));
	document.querySelectorAll('input[name="source"]').forEach(input => input.addEventListener('change', () => {
		// Each source has its own period: the filing's half hour before to two hours after, the release's tight window
		periods = [Object.assign({}, source() === 'fomc' ? FOMC_PERIOD : DEFAULT_PERIOD)];
		renderPeriods();
		updateForm();
	}));
	alertElement.addEventListener('change', () => {
		const alert = state.alerts.find(alert => alert.id === alertElement.value);
		if (alert && !titleElement.value.trim()) {
			titleElement.value = alert.name;
		}
		updateForm();
	});
	document.getElementById('addAlert').addEventListener('click', () => vscode.postMessage({ command: 'addAlert' }));
	document.getElementById('addPeriod').addEventListener('click', () => {
		const period = source() === 'fomc' ? FOMC_PERIOD : DEFAULT_PERIOD;
		periods.push({ name: '', before: period.before, after: period.after, nextOpen: false });
		renderPeriods();
		updateForm();
	});
	createElement.addEventListener('click', () => {
		const alert = state.alerts.find(alert => alert.id === alertElement.value);
		const fomc = source() === 'fomc';
		const panel = kind() === 'panel';
		createElement.disabled = true;
		vscode.postMessage({
			command: 'create',
			title: titleElement.value.trim() || (panel ? '' : fomc ? TEXT.fomcTitle : alert ? alert.name : ''),
			source: panel ? 'panel' : source(),
			panel: panel ? panelForm() : undefined,
			alert: alertElement.value,
			releases: checked('release'),
			instruments: checked('instrument'),
			benchmark: document.getElementById('benchmark').value,
			model: model(),
			eventTime: document.querySelector('input[name="eventTime"]:checked').value,
			estimationDays: Number(document.getElementById('estimationDays').value),
			periods,
			groupBy: document.getElementById('groupBy').value,
		});
	});
	document.getElementById('period').addEventListener('change', event => { periodIndex = Number(event.target.value); renderStudy(); });
	document.getElementById('instrument').addEventListener('change', event => { instrumentIndex = Number(event.target.value); renderStudy(); });
	document.getElementById('openFolder').addEventListener('click', () => study && vscode.postMessage({ command: 'openFolder', folder: study.folder }));
	document.getElementById('openNotebook').addEventListener('click', () => study && vscode.postMessage({ command: 'openNotebook', folder: study.folder }));
	document.getElementById('openStudyFile').addEventListener('click', () => study && vscode.postMessage({ command: 'openStudyFile', folder: study.folder }));
	window.addEventListener('resize', () => drawChart());

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			state = message;
			if (study && study.folder !== state.selected) {
				study = undefined;
			}
			renderAlerts();
			renderStudies();
		} else if (message.command === 'study') {
			if (!study || study.folder !== message.folder) {
				periodIndex = 0;
				instrumentIndex = 0;
				view = 'filing';
			}
			study = message;
			renderStudy();
		} else if (message.command === 'chooseAlert') {
			// Started from a fired alert: the form with its alert chosen, named after it
			const alert = state.alerts.find(alert => alert.id === message.alert);
			if (alert) {
				document.querySelector('input[name="kind"][value="market"]').checked = true;
				document.querySelector('input[name="source"][value="filings"]').checked = true;
				alertElement.value = alert.id;
				titleElement.value = alert.name;
				updateForm();
				titleElement.scrollIntoView({ block: 'center' });
				titleElement.focus();
			}
		} else if (message.command === 'data') {
			data = message;
			renderData();
			// A file that is not a table, named with why, cannot make a study
			if (!message.columns.length) {
				data = undefined;
				updateForm();
			}
		} else if (message.command === 'created') {
			titleElement.value = '';
			data = undefined;
			renderData();
			periods = [Object.assign({}, source() === 'fomc' ? FOMC_PERIOD : DEFAULT_PERIOD)];
			renderPeriods();
			updateForm();
		}
	});

	renderPeriods();
	renderData();
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: SHOW_EVENT_STUDIES_COMMAND_ID,
			title: localize2('eventStudies.showAction', "Event Studies..."),
			category: localize2('eventStudies.category', "Compose"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor, folder?: string, alertId?: string): void {
		openEventStudiesPage(accessor, typeof folder === 'string' ? folder : undefined, typeof alertId === 'string' ? alertId : undefined);
	}
});
