/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IntervalTimer, RunOnceScheduler } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable, DisposableMap } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { parseToml, TomlValue } from '../../model/browser/common/tomlPanelData.js';
import { describeSubject, IAlertsService, IFiler, IFiredAlert, IMinuteBar } from './alertsService.js';
import { parseCsv, writeCsv } from './csv.js';
import { eventStudyNotebook, fomcStudyNotebook } from './eventStudyNotebook.js';
import { FIVE_MINUTE_KEPT_MILLISECONDS, FOMC_FEED, FOMC_RELEASES, FomcRelease, fomcRelease, instrumentScale, instrumentSymbol, instrumentUnit } from './fomcReleases.js';
import { ICoverageItem, IMediaCoverageService } from './mediaCoverageService.js';
import { IPrNewswireService } from './prNewswireService.js';
import { IRssFeedsService, IRssItem } from './rssFeedsService.js';

/**
 * A period around an event that a study looks at: from `before` minutes before the event's time to `after` minutes
 * after it, and, with `nextOpen`, an event outside the regular session also from the next open to `after` minutes
 * after it.
 */
export interface IEventPeriod {
	readonly name: string;
	readonly before: number;
	readonly after: number;
	readonly nextOpen: boolean;
}

/**
 * How a study takes the normal return out: the benchmark's return (market-adjusted), or the benchmark's return times
 * the stock's beta over the estimation days before the event, plus its alpha (the market model).
 */
export type EventModel = 'marketAdjusted' | 'marketModel';

/**
 * What a study takes as an event's time: the first public time, the earlier of the company's newswire release and
 * EDGAR's acceptance, as results are often on the wires before the 8-K; or EDGAR's acceptance alone.
 */
export type EventTime = 'firstPublic' | 'accepted';

/** What a study's events are: the filings of an alert on SEC filings, or the FOMC's releases. */
export type EventSource = 'filings' | 'fomc';

/** An event study as ~/.pollis/event-studies/<folder>/study.toml keeps it, which the user may also edit by hand. */
export interface IEventStudy {
	/** The study's folder in ~/.pollis/event-studies. */
	readonly folder: string;
	readonly title: string;
	readonly source: EventSource;
	/** For filings: the id of the newFiling alert whose filings are the events. */
	readonly alert: string;
	/** For FOMC releases: the releases that are events. */
	readonly releases: readonly FomcRelease[];
	/** For FOMC releases: the instruments whose moves the study measures, by their codes (FF1, SFR2, ^TNX). */
	readonly instruments: readonly string[];
	/** A Yahoo Finance symbol: ^GSPC. */
	readonly benchmark: string;
	readonly model: EventModel;
	readonly eventTime: EventTime;
	/** For the market model: the trading days before the event its alpha and beta are estimated on. */
	readonly estimationDays: number;
	readonly periods: readonly IEventPeriod[];
	/** What PollisEventStudies.jl groups the filings by: form, item, session or ticker; empty for no groups. */
	readonly groupBy?: string;
	/** When the study was made, in milliseconds since 1970: the alerts fired from then on are its events. */
	readonly created: number;
	/** Whether the filings its alert would have fired in the 30 days before it was made are among its events. */
	readonly backfilled: boolean;
	/** Set when the backfill found more filings than EDGAR's full-text search reads, so that some are not among them. */
	readonly backfillCapped?: boolean;
}

/**
 * Where an event's prices are: waiting for when EDGAR accepted it, or for the SEC contact; capturing them; complete;
 * or none, as the filer has no ticker, Yahoo Finance has no bars for it, or it is older than the 30 days Yahoo
 * Finance keeps minute bars for.
 */
export type EventStatus = 'waiting' | 'capturing' | 'complete' | 'noTicker' | 'noBars' | 'tooOld';

/** A filing of a study, a line of its events.csv. */
export interface IStudyEvent {
	readonly accession: string;
	/** The filer's CIK, without the leading zeros. */
	readonly cik: string;
	readonly name: string;
	readonly ticker?: string;
	readonly form: string;
	readonly items?: readonly string[];
	readonly filed: string;
	/** When EDGAR accepted it, in milliseconds since 1970. */
	readonly accepted?: number;
	/** Whether the event's time is during the regular session of the stock's market; known from the first prices. */
	readonly duringSession?: boolean;
	/** For an event outside the regular session: the next open, in milliseconds since 1970. */
	readonly nextOpen?: number;
	readonly status: EventStatus;
	readonly url: string;
	/** When the company's newswire release went out, in milliseconds since 1970, as Google News lists it. */
	readonly released?: number;
	/** The newswire, its title and its address. */
	readonly releaseWire?: string;
	readonly releaseTitle?: string;
	readonly releaseUrl?: string;
	/** When the news around the event was last looked for, in milliseconds since 1970. */
	readonly newsChecked?: number;
	/** The minutes each of its bars spans: 5 for an FOMC release older than the 30 days of minute bars. */
	readonly barMinutes?: number;
}

/** An event's time, in milliseconds since 1970, as its study takes it; undefined while EDGAR's acceptance is not known. */
export function eventTime(study: IEventStudy, event: IStudyEvent): number | undefined {
	if (event.accepted === undefined) {
		return undefined;
	}
	return study.eventTime === 'firstPublic' && event.released !== undefined ? Math.min(event.released, event.accepted) : event.accepted;
}

