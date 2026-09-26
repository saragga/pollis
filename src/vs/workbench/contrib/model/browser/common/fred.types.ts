/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelNotebookSection, IModelWiki, IModelReference, IModelBullet, IModelDecisionRow, IModelMiniChart, IModelCodeBranch, IModelActionGroup } from './model.types.js';

export interface IFredMetadata {
	readonly fred: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly notebookSections: IModelNotebookSection[];
		readonly wikis: IModelWiki[];
		readonly references: IModelReference[];
		readonly bullets?: IModelBullet[];
		readonly decisionRows?: IModelDecisionRow[];
		readonly miniCharts?: IModelMiniChart[];
		readonly codeBranches?: IModelCodeBranch[];
		readonly actionGroups?: IModelActionGroup[];
	};
}

export type FredWebviewMessage =
	| { command: 'openNotebook'; target: string }
	| { command: 'openWiki'; target: string }
	| { command: 'openUrl'; url: string }
	| { command: 'runCode'; target: 'newFile' | 'terminal' | 'juliaRepl' | 'notebook' | 'pluto'; code: string }
	| { command: 'colorize'; code: string; target?: string }
	| { command: 'openReference'; id: string }
	| { command: 'installPackages' }
	| { command: 'setApiKey' }
	| { command: 'clearApiKey' };
