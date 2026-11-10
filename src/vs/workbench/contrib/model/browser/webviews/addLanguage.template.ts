/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ADDLANGUAGE_METADATA } from './addLanguage.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getAddLanguageHtml(): string {
	return buildScaffoldHtml('addLanguage', ADDLANGUAGE_METADATA.addLanguage, {
		title: 'Add a Language',
		defaultModel: 'c',
		decisionFirstColumn: 'Language',
	});
}
