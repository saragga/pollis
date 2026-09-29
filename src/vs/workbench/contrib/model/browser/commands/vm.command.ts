/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { VM_METADATA } from '../webviews/vm.data.js';
import { getVmHtml } from '../webviews/vm.template.js';

export const VM_PANEL: IScaffoldPanel = {
	id: 'vm',
	viewType: 'pollis.vm',
	title: 'Volatility Measurement',
	data: VM_METADATA.vm,
	html: getVmHtml,
};
