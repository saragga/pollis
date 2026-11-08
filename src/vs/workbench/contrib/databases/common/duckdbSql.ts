/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/** Set by the Julia extension: the id of this window's Julia REPL, which PollisDB writes into the files it shares. */
export const JULIA_POLLIS_WINDOW_KEY = 'julia.pollisWindow';

/** Runs SQL in the DuckDB terminal used last, or opens one: the SQL given, else the selection or the statement at the cursor of the SQL file. */
export const RUN_IN_DUCKDB_TERMINAL_COMMAND_ID = 'pollis.databases.runInDuckDBTerminal';

/** A piece of SQL text between two semicolons: `start` to `end`, the semicolon after it excluded. */
export interface ISqlPiece {
	readonly start: number;
	readonly end: number;
}

/**
 * The pieces of `sql` between the semicolons outside quotes, dollar-quoted strings and comments,
 * blank ones included: the last is what follows the last semicolon.
 */
export function sqlPieces(sql: string): ISqlPiece[] {
	const found: ISqlPiece[] = [];
	let start = 0;
	const skip = (close: string, from: number) => {
		const at = sql.indexOf(close, from);
		return at < 0 ? sql.length : at + close.length - 1;
	};
	for (let i = 0; i < sql.length; i++) {
		const c = sql[i];
		if (c === '\'' || c === '"') {
			i = skip(c, i + 1);
		} else if (sql.startsWith('--', i)) {
			i = skip('\n', i);
		} else if (sql.startsWith('/*', i)) {
			i = skip('*/', i + 2);
		} else if (c === '$') {
			const tag = /^\$[A-Za-z_]*\$/.exec(sql.slice(i))?.[0];
			if (tag) {
				i = skip(tag, i + tag.length);
			}
		} else if (c === ';') {
			found.push({ start, end: i });
			start = i + 1;
		}
	}
	found.push({ start, end: sql.length });
	return found;
}

