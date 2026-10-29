/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The search of Ask Pollis, in a utility process of its own (see ../electron-browser/askPollisService.ts), on the engine
// of the duckdb> terminal (@duckdb/node-api), with the fts extension: PollisDocuments, which ask_index.jl of the Julia
// extension makes, is attached for each search and let go after, so that the next index can take its place, on Windows
// too. A question is routed to the collections whose nearest passage is nearest it (Pollis, the Julia Manual), unless
// it names them; each is searched by words (BM25) and by meaning (cosine distance), the two lists merged by
// reciprocal rank fusion; with two or more, the nearest gives most of the passages. The answer is written here too, by
// the chat model's server or a cloud model's API, its text sent as it comes: the renderer may not reach a server of
// this computer. The runs of Evaluate Answering Models are kept here too, in Comparisons.duckdb, attached the same way, so that
// two windows can each keep theirs, and the passages found for each question with a search stamp, which a run with the same stamp reuses.
// Evaluate Embedding Models embeds the passages here, into the cache of embeddings ask_index.jl takes them from, and
// searches the questions of a test set with each model's embeddings as Ask Pollis would; its runs are kept in Comparisons.duckdb too.

import { DuckDBConnection, DuckDBInstance } from '@duckdb/node-api';
import * as fs from 'fs';
import * as os from 'os';
import { Sequencer } from '../../../../base/common/async.js';
import { Emitter } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { join } from '../../../../base/common/path.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { Server as ChildProcessServer } from '../../../../base/parts/ipc/node/ipc.cp.js';
import { Server as UtilityProcessServer } from '../../../../base/parts/ipc/node/ipc.mp.js';
import { isUtilityProcess } from '../../../../base/parts/sandbox/node/electronTypes.js';
import { AskTopic, ASK_PASSAGES, IAskPollisChatEnd, IAskPollisMessage, ICompareRun, ICompareRunSummary, IAskPollisChatRequest, IAskPollisChatText, IAskPollisFound, IAskPollisIndex, IAskPollisIndexRequest, IAskPollisIndexStatus, IAskPollisPanel, IAskPollisPassage, IAskPollisSearchResult, IAskPollisTimings, IAskTopicCounts, IEmbeddingDone, IEmbeddingEvaluated, IEmbeddingEvaluation, IEmbeddingFound, IEmbeddingProgress, IEmbeddingRequest, IEmbeddingRun, IEmbeddingRunSummary } from '../common/askPollis.js';

const DATABASE = join(os.homedir(), '.pollis', 'documents', 'PollisDocuments.duckdb');
/** The embeddings made, by the model and the text it was given, as ask_index.jl keeps them. */
const EMBEDDINGS = join(os.homedir(), '.pollis', 'documents', 'embeddings.duckdb');
/** The passages embedded a request, as ask_index.jl does. */
const BATCH = 32;
/** The runs of Evaluate Answering Models, their questions, answers and scores. */
const COMPARISONS = join(os.homedir(), '.pollis', 'ask', 'Comparisons.duckdb');
/** The fts extension, which the Julia extension of Pollis unpacks here at install. */
const FTS = join(os.homedir(), '.pollis', 'duckdb', 'fts.duckdb_extension');

/** How many passages each search, by words and by meaning, keeps for the fusion. */
const EACH = 20;
/** The constant of reciprocal rank fusion: a passage scores 1/(K + r) for its rank r in each list. */
const K = 60;
/**
 * How much farther than the nearest collection another may be and still be searched, in cosine distance from the
 * question to the nearest passage of each. On 38 questions, of Pollis, of Julia and of both, the nearest passage was
 * always of the right collection, by 0.045 to 0.246 for Pollis and 0 to 0.161 for the Julia Manual; the average
 * embeddings of the collections were not, since Pollis' documents speak of Julia too. With 0.075, 7 of the 8 questions
 * of both are searched in both, and 1 of Pollis and 4 of Julia.
 */
const ROUTE_MARGIN = 0.075;
/** The part of the passages the nearest collection gives when more than one is searched: 5 of 8. */
const NEAREST_SHARE = 5 / 8;
/** How freely the chat model of this computer words its answer: low, since it is to say what the passages say. */
const TEMPERATURE = 0.3;
/** The longest answer of a cloud model, in tokens; it streams, so a long one cannot time out. */
const MAX_TOKENS = 16000;
/** The version of Anthropic's API that the requests are written for. */
const ANTHROPIC_VERSION = '2026-10-21';

/** The tokens of a chat, as Anthropic's Messages count them, and OpenAI's Chat Completions. */
interface IChatUsage {
	readonly input_tokens?: number;
	readonly output_tokens?: number;
	readonly prompt_tokens?: number;
	readonly completion_tokens?: number;
}

/** An event of a chat's stream: of OpenAI's Chat Completions (and Gemini's and llama-server's), or of Anthropic's Messages. */
interface IChatEvent {
	readonly type?: string;
	readonly choices?: readonly { readonly delta?: { readonly content?: string } }[];
	readonly delta?: { readonly type?: string; readonly text?: string; readonly stop_reason?: string };
	readonly error?: { readonly message?: string };
	/** Anthropic's tokens read, in message_start. */
	readonly message?: { readonly usage?: IChatUsage };
	/** Anthropic's tokens written, in message_delta; OpenAI's both, in the last event, when the request asks for them. */
	readonly usage?: IChatUsage | null;
	/** llama-server's own measure of the answer, in the last event, when the request asks for its usage. */
	readonly timings?: { readonly prompt_per_second?: number; readonly predicted_per_second?: number };
}

/** A message's content as the Messages API of Anthropic takes it: an image in base64, with its media type, in place of a data URL. */
function anthropicContent(content: IAskPollisMessage['content']) {
	return typeof content === 'string' ? content : content.map(part => {
		if (part.type === 'text') {
			return part;
		}
		const image = /^data:(?<mediaType>image\/[a-z]+);base64,(?<data>.*)$/s.exec(part.image_url.url)?.groups;
		return { type: 'image', source: { type: 'base64', media_type: image?.mediaType, data: image?.data } };
	});
}

