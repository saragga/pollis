/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { JSON_METADATA } from './json.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getJsonHtml(): string {
	return buildScaffoldHtml('json', JSON_METADATA.json, {
		title: 'JSON Files',
		defaultModel: 'query',
	});
}
