/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { ASK_RERANK_WIDER, IAskPollisPanel, IAskPollisPanelShare, IAskPollisPassage, IAskPollisSearchRequest, IAskPollisSearchResult, IAskPollisService } from './askPollis.js';

// The styles of Ask Pollis: each a way of answering, written as a list of steps that the pane (askPollisPage.ts) and
// Evaluate Answering Models (compareModelsRun.ts) both follow, so that what is evaluated is what the pane does. The
// steps are data, never code: a style says which steps it takes and with what settings, and the functions below
// carry them out.

/** A step of a style of Ask Pollis. */
export type AskPollisStyleStep =
	/**
	 * Finds the passages: asked in a panel, `panelShare` of them from the panel's own, the rest routed as without it; a
	 * share `{ near, far }` depends on how near the panel's passages are to the question.
	 */
	| { readonly step: 'search'; readonly panelShare: number | IAskPollisPanelShare }
	/**
	 * Reranks them with the reranker of Set Active Models, when one is set, choosing among ASK_RERANK_WIDER times as many
	 * found; `query: 'panel'` asks the reranker the question as asked in the panel, by its name.
	 */
	| { readonly step: 'rerank'; readonly by: 'reranker'; readonly query?: 'question' | 'panel' }
	/**
	 * Asks the model: asked in a panel, `named` tells it the panel and its menu, `card` what the panel holds too (its
	 * models, Key Points, decision table, inputs and packages), `none` nothing of the panel.
	 */
	| { readonly step: 'answer'; readonly panel: 'named' | 'card' | 'none' };

/** A style of Ask Pollis: its id, which the setting pollis.ask.style holds, its name, and its steps in order. */
export interface IAskPollisStyle {
	readonly id: string;
	readonly label: string;
	readonly description: string;
	readonly steps: readonly AskPollisStyleStep[];
}

/** The style of Ask Pollis when the setting pollis.ask.style names no other. */
export const ASK_DEFAULT_STYLE = 'classical';

/** The styles of Ask Pollis. */
export const ASK_POLLIS_STYLES: readonly IAskPollisStyle[] = [
	{
		id: ASK_DEFAULT_STYLE,
		label: localize('askPollis.styleClassical', "Classical"),
		description: localize('askPollis.styleClassicalDescription', "Asked in a panel, five of the eight passages come from the panel's wikis and the vignettes of its packages, the rest routed as without it; a reranker, when set, chooses among three times as many; the model is told the panel's name and menu."),
		steps: [
			{ step: 'search', panelShare: 5 / 8 },
			{ step: 'rerank', by: 'reranker' },
			{ step: 'answer', panel: 'named' },
		],
	},
	{
		id: 'panelAware',
		label: localize('askPollis.stylePanelAware', "Panel Aware"),
		description: localize('askPollis.stylePanelAwareDescription', "Asked in a panel, six of the eight passages come from the panel's wikis and the vignettes of its packages when they are near the question, two when they are not; a reranker, when set, is asked the question as asked in the panel; the model is told the panel's name and menu, and what the panel holds: its models, Key Points, decision table, inputs and packages."),
		steps: [
			{ step: 'search', panelShare: { near: 6 / 8, far: 2 / 8 } },
			{ step: 'rerank', by: 'reranker', query: 'panel' },
			{ step: 'answer', panel: 'card' },
		],
	},
];

/** The style `id`, or the default one when there is none of that id. */
export function askPollisStyle(id: string | undefined): IAskPollisStyle {
	return ASK_POLLIS_STYLES.find(style => style.id === id) ?? ASK_POLLIS_STYLES[0];
}

/** The step `step` of `style`, if it takes it. */
function stepOf<K extends AskPollisStyleStep['step']>(style: IAskPollisStyle, step: K): Extract<AskPollisStyleStep, { step: K }> | undefined {
	return style.steps.find((candidate): candidate is Extract<AskPollisStyleStep, { step: K }> => candidate.step === step);
}

/** Whether `style` reranks with `reranker`, the reranker of Set Active Models, empty for none. */
export function askStyleReranks(style: IAskPollisStyle, reranker: string | undefined): boolean {
	return !!reranker && !!stepOf(style, 'rerank');
}

/** The search that `style` makes of `request`, `kept` passages going to the model in the end. */
export function askStyleSearchRequest(style: IAskPollisStyle, request: IAskPollisSearchRequest, kept: number, reranker: string | undefined): IAskPollisSearchRequest {
	const search = stepOf(style, 'search');
	return {
		...request,
		passages: askStyleReranks(style, reranker) ? kept * ASK_RERANK_WIDER : request.passages,
		panel: search ? request.panel : undefined,
		panelShare: search?.panelShare,
	};
}

/**
 * What a search found for a question, a key of the passages kept between runs of Evaluate Answering Models: the
 * question alone for the search of the default style without a panel, as before there were styles.
 */
export function askStyleSearchKey(style: IAskPollisStyle, request: IAskPollisSearchRequest): string {
	const panel = request.panel ? `${request.panel.title}\n${request.panel.packages.join(',')}` : '';
	return style.id === ASK_DEFAULT_STYLE && !panel && request.passages === undefined
		? request.question
		: [style.id, JSON.stringify(request.panelShare ?? ''), request.passages ?? '', panel, request.question].join('\n');
}

/** The passages `style` keeps of those found for `question`, asked in `panel`, `kept` of them, and the error of the reranker when it did not answer. */
export async function askStyleRerank(style: IAskPollisStyle, askPollisService: IAskPollisService, reranker: string | undefined, question: string, panel: IAskPollisPanel | undefined, result: IAskPollisSearchResult, kept: number): Promise<{ readonly result: IAskPollisSearchResult; readonly failed?: string }> {
	if (!askStyleReranks(style, reranker) || !result.passages.length) {
		return { result };
	}
	const found = result.passages;
	const query = stepOf(style, 'rerank')?.query === 'panel' && panel ? `In the panel ${panel.title} of Pollis: ${question}` : question;
	const reranked = await askPollisService.rerank(reranker!, query, found);
	const scores = reranked.scores;
	if (!scores) {
		return { result: { ...result, passages: found.slice(0, kept) }, failed: reranked.error ?? '' };
	}
	const passages: IAskPollisPassage[] = found.map((_, position) => position).sort((a, b) => scores[b] - scores[a]).slice(0, kept).map(position => found[position]);
	return { result: { ...result, passages } };
}

/** The panel `style` tells the model of, asked in `panel`: its card only when the style gives it. */
export function askStyleAnswerPanel(style: IAskPollisStyle, panel: IAskPollisPanel | undefined): IAskPollisPanel | undefined {
	const told = stepOf(style, 'answer')?.panel;
	if (!panel || !told || told === 'none') {
		return undefined;
	}
	return told === 'card' ? panel : { title: panel.title, packages: panel.packages };
}
