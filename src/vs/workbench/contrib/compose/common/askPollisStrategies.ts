/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { Event } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { ASK_RERANK_WIDER, IAskPollisPanel, IAskPollisPanelShare, IAskPollisPassage, IAskPollisSearchRequest, IAskPollisSearchResult, IAskPollisService } from './askPollis.js';

// The answering strategies of Ask Pollis: each a way of answering, written as a list of steps that the pane
// (askPollisPage.ts) and Evaluate Answering Models (compareModelsRun.ts) both follow, so that what is evaluated is what
// the pane does. The steps are data, never code: a strategy says which steps it takes and with what settings, and the
// functions below carry them out. Besides those of Pollis, a strategy is a TOML file of ~/.pollis/ask/strategies/:
//
//   [strategy]
//   # letters, digits, - and _, starting with a letter
//   id = "panelAware"
//   label = "Panel Aware"
//   description = "Asked in a panel, ..."
//   # optional
//   author = "..."
//
//   # required, first: the share of the passages from the panel's own, panelNear when the panel's passages are near
//   # the question and panelFar when they are not, or one panelShare for every question
//   [[steps]]
//   step = "search"
//   panelNear = 0.75
//   panelFar = 0.25
//
//   # optional: the reranker of Set Active Models, when one is set, asked the question ("question", the default) or
//   # the question after its Context ("panel")
//   [[steps]]
//   step = "rerank"
//   by = "reranker"
//   query = "panel"
//
//   # required, last: what the model is told of the panel, "named", "card" or "none"
//   [[steps]]
//   step = "answer"
//   panel = "card"
//
// Comments go on lines of their own: Pollis' TOML reader takes the rest of a line as the value.

/** A step of a strategy of Ask Pollis. */
export type AskPollisStrategyStep =
	/**
	 * Finds the passages: asked in a panel, `panelShare` of them from the panel's own, the rest routed as without it; a
	 * share `{ near, far }` depends on how near the panel's passages are to the question.
	 */
	| { readonly step: 'search'; readonly panelShare: number | IAskPollisPanelShare }
	/**
	 * Reranks them with the reranker of Set Active Models, when one is set, choosing among ASK_RERANK_WIDER times as many
	 * found, the panel's own and the others each keeping their share; `query: 'panel'` asks the reranker the question
	 * after its Context, the panel's title unless the user wrote another.
	 */
	| { readonly step: 'rerank'; readonly by: 'reranker'; readonly query?: 'question' | 'panel' }
	/**
	 * Asks the model: asked in a panel, `named` tells it the panel and its menu, `card` what the panel holds too (its
	 * models, Key Points, decision table, inputs and packages), `none` nothing of the panel.
	 */
	| { readonly step: 'answer'; readonly panel: 'named' | 'card' | 'none' };

/** A strategy of Ask Pollis: its id, which the setting pollis.ask.strategy holds, its name, and its steps in order. */
export interface IAskPollisStrategy {
	readonly id: string;
	readonly label: string;
	readonly description: string;
	readonly steps: readonly AskPollisStrategyStep[];
	/** Who wrote it, for a strategy of a file. */
	readonly author?: string;
	/** Its file, for a strategy of ~/.pollis/ask/strategies/; none for Pollis' own. */
	readonly file?: string;
}

/** Base, Pollis' original strategy, the one the others are compared with; a run saved before there were strategies used it. */
export const ASK_BASE_STRATEGY = 'base';

/** The strategy of Ask Pollis when the setting pollis.ask.strategy names no other. */
export const ASK_DEFAULT_STRATEGY = 'panelAware';

