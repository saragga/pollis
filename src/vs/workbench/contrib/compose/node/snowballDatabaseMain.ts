/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The database of the Snowball Search Map, in a utility process of its own (see
// ../electron-browser/snowballDatabaseService.ts), on the engine of the duckdb> terminal (@duckdb/node-api): an
// in-memory database, PollisReferences attached read-only, and the in-memory database `snowball` for the map's
// tables. More sources, in memory or in files, are attached beside them.

import { DuckDBConnection, DuckDBInstance } from '@duckdb/node-api';
import * as fs from 'fs';
import * as os from 'os';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { join } from '../../../../base/common/path.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { Server as ChildProcessServer } from '../../../../base/parts/ipc/node/ipc.cp.js';
import { Server as UtilityProcessServer } from '../../../../base/parts/ipc/node/ipc.mp.js';
import { isUtilityProcess } from '../../../../base/parts/sandbox/node/electronTypes.js';
import { ISnowballDatabase, SnowballParameter, SnowballRow } from '../common/snowballSearch.js';

const REFERENCES = join(os.homedir(), '.pollis', 'databases', 'PollisReferences.duckdb');

/** Without PollisReferences, which the Julia extension builds at install, an empty table of the columns the map reads. */
const NO_REFERENCES = `ATTACH ':memory:' AS PollisReferences;
CREATE TABLE PollisReferences.all_references (key VARCHAR, title VARCHAR, authors VARCHAR[], year INTEGER, journal VARCHAR, booktitle VARCHAR, doi VARCHAR, openalex VARCHAR, url VARCHAR, removed BOOLEAN)`;

class SnowballDatabase implements ISnowballDatabase {

	private connection: Promise<DuckDBConnection> | undefined;

	private connect(): Promise<DuckDBConnection> {
		this.connection ??= (async () => {
			const instance = await DuckDBInstance.create(':memory:');
			const connection = await instance.connect();
			await connection.run(fs.existsSync(REFERENCES) ? `ATTACH '${REFERENCES.replace(/'/g, `''`)}' AS PollisReferences (READ_ONLY)` : NO_REFERENCES);
			await connection.run(`ATTACH ':memory:' AS snowball`);
			return connection;
		})();
		return this.connection;
	}

	async run(sql: string, parameters?: Record<string, SnowballParameter>): Promise<void> {
		const connection = await this.connect();
		await connection.run(sql, parameters);
	}

	async query(sql: string, parameters?: Record<string, SnowballParameter>): Promise<SnowballRow[]> {
		const connection = await this.connect();
		const reader = await connection.runAndReadAll(sql, parameters);
		return reader.getRowObjectsJson() as SnowballRow[];
	}
}

const server = isUtilityProcess(process) ? new UtilityProcessServer() : new ChildProcessServer('snowballDatabase');
server.registerChannel('snowballDatabase', ProxyChannel.fromService(new SnowballDatabase(), new DisposableStore()));
