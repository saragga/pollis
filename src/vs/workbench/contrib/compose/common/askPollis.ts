/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

/** The embedding model of Ask Pollis when the setting pollis.ask.embeddingModel gives none; the Julia extension indexes with the same. */
export const ASK_EMBEDDING_MODEL = 'hf:ggml-org/embeddinggemma-2-GGUF/embeddinggemma-2-Q8_0.gguf';
/** The chat model that writes the answers on this computer, when the setting pollis.ask.chatModel gives none. */
export const ASK_CHAT_MODEL = 'hf:unsloth/gemma-4-E4B-it-GGUF/gemma-4-E4B-it-Q4_K_M.gguf';
/** What a question is given to the embedding model as, when pollis.ask.queryPrefix gives nothing: EmbeddingGemma's form for a query. */
export const ASK_QUERY_PREFIX = 'task: question answering | query: {text}';
/** What a passage is given to the embedding model as, when pollis.ask.passagePrefix gives nothing: EmbeddingGemma's form for a document; the Julia extension has the same. */
export const ASK_PASSAGE_PREFIX = 'title: {title} | text: {text}';
/**
 * What an answer and the right answer are given to the embedding model as, for the answer score of Evaluate Answering
 * Models, when pollis.ask.queryPrefix gives nothing: EmbeddingGemma's form for sentence similarity; with that setting, its form.
 */
export const ASK_SIMILARITY_PREFIX = 'task: sentence similarity | query: {text}';
/**
 * The context of the embedding server, in tokens: the same as the Julia extension's when it indexes
 * (pollisDocuments.ts), so that both use the one server.
 */
export const ASK_EMBEDDING_CONTEXT = 2048;

/** The command that opens Set Active Models (modelsInstalledPage.ts), which the status bar entry runs. */
export const MODELS_INSTALLED_COMMAND_ID = 'pollis.localModels.installed';

/** How many times the passages to answer from are searched for when a reranker chooses among them. */
export const ASK_RERANK_WIDER = 3;

/** The context of a reranker's server, in tokens: a question with a passage of 500 words fits it easily. */
export const ASK_RERANK_CONTEXT = 4096;

/** The scores a reranker gives passages for a question, the higher the better, in the passages' order; or why it gave none. */
export interface IAskPollisReranked {
	readonly scores?: readonly number[];
	readonly error?: string;
}
/** How many passages go to the model, when pollis.ask.passages gives none. */
export const ASK_PASSAGES = 8;

/** Help > Ask Pollis, which a panel runs with an `IAskPollisFromPanel`. */
export const ASK_POLLIS_COMMAND_ID = 'pollis.askPollis';

/** What the + of Ask Pollis attaches, run with an `AskPollisAttachRequest`, which gives an `IAskPollisAttached`. */
export const ASK_POLLIS_ATTACH_COMMAND_ID = 'pollis.askPollis.attach';

/** PDF... in the + of Ask Pollis: a PDF picked, opened in the PDF Viewer, whose Select Area sends its areas to Ask Pollis. */
export const ASK_POLLIS_OPEN_PDF_COMMAND_ID = 'pollis.askPollis.openPdf';

/**
 * Puts an attachment in the question of the Ask Pollis pane, and shows the pane: a text file, cut as the + cuts it, or
 * a PNG image as a data URL. Run by the PDF Viewer with an `IAskPollisAddAttachment`.
 */
export const ASK_POLLIS_ADD_ATTACHMENT_COMMAND_ID = 'pollis.askPollis.addAttachment';

/** What `ASK_POLLIS_ADD_ATTACHMENT_COMMAND_ID` is run with. */
export interface IAskPollisAddAttachment {
	readonly kind: 'file' | 'image';
	readonly name: string;
	readonly content: string;
}

/** Whether a cloud model answers, the only one given images. */
export const ASK_POLLIS_ANSWERS_IN_CLOUD_COMMAND_ID = 'pollis.askPollis.answersInCloud';

/** The panel a question is asked in: its wikis, titled after it, and the vignettes of its packages are searched first. */
export interface IAskPollisPanel {
	readonly title: string;
	/** The packages of its Powered by, as `GLM.jl`, the titles of their vignettes. */
	readonly packages: readonly string[];
	/** What it holds, as panelCard writes it, given to the model by the strategies that tell it of the panel's content. */
	readonly card?: string;
}

/**
 * The share of the passages from a panel's own that depends on the question: `near` when the panel's nearest passage is
 * almost as near the question as the nearest of all, as near as a collection must be to be searched, else `far`; `near`
 * when the search is by words only.
 */
export interface IAskPollisPanelShare {
	readonly near: number;
	readonly far: number;
}

/** A question asked in a panel, which Ask Pollis answers beside it. */
export interface IAskPollisFromPanel {
	readonly question: string;
	readonly panel: IAskPollisPanel;
	readonly attachments?: readonly IAskPollisAttachment[];
}

/**
 * A passage found, with the document it is from: `page` is missing in a wiki, in the Julia Manual and in the Package
 * APIs, `file` the PDF, the wiki's Markdown, the Manual's search index or a package's file of docstrings; `anchor`, in
 * the Julia Manual, the HTML page beside that index and the anchor the passage is at, as
 * `manual/constructors.html#man-constructors`, and in the Package APIs the address of the docstring on its site.
 */
export interface IAskPollisPassage {
	readonly id: number;
	readonly collection: string;
	readonly kind: string;
	readonly title: string;
	readonly file: string;
	readonly menu: string;
	readonly toolbox: string;
	readonly page: number | null;
	readonly heading: string;
	readonly text: string;
	readonly anchor: string | null;
	/** Its score in the reciprocal rank fusion of the two searches, or by words only its BM25 score. */
	readonly score: number;
}

/**
 * Why a question was searched by its words only: there is no index yet, its passages have no embeddings yet, they are
 * of another embedding model than the setting's, or the embedding model did not start.
 */
export type AskPollisWordsOnly = 'notIndexed' | 'notEmbedded' | 'otherModel' | 'modelNotStarted';

/** A source within a collection, which Search In can tick; a question is routed to the collections, never to one of these. */
export type AskPollisSource = 'pollisTopics' | 'packageVignettes' | 'toolboxOverviews' | 'panelsWikis' | 'juliaManual' | 'juliaLibrary';

/** The collection each source is part of, as ask_index.jl names them. */
export const ASK_SOURCE_COLLECTION: Record<AskPollisSource, string> = {
	pollisTopics: 'Pollis',
	packageVignettes: 'Pollis',
	toolboxOverviews: 'Pollis',
	panelsWikis: 'Pollis',
	juliaManual: 'Julia Manual',
	juliaLibrary: 'Julia Manual',
};