/** The strategies of Ask Pollis. */
export const ASK_POLLIS_STRATEGIES: readonly IAskPollisStrategy[] = [
	{
		id: ASK_DEFAULT_STRATEGY,
		label: localize('askPollis.strategyPanelAware', "Panel Aware"),
		description: localize('askPollis.strategyPanelAwareDescription', "Asked in a panel, six of the eight passages come from the panel's wikis and the vignettes of its packages when they are near the question, two when they are not; a reranker, when set, is asked the question after its Context; the model is told the panel's name and menu, and what the panel holds: its models, Key Points, decision table, inputs and packages."),
		steps: [
			{ step: 'search', panelShare: { near: 6 / 8, far: 2 / 8 } },
			{ step: 'rerank', by: 'reranker', query: 'panel' },
			{ step: 'answer', panel: 'card' },
		],
	},
	{
		id: ASK_BASE_STRATEGY,
		label: localize('askPollis.strategyBase', "Base"),
		description: localize('askPollis.strategyBaseDescription', "Asked in a panel, five of the eight passages come from the panel's wikis and the vignettes of its packages, the rest routed as without it; a reranker, when set, chooses among three times as many, keeping the panel's share; the model is told the panel's name and menu."),
		steps: [
			{ step: 'search', panelShare: 5 / 8 },
			{ step: 'rerank', by: 'reranker' },
			{ step: 'answer', panel: 'named' },
		],
	},
];

/** The branch of Trumpingtons/pollis-strategies that holds the catalogue of answering strategies: strategies.json and the files it names. */
export const ASK_STRATEGIES_CATALOGUE_URL = 'https://raw.githubusercontent.com/Trumpingtons/pollis-strategies/dist';

/** A strategy of the catalogue, as strategies.json holds it: its file, and that file's TOML read as data. */
export interface IAskStrategyCatalogueEntry {
	readonly file: string;
	readonly data: unknown;
}

/** A TOML string, in double quotes. */
function tomlString(value: string): string {
	return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
}

/** The TOML file of `strategy`, under the id `id` and the name `label`, by `author`: a file of ~/.pollis/ask/strategies/. */
export function askStrategyToml(strategy: IAskPollisStrategy, id: string, label: string, author: string | undefined): string {
	const lines = ['[strategy]', `id = ${tomlString(id)}`, `label = ${tomlString(label)}`, `description = ${tomlString(strategy.description)}`];
	if (author) {
		lines.push(`author = ${tomlString(author)}`);
	}
	for (const step of strategy.steps) {
		lines.push('', '[[steps]]', `step = "${step.step}"`);
		if (step.step === 'search') {
			if (typeof step.panelShare === 'number') {
				lines.push(`panelShare = ${step.panelShare}`);
			} else {
				lines.push(`panelNear = ${step.panelShare.near}`, `panelFar = ${step.panelShare.far}`);
			}
		} else if (step.step === 'rerank') {
			lines.push(`by = "${step.by}"`, `query = "${step.query ?? 'question'}"`);
		} else {
			lines.push(`panel = "${step.panel}"`);
		}
	}
	return lines.join('\n') + '\n';
}

/** Whether two strategies take the same steps with the same settings, and have the same name, description and author. */
export function askStrategiesEqual(a: IAskPollisStrategy, b: IAskPollisStrategy): boolean {
	const shown = (strategy: IAskPollisStrategy) => JSON.stringify([strategy.id, strategy.label, strategy.description, strategy.author ?? '', strategy.steps]);
	return shown(a) === shown(b);
}

/** The strategy `id` of `strategies`, or the default one when there is none of that id. */
export function askPollisStrategy(id: string | undefined, strategies: readonly IAskPollisStrategy[] = ASK_POLLIS_STRATEGIES): IAskPollisStrategy {
	return strategies.find(strategy => strategy.id === id) ?? ASK_POLLIS_STRATEGIES.find(strategy => strategy.id === ASK_DEFAULT_STRATEGY)!;
}

/** The name of the strategy `id` of `strategies`: its id when there is none of that id any more, Base for none. */
export function askStrategyLabel(id: string | undefined, strategies: readonly IAskPollisStrategy[]): string {
	return id ? strategies.find(strategy => strategy.id === id)?.label ?? id : ASK_POLLIS_STRATEGIES.find(strategy => strategy.id === ASK_BASE_STRATEGY)!.label;
}

// --- Strategies of files -----------------------------------------------------------------------------------------

