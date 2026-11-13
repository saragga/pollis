/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildScaffoldHtml } from './scaffoldParts.js';
import { IXlsxMetadata } from '../common/xlsx.types.js';

export function getXlsxHtml(metadata: IXlsxMetadata): string {
	return buildScaffoldHtml('xlsx', metadata.xlsx, {
		title: 'Excel Workbook',
		defaultModel: 'write',
		decisionFirstColumn: 'Task',
	});
}
