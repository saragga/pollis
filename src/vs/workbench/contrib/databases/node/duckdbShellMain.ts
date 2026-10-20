/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The duckdb> terminal: a DuckDB shell on the engine of Pollis (@duckdb/node-api), run by Electron as
// Node in a terminal (see ../electron-browser/duckdbShell.contribution.ts). It opens an in-memory
// database, or the file it is given, with the built-in databases attached read-only, and loads the
// Lance extension in the background. Extensions are never downloaded: those Pollis brings are all.

import { DuckDBConnection, DuckDBInstance, DuckDBValue, StatementType } from '@duckdb/node-api';
import * as fs from 'fs';
import * as os from 'os';
import * as readline from 'readline';
import { join } from '../../../../base/common/path.js';

const POLLIS_HOME = join(os.homedir(), '.pollis');
/** The Lance extension, which the Julia extension of Pollis unpacks here at install. */
const LANCE = join(POLLIS_HOME, 'duckdb', 'lance.duckdb_extension');
/** The built-in databases, attached read-only under their own names. */
const BUILTINS = [join(POLLIS_HOME, 'databases', 'PollisDatasets.duckdb'), join(POLLIS_HOME, 'databases', 'PollisRSS.duckdb'), join(POLLIS_HOME, 'databases', 'PollisJournals.duckdb')];
const HISTORY = join(POLLIS_HOME, 'duckdb', 'shell_history');
const HISTORY_SIZE = 1000;

/** The rows shown of a result: the first and the last half, when there are more. */
const SHOWN_ROWS = 40;
const MAX_WIDTH = 40;

/** Statements whose result is only a count of rows, or nothing: no table is shown for them. */
const QUIET = new Set<StatementType>([StatementType.CREATE, StatementType.DROP, StatementType.ALTER, StatementType.ATTACH, StatementType.DETACH, StatementType.LOAD, StatementType.SET, StatementType.VARIABLE_SET, StatementType.TRANSACTION, StatementType.CREATE_FUNC, StatementType.VACUUM, StatementType.ANALYZE, StatementType.EXPORT]);
const CHANGES = new Set<StatementType>([StatementType.INSERT, StatementType.UPDATE, StatementType.DELETE, StatementType.COPY, StatementType.MERGE_INTO]);

const dim = (text: string) => `\x1b[2m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

function sqlString(text: string): string {
	return `'${text.replace(/'/g, `''`)}'`;
}

/**
 * The pieces of `sql` between the semicolons outside quotes, dollar-quoted strings and comments,
 * blank ones included: the last is what follows the last semicolon.
 */
function pieces(sql: string): string[] {
	const found: string[] = [];
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
			found.push(sql.slice(start, i));
			start = i + 1;
		}
	}
	found.push(sql.slice(start));
	return found;
}

