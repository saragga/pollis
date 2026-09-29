/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { RULEBASED_METADATA } from '../webviews/rulebased.data.js';
import { getRulebasedHtml } from '../webviews/rulebased.template.js';

export const RULEBASED_PANEL: IScaffoldPanel = {
	id: 'rulebased',
	viewType: 'pollis.rulebased',
	title: 'Rule-Based Methods',
	data: RULEBASED_METADATA.rulebased,
	html: getRulebasedHtml,
};
