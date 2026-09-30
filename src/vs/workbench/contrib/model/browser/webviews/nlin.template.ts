/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NLIN_METADATA } from './nlin.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getNlinHtml(): string {
	return buildScaffoldHtml('nlin', NLIN_METADATA.nlin, {
		title: 'Nonlinear Systems',
		defaultModel: 'scalar',
		decisionFirstColumn: 'Task',
	});
}
