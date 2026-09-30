/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SSM_METADATA } from './ssm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSsmHtml(): string {
	return buildScaffoldHtml('ssm', SSM_METADATA.ssm, {
		title: 'State-Space Inference Methods',
		defaultModel: 'kf',
		decisionFirstColumn: 'Model',
	});
}
