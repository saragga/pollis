/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelReference } from './model.types.js';

export interface IEpiUdeMetadata {
	readonly epiUde: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly references: IModelReference[];
	};
}

export type EpiUdeWebviewMessage =
	| { command: 'openNotebookList' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openDocs'; target: 'paper' | 'repository' }
	| { command: 'openUrl'; url: string }
	| { command: 'cancelAction' };
