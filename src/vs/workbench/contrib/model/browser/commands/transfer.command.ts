/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { TRANSFER_METADATA } from '../webviews/transfer.data.js';
import { getTransferHtml } from '../webviews/transfer.template.js';

export const TRANSFER_PANEL: IScaffoldPanel = {
	id: 'transfer',
	viewType: 'pollis.transfer',
	title: 'Transfer Learning and Fine-Tuning',
	data: TRANSFER_METADATA.transfer,
	html: getTransferHtml,
};
