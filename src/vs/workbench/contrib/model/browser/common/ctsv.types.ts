/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki } from './model.types.js';

export interface ICtsvTooltips {
	readonly kappa?: string;
	readonly theta?: string;
	readonly xi?: string;
	readonly rho?: string;
	readonly mu?: string;
	readonly S0?: string;
	readonly v0?: string;
	readonly T?: string;
	readonly lambda?: string;
	readonly muJ?: string;
	readonly sigmaJ?: string;
	readonly alpha?: string;
	readonly beta?: string;
	readonly F0?: string;
}

export interface ICtsvMetadata {
	readonly ctsv: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly wikis: IModelWiki[];
		readonly tooltips?: ICtsvTooltips;
	};
}

export type CtsvWebviewMessage =
	| { command: 'openDocs'; target: 'wiki' | 'documentation' | 'paper' | 'repository' }
	| { command: 'openNotebookList' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openPanel'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'getPaperLinks' }
	| { command: 'cancelAction' };
