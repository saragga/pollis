/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../vs/nls.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';

import { PTPS_PANEL } from '../../model/browser/commands/ptps.command.js';
import { SID_PANEL } from '../../model/browser/commands/sid.command.js';
import { openScaffoldWebview } from '../../model/browser/commands/scaffold.command.js';
import { MCMC_PANEL } from '../../model/browser/commands/mcmc.command.js';
import { SMC_PANEL } from '../../model/browser/commands/smc.command.js';
import { MLMC_PANEL } from '../../model/browser/commands/mlmc.command.js';
import { BOOT_PANEL } from '../../model/browser/commands/boot.command.js';
import { SDE_PANEL } from '../../model/browser/commands/sde.command.js';
import { TSSM_PANEL } from '../../model/browser/commands/tssm.command.js';
import { DYNPPL_PANEL } from '../../model/browser/commands/dynppl.command.js';
import { GRAPHPPL_PANEL } from '../../model/browser/commands/graphppl.command.js';
import { JDP_PANEL } from '../../model/browser/commands/jdp.command.js';
import { SDEA_PANEL } from '../../model/browser/commands/sdea.command.js';

// Register the Simulate menu to the main menu
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
	submenu: MenuId.MenubarSimulateMenu,
	title: {
		value: 'Simulate',
		original: 'Simulate',
		mnemonicTitle: localize({ key: 'mSimulate', comment: ['&& denotes a mnemonic'] }, "&&Simulate")
	},
	order: 7.5
});

// ============================================
// SUBMENU IDs
// ============================================

const SFSubmenuId  = new MenuId('menubarSFSubmenu');   // Sampling Foundations
// const MCMSubmenuId = new MenuId('menubarMCMSubmenu');  // Monte Carlo Methods
const PPLSubmenuId  = new MenuId('menubarPPLSubmenu');  // Probabilistic Programming Languages
const TSSSubmenuId  = new MenuId('menubarTSSSubmenu');  // Time-Series Simulation
// const NLSSubmenuId = new MenuId('menubarNLSSubmenu');  // Nonlinear Systems
const SDESubmenuId  = new MenuId('menubarSDESubmenu');  // Stochastic Differential Equations
const ABSSubmenuId  = new MenuId('menubarABSSubmenu');  // Agent-Based Simulation
const NCMSubmenuId  = new MenuId('menubarNCMSubmenu');  // Network Models
// ============================================
// TOP-LEVEL SIMULATE MENU STRUCTURE
// ============================================

MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
	group: '1_simulation',
	submenu: SFSubmenuId,
	title: localize('showStatistics.sf', 'Sampling Foundations'),
	order: 1,
});

// MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
// 	group: '1_simulation',
// 	command: { id: 'chiara.simulate.mc.standard', precondition: ContextKeyExpr.false(), title: localize('mc.standard', 'Standard Monte Carlo') },
// 	order: 1,
// }); // MonteCarloMeasurements.jl

// MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
// 	group: '1_simulation',
// 	command: { id: 'chiara.simulate.mc.quasi', precondition: ContextKeyExpr.false(), title: localize('mc.quasi', 'Quasi-Monte Carlo') },
// 	order: 2,
// }); // QuasiMonteCarlo.jl

MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
	group: '1_simulation',
	command: { id: 'chiara.simulate.mc.mcmc', title: localize('mc.mcmc', 'Markov Chain Monte Carlo') },
	order: 2,
}); //  Turing.jl, AdvancedHMC.jl, MCMCChains

MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
	group: '1_simulation',
	command: { id: 'chiara.simulate.mc.smc', title: localize('mc.smc', 'Sequential Monte Carlo') },
	order: 3,
}); // LowLevelParticleFilters.jl

MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
	group: '1_simulation',
	command: { id: 'chiara.simulate.mc.mlmc', title: localize('mc.mlmc', 'Multilevel Monte Carlo') },
	order: 4,
}); // MultilevelEstimators.jl

MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
	group: '1_simulation',
	command: { id: 'chiara.simulate.mc.boot', title: localize('mc.boot', 'Bootstrap Resampling') },
	order: 5,
}); // Bootstrap.jl


// MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
//	group: '1_simulation',
//	command: { id: 'chiara.simulate.mc.vr', precondition: ContextKeyExpr.false(), title: localize('mc.vr', 'Variance Reduction') },
//	order: 5,
//});

// MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
//	group: '1_simulation',
//	command: { id: 'chiara.simulate.mc.rare', precondition: ContextKeyExpr.false(), title: localize('mc.rare', 'Rare-Event Simulation') },
//	order: 2,
//}); // Gen.jl + SciML


MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
	group: '2_simulation',
	submenu: PPLSubmenuId,
	title: localize('showStatistics.ppl', 'Probabilistic Programming Languages'),
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
	group: '2_simulation',
	command: {
		id: 'chiara.statistics.up',
		title: localize('showStatistics.up', 'Uncertainty Propagation'),
	},
	order: 1,
}); // MonteCarloMeasurements.jl


// MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
//	group: '1_timeseries',
//	command: { id: 'chiara.statistics.timeseries.rsm', precondition: ContextKeyExpr.false(), title: localize('timeseries.rsm', 'Regime-Switching Models') },
//	order: 4,
//});


MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
	group: '3_simulation',
	command: {id: 'chiara.simulate.pp',
		title: localize('simulation.pp', 'Point Processes')
	},
	order: 1,
}); // PointProcesses.jl, HawkesProcesses.jl, NetworkHawkesProcesses.jl,


MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
	group: '3_simulation',
	command: { id: 'chiara.statistics.timeseries.ssm', title: localize('timeseries.ssm', 'State Space Models') },
	order: 2,
}); // StateSpaceModels.jl, DifferentialEquations.jl

MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
	group: '3_simulation',
	command: { id: 'chiara.statistics.nonlin.cds', title: localize('nonlin.cds', 'Continuous Dynamical Systems') },
	order: 3,
}); // DynamicalSystems.jl

MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
	group: '3_simulation',
	command: { id: 'chiara.statistics.nonlin.dmap', title: localize('nonlin.dmap', 'Discrete Maps') },
	order: 4,
}); // DynamicalSystems.jl

MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
	group: '3_simulation',
	submenu: SDESubmenuId,
	title: localize('simulation.sde', 'Stochastic Differential Equations'),
	order: 5,
}); // StochasticDiffEq.jl, JumpProcesses.jl


MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
	group: '4_simulation',
	submenu: ABSSubmenuId,
	title: localize('simulation.abs', 'Agent-Based Simulation'),
	order: 1,
}); // Agents.jl

MenuRegistry.appendMenuItem(MenuId.MenubarSimulateMenu, {
	group: '4_simulation',
	submenu: NCMSubmenuId,
	title: localize('simulation.ncm', 'Network Models'),
	order: 2,
}); // Graphs.jl, NetworkDynamics.jl, GraphsFlows.jl, MetaGraphsNext.jl


// ============================================
// SUBMENU: SAMPLING FOUNDATIONS
// ============================================

MenuRegistry.appendMenuItem(SFSubmenuId, {
	group: '1_sampling',
	command: { id: 'chiara.statistics.rng', title: localize('showStatistics.rng', 'Random Number Generators') },
	order: 1,
});

MenuRegistry.appendMenuItem(SFSubmenuId, {
	group: '1_sampling',
	command: { id: 'chiara.statistics.qrng', title: localize('showStatistics.qrng', 'Quasi-Random Sequences') },
	order: 2,
}); // QuasiMonteCarlo.jl

MenuRegistry.appendMenuItem(SFSubmenuId, {
	group: '2_sampling',
	command: { id: 'chiara.statistics.ds', title: localize('showStatistics.ds', 'Distribution Sampling') },
	order: 1,
}); // Distributions.jl

MenuRegistry.appendMenuItem(SFSubmenuId, {
	group: '2_sampling',
	command: { id: 'chiara.statistics.id', title: localize('showStatistics.id', 'Sampling from Intractable Distributions') },
	order: 2,
}); // Pigeons.jl


