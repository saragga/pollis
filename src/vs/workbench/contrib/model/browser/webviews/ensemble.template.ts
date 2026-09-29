/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ENSEMBLE_METADATA } from './ensemble.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getEnsembleHtml(): string {
	return buildScaffoldHtml('ensemble', ENSEMBLE_METADATA.ensemble, {
		title: 'Ensemble Learning Methods',
		defaultModel: 'rf',
		decisionFirstColumn: 'Method',
	});
}
