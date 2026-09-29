/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { QP_METADATA } from '../webviews/qp.data.js';
import { getQpHtml } from '../webviews/qp.template.js';

export const QP_PANEL: IScaffoldPanel = {
	id: 'qp',
	viewType: 'pollis.qp',
	title: 'Quadratic Programming',
	data: QP_METADATA.qp,
	html: getQpHtml,
};
