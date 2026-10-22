/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';

/**
 * Opens a link of Pollis's pages (a filing, a quote, an RSS item, an event's company) in the internal browser; one it
 * cannot show there, not a web page or where the internal browser is not available, opens in the external browser
 * only once the user agrees.
 */
export const OPEN_LINK_COMMAND_ID = 'pollis.openLink';

CommandsRegistry.registerCommand(OPEN_LINK_COMMAND_ID, async (accessor: ServicesAccessor, url: string) => {
	const commandService = accessor.get(ICommandService);
	const dialogService = accessor.get(IDialogService);
	const openerService = accessor.get(IOpenerService);
	if (typeof url !== 'string' || !url) {
		return;
	}
	if (/^https?:\/\//i.test(url)) {
		try {
			await commandService.executeCommand('workbench.action.browser.open', url);
			return;
		} catch {
			// No internal browser here: asked below
		}
	}
	const { confirmed } = await dialogService.confirm({
		message: localize('openLink.external', "Open in the external browser?"),
		detail: localize('openLink.externalDetail', "Pollis's internal browser cannot show {0}.", url),
		primaryButton: localize({ key: 'openLink.externalButton', comment: ['&& denotes a mnemonic'] }, "&&Open in External Browser"),
	});
	if (confirmed) {
		await openerService.open(URI.parse(url), { openExternal: true });
	}
});
