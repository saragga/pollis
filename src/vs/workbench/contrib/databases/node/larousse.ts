/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The queries of Larousse Through the Editions (encyclopedia.ts), on the PollisLarousse database that PollisDB.jl makes
// from the artifact of PollisLarousse.jl. larousseMain.ts runs it in a utility process of its own.

import { EncyclopediaEditionKind } from '../common/encyclopedia.js';
import { EncyclopediaDatabase } from './encyclopedia.js';

// allow-any-unicode-next-line
/** The works in their order: the Grand dictionnaire universel, its supplements, the Nouveau Larousse illustré, its supplement and the Larousse du XXe siècle. */
const ORDER = ['GDU', 'GDU-S1', 'GDU-S2', 'NLI', 'NLI-S', 'L20'];

// allow-any-unicode-next-line
/** What a work is: the supplements' keys have an S after a hyphen; the Larousse du XXe siècle is read in two of its six volumes. */
function editionKind(edition: string): EncyclopediaEditionKind {
	return /-S\d*$/.test(edition) ? 'supplement' : edition === 'L20' ? 'partial' : 'full';
}

export class Larousse extends EncyclopediaDatabase {
	constructor() {
		super({ file: 'PollisLarousse.duckdb', editionOrder: `coalesce(list_position([${ORDER.map(edition => `'${edition}'`).join(', ')}], edition), ${ORDER.length + 1}), edition`, kind: editionKind });
	}
}
