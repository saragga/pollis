/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RULEBASED_METADATA } from './rulebased.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getRulebasedHtml(): string {
	return buildScaffoldHtml('rulebased', RULEBASED_METADATA.rulebased, {
		title: 'Rule-Based Methods',
		defaultModel: 'itemset',
		decisionFirstColumn: 'Method',
	});
}
