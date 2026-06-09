/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki } from './model.types.js';

export interface IEvtRiskMetadata {
	evtRisk: {
		packages: IModelPackage[];
		notebooks: IModelNotebook[];
		wikis: IModelWiki[];
		tooltips?: { [key: string]: string };
	};
}

export type EvtRiskWebviewMessage =
	| { command: 'openDocs'; target: 'wiki' | 'paper' | 'repository' | 'documentation' }
	| { command: 'openNotebookList' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'getPaperLinks' }
	| { command: 'cancelAction' }
	| { command: 'openPanel'; target: string };
