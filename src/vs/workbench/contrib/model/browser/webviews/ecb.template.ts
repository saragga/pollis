/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildScaffoldHtml } from './scaffoldParts.js';
import { IEcbMetadata } from '../common/ecb.types.js';

export function getEcbHtml(metadata: IEcbMetadata): string {
	return buildScaffoldHtml('ecb', metadata.ecb, {
		title: 'ECB Data Portal',
		defaultModel: 'exchange',
		decisionFirstColumn: 'Task',
	});
}
