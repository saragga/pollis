/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CTPF_METADATA } from './ctpf.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getCtpfHtml(): string {
	return buildScaffoldHtml('ctpf', CTPF_METADATA.ctpf, {
		title: 'Collaborative Topic Poisson Factorisation',
		defaultModel: 'main',
		decisionFirstColumn: 'Model',
	});
}
