/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MIXCOMPILED_METADATA } from '../webviews/mixCompiled.data.js';
import { getMixCompiledHtml } from '../webviews/mixCompiled.template.js';

export const MIXCOMPILED_PANEL: IScaffoldPanel = {
	id: 'mixCompiled',
	viewType: 'pollis.mixCompiled',
	title: 'Mix Julia with Compiled Code',
	data: MIXCOMPILED_METADATA.mixCompiled,
	html: getMixCompiledHtml,
};
