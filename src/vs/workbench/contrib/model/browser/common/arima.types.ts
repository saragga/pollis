/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelWiki } from './model.types.js';

export interface IArimaTooltips {
	readonly p?: string;
	readonly d?: string;
	readonly q?: string;
	readonly P?: string;
	readonly D?: string;
	readonly Q?: string;
	readonly s?: string;
}

export interface IArimaMetadata {
	readonly arima: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly wikis: IModelWiki[];
		readonly tooltips?: IArimaTooltips;
	};
}

export type ArimaWebviewMessage =
	| { command: 'openDocs'; target: 'wiki' | 'documentation' | 'paper' | 'repository' }
	| { command: 'openNotebookList' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openPanel'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'getPaperLinks' }
	| { command: 'cancelAction' };
