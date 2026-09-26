/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki } from './model.types.js';

export interface ITransformerTooltips {
	readonly d_model?: string;
	readonly num_heads?: string;
	readonly num_layers?: string;
	readonly d_ff?: string;
	readonly dropout?: string;
	readonly seq_len?: string;
	readonly tgt_len?: string;
	readonly pred_len?: string;
	readonly patch_size?: string;
	readonly vocab_size?: string;
	readonly d_num?: string;
}

export interface ITransformerMetadata {
	readonly transformer: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly wikis: IModelWiki[];
		readonly tooltips?: ITransformerTooltips;
	};
}

export type TransformerWebviewMessage =
	| { command: 'openDocs'; target: 'wiki' | 'documentation' | 'paper' | 'repository' }
	| { command: 'openNotebookList' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'getPaperLinks' }
	| { command: 'cancelAction' };
