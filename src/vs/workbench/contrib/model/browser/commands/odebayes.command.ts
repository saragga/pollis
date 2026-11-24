/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ODEBAYES_METADATA } from '../webviews/odebayes.data.js';
import { getOdebayesHtml } from '../webviews/odebayes.template.js';

export const ODEBAYES_PANEL: IScaffoldPanel = {
	id: 'odebayes',
	viewType: 'pollis.odebayes',
	title: 'Bayesian Inference for ODEs',
	data: ODEBAYES_METADATA.odebayes,
	html: getOdebayesHtml,
};
