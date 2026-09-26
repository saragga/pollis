/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki, IModelReference, IModelNotebookSection } from './model.types.js';

export interface ITsfTooltips {
	readonly series?: string;
	readonly x?: string;
	readonly y?: string;
	readonly degree?: string;
	readonly span?: string;
	readonly error?: string;
	readonly trend?: string;
	readonly seasonal?: string;
	readonly period?: string;
	readonly h?: string;
	readonly order?: string;
	readonly level?: string;
	readonly slope?: string;
	readonly irregular?: string;
	readonly cycle?: string;
}

export interface ITsfMetadata {
	readonly tsf: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly notebookSections: IModelNotebookSection[];
		readonly wikis: IModelWiki[];
		readonly references: IModelReference[];
		readonly tooltips?: ITsfTooltips;
	};
}

export type TsfWebviewMessage =
	| { command: 'openDocs'; target: 'paper' | 'repository' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openVideoList' }
	| { command: 'openUrl'; url: string }
	| { command: 'cancelAction' };
