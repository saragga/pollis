/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { GP_METADATA } from './gp.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getGpHtml(): string {
	return buildScaffoldHtml('gp', GP_METADATA.gp, {
		title: 'Generalized Pareto Distribution',
		defaultModel: 'fit',
		decisionFirstColumn: 'Model',
	});
}
