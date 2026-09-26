/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';

/**
 * One slide of the welcome page's Discover Pollis section: a picture of a feature, where to find it in
 * the menus, and the command that opens it.
 */
export interface IDiscoverPollisEntry {
	readonly id: string;
	/** Menu path to the feature: the top menu, then the submenu (for example Explore, Visualise). */
	readonly menuPath: string;
	readonly title: string;
	readonly description: string;
	/** Label of the link that runs `command`. */
	readonly action: string;
	readonly command: string;
	/** Still picture, relative to `vs/workbench/contrib/welcomeGettingStarted/common/media/discover/`. */
	readonly media: string;
	/** Animated version of `media`, shown unless reduced motion is on. */
	readonly animatedMedia?: string;
}

export const discoverPollisEntries: readonly IDiscoverPollisEntry[] = [
	{
		id: 'visualise',
		menuPath: localize('discover.visualise.path', "Explore \u203A Visualise"),
		title: localize('discover.visualise.title', "Visualise Your Data"),
		description: localize('discover.visualise.description', "Thirty-five plot types, from scatter plots and histograms to Sankey diagrams, surfaces and voxel plots."),
		action: localize('discover.visualise.action', "Open Surface Plot"),
		command: 'chiara.explore.dvsf.surface',
		media: 'visualise.still.svg',
		animatedMedia: 'visualise.svg',
	},
	{
		id: 'dataLibraries',
		menuPath: localize('discover.dataLibraries.path', "Explore \u203A Access Data Libraries"),
		title: localize('discover.dataLibraries.title', "Bring In Real Data"),
		description: localize('discover.dataLibraries.description', "Yahoo Finance, Alpha Vantage, US SEC EDGAR, FRED, the ECB Data Portal, Hugging Face and Kaggle."),
		action: localize('discover.dataLibraries.action', "Open Yahoo Finance"),
		command: 'chiara.explore.adr.yfin',
		media: 'dataLibraries.still.svg',
		animatedMedia: 'dataLibraries.svg',
	},
	{
		id: 'forecasting',
		menuPath: localize('discover.forecasting.path', "Model \u203A Time-Series Forecasting"),
		title: localize('discover.forecasting.title', "Forecast a Time Series"),
		description: localize('discover.forecasting.description', "Fit a model, check it and forecast with intervals. Every panel has runnable Julia code and Next Steps."),
		action: localize('discover.forecasting.action', "Open Time-Series Forecasting"),
		command: 'chiara.statistics.tsf',
		media: 'forecasting.still.svg',
		animatedMedia: 'forecasting.svg',
	},
	{
		id: 'neuralNetworks',
		menuPath: localize('discover.neuralNetworks.path', "Model \u203A Neural Network Architectures"),
		title: localize('discover.neuralNetworks.title', "Build Neural Networks"),
		description: localize('discover.neuralNetworks.description', "Feedforward, recurrent, convolutional and graph networks, transformers, normalising flows and neural ODEs."),
		action: localize('discover.neuralNetworks.action', "Open Feedforward Neural Network"),
		command: 'chiara.statistics.nn.fnn',
		media: 'neuralNetworks.still.svg',
		animatedMedia: 'neuralNetworks.svg',
	},
	{
		id: 'diffusionProcesses',
		menuPath: localize('discover.diffusionProcesses.path', "Simulate \u203A Stochastic Differential Equations"),
		title: localize('discover.diffusionProcesses.title', "Simulate Diffusion Processes"),
		description: localize('discover.diffusionProcesses.description', "Simulate many paths of a stochastic differential equation and watch the spread of outcomes grow."),
		action: localize('discover.diffusionProcesses.action', "Open Diffusion Processes"),
		command: 'chiara.simulate.sde',
		media: 'diffusionProcesses.still.svg',
		animatedMedia: 'diffusionProcesses.svg',
	},
	{
		id: 'agentBasedModels',
		menuPath: localize('discover.agentBasedModels.path', "Simulate \u203A Agent-Based Simulation"),
		title: localize('discover.agentBasedModels.title', "Run Agent-Based Models"),
		description: localize('discover.agentBasedModels.description', "Let simple agents follow local rules and see patterns emerge across the whole population."),
		action: localize('discover.agentBasedModels.action', "Open Agent-Based Models"),
		command: 'chiara.simulate.abm',
		media: 'agentBasedModels.still.svg',
		animatedMedia: 'agentBasedModels.svg',
	},
	{
		id: 'bayesianOptimisation',
		menuPath: localize('discover.bayesianOptimisation.path', "Optimise \u203A Bayesian Optimisation"),
		title: localize('discover.bayesianOptimisation.title', "Optimise Expensive Functions"),
		description: localize('discover.bayesianOptimisation.description', "A surrogate model chooses where to evaluate next, so the optimum is found in few evaluations."),
		action: localize('discover.bayesianOptimisation.action', "Open Bayesian Optimisation"),
		command: 'chiara.optimise.bopt',
		media: 'bayesianOptimisation.still.svg',
		animatedMedia: 'bayesianOptimisation.svg',
	},
	{
		id: 'reinforcementLearning',
		menuPath: localize('discover.reinforcementLearning.path', "Optimise \u203A Reinforcement Learning"),
		title: localize('discover.reinforcementLearning.title', "Train an Agent by Trial and Error"),
		description: localize('discover.reinforcementLearning.description', "Q-learning spreads the value of the goal across the grid, and the agent follows the learned policy there."),
		action: localize('discover.reinforcementLearning.action', "Open Q-Learning"),
		command: 'chiara.statistics.rl.ql',
		media: 'reinforcementLearning.still.svg',
		animatedMedia: 'reinforcementLearning.svg',
	},
];
