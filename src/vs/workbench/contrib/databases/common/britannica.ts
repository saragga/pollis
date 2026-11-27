/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IEncyclopedia } from './encyclopedia.js';

// Britannica Through the Editions (../browser/britannicaPage.ts): the articles of the Encyclopaedia Britannica from 1771
// to 1929, from the built-in database PollisBritannica, which PollisDB.jl makes from the artifact of PollisBritannica.jl.
// A DuckDB process (../node/britannicaMain.ts) reads it.

/** The command that opens the page, which the Historical Geography Toolbox's menu runs. */
export const BRITANNICA_COMMAND_ID = 'pollis.britannica.open';

/** The command of the Julia extension that finds the texts of PollisBritannica.jl, and downloads them the first time (IEncyclopediaTextsAnswer). */
export const BRITANNICA_TEXTS_COMMAND_ID = 'language-julia.pollisBritannicaTexts';

export const IBritannicaService = createDecorator<IBritannicaService>('britannicaService');

/** The queries of PollisBritannica, in a utility process started when first asked. */
export interface IBritannicaService extends IEncyclopedia {
	readonly _serviceBrand: undefined;
}
