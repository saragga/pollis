/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CLF_METADATA } from './clf.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getClfHtml(): string {
	return buildScaffoldHtml('clf', CLF_METADATA.clf, {
		title: 'Classification Performance',
		defaultModel: 'metrics',
		decisionFirstColumn: 'Model',
	});
}
