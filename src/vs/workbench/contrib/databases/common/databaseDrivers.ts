/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';

/**
 * The database engines a connection can target. Each one connects through DBInterface.jl; `odbc` reaches any database
 * with an ODBC driver the user installed (SQL Server, Oracle, Db2, Snowflake, ...).
 */
export type DatabaseDriverId = 'duckdb' | 'odbc' | 'sqlite' | 'postgres';

/** Where a connection profile is stored: for every workspace, or for the current one only. */
export type DatabaseConnectionTarget = 'global' | 'workspace';

/**
 * A saved connection. It holds everything needed to generate the Julia code that opens the
 * connection, and never a password: passwords are typed into the REPL when the code runs.
 */
export interface IDatabaseConnectionProfile {
	readonly id: string;
	readonly name: string;
	readonly driver: DatabaseDriverId;
	readonly target: DatabaseConnectionTarget;
	/** The Julia variable the connection is assigned to, e.g. `con`. */
	readonly variable: string;
	/** Driver field values, keyed by {@link IDatabaseDriverField.id}. */
	readonly options: Readonly<Record<string, string | boolean>>;
	/** Whether this is a database of Pollis, built in or of its activity, which cannot be edited or deleted. */
	readonly builtin?: boolean;
	/**
	 * Whether this database of Pollis is of its activity: what Pollis records as you work, such as the runs of the
	 * Evaluate and Benchmark pages or the items of the RSS feeds, rather than what comes with it. It cannot be
	 * rebuilt, so it is the one to back up; you read it, read-only, while Pollis adds to it.
	 */
	readonly activity?: boolean;
}

/** The three groups of databases of the Databases view: those built into Pollis, those of its activity, and the user's. */
export type DatabaseGroup = 'builtin' | 'activity' | 'user';

/** The group of the Databases view that lists `profile`. */
export function databaseGroupOf(profile: IDatabaseConnectionProfile | undefined): DatabaseGroup {
	return !profile?.builtin ? 'user' : profile.activity ? 'activity' : 'builtin';
}

/** The id of the built-in Pollis database, a DuckDB file in ~/.pollis. */
export const BUILTIN_DATABASE_ID = 'pollis';

/** The id of the PollisRSS database, views over the archive of the RSS feeds in ~/.pollis/rss, of the activity of Pollis. */
export const RSS_DATABASE_ID = 'pollisrss';

/** The id of the PollisJournals database, the journals of OpenAlex and the metrics imported, also built in. */
export const JOURNALS_DATABASE_ID = 'pollisjournals';

/** The id of the PollisReferences database, the references of Pollis and those the user added, also built in. */
export const REFERENCES_DATABASE_ID = 'pollisreferences';

/** The id of the PollisBenchmarks database, the catalogue of the benchmarks and the questions of those built in, also built in. */
export const BENCHMARKS_DATABASE_ID = 'pollisbenchmarks';

/** The id of the PollisDocuments database, the passages of Pollis' documents that Ask Pollis searches, also built in. */
export const DOCUMENTS_DATABASE_ID = 'pollisdocuments';

/**
 * The id of the Comparisons database, of the activity of Pollis: the runs of the Evaluate and Benchmark pages, read
 * from the copy of ~/.pollis/ask/Comparisons.duckdb that Pollis makes in ~/.pollis/databases after each change.
 */
export const COMPARISONS_DATABASE_ID = 'polliscomparisons';

/** The command of the Journal Metrics page, the sources of PollisJournals' levels and metrics, to import or remove. */
export const JOURNAL_METRICS_COMMAND_ID = 'pollis.databases.journalMetrics';

/** The command that opens the connection form; followed by `.` and a driver id, it opens the form on that driver. */
export const NEW_CONNECTION_COMMAND_ID = 'pollis.databases.newConnection';

/** The command of the WRDS page, Explore > Access Data Libraries > Wharton Research Data Services (WRDS). */
export const WRDS_PAGE_COMMAND_ID = 'pollis.wrds';

/** The command that opens the connection form filled in for WRDS ({@link WRDS_PRESET}). */
export const NEW_WRDS_CONNECTION_COMMAND_ID = 'pollis.databases.newConnection.wrds';

