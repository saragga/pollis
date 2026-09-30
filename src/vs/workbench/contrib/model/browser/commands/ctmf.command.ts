/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CTMF_METADATA } from '../webviews/ctmf.data.js';
import { getCtmfHtml } from '../webviews/ctmf.template.js';

export const CTMF_PANEL: IScaffoldPanel = {
	id: 'ctmf',
	viewType: 'pollis.ctmf',
	title: 'Continuous-Time Macro-Finance',
	data: CTMF_METADATA.ctmf,
	html: getCtmfHtml,
};
