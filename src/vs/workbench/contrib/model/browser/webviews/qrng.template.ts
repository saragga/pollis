/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { QRNG_METADATA } from './qrng.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getQrngHtml(): string {
	return buildScaffoldHtml('qrng', QRNG_METADATA.qrng, {
		title: 'Quasi-Random Numbers Generation',
		defaultModel: 'sobol',
		decisionFirstColumn: 'Model',
	});
}
