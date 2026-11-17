/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { isEqual } from '../../../../../base/common/resources.js';
import { hasKey } from '../../../../../base/common/types.js';
import { URI } from '../../../../../base/common/uri.js';
import { localize, localize2 } from '../../../../../nls.js';
import { Action2, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IFileDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
import { registerScaffoldPageHandlers } from '../../../model/browser/handlers/scaffoldPage.handler.js';
import { HOSTGAME_METADATA } from '../../../model/browser/webviews/hostgame.data.js';
import { buildWebviewHtml, ONE_BLUE_BUTTON_JS } from '../../../model/browser/webviews/webviewScaffold.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { WebviewInput } from '../../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { IToolboxPanelsService } from '../../common/toolboxPanels.js';
import { compareCss } from '../compareShared.js';
import { briefingElementJs } from './collaborationChat.js';
import { IGameCase, loadCase, toolboxCases, withRounds } from './collaborationGame.js';
import { ICollaborationService } from './collaborationService.js';

// Compose > Simulation Games > Host a Game...: a page of the scaffold in the Time Arrow style, in three steps. 1, The Case:
// the cases of the installed toolboxes, or a case folder chosen, each with its briefing; 2, The Teams and the Rounds: the
// way the case organises its teams, and the number of rounds, when the case offers a choice; 3, Host: the facilitator's
// name, and Host the Game, which starts the session (collaborationService.ts) and shows its invitation.

/** The command of Host a Game..., which opens the page. */
export const HOST_GAME_COMMAND_ID = 'pollis.collaboration.hostGame';

/** The view of the Extensions view's Toolboxes section (PollisToolboxesView.ID), where the toolboxes of cases are installed. */
const TOOLBOXES_VIEW_ID = 'workbench.views.extensions.pollisToolboxes';

type HostGameMessage =
	| { readonly command: 'ready' }
	| { readonly command: 'chooseFolder' }
	| { readonly command: 'getMoreCases' }
	| { readonly command: 'host'; readonly id: string; readonly structure: string; readonly rounds: number; readonly name: string }
	| { readonly command: 'copyInvitation' }
	| { readonly command: 'openChat' };

/** The page, when it is open, and how to add a case folder to it and choose it. */
let openPage: { readonly input: WebviewInput; readonly addFolder: (folder: URI) => Promise<void> } | undefined;

/** Opens the page; with `folder`, a case folder, it adds the case and chooses it, as Choose a Case Folder... does. */
async function openHostGamePage(accessor: ServicesAccessor, folder?: URI): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const collaborationService = accessor.get(ICollaborationService);
	const toolboxPanelsService = accessor.get(IToolboxPanelsService);
	const fileService = accessor.get(IFileService);
	const fileDialogService = accessor.get(IFileDialogService);
	const clipboardService = accessor.get(IClipboardService);
	const viewsService = accessor.get(IViewsService);
	const commandService = accessor.get(ICommandService);
	const openerService = accessor.get(IOpenerService);
	const editorService = accessor.get(IEditorService);
	const notificationService = accessor.get(INotificationService);
	const notebookEditorModelResolverService = accessor.get(INotebookEditorModelResolverService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	const pathService = accessor.get(IPathService);
	const storageService = accessor.get(IStorageService);

	if (openPage && !openPage.input.isDisposed()) {
		webviewWorkbenchService.revealWebview(openPage.input, openPage.input.group ?? -1, false);
		if (folder) {
			await openPage.addFolder(folder);
		}
		return;
	}
	const title = localize('hostGame.title', "Host a Game");
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.hostgame',
		title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);
	webviewInput.webview.setHtml(pageHtml());
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const disposables = new DisposableStore();
	disposables.add(registerScaffoldPageHandlers(webviewInput, 'hostgame', title, HOSTGAME_METADATA.hostgame, openerService, editorService, commandService, notificationService, notebookEditorModelResolverService, notebookKernelService, fileService, pathService, storageService));

	/** The cases of the installed toolboxes, each with its toolbox, by an id of the page, and those that could not be read. */
	let toolboxCaseList: { readonly id: string; readonly gameCase: IGameCase; readonly toolbox: string }[] = [];
	let failures: string[] = [];
	/** The case folders chosen on the page, which stay listed while it is open. */
	const folderCases: { readonly id: string; readonly gameCase: IGameCase }[] = [];
	/** The case chosen last, from a folder, for the page to select, and how many times one was, so that the same folder chosen again is selected again. */
	let chosenId: string | undefined;
	let chosenCount = 0;

	const readToolboxCases = async () => {
		const read: typeof toolboxCaseList = [];
		const failed: string[] = [];
		for (const [index, { folder, toolbox }] of toolboxCases(toolboxPanelsService).entries()) {
			try {
				read.push({ id: `toolbox-${index}`, gameCase: await loadCase(fileService, folder), toolbox });
			} catch (error) {
				failed.push(localize('hostGame.toolboxCaseFailed', "A case of the {0} could not be read: {1}", toolbox, String(error?.message ?? error)));
			}
		}
		toolboxCaseList = read;
		failures = failed;
	};
	const findCase = (id: string) => toolboxCaseList.find(item => item.id === id)?.gameCase ?? folderCases.find(item => item.id === id)?.gameCase;
	/** Whether the page has drawn itself, so that a folder added before it has waits for it. */
	let ready = false;
	let pendingFolder = folder;

	const postState = () => {
		const describe = (id: string, gameCase: IGameCase, toolbox?: string) => ({
			id,
			title: gameCase.title,
			toolbox,
			description: gameCase.description,
			facts: caseFacts(gameCase),
			briefing: gameCase.briefing ?? '',
			structures: gameCase.structures.map(structure => ({ key: structure.key, label: structure.label, description: structure.description })),
			rounds: (gameCase.roundChoices.length > 1 ? [...gameCase.roundChoices].reverse() : []).map(rounds => ({
				rounds,
				label: localize('hostGame.roundCount', "{0} Rounds", rounds),
				detail: rounds === gameCase.rounds ? localize('hostGame.roundCountFull', "the whole case") : gameCase.roundNames.slice(0, rounds).filter(Boolean).join(', '),
			})),
		});
		post({
			command: 'state',
			cases: [...toolboxCaseList.map(item => describe(item.id, item.gameCase, item.toolbox)), ...folderCases.map(item => describe(item.id, item.gameCase))],
			failures,
			chosen: chosenId,
			chosenCount,
			name: collaborationService.lastName,
			inSession: collaborationService.inSession,
			invitation: collaborationService.hostedGameInvitation,
		});
	};

	disposables.add(toolboxPanelsService.onDidChange(async () => {
		await readToolboxCases();
		postState();
	}));
	disposables.add(collaborationService.onDidChangeSession(() => postState()));
	// A case folder chosen, read again when it is listed already, since its case may have changed
	const addFolder = async (chosen: URI) => {
		if (!ready) {
			pendingFolder = chosen;
			return;
		}
		try {
			const gameCase = await loadCase(fileService, chosen);
			const listed = folderCases.findIndex(item => isEqual(item.gameCase.folder, chosen));
			chosenId = listed >= 0 ? folderCases[listed].id : `folder-${folderCases.length}`;
			chosenCount++;
			folderCases.splice(listed >= 0 ? listed : folderCases.length, listed >= 0 ? 1 : 0, { id: chosenId, gameCase });
			postState();
		} catch (error) {
			post({ command: 'folderFailed', error: String(error?.message ?? error) });
		}
	};
	openPage = { input: webviewInput, addFolder };

	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPage = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage(async (e: { message: HostGameMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			await readToolboxCases();
			ready = true;
			postState();
			if (pendingFolder) {
				const chosen = pendingFolder;
				pendingFolder = undefined;
				await addFolder(chosen);
			}
		} else if (message.command === 'chooseFolder') {
			const chosen = (await fileDialogService.showOpenDialog({ title: localize('hostGame.chooseFolderTitle', "Choose a Case Folder"), canSelectFolders: true, canSelectFiles: false, canSelectMany: false }))?.[0];
			if (chosen) {
				await addFolder(chosen);
			}
		} else if (message.command === 'getMoreCases') {
			await viewsService.openView(TOOLBOXES_VIEW_ID, true);
		} else if (message.command === 'host' && hasKey(message, { id: true, structure: true, rounds: true, name: true })) {
			const full = findCase(message.id);
			const structure = full?.structures.find(item => item.key === message.structure);
			if (!full || !structure || !message.name.trim()) {
				return;
			}
			const gameCase = full.roundChoices.length > 1 && full.roundChoices.includes(message.rounds) ? withRounds(full, message.rounds) : full;
			await collaborationService.hostGame(gameCase, structure, message.name);
			postState();
		} else if (message.command === 'copyInvitation') {
			const invitation = collaborationService.hostedGameInvitation;
			if (invitation) {
				await clipboardService.writeText(invitation);
				post({ command: 'copied' });
			}
		} else if (message.command === 'openChat') {
			collaborationService.openChat();
		}
	}));
}

