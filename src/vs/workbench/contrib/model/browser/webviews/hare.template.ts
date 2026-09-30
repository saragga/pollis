/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { HARE_METADATA } from './hare.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getHareHtml(): string {
	return buildScaffoldHtml('hare', HARE_METADATA.hare, {
		title: 'Linear Models with Heteroskedasticity',
		defaultModel: 'exponential',
		decisionFirstColumn: 'Variance model',
	});
}
