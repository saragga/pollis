/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// DuckDB in the packaged app. The engine, libduckdb, comes with @duckdb/node-api, next to its
// duckdb.node in node_modules.asar.unpacked/@duckdb/node-bindings-<platform>-<arch>/; its extensions fts
// (full-text search), quack (client and server), httpfs (HTTP, which quack needs), json and excel (the JSON and Excel
// formats) are downloaded from DuckDB's extension repository and shipped compressed as duckdb/<name>.duckdb_extension.gz.
// At install, the Julia extension of Pollis copies the engine and unpacks fts, quack and httpfs into ~/.pollis/duckdb/,
// and json and excel where DuckDB installs its extensions (extensions/language-julia/src/pollisDuckDB.ts).
//
// In a development build, `npm run gulp fetch-duckdb-extensions` puts them in .build/duckdb/.

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

/** DuckDB's platform names for the platforms Pollis can be built for. */
const PLATFORMS: Record<string, string> = {
	'darwin-arm64': 'osx_arm64',
	'darwin-x64': 'osx_amd64',
	'linux-x64': 'linux_amd64',
	'linux-arm64': 'linux_arm64',
	'win32-x64': 'windows_amd64',
	'win32-arm64': 'windows_arm64',
};

/**
 * The extensions Pollis ships, with the checksum of each one's .gz for each platform: fts, full-text search; quack,
 * which serves the Shared Session's database to the duckdb> terminal and the notebooks; httpfs, HTTP, on which quack
 * runs, loaded before it on both sides; and json and excel, which read and write JSON files and Excel workbooks.
 */
const EXTENSIONS: Record<string, Record<string, string>> = {
	fts: {
		'darwin-arm64': 'b65dbb5f976a0a345bafc72417280942837ed93231640aaf74167a894b65f8c2',
		'darwin-x64': 'b31b8995e82427ba9f6e2449e0c15efad415be03e4cf847cab6b75c86339cec0',
		'linux-x64': '9a1804e36281efe7e4eed976668e2bf30422fad5f02ec58e2604c3a72bf3e8cf',
		'linux-arm64': '85cb92507e4b2a385a2e0228be301f45253ac1888ea454863b8e7eb0e6369410',
		'win32-x64': '02162f1acb5e6da4c6b154bb11e8161d9f535bab29a584a95101d6c77922611a',
		'win32-arm64': 'dac88a671803897978762dc3835ab5df94015ed982b067a0851b32d57cfd8df7',
	},
	quack: {
		'darwin-arm64': '4738b82495795d77d859e87782714b5bc5e5ff0679ae6b388de3fef08c393b69',
		'darwin-x64': '906b8535162e82e81c5a133a94a400150cbc838c797a3de387e51fa7f09fcd6e',
		'linux-x64': 'ad8bb34b2f513bcac0d01b96af0406fd2025f8ee3d3b878e45e30d0e6eab7b04',
		'linux-arm64': 'db025c62bb79a4f50f935036b3a342c3579b3794a8c76a54814be7551e6873d6',
		'win32-x64': '485cffe767e9c385db21e5d123d155d649276ccb7830d9a95d9001a8ee5fba10',
		'win32-arm64': 'deac7c1535ad8d7fb64df1d5f7381c2cd27555fe311686af0fa7c907d2bc754c',
	},
	httpfs: {
		'darwin-arm64': 'b9f9ca8e64d913a80d6666a370e0e518ee4cc8ecb9990a2b9d2273204d8caad4',
		'darwin-x64': '788e9be58359aef4cf9ecc58ea053ba4cdb8d802729f1adbd5101c85ad36247f',
		'linux-x64': '19e6906934a845487c96f9c94beee250c71e32bb9be260eb27ad96939a1df5f0',
		'linux-arm64': 'b18472a0e85cbf15ca4ebbe335173f87b62a074cd0f26072d4c756205c6239d0',
		'win32-x64': 'e23aa882afd8aa24dacb8290920fec03b5188bb60038bdf6b963035a93d989cf',
		'win32-arm64': '7ed07527acc2dc7cc00e99b11bfd04891eb126b77cef75026f5c2ca5b32f79ac',
	},
	json: {
		'darwin-arm64': '52bd359cd06faadfe84e922125c5461ee47e1321182208f3cf827178ed53133c',
		'darwin-x64': 'b4c1dce345e5c4e5b5b21659e5116c4d668785cb7d6a5d2277f378a6268dfdd0',
		'linux-x64': '84c89b28f204e7b8cafc3a019a6c8bff26546d8ffc854b6c5c53e2a40cac6410',
		'linux-arm64': '24203b9f93415e6364ece00e2e3cf4ed96a2cf1a159083fca85eacea6c99abcf',
		'win32-x64': 'b0a0c053d3c6b5296bb19e8055c48f8ae434353bd136276a8fdba28840656774',
		'win32-arm64': 'cf5057a637b835536ac9faac7808a636c02b2281a5d2425df65b229c96e89731',
	},
	excel: {
		'darwin-arm64': '327c04c3b0c850592c50637f46e4d91e280978a393bc3b889f6d555aba08240d',
		'darwin-x64': '551bb3c1a8b8c579e9e308a74f9a70b18669461dc1789d0123931ad890172d12',
		'linux-x64': '7a257c48b971415ac1e6a429dd1fef31f5a2a6080ce21f207aa4946a753cb0f3',
		'linux-arm64': '7812ff6e1d73ac52fbbc5188d039dc4ceb2c44909466d6405c5abb282a17f0b2',
		'win32-x64': '37c0c8424bb572b5b2d8f2cbf714fc72db220e30d4f131b85cbdcd7408fc9ae5',
		'win32-arm64': '73d5a431dd8f0491e5146f4ee3bb004eb15ddbfcad8e214b88580b1f66f6a8c1',
	},
};

/**
 * The extensions for the platform, compressed, as duckdb/<name>.duckdb_extension.gz; nothing for a platform not in
 * `PLATFORMS`.
 */
export function duckdbExtensionsStream(platform: string, arch: string): NodeJS.ReadWriteStream {
	const key = `${platform}-${arch}`;
	const duckdbPlatform = PLATFORMS[key];
	if (!duckdbPlatform) {
		return es.readArray([]);
	}
	return es.merge(...Object.entries(EXTENSIONS).map(([name, checksums]) =>
		fetchUrls(`/${DUCKDB_VERSION}/${duckdbPlatform}/${name}.duckdb_extension.gz`, { base: 'https://extensions.duckdb.org', checksumSha256: checksums[key] })
			.pipe(rename(`duckdb/${name}.duckdb_extension.gz`))));
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
