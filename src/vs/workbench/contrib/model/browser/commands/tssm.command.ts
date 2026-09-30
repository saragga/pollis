/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { TSSM_METADATA } from '../webviews/tssm.data.js';
import { getTssmHtml } from '../webviews/tssm.template.js';

export const TSSM_PANEL: IScaffoldPanel = {
	id: 'tssm',
	viewType: 'pollis.tssm',
	title: 'State Space Models',
	data: TSSM_METADATA.tssm,
	html: getTssmHtml,
};
