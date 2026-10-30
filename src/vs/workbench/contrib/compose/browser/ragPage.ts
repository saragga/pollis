/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IntervalTimer } from '../../../../base/common/async.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { basename, extname, joinPath } from '../../../../base/common/resources.js';
import { hasKey } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { localize, localize2 } from '../../../../nls.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { BrowserViewCommandId } from '../../../../platform/browserView/common/browserView.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { OPEN_LINK_COMMAND_ID } from '../../monitor/browser/openLink.js';
import { spinnerSvg } from '../../model/browser/webviews/webviewScaffold.js';
import { ASK_EMBEDDING_MODEL, ASK_PASSAGES, embeddingPrefixes, IAskPollisPassage, IAskPollisService } from '../common/askPollis.js';
import { askModels } from './askPollisPage.js';
import { askAnswerCss, askAnswerScript, askPassageView } from './askPollisWebview.js';
import { compareCss, compareSharedText, pageCommonScript } from './compareShared.js';
import { IInstalledModel } from './modelsInstalledPage.js';

// Retrieval-Augmented Generation, from Compose > Retrieval-Augmented Generation (compose.contribution.ts): the
// collections of documents a model answers from, each with its own index in ~/.pollis/rag. One page, in five steps:
// 1, Document Ingestion, the documents of the collection, recorded by their paths, never copied; 2, Chunking, the
// length of the passages, and the passages of each document once the index is built; 3, Embedding, the embedding model
// and Build the Index, which language-julia.pollisIndexCollection does with ask_index.jl (pollisDocuments.ts); 4,
// Retrieval, a question searched in the index as Ask Pollis searches its own, by words and meaning; 5, Reranking, which
// may be left out, a reranker of llama.cpp scoring each passage found with the question and keeping the best; 6,
// Generation, the model chosen answering the question of step 4 from the passages found, or those kept in step 5, as Ask
// Pollis answers (askPollisService.answer).

export const RAG_COMMAND_ID = 'pollis.retrievalAugmentedGeneration';

/** The collections, as an array of IRagCollection. */
const COLLECTIONS_KEY = 'pollis.rag.collections';
/** The collection shown, by its id. */
const CHOSEN_KEY = 'pollis.rag.chosen';
/** The packages of the page, on the Powered by line. */
const POWERED_BY = [
	{ name: 'Poppler', url: 'https://poppler.freedesktop.org' },
	{ name: 'llama.cpp', url: 'https://github.com/ggml-org/llama.cpp' },
	{ name: 'DuckDB', url: 'https://duckdb.org' },
];
/** The lengths a passage can have, in words. */
const PASSAGE_WORDS = [100, 150, 200, 250, 300, 400, 500];
/** The passages of a document shown in step 2. */
const SHOWN_PASSAGES = 5;
/** The passages a reranker keeps, unless the collection says otherwise. */
const KEPT_PASSAGES = 8;

type RagDocumentKind = 'pdf' | 'markdown' | 'text';

/** A document of a collection. */
interface IRagDocument {
	readonly file: string;
	readonly title: string;
	readonly kind: RagDocumentKind;
}

/** A collection: its documents, the words of its passages and the model that embeds them. */
interface IRagCollection {
	readonly id: string;
	name: string;
	documents: IRagDocument[];
	words: number;
	embeddingModel: string;
	/** The model that answers, a cloud model's id or ASK_LOCAL_PREFIX and a file: that of Ask Pollis when not chosen. */
	answeringModel?: string;
	/** Whether Generation answers from the passages a reranker kept, the reranker's file, and how many it keeps. */
	rerank?: boolean;
	reranker?: string;
	keep?: number;
}

type RagMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'choose'; readonly id: string }
	| { readonly command: 'newCollection' }
	| { readonly command: 'rename' }
	| { readonly command: 'delete' }
	| { readonly command: 'addFiles' }
	| { readonly command: 'remove'; readonly file: string }
	| { readonly command: 'open'; readonly file: string }
	| { readonly command: 'words'; readonly words: number }
	| { readonly command: 'passages'; readonly file: string }
	| { readonly command: 'model'; readonly model: string }
	| { readonly command: 'build' }
	| { readonly command: 'search'; readonly question: string; readonly passages: number }
	| { readonly command: 'openPassage'; readonly file: string; readonly page: number | null }
	| { readonly command: 'rerankSettings'; readonly on: boolean; readonly reranker: string; readonly keep: number }
	| { readonly command: 'rerank' }
	| { readonly command: 'answerModel'; readonly model: string }
	| { readonly command: 'answer' }
	| { readonly command: 'stopAnswer' }
	| { readonly command: 'openUrl'; readonly url: string };

/** How far the index of a collection has come, from language-julia.pollisCollectionProgress. */
interface IRagProgress {
	readonly stage: 'compiling' | 'installing' | 'reading' | 'embedding';
	readonly done: number;
	readonly total: number;
}

/** The page, when it is open. */
let openPage: WebviewInput | undefined;

function documentKind(file: URI): RagDocumentKind {
	const extension = extname(file).toLowerCase();
	return extension === '.pdf' ? 'pdf' : extension === '.md' || extension === '.markdown' ? 'markdown' : 'text';
}

