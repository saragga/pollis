/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../vs/nls.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { IsSessionsWindowContext } from '../../../common/contextkeys.js';

const COMPOSE_COMMAND_ID = 'workbench.action.showCompose';
const FEATURE_REQUEST_COMMAND_ID = 'pollis.action.openFeatureRequestReporter';

CommandsRegistry.registerCommand(COMPOSE_COMMAND_ID, () => {
	console.log('Compose command executed!');
});

CommandsRegistry.registerCommand(FEATURE_REQUEST_COMMAND_ID, accessor => {
	return accessor.get(ICommandService).executeCommand('workbench.action.openIssueReporter', { issueType: 2 });
});

// Submenus
const ConsultSubmenuId = new MenuId('menubarConsultSubmenu');
const SkillsSubmenuId = new MenuId('menubarSkillsSubmenu');
const AgentsSubmenuId = new MenuId('menubarAgentsSubmenu');
const TrainSubmenuId = new MenuId('menubarTrainSubmenu');
const ColabSubmenuId = new MenuId('menubarColabSubmenu');

// ============================================
// TOP MENU COMPOSE
// ============================================

//MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
//	group: '1_welcome',
//	command: { id: 'workbench.action.openWalkthrough', title: localize('welcome.welcome', 'Welcome') },
//	order: 1,
//}); // Moved to Pollis app menu (macOS)

//MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
//	group: '1_welcome',
//	submenu: ConsultSubmenuId,
//	title: localize('welcome.consult', 'Consult AI'),
//	order: 2,
//});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_welcome',
	command: {
		id: 'workbench.action.docs', precondition: ContextKeyExpr.false(),
		title: localize('welcome.docs', 'Pollis Documentation')
	},
	order: 3,
}); // See Stata

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '2_welcome',
	command: {
		id: 'workbench.action.docs', precondition: ContextKeyExpr.false(),
		title: localize('welcome.report', 'Report')
	},
	order: 3.5,
});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '3_welcome',
	submenu: ColabSubmenuId,
	title: localize('welcome.colab', 'Colaborate'),
	order: 1,
});

//MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
//	group: '1_welcome',
//	command: {
//		id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(),
//		title: localize('welcome.article', 'Article')
//	},
//	order: 4,
//});

// MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
//	group: '1_welcome',
//	command: {
//		id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(),
//		title: localize('welcome.thesis', 'Thesis')
//	},
//	order: 5,
//});

//MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
//	group: '1_welcome',
//	submenu: TrainSubmenuId,
//	title: localize('welcome.train', 'Training'),
//	order: 6,
//}); // See Stata


//MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
//	group: '2_kaggle',
//	command: {
//		id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(),
//		title: localize('kaggle.kc', 'Kaggle Competitions'),
//	},
//	order: 1,
//}); // https://www.kaggle.com/competitions

//MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
//	group: '2_kaggle',
//	command: {
//		id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(),
//		title: localize('kaggle.kga', 'Kaggle Game Arena'),
//	},
//	order: 2,
//});

MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
	group: '4_tasks',
	submenu: MenuId.MenubarTerminalMenu,
	title: localize('compose.tasks', 'Tasks'),
	order: 1,
});



// MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
//	group: '4_pe',
//	command: {
//		id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(),
//		title: localize('compose.themes', 'Create Menu Item and Webview'),
//	},
//	order: 1,
//});

//MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
//	group: '4_pe',
//	command: {
//		id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(),
//		title: localize('compose.packages', 'Create Julia Package'),
//	},
//	order: 2,
//});

//MenuRegistry.appendMenuItem(MenuId.MenubarComposeMenu, {
//	group: '4_pe',
//	command: {
//		id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(),
//		title: localize('compose.extensions', 'Create Pollis Extension'),
//	},
//	order: 3,
//});


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
// SUBMENU: CREATE TRAINING
// ============================================

MenuRegistry.appendMenuItem(TrainSubmenuId, {
	group: '1_train',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('train.netcourses', 'Net Courses') },
	order: 2,
}); // See Stata

MenuRegistry.appendMenuItem(TrainSubmenuId, {
	group: '1_train',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('train.classroom', 'Classroom and Net Training') },
	order: 3,
}); // See Stata

MenuRegistry.appendMenuItem(TrainSubmenuId, {
	group: '1_train',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('train.organisational', 'Organizational Training') },
	order: 4,
}); // See Stata

MenuRegistry.appendMenuItem(TrainSubmenuId, {
	group: '1_train',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('train.organisational', 'Video Tutorials') },
	order: 5,
}); // See Stata

MenuRegistry.appendMenuItem(TrainSubmenuId, {
	group: '1_train',
	command: { id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(), title: localize('train.organisational', 'Webinars') },
	order: 6,
}); // See Stata



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


// ============================================
// SUBMENU: COLABORATE
// ============================================

MenuRegistry.appendMenuItem(ColabSubmenuId, {
 	group: '1_col',
 	command: {
 		id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(),
 		title: localize('liveshare', 'P2P Live Share'),
 	},
 	order: 1,
});
// https://github.com/kermanx/p2p-live-share


MenuRegistry.appendMenuItem(ColabSubmenuId, {
 	group: '1_col',
 	command: {
 		id: COMPOSE_COMMAND_ID, precondition: ContextKeyExpr.false(),
 		title: localize('multiplayer', 'Multiplayer Webapp'),
 	},
 	order: 2,
});
// https://github.com/dmotz/trystero
