/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanelData } from './model.types.js';

export interface IAlpvMetadata {
	readonly alpv: IScaffoldPanelData;
}

export type AlpvWebviewMessage =
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'runCode'; target: 'newFile' | 'terminal' | 'juliaRepl' | 'notebook' | 'pluto'; code: string }
	| { command: 'colorize'; code: string; target?: string }
	| { command: 'openReference'; id: string }
	| { command: 'installPackages' }
	| { command: 'setApiKey' }
	| { command: 'clearApiKey' };
