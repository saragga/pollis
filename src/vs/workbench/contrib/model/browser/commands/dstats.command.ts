/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DSTATS_METADATA } from '../webviews/dstats.data.js';
import { getDstatsHtml } from '../webviews/dstats.template.js';

export const DSTATS_PANEL: IScaffoldPanel = {
	id: 'dstats',
	viewType: 'pollis.dstats',
	title: 'Descriptive Statistics',
	data: DSTATS_METADATA.dstats,
	html: getDstatsHtml,
};
