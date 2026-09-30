/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CEVAL_METADATA } from './ceval.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCevalHtml(): string {
	return buildScaffoldHtml('ceval', CEVAL_METADATA.ceval, {
		title: 'Copula Evaluation',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
