/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IUtilityProcessWorkerWorkbenchService } from '../../../services/utilityProcess/electron-browser/utilityProcessWorkerWorkbenchService.js';
import { ISnowballDatabase, ISnowballDatabaseService, SnowballParameter, SnowballRow } from '../common/snowballSearch.js';

/** The map's database, which a utility process runs: started when first asked, and again when it has ended. */
class SnowballDatabaseService extends Disposable implements ISnowballDatabaseService {

	declare readonly _serviceBrand: undefined;

	// The proxy kept in an object: awaited itself, its `then` would be taken for a method of the process, never answered
	private database: Promise<{ readonly proxy: ISnowballDatabase }> | undefined;

	constructor(
		@IUtilityProcessWorkerWorkbenchService private readonly utilityProcessWorkerWorkbenchService: IUtilityProcessWorkerWorkbenchService,
	) {
		super();
	}

	private get(): Promise<{ readonly proxy: ISnowballDatabase }> {
		this.database ??= (async () => {
			const worker = this._register(await this.utilityProcessWorkerWorkbenchService.createWorker({
				moduleId: 'vs/workbench/contrib/compose/node/snowballDatabaseMain',
				type: 'snowballDatabase',
				name: 'snowball-database',
			}));
			worker.onDidTerminate.then(() => this.database = undefined);
			return { proxy: ProxyChannel.toService<ISnowballDatabase>(worker.client.getChannel('snowballDatabase')) };
		})();
		return this.database;
	}

	async run(sql: string, parameters?: Record<string, SnowballParameter>): Promise<void> {
		return (await this.get()).proxy.run(sql, parameters);
	}

	async query(sql: string, parameters?: Record<string, SnowballParameter>): Promise<SnowballRow[]> {
		return (await this.get()).proxy.query(sql, parameters);
	}
}

registerSingleton(ISnowballDatabaseService, SnowballDatabaseService, InstantiationType.Delayed);
