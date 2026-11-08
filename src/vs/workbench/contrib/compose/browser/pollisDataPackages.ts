/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// POLLIS: the data packages Pollis installs and updates at each start of the Julia REPL (PollisDB.jl): PollisDatasets,
// PollisJournals, PollisReferences, PollisRSS and PollisBenchmarks. Check for Data Package Updates..., below Check for Updates... in the
// Pollis menu on macOS (menubar.ts) and after About in the Help menu elsewhere, asks GitHub for their latest commits
// and offers to update those that are newer; the Welcome page announces them. The Julia
// extension updates them (language-julia.pollisUpdateDataPackages, update_data_packages.jl).

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IsMacNativeContext } from '../../../../platform/contextkey/common/contextkeys.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IProgressService, ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { asText, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IPathService } from '../../../services/path/common/pathService.js';

/** The menu item; menubar.ts names it for the Pollis menu on macOS. */
export const CHECK_DATA_PACKAGES_COMMAND_ID = 'pollis.checkDataPackageUpdates';

/** Updates the data packages at once, with the spinner and a message: the Update buttons of the check and of the Welcome page. */
export const UPDATE_DATA_PACKAGES_COMMAND_ID = 'pollis.updateDataPackages';

/** The command of the Julia extension that updates the packages. */
const JULIA_UPDATE_COMMAND_ID = 'language-julia.pollisUpdateDataPackages';

/** The version of Julia the REPL runs, set by the Julia extension; the environment of the data packages depends on it. */
export const JULIA_REPL_VERSION_KEY = 'julia.replVersion';

/**
 * The latest commits found on GitHub, when, and the commits installed then, so that GitHub is asked at most once an
 * hour unless the menu asks, or Pollis has updated a package since.
 */
const LATEST_COMMITS_KEY = 'pollis.dataPackages.latest';
const CHECK_INTERVAL = 60 * 60 * 1000;

/**
 * The commit of each data package Pollis last found installed, in which environment, and when it last changed, so
 * that the Databases view marks the database of a package updated.
 */
const INSTALLED_COMMITS_KEY = 'pollis.dataPackages.installed';
/** How long the Databases view marks a database updated, unless it is opened there sooner. */
const UPDATE_SHOWN = 7 * 24 * 60 * 60 * 1000;

/** The data packages, by name, with their repositories on GitHub (Trumpingtons). */
const DATA_PACKAGES: readonly string[] = ['PollisDatasets', 'PollisJournals', 'PollisReferences', 'PollisRSS', 'PollisBenchmarks'];

/** A data package whose installed commit differs from the latest on GitHub. */
export interface IDataPackageChange {
	/** The package and the commit it reaches, which identify the announcement when it is dismissed. */
	readonly id: string;
	readonly name: string;
	readonly from: string;
	readonly to: string;
	/** The commits between the two, on GitHub. */
	readonly url: string;
}

/** What Pollis knows of the data packages: those newer on GitHub than installed, and whether GitHub was reached. */
export interface IDataPackagesCheck {
	readonly newer: readonly IDataPackageChange[];
	readonly offline: boolean;
}

/** A data package Pollis has updated lately, whose database the Databases view marks. */
export interface IDataPackageUpdate {
	readonly name: string;
	/** When Pollis found the package updated. */
	readonly date: number;
	/** The commits between the one installed before and the one installed now, on GitHub. */
	readonly url: string;
}

interface IInstalledCommit {
	readonly environment: string;
	readonly commit: string;
	/** The commit installed before, and when Pollis found it changed; both go once the database is opened. */
	readonly from?: string;
	readonly updated?: number;
}

interface ILatestCommits {
	readonly checked: number;
	readonly commits: Record<string, string | undefined>;
	readonly installed?: Record<string, string>;
}

function change(name: string, from: string, to: string): IDataPackageChange {
	return { id: `${name}@${to}`, name, from, to, url: `https://github.com/Trumpingtons/${name}.jl/compare/${from}...${to}` };
}

/**
 * The data packages Pollis installed, read from the files PollisDB.jl writes beside its environment
 * (~/.pollis/julia/environments/vX.Y/<name>.commit), and their latest commits on GitHub. A package of the user's own
 * has no such file and is left alone.
 */
export class PollisDataPackages {

	constructor(
		@IRequestService private readonly requestService: IRequestService,
		@IStorageService private readonly storageService: IStorageService,
		@IFileService private readonly fileService: IFileService,
		@IPathService private readonly pathService: IPathService,
	) { }

	private get environments(): URI {
		return joinPath(this.pathService.userHome({ preferLocal: true }), '.pollis', 'julia', 'environments');
	}

	/** The packages newer on GitHub than installed; `force` asks GitHub even if it was asked within the hour. */
	async check(juliaVersion: string | undefined, force: boolean): Promise<IDataPackagesCheck> {
		const installed = await this.installed(juliaVersion);
		const { latest, offline } = await this.latest(installed, force);
		const newer: IDataPackageChange[] = [];
		for (const [name, from] of installed) {
			const to = latest.commits[name];
			if (to && to !== from) {
				newer.push(change(name, from, to));
			}
		}
		return { newer, offline };
	}

