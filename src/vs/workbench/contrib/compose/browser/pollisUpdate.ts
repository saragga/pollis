/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { isLinux, isWindows } from '../../../../base/common/platform.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { asJson, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';

// A notice of new Pollis releases: once a day, the latest release on GitHub is compared with this Pollis's
// pollisVersion (product.json), and a newer one is announced with a button that downloads the file for this
// system. Pollis does not update itself: the user replaces the application with the downloaded one.

const CHECK_SETTING = 'pollis.update.checkForUpdates';
const RELEASES = 'https://github.com/saragga/pollis/releases';
const LATEST_RELEASE_API = 'https://api.github.com/repos/saragga/pollis/releases/latest';
const LAST_CHECK_KEY = 'pollis.update.lastCheck';
const DAY = 24 * 60 * 60 * 1000;

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'pollisUpdate',
	title: localize('pollisUpdate.configurationTitle', "Pollis Updates"),
	type: 'object',
	properties: {
		[CHECK_SETTING]: {
			type: 'boolean',
			default: true,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('pollisUpdate.check', "Check once a day for a new Pollis release on GitHub, and announce it with a link to download it."),
		},
	},
});

/** A release of Pollis on GitHub. */
interface IRelease {
	/** Its version, without the leading `v` of the tag. */
	readonly version: string;
	/** The page of its release notes. */
	readonly notes: string;
}

/** Compares two versions `MAJOR.MINOR.PATCH` by their numbers. */
function compareVersions(a: string, b: string): number {
	const x = a.split('.').map(Number);
	const y = b.split('.').map(Number);
	for (let i = 0; i < Math.max(x.length, y.length); i++) {
		const difference = (x[i] || 0) - (y[i] || 0);
		if (difference) {
			return difference;
		}
	}
	return 0;
}

/** The release file for this system, as the release workflows name it. */
function assetName(): string {
	if (isWindows) {
		return 'Pollis-win32-x64.zip';
	}
	if (isLinux) {
		return 'Pollis-linux-x64.tar.gz';
	}
	return 'Pollis-darwin-arm64.zip';
}

/** The latest release on GitHub. */
async function latestRelease(requestService: IRequestService): Promise<IRelease> {
	const context = await requestService.request({ type: 'GET', url: LATEST_RELEASE_API, headers: { 'Accept': 'application/vnd.github+json' }, callSite: 'pollisUpdate.check' }, CancellationToken.None);
	if (!isSuccess(context)) {
		throw new Error(localize('pollisUpdate.status', "GitHub returned {0}.", context.res.statusCode ?? '?'));
	}
	const release = await asJson<{ tag_name?: string; html_url?: string }>(context);
	if (!release?.tag_name) {
		throw new Error(localize('pollisUpdate.noTag', "GitHub returned no release."));
	}
	return { version: release.tag_name.replace(/^v/, ''), notes: release.html_url ?? `${RELEASES}/latest` };
}

/** The latest release when it is newer than this Pollis, otherwise undefined. */
async function newerRelease(requestService: IRequestService, productService: IProductService): Promise<IRelease | undefined> {
	const release = await latestRelease(requestService);
	return compareVersions(release.version, productService.pollisVersion ?? '0') > 0 ? release : undefined;
}

/** Announces a newer release, with buttons to download it and to read its notes. */
function announce(notificationService: INotificationService, openerService: IOpenerService, productService: IProductService, release: IRelease): void {
	notificationService.prompt(Severity.Info,
		localize('pollisUpdate.available', "Pollis {0} is available (you have {1}). Download it and replace this Pollis with it.", release.version, productService.pollisVersion ?? '?'),
		[
			{ label: localize('pollisUpdate.download', "Download"), run: () => openerService.open(URI.parse(`${RELEASES}/latest/download/${assetName()}`), { openExternal: true }) },
			{ label: localize('pollisUpdate.notes', "Release Notes"), run: () => openerService.open(URI.parse(release.notes), { openExternal: true }) },
		]);
}

/** The daily check, after startup, when the setting allows it. */
class PollisUpdateCheck extends Disposable implements IWorkbenchContribution {
	static readonly ID = 'workbench.contrib.pollisUpdateCheck';

	constructor(
		@IRequestService requestService: IRequestService,
		@IProductService productService: IProductService,
		@IConfigurationService configurationService: IConfigurationService,
		@IStorageService storageService: IStorageService,
		@INotificationService notificationService: INotificationService,
		@IOpenerService openerService: IOpenerService,
		@ILogService logService: ILogService,
	) {
		super();
		const last = storageService.getNumber(LAST_CHECK_KEY, StorageScope.APPLICATION, 0);
		if (!productService.pollisVersion || !configurationService.getValue<boolean>(CHECK_SETTING) || Date.now() - last < DAY) {
			return;
		}
		storageService.store(LAST_CHECK_KEY, Date.now(), StorageScope.APPLICATION, StorageTarget.MACHINE);
		newerRelease(requestService, productService).then(
			release => release && announce(notificationService, openerService, productService, release),
			error => logService.info(`Pollis update check: ${toErrorMessage(error)}`));
	}
}

registerWorkbenchContribution2(PollisUpdateCheck.ID, PollisUpdateCheck, WorkbenchPhase.Eventually);

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.update.check',
			title: localize2('pollisUpdate.checkNow', "Check for Pollis Updates"),
			category: Categories.Help,
			f1: true,
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const requestService = accessor.get(IRequestService);
		const productService = accessor.get(IProductService);
		const notificationService = accessor.get(INotificationService);
		const openerService = accessor.get(IOpenerService);
		try {
			const release = await newerRelease(requestService, productService);
			if (release) {
				announce(notificationService, openerService, productService, release);
			} else {
				notificationService.info(localize('pollisUpdate.upToDate', "Pollis {0} is the latest release.", productService.pollisVersion ?? '?'));
			}
		} catch (error) {
			notificationService.error(localize('pollisUpdate.failed', "Could not check for Pollis updates: {0}", toErrorMessage(error)));
		}
	}
});
