/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../vs/nls.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { ECO_BFMB_ID, ECO_BLSDF_ID, ARMA_ARIMA_WEBVIEW_ID, ARMA_VAR_WEBVIEW_ID } from '../../model/browser/model.contribution.js';
import { EXPL_COMMAND_ID, RDYN_ID, RCTL_ID, MCAT_ID, RZOO_ID, FRED_ID, ECB_ID } from '../../explore/browser/explore.contribution.js';

// Define a new submenu ID for "Economics Toolbox"
const E_MTSubmenuId = new MenuId('menubarE_MTSubmenu');
const E_MTDataSourcesSubmenuId = new MenuId('menubarE_MTDataSourcesSubmenu');

// Define a new submenu ID for "Econometrics Toolbox"
const E_ETSubmenuId = new MenuId('menubarE_ETSubmenu');

// Define a new submenu ID for "Epidemiology Toolbox"
const E_CMTSubmenuId = new MenuId('menubarE_CMTSubmenu');

// Define a new submenu ID for "Robotics Toolbox"
const E_RTSubmenuId = new MenuId('menubarE_RTSubmenu');

// ------------------- TOOLBOXES ------------------------

// Domain-specific toolboxes live in their own top-level menu, separate from
// Explore (which is organized by action, not by domain).
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
	submenu: MenuId.MenubarToolboxesMenu,
	title: {
		value: 'Toolboxes',
		original: 'Toolboxes',
		mnemonicTitle: localize({ key: 'mToolboxes', comment: ['&& denotes a mnemonic'] }, "&&Toolboxes")
	},
	order: 9.5
});

// Economics Toolbox
MenuRegistry.appendMenuItem(MenuId.MenubarToolboxesMenu, {
	group: '1_toolboxes',
	submenu: E_MTSubmenuId,
	title: localize('showStatistics.mt', 'Economics Toolbox'),
	order: 1,
});

// Econometrics Toolbox
MenuRegistry.appendMenuItem(MenuId.MenubarToolboxesMenu, {
	group: '1_toolboxes',
	submenu: E_ETSubmenuId,
	title: localize('showStatistics.et', 'Econometrics Toolbox'),
	order: 2,
});

// Epidemiology Toolbox
MenuRegistry.appendMenuItem(MenuId.MenubarToolboxesMenu, {
	group: '4_toolboxes',
	submenu: E_CMTSubmenuId,
	title: localize('showStatistics.ept', 'Epidemiology Toolbox'),
	order: 3,
});

// Robotics Toolbox
MenuRegistry.appendMenuItem(MenuId.MenubarToolboxesMenu, {
	group: '5_toolboxes',
	submenu: E_RTSubmenuId,
	title: localize('showStatistics.robot', 'Robotics Toolbox'),
	order: 4,
});

// ===================================================
// SUBMENU: ECONOMICS TOOLBOX
// ===================================================

// Data Sources submenu
MenuRegistry.appendMenuItem(E_MTSubmenuId, {
	group: '1_mt',
	submenu: E_MTDataSourcesSubmenuId,
	title: localize('mt.dataSources', 'Data Sources'),
	order: 1,
});

MenuRegistry.appendMenuItem(E_MTDataSourcesSubmenuId, {
	group: '1_mtds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('mt.dbnomics', 'DBnomics Platform'),
	},
	order: 1,
}); // DBnomics.jl

MenuRegistry.appendMenuItem(E_MTDataSourcesSubmenuId, {
	group: '2_mtds',
	command: {
		id: FRED_ID,
		title: localize('mt.fred', 'Federal Reserve Economic Data (FRED)'),
	},
	order: 2,
}); // Fred.jl

MenuRegistry.appendMenuItem(E_MTDataSourcesSubmenuId, {
	group: '2_mtds',
	command: {
		id: ECB_ID,
		title: localize('mt.ecb', 'European Central Bank Data Portal'),
	},
	order: 3,
}); // European Central Bank

// Research and institutional datasets

MenuRegistry.appendMenuItem(E_MTDataSourcesSubmenuId, {
	group: '2_mtds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('mt.ifm', 'International Monetary Fund Datasets'),
	},
	order: 4,
}); // IMFData.jl

MenuRegistry.appendMenuItem(E_MTDataSourcesSubmenuId, {
	group: '2_mtds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('mt.wbd', 'World Bank Indicators'),
	},
	order: 5,
}); // WorldBankData.jl

MenuRegistry.appendMenuItem(E_MTDataSourcesSubmenuId, {
	group: '2_mtds',
	command: {
		id: EXPL_COMMAND_ID, precondition: ContextKeyExpr.false(),
		title: localize('mt.french', 'Kenneth French Data Library'),
	},
	order: 6,
}); // FamaFrenchData.jl

// Models
MenuRegistry.appendMenuItem(E_MTSubmenuId, {
	group: '4_mt',
	command: { id: 'chiara.statistics.macro.hpf', title: localize('macro.hpf', 'Business Cycle Filters') },
	order: 1,
}); // TrendDecomposition.jl