/**
 * The request of a chat. A cloud model is told to think little, since the passages hold the answer, and is not given a
 * temperature, which the newer models refuse; Claude Sonnet may fall back to another model when it is overloaded.
 */
function chatFetch(request: IAskPollisChatRequest, signal: AbortSignal): [string, RequestInit] {
	if (request.provider === 'anthropic') {
		const [system, ...messages] = request.messages;
		const sonnet = request.model.startsWith('claude-sonnet-');
		return [`${request.url}/messages`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-api-key': request.key ?? '',
				'anthropic-version': ANTHROPIC_VERSION,
				...(sonnet ? { 'anthropic-beta': 'server-side-fallback-2026-07-01' } : {}),
			},
			body: JSON.stringify({
				model: request.model,
				max_tokens: MAX_TOKENS,
				stream: true,
				system: system.content,
				messages: messages.map(message => ({ role: message.role, content: anthropicContent(message.content) })),
				output_config: { effort: 'low' },
				...(sonnet ? { fallbacks: 'default' } : {}),
			}),
			signal,
		}];
	}
	// Gemini takes the same request, at its OpenAI-compatible API
	if (request.provider === 'openai' || request.provider === 'google') {
		return [`${request.url}/chat/completions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${request.key ?? ''}` },
			// OpenAI gives the tokens at the end only when asked; Gemini gives them as it pleases
			body: JSON.stringify({ model: request.model, messages: request.messages, stream: true, reasoning_effort: 'low', ...(request.provider === 'openai' ? { stream_options: { include_usage: true } } : {}) }),
			signal,
		}];
	}
	return [`${request.url}/chat/completions`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		// The usage asked for, llama-server ends the stream with its timings: how fast it read and how fast it wrote
		body: JSON.stringify({ model: request.model, messages: request.messages, stream: true, stream_options: { include_usage: true }, temperature: TEMPERATURE }),
		signal,
	}];
}

/** What a response that is not ok says: the message of its JSON error when it has one, else its text. */
function errorMessage(status: number, body: string): string {
	try {
		const message = (JSON.parse(body) as { error?: { message?: string } }).error?.message;
		if (message) {
			return `${status} ${message}`;
		}
	} catch {
		// not JSON
	}
	return `${status} ${body}`;
}

function sqlString(text: string): string {
	return `'${text.replace(/'/g, `''`)}'`;
}

/** How many passages each of `collections` gives, of `count`: all from one; else most from the first, the rest shared. */
function shares(count: number, collections: number): number[] {
	if (collections <= 1) {
		return [count];
	}
	const first = Math.ceil(count * NEAREST_SHARE);
	const rest = count - first;
	return [first, ...Array.from({ length: collections - 1 }, (_, i) => Math.floor(rest / (collections - 1)) + (i < rest % (collections - 1) ? 1 : 0))];
}

/**
 * The passages of the collection $collection, or those `where` selects, that best answer $question: by its words only,
 * or with its embedding $vector too, against the index's embeddings or those of the table `vectors` (id, embedding).
 */
function searchSql(dimensions: number, count: number, vectors?: string, where = 'd.collection = $collection'): string {
	const embedding = vectors ? 'v.embedding' : 'p.embedding';
	const words = `words AS (
		SELECT id, score, row_number() OVER (ORDER BY score DESC) AS r
		FROM (SELECT p.id, fts_main_passages.match_bm25(p.id, $question) AS score FROM passages p JOIN documents d ON d.id = p.document WHERE ${where})
		WHERE score IS NOT NULL ORDER BY r LIMIT ${EACH})`;
	const meaning = `meaning AS (
		SELECT p.id, row_number() OVER (ORDER BY array_cosine_distance(${embedding}, $vector::FLOAT[${dimensions}])) AS r
		FROM passages p JOIN documents d ON d.id = p.document${vectors ? ` JOIN ${vectors} v ON v.id = p.id` : ''}
		WHERE ${where} AND ${embedding} IS NOT NULL ORDER BY r LIMIT ${EACH})`;
	const fused = dimensions
		? `fused AS (SELECT id, sum(1.0 / (${K} + r)) AS score FROM (SELECT id, r FROM words UNION ALL SELECT id, r FROM meaning) GROUP BY id)`
		: `fused AS (SELECT id, score FROM words)`;
	return `WITH ${words}, ${dimensions ? `${meaning}, ` : ''}${fused}
		SELECT f.id, ${PASSAGE_COLUMNS}, f.score
		FROM fused f JOIN passages p ON p.id = f.id JOIN documents d ON d.id = p.document
		ORDER BY f.score DESC LIMIT ${count}`;
}

/**
 * The key in embeddings.duckdb of each passage and what it is given to the model $model as, with the passage prefix
 * $prefix, as ask_index.jl makes them: a wiki's headings start with its panel and its name, a PDF's do not have its title.
 */
const INPUTS_SQL = `SELECT id, sha256($model || chr(10) || input) AS key, input FROM (
	SELECT p.id, left(replace(replace($prefix, '{title}', CASE WHEN d.kind = 'wiki' THEN p.heading ELSE concat_ws(' ' || chr(8250) || ' ', d.title, nullif(p.heading, '')) END), '{text}', p.text), 4000) AS input
	FROM passages p JOIN documents d ON p.document = d.id)`;

/** A search of the index: `count` passages for `question`, from the collections nearest it, or those of `collections`. */
interface IPassageQuery {
	readonly question: string;
	/** Its embedding, as DuckDB reads a list; by words only without it. */
	readonly vector?: string;
	readonly dimensions: number;
	readonly count: number;
	readonly collections?: readonly string[];
	/** A table of the embeddings to search with, in place of the index's. */
	readonly vectors?: string;
	/** The panel asked in, whose passages are the first share. */
	readonly panel?: IAskPollisPanel;
}

