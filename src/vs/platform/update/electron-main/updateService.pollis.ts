/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../base/common/cancellation.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { IMeteredConnectionService } from '../../meteredConnection/common/meteredConnection.js';
import { INativeHostMainService } from '../../native/electron-main/nativeHostMainService.js';
import { IProductService } from '../../product/common/productService.js';
import { asJson, IRequestService } from '../../request/common/request.js';
import { IApplicationStorageMainService } from '../../storage/electron-main/storageMainService.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { AvailableForDownload, State, UpdateType } from '../common/update.js';
import { AbstractUpdateService } from './abstractUpdateService.js';

/**
 * Updates of Pollis on macOS, Windows and Linux. The update URL in product.json is GitHub's API for the latest
 * release of the Pollis repository; a release whose tag (vX.Y.Z) is newer than this Pollis's pollisVersion is
 * offered for download, which the workbench shows as it shows VS Code's updates (the badge on the Manage
 * gear, Download Update in its menu and in the application menu). The apps are not signed, so Pollis does not
 * install the update itself: Download opens the release's file for this system in the browser, the installer
 * on Windows (run over an installed Pollis, it updates it) and the archive on macOS and Linux.
 */
export class PollisUpdateService extends AbstractUpdateService {

	constructor(
		@ILifecycleMainService lifecycleMainService: ILifecycleMainService,
		@IConfigurationService configurationService: IConfigurationService,
		@IEnvironmentMainService environmentMainService: IEnvironmentMainService,
		@IRequestService requestService: IRequestService,
		@ILogService logService: ILogService,
		@INativeHostMainService private readonly nativeHostMainService: INativeHostMainService,
		@IProductService productService: IProductService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IApplicationStorageMainService applicationStorageMainService: IApplicationStorageMainService,
		@IMeteredConnectionService meteredConnectionService: IMeteredConnectionService,
	) {
		super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService, telemetryService, applicationStorageMainService, meteredConnectionService, false);
	}

	protected buildUpdateFeedUrl(): string | undefined {
		return this.productService.updateUrl;
	}

	/** The release file for this system, as the release workflows name it. */
	private assetName(): string {
		switch (process.platform) {
			case 'win32': return 'PollisSetup-x64.exe';
			case 'linux': return 'Pollis-linux-x64.tar.gz';
			default: return 'Pollis-darwin-arm64.zip';
		}
	}

	protected doCheckForUpdates(explicit: boolean): void {
		const url = this.buildUpdateFeedUrl();
		if (!url) {
			return;
		}

		this.setState(State.CheckingForUpdates(explicit));

		this.requestService.request({ url, headers: { 'Accept': 'application/vnd.github+json' }, callSite: 'updateService.pollis.checkForUpdates' }, CancellationToken.None)
			.then(asJson<{ tag_name?: string; html_url?: string }>)
			.then(release => {
				const version = release?.tag_name?.replace(/^v/, '');
				if (!version || compareVersions(version, this.productService.pollisVersion ?? '0') <= 0) {
					this.setState(State.Idle(UpdateType.Archive, undefined, explicit || undefined));
				} else {
					const download = release!.html_url?.replace('/releases/tag/', '/releases/download/');
					this.setState(State.AvailableForDownload({ version, productVersion: version, url: download && `${download}/${this.assetName()}` }));
				}
			})
			.then(undefined, err => {
				this.logService.error(err);
				// only show message when explicitly checking for updates
				const message: string | undefined = explicit ? (err.message || err) : undefined;
				this.setState(State.Idle(UpdateType.Archive, message));
			});
	}

	protected override async doDownloadUpdate(state: AvailableForDownload): Promise<void> {
		if (state.update.url) {
			this.nativeHostMainService.openExternal(undefined, state.update.url);
		}

		this.setState(State.Idle(UpdateType.Archive));
	}
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
