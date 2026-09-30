/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MCAT_METADATA } from './mcat.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMcatHtml(): string {
	return buildScaffoldHtml('mcat', MCAT_METADATA.mcat, {
		title: 'MeshCat — 3D Visualisation',
		defaultModel: 'scene',
		decisionFirstColumn: 'Model',
	});
}