export interface IAskPollisSearchRequest {
	/** What is searched: the question, after the one before it in a conversation. */
	readonly question: string;
	/** The collections searched, as the switch sets them; without them the question is routed to the nearest. */
	readonly collections?: readonly string[];
	/** The only sources searched of their collections, the other collections whole. */
	readonly sources?: readonly AskPollisSource[];
	/** How many passages are found. */
	readonly passages?: number;
	/** The panel it is asked in, which gives most of the passages, the rest routed as without it. */
	readonly panel?: IAskPollisPanel;
	/** The share of the passages from the panel's own, as its strategy sets it: 5/8 when not given. */
	readonly panelShare?: number | IAskPollisPanelShare;
	/** A collection of Retrieval-Augmented Generation, searched in place of PollisDocuments. */
	readonly index?: IAskPollisCollectionIndex;
}

/** The index of a collection of Compose > Retrieval-Augmented Generation, and how a question is embedded to search it. */
export interface IAskPollisCollectionIndex {
	readonly file: string;
	readonly embeddingModel: string;
	readonly queryPrefix: string;
}

/** A document of an index, by its file, and how many passages it was cut into. */
export interface IAskPollisIndexedDocument {
	readonly file: string;
	readonly passages: number;
}

export interface IAskPollisSearchResult {
	/** The passages, best first. */
	readonly passages: readonly IAskPollisPassage[];
	/** The collections searched, the nearest the question first. */
	readonly searched: readonly string[];
	/** Every collection of the index, for the switch. */
	readonly collections: readonly string[];
	/** Set when the question was searched by its words only, and why. */
	readonly wordsOnly?: AskPollisWordsOnly;
	/** What the embedding model said when it did not start. */
	readonly error?: string;
	/** Asked in a panel the index has no passages of, as a panel added since the index was made. */
	readonly panelMissing?: boolean;
}

/** What the index holds, from its table built. */
export interface IAskPollisIndexStatus {
	readonly passages: number;
	readonly embedded: number;
	/** The size of an embedding, 0 when there are none. */
	readonly dimensions: number;
	/** The embedding model the passages were embedded with. */
	readonly embedder: string;
	/** What each passage was given to the embedding model as, with {title} and {text}. */
	readonly passagePrefix: string;
	/** When the index was built, in milliseconds; empty for an index of an older Pollis. */
	readonly builtAt: string;
	/** About how many words a passage has. */
	readonly words: number;
	readonly collections: readonly string[];
}

/** What the passages found for a question depend on, so that a search with the same stamp is not made again (IAskPollisService.searchStamp). */
export interface IAskPollisSearchStamp {
	/** The index, the embedding model and the settings of the search, as one text. */
	readonly key: string;
	/** The file of the embedding model. */
	readonly embedder: string;
}

/** The passages found for a question, by its text. */
export interface IAskPollisFound {
	readonly question: string;
	readonly passages: readonly IAskPollisPassage[];
}

/** What the process of the search is asked: the embedding model's server, when the question is searched by meaning too. */
export interface IAskPollisIndexRequest extends IAskPollisSearchRequest {
	readonly embedding?: { readonly url: string; readonly input: string };
	readonly wordsOnly?: AskPollisWordsOnly;
	readonly error?: string;
}

/** What is attached to a question with the + of Ask Pollis: an image, which only a cloud model is sent, or a file, a dataset or a database, given as text. */
export interface IAskPollisAttachment {
	readonly kind: 'image' | 'file' | 'dataset' | 'database';
	readonly name: string;
	/** An image's data URL; else what the model is given: a file's text, a dataset's size and first rows, a database's tables and their columns. */
	readonly content: string;
}

/** What to attach: a text file read in the page, or a dataset or a database for the workbench to pick. */
export type AskPollisAttachRequest =
	| { readonly kind: 'file'; readonly name: string; readonly content: string }
	| { readonly kind: 'dataset' | 'database' };

/** What the + attaches, or why it does not, or both when the text is cut. */
export interface IAskPollisAttached {
	readonly attachment?: IAskPollisAttachment;
	readonly note?: string;
}

/** The most of an attachment's text the model is given: about 8,000 tokens, which a model of this computer still has room for. */
export const ASK_ATTACHED_CHARACTERS = 30000;

/** A question asked and its answer, earlier in a conversation. */
export interface IAskPollisTurn {
	readonly question: string;
	readonly answer: string;
	readonly attachments?: readonly IAskPollisAttachment[];
}

/** Text in a message with an image. */
export interface IAskPollisTextPart {
	readonly type: 'text';
	readonly text: string;
}

/** An image in a message, as a data URL. */
export interface IAskPollisImagePart {
	readonly type: 'image_url';
	readonly image_url: { readonly url: string };
}

/** A message of a chat, as the OpenAI-compatible API of llama-server takes it; with an image, its content is in parts. */
export interface IAskPollisMessage {
	readonly role: 'system' | 'user' | 'assistant';
	readonly content: string | readonly (IAskPollisTextPart | IAskPollisImagePart)[];
}

/** What the model that answers is told, before the passages. */
const ASK_RULES = [
	'After each statement, cite the passages it rests on, as [1] or [1, 3].',
	'If the passages do not answer the question, say so in one sentence, and name the passages that come closest.',
	'Answer in the language of the question.',
];
const ASK_INSTRUCTION = [
	'You answer questions about Pollis and Julia from the passages below, taken from their documentation.',
	'Use only what the passages say. Name menus, buttons and settings exactly as the passages write them.',
	...ASK_RULES,
].join('\n');

/** What the model is told when it answers from a collection of Retrieval-Augmented Generation, before the passages. */
function askCollectionInstruction(collection: string): string {
	return [
		`You answer questions from the passages below, taken from the documents of the collection "${collection}".`,
		'Use only what the passages say.',
		...ASK_RULES,
	].join('\n');
}

/** What the model is told when something is attached to the questions. */
/** What the model is told when nothing is searched, with Search In: None, to see what the documents add to its answers. */
const ASK_UNAIDED_INSTRUCTION = [
	'You answer questions about Pollis and Julia from what you know: no documentation is given.',
	'If you do not know, or are not sure, say so.',
	'Answer in the language of the question.',
].join('\n');

const ASK_ATTACHED_INSTRUCTION = 'The user attached images, files, datasets or databases to the questions, in <file>, <dataset> and <database> tags: they are the user\'s own, not documentation. Answer about them from what they show.';

/** A question with what is attached to it: the text of each attachment before it, in a tag, and the images first. */
function askUserContent(question: string, attachments: readonly IAskPollisAttachment[] | undefined): IAskPollisMessage['content'] {
	if (!attachments?.length) {
		return question;
	}
	const attached = attachments.filter(attachment => attachment.kind !== 'image').map(attachment => `<${attachment.kind} name="${attachment.name.replace(/"/g, '&quot;')}">\n${attachment.content}\n</${attachment.kind}>`);
	const text = [...attached, question].join('\n\n');
	const images = attachments.filter(attachment => attachment.kind === 'image');
	return images.length ? [...images.map(image => ({ type: 'image_url' as const, image_url: { url: image.content } })), { type: 'text' as const, text }] : text;
}

