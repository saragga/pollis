/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { FFD_METADATA } from './ffd.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getFfdHtml(): string {
	return buildScaffoldHtml('ffd', FFD_METADATA.ffd, {
		title: 'Kenneth French Data Library',
		defaultModel: 'factors3',
		decisionFirstColumn: 'Task',
		illusCollapsed: true,
		illustrationLabel: 'Illustration',
		illustrationOverrideJs: `			body.innerHTML = '<div style="text-align:center;padding:24px 0;font-size:13px;color:var(--vscode-descriptionForeground);">Pull Kenneth French&#39;s factor and portfolio returns into Julia: the three and five Fama-French factors, momentum, the 25 size and book-to-market portfolios, industry portfolios, and the full list of files in the library.</div>';
			return;`,
	});
}
