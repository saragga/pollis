/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { COMPILEEXE_METADATA } from '../webviews/compileExe.data.js';
import { getCompileExeHtml } from '../webviews/compileExe.template.js';

export const COMPILEEXE_PANEL: IScaffoldPanel = {
	id: 'compileExe',
	viewType: 'pollis.compileExe',
	title: 'Compile Julia to an Executable',
	data: COMPILEEXE_METADATA.compileExe,
	html: getCompileExeHtml,
};
