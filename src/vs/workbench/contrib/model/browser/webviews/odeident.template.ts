/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ODEIDENT_METADATA } from './odeident.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getOdeidentHtml(): string {
	return buildScaffoldHtml('odeident', ODEIDENT_METADATA.odeident, {
		title: 'Structural Identifiability of ODEs',
		defaultModel: 'struct',
		decisionFirstColumn: 'Question',
	});
}
