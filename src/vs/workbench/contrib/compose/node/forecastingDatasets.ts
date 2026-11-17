/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The conversion of the datasets the user adds in Manage Competition Datasets, on the engine of the duckdb> terminal
// (@duckdb/node-api): the user's long table, a CSV, TSV or Parquet file, is checked, then written as the series.parquet
// and observations.parquet of PollisCompetitions.jl, with their columns and types (src/download.jl of the package).
// forecastingDatasetsMain.ts runs it in a utility process of its own.

import { DuckDBConnection, DuckDBInstance } from '@duckdb/node-api';
import * as fs from 'fs';
import { join } from '../../../../base/common/path.js';
import { FORECASTING_LONGEST_SERIES, ForecastingFileValue, IForecastingConversion, IForecastingConverted, IForecastingDatasets, IForecastingFile, IForecastingProblem } from '../common/forecastingDatasets.js';

/** A text as an SQL literal. */
function literal(text: string): string {
	return `'${text.replace(/'/g, `''`)}'`;
}

/** A column's name as an SQL identifier. */
function identifier(name: string): string {
	return `"${name.replace(/"/g, '""')}"`;
}

/**
 * The table function that reads `file`: Parquet by its extension, else CSV or TSV, its delimiter and types detected,
 * but for the column `text`, read as text, so that a value that is no number is found, not an error.
 */
function reader(file: string, text?: string): string {
	if (/\.parquet$/i.test(file)) {
		return `read_parquet(${literal(file)})`;
	}
	return text === undefined ? `read_csv(${literal(file)})` : `read_csv(${literal(file)}, types = {${literal(text)}: 'VARCHAR'})`;
}

export class ForecastingDatasets implements IForecastingDatasets {

	private connection: Promise<DuckDBConnection> | undefined;

	private connect(): Promise<DuckDBConnection> {
		this.connection ??= (async () => (await DuckDBInstance.create(':memory:')).connect())();
		return this.connection;
	}

	private async rows(sql: string): Promise<{ readonly [column: string]: ForecastingFileValue }[]> {
		const reader = await (await this.connect()).runAndReadAll(sql);
		return reader.getRowObjectsJson() as { readonly [column: string]: ForecastingFileValue }[];
	}

	/** The first number of the first row of `sql`: a count, which DuckDB gives as a BIGINT, as text. */
	private async count(sql: string): Promise<number> {
		const [row] = await this.rows(sql);
		return Number(Object.values(row ?? {})[0] ?? 0);
	}

	/** The names of the first three series `sql` gives, in its column `name`. */
	private async examples(sql: string): Promise<string[]> {
		return (await this.rows(`${sql} ORDER BY name LIMIT 3`)).map(row => String(row.name));
	}

	async columns(file: string): Promise<IForecastingFile> {
		const columns = (await this.rows(`DESCRIBE SELECT * FROM ${reader(file)}`)).map(row => ({ name: String(row.column_name), type: String(row.column_type) }));
		const rows = await this.count(`SELECT count(*) FROM ${reader(file)}`);
		const preview = await this.rows(`SELECT * FROM ${reader(file)} LIMIT 5`);
		return { columns, rows, preview };
	}

