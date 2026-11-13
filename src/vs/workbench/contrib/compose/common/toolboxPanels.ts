/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IAskPollisEvalItem } from './askPollis.js';

/** The command that opens the page where the user chooses a toolbox's panels, given the extension id. */
export const CHOOSE_TOOLBOX_PANELS_COMMAND_ID = 'pollis.toolboxes.choosePanels';

/** The start of the id of a toolbox's own menu, which is not offered as a place for panels. */
export const TOOLBOX_SUBMENU_PREFIX = 'pollisToolbox.';

/** The menu of a panel that is in its toolbox's own menu. */
export const TOOLBOX_MENU = 'toolbox';

/** The menu group that puts a toolbox's menu or panel at the end of a menu. */
export const TOOLBOX_END_GROUP = 'z_toolboxes';

/** A panel of an installed toolbox. */
export interface IToolboxPanelInfo {
	readonly id: string;
	/** The command that opens it. */
	readonly command: string;
	/** Its menu item. */
	readonly title: string;
	/** The title the panel shows, and asks Ask Pollis with: its wikis are indexed under it. */
	readonly panelTitle: string;
	/** The title of the submenu of the toolbox's menu it goes in, if any. */
	readonly submenu?: string;
	/** What it covers, in one line: its models' labels. */
	readonly description?: string;
	/** The keys of the works its References cite. */
	readonly keys: readonly string[];
	/** Its Key Points as plain text, which Ask Pollis indexes with its wikis. */
	readonly keyPoints: readonly string[];
	/** The questions of its FAQ, the hidden ones too, as the Panel FAQ test set of Evaluate Answering Models asks them. */
	readonly faq: readonly IAskPollisEvalItem[];
}

/** A vignette of an installed toolbox, for Help > Documentation > Toolbox Vignettes: LaTeX sources Pollis compiles. */
export interface IToolboxDocumentInfo {
	readonly title: string;
	/** The folder of its sources: the main .tex, its .bib files and a resources/ folder. */
	readonly folder: URI;
	/** The main file's name, without .tex. */
	readonly name: string;
}

/**
 * A text an installed toolbox adds to the Knowledge Base: a PDF its authors share under an open licence, which Pollis
 * downloads from where they keep it, at a fixed version, the first time the user switches it on.
 */
export interface IToolboxTextInfo {
	/** Its id in the toolbox: letters, digits and underscores. */
	readonly id: string;
	/** The key of its work in PollisReferences, if it has one. */
	readonly reference?: string;
	readonly title: string;
	/** Its type, as the type menu of the Knowledge Base lists it: Book, Lecture Notes, Article... */
	readonly type: string;
	readonly edition: string;
	/** Its authors, as "First Last". */
	readonly authors: readonly string[];
	readonly publisher: string;
	readonly year: number;
	readonly subject: string;
	/** The Julia packages it is about, which its subject names first. */
	readonly packages: readonly string[];
	readonly keyWords: readonly string[];
	/** Its classifications, each as "JEL: G12, C58". */
	readonly classifications: readonly string[];
	readonly licence: string;
	readonly licenceUrl: string;
	/** The page of the text on its authors' site. */
	readonly page: string;
	/** The PDF, at a fixed version, which Pollis downloads. */
	readonly download: string;
	/** The SHA-256 of that PDF, in hexadecimal, which the download must match. */
	readonly sha256: string;
	/** Its size, in MB. */
	readonly size: number;
	/** What is changed of it; without one, the PDF of its authors, unchanged. */
	readonly changes?: string;
}

/** A place in the menus: a menu, and the group and order in it that set the position. */
export interface IToolboxPlace {
	/** A menu id, or {@link TOOLBOX_MENU} for a panel in its toolbox's own menu. */
	readonly menu: string;
	readonly group: string;
	readonly order: number;
}

/** Where a toolbox's menu and panels go in the menus. */
export interface IToolboxPlacement {
	/** The place of the toolbox's own menu, `undefined` for no toolbox menu. */
	readonly menu: IToolboxPlace | undefined;
	/** The place of each panel, by panel id. A panel left out is not in the menus. */
	readonly panels: Readonly<Record<string, IToolboxPlace>>;
}

/** A toolbox of an installed extension. */
export interface IToolboxInfo {
	/** The extension id, `<publisher>.<name>`, lower case. */
	readonly extensionId: string;
	readonly id: string;
	readonly title: string;
	/** The extension's name as the user sees it, such as Finance Toolbox. */
	readonly extensionName: string;
	/** The extension's version. */
	readonly version: string;
	readonly panels: readonly IToolboxPanelInfo[];
	readonly documents: readonly IToolboxDocumentInfo[];
	/** The texts it adds to the Knowledge Base. */
	readonly texts: readonly IToolboxTextInfo[];
	/** The default places: the toolbox's menu at the end of Extend, with every panel in. */
	readonly defaultPlacement: IToolboxPlacement;
	/** The places the toolbox is in: the ones the user published, else the default ones. */
	readonly published: IToolboxPlacement;
}

export const IToolboxPanelsService = createDecorator<IToolboxPanelsService>('toolboxPanelsService');

/**
 * The toolboxes of the installed extensions. Installing a toolbox puts its menu, with every panel,
 * at the end of Extend; the user can then publish the panels they choose, in the toolbox's own menu
 * or straight into another menu, and the toolbox's menu at the end of Extend or in another menu.
 */
export interface IToolboxPanelsService {
	readonly _serviceBrand: undefined;

	/** Fires when the installed toolboxes or the published panels change. */
	readonly onDidChange: Event<void>;

	/** The toolboxes of an extension, or of every installed extension. */
	getToolboxes(extensionId?: string): readonly IToolboxInfo[];

	/** Puts a toolbox's menu and panels in the given places; its other panels leave the menus. */
	publish(extensionId: string, toolboxId: string, placement: IToolboxPlacement): void;
}
