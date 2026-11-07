/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The duckdb> terminal: a DuckDB shell on the engine of Pollis (@duckdb/node-api), run by Electron as
// Node in a terminal (see ../electron-browser/duckdbShell.contribution.ts). It opens an in-memory
// database, or the file it is given, with the built-in databases attached read-only, and loads the
// fts extension, full-text search. Extensions are never downloaded: those Pollis brings are all.

import { DuckDBConnection, DuckDBInstance, DuckDBValue, StatementType } from '@duckdb/node-api';
import * as fs from 'fs';
import * as os from 'os';
import * as readline from 'readline';
import { join } from '../../../../base/common/path.js';

const POLLIS_HOME = join(os.homedir(), '.pollis');
/** The fts extension, which the Julia extension of Pollis unpacks here at install. */
const FTS = join(POLLIS_HOME, 'duckdb', 'fts.duckdb_extension');
/** The databases of Pollis, built in and of its activity, attached read-only under their own names; Comparisons is the copy Pollis makes of the file it writes. */
const BUILTINS = [join(POLLIS_HOME, 'databases', 'PollisDatasets.duckdb'), join(POLLIS_HOME, 'databases', 'PollisRSS.duckdb'), join(POLLIS_HOME, 'databases', 'PollisJournals.duckdb'), join(POLLIS_HOME, 'databases', 'PollisReferences.duckdb'), join(POLLIS_HOME, 'databases', 'PollisBenchmarks.duckdb'), join(POLLIS_HOME, 'documents', 'PollisDocuments.duckdb'), join(POLLIS_HOME, 'databases', 'Comparisons.duckdb')];
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
/** Bold green, as the Julia REPL writes julia>: the terminal theme's green. */
const green = (text: string) => `\x1b[1;32m${text}\x1b[0m`;

const PROMPT = `${green('duckdb>')} `;
const CONTINUATION = `${green('   ...>')} `;

/**
 * A sequence of VS Code's shell integration (OSC 633), as the Julia REPL writes them: the terminal then marks each
 * prompt with a circle, blue when its command succeeded and red when it failed, with Rerun Command and Copy Output.
 */
const shellIntegration = (code: string) => `\x1b]633;${code}\x07`;

/** A command line as shell integration takes it: a backslash doubled, a semicolon and the characters up to the space as \xAB. */
function escapedCommandLine(text: string): string {
	return [...text].map(character => character === '\\' ? '\\\\'
		: character === ';' || character.charCodeAt(0) <= 0x20 ? `\\x${character.charCodeAt(0).toString(16).padStart(2, '0')}`
			: character).join('');
}

