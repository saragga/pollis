/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { IUtilityProcessWorkerWorkbenchService } from '../../../services/utilityProcess/electron-browser/utilityProcessWorkerWorkbenchService.js';
import { IEncyclopedia, IEncyclopediaLookup, IEncyclopediaResult, IEncyclopediaState } from '../common/encyclopedia.js';

/**
 * The queries of an encyclopedia's database, which a utility process runs (../node/encyclopedia.ts): started when first
 * asked, and again when it has ended. Britannica's and Larousse's services name the module and channel of the process.
 */
export abstract class EncyclopediaService extends Disposable implements IEncyclopedia {

	declare readonly _serviceBrand: undefined;

	// The proxy kept in an object: awaited itself, its `then` would be taken for a method of the process, never answered
	private encyclopedia: Promise<{ readonly proxy: IEncyclopedia }> | undefined;

	constructor(
		private readonly utilityProcessWorkerWorkbenchService: IUtilityProcessWorkerWorkbenchService,
		/** The module of the process, such as vs/workbench/contrib/databases/node/britannicaMain. */
		private readonly moduleId: string,
		/** The name of the process and of its channel, such as britannica. */
		private readonly channel: string,
	) {
		super();
	}

	private get(): Promise<{ readonly proxy: IEncyclopedia }> {
		this.encyclopedia ??= (async () => {
			const worker = this._register(await this.utilityProcessWorkerWorkbenchService.createWorker({
				moduleId: this.moduleId,
				type: this.channel,
				name: this.channel,
			}));
			worker.onDidTerminate.then(() => this.encyclopedia = undefined);
			return { proxy: ProxyChannel.toService<IEncyclopedia>(worker.client.getChannel(this.channel)) };
		})();
		return this.encyclopedia;
	}

	async state(): Promise<IEncyclopediaState> {
		return (await this.get()).proxy.state();
	}

	async lookup(lookup: IEncyclopediaLookup): Promise<IEncyclopediaResult> {
		return (await this.get()).proxy.lookup(lookup);
	}

	async text(file: string, id: number): Promise<string | null> {
		return (await this.get()).proxy.text(file, id);
	}
}
