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
// Benchmark Embedding and Reranking Models runs the retrieval benchmarks of PollisBenchmarks.duckdb here, on their own
// documents: their runs are kept with those of the two Evaluate pages, marked with their benchmark.
// So are the runs of Benchmark Answering Models, once they have ended: PollisBenchmarks.jl writes a run to files while it goes, and they are moved in here.

import { DuckDBConnection, DuckDBInstance } from '@duckdb/node-api';
import * as fs from 'fs';
import * as os from 'os';
import { Sequencer } from '../../../../base/common/async.js';
import { Emitter } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { dirname, join } from '../../../../base/common/path.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { Server as ChildProcessServer } from '../../../../base/parts/ipc/node/ipc.cp.js';
import { Server as UtilityProcessServer } from '../../../../base/parts/ipc/node/ipc.mp.js';
import { isUtilityProcess } from '../../../../base/parts/sandbox/node/electronTypes.js';
import { AskPollisSource, AskTopic, ASK_PASSAGES, ASK_SOURCE_COLLECTION, askEvalContext, IAskPollisChatEnd, IAskPollisMessage, ICompareRun, ICompareRunSummary, IAskPollisChatRequest, IAskPollisChatText, IAskPollisEvalItem, IAskPollisFound, IAskPollisIndex, IAskPollisIndexedDocument, IAskPollisIndexRequest, IAskPollisIndexStatus, IAskPollisPanel, IAskPollisPanelShare, IAskPollisPassage, IAskPassageMatch, IAskPollisReranked, IAskPollisSearchResult, IAskPollisTimings, IAskTopicCounts, IBenchmarkAnswer, IBenchmarkRun, IEmbeddingDone, IEmbeddingEvaluated, IEmbeddingEvaluation, IEmbeddingFound, IEmbeddingProgress, IEmbeddingRequest, IEmbeddingRun, IEmbeddingRunSummary, IRerankRun, IRerankRunSummary, IRetrievalEmbeddingRequest, IRetrievalEvaluation, IRetrievalQuery, IRetrievalRerankDone, IRetrievalRerankRequest, IRetrievalReranked, IRetrievalScore, RETRIEVAL_BENCHMARKS, RETRIEVAL_CANDIDATES, RETRIEVAL_CUT } from '../common/askPollis.js';

const DATABASE = join(os.homedir(), '.pollis', 'documents', 'PollisDocuments.duckdb');
/** The embeddings made, by the model and the text it was given, as ask_index.jl keeps them. */
const EMBEDDINGS = join(os.homedir(), '.pollis', 'documents', 'embeddings.duckdb');
/** The passages embedded a request, as ask_index.jl does. */
const BATCH = 32;
/** The runs of the Evaluate pages and of the two Benchmarks pages. */
const COMPARISONS = join(os.homedir(), '.pollis', 'ask', 'Comparisons.duckdb');
/**
 * The copy of COMPARISONS that the Databases view and the duckdb> terminal read, as the database Comparisons of the
 * activity of Pollis: a reader of the copy never holds the file Pollis writes, which DuckDB lets no other process open
 * while it is written.
 */
const COMPARISONS_COPY = join(os.homedir(), '.pollis', 'databases', 'Comparisons.duckdb');
/** The fts extension, which the Julia extension of Pollis unpacks here at install. */
const FTS = join(os.homedir(), '.pollis', 'duckdb', 'fts.duckdb_extension');
/** The published benchmarks, which PollisBenchmarks.jl makes when the Julia REPL starts: of retrieval, a table of the queries and the documents of each. */
const BENCHMARKS = join(os.homedir(), '.pollis', 'databases', 'PollisBenchmarks.duckdb');
/** How much of a text an embedding model or a reranker is given, in characters: about 1,000 tokens, within the context of its server. */
const EMBEDDED_CHARACTERS = 4000;

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
 * $prefix, as ask_index.jl makes them: a wiki's headings start with its panel and its name, a Markdown file's with its
 * title; a PDF's do not have its title. The Package APIs are left out: Evaluate Embedding Models would embed some
 * twenty thousand docstrings for each model, and its test sets have no question on them.
 */
const INPUTS_SQL = `SELECT id, sha256($model || chr(10) || input) AS key, input FROM (
	SELECT p.id, left(replace(replace($prefix, '{title}', CASE WHEN d.kind IN ('wiki', 'markdown') THEN p.heading ELSE concat_ws(' ' || chr(8250) || ' ', d.title, nullif(p.heading, '')) END), '{text}', p.text), ${EMBEDDED_CHARACTERS}) AS input
	FROM passages p JOIN documents d ON p.document = d.id WHERE d.kind <> 'api')`;

/** The table of the retrieval benchmark `benchmark` in PollisBenchmarks.duckdb, attached as `benchmarks`; nothing for one not known. */
function retrievalTable(benchmark: string): string | undefined {
	return RETRIEVAL_BENCHMARKS.some(known => known.id === benchmark) ? `benchmarks.${benchmark}` : undefined;
}

/**
 * The key in embeddings.duckdb of each document of the retrieval benchmark's `table`, and what it is given to the model
 * $model as, with the passage prefix $prefix: its title and its text, cut as a passage of the index is.
 */
function retrievalInputsSql(table: string): string {
	return `SELECT id, sha256($model || chr(10) || input) AS key, input FROM (
		SELECT id, left(replace(replace($prefix, '{title}', title), '{text}', text), ${EMBEDDED_CHARACTERS}) AS input FROM ${table} WHERE split = 'document')`;
}

/** The table, in the memory database, of the documents of a retrieval benchmark that BM25 searches, with its fts index. */
const RETRIEVAL_DOCUMENTS = 'retrieval_documents';

/**
 * How well `found`, the ids of the documents found in their order, ranks those of `relevant`, each of gain 1, as BEIR
 * scores them with pytrec_eval: nDCG@10, the discounted gain of the first RETRIEVAL_CUT over the most they can have, and
 * Recall@10, the share of the relevant documents among them.
 */
function retrievalScore(found: readonly string[], relevant: readonly string[]): IRetrievalScore {
	const wanted = new Set(relevant);
	let gain = 0;
	let hits = 0;
	for (const [index, id] of found.slice(0, RETRIEVAL_CUT).entries()) {
		if (wanted.has(id)) {
			gain += 1 / Math.log2(index + 2);
			hits++;
		}
	}
	let ideal = 0;
	for (let index = 0; index < Math.min(wanted.size, RETRIEVAL_CUT); index++) {
		ideal += 1 / Math.log2(index + 2);
	}
	return { ndcg: ideal ? gain / ideal : 0, recall: wanted.size ? hits / wanted.size : 0 };
}

/** The share of the documents of `relevant` among `found`, all of them. */
function shareFound(found: readonly string[], relevant: readonly string[]): number {
	const all = new Set(found);
	return relevant.length ? relevant.filter(id => all.has(id)).length / relevant.length : 0;
}

/** A search of the index: `count` passages for `question`, from the collections nearest it, or those of `collections`. */
interface IPassageQuery {
	readonly question: string;
	/** Its embedding, as DuckDB reads a list; by words only without it. */
	readonly vector?: string;
	readonly dimensions: number;
	readonly count: number;
	readonly collections?: readonly string[];
	/** The only sources searched of their collections, the other collections whole. */
	readonly sources?: readonly AskPollisSource[];
	/** A table of the embeddings to search with, in place of the index's. */
	readonly vectors?: string;
	/** The panel asked in, whose passages are the first share. */
	readonly panel?: IAskPollisPanel;
	/** The share of the passages from the panel's own: NEAREST_SHARE when not given. */
	readonly panelShare?: number | IAskPollisPanelShare;
}

/** The collection of the Package APIs, as pollisPackageApis.ts names it, which only a choice of Search In searches. */
const PACKAGE_APIS = 'Package APIs';

/** The pages of Base and the standard library in Julia's documentation, by the address of a passage `p`. */
const JULIA_LIBRARY_SQL = `regexp_matches(coalesce(p.anchor, ''), '^(base|stdlib)/')`;

