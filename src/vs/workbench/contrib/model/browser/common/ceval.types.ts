/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki } from './model.types.js';

export interface ICevalTooltips {
	readonly dim?:   string;
	readonly rho?:   string;
	readonly nu?:    string;
	readonly theta?: string;
	readonly delta?: string;
	readonly eval?:  string;
}

export interface ICevalMetadata {
	readonly ceval: {
		readonly packages:  IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly wikis:     IModelWiki[];
		readonly tooltips?: ICevalTooltips;
	};
}

export type CevalWebviewMessage =
	| { command: 'openDocs'; target: 'wiki' | 'documentation' | 'paper' | 'repository' }
	| { command: 'openNotebookList' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'getPaperLinks' }
	| { command: 'cancelAction' };
