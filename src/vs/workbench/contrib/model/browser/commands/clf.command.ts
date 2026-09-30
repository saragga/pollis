/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CLF_METADATA } from '../webviews/clf.data.js';
import { getClfHtml } from '../webviews/clf.template.js';

export const CLF_PANEL: IScaffoldPanel = {
	id: 'clf',
	viewType: 'pollis.clf',
	title: 'Classification Performance',
	data: CLF_METADATA.clf,
	html: getClfHtml,
};
