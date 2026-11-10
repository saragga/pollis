/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { TYPESTABILITY_METADATA } from '../webviews/typeStability.data.js';
import { getTypeStabilityHtml } from '../webviews/typeStability.template.js';

export const TYPESTABILITY_PANEL: IScaffoldPanel = {
	id: 'typeStability',
	viewType: 'pollis.typeStability',
	title: 'Check Type Stability',
	data: TYPESTABILITY_METADATA.typeStability,
	html: getTypeStabilityHtml,
};
