/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CTMF_METADATA } from './ctmf.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCtmfHtml(): string {
	return buildScaffoldHtml('ctmf', CTMF_METADATA.ctmf, {
		title: 'Continuous-Time Macro-Finance',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
