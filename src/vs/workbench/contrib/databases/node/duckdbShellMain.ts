/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The duckdb> terminal: a DuckDB shell on the engine of Pollis (@duckdb/node-api), run by Electron as
// Node in a terminal (see ../electron-browser/duckdbShell.contribution.ts). It opens an in-memory
// database, or the file it is given, with the built-in databases attached read-only, and loads the
// fts extension, full-text search. Extensions are never downloaded: those Pollis brings are all.

import { DuckDBConnection, DuckDBInstance } from '@duckdb/node-api';
import * as fs from 'fs';
import * as readline from 'readline';
import { join } from '../../../../base/common/path.js';
import { DUCKDB_FUNCTION_FORMS_SQL, DUCKDB_KEYWORD_SQL, DUCKDB_NEAR_NAMES_SQL, duckdbFunctionKinds, IDuckDBFunctionForm } from '../common/duckdbHelp.js';
import { blankSql, sqlPieces } from '../common/duckdbSql.js';
import { CHANGES, DUCKDB_OPTIONS, SHARED_DATABASE, SharedSessionAttachment, logQuery, POLLIS_HOME, preparePollisConnection, QUIET, readShownRows, sqlString, trimQueryLog, withHint } from './duckdbPollis.js';

const HISTORY = join(POLLIS_HOME, 'duckdb', 'shell_history');
const HISTORY_SIZE = 1000;
/** The rows shown of a result: the first and the last half, when there are more. */
const SHOWN_ROWS = 40;
const MAX_WIDTH = 40;

