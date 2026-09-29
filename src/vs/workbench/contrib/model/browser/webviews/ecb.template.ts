/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildScaffoldHtml } from './scaffoldParts.js';
import { IEcbMetadata } from '../common/ecb.types.js';

export function getEcbHtml(metadata: IEcbMetadata): string {
	return buildScaffoldHtml('ecb', metadata.ecb, {
		title: 'ECB Data Portal',
		defaultModel: 'exchange',
		decisionFirstColumn: 'Task',
		illusCollapsed: true,
		illustrationLabel: 'Illustration',
		illustrationOverrideJs: `			body.innerHTML = '<div style="text-align:center;padding:24px 0;font-size:13px;color:var(--vscode-descriptionForeground);">Pull euro-area statistics from the ECB Data Portal into Julia: exchange rates, the key ECB interest rates, HICP inflation, monetary aggregates, and the yield curve.</div>';
			return;`,
	});
}
