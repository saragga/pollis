/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../vs/nls.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import './toolboxExtensions.js';
import './toolboxPanelsPage.js';
import { CHOOSE_AGENT_COMMAND_ID, CREATE_PANEL_COMMAND_ID, CREATE_PANELS_FROM_REQUEST_COMMAND_ID, PACKAGE_TOOLBOX_COMMAND_ID } from './pollisAgents.js';
import { CREATE_METHOD_COMMAND_ID, PACKAGE_METHOD_COMMAND_ID } from './newMethods.js';
import { NEW_METHODS_COMMAND_ID, PUBLISHED_BENCHMARKS_COMMAND_ID, SEARCH_WORKFLOW_LIBRARY_COMMAND_ID } from './workflowLibrary.js';

// The Mathematical Foundations, Financial Econometrics and Macroeconomics Toolboxes come from their extensions (toolboxes/pollis-toolbox-*, not built in:
// installed from the Toolboxes section of the Extensions pane), see toolboxExtensions.ts;
// Game Theory is in the Optimise menu

// Epidemiology Toolbox hidden for now: uncomment its three blocks to restore it.
/*
// Define a new submenu ID for "Epidemiology Toolbox"
const E_CMTSubmenuId = new MenuId('menubarE_CMTSubmenu');
*/

const PollisAgentsMenu = new MenuId('menubarPollisAgentsMenu');
const PollisSkillsMenu = new MenuId('menubarPollisSkillsMenu');
const WorkflowsMenu = new MenuId('menubarWorkflowsMenu');
const NewMethodsMenu = new MenuId('menubarNewMethodsMenu');
const CorrectnessMenu = new MenuId('menubarCorrectnessMenu');
const ComparisonsMenu = new MenuId('menubarComparisonsMenu');
const CompileGaloreMenu = new MenuId('menubarCompileGaloreMenu');
const CollaborationMenu = new MenuId('menubarCollaborationMenu');

// ------------------- COMPOSE ------------------------

// The Compose menu: Pollis Agents (pollisAgents.ts), Pollis Skills, Workflows, New Methods, Correctness Tests,
// Horse Races, Compile Galore and Collaboration, which combine panels. The Toolbox Panels page (toolboxPanelsPage.ts) opens from
// the Edit button of an installed toolbox in the Extensions pane.
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
	submenu: MenuId.MenubarComposeMenu,
	title: {
		value: 'Compose',
		original: 'Compose',
		mnemonicTitle: localize({ key: 'mCompose', comment: ['&& denotes a mnemonic'] }, "&&Compose")
	},
	order: 9.5
});

// ===================================================
// TOP-LEVEL COMPOSE MENU STRUCTURE
// ===================================================

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '1_compose',
	submenu: PollisAgentsMenu,
	title: localize('pollisAgents.menu', "Pollis Agents"),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '1_compose',
	submenu: PollisSkillsMenu,
	title: localize('pollisSkills.menu', 'Pollis Skills'),
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '1_compose',
	submenu: WorkflowsMenu,
	title: localize('pollisWorkflows.menu', 'Workflows'),
	order: 3,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_compose',
	submenu: NewMethodsMenu,
	title: localize('pollisNewMethods.menu', "New Methods"),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_compose',
	submenu: CorrectnessMenu,
	title: localize('pollisCorrectness.menu', "Correctness Tests"),
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_compose',
	submenu: ComparisonsMenu,
	title: localize('pollisComparison.menu', 'Profiling'),
	order: 3,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_compose',
	submenu: CompileGaloreMenu,
	title: localize('pollisCompileGalore.menu', "Compilation Lab"),
	order: 4,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '3_compose',
	submenu: CollaborationMenu,
	title: localize('pollisCollaboration.menu', 'Collaboration'),
	order: 1,
});



// ==============================================================
// SUBMENU: Pollis Agents (the commands are in pollisAgents.ts)
// ==============================================================


