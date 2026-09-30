/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SLM_METADATA } from './slm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSlmHtml(): string {
	return buildScaffoldHtml('slm', SLM_METADATA.slm, {
		title: 'Statistical Language Model',
		defaultModel: 'unigram',
		decisionFirstColumn: 'Model',
	});
}
