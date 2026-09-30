/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DF_METADATA } from './df.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDfHtml(): string {
	return buildScaffoldHtml('df', DF_METADATA.df, {
		title: 'Distribution Factories',
		defaultModel: 'moments',
		decisionFirstColumn: 'Model',
	});
}
