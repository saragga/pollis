/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { PARQUET_METADATA } from '../webviews/parquet.data.js';
import { getParquetHtml } from '../webviews/parquet.template.js';

export const PARQUET_PANEL: IScaffoldPanel = {
	id: 'parquet',
	viewType: 'pollis.parquet',
	title: 'Parquet Files',
	data: PARQUET_METADATA.parquet,
	html: getParquetHtml,
};
