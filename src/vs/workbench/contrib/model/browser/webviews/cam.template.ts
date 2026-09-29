/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CAM_METADATA } from './cam.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCamHtml(): string {
	return buildScaffoldHtml('cam', CAM_METADATA.cam, {
		title: 'Curvature-Aware Methods',
		defaultModel: 'sophia',
		decisionFirstColumn: 'Method',
	});
}
