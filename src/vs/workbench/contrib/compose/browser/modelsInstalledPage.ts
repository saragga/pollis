/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ConfigurationTarget, IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { MODEL_ROUTING_COMMAND_ID } from './modelRouting.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { MODELSINSTALLED_METADATA } from '../../model/browser/webviews/modelsInstalled.data.js';
import { buildWebviewHtml, nextStepIcon, spinnerCss, spinnerSvg } from '../../model/browser/webviews/webviewScaffold.js';
import { sortHeadingsCss, sortHeadingsScript, sortHint } from '../../model/browser/webviews/webviewPager.js';
import { ASK_EMBEDDING_MODEL, embeddingPrefixes, MODELS_INSTALLED_COMMAND_ID } from '../common/askPollis.js';
import { askModels, chooseAskModel } from './askPollisPage.js';
import { askModelName } from './askPollisWebview.js';
import { COMPARE_EMBEDDINGS_COMMAND_ID, useAskEmbeddingModel } from './compareEmbeddingsPage.js';
import { COMPARE_MODELS_COMMAND_ID } from './compareModelsPage.js';

// Compose > Local Models > Set Active Models, in the Time Arrow style of the scaffold. Step 1, Browse Models, is a table
// with a section each for the local embedding, reranker and answering models, the GGUF models on this computer, those
// Pollis downloaded and those in the Hugging Face cache, which the llama.cpp that comes with Pollis runs, and one for the
// cloud models, which answer. Each shows what it reads (images and audio through the projector beside it), whether it
// calls tools (from its chat template), its size and the day its repository was published on Hugging Face. A local one also has an icon that opens its folder and
// Other Versions: the other files of its repository on Hugging Face (other quantisations, its projector), each with its
// size and a link to download it. A click on a column's header sorts the models of each section by it, by name at first.
// Step 2, Set Models, sets the models of Pollis AI+, which the status bar shows: the answering model (of this computer or the cloud), the embedding model and the reranker, none or
// one. Next Steps opens Evaluate Answering Models and Evaluate Embedding Models. The models are looked up again
// (language-julia.pollisInstalledModels) when the page is shown again or Pollis gets the focus back.

/** A model on this computer, as language-julia.pollisInstalledModels answers it. */
export interface IInstalledModel {
	readonly file: string;
	/** The model's value in the settings: `hf:` for a file in ~/.pollis/models, else its path. */
	readonly value?: string;
	readonly name: string;
	readonly sizeLabel?: string;
	readonly kind?: 'chat' | 'embedding' | 'reranker';
	readonly bytes: number;
	readonly repository?: string;
	readonly media: readonly ('image' | 'audio')[];
	readonly tools?: boolean;
	readonly tiers: readonly string[];
}

/** A file of a model's repository, as language-julia.pollisModelVersions answers it. */
interface IModelVersion {
	readonly value: string;
	readonly name: string;
	readonly bytes: number;
	readonly projector: boolean;
	readonly installed: boolean;
}

type ModelsMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'routing' }
	| { readonly command: 'evaluateAnswering' }
	| { readonly command: 'evaluateEmbedding' }
	| { readonly command: 'setAnswering'; readonly value: string }
	| { readonly command: 'setEmbedding'; readonly value: string }
	| { readonly command: 'setReranker'; readonly value: string }
	| { readonly command: 'reveal'; readonly file: string }
	| { readonly command: 'versions'; readonly file: string }
	| { readonly command: 'download'; readonly file: string; readonly value: string };

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** Opens the Set Active Models page, or shows it again when it is open. */
async function openModelsInstalledPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const hostService = accessor.get(IHostService);
	const commandService = accessor.get(ICommandService);
	const configurationService = accessor.get(IConfigurationService);
	const openerService = accessor.get(IOpenerService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const storageService = accessor.get(IStorageService);
	const dialogService = accessor.get(IDialogService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('modelsInstalled.title', "Set Active Models");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.modelsInstalled',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());
	openPage = webviewInput;

	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'modelsInstalled', title, MODELSINSTALLED_METADATA.modelsInstalled, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));

	let models: readonly IInstalledModel[] = [];
	const notYetHere = localize('modelsInstalled.notYetHere', "downloaded when first used");
	/** The models of a kind on this computer, and the one in use too when it is not here yet. */
	const choices = (kind: IInstalledModel['kind'], inUse: string | undefined) => {
		const listed = models.filter(model => model.kind === kind).map(model => ({ value: model.value ?? model.file, label: model.name, detail: model.sizeLabel ?? '' }));
		return inUse && !listed.some(model => model.value === inUse) ? [{ value: inUse, label: askModelName(inUse), detail: notYetHere }, ...listed] : listed;
	};
	const embedder = () => configurationService.getValue<string>('pollis.ask.embeddingModel')?.trim() || ASK_EMBEDDING_MODEL;
	const sendState = async () => {
		models = await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels') ?? [];
		const answering = await askModels(commandService, configurationService);
		const reranker = configurationService.getValue<string>('pollis.ask.reranker')?.trim() ?? '';
		webviewInput.webview.postMessage({
			command: 'state',
			inUse: {
				answering: { value: answering.chosen, local: answering.local, cloud: answering.cloud },
				embedding: { value: embedder(), models: choices('embedding', embedder()) },
				reranker: { value: reranker, models: choices('reranker', reranker), installed: models.some(model => model.kind === 'reranker') },
			},
			models,
		});
		// From Hugging Face the first time, so the table does not wait for them
		const repositories = models.flatMap(model => model.repository ? [model.repository] : []);
		const dates = await commandService.executeCommand<Record<string, string>>('language-julia.pollisPublishedDates', repositories);
		webviewInput.webview.postMessage({ command: 'published', dates: dates ?? {} });
	};
	// The files offered under each model, so that only those are downloaded
	const offered = new Map<string, readonly IModelVersion[]>();
	const sendVersions = async (file: string) => {
		const answer = await commandService.executeCommand<IModelVersion[] | { error: string }>('language-julia.pollisModelVersions', file);
		const versions = Array.isArray(answer) ? answer : [];
		offered.set(file, versions);
		webviewInput.webview.postMessage({ command: 'versions', file, versions, error: Array.isArray(answer) ? undefined : answer?.error });
	};
	disposables.add(webviewInput.webview.onDidFocus(() => sendState()));
	disposables.add(hostService.onDidChangeFocus(focused => {
		if (focused) {
			sendState();
		}
	}));
	disposables.add(configurationService.onDidChangeConfiguration(e => {
		if (['pollis.ask.answerWith', 'pollis.ask.chatModel', 'pollis.ask.embeddingModel', 'pollis.ask.reranker'].some(setting => e.affectsConfiguration(setting))) {
			sendState();
		}
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: ModelsMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			sendState();
		} else if (message.command === 'routing') {
			commandService.executeCommand(MODEL_ROUTING_COMMAND_ID);
		} else if (message.command === 'evaluateAnswering') {
			commandService.executeCommand(COMPARE_MODELS_COMMAND_ID);
		} else if (message.command === 'evaluateEmbedding') {
			commandService.executeCommand(COMPARE_EMBEDDINGS_COMMAND_ID);
		} else if (message.command === 'setAnswering') {
			const answering = await askModels(commandService, configurationService);
			if ([...answering.local, ...answering.cloud].some(model => model.value === message.value)) {
				await chooseAskModel(configurationService, message.value);
			}
		} else if (message.command === 'setEmbedding') {
			if (message.value !== embedder() && choices('embedding', embedder()).some(model => model.value === message.value)) {
				const { confirmed } = await dialogService.confirm({
					message: localize('modelsInstalled.embeddingConfirm', "Use {0} for embedding?", askModelName(message.value)),
					detail: localize('modelsInstalled.embeddingDetail', "The index of Ask Pollis is made again with it, which takes some minutes. Until then questions are searched by their words only."),
					primaryButton: localize({ key: 'modelsInstalled.embeddingUse', comment: ['&& denotes a mnemonic'] }, "&&Use and Index Again"),
				});
				if (confirmed) {
					const prefixes = embeddingPrefixes(message.value);
					await useAskEmbeddingModel(configurationService, commandService, message.value, prefixes.passage, prefixes.query);
				}
			}
			// Declined, the select goes back to the model in use
			sendState();
		} else if (message.command === 'setReranker') {
			if (!message.value || models.some(model => model.kind === 'reranker' && (model.value ?? model.file) === message.value)) {
				await configurationService.updateValue('pollis.ask.reranker', message.value || undefined, ConfigurationTarget.USER);
			}
		} else if (message.command === 'reveal' && models.some(model => model.file === message.file)) {
			commandService.executeCommand('revealFileInOS', URI.file(message.file));
		} else if (message.command === 'versions' && models.some(model => model.file === message.file)) {
			sendVersions(message.file);
		} else if (message.command === 'download' && offered.get(message.file)?.some(version => version.value === message.value)) {
			await commandService.executeCommand<boolean>('language-julia.pollisDownloadModel', message.value);
			webviewInput.webview.postMessage({ command: 'downloaded', value: message.value });
			await sendState();
			sendVersions(message.file);
		}
	}));
}

