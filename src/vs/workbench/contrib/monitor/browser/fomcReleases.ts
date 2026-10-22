/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { safeIntl } from '../../../../base/common/date.js';
import { localize } from '../../../../nls.js';

// The FOMC's releases as events: the Federal Reserve's Monetary Policy Press Releases feed, and the instruments whose
// moves around them measure the surprise. Federal funds futures (Kuttner 2001) for the target rate, the next meetings'
// federal funds futures and SOFR futures for the path (Gurkaynak, Sack and Swanson 2005), and longer yields, TIPS and
// stocks for the Fed information effect (Nakamura and Steinsson 2018).

/** The Federal Reserve's Monetary Policy Press Releases feed. */
export const FOMC_FEED = 'https://www.federalreserve.gov/feeds/press_monetary.xml';

/** What an FOMC release is: its statement, the Summary of Economic Projections, its minutes, or another announcement. */
export type FomcRelease = 'statement' | 'projections' | 'minutes' | 'other';

export const FOMC_RELEASES: readonly FomcRelease[] = ['statement', 'projections', 'minutes', 'other'];

/** The release a feed item's title is. */
export function fomcRelease(title: string): FomcRelease {
	if (/FOMC statement/i.test(title)) {
		return 'statement';
	}
	if (/economic projections/i.test(title)) {
		return 'projections';
	}
	if (/^Minutes of the Federal Open Market Committee/i.test(title)) {
		return 'minutes';
	}
	return 'other';
}

export function describeRelease(release: FomcRelease): string {
	switch (release) {
		case 'statement': return localize('fomc.statement', "Statement");
		case 'projections': return localize('fomc.projections', "Summary of Economic Projections");
		case 'minutes': return localize('fomc.minutes', "Minutes");
		case 'other': return localize('fomc.other', "Other");
	}
}

/** What a move is measured in: basis points of a rate or a yield, or per cent of a price. */
export type InstrumentUnit = 'bp' | '%';

/** What an instrument's move tells: the surprise in the target rate, in its path, or the Fed's information about the economy. */
export type InstrumentHorizon = 'target' | 'path' | 'information';

export interface IFomcInstrument {
	readonly code: string;
	readonly horizon: InstrumentHorizon;
	readonly unit: InstrumentUnit;
}

export const FOMC_INSTRUMENTS: readonly IFomcInstrument[] = [
	{ code: 'FF1', horizon: 'target', unit: 'bp' },
	{ code: 'FF2', horizon: 'path', unit: 'bp' },
	{ code: 'FF3', horizon: 'path', unit: 'bp' },
	{ code: 'FF4', horizon: 'path', unit: 'bp' },
	{ code: 'SR1', horizon: 'path', unit: 'bp' },
	{ code: 'SFR1', horizon: 'path', unit: 'bp' },
	{ code: 'SFR2', horizon: 'path', unit: 'bp' },
	{ code: 'SFR3', horizon: 'path', unit: 'bp' },
	{ code: 'SFR4', horizon: 'path', unit: 'bp' },
	{ code: 'SFR5', horizon: 'path', unit: 'bp' },
	{ code: 'ZT', horizon: 'path', unit: '%' },
	{ code: '^FVX', horizon: 'information', unit: 'bp' },
	{ code: '^TNX', horizon: 'information', unit: 'bp' },
	{ code: 'TIP', horizon: 'information', unit: '%' },
	{ code: '^GSPC', horizon: 'information', unit: '%' },
	{ code: 'ES', horizon: 'information', unit: '%' },
];

/** The instruments a study of FOMC releases has unless the user says otherwise. */
export const DEFAULT_FOMC_INSTRUMENTS: readonly string[] = ['FF1', 'FF2', 'FF3', 'FF4', 'SFR1', 'SFR2', 'SFR3', 'SFR4', 'SFR5', 'ZT', '^FVX', '^TNX', 'TIP', '^GSPC'];

/** The tight window of Gurkaynak, Sack and Swanson (2005): ten minutes before the release to twenty after. */
export const FOMC_PERIOD = { name: '10 Min Before, 20 After', before: 10, after: 20, nextOpen: false };

export function describeInstrument(code: string): string {
	switch (code) {
		case 'FF1': return localize('fomc.ff1', "Fed Funds Futures, Current Month (FF1, scaled)");
		case 'FF2': return localize('fomc.ff2', "Fed Funds Futures, Next Month (FF2)");
		case 'FF3': return localize('fomc.ff3', "Fed Funds Futures, Two Months Out (FF3)");
		case 'FF4': return localize('fomc.ff4', "Fed Funds Futures, Three Months Out (FF4)");
		case 'SR1': return localize('fomc.sr1', "One-Month SOFR Futures, Current Month (SR1)");
		case 'SFR1': return localize('fomc.sfr1', "Three-Month SOFR Futures, First Quarter (SFR1)");
		case 'SFR2': return localize('fomc.sfr2', "Three-Month SOFR Futures, Second Quarter (SFR2)");
		case 'SFR3': return localize('fomc.sfr3', "Three-Month SOFR Futures, Third Quarter (SFR3)");
		case 'SFR4': return localize('fomc.sfr4', "Three-Month SOFR Futures, Fourth Quarter (SFR4)");
		case 'SFR5': return localize('fomc.sfr5', "Three-Month SOFR Futures, Fifth Quarter (SFR5)");
		case 'ZT': return localize('fomc.zt', "2-Year Treasury Note Futures (ZT), Price");
		case '^FVX': return localize('fomc.fvx', "5-Year Treasury Yield (^FVX)");
		case '^TNX': return localize('fomc.tnx', "10-Year Treasury Yield (^TNX)");
		case 'TIP': return localize('fomc.tip', "TIPS (iShares TIP ETF)");
		case '^GSPC': return localize('fomc.gspc', "S&P 500 (^GSPC)");
		case 'ES': return localize('fomc.es', "E-mini S&P 500 Futures (ES)");
		default: return code;
	}
}

