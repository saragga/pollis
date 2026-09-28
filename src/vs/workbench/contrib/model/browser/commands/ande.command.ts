/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ANDE_METADATA } from '../webviews/ande.data.js';
import { getAndeHtml } from '../webviews/ande.template.js';

export const ANDE_PANEL: IScaffoldPanel = {
	id: 'ande',
	viewType: 'pollis.ande',
	title: 'Learning-Based Anomaly Detection',
	data: ANDE_METADATA.ande,
	html: getAndeHtml,
};
