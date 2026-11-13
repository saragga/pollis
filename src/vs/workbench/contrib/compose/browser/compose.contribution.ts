/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../vs/nls.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { PDF_VIEWER_OPEN_IN_MODE_COMMAND_ID } from '../../../common/pdfViewer.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import './toolboxExtensions.js';
import './toolboxPanelsPage.js';
import './askPollisPage.js';
import { COMPARE_EMBEDDINGS_COMMAND_ID } from './compareEmbeddingsPage.js';
import { COMPARE_RERANKERS_COMMAND_ID } from './compareRerankersPage.js';
import { MODEL_BENCHMARKS_COMMAND_ID } from './modelBenchmarksPage.js';
import { RETRIEVAL_BENCHMARKS_COMMAND_ID } from './retrievalBenchmarksPage.js';
import { RAG_COMMAND_ID } from './ragPage.js';
import { KNOWLEDGE_BASE_COMMAND_ID } from './knowledgeBasePage.js';
import { ANSWERING_STRATEGIES_COMMAND_ID } from './answeringStrategiesPage.js';
import { COMPARE_MODELS_COMMAND_ID } from './compareModelsPage.js';
import './askPollisStrategiesService.js';
import './askPollisSources.js';
import { BROWSE_SKILLS_COMMAND_ID, CHOOSE_AGENT_COMMAND_ID, CREATE_PANEL_COMMAND_ID, CREATE_PANELS_FROM_REQUEST_COMMAND_ID, PACKAGE_TOOLBOX_COMMAND_ID } from './pollisAgents.js';
import { BROWSE_METHODS_COMMAND_ID, CREATE_METHOD_COMMAND_ID } from './newMethods.js';
import { REPLICATE_ARTICLE_COMMAND_ID } from './replicateArticle.js';
import { SPEED_UP_COMMAND_ID } from './speedUpPage.js';
import './codingAgentPage.js';
import './modelRoutingPage.js';
import './pollisContent.js';
import './pollisUpdate.js';
import './pollisDataPackages.js';
import './vignettesPage.js';
import './toolboxDocumentsPage.js';
import './panelWikisPage.js';
import { MODELS_INSTALLED_COMMAND_ID } from '../common/askPollis.js';
import './modelsInstalledPage.js';
import './mcpServersPage.js';
import { MCP_SERVERS_COMMAND_ID } from '../common/mcpServers.js';
import { MODEL_ROUTING_COMMAND_ID } from './modelRouting.js';
import { BROWSE_OPERATIONAL_WORKFLOWS_COMMAND_ID } from './operationalWorkflows.js';
import { EXPORT_NOTEBOOK_LATEX_COMMAND_ID, MAKE_NOTEBOOK_SLIDES_COMMAND_ID, POLISH_REPORT_COMMAND_ID } from './reports.js';
// Practise a Topic and Write an Exercise: in the Command Palette only, the menus are now the Self-Study: Learn and Practise toolbox
import './practice.js';
import { IMPLEMENTED_COLLABORATION_COMMANDS } from './collaboration/collaboration.contribution.js';
import { PUBLISHED_BENCHMARKS_COMMAND_ID, SEARCH_WORKFLOW_LIBRARY_COMMAND_ID } from './workflowLibrary.js';
import { IMPORT_REFERENCES_COMMAND_ID, LITERATURE_RADAR_COMMAND_ID } from './literatureRadarPage.js';
import { BROWSE_REFERENCES_COMMAND_ID } from './browseReferencesPage.js';
import { SNOWBALL_SEARCH_COMMAND_ID } from '../common/snowballSearch.js';
import './snowballSearchPage.js';
import { openScaffoldWebview } from '../../model/browser/commands/scaffold.command.js';
import { TIMEFUNCTION_PANEL } from '../../model/browser/commands/timeFunction.command.js';
import { FINDALLOCS_PANEL } from '../../model/browser/commands/findAllocs.command.js';
import { TYPESTABILITY_PANEL } from '../../model/browser/commands/typeStability.command.js';
import { LOADTIME_PANEL } from '../../model/browser/commands/loadTime.command.js';
import { SPEEDRACE_PANEL } from '../../model/browser/commands/speedRace.command.js';
import { PKGVERSIONS_PANEL } from '../../model/browser/commands/pkgVersions.command.js';
import { TIMESECTIONS_PANEL } from '../../model/browser/commands/timeSections.command.js';
import { ADDLANGUAGE_PANEL } from '../../model/browser/commands/addLanguage.command.js';
import { PROFILETIME_PANEL } from '../../model/browser/commands/profileTime.command.js';
import { PROPERTYCHECK_PANEL } from '../../model/browser/commands/propertyCheck.command.js';
import { SAVEDRESULTS_PANEL } from '../../model/browser/commands/savedResults.command.js';
import { CONVERGENCEORDER_PANEL } from '../../model/browser/commands/convergenceOrder.command.js';
import { MIXCOMPILED_PANEL } from '../../model/browser/commands/mixCompiled.command.js';
import { SHAREDLIB_PANEL } from '../../model/browser/commands/sharedLib.command.js';