export interface IEventStudiesService {
	readonly _serviceBrand: undefined;
	/** Fires when the studies or their events change. */
	readonly onDidChange: Event<void>;
	readonly studiesFolder: URI;
	getStudies(): readonly IEventStudy[];
	getEvents(folder: string): readonly IStudyEvent[];
	/**
	 * Makes a study in a new folder named after its title: the filings its alert would have fired in the last 30 days
	 * are its first events, and those it fires from now on the next.
	 */
	createStudy(study: Omit<IEventStudy, 'folder' | 'created' | 'backfilled' | 'backfillCapped'>): Promise<IEventStudy>;
	/** The minute bars of an event's prices file, the stock's and the benchmark's, by symbol. */
	getPrices(folder: string, accession: string): Promise<ReadonlyMap<string, readonly IMinuteBar[]>>;
	/** The articles of an event's news file, from a day before EDGAR accepted it to a day after, oldest first. */
	getNews(folder: string, accession: string): Promise<readonly ICoverageItem[]>;
	/** A study's study.ipynb, written when it is not there; the user's own changes to it are kept. */
	getNotebook(folder: string): Promise<URI>;
}

export const IEventStudiesService = createDecorator<IEventStudiesService>('pollisEventStudiesService');

/** Opens the Event Studies page: on the study in a folder, or with an alert chosen for a new study. */
export const SHOW_EVENT_STUDIES_COMMAND_ID = 'pollis.eventStudies.show';

/** The period a study has unless it says otherwise: half an hour before to two hours after, and the next open. */
export const DEFAULT_EVENT_PERIOD: IEventPeriod = { name: 'Default', before: 30, after: 120, nextOpen: true };
export const DEFAULT_BENCHMARK = '^GSPC';
const DEFAULT_ESTIMATION_DAYS = 5;

// The window that captures the prices, so that each is fetched once however many windows are open
const LEASE_KEY = 'pollis.eventStudies.lease';
const LEASE_MILLISECONDS = 150_000;
const TICK_MILLISECONDS = 60_000;
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
// Yahoo Finance keeps minute bars for 30 days; a little less, so that the first request is not refused
const KEPT_MILLISECONDS = 29.5 * DAY;
// The days before a study was made whose filings are its first events: as many as Yahoo Finance keeps minute bars for
const BACKFILL_DAYS = 30;
// How long a filing accepted outside the regular session waits for the next open (a long weekend)
const NEXT_OPEN_MILLISECONDS = 5 * DAY;
// The bars of the last minutes are fetched again, as Yahoo Finance completes a minute after it ends
const REFETCH_MILLISECONDS = 5 * MINUTE;
const SETTLE_MILLISECONDS = 3 * MINUTE;
// The news is looked for every quarter of an hour until three hours after EDGAR accepted the filing, and once for an older one
const NEWS_EVERY_MILLISECONDS = 15 * MINUTE;
const NEWS_UNTIL_MILLISECONDS = 180 * MINUTE;
// The events whose news is looked for in a pass of work, as each is two searches of Google News
const NEWS_PER_PASS = 10;
// How often the Federal Reserve's feed is read for new FOMC releases
const FOMC_FEED_EVERY_MILLISECONDS = 5 * MINUTE;

const EVENTS_HEADER = ['accession', 'cik', 'name', 'ticker', 'form', 'items', 'filed', 'accepted', 'during_session', 'next_open', 'status', 'url', 'event_time', 'released', 'release_wire', 'release_title', 'release_url', 'news_checked', 'bar_minutes'];
const INSTRUMENTS_HEADER = ['accession', 'event_time', 'instrument', 'symbol', 'unit', 'scale', 'bar_minutes'];
const PRICES_HEADER = ['time', 'session', 'symbol', 'open', 'high', 'low', 'close', 'volume'];
const NEWS_HEADER = ['time', 'outlet', 'title', 'url'];

export class EventStudiesService extends Disposable implements IEventStudiesService {

	declare readonly _serviceBrand: undefined;

	private readonly _onDidChange = this._register(new Emitter<void>());
	// Whether a study's prices were written in this pass of work
	private pricesWritten = false;
	// The events whose news may still be looked for in this pass of work
	private newsLeft = 0;
	// The event time each study had in the last pass of work, as a study.toml edited by hand may change it
	private readonly eventTimes = new Map<string, EventTime>();
	readonly onDidChange = this._onDidChange.event;

	readonly studiesFolder: URI;
	private readonly owner = generateUuid();
	private studies: IEventStudy[] = [];
	private readonly events = new Map<string, IStudyEvent[]>();
	// A watcher of each study's folder, for its study.toml and events.csv
	private readonly watchers = this._register(new DisposableMap<string>());
	private readonly reload: RunOnceScheduler;
	private working = false;
	// When the Federal Reserve's feed was last read
	private fomcRead = 0;
	// The alerts a study is being made for, as it starts when they fire
	private readonly starting = new Set<string>();
	private loaded: Promise<void>;

	constructor(
		@IAlertsService private readonly alertsService: IAlertsService,
		@IMediaCoverageService private readonly mediaCoverageService: IMediaCoverageService,
		@IPrNewswireService private readonly prNewswireService: IPrNewswireService,
		@IRssFeedsService private readonly rssFeedsService: IRssFeedsService,
		@IStorageService private readonly storageService: IStorageService,
		@IFileService private readonly fileService: IFileService,
		@IPathService pathService: IPathService,
	) {
		super();
		this.studiesFolder = joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'event-studies');
		this.loaded = this.readStudies().then(() => this._onDidChange.fire());

		// The files change when another window records events, or the user makes a study or edits its study.toml
		this.reload = this._register(new RunOnceScheduler(async () => {
			await this.readStudies();
			this._onDidChange.fire();
		}, 200));
		const watcher = this._register(this.fileService.createWatcher(this.studiesFolder, { recursive: false, excludes: [] }));
		this._register(watcher.onDidChange(() => this.reload.schedule()));

