/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MPMICP_METADATA } from './mpmicp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMpmicpHtml(): string {
	return buildScaffoldHtml('mpmicp', MPMICP_METADATA.mpmicp, {
		title: 'Mixed-Integer Conic Programming',
		defaultModel: 'portfolio',
		decisionFirstColumn: 'Problem',
	});
}