MenuRegistry.appendMenuItem(PollisAgentsMenu, {
	group: '1_skills',
	command: { id: CREATE_PANEL_COMMAND_ID, title: localize('pollisAgents.createPanel', "Create a Panel...") },
	order: 1,
});

MenuRegistry.appendMenuItem(PollisAgentsMenu, {
	group: '1_skills',
	command: { id: CREATE_PANELS_FROM_REQUEST_COMMAND_ID, title: localize('pollisAgents.createPanelsFromRequest', "Create Panels from a Request...") },
	order: 2,
});

MenuRegistry.appendMenuItem(PollisAgentsMenu, {
	group: '1_skills',
	command: { id: PACKAGE_TOOLBOX_COMMAND_ID, title: localize('pollisAgents.packageToolbox', "Package a Toolbox...") },
	order: 3,
});

MenuRegistry.appendMenuItem(PollisAgentsMenu, {
	group: '2_agent',
	command: { id: CHOOSE_AGENT_COMMAND_ID, title: localize('pollisAgents.chooseAgent', "Choose Coding Agent...") },
	order: 1,
});

// ==============================================================
// SUBMENU: Pollis Skills
// ==============================================================


// ==============================================================
// SUBMENU: Workflows
// ==============================================================

MenuRegistry.appendMenuItem(WorkflowsMenu, {
	group: '1_workflows',
	command: { id: 'chiara.statistics.wfl', title: localize('wfl.cw', 'Create Workflow') },
	order: 1,
});

MenuRegistry.appendMenuItem(WorkflowsMenu, {
	group: '1_workflows',
	command: { id: SEARCH_WORKFLOW_LIBRARY_COMMAND_ID, title: localize('wfl_sl.cw', "Library") },
	order: 2,
});



// ==============================================================
// SUBMENU: New Methods (newMethods.ts; the Library is in workflowLibrary.ts)
// ==============================================================

MenuRegistry.appendMenuItem(NewMethodsMenu, {
	group: '1_methods',
	command: { id: CREATE_METHOD_COMMAND_ID, title: localize('newMethods.create', "Create Method...") },
	order: 1,
});

MenuRegistry.appendMenuItem(NewMethodsMenu, {
	group: '1_methods',
	command: { id: PACKAGE_METHOD_COMMAND_ID, title: localize('newMethods.package', "Package and Publish...") },
	order: 2,
});

MenuRegistry.appendMenuItem(NewMethodsMenu, {
	group: '1_methods',
	command: { id: NEW_METHODS_COMMAND_ID, title: localize('newMethods.library', "Library") },
	order: 3,
});

// ==============================================================
// Correctness Tests, Horse Races, Compile Galore
MenuRegistry.appendMenuItem(CorrectnessMenu, {
	group: '0_benchmarks',
	command: { id: PUBLISHED_BENCHMARKS_COMMAND_ID, title: localize('correctness.publishedBenchmarks', "Published Benchmarks") },
	order: 1,
});

// ==============================================================

// Roadmap phase 6. Not built yet: each item says so.
// Correctness Tests: Julia, R and Python check one another.
// Horse Races > Add a Language... is Bring Your Own Language: Fortran, C and Rust use the same adapters.
const composeItems = [
	{ menu: CorrectnessMenu, id: 'chiara.statistics.comp_co', title: localize('comp.co', "Check Results Across Languages..."), group: '1_check', order: 1 },
	{ menu: CorrectnessMenu, id: 'chiara.statistics.comp_fx', title: localize('comp.fx', "Settle a Disagreement..."), group: '1_check', order: 2 },
	{ menu: ComparisonsMenu, id: 'chiara.statistics.comp_pr', title: localize('comp.pr', "Run a Speed Race..."), group: '1_race', order: 1 },
	{ menu: ComparisonsMenu, id: 'chiara.statistics.comp_im', title: localize('comp.im', "Speed Up a Function..."), group: '1_race', order: 2 },
	{ menu: CompileGaloreMenu, id: 'chiara.statistics.comp_tr', title: localize('comp.tr', "Translate Julia to Rust..."), group: '1_compiled', order: 1 },
	{ menu: ComparisonsMenu, id: 'chiara.statistics.comp_al', title: localize('comp.al', "Add a Language..."), group: '2_language', order: 1 },
	{ menu: CompileGaloreMenu, id: 'chiara.statistics.comp_sl', title: localize('comp.sl', "Compile Julia to a Shared Library..."), group: '1_compiled', order: 2 },
	{ menu: CompileGaloreMenu, id: 'chiara.statistics.comp_ex', title: localize('comp.ex', "Compile Julia to an Executable..."), group: '1_compiled', order: 3 },
	{ menu: CompileGaloreMenu, id: 'chiara.statistics.comp_mx', title: localize('comp.mx', "Mix Julia with Compiled Code..."), group: '1_compiled', order: 4 },
];

