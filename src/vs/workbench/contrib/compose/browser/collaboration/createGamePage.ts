/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../../base/common/buffer.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { basename, isEqual, joinPath } from '../../../../../base/common/resources.js';
import { hasKey } from '../../../../../base/common/types.js';
import { URI } from '../../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../../nls.js';
import { Action2, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IFileDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IInstantiationService, ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
import { parseToml } from '../../../model/browser/common/tomlPanelData.js';
import { registerScaffoldPageHandlers } from '../../../model/browser/handlers/scaffoldPage.handler.js';
import { CREATEGAME_METADATA } from '../../../model/browser/webviews/creategame.data.js';
import { buildWebviewHtml, ONE_BLUE_BUTTON_JS } from '../../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { findPollisWorkspace, pollisWorkspaceFolder } from '../../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { WebviewInput } from '../../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { IToolboxPanelsService } from '../../common/toolboxPanels.js';
import { compareCss } from '../compareShared.js';
import { skillFile, startAgent, WRITE_GAME_WITH_AGENT_COMMAND_ID } from '../pollisAgents.js';
import { writeDebrief } from './collaborationDebrief.js';
import { GameRun, gameRunnerFile, IGameCase, loadCase, minimalCaseFolder, roundFolder, roundName, toolboxCases } from './collaborationGame.js';
import { caseFacts, HOST_GAME_COMMAND_ID } from './hostGamePage.js';

// Compose > Simulation Games > Create a Simulation Game...: a page of the scaffold in the Time Arrow style, in four
// steps. 1, Start From: the minimal case of Pollis, or a case of the installed toolboxes as a pattern, copied into
// games/cases of the Pollis Workspace under a new title, or a case of one's own to go on with; 2, Write: the case's
// files, the drill-down, and Write with Agent, which hands the case to the write-simulation-game skill; 3, Test: the
// case read as Host a Game reads it, every round played with Julia on each team's default decisions, and the debrief
// of the test game; 4, Share: Host a Game with the case chosen, its folder, and Package with Agent, which makes a
// toolbox of cases with the same skill.

/** The command of Create a Simulation Game..., which opens the page. */
const CREATE_GAME_COMMAND_ID = 'pollis.collaboration.createGame';

/** The skill the agent of the page follows, a folder of the Pollis Agents plugin. */
const SKILL = 'write-simulation-game';

/** The command of Help > Documentation > Drill-downs > Simulation Games (helpActions.ts). */
const DRILL_DOWN_COMMAND_ID = 'pollis.action.openDrillDownSimulationGames';

/** The view of the Extensions view's Toolboxes section (PollisToolboxesView.ID), where the toolboxes of cases are installed. */
const TOOLBOXES_VIEW_ID = 'workbench.views.extensions.pollisToolboxes';

/** What the five cases of the Pollis toolboxes show how to do, by their folders' names. */
function patternOf(folder: string): string | undefined {
	switch (folder) {
		case 'minimal': return localize('createGame.pattern.minimal', "The smallest case: one decision, a price, for three rounds");
		case 'chocolate-chain': return localize('createGame.pattern.chocolate', "Pattern: rivals in one market, with roles that each set some decisions");
		case 'merge-or-be-bought': return localize('createGame.pattern.merge', "Pattern: bids among equals, each team bidding for the others");
		case 'a-vineyard-for-the-portfolio': return localize('createGame.pattern.vineyard', "Pattern: a buyer and sellers, each side with its own decisions and secrets");
		case 'save-the-company': return localize('createGame.pattern.save', "Pattern: a negotiation over a plan, between sides that differ");
		case 'trading-floor': return localize('createGame.pattern.trading', "Pattern: a market by the clock, with an order book in place of decisions");
		default: return undefined;
	}
}

type CreateGameMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'create'; readonly source: string; readonly title: string }
	| { readonly command: 'choose'; readonly id: string }
	| { readonly command: 'openFolder' }
	| { readonly command: 'getMoreCases' }
	| { readonly command: 'openFile'; readonly file: 'case' | 'model' | 'briefing' | 'debrief' }
	| { readonly command: 'revealFolder' }
	| { readonly command: 'readDrillDown' }
	| { readonly command: 'writeWithAgent'; readonly description: string }
	| { readonly command: 'test' }
	| { readonly command: 'fixWithAgent' }
	| { readonly command: 'openDebrief' }
	| { readonly command: 'host' }
	| { readonly command: 'packageWithAgent' };

/** A round of the test: its name, and what the model's results lack or have beyond the columns of case.toml. */
interface ITestedRound {
	readonly name: string;
	readonly notes: readonly string[];
}

/** The test of the case: running, the rounds played, the round that failed and why, the test game's folder and its debrief. */
interface ITest {
	readonly running: boolean;
	readonly teams?: number;
	readonly rounds: readonly ITestedRound[];
	readonly failure?: { readonly round: string; readonly message: string };
	readonly game?: URI;
	readonly debrief?: URI;
}

/** The page, when it is open. */
let openPage: WebviewInput | undefined;

/** Where the cases written on the page go: cases in the games folder of the Pollis Workspace, else in ~/.pollis/games. */
async function casesFolder(contextService: IWorkspaceContextService, fileService: IFileService, pathService: IPathService): Promise<URI> {
	const workspace = await findPollisWorkspace(contextService, fileService);
	const games = workspace
		? await pollisWorkspaceFolder(fileService, workspace, 'games')
		: joinPath(await pathService.userHome({ preferLocal: true }), '.pollis', 'games');
	return joinPath(games, 'cases');
}

