/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BNET_METADATA } from './bnet.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getBnetHtml(): string {
	return buildScaffoldHtml('bnet', BNET_METADATA.bnet, {
		title: 'Bayesian Network Inference',
		defaultModel: 'define',
		decisionFirstColumn: 'Model',
	});
}
