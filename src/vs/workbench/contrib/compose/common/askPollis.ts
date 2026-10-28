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
export const ASK_CHAT_MODEL = 'hf:unsloth/Qwen3.5-4B-GGUF/Qwen3.5-4B-Q4_K_M.gguf';
/** What a question is given to the embedding model as, when pollis.ask.queryPrefix gives nothing: EmbeddingGemma's form for a query. */
export const ASK_QUERY_PREFIX = 'task: question answering | query: {text}';
/** What a passage is given to the embedding model as, when pollis.ask.passagePrefix gives nothing: EmbeddingGemma's form for a document; the Julia extension has the same. */
export const ASK_PASSAGE_PREFIX = 'title: {title} | text: {text}';
/** How many passages go to the model, when pollis.ask.passages gives none. */
export const ASK_PASSAGES = 8;

/**
 * A passage found, with the document it is from: `page` is missing in a wiki and in the Julia Manual, `file` the PDF,
 * the wiki's Markdown or the Manual's search index; `anchor`, in the Julia Manual only, the HTML page beside that index
 * and the anchor the passage is at, as `manual/constructors.html#man-constructors`.
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

export interface IAskPollisSearchRequest {
	/** What is searched: the question, after the one before it in a conversation. */
	readonly question: string;
	/** The collections searched, as the switch sets them; without them the question is routed to the nearest. */
	readonly collections?: readonly string[];
	/** How many passages are found. */
	readonly passages?: number;
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
}

/** What the index holds, from its table built. */
export interface IAskPollisIndexStatus {
	readonly passages: number;
	readonly embedded: number;
	/** The size of an embedding, 0 when there are none. */
	readonly dimensions: number;
	/** The embedding model the passages were embedded with. */
	readonly embedder: string;
	readonly collections: readonly string[];
}

/** What the process of the search is asked: the embedding model's server, when the question is searched by meaning too. */
export interface IAskPollisIndexRequest extends IAskPollisSearchRequest {
	readonly embedding?: { readonly url: string; readonly input: string };
	readonly wordsOnly?: AskPollisWordsOnly;
	readonly error?: string;
}

/** A question asked and its answer, earlier in a conversation. */
export interface IAskPollisTurn {
	readonly question: string;
	readonly answer: string;
}

/** A message of a chat, as the OpenAI-compatible API of llama-server takes it. */
export interface IAskPollisMessage {
	readonly role: 'system' | 'user' | 'assistant';
	readonly content: string;
}

/** What the model that answers is told, before the passages. */
const ASK_INSTRUCTION = [
	'You answer questions about Pollis and Julia from the passages below, taken from their documentation.',
	'Use only what the passages say. Name menus, buttons and settings exactly as the passages write them.',
	'After each statement, cite the passages it rests on, as [1] or [1, 3].',
	'If the passages do not answer the question, say so in one sentence, and name the passages that come closest.',
	'Answer in the language of the question.',
].join('\n');

/** How many of the questions before are given to the model with their answers, so that the passages still fit its context. */
const ASK_TURNS = 4;

/** What a passage is labelled with for the model: its document, its page and its heading. */
function passageLabel(passage: IAskPollisPassage): string {
	return [passage.title, passage.page === null ? '' : `page ${passage.page}`, passage.heading].filter(part => part).join(', ');
}

/**
 * The messages that ask a model `question`: the instruction and the passages, numbered from 1, then the conversation
 * so far. Its answers are given without their citations, which were to other passages.
 */
export function askPollisMessages(turns: readonly IAskPollisTurn[], question: string, passages: readonly IAskPollisPassage[]): IAskPollisMessage[] {
	const numbered = passages.map((passage, i) => `[${i + 1}] ${passageLabel(passage)}\n${passage.text}`);
	return [
		{ role: 'system', content: `${ASK_INSTRUCTION}\n\n${numbered.join('\n\n')}` },
		...turns.slice(-ASK_TURNS).flatMap(turn => [
			{ role: 'user' as const, content: turn.question },
			{ role: 'assistant' as const, content: turn.answer.replace(/ ?\[\d+(?:,\s*\d+)*\]/g, '') },
		]),
		{ role: 'user', content: question },
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
	{ id: 'claude-haiku-5-5', label: 'Claude Haiku', provider: 'anthropic' },
	{ id: 'claude-sonnet-5-5', label: 'Claude Sonnet', provider: 'anthropic' },
	{ id: 'gpt-5.4-mini', label: 'GPT-5.4 mini', provider: 'openai' },
	{ id: 'gpt-5.5', label: 'GPT-5.5', provider: 'openai' },
	{ id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', provider: 'google' },
	{ id: 'gemini-4-argon', label: 'Gemini 4 Argon', provider: 'google' },
];

/** The value of pollis.ask.answerWith that answers on this computer, with the model of pollis.ask.chatModel. */
export const ASK_THIS_COMPUTER = 'local';

/** What an answer of Compare Models is asked with, besides a cloud model's id: a local model's file after `local:`. */
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

/** The search of PollisDocuments, and the chat model's answer, in a process of their own (../node/askPollisMain.ts). */
export interface IAskPollisIndex {
	readonly onDidChat: Event<IAskPollisChatText>;
	/** What the index holds, or nothing when there is none that can be read. */
	status(): Promise<IAskPollisIndexStatus | undefined>;
	search(request: IAskPollisIndexRequest): Promise<IAskPollisSearchResult>;
	/** Writes the answer, the text sent as it comes by `onDidChat`. */
	chat(request: IAskPollisChatRequest): Promise<IAskPollisChatEnd>;
	stop(id: string): Promise<void>;
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
	/**
	 * Has the model of pollis.ask.answerWith answer `question` from `passages`, after `turns`: on this computer the
	 * chat model of pollis.ask.chatModel, started through the Julia extension, downloaded the first time; or a cloud
	 * model, with the key of its provider. `onText` is given the answer so far as it comes. Compare Models gives
	 * `answerWith`, a cloud model's id or `local:` and a local model's file, in place of the setting.
	 */
	answer(turns: readonly IAskPollisTurn[], question: string, passages: readonly IAskPollisPassage[], onText: (text: string) => void, token: CancellationToken, answerWith?: string): Promise<IAskPollisAnswer>;
}
