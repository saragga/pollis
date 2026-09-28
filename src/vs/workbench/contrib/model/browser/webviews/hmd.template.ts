/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { HMD_METADATA } from './hmd.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getHmdHtml(): string {
	return buildScaffoldHtml('hmd', HMD_METADATA.hmd, {
		title: 'Handle Missing Data',
		defaultModel: 'drop',
	});
}
