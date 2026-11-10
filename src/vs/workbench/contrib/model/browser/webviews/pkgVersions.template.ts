/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PKGVERSIONS_METADATA } from './pkgVersions.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getPkgVersionsHtml(): string {
	return buildScaffoldHtml('pkgVersions', PKGVERSIONS_METADATA.pkgVersions, {
		title: 'Compare Package Versions',
		defaultModel: 'releases',
		decisionFirstColumn: 'Versions',
	});
}
