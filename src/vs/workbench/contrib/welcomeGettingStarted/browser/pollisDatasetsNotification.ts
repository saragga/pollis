/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable, IDisposable, MutableDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { INotificationHandle, INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IQuickInputService, IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IPathService } from '../../../services/path/common/pathService.js';

// The ids of the PollisDatasets the user has seen; datasets added since are announced. The keys keep the names
// they had when the datasets were announced on the welcome page, so what was seen there stays seen.
const SEEN_DATASETS_KEY = 'pollis.welcome.seenDatasets';
// The ids in the PollisDatasets catalogue when it was last read; an update announces only what it adds.
const LISTED_DATASETS_KEY = 'pollis.welcome.listedDatasets';
const DATABASES_VIEW_COMMAND = 'workbench.view.pollis.databases';

/**
 * A dataset of PollisDatasets.jl, as listed in the catalogue that PollisDB.catalogue() writes.
 */
interface IPollisDataset {
	readonly id: string;
	readonly title: string;
}

/**
 * Pollis: announces the datasets added to PollisDatasets as a notification (in the notification centre under the
 * bell), until it is closed. The other announcements and alerts are on the welcome page.
 */
export class PollisDatasetsNotificationContribution extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.pollisDatasetsNotification';

	private readonly databasesFolder: URI;
	private readonly catalogue: URI;
	private readonly datasetsNotification = this._register(new MutableDisposable());
	private shownDatasets: string[] = [];

	constructor(
		@INotificationService private readonly notificationService: INotificationService,
		@IStorageService private readonly storageService: IStorageService,
		@IFileService private readonly fileService: IFileService,
		@IPathService private readonly pathService: IPathService,
		@ICommandService private readonly commandService: ICommandService,
		@IQuickInputService private readonly quickInputService: IQuickInputService,
	) {
		super();
		const home = this.pathService.userHome({ preferLocal: true });
		this.databasesFolder = joinPath(home, '.pollis', 'databases');
		this.catalogue = joinPath(this.databasesFolder, 'PollisDatasets.json');
		this.update();
		// PollisDB.catalogue() lists the installed PollisDatasets each time a Julia REPL starts, after it has
		// installed or updated them.
		const watcher = this._register(this.fileService.createWatcher(this.databasesFolder, { recursive: false, excludes: [] }));
		this._register(watcher.onDidChange(e => {
			if (e.contains(this.catalogue)) {
				this.update();
			}
		}));
	}

	private async update(): Promise<void> {
		const datasets = await this.readCatalogue();
		if (datasets && !this._store.isDisposed) {
			this.announceDatasets(datasets);
		}
	}

	/**
	 * The datasets in the catalogue, or undefined when it cannot be read. Records which were seen before.
	 */
	private async readCatalogue(): Promise<IPollisDataset[] | undefined> {
		let datasets: IPollisDataset[];
		try {
			const parsed: { datasets?: Partial<IPollisDataset>[] } = JSON.parse((await this.fileService.readFile(this.catalogue)).value.toString());
			if (!Array.isArray(parsed.datasets)) {
				return undefined;
			}
			datasets = parsed.datasets.filter((d): d is IPollisDataset => typeof d?.id === 'string' && typeof d.title === 'string');
		} catch {
			return undefined;
		}
		// The first catalogue read is what the user already has: nothing is new.
		if (this.storageService.get(SEEN_DATASETS_KEY, StorageScope.APPLICATION) === undefined) {
			this.storeSeenDatasets(datasets.map(d => d.id));
		}
		// An update that adds datasets replaces the announcement of the previous one: what was listed before
		// counts as seen, even if its announcement was not closed.
		const listed = this.getStoredIds(LISTED_DATASETS_KEY);
		if (datasets.some(d => !listed.includes(d.id))) {
			// Pollis 0.2.4 and earlier kept no list, so after an update from them what was listed before
			// is unknown: everything in the catalogue counts as seen, rather than announcing old datasets as new.
			const neverListed = this.storageService.get(LISTED_DATASETS_KEY, StorageScope.APPLICATION) === undefined;
			this.storeSeenDatasets(neverListed ? datasets.map(d => d.id) : listed);
			this.storageService.store(LISTED_DATASETS_KEY, JSON.stringify(datasets.map(d => d.id)), StorageScope.APPLICATION, StorageTarget.MACHINE);
		}
		return datasets;
	}

	/**
	 * Announces the datasets added to PollisDatasets since the announcement was last closed. A list does not fit in a
	 * notification, so it gives the number, and Show Datasets lists them.
	 */
	private announceDatasets(datasets: IPollisDataset[]): void {
		const seen = new Set(this.getStoredIds(SEEN_DATASETS_KEY));
		const added = datasets.filter(d => !seen.has(d.id));
		const ids = added.map(d => d.id);
		if (ids.length === this.shownDatasets.length && ids.every(id => this.shownDatasets.includes(id))) {
			return;
		}
		this.shownDatasets = ids;
		this.datasetsNotification.clear();
		if (!added.length) {
			return;
		}
		const message = added.length === 1
			? localize('pollis.datasetAdded', "A new dataset in PollisDatasets: {0}. It is a table of the built-in database, and is loaded in Julia with dataset(\"{1}\").", added[0].title, added[0].id)
			: localize('pollis.datasetsAdded', "{0} new datasets in PollisDatasets. Each is a table of the built-in database, and is loaded in Julia with dataset(\"id\").", added.length);
		const choices = [{ label: localize('pollis.openDatabases', "Open Databases View"), run: () => this.commandService.executeCommand(DATABASES_VIEW_COMMAND) }];
		if (added.length > 1) {
			choices.unshift({ label: localize('pollis.showDatasets', "Show Datasets"), run: () => this.showDatasets(added) });
		}
		const handle = this.notificationService.prompt(Severity.Info, message, choices, { sticky: true });
		this.datasetsNotification.value = this.closeWhen(handle, () => this.storeSeenDatasets(ids));
	}

	/**
	 * Lists the new `datasets` with their ids; picking one opens the Databases view, where it is a table.
	 */
	private async showDatasets(datasets: IPollisDataset[]): Promise<void> {
		const items: IQuickPickItem[] = datasets.map(d => ({ label: d.title, description: `dataset("${d.id}")` }));
		const picked = await this.quickInputService.pick(items, { placeHolder: localize('pollis.newDatasets', "New datasets in PollisDatasets") });
		if (picked) {
			this.commandService.executeCommand(DATABASES_VIEW_COMMAND);
		}
	}

	/**
	 * Calls `onClose` when the user closes the notification `handle`; disposing the result closes it without calling `onClose`.
	 */
	private closeWhen(handle: INotificationHandle, onClose: () => void): IDisposable {
		let replaced = false;
		const listener = handle.onDidClose(() => {
			if (!replaced) {
				onClose();
			}
		});
		return toDisposable(() => {
			replaced = true;
			handle.close();
			listener.dispose();
		});
	}

	/**
	 * The ids stored under `key`, or none when there are none or they cannot be read.
	 */
	private getStoredIds(key: string): string[] {
		try {
			const ids = JSON.parse(this.storageService.get(key, StorageScope.APPLICATION, '[]'));
			return Array.isArray(ids) ? ids : [];
		} catch {
			return [];
		}
	}

	/**
	 * Records the datasets `ids` as seen, keeping those seen before, so that only datasets added later are announced.
	 */
	private storeSeenDatasets(ids: string[]): void {
		const seen = new Set([...this.getStoredIds(SEEN_DATASETS_KEY), ...ids]);
		this.storageService.store(SEEN_DATASETS_KEY, JSON.stringify([...seen]), StorageScope.APPLICATION, StorageTarget.USER);
	}
}