/** How many of the questions before are given to the model with their answers, so that the passages still fit its context. */
const ASK_TURNS = 4;

/** What a passage is labelled with for the model, and as the source of a question of Evaluate Answering Models: its document, with its version in the Package APIs, its page and its heading. */
export function askPassageLabel(passage: IAskPollisPassage): string {
	const title = passage.kind === 'api' && passage.menu ? `${passage.title} ${passage.menu}` : passage.title;
	return [title, passage.page === null ? '' : `page ${passage.page}`, passage.heading].filter(part => part).join(', ');
}

/**
 * How much of the docstrings of the Package APIs goes to the model with a question, in characters: about 5000 tokens,
 * which leaves room in the 8192 of a local model for the instruction, the question and the conversation.
 */
const ASK_DOCSTRING_CHARACTERS = 15000;

/** The text of each of `passages` for the model: a docstring is whole unless, together, they do not fit; then the longest are cut, the shorter ones staying whole. */
function askPassageTexts(passages: readonly IAskPollisPassage[]): string[] {
	const docstrings = passages.filter(passage => passage.kind === 'api').sort((a, b) => a.text.length - b.text.length);
	const lengths = new Map<IAskPollisPassage, number>();
	let left = ASK_DOCSTRING_CHARACTERS;
	docstrings.forEach((passage, i) => {
		const length = Math.min(passage.text.length, Math.floor(left / (docstrings.length - i)));
		lengths.set(passage, length);
		left -= length;
	});
	return passages.map(passage => {
		const length = lengths.get(passage) ?? passage.text.length;
		return length < passage.text.length ? `${passage.text.slice(0, length)} [...]` : passage.text;
	});
}

/**
 * The messages that ask a model `question`, with its `attachments`: the instruction, the panel it is asked in, if any,
 * and the passages, numbered from 1, then the conversation so far, each question with what was attached to it. Its
 * answers are given without their citations, which were to other passages. Asked from a `collection` of
 * Retrieval-Augmented Generation, the model is told the passages are from its documents.
 */
export function askPollisMessages(turns: readonly IAskPollisTurn[], question: string, passages: readonly IAskPollisPassage[], panel?: IAskPollisPanel, attachments?: readonly IAskPollisAttachment[], collection?: string): IAskPollisMessage[] {
	const texts = askPassageTexts(passages);
	const numbered = passages.map((passage, i) => `[${i + 1}] ${askPassageLabel(passage)}\n${texts[i]}`);
	const menu = panel && passages.find(passage => passage.kind === 'wiki' && passage.title === panel.title)?.menu;
	// A small model told to use only the passages and cite every statement leaves out what it cannot cite: the card is a source as the passages are
	const card = panel?.card ? `\nWhat the panel holds, a source you use as you use the passages:\n${panel.card}\nWhen the question is about the panel itself, what it does, checks, shows or holds, answer first from what the panel holds, naming each of its tabs and what it does, then add what the passages say, with their citations. What you take from what the panel holds needs no citation.` : '';
	const asked = panel ? `\nThe question is asked in the panel ${panel.title} of Pollis${menu ? ` (${menu})` : ''}: "this panel", "here" or "this method" mean it.${card}` : '';
	const before = turns.slice(-ASK_TURNS);
	const attached = !!attachments?.length || before.some(turn => turn.attachments?.length) ? `\n${ASK_ATTACHED_INSTRUCTION}${passages.length ? ' Cite the passages for what you say about Pollis and Julia.' : ''}` : '';
	// Without passages, Search In: None, the model answers from what it knows
	const system = passages.length ? `${collection === undefined ? ASK_INSTRUCTION : askCollectionInstruction(collection)}${asked}${attached}\n\n${numbered.join('\n\n')}` : `${ASK_UNAIDED_INSTRUCTION}${asked}${attached}`;
	return [
		{ role: 'system', content: system },
		...before.flatMap(turn => [
			{ role: 'user' as const, content: askUserContent(turn.question, turn.attachments) },
			{ role: 'assistant' as const, content: turn.answer.replace(/ ?\[\d+(?:,\s*\d+)*\]/g, '') },
		]),
		{ role: 'user', content: askUserContent(question, attachments) },
	];
}

/** Who answers: the chat model on this computer, or a cloud model of Anthropic, Google or OpenAI with the user's own key. */
export type AskPollisProvider = 'local' | 'anthropic' | 'google' | 'openai';

/** A cloud provider: its API, and where its key is kept in Secret Storage, never in the terminals' environment. */
export interface IAskPollisCloudProvider {
	readonly label: string;
	readonly url: string;
	readonly secretKey: string;
	readonly envVar: string;
}

export const ASK_CLOUD_PROVIDERS: { readonly [provider in Exclude<AskPollisProvider, 'local'>]: IAskPollisCloudProvider } = {
	anthropic: { label: 'Anthropic', url: 'https://api.anthropic.com/v1', secretKey: 'pollis.apiKey.anthropic', envVar: 'ANTHROPIC_API_KEY' },
	// Gemini through its OpenAI-compatible API
	google: { label: 'Google', url: 'https://generativelanguage.googleapis.com/v1beta/openai', secretKey: 'pollis.apiKey.google', envVar: 'GOOGLE_API_KEY' },
	openai: { label: 'OpenAI', url: 'https://api.openai.com/v1', secretKey: 'pollis.apiKey.openai', envVar: 'OPENAI_API_KEY' },
};

/** A choice of Answer With other than This Computer: the value of pollis.ask.answerWith is its id. */
export interface IAskPollisCloudModel {
	readonly id: string;
	readonly label: string;
	readonly provider: Exclude<AskPollisProvider, 'local'>;
}

