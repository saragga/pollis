/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SLM_METADATA } from '../webviews/slm.data.js';
import { getSlmHtml } from '../webviews/slm.template.js';

export const SLM_PANEL: IScaffoldPanel = {
	id: 'slm',
	viewType: 'pollis.slm',
	title: 'Statistical Language Model',
	data: SLM_METADATA.slm,
	html: getSlmHtml,
};