const MONTH_CODES = 'FGHJKMNQUVXZ';
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
// In the last week of the month, the current month's federal funds future is too thin, and its scale too large: the next month's stands in for it
const LAST_DAYS = 7;
const newYorkDate = safeIntl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric' });

/** The year, month (1 to 12) and day of `time` in New York. */
function newYorkDay(time: number): { readonly year: number; readonly month: number; readonly day: number } {
	const parts = newYorkDate.value.formatToParts(time);
	const part = (type: string) => Number(parts.find(part => part.type === type)?.value);
	return { year: part('year'), month: part('month'), day: part('day') };
}

function daysInMonth(year: number, month: number): number {
	return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** A futures contract's code for the month `ahead` months after the given one: V26 for October 2026. */
function contractMonth(year: number, month: number, ahead: number): string {
	const index = (month - 1) + ahead;
	const y = year + Math.floor(index / 12);
	return `${MONTH_CODES[index % 12]}${String(y % 100).padStart(2, '0')}`;
}

/** Whether the release at `time` is in the last week of its month, where FF2 stands in for FF1. */
function lateInMonth(time: number): boolean {
	const { year, month, day } = newYorkDay(time);
	return daysInMonth(year, month) - day < LAST_DAYS;
}

/**
 * The Yahoo Finance symbol of an instrument at a release at `time`: the contract months follow from the release's
 * month, so that the same instrument is the same horizon at every release.
 */
export function instrumentSymbol(code: string, time: number): string {
	const { year, month } = newYorkDay(time);
	const federalFunds = /^FF(?<ahead>[1-4])$/.exec(code)?.groups;
	if (federalFunds) {
		const ahead = Number(federalFunds.ahead) - 1 + (code === 'FF1' && lateInMonth(time) ? 1 : 0);
		return `ZQ${contractMonth(year, month, ahead)}.CBT`;
	}
	if (code === 'SR1') {
		return `SR1${contractMonth(year, month, 0)}.CME`;
	}
	const sofr = /^SFR(?<quarter>[1-5])$/.exec(code)?.groups;
	if (sofr) {
		// The first is the quarterly contract whose reference quarter starts after the release, at its month's third Wednesday
		let ahead = (3 - month % 3) % 3;
		const quarterYear = year + Math.floor((month - 1 + ahead) / 12);
		const quarterMonth = (month - 1 + ahead) % 12 + 1;
		if (time >= thirdWednesday(quarterYear, quarterMonth)) {
			ahead += 3;
		}
		return `SR3${contractMonth(year, month, ahead + 3 * (Number(sofr.quarter) - 1))}.CME`;
	}
	switch (code) {
		case 'ZT': return 'ZT=F';
		case 'ES': return 'ES=F';
		// ^FVX, ^TNX, TIP and ^GSPC are their own symbols
		default: return code;
	}
}

/** The third Wednesday of a month, at the start of its day in UTC: when a three-month SOFR contract's quarter starts. */
function thirdWednesday(year: number, month: number): number {
	const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
	return Date.UTC(year, month - 1, 1 + (3 - first + 7) % 7 + 14);
}

/**
 * What an instrument's move is multiplied by: for FF1, D / (D - d), with D the days of the release's month and d its
 * day, as the contract settles on the month's average rate (Kuttner 2001); 1 otherwise, and for FF1 in the last week.
 */
export function instrumentScale(code: string, time: number): number {
	if (code !== 'FF1' || lateInMonth(time)) {
		return 1;
	}
	const { year, month, day } = newYorkDay(time);
	const days = daysInMonth(year, month);
	return days / (days - day);
}

/**
 * An instrument's move from `start` to `price`: in basis points of the implied rate (100 less the price) for a
 * futures contract on a rate, of the yield for a yield, and in per cent (log) for a price.
 */
export function instrumentMove(code: string, start: number, price: number, scale: number): number {
	if (/^(?:FF\d|SR1|SFR\d)$/.test(code)) {
		return -(price - start) * 100 * scale;
	}
	if (code === '^FVX' || code === '^TNX') {
		return (price - start) * 100;
	}
	return Math.log(price / start) * 100;
}

export function instrumentUnit(code: string): InstrumentUnit {
	return FOMC_INSTRUMENTS.find(instrument => instrument.code === code)?.unit ?? '%';
}

/** How long Yahoo Finance keeps five-minute bars: 60 days, a little less so that the first request is not refused. */
export const FIVE_MINUTE_KEPT_MILLISECONDS = 59 * DAY;
