/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildScaffoldHtml } from './scaffoldParts.js';
import { IYfinMetadata } from '../common/yfin.types.js';

export function getYfinHtml(metadata: IYfinMetadata): string {
	return buildScaffoldHtml('yfin', metadata.yfin, {
		title: 'Yahoo Finance',
		defaultModel: 'price',
		decisionFirstColumn: 'Task',
	});
}