const dim = (text: string) => `\x1b[2m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
/** Bold green, as the Julia REPL writes julia>: the terminal theme's green. */
const green = (text: string) => `\x1b[1;32m${text}\x1b[0m`;

/** Bold yellow, as the Julia REPL writes help?>: the terminal theme's yellow. */
const yellow = (text: string) => `\x1b[1;33m${text}\x1b[0m`;
const bold = (text: string) => `\x1b[1m${text}\x1b[0m`;

const PROMPT = `${green('duckdb>')} `;
const CONTINUATION = `${green('   ...>')} `;
/** The prompt of help mode, which `?` at the start of an empty line enters, as at julia>. */
const HELP_PROMPT = `${yellow('help?>')} `;
/** The names of the kinds of function of duckdb_functions(). */
const KINDS: Record<string, string> = {
	scalar: 'Scalar function',
	aggregate: 'Aggregate function',
	table: 'Table function',
	macro: 'Macro',
	table_macro: 'Table macro',
	pragma: 'Pragma',
};

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

/** How the statements of a query went: the rows of the last result, or those the last statement changed, and the error that stopped them. */
interface IRunOutcome {
	readonly succeeded: boolean;
	readonly rows?: number;
	readonly error?: string;
}

/** Whether `sql` ends with a semicolon outside quotes and comments, so that it runs. */
function complete(sql: string): boolean {
	const last = sqlPieces(sql).at(-1)!;
	return blankSql(sql) || blankSql(sql.slice(last.start, last.end));
}

function fit(text: string, width: number): string {
	return text.length > width ? text.slice(0, width - 1) + '…' : text.padEnd(width);
}

/**
 * The table of a result, in a box, with the first and last rows when it has more than `SHOWN_ROWS`: the columns that
 * fit in `available` characters, the first always. `hidden` is the names of the others.
 */
function table(names: readonly string[], first: string[][], last: string[][], available: number): { text: string; hidden: string[] } {
	const shown = [...first, ...last];
	const all = names.map((name, j) => Math.min(MAX_WIDTH, Math.max(name.length, ...shown.map(row => row[j].length))));
	// A column takes its width and three more, a border and a space before it and a space after it; the box ends with a border.
	let count = 0;
	let used = 1;
	while (count < all.length && (count === 0 || used + all[count] + 3 <= available)) {
		used += all[count] + 3;
		count++;
	}
	const widths = all.slice(0, count).map(w => Math.min(w, Math.max(1, available - 4)));
	// allow-any-unicode-next-line
	const line = (left: string, middle: string, right: string) => left + widths.map(w => '─'.repeat(w + 2)).join(middle) + right;
	// allow-any-unicode-next-line
	const row = (values: readonly string[]) => '│ ' + values.slice(0, count).map((value, j) => fit(value, widths[j])).join(' │ ') + ' │';
	// allow-any-unicode-next-line
	const lines = [line('┌', '┬', '┐'), row(names), line('├', '┼', '┤'), ...first.map(row)];
	if (last.length) {
		// allow-any-unicode-next-line
		lines.push(row(names.map(() => '⋮')), ...last.map(row));
	}
	// allow-any-unicode-next-line
	lines.push(line('└', '┴', '┘'));
	return { text: lines.join('\n'), hidden: names.slice(count) };
}

const HELP = `.databases          The attached databases
.help [function]    This help, or that of a DuckDB function, as help?> shows it
.quit, .exit        Leave the shell (also Ctrl+D)
.schema [table]     The CREATE statements of the tables, or of one
.tables             The tables and views of every database, the Shared Session's included
.timer on|off       Show how long each query took (on)

A query ends with ";"; until then, Enter starts a new line. Ctrl+C stops a running query.
? at the start of an empty line turns the prompt into help?>, where the name of a DuckDB function shows its forms,
its description and its examples; the prompt is duckdb> again after it, and Backspace on an empty line goes back.
The built-in databases are attached read-only as PollisDatasets, PollisRSS, PollisJournals, PollisReferences,
PollisBenchmarks and PollisDocuments. While the Julia REPL of this window runs, its Shared Session is attached as
SharedSession: SELECT * FROM SharedSession.stock_returns reads the table @share stock_returns = ... made in Julia.`;

class Shell {

	private timer = true;
	private running = false;

	/** The Shared Session of this window, whose id Pollis gives the terminal as POLLIS_WINDOW. */
	private readonly shared: SharedSessionAttachment;

	constructor(private readonly connection: DuckDBConnection) {
		this.shared = new SharedSessionAttachment(connection, process.env.POLLIS_WINDOW || undefined);
	}

	/** Attach the built-in databases and the Shared Session, and load fts; returns what went wrong, if anything: the shell starts at its prompt, as the Julia REPL does. */
	async prepare(): Promise<string[]> {
		const problems = await preparePollisConnection(this.connection);
		const shared = await this.shared.sync();
		return [...problems, ...(shared ? [shared] : [])].map(red);
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
				if (args.length) {
					return this.help(args.join(' '));
				}
				console.log(HELP);
				return 'succeeded';
			case '.timer':
				this.timer = args[0] !== 'off';
				return 'succeeded';
			case '.databases':
				return ended((await this.run('SELECT database_name AS name, path, readonly FROM duckdb_databases() WHERE NOT internal ORDER BY 1;')).succeeded);
			case '.tables': {
				// The tables of the Shared Session are listed by Julia: an attached quack database lists none of its own
				await this.shared.sync();
				const ofJulia = `SELECT schema_name, table_name FROM duckdb_tables() WHERE database_name = current_database() UNION ALL SELECT schema_name, view_name FROM duckdb_views() WHERE database_name = current_database() AND NOT internal`;
				const shared = this.shared.attachedNow ? ` UNION ALL SELECT ${sqlString(SHARED_DATABASE)}, schema_name, table_name FROM quack_query_by_name(${sqlString(SHARED_DATABASE)}, ${sqlString(ofJulia)})` : '';
				return ended((await this.run(`SELECT database, schema, name FROM (SHOW ALL TABLES)${shared} ORDER BY ALL;`)).succeeded);
			}
			case '.schema':
				return ended((await this.run(`SELECT sql FROM (SELECT database_name, table_name, sql FROM duckdb_tables() UNION ALL SELECT database_name, view_name, sql FROM duckdb_views() WHERE NOT internal)${args[0] ? ` WHERE table_name = ${sqlString(args[0])}` : ''} ORDER BY database_name, table_name;`)).succeeded);
			default:
				console.log(red(`Unknown command ${name}; .help lists the commands.`));
				return 'failed';
		}
	}

	/**
	 * Show the help of the DuckDB function `name`, as help?> shows that of a Julia name: the forms of each of its kinds,
	 * its description and its examples, from duckdb_functions(); for a name DuckDB has no function of, the nearest names.
	 * An empty name shows the help of the shell.
	 */
	async help(name: string): Promise<CommandEnd> {
		const wanted = name.trim().replace(/[\s();]+$/, '');
		if (!wanted) {
			console.log(HELP);
			return 'succeeded';
		}
		try {
			const forms = (await this.connection.runAndReadAll(DUCKDB_FUNCTION_FORMS_SQL, [wanted])).getRowObjectsJson() as unknown as IDuckDBFunctionForm[];
			if (!forms.length) {
				const keyword = (await this.connection.runAndReadAll(DUCKDB_KEYWORD_SQL, [wanted])).getRows().length > 0;
				const near = (await this.connection.runAndReadAll(DUCKDB_NEAR_NAMES_SQL, [wanted])).getRows().map(row => String(row[0]));
				console.log(keyword ? `${bold(wanted)} is a keyword of SQL, not a function.` : `DuckDB has no function named ${bold(wanted)}.`);
				if (near.length) {
					console.log(`Perhaps you meant ${near.map(bold).join(', ')}`);
				}
				return keyword ? 'succeeded' : 'failed';
			}
			const lines: string[] = [];
			for (const kind of duckdbFunctionKinds(forms)) {
				lines.push(`  ${dim(KINDS[kind.type] ?? kind.type)}`, '');
				lines.push(...kind.forms.map(form => `  ${bold(form)}`));
				if (kind.more) {
					lines.push(dim(`  and ${kind.more} more forms`));
				}
				if (kind.alias) {
					lines.push('', `  An alias of ${bold(kind.alias)}.`);
				}
				if (kind.descriptions.length) {
					lines.push('', ...kind.descriptions.map(description => `  ${description}`));
				}
				if (kind.examples.length) {
					lines.push('', `  ${bold(kind.examples.length === 1 ? 'Example' : 'Examples')}`, ...kind.examples.map(example => `    ${example}`));
				}
				lines.push('');
			}
			console.log(lines.join('\n'));
			return 'succeeded';
		} catch (err) {
			console.log(red((err as Error).message));
			return 'failed';
		}
	}

	/** Run every statement of `sql`, showing the result of each; how they went. */
	async run(sql: string): Promise<IRunOutcome> {
		this.running = true;
		let rows: number | undefined;
		try {
			// The Julia REPL may have started, restarted or stopped since the last query
			const shared = await this.shared.sync();
			if (shared) {
				console.log(red(shared));
			}
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
						rows = Number(result.rowsChanged);
						console.log(dim(`(${result.rowsChanged} ${result.rowsChanged === 1 ? 'row' : 'rows'} changed${elapsed()})`));
						continue;
					}
					const { names, first, last, count } = await readShownRows(result, SHOWN_ROWS);
					const { text, hidden } = table(names, first, last, process.stdout.columns ?? Infinity);
					console.log(text);
					console.log(dim(`(${count} ${count === 1 ? 'row' : 'rows'}${elapsed()})`));
					if (hidden.length) {
						console.log(dim(`${hidden.length === 1 ? '1 more column' : `${hidden.length} more columns`}: ${hidden.join(', ')}`));
					}
					rows = count;
				} finally {
					prepared.destroySync();
				}
			}
			return { succeeded: true, rows };
		} catch (err) {
			const error = withHint((err as Error).message);
			console.log(red(error));
			return { succeeded: false, rows, error };
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
	trimQueryLog();
	const instance = await DuckDBInstance.create(file, DUCKDB_OPTIONS);
	const connection = await instance.connect();
	const shell = new Shell(connection);
	for (const note of await shell.prepare()) {
		console.log(note);
	}

	/** The lines of a query not yet ended with ";". */
	let buffer = '';
	/** Whether the prompt is help?>, whose line is the name of a function to look up. */
	let helpMode = false;
	/** Whether a line is being run, when a ? is a character like any other. */
	let working = false;
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
		helpMode = false;
		process.stdout.write(shellIntegration('A'));
		rl.setPrompt(PROMPT);
		rl.prompt();
		process.stdout.write(shellIntegration('B'));
	};
	/** The command `commandLine` begins to run: its line, then the mark of its output. */
	const started = (commandLine: string) => process.stdout.write(shellIntegration(`E;${escapedCommandLine(commandLine)}`) + shellIntegration('C'));
	/** The command has ended: succeeded or failed, or with no status for an empty line or one dropped. */
	const finished = (end?: CommandEnd) => process.stdout.write(shellIntegration(end ? `D;${end === 'failed' ? 1 : 0}` : 'D'));

	/** Enters or leaves help mode on the line being typed, as `?` and Backspace do at julia>. */
	const setHelpMode = (help: boolean) => {
		helpMode = help;
		rl.setPrompt(help ? HELP_PROMPT : PROMPT);
		rl.prompt(true);
	};
	// Before readline takes a key: `?` on an empty line, outside a query, enters help mode, and Backspace on an empty help?> line leaves it
	let entering = false;
	process.stdin.prependListener('keypress', (typed: string | undefined, key: readline.Key | undefined) => {
		if (working || buffer) {
			return;
		}
		if (!helpMode && typed === '?' && rl.line === '') {
			entering = true;
		} else if (helpMode && key?.name === 'backspace' && rl.line === '') {
			setHelpMode(false);
		}
	});
	// After readline has put the ? in the line: the ? goes, and the prompt is help?>
	process.stdin.on('keypress', () => {
		if (entering) {
			entering = false;
			rl.write(null, { ctrl: true, name: 'u' });
			setHelpMode(true);
		}
	});

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
		working = true;
		if (helpMode) {
			started(`?${line.trim()}`);
			finished(await shell.help(line));
		} else if (!buffer && line.trim().startsWith('.')) {
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
				working = false;
				rl.setPrompt(CONTINUATION);
				rl.prompt();
				continue;
			}
			const sql = buffer;
			buffer = '';
			if (blankSql(sql)) {
				finished();
			} else {
				started(sql);
				// readline stays active, so that Ctrl+C reaches it and stops the query.
				const begun = Date.now();
				const outcome = await shell.run(sql);
				logQuery({ sql: sql.trim(), time: new Date(begun).toISOString(), ms: Date.now() - begun, rows: outcome.rows, error: outcome.error, database: process.argv[2] || undefined });
				finished(outcome.succeeded ? 'succeeded' : 'failed');
			}
		}
		working = false;
		prompt();
	}
}

main().catch(err => {
	console.error(red(String((err as Error).message ?? err)));
	process.exit(1);
});
