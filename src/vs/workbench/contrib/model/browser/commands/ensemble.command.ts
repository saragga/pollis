/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ENSEMBLE_METADATA } from '../webviews/ensemble.data.js';
import { getEnsembleHtml } from '../webviews/ensemble.template.js';

export const ENSEMBLE_PANEL: IScaffoldPanel = {
	id: 'ensemble',
	viewType: 'pollis.ensemble',
	title: 'Ensemble Learning Methods',
	data: ENSEMBLE_METADATA.ensemble,
	html: getEnsembleHtml,
};
