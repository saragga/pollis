/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Sequencer } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { asJson, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { CREDENTIALS } from '../../model/browser/common/credentials.js';
import { voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';
import { FEWEST_ROWS, isRowsChoice, rowsChoiceCss, rowsChoiceScript, storedRows, storeRows } from '../../model/browser/webviews/webviewPager.js';
import { OPEN_LINK_COMMAND_ID } from '../../monitor/browser/openLink.js';
import { ISnowballArticle, ISnowballDatabaseService, ISnowballSeeds, SNOWBALL_SEARCH_COMMAND_ID, SnowballRow } from '../common/snowballSearch.js';
import { IOpenAlexWork, OPENALEX_TYPES, openAlexIdOf } from './literatureRadarPage.js';

// Compose > Literature Radar > Snowball Search Map: from a few works the user knows, the seeds, the works their citations lead
// to, poured into one pool ranked by how many seeds each is tied to (Links). The seeds come from PollisReferences, the
// references Pollis brings and the user's, by their keys; Discover Literature's articles not saved there are kept in the
// map's in-memory database. Each action is a step of the map's record, a TOML file of [[step]]s in ~/.pollis/literature,
// the works found in a DuckDB file beside it; the map drawn on the page is drawn from the steps. This first version
// follows the works that cite each seed (Cited By), as OpenAlex lists them.

/** What a step of the map did: made a work a seed, listed the works citing a seed, or removed a seed. */
type StepAction = 'seed' | 'cited_by' | 'remove';

/** A step of the map, as its record keeps it. */
interface ISnowballStep {
	/** E1, E2... for a seed, L1, L2... for a list; a removal has none. */
	readonly id?: string;
	readonly action: StepAction;
	/** Where a seed came from (PollisReferences, Discover Literature, or the lists of the pool it was in), the seed a list or a removal is of. */
	readonly from: string | readonly string[];
	/** When, in UTC, to the second. */
	readonly at: string;
	/** A seed's key in PollisReferences, or else its article (a DOI, or an index's id). */
	readonly key?: string;
	readonly article?: string;
	/** A seed's first author and year, for the map, and its title. */
	readonly label?: string;
	readonly title?: string;
	/** For a list: the works listed, the works the index has, and the works new to the pool. */
	readonly listed?: number;
	readonly found?: number;
	readonly added?: number;
}

/** The map now in the page: kept while the window is open, the page closed or not. */
interface ISnowballMap {
	name?: string;
	steps: ISnowballStep[];
	/** Whether it has steps not saved. */
	dirty: boolean;
}

type SnowballMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'citedBy'; readonly seeds: readonly string[] }
	| { readonly command: 'seedWork'; readonly work: string }
	| { readonly command: 'seedKey'; readonly key: string }
	| { readonly command: 'remove'; readonly seed: string }
	| { readonly command: 'view'; readonly show: string; readonly page: number; readonly rows?: number }
	| { readonly command: 'find'; readonly text: string }
	| { readonly command: 'save'; readonly name: string; readonly replace: boolean }
	| { readonly command: 'maps' }
	| { readonly command: 'open'; readonly file: string }
	| { readonly command: 'new' }
	| { readonly command: 'openUrl'; readonly url: string };

const ACTIONS: readonly StepAction[] = ['seed', 'cited_by', 'remove'];
/** Where seeds come from, besides the pool's lists. */
const FROM_REFERENCES = 'PollisReferences';
const FROM_DISCOVER = 'Discover Literature';
/** The fields of a citing work asked of OpenAlex. */
const CITED_BY_SELECT = 'id,doi,title,publication_year,cited_by_count,primary_location,authorships';
// OpenAlex lists at most 200 works a request: the 2,000 most cited works citing a seed are listed, ten requests
const CITED_BY_PAGE = 200;
const CITED_BY_LISTED = 2000;
const CALL_SITE = 'pollis.snowballSearch';
/** The rows of the pool a page shows, and the top whose newcomers tell how close the pool is to saturation. */
const TOP = 20;

/** The map's tables, in the in-memory database `snowball`; a seed is a work of PollisReferences (key) or an article. */
const TABLES = `CREATE TABLE IF NOT EXISTS snowball.articles (id VARCHAR PRIMARY KEY, doi VARCHAR, openalex VARCHAR, s2 VARCHAR, title VARCHAR, authors VARCHAR[], year INTEGER, journal VARCHAR, cited INTEGER, link VARCHAR);
CREATE TABLE IF NOT EXISTS snowball.seeds (id VARCHAR PRIMARY KEY, key VARCHAR, article VARCHAR, openalex VARCHAR, removed BOOLEAN DEFAULT false);
CREATE TABLE IF NOT EXISTS snowball.works (openalex VARCHAR PRIMARY KEY, doi VARCHAR, title VARCHAR, authors VARCHAR[], year INTEGER, journal VARCHAR, cited INTEGER, link VARCHAR, first_list VARCHAR);
CREATE TABLE IF NOT EXISTS snowball.links (work VARCHAR, seed VARCHAR, relation VARCHAR, list VARCHAR, PRIMARY KEY (work, seed, relation));
CREATE OR REPLACE VIEW snowball.seed_works AS
	SELECT s.id, s.key, s.article, s.removed, coalesce(s.openalex, r.openalex, a.openalex) AS openalex, lower(coalesce(r.doi, a.doi)) AS doi,
		coalesce(r.title, a.title) AS title, coalesce(r.authors, a.authors) AS authors, coalesce(r.year, a.year) AS year, coalesce(r.journal, r.booktitle, a.journal) AS journal,
		coalesce(r.url, a.link) AS link
	FROM snowball.seeds s
	LEFT JOIN PollisReferences.all_references r ON r.key = s.key AND NOT coalesce(r.removed, false)
	LEFT JOIN snowball.articles a ON a.id = s.article`;
const TABLE_NAMES = ['articles', 'seeds', 'works', 'links'];

/** The pool ranked: by Links, the active seeds a work is tied to, then by its citations. */
const RANKED = `WITH active AS (SELECT id, openalex FROM snowball.seed_works WHERE NOT removed),
pool AS (
	SELECT w.openalex, any_value(w.doi) AS doi, any_value(w.title) AS title, any_value(w.authors) AS authors, any_value(w.year) AS year,
		any_value(w.journal) AS journal, any_value(w.cited) AS cited, any_value(w.link) AS link, any_value(w.first_list) AS first_list,
		count(DISTINCT a.id)::INTEGER AS links,
		list(DISTINCT l.relation || ' ' || a.id) FILTER (WHERE a.id IS NOT NULL) AS how,
		list(DISTINCT l.list) AS lists
	FROM snowball.works w JOIN snowball.links l ON l.work = w.openalex LEFT JOIN active a ON a.id = l.seed
	GROUP BY w.openalex),
ranked AS (
	SELECT pool.*, s.id AS seed, (row_number() OVER (ORDER BY links DESC, cited DESC NULLS LAST, title))::INTEGER AS rank
	FROM pool LEFT JOIN active s ON s.openalex = pool.openalex)`;
/** Whether a ranked work is shown: all, those of one list, or those the last list added. */
const SHOWN = `($show = 'all' OR ($show = 'new' AND first_list = $last) OR list_contains(lists, $show))`;

let openPage: WebviewInput | undefined;
/** The open page's handler of the seeds another page gives it. */
let addToOpenPage: ((seeds: ISnowballSeeds) => void) | undefined;
const map: ISnowballMap = { steps: [], dirty: false };

/** The last name of `name`, written either "Last, First" or "First Last". */
function lastName(name: string): string {
	return name.includes(',') ? name.split(',')[0].trim() : name.trim().split(/\s+/).at(-1) ?? '';
}

/** The label of a seed on the map: its first author's last name and its year. */
function seedLabel(authors: readonly string[] | undefined, year: number | undefined): string {
	return [authors?.length ? lastName(authors[0]) : '', year ?? ''].filter(part => part !== '').join(' ');
}

/** The next id of a seed (E) or a list (L). */
function nextId(prefix: 'E' | 'L'): string {
	return `${prefix}${map.steps.filter(step => step.id?.startsWith(prefix)).length + 1}`;
}

/** Now, in UTC, to the second, as TOML writes a date-time. */
function now(): string {
	return new Date().toISOString().replace(/\.\d+Z$/, 'Z');
}

/** A value of the record in TOML: a basic string written as JSON writes it, a number, a date-time (`at`), or a list of strings. */
function tomlValue(name: string, value: string | number | readonly string[]): string {
	if (typeof value === 'number' || name === 'at') {
		return String(value);
	}
	return typeof value === 'string' ? JSON.stringify(value) : `[${value.map(item => JSON.stringify(item)).join(', ')}]`;
}

/** The record of `map` in TOML. */
function recordToml(name: string, steps: readonly ISnowballStep[]): string {
	const lines = [
		'# A Snowball Search Map of Pollis: one [[step]] for each action, in order. The works found are in the DuckDB file of the same name beside it.',
		`name = ${JSON.stringify(name)}`,
	];
	for (const step of steps) {
		lines.push('', '[[step]]');
		for (const [field, value] of Object.entries(step)) {
			if (value !== undefined) {
				lines.push(`${field} = ${tomlValue(field, value)}`);
			}
		}
	}
	return lines.join('\n') + '\n';
}

/** The name and steps of a record, read as `recordToml` writes it; steps it cannot read are left out. */
function parseRecord(text: string): { name?: string; steps: ISnowballStep[] } {
	const top: Record<string, unknown> = {};
	const tables: Record<string, unknown>[] = [];
	let target = top;
	for (const raw of text.split(/\r?\n/)) {
		const line = raw.trim();
		if (!line || line.startsWith('#')) {
			continue;
		}
		if (line === '[[step]]') {
			target = {};
			tables.push(target);
			continue;
		}
		const match = /^(?<field>[A-Za-z_][\w-]*)\s*=\s*(?<value>.+)$/.exec(line);
		if (!match?.groups) {
			continue;
		}
		const value = match.groups.value.trim();
		try {
			target[match.groups.field] = value.startsWith('"') || value.startsWith('[') ? JSON.parse(value) : /^-?\d+$/.test(value) ? Number(value) : value;
		} catch {
			// A value the map did not write is skipped
		}
	}
	const text_ = (value: unknown) => typeof value === 'string' && value ? value : undefined;
	const count = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : undefined;
	const steps = tables.flatMap((table): ISnowballStep[] => {
		const action = ACTIONS.find(action => action === table.action);
		const from = Array.isArray(table.from) ? table.from.filter((item): item is string => typeof item === 'string') : text_(table.from);
		const at = text_(table.at);
		if (!action || !from || !at) {
			return [];
		}
		return [{
			id: text_(table.id), action, from, at, key: text_(table.key), article: text_(table.article), label: text_(table.label), title: text_(table.title),
			listed: count(table.listed), found: count(table.found), added: count(table.added),
		}];
	});
	return { name: text_(top.name), steps };
}

/** The name of a map's files: its name, without the characters a file name cannot have. */
function fileName(name: string): string {
	return name.trim().replace(/[\\/:*?"<>|]/g, '-').replace(/^\.+/, '') || 'map';
}

/** A string in DuckDB's SQL. */
function sqlString(text: string): string {
	return `'${text.replace(/'/g, `''`)}'`;
}

function text(value: unknown): string | undefined {
	return typeof value === 'string' && value ? value : undefined;
}

function openSnowballSearch(accessor: ServicesAccessor, seeds: ISnowballSeeds | undefined): void {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const requestService = accessor.get(IRequestService);
	const secretStorageService = accessor.get(ISecretStorageService);
	const commandService = accessor.get(ICommandService);
	const fileService = accessor.get(IFileService);
	const database = accessor.get(ISnowballDatabaseService);
	const storageService = accessor.get(IStorageService);
	const folder = joinPath(accessor.get(IPathService).userHome({ preferLocal: true }), '.pollis', 'literature');

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		if (seeds) {
			addToOpenPage?.(seeds);
		}
		return;
	}
	const title = localize('snowball.title', "Snowball Search Map");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.snowballSearch',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());
	openPage = webviewInput;

	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		addToOpenPage = undefined;
		disposables.dispose();
	}));

	// The page's actions, one at a time: a list being fetched is finished before the next action reads the pool
	const sequencer = new Sequencer();
	// The works shown: all, one list's or the new ones; the page, from 0, of `rows` works each (0 for all)
	const view = { show: 'all', page: 0, rows: storedRows(storageService, 'snowball', FEWEST_ROWS) };
	// The seeds given before the page was ready
	let pending: ISnowballSeeds | undefined = seeds;
	let ready = false;

	const post = (message: object) => webviewInput.webview.postMessage(message);
	const tell = (message: string, error = false) => post({ command: 'notes', message, error });
	const step = (added: ISnowballStep) => {
		map.steps.push(added);
		map.dirty = true;
	};

	const seedRows = async (): Promise<SnowballRow[]> => database.query(`SELECT id, key, article, openalex, doi, title, authors, year, journal, link FROM snowball.seed_works WHERE NOT removed ORDER BY TRY_CAST(substr(id, 2) AS INTEGER)`);

	/** The page's state: the record, the seeds, and the page of the pool shown. */
	const postState = async () => {
		await database.run(TABLES);
		const lists = map.steps.filter(step => step.action === 'cited_by' && step.id).map(step => step.id!);
		const last = lists.at(-1) ?? '';
		if (view.show !== 'all' && view.show !== 'new' && !lists.includes(view.show)) {
			view.show = 'all';
		}
		const parameters = { show: view.show, last };
		const [summary] = await database.query(`${RANKED}
			SELECT count(*)::INTEGER AS total, (count(*) FILTER (WHERE first_list = $last))::INTEGER AS added,
				(count(*) FILTER (WHERE first_list = $last AND rank <= ${TOP}))::INTEGER AS added_top, (count(*) FILTER (WHERE ${SHOWN}))::INTEGER AS shown
			FROM ranked`, parameters);
		const shown = typeof summary?.shown === 'number' ? summary.shown : 0;
		const size = view.rows || Math.max(1, shown);
		view.page = Math.max(0, Math.min(view.page, Math.ceil(shown / size) - 1));
		const rows = await database.query(`${RANKED} SELECT * FROM ranked WHERE ${SHOWN} ORDER BY rank LIMIT ${size} OFFSET ${view.page * size}`, parameters);
		post({ command: 'state', name: map.name, dirty: map.dirty, steps: map.steps, seeds: await seedRows(), summary, rows, lists, view });
	};

	/** Makes the works with `keys` in PollisReferences, and the `articles` not there, seeds: those that are not already. */
	const addSeeds = async (given: ISnowballSeeds) => {
		await database.run(TABLES);
		const keys = (Array.isArray(given.keys) ? given.keys : []).filter((key): key is string => typeof key === 'string' && !!key);
		const articles = (Array.isArray(given.articles) ? given.articles : []).filter(isArticle);
		const active = await seedRows();
		const isSeed = (key: string | undefined, openAlexId: string | undefined, doi: string | undefined) => text(active.find(seed =>
			key && seed.key === key || openAlexId && seed.openalex === openAlexId || doi && seed.doi === doi.toLowerCase())?.id);
		const notes: string[] = [];
		const references = keys.length ? await database.query(
			`SELECT key, title, authors, year, openalex, doi FROM PollisReferences.all_references WHERE key IN (SELECT unnest(from_json($keys, '["VARCHAR"]'))) AND NOT coalesce(removed, false)`,
			{ keys: JSON.stringify(keys) }) : [];
		const missing = keys.filter(key => !references.some(reference => reference.key === key));
		if (missing.length) {
			notes.push(localize('snowball.notInReferences', "Not in PollisReferences: {0}.", missing.join(', ')));
		}
		for (const reference of references) {
			const key = String(reference.key);
			const already = isSeed(key, text(reference.openalex), text(reference.doi));
			if (already) {
				notes.push(localize('snowball.alreadySeed', "{0} is already the seed {1}.", key, already));
				continue;
			}
			const id = nextId('E');
			await database.run(`INSERT INTO snowball.seeds (id, key) VALUES ($id, $key)`, { id, key });
			const authors = Array.isArray(reference.authors) ? reference.authors.filter((name): name is string => typeof name === 'string') : [];
			step({ id, action: 'seed', from: FROM_REFERENCES, at: now(), key, label: seedLabel(authors, typeof reference.year === 'number' ? reference.year : undefined), title: text(reference.title) });
			active.push({ id, key, openalex: reference.openalex, doi: text(reference.doi)?.toLowerCase() ?? null });
		}
		for (const article of articles) {
			const already = isSeed(undefined, article.openAlexId, article.doi);
			if (already) {
				notes.push(localize('snowball.alreadySeedArticle', "\"{0}\" is already the seed {1}.", article.title, already));
				continue;
			}
			await insertArticle(article);
			const id = nextId('E');
			await database.run(`INSERT INTO snowball.seeds (id, article) VALUES ($id, $article)`, { id, article: article.id });
			step({ id, action: 'seed', from: FROM_DISCOVER, at: now(), article: article.id, label: seedLabel(article.authors, article.year), title: article.title });
			active.push({ id, openalex: article.openAlexId ?? null, doi: article.doi?.toLowerCase() ?? null });
		}
		tell(notes.join(' '));
	};

	const insertArticle = (article: ISnowballArticle) => database.run(
		`INSERT OR REPLACE INTO snowball.articles SELECT * FROM (SELECT unnest(from_json($rows, '[{"id":"VARCHAR","doi":"VARCHAR","openalex":"VARCHAR","s2":"VARCHAR","title":"VARCHAR","authors":["VARCHAR"],"year":"INTEGER","journal":"VARCHAR","cited":"INTEGER","link":"VARCHAR"}]'), recursive := true))`,
		{ rows: JSON.stringify([{ id: article.id, doi: article.doi ?? null, openalex: article.openAlexId ?? null, s2: article.semanticScholarId ?? null, title: article.title, authors: article.authors, year: article.year, journal: article.journal ?? null, cited: article.cited ?? null, link: article.link }]) });

	/** Makes a work of the pool a seed, joined to the lists it is in. */
	const seedWork = async (openAlexId: string) => {
		const [work] = await database.query(`${RANKED} SELECT * FROM ranked WHERE openalex = $work`, { work: openAlexId });
		if (!work || work.seed) {
			return;
		}
		const authors = Array.isArray(work.authors) ? work.authors.filter((name): name is string => typeof name === 'string') : [];
		const doi = text(work.doi);
		const article: ISnowballArticle = {
			id: doi ?? `openalex:${openAlexId}`, doi, openAlexId, title: text(work.title) ?? openAlexId, year: typeof work.year === 'number' ? work.year : 0,
			authors, journal: text(work.journal), cited: typeof work.cited === 'number' ? work.cited : undefined, link: text(work.link) ?? `https://openalex.org/${openAlexId}`,
		};
		await insertArticle(article);
		const id = nextId('E');
		await database.run(`INSERT INTO snowball.seeds (id, article, openalex) VALUES ($id, $article, $openalex)`, { id, article: article.id, openalex: openAlexId });
		const lists = (Array.isArray(work.lists) ? work.lists.filter((list): list is string => typeof list === 'string') : []).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
		step({ id, action: 'seed', from: lists.length === 1 ? lists[0] : lists, at: now(), article: article.id, label: seedLabel(authors, article.year || undefined), title: article.title });
		tell('');
	};

	const removeSeed = async (id: string) => {
		const [seed] = await database.query(`SELECT id FROM snowball.seeds WHERE id = $id AND NOT removed`, { id });
		if (seed) {
			await database.run(`UPDATE snowball.seeds SET removed = true WHERE id = $id`, { id });
			step({ action: 'remove', from: id, at: now() });
			tell('');
		}
	};

	/** The OpenAlex record of a seed: the one it has, or else the one of its DOI, kept for the next time. */
	const openAlexIdOfSeed = async (seed: SnowballRow, key: string | undefined): Promise<string | undefined> => {
		const known = text(seed.openalex);
		const doi = text(seed.doi);
		if (known || !doi) {
			return known;
		}
		try {
			const context = await requestService.request({ type: 'GET', url: `https://api.openalex.org/works/doi:${encodeURIComponent(doi)}?select=id${key ? `&api_key=${encodeURIComponent(key)}` : ''}`, timeout: 30000, callSite: CALL_SITE }, CancellationToken.None);
			const work = isSuccess(context) ? await asJson<Pick<IOpenAlexWork, 'id'>>(context) : undefined;
			const id = work?.id ? openAlexIdOf(work as IOpenAlexWork) : undefined;
			if (id) {
				await database.run(`UPDATE snowball.seeds SET openalex = $openalex WHERE id = $id`, { openalex: id, id: String(seed.id) });
			}
			return id;
		} catch {
			return undefined;
		}
	};

	/**
	 * Lists the works citing each of the seeds with `ids`, or of all seeds, as OpenAlex has them, the most cited first:
	 * a list of the map for each seed not followed so already.
	 */
	const citedBy = async (ids: readonly string[]) => {
		await database.run(TABLES);
		const seeds = (await seedRows()).filter(seed => !ids.length || ids.includes(String(seed.id)));
		const key = await secretStorageService.get(CREDENTIALS.openAlex.secretKey);
		const notes: string[] = [];
		for (const seed of seeds) {
			const id = String(seed.id);
			const done = map.steps.find(step => step.action === 'cited_by' && step.from === id);
			if (done) {
				notes.push(localize('snowball.alreadyCitedBy', "The works citing {0} are {1} already.", id, done.id));
				continue;
			}
			const openAlexId = await openAlexIdOfSeed(seed, key);
			if (!openAlexId) {
				notes.push(localize('snowball.noOpenAlexRecord', "OpenAlex has no record of {0} that Pollis could find: its works citing it are not listed.", id));
				continue;
			}
			const works: IOpenAlexWork[] = [];
			let found = 0;
			let cursor: string | undefined = '*';
			let problem: string | undefined;
			while (cursor && works.length < CITED_BY_LISTED) {
				post({ command: 'progress', message: localize('snowball.asking', "Asking OpenAlex for the works citing {0}: {1} listed so far.", id, works.length.toLocaleString()) });
				const filter = `cites:${openAlexId},type:${OPENALEX_TYPES}`;
				const url = `https://api.openalex.org/works?filter=${encodeURIComponent(filter)}&sort=cited_by_count:desc&per_page=${CITED_BY_PAGE}&cursor=${encodeURIComponent(cursor)}&select=${CITED_BY_SELECT}${key ? `&api_key=${encodeURIComponent(key)}` : ''}`;
				try {
					const context = await requestService.request({ type: 'GET', url, timeout: 30000, callSite: CALL_SITE }, CancellationToken.None);
					if (context.res.statusCode === 429) {
						problem = key
							? localize('snowball.keyBudgetUsed', "Your OpenAlex key has used up its budget for today. It starts again tomorrow.")
							: localize('snowball.budgetUsed', "The free budget of OpenAlex, shared with everyone on your network, is used up for today. It starts again tomorrow; a free key of your own, set in Discover Literature, has a budget of its own.");
						break;
					}
					const answer = isSuccess(context) ? await asJson<{ meta?: { count?: number; next_cursor?: string | null }; results?: IOpenAlexWork[] }>(context) : undefined;
					if (!answer?.results) {
						problem = localize('snowball.unreachable', "OpenAlex could not be reached, or is too busy just now: try again.");
						break;
					}
					found = answer.meta?.count ?? found;
					works.push(...answer.results);
					cursor = answer.results.length ? answer.meta?.next_cursor ?? undefined : undefined;
				} catch {
					problem = localize('snowball.unreachable', "OpenAlex could not be reached, or is too busy just now: try again.");
					break;
				}
			}
			if (problem) {
				// A list half fetched is not kept: the step is taken again whole
				notes.push(problem);
				break;
			}
			const list = nextId('L');
			const rows = works.slice(0, CITED_BY_LISTED).filter(work => work.title).map(work => {
				const doi = work.doi?.replace(/^https:\/\/doi\.org\//, '').toLowerCase() || null;
				const openalex = openAlexIdOf(work);
				return {
					openalex, doi, title: work.title, year: work.publication_year ?? null, cited: work.cited_by_count ?? 0,
					authors: (work.authorships ?? []).map(authorship => authorship.author?.display_name).filter((name): name is string => !!name),
					journal: work.primary_location?.source?.display_name ?? null,
					link: doi ? `https://doi.org/${doi}` : `https://openalex.org/${openalex}`,
				};
			});
			// DuckDB refuses a parameter the statement does not use: each is given its own
			const parameters = { rows: JSON.stringify(rows), list };
			const json = `SELECT * FROM (SELECT unnest(from_json($rows, '[{"openalex":"VARCHAR","doi":"VARCHAR","title":"VARCHAR","authors":["VARCHAR"],"year":"INTEGER","journal":"VARCHAR","cited":"INTEGER","link":"VARCHAR"}]'), recursive := true))`;
			await database.run(`INSERT INTO snowball.works SELECT DISTINCT ON (openalex) openalex, doi, title, authors, year, journal, cited, link, $list FROM (${json}) WHERE openalex NOT IN (SELECT openalex FROM snowball.works)`, parameters);
			await database.run(`INSERT OR IGNORE INTO snowball.links SELECT DISTINCT openalex, $seed, 'cites', $list FROM (${json})`, { ...parameters, seed: id });
			const [added] = await database.query(`SELECT count(*)::INTEGER AS added FROM snowball.works WHERE first_list = $list`, { list });
			step({ id: list, action: 'cited_by', from: id, at: now(), listed: rows.length, found: Math.max(found, rows.length), added: typeof added?.added === 'number' ? added.added : 0 });
			if (found > rows.length) {
				notes.push(localize('snowball.mostCited', "{0} is cited by {1} works; {2} lists the {3} most cited.", id, found.toLocaleString(), list, rows.length.toLocaleString()));
			}
		}
		tell(notes.join(' '), notes.length > 0 && !notes.every(note => note.includes('lists the')));
	};

	/** The works of PollisReferences whose title, authors or key hold every word of `words`. */
	const find = async (words: string) => {
		const terms = words.trim().split(/\s+/).filter(Boolean).slice(0, 8);
		if (!terms.length) {
			post({ command: 'found', rows: [] });
			return;
		}
		await database.run(TABLES);
		const parameters: Record<string, string> = {};
		const conditions = terms.map((term, index) => {
			parameters[`t${index}`] = `%${term.replace(/[\\%_]/g, character => `\\${character}`)}%`;
			return `(title ILIKE $t${index} ESCAPE '\\' OR key ILIKE $t${index} ESCAPE '\\' OR array_to_string(authors, ' ') ILIKE $t${index} ESCAPE '\\')`;
		});
		const rows = await database.query(`SELECT key, title, authors, year, journal, key IN (SELECT key FROM snowball.seed_works WHERE NOT removed AND key IS NOT NULL) AS seed
			FROM PollisReferences.all_references WHERE NOT coalesce(removed, false) AND ${conditions.join(' AND ')} ORDER BY year DESC NULLS LAST, title LIMIT 12`, parameters);
		post({ command: 'found', rows });
	};

	const recordFile = (name: string) => joinPath(folder, `${fileName(name)}.toml`);
	const resultsFile = (record: URI) => record.with({ path: record.path.replace(/\.toml$/, '.duckdb') });

	/** Saves the map as `name`: its record, and its tables beside it; a map of another name in the way is replaced only when `replace`. */
	const save = async (name: string, replace: boolean) => {
		const record = recordFile(name);
		if (!replace && fileName(name).toLowerCase() !== fileName(map.name ?? '').toLowerCase() && await fileService.exists(record)) {
			post({ command: 'exists', name });
			return;
		}
		map.name = name;
		await fileService.writeFile(record, VSBuffer.fromString(recordToml(name, map.steps)));
		await database.run(TABLES);
		const results = sqlString(resultsFile(record).fsPath);
		await database.run(`DETACH DATABASE IF EXISTS results; ATTACH ${results} AS results;
			${TABLE_NAMES.map(table => `CREATE OR REPLACE TABLE results.${table} AS SELECT * FROM snowball.${table};`).join('\n')}
			DETACH results`);
		map.dirty = false;
		tell(localize('snowball.saved', "Saved as {0}, the works found in {1} beside it.", record.fsPath, resultsFile(record).path.split('/').at(-1) ?? ''));
	};

	/** The maps saved, the latest first. */
	const listMaps = async () => {
		const maps: { file: string; name: string; steps: number; modified: number }[] = [];
		try {
			const stat = await fileService.resolve(folder, { resolveMetadata: true });
			for (const child of stat.children ?? []) {
				if (!child.isDirectory && child.name.endsWith('.toml')) {
					const record = parseRecord((await fileService.readFile(child.resource)).value.toString());
					maps.push({ file: child.name, name: record.name ?? child.name.slice(0, -'.toml'.length), steps: record.steps.length, modified: child.mtime ?? 0 });
				}
			}
		} catch {
			// No map saved yet
		}
		post({ command: 'maps', maps: maps.sort((a, b) => b.modified - a.modified) });
	};

	/** Empties the map's tables, and the record. */
	const clear = async () => {
		await database.run(TABLES);
		await database.run(TABLE_NAMES.map(table => `DELETE FROM snowball.${table};`).join('\n'));
		map.name = undefined;
		map.steps = [];
		map.dirty = false;
		view.show = 'all';
		view.page = 0;
	};

	const open = async (file: string) => {
		if (file.includes('/') || file.includes('\\') || !file.endsWith('.toml')) {
			return;
		}
		const record = joinPath(folder, file);
		const { name, steps } = parseRecord((await fileService.readFile(record)).value.toString());
		await clear();
		map.name = name ?? file.slice(0, -'.toml'.length);
		map.steps = steps;
		const results = resultsFile(record);
		if (await fileService.exists(results)) {
			await database.run(`DETACH DATABASE IF EXISTS results; ATTACH ${sqlString(results.fsPath)} AS results (READ_ONLY);
				${TABLE_NAMES.map(table => `INSERT INTO snowball.${table} SELECT * FROM results.${table};`).join('\n')}
				DETACH results`);
			tell('');
		} else {
			tell(localize('snowball.noResults', "The works found are not beside the record ({0}): the map shows its steps, and its pool is empty.", results.path.split('/').at(-1) ?? ''), true);
		}
	};

	/** Runs `task`, one action at a time, then shows the state; a failure is told. */
	const queue = (task: () => Promise<void>) => sequencer.queue(async () => {
		post({ command: 'busy', busy: true });
		try {
			await task();
		} catch (error) {
			tell(localize('snowball.failed', "Something went wrong: {0}", error instanceof Error ? error.message : String(error)), true);
		}
		try {
			await postState();
		} catch (error) {
			tell(localize('snowball.failed', "Something went wrong: {0}", error instanceof Error ? error.message : String(error)), true);
		}
		post({ command: 'busy', busy: false });
	});

	addToOpenPage = given => {
		if (ready) {
			void queue(() => addSeeds(given));
		} else {
			pending = given;
		}
	};

	disposables.add(webviewInput.webview.onMessage(async event => {
		const message = event.message as SnowballMessage;
		switch (message.command) {
			case 'ready': {
				ready = true;
				const given = pending;
				pending = undefined;
				await queue(() => given ? addSeeds(given) : Promise.resolve());
				break;
			}
			case 'citedBy':
				if (Array.isArray(message.seeds)) {
					await queue(() => citedBy(message.seeds.filter(seed => typeof seed === 'string')));
				}
				break;
			case 'seedWork':
				if (typeof message.work === 'string') {
					await queue(() => seedWork(message.work));
				}
				break;
			case 'seedKey':
				if (typeof message.key === 'string') {
					await queue(() => addSeeds({ keys: [message.key] }));
				}
				break;
			case 'remove':
				if (typeof message.seed === 'string') {
					await queue(() => removeSeed(message.seed));
				}
				break;
			case 'view':
				if (typeof message.show === 'string' && typeof message.page === 'number') {
					view.show = message.show;
					view.page = Math.max(0, Math.floor(message.page));
					if (isRowsChoice(message.rows) && message.rows !== view.rows) {
						view.rows = message.rows;
						storeRows(storageService, 'snowball', message.rows);
					}
					await queue(() => Promise.resolve());
				}
				break;
			case 'find':
				if (typeof message.text === 'string') {
					await sequencer.queue(() => find(message.text).catch(() => post({ command: 'found', rows: [] })));
				}
				break;
			case 'save':
				if (typeof message.name === 'string' && message.name.trim()) {
					await queue(() => save(message.name.trim(), message.replace === true));
				}
				break;
			case 'maps':
				await listMaps();
				break;
			case 'open':
				if (typeof message.file === 'string') {
					await queue(() => open(message.file));
				}
				break;
			case 'new':
				await queue(async () => {
					await clear();
					tell('');
				});
				break;
			case 'openUrl':
				if (typeof message.url === 'string' && /^https?:\/\//.test(message.url)) {
					await commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
				}
				break;
		}
	}));
}