		// A filing that fires is an event at once, not at the next tick
		const soon = this._register(new RunOnceScheduler(() => this.work(), 1000));
		this._register(this.alertsService.onDidFire(fired => {
			if (fired.some(alert => alert.filing && this.studies.some(study => study.alert === alert.alertId))) {
				soon.schedule();
			}
			this.startStudies(fired);
		}));

		const timer = this._register(new IntervalTimer());
		timer.cancelAndSet(() => this.work(), TICK_MILLISECONDS);
		this.loaded.then(() => this.work());
	}

	getStudies(): readonly IEventStudy[] {
		return this.studies;
	}

	getEvents(folder: string): readonly IStudyEvent[] {
		return this.events.get(folder) ?? [];
	}

	async createStudy(study: Omit<IEventStudy, 'folder' | 'created' | 'backfilled' | 'backfillCapped'>): Promise<IEventStudy> {
		await this.loaded;
		const base = study.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'event-study';
		const taken = new Set(this.studies.map(other => other.folder));
		let folder = base;
		for (let index = 2; taken.has(folder) || await this.fileService.exists(joinPath(this.studiesFolder, folder)); index++) {
			folder = `${base}-${index}`;
		}
		const created: IEventStudy = { ...study, folder, created: Date.now(), backfilled: false };
		await this.fileService.writeFile(joinPath(this.studiesFolder, folder, 'study.toml'), VSBuffer.fromString(writeStudy(created)));
		await this.writeEvents(folder, []);
		this.studies = [...this.studies, created];
		this.prNewswireService.setWanted('eventStudies', this.studies.some(other => other.source === 'filings'));
		this.events.set(folder, []);
		await this.getNotebook(folder);
		this._onDidChange.fire();
		// Watches the new folder, and the studies' folder when it was made just now
		this.reload.schedule();
		this.work();
		return created;
	}

	/**
	 * Makes a study, with the benchmark, model and period a study has unless it says otherwise, for each alert that
	 * fired a filing, starts one when it fires and has none yet; in the window that captures the prices, so once.
	 */
	private async startStudies(fired: readonly IFiredAlert[]): Promise<void> {
		await this.loaded;
		for (const alertId of new Set(fired.filter(alert => alert.filing).map(alert => alert.alertId))) {
			const alert = this.alertsService.getAlerts().find(alert => alert.id === alertId);
			if (!alert?.eventStudy || this.starting.has(alertId) || this.studies.some(study => study.alert === alertId) || !this.holdLease()) {
				continue;
			}
			this.starting.add(alertId);
			try {
				await this.createStudy({ title: describeSubject(alert), source: 'filings', alert: alertId, releases: [], instruments: [], benchmark: DEFAULT_BENCHMARK, model: 'marketAdjusted', eventTime: 'firstPublic', estimationDays: DEFAULT_ESTIMATION_DAYS, periods: [DEFAULT_EVENT_PERIOD] });
			} finally {
				this.starting.delete(alertId);
			}
		}
	}

	async getNotebook(folder: string): Promise<URI> {
		const notebook = joinPath(this.studiesFolder, folder, 'study.ipynb');
		if (!await this.fileService.exists(notebook)) {
			const path = joinPath(this.studiesFolder, folder).fsPath;
			const fomc = this.studies.find(study => study.folder === folder)?.source === 'fomc';
			await this.fileService.writeFile(notebook, VSBuffer.fromString(fomc ? fomcStudyNotebook(path) : eventStudyNotebook(path)));
		}
		return notebook;
	}

	async getPrices(folder: string, accession: string): Promise<ReadonlyMap<string, readonly IMinuteBar[]>> {
		const prices = await this.readPrices(folder, accession);
		const bySymbol = new Map<string, IMinuteBar[]>();
		for (const [symbol, bars] of prices) {
			bySymbol.set(symbol, [...bars.values()].sort((a, b) => a.time - b.time));
		}
		return bySymbol;
	}

	async getNews(folder: string, accession: string): Promise<readonly ICoverageItem[]> {
		try {
			const rows = parseCsv((await this.fileService.readFile(this.newsFile(folder, accession))).value.toString());
			return rows.slice(1).map(([time, outlet, title, url]) => ({ source: 'googleNews' as const, time: Date.parse(time), outlet, title, url })).filter(item => !isNaN(item.time));
		} catch {
			// No news looked for yet
			return [];
		}
	}

	/** Records the filings the studies' alerts fired and captures the prices around them, in the window that holds the lease. */
	private async work(): Promise<void> {
		if (this.working || !this.holdLease()) {
			return;
		}
		this.working = true;
		try {
			await this.loaded;
			// The filers looked up in this pass, as a study has many events of the same filer
			const filers = new Map<string, Promise<IFiler | undefined>>();
			const getFiler = (cik: string) => {
				let filer = filers.get(cik);
				if (!filer) {
					filer = this.alertsService.getFiler(cik);
					filers.set(cik, filer);
				}
				return filer;
			};
			this.newsLeft = NEWS_PER_PASS;
			// The Federal Reserve's feed, read once in this pass for all the studies of FOMC releases, when it is due
			let feed: Promise<readonly IRssItem[] | undefined> | undefined;
			const getFeed = () => {
				if (!feed) {
					this.fomcRead = Date.now();
					feed = this.rssFeedsService.previewFeed(FOMC_FEED);
				}
				return feed;
			};
			for (let study of this.studies) {
				let events = this.getEvents(study.folder);
				// A study whose event time changed takes its sessions again from the prices, which span both times
				const previous = this.eventTimes.get(study.folder);
				this.eventTimes.set(study.folder, study.eventTime);
				if (previous && previous !== study.eventTime) {
					events = events.map((event): IStudyEvent => event.status === 'complete' || event.status === 'capturing' ? { ...event, duringSession: undefined, nextOpen: undefined, status: 'capturing' } : event);
				}
				if (study.source === 'fomc') {
					if (!study.backfilled || Date.now() - this.fomcRead >= FOMC_FEED_EVERY_MILLISECONDS || feed) {
						const recorded = await this.recordReleases(study, events, await getFeed());
						study = recorded.study;
						events = recorded.events;
					}
				} else {
					if (!study.backfilled) {
						const backfill = await this.backfill(study, events);
						if (backfill) {
							study = backfill.study;
							events = backfill.events;
						}
					}
					events = this.recordFired(study, events);
				}
				const updated: IStudyEvent[] = [];
				for (const event of events) {
					// A backfill's first pass is long: the lease is renewed as it goes, and the rest left to the next
					updated.push(!this.holdLease() ? event : study.source === 'fomc' ? await this.captureRelease(study, event) : await this.capture(study, event, getFiler));
				}
				if (updated.some((event, index) => event !== events[index]) || updated.length !== this.getEvents(study.folder).length) {
					this.events.set(study.folder, updated);
					await this.writeEvents(study.folder, updated);
					this._onDidChange.fire();
				} else if (this.pricesWritten) {
					// The page draws the prices as they come in
					this._onDidChange.fire();
				}
				this.pricesWritten = false;
			}
		} finally {
			this.working = false;
		}
	}

	/**
	 * The study and its events once the filings its alert would have fired in the 30 days before it was made are among
	 * them, which EDGAR's full-text search finds by the alert's companies, forms, items and phrase; undefined when the
	 * alert is not found yet, or the SEC cannot be reached or there is no SEC contact, to be tried again.
	 */
	private async backfill(study: IEventStudy, events: readonly IStudyEvent[]): Promise<{ readonly study: IEventStudy; readonly events: readonly IStudyEvent[] } | undefined> {
		const alert = this.alertsService.getAlerts().find(alert => alert.id === study.alert);
		if (!alert || alert.condition !== 'newFiling') {
			return undefined;
		}
		// A study.toml made by hand may not say when
		const created = study.created || Date.now();
		const found = await this.alertsService.searchFilings(alert, BACKFILL_DAYS + (Date.now() - created) / DAY);
		if (!found) {
			return undefined;
		}
		// The search goes by day, a day either side
		const first = new Date(created - BACKFILL_DAYS * DAY).toISOString().slice(0, 10);
		const known = new Set(events.map(event => event.accession));
		const fresh = found.filings.filter(filing => filing.filed >= first && !known.has(filing.accession)).map((filing): IStudyEvent => ({
			accession: filing.accession,
			cik: filing.cik,
			name: filing.name,
			form: filing.form,
			items: filing.items,
			filed: filing.filed,
			status: 'waiting',
			url: filing.url,
		}));
		const backfilled: IStudyEvent[] = [...fresh, ...events].sort((a, b) => a.filed.localeCompare(b.filed));
		study = { ...study, created, backfilled: true, backfillCapped: found.more || undefined };
		await this.fileService.writeFile(joinPath(this.studiesFolder, study.folder, 'study.toml'), VSBuffer.fromString(writeStudy(study)));
		this.studies = this.studies.map(other => other.folder === study.folder ? study : other);
		this.events.set(study.folder, backfilled);
		await this.writeEvents(study.folder, backfilled);
		this._onDidChange.fire();
		return { study, events: backfilled };
	}

	/**
	 * The study's events, with the filings its alert fired that are not among them yet: since the 30 days before the
	 * study was made, as the backfill's, so that the filing a study is started from is among them before EDGAR's
	 * full-text search has it.
	 */
	private recordFired(study: IEventStudy, events: readonly IStudyEvent[]): readonly IStudyEvent[] {
		const known = new Set(events.map(event => event.accession));
		const fresh: IStudyEvent[] = [];
		for (const fired of [...this.alertsService.getFired()].reverse()) {
			const filing = fired.filing;
			if (fired.alertId !== study.alert || !filing || fired.time < study.created - BACKFILL_DAYS * DAY || known.has(filing.accession)) {
				continue;
			}
			known.add(filing.accession);
			const accepted = filing.accepted ? Date.parse(filing.accepted) : undefined;
			fresh.push({
				accession: filing.accession,
				// A filing alert's fired symbol is its filer's CIK
				cik: fired.symbol,
				name: fired.name ?? fired.symbol,
				form: filing.form,
				items: filing.items,
				filed: filing.filed,
				accepted: accepted !== undefined && !isNaN(accepted) ? accepted : undefined,
				status: 'waiting',
				url: filing.url,
			});
		}
		return fresh.length ? [...events, ...fresh] : events;
	}

	/**
	 * The study and its events with the FOMC releases of the Federal Reserve's feed that are not among them yet, from
	 * the 59 days before the study was made, as long as Yahoo Finance keeps five-minute bars: the releases that came
	 * out at the same time (the statement and the Summary of Economic Projections) are one event.
	 */
	private async recordReleases(study: IEventStudy, events: readonly IStudyEvent[], items: readonly IRssItem[] | undefined): Promise<{ readonly study: IEventStudy; readonly events: readonly IStudyEvent[] }> {
		if (!items) {
			// The Federal Reserve cannot be reached: read again in five minutes
			return { study, events };
		}
		const created = study.created || Date.now();
		const known = new Set(events.map(event => event.accession));
		const byTime = new Map<number, IRssItem[]>();
		for (const item of items) {
			if (item.date && item.date >= created - FIVE_MINUTE_KEPT_MILLISECONDS) {
				byTime.set(item.date, [...byTime.get(item.date) ?? [], item]);
			}
		}
		const fresh: IStudyEvent[] = [];
		for (const [time, released] of byTime) {
			const kinds = FOMC_RELEASES.filter(kind => released.some(item => fomcRelease(item.title) === kind));
			const accession = `fomc-${new Date(time).toISOString().slice(0, 16).replace(/[-:]/g, '')}`;
			if (known.has(accession) || !kinds.some(kind => study.releases.includes(kind))) {
				continue;
			}
			// The statement names the event when it is among them
			const first = released.find(item => fomcRelease(item.title) === kinds[0]) ?? released[0];
			fresh.push({
				accession,
				cik: '',
				name: first.title,
				form: kinds.join(' '),
				filed: new Date(time).toISOString().slice(0, 10),
				accepted: time,
				status: 'capturing',
				url: first.link,
			});
		}
		if (study.backfilled && !fresh.length) {
			return { study, events };
		}
		const recorded = [...events, ...fresh].sort((a, b) => (a.accepted ?? 0) - (b.accepted ?? 0));
		if (!study.backfilled) {
			study = { ...study, created, backfilled: true };
			await this.fileService.writeFile(joinPath(this.studiesFolder, study.folder, 'study.toml'), VSBuffer.fromString(writeStudy(study)));
			this.studies = this.studies.map(other => other.folder === study.folder ? study : other);
		}
		return { study, events: recorded };
	}

	/**
	 * An FOMC release once the bars of the study's instruments over its periods are fetched: minute bars for a release of
	 * the last 30 days, five-minute bars for an older one; an expired contract has none. The same event when nothing changed.
	 */
	private async captureRelease(study: IEventStudy, event: IStudyEvent): Promise<IStudyEvent> {
		const now = Date.now();
		const time = event.accepted;
		if (event.status !== 'capturing' || time === undefined) {
			return event;
		}
		const prices = await this.readPrices(study.folder, event.accession);
		const stored = [...prices.values()].some(bars => bars.size);
		if (now - time > FIVE_MINUTE_KEPT_MILLISECONDS) {
			return { ...event, status: stored ? 'complete' : 'tooOld' };
		}
		const minutes = event.barMinutes === 5 || now - time > KEPT_MILLISECONDS ? 5 : 1;
		const start = time - Math.max(0, ...study.periods.map(period => period.before)) * MINUTE;
		const end = time + Math.max(0, ...study.periods.map(period => period.after)) * MINUTE;
		const last = stored ? Math.max(...[...prices.values()].flatMap(bars => [...bars.keys()])) : undefined;
		const from = last !== undefined ? Math.max(start, last - REFETCH_MILLISECONDS) : start;
		const to = Math.min(now, end + SETTLE_MILLISECONDS);
		if (from < to) {
			let reached = false;
			for (const symbol of new Set(study.instruments.map(code => instrumentSymbol(code, time)))) {
				// A contract that expired is gone from Yahoo Finance
				const bars = await this.alertsService.getMinuteBars(symbol, from, to, minutes);
				if (bars) {
					reached = true;
					merge(prices, symbol, bars.bars);
				}
			}
			if (!reached) {
				// Yahoo Finance cannot be reached: tried again at the next tick
				return event;
			}
			await this.writePrices(study.folder, event.accession, prices);
			this.pricesWritten = true;
		}
		const barMinutes = minutes === 5 ? 5 : undefined;
		const done = now >= end + SETTLE_MILLISECONDS;
		const status: EventStatus = !done ? 'capturing' : [...prices.values()].some(bars => bars.size) ? 'complete' : 'noBars';
		return status === event.status && barMinutes === event.barMinutes ? event : { ...event, status, barMinutes };
	}

	/** The event once its ticker and acceptance are known and the prices due are fetched; the same event when nothing changed. */
	private async capture(study: IEventStudy, event: IStudyEvent, getFiler: (cik: string) => Promise<IFiler | undefined>): Promise<IStudyEvent> {
		const now = Date.now();
		if (event.status === 'waiting') {
			const filer = await getFiler(event.cik);
			if (!filer) {
				// No SEC contact, or the SEC cannot be reached: tried again at the next tick
				return event;
			}
			const filing = filer.filings.find(filing => filing.accession === event.accession);
			const accepted = event.accepted ?? (filing?.accepted ? Date.parse(filing.accepted) : undefined);
			// The filing's main document, where full-text search found one of its documents
			const url = filing?.url ?? event.url;
			const ticker = event.ticker ?? filer.tickers[0];
			if (accepted === undefined || isNaN(accepted)) {
				// A filing full-text search found may be in the filer's submissions a little later
				return now - Date.parse(event.filed) > KEPT_MILLISECONDS ? { ...event, status: 'tooOld' } : event;
			}
			event = { ...event, accepted, ticker, url, status: !ticker ? 'noTicker' : now - accepted > KEPT_MILLISECONDS ? 'tooOld' : 'capturing' };
		}
		if (event.ticker && (event.status === 'capturing' || event.status === 'complete')) {
			event = await this.checkNews(study, event, now);
		}
		const time = eventTime(study, event);
		if (event.status !== 'capturing' || !event.ticker || event.accepted === undefined || time === undefined) {
			return event;
		}

		const accepted = event.accepted;
		// The prices span both the release and the acceptance, so that a study may take either as the event's time
		const earliest = Math.min(time, accepted);
		const before = Math.max(0, ...study.periods.map(period => period.before)) * MINUTE;
		// The market model's estimation days, with the weekends and a holiday among them
		const estimation = study.model === 'marketModel' ? Math.ceil(study.estimationDays * 7 / 5 + 2) * DAY : 0;
		const start = Math.max(earliest - Math.max(before, estimation), now - KEPT_MILLISECONDS);
		const prices = await this.readPrices(study.folder, event.accession);
		const stored = prices.get(event.ticker);
		const last = stored?.size ? Math.max(...stored.keys()) : undefined;
		// From the start while the sessions are not known: the first fetch, or once the event's time moved
		const from = last !== undefined && event.duringSession !== undefined ? Math.max(start, last - REFETCH_MILLISECONDS) : start;

		const after = Math.max(0, ...study.periods.map(period => period.after)) * MINUTE;
		const afterOpen = Math.max(0, ...study.periods.filter(period => period.nextOpen).map(period => period.after)) * MINUTE;
		// Up to the end of the periods, or, while the next open is not known, as long as it is waited for
		const latest = Math.max(time + after, accepted + after, event.nextOpen !== undefined ? event.nextOpen + afterOpen : event.duringSession || !afterOpen ? 0 : time + NEXT_OPEN_MILLISECONDS + afterOpen);
		const to = Math.min(now, latest + SETTLE_MILLISECONDS);
		if (from >= to) {
			// Its span is past, and either captured or beyond the 30 days
			return { ...event, status: stored?.size ? 'complete' : 'tooOld' };
		}
		const stock = await this.alertsService.getMinuteBars(event.ticker, from, to);
		const benchmark = await this.alertsService.getMinuteBars(study.benchmark, from, to);
		if (!stock || !benchmark) {
			// Yahoo Finance cannot be reached, or does not know the ticker
			return !stock && !stored?.size && now - accepted > DAY ? { ...event, status: 'noBars' } : event;
		}
		merge(prices, event.ticker, stock.bars);
		merge(prices, study.benchmark, benchmark.bars);
		await this.writePrices(study.folder, event.accession, prices);
		this.pricesWritten = true;

		// A fetch from the start begins before the event, so its sessions say whether the event came during the regular session
		const duringSession = event.duringSession ?? stock.sessions.some(([open, close]) => time >= open && time < close);
		const wantsNextOpen = !duringSession && study.periods.some(period => period.nextOpen);
		const nextOpen = event.nextOpen ?? (wantsNextOpen ? stock.sessions.find(([open]) => open > time)?.[0] : undefined);
		// While the next open is not known yet, the capture goes on, up to a long weekend
		const waitsForOpen = wantsNextOpen && nextOpen === undefined && now - time < NEXT_OPEN_MILLISECONDS;
		// So does it while the news may still move the event's time
		const waitsForNews = now < accepted + NEWS_UNTIL_MILLISECONDS;
		const end = Math.max(time + after, accepted + after, nextOpen !== undefined ? nextOpen + afterOpen : 0);
		const done = !waitsForOpen && !waitsForNews && now >= end + SETTLE_MILLISECONDS;
		const status: EventStatus = !done ? 'capturing' : prices.get(event.ticker)?.size ? 'complete' : 'noBars';
		return status === event.status && nextOpen === event.nextOpen && duringSession === event.duringSession ? event : { ...event, duringSession, nextOpen, status };
	}

	/**
	 * The event with the news around it looked for when it is due: its newswire release, and its articles written to
	 * its news file. A release that moves the event's first public time sets its sessions to be taken again, and a
	 * complete event to be captured again from its new start.
	 */
	private async checkNews(study: IEventStudy, event: IStudyEvent, now: number): Promise<IStudyEvent> {
		const accepted = event.accepted;
		if (accepted === undefined || this.newsLeft <= 0) {
			return event;
		}
		const due = event.newsChecked === undefined || (event.newsChecked < accepted + NEWS_UNTIL_MILLISECONDS && now - event.newsChecked >= NEWS_EVERY_MILLISECONDS);
		if (!due) {
			return event;
		}
		this.newsLeft--;
		const coverage = await this.mediaCoverageService.getEventCoverage(event.name, accepted, event.ticker);
		if (!coverage) {
			// Google News cannot be reached: looked for again in a quarter of an hour
			return { ...event, newsChecked: now };
		}
		if (coverage.items.length) {
			const rows = coverage.items.map(item => [new Date(item.time).toISOString(), item.outlet, item.title, item.url]);
			await this.fileService.writeFile(this.newsFile(study.folder, event.accession), VSBuffer.fromString(writeCsv([NEWS_HEADER, ...rows])));
		}
		const release = coverage.release;
		const checked: IStudyEvent = { ...event, newsChecked: now, released: release?.time, releaseWire: release?.outlet, releaseTitle: release?.title, releaseUrl: release?.url };
		const moved = Math.min(checked.released ?? accepted, accepted) !== Math.min(event.released ?? accepted, accepted);
		return moved ? { ...checked, duringSession: undefined, nextOpen: undefined, status: 'capturing' } : checked;
	}

	/** Takes or renews the lease when no other window holds it; whether this window holds it. */
	private holdLease(): boolean {
		let lease: { owner?: string; time?: number };
		try {
			lease = JSON.parse(this.storageService.get(LEASE_KEY, StorageScope.APPLICATION, '{}'));
		} catch {
			lease = {};
		}
		const now = Date.now();
		if (lease.owner && lease.owner !== this.owner && now - (lease.time ?? 0) < LEASE_MILLISECONDS) {
			return false;
		}
		this.storageService.store(LEASE_KEY, JSON.stringify({ owner: this.owner, time: now }), StorageScope.APPLICATION, StorageTarget.MACHINE);
		return true;
	}

	private async readStudies(): Promise<void> {
		let folders: string[];
		try {
			const stat = await this.fileService.resolve(this.studiesFolder);
			folders = (stat.children ?? []).filter(child => child.isDirectory).map(child => child.name);
		} catch {
			// No studies yet
			return;
		}
		const studies: IEventStudy[] = [];
		for (const folder of folders.sort()) {
			try {
				const content = (await this.fileService.readFile(joinPath(this.studiesFolder, folder, 'study.toml'))).value.toString();
				const study = readStudy(folder, parseToml(content));
				if (study) {
					studies.push(study);
					this.events.set(folder, await this.readEvents(folder));
				}
			} catch {
				// Not a study, or a file being edited
			}
		}
		this.studies = studies;
		// The events of a study of filings take the time of the company's release, which PR Newswire's feeds give
		this.prNewswireService.setWanted('eventStudies', studies.some(study => study.source === 'filings'));
		for (const folder of [...this.watchers.keys()]) {
			if (!studies.some(study => study.folder === folder)) {
				this.watchers.deleteAndDispose(folder);
			}
		}
		for (const study of studies) {
			if (!this.watchers.has(study.folder)) {
				const watcher = this.fileService.createWatcher(joinPath(this.studiesFolder, study.folder), { recursive: false, excludes: [] });
				watcher.onDidChange(() => this.reload.schedule());
				this.watchers.set(study.folder, watcher);
			}
		}
	}

	private async readEvents(folder: string): Promise<IStudyEvent[]> {
		try {
			const rows = parseCsv((await this.fileService.readFile(joinPath(this.studiesFolder, folder, 'events.csv'))).value.toString());
			return rows.slice(1).map(row => Object.fromEntries(EVENTS_HEADER.map((column, index) => [column, row[index] ?? '']))).filter(row => row.accession).map((row): IStudyEvent => ({
				accession: row.accession,
				cik: row.cik,
				name: row.name,
				ticker: row.ticker || undefined,
				form: row.form,
				items: row.items ? row.items.split(' ') : undefined,
				filed: row.filed,
				accepted: row.accepted ? Date.parse(row.accepted) : undefined,
				duringSession: row.during_session ? row.during_session === 'true' : undefined,
				nextOpen: row.next_open ? Date.parse(row.next_open) : undefined,
				status: (['waiting', 'capturing', 'complete', 'noTicker', 'noBars', 'tooOld'] as const).find(status => status === row.status) ?? 'waiting',
				url: row.url,
				released: row.released ? Date.parse(row.released) : undefined,
				releaseWire: row.release_wire || undefined,
				releaseTitle: row.release_title || undefined,
				releaseUrl: row.release_url || undefined,
				newsChecked: row.news_checked ? Date.parse(row.news_checked) : undefined,
				barMinutes: Number(row.bar_minutes) || undefined,
			}));
		} catch {
			return [];
		}
	}

	private async writeEvents(folder: string, events: readonly IStudyEvent[]): Promise<void> {
		const study = this.studies.find(study => study.folder === folder);
		const iso = (time: number | undefined) => time !== undefined ? new Date(time).toISOString() : '';
		const rows = events.map(event => [
			event.accession, event.cik, event.name, event.ticker ?? '', event.form, event.items?.join(' ') ?? '', event.filed,
			event.accepted !== undefined ? new Date(event.accepted).toISOString() : '',
			event.duringSession !== undefined ? String(event.duringSession) : '',
			event.nextOpen !== undefined ? new Date(event.nextOpen).toISOString() : '',
			event.status, event.url,
			// The time the study takes, for PollisEventStudies.jl; read back from accepted and released
			iso(study ? eventTime(study, event) : event.accepted),
			iso(event.released), event.releaseWire ?? '', event.releaseTitle ?? '', event.releaseUrl ?? '', iso(event.newsChecked),
			event.barMinutes !== undefined ? String(event.barMinutes) : '',
		]);
		await this.fileService.writeFile(joinPath(this.studiesFolder, folder, 'events.csv'), VSBuffer.fromString(writeCsv([EVENTS_HEADER, ...rows])));
		if (study?.source === 'fomc') {
			// Which contract each instrument is at each release, its unit and FF1's scale, for the notebook
			const instruments = events.filter(event => event.accepted !== undefined).flatMap(event => study.instruments.map(code => [
				event.accession, iso(event.accepted), code, instrumentSymbol(code, event.accepted!), instrumentUnit(code), String(instrumentScale(code, event.accepted!)), String(event.barMinutes ?? 1),
			]));
			await this.fileService.writeFile(joinPath(this.studiesFolder, folder, 'instruments.csv'), VSBuffer.fromString(writeCsv([INSTRUMENTS_HEADER, ...instruments])));
		}
	}

	/** An event's prices file: the minute bars of each symbol, by their time. */
	private async readPrices(folder: string, accession: string): Promise<Map<string, Map<number, IMinuteBar>>> {
		const prices = new Map<string, Map<number, IMinuteBar>>();
		try {
			const rows = parseCsv((await this.fileService.readFile(this.pricesFile(folder, accession))).value.toString());
			for (const [time, session, symbol, open, high, low, close, volume] of rows.slice(1)) {
				const bar: IMinuteBar = {
					time: Date.parse(time),
					session: session === 'pre' || session === 'post' ? session : 'regular',
					open: Number(open), high: Number(high), low: Number(low), close: Number(close), volume: Number(volume),
				};
				if (symbol && !isNaN(bar.time)) {
					merge(prices, symbol, [bar]);
				}
			}
		} catch {
			// No prices yet
		}
		return prices;
	}

	private async writePrices(folder: string, accession: string, prices: ReadonlyMap<string, ReadonlyMap<number, IMinuteBar>>): Promise<void> {
		const rows: string[][] = [];
		for (const [symbol, bars] of prices) {
			for (const bar of [...bars.values()].sort((a, b) => a.time - b.time)) {
				rows.push([new Date(bar.time).toISOString(), bar.session, symbol, String(bar.open), String(bar.high), String(bar.low), String(bar.close), String(bar.volume)]);
			}
		}
		await this.fileService.writeFile(this.pricesFile(folder, accession), VSBuffer.fromString(writeCsv([PRICES_HEADER, ...rows])));
	}

	private pricesFile(folder: string, accession: string): URI {
		return joinPath(this.studiesFolder, folder, 'prices', `${accession}.csv`);
	}

	private newsFile(folder: string, accession: string): URI {
		return joinPath(this.studiesFolder, folder, 'news', `${accession}.csv`);
	}
}

