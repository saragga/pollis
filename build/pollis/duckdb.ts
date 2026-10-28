/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// DuckDB in the packaged app. The engine, libduckdb, comes with @duckdb/node-api, next to its
// duckdb.node in node_modules.asar.unpacked/@duckdb/node-bindings-<platform>-<arch>/; the fts
// extension, full-text search, is downloaded from DuckDB's extension repository and shipped compressed as
// duckdb/fts.duckdb_extension.gz. At install, the Julia extension of Pollis copies the engine and
// unpacks fts into ~/.pollis/duckdb/ (extensions/language-julia/src/pollisDuckDB.ts).
//
// In a development build, `npm run gulp fetch-duckdb-fts` puts fts in .build/duckdb/.

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

/** fts for each platform Pollis can be built for, with the checksum of its .gz. */
const FTS: Record<string, { readonly platform: string; readonly sha256: string }> = {
	'darwin-arm64': { platform: 'osx_arm64', sha256: 'b65dbb5f976a0a345bafc72417280942837ed93231640aaf74167a894b65f8c2' },
	'darwin-x64': { platform: 'osx_amd64', sha256: 'b31b8995e82427ba9f6e2449e0c15efad415be03e4cf847cab6b75c86339cec0' },
	'linux-x64': { platform: 'linux_amd64', sha256: '9a1804e36281efe7e4eed976668e2bf30422fad5f02ec58e2604c3a72bf3e8cf' },
	'linux-arm64': { platform: 'linux_arm64', sha256: '85cb92507e4b2a385a2e0228be301f45253ac1888ea454863b8e7eb0e6369410' },
	'win32-x64': { platform: 'windows_amd64', sha256: '02162f1acb5e6da4c6b154bb11e8161d9f535bab29a584a95101d6c77922611a' },
	'win32-arm64': { platform: 'windows_arm64', sha256: 'dac88a671803897978762dc3835ab5df94015ed982b067a0851b32d57cfd8df7' },
};

/**
 * The fts extension for the platform, compressed, as duckdb/fts.duckdb_extension.gz; nothing for a
 * platform not in `FTS`.
 */
export function ftsStream(platform: string, arch: string): NodeJS.ReadWriteStream {
	const fts = FTS[`${platform}-${arch}`];
	if (!fts) {
		return es.readArray([]);
	}
	return fetchUrls(`/${DUCKDB_VERSION}/${fts.platform}/fts.duckdb_extension.gz`, { base: 'https://extensions.duckdb.org', checksumSha256: fts.sha256 })
		.pipe(rename('duckdb/fts.duckdb_extension.gz'));
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
