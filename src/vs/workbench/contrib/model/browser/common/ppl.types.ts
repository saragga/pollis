/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelNotebookSection, IModelWiki, IModelReference } from './model.types.js';

export interface IPplMetadata {
	readonly ppl: {
		readonly packages:         IModelPackage[];
		readonly notebooks:        IModelNotebook[];
		readonly notebookSections: IModelNotebookSection[];
		readonly wikis:            IModelWiki[];
		readonly references:       IModelReference[];
	};
}

export type PplWebviewMessage =
	| { command: 'openDocs'; target: 'wiki' | 'paper' | 'repository' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'getPaperLinks' }
	| { command: 'openVideoList' }
	| { command: 'cancelAction' };
