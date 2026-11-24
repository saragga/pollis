/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TRANSFER_METADATA } from './transfer.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getTransferHtml(): string {
	return buildScaffoldHtml('transfer', TRANSFER_METADATA.transfer, {
		title: 'Transfer Learning and Fine-Tuning',
		defaultModel: 'published',
		decisionFirstColumn: 'Tab',
	});
}
