/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildScaffoldHtml } from './scaffoldParts.js';
import { IYfinMetadata } from '../common/yfin.types.js';

export function getYfinHtml(metadata: IYfinMetadata): string {
	return buildScaffoldHtml('yfin', metadata.yfin, {
		title: 'Yahoo Finance',
		defaultModel: 'price',
		decisionFirstColumn: 'Task',
		illusCollapsed: true,
		illustrationLabel: 'Illustration',
		illustrationOverrideJs: `			body.innerHTML = '<div style="text-align:center;padding:24px 0;font-size:13px;color:var(--vscode-descriptionForeground);">Download market data from Yahoo Finance into Julia: prices, fundamentals, options, and news.</div>';
			return;`,
	});
}
