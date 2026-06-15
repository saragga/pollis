/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelNotebookSection, IModelWiki, IModelReference, IConceptMap } from './model.types.js';

export interface IKgmMetadata {
	readonly kgm: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly notebookSections: IModelNotebookSection[];
		readonly wikis: IModelWiki[];
		readonly references: IModelReference[];
		readonly conceptMap?: IConceptMap;
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
	| { command: 'openDocs'; target: 'paper' | 'repository' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openVideoList' }
	| { command: 'openUrl'; url: string }
	| { command: 'runCode'; target: 'newFile' | 'juliaRepl' | 'notebook' | 'pluto'; code: string }
	| { command: 'colorize'; code: string; target?: string }
	| { command: 'showReferences'; references: Array<Extract<IModelReference, { readonly title: string }>> }
	| { command: 'openReference'; id: string }
	| { command: 'installPackages' }
	| { command: 'cancelAction' }
	| { command: 'setApiKey' }
	| { command: 'clearApiKey' }
	| { command: 'fetchKgmModels'; sortBy: string; frameworks: string[]; authors: string[]; search: string; pageSize: number; seq?: number };