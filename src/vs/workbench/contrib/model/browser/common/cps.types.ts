/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki } from './model.types.js';

export interface ICopulaSamplingTooltips {
	readonly dim?:   string;
	readonly rho?:   string;
	readonly nu?:    string;
	readonly theta?: string;
	readonly delta?: string;
	readonly n?:     string;
}

export interface ICopulaSamplingMetadata {
	readonly copulaSampling: {
		readonly packages:  IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly wikis:     IModelWiki[];
		readonly tooltips?: ICopulaSamplingTooltips;
	};
}

export type CopulaSamplingWebviewMessage =
	| { command: 'openDocs'; target: 'wiki' | 'documentation' | 'paper' | 'repository' }
	| { command: 'openNotebookList' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'getPaperLinks' }
	| { command: 'cancelAction' };