async function openRagPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const commandService = accessor.get(ICommandService);
	const storageService = accessor.get(IStorageService);
	const dialogService = accessor.get(IDialogService);
	const fileDialogService = accessor.get(IFileDialogService);
	const fileService = accessor.get(IFileService);
	const quickInputService = accessor.get(IQuickInputService);
	const editorService = accessor.get(IEditorService);
	const pathService = accessor.get(IPathService);
	const askPollisService = accessor.get(IAskPollisService);
	const configurationService = accessor.get(IConfigurationService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('rag.title', "Retrieval-Augmented Generation");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.retrievalAugmentedGeneration',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml());
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const disposables = new DisposableStore();

	let collections: IRagCollection[] = [];
	try {
		collections = JSON.parse(storageService.get(COLLECTIONS_KEY, StorageScope.APPLICATION, '[]'));
	} catch {
		collections = [];
	}
	let chosen = storageService.get(CHOSEN_KEY, StorageScope.APPLICATION, '');
	const collection = () => collections.find(c => c.id === chosen);
	const save = () => {
		storageService.store(COLLECTIONS_KEY, JSON.stringify(collections), StorageScope.APPLICATION, StorageTarget.USER);
		storageService.store(CHOSEN_KEY, chosen, StorageScope.APPLICATION, StorageTarget.USER);
	};

	const ragFolder = async () => joinPath(await pathService.userHome(), '.pollis', 'rag');
	/** The index of a collection, when it has been built. */
	const databaseFile = async (id: string) => joinPath(await ragFolder(), `${id}.duckdb`);
	const indexFile = async (id: string) => {
		const resource = await databaseFile(id);
		return await fileService.exists(resource) ? resource.fsPath : undefined;
	};
	/** The embedding models of this computer. */
	const embeddingModels = async () => (await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels').catch(() => undefined) ?? [])
		.filter(model => model.kind === 'embedding')
		.map(model => ({ value: model.value ?? model.file, label: model.name, size: model.sizeLabel ?? '' }));
	/** The rerankers of this computer. */
	const rerankers = async () => (await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels').catch(() => undefined) ?? [])
		.filter(model => model.kind === 'reranker')
		.map(model => ({ value: model.value ?? model.file, label: model.name, size: model.sizeLabel ?? '' }));
	/** The reranker of a collection: its own when still there, else the first of this computer. */
	const rerankerOf = (current: IRagCollection, models: readonly { value: string }[]) =>
		models.find(model => model.value === current.reranker)?.value ?? models[0]?.value ?? '';
	/** The embedding model of a collection: its own, else that of Ask Pollis, else the first of this computer. */
	const modelOf = (current: IRagCollection, models: readonly { value: string }[]) =>
		[current.embeddingModel, configurationService.getValue<string>('pollis.ask.embeddingModel') || ASK_EMBEDDING_MODEL].find(value => value && models.some(model => model.value === value)) ?? models[0]?.value ?? '';
	const progressOf = async (id: string) => commandService.executeCommand<IRagProgress | undefined>('language-julia.pollisCollectionProgress', (await databaseFile(id)).fsPath).catch(() => undefined);
	const progressTimer = disposables.add(new IntervalTimer());
	const watchProgress = (id: string) => progressTimer.cancelAndSet(async () => post({ command: 'progress', progress: await progressOf(id) }), 1000);
	/** The question last searched in step 4 and the passages found, which step 5 answers from. */
	let lastFound: { readonly collection: string; readonly question: string; readonly passages: readonly IAskPollisPassage[] } | undefined;
	/** The passages the reranker kept of those, in its order. */
	let lastReranked: { readonly found: typeof lastFound; readonly passages: readonly IAskPollisPassage[] } | undefined;
	let answering: CancellationTokenSource | undefined;
	/** The answers asked for, so that the page shows only the last. */
	let answers = 0;
	disposables.add(toDisposable(() => answering?.dispose(true)));
	/** The models that answer, and that of a collection: its own when still there, else that of Ask Pollis. */
	const answeringModels = async (current: IRagCollection | undefined) => {
		const models = await askModels(commandService, configurationService);
		const all = [...models.local, ...models.cloud];
		const value = current?.answeringModel && all.some(model => model.value === current.answeringModel) ? current.answeringModel : models.chosen;
		return { local: models.local, cloud: models.cloud, value, label: all.find(model => model.value === value)?.label ?? models.model };
	};

	/**
	 * The collections, and the documents of the one shown, each marked missing when its file is gone, with the passages
	 * of each in the index, and the words of a passage the index was cut with.
	 */
	const postState = async () => {
		if (!collection()) {
			chosen = collections[0]?.id ?? '';
		}
		const current = collection();
		const index = current && await indexFile(current.id);
		const status = index ? await askPollisService.collectionStatus(index) : undefined;
		const indexed = index ? await askPollisService.indexedDocuments(index) : undefined;
		const documents = await Promise.all((current?.documents ?? []).map(async document => ({
			...document,
			present: await fileService.exists(URI.file(document.file)),
			passages: indexed?.find(d => d.file === document.file)?.passages,
		})));
		const models = await embeddingModels();
		const progress = current && await progressOf(current.id);
		const answerers = await answeringModels(current);
		const rerankModels = await rerankers();
		if (progress && current) {
			watchProgress(current.id);
		} else {
			progressTimer.cancel();
		}
		post({
			command: 'state', collections: collections.map(c => ({ id: c.id, name: c.name })), chosen, documents, words: current?.words ?? 250, indexedWords: status?.words, indexed: !!indexed,
			models, model: current ? modelOf(current, models) : '', status, building: !!progress, progress,
			answeringModels: { local: answerers.local, cloud: answerers.cloud }, answeringModel: answerers.value,
			rerankers: rerankModels, rerank: !!current?.rerank, reranker: current ? rerankerOf(current, rerankModels) : '', keep: current?.keep ?? KEPT_PASSAGES,
		});
	};

	const askName = (value: string) => quickInputService.input({
		prompt: localize('rag.namePrompt', "The name of the collection"),
		value,
		validateInput: async name => !name.trim() ? localize('rag.nameEmpty', "Give the collection a name.") : collections.some(c => c.name === name.trim() && c.id !== chosen) ? localize('rag.nameTaken', "A collection already has this name.") : undefined,
	});

	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: RagMessage }) => {
		const message = e.message;
		const current = collection();
		if (message.command === 'choose' || message.command === 'delete' || message.command === 'search') {
			answering?.cancel();
		}
		if (message.command === 'ready') {
			await postState();
		} else if (message.command === 'choose' && hasKey(message, { id: true })) {
			chosen = message.id;
			save();
			await postState();
		} else if (message.command === 'newCollection') {
			chosen = '';
			const name = (await askName(''))?.trim();
			if (name) {
				const added: IRagCollection = { id: generateUuid(), name, documents: [], words: 250, embeddingModel: '' };
				collections.push(added);
				chosen = added.id;
				save();
			}
			await postState();
		} else if (message.command === 'rename' && current) {
			const name = (await askName(current.name))?.trim();
			if (name) {
				current.name = name;
				save();
				await postState();
			}
		} else if (message.command === 'delete' && current) {
			const { confirmed } = await dialogService.confirm({
				message: localize('rag.deleteConfirm', "Delete the collection {0}?", current.name),
				detail: localize('rag.deleteDetail', "Its index is deleted; its documents stay where they are."),
				primaryButton: localize({ key: 'rag.deleteButton', comment: ['&& denotes a mnemonic'] }, "&&Delete"),
			});
			if (confirmed) {
				const folder = await ragFolder();
				for (const file of [`${current.id}.duckdb`, `${current.id}.sources.json`]) {
					const resource = joinPath(folder, file);
					if (await fileService.exists(resource)) {
						await fileService.del(resource);
					}
				}
				collections = collections.filter(c => c !== current);
				chosen = collections[0]?.id ?? '';
				save();
				await postState();
			}
		} else if (message.command === 'addFiles' && current) {
			const files = await fileDialogService.showOpenDialog({
				title: localize('rag.addFilesTitle', "Add Files to {0}", current.name),
				canSelectFiles: true,
				canSelectMany: true,
				filters: [
					{ name: localize('rag.documents', "Documents"), extensions: ['pdf', 'md', 'markdown', 'txt'] },
					{ name: 'PDF', extensions: ['pdf'] },
					{ name: 'Markdown', extensions: ['md', 'markdown'] },
					{ name: localize('rag.text', "Text"), extensions: ['txt'] },
				],
			});
			for (const file of files ?? []) {
				if (!current.documents.some(document => document.file === file.fsPath)) {
					const name = basename(file);
					current.documents.push({ file: file.fsPath, title: name.slice(0, name.length - extname(file).length), kind: documentKind(file) });
				}
			}
			save();
			await postState();
		} else if (message.command === 'remove' && current && hasKey(message, { file: true })) {
			current.documents = current.documents.filter(document => document.file !== message.file);
			save();
			await postState();
		} else if (message.command === 'open' && current && hasKey(message, { file: true })) {
			const document = current.documents.find(d => d.file === message.file);
			if (document?.kind === 'pdf') {
				await commandService.executeCommand(BrowserViewCommandId.Open, URI.file(document.file).toString(true));
			} else if (document) {
				await editorService.openEditor({ resource: URI.file(document.file) });
			}
		} else if (message.command === 'words' && current && hasKey(message, { words: true }) && PASSAGE_WORDS.includes(message.words)) {
			current.words = message.words;
			save();
			await postState();
		} else if (message.command === 'passages' && current && hasKey(message, { file: true })) {
			const index = await indexFile(current.id);
			const passages = index ? await askPollisService.documentPassages(index, message.file, SHOWN_PASSAGES) : [];
			post({ command: 'passages', file: message.file, passages: passages.map(p => ({ heading: p.heading, page: p.page, text: p.text })) });
		} else if (message.command === 'model' && current && hasKey(message, { model: true })) {
			current.embeddingModel = message.model;
			save();
			await postState();
		} else if (message.command === 'build' && current) {
			const model = modelOf(current, await embeddingModels());
			const present = (await Promise.all(current.documents.map(async document => await fileService.exists(URI.file(document.file)) ? document : undefined))).filter(document => !!document);
			if (!model || !present.length) {
				return;
			}
			const id = current.id;
			const database = (await databaseFile(id)).fsPath;
			const building = commandService.executeCommand<{ passages?: number; embedded?: number; error?: string }>('language-julia.pollisIndexCollection', {
				name: current.name, database, documents: present, words: current.words, model, prefix: embeddingPrefixes(model).passage,
			});
			post({ command: 'progress', progress: { stage: 'reading', done: 0, total: 0 } });
			watchProgress(id);
			const answer = await building.catch(() => ({ error: 'failed' }));
			if (openPage !== webviewInput) {
				return;
			}
			progressTimer.cancel();
			post({ command: 'built', error: answer?.error });
			if (chosen === id) {
				await postState();
			}
		} else if (message.command === 'search' && current && hasKey(message, { question: true, passages: true })) {
			const index = await indexFile(current.id);
			const status = index ? await askPollisService.collectionStatus(index) : undefined;
			if (!index || !status?.passages) {
				post({ command: 'found', error: 'notBuilt' });
				return;
			}
			const started = Date.now();
			const result = await askPollisService.search({
				question: message.question,
				passages: Math.min(Math.max(message.passages, 1), 50),
				index: { file: index, embeddingModel: status.embedder, queryPrefix: embeddingPrefixes(status.embedder).query },
			});
			lastFound = { collection: current.id, question: message.question, passages: result.passages };
			lastReranked = undefined;
			post({
				command: 'found',
				milliseconds: Date.now() - started,
				wordsOnly: result.wordsOnly,
				error: result.error,
				passages: result.passages.map(p => ({ title: p.title, file: p.file, page: p.page, heading: p.heading, text: p.text, score: p.score })),
			});
		} else if (message.command === 'openPassage' && current && hasKey(message, { file: true }) && current.documents.some(d => d.file === message.file)) {
			const document = current.documents.find(d => d.file === message.file)!;
			if (document.kind === 'pdf') {
				await commandService.executeCommand(BrowserViewCommandId.Open, URI.file(document.file).toString(true) + (message.page ? `#page=${message.page}` : ''));
			} else {
				await editorService.openEditor({ resource: URI.file(document.file) });
			}
		} else if (message.command === 'rerankSettings' && current && hasKey(message, { on: true, reranker: true, keep: true })) {
			current.rerank = !!message.on;
			current.reranker = message.reranker || current.reranker;
			current.keep = Math.min(Math.max(Math.floor(Number(message.keep)) || KEPT_PASSAGES, 1), 50);
			save();
		} else if (message.command === 'rerank' && current && lastFound?.collection === current.id && lastFound.passages.length) {
			const found = lastFound;
			const model = rerankerOf(current, await rerankers());
			if (!model) {
				post({ command: 'reranked', error: 'noReranker' });
				return;
			}
			const started = Date.now();
			const result = await askPollisService.rerank(model, found.question, found.passages);
			if (openPage !== webviewInput || lastFound !== found) {
				return;
			}
			if (!result.scores) {
				post({ command: 'reranked', error: result.error || 'failed' });
				return;
			}
			const scores = result.scores;
			const order = found.passages.map((_, index) => index).sort((a, b) => scores[b] - scores[a]).slice(0, current.keep ?? KEPT_PASSAGES);
			lastReranked = { found, passages: order.map(index => found.passages[index]) };
			post({
				command: 'reranked',
				milliseconds: Date.now() - started,
				of: found.passages.length,
				passages: order.map(index => {
					const p = found.passages[index];
					return { title: p.title, file: p.file, page: p.page, heading: p.heading, text: p.text, score: scores[index], before: index + 1 };
				}),
			});
		} else if (message.command === 'rerank') {
			post({ command: 'reranked', error: 'searchFirst' });
		} else if (message.command === 'answerModel' && current && hasKey(message, { model: true })) {
			const models = await answeringModels(current);
			if ([...models.local, ...models.cloud].some(model => model.value === message.model)) {
				current.answeringModel = message.model;
				save();
			}
		} else if (message.command === 'answer' && current && lastFound?.collection === current.id && lastFound.passages.length && (!current.rerank || lastReranked?.found === lastFound)) {
			const found = current.rerank && lastReranked ? { ...lastFound, passages: lastReranked.passages } : lastFound;
			answering?.cancel();
			const source = answering = new CancellationTokenSource();
			const id = ++answers;
			const model = await answeringModels(current);
			post({ command: 'starting', id, model: model.label, passages: found.passages.map(p => ({ ...askPassageView(p), file: p.file, page: p.page })) });
			let written = '';
			const answer = await askPollisService.answer([], found.question, found.passages, text => {
				written = text;
				post({ command: 'answerText', id, text });
			}, source.token, model.value, undefined, undefined, current.name);
			const stopped = source.token.isCancellationRequested;
			if (answering === source) {
				answering = undefined;
			}
			source.dispose();
			if (openPage !== webviewInput) {
				return;
			}
			post({
				command: 'answered',
				id,
				stopped,
				seconds: answer.timings?.seconds,
				model: answer.model,
				error: answer.noKey ? localize('rag.noKey', "No key for {0}: set the key in Ask Pollis, with the key indicator below the question.", answer.noKey.label)
					: answer.refused ? localize('rag.refused', "{0} declined to answer the question.", answer.model)
						: answer.error === undefined && (written || stopped) ? undefined : localize('rag.notAnswered', "{0} did not answer. {1}", answer.model, answer.error ?? ''),
			});
		} else if (message.command === 'answer') {
			post({ command: 'answered', id: 0, stopped: true });
		} else if (message.command === 'stopAnswer') {
			answering?.cancel();
		} else if (message.command === 'openUrl' && hasKey(message, { url: true }) && POWERED_BY.some(pkg => pkg.url === message.url)) {
			await commandService.executeCommand(OPEN_LINK_COMMAND_ID, message.url);
		}
	}));
}

