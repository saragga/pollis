/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PROX_METADATA } from './prox.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getProxHtml(): string {
	return buildScaffoldHtml('prox', PROX_METADATA.prox, {
		title: 'Nonsmooth and Proximal Optimisation',
		defaultModel: 'sg',
		decisionFirstColumn: 'Method',
	});
}
