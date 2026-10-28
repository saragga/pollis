/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IJSONSchema } from '../../../../base/common/jsonSchema.js';
import { basename } from '../../../../base/common/path.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Registry } from '../../../../platform/registry/common/platform.js';

// Compose > Orchestration > Model Tasks and Routing: each agent task of the Compose menu runs on a tier, Light,
// Standard, Strong or one the user named, such as Max, so small tasks go to a cheap, fast or local model and hard
// ones to a strong model. A task has a default tier, which the user can override. A tier is a cell of a table
// whose columns are the coding agents and whose rows are the models: the agent's default, the cloud models
// (CLOUD_MODELS_SETTING, each with the arguments that choose it in each agent) and the local models. Each tier
// is in one cell at most (TIER_CELLS_SETTING); a tier the user named exists while it is in a cell. startAgent
// (pollisAgents.ts) asks tierRun which command a tier runs; the page is modelRoutingPage.ts. This module imports
// no other module of Compose, so every task can import it without a cycle: the agents are passed in. A tier on a
// local model runs its agent on it: Pollis starts llama.cpp's llama-server for it (pollisLlamaServer.ts in the
// Julia extension) and points Claude Code, OpenCode or Codex at that server (localModelLaunch).

export const TIER_CELLS_SETTING = 'pollis.agents.tierCells';
export const CLOUD_MODELS_SETTING = 'pollis.agents.cloudModels';
export const AGENT_TASK_TIERS_SETTING = 'pollis.agents.taskTiers';
export const MODEL_ROUTING_COMMAND_ID = 'pollis.orchestration.modelRouting';

// The settings of the tiers before the table, each tier a command line and a local model, read once to move them
// into the table (modelRoutingPage.ts), then cleared
export const OLD_AGENT_COMMAND_SETTING = 'pollis.agents.command';
export const OLD_AGENT_TIERS_SETTING = 'pollis.agents.tiers';
export const OLD_AGENT_TIER_MODELS_SETTING = 'pollis.agents.tierModels';

/** One of the three tiers that come with Pollis, the default tiers of the tasks. */
export type BuiltinAgentTier = 'light' | 'standard' | 'strong';

/** A tier: one of the three, or the name of one the user typed in a cell. */
export type AgentTier = string;

export type AgentTask = 'polish' | 'writeVignette' | 'prepareRegistration' | 'packageToolbox' | 'tablesFromArticle' | 'writeMethod' | 'createPanel' | 'createPanelsFromRequest';

/** A tier: its name and what it is for. */
export interface IAgentTierInfo {
	readonly id: AgentTier;
	readonly label: string;
	readonly description: string;
	/** Whether the user named it. */
	readonly user?: boolean;
}

export const AGENT_TIERS: readonly IAgentTierInfo[] = [
	{ id: 'light', label: localize('modelRouting.light', "Light"), description: localize('modelRouting.lightDescription', "Small tasks: a fast, cheap or local model") },
	{ id: 'standard', label: localize('modelRouting.standard', "Standard"), description: localize('modelRouting.standardDescription', "Everyday tasks") },
	{ id: 'strong', label: localize('modelRouting.strong', "Strong"), description: localize('modelRouting.strongDescription', "Hard tasks, where a mistake costs most") },
];

/** An agent task of the Compose menu: its name, the menu it is in, its default tier and the skills it runs; a skill may serve several tasks. */
export interface IAgentTaskInfo {
	readonly id: AgentTask;
	readonly label: string;
	readonly menu: string;
	readonly tier: BuiltinAgentTier;
	/** The folders of its skills in the Pollis Agents plugin. */
	readonly skills: readonly string[];
}

