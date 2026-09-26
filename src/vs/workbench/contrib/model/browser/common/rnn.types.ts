/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki } from './model.types.js';

export interface IRnnTooltips {
	readonly hidden_size?: string;
	readonly num_layers?: string;
	readonly dropout?: string;
	readonly reservoir_size?: string;
	readonly spectral_radius?: string;
	readonly sparsity?: string;
	readonly leaking_rate?: string;
	readonly num_heads?: string;
}

export interface IRnnMetadata {
	readonly rnn: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly wikis: IModelWiki[];
		readonly tooltips?: IRnnTooltips;
	};
}

export type RnnWebviewMessage =
	| { command: 'openDocs'; target: 'wiki' | 'documentation' | 'paper' | 'repository' }
	| { command: 'openNotebookList' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'getPaperLinks' }
	| { command: 'cancelAction' };