/** A new connection's starting point: its engine and, optionally, its name, variable and field values. */
export interface IDatabaseConnectionPreset {
	readonly driver: DatabaseDriverId;
	readonly name?: string;
	readonly variable?: string;
	readonly options?: Readonly<Record<string, string | boolean>>;
}

/** The host of the PostgreSQL server of WRDS (Wharton Research Data Services). */
const WRDS_HOST = 'wrds-pgdata.wharton.upenn.edu';

/**
 * WRDS, Wharton Research Data Services: a PostgreSQL server, with the settings WRDS gives its users, who add their
 * WRDS username. Each sign-in waits for a Duo push approved on the phone, so the connection waits longer than the
 * form's default.
 */
export const WRDS_PRESET: IDatabaseConnectionPreset = {
	driver: 'postgres',
	name: 'WRDS',
	variable: 'wrds',
	options: { host: WRDS_HOST, port: '9737', dbname: 'wrds', sslmode: 'require', connectTimeout: '120' },
};

/** Whether a connection is to the PostgreSQL server of WRDS. */
export function isWrdsConnection(profile: IDatabaseConnectionProfile): boolean {
	return profile.driver === 'postgres' && stringValue(profile, 'host').toLowerCase() === WRDS_HOST;
}

/** The command that shows the Connections of the Databases view, where saved connections are managed. */
export const SHOW_CONNECTIONS_COMMAND_ID = 'pollis.databases.showConnections';

/** One input of a driver's connection form. */
export interface IDatabaseDriverField {
	readonly id: string;
	readonly label: string;
	readonly kind: 'text' | 'number' | 'file' | 'checkbox' | 'select';
	readonly defaultValue: string | boolean;
	readonly placeholder?: string;
	readonly description?: string;
	readonly required?: boolean;
	/** The choices of a `select` field. */
	readonly options?: readonly string[];
}

/** A database engine and the Julia package that talks to it. */
export interface IDatabaseDriver {
	readonly id: DatabaseDriverId;
	readonly label: string;
	readonly description: string;
	/** The Julia packages the generated code loads. */
	readonly packages: readonly string[];
	readonly fields: readonly IDatabaseDriverField[];
}

/** The drivers, in alphabetical order, as the Connection Type list of the connection form shows them. */
export const DATABASE_DRIVERS: readonly IDatabaseDriver[] = [
	{
		id: 'duckdb',
		label: 'DuckDB',
		description: localize('duckdb.description', "In-process analytical database. Leave the file empty for an in-memory database that can query CSV and Parquet files in place."),
		packages: ['DuckDB', 'DBInterface'],
		fields: [
			{ id: 'path', label: localize('duckdb.path', "Database File"), kind: 'file', defaultValue: '', placeholder: localize('duckdb.path.placeholder', "Empty for an in-memory database") },
			{ id: 'readonly', label: localize('duckdb.readonly', "Read Only"), kind: 'checkbox', defaultValue: false, description: localize('duckdb.readonly.description', "Applies to database files only") },
		],
	},
	{
		id: 'odbc',
		label: 'ODBC',
		description: localize('odbc.description', "Any database with an ODBC driver, such as SQL Server, Oracle, Db2 or Snowflake. Install the database's ODBC driver first; on macOS and Linux, ODBC.jl keeps its own list of drivers, which ODBC.adddriver adds to."),
		packages: ['ODBC', 'DBInterface'],
		fields: [
			{ id: 'source', label: localize('odbc.source', "Data Source"), kind: 'text', defaultValue: '', placeholder: localize('odbc.source.placeholder', "A data source name, or a connection string such as Driver={{0}};Server=host;Database=db", 'ODBC Driver 18 for SQL Server'), required: true, description: localize('odbc.source.description', "Leave the password out: it is asked for in the REPL") },
			{ id: 'user', label: localize('odbc.user', "Username"), kind: 'text', defaultValue: '' },
			{ id: 'promptPassword', label: localize('odbc.promptPassword', "Ask for Password in the REPL"), kind: 'checkbox', defaultValue: true, description: localize('odbc.promptPassword.description', "Otherwise the driver signs in without one, e.g. with the account of the computer") },
			{ id: 'driverManager', label: localize('odbc.driverManager', "Driver Manager"), kind: 'select', defaultValue: 'default', options: ['default', 'unixODBC', 'iODBC'], description: localize('odbc.driverManager.description', "On macOS, Microsoft's SQL Server driver needs unixODBC") },
		],
	},
	{
		id: 'postgres',
		label: 'PostgreSQL',
		description: localize('postgres.description', "Client-server database, reached through libpq."),
		packages: ['LibPQ', 'DBInterface'],
		fields: [
			{ id: 'host', label: localize('postgres.host', "Host"), kind: 'text', defaultValue: 'localhost', required: true },
			{ id: 'port', label: localize('postgres.port', "Port"), kind: 'number', defaultValue: '5432' },
			{ id: 'dbname', label: localize('postgres.dbname', "Database"), kind: 'text', defaultValue: '', placeholder: 'postgres' },
			{ id: 'user', label: localize('postgres.user', "Username"), kind: 'text', defaultValue: '' },
			{ id: 'promptPassword', label: localize('postgres.promptPassword', "Ask for Password in the REPL"), kind: 'checkbox', defaultValue: true, description: localize('postgres.promptPassword.description', "Otherwise libpq uses PGPASSWORD or ~/.pgpass") },
			{ id: 'sslmode', label: localize('postgres.sslmode', "SSL Mode"), kind: 'select', defaultValue: 'prefer', options: ['disable', 'allow', 'prefer', 'require', 'verify-ca', 'verify-full'] },
			{ id: 'connectTimeout', label: localize('postgres.connectTimeout', "Connection Timeout (s)"), kind: 'number', defaultValue: '10' },
		],
	},
	{
		id: 'sqlite',
		label: 'SQLite',
		description: localize('sqlite.description', "Single-file database. The file is created if it does not exist."),
		packages: ['SQLite', 'DBInterface'],
		fields: [
			{ id: 'path', label: localize('sqlite.path', "Database File"), kind: 'file', defaultValue: '', placeholder: 'data.sqlite', required: true },
		],
	},
];