function merge(prices: Map<string, Map<number, IMinuteBar>>, symbol: string, bars: readonly IMinuteBar[]): void {
	let bySymbol = prices.get(symbol);
	if (!bySymbol) {
		bySymbol = new Map();
		prices.set(symbol, bySymbol);
	}
	for (const bar of bars) {
		bySymbol.set(bar.time, bar);
	}
}

/** A study from its study.toml; undefined when it names no alert. */
function readStudy(folder: string, toml: TomlValue): IEventStudy | undefined {
	const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
	const minutes = (value: unknown, fallback: number) => typeof value === 'number' && value >= 0 ? value : fallback;
	const alert = text(toml.alert);
	const source: EventSource = toml.source === 'fomc' ? 'fomc' : 'filings';
	if (!alert && source === 'filings') {
		return undefined;
	}
	const texts = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
	const periods = (Array.isArray(toml.periods) ? toml.periods as TomlValue[] : []).map((period, index): IEventPeriod => ({
		name: text(period.name) || `Period ${index + 1}`,
		before: minutes(period.before, DEFAULT_EVENT_PERIOD.before),
		after: minutes(period.after, DEFAULT_EVENT_PERIOD.after),
		nextOpen: period.next_open === true,
	}));
	const created = Date.parse(text(toml.created));
	return {
		folder,
		title: text(toml.title) || folder,
		source,
		alert,
		releases: FOMC_RELEASES.filter(release => texts(toml.releases).includes(release)),
		instruments: texts(toml.instruments),
		benchmark: text(toml.benchmark) || DEFAULT_BENCHMARK,
		model: toml.model === 'marketModel' ? 'marketModel' : 'marketAdjusted',
		eventTime: toml.event_time === 'accepted' || source === 'fomc' ? 'accepted' : 'firstPublic',
		estimationDays: minutes(toml.estimation_days, DEFAULT_ESTIMATION_DAYS) || DEFAULT_ESTIMATION_DAYS,
		periods: periods.length ? periods : [DEFAULT_EVENT_PERIOD],
		groupBy: text(toml.group_by) || undefined,
		created: isNaN(created) ? 0 : created,
		backfilled: toml.backfilled === true,
		backfillCapped: toml.backfill_capped === true || undefined,
	};
}

