/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { QN_METADATA } from './qn.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getQnHtml(): string {
	return buildScaffoldHtml('qn', QN_METADATA.qn, {
		title: 'Quasi-Newton Methods',
		defaultModel: 'bfgs',
		decisionFirstColumn: 'Method',
	});
}
