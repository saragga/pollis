/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CV_METADATA } from '../webviews/cv.data.js';
import { getCvHtml } from '../webviews/cv.template.js';

export const CV_PANEL: IScaffoldPanel = {
	id: 'cv',
	viewType: 'pollis.cv',
	title: 'Cross-Validation Strategies',
	data: CV_METADATA.cv,
	html: getCvHtml,
};
