/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SID_METADATA } from './sid.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSidHtml(): string {
	return buildScaffoldHtml('sid', SID_METADATA.sid, {
		title: 'Sampling from Intractable Distributions',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
