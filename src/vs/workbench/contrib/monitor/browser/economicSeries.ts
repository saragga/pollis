/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IRequestContext, IRequestOptions } from '../../../../base/parts/request/common/request.js';
import { localize } from '../../../../nls.js';
import { asJson, asText, isSuccess } from '../../../../platform/request/common/request.js';
import { parseCsv } from './csv.js';

/** Where an economic series is published: FRED (with the user's key), the ECB, the IMF or the World Bank. */
export type EconomicSource = 'fred' | 'ecb' | 'imf' | 'worldBank';

export const ECONOMIC_SOURCES: readonly EconomicSource[] = ['fred', 'ecb', 'imf', 'worldBank'];

/** A value of a series and the period it is for: 2026-09, 2026-Q2, 2026-M09, 2025, 2026-10-21. */
export interface IObservation {
	readonly period: string;
	readonly value: number;
}

/** A series and its latest observations, oldest first. */
export interface IEconomicSeries {
	readonly source: EconomicSource;
	/** The series as an alert keeps it; see `seriesExample`. */
	readonly id: string;
	readonly title: string;
	readonly frequency?: string;
	readonly units?: string;
	/** When the source last updated the series, as it gives it. */
	readonly updated?: string;
	readonly observations: readonly IObservation[];
}

export function sourceName(source: EconomicSource): string {
	switch (source) {
		case 'fred': return localize('economic.fred', "FRED");
		case 'ecb': return localize('economic.ecb', "ECB");
		case 'imf': return localize('economic.imf', "IMF");
		case 'worldBank': return localize('economic.worldBank', "World Bank");
	}
}

/** How a series of `source` is written: a FRED series ID, an ECB flow and key, an IMF dataflow and key, a country and a World Bank indicator. */
export function seriesExample(source: EconomicSource): string {
	switch (source) {
		case 'fred': return 'CPIAUCSL';
		case 'ecb': return 'EXR/D.USD.EUR.SP00.A';
		case 'imf': return 'IMF.STA,CPI/USA.CPI._T.YOY_PCH_PA_PT.M';
		case 'worldBank': return 'PRT/NY.GDP.PCAP.KD';
	}
}

/** The source's own page of a series, or undefined when it has none to link to. */
export function seriesPage(source: EconomicSource, id: string): string | undefined {
	switch (source) {
		case 'fred': return `https://fred.stlouisfed.org/series/${encodeURIComponent(id)}`;
		case 'ecb': {
			const [flow, key] = id.split('/');
			return key ? `https://data.ecb.europa.eu/data/datasets/${encodeURIComponent(flow)}/${encodeURIComponent(flow + '.' + key)}` : undefined;
		}
		case 'imf': return undefined;
		case 'worldBank': {
			const [country, indicator] = id.split('/');
			return indicator ? `https://data.worldbank.org/indicator/${encodeURIComponent(indicator)}?locations=${encodeURIComponent(country)}` : undefined;
		}
	}
}

/** The prefixes of the pages `seriesPage` links to. */
export const SERIES_PAGES: readonly string[] = ['https://fred.stlouisfed.org/', 'https://data.ecb.europa.eu/', 'https://data.worldbank.org/'];

const SDMX_FREQUENCIES: Record<string, string> = { D: 'daily', B: 'daily', W: 'weekly', M: 'monthly', Q: 'quarterly', S: 'semiannual', H: 'semiannual', A: 'annual' };

interface IFredSeries {
	readonly seriess?: readonly { readonly title?: string; readonly frequency?: string; readonly units?: string; readonly last_updated?: string }[];
}

interface IFredObservations {
	readonly observations?: readonly { readonly date?: string; readonly value?: string }[];
}

type IWorldBankAnswer = [
	{ readonly lastupdated?: string } | undefined,
	readonly { readonly indicator?: { readonly value?: string }; readonly country?: { readonly value?: string }; readonly date?: string; readonly value?: number | null }[] | null | undefined,
];

/**
 * The series `id` of `source` with its latest `count` observations, or undefined when the source does not know it or
 * cannot be reached; 'noKey' for FRED without the user's key.
 */
