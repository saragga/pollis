/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildScaffoldHtml } from './scaffoldParts.js';
import { IFredMetadata } from '../common/fred.types.js';

export function getFredHtml(metadata: IFredMetadata): string {
	return buildScaffoldHtml('fred', metadata.fred, {
		title: 'Federal Reserve Economic Data',
		defaultModel: 'growth',
		decisionFirstColumn: 'Task',
	});
}