// The Core Mathematics, Finance and Economics Toolboxes come from their extensions (toolboxes/pollis-toolbox-*, not built in:
// installed from the Toolboxes section of the Extensions pane), see toolboxExtensions.ts

const NewPanelsMenu = new MenuId('menubarNewPanelsMenu');
const OrchestrationMenu = new MenuId('menubarOrchestrationMenu');
// Formerly Explore > Access Model Repositories: the id stays, for the panel index and Pollis Views
const LocalModelsMenu = new MenuId('menubarAMRSubmenu');
const KnowledgeMenu = new MenuId('menubarKnowledgeMenu');
const ReportsMenu = new MenuId('menubarReportsMenu');
const ReplicationMenu = new MenuId('menubarReplicationMenu');
const WorkflowsMenu = new MenuId('menubarWorkflowsMenu');
const BROWSE_WORKFLOWS_COMMAND_ID = 'pollis.workflows.browse';
const EXTRACT_WORKFLOW_COMMAND_ID = 'pollis.workflows.extract';
const COMBINE_WORKFLOWS_COMMAND_ID = 'pollis.workflows.combine';
const CREATE_OPERATIONAL_WORKFLOW_COMMAND_ID = 'pollis.workflows.createOperational';
const AUTOMATIONS_COMMAND_ID = 'pollis.workflows.automations';
const CorrectnessMenu = new MenuId('menubarCorrectnessMenu');
const ComparisonsMenu = new MenuId('menubarComparisonsMenu');
const CompileGaloreMenu = new MenuId('menubarCompileGaloreMenu');
const CollaborationMenu = new MenuId('menubarCollaborationMenu');
const LiteratureMenu = new MenuId('menubarLiteratureMenu');
const PdfFilesMenu = new MenuId('menubarPdfFilesMenu');

// ------------------- COMPOSE ------------------------

// The Compose menu: Coding Agents and Agent Skills (codingAgentPage.ts, pollisAgents.ts), MCP Servers (mcpServersPage.ts), Orchestration, Local AI Models, Knowledge for AI Models, New Panels and Package a Toolbox, Literature (Discover Literature, Import References, Browse References), Replication, with the article methods, Workflows, Reports, PDF Files,
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
	title: localize('pollisLocalModels.menu', "Local AI Models"),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '1_compose',
	submenu: KnowledgeMenu,
	title: localize('pollisKnowledge.menu', "Knowledge for AI Models"),
	order: 1.5,
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

// New Panels and Package a Toolbox..., in a group of their own between separators
MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '1_panels',
	submenu: NewPanelsMenu,
	title: localize('pollisNewPanels.menu', "New Panels"),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '1_panels',
	command: { id: PACKAGE_TOOLBOX_COMMAND_ID, title: localize('pollisAgents.packageToolbox', "Package a Toolbox...") },
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_compose',
	submenu: LiteratureMenu,
	title: localize('compose.literature', "Literature Radar"),
	order: 1.5,
});

// The articles that stand out on a topic, searched in OpenAlex and Semantic Scholar (literatureRadarPage.ts)
MenuRegistry.appendMenuItem(LiteratureMenu, {
	group: '1_literature',
	command: { id: LITERATURE_RADAR_COMMAND_ID, title: localize('compose.discoverLiterature', "Discover Literature...") },
	order: 1,
});

