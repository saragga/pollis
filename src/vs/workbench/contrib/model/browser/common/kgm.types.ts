/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelExplorePane, IModelPaneNotes, IScaffoldPanelData } from './model.types.js';

export interface IKgmMetadata {
	readonly kgm: IScaffoldPanelData & {
		readonly notes?: IModelPaneNotes;
		/** The Explore pane; its axes are `task` (search term), `framework` (comma-separated framework ids) and `author` (owner slug). */
		readonly explore?: IModelExplorePane;
	};
}

/** A model card fetched from the Kaggle API and sent to the webview. */
export interface IKgmApiModel {
	readonly ref: string;
	readonly title: string;
	readonly author: string;
	readonly framework: string;
	readonly allFrameworks: string[];
	readonly voteCount: number;
	readonly updateTime: string;
	readonly url: string;
}

export type KgmWebviewMessage =
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'runCode'; target: 'newFile' | 'juliaRepl' | 'notebook' | 'pluto'; code: string }
	| { command: 'colorize'; code: string; target?: string }
	| { command: 'openReference'; id: string }
	| { command: 'installPackages' }
	| { command: 'setApiKey' }
	| { command: 'clearApiKey' }
	| { command: 'fetchKgmModels'; sortBy: string; frameworks: string[]; authors: string[]; search: string; pageSize: number; seq?: number };