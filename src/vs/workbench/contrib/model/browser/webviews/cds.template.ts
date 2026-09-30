/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CDS_METADATA } from './cds.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCdsHtml(): string {
	return buildScaffoldHtml('cds', CDS_METADATA.cds, {
		title: 'Continuous Dynamical Systems',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
