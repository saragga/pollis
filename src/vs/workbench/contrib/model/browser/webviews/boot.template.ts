/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BOOT_METADATA } from './boot.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getBootHtml(): string {
	return buildScaffoldHtml('boot', BOOT_METADATA.boot, {
		title: 'Bootstrap Resampling',
		defaultModel: 'nonparam',
		decisionFirstColumn: 'Model',
	});
}
