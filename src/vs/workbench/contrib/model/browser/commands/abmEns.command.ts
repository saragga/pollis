/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ABMENS_METADATA } from '../webviews/abmEns.data.js';
import { getAbmEnsHtml } from '../webviews/abmEns.template.js';

export const ABMENS_PANEL: IScaffoldPanel = {
	id: 'abmEns',
	viewType: 'pollis.abmEns',
	title: 'Ensemble & Parameter Scanning',
	data: ABMENS_METADATA.abmEns,
	html: getAbmEnsHtml,
};