MenuRegistry.appendMenuItem(SFSubmenuId, {
	group: '3_sampling',
	command: { id: 'chiara.statistics.cs', title: localize('showStatistics.cs', 'Copula Sampling') },
	order: 1,
}); // Copulas.jl



// ============================================
// SUBMENU: PROBABILISTIC PROGRAMMING LANGUAGES
// ============================================

MenuRegistry.appendMenuItem(PPLSubmenuId, {
 	group: '1_ppl',
	command: { id: 'chiara.statistics.ppl.dynppl', title: localize('ppl.dynppl', 'Imperative/Trace-Based Language') },
 	order: 1,
 }); // DynamicPPL.jl — imperative @model DSL, backend for Turing.jl

MenuRegistry.appendMenuItem(PPLSubmenuId, {
 	group: '1_ppl',
 	command: { id: 'chiara.statistics.ppl.graphppl', title: localize('ppl.graphppl', 'Factor Graph Language') },
 	order: 2,
}); // GraphPPL.jl — factor graph DSL, backend for RxInfer.jl



// ============================================
// SUBMENU: TIME-SERIES SIMULATION
// ============================================

// MenuRegistry.appendMenuItem(TSSSubmenuId, {
// 	group: '1_timeseries',
// 	command: { id: 'chiara.statistics.timeseries.arima', precondition: ContextKeyExpr.false(), title: localize('timeseries.arima', 'ARIMAX Processes') },
// 	order: 1,
// }); // ARFIMA.jl

// MenuRegistry.appendMenuItem(TSSSubmenuId, {
// 	group: '1_timeseries',
// 	command: { id: 'chiara.statistics.timeseries.var', precondition: ContextKeyExpr.false(), title: localize('timeseries.var', 'VAR/VECM Systems') },
// 	order: 2,
// });

// MenuRegistry.appendMenuItem(TSSSubmenuId, {
// 	group: '1_timeseries',
// 	command: { id: 'chiara.statistics.timeseries.garch', precondition: ContextKeyExpr.false(), title: localize('timeseries.garch', 'GARCH-Type Models') },
// 	order: 3,
// });

// MenuRegistry.appendMenuItem(TSSSubmenuId, {
//	group: '1_timeseries',
//	command: { id: 'chiara.statistics.timeseries.rsm', precondition: ContextKeyExpr.false(), title: localize('timeseries.rsm', 'Regime-Switching Models') },
//	order: 4,
//});

MenuRegistry.appendMenuItem(TSSSubmenuId, {
	group: '1_timeseries',
	command: { id: 'chiara.statistics.timeseries.ssm', title: localize('timeseries.ssm', 'State Space Models') },
	order: 5,
}); // StateSpaceModels.jl, DifferentialEquations.jl



// ============================================
// SUBMENU: STOCHASTIC DIFFERENTIAL EQUATIONS
// ============================================

MenuRegistry.appendMenuItem(SDESubmenuId, {
	group: '1_sde',
	command: { id: 'chiara.simulate.sde', title: localize('simulate.sde', 'Diffusion Processes') },
	order: 1,
}); // StochasticDiffEq.jl — additive, multiplicative, Stratonovich

MenuRegistry.appendMenuItem(SDESubmenuId, {
	group: '1_sde',
	command: { id: 'chiara.simulate.jdp', title: localize('simulate.jdp', 'Jump-Diffusion Processes') },
	order: 2,
}); // JumpProcesses.jl — Compound Poisson, Gaussian jumps, custom rate

MenuRegistry.appendMenuItem(SDESubmenuId, {
	group: '1_sde',
	command: { id: 'chiara.simulate.sdea', title: localize('simulate.sdea', 'Ensemble Analysis') },
	order: 3,
}); // DifferentialEquations.jl — path statistics, first passage time, invariant distribution


// ============================================
// SUBMENU: AGENT-BASED SIMULATION
// ============================================

