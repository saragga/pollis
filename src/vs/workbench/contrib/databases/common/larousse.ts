/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IEncyclopedia } from './encyclopedia.js';

// Larousse Through the Editions (../browser/laroussePage.ts): the articles of the Larousses from 1866 to 1930, the Grand
// allow-any-unicode-next-line
// dictionnaire universel du XIXe siècle and its supplements, the Nouveau Larousse illustré and its supplement and two
// allow-any-unicode-next-line
// volumes of the Larousse du XXe siècle, from the built-in database PollisLarousse, which PollisDB.jl makes from the
// artifact of PollisLarousse.jl. A DuckDB process (../node/larousseMain.ts) reads it.

/** The command that opens the page, which the Historical Geography Toolbox's menu runs. */
export const LAROUSSE_COMMAND_ID = 'pollis.larousse.open';

/** The command of the Julia extension that finds the texts of PollisLarousse.jl, and downloads them the first time (IEncyclopediaTextsAnswer). */
export const LAROUSSE_TEXTS_COMMAND_ID = 'language-julia.pollisLarousseTexts';

export const ILarousseService = createDecorator<ILarousseService>('larousseService');

/** The queries of PollisLarousse, in a utility process started when first asked. */
export interface ILarousseService extends IEncyclopedia {
	readonly _serviceBrand: undefined;
}
