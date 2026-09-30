/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { QRNG_METADATA } from '../webviews/qrng.data.js';
import { getQrngHtml } from '../webviews/qrng.template.js';

export const QRNG_PANEL: IScaffoldPanel = {
	id: 'qrng',
	viewType: 'pollis.qrng',
	title: 'Quasi-Random Numbers Generation',
	data: QRNG_METADATA.qrng,
	html: getQrngHtml,
};
