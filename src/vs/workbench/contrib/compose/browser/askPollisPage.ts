/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { raceCancellation, timeout } from '../../../../base/common/async.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../nls.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ConfigurationTarget, IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { IWebviewService } from '../../webview/browser/webview.js';
import { createApiKeyWiring, IApiKeyWiring } from '../../model/browser/handlers/model.handler.js';
import { spinnerCss, spinnerSvg, voiceButtonsCss, voiceButtonsHtml, voiceButtonsScript } from '../../model/browser/webviews/webviewScaffold.js';
import { ASK_CHAT_MODEL, ASK_CLOUD_MODELS, ASK_EMBEDDING_MODEL, ASK_PASSAGE_PREFIX, ASK_PASSAGES, ASK_QUERY_PREFIX, ASK_CLOUD_PROVIDERS, ASK_THIS_COMPUTER, askCloudModel, AskPollisProvider, IAskPollisPassage, IAskPollisService } from '../common/askPollis.js';
import { askAnswerCss, askAnswerScript, askModelName, askNothingFound, askOpenPassage, askPassageView, askSearchIn, askWordsOnlyNote } from './askPollisWebview.js';
import { COMPARE_MODELS_COMMAND_ID } from './compareModelsPage.js';

// Help > Ask Pollis: a question in your own words, answered from Pollis' own documents and the Julia Manual. The
// question is searched in PollisDocuments (IAskPollisService.search), with the one before it in the conversation, so
// that a follow-up finds what it follows; the model of Answer With (pollis.ask.answerWith) then writes the answer from
// the passages found, as it comes, a number in brackets after each statement: the chat model of pollis.ask.chatModel on
// this computer, or a cloud model of Anthropic, Google or OpenAI with the user's own key, kept in Secret Storage, which
// the key indicator beside Answer With sets. A cloud model is sent the question, the conversation so far and the
// passages, never a file. Under it, Sources lists the passages cited, or all of them when none is, each with Open,
// which opens the PDF at its page, the panel's wiki at its heading, or the Julia Manual at its section
// (askPollisWebview.ts). The conversation is kept only while the page is open; New Conversation starts it again.
// Compare Models... opens Compare Models (compareModelsPage.ts).

export const ASK_POLLIS_COMMAND_ID = 'pollis.askPollis';

type AskPollisMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'ask'; readonly question: string; readonly collection: string }
	| { readonly command: 'stop' }
	| { readonly command: 'newConversation' }
	| { readonly command: 'open'; readonly turn: number; readonly passage: number }
	| { readonly command: 'answerWith'; readonly value: string }
	| { readonly command: 'setApiKey' }
	| { readonly command: 'clearApiKey' }
	| { readonly command: 'compareModels' };

/** A question of the conversation, the passages found for it and its answer so far. */
interface IAskedTurn {
	readonly question: string;
	readonly passages: readonly IAskPollisPassage[];
	answer: string;
}

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** How far the Julia extension has come with the documents and their index (pollisDocuments.ts). */
interface IIndexProgress {
	readonly stage: 'compiling' | 'installing' | 'reading' | 'embedding';
	readonly done: number;
	readonly total: number;
}

/** What a question waiting for the first index shows beside the spinner: the stage and how far it has come. */
function indexingText(progress: IIndexProgress): string {
	const percent = progress.total ? Math.min(100, Math.round(100 * progress.done / progress.total)) : 0;
	switch (progress.stage) {
		case 'compiling':
			return localize('askPollis.compiling', "Compiling the documents: {0}%. The question is answered when they are indexed.", percent);
		case 'installing':
			return localize('askPollis.installingDuckDB', "Installing DuckDB, which the index of the documents needs. The question is answered when they are indexed.");
		case 'reading':
			return localize('askPollis.indexing', "Indexing the documents: {0}%. The question is answered when they are indexed.", percent);
		case 'embedding':
			return localize('askPollis.embedding', "Embedding the passages: {0}%. The question is answered when they are indexed.", percent);
	}
}

