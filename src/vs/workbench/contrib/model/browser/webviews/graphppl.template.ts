/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { GRAPHPPL_METADATA } from './graphppl.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getGraphpplHtml(): string {
	return buildScaffoldHtml('graphppl', GRAPHPPL_METADATA.graphppl, {
		title: 'Probabilistic Programming with RxInfer.jl',
		defaultModel: 'bp',
		decisionFirstColumn: 'Method',
	});
}
