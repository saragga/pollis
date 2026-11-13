/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SHAREDLIB_METADATA } from './sharedLib.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getSharedLibHtml(): string {
	return buildScaffoldHtml('sharedLib', SHAREDLIB_METADATA.sharedLib, {
		title: 'Compile Julia to a Shared Library',
		defaultModel: 'juliac',
		decisionFirstColumn: 'Tool',
	});
}