export const ASK_CLOUD_MODELS: readonly IAskPollisCloudModel[] = [
	{ id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5', provider: 'anthropic' },
	{ id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5', provider: 'anthropic' },
	{ id: 'claude-opus-5-5', label: 'Claude Opus 5.5', provider: 'anthropic' },
	{ id: 'gpt-5.4-mini', label: 'GPT-5.4 mini', provider: 'openai' },
	{ id: 'gpt-5.5', label: 'GPT-5.5', provider: 'openai' },
	{ id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', provider: 'google' },
	{ id: 'gemini-4-argon', label: 'Gemini 4 Argon', provider: 'google' },
];

/** The value of pollis.ask.answerWith that answers on this computer, with the model of pollis.ask.chatModel. */
export const ASK_THIS_COMPUTER = 'local';

/** What an answer of Evaluate Answering Models is asked with, besides a cloud model's id: a local model's file after `local:`. */
export const ASK_LOCAL_PREFIX = 'local:';

/** The cloud model of a value of pollis.ask.answerWith, or nothing for This Computer. */
export function askCloudModel(answerWith: string | undefined): IAskPollisCloudModel | undefined {
	return ASK_CLOUD_MODELS.find(model => model.id === answerWith);
}

/** What the process of the search is asked to have a chat model write: on this computer, or by a cloud API at `url`. */
export interface IAskPollisChatRequest {
	/** Names the answer, in its texts and to stop it. */
	readonly id: string;
	readonly provider: AskPollisProvider;
	readonly url: string;
	readonly model: string;
	readonly messages: readonly IAskPollisMessage[];
	/** The key of a cloud provider, from Secret Storage: sent only to its API. */
	readonly key?: string;
}

/** How fast a chat model answered: as measured from the request sent, and for a local model as llama-server measures it. */
export interface IAskPollisTimings {
	/** From the request sent to the first word of the answer, in milliseconds. */
	readonly firstWord?: number;
	/** From the request sent to the last word, in seconds. */
	readonly seconds: number;
	/** How fast a local model read the instruction, the passages and the question, in tokens per second. */
	readonly reading?: number;
	/** How fast a local model wrote the answer, in tokens per second. */
	readonly writing?: number;
	/** The tokens the model read, the instruction, the passages and the question, as its API counts them. */
	readonly tokensRead?: number;
	/** The tokens of the answer, as its API counts them. */
	readonly tokensWritten?: number;
}

/** How a chat ended: done, stopped, refused by the model, or what went wrong; and how fast it went. */
export interface IAskPollisChatEnd {
	readonly error?: string;
	readonly refused?: boolean;
	readonly timings?: IAskPollisTimings;
}

/** The answer written so far, as it comes. */
export interface IAskPollisChatText {
	readonly id: string;
	readonly text: string;
}

/**
 * A question of the test set of Evaluate Answering Models: a QAEvalItem of RAGTools.jl, as `evals.json` holds it. `source` names
 * the document and the place in it, `context` is the passage that answers the question, and `answer` the right answer.
 */
export interface IAskPollisEvalItem {
	readonly source: string;
	readonly context: string;
	readonly question: string;
	readonly answer: string;
	/** A question of the FAQ of a panel, from the Panel FAQ test set: the panel it is asked in. */
	readonly panel?: IAskPollisPanel;
	/** The wiki that answers it, as the panel's TOML names its file, as `boot/assumptions.md`; its place among the passages found is the question's place. */
	readonly wikiFile?: string;
	/** Whether the question is one of the FAQ the panel does not show. */
	readonly hidden?: boolean;
	/** A closed question: its options in the order they are asked, `answer` the right one, at `rightChoice`. */
	readonly choices?: readonly string[];
	readonly rightChoice?: number;
	/** Why the right option is right, when the author wrote it. */
	readonly explanation?: string;
	/** A query of a retrieval benchmark, `source` its id: the ids of the documents relevant to it. */
	readonly relevant?: readonly string[];
}

/**
 * The topic of a question of a test set, by the document of its passage: `pollis`, Pollis' own documents; `julia`, the
 * Julia Manual; `panels`, the wikis of the panels, and the vignettes of the toolboxes.
 */
export type AskTopic = 'pollis' | 'julia' | 'panels';

/** The passage of the index a question of a test set is about now, with its text and its topic. */
export interface IAskPassageMatch {
	readonly text: string;
	readonly topic: AskTopic;
}

/** How many questions of each topic Make Questions writes. */
export type IAskTopicCounts = Readonly<Record<AskTopic, number>>;

/** A model of a run of Evaluate Answering Models. */
export interface ICompareRunModel {
	/** What IAskPollisService.answer is asked with: a cloud model's id, or `local:` and a local model's file. */
	readonly value: string;
	readonly label: string;
	readonly local: boolean;
	/** A local model's download, as Compose > Local AI Models shows it. */
	readonly size?: string;
}

/** A run of Evaluate Answering Models, as the list of the earlier runs shows it. */
export interface ICompareRunSummary {
	readonly id: string;
	/** When it started, in milliseconds since 1970. */
	readonly started: number;
	/** The version of Pollis it ran on. */
	readonly pollis: string;
	readonly models: readonly ICompareRunModel[];
	/** The judges, by their labels; none when the run has the free scores only. */
	readonly judges: readonly string[];
	readonly repeats: number;
	readonly questions: number;
	/** The strategy of Ask Pollis that found the passages and asked the models, by its id; Base for a run without one. */
	readonly strategy?: string;
	/**
	 * Open Book Answering: each model was given the question's own passage, or the passages of the wiki of a question
	 * of the Panel FAQ, with no search; without it or `closedBook`, Open Library Answering, the passages found by the strategy.
	 */
	readonly openBook?: boolean;
	/** Closed Book Answering: each model was given no passage, and answered from what it learned alone. */
	readonly closedBook?: boolean;
}

/** A question of a run, with the passages found for it, the same for every model. */
export interface ICompareRunQuestion {
	/** Its place in the run, from 0. */
	readonly index: number;
	readonly item: IAskPollisEvalItem;
	readonly passages: readonly IAskPollisPassage[];
	/** The place of the question's own passage among those found, from 1; 0 when it was not among them, nothing when it has none. */
	readonly rank?: number;
}

/** A model's answer to a question of a run. */
export interface ICompareRunAnswer {
	readonly id: string;
	readonly question: number;
	readonly model: string;
	/** Which asking of the question it is, from 0, when Repeats is above 1. */
	readonly repeat: number;
	readonly answer: string;
	/** Why the model gave no answer. */
	readonly error?: string;
	readonly timings?: IAskPollisTimings;
	/** Its answer score: the cosine similarity of its embedding and that of the right answer, by the embedding model of the search. */
	readonly similarity?: number;
	/** For a closed question, the option the answer chose, from 0; nothing when no option could be read from it. */
	readonly choice?: number;
}

/**
 * A judge's rating of an answer, from 1 to 5, against the right answer of the test set, and why; a run before the
 * ratings against the right answer has the five parts of RAGTools.JudgeAllScores too, against the passages found, and
 * their mean as the rating.
 */
export interface ICompareRunScore {
	readonly answer: string;
	readonly judge: string;
	readonly relevance?: number;
	readonly completeness?: number;
	readonly clarity?: number;
	readonly consistency?: number;
	readonly helpfulness?: number;
	readonly final: number;
	readonly rationale: string;
}

/** Why a judge did not rate an answer. */
export interface ICompareRunUnrated {
	readonly answer: string;
	readonly judge: string;
	readonly error: string;
}

/** A run of Evaluate Answering Models, kept in `~/.pollis/ask/Comparisons.duckdb`. */
export interface ICompareRun {
	readonly summary: ICompareRunSummary;
	readonly questions: readonly ICompareRunQuestion[];
	readonly answers: readonly ICompareRunAnswer[];
	readonly scores: readonly ICompareRunScore[];
	readonly unrated: readonly ICompareRunUnrated[];
}

/** What an embedding model is given before a passage, with {title} and {text}, and before a question, with {text}. */
export interface IEmbeddingPrefixes {
	readonly passage: string;
	readonly query: string;
}

/** The prefixes an embedding model was trained with, by the name of its file; a title and the text, and the question alone, for one not known. */
export function embeddingPrefixes(file: string): IEmbeddingPrefixes {
	const name = file.toLowerCase().split(/[\\/]/).pop() ?? '';
	const passage = '{title}\n{text}';
	if (name.includes('embeddinggemma')) {
		return { passage: ASK_PASSAGE_PREFIX, query: ASK_QUERY_PREFIX };
	}
	if (name.includes('nomic-embed')) {
		return { passage: 'search_document: {title}\n{text}', query: 'search_query: {text}' };
	}
	if (/qwen3-embedding|gte-qwen2/.test(name)) {
		return { passage, query: 'Instruct: Given a question, retrieve the passages that answer it\nQuery: {text}' };
	}
	if (/arctic-embed.*v2/.test(name)) {
		return { passage, query: 'query: {text}' };
	}
	if (/(^|[^a-z])e5[-_]/.test(name)) {
		return { passage: 'passage: {title}\n{text}', query: 'query: {text}' };
	}
	if (/bge-.*en-v1\.5|mxbai-embed|arctic-embed/.test(name)) {
		return { passage, query: 'Represent this sentence for searching relevant passages: {text}' };
	}
	return { passage, query: '{text}' };
}

/**
 * How far the embedding of the passages, or the search of the questions, of a model of Evaluate Embedding Models is;
 * or the reranking of the queries of a retrieval benchmark, by a reranker of Benchmark Embedding and Reranking Models or, with none, by BM25.
 */
export interface IEmbeddingProgress {
	readonly model: string;
	readonly phase: 'embed' | 'search' | 'rerank';
	readonly done: number;
	readonly total: number;
}

/** A retrieval benchmark of PollisBenchmarks.duckdb that Benchmark Embedding and Reranking Models runs: its table, and its name. */
export interface IRetrievalBenchmark {
	readonly id: string;
	readonly name: string;
}

/** The retrieval benchmarks of PollisBenchmarks.duckdb, each a table of its queries and the documents they search. */
export const RETRIEVAL_BENCHMARKS: readonly IRetrievalBenchmark[] = [
	{ id: 'scifact', name: 'SciFact' },
	{ id: 'scidocs', name: 'SCIDOCS' },
];

/** The first documents found that a query of a retrieval benchmark is scored on, as BEIR scores them: nDCG@10 and Recall@10. */
export const RETRIEVAL_CUT = 10;

/** The documents BM25 finds for each query of a retrieval benchmark, which each reranker puts in its order, as BEIR reranks them. */
export const RETRIEVAL_CANDIDATES = 100;

/** A query of a retrieval benchmark, with the ids of the documents relevant to it. */
export interface IRetrievalQuery {
	readonly id: string;
	readonly text: string;
	readonly relevant: readonly string[];
}

/**
 * How well the documents found for a query are ranked, each relevant document of gain 1: nDCG@10, from 0 to 1, 1 when
 * the relevant documents are the first found; and Recall@10, the share of the relevant documents among the first 10.
 */
export interface IRetrievalScore {
	readonly ndcg: number;
	readonly recall: number;
}

/** The documents of the retrieval benchmark `benchmark` to embed with the model `model`, by its server at `url`. */
export interface IRetrievalEmbeddingRequest extends IEmbeddingRequest {
	readonly benchmark: string;
}

/** The queries of the retrieval benchmark `benchmark` to search with the embeddings of `model`, made with its prefixes. */
export interface IRetrievalEvaluation extends IRetrievalEmbeddingRequest {
	readonly queryPrefix: string;
	readonly queries: readonly IRetrievalQuery[];
}

/**
 * The queries of the retrieval benchmark `benchmark` to rerank: the RETRIEVAL_CANDIDATES documents BM25 finds for each,
 * put in its order by the reranker `model` at `url`; in the order of BM25 without them.
 */
export interface IRetrievalRerankRequest {
	readonly benchmark: string;
	readonly queries: readonly IRetrievalQuery[];
	readonly model?: string;
	readonly url?: string;
}

/** How a query of a retrieval benchmark was reranked, `query` its place among those asked; `ms`, the milliseconds the reranker took. */
export interface IRetrievalReranked extends IRetrievalScore {
	readonly query: number;
	/** The share of the relevant documents among all those BM25 found: what no reranker can do better than. */
	readonly among: number;
	readonly ms?: number;
}

/** What rerankRetrieval gave for each query, those the reranker scored; and the first error, when it did not score them all. */
export interface IRetrievalRerankDone {
	readonly found: readonly IRetrievalReranked[];
	readonly error?: string;
}

/** The name of the retrieval benchmark `id`, as its catalogue gives it; the id itself for one not known. */
export function retrievalBenchmarkName(id: string): string {
	return RETRIEVAL_BENCHMARKS.find(benchmark => benchmark.id === id)?.name ?? id;
}

/** The passages of the index to embed with the model `model` (its value in the settings), by its server at `url`. */
export interface IEmbeddingRequest {
	readonly model: string;
	readonly url: string;
	readonly passagePrefix: string;
}

/** How the embedding of the passages went: how many were embedded, those embeddings.duckdb did not have, and in how long. */
export interface IEmbeddingDone {
	readonly embedded: number;
	readonly seconds: number;
	readonly error?: string;
}

/** The questions to search with the embeddings of `model`, made with its prefixes. */
export interface IEmbeddingEvaluation extends IEmbeddingRequest {
	readonly queryPrefix: string;
	readonly questions: readonly { readonly question: string; readonly context: string }[];
}

/**
 * How a question was found with a model: the place of its passage among those Ask Pollis gives (by words and by
 * meaning), from 1, and among all passages by meaning only; 0 when not among those given, nothing when the index has
 * no such passage; and the milliseconds the question's embedding and the search took.
 */
export interface IEmbeddingFound {
	readonly hybrid?: number;
	readonly meaning?: number;
	readonly queryMs: number;
	readonly searchMs: number;
	/** A query of a retrieval benchmark, searched by meaning alone: how well the documents found are ranked, in place of `hybrid` and `meaning`. */
	readonly ndcg?: number;
	readonly recall?: number;
}

/** What evaluateEmbedding found for each question, and the size of the model's embeddings. */
export interface IEmbeddingEvaluated {
	readonly dimensions: number;
	readonly passages: number;
	readonly found: readonly IEmbeddingFound[];
	readonly error?: string;
}

/** A model of a run of Evaluate Embedding Models, with what was measured of it. */
export interface IEmbeddingRunModel extends IEmbeddingPrefixes {
	readonly value: string;
	readonly label: string;
	/** Its download, as Compose > Local AI Models shows it. */
	readonly size?: string;
	readonly dimensions?: number;
	/** The bytes of memory its server took. */
	readonly memory?: number;
	/** The passages it embedded a second, when it embedded any. */
	readonly perSecond?: number;
	readonly error?: string;
}

/** A run of Evaluate Embedding Models, as the list of the earlier runs shows it. */
export interface IEmbeddingRunSummary {
	readonly id: string;
	readonly started: number;
	readonly pollis: string;
	readonly models: readonly IEmbeddingRunModel[];
	readonly questions: number;
	/** The passages of the index; the documents of the benchmark, for a run of one. */
	readonly passages: number;
	/** The retrieval benchmark whose queries were searched, by Benchmark Embedding and Reranking Models, its id; none for a run of Evaluate Embedding Models. */
	readonly benchmark?: string;
}

/** What a model found for a question of a run. */
export interface IEmbeddingRunFound extends IEmbeddingFound {
	readonly question: number;
	readonly model: string;
}

/** A run of Evaluate Embedding Models, kept in `~/.pollis/ask/Comparisons.duckdb`. */
export interface IEmbeddingRun {
	readonly summary: IEmbeddingRunSummary;
	readonly questions: readonly IAskPollisEvalItem[];
	readonly found: readonly IEmbeddingRunFound[];
}

/** A reranker of a run of Evaluate Reranking Models, with what was measured of it; the value '' for none, the passages kept in the order of the search. */
export interface IRerankRunModel {
	readonly value: string;
	readonly label: string;
	/** Its download, as Compose > Local AI Models shows it. */
	readonly size?: string;
	/** The bytes of memory its server took. */
	readonly memory?: number;
	readonly error?: string;
}

/** A run of Evaluate Reranking Models, as the list of the earlier runs shows it. */
export interface IRerankRunSummary {
	readonly id: string;
	readonly started: number;
	readonly pollis: string;
	readonly models: readonly IRerankRunModel[];
	readonly questions: number;
	/** The passages found for each question, which each reranker puts in its order. */
	readonly found: number;
	/** The passages Ask Pollis gives: the first of them in that order. */
	readonly kept: number;
	/** The embedding model that found them; none for a run of a benchmark, whose documents BM25 finds. */
	readonly embedder: string;
	/** The retrieval benchmark whose queries were reranked, by Benchmark Embedding and Reranking Models, its id; none for a run of Evaluate Reranking Models. */
	readonly benchmark?: string;
}

/**
 * Where a reranker put the passage a question was made from, among all the passages found: its place, from 1, 0 when
 * it was not found, nothing when the index has no such passage; and the milliseconds the reranking of the question took.
 */
export interface IRerankRunFound {
	readonly question: number;
	readonly model: string;
	readonly place?: number;
	readonly ms?: number;
	/** A query of a retrieval benchmark: how well the reranker ranked the first documents, in place of `place`. */
	readonly ndcg?: number;
	readonly recall?: number;
	/** For the order of BM25: the share of the relevant documents among all those it found. */
	readonly among?: number;
}

/** A run of Evaluate Reranking Models, kept in `~/.pollis/ask/Comparisons.duckdb`. */
export interface IRerankRun {
	readonly summary: IRerankRunSummary;
	readonly questions: readonly IAskPollisEvalItem[];
	readonly found: readonly IRerankRunFound[];
}

/** How the models of a run of Benchmark Answering Models answer: the examples shown first, worked answers or the answer alone, thinking, and the most tokens of an answer. */
export interface IBenchmarkSettings {
	readonly shots: number;
	readonly reasoning: boolean;
	readonly thinking: boolean;
	readonly maxTokens: number;
}

/** A model of a run of Benchmark Answering Models: its file or `hf:` value, its name and its size. */
export interface IBenchmarkModel {
	readonly value: string;
	readonly label: string;
	readonly size?: string;
}

/** A model's figures in a run of Benchmark Answering Models, as PollisBenchmarks.jl computes them (figures). */
export interface IBenchmarkFigures {
	readonly value: string;
	readonly label: string;
	readonly questions: number;
	readonly failed: number;
	readonly score: number | null;
	readonly half: number | null;
	readonly right: number;
	/** The probability that answers picked at random would get as many right or more; null for a benchmark without options, absent in a run kept before it was measured. */
	readonly byChance?: number | null;
	readonly strata: readonly { readonly name: string; readonly asked: number; readonly right: number }[];
	readonly unread: number;
	readonly cutOff: number;
	readonly firstTokenMs: number | null;
	readonly readingSpeed: number | null;
	readonly writingSpeed: number | null;
	readonly seconds: number | null;
	readonly writtenTokens: number | null;
	readonly memory: number | null;
	readonly error: string | null;
}

/**
 * A run of Benchmark Answering Models: as PollisBenchmarks.jl keeps it in ~/.pollis/benchmarks/runs/<id>.json while it goes, and as
 * Comparisons.duckdb keeps it once it has ended.
 */
export interface IBenchmarkRun {
	readonly id: string;
	readonly started: number;
	/** When run_models! of PollisBenchmarks.jl ended it; absent for a run of the page, which the page ends. */
	readonly ended?: number;
	readonly pollis: string;
	readonly benchmark: string;
	/** The revision of the dataset on Hugging Face its questions came from. */
	readonly revision?: string;
	readonly settings: IBenchmarkSettings;
	readonly sample: {
		readonly seed: number;
		readonly allocation: string;
		readonly size: number;
		readonly strata: readonly { readonly name: string; readonly population: number; readonly size: number }[];
		readonly questions: readonly string[];
	};
	/** Each model, when it started and ended, the memory free before its server started and the least memory free while it answered. */
	readonly models: readonly (IBenchmarkModel & { readonly started?: number; readonly ended?: number; readonly freeBefore?: number; readonly lowestFree?: number; readonly error?: string })[];
	readonly figures?: readonly IBenchmarkFigures[];
}

/** An answer of a run of Benchmark Answering Models, as PollisBenchmarks.jl writes it in <id>.jsonl, with its timings as llama-server measures them. */
export interface IBenchmarkAnswer {
	readonly model: string;
	readonly id: string;
	readonly stratum: string;
	readonly extracted?: string | null;
	readonly correct?: boolean;
	readonly text?: string;
	readonly finish?: string;
	readonly error?: string;
	readonly seconds?: number;
	readonly promptTokens?: number;
	readonly writtenTokens?: number;
	readonly promptMs?: number;
	readonly readingSpeed?: number;
	readonly writingSpeed?: number;
	readonly tokenMs?: number;
}

/** The search of PollisDocuments, and the chat model's answer, in a process of their own (../node/askPollisMain.ts). */
export interface IAskPollisIndex {
	readonly onDidChat: Event<IAskPollisChatText>;
	/** What the index holds, PollisDocuments' or that of the file `database`, or nothing when there is none that can be read. */
	status(database?: string): Promise<IAskPollisIndexStatus | undefined>;
	/** The documents of the index `database` with their number of passages; nothing when there is no index. */
	indexedDocuments(database: string): Promise<readonly IAskPollisIndexedDocument[] | undefined>;
	/** The scores of `passages` for `question` by the reranker of llama-server at `url`, its /rerank. */
	rerank(url: string, question: string, passages: readonly string[]): Promise<IAskPollisReranked>;
	/** The cosine similarity of the two texts of each of `pairs`, by the embedding model of llama-server at `url`, its /embeddings. */
	similarities(url: string, pairs: readonly (readonly [string, string])[]): Promise<readonly number[]>;
	/** The first `count` passages of the document `file` in the index `database`, in their order. */
	documentPassages(database: string, file: string, count: number): Promise<readonly IAskPollisPassage[]>;
	search(request: IAskPollisIndexRequest): Promise<IAskPollisSearchResult>;
	/** Writes the answer, the text sent as it comes by `onDidChat`. */
	chat(request: IAskPollisChatRequest): Promise<IAskPollisChatEnd>;
	stop(id: string): Promise<void>;
	/** As IAskPollisService. */
	describeDatabase(path: string): Promise<string>;
	/** `counts` passages of each topic spread over the documents, for Make Questions: one of each document in turn, long enough to ask about. */
	spread(counts: IAskTopicCounts): Promise<readonly IAskPollisPassage[]>;
	/**
	 * The passage each of `texts` is the text of or, when the documents have changed since, the passage that has the
	 * most of its words; nothing for a text no passage is like any more; nothing at all when there is no index.
	 */
	matches(texts: readonly string[]): Promise<readonly (IAskPassageMatch | undefined)[] | undefined>;
	/** The passages of the wiki `wikiFile` of a panel, as the Panel FAQ names it (`boot/assumptions.md`), in their order; none when the index does not hold it. */
	wikiPassages(wikiFile: string): Promise<readonly IAskPollisPassage[]>;
	/** The passages found before for each of `questions` with the search stamp `key`, nothing for a question not found with it. */
	foundBefore(key: string, questions: readonly string[]): Promise<readonly (readonly IAskPollisPassage[] | undefined)[]>;
	/** Keeps the passages `found` with the search stamp `key`, and forgets those found with any other. */
	keepFound(key: string, found: readonly IAskPollisFound[]): Promise<void>;
	/** Keeps a run, in place of the one of the same id. */
	saveRun(run: ICompareRun): Promise<void>;
	/** The runs kept, the latest first. */
	runs(): Promise<readonly ICompareRunSummary[]>;
	loadRun(id: string): Promise<ICompareRun | undefined>;
	deleteRun(id: string): Promise<void>;
	readonly onDidEmbed: Event<IEmbeddingProgress>;
	/** Embeds the passages of the index that embeddings.duckdb does not have with `request.model`, keeping each batch as it comes. */
	embedPassages(request: IEmbeddingRequest): Promise<IEmbeddingDone>;
	/** Searches the questions with the embeddings of `request.model` in embeddings.duckdb, as Ask Pollis would with it. */
	evaluateEmbedding(request: IEmbeddingEvaluation): Promise<IEmbeddingEvaluated>;
	/** The queries of the retrieval benchmark `benchmark`, from PollisBenchmarks.duckdb; nothing when it cannot be read. */
	retrievalQueries(benchmark: string): Promise<readonly IRetrievalQuery[] | undefined>;
	/** Embeds the documents of a retrieval benchmark that embeddings.duckdb does not have with `request.model`, as embedPassages those of the index. */
	embedRetrieval(request: IRetrievalEmbeddingRequest): Promise<IEmbeddingDone>;
	/** Searches the queries of a retrieval benchmark among its documents by meaning, with the embeddings of `request.model` in embeddings.duckdb. */
	evaluateRetrieval(request: IRetrievalEvaluation): Promise<IEmbeddingEvaluated>;
	/** Finds the documents of each query of a retrieval benchmark with BM25 and has the reranker at `request.url`, if any, put them in its order. */
	rerankRetrieval(request: IRetrievalRerankRequest): Promise<IRetrievalRerankDone>;
	/** Stops embedPassages, evaluateEmbedding and those of a retrieval benchmark at their next batch, question or query. */
	stopEmbedding(): Promise<void>;
	saveEmbeddingRun(run: IEmbeddingRun): Promise<void>;
	/** The runs of Evaluate Embedding Models, the latest first. */
	embeddingRuns(): Promise<readonly IEmbeddingRunSummary[]>;
	loadEmbeddingRun(id: string): Promise<IEmbeddingRun | undefined>;
	deleteEmbeddingRun(id: string): Promise<void>;
	saveRerankRun(run: IRerankRun): Promise<void>;
	/** The runs of Evaluate Reranking Models, the latest first. */
	rerankRuns(): Promise<readonly IRerankRunSummary[]>;
	loadRerankRun(id: string): Promise<IRerankRun | undefined>;
	deleteRerankRun(id: string): Promise<void>;
	/**
	 * Moves the runs `ids` of Benchmark Answering Models from ~/.pollis/benchmarks/runs into Comparisons.duckdb, their files
	 * removed; without `ids`, every run there that has ended: one PollisBenchmarks.jl marked ended, or one whose files
	 * have not changed for a day.
	 */
	importBenchmarkRuns(ids?: readonly string[]): Promise<void>;
	/** The runs of Benchmark Answering Models in Comparisons.duckdb, the latest first. */
	benchmarkRuns(): Promise<readonly IBenchmarkRun[]>;
	loadBenchmarkRun(id: string): Promise<IBenchmarkRun | undefined>;
	/** The answers of the run `id` of Benchmark Answering Models, in the order they were written. */
	loadBenchmarkAnswers(id: string): Promise<readonly IBenchmarkAnswer[]>;
	deleteBenchmarkRun(id: string): Promise<void>;
}

/** How an answer ended, and the model that wrote it. */
export interface IAskPollisAnswer extends IAskPollisChatEnd {
	readonly model: string;
	/** Set when a cloud model was chosen and there is no key for its provider. */
	readonly noKey?: IAskPollisCloudProvider;
}

export const IAskPollisService = createDecorator<IAskPollisService>('askPollisService');

/**
 * Finds the passages of Pollis' documents that answer a question: by its words (BM25) and by its meaning (the
 * embedding model, which it starts through the Julia extension), merged by reciprocal rank fusion.
 */
export interface IAskPollisService {
	readonly _serviceBrand: undefined;
	/** Every collection of the index, for a Search In before any question; none before the first index. */
	collections(): Promise<readonly string[]>;
	search(request: IAskPollisSearchRequest): Promise<IAskPollisSearchResult>;
	/** What the index of a collection of Retrieval-Augmented Generation holds, as IAskPollisIndex. */
	collectionStatus(file: string): Promise<IAskPollisIndexStatus | undefined>;
	indexedDocuments(file: string): Promise<readonly IAskPollisIndexedDocument[] | undefined>;
	documentPassages(file: string, document: string, count: number): Promise<readonly IAskPollisPassage[]>;
	/** Scores each of `passages` for `question` with the reranker `model`, a GGUF file, which it starts through the Julia extension. */
	rerank(model: string, question: string, passages: readonly IAskPollisPassage[]): Promise<IAskPollisReranked>;
	/** Stops the embedding model of the search, if it runs, so that its memory is free; the next search starts it again. Resolves once it has stopped. */
	stopSearchModel(): Promise<void>;
	/**
	 * The cosine similarity of the two texts of each of `pairs` by the embedding model of the search, which it starts
	 * through the Julia extension; nothing when that model cannot start, or has not embedded the index.
	 */
	similarities(pairs: readonly (readonly [string, string])[]): Promise<readonly number[] | undefined>;
	/**
	 * What a search by meaning and words depends on now: the index, its build time, the embedding model, its query
	 * prefix, the number of passages and Pollis' version; nothing when a question would be searched by its words only.
	 * Evaluate Answering Models reuses the passages found with the same stamp (foundBefore, keepFound), so that the embedding
	 * model need not load and every run gets the same passages.
	 */
	searchStamp(): Promise<IAskPollisSearchStamp | undefined>;
	/** The passages found before for each of `questions` with the search stamp `key`, in `~/.pollis/ask/Comparisons.duckdb`. */
	foundBefore(key: string, questions: readonly string[]): Promise<readonly (readonly IAskPollisPassage[] | undefined)[]>;
	keepFound(key: string, found: readonly IAskPollisFound[]): Promise<void>;
	/**
	 * Has the model of pollis.ask.answerWith answer `question` from `passages`, after `turns`: on this computer the
	 * chat model of pollis.ask.chatModel, started through the Julia extension, downloaded the first time; or a cloud
	 * model, with the key of its provider. `onText` is given the answer so far as it comes. Evaluate Answering Models gives
	 * `answerWith`, a cloud model's id or `local:` and a local model's file, in place of the setting; a question asked in a
	 * panel, the `panel`, which the model is told of; what is attached to it, the `attachments`, of which a model of this
	 * computer is not sent the images; a question asked of a collection of Retrieval-Augmented Generation, its name, the
	 * `collection`.
	 */
	answer(turns: readonly IAskPollisTurn[], question: string, passages: readonly IAskPollisPassage[], onText: (text: string) => void, token: CancellationToken, answerWith?: string, panel?: IAskPollisPanel, attachments?: readonly IAskPollisAttachment[], collection?: string): Promise<IAskPollisAnswer>;
	/** The tables and views of the DuckDB database at `path`, with their columns, as an attachment gives them; it is opened read-only and no view is run. */
	describeDatabase(path: string): Promise<string>;
	/** `counts` passages of each topic spread over the documents, for the questions of a test set. */
	spread(counts: IAskTopicCounts): Promise<readonly IAskPollisPassage[]>;
	/**
	 * The passage each of `texts` is the text of or, when the documents have changed since, the passage that has the
	 * most of its words; nothing for a text no passage is like any more; nothing at all when there is no index.
	 */
	matches(texts: readonly string[]): Promise<readonly (IAskPassageMatch | undefined)[] | undefined>;
	/** The passages of the wiki `wikiFile` of a panel, as the Panel FAQ names it (`boot/assumptions.md`), in their order; none when the index does not hold it. */
	wikiPassages(wikiFile: string): Promise<readonly IAskPollisPassage[]>;
	/** The runs of Evaluate Answering Models, in `~/.pollis/ask/Comparisons.duckdb`. */
	saveRun(run: ICompareRun): Promise<void>;
	runs(): Promise<readonly ICompareRunSummary[]>;
	loadRun(id: string): Promise<ICompareRun | undefined>;
	deleteRun(id: string): Promise<void>;
	/** Evaluate Embedding Models: as IAskPollisIndex, the server of each model started by the caller. */
	readonly onDidEmbed: Event<IEmbeddingProgress>;
	embedPassages(request: IEmbeddingRequest): Promise<IEmbeddingDone>;
	evaluateEmbedding(request: IEmbeddingEvaluation): Promise<IEmbeddingEvaluated>;
	/** The retrieval benchmarks of PollisBenchmarks.duckdb, for Benchmark Embedding and Reranking Models: as IAskPollisIndex. */
	retrievalQueries(benchmark: string): Promise<readonly IRetrievalQuery[] | undefined>;
	embedRetrieval(request: IRetrievalEmbeddingRequest): Promise<IEmbeddingDone>;
	evaluateRetrieval(request: IRetrievalEvaluation): Promise<IEmbeddingEvaluated>;
	rerankRetrieval(request: IRetrievalRerankRequest): Promise<IRetrievalRerankDone>;
	stopEmbedding(): Promise<void>;
	saveEmbeddingRun(run: IEmbeddingRun): Promise<void>;
	embeddingRuns(): Promise<readonly IEmbeddingRunSummary[]>;
	loadEmbeddingRun(id: string): Promise<IEmbeddingRun | undefined>;
	deleteEmbeddingRun(id: string): Promise<void>;
	/** The runs of Evaluate Reranking Models, in `~/.pollis/ask/Comparisons.duckdb`. */
	saveRerankRun(run: IRerankRun): Promise<void>;
	rerankRuns(): Promise<readonly IRerankRunSummary[]>;
	loadRerankRun(id: string): Promise<IRerankRun | undefined>;
	deleteRerankRun(id: string): Promise<void>;
	/** The runs of Benchmark Answering Models, as IAskPollisIndex. */
	importBenchmarkRuns(ids?: readonly string[]): Promise<void>;
	benchmarkRuns(): Promise<readonly IBenchmarkRun[]>;
	loadBenchmarkRun(id: string): Promise<IBenchmarkRun | undefined>;
	loadBenchmarkAnswers(id: string): Promise<readonly IBenchmarkAnswer[]>;
	deleteBenchmarkRun(id: string): Promise<void>;
}
