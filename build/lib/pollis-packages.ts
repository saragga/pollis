/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The data packages Pollis is built with, PollisReferences.jl and PollisRSS.jl: each is read at the commit in
// build/<Package>.commit, from GitHub, once.

import * as fs from 'fs';
import * as path from 'path';

/** A data package of Pollis: its name, the file of its data folder Pollis is built from, and the variable that names a clone of it. */
export interface IPollisPackage {
	readonly name: string;
	readonly file: string;
	readonly clone: string;
}

/**
 * The text of the data file of `pollisPackage` at the commit in build/<name>.commit, downloaded once into .build; or,
 * when the variable `pollisPackage.clone` names a clone of the package, its file as it is, to build with a change
 * before it is pushed.
 */
export async function pinnedPackageFile(repoRoot: string, pollisPackage: IPollisPackage): Promise<string> {
	const { name, file } = pollisPackage;
	const clone = process.env[pollisPackage.clone];
	if (clone) {
		return fs.readFileSync(path.join(clone, 'data', file), 'utf-8');
	}
	const commit = fs.readFileSync(path.join(repoRoot, 'build', `${name}.commit`), 'utf-8').trim();
	const cached = path.join(repoRoot, '.build', name, commit, file);
	if (fs.existsSync(cached)) {
		return fs.readFileSync(cached, 'utf-8');
	}
	const url = `https://raw.githubusercontent.com/Trumpingtons/${name}.jl/${commit}/data/${file}`;
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Could not download ${file} of ${name}.jl from ${url}: ${response.status} ${response.statusText}`);
	}
	const text = await response.text();
	fs.mkdirSync(path.dirname(cached), { recursive: true });
	fs.writeFileSync(cached, text, 'utf-8');
	return text;
}
