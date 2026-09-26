/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelNotebookSection, IModelWiki, IModelReference } from './model.types.js';

export interface IGsvizMetadata {
	readonly gsviz: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly notebookSections: IModelNotebookSection[];
		readonly wikis: IModelWiki[];
		readonly references: IModelReference[];
	};
}

export type GsvizWebviewMessage =
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'runCode'; target: 'newFile' | 'juliaRepl' | 'notebook' | 'pluto'; code: string }
	| { command: 'colorize'; code: string; target?: 'main' | 'panel' }
	| { command: 'openReference'; id: string }
	| { command: 'installPackages' };
