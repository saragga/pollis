/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { localize, localize2 } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { ASK_CHAT_MODEL, IAskPollisAnswer, IAskPollisPassage, IAskPollisService } from '../common/askPollis.js';
import { askNothingFound, askOpenPassage, askPassageView, askSearchIn, askWordsOnlyNote } from './askPollisWebview.js';
import { ICompareModel, ICompareModelsContext, ICompareModelsTab, ICompareModelsTabHost } from './compareModelsTabs.js';

// One Question of Compare Models: a question, its passages found once, in the sources that Search In chooses as on the
// Ask Pollis page (Pollis' own documents, the Julia Manual, the nearest or all), and each model's answer from them in a column
// of its own, with its Sources, the time to its first word, the seconds it took and, for a local model, how fast it
// read and wrote as llama-server measures it. The cloud models answer together; the local models one after the
// other, each server stopped once it has answered, and the chat model of Ask Pollis before them, so that each runs
// alone in memory. The time is from the question sent to a model already started, so a model's loading is not in it.

const ID = 'oneQuestion';

type OneQuestionMessage =
	| { readonly command: 'collections' }
	| { readonly command: 'ask'; readonly question: string; readonly collection: string }
	| { readonly command: 'stop' }
	| { readonly command: 'open'; readonly passage: number };

/** Why a model gave no answer, or nothing when it gave one or was stopped. */
function answerError(answer: IAskPollisAnswer, text: string, stopped: boolean): string | undefined {
	if (answer.noKey) {
		return localize('compareModels.noKey', "No key for {0}: set it on the Ask Pollis page, with the key indicator beside Answer With.", answer.noKey.label);
	}
	if (answer.refused) {
		return localize('compareModels.refused', "{0} declined to answer the question.", answer.model);
	}
	return answer.error === undefined && (text || stopped) ? undefined : localize('compareModels.notAnswered', "{0} did not answer. {1}", answer.model, answer.error ?? '');
}

function create(accessor: ServicesAccessor, context: ICompareModelsContext): ICompareModelsTabHost {
	const askPollisService = accessor.get(IAskPollisService);
	const commandService = accessor.get(ICommandService);
	const configurationService = accessor.get(IConfigurationService);

	let passages: readonly IAskPollisPassage[] = [];
	// Those of the index, for Search In
	let collections: readonly string[] = [];
	let running: CancellationTokenSource | undefined;

	const stopServer = (model: string) => commandService.executeCommand('language-julia.pollisStopLlamaServer', { model }).catch(() => undefined);

	const ask = async (question: string, collection: string) => {
		running?.dispose(true);
		const source = running = new CancellationTokenSource();
		const current = () => running === source;
		const models = context.models();
		context.post({ command: 'searching', question, columns: models.map(model => ({ label: model.label, local: !!model.file })) });
		if (!models.length) {
			context.post({ command: 'finished', error: localize('compareModels.noModels', "Choose the models to compare, above.") });
			return;
		}
		const result = await askPollisService.search({ question, collections: askSearchIn(collection, collections) });
		if (!current()) {
			return;
		}
		passages = result.passages;
		collections = result.collections;
		context.post({ command: 'found', searched: result.searched, collections, note: askWordsOnlyNote(result), passages: passages.map(askPassageView) });
		if (!passages.length) {
			context.post({ command: 'finished', error: askNothingFound(result) });
			return;
		}

		const answerWith = async (model: ICompareModel, column: number) => {
			if (source.token.isCancellationRequested) {
				context.post({ command: 'done', column, stopped: true });
				return;
			}
			context.post({ command: 'starting', column, model: model.label, local: !!model.file });
			let text = '';
			const answer = await askPollisService.answer([], question, passages, answered => {
				text = answered;
				if (current()) {
					context.post({ command: 'text', column, text });
				}
			}, source.token, model.value);
			if (model.file) {
				await stopServer(model.file);
			}
			if (current()) {
				const stopped = source.token.isCancellationRequested;
				context.post({ command: 'done', column, stopped, error: answerError(answer, text, stopped), timings: answer.timings });
			}
		};
		const columns = models.map((model, column) => ({ model, column }));
		const local = columns.filter(({ model }) => model.file);
		if (local.length) {
			await stopServer(configurationService.getValue<string>('pollis.ask.chatModel')?.trim() || ASK_CHAT_MODEL);
		}
		await Promise.all([
			(async () => {
				for (const { model, column } of local) {
					await answerWith(model, column);
				}
			})(),
			...columns.filter(({ model }) => !model.file).map(({ model, column }) => answerWith(model, column)),
		]);
		if (current()) {
			running = undefined;
			context.post({ command: 'finished' });
		}
		source.dispose();
	};

	return {
		onMessage: (message: OneQuestionMessage) => {
			if (message.command === 'collections') {
				askPollisService.collections().then(names => {
					collections = names;
					context.post({ command: 'collections', collections });
				});
			} else if (message.command === 'ask' && message.question.trim()) {
				ask(message.question.trim(), message.collection);
			} else if (message.command === 'stop') {
				running?.cancel();
			} else if (message.command === 'open' && passages[message.passage]) {
				askOpenPassage(commandService, passages[message.passage]);
			}
		},
		dispose: () => running?.dispose(true),
	};
}

