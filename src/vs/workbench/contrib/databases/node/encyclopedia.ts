/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The queries of an encyclopedia followed through its editions (../common/encyclopedia.ts), on the engine of the duckdb>
// terminal (@duckdb/node-api): its built-in database attached read-only, and attached again each time the page opens,
// since PollisDB.jl replaces the file when the package changes. britannica.ts and larousse.ts name the database and
// its editions, and each runs in a utility process of its own.

import { DuckDBConnection, DuckDBInstance } from '@duckdb/node-api';
import * as fs from 'fs';
import { join } from '../../../../base/common/path.js';
import { EncyclopediaEditionKind, IEncyclopedia, IEncyclopediaArticle, IEncyclopediaEdition, IEncyclopediaEntry, IEncyclopediaLookup, IEncyclopediaResult, IEncyclopediaState } from '../common/encyclopedia.js';
import { POLLIS_HOME, sqlString } from './duckdbPollis.js';

/** What tells an encyclopedia's database apart. */
export interface IEncyclopediaDatabase {
	/** The name of the file in ~/.pollis/databases, such as PollisBritannica.duckdb. */
	readonly file: string;
	/** The SQL of the order of the editions, on the column `edition`. */
	readonly editionOrder: string;
	/** What an edition is, by its key. */
	kind(edition: string): EncyclopediaEditionKind;
}

/** The letters A to Z of a text, in capitals: the key of a headword, as PollisBritannica.jl and PollisLarousse.jl make it. */
function letters(text: string): string {
	// allow-any-unicode-next-line
	return text.normalize('NFKD').replace(/Æ/gi, 'AE').replace(/Œ/gi, 'OE').toUpperCase().replace(/[^A-Z]/g, '');
}

type Row = { readonly [column: string]: string | number | boolean | null };

/** The volumes read of an edition of which only some are: the first and last keys of each. */
interface IVolumeRange {
	readonly first: string;
	readonly last: string;
}

export class EncyclopediaDatabase implements IEncyclopedia {

	private connection: Promise<DuckDBConnection> | undefined;
	private attached = false;
	/** The ranges of the volumes read, by edition, for the editions of which only some volumes are read. */
	private ranges = new Map<string, IVolumeRange[]>();

	constructor(private readonly database: IEncyclopediaDatabase) { }

	private connect(): Promise<DuckDBConnection> {
		this.connection ??= (async () => (await DuckDBInstance.create(':memory:')).connect())();
		return this.connection;
	}

	private async rows(sql: string): Promise<Row[]> {
		const reader = await (await this.connect()).runAndReadAll(sql);
		return reader.getRowObjectsJson() as Row[];
	}

	async state(): Promise<IEncyclopediaState> {
		const connection = await this.connect();
		if (this.attached) {
			await connection.run('DETACH encyclopedia');
			this.attached = false;
		}
		const path = join(POLLIS_HOME, 'databases', this.database.file);
		if (!fs.existsSync(path)) {
			return { kind: 'missing' };
		}
		await connection.run(`ATTACH ${sqlString(path)} AS encyclopedia (READ_ONLY)`);
		this.attached = true;
		const rows = await this.rows(`SELECT * FROM encyclopedia.editions ORDER BY ${this.database.editionOrder}`);
		const partial = rows.map(row => String(row.edition)).filter(edition => this.database.kind(edition) === 'partial');
		this.ranges = new Map(partial.map(edition => [edition, []]));
		if (partial.length) {
			for (const row of await this.rows(`SELECT edition, min(key) AS first, max(key) AS last FROM encyclopedia.articles
				WHERE edition IN (${partial.map(sqlString).join(', ')}) GROUP BY edition, volume ORDER BY first`)) {
				this.ranges.get(String(row.edition))?.push({ first: String(row.first), last: String(row.last) });
			}
		}
		const editions: IEncyclopediaEdition[] = rows.map(row => {
			const edition = String(row.edition);
			const ranges = this.ranges.get(edition);
			return {
				edition,
				kind: this.database.kind(edition),
				label: String(row.label),
				years: String(row.years),
				volumes: Number(row.volumes),
				articles: Number(row.articles),
				chars: Number(row.chars),
				// allow-any-unicode-next-line
				...(ranges?.length ? { range: `${ranges[0].first} – ${ranges[ranges.length - 1].last}` } : {}),
			};
		});
		return { kind: 'ready', editions };
	}

	async lookup(lookup: IEncyclopediaLookup): Promise<IEncyclopediaResult> {
		if (!this.attached && (await this.state()).kind === 'missing') {
			return { entries: [], suggestions: [] };
		}
		// The columns a database has of these: file and signature only in PollisBritannica, file from PollisBritannica.jl 0.1.2 on
		const columns = `COLUMNS('^(id|edition|volume|item|file|page|headword|title|chars|signature)$')`;
		// The headword before the first comma is the key; the words after it, if any, must be in the title
		const [head, ...rest] = lookup.headword.split(',');
		const key = letters(head);
		const words = letters(rest.join(' '));
		if (!key) {
			return { entries: [], suggestions: [] };
		}
		const rows = await this.rows(`SELECT ${columns} FROM encyclopedia.articles a
			WHERE a.key = ${sqlString(key)}${words ? ` AND regexp_replace(upper(strip_accents(a.title)), '[^A-Z]', '', 'g') LIKE ${sqlString(`%${words}%`)}` : ''}
			ORDER BY a.chars DESC`);
		if (!rows.length) {
			const suggestions = (await this.rows(`SELECT key, count(DISTINCT edition) AS editions FROM encyclopedia.articles
				WHERE key LIKE ${sqlString(`${key.slice(0, Math.max(3, key.length - 2))}%`)}
				GROUP BY key ORDER BY editions DESC, key LIMIT 12`)).map(row => String(row.key));
			return { entries: [], suggestions };
		}
		const editions = (await this.rows(`SELECT edition FROM encyclopedia.editions ORDER BY ${this.database.editionOrder}`)).map(row => String(row.edition));
		const byEdition = new Map<string, IEncyclopediaArticle[]>(editions.map(edition => [edition, []]));
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
				signature: typeof row.signature === 'string' ? row.signature : null,
			});
		}
		const entries: IEncyclopediaEntry[] = editions.map(edition => {
			const articles = byEdition.get(edition) ?? [];
			const ranges = this.ranges.get(edition);
			const outsideVolumes = !articles.length && !!ranges && !ranges.some(range => range.first <= key && key <= range.last);
			return outsideVolumes ? { edition, articles, outsideVolumes } : { edition, articles };
		});
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
