/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import gulp from 'gulp';
import { generateTypeScriptFromToml } from './lib/toml-to-ts.ts';
import * as task from './lib/task.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');
const tomlOutDir = path.join(repoRoot, 'src/vs/workbench/contrib/model/browser/webviews');

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
	return Promise.resolve();
});

gulp.task(compileTomlTask);
