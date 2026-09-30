/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ABMENS_METADATA } from './abmEns.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getAbmEnsHtml(): string {
	return buildScaffoldHtml('abmEns', ABMENS_METADATA.abmEns, {
		title: 'Ensemble & Parameter Scanning',
		defaultModel: 'ensemble',
		decisionFirstColumn: 'Model',
	});
}
