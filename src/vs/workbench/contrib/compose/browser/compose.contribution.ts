/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../vs/nls.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { AGENT_MENU_ICON_ID } from '../../../../platform/menubar/common/menubar.js';
import './toolboxExtensions.js';
import './toolboxPanelsPage.js';
import { BROWSE_SKILLS_COMMAND_ID, CHOOSE_AGENT_COMMAND_ID, CREATE_PANEL_COMMAND_ID, CREATE_PANELS_FROM_REQUEST_COMMAND_ID, PACKAGE_TOOLBOX_COMMAND_ID } from './pollisAgents.js';
import { BROWSE_METHODS_COMMAND_ID, CREATE_METHOD_COMMAND_ID } from './newMethods.js';
import './codingAgentPage.js';
import './modelRoutingPage.js';
import './pollisContent.js';
import './pollisUpdate.js';
import './vignettesPage.js';
import { LOCAL_MODEL_RUNNERS_COMMAND_ID } from './localModelRunnersPage.js';
import './mcpServersPage.js';
import { MCP_SERVERS_COMMAND_ID } from '../common/mcpServers.js';
import { MODEL_ROUTING_COMMAND_ID } from './modelRouting.js';
import { BROWSE_OPERATIONAL_WORKFLOWS_COMMAND_ID } from './operationalWorkflows.js';
import { EXPORT_NOTEBOOK_LATEX_COMMAND_ID, MAKE_NOTEBOOK_SLIDES_COMMAND_ID, POLISH_REPORT_COMMAND_ID } from './reports.js';
// Practise a Topic and Write an Exercise: in the Command Palette only, the menus are now the Learning and Practice toolbox
import './practice.js';
import { IMPLEMENTED_COLLABORATION_COMMANDS } from './collaboration/collaboration.contribution.js';
import { PUBLISHED_BENCHMARKS_COMMAND_ID, SEARCH_WORKFLOW_LIBRARY_COMMAND_ID } from './workflowLibrary.js';
import { SHOW_EVENT_STUDIES_COMMAND_ID } from '../../monitor/browser/eventStudiesService.js';

// The Mathematical Core, Financial Econometrics and Economics Toolboxes come from their extensions (toolboxes/pollis-toolbox-*, not built in:
// installed from the Toolboxes section of the Extensions pane), see toolboxExtensions.ts

const NewPanelsMenu = new MenuId('menubarNewPanelsMenu');
const OrchestrationMenu = new MenuId('menubarOrchestrationMenu');
// Formerly Explore > Access Model Repositories: the id stays, for the panel index and Pollis Views
const LocalModelsMenu = new MenuId('menubarAMRSubmenu');
const ReportsMenu = new MenuId('menubarReportsMenu');
const ReplicationMenu = new MenuId('menubarReplicationMenu');
const REPLICATE_ARTICLE_COMMAND_ID = 'pollis.replication.replicateArticle';
const WorkflowsMenu = new MenuId('menubarWorkflowsMenu');
const BROWSE_WORKFLOWS_COMMAND_ID = 'pollis.workflows.browse';
const EXTRACT_WORKFLOW_COMMAND_ID = 'pollis.workflows.extract';
const COMBINE_WORKFLOWS_COMMAND_ID = 'pollis.workflows.combine';
const CREATE_OPERATIONAL_WORKFLOW_COMMAND_ID = 'pollis.workflows.createOperational';
const AUTOMATIONS_COMMAND_ID = 'pollis.workflows.automations';
// Formerly Compose > New Methods: the id stays, for the panel index and Pollis Views
const NewMethodsMenu = new MenuId('menubarNewMethodsMenu');
const CorrectnessMenu = new MenuId('menubarCorrectnessMenu');
const ComparisonsMenu = new MenuId('menubarComparisonsMenu');
const CompileGaloreMenu = new MenuId('menubarCompileGaloreMenu');
const CollaborationMenu = new MenuId('menubarCollaborationMenu');

// ------------------- COMPOSE ------------------------

// The Compose menu: Coding Agents and Agent Skills (codingAgentPage.ts, pollisAgents.ts), MCP Servers (mcpServersPage.ts), Orchestration, Local Models, New Panels and Toolboxes, Replication, Methods, Workflows, Reports,
// Correctness Tests, Horse Races, Compile Galore and Collaboration, which combine panels. The Toolbox Panels page (toolboxPanelsPage.ts) opens from
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
	submenu: LocalModelsMenu,
	title: localize('pollisLocalModels.menu', "Local Models"),
	order: 1,
});

