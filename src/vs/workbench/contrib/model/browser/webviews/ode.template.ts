/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ODE_METADATA } from './ode.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getOdeHtml(): string {
	return buildScaffoldHtml('ode', ODE_METADATA.ode, {
		title: 'ODE Inference Methods',
		defaultModel: 'struct',
		decisionFirstColumn: 'Model',
	});
}
