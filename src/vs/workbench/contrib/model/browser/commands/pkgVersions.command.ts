/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { PKGVERSIONS_METADATA } from '../webviews/pkgVersions.data.js';
import { getPkgVersionsHtml } from '../webviews/pkgVersions.template.js';

export const PKGVERSIONS_PANEL: IScaffoldPanel = {
	id: 'pkgVersions',
	viewType: 'pollis.pkgVersions',
	title: 'Compare Package Versions',
	data: PKGVERSIONS_METADATA.pkgVersions,
	html: getPkgVersionsHtml,
};
