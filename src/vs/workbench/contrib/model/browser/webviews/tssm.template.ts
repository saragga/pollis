/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TSSM_METADATA } from './tssm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getTssmHtml(): string {
	return buildScaffoldHtml('tssm', TSSM_METADATA.tssm, {
		title: 'State Space Models',
		defaultModel: 'lg',
		decisionFirstColumn: 'Model',
	});
}
