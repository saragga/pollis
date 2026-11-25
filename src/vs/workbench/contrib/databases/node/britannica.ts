/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The queries of Britannica Through the Editions, on the engine of the duckdb> terminal (@duckdb/node-api): the
// PollisBritannica database attached read-only, and attached again each time the page opens, since PollisDB.jl
// replaces the file when PollisBritannica.jl changes. britannicaMain.ts runs it in a utility process of its own.

import { DuckDBConnection, DuckDBInstance } from '@duckdb/node-api';
import * as fs from 'fs';
import { join } from '../../../../base/common/path.js';
import { IBritannica, IBritannicaArticle, IBritannicaCase, IBritannicaEdition, IBritannicaEntry, IBritannicaLookup, IBritannicaResult, IBritannicaState } from '../common/britannica.js';
import { POLLIS_HOME, sqlString } from './duckdbPollis.js';

/** The database PollisDB.jl makes from the artifact of PollisBritannica.jl. */
const DATABASE = join(POLLIS_HOME, 'databases', 'PollisBritannica.duckdb');

/** The editions in their order: 1, 2, 3, 3S, 4 and so on. */
const EDITION_ORDER = `try_cast(regexp_extract(edition, '^\\d+') AS INTEGER), edition`;

/** The letters A to Z of a text, in capitals: the key of a headword, as PollisBritannica.jl makes it. */
function letters(text: string): string {
	return text.normalize('NFKD').replace(/\u00c6/gi, 'AE').replace(/\u0152/gi, 'OE').toUpperCase().replace(/[^A-Z]/g, '');
}

type Row = { readonly [column: string]: string | number | boolean | null };

export class Britannica implements IBritannica {

	private connection: Promise<DuckDBConnection> | undefined;
	private attached = false;

	private connect(): Promise<DuckDBConnection> {
		this.connection ??= (async () => (await DuckDBInstance.create(':memory:')).connect())();
		return this.connection;
	}

	private async rows(sql: string): Promise<Row[]> {
		const reader = await (await this.connect()).runAndReadAll(sql);
		return reader.getRowObjectsJson() as Row[];
	}

	async state(): Promise<IBritannicaState> {
		const connection = await this.connect();
		if (this.attached) {
			await connection.run('DETACH britannica');
			this.attached = false;
		}
		if (!fs.existsSync(DATABASE)) {
			return { kind: 'missing' };
		}
		await connection.run(`ATTACH ${sqlString(DATABASE)} AS britannica (READ_ONLY)`);
		this.attached = true;
		const editions: IBritannicaEdition[] = (await this.rows(`SELECT * FROM britannica.editions ORDER BY ${EDITION_ORDER}`)).map(row => ({
			edition: String(row.edition),
			label: String(row.label),
			years: String(row.years),
			volumes: Number(row.volumes),
			articles: Number(row.articles),
			chars: Number(row.chars),
		}));
		const cases: IBritannicaCase[] = (await this.rows('SELECT id, any_value(name) AS name, any_value(summary) AS summary, min(rowid) AS first FROM britannica.cases GROUP BY id ORDER BY first')).map(row => ({
			id: String(row.id),
			title: String(row.name),
			summary: String(row.summary),
		}));
		return { kind: 'ready', editions, cases };
	}

	async lookup(lookup: IBritannicaLookup): Promise<IBritannicaResult> {
		if (!this.attached && (await this.state()).kind === 'missing') {
			return { entries: [], suggestions: [] };
		}
		const columns = 'a.edition, a.volume, a.item, a.page, a.headword, a.title, a.chars, a.signature, a.opening';
		let rows: Row[];
		let notes = new Map<string, string>();
		if (lookup.kind === 'case') {
			rows = await this.rows(`SELECT ${columns}
				FROM britannica.cases c JOIN britannica.articles a ON a.edition = c.edition AND a.key = c.key AND (c.article IS NULL OR a.title ILIKE c.article)
				WHERE c.id = ${sqlString(lookup.id)}
				ORDER BY a.chars DESC`);
			notes = new Map((await this.rows(`SELECT edition, note FROM britannica.cases WHERE id = ${sqlString(lookup.id)} AND note IS NOT NULL`)).map(row => [String(row.edition), String(row.note)]));
		} else {
			// The headword before the first comma is the key; the words after it, if any, must be in the title
			const [head, ...rest] = lookup.headword.split(',');
			const key = letters(head);
			const words = letters(rest.join(' '));
			if (!key) {
				return { entries: [], suggestions: [] };
			}
			rows = await this.rows(`SELECT ${columns} FROM britannica.articles a
				WHERE a.key = ${sqlString(key)}${words ? ` AND regexp_replace(upper(strip_accents(a.title)), '[^A-Z]', '', 'g') LIKE ${sqlString(`%${words}%`)}` : ''}
				ORDER BY a.chars DESC`);
			if (!rows.length) {
				const suggestions = (await this.rows(`SELECT key, count(DISTINCT edition) AS editions FROM britannica.articles
					WHERE key LIKE ${sqlString(`${key.slice(0, Math.max(3, key.length - 2))}%`)}
					GROUP BY key ORDER BY editions DESC, key LIMIT 12`)).map(row => String(row.key));
				return { entries: [], suggestions };
			}
		}
		const editions = (await this.rows(`SELECT edition FROM britannica.editions ORDER BY ${EDITION_ORDER}`)).map(row => String(row.edition));
		const byEdition = new Map<string, IBritannicaArticle[]>(editions.map(edition => [edition, []]));
		for (const row of rows) {
			byEdition.get(String(row.edition))?.push({
				edition: String(row.edition),
				volume: String(row.volume),
				item: String(row.item),
				page: row.page === null ? null : Number(row.page),
				headword: String(row.headword),
				title: String(row.title),
				chars: Number(row.chars),
				signature: row.signature === null ? null : String(row.signature),
				opening: String(row.opening),
			});
		}
		const entries: IBritannicaEntry[] = editions.map(edition => ({ edition, articles: byEdition.get(edition) ?? [], note: notes.get(edition) }));
		return { entries, suggestions: [] };
	}
}
