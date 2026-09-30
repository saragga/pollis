/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { SSM_METADATA } from '../webviews/ssm.data.js';
import { getSsmHtml } from '../webviews/ssm.template.js';

export const SSM_PANEL: IScaffoldPanel = {
	id: 'ssm',
	viewType: 'pollis.ssm',
	title: 'State-Space Inference Methods',
	data: SSM_METADATA.ssm,
	html: getSsmHtml,
};
