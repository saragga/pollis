/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RCME_METADATA } from './rcme.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getRcmeHtml(): string {
	return buildScaffoldHtml('rcme', RCME_METADATA.rcme, {
		title: 'Robust Covariance Matrix Estimation',
		defaultModel: 'lw',
		decisionFirstColumn: 'Model',
	});
}
