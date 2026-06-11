/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelNotebookSection, IModelWiki, IModelReference, IConceptMap } from './model.types.js';

export interface IHfmMetadata {
	readonly hfm: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly notebookSections: IModelNotebookSection[];
		readonly wikis: IModelWiki[];
		readonly references: IModelReference[];
		readonly conceptMap?: IConceptMap;
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
	| { command: 'openDocs'; target: 'paper' | 'repository' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openVideoList' }
	| { command: 'openUrl'; url: string }
	| { command: 'runCode'; target: 'newFile' | 'juliaRepl' | 'notebook' | 'pluto'; code: string }
	| { command: 'colorize'; code: string; target?: string }
	| { command: 'showReferences'; references: Array<Extract<IModelReference, { readonly title: string }>> }
	| { command: 'openReference'; id: string }
	| { command: 'cancelAction' }
	| { command: 'fetchHfModels'; sort: string; tags: string[]; authors: string[]; filters: string[]; limit: number; seq?: number };
