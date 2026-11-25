/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IUtilityProcessWorkerWorkbenchService } from '../../../services/utilityProcess/electron-browser/utilityProcessWorkerWorkbenchService.js';
import { IBritannica, IBritannicaLookup, IBritannicaResult, IBritannicaService, IBritannicaState } from '../common/britannica.js';

/** The queries of PollisBritannica, which a utility process runs: started when first asked, and again when it has ended. */
class BritannicaService extends Disposable implements IBritannicaService {

	declare readonly _serviceBrand: undefined;

	// The proxy kept in an object: awaited itself, its `then` would be taken for a method of the process, never answered
	private britannica: Promise<{ readonly proxy: IBritannica }> | undefined;

	constructor(
		@IUtilityProcessWorkerWorkbenchService private readonly utilityProcessWorkerWorkbenchService: IUtilityProcessWorkerWorkbenchService,
	) {
		super();
	}

	private get(): Promise<{ readonly proxy: IBritannica }> {
		this.britannica ??= (async () => {
			const worker = this._register(await this.utilityProcessWorkerWorkbenchService.createWorker({
				moduleId: 'vs/workbench/contrib/databases/node/britannicaMain',
				type: 'britannica',
				name: 'britannica',
			}));
			worker.onDidTerminate.then(() => this.britannica = undefined);
			return { proxy: ProxyChannel.toService<IBritannica>(worker.client.getChannel('britannica')) };
		})();
		return this.britannica;
	}

	async state(): Promise<IBritannicaState> {
		return (await this.get()).proxy.state();
	}

	async lookup(lookup: IBritannicaLookup): Promise<IBritannicaResult> {
		return (await this.get()).proxy.lookup(lookup);
	}
}

registerSingleton(IBritannicaService, BritannicaService, InstantiationType.Delayed);
