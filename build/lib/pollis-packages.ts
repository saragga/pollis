/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The data packages Pollis is built with, PollisReferences.jl and PollisRSS.jl: each is read from GitHub, at the commit
// in build/<Package>.commit, once, when the package is pinned (PollisRSS), otherwise from its main branch (PollisReferences).

import * as fs from 'fs';
import * as path from 'path';

/** A data package of Pollis: its name, the file of its data folder Pollis is built from, and the variable that names a clone of it. */
export interface IPollisPackage {
	readonly name: string;
	readonly file: string;
	readonly clone: string;
}

/**
 * The text of the data file of `pollisPackage` at the commit in build/<name>.commit, downloaded once into .build, or
 * on its main branch when there is no such file; or,
 * when the variable `pollisPackage.clone` names a clone of the package, its file as it is, to build with a change
 * before it is pushed.
 */
export async function pinnedPackageFile(repoRoot: string, pollisPackage: IPollisPackage): Promise<string> {
	const { name, file } = pollisPackage;
	const clone = process.env[pollisPackage.clone];
	if (clone) {
		return fs.readFileSync(path.join(clone, 'data', file), 'utf-8');
	}
	const pin = path.join(repoRoot, 'build', `${name}.commit`);
	if (!fs.existsSync(pin)) {
		// Not pinned: the file as it is on the main branch, read again at every build
		return download(`https://raw.githubusercontent.com/Trumpingtons/${name}.jl/main/data/${file}`, name, file);
	}
	const commit = fs.readFileSync(pin, 'utf-8').trim();
	const cached = path.join(repoRoot, '.build', name, commit, file);
	if (fs.existsSync(cached)) {
		return fs.readFileSync(cached, 'utf-8');
	}
	const text = await download(`https://raw.githubusercontent.com/Trumpingtons/${name}.jl/${commit}/data/${file}`, name, file);
	fs.mkdirSync(path.dirname(cached), { recursive: true });
	fs.writeFileSync(cached, text, 'utf-8');
	return text;
}

/** The text at `url`, the data file `file` of the package `name`. */
async function download(url: string, name: string, file: string): Promise<string> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Could not download ${file} of ${name}.jl from ${url}: ${response.status} ${response.statusText}`);
	}
	return response.text();
}
