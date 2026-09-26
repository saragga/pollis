/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki } from './model.types.js';

export interface IGnnTooltips {
	readonly in_channels?: string;
	readonly hidden_channels?: string;
	readonly out_channels?: string;
	readonly num_layers?: string;
	readonly dropout?: string;
	readonly num_heads?: string;
	readonly aggr?: string;
	readonly time_steps?: string;
	readonly num_relations?: string;
}

export interface IGnnMetadata {
	readonly gnn: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly wikis: IModelWiki[];
		readonly tooltips?: IGnnTooltips;
	};
}

export type GnnWebviewMessage =
	| { command: 'openDocs'; target: 'wiki' | 'documentation' | 'paper' | 'repository' }
	| { command: 'openNotebookList' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'getPaperLinks' }
	| { command: 'cancelAction' };
