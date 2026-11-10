/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TYPESTABILITY_METADATA } from './typeStability.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getTypeStabilityHtml(): string {
	return buildScaffoldHtml('typeStability', TYPESTABILITY_METADATA.typeStability, {
		title: 'Check Type Stability',
		defaultModel: 'warntype',
		decisionFirstColumn: 'Check',
	});
}