// References the user brings, from BibTeX, RIS, CSL-JSON or a list of DOIs, looked up in OpenAlex and Semantic Scholar or not (literatureRadarPage.ts)
MenuRegistry.appendMenuItem(LiteratureMenu, {
	group: '1_literature',
	command: { id: IMPORT_REFERENCES_COMMAND_ID, title: localize('compose.importReferences', "Import References...") },
	order: 1.5,
});

// Every work in PollisReferences, where the user removes their own, undoes a correction or shows a work in a panel (browseReferencesPage.ts)
MenuRegistry.appendMenuItem(LiteratureMenu, {
	group: '1_literature',
	command: { id: BROWSE_REFERENCES_COMMAND_ID, title: localize('compose.browseReferences', "Browse References...") },
	order: 2,
});

// From a few seeds, the works their citations lead to, ranked in one pool, and the record of the steps (snowballSearchPage.ts)
MenuRegistry.appendMenuItem(LiteratureMenu, {
	group: '1_literature',
	command: { id: SNOWBALL_SEARCH_COMMAND_ID, title: localize('compose.snowballSearchMap', "Snowball Search Map") },
	order: 3,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_compose',
	submenu: ReplicationMenu,
	title: localize('pollisReplication.menu', "Replication"),
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_compose',
	submenu: ReportsMenu,
	title: localize('pollisReports.menu', "Reports"),
	order: 4,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_compose',
	submenu: WorkflowsMenu,
	title: localize('pollisWorkflows.menu', 'Workflows'),
	order: 6,
});


