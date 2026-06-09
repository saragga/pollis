/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki, IModelNotebookSection, IModelReference } from './model.types.js';

export interface IAtsfTooltips {
	readonly series?: string;
	readonly periods?: string;
	readonly theta?: string;
	readonly period?: string;
	readonly method?: string;
	readonly h?: string;
}

export interface IAtsfMetadata {
	readonly atsf: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly notebookSections: IModelNotebookSection[];
		readonly wikis: IModelWiki[];
		readonly references: IModelReference[];
		readonly tooltips?: IAtsfTooltips;
	};
}

export type AtsfWebviewMessage =
	| { command: 'openDocs'; target: 'paper' | 'repository' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openVideoList' }
	| { command: 'openUrl'; url: string }
	| { command: 'cancelAction' };
