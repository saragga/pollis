/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { raceCancellation, timeout } from '../../../../base/common/async.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { FileAccess } from '../../../../base/common/network.js';
import { basename } from '../../../../base/common/resources.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { ConfigurationTarget, IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IQuickInputService, IQuickPickItem, IQuickPickSeparator } from '../../../../platform/quickinput/common/quickInput.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IViewContainersRegistry, IViewsRegistry, ViewContainerLocation, Extensions as ViewExtensions } from '../../../common/views.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { IStatusbarEntry, IStatusbarEntryAccessor, IStatusbarService, StatusbarAlignment } from '../../../services/statusbar/browser/statusbar.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IWebviewService } from '../../webview/browser/webview.js';
import { WebviewViewPane } from '../../webviewView/browser/webviewViewPane.js';
import { IWebviewViewService, WebviewView } from '../../webviewView/browser/webviewViewService.js';
import { createApiKeyWiring, IApiKeyWiring } from '../../model/browser/handlers/model.handler.js';
import { composerSendSvg, spinnerCss, spinnerSvg, voiceSpeakerSvg } from '../../model/browser/webviews/webviewScaffold.js';
import { ASK_CHAT_MODEL, ASK_CLOUD_MODELS, ASK_EMBEDDING_MODEL, ASK_PASSAGE_PREFIX, ASK_PASSAGES, ASK_QUERY_PREFIX, ASK_CLOUD_PROVIDERS, ASK_LOCAL_PREFIX, ASK_POLLIS_COMMAND_ID, ASK_THIS_COMPUTER, ASK_ATTACHED_CHARACTERS, askCloudModel, AskPollisProvider, IAskPollisAttachment, IAskPollisFromPanel, IAskPollisPanel, IAskPollisPassage, IAskPollisSearchResult, IAskPollisService } from '../common/askPollis.js';
import { askAnswerCss, askAnswerScript, askModelName, askNothingFound, askOpenPassage, askPassageView, askSearchedNames, askSearchesNothing, askSearchIn, askSearchSources, askWordsOnlyNote } from './askPollisWebview.js';
import { formatBytes, IDatasetSummary, summarizeCsv } from './collaboration/collaborationDatasets.js';
import { isDuckDbFile, MAX_DATASET_BYTES, MAX_FILE_BYTES, MAX_IMAGE_BYTES } from './collaboration/collaborationProtocol.js';
import { COMPARE_MODELS_ADD_COMMAND_ID, COMPARE_MODELS_COMMAND_ID, ICompareModelsAdd } from './compareModelsPage.js';
import { composerAddCss, composerAddHtml, composerAddScript } from './composerAdd.js';
import { composerVoiceCss, composerVoiceHtml, composerVoiceScript, getVoiceLanguage, getVoiceWriteIn, setVoiceLanguage, setVoiceWriteIn } from './composerVoice.js';
import { IInstalledModel } from './modelsInstalledPage.js';

// Help > Ask Pollis: a question in your own words, answered from Pollis' own documents and Julia's, in the Ask
// Pollis pane of the secondary side bar, beside Databases, Julia and Views. The question is searched in PollisDocuments
// (IAskPollisService.search), with the one before it in the conversation, so that a follow-up finds what it follows;
// the model of the status bar (pollis.ask.answerWith) then writes the answer from the passages found, as it
// comes, a number in brackets after each statement: a chat model of Models Installed on this computer
// (pollis.ask.chatModel), or a cloud model of Anthropic, Google or OpenAI with the user's own key, kept in Secret
// Storage, which the key indicator below the question sets. A cloud model is sent the question, the conversation so far,
// the passages and what the + attaches to a question, never another file. The + attaches an image, which only a cloud
// model is sent, a text file, a dataset (its size and first rows) or a DuckDB database (its tables and their columns),
// as the + of the Collaboration chat shares them (composerAdd.ts). Under the answer, Sources lists the passages cited, or all of them when none is, each with
// Open, which opens the PDF at its page, the panel's wiki at its heading, or the Julia Manual at its section
// (askPollisWebview.ts). The conversation is kept until Pollis closes; New Chat, in the pane's title, starts it again.
// The model is shown at the right of the status bar, which chooses it with a menu of the models of this computer and the
// cloud; Evaluate Answering Models..., its last item, opens Evaluate Answering Models (compareModelsPage.ts).
// A question asked in a panel, in the pill at the right of its title (webviewScaffold.ts), is answered in the pane,
// beside the panel: its wikis and the vignettes of its packages give most of the passages, and the model is told the
// panel; the questions after it keep the panel until Ask Without It or New Chat.

type AskPollisMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'ask'; readonly question: string; readonly searchIn: readonly string[]; readonly attachments?: readonly IAskPollisAttachment[] }
	| { readonly command: 'attachFile'; readonly name: string; readonly content: string }
	| { readonly command: 'pickDataset' }
	| { readonly command: 'pickDatabase' }
	| { readonly command: 'stop' }
	| { readonly command: 'open'; readonly turn: number; readonly passage: number }
	| { readonly command: 'setApiKey' }
	| { readonly command: 'clearApiKey' }
	| { readonly command: 'addToTestSet'; readonly turn: number }
	| { readonly command: 'voiceLanguage'; readonly value: string }
	| { readonly command: 'voiceWriteIn'; readonly value: string }
	| { readonly command: 'leavePanel' };

/** A question of the conversation, the passages found for it and its answer so far. */
interface IAskedTurn {
	readonly question: string;
	readonly attachments: readonly IAskPollisAttachment[];
	readonly passages: readonly IAskPollisPassage[];
	answer: string;
}

/** What the + attaches, or why it does not, or both when the text is cut. */
interface IAttached {
	readonly attachment?: IAskPollisAttachment;
	readonly note?: string;
}

/** The first rows of a dataset that an attachment gives the model. */
const ATTACHED_ROWS = 20;

/** A text attachment, cut to ASK_ATTACHED_CHARACTERS and the model told so, with a note when it is cut. */
function attachText(kind: IAskPollisAttachment['kind'], name: string, text: string): IAttached {
	if (text.length <= ASK_ATTACHED_CHARACTERS) {
		return { attachment: { kind, name, content: text } };
	}
	return {
		attachment: { kind, name, content: `${text.slice(0, ASK_ATTACHED_CHARACTERS)}\n[The rest, ${text.length - ASK_ATTACHED_CHARACTERS} characters, is left out.]` },
		note: localize('askPollis.attachedCut', "Only the first {0} characters of {1} go with the question.", ASK_ATTACHED_CHARACTERS.toLocaleString(), name),
	};
}

