/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TSLS_METADATA } from './tsls.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getTslsHtml(): string {
	return buildScaffoldHtml('tsls', TSLS_METADATA.tsls, {
		title: 'Two-Stage Least Squares (2SLS)',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
