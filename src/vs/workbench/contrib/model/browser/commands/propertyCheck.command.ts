/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { PROPERTYCHECK_METADATA } from '../webviews/propertyCheck.data.js';
import { getPropertyCheckHtml } from '../webviews/propertyCheck.template.js';

export const PROPERTYCHECK_PANEL: IScaffoldPanel = {
	id: 'propertyCheck',
	viewType: 'pollis.propertyCheck',
	title: 'Check a Property',
	data: PROPERTYCHECK_METADATA.propertyCheck,
	html: getPropertyCheckHtml,
};
