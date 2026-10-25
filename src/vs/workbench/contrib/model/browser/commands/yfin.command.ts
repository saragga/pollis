/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { YFIN_METADATA } from '../webviews/yfin.data.js';
import { getYfinHtml } from '../webviews/yfin.template.js';

export const YFIN_PANEL: IScaffoldPanel = {
	id: 'yfin',
	viewType: 'pollis.yfin',
	title: 'Yahoo Finance',
	data: YFIN_METADATA.yfin,
	html: () => getYfinHtml(YFIN_METADATA),
};
