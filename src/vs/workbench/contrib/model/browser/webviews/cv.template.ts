/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CV_METADATA } from './cv.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCvHtml(): string {
	return buildScaffoldHtml('cv', CV_METADATA.cv, {
		title: 'Cross-Validation Strategies',
		defaultModel: 'main',
		decisionFirstColumn: 'Recommended Strategy',
	});
}
