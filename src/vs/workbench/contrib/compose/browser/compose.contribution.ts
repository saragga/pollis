/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../vs/nls.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { IsSessionsWindowContext } from '../../../common/contextkeys.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { openKaimonWebview } from './kaimon.js';

const COMPOSE_COMMAND_ID = 'workbench.action.showCompose';
const FEATURE_REQUEST_COMMAND_ID = 'pollis.action.openFeatureRequestReporter';
const KAIMON_COMMAND_ID = 'pollis.action.openKaimon';

CommandsRegistry.registerCommand(COMPOSE_COMMAND_ID, () => {
	console.log('Compose command executed!');
});

CommandsRegistry.registerCommand(FEATURE_REQUEST_COMMAND_ID, accessor => {
	return accessor.get(ICommandService).executeCommand('workbench.action.openIssueReporter', { issueType: 2 });
});

CommandsRegistry.registerCommand(KAIMON_COMMAND_ID, (accessor: ServicesAccessor) => {
	openKaimonWebview(
		accessor.get(IWebviewWorkbenchService),
		accessor.get(ICommandService),
	);
});

// Submenus
const ConsultSubmenuId = new MenuId('menubarConsultSubmenu');
const SkillsSubmenuId = new MenuId('menubarSkillsSubmenu');
const AgentsSubmenuId = new MenuId('menubarAgentsSubmenu');
const TrainSubmenuId = new MenuId('menubarTrainSubmenu');
const MCPSubmenuId = new MenuId('menubarMCPSubmenu');


// ============================================
// MENU GROUP 1: WELCOME
// ============================================

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '1_welcome',
	command: { id: 'workbench.action.openWalkthrough', title: localize('welcome.welcome', 'Welcome') },
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '1_welcome',
	command: { id: 'workbench.action.docs', title: localize('welcome.docs', 'Documentation') },
	order: 2,
}); // See Stata

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '1_welcome',
	command: { id: 'welcome.showAllWalkthroughs', title: localize('welcome.showAllWalkthroughs', 'Open Walkthrough') },
	order: 3,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '1_welcome',
	submenu: TrainSubmenuId,
	title: localize('welcome.train', 'Training'),
	order: 5,
}); // See Stata

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '1_welcome',
	submenu: ConsultSubmenuId,
	title: localize('welcome.consult', 'Consult AI'),
	order: 6,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '1_welcome',
	command: {
		id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(),
	title: localize('welcome.colab', 'Collaborate'),},
	order: 7,
});


// ============================================
// MENU GROUP 2: AI COMPOSITION
// ============================================

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_ai',
	submenu: AgentsSubmenuId,
	title: localize('compose.agents', 'Coding Agents'),
	order: 1,
}); // Coding agents are autonomous AI systems that plan, reason, and execute multi-step software engineering tasks — reading and writing files, running commands, searching codebases, and invoking external tools. Unlike chat assistants, they operate with a degree of autonomy: given a goal, an agent breaks it into steps, acts on the environment, observes the results, and iterates until the task is complete.

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_ai',
	submenu: SkillsSubmenuId,
	title: localize('compose.skills', 'Skills'),
	order: 2,
}); // Skills are named, reusable instruction sets that AI agents activate for specific tasks — encoding domain knowledge, preferred workflows, and behavioural guidelines. Each skill defines when it applies, what context to load, and how the agent should behave, allowing a general-purpose model to specialise on demand without retraining.

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_ai',
	submenu: MCPSubmenuId,
	title: localize('compose.mpc', 'Model Context Protocol Servers'),
	order: 3,
}); // MCP Servers expose tools, resources, and prompts that AI models can use to interact with external systems — databases, APIs, file systems, and local applications — through a standardised protocol. By connecting to these servers, models can take actions, retrieve live data, and execute workflows beyond their training context.

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_ai',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('compose.rag', 'Knowledge Retrieval') },
	order: 4,
}); // RAGTools.jl, DocsScraper.jl

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_ai',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('compose.ft', 'Fine-Tune Model') },
	order: 5,
});

// ============================================
// MENU GROUP 3: TASKS
// ============================================

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '3_tasks',
	submenu: MenuId.MenubarTerminalMenu,
	title: localize('compose.tasks', 'Tasks'),
	order: 1,
});

// ============================================
// MENU GROUP 4: PACKAGES & EXTENSIONS
// ============================================

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '4_pe',
	command: {
		id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('compose.packages', 'Create Julia Package'),
	},
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '4_pe',
	command: {
		id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('compose.themes', 'Create Menu Item and Webview'),
	},
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '4_pe',
	command: {
		id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('compose.extensions', 'Create Pollis Extension'),
	},
	order: 2,
});


// ============================================
// SUBMENU: TRAINING
// ============================================

MenuRegistry.appendMenuItem(TrainSubmenuId, {
	group: '1_train',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('train.netcourses', 'Net Courses') },
	order: 1,
}); // See Stata