/** Registers a command that says its menu item is not built yet. */
function registerNotYetImplemented(id: string, title: string): void {
	CommandsRegistry.registerCommand(id, accessor => {
		accessor.get(INotificationService).info(localize('compose.notYetImplemented', "{0}: Not yet implemented", title.replace(/\.\.\.$/, '')));
	});
}

for (const item of composeItems) {
	registerNotYetImplemented(item.id, item.title);
	MenuRegistry.appendMenuItem(item.menu, {
		group: item.group,
		command: { id: item.id, title: item.title },
		order: item.order,
	});
}



// ==============================================================
// SUBMENU: Collaboration
// ==============================================================

// Live sessions between Pollis users (roadmap phase 5, internal-reports/collaboration-spec.md),
// and later classrooms and simulation games (phase 13) on the same session layer.
// Not built yet: each item says so. Share My Editor and Copy to My Editor are not here:
// they will be buttons below the editors.
const CollaborationClassroomMenu = new MenuId('menubarCollaborationClassroomMenu');
const CollaborationGamesMenu = new MenuId('menubarCollaborationGamesMenu');

MenuRegistry.appendMenuItem(CollaborationMenu, {
	group: '4_groups',
	submenu: CollaborationClassroomMenu,
	title: localize('collaboration.classroom', "Classroom"),
	order: 1,
});

MenuRegistry.appendMenuItem(CollaborationMenu, {
	group: '4_groups',
	submenu: CollaborationGamesMenu,
	title: localize('collaboration.games', "Simulation Games"),
	order: 2,
});