// Explore > PDF Files, below Access Files (explore.contribution.ts), with its items below
MenuRegistry.appendMenuItem(MenuId.MenubarExploreMenu, {
	group: '1_explore',
	submenu: PdfFilesMenu,
	title: localize('compose.pdfFiles', "PDF Files"),
	order: 5,
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

// ==============================================================
// SUBMENU: PDF Files, the PDF Viewer (extensions/pdf-viewer) opened for a task: on the PDF shown, else on the sample
// of PollisDatasets. Every item opens the same viewer, with Select Area, Print and Save
// ==============================================================

const PDF_READ_COMMAND_ID = 'chiara.compose.pdf.read';
const PDF_EXTRACT_COMMAND_ID = 'chiara.compose.pdf.extract';
const PDF_MERGE_COMMAND_ID = 'chiara.compose.pdf.merge';
const PDF_CROP_COMMAND_ID = 'chiara.compose.pdf.crop';
const PDF_CONVERT_COMMAND_ID = 'chiara.compose.pdf.convert';
const PDF_HIGHLIGHT_COMMAND_ID = 'chiara.compose.pdf.highlight';
const PDF_TEXT_COMMAND_ID = 'chiara.compose.pdf.text';
const PDF_IMAGE_COMMAND_ID = 'chiara.compose.pdf.image';
const PDF_DRAW_COMMAND_ID = 'chiara.compose.pdf.draw';

// Each command and the mode the viewer opens in: the outline, a tool of the sidebar, Select Area, or a markup tool of pdf.js
for (const [id, mode] of [
	[PDF_READ_COMMAND_ID, 'read'],
	[PDF_EXTRACT_COMMAND_ID, 'extract'],
	[PDF_MERGE_COMMAND_ID, 'merge'],
	[PDF_CROP_COMMAND_ID, 'crop'],
	[PDF_CONVERT_COMMAND_ID, 'convert'],
	[PDF_HIGHLIGHT_COMMAND_ID, 'highlight'],
	[PDF_TEXT_COMMAND_ID, 'text'],
	[PDF_IMAGE_COMMAND_ID, 'image'],
	[PDF_DRAW_COMMAND_ID, 'draw'],
] as const) {
	CommandsRegistry.registerCommand(id, (accessor: ServicesAccessor) => accessor.get(ICommandService).executeCommand(PDF_VIEWER_OPEN_IN_MODE_COMMAND_ID, mode));
}

MenuRegistry.appendMenuItem(PdfFilesMenu, {
	group: '1_pdf',
	command: { id: PDF_READ_COMMAND_ID, title: localize('compose.pdfRead', "Read") },
	order: 1,
});

// The pages given, such as 1-3, 7, in one new PDF, or one file per page or per range
MenuRegistry.appendMenuItem(PdfFilesMenu, {
	group: '1_pdf',
	command: { id: PDF_EXTRACT_COMMAND_ID, title: localize('compose.pdfExtractPages', "Extract Pages") },
	order: 2,
});

// This PDF and others, in one file
MenuRegistry.appendMenuItem(PdfFilesMenu, {
	group: '1_pdf',
	command: { id: PDF_MERGE_COMMAND_ID, title: localize('compose.pdfMergePages', "Merge Pages") },
	order: 3,
});

// Select Area on: the text, the table or the picture of an area, or the area as a PDF
MenuRegistry.appendMenuItem(PdfFilesMenu, {
	group: '1_pdf',
	command: { id: PDF_CROP_COMMAND_ID, title: localize('compose.pdfCropArea', "Crop Area") },
	order: 4,
});

// Pages as SVG, PostScript, EPS, HTML or XML, or the area as PDF
MenuRegistry.appendMenuItem(PdfFilesMenu, {
	group: '1_pdf',
	command: { id: PDF_CONVERT_COMMAND_ID, title: localize('compose.pdfConvert', "Convert") },
	order: 5,
});

// The markup tools of pdf.js, saved in a new PDF with Save
MenuRegistry.appendMenuItem(PdfFilesMenu, {
	group: '2_markup',
	command: { id: PDF_HIGHLIGHT_COMMAND_ID, title: localize('compose.pdfHighlight', "Highlight") },
	order: 1,
});

MenuRegistry.appendMenuItem(PdfFilesMenu, {
	group: '2_markup',
	command: { id: PDF_TEXT_COMMAND_ID, title: localize('compose.pdfAddEditText', "Add or Edit Text") },
	order: 2,
});

MenuRegistry.appendMenuItem(PdfFilesMenu, {
	group: '2_markup',
	command: { id: PDF_IMAGE_COMMAND_ID, title: localize('compose.pdfImages', "Add or Edit Images") },
	order: 3,
});

MenuRegistry.appendMenuItem(PdfFilesMenu, {
	group: '2_markup',
	command: { id: PDF_DRAW_COMMAND_ID, title: localize('compose.pdfDraw', "Draw") },
	order: 4,
});

// ==============================================================
// SUBMENU: New Panels, the tasks a coding agent does to write panels (pollisAgents.ts); Package a Toolbox... is in
// the Compose menu itself, below it
// ==============================================================

MenuRegistry.appendMenuItem(NewPanelsMenu, {
	group: '1_panels',
	command: { id: CREATE_PANEL_COMMAND_ID, title: localize('pollisAgents.createPanel', "Create a Panel...") },
	order: 1,
});

MenuRegistry.appendMenuItem(NewPanelsMenu, {
	group: '1_panels',
	command: { id: CREATE_PANELS_FROM_REQUEST_COMMAND_ID, title: localize('pollisAgents.createPanelsFromRequest', "Create Panels from a Request...") },
	order: 2,
});


// ==============================================================
// SUBMENU: Local AI Models, the models to download (the panels of explore.contribution.ts) and the
// models on this computer (modelsInstalledPage.ts)
// ==============================================================

MenuRegistry.appendMenuItem(LocalModelsMenu, {
	group: '1_models',
	command: { id: 'chiara.explore.hfm', title: localize('ds.hf', "Get Models from Hugging Face") },
	order: 1,
}); // HuggingFaceHub.jl, https://huggingface.co/models

MenuRegistry.appendMenuItem(LocalModelsMenu, {
	group: '1_models',
	command: { id: 'chiara.explore.kgm', title: localize('ds.km', "Get Models from Kaggle") },
	order: 2,
}); // https://www.kaggle.com/models

MenuRegistry.appendMenuItem(LocalModelsMenu, {
	group: '1_models',
	command: { id: MODELS_INSTALLED_COMMAND_ID, title: localize('modelsInstalled.menu', "Set Active Models") },
	order: 3,
});

// The chat models installed and the cloud models, compared on the questions of Ask Pollis (compareModelsPage.ts)
MenuRegistry.appendMenuItem(LocalModelsMenu, {
	group: '2_compare',
	command: { id: COMPARE_MODELS_COMMAND_ID, title: localize('compareModels.menu', "Evaluate Answering Models...") },
	order: 1,
});

// The chat models installed, run on published benchmarks, on a stratified sample of their questions (modelBenchmarksPage.ts)
MenuRegistry.appendMenuItem(LocalModelsMenu, {
	group: '2_compare',
	command: { id: MODEL_BENCHMARKS_COMMAND_ID, title: localize('modelBenchmarks.menu', "Benchmark Answering Models...") },
	order: 2,
});



// ==============================================================
// SUBMENU: Knowledge for AI Models, the documents a model, local or cloud, answers from
// ==============================================================

// Retrieval-Augmented Generation, the collections of documents a model answers from (ragPage.ts)
MenuRegistry.appendMenuItem(KnowledgeMenu, {
	group: '1_knowledge',
	command: { id: RAG_COMMAND_ID, title: localize('pollisRag.menu', "Retrieval-Augmented Generation") },
	order: 1,
});

// The Knowledge Base, the openly licensed texts of PollisKnowledge.jl a model answers from (knowledgeBasePage.ts)
MenuRegistry.appendMenuItem(KnowledgeMenu, {
	group: '1_knowledge',
	command: { id: KNOWLEDGE_BASE_COMMAND_ID, title: localize('knowledgeBase.menu', "Knowledge Base") },
	order: 1.5,
});

// The strategies of Ask Pollis, the ways it finds the passages and answers from them (answeringStrategiesPage.ts)
MenuRegistry.appendMenuItem(KnowledgeMenu, {
	group: '1_knowledge',
	command: { id: ANSWERING_STRATEGIES_COMMAND_ID, title: localize('answeringStrategies.menu', "Ask Pollis Strategies") },
	order: 2,
});

// The embedding models installed, compared on the questions of Ask Pollis (compareEmbeddingsPage.ts)
MenuRegistry.appendMenuItem(KnowledgeMenu, {
	group: '2_evaluate',
	command: { id: COMPARE_EMBEDDINGS_COMMAND_ID, title: localize('compareEmbeddings.menu', "Evaluate Embedding Models...") },
	order: 1,
});

// The rerankers installed, compared on the questions of Ask Pollis (compareRerankersPage.ts)
MenuRegistry.appendMenuItem(KnowledgeMenu, {
	group: '2_evaluate',
	command: { id: COMPARE_RERANKERS_COMMAND_ID, title: localize('compareRerankers.menu', "Evaluate Reranking Models...") },
	order: 2,
});

// The embedding models and rerankers installed, run on the retrieval benchmarks of PollisBenchmarks (retrievalBenchmarksPage.ts)
MenuRegistry.appendMenuItem(KnowledgeMenu, {
	group: '2_evaluate',
	command: { id: RETRIEVAL_BENCHMARKS_COMMAND_ID, title: localize('retrievalBenchmarks.menu', "Benchmark Embedding and Reranking Models...") },
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
	order: 2,
});

/** The precondition of a menu item not built yet: never met, so the menu shows the item greyed out, as macOS does. */
const NOT_YET_AVAILABLE = ContextKeyExpr.false();

// A replication made from its article, step by step (replicateArticle.ts)
MenuRegistry.appendMenuItem(ReplicationMenu, {
	group: '1_replication',
	command: { id: REPLICATE_ARTICLE_COMMAND_ID, title: localize('replication.replicateArticle', "Replicate an Article...") },
	order: 1,
});

// Article methods, below a separator and in the same order, making one first: methods no Julia package has, each from an article, tested on its data against its
// published tables (newMethods.ts; Browse Article Methods is in workflowLibrary.ts). Create Article Method opens the page
// of a new method, with its five steps; Browse Article Methods lists the user's methods, to go on with one, and the library.
MenuRegistry.appendMenuItem(ReplicationMenu, {
	group: '2_methods',
	command: { id: CREATE_METHOD_COMMAND_ID, title: localize('newMethods.newMethod', "Create Article Method...") },
	order: 1,
});

MenuRegistry.appendMenuItem(ReplicationMenu, {
	group: '2_methods',
	command: { id: BROWSE_METHODS_COMMAND_ID, title: localize('newMethods.library', "Browse Article Methods...") },
	order: 2,
});

// ==============================================================
// SUBMENU: Workflows
// ==============================================================

// A workflow is a flat set of procedures, each with its inputs, its outputs and what it runs: extracted from
// a replication or a notebook, and combined with others, the independent ones run side by side. Not built yet.
// Operational workflows do a job on the user's own work, such as a notebook made into a report (operationalWorkflows.ts)
MenuRegistry.appendMenuItem(WorkflowsMenu, {
	group: '1_build',
	command: { id: BROWSE_WORKFLOWS_COMMAND_ID, title: localize('workflows.browse', "Browse Workflows..."), precondition: NOT_YET_AVAILABLE },
	order: 1,
});

MenuRegistry.appendMenuItem(WorkflowsMenu, {
	group: '1_build',
	command: { id: EXTRACT_WORKFLOW_COMMAND_ID, title: localize('workflows.extract', "Extract a Workflow..."), precondition: NOT_YET_AVAILABLE },
	order: 2,
});

MenuRegistry.appendMenuItem(WorkflowsMenu, {
	group: '1_build',
	command: { id: COMBINE_WORKFLOWS_COMMAND_ID, title: localize('workflows.combine', "Combine Workflows..."), precondition: NOT_YET_AVAILABLE },
	order: 3,
});

MenuRegistry.appendMenuItem(WorkflowsMenu, {
	group: '2_operational',
	command: { id: BROWSE_OPERATIONAL_WORKFLOWS_COMMAND_ID, title: localize('operationalWorkflows.browse', "Browse Operational Workflows...") },
	order: 1,
});

MenuRegistry.appendMenuItem(WorkflowsMenu, {
	group: '2_operational',
	command: { id: CREATE_OPERATIONAL_WORKFLOW_COMMAND_ID, title: localize('operationalWorkflows.create', "Create Operational Workflow..."), precondition: NOT_YET_AVAILABLE },
	order: 2,
});
// Not built yet

// Agent sessions run on a schedule, as in the Automations page of VS Code's Agents window. Not in
// Code - OSS 1.117.0: it comes with the rebase
MenuRegistry.appendMenuItem(WorkflowsMenu, {
	group: '3_automations',
	command: { id: AUTOMATIONS_COMMAND_ID, title: localize('workflows.automations', "Automations..."), precondition: NOT_YET_AVAILABLE },
	order: 1,
});



// ==============================================================
// SUBMENU: Correctness Tests, in two groups: against known values (Published Benchmarks, Compare with Saved Results) and against properties (Check a Property, Check a Convergence Order)
// ==============================================================

CommandsRegistry.registerCommand('pollis.correctness.propertyCheck', (accessor: ServicesAccessor) => openScaffoldWebview(accessor, PROPERTYCHECK_PANEL));
CommandsRegistry.registerCommand('pollis.correctness.savedResults', (accessor: ServicesAccessor) => openScaffoldWebview(accessor, SAVEDRESULTS_PANEL));
CommandsRegistry.registerCommand('pollis.correctness.convergenceOrder', (accessor: ServicesAccessor) => openScaffoldWebview(accessor, CONVERGENCEORDER_PANEL));

MenuRegistry.appendMenuItem(CorrectnessMenu, {
	group: '1_known',
	command: { id: PUBLISHED_BENCHMARKS_COMMAND_ID, title: localize('correctness.publishedBenchmarks', "Published Benchmarks") },
	order: 1,
});

MenuRegistry.appendMenuItem(CorrectnessMenu, {
	group: '1_known',
	command: { id: 'pollis.correctness.savedResults', title: localize('correctness.savedResults', "Compare with Saved Results...") },
	order: 2,
});

MenuRegistry.appendMenuItem(CorrectnessMenu, {
	group: '2_properties',
	command: { id: 'pollis.correctness.propertyCheck', title: localize('correctness.propertyCheck', "Check a Property...") },
	order: 1,
});

MenuRegistry.appendMenuItem(CorrectnessMenu, {
	group: '2_properties',
	command: { id: 'pollis.correctness.convergenceOrder', title: localize('correctness.convergenceOrder', "Check a Convergence Order...") },
	order: 2,
});

// ==============================================================

// Model Tasks and Routing: the tier, and so the model, each agent task runs on, see modelRouting.ts
MenuRegistry.appendMenuItem(OrchestrationMenu, {
	group: '0_routing',
	command: { id: MODEL_ROUTING_COMMAND_ID, title: localize('orchestration.modelRouting', "Model Tasks and Routing") },
	order: 1,
});

// ==============================================================
// SUBMENU: Profiling, in four groups: measure (Time a Function, Find Where the Time Goes, Time Sections of Code), diagnose and fix (Find Allocations,
// Check Type Stability, Speed Up a Function), packages (Compare Package Versions, Load and Compile Time) and languages (Run a Speed Race, Add a Language)
// ==============================================================

CommandsRegistry.registerCommand('pollis.profiling.timeFunction', (accessor: ServicesAccessor) => openScaffoldWebview(accessor, TIMEFUNCTION_PANEL));
CommandsRegistry.registerCommand('pollis.profiling.profileTime', (accessor: ServicesAccessor) => openScaffoldWebview(accessor, PROFILETIME_PANEL));
CommandsRegistry.registerCommand('pollis.profiling.findAllocs', (accessor: ServicesAccessor) => openScaffoldWebview(accessor, FINDALLOCS_PANEL));
CommandsRegistry.registerCommand('pollis.profiling.typeStability', (accessor: ServicesAccessor) => openScaffoldWebview(accessor, TYPESTABILITY_PANEL));
CommandsRegistry.registerCommand('pollis.profiling.loadTime', (accessor: ServicesAccessor) => openScaffoldWebview(accessor, LOADTIME_PANEL));
CommandsRegistry.registerCommand('pollis.profiling.speedRace', (accessor: ServicesAccessor) => openScaffoldWebview(accessor, SPEEDRACE_PANEL));
CommandsRegistry.registerCommand('pollis.profiling.pkgVersions', (accessor: ServicesAccessor) => openScaffoldWebview(accessor, PKGVERSIONS_PANEL));
CommandsRegistry.registerCommand('pollis.profiling.timeSections', (accessor: ServicesAccessor) => openScaffoldWebview(accessor, TIMESECTIONS_PANEL));
CommandsRegistry.registerCommand('pollis.profiling.addLanguage', (accessor: ServicesAccessor) => openScaffoldWebview(accessor, ADDLANGUAGE_PANEL));

MenuRegistry.appendMenuItem(ComparisonsMenu, {
	group: '1_measure',
	command: { id: 'pollis.profiling.timeFunction', title: localize('profiling.timeFunction', "Time a Function...") },
	order: 1,
});

MenuRegistry.appendMenuItem(ComparisonsMenu, {
	group: '1_measure',
	command: { id: 'pollis.profiling.profileTime', title: localize('profiling.profileTime', "Find Where the Time Goes...") },
	order: 2,
});

MenuRegistry.appendMenuItem(ComparisonsMenu, {
	group: '1_measure',
	command: { id: 'pollis.profiling.timeSections', title: localize('profiling.timeSections', "Time Sections of Code...") },
	order: 3,
});

MenuRegistry.appendMenuItem(ComparisonsMenu, {
	group: '2_diagnose',
	command: { id: 'pollis.profiling.findAllocs', title: localize('profiling.findAllocs', "Find Allocations...") },
	order: 1,
});

MenuRegistry.appendMenuItem(ComparisonsMenu, {
	group: '2_diagnose',
	command: { id: 'pollis.profiling.typeStability', title: localize('profiling.typeStability', "Check Type Stability...") },
	order: 2,
});

MenuRegistry.appendMenuItem(ComparisonsMenu, {
	group: '2_diagnose',
	command: { id: SPEED_UP_COMMAND_ID, title: localize('profiling.speedUp', "Speed Up a Function...") },
	order: 3,
});

MenuRegistry.appendMenuItem(ComparisonsMenu, {
	group: '3_packages',
	command: { id: 'pollis.profiling.pkgVersions', title: localize('profiling.pkgVersions', "Compare Package Versions...") },
	order: 1,
});

MenuRegistry.appendMenuItem(ComparisonsMenu, {
	group: '3_packages',
	command: { id: 'pollis.profiling.loadTime', title: localize('profiling.loadTime', "Load and Compile Time...") },
	order: 2,
});

MenuRegistry.appendMenuItem(ComparisonsMenu, {
	group: '4_race',
	command: { id: 'pollis.profiling.speedRace', title: localize('profiling.speedRace', "Run a Speed Race...") },
	order: 1,
});

MenuRegistry.appendMenuItem(ComparisonsMenu, {
	group: '4_race',
	command: { id: 'pollis.profiling.addLanguage', title: localize('profiling.addLanguage', "Add a Language...") },
	order: 2,
});

// Compilation Lab, in two groups: Compile Julia (1_compile: a shared library, an executable) and Other Languages
// (2_languages: Julia mixed with compiled code, Julia translated to Rust). The items not built yet are in composeItems below
CommandsRegistry.registerCommand('pollis.compilation.sharedLibrary', (accessor: ServicesAccessor) => openScaffoldWebview(accessor, SHAREDLIB_PANEL));
CommandsRegistry.registerCommand('pollis.compilation.mix', (accessor: ServicesAccessor) => openScaffoldWebview(accessor, MIXCOMPILED_PANEL));

MenuRegistry.appendMenuItem(CompileGaloreMenu, {
	group: '1_compile',
	command: { id: 'pollis.compilation.sharedLibrary', title: localize('compilation.sharedLibrary', "Compile Julia to a Shared Library...") },
	order: 1,
});

MenuRegistry.appendMenuItem(CompileGaloreMenu, {
	group: '2_languages',
	command: { id: 'pollis.compilation.mix', title: localize('compilation.mix', "Mix Julia with Compiled Code...") },
	order: 1,
});

// Not built yet: each item says so.
// Orchestration: coding agents working together. Writer and Checker: one writes, another checks; Two
// Independent Transcriptions: two agents type the same table from an article and the differences are shown;
// Race: several agents do the same task and the results are compared.
const composeItems = [
	{ menu: OrchestrationMenu, id: 'pollis.orchestration.writerChecker', title: localize('orchestration.writerChecker', "Writer and Checker..."), group: '1_patterns', order: 1 },
	{ menu: OrchestrationMenu, id: 'pollis.orchestration.twoTranscriptions', title: localize('orchestration.twoTranscriptions', "Two Independent Transcriptions..."), group: '1_patterns', order: 2 },
	{ menu: OrchestrationMenu, id: 'pollis.orchestration.race', title: localize('orchestration.race', "Race..."), group: '1_patterns', order: 3 },
	{ menu: CompileGaloreMenu, id: 'chiara.statistics.comp_ex', title: localize('comp.ex', "Compile Julia to an Executable..."), group: '1_compile', order: 2 },
	{ menu: CompileGaloreMenu, id: 'chiara.statistics.comp_tr', title: localize('comp.tr', "Translate Julia to Rust..."), group: '2_languages', order: 2 },
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
	command: { id: POLISH_REPORT_COMMAND_ID, title: localize('reports.polish', "Polish with Agent...") },
	order: 1,
});

for (const item of composeItems) {
	MenuRegistry.appendMenuItem(item.menu, {
		group: item.group,
		command: { id: item.id, title: item.title, precondition: NOT_YET_AVAILABLE },
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
	MenuRegistry.appendMenuItem(item.menu, {
		group: item.group,
		command: { id: item.id, title: item.title, precondition: IMPLEMENTED_COLLABORATION_COMMANDS.has(item.id) ? undefined : NOT_YET_AVAILABLE },
		order: item.order,
	});
}