/** Whether `sql` holds nothing but blanks and comments. */
export function blankSql(sql: string): boolean {
	return sql.replace(/--[^\n]*|\/\*[\s\S]*?\*\//g, '').trim() === '';
}

/**
 * The statement of `sql` at `offset`, ended with a semicolon: the one the offset lies in or ends, or, on a blank
 * piece, the last statement before it. Undefined when there is none.
 */
export function sqlStatementAt(sql: string, offset: number): string | undefined {
	const pieces = sqlPieces(sql);
	// The piece holding the offset, its semicolon included
	let index = pieces.findIndex(piece => offset <= piece.end);
	if (index < 0) {
		index = pieces.length - 1;
	}
	while (index >= 0 && blankSql(sql.slice(pieces[index].start, pieces[index].end))) {
		index--;
	}
	return index < 0 ? undefined : `${sql.slice(pieces[index].start, pieces[index].end).trim()};`;
}

/**
 * `name :=` at the start of a statement, after blanks and comments, which the pollis> mode of the Julia REPL and SQL
 * cells of Julia notebooks run; `lead` is what comes before it.
 */
const ASSIGNMENT = /^(?<lead>(?:\s|--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)*)(?<name>[A-Za-z_][A-Za-z0-9_]*)\s*:=\s*/;

/** The name of the first statement of `sql` that starts with `name :=`, or undefined when none does. */
export function sqlAssignedName(sql: string): string | undefined {
	for (const piece of sqlPieces(sql)) {
		const name = ASSIGNMENT.exec(sql.slice(piece.start, piece.end))?.groups?.name;
		if (name) {
			return name;
		}
	}
	return undefined;
}

/** `sql` without the `name :=` that starts any of its statements: the SQL that ran, as the History view lists it. */
export function withoutAssignments(sql: string): string {
	let result = '';
	let from = 0;
	for (const piece of sqlPieces(sql)) {
		result += sql.slice(from, piece.start) + sql.slice(piece.start, piece.end).replace(ASSIGNMENT, '$<lead>');
		from = piece.end;
	}
	return result + sql.slice(from);
}

/** The text sent to the duckdb> shell for `sql`: trimmed, and ended with a semicolon, so that it runs. */
export function runnableSql(sql: string): string | undefined {
	const text = sql.trim();
	if (blankSql(text)) {
		return undefined;
	}
	const pieces = sqlPieces(text);
	const last = pieces[pieces.length - 1];
	return blankSql(text.slice(last.start, last.end)) ? text : `${text};`;
}

/** A query of the History view. */
export interface IQueryHistoryEntry {
	readonly sql: string;
	/** When it ran, in milliseconds since 1970. */
	readonly time: number;
	/**
	 * The duckdb> terminal, a notebook run by DuckDB SQL (Pollis) or Julia, the Pollis REPL terminal, or the pollis> mode
	 * of the Julia REPL, `sql` in its history.
	 */
	readonly source: 'duckdb' | 'notebook' | 'pollis' | 'sql';
	/** The duckdb> and Pollis REPL terminals and the notebooks record how long the query took, its rows, its error and its database. */
	readonly durationMs?: number;
	/** The rows of its last result, or those its last statement changed. */
	readonly rows?: number;
	readonly error?: string;
	/** The DuckDB file the terminal opened, or the notebook's file; none for the terminal's in-memory database. */
	readonly database?: string;
}

/** The log of the duckdb> terminal and of the notebooks, one JSON object to a line, in ~/.pollis/duckdb. */
export const DUCKDB_QUERY_LOG = 'query_log.jsonl';

/** A line of the log, as the duckdb> terminal and the DuckDB SQL (Pollis) kernel write it. */
export interface IDuckDBQueryLogLine {
	readonly sql: string;
	/** ISO 8601. */
	readonly time: string;
	readonly ms: number;
	readonly rows?: number;
	readonly error?: string;
	readonly database?: string;
	/** Written by the notebook kernels, DuckDB SQL (Pollis) and Julia's SQL cells, and by the Pollis REPL terminal; duckdb> writes none. */
	readonly source?: 'notebook' | 'pollis';
}

/** The queries of the log of the duckdb> terminal and of the notebooks; a line it cannot read is left out. */
export function parseDuckDBQueryLog(text: string): IQueryHistoryEntry[] {
	const entries: IQueryHistoryEntry[] = [];
	for (const line of text.split('\n')) {
		if (!line.trim()) {
			continue;
		}
		try {
			const value = JSON.parse(line) as IDuckDBQueryLogLine;
			const time = Date.parse(value.time);
			if (typeof value.sql === 'string' && !isNaN(time)) {
				entries.push({ sql: value.sql, time, source: value.source === 'notebook' || value.source === 'pollis' ? value.source : 'duckdb', durationMs: value.ms, rows: value.rows, error: value.error, database: value.database });
			}
		} catch {
			// A line cut short by a shell that stopped while writing it
		}
	}
	return entries;
}

/**
 * The queries of the pollis> mode in the history of the Julia REPL, where the mode is named `sql`, without the
 * `name :=` of their statements: each entry is a `# time:` line, a `# mode:` line,
 * then its text, every line of it after a tab.
 */
export function parseJuliaSqlHistory(text: string): IQueryHistoryEntry[] {
	const entries: IQueryHistoryEntry[] = [];
	let time: number | undefined;
	let mode: string | undefined;
	let lines: string[] = [];
	const flush = () => {
		if (mode === 'sql' && time !== undefined && lines.length) {
			entries.push({ sql: withoutAssignments(lines.join('\n')), time, source: 'sql' });
		}
		lines = [];
	};
	for (const line of text.split('\n')) {
		if (line.startsWith('# time: ')) {
			flush();
			// `2026-11-08 02:49:34Z`, or with a zone name such as WET, which is left out
			const stamp = /^(?<date>\d{4}-\d{2}-\d{2}) (?<clock>\d{2}:\d{2}:\d{2})(?<utc>Z)?/.exec(line.slice('# time: '.length).trim());
			time = stamp?.groups ? Date.parse(`${stamp.groups.date}T${stamp.groups.clock}${stamp.groups.utc ?? ''}`) : undefined;
			mode = undefined;
		} else if (line.startsWith('# mode: ')) {
			mode = line.slice('# mode: '.length).trim();
		} else if (line.startsWith('\t')) {
			lines.push(line.slice(1));
		}
	}
	flush();
	return entries;
}
