/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { COVSHRINKAGE_METADATA } from '../webviews/covShrinkage.data.js';
import { getCovShrinkageHtml } from '../webviews/covShrinkage.template.js';

export const COVSHRINKAGE_PANEL: IScaffoldPanel = {
	id: 'covShrinkage',
	viewType: 'pollis.cov-shrinkage',
	title: 'Regularised Covariance Estimation',
	data: COVSHRINKAGE_METADATA.covShrinkage,
	html: getCovShrinkageHtml,
};