/** Whether `sql` holds nothing but blanks and comments. */
function blank(sql: string): boolean {
	return sql.replace(/--[^\n]*|\/\*[\s\S]*?\*\//g, '').trim() === '';
}

/** Whether `sql` ends with a semicolon outside quotes and comments, so that it runs. */
function complete(sql: string): boolean {
	return blank(sql) || blank(pieces(sql).at(-1)!);
}

function cell(value: DuckDBValue): string {
	return value === null ? 'NULL' : String(value).replace(/\s/g, ' ');
}

function fit(text: string, width: number): string {
	return text.length > width ? text.slice(0, width - 1) + '…' : text.padEnd(width);
}

/** The table of a result, in a box, with the first and last rows when it has more than `SHOWN_ROWS`. */
function table(names: readonly string[], first: string[][], last: string[][]): string {
	const shown = [...first, ...last];
	const widths = names.map((name, j) => Math.min(MAX_WIDTH, Math.max(name.length, ...shown.map(row => row[j].length))));
	// allow-any-unicode-next-line
	const line = (left: string, middle: string, right: string) => left + widths.map(w => '─'.repeat(w + 2)).join(middle) + right;
	// allow-any-unicode-next-line
	const row = (values: readonly string[]) => '│ ' + values.map((value, j) => fit(value, widths[j])).join(' │ ') + ' │';
	// allow-any-unicode-next-line
	const lines = [line('┌', '┬', '┐'), row(names), line('├', '┼', '┤'), ...first.map(row)];
	if (last.length) {
		// allow-any-unicode-next-line
		lines.push(row(names.map(() => '⋮')), ...last.map(row));
	}
	// allow-any-unicode-next-line
	lines.push(line('└', '┴', '┘'));
	return lines.join('\n');
}

const HELP = `.databases          The attached databases
.help               This help
.quit, .exit        Leave the shell (also Ctrl+D)
.schema [table]     The CREATE statements of the tables, or of one
.tables             The tables and views of every database
.timer on|off       Show how long each query took (on)

A query ends with ";"; until then, Enter starts a new line. Ctrl+C stops a running query.
The built-in databases are attached read-only as PollisDatasets, PollisRSS and PollisJournals.`;

class Shell {

	private timer = true;
	private running = false;
	private lance: Promise<boolean> = Promise.resolve(false);

	constructor(private readonly instance: DuckDBInstance, private readonly connection: DuckDBConnection) { }

	/** Attach the built-in databases and start loading Lance; returns what to tell the user about them. */
	async prepare(): Promise<string[]> {
		const notes: string[] = [];
		const attached: string[] = [];
		for (const file of BUILTINS) {
			if (fs.existsSync(file)) {
				try {
					await this.connection.run(`ATTACH IF NOT EXISTS ${sqlString(file)} (READ_ONLY)`);
					attached.push(file.replace(/^.*[\\/]|\.duckdb$/g, ''));
				} catch (err) {
					notes.push(red(String((err as Error).message)));
				}
			}
		}
		if (attached.length) {
			notes.push(dim(`Attached read-only: ${attached.join(', ')}.`));
		}
		if (fs.existsSync(LANCE)) {
			// Through a connection of its own, so that queries can run while it loads.
			this.lance = this.instance.connect().then(async connection => {
				try {
					await connection.run(`LOAD ${sqlString(LANCE)}`);
					return true;
				} finally {
					connection.closeSync();
				}
			}).catch(err => {
				process.stdout.write(red(`\nLance could not be loaded: ${(err as Error).message}\n`));
				return false;
			});
		}
		return notes;
	}

	interrupt(): boolean {
		if (this.running) {
			this.connection.interrupt();
		}
		return this.running;
	}

	/** Run a dot command; returns false to quit. */
	async command(line: string): Promise<boolean> {
		const [name, ...args] = line.trim().split(/\s+/);
		switch (name) {
			case '.quit':
			case '.exit':
				return false;
			case '.help':
				console.log(HELP);
				break;
			case '.timer':
				this.timer = args[0] !== 'off';
				break;
			case '.databases':
				await this.run('SELECT database_name AS name, path, readonly FROM duckdb_databases() WHERE NOT internal ORDER BY 1;');
				break;
			case '.tables':
				await this.run('SELECT database, schema, name FROM (SHOW ALL TABLES) ORDER BY ALL;');
				break;
			case '.schema':
				await this.run(`SELECT sql FROM (SELECT database_name, table_name, sql FROM duckdb_tables() UNION ALL SELECT database_name, view_name, sql FROM duckdb_views() WHERE NOT internal)${args[0] ? ` WHERE table_name = ${sqlString(args[0])}` : ''} ORDER BY database_name, table_name;`);
				break;
			default:
				console.log(red(`Unknown command ${name}; .help lists the commands.`));
		}
		return true;
	}

	/** Run every statement of `sql`, showing the result of each. */
	async run(sql: string): Promise<void> {
		// A query about Lance waits for it; any other runs at once.
		if (/lance/i.test(sql)) {
			await this.lance;
		}
		this.running = true;
		try {
			const statements = await this.connection.extractStatements(sql);
			for (let index = 0; index < statements.count; index++) {
				const started = Date.now();
				const prepared = await statements.prepare(index);
				try {
					const result = await prepared.stream();
					const elapsed = () => this.timer ? `, ${((Date.now() - started) / 1000).toFixed(3)} s` : '';
					if (QUIET.has(result.statementType)) {
						continue;
					}
					if (CHANGES.has(result.statementType)) {
						console.log(dim(`(${result.rowsChanged} ${result.rowsChanged === 1 ? 'row' : 'rows'} changed${elapsed()})`));
						continue;
					}
					const names = result.columnNames();
					const first: string[][] = [];
					let last: string[][] = [];
					let rows = 0;
					for (let chunk = await result.fetchChunk(); chunk && chunk.rowCount; chunk = await result.fetchChunk()) {
						for (const values of chunk.getRows()) {
							rows++;
							if (first.length < SHOWN_ROWS / 2) {
								first.push(values.map(cell));
							} else {
								last.push(values.map(cell));
								if (last.length > SHOWN_ROWS / 2) {
									last.shift();
								}
							}
						}
					}
					// With no more than SHOWN_ROWS rows, all are shown without a gap.
					if (rows <= SHOWN_ROWS) {
						first.push(...last);
						last = [];
					}
					console.log(table(names, first, last));
					console.log(dim(`(${rows} ${rows === 1 ? 'row' : 'rows'}${elapsed()})`));
				} finally {
					prepared.destroySync();
				}
			}
		} catch (err) {
			console.log(red((err as Error).message));
		} finally {
			this.running = false;
		}
	}

	/**
	 * Completions of the word before the cursor, from DuckDB's autocomplete extension: those of its
	 * suggestions that start with the word, in lower case when the word is.
	 */
	async complete(text: string): Promise<[string[], string]> {
		try {
			const reader = await this.connection.runAndReadAll('SELECT suggestion, suggestion_start FROM sql_auto_complete($1) LIMIT 50', [text]);
			const rows = reader.getRows();
			if (!rows.length) {
				return [[], ''];
			}
			const word = text.slice(Number(rows[0][1]));
			const lower = word === word.toLowerCase();
			const hits = rows.map(row => lower ? String(row[0]).toLowerCase() : String(row[0])).filter(hit => hit.toLowerCase().startsWith(word.toLowerCase()));
			return [[...new Set(hits)], word];
		} catch {
			return [[], ''];
		}
	}
}

function readHistory(): string[] {
	try {
		return fs.readFileSync(HISTORY, 'utf8').split('\n').filter(Boolean).reverse().slice(0, HISTORY_SIZE);
	} catch {
		return [];
	}
}

function writeHistory(history: readonly string[]): void {
	try {
		fs.writeFileSync(HISTORY, [...history].reverse().join('\n') + '\n');
	} catch {
		// The history is a convenience.
	}
}

async function main(): Promise<void> {
	const file = process.argv[2] || ':memory:';
	const instance = await DuckDBInstance.create(file, { autoinstall_known_extensions: 'false', autoload_known_extensions: 'false' });
	const connection = await instance.connect();
	const shell = new Shell(instance, connection);
	const version = (await connection.runAndReadAll('SELECT library_version FROM pragma_version()')).getRows()[0][0];
	console.log(`DuckDB ${version} in Pollis${file === ':memory:' ? ', an in-memory database' : `, ${file}`}. Type .help for help.`);
	for (const note of await shell.prepare()) {
		console.log(note);
	}

	/** The lines of a query not yet ended with ";". */
	let buffer = '';
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: 'duckdb> ',
		history: readHistory(),
		historySize: HISTORY_SIZE,
		removeHistoryDuplicates: true,
		completer: (line: string, callback: (err: null, result: [string[], string]) => void) => {
			shell.complete(buffer ? `${buffer}\n${line}` : line).then(result => callback(null, result));
		},
	});
	rl.on('history', history => writeHistory(history));

	rl.on('SIGINT', () => {
		if (!shell.interrupt()) {
			// Ctrl+C at the prompt drops what was typed, as in DuckDB's own shell.
			buffer = '';
			rl.write(null, { ctrl: true, name: 'u' });
			process.stdout.write('\n');
			rl.setPrompt('duckdb> ');
			rl.prompt();
		}
	});
	rl.on('close', () => {
		connection.closeSync();
		instance.closeSync();
		process.exit(0);
	});

	rl.prompt();
	for await (const line of rl) {
		if (!buffer && line.trim().startsWith('.')) {
			if (!await shell.command(line)) {
				rl.close();
				return;
			}
		} else {
			buffer += (buffer ? '\n' : '') + line;
			if (!complete(buffer)) {
				rl.setPrompt('   ...> ');
				rl.prompt();
				continue;
			}
			const sql = buffer;
			buffer = '';
			if (!blank(sql)) {
				// readline stays active, so that Ctrl+C reaches it and stops the query.
				await shell.run(sql);
			}
		}
		rl.setPrompt('duckdb> ');
		rl.prompt();
	}
}

main().catch(err => {
	console.error(red(String((err as Error).message ?? err)));
	process.exit(1);
});
