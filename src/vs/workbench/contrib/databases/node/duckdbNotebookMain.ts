/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The DuckDB of the DuckDB SQL (Pollis) notebook kernel, in a utility process of its own (see
// ../electron-browser/duckdbNotebook.contribution.ts), on the engine of the duckdb> terminal (@duckdb/node-api).

import { DuckDBConnection, DuckDBInstance } from '@duckdb/node-api';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { Server as ChildProcessServer } from '../../../../base/parts/ipc/node/ipc.cp.js';
import { Server as UtilityProcessServer } from '../../../../base/parts/ipc/node/ipc.mp.js';
import { isUtilityProcess } from '../../../../base/parts/sandbox/node/electronTypes.js';
import { DUCKDB_NOTEBOOK_CHANNEL, DUCKDB_NOTEBOOK_SHOWN_ROWS, DuckDBNotebookResult, IDuckDBNotebookEngine, IDuckDBNotebookRun } from '../common/duckdbNotebook.js';
import { CHANGES, DUCKDB_OPTIONS, logQuery, preparePollisConnection, QUIET, readShownRows, trimQueryLog } from './duckdbPollis.js';

interface INotebookConnection {
	readonly instance: DuckDBInstance;
	readonly connection: DuckDBConnection;
	readonly problems: string[];
}

class DuckDBNotebookEngine implements IDuckDBNotebookEngine {

	/** The connection of each notebook, by its URI: one instance each, so that their in-memory databases are apart. */
	private readonly connections = new Map<string, Promise<INotebookConnection>>();

	private connect(notebook: string): { readonly opened: Promise<INotebookConnection>; readonly isNew: boolean } {
		const existing = this.connections.get(notebook);
		if (existing) {
			return { opened: existing, isNew: false };
		}
		const opened = (async () => {
			const instance = await DuckDBInstance.create(':memory:', DUCKDB_OPTIONS);
			const connection = await instance.connect();
			return { instance, connection, problems: await preparePollisConnection(connection) };
		})();
		this.connections.set(notebook, opened);
		// A connection that could not be made is tried again at the next cell
		opened.catch(() => this.connections.delete(notebook));
		return { opened, isNew: true };
	}

	async run(notebook: string, sql: string, file: string | undefined): Promise<IDuckDBNotebookRun> {
		const begun = Date.now();
		const results: DuckDBNotebookResult[] = [];
		let problems: string[] | undefined;
		let error: string | undefined;
		try {
			const { opened, isNew } = this.connect(notebook);
			const { connection, problems: found } = await opened;
			if (isNew && found.length) {
				problems = found;
			}
			const statements = await connection.extractStatements(sql);
			for (let index = 0; index < statements.count; index++) {
				const started = Date.now();
				const prepared = await statements.prepare(index);
				try {
					const result = await prepared.stream();
					if (QUIET.has(result.statementType)) {
						continue;
					}
					if (CHANGES.has(result.statementType)) {
						results.push({ kind: 'changed', rows: Number(result.rowsChanged), ms: Date.now() - started });
						continue;
					}
					const shown = await readShownRows(result, DUCKDB_NOTEBOOK_SHOWN_ROWS);
					results.push({ kind: 'rows', ...shown, ms: Date.now() - started });
				} finally {
					prepared.destroySync();
				}
			}
		} catch (err) {
			error = (err as Error).message;
		}
		const last = results.at(-1);
		logQuery({ sql: sql.trim(), time: new Date(begun).toISOString(), ms: Date.now() - begun, rows: last?.kind === 'rows' ? last.count : last?.rows, error, database: file, source: 'notebook' });
		return { results, error, problems };
	}

	async interrupt(notebook: string): Promise<void> {
		const opened = this.connections.get(notebook);
		if (opened) {
			(await opened).connection.interrupt();
		}
	}

	async close(notebook: string): Promise<void> {
		const opened = this.connections.get(notebook);
		this.connections.delete(notebook);
		if (opened) {
			try {
				const { instance, connection } = await opened;
				connection.closeSync();
				instance.closeSync();
			} catch {
				// Never opened
			}
		}
	}
}

trimQueryLog();
const server = isUtilityProcess(process) ? new UtilityProcessServer() : new ChildProcessServer(DUCKDB_NOTEBOOK_CHANNEL);
server.registerChannel(DUCKDB_NOTEBOOK_CHANNEL, ProxyChannel.fromService(new DuckDBNotebookEngine(), new DisposableStore()));
