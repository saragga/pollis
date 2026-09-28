/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';

/** The database engines a connection can target. Each one connects through DBInterface.jl. */
export type DatabaseDriverId = 'duckdb' | 'sqlite' | 'postgres';

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
}

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
		id: 'sqlite',
		label: 'SQLite',
		description: localize('sqlite.description', "Single-file database. The file is created if it does not exist."),
		packages: ['SQLite', 'DBInterface'],
		fields: [
			{ id: 'path', label: localize('sqlite.path', "Database File"), kind: 'file', defaultValue: '', placeholder: 'data.sqlite', required: true },
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
function juliaString(value: string): string {
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

/** A short description of where a connection points, e.g. `:memory:` or `user@host:5432/db`. */
export function describeConnection(profile: IDatabaseConnectionProfile): string {
	switch (profile.driver) {
		case 'duckdb':
			return stringValue(profile, 'path') || ':memory:';
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
			if (fieldValue(profile, 'promptPassword') === true) {
				// The password is typed into the REPL and handed to libpq through PGPASSWORD for the
				// duration of the call only, so it never appears in the code, the history or a file.
				const account = describeConnection({ ...profile, options: { ...profile.options, dbname: '' } });
				lines.push(
					`password = Base.getpass(${juliaString(`Password for ${account}`)})`,
					`${variable} = withenv("PGPASSWORD" => read(password, String)) do`,
					`\t${connect}`,
					'end',
					'Base.shred!(password)',
				);
			} else {
				lines.push(`${variable} = ${connect}`);
			}
			break;
		}
	}
	return lines.join('\n');
}

/**
 * The code that connects `profile` in the Julia REPL and shows it in the Databases view, through
 * the PollisDB module the REPL loads at startup. A connection the REPL already holds is closed
 * first, so a database file is not opened twice.
 */
export function generateSessionConnectCode(profile: IDatabaseConnectionProfile, connected: boolean): string {
	const id = juliaString(profile.id);
	return [
		...(connected ? [`PollisDB.disconnect(${id})`] : []),
		generateConnectionCode(profile),
		`PollisDB.register(${id}, ${profile.variable}; name = ${juliaString(profile.name)})`,
	].join('\n');
}

/** The code that closes the REPL connection `id` and removes it from the Databases view. */
export function generateSessionDisconnectCode(id: string): string {
	return `PollisDB.disconnect(${juliaString(id)})`;
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
