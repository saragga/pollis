/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelNotebookSection, IModelWiki, IModelReference } from './model.types.js';

export interface IDstatsMetadata {
	readonly dstats: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly notebookSections: IModelNotebookSection[];
		readonly wikis: IModelWiki[];
		readonly references: IModelReference[];
	};
}

export type DstatsWebviewMessage =
	| { command: 'openDocs'; target: 'paper' | 'repository' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openVideoList' }
	| { command: 'openUrl'; url: string }
	| { command: 'openReference'; id: string }
	| { command: 'cancelAction' };
