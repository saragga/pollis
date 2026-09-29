/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MPSDP_METADATA } from './mpsdp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMpsdpHtml(): string {
	return buildScaffoldHtml('mpsdp', MPSDP_METADATA.mpsdp, {
		title: 'Semidefinite Programming',
		defaultModel: 'sdp',
		decisionFirstColumn: 'Problem',
	});
}