export const oneQuestionTab: ICompareModelsTab = {
	id: ID,
	commandId: 'pollis.compareModels.oneQuestion',
	commandTitle: localize2('compareModels.oneQuestionAction', "Compare Models: One Question"),
	label: () => localize('compareModels.oneQuestion', "One Question"),
	css: `
		.columns { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 16px; }
		.column { border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 12px; min-width: 0; }
		.column h2 { font-size: 14px; font-weight: 600; margin: 0 0 2px 0; }
		.column .figures { margin: 4px 0 8px 0; }
	`,
	html: () => `
		<textarea id="oneQuestion-question" rows="3" placeholder="${localize('compareModels.placeholder', "A question every model chosen answers from the same passages")}"></textarea>
		<div class="row">
			<span class="grow"></span>
			<span id="oneQuestion-searchIn" hidden><span class="small">${localize('compareModels.searchIn', "Search In")}</span> <select id="oneQuestion-collection"></select></span>
			<span class="bar"><button class="action current" id="oneQuestion-ask">${localize('compareModels.ask', "Ask")}</button></span>
		</div>
		<div class="small status" id="oneQuestion-status"></div>
		<div class="columns" id="oneQuestion-columns"></div>
	`,
	script: () => {
		const text = {
			ask: localize('compareModels.ask', "Ask"),
			stop: localize('compareModels.stop', "Stop"),
			searching: localize('compareModels.searching', "Finding the passages..."),
			found: localize('compareModels.found', "The same {0} passages for every model.", '{0}'),
			searched: localize('compareModels.searched', "Searched: {0}.", '{0}'),
			thisComputer: localize('compareModels.thisComputer', "This Computer"),
			cloud: localize('compareModels.cloud', "Cloud"),
			waiting: localize('compareModels.waiting', "Waiting for the local models before it."),
			starting: localize('compareModels.starting', "Starting {0} on this computer. The first time, it is downloaded first.", '{0}'),
			asking: localize('compareModels.asking', "Asking {0}...", '{0}'),
			stopped: localize('compareModels.stopped', "Stopped."),
			firstWord: localize('compareModels.firstWord', "First word {0} ms", '{0}'),
			seconds: localize('compareModels.seconds', "{0} s", '{0}'),
			reading: localize('compareModels.reading', "Reading {0} tokens/s", '{0}'),
			writing: localize('compareModels.writing', "Writing {0} tokens/s", '{0}'),
		};
		return `
	(() => {
		const TEXT = ${JSON.stringify(text)};
		const question = document.getElementById('oneQuestion-question');
		const askButton = document.getElementById('oneQuestion-ask');
		const collection = document.getElementById('oneQuestion-collection');
		const setCollections = names => setSearchIn(document.getElementById('oneQuestion-searchIn'), collection, names);
		const status = document.getElementById('oneQuestion-status');
		const columnsBox = document.getElementById('oneQuestion-columns');
		let columns = [];
		let passages = [];
		let answering = false;

		function setAnswering(value) {
			answering = value;
			askButton.textContent = value ? TEXT.stop : TEXT.ask;
		}

		function ask() {
			if (answering) {
				postTab('${ID}', { command: 'stop' });
				return;
			}
			const text = question.value.trim();
			if (!text) { return; }
			setAnswering(true);
			postTab('${ID}', { command: 'ask', question: text, collection: collection.value });
		}

		/** The figures of an answer: the time to its first word, its seconds and, for a local model, how fast it read and wrote. */
		function figures(timings) {
			const parts = [];
			if (timings.firstWord !== undefined) { parts.push(TEXT.firstWord.replace('{0}', String(Math.round(timings.firstWord)))); }
			parts.push(TEXT.seconds.replace('{0}', timings.seconds.toFixed(1)));
			if (timings.reading !== undefined) { parts.push(TEXT.reading.replace('{0}', timings.reading.toFixed(0))); }
			if (timings.writing !== undefined) { parts.push(TEXT.writing.replace('{0}', timings.writing.toFixed(1))); }
			return parts.join(' · ');
		}

		function renderColumn(column) {
			column.answerBox.innerHTML = markdown(column.answer, passages.length);
			renderSources(column.sources, passages, column.answer, column.done, passage => postTab('${ID}', { command: 'open', passage }));
		}

		askButton.addEventListener('click', ask);
		question.addEventListener('keydown', event => {
			if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
				event.preventDefault();
				ask();
			}
		});
		columnsBox.addEventListener('click', event => showSource(event, 'column'));

		TABS['${ID}'] = {
			onMessage(message) {
				const column = columns[message.column];
				if (message.command === 'collections') {
					setCollections(message.collections);
				} else if (message.command === 'searching') {
					passages = [];
					status.textContent = TEXT.searching;
					status.classList.remove('error');
					columnsBox.textContent = '';
					columns = message.columns.map(model => {
						const box = element('div', 'column');
						box.appendChild(element('h2', '', model.label));
						box.appendChild(element('div', 'small', model.local ? TEXT.thisComputer : TEXT.cloud));
						const figuresBox = element('div', 'small figures');
						const columnStatus = element('div', 'small status', model.local ? TEXT.waiting : '');
						const answerBox = element('div', 'answer');
						const sources = element('div', 'sources');
						box.append(figuresBox, columnStatus, answerBox, sources);
						columnsBox.appendChild(box);
						return { figures: figuresBox, status: columnStatus, answerBox, sources, answer: '', done: false };
					});
				} else if (message.command === 'found') {
					passages = message.passages;
					setCollections(message.collections);
					status.textContent = [TEXT.found.replace('{0}', String(passages.length)), message.searched.length ? TEXT.searched.replace('{0}', message.searched.join(', ')) : '', message.note].filter(part => part).join(' ');
				} else if (message.command === 'finished') {
					if (message.error) {
						status.textContent = message.error;
						status.classList.add('error');
					}
					setAnswering(false);
				} else if (!column) {
					return;
				} else if (message.command === 'starting') {
					column.status.textContent = (message.local ? TEXT.starting : TEXT.asking).replace('{0}', message.model);
					column.status.insertAdjacentHTML('afterbegin', SPINNER);
				} else if (message.command === 'text') {
					column.status.textContent = '';
					column.answer = message.text;
					renderColumn(column);
				} else if (message.command === 'done') {
					column.done = true;
					column.status.textContent = message.error || (message.stopped ? TEXT.stopped : '');
					column.status.classList.toggle('error', !!message.error);
					column.figures.textContent = message.timings && !message.error ? figures(message.timings) : '';
					renderColumn(column);
				}
			},
			shown() {
				question.focus();
			},
		};
		// Search In, before any question, with the collections of the index
		setCollections([]);
		postTab('${ID}', { command: 'collections' });
	})();
`;
	},
	create,
};
