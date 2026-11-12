/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { encodeBase64, streamToBuffer, VSBuffer } from '../../../../base/common/buffer.js';
import { timeout } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { basename } from '../../../../base/common/path.js';
import { escape } from '../../../../base/common/strings.js';
import { joinPath } from '../../../../base/common/resources.js';
import { hasKey } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { IRequestContext } from '../../../../base/parts/request/common/request.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ConfigurationTarget, IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProgressService, ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { asJson, asTextOrError, IRequestService, isSuccess } from '../../../../platform/request/common/request.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IAuthenticationService } from '../../../services/authentication/common/authentication.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { registerScaffoldPageHandlers } from '../../model/browser/handlers/scaffoldPage.handler.js';
import { ANSWERINGSTRATEGIES_METADATA } from '../../model/browser/webviews/answeringStrategies.data.js';
import { escJs } from '../../model/browser/webviews/scaffoldShared.js';
import { buildWebviewHtml } from '../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { ASK_PASSAGES, IAskPollisService } from '../common/askPollis.js';
import { ASK_BASE_STRATEGY, ASK_POLLIS_STRATEGIES, ASK_STRATEGIES_CATALOGUE_URL, askPollisStrategy, askStrategiesEqual, askStrategyOfFile, askStrategyToml, AskPollisStrategyStep, IAskPollisStrategiesService, IAskPollisStrategy, IAskStrategyCatalogueEntry } from '../common/askPollisStrategies.js';
import { compareFigures } from './compareModelsRun.js';
import { COMPARE_MODELS_STRATEGY_COMMAND_ID } from './compareModelsPage.js';
import { compareCss, pageHelpersScript } from './compareShared.js';

// Compose > Knowledge for AI Models > Ask Pollis Strategies, in the Minimal style of the scaffold: a table of the answering
// strategies of Ask Pollis, Pollis' own and those of ~/.pollis/ask/strategies/, each with what it does in one sentence
// and its score on the Panel FAQ in the latest run of Evaluate Answering Models with it, and Use in its row, which makes
// it the strategy of Ask Pollis. A click on a strategy opens its details below the table: its steps, what it needs, its
// latest runs, and the buttons that act on it: Evaluate... opens Evaluate Answering Models with it, Copy as New... writes
// a copy of it as a file of the folder and opens it in the editor. Below, the files of the folder that are not strategies, with their
// problems, and, when it offers any, the strategies of the catalogue on GitHub (Trumpingtons/pollis-strategies) with
// Install. Propose to the Catalogue... opens a pull request that adds a strategy of the user's own to the catalogue,
// from the user's copy (fork) of it, signed in to GitHub as the user. The folder is watched (askPollisStrategiesService.ts), so a file saved shows here at once.

export const ANSWERING_STRATEGIES_COMMAND_ID = 'pollis.answeringStrategies';

type StrategiesMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'use'; readonly id: string }
	| { readonly command: 'evaluate'; readonly id: string }
	| { readonly command: 'copy'; readonly id: string }
	| { readonly command: 'openFile'; readonly file: string }
	| { readonly command: 'openFolder' }
	| { readonly command: 'install'; readonly id: string }
	| { readonly command: 'propose'; readonly id: string };

/** The catalogue's repository on GitHub, as its API names it. */
const CATALOGUE_REPOSITORY = 'Trumpingtons/pollis-strategies';
/** The GitHub scope a proposal needs: to fork a public repository, write to the fork and open a pull request. */
const GITHUB_SCOPES = ['public_repo'];

/** The fields of GitHub's answers that a proposal reads: of a user, a ref, a repository, a file, a pull request or an error. */
interface IGitHubJson {
	readonly message?: string;
	readonly login?: string;
	readonly object?: { readonly sha?: string };
	readonly full_name?: string;
	readonly sha?: string;
	readonly html_url?: string;
}

/** An answer of the GitHub API: its status and its JSON, if any. */
interface IGitHubAnswer {
	readonly status: number;
	readonly json: IGitHubJson | undefined;
}

/** The JSON of an answer, whatever its status; undefined when it has none. */
async function readAnswer(context: IRequestContext): Promise<IGitHubAnswer> {
	const text = (await streamToBuffer(context.stream)).toString();
	let json: IGitHubJson | undefined;
	try {
		const parsed = text ? JSON.parse(text) : undefined;
		json = typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : undefined;
	} catch {
		json = undefined;
	}
	return { status: context.res.statusCode ?? 0, json };
}

/** How many runs of a strategy its details show, the latest first. */
const RUNS_SHOWN = 3;
/** How many runs of a strategy are read at most to find its latest on the Panel FAQ. */
const RUNS_READ = 10;

/** The scores of a run of Evaluate Answering Models: when, on which questions, and each model's, a judge's or the answer score. */
interface IStrategyRun {
	readonly started: number;
	readonly questions: number;
	readonly panelFaq: boolean;
	readonly judged: boolean;
	readonly models: readonly { readonly label: string; readonly score: number | undefined }[];
}

/** The open page, so a second request shows it again. */
let openPage: WebviewInput | undefined;

/** A share of the passages, as a number of them. */
function passages(share: number): string {
	return String(Math.round(share * ASK_PASSAGES));
}

