/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CCA_METADATA } from '../webviews/cca.data.js';
import { getCcaHtml } from '../webviews/cca.template.js';

export const CCA_PANEL: IScaffoldPanel = {
	id: 'cca',
	viewType: 'pollis.cca',
	title: 'Canonical Correlation Analysis',
	data: CCA_METADATA.cca,
	html: getCcaHtml,
};
