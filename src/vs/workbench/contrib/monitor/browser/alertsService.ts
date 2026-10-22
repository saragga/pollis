/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IntervalTimer, RunOnceScheduler } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { safeIntl } from '../../../../base/common/date.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { URI } from '../../../../base/common/uri.js';
import { IRequestContext, IRequestOptions } from '../../../../base/parts/request/common/request.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { asJson, asText, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { CREDENTIALS } from '../../model/browser/common/credentials.js';
import { alertNotebook } from './alertNotebook.js';
import { writeCsv } from './csv.js';
import { EconomicSource, fetchEconomicSeries, IEconomicSeries, seriesPage } from './economicSeries.js';
import { OPEN_LINK_COMMAND_ID } from './openLink.js';

/**
 * What an alert watches for: the value above or below the threshold (once, until it is back on the other side), the
 * value crossing it from one check to the next, the value moving by more than the threshold, in per cent, since
 * the previous close, or a filer publishing a new filing at the SEC's EDGAR. An economic series fires when it publishes
 * a new value (newValue), or on its new value only: above or below the threshold, crossing it from the value before,
 * or changing from the value before by more than the threshold (changesBy). The statistical conditions, on a quote or
 * a series, are computed by OnlineStats.jl from the values the alert has looked at (see `STATISTICAL_CONDITIONS`).
 */
export type AlertCondition = 'above' | 'below' | 'crossesAbove' | 'crossesBelow' | 'movesBy' | 'newFiling' | 'newValue' | 'changesBy' | StatisticalCondition;

/**
 * A move larger than the threshold's number of standard deviations of the moves (unusualMove), the value leaving the
 * band of the threshold's number of standard deviations around its mean (leavesBand), a move beyond the quantile of
 * the moves of the threshold, in per cent, below 50 a fall and above it a rise (beyondQuantile), or the value above
 * the highest or below the lowest of the threshold's number of values before it (newExtreme). A move is a log return
 * for a quote, a change for a series; the mean and the standard deviation weigh the values by their age.
 */
export type StatisticalCondition = 'unusualMove' | 'leavesBand' | 'beyondQuantile' | 'newExtreme';

export const STATISTICAL_CONDITIONS: readonly StatisticalCondition[] = ['unusualMove', 'leavesBand', 'beyondQuantile', 'newExtreme'];

export function isStatistical(condition: AlertCondition): condition is StatisticalCondition {
	return (STATISTICAL_CONDITIONS as readonly AlertCondition[]).includes(condition);
}

export type AlertSeverity = 'info' | 'warning' | 'error';

/** An alert as ~/.pollis/alerts/alerts.json keeps it, which the user may also edit by hand. */
export interface IAlert {
	readonly id: string;
	/**
	 * A Yahoo Finance symbol: ^GSPC, AAPL, BZ=F, EURUSD=X; for newFiling, the filer's CIK at the SEC: 320193, or, on
	 * several companies, their CIKs separated by commas, or, on an industry, SIC and its code: SIC 2834; for an
	 * economic series, the series as its source writes it: CPIAUCSL, EXR/D.USD.EUR.SP00.A, IMF.STA,CPI/USA.CPI._T.YOY_PCH_PA_PT.M, PRT/NY.GDP.PCAP.KD.
	 */
	readonly symbol: string;
	/** For an economic series: where it is published; absent for a Yahoo Finance symbol or the SEC. */
	readonly source?: EconomicSource;
	/** The name Yahoo Finance, or the SEC, gives the symbol, when the alert was added. */
	readonly name?: string;
	readonly condition: AlertCondition;
	/** The value of the condition; 0 for newFiling. */
	readonly threshold: number;
	/** For newFiling: the forms it fires on, an amendment (10-K/A) counting as its form; every form when absent or empty. */
	readonly forms?: readonly string[];
	/** For newFiling: several companies, by CIK, in place of one; looked for in EDGAR's latest filings. */
	readonly ciks?: readonly string[];
	/** For newFiling: an industry, by SIC code, in place of a company: every company the SEC files under it; looked for in EDGAR's latest filings. */
	readonly sic?: string;
	/** For newFiling: every company at the SEC, in place of a company; only with a phrase, as there are thousands of filings a day. */
	readonly everyone?: boolean;
	/**
	 * For newFiling: what the filing must contain, in EDGAR's full-text search, such as "going concern" in quotes for
	 * the exact phrase; an alert with a phrase is looked up by that search, whoever it is on.
	 */
	readonly phrase?: string;
	/** For newFiling: the 8-K items an 8-K must have one of to fire, such as 2.02; every 8-K when absent or empty. */
	readonly items?: readonly string[];
	/** For newFiling: whether an event study of its filings starts when it fires and has none yet. */
	readonly eventStudy?: boolean;
	readonly severity: AlertSeverity;
	/** Whether the alert fires again once the value is back on the other side, else it is paused once it fires. */
	readonly repeat: boolean;
	readonly paused?: boolean;
	/** How often the value is looked up, in minutes; when not given, 1, or 15 for newFiling, or 60 for an economic series. */
	readonly minutes?: number;
	/** For unusualMove and leavesBand: after how many values a value weighs half as much; 60 when not given. */
	readonly halfLife?: number;
}

/** An alert that fired, a line of ~/.pollis/alerts/history.jsonl. */
export interface IFiredAlert {
	readonly id: string;
	readonly alertId: string;
	readonly symbol: string;
	readonly name?: string;
	readonly condition: AlertCondition;
	readonly threshold: number;
	readonly severity: AlertSeverity;
	/** The value that fired it; 0 for newFiling, which has the filing instead. */
	readonly value: number;
	/** The value of the look-up before, from which the value got past the threshold; absent on the first look-up. */
	readonly previousValue?: number;
	readonly currency?: string;
	/** For movesBy: the move since the previous close, in per cent. */
	readonly change?: number;
	/** For newFiling: the new filing. */
	readonly filing?: IFiling;
	/** For an economic series: where it is published, and the period of the new value. */
	readonly source?: EconomicSource;
	readonly period?: string;
	/** For a statistical condition: the band the value was outside of; a quantile has one side only. */
	readonly lower?: number;
	readonly upper?: number;
	/** When it fired, in milliseconds since 1970. */
	readonly time: number;
}

/** A filing at the SEC's EDGAR. */
export interface IFiling {
	readonly form: string;
	/** The day it was filed: 2026-10-20. */
	readonly filed: string;
	/** When EDGAR accepted it, to the second, in UTC: 2026-10-20T02:32:55.000Z. */
	readonly accepted?: string;
	readonly accession: string;
	readonly description?: string;
	/** For an 8-K: the items it reports, such as 2.02 and 9.01. */
	readonly items?: readonly string[];
	/** The filing's main document, or its index when it has none. */
	readonly url: string;
}

/** A filing EDGAR's full-text search found, with its filer; its url is the document that has the phrase. */
export interface ISearchedFiling extends IFiling {
	readonly cik: string;
	readonly name: string;
}

/** A company at the SEC's EDGAR. */
export interface ICompany {
	/** Without the leading zeros: 320193. */
	readonly cik: string;
	readonly name: string;
}

/** An industry at the SEC: a SIC code, its name, and the companies the SEC files under it. */
export interface IIndustry {
	readonly sic: string;
	readonly name: string;
	readonly ciks: readonly string[];
}

/** A filer at the SEC's EDGAR and its recent filings, newest first. */
export interface IFiler {
	/** Without the leading zeros: 320193. */
	readonly cik: string;
	readonly name: string;
	readonly tickers: readonly string[];
	readonly filings: readonly IFiling[];
}

/** What the last look-up of an alert's symbol found. */
export interface IAlertState {
	readonly value?: number;
	readonly currency?: string;
	/** When the value was quoted, in milliseconds since 1970. */
	readonly quoted?: number;
	/** When the value was last looked up. */
	readonly checked?: number;
	/** Whether the alert can fire: false from when it fires until the value is back on the other side. */
	readonly armed: boolean;
	/** Set when the symbol could not be looked up. */
	readonly error?: boolean;
	/** For newFiling: set when it could not be looked up for want of the user's SEC contact. */
	readonly noContact?: boolean;
	/** For newFiling: the newest filing found, which the next look-up's new filings come after; on several companies or an industry, the newest that fired, and its filer. */
	readonly filing?: Pick<IFiling, 'form' | 'filed' | 'accession'> & { readonly name?: string };
	/** For newFiling on several companies or an industry: when the newest of EDGAR's latest filings looked at was accepted, in milliseconds since 1970. */
	readonly since?: number;
	/** For newFiling with a phrase: the accessions the last search found, which do not fire again. */
	readonly seen?: readonly string[];
	/** For an economic series: the period of its latest value, after which a value is new. */
	readonly period?: string;
	/** For a FRED series: set when it could not be looked up for want of the user's FRED key. */
	readonly noKey?: boolean;
	/** For a statistical condition: set when it could not be computed for want of Julia. */
	readonly noJulia?: boolean;
	/** For a statistical condition: set while Julia installs OnlineStats.jl, the first time. */
	readonly installing?: boolean;
}

/** A Yahoo Finance quote: the latest price of the regular session, and the previous close. */
export interface IQuote {
	readonly symbol: string;
	readonly name?: string;
	readonly value: number;
	readonly currency?: string;
	readonly previousClose?: number;
	/** Milliseconds since 1970. */
	readonly time: number;
	/** The regular session, in milliseconds since 1970. */
	readonly sessionStart?: number;
	readonly sessionEnd?: number;
	readonly dayHigh?: number;
	readonly dayLow?: number;
	readonly yearHigh?: number;
	readonly yearLow?: number;
	readonly volume?: number;
	readonly exchange?: string;
}

/** A symbol Yahoo Finance suggests for a search: a company's name or a ticker. */
export interface ISymbolMatch {
	readonly symbol: string;
	readonly name: string;
	/** The exchange's name, such as NASDAQ. */
	readonly exchange?: string;
	/** EQUITY, ETF, INDEX, FUTURE and so on. */
	readonly type?: string;
}

/** The span of a chart: a day, five days, a month or six months. */
export type ChartRange = '1d' | '5d' | '1mo' | '6mo';

/** The values of a symbol over a span, oldest first, for a chart. */
export interface IChart {
	/** Milliseconds since 1970. */
	readonly times: readonly number[];
	readonly values: readonly number[];
	readonly previousClose?: number;
}

/** Which session of its market a minute bar is in. */
export type MarketSession = 'pre' | 'regular' | 'post';

