/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// What the duckdb> terminal (duckdbShellMain.ts) and the DuckDB SQL (Pollis) notebook kernel (duckdbNotebookMain.ts)
// share: a connection with the databases of Pollis attached read-only and fts loaded, the reading of a result, and
// the log of queries the History view of the Databases view lists.

import { DuckDBConnection, DuckDBResult, DuckDBValue, StatementType } from '@duckdb/node-api';
import * as fs from 'fs';
import * as os from 'os';
import { join } from '../../../../base/common/path.js';
import { DUCKDB_QUERY_LOG, IDuckDBQueryLogLine } from '../common/duckdbSql.js';

export const POLLIS_HOME = join(os.homedir(), '.pollis');
/** The fts extension, which the Julia extension of Pollis unpacks here at install. */
const FTS = join(POLLIS_HOME, 'duckdb', 'fts.duckdb_extension');
/** The databases of Pollis, built in and of its activity, attached read-only under their own names; Comparisons is the copy Pollis makes of the file it writes. */
const BUILTINS = [join(POLLIS_HOME, 'databases', 'PollisDatasets.duckdb'), join(POLLIS_HOME, 'databases', 'PollisRSS.duckdb'), join(POLLIS_HOME, 'databases', 'PollisJournals.duckdb'), join(POLLIS_HOME, 'databases', 'PollisReferences.duckdb'), join(POLLIS_HOME, 'databases', 'PollisBenchmarks.duckdb'), join(POLLIS_HOME, 'documents', 'PollisDocuments.duckdb'), join(POLLIS_HOME, 'databases', 'Comparisons.duckdb')];
/** The queries the History view lists, with how each went; trimmed to LOG_SIZE when it has grown past twice as many. */
const LOG = join(POLLIS_HOME, 'duckdb', DUCKDB_QUERY_LOG);
const LOG_SIZE = 1000;

/** The options of a DuckDB instance of Pollis: extensions are never downloaded, those Pollis brings are all. */
export const DUCKDB_OPTIONS = { autoinstall_known_extensions: 'false', autoload_known_extensions: 'false' };

/** Statements whose result is only a count of rows, or nothing: no table is shown for them. */
export const QUIET = new Set<StatementType>([StatementType.CREATE, StatementType.DROP, StatementType.ALTER, StatementType.ATTACH, StatementType.DETACH, StatementType.LOAD, StatementType.SET, StatementType.VARIABLE_SET, StatementType.TRANSACTION, StatementType.CREATE_FUNC, StatementType.VACUUM, StatementType.ANALYZE, StatementType.EXPORT]);
/** Statements whose result is the number of rows they changed. */
export const CHANGES = new Set<StatementType>([StatementType.INSERT, StatementType.UPDATE, StatementType.DELETE, StatementType.COPY, StatementType.MERGE_INTO]);

export function sqlString(text: string): string {
	return `'${text.replace(/'/g, `''`)}'`;
}

/** Attach the databases of Pollis and load fts; returns what went wrong, if anything. */
export async function preparePollisConnection(connection: DuckDBConnection): Promise<string[]> {
	const problems: string[] = [];
	for (const file of BUILTINS) {
		if (fs.existsSync(file)) {
			try {
				await connection.run(`ATTACH IF NOT EXISTS ${sqlString(file)} (READ_ONLY)`);
			} catch (err) {
				problems.push(String((err as Error).message));
			}
		}
	}
	if (fs.existsSync(FTS)) {
		try {
			await connection.run(`LOAD ${sqlString(FTS)}`);
		} catch (err) {
			problems.push(`fts could not be loaded: ${(err as Error).message}`);
		}
	}
	return problems;
}

/** A value as one line of text: NULL for a missing value. */
export function cellText(value: DuckDBValue): string {
	return value === null ? 'NULL' : String(value).replace(/\s/g, ' ');
}

/** The rows of a result to show: all of them when there are no more than `shown`, else the first and the last half. */
export interface IShownRows {
	readonly names: string[];
	readonly types: string[];
	readonly first: string[][];
	/** Empty when every row is in `first`. */
	readonly last: string[][];
	readonly count: number;
}

export async function readShownRows(result: DuckDBResult, shown: number): Promise<IShownRows> {
	const first: string[][] = [];
	let last: string[][] = [];
	let count = 0;
	for (let chunk = await result.fetchChunk(); chunk && chunk.rowCount; chunk = await result.fetchChunk()) {
		for (const values of chunk.getRows()) {
			count++;
			if (first.length < shown / 2) {
				first.push(values.map(cellText));
			} else {
				last.push(values.map(cellText));
				if (last.length > shown / 2) {
					last.shift();
				}
			}
		}
	}
	// With no more than `shown` rows, all are shown without a gap
	if (count <= shown) {
		first.push(...last);
		last = [];
	}
	return { names: result.columnNames(), types: result.columnTypes().map(type => type.toString()), first, last, count };
}

/** Keeps the last LOG_SIZE queries of the log, once it holds twice as many. */
export function trimQueryLog(): void {
	try {
		const lines = fs.readFileSync(LOG, 'utf8').split('\n').filter(Boolean);
		if (lines.length > 2 * LOG_SIZE) {
			fs.writeFileSync(LOG, lines.slice(-LOG_SIZE).join('\n') + '\n');
		}
	} catch {
		// No log yet
	}
}

/** Adds a query to the log, for the History view. */
export function logQuery(line: IDuckDBQueryLogLine): void {
	try {
		fs.mkdirSync(join(POLLIS_HOME, 'duckdb'), { recursive: true });
		fs.appendFileSync(LOG, JSON.stringify(line) + '\n');
	} catch {
		// The log is a convenience.
	}
}
