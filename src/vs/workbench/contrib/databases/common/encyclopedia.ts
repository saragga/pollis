/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The encyclopedias followed through their editions, Britannica Through the Editions and Larousse Through the Editions
// (../browser/encyclopediaPage.ts): the articles of a built-in database that PollisDB.jl makes from the artifact of a
// package, PollisBritannica.jl or PollisLarousse.jl, read by a DuckDB process (../node/encyclopedia.ts), and their texts,
// which the Julia extension downloads the first time one is asked for.

/**
 * What an edition is: a full edition; a supplement, whose volumes added to the editions before it; the new volumes of an
 * edition, sold with the volumes of the one before it; or an edition of which only some volumes are read.
 */
export type EncyclopediaEditionKind = 'full' | 'supplement' | 'newVolumes' | 'partial';

/** An edition of an encyclopedia: the volumes read, and the articles found in them. */
export interface IEncyclopediaEdition {
	/** Its key, as the `edition` column of the database has it. */
	readonly edition: string;
	readonly kind: EncyclopediaEditionKind;
	readonly label: string;
	readonly years: string;
	readonly volumes: number;
	readonly articles: number;
	/** The characters of all its articles. */
	readonly chars: number;
	/** For an edition of which only some volumes are read, the first and last headwords of the volumes read, such as "CARMAGNOLA to HYTHE". */
	readonly range?: string;
}

/** An article of an edition, where its scan is, and its length. */
export interface IEncyclopediaArticle {
	/** Its number, by which the texts of the package give its text. */
	readonly id: number;
	readonly edition: string;
	readonly volume: string;
	/** The item of the Internet Archive that holds its scan. */
	readonly item: string;
	/** The file of its volume, in an item that holds several volumes; null in an item of one volume. */
	readonly file: string | null;
	/** The page of the scan where it starts, https://archive.org/details/<item>/<file>/page/n<page>; null in a scan without a page index. */
	readonly page: number | null;
	readonly headword: string;
	readonly title: string;
	readonly chars: number;
	/** The contributor's initials, where the article is signed; null where it is not, or the encyclopedia signs none. */
	readonly signature: string | null;
}

/** An edition of a lookup: its articles under the headword. */
export interface IEncyclopediaEntry {
	readonly edition: string;
	readonly articles: readonly IEncyclopediaArticle[];
	/** In an edition of which only some volumes are read, that the headword falls outside them. */
	readonly outsideVolumes?: boolean;
}

/** What the page shows: the editions, or why it cannot. */
export type IEncyclopediaState =
	| { readonly kind: 'ready'; readonly editions: readonly IEncyclopediaEdition[] }
	| { readonly kind: 'missing' };

/** A lookup: the user's headword. */
export interface IEncyclopediaLookup {
	readonly headword: string;
}

/** The result of a lookup, an entry per edition; for a headword with no article, headwords that start the same. */
export interface IEncyclopediaResult {
	readonly entries: readonly IEncyclopediaEntry[];
	readonly suggestions: readonly string[];
}

/** The queries of an encyclopedia's database, which a utility process answers. */
export interface IEncyclopedia {
	state(): Promise<IEncyclopediaState>;
	lookup(lookup: IEncyclopediaLookup): Promise<IEncyclopediaResult>;
	/** The text of the article `id`, a paragraph a line, read from `file`, the texts of the package; null when it has none. */
	text(file: string, id: number): Promise<string | null>;
}

/**
 * What the command of the Julia extension that finds an encyclopedia's texts answers: with {task: 'locate'}, {path},
 * the file of the texts, '' when they are not on this computer; with {task: 'download'}, the same once they are
 * downloaded; {error} when it cannot.
 */
export interface IEncyclopediaTextsAnswer {
	readonly path?: string;
	readonly error?: string;
}