// Coding Agents, the agent every agent task of Compose uses, and Agent Skills, the library of the skills it follows
MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '1_compose',
	command: { id: CHOOSE_AGENT_COMMAND_ID, title: localize('pollisAgents.codingAgent', "Coding Agents") },
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '1_compose',
	command: { id: BROWSE_SKILLS_COMMAND_ID, title: localize('pollisSkills.agentSkills', "Agent Skills") },
	order: 3,
});

// MCP Servers, the data servers the agent can look things up in
MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '1_compose',
	command: { id: MCP_SERVERS_COMMAND_ID, title: localize('mcpServers.menu', "MCP Servers") },
	order: 4,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '1_compose',
	submenu: OrchestrationMenu,
	title: localize('pollisOrchestration.menu', "Orchestration"),
	order: 5,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_compose',
	submenu: NewPanelsMenu,
	title: localize('pollisNewPanels.menu', "New Panels and Toolboxes"),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_compose',
	submenu: ReplicationMenu,
	title: localize('pollisReplication.menu', "Replication"),
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_compose',
	submenu: NewMethodsMenu,
	title: localize('pollisMethods.menu', "Methods"),
	order: 3,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_compose',
	submenu: WorkflowsMenu,
	title: localize('pollisWorkflows.menu', 'Workflows'),
	order: 4,
});

// The page of a method (newMethods.ts), formerly Compose > Methods > Create Methods: kept here while its five steps
// (Article and Data, Write a Method, Write a Vignette, Prepare for Registration, Package and Publish) move one by one
MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_compose',
	command: { id: CREATE_METHOD_COMMAND_ID, title: localize('compose.underConstruction', "Under Construction...") },
	order: 5,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_compose',
	submenu: ReportsMenu,
	title: localize('pollisReports.menu', "Reports"),
	order: 6,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '3_compose',
	submenu: CorrectnessMenu,
	title: localize('pollisCorrectness.menu', "Correctness Tests"),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '3_compose',
	submenu: ComparisonsMenu,
	title: localize('pollisComparison.menu', 'Profiling'),
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '3_compose',
	submenu: CompileGaloreMenu,
	title: localize('pollisCompileGalore.menu', "Compilation Lab"),
	order: 3,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '4_compose',
	submenu: CollaborationMenu,
	title: localize('pollisCollaboration.menu', 'Collaboration'),
	order: 1,
});

// The mark of the items a coding agent does, since they cost tokens: the menus draw it as a two-star sparkle
// (menu.ts for the custom menu, electron-main/menubar.ts for the macOS one)
const agentIcon = registerIcon(AGENT_MENU_ICON_ID, Codicon.sparkle, localize('compose.agentIcon', "Icon of the menu items a coding agent does."));

// ==============================================================
// SUBMENU: New Panels and Toolboxes, the tasks a coding agent does on panels and toolboxes (pollisAgents.ts)
// ==============================================================

MenuRegistry.appendMenuItem(NewPanelsMenu, {
	group: '1_panels',
	command: { id: CREATE_PANEL_COMMAND_ID, title: localize('pollisAgents.createPanel', "Create a Panel..."), icon: agentIcon },
	order: 1,
});

MenuRegistry.appendMenuItem(NewPanelsMenu, {
	group: '1_panels',
	command: { id: CREATE_PANELS_FROM_REQUEST_COMMAND_ID, title: localize('pollisAgents.createPanelsFromRequest', "Create Panels from a Request..."), icon: agentIcon },
	order: 2,
});

MenuRegistry.appendMenuItem(NewPanelsMenu, {
	group: '2_toolboxes',
	command: { id: PACKAGE_TOOLBOX_COMMAND_ID, title: localize('pollisAgents.packageToolbox', "Package a Toolbox..."), icon: agentIcon },
	order: 1,
});


// ==============================================================
// SUBMENU: Local Models, the models to download (the panels of explore.contribution.ts) and the
// runners that serve them on this computer (localModelRunnersPage.ts)
// ==============================================================

MenuRegistry.appendMenuItem(LocalModelsMenu, {
	group: '1_models',
	command: { id: 'chiara.explore.hfm', title: localize('ds.hf', "Hugging Face Models") },
	order: 1,
}); // HuggingFaceHub.jl, https://huggingface.co/models

