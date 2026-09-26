/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki } from './model.types.js';

export interface IBlsdfTooltips {
	readonly f?: string;
	readonly R?: string;
	readonly psi0?: string;
	readonly intercept?: string;
	readonly sim_length?: string;
	readonly burnin?: string;
	readonly v0?: string;
	readonly v1?: string;
	readonly t_factors?: string;
}

export interface IBlsdfMetadata {
	readonly blsdf: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly wikis: IModelWiki[];
		readonly tooltips?: IBlsdfTooltips;
	};
}

export type BlsdfWebviewMessage =
	| { command: 'openDocs'; target: 'wiki' | 'documentation' | 'paper' | 'repository' }
	| { command: 'openNotebookList' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'getPaperLinks' }
	| { command: 'cancelAction' };
