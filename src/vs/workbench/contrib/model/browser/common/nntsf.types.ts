/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki, IModelReference, IModelNotebookSection } from './model.types.js';

export interface INntsfTooltips {
	readonly pool?: string;
	readonly conv?: string;
	readonly recur?: string;
	readonly skip?: string;
	readonly epochs?: string;
	readonly encoder?: string;
	readonly decoder?: string;
	readonly hidden?: string;
	readonly layers?: string;
	readonly filters?: string;
	readonly local?: string;
	readonly kernels?: string;
	readonly dmodel?: string;
}

export interface INntsfMetadata {
	readonly nntsf: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly notebookSections: IModelNotebookSection[];
		readonly wikis: IModelWiki[];
		readonly references: IModelReference[];
		readonly tooltips?: INntsfTooltips;
	};
}

export type NntsfWebviewMessage =
	| { command: 'openDocs'; target: 'paper' | 'repository' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openVideoList' }
	| { command: 'openUrl'; url: string }
	| { command: 'cancelAction' };