/** A folder's name for a case's title, such as run-a-bakery; never cases, the folder of the cases themselves. */
function caseFolderName(title: string): string {
	const name = title.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'case';
	return name === 'cases' ? 'cases-game' : name;
}

/**
 * Starts the coding agent on the case in `folder`, with the write-simulation-game skill: to write or change it (with
 * what the user said it is to be, if anything), to fix the round of the test that failed, or to package it as a
 * toolbox of cases. Returns whether the agent started.
 */
async function startCaseAgent(instantiationService: IInstantiationService, folder: URI, title: string, job: { readonly kind: 'write'; readonly description?: string } | { readonly kind: 'fix'; readonly round: string; readonly error: string; readonly game?: URI } | { readonly kind: 'package' }): Promise<boolean> {
	const skill = await instantiationService.invokeFunction(skillFile, SKILL);
	if (!skill) {
		return false;
	}
	const runner = gameRunnerFile().fsPath;
	let prompt: string;
	let terminal: string;
	if (job.kind === 'write') {
		prompt = job.description
			? localize('createGame.agent.writePrompt', "Read the skill {0} and follow its instructions to write the simulation game case in {1} with me. Pollis plays its rounds with {2}, whose header says what the model is given and returns. What the case is to be: {3}", skill.fsPath, folder.fsPath, runner, job.description)
			: localize('createGame.agent.changePrompt', "Read the skill {0} and follow its instructions to change the simulation game case in {1} with me; ask me first what to change. Pollis plays its rounds with {2}, whose header says what the model is given and returns.", skill.fsPath, folder.fsPath, runner);
		terminal = localize('createGame.agent.writeTerminal', "Write {0}", title);
	} else if (job.kind === 'fix') {
		prompt = job.game
			? localize('createGame.agent.fixPrompt', "Read the skill {0} and follow its instructions to fix the simulation game case in {1} with me. Pollis plays its rounds with {2}. Testing the case, {3} failed: {4} The test game is in {5}.", skill.fsPath, folder.fsPath, runner, job.round, job.error, job.game.fsPath)
			: localize('createGame.agent.fixTomlPrompt', "Read the skill {0} and follow its instructions to fix the simulation game case in {1} with me. Pollis plays its rounds with {2}. Testing the case, Pollis could not read it: {3}", skill.fsPath, folder.fsPath, runner, job.error);
		terminal = localize('createGame.agent.fixTerminal', "Fix {0}", title);
	} else {
		prompt = localize('createGame.agent.packagePrompt', "Read the skill {0} and follow its instructions to package the simulation game case in {1} as a toolbox of cases with me.", skill.fsPath, folder.fsPath);
		terminal = localize('createGame.agent.packageTerminal', "Package {0}", title);
	}
	return !!await instantiationService.invokeFunction(startAgent, terminal, prompt, folder, 'writeGame');
}

/** What the model's rows of a round lack, of the columns of case.toml, and have beyond them, from the round's results.json. */
async function checkRound(fileService: IFileService, gameCase: IGameCase, run: GameRun, round: number): Promise<string[]> {
	const content = await fileService.readFile(joinPath(run.folderUri!, roundFolder(round), 'results.json')).then(read => read.value.toString(), () => undefined);
	const results = content ? JSON.parse(content) as { public?: unknown; private?: unknown } : {};
	const notes: string[] = [];
	const rowsOf = (value: unknown) => (Array.isArray(value) ? value : []).filter((row): row is Record<string, unknown> => !!row && typeof row === 'object');
	const check = (rows: readonly Record<string, unknown>[], keys: readonly string[], lacking: (keys: string) => string, beyond: (keys: string) => string) => {
		const missing = keys.filter(key => rows.some(row => row[key] === undefined));
		const extra = [...new Set(rows.flatMap(row => Object.keys(row)))].filter(key => !keys.includes(key));
		if (missing.length) {
			notes.push(lacking(missing.join(', ')));
		}
		if (extra.length) {
			notes.push(beyond(extra.join(', ')));
		}
	};
	const publicRows = rowsOf(results.public);
	if (round > 0 && gameCase.publicColumns.length && !publicRows.length) {
		notes.push(localize('createGame.noPublicRows', "The model gave no rows of the public results."));
	}
	check(publicRows, gameCase.publicColumns.map(column => column.key),
		keys => localize('createGame.publicLacks', "Rows of the public results lack {0}, which case.toml lists.", keys),
		keys => localize('createGame.publicBeyond', "Rows of the public results have {0}, which case.toml does not list, so no player sees it.", keys));
	const privateRows = results.private && typeof results.private === 'object' ? results.private as Record<string, unknown> : {};
	for (const team of run.teams) {
		const columns = gameCase.privateColumns.filter(column => !column.sides || column.sides.includes(run.sideOf(team.team) ?? ''));
		const rows = rowsOf(privateRows[String(team.team)]);
		if (round > 0 && columns.length && !rows.length) {
			notes.push(localize('createGame.noPrivateRows', "The model gave {0} no rows of its own results.", team.name));
			continue;
		}
		check(rows, columns.map(column => column.key),
			keys => localize('createGame.privateLacks', "The results of {0} lack {1}, which case.toml lists.", team.name, keys),
			keys => localize('createGame.privateBeyond', "The results of {0} have {1}, which case.toml does not list for it, so it does not see it.", team.name, keys));
	}
	return notes;
}

