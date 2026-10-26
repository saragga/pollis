/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Sequencer } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
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
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { API_PROVIDERS, ProviderRequests } from '../../model/browser/common/apiProviders.js';
import { voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';
import { FEWEST_ROWS, isRowsChoice, rowsChoiceCss, rowsChoiceScript, stickyHeadCss, stickyHeadScript, storedRows, storeRows } from '../../model/browser/webviews/webviewPager.js';
import { OPEN_LINK_COMMAND_ID } from '../../monitor/browser/openLink.js';
import { ISnowballArticle, ISnowballDatabaseService, ISnowballSeeds, SNOWBALL_SEARCH_COMMAND_ID, SnowballRow } from '../common/snowballSearch.js';
import { IOpenAlexWork, OPENALEX_TYPES, openAlexIdOf, sameWork, titleWords } from './literatureRadarPage.js';

// Compose > Literature Radar > Snowball Search Map: from a few works the user knows, the seeds, the works their citations lead
// to, poured into one pool ranked by how many seeds each is tied to (Links). The seeds come from PollisReferences, the
// references Pollis brings and the user's, by their keys; Discover Literature's articles not saved there are kept in the
// map's in-memory database. Each action is a step of the map's record, a TOML file of [[step]]s in ~/.pollis/literature,
// the works found in a DuckDB file beside it; the map drawn on the page is drawn from the steps. It follows the works
// that cite each seed (Cited By) and the works each seed cites (Cites), as OpenAlex lists them, and asks Semantic Scholar
// how each citation is made: the sentences citing, why (background, method or result), and whether it is influential.
// Related lists the works Semantic Scholar recommends for a seed, by the likeness of their texts: in the pool, not in Links.

/** What a step of the map did: made a work a seed, listed the works citing a seed, those it cites or those related to it, or removed a seed. */
type StepAction = 'seed' | 'cited_by' | 'cites' | 'related' | 'remove';
/** The steps that make a list: the works citing a seed, those it cites, or those related to it. */
type ListAction = 'cited_by' | 'cites' | 'related';
/** The lists of citations, followed in OpenAlex. */
type CitationAction = Exclude<ListAction, 'related'>;

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
	/** For a Related list, the index that gave it: Semantic Scholar, or OpenAlex for a seed Semantic Scholar has no record of. */
	readonly index?: string;
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
	| { readonly command: 'citedBy' | 'cites'; readonly seeds: readonly string[]; readonly contexts: boolean }
	| { readonly command: 'related'; readonly seeds: readonly string[] }
	| { readonly command: 'contexts'; readonly work: string }
	| { readonly command: 'layout'; readonly portrait: boolean }
	| { readonly command: 'seedWork'; readonly work: string }
	| { readonly command: 'seedKey'; readonly key: string }
	| { readonly command: 'remove'; readonly seed: string }
	| { readonly command: 'view'; readonly show: string; readonly page: number; readonly rows?: number; readonly sort?: string; readonly descending?: boolean }
	| { readonly command: 'find'; readonly text: string }
	| { readonly command: 'save'; readonly name: string; readonly replace: boolean }
	| { readonly command: 'maps' }
	| { readonly command: 'open'; readonly file: string }
	| { readonly command: 'new' }
	| { readonly command: 'openUrl'; readonly url: string };

const ACTIONS: readonly StepAction[] = ['seed', 'cited_by', 'cites', 'related', 'remove'];
const LIST_ACTIONS: readonly StepAction[] = ['cited_by', 'cites', 'related'];
/** Where seeds come from, besides the pool's lists. */
const FROM_REFERENCES = 'PollisReferences';
const FROM_DISCOVER = 'Discover Literature';
/** The fields of a listed work asked of OpenAlex. */
const LIST_SELECT = 'id,doi,title,publication_year,cited_by_count,primary_location,authorships';
// OpenAlex lists at most 200 works a request: the 2,000 most cited works citing a seed, or that it cites, are listed, ten requests
const LIST_PAGE = 200;
const LISTED = 2000;
/**
 * How a list of citations follows its seed: the OpenAlex filter listing its works; what Semantic Scholar is asked of the
 * seed, and which paper of each answer is the work.
 */
const FOLLOW: Record<CitationAction, { readonly filter: string; readonly s2: string; readonly paper: 'citingPaper' | 'citedPaper' }> = {
	cited_by: { filter: 'cites', s2: 'citations', paper: 'citingPaper' },
	cites: { filter: 'cited_by', s2: 'references', paper: 'citedPaper' },
};
/** The relation of a list's links: the work citing the seed (cites), cited by it (cited), or related to it, which Links does not count. */
const RELATION: Record<ListAction, string> = { cited_by: 'cites', cites: 'cited', related: 'related' };
// Semantic Scholar recommends at most 500 works for a paper; OpenAlex is asked for them by their DOIs, 50 a request
const RELATED_LISTED = 500;
const RELATED_BATCH = 50;
const CALL_SITE = 'pollis.snowballSearch';
/** Whether Cited By and Cites also ask Semantic Scholar how the citations are made, as the user last chose. */
const CONTEXTS_KEY = 'pollis.snowball.askContexts';
/** Whether the map grows down, each step a row further, rather than to the right, each a column further. */
const PORTRAIT_KEY = 'pollis.snowball.portrait';
/** What Semantic Scholar is asked of each citation: the citing (or cited) work's DOI, the sentences, the intents, and whether it is influential. */
const CONTEXT_FIELDS = 'externalIds,contexts,intents,isInfluential';
// Semantic Scholar lists at most 1,000 citations a request: up to ten requests a seed, until each work of the list with a DOI is matched
const CONTEXTS_PAGE = 1000;
const CONTEXTS_PAGES = 10;
/** The rows of the pool a page shows, and the top whose newcomers tell how close the pool is to saturation. */
const TOP = 20;

/** The map's tables, in the in-memory database `snowball`; a seed is a work of PollisReferences (key) or an article. */
const TABLES = `CREATE TABLE IF NOT EXISTS snowball.articles (id VARCHAR PRIMARY KEY, doi VARCHAR, openalex VARCHAR, s2 VARCHAR, title VARCHAR, authors VARCHAR[], year INTEGER, journal VARCHAR, cited INTEGER, link VARCHAR);
CREATE TABLE IF NOT EXISTS snowball.seeds (id VARCHAR PRIMARY KEY, key VARCHAR, article VARCHAR, openalex VARCHAR, removed BOOLEAN DEFAULT false);
CREATE TABLE IF NOT EXISTS snowball.works (openalex VARCHAR PRIMARY KEY, doi VARCHAR, title VARCHAR, authors VARCHAR[], year INTEGER, journal VARCHAR, cited INTEGER, link VARCHAR, first_list VARCHAR);
CREATE TABLE IF NOT EXISTS snowball.links (work VARCHAR, seed VARCHAR, relation VARCHAR, list VARCHAR, PRIMARY KEY (work, seed, relation));
CREATE TABLE IF NOT EXISTS snowball.contexts (work VARCHAR, seed VARCHAR, intents VARCHAR[], influential BOOLEAN, contexts VARCHAR[], PRIMARY KEY (work, seed));
CREATE TABLE IF NOT EXISTS snowball.s2_asked (id VARCHAR PRIMARY KEY, known BOOLEAN);
CREATE OR REPLACE VIEW snowball.seed_works AS
	SELECT s.id, s.key, s.article, s.removed, coalesce(s.openalex, r.openalex, a.openalex) AS openalex, lower(coalesce(r.doi, a.doi)) AS doi, a.s2,
		coalesce(r.title, a.title) AS title, coalesce(r.authors, a.authors) AS authors, coalesce(r.year, a.year) AS year, coalesce(r.journal, r.booktitle, a.journal) AS journal,
		coalesce(r.url, a.link) AS link
	FROM snowball.seeds s
	LEFT JOIN PollisReferences.all_references r ON r.key = s.key AND NOT coalesce(r.removed, false)
	LEFT JOIN snowball.articles a ON a.id = s.article`;
// contexts: how a work cites a seed, or a seed the work, as Semantic Scholar has it; s2_asked: the seeds whose citing works
// (by the seed's id) or references (by its id and ' references'), and the works whose references, Semantic Scholar was asked
// for, and whether it has a record of them
const TABLE_NAMES = ['articles', 'seeds', 'works', 'links', 'contexts', 's2_asked'];

/**
 * The pool ranked: by Links, the active seeds a work is tied to, then by its citations. Each work has its ties to the
 * active seeds as Semantic Scholar tells them (`ties`), and `known`, whether Semantic Scholar was asked for its references
 * and has a record of it.
 */
const RANKED = `WITH active AS (SELECT id, openalex FROM snowball.seed_works WHERE NOT removed),
ties AS (
	SELECT c.work, list({seed: c.seed, influential: c.influential, intents: c.intents} ORDER BY c.seed) AS ties,
		(count(*) FILTER (WHERE c.influential))::INTEGER AS influential
	FROM snowball.contexts c JOIN active a ON a.id = c.seed GROUP BY c.work),
pool AS (
	SELECT w.openalex, any_value(w.doi) AS doi, any_value(w.title) AS title, any_value(w.authors) AS authors, any_value(w.year) AS year,
		any_value(w.journal) AS journal, any_value(w.cited) AS cited, any_value(w.link) AS link, any_value(w.first_list) AS first_list,
		(count(DISTINCT a.id) FILTER (WHERE l.relation <> 'related'))::INTEGER AS links,
		list(DISTINCT l.relation || ' ' || a.id) FILTER (WHERE a.id IS NOT NULL) AS how,
		list(DISTINCT l.list) AS lists
	FROM snowball.works w JOIN snowball.links l ON l.work = w.openalex LEFT JOIN active a ON a.id = l.seed
	GROUP BY w.openalex),
ranked AS (
	SELECT pool.*, t.ties, coalesce(t.influential, 0) AS influential, k.known, s.id AS seed, (row_number() OVER (ORDER BY links DESC, cited DESC NULLS LAST, title))::INTEGER AS rank
	FROM pool LEFT JOIN active s ON s.openalex = pool.openalex LEFT JOIN ties t ON t.work = pool.openalex LEFT JOIN snowball.s2_asked k ON k.id = pool.openalex)`;
/**
 * The orders the pool may be shown in, by the heading clicked: Links, then the influential citations among them, then
 * Cited; Year; or Cited. Ties keep the rank. `{0}` is DESC or ASC.
 */
const POOL_ORDERS: Record<string, string> = {
	links: 'links {0}, influential {0}, cited {0} NULLS LAST',
	year: 'year {0} NULLS LAST',
	cited: 'cited {0} NULLS LAST',
};

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
	return [authors?.length ? lastName(authors[0]) : '', year ? `(${year})` : ''].filter(part => part !== '').join(' ');
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
			listed: count(table.listed), found: count(table.found), added: count(table.added), index: text_(table.index),
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
	const providers = new ProviderRequests(accessor.get(IRequestService), accessor.get(ISecretStorageService), CALL_SITE);
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
	webviewInput.webview.setHtml(pageHtml(storageService.getBoolean(CONTEXTS_KEY, StorageScope.PROFILE, true), storageService.getBoolean(PORTRAIT_KEY, StorageScope.PROFILE, false)));
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
	const view = { show: 'all', page: 0, rows: storedRows(storageService, 'snowball', FEWEST_ROWS), sort: 'links', descending: true };
	// The seeds given before the page was ready
	let pending: ISnowballSeeds | undefined = seeds;
	let ready = false;

	const post = (message: object) => webviewInput.webview.postMessage(message);
	const tell = (message: string, error = false) => post({ command: 'notes', message, error });
	const step = (added: ISnowballStep) => {
		map.steps.push(added);
		map.dirty = true;
	};

	const seedRows = async (): Promise<SnowballRow[]> => database.query(`SELECT id, key, article, openalex, doi, s2, title, authors, year, journal, link FROM snowball.seed_works WHERE NOT removed ORDER BY TRY_CAST(substr(id, 2) AS INTEGER)`);

	/** The page's state: the record, the seeds, and the page of the pool shown. */
	const postState = async () => {
		await database.run(TABLES);
		const lists = map.steps.filter(step => LIST_ACTIONS.includes(step.action) && step.id).map(step => step.id!);
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
		const order = POOL_ORDERS[view.sort].replaceAll('{0}', view.descending ? 'DESC' : 'ASC');
		const rows = await database.query(`${RANKED} SELECT * FROM ranked WHERE ${SHOWN} ORDER BY ${order}, rank LIMIT ${size} OFFSET ${view.page * size}`, parameters);
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

	/**
	 * The OpenAlex record of a seed: the one it has, or else the one of its DOI, or else, as for a conference paper without
	 * a DOI, one of the first ten of its title whose title and first author are the same; kept for the next time.
	 */
	const openAlexIdOfSeed = async (seed: SnowballRow): Promise<string | undefined> => {
		const known = text(seed.openalex);
		if (known) {
			return known;
		}
		try {
			const doi = text(seed.doi);
			const context = doi ? await providers.ask(API_PROVIDERS.openAlex, { url: `https://api.openalex.org/works/doi:${encodeURIComponent(doi)}?select=id` }) : undefined;
			const work = context && isSuccess(context) ? await asJson<Pick<IOpenAlexWork, 'id'>>(context) : undefined;
			const id = work?.id ? openAlexIdOf(work as IOpenAlexWork) : await openAlexIdOfTitle(seed);
			if (id) {
				await database.run(`UPDATE snowball.seeds SET openalex = $openalex WHERE id = $id`, { openalex: id, id: String(seed.id) });
			}
			return id;
		} catch {
			return undefined;
		}
	};

	/** The OpenAlex record of the seed's title: one of the first ten found whose title and first author are the same. */
	const openAlexIdOfTitle = async (seed: SnowballRow): Promise<string | undefined> => {
		const title = text(seed.title);
		const words = title ? titleWords(title).join(' ') : '';
		if (!title || !words) {
			return undefined;
		}
		const authors = Array.isArray(seed.authors) ? seed.authors.filter((name): name is string => typeof name === 'string') : [];
		const url = `https://api.openalex.org/works?filter=${encodeURIComponent(`title.search:${words}`)}&per_page=10&select=id,title,publication_year,authorships`;
		const context = await providers.ask(API_PROVIDERS.openAlex, { url });
		const answer = context && isSuccess(context) ? await asJson<{ results?: IOpenAlexWork[] }>(context) : undefined;
		const year = typeof seed.year === 'number' ? seed.year : undefined;
		const found = answer?.results?.find(work => work.title && (authors.length
			? sameWork({ title: work.title, authors: (work.authorships ?? []).map(authorship => authorship.author?.display_name ?? '') }, { title, authors })
			: titleWords(work.title).join(' ') === words && (!year || !work.publication_year || Math.abs(work.publication_year - year) <= 1)));
		return found && openAlexIdOf(found);
	};

	/** OpenAlex's answer at `url`, or what to tell when it gave none: its budget used up, or it could not be reached. */
	const askOpenAlex = async <T>(url: string): Promise<{ answer?: T; problem?: string }> => {
		const unreachable = localize('snowball.unreachable', "OpenAlex could not be reached, or is too busy just now: try again.");
		try {
			const context = await providers.ask(API_PROVIDERS.openAlex, { url });
			if (context?.res.statusCode === 429) {
				return {
					problem: await providers.key(API_PROVIDERS.openAlex)
						? localize('snowball.keyBudgetUsed', "Your OpenAlex key has used up its budget for today. It starts again tomorrow.")
						: localize('snowball.budgetUsed', "The free budget of OpenAlex, shared with everyone on your network, is used up for today. It starts again tomorrow; a free key of your own, set in Discover Literature, has a budget of its own.")
				};
			}
			const answer = context && isSuccess(context) ? await asJson<T>(context) : undefined;
			return answer ? { answer } : { problem: unreachable };
		} catch {
			return { problem: unreachable };
		}
	};

	/** Keeps the `works` OpenAlex gave for the seed `id`, of `found` the index has, as a new list of `action`, a step of the map; returns the list and its rows. */
	const keepList = async (action: ListAction, id: string, works: readonly IOpenAlexWork[], found: number, index?: string) => {
		const list = nextId('L');
		const rows = works.slice(0, LISTED).filter(work => work.title).map(work => {
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
		await database.run(`INSERT OR IGNORE INTO snowball.links SELECT DISTINCT openalex, $seed, $relation, $list FROM (${json})`, { ...parameters, seed: id, relation: RELATION[action] });
		const [added] = await database.query(`SELECT count(*)::INTEGER AS added FROM snowball.works WHERE first_list = $list`, { list });
		step({ id: list, action, from: id, at: now(), listed: rows.length, found: Math.max(found, rows.length), added: typeof added?.added === 'number' ? added.added : 0, index });
		return { list, rows };
	};

	/**
	 * Lists the works citing each of the seeds with `ids`, or of all seeds (Cited By), or the works each cites (Cites), as
	 * OpenAlex has them, the most cited first: a list of the map for each seed not followed so already. With `contexts`,
	 * Semantic Scholar is asked too how the citations are made.
	 */
	const follow = async (action: CitationAction, ids: readonly string[], contexts: boolean) => {
		const cites = action === 'cites';
		await database.run(TABLES);
		const seeds = (await seedRows()).filter(seed => !ids.length || ids.includes(String(seed.id)));
		const notes: string[] = [];
		for (const seed of seeds) {
			const id = String(seed.id);
			const done = map.steps.find(step => step.action === action && step.from === id);
			if (done) {
				notes.push(cites
					? localize('snowball.alreadyCites', "The works {0} cites are {1} already.", id, done.id)
					: localize('snowball.alreadyCitedBy', "The works citing {0} are {1} already.", id, done.id));
				continue;
			}
			const openAlexId = await openAlexIdOfSeed(seed);
			if (!openAlexId) {
				notes.push(cites
					? localize('snowball.noOpenAlexRecordCites', "OpenAlex has no record of {0} that Pollis could find: the works it cites are not listed.", id)
					: localize('snowball.noOpenAlexRecord', "OpenAlex has no record of {0} that Pollis could find: its works citing it are not listed.", id));
				continue;
			}
			const works: IOpenAlexWork[] = [];
			let found = 0;
			let cursor: string | undefined = '*';
			let problem: string | undefined;
			while (cursor && works.length < LISTED) {
				post({
					command: 'progress', message: cites
						? localize('snowball.askingCites', "Asking OpenAlex for the works {0} cites: {1} listed so far.", id, works.length.toLocaleString())
						: localize('snowball.asking', "Asking OpenAlex for the works citing {0}: {1} listed so far.", id, works.length.toLocaleString())
				});
				const filter = `${FOLLOW[action].filter}:${openAlexId},type:${OPENALEX_TYPES}`;
				type Page = { meta?: { count?: number; next_cursor?: string | null }; results?: IOpenAlexWork[] };
				const asked: { answer?: Page; problem?: string } = await askOpenAlex<Page>(`https://api.openalex.org/works?filter=${encodeURIComponent(filter)}&sort=cited_by_count:desc&per_page=${LIST_PAGE}&cursor=${encodeURIComponent(cursor)}&select=${LIST_SELECT}`);
				if (!asked.answer?.results) {
					problem = asked.problem ?? localize('snowball.unreachable', "OpenAlex could not be reached, or is too busy just now: try again.");
					break;
				}
				found = asked.answer.meta?.count ?? found;
				works.push(...asked.answer.results);
				cursor = asked.answer.results.length ? asked.answer.meta?.next_cursor ?? undefined : undefined;
			}
			if (problem) {
				// A list half fetched is not kept: the step is taken again whole
				notes.push(problem);
				break;
			}
			const { list, rows } = await keepList(action, id, works, found);
			if (found > rows.length) {
				notes.push(cites
					? localize('snowball.mostCitedCites', "{0} cites {1} works; {2} lists the {3} most cited.", id, found.toLocaleString(), list, rows.length.toLocaleString())
					: localize('snowball.mostCited', "{0} is cited by {1} works; {2} lists the {3} most cited.", id, found.toLocaleString(), list, rows.length.toLocaleString()));
			}
			if (contexts) {
				const problem = await listContexts(action, seed, list, rows);
				if (problem) {
					notes.push(problem);
				}
			}
		}
		tell(notes.join(' '), notes.length > 0 && !notes.every(note => note.includes('lists the')));
	};

	/**
	 * Lists the works Semantic Scholar recommends for each of the seeds with `ids`, or of all seeds, by the likeness of their
	 * titles and abstracts, up to 500, as OpenAlex has them by their DOIs; for a seed Semantic Scholar has no record of, or
	 * no recommendation for, the ten or so works OpenAlex relates to it. A list of the map for each seed not followed so
	 * already, whose works join the pool but are not counted in Links.
	 */
	const related = async (ids: readonly string[]) => {
		await database.run(TABLES);
		const seeds = (await seedRows()).filter(seed => !ids.length || ids.includes(String(seed.id)));
		const notes: string[] = [];
		let failed = false;
		for (const seed of seeds) {
			const id = String(seed.id);
			const done = map.steps.find(step => step.action === 'related' && step.from === id);
			if (done) {
				notes.push(localize('snowball.alreadyRelated', "The works related to {0} are {1} already.", id, done.id));
				continue;
			}
			// The OpenAlex filters listing the works, each up to RELATED_BATCH of them
			let filters: string[] = [];
			let found = 0;
			let index = 'Semantic Scholar';
			const record = text(seed.s2) ?? (text(seed.doi) ? `DOI:${text(seed.doi)}` : undefined);
			if (record) {
				post({ command: 'progress', message: localize('snowball.askingRelated', "Asking Semantic Scholar for the works related to {0}.", id) });
				let answer: { recommendedPapers?: NonNullable<ISemanticScholarCitation['citedPaper']>[] } | undefined | null;
				try {
					const context = await providers.ask(API_PROVIDERS.semanticScholar, { url: `https://api.semanticscholar.org/recommendations/v1/papers/forpaper/${encodeURIComponent(record)}?limit=${RELATED_LISTED}&fields=externalIds`, attempts: 4 });
					answer = context?.res.statusCode === 404 ? null : context && isSuccess(context) ? await asJson<{ recommendedPapers?: NonNullable<ISemanticScholarCitation['citedPaper']>[] }>(context) : undefined;
				} catch {
					answer = undefined;
				}
				if (answer === undefined) {
					notes.push(localize('snowball.relatedUnreachable', "Semantic Scholar could not be reached, or is too busy just now, so the works related to {0} are not listed: try again.", id));
					failed = true;
					break;
				}
				const papers = answer?.recommendedPapers ?? [];
				const dois = [...new Set(papers.map(paper => paper.externalIds?.DOI?.toLowerCase()).filter((doi): doi is string => !!doi && !/[,|]/.test(doi)))];
				found = papers.length;
				for (let start = 0; start < dois.length; start += RELATED_BATCH) {
					filters.push(`doi:${dois.slice(start, start + RELATED_BATCH).join('|')}`);
				}
			}
			if (!filters.length) {
				// Semantic Scholar has no record of the seed, or nothing to recommend: OpenAlex's related works
				index = 'OpenAlex';
				const openAlexId = await openAlexIdOfSeed(seed);
				if (!openAlexId) {
					notes.push(localize('snowball.noRecordRelated', "Neither Semantic Scholar nor OpenAlex has a record of {0} that Pollis could find: the works related to it are not listed.", id));
					continue;
				}
				const asked = await askOpenAlex<{ related_works?: string[] }>(`https://api.openalex.org/works/${encodeURIComponent(openAlexId)}?select=related_works`);
				if (!asked.answer) {
					notes.push(asked.problem!);
					failed = true;
					break;
				}
				const relatedIds = (asked.answer.related_works ?? []).map(work => work.replace(/^https:\/\/openalex\.org\//, ''));
				found = relatedIds.length;
				filters = relatedIds.length ? [`openalex:${relatedIds.join('|')}`] : [];
			}
			const works: IOpenAlexWork[] = [];
			let problem: string | undefined;
			for (const filter of filters) {
				post({ command: 'progress', message: localize('snowball.askingRelatedWorks', "Asking OpenAlex for the works related to {0}: {1} listed so far.", id, works.length.toLocaleString()) });
				const asked = await askOpenAlex<{ results?: IOpenAlexWork[] }>(`https://api.openalex.org/works?filter=${encodeURIComponent(`${filter},type:${OPENALEX_TYPES}`)}&per_page=${RELATED_BATCH}&select=${LIST_SELECT}`);
				if (!asked.answer?.results) {
					problem = asked.problem ?? localize('snowball.unreachable', "OpenAlex could not be reached, or is too busy just now: try again.");
					break;
				}
				works.push(...asked.answer.results);
			}
			if (problem) {
				notes.push(problem);
				failed = true;
				break;
			}
			works.sort((a, b) => (b.cited_by_count ?? 0) - (a.cited_by_count ?? 0));
			const { list, rows } = await keepList('related', id, works, found, index);
			notes.push(index === 'OpenAlex'
				? localize('snowball.relatedOpenAlex', "Semantic Scholar recommends nothing for {0}: {1} lists the {2} works OpenAlex relates to it.", id, list, rows.length.toLocaleString())
				: localize('snowball.relatedListed', "Semantic Scholar recommends {1} works for {0}; {2} lists the {3} of them OpenAlex has by their DOIs.", id, found.toLocaleString(), list, rows.length.toLocaleString()));
		}
		tell(notes.join(' '), failed);
	};

	/** Keeps how a work cites a seed, for each of the `citations` Semantic Scholar listed that `match` ties to a work of the pool and a seed; returns how many. */
	const keepContexts = async (citations: readonly ISemanticScholarCitation[], match: (citation: ISemanticScholarCitation) => { work: string; seed: string } | undefined) => {
		const rows = citations.flatMap(citation => {
			const tie = match(citation);
			return tie ? [{ ...tie, intents: citation.intents ?? [], influential: !!citation.isInfluential, contexts: citation.contexts ?? [] }] : [];
		});
		if (rows.length) {
			await database.run(`INSERT OR REPLACE INTO snowball.contexts SELECT work, seed, intents, influential, contexts FROM (SELECT unnest(from_json($rows, '[{"work":"VARCHAR","seed":"VARCHAR","intents":["VARCHAR"],"influential":"BOOLEAN","contexts":["VARCHAR"]}]'), recursive := true))`, { rows: JSON.stringify(rows) });
		}
		return rows.length;
	};

	/**
	 * Asks Semantic Scholar how the works of `list` cite `seed`, its citations a thousand to a request (Cited By), or how
	 * `seed` cites them, its references (Cites), until each work of the list with a DOI is matched, or ten requests; a work
	 * is matched by its DOI. Returns what to tell when it could not be asked.
	 */
	const listContexts = async (action: CitationAction, seed: SnowballRow, list: string, works: readonly { openalex: string; doi: string | null }[]): Promise<string | undefined> => {
		const cites = action === 'cites';
		const id = String(seed.id);
		const asked = cites ? `${id} references` : id;
		const record = text(seed.s2) ?? (text(seed.doi) ? `DOI:${text(seed.doi)}` : undefined);
		if (!record) {
			return cites
				? localize('snowball.contextsNoDoiCites', "Semantic Scholar was not asked how {0} cites the works: it has no DOI.", id)
				: localize('snowball.contextsNoDoi', "Semantic Scholar was not asked how the works cite {0}: it has no DOI.", id);
		}
		const byDoi = new Map(works.flatMap(work => work.doi ? [[work.doi, work.openalex] as const] : []));
		const matched = new Set<string>();
		for (let page = 0; page < CONTEXTS_PAGES && matched.size < byDoi.size; page++) {
			post({
				command: 'progress', message: cites
					? localize('snowball.askingContextsCites', "Asking Semantic Scholar how {1} cites the works of {0}: {2} of {3} matched so far.", list, id, matched.size.toLocaleString(), byDoi.size.toLocaleString())
					: localize('snowball.askingContexts', "Asking Semantic Scholar how the works of {0} cite {1}: {2} of {3} matched so far.", list, id, matched.size.toLocaleString(), byDoi.size.toLocaleString())
			});
			let answer: { next?: number; data?: ISemanticScholarCitation[] } | undefined | null;
			try {
				const context = await providers.ask(API_PROVIDERS.semanticScholar, { url: `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(record)}/${FOLLOW[action].s2}?fields=${CONTEXT_FIELDS}&offset=${page * CONTEXTS_PAGE}&limit=${CONTEXTS_PAGE}`, attempts: 4 });
				if (context?.res.statusCode === 404) {
					await database.run(`INSERT OR REPLACE INTO snowball.s2_asked VALUES ($id, false)`, { id: asked });
					return cites
						? localize('snowball.contextsUnknownCites', "Semantic Scholar has no record of {0}: how it cites the works is not known.", id)
						: localize('snowball.contextsUnknown', "Semantic Scholar has no record of {0}: how the works cite it is not known.", id);
				}
				answer = context && isSuccess(context) ? await asJson<{ next?: number; data?: ISemanticScholarCitation[] }>(context) : undefined;
			} catch {
				answer = undefined;
			}
			if (!answer) {
				return cites
					? localize('snowball.contextsUnreachableCites', "Semantic Scholar could not be reached, or was too busy, so {0} lacks how {1} cites its works: click a work's Links to ask again.", list, id)
					: localize('snowball.contextsUnreachable', "Semantic Scholar could not be reached, or was too busy, so {0} lacks how its works cite {1}: click a work's Links to ask again.", list, id);
			}
			await keepContexts(answer.data ?? [], citation => {
				const doi = citation[FOLLOW[action].paper]?.externalIds?.DOI?.toLowerCase();
				const work = doi ? byDoi.get(doi) : undefined;
				if (!work) {
					return undefined;
				}
				matched.add(work);
				return { work, seed: id };
			});
			if (typeof answer.next !== 'number') {
				break;
			}
		}
		await database.run(`INSERT OR REPLACE INTO snowball.s2_asked VALUES ($id, true)`, { id: asked });
		return undefined;
	};

	/**
	 * How the work `openAlexId` of the pool cites each active seed it is tied to, or is cited by it; when Semantic Scholar
	 * did not say how it cites one of them, and was not asked for its references yet, they are asked for, by its DOI; when
	 * it did not say how a seed cites it, and was not asked for the seed's references yet, those are asked for.
	 */
	const contextsOf = async (openAlexId: string) => {
		await database.run(TABLES);
		const tiesOf = () => database.query(`SELECT a.id AS seed, l.relation, l.list, c.intents, c.influential, c.contexts
			FROM snowball.links l JOIN snowball.seed_works a ON a.id = l.seed AND NOT a.removed LEFT JOIN snowball.contexts c ON c.work = l.work AND c.seed = a.id
			WHERE l.work = $work ORDER BY TRY_CAST(substr(a.id, 2) AS INTEGER), l.relation = 'related', l.relation DESC`, { work: openAlexId });
		const [work] = await database.query(`SELECT w.doi, k.known FROM snowball.works w LEFT JOIN snowball.s2_asked k ON k.id = w.openalex WHERE w.openalex = $work`, { work: openAlexId });
		let ties = await tiesOf();
		let known = typeof work?.known === 'boolean' ? work.known : undefined;
		let problem: string | undefined;
		const doi = text(work?.doi);
		if (doi && known === undefined && ties.some(tie => tie.relation === RELATION.cited_by && tie.intents === null)) {
			try {
				const context = await providers.ask(API_PROVIDERS.semanticScholar, { url: `https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(doi)}/references?fields=${CONTEXT_FIELDS}&limit=${CONTEXTS_PAGE}`, attempts: 4 });
				const answer = context?.res.statusCode === 404 ? null : context && isSuccess(context) ? await asJson<{ data?: ISemanticScholarCitation[] }>(context) : undefined;
				if (answer === undefined) {
					problem = localize('snowball.contextsBusy', "Semantic Scholar could not be reached, or is too busy just now: try again.");
				} else {
					known = answer !== null;
					const seeds = await seedRows();
					await keepContexts(answer?.data ?? [], citation => {
						const cited = citation.citedPaper;
						const doi = cited?.externalIds?.DOI?.toLowerCase();
						const seed = seeds.find(seed => cited?.paperId && seed.s2 === cited.paperId || doi && seed.doi === doi);
						return seed ? { work: openAlexId, seed: String(seed.id) } : undefined;
					});
					await database.run(`INSERT OR REPLACE INTO snowball.s2_asked VALUES ($id, $known)`, { id: openAlexId, known });
					ties = await tiesOf();
				}
			} catch {
				problem = localize('snowball.contextsBusy', "Semantic Scholar could not be reached, or is too busy just now: try again.");
			}
		}
		for (const tie of ties.filter(tie => tie.relation === RELATION.cites && tie.intents === null)) {
			const id = String(tie.seed);
			const [asked] = await database.query(`SELECT 1 FROM snowball.s2_asked WHERE id = $id`, { id: `${id} references` });
			const seed = (await seedRows()).find(seed => seed.id === id);
			if (asked || !seed || problem) {
				continue;
			}
			const works = await database.query(`SELECT w.openalex, w.doi FROM snowball.links l JOIN snowball.works w ON w.openalex = l.work WHERE l.seed = $seed AND l.relation = $relation`, { seed: id, relation: RELATION.cites });
			problem = await listContexts('cites', seed, String(tie.list), works.map(work => ({ openalex: String(work.openalex), doi: text(work.doi) ?? null })));
			ties = await tiesOf();
		}
		post({ command: 'contexts', work: openAlexId, ties, known: doi ? known : false, problem });
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
			await database.run(`DETACH DATABASE IF EXISTS results; ATTACH ${sqlString(results.fsPath)} AS results (READ_ONLY)`);
			// A map saved before a table was added lacks it
			const saved = new Set((await database.query(`SELECT table_name FROM duckdb_tables() WHERE database_name = 'results'`)).map(row => row.table_name));
			await database.run(`${TABLE_NAMES.filter(table => saved.has(table)).map(table => `INSERT INTO snowball.${table} SELECT * FROM results.${table};`).join('\n')}
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
			case 'cites':
				if (Array.isArray(message.seeds)) {
					const contexts = message.contexts === true;
					storageService.store(CONTEXTS_KEY, contexts, StorageScope.PROFILE, StorageTarget.USER);
					await queue(() => follow(message.command === 'cites' ? 'cites' : 'cited_by', message.seeds.filter(seed => typeof seed === 'string'), contexts));
				}
				break;
			case 'related':
				if (Array.isArray(message.seeds)) {
					await queue(() => related(message.seeds.filter(seed => typeof seed === 'string')));
				}
				break;
			case 'layout':
				storageService.store(PORTRAIT_KEY, message.portrait === true, StorageScope.PROFILE, StorageTarget.USER);
				break;
			case 'contexts':
				if (typeof message.work === 'string') {
					// The pool is shown again only when Semantic Scholar was asked, its ties then known
					await sequencer.queue(async () => {
						try {
							await contextsOf(message.work);
							await postState();
						} catch (error) {
							post({ command: 'contexts', work: message.work, ties: [], problem: error instanceof Error ? error.message : String(error) });
						}
					});
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
					if (typeof message.sort === 'string' && Object.hasOwn(POOL_ORDERS, message.sort)) {
						view.sort = message.sort;
						view.descending = message.descending !== false;
					}
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

/** A citation as Semantic Scholar lists it: of a work's citing works (`citingPaper`), or of its references (`citedPaper`). */
interface ISemanticScholarCitation {
	readonly contexts?: string[];
	readonly intents?: string[];
	readonly isInfluential?: boolean;
	readonly citingPaper?: { readonly paperId?: string; readonly externalIds?: { readonly DOI?: string } | null };
	readonly citedPaper?: { readonly paperId?: string; readonly externalIds?: { readonly DOI?: string } | null };
}

/** Whether `value`, from another page, is an article to keep. */
function isArticle(value: unknown): value is ISnowballArticle {
	const article = value as ISnowballArticle;
	return !!article && typeof article === 'object' && typeof article.id === 'string' && typeof article.title === 'string' && typeof article.year === 'number'
		&& Array.isArray(article.authors) && typeof article.link === 'string';
}

function pageHtml(askContexts: boolean, portrait: boolean): string {
	const text = {
		title: localize('snowball.title', "Snowball Search Map"),
		intro: localize('snowball.intro', "Start from a few works you know, the seeds, and follow their citations: the works citing them, and those they cite, pour into one pool, ranked by how many seeds each is tied to. Make the best of them seeds and go on, until a step adds little to the top of the pool. Each step is kept in the map's record, which you can save and open again."),
		untitled: localize('snowball.untitled', "Untitled Map"),
		notSaved: localize('snowball.notSaved', "not saved"),
		save: localize('snowball.save', "Save..."),
		open: localize('snowball.open', "Open..."),
		newSearch: localize('snowball.newSearch', "New Search"),
		mapEmpty: localize('snowball.mapEmpty', "The map draws itself as you go: add a seed below."),
		layout: localize('snowball.layout', "Layout:"),
		landscape: localize('snowball.landscape', "Landscape"),
		landscapeHint: localize('snowball.landscapeHint', "The map grows to the right: shorter, but wide maps need scrolling"),
		portrait: localize('snowball.portrait', "Portrait"),
		portraitHint: localize('snowball.portraitHint', "The map grows down: taller, but more of it is seen at once"),
		legendSource: localize('snowball.legendSource', "where seeds came from"),
		legendSeed: localize('snowball.legendSeed', "a seed, filled when chosen: click it to choose it or not"),
		legendList: localize('snowball.legendList', "a list of works citing a seed, cited by it or related to it, and how many: click it to see it in the pool"),
		chosenNote: localize('snowball.chosenNote', "Chosen: {0}. Cited By, Cites and Related follow these seeds alone. Click a seed to choose it or not, or {1} to follow all seeds."),
		chooseAll: localize('snowball.chooseAll', "All Seeds"),
		selectEdge: localize('snowball.selectEdge', "Select"),
		citedByEdge: localize('snowball.citedByEdge', "Cited by"),
		citesEdge: localize('snowball.citesEdge', "Cites"),
		relatedEdge: localize('snowball.relatedEdge', "Related"),
		relatedHead: localize('snowball.relatedHead', "Related to"),
		removed: localize('snowball.removed', "removed"),
		seeds: localize('snowball.seeds', "Seeds ({0})"),
		noSeeds: localize('snowball.noSeeds', "No seeds yet. Find works in your references below, or tick articles in Discover Literature and choose Snowball Search..."),
		removeSeed: localize('snowball.removeSeed', "Remove this seed: its lists stay on the map, and Links is counted again"),
		forAll: localize('snowball.forAll', "For all seeds:"),
		forChosen: localize('snowball.forChosen', "For {0} alone:"),
		citedBy: localize('snowball.citedBy', "Cited By"),
		citedByHint: localize('snowball.citedByHint', "Lists the works citing each seed, the 2,000 most cited, as OpenAlex has them: a list on the map for each seed not followed so already"),
		citesAction: localize('snowball.citesAction', "Cites"),
		citesHint: localize('snowball.citesHint', "Lists the works each seed cites, as OpenAlex has them: a list on the map for each seed not followed so already"),
		relatedAction: localize('snowball.relatedAction', "Related"),
		relatedHint: localize('snowball.relatedHint', "Lists the works Semantic Scholar recommends for each seed, by the likeness of their titles and abstracts, mostly recent, up to 500; for a seed it has no record of, the ten or so OpenAlex relates to it. They join the pool, but Links does not count them"),
		askContexts: localize('snowball.askContexts.citations', "Ask Semantic Scholar About the Citations"),
		askContextsHint: localize('snowball.askContextsHint.citations', "Semantic Scholar also tells, for each citation of a list, the sentences citing, why (background, method or result), and whether the citation is influential"),
		findLabel: localize('snowball.findLabel', "Add Seeds"),
		findPlaceholder: localize('snowball.findPlaceholder', "Find works in PollisReferences by title, author or key"),
		noneFound: localize('snowball.noneFound', "No work in PollisReferences matches."),
		seed: localize('snowball.seed', "Seed"),
		seedHint: localize('snowball.seedHint', "Make this work a seed"),
		isSeed: localize('snowball.isSeed', "Already a seed"),
		pool: localize('snowball.pool', "Pool"),
		poolEmpty: localize('snowball.poolEmpty', "Empty: Cited By, Cites and Related fill it."),
		poolLine: localize('snowball.poolLine', "{0} works from {1} · the last step added {2}, {3} of them in the top {4}"),
		show: localize('snowball.show', "Show:"),
		showAll: localize('snowball.showAll', "All"),
		showNew: localize('snowball.showNew', "New Since Last Step"),
		links: localize('snowball.links', "Links"),
		linksHint: localize('snowball.linksHint', "How many seeds the work is tied to: a filled dot for a citation Semantic Scholar finds influential, a hollow one for the others. \u2248 marks a seed it is only related to, which Links does not count. Click the dots to see how it cites each seed, or is cited by it; click the heading to sort by Links, then by the filled dots"),
		sortHint: localize('snowball.sortHint', "Click to sort by it"),
		background: localize('snowball.background', "Background"),
		method: localize('snowball.method', "Method"),
		result: localize('snowball.result', "Result"),
		influential: localize('snowball.influential', "Influential"),
		noRecord: localize('snowball.noRecord', "No Semantic Scholar record"),
		noContext: localize('snowball.noContext', "Semantic Scholar does not say how it cites this seed."),
		noContextCited: localize('snowball.noContextCited', "Semantic Scholar does not say how this seed cites it."),
		noSentences: localize('snowball.noSentences', "Semantic Scholar gives no sentence citing it."),
		askingContexts: localize('snowball.askingContexts.page', "Asking Semantic Scholar how it cites the seeds..."),
		work: localize('snowball.work', "Work"),
		year: localize('snowball.year', "Year"),
		cited: localize('snowball.cited', "Cited"),
		citedHint: localize('snowball.citedHint', "Times cited, as OpenAlex counts them: click to sort by it"),
		from: localize('snowball.from', "From"),
		fromHint: localize('snowball.fromHint', "The lists the work is in"),
		cites: localize('snowball.cites', "cites {0}"),
		citedBySeed: localize('snowball.citedBySeed', "cited by {0}"),
		relatedTo: localize('snowball.relatedTo', "related to {0}"),
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
		${stickyHeadCss}
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
		button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: 1px solid var(--vscode-button-background); border-radius: 2px; padding: 5px 16px; min-width: 96px; cursor: pointer; font-size: 11px; opacity: 0.7; }
		/* As the code buttons below a panel's Example Code: dimmed until pointed at, the blue one not */
		button.action:not(:disabled):hover, button.action.current, button.action.primary { opacity: 1; }
		button.action:hover { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button:disabled, button:disabled:hover { opacity: 0.5; cursor: default; }
		.actionBar { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 12px; margin: 16px 0; }
		.actionBar > .tick { margin-left: 12px; }
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
		svg .node.source rect { fill: none; stroke: var(--vscode-descriptionForeground); stroke-dasharray: 3 3; }
		svg .node.removed rect { stroke-dasharray: 4 3; stroke: var(--vscode-disabledForeground); }
		svg .node.removed text { fill: var(--vscode-disabledForeground); }
		svg .node.chosen rect { stroke: var(--vscode-focusBorder); stroke-width: 2; }
		svg .node.seed.chosen rect { stroke: var(--vscode-focusBorder); stroke-width: 2; fill: var(--vscode-list-activeSelectionBackground, var(--vscode-editor-background)); }
		svg .node.seed.chosen text { fill: var(--vscode-list-activeSelectionForeground, var(--vscode-foreground)); font-weight: 600; }
		.shape { display: inline-block; vertical-align: middle; width: 24px; height: 12px; margin-right: 4px; box-sizing: border-box; font-size: 9px; line-height: 10px; text-align: center; }
		.shape.source { border: 1px dashed var(--vscode-descriptionForeground); }
		.shape.seed { border: 1px solid var(--vscode-textLink-foreground); border-radius: 6px; }
		.shape.list { border: 1px solid var(--vscode-widget-border, var(--vscode-descriptionForeground)); background: var(--vscode-editor-background); color: var(--vscode-foreground); }
		.chosenNote { font-size: 12px; margin: 6px 8px 0 8px; }
		svg .node text { fill: var(--vscode-foreground); font-size: 12px; }
		svg .node.source text { fill: var(--vscode-descriptionForeground); }
		svg .edge { fill: none; stroke: var(--vscode-descriptionForeground); stroke-width: 1; }
		svg .edge.removed { stroke-dasharray: 4 3; }
		svg .arrow { fill: var(--vscode-descriptionForeground); }
		svg .edgeLabel { fill: var(--vscode-descriptionForeground); font-size: 10px; paint-order: stroke; stroke: var(--vscode-welcomePage-tileBackground, var(--vscode-editorWidget-background)); stroke-width: 4px; }
		.legend { font-size: 11px; color: var(--vscode-descriptionForeground); margin: 4px 8px 0 8px; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 16px; }
		.legend[hidden] { display: none; }
		.layoutChoice .link { font-size: 11px; }
		.layoutChoice .link.chosen { color: var(--vscode-foreground); font-weight: 600; cursor: default; text-decoration: none; }
		.seedList { margin: 0; padding: 0; list-style: none; }
		.seedList li { display: flex; align-items: baseline; gap: 8px; padding: 4px 8px; border-bottom: 1px solid var(--vscode-widget-border); }
		.seedList li.chosen { box-shadow: inset 2px 0 0 var(--vscode-focusBorder); }
		.seedList .seedId { font-weight: 600; min-width: 28px; cursor: pointer; }
		.seedList .seedText { flex: 1; min-width: 0; }
		.muted { color: var(--vscode-descriptionForeground); }
		button.removeSeed { font: inherit; font-size: 14px; line-height: 1; color: var(--vscode-descriptionForeground); background: none; border: none; padding: 0 4px; cursor: pointer; }
		button.removeSeed:hover { color: var(--vscode-foreground); }
		.finder { margin-top: 20px; }
		.found { margin-top: 4px; }
		.found div { padding: 3px 0; font-size: 12px; }
		.poolLine { color: var(--vscode-descriptionForeground); font-size: 12px; }
		.showRow { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; margin: 8px 0; }
		.showRow label { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
		table { width: 100%; border-collapse: collapse; font-size: 12px; }
		th { text-align: left; font-weight: normal; color: var(--vscode-descriptionForeground); padding: 4px 8px; border-bottom: 1px solid var(--vscode-widget-border); white-space: nowrap; }
		th.number, td.number { text-align: right; }
		th.sortable { cursor: pointer; }
		th.sortable:hover { color: var(--vscode-foreground); }
		td { padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); vertical-align: top; }
		td.number { white-space: nowrap; font-variant-numeric: tabular-nums; }
		td.dots { white-space: nowrap; color: var(--vscode-textLink-foreground); letter-spacing: 1px; cursor: pointer; }
		tr.detail td { padding: 4px 8px 10px 32px; background: var(--vscode-welcomePage-tileBackground, var(--vscode-editorWidget-background)); }
		.tie { margin: 6px 0; }
		.tieHead { display: flex; flex-wrap: wrap; gap: 8px; align-items: baseline; }
		.tieHead .seedId { font-weight: 600; }
		.tieHead .influential { color: var(--vscode-textLink-foreground); }
		.context { margin: 4px 0 0 12px; padding-left: 8px; border-left: 2px solid var(--vscode-widget-border); color: var(--vscode-descriptionForeground); line-height: 1.4; }
		.tick { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; color: var(--vscode-descriptionForeground); }
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
	<div class="chosenNote" id="chosenNote" hidden></div>
	<div class="legend" id="legend" hidden><span><span class="shape source">&equiv;</span>${text.legendSource} · <span class="shape seed"></span>${text.legendSeed} · <span class="shape list">&equiv;</span>${text.legendList}</span><span class="layoutChoice">${text.layout} <button class="link" id="landscape" title="${text.landscapeHint}">${text.landscape}</button> · <button class="link" id="portrait" title="${text.portraitHint}">${text.portrait}</button></span></div>

	<div class="sectionHeader"><h2 id="seedsTitle"></h2></div>
	<ul class="seedList" id="seedList"></ul>
	<div class="empty" id="noSeeds" hidden>${text.noSeeds}</div>
	<div class="actionBar" id="seedBar" hidden>
		<span class="actionLabel" id="forLabel"></span>
		<button class="action current" id="citedBy" title="${text.citedByHint}">${text.citedBy}</button>
		<button class="action" id="cites" title="${text.citesHint}">${text.citesAction}</button>
		<button class="action" id="related" title="${text.relatedHint}">${text.relatedAction}</button>
		<label class="tick" title="${text.askContextsHint}"><input type="checkbox" id="askContexts"${askContexts ? ' checked' : ''}>${text.askContexts}</label>
	</div>
	<div class="status" id="status" hidden></div>
	<div class="finder">
		<div class="row"><label for="find">${text.findLabel}</label><input type="text" id="find" placeholder="${text.findPlaceholder}" spellcheck="false" autocomplete="off"></div>
		<div class="found" id="found"></div>
	</div>

	<div class="sectionHeader"><h2>${text.pool}</h2></div>
	<div class="poolLine" id="poolLine"></div>
	<div class="showRow stickyBand" id="showRow" hidden></div>
	<div class="pager" id="pagerTop" hidden></div>
	<table id="poolTable" class="stickyHead" hidden>
		<thead><tr><th class="sortable" data-sort="links" title="${text.linksHint}">${text.links}</th><th>${text.work}</th><th class="number sortable" data-sort="year" title="${text.sortHint}">${text.year}</th><th class="number sortable" data-sort="cited" title="${text.citedHint}">${text.cited}</th><th title="${text.fromHint}">${text.from}</th><th></th></tr></thead>
		<tbody id="poolRows"></tbody>
	</table>
	<div class="pager" id="pager" hidden></div>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	const TEXT = ${JSON.stringify(text)};
	${rowsChoiceScript()}
	${stickyHeadScript()}
	const TOP = ${TOP};
	let state = { steps: [], seeds: [], rows: [], lists: [], summary: {}, view: { show: 'all', page: 0, rows: ${FEWEST_ROWS}, sort: 'links', descending: true } };
	stickBand(document.getElementById('showRow'), document.getElementById('poolTable'));
	// The seeds Cited By follows, when some are chosen on the map; all of them when none is
	const chosen = new Set();
	let portrait = ${portrait};
	let busy = false;
	let findTimer;
	// The works of the pool whose Links are open, and how each cites its seeds, as the host told it
	const expanded = new Set();
	const details = new Map();
	const INTENTS = { background: TEXT.background, methodology: TEXT.method, result: TEXT.result };

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
		const nodeOf = id => nodes.get(id) || add({ id, kind: 'source', label: '\\u2261 ' + id, depth: 0 });
		for (const step of state.steps) {
			if (step.action === 'seed' && step.id) {
				const parents = (Array.isArray(step.from) ? step.from : [step.from]).map(nodeOf);
				const node = add({ id: step.id, kind: 'seed', label: step.id + (step.label ? ' ' + step.label : ''), title: step.title, depth: Math.max(0, ...parents.map(parent => parent.depth)) + 1 });
				parents.forEach(parent => edges.push({ from: parent, to: node, label: TEXT.selectEdge }));
			} else if ((step.action === 'cited_by' || step.action === 'cites' || step.action === 'related') && step.id) {
				const seed = nodeOf(step.from);
				const node = add({ id: step.id, kind: 'list', label: '\\u2261 ' + step.id + '  ' + (step.listed || 0).toLocaleString(), depth: seed.depth + 1 });
				edges.push({ from: seed, to: node, label: step.action === 'related' ? TEXT.relatedEdge : step.action === 'cites' ? TEXT.citesEdge : TEXT.citedByEdge });
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
		// In landscape each step is a column further, the nodes of a step one under another; in portrait a row further, side by side
		const COLUMN = 250, WIDTH = 170, HEIGHT = 28, ROW = 44, LEVEL = 72, SIDE = 190, MARGIN = 8;
		const places = new Map();
		for (const node of nodes) {
			node.place = places.get(node.depth) || 0;
			places.set(node.depth, node.place + 1);
			node.x = MARGIN + (portrait ? node.place * SIDE : node.depth * COLUMN);
			node.y = MARGIN + (portrait ? node.depth * LEVEL : node.place * ROW);
		}
		const width = MARGIN * 2 + Math.max(...nodes.map(node => node.x)) + WIDTH;
		const height = MARGIN * 2 + Math.max(...nodes.map(node => node.y)) + HEIGHT;
		const svg = svgElement('svg', { width, height, viewBox: '0 0 ' + width + ' ' + height, role: 'img' });
		const marker = svgElement('marker', { id: 'arrow', viewBox: '0 0 8 8', refX: 8, refY: 4, markerWidth: 8, markerHeight: 8, orient: 'auto' });
		marker.append(svgElement('path', { d: 'M0,0 L8,4 L0,8 z', class: 'arrow' }));
		const defs = svgElement('defs');
		defs.append(marker);
		svg.append(defs);
		for (const edge of edges) {
			const removed = edge.from.removed || edge.to.removed;
			let d, label;
			if (portrait) {
				const x1 = edge.from.x + WIDTH / 2, y1 = edge.from.y + HEIGHT, x2 = edge.to.x + WIDTH / 2, y2 = edge.to.y, middle = (y1 + y2) / 2;
				d = 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + middle + ' ' + x2 + ',' + middle + ' ' + x2 + ',' + y2;
				label = svgElement('text', { x: (x1 + x2) / 2 + 4, y: middle + 3, 'text-anchor': 'start', class: 'edgeLabel' });
			} else {
				const x1 = edge.from.x + WIDTH, y1 = edge.from.y + HEIGHT / 2, x2 = edge.to.x, y2 = edge.to.y + HEIGHT / 2, middle = (x1 + x2) / 2;
				d = 'M' + x1 + ',' + y1 + ' C' + middle + ',' + y1 + ' ' + middle + ',' + y2 + ' ' + x2 + ',' + y2;
				label = svgElement('text', { x: middle, y: (y1 + y2) / 2 - 4, 'text-anchor': 'middle', class: 'edgeLabel' });
			}
			svg.append(svgElement('path', { d, class: 'edge' + (removed ? ' removed' : ''), 'marker-end': 'url(#arrow)' }));
			label.textContent = edge.label;
			svg.append(label);
		}
		for (const node of nodes) {
			const isChosen = node.kind === 'seed' && chosen.has(node.id) || node.kind === 'list' && node.id === state.view.show;
			const group = svgElement('g', { class: 'node ' + node.kind + (node.removed ? ' removed' : '') + (isChosen ? ' chosen' : ''), transform: 'translate(' + node.x + ',' + node.y + ')' });
			group.append(svgElement('rect', { width: WIDTH, height: HEIGHT, rx: node.kind === 'seed' ? HEIGHT / 2 : 2 }));
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

	/** Chooses the seed of id, or, chosen already, no longer; with no id, none. */
	function choose(id) {
		if (id === undefined) {
			chosen.clear();
		} else if (!chosen.delete(id)) {
			chosen.add(id);
		}
		render();
	}

	function setView(show, page, rows = state.view.rows, sort = state.view.sort, descending = state.view.descending) {
		vscode.postMessage({ command: 'view', show, page, rows, sort, descending });
	}

	function renderSeeds() {
		const list = document.getElementById('seedList');
		list.textContent = '';
		for (const id of chosen) {
			if (!state.seeds.some(seed => seed.id === id)) {
				chosen.delete(id);
			}
		}
		document.getElementById('seedsTitle').textContent = format(TEXT.seeds, state.seeds.length);
		for (const seed of state.seeds) {
			const item = document.createElement('li');
			if (chosen.has(seed.id)) {
				item.className = 'chosen';
			}
			const id = document.createElement('span');
			id.className = 'seedId';
			id.textContent = seed.id;
			id.addEventListener('click', () => choose(seed.id));
			const body = document.createElement('span');
			body.className = 'seedText';
			const who = [authorsText(seed.authors), seed.year ? '(' + seed.year + ')' : ''].filter(Boolean).join(' ');
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
		document.getElementById('forLabel').textContent = chosen.size ? format(TEXT.forChosen, chosenIds().join(', ')) : TEXT.forAll;
		renderChosenNote();
		document.getElementById('citedBy').disabled = busy;
		document.getElementById('cites').disabled = busy;
		document.getElementById('related').disabled = busy;
	}

	/** The ids of the seeds chosen, in the order of the seeds. */
	function chosenIds() {
		return state.seeds.map(seed => seed.id).filter(id => chosen.has(id));
	}

	/** Says which seeds are chosen, and how to follow all seeds again. */
	function renderChosenNote() {
		const note = document.getElementById('chosenNote');
		note.textContent = '';
		note.hidden = !chosen.size;
		if (!chosen.size) {
			return;
		}
		const [before, after] = format(TEXT.chosenNote, chosenIds().join(', '), '\u0000').split('\u0000');
		const all = document.createElement('button');
		all.className = 'link';
		all.textContent = TEXT.chooseAll;
		all.addEventListener('click', () => choose());
		note.append(before, all, after ?? '');
	}

	/** Marks the heading the pool is sorted by with its arrow. */
	function renderSortHeadings() {
		for (const th of document.querySelectorAll('#poolTable th.sortable')) {
			th.dataset.label ??= th.textContent;
			const sorted = th.dataset.sort === state.view.sort;
			th.textContent = th.dataset.label + (sorted ? (state.view.descending ? ' \u2193' : ' \u2191') : '');
		}
	}

	function renderPool() {
		renderSortHeadings();
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
			// A filled dot for an influential citation, a hollow one for the others; a seed the work cites and is cited by, one dot;
			// after them, a seed it is only related to
			const relations = (row.how || []).map(how => how.split(' '));
			const citations = relations.filter(relation => relation[0] !== 'related');
			const tied = sortLists([...new Set(citations.map(relation => relation[1]))]);
			const relatedTo = sortLists(relations.filter(relation => relation[0] === 'related' && !tied.includes(relation[1])).map(relation => relation[1]));
			const tieOf = seed => (row.ties || []).find(tie => tie.seed === seed);
			dots.textContent = tied.map(seed => tieOf(seed)?.influential ? '\\u25cf' : '\\u25cb').join('') + (tied.length && relatedTo.length ? ' ' : '') + relatedTo.map(() => '\\u2248').join('');
			const how = tied.flatMap(seed => citations.filter(relation => relation[1] === seed).sort().reverse().map(([relation]) => {
				const tie = tieOf(seed);
				const intents = tie ? intentsText(tie.intents) : '';
				return format(relation === 'cited' ? TEXT.citedBySeed : TEXT.cites, seed) + (intents ? ': ' + intents : '') + (tie?.influential ? ' (' + TEXT.influential + ')' : '');
			})).concat(relatedTo.map(seed => format(TEXT.relatedTo, seed)));
			dots.title = [...how, format(TEXT.inLists, sortLists(row.lists).join(', ')), ...(noRecord(row) ? [TEXT.noRecord] : [])].join('\\n');
			dots.addEventListener('click', () => toggleDetail(row.openalex));
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
			if (expanded.has(row.openalex)) {
				body.append(detailRow(row));
			}
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

	function intentsText(intents) {
		return (intents || []).map(intent => INTENTS[intent] || intent).join(', ');
	}

	/** Whether Semantic Scholar has no record of the work, as far as the map knows: asked for it, or no DOI to ask by. */
	function noRecord(row) {
		return row.known === false || !row.doi && !(row.ties || []).length;
	}

	function toggleDetail(work) {
		if (expanded.delete(work)) {
			renderPool();
			return;
		}
		expanded.add(work);
		if (!details.has(work)) {
			vscode.postMessage({ command: 'contexts', work });
		}
		renderPool();
	}

	/** The row under a work whose Links are open: for each seed, why the work cites it, whether influentially, and the sentences. */
	function detailRow(row) {
		const tr = document.createElement('tr');
		tr.className = 'detail';
		const cell = document.createElement('td');
		cell.colSpan = 6;
		tr.append(cell);
		const detail = details.get(row.openalex);
		if (!detail) {
			cell.className = 'muted';
			cell.textContent = TEXT.askingContexts;
			return tr;
		}
		const note = message => {
			const line = document.createElement('div');
			line.className = 'muted';
			line.textContent = message;
			cell.append(line);
		};
		if (detail.problem) {
			note(detail.problem);
		}
		if (detail.known === false) {
			note(TEXT.noRecord);
		}
		for (const tie of detail.ties || []) {
			const block = document.createElement('div');
			block.className = 'tie';
			const head = document.createElement('div');
			head.className = 'tieHead';
			const relation = document.createElement('span');
			relation.textContent = tie.relation === 'related' ? TEXT.relatedHead : tie.relation === 'cited' ? TEXT.citedByEdge : TEXT.citesEdge;
			const id = document.createElement('span');
			id.className = 'seedId';
			id.textContent = tie.seed;
			const seed = state.seeds.find(seed => seed.id === tie.seed);
			const label = document.createElement('span');
			label.className = 'muted';
			label.textContent = seed ? [authorsText(seed.authors), seed.year].filter(Boolean).join(' ') : '';
			head.append(relation, id, label);
			if (tie.intents) {
				const intents = document.createElement('span');
				intents.textContent = intentsText(tie.intents);
				head.append(intents);
			}
			if (tie.influential) {
				const mark = document.createElement('span');
				mark.className = 'influential';
				mark.textContent = '\\u25cf ' + TEXT.influential;
				head.append(mark);
			}
			block.append(head);
			const sentences = tie.contexts || [];
			if (tie.relation === 'related') {
				// A recommendation, not a citation: no sentences to show
			} else if (tie.intents === null) {
				if (tie.relation === 'cited' || detail.known !== false) {
					const line = document.createElement('div');
					line.className = 'context';
					line.textContent = tie.relation === 'cited' ? TEXT.noContextCited : TEXT.noContext;
					block.append(line);
				}
			} else if (!sentences.length) {
				const line = document.createElement('div');
				line.className = 'context';
				line.textContent = TEXT.noSentences;
				block.append(line);
			}
			for (const sentence of sentences) {
				const line = document.createElement('div');
				line.className = 'context';
				line.textContent = '\\u201c' + sentence + '\\u201d';
				block.append(line);
			}
			cell.append(block);
		}
		return tr;
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
	function showLayout() {
		document.getElementById('landscape').classList.toggle('chosen', !portrait);
		document.getElementById('portrait').classList.toggle('chosen', portrait);
	}
	for (const [id, value] of [['landscape', false], ['portrait', true]]) {
		document.getElementById(id).addEventListener('click', () => {
			if (portrait !== value) {
				portrait = value;
				vscode.postMessage({ command: 'layout', portrait });
				showLayout();
				renderMap();
			}
		});
	}
	showLayout();
	// A heading sorts the pool by it, the largest first; clicked again, the smallest first
	for (const th of document.querySelectorAll('#poolTable th.sortable')) {
		th.addEventListener('click', () => {
			const sort = th.dataset.sort;
			setView(state.view.show, 0, state.view.rows, sort, sort === state.view.sort ? !state.view.descending : true);
		});
	}
	for (const command of ['citedBy', 'cites']) {
		document.getElementById(command).addEventListener('click', () => vscode.postMessage({ command, seeds: chosenIds(), contexts: document.getElementById('askContexts').checked }));
	}
	document.getElementById('related').addEventListener('click', () => vscode.postMessage({ command: 'related', seeds: chosenIds() }));
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
			chosen.clear();
			vscode.postMessage({ command: 'new' });
		}
	});
	document.getElementById('discard').addEventListener('click', () => {
		showPane();
		chosen.clear();
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
			// How a work cites its seeds is asked again when its seeds changed since
			for (const row of state.rows) {
				const detail = details.get(row.openalex);
				if (detail && (detail.ties || []).length !== row.links) {
					details.delete(row.openalex);
					if (expanded.has(row.openalex)) {
						vscode.postMessage({ command: 'contexts', work: row.openalex });
					}
				}
			}
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
		} else if (message.command === 'contexts') {
			details.set(message.work, message);
			renderPool();
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
