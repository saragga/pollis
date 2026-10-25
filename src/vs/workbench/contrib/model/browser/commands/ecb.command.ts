/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ECB_METADATA } from '../webviews/ecb.data.js';
import { getEcbHtml } from '../webviews/ecb.template.js';

export const ECB_PANEL: IScaffoldPanel = {
	id: 'ecb',
	viewType: 'pollis.ecb',
	title: 'ECB Data Portal',
	data: ECB_METADATA.ecb,
	html: () => getEcbHtml(ECB_METADATA),
};
