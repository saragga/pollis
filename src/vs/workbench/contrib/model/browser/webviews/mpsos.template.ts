/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MPSOS_METADATA } from './mpsos.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getMpsosHtml(): string {
	return buildScaffoldHtml('mpsos', MPSOS_METADATA.mpsos, {
		title: 'Sum of Squares',
		defaultModel: 'sos',
		decisionFirstColumn: 'Problem',
	});
}
