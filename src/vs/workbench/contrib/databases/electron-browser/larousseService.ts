/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IUtilityProcessWorkerWorkbenchService } from '../../../services/utilityProcess/electron-browser/utilityProcessWorkerWorkbenchService.js';
import { ILarousseService } from '../common/larousse.js';
import { EncyclopediaService } from './encyclopediaService.js';

/** The queries of PollisLarousse, which a utility process runs (../node/larousseMain.ts). */
class LarousseService extends EncyclopediaService implements ILarousseService {
	constructor(
		@IUtilityProcessWorkerWorkbenchService utilityProcessWorkerWorkbenchService: IUtilityProcessWorkerWorkbenchService,
	) {
		super(utilityProcessWorkerWorkbenchService, 'vs/workbench/contrib/databases/node/larousseMain', 'larousse');
	}
}

registerSingleton(ILarousseService, LarousseService, InstantiationType.Delayed);
