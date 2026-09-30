/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CRN_METADATA } from './crn.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCrnHtml(): string {
	return buildScaffoldHtml('crn', CRN_METADATA.crn, {
		title: 'Interaction Network Models',
		defaultModel: 'chemical',
		decisionFirstColumn: 'Model',
	});
}
