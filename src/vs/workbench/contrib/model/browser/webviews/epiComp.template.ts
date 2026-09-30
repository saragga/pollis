/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EPICOMP_METADATA } from './epiComp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getEpiCompHtml(): string {
	return buildScaffoldHtml('epiComp', EPICOMP_METADATA.epiComp, {
		title: 'Compartmental Models',
		defaultModel: 'sir',
		decisionFirstColumn: 'Model',
	});
}
