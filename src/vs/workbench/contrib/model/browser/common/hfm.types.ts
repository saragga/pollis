/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelExplorePane, IModelPaneNotes, IScaffoldPanelData } from './model.types.js';

export interface IHfmMetadata {
	readonly hfm: IScaffoldPanelData & {
		readonly notes?: IModelPaneNotes;
		/** The Explore pane; its axes are `task` (pipeline tag), `framework` (tag filter) and `author`. */
		readonly explore?: IModelExplorePane;
	};
}

/** A model card fetched from the HF API and sent to the webview. */
export interface IHfApiModel {
	readonly id: string;
	readonly pipeline_tag: string;
	readonly downloads: number;
	readonly likes: number;
	readonly lastModified: string;
	readonly createdAt: string;
}

export type HfmWebviewMessage =
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'runCode'; target: 'newFile' | 'juliaRepl' | 'notebook' | 'pluto'; code: string }
	| { command: 'colorize'; code: string; target?: string }
	| { command: 'openReference'; id: string }
	| { command: 'installPackages' }
	| { command: 'setApiKey' }
	| { command: 'clearApiKey' }
	| { command: 'fetchHfModels'; sort: string; tags: string[]; authors: string[]; filters: string[]; limit: number; seq?: number };
