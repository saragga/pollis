/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SAVEDRESULTS_METADATA } from './savedResults.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSavedResultsHtml(): string {
	return buildScaffoldHtml('savedResults', SAVEDRESULTS_METADATA.savedResults, {
		title: 'Compare with Saved Results',
		defaultModel: 'numbers',
		decisionFirstColumn: 'What Is Saved',
	});
}
