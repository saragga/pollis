/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IntervalTimer, RunOnceScheduler } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { URI } from '../../../../base/common/uri.js';
import { IRequestContext, IRequestOptions } from '../../../../base/parts/request/common/request.js';
import { localize } from '../../../../nls.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { asJson, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IPathService } from '../../../services/path/common/pathService.js';

/**
 * What an alert watches for: the value above or below the threshold (once, until it is back on the other side), the
 * value crossing it from one check to the next, or the value moving by more than the threshold, in per cent, since
 * the previous close.
 */
export type AlertCondition = 'above' | 'below' | 'crossesAbove' | 'crossesBelow' | 'movesBy';

export type AlertSeverity = 'info' | 'warning' | 'error';

/** An alert as ~/.pollis/alerts/alerts.json keeps it, which the user may also edit by hand. */
export interface IAlert {
	readonly id: string;
	/** A Yahoo Finance symbol: ^GSPC, AAPL, BZ=F, EURUSD=X. */
	readonly symbol: string;
	/** The name Yahoo Finance gives the symbol, when the alert was added. */
	readonly name?: string;
	readonly condition: AlertCondition;
	readonly threshold: number;
	readonly severity: AlertSeverity;
	/** Whether the alert fires again once the value is back on the other side, else it is paused once it fires. */
	readonly repeat: boolean;
	readonly paused?: boolean;
	/** How often the value is looked up, in minutes; 1 when not given. */
	readonly minutes?: number;
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
	readonly value: number;
	/** The value of the look-up before, from which the value got past the threshold; absent on the first look-up. */
	readonly previousValue?: number;
	readonly currency?: string;
	/** For movesBy: the move since the previous close, in per cent. */
	readonly change?: number;
	/** When it fired, in milliseconds since 1970. */
	readonly time: number;
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

/** The span of a chart: a day, five days, a month or six months. */
export type ChartRange = '1d' | '5d' | '1mo' | '6mo';

/** The values of a symbol over a span, oldest first, for a chart. */
export interface IChart {
	/** Milliseconds since 1970. */
	readonly times: readonly number[];
	readonly values: readonly number[];
	readonly previousClose?: number;
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
	addAlert(alert: Omit<IAlert, 'id'>): Promise<void>;
	setPaused(alertId: string, paused: boolean): Promise<void>;
	removeAlert(alertId: string): Promise<void>;
	/** The quote of `symbol`, or undefined when Yahoo Finance does not know it or cannot be reached. */
	getQuote(symbol: string): Promise<IQuote | undefined>;
	/** The values of `symbol` over `range`, or undefined when Yahoo Finance does not know it or cannot be reached. */
	getChart(symbol: string, range: ChartRange): Promise<IChart | undefined>;
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

/** The message of a fired alert: what crossed what. */
export function describeFiredAlert(fired: IFiredAlert): string {
	const name = fired.name || fired.symbol;
	const value = formatValue(fired.value, fired.currency);
	const threshold = formatValue(fired.threshold);
	switch (fired.condition) {
		case 'above': return localize('alerts.firedAbove', "{0} is above {1}: {2}", name, threshold, value);
		case 'below': return localize('alerts.firedBelow', "{0} is below {1}: {2}", name, threshold, value);
		case 'crossesAbove': return localize('alerts.firedCrossesAbove', "{0} crossed above {1}: {2}", name, threshold, value);
		case 'crossesBelow': return localize('alerts.firedCrossesBelow', "{0} crossed below {1}: {2}", name, threshold, value);
		case 'movesBy': return localize('alerts.firedMovesBy', "{0} moved {1}% since the previous close: {2}", name, formatChange(fired.change ?? 0), value);
	}
}

/** The condition of an alert in words: "above 8000", "moves by 2%". */
export function describeCondition(alert: Pick<IAlert, 'condition' | 'threshold'>): string {
	const threshold = formatValue(alert.threshold);
	switch (alert.condition) {
		case 'above': return localize('alerts.conditionAbove', "above {0}", threshold);
		case 'below': return localize('alerts.conditionBelow', "below {0}", threshold);
		case 'crossesAbove': return localize('alerts.conditionCrossesAbove', "crosses above {0}", threshold);
		case 'crossesBelow': return localize('alerts.conditionCrossesBelow', "crosses below {0}", threshold);
		case 'movesBy': return localize('alerts.conditionMovesBy', "moves by {0}% since the previous close", threshold);
	}
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
	readonly indicators?: { readonly quote?: readonly { readonly close?: readonly (number | null)[] }[] };
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
	};
}

interface IYahooChart {
	readonly chart?: { readonly result?: readonly IYahooChartResult[] };
}

// The interval of the values of each span of a chart
const CHART_INTERVALS: Record<ChartRange, string> = { '1d': '5m', '5d': '15m', '1mo': '60m', '6mo': '1d' };

/**
 * Pollis: the alerts the user sets on market data, looked up at Yahoo Finance while Pollis is open. One window looks
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
	private readonly owner = generateUuid();
	private alerts: IAlert[] = [];
	private fired: IFiredAlert[] = [];
	private read: Set<string>;
	// When each symbol is next looked up, while its market is closed
	private readonly quietUntil = new Map<string, number>();
	private checking = false;
	private loaded: Promise<void>;

	constructor(
		@IRequestService private readonly requestService: IRequestService,
		@IStorageService private readonly storageService: IStorageService,
		@IFileService private readonly fileService: IFileService,
		@IPathService pathService: IPathService,
		@INotificationService private readonly notificationService: INotificationService,
	) {
		super();
		const folder = joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'alerts');
		this.alertsFile = joinPath(folder, 'alerts.json');
		this.historyFile = joinPath(folder, 'history.jsonl');
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

	async removeAlert(alertId: string): Promise<void> {
		await this.loaded;
		this.alerts = this.alerts.filter(alert => alert.id !== alertId);
		this.updateState(states => { delete states[alertId]; });
		await this.writeAlerts();
	}

	async getQuote(symbol: string): Promise<IQuote | undefined> {
		const meta = (await this.fetchChart(symbol, '1d', '1d'))?.meta;
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
		const result = await this.fetchChart(symbol, CHART_INTERVALS[range], range);
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

	/** The Yahoo Finance chart of `symbol`, or undefined when it does not know it or cannot be reached. */
	private async fetchChart(symbol: string, interval: string, range: string): Promise<IYahooChartResult | undefined> {
		try {
			const context = await this.request({
				type: 'GET',
				url: `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`,
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
			const due = this.alerts.filter(alert => !alert.paused && now - (states[alert.id]?.checked ?? 0) >= (alert.minutes ?? 1) * 60_000 - 5_000
				&& now >= (this.quietUntil.get(alert.symbol) ?? 0));
			const symbols = [...new Set(due.map(alert => alert.symbol))];
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
			const fired: IFiredAlert[] = [];
			const once: string[] = [];
			this.updateState(states => {
				for (const alert of due) {
					const quote = quotes.get(alert.symbol);
					const previous = states[alert.id];
					if (!quote) {
						states[alert.id] = { ...previous, armed: previous?.armed ?? true, checked: now, error: true };
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
		}
	}

	private notify(fired: IFiredAlert): void {
		const severity = fired.severity === 'error' ? Severity.Error : fired.severity === 'warning' ? Severity.Warning : Severity.Info;
		this.notificationService.prompt(severity, describeFiredAlert(fired), [
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
		this.fired = [...[...fired].reverse(), ...this.fired].slice(0, MAX_FIRED);
		const lines = [...this.fired].reverse().map(alert => JSON.stringify(alert)).join('\n') + '\n';
		await this.fileService.writeFile(this.historyFile, VSBuffer.fromString(lines));
		this._onDidChange.fire();
		this._onDidFire.fire(fired);
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
