/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

// Compose > Literature Radar > Snowball Search Map (../browser/snowballSearchPage.ts): its command, the seeds other pages
// give it, and the DuckDB process that holds its tables (../node/snowballDatabaseMain.ts).

export const SNOWBALL_SEARCH_COMMAND_ID = 'pollis.compose.snowballSearch';

/** An article not in the user's references, as Discover Literature lists it: kept in the map's in-memory database. */
export interface ISnowballArticle {
	/** Its DOI, or else the id of the index that found it: openalex:W2008599190, s2:66929d84... */
	readonly id: string;
	readonly doi?: string;
	readonly openAlexId?: string;
	readonly semanticScholarId?: string;
	readonly title: string;
	readonly year: number;
	readonly authors: readonly string[];
	readonly journal?: string;
	readonly cited?: number;
	readonly link: string;
}

/** The seeds another page gives the map: the keys of works in PollisReferences, and articles not saved there. */
export interface ISnowballSeeds {
	readonly keys?: readonly string[];
	readonly articles?: readonly ISnowballArticle[];
}

/** A value of a statement's parameter. */
export type SnowballParameter = string | number | boolean | null;

/** A row of a result, as JSON: a BIGINT is a string, a list an array. */
export type SnowballRow = { readonly [column: string]: SnowballValue };
export type SnowballValue = string | number | boolean | null | readonly SnowballValue[] | { readonly [field: string]: SnowballValue };

/**
 * The map's DuckDB database: an in-memory one, with PollisReferences attached read-only and the map's own tables in
 * the in-memory database `snowball`.
 */
export interface ISnowballDatabase {
	/** Runs `sql`, one statement or several, with its named parameters ($name). */
	run(sql: string, parameters?: Record<string, SnowballParameter>): Promise<void>;
	/** The rows of the statement `sql`, with its named parameters ($name). */
	query(sql: string, parameters?: Record<string, SnowballParameter>): Promise<SnowballRow[]>;
}

export const ISnowballDatabaseService = createDecorator<ISnowballDatabaseService>('snowballDatabaseService');

/** The map's database, in a process of its own started when first asked; one for the window. */
export interface ISnowballDatabaseService extends ISnowballDatabase {
	readonly _serviceBrand: undefined;
}