/** A study's study.toml. */
function writeStudy(study: IEventStudy): string {
	const text = (value: string) => JSON.stringify(value);
	if (study.source === 'fomc') {
		const lines = [
			`title = ${text(study.title)}`,
			`# The FOMC's releases, from the Federal Reserve's Monetary Policy Press Releases feed`,
			`source = "fomc"`,
			`# statement, projections (the Summary of Economic Projections), minutes, other`,
			`releases = [${study.releases.map(text).join(', ')}]`,
			`# FF1 to FF4, SR1, SFR1 to SFR5, ZT, ^FVX, ^TNX, TIP, ^GSPC, ES`,
			`instruments = [${study.instruments.map(text).join(', ')}]`,
			`created = ${text(new Date(study.created).toISOString())}`,
			`# Whether the releases of the 59 days before it was made are among its events`,
			`backfilled = ${study.backfilled}`,
		];
		for (const period of study.periods) {
			lines.push('', '# Minutes before and after the release', '[[periods]]', `name = ${text(period.name)}`, `before = ${period.before}`, `after = ${period.after}`);
		}
		return lines.join('\n') + '\n';
	}
	const lines = [
		`title = ${text(study.title)}`,
		`# The id of the alert in ~/.pollis/alerts/alerts.json whose filings are the events`,
		`alert = ${text(study.alert)}`,
		`benchmark = ${text(study.benchmark)}`,
		`# marketAdjusted or marketModel`,
		`model = ${text(study.model)}`,
		`# firstPublic (the earlier of the newswire release and EDGAR's acceptance) or accepted`,
		`event_time = ${text(study.eventTime)}`,
		`estimation_days = ${study.estimationDays}`,
		`# The filings are also studied in groups by form, item (each 8-K item), session (during the regular session or outside it) or ticker; "" for no groups`,
		`group_by = ${text(study.groupBy ?? '')}`,
		`created = ${text(new Date(study.created).toISOString())}`,
		`# Whether the filings of the 30 days before it was made are among its events; false looks for them again`,
		`backfilled = ${study.backfilled}`,
		...(study.backfillCapped ? ['# More filings were found than the full-text search reads, so some are not among the events', 'backfill_capped = true'] : []),
	];
	for (const period of study.periods) {
		lines.push('', '# Minutes before and after the filing; next_open also looks after the next open, for a filing outside the regular session', '[[periods]]',
			`name = ${text(period.name)}`, `before = ${period.before}`, `after = ${period.after}`, `next_open = ${period.nextOpen}`);
	}
	return lines.join('\n') + '\n';
}

registerSingleton(IEventStudiesService, EventStudiesService, InstantiationType.Delayed);