MenuRegistry.appendMenuItem(ABSSubmenuId, {
	group: '1_agent',
	command: { id: 'chiara.simulate.abm', title: localize('simulate.abm', 'Agent-Based Models') },
	order: 1,
});

MenuRegistry.appendMenuItem(ABSSubmenuId, {
	group: '1_agent',
	command: { id: 'chiara.simulate.abm-ens', title: localize('simulate.abm-ens', 'Ensemble & Parameter Scanning') },
	order: 2,
});

MenuRegistry.appendMenuItem(ABSSubmenuId, {
	group: '1_agent',
	command: { id: 'chiara.simulate.abm-viz', title: localize('simulate.abm-viz', 'ABM Visualisation') },
	order: 3,
});


// ============================================
// SUBMENU: NETWORK MODELS
// ============================================

MenuRegistry.appendMenuItem(NCMSubmenuId, {
	group: '1_network',
	command: { id: 'chiara.simulate.net', title: localize('simulate.net', 'Network Analysis') },
	order: 1,
});

MenuRegistry.appendMenuItem(NCMSubmenuId, {
	group: '1_network',
	command: { id: 'chiara.simulate.netdyn', title: localize('simulate.netdyn', 'Network Dynamics') },
	order: 2,
});

MenuRegistry.appendMenuItem(NCMSubmenuId, {
	group: '1_network',
	command: { id: 'chiara.simulate.netflow', title: localize('simulate.netflow', 'Network Flows') },
	order: 3,
});

MenuRegistry.appendMenuItem(NCMSubmenuId, {
	group: '2_network',
	command: { id: 'chiara.simulate.crn', title: localize('simulate.crn', 'Reaction Network Systems') },
	order: 1,
}); // Catalyst.jl



// ============================================
// COMMAND REGISTRATIONS
// ============================================

CommandsRegistry.registerCommand('chiara.simulate.pp', (accessor: ServicesAccessor) =>
	openScaffoldWebview(accessor, PTPS_PANEL)
);

CommandsRegistry.registerCommand('chiara.statistics.id', (accessor: ServicesAccessor) =>
	openScaffoldWebview(accessor, SID_PANEL)
);

CommandsRegistry.registerCommand('chiara.simulate.mc.mcmc', (accessor: ServicesAccessor) =>
	openScaffoldWebview(accessor, MCMC_PANEL)
);

CommandsRegistry.registerCommand('chiara.simulate.mc.smc', (accessor: ServicesAccessor) =>
	openScaffoldWebview(accessor, SMC_PANEL)
);

CommandsRegistry.registerCommand('chiara.simulate.mc.mlmc', (accessor: ServicesAccessor) =>
	openScaffoldWebview(accessor, MLMC_PANEL)
);

CommandsRegistry.registerCommand('chiara.simulate.mc.boot', (accessor: ServicesAccessor) =>
	openScaffoldWebview(accessor, BOOT_PANEL)
);

CommandsRegistry.registerCommand('chiara.simulate.sde', (accessor: ServicesAccessor) =>
	openScaffoldWebview(accessor, SDE_PANEL)
);

CommandsRegistry.registerCommand('chiara.simulate.jdp', (accessor: ServicesAccessor) =>
	openScaffoldWebview(accessor, JDP_PANEL)
);

CommandsRegistry.registerCommand('chiara.simulate.sdea', (accessor: ServicesAccessor) =>
	openScaffoldWebview(accessor, SDEA_PANEL)
);

CommandsRegistry.registerCommand('chiara.statistics.timeseries.ssm', (accessor: ServicesAccessor) =>
	openScaffoldWebview(accessor, TSSM_PANEL)
);

CommandsRegistry.registerCommand('chiara.statistics.ppl.dynppl', (accessor: ServicesAccessor) =>
	openScaffoldWebview(accessor, DYNPPL_PANEL)
);

CommandsRegistry.registerCommand('chiara.statistics.ppl.graphppl', (accessor: ServicesAccessor) =>
	openScaffoldWebview(accessor, GRAPHPPL_PANEL)
);
