/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RZOO_METADATA } from './rzoo.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getRzooHtml(): string {
	return buildScaffoldHtml('rzoo', RZOO_METADATA.rzoo, {
		title: 'RobotZoo — Robot Model Library',
		defaultModel: 'pend',
		decisionFirstColumn: 'Model',
	});
}
