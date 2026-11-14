/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DUCKDBFUNCTIONS_METADATA } from '../webviews/duckdbFunctions.data.js';
import { getDuckdbFunctionsHtml } from '../webviews/duckdbFunctions.template.js';

export const DUCKDBFUNCTIONS_PANEL: IScaffoldPanel = {
	id: 'duckdbFunctions',
	viewType: 'pollis.duckdbFunctions',
	title: 'Julia Functions in DuckDB',
	data: DUCKDBFUNCTIONS_METADATA.duckdbFunctions,
	html: getDuckdbFunctionsHtml,
};
