/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MIXCOMPILED_METADATA } from './mixCompiled.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMixCompiledHtml(): string {
	return buildScaffoldHtml('mixCompiled', MIXCOMPILED_METADATA.mixCompiled, {
		title: 'Mix Julia with Compiled Code',
		defaultModel: 'c',
		decisionFirstColumn: 'Crossing',
	});
}
