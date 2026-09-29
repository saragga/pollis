/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PO_METADATA } from './po.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getPoHtml(): string {
	return buildScaffoldHtml('po', PO_METADATA.po, {
		title: 'Portfolio Optimisation',
		defaultModel: 'mv',
		decisionFirstColumn: 'Method',
	});
}
