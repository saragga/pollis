/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PARQUET_METADATA } from './parquet.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getParquetHtml(): string {
	return buildScaffoldHtml('parquet', PARQUET_METADATA.parquet, {
		title: 'Parquet Files',
		defaultModel: 'query',
	});
}
