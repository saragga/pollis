/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelNotebookSection, IModelWiki, IModelReference, IConceptMap, IModelBullet, IModelDecisionRow, IModelMiniChart, IModelCodeBranch, IModelActionGroup, IModelExplorePane, IModelPaneNotes } from './model.types.js';

export interface IKgdsMetadata {
	readonly kgds: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly notebookSections: IModelNotebookSection[];
		readonly wikis: IModelWiki[];
		readonly references: IModelReference[];
		readonly conceptMap?: IConceptMap;
		readonly bullets?: IModelBullet[];
		readonly decisionRows?: IModelDecisionRow[];
		readonly notes?: IModelPaneNotes;
		readonly explore?: IModelExplorePane;
		readonly miniCharts?: IModelMiniChart[];
		readonly codeBranches?: IModelCodeBranch[];
		readonly actionGroups?: IModelActionGroup[];
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
	| { command: 'openDocs'; target: 'paper' | 'repository' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openVideoList' }
	| { command: 'openUrl'; url: string }
	| { command: 'runCode'; target: 'newFile' | 'terminal' | 'juliaRepl' | 'notebook' | 'pluto'; code: string }
	| { command: 'colorize'; code: string; target?: string }
	| { command: 'openReference'; id: string }
	| { command: 'installPackages' }
	| { command: 'setApiKey' }
	| { command: 'clearApiKey' }
	| { command: 'cancelAction' }
	| { command: 'fetchKgdsDatasets'; sort: string; filterGroups: string[][]; limit: number; seq?: number };
