/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { HFCME_METADATA } from './hfcme.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getHfcmeHtml(): string {
	return buildScaffoldHtml('hfcme', HFCME_METADATA.hfcme, {
		title: 'High-Frequency Covariance Matrix Estimation',
		defaultModel: 'rc',
		decisionFirstColumn: 'Model',
	});
}
