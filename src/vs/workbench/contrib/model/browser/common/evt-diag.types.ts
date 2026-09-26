/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki } from './model.types.js';

export interface IEvtDiagMetadata {
	evtDiag: {
		packages: IModelPackage[];
		notebooks: IModelNotebook[];
		wikis: IModelWiki[];
		tooltips?: { [key: string]: string };
	};
}

export type EvtDiagWebviewMessage =
	| { command: 'openDocs'; target: 'wiki' | 'paper' | 'repository' | 'documentation' }
	| { command: 'openNotebookList' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'getPaperLinks' }
	| { command: 'cancelAction' }
	| { command: 'openPanel'; target: string };
