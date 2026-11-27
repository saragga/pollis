/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IUtilityProcessWorkerWorkbenchService } from '../../../services/utilityProcess/electron-browser/utilityProcessWorkerWorkbenchService.js';
import { IBritannicaService } from '../common/britannica.js';
import { EncyclopediaService } from './encyclopediaService.js';

/** The queries of PollisBritannica, which a utility process runs (../node/britannicaMain.ts). */
class BritannicaService extends EncyclopediaService implements IBritannicaService {
	constructor(
		@IUtilityProcessWorkerWorkbenchService utilityProcessWorkerWorkbenchService: IUtilityProcessWorkerWorkbenchService,
	) {
		super(utilityProcessWorkerWorkbenchService, 'vs/workbench/contrib/databases/node/britannicaMain', 'britannica');
	}
}

registerSingleton(IBritannicaService, BritannicaService, InstantiationType.Delayed);
