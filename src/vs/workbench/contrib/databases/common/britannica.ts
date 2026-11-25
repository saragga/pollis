/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

// Britannica Through the Editions (../browser/britannicaPage.ts): the articles of the Encyclopaedia Britannica from 1771
// to 1929, from the built-in database PollisBritannica, which PollisDB.jl makes from the artifact of PollisBritannica.jl.
// A DuckDB process (../node/britannicaMain.ts) reads it.

/** The command that opens the page, which the Historical Geography and Archaeology Toolbox's menu runs. */
export const BRITANNICA_COMMAND_ID = 'pollis.britannica.open';

/** An edition of the Britannica: the volumes read, and the articles found in them. */
export interface IBritannicaEdition {
	/** Its key: 1 to 14, and 3S and 6S for the supplements. */
	readonly edition: string;
	readonly label: string;
	readonly years: string;
	readonly volumes: number;
	readonly articles: number;
	/** The characters of all its articles. */
	readonly chars: number;
}

/** An article of an edition, where its scan is, and its length. */
export interface IBritannicaArticle {
	readonly edition: string;
	readonly volume: string;
	/** The item of the Internet Archive that holds its scan. */
	readonly item: string;
	/** The page of the scan where it starts, https://archive.org/details/<item>/page/n<page>; null in a scan without a page index. */
	readonly page: number | null;
	readonly headword: string;
	readonly title: string;
	readonly chars: number;
	/** The contributor's initials, where the article is signed. */
	readonly signature: string | null;
	/** Its first words. */
	readonly opening: string;
}

/** A case: an article followed through the editions, with what changes from one to the next. */
export interface IBritannicaCase {
	readonly id: string;
	readonly title: string;
	readonly summary: string;
}

/** An edition of a lookup: its articles, and for a case, what it says of that edition. */
export interface IBritannicaEntry {
	readonly edition: string;
	readonly articles: readonly IBritannicaArticle[];
	readonly note?: string;
}

/** What the page shows: the editions and the cases, or why it cannot. */
export type IBritannicaState =
	| { readonly kind: 'ready'; readonly editions: readonly IBritannicaEdition[]; readonly cases: readonly IBritannicaCase[] }
	| { readonly kind: 'missing' };

/** A lookup: a case, or the user's own headword. */
export type IBritannicaLookup =
	| { readonly kind: 'case'; readonly id: string }
	| { readonly kind: 'headword'; readonly headword: string };

/** The result of a lookup, an entry per edition; for a headword with no article, headwords that start the same. */
export interface IBritannicaResult {
	readonly entries: readonly IBritannicaEntry[];
	readonly suggestions: readonly string[];
}

/** The queries of PollisBritannica, which the utility process answers. */
export interface IBritannica {
	state(): Promise<IBritannicaState>;
	lookup(lookup: IBritannicaLookup): Promise<IBritannicaResult>;
}

export const IBritannicaService = createDecorator<IBritannicaService>('britannicaService');

/** The queries of PollisBritannica, in a utility process started when first asked. */
export interface IBritannicaService extends IBritannica {
	readonly _serviceBrand: undefined;
}