	async convert(conversion: IForecastingConversion): Promise<IForecastingConverted> {
		const connection = await this.connect();
		const { seriesColumn, timeColumn, valueColumn } = conversion;
		const horizon = Math.trunc(conversion.horizon);
		const period = Math.trunc(conversion.period);
		// The rows read first, the value as it is, then cast: a cast in the query that reads a CSV file is made by the reader,
		// which fails on a value that is no number instead of leaving it out
		await connection.run(`CREATE OR REPLACE TEMP TABLE source AS SELECT CAST(${identifier(seriesColumn)} AS VARCHAR) AS name, ${identifier(timeColumn)} AS time, ${identifier(valueColumn)} AS value FROM ${reader(conversion.file, valueColumn)}`);
		await connection.run('CREATE OR REPLACE TEMP TABLE raw AS SELECT name, time, TRY_CAST(value AS DOUBLE) AS value FROM source');
		await connection.run('DROP TABLE source');

		const problems: IForecastingProblem[] = [];
		const check = async (kind: IForecastingProblem['kind'], count: number, examples: () => Promise<string[]>) => {
			if (count) {
				problems.push({ kind, count, examples: await examples() });
			}
		};
		await check('empty', await this.count('SELECT count(*) = 0 FROM raw') ? 1 : 0, async () => []);
		await check('noSeries', await this.count('SELECT count(*) FROM raw WHERE name IS NULL'), async () => []);
		await check('noTime', await this.count('SELECT count(*) FROM raw WHERE time IS NULL'), () => this.examples('SELECT DISTINCT name FROM raw WHERE time IS NULL AND name IS NOT NULL'));
		await check('noValue', await this.count('SELECT count(*) FROM raw WHERE value IS NULL'), () => this.examples('SELECT DISTINCT name FROM raw WHERE value IS NULL AND name IS NOT NULL'));
		const repeated = 'SELECT DISTINCT name FROM raw WHERE name IS NOT NULL AND time IS NOT NULL GROUP BY name, time HAVING count(*) > 1';
		await check('repeatedTime', await this.count(`SELECT count(*) FROM (${repeated})`), () => this.examples(repeated));
		await connection.run('CREATE OR REPLACE TEMP TABLE lengths AS SELECT name, count(*) AS n FROM raw WHERE name IS NOT NULL GROUP BY name');
		await check('short', await this.count(`SELECT count(*) FROM lengths WHERE n <= ${horizon}`), () => this.examples(`SELECT name FROM lengths WHERE n <= ${horizon}`));
		await check('long', await this.count(`SELECT count(*) FROM lengths WHERE n > ${FORECASTING_LONGEST_SERIES}`), () => this.examples(`SELECT name FROM lengths WHERE n > ${FORECASTING_LONGEST_SERIES}`));
		if (problems.length) {
			return { problems, series: 0, observations: 0, lengthMin: 0, lengthMedian: 0, lengthMax: 0 };
		}

		// The series numbered from 1 in the order of their names, their times from 1 in the order of the time column
		fs.mkdirSync(conversion.target, { recursive: true });
		await connection.run(`CREATE OR REPLACE TEMP TABLE numbered AS SELECT CAST(dense_rank() OVER (ORDER BY name) AS INTEGER) AS series, name, CAST(row_number() OVER (PARTITION BY name ORDER BY time) AS SMALLINT) AS t, time, value, count(*) OVER (PARTITION BY name) AS n FROM raw`);
		await connection.run(`COPY (SELECT series, t, value, CASE WHEN t > n - ${horizon} THEN 'test' ELSE 'train' END AS split FROM numbered ORDER BY series, t) TO ${literal(join(conversion.target, 'observations.parquet'))} (FORMAT parquet)`);
		await connection.run(`COPY (SELECT series, ${literal(conversion.id)} AS competition, name, ${literal(conversion.frequency)} AS frequency, CAST(${period} AS SMALLINT) AS period, CAST(${horizon} AS SMALLINT) AS horizon, ${literal(conversion.domain)} AS domain, CAST(min(time) AS VARCHAR) AS start FROM numbered GROUP BY series, name ORDER BY series) TO ${literal(join(conversion.target, 'series.parquet'))} (FORMAT parquet)`);
		const [summary] = await this.rows('SELECT count(*) AS series, sum(n) AS observations, min(n) AS lengthMin, quantile_disc(n, 0.5) AS lengthMedian, max(n) AS lengthMax FROM lengths');
		return {
			problems,
			series: Number(summary.series),
			observations: Number(summary.observations),
			lengthMin: Number(summary.lengthMin),
			lengthMedian: Number(summary.lengthMedian),
			lengthMax: Number(summary.lengthMax),
		};
	}
}
