/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { JDP_METADATA } from './jdp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getJdpHtml(): string {
	return buildScaffoldHtml('jdp', JDP_METADATA.jdp, {
		title: 'Jump-Diffusion Processes',
		defaultModel: 'cpj',
		decisionFirstColumn: 'Method',
	});
}
