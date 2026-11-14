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
const DUCKDB_VERSION = 'v2.0.0';

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
		'darwin-arm64': 'fa5eef362e1f004d19c08d76ed4ec47d181d8feb07ca3b528f3058ee8945362b',
		'darwin-x64': '9b9fe0d2925953f9b2ebb60f5914d5224b49e72fa36849b8372f80c980b7e454',
		'linux-x64': '9172520652ce609d163cf30645f382b197f2c7294448a816c77d62b0f029d96e',
		'linux-arm64': 'd233d2311825da4d9b6efb45edd52b126b18134c7d7083b1e58f6d450ebdabee',
		'win32-x64': 'd5328ff1569098d3e8651ab158e5cff8f4eb292986a7e1752300a653b3435e13',
		'win32-arm64': '950ec1a106863deed8a6bc20b2e70cca0e30904292ffc898d6f0362290a13f77',
	},
	quack: {
		'darwin-arm64': 'd6779fb4adf9835e31f3b34cfdb1444cec1dd3af8f5ca99071271a91bae52cfc',
		'darwin-x64': '7567cb63fe169a2b8332fa950ff24addb6d055950689c24c45a2d9781fc3b9c6',
		'linux-x64': 'f9a5c0d2e0eef0f7546aba4579ab80d75d167cdf48830459faf67378ab2000fe',
		'linux-arm64': '9f7938a11eb9ff8026ccc9c6403ac4a9b1ba347f8c12ecd815f86eea09ed6005',
		'win32-x64': '596440067461fae7d4d794e18d308b5daf1bbfcdbd0e14c7c700736aa59fd374',
		'win32-arm64': 'ff6c33ef0a2c7f1d636a24e1f8889ef54b132ae26bfe8b0ec1ed9644feed1668',
	},
	httpfs: {
		'darwin-arm64': '6aea2d728cb7eedb978ca264ce190e31284271e9ea4f68b2424bf20806b46638',
		'darwin-x64': '75b333cbf8c9a23eaaa9831166527020fd876ed772d1243c0af52027742d0a76',
		'linux-x64': 'ee6c7d7e60a5da1b6f6bf6156b4298b55ddce0496a5bfe628bd6ab6d47eb8e3e',
		'linux-arm64': 'f524888fc7d74cc0c6c4a8f7ed5beedac5b12e71cb426503f882c72ce6afbd43',
		'win32-x64': '39ff17b8403d45c6a3dce9cc8f0f9ff76c00ec94703a84977d65fd493341407d',
		'win32-arm64': '5da1f8986391c2c2a84bf98b218dc457a676eb87dc69548c9f16ac317ee3cf1d',
	},
	json: {
		'darwin-arm64': '90d83f1773b60ebf7534a956dfcbb5382c79621127e0789dcadaa90faf7518b5',
		'darwin-x64': '463f197146cb5abe7ce1542cdbe8a3da8d5ee068178cc10dda7ee4a02890c7cb',
		'linux-x64': '17dff05b452b5ec97865858eb3c8b5fe48f988a62f29e693ff2b7b5d0d5b4f1d',
		'linux-arm64': '4ba343c65a98c88e4de127c89d4b11fd342e4b0b8fd149fcae8d0a07c2d7596c',
		'win32-x64': 'b78d965f39ac081df5786d0852df5de18cc60f39047221d52d9018b87340e3e7',
		'win32-arm64': '8c8e72262381aa351a54ab5f883b1579c9d1d4c6e7b1f8bc0c934784f86f9e08',
	},
	excel: {
		'darwin-arm64': 'a9e38c4bf55bd482073f2d40c3a0c1334fadfa819ca1b7a0eb599a38936c4fd1',
		'darwin-x64': '956e419e082034f54a9b535f7d35aa595a19580bb79a479279f9d588f7e2b847',
		'linux-x64': '40a170558c7110eed04b631551f9ac13f854747a293986612e9922b6044b3821',
		'linux-arm64': 'c404d79e9ad928681db6ccf9dd73723922b02fc1c41a0c4c770baeef8f29911f',
		'win32-x64': 'e524d6f66e8d7b546c1038bf402241dc18bd556462f3de677c94f05ceb3a61ec',
		'win32-arm64': '0faf7115312e62e3a226cfca97075bc952214bb4d7d3f803d47e6fbc7ad35432',
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
