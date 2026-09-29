/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { QP_METADATA } from './qp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getQpHtml(): string {
	return buildScaffoldHtml('qp', QP_METADATA.qp, {
		title: 'Quadratic Programming',
		defaultModel: 'qp',
		decisionFirstColumn: 'Problem',
	});
}
