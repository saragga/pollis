/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MPGNLP_METADATA } from './mpgnlp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMpgnlpHtml(): string {
	return buildScaffoldHtml('mpgnlp', MPGNLP_METADATA.mpgnlp, {
		title: 'Global Nonlinear Programming',
		defaultModel: 'eago',
		decisionFirstColumn: 'Solver',
	});
}