/** A dataset as the model is given it: its size, then its header and first rows as CSV. */
function datasetText(summary: IDatasetSummary): string {
	const line = (cells: readonly string[]) => cells.map(cell => /[",\n\r]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell).join(',');
	return [`${summary.rows} rows and ${summary.header.length} columns. The header and the first ${summary.head.length} rows:`, line(summary.header), ...summary.head.map(line)].join('\n');
}

const ASK_POLLIS_VIEW_CONTAINER_ID = 'workbench.view.pollis.ask';
const ASK_POLLIS_VIEW_ID = 'pollis.askPollis.view';
const ASK_POLLIS_NEW_CHAT_COMMAND_ID = 'pollis.askPollis.newChat';
const ASK_POLLIS_CHOOSE_MODEL_COMMAND_ID = 'pollis.askPollis.chooseModel';

/** The conversation of the pane once it is shown: asks it a question of a panel, or starts it again. */
let askInView: ((asked: IAskPollisFromPanel) => void) | undefined;
let newChatInView: (() => void) | undefined;
// Help > Ask Pollis with the pane already open: the question box is focused and flashes, so that something answers
let focusInView: (() => void) | undefined;
/** A question of a panel asked before the pane was shown, which it asks when it is. */
let pendingAsk: IAskPollisFromPanel | undefined;

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

/** A model the answers can be written by, as the model's menu lists it. */
interface IAskModelChoice {
	readonly value: string;
	readonly label: string;
	readonly detail: string;
}

/** The model the answers are written by, its name and provider, and the models of the menu that chooses it. */
interface IAskModels {
	readonly chosen: string;
	readonly model: string;
	readonly provider: string | undefined;
	readonly local: readonly IAskModelChoice[];
	readonly cloud: readonly IAskModelChoice[];
}

/**
 * The models of the model's menu: the chat models of Models Installed, the one of pollis.ask.chatModel too when it is
 * not on this computer yet, and the cloud models; looked up each time, so that a model downloaded since is listed.
 */
export async function askModels(commandService: ICommandService, configurationService: IConfigurationService): Promise<IAskModels> {
	const setting = configurationService.getValue<string>('pollis.ask.chatModel')?.trim() || ASK_CHAT_MODEL;
	const installed = (await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels').catch(() => undefined) ?? []).filter(model => model.kind !== 'embedding' && model.kind !== 'reranker');
	const current = installed.find(model => askModelName(model.file) === askModelName(setting));
	const cloud = askCloudModel(configurationService.getValue<string>('pollis.ask.answerWith'));
	return {
		chosen: cloud?.id ?? ASK_LOCAL_PREFIX + (current?.file ?? setting),
		model: cloud?.label ?? current?.name ?? askModelName(setting),
		provider: cloud ? ASK_CLOUD_PROVIDERS[cloud.provider].label : undefined,
		local: [
			...(current ? [] : [{ value: ASK_LOCAL_PREFIX + setting, label: askModelName(setting), detail: localize('askPollis.downloadedFirst', "downloaded when first asked") }]),
			...installed.map(model => ({ value: ASK_LOCAL_PREFIX + model.file, label: model.name, detail: model.sizeLabel ?? '' })),
		],
		cloud: ASK_CLOUD_MODELS.map(model => ({ value: model.id, label: model.label, detail: ASK_CLOUD_PROVIDERS[model.provider].label })),
	};
}

/** Chooses the model of a menu's value: a model of this computer is kept as its file in pollis.ask.chatModel, unless it is the one there already. */
async function chooseAskModel(configurationService: IConfigurationService, value: string): Promise<void> {
	if (value.startsWith(ASK_LOCAL_PREFIX)) {
		const file = value.slice(ASK_LOCAL_PREFIX.length);
		const setting = configurationService.getValue<string>('pollis.ask.chatModel')?.trim() || ASK_CHAT_MODEL;
		if (askModelName(file) !== askModelName(setting)) {
			await configurationService.updateValue('pollis.ask.chatModel', file, ConfigurationTarget.USER);
		}
		await configurationService.updateValue('pollis.ask.answerWith', undefined, ConfigurationTarget.USER);
	} else {
		await configurationService.updateValue('pollis.ask.answerWith', value, ConfigurationTarget.USER);
	}
}

/** Whether a configuration change changes the model the answers are written by. */
function affectsAskModel(e: { affectsConfiguration(section: string): boolean }): boolean {
	return e.affectsConfiguration('pollis.ask.chatModel') || e.affectsConfiguration('pollis.ask.answerWith');
}

/** The conversation of the Ask Pollis pane, which it is given when it is first shown. */
class AskPollisView extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.askPollisView';

	private readonly conversation = this._register(new MutableDisposable<DisposableStore>());

	constructor(
		@IWebviewViewService webviewViewService: IWebviewViewService,
		@IAskPollisService private readonly askPollisService: IAskPollisService,
		@ICommandService private readonly commandService: ICommandService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@ISecretStorageService private readonly secretStorageService: ISecretStorageService,
		@IQuickInputService private readonly quickInputService: IQuickInputService,
		@IWebviewService private readonly webviewService: IWebviewService,
		@IStorageService private readonly storageService: IStorageService,
		@IFileDialogService private readonly fileDialogService: IFileDialogService,
		@IFileService private readonly fileService: IFileService,
		@IWorkspaceContextService private readonly workspaceContextService: IWorkspaceContextService,
		@IPathService private readonly pathService: IPathService,
	) {
		super();
		this._register(webviewViewService.register(ASK_POLLIS_VIEW_ID, {
			resolve: async webviewView => this.resolve(webviewView),
		}));
	}

	/** A file chosen to attach, from the first folder of the workspace, else the home folder. */
	private async pickFile(title: string, filters: { name: string; extensions: string[] }[]): Promise<URI | undefined> {
		const picked = await this.fileDialogService.showOpenDialog({
			title,
			defaultUri: this.workspaceContextService.getWorkspace().folders[0]?.uri ?? await this.pathService.userHome(),
			canSelectFiles: true,
			canSelectMany: false,
			filters,
		});
		return picked?.[0];
	}

	/** Add > Dataset: a CSV file, given as its size and first rows. */
	private async attachDataset(): Promise<IAttached> {
		const resource = await this.pickFile(localize('askPollis.attachDatasetTitle', "Attach a Dataset"), [{ name: localize('askPollis.csvFiles', "CSV Files"), extensions: ['csv'] }]);
		if (!resource) {
			return {};
		}
		const name = basename(resource);
		const stat = await this.fileService.stat(resource);
		if (stat.size > MAX_DATASET_BYTES) {
			return { note: localize('askPollis.datasetTooLarge', "{0} is too large to attach ({1}; the limit is {2} MB).", name, formatBytes(stat.size), MAX_DATASET_BYTES / 1024 / 1024) };
		}
		let summary: IDatasetSummary | undefined;
		try {
			summary = summarizeCsv(new TextDecoder('utf-8', { fatal: true }).decode((await this.fileService.readFile(resource)).value.buffer), ATTACHED_ROWS);
		} catch {
			summary = undefined;
		}
		return summary ? attachText('dataset', name, datasetText(summary)) : { note: localize('askPollis.notADataset', "{0} is not a CSV file in UTF-8 text, so it was not attached.", name) };
	}

	/** Add > Database: a DuckDB database, given as its tables and views with their columns. */
	private async attachDatabase(): Promise<IAttached> {
		const resource = await this.pickFile(localize('askPollis.attachDatabaseTitle', "Attach a Database"), [{ name: localize('askPollis.duckDbFiles', "DuckDB Databases"), extensions: ['duckdb', 'db'] }]);
		if (!resource) {
			return {};
		}
		const name = basename(resource);
		const start = await this.fileService.readFile(resource, { length: 16 });
		if (!isDuckDbFile(start.value.buffer)) {
			return { note: localize('askPollis.notADatabase', "{0} is not a DuckDB database, so it was not attached.", name) };
		}
		try {
			const tables = await this.askPollisService.describeDatabase(resource.fsPath);
			return attachText('database', name, tables || 'No tables.');
		} catch (error) {
			return { note: localize('askPollis.databaseUnreadable', "Could not read the tables of {0}: {1}", name, error instanceof Error ? error.message : String(error)) };
		}
	}

	private resolve(webviewView: WebviewView): void {
		const { askPollisService, commandService, configurationService, storageService } = this;
		const webview = webviewView.webview;
		webview.options = { ...webview.options, retainContextWhenHidden: true };
		webview.contentOptions = { allowScripts: true, localResourceRoots: [] };
		webview.setHtml(pageHtml(getVoiceLanguage(storageService), getVoiceWriteIn(storageService)));

		const disposables = this.conversation.value = new DisposableStore();
		const post = (message: object) => webview.postMessage(message);
		// The key indicator below the question, of the chosen cloud model's provider
		const keys: { [provider in Exclude<AskPollisProvider, 'local'>]: IApiKeyWiring } = {
			anthropic: createApiKeyWiring(webview, { label: ASK_CLOUD_PROVIDERS.anthropic.label, fields: [{ secretKey: ASK_CLOUD_PROVIDERS.anthropic.secretKey, envVar: ASK_CLOUD_PROVIDERS.anthropic.envVar, prompt: localize('askPollis.anthropicKey', "Anthropic API key") }] }, this.secretStorageService, this.quickInputService, this.webviewService),
			google: createApiKeyWiring(webview, { label: ASK_CLOUD_PROVIDERS.google.label, fields: [{ secretKey: ASK_CLOUD_PROVIDERS.google.secretKey, envVar: ASK_CLOUD_PROVIDERS.google.envVar, prompt: localize('askPollis.googleKey', "Google API key") }] }, this.secretStorageService, this.quickInputService, this.webviewService),
			openai: createApiKeyWiring(webview, { label: ASK_CLOUD_PROVIDERS.openai.label, fields: [{ secretKey: ASK_CLOUD_PROVIDERS.openai.secretKey, envVar: ASK_CLOUD_PROVIDERS.openai.envVar, prompt: localize('askPollis.openaiKey', "OpenAI API key") }] }, this.secretStorageService, this.quickInputService, this.webviewService),
		};
		const postModel = () => {
			const cloud = askCloudModel(configurationService.getValue<string>('pollis.ask.answerWith'));
			post({ command: 'model', provider: cloud && ASK_CLOUD_PROVIDERS[cloud.provider].label });
			if (cloud) {
				keys[cloud.provider].postStatus();
			}
		};

		let turns: IAskedTurn[] = [];
		let collections: readonly string[] = [];
		let answering: CancellationTokenSource | undefined;
		// A new conversation drops what the questions of the one before still send
		let conversation = 0;
		// The panel the questions are asked in, and one asked before the pane was ready
		let panel: IAskPollisPanel | undefined;
		let ready = false;
		let waiting: IAskPollisFromPanel | undefined;
		const askFrom = (asked: IAskPollisFromPanel) => {
			panel = asked.panel;
			if (ready) {
				post({ command: 'askFrom', question: asked.question, panel: asked.panel.title });
			} else {
				waiting = asked;
			}
		};
		const newChat = () => {
			answering?.dispose(true);
			answering = undefined;
			conversation++;
			turns = [];
			panel = undefined;
			post({ command: 'newChat' });
		};
		askInView = askFrom;
		newChatInView = newChat;
		focusInView = () => {
			if (ready) {
				post({ command: 'focus' });
			}
		};
		if (pendingAsk) {
			askFrom(pendingAsk);
			pendingAsk = undefined;
		}

		const attached = (result: IAttached) => post({ command: 'attached', attachment: result.attachment, note: result.note });
		const ask = async (question: string, searchIn: readonly string[], attachments: readonly IAskPollisAttachment[]) => {
			answering?.dispose(true);
			const source = answering = new CancellationTokenSource();
			const asked = conversation;
			const index = turns.length;
			const before = turns.filter(turn => turn.answer);
			const previous = turns.at(-1)?.question;
			const askedIn = panel;
			post({ command: 'searching', turn: index, question, attachments: attachments.map(attachment => ({ kind: attachment.kind, name: attachment.name, image: attachment.kind === 'image' ? attachment.content : undefined })) });
			// None: nothing is searched, and the model answers from what it knows
			const unaided = askSearchesNothing(searchIn);
			const search = async (): Promise<IAskPollisSearchResult> => unaided ? { passages: [], searched: [], collections } : askPollisService.search({
				question: previous ? `${previous}\n${question}` : question,
				collections: askSearchIn(searchIn, collections),
				sources: askSearchSources(searchIn),
				panel: askedIn,
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
				turns.push({ question, attachments, passages: [], answer: '' });
				post({ command: 'done', turn: index, stopped: true });
				return;
			}
			collections = result.collections;
			const turn: IAskedTurn = { question, attachments, passages: result.passages, answer: '' };
			turns.push(turn);
			post({
				command: 'found',
				turn: index,
				searched: askSearchedNames(searchIn, result.searched),
				collections: result.collections,
				note: unaided ? localize('askPollis.unaided', "Answered without the documents: nothing was searched.") : askWordsOnlyNote(result),
				passages: result.passages.map(askPassageView),
			});
			if (!result.passages.length && !unaided) {
				post({ command: 'done', turn: index, error: askNothingFound(result) });
				return;
			}
			if (source.token.isCancellationRequested) {
				post({ command: 'done', turn: index, stopped: true });
				return;
			}
			const cloud = askCloudModel(configurationService.getValue<string>('pollis.ask.answerWith'));
			post({ command: 'starting', turn: index, model: cloud?.label ?? askModelName(configurationService.getValue<string>('pollis.ask.chatModel')?.trim() || ASK_CHAT_MODEL), cloud: !!cloud });
			const answer = await askPollisService.answer(before, question, result.passages, text => {
				if (asked === conversation) {
					turn.answer = text;
					post({ command: 'text', turn: index, text });
				}
			}, source.token, undefined, askedIn, attachments);
			if (asked !== conversation) {
				return;
			}
			const stopped = source.token.isCancellationRequested;
			post({
				command: 'done',
				turn: index,
				stopped,
				error: answer.noKey ? localize('askPollis.noKey', "No key for {0}: set the key with the key indicator below the question.", answer.noKey.label)
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

		disposables.add(webviewView.onDispose(() => {
			askInView = undefined;
			newChatInView = undefined;
			focusInView = undefined;
			answering?.dispose(true);
			this.conversation.clear();
		}));
		disposables.add(configurationService.onDidChangeConfiguration(e => {
			if (affectsAskModel(e)) {
				postModel();
			}
		}));
		disposables.add(webview.onMessage((e: { message: AskPollisMessage }) => {
			const message = e.message;
			if (message.command === 'ready') {
				ready = true;
				if (waiting) {
					askFrom(waiting);
					waiting = undefined;
				}
				postModel();
				// Search In lists the sources before the first question too
				askPollisService.collections().then(names => {
					collections = names;
					post({ command: 'collections', collections: names });
				}, () => undefined);
			} else if (message.command === 'ask' && message.question.trim()) {
				ask(message.question.trim(), message.searchIn, message.attachments ?? []);
			} else if (message.command === 'attachFile') {
				attached(attachText('file', message.name, message.content));
			} else if (message.command === 'pickDataset') {
				this.attachDataset().then(attached, error => attached({ note: String(error) }));
			} else if (message.command === 'pickDatabase') {
				this.attachDatabase().then(attached, error => attached({ note: String(error) }));
			} else if (message.command === 'stop') {
				answering?.cancel();
			} else if (message.command === 'leavePanel') {
				panel = undefined;
			} else if (message.command === 'open') {
				open(message);
			} else if (message.command === 'addToTestSet') {
				const turn = turns[message.turn];
				if (turn?.answer) {
					commandService.executeCommand(COMPARE_MODELS_ADD_COMMAND_ID, { question: turn.question, answer: turn.answer, passages: turn.passages } satisfies ICompareModelsAdd);
				}
			} else if (message.command === 'voiceLanguage') {
				setVoiceLanguage(storageService, message.value);
			} else if (message.command === 'voiceWriteIn') {
				setVoiceWriteIn(storageService, message.value);
			} else if (message.command === 'setApiKey' || message.command === 'clearApiKey') {
				const cloud = askCloudModel(configurationService.getValue<string>('pollis.ask.answerWith'));
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
}

/** The model the answers are written by, at the right of the status bar; a click chooses another with the model's menu. */
class AskPollisModelStatus extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.askPollisModelStatus';

	private readonly entry = this._register(new MutableDisposable<IStatusbarEntryAccessor>());

	constructor(
		@IStatusbarService private readonly statusbarService: IStatusbarService,
		@ICommandService private readonly commandService: ICommandService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
	) {
		super();
		this.update();
		this._register(configurationService.onDidChangeConfiguration(e => {
			if (affectsAskModel(e)) {
				this.update();
			}
		}));
	}

	private async update(): Promise<void> {
		const models = await askModels(this.commandService, this.configurationService);
		const properties: IStatusbarEntry = {
			name: localize('askPollis.statusName', "Ask Pollis Model"),
			text: models.model,
			ariaLabel: localize('askPollis.statusAria', "Ask Pollis answers with {0}", models.model),
			tooltip: models.provider
				? localize('askPollis.statusCloud', "Ask Pollis answers with {0} of {1}, with your own key: it is sent the question, the conversation so far, the passages found on this computer and what you attach with the +, never other files. Click to choose another model.", models.model, models.provider)
				: localize('askPollis.statusLocal', "Ask Pollis answers with {0} on this computer: nothing leaves it. Click to choose another model.", models.model),
			command: ASK_POLLIS_CHOOSE_MODEL_COMMAND_ID,
		};
		if (this.entry.value) {
			this.entry.value.update(properties);
		} else {
			// Flush right, left of the alerts and the notifications
			this.entry.value = this.statusbarService.addEntry(properties, AskPollisModelStatus.ID, StatusbarAlignment.RIGHT, -1000000);
		}
	}
}

interface IAskModelPick extends IQuickPickItem {
	readonly value: string;
}

/** The model's menu as a quick pick: On This Computer, Cloud and Evaluate Answering Models..., the chosen model ticked. */
CommandsRegistry.registerCommand(ASK_POLLIS_CHOOSE_MODEL_COMMAND_ID, async (accessor: ServicesAccessor) => {
	const quickInputService = accessor.get(IQuickInputService);
	const commandService = accessor.get(ICommandService);
	const configurationService = accessor.get(IConfigurationService);
	const models = await askModels(commandService, configurationService);
	const item = (choice: IAskModelChoice): IAskModelPick => ({
		value: choice.value,
		label: choice.label,
		description: choice.detail,
		iconClass: choice.value === models.chosen ? ThemeIcon.asClassName(Codicon.check) : undefined,
	});
	const compare: IAskModelPick = { value: '', label: localize('askPollis.compareModels', "Evaluate Answering Models...") };
	const items: (IAskModelPick | IQuickPickSeparator)[] = [
		{ type: 'separator', label: localize('askPollis.onThisComputer', "On this computer: nothing leaves it") }, ...models.local.map(item),
		{ type: 'separator', label: localize('askPollis.inTheCloud', "Cloud, with your own key") }, ...models.cloud.map(item),
		{ type: 'separator' }, compare,
	];
	const picked = await quickInputService.pick(items, {
		placeHolder: localize('askPollis.chooseModel', "The model that writes the answers of Ask Pollis"),
		activeItem: items.find((entry): entry is IAskModelPick => entry.type !== 'separator' && entry.value === models.chosen),
	});
	if (picked === compare) {
		await commandService.executeCommand(COMPARE_MODELS_COMMAND_ID);
	} else if (picked) {
		await chooseAskModel(configurationService, picked.value);
	}
});


/** The pane: its texts come from here, the answers from the messages of each question. */
function pageHtml(language: string, writeIn: string): string {
	const CHEVRON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>';
	const text = {
		intro: localize('askPollis.intro', "Ask in your own words about Pollis, Julia, or the methods behind them: how to fit a model, what a setting does, what NUTS is."),
		introSources: localize('askPollis.introSources', "The answer comes from:"),
		introPollis: localize('askPollis.introPollis', "Pollis: its documents, the panel wikis, the package vignettes, the package APIs and the documents of your toolboxes"),
		introJulia: localize('askPollis.introJulia', "Julia: the Manual, and the docstrings of Base and the standard library"),
		introCited: localize('askPollis.introCited', "Each statement ends with the number of the passage it rests on: Open shows that passage in its document."),
		placeholder: localize('askPollis.placeholder', "Ask Pollis"),
		dictate: localize('askPollis.dictate', "Dictate the Question (not available yet)"),
		voiceMode: localize('askPollis.voiceMode', "Voice Mode: ask aloud and hear the answer, both written down too (not available yet)"),
		add: localize('askPollis.add', "Add an Image, a File, a Dataset or a Database"),
		addImage: localize('askPollis.addImage', "Image"),
		addFile: localize('askPollis.addFile', "File"),
		addDataset: localize('askPollis.addDataset', "Dataset"),
		addDatabase: localize('askPollis.addDatabase', "Database"),
		remove: localize('askPollis.remove', "Remove"),
		imageLocal: localize('askPollis.imageLocal', "The models on this computer do not see images yet: choose a cloud model in the status bar to ask about an image."),
		notAnImage: localize('askPollis.notAnImage', "Only PNG, JPEG, GIF and WebP images can be attached."),
		imageTooLarge: localize('askPollis.imageTooLarge', "This image is too large, even reduced (the limit is {0} MB).", MAX_IMAGE_BYTES / 1024 / 1024),
		fileTooLarge: localize('askPollis.fileTooLarge', "{0} is too large to attach (the limit is {1} MB).", '{0}', MAX_FILE_BYTES / 1024 / 1024),
		notText: localize('askPollis.notText', "{0} is not a text file in UTF-8, so it was not attached: attach a CSV file as a Dataset and a DuckDB file as a Database.", '{0}'),
		ask: localize('askPollis.ask', "Ask"),
		stop: localize('askPollis.stop', "Stop"),
		setKey: localize('askPollis.setKey', "Set API key"),
		keySaved: localize('askPollis.keySaved', "API key"),
		keySavedTitle: localize('askPollis.keySavedTitle', "{0} API key saved in VS Code Secret Storage", '{0}'),
		setKeyTitle: localize('askPollis.setKeyTitle', "Store your {0} API key securely in VS Code Secret Storage", '{0}'),
		changeKey: localize('askPollis.changeKey', "change"),
		clearKey: localize('askPollis.clearKey', "clear"),
		searchIn: localize('askPollis.searchIn', "Search In"),
		searchInPrefix: localize('askPollis.searchInPrefix', "Search In:"),
		searching: localize('askPollis.searching', "Finding the passages..."),
		starting: localize('askPollis.starting', "Starting {0} on this computer. The first time, it is downloaded first.", '{0}'),
		asking: localize('askPollis.asking', "Asking {0}...", '{0}'),
		searched: localize('askPollis.searched', "Searched: {0}.", '{0}'),
		stopped: localize('askPollis.stopped', "Stopped."),
		addToTestSet: localize('askPollis.addToTestSet', "Add to the Test Set..."),
		readAloud: localize('askPollis.readAloud', "Read Aloud: reads this answer, without the citation numbers and the sources (not available yet)"),
		addToTestSetHint: localize('askPollis.addToTestSetHint', "Adds this question to the test set of Evaluate Answering Models, with this answer as its right answer once you have corrected it, and the passage that answers it"),
		askedIn: localize('askPollis.askedIn', "Asked in {0}: its wikis and the vignettes of its packages are searched first.", '{0}'),
		leavePanel: localize('askPollis.leavePanel', "Ask Without It"),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; script-src 'unsafe-inline';">
	<style>
		${composerVoiceCss}
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; padding: 0; color: var(--vscode-foreground); }
		/* The conversation scrolls above the question, which stays at the bottom of the pane */
		.container { display: flex; flex-direction: column; height: 100vh; padding: 8px 12px 10px 12px; }
		.scroll { flex: 1; min-height: 0; overflow-y: auto; }
		.subtitle { font-size: 13px; color: var(--vscode-descriptionForeground); margin: 4px 0 16px 0; line-height: 1.4; }
		.subtitle p { margin: 0 0 8px 0; }
		.subtitle ul { margin: -4px 0 8px 0; padding-left: 18px; }
		.subtitle li { margin: 2px 0; }
		.small { font-size: 12px; color: var(--vscode-descriptionForeground); line-height: 1.4; }
		/* The question: a pill framed in blue, the question and the microphone above, + and the arrow below; it grows as it is written */
		.pill { margin-top: 8px; padding: 8px 10px 6px 12px; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-focusBorder); border-radius: 14px; transition: box-shadow 0.3s; }
		.pill:focus-within { box-shadow: 0 0 0 1px var(--vscode-focusBorder); }
		.pill.flash { box-shadow: 0 0 0 4px var(--vscode-focusBorder); }
		.pill .top { display: flex; align-items: flex-start; gap: 6px; }
		.pill .tools { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
		.pill textarea { flex: 1; min-width: 0; display: block; resize: none; min-height: 24px; max-height: 160px; font: inherit; line-height: 1.4; padding: 5px 2px; color: inherit; background: transparent; border: none; outline: none; }
		.pill textarea::placeholder { color: var(--vscode-input-placeholderForeground); }
		button.icon { display: flex; align-items: center; justify-content: center; flex: none; width: 30px; height: 30px; padding: 0; border: none; border-radius: 50%; color: var(--vscode-descriptionForeground); background: transparent; cursor: pointer; }
		button.icon:hover { color: var(--vscode-foreground); background: var(--vscode-toolbar-hoverBackground); }
		button.icon svg { width: 18px; height: 18px; }
		/* The + circled, as in the Collaboration chat, and its menu */
		#add { color: var(--vscode-foreground); box-shadow: inset 0 0 0 1px var(--vscode-button-background); }
		${composerAddCss}
		#addMenu button { font: inherit; font-size: 12px; border: none; cursor: pointer; }
		#addMenu button:disabled { opacity: 0.5; cursor: default; }
		/* What is attached: above the question in the pill, and below it in the conversation */
		.attachments { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
		.attachments:empty { display: none; }
		.chip { display: inline-flex; align-items: center; gap: 4px; max-width: 100%; font-size: 12px; padding: 2px 4px 2px 8px; border: 1px solid var(--vscode-widget-border); border-radius: 6px; background: var(--vscode-editorWidget-background); }
		.chip .kind { color: var(--vscode-descriptionForeground); }
		.chip .name { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.chip.image { padding: 2px; }
		.chip img { display: block; max-height: 48px; max-width: 96px; border-radius: 4px; }
		.chip .remove { display: flex; align-items: center; justify-content: center; flex: none; width: 18px; height: 18px; padding: 0; border: none; border-radius: 4px; color: var(--vscode-descriptionForeground); background: transparent; cursor: pointer; }
		.chip .remove:hover { color: var(--vscode-foreground); background: var(--vscode-toolbar-hoverBackground); }
		.chip .remove svg { width: 10px; height: 10px; }
		.turn .attachments { margin: -4px 0 8px 0; }
		.attach-note { margin: 0 0 6px 0; }
		/* Ask: a circled arrow, blue, greyed until there is a question; while the answer comes, Stop: an orange square */
		button.icon.send { width: 28px; height: 28px; border: 1.5px solid var(--vscode-button-background); color: var(--vscode-button-foreground); background: var(--vscode-button-background); opacity: 0.4; }
		button.icon.send:hover { background: var(--vscode-button-hoverBackground); }
		button.icon.send svg { width: 15px; height: 15px; }
		button.icon.send.ready, button.icon.send.stop { opacity: 1; }
		button.icon.send.stop { border-radius: 7px; border-color: var(--vscode-charts-orange); color: var(--vscode-button-foreground); background: var(--vscode-charts-orange); }
		/* Below the pill: Search In on the left, the key and the model on the right */
		.under { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px 8px; margin-top: 4px; padding: 0 4px; }
		.under > span { display: inline-flex; align-items: center; gap: 4px; }
		.anchor { position: relative; }
		.picker { display: inline-flex; align-items: center; gap: 4px; font: inherit; font-size: 12px; color: var(--vscode-descriptionForeground); background: transparent; border: none; border-radius: 6px; padding: 3px 6px; cursor: pointer; }
		.picker:hover, .picker[aria-expanded="true"] { color: var(--vscode-foreground); background: var(--vscode-toolbar-hoverBackground); }
		.picker svg { width: 10px; height: 10px; }
		/* Search In, a pill: the prefix muted, the choice in the text's color */
		#searchInButton { color: var(--vscode-foreground); border: 1px solid var(--vscode-widget-border, var(--vscode-input-border, transparent)); border-radius: 999px; padding: 2px 8px; }
		#searchInButton .prefix { color: var(--vscode-descriptionForeground); }
		/* The menus of the pickers, upwards, or downwards when there is no room above */
		.menu { position: absolute; bottom: 28px; z-index: 2; min-width: min(250px, calc(100vw - 8px)); max-width: calc(100vw - 8px); max-height: 60vh; overflow-y: auto; padding: 4px; color: var(--vscode-menu-foreground); background: var(--vscode-menu-background); border: 1px solid var(--vscode-menu-border, var(--vscode-widget-border)); border-radius: 8px; box-shadow: 0 4px 16px var(--vscode-widget-shadow); }
		.menu.down { bottom: auto; top: 28px; }
		.menu.left { left: 0; }
		.menu .heading { font-size: 11px; color: var(--vscode-descriptionForeground); padding: 6px 8px 2px 8px; }
		.menu .item { display: flex; align-items: baseline; gap: 8px; width: 100%; text-align: left; font: inherit; font-size: 12px; color: inherit; background: none; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; }
		.menu .item:hover, .menu .item:focus { color: var(--vscode-menu-selectionForeground); background: var(--vscode-menu-selectionBackground); outline: none; }
		.menu .check { width: 12px; flex: none; }
		.menu .check.box { align-self: center; box-sizing: border-box; height: 12px; font-size: 10px; line-height: 10px; text-align: center; border: 1px solid currentColor; border-radius: 3px; }
		.menu .label { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.menu .detail { font-size: 11px; opacity: 0.7; white-space: nowrap; }
		.menu hr { border: none; border-top: 1px solid var(--vscode-menu-separatorBackground, var(--vscode-widget-border)); margin: 4px 0; }
		.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.answer-actions { display: flex; align-items: center; gap: 10px; }
		button.read { display: flex; align-items: center; justify-content: center; flex: none; width: 22px; height: 22px; padding: 0; border: none; border-radius: 4px; color: var(--vscode-descriptionForeground); background: transparent; cursor: pointer; }
		button.read:hover { color: var(--vscode-foreground); background: var(--vscode-toolbar-hoverBackground); }
		button.read svg { width: 16px; height: 16px; }
		.link:hover { text-decoration: underline; }
		.asked-in { margin-top: 8px; padding: 0 4px; }
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
	<div class="scroll">
		<div class="subtitle" id="intro">
			<p>${text.intro}</p>
			<p>${text.introSources}</p>
			<ul>
				<li>${text.introPollis}</li>
				<li>${text.introJulia}</li>
			</ul>
			<p>${text.introCited}</p>
		</div>
		<div id="conversation"></div>
	</div>
	<div class="small asked-in" id="askedIn" hidden><span id="askedInText"></span> <button class="link" id="leavePanel">${text.leavePanel}</button></div>
	<div class="pill composer">
		<div class="attachments" id="attachments"></div>
		<div class="small attach-note" id="attachNote" hidden></div>
		<div class="top">
			<textarea id="question" rows="1" placeholder="${text.placeholder}"></textarea>
			${composerVoiceHtml({ dictate: text.dictate, voiceMode: text.voiceMode }, language, writeIn)}
		</div>
		<div class="tools">
			${composerAddHtml({ add: text.add, image: text.addImage, file: text.addFile, dataset: text.addDataset, database: text.addDatabase })}
			<button class="icon send" id="ask" title="${text.ask}" aria-label="${text.ask}">${composerSendSvg}</button>
		</div>
	</div>
	<div class="under">
		<span>
			<span class="anchor">
				<button class="picker" id="searchInButton" aria-haspopup="menu" aria-expanded="false" aria-label="${text.searchIn}"><span class="prefix">${text.searchInPrefix}</span><span id="searchInLabel"></span>${CHEVRON}</button>
				<div class="menu left" id="searchInMenu" role="menu" hidden></div>
			</span>
		</span>
		<span class="small" id="api-key-status" hidden></span>
	</div>
</div>
<script>
	const vscode = acquireVsCodeApi();
	${composerVoiceScript('question')}
	const TEXT = ${JSON.stringify(text)};
	const SPINNER = '${spinnerSvg}';
	const conversation = document.getElementById('conversation');
	const question = document.getElementById('question');
	const askButton = document.getElementById('ask');
	const keyStatus = document.getElementById('api-key-status');
	const SEND = '${composerSendSvg}';
	const READ_SVG = '${voiceSpeakerSvg}';
	const STOP = '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="4.5" y="4.5" width="7" height="7" rx="1.5"/></svg>';
	// Each question's elements and what came for it
	const turns = [];
	let answering = false;
	${askAnswerScript()}

	function renderAnswer(turn, index) {
		turn.answerBox.innerHTML = markdown(turn.answer, turn.passages.length);
		renderSources(turn.sources, turn.passages, turn.answer, turn.done, passage => vscode.postMessage({ command: 'open', turn: index, passage }));
	}

	/** The question grows with its text, up to eight lines; the arrow is blue when there is a question to ask. */
	function resize() {
		question.style.height = 'auto';
		question.style.height = Math.min(question.scrollHeight, 160) + 'px';
		askButton.classList.toggle('ready', !answering && !!question.value.trim());
	}

	/** While the answer comes, the arrow is Stop. */
	function setAnswering(value) {
		answering = value;
		askButton.classList.toggle('stop', value);
		askButton.innerHTML = value ? STOP : SEND;
		askButton.title = value ? TEXT.stop : TEXT.ask;
		askButton.setAttribute('aria-label', askButton.title);
		resize();
	}

	function ask() {
		if (answering) {
			vscode.postMessage({ command: 'stop' });
			return;
		}
		const text = question.value.trim();
		if (!text) { return; }
		if (!cloud && attachments.some(attachment => attachment.kind === 'image')) {
			note(TEXT.imageLocal);
			return;
		}
		question.value = '';
		send(text, attachments);
		attachments = [];
		renderAttachments();
		note('');
	}

	function send(text, attached) {
		setAnswering(true);
		vscode.postMessage({ command: 'ask', question: text, searchIn, attachments: attached || [] });
	}

	/** The panel the questions are asked in, above the pill, or none. */
	const askedIn = document.getElementById('askedIn');
	function setPanel(title) {
		askedIn.hidden = !title;
		document.getElementById('askedInText').textContent = title ? TEXT.askedIn.replace('{0}', title) : '';
	}
	document.getElementById('leavePanel').addEventListener('click', () => {
		setPanel('');
		vscode.postMessage({ command: 'leavePanel' });
		question.focus();
	});

	askButton.addEventListener('click', ask);
	question.addEventListener('input', resize);
	question.addEventListener('keydown', event => {
		if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
			event.preventDefault();
			ask();
		}
	});
	// The intro shows until the first question, and again after New Chat
	const intro = document.getElementById('intro');
	// The +: an image, for a cloud model only, a text file, or a dataset or a database, which the workbench picks and reads
	${composerAddScript('question', MAX_IMAGE_BYTES)}
	const KINDS = { image: TEXT.addImage, file: TEXT.addFile, dataset: TEXT.addDataset, database: TEXT.addDatabase };
	const REMOVE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
	const attachmentsBox = document.getElementById('attachments');
	const attachNote = document.getElementById('attachNote');
	const addImage = document.getElementById('addImage');
	let attachments = [];
	let cloud = false;
	function note(text) {
		attachNote.textContent = text || '';
		attachNote.hidden = !text;
	}
	/** An attachment's chip: an image's thumbnail, else its kind and name; with \`remove\`, a button that removes it. */
	function chip(attachment, remove) {
		const box = element('span', attachment.image ? 'chip image' : 'chip');
		box.title = attachment.name;
		if (attachment.image) {
			const img = document.createElement('img');
			img.src = attachment.image;
			img.alt = attachment.name;
			box.appendChild(img);
		} else {
			box.append(element('span', 'kind', KINDS[attachment.kind]), element('span', 'name', attachment.name));
		}
		if (remove) {
			const button = element('button', 'remove');
			button.innerHTML = REMOVE;
			button.title = TEXT.remove;
			button.setAttribute('aria-label', TEXT.remove + ' ' + attachment.name);
			button.addEventListener('click', event => {
				event.stopPropagation();
				remove();
			});
			box.appendChild(button);
		}
		return box;
	}
	function renderAttachments() {
		attachmentsBox.textContent = '';
		attachments.forEach((attachment, i) => attachmentsBox.appendChild(chip({ ...attachment, image: attachment.kind === 'image' ? attachment.content : undefined }, () => {
			attachments.splice(i, 1);
			renderAttachments();
			question.focus();
		})));
	}
	function attach(attachment) {
		attachments.push(attachment);
		renderAttachments();
		question.focus();
	}
	async function attachImage(file) {
		if (!cloud) {
			note(TEXT.imageLocal);
			return;
		}
		const image = await composerReduceImage(file);
		if (image.dataUrl) {
			note('');
			attach({ kind: 'image', name: file.name || 'image', content: image.dataUrl });
		} else {
			note(image.error === 'notAnImage' ? TEXT.notAnImage : TEXT.imageTooLarge);
		}
	}
	async function attachFile(file) {
		if (file.size > ${MAX_FILE_BYTES}) {
			note(TEXT.fileTooLarge.replace('{0}', file.name));
			return;
		}
		let content;
		try {
			content = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
		} catch {
			content = undefined;
		}
		if (content === undefined || content.includes('\u0000')) {
			note(TEXT.notText.replace('{0}', file.name));
			return;
		}
		// The workbench cuts a long text, and says so
		vscode.postMessage({ command: 'attachFile', name: file.name, content });
	}
	composerAdd({ image: attachImage, file: attachFile });
	// A click anywhere in the pill but on its buttons writes in the question
	document.querySelector('.pill').addEventListener('click', event => {
		if (!event.target.closest('button, textarea, .voice-menu')) { question.focus(); }
	});

	/**
	 * The menus below the pill: each opens from its picker, upwards unless there is no room, moved sideways to stay
	 * within the pane, and closes on a choice, a click elsewhere or Escape.
	 */
	const menus = [];
	function closeMenus() {
		for (const [button, box] of menus) {
			box.hidden = true;
			button.setAttribute('aria-expanded', 'false');
		}
	}
	function menu(button, box) {
		menus.push([button, box]);
		button.addEventListener('click', event => {
			event.stopPropagation();
			const opening = box.hidden;
			closeMenus();
			if (opening) {
				box.hidden = false;
				box.classList.toggle('down', button.getBoundingClientRect().top < box.offsetHeight + 8);
				box.style.left = '';
				const rect = box.getBoundingClientRect();
				const shift = Math.max(4 - rect.left, Math.min(0, window.innerWidth - 4 - rect.right));
				if (shift) { box.style.left = (box.offsetLeft + shift) + 'px'; }
				button.setAttribute('aria-expanded', 'true');
				(box.querySelector('.item .check:not(:empty)')?.parentElement ?? box.querySelector('.item'))?.focus();
			}
		});
	}
	document.addEventListener('click', closeMenus);
	document.addEventListener('keydown', event => {
		if (event.key === 'Escape') { closeMenus(); }
	});

	/** A menu's headings, lines and items, the chosen one checked; an item calls \`choose\` with its value, and one with \`tick\`, a box, keeps the menu open. */
	function fillMenu(box, entries, chosen, choose) {
		box.textContent = '';
		for (const entry of entries) {
			if (entry.line) {
				box.appendChild(element('hr'));
			} else if (entry.heading) {
				box.appendChild(element('div', 'heading', entry.heading));
			} else {
				const item = element('button', 'item');
				const ticking = entry.tick !== undefined;
				item.setAttribute('role', ticking ? 'menuitemcheckbox' : 'menuitem');
				if (ticking) { item.setAttribute('aria-checked', String(entry.tick)); }
				item.append(element('span', ticking ? 'check box' : 'check', (ticking ? entry.tick : entry.value === chosen) ? '\u2713' : ''), element('span', 'label', entry.label));
				if (entry.detail) { item.appendChild(element('span', 'detail', entry.detail)); }
				if (entry.title) { item.title = entry.title; }
				item.addEventListener('click', event => {
					event.stopPropagation();
					if (ticking) {
						const place = [...box.children].indexOf(item);
						choose(entry.value);
						box.children[place]?.focus();
					} else {
						closeMenus();
						choose(entry.value);
					}
				});
				box.appendChild(item);
			}
		}
	}

	// Search In: Auto with nothing ticked, the sources ticked, all or none, shown before the first question too
	let searchIn = [];
	let searchInOffered = [];
	const searchInButton = document.getElementById('searchInButton');
	const searchInMenu = document.getElementById('searchInMenu');
	menu(searchInButton, searchInMenu);
	function renderSearchIn() {
		const all = searchIn[0] === SEARCH_ALL;
		const none = searchIn[0] === SEARCH_NONE;
		const ticked = searchInOffered.filter(source => all || searchIn.includes(source.value));
		document.getElementById('searchInLabel').textContent = !searchIn.length ? ANSWER_TEXT.automatic : all ? ANSWER_TEXT.all : none ? ANSWER_TEXT.none : ticked.length === 1 ? ticked[0].label : ANSWER_TEXT.sourcesCount.replace('{0}', ticked.length);
		searchInButton.title = !searchIn.length ? ANSWER_TEXT.automaticHint : none ? ANSWER_TEXT.noneHint : all ? '' : ticked.length === 1 ? ticked[0].title : ticked.map(source => source.label).join(', ');
		fillMenu(searchInMenu, [
			{ value: SEARCH_NEAREST, label: ANSWER_TEXT.automatic, title: ANSWER_TEXT.automaticHint },
			{ line: true },
			...searchInOffered.map(source => ({ ...source, tick: ticked.includes(source) })),
			{ line: true },
			{ value: SEARCH_ALL, label: ANSWER_TEXT.all },
			{ value: SEARCH_NONE, label: ANSWER_TEXT.none, title: ANSWER_TEXT.noneHint },
		], searchIn.length ? searchIn[0] : SEARCH_NEAREST, value => {
			if (value === SEARCH_NEAREST) {
				searchIn = [];
			} else if (value === SEARCH_ALL || value === SEARCH_NONE) {
				searchIn = [value];
			} else {
				const values = ticked.map(source => source.value);
				const next = values.includes(value) ? values.filter(other => other !== value) : [...values, value];
				searchIn = next.length === searchInOffered.length ? [SEARCH_ALL] : next;
			}
			renderSearchIn();
		});
	}

	// A citation shows its source
	conversation.addEventListener('click', event => showSource(event, 'turn'));

	const setCollections = names => {
		searchInOffered = searchInSources(names);
		searchIn = searchIn.filter(value => value === SEARCH_ALL || value === SEARCH_NONE || searchInOffered.some(source => source.value === value));
		renderSearchIn();
	};
	setCollections([]);

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
		if (message.command === 'collections') {
			setCollections(message.collections);
		} else if (message.command === 'newChat') {
			turns.length = 0;
			conversation.textContent = '';
			intro.hidden = false;
			setPanel('');
			setAnswering(false);
			question.focus();
		} else if (message.command === 'focus') {
			question.focus();
			const pill = document.querySelector('.pill');
			pill.classList.add('flash');
			setTimeout(() => pill.classList.remove('flash'), 400);
		} else if (message.command === 'askFrom') {
			setPanel(message.panel);
			send(message.question);
		} else if (message.command === 'model') {
			// The key indicator shows while a cloud model answers, and only a cloud model is given images
			keyStatus.hidden = !message.provider;
			cloud = !!message.provider;
			addImage.disabled = !cloud;
			addImage.title = cloud ? '' : TEXT.imageLocal;
		} else if (message.command === 'attached') {
			note(message.note);
			if (message.attachment) {
				attach(message.attachment);
			}
		} else if (message.command === 'apiKeyStatus') {
			renderKey(message);
		} else if (message.command === 'searching') {
			const box = element('div', 'turn');
			box.appendChild(element('div', 'question', message.question));
			if (message.attachments?.length) {
				const attached = element('div', 'attachments');
				for (const attachment of message.attachments) {
					attached.appendChild(chip(attachment));
				}
				box.appendChild(attached);
			}
			const answerBox = element('div', 'answer');
			const status = element('div', 'small status', TEXT.searching);
			const searched = element('div', 'small');
			const sources = element('div', 'sources');
			box.append(status, answerBox, sources, searched);
			conversation.appendChild(box);
			intro.hidden = true;
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
			if (turn.answer && !message.error) {
				// An answer without passages has none to be a test question's right ones
				const add = element('button', 'link', TEXT.addToTestSet);
				add.hidden = !turn.passages.length;
				add.title = TEXT.addToTestSetHint;
				add.addEventListener('click', () => vscode.postMessage({ command: 'addToTestSet', turn: message.turn }));
				// Read Aloud, a stub: text to speech is not implemented yet
				const read = element('button', 'read');
				read.innerHTML = READ_SVG;
				read.title = TEXT.readAloud;
				read.setAttribute('aria-label', TEXT.readAloud);
				const line = element('div', 'small answer-actions');
				line.appendChild(read);
				line.appendChild(add);
				turn.box.appendChild(line);
			}
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
			markdownDescription: localize('askPollis.answerWithSetting', "Who writes the answers of **Help > Ask Pollis**: the chat model of `#pollis.ask.chatModel#` on this computer, or a cloud model of Anthropic, Google or OpenAI with your own key, which the key indicator below the question keeps in VS Code Secret Storage. The model at the right of the status bar chooses it. A cloud model is sent the question, the conversation so far and the passages found on this computer, never your files."),
		},
		'pollis.ask.chatModel': {
			type: 'string',
			default: ASK_CHAT_MODEL,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('askPollis.chatModelSetting', "The chat model that writes the answers of **Help > Ask Pollis** on this computer, when the model chosen in the status bar is one of this computer: a GGUF file of Hugging Face as `hf:owner/repository/file.gguf`, downloaded the first time, or the path of a GGUF file. It runs in the llama.cpp that comes with Pollis."),
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
		'pollis.ask.packageApis': {
			type: 'boolean',
			default: true,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('askPollis.packageApisSetting', "Whether **Help > Ask Pollis** can search the Package APIs: the docstrings of the packages of the panels, read in the background from their documentation sites, at the version on this computer when the site has it. They are some twenty thousand passages, about 120 MB in the index, and are searched only with **Search In: Package APIs** or **All Sources**."),
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
	async run(accessor: ServicesAccessor, asked?: IAskPollisFromPanel): Promise<void> {
		const viewsService = accessor.get(IViewsService);
		if (asked?.question && asked.panel) {
			if (askInView) {
				askInView(asked);
			} else {
				pendingAsk = asked;
			}
		}
		await viewsService.openView(ASK_POLLIS_VIEW_ID, true);
		if (!asked?.question) {
			focusInView?.();
		}
	}
});

// --- The Ask Pollis pane (secondary side bar), after Databases and Views

const askPollisViewIcon = FileAccess.asBrowserUri('vs/workbench/contrib/compose/browser/media/ask/ask-bubble-question.svg');

const askPollisViewContainer = Registry.as<IViewContainersRegistry>(ViewExtensions.ViewContainersRegistry).registerViewContainer({
	id: ASK_POLLIS_VIEW_CONTAINER_ID,
	title: localize2('askPollis.viewContainer.label', "Ask Pollis"),
	icon: askPollisViewIcon,
	ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [ASK_POLLIS_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
	storageId: ASK_POLLIS_VIEW_CONTAINER_ID,
	order: 1002,
}, ViewContainerLocation.AuxiliaryBar);

Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry).registerViews([{
	id: ASK_POLLIS_VIEW_ID,
	name: localize2('askPollis.view', "Ask Pollis"),
	containerIcon: askPollisViewIcon,
	singleViewPaneContainerTitle: askPollisViewContainer.title.value,
	ctorDescriptor: new SyncDescriptor(WebviewViewPane),
	canToggleVisibility: false,
	canMoveView: true,
}], askPollisViewContainer);

registerWorkbenchContribution2(AskPollisView.ID, AskPollisView, WorkbenchPhase.AfterRestored);
registerWorkbenchContribution2(AskPollisModelStatus.ID, AskPollisModelStatus, WorkbenchPhase.Eventually);

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: ASK_POLLIS_NEW_CHAT_COMMAND_ID,
			title: localize2('askPollis.newChat', "New Chat"),
			icon: Codicon.add,
			menu: { id: MenuId.ViewTitle, when: ContextKeyExpr.equals('view', ASK_POLLIS_VIEW_ID), group: 'navigation' },
		});
	}
	run(): void {
		newChatInView?.();
	}
});
