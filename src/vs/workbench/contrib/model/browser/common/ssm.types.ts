/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki, IModelNotebookSection, IModelReference } from './model.types.js';

export interface ISsmTooltips {
	readonly nx?: string;
	readonly ny?: string;
	readonly nu?: string;
	readonly nl?: string;
	readonly nnl?: string;
	readonly nParticles?: string;
	readonly data?: string;
	readonly qScale?: string;
	readonly rScale?: string;
	readonly mu0?: string;
	readonly sigma0?: string;
	readonly dynamics?: string;
	readonly measurement?: string;
}

export interface ISsmMetadata {
	readonly ssm: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly notebookSections: IModelNotebookSection[];
		readonly wikis: IModelWiki[];
		readonly references: IModelReference[];
		readonly tooltips?: ISsmTooltips;
	};
}

export type SsmWebviewMessage =
	| { command: 'openDocs'; target: 'paper' | 'repository' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openVideoList' }
	| { command: 'openUrl'; url: string }
	| { command: 'cancelAction' };
