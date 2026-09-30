/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { LDA_METADATA } from '../webviews/lda.data.js';
import { getLdaHtml } from '../webviews/lda.template.js';

export const LDA_PANEL: IScaffoldPanel = {
	id: 'lda',
	viewType: 'pollis.lda',
	title: 'Latent Dirichlet Allocation',
	data: LDA_METADATA.lda,
	html: getLdaHtml,
};
