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

/**
 * What an edition is: a full edition; a supplement (3S, 6S), whose volumes added to the editions before it; or the new
 * volumes of the tenth, twelfth and thirteenth editions, which were sold with the volumes of the ninth or eleventh.
 */
export type BritannicaEditionKind = 'full' | 'supplement' | 'newVolumes';

/** An edition of the Britannica: the volumes read, and the articles found in them. */
export interface IBritannicaEdition {
	/** Its key: 1 to 14, and 3S and 6S for the supplements. */
	readonly edition: string;
	readonly kind: BritannicaEditionKind;
	readonly label: string;
	readonly years: string;
	readonly volumes: number;
	readonly articles: number;
	/** The characters of all its articles. */
	readonly chars: number;
}

/** An article of an edition, where its scan is, and its length. */
export interface IBritannicaArticle {
	/** Its number, by which the texts of PollisBritannica.jl give its text. */
	readonly id: number;
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
}

/** An edition of a lookup: its articles under the headword. */
export interface IBritannicaEntry {
	readonly edition: string;
	readonly articles: readonly IBritannicaArticle[];
}

/** What the page shows: the editions, or why it cannot. */
export type IBritannicaState =
	| { readonly kind: 'ready'; readonly editions: readonly IBritannicaEdition[] }
	| { readonly kind: 'missing' };

/** A lookup: the user's headword. */
export interface IBritannicaLookup {
	readonly headword: string;
}

/** The result of a lookup, an entry per edition; for a headword with no article, headwords that start the same. */
export interface IBritannicaResult {
	readonly entries: readonly IBritannicaEntry[];
	readonly suggestions: readonly string[];
}

/** The queries of PollisBritannica, which the utility process answers. */
export interface IBritannica {
	state(): Promise<IBritannicaState>;
	lookup(lookup: IBritannicaLookup): Promise<IBritannicaResult>;
	/** The text of the article `id`, a paragraph a line, read from `file`, the texts of PollisBritannica.jl; null when it has none. */
	text(file: string, id: number): Promise<string | null>;
}

/**
 * The command of the Julia extension that finds the texts of PollisBritannica.jl: with {task: 'locate'} it answers
 * {path}, the file of the texts, '' when they are not on this computer; with {task: 'download'} it downloads them first.
 */
export const BRITANNICA_TEXTS_COMMAND_ID = 'language-julia.pollisBritannicaTexts';

/** What the command of the texts answers. */
export interface IBritannicaTextsAnswer {
	readonly path?: string;
	readonly error?: string;
}

export const IBritannicaService = createDecorator<IBritannicaService>('britannicaService');

/** The queries of PollisBritannica, in a utility process started when first asked. */
export interface IBritannicaService extends IBritannica {
	readonly _serviceBrand: undefined;
}
