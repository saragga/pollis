/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The LaTeX source of an article as arXiv gives it (arxiv.org/e-print/<id>): a tar archive, gzipped, of its files, or,
// for an older article, its one .tex gzipped. The source kept is one file: its main .tex, the one with
// \documentclass and \begin{document}, with each file it \input or \include written in its place.

import { VSBuffer } from '../../../../base/common/buffer.js';

/** How deep files \input in files \input are followed. */
const INPUT_DEPTH = 10;

/** Whether the bytes are gzipped. */
function isGzip(bytes: Uint8Array): boolean {
	return bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
}

/** The bytes gzipped, unzipped, with the browser's DecompressionStream. */
async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
	const stream = new Blob([bytes as Uint8Array<ArrayBuffer>]).stream().pipeThrough(new DecompressionStream('gzip'));
	return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** A field of a tar header: its bytes up to the first zero, as text. */
function field(bytes: Uint8Array, start: number, length: number): string {
	const end = bytes.subarray(start, start + length).indexOf(0);
	return new TextDecoder().decode(bytes.subarray(start, end < 0 ? start + length : start + end));
}

/** Whether the bytes are a tar archive: "ustar" in its first header. */
function isTar(bytes: Uint8Array): boolean {
	return bytes.length >= 512 && field(bytes, 257, 5) === 'ustar';
}

/** The files of a tar archive, by their paths: those of ustar, of GNU long names and of pax headers. */
function untar(bytes: Uint8Array): Map<string, Uint8Array> {
	const files = new Map<string, Uint8Array>();
	let longName: string | undefined;
	for (let offset = 0; offset + 512 <= bytes.length;) {
		const name = field(bytes, offset, 100);
		if (!name) {
			break;
		}
		const size = parseInt(field(bytes, offset + 124, 12).trim() || '0', 8);
		const type = String.fromCharCode(bytes[offset + 156] || 48);
		const prefix = field(bytes, offset + 345, 155);
		const content = bytes.subarray(offset + 512, offset + 512 + size);
		if (type === 'L') {
			longName = new TextDecoder().decode(content).replace(/\0+$/, '');
		} else if (type === 'x') {
			longName = /(?:^|\n)\d+ path=(?<path>[^\n]*)\n/.exec(new TextDecoder().decode(content))?.groups?.path ?? longName;
		} else {
			if (type === '0' || type === '7') {
				files.set((longName ?? (prefix ? `${prefix}/${name}` : name)).replace(/^\.\//, ''), content);
			}
			longName = undefined;
		}
		offset += 512 + Math.ceil(size / 512) * 512;
	}
	return files;
}

/** The folder of a path in the archive, with its slash; "" at its top. */
function folderOf(path: string): string {
	const slash = path.lastIndexOf('/');
	return slash < 0 ? '' : path.slice(0, slash + 1);
}

/** The text of `file` with each file it \input or \include written in its place, as far as they are in `texts`. */
function inline(texts: ReadonlyMap<string, string>, file: string, depth: number, seen: Set<string>): string {
	seen.add(file);
	return (texts.get(file) ?? '').replace(/\\(?:input|include)\s*\{(?<name>[^{}]+)\}/g, (command: string, name: string) => {
		const path = [name, `${name}.tex`].map(candidate => candidate.trim().replace(/^\.\//, '')).flatMap(candidate => [folderOf(file) + candidate, candidate]).find(candidate => texts.has(candidate));
		return path && depth < INPUT_DEPTH && !seen.has(path) ? inline(texts, path, depth + 1, seen) : command;
	});
}

/**
 * The LaTeX source of an article, as one file, from what arXiv gives as its source; undefined when it gives none, as for
 * an article it has only as a PDF.
 */
export async function latexSourceOf(content: VSBuffer): Promise<string | undefined> {
	let bytes: Uint8Array = content.buffer;
	if (isGzip(bytes)) {
		bytes = await gunzip(bytes);
	}
	const decoder = new TextDecoder();
	if (!isTar(bytes)) {
		const text = decoder.decode(bytes);
		return /\\documentclass/.test(text) && /\\begin\s*\{document\}/.test(text) ? text : undefined;
	}
	const texts = new Map<string, string>();
	for (const [path, file] of untar(bytes)) {
		if (/\.(?:tex|ltx)$/i.test(path)) {
			texts.set(path, decoder.decode(file));
		}
	}
	// The main file: the one with \documentclass and \begin{document}, nearest the top, then the longest
	const main = [...texts].filter(([, text]) => /\\documentclass/.test(text) && /\\begin\s*\{document\}/.test(text))
		.sort(([a, x], [b, y]) => a.split('/').length - b.split('/').length || y.length - x.length)[0]?.[0];
	return main === undefined ? undefined : inline(texts, main, 0, new Set());
}
