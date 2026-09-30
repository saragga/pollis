/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { JDP_METADATA } from '../webviews/jdp.data.js';
import { getJdpHtml } from '../webviews/jdp.template.js';

export const JDP_PANEL: IScaffoldPanel = {
	id: 'jdp',
	viewType: 'pollis.jdp',
	title: 'Jump-Diffusion Processes',
	data: JDP_METADATA.jdp,
	html: getJdpHtml,
};