/** A minute of a symbol's trading at Yahoo Finance. */
export interface IMinuteBar {
	/** The minute's start, in milliseconds since 1970. */
	readonly time: number;
	readonly session: MarketSession;
	readonly open: number;
	readonly high: number;
	readonly low: number;
	readonly close: number;
	readonly volume: number;
}

/** What a statistical condition would have done over the values an alert on it looks at, the latest of them last. */
export interface IBacktest {
	/** For a quote: when each value was quoted, in milliseconds since 1970. */
	readonly times?: readonly number[];
	/** For a series: the period of each value. */
	readonly periods?: readonly string[];
	readonly values: readonly number[];
	/** The band each value was checked against, undefined before there were values enough. */
	readonly lower: readonly (number | null)[];
	readonly upper: readonly (number | null)[];
	/** The positions of the values it would have fired on. */
	readonly fired: readonly number[];
}

/** Why a statistical condition could not be computed: no Julia, Julia installing OnlineStats.jl, or Julia failing. */
export type StatisticsProblem = 'noJulia' | 'installing' | 'failed';

/** The minute bars of a symbol over a span, oldest first, and the regular sessions of its market in that span. */
export interface IMinuteBars {
	readonly bars: readonly IMinuteBar[];
	/** The regular sessions, as [start, end] in milliseconds since 1970, oldest first. */
	readonly sessions: readonly (readonly [start: number, end: number])[];
}

export interface IAlertsService {
	readonly _serviceBrand: undefined;
	/** Fires when the alerts, their states or the fired alerts change. */
	readonly onDidChange: Event<void>;
	/** Fires with the alerts that just fired, in any window. */
	readonly onDidFire: Event<readonly IFiredAlert[]>;
	getAlerts(): readonly IAlert[];
	getState(alertId: string): IAlertState | undefined;
	/** The fired alerts, newest first. */
	getFired(): readonly IFiredAlert[];
	isRead(firedId: string): boolean;
	markRead(firedIds: readonly string[]): void;
	/** Takes the fired alerts `firedIds` out of the history. */
	removeFired(firedIds: readonly string[]): Promise<void>;
	/** Empties the history of fired alerts. */
	clearFired(): Promise<void>;
	addAlert(alert: Omit<IAlert, 'id'>): Promise<void>;
	setPaused(alertId: string, paused: boolean): Promise<void>;
	/** For newFiling: whether an event study of its filings starts when it fires and has none yet. */
	setEventStudy(alertId: string, eventStudy: boolean): Promise<void>;
	removeAlert(alertId: string): Promise<void>;
	/** The quote of `symbol`, or undefined when Yahoo Finance does not know it or cannot be reached. */
	getQuote(symbol: string): Promise<IQuote | undefined>;
	/** The symbols Yahoo Finance suggests for `text`, best first, or undefined when it cannot be reached. */
	searchSymbols(text: string): Promise<readonly ISymbolMatch[] | undefined>;
	/** The values of `symbol` over `range`, or undefined when Yahoo Finance does not know it or cannot be reached. */
	getChart(symbol: string, range: ChartRange): Promise<IChart | undefined>;
	/**
	 * The bars of `symbol` from `start` to `end`, in milliseconds since 1970, a minute each or `minutes` minutes each,
	 * before and after the regular session too; undefined when Yahoo Finance does not know it or cannot be reached. It
	 * keeps minute bars for 30 days and five-minute bars for 60.
	 */
	getMinuteBars(symbol: string, start: number, end: number, minutes?: 1 | 5): Promise<IMinuteBars | undefined>;
	/** The user's contact for the SEC, which asks for a name and an email with every request; the EDGAR panel's too. */
	getSecContact(): Promise<string | undefined>;
	setSecContact(contact: string): Promise<void>;
	/**
	 * The filer of `company`, a ticker (AAPL) or a CIK (320193), with its recent filings; undefined when the SEC does
	 * not know it, cannot be reached, or there is no SEC contact.
	 */
	getFiler(company: string): Promise<IFiler | undefined>;
	/** The companies of `companies`, tickers or CIKs, and those the SEC does not know; undefined when it cannot be reached or there is no SEC contact. */
	getCompanies(companies: readonly string[]): Promise<{ readonly found: readonly ICompany[]; readonly unknown: readonly string[] } | undefined>;
	/** The industry of the SIC code `sic`; undefined when the SEC files no company under it, cannot be reached, or there is no SEC contact. */
	getIndustry(sic: string): Promise<IIndustry | undefined>;
	/**
	 * The filings of the last `days` days that EDGAR's full-text search finds for an alert's phrase, forms, items and
	 * companies, oldest first, and whether there were more than it reads; undefined when the SEC cannot be reached or
	 * there is no SEC contact.
	 */
	searchFilings(alert: Pick<IAlert, 'symbol' | 'phrase' | 'forms' | 'items' | 'ciks' | 'sic' | 'everyone'>, days: number): Promise<{ readonly filings: readonly ISearchedFiling[]; readonly more: boolean } | undefined>;
	/**
	 * The economic series `id` of `source` with its latest `count` observations; undefined when the source does not
	 * know it or cannot be reached, and 'noKey' for FRED without the user's FRED key.
	 */
	getSeries(source: EconomicSource, id: string, count: number): Promise<IEconomicSeries | 'noKey' | undefined>;
	/** Keeps the user's FRED key in the keychain, the FRED panel's too. */
	setFredKey(key: string): Promise<void>;
	/**
	 * What a statistical condition would have done over the values an alert on it would look at: a quote's of the
	 * regular sessions of the last days, a series' latest; undefined when they cannot be looked up.
	 */
	backtest(alert: Pick<IAlert, 'symbol' | 'source' | 'condition' | 'threshold' | 'halfLife' | 'minutes'>): Promise<IBacktest | StatisticsProblem | 'noKey' | undefined>;
	/**
	 * Writes to a folder of ~/.pollis/alerts/notebooks the settings of a statistical condition (alert.toml), the values
	 * an alert on it would look at (values.csv), and, when it is not there, the alert.ipynb that computes with
	 * OnlineStats.jl what it would have done; the notebook, or undefined when the values cannot be looked up.
	 */
	writeNotebook(alert: Pick<IAlert, 'symbol' | 'name' | 'source' | 'condition' | 'threshold' | 'halfLife' | 'minutes'>): Promise<URI | 'noKey' | undefined>;
	readonly alertsFile: URI;
}

export const IAlertsService = createDecorator<IAlertsService>('pollisAlertsService');

const READ_KEY = 'pollis.alerts.read';
const STATE_KEY = 'pollis.alerts.state';
// The window that looks up the alerts, so that each fires once however many windows are open
const LEASE_KEY = 'pollis.alerts.lease';
const LEASE_MILLISECONDS = 150_000;
const TICK_MILLISECONDS = 60_000;
// Outside its regular session (and the delay of its quotes after it), a symbol is looked up only every quarter of an hour
const QUIET_MILLISECONDS = 15 * 60_000;
const QUOTE_DELAY_MILLISECONDS = 20 * 60_000;
const MAX_FIRED = 500;
// Yahoo Finance gives minute bars for at most seven days a request
const MINUTE_BARS_SPAN_MILLISECONDS = 7 * 24 * 60 * 60_000;
// How long the companies of an industry are kept before they are fetched again
const INDUSTRY_MILLISECONDS = 24 * 60 * 60_000;
// The most companies of an industry fetched, and the most of EDGAR's latest filings read at a look-up, 100 a page
const MAX_INDUSTRY_COMPANIES = 5000;
const MAX_LATEST_FILINGS = 5000;
// The most documents of EDGAR's full-text search read at a look-up, 100 a page; and how many days it looks back at least
const MAX_SEARCHED = 1000;
// The companies a full-text search names at most
const SEARCH_CIKS = 100;
const SEARCH_DAYS = 3;
// The command of Pollis' Julia extension that asks OnlineStats.jl, in a Julia process of its own (pollisAlertStats.ts)
const ALERT_STATISTICS_COMMAND_ID = 'language-julia.pollisAlertStatistics';
const DEFAULT_HALF_LIFE = 60;
// The values a statistical alert starts from, and a backtest goes over: a quote's minutes of the last days, a series' latest
const STATISTICS_QUOTE_DAYS = 5;
const STATISTICS_SERIES_COUNT = 120;

/** What OnlineStats.jl answers for a new value of an alert: whether it fires, and the band it was checked against. */
interface IStatisticsUpdate {
	readonly needsHistory?: boolean;
	readonly fires?: boolean;
	readonly lower?: number | null;
	readonly upper?: number | null;
}

/** What OnlineStats.jl answers for a backtest; see `IBacktest`. */
interface IStatisticsBacktest {
	readonly lower?: readonly (number | null)[];
	readonly upper?: readonly (number | null)[];
	readonly fired?: readonly number[];
}

/** What alert_stats.jl computes for a statistical alert: its condition, how a move is measured, and its parameters. */
function statisticsSpec(alert: Pick<IAlert, 'source' | 'condition' | 'threshold' | 'halfLife'>) {
	return {
		condition: alert.condition,
		transform: alert.source ? 'change' : 'logReturn',
		k: alert.threshold,
		halfLife: alert.halfLife ?? DEFAULT_HALF_LIFE,
		p: alert.threshold / 100,
		window: Math.max(2, Math.round(alert.threshold)),
		// A quantile of fewer moves is too rough to fire on
		minObs: alert.condition === 'beyondQuantile' ? 50 : 20,
	};
}

