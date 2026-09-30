/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CHAOS_METADATA } from '../webviews/chaos.data.js';
import { getChaosHtml } from '../webviews/chaos.template.js';

export const CHAOS_PANEL: IScaffoldPanel = {
	id: 'chaos',
	viewType: 'pollis.chaos',
	title: 'Chaos Characterisation',
	data: CHAOS_METADATA.chaos,
	html: getChaosHtml,
};
