/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki } from './model.types.js';

export interface ICnnTooltips {
	readonly in_channels?: string;
	readonly out_channels?: string;
	readonly kernel_size?: string;
	readonly num_layers?: string;
	readonly dilation_base?: string;
	readonly num_blocks?: string;
	readonly dropout?: string;
}

export interface ICnnMetadata {
	readonly cnn: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly wikis: IModelWiki[];
		readonly tooltips?: ICnnTooltips;
	};
}

export type CnnWebviewMessage =
	| { command: 'openDocs'; target: 'wiki' | 'documentation' | 'paper' | 'repository' }
	| { command: 'openNotebookList' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'getPaperLinks' }
	| { command: 'cancelAction' };