/** The passages of `panel`: its wikis, titled after it, and the vignettes of its packages, titled `GLM.jl`. */
function panelSql(panel: IAskPollisPanel): string {
	const wikis = `(d.kind = 'wiki' AND d.title = ${sqlString(panel.title)})`;
	return panel.packages.length ? `(${wikis} OR (d.kind = 'vignette' AND d.title IN (${panel.packages.map(sqlString).join(', ')})))` : wikis;
}

/** The columns of a passage that the searches select, with its document's. */
const PASSAGE_COLUMNS = 'd.collection, d.kind, d.title, d.source AS file, d.menu, d.toolbox, p.page, p.heading, p.text, p.anchor';

type Row = Record<string, unknown>;

function passageOf(row: Row): IAskPollisPassage {
	return {
		id: Number(row.id),
		collection: String(row.collection),
		kind: String(row.kind),
		title: String(row.title),
		file: String(row.file),
		menu: String(row.menu ?? ''),
		toolbox: String(row.toolbox ?? ''),
		page: row.page === null ? null : Number(row.page),
		heading: String(row.heading ?? ''),
		text: String(row.text),
		anchor: row.anchor === null ? null : String(row.anchor),
		score: Number(row.score),
	};
}

/** A number of a row, or nothing for NULL. */
function optionalNumber(value: unknown): number | undefined {
	return value === null || value === undefined ? undefined : Number(value);
}

/** The shortest passage Make Questions asks about, in characters: a shorter one is mostly a heading or a line of a table. */
const SHORTEST_QUESTION_PASSAGE = 400;

/** The topic of a passage by its document `d`, as AskTopic: the Julia Manual, Pollis' own documents, and the rest (the wikis, the documents of the toolboxes). */
const TOPIC = `CASE WHEN d.kind = 'julia' THEN 'julia' WHEN d.kind = 'document' AND coalesce(d.toolbox, '') = '' THEN 'pollis' ELSE 'panels' END`;

/**
 * The tables of Comparisons.duckdb: a run, the passages found for each of its questions, the answers, the judges'
 * scores and why a judge did not rate an answer; the passages found for a question with a search stamp, those of
 * the latest stamp only; and a run of Evaluate Embedding Models, its questions and what each model found for them.
 */
const COMPARISONS_TABLES = [
	'CREATE TABLE IF NOT EXISTS Comparisons.runs(id VARCHAR PRIMARY KEY, started BIGINT, pollis VARCHAR, models VARCHAR, judges VARCHAR, repeats INTEGER, questions INTEGER)',
	'CREATE TABLE IF NOT EXISTS Comparisons.questions(run VARCHAR, question INTEGER, source VARCHAR, context VARCHAR, text VARCHAR, answer VARCHAR, passages VARCHAR, rank INTEGER)',
	'CREATE TABLE IF NOT EXISTS Comparisons.answers(run VARCHAR, id VARCHAR, question INTEGER, model VARCHAR, repeat INTEGER, answer VARCHAR, error VARCHAR, first_word DOUBLE, seconds DOUBLE, reading DOUBLE, writing DOUBLE, tokens_read INTEGER, tokens_written INTEGER)',
	'CREATE TABLE IF NOT EXISTS Comparisons.scores(run VARCHAR, answer VARCHAR, judge VARCHAR, relevance INTEGER, completeness INTEGER, clarity INTEGER, consistency INTEGER, helpfulness INTEGER, final DOUBLE, rationale VARCHAR)',
	'CREATE TABLE IF NOT EXISTS Comparisons.unrated(run VARCHAR, answer VARCHAR, judge VARCHAR, error VARCHAR)',
	'CREATE TABLE IF NOT EXISTS Comparisons.found(stamp VARCHAR, question VARCHAR, passages VARCHAR, PRIMARY KEY(stamp, question))',
	'CREATE TABLE IF NOT EXISTS Comparisons.embeddingRuns(id VARCHAR PRIMARY KEY, started BIGINT, pollis VARCHAR, models VARCHAR, questions INTEGER, passages INTEGER)',
	'CREATE TABLE IF NOT EXISTS Comparisons.embeddingQuestions(run VARCHAR, question INTEGER, source VARCHAR, context VARCHAR, text VARCHAR, answer VARCHAR)',
	'CREATE TABLE IF NOT EXISTS Comparisons.embeddingFound(run VARCHAR, question INTEGER, model VARCHAR, hybrid INTEGER, meaning INTEGER, query_ms DOUBLE, search_ms DOUBLE)',
];

/** The embedding of `input`, as DuckDB reads a list, from the llama.cpp server at `url` (its OpenAI /embeddings). */
async function embed(url: string, input: string): Promise<string> {
	const response = await fetch(`${url}/embeddings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: [input] }) });
	if (!response.ok) {
		throw new Error(`${response.status} ${await response.text()}`);
	}
	const answer = await response.json() as { data: { embedding: number[] }[] };
	return JSON.stringify(answer.data[0].embedding);
}

/** The embeddings of `inputs` from the server at `url`, its answer as it came, for DuckDB to read. */
async function embedAll(url: string, inputs: readonly string[]): Promise<string> {
	const response = await fetch(`${url}/embeddings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: inputs }) });
	if (!response.ok) {
		throw new Error(`${response.status} ${await response.text()}`);
	}
	return response.text();
}

class AskPollisIndex implements IAskPollisIndex {

	private readonly _onDidChat = new Emitter<IAskPollisChatText>();
	readonly onDidChat = this._onDidChat.event;

	private readonly _onDidEmbed = new Emitter<IEmbeddingProgress>();
	readonly onDidEmbed = this._onDidEmbed.event;

	private connection: Promise<DuckDBConnection> | undefined;
	/** One search at a time: each attaches the index and makes it the default database. */
	private readonly sequencer = new Sequencer();
	/** The answers being written, to stop them. */
	private readonly chats = new Map<string, AbortController>();
	/** Whether stopEmbedding was asked for since the embedding or evaluation began. */
	private embeddingStopped = false;

