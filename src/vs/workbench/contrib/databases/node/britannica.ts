/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The queries of Britannica Through the Editions (encyclopedia.ts), on the PollisBritannica database that PollisDB.jl
// makes from the artifact of PollisBritannica.jl. britannicaMain.ts runs it in a utility process of its own.

import { EncyclopediaEditionKind } from '../common/encyclopedia.js';
import { EncyclopediaDatabase } from './encyclopedia.js';

/** The editions made of new volumes only, sold with the volumes of the ninth (10) or the eleventh (12, 13). */
const NEW_VOLUMES = new Set(['10', '12', '13']);

/** What an edition is: the supplements' keys end in S. */
function editionKind(edition: string): EncyclopediaEditionKind {
	return edition.endsWith('S') ? 'supplement' : NEW_VOLUMES.has(edition) ? 'newVolumes' : 'full';
}

export class Britannica extends EncyclopediaDatabase {
	constructor() {
		// The editions in their order: 1, 2, 3, 3S, 4 and so on
		super({ file: 'PollisBritannica.duckdb', editionOrder: `try_cast(regexp_extract(edition, '^\\d+') AS INTEGER), edition`, kind: editionKind });
	}
}