/** What a strategy does, in one sentence. */
function summaryWords(strategy: IAskPollisStrategy): string {
	const parts = strategy.steps.map(step => {
		switch (step.step) {
			case 'search':
				return typeof step.panelShare === 'number'
					? localize('answeringStrategies.summarySearchFixed', "{0} of the {1} passages come from the panel", passages(step.panelShare), String(ASK_PASSAGES))
					: localize('answeringStrategies.summarySearchAdaptive', "{0} of the {1} passages come from the panel when it is near the question, {2} when it is not", passages(step.panelShare.near), String(ASK_PASSAGES), passages(step.panelShare.far));
			case 'rerank':
				return step.query === 'panel'
					? localize('answeringStrategies.summaryRerankPanel', "a reranker, told the Context, chooses among them")
					: localize('answeringStrategies.summaryRerank', "a reranker chooses among them");
			case 'answer':
				return step.panel === 'card'
					? localize('answeringStrategies.summaryAnswerCard', "the model is told the panel's name and what it holds")
					: step.panel === 'named'
						? localize('answeringStrategies.summaryAnswerNamed', "the model is told the panel's name")
						: localize('answeringStrategies.summaryAnswerNone', "the model is told nothing of the panel");
		}
	});
	return localize('answeringStrategies.summary', "Asked in a panel: {0}.", parts.join('; '));
}

/** A step of a strategy, in plain words. */
function stepWords(step: AskPollisStrategyStep): string {
	switch (step.step) {
		case 'search':
			return typeof step.panelShare === 'number'
				? localize('answeringStrategies.searchFixed', "Search: asked in a panel, {0} of the {1} passages come from the panel's wikis and the vignettes of its packages, the rest as asked without it.", passages(step.panelShare), String(ASK_PASSAGES))
				: localize('answeringStrategies.searchAdaptive', "Search: asked in a panel, {0} of the {1} passages come from the panel's wikis and the vignettes of its packages when they are near the question, {2} when they are not; the rest as asked without it.", passages(step.panelShare.near), String(ASK_PASSAGES), passages(step.panelShare.far));
		case 'rerank':
			return step.query === 'panel'
				? localize('answeringStrategies.rerankPanel', "Rerank: the reranker chooses the best among three times as many passages, the panel's own and the others each keeping their share, asked the question after its Context.")
				: localize('answeringStrategies.rerankQuestion', "Rerank: the reranker chooses the best among three times as many passages, the panel's own and the others each keeping their share, asked the question.");
		case 'answer':
			return step.panel === 'card'
				? localize('answeringStrategies.answerCard', "Answer: the model is told the panel's name and menu, and what the panel holds: its models, Key Points, decision table, inputs and packages.")
				: step.panel === 'named'
					? localize('answeringStrategies.answerNamed', "Answer: the model is told the panel's name and menu.")
					: localize('answeringStrategies.answerNone', "Answer: the model is told nothing of the panel.");
	}
}

/** What a strategy needs, and whether this computer has it: the reranker of Set Active Models, an embedding of the passages; as HTML, the reranker's file in the yellow. */
function needsWords(strategy: IAskPollisStrategy, reranker: string): string[] {
	const needs: string[] = [];
	for (const step of strategy.steps) {
		if (step.step === 'rerank') {
			needs.push(reranker
				? localize('answeringStrategies.needsReranker', "A reranker: {0}, set in Set Active Models.", `<span class="yellow">${escape(basename(reranker))}</span>`)
				: localize('answeringStrategies.noReranker', "A reranker: none is set in Set Active Models, so the rerank step is skipped."));
		} else if (step.step === 'search' && typeof step.panelShare !== 'number') {
			needs.push(localize('answeringStrategies.needsEmbedding', "Passages embedded by the embedding model of Ask Pollis: searched by their words only, {0} of them come from the panel.", passages(step.panelShare.near)));
		}
	}
	return needs;
}

/** A score as the page shows it: a judge's of 5, or an answer score. */
function scoreWords(score: number | undefined, judged: boolean): string {
	if (score === undefined) {
		return '-';
	}
	return judged
		? localize('answeringStrategies.judgeScore', "{0} of 5 (judge)", score.toFixed(2))
		: localize('answeringStrategies.answerScore', "{0} (answer score)", score.toFixed(2));
}

/** The score of the column Panel FAQ Score: the best model's in the latest run on the Panel FAQ, or why there is none. */
function panelFaqScore(runs: readonly IStrategyRun[]): { readonly score?: string; readonly run?: string; readonly none?: string } {
	const run = runs.find(candidate => candidate.panelFaq);
	if (!run) {
		return { none: localize('answeringStrategies.noFaqRun', "No run on the Panel FAQ yet.") };
	}
	const started = new Date(run.started).toLocaleDateString();
	const best = run.models.flatMap(model => model.score === undefined ? [] : [{ label: model.label, score: model.score }]).sort((a, b) => b.score - a.score)[0];
	if (!best) {
		return { none: localize('answeringStrategies.noFaqScore', "No score: the run of {0} had no judge, and no answer score was measured.", started) };
	}
	return {
		score: scoreWords(best.score, run.judged),
		run: localize('answeringStrategies.faqRun', "{0}, {1} questions, {2}", best.label, String(run.questions), started),
	};
}

