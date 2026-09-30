/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { BLSDF_METADATA } from '../webviews/blsdf.data.js';
import { getBlsdfHtml } from '../webviews/blsdf.template.js';

export const BLSDF_PANEL: IScaffoldPanel = {
	id: 'blsdf',
	viewType: 'pollis.blsdf',
	title: 'Bayesian Linear Stochastic Discount Factor',
	data: BLSDF_METADATA.blsdf,
	html: getBlsdfHtml,
};
