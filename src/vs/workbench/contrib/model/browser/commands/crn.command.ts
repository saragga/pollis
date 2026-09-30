/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CRN_METADATA } from '../webviews/crn.data.js';
import { getCrnHtml } from '../webviews/crn.template.js';

export const CRN_PANEL: IScaffoldPanel = {
	id: 'crn',
	viewType: 'pollis.crn',
	title: 'Interaction Network Models',
	data: CRN_METADATA.crn,
	html: getCrnHtml,
};
