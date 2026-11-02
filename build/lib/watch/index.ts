/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const watch = process.platform === 'win32' ? require('./watch-win32.ts').default : require('vscode-gulp-watch');

// The temporary file of `sed -i` on macOS, `.!PID!name`: it is gone before vscode-gulp-watch reads it, and that failed read ends the process
const sedTemporaryFile = /[\\/]\.!\d+![^\\/]*$/;

export default function (pattern: any, options?: any): ReturnType<typeof watch> {
	return watch(pattern, { ignored: sedTemporaryFile, ...options });
}
