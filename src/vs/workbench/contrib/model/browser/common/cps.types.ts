/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
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