async function openCreateGamePage(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const toolboxPanelsService = accessor.get(IToolboxPanelsService);
	const fileService = accessor.get(IFileService);
	const fileDialogService = accessor.get(IFileDialogService);
	const viewsService = accessor.get(IViewsService);
	const commandService = accessor.get(ICommandService);
	const openerService = accessor.get(IOpenerService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const pathService = accessor.get(IPathService);
	const storageService = accessor.get(IStorageService);
	const contextService = accessor.get(IWorkspaceContextService);
	const instantiationService = accessor.get(IInstantiationService);

	if (openPage && !openPage.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage, openPage.group ?? -1, false);
		return;
	}
	const title = localize('createGame.title', "Create a Simulation Game");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.creategame',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	openPage = webviewInput;
	webviewInput.webview.setHtml(pageHtml());
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'creategame', title, CREATEGAME_METADATA.creategame, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));

	/** The cases to start from: the minimal case, then those of the installed toolboxes, by an id of the page. */
	let sources: { readonly id: string; readonly gameCase: IGameCase; readonly from: string }[] = [];
	let failures: string[] = [];
	/** The user's cases: those of the cases folder, and the case folders opened on the page, with why one cannot be read. */
	let yours: { readonly id: string; readonly folder: URI; readonly gameCase?: IGameCase; readonly error?: string }[] = [];
	const opened: URI[] = [];
	/** The case being written, and its test. */
	let current: URI | undefined;
	let test: ITest | undefined;

	const describe = (gameCase: IGameCase) => ({ title: gameCase.title, description: gameCase.description, facts: caseFacts(gameCase), pattern: patternOf(basename(gameCase.folder)) });

	const readSources = async () => {
		const read: typeof sources = [];
		const failed: string[] = [];
		try {
			read.push({ id: 'minimal', gameCase: await loadCase(fileService, minimalCaseFolder()), from: localize('createGame.fromPollis', "Pollis") });
		} catch (error) {
			failed.push(String(error?.message ?? error));
		}
		for (const [index, { folder, toolbox }] of toolboxCases(toolboxPanelsService).entries()) {
			try {
				read.push({ id: `toolbox-${index}`, gameCase: await loadCase(fileService, folder), from: toolbox });
			} catch (error) {
				failed.push(localize('createGame.toolboxCaseFailed', "A case of the {0} could not be read: {1}", toolbox, String(error?.message ?? error)));
			}
		}
		sources = read;
		failures = failed;
	};

	const readYours = async () => {
		const cases = await casesFolder(contextService, fileService, pathService);
		const folders: URI[] = [];
		const stat = await fileService.resolve(cases).catch(() => undefined);
		for (const child of stat?.children ?? []) {
			if (child.isDirectory && await fileService.exists(joinPath(child.resource, 'case.toml'))) {
				folders.push(child.resource);
			}
		}
		folders.push(...opened.filter(folder => !folders.some(other => isEqual(other, folder))));
		const read: typeof yours = [];
		for (const [index, folder] of folders.entries()) {
			try {
				read.push({ id: `yours-${index}`, folder, gameCase: await loadCase(fileService, folder) });
			} catch (error) {
				read.push({ id: `yours-${index}`, folder, error: String(error?.message ?? error) });
			}
		}
		yours = read;
		return cases;
	};

	/** The briefing and the debrief questions that case.toml names, the first of each, when it names them. */
	const caseFiles = async (folder: URI): Promise<{ readonly briefing?: URI; readonly debrief?: URI }> => {
		const toml = await fileService.readFile(joinPath(folder, 'case.toml')).then(read => parseToml(read.value.toString()), () => undefined);
		const first = (value: unknown) => typeof value === 'string' ? value : Array.isArray(value) && typeof value[0] === 'string' ? value[0] : undefined;
		const briefing = first(toml?.briefing);
		const debrief = first(toml?.debrief);
		return { ...(briefing ? { briefing: joinPath(folder, briefing) } : {}), ...(debrief ? { debrief: joinPath(folder, debrief) } : {}) };
	};
	const currentCase = () => current ? yours.find(item => isEqual(item.folder, current)) : undefined;
	const currentTitle = () => currentCase()?.gameCase?.title ?? (current ? basename(current) : '');

	const postState = async () => {
		const cases = await readYours();
		const chosen = currentCase();
		const files = current ? await caseFiles(current) : {};
		post({
			command: 'state',
			casesPath: cases.fsPath,
			sources: sources.map(item => ({ id: item.id, from: item.from, ...describe(item.gameCase) })),
			failures,
			yours: yours.map(item => ({ id: item.id, path: item.folder.fsPath, error: item.error, ...(item.gameCase ? describe(item.gameCase) : { title: basename(item.folder), facts: [], description: '' }) })),
			current: current ? { id: chosen?.id, title: currentTitle(), path: current.fsPath, error: chosen?.error, briefing: !!files.briefing, debrief: !!files.debrief } : undefined,
			test: test ? {
				running: test.running,
				teams: test.teams,
				rounds: test.rounds,
				failure: test.failure,
				game: test.game?.fsPath,
				debrief: !!test.debrief,
			} : undefined,
		});
	};

	const choose = async (folder: URI) => {
		current = folder;
		test = undefined;
		await postState();
	};

	const create = async (sourceId: string, caseTitle: string) => {
		const source = sources.find(item => item.id === sourceId);
		const trimmed = caseTitle.trim();
		if (!source || !trimmed) {
			return;
		}
		const target = joinPath(await casesFolder(contextService, fileService, pathService), caseFolderName(trimmed));
		if (await fileService.exists(target)) {
			post({ command: 'createFailed', error: localize('createGame.exists', "{0} exists already: choose it under Your Cases, or give the case another title.", target.fsPath) });
			return;
		}
		try {
			await fileService.copy(source.gameCase.folder, target, false);
			const file = joinPath(target, 'case.toml');
			const toml = (await fileService.readFile(file)).value.toString();
			await fileService.writeFile(file, VSBuffer.fromString(toml.replace(/^title\s*=\s*"(?:[^"\\\n]|\\.)*"[ \t]*$/m, `title = ${JSON.stringify(trimmed)}`)));
		} catch (error) {
			post({ command: 'createFailed', error: String(error?.message ?? error) });
			return;
		}
		await choose(target);
		post({ command: 'created' });
	};

	const runTest = async (folder: URI) => {
		test = { running: true, rounds: [] };
		await postState();
		let gameCase: IGameCase;
		try {
			gameCase = await loadCase(fileService, folder);
		} catch (error) {
			test = { running: false, rounds: [], failure: { round: 'case.toml', message: String(error?.message ?? error) } };
			await postState();
			return;
		}
		// The fewest teams the case allows, at least two, as a game with one team ends after its first round
		const teams = Math.min(Math.max(gameCase.minTeams, 2), gameCase.maxTeams);
		const run = instantiationService.createInstance(GameRun, gameCase, gameCase.structures[0]);
		const rounds: ITestedRound[] = [];
		let name = localize('createGame.before', "Before {0}", roundName(gameCase, 1));
		let failure: ITest['failure'];
		try {
			await run.start(teams);
			rounds.push({ name, notes: await checkRound(fileService, gameCase, run, 0) });
			test = { running: true, teams, rounds: [...rounds], game: run.folderUri };
			await postState();
			while (!run.isOver) {
				const round = run.round;
				name = run.roundName(round);
				await run.play(new Map());
				rounds.push({ name, notes: await checkRound(fileService, gameCase, run, round) });
				test = { running: true, teams, rounds: [...rounds], game: run.folderUri };
				await postState();
			}
		} catch (error) {
			failure = { round: name, message: String(error?.message ?? error) };
		}
		let debrief: URI | undefined;
		if (!failure && run.folderUri) {
			try {
				debrief = (await writeDebrief(fileService, run.folderUri, [])).page;
				await commandService.executeCommand('markdown.showPreview', debrief);
			} catch (error) {
				failure = { round: localize('createGame.debriefRound', "The debrief"), message: String(error?.message ?? error) };
			}
		}
		test = { running: false, teams, rounds, failure, game: run.folderUri, debrief };
		await postState();
	};

	disposables.add(toolboxPanelsService.onDidChange(async () => {
		await readSources();
		await postState();
	}));
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: CreateGameMessage }) => {
		const message = e.message;
		try {
			if (message.command === 'ready') {
				await readSources();
				await postState();
			} else if (message.command === 'create' && hasKey(message, { source: true, title: true })) {
				await create(message.source, message.title);
			} else if (message.command === 'choose' && hasKey(message, { id: true })) {
				const chosen = yours.find(item => item.id === message.id);
				if (chosen) {
					await choose(chosen.folder);
				}
			} else if (message.command === 'openFolder') {
				const folder = (await fileDialogService.showOpenDialog({ title: localize('createGame.openFolderTitle', "Open a Case Folder"), canSelectFolders: true, canSelectFiles: false, canSelectMany: false }))?.[0];
				if (!folder) {
					return;
				}
				if (!await fileService.exists(joinPath(folder, 'case.toml'))) {
					post({ command: 'openFailed', error: localize('createGame.noCaseToml', "{0} is not a case: it has no case.toml.", basename(folder)) });
					return;
				}
				if (!opened.some(other => isEqual(other, folder))) {
					opened.push(folder);
				}
				await choose(folder);
			} else if (message.command === 'getMoreCases') {
				await viewsService.openView(TOOLBOXES_VIEW_ID, true);
			} else if (message.command === 'readDrillDown') {
				await commandService.executeCommand(DRILL_DOWN_COMMAND_ID);
			} else if (!current) {
				return;
			} else if (message.command === 'openFile' && hasKey(message, { file: true })) {
				const files = await caseFiles(current);
				const resource = message.file === 'case' ? joinPath(current, 'case.toml') : message.file === 'model' ? joinPath(current, 'model.jl') : files[message.file];
				if (resource) {
					await editorService.openEditor({ resource });
				}
			} else if (message.command === 'revealFolder') {
				await commandService.executeCommand('revealFileInOS', current);
			} else if (message.command === 'writeWithAgent' && hasKey(message, { description: true })) {
				const description = message.description.trim();
				post({ command: 'agentStarted', box: 'write', started: await startCaseAgent(instantiationService, current, currentTitle(), { kind: 'write', ...(description ? { description } : {}) }) });
			} else if (message.command === 'test') {
				if (!test?.running) {
					await runTest(current);
				}
			} else if (message.command === 'fixWithAgent') {
				if (test?.failure) {
					post({ command: 'agentStarted', box: 'fix', started: await startCaseAgent(instantiationService, current, currentTitle(), { kind: 'fix', round: test.failure.round, error: test.failure.message, ...(test.game ? { game: test.game } : {}) }) });
				}
			} else if (message.command === 'openDebrief') {
				if (test?.debrief) {
					await commandService.executeCommand('markdown.showPreview', test.debrief);
				}
			} else if (message.command === 'host') {
				await commandService.executeCommand(HOST_GAME_COMMAND_ID, current);
			} else if (message.command === 'packageWithAgent') {
				post({ command: 'agentStarted', box: 'share', started: await startCaseAgent(instantiationService, current, currentTitle(), { kind: 'package' }) });
			}
		} catch (error) {
			notificationService.error(String(error?.message ?? error));
		}
	}));
}

