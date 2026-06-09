/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki } from './model.types.js';

export interface IBfmbTooltips {
	readonly f?: string;
	readonly R?: string;
	readonly psi0?: string;
	readonly d?: string;
	readonly intercept?: string;
	readonly sim_length?: string;
	readonly burnin?: string;
	readonly lags?: string;
}

export interface IBfmbMetadata {
	readonly bfmb: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly wikis: IModelWiki[];
		readonly tooltips?: IBfmbTooltips;
	};
}

export type BfmbWebviewMessage =
	| { command: 'openDocs'; target: 'wiki' | 'documentation' | 'paper' | 'repository' }
	| { command: 'openNotebookList' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'getPaperLinks' }
	| { command: 'cancelAction' };
