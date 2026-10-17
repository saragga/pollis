/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable, IDisposable, MutableDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { INotificationHandle, INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IQuickInputService, IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IPathService } from '../../../services/path/common/pathService.js';

// Set by the bundled Julia extension (`language-julia`) once it has looked for Julia at startup.
const JULIA_INSTALLED_KEY = 'julia.juliaInstalled';
// Set by the Julia extension when the REPL is connected, together with the version of Julia it runs.
const JULIA_HAS_REPL_KEY = 'julia.hasREPL';
const JULIA_REPL_VERSION_KEY = 'julia.replVersion';
// The keys keep the names they had when the announcements were on the welcome page, so what was dismissed there stays dismissed.
const DISMISSED_ANNOUNCEMENTS_KEY = 'pollis.welcome.dismissedAnnouncements';
// The ids of the PollisDatasets the user has seen; datasets added since are announced.
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
 * Pollis: one-time announcements, shown as notifications (in the notification centre under the bell):
 * datasets added to PollisDatasets, the built-in database, and a Julia installed while Pollis is open
 * once its REPL is ready. Each is shown until it is closed; the welcome page keeps only the alert
 * that Julia is not installed.
 */
export class PollisAnnouncementsContribution extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.pollisAnnouncements';

	private readonly databasesFolder: URI;
	private readonly catalogue: URI;
	// PollisDB.install() creates Pollis' Julia environment when it installs DuckDB and the PollisDatasets.
	private readonly pollisEnvironment: URI;

	private readonly datasetsNotification = this._register(new MutableDisposable());
	private readonly databaseNotification = this._register(new MutableDisposable());
	private shownDatasets: string[] = [];
	private shownDatabaseAnnouncement: string | undefined;
	private juliaWasMissing: boolean;
	private juliaNewlyInstalled = false;

	constructor(
		@INotificationService private readonly notificationService: INotificationService,
		@IStorageService private readonly storageService: IStorageService,
		@IFileService private readonly fileService: IFileService,
		@IPathService private readonly pathService: IPathService,
		@IContextKeyService private readonly contextKeyService: IContextKeyService,
		@ICommandService private readonly commandService: ICommandService,
		@IQuickInputService private readonly quickInputService: IQuickInputService,
	) {
		super();
		const home = this.pathService.userHome({ preferLocal: true });
		this.databasesFolder = joinPath(home, '.pollis', 'databases');
		this.catalogue = joinPath(this.databasesFolder, 'PollisDatasets.json');
		this.pollisEnvironment = joinPath(home, '.pollis', 'julia', 'environments');
		this.juliaWasMissing = this.getJuliaInstalled() === false;

		this.update();
		// PollisDB.catalogue() lists the installed PollisDatasets each time a Julia REPL starts, after it has
		// installed or updated them and the database.
		const watcher = this._register(this.fileService.createWatcher(this.databasesFolder, { recursive: false, excludes: [] }));
		this._register(watcher.onDidChange(e => {
			if (e.contains(this.catalogue)) {
				this.update();
			}
		}));
		this._register(this.contextKeyService.onDidChangeContext(e => {
			if (e.affectsSome(new Set([JULIA_INSTALLED_KEY]))) {
				if (this.juliaWasMissing && this.getJuliaInstalled()) {
					this.juliaNewlyInstalled = true;
				}
				this.juliaWasMissing = this.getJuliaInstalled() === false;
				this.update();
			}
			// A newly installed Julia is announced once its REPL shows in the terminal.
			if (e.affectsSome(new Set([JULIA_HAS_REPL_KEY, JULIA_REPL_VERSION_KEY])) && this.juliaNewlyInstalled && this.contextKeyService.getContextKeyValue<boolean>(JULIA_HAS_REPL_KEY)) {
				this.juliaNewlyInstalled = false;
				const version = this.contextKeyService.getContextKeyValue<string>(JULIA_REPL_VERSION_KEY);
				this.notificationService.info(version
					? localize('pollis.juliaVersionReady', "Julia {0} is ready", version)
					: localize('pollis.juliaReady', "Julia is ready"));
			}
		}));
	}

	private async update(): Promise<void> {
		const [datasets, databaseReady] = await Promise.all([
			this.readCatalogue(),
			this.fileService.exists(this.pollisEnvironment).catch(() => false),
		]);
		if (this._store.isDisposed) {
			return;
		}
		this.announceDatabase(databaseReady);
		if (datasets) {
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
	 * Announces the DuckDB database built into Pollis, once Julia is installed. Before it is set up it says that DuckDB
	 * is installed the first time the Julia REPL starts; afterwards that it is ready. Each is shown until it is closed.
	 */
	private announceDatabase(ready: boolean): void {
		const id = ready ? 'databaseReady' : 'databaseBuiltIn';
		if (!this.getJuliaInstalled() || this.getStoredIds(DISMISSED_ANNOUNCEMENTS_KEY).includes(id) || this.shownDatabaseAnnouncement === id) {
			return;
		}
		this.shownDatabaseAnnouncement = id;
		const message = ready
			? localize('pollis.databaseReady', "The built-in database is ready. It holds the PollisDatasets as tables, described column by column. Connect to it from the Databases view to query it as pollis in the Julia REPL.")
			: localize('pollis.databaseBuiltIn', "A database is built in. Pollis comes with a DuckDB database holding the PollisDatasets, so no database server is needed. DuckDB and the datasets are installed the first time the Julia REPL starts.");
		const handle = this.notificationService.prompt(Severity.Info, message,
			[{ label: localize('pollis.openDatabases', "Open Databases View"), run: () => this.commandService.executeCommand(DATABASES_VIEW_COMMAND) }],
			{ sticky: true });
		this.databaseNotification.value = this.closeWhen(handle, () => {
			this.storageService.store(DISMISSED_ANNOUNCEMENTS_KEY, JSON.stringify([...this.getStoredIds(DISMISSED_ANNOUNCEMENTS_KEY), id]), StorageScope.APPLICATION, StorageTarget.USER);
		});
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

	private getJuliaInstalled(): boolean | undefined {
		return this.contextKeyService.getContextKeyValue<boolean>(JULIA_INSTALLED_KEY);
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
