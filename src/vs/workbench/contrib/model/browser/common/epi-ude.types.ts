/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelPackage, IModelNotebook, IModelReference } from './model.types.js';

export interface IEpiUdeMetadata {
	readonly epiUde: {
		readonly packages: IModelPackage[];
		readonly notebooks: IModelNotebook[];
		readonly references: IModelReference[];
	};
}

export type EpiUdeWebviewMessage =
	| { command: 'openNotebookList' }
	| { command: 'openNotebook'; target: string }
	| { command: 'openDocs'; target: 'paper' | 'repository' }
	| { command: 'openUrl'; url: string }
	| { command: 'cancelAction' };