MenuRegistry.appendMenuItem(LocalModelsMenu, {
	group: '1_models',
	command: { id: 'chiara.explore.kgm', title: localize('ds.km', "Kaggle Models") },
	order: 2,
}); // https://www.kaggle.com/models

MenuRegistry.appendMenuItem(LocalModelsMenu, {
	group: '1_models',
	command: { id: LOCAL_MODEL_RUNNERS_COMMAND_ID, title: localize('localRunners.menu', "Local Model Runners") },
	order: 3,
});


// ==============================================================
// SUBMENU: Replication
// ==============================================================

// Replications reproduce a published analysis on its public data (workflowLibrary.ts); the command id is
// the one of the former Compose > Workflows > Browse Analytical Workflows
MenuRegistry.appendMenuItem(ReplicationMenu, {
	group: '1_replication',
	command: { id: SEARCH_WORKFLOW_LIBRARY_COMMAND_ID, title: localize('replication.browse', "Browse Replications...") },
	order: 1,
});

// The coding agent replicates an article: not built yet
MenuRegistry.appendMenuItem(ReplicationMenu, {
	group: '1_replication',
	command: { id: REPLICATE_ARTICLE_COMMAND_ID, title: localize('replication.replicateArticle', "Replicate a Classical Article...") },
	order: 2,
});
registerNotYetImplemented(REPLICATE_ARTICLE_COMMAND_ID, localize('replication.replicateArticle', "Replicate a Classical Article..."));

// ==============================================================
// SUBMENU: Workflows
// ==============================================================

// A workflow is a flat set of procedures, each with its inputs, its outputs and what it runs: extracted from
// a replication or a notebook, and combined with others, the independent ones run side by side. Not built yet.
// Operational workflows do a job on the user's own work, such as a notebook made into a report (operationalWorkflows.ts)
MenuRegistry.appendMenuItem(WorkflowsMenu, {
	group: '1_build',
	command: { id: BROWSE_WORKFLOWS_COMMAND_ID, title: localize('workflows.browse', "Browse Workflows...") },
	order: 1,
});
registerNotYetImplemented(BROWSE_WORKFLOWS_COMMAND_ID, localize('workflows.browse', "Browse Workflows..."));

MenuRegistry.appendMenuItem(WorkflowsMenu, {
	group: '1_build',
	command: { id: EXTRACT_WORKFLOW_COMMAND_ID, title: localize('workflows.extract', "Extract a Workflow...") },
	order: 2,
});
registerNotYetImplemented(EXTRACT_WORKFLOW_COMMAND_ID, localize('workflows.extract', "Extract a Workflow..."));

MenuRegistry.appendMenuItem(WorkflowsMenu, {
	group: '1_build',
	command: { id: COMBINE_WORKFLOWS_COMMAND_ID, title: localize('workflows.combine', "Combine Workflows...") },
	order: 3,
});
registerNotYetImplemented(COMBINE_WORKFLOWS_COMMAND_ID, localize('workflows.combine', "Combine Workflows..."));

// Event studies of the filings an alert on SEC filings fires, with the minute prices around each (eventStudiesPage.ts)
MenuRegistry.appendMenuItem(WorkflowsMenu, {
	group: '2_eventStudies',
	command: { id: SHOW_EVENT_STUDIES_COMMAND_ID, title: localize('workflows.eventStudies', "Event Studies...") },
	order: 1,
});

MenuRegistry.appendMenuItem(WorkflowsMenu, {
	group: '2_operational',
	command: { id: BROWSE_OPERATIONAL_WORKFLOWS_COMMAND_ID, title: localize('operationalWorkflows.browse', "Browse Operational Workflows...") },
	order: 1,
});

MenuRegistry.appendMenuItem(WorkflowsMenu, {
	group: '2_operational',
	command: { id: CREATE_OPERATIONAL_WORKFLOW_COMMAND_ID, title: localize('operationalWorkflows.create', "Create Operational Workflow...") },
	order: 2,
});
// Not built yet
registerNotYetImplemented(CREATE_OPERATIONAL_WORKFLOW_COMMAND_ID, localize('operationalWorkflows.create', "Create Operational Workflow..."));

// Agent sessions run on a schedule, as in the Automations page of VS Code's Agents window. Not in
// Code - OSS 1.117.0: it comes with the rebase
MenuRegistry.appendMenuItem(WorkflowsMenu, {
	group: '3_automations',
	command: { id: AUTOMATIONS_COMMAND_ID, title: localize('workflows.automations', "Automations...") },
	order: 1,
});
registerNotYetImplemented(AUTOMATIONS_COMMAND_ID, localize('workflows.automations', "Automations..."));



