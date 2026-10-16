/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { WBD_METADATA } from './wbd.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getWbdHtml(): string {
	return buildScaffoldHtml('wbd', WBD_METADATA.wbd, {
		title: 'World Bank Indicators',
		defaultModel: 'indicator',
		decisionFirstColumn: 'Task',
		illusCollapsed: true,
		illustrationLabel: 'Illustration',
		illustrationOverrideJs: `			body.innerHTML = '<div style="text-align:center;padding:24px 0;font-size:13px;color:var(--vscode-descriptionForeground);">Pull the World Bank&#39;s World Development Indicators into Julia: one series, cross-country comparisons, regional and income-group aggregates, country classifications, and indicator search.</div>';
			return;`,
	});
}
