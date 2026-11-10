/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SAVEDRESULTS_METADATA } from '../webviews/savedResults.data.js';
import { getSavedResultsHtml } from '../webviews/savedResults.template.js';

export const SAVEDRESULTS_PANEL: IScaffoldPanel = {
	id: 'savedResults',
	viewType: 'pollis.savedResults',
	title: 'Compare with Saved Results',
	data: SAVEDRESULTS_METADATA.savedResults,
	html: getSavedResultsHtml,
};
