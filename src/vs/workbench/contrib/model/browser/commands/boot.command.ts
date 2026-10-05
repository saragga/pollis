/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { BOOT_METADATA } from '../webviews/boot.data.js';
import { getBootHtml } from '../webviews/boot.template.js';

export const BOOT_PANEL: IScaffoldPanel = {
	id: 'boot',
	viewType: 'pollis.boot',
	title: 'Bootstrap Resampling',
	data: BOOT_METADATA.boot,
	html: getBootHtml,
};