/** A file of ~/.pollis/ask/strategies/ that is not a strategy, and why. */
export interface IAskStrategyProblem {
	readonly file: string;
	readonly problems: readonly string[];
}

type TomlTable = { readonly [key: string]: unknown };

function isTable(value: unknown): value is TomlTable {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The keys of `table` that are not among `known`, as problems of `where`. */
function unknownKeys(table: TomlTable, known: readonly string[], where: string): string[] {
	return Object.keys(table).filter(key => !known.includes(key)).map(key => localize('askStrategy.unknownKey', "{0}: Pollis does not know {1} here (it knows {2}).", where, key, known.join(', ')));
}

/** A share of the passages, a number from 0 to 1, or the problem with it. */
function share(table: TomlTable, key: string, where: string, problems: string[]): number {
	const value = table[key];
	if (typeof value !== 'number' || !(value >= 0 && value <= 1)) {
		problems.push(localize('askStrategy.share', "{0}: {1} must be a number from 0 to 1, as 0.75 for six passages of eight.", where, key));
		return 0;
	}
	return value;
}

/** The text `key` of `table`, one of `choices` when given, or the problem with it; `fallback` when it is not given. */
function text(table: TomlTable, key: string, where: string, problems: string[], choices?: readonly string[], fallback?: string): string {
	const value = table[key] ?? fallback;
	if (typeof value !== 'string' || !value.trim()) {
		problems.push(choices ? localize('askStrategy.choiceNeeded', "{0}: needs {1}, one of {2}.", where, key, choices.join(', ')) : localize('askStrategy.textNeeded', "{0}: needs {1}.", where, key));
		return '';
	}
	if (choices && !choices.includes(value)) {
		problems.push(localize('askStrategy.choice', "{0}: {1} cannot be \"{2}\" (it can be {3}).", where, key, value, choices.join(', ')));
	}
	return value.trim();
}

/** One step of a strategy's file, as its `[[steps]]` table #`index` gives it, or undefined with its problems. */
function stepOfTable(table: unknown, index: number, problems: string[]): AskPollisStrategyStep | undefined {
	const where = localize('askStrategy.stepWhere', "[[steps]] #{0}", index + 1);
	if (!isTable(table)) {
		problems.push(localize('askStrategy.stepTable', "{0}: must be a table.", where));
		return undefined;
	}
	const before = problems.length;
	const step = text(table, 'step', where, problems, ['search', 'rerank', 'answer']);
	if (problems.length > before) {
		return undefined;
	}
	const at = `${where} (${step})`;
	switch (step) {
		case 'search': {
			const adaptive = table.panelNear !== undefined || table.panelFar !== undefined;
			problems.push(...unknownKeys(table, adaptive ? ['step', 'panelNear', 'panelFar'] : ['step', 'panelShare'], at));
			if (adaptive) {
				return { step, panelShare: { near: share(table, 'panelNear', at, problems), far: share(table, 'panelFar', at, problems) } };
			}
			return { step, panelShare: share(table, 'panelShare', at, problems) };
		}
		case 'rerank':
			problems.push(...unknownKeys(table, ['step', 'by', 'query'], at));
			text(table, 'by', at, problems, ['reranker']);
			return { step, by: 'reranker', query: text(table, 'query', at, problems, ['question', 'panel'], 'question') === 'panel' ? 'panel' : 'question' };
		default: {
			problems.push(...unknownKeys(table, ['step', 'panel'], at));
			const panel = text(table, 'panel', at, problems, ['named', 'card', 'none']);
			return { step: 'answer', panel: panel === 'card' || panel === 'none' ? panel : 'named' };
		}
	}
}

/**
 * The strategy of a file of ~/.pollis/ask/strategies/, its TOML read as `data`, or its problems: a key Pollis does not
 * know, a value it cannot take, an id of a strategy in `taken`, steps that are not search, rerank if any, and answer.
 */
export function askStrategyOfFile(data: unknown, file: string, taken: ReadonlySet<string>): { readonly strategy?: IAskPollisStrategy; readonly problems: readonly string[] } {
	const problems: string[] = [];
	if (!isTable(data)) {
		return { problems: [localize('askStrategy.notToml', "It is not a strategy: it needs [strategy] and [[steps]].")] };
	}
	problems.push(...unknownKeys(data, ['strategy', 'steps'], localize('askStrategy.fileWhere', "The file")));
	const head = isTable(data.strategy) ? data.strategy : undefined;
	if (!head) {
		problems.push(localize('askStrategy.noHead', "It needs [strategy], with its id, label and description."));
	}
	const where = '[strategy]';
	const table = head ?? {};
	problems.push(...(head ? unknownKeys(head, ['id', 'label', 'description', 'author'], where) : []));
	const id = head ? text(table, 'id', where, problems) : '';
	if (id && !/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)) {
		problems.push(localize('askStrategy.id', "{0}: the id \"{1}\" must be letters, digits, - and _, starting with a letter.", where, id));
	} else if (id && taken.has(id)) {
		problems.push(localize('askStrategy.taken', "{0}: another strategy has the id \"{1}\".", where, id));
	}
	const label = head ? text(table, 'label', where, problems) : '';
	const description = head ? text(table, 'description', where, problems) : '';
	const author = typeof table.author === 'string' && table.author.trim() ? table.author.trim() : undefined;
	const tables = Array.isArray(data.steps) ? data.steps : [];
	const steps = tables.map((step, index) => stepOfTable(step, index, problems)).filter((step): step is AskPollisStrategyStep => !!step);
	const order = steps.map(step => step.step).join(',');
	if (steps.length === tables.length && order !== 'search,answer' && order !== 'search,rerank,answer') {
		problems.push(localize('askStrategy.order', "[[steps]]: a strategy takes the steps search, rerank if it reranks, and answer, in that order, each once."));
	}
	return problems.length ? { problems } : { strategy: { id, label, description, steps, ...(author ? { author } : {}), file }, problems };
}

