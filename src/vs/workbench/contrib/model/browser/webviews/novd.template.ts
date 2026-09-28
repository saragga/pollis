/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NOVD_METADATA } from './novd.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getNovdHtml(): string {
	return buildScaffoldHtml('novd', NOVD_METADATA.novd, {
		title: 'Novelty Detection',
		defaultModel: 'ocsvm',
	});
}
