/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VM_METADATA } from './vm.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getVmHtml(): string {
	return buildScaffoldHtml('vm', VM_METADATA.vm, {
		title: 'Volatility Measurement',
		defaultModel: 'park',
		decisionFirstColumn: 'Estimator',
	});
}