/** The answering strategies: Pollis' own and those of ~/.pollis/ask/strategies/. */
export interface IAskPollisStrategiesService {
	readonly _serviceBrand: undefined;
	/** Fires when a file of ~/.pollis/ask/strategies/ is added, changed or removed. */
	readonly onDidChange: Event<void>;
	/** Settles once the files have been read the first time. */
	readonly loaded: Promise<void>;
	/** Pollis' own strategies, then those of the files, by name. */
	getStrategies(): readonly IAskPollisStrategy[];
	/** The files of ~/.pollis/ask/strategies/ that are not strategies, and why. */
	getProblems(): readonly IAskStrategyProblem[];
	/** The folder of the user's strategies, ~/.pollis/ask/strategies. */
	folder(): Promise<URI>;
}

export const IAskPollisStrategiesService = createDecorator<IAskPollisStrategiesService>('askPollisStrategiesService');

/** The step `step` of `strategy`, if it takes it. */
function stepOf<K extends AskPollisStrategyStep['step']>(strategy: IAskPollisStrategy, step: K): Extract<AskPollisStrategyStep, { step: K }> | undefined {
	return strategy.steps.find((candidate): candidate is Extract<AskPollisStrategyStep, { step: K }> => candidate.step === step);
}

/** Whether `strategy` reranks with `reranker`, the reranker of Set Active Models, empty for none. */
export function askStrategyReranks(strategy: IAskPollisStrategy, reranker: string | undefined): boolean {
	return !!reranker && !!stepOf(strategy, 'rerank');
}

/**
 * The question after its `context`, the Context below the question (the panel's title when asked in a panel, or what
 * the user wrote in its place), as it is searched and as the reranker of Panel Aware is asked it: "What does this panel
 * check?" says nothing of its subject by itself. Without a context, the question alone.
 */
export function askInContext(question: string, context: string | undefined): string {
	const trimmed = context?.trim();
	return trimmed ? `${trimmed}: ${question}` : question;
}

