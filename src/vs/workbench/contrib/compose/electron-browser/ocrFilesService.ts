/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IUtilityProcessWorkerWorkbenchService } from '../../../services/utilityProcess/electron-browser/utilityProcessWorkerWorkbenchService.js';
import { IOcrCheck, IOcrCopy, IOcrDisagreement, IOcrEbookPages, IOcrExtract, IOcrFiles, IOcrFilesService, IOcrFlagged, IOcrPage, IOcrProgress, IOcrScanSize, IOcrSourceInfo } from '../common/ocrFiles.js';

/** The downloads and checks of OCR Files and Snippets, which a utility process does: started when first asked, and again when it has ended. */
class OcrFilesService extends Disposable implements IOcrFilesService {

	declare readonly _serviceBrand: undefined;

	// The proxy kept in an object: awaited itself, its `then` would be taken for a method of the process, never answered
	private ocrFiles: Promise<{ readonly proxy: IOcrFiles }> | undefined;

	private readonly _onDidProgress = this._register(new Emitter<IOcrProgress>());
	readonly onDidProgress = this._onDidProgress.event;

	constructor(
		@IUtilityProcessWorkerWorkbenchService private readonly utilityProcessWorkerWorkbenchService: IUtilityProcessWorkerWorkbenchService,
	) {
		super();
	}

	private get(): Promise<{ readonly proxy: IOcrFiles }> {
		this.ocrFiles ??= (async () => {
			const worker = this._register(await this.utilityProcessWorkerWorkbenchService.createWorker({
				moduleId: 'vs/workbench/contrib/compose/node/ocrFilesMain',
				type: 'ocrFiles',
				name: 'ocr-files',
			}));
			worker.onDidTerminate.then(() => this.ocrFiles = undefined);
			const proxy = ProxyChannel.toService<IOcrFiles>(worker.client.getChannel('ocrFiles'));
			this._register(proxy.onDidProgress(progress => this._onDidProgress.fire(progress)));
			return { proxy };
		})();
		return this.ocrFiles;
	}

	async openArchive(identifier: string, folder: string): Promise<IOcrSourceInfo> {
		return (await this.get()).proxy.openArchive(identifier, folder);
	}

	async openGutenberg(ebook: number, folder: string): Promise<IOcrSourceInfo> {
		return (await this.get()).proxy.openGutenberg(ebook, folder);
	}

	async openPdf(folder: string, info: string): Promise<IOcrSourceInfo> {
		return (await this.get()).proxy.openPdf(folder, info);
	}

	async fingerprint(path: string): Promise<string> {
		return (await this.get()).proxy.fingerprint(path);
	}

	async page(folder: string, page: number, check: IOcrCheck, fetchImage: boolean): Promise<IOcrPage> {
		return (await this.get()).proxy.page(folder, page, check, fetchImage);
	}

	async extract(folder: string, pages: readonly number[], check: IOcrCheck): Promise<IOcrExtract> {
		return (await this.get()).proxy.extract(folder, pages, check);
	}

	async checkText(text: string, check: IOcrCheck): Promise<readonly IOcrFlagged[]> {
		return (await this.get()).proxy.checkText(text, check);
	}

	async otherCopies(identifier: string): Promise<readonly IOcrCopy[]> {
		return (await this.get()).proxy.otherCopies(identifier);
	}

	async compare(folder: string, identifier: string, text: string, pages: readonly number[]): Promise<readonly IOcrDisagreement[]> {
		return (await this.get()).proxy.compare(folder, identifier, text, pages);
	}

	async scanSize(folder: string): Promise<IOcrScanSize> {
		return (await this.get()).proxy.scanSize(folder);
	}

	async downloadScan(folder: string): Promise<IOcrScanSize> {
		return (await this.get()).proxy.downloadScan(folder);
	}

	async stopDownload(folder: string): Promise<void> {
		return (await this.get()).proxy.stopDownload(folder);
	}

	async printedPages(folder: string): Promise<readonly string[]> {
		return (await this.get()).proxy.printedPages(folder);
	}

	async ebookPages(folder: string): Promise<IOcrEbookPages | undefined> {
		return (await this.get()).proxy.ebookPages(folder);
	}
}

registerSingleton(IOcrFilesService, OcrFilesService, InstantiationType.Delayed);
