/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DF_METADATA } from '../webviews/df.data.js';
import { getDfHtml } from '../webviews/df.template.js';

export const DF_PANEL: IScaffoldPanel = {
	id: 'df',
	viewType: 'pollis.df',
	title: 'Distribution Factories',
	data: DF_METADATA.df,
	html: getDfHtml,
};