export const AGENT_TASKS: readonly IAgentTaskInfo[] = [
	{ id: 'polish', label: localize('modelRouting.polish', "Polish with Agent"), menu: localize('modelRouting.reports', "Reports"), tier: 'light', skills: ['polish-report'] },
	{ id: 'writeVignette', label: localize('modelRouting.writeVignette', "Write a Vignette"), menu: localize('modelRouting.newMethods', "Methods"), tier: 'standard', skills: ['write-vignette'] },
	{ id: 'prepareRegistration', label: localize('modelRouting.prepareRegistration', "Prepare for Registration"), menu: localize('modelRouting.newMethods', "Methods"), tier: 'standard', skills: ['prepare-method'] },
	{ id: 'packageToolbox', label: localize('modelRouting.packageToolbox', "Package a Toolbox"), menu: localize('modelRouting.newPanels', "New Panels and Toolboxes"), tier: 'standard', skills: ['package-toolbox'] },
	{ id: 'tablesFromArticle', label: localize('modelRouting.tablesFromArticle', "Tables from the Article"), menu: localize('modelRouting.newMethods', "Methods"), tier: 'strong', skills: ['tables-from-article'] },
	{ id: 'writeMethod', label: localize('modelRouting.writeMethod', "Write a Method"), menu: localize('modelRouting.newMethods', "Methods"), tier: 'strong', skills: ['write-method'] },
	{ id: 'createPanel', label: localize('modelRouting.createPanel', "Create a Panel"), menu: localize('modelRouting.newPanels', "New Panels and Toolboxes"), tier: 'strong', skills: ['create-panel'] },
	{ id: 'createPanelsFromRequest', label: localize('modelRouting.createPanelsFromRequest', "Create Panels from a Request"), menu: localize('modelRouting.newPanels', "New Panels and Toolboxes"), tier: 'strong', skills: ['create-panel'] },
];

/** The tier a run with no task is on: a skill started from Compose > Agent Skills. */
export const DEFAULT_TIER: BuiltinAgentTier = 'standard';

/** The model of a cell: a cloud model by name, or a local model by its file. */
export const CLOUD_PREFIX = 'cloud:';
export const LOCAL_PREFIX = 'local:';

/** The cell of a tier: the agent of its column, by name, and the model of its row. */
export interface ITierCell {
	readonly agent: string;
	/** CLOUD_PREFIX and a cloud model's name, or LOCAL_PREFIX and a local model's file or `hf:` file. */
	readonly model: string;
}

/** A cloud model: its name and, for each agent that runs it, by the agent's name, the arguments that choose it. */
export interface ICloudModel {
	readonly name: string;
	readonly agents: Readonly<Record<string, string>>;
}

/** An agent, as the tiers need it: its name and its command line, with `{prompt}` where the first message goes. */
export interface IAgentCommand {
	readonly label: string;
	readonly command: string;
}

// The cloud models offered at first, with the model flags of Claude Code (its aliases of the latest models),
// Codex (-m) and OpenCode (--model provider/model); the user changes them in the setting
const CLOUD_MODELS: readonly ICloudModel[] = [
	{ name: 'Claude Haiku', agents: { 'Claude Code': '--model haiku', 'OpenCode': '--model anthropic/claude-haiku-5-5' } },
	{ name: 'Claude Sonnet', agents: { 'Claude Code': '--model sonnet', 'OpenCode': '--model anthropic/claude-sonnet-5-5' } },
	{ name: 'Claude Opus', agents: { 'Claude Code': '--model opus', 'OpenCode': '--model anthropic/claude-opus-5-5' } },
	{ name: 'GPT-5.5', agents: { 'Codex': '-m gpt-5.5', 'OpenCode': '--model openai/gpt-5.5' } },
	{ name: 'GPT-5.4', agents: { 'Codex': '-m gpt-5.4', 'OpenCode': '--model openai/gpt-5.4' } },
	{ name: 'GPT-5.4 mini', agents: { 'Codex': '-m gpt-5.4-mini', 'OpenCode': '--model openai/gpt-5.4-mini' } },
	{ name: 'GPT-5.3 Codex', agents: { 'Codex': '-m gpt-5.3-codex', 'OpenCode': '--model openai/gpt-5.3-codex' } },
];

/** The cells of the three tiers while the setting is unset: Claude Code on its three models. */
export const DEFAULT_TIER_CELLS: Readonly<Record<BuiltinAgentTier, ITierCell>> = {
	light: { agent: 'Claude Code', model: `${CLOUD_PREFIX}Claude Haiku` },
	standard: { agent: 'Claude Code', model: `${CLOUD_PREFIX}Claude Sonnet` },
	strong: { agent: 'Claude Code', model: `${CLOUD_PREFIX}Claude Opus` },
};

