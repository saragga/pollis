/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MPNLP_METADATA } from './mpnlp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMpnlpHtml(): string {
	return buildScaffoldHtml('mpnlp', MPNLP_METADATA.mpnlp, {
		title: 'Nonlinear Programming',
		defaultModel: 'nlp',
		decisionFirstColumn: 'Problem',
	});
}
