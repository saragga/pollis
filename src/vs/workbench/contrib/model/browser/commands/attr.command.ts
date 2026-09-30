/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ATTR_METADATA } from '../webviews/attr.data.js';
import { getAttrHtml } from '../webviews/attr.template.js';

export const ATTR_PANEL: IScaffoldPanel = {
	id: 'attr',
	viewType: 'pollis.attr',
	title: 'Attractor & Basin Analysis',
	data: ATTR_METADATA.attr,
	html: getAttrHtml,
};