/** An id for a new strategy named `label`, among none of `taken`. */
function newId(label: string, taken: ReadonlySet<string>): string {
	const words = label.normalize('NFKD').replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(word => word);
	let base = words.map((word, index) => index ? word[0].toUpperCase() + word.slice(1) : word.toLowerCase()).join('') || 'strategy';
	if (!/^[A-Za-z]/.test(base)) {
		base = `strategy${base}`;
	}
	let id = base;
	for (let number = 2; taken.has(id); number++) {
		id = `${base}${number}`;
	}
	return id;
}

/** Opens the Ask Pollis Strategies page, or shows it again when it is open. */
async function openAnsweringStrategiesPage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const configurationService = accessor.get(IConfigurationService);
	const fileService = accessor.get(IFileService);
	const commandService = accessor.get(ICommandService);
	const hostService = accessor.get(IHostService);
	const openerService = accessor.get(IOpenerService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const pathService = accessor.get(IPathService);
	const storageService = accessor.get(IStorageService);
	const strategiesService = accessor.get(IAskPollisStrategiesService);
	const askPollisService = accessor.get(IAskPollisService);
	const requestService = accessor.get(IRequestService);
	const quickInputService = accessor.get(IQuickInputService);
	const dialogService = accessor.get(IDialogService);
	const authenticationService = accessor.get(IAuthenticationService);
	const progressService = accessor.get(IProgressService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('answeringStrategies.title', "Ask Pollis Strategies");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.answeringStrategies',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());
	openPage = webviewInput;

	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'answeringStrategies', title, ANSWERINGSTRATEGIES_METADATA.answeringStrategies, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));

	// The latest runs of each strategy, by its id, read again when the page is shown again or Pollis gets the focus back:
	// the first RUNS_SHOWN, and the runs after them until one on the Panel FAQ, RUNS_READ at most
	let runs = new Map<string, IStrategyRun[]>();
	let runsRead = false;
	const readRuns = async () => {
		const read = new Map<string, IStrategyRun[]>();
		try {
			for (const summary of await askPollisService.runs()) {
				const id = summary.strategy ?? ASK_BASE_STRATEGY;
				const kept = read.get(id) ?? [];
				if (kept.length >= RUNS_READ || (kept.length >= RUNS_SHOWN && kept.some(run => run.panelFaq))) {
					continue;
				}
				const run = await askPollisService.loadRun(summary.id);
				if (!run) {
					continue;
				}
				const judged = run.summary.judges.length > 0;
				kept.push({
					started: summary.started,
					questions: summary.questions,
					panelFaq: run.questions.length > 0 && run.questions.every(question => question.item.source.startsWith('Panel FAQ')),
					judged,
					models: compareFigures(run).map(figures => ({ label: figures.label, score: judged ? figures.scores[0] : figures.similarity })),
				});
				read.set(id, kept);
			}
		} catch {
			// No runs kept yet
		}
		runs = read;
		runsRead = true;
	};

	// The catalogue, read when the page opens; the page shows it only when it offers a strategy
	let catalogueEntries: readonly { readonly file: string; readonly strategy: IAskPollisStrategy }[] = [];
	const readCatalogue = async () => {
		try {
			const context = await requestService.request({ type: 'GET', url: `${ASK_STRATEGIES_CATALOGUE_URL}/strategies.json`, callSite: 'answeringStrategies.catalogue' }, CancellationToken.None);
			if (!isSuccess(context)) {
				throw new Error(`GitHub answered ${context.res.statusCode}`);
			}
			const index = await asJson<{ readonly strategies?: readonly IAskStrategyCatalogueEntry[] }>(context);
			const builtIn = new Set(ASK_POLLIS_STRATEGIES.map(strategy => strategy.id));
			catalogueEntries = (index?.strategies ?? []).flatMap(entry => {
				if (typeof entry?.file !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]*\.toml$/.test(entry.file)) {
					return [];
				}
				const { strategy } = askStrategyOfFile(entry.data, entry.file, builtIn);
				return strategy ? [{ file: entry.file, strategy }] : [];
			});
		} catch {
			// Not published yet, or no connection: the page shows no catalogue
			catalogueEntries = [];
		}
		sendState();
	};

	const inUse = () => askPollisStrategy(configurationService.getValue<string>('pollis.ask.strategy'), strategiesService.getStrategies()).id;
	function sendState(): void {
		const strategies = strategiesService.getStrategies();
		const reranker = configurationService.getValue<string>('pollis.ask.reranker')?.trim() ?? '';
		const used = inUse();
		webviewInput.webview.postMessage({
			command: 'state',
			strategies: strategies.map(strategy => {
				const offered = catalogueEntries.find(entry => entry.strategy.id === strategy.id);
				const kept = runs.get(strategy.id) ?? [];
				return {
					id: strategy.id,
					label: strategy.label,
					author: strategy.author,
					file: strategy.file,
					fileName: strategy.file ? basename(strategy.file) : undefined,
					builtIn: !strategy.file,
					inUse: strategy.id === used,
					summary: summaryWords(strategy),
					description: strategy.description,
					steps: strategy.steps.map(stepWords),
					needs: needsWords(strategy, reranker),
					update: !!offered && !!strategy.file && !askStrategiesEqual({ ...offered.strategy, file: undefined }, { ...strategy, file: undefined }),
					faq: runsRead ? panelFaqScore(kept) : { none: localize('answeringStrategies.readingRuns', "Reading the runs...") },
					runs: kept.slice(0, RUNS_SHOWN).map(run => ({
						started: new Date(run.started).toLocaleString(),
						questions: run.questions,
						panelFaq: run.panelFaq,
						models: run.models.map(model => ({ label: model.label, score: scoreWords(model.score, run.judged) })),
					})),
				};
			}),
			problems: strategiesService.getProblems(),
			catalogue: catalogueEntries.filter(entry => !strategies.some(strategy => strategy.id === entry.strategy.id)).map(entry => ({
				id: entry.strategy.id,
				label: entry.strategy.label,
				author: entry.strategy.author,
				summary: summaryWords(entry.strategy),
			})),
		});
	}
	const refresh = async () => {
		try {
			await strategiesService.loaded;
			sendState();
			await readRuns();
			sendState();
		} catch (error) {
			notificationService.error(localize('answeringStrategies.failed', "The Ask Pollis Strategies page could not be drawn: {0}", error instanceof Error ? error.message : String(error)));
		}
	};
	disposables.add(strategiesService.onDidChange(() => sendState()));
	disposables.add(webviewInput.webview.onDidFocus(() => refresh()));
	disposables.add(hostService.onDidChangeFocus(focused => {
		if (focused) {
			refresh();
		}
	}));
	disposables.add(configurationService.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration('pollis.ask.strategy') || e.affectsConfiguration('pollis.ask.reranker')) {
			sendState();
		}
	}));

	/** Writes a copy of `from` as a new file of the folder, named as the user says, and opens it in the editor. */
	const copy = async (from: IAskPollisStrategy) => {
		const label = (await quickInputService.input({
			title: localize('answeringStrategies.copyTitle', "Copy {0} as a New Strategy", from.label),
			prompt: localize('answeringStrategies.copyPrompt', "The name of the new strategy. It is written to a file you then change in the editor."),
			value: localize('answeringStrategies.copyName', "{0} Copy", from.label),
			validateInput: async value => value.trim() ? undefined : localize('answeringStrategies.nameNeeded', "Give the strategy a name."),
		}))?.trim();
		if (!label) {
			return;
		}
		const folder = await strategiesService.folder();
		const taken = new Set(strategiesService.getStrategies().map(strategy => strategy.id));
		let id = newId(label, taken);
		for (let number = 2; await fileService.exists(joinPath(folder, `${id}.toml`)); number++) {
			id = newId(`${label} ${number}`, taken);
		}
		const file = joinPath(folder, `${id}.toml`);
		await fileService.writeFile(file, VSBuffer.fromString(askStrategyToml(from, id, label, undefined)));
		await editorService.openEditor({ resource: file });
	};

	/** Installs the strategy `id` of the catalogue, or updates the file installed with the catalogue's, after asking. */
	const install = async (id: string) => {
		const entry = catalogueEntries.find(candidate => candidate.strategy.id === id);
		if (!entry) {
			return;
		}
		const installed = strategiesService.getStrategies().find(strategy => strategy.id === id);
		if (installed && !installed.file) {
			return;
		}
		const target = installed?.file ? URI.file(installed.file) : joinPath(await strategiesService.folder(), entry.file);
		if (installed || await fileService.exists(target)) {
			const { confirmed } = await dialogService.confirm({
				message: localize('answeringStrategies.updateMessage', "Replace {0} with the copy of the catalogue?", basename(target.fsPath)),
				detail: localize('answeringStrategies.updateDetail', "The file in {0} is replaced by the strategy {1} of Trumpingtons/pollis-strategies, and a change you made to it is lost.", target.fsPath, entry.strategy.label),
				primaryButton: localize({ key: 'answeringStrategies.replace', comment: ['&& denotes a mnemonic'] }, "&&Replace"),
			});
			if (!confirmed) {
				return;
			}
		}
		try {
			const context = await requestService.request({ type: 'GET', url: `${ASK_STRATEGIES_CATALOGUE_URL}/${entry.file}`, callSite: 'answeringStrategies.install' }, CancellationToken.None);
			const text = isSuccess(context) ? await asTextOrError(context) : undefined;
			if (!text) {
				throw new Error(localize('answeringStrategies.catalogueStatus', "GitHub answered {0}.", String(context.res.statusCode)));
			}
			await fileService.writeFile(target, VSBuffer.fromString(text));
		} catch (error) {
			notificationService.error(localize('answeringStrategies.installFailed', "{0} could not be installed: {1}", entry.strategy.label, error instanceof Error ? error.message : String(error)));
		}
	};

	/** The text of a pull request that proposes `strategy`: the template of the catalogue, filled in. */
	const proposalBody = (strategy: IAskPollisStrategy, id: string): string => {
		const base = strategiesService.getStrategies().find(candidate => candidate.id === ASK_BASE_STRATEGY);
		const scoreLine = (of: IAskPollisStrategy) => {
			const faq = panelFaqScore(runs.get(of.id) ?? []);
			return `| ${of.label} | ${faq.score ?? faq.none ?? ''} | ${faq.run ?? ''} |`;
		};
		return [
			`**Strategy:** \`strategies/${id}.toml\`, ${strategy.label}${strategy.author ? ` by ${strategy.author}` : ''}`,
			'',
			`**What it does differently:** ${strategy.description}`,
			'',
			summaryWords(strategy),
			'',
			'**Scores:** the best model in the latest run of Evaluate Answering Models on the Panel FAQ test set.',
			'',
			'| Strategy | Score | Run |',
			'|---|---|---|',
			scoreLine(strategy),
			...(base ? [scoreLine(base)] : []),
			'',
			'- [x] The strategy works in Ask Pollis, and passes the check of the Ask Pollis Strategies page.',
			'- [x] I may share this under AGPL-3.0, the license of this repository.',
			'',
			'Proposed from the Ask Pollis Strategies page of Pollis.',
		].join('\n');
	};

	/**
	 * Proposes the strategy of the user's own `strategy` to the catalogue, after asking: signs in to GitHub, makes the
	 * user's fork of the catalogue (or uses it, brought up to date), writes the strategy's file to a new branch of it,
	 * and opens a pull request to the catalogue's main, then shows it in the browser. The owner of the catalogue
	 * proposes from a branch of the catalogue itself.
	 */
	let proposing = false;
	const propose = async (strategy: IAskPollisStrategy) => {
		if (proposing || !strategy.file) {
			return;
		}
		const id = strategy.id;
		const { confirmed } = await dialogService.confirm({
			message: localize('answeringStrategies.proposeMessage', "Propose {0} to the catalogue?", strategy.label),
			detail: localize('answeringStrategies.proposeDetail', "Pollis signs in to GitHub as you, makes your copy of {0}, adds strategies/{1}.toml to it, and opens a proposal on GitHub (a pull request) asking to add the strategy to the catalogue, with its scores on the Panel FAQ. The proposal is public, and the strategy is shared under AGPL-3.0, the license of the catalogue. It is published once the catalogue's maintainer accepts it.", CATALOGUE_REPOSITORY, id),
			primaryButton: localize({ key: 'answeringStrategies.proposeButton', comment: ['&& denotes a mnemonic'] }, "&&Propose"),
		});
		if (!confirmed) {
			return;
		}
		proposing = true;
		try {
			const text = (await fileService.readFile(URI.file(strategy.file))).value;
			const session = (await authenticationService.getSessions('github', GITHUB_SCOPES, undefined, true))[0]
				?? await authenticationService.createSession('github', GITHUB_SCOPES, { activateImmediate: true });
			const github = async (type: string, path: string, body?: object): Promise<IGitHubAnswer> => readAnswer(await requestService.request({
				type,
				url: `https://api.github.com${path}`,
				headers: {
					'Accept': 'application/vnd.github+json',
					'Authorization': `Bearer ${session.accessToken}`,
					'X-GitHub-Api-Version': '2022-11-28',
					...(body ? { 'Content-Type': 'application/json' } : {}),
				},
				data: body ? JSON.stringify(body) : undefined,
				callSite: 'answeringStrategies.propose',
			}, CancellationToken.None));
			const failed = (answer: IGitHubAnswer) => new Error(localize('answeringStrategies.githubAnswered', "GitHub answered {0}: {1}", String(answer.status), answer.json?.message ?? ''));

			const url = await progressService.withProgress({ location: ProgressLocation.Notification, title: localize('answeringStrategies.proposing', "Proposing {0} to the catalogue...", strategy.label) }, async () => {
				const user = await github('GET', '/user');
				const login = user.json?.login;
				if (user.status !== 200 || !login) {
					throw failed(user);
				}
				const main = await github('GET', `/repos/${CATALOGUE_REPOSITORY}/git/ref/heads/main`);
				const sha = main.json?.object?.sha;
				if (main.status !== 200 || !sha) {
					throw failed(main);
				}

				// The repository the branch goes to: the user's fork, or the catalogue for its owner
				let repository = CATALOGUE_REPOSITORY;
				if (login.toLowerCase() !== CATALOGUE_REPOSITORY.split('/')[0].toLowerCase()) {
					const fork = await github('POST', `/repos/${CATALOGUE_REPOSITORY}/forks`, { default_branch_only: true });
					if ((fork.status !== 202 && fork.status !== 200) || !fork.json?.full_name) {
						throw failed(fork);
					}
					repository = fork.json.full_name;
					// A new fork takes a few seconds to be ready
					for (let attempt = 0; (await github('GET', `/repos/${repository}/git/ref/heads/main`)).status !== 200; attempt++) {
						if (attempt >= 15) {
							throw new Error(localize('answeringStrategies.forkNotReady', "Your copy of {0} is not ready yet. Try again in a minute.", CATALOGUE_REPOSITORY));
						}
						await timeout(2000);
					}
					await github('POST', `/repos/${repository}/merge-upstream`, { branch: 'main' });
				}

				const branch = `strategy-${id}-${Date.now().toString(36)}`;
				const created = await github('POST', `/repos/${repository}/git/refs`, { ref: `refs/heads/${branch}`, sha });
				if (created.status !== 201) {
					throw failed(created);
				}
				const path = `strategies/${id}.toml`;
				const existing = await github('GET', `/repos/${CATALOGUE_REPOSITORY}/contents/${path}?ref=main`);
				const existingSha = existing.status === 200 ? existing.json?.sha : undefined;
				const update = !!existingSha;
				const written = await github('PUT', `/repos/${repository}/contents/${path}`, {
					message: update ? `${strategy.label}: a new version` : strategy.label,
					content: encodeBase64(text),
					branch,
					...(existingSha ? { sha: existingSha } : {}),
				});
				if (written.status !== 201 && written.status !== 200) {
					throw failed(written);
				}
				const pull = await github('POST', `/repos/${CATALOGUE_REPOSITORY}/pulls`, {
					title: update ? `Update ${strategy.label}` : `Add ${strategy.label}`,
					head: repository === CATALOGUE_REPOSITORY ? branch : `${repository.split('/')[0]}:${branch}`,
					base: 'main',
					body: proposalBody(strategy, id),
					maintainer_can_modify: repository !== CATALOGUE_REPOSITORY,
				});
				const pullUrl = pull.json?.html_url;
				if (pull.status !== 201 || !pullUrl) {
					throw failed(pull);
				}
				return pullUrl;
			});
			notificationService.info(localize('answeringStrategies.proposed', "{0} is proposed to the catalogue. Its maintainer reviews the proposal.", strategy.label));
			await openerService.open(URI.parse(url));
		} catch (error) {
			notificationService.error(localize('answeringStrategies.proposeFailed', "{0} could not be proposed: {1}", strategy.label, error instanceof Error ? error.message : String(error)));
		} finally {
			proposing = false;
		}
	};

	disposables.add(webviewInput.webview.onMessage(async (e: { message: StrategiesMessage }) => {
		const message = e.message;
		const strategy = hasKey(message, { id: true }) ? strategiesService.getStrategies().find(candidate => candidate.id === message.id) : undefined;
		switch (message.command) {
			case 'ready':
				await refresh();
				await readCatalogue();
				break;
			case 'use':
				if (strategy) {
					await configurationService.updateValue('pollis.ask.strategy', strategy.id, ConfigurationTarget.USER);
				}
				break;
			case 'evaluate':
				if (strategy) {
					await commandService.executeCommand(COMPARE_MODELS_STRATEGY_COMMAND_ID, strategy.id);
				}
				break;
			case 'copy':
				if (strategy) {
					await copy(strategy);
				}
				break;
			case 'openFile':
				if (strategiesService.getStrategies().some(candidate => candidate.file === message.file) || strategiesService.getProblems().some(problem => problem.file === message.file)) {
					await editorService.openEditor({ resource: URI.file(message.file) });
				}
				break;
			case 'openFolder':
				await commandService.executeCommand('revealFileInOS', await strategiesService.folder());
				break;
			case 'install':
				await install(message.id);
				break;
			case 'propose':
				if (strategy) {
					await propose(strategy);
				}
				break;
		}
	}));
}

