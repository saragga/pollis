/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TIMEFUNCTION_METADATA } from './timeFunction.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getTimeFunctionHtml(): string {
	return buildScaffoldHtml('timeFunction', TIMEFUNCTION_METADATA.timeFunction, {
		title: 'Time a Function',
		defaultModel: 'chairmarks',
		decisionFirstColumn: 'Way to Time',
	});
}