/** The folder-opened codicon: a webview has no codicon font. */
const OPEN_FOLDER_SVG = '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M2 4.5V9.10022L2.92389 7.5C3.45979 6.5718 4.45017 6 5.52196 6L11.9146 6C11.7087 5.4174 11.1531 5 10.5 5H7C6.86739 5 6.74021 4.94732 6.64645 4.85355L4.93934 3.14645C4.84557 3.05268 4.71839 3 4.58579 3H3.5C2.67157 3 2 3.67157 2 4.5ZM7.06895 13.9953C7.04641 13.9984 7.02339 14 7 14H3.5C2.11929 14 1 12.8807 1 11.5V4.5C1 3.11929 2.11929 2 3.5 2H4.58579C4.98361 2 5.36514 2.15804 5.64645 2.43934L7.20711 4H10.5C11.724 4 12.7426 4.87965 12.958 6.04127C14.605 6.34148 15.5443 8.22106 14.6616 9.75L13.0766 12.4953C12.5407 13.4235 11.5503 13.9953 10.4785 13.9953H7.06895ZM5.52196 7C4.80743 7 4.14718 7.3812 3.78991 8L2.20492 10.7453C1.62757 11.7453 2.34926 12.9953 3.50396 12.9953L10.4785 12.9953C11.193 12.9953 11.8533 12.6141 12.2105 11.9953L13.7955 9.25C14.3729 8.25 13.6512 7 12.4965 7L5.52196 7Z"/></svg>';

