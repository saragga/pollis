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
import { BritannicaEditionKind, IBritannica, IBritannicaArticle, IBritannicaEdition, IBritannicaEntry, IBritannicaLookup, IBritannicaResult, IBritannicaState } from '../common/britannica.js';
import { POLLIS_HOME, sqlString } from './duckdbPollis.js';

/** The database PollisDB.jl makes from the artifact of PollisBritannica.jl. */
const DATABASE = join(POLLIS_HOME, 'databases', 'PollisBritannica.duckdb');

/** The editions in their order: 1, 2, 3, 3S, 4 and so on. */
const EDITION_ORDER = `try_cast(regexp_extract(edition, '^\\d+') AS INTEGER), edition`;

/** The editions made of new volumes only, sold with the volumes of the ninth (10) or the eleventh (12, 13). */
const NEW_VOLUMES = new Set(['10', '12', '13']);

/** What an edition is: the supplements' keys end in S. */
function editionKind(edition: string): BritannicaEditionKind {
	return edition.endsWith('S') ? 'supplement' : NEW_VOLUMES.has(edition) ? 'newVolumes' : 'full';
}

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
			kind: editionKind(String(row.edition)),
			label: String(row.label),
			years: String(row.years),
			volumes: Number(row.volumes),
			articles: Number(row.articles),
			chars: Number(row.chars),
		}));
		return { kind: 'ready', editions };
	}

	async lookup(lookup: IBritannicaLookup): Promise<IBritannicaResult> {
		if (!this.attached && (await this.state()).kind === 'missing') {
			return { entries: [], suggestions: [] };
		}
		// file, the volume's file in an item of several volumes, is read where PollisBritannica.jl gives it (0.1.2 on)
		const columns = `COLUMNS('^(id|edition|volume|item|file|page|headword|title|chars|signature)$')`;
		// The headword before the first comma is the key; the words after it, if any, must be in the title
		const [head, ...rest] = lookup.headword.split(',');
		const key = letters(head);
		const words = letters(rest.join(' '));
		if (!key) {
			return { entries: [], suggestions: [] };
		}
		const rows = await this.rows(`SELECT ${columns} FROM britannica.articles a
			WHERE a.key = ${sqlString(key)}${words ? ` AND regexp_replace(upper(strip_accents(a.title)), '[^A-Z]', '', 'g') LIKE ${sqlString(`%${words}%`)}` : ''}
			ORDER BY a.chars DESC`);
		if (!rows.length) {
			const suggestions = (await this.rows(`SELECT key, count(DISTINCT edition) AS editions FROM britannica.articles
				WHERE key LIKE ${sqlString(`${key.slice(0, Math.max(3, key.length - 2))}%`)}
				GROUP BY key ORDER BY editions DESC, key LIMIT 12`)).map(row => String(row.key));
			return { entries: [], suggestions };
		}
		const editions = (await this.rows(`SELECT edition FROM britannica.editions ORDER BY ${EDITION_ORDER}`)).map(row => String(row.edition));
		const byEdition = new Map<string, IBritannicaArticle[]>(editions.map(edition => [edition, []]));
		for (const row of rows) {
			byEdition.get(String(row.edition))?.push({
				id: Number(row.id),
				edition: String(row.edition),
				volume: String(row.volume),
				item: String(row.item),
				file: typeof row.file === 'string' ? row.file : null,
				page: row.page === null ? null : Number(row.page),
				headword: String(row.headword),
				title: String(row.title),
				chars: Number(row.chars),
				signature: row.signature === null ? null : String(row.signature),
			});
		}
		const entries: IBritannicaEntry[] = editions.map(edition => ({ edition, articles: byEdition.get(edition) ?? [] }));
		return { entries, suggestions: [] };
	}

	async text(file: string, id: number): Promise<string | null> {
		if (!file.endsWith('texts.parquet') || !fs.existsSync(file) || !Number.isInteger(id)) {
			return null;
		}
		const [row] = await this.rows(`SELECT text FROM read_parquet(${sqlString(file)}) WHERE id = ${id}`);
		return row ? String(row.text) : null;
	}
}