/** The message of a fired alert: what crossed what. */
export function describeFiredAlert(fired: IFiredAlert): string {
	const name = fired.name || fired.symbol;
	const value = formatValue(fired.value, fired.currency);
	const threshold = formatValue(fired.threshold);
	if (fired.period !== undefined) {
		return fired.condition === 'newValue'
			? localize('alerts.firedNewValue', "New value of {0} for {1}: {2}", name, fired.period, value)
			: localize('alerts.firedNewValueCondition', "New value of {0} for {1}: {2}, {3}", name, fired.period, value, describeCondition(fired));
	}
	switch (fired.condition) {
		case 'above': return localize('alerts.firedAbove', "{0} is above {1}: {2}", name, threshold, value);
		case 'below': return localize('alerts.firedBelow', "{0} is below {1}: {2}", name, threshold, value);
		case 'crossesAbove': return localize('alerts.firedCrossesAbove', "{0} crossed above {1}: {2}", name, threshold, value);
		case 'crossesBelow': return localize('alerts.firedCrossesBelow', "{0} crossed below {1}: {2}", name, threshold, value);
		case 'movesBy': return localize('alerts.firedMovesBy', "{0} moved {1}% since the previous close: {2}", name, formatChange(fired.change ?? 0), value);
		case 'newValue': return localize('alerts.firedNewValueOnly', "New value of {0}: {1}", name, value);
		case 'changesBy': return localize('alerts.firedChangesBy', "{0} changed by {1} from the value before: {2}", name, formatChange(fired.change ?? 0), value);
		case 'unusualMove': return localize('alerts.firedUnusualMove', "{0} moved by more than {1} standard deviations: {2}", name, threshold, value);
		case 'leavesBand': return localize('alerts.firedLeavesBand', "{0} left its band of {1} standard deviations: {2}", name, threshold, value);
		case 'beyondQuantile': return fired.threshold < 50
			? localize('alerts.firedFallsBeyond', "{0} fell beyond its {1}% quantile: {2}", name, threshold, value)
			: localize('alerts.firedRisesBeyond', "{0} rose beyond its {1}% quantile: {2}", name, threshold, value);
		case 'newExtreme': return fired.upper !== undefined && fired.value > fired.upper
			? localize('alerts.firedNewHigh', "{0} is above the highest of its last {1} values: {2}", name, threshold, value)
			: localize('alerts.firedNewLow', "{0} is below the lowest of its last {1} values: {2}", name, threshold, value);
		case 'newFiling': {
			const items = describeItems(fired.filing?.items);
			return items
				? localize('alerts.firedNewFilingItems', "New {0} from {1}, filed {2}: {3}", fired.filing?.form ?? '', name, fired.filing?.filed ?? '', items)
				: localize('alerts.firedNewFiling', "New {0} from {1}, filed {2}", fired.filing?.form ?? '', name, fired.filing?.filed ?? '');
		}
	}
}

/** The condition of an alert in words: "above 8000", "moves by 2%", "files a new 10-K / 10-Q". */
export function describeCondition(alert: Pick<IAlert, 'condition' | 'threshold' | 'forms' | 'items' | 'phrase'>): string {
	const threshold = formatValue(alert.threshold);
	switch (alert.condition) {
		case 'above': return localize('alerts.conditionAbove', "above {0}", threshold);
		case 'below': return localize('alerts.conditionBelow', "below {0}", threshold);
		case 'crossesAbove': return localize('alerts.conditionCrossesAbove', "crosses above {0}", threshold);
		case 'crossesBelow': return localize('alerts.conditionCrossesBelow', "crosses below {0}", threshold);
		case 'movesBy': return localize('alerts.conditionMovesBy', "moves by {0}% since the previous close", threshold);
		case 'newValue': return localize('alerts.conditionNewValue', "publishes a new value");
		case 'changesBy': return localize('alerts.conditionChangesBy', "changes by {0} or more from the value before", threshold);
		case 'unusualMove': return localize('alerts.conditionUnusualMove', "moves by more than {0} standard deviations", threshold);
		case 'leavesBand': return localize('alerts.conditionLeavesBand', "leaves its band of {0} standard deviations", threshold);
		case 'beyondQuantile': return alert.threshold < 50
			? localize('alerts.conditionFallsBeyond', "falls beyond its {0}% quantile", threshold)
			: localize('alerts.conditionRisesBeyond', "rises beyond its {0}% quantile", threshold);
		case 'newExtreme': return localize('alerts.conditionNewExtreme', "goes above the highest or below the lowest of its last {0} values", threshold);
		case 'newFiling': {
			const forms = alert.forms?.length ? alert.forms.join(' / ') : undefined;
			const items = alert.items?.length ? alert.items.join(' / ') : undefined;
			const condition = forms
				? items ? localize('alerts.conditionNewFilingItems', "files a new {0}, an 8-K only with item {1}", forms, items) : localize('alerts.conditionNewFiling', "files a new {0}", forms)
				: items ? localize('alerts.conditionAnyFilingItems', "files anything new at the SEC, an 8-K only with item {0}", items) : localize('alerts.conditionAnyFiling', "files anything new at the SEC");
			return alert.phrase ? localize('alerts.conditionContains', "{0}, containing {1}", condition, alert.phrase) : condition;
		}
	}
}

/** The items of an 8-K, by number, with their short names. */
export const FORM_8K_ITEMS: readonly (readonly [item: string, name: string])[] = [
	['1.01', localize('alerts.item101', "Material Agreement")],
	['1.02', localize('alerts.item102', "End of a Material Agreement")],
	['1.03', localize('alerts.item103', "Bankruptcy or Receivership")],
	['1.04', localize('alerts.item104', "Mine Safety")],
	['1.05', localize('alerts.item105', "Cybersecurity Incident")],
	['2.01', localize('alerts.item201', "Acquisition or Disposal of Assets")],
	['2.02', localize('alerts.item202', "Results of Operations")],
	['2.03', localize('alerts.item203', "New Financial Obligation")],
	['2.04', localize('alerts.item204', "Financial Obligation Accelerated")],
	['2.05', localize('alerts.item205', "Exit or Disposal Costs")],
	['2.06', localize('alerts.item206', "Material Impairment")],
	['3.01', localize('alerts.item301', "Delisting Notice")],
	['3.02', localize('alerts.item302', "Unregistered Sale of Equity")],
	['3.03', localize('alerts.item303', "Holders' Rights Changed")],
	['4.01', localize('alerts.item401', "Change of Auditor")],
	['4.02', localize('alerts.item402', "Past Financial Statements Not to Be Relied On")],
	['5.01', localize('alerts.item501', "Change in Control")],
	['5.02', localize('alerts.item502', "Directors or Officers Changed")],
	['5.03', localize('alerts.item503', "Articles, Bylaws or Fiscal Year Changed")],
	['5.04', localize('alerts.item504', "Benefit Plan Trading Suspended")],
	['5.05', localize('alerts.item505', "Code of Ethics Changed")],
	['5.06', localize('alerts.item506', "Shell Company Status Changed")],
	['5.07', localize('alerts.item507', "Shareholder Vote")],
	['5.08', localize('alerts.item508', "Shareholder Director Nominations")],
	['6.01', localize('alerts.item601', "Asset-Backed: Informational Material")],
	['6.02', localize('alerts.item602', "Asset-Backed: Servicer or Trustee Changed")],
	['6.03', localize('alerts.item603', "Asset-Backed: Credit Enhancement Changed")],
	['6.04', localize('alerts.item604', "Asset-Backed: Distribution Missed")],
	['6.05', localize('alerts.item605', "Asset-Backed: Securities Act Update")],
	['7.01', localize('alerts.item701', "Regulation FD Disclosure")],
	['8.01', localize('alerts.item801', "Other Events")],
	['9.01', localize('alerts.item901', "Financial Statements and Exhibits")],
];

/** The names of an 8-K's items, "Results of Operations; Directors or Officers Changed", leaving out the exhibits (9.01) beside others. */
export function describeItems(items: readonly string[] | undefined): string | undefined {
	const names = new Map(FORM_8K_ITEMS);
	const shown = items?.filter(item => item !== '9.01' || items.length === 1).map(item => names.get(item) ?? item);
	return shown?.length ? shown.join('; ') : undefined;
}

/** Whether an alert on filings is on several companies or an industry, looked for in EDGAR's latest filings, rather than on one company. */
function isFeedAlert(alert: IAlert): boolean {
	return alert.condition === 'newFiling' && !alert.phrase && (!!alert.ciks?.length || !!alert.sic);
}

/** Whether an alert on filings has a phrase, and is looked for in EDGAR's full-text search. */
function isSearchAlert(alert: IAlert): boolean {
	return alert.condition === 'newFiling' && !!alert.phrase;
}

/** Who an alert is on: its name, or, on filings, "One of Apple, Microsoft" or "A company in Pharmaceutical Preparations (SIC 2834)". */
export function describeSubject(alert: Pick<IAlert, 'name' | 'symbol' | 'ciks' | 'sic' | 'everyone'>): string {
	if (alert.everyone) {
		return localize('alerts.subjectEveryone', "Any company");
	}
	const name = alert.name || alert.symbol;
	if (alert.sic) {
		return localize('alerts.subjectIndustry', "A company in {0} (SIC {1})", name, alert.sic);
	}
	return alert.ciks?.length ? localize('alerts.subjectCompanies', "One of {0}", name) : name;
}

/** Whether a filing is one an alert fires on: of one of its forms, an amendment counting as its form, and, for an 8-K, with one of its items. */
function matchesFiling(filing: IFiling, alert: Pick<IAlert, 'forms' | 'items'>): boolean {
	const form = filing.form.replace(/\/A$/, '');
	return (!alert.forms?.length || alert.forms.some(wanted => filing.form === wanted || form === wanted))
		&& (!alert.items?.length || form !== '8-K' || alert.items.some(item => filing.items?.includes(item)));
}

/** A value with the digits that suit its size, and its currency when known. */
export function formatValue(value: number, currency?: string): string {
	const digits = Math.abs(value) >= 100 ? 2 : Math.abs(value) >= 1 ? 4 : 6;
	const number = value.toLocaleString(undefined, { maximumFractionDigits: digits });
	return currency ? `${number} ${currency}` : number;
}

