/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const watch = process.platform === 'win32' ? require('./watch-win32.ts').default : require('vscode-gulp-watch');

// Temporary files that are gone before vscode-gulp-watch reads them, a failed read that ends the process:
// `.!PID!name` of `sed -i` on macOS, and `name.tmp.PID.HEX` of tools that write a file and rename it over the original
const temporaryFile = /[\\/](?:\.!\d+![^\\/]*|[^\\/]+\.tmp\.\d+\.[0-9a-f]+)$/;

export default function (pattern: any, options?: any): ReturnType<typeof watch> {
	return watch(pattern, { ignored: temporaryFile, ...options });
}
