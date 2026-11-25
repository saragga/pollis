/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The search of Ask Pollis, in a utility process of its own (see ../electron-browser/askPollisService.ts), on the engine
// of the duckdb> terminal (@duckdb/node-api), with the fts extension: PollisDocuments, which ask_index.jl of the Julia
// extension makes, is attached for each search and let go after, so that the next index can take its place, on Windows
// too. A question is routed to the collections whose nearest passage is nearest it (Pollis, the Julia Manual, the
// DuckDB Manual), unless
// it names them; each is searched by words (BM25) and by meaning (cosine distance), the two lists merged by
// reciprocal rank fusion; with two or more, the nearest gives most of the passages. The answer is written here too, by
// the chat model's server or a cloud model's API, its text sent as it comes: the renderer may not reach a server of
// this computer. The runs of Evaluate Answering Models are kept here too, in ModelEvaluations.duckdb, attached the same way, so that
// two windows can each keep theirs, and the passages found for each question with a search stamp, which a run with the same stamp reuses.
// Evaluate Embedding Models embeds the passages here, into the cache of embeddings ask_index.jl takes them from, and
// searches the questions of a test set with each model's embeddings as Ask Pollis would; its runs are kept in ModelEvaluations.duckdb too.
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
import { AskOptionalSource, AskPollisSource, AskTopic, ASK_ARTICLES, ASK_NEAREST_SHARE, ASK_OPTIONAL_SOURCES, ASK_PACKAGE_APIS, ASK_PASSAGES, ASK_SOURCE_COLLECTION, askShares, IAskPollisChatEnd, IAskPollisMessage, ICompareRun, ICompareRunSummary, IAskPollisChatRequest, IAskPollisChatText, IAskPollisEvalItem, IAskPollisFound, IAskPollisIndex, IAskPollisIndexedDocument, IAskPollisIndexRequest, IAskPollisIndexStatus, IAskPollisPanel, IAskPollisPanelShare, IAskPollisPassage, IAskPassageMatch, IAskPollisReranked, IAskPollisSearchResult, IAskPollisTimings, IAskTopicCounts, IBenchmarkAnswer, IBenchmarkRun, IEmbeddingDone, IEmbeddingEvaluated, IEmbeddingEvaluation, IEmbeddingFound, IEmbeddingProgress, IEmbeddingRequest, IEmbeddingRun, IEmbeddingRunSummary, IRerankRun, IRerankRunSummary, IRetrievalEmbeddingRequest, IRetrievalEvaluation, IRetrievalQuery, IRetrievalRerankDone, IRetrievalRerankRequest, IRetrievalReranked, IRetrievalScore, RETRIEVAL_BENCHMARKS, RETRIEVAL_CANDIDATES, RETRIEVAL_CUT } from '../common/askPollis.js';
import { DUCKDB_FUNCTION_FORMS_SQL, duckdbFunctionKinds, IDuckDBFunctionForm, IDuckDBFunctionKind } from '../../databases/common/duckdbHelp.js';

const DATABASE = join(os.homedir(), '.pollis', 'documents', 'PollisDocuments.duckdb');
/** The folder of the indexes of the collections of Retrieval-Augmented Generation and of the Knowledge Base. */
const COLLECTIONS_FOLDER = join(os.homedir(), '.pollis', 'rag');
/** The embeddings made, by the model and the text it was given, as ask_index.jl keeps them. */
const EMBEDDINGS = join(os.homedir(), '.pollis', 'documents', 'embeddings.duckdb');
/** The passages embedded a request, as ask_index.jl does. */
const BATCH = 32;
/** The runs of the Evaluate pages and of the two Benchmarks pages. */
const MODEL_EVALUATIONS = join(os.homedir(), '.pollis', 'ask', 'ModelEvaluations.duckdb');
/**
 * The copy of MODEL_EVALUATIONS that the Databases view and the duckdb> terminal read, as the database Model Evaluations of the
 * activity of Pollis: a reader of the copy never holds the file Pollis writes, which DuckDB lets no other process open
 * while it is written.
 */
const MODEL_EVALUATIONS_COPY = join(os.homedir(), '.pollis', 'databases', 'ModelEvaluations.duckdb');
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

/** The collections Auto leaves out, as a run keeps them in its settings, a list; none when it is not one. */
function storedSources(kept: unknown): AskOptionalSource[] {
	return Array.isArray(kept) ? (Object.keys(ASK_OPTIONAL_SOURCES) as AskOptionalSource[]).filter(source => kept.includes(source)) : [];
}

function sqlString(text: string): string {
	return `'${text.replace(/'/g, `''`)}'`;
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
 * title; a PDF's do not have its title. The collections Auto leaves out are taken only when `sources` names them: the
 * Package APIs, some twenty thousand docstrings to embed for each model, and the Articles.
 */
function inputsSql(sources: readonly AskOptionalSource[] | undefined): string {
	return `SELECT id, sha256($model || chr(10) || input) AS key, input FROM (
	SELECT p.id, left(replace(replace($prefix, '{title}', CASE WHEN d.kind IN ('wiki', 'markdown', 'article') THEN p.heading ELSE concat_ws(' ' || chr(8250) || ' ', d.title, nullif(p.heading, '')) END), '{text}', p.text), ${EMBEDDED_CHARACTERS}) AS input
	FROM passages p JOIN documents d ON p.document = d.id WHERE ${leftOutSql(sources)})`;
}

/** What keeps a passage of document `d` unless it is of a collection Auto leaves out that `sources` does not name. */
function leftOutSql(sources: readonly AskOptionalSource[] | undefined): string {
	const left = (Object.keys(ASK_OPTIONAL_SOURCES) as AskOptionalSource[]).filter(source => !sources?.includes(source)).map(source => sqlString(ASK_OPTIONAL_SOURCES[source].kind));
	return left.length ? `d.kind NOT IN (${left.join(', ')})` : 'true';
}

/** The collections Auto leaves out that `sources` names. */
function collectionsOf(sources: readonly AskOptionalSource[] | undefined): string[] {
	return (sources ?? []).map(source => ASK_OPTIONAL_SOURCES[source].collection);
}

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
	/** Without `collections`, those searched beside the ones the question is routed to. */
	readonly alsoCollections?: readonly string[];
	/** The only sources searched of their collections, the other collections whole. */
	readonly sources?: readonly AskPollisSource[];
	/** A table of the embeddings to search with, in place of the index's. */
	readonly vectors?: string;
	/** The panel asked in, whose passages are the first share. */
	readonly panel?: IAskPollisPanel;
	/** The share of the passages from the panel's own: ASK_NEAREST_SHARE when not given. */
	readonly panelShare?: number | IAskPollisPanelShare;
}


/** The pages of Base and the standard library in Julia's documentation, by the address of a passage `p`. */
const JULIA_LIBRARY_SQL = `regexp_matches(coalesce(p.anchor, ''), '^(base|stdlib)/')`;

/** The pages of functions in DuckDB's documentation, by the address of a passage `p` on duckdb.org. */
const DUCKDB_FUNCTIONS_SQL = `regexp_matches(coalesce(p.anchor, ''), '/sql/functions/')`;

/** The passages of each source, by their document `d` and the passage `p`. */
const SOURCE_SQL: Record<AskPollisSource, string> = {
	pollisTopics: `d.kind = 'document' AND coalesce(d.toolbox, '') = ''`,
	packageVignettes: `d.kind = 'vignette'`,
	toolboxOverviews: `d.kind = 'document' AND coalesce(d.toolbox, '') <> ''`,
	panelsWikis: `d.kind = 'wiki'`,
	juliaManual: `d.kind = 'julia' AND NOT ${JULIA_LIBRARY_SQL}`,
	juliaLibrary: `d.kind = 'julia' AND ${JULIA_LIBRARY_SQL}`,
	duckdbManual: `d.kind = 'duckdb' AND NOT ${DUCKDB_FUNCTIONS_SQL}`,
	duckdbFunctions: `d.kind = 'duckdb' AND ${DUCKDB_FUNCTIONS_SQL}`,
};

