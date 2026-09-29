/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NF_METADATA } from './nf.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getNfHtml(): string {
	return buildScaffoldHtml('nf', NF_METADATA.nf, {
		title: 'Normalising Flows',
		defaultModel: 'realnvp',
		decisionFirstColumn: 'Flow',
	});
}
