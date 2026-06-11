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
	const tomlPath = path.join(tomlOutDir, 'xlsx.toml');
	const outPath = path.join(tomlOutDir, 'xlsx.data.ts');
	const ts = generateTypeScriptFromToml(tomlPath, 'xlsx');
	fs.writeFileSync(outPath, ts, 'utf-8');
	console.log(`[toml] Generated xlsx.data.ts`);
	return Promise.resolve();
});

gulp.task(compileTomlTask);