	private connect(): Promise<DuckDBConnection> {
		this.connection ??= (async () => {
			const instance = await DuckDBInstance.create(':memory:', { autoinstall_known_extensions: 'false', autoload_known_extensions: 'false' });
			const connection = await instance.connect();
			await connection.run(`LOAD ${sqlString(FTS)}`);
			return connection;
		})();
		return this.connection;
	}

	/** Runs `task` with the index attached and the default database, as its fts index needs; nothing when there is no index. */
	private withIndex<T>(task: (connection: DuckDBConnection) => Promise<T>): Promise<T | undefined> {
		return this.sequencer.queue(async () => {
			if (!fs.existsSync(DATABASE)) {
				return undefined;
			}
			const connection = await this.connect();
			try {
				await connection.run(`ATTACH ${sqlString(DATABASE)} AS PollisDocuments (READ_ONLY)`);
			} catch {
				return undefined;
			}
			try {
				await connection.run('USE PollisDocuments');
				return await task(connection);
			} finally {
				await connection.run('USE memory');
				await connection.run('DETACH PollisDocuments');
			}
		});
	}

	private async readStatus(connection: DuckDBConnection): Promise<IAskPollisIndexStatus | undefined> {
		try {
			const built = new Map((await connection.runAndReadAll('SELECT name, value FROM built')).getRowObjectsJson().map(row => [String(row.name), String(row.value ?? '')]));
			const collections = (await connection.runAndReadAll('SELECT name FROM collections ORDER BY passages DESC, name')).getRowObjectsJson().map(row => String(row.name));
			return {
				passages: Number(built.get('passages') ?? 0),
				embedded: Number(built.get('embedded') ?? 0),
				dimensions: Number(built.get('dimensions') || 0),
				embedder: built.get('embedder') ?? '',
				passagePrefix: built.get('passagePrefix') ?? '',
				builtAt: built.get('builtAt') ?? '',
				collections,
			};
		} catch {
			// An index of an older Pollis, made again at the next start
			return undefined;
		}
	}

	async status(): Promise<IAskPollisIndexStatus | undefined> {
		return this.withIndex(connection => this.readStatus(connection));
	}

	async search(request: IAskPollisIndexRequest): Promise<IAskPollisSearchResult> {
		const found = await this.withIndex(async connection => {
			const status = await this.readStatus(connection);
			if (!status) {
				return undefined;
			}
			let vector: string | undefined;
			let wordsOnly = request.wordsOnly;
			let error = request.error;
			if (request.embedding && status.dimensions) {
				try {
					vector = await embed(request.embedding.url, request.embedding.input);
				} catch (err) {
					wordsOnly = 'modelNotStarted';
					error = err instanceof Error ? err.message : String(err);
				}
			}
			const { passages, searched } = await this.findPassages(connection, status.collections, {
				question: request.question, vector, dimensions: vector ? status.dimensions : 0, count: Math.max(1, request.passages ?? ASK_PASSAGES), collections: request.collections, panel: request.panel,
			});
			const result: IAskPollisSearchResult = {
				passages,
				searched,
				collections: status.collections,
				...(vector ? {} : { wordsOnly: wordsOnly ?? (status.embedded ? 'otherModel' : 'notEmbedded') }),
				...(error && !vector ? { error } : {}),
			};
			return result;
		});
		return found ?? { passages: [], searched: [], collections: [], wordsOnly: 'notIndexed' };
	}

	/** The passages for `query`, from the collections of `all`: those named are searched, else the nearest and those almost as near. */
	private async findPassages(connection: DuckDBConnection, all: readonly string[], query: IPassageQuery): Promise<{ passages: IAskPollisPassage[]; searched: string[] }> {
		const { vector, dimensions, vectors } = query;
		let searched = query.collections?.filter(name => all.includes(name)) ?? [...all];
		if (vector) {
			const embedding = vectors ? 'v.embedding' : 'p.embedding';
			const distances = (await connection.runAndReadAll(`SELECT d.collection AS name, min(array_cosine_distance(${embedding}, $vector::FLOAT[${dimensions}])) AS distance FROM passages p JOIN documents d ON p.document = d.id${vectors ? ` JOIN ${vectors} v ON v.id = p.id` : ''} WHERE ${embedding} IS NOT NULL GROUP BY d.collection ORDER BY distance`, { vector })).getRowObjectsJson();
			const nearest = distances.filter(row => searched.includes(String(row.name)));
			const best = Number(nearest[0]?.distance ?? 0);
			searched = nearest.map(row => String(row.name)).filter((name, i) => !!query.collections || Number(nearest[i].distance) - best <= ROUTE_MARGIN);
		}
		const parameters = { question: query.question, ...(vector ? { vector } : {}) };
		const passages: IAskPollisPassage[] = [];
		// Asked in a panel: the nearest share from the panel's own passages, the rest from the collections without them
		let where = 'd.collection = $collection';
		if (query.panel) {
			const panel = panelSql(query.panel);
			const rows = (await connection.runAndReadAll(searchSql(vector ? dimensions : 0, shares(query.count, 2)[0], vectors, panel), parameters)).getRowObjectsJson();
			passages.push(...rows.map(passageOf));
			where = `${where} AND NOT ${panel}`;
		}
		const counts = shares(query.count - passages.length, searched.length);
		for (let i = 0; i < searched.length; i++) {
			const rows = (await connection.runAndReadAll(searchSql(vector ? dimensions : 0, counts[i], vectors, where), { ...parameters, collection: searched[i] })).getRowObjectsJson();
			passages.push(...rows.map(passageOf));
		}
		return { passages, searched };
	}