	/**
	 * The packages Pollis has updated in the last seven days whose databases have not been opened in the Databases
	 * view since. The first time, and in another environment, what is installed is taken as it was.
	 */
	async updates(juliaVersion: string | undefined): Promise<IDataPackageUpdate[]> {
		const environment = (await this.environment(juliaVersion))?.toString() ?? '';
		const installed = await this.installed(juliaVersion);
		const stored = this.installedCommits();
		const now = Date.now();
		let changed = false;
		for (const [name, commit] of installed) {
			const before = stored[name];
			if (before?.environment !== environment) {
				stored[name] = { environment, commit };
				changed = true;
			} else if (before.commit !== commit) {
				stored[name] = { environment, commit, from: before.commit, updated: now };
				changed = true;
			}
		}
		if (changed) {
			this.storageService.store(INSTALLED_COMMITS_KEY, JSON.stringify(stored), StorageScope.APPLICATION, StorageTarget.MACHINE);
		}
		const updates: IDataPackageUpdate[] = [];
		for (const [name, { commit, from, updated }] of Object.entries(stored)) {
			if (installed.has(name) && from && updated !== undefined && now - updated < UPDATE_SHOWN) {
				updates.push({ name, date: updated, url: change(name, from, commit).url });
			}
		}
		return updates;
	}

	/** The database of package `name` opened in the Databases view: it is no longer marked updated. */
	markOpened(name: string): void {
		const stored = this.installedCommits();
		const entry = stored[name];
		if (entry?.updated !== undefined) {
			stored[name] = { environment: entry.environment, commit: entry.commit };
			this.storageService.store(INSTALLED_COMMITS_KEY, JSON.stringify(stored), StorageScope.APPLICATION, StorageTarget.MACHINE);
		}
	}

	private installedCommits(): Record<string, IInstalledCommit> {
		try {
			const stored = JSON.parse(this.storageService.get(INSTALLED_COMMITS_KEY, StorageScope.APPLICATION, '{}'));
			return stored && typeof stored === 'object' ? stored : {};
		} catch {
			return {};
		}
	}

	/** The commit installed of each data package Pollis installed, for the Julia of the REPL, else the newest environment. */
	private async installed(juliaVersion: string | undefined): Promise<Map<string, string>> {
		const folder = await this.environment(juliaVersion);
		const installed = new Map<string, string>();
		if (!folder) {
			return installed;
		}
		for (const name of DATA_PACKAGES) {
			try {
				const commit = (await this.fileService.readFile(joinPath(folder, `${name}.commit`))).value.toString().trim();
				if (commit) {
					installed.set(name, commit);
				}
			} catch {
				// Not installed by Pollis
			}
		}
		return installed;
	}

	/**
	 * The environment of the data packages, beside which their commit files are: the one for the Julia of the REPL,
	 * else the newest. The Welcome page and the Databases view watch it.
	 */
	async environment(juliaVersion: string | undefined): Promise<URI | undefined> {
		const version = juliaVersion ? /^(?<major>\d+)\.(?<minor>\d+)/.exec(juliaVersion)?.groups : undefined;
		if (version) {
			return joinPath(this.environments, `v${version.major}.${version.minor}`);
		}
		try {
			const children = (await this.fileService.resolve(this.environments)).children ?? [];
			const versions = children.map(child => /^v(?<major>\d+)\.(?<minor>\d+)$/.exec(child.name)?.groups).filter(groups => !!groups);
			versions.sort((a, b) => Number(b.major) - Number(a.major) || Number(b.minor) - Number(a.minor));
			return versions.length ? joinPath(this.environments, `v${versions[0].major}.${versions[0].minor}`) : undefined;
		} catch {
			return undefined;
		}
	}

	/** The latest commit of each data package on GitHub; offline, the ones found before, with `offline` set. */
	private async latest(installed: Map<string, string>, force: boolean): Promise<{ latest: ILatestCommits; offline: boolean }> {
		let stored: ILatestCommits | undefined;
		try {
			stored = JSON.parse(this.storageService.get(LATEST_COMMITS_KEY, StorageScope.APPLICATION, 'null')) ?? undefined;
		} catch {
			stored = undefined;
		}
		const now = Object.fromEntries(installed);
		const same = !!stored?.installed && JSON.stringify(stored.installed) === JSON.stringify(now);
		if (!force && stored && same && Date.now() - stored.checked < CHECK_INTERVAL) {
			return { latest: stored, offline: false };
		}
		const found = await Promise.all(DATA_PACKAGES.map(async name => [name, await this.latestCommit(name)] as const));
		if (found.every(([, commit]) => !commit)) {
			return { latest: stored ?? { checked: 0, commits: {} }, offline: true };
		}
		const commits: Record<string, string | undefined> = {};
		for (const [name, commit] of found) {
			commits[name] = commit ?? stored?.commits[name];
		}
		const latest = { checked: Date.now(), commits, installed: now };
		this.storageService.store(LATEST_COMMITS_KEY, JSON.stringify(latest), StorageScope.APPLICATION, StorageTarget.MACHINE);
		return { latest, offline: false };
	}

