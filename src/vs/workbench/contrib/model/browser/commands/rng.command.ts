/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { RNG_METADATA } from '../webviews/rng.data.js';
import { getRngHtml } from '../webviews/rng.template.js';

export const RNG_PANEL: IScaffoldPanel = {
	id: 'rng',
	viewType: 'pollis.rng',
	title: 'Random Numbers Generation',
	data: RNG_METADATA.rng,
	html: getRngHtml,
};