	/** Runs `task` with the index and embeddings.duckdb attached, the cache made the first time. */
	private withCache<T>(task: (connection: DuckDBConnection) => Promise<T>): Promise<T | undefined> {
		return this.withIndex(async connection => {
			await connection.run(`ATTACH ${sqlString(EMBEDDINGS)} AS cache`);
			try {
				await connection.run('CREATE TABLE IF NOT EXISTS cache.embeddings(key VARCHAR PRIMARY KEY, embedding FLOAT[])');
				return await task(connection);
			} finally {
				await connection.run('DETACH cache');
			}
		});
	}

	async embedPassages(request: IEmbeddingRequest): Promise<IEmbeddingDone> {
		this.embeddingStopped = false;
		const parameters = { model: request.model, prefix: request.passagePrefix };
		let todo: { key: string; input: string }[];
		try {
			const rows = await this.withCache(async connection => (await connection.runAndReadAll(`SELECT key, any_value(input) AS input FROM (${INPUTS_SQL}) WHERE key NOT IN (SELECT key FROM cache.embeddings) GROUP BY key ORDER BY min(id)`, parameters)).getRowObjectsJson());
			if (!rows) {
				return { embedded: 0, seconds: 0, error: 'notIndexed' };
			}
			todo = rows.map(row => ({ key: String(row.key), input: String(row.input) }));
		} catch (err) {
			return { embedded: 0, seconds: 0, error: err instanceof Error ? err.message : String(err) };
		}
		const started = Date.now();
		let embedded = 0;
		let error: string | undefined;
		// Each batch kept as it comes, one request at a time: a batch that fails is asked again a passage at a time
		const keep = async (batch: readonly { key: string; input: string }[]) => {
			const answer = await embedAll(request.url, batch.map(item => item.input));
			await this.withCache(connection => connection.run(`INSERT OR REPLACE INTO cache.embeddings
				SELECT from_json($keys, '["VARCHAR"]')[e."index" + 1], e.embedding
				FROM (SELECT unnest(from_json($answer, '{"data": [{"index": "INTEGER", "embedding": "FLOAT[]"}]}').data, recursive := true)) e`, { keys: JSON.stringify(batch.map(item => item.key)), answer }));
			embedded += batch.length;
		};
		for (let from = 0; from < todo.length && !this.embeddingStopped; from += BATCH) {
			const batch = todo.slice(from, from + BATCH);
			try {
				await keep(batch);
			} catch {
				for (const item of batch) {
					await keep([item]).catch(err => error ??= err instanceof Error ? err.message : String(err));
				}
			}
			this._onDidEmbed.fire({ model: request.model, phase: 'embed', done: Math.min(from + BATCH, todo.length), total: todo.length });
		}
		return { embedded, seconds: (Date.now() - started) / 1000, ...(error ? { error } : {}) };
	}

	async evaluateEmbedding(request: IEmbeddingEvaluation): Promise<IEmbeddingEvaluated> {
		this.embeddingStopped = false;
		const failed = (error: string): IEmbeddingEvaluated => ({ dimensions: 0, passages: 0, found: [], error });
		try {
			// The model's embeddings of the passages, from the cache, in a table of their own for the searches
			const made = await this.withCache(async connection => {
				const status = await this.readStatus(connection);
				const parameters = { model: request.model, prefix: request.passagePrefix };
				const dimensions = Number((await connection.runAndReadAll(`SELECT max(len(c.embedding)) AS dimensions FROM (${INPUTS_SQL}) i JOIN cache.embeddings c ON c.key = i.key`, parameters)).getRowObjectsJson()[0]?.dimensions ?? 0);
				if (dimensions) {
					await connection.run(`CREATE OR REPLACE TABLE memory.candidate AS SELECT i.id, c.embedding::FLOAT[${dimensions}] AS embedding FROM (${INPUTS_SQL}) i JOIN cache.embeddings c ON c.key = i.key WHERE len(c.embedding) = ${dimensions}`, parameters);
				}
				return { dimensions, passages: status?.passages ?? 0, collections: status?.collections ?? [] };
			});
			if (!made) {
				return failed('notIndexed');
			}
			if (!made.dimensions) {
				return failed('notEmbedded');
			}
			const { dimensions, passages, collections } = made;
			const found: IEmbeddingFound[] = [];
			try {
				for (const [i, item] of request.questions.entries()) {
					if (this.embeddingStopped) {
						break;
					}
					const embedding = Date.now();
					const vector = await embed(request.url, request.queryPrefix.replace('{text}', item.question));
					const queryMs = Date.now() - embedding;
					const result = await this.withIndex(async connection => {
						const search = Date.now();
						const given = await this.findPassages(connection, collections, { question: item.question, vector, dimensions, count: ASK_PASSAGES, vectors: 'memory.candidate' });
						const searchMs = Date.now() - search;
						// The place of the question's passage among all passages by meaning: how many are nearer the question, and 1
						const row = (await connection.runAndReadAll(`WITH target AS (
							SELECT min(array_cosine_distance(v.embedding, $vector::FLOAT[${dimensions}])) AS distance FROM memory.candidate v JOIN passages p ON p.id = v.id WHERE p.text = $context)
							SELECT CASE WHEN t.distance IS NULL THEN NULL ELSE 1 + (SELECT count(*) FROM memory.candidate v WHERE array_cosine_distance(v.embedding, $vector::FLOAT[${dimensions}]) < t.distance) END AS meaning FROM target t`, { vector, context: item.context })).getRowObjectsJson()[0];
						const meaning = optionalNumber(row?.meaning);
						const hybrid = meaning === undefined ? undefined : given.passages.findIndex(passage => passage.text === item.context) + 1;
						return { hybrid, meaning, queryMs, searchMs };
					});
					if (!result) {
						return failed('notIndexed');
					}
					found.push(result);
					this._onDidEmbed.fire({ model: request.model, phase: 'search', done: i + 1, total: request.questions.length });
				}
			} finally {
				await this.withIndex(connection => connection.run('DROP TABLE IF EXISTS memory.candidate'));
			}
			return { dimensions, passages, found };
		} catch (err) {
			return failed(err instanceof Error ? err.message : String(err));
		}
	}