const cellSchema: IJSONSchema = {
	type: 'object',
	properties: { agent: { type: 'string' }, model: { type: 'string' } },
	required: ['agent', 'model'],
};

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'pollisModelRouting',
	title: localize('modelRouting.configurationTitle', "Pollis Model Tasks and Routing"),
	type: 'object',
	properties: {
		[TIER_CELLS_SETTING]: {
			// No default in the setting itself: an object setting merges with its default, so a tier taken out of
			// its cell would come back; tierCells gives DEFAULT_TIER_CELLS while the setting is unset
			type: 'object',
			default: {},
			additionalProperties: cellSchema,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('modelRouting.tierCellsSetting', "The cell of each tier in the table of agents and models: `light`, `standard`, `strong` or the name of a tier of your own, each with its `agent`, by name, and its `model`: `cloud:` and the name of a model of `#pollis.agents.cloudModels#`, or `local:` and a GGUF file, served on this computer by the llama.cpp that comes with Pollis. Unset: Light, Standard and Strong on Claude Code's Haiku, Sonnet and Opus. Use **Compose > Orchestration > Model Tasks and Routing** to change them."),
		},
		[CLOUD_MODELS_SETTING]: {
			type: 'array',
			default: CLOUD_MODELS,
			items: {
				type: 'object',
				properties: { name: { type: 'string' }, agents: { type: 'object', additionalProperties: { type: 'string' } } },
				required: ['name', 'agents'],
			},
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('modelRouting.cloudModelsSetting', "The cloud models of the rows of **Compose > Orchestration > Model Tasks and Routing**: each its `name` and, under `agents`, for each agent that runs it, by the agent's name, the arguments that choose it, for example `\"Codex\": \"-m gpt-5.5\"`. An agent that has none for a model cannot run it."),
		},
		[AGENT_TASK_TIERS_SETTING]: {
			type: 'object',
			default: {},
			properties: Object.fromEntries(AGENT_TASKS.map(task => [task.id, { type: 'string' }])),
			additionalProperties: false,
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('modelRouting.taskTiersSetting', "The tier of an agent task, when it is not its default one: `light`, `standard`, `strong` or the name of a tier of your own of `#pollis.agents.tierCells#`. Use **Compose > Orchestration > Model Tasks and Routing** to change them."),
		},
		[OLD_AGENT_COMMAND_SETTING]: {
			type: 'string',
			default: '',
			scope: ConfigurationScope.APPLICATION,
			markdownDeprecationMessage: localize('modelRouting.oldCommandSetting', "Replaced by `#pollis.agents.tierCells#`: every task runs on a tier."),
		},
		[OLD_AGENT_TIERS_SETTING]: {
			type: 'object',
			default: {},
			additionalProperties: { type: 'string' },
			scope: ConfigurationScope.APPLICATION,
			markdownDeprecationMessage: localize('modelRouting.oldTiersSetting', "Replaced by `#pollis.agents.tierCells#`."),
		},
		[OLD_AGENT_TIER_MODELS_SETTING]: {
			type: 'object',
			default: {},
			additionalProperties: { type: 'string' },
			scope: ConfigurationScope.APPLICATION,
			markdownDeprecationMessage: localize('modelRouting.oldTierModelsSetting', "Replaced by `#pollis.agents.tierCells#`."),
		},
	},
});

/** The cells of the tiers, those well formed; the defaults while the setting is unset. */
export function tierCells(configurationService: IConfigurationService): Record<AgentTier, ITierCell> {
	const cells: Record<string, Partial<ITierCell>> | undefined = configurationService.inspect<Record<string, Partial<ITierCell>>>(TIER_CELLS_SETTING).userValue ?? DEFAULT_TIER_CELLS;
	const valid: Record<AgentTier, ITierCell> = {};
	for (const [tier, cell] of Object.entries(cells && typeof cells === 'object' ? cells : {})) {
		if (tier.trim() && typeof cell?.agent === 'string' && typeof cell.model === 'string') {
			valid[tier] = { agent: cell.agent, model: cell.model };
		}
	}
	return valid;
}

