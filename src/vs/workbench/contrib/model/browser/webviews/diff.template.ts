/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DIFF_METADATA } from './diff.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDiffHtml(): string {
	return buildScaffoldHtml('diff', DIFF_METADATA.diff, {
		title: 'Differentiation',
		defaultModel: 'deriv',
		decisionFirstColumn: 'Task',
	});
}