/** Opens the Ask Pollis page, or shows it again when it is open. */
async function openAskPollisPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const askPollisService = accessor.get(IAskPollisService);
	const commandService = accessor.get(ICommandService);
	const configurationService = accessor.get(IConfigurationService);
	const secretStorageService = accessor.get(ISecretStorageService);
	const quickInputService = accessor.get(IQuickInputService);
	const webviewService = accessor.get(IWebviewService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('askPollis.title', "Ask Pollis");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.askPollis',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());
	openPage = webviewInput;

	const disposables = new DisposableStore();
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const chatModel = () => askModelName(configurationService.getValue<string>('pollis.ask.chatModel')?.trim() || ASK_CHAT_MODEL);
	const cloudModel = () => askCloudModel(configurationService.getValue<string>('pollis.ask.answerWith'));
	// The key indicator beside Answer With, of the chosen model's provider
	const keys: { [provider in Exclude<AskPollisProvider, 'local'>]: IApiKeyWiring } = {
		anthropic: createApiKeyWiring(webviewInput.webview, { label: ASK_CLOUD_PROVIDERS.anthropic.label, fields: [{ secretKey: ASK_CLOUD_PROVIDERS.anthropic.secretKey, envVar: ASK_CLOUD_PROVIDERS.anthropic.envVar, prompt: localize('askPollis.anthropicKey', "Anthropic API key") }] }, secretStorageService, quickInputService, webviewService),
		google: createApiKeyWiring(webviewInput.webview, { label: ASK_CLOUD_PROVIDERS.google.label, fields: [{ secretKey: ASK_CLOUD_PROVIDERS.google.secretKey, envVar: ASK_CLOUD_PROVIDERS.google.envVar, prompt: localize('askPollis.googleKey', "Google API key") }] }, secretStorageService, quickInputService, webviewService),
		openai: createApiKeyWiring(webviewInput.webview, { label: ASK_CLOUD_PROVIDERS.openai.label, fields: [{ secretKey: ASK_CLOUD_PROVIDERS.openai.secretKey, envVar: ASK_CLOUD_PROVIDERS.openai.envVar, prompt: localize('askPollis.openaiKey', "OpenAI API key") }] }, secretStorageService, quickInputService, webviewService),
	};
	const postModel = () => {
		const cloud = cloudModel();
		post({
			command: 'model',
			answerWith: cloud?.id ?? ASK_THIS_COMPUTER,
			model: cloud?.label ?? chatModel(),
			provider: cloud ? ASK_CLOUD_PROVIDERS[cloud.provider].label : undefined,
		});
		if (cloud) {
			keys[cloud.provider].postStatus();
		}
	};

	let turns: IAskedTurn[] = [];
	let collections: readonly string[] = [];
	let answering: CancellationTokenSource | undefined;
	// A new conversation drops what the questions of the one before still send
	let conversation = 0;

	const ask = async (question: string, collection: string) => {
		answering?.dispose(true);
		const source = answering = new CancellationTokenSource();
		const asked = conversation;
		const index = turns.length;
		const before = turns.filter(turn => turn.answer);
		const previous = turns.at(-1)?.question;
		post({ command: 'searching', turn: index, question });
		const search = () => askPollisService.search({
			question: previous ? `${previous}\n${question}` : question,
			collections: askSearchIn(collection, collections),
		});
		let result = await search();
		// Before the first index, the question waits for it, with how far it has come, while the Julia extension makes it
		while (result.wordsOnly === 'notIndexed' && asked === conversation && !source.token.isCancellationRequested) {
			const progress = await commandService.executeCommand<IIndexProgress>('language-julia.pollisAskIndexProgress').catch(() => undefined);
			if (!progress) {
				break;
			}
			post({ command: 'indexing', turn: index, text: indexingText(progress) });
			await raceCancellation(timeout(1000), source.token);
			if (asked === conversation && !source.token.isCancellationRequested) {
				result = await search();
			}
		}
		if (asked !== conversation) {
			return;
		}
		if (source.token.isCancellationRequested && result.wordsOnly === 'notIndexed') {
			turns.push({ question, passages: [], answer: '' });
			post({ command: 'done', turn: index, stopped: true });
			return;
		}
		collections = result.collections;
		const turn: IAskedTurn = { question, passages: result.passages, answer: '' };
		turns.push(turn);
		post({
			command: 'found',
			turn: index,
			searched: result.searched,
			collections: result.collections,
			note: askWordsOnlyNote(result),
			passages: result.passages.map(askPassageView),
		});
		if (!result.passages.length) {
			post({ command: 'done', turn: index, error: askNothingFound(result) });
			return;
		}
		if (source.token.isCancellationRequested) {
			post({ command: 'done', turn: index, stopped: true });
			return;
		}
		const cloud = cloudModel();
		post({ command: 'starting', turn: index, model: cloud?.label ?? chatModel(), cloud: !!cloud });
		const answer = await askPollisService.answer(before, question, result.passages, text => {
			if (asked === conversation) {
				turn.answer = text;
				post({ command: 'text', turn: index, text });
			}
		}, source.token);
		if (asked !== conversation) {
			return;
		}
		const stopped = source.token.isCancellationRequested;
		post({
			command: 'done',
			turn: index,
			stopped,
			error: answer.noKey ? localize('askPollis.noKey', "No key for {0}: set the key with the key indicator beside Answer With.", answer.noKey.label)
				: answer.refused ? localize('askPollis.refused', "{0} declined to answer the question.", answer.model)
					: answer.error === undefined && (turn.answer || stopped) ? undefined : localize('askPollis.notAnswered', "{0} did not answer. {1}", answer.model, answer.error ?? ''),
		});
		if (answering === source) {
			answering = undefined;
		}
		source.dispose();
	};

	const open = (message: { readonly turn: number; readonly passage: number }) => {
		const passage = turns[message.turn]?.passages[message.passage];
		if (passage) {
			askOpenPassage(commandService, passage);
		}
	};

	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		answering?.dispose(true);
		disposables.dispose();
	}));
	disposables.add(configurationService.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration('pollis.ask.chatModel') || e.affectsConfiguration('pollis.ask.answerWith')) {
			postModel();
		}
	}));
	disposables.add(webviewInput.webview.onMessage((e: { message: AskPollisMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			postModel();
		} else if (message.command === 'ask' && message.question.trim()) {
			ask(message.question.trim(), message.collection);
		} else if (message.command === 'stop') {
			answering?.cancel();
		} else if (message.command === 'newConversation') {
			answering?.dispose(true);
			answering = undefined;
			conversation++;
			turns = [];
		} else if (message.command === 'open') {
			open(message);
		} else if (message.command === 'compareModels') {
			commandService.executeCommand(COMPARE_MODELS_COMMAND_ID);
		} else if (message.command === 'answerWith') {
			configurationService.updateValue('pollis.ask.answerWith', message.value === ASK_THIS_COMPUTER ? undefined : message.value, ConfigurationTarget.USER);
		} else if (message.command === 'setApiKey' || message.command === 'clearApiKey') {
			const cloud = cloudModel();
			if (cloud) {
				const key = keys[cloud.provider];
				if (message.command === 'setApiKey') {
					key.handleSet();
				} else {
					key.handleClear();
				}
			}
		}
	}));
}

