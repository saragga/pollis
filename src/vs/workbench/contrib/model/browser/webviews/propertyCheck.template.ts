/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PROPERTYCHECK_METADATA } from './propertyCheck.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getPropertyCheckHtml(): string {
	return buildScaffoldHtml('propertyCheck', PROPERTYCHECK_METADATA.propertyCheck, {
		title: 'Check a Property',
		defaultModel: 'invariant',
		decisionFirstColumn: 'Kind of Property',
	});
}
