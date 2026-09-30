/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { DISTSAMPLING_METADATA } from '../webviews/distSampling.data.js';
import { getDistSamplingHtml } from '../webviews/distSampling.template.js';

export const DISTSAMPLING_PANEL: IScaffoldPanel = {
	id: 'distSampling',
	viewType: 'pollis.distSampling',
	title: 'Distribution Sampling',
	data: DISTSAMPLING_METADATA.distSampling,
	html: getDistSamplingHtml,
};