function formatChange(change: number): string {
	return `${change > 0 ? '+' : ''}${change.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

/** The Yahoo Finance chart answer: the metadata, and the times and closes of a chart. */
interface IYahooChartResult {
	readonly timestamp?: readonly number[];
	readonly indicators?: {
		readonly quote?: readonly {
			readonly open?: readonly (number | null)[];
			readonly high?: readonly (number | null)[];
			readonly low?: readonly (number | null)[];
			readonly close?: readonly (number | null)[];
			readonly volume?: readonly (number | null)[];
		}[];
	};
	readonly meta?: {
		readonly symbol?: string;
		readonly shortName?: string;
		readonly longName?: string;
		readonly currency?: string;
		readonly regularMarketPrice?: number;
		readonly regularMarketTime?: number;
		readonly chartPreviousClose?: number;
		readonly previousClose?: number;
		readonly currentTradingPeriod?: { readonly regular?: { readonly start?: number; readonly end?: number } };
		readonly regularMarketDayHigh?: number;
		readonly regularMarketDayLow?: number;
		readonly fiftyTwoWeekHigh?: number;
		readonly fiftyTwoWeekLow?: number;
		readonly regularMarketVolume?: number;
		readonly fullExchangeName?: string;
		/** With minute bars, the sessions of each day of the span. */
		readonly tradingPeriods?: Partial<Record<MarketSession, readonly (readonly { readonly start?: number; readonly end?: number }[])[]>>;
	};
}

interface IYahooChart {
	readonly chart?: { readonly result?: readonly IYahooChartResult[] };
}

/** The SEC's submissions of a filer: its name, tickers, and its latest filings (up to 1000) in columns, newest first. */
interface ISecSubmissions {
	readonly name?: string;
	readonly tickers?: readonly string[];
	readonly sicDescription?: string;
	readonly filings?: {
		readonly recent?: {
			readonly accessionNumber?: readonly string[];
			readonly filingDate?: readonly string[];
			readonly acceptanceDateTime?: readonly string[];
			readonly form?: readonly string[];
			readonly primaryDocument?: readonly string[];
			readonly primaryDocDescription?: readonly string[];
			/** For an 8-K: its items, separated by commas: "2.02,9.01". */
			readonly items?: readonly string[];
		};
	};
}

/** The SEC's tickers: an object of { cik_str, ticker, title } by number. */
type ISecTickers = Record<string, { readonly cik_str?: number; readonly ticker?: string; readonly title?: string }>;

/** A page of EDGAR's full-text search: one hit a document, its id the accession and the document's name. */
interface ISecSearch {
	readonly hits?: {
		readonly total?: { readonly value?: number };
		readonly hits?: readonly {
			readonly _id?: string;
			readonly _source?: {
				readonly ciks?: readonly string[];
				readonly display_names?: readonly string[];
				readonly form?: string;
				readonly root_forms?: readonly string[];
				readonly file_date?: string;
				readonly file_description?: string;
				readonly items?: readonly string[];
				readonly sics?: readonly string[];
			};
		}[];
	};
}

/** The CIK of each ticker, and the name of each CIK with a ticker. */
interface ISecNames {
	readonly ciks: Map<string, string>;
	readonly names: Map<string, string>;
}

/** A filing of EDGAR's latest filings, with its filer, and when it was accepted in milliseconds since 1970. */
interface ILatestFiling extends IFiling {
	readonly cik: string;
	readonly name: string;
	readonly time: number;
}

// New York's offset from UTC at a time: GMT-4 in summer, GMT-5 in winter
const newYorkOffset = safeIntl.DateTimeFormat('en-US', { timeZone: 'America/New_York', timeZoneName: 'shortOffset' });

/** How many hours New York is behind UTC at `time`. */
function newYorkHoursBehind(time: number): number {
	const name = newYorkOffset.value.formatToParts(time).find(part => part.type === 'timeZoneName')?.value;
	const hours = /^GMT-(?<hours>\d+)$/.exec(name ?? '')?.groups?.hours;
	return hours ? Number(hours) : 5;
}

/**
 * When EDGAR accepted a filing, in UTC, from its submissions' acceptanceDateTime, which adds New York's offset twice:
 * a filing accepted at 18:32:55 in New York (22:32:55 UTC) comes as 2026-10-20T02:32:55.000Z. EDGAR's filing pages
 * and its feeds have the time right.
 */
function submissionsAccepted(value: string | undefined): string | undefined {
	const time = value ? Date.parse(value) : NaN;
	if (isNaN(time)) {
		return undefined;
	}
	// Four hours earlier, unless that is in winter
	const summer = time - 4 * 60 * 60_000;
	return new Date(newYorkHoursBehind(summer) === 4 ? summer : time - 5 * 60 * 60_000).toISOString();
}

/**
 * An entry of EDGAR's latest filings: its title "8-K - GROUP 1 AUTOMOTIVE INC (0001031203) (Filer)", the form, the
 * accession, the index page, when it was accepted (Eastern time, with its offset) and a summary with the day filed and,
 * for an 8-K, its items ("Item 2.01: ..."). Read with regular expressions, as DOMParser may not parse a string here.
 */
function parseLatestFiling(entry: string): ILatestFiling | undefined {
	const decode = (text: string) => text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&amp;/g, '&');
	const title = /^(?<form>.+?) - (?<name>.+) \((?<cik>\d+)\) \([^)]*\)$/.exec(decode(/<title>(?<title>[^<]*)<\/title>/.exec(entry)?.groups?.title ?? '').trim())?.groups;
	const form = /<category[^>]*\sterm="(?<form>[^"]*)"/.exec(entry)?.groups?.form;
	const accession = /accession-number=(?<accession>[\d-]+)/.exec(entry)?.groups?.accession;
	const url = /<link[^>]*\shref="(?<url>https:\/\/www\.sec\.gov\/[^"]*)"/.exec(entry)?.groups?.url;
	const time = Date.parse(/<updated>(?<updated>[^<]*)<\/updated>/.exec(entry)?.groups?.updated ?? '');
	if (!title || !accession || !url || !Number.isFinite(time)) {
		return undefined;
	}
	const summary = decode(/<summary[^>]*>(?<summary>[\s\S]*?)<\/summary>/.exec(entry)?.groups?.summary ?? '');
	const items = Array.from(summary.matchAll(/Item (?<item>\d+\.\d+):/g), match => match.groups?.item ?? '').filter(item => item);
	return {
		cik: String(Number(title.cik)),
		name: title.name,
		form: decode(form ?? title.form),
		filed: /Filed:<\/b> (?<filed>\d{4}-\d{2}-\d{2})/.exec(summary)?.groups?.filed ?? new Date(time).toISOString().slice(0, 10),
		accepted: new Date(time).toISOString(),
		accession,
		items: items.length ? items : undefined,
		url: decode(url),
		time,
	};
}

// The interval of the values of each span of a chart
const CHART_INTERVALS: Record<ChartRange, string> = { '1d': '5m', '5d': '15m', '1mo': '60m', '6mo': '1d' };

/**
 * Pollis: the alerts the user sets on market data, looked up at Yahoo Finance, and on filings, looked up at the SEC's
 * EDGAR, while Pollis is open. One window looks
 * them up and notifies; every window shows them, from the files in ~/.pollis/alerts.
 */
export class AlertsService extends Disposable implements IAlertsService {

	declare readonly _serviceBrand: undefined;

	private readonly _onDidChange = this._register(new Emitter<void>());
	readonly onDidChange = this._onDidChange.event;

	private readonly _onDidFire = this._register(new Emitter<readonly IFiredAlert[]>());
	readonly onDidFire = this._onDidFire.event;

	readonly alertsFile: URI;
	private readonly historyFile: URI;
	private readonly notebooksFolder: URI;
	private readonly owner = generateUuid();
	private alerts: IAlert[] = [];
	private fired: IFiredAlert[] = [];
	private read: Set<string>;
	// When each symbol is next looked up, while its market is closed
	private readonly quietUntil = new Map<string, number>();
	// The CIK of each ticker at the SEC, and the name of each CIK, fetched once
	private tickers: Promise<ISecNames | undefined> | undefined;
	// The companies of each industry, by SIC code, fetched once a day
	private readonly industries = new Map<string, { readonly fetched: number; readonly industry: Promise<IIndustry | undefined> }>();
	private checking = false;
	private loaded: Promise<void>;

	constructor(
		@IRequestService private readonly requestService: IRequestService,
		@IStorageService private readonly storageService: IStorageService,
		@IFileService private readonly fileService: IFileService,
		@IPathService pathService: IPathService,
		@INotificationService private readonly notificationService: INotificationService,
		@ISecretStorageService private readonly secretStorageService: ISecretStorageService,
		@ICommandService private readonly commandService: ICommandService,
	) {
		super();
		const folder = joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'alerts');
		this.alertsFile = joinPath(folder, 'alerts.json');
		this.historyFile = joinPath(folder, 'history.jsonl');
		this.notebooksFolder = joinPath(folder, 'notebooks');
		this.read = new Set(this.readStorage<string[]>(READ_KEY, []));
		this.loaded = Promise.all([this.readAlerts(), this.readHistory(false)]).then(() => this._onDidChange.fire());

		// The files change when another window fires an alert or the user edits alerts.json
		const reload = this._register(new RunOnceScheduler(async () => {
			await Promise.all([this.readAlerts(), this.readHistory(true)]);
			this._onDidChange.fire();
		}, 200));
		const watcher = this._register(this.fileService.createWatcher(folder, { recursive: false, excludes: [] }));
		this._register(watcher.onDidChange(e => {
			if (e.contains(this.alertsFile) || e.contains(this.historyFile)) {
				reload.schedule();
			}
		}));
		this._register(this.storageService.onDidChangeValue(StorageScope.APPLICATION, READ_KEY, this._store)(() => {
			this.read = new Set(this.readStorage<string[]>(READ_KEY, []));
			this._onDidChange.fire();
		}));
		this._register(this.storageService.onDidChangeValue(StorageScope.APPLICATION, STATE_KEY, this._store)(() => this._onDidChange.fire()));

		const timer = this._register(new IntervalTimer());
		timer.cancelAndSet(() => this.check(), TICK_MILLISECONDS);
		this.loaded.then(() => this.check());
	}

	getAlerts(): readonly IAlert[] {
		return this.alerts;
	}

	getState(alertId: string): IAlertState | undefined {
		return this.readStorage<Record<string, IAlertState>>(STATE_KEY, {})[alertId];
	}

	getFired(): readonly IFiredAlert[] {
		return this.fired;
	}

	isRead(firedId: string): boolean {
		return this.read.has(firedId);
	}

	markRead(firedIds: readonly string[]): void {
		const unread = firedIds.filter(id => !this.read.has(id));
		if (!unread.length) {
			return;
		}
		unread.forEach(id => this.read.add(id));
		// Only the fired alerts still in the history are remembered
		const known = new Set(this.fired.map(fired => fired.id));
		this.storageService.store(READ_KEY, JSON.stringify([...this.read].filter(id => known.has(id))), StorageScope.APPLICATION, StorageTarget.MACHINE);
		this._onDidChange.fire();
	}

	async removeFired(firedIds: readonly string[]): Promise<void> {
		await this.loaded;
		// Another window may have added to the history since it was read
		await this.readHistory(true);
		const removed = new Set(firedIds);
		await this.writeHistory(this.fired.filter(fired => !removed.has(fired.id)));
	}

	async clearFired(): Promise<void> {
		await this.loaded;
		await this.writeHistory([]);
	}

	async addAlert(alert: Omit<IAlert, 'id'>): Promise<void> {
		await this.loaded;
		this.alerts = [...this.alerts, { id: generateUuid(), ...alert }];
		await this.writeAlerts();
		this.check();
	}

	async setPaused(alertId: string, paused: boolean): Promise<void> {
		await this.loaded;
		this.alerts = this.alerts.map(alert => alert.id === alertId ? { ...alert, paused: paused || undefined } : alert);
		if (!paused) {
			// A resumed alert starts again from the value it finds
			this.updateState(states => { delete states[alertId]; });
		}
		await this.writeAlerts();
		this.check();
	}

	async setEventStudy(alertId: string, eventStudy: boolean): Promise<void> {
		await this.loaded;
		this.alerts = this.alerts.map(alert => alert.id === alertId ? { ...alert, eventStudy: eventStudy || undefined } : alert);
		await this.writeAlerts();
	}

	async removeAlert(alertId: string): Promise<void> {
		await this.loaded;
		this.alerts = this.alerts.filter(alert => alert.id !== alertId);
		this.updateState(states => { delete states[alertId]; });
		await this.writeAlerts();
	}

	async getQuote(symbol: string): Promise<IQuote | undefined> {
		const meta = (await this.fetchChart(symbol, 'interval=1d&range=1d'))?.meta;
		if (typeof meta?.regularMarketPrice !== 'number' || typeof meta.regularMarketTime !== 'number') {
			return undefined;
		}
		const session = meta.currentTradingPeriod?.regular;
		return {
			symbol: meta.symbol ?? symbol,
			name: meta.shortName || meta.longName,
			value: meta.regularMarketPrice,
			currency: meta.currency,
			previousClose: meta.previousClose ?? meta.chartPreviousClose,
			time: meta.regularMarketTime * 1000,
			sessionStart: session?.start ? session.start * 1000 : undefined,
			sessionEnd: session?.end ? session.end * 1000 : undefined,
			dayHigh: meta.regularMarketDayHigh,
			dayLow: meta.regularMarketDayLow,
			yearHigh: meta.fiftyTwoWeekHigh,
			yearLow: meta.fiftyTwoWeekLow,
			volume: meta.regularMarketVolume,
			exchange: meta.fullExchangeName,
		};
	}

	async getChart(symbol: string, range: ChartRange): Promise<IChart | undefined> {
		const result = await this.fetchChart(symbol, `interval=${CHART_INTERVALS[range]}&range=${range}`);
		const closes = result?.indicators?.quote?.[0]?.close;
		if (!result?.timestamp || !closes) {
			return undefined;
		}
		// Yahoo Finance leaves a gap as null
		const times: number[] = [];
		const values: number[] = [];
		result.timestamp.forEach((time, index) => {
			const value = closes[index];
			if (typeof value === 'number') {
				times.push(time * 1000);
				values.push(value);
			}
		});
		return { times, values, previousClose: result.meta?.chartPreviousClose ?? result.meta?.previousClose };
	}

	async getSeries(source: EconomicSource, id: string, count: number): Promise<IEconomicSeries | 'noKey' | undefined> {
		const fredKey = source === 'fred' ? await this.secretStorageService.get(CREDENTIALS.fred.secretKey) : undefined;
		return fetchEconomicSeries(options => this.request(options), source, id, count, fredKey);
	}

	async setFredKey(key: string): Promise<void> {
		await this.secretStorageService.set(CREDENTIALS.fred.secretKey, key);
	}

	async backtest(alert: Pick<IAlert, 'symbol' | 'source' | 'condition' | 'threshold' | 'halfLife' | 'minutes'>): Promise<IBacktest | StatisticsProblem | 'noKey' | undefined> {
		const observed = await this.observations(alert, Date.now());
		if (typeof observed !== 'object') {
			return observed;
		}
		const answer = await this.statistics<IStatisticsBacktest>({ op: 'backtest', spec: statisticsSpec(alert), values: observed.values });
		return typeof answer === 'object' ? { ...observed, lower: answer.lower ?? [], upper: answer.upper ?? [], fired: answer.fired ?? [] } : answer;
	}

	async writeNotebook(alert: Pick<IAlert, 'symbol' | 'name' | 'source' | 'condition' | 'threshold' | 'halfLife' | 'minutes'>): Promise<URI | 'noKey' | undefined> {
		const observed = await this.observations(alert, Date.now());
		if (typeof observed !== 'object') {
			return observed;
		}
		const folder = joinPath(this.notebooksFolder, `${alert.source ?? 'yahoo'}-${alert.symbol}-${alert.condition}`.replace(/[^A-Za-z0-9._-]+/g, '_'));
		const spec = statisticsSpec(alert);
		// TOML's basic strings are written as JSON's
		const settings = Object.entries({ name: alert.name || alert.symbol, symbol: alert.symbol, source: alert.source ?? 'yahoo', ...spec })
			.map(([key, value]) => `${key} = ${typeof value === 'string' ? JSON.stringify(value) : value}`);
		const rows = observed.values.map((value, index) => [observed.times ? new Date(observed.times[index]).toISOString() : observed.periods?.[index] ?? '', String(value)]);
		await this.fileService.writeFile(joinPath(folder, 'alert.toml'), VSBuffer.fromString(settings.join('\n') + '\n'));
		await this.fileService.writeFile(joinPath(folder, 'values.csv'), VSBuffer.fromString(writeCsv([[observed.times ? 'time' : 'period', 'value'], ...rows])));
		const notebook = joinPath(folder, 'alert.ipynb');
		if (!await this.fileService.exists(notebook)) {
			await this.fileService.writeFile(notebook, VSBuffer.fromString(alertNotebook(folder.fsPath)));
		}
		return notebook;
	}

	/**
	 * The values a statistical alert looks at: a quote's, the close of each minute of the regular sessions of the last
	 * days that ended by `until`, one every `minutes` as the alert looks it up; a series' latest values.
	 */
	private async observations(alert: Pick<IAlert, 'symbol' | 'source' | 'condition' | 'threshold' | 'minutes'>, until: number): Promise<Omit<IBacktest, 'lower' | 'upper' | 'fired'> | 'noKey' | undefined> {
		if (alert.source) {
			// A high or low of more values than that needs them all
			const count = Math.max(STATISTICS_SERIES_COUNT, alert.condition === 'newExtreme' ? Math.round(alert.threshold) + 1 : 0);
			const series = await this.getSeries(alert.source, alert.symbol, count);
			return typeof series === 'object' ? { periods: series.observations.map(observation => observation.period), values: series.observations.map(observation => observation.value) } : series;
		}
		const minuteBars = await this.getMinuteBars(alert.symbol, until - STATISTICS_QUOTE_DAYS * 24 * 60 * 60_000, until);
		if (!minuteBars) {
			return undefined;
		}
		const bars = minuteBars.bars.filter(bar => bar.session === 'regular' && bar.time + 60_000 <= until);
		const every = Math.max(1, Math.round(alert.minutes ?? 1));
		const chosen = bars.filter((_, index) => (bars.length - 1 - index) % every === 0);
		return { times: chosen.map(bar => bar.time + 60_000), values: chosen.map(bar => bar.close) };
	}

	/** The answer of OnlineStats.jl, through Pollis' Julia extension, or why there is none. */
	private async statistics<T>(request: object): Promise<T | StatisticsProblem> {
		try {
			const answer = await this.commandService.executeCommand<T & { readonly error?: string }>(ALERT_STATISTICS_COMMAND_ID, request);
			if (!answer) {
				return 'failed';
			}
			return answer.error === 'noJulia' || answer.error === 'installing' ? answer.error : answer.error ? 'failed' : answer;
		} catch {
			// The Julia extension is disabled, or not activated yet
			return 'failed';
		}
	}

	async getMinuteBars(symbol: string, start: number, end: number, minutes: 1 | 5 = 1): Promise<IMinuteBars | undefined> {
		const bars = new Map<number, IMinuteBar>();
		const sessions = new Map<number, number>();
		// Five-minute bars come in longer spans: Yahoo Finance gives up to 60 days of them a request
		const span = minutes === 1 ? MINUTE_BARS_SPAN_MILLISECONDS : 8 * MINUTE_BARS_SPAN_MILLISECONDS;
		for (let from = start; from < end; from += span) {
			const to = Math.min(end, from + span);
			const result = await this.fetchChart(symbol, `interval=${minutes}m&period1=${Math.floor(from / 1000)}&period2=${Math.ceil(to / 1000)}&includePrePost=true`);
			if (!result) {
				return undefined;
			}
			const periods = result.meta?.tradingPeriods;
			const spansOf = (session: MarketSession) => (periods?.[session] ?? []).flat()
				.filter(period => typeof period.start === 'number' && typeof period.end === 'number')
				.map(period => [period.start! * 1000, period.end! * 1000] as const);
			spansOf('regular').forEach(([open, close]) => sessions.set(open, close));
			const pre = spansOf('pre');
			const post = spansOf('post');
			const quote = result.indicators?.quote?.[0];
			(result.timestamp ?? []).forEach((second, index) => {
				const time = second * 1000;
				const open = quote?.open?.[index];
				const high = quote?.high?.[index];
				const low = quote?.low?.[index];
				const close = quote?.close?.[index];
				// Yahoo Finance leaves a minute without trades as null
				if (time < from || time >= to || typeof open !== 'number' || typeof high !== 'number' || typeof low !== 'number' || typeof close !== 'number') {
					return;
				}
				const within = (spans: readonly (readonly [number, number])[]) => spans.some(([first, last]) => time >= first && time < last);
				const session: MarketSession = within(pre) ? 'pre' : within(post) ? 'post' : 'regular';
				bars.set(time, { time, session, open, high, low, close, volume: quote?.volume?.[index] ?? 0 });
			});
		}
		return {
			bars: [...bars.values()].sort((a, b) => a.time - b.time),
			sessions: [...sessions].sort((a, b) => a[0] - b[0]),
		};
	}

	getSecContact(): Promise<string | undefined> {
		return this.secretStorageService.get(CREDENTIALS.secUserAgent.secretKey);
	}

	async setSecContact(contact: string): Promise<void> {
		await this.secretStorageService.set(CREDENTIALS.secUserAgent.secretKey, contact);
		this.check();
	}

	async getFiler(company: string): Promise<IFiler | undefined> {
		const contact = await this.getSecContact();
		const wanted = company.trim().toUpperCase();
		if (!contact || !wanted) {
			return undefined;
		}
		const cik = /^\d+$/.test(wanted) ? String(Number(wanted)) : (await this.getTickers(contact))?.ciks.get(wanted);
		if (!cik) {
			return undefined;
		}
		const submissions = await this.fetchSec<ISecSubmissions>(`https://data.sec.gov/submissions/CIK${cik.padStart(10, '0')}.json`, contact);
		const recent = submissions?.filings?.recent;
		if (!submissions?.name || !recent?.accessionNumber) {
			return undefined;
		}
		const filings = recent.accessionNumber.map((accession, index): IFiling => {
			const folder = `https://www.sec.gov/Archives/edgar/data/${cik}/${accession.replace(/-/g, '')}`;
			const document = recent.primaryDocument?.[index];
			const items = recent.items?.[index]?.split(',').map(item => item.trim()).filter(item => item);
			return {
				form: recent.form?.[index] ?? '',
				filed: recent.filingDate?.[index] ?? '',
				accepted: submissionsAccepted(recent.acceptanceDateTime?.[index]),
				accession,
				description: recent.primaryDocDescription?.[index] || undefined,
				items: items?.length ? items : undefined,
				url: document ? `${folder}/${document}` : `${folder}/${accession}-index.htm`,
			};
		});
		return { cik, name: submissions.name, tickers: submissions.tickers ?? [], filings };
	}

	async getCompanies(companies: readonly string[]): Promise<{ readonly found: readonly ICompany[]; readonly unknown: readonly string[] } | undefined> {
		const contact = await this.getSecContact();
		const names = contact && await this.getTickers(contact);
		if (!contact || !names) {
			return undefined;
		}
		const found = new Map<string, ICompany>();
		const unknown: string[] = [];
		for (const company of companies.map(company => company.trim().toUpperCase()).filter(company => company)) {
			const cik = /^\d+$/.test(company) ? String(Number(company)) : names.ciks.get(company);
			// A CIK without a ticker, such as a company no longer listed, is looked up on its own
			const name = cik && (names.names.get(cik) ?? (await this.getFiler(cik))?.name);
			if (cik && name) {
				found.set(cik, { cik, name });
			} else {
				unknown.push(company);
			}
		}
		return { found: [...found.values()], unknown };
	}

	async getIndustry(sic: string): Promise<IIndustry | undefined> {
		const contact = await this.getSecContact();
		const code = sic.trim();
		if (!contact || !/^\d{3,4}$/.test(code)) {
			return undefined;
		}
		const cached = this.industries.get(code);
		if (cached && Date.now() - cached.fetched < INDUSTRY_MILLISECONDS) {
			return cached.industry;
		}
		const industry = this.fetchIndustry(code, contact).then(result => {
			// A failure is tried again next time
			if (!result) {
				this.industries.delete(code);
			}
			return result;
		});
		this.industries.set(code, { fetched: Date.now(), industry });
		return industry;
	}

	/** The companies the SEC files under `sic`, 100 a page, and the industry's name, from the first company's submissions. */
	private async fetchIndustry(sic: string, contact: string): Promise<IIndustry | undefined> {
		const ciks: string[] = [];
		for (let start = 0; start < MAX_INDUSTRY_COMPANIES; start += 100) {
			const page = await this.fetchSecText(`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&SIC=${sic}&owner=include&count=100&start=${start}&output=atom`, contact);
			if (page === undefined) {
				return undefined;
			}
			const found = Array.from(page.matchAll(/<cik>(?<cik>\d+)<\/cik>/g), match => String(Number(match.groups?.cik)));
			ciks.push(...found);
			if (found.length < 100) {
				break;
			}
		}
		if (!ciks.length) {
			return undefined;
		}
		const submissions = await this.fetchSec<ISecSubmissions>(`https://data.sec.gov/submissions/CIK${ciks[0].padStart(10, '0')}.json`, contact);
		return { sic, name: submissions?.sicDescription || `SIC ${sic}`, ciks: [...new Set(ciks)] };
	}

	async searchFilings(alert: Pick<IAlert, 'symbol' | 'phrase' | 'forms' | 'items' | 'ciks' | 'sic' | 'everyone'>, days: number): Promise<{ readonly filings: readonly ISearchedFiling[]; readonly more: boolean } | undefined> {
		const contact = await this.getSecContact();
		if (!contact) {
			return undefined;
		}
		const since = Date.now() - days * 24 * 60 * 60_000;
		if (!alert.sic || alert.everyone) {
			return this.fetchSearch(alert, since, contact);
		}
		// An industry's companies, a hundred a search, as the search cannot look for a SIC code
		const ciks = (await this.getIndustry(alert.sic))?.ciks;
		if (!ciks) {
			return undefined;
		}
		const filings: ISearchedFiling[] = [];
		let more = false;
		for (let start = 0; start < ciks.length; start += SEARCH_CIKS) {
			const found = await this.fetchSearch({ ...alert, sic: undefined, ciks: ciks.slice(start, start + SEARCH_CIKS) }, since, contact);
			if (!found) {
				return start ? { filings: filings.sort((a, b) => a.filed.localeCompare(b.filed)), more: true } : undefined;
			}
			filings.push(...found.filings);
			more ||= found.more;
		}
		return { filings: filings.sort((a, b) => a.filed.localeCompare(b.filed)), more };
	}

	/**
	 * EDGAR's full-text search for an alert's phrase since the day of `since`: the documents that have it, 100 a page,
	 * one filing each, of the alert's companies (by CIK at the SEC, by SIC here, as the search cannot), forms and items.
	 */
	private async fetchSearch(alert: Pick<IAlert, 'symbol' | 'phrase' | 'forms' | 'items' | 'ciks' | 'sic' | 'everyone'>, since: number, contact: string): Promise<{ readonly filings: ISearchedFiling[]; readonly more: boolean } | undefined> {
		const day = (time: number) => new Date(time).toISOString().slice(0, 10);
		const ciks = alert.everyone || alert.sic ? [] : alert.ciks?.length ? alert.ciks : [alert.symbol];
		const query = [
			`q=${encodeURIComponent(alert.phrase ?? '')}`,
			alert.forms?.length ? `forms=${encodeURIComponent(alert.forms.join(','))}` : '',
			ciks.length ? `ciks=${ciks.map(cik => cik.padStart(10, '0')).join(',')}` : '',
			// A day either side, as the SEC's days are New York's
			`dateRange=custom&startdt=${day(since - 24 * 60 * 60_000)}&enddt=${day(Date.now() + 24 * 60 * 60_000)}`,
		].filter(part => part).join('&');
		const filings = new Map<string, ISearchedFiling>();
		let total = 0;
		let read = 0;
		for (let from = 0; from < MAX_SEARCHED; from += 100) {
			const page = await this.fetchSec<ISecSearch>(`https://efts.sec.gov/LATEST/search-index?${query}&from=${from}`, contact);
			if (!page?.hits) {
				return from ? { filings: [...filings.values()], more: true } : undefined;
			}
			total = page.hits.total?.value ?? 0;
			for (const hit of page.hits.hits ?? []) {
				read++;
				const source = hit._source;
				const [accession, document] = (hit._id ?? '').split(':');
				const cik = source?.ciks?.[0] && String(Number(source.ciks[0]));
				if (!source || !cik || !accession || filings.has(accession) || (alert.sic && !source.sics?.includes(alert.sic))) {
					continue;
				}
				const filing: ISearchedFiling = {
					cik,
					name: (source.display_names?.[0] ?? '').replace(/\s+\(.*$/, '') || cik,
					form: source.form ?? source.root_forms?.[0] ?? '',
					filed: source.file_date ?? '',
					accession,
					description: source.file_description,
					items: source.items?.length ? source.items : undefined,
					url: `https://www.sec.gov/Archives/edgar/data/${cik}/${accession.replace(/-/g, '')}/${document || `${accession}-index.htm`}`,
				};
				if (matchesFiling(filing, alert)) {
					filings.set(accession, filing);
				}
			}
			if (read >= total || !page.hits.hits?.length) {
				break;
			}
		}
		return { filings: [...filings.values()].sort((a, b) => a.filed.localeCompare(b.filed)), more: read < total };
	}

	/**
	 * EDGAR's latest filings of every company, newest first, back to the first accepted at or before `since` (only the
	 * newest page when it is undefined), or as far as the feed goes; undefined when it cannot be reached.
	 */
	private async getLatestFilings(contact: string, since: number | undefined): Promise<ILatestFiling[] | undefined> {
		const filings: ILatestFiling[] = [];
		for (let start = 0; start < MAX_LATEST_FILINGS; start += 100) {
			const page = await this.fetchSecText(`https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&owner=include&count=100&start=${start}&output=atom`, contact);
			if (page === undefined) {
				return start ? filings : undefined;
			}
			const entries = Array.from(page.matchAll(/<entry>[\s\S]*?<\/entry>/g), match => parseLatestFiling(match[0]));
			for (const entry of entries) {
				if (entry) {
					filings.push(entry);
				}
			}
			const oldest = filings[filings.length - 1]?.time;
			if (entries.length < 100 || since === undefined || oldest === undefined || oldest <= since) {
				break;
			}
		}
		return filings;
	}

	/** The CIK of each ticker at the SEC, and the name of each CIK, or undefined when it cannot be reached; a failure is tried again next time. */
	private getTickers(contact: string): Promise<ISecNames | undefined> {
		if (!this.tickers) {
			this.tickers = this.fetchSec<ISecTickers>('https://www.sec.gov/files/company_tickers.json', contact).then(tickers => {
				if (!tickers) {
					this.tickers = undefined;
					return undefined;
				}
				const result: ISecNames = { ciks: new Map(), names: new Map() };
				for (const entry of Object.values(tickers)) {
					if (entry.ticker && entry.cik_str) {
						result.ciks.set(entry.ticker.toUpperCase(), String(entry.cik_str));
						if (entry.title && !result.names.has(String(entry.cik_str))) {
							result.names.set(String(entry.cik_str), entry.title);
						}
					}
				}
				return result;
			});
		}
		return this.tickers;
	}

	/** A JSON document of the SEC, which answers only requests naming the user in their User-Agent. */
	private async fetchSec<T>(url: string, contact: string): Promise<T | undefined> {
		try {
			const context = await this.request({ type: 'GET', url, headers: { 'User-Agent': contact }, callSite: 'pollis.alerts.sec' });
			return isSuccess(context) ? await asJson<T>(context) ?? undefined : undefined;
		} catch {
			return undefined;
		}
	}

	/** A page of the SEC's, such as an Atom feed of EDGAR, which answers only requests naming the user in their User-Agent. */
	private async fetchSecText(url: string, contact: string): Promise<string | undefined> {
		try {
			const context = await this.request({ type: 'GET', url, headers: { 'User-Agent': contact }, callSite: 'pollis.alerts.sec' });
			return isSuccess(context) ? await asText(context) ?? undefined : undefined;
		} catch {
			return undefined;
		}
	}

	async searchSymbols(text: string): Promise<readonly ISymbolMatch[] | undefined> {
		try {
			const context = await this.request({
				type: 'GET',
				url: `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(text)}&quotesCount=8&newsCount=0&listsCount=0`,
				// Yahoo Finance answers only a browser's requests
				headers: { 'User-Agent': 'Mozilla/5.0' },
				callSite: 'pollis.alerts.search',
			});
			if (!isSuccess(context)) {
				return undefined;
			}
			const answer = await asJson<{ readonly quotes?: readonly { readonly symbol?: string; readonly shortname?: string; readonly longname?: string; readonly exchDisp?: string; readonly quoteType?: string }[] }>(context);
			const matches: ISymbolMatch[] = [];
			for (const quote of answer?.quotes ?? []) {
				const name = quote.longname?.trim() || quote.shortname?.trim();
				if (quote.symbol && name) {
					matches.push({ symbol: quote.symbol, name, exchange: quote.exchDisp, type: quote.quoteType });
				}
			}
			return matches;
		} catch {
			return undefined;
		}
	}

	/** The Yahoo Finance chart of `symbol` for `query`, its interval and span, or undefined when it does not know it or cannot be reached. */
	private async fetchChart(symbol: string, query: string): Promise<IYahooChartResult | undefined> {
		try {
			const context = await this.request({
				type: 'GET',
				url: `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?${query}`,
				// Yahoo Finance answers only a browser's requests
				headers: { 'User-Agent': 'Mozilla/5.0' },
				callSite: 'pollis.alerts.quote',
			});
			if (!isSuccess(context)) {
				return undefined;
			}
			return (await asJson<IYahooChart>(context))?.chart?.result?.[0];
		} catch {
			return undefined;
		}
	}

	protected request(options: IRequestOptions): Promise<IRequestContext> {
		return this.requestService.request(options, CancellationToken.None);
	}

	/** Looks up the alerts that are due, in the window that holds the lease. */
	private async check(): Promise<void> {
		if (this.checking || !this.holdLease()) {
			return;
		}
		this.checking = true;
		try {
			const now = Date.now();
			const states = this.readStorage<Record<string, IAlertState>>(STATE_KEY, {});
			const due = this.alerts.filter(alert => !alert.paused && now - (states[alert.id]?.checked ?? 0) >= (alert.minutes ?? (alert.source ? 60 : alert.condition === 'newFiling' ? 15 : 1)) * 60_000 - 5_000
				&& (alert.condition === 'newFiling' || alert.source || now >= (this.quietUntil.get(alert.symbol) ?? 0)));
			const filingsDue = due.filter(alert => alert.condition === 'newFiling');
			const contact = filingsDue.length ? await this.getSecContact() : undefined;
			const filers = new Map<string, IFiler | undefined>();
			const searchSeen = new Map<string, string[] | undefined>();
			for (const cik of new Set(filingsDue.filter(alert => !isFeedAlert(alert) && !isSearchAlert(alert)).map(alert => alert.symbol))) {
				filers.set(cik, contact ? await this.getFiler(cik) : undefined);
			}
			// Several companies and industries share one read of EDGAR's latest filings, back to the oldest filing they wait after
			const feedDue = filingsDue.filter(isFeedAlert);
			// Alerts with a phrase each search, back to their last look-up and some days more for filings the search indexed late
			const searched = new Map<string, ISearchedFiling[] | undefined>();
			for (const alert of filingsDue.filter(isSearchAlert)) {
				const since = Math.max(Math.min(states[alert.id]?.checked ?? now, now - SEARCH_DAYS * 24 * 60 * 60_000), now - 30 * 24 * 60 * 60_000);
				const result = contact ? await this.fetchSearch(alert, since, contact) : undefined;
				const seen = new Set(states[alert.id]?.seen);
				// Only those filed since the day before the last look-up: the search reads its hits by relevance, at most a thousand
				const after = new Date((states[alert.id]?.checked ?? now) - 24 * 60 * 60_000).toISOString().slice(0, 10);
				const fresh = states[alert.id]?.seen ? result?.filings.filter(filing => !seen.has(filing.accession) && filing.filed >= after) : [];
				// The second EDGAR accepted each new filing, from its filer's submissions
				const accepted: ISearchedFiling[] = [];
				for (const filing of fresh ?? []) {
					const found = (await this.getFiler(filing.cik))?.filings.find(other => other.accession === filing.accession);
					accepted.push(found?.accepted ? { ...filing, accepted: found.accepted } : filing);
				}
				searched.set(alert.id, result && accepted);
				searchSeen.set(alert.id, result?.filings.map(filing => filing.accession));
			}
			const companies = new Map<string, ReadonlySet<string> | undefined>();
			for (const alert of feedDue) {
				companies.set(alert.id, alert.sic ? await this.getIndustry(alert.sic).then(industry => industry && new Set(industry.ciks)) : new Set(alert.ciks));
			}
			const since = feedDue.map(alert => states[alert.id]?.since).filter((time): time is number => time !== undefined);
			const latest = contact && feedDue.length ? await this.getLatestFilings(contact, since.length ? Math.min(...since) : undefined) : undefined;
			// Each economic series once, with the value before its latest
			const series = new Map<string, IEconomicSeries | 'noKey' | undefined>();
			for (const { source, symbol } of due) {
				if (source && !series.has(`${source}:${symbol}`)) {
					series.set(`${source}:${symbol}`, await this.getSeries(source, symbol, 2));
				}
			}
			const symbols = [...new Set(due.filter(alert => alert.condition !== 'newFiling' && !alert.source).map(alert => alert.symbol))];
			const quotes = new Map<string, IQuote | undefined>();
			for (const symbol of symbols) {
				const quote = await this.getQuote(symbol);
				quotes.set(symbol, quote);
				const sessionOver = quote?.sessionEnd && now > quote.sessionEnd + QUOTE_DELAY_MILLISECONDS;
				const sessionAhead = quote?.sessionStart && now < quote.sessionStart;
				if (sessionOver || sessionAhead) {
					this.quietUntil.set(symbol, now + QUIET_MILLISECONDS);
				} else {
					this.quietUntil.delete(symbol);
				}
			}
			// A statistical alert takes in each new value, with the values before it when Julia has not seen the alert yet
			const statistics = new Map<string, IStatisticsUpdate | StatisticsProblem | undefined>();
			for (const alert of due.filter(alert => isStatistical(alert.condition))) {
				const previous = states[alert.id];
				let value: number;
				let history: () => Promise<number[] | undefined>;
				if (alert.source) {
					const found = series.get(`${alert.source}:${alert.symbol}`);
					const latest = typeof found === 'object' ? found.observations[found.observations.length - 1] : undefined;
					if (!latest || previous?.period === undefined || latest.period <= previous.period) {
						continue;
					}
					value = latest.value;
					history = async () => {
						const observed = await this.observations(alert, now);
						return typeof observed === 'object' ? observed.values.filter((_, index) => (observed.periods?.[index] ?? '') < latest.period) : undefined;
					};
				} else {
					const quote = quotes.get(alert.symbol);
					if (!quote || previous?.quoted === undefined || quote.time <= previous.quoted) {
						continue;
					}
					value = quote.value;
					history = async () => {
						const observed = await this.observations(alert, quote.time);
						return typeof observed === 'object' ? [...observed.values] : undefined;
					};
				}
				const spec = statisticsSpec(alert);
				let answer: IStatisticsUpdate | StatisticsProblem | undefined = await this.statistics<IStatisticsUpdate>({ op: 'update', key: alert.id, spec, value });
				if (typeof answer === 'object' && answer.needsHistory) {
					const before = await history();
					answer = before ? await this.statistics<IStatisticsUpdate>({ op: 'update', key: alert.id, spec, value, history: before }) : undefined;
				}
				statistics.set(alert.id, answer);
			}
			// A value a statistical alert could not take in is taken in at the next look-up: its period or quote time is kept
			const unanswered = (previous: IAlertState | undefined, problem: StatisticsProblem | undefined): IAlertState => ({
				...previous,
				armed: previous?.armed ?? true,
				checked: now,
				error: problem !== 'installing' || undefined,
				noJulia: problem === 'noJulia' || undefined,
				installing: problem === 'installing' || undefined,
			});
			const fired: IFiredAlert[] = [];
			const once: string[] = [];
			this.updateState(states => {
				for (const alert of due) {
					const previous = states[alert.id];
					if (alert.condition === 'newFiling' && isSearchAlert(alert)) {
						const fresh = searched.get(alert.id);
						const seen = searchSeen.get(alert.id);
						if (!fresh || !seen) {
							states[alert.id] = { ...previous, armed: true, checked: now, error: true, noContact: !contact || undefined };
							continue;
						}
						for (const { cik, name, ...filing } of alert.repeat ? fresh : fresh.slice(0, 1)) {
							fired.push({ id: generateUuid(), alertId: alert.id, symbol: cik, name, condition: alert.condition, threshold: alert.threshold, severity: alert.severity, value: 0, filing, time: now });
						}
						if (fresh.length && !alert.repeat) {
							once.push(alert.id);
						}
						const last = fresh[fresh.length - 1];
						states[alert.id] = {
							checked: now,
							armed: true,
							seen,
							since: now,
							filing: last ? { form: last.form, filed: last.filed, accession: last.accession, name: last.name } : previous?.filing,
						};
						continue;
					}
					if (alert.condition === 'newFiling' && isFeedAlert(alert)) {
						const ciks = companies.get(alert.id);
						if (!latest || !ciks) {
							states[alert.id] = { ...previous, armed: true, checked: now, error: true, noContact: !contact || undefined };
							continue;
						}
						// The filings accepted after the newest looked at before, of its companies, oldest first; none on the first look-up
						const after = previous?.since ?? Infinity;
						const seen = new Set<string>();
						const fresh = latest.filter(filing => filing.time > after && ciks.has(filing.cik) && matchesFiling(filing, alert) && !seen.has(filing.accession) && seen.add(filing.accession)).reverse();
						for (const { cik, name, time: _time, ...filing } of alert.repeat ? fresh : fresh.slice(0, 1)) {
							fired.push({ id: generateUuid(), alertId: alert.id, symbol: cik, name, condition: alert.condition, threshold: alert.threshold, severity: alert.severity, value: 0, filing, time: now });
						}
						if (fresh.length && !alert.repeat) {
							once.push(alert.id);
						}
						const last = fresh[fresh.length - 1];
						states[alert.id] = {
							checked: now,
							armed: true,
							since: Math.max(latest[0]?.time ?? 0, previous?.since ?? 0) || now,
							filing: last ? { form: last.form, filed: last.filed, accession: last.accession, name: last.name } : previous?.filing,
						};
						continue;
					}
					if (alert.condition === 'newFiling') {
						const filer = filers.get(alert.symbol);
						if (!filer) {
							states[alert.id] = { ...previous, armed: true, checked: now, error: true, noContact: !contact || undefined };
							continue;
						}
						// The filings after the newest one found before, oldest first; none on the first look-up
						const known = previous?.filing ? filer.filings.findIndex(filing => filing.accession === previous.filing?.accession) : 0;
						const fresh = filer.filings.slice(0, Math.max(known, 0)).filter(filing => matchesFiling(filing, alert)).reverse();
						for (const filing of alert.repeat ? fresh : fresh.slice(0, 1)) {
							fired.push({ id: generateUuid(), alertId: alert.id, symbol: alert.symbol, name: alert.name || filer.name, condition: alert.condition, threshold: alert.threshold, severity: alert.severity, value: 0, filing, time: now });
						}
						if (fresh.length && !alert.repeat) {
							once.push(alert.id);
						}
						const newest = filer.filings[0];
						states[alert.id] = { checked: now, armed: true, filing: newest && { form: newest.form, filed: newest.filed, accession: newest.accession } };
						continue;
					}
					if (alert.source) {
						const found = series.get(`${alert.source}:${alert.symbol}`);
						const latest = typeof found === 'object' ? found.observations[found.observations.length - 1] : undefined;
						if (typeof found !== 'object' || !latest) {
							states[alert.id] = { ...previous, armed: true, checked: now, error: true, noKey: found === 'noKey' || undefined };
							continue;
						}
						// A value is new when its period comes after the latest one before; none is on the first look-up, and a revised value is not
						if (previous?.period !== undefined && latest.period > previous.period) {
							const computed = statistics.get(alert.id);
							if (isStatistical(alert.condition) && typeof computed !== 'object') {
								states[alert.id] = unanswered(previous, computed);
								continue;
							}
							const answer = typeof computed === 'object' ? computed : undefined;
							const before = found.observations.length > 1 ? found.observations[found.observations.length - 2].value : previous.value;
							const fires = answer ? !!answer.fires : this.evaluateNew(alert, latest.value, before);
							if (fires) {
								const change = before !== undefined ? latest.value - before : undefined;
								fired.push({ id: generateUuid(), alertId: alert.id, symbol: alert.symbol, name: alert.name || found.title, condition: alert.condition, threshold: alert.threshold, severity: alert.severity, value: latest.value, previousValue: before, change, source: alert.source, period: latest.period, lower: answer?.lower ?? undefined, upper: answer?.upper ?? undefined, time: now });
								if (!alert.repeat) {
									once.push(alert.id);
								}
							}
						}
						states[alert.id] = { value: latest.value, period: latest.period, checked: now, armed: true };
						continue;
					}
					const quote = quotes.get(alert.symbol);
					if (!quote) {
						states[alert.id] = { ...previous, armed: previous?.armed ?? true, checked: now, error: true };
						continue;
					}
					if (isStatistical(alert.condition)) {
						const computed = statistics.get(alert.id);
						if (statistics.has(alert.id) && typeof computed !== 'object') {
							states[alert.id] = unanswered(previous, computed);
							continue;
						}
						const answer = typeof computed === 'object' ? computed : undefined;
						// Fires again once a value is back within
						const armed = previous?.armed ?? true;
						const fires = !!answer?.fires;
						if (fires && armed) {
							fired.push({ id: generateUuid(), alertId: alert.id, symbol: alert.symbol, name: alert.name || quote.name, condition: alert.condition, threshold: alert.threshold, severity: alert.severity, value: quote.value, previousValue: previous?.value, currency: quote.currency, lower: answer?.lower ?? undefined, upper: answer?.upper ?? undefined, time: now });
							if (!alert.repeat) {
								once.push(alert.id);
							}
						}
						states[alert.id] = { value: quote.value, currency: quote.currency, quoted: quote.time, checked: now, armed: answer ? !fires : armed };
						continue;
					}
					const { fires, beyond, change } = this.evaluate(alert, quote, previous);
					const armed = previous?.armed ?? true;
					if (fires && armed) {
						fired.push({ id: generateUuid(), alertId: alert.id, symbol: alert.symbol, name: alert.name || quote.name, condition: alert.condition, threshold: alert.threshold, severity: alert.severity, value: quote.value, previousValue: previous?.value, currency: quote.currency, change, time: now });
						if (!alert.repeat) {
							once.push(alert.id);
						}
					}
					states[alert.id] = {
						value: quote.value,
						currency: quote.currency,
						quoted: quote.time,
						checked: now,
						// It fires again once the value is back on the other side
						armed: fires ? false : (armed || !beyond),
					};
				}
			});
			if (once.length) {
				this.alerts = this.alerts.map(alert => once.includes(alert.id) ? { ...alert, paused: true } : alert);
				await this.writeAlerts();
			}
			if (fired.length) {
				await this.appendHistory(fired);
				for (const alert of fired) {
					this.notify(alert);
				}
			}
		} finally {
			this.checking = false;
		}
	}

	/**
	 * Whether `quote` meets the condition of `alert` now (`fires`), and whether it is still beyond the threshold, which
	 * keeps a fired alert from firing again until the value is back.
	 */
	private evaluate(alert: IAlert, quote: IQuote, previous: IAlertState | undefined): { fires: boolean; beyond: boolean; change?: number } {
		const before = previous?.value;
		switch (alert.condition) {
			case 'above': {
				const beyond = quote.value > alert.threshold;
				return { fires: beyond, beyond };
			}
			case 'below': {
				const beyond = quote.value < alert.threshold;
				return { fires: beyond, beyond };
			}
			case 'crossesAbove':
				return { fires: before !== undefined && before <= alert.threshold && quote.value > alert.threshold, beyond: false };
			case 'crossesBelow':
				return { fires: before !== undefined && before >= alert.threshold && quote.value < alert.threshold, beyond: false };
			case 'movesBy': {
				if (!quote.previousClose) {
					return { fires: false, beyond: false };
				}
				const change = (quote.value / quote.previousClose - 1) * 100;
				const beyond = Math.abs(change) >= alert.threshold;
				return { fires: beyond, beyond, change };
			}
			default:
				return { fires: false, beyond: false };
		}
	}

	/** Whether the new value `value` of an economic series meets the condition of `alert`, `before` being the value before it. */
	private evaluateNew(alert: IAlert, value: number, before: number | undefined): boolean {
		switch (alert.condition) {
			case 'newValue': return true;
			case 'above': return value > alert.threshold;
			case 'below': return value < alert.threshold;
			case 'crossesAbove': return before !== undefined && before <= alert.threshold && value > alert.threshold;
			case 'crossesBelow': return before !== undefined && before >= alert.threshold && value < alert.threshold;
			case 'changesBy': return before !== undefined && Math.abs(value - before) >= alert.threshold;
			default: return false;
		}
	}

	private notify(fired: IFiredAlert): void {
		const severity = fired.severity === 'error' ? Severity.Error : fired.severity === 'warning' ? Severity.Warning : Severity.Info;
		const filing = fired.filing;
		const page = fired.source && seriesPage(fired.source, fired.symbol);
		this.notificationService.prompt(severity, describeFiredAlert(fired), [
			...(filing ? [{ label: localize('alerts.openFiling', "Open Filing"), run: () => { this.markRead([fired.id]); this.commandService.executeCommand(OPEN_LINK_COMMAND_ID, filing.url); } }] : []),
			...(page ? [{ label: localize('alerts.openSeries', "Open Series"), run: () => { this.markRead([fired.id]); this.commandService.executeCommand(OPEN_LINK_COMMAND_ID, page); } }] : []),
			{ label: localize('alerts.markRead', "Mark Read"), run: () => this.markRead([fired.id]) },
			{ label: localize('alerts.pause', "Pause Alert"), run: () => { this.markRead([fired.id]); this.setPaused(fired.alertId, true); } },
		], { sticky: true });
	}

	/** Takes or renews the lease when no other window holds it; whether this window holds it. */
	private holdLease(): boolean {
		const lease = this.readStorage<{ owner?: string; time?: number }>(LEASE_KEY, {});
		const now = Date.now();
		if (lease.owner && lease.owner !== this.owner && now - (lease.time ?? 0) < LEASE_MILLISECONDS) {
			return false;
		}
		this.storageService.store(LEASE_KEY, JSON.stringify({ owner: this.owner, time: now }), StorageScope.APPLICATION, StorageTarget.MACHINE);
		return true;
	}

	private updateState(change: (states: Record<string, IAlertState>) => void): void {
		const states = this.readStorage<Record<string, IAlertState>>(STATE_KEY, {});
		change(states);
		this.storageService.store(STATE_KEY, JSON.stringify(states), StorageScope.APPLICATION, StorageTarget.MACHINE);
		this._onDidChange.fire();
	}

	private async readAlerts(): Promise<void> {
		try {
			const content = JSON.parse((await this.fileService.readFile(this.alertsFile)).value.toString()) as { alerts?: IAlert[] };
			this.alerts = (content.alerts ?? []).filter(alert => alert?.id && alert.symbol && typeof alert.threshold === 'number');
		} catch {
			// No alerts yet, or a file being edited
		}
	}

	private async writeAlerts(): Promise<void> {
		await this.fileService.writeFile(this.alertsFile, VSBuffer.fromString(JSON.stringify({ alerts: this.alerts }, undefined, '\t') + '\n'));
		this._onDidChange.fire();
	}

	/** Reads the history; `announce` fires onDidFire with the alerts not seen before, which another window fired. */
	private async readHistory(announce: boolean): Promise<void> {
		let fired: IFiredAlert[];
		try {
			const content = (await this.fileService.readFile(this.historyFile)).value.toString();
			fired = content.split('\n').filter(line => line).map(line => JSON.parse(line) as IFiredAlert).reverse();
		} catch {
			return;
		}
		const known = new Set(this.fired.map(alert => alert.id));
		this.fired = fired;
		const fresh = fired.filter(alert => !known.has(alert.id));
		if (announce && fresh.length) {
			this._onDidFire.fire(fresh);
		}
	}

	private async appendHistory(fired: readonly IFiredAlert[]): Promise<void> {
		await this.writeHistory([...[...fired].reverse(), ...this.fired].slice(0, MAX_FIRED));
		this._onDidFire.fire(fired);
	}

	/** Writes `fired`, newest first, as the history, oldest first. */
	private async writeHistory(fired: IFiredAlert[]): Promise<void> {
		this.fired = fired;
		const lines = [...fired].reverse().map(alert => JSON.stringify(alert) + '\n').join('');
		await this.fileService.writeFile(this.historyFile, VSBuffer.fromString(lines));
		this._onDidChange.fire();
	}

	private readStorage<T>(key: string, fallback: T): T {
		try {
			return JSON.parse(this.storageService.get(key, StorageScope.APPLICATION, '')) ?? fallback;
		} catch {
			return fallback;
		}
	}
}

registerSingleton(IAlertsService, AlertsService, InstantiationType.Delayed);