/** How a command ended: `quit` ends the shell. */
type CommandEnd = 'succeeded' | 'failed' | 'quit';

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
The built-in databases are attached read-only as PollisDatasets, PollisRSS, PollisJournals, PollisReferences,
PollisBenchmarks and PollisDocuments.`;

class Shell {

	private timer = true;
	private running = false;

	constructor(private readonly connection: DuckDBConnection) { }

	/** Attach the built-in databases and load fts; returns what went wrong, if anything: the shell starts at its prompt, as the Julia REPL does. */
	async prepare(): Promise<string[]> {
		const notes: string[] = [];
		for (const file of BUILTINS) {
			if (fs.existsSync(file)) {
				try {
					await this.connection.run(`ATTACH IF NOT EXISTS ${sqlString(file)} (READ_ONLY)`);
				} catch (err) {
					notes.push(red(String((err as Error).message)));
				}
			}
		}
		if (fs.existsSync(FTS)) {
			try {
				await this.connection.run(`LOAD ${sqlString(FTS)}`);
			} catch (err) {
				notes.push(red(`fts could not be loaded: ${(err as Error).message}`));
			}
		}
		return notes;
	}

	interrupt(): boolean {
		if (this.running) {
			this.connection.interrupt();
		}
		return this.running;
	}

	/** Run a dot command. */
	async command(line: string): Promise<CommandEnd> {
		const [name, ...args] = line.trim().split(/\s+/);
		const ended = (succeeded: boolean): CommandEnd => succeeded ? 'succeeded' : 'failed';
		switch (name) {
			case '.quit':
			case '.exit':
				return 'quit';
			case '.help':
				console.log(HELP);
				return 'succeeded';
			case '.timer':
				this.timer = args[0] !== 'off';
				return 'succeeded';
			case '.databases':
				return ended(await this.run('SELECT database_name AS name, path, readonly FROM duckdb_databases() WHERE NOT internal ORDER BY 1;'));
			case '.tables':
				return ended(await this.run('SELECT database, schema, name FROM (SHOW ALL TABLES) ORDER BY ALL;'));
			case '.schema':
				return ended(await this.run(`SELECT sql FROM (SELECT database_name, table_name, sql FROM duckdb_tables() UNION ALL SELECT database_name, view_name, sql FROM duckdb_views() WHERE NOT internal)${args[0] ? ` WHERE table_name = ${sqlString(args[0])}` : ''} ORDER BY database_name, table_name;`));
			default:
				console.log(red(`Unknown command ${name}; .help lists the commands.`));
				return 'failed';
		}
	}

	/** Run every statement of `sql`, showing the result of each; whether all of them ran. */
	async run(sql: string): Promise<boolean> {
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
			return true;
		} catch (err) {
			console.log(red((err as Error).message));
			return false;
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
	const shell = new Shell(connection);
	for (const note of await shell.prepare()) {
		console.log(note);
	}

	/** The lines of a query not yet ended with ";". */
	let buffer = '';
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: PROMPT,
		history: readHistory(),
		historySize: HISTORY_SIZE,
		removeHistoryDuplicates: true,
		completer: (line: string, callback: (err: null, result: [string[], string]) => void) => {
			shell.complete(buffer ? `${buffer}\n${line}` : line).then(result => callback(null, result));
		},
	});
	rl.on('history', history => writeHistory(history));

	/**
	 * The prompt of a new command, between the marks of its start and end, written apart from the prompt itself so
	 * that readline, which writes the prompt again as the line is edited, does not mark it again.
	 */
	const prompt = () => {
		process.stdout.write(shellIntegration('A'));
		rl.setPrompt(PROMPT);
		rl.prompt();
		process.stdout.write(shellIntegration('B'));
	};
	/** The command `commandLine` begins to run: its line, then the mark of its output. */
	const started = (commandLine: string) => process.stdout.write(shellIntegration(`E;${escapedCommandLine(commandLine)}`) + shellIntegration('C'));
	/** The command has ended: succeeded or failed, or with no status for an empty line or one dropped. */
	const finished = (end?: CommandEnd) => process.stdout.write(shellIntegration(end ? `D;${end === 'failed' ? 1 : 0}` : 'D'));

	rl.on('SIGINT', () => {
		if (!shell.interrupt()) {
			// Ctrl+C at the prompt drops what was typed, as in DuckDB's own shell.
			buffer = '';
			rl.write(null, { ctrl: true, name: 'u' });
			process.stdout.write('\n');
			finished();
			prompt();
		}
	});
	rl.on('close', () => {
		connection.closeSync();
		instance.closeSync();
		process.exit(0);
	});

	// The shell reports every command line, so the terminal need not guess them from the screen
	process.stdout.write(shellIntegration('P;HasRichCommandDetection=True'));
	prompt();
	for await (const line of rl) {
		if (!buffer && line.trim().startsWith('.')) {
			started(line.trim());
			const end = await shell.command(line);
			if (end === 'quit') {
				rl.close();
				return;
			}
			finished(end);
		} else {
			buffer += (buffer ? '\n' : '') + line;
			if (!complete(buffer)) {
				rl.setPrompt(CONTINUATION);
				rl.prompt();
				continue;
			}
			const sql = buffer;
			buffer = '';
			if (blank(sql)) {
				finished();
			} else {
				started(sql);
				// readline stays active, so that Ctrl+C reaches it and stops the query.
				finished(await shell.run(sql) ? 'succeeded' : 'failed');
			}
		}
		prompt();
	}
}

main().catch(err => {
	console.error(red(String((err as Error).message ?? err)));
	process.exit(1);
});