/** The page: its texts come from here, the models from the `state` message. */
function pageHtml(): string {
	const text = {
		title: localize('modelsInstalled.title', "Set Active Models"),
		intro: localize('modelsInstalled.intro', "The models Pollis AI+ can use, on this computer or in the cloud, and those it uses. Pollis runs the local ones, those it downloaded and those in the Hugging Face cache, with {0}, which comes with it, free and private.", '<span class="yellow">llama.cpp</span>'),
		browseModels: localize('modelsInstalled.browseModels', "Browse Models"),
		localEmbeddingModels: localize('modelsInstalled.localEmbeddingModels', "Local Embedding Models"),
		localRerankerModels: localize('modelsInstalled.localRerankerModels', "Local Reranker Models"),
		localAnsweringModels: localize('modelsInstalled.localAnsweringModels', "Local Answering Models"),
		cloudModels: localize('modelsInstalled.cloudModels', "Cloud Models"),
		noneInSection: localize('modelsInstalled.noneInSection', "None on this computer yet: Get Models from Hugging Face offers them."),
		setModels: localize('modelsInstalled.setModels', "Set Models"),
		answering: localize('modelsInstalled.answering', "Answering"),
		answeringHint: localize('modelsInstalled.answeringHint', "Writes the answers of Ask Pollis, of each panel's Ask Pollis and of Retrieval-Augmented Generation: a model of this computer, or Claude, Gemini or ChatGPT in the cloud, with your own key, which is set below the question in Ask Pollis."),
		onThisComputer: localize('modelsInstalled.onThisComputer', "On this computer: nothing leaves it"),
		inTheCloud: localize('modelsInstalled.inTheCloud', "Cloud, with your own key"),
		embeddingHint: localize('modelsInstalled.embeddingHint', "Finds passages by their meaning. Another model means making the index again."),
		rerankerHint: localize('modelsInstalled.rerankerHint', "Reads the question with each passage found and keeps the best: more precise, and slower. None leaves them in the order of the search."),
		noReranker: localize('modelsInstalled.noReranker', "None"),
		noRerankers: localize('modelsInstalled.noRerankers', "No reranker on this computer yet: Get Models from Hugging Face offers them."),
		evaluateAnswering: localize('modelsInstalled.evaluateAnswering', "Evaluate Answering Models"),
		evaluateEmbedding: localize('modelsInstalled.evaluateEmbedding', "Evaluate Embedding Models"),
		model: localize('modelsInstalled.model', "Model"),
		reads: localize('modelsInstalled.reads', "Reads"),
		text: localize('modelsInstalled.text', "Text"),
		image: localize('modelsInstalled.image', "Image"),
		audio: localize('modelsInstalled.audio', "Audio"),
		tools: localize('modelsInstalled.tools', "Tools"),
		yes: localize('modelsInstalled.yes', "Yes"),
		no: localize('modelsInstalled.no', "No"),
		toolsTooltip: localize('modelsInstalled.toolsTooltip', "Whether the model can call tools, from its chat template: the agent of a Model Tasks and Routing tier needs a model that can."),
		sortTooltip: sortHint(),
		size: localize('modelsInstalled.size', "Size"),
		date: localize('modelsInstalled.date', "Date"),
		embedding: localize('modelsInstalled.embedding', "Embedding"),
		reranker: localize('modelsInstalled.reranker', "Reranker"),
		openFolder: localize('modelsInstalled.openFolder', "Open Folder"),
		otherVersions: localize('modelsInstalled.otherVersions', "Other Versions"),
		lookingUp: localize('modelsInstalled.lookingUp', "Looking on Hugging Face..."),
		noVersions: localize('modelsInstalled.noVersions', "Its repository has no other version."),
		projector: localize('modelsInstalled.projector', "Projector, for images or audio"),
		versionInstalled: localize('modelsInstalled.versionInstalled', "Installed"),
		download: localize('modelsInstalled.download', "Download"),
		downloading: localize('modelsInstalled.downloading', "Downloading..."),
		none: localize('modelsInstalled.none', "No local model on this computer yet. A model is downloaded the first time a panel or a Model Tasks and Routing tier uses it."),
		loading: localize('modelsInstalled.loading', "Looking for the models..."),
		routingIntro: localize('modelsInstalled.routingIntro', "Which tasks run on which local model:"),
		routingLink: localize('modelsInstalled.routingLink', "Compose > Orchestration > Model Tasks and Routing"),
	};
	return buildWebviewHtml({
		title: text.title,
		omitPoweredBy: !MODELSINSTALLED_METADATA.modelsInstalled.packages.length,
		introHtml: text.intro,
		extraCss: `
		${sortHeadingsCss}
		${spinnerCss}
		.container { max-width: 1100px; }
		.modelsPage .setModels { display: grid; grid-template-columns: max-content minmax(0, 720px); gap: 4px 12px; align-items: center; }
		.modelsPage .setModels label { font-weight: 600; }
		.modelsPage .setModels select { width: 100%; padding: 3px 4px; color: var(--vscode-dropdown-foreground); background: var(--vscode-dropdown-background); border: 1px solid var(--vscode-dropdown-border, transparent); border-radius: 2px; font: inherit; }
		.modelsPage .setModels .about { grid-column: 2; margin-bottom: 10px; }
		.modelsPage table { width: 100%; border-collapse: collapse; }
		.modelsPage th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--vscode-widget-border); }
		.modelsPage td { vertical-align: top; padding: 10px 8px; border-bottom: 1px solid var(--vscode-widget-border); line-height: 1.4; }
		.modelsPage tr:hover td { background: var(--vscode-list-hoverBackground); }
		.modelsPage .hint { color: var(--vscode-descriptionForeground); margin: 16px 0 8px 0; line-height: 1.4; max-width: 900px; }
		.modelsPage .name { font-size: 14px; font-weight: 600; }
		.modelsPage .small { font-size: 12px; color: var(--vscode-descriptionForeground); }
		.modelsPage .link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
		.modelsPage .link:hover { text-decoration: underline; }
		.modelsPage .right { text-align: right; white-space: nowrap; }
		/* Every column at the centre but the first, in the table of the models and not in that of a model's versions */
		.modelsPage table.local > thead > tr > th:not(:first-child), .modelsPage table.local > tbody > tr:not(.versions) > td:not(:first-child) { text-align: center; }
		.modelsPage .actions { white-space: nowrap; }
		.modelsPage .actions .link + .link { margin-left: 12px; }
		.modelsPage .openFolder { display: inline-flex; vertical-align: top; }
		.modelsPage .openFolder:hover { color: var(--vscode-textLink-activeForeground); }
		.modelsPage tr.versions td { padding-top: 4px; }
		.modelsPage .versions table td { border-bottom: none; padding: 3px 8px; }
		.modelsPage .installed { color: var(--vscode-testing-iconPassed); }
		/* llama.cpp, in the yellow of the menu paths */
		.yellow { color: #e8a33d; }
		body.vscode-light .yellow { color: #a8650d; }
		.modelsPage table.local td:first-child { box-shadow: inset 3px 0 0 var(--vscode-textLink-foreground); padding-left: 12px; }
		.modelsPage table.local tr:not(:hover) td { background: color-mix(in srgb, var(--vscode-textLink-foreground) 5%, transparent); }
		/* The subtitle of a section of the table */
		.modelsPage table.local > tbody > tr.group > td { font-size: 13px; font-weight: 600; padding: 16px 8px 6px 0; background: none; box-shadow: none; }
		.modelsPage table.local > tbody > tr.noModels > td { color: var(--vscode-descriptionForeground); background: none; box-shadow: none; padding-left: 0; }
`,
		steps: [
			{
				id: 'step-browse',
				title: text.browseModels,
				bodyHtml: `
		<div class="modelsPage">
			<table class="local">
				<thead><tr id="headers"></tr></thead>
				<tbody id="models"></tbody>
			</table>
			<p class="hint" id="none"></p>
			<p class="hint">${text.routingIntro} <button class="link" id="routing">${text.routingLink}</button></p>
		</div>
`,
			},
			{
				id: 'step-set',
				title: text.setModels,
				bodyHtml: `
		<div class="modelsPage">
			<div class="setModels">
				<label for="answering">${text.answering}</label>
				<select id="answering"></select>
				<div class="about small">${text.answeringHint}</div>
				<label for="embedding">${text.embedding}</label>
				<select id="embedding"></select>
				<div class="about small">${text.embeddingHint}</div>
				<label for="reranker">${text.reranker}</label>
				<select id="reranker"></select>
				<div class="about small"><span>${text.rerankerHint}</span> <span id="noRerankers">${text.noRerankers}</span></div>
			</div>
		</div>
`,
			},
		],
		nextStepsHtml: `					<li><button class="list-btn" id="btn-evaluate-answering">${nextStepIcon('compare')}${text.evaluateAnswering}</button></li>
					<li><button class="list-btn" id="btn-evaluate-embedding">${nextStepIcon('compare')}${text.evaluateEmbedding}</button></li>`,
		nextStepsWiringJs: `		document.getElementById('btn-evaluate-answering').addEventListener('click', function() { vscode.postMessage({ command: 'evaluateAnswering' }); });
		document.getElementById('btn-evaluate-embedding').addEventListener('click', function() { vscode.postMessage({ command: 'evaluateEmbedding' }); });`,
		pageScriptJs: `
	${sortHeadingsScript()}
	const TEXT = ${JSON.stringify(text)};
	const models = document.getElementById('models');
	const none = document.getElementById('none');
	none.innerHTML = '${spinnerSvg}';
	none.append(TEXT.loading);
	// The models whose Other Versions are open, and what Hugging Face answered for each
	const open = new Set();
	const versions = new Map();
	let published = {};
	const downloading = new Set();
	let lastState;
	// The columns, with what each sorts by, and the column sorted by inside each section
	const COLUMNS = [
		{ label: TEXT.model, key: model => model.name.toLowerCase() },
		{ label: TEXT.reads, key: model => model.media.length },
		{ label: TEXT.tools, title: TEXT.toolsTooltip, key: model => model.tools === undefined ? -1 : model.tools ? 1 : 0 },
		{ label: TEXT.size, key: model => model.bytes },
		{ label: TEXT.date, key: model => published[model.repository] || '' },
	];
	const sort = { column: 0, ascending: true };
	// The sections of the table: a local model without a kind answers, as in Set Models
	const SECTIONS = [
		{ label: TEXT.localEmbeddingModels, has: model => model.kind === 'embedding' },
		{ label: TEXT.localRerankerModels, has: model => model.kind === 'reranker' },
		{ label: TEXT.localAnsweringModels, has: model => !model.provider && model.kind !== 'embedding' && model.kind !== 'reranker' },
		{ label: TEXT.cloudModels, has: model => !!model.provider },
	];

	/** The day a model's repository was published on Hugging Face, a dash for a model that has none, as a cloud model. */
	function publishedDate(model) {
		const day = published[model.repository];
		return day ? new Date(day + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-';
	}

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content) { node.textContent = content; }
		return node;
	}

	function gigabytes(bytes) {
		return bytes >= 1e9 ? (bytes / 1e9).toFixed(1) + ' GB' : Math.round(bytes / 1e6) + ' MB';
	}

	/** A row of the table's full width, with its text. */
	function wideRow(className, content) {
		const row = element('tr', className);
		const cell = element('td', '', content);
		cell.colSpan = COLUMNS.length + 1;
		row.appendChild(cell);
		return row;
	}

	/** A cloud model as a row of the table: every cloud model reads images and calls tools, and takes no room here. */
	function cloudRow(model) {
		return { id: model.value, name: model.label, provider: model.detail, media: ['image'], tools: true, bytes: 0 };
	}

	function versionsRow(model) {
		const row = element('tr', 'versions');
		const cell = element('td');
		cell.colSpan = COLUMNS.length + 1;
		const answer = versions.get(model.file);
		if (!answer) {
			cell.appendChild(element('div', 'small', TEXT.lookingUp));
		} else if (answer.error || !answer.versions.length) {
			cell.appendChild(element('div', 'small', answer.error || TEXT.noVersions));
		} else {
			const table = element('table');
			for (const version of answer.versions) {
				const line = element('tr');
				const name = element('td');
				name.appendChild(element('div', '', version.name));
				if (version.projector) {
					name.appendChild(element('div', 'small', TEXT.projector));
				}
				line.appendChild(name);
				line.appendChild(element('td', '', gigabytes(version.bytes)));
				const action = element('td', 'right');
				if (version.installed) {
					action.appendChild(element('span', 'installed', TEXT.versionInstalled));
				} else if (downloading.has(version.value)) {
					action.appendChild(element('span', 'small', TEXT.downloading));
				} else {
					const download = element('button', 'link', TEXT.download);
					download.addEventListener('click', () => {
						downloading.add(version.value);
						render(lastState);
						vscode.postMessage({ command: 'download', file: model.file, value: version.value });
					});
					action.appendChild(download);
				}
				line.appendChild(action);
				table.appendChild(line);
			}
			cell.appendChild(table);
		}
		row.appendChild(cell);
		return row;
	}

	function renderHeaders() {
		const headers = document.getElementById('headers');
		headers.textContent = '';
		COLUMNS.forEach((column, index) => {
			const header = element('th', 'sortable');
			header.title = column.title || TEXT.sortTooltip;
			setSortArrow(header, column.label, sort.column === index, !sort.ascending);
			header.addEventListener('click', () => {
				sort.ascending = sort.column === index ? !sort.ascending : true;
				sort.column = index;
				renderHeaders();
				if (lastState) {
					render(lastState);
				}
			});
			headers.appendChild(header);
		});
		headers.appendChild(element('th'));
	}

	/** Fills a select, keeping its options when they are the same, so that a state arriving does not close it. */
	function fillSelect(select, groups, value) {
		const options = JSON.stringify(groups);
		if (select.dataset.options !== options) {
			select.dataset.options = options;
			select.textContent = '';
			for (const group of groups) {
				const parent = group.label ? select.appendChild(Object.assign(document.createElement('optgroup'), { label: group.label })) : select;
				for (const model of group.models) {
					parent.appendChild(new Option(model.detail ? model.label + ' (' + model.detail + ')' : model.label, model.value));
				}
			}
		}
		select.value = value;
	}

	function renderSetModels(inUse) {
		fillSelect(document.getElementById('answering'), [{ label: TEXT.onThisComputer, models: inUse.answering.local }, { label: TEXT.inTheCloud, models: inUse.answering.cloud }], inUse.answering.value);
		fillSelect(document.getElementById('embedding'), [{ models: inUse.embedding.models }], inUse.embedding.value);
		fillSelect(document.getElementById('reranker'), [{ models: [{ value: '', label: TEXT.noReranker }, ...inUse.reranker.models] }], inUse.reranker.value);
		document.getElementById('noRerankers').hidden = inUse.reranker.installed;
	}

	function render(state) {
		lastState = state;
		renderSetModels(state.inUse);
		models.textContent = '';
		none.textContent = state.models.length ? '' : TEXT.none;
		none.style.display = state.models.length ? 'none' : '';
		// Sorted by the column chosen, then by name
		const key = COLUMNS[sort.column].key;
		const name = COLUMNS[0].key;
		const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
		const sorted = [...state.models, ...state.inUse.answering.cloud.map(cloudRow)].sort((a, b) => (sort.ascending ? 1 : -1) * compare(key(a), key(b)) || compare(name(a), name(b)));
		for (const section of SECTIONS) {
			models.appendChild(wideRow('group', section.label));
			const inSection = sorted.filter(section.has);
			if (!inSection.length) {
				models.appendChild(wideRow('noModels', TEXT.noneInSection));
			}
			for (const model of inSection) {
				const row = element('tr');
				const name = element('td');
				name.appendChild(element('div', 'name', model.name));
				name.title = model.file || model.id;
				row.appendChild(name);
				row.appendChild(element('td', '', [TEXT.text, ...model.media.map(medium => medium === 'image' ? TEXT.image : TEXT.audio)].join(', ')));
				row.appendChild(element('td', model.tools ? 'installed' : '', model.tools === undefined ? '-' : model.tools ? TEXT.yes : TEXT.no));
				const size = element('td');
				size.appendChild(element('div', '', model.provider ? '-' : gigabytes(model.bytes)));
				if (model.sizeLabel) {
					size.appendChild(element('div', 'small', model.sizeLabel));
				}
				row.appendChild(size);
				row.appendChild(element('td', '', publishedDate(model)));
				const action = element('td', 'actions');
				if (model.file) {
					const reveal = element('button', 'link openFolder');
					reveal.innerHTML = ${JSON.stringify(OPEN_FOLDER_SVG)};
					reveal.title = TEXT.openFolder;
					reveal.setAttribute('aria-label', TEXT.openFolder);
					reveal.addEventListener('click', () => vscode.postMessage({ command: 'reveal', file: model.file }));
					action.appendChild(reveal);
				}
				if (model.repository) {
					const other = element('button', 'link', TEXT.otherVersions);
					other.addEventListener('click', () => {
						if (open.has(model.file)) {
							open.delete(model.file);
						} else {
							open.add(model.file);
							vscode.postMessage({ command: 'versions', file: model.file });
						}
						render(lastState);
					});
					action.appendChild(other);
				}
				row.appendChild(action);
				models.appendChild(row);
				if (open.has(model.file)) {
					models.appendChild(versionsRow(model));
				}
			}
		}
	}

	renderHeaders();
	document.getElementById('routing').addEventListener('click', () => vscode.postMessage({ command: 'routing' }));
	document.getElementById('answering').addEventListener('change', event => vscode.postMessage({ command: 'setAnswering', value: event.target.value }));
	document.getElementById('embedding').addEventListener('change', event => vscode.postMessage({ command: 'setEmbedding', value: event.target.value }));
	document.getElementById('reranker').addEventListener('change', event => vscode.postMessage({ command: 'setReranker', value: event.target.value }));

	window.addEventListener('message', event => {
		if (event.data.command === 'state') {
			render(event.data);
		} else if (event.data.command === 'downloaded') {
			// Done, or failed with its error shown: the next answer of Hugging Face says which
			downloading.delete(event.data.value);
		} else if (event.data.command === 'versions') {
			versions.set(event.data.file, event.data);
			if (lastState) {
				render(lastState);
			}
		} else if (event.data.command === 'published') {
			published = event.data.dates;
			if (lastState) {
				render(lastState);
			}
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: MODELS_INSTALLED_COMMAND_ID,
			title: localize2('modelsInstalled.action', "Set Active Models"),
			category: localize2('modelsInstalled.category', "Compose"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openModelsInstalledPage(accessor);
	}
});
