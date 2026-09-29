/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CCA_METADATA } from './cca.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCcaHtml(): string {
	return buildScaffoldHtml('cca', CCA_METADATA.cca, {
		title: 'Canonical Correlation Analysis',
		defaultModel: 'cca',
		decisionFirstColumn: 'Method',
	});
}