/** The cloud models of the rows, those well formed, none twice. */
export function cloudModels(configurationService: IConfigurationService): readonly ICloudModel[] {
	const models = configurationService.getValue<readonly Partial<ICloudModel>[]>(CLOUD_MODELS_SETTING);
	const valid: ICloudModel[] = [];
	for (const model of Array.isArray(models) ? models : []) {
		const name = typeof model?.name === 'string' ? model.name.trim() : '';
		if (name && model.agents && typeof model.agents === 'object' && !valid.some(other => other.name === name)) {
			valid.push({ name, agents: Object.fromEntries(Object.entries(model.agents as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && !!entry[1].trim())) });
		}
	}
	return valid;
}

/** The tier a name typed in a cell is: one of the three, by its id or its name in any case, or one of the user's. */
export function tierOfName(configurationService: IConfigurationService, name: string): AgentTier {
	const lower = name.trim().toLowerCase();
	return agentTiers(configurationService).find(tier => tier.id.toLowerCase() === lower || tier.label.toLowerCase() === lower)?.id ?? name.trim();
}

/** The tiers: the three that come with Pollis, then those the user named, in the order of their cells. */
export function agentTiers(configurationService: IConfigurationService): readonly IAgentTierInfo[] {
	const user = Object.keys(tierCells(configurationService))
		.filter(tier => !AGENT_TIERS.some(info => info.id === tier))
		.map(tier => ({ id: tier, label: tier, description: localize('modelRouting.userDescription', "A tier of your own"), user: true }));
	return [...AGENT_TIERS, ...user];
}

/** The tier a task runs on: its override, else its default. A tier that is no more is no override. */
export function taskTier(configurationService: IConfigurationService, task: AgentTask): AgentTier {
	const override = configurationService.getValue<Partial<Record<AgentTask, AgentTier>>>(AGENT_TASK_TIERS_SETTING)?.[task];
	const known = override !== undefined && agentTiers(configurationService).some(tier => tier.id === override);
	return known ? override : AGENT_TASKS.find(info => info.id === task)!.tier;
}

/** The name of a local model, from its file or `hf:` file. */
export function modelName(model: string): string {
	return basename(model).replace(/\.gguf$/i, '');
}

/** The agent a program is, for a local model: `claude`, `opencode` or `codex`, else undefined. */
function localAgent(program: string): 'claude' | 'opencode' | 'codex' | undefined {
	const agent = basename(program).toLowerCase().replace(/\.(exe|cmd|bat)$/, '');
	return agent === 'claude' || agent === 'opencode' || agent === 'codex' ? agent : undefined;
}

/** Whether an agent's command line can run on a local model: Claude Code, OpenCode and Codex can (localModelLaunch). */
export function runsLocalModels(command: string): boolean {
	const program = /^\s*(?:"(?<quoted>[^"]*)"|(?<plain>\S+))/.exec(command)?.groups;
	return !!localAgent(program?.quoted ?? program?.plain ?? '');
}

/** Whether an agent can run the model of a row: a cloud model it has arguments for, a local model if it runs them. */
export function cellAvailable(agent: IAgentCommand, model: string, clouds: readonly ICloudModel[]): boolean {
	if (model.startsWith(CLOUD_PREFIX)) {
		return !!clouds.find(cloud => cloud.name === model.slice(CLOUD_PREFIX.length))?.agents[agent.label];
	}
	return model.startsWith(LOCAL_PREFIX) && runsLocalModels(agent.command);
}

/**
 * The command line and local model a tier runs: its agent's command line, with the arguments of its cloud model
 * after the program, or its local model. Undefined when the tier is in no cell, or its agent or model is no more.
 */
