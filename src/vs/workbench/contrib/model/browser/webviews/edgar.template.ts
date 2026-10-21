/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildScaffoldHtml } from './scaffoldParts.js';
import { IEdgarMetadata } from '../common/edgar.types.js';

export function getEdgarHtml(metadata: IEdgarMetadata): string {
	return buildScaffoldHtml('edgar', metadata.edgar, {
		title: 'US SEC EDGAR',
		defaultModel: 'submissions',
		decisionFirstColumn: 'Task',
		omitIllustration: true,
		keyPointsIntro: metadata.edgar.notes?.keyPoints?.intro,
		keyPointsFootnote: metadata.edgar.notes?.keyPoints?.footnote,
		decisionIntro: metadata.edgar.notes?.decision?.intro,
		decisionFootnote: metadata.edgar.notes?.decision?.footnote,
	});
}