/** What a case's card says of it beside its description: its teams, its rounds, and its market. */
export function caseFacts(gameCase: IGameCase): string[] {
	const facts = [gameCase.minTeams === gameCase.maxTeams
		? localize('hostGame.teamsExactly', "{0} teams", gameCase.minTeams)
		: localize('hostGame.teams', "{0} to {1} teams", gameCase.minTeams, gameCase.maxTeams)];
	const shortest = gameCase.roundChoices.length > 1 ? gameCase.roundChoices[0] : gameCase.rounds;
	facts.push(shortest === gameCase.rounds
		? localize('hostGame.rounds', "{0} rounds, each a {1}", gameCase.rounds, gameCase.roundLabel)
		: localize('hostGame.roundsChoice', "{0} to {1} rounds, each a {2}", shortest, gameCase.rounds, gameCase.roundLabel));
	if (gameCase.market) {
		facts.push(localize('hostGame.market', "trades on a market by the clock"));
	}
	return facts;
}

function pageHtml(): string {
	const text = {
		title: localize('hostGame.title', "Host a Game"),
		intro: localize('hostGame.intro', "A game is a class session in which teams decide round by round, and the case's model, written in Julia, plays each round on your computer. Choose the case and how its teams are organised, then host the game: the players join with its invitation, from Compose > Simulation Games > Join a Game..."),
		caseStep: localize('hostGame.caseStep', "The Case"),
		caseIntro: localize('hostGame.caseIntro', "The cases of the toolboxes installed, and any case folder you choose: a folder with {0} and {1}.", '<span class="yellow">case.toml</span>', '<span class="yellow">model.jl</span>'),
		noCases: localize('hostGame.noCases', "No toolbox with a case is installed: Get More Cases opens the Toolboxes section of the Extensions view, where the cases are, such as Grow a Chocolate Chain."),
		readBriefing: localize('hostGame.readBriefing', "Read the Briefing"),
		noBriefing: localize('hostGame.noBriefing', "This case has no briefing for every player."),
		chooseFolder: localize('hostGame.chooseFolder', "Choose a Case Folder..."),
		getMoreCases: localize('hostGame.getMoreCases', "Get More Cases"),
		caseFolder: localize('hostGame.caseFolder', "Case folder"),
		teamsStep: localize('hostGame.teamsStep', "The Teams and the Rounds"),
		teamsIntro: localize('hostGame.teamsIntro', "How the teams of the case are organised, and how many rounds the game lasts."),
		chooseCaseFirst: localize('hostGame.chooseCaseFirst', "Choose a case in step 1."),
		organisation: localize('hostGame.organisation', "Teams"),
		rounds: localize('hostGame.roundsLabel', "Rounds"),
		oneOrganisation: localize('hostGame.oneOrganisation', "The case organises its teams in one way:"),
		hostStep: localize('hostGame.hostStep', "Host"),
		hostIntro: localize('hostGame.hostIntro', "Your name, as the players will see it. Host the Game opens the chat and copies the invitation: send it to the players."),
		name: localize('hostGame.name', "Your Name"),
		namePlaceholder: localize('hostGame.namePlaceholder', "Your name, as the others will see it"),
		host: localize('hostGame.host', "Host the Game"),
		needName: localize('hostGame.needName', "Type your name."),
		inSession: localize('hostGame.inSession', "You are already in a session: leave it first (Compose > Collaboration > Leave Session)."),
		hosting: localize('hostGame.hosting', "You host a game. The invitation was copied: send it to the players, who join from Compose > Simulation Games > Join a Game... When they have joined, press Next Round in the chat."),
		invitation: localize('hostGame.invitation', "Invitation"),
		copyInvitation: localize('hostGame.copyInvitation', "Copy Invitation"),
		copied: localize('hostGame.copied', "Copied"),
		openChat: localize('hostGame.openChat', "Open Chat"),
		headHosting: localize('hostGame.headHosting', "Hosting"),
	};
	return buildWebviewHtml({
		title: text.title,
		introHtml: text.intro,
		omitPoweredBy: !HOSTGAME_METADATA.hostgame.packages.length,
		extraCss: `
		${compareCss}
		.missing { color: var(--vscode-errorForeground); }
		input[type=text] { font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-focusBorder); border-radius: 2px; padding: 3px 6px; min-width: 18em; }
		input[type=text]:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		input::placeholder { color: var(--vscode-input-placeholderForeground); }
		.cases { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; max-width: 960px; margin: 8px 0; }
		.case { border: 1px solid var(--vscode-panel-border); border-radius: 4px; padding: 8px 10px; cursor: pointer; }
		.case:hover { border-color: var(--vscode-focusBorder); }
		.case.chosen { border-color: var(--vscode-focusBorder); box-shadow: inset 0 0 0 1px var(--vscode-focusBorder); }
		.case .name { font-weight: 600; }
		.case .from, .case .facts { color: var(--vscode-descriptionForeground); font-size: 0.92em; margin: 2px 0; }
		.case .description { margin: 6px 0; }
		.case details summary { cursor: pointer; color: var(--vscode-textLink-foreground); }
		.briefing { margin: 4px 0 8px; }
		.briefing p, .briefing ul { margin: 4px 0; }
		.briefing ul { padding-left: 18px; }
		.briefing .heading { font-weight: 600; margin: 8px 0 2px; }
		.choice { display: block; margin: 6px 0; }
		.choice .detail { display: block; color: var(--vscode-descriptionForeground); margin-left: 22px; }
		.part { margin-top: 12px; }
		.invitation { margin: 6px 0; padding: 8px 10px; background: var(--vscode-textCodeBlock-background); border-radius: 3px; font-family: var(--vscode-editor-font-family); white-space: pre-wrap; word-break: break-all; max-width: 900px; }
`,
		steps: [
			{
				id: 'step-case',
				title: text.caseStep,
				headHtml: '<span class="small" id="caseHead"></span>',
				bodyHtml: `
		<p class="hint">${text.caseIntro}</p>
		<p class="hint" id="noCases" hidden>${text.noCases}</p>
		<div class="cases" id="cases"></div>
		<div class="small status missing" id="caseFailures"></div>
		<div class="settings"><span class="bar">
			<button class="action current" id="chooseFolder">${text.chooseFolder}</button>
			<button class="action" id="getMoreCases">${text.getMoreCases}</button>
		</span></div>
`,
			},
			{
				id: 'step-teams',
				title: text.teamsStep,
				headHtml: '<span class="small" id="teamsHead"></span>',
				bodyHtml: `
		<p class="hint">${text.teamsIntro}</p>
		<p class="hint" id="chooseCaseFirst">${text.chooseCaseFirst}</p>
		<div id="structureBox" hidden><h3 class="part">${text.organisation}</h3><div id="structures"></div></div>
		<div id="roundsBox" hidden><h3 class="part">${text.rounds}</h3><div id="rounds"></div></div>
`,
			},
			{
				id: 'step-host',
				title: text.hostStep,
				headHtml: '<span class="small" id="hostHead"></span>',
				bodyHtml: `
		<p class="hint">${text.hostIntro}</p>
		<div class="row"><span class="small">${text.name}</span> <input type="text" id="name" maxlength="40" placeholder="${text.namePlaceholder}"></div>
		<div class="settings"><span class="bar">
			<button class="action current" id="host">${text.host}</button>
		</span></div>
		<div class="small status" id="hostStatus"></div>
		<div id="hostingBox" hidden>
			<p class="hint">${text.hosting}</p>
			<h3 class="part">${text.invitation}</h3>
			<div class="invitation" id="invitation"></div>
			<div class="settings"><span class="bar">
				<button class="action current" id="copyInvitation">${text.copyInvitation}</button>
				<button class="action" id="openChat">${text.openChat}</button>
			</span></div>
		</div>
`,
			},
		],
		pageScriptJs: `
	${ONE_BLUE_BUTTON_JS.trim()}
	${briefingElementJs}
	const TEXT = ${JSON.stringify(text)};
	const nameInput = document.getElementById('name');
	const hostButton = document.getElementById('host');
	const hostStatus = document.getElementById('hostStatus');
	let state = { cases: [], failures: [] };
	let chosen, lastChosen = 0;
	const structureOf = new Map();
	const roundsOf = new Map();
	// The briefings open, which stay open when the cards are drawn again
	const openBriefings = new Set();

	function chosenCase() {
		return state.cases.find(c => c.id === chosen);
	}
	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content !== undefined) { node.textContent = content; }
		return node;
	}
	function choose(id) {
		chosen = id;
		renderCases();
		renderTeams();
		updateHost();
	}
	function renderCases() {
		const box = document.getElementById('cases');
		box.textContent = '';
		document.getElementById('noCases').hidden = state.cases.some(c => c.toolbox);
		for (const c of state.cases) {
			const card = element('div', 'case' + (c.id === chosen ? ' chosen' : ''));
			card.tabIndex = 0;
			card.setAttribute('role', 'radio');
			card.setAttribute('aria-checked', String(c.id === chosen));
			card.append(element('div', 'name', c.title), element('div', 'from', c.toolbox || TEXT.caseFolder), element('div', 'facts', c.facts.join(' \\u00b7 ')));
			if (c.description) { card.append(element('div', 'description', c.description)); }
			const details = element('details');
			details.open = openBriefings.has(c.id);
			details.addEventListener('toggle', () => details.open ? openBriefings.add(c.id) : openBriefings.delete(c.id));
			details.append(element('summary', '', TEXT.readBriefing), c.briefing ? briefingElement(c.briefing) : element('p', 'hint', TEXT.noBriefing));
			card.append(details);
			card.addEventListener('click', event => {
				if (!event.target.closest('details')) { choose(c.id); }
			});
			card.addEventListener('keydown', event => {
				if ((event.key === 'Enter' || event.key === ' ') && event.target === card) { event.preventDefault(); choose(c.id); }
			});
			box.append(card);
		}
		const failures = document.getElementById('caseFailures');
		failures.textContent = state.failures.join('\\n');
		const c = chosenCase();
		document.getElementById('caseHead').textContent = c ? c.title : '';
	}
	function radios(box, name, items, value, onChange) {
		box.textContent = '';
		for (const item of items) {
			const label = element('label', 'choice');
			const input = document.createElement('input');
			input.type = 'radio';
			input.name = name;
			input.value = String(item.value);
			input.checked = item.value === value;
			input.addEventListener('change', () => onChange(item.value));
			label.append(input, ' ' + item.label);
			if (item.detail) { label.append(element('span', 'detail', item.detail)); }
			box.append(label);
		}
	}
	function renderTeams() {
		const c = chosenCase();
		document.getElementById('chooseCaseFirst').hidden = !!c;
		document.getElementById('structureBox').hidden = !c;
		document.getElementById('roundsBox').hidden = !c || !c.rounds.length;
		if (!c) {
			document.getElementById('teamsHead').textContent = '';
			return;
		}
		if (!c.structures.some(s => s.key === structureOf.get(c.id))) { structureOf.set(c.id, c.structures[0].key); }
		if (c.rounds.length && !c.rounds.some(r => r.rounds === roundsOf.get(c.id))) { roundsOf.set(c.id, c.rounds[0].rounds); }
		radios(document.getElementById('structures'), 'structure', c.structures.map(s => ({ value: s.key, label: s.label, detail: s.description })), structureOf.get(c.id), value => { structureOf.set(c.id, value); renderTeams(); });
		radios(document.getElementById('rounds'), 'rounds', c.rounds.map(r => ({ value: r.rounds, label: r.label, detail: r.detail })), roundsOf.get(c.id), value => { roundsOf.set(c.id, value); renderTeams(); });
		const structure = c.structures.find(s => s.key === structureOf.get(c.id));
		const round = c.rounds.find(r => r.rounds === roundsOf.get(c.id));
		document.getElementById('teamsHead').textContent = [structure.label, round ? round.label : ''].filter(Boolean).join(' \\u00b7 ');
	}
	function updateHost() {
		const hosting = !!state.invitation;
		document.getElementById('hostingBox').hidden = !hosting;
		document.getElementById('invitation').textContent = state.invitation || '';
		document.getElementById('hostHead').textContent = hosting ? TEXT.headHosting : '';
		let why = '';
		if (state.inSession) {
			why = hosting ? '' : TEXT.inSession;
		} else if (!chosenCase()) {
			why = TEXT.chooseCaseFirst;
		} else if (!nameInput.value.trim()) {
			why = TEXT.needName;
		}
		hostButton.disabled = state.inSession || !chosenCase() || !nameInput.value.trim();
		hostStatus.classList.remove('missing');
		hostStatus.textContent = why;
	}
	nameInput.addEventListener('input', updateHost);
	hostButton.addEventListener('click', () => {
		const c = chosenCase();
		if (!c) { return; }
		hostButton.disabled = true;
		vscode.postMessage({ command: 'host', id: c.id, structure: structureOf.get(c.id), rounds: roundsOf.get(c.id) || 0, name: nameInput.value.trim() });
	});
	for (const command of ['chooseFolder', 'getMoreCases', 'copyInvitation', 'openChat']) {
		document.getElementById(command).addEventListener('click', () => vscode.postMessage({ command }));
	}

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'state') {
			const first = !state.cases.length && !nameInput.value;
			state = message;
			// A case folder chosen is selected once, when it comes; a case clicked after it stays chosen
			if (message.chosen && message.chosenCount !== lastChosen) {
				chosen = message.chosen;
			}
			lastChosen = message.chosenCount;
			if (!state.cases.some(c => c.id === chosen)) {
				chosen = state.cases.length === 1 ? state.cases[0].id : undefined;
			}
			if (first && document.activeElement !== nameInput) {
				nameInput.value = message.name || '';
			}
			renderCases();
			renderTeams();
			updateHost();
		} else if (message.command === 'folderFailed') {
			const failures = document.getElementById('caseFailures');
			failures.textContent = message.error;
		} else if (message.command === 'copied') {
			const button = document.getElementById('copyInvitation');
			button.textContent = TEXT.copied;
			setTimeout(() => { button.textContent = TEXT.copyInvitation; }, 1500);
		}
	});
	vscode.postMessage({ command: 'ready' });
`,
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: HOST_GAME_COMMAND_ID,
			title: localize2('collaboration.hostGameCommand', "Host a Game..."),
			category: localize2('collaboration.category', "Collaboration"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor, folder?: URI): Promise<void> {
		return openHostGamePage(accessor, URI.isUri(folder) ? folder : undefined);
	}
});
