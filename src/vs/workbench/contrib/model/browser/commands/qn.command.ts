/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { QN_METADATA } from '../webviews/qn.data.js';
import { getQnHtml } from '../webviews/qn.template.js';

export const QN_PANEL: IScaffoldPanel = {
	id: 'qn',
	viewType: 'pollis.qn',
	title: 'Quasi-Newton Methods',
	data: QN_METADATA.qn,
	html: getQnHtml,
};
