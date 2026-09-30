/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { PTP_METADATA } from '../webviews/ptp.data.js';
import { getPtpHtml } from '../webviews/ptp.template.js';

export const PTP_PANEL: IScaffoldPanel = {
	id: 'ptp',
	viewType: 'pollis.ptp',
	title: 'Point Processes',
	data: PTP_METADATA.ptp,
	html: getPtpHtml,
};
