/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { DuckDBInstance } from '@duckdb/node-api';
import * as fs from 'fs';
import { tmpdir } from 'os';
import { join } from '../../../../../base/common/path.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { getRandomTestPath } from '../../../../../base/test/node/testUtils.js';
import { IForecastingConversion } from '../../common/forecastingDatasets.js';
import { ForecastingDatasets } from '../../node/forecastingDatasets.js';

/** Two series, b given before a and a out of the order of its times. */
const TABLE = `store,date,sales
b,2020-01-01,1
b,2020-02-01,2
b,2020-03-01,3
a,2020-03-01,30
a,2020-01-01,10
a,2020-02-01,20
a,2020-04-01,40
`;

/** A value that is no number, a time given twice in b, and series of 2 and 1 values for a horizon of 2. */
const BROKEN = `store,date,sales
a,2020-01-01,10
a,2020-02-01,x
b,2020-01-01,1
b,2020-01-01,2
c,2020-01-01,5
`;

suite('Forecasting datasets', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	let folder: string;

	setup(async () => {
		folder = getRandomTestPath(tmpdir(), 'vsctests', 'forecastingDatasets');
		await fs.promises.mkdir(folder, { recursive: true });
	});

	teardown(() => fs.promises.rm(folder, { recursive: true, force: true }));

	function conversion(file: string, horizon: number): IForecastingConversion {
		return { file, seriesColumn: 'store', timeColumn: 'date', valueColumn: 'sales', id: 'shops', frequency: 'monthly', period: 12, horizon, domain: 'retail', target: join(folder, 'shops') };
	}

	async function rows(sql: string) {
		const connection = await (await DuckDBInstance.create(':memory:')).connect();
		return (await connection.runAndReadAll(sql)).getRowObjectsJson();
	}

	test('a long table is written as series.parquet and observations.parquet, the last horizon values of each series as its test values', async () => {
		const file = join(folder, 'shops.csv');
		await fs.promises.writeFile(file, TABLE);
		const converted = await new ForecastingDatasets().convert(conversion(file, 1));
		const series = await rows(`SELECT * FROM read_parquet('${join(folder, 'shops', 'series.parquet')}') ORDER BY series`);
		const observations = await rows(`SELECT series, t, value, split FROM read_parquet('${join(folder, 'shops', 'observations.parquet')}') ORDER BY series, t`);
		assert.deepStrictEqual({ converted, series, observations }, {
			converted: { problems: [], series: 2, observations: 7, lengthMin: 3, lengthMedian: 3, lengthMax: 4 },
			series: [
				{ series: 1, competition: 'shops', name: 'a', frequency: 'monthly', period: 12, horizon: 1, domain: 'retail', start: '2020-01-01' },
				{ series: 2, competition: 'shops', name: 'b', frequency: 'monthly', period: 12, horizon: 1, domain: 'retail', start: '2020-01-01' },
			],
			observations: [
				{ series: 1, t: 1, value: 10, split: 'train' },
				{ series: 1, t: 2, value: 20, split: 'train' },
				{ series: 1, t: 3, value: 30, split: 'train' },
				{ series: 1, t: 4, value: 40, split: 'test' },
				{ series: 2, t: 1, value: 1, split: 'train' },
				{ series: 2, t: 2, value: 2, split: 'train' },
				{ series: 2, t: 3, value: 3, split: 'test' },
			],
		});
	});

	test('a value that is no number, a time given twice and a series no longer than the horizon are problems, and nothing is written', async () => {
		const file = join(folder, 'broken.csv');
		await fs.promises.writeFile(file, BROKEN);
		const converted = await new ForecastingDatasets().convert(conversion(file, 2));
		assert.deepStrictEqual({ problems: converted.problems, written: fs.existsSync(join(folder, 'shops')) }, {
			problems: [
				{ kind: 'noValue', count: 1, examples: ['a'] },
				{ kind: 'repeatedTime', count: 1, examples: ['b'] },
				{ kind: 'short', count: 3, examples: ['a', 'b', 'c'] },
			],
			written: false,
		});
	});
});
