/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VARI_METADATA } from './vari.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getVariHtml(): string {
	return buildScaffoldHtml('vari', VARI_METADATA.vari, {
		title: 'Variational Inequalities',
		defaultModel: 'vi',
		decisionFirstColumn: 'Problem',
	});
}
