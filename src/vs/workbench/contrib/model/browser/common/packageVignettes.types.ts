/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanelData } from './model.types.js';

/** Help > Documentation > Package Vignettes, a page in the Minimal style of the scaffold (vignettesPage.ts). */
export interface IPackageVignettesMetadata {
	readonly packageVignettes: IScaffoldPanelData;
}
