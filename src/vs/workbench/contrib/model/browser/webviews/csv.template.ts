/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CSV_METADATA } from './csv.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCsvHtml(): string {
	return buildScaffoldHtml('csv', CSV_METADATA.csv, {
		title: 'CSV Files',
		defaultModel: 'read',
	});
}
