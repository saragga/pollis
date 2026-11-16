/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MPLAB_METADATA } from '../webviews/mplab.data.js';
import { getMplabHtml } from '../webviews/mplab.template.js';

export const MPLAB_PANEL: IScaffoldPanel = {
	id: 'mplab',
	viewType: 'pollis.mplab',
	title: 'Mathematical Programming Lab',
	data: MPLAB_METADATA.mplab,
	html: getMplabHtml,
};