/** The passages of each source, by their document `d` and the passage `p`. */
const SOURCE_SQL: Record<AskPollisSource, string> = {
	pollisTopics: `d.kind = 'document' AND coalesce(d.toolbox, '') = ''`,
	packageVignettes: `d.kind = 'vignette'`,
	toolboxOverviews: `d.kind = 'document' AND coalesce(d.toolbox, '') <> ''`,
	panelsWikis: `d.kind = 'wiki'`,
	juliaManual: `d.kind = 'julia' AND NOT ${JULIA_LIBRARY_SQL}`,
	juliaLibrary: `d.kind = 'julia' AND ${JULIA_LIBRARY_SQL}`,
};

/** What keeps a search to the sources ticked, the collections with none ticked being searched whole. */
function sourcesSql(sources: readonly AskPollisSource[] | undefined): string {
	if (!sources?.length) {
		return '';
	}
	const collections = [...new Set(sources.map(source => ASK_SOURCE_COLLECTION[source]))];
	return ` AND (d.collection NOT IN (${collections.map(sqlString).join(', ')}) OR ${sources.map(source => `(${SOURCE_SQL[source]})`).join(' OR ')})`;
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

/** A question of a run read back, with its options, at the place of its right answer among them, and its explanation, when it was a closed question. */
function closedItem(item: IAskPollisEvalItem, choices: unknown, explanation: unknown): IAskPollisEvalItem {
	const options: unknown = typeof choices === 'string' ? JSON.parse(choices) : undefined;
	if (!Array.isArray(options) || !options.every(option => typeof option === 'string')) {
		return item;
	}
	return { ...item, choices: options, rightChoice: options.indexOf(item.answer), ...(typeof explanation === 'string' && explanation ? { explanation } : {}) };
}

/** The shortest passage Make Questions asks about, in characters: a shorter one is mostly a heading or a line of a table. */
const SHORTEST_QUESTION_PASSAGE = 400;

/** The share of the words of a question's passage that the passage it now matches has at least: see matchPassages. */
const MATCHING_WORDS = 0.6;

/** The words of `text`, in lower case: its runs of letters and digits. */
function words(text: string): Set<string> {
	return new Set(text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []);
}

/** The topic of a passage by its document `d`, as AskTopic: the Julia Manual, Pollis' own documents, and the rest (the wikis, the vignettes of the toolboxes). */
const TOPIC = `CASE WHEN d.kind = 'julia' THEN 'julia' WHEN d.kind = 'document' AND coalesce(d.toolbox, '') = '' THEN 'pollis' ELSE 'panels' END`;

/**
 * The tables of Comparisons.duckdb: a run, the passages found for each of its questions, the answers, the judges'
 * scores and why a judge did not rate an answer; the passages found for a question with a search stamp, those of
 * the latest stamp only; a run of Evaluate Embedding Models, its questions and what each model found for them; and a
 * run of Evaluate Reranking Models, its questions and where each reranker put the passage of each; and a run of
 * Benchmark Answering Models, its models with their figures and their answers.
 */
const COMPARISONS_TABLES = [
	'CREATE TABLE IF NOT EXISTS Comparisons.runs(id VARCHAR PRIMARY KEY, started BIGINT, pollis VARCHAR, models VARCHAR, judges VARCHAR, repeats INTEGER, questions INTEGER)',
	// The answering strategy of a run: a run without one was Base
	'ALTER TABLE Comparisons.runs ADD COLUMN IF NOT EXISTS strategy VARCHAR',
	// Open Book Answering: each model given the question's own passage, with no search
	'ALTER TABLE Comparisons.runs ADD COLUMN IF NOT EXISTS open_book BOOLEAN',
	// Closed Book Answering: each model given no passage
	'ALTER TABLE Comparisons.runs ADD COLUMN IF NOT EXISTS closed_book BOOLEAN',
	'CREATE TABLE IF NOT EXISTS Comparisons.questions(run VARCHAR, question INTEGER, source VARCHAR, context VARCHAR, text VARCHAR, answer VARCHAR, passages VARCHAR, rank INTEGER)',
	'CREATE TABLE IF NOT EXISTS Comparisons.answers(run VARCHAR, id VARCHAR, question INTEGER, model VARCHAR, repeat INTEGER, answer VARCHAR, error VARCHAR, first_word DOUBLE, seconds DOUBLE, reading DOUBLE, writing DOUBLE, tokens_read INTEGER, tokens_written INTEGER)',
	// The answer score of an answer, added with it: an answer before it has none
	'ALTER TABLE Comparisons.answers ADD COLUMN IF NOT EXISTS similarity DOUBLE',
	// A closed question: its options in the order asked, as JSON, why the right one is right, and the option each answer chose
	'ALTER TABLE Comparisons.questions ADD COLUMN IF NOT EXISTS choices VARCHAR',
	'ALTER TABLE Comparisons.questions ADD COLUMN IF NOT EXISTS explanation VARCHAR',
	// The Context each question was asked with: its own, or the title of its panel; none before there was a Context
	'ALTER TABLE Comparisons.questions ADD COLUMN IF NOT EXISTS question_context VARCHAR',
	'ALTER TABLE Comparisons.answers ADD COLUMN IF NOT EXISTS choice INTEGER',
	'CREATE TABLE IF NOT EXISTS Comparisons.scores(run VARCHAR, answer VARCHAR, judge VARCHAR, relevance INTEGER, completeness INTEGER, clarity INTEGER, consistency INTEGER, helpfulness INTEGER, final DOUBLE, rationale VARCHAR)',
	'CREATE TABLE IF NOT EXISTS Comparisons.unrated(run VARCHAR, answer VARCHAR, judge VARCHAR, error VARCHAR)',
	'CREATE TABLE IF NOT EXISTS Comparisons.found(stamp VARCHAR, question VARCHAR, passages VARCHAR, PRIMARY KEY(stamp, question))',
	'CREATE TABLE IF NOT EXISTS Comparisons.embeddingRuns(id VARCHAR PRIMARY KEY, started BIGINT, pollis VARCHAR, models VARCHAR, questions INTEGER, passages INTEGER)',
	// A run of a retrieval benchmark: its id, and the nDCG@10 and Recall@10 of each query for each model
	'ALTER TABLE Comparisons.embeddingRuns ADD COLUMN IF NOT EXISTS benchmark VARCHAR',
	'CREATE TABLE IF NOT EXISTS Comparisons.embeddingQuestions(run VARCHAR, question INTEGER, source VARCHAR, context VARCHAR, text VARCHAR, answer VARCHAR)',
	'CREATE TABLE IF NOT EXISTS Comparisons.embeddingFound(run VARCHAR, question INTEGER, model VARCHAR, hybrid INTEGER, meaning INTEGER, query_ms DOUBLE, search_ms DOUBLE)',
	'ALTER TABLE Comparisons.embeddingFound ADD COLUMN IF NOT EXISTS ndcg DOUBLE',
	'ALTER TABLE Comparisons.embeddingFound ADD COLUMN IF NOT EXISTS recall DOUBLE',
	'CREATE TABLE IF NOT EXISTS Comparisons.rerankRuns(id VARCHAR PRIMARY KEY, started BIGINT, pollis VARCHAR, models VARCHAR, questions INTEGER, found INTEGER, kept INTEGER, embedder VARCHAR)',
	// A run of a retrieval benchmark: its id, the nDCG@10 and Recall@10 of each query for each reranker, and the share of its relevant documents BM25 found
	'ALTER TABLE Comparisons.rerankRuns ADD COLUMN IF NOT EXISTS benchmark VARCHAR',
	'CREATE TABLE IF NOT EXISTS Comparisons.rerankQuestions(run VARCHAR, question INTEGER, source VARCHAR, context VARCHAR, text VARCHAR, answer VARCHAR)',
	'CREATE TABLE IF NOT EXISTS Comparisons.rerankFound(run VARCHAR, question INTEGER, model VARCHAR, place INTEGER, ms DOUBLE)',
	'ALTER TABLE Comparisons.rerankFound ADD COLUMN IF NOT EXISTS ndcg DOUBLE',
	'ALTER TABLE Comparisons.rerankFound ADD COLUMN IF NOT EXISTS recall DOUBLE',
	'ALTER TABLE Comparisons.rerankFound ADD COLUMN IF NOT EXISTS among DOUBLE',
	// A run of Benchmark Answering Models: its sample's strata, as JSON, and the ids of its questions in the order drawn, as JSON
	'CREATE TABLE IF NOT EXISTS Comparisons.benchmarkRuns(id VARCHAR PRIMARY KEY, started BIGINT, ended BIGINT, pollis VARCHAR, benchmark VARCHAR, revision VARCHAR, shots INTEGER, reasoning BOOLEAN, thinking BOOLEAN, max_tokens INTEGER, seed BIGINT, allocation VARCHAR, size INTEGER, strata VARCHAR, questions VARCHAR)',
	// Each model of a run, in the order it ran, and the figures PollisBenchmarks.jl computed of it: its strata as JSON
	'CREATE TABLE IF NOT EXISTS Comparisons.benchmarkModels(run VARCHAR, place INTEGER, model VARCHAR, label VARCHAR, size VARCHAR, started BIGINT, ended BIGINT, free_before BIGINT, lowest_free BIGINT, error VARCHAR, questions INTEGER, failed INTEGER, score DOUBLE, half DOUBLE, right_answers INTEGER, by_chance DOUBLE, strata VARCHAR, unread INTEGER, cut_off INTEGER, first_token_ms DOUBLE, reading_speed DOUBLE, writing_speed DOUBLE, seconds DOUBLE, written_tokens DOUBLE, memory BIGINT)',
	// Each answer of a run, in the order it was written, with its grade and its timings
	'CREATE TABLE IF NOT EXISTS Comparisons.benchmarkAnswers(run VARCHAR, place INTEGER, model VARCHAR, question VARCHAR, stratum VARCHAR, extracted VARCHAR, correct BOOLEAN, error VARCHAR, text VARCHAR, finish VARCHAR, seconds DOUBLE, prompt_tokens INTEGER, written_tokens INTEGER, prompt_ms DOUBLE, reading_speed DOUBLE, writing_speed DOUBLE, token_ms DOUBLE)',
];

/** The runs of Benchmark Answering Models while they go, as PollisBenchmarks.jl writes them: <id>.json and <id>.jsonl. */
const BENCHMARK_RUNS = join(os.homedir(), '.pollis', 'benchmarks', 'runs');
/** How long the files of a run not marked ended stay unchanged before it is taken as ended: a run cut off when Pollis or its notebook quit. */
const BENCHMARK_IDLE_MS = 24 * 60 * 60 * 1000;

/** A number of a row, or null for NULL, as the figures of PollisBenchmarks.jl have it. */
function numberOrNull(value: unknown): number | null {
	return value === null || value === undefined ? null : Number(value);
}

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

/** How many pairs of texts the answer scores embed at a time. */
const SIMILARITY_BATCH = 8;
/** How much of an answer the answer score embeds: about 1,500 tokens, within the embedding server's context. */
const SIMILARITY_CHARACTERS = 6000;

/** The cosine similarity of the vectors `a` and `b`; 0 when either is all zeros. */
function cosine(a: readonly number[], b: readonly number[]): number {
	let dot = 0;
	let normA = 0;
	let normB = 0;
	for (let index = 0; index < a.length; index++) {
		dot += a[index] * b[index];
		normA += a[index] * a[index];
		normB += b[index] * b[index];
	}
	return normA && normB ? dot / Math.sqrt(normA * normB) : 0;
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

	/**
	 * Runs `task` with the index attached and the default database, as its fts index needs: PollisDocuments, or the
	 * index of a collection, the file `database`; nothing when there is no index.
	 */
	private withIndex<T>(task: (connection: DuckDBConnection) => Promise<T>, database = DATABASE): Promise<T | undefined> {
		return this.sequencer.queue(async () => {
			if (!fs.existsSync(database)) {
				return undefined;
			}
			const connection = await this.connect();
			try {
				await connection.run(`ATTACH ${sqlString(database)} AS PollisDocuments (READ_ONLY)`);
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
				words: Number(built.get('words') || 250),
				collections,
			};
		} catch {
			// An index of an older Pollis, made again at the next start
			return undefined;
		}
	}

	async status(database?: string): Promise<IAskPollisIndexStatus | undefined> {
		return this.withIndex(connection => this.readStatus(connection), database);
	}

	async indexedDocuments(database: string): Promise<readonly IAskPollisIndexedDocument[] | undefined> {
		return this.withIndex(async connection => (await connection.runAndReadAll(
			'SELECT d.source AS file, count(p.id) AS passages FROM documents d LEFT JOIN passages p ON p.document = d.id GROUP BY d.source'
		)).getRowObjectsJson().map(row => ({ file: String(row.file), passages: Number(row.passages) })), database);
	}

	async rerank(url: string, question: string, passages: readonly string[]): Promise<IAskPollisReranked> {
		try {
			const response = await fetch(`${url}/rerank`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: question, documents: passages }) });
			if (!response.ok) {
				return { error: `${response.status} ${await response.text()}` };
			}
			const answer = await response.json() as { results: { index: number; relevance_score: number }[] };
			const scores = passages.map(() => 0);
			for (const result of answer.results) {
				scores[result.index] = result.relevance_score;
			}
			return { scores };
		} catch (err) {
			return { error: err instanceof Error ? err.message : String(err) };
		}
	}

	async similarities(url: string, pairs: readonly (readonly [string, string])[]): Promise<readonly number[]> {
		const similarities: number[] = [];
		// A few pairs at a time, each text cut to fit the server's context
		for (let start = 0; start < pairs.length; start += SIMILARITY_BATCH) {
			const inputs = pairs.slice(start, start + SIMILARITY_BATCH).flat().map(text => text.slice(0, SIMILARITY_CHARACTERS));
			const answer = JSON.parse(await embedAll(url, inputs)) as { data: { index?: number; embedding: number[] }[] };
			const vectors = answer.data.map((item, position) => ({ position: item.index ?? position, embedding: item.embedding })).sort((a, b) => a.position - b.position).map(item => item.embedding);
			for (let index = 0; index + 1 < vectors.length; index += 2) {
				similarities.push(cosine(vectors[index], vectors[index + 1]));
			}
		}
		return similarities;
	}

	async wikiPassages(wikiFile: string): Promise<readonly IAskPollisPassage[]> {
		const found = await this.withIndex(async connection => (await connection.runAndReadAll(
			`SELECT p.id, ${PASSAGE_COLUMNS}, 0 AS score FROM passages p JOIN documents d ON d.id = p.document WHERE d.kind = 'wiki' AND suffix(replace(d.source, '\\', '/'), '/' || $file) ORDER BY p.id`, { file: wikiFile }
		)).getRowObjectsJson().map(passageOf));
		return found ?? [];
	}

	async documentPassages(database: string, file: string, count: number): Promise<readonly IAskPollisPassage[]> {
		const found = await this.withIndex(async connection => (await connection.runAndReadAll(
			`SELECT p.id, ${PASSAGE_COLUMNS}, 0 AS score FROM passages p JOIN documents d ON d.id = p.document WHERE d.source = $file ORDER BY p.id LIMIT ${Math.max(1, Math.floor(count))}`, { file }
		)).getRowObjectsJson().map(passageOf), database);
		return found ?? [];
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
			const { passages, searched, panelMissing } = await this.findPassages(connection, status.collections, {
				question: request.question, vector, dimensions: vector ? status.dimensions : 0, count: Math.max(1, request.passages ?? ASK_PASSAGES), collections: request.collections, sources: request.sources, panel: request.panel, panelShare: request.panelShare,
			});
			const result: IAskPollisSearchResult = {
				passages,
				searched,
				collections: status.collections,
				...(vector ? {} : { wordsOnly: wordsOnly ?? (status.embedded ? 'otherModel' : 'notEmbedded') }),
				...(error && !vector ? { error } : {}),
				...(panelMissing ? { panelMissing } : {}),
			};
			return result;
		}, request.index?.file);
		return found ?? { passages: [], searched: [], collections: [], wordsOnly: 'notIndexed' };
	}

	/**
	 * The passages for `query`, from the collections of `all`: those named are searched, else the nearest and those almost
	 * as near, the Package APIs never among them; and whether the panel asked in has no passages in the index.
	 */
	private async findPassages(connection: DuckDBConnection, all: readonly string[], query: IPassageQuery): Promise<{ passages: IAskPollisPassage[]; searched: string[]; panelMissing: boolean }> {
		const { vector, dimensions, vectors } = query;
		let searched = query.collections?.filter(name => all.includes(name)) ?? all.filter(name => name !== PACKAGE_APIS);
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
		const source = sourcesSql(query.sources);
		let where = `d.collection = $collection${source}`;
		let panelMissing = false;
		if (query.panel) {
			const panel = panelSql(query.panel);
			const [held] = (await connection.runAndReadAll(`SELECT EXISTS (SELECT 1 FROM passages p JOIN documents d ON p.document = d.id WHERE ${panel}) AS held`)).getRowObjectsJson();
			panelMissing = !held?.held;
			const share = Math.min(query.count, query.panelShare === undefined ? shares(query.count, 2)[0] : Math.ceil(query.count * await this.panelShare(connection, query, panel, searched, source)));
			const rows = (await connection.runAndReadAll(searchSql(vector ? dimensions : 0, share, vectors, `${panel}${source}`), parameters)).getRowObjectsJson();
			passages.push(...rows.map(passageOf));
			where = `${where} AND NOT ${panel}`;
		}
		const counts = shares(query.count - passages.length, searched.length);
		for (let i = 0; i < searched.length; i++) {
			const rows = (await connection.runAndReadAll(searchSql(vector ? dimensions : 0, counts[i], vectors, where), { ...parameters, collection: searched[i] })).getRowObjectsJson();
			passages.push(...rows.map(passageOf));
		}
		// The docstrings last: a small model given "No-U-Turn Sampler (NUTS) sampler." first may repeat that line and stop
		return { passages: [...passages.filter(passage => passage.kind !== 'api'), ...passages.filter(passage => passage.kind === 'api')], searched, panelMissing };
	}

	/**
	 * The share of the passages from the panel's own (`panel`, its SQL condition) for `query`: a share `{ near, far }` is
	 * `near` when the panel's nearest passage is within ROUTE_MARGIN of the nearest among it and the collections
	 * `searched`, as a collection must be to be searched, and `near` when the search is by words only.
	 */
	private async panelShare(connection: DuckDBConnection, query: IPassageQuery, panel: string, searched: readonly string[], source: string): Promise<number> {
		const share = query.panelShare;
		if (typeof share === 'number' || share === undefined) {
			return share ?? NEAREST_SHARE;
		}
		const { vector, dimensions, vectors } = query;
		if (!vector) {
			return share.near;
		}
		const embedding = vectors ? 'v.embedding' : 'p.embedding';
		const distance = `array_cosine_distance(${embedding}, $vector::FLOAT[${dimensions}])`;
		const among = searched.length ? `(${panel} OR d.collection IN (${searched.map(sqlString).join(', ')}))` : panel;
		const [row] = (await connection.runAndReadAll(`SELECT min(CASE WHEN ${panel} THEN ${distance} END) AS panel, min(${distance}) AS best FROM passages p JOIN documents d ON p.document = d.id${vectors ? ` JOIN ${vectors} v ON v.id = p.id` : ''} WHERE ${embedding} IS NOT NULL AND ${among}${source}`, { vector })).getRowObjectsJson();
		return row?.panel !== null && row?.panel !== undefined && Number(row.panel) - Number(row.best) <= ROUTE_MARGIN ? share.near : share.far;
	}

	/** Runs `task` with embeddings.duckdb attached as `cache`, made the first time; within a task of the sequencer. */
	private async inCache<T>(connection: DuckDBConnection, task: (connection: DuckDBConnection) => Promise<T>): Promise<T> {
		fs.mkdirSync(dirname(EMBEDDINGS), { recursive: true });
		await connection.run(`ATTACH ${sqlString(EMBEDDINGS)} AS cache`);
		try {
			await connection.run('CREATE TABLE IF NOT EXISTS cache.embeddings(key VARCHAR PRIMARY KEY, embedding FLOAT[])');
			return await task(connection);
		} finally {
			await connection.run('DETACH cache');
		}
	}

	/** Runs `task` with the index and embeddings.duckdb attached, the cache made the first time. */
	private withCache<T>(task: (connection: DuckDBConnection) => Promise<T>): Promise<T | undefined> {
		return this.withIndex(connection => this.inCache(connection, task));
	}

	/** Runs `task` with PollisBenchmarks.duckdb attached read-only as `benchmarks`; nothing when it cannot be read, as while PollisBenchmarks.jl makes it. */
	private withBenchmarks<T>(task: (connection: DuckDBConnection) => Promise<T>): Promise<T | undefined> {
		return this.sequencer.queue(async () => {
			if (!fs.existsSync(BENCHMARKS)) {
				return undefined;
			}
			const connection = await this.connect();
			try {
				await connection.run(`ATTACH ${sqlString(BENCHMARKS)} AS benchmarks (READ_ONLY)`);
			} catch {
				return undefined;
			}
			try {
				return await task(connection);
			} finally {
				await connection.run('DETACH benchmarks');
			}
		});
	}

	/** Runs `query` on the memory database alone, as a task of the sequencer. */
	private inMemory<T>(query: (connection: DuckDBConnection) => Promise<T>): Promise<T> {
		return this.sequencer.queue(async () => query(await this.connect()));
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
		return this.embedMissing(request, todo);
	}

	/** Embeds `todo`, the texts embeddings.duckdb does not have, with the server of `request`, keeping each batch as it comes. */
	private async embedMissing(request: IEmbeddingRequest, todo: readonly { key: string; input: string }[]): Promise<IEmbeddingDone> {
		const started = Date.now();
		let embedded = 0;
		let error: string | undefined;
		// Each batch kept as it comes, one request at a time: a batch that fails is asked again a passage at a time
		const keep = async (batch: readonly { key: string; input: string }[]) => {
			const answer = await embedAll(request.url, batch.map(item => item.input));
			await this.sequencer.queue(async () => this.inCache(await this.connect(), connection => connection.run(`INSERT OR REPLACE INTO cache.embeddings
				SELECT from_json($keys, '["VARCHAR"]')[e."index" + 1], e.embedding
				FROM (SELECT unnest(from_json($answer, '{"data": [{"index": "INTEGER", "embedding": "FLOAT[]"}]}').data, recursive := true)) e`, { keys: JSON.stringify(batch.map(item => item.key)), answer })));
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
				const passages = Number((await connection.runAndReadAll(`SELECT count(*) AS passages FROM passages p JOIN documents d ON p.document = d.id WHERE d.kind <> 'api'`)).getRowObjectsJson()[0]?.passages ?? 0);
				return { dimensions, passages, collections: status?.collections ?? [] };
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
						const context = (await this.matchPassages(connection, [item.context]))[0]?.text ?? item.context;
						const search = Date.now();
						const given = await this.findPassages(connection, collections, { question: item.question, vector, dimensions, count: ASK_PASSAGES, vectors: 'memory.candidate' });
						const searchMs = Date.now() - search;
						// The place of the question's passage among all passages by meaning: how many are nearer the question, and 1
						const row = (await connection.runAndReadAll(`WITH target AS (
							SELECT min(array_cosine_distance(v.embedding, $vector::FLOAT[${dimensions}])) AS distance FROM memory.candidate v JOIN passages p ON p.id = v.id WHERE p.text = $context)
							SELECT CASE WHEN t.distance IS NULL THEN NULL ELSE 1 + (SELECT count(*) FROM memory.candidate v WHERE array_cosine_distance(v.embedding, $vector::FLOAT[${dimensions}]) < t.distance) END AS meaning FROM target t`, { vector, context })).getRowObjectsJson()[0];
						const meaning = optionalNumber(row?.meaning);
						const hybrid = meaning === undefined ? undefined : given.passages.findIndex(passage => passage.text === context) + 1;
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

	async retrievalQueries(benchmark: string): Promise<readonly IRetrievalQuery[] | undefined> {
		const table = retrievalTable(benchmark);
		if (!table) {
			return undefined;
		}
		try {
			return await this.withBenchmarks(async connection => (await connection.runAndReadAll(`SELECT id, text, relevant FROM ${table} WHERE split = 'test' ORDER BY rowid`)).getRowObjectsJson()
				.map(row => ({ id: String(row.id), text: String(row.text), relevant: Array.isArray(row.relevant) ? row.relevant.map(String) : [] })));
		} catch {
			// A PollisBenchmarks.duckdb of an older PollisBenchmarks.jl, without the table
			return undefined;
		}
	}

	async embedRetrieval(request: IRetrievalEmbeddingRequest): Promise<IEmbeddingDone> {
		this.embeddingStopped = false;
		const table = retrievalTable(request.benchmark);
		if (!table) {
			return { embedded: 0, seconds: 0, error: 'notBenchmarks' };
		}
		let todo: { key: string; input: string }[];
		try {
			const rows = await this.withBenchmarks(connection => this.inCache(connection, async () => (await connection.runAndReadAll(`SELECT key, any_value(input) AS input FROM (${retrievalInputsSql(table)}) WHERE key NOT IN (SELECT key FROM cache.embeddings) GROUP BY key ORDER BY min(id)`, { model: request.model, prefix: request.passagePrefix })).getRowObjectsJson()));
			if (!rows) {
				return { embedded: 0, seconds: 0, error: 'notBenchmarks' };
			}
			todo = rows.map(row => ({ key: String(row.key), input: String(row.input) }));
		} catch (err) {
			return { embedded: 0, seconds: 0, error: err instanceof Error ? err.message : String(err) };
		}
		return this.embedMissing(request, todo);
	}

	async evaluateRetrieval(request: IRetrievalEvaluation): Promise<IEmbeddingEvaluated> {
		this.embeddingStopped = false;
		const failed = (error: string): IEmbeddingEvaluated => ({ dimensions: 0, passages: 0, found: [], error });
		const table = retrievalTable(request.benchmark);
		if (!table) {
			return failed('notBenchmarks');
		}
		try {
			// The model's embeddings of the documents, from the cache, in a table of their own for the searches
			const made = await this.withBenchmarks(connection => this.inCache(connection, async () => {
				const parameters = { model: request.model, prefix: request.passagePrefix };
				const inputs = retrievalInputsSql(table);
				const dimensions = Number((await connection.runAndReadAll(`SELECT max(len(c.embedding)) AS dimensions FROM (${inputs}) i JOIN cache.embeddings c ON c.key = i.key`, parameters)).getRowObjectsJson()[0]?.dimensions ?? 0);
				if (dimensions) {
					await connection.run(`CREATE OR REPLACE TABLE memory.retrieval_vectors AS SELECT i.id, c.embedding::FLOAT[${dimensions}] AS embedding FROM (${inputs}) i JOIN cache.embeddings c ON c.key = i.key WHERE len(c.embedding) = ${dimensions}`, parameters);
				}
				const documents = Number((await connection.runAndReadAll(`SELECT count(*) AS documents FROM ${table} WHERE split = 'document'`)).getRowObjectsJson()[0]?.documents ?? 0);
				return { dimensions, documents };
			}));
			if (!made) {
				return failed('notBenchmarks');
			}
			if (!made.dimensions) {
				return failed('notEmbedded');
			}
			const { dimensions, documents } = made;
			const found: IEmbeddingFound[] = [];
			try {
				for (const [i, query] of request.queries.entries()) {
					if (this.embeddingStopped) {
						break;
					}
					const embedding = Date.now();
					const vector = await embed(request.url, request.queryPrefix.replace('{text}', query.text));
					const queryMs = Date.now() - embedding;
					const search = Date.now();
					// The nearest documents by meaning, the earlier id first on a tie
					const ids = await this.inMemory(async connection => (await connection.runAndReadAll(`SELECT id FROM memory.retrieval_vectors ORDER BY array_cosine_distance(embedding, $vector::FLOAT[${dimensions}]), id LIMIT ${RETRIEVAL_CUT}`, { vector })).getRowObjectsJson().map(row => String(row.id)));
					const searchMs = Date.now() - search;
					found.push({ ...retrievalScore(ids, query.relevant), queryMs, searchMs });
					this._onDidEmbed.fire({ model: request.model, phase: 'search', done: i + 1, total: request.queries.length });
				}
			} finally {
				await this.inMemory(connection => connection.run('DROP TABLE IF EXISTS memory.retrieval_vectors'));
			}
			return { dimensions, passages: documents, found };
		} catch (err) {
			return failed(err instanceof Error ? err.message : String(err));
		}
	}

	async rerankRetrieval(request: IRetrievalRerankRequest): Promise<IRetrievalRerankDone> {
		this.embeddingStopped = false;
		const table = retrievalTable(request.benchmark);
		if (!table) {
			return { found: [], error: 'notBenchmarks' };
		}
		try {
			// The documents, with an fts index of their titles and texts, in the memory database, the default one, where the index is made
			const indexed = await this.withBenchmarks(async connection => {
				await connection.run(`CREATE OR REPLACE TABLE ${RETRIEVAL_DOCUMENTS} AS SELECT id, title, text FROM ${table} WHERE split = 'document'`);
				await connection.run(`PRAGMA create_fts_index('${RETRIEVAL_DOCUMENTS}', 'id', 'title', 'text', overwrite = 1)`);
				return true;
			});
			if (!indexed) {
				return { found: [], error: 'notBenchmarks' };
			}
			const found: IRetrievalReranked[] = [];
			let error: string | undefined;
			try {
				for (const [index, query] of request.queries.entries()) {
					if (this.embeddingStopped) {
						break;
					}
					// The documents BM25 finds for the query, the best first, the earlier id first on a tie
					const candidates = await this.inMemory(async connection => (await connection.runAndReadAll(`SELECT id, title, text FROM (
						SELECT id, title, text, fts_main_${RETRIEVAL_DOCUMENTS}.match_bm25(id, $query) AS score FROM ${RETRIEVAL_DOCUMENTS})
						WHERE score IS NOT NULL ORDER BY score DESC, id LIMIT ${RETRIEVAL_CANDIDATES}`, { query: query.text })).getRowObjectsJson()
						.map(row => ({ id: String(row.id), text: `${String(row.title ?? '')}\n${String(row.text ?? '')}`.trim().slice(0, EMBEDDED_CHARACTERS) })));
					let order = candidates.map(candidate => candidate.id);
					let ms: number | undefined;
					if (request.url && candidates.length) {
						const start = Date.now();
						const reranked = await this.rerank(request.url, query.text, candidates.map(candidate => candidate.text));
						ms = Date.now() - start;
						const scores = reranked.scores;
						if (!scores) {
							error ??= reranked.error || 'noScores';
							continue;
						}
						// In the reranker's order, the earlier of BM25 first on a tie
						order = candidates.map((candidate, place) => ({ id: candidate.id, score: scores[place], place })).sort((a, b) => b.score - a.score || a.place - b.place).map(candidate => candidate.id);
					}
					found.push({ query: index, ...retrievalScore(order, query.relevant), among: shareFound(order, query.relevant), ...(ms === undefined ? {} : { ms }) });
					this._onDidEmbed.fire({ model: request.model ?? '', phase: 'rerank', done: index + 1, total: request.queries.length });
				}
			} finally {
				await this.inMemory(async connection => {
					await connection.run(`PRAGMA drop_fts_index('${RETRIEVAL_DOCUMENTS}')`);
					await connection.run(`DROP TABLE IF EXISTS ${RETRIEVAL_DOCUMENTS}`);
				});
			}
			return { found, ...(error ? { error } : {}) };
		} catch (err) {
			return { found: [], error: err instanceof Error ? err.message : String(err) };
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
				FROM long l JOIN documents d ON d.id = l.document WHERE d.kind <> 'api'),
			chosen AS (
				SELECT * FROM turns
				QUALIFY row_number() OVER (PARTITION BY topic ORDER BY turn, kind) <= CASE topic WHEN 'pollis' THEN ${count('pollis')} WHEN 'julia' THEN ${count('julia')} ELSE ${count('panels')} END)
			SELECT p.id, ${PASSAGE_COLUMNS}, 0 AS score
			FROM chosen t JOIN passages p ON p.id = t.id JOIN documents d ON d.id = p.document
			ORDER BY t.turn, t.kind`)).getRowObjectsJson());
		return (rows ?? []).map(passageOf);
	}

	async matches(texts: readonly string[]): Promise<readonly (IAskPassageMatch | undefined)[] | undefined> {
		if (!texts.length) {
			return [];
		}
		return this.withIndex(connection => this.matchPassages(connection, texts));
	}

	/**
	 * The passage of each of `texts`, as matches: the one of the same text or, for a text no passage has any more (a
	 * document edited since the question was written), the passage that has the largest share of its words, when it
	 * has MATCHING_WORDS of them at least, the shorter of two as good.
	 */
	private async matchPassages(connection: DuckDBConnection, texts: readonly string[]): Promise<(IAskPassageMatch | undefined)[]> {
		const read = async (where: string) => (await connection.runAndReadAll(`SELECT p.text, any_value(${TOPIC}) AS topic FROM passages p JOIN documents d ON d.id = p.document WHERE d.kind <> 'api'${where} GROUP BY p.text`))
			.getRowObjectsJson().map(row => ({ text: String(row.text), topic: String(row.topic) as AskTopic }));
		const found = new Map((await read(` AND p.text IN (${texts.map(sqlString).join(', ')})`)).map(match => [match.text, match]));
		const missing = new Set(texts.filter(text => text && !found.has(text)));
		if (missing.size) {
			const passages = (await read('')).map(match => ({ match, words: words(match.text) }));
			for (const text of missing) {
				const wanted = words(text);
				let best: { match: IAskPassageMatch; share: number; size: number } | undefined;
				for (const passage of passages) {
					let common = 0;
					for (const word of wanted) {
						if (passage.words.has(word)) {
							common++;
						}
					}
					const share = common / wanted.size;
					if (share >= MATCHING_WORDS && (!best || share > best.share || (share === best.share && passage.words.size < best.size))) {
						best = { match: passage.match, share, size: passage.words.size };
					}
				}
				if (best) {
					found.set(text, best.match);
				}
			}
		}
		return texts.map(text => found.get(text));
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
				// A run kept in the column style keeps its answering strategy
				if ((await connection.runAndReadAll(`SELECT 1 FROM duckdb_columns() WHERE database_name = 'Comparisons' AND table_name = 'runs' AND column_name = 'style'`)).getRowObjectsJson().length) {
					await connection.run('UPDATE Comparisons.runs SET strategy = coalesce(strategy, style)');
					await connection.run('ALTER TABLE Comparisons.runs DROP COLUMN style');
				}
				await connection.run(`UPDATE Comparisons.runs SET strategy = 'base' WHERE strategy = 'classical'`);
				return await task(connection);
			} finally {
				// Its changes written into the file itself, then the file let go and copied
				await connection.run('CHECKPOINT Comparisons').catch(() => undefined);
				await connection.run('DETACH Comparisons');
				this.copyComparisons();
			}
		});
	}

	/** The modification time of Comparisons.duckdb when it was last copied; none before the first copy of this process. */
	private comparisonsCopied: number | undefined;

	/**
	 * Copies Comparisons.duckdb to COMPARISONS_COPY when it has changed since the last copy, or has not been copied by
	 * this process: written beside it, then renamed over it, so that a reader of the old copy keeps reading it whole.
	 * Where the old copy cannot be replaced while it is open, as on Windows, it stays until the next change.
	 */
	private copyComparisons(): void {
		try {
			const changed = fs.statSync(COMPARISONS).mtimeMs;
			if (changed === this.comparisonsCopied && fs.existsSync(COMPARISONS_COPY)) {
				return;
			}
			fs.mkdirSync(dirname(COMPARISONS_COPY), { recursive: true });
			const partial = `${COMPARISONS_COPY}.${process.pid}.partial`;
			fs.copyFileSync(COMPARISONS, partial);
			try {
				fs.renameSync(partial, COMPARISONS_COPY);
				this.comparisonsCopied = changed;
			} finally {
				fs.rmSync(partial, { force: true });
			}
		} catch {
			// The runs stay in Comparisons.duckdb; the copy is made again at the next change
		}
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
				await connection.run('INSERT INTO Comparisons.runs (id, started, pollis, models, judges, repeats, questions, strategy, open_book, closed_book) VALUES ($id, $started, $pollis, $models, $judges, $repeats, $questions, $strategy::VARCHAR, $openBook, $closedBook)', {
					id: summary.id, started: summary.started, pollis: summary.pollis, models: JSON.stringify(summary.models), judges: JSON.stringify(summary.judges), repeats: summary.repeats, questions: summary.questions, strategy: summary.strategy ?? null, openBook: !!summary.openBook, closedBook: !!summary.closedBook,
				});
				for (const question of run.questions) {
					await connection.run('INSERT INTO Comparisons.questions (run, question, source, context, text, answer, passages, rank, choices, explanation, question_context) VALUES ($run, $question, $source, $context, $text, $answer, $passages, $rank::INTEGER, $choices::VARCHAR, $explanation::VARCHAR, $questionContext::VARCHAR)', {
						run: summary.id, question: question.index, source: question.item.source, context: question.item.context, text: question.item.question, answer: question.item.answer, passages: JSON.stringify(question.passages), rank: question.rank ?? null,
						choices: question.item.choices ? JSON.stringify(question.item.choices) : null, explanation: question.item.explanation ?? null, questionContext: askEvalContext(question.item) ?? null,
					});
				}
				for (const answer of run.answers) {
					const timings = answer.timings;
					await connection.run('INSERT INTO Comparisons.answers (run, id, question, model, repeat, answer, error, first_word, seconds, reading, writing, tokens_read, tokens_written, similarity, choice) VALUES ($run, $id, $question, $model, $repeat, $answer, $error::VARCHAR, $firstWord::DOUBLE, $seconds::DOUBLE, $reading::DOUBLE, $writing::DOUBLE, $tokensRead::INTEGER, $tokensWritten::INTEGER, $similarity::DOUBLE, $choice::INTEGER)', {
						run: summary.id, id: answer.id, question: answer.question, model: answer.model, repeat: answer.repeat, answer: answer.answer, error: answer.error ?? null,
						firstWord: timings?.firstWord ?? null, seconds: timings?.seconds ?? null, reading: timings?.reading ?? null, writing: timings?.writing ?? null, tokensRead: timings?.tokensRead ?? null, tokensWritten: timings?.tokensWritten ?? null,
						similarity: answer.similarity ?? null, choice: answer.choice ?? null,
					});
				}
				for (const score of run.scores) {
					await connection.run('INSERT INTO Comparisons.scores VALUES ($run, $answer, $judge, $relevance::INTEGER, $completeness::INTEGER, $clarity::INTEGER, $consistency::INTEGER, $helpfulness::INTEGER, $final, $rationale)', {
						run: summary.id, answer: score.answer, judge: score.judge, final: score.final, rationale: score.rationale,
						relevance: score.relevance ?? null, completeness: score.completeness ?? null, clarity: score.clarity ?? null, consistency: score.consistency ?? null, helpfulness: score.helpfulness ?? null,
					});
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
			...(row.strategy ? { strategy: String(row.strategy) } : {}),
			...(row.open_book ? { openBook: true } : {}),
			...(row.closed_book ? { closedBook: true } : {}),
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
					item: closedItem({ source: String(row.source ?? ''), context: String(row.context ?? ''), question: String(row.text ?? ''), answer: String(row.answer ?? ''), ...(typeof row.question_context === 'string' ? { questionContext: row.question_context } : {}) }, row.choices, row.explanation),
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
					similarity: optionalNumber(row.similarity),
					choice: optionalNumber(row.choice),
				})),
				scores: scores.map(row => ({
					answer: String(row.answer),
					judge: String(row.judge),
					relevance: optionalNumber(row.relevance),
					completeness: optionalNumber(row.completeness),
					clarity: optionalNumber(row.clarity),
					consistency: optionalNumber(row.consistency),
					helpfulness: optionalNumber(row.helpfulness),
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
				await connection.run('INSERT INTO Comparisons.embeddingRuns(id, started, pollis, models, questions, passages, benchmark) VALUES ($id, $started, $pollis, $models, $questions, $passages, $benchmark::VARCHAR)', {
					id: summary.id, started: summary.started, pollis: summary.pollis, models: JSON.stringify(summary.models), questions: summary.questions, passages: summary.passages, benchmark: summary.benchmark ?? null,
				});
				for (const [question, item] of run.questions.entries()) {
					await connection.run('INSERT INTO Comparisons.embeddingQuestions VALUES ($run, $question, $source, $context, $text, $answer)', {
						run: summary.id, question, source: item.source, context: item.context, text: item.question, answer: item.answer,
					});
				}
				for (const found of run.found) {
					await connection.run('INSERT INTO Comparisons.embeddingFound(run, question, model, hybrid, meaning, query_ms, search_ms, ndcg, recall) VALUES ($run, $question, $model, $hybrid::INTEGER, $meaning::INTEGER, $queryMs, $searchMs, $ndcg::DOUBLE, $recall::DOUBLE)', {
						run: summary.id, question: found.question, model: found.model, hybrid: found.hybrid ?? null, meaning: found.meaning ?? null, queryMs: found.queryMs, searchMs: found.searchMs, ndcg: found.ndcg ?? null, recall: found.recall ?? null,
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
			...(typeof row.benchmark === 'string' ? { benchmark: row.benchmark } : {}),
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
				.map(found => ({ question: Number(found.question), model: String(found.model), hybrid: optionalNumber(found.hybrid), meaning: optionalNumber(found.meaning), queryMs: Number(found.query_ms), searchMs: Number(found.search_ms), ndcg: optionalNumber(found.ndcg), recall: optionalNumber(found.recall) }));
			return { summary: this.embeddingSummaryOf(row), questions, found };
		});
	}

	async deleteEmbeddingRun(id: string): Promise<void> {
		await this.withComparisons(connection => this.removeEmbeddingRun(connection, id));
	}

	/** Takes away the run `run` of Evaluate Reranking Models from its tables. */
	private async removeRerankRun(connection: DuckDBConnection, run: string): Promise<void> {
		for (const table of ['rerankRuns', 'rerankQuestions', 'rerankFound']) {
			await connection.run(`DELETE FROM Comparisons.${table} WHERE ${table === 'rerankRuns' ? 'id' : 'run'} = $run`, { run });
		}
	}

	async saveRerankRun(run: IRerankRun): Promise<void> {
		await this.withComparisons(async connection => {
			const { summary } = run;
			await connection.run('BEGIN TRANSACTION');
			try {
				await this.removeRerankRun(connection, summary.id);
				await connection.run('INSERT INTO Comparisons.rerankRuns(id, started, pollis, models, questions, found, kept, embedder, benchmark) VALUES ($id, $started, $pollis, $models, $questions, $found, $kept, $embedder, $benchmark::VARCHAR)', {
					id: summary.id, started: summary.started, pollis: summary.pollis, models: JSON.stringify(summary.models), questions: summary.questions, found: summary.found, kept: summary.kept, embedder: summary.embedder, benchmark: summary.benchmark ?? null,
				});
				for (const [question, item] of run.questions.entries()) {
					await connection.run('INSERT INTO Comparisons.rerankQuestions VALUES ($run, $question, $source, $context, $text, $answer)', {
						run: summary.id, question, source: item.source, context: item.context, text: item.question, answer: item.answer,
					});
				}
				for (const found of run.found) {
					await connection.run('INSERT INTO Comparisons.rerankFound(run, question, model, place, ms, ndcg, recall, among) VALUES ($run, $question, $model, $place::INTEGER, $ms::DOUBLE, $ndcg::DOUBLE, $recall::DOUBLE, $among::DOUBLE)', {
						run: summary.id, question: found.question, model: found.model, place: found.place ?? null, ms: found.ms ?? null, ndcg: found.ndcg ?? null, recall: found.recall ?? null, among: found.among ?? null,
					});
				}
				await connection.run('COMMIT');
			} catch (err) {
				await connection.run('ROLLBACK');
				throw err;
			}
		});
	}

	private rerankSummaryOf(row: Row): IRerankRunSummary {
		return {
			id: String(row.id),
			started: Number(row.started),
			pollis: String(row.pollis ?? ''),
			models: JSON.parse(String(row.models ?? '[]')),
			questions: Number(row.questions),
			found: Number(row.found),
			kept: Number(row.kept),
			embedder: String(row.embedder ?? ''),
			...(typeof row.benchmark === 'string' ? { benchmark: row.benchmark } : {}),
		};
	}

	async rerankRuns(): Promise<readonly IRerankRunSummary[]> {
		return this.withComparisons(async connection =>
			(await connection.runAndReadAll('SELECT * FROM Comparisons.rerankRuns ORDER BY started DESC')).getRowObjectsJson().map(row => this.rerankSummaryOf(row)));
	}

	async loadRerankRun(id: string): Promise<IRerankRun | undefined> {
		return this.withComparisons(async connection => {
			const row = (await connection.runAndReadAll('SELECT * FROM Comparisons.rerankRuns WHERE id = $id', { id })).getRowObjectsJson()[0];
			if (!row) {
				return undefined;
			}
			const questions = (await connection.runAndReadAll('SELECT * FROM Comparisons.rerankQuestions WHERE run = $id ORDER BY question', { id })).getRowObjectsJson()
				.map(question => ({ source: String(question.source), context: String(question.context), question: String(question.text), answer: String(question.answer) }));
			const found = (await connection.runAndReadAll('SELECT * FROM Comparisons.rerankFound WHERE run = $id ORDER BY question', { id })).getRowObjectsJson()
				.map(found => ({ question: Number(found.question), model: String(found.model), place: optionalNumber(found.place), ms: optionalNumber(found.ms), ndcg: optionalNumber(found.ndcg), recall: optionalNumber(found.recall), among: optionalNumber(found.among) }));
			return { summary: this.rerankSummaryOf(row), questions, found };
		});
	}

	async deleteRerankRun(id: string): Promise<void> {
		await this.withComparisons(connection => this.removeRerankRun(connection, id));
	}

	/** Takes away the run `run` of Benchmark Answering Models from its tables. */
	private async removeBenchmarkRun(connection: DuckDBConnection, run: string): Promise<void> {
		for (const table of ['benchmarkRuns', 'benchmarkModels', 'benchmarkAnswers']) {
			await connection.run(`DELETE FROM Comparisons.${table} WHERE ${table === 'benchmarkRuns' ? 'id' : 'run'} = $run`, { run });
		}
	}

	async importBenchmarkRuns(ids?: readonly string[]): Promise<void> {
		let names: string[];
		try {
			names = await fs.promises.readdir(BENCHMARK_RUNS);
		} catch {
			return;
		}
		// The runs of the folder only: an id names files there, and nothing outside it
		const candidates = names.filter(name => name.endsWith('.json')).map(name => name.slice(0, -'.json'.length)).filter(id => !ids || ids.includes(id));
		const runs: { run: IBenchmarkRun; answers: IBenchmarkAnswer[]; files: string[] }[] = [];
		for (const id of candidates) {
			const files = [join(BENCHMARK_RUNS, `${id}.json`), join(BENCHMARK_RUNS, `${id}.jsonl`)];
			let run: IBenchmarkRun;
			try {
				run = JSON.parse(await fs.promises.readFile(files[0], 'utf8'));
			} catch {
				continue;
			}
			if (run.id !== id) {
				continue;
			}
			// A run not marked ended may still be going, in a notebook or another window
			if (!ids && run.ended === undefined) {
				const changed = await Promise.all(files.map(file => fs.promises.stat(file).then(stat => stat.mtimeMs, () => 0)));
				if (Date.now() - Math.max(...changed) < BENCHMARK_IDLE_MS) {
					continue;
				}
			}
			const answers: IBenchmarkAnswer[] = [];
			for (const line of (await fs.promises.readFile(files[1], 'utf8').catch(() => '')).split('\n')) {
				if (line.trim()) {
					try {
						answers.push(JSON.parse(line));
					} catch {
						// A line cut off when the run was stopped
					}
				}
			}
			runs.push({ run, answers, files });
		}
		if (!runs.length) {
			return;
		}
		await this.withComparisons(async connection => {
			for (const { run, answers } of runs) {
				await connection.run('BEGIN TRANSACTION');
				try {
					await this.removeBenchmarkRun(connection, run.id);
					await connection.run('INSERT INTO Comparisons.benchmarkRuns VALUES ($id, $started, $ended::BIGINT, $pollis, $benchmark, $revision::VARCHAR, $shots, $reasoning, $thinking, $maxTokens, $seed, $allocation, $size, $strata, $questions)', {
						id: run.id, started: run.started, ended: run.ended ?? null, pollis: run.pollis ?? '', benchmark: run.benchmark, revision: run.revision ?? null,
						shots: run.settings.shots, reasoning: run.settings.reasoning, thinking: run.settings.thinking, maxTokens: run.settings.maxTokens,
						seed: run.sample.seed, allocation: run.sample.allocation, size: run.sample.size, strata: JSON.stringify(run.sample.strata), questions: JSON.stringify(run.sample.questions),
					});
					for (const [place, model] of run.models.entries()) {
						const figures = run.figures?.find(candidate => candidate.value === model.value);
						await connection.run('INSERT INTO Comparisons.benchmarkModels VALUES ($run, $place, $model, $label, $size::VARCHAR, $started::BIGINT, $ended::BIGINT, $freeBefore::BIGINT, $lowestFree::BIGINT, $error::VARCHAR, $questions::INTEGER, $failed::INTEGER, $score::DOUBLE, $half::DOUBLE, $right::INTEGER, $byChance::DOUBLE, $strata::VARCHAR, $unread::INTEGER, $cutOff::INTEGER, $firstTokenMs::DOUBLE, $readingSpeed::DOUBLE, $writingSpeed::DOUBLE, $seconds::DOUBLE, $writtenTokens::DOUBLE, $memory::BIGINT)', {
							run: run.id, place: place + 1, model: model.value, label: model.label, size: model.size ?? null, started: model.started ?? null, ended: model.ended ?? null,
							freeBefore: model.freeBefore ?? null, lowestFree: model.lowestFree ?? null, error: model.error ?? figures?.error ?? null,
							questions: figures?.questions ?? null, failed: figures?.failed ?? null, score: figures?.score ?? null, half: figures?.half ?? null, right: figures?.right ?? null,
							byChance: figures?.byChance ?? null, strata: figures ? JSON.stringify(figures.strata) : null, unread: figures?.unread ?? null, cutOff: figures?.cutOff ?? null,
							firstTokenMs: figures?.firstTokenMs ?? null, readingSpeed: figures?.readingSpeed ?? null, writingSpeed: figures?.writingSpeed ?? null,
							seconds: figures?.seconds ?? null, writtenTokens: figures?.writtenTokens ?? null, memory: figures?.memory ?? null,
						});
					}
					for (const [place, answer] of answers.entries()) {
						await connection.run('INSERT INTO Comparisons.benchmarkAnswers VALUES ($run, $place, $model, $question, $stratum, $extracted::VARCHAR, $correct::BOOLEAN, $error::VARCHAR, $text::VARCHAR, $finish::VARCHAR, $seconds::DOUBLE, $promptTokens::INTEGER, $writtenTokens::INTEGER, $promptMs::DOUBLE, $readingSpeed::DOUBLE, $writingSpeed::DOUBLE, $tokenMs::DOUBLE)', {
							run: run.id, place: place + 1, model: answer.model, question: answer.id, stratum: answer.stratum,
							// The answer as read: a letter, or a number for a benchmark whose answers are numbers
							extracted: answer.extracted === null || answer.extracted === undefined ? null : String(answer.extracted),
							correct: answer.correct ?? null, error: answer.error ?? null, text: answer.text ?? null, finish: answer.finish ?? null, seconds: answer.seconds ?? null,
							promptTokens: answer.promptTokens ?? null, writtenTokens: answer.writtenTokens ?? null, promptMs: answer.promptMs ?? null,
							readingSpeed: answer.readingSpeed ?? null, writingSpeed: answer.writingSpeed ?? null, tokenMs: answer.tokenMs ?? null,
						});
					}
					await connection.run('COMMIT');
				} catch (err) {
					await connection.run('ROLLBACK');
					throw err;
				}
			}
		});
		// The files once the run is kept in Comparisons.duckdb
		for (const { files } of runs) {
			for (const file of files) {
				await fs.promises.rm(file, { force: true });
			}
		}
	}

	/** The runs of Benchmark Answering Models whose id is `id`, or all of them, the latest first, each with its models and their figures. */
	private async readBenchmarkRuns(connection: DuckDBConnection, id?: string): Promise<IBenchmarkRun[]> {
		const where = id === undefined ? '' : 'WHERE id = $id';
		const values = id === undefined ? undefined : { id };
		const runs = (await connection.runAndReadAll(`SELECT * FROM Comparisons.benchmarkRuns ${where} ORDER BY started DESC`, values)).getRowObjectsJson();
		const models = new Map<string, Row[]>();
		for (const model of (await connection.runAndReadAll(`SELECT * FROM Comparisons.benchmarkModels WHERE run IN (SELECT id FROM Comparisons.benchmarkRuns ${where}) ORDER BY place`, values)).getRowObjectsJson()) {
			models.set(String(model.run), [...models.get(String(model.run)) ?? [], model]);
		}
		const text = (value: unknown) => value === null || value === undefined ? undefined : String(value);
		return runs.map(row => {
			const mine = models.get(String(row.id)) ?? [];
			return {
				id: String(row.id),
				started: Number(row.started),
				ended: optionalNumber(row.ended),
				pollis: String(row.pollis ?? ''),
				benchmark: String(row.benchmark),
				revision: text(row.revision),
				settings: { shots: Number(row.shots), reasoning: Boolean(row.reasoning), thinking: Boolean(row.thinking), maxTokens: Number(row.max_tokens) },
				sample: { seed: Number(row.seed), allocation: String(row.allocation), size: Number(row.size), strata: JSON.parse(String(row.strata ?? '[]')), questions: JSON.parse(String(row.questions ?? '[]')) },
				models: mine.map(model => ({
					value: String(model.model), label: String(model.label), size: text(model.size), started: optionalNumber(model.started), ended: optionalNumber(model.ended),
					freeBefore: optionalNumber(model.free_before), lowestFree: optionalNumber(model.lowest_free), error: text(model.error),
				})),
				figures: mine.filter(model => model.questions !== null).map(model => ({
					value: String(model.model), label: String(model.label), questions: Number(model.questions), failed: Number(model.failed),
					score: numberOrNull(model.score), half: numberOrNull(model.half), right: Number(model.right_answers), byChance: numberOrNull(model.by_chance),
					strata: JSON.parse(String(model.strata ?? '[]')), unread: Number(model.unread), cutOff: Number(model.cut_off),
					firstTokenMs: numberOrNull(model.first_token_ms), readingSpeed: numberOrNull(model.reading_speed), writingSpeed: numberOrNull(model.writing_speed),
					seconds: numberOrNull(model.seconds), writtenTokens: numberOrNull(model.written_tokens), memory: numberOrNull(model.memory), error: text(model.error) ?? null,
				})),
			};
		});
	}

	async benchmarkRuns(): Promise<readonly IBenchmarkRun[]> {
		return this.withComparisons(connection => this.readBenchmarkRuns(connection));
	}

	async loadBenchmarkRun(id: string): Promise<IBenchmarkRun | undefined> {
		return this.withComparisons(async connection => (await this.readBenchmarkRuns(connection, id))[0]);
	}

	async loadBenchmarkAnswers(id: string): Promise<readonly IBenchmarkAnswer[]> {
		return this.withComparisons(async connection =>
			(await connection.runAndReadAll('SELECT * FROM Comparisons.benchmarkAnswers WHERE run = $id ORDER BY place', { id })).getRowObjectsJson().map(row => ({
				model: String(row.model),
				id: String(row.question),
				stratum: String(row.stratum ?? ''),
				extracted: row.extracted === null ? null : String(row.extracted),
				correct: row.correct === null ? undefined : Boolean(row.correct),
				text: row.text === null ? undefined : String(row.text),
				finish: row.finish === null ? undefined : String(row.finish),
				error: row.error === null ? undefined : String(row.error),
				seconds: optionalNumber(row.seconds),
				promptTokens: optionalNumber(row.prompt_tokens),
				writtenTokens: optionalNumber(row.written_tokens),
				promptMs: optionalNumber(row.prompt_ms),
				readingSpeed: optionalNumber(row.reading_speed),
				writingSpeed: optionalNumber(row.writing_speed),
				tokenMs: optionalNumber(row.token_ms),
			})));
	}

	async deleteBenchmarkRun(id: string): Promise<void> {
		await this.withComparisons(connection => this.removeBenchmarkRun(connection, id));
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
