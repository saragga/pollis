/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NNLS_METADATA } from './nnls.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getNnlsHtml(): string {
	return buildScaffoldHtml('nnls', NNLS_METADATA.nnls, {
		title: 'Non-Negative Least Squares (NNLS)',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