	async stopEmbedding(): Promise<void> {
		this.embeddingStopped = true;
	}

	async describeDatabase(path: string): Promise<string> {
		return this.sequencer.queue(async () => {
			const connection = await this.connect();
			await connection.run(`ATTACH ${sqlString(path)} AS attached (READ_ONLY)`);
			try {
				// The catalog only: a view is listed with its columns, never run, since it may read files of this computer
				const rows = (await connection.runAndReadAll(`SELECT c.schema_name AS schema, c.table_name AS name, t.estimated_size AS size, string_agg(c.column_name || ' ' || c.data_type, ', ' ORDER BY c.column_index) AS columns
					FROM duckdb_columns() c LEFT JOIN duckdb_tables() t ON t.database_name = c.database_name AND t.schema_name = c.schema_name AND t.table_name = c.table_name
					WHERE c.database_name = 'attached' AND NOT c.internal GROUP BY ALL ORDER BY t.table_name IS NULL, schema, name`)).getRowObjectsJson();
				return rows.map(row => `${row.schema}.${row.name} (${row.size === null ? 'view' : `table, about ${row.size} rows`}): ${row.columns}`).join('\n');
			} finally {
				await connection.run('DETACH attached');
			}
		});
	}

	async chat(request: IAskPollisChatRequest): Promise<IAskPollisChatEnd> {
		const controller = new AbortController();
		this.chats.set(request.id, controller);
		let text = '';
		let refused = false;
		const sent = Date.now();
		let firstWord: number | undefined;
		let reading: number | undefined;
		let writing: number | undefined;
		let tokensRead: number | undefined;
		let tokensWritten: number | undefined;
		const timings = (): IAskPollisTimings => ({ firstWord, seconds: (Date.now() - sent) / 1000, reading, writing, tokensRead, tokensWritten });
		try {
			const response = await fetch(...chatFetch(request, controller.signal));
			if (!response.ok || !response.body) {
				return { error: errorMessage(response.status, await response.text()) };
			}
			// Server-sent events: a line `data: {...}` for each piece of the answer, and with OpenAI's API `data: [DONE]` at its end
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let pending = '';
			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					break;
				}
				pending += decoder.decode(value, { stream: true });
				const lines = pending.split('\n');
				pending = lines.pop() ?? '';
				let added = false;
				for (const line of lines) {
					const data = line.startsWith('data:') ? line.slice(5).trim() : '';
					if (!data || data === '[DONE]') {
						continue;
					}
					const event = JSON.parse(data) as IChatEvent;
					if (event.error) {
						return { error: event.error.message ?? data };
					}
					// Anthropic's Messages API: the text in content_block_delta, why it stopped in message_delta
					const content = request.provider === 'anthropic'
						? (event.type === 'content_block_delta' && event.delta?.type === 'text_delta' ? event.delta.text : undefined)
						: event.choices?.[0]?.delta?.content;
					if (event.type === 'message_delta' && event.delta?.stop_reason === 'refusal') {
						refused = true;
					}
					const usage = event.message?.usage ?? event.usage;
					if (usage) {
						tokensRead = usage.input_tokens ?? usage.prompt_tokens ?? tokensRead;
						tokensWritten = usage.output_tokens ?? usage.completion_tokens ?? tokensWritten;
					}
					if (event.timings) {
						reading = event.timings.prompt_per_second;
						writing = event.timings.predicted_per_second;
					}
					if (content) {
						firstWord ??= Date.now() - sent;
						text += content;
						added = true;
					}
				}
				if (added) {
					this._onDidChat.fire({ id: request.id, text });
				}
			}
			return refused ? { refused, timings: timings() } : { timings: timings() };
		} catch (err) {
			return controller.signal.aborted ? {} : { error: err instanceof Error ? err.message : String(err) };
		} finally {
			this.chats.delete(request.id);
		}
	}

	async stop(id: string): Promise<void> {
		this.chats.get(id)?.abort();
	}

	async spread(counts: IAskTopicCounts): Promise<readonly IAskPollisPassage[]> {
		// Within a topic each kind of document in turn (the PDFs, the wikis, the Julia Manual), and within a kind each
		// document in turn, a passage of each chosen by its hash, so that the same index gives the same passages
		const count = (topic: AskTopic) => Math.max(0, Math.floor(counts[topic] || 0));
		const rows = await this.withIndex(async connection => (await connection.runAndReadAll(`
			WITH long AS (
				SELECT p.id, p.document, row_number() OVER (PARTITION BY p.document ORDER BY hash(p.id)) AS k
				FROM passages p WHERE length(p.text) >= ${SHORTEST_QUESTION_PASSAGE}),
			turns AS (
				SELECT l.id, d.kind, ${TOPIC} AS topic, row_number() OVER (PARTITION BY d.kind ORDER BY l.k, hash(l.document)) AS turn
				FROM long l JOIN documents d ON d.id = l.document),
			chosen AS (
				SELECT * FROM turns
				QUALIFY row_number() OVER (PARTITION BY topic ORDER BY turn, kind) <= CASE topic WHEN 'pollis' THEN ${count('pollis')} WHEN 'julia' THEN ${count('julia')} ELSE ${count('panels')} END)
			SELECT p.id, ${PASSAGE_COLUMNS}, 0 AS score
			FROM chosen t JOIN passages p ON p.id = t.id JOIN documents d ON d.id = p.document
			ORDER BY t.turn, t.kind`)).getRowObjectsJson());
		return (rows ?? []).map(passageOf);
	}

	async topics(texts: readonly string[]): Promise<readonly (AskTopic | undefined)[] | undefined> {
		if (!texts.length) {
			return [];
		}
		const found = await this.withIndex(async connection => new Map((await connection.runAndReadAll(
			`SELECT p.text, any_value(${TOPIC}) AS topic FROM passages p JOIN documents d ON d.id = p.document WHERE p.text IN (${texts.map(sqlString).join(', ')}) GROUP BY p.text`))
			.getRowObjectsJson().map(row => [String(row.text), String(row.topic) as AskTopic])));
		return found && texts.map(text => found.get(text));
	}

	/** Runs `task` with Comparisons.duckdb attached, its tables made the first time. */
	private withComparisons<T>(task: (connection: DuckDBConnection) => Promise<T>): Promise<T> {
		return this.sequencer.queue(async () => {
			fs.mkdirSync(join(os.homedir(), '.pollis', 'ask'), { recursive: true });
			const connection = await this.connect();
			await connection.run(`ATTACH ${sqlString(COMPARISONS)} AS Comparisons`);
			try {
				for (const table of COMPARISONS_TABLES) {
					await connection.run(table);
				}
				return await task(connection);
			} finally {
				await connection.run('DETACH Comparisons');
			}
		});
	}

	/** Takes away the run `run` from each table. */
	private async removeRun(connection: DuckDBConnection, run: string): Promise<void> {
		for (const table of ['runs', 'questions', 'answers', 'scores', 'unrated']) {
			await connection.run(`DELETE FROM Comparisons.${table} WHERE ${table === 'runs' ? 'id' : 'run'} = $run`, { run });
		}
	}

	async saveRun(run: ICompareRun): Promise<void> {
		await this.withComparisons(async connection => {
			const { summary } = run;
			await connection.run('BEGIN TRANSACTION');
			try {
				await this.removeRun(connection, summary.id);
				await connection.run('INSERT INTO Comparisons.runs VALUES ($id, $started, $pollis, $models, $judges, $repeats, $questions)', {
					id: summary.id, started: summary.started, pollis: summary.pollis, models: JSON.stringify(summary.models), judges: JSON.stringify(summary.judges), repeats: summary.repeats, questions: summary.questions,
				});
				for (const question of run.questions) {
					await connection.run('INSERT INTO Comparisons.questions VALUES ($run, $question, $source, $context, $text, $answer, $passages, $rank::INTEGER)', {
						run: summary.id, question: question.index, source: question.item.source, context: question.item.context, text: question.item.question, answer: question.item.answer, passages: JSON.stringify(question.passages), rank: question.rank ?? null,
					});
				}
				for (const answer of run.answers) {
					const timings = answer.timings;
					await connection.run('INSERT INTO Comparisons.answers VALUES ($run, $id, $question, $model, $repeat, $answer, $error::VARCHAR, $firstWord::DOUBLE, $seconds::DOUBLE, $reading::DOUBLE, $writing::DOUBLE, $tokensRead::INTEGER, $tokensWritten::INTEGER)', {
						run: summary.id, id: answer.id, question: answer.question, model: answer.model, repeat: answer.repeat, answer: answer.answer, error: answer.error ?? null,
						firstWord: timings?.firstWord ?? null, seconds: timings?.seconds ?? null, reading: timings?.reading ?? null, writing: timings?.writing ?? null, tokensRead: timings?.tokensRead ?? null, tokensWritten: timings?.tokensWritten ?? null,
					});
				}
				for (const score of run.scores) {
					await connection.run('INSERT INTO Comparisons.scores VALUES ($run, $answer, $judge, $relevance, $completeness, $clarity, $consistency, $helpfulness, $final, $rationale)', { run: summary.id, ...score });
				}
				for (const unrated of run.unrated) {
					await connection.run('INSERT INTO Comparisons.unrated VALUES ($run, $answer, $judge, $error)', { run: summary.id, ...unrated });
				}
				await connection.run('COMMIT');
			} catch (err) {
				await connection.run('ROLLBACK');
				throw err;
			}
		});
	}

	private summaryOf(row: Row): ICompareRunSummary {
		return {
			id: String(row.id),
			started: Number(row.started),
			pollis: String(row.pollis ?? ''),
			models: JSON.parse(String(row.models ?? '[]')),
			judges: JSON.parse(String(row.judges ?? '[]')),
			repeats: Number(row.repeats),
			questions: Number(row.questions),
		};
	}

	async runs(): Promise<readonly ICompareRunSummary[]> {
		return this.withComparisons(async connection =>
			(await connection.runAndReadAll('SELECT * FROM Comparisons.runs ORDER BY started DESC')).getRowObjectsJson().map(row => this.summaryOf(row)));
	}

	async loadRun(id: string): Promise<ICompareRun | undefined> {
		return this.withComparisons(async connection => {
			const read = async (sql: string) => (await connection.runAndReadAll(sql, { run: id })).getRowObjectsJson();
			const [run] = await read('SELECT * FROM Comparisons.runs WHERE id = $run');
			if (!run) {
				return undefined;
			}
			const questions = await read('SELECT * FROM Comparisons.questions WHERE run = $run ORDER BY question');
			const answers = await read('SELECT * FROM Comparisons.answers WHERE run = $run ORDER BY question, model, repeat');
			const scores = await read('SELECT * FROM Comparisons.scores WHERE run = $run');
			const unrated = await read('SELECT * FROM Comparisons.unrated WHERE run = $run');
			return {
				summary: this.summaryOf(run),
				questions: questions.map(row => ({
					index: Number(row.question),
					item: { source: String(row.source ?? ''), context: String(row.context ?? ''), question: String(row.text ?? ''), answer: String(row.answer ?? '') },
					passages: JSON.parse(String(row.passages ?? '[]')),
					rank: optionalNumber(row.rank),
				})),
				answers: answers.map(row => ({
					id: String(row.id),
					question: Number(row.question),
					model: String(row.model),
					repeat: Number(row.repeat),
					answer: String(row.answer ?? ''),
					error: row.error === null ? undefined : String(row.error),
					timings: row.seconds === null ? undefined : {
						firstWord: optionalNumber(row.first_word),
						seconds: Number(row.seconds),
						reading: optionalNumber(row.reading),
						writing: optionalNumber(row.writing),
						tokensRead: optionalNumber(row.tokens_read),
						tokensWritten: optionalNumber(row.tokens_written),
					},
				})),
				scores: scores.map(row => ({
					answer: String(row.answer),
					judge: String(row.judge),
					relevance: Number(row.relevance),
					completeness: Number(row.completeness),
					clarity: Number(row.clarity),
					consistency: Number(row.consistency),
					helpfulness: Number(row.helpfulness),
					final: Number(row.final),
					rationale: String(row.rationale ?? ''),
				})),
				unrated: unrated.map(row => ({ answer: String(row.answer), judge: String(row.judge), error: String(row.error ?? '') })),
			};
		});
	}

	async deleteRun(id: string): Promise<void> {
		await this.withComparisons(connection => this.removeRun(connection, id));
	}

	/** Takes away the run `run` of Evaluate Embedding Models from its tables. */
	private async removeEmbeddingRun(connection: DuckDBConnection, run: string): Promise<void> {
		for (const table of ['embeddingRuns', 'embeddingQuestions', 'embeddingFound']) {
			await connection.run(`DELETE FROM Comparisons.${table} WHERE ${table === 'embeddingRuns' ? 'id' : 'run'} = $run`, { run });
		}
	}

	async saveEmbeddingRun(run: IEmbeddingRun): Promise<void> {
		await this.withComparisons(async connection => {
			const { summary } = run;
			await connection.run('BEGIN TRANSACTION');
			try {
				await this.removeEmbeddingRun(connection, summary.id);
				await connection.run('INSERT INTO Comparisons.embeddingRuns VALUES ($id, $started, $pollis, $models, $questions, $passages)', {
					id: summary.id, started: summary.started, pollis: summary.pollis, models: JSON.stringify(summary.models), questions: summary.questions, passages: summary.passages,
				});
				for (const [question, item] of run.questions.entries()) {
					await connection.run('INSERT INTO Comparisons.embeddingQuestions VALUES ($run, $question, $source, $context, $text, $answer)', {
						run: summary.id, question, source: item.source, context: item.context, text: item.question, answer: item.answer,
					});
				}
				for (const found of run.found) {
					await connection.run('INSERT INTO Comparisons.embeddingFound VALUES ($run, $question, $model, $hybrid::INTEGER, $meaning::INTEGER, $queryMs, $searchMs)', {
						run: summary.id, question: found.question, model: found.model, hybrid: found.hybrid ?? null, meaning: found.meaning ?? null, queryMs: found.queryMs, searchMs: found.searchMs,
					});
				}
				await connection.run('COMMIT');
			} catch (err) {
				await connection.run('ROLLBACK');
				throw err;
			}
		});
	}

	private embeddingSummaryOf(row: Row): IEmbeddingRunSummary {
		return {
			id: String(row.id),
			started: Number(row.started),
			pollis: String(row.pollis ?? ''),
			models: JSON.parse(String(row.models ?? '[]')),
			questions: Number(row.questions),
			passages: Number(row.passages),
		};
	}

	async embeddingRuns(): Promise<readonly IEmbeddingRunSummary[]> {
		return this.withComparisons(async connection =>
			(await connection.runAndReadAll('SELECT * FROM Comparisons.embeddingRuns ORDER BY started DESC')).getRowObjectsJson().map(row => this.embeddingSummaryOf(row)));
	}

	async loadEmbeddingRun(id: string): Promise<IEmbeddingRun | undefined> {
		return this.withComparisons(async connection => {
			const row = (await connection.runAndReadAll('SELECT * FROM Comparisons.embeddingRuns WHERE id = $id', { id })).getRowObjectsJson()[0];
			if (!row) {
				return undefined;
			}
			const questions = (await connection.runAndReadAll('SELECT * FROM Comparisons.embeddingQuestions WHERE run = $id ORDER BY question', { id })).getRowObjectsJson()
				.map(question => ({ source: String(question.source), context: String(question.context), question: String(question.text), answer: String(question.answer) }));
			const found = (await connection.runAndReadAll('SELECT * FROM Comparisons.embeddingFound WHERE run = $id ORDER BY question', { id })).getRowObjectsJson()
				.map(found => ({ question: Number(found.question), model: String(found.model), hybrid: optionalNumber(found.hybrid), meaning: optionalNumber(found.meaning), queryMs: Number(found.query_ms), searchMs: Number(found.search_ms) }));
			return { summary: this.embeddingSummaryOf(row), questions, found };
		});
	}

	async deleteEmbeddingRun(id: string): Promise<void> {
		await this.withComparisons(connection => this.removeEmbeddingRun(connection, id));
	}

	async foundBefore(key: string, questions: readonly string[]): Promise<readonly (readonly IAskPollisPassage[] | undefined)[]> {
		return this.withComparisons(async connection => {
			const rows = (await connection.runAndReadAll('SELECT question, passages FROM Comparisons.found WHERE stamp = $key', { key })).getRowObjectsJson();
			const found = new Map(rows.map(row => [String(row.question), String(row.passages ?? '[]')]));
			return questions.map(question => {
				const passages = found.get(question);
				return passages === undefined ? undefined : JSON.parse(passages);
			});
		});
	}

	async keepFound(key: string, found: readonly IAskPollisFound[]): Promise<void> {
		await this.withComparisons(async connection => {
			await connection.run('BEGIN TRANSACTION');
			try {
				await connection.run('DELETE FROM Comparisons.found WHERE stamp <> $key', { key });
				for (const { question, passages } of found) {
					await connection.run('INSERT OR REPLACE INTO Comparisons.found VALUES ($key, $question, $passages)', { key, question, passages: JSON.stringify(passages) });
				}
				await connection.run('COMMIT');
			} catch (err) {
				await connection.run('ROLLBACK');
				throw err;
			}
		});
	}
}

const server = isUtilityProcess(process) ? new UtilityProcessServer() : new ChildProcessServer('askPollis');
server.registerChannel('askPollis', ProxyChannel.fromService(new AskPollisIndex(), new DisposableStore()));