// ==============================================================
// SUBMENU: Methods, formerly New Methods (newMethods.ts; Browse Methods is in workflowLibrary.ts). Browse Methods lists
// the user's methods, to go on with one, and the library. The page of a new method is Compose > Under Construction...
// ==============================================================

MenuRegistry.appendMenuItem(NewMethodsMenu, {
	group: '3_browse',
	command: { id: BROWSE_METHODS_COMMAND_ID, title: localize('newMethods.library', "Browse Methods") },
	order: 1,
});

// ==============================================================
// Correctness Tests, Horse Races, Compile Galore
MenuRegistry.appendMenuItem(CorrectnessMenu, {
	group: '0_benchmarks',
	command: { id: PUBLISHED_BENCHMARKS_COMMAND_ID, title: localize('correctness.publishedBenchmarks', "Published Benchmarks") },
	order: 1,
});

// ==============================================================

// Model Routing: the tier, and so the model, each agent task runs on, see modelRouting.ts
MenuRegistry.appendMenuItem(OrchestrationMenu, {
	group: '0_routing',
	command: { id: MODEL_ROUTING_COMMAND_ID, title: localize('orchestration.modelRouting', "Model Routing"), icon: agentIcon },
	order: 1,
});

// Not built yet: each item says so.
// Orchestration: coding agents working together. Writer and Checker: one writes, another checks; Two
// Independent Transcriptions: two agents type the same table from an article and the differences are shown;
// Race: several agents do the same task and the results are compared.
// Roadmap phase 6:
// Correctness Tests: Julia, R and Python check one another.
// Horse Races > Add a Language... is Bring Your Own Language: Fortran, C and Rust use the same adapters.
const composeItems = [
	{ menu: OrchestrationMenu, id: 'pollis.orchestration.writerChecker', title: localize('orchestration.writerChecker', "Writer and Checker..."), group: '1_patterns', order: 1, agent: true },
	{ menu: OrchestrationMenu, id: 'pollis.orchestration.twoTranscriptions', title: localize('orchestration.twoTranscriptions', "Two Independent Transcriptions..."), group: '1_patterns', order: 2, agent: true },
	{ menu: OrchestrationMenu, id: 'pollis.orchestration.race', title: localize('orchestration.race', "Race..."), group: '1_patterns', order: 3, agent: true },
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

// Reports: a notebook (a workflow, a notebook tutorial or the user's own) as a LaTeX report or as slides, see reports.ts
MenuRegistry.appendMenuItem(ReportsMenu, {
	group: '1_notebook',
	command: { id: EXPORT_NOTEBOOK_LATEX_COMMAND_ID, title: localize('reports.notebookLatex', "Export Notebook as LaTeX...") },
	order: 1,
});
MenuRegistry.appendMenuItem(ReportsMenu, {
	group: '1_notebook',
	command: { id: MAKE_NOTEBOOK_SLIDES_COMMAND_ID, title: localize('reports.notebookSlides', "Make Slides from a Notebook...") },
	order: 2,
});
MenuRegistry.appendMenuItem(ReportsMenu, {
	group: '2_agent',
	command: { id: POLISH_REPORT_COMMAND_ID, title: localize('reports.polish', "Polish with Agent..."), icon: agentIcon },
	order: 1,
});

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
		command: { id: item.id, title: item.title, icon: item.agent ? agentIcon : undefined },
		order: item.order,
	});
}



// ==============================================================
// SUBMENU: Collaboration
// ==============================================================

// Live sessions between Pollis users (roadmap phase 5, internal-reports/collaboration-spec.md),
// and later classrooms and simulation games (phase 13) on the same session layer.
// Built so far (collaboration/): sessions, the chat and Test Connection; each other item says it is not
// built yet. Share My Editor and Copy to My Editor are not here: they will be buttons below the editors.
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
	if (!IMPLEMENTED_COLLABORATION_COMMANDS.has(item.id)) {
		CommandsRegistry.registerCommand(item.id, accessor => {
			accessor.get(INotificationService).info(localize('collaboration.notYetImplemented', "{0}: Not yet implemented", item.title.replace(/\.\.\.$/, '')));
		});
	}
	MenuRegistry.appendMenuItem(item.menu, {
		group: item.group,
		command: { id: item.id, title: item.title },
		order: item.order,
	});
}
