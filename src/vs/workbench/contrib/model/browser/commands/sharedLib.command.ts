/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SHAREDLIB_METADATA } from '../webviews/sharedLib.data.js';
import { getSharedLibHtml } from '../webviews/sharedLib.template.js';

export const SHAREDLIB_PANEL: IScaffoldPanel = {
	id: 'sharedLib',
	viewType: 'pollis.sharedLib',
	title: 'Compile Julia to a Shared Library',
	data: SHAREDLIB_METADATA.sharedLib,
	html: getSharedLibHtml,
};