	private async latestCommit(name: string): Promise<string | undefined> {
		try {
			const context = await this.requestService.request({
				type: 'GET',
				url: `https://api.github.com/repos/Trumpingtons/${name}.jl/commits/main`,
				headers: { 'Accept': 'application/vnd.github.sha' },
				callSite: 'pollis.dataPackages.latestCommit',
			}, CancellationToken.None);
			const commit = isSuccess(context) ? (await asText(context))?.trim() : undefined;
			return commit && /^[0-9a-f]{40}$/.test(commit) ? commit : undefined;
		} catch {
			return undefined;
		}
	}
}

/** What the Julia extension answers: the packages updated and whether GitHub could be reached, or why it could not run. */
interface IDataPackagesAnswer {
	readonly updated?: readonly string[];
	readonly offline?: boolean;
	readonly error?: 'noJulia' | 'busy' | 'failed';
	readonly detail?: string;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: CHECK_DATA_PACKAGES_COMMAND_ID,
			title: {
				...localize2('pollisDataPackages.check', "Check for Data Package Updates..."),
				mnemonicTitle: localize({ key: 'pollisDataPackages.checkMnemonic', comment: ['&& denotes a mnemonic'] }, "Check for &&Data Package Updates..."),
			},
			category: Categories.Help,
			f1: true,
			// After About, which is first in the Help menu on Windows and Linux (helpActions.ts)
			menu: [{ id: MenuId.MenubarHelpMenu, group: '1_about', order: 2, when: IsMacNativeContext.toNegated() }],
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const commandService = accessor.get(ICommandService);
		const notificationService = accessor.get(INotificationService);
		const progressService = accessor.get(IProgressService);
		const juliaVersion = accessor.get(IContextKeyService).getContextKeyValue<string>(JULIA_REPL_VERSION_KEY);
		const dataPackages = accessor.get(IInstantiationService).createInstance(PollisDataPackages);
		const { newer, offline } = await progressService.withProgress(
			{ location: ProgressLocation.Window, type: 'syncing', title: localize('pollisDataPackages.checking', "Checking for data package updates") },
			() => dataPackages.check(juliaVersion, true));
		if (newer.length) {
			notificationService.prompt(Severity.Info, localize('pollisDataPackages.newer', "New data on GitHub: {0}.", newer.map(item => item.name).join(', ')), [{
				label: localize('pollisDataPackages.updateButton', "Update"),
				run: () => commandService.executeCommand(UPDATE_DATA_PACKAGES_COMMAND_ID),
			}]);
		} else if (offline) {
			notificationService.warn(localize('pollisDataPackages.checkOffline', "GitHub could not be reached to check the data packages."));
		} else {
			notificationService.info(localize('pollisDataPackages.upToDate', "The data packages are up to date."));
		}
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: UPDATE_DATA_PACKAGES_COMMAND_ID,
			title: localize2('pollisDataPackages.update', "Update Data Packages"),
			category: Categories.Help,
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const commandService = accessor.get(ICommandService);
		const notificationService = accessor.get(INotificationService);
		const progressService = accessor.get(IProgressService);
		let answer: IDataPackagesAnswer | undefined;
		try {
			answer = await progressService.withProgress(
				{ location: ProgressLocation.Window, type: 'syncing', title: localize('pollisDataPackages.updating', "Updating the data packages") },
				() => commandService.executeCommand<IDataPackagesAnswer>(JULIA_UPDATE_COMMAND_ID));
		} catch {
			// The Julia extension is disabled
			answer = undefined;
		}
		if (!answer) {
			notificationService.warn(localize('pollisDataPackages.noExtension', "The data packages are updated by the Julia extension, which is not running."));
		} else if (answer.error) {
			switch (answer.error) {
				case 'noJulia':
					notificationService.warn(localize('pollisDataPackages.noJulia', "The data packages need Julia, which is not installed yet."));
					break;
				case 'busy':
					notificationService.info(localize('pollisDataPackages.busy', "Pollis is updating the data packages already."));
					break;
				default:
					notificationService.error(localize('pollisDataPackages.failed', "The data packages could not be updated: {0}", answer.detail ?? ''));
			}
		} else if (answer.updated?.length) {
			notificationService.info(localize('pollisDataPackages.updated', "Updated: {0}.", answer.updated.join(', ')));
		} else if (answer.offline) {
			notificationService.warn(localize('pollisDataPackages.offline', "GitHub could not be reached, so the data packages installed are kept."));
		} else {
			notificationService.info(localize('pollisDataPackages.upToDate', "The data packages are up to date."));
		}
	}
});
