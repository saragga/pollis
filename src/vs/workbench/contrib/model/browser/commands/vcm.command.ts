/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { VCM_METADATA } from '../webviews/vcm.data.js';
import { getVcmHtml } from '../webviews/vcm.template.js';

export const VCM_PANEL: IScaffoldPanel = {
	id: 'vcm',
	viewType: 'pollis.vcm',
	title: 'GARCH-Type Models',
	data: VCM_METADATA.vcm,
	html: getVcmHtml,
};
