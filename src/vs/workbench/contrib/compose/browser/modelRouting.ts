/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Registry } from '../../../../platform/registry/common/platform.js';

// Compose > Orchestration > Model Routing: each agent task of the Compose menu runs on a tier, Light,
// Standard or Strong, and each tier is a command line, so small tasks go to a cheap, fast or local model
// and hard ones to a strong model. A task has a default tier, which the user can override. An empty tier,
// or a task set to the main agent, runs the main agent of Compose > Coding Agents. startAgent
// (pollisAgents.ts) asks agentCommandFor which command a task runs; the page is modelRoutingPage.ts. This
// module imports no other module of Compose, so every task can import it without a cycle.

export const AGENT_TIERS_SETTING = 'pollis.agents.tiers';
export const AGENT_TASK_TIERS_SETTING = 'pollis.agents.taskTiers';
export const MODEL_ROUTING_COMMAND_ID = 'pollis.orchestration.modelRouting';

export type AgentTier = 'light' | 'standard' | 'strong';

/** A task set to `main` runs the main agent, whatever its tier. */
export type AgentTierChoice = AgentTier | 'main';

export type AgentTask = 'polish' | 'writeVignette' | 'prepareRegistration' | 'packageToolbox' | 'tablesFromArticle' | 'writeMethod' | 'methodFromNotebook' | 'createPanel' | 'createPanelsFromRequest';

/** A tier: its name and what it is for. */
export interface IAgentTierInfo {
	readonly id: AgentTier;
	readonly label: string;
	readonly description: string;
}

export const AGENT_TIERS: readonly IAgentTierInfo[] = [
	{ id: 'light', label: localize('modelRouting.light', "Light"), description: localize('modelRouting.lightDescription', "Small tasks: a fast, cheap or local model") },
	{ id: 'standard', label: localize('modelRouting.standard', "Standard"), description: localize('modelRouting.standardDescription', "Everyday tasks") },
	{ id: 'strong', label: localize('modelRouting.strong', "Strong"), description: localize('modelRouting.strongDescription', "Hard tasks, where a mistake costs most") },
];

/** An agent task of the Compose menu: its name, the menu it is in and its default tier. */
export interface IAgentTaskInfo {
	readonly id: AgentTask;
	readonly label: string;
	readonly menu: string;
	readonly tier: AgentTier;
}

export const AGENT_TASKS: readonly IAgentTaskInfo[] = [
	{ id: 'polish', label: localize('modelRouting.polish', "Polish with Agent"), menu: localize('modelRouting.reports', "Reports"), tier: 'light' },
	{ id: 'writeVignette', label: localize('modelRouting.writeVignette', "Write a Vignette"), menu: localize('modelRouting.newMethods', "New Methods"), tier: 'standard' },
	{ id: 'prepareRegistration', label: localize('modelRouting.prepareRegistration', "Prepare for Registration"), menu: localize('modelRouting.newMethods', "New Methods"), tier: 'standard' },
	{ id: 'packageToolbox', label: localize('modelRouting.packageToolbox', "Package a Toolbox"), menu: localize('modelRouting.newPanels', "New Panels and Toolboxes"), tier: 'standard' },
	{ id: 'tablesFromArticle', label: localize('modelRouting.tablesFromArticle', "Tables from the Article"), menu: localize('modelRouting.newMethods', "New Methods"), tier: 'strong' },
	{ id: 'writeMethod', label: localize('modelRouting.writeMethod', "Write a Method"), menu: localize('modelRouting.newMethods', "New Methods"), tier: 'strong' },
	{ id: 'methodFromNotebook', label: localize('modelRouting.methodFromNotebook', "Method from Notebook"), menu: localize('modelRouting.newMethods', "New Methods"), tier: 'strong' },
	{ id: 'createPanel', label: localize('modelRouting.createPanel', "Create a Panel"), menu: localize('modelRouting.newPanels', "New Panels and Toolboxes"), tier: 'strong' },
	{ id: 'createPanelsFromRequest', label: localize('modelRouting.createPanelsFromRequest', "Create Panels from a Request"), menu: localize('modelRouting.newPanels', "New Panels and Toolboxes"), tier: 'strong' },
];

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'pollisModelRouting',
	title: localize('modelRouting.configurationTitle', "Pollis Model Routing"),
	type: 'object',
	properties: {
		[AGENT_TIERS_SETTING]: {
			type: 'object',
			default: { light: '', standard: '', strong: '' },
			properties: {
				light: { type: 'string' },
				standard: { type: 'string' },
				strong: { type: 'string' },
			},
			additionalProperties: false,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('modelRouting.tiersSetting', "The command line of each tier of the agent tasks, with `{prompt}` where the first message goes, for example `claude --model haiku {prompt}` for Light. Empty: the main agent, `#pollis.agents.command#`. Use **Compose > Orchestration > Model Routing** to change them."),
		},
		[AGENT_TASK_TIERS_SETTING]: {
			type: 'object',
			default: {},
			properties: Object.fromEntries(AGENT_TASKS.map(task => [task.id, { type: 'string', enum: ['light', 'standard', 'strong', 'main'] }])),
			additionalProperties: false,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('modelRouting.taskTiersSetting', "The tier of an agent task, when it is not its default one: `light`, `standard`, `strong`, or `main` for the main agent. Use **Compose > Orchestration > Model Routing** to change them."),
		},
	},
});

/** The tier a task runs on: its override, else its default; `main` for the main agent. */
export function taskTier(configurationService: IConfigurationService, task: AgentTask): AgentTierChoice {
	const override = configurationService.getValue<Partial<Record<AgentTask, AgentTierChoice>>>(AGENT_TASK_TIERS_SETTING)?.[task];
	return override ?? AGENT_TASKS.find(info => info.id === task)!.tier;
}

/** The command line of a tier; empty when the tier uses the main agent. */
export function tierCommand(configurationService: IConfigurationService, tier: AgentTier): string {
	return configurationService.getValue<Partial<Record<AgentTier, string>>>(AGENT_TIERS_SETTING)?.[tier]?.trim() ?? '';
}

/** The tier and command line a task runs with; undefined when it runs the main agent. */
export function agentCommandFor(configurationService: IConfigurationService, task: AgentTask): { readonly tier: IAgentTierInfo; readonly command: string } | undefined {
	const tier = AGENT_TIERS.find(info => info.id === taskTier(configurationService, task));
	const command = tier && tierCommand(configurationService, tier.id);
	return tier && command ? { tier, command } : undefined;
}
