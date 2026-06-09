/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki } from './model.types.js';

export interface IFnnTooltips {
	readonly input_size?: string;
	readonly hidden_size?: string;
	readonly num_layers?: string;
	readonly output_size?: string;
	readonly latent_dim?: string;
	readonly dropout?: string;
	readonly num_components?: string;
}

export interface IFnnMetadata {
	readonly fnn: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly wikis: IModelWiki[];
		readonly tooltips?: IFnnTooltips;
	};
}

export type FnnWebviewMessage =
	| { command: 'openDocs'; target: 'wiki' | 'documentation' | 'paper' | 'repository' }
	| { command: 'openNotebookList' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'getPaperLinks' }
	| { command: 'cancelAction' };