export function tierRun(configurationService: IConfigurationService, tier: AgentTier, agents: readonly IAgentCommand[]): { readonly agent: string; readonly command: string; readonly model: string } | undefined {
	const cell = tierCells(configurationService)[tier];
	const agent = cell && agents.find(candidate => candidate.label === cell.agent);
	const clouds = cloudModels(configurationService);
	if (!cell || !agent || !cellAvailable(agent, cell.model, clouds)) {
		return undefined;
	}
	if (cell.model.startsWith(CLOUD_PREFIX)) {
		const args = clouds.find(cloud => cloud.name === cell.model.slice(CLOUD_PREFIX.length))!.agents[agent.label].trim();
		return { agent: agent.label, command: agent.command.replace(/^\s*("[^"]*"|\S+)/, `$1 ${args}`), model: '' };
	}
	return { agent: agent.label, command: agent.command, model: cell.model.startsWith(LOCAL_PREFIX) ? cell.model.slice(LOCAL_PREFIX.length) : '' };
}

/** The context Pollis gives a local model for an agent, in tokens: an agent's instructions and tools alone take about 20k. */
const AGENT_CONTEXT = 32768;

/** The provider id under which OpenCode and Codex reach the local server. */
const LOCAL_PROVIDER = 'pollis-llamacpp';

/** The arguments and environment that point an agent at a local model. */
export interface ILocalModelLaunch {
	readonly args: string[];
	readonly env: Record<string, string>;
}

/** Drops the agent's own choice of model from its arguments, and Codex's --oss, so the local model is used. */
function withoutModel(args: readonly string[]): string[] {
	const kept: string[] = [];
	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--model' || args[i] === '-m') {
			i++;
		} else if (!args[i].startsWith('--model=') && args[i] !== '--oss') {
			kept.push(args[i]);
		}
	}
	return kept;
}

/**
 * Starts llama-server for `model`, or finds the one already running, and returns the arguments and
 * environment that point the agent `program` at it: Claude Code through its Anthropic API, OpenCode and Codex
 * through its OpenAI API. Returns the reason, as a message, when the agent cannot use it.
 */
export async function localModelLaunch(commandService: ICommandService, program: string, args: readonly string[], model: string): Promise<ILocalModelLaunch | string> {
	const agent = localAgent(program);
	if (!agent) {
		return localize('modelRouting.localAgent', "A local model works with Claude Code, OpenCode or Codex, and this tier runs '{0}'.", program);
	}
	const answer = await commandService.executeCommand<{ url?: string; model?: string; error?: string }>('language-julia.pollisLlamaServer', { model, context: AGENT_CONTEXT });
	if (!answer?.url) {
		return answer?.error ?? localize('modelRouting.noServer', "llama.cpp did not start {0}.", modelName(model));
	}
	const url = answer.url;
	const name = answer.model ?? modelName(model);
	const rest = withoutModel(args);
	if (agent === 'claude') {
		return {
			args: rest,
			env: {
				ANTHROPIC_BASE_URL: url.replace(/\/v1$/, ''),
				ANTHROPIC_AUTH_TOKEN: 'local',
				ANTHROPIC_MODEL: name,
				ANTHROPIC_DEFAULT_OPUS_MODEL: name,
				ANTHROPIC_DEFAULT_SONNET_MODEL: name,
				ANTHROPIC_DEFAULT_HAIKU_MODEL: name,
				CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
			},
		};
	}
	if (agent === 'opencode') {
		const config = {
			provider: { [LOCAL_PROVIDER]: { npm: '@ai-sdk/openai-compatible', name: 'llama.cpp', options: { baseURL: url }, models: { [name]: { name, limit: { context: AGENT_CONTEXT, output: 8192 } } } } },
			model: `${LOCAL_PROVIDER}/${name}`,
		};
		return { args: rest, env: { OPENCODE_CONFIG_CONTENT: JSON.stringify(config) } };
	}
	// Codex reads each -c value as TOML, and as a plain string when it is not TOML, so none needs quotes
	return {
		args: [
			'-c', `model_provider=${LOCAL_PROVIDER}`,
			'-c', `model_providers.${LOCAL_PROVIDER}.name=llama.cpp`,
			'-c', `model_providers.${LOCAL_PROVIDER}.base_url=${url}`,
			'-c', `model_providers.${LOCAL_PROVIDER}.wire_api=responses`,
			'--model', name,
			...rest,
		],
		env: {},
	};
}
