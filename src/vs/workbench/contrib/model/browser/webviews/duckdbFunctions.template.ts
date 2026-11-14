/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DUCKDBFUNCTIONS_METADATA } from './duckdbFunctions.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getDuckdbFunctionsHtml(): string {
	return buildScaffoldHtml('duckdbFunctions', DUCKDBFUNCTIONS_METADATA.duckdbFunctions, {
		title: 'Julia Functions in DuckDB',
		defaultModel: 'julia',
		decisionFirstColumn: 'Way',
	});
}
