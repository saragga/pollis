/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SQL_METADATA } from '../webviews/sql.data.js';
import { getSqlHtml } from '../webviews/sql.template.js';

export const SQL_PANEL: IScaffoldPanel = {
	id: 'sql',
	viewType: 'pollis.sql',
	title: 'SQL Databases',
	data: SQL_METADATA.sql,
	html: getSqlHtml,
};
