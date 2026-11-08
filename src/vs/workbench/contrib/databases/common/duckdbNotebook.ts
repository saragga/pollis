/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/** The channel of the DuckDB process of the DuckDB SQL (Pollis) notebook kernel. */
export const DUCKDB_NOTEBOOK_CHANNEL = 'duckdbNotebook';

/** The rows shown of a result in a notebook, as in the duckdb> terminal: the first and the last half, when there are more. */
export const DUCKDB_NOTEBOOK_SHOWN_ROWS = 40;

/** The result of one statement of a cell: its rows, or the number of rows it changed; statements such as CREATE have none. */
export type DuckDBNotebookResult =
	| { readonly kind: 'rows'; readonly names: string[]; readonly types: string[]; readonly first: string[][]; readonly last: string[][]; readonly count: number; readonly ms: number }
	| { readonly kind: 'changed'; readonly rows: number; readonly ms: number };

/** How the statements of a cell went: the results of those that ran, and the error that stopped them. */
export interface IDuckDBNotebookRun {
	readonly results: DuckDBNotebookResult[];
	readonly error?: string;
	/** What went wrong while the notebook's connection was opened: a database of Pollis not attached, fts not loaded. */
	readonly problems?: string[];
}

/**
 * The DuckDB of the notebooks, in a process of its own: a connection to each notebook, made at its first cell, an
 * in-memory database with the databases of Pollis attached read-only and fts loaded, as in the duckdb> terminal.
 */
export interface IDuckDBNotebookEngine {
	/** Runs the statements of a cell of `notebook`; `file`, the notebook's file, goes with the query into the History view. */
	run(notebook: string, sql: string, file: string | undefined): Promise<IDuckDBNotebookRun>;
	/** Stops the statement `notebook` is running. */
	interrupt(notebook: string): Promise<void>;
	/** Closes the connection of `notebook`; its next cell opens a new one. */
	close(notebook: string): Promise<void>;
}
