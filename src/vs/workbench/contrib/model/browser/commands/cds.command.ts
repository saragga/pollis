/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CDS_METADATA } from '../webviews/cds.data.js';
import { getCdsHtml } from '../webviews/cds.template.js';

export const CDS_PANEL: IScaffoldPanel = {
	id: 'cds',
	viewType: 'pollis.cds',
	title: 'Continuous Dynamical Systems',
	data: CDS_METADATA.cds,
	html: getCdsHtml,
};