/**
 * The search that `strategy` makes of `request`, asked with `context`, `kept` passages going to the model in the end:
 * the question is searched after its context, so that its words, its embedding, the routing and the panel's share know
 * what it is about.
 */
export function askStrategySearchRequest(strategy: IAskPollisStrategy, request: IAskPollisSearchRequest, context: string | undefined, kept: number, reranker: string | undefined): IAskPollisSearchRequest {
	const search = stepOf(strategy, 'search');
	return {
		...request,
		question: askInContext(request.question, context),
		passages: askStrategyReranks(strategy, reranker) ? kept * ASK_RERANK_WIDER : request.passages,
		panel: search ? request.panel : undefined,
		panelShare: search?.panelShare,
	};
}

/**
 * What a search found for a question, a key of the passages kept between runs of Evaluate Answering Models: the
 * question alone for the search of the default strategy without a panel.
 */
export function askStrategySearchKey(strategy: IAskPollisStrategy, request: IAskPollisSearchRequest): string {
	const panel = request.panel ? `${request.panel.title}\n${request.panel.packages.join(',')}` : '';
	return strategy.id === ASK_BASE_STRATEGY && !panel && request.passages === undefined
		? request.question
		: [strategy.id, JSON.stringify(request.panelShare ?? ''), request.passages ?? '', panel, request.question].join('\n');
}

/** Whether `passage` is of `panel`'s own: one of its wikis, titled after it, or the vignette of one of its packages. */
function isPanelPassage(passage: IAskPollisPassage, panel: IAskPollisPanel): boolean {
	return passage.kind === 'wiki' ? passage.title === panel.title : passage.kind === 'vignette' && panel.packages.includes(passage.title);
}

/**
 * The passages `strategy` keeps of those found for `question`, asked in `panel` with `context`, `kept` of them, and
 * the error of the reranker when it did not answer. Asked in a panel, the reranker orders the panel's own passages and
 * the others apart, and each keeps the share it has of those found, the share the search gave it: a passage of
 * another panel that answers "What does this panel check?" as well as the panel's own does not push them out.
 */
export async function askStrategyRerank(strategy: IAskPollisStrategy, askPollisService: IAskPollisService, reranker: string | undefined, question: string, panel: IAskPollisPanel | undefined, context: string | undefined, result: IAskPollisSearchResult, kept: number): Promise<{ readonly result: IAskPollisSearchResult; readonly failed?: string }> {
	if (!askStrategyReranks(strategy, reranker) || !result.passages.length) {
		return { result };
	}
	const found = result.passages;
	const query = stepOf(strategy, 'rerank')?.query === 'panel' ? askInContext(question, context) : question;
	const reranked = await askPollisService.rerank(reranker!, query, found);
	const scores = reranked.scores;
	if (!scores) {
		return { result: { ...result, passages: found.slice(0, kept) }, failed: reranked.error ?? '' };
	}
	const best = (positions: readonly number[]) => [...positions].sort((a, b) => scores[b] - scores[a]);
	const positions = found.map((_, position) => position);
	const own = panel ? best(positions.filter(position => isPanelPassage(found[position], panel))) : [];
	const others = best(positions.filter(position => !own.includes(position)));
	// The panel's share of those kept, as of those found; when either has too few, the other gives the rest
	const share = Math.min(own.length, Math.ceil(kept * own.length / found.length - 1e-9));
	const fromOwn = Math.max(share, kept - others.length);
	const passages: IAskPollisPassage[] = best([...own.slice(0, fromOwn), ...others.slice(0, kept - fromOwn)]).map(position => found[position]);
	return { result: { ...result, passages } };
}

/** The panel `strategy` tells the model of, asked in `panel`: its card only when the strategy gives it. */
export function askStrategyAnswerPanel(strategy: IAskPollisStrategy, panel: IAskPollisPanel | undefined): IAskPollisPanel | undefined {
	const told = stepOf(strategy, 'answer')?.panel;
	if (!panel || !told || told === 'none') {
		return undefined;
	}
	return told === 'card' ? panel : { title: panel.title, packages: panel.packages };
}
