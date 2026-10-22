/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService, NotificationPriority, Severity } from '../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { OPEN_LINK_COMMAND_ID } from '../../monitor/browser/openLink.js';

// What's New in Pollis: the What's New section of each release is in its notes on GitHub. After an update, the
// first start of the new version offers to open them (unless update.showReleaseNotes is off), and Help > What's
// New in Pollis opens them at any time. The updates themselves are found by the Pollis update service
// (platform/update/electron-main/updateService.pollis.ts) and shown as VS Code shows its own.

const RELEASES = 'https://github.com/saragga/pollis/releases';
const LAST_VERSION_KEY = 'pollis.whatsNew.lastVersion';

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

/** The release notes of this version on GitHub, which start with its What's New. */
function whatsNewUrl(productService: IProductService): string {
	return productService.pollisVersion ? `${RELEASES}/tag/v${productService.pollisVersion}` : `${RELEASES}/latest`;
}

/** At the first start of a newer version, the offer to read what is new in it. */
class PollisWhatsNew implements IWorkbenchContribution {
	static readonly ID = 'workbench.contrib.pollisWhatsNew';

	constructor(
		@IProductService productService: IProductService,
		@IConfigurationService configurationService: IConfigurationService,
		@IStorageService storageService: IStorageService,
		@INotificationService notificationService: INotificationService,
		@ICommandService commandService: ICommandService,
	) {
		const version = productService.pollisVersion;
		if (!version) {
			return;
		}
		const last = storageService.get(LAST_VERSION_KEY, StorageScope.APPLICATION);
		storageService.store(LAST_VERSION_KEY, version, StorageScope.APPLICATION, StorageTarget.MACHINE);
		if (last && compareVersions(version, last) > 0 && configurationService.getValue<boolean>('update.showReleaseNotes') !== false) {
			notificationService.prompt(Severity.Info,
				localize('pollisWhatsNew.welcome', "Welcome to Pollis {0}! Would you like to read what is new in it?", version),
				[{ label: localize('pollisWhatsNew.open', "What's New"), run: () => commandService.executeCommand(OPEN_LINK_COMMAND_ID, whatsNewUrl(productService)) }],
				{ priority: NotificationPriority.OPTIONAL });
		}
	}
}

registerWorkbenchContribution2(PollisWhatsNew.ID, PollisWhatsNew, WorkbenchPhase.AfterRestored);

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.whatsNew',
			title: {
				...localize2('pollisWhatsNew.show', "What's New in Pollis"),
				mnemonicTitle: localize({ key: 'pollisWhatsNew.showMnemonic', comment: ['&& denotes a mnemonic'] }, "What's &&New in Pollis"),
			},
			category: Categories.Help,
			f1: true,
			// Above Search Feature Requests (helpActions.ts), which is in '4_feedback' order 2
			menu: [{ id: MenuId.MenubarHelpMenu, group: '4_feedback', order: 1 }],
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		await accessor.get(ICommandService).executeCommand(OPEN_LINK_COMMAND_ID, whatsNewUrl(accessor.get(IProductService)));
	}
});
