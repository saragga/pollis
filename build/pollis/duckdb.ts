/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// DuckDB in the packaged app. The engine, libduckdb, comes with @duckdb/node-api, next to its
// duckdb.node in node_modules.asar.unpacked/@duckdb/node-bindings-<platform>-<arch>/; the Lance
// extension is downloaded from DuckDB's extension repository and shipped compressed as
// duckdb/lance.duckdb_extension.gz. At install, the Julia extension of Pollis copies the engine and
// unpacks Lance into ~/.pollis/duckdb/ (extensions/language-julia/src/pollisDuckDB.ts).
//
// In a development build, `npm run gulp fetch-duckdb-lance` puts Lance in .build/duckdb/.

import * as cp from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import es from 'event-stream';
import rename from 'gulp-rename';
import type File from 'vinyl';
import { fetchUrls } from '../lib/fetch.ts';

/** The DuckDB release of @duckdb/node-api, whose extensions must match it. */
const DUCKDB_VERSION = 'v1.5.6';

/**
 * Lance for each platform Pollis can be built for, with the checksum of its .gz. DuckDB builds no
 * Lance for Intel Macs or Windows on Arm; Pollis there works without it.
 */
const LANCE: Record<string, { readonly platform: string; readonly sha256: string }> = {
	'darwin-arm64': { platform: 'osx_arm64', sha256: 'a6cd07feef91e48bae6ea00bccb4b5197a5afa10d712c7d20bda14c37ff6bfe5' },
	'linux-x64': { platform: 'linux_amd64', sha256: 'b6e9ef4a87e4cc970fcb87adf3463a5614b7b9678b59720c2f1aad75f9579808' },
	'linux-arm64': { platform: 'linux_arm64', sha256: '86b6d6f16c577f4755b7e86600c0628c98b0b5e09a0a8737ea714a6f0b0e308c' },
	'win32-x64': { platform: 'windows_amd64', sha256: 'cd0c7171b04a001247a245b237759cf9769b329cc3cefd65a37e2acd87fd0d5a' },
};

/**
 * The Lance extension for the platform, compressed, as duckdb/lance.duckdb_extension.gz; nothing
 * where DuckDB has no Lance.
 */
export function lanceStream(platform: string, arch: string): NodeJS.ReadWriteStream {
	const lance = LANCE[`${platform}-${arch}`];
	if (!lance) {
		return es.readArray([]);
	}
	return fetchUrls(`/${DUCKDB_VERSION}/${lance.platform}/lance.duckdb_extension.gz`, { base: 'https://extensions.duckdb.org', checksumSha256: lance.sha256 })
		.pipe(rename('duckdb/lance.duckdb_extension.gz'));
}

/**
 * On macOS, libduckdb comes as a universal library for both Apple silicon and Intel (117 MB); keep
 * only the architecture of the build (57 MB). The universal app is made from the two builds.
 */
export function thinDuckDB(platform: string, arch: string): NodeJS.ReadWriteStream {
	return es.map<File, File | void>((file, cb) => {
		if (platform !== 'darwin' || arch === 'universal' || !file.isBuffer() || path.basename(file.path) !== 'libduckdb.dylib') {
			return cb(undefined, file);
		}
		const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'pollis-duckdb-'));
		try {
			const universal = path.join(folder, 'universal.dylib');
			const thin = path.join(folder, 'thin.dylib');
			fs.writeFileSync(universal, file.contents);
			cp.execFileSync('lipo', [universal, '-thin', arch === 'x64' ? 'x86_64' : 'arm64', '-output', thin]);
			file.contents = fs.readFileSync(thin);
			cb(undefined, file);
		} catch (err) {
			cb(err as Error);
		} finally {
			fs.rmSync(folder, { recursive: true, force: true });
		}
	});
}
