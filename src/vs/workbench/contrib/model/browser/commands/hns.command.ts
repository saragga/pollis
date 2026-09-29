/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { HNS_METADATA } from '../webviews/hns.data.js';
import { getHnsHtml } from '../webviews/hns.template.js';

export const HNS_PANEL: IScaffoldPanel = {
	id: 'hns',
	viewType: 'pollis.hns',
	title: 'Neighbourhood Search',
	data: HNS_METADATA.hns,
	html: getHnsHtml,
};
