/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SQL_METADATA } from './sql.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSqlHtml(): string {
	return buildScaffoldHtml('sql', SQL_METADATA.sql, {
		title: 'SQL Databases',
		defaultModel: 'query',
	});
}
