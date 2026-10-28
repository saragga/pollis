/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ILocalizedString } from '../../../../platform/action/common/action.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';

// The tabs of Compare Models (compareModelsPage.ts), each a part of its own: its HTML, styles and script in the page,
// its host here, and a command that opens the page at it, so that a tab can later have a menu item or a window of its
// own without being written again.

/** A model chosen on the page, to compare. */
export interface ICompareModel {
	/** What IAskPollisService.answer is asked with: a cloud model's id, or `local:` and a local model's file. */
	readonly value: string;
	readonly label: string;
	/** On this computer, the model's file; in the cloud, nothing. */
	readonly file?: string;
}

/** What the page gives a tab's host. */
export interface ICompareModelsContext {
	/** Sends a message to the tab's script, which its `onMessage` is given. */
	post(message: object): void;
	/** The models chosen on the page, as they are listed: those on this computer first. */
	models(): readonly ICompareModel[];
}

/** A tab's side outside the page: it answers what the tab's script sends. */
export interface ICompareModelsTabHost extends IDisposable {
	onMessage(message: { readonly command: string }): void;
}

/** A tab of Compare Models. */
export interface ICompareModelsTab {
	/** Names the tab in the page and in its messages. */
	readonly id: string;
	/** The command that opens the page at this tab. */
	readonly commandId: string;
	readonly commandTitle: ILocalizedString;
	label(): string;
	readonly css: string;
	/** The tab's content in the page, shown when it is chosen. */
	html(): string;
	/** Its script, which sets `TABS[id] = { onMessage(message) }` and sends with `postTab(id, message)`. */
	script(): string;
	create(accessor: ServicesAccessor, context: ICompareModelsContext): ICompareModelsTabHost;
}
