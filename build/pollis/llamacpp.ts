/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// llama.cpp in the packaged app: llama-server and the libraries it loads, from llama.cpp's CPU build
// for the platform (with Metal on macOS), in llama.cpp/. Pollis runs it for local chat and embedding
// models in GGUF files. The GPU builds of Windows and Linux (Vulkan, CUDA) are not shipped.
//
// In a development build, `npm run gulp fetch-llama-cpp` puts it in .build/llama.cpp/.

import * as path from 'path';
import es from 'event-stream';
import filter from 'gulp-filter';
import flatmap from 'gulp-flatmap';
import gunzip from 'gulp-gunzip';
import rename from 'gulp-rename';
import vzip from 'gulp-vinyl-zip';
import type File from 'vinyl';
import { fetchUrls } from '../lib/fetch.ts';
import { untar } from '../lib/util.ts';

/** The llama.cpp release Pollis ships. */
const LLAMA_CPP_VERSION = 'b11913';

/** The CPU build of that release for each platform Pollis can be built for, with the checksum of its archive. */
const BUILDS: Record<string, { readonly archive: string; readonly sha256: string }> = {
	'darwin-arm64': { archive: 'macos-arm64.tar.gz', sha256: 'd5b7b56c275624be373d2ab064b68dee2a3571e852657482cce75cbb5cb143b2' },
	'darwin-x64': { archive: 'macos-x64.tar.gz', sha256: 'b19a9c08544114b02e8e3dd688ed83f6983339e56d85aa455dd8a06df51c7c30' },
	'linux-x64': { archive: 'ubuntu-x64.tar.gz', sha256: 'c670ad826f59478db859c9d4a0d931ab9eb653f22b7e0adebd70816c4092aab5' },
	'linux-arm64': { archive: 'ubuntu-arm64.tar.gz', sha256: 'bb4f3daf4633fcac5eff5ea055c3ca9df3f4cc074d1d848f1c5abcdf4e435d89' },
	'win32-x64': { archive: 'win-cpu-x64.zip', sha256: '55b31ccaf398e90457cfe28087297f5f3fdf1e3bfa7a28e1108f13d0af8e4621' },
	'win32-arm64': { archive: 'win-cpu-arm64.zip', sha256: '8316a4de47ff9b2685bb73e0f4b1377fd54b63b0b1b1527fe31237f6ea4eae32' },
};

/** llama.cpp's MIT licence at that release, which the Windows archives lack. */
const LICENSE_SHA256 = '94f29bbed6a22c35b992c5c6ebf0e7c92f13b836b90f36f461c9cf2f0f1d010d';

/**
 * llama-server and the libraries it needs: every shared library of the archive except those of
 * llama.cpp's other tools (llama-cli-impl, llama-bench-impl, ...), and the licence of OpenMP on Windows.
 */
function isServerFile(file: File): boolean {
	const name = path.basename(file.path);
	if (name === 'llama-server' || name === 'llama-server.exe' || name === 'LICENSE-LLVM-OpenMP') {
		return true;
	}
	return /\.(dylib|dll|so(\.\d+)*)$/.test(name) && (!/-impl\./.test(name) || /^(lib)?llama-server-impl\./.test(name));
}

/**
 * The binaries load each library by its major version (libllama.0.dylib, libllama.so.0), which the
 * archives give as a symlink to the fully versioned file (libllama.0.7.0.dylib, libllama.so.0.7.0).
 * untar() skips symlinks, so the file itself takes that name.
 */
function majorVersionName(name: string): string {
	return name.replace(/^(.+\.\d+)\.\d+\.\d+\.dylib$/, '$1.dylib').replace(/^(.+\.so\.\d+)\.\d+\.\d+$/, '$1');
}

/** llama-server for the platform, with its libraries and licence, in llama.cpp/; nothing where llama.cpp has no build. */
export function llamaCppStream(platform: string, arch: string): NodeJS.ReadWriteStream {
	const build = BUILDS[`${platform}-${arch}`];
	if (!build) {
		return es.readArray([]);
	}
	const archive = fetchUrls(`/${LLAMA_CPP_VERSION}/llama-${LLAMA_CPP_VERSION}-bin-${build.archive}`, { base: 'https://github.com/ggml-org/llama.cpp/releases/download', checksumSha256: build.sha256 });
	const server = (build.archive.endsWith('.zip') ? archive.pipe(vzip.src()) : archive.pipe(flatmap(stream => stream.pipe(gunzip()).pipe(untar()))))
		.pipe(filter(isServerFile))
		.pipe(rename(p => {
			p.basename = majorVersionName(`${p.basename ?? ''}${p.extname ?? ''}`);
			p.extname = '';
			p.dirname = 'llama.cpp';
		}));
	const license = fetchUrls(`/ggml-org/llama.cpp/${LLAMA_CPP_VERSION}/LICENSE`, { base: 'https://raw.githubusercontent.com', checksumSha256: LICENSE_SHA256 })
		.pipe(rename('llama.cpp/LICENSE'));
	return es.merge(server, license);
}
