/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IMF_METADATA } from './imf.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getImfHtml(): string {
	return buildScaffoldHtml('imf', IMF_METADATA.imf, {
		title: 'IMF Data',
		defaultModel: 'weo',
		decisionFirstColumn: 'Task',
		illusCollapsed: true,
		illustrationLabel: 'Illustration',
		illustrationOverrideJs: `			body.innerHTML = '<div style="text-align:center;padding:24px 0;font-size:13px;color:var(--vscode-descriptionForeground);">Pull International Monetary Fund statistics into Julia: World Economic Outlook forecasts, consumer prices, exchange rates, the currency composition of reserves, and primary commodity prices.</div>';
			return;`,
	});
}