/** The page: its texts come from here, the answers from the messages of each question. */
function pageHtml(): string {
	const text = {
		title: localize('askPollis.title', "Ask Pollis"),
		intro: localize('askPollis.intro', "Ask a question about Pollis or Julia in your own words. The answer comes from Pollis' own documents, the panel wikis, the package vignettes, the documents of the installed toolboxes and, unless it is switched off, the Julia Manual of the Julia that Pollis runs, with the number of the passage each statement rests on: Open shows it in its document."),
		placeholder: localize('askPollis.placeholder', "How do I...? Where is...? What does this setting do?"),
		ask: localize('askPollis.ask', "Ask"),
		stop: localize('askPollis.stop', "Stop"),
		newConversation: localize('askPollis.newConversation', "New Conversation"),
		answersWith: localize('askPollis.answersWith', "Answered by {0} on this computer: nothing leaves it.", '{0}'),
		answersWithCloud: localize('askPollis.answersWithCloud', "Answered by {0} of {1}, with your own key: it is sent the question, the conversation so far and the passages found on this computer, never your files.", '{0}', '{1}'),
		answerWith: localize('askPollis.answerWith', "Answer With"),
		thisComputer: localize('askPollis.thisComputer', "This Computer"),
		setKey: localize('askPollis.setKey', "Set API key"),
		keySaved: localize('askPollis.keySaved', "API key"),
		keySavedTitle: localize('askPollis.keySavedTitle', "{0} API key saved in VS Code Secret Storage", '{0}'),
		setKeyTitle: localize('askPollis.setKeyTitle', "Store your {0} API key securely in VS Code Secret Storage", '{0}'),
		changeKey: localize('askPollis.changeKey', "change"),
		clearKey: localize('askPollis.clearKey', "clear"),
		searchIn: localize('askPollis.searchIn', "Search In"),
		searching: localize('askPollis.searching', "Finding the passages..."),
		starting: localize('askPollis.starting', "Starting {0} on this computer. The first time, it is downloaded first.", '{0}'),
		asking: localize('askPollis.asking', "Asking {0}...", '{0}'),
		searched: localize('askPollis.searched', "Searched: {0}.", '{0}'),
		stopped: localize('askPollis.stopped', "Stopped."),
		compareModels: localize('askPollis.compareModels', "Compare Models..."),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		${voiceButtonsCss}
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { max-width: 900px; margin: 0 auto; padding: 24px; }
		h1 { font-size: 32px; font-weight: 300; margin: 0 0 4px 0; line-height: 1.2; }
		.subtitle { font-size: 14px; color: var(--vscode-descriptionForeground); margin: 0 0 16px 0; line-height: 1.4; }
		.small { font-size: 12px; color: var(--vscode-descriptionForeground); line-height: 1.4; }
		textarea, select { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; padding: 6px 8px; }
		textarea { width: 100%; resize: vertical; min-height: 56px; line-height: 1.4; }
		textarea:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		.row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
		.row .grow { flex: 1; }
		.bar { display: flex; gap: 8px; }
		button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; border-radius: 2px; padding: 4px 12px; cursor: pointer; }
		.bar > button.action.current { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button:disabled { opacity: 0.5; cursor: default; }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.link:hover { text-decoration: underline; }
		.turn { margin: 0 0 24px 0; padding-bottom: 16px; border-bottom: 1px solid var(--vscode-widget-border); }
		.question { font-size: 15px; font-weight: 600; margin: 0 0 8px 0; white-space: pre-wrap; }
		${askAnswerCss}
		.status { margin: 6px 0; }
		${spinnerCss}
		.error { color: var(--vscode-errorForeground); }
		.apikey-ok { color: var(--vscode-charts-green); }
		.apikey-link { color: var(--vscode-textLink-foreground); cursor: pointer; }
		.apikey-link:hover { text-decoration: underline; }
		.apikey-sep { color: var(--vscode-descriptionForeground); opacity: 0.5; margin: 0 6px; }
		.apikey-icon { width: 12px; height: 12px; vertical-align: -2px; margin-right: 3px; }
	</style>
</head>
<body>
<div class="container">
	<div class="title-row">
		<h1>${text.title}</h1>
		${voiceButtonsHtml}
	</div>
	<p class="subtitle">${text.intro}</p>
	<div id="conversation"></div>
	<textarea id="question" rows="3" placeholder="${text.placeholder}"></textarea>
	<div class="row">
		<span class="small">${text.answerWith}</span> <select id="answerWith"></select>
		<span class="small" id="api-key-status" hidden></span>
		<span class="grow"></span>
		<span id="searchIn" hidden><span class="small">${text.searchIn}</span> <select id="collection"></select></span>
		<span class="bar" id="buttons">
			<button class="action current" id="ask">${text.ask}</button>
			<button class="action" id="newConversation">${text.newConversation}</button>
			<button class="action" id="compareModels">${text.compareModels}</button>
		</span>
	</div>
	<div class="row"><span class="small" id="model"></span></div>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${voiceButtonsScript}
	const TEXT = ${JSON.stringify(text)};
	const SPINNER = '${spinnerSvg}';
	const conversation = document.getElementById('conversation');
	const question = document.getElementById('question');
	const askButton = document.getElementById('ask');
	const collection = document.getElementById('collection');
	const answerWith = document.getElementById('answerWith');
	const keyStatus = document.getElementById('api-key-status');
	const CLOUD_MODELS = ${JSON.stringify(ASK_CLOUD_MODELS.map(model => ({ id: model.id, label: model.label })))};
	// Each question's elements and what came for it
	const turns = [];
	let answering = false;
	${askAnswerScript()}

	function renderAnswer(turn, index) {
		turn.answerBox.innerHTML = markdown(turn.answer, turn.passages.length);
		renderSources(turn.sources, turn.passages, turn.answer, turn.done, passage => vscode.postMessage({ command: 'open', turn: index, passage }));
	}

	function setAnswering(value) {
		answering = value;
		askButton.textContent = value ? TEXT.stop : TEXT.ask;
	}

	function ask() {
		if (answering) {
			vscode.postMessage({ command: 'stop' });
			return;
		}
		const text = question.value.trim();
		if (!text) { return; }
		question.value = '';
		setAnswering(true);
		vscode.postMessage({ command: 'ask', question: text, collection: collection.value });
	}

	askButton.addEventListener('click', ask);
	question.addEventListener('keydown', event => {
		if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
			event.preventDefault();
			ask();
		}
	});
	document.getElementById('newConversation').addEventListener('click', () => {
		vscode.postMessage({ command: 'newConversation' });
		turns.length = 0;
		conversation.textContent = '';
		setAnswering(false);
		question.focus();
	});
	// One blue button: the last one the pointer was on
	const bar = document.getElementById('buttons');
	bar.addEventListener('mouseover', event => {
		const button = event.target.closest('button.action');
		if (button && !button.disabled && !button.classList.contains('current')) {
			bar.querySelector('button.current')?.classList.remove('current');
			button.classList.add('current');
		}
	});
	document.getElementById('compareModels').addEventListener('click', () => vscode.postMessage({ command: 'compareModels' }));
	// A citation shows its source
	conversation.addEventListener('click', event => showSource(event, 'turn'));

	const setCollections = names => setSearchIn(document.getElementById('searchIn'), collection, names);
	setCollections([]);

	for (const [value, label] of [['${ASK_THIS_COMPUTER}', TEXT.thisComputer], ...CLOUD_MODELS.map(model => [model.id, model.label])]) {
		const option = element('option', '', label);
		option.value = value;
		answerWith.appendChild(option);
	}
	answerWith.addEventListener('change', () => vscode.postMessage({ command: 'answerWith', value: answerWith.value }));

	/** The key indicator, as the panels have it: Set API key, or API key | change | clear. */
	function renderKey(message) {
		const icon = '<svg class="apikey-icon" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10 1a5 5 0 0 0-4.9 6.02L1 11.12V15h3.88l.62-.62v-1.5h1.5v-1.5h1.5l.48-.48A5 5 0 1 0 10 1zm1.75 4.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/></svg>';
		const link = (label, command) => {
			const a = element('a', 'apikey-link', label);
			a.addEventListener('click', () => vscode.postMessage({ command }));
			return a;
		};
		keyStatus.textContent = '';
		if (message.hasKey) {
			const saved = element('span', 'apikey-ok');
			saved.innerHTML = icon + esc(TEXT.keySaved);
			saved.title = TEXT.keySavedTitle.replace('{0}', message.label);
			keyStatus.append(saved, element('span', 'apikey-sep', '|'), link(TEXT.changeKey, 'setApiKey'), element('span', 'apikey-sep', '|'), link(TEXT.clearKey, 'clearApiKey'));
		} else {
			const set = link('', 'setApiKey');
			set.innerHTML = icon + esc(TEXT.setKey);
			set.title = TEXT.setKeyTitle.replace('{0}', message.label);
			keyStatus.appendChild(set);
		}
	}

	window.addEventListener('message', event => {
		const message = event.data;
		const turn = turns[message.turn];
		if (message.command === 'model') {
			answerWith.value = message.answerWith;
			keyStatus.hidden = !message.provider;
			document.getElementById('model').textContent = message.provider ? TEXT.answersWithCloud.replace('{0}', message.model).replace('{1}', message.provider) : TEXT.answersWith.replace('{0}', message.model);
		} else if (message.command === 'apiKeyStatus') {
			renderKey(message);
		} else if (message.command === 'searching') {
			const box = element('div', 'turn');
			box.appendChild(element('div', 'question', message.question));
			const answerBox = element('div', 'answer');
			const status = element('div', 'small status', TEXT.searching);
			const searched = element('div', 'small');
			const sources = element('div', 'sources');
			box.append(status, answerBox, sources, searched);
			conversation.appendChild(box);
			turns[message.turn] = { box, answerBox, status, searched, sources, passages: [], answer: '', done: false };
			box.scrollIntoView({ block: 'end', behavior: 'smooth' });
		} else if (!turn) {
			return;
		} else if (message.command === 'found') {
			turn.passages = message.passages;
			setCollections(message.collections);
			turn.searched.textContent = [message.searched.length ? TEXT.searched.replace('{0}', message.searched.join(', ')) : '', message.note].filter(part => part).join(' ');
		} else if (message.command === 'indexing') {
			turn.status.textContent = message.text;
			turn.status.insertAdjacentHTML('afterbegin', SPINNER);
		} else if (message.command === 'starting') {
			turn.status.textContent = (message.cloud ? TEXT.asking : TEXT.starting).replace('{0}', message.model);
		} else if (message.command === 'text') {
			turn.status.textContent = '';
			turn.answer = message.text;
			renderAnswer(turn, message.turn);
		} else if (message.command === 'done') {
			turn.done = true;
			turn.status.textContent = message.error || (message.stopped ? TEXT.stopped : '');
			turn.status.classList.toggle('error', !!message.error);
			renderAnswer(turn, message.turn);
			if (message.turn === turns.length - 1) {
				setAnswering(false);
				question.focus();
			}
		}
	});
	question.focus();
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'pollisAskPollis',
	title: localize('askPollis.configurationTitle', "Pollis Ask Pollis"),
	type: 'object',
	properties: {
		'pollis.ask.answerWith': {
			type: 'string',
			default: ASK_THIS_COMPUTER,
			enum: [ASK_THIS_COMPUTER, ...ASK_CLOUD_MODELS.map(model => model.id)],
			enumItemLabels: [localize('askPollis.thisComputer', "This Computer"), ...ASK_CLOUD_MODELS.map(model => model.label)],
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('askPollis.answerWithSetting', "Who writes the answers of **Help > Ask Pollis**: the chat model of `#pollis.ask.chatModel#` on this computer, or a cloud model of Anthropic, Google or OpenAI with your own key, which the key indicator beside Answer With keeps in VS Code Secret Storage. A cloud model is sent the question, the conversation so far and the passages found on this computer, never your files."),
		},
		'pollis.ask.chatModel': {
			type: 'string',
			default: ASK_CHAT_MODEL,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('askPollis.chatModelSetting', "The chat model that writes the answers of **Help > Ask Pollis** on this computer, when `#pollis.ask.answerWith#` is This Computer: a GGUF file of Hugging Face as `hf:owner/repository/file.gguf`, downloaded the first time, or the path of a GGUF file. It runs in the llama.cpp that comes with Pollis."),
		},
		'pollis.ask.embeddingModel': {
			type: 'string',
			default: ASK_EMBEDDING_MODEL,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('askPollis.embeddingModelSetting', "The embedding model with which **Help > Ask Pollis** finds passages by their meaning, as `hf:owner/repository/file.gguf` or the path of a GGUF file. When it changes, the passages are embedded again the next time the Julia REPL starts; until then they are searched by their words only."),
		},
		'pollis.ask.passagePrefix': {
			type: 'string',
			default: ASK_PASSAGE_PREFIX,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('askPollis.passagePrefixSetting', "What each passage is given to the embedding model as: `{title}` is its document and heading, `{text}` its text. The default is the form EmbeddingGemma was trained with for a document; another model may want another form, or `{text}` alone."),
		},
		'pollis.ask.queryPrefix': {
			type: 'string',
			default: ASK_QUERY_PREFIX,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('askPollis.queryPrefixSetting', "What a question is given to the embedding model as: `{text}` is the question. The default is the form EmbeddingGemma was trained with for a query; another model may want another form, or `{text}` alone."),
		},
		'pollis.ask.juliaManual': {
			type: 'boolean',
			default: true,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('askPollis.juliaManualSetting', "Whether **Help > Ask Pollis** searches the Julia Manual too, besides Pollis' own documents: the Manual, Base and the standard library, from the documentation that comes with the Julia that Pollis runs, so that a Julia updated brings its own. Its passages are indexed in the background, and Open shows each in that documentation."),
		},
		'pollis.ask.passages': {
			type: 'number',
			default: ASK_PASSAGES,
			minimum: 1,
			maximum: 20,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('askPollis.passagesSetting', "How many passages of the documents **Help > Ask Pollis** gives the model with each question. More passages answer more, but take longer on this computer and cost more with a cloud model."),
		},
	},
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: ASK_POLLIS_COMMAND_ID,
			title: {
				...localize2('askPollis.action', "Ask Pollis"),
				mnemonicTitle: localize({ key: 'miAskPollis', comment: ['&& denotes a mnemonic'] }, "Ask &&Pollis"),
			},
			category: Categories.Help,
			f1: true,
			menu: { id: MenuId.MenubarHelpMenu, group: '2_welcome', order: 1 },
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openAskPollisPage(accessor);
	}
});