export async function fetchEconomicSeries(request: (options: IRequestOptions) => Promise<IRequestContext>, source: EconomicSource, id: string, count: number, fredKey: string | undefined): Promise<IEconomicSeries | 'noKey' | undefined> {
	const json = async <T>(url: string): Promise<T | undefined> => {
		const context = await request({ type: 'GET', url, callSite: 'pollis.alerts.economic' });
		return isSuccess(context) ? (await asJson<T>(context)) ?? undefined : undefined;
	};
	const csv = async (url: string, headers?: Record<string, string>): Promise<Record<string, string>[] | undefined> => {
		const context = await request({ type: 'GET', url, headers, callSite: 'pollis.alerts.economic' });
		if (!isSuccess(context)) {
			return undefined;
		}
		const [header, ...rows] = parseCsv((await asText(context)) ?? '');
		return header ? rows.filter(row => row.length === header.length).map(row => Object.fromEntries(header.map((name, index) => [name, row[index]]))) : undefined;
	};
	const observations = (rows: readonly { period?: string; value?: string | number | null }[]) => rows
		.map(row => ({ period: row.period ?? '', value: typeof row.value === 'number' ? row.value : row.value ? Number(row.value) : NaN }))
		.filter(observation => observation.period && Number.isFinite(observation.value))
		.sort((a, b) => a.period < b.period ? -1 : a.period > b.period ? 1 : 0);
	try {
		switch (source) {
			case 'fred': {
				if (!fredKey) {
					return 'noKey';
				}
				const series = encodeURIComponent(id.toUpperCase());
				const key = encodeURIComponent(fredKey);
				const about = (await json<IFredSeries>(`https://api.stlouisfed.org/fred/series?series_id=${series}&api_key=${key}&file_type=json`))?.seriess?.[0];
				if (!about) {
					return undefined;
				}
				// FRED writes a missing value as "."
				const found = await json<IFredObservations>(`https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${key}&file_type=json&sort_order=desc&limit=${count}`);
				return {
					source, id: id.toUpperCase(), title: about.title ?? id, frequency: about.frequency?.toLowerCase(), units: about.units, updated: about.last_updated,
					observations: observations((found?.observations ?? []).map(observation => ({ period: observation.date, value: observation.value === '.' ? undefined : observation.value }))),
				};
			}
			case 'ecb': {
				const [flow, key] = id.split('/');
				if (!key) {
					return undefined;
				}
				const rows = await csv(`https://data-api.ecb.europa.eu/service/data/${encodeURIComponent(flow)}/${encodeURIComponent(key)}?format=csvdata&lastNObservations=${count}`);
				const first = rows?.[0];
				if (!first) {
					return undefined;
				}
				return {
					source, id, title: first.TITLE || id, frequency: SDMX_FREQUENCIES[first.FREQ], units: first.UNIT,
					observations: observations(rows.map(row => ({ period: row.TIME_PERIOD, value: row.OBS_VALUE }))),
				};
			}
			case 'imf': {
				const [flow, key] = id.split('/');
				if (!key) {
					return undefined;
				}
				const rows = await csv(`https://api.imf.org/external/sdmx/2.1/data/${encodeURIComponent(flow)}/${encodeURIComponent(key)}?lastNObservations=${count}`, { Accept: 'application/vnd.sdmx.data+csv;version=1.0.0' });
				const first = rows?.[0];
				if (!first) {
					return undefined;
				}
				return {
					source, id, title: first.SERIES_NAME || id, frequency: SDMX_FREQUENCIES[first.FREQUENCY], units: first.UNIT || undefined, updated: first.UPDATE_DATE?.slice(0, 10),
					observations: observations(rows.map(row => ({ period: row.TIME_PERIOD, value: row.OBS_VALUE }))),
				};
			}
			case 'worldBank': {
				const [country, indicator] = id.split('/');
				if (!indicator) {
					return undefined;
				}
				const answer = await json<IWorldBankAnswer>(`https://api.worldbank.org/v2/country/${encodeURIComponent(country)}/indicator/${encodeURIComponent(indicator)}?format=json&mrnev=${count}`);
				const rows = answer?.[1];
				const first = rows?.[0];
				if (!first) {
					return undefined;
				}
				return {
					source, id: id.toUpperCase(), title: `${first.indicator?.value ?? indicator}, ${first.country?.value ?? country}`, frequency: 'annual', updated: answer?.[0]?.lastupdated,
					observations: observations(rows.map(row => ({ period: row.date, value: row.value }))),
				};
			}
		}
	} catch {
		return undefined;
	}
}
