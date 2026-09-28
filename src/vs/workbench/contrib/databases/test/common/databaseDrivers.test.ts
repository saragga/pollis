/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { DatabaseDriverId, describeConnection, generateConnectionCode, generatePreviewCode, generateSessionConnectCode, generateSessionDisconnectCode, generateSessionRefreshCode, IDatabaseConnectionProfile, quoteSqlName, validateConnectionProfile } from '../../common/databaseDrivers.js';

function profile(driver: DatabaseDriverId, options: Record<string, string | boolean>, variable = 'con'): IDatabaseConnectionProfile {
	return { id: 'id', name: 'Test', driver, target: 'global', variable, options };
}

suite('Database drivers', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('generates DBInterface connection code', () => {
		assert.deepStrictEqual([
			generateConnectionCode(profile('duckdb', {})),
			generateConnectionCode(profile('duckdb', { path: 'C:\\data\\sales.duckdb', readonly: true })),
			generateConnectionCode(profile('sqlite', { path: 'my "db".sqlite' }, 'db')),
			generateConnectionCode(profile('postgres', { host: 'db.example.com', dbname: 'sales data', user: 'ana', promptPassword: false })),
			generateConnectionCode(profile('postgres', { user: 'ana', port: '5433' })),
		], [
			'using DuckDB, DBInterface\ncon = DBInterface.connect(DuckDB.DB, ":memory:")',
			'using DuckDB, DBInterface\ncon = DBInterface.connect(DuckDB.DB, "C:\\\\data\\\\sales.duckdb"; readonly = true)',
			'using SQLite, DBInterface\ndb = DBInterface.connect(SQLite.DB, "my \\"db\\".sqlite")',
			'using LibPQ, DBInterface\ncon = DBInterface.connect(LibPQ.Connection, "host=db.example.com port=5432 dbname=\'sales data\' user=ana sslmode=prefer connect_timeout=10")',
			[
				'using LibPQ, DBInterface',
				'password = Base.getpass("Password for ana@localhost:5433")',
				'con = withenv("PGPASSWORD" => read(password, String)) do',
				'\tDBInterface.connect(LibPQ.Connection, "host=localhost port=5433 user=ana sslmode=prefer connect_timeout=10")',
				'end',
				'Base.shred!(password)',
			].join('\n'),
		]);
	});

	test('describes and validates profiles', () => {
		assert.deepStrictEqual([
			describeConnection(profile('duckdb', {})),
			describeConnection(profile('postgres', { user: 'ana', dbname: 'sales' })),
			validateConnectionProfile(profile('duckdb', {})).length,
			validateConnectionProfile(profile('sqlite', {}, '1con')).length,
			validateConnectionProfile(profile('postgres', { port: '54x' })).length,
		], [
			':memory:',
			'ana@localhost:5432/sales',
			0,
			2,
			1,
		]);
	});

	test('generates PollisDB session code', () => {
		assert.deepStrictEqual([
			generateSessionConnectCode(profile('duckdb', {}), false),
			generateSessionConnectCode(profile('duckdb', {}), true),
			generateSessionDisconnectCode('id'),
			generateSessionRefreshCode(),
			generateSessionRefreshCode('id'),
			generatePreviewCode('id', 'main', 'my "sales"'),
			quoteSqlName('hr', 'staff'),
		], [
			'PollisDB.install()\nusing DuckDB, DBInterface\ncon = DBInterface.connect(DuckDB.DB, ":memory:")\nPollisDB.register("id", con; name = "Test")',
			'PollisDB.disconnect("id")\nPollisDB.install()\nusing DuckDB, DBInterface\ncon = DBInterface.connect(DuckDB.DB, ":memory:")\nPollisDB.register("id", con; name = "Test")',
			'PollisDB.disconnect("id")',
			'PollisDB.refresh()',
			'PollisDB.refresh("id")',
			'PollisDB.preview("id", "\\"main\\".\\"my \\"\\"sales\\"\\"\\"")',
			'"hr"."staff"',
		]);
	});
});
