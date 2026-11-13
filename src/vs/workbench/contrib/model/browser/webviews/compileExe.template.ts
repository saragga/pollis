/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { COMPILEEXE_METADATA } from './compileExe.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCompileExeHtml(): string {
	return buildScaffoldHtml('compileExe', COMPILEEXE_METADATA.compileExe, {
		title: 'Compile Julia to an Executable',
		defaultModel: 'juliac',
		decisionFirstColumn: 'Tool',
	});
}
