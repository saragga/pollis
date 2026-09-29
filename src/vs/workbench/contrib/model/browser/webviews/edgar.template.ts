/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildScaffoldHtml } from './scaffoldParts.js';
import { IEdgarMetadata } from '../common/edgar.types.js';

export function getEdgarHtml(metadata: IEdgarMetadata): string {
	return buildScaffoldHtml('edgar', metadata.edgar, {
		title: 'US SEC EDGAR',
		defaultModel: 'submissions',
		decisionFirstColumn: 'Task',
		illusCollapsed: true,
		illustrationLabel: 'Illustration',
		illustrationOverrideJs: `			body.innerHTML = '<div style="text-align:center;padding:24px 0;font-size:13px;color:var(--vscode-descriptionForeground);">Pull company filings and financial data from the SEC EDGAR REST APIs into Julia: submission histories, XBRL company facts and concepts, cross-filer frames, and full-text search.</div>';
			return;`,
		keyPointsIntro: metadata.edgar.notes?.keyPoints?.intro,
		keyPointsFootnote: metadata.edgar.notes?.keyPoints?.footnote,
		decisionIntro: metadata.edgar.notes?.decision?.intro,
		decisionFootnote: metadata.edgar.notes?.decision?.footnote,
	});
}
