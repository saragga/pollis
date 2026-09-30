/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CMPLX_METADATA } from '../webviews/cmplx.data.js';
import { getCmplxHtml } from '../webviews/cmplx.template.js';

export const CMPLX_PANEL: IScaffoldPanel = {
	id: 'cmplx',
	viewType: 'pollis.cmplx',
	title: 'Complexity & Entropy',
	data: CMPLX_METADATA.cmplx,
	html: getCmplxHtml,
};
