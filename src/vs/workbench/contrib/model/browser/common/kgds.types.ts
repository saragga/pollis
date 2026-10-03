/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelExplorePane, IModelPaneNotes, IScaffoldPanelData } from './model.types.js';

export interface IKgdsMetadata {
	readonly kgds: IScaffoldPanelData & {
		readonly notes?: IModelPaneNotes;
		readonly explore?: IModelExplorePane;
	};
}

/** A dataset card fetched from the Kaggle API and sent to the webview. */
export interface IKgApiDataset {
	readonly id: string;
	readonly downloads: number;
	readonly votes: number;
	readonly lastModified: string;
}

export type KgdsWebviewMessage =
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'runCode'; target: 'newFile' | 'juliaRepl' | 'notebook' | 'pluto'; code: string }
	| { command: 'colorize'; code: string; target?: string }
	| { command: 'openReference'; id: string }
	| { command: 'installPackages' }
	| { command: 'setApiKey' }
	| { command: 'clearApiKey' }
	| { command: 'fetchKgdsDatasets'; sort: string; filterGroups: string[][]; limit: number; seq?: number };