/** The page: its texts come from here; the collections and their documents from the messages. */
function pageHtml(): string {
	const text = {
		poweredBy: compareSharedText().poweredBy,
		title: localize('rag.title', "Retrieval-Augmented Generation"),
		intro: localize('rag.intro', "A model answers from the passages of a collection of your documents: the documents are read and cut into passages, each passage is embedded, the passages nearest to a question are found, and the model answers from them. Each collection has its own index, in {0}.", '<span class="yellow">~/.pollis/rag</span>'),
		collection: localize('rag.collection', "Collection"),
		newCollection: localize('rag.newCollection', "New Collection..."),
		rename: localize('rag.rename', "Rename..."),
		delete: localize('rag.delete', "Delete..."),
		noCollection: localize('rag.noCollection', "No collection yet: New Collection... makes one."),
		ingestion: localize('rag.ingestion', "Document Ingestion"),
		ingestionIntro: localize('rag.ingestionIntro', "The documents of the collection: PDF, Markdown and text files. They stay where they are; the collection keeps their paths. A click on a title opens the document."),
		addFiles: localize('rag.addFiles', "Add Files..."),
		noDocuments: localize('rag.noDocuments', "No documents in this collection yet: Add Files... puts them in."),
		titleColumn: localize('rag.titleColumn', "Title"),
		kind: localize('rag.kind', "Kind"),
		file: localize('rag.file', "File"),
		status: localize('rag.status', "Status"),
		present: localize('rag.present', "Found"),
		missing: localize('rag.missing', "Missing"),
		remove: localize('rag.remove', "Remove"),
		chunking: localize('rag.chunking', "Chunking"),
		chunkingIntro: localize('rag.chunkingIntro', "Each document is cut into passages of about the same number of words. Shorter passages are found more precisely; longer ones give the model more to answer from."),
		passageLength: localize('rag.passageLength', "Passage Length"),
		aboutWords: localize('rag.aboutWords', "About {0} words", '{0}'),
		notCut: localize('rag.notCut', "The passages are cut when the index is built, in step 3; then the passages of each document are shown here."),
		otherWords: localize('rag.otherWords', "The index was cut into passages of about {0} words: building it again, in step 3, cuts them to the new length.", '{0}'),
		document: localize('rag.document', "Document"),
		passages: localize('rag.passages', "Passages"),
		show: localize('rag.show', "Show"),
		hide: localize('rag.hide', "Hide"),
		firstPassages: localize('rag.firstPassages', "The first {0} passages of {1}", SHOWN_PASSAGES, '{1}'),
		page: localize('rag.page', "Page {0}", '{0}'),
		embedding: localize('rag.embedding', "Embedding"),
		embeddingIntro: localize('rag.embeddingIntro', "An embedding model turns each passage into a vector, so that the passages nearest in meaning to a question are found. Each passage is embedded once by each model, ever: building again, or another collection, takes it from {0}.", '<span class="yellow">~/.pollis/documents/embeddings.duckdb</span>'),
		embeddingModel: localize('rag.embeddingModel', "Embedding Model"),
		noModels: localize('rag.noModels', "No embedding model on this computer yet: Compose > Local Models downloads them."),
		build: localize('rag.build', "Build the Index"),
		buildNeeds: localize('rag.buildNeeds', "Add documents, and choose an embedding model."),
		built: localize('rag.built', "Built {0}: {1} passages of about {2} words, {3} embedded with {4}.", '{0}', '{1}', '{2}', '{3}', '{4}'),
		otherModel: localize('rag.otherModel', "The index was embedded with another model: Build the Index embeds it with this one."),
		stages: {
			compiling: localize('rag.stageCompiling', "Compiling"),
			installing: localize('rag.stageInstalling', "Installing DuckDB.jl"),
			reading: localize('rag.stageReading', "Reading the documents"),
			embedding: localize('rag.stageEmbedding', "Embedding"),
		},
		progress: localize('rag.progress', "{0}: {1} of {2}", '{0}', '{1}', '{2}'),
		errors: {
			busy: localize('rag.errorBusy', "This collection is being indexed already."),
			noJulia: localize('rag.errorNoJulia', "Julia was not found: the index is built with Julia."),
			noDuckDB: localize('rag.errorNoDuckDB', "DuckDB.jl could not be installed."),
			failed: localize('rag.errorFailed', "The index could not be built."),
		},
		retrieval: localize('rag.retrieval', "Retrieval"),
		retrievalIntro: localize('rag.retrievalIntro', "A question is searched in the index by its words (BM25) and by its meaning (the cosine of its embedding with each passage's), the two lists fused by their ranks: the passages a model would answer from. Try questions here to see what the collection gives."),
		question: localize('rag.question', "Question"),
		questionPlaceholder: localize('rag.questionPlaceholder', "Ask about the documents of the collection"),
		passagesFound: localize('rag.passagesFound', "Passages"),
		search: localize('rag.search', "Search"),
		notBuilt: localize('rag.notBuilt', "Build the index first, in step 3."),
		foundLine: localize('rag.foundLine', "{0} passages in {1} ms.", '{0}', '{1}'),
		wordsOnly: {
			notIndexed: localize('rag.wordsOnlyNotIndexed', "Searched by words only: the index has no embeddings."),
			notEmbedded: localize('rag.wordsOnlyNotEmbedded', "Searched by words only: the passages are not embedded."),
			otherModel: localize('rag.wordsOnlyOtherModel', "Searched by words only: the index was embedded with another model."),
			modelNotStarted: localize('rag.wordsOnlyModelNotStarted', "Searched by words only: the embedding model did not start."),
		},
		score: localize('rag.score', "Score {0}", '{0}'),
		reranking: localize('rag.reranking', "Reranking"),
		rerankingIntro: localize('rag.rerankingIntro', "Optional. A reranker reads the question together with each passage found in step 4 and scores how well the passage answers it: more precise than the search, but too slow for a whole collection. So find more passages in step 4, say 30, and keep the best of them here."),
		rerankOn: localize('rag.rerankOn', "Answer from the passages kept"),
		reranker: localize('rag.reranker', "Reranker"),
		keep: localize('rag.keep', "Keep"),
		rerank: localize('rag.rerank', "Rerank"),
		noRerankers: localize('rag.noRerankers', "No reranker on this computer yet, such as Qwen3-Reranker-0.6B or bge-reranker-v2-m3: they go in {0}.", '<span class="yellow">~/.pollis/models</span>'),
		rerankedLine: localize('rag.rerankedLine', "The best {0} of {1} passages, in {2} ms.", '{0}', '{1}', '{2}'),
		before: localize('rag.before', "was {0}", '{0}'),
		rerankFirst: localize('rag.rerankFirst', "Rerank the passages first, in step 5, or untick Answer from the passages kept."),
		rerankErrors: {
			noReranker: localize('rag.rerankNoReranker', "No reranker on this computer yet."),
			searchFirst: localize('rag.rerankSearchFirst', "Search a question first, in step 4."),
			failed: localize('rag.rerankFailed', "The reranker did not answer. {0}", '{0}'),
		},
		generation: localize('rag.generation', "Generation"),
		generationIntro: localize('rag.generationIntro', "A model answers the question of step 4 from the passages found there, or from those kept in step 5, citing them by their numbers. A local model runs on this computer; a cloud model needs its key, set in Ask Pollis."),
		answeringModel: localize('rag.answeringModel', "Answering Model"),
		onThisComputer: localize('rag.onThisComputer', "On This Computer"),
		cloud: localize('rag.cloud', "Cloud"),
		answer: localize('rag.answer', "Answer"),
		stop: localize('rag.stop', "Stop"),
		searchFirst: localize('rag.searchFirst', "Search a question first, in step 4: the model answers from the passages found."),
		answeringLine: localize('rag.answeringLine', "{0} is answering from {1} passages.", '{0}', '{1}'),
		answeredLine: localize('rag.answeredLine', "Answered by {0} in {1} s.", '{0}', '{1}'),
		stopped: localize('rag.stopped', "Stopped."),
		kinds: { pdf: 'PDF', markdown: 'Markdown', text: localize('rag.text', "Text") },
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		${compareCss}
		.missing { color: var(--vscode-errorForeground); }
		input[type=text], input[type=number] { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-panel-border)); border-radius: 2px; padding: 3px 6px; }
		input[type=text]:focus, input[type=number]:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		input::placeholder { color: var(--vscode-input-placeholderForeground); }
		.passage { margin: 8px 0; padding: 8px 12px; border-left: 2px solid var(--vscode-textBlockQuote-border); background: var(--vscode-textBlockQuote-background); max-width: 900px; }
		.passage .small { margin-bottom: 4px; }
		.passage .text { white-space: pre-wrap; line-height: 1.4; }
		${askAnswerCss}
		.answering { max-width: 900px; margin-top: 8px; }
	</style>