/** The page: its texts come from here, the strategies, problems and catalogue from the `state` message. */
function pageHtml(): string {
	const text = {
		title: localize('answeringStrategies.title', "Ask Pollis Strategies"),
		intro: localize('answeringStrategies.intro', "Ask Pollis answers a question in three steps: it searches the passages of the wikis and vignettes, may have a reranker choose among them, and asks the model. An answering strategy says how each step is done. Use in a row makes Ask Pollis answer with that strategy; a click on a strategy shows its steps, its latest runs and what can be done with it. Your own strategies are TOML files of {0} ({1}).", '<span class="yellow">~/.pollis/ask/strategies/</span>', `<button class="link" data-command="openFolder">${localize('answeringStrategies.openFolder', "Open Folder")}</button>`),
		use: localize('answeringStrategies.use', "Use"),
		evaluate: localize('answeringStrategies.evaluate', "Evaluate..."),
		copy: localize('answeringStrategies.copy', "Copy as New..."),
		propose: localize('answeringStrategies.propose', "Propose to the Catalogue..."),
		strategy: localize('answeringStrategies.strategy', "Strategy"),
		whatItDoes: localize('answeringStrategies.whatItDoes', "What It Does"),
		faqScore: localize('answeringStrategies.faqScore', "Panel FAQ Score"),
		askPollis: localize('answeringStrategies.askPollis', "Ask Pollis"),
		faqHint: localize('answeringStrategies.faqHint', "Panel FAQ Score is the best model's score in the latest run of Evaluate Answering Models with the strategy on the Panel FAQ, the questions the panels answer in their FAQ: a judge's, from 1 to 5, or, with no judge, the answer score, from -1 to 1, how close the answer is in meaning to the panel's own. Compare strategies on runs with the same models and judge."),
		pollis: localize('answeringStrategies.pollis', "Pollis"),
		yours: localize('answeringStrategies.yours', "Yours: {0}", '{0}'),
		by: localize('answeringStrategies.by', "by {0}", '{0}'),
		inUse: localize('answeringStrategies.inUse', "In Use"),
		steps: localize('answeringStrategies.steps', "Steps"),
		needs: localize('answeringStrategies.needsHeading', "Needs"),
		runs: localize('answeringStrategies.runs', "Latest Runs"),
		noRuns: localize('answeringStrategies.noRuns', "No run of Evaluate Answering Models with this strategy yet."),
		runLine: localize('answeringStrategies.runLine', "{0}, {1} questions", '{0}', '{1}'),
		runLinePanelFaq: localize('answeringStrategies.runLinePanelFaq', "{0}, {1} questions of the Panel FAQ", '{0}', '{1}'),
		update: localize('answeringStrategies.update', "Update from the Catalogue"),
		problems: localize('answeringStrategies.problems', "Files That Are Not Strategies"),
		problemsHint: localize('answeringStrategies.problemsHint', "Ask Pollis leaves these files out until they are corrected. Each is checked again when it is saved."),
		openFile: localize('answeringStrategies.openFile', "Open File"),
		catalogue: localize('answeringStrategies.catalogue', "From GitHub"),
		catalogueHint: localize('answeringStrategies.catalogueHint', "The strategies of {0} not installed here. Install writes the strategy to the folder of your strategies.", '<span class="yellow">Trumpingtons/pollis-strategies</span>'),
		install: localize('answeringStrategies.install', "Install"),
	};
	return buildWebviewHtml({
		title: text.title,
		omitPoweredBy: !ANSWERINGSTRATEGIES_METADATA.answeringStrategies.packages.length,
		introHtml: text.intro,
		extraCss: `${compareCss}
		.container { max-width: 1100px; }
		.answeringStrategiesPage h2 { font-size: 16px; font-weight: 600; margin: 28px 0 4px 0; }
		.answeringStrategiesPage table { margin-top: 8px; }
		.answeringStrategiesPage td.strategyName { width: 22%; }
		.answeringStrategiesPage td.score { width: 24%; }
		.answeringStrategiesPage td.used, .answeringStrategiesPage th.used { width: 10%; white-space: nowrap; }
		.answeringStrategiesPage .name { font-weight: 600; }
		.answeringStrategiesPage th .tooltip-icon { margin-left: 4px; vertical-align: 1px; font-weight: bold; }
		.answeringStrategiesPage #details { margin-top: 4px; }
		.answeringStrategiesPage #details h2 { margin-top: 20px; }
		.answeringStrategiesPage #details .description { margin: 0 0 8px 0; line-height: 1.4; }
		.answeringStrategiesPage .part { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); margin: 10px 0 2px 0; }
		.answeringStrategiesPage ol, .answeringStrategiesPage ul { margin: 2px 0 0 0; padding-left: 20px; line-height: 1.5; }
		.answeringStrategiesPage table.scores { width: auto; margin: 2px 0 6px 0; }
		.answeringStrategiesPage table.scores td { padding: 1px 16px 1px 0; font-size: 12px; border: none; }
		.answeringStrategiesPage #details .bar { margin-top: 14px; flex-wrap: wrap; }
		.answeringStrategiesPage .problem { margin: 8px 0 12px 0; }
`,
		bodyHtml: `
		<div class="answeringStrategiesPage">
	<table id="strategies">
		<thead><tr><th>${text.strategy}</th><th>${text.whatItDoes}</th><th>${text.faqScore}<span class="tooltip-icon" data-tip="${escape(text.faqHint).replace(/"/g, '&quot;')}">?</span></th><th class="used">${text.askPollis}</th></tr></thead>
		<tbody></tbody>
	</table>
	<p class="small" id="pageError" hidden></p>
	<div id="details" hidden></div>
	<div id="problemsPart" hidden>
		<h2>${text.problems}</h2>
		<p class="hint">${text.problemsHint}</p>
		<div id="problems"></div>
	</div>
	<div id="cataloguePart" hidden>
		<h2>${text.catalogue}</h2>
		<p class="hint">${text.catalogueHint}</p>
		<table id="catalogue">
			<thead><tr><th>${text.strategy}</th><th>${text.whatItDoes}</th><th></th></tr></thead>
			<tbody></tbody>
		</table>
	</div>
		</div>
`,
		pageScriptJs: `
	const TEXT = ${JSON.stringify(text)};
	${escJs}
	${pageHelpersScript}

	let state;
	/** The id of the strategy whose details are open, if any. */
	let opened;

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content !== undefined) { node.textContent = content; }
		return node;
	}
	function list(tag, items, html) {
		const node = element(tag);
		for (const item of items) {
			const li = element('li');
			if (html) { li.innerHTML = item; } else { li.textContent = item; }
			node.appendChild(li);
		}
		return node;
	}
	function link(label, command, fields) {
		const node = element('button', 'link', label);
		node.addEventListener('click', event => {
			event.stopPropagation();
			vscode.postMessage({ command, ...fields });
		});
		return node;
	}
	/** The first cell of a strategy: its name, whose it is and who wrote it. */
	function nameCell(strategy) {
		const cell = element('td', 'strategyName');
		cell.appendChild(element('div', 'name', strategy.label));
		const origin = element('div', 'small');
		origin.innerHTML = strategy.builtIn ? esc(TEXT.pollis) : strategy.fileName ? format(esc(TEXT.yours), '<span class="yellow">' + esc(strategy.fileName) + '</span>') : '';
		if (strategy.author) { origin.append(' ' + format(TEXT.by, strategy.author)); }
		cell.appendChild(origin);
		return cell;
	}

	/** A button of the details of a strategy, which posts \`command\` for it. */
	function action(label, command, fields, current) {
		const node = element('button', current ? 'action current' : 'action', label);
		node.addEventListener('click', () => vscode.postMessage({ command, ...fields }));
		return node;
	}

	/** The details of a strategy, below the table: its description, steps, needs, latest runs, and the buttons that act on it. */
	function details(strategy) {
		const cell = document.getElementById('details');
		cell.replaceChildren();
		cell.appendChild(element('h2', '', strategy.label));
		cell.appendChild(element('p', 'description', strategy.description));
		cell.appendChild(element('div', 'part', TEXT.steps));
		cell.appendChild(list('ol', strategy.steps));
		if (strategy.needs.length) {
			cell.appendChild(element('div', 'part', TEXT.needs));
			cell.appendChild(list('ul', strategy.needs, true));
		}
		cell.appendChild(element('div', 'part', TEXT.runs));
		if (!strategy.runs.length) {
			cell.appendChild(element('div', 'small', TEXT.noRuns));
		}
		for (const run of strategy.runs) {
			cell.appendChild(element('div', 'small', format(run.panelFaq ? TEXT.runLinePanelFaq : TEXT.runLine, run.started, String(run.questions))));
			const table = element('table', 'scores');
			for (const model of run.models) {
				const line = element('tr');
				line.appendChild(element('td', '', model.label));
				line.appendChild(element('td', '', model.score));
				table.appendChild(line);
			}
			cell.appendChild(table);
		}
		const bar = element('div', 'bar');
		bar.appendChild(action(TEXT.evaluate, 'evaluate', { id: strategy.id }, true));
		bar.appendChild(action(TEXT.copy, 'copy', { id: strategy.id }));
		if (strategy.file) {
			bar.appendChild(action(TEXT.openFile, 'openFile', { file: strategy.file }));
			bar.appendChild(action(TEXT.propose, 'propose', { id: strategy.id }));
		}
		if (strategy.update) {
			bar.appendChild(action(TEXT.update, 'install', { id: strategy.id }));
		}
		cell.appendChild(bar);
	}

	function render() {
		const strategies = state.strategies;
		if (!strategies.some(strategy => strategy.id === opened)) {
			opened = undefined;
		}
		const rows = [];
		for (const strategy of strategies) {
			const row = element('tr', strategy.id === opened ? 'item open' : 'item');
			row.appendChild(nameCell(strategy));
			row.appendChild(element('td', '', strategy.summary));
			const score = element('td', 'score');
			if (strategy.faq.score) {
				score.appendChild(element('div', '', strategy.faq.score));
				score.appendChild(element('div', 'small', strategy.faq.run));
			} else {
				score.appendChild(element('div', 'small', strategy.faq.none));
			}
			row.appendChild(score);
			const used = element('td', 'used');
			if (strategy.inUse) {
				used.textContent = TEXT.inUse;
			} else {
				used.appendChild(link(TEXT.use, 'use', { id: strategy.id }));
			}
			row.appendChild(used);
			row.addEventListener('click', () => {
				opened = strategy.id === opened ? undefined : strategy.id;
				render();
			});
			rows.push(row);
		}
		document.querySelector('#strategies tbody').replaceChildren(...rows);
		const shown = strategies.find(strategy => strategy.id === opened);
		document.getElementById('details').hidden = !shown;
		if (shown) { details(shown); }

		document.getElementById('problemsPart').hidden = !state.problems.length;
		document.getElementById('problems').replaceChildren(...state.problems.map(problem => {
			const node = element('div', 'problem');
			node.appendChild(element('div', 'yellow', problem.file));
			const problems = list('ul', problem.problems);
			problems.className = 'small';
			node.appendChild(problems);
			node.appendChild(link(TEXT.openFile, 'openFile', { file: problem.file }));
			return node;
		}));

		document.getElementById('cataloguePart').hidden = !state.catalogue.length;
		document.querySelector('#catalogue tbody').replaceChildren(...state.catalogue.map(entry => {
			const row = element('tr');
			row.appendChild(nameCell(entry));
			row.appendChild(element('td', '', entry.summary));
			const cell = element('td', 'used');
			cell.appendChild(link(TEXT.install, 'install', { id: entry.id }));
			row.appendChild(cell);
			return row;
		}));
	}

	document.addEventListener('click', event => {
		if (event.target.closest('[data-command="openFolder"]')) {
			vscode.postMessage({ command: 'openFolder' });
		}
	});
	window.addEventListener('message', event => {
		if (event.data.command === 'state') {
			state = event.data;
			const error = document.getElementById('pageError');
			try {
				render();
				error.hidden = true;
			} catch (failure) {
				error.textContent = String(failure && failure.stack || failure);
				error.hidden = false;
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
			id: ANSWERING_STRATEGIES_COMMAND_ID,
			title: localize2('answeringStrategies.action', "Ask Pollis Strategies"),
			category: localize2('answeringStrategies.category', "Compose"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openAnsweringStrategiesPage(accessor);
	}
});
