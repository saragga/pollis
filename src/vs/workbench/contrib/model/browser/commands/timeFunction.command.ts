/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { TIMEFUNCTION_METADATA } from '../webviews/timeFunction.data.js';
import { getTimeFunctionHtml } from '../webviews/timeFunction.template.js';

export const TIMEFUNCTION_PANEL: IScaffoldPanel = {
	id: 'timeFunction',
	viewType: 'pollis.timeFunction',
	title: 'Time a Function',
	data: TIMEFUNCTION_METADATA.timeFunction,
	html: getTimeFunctionHtml,
};