</head>
<body>
<div class="container">
	<h1>${text.title}</h1>
	<div class="powered-by">${text.poweredBy}&nbsp;<span id="package-links"></span></div>
	<p class="subtitle">${text.intro}</p>
	<div class="row">
		<span class="small">${text.collection}</span> <select id="collections"></select>
		<span class="bar">
			<button class="action current" id="newCollection">${text.newCollection}</button>
			<button class="action" id="rename">${text.rename}</button>
			<button class="action" id="delete">${text.delete}</button>
		</span>
	</div>
	<p class="hint" id="noCollection" hidden>${text.noCollection}</p>

	<div id="steps">
		<h2 class="section"><span class="step">1</span>${text.ingestion}</h2>
		<p class="hint">${text.ingestionIntro}</p>
		<div class="settings"><span class="bar"><button class="action current" id="addFiles">${text.addFiles}</button></span></div>
		<p class="hint" id="noDocuments" hidden>${text.noDocuments}</p>
		<table id="documents" hidden>
			<thead><tr><th>${text.titleColumn}</th><th>${text.kind}</th><th>${text.file}</th><th>${text.status}</th><th></th></tr></thead>
			<tbody id="documentsBody"></tbody>
		</table>

		<h2 class="section"><span class="step">2</span>${text.chunking}</h2>
		<p class="hint">${text.chunkingIntro}</p>
		<div class="row"><span class="small">${text.passageLength}</span> <select id="words">${PASSAGE_WORDS.map(words => `<option value="${words}">${text.aboutWords.replace('{0}', String(words))}</option>`).join('')}</select></div>
		<p class="hint" id="otherWords" hidden></p>
		<p class="hint" id="notCut" hidden>${text.notCut}</p>
		<table id="chunks" hidden>
			<thead><tr><th>${text.document}</th><th>${text.passages}</th><th></th></tr></thead>
			<tbody id="chunksBody"></tbody>
		</table>
		<div id="shown" hidden>
			<h3 class="part" id="shownTitle"></h3>
			<div id="shownPassages"></div>
		</div>

		<h2 class="section"><span class="step">3</span>${text.embedding}</h2>
		<p class="hint">${text.embeddingIntro}</p>
		<p class="hint" id="noModels" hidden>${text.noModels}</p>
		<div class="row"><span class="small">${text.embeddingModel}</span> <select id="model"></select></div>
		<p class="hint" id="otherModel" hidden>${text.otherModel}</p>
		<div class="settings"><span class="bar"><button class="action current" id="build" disabled>${text.build}</button></span></div>
		<div class="small status" id="buildStatus"></div>

		<h2 class="section"><span class="step">4</span>${text.retrieval}</h2>
		<p class="hint">${text.retrievalIntro}</p>
		<div class="row">
			<span class="small">${text.question}</span>
			<input type="text" class="grow" id="question" placeholder="${text.questionPlaceholder}">
			<span class="small">${text.passagesFound}</span>
			<input type="number" id="passageCount" min="1" max="50" value="${ASK_PASSAGES}" style="width: 4em">
			<span class="bar"><button class="action current" id="search" disabled>${text.search}</button></span>
		</div>
		<div class="small status" id="searchStatus"></div>
		<div id="foundPassages"></div>

		<h2 class="section"><span class="step">5</span>${text.reranking}</h2>
		<p class="hint">${text.rerankingIntro}</p>
		<p class="hint" id="noRerankers" hidden>${text.noRerankers}</p>
		<div class="row">
			<span class="small">${text.reranker}</span> <select id="reranker"></select>
			<span class="small">${text.keep}</span>
			<input type="number" id="keep" min="1" max="50" value="${KEPT_PASSAGES}" style="width: 4em">
			<span class="bar"><button class="action current" id="rerank" disabled>${text.rerank}</button></span>
		</div>
		<div class="row"><label><input type="checkbox" id="rerankOn"> ${text.rerankOn}</label></div>
		<div class="small status" id="rerankStatus"></div>
		<div id="rerankedPassages"></div>

		<h2 class="section"><span class="step">6</span>${text.generation}</h2>
		<p class="hint">${text.generationIntro}</p>
		<div class="row">
			<span class="small">${text.answeringModel}</span> <select id="answerModel"></select>
			<span class="bar"><button class="action current" id="answer" disabled>${text.answer}</button></span>
		</div>
		<div class="small status" id="answerStatus"></div>
		<div class="answering" id="answering">
			<div class="answer" id="answerText"></div>
			<div class="sources" id="answerSources"></div>
		</div>
	</div>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const POWERED_BY = ${JSON.stringify(POWERED_BY)};
	const SPINNER = '${spinnerSvg}';
	${askAnswerScript()}
	${pageCommonScript}

	const collectionsSelect = document.getElementById('collections');
	collectionsSelect.addEventListener('change', () => vscode.postMessage({ command: 'choose', id: collectionsSelect.value }));
	for (const command of ['newCollection', 'rename', 'delete', 'addFiles', 'build']) {
		document.getElementById(command).addEventListener('click', () => vscode.postMessage({ command }));
	}

	const wordsSelect = document.getElementById('words');
	wordsSelect.addEventListener('change', () => vscode.postMessage({ command: 'words', words: Number(wordsSelect.value) }));
	let shownFile;

	function renderChunks(message) {
		wordsSelect.value = String(message.words);
		const other = message.indexedWords !== undefined && message.indexedWords !== message.words;
		document.getElementById('otherWords').hidden = !other;
		document.getElementById('otherWords').textContent = other ? format(TEXT.otherWords, message.indexedWords) : '';
		document.getElementById('notCut').hidden = message.indexed;
		const body = document.getElementById('chunksBody');
		body.textContent = '';
		for (const doc of message.indexed ? message.documents : []) {
			const row = document.createElement('tr');
			row.appendChild(element('td', '', doc.title));
			row.appendChild(element('td', '', doc.passages === undefined ? '-' : String(doc.passages)));
			const showCell = document.createElement('td');
			if (doc.passages) {
				const show = element('button', 'link show', doc.file === shownFile ? TEXT.hide : TEXT.show);
				show.dataset.file = doc.file;
				show.addEventListener('click', () => {
					if (shownFile === doc.file) {
						shownFile = undefined;
						document.getElementById('shown').hidden = true;
					} else {
						shownFile = doc.file;
						vscode.postMessage({ command: 'passages', file: doc.file });
					}
					updateShowButtons();
				});
				showCell.appendChild(show);
			}
			row.appendChild(showCell);
			body.appendChild(row);
		}
		document.getElementById('chunks').hidden = !message.indexed || !message.documents.length;
		if (!message.indexed || !message.documents.some(doc => doc.file === shownFile && doc.passages)) {
			shownFile = undefined;
			document.getElementById('shown').hidden = true;
			updateShowButtons();
		}
	}

	/** Hide on the button of the document whose passages are shown, Show on the others. */
	function updateShowButtons() {
		for (const button of document.querySelectorAll('#chunksBody button.show')) {
			button.textContent = button.dataset.file === shownFile ? TEXT.hide : TEXT.show;
		}
	}

	function renderPassages(message) {
		if (message.file !== shownFile) { return; }
		const doc = lastDocuments.find(d => d.file === message.file);
		document.getElementById('shownTitle').textContent = format(TEXT.firstPassages, '', doc ? doc.title : message.file);
		const list = document.getElementById('shownPassages');
		list.textContent = '';
		for (const passage of message.passages) {
			const block = element('div', 'passage');
			const where = [passage.heading, passage.page ? format(TEXT.page, passage.page) : ''].filter(Boolean).join(' \u00b7 ');
			if (where) { block.appendChild(element('div', 'small', where)); }
			block.appendChild(element('div', 'text', passage.text));
			list.appendChild(block);
		}
		document.getElementById('shown').hidden = false;
	}

	const modelSelect = document.getElementById('model');
	modelSelect.addEventListener('change', () => vscode.postMessage({ command: 'model', model: modelSelect.value }));
	const buildStatus = document.getElementById('buildStatus');
	let building = false;
	let buildError;
	let lastState;

	function showProgress(progress) {
		building = !!progress;
		if (progress) {
			buildError = undefined;
			const stage = TEXT.stages[progress.stage] || '';
			buildStatus.innerHTML = SPINNER + ' ';
			buildStatus.appendChild(document.createTextNode(progress.total ? format(TEXT.progress, stage, progress.done, progress.total) : stage));
		}
		updateBuild();
	}

	function updateBuild() {
		const state = lastState;
		const ready = !!state && !!state.model && state.documents.some(doc => doc.present);
		document.getElementById('build').disabled = building || !ready;
		if (building) { return; }
		buildStatus.textContent = buildError ? (TEXT.errors[buildError] || TEXT.errors.failed)
			: !ready ? TEXT.buildNeeds
			: state.status && state.status.passages ? format(TEXT.built, state.status.builtAt ? new Date(Number(state.status.builtAt)).toLocaleString() : '', state.status.passages, state.status.words, state.status.embedded, splitModel(state.status.embedder))
			: '';
		buildStatus.classList.toggle('missing', !!buildError);
	}

	function splitModel(value) {
		const model = lastState && lastState.models.find(m => m.value === value);
		return model ? model.label : String(value || '').split('/').pop();
	}

	function renderEmbedding(message) {
		lastState = message;
		modelSelect.textContent = '';
		for (const model of message.models) {
			modelSelect.appendChild(new Option(model.size ? model.label + ' (' + model.size + ')' : model.label, model.value));
		}
		modelSelect.value = message.model;
		modelSelect.disabled = !message.models.length;
		document.getElementById('noModels').hidden = !!message.models.length;
		document.getElementById('otherModel').hidden = !message.status || !message.status.passages || !message.model || message.status.embedder === message.model;
		showProgress(message.progress);
	}

	const questionInput = document.getElementById('question');
	const searchButton = document.getElementById('search');
	const searchStatus = document.getElementById('searchStatus');
	let searching = false;
	function updateSearch() {
		const built = !!lastState && !!lastState.status && !!lastState.status.passages;
		searchButton.disabled = searching || building || !built || !questionInput.value.trim();
		if (!searching) { searchStatus.textContent = built ? searchStatus.textContent : TEXT.notBuilt; }
	}
	function search() {
		if (searchButton.disabled) { return; }
		searching = true;
		searchStatus.innerHTML = SPINNER;
		document.getElementById('foundPassages').textContent = '';
		clearReranked();
		clearAnswer();
		updateSearch();
		vscode.postMessage({ command: 'search', question: questionInput.value.trim(), passages: Number(document.getElementById('passageCount').value) || ${ASK_PASSAGES} });
	}
	questionInput.addEventListener('input', updateSearch);
	questionInput.addEventListener('keydown', event => { if (event.key === 'Enter') { search(); } });
	searchButton.addEventListener('click', search);

	/** A passage found or kept, numbered, with its document, where it is in it, its score, and its place before reranking. */
	function passageBlock(passage, index) {
		const block = element('div', 'passage');
		const head = element('div', 'small');
		head.appendChild(document.createTextNode((index + 1) + '. '));
		const open = element('button', 'link', passage.title);
		open.title = passage.file;
		open.addEventListener('click', () => vscode.postMessage({ command: 'openPassage', file: passage.file, page: passage.page }));
		head.appendChild(open);
		const where = [passage.heading, passage.page ? format(TEXT.page, passage.page) : '', format(TEXT.score, fixed(passage.score, 4)), passage.before ? format(TEXT.before, passage.before) : ''].filter(Boolean).join(' \u00b7 ');
		head.appendChild(document.createTextNode(' \u00b7 ' + where));
		block.appendChild(head);
		block.appendChild(element('div', 'text', passage.text));
		return block;
	}

	function renderFound(message) {
		searching = false;
		const list = document.getElementById('foundPassages');
		list.textContent = '';
		if (message.error === 'notBuilt') {
			searchStatus.textContent = TEXT.notBuilt;
		} else {
			searchStatus.textContent = [format(TEXT.foundLine, message.passages.length, message.milliseconds), message.wordsOnly ? TEXT.wordsOnly[message.wordsOnly] : '', message.error || ''].filter(Boolean).join(' ');
			foundCount = message.passages.length;
			message.passages.forEach((passage, index) => list.appendChild(passageBlock(passage, index)));
		}
		updateSearch();
		updateRerank();
		updateAnswer();
	}

	const rerankerSelect = document.getElementById('reranker');
	const keepInput = document.getElementById('keep');
	const rerankOn = document.getElementById('rerankOn');
	const rerankButton = document.getElementById('rerank');
	const rerankStatus = document.getElementById('rerankStatus');
	/** Whether the passages of the last search have been reranked, and whether they are being. */
	let reranked = false;
	let reranking = false;
	const sendRerankSettings = () => {
		vscode.postMessage({ command: 'rerankSettings', on: rerankOn.checked, reranker: rerankerSelect.value, keep: Number(keepInput.value) });
		updateAnswer();
	};
	rerankerSelect.addEventListener('change', sendRerankSettings);
	keepInput.addEventListener('change', sendRerankSettings);
	rerankOn.addEventListener('change', sendRerankSettings);

	function renderRerankers(message) {
		rerankerSelect.textContent = '';
		for (const model of message.rerankers) {
			rerankerSelect.appendChild(new Option(model.size ? model.label + ' (' + model.size + ')' : model.label, model.value));
		}
		rerankerSelect.value = message.reranker;
		rerankerSelect.disabled = !message.rerankers.length;
		document.getElementById('noRerankers').hidden = !!message.rerankers.length;
		keepInput.value = String(message.keep);
		rerankOn.checked = message.rerank;
	}

	function updateRerank() {
		rerankButton.disabled = reranking || searching || !foundCount || !rerankerSelect.value;
	}

	function clearReranked() {
		reranked = false;
		reranking = false;
		rerankStatus.textContent = '';
		rerankStatus.classList.remove('missing');
		document.getElementById('rerankedPassages').textContent = '';
		updateRerank();
	}

	rerankButton.addEventListener('click', () => {
		if (rerankButton.disabled) { return; }
		reranking = true;
		reranked = false;
		rerankStatus.innerHTML = SPINNER;
		rerankStatus.classList.remove('missing');
		document.getElementById('rerankedPassages').textContent = '';
		updateRerank();
		updateAnswer();
		vscode.postMessage({ command: 'rerank' });
	});

	function renderReranked(message) {
		reranking = false;
		const list = document.getElementById('rerankedPassages');
		list.textContent = '';
		if (message.error) {
			rerankStatus.textContent = message.error === 'noReranker' || message.error === 'searchFirst' ? TEXT.rerankErrors[message.error] : format(TEXT.rerankErrors.failed, message.error === 'failed' ? '' : message.error);
			rerankStatus.classList.add('missing');
		} else {
			reranked = true;
			rerankStatus.textContent = format(TEXT.rerankedLine, message.passages.length, message.of, message.milliseconds);
			message.passages.forEach((passage, index) => list.appendChild(passageBlock(passage, index)));
		}
		updateRerank();
		updateAnswer();
	}

	const answerSelect = document.getElementById('answerModel');
	answerSelect.addEventListener('change', () => vscode.postMessage({ command: 'answerModel', model: answerSelect.value }));
	const answerButton = document.getElementById('answer');
	const answerStatus = document.getElementById('answerStatus');
	const answerText = document.getElementById('answerText');
	const answerSources = document.getElementById('answerSources');
	/** The passages found by the last search, the answer shown (its id from the host), and its passages and text. */
	let foundCount = 0;
	let answerId;
	let answerPassages = [];
	let written = '';
	/** Whether an answer has ended, its status line then saying how, or why there is none. */
	let answerDone = false;

	function renderAnswerModels(message) {
		const groups = [[TEXT.onThisComputer, message.answeringModels.local], [TEXT.cloud, message.answeringModels.cloud]];
		if (answerSelect.options.length !== groups.reduce((sum, [, models]) => sum + models.length, 0)) {
			answerSelect.textContent = '';
			for (const [label, models] of groups) {
				const group = element('optgroup');
				group.label = label;
				for (const model of models) {
					group.appendChild(new Option(model.detail ? model.label + ' (' + model.detail + ')' : model.label, model.value));
				}
				answerSelect.appendChild(group);
			}
		}
		answerSelect.value = message.answeringModel;
	}

	function updateAnswer() {
		const answering = answerId !== undefined;
		answerButton.textContent = answering ? TEXT.stop : TEXT.answer;
		const needsRerank = rerankOn.checked && !reranked;
		answerButton.disabled = !answering && (searching || reranking || !foundCount || needsRerank);
		answerSelect.disabled = answering;
		if (!answering && !answerDone) { answerStatus.textContent = !foundCount ? TEXT.searchFirst : needsRerank ? TEXT.rerankFirst : ''; }
	}

	function clearAnswer() {
		answerId = undefined;
		foundCount = 0;
		answerPassages = [];
		written = '';
		answerDone = false;
		answerText.textContent = '';
		answerSources.textContent = '';
		answerStatus.textContent = '';
		answerStatus.classList.remove('missing');
		updateAnswer();
	}

	function renderAnswer(done) {
		answerText.innerHTML = markdown(written, answerPassages.length);
		renderSources(answerSources, answerPassages, written, done, n => vscode.postMessage({ command: 'openPassage', file: answerPassages[n].file, page: answerPassages[n].page }));
	}

	answerButton.addEventListener('click', () => {
		if (answerId !== undefined) {
			vscode.postMessage({ command: 'stopAnswer' });
		} else if (!answerButton.disabled) {
			answerId = 0;
			answerDone = false;
			written = '';
			answerText.textContent = '';
			answerSources.textContent = '';
			answerStatus.innerHTML = SPINNER;
			answerStatus.classList.remove('missing');
			updateAnswer();
			vscode.postMessage({ command: 'answer' });
		}
	});
	document.getElementById('answering').addEventListener('click', event => showSource(event, 'answering'));

	let lastDocuments = [];
	let shownCollection;
	function renderDocuments(documents) {
		lastDocuments = documents;
		const body = document.getElementById('documentsBody');
		body.textContent = '';
		for (const doc of documents) {
			const row = document.createElement('tr');
			const titleCell = document.createElement('td');
			const open = element('button', 'link', doc.title);
			open.title = doc.file;
			open.addEventListener('click', () => vscode.postMessage({ command: 'open', file: doc.file }));
			titleCell.appendChild(open);
			row.appendChild(titleCell);
			row.appendChild(element('td', '', TEXT.kinds[doc.kind]));
			row.appendChild(element('td', 'yellow', doc.file));
			row.appendChild(element('td', doc.present ? '' : 'missing', doc.present ? TEXT.present : TEXT.missing));
			const removeCell = document.createElement('td');
			const remove = element('button', 'link', TEXT.remove);
			remove.addEventListener('click', () => vscode.postMessage({ command: 'remove', file: doc.file }));
			removeCell.appendChild(remove);
			row.appendChild(removeCell);
			body.appendChild(row);
		}
		document.getElementById('documents').hidden = !documents.length;
		document.getElementById('noDocuments').hidden = !!documents.length || !collectionsSelect.options.length;
	}

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			collectionsSelect.textContent = '';
			for (const collection of message.collections) {
				collectionsSelect.appendChild(new Option(collection.name, collection.id));
			}
			collectionsSelect.value = message.chosen;
			if (message.chosen !== shownCollection) {
				shownCollection = message.chosen;
				document.getElementById('foundPassages').textContent = '';
				searchStatus.textContent = '';
				clearReranked();
				clearAnswer();
			}
			const none = !message.collections.length;
			collectionsSelect.disabled = none;
			document.getElementById('rename').disabled = none;
			document.getElementById('delete').disabled = none;
			document.getElementById('noCollection').hidden = !none;
			document.getElementById('addFiles').disabled = none;
			renderDocuments(message.documents);
			renderChunks(message);
			renderEmbedding(message);
			renderAnswerModels(message);
			renderRerankers(message);
			updateSearch();
			updateRerank();
			updateAnswer();
		} else if (message.command === 'starting' && answerId !== undefined) {
			answerId = message.id;
			answerPassages = message.passages;
			answerStatus.innerHTML = SPINNER + ' ';
			answerStatus.appendChild(document.createTextNode(format(TEXT.answeringLine, message.model, message.passages.length)));
		} else if (message.command === 'answerText' && message.id === answerId) {
			written = message.text;
			renderAnswer(false);
		} else if (message.command === 'answered' && message.id === answerId) {
			answerId = undefined;
			answerDone = true;
			renderAnswer(true);
			answerStatus.textContent = message.error || (message.stopped ? TEXT.stopped : format(TEXT.answeredLine, message.model, message.seconds === undefined ? '-' : fixed(message.seconds, 1)));
			answerStatus.classList.toggle('missing', !!message.error);
			updateAnswer();
		} else if (message.command === 'found') {
			renderFound(message);
		} else if (message.command === 'reranked') {
			renderReranked(message);
		} else if (message.command === 'progress') {
			showProgress(message.progress);
		} else if (message.command === 'built') {
			building = false;
			buildError = message.error;
			updateBuild();
		} else if (message.command === 'passages') {
			renderPassages(message);
		}
	});
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: RAG_COMMAND_ID,
			title: localize2('rag.action', "Retrieval-Augmented Generation"),
			category: Categories.Help,
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openRagPage(accessor);
	}
});
