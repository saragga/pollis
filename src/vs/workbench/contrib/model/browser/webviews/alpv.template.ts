/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildScaffoldHtml } from './scaffoldParts.js';
import { IAlpvMetadata } from '../common/alpv.types.js';

export function getAlpvHtml(metadata: IAlpvMetadata): string {
	return buildScaffoldHtml('alpv', metadata.alpv, {
		title: 'Alpha Vantage',
		defaultModel: 'equity',
		decisionFirstColumn: 'Task',
	});
}
