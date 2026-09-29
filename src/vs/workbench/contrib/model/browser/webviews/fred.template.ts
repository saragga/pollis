/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildScaffoldHtml } from './scaffoldParts.js';
import { IFredMetadata } from '../common/fred.types.js';

export function getFredHtml(metadata: IFredMetadata): string {
	return buildScaffoldHtml('fred', metadata.fred, {
		title: 'Federal Reserve Economic Data',
		defaultModel: 'growth',
		decisionFirstColumn: 'Task',
		illusCollapsed: true,
		illustrationLabel: 'Illustration',
		illustrationOverrideJs: `			body.innerHTML = '<div style="text-align:center;padding:24px 0;font-size:13px;color:var(--vscode-descriptionForeground);">Pull U.S. and international macroeconomic time series from FRED into Julia: output and growth, inflation, the labour market, interest rates, and money and exchange rates.</div>';
			return;`,
	});
}
