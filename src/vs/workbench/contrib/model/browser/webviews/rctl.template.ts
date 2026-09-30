/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RCTL_METADATA } from './rctl.data.js';
import { buildScaffoldHtml } from './scaffoldParts.js';

export function getRctlHtml(): string {
	return buildScaffoldHtml('rctl', RCTL_METADATA.rctl, {
		title: 'Robot Control',
		defaultModel: 'ik',
		decisionFirstColumn: 'Model',
	});
}
