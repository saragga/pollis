/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { ADDLANGUAGE_METADATA } from '../webviews/addLanguage.data.js';
import { getAddLanguageHtml } from '../webviews/addLanguage.template.js';

export const ADDLANGUAGE_PANEL: IScaffoldPanel = {
	id: 'addLanguage',
	viewType: 'pollis.addLanguage',
	title: 'Add a Language',
	data: ADDLANGUAGE_METADATA.addLanguage,
	html: getAddLanguageHtml,
};