MenuRegistry.appendMenuItem(TrainSubmenuId, {
	group: '1_train',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('train.classroom', 'Classroom and Net Training') },
	order: 2,
}); // See Stata

MenuRegistry.appendMenuItem(TrainSubmenuId, {
	group: '1_train',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('train.organisational', 'Organizational Training') },
	order: 3,
}); // See Stata

MenuRegistry.appendMenuItem(TrainSubmenuId, {
	group: '1_train',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('train.organisational', 'Video Tutorials') },
	order: 4,
}); // See Stata

MenuRegistry.appendMenuItem(TrainSubmenuId, {
	group: '1_train',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('train.organisational', 'Webinars') },
	order: 5,
}); // See Stata

MenuRegistry.appendMenuItem(TrainSubmenuId, {
	group: '1_train',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('train.organisational', 'Third-Party Courses') },
	order: 6,
}); // See Stata



// ============================================
// SUBMENU: CONSULT AI
// ============================================

MenuRegistry.appendMenuItem(ConsultSubmenuId, {
	group: '1_consult',
	command: { id: 'workbench.action.askVScode', title: localize('consult.ask', 'Ask @vscode') },
	order: 1,
	when: ContextKeyExpr.and(ContextKeyExpr.equals('chatSetupHidden', false), ContextKeyExpr.equals('chatSetupDisabledInWorkspace', false), IsSessionsWindowContext.negate()),
});

MenuRegistry.appendMenuItem(ConsultSubmenuId, {
	group: '1_consult',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('consult.repl', 'REPL AI Interface') },
	order: 2,
}); // Zana.jl


// ============================================
// SUBMENU: SKILLS
// ============================================

MenuRegistry.appendMenuItem(SkillsSubmenuId, {
	group: '1_skills',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('skills.jas', 'Julia Agent Skills') },
	order: 1,
}); // julia-agent-skills

MenuRegistry.appendMenuItem(SkillsSubmenuId, {
	group: '1_skills',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('skills.pws', 'Polis Webview Skill') },
	order: 2,
}); //

MenuRegistry.appendMenuItem(SkillsSubmenuId, {
	group: '1_skills',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('skills.dhas', 'Datasets Housekeeping Agent Skill') },
	order: 3,
}); //


// ============================================
// SUBMENU: Model Context Protocol (MCP)
// ============================================
// Kaimon is an MCP server that connects AI agents to a live Julia runtime. It exposes 32+ tools
// covering code execution, package introspection, debugging, testing, and semantic code search —
// allowing agents such as Claude Code or Cursor to read, run, and reason about Julia code in real
// time rather than generating it blindly.

MenuRegistry.appendMenuItem(MCPSubmenuId, {
	group: '1_agents',
	command: { id: KAIMON_COMMAND_ID, title: localize('compose.mpc.kaimon', 'Kaimon') },
	order: 1,
}); // https://github.com/kahliburke/Kaimon.jl — connects AI agents to a live Julia runtime



// ============================================
// SUBMENU: CODING AGENTS
// ============================================

MenuRegistry.appendMenuItem(AgentsSubmenuId, {
	group: '1_agents',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('compose.ca.op', 'OpencCode') },
	order: 1,
}); // https://github.com/anomalyco/opencode

MenuRegistry.appendMenuItem(AgentsSubmenuId, {
	group: '1_agents',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('compose.ca.gemmini', 'Gemini CLI') },
	order: 2,
}); //

MenuRegistry.appendMenuItem(AgentsSubmenuId, {
	group: '1_agents',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('compose.ca.claude', 'Claude Code') },
	order: 3,
}); //

MenuRegistry.appendMenuItem(AgentsSubmenuId, {
	group: '1_agents',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('compose.ca.openhands', 'OpenHands') },
	order: 4,
}); //

MenuRegistry.appendMenuItem(AgentsSubmenuId, {
	group: '1_agents',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('compose.ca.codex', 'CODEX') },
	order: 5,
}); //

MenuRegistry.appendMenuItem(AgentsSubmenuId, {
	group: '1_agents',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('compose.ca.cline', 'Cline') },
	order: 6,
}); //

MenuRegistry.appendMenuItem(AgentsSubmenuId, {
	group: '1_agents',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('compose.ca.aider', 'Aider') },
	order: 7,
}); //

MenuRegistry.appendMenuItem(AgentsSubmenuId, {
	group: '1_agents',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('compose.ca.goose', 'Goose') },
	order: 8,
}); //

MenuRegistry.appendMenuItem(AgentsSubmenuId, {
	group: '1_agents',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('compose.ca.continue', 'Continue') },
	order: 9,
}); //

MenuRegistry.appendMenuItem(AgentsSubmenuId, {
	group: '2_agents',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('compose.aoe', 'Agent Orchestration Engine') },
	order: 1,
});

