/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { HMD_METADATA } from '../webviews/hmd.data.js';
import { getHmdHtml } from '../webviews/hmd.template.js';

export const HMD_PANEL: IScaffoldPanel = {
	id: 'hmd',
	viewType: 'pollis.hmd',
	title: 'Handle Missing Data',
	data: HMD_METADATA.hmd,
	html: getHmdHtml,
};
