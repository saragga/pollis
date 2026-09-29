/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { MANIFOLD_METADATA } from '../webviews/manifold.data.js';
import { getManifoldHtml } from '../webviews/manifold.template.js';

export const MANIFOLD_PANEL: IScaffoldPanel = {
	id: 'manifold',
	viewType: 'pollis.manifold',
	title: 'Manifold Learning',
	data: MANIFOLD_METADATA.manifold,
	html: getManifoldHtml,
};
