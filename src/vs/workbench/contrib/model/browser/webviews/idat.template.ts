/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDAT_METADATA } from './idat.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getIdatHtml(): string {
	return buildScaffoldHtml('idat', IDAT_METADATA.idat, {
		title: 'Interpolate Data',
		defaultModel: 'linear',
	});
}
