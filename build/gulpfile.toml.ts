/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import gulp from 'gulp';
import { generateTypeScriptFromToml } from './lib/toml-to-ts.ts';
import { generatePollisBib, readReferencesDatabase, refreshReferenceCopies, REFERENCES_FOLDER } from './lib/pollis-bib.ts';
import * as task from './lib/task.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');
const tomlOutDir = path.join(repoRoot, 'src/vs/workbench/contrib/model/browser/webviews');
const pollisBibPath = path.join(repoRoot, REFERENCES_FOLDER, 'pollis.bib');
const referencesDumpPath = path.join(repoRoot, REFERENCES_FOLDER, 'references.json');

/** Write a generated file only when its text changed, so that its date says when it last did. */
function writeIfChanged(file: string, text: string): void {
	if (!fs.existsSync(file) || fs.readFileSync(file, 'utf-8') !== text) {
		fs.writeFileSync(file, text, 'utf-8');
	}
}

export const compileTomlTask = task.define('compile-toml', async () => {
	const database = await readReferencesDatabase(repoRoot);
	const tomlFiles = fs.readdirSync(tomlOutDir).filter(f => f.endsWith('.toml'));
	for (const file of tomlFiles) {
		const acronym = file.replace(/\.toml$/, '');
		const tomlPath = path.join(tomlOutDir, file);
		const outPath = path.join(tomlOutDir, `${acronym}.data.ts`);
		const ts = generateTypeScriptFromToml(tomlPath, acronym, database.references);
		fs.writeFileSync(outPath, ts, 'utf-8');
		console.log(`[toml] Generated ${acronym}.data.ts`);
	}

	// The Pollis library of references and the database as text, from references.duckdb
	const library = generatePollisBib(repoRoot, database);
	if (library.unknownKeys.length) {
		throw new Error(`[toml] Reference keys not in ${REFERENCES_FOLDER}/references.duckdb: ${library.unknownKeys.join(', ')}`);
	}
	writeIfChanged(pollisBibPath, library.bibtex);
	writeIfChanged(referencesDumpPath, library.dump);
	console.log(`[toml] Generated pollis.bib and references.json: ${library.works} works, ${library.occurrences} references to them`);

	// The citations the Compose notebooks and the shipped methods keep for Pollis to read
	for (const file of refreshReferenceCopies(repoRoot, database.references)) {
		console.log(`[toml] Updated the reference in ${path.relative(repoRoot, file)}`);
	}
});

gulp.task(compileTomlTask);
