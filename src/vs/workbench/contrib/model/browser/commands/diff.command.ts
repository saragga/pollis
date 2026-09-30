/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DIFF_METADATA } from '../webviews/diff.data.js';
import { getDiffHtml } from '../webviews/diff.template.js';

export const DIFF_PANEL: IScaffoldPanel = {
	id: 'diff',
	viewType: 'pollis.diff',
	title: 'Differentiation',
	data: DIFF_METADATA.diff,
	html: getDiffHtml,
};