MenuRegistry.appendMenuItem(E_MTSubmenuId, {
	group: '4_mt',
	command: { id: 'chiara.statistics.macro.dtsvm', title: localize('macro.dtsvm', 'Stochastic Volatility Macroeconomic Models') },
	order: 2,
}); // MacroEconometricModels.jl

MenuRegistry.appendMenuItem(E_MTSubmenuId, {
	group: '4_mt',
	command: { id: 'chiara.statistics.macro.dsge', title: localize('macro.dsge', 'Dynamic Stochastic General Equilibrium (DSGE)') },
	order: 3,
}); // DSGE.jl, EconPDEs.jl, JuliaPerturbation.jl

MenuRegistry.appendMenuItem(E_MTSubmenuId, {
	group: '4_mt',
	command: { id: 'chiara.statistics.macro.ham', title: localize('macro.ham', 'Heterogeneous-Agent Models') },
	order: 4,
}); // EconPDEs.jl

MenuRegistry.appendMenuItem(E_MTSubmenuId, {
	group: '4_mt',
	command: { id: 'chiara.statistics.macro.ctmf', title: localize('macro.ctmf', 'Continuous-Time Macro-Finance') },
	order: 5,
}); // EconPDEs.jl

MenuRegistry.appendMenuItem(E_MTSubmenuId, {
	group: '5_mt',
	command: { id: 'chiara.statistics.macro.gt', title: localize('macro.gt', 'Game Theory') },
	order: 1,
}); // GameTheory.jl, StrategicGames.jl, BaryPlots.jl


// ===================================================
// SUBMENU: ECONOMETRICS TOOLBOX
// ===================================================

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '1_et',
	command: { id: ARMA_ARIMA_WEBVIEW_ID, title: localize('et.arimax', 'ARIMAX Models') },
	order: 1,
});

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '1_et',
	command: { id: ARMA_VAR_WEBVIEW_ID, title: localize('et.var', 'VAR/VECM Systems') },
	order: 2,
});

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '1_et',
	command: { id: 'chiara.statistics.vcm', title: localize('et.garch', 'GARCH-Type Models') },
	order: 3,
});

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '1_et',
	command: {
		id: 'chiara.statistics.rsm', precondition: ContextKeyExpr.false(),
		title: localize('showStatistics.rsm', 'Regime Switching Models'),
	},
	order: 4,
}); // MarSwitching.jl, HiddenMarkovModels.jl

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '2_et',
	command: { id: 'chiara.statistics.atsf', title: localize('et.atsf', 'Advanced Time-Series Forecasting') },
	order: 1,
}); // Durbyn.jl

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '2_et',
	command: { id: 'chiara.statistics.nntsf', title: localize('showStatistics.nntsf', 'Neural Network Time-Series Forecasting') },
	order: 2,
}); // Flux.jl + FluxArchitectures.jl

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '2_et',
	command: { id: 'chiara.statistics.autotsf', precondition: ContextKeyExpr.false(), title: localize('et.autotsf', 'Automatic Time-Series Forecasting') },
	order: 3,
}); // Heval.jl

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '3_et',
	command: { id: ECO_BLSDF_ID, title: localize('eco.blsdf', 'Bayesian Linear Stochastic Discount Factor') },
	order: 1,
}); // BayesianFactorZoo.jl

MenuRegistry.appendMenuItem(E_ETSubmenuId, {
	group: '3_et',
	command: { id: ECO_BFMB_ID, title: localize('ft.bfmb', 'Fama-MacBeth Regression') },
	order: 2,
}); // BayesianFactorZoo.jl



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


// ===================================================
// SUBMENU: ROBOTICS TOOLBOX
// ===================================================

MenuRegistry.appendMenuItem(E_RTSubmenuId, {
	group: '1_rt',
	command: {
		id: RDYN_ID,
		title: localize('showRobotics.rdyn', 'Robot Dynamics'),
	},
	order: 1,
}); // Rotation Representations, FK, FD, ID; Rotations.jl, RobotDynamics.jl, RigidBodyDynamics.jl

MenuRegistry.appendMenuItem(E_RTSubmenuId, {
	group: '1_rt',
	command: {
		id: RCTL_ID,
		title: localize('showRobotics.rctl', 'Robot Control'),
	},
	order: 2,
}); // IK, PD Joint Control, Computed Torque, Impedance; RobotDynamics.jl, RigidBodyDynamics.jl

MenuRegistry.appendMenuItem(E_RTSubmenuId, {
	group: '2_rt',
	command: {
		id: MCAT_ID,
		title: localize('showRobotics.mcat', 'MeshCat 3D Visualisation'),
	},
	order: 1,
}); // MeshCat.jl, CoordinateTransformations.jl, MeshCatMechanisms.jl

MenuRegistry.appendMenuItem(E_RTSubmenuId, {
	group: '2_rt',
	command: {
		id: RZOO_ID,
		title: localize('showRobotics.rzoo', 'Robot Model Library'),
	},
	order: 2,
}); // RobotZoo.jl, RobotDynamics.jl
