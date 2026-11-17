/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

// The datasets the user adds in Compose > Forecasting Competitions > Manage Competition Datasets, from a file of their
// own: a long table, a row per observation, with a column naming the series, one giving the time and one the value. A
// DuckDB process (../node/forecastingDatasetsMain.ts) reads its columns, then converts it into the files of
// PollisCompetitions.jl, series.parquet and observations.parquet, the last `horizon` values of each series held back
// as its test values, so that a dataset of the user's is scored as a competition is.

/** A value of a row of the file, as JSON. */
export type ForecastingFileValue = string | number | boolean | null;

/** The columns of a file and its first rows. */
export interface IForecastingFile {
	readonly columns: readonly { readonly name: string; readonly type: string }[];
	readonly rows: number;
	readonly preview: readonly { readonly [column: string]: ForecastingFileValue }[];
}

/** What a file is converted with: its columns, and the facts of every series in it. */
export interface IForecastingConversion {
	/** The file, a CSV, TSV or Parquet file, as a path of this computer. */
	readonly file: string;
	readonly seriesColumn: string;
	readonly timeColumn: string;
	readonly valueColumn: string;
	/** The id of the dataset, written as the competition of each series. */
	readonly id: string;
	readonly frequency: string;
	readonly period: number;
	readonly horizon: number;
	readonly domain: string;
	/** The folder the two files are written into, made when the conversion has no problem, as a path of this computer. */
	readonly target: string;
}

/**
 * A problem of a file, which stops its conversion: rows with no series, no time or no number for the value; a time
 * given twice in a series; series with no value before their test values, or too long; or no rows at all.
 */
export type ForecastingProblemKind = 'empty' | 'noSeries' | 'noTime' | 'noValue' | 'repeatedTime' | 'short' | 'long';

/** A problem of a file: how many rows or series have it, and the names of a few of those series. */
export interface IForecastingProblem {
	readonly kind: ForecastingProblemKind;
	readonly count: number;
	readonly examples: readonly string[];
}

/** The most values a series may have: its times are numbered as SMALLINT, as in the files of PollisCompetitions.jl. */
export const FORECASTING_LONGEST_SERIES = 32767;

/** What the conversion found: its problems, when it wrote nothing, or the numbers of series and values it wrote. */
export interface IForecastingConverted {
	readonly problems: readonly IForecastingProblem[];
	readonly series: number;
	readonly observations: number;
	readonly lengthMin: number;
	readonly lengthMedian: number;
	readonly lengthMax: number;
}

export interface IForecastingDatasets {
	/** The columns of `file`, its number of rows and its first five rows. */
	columns(file: string): Promise<IForecastingFile>;
	/** Converts a file, after checking it: nothing is written when a problem is found. */
	convert(conversion: IForecastingConversion): Promise<IForecastingConverted>;
}

export const IForecastingDatasetsService = createDecorator<IForecastingDatasetsService>('forecastingDatasetsService');

/** The conversion of the user's datasets, in a process of its own started when first asked; one for the window. */
export interface IForecastingDatasetsService extends IForecastingDatasets {
	readonly _serviceBrand: undefined;
}