const collaborationItems = [
	// Sessions: Side by Side (each keeps their own editor) or Same Page (co-editing a shared folder)
	{ menu: CollaborationMenu, id: 'pollis.collaboration.startSideBySide', title: localize('collaboration.startSideBySide', "Start Side by Side Session..."), group: '1_session', order: 1 },
	{ menu: CollaborationMenu, id: 'pollis.collaboration.startSamePage', title: localize('collaboration.startSamePage', "Start Same Page Session..."), group: '1_session', order: 2 },
	{ menu: CollaborationMenu, id: 'pollis.collaboration.joinSession', title: localize('collaboration.joinSession', "Join Session..."), group: '1_session', order: 3 },
	{ menu: CollaborationMenu, id: 'pollis.collaboration.leaveSession', title: localize('collaboration.leaveSession', "Leave Session"), group: '1_session', order: 4 },
	// Participants and chat
	{ menu: CollaborationMenu, id: 'pollis.collaboration.invitePeople', title: localize('collaboration.invitePeople', "Invite People..."), group: '2_participants', order: 1 },
	{ menu: CollaborationMenu, id: 'pollis.collaboration.inviteAgent', title: localize('collaboration.inviteAgent', "Invite an Agent..."), group: '2_participants', order: 2 },
	{ menu: CollaborationMenu, id: 'pollis.collaboration.showParticipants', title: localize('collaboration.showParticipants', "Show Participants"), group: '2_participants', order: 3 },
	{ menu: CollaborationMenu, id: 'pollis.collaboration.openChat', title: localize('collaboration.openChat', "Open Chat"), group: '3_chat', order: 1 },
	// Connection
	{ menu: CollaborationMenu, id: 'pollis.collaboration.testConnection', title: localize('collaboration.testConnection', "Test Connection..."), group: '5_settings', order: 1 },
	{ menu: CollaborationMenu, id: 'pollis.collaboration.sessionSettings', title: localize('collaboration.sessionSettings', "Session Settings..."), group: '5_settings', order: 2 },
	// Classroom: a tutor and a class (star), and breakout groups
	{ menu: CollaborationClassroomMenu, id: 'pollis.collaboration.startClass', title: localize('collaboration.startClass', "Start Class Session..."), group: '1_class', order: 1 },
	{ menu: CollaborationClassroomMenu, id: 'pollis.collaboration.breakoutGroups', title: localize('collaboration.breakoutGroups', "Split into Breakout Groups..."), group: '2_breakout', order: 1 },
	{ menu: CollaborationClassroomMenu, id: 'pollis.collaboration.visitGroup', title: localize('collaboration.visitGroup', "Visit a Group..."), group: '2_breakout', order: 2 },
	{ menu: CollaborationClassroomMenu, id: 'pollis.collaboration.bringEveryoneBack', title: localize('collaboration.bringEveryoneBack', "Bring Everyone Back"), group: '2_breakout', order: 3 },
	// Simulation games: teams and roles, private channels, a facilitator holding the official state
	{ menu: CollaborationGamesMenu, id: 'pollis.collaboration.hostGame', title: localize('collaboration.hostGame', "Host a Game..."), group: '1_game', order: 1 },
	{ menu: CollaborationGamesMenu, id: 'pollis.collaboration.joinGame', title: localize('collaboration.joinGame', "Join a Game..."), group: '1_game', order: 2 },
	{ menu: CollaborationGamesMenu, id: 'pollis.collaboration.nextRound', title: localize('collaboration.nextRound', "Next Round"), group: '2_facilitator', order: 1 },
	{ menu: CollaborationGamesMenu, id: 'pollis.collaboration.releaseNews', title: localize('collaboration.releaseNews', "Release News..."), group: '2_facilitator', order: 2 },
	{ menu: CollaborationGamesMenu, id: 'pollis.collaboration.debrief', title: localize('collaboration.debrief', "Open the Debrief"), group: '3_debrief', order: 1 },
];

for (const item of collaborationItems) {
	CommandsRegistry.registerCommand(item.id, accessor => {
		accessor.get(INotificationService).info(localize('collaboration.notYetImplemented', "{0}: Not yet implemented", item.title.replace(/\.\.\.$/, '')));
	});
	MenuRegistry.appendMenuItem(item.menu, {
		group: item.group,
		command: { id: item.id, title: item.title },
		order: item.order,
	});
}



/*
// Epidemiology Toolbox
MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '3_toolboxes',
	submenu: E_CMTSubmenuId,
	title: localize('showStatistics.ept', 'Epidemiology Toolbox'),
	order: 1,
});
*/

/*
// ===================================================
// SUBMENU: Epidemiology
// ===================================================

MenuRegistry.appendMenuItem(E_CMTSubmenuId, {
	group: '1_ect',
	command: { id: 'chiara.statistics.cest', title: localize('ect.cest', 'Epidemiological Inference') },
	order: 1,
}); // Pathogen.jl, Rt-without-renewal

MenuRegistry.appendMenuItem(E_CMTSubmenuId, {
	group: '2_ect',
	command: { id: 'chiara.simulate.epi-comp', title: localize('ect.epi-comp', 'Compartmental Models') },
	order: 2,
}); // DifferentialEquations.jl

MenuRegistry.appendMenuItem(E_CMTSubmenuId, {
	group: '2_ect',
	command: { id: 'chiara.simulate.epi-ude', title: localize('ect.epi-ude', 'Universal Differential Equations for Epidemiology') },
	order: 3,
}); // DiffEqFlux.jl, Lux.jl
*/
