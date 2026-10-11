/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import gulp from 'gulp';
import { generateTypeScriptFromToml } from './lib/toml-to-ts.ts';
import { generatePollisBib } from './lib/pollis-bib.ts';
import * as task from './lib/task.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');
const tomlOutDir = path.join(repoRoot, 'src/vs/workbench/contrib/model/browser/webviews');
const pollisBibPath = path.join(repoRoot, 'src/vs/workbench/contrib/model/browser/media/references/pollis.bib');
const pollisBibConflictsPath = path.join(repoRoot, '.build/pollis-bib-conflicts.txt');

export const compileTomlTask = task.define('compile-toml', () => {
	const tomlFiles = fs.readdirSync(tomlOutDir).filter(f => f.endsWith('.toml'));
	for (const file of tomlFiles) {
		const acronym = file.replace(/\.toml$/, '');
		const tomlPath = path.join(tomlOutDir, file);
		const outPath = path.join(tomlOutDir, `${acronym}.data.ts`);
		const ts = generateTypeScriptFromToml(tomlPath, acronym);
		fs.writeFileSync(outPath, ts, 'utf-8');
		console.log(`[toml] Generated ${acronym}.data.ts`);
	}

	// The Pollis library of references, from the same TOMLs and the Compose notebooks
	const library = generatePollisBib(repoRoot);
	if (!fs.existsSync(pollisBibPath) || fs.readFileSync(pollisBibPath, 'utf-8') !== library.bibtex) {
		fs.mkdirSync(path.dirname(pollisBibPath), { recursive: true });
		fs.writeFileSync(pollisBibPath, library.bibtex, 'utf-8');
	}
	fs.mkdirSync(path.dirname(pollisBibConflictsPath), { recursive: true });
	fs.writeFileSync(pollisBibConflictsPath, library.conflicts.join('\n') + '\n', 'utf-8');
	console.log(`[toml] Generated pollis.bib: ${library.works} works from ${library.occurrences} references, ${library.conflicts.length} conflicts (see .build/pollis-bib-conflicts.txt)`);
	return Promise.resolve();
});

gulp.task(compileTomlTask);
