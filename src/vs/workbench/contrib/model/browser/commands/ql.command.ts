/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { QL_METADATA } from '../webviews/ql.data.js';
import { getQlHtml } from '../webviews/ql.template.js';

export const QL_PANEL: IScaffoldPanel = {
	id: 'ql',
	viewType: 'pollis.ql',
	title: 'Q-Learning',
	data: QL_METADATA.ql,
	html: getQlHtml,
};