/** Whether `value`, from another page, is an article to keep. */
function isArticle(value: unknown): value is ISnowballArticle {
	const article = value as ISnowballArticle;
	return !!article && typeof article === 'object' && typeof article.id === 'string' && typeof article.title === 'string' && typeof article.year === 'number'
		&& Array.isArray(article.authors) && typeof article.link === 'string';
}

function pageHtml(): string {
	const text = {
		title: localize('snowball.title', "Snowball Search Map"),
		intro: localize('snowball.intro', "Start from a few works you know, the seeds, and follow their citations: the works citing them pour into one pool, ranked by how many seeds each is tied to. Make the best of them seeds and go on, until a step adds little to the top of the pool. Each step is kept in the map's record, which you can save and open again."),
		untitled: localize('snowball.untitled', "Untitled Map"),
		notSaved: localize('snowball.notSaved', "not saved"),
		save: localize('snowball.save', "Save..."),
		open: localize('snowball.open', "Open..."),
		newSearch: localize('snowball.newSearch', "New Search"),
		mapEmpty: localize('snowball.mapEmpty', "The map draws itself as you go: add a seed below."),
		legendList: localize('snowball.legendList', "a list of works: click it to see it in the pool"),
		legendSeed: localize('snowball.legendSeed', "a seed: click it to act on it alone"),
		selectEdge: localize('snowball.selectEdge', "Select"),
		citedByEdge: localize('snowball.citedByEdge', "Cited by"),
		removed: localize('snowball.removed', "removed"),
		seeds: localize('snowball.seeds', "Seeds ({0})"),
		noSeeds: localize('snowball.noSeeds', "No seeds yet. Find works in your references below, or tick articles in Discover Literature and choose Snowball Search..."),
		removeSeed: localize('snowball.removeSeed', "Remove this seed: its lists stay on the map, and Links is counted again"),
		forAll: localize('snowball.forAll', "For all seeds:"),
		forOne: localize('snowball.forOne', "For {0} alone:"),
		citedBy: localize('snowball.citedBy', "Cited By"),
		citedByHint: localize('snowball.citedByHint', "Lists the works citing each seed, the 2,000 most cited, as OpenAlex has them: a list on the map for each seed not followed so already"),
		findLabel: localize('snowball.findLabel', "Add Seeds"),
		findPlaceholder: localize('snowball.findPlaceholder', "Find works in PollisReferences by title, author or key"),
		noneFound: localize('snowball.noneFound', "No work in PollisReferences matches."),
		seed: localize('snowball.seed', "Seed"),
		seedHint: localize('snowball.seedHint', "Make this work a seed"),
		isSeed: localize('snowball.isSeed', "Already a seed"),
		pool: localize('snowball.pool', "Pool"),
		poolEmpty: localize('snowball.poolEmpty', "Empty: Cited By fills it."),
		poolLine: localize('snowball.poolLine', "{0} works from {1} · the last step added {2}, {3} of them in the top {4}"),
		show: localize('snowball.show', "Show:"),
		showAll: localize('snowball.showAll', "All"),
		showNew: localize('snowball.showNew', "New Since Last Step"),
		links: localize('snowball.links', "Links"),
		linksHint: localize('snowball.linksHint', "How many seeds the work is tied to"),
		work: localize('snowball.work', "Work"),
		year: localize('snowball.year', "Year"),
		cited: localize('snowball.cited', "Cited"),
		citedHint: localize('snowball.citedHint', "Times cited, as OpenAlex counts them"),
		from: localize('snowball.from', "From"),
		fromHint: localize('snowball.fromHint', "The lists the work is in"),
		cites: localize('snowball.cites', "cites {0}"),
		inLists: localize('snowball.inLists', "in {0}"),
		previous: localize('snowball.previous', "Previous"),
		next: localize('snowball.next', "Next"),
		pageOf: localize('snowball.pageOf', "Page {0} of {1}"),
		etAl: localize('snowball.etAl', "{0} et al."),
		saveHint: localize('snowball.saveHint', "The record is saved in ~/.pollis/literature as a TOML file of this name, the works found in a DuckDB file beside it."),
		mapName: localize('snowball.mapName', "Name"),
		saveButton: localize('snowball.saveButton', "Save"),
		replace: localize('snowball.replace', "Replace"),
		exists: localize('snowball.exists', "A map named {0} is saved already: replace it?"),
		cancel: localize('snowball.cancel', "Cancel"),
		openHint: localize('snowball.openHint', "The map opened takes the place of this one."),
		openUnsaved: localize('snowball.openUnsaved', "The map opened takes the place of this one, whose steps are not saved."),
		noMaps: localize('snowball.noMaps', "No map saved yet."),
		steps: localize('snowball.steps', "{0} steps"),
		openMap: localize('snowball.openMap', "Open"),
		discardHint: localize('snowball.discardHint', "This map's steps are not saved: New Search discards them."),
		discard: localize('snowball.discard', "Discard"),
		working: localize('snowball.working', "Working..."),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		${voiceButtonsCss}
		${rowsChoiceCss}
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 1200px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		h2 { font-size: 18px; font-weight: 400; margin: 0; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 24px 0; line-height: 1.4; max-width: 900px; }
		[hidden] { display: none !important; }
		.sectionHeader { display: flex; align-items: baseline; gap: 16px; margin: 24px 0 8px 0; }
		.sectionHeader h2 { flex: 1; }
		.dirty { font-size: 12px; color: var(--vscode-descriptionForeground); margin-left: 8px; }
		.headerLinks { font-size: 12px; color: var(--vscode-descriptionForeground); }
		.pane { padding: 16px; border-radius: 4px; background: var(--vscode-welcomePage-tileBackground, var(--vscode-editorWidget-background)); }
		.hint { font-size: 12px; color: var(--vscode-descriptionForeground); margin-top: 4px; line-height: 1.4; max-width: 760px; }
		.row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
		input[type="text"] { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 4px 6px; width: 480px; max-width: 100%; }
		input:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; border-radius: 2px; padding: 4px 12px; cursor: pointer; }
		button.action:hover { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button:disabled, button:disabled:hover { opacity: 0.5; cursor: default; }
		.actionBar { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; margin: 8px 0; }
		/* One action blue: the first at first, then the last enabled one the pointer was on */
		.actionBar > button.action.current { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		.actionLabel { color: var(--vscode-descriptionForeground); }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; text-align: left; }
		.link:hover { text-decoration: underline; }
		.link:disabled { color: var(--vscode-disabledForeground); cursor: default; text-decoration: none; }
		.status { font-size: 12px; color: var(--vscode-descriptionForeground); margin-top: 8px; line-height: 1.4; }
		.status.error { color: var(--vscode-errorForeground); }
		.mapBox { overflow-x: auto; padding: 8px; border-radius: 4px; background: var(--vscode-welcomePage-tileBackground, var(--vscode-editorWidget-background)); }
		.mapBox svg { display: block; }
		.mapBox .empty { padding: 16px 8px; }
		svg .node { cursor: pointer; }
		svg .node rect { fill: var(--vscode-editor-background); stroke: var(--vscode-widget-border); stroke-width: 1; }
		svg .node.seed rect { stroke: var(--vscode-textLink-foreground); }
		svg .node.source { cursor: default; }
		svg .node.source rect { fill: none; stroke-dasharray: 3 3; }
		svg .node.removed rect { stroke-dasharray: 4 3; stroke: var(--vscode-disabledForeground); }
		svg .node.removed text { fill: var(--vscode-disabledForeground); }
		svg .node.chosen rect { stroke: var(--vscode-focusBorder); stroke-width: 2; }
		svg .node text { fill: var(--vscode-foreground); font-size: 12px; }
		svg .node.source text { fill: var(--vscode-descriptionForeground); }
		svg .edge { fill: none; stroke: var(--vscode-descriptionForeground); stroke-width: 1; }
		svg .edge.removed { stroke-dasharray: 4 3; }
		svg .arrow { fill: var(--vscode-descriptionForeground); }
		svg .edgeLabel { fill: var(--vscode-descriptionForeground); font-size: 10px; paint-order: stroke; stroke: var(--vscode-welcomePage-tileBackground, var(--vscode-editorWidget-background)); stroke-width: 4px; }
		.legend { font-size: 11px; color: var(--vscode-descriptionForeground); margin: 4px 8px 0 8px; }
		.seedList { margin: 0; padding: 0; list-style: none; }
		.seedList li { display: flex; align-items: baseline; gap: 8px; padding: 4px 8px; border-bottom: 1px solid var(--vscode-widget-border); }
		.seedList li.chosen { box-shadow: inset 2px 0 0 var(--vscode-focusBorder); }
		.seedList .seedId { font-weight: 600; min-width: 28px; cursor: pointer; }
		.seedList .seedText { flex: 1; min-width: 0; }
		.muted { color: var(--vscode-descriptionForeground); }
		button.removeSeed { font: inherit; font-size: 14px; line-height: 1; color: var(--vscode-descriptionForeground); background: none; border: none; padding: 0 4px; cursor: pointer; }
		button.removeSeed:hover { color: var(--vscode-foreground); }
		.finder { margin-top: 12px; }
		.found { margin-top: 4px; }
		.found div { padding: 3px 0; font-size: 12px; }
		.poolLine { color: var(--vscode-descriptionForeground); font-size: 12px; }
		.showRow { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; margin: 8px 0; }
		.showRow label { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
		table { width: 100%; border-collapse: collapse; font-size: 12px; }
		th { text-align: left; font-weight: normal; color: var(--vscode-descriptionForeground); padding: 4px 8px; border-bottom: 1px solid var(--vscode-widget-border); white-space: nowrap; }
		th.number, td.number { text-align: right; }
		td { padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); vertical-align: top; }
		td.number { white-space: nowrap; font-variant-numeric: tabular-nums; }
		td.dots { white-space: nowrap; color: var(--vscode-textLink-foreground); letter-spacing: 1px; cursor: default; }
		.authors { color: var(--vscode-descriptionForeground); margin-top: 2px; }
		.pager { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 12px 8px; font-size: 12px; color: var(--vscode-descriptionForeground); }
		.pager .link { font-size: 12px; }
		.empty { color: var(--vscode-descriptionForeground); padding: 12px 8px; }
		.mapRow { display: flex; align-items: baseline; gap: 12px; padding: 4px 0; border-bottom: 1px solid var(--vscode-widget-border); }
		.mapRow .mapName { flex: 1; }
	</style>
</head>
<body>
<div class="container">
	<div class="title-row">
		<h1>${text.title}</h1>
		${voiceButtonsHtml}
	</div>
	<p class="subtitle">${text.intro}</p>

	<div class="sectionHeader">
		<h2><span id="mapName"></span><span class="dirty" id="dirty" hidden>(${text.notSaved})</span></h2>
		<div class="headerLinks"><button class="link" id="saveLink">${text.save}</button> · <button class="link" id="openLink">${text.open}</button> · <button class="link" id="newLink">${text.newSearch}</button></div>
	</div>
	<div class="pane" id="savePane" hidden>
		<div class="row"><label for="saveName">${text.mapName}</label><input type="text" id="saveName" spellcheck="false" autocomplete="off"></div>
		<div class="hint">${text.saveHint}</div>
		<div class="hint" id="existsNote" hidden></div>
		<div class="actionBar" id="saveBar">
			<button class="action current" id="saveButton">${text.saveButton}</button>
			<button class="action" id="cancelSave">${text.cancel}</button>
		</div>
	</div>
	<div class="pane" id="openPane" hidden>
		<div class="hint" id="openNote"></div>
		<div id="mapList"></div>
		<div class="actionBar" id="openBar">
			<button class="action current" id="cancelOpen">${text.cancel}</button>
		</div>
	</div>
	<div class="pane" id="discardPane" hidden>
		<div class="hint">${text.discardHint}</div>
		<div class="actionBar" id="discardBar">
			<button class="action current" id="discard">${text.discard}</button>
			<button class="action" id="cancelDiscard">${text.cancel}</button>
		</div>
	</div>

	<div class="mapBox" id="mapBox"></div>
	<div class="legend" id="legend" hidden>[&equiv;] ${text.legendList} · ( ) ${text.legendSeed}</div>

	<div class="sectionHeader"><h2 id="seedsTitle"></h2></div>
	<ul class="seedList" id="seedList"></ul>
	<div class="empty" id="noSeeds" hidden>${text.noSeeds}</div>
	<div class="actionBar" id="seedBar" hidden>
		<span class="actionLabel" id="forLabel"></span>
		<button class="action current" id="citedBy" title="${text.citedByHint}">${text.citedBy}</button>
	</div>
	<div class="status" id="status" hidden></div>
	<div class="finder">
		<div class="row"><label for="find">${text.findLabel}</label><input type="text" id="find" placeholder="${text.findPlaceholder}" spellcheck="false" autocomplete="off"></div>
		<div class="found" id="found"></div>
	</div>

	<div class="sectionHeader"><h2>${text.pool}</h2></div>
	<div class="poolLine" id="poolLine"></div>
	<div class="showRow" id="showRow" hidden></div>
	<div class="pager" id="pagerTop" hidden></div>
	<table id="poolTable" hidden>
		<thead><tr><th title="${text.linksHint}">${text.links}</th><th>${text.work}</th><th class="number">${text.year}</th><th class="number" title="${text.citedHint}">${text.cited}</th><th title="${text.fromHint}">${text.from}</th><th></th></tr></thead>
		<tbody id="poolRows"></tbody>
	</table>
	<div class="pager" id="pager" hidden></div>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	const TEXT = ${JSON.stringify(text)};
	${rowsChoiceScript()}
	const TOP = ${TOP};
	let state = { steps: [], seeds: [], rows: [], lists: [], summary: {}, view: { show: 'all', page: 0, rows: ${FEWEST_ROWS} } };
	// The seed the actions are for, when one is chosen on the map
	let chosen;
	let busy = false;
	let findTimer;

	function format(template, ...values) {
		return template.replace(/\\{(\\d+)\\}/g, (match, index) => values[index] !== undefined ? String(values[index]) : match);
	}

	function setStatus(message, error) {
		const status = document.getElementById('status');
		status.textContent = message;
		status.className = error ? 'status error' : 'status';
		status.hidden = !message;
	}

	function linkButton(label, onClick, hint) {
		const button = document.createElement('button');
		button.className = 'link';
		button.textContent = label;
		if (hint) {
			button.title = hint;
		}
		button.addEventListener('click', onClick);
		return button;
	}

	function authorsText(authors) {
		const names = (authors || []).map(name => name.includes(',') ? name.split(',')[0].trim() : name.trim().split(/\\s+/).pop());
		return names.length > 3 ? format(TEXT.etAl, names[0]) : names.join(', ');
	}

	function svgElement(name, attributes) {
		const element = document.createElementNS('http://www.w3.org/2000/svg', name);
		for (const [key, value] of Object.entries(attributes || {})) {
			element.setAttribute(key, String(value));
		}
		return element;
	}

	/** The map's nodes and arrows, drawn from the steps: sources, seeds and lists, each a column further than what it came from. */
	function mapGraph() {
		const nodes = new Map();
		const edges = [];
		const add = node => {
			nodes.set(node.id, node);
			return node;
		};
		const nodeOf = id => nodes.get(id) || add({ id, kind: 'source', label: id, depth: 0 });
		for (const step of state.steps) {
			if (step.action === 'seed' && step.id) {
				const parents = (Array.isArray(step.from) ? step.from : [step.from]).map(nodeOf);
				const node = add({ id: step.id, kind: 'seed', label: step.id + (step.label ? ' ' + step.label : ''), title: step.title, depth: Math.max(0, ...parents.map(parent => parent.depth)) + 1 });
				parents.forEach(parent => edges.push({ from: parent, to: node, label: TEXT.selectEdge }));
			} else if (step.action === 'cited_by' && step.id) {
				const seed = nodeOf(step.from);
				const node = add({ id: step.id, kind: 'list', label: '\\u2261 ' + step.id + '  ' + (step.listed || 0).toLocaleString(), depth: seed.depth + 1 });
				edges.push({ from: seed, to: node, label: TEXT.citedByEdge });
			} else if (step.action === 'remove') {
				const seed = nodes.get(step.from);
				if (seed) {
					seed.removed = true;
				}
			}
		}
		return { nodes: [...nodes.values()], edges };
	}

	function renderMap() {
		const box = document.getElementById('mapBox');
		box.textContent = '';
		const { nodes, edges } = mapGraph();
		document.getElementById('legend').hidden = !nodes.length;
		if (!nodes.length) {
			const empty = document.createElement('div');
			empty.className = 'empty';
			empty.textContent = TEXT.mapEmpty;
			box.append(empty);
			return;
		}
		const COLUMN = 250, WIDTH = 170, HEIGHT = 28, ROW = 44, MARGIN = 8;
		const rows = new Map();
		for (const node of nodes) {
			node.row = rows.get(node.depth) || 0;
			rows.set(node.depth, node.row + 1);
			node.x = MARGIN + node.depth * COLUMN;
			node.y = MARGIN + node.row * ROW;
		}
		const width = MARGIN * 2 + Math.max(...nodes.map(node => node.x)) + WIDTH;
		const height = MARGIN * 2 + Math.max(...rows.values()) * ROW - (ROW - HEIGHT);
		const svg = svgElement('svg', { width, height, viewBox: '0 0 ' + width + ' ' + height, role: 'img' });
		const marker = svgElement('marker', { id: 'arrow', viewBox: '0 0 8 8', refX: 8, refY: 4, markerWidth: 8, markerHeight: 8, orient: 'auto' });
		marker.append(svgElement('path', { d: 'M0,0 L8,4 L0,8 z', class: 'arrow' }));
		const defs = svgElement('defs');
		defs.append(marker);
		svg.append(defs);
		for (const edge of edges) {
			const x1 = edge.from.x + WIDTH, y1 = edge.from.y + HEIGHT / 2, x2 = edge.to.x, y2 = edge.to.y + HEIGHT / 2, middle = (x1 + x2) / 2;
			const removed = edge.from.removed || edge.to.removed;
			svg.append(svgElement('path', { d: 'M' + x1 + ',' + y1 + ' C' + middle + ',' + y1 + ' ' + middle + ',' + y2 + ' ' + x2 + ',' + y2, class: 'edge' + (removed ? ' removed' : ''), 'marker-end': 'url(#arrow)' }));
			const label = svgElement('text', { x: middle, y: (y1 + y2) / 2 - 4, 'text-anchor': 'middle', class: 'edgeLabel' });
			label.textContent = edge.label;
			svg.append(label);
		}
		for (const node of nodes) {
			const isChosen = node.kind === 'seed' && node.id === chosen || node.kind === 'list' && node.id === state.view.show;
			const group = svgElement('g', { class: 'node ' + node.kind + (node.removed ? ' removed' : '') + (isChosen ? ' chosen' : ''), transform: 'translate(' + node.x + ',' + node.y + ')' });
			group.append(svgElement('rect', { width: WIDTH, height: HEIGHT, rx: node.kind === 'list' ? 2 : HEIGHT / 2 }));
			const label = svgElement('text', { x: WIDTH / 2, y: HEIGHT / 2 + 4, 'text-anchor': 'middle' });
			label.textContent = node.label.length > 24 ? node.label.slice(0, 23) + '\\u2026' : node.label;
			group.append(label);
			const tooltip = svgElement('title');
			tooltip.textContent = node.title ? node.label + ': ' + node.title + (node.removed ? ' (' + TEXT.removed + ')' : '') : node.label;
			group.append(tooltip);
			if (node.kind === 'list') {
				group.addEventListener('click', () => setView(state.view.show === node.id ? 'all' : node.id, 0));
			} else if (node.kind === 'seed' && !node.removed) {
				group.addEventListener('click', () => choose(node.id));
			}
			svg.append(group);
		}
		box.append(svg);
	}

	function choose(id) {
		chosen = chosen === id ? undefined : id;
		render();
	}

	function setView(show, page, rows = state.view.rows) {
		vscode.postMessage({ command: 'view', show, page, rows });
	}

	function renderSeeds() {
		const list = document.getElementById('seedList');
		list.textContent = '';
		if (chosen && !state.seeds.some(seed => seed.id === chosen)) {
			chosen = undefined;
		}
		document.getElementById('seedsTitle').textContent = format(TEXT.seeds, state.seeds.length);
		for (const seed of state.seeds) {
			const item = document.createElement('li');
			if (seed.id === chosen) {
				item.className = 'chosen';
			}
			const id = document.createElement('span');
			id.className = 'seedId';
			id.textContent = seed.id;
			id.addEventListener('click', () => choose(seed.id));
			const body = document.createElement('span');
			body.className = 'seedText';
			const who = [authorsText(seed.authors), seed.year].filter(Boolean).join(' ');
			body.append(who ? who + ' \\u00b7 ' : '');
			body.append(seed.link ? linkButton(seed.title || seed.key || seed.article, () => vscode.postMessage({ command: 'openUrl', url: seed.link }), seed.link) : (seed.title || seed.key || seed.article));
			const source = document.createElement('span');
			source.className = 'muted';
			source.textContent = seed.key ? ' \\u00b7 ' + seed.key : '';
			body.append(source);
			const remove = document.createElement('button');
			remove.className = 'removeSeed';
			remove.textContent = '\\u00d7';
			remove.title = TEXT.removeSeed;
			remove.setAttribute('aria-label', TEXT.removeSeed);
			remove.disabled = busy;
			remove.addEventListener('click', () => vscode.postMessage({ command: 'remove', seed: seed.id }));
			item.append(id, body, remove);
			list.append(item);
		}
		document.getElementById('noSeeds').hidden = state.seeds.length > 0;
		document.getElementById('seedBar').hidden = !state.seeds.length;
		document.getElementById('forLabel').textContent = chosen ? format(TEXT.forOne, chosen) : TEXT.forAll;
		document.getElementById('citedBy').disabled = busy;
	}

	function renderPool() {
		const summary = state.summary || {};
		const lists = state.lists;
		const poolLine = document.getElementById('poolLine');
		const range = lists.length > 1 ? lists[0] + '\\u2013' + lists[lists.length - 1] : lists[0];
		poolLine.textContent = summary.total ? format(TEXT.poolLine, summary.total.toLocaleString(), range, (summary.added || 0).toLocaleString(), summary.added_top || 0, TOP) : TEXT.poolEmpty;
		const showRow = document.getElementById('showRow');
		showRow.textContent = '';
		showRow.hidden = !summary.total;
		showRow.append(TEXT.show);
		for (const [value, label] of [['all', TEXT.showAll], ...lists.map(list => [list, list]), ['new', TEXT.showNew]]) {
			const option = document.createElement('label');
			const radio = document.createElement('input');
			radio.type = 'radio';
			radio.name = 'show';
			radio.checked = state.view.show === value;
			radio.addEventListener('change', () => setView(value, 0));
			option.append(radio, label);
			showRow.append(option);
		}
		const body = document.getElementById('poolRows');
		body.textContent = '';
		for (const row of state.rows) {
			const tr = document.createElement('tr');
			const dots = document.createElement('td');
			dots.className = 'dots';
			dots.textContent = '\\u25cf'.repeat(row.links);
			dots.title = [...(row.how || []).map(how => format(TEXT.cites, how.split(' ')[1])).sort(), format(TEXT.inLists, sortLists(row.lists).join(', '))].join(' \\u00b7 ');
			const work = document.createElement('td');
			work.append(linkButton(row.title, () => vscode.postMessage({ command: 'openUrl', url: row.link }), row.link));
			const authors = document.createElement('div');
			authors.className = 'authors';
			authors.textContent = [authorsText(row.authors), row.journal].filter(Boolean).join(' \\u00b7 ');
			work.append(authors);
			const year = document.createElement('td');
			year.className = 'number';
			year.textContent = row.year || '';
			const cited = document.createElement('td');
			cited.className = 'number';
			cited.textContent = (row.cited || 0).toLocaleString();
			const from = document.createElement('td');
			from.textContent = sortLists(row.lists).join(' ');
			const action = document.createElement('td');
			if (row.seed) {
				action.className = 'muted';
				action.textContent = row.seed;
				action.title = TEXT.isSeed;
			} else {
				const seed = linkButton(TEXT.seed, () => vscode.postMessage({ command: 'seedWork', work: row.openalex }), TEXT.seedHint);
				seed.disabled = busy;
				action.append(seed);
			}
			tr.append(dots, work, year, cited, from, action);
			body.append(tr);
		}
		document.getElementById('poolTable').hidden = !state.rows.length;
		// The same pager above the table and below it, with the Rows choice while there are more than the fewest rows
		const shownCount = summary.shown || 0;
		const pages = Math.max(1, Math.ceil(shownCount / rowsPerPage(state.view.rows, shownCount)));
		for (const pager of [document.getElementById('pagerTop'), document.getElementById('pager')]) {
			pager.textContent = '';
			pager.hidden = shownCount <= ${FEWEST_ROWS};
			if (pages > 1) {
				const previous = linkButton(TEXT.previous, () => setView(state.view.show, state.view.page - 1));
				previous.disabled = state.view.page <= 0;
				const next = linkButton(TEXT.next, () => setView(state.view.show, state.view.page + 1));
				next.disabled = state.view.page >= pages - 1;
				pager.append(previous, format(TEXT.pageOf, state.view.page + 1, pages), next);
			}
			pager.append(rowsChoice(state.view.rows, chosen => setView(state.view.show, firstPageAfter(state.view.page, state.view.rows, chosen), chosen)));
		}
	}

	function sortLists(lists) {
		return [...(lists || [])].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
	}

	function render() {
		document.getElementById('mapName').textContent = state.name || TEXT.untitled;
		document.getElementById('dirty').hidden = !state.dirty || !state.steps.length;
		renderMap();
		renderSeeds();
		renderPool();
	}

	function showPane(id) {
		for (const pane of ['savePane', 'openPane', 'discardPane']) {
			document.getElementById(pane).hidden = pane !== id;
		}
	}

	function renderFound(rows) {
		const found = document.getElementById('found');
		found.textContent = '';
		if (!document.getElementById('find').value.trim()) {
			return;
		}
		if (!rows.length) {
			found.textContent = TEXT.noneFound;
			found.className = 'found muted';
			return;
		}
		found.className = 'found';
		for (const row of rows) {
			const line = document.createElement('div');
			if (row.seed) {
				const mark = document.createElement('span');
				mark.className = 'muted';
				mark.textContent = TEXT.isSeed;
				line.append(mark);
			} else {
				const seed = linkButton(TEXT.seed, () => vscode.postMessage({ command: 'seedKey', key: row.key }), TEXT.seedHint);
				seed.disabled = busy;
				line.append(seed);
			}
			line.append(' \\u00b7 ' + [authorsText(row.authors), row.year].filter(Boolean).join(' ') + ' \\u00b7 ' + row.title + ' ');
			const key = document.createElement('span');
			key.className = 'muted';
			key.textContent = row.key;
			line.append(key);
			found.append(line);
		}
	}

	function renderMaps(maps) {
		const list = document.getElementById('mapList');
		list.textContent = '';
		document.getElementById('openNote').textContent = state.dirty && state.steps.length ? TEXT.openUnsaved : TEXT.openHint;
		if (!maps.length) {
			list.className = 'empty';
			list.textContent = TEXT.noMaps;
			return;
		}
		list.className = '';
		for (const map of maps) {
			const row = document.createElement('div');
			row.className = 'mapRow';
			const name = document.createElement('span');
			name.className = 'mapName';
			name.textContent = map.name;
			const meta = document.createElement('span');
			meta.className = 'muted';
			meta.textContent = format(TEXT.steps, map.steps) + (map.modified ? ' \\u00b7 ' + new Date(map.modified).toLocaleString() : '');
			row.append(name, meta, linkButton(TEXT.openMap, () => {
				showPane();
				vscode.postMessage({ command: 'open', file: map.file });
			}));
			list.append(row);
		}
	}

	function saveMap(replace) {
		const name = document.getElementById('saveName').value.trim();
		if (name) {
			document.getElementById('existsNote').hidden = true;
			document.getElementById('saveButton').textContent = TEXT.saveButton;
			showPane();
			vscode.postMessage({ command: 'save', name, replace });
		}
	}

	for (const bar of document.querySelectorAll('.actionBar')) {
		bar.addEventListener('mouseover', event => {
			const button = event.target.closest('button.action');
			if (button && !button.disabled && !button.classList.contains('current')) {
				bar.querySelector('button.current')?.classList.remove('current');
				button.classList.add('current');
			}
		});
	}
	document.getElementById('citedBy').addEventListener('click', () => vscode.postMessage({ command: 'citedBy', seeds: chosen ? [chosen] : [] }));
	document.getElementById('saveLink').addEventListener('click', () => {
		const input = document.getElementById('saveName');
		input.value = state.name || '';
		document.getElementById('existsNote').hidden = true;
		document.getElementById('saveButton').textContent = TEXT.saveButton;
		showPane('savePane');
		input.focus();
	});
	document.getElementById('saveName').addEventListener('keydown', event => {
		if (event.key === 'Enter') {
			saveMap(false);
		}
	});
	document.getElementById('saveButton').addEventListener('click', event => saveMap(event.target.dataset.replace === 'true'));
	document.getElementById('cancelSave').addEventListener('click', () => showPane());
	document.getElementById('openLink').addEventListener('click', () => {
		showPane('openPane');
		document.getElementById('mapList').textContent = '';
		vscode.postMessage({ command: 'maps' });
	});
	document.getElementById('cancelOpen').addEventListener('click', () => showPane());
	document.getElementById('newLink').addEventListener('click', () => {
		if (state.dirty && state.steps.length) {
			showPane('discardPane');
		} else {
			chosen = undefined;
			vscode.postMessage({ command: 'new' });
		}
	});
	document.getElementById('discard').addEventListener('click', () => {
		showPane();
		chosen = undefined;
		vscode.postMessage({ command: 'new' });
	});
	document.getElementById('cancelDiscard').addEventListener('click', () => showPane());
	document.getElementById('find').addEventListener('input', event => {
		clearTimeout(findTimer);
		findTimer = setTimeout(() => vscode.postMessage({ command: 'find', text: event.target.value }), 250);
	});

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			state = message;
			render();
			const find = document.getElementById('find');
			if (find.value.trim()) {
				vscode.postMessage({ command: 'find', text: find.value });
			}
		} else if (message.command === 'busy') {
			busy = message.busy;
			if (busy) {
				setStatus(TEXT.working, false);
			} else if (document.getElementById('status').textContent === TEXT.working) {
				setStatus('', false);
			}
			renderSeeds();
			renderPool();
		} else if (message.command === 'progress') {
			setStatus(message.message, false);
		} else if (message.command === 'notes') {
			setStatus(message.message, message.error);
		} else if (message.command === 'found') {
			renderFound(message.rows);
		} else if (message.command === 'maps') {
			renderMaps(message.maps);
		} else if (message.command === 'exists') {
			const note = document.getElementById('existsNote');
			note.textContent = format(TEXT.exists, message.name);
			note.hidden = false;
			const button = document.getElementById('saveButton');
			button.textContent = TEXT.replace;
			button.dataset.replace = 'true';
			document.getElementById('saveName').value = message.name;
			showPane('savePane');
		}
	});
	document.getElementById('saveName').addEventListener('input', () => {
		const button = document.getElementById('saveButton');
		button.textContent = TEXT.saveButton;
		button.dataset.replace = '';
		document.getElementById('existsNote').hidden = true;
	});
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: SNOWBALL_SEARCH_COMMAND_ID,
			title: localize2('snowball.command', "Snowball Search Map"),
			category: localize2('compose.category', "Compose"),
			f1: true,
		});
	}
	/** Opens the map, the works with `seeds` made seeds of it: keys of PollisReferences, and articles not saved there. */
	run(accessor: ServicesAccessor, seeds?: unknown): void {
		openSnowballSearch(accessor, seeds && typeof seeds === 'object' ? seeds as ISnowballSeeds : undefined);
	}
});