function pageHtml(): string {
	const hostLabel = localize('createGame.hostLabel', "Host This Case");
	const packageLabel = localize('createGame.packageLabel', "Package with Agent");
	const text = {
		title: localize('createGame.title', "Create a Simulation Game"),
		intro: localize('createGame.intro', "A case of Simulation Games is a folder with {0}, which says its rounds, teams, decisions, results, briefings and news, and {1}, the Julia model that plays each round. Start from a minimal case or from one of the cases installed, write it, alone or with a coding agent, test it with Julia, and host it with a class.", '<span class="yellow">case.toml</span>', '<span class="yellow">model.jl</span>'),
		startStep: localize('createGame.startStep', "Start From"),
		startIntro: localize('createGame.startIntro', "Start from the minimal case of Pollis, or from a case of the toolboxes installed, as a pattern: a copy goes into the folder below, under the title you give it, for you to change in step 2."),
		casesFolder: localize('createGame.casesFolder', "Your cases are kept in"),
		caseTitle: localize('createGame.caseTitle', "Title"),
		caseTitlePlaceholder: localize('createGame.caseTitlePlaceholder', "The title of your case, such as Run a Bakery"),
		create: localize('createGame.create', "Create the Case"),
		getMoreCases: localize('createGame.getMoreCases', "Get More Cases"),
		chooseSource: localize('createGame.chooseSource', "Choose a case to start from, and give yours a title."),
		created: localize('createGame.created', "Created: write it in step 2."),
		yourCases: localize('createGame.yourCases', "Your Cases"),
		yourCasesIntro: localize('createGame.yourCasesIntro', "The cases you created, and any case folder you open: choose one to go on with it."),
		noYourCases: localize('createGame.noYourCases', "None yet."),
		openFolder: localize('createGame.openFolder', "Open a Case Folder..."),
		cannotRead: localize('createGame.cannotRead', "Cannot be read yet:"),
		writeStep: localize('createGame.writeStep', "Write"),
		noCase: localize('createGame.noCase', "Create or choose a case in step 1."),
		caseIn: localize('createGame.caseIn', "The case is in"),
		writeIntro: localize('createGame.writeIntro', "Change {0} for the rounds, teams, decisions, results, news and parameters, {1} for what happens in a round, and the briefings for what the players read. The drill-down says what each part of a case does, with the five cases as examples.", '<span class="yellow">case.toml</span>', '<span class="yellow">model.jl</span>'),
		openCase: localize('createGame.openCase', "Open case.toml"),
		openModel: localize('createGame.openModel', "Open model.jl"),
		openBriefing: localize('createGame.openBriefing', "Open the Briefing"),
		openQuestions: localize('createGame.openQuestions', "Open the Debrief Questions"),
		revealFolder: localize('createGame.revealFolder', "Show the Folder"),
		readDrillDown: localize('createGame.readDrillDown', "Read How to Write a Case"),
		withAgent: localize('createGame.withAgent', "Write with Agent"),
		withAgentIntro: localize('createGame.withAgentIntro', "Say what the case is to be, or what to change in it: the coding agent writes {0}, {1} and the briefings with you, following the skill Write a Simulation Game, and plays the rounds with Julia as step 3 does. With nothing written here, it asks you first.", '<span class="yellow">case.toml</span>', '<span class="yellow">model.jl</span>'),
		descriptionPlaceholder: localize('createGame.descriptionPlaceholder', "Such as: teams each run a bakery in one town for four years, setting the price of bread, the bakers and the opening hours; the weather moves demand"),
		agentStarted: localize('createGame.agentStarted', "The agent started in a terminal."),
		testStep: localize('createGame.testStep', "Test"),
		testIntro: localize('createGame.testIntro', "Test the Case reads {0} as Host a Game reads it, then plays every round with Julia, each team keeping its default decisions, and opens the debrief of the test game. It says which round failed and why, and what the rows of the results lack or have beyond the columns of {0}.", '<span class="yellow">case.toml</span>'),
		test: localize('createGame.test', "Test the Case"),
		testing: localize('createGame.testing', "Testing..."),
		teamsPlayed: localize('createGame.teamsPlayed', "Played with {0} teams. The test game is in"),
		passed: localize('createGame.passed', "Passed"),
		passedText: localize('createGame.passedText', "Every round was played. The debrief opened beside the page."),
		failed: localize('createGame.failed', "Failed: {0}"),
		roundPassed: localize('createGame.roundPassed', "played"),
		fixWithAgent: localize('createGame.fixWithAgent', "Fix with Agent"),
		openDebrief: localize('createGame.openDebrief', "Open the Debrief"),
		shareStep: localize('createGame.shareStep', "Share"),
		shareHost: localize('createGame.shareHost', "{0} opens Host a Game with the case chosen, to play it with a class.", `<b>${hostLabel}</b>`),
		shareFolder: localize('createGame.shareFolder', "To give the case to colleagues, send them its folder: they choose it with Choose a Case Folder... in Host a Game."),
		sharePackage: localize('createGame.sharePackage', "{0} makes the case a toolbox of cases with the coding agent, as the five cases of Pollis are: a {1} file that others install with Extensions: Install from VSIX..., after which the case is listed in Host a Game.", `<b>${packageLabel}</b>`, '<span class="yellow">.vsix</span>'),
		notTested: localize('createGame.notTested', "Test the case first, in step 3: a case that fails stops a game in class."),
		host: hostLabel,
		packageWithAgent: packageLabel,
	};
	return buildWebviewHtml({
		title: text.title,
		introHtml: text.intro,
		omitPoweredBy: !CREATEGAME_METADATA.creategame.packages.length,
		extraCss: `
		${compareCss}
		.missing { color: var(--vscode-errorForeground); }
		input[type=text] { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-focusBorder); border-radius: 2px; padding: 3px 6px; min-width: 24em; }
		input[type=text]:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		input::placeholder, textarea::placeholder { color: var(--vscode-input-placeholderForeground); }
		textarea { max-width: 900px; min-height: 70px; }
		.cases { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; max-width: 960px; margin: 8px 0; }
		.case { border: 1px solid var(--vscode-panel-border); border-radius: 4px; padding: 8px 10px; cursor: pointer; }
		.case:hover { border-color: var(--vscode-focusBorder); }
		.case.chosen { border-color: var(--vscode-focusBorder); box-shadow: inset 0 0 0 1px var(--vscode-focusBorder); }
		.case .name { font-weight: 600; }
		.case .from, .case .facts, .case .pattern { color: var(--vscode-descriptionForeground); font-size: 0.92em; margin: 2px 0; }
		.case .pattern { font-style: italic; }
		.case .description { margin: 6px 0; }
		.case .error { color: var(--vscode-errorForeground); font-size: 0.92em; margin: 4px 0; white-space: pre-wrap; }
		.part { margin-top: 14px; }
		.path { word-break: break-all; }
		.rounds { margin: 8px 0; padding-left: 18px; }
		.rounds li { margin: 2px 0; }
		.rounds .ok { color: var(--vscode-testing-iconPassed, #73c991); }
		.rounds .note { color: var(--vscode-editorWarning-foreground); display: block; }
		.failure { margin: 6px 0; padding: 8px 10px; background: var(--vscode-textCodeBlock-background); border-radius: 3px; font-family: var(--vscode-editor-font-family); white-space: pre-wrap; word-break: break-word; max-width: 900px; max-height: 320px; overflow: auto; }
		.share { margin: 6px 0; padding-left: 18px; max-width: 900px; }
		.share li { margin: 4px 0; }
`,
		steps: [
			{
				id: 'step-start',
				title: text.startStep,
				headHtml: '<span class="small" id="startHead"></span>',
				bodyHtml: `
		<p class="hint">${text.startIntro}</p>
		<div class="cases" id="sources"></div>
		<div class="small status missing" id="sourceFailures"></div>
		<div class="row"><span class="small">${text.caseTitle}</span> <input type="text" id="caseTitle" maxlength="80" placeholder="${text.caseTitlePlaceholder}"></div>
		<div class="small">${text.casesFolder} <span class="yellow path" id="casesPath"></span></div>
		<div class="settings"><span class="bar">
			<button class="action current" id="create">${text.create}</button>
			<button class="action" id="getMoreCases">${text.getMoreCases}</button>
		</span></div>
		<div class="small status" id="createStatus"></div>
		<h3 class="part">${text.yourCases}</h3>
		<p class="hint">${text.yourCasesIntro}</p>
		<p class="hint" id="noYours">${text.noYourCases}</p>
		<div class="cases" id="yours"></div>
		<div class="settings"><span class="bar">
			<button class="action current" id="openFolder">${text.openFolder}</button>
		</span></div>
		<div class="small status missing" id="openStatus"></div>
`,
			},
			{
				id: 'step-write',
				title: text.writeStep,
				headHtml: '<span class="small" id="writeHead"></span>',
				bodyHtml: `
		<p class="hint" data-no-case>${text.noCase}</p>
		<div data-case hidden>
			<div class="small">${text.caseIn} <span class="yellow path" id="casePath"></span></div>
			<div class="small status missing" id="caseError"></div>
			<p class="hint">${text.writeIntro}</p>
			<div class="settings"><span class="bar">
				<button class="action current" data-file="case">${text.openCase}</button>
				<button class="action" data-file="model">${text.openModel}</button>
				<button class="action" data-file="briefing" id="openBriefing">${text.openBriefing}</button>
				<button class="action" data-file="debrief" id="openQuestions">${text.openQuestions}</button>
				<button class="action" id="revealFolder">${text.revealFolder}</button>
				<button class="action" id="readDrillDown">${text.readDrillDown}</button>
			</span></div>
			<h3 class="part">${text.withAgent}</h3>
			<p class="hint">${text.withAgentIntro}</p>
			<textarea id="description" rows="3" placeholder="${text.descriptionPlaceholder}"></textarea>
			<div class="settings"><span class="bar">
				<button class="action current" id="writeWithAgent">${text.withAgent}</button>
			</span></div>
			<div class="small status" id="writeStatus"></div>
		</div>
`,
			},
			{
				id: 'step-test',
				title: text.testStep,
				headHtml: '<span class="small" id="testHead"></span>',
				bodyHtml: `
		<p class="hint" data-no-case>${text.noCase}</p>
		<div data-case hidden>
			<p class="hint">${text.testIntro}</p>
			<div class="settings"><span class="bar">
				<button class="action current" id="test">${text.test}</button>
			</span></div>
			<div class="small" id="testGame" hidden></div>
			<ul class="rounds" id="testRounds"></ul>
			<div class="small status" id="testStatus"></div>
			<div class="failure" id="testFailure" hidden></div>
			<div class="settings" id="testActions" hidden><span class="bar">
				<button class="action current" id="fixWithAgent">${text.fixWithAgent}</button>
				<button class="action" id="openDebrief">${text.openDebrief}</button>
			</span></div>
			<div class="small status" id="fixStatus"></div>
		</div>
`,
			},
			{
				id: 'step-share',
				title: text.shareStep,
				headHtml: '<span class="small" id="shareHead"></span>',
				bodyHtml: `
		<p class="hint" data-no-case>${text.noCase}</p>
		<div data-case hidden>
			<p class="hint missing" id="notTested">${text.notTested}</p>
			<ul class="share">
				<li>${text.shareHost}</li>
				<li>${text.shareFolder}</li>
				<li>${text.sharePackage}</li>
			</ul>
			<div class="settings"><span class="bar">
				<button class="action current" id="host">${text.host}</button>
				<button class="action" id="shareReveal">${text.revealFolder}</button>
				<button class="action" id="packageWithAgent">${text.packageWithAgent}</button>
			</span></div>
			<div class="small status" id="shareStatus"></div>
		</div>
`,
			},
		],
		pageScriptJs: `
	${ONE_BLUE_BUTTON_JS.trim()}
	const TEXT = ${JSON.stringify(text)};
	const titleInput = document.getElementById('caseTitle');
	const createButton = document.getElementById('create');
	const createStatus = document.getElementById('createStatus');
	let state = { sources: [], yours: [], failures: [] };
	let source = 'minimal';

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content !== undefined) { node.textContent = content; }
		return node;
	}
	function format(template, ...values) {
		return template.replace(/\\{(\\d+)\\}/g, (match, index) => String(values[Number(index)]));
	}
	// A card of a case, chosen or not, which calls pick when clicked or pressed with Enter or Space
	function card(c, chosen, from, pick) {
		const node = element('div', 'case' + (chosen ? ' chosen' : ''));
		node.tabIndex = 0;
		node.setAttribute('role', 'radio');
		node.setAttribute('aria-checked', String(chosen));
		node.append(element('div', 'name', c.title));
		if (from) { node.append(element('div', 'from', from)); }
		if (c.pattern) { node.append(element('div', 'pattern', c.pattern)); }
		if (c.facts.length) { node.append(element('div', 'facts', c.facts.join(' \\u00b7 '))); }
		if (c.description) { node.append(element('div', 'description', c.description)); }
		if (c.error) { node.append(element('div', 'error', TEXT.cannotRead + ' ' + c.error)); }
		node.addEventListener('click', pick);
		node.addEventListener('keydown', event => {
			if ((event.key === 'Enter' || event.key === ' ') && event.target === node) { event.preventDefault(); pick(); }
		});
		return node;
	}
	function renderStart() {
		const sources = document.getElementById('sources');
		sources.textContent = '';
		if (!state.sources.some(c => c.id === source)) { source = state.sources.length ? state.sources[0].id : undefined; }
		for (const c of state.sources) {
			sources.append(card(c, c.id === source, c.from, () => { source = c.id; renderStart(); }));
		}
		document.getElementById('sourceFailures').textContent = state.failures.join('\\n');
		document.getElementById('casesPath').textContent = state.casesPath || '';
		const yours = document.getElementById('yours');
		yours.textContent = '';
		document.getElementById('noYours').hidden = state.yours.length > 0;
		for (const c of state.yours) {
			yours.append(card(c, !!state.current && state.current.id === c.id, c.path, () => vscode.postMessage({ command: 'choose', id: c.id })));
		}
		document.getElementById('startHead').textContent = state.current ? state.current.title : '';
		updateCreate();
	}
	function updateCreate() {
		createButton.disabled = !source || !titleInput.value.trim();
		if (createButton.disabled && !createStatus.classList.contains('missing')) { createStatus.textContent = TEXT.chooseSource; }
	}
	function renderCase() {
		const c = state.current;
		document.querySelectorAll('[data-case]').forEach(node => { node.hidden = !c; });
		document.querySelectorAll('[data-no-case]').forEach(node => { node.hidden = !!c; });
		document.getElementById('writeHead').textContent = c ? c.title : '';
		if (!c) {
			for (const id of ['testHead', 'shareHead']) { document.getElementById(id).textContent = ''; }
			return;
		}
		document.getElementById('casePath').textContent = c.path;
		document.getElementById('caseError').textContent = c.error ? TEXT.cannotRead + ' ' + c.error : '';
		document.getElementById('openBriefing').hidden = !c.briefing;
		document.getElementById('openQuestions').hidden = !c.debrief;
		renderTest();
	}
	function renderTest() {
		const t = state.test;
		const list = document.getElementById('testRounds');
		list.textContent = '';
		const game = document.getElementById('testGame');
		game.hidden = !t || !t.game;
		if (t && t.game) {
			game.textContent = format(TEXT.teamsPlayed, t.teams) + ' ';
			game.append(element('span', 'yellow path', t.game));
		}
		for (const round of t ? t.rounds : []) {
			const item = element('li', '', round.name + ': ');
			item.append(element('span', 'ok', TEXT.roundPassed));
			for (const note of round.notes) { item.append(element('span', 'note', note)); }
			list.append(item);
		}
		const failure = document.getElementById('testFailure');
		const status = document.getElementById('testStatus');
		const head = document.getElementById('testHead');
		failure.hidden = !t || !t.failure;
		failure.textContent = t && t.failure ? t.failure.message : '';
		status.classList.toggle('missing', !!(t && t.failure));
		if (!t) {
			status.textContent = '';
			head.textContent = '';
		} else if (t.running) {
			status.textContent = TEXT.testing;
			head.textContent = TEXT.testing;
		} else if (t.failure) {
			status.textContent = format(TEXT.failed, t.failure.round);
			head.textContent = format(TEXT.failed, t.failure.round);
		} else {
			status.textContent = TEXT.passedText;
			head.textContent = TEXT.passed;
		}
		document.getElementById('test').disabled = !!(t && t.running);
		document.getElementById('testActions').hidden = !t || t.running || (!t.failure && !t.debrief);
		const fix = document.getElementById('fixWithAgent');
		const debrief = document.getElementById('openDebrief');
		fix.hidden = !t || !t.failure;
		debrief.hidden = !t || !t.debrief;
		// The blue on the first button shown
		fix.classList.toggle('current', !fix.hidden);
		debrief.classList.toggle('current', fix.hidden);
		const passed = !!(t && !t.running && !t.failure);
		document.getElementById('notTested').hidden = passed;
		document.getElementById('shareHead').textContent = passed ? TEXT.passed : '';
	}

	titleInput.addEventListener('input', () => {
		createStatus.classList.remove('missing');
		createStatus.textContent = '';
		updateCreate();
	});
	createButton.addEventListener('click', () => {
		if (!source || !titleInput.value.trim()) { return; }
		createButton.disabled = true;
		vscode.postMessage({ command: 'create', source, title: titleInput.value.trim() });
	});
	document.querySelectorAll('[data-file]').forEach(button => button.addEventListener('click', () => vscode.postMessage({ command: 'openFile', file: button.dataset.file })));
	document.getElementById('writeWithAgent').addEventListener('click', () => vscode.postMessage({ command: 'writeWithAgent', description: document.getElementById('description').value }));
	document.getElementById('shareReveal').addEventListener('click', () => vscode.postMessage({ command: 'revealFolder' }));
	for (const command of ['getMoreCases', 'openFolder', 'revealFolder', 'readDrillDown', 'test', 'fixWithAgent', 'openDebrief', 'host', 'packageWithAgent']) {
		document.getElementById(command).addEventListener('click', () => vscode.postMessage({ command }));
	}

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			state = message;
			document.getElementById('openStatus').textContent = '';
			renderStart();
			renderCase();
		} else if (message.command === 'created') {
			titleInput.value = '';
			createStatus.classList.remove('missing');
			createStatus.textContent = TEXT.created;
			updateCreate();
		} else if (message.command === 'createFailed') {
			createStatus.classList.add('missing');
			createStatus.textContent = message.error;
			updateCreate();
		} else if (message.command === 'openFailed') {
			document.getElementById('openStatus').textContent = message.error;
		} else if (message.command === 'agentStarted') {
			const status = document.getElementById(message.box + 'Status');
			status.textContent = message.started ? TEXT.agentStarted : '';
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: CREATE_GAME_COMMAND_ID,
			title: localize2('collaboration.createGameCommand', "Create a Simulation Game..."),
			category: localize2('collaboration.category', "Collaboration"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openCreateGamePage(accessor);
	}
});

// Write with Agent on a case folder; from elsewhere than the page (the Agent Skills page, say), with no folder, the page opens
registerAction2(class extends Action2 {
	constructor() {
		super({
			id: WRITE_GAME_WITH_AGENT_COMMAND_ID,
			title: localize2('collaboration.writeGameWithAgent', "Write a Simulation Game with Agent..."),
			category: localize2('collaboration.category', "Collaboration"),
			f1: true,
		});
	}
	async run(accessor: ServicesAccessor, folder?: URI, description?: string): Promise<void> {
		if (!URI.isUri(folder)) {
			return openCreateGamePage(accessor);
		}
		const instantiationService = accessor.get(IInstantiationService);
		const fileService = accessor.get(IFileService);
		const gameCase = await loadCase(fileService, folder).catch(() => undefined);
		await startCaseAgent(instantiationService, folder, gameCase?.title ?? basename(folder), { kind: 'write', ...(typeof description === 'string' && description.trim() ? { description: description.trim() } : {}) });
	}
});
