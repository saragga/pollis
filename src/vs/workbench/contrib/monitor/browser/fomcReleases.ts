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

/**
 * What an FOMC release is: its statement, the Summary of Economic Projections, its minutes, the minutes of the Board's
 * discount rate meetings, or another announcement.
 */
export type FomcRelease = 'statement' | 'projections' | 'minutes' | 'discountRate' | 'other';

export const FOMC_RELEASES: readonly FomcRelease[] = ['statement', 'projections', 'minutes', 'discountRate', 'other'];

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
	if (/discount rate meeting/i.test(title)) {
		return 'discountRate';
	}
	return 'other';
}

export function describeRelease(release: FomcRelease): string {
	switch (release) {
		case 'statement': return localize('fomc.statement', "Statement");
		case 'projections': return localize('fomc.projections', "Summary of Economic Projections");
		case 'minutes': return localize('fomc.minutes', "Minutes");
		case 'discountRate': return localize('fomc.discountRate', "Discount Rate Minutes");
		case 'other': return localize('fomc.other', "Other");
	}
}

/** The Federal Reserve's calendar: its meetings, press conferences, testimony and speeches, at their times in New York. */
export const FED_CALENDAR = 'https://www.federalreserve.gov/json/calendar.json';

/**
 * What an event of a study of the FOMC is: its statement with the Summary of Economic Projections or without it, at a
 * scheduled meeting; an announcement after an unscheduled one; or the Chair's press conference after a meeting, testimony
 * before Congress, or a speech or other public remarks.
 */
export type FomcEvent = 'withProjections' | 'withoutProjections' | 'unscheduled' | 'pressConference' | 'testimony' | 'speech';

export const FOMC_EVENTS: readonly FomcEvent[] = ['withProjections', 'withoutProjections', 'unscheduled', 'pressConference', 'testimony', 'speech'];

export function describeFomcEvent(kind: FomcEvent): string {
	switch (kind) {
		case 'withProjections': return localize('fomc.withProjections', "FOMC Statement with SEP");
		case 'withoutProjections': return localize('fomc.withoutProjections', "FOMC Statement without SEP");
		case 'unscheduled': return localize('fomc.unscheduled', "Unscheduled FOMC Announcement");
		case 'pressConference': return localize('fomc.pressConference', "Fed Chair FOMC Press Conference");
		case 'testimony': return localize('fomc.testimony', "Fed Chair Congressional Testimony");
		case 'speech': return localize('fomc.speech', "Fed Chair Speeches and Public Remarks");
	}
}

/**
 * The events a study made before them takes: its statement (the Summary of Economic Projections or not, or after an
 * unscheduled meeting) and its projections (with the statement). Its minutes and the feed's other releases are not among them.
 */
export function legacyFomcEvents(releases: readonly string[]): FomcEvent[] {
	return FOMC_EVENTS.filter(kind => releases.includes(kind)
		|| releases.includes('statement') && (kind === 'withProjections' || kind === 'withoutProjections' || kind === 'unscheduled')
		|| releases.includes('projections') && kind === 'withProjections');
}

/** An entry of the Federal Reserve's calendar, as calendar.json gives it. */
export interface IFedCalendarEntry {
	readonly title?: string;
	readonly description?: string;
	readonly location?: string;
	/** "10:00 a.m.", in New York. */
	readonly time?: string;
	/** "2026-07". */
	readonly month?: string;
	/** "14". */
	readonly days?: string;
	/** FOMC, Testimony, Speeches, Stat, Beige, ... */
	readonly type?: string;
	/** Where it is broadcast: the Federal Reserve's YouTube channel, a committee's page. */
	readonly live?: string;
	readonly link?: string;
}

/** An event of the Federal Reserve's calendar that a study of the FOMC takes, or a scheduled meeting. */
export interface IFedCalendarEvent {
	readonly kind: 'meeting' | 'pressConference' | 'testimony' | 'speech';
	/** In milliseconds since 1970. */
	readonly time: number;
	readonly title: string;
	readonly url: string;
	/** Where it was broadcast, to watch it. */
	readonly video?: string;
}

const FED_CALENDAR_PAGE = 'https://www.federalreserve.gov/newsevents/calendar.htm';
const FOMC_CALENDAR_PAGE = 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm';

/**
 * The meetings and press conferences of the Federal Reserve's calendar, and the Chair's testimony and speeches: their
 * titles say who speaks, "Testimony - Chairman Kevin Warsh", "Discussion - Chair Jerome H. Powell", unlike a Vice
 * Chair's or a Governor's.
 */
export function parseFedCalendar(entries: readonly IFedCalendarEntry[], hoursBehind: (time: number) => number): IFedCalendarEvent[] {
	const decode = (text: string) => text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]*>/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
	const events: IFedCalendarEvent[] = [];
	for (const entry of entries) {
		const title = decode(entry.title ?? '');
		const chair = /-\s*Chair(?:man|woman)?\s/i.test(title);
		const kind = entry.type === 'FOMC' && /^FOMC Meeting$/i.test(title) ? 'meeting'
			: entry.type === 'FOMC' && /^FOMC Press Conference$/i.test(title) ? 'pressConference'
				: entry.type === 'Testimony' && chair ? 'testimony'
					: entry.type === 'Speeches' && chair ? 'speech'
						: undefined;
		const month = /^(?<year>\d{4})-(?<month>\d{2})$/.exec(entry.month ?? '')?.groups;
		// A meeting's day is its last, when its statement comes out
		const day = /(?<day>\d{1,2})\s*$/.exec(entry.days ?? '')?.groups?.day;
		const clock = /^(?<hour>\d{1,2}):(?<minute>\d{2})\s*(?<half>[ap])\.?m\.?$/i.exec((entry.time ?? '').trim())?.groups;
		if (!kind || !month || !day || !clock) {
			continue;
		}
		const hour = Number(clock.hour) % 12 + (clock.half.toLowerCase() === 'p' ? 12 : 0);
		const wall = Date.UTC(Number(month.year), Number(month.month) - 1, Number(day), hour, Number(clock.minute));
		const time = wall + hoursBehind(wall + 5 * 60 * MINUTE) * 60 * MINUTE;
		const description = decode(entry.description ?? '');
		events.push({
			kind,
			time,
			title: kind === 'testimony' || kind === 'speech' ? [title, description].filter(text => text).join(': ') : title,
			// A press conference's link is its broadcast; the FOMC's calendar links its page, with the video and the transcript
			url: kind === 'pressConference' ? FOMC_CALENDAR_PAGE : entry.link || FED_CALENDAR_PAGE,
			video: entry.live || (kind === 'pressConference' ? entry.link : undefined) || undefined,
		});
	}
	return events;
}

/** Whether a statement at `time` is on the day of a scheduled meeting of the calendar's. */
export function isScheduledMeeting(time: number, calendar: readonly IFedCalendarEvent[]): boolean {
	const { year, month, day } = newYorkDay(time);
	return calendar.some(event => {
		if (event.kind !== 'meeting') {
			return false;
		}
		const meeting = newYorkDay(event.time);
		return meeting.year === year && meeting.month === month && meeting.day === day;
	});
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
