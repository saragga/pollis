/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IUtilityProcessWorkerWorkbenchService } from '../../../services/utilityProcess/electron-browser/utilityProcessWorkerWorkbenchService.js';
import { IForecastingConversion, IForecastingConverted, IForecastingDatasets, IForecastingDatasetsService, IForecastingFile } from '../common/forecastingDatasets.js';

/** The conversion of the user's datasets, which a utility process runs: started when first asked, and again when it has ended. */
class ForecastingDatasetsService extends Disposable implements IForecastingDatasetsService {

	declare readonly _serviceBrand: undefined;

	// The proxy kept in an object: awaited itself, its `then` would be taken for a method of the process, never answered
	private datasets: Promise<{ readonly proxy: IForecastingDatasets }> | undefined;

	constructor(
		@IUtilityProcessWorkerWorkbenchService private readonly utilityProcessWorkerWorkbenchService: IUtilityProcessWorkerWorkbenchService,
	) {
		super();
	}

	private get(): Promise<{ readonly proxy: IForecastingDatasets }> {
		this.datasets ??= (async () => {
			const worker = this._register(await this.utilityProcessWorkerWorkbenchService.createWorker({
				moduleId: 'vs/workbench/contrib/compose/node/forecastingDatasetsMain',
				type: 'forecastingDatasets',
				name: 'forecasting-datasets',
			}));
			worker.onDidTerminate.then(() => this.datasets = undefined);
			return { proxy: ProxyChannel.toService<IForecastingDatasets>(worker.client.getChannel('forecastingDatasets')) };
		})();
		return this.datasets;
	}

	async columns(file: string): Promise<IForecastingFile> {
		return (await this.get()).proxy.columns(file);
	}

	async convert(conversion: IForecastingConversion): Promise<IForecastingConverted> {
		return (await this.get()).proxy.convert(conversion);
	}
}

registerSingleton(IForecastingDatasetsService, ForecastingDatasetsService, InstantiationType.Delayed);
