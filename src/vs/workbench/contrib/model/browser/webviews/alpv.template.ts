/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildScaffoldHtml } from './scaffoldParts.js';
import { IAlpvMetadata } from '../common/alpv.types.js';

export function getAlpvHtml(metadata: IAlpvMetadata): string {
	return buildScaffoldHtml('alpv', metadata.alpv, {
		title: 'Alpha Vantage',
		defaultModel: 'equity',
		decisionFirstColumn: 'Task',
		illusCollapsed: true,
		illustrationLabel: 'Illustration',
		illustrationOverrideJs: `			body.innerHTML = '<div style="text-align:center;padding:24px 0;font-size:13px;color:var(--vscode-descriptionForeground);">Download market and economic data from Alpha Vantage into Julia: equities, forex, crypto, indicators, and macro series.</div>';
			return;`,
	});
}