export function getDatabaseDriver(id: DatabaseDriverId): IDatabaseDriver {
	const driver = DATABASE_DRIVERS.find(d => d.id === id);
	if (!driver) {
		throw new Error(`Unknown database driver: ${id}`);
	}
	return driver;
}

/** The value of a driver field in a profile, falling back to the field's default. */
function fieldValue(profile: IDatabaseConnectionProfile, id: string): string | boolean {
	const value = profile.options[id];
	if (value !== undefined) {
		return typeof value === 'string' ? value.trim() : value;
	}
	return getDatabaseDriver(profile.driver).fields.find(f => f.id === id)?.defaultValue ?? '';
}

function stringValue(profile: IDatabaseConnectionProfile, id: string): string {
	const value = fieldValue(profile, id);
	return typeof value === 'string' ? value : '';
}

/** A Julia string literal holding `value`. */
export function juliaString(value: string): string {
	return '"' + value.replace(/[\\"$]/g, c => '\\' + c) + '"';
}

/** A libpq conninfo value, quoted when it is empty or holds spaces, quotes or backslashes. */
function conninfoValue(value: string): string {
	return /^[^\s'\\]+$/.test(value) ? value : `'${value.replace(/[\\']/g, c => '\\' + c)}'`;
}

/** Whether `name` can be used as a Julia variable name. */
export function isValidJuliaIdentifier(name: string): boolean {
	return /^[A-Za-z_][A-Za-z0-9_!]*$/.test(name);
}

/** Whether a connection is an in-memory DuckDB database, whose data is lost when it is closed. */
export function isInMemoryConnection(profile: IDatabaseConnectionProfile): boolean {
	const path = stringValue(profile, 'path');
	return profile.driver === 'duckdb' && (!path || path === ':memory:');
}

/** Whether a connection is a saved DuckDB database, not built in and not read-only, that tables can be written to. */
export function isWritableConnection(profile: IDatabaseConnectionProfile | undefined): boolean {
	return !!profile && profile.driver === 'duckdb' && !profile.builtin && !(stringValue(profile, 'path') && fieldValue(profile, 'readonly') === true);
}

/** A short description of where a connection points, e.g. `:memory:` or `user@host:5432/db`. */
export function describeConnection(profile: IDatabaseConnectionProfile): string {
	switch (profile.driver) {
		case 'duckdb':
			return stringValue(profile, 'path') || ':memory:';
		case 'odbc': {
			// The data source name, or the server of a connection string; never the rest of the string
			const source = stringValue(profile, 'source');
			const user = stringValue(profile, 'user');
			const settings = new Map(source.split(';').map(pair => pair.split('=')).filter(pair => pair.length > 1).map(([key, ...value]) => [key.trim().toLowerCase(), value.join('=').trim()]));
			const where = !source.includes('=') ? source : settings.get('dsn') || settings.get('server') || settings.get('host') || settings.get('driver') || 'ODBC';
			return `${user ? user + '@' : ''}${where}`;
		}
		case 'sqlite':
			return stringValue(profile, 'path');
		case 'postgres': {
			const user = stringValue(profile, 'user');
			const port = stringValue(profile, 'port');
			const dbname = stringValue(profile, 'dbname');
			return `${user ? user + '@' : ''}${stringValue(profile, 'host')}${port ? ':' + port : ''}${dbname ? '/' + dbname : ''}`;
		}
	}
}

/** The problems that stop a profile from being saved, as user-facing messages. Empty when valid. */
export function validateConnectionProfile(profile: IDatabaseConnectionProfile): string[] {
	const problems: string[] = [];
	if (!profile.name.trim()) {
		problems.push(localize('validate.name', "Enter a connection name."));
	}
	if (!isValidJuliaIdentifier(profile.variable)) {
		problems.push(localize('validate.variable', "The variable name must start with a letter or underscore and hold only letters, digits and underscores."));
	}
	for (const field of getDatabaseDriver(profile.driver).fields) {
		const value = fieldValue(profile, field.id);
		if (field.required && !value) {
			problems.push(localize('validate.required', "Enter a value for {0}.", field.label));
		} else if (field.kind === 'number' && typeof value === 'string' && value && !/^\d+$/.test(value)) {
			problems.push(localize('validate.number', "{0} must be a whole number.", field.label));
		}
	}
	if (isWrdsConnection(profile) && !stringValue(profile, 'user')) {
		problems.push(localize('validate.wrdsUser', "Enter your WRDS username."));
	}
	// A profile never holds a password: it is saved in plain text
	if (profile.driver === 'odbc' && /(^|;)\s*(pwd|password)\s*=/i.test(stringValue(profile, 'source'))) {
		problems.push(localize('validate.odbcPassword', "Leave the password out of the connection string: Pollis asks for it in the REPL."));
	}
	return problems;
}

/** The Julia code that opens the connection described by `profile`. */
export function generateConnectionCode(profile: IDatabaseConnectionProfile): string {
	const driver = getDatabaseDriver(profile.driver);
	const lines = [`using ${driver.packages.join(', ')}`];
	const variable = profile.variable;
	switch (profile.driver) {
		case 'duckdb': {
			const path = stringValue(profile, 'path');
			const readonly = path && fieldValue(profile, 'readonly') === true ? '; readonly = true' : '';
			lines.push(`${variable} = DBInterface.connect(DuckDB.DB, ${juliaString(path || ':memory:')}${readonly})`);
			break;
		}
		case 'odbc': {
			const manager = stringValue(profile, 'driverManager');
			if (manager === 'unixODBC' || manager === 'iODBC') {
				lines.push(`ODBC.set${manager}()`);
			}
			const user = stringValue(profile, 'user');
			const credentials = [
				...(user ? [`user = ${juliaString(user)}`] : []),
				...(fieldValue(profile, 'promptPassword') === true ? ['password = password'] : []),
			];
			if (fieldValue(profile, 'promptPassword') === true) {
				// Typed into the REPL, never in the code, the history or a file; ODBC.jl shreds it once connected
				lines.push(`password = Base.getpass(${juliaString(`Password for ${describeConnection(profile)}`)})`);
			}
			lines.push(`${variable} = DBInterface.connect(ODBC.Connection, ${juliaString(stringValue(profile, 'source'))}${credentials.length ? '; ' + credentials.join(', ') : ''})`);
			break;
		}
		case 'sqlite':
			lines.push(`${variable} = DBInterface.connect(SQLite.DB, ${juliaString(stringValue(profile, 'path'))})`);
			break;
		case 'postgres': {
			const parts = [
				['host', stringValue(profile, 'host')],
				['port', stringValue(profile, 'port')],
				['dbname', stringValue(profile, 'dbname')],
				['user', stringValue(profile, 'user')],
				['sslmode', stringValue(profile, 'sslmode')],
				['connect_timeout', stringValue(profile, 'connectTimeout')],
			].filter(([, value]) => value).map(([key, value]) => `${key}=${conninfoValue(value)}`);
			const connect = `DBInterface.connect(LibPQ.Connection, ${juliaString(parts.join(' '))})`;
			// WRDS signs in only once a Duo push is approved on the phone
			const duo = isWrdsConnection(profile) ? ['println("WRDS: approve the Duo push on your phone to connect")'] : [];
			if (fieldValue(profile, 'promptPassword') === true) {
				// The password is typed into the REPL and handed to libpq through PGPASSWORD for the
				// duration of the call only, so it never appears in the code, the history or a file.
				const account = describeConnection({ ...profile, options: { ...profile.options, dbname: '' } });
				lines.push(
					`password = Base.getpass(${juliaString(`Password for ${account}`)})`,
					...duo,
					`${variable} = withenv("PGPASSWORD" => read(password, String)) do`,
					`\t${connect}`,
					'end',
					'Base.shred!(password)',
				);
			} else {
				lines.push(...duo, `${variable} = ${connect}`);
			}
			break;
		}
	}
	return lines.join('\n');
}

/**
 * The code that connects `profile` in the Julia REPL and shows it in the Databases view, through
 * the PollisDB module the REPL loads at startup. A connection the REPL already holds is closed
 * first, so a database file is not opened twice. DuckDB is the default engine, so its code first
 * installs the DuckDB.jl package on the user's machine, the first time only (Pollis does not ship it),
 * and the built-in database first makes its file from the PollisDatasets, when they have changed (PollisRSS, its views
 * over the archive of the RSS feeds, when missing; PollisJournals, from the journals of PollisJournals.jl; PollisReferences,
 * from the references of Pollis; PollisBenchmarks, from the benchmarks of PollisBenchmarks.jl). PollisDocuments is made when the Julia REPL starts, after the documents are compiled,
 * and needs nothing here; nor does Comparisons, the copy of the runs of the Evaluate and Benchmark pages, which needs only to be there.
 */
export function generateSessionConnectCode(profile: IDatabaseConnectionProfile, connected: boolean): string {
	const id = juliaString(profile.id);
	return [
		...(connected ? [`PollisDB.disconnect(${id})`] : []),
		...(profile.driver === 'duckdb' ? ['PollisDB.install()'] : []),
		...(profile.builtin && profile.id === COMPARISONS_DATABASE_ID ? [`isfile(${juliaString(stringValue(profile, 'path'))}) || error(${juliaString(localize('comparisons.noCopy', "Comparisons has no runs yet: Pollis makes it when an Evaluate or Benchmark page first opens."))})`] : []),
		...(profile.builtin && profile.id !== DOCUMENTS_DATABASE_ID && profile.id !== COMPARISONS_DATABASE_ID ? [profile.id === RSS_DATABASE_ID ? 'PollisDB.build_rss()' : profile.id === JOURNALS_DATABASE_ID ? 'PollisDB.build_journals()' : profile.id === REFERENCES_DATABASE_ID ? 'PollisDB.build_references()' : profile.id === BENCHMARKS_DATABASE_ID ? 'PollisDB.build_benchmarks()' : 'PollisDB.build()'] : []),
		generateConnectionCode(profile),
		`PollisDB.register(${id}, ${profile.variable}; name = ${juliaString(profile.name)})`,
	].join('\n');
}

/** The code that closes the REPL connection `id` and removes it from the Databases view. */
export function generateSessionDisconnectCode(id: string): string {
	return `PollisDB.disconnect(${juliaString(id)})`;
}

/** The code that reads the tables of `schema` of the REPL connection `id`, a database whose schemas are listed first. */
export function generateOpenSchemaCode(id: string, schema: string): string {
	return `PollisDB.open_schema(${juliaString(id)}, ${juliaString(schema)})`;
}

/** The code that re-reads the schemas of the REPL connection `id`, or of every one. */
export function generateSessionRefreshCode(id?: string): string {
	return id === undefined ? 'PollisDB.refresh()' : `PollisDB.refresh(${juliaString(id)})`;
}

/** A quoted SQL name, e.g. `"main"."sales"`. */
export function quoteSqlName(...parts: string[]): string {
	return parts.map(p => '"' + p.replace(/"/g, '""') + '"').join('.');
}

/** The code that prints the first rows of a table of the REPL connection `id`. */
export function generatePreviewCode(id: string, schema: string, table: string): string {
	return `PollisDB.preview(${juliaString(id)}, ${juliaString(quoteSqlName(schema, table))})`;
}

/** The code that opens a table of the REPL connection `id` in the Table Viewer. */
export function generateBrowseCode(id: string, schema: string, table: string): string {
	return `PollisDB.browse(${juliaString(id)}, ${juliaString(quoteSqlName(schema, table))}; title = ${juliaString(table)})`;
}

/** `name`, quoted only when SQL needs it. */
export function sqlName(name: string): string {
	return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : quoteSqlName(name);
}

/**
 * Where the code of a task of the Databases view runs: in a notebook cell, whose kernel does not have
 * the connections of the Julia REPL, or in the Julia REPL, where the connection of the view is used.
 */
export type DatabaseTaskTarget = 'notebook' | 'repl';

/** A file format DuckDB writes with `COPY ... TO`. */
export type DatabaseExportFormat = 'parquet' | 'csv' | 'json';

/**
 * The code that runs `body` on the connection of `profile`. In a notebook, the cell connects once, as
 * the view does; in the Julia REPL, a database the view has not connected is connected first, so it
 * appears in the view.
 */
function taskCode(profile: IDatabaseConnectionProfile, target: DatabaseTaskTarget, connected: boolean, body: string[]): string {
	if (target === 'repl') {
		return [...(connected ? [] : [generateSessionConnectCode(profile, false)]), 'using Tables', '', ...body].join('\n');
	}
	const [using, ...connect] = generateConnectionCode(profile).split('\n');
	return [
		...(profile.driver === 'duckdb' ? ['isdefined(Main, :PollisDB) && PollisDB.install()  # DuckDB is built into Pollis'] : []),
		`${using}, Tables`,
		'',
		`if !isdefined(Main, :${profile.variable})  # connect once, as the Databases view does`,
		...connect.map(line => '\t' + line),
		'end',
		'',
		...body,
	].join('\n');
}

/**
 * The code that runs `body` in the Julia REPL on the connection of `profile`, connecting it first when the Databases view
 * has not, as the tasks of the view do.
 */
export function generateReplTaskCode(profile: IDatabaseConnectionProfile, connected: boolean, body: readonly string[]): string {
	return taskCode(profile, 'repl', connected, [...body]);
}

/** Where {@link sqlWithFile} puts the file: a character no SQL name of the view holds. */
const FILE_MARK = '\u0001';

/** A Julia string holding `sql`, with `$file` at {@link FILE_MARK}, quoted for SQL when `file` needs it. */
function sqlWithFile(sql: string, file: string): string {
	return juliaString(sql).replace(FILE_MARK, () => file.includes('\'') ? `$(replace(file, "'" => "''"))` : '$file');
}

/** The lines that count the rows of `table` and show it in the Databases view. */
function tableWrittenLines(profile: IDatabaseConnectionProfile, table: string): string[] {
	return [
		`n = first(Tables.columntable(DBInterface.execute(${profile.variable}, ${juliaString(`SELECT count(*) AS n FROM ${table}`)})).n)`,
		`println(${juliaString(`Table ${table}: `)}, n, " rows")`,
		`isdefined(Main, :PollisDB) && PollisDB.refresh(${juliaString(profile.id)})  # shows the table in the Databases view`,
	];
}

/**
 * The code of the Query task: an example query, to edit, on `table` of `schema`, or one that lists the
 * tables of the database.
 */
export function generateQueryTaskCode(profile: IDatabaseConnectionProfile, target: DatabaseTaskTarget, connected: boolean, schema?: string, table?: string): string {
	const odbc = profile.driver === 'odbc';
	if (odbc && (schema === undefined || table === undefined)) {
		// The databases of ODBC have no catalog query in common (Oracle has no information_schema): ODBC lists the tables itself
		return taskCode(profile, target, connected, [
			`tbl = Tables.columntable(ODBC.tables(${profile.variable}; tabletype = "TABLE,VIEW"))  # named tuple of column vectors`,
			'println(length(first(tbl)), " tables and views")',
			'println(Tables.schema(tbl))',
		]);
	}
	const sql = odbc
		? `SELECT * FROM ${sqlName(schema!)}.${sqlName(table!)}`
		: schema !== undefined && table !== undefined
			? `SELECT * FROM ${sqlName(schema)}.${sqlName(table)} LIMIT 10`
			: profile.driver === 'sqlite'
				? `SELECT type, name FROM sqlite_master WHERE type IN ('table', 'view') ORDER BY name`
				: `SELECT table_schema, table_name, table_type FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'pg_catalog') ORDER BY 1, 2`;
	return taskCode(profile, target, connected, [
		// No row limit is written in every database's SQL alike
		...(odbc ? ['# The first rows only: LIMIT 10 at the end (MySQL, Snowflake), TOP 10 after SELECT (SQL Server) or FETCH FIRST 10 ROWS ONLY at the end (Oracle, Db2)'] : []),
		'sql = raw"""',
		sql,
		'"""',
		`tbl = Tables.columntable(DBInterface.execute(${profile.variable}, sql))  # named tuple of column vectors`,
		'println(length(first(tbl)), " rows x ", length(tbl), " columns")',
		'println(Tables.schema(tbl))',
	]);
}

/** The DuckDB function that reads `file`, by its extension. */
function duckdbReader(file: string): string {
	return /\.parquet$/i.test(file) ? 'read_parquet' : /\.(json|jsonl|ndjson)$/i.test(file) ? 'read_json' : 'read_csv';
}

/** The code of the Import File task: a CSV, Parquet or JSON file read into `table` of a DuckDB database. */
export function generateImportTaskCode(profile: IDatabaseConnectionProfile, target: DatabaseTaskTarget, connected: boolean, file: string, table: string, append: boolean): string {
	const name = sqlName(table);
	const reader = duckdbReader(file);
	return taskCode(profile, target, connected, [
		`file = ${juliaString(file)}`,
		`DBInterface.execute(${profile.variable}, ${sqlWithFile(append ? `INSERT INTO ${name} SELECT * FROM ${reader}('${FILE_MARK}')` : `CREATE OR REPLACE TABLE ${name} AS SELECT * FROM ${reader}('${FILE_MARK}')`, file)})`,
		...tableWrittenLines(profile, name),
	]);
}

/** The code of the Save Table task: the Julia table `variable` written to `table` of a DuckDB database. */
export function generateSaveTaskCode(profile: IDatabaseConnectionProfile, target: DatabaseTaskTarget, connected: boolean, variable: string, table: string, append: boolean): string {
	const name = sqlName(table);
	return taskCode(profile, target, connected, [
		`DuckDB.register_table(${profile.variable}, Tables.columntable(${variable}), "julia_data")  # a view of the Julia columns, not a copy`,
		`DBInterface.execute(${profile.variable}, ${juliaString(append ? `INSERT INTO ${name} SELECT * FROM julia_data` : `CREATE OR REPLACE TABLE ${name} AS SELECT * FROM julia_data`)})`,
		`DuckDB.unregister_table(${profile.variable}, "julia_data")`,
		...tableWrittenLines(profile, name),
	]);
}

/**
 * The code of the Export task: `table` of `schema` written to `file`, by DuckDB in `format`, or, from
 * the other engines, as CSV by CSV.jl.
 */
export function generateExportTaskCode(profile: IDatabaseConnectionProfile, target: DatabaseTaskTarget, connected: boolean, schema: string, table: string, file: string, format: DatabaseExportFormat): string {
	const select = `SELECT * FROM ${sqlName(schema)}.${sqlName(table)}`;
	return taskCode(profile, target, connected, [
		...(profile.driver === 'duckdb'
			? [
				`file = ${juliaString(file)}`,
				`DBInterface.execute(${profile.variable}, ${sqlWithFile(`COPY (${select}) TO '${FILE_MARK}' (FORMAT ${format})`, file)})`,
			]
			: [
				'using CSV',
				'',
				`file = ${juliaString(file)}`,
				`CSV.write(file, Tables.columntable(DBInterface.execute(${profile.variable}, ${juliaString(select)})))`,
			]),
		'println("Wrote ", file, " (", filesize(file), " bytes)")',
	]);
}