/** What keeps a search to the sources ticked, the collections with none ticked being searched whole. */
function sourcesSql(sources: readonly AskPollisSource[] | undefined): string {
	if (!sources?.length) {
		return '';
	}
	const collections = [...new Set(sources.map(source => ASK_SOURCE_COLLECTION[source]))];
	return ` AND (d.collection NOT IN (${collections.map(sqlString).join(', ')}) OR ${sources.map(source => `(${SOURCE_SQL[source]})`).join(' OR ')})`;
}

/** The passages of `panel`: its wikis, titled after it, the vignettes of its packages, titled `GLM.jl`, and the abstracts of the works it cites. */
function panelSql(panel: IAskPollisPanel): string {
	const own = [`(d.kind = 'wiki' AND d.title = ${sqlString(panel.title)})`];
	if (panel.packages.length) {
		own.push(`(d.kind = 'vignette' AND d.title IN (${panel.packages.map(sqlString).join(', ')}))`);
	}
	// The abstracts of the works it cites, each in a file named after its key
	if (panel.references?.length) {
		own.push(`(d.kind = 'article' AND regexp_extract(replace(d.source, '\\', '/'), '([^/]+)\\.md$', 1) IN (${panel.references.map(sqlString).join(', ')}))`);
	}
	return own.length > 1 ? `(${own.join(' OR ')})` : own[0];
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

/**
 * The topic of a passage by its document `d`, as AskTopic: the Julia Manual, Pollis' own documents, the Articles, the
 * Package APIs, and the rest (the wikis, the vignettes of the toolboxes); the DuckDB Manual, which Make Questions does
 * not ask about, has its own.
 */
const TOPIC = `CASE WHEN d.kind = 'julia' THEN 'julia' WHEN d.kind = 'duckdb' THEN 'duckdb' WHEN d.kind = 'document' AND coalesce(d.toolbox, '') = '' THEN 'pollis' WHEN d.kind = 'article' THEN 'articles' WHEN d.kind = 'api' THEN 'packageApis' ELSE 'panels' END`;

/**
 * The tables of ModelEvaluations.duckdb, the same for every kind of model: a run, its models (evaluated, judges, the
 * embedder of a run of rerankers), the cases it asked about, what each model gave for each case, and the scores, one
 * a row; and the passages found for a question with a search stamp, those of the latest stamp only.
 */
const MODEL_EVALUATIONS_TABLES = [
	'CREATE TABLE IF NOT EXISTS ModelEvaluations.runs(id VARCHAR PRIMARY KEY, kind VARCHAR, source VARCHAR, started BIGINT, ended BIGINT, pollis VARCHAR, benchmark VARCHAR, revision VARCHAR, seed BIGINT, repeats INTEGER, folds INTEGER, settings JSON)',
	'CREATE TABLE IF NOT EXISTS ModelEvaluations.models(run VARCHAR, model VARCHAR, role VARCHAR, place INTEGER, label VARCHAR, class VARCHAR, size VARCHAR, specification VARCHAR, settings JSON, started BIGINT, ended BIGINT, memory BIGINT, free_before BIGINT, lowest_free BIGINT, error VARCHAR)',
	'CREATE TABLE IF NOT EXISTS ModelEvaluations.cases(run VARCHAR, "case" VARCHAR, source VARCHAR, ref VARCHAR, stratum VARCHAR, context VARCHAR, input_text VARCHAR, choices JSON, explanation VARCHAR, target_text VARCHAR, target_label VARCHAR, target_value DOUBLE, passages JSON)',
	'CREATE TABLE IF NOT EXISTS ModelEvaluations.outputs(run VARCHAR, model VARCHAR, "case" VARCHAR, repeat INTEGER, fold INTEGER, output_text VARCHAR, output_label VARCHAR, output_value DOUBLE, error VARCHAR, finish VARCHAR, seconds DOUBLE, first_token_ms DOUBLE, reading_ms DOUBLE, tokens_read INTEGER, tokens_written INTEGER, reading_speed DOUBLE, writing_speed DOUBLE)',
	'CREATE TABLE IF NOT EXISTS ModelEvaluations.scores(run VARCHAR, model VARCHAR, "case" VARCHAR, repeat INTEGER, fold INTEGER, stratum VARCHAR, judge VARCHAR, metric VARCHAR, value DOUBLE, note VARCHAR, error VARCHAR)',
	'CREATE TABLE IF NOT EXISTS ModelEvaluations.searchCache(stamp VARCHAR, question VARCHAR, passages JSON, PRIMARY KEY(stamp, question))',
];

/** What the Databases view shows of each table of ModelEvaluations.duckdb, written when the tables are made. */
const MODEL_EVALUATIONS_COMMENTS: Readonly<Record<string, string>> = {
	runs: 'One row per run: the kind of models it evaluated (answering, embedding, reranking, benchmark), the page that made it, when it started and ended, the version of Pollis, the benchmark, its revision and seed, the repeats and folds, and its other settings as JSON.',
	models: 'Each model of a run, by its role (evaluated, judge, embedder) and its place in the run: its label, class, size, settings as JSON, when it started and ended, the memory it took and the least memory free while it ran, and why it failed.',
	cases: 'The cases of a run: the source, context, stratum and input text of each question, the options of a closed question as JSON, the target (the right answer, as a text, the letter of an option or a value), and the passages given, as JSON.',
	outputs: 'What each model gave for each case, repeat and fold: its text, the option it chose as a letter, or a value, why it failed, how it finished, and its timings and tokens.',
	scores: 'The scores, one per row, each a metric and its value: a judge\'s rubric with its rationale in note, a measure of an output, or, with no case, a figure of a model over the whole run, by stratum where it has one.',
	searchCache: 'The passages found for each question with a search stamp, those of the latest stamp only, which a run with the same stamp reuses.',
};

/** The columns of each table of ModelEvaluations.duckdb that its rows are written with, in their order. */
const MODEL_EVALUATIONS_COLUMNS = {
	runs: ['id', 'kind', 'source', 'started', 'ended', 'pollis', 'benchmark', 'revision', 'seed', 'repeats', 'folds', 'settings'],
	models: ['run', 'model', 'role', 'place', 'label', 'class', 'size', 'specification', 'settings', 'started', 'ended', 'memory', 'free_before', 'lowest_free', 'error'],
	cases: ['run', 'case', 'source', 'ref', 'stratum', 'context', 'input_text', 'choices', 'explanation', 'target_text', 'target_label', 'target_value', 'passages'],
	outputs: ['run', 'model', 'case', 'repeat', 'fold', 'output_text', 'output_label', 'output_value', 'error', 'finish', 'seconds', 'first_token_ms', 'reading_ms', 'tokens_read', 'tokens_written', 'reading_speed', 'writing_speed'],
	scores: ['run', 'model', 'case', 'repeat', 'fold', 'stratum', 'judge', 'metric', 'value', 'note', 'error'],
} as const;

type EvaluationTable = keyof typeof MODEL_EVALUATIONS_COLUMNS;
/** A row to write into a table of ModelEvaluations.duckdb, by its columns: a column left out is NULL. */
type EvaluationRow<T extends EvaluationTable> = { readonly [column in typeof MODEL_EVALUATIONS_COLUMNS[T][number]]?: string | number | boolean | null };

/** The kinds of run of ModelEvaluations.runs. */
type EvaluationKind = 'answering' | 'embedding' | 'reranking' | 'benchmark';

/** The rubric of a judge, each criterion a metric of ModelEvaluations.scores; `final`, with the rationale, is its last row. */
const RUBRIC = ['relevance', 'completeness', 'clarity', 'consistency', 'helpfulness'] as const;

/** The figures of a model over a run of Benchmark Answering Models, each a metric of ModelEvaluations.scores with no case. */
const BENCHMARK_FIGURES = [
	['questions', 'questions'], ['failed', 'failed'], ['score', 'score'], ['half', 'half'], ['right', 'right_answers'], ['byChance', 'by_chance'],
	['unread', 'unread'], ['cutOff', 'cut_off'], ['firstTokenMs', 'first_token_ms'], ['readingSpeed', 'reading_speed'], ['writingSpeed', 'writing_speed'],
	['seconds', 'seconds'], ['writtenTokens', 'written_tokens'],
] as const;

/** The fields of a model of a run kept in the columns of ModelEvaluations.models; the others are kept in its settings. */
const MODEL_FIELDS = new Set(['value', 'label', 'size', 'memory', 'error', 'started', 'ended', 'freeBefore', 'lowestFree']);

/** A model of a run, as each kind has it. */
interface IEvaluatedModel {
	readonly value: string;
	readonly label: string;
	readonly size?: string;
	readonly memory?: number;
	readonly error?: string;
	readonly started?: number;
	readonly ended?: number;
	readonly freeBefore?: number;
	readonly lowestFree?: number;
}

/** The row of ModelEvaluations.models of `model`, in its `role` and at its `place` from 1, its fields without a column of their own in its settings. */
function modelRow(run: string, model: IEvaluatedModel, role: string, modelClass: string, place: number): EvaluationRow<'models'> {
	const settings = Object.fromEntries(Object.entries(model).filter(([field, value]) => !MODEL_FIELDS.has(field) && value !== undefined));
	return {
		run, model: model.value, role, place, label: model.label, class: modelClass, size: model.size ?? null,
		settings: Object.keys(settings).length ? JSON.stringify(settings) : null,
		started: model.started ?? null, ended: model.ended ?? null, memory: model.memory ?? null, free_before: model.freeBefore ?? null, lowest_free: model.lowestFree ?? null, error: model.error ?? null,
	};
}

/** The fields of a model read back from its row of ModelEvaluations.models, those of its columns that are set. */
function storedModel(row: Row): IEvaluatedModel {
	return {
		value: String(row.model),
		label: String(row.label ?? row.model),
		...(row.size === null ? {} : { size: String(row.size) }),
		...(row.memory === null ? {} : { memory: Number(row.memory) }),
		...(row.error === null ? {} : { error: String(row.error) }),
		...(row.started === null ? {} : { started: Number(row.started) }),
		...(row.ended === null ? {} : { ended: Number(row.ended) }),
		...(row.free_before === null ? {} : { freeBefore: Number(row.free_before) }),
		...(row.lowest_free === null ? {} : { lowestFree: Number(row.lowest_free) }),
	};
}

/** The settings of a run or a model, as JSON kept in its column `settings`; none when it has none or they cannot be read. */
function storedSettings(row: Row): Readonly<Record<string, unknown>> {
	try {
		const settings: unknown = typeof row.settings === 'string' ? JSON.parse(row.settings) : undefined;
		return settings && typeof settings === 'object' && !Array.isArray(settings) ? settings as Record<string, unknown> : {};
	} catch {
		return {};
	}
}

/** The option of a closed question at `index`, from 0, as ModelEvaluations keeps it: A, B, C and on. */
function choiceLetter(index: number): string {
	return String.fromCharCode(65 + index);
}

/** The place of the option `letter`, from 0; nothing for no letter. */
function choiceIndex(letter: unknown): number | undefined {
	return typeof letter === 'string' && letter ? letter.charCodeAt(0) - 65 : undefined;
}

/** The id of an answer of a run of Evaluate Answering Models read back, from its question, model and repeat, which are its key. */
function answerId(question: unknown, model: unknown, repeat: unknown): string {
	return `${question}:${repeat}:${model}`;
}

/** The metrics of a row of a found list of a run of embedding models or rerankers, by their names in ModelEvaluations.scores. */
const EMBEDDING_METRICS = [['hybrid', 'hybrid_rank'], ['meaning', 'meaning_rank'], ['queryMs', 'query_ms'], ['searchMs', 'search_ms'], ['ndcg', 'ndcg@10'], ['recall', 'recall@10']] as const;
const RERANK_METRICS = [['place', 'place'], ['ms', 'rerank_ms'], ['ndcg', 'ndcg@10'], ['recall', 'recall@10'], ['among', 'bm25_share']] as const;

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

	async collectionFiles(): Promise<readonly string[]> {
		try {
			return (await fs.promises.readdir(COLLECTIONS_FOLDER)).filter(name => name.endsWith('.duckdb')).sort().map(name => join(COLLECTIONS_FOLDER, name));
		} catch {
			return [];
		}
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
			const { passages, searched, panelMissing, distance } = await this.findPassages(connection, status.collections, {
				question: request.question, vector, dimensions: vector ? status.dimensions : 0, count: Math.max(1, request.passages ?? ASK_PASSAGES), collections: request.collections, alsoCollections: request.alsoCollections, sources: request.sources, panel: request.panel, panelShare: request.panelShare,
			});
			const result: IAskPollisSearchResult = {
				passages,
				searched,
				collections: status.collections,
				...(vector ? {} : { wordsOnly: wordsOnly ?? (status.embedded ? 'otherModel' : 'notEmbedded') }),
				...(error && !vector ? { error } : {}),
				...(panelMissing ? { panelMissing } : {}),
				...(distance === undefined ? {} : { distance }),
			};
			return result;
		}, request.index?.file);
		return found ?? { passages: [], searched: [], collections: [], wordsOnly: 'notIndexed' };
	}

	/**
	 * The passages for `query`, from the collections of `all`: those named are searched, else the nearest and those almost
	 * as near, the Package APIs and the Articles never among them; and whether the panel asked in has no passages in the index.
	 */
	private async findPassages(connection: DuckDBConnection, all: readonly string[], query: IPassageQuery): Promise<{ passages: IAskPollisPassage[]; searched: string[]; panelMissing: boolean; distance?: number }> {
		const { vector, dimensions, vectors } = query;
		const also = query.collections ? [] : query.alsoCollections ?? [];
		let searched = query.collections?.filter(name => all.includes(name)) ?? all.filter(name => (name !== ASK_PACKAGE_APIS && name !== ASK_ARTICLES) || also.includes(name));
		let distance: number | undefined;
		if (vector) {
			const embedding = vectors ? 'v.embedding' : 'p.embedding';
			const distances = (await connection.runAndReadAll(`SELECT d.collection AS name, min(array_cosine_distance(${embedding}, $vector::FLOAT[${dimensions}])) AS distance FROM passages p JOIN documents d ON p.document = d.id${vectors ? ` JOIN ${vectors} v ON v.id = p.id` : ''} WHERE ${embedding} IS NOT NULL GROUP BY d.collection ORDER BY distance`, { vector })).getRowObjectsJson();
			const nearest = distances.filter(row => searched.includes(String(row.name)));
			const best = Number(nearest[0]?.distance ?? 0);
			distance = nearest.length ? best : undefined;
			searched = nearest.map(row => String(row.name)).filter((name, i) => !!query.collections || also.includes(name) || Number(nearest[i].distance) - best <= ROUTE_MARGIN);
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
			const share = Math.min(query.count, query.panelShare === undefined ? askShares(query.count, 2)[0] : Math.ceil(query.count * await this.panelShare(connection, query, panel, searched, source)));
			const rows = (await connection.runAndReadAll(searchSql(vector ? dimensions : 0, share, vectors, `${panel}${source}`), parameters)).getRowObjectsJson();
			passages.push(...rows.map(passageOf));
			where = `${where} AND NOT ${panel}`;
		}
		const counts = askShares(query.count - passages.length, searched.length);
		for (let i = 0; i < searched.length; i++) {
			const rows = (await connection.runAndReadAll(searchSql(vector ? dimensions : 0, counts[i], vectors, where), { ...parameters, collection: searched[i] })).getRowObjectsJson();
			passages.push(...rows.map(passageOf));
		}
		// The docstrings last: a small model given "No-U-Turn Sampler (NUTS) sampler." first may repeat that line and stop
		return { passages: [...passages.filter(passage => passage.kind !== 'api'), ...passages.filter(passage => passage.kind === 'api')], searched, panelMissing, distance };
	}

	/**
	 * The share of the passages from the panel's own (`panel`, its SQL condition) for `query`: a share `{ near, far }` is
	 * `near` when the panel's nearest passage is within ROUTE_MARGIN of the nearest among it and the collections
	 * `searched`, as a collection must be to be searched, and `near` when the search is by words only.
	 */
	private async panelShare(connection: DuckDBConnection, query: IPassageQuery, panel: string, searched: readonly string[], source: string): Promise<number> {
		const share = query.panelShare;
		if (typeof share === 'number' || share === undefined) {
			return share ?? ASK_NEAREST_SHARE;
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
			const rows = await this.withCache(async connection => (await connection.runAndReadAll(`SELECT key, any_value(input) AS input FROM (${inputsSql(request.sources)}) WHERE key NOT IN (SELECT key FROM cache.embeddings) GROUP BY key ORDER BY min(id)`, parameters)).getRowObjectsJson());
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
				const dimensions = Number((await connection.runAndReadAll(`SELECT max(len(c.embedding)) AS dimensions FROM (${inputsSql(request.sources)}) i JOIN cache.embeddings c ON c.key = i.key`, parameters)).getRowObjectsJson()[0]?.dimensions ?? 0);
				if (dimensions) {
					await connection.run(`CREATE OR REPLACE TABLE memory.candidate AS SELECT i.id, c.embedding::FLOAT[${dimensions}] AS embedding FROM (${inputsSql(request.sources)}) i JOIN cache.embeddings c ON c.key = i.key WHERE len(c.embedding) = ${dimensions}`, parameters);
				}
				const passages = Number((await connection.runAndReadAll(`SELECT count(*) AS passages FROM passages p JOIN documents d ON p.document = d.id WHERE ${leftOutSql(request.sources)}`)).getRowObjectsJson()[0]?.passages ?? 0);
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
						const given = await this.findPassages(connection, collections, { question: item.question, vector, dimensions, count: ASK_PASSAGES, vectors: 'memory.candidate', alsoCollections: collectionsOf(request.sources) });
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

	/** A database of its own for the help of DuckDB's functions, so that it never waits for a search. */
	private helpConnection: Promise<DuckDBConnection> | undefined;

	async duckdbFunction(name: string): Promise<readonly IDuckDBFunctionKind[]> {
		this.helpConnection ??= DuckDBInstance.create(':memory:', { autoinstall_known_extensions: 'false', autoload_known_extensions: 'false' }).then(instance => instance.connect());
		const forms = (await (await this.helpConnection).runAndReadAll(DUCKDB_FUNCTION_FORMS_SQL, [name])).getRowObjectsJson() as unknown as IDuckDBFunctionForm[];
		return duckdbFunctionKinds(forms);
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
				QUALIFY row_number() OVER (PARTITION BY topic ORDER BY turn, kind) <= CASE topic WHEN 'pollis' THEN ${count('pollis')} WHEN 'julia' THEN ${count('julia')} WHEN 'articles' THEN ${count('articles')} WHEN 'packageApis' THEN ${count('packageApis')} WHEN 'duckdb' THEN 0 ELSE ${count('panels')} END)
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
		const read = async (where: string) => (await connection.runAndReadAll(`SELECT p.text, any_value(${TOPIC}) AS topic FROM passages p JOIN documents d ON d.id = p.document WHERE true${where} GROUP BY p.text`))
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

	/** Runs `task` with ModelEvaluations.duckdb attached, its tables made the first time. */
	private withModelEvaluations<T>(task: (connection: DuckDBConnection) => Promise<T>): Promise<T> {
		return this.sequencer.queue(async () => {
			fs.mkdirSync(dirname(MODEL_EVALUATIONS), { recursive: true });
			const connection = await this.connect();
			await connection.run(`ATTACH ${sqlString(MODEL_EVALUATIONS)} AS ModelEvaluations`);
			try {
				const made = (await connection.runAndReadAll(`SELECT 1 FROM duckdb_tables() WHERE database_name = 'ModelEvaluations' AND table_name = 'runs'`)).getRowObjectsJson().length > 0;
				for (const table of MODEL_EVALUATIONS_TABLES) {
					await connection.run(table);
				}
				if (!made) {
					for (const [table, comment] of Object.entries(MODEL_EVALUATIONS_COMMENTS)) {
						await connection.run(`COMMENT ON TABLE ModelEvaluations.${table} IS ${sqlString(comment)}`);
					}
				}
				return await task(connection);
			} finally {
				// Its changes written into the file itself, then the file let go and copied
				await connection.run('CHECKPOINT ModelEvaluations').catch(() => undefined);
				await connection.run('DETACH ModelEvaluations');
				this.copyModelEvaluations();
			}
		});
	}

	/** The modification time of ModelEvaluations.duckdb when it was last copied; none before the first copy of this process. */
	private modelEvaluationsCopied: number | undefined;

	/**
	 * Copies ModelEvaluations.duckdb to MODEL_EVALUATIONS_COPY when it has changed since the last copy, or has not been
	 * copied by this process: written beside it, then renamed over it, so that a reader of the old copy keeps reading it
	 * whole. Where the old copy cannot be replaced while it is open, as on Windows, it stays until the next change.
	 */
	private copyModelEvaluations(): void {
		try {
			const changed = fs.statSync(MODEL_EVALUATIONS).mtimeMs;
			if (changed === this.modelEvaluationsCopied && fs.existsSync(MODEL_EVALUATIONS_COPY)) {
				return;
			}
			fs.mkdirSync(dirname(MODEL_EVALUATIONS_COPY), { recursive: true });
			const partial = `${MODEL_EVALUATIONS_COPY}.${process.pid}.partial`;
			fs.copyFileSync(MODEL_EVALUATIONS, partial);
			try {
				fs.renameSync(partial, MODEL_EVALUATIONS_COPY);
				this.modelEvaluationsCopied = changed;
			} finally {
				fs.rmSync(partial, { force: true });
			}
		} catch {
			// The runs stay in ModelEvaluations.duckdb; the copy is made again at the next change
		}
	}

	/** Writes `rows` into the table `table` of ModelEvaluations, by one statement prepared for them all. */
	private async insertRows<T extends EvaluationTable>(connection: DuckDBConnection, table: T, rows: readonly EvaluationRow<T>[]): Promise<void> {
		if (!rows.length) {
			return;
		}
		const columns: readonly string[] = MODEL_EVALUATIONS_COLUMNS[table];
		const statement = await connection.prepare(`INSERT INTO ModelEvaluations.${table} (${columns.map(column => `"${column}"`).join(', ')}) VALUES (${columns.map((_, index) => `$${index + 1}`).join(', ')})`);
		try {
			for (const row of rows) {
				const fields: Readonly<Record<string, string | number | boolean | null | undefined>> = row;
				statement.bind(columns.map(column => fields[column] ?? null));
				await statement.run();
			}
		} finally {
			statement.destroySync();
		}
	}

	/** Writes a run in one transaction, in place of the run of the same id, if any. */
	private async writeRun(connection: DuckDBConnection, run: EvaluationRow<'runs'> & { readonly id: string }, rows: { readonly models: EvaluationRow<'models'>[]; readonly cases: EvaluationRow<'cases'>[]; readonly outputs?: EvaluationRow<'outputs'>[]; readonly scores: EvaluationRow<'scores'>[] }): Promise<void> {
		await connection.run('BEGIN TRANSACTION');
		try {
			await this.removeRun(connection, run.id);
			await this.insertRows(connection, 'runs', [run]);
			await this.insertRows(connection, 'models', rows.models);
			await this.insertRows(connection, 'cases', rows.cases);
			await this.insertRows(connection, 'outputs', rows.outputs ?? []);
			await this.insertRows(connection, 'scores', rows.scores);
			await connection.run('COMMIT');
		} catch (err) {
			await connection.run('ROLLBACK');
			throw err;
		}
	}

	/** Takes away the run `run` from each table. */
	private async removeRun(connection: DuckDBConnection, run: string): Promise<void> {
		for (const table of ['runs', 'models', 'cases', 'outputs', 'scores']) {
			await connection.run(`DELETE FROM ModelEvaluations.${table} WHERE ${table === 'runs' ? 'id' : 'run'} = $run`, { run });
		}
	}

	/**
	 * The runs of the kind `kind`, the latest first, or the one whose id is `id`: each its row, the rows of its models
	 * in their order, and the number of its cases.
	 */
	private async readRuns(connection: DuckDBConnection, kind: EvaluationKind, id?: string): Promise<{ readonly row: Row; readonly models: readonly Row[]; readonly cases: number }[]> {
		const where = `WHERE kind = $kind${id === undefined ? '' : ' AND id = $id'}`;
		const values: Record<string, string> = id === undefined ? { kind } : { kind, id };
		const runs = (await connection.runAndReadAll(`SELECT r.*, (SELECT count(*) FROM ModelEvaluations.cases c WHERE c.run = r.id) AS cases FROM ModelEvaluations.runs r ${where} ORDER BY started DESC`, values)).getRowObjectsJson();
		const models = new Map<string, Row[]>();
		for (const model of (await connection.runAndReadAll(`SELECT * FROM ModelEvaluations.models WHERE run IN (SELECT id FROM ModelEvaluations.runs ${where}) ORDER BY place`, values)).getRowObjectsJson()) {
			models.set(String(model.run), [...models.get(String(model.run)) ?? [], model]);
		}
		return runs.map(row => ({ row, models: models.get(String(row.id)) ?? [], cases: Number(row.cases) }));
	}

	/** The rows of the table `table` of the run `run`, in the order `order`. */
	private async rowsOf(connection: DuckDBConnection, table: EvaluationTable, run: string, order = ''): Promise<Row[]> {
		return (await connection.runAndReadAll(`SELECT * FROM ModelEvaluations.${table} WHERE run = $run${order ? ` ORDER BY ${order}` : ''}`, { run })).getRowObjectsJson();
	}

	/** The rows of the cases of a run of Evaluate Answering Models, or of a run of embedding models or rerankers. */
	private caseRows(run: string, items: readonly IAskPollisEvalItem[], passages?: readonly (readonly IAskPollisPassage[])[], indices?: readonly number[]): EvaluationRow<'cases'>[] {
		return items.map((item, place) => ({
			run, case: String(indices?.[place] ?? place), source: item.source, context: item.context, input_text: item.question, target_text: item.answer,
			choices: item.choices ? JSON.stringify(item.choices) : null, explanation: item.explanation ?? null,
			target_label: item.choices && item.choices.indexOf(item.answer) >= 0 ? choiceLetter(item.choices.indexOf(item.answer)) : null,
			passages: passages ? JSON.stringify(passages[place]) : null,
		}));
	}

	/** A question of a run read back from its row of ModelEvaluations.cases. */
	private itemOf(row: Row): IAskPollisEvalItem {
		return closedItem({ source: String(row.source ?? ''), context: String(row.context ?? ''), question: String(row.input_text ?? ''), answer: String(row.target_text ?? '') }, row.choices, row.explanation);
	}

	async saveRun(run: ICompareRun): Promise<void> {
		await this.withModelEvaluations(async connection => {
			const { summary } = run;
			const id = summary.id;
			const scores: EvaluationRow<'scores'>[] = [];
			for (const question of run.questions) {
				if (question.rank !== undefined) {
					scores.push({ run: id, case: String(question.index), metric: 'passage_rank', value: question.rank });
				}
			}
			for (const answer of run.answers) {
				if (answer.similarity !== undefined) {
					scores.push({ run: id, model: answer.model, case: String(answer.question), repeat: answer.repeat, metric: 'similarity', value: answer.similarity });
				}
			}
			// The scores of a judge, and why it did not rate an answer, by the answer's model, question and repeat
			const answers = new Map(run.answers.map(answer => [answer.id, answer]));
			for (const score of run.scores) {
				const answer = answers.get(score.answer);
				if (answer) {
					const key = { run: id, model: answer.model, case: String(answer.question), repeat: answer.repeat, judge: score.judge };
					for (const criterion of RUBRIC) {
						if (score[criterion] !== undefined) {
							scores.push({ ...key, metric: criterion, value: score[criterion] });
						}
					}
					scores.push({ ...key, metric: 'final', value: score.final, note: score.rationale });
				}
			}
			for (const unrated of run.unrated) {
				const answer = answers.get(unrated.answer);
				if (answer) {
					scores.push({ run: id, model: answer.model, case: String(answer.question), repeat: answer.repeat, judge: unrated.judge, metric: 'final', error: unrated.error });
				}
			}
			await this.writeRun(connection, {
				id, kind: 'answering', source: 'evaluateAnsweringModels', started: summary.started, pollis: summary.pollis, repeats: summary.repeats,
				settings: JSON.stringify({ strategy: summary.strategy, open_book: summary.openBook || undefined, closed_book: summary.closedBook || undefined, search_in: summary.searchIn?.length ? summary.searchIn : undefined }),
			}, {
				models: [
					...summary.models.map((model, place) => modelRow(id, model, 'evaluated', 'llm', place + 1)),
					...summary.judges.map((judge, place) => modelRow(id, { value: judge, label: judge }, 'judge', 'llm', place + 1)),
				],
				cases: this.caseRows(id, run.questions.map(question => question.item), run.questions.map(question => question.passages), run.questions.map(question => question.index)),
				outputs: run.answers.map(answer => ({
					run: id, model: answer.model, case: String(answer.question), repeat: answer.repeat, output_text: answer.answer, error: answer.error ?? null,
					output_label: answer.choice === undefined ? null : choiceLetter(answer.choice),
					seconds: answer.timings?.seconds ?? null, first_token_ms: answer.timings?.firstWord ?? null, reading_speed: answer.timings?.reading ?? null, writing_speed: answer.timings?.writing ?? null,
					tokens_read: answer.timings?.tokensRead ?? null, tokens_written: answer.timings?.tokensWritten ?? null,
				})),
				scores,
			});
		});
	}

	private summaryOf(row: Row, models: readonly Row[], cases: number): ICompareRunSummary {
		const settings = storedSettings(row);
		return {
			id: String(row.id),
			started: Number(row.started),
			pollis: String(row.pollis ?? ''),
			models: models.filter(model => model.role === 'evaluated').map(model => ({ ...storedModel(model), local: storedSettings(model).local === true })),
			judges: models.filter(model => model.role === 'judge').map(model => String(model.label ?? model.model)),
			repeats: Number(row.repeats),
			questions: cases,
			...(typeof settings.strategy === 'string' ? { strategy: settings.strategy } : {}),
			...(settings.open_book ? { openBook: true } : {}),
			...(settings.closed_book ? { closedBook: true } : {}),
			...(Array.isArray(settings.search_in) ? { searchIn: settings.search_in.filter(name => typeof name === 'string') } : {}),
		};
	}

	async runs(): Promise<readonly ICompareRunSummary[]> {
		return this.withModelEvaluations(async connection =>
			(await this.readRuns(connection, 'answering')).map(({ row, models, cases }) => this.summaryOf(row, models, cases)));
	}

	async loadRun(id: string): Promise<ICompareRun | undefined> {
		return this.withModelEvaluations(async connection => {
			const [run] = await this.readRuns(connection, 'answering', id);
			if (!run) {
				return undefined;
			}
			const scores = await this.rowsOf(connection, 'scores', id);
			const ranks = new Map(scores.filter(score => score.metric === 'passage_rank' && score.model === null).map(score => [String(score.case), optionalNumber(score.value)]));
			const similarities = new Map(scores.filter(score => score.metric === 'similarity').map(score => [answerId(score.case, score.model, score.repeat), optionalNumber(score.value)]));
			// A judge's scores of an answer, its final score last
			const judged = new Map<string, { readonly answer: string; readonly judge: string; readonly rows: Row[] }>();
			for (const score of scores) {
				if (score.judge !== null) {
					const answer = answerId(score.case, score.model, score.repeat);
					const key = `${answer}\u0000${score.judge}`;
					const entry = judged.get(key) ?? { answer, judge: String(score.judge), rows: [] };
					entry.rows.push(score);
					judged.set(key, entry);
				}
			}
			const rated = [...judged.values()].map(entry => ({ ...entry, final: entry.rows.find(row => row.metric === 'final') }));
			return {
				summary: this.summaryOf(run.row, run.models, run.cases),
				questions: (await this.rowsOf(connection, 'cases', id, 'try_cast("case" AS INTEGER)')).map(row => ({
					index: Number(row.case),
					item: this.itemOf(row),
					passages: JSON.parse(String(row.passages ?? '[]')),
					rank: ranks.get(String(row.case)),
				})),
				answers: (await this.rowsOf(connection, 'outputs', id, 'try_cast("case" AS INTEGER), model, repeat')).map(row => ({
					id: answerId(row.case, row.model, row.repeat),
					question: Number(row.case),
					model: String(row.model),
					repeat: Number(row.repeat),
					answer: String(row.output_text ?? ''),
					error: row.error === null ? undefined : String(row.error),
					timings: row.seconds === null ? undefined : {
						firstWord: optionalNumber(row.first_token_ms),
						seconds: Number(row.seconds),
						reading: optionalNumber(row.reading_speed),
						writing: optionalNumber(row.writing_speed),
						tokensRead: optionalNumber(row.tokens_read),
						tokensWritten: optionalNumber(row.tokens_written),
					},
					similarity: similarities.get(answerId(row.case, row.model, row.repeat)),
					choice: choiceIndex(row.output_label),
				})),
				scores: rated.filter(entry => entry.final && entry.final.error === null).map(entry => {
					const criterion = (name: string) => optionalNumber(entry.rows.find(row => row.metric === name)?.value);
					return {
						answer: entry.answer,
						judge: entry.judge,
						relevance: criterion('relevance'),
						completeness: criterion('completeness'),
						clarity: criterion('clarity'),
						consistency: criterion('consistency'),
						helpfulness: criterion('helpfulness'),
						final: Number(entry.final?.value),
						rationale: String(entry.final?.note ?? ''),
					};
				}),
				unrated: rated.filter(entry => entry.final && entry.final.error !== null).map(entry => ({ answer: entry.answer, judge: entry.judge, error: String(entry.final?.error ?? '') })),
			};
		});
	}

	async deleteRun(id: string): Promise<void> {
		await this.withModelEvaluations(connection => this.removeRun(connection, id));
	}

	/** The rows of ModelEvaluations.scores of a found list of a run of embedding models or rerankers, one a metric that is set. */
	private foundScores<T extends { readonly question: number; readonly model: string }>(run: string, found: readonly T[], metrics: readonly (readonly [keyof T & string, string])[]): EvaluationRow<'scores'>[] {
		const scores: EvaluationRow<'scores'>[] = [];
		for (const entry of found) {
			const key = { run, model: entry.model, case: String(entry.question) };
			const set = metrics.filter(([field]) => entry[field] !== undefined && entry[field] !== null);
			for (const [field, metric] of set) {
				scores.push({ ...key, metric, value: Number(entry[field]) });
			}
			// An entry with no metric set is kept all the same, as the first metric with no value
			if (!set.length) {
				scores.push({ ...key, metric: metrics[0][1] });
			}
		}
		return scores;
	}

	/** A found list of a run of embedding models or rerankers read back: each question and model, and its metrics by their fields. */
	private async foundOf(connection: DuckDBConnection, run: string, metrics: readonly (readonly [string, string])[]): Promise<{ readonly question: number; readonly model: string; readonly values: ReadonlyMap<string, number | undefined> }[]> {
		const rows = (await connection.runAndReadAll(`SELECT s.* FROM ModelEvaluations.scores s LEFT JOIN ModelEvaluations.models m ON m.run = s.run AND m.model = s.model AND m.role = 'evaluated' WHERE s.run = $run AND s.model IS NOT NULL ORDER BY try_cast(s."case" AS INTEGER), m.place`, { run })).getRowObjectsJson();
		const fields = new Map(metrics.map(([field, metric]) => [metric, field]));
		const found = new Map<string, { readonly question: number; readonly model: string; readonly values: Map<string, number | undefined> }>();
		for (const row of rows) {
			const key = `${row.case}\u0000${row.model}`;
			const entry = found.get(key) ?? { question: Number(row.case), model: String(row.model), values: new Map() };
			const field = fields.get(String(row.metric));
			if (field) {
				entry.values.set(field, optionalNumber(row.value));
			}
			found.set(key, entry);
		}
		return [...found.values()];
	}

	async saveEmbeddingRun(run: IEmbeddingRun): Promise<void> {
		await this.withModelEvaluations(async connection => {
			const { summary } = run;
			await this.writeRun(connection, {
				id: summary.id, kind: 'embedding', source: summary.benchmark ? 'benchmarkRetrievalModels' : 'evaluateEmbeddingModels', started: summary.started, pollis: summary.pollis, benchmark: summary.benchmark ?? null,
				settings: JSON.stringify({ passages: summary.passages, sources: summary.sources }),
			}, {
				models: summary.models.map((model, place) => modelRow(summary.id, model, 'evaluated', 'embedding', place + 1)),
				cases: this.caseRows(summary.id, run.questions),
				scores: this.foundScores(summary.id, run.found, EMBEDDING_METRICS),
			});
		});
	}

	private embeddingSummaryOf(row: Row, models: readonly Row[], cases: number): IEmbeddingRunSummary {
		const settings = storedSettings(row);
		return {
			id: String(row.id),
			started: Number(row.started),
			pollis: String(row.pollis ?? ''),
			models: models.filter(model => model.role === 'evaluated').map(model => {
				const own = storedSettings(model);
				return {
					...storedModel(model),
					passage: String(own.passage ?? ''),
					query: String(own.query ?? ''),
					...(typeof own.dimensions === 'number' ? { dimensions: own.dimensions } : {}),
					...(typeof own.perSecond === 'number' ? { perSecond: own.perSecond } : {}),
				};
			}),
			questions: cases,
			passages: Number(settings.passages ?? 0),
			...(typeof row.benchmark === 'string' ? { benchmark: row.benchmark } : {}),
			...(Array.isArray(settings.sources) ? { sources: storedSources(settings.sources) } : {}),
		};
	}

	async embeddingRuns(): Promise<readonly IEmbeddingRunSummary[]> {
		return this.withModelEvaluations(async connection =>
			(await this.readRuns(connection, 'embedding')).map(({ row, models, cases }) => this.embeddingSummaryOf(row, models, cases)));
	}

	async loadEmbeddingRun(id: string): Promise<IEmbeddingRun | undefined> {
		return this.withModelEvaluations(async connection => {
			const [run] = await this.readRuns(connection, 'embedding', id);
			if (!run) {
				return undefined;
			}
			const questions = (await this.rowsOf(connection, 'cases', id, 'try_cast("case" AS INTEGER)')).map(row => this.itemOf(row));
			const found = (await this.foundOf(connection, id, EMBEDDING_METRICS)).map(({ question, model, values }) => ({
				question, model, hybrid: values.get('hybrid'), meaning: values.get('meaning'), queryMs: Number(values.get('queryMs')), searchMs: Number(values.get('searchMs')), ndcg: values.get('ndcg'), recall: values.get('recall'),
			}));
			return { summary: this.embeddingSummaryOf(run.row, run.models, run.cases), questions, found };
		});
	}

	async deleteEmbeddingRun(id: string): Promise<void> {
		await this.withModelEvaluations(connection => this.removeRun(connection, id));
	}

	async saveRerankRun(run: IRerankRun): Promise<void> {
		await this.withModelEvaluations(async connection => {
			const { summary } = run;
			await this.writeRun(connection, {
				id: summary.id, kind: 'reranking', source: summary.benchmark ? 'benchmarkRetrievalModels' : 'evaluateRerankingModels', started: summary.started, pollis: summary.pollis, benchmark: summary.benchmark ?? null,
				settings: JSON.stringify({ found: summary.found, kept: summary.kept }),
			}, {
				models: [
					...summary.models.map((model, place) => modelRow(summary.id, model, 'evaluated', 'reranker', place + 1)),
					...summary.embedder ? [modelRow(summary.id, { value: summary.embedder, label: summary.embedder }, 'embedder', 'embedding', 1)] : [],
				],
				cases: this.caseRows(summary.id, run.questions),
				scores: this.foundScores(summary.id, run.found, RERANK_METRICS),
			});
		});
	}

	private rerankSummaryOf(row: Row, models: readonly Row[], cases: number): IRerankRunSummary {
		const settings = storedSettings(row);
		const embedder = models.find(model => model.role === 'embedder');
		return {
			id: String(row.id),
			started: Number(row.started),
			pollis: String(row.pollis ?? ''),
			models: models.filter(model => model.role === 'evaluated').map(model => storedModel(model)),
			questions: cases,
			found: Number(settings.found ?? 0),
			kept: Number(settings.kept ?? 0),
			embedder: embedder ? String(embedder.model) : '',
			...(typeof row.benchmark === 'string' ? { benchmark: row.benchmark } : {}),
		};
	}

	async rerankRuns(): Promise<readonly IRerankRunSummary[]> {
		return this.withModelEvaluations(async connection =>
			(await this.readRuns(connection, 'reranking')).map(({ row, models, cases }) => this.rerankSummaryOf(row, models, cases)));
	}

	async loadRerankRun(id: string): Promise<IRerankRun | undefined> {
		return this.withModelEvaluations(async connection => {
			const [run] = await this.readRuns(connection, 'reranking', id);
			if (!run) {
				return undefined;
			}
			const questions = (await this.rowsOf(connection, 'cases', id, 'try_cast("case" AS INTEGER)')).map(row => this.itemOf(row));
			const found = (await this.foundOf(connection, id, RERANK_METRICS)).map(({ question, model, values }) => ({
				question, model, place: values.get('place'), ms: values.get('ms'), ndcg: values.get('ndcg'), recall: values.get('recall'), among: values.get('among'),
			}));
			return { summary: this.rerankSummaryOf(run.row, run.models, run.cases), questions, found };
		});
	}

	async deleteRerankRun(id: string): Promise<void> {
		await this.withModelEvaluations(connection => this.removeRun(connection, id));
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
		await this.withModelEvaluations(async connection => {
			for (const { run, answers } of runs) {
				const scores: EvaluationRow<'scores'>[] = [];
				const models: EvaluationRow<'models'>[] = [];
				for (const [place, model] of run.models.entries()) {
					const figures = run.figures?.find(candidate => candidate.value === model.value);
					models.push(modelRow(run.id, { ...model, error: model.error ?? figures?.error ?? undefined, memory: figures?.memory ?? undefined }, 'evaluated', 'llm', place + 1));
					if (figures) {
						for (const [field, metric] of BENCHMARK_FIGURES) {
							if (figures[field] !== undefined) {
								scores.push({ run: run.id, model: model.value, metric, value: figures[field] });
							}
						}
						for (const stratum of figures.strata) {
							scores.push({ run: run.id, model: model.value, stratum: stratum.name, metric: 'asked', value: stratum.asked });
							scores.push({ run: run.id, model: model.value, stratum: stratum.name, metric: 'right', value: stratum.right });
						}
					}
				}
				// Each question answered, with its stratum, and each answer: as read, a letter, or a number for a benchmark whose answers are numbers
				const cases = new Map<string, EvaluationRow<'cases'>>();
				for (const answer of answers) {
					cases.set(answer.id, { run: run.id, case: answer.id, stratum: answer.stratum });
					const key = { run: run.id, model: answer.model, case: answer.id, repeat: 0 };
					if (answer.correct !== undefined && answer.correct !== null) {
						scores.push({ ...key, metric: 'correct', value: answer.correct ? 1 : 0 });
					}
					if (answer.tokenMs !== undefined && answer.tokenMs !== null) {
						scores.push({ ...key, metric: 'token_ms', value: answer.tokenMs });
					}
				}
				await this.writeRun(connection, {
					id: run.id, kind: 'benchmark', source: 'benchmarkAnsweringModels', started: run.started, ended: run.ended ?? null, pollis: run.pollis ?? '', benchmark: run.benchmark, revision: run.revision ?? null, seed: run.sample.seed,
					settings: JSON.stringify({
						shots: run.settings.shots, reasoning: run.settings.reasoning, thinking: run.settings.thinking, max_tokens: run.settings.maxTokens,
						allocation: run.sample.allocation, size: run.sample.size, strata: run.sample.strata, questions: run.sample.questions,
					}),
				}, {
					models,
					cases: [...cases.values()],
					outputs: answers.map(answer => ({
						run: run.id, model: answer.model, case: answer.id, repeat: 0,
						output_label: answer.extracted === null || answer.extracted === undefined ? null : String(answer.extracted),
						output_text: answer.text ?? null, error: answer.error ?? null, finish: answer.finish ?? null, seconds: answer.seconds ?? null,
						tokens_read: answer.promptTokens ?? null, tokens_written: answer.writtenTokens ?? null, reading_ms: answer.promptMs ?? null,
						reading_speed: answer.readingSpeed ?? null, writing_speed: answer.writingSpeed ?? null,
					})),
					scores,
				});
			}
		});
		// The files once the run is kept in ModelEvaluations.duckdb
		for (const { files } of runs) {
			for (const file of files) {
				await fs.promises.rm(file, { force: true });
			}
		}
	}

	/** The runs of Benchmark Answering Models whose id is `id`, or all of them, the latest first, each with its models and their figures. */
	private async readBenchmarkRuns(connection: DuckDBConnection, id?: string): Promise<IBenchmarkRun[]> {
		const runs = await this.readRuns(connection, 'benchmark', id);
		const figures = new Map<string, Row[]>();
		const where = id === undefined ? `run IN (SELECT id FROM ModelEvaluations.runs WHERE kind = 'benchmark')` : 'run = $id';
		for (const score of (await connection.runAndReadAll(`SELECT * FROM ModelEvaluations.scores WHERE ${where} AND "case" IS NULL`, id === undefined ? undefined : { id })).getRowObjectsJson()) {
			const key = `${score.run}\u0000${score.model}`;
			figures.set(key, [...figures.get(key) ?? [], score]);
		}
		const text = (value: unknown) => value === null || value === undefined ? undefined : String(value);
		return runs.map(({ row, models }) => {
			const settings = storedSettings(row);
			const strata = Array.isArray(settings.strata) ? settings.strata : [];
			const figuresOf = (model: Row) => figures.get(`${row.id}\u0000${model.model}`) ?? [];
			const figure = (rows: readonly Row[], metric: string, stratum: unknown = null) => numberOrNull(rows.find(score => score.metric === metric && score.stratum === stratum)?.value);
			return {
				id: String(row.id),
				started: Number(row.started),
				ended: optionalNumber(row.ended),
				pollis: String(row.pollis ?? ''),
				benchmark: String(row.benchmark),
				revision: text(row.revision),
				settings: { shots: Number(settings.shots), reasoning: Boolean(settings.reasoning), thinking: Boolean(settings.thinking), maxTokens: Number(settings.max_tokens) },
				sample: { seed: Number(row.seed), allocation: String(settings.allocation ?? ''), size: Number(settings.size), strata, questions: Array.isArray(settings.questions) ? settings.questions.map(String) : [] },
				// The memory a model took is one of its figures
				models: models.map(model => {
					const { memory: _memory, ...stored } = storedModel(model);
					return stored;
				}),
				figures: models.filter(model => figuresOf(model).some(score => score.metric === 'questions')).map(model => {
					const rows = figuresOf(model);
					const names = [...new Set(rows.filter(score => score.stratum !== null).map(score => String(score.stratum)))];
					// The strata of the sample first, in its order, then any other
					const order = strata.map(stratum => String(stratum?.name));
					names.sort((a, b) => (order.indexOf(a) + 1 || Infinity) - (order.indexOf(b) + 1 || Infinity));
					return {
						value: String(model.model), label: String(model.label), questions: Number(figure(rows, 'questions')), failed: Number(figure(rows, 'failed')),
						score: figure(rows, 'score'), half: figure(rows, 'half'), right: Number(figure(rows, 'right_answers')), byChance: figure(rows, 'by_chance'),
						strata: names.map(name => ({ name, asked: Number(figure(rows, 'asked', name)), right: Number(figure(rows, 'right', name)) })),
						unread: Number(figure(rows, 'unread')), cutOff: Number(figure(rows, 'cut_off')),
						firstTokenMs: figure(rows, 'first_token_ms'), readingSpeed: figure(rows, 'reading_speed'), writingSpeed: figure(rows, 'writing_speed'),
						seconds: figure(rows, 'seconds'), writtenTokens: figure(rows, 'written_tokens'), memory: numberOrNull(model.memory), error: text(model.error) ?? null,
					};
				}),
			};
		});
	}

	async benchmarkRuns(): Promise<readonly IBenchmarkRun[]> {
		return this.withModelEvaluations(connection => this.readBenchmarkRuns(connection));
	}

	async loadBenchmarkRun(id: string): Promise<IBenchmarkRun | undefined> {
		return this.withModelEvaluations(async connection => (await this.readBenchmarkRuns(connection, id))[0]);
	}

	async loadBenchmarkAnswers(id: string): Promise<readonly IBenchmarkAnswer[]> {
		return this.withModelEvaluations(async connection => {
			const [run] = await this.readRuns(connection, 'benchmark', id);
			const questions = storedSettings(run?.row ?? {}).questions;
			const order = new Map((Array.isArray(questions) ? questions : []).map((question, place) => [String(question), place]));
			const rows = (await connection.runAndReadAll(`SELECT o.*, c.stratum, m.place,
				(SELECT any_value(s.value) FROM ModelEvaluations.scores s WHERE s.run = o.run AND s.model = o.model AND s."case" = o."case" AND s.repeat = o.repeat AND s.metric = 'correct') AS correct,
				(SELECT any_value(s.value) FROM ModelEvaluations.scores s WHERE s.run = o.run AND s.model = o.model AND s."case" = o."case" AND s.repeat = o.repeat AND s.metric = 'token_ms') AS token_ms
				FROM ModelEvaluations.outputs o
				LEFT JOIN ModelEvaluations.cases c ON c.run = o.run AND c."case" = o."case"
				LEFT JOIN ModelEvaluations.models m ON m.run = o.run AND m.model = o.model AND m.role = 'evaluated'
				WHERE o.run = $id`, { id })).getRowObjectsJson();
			// In the order they were written: model by model, each in the order its questions were drawn
			const place = (row: Row) => [Number(row.place ?? Infinity), order.get(String(row.case)) ?? Infinity];
			rows.sort((a, b) => {
				const [modelA, questionA] = place(a);
				const [modelB, questionB] = place(b);
				return modelA - modelB || questionA - questionB;
			});
			return rows.map(row => ({
				model: String(row.model),
				id: String(row.case),
				stratum: String(row.stratum ?? ''),
				extracted: row.output_label === null ? null : String(row.output_label),
				correct: row.correct === null ? undefined : Number(row.correct) === 1,
				text: row.output_text === null ? undefined : String(row.output_text),
				finish: row.finish === null ? undefined : String(row.finish),
				error: row.error === null ? undefined : String(row.error),
				seconds: optionalNumber(row.seconds),
				promptTokens: optionalNumber(row.tokens_read),
				writtenTokens: optionalNumber(row.tokens_written),
				promptMs: optionalNumber(row.reading_ms),
				readingSpeed: optionalNumber(row.reading_speed),
				writingSpeed: optionalNumber(row.writing_speed),
				tokenMs: optionalNumber(row.token_ms),
			}));
		});
	}

	async deleteBenchmarkRun(id: string): Promise<void> {
		await this.withModelEvaluations(connection => this.removeRun(connection, id));
	}

	async foundBefore(key: string, questions: readonly string[]): Promise<readonly (readonly IAskPollisPassage[] | undefined)[]> {
		return this.withModelEvaluations(async connection => {
			const rows = (await connection.runAndReadAll('SELECT question, passages FROM ModelEvaluations.searchCache WHERE stamp = $key', { key })).getRowObjectsJson();
			const found = new Map(rows.map(row => [String(row.question), String(row.passages ?? '[]')]));
			return questions.map(question => {
				const passages = found.get(question);
				return passages === undefined ? undefined : JSON.parse(passages);
			});
		});
	}

	async keepFound(key: string, found: readonly IAskPollisFound[]): Promise<void> {
		await this.withModelEvaluations(async connection => {
			await connection.run('BEGIN TRANSACTION');
			try {
				await connection.run('DELETE FROM ModelEvaluations.searchCache WHERE stamp <> $key', { key });
				for (const { question, passages } of found) {
					await connection.run('INSERT OR REPLACE INTO ModelEvaluations.searchCache VALUES ($key, $question, $passages)', { key, question, passages: JSON.stringify(passages) });
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
