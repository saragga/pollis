/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { ITerminalInstanceService } from '../../terminal/browser/terminal.js';
import { findPollisWorkspace, pollisWorkspaceFolderPath } from '../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { cellAvailable, CLOUD_PREFIX, cloudModels, IAgentCommand, ICellRun, cellRun, LOCAL_PREFIX } from './modelRouting.js';
import { IInstalledModel } from './modelsInstalledPage.js';
import { CODING_AGENTS, commandWords, findProgram, terminalEnvironment } from './pollisAgents.js';

// What the pages of Compose > Orchestration share, where several coding agents work on the same research at once
// (Many Analysts, in manyAnalystsPage.ts): the command lines that run an agent to the end with no one to answer
// it, the cells of Model Tasks and Routing a page offers, and the folder of its studies. A page launches each run
// with launchAgent (pollisAgents.ts) and follows it by its terminal and by the files it writes.

/**
 * The command line of each agent Pollis knows for a run that ends by itself: it takes the first message, works
 * with no questions asked and exits. `{model}` is where the arguments of a cloud model go.
 * - Claude Code: print mode, edits in its folder accepted, Julia the only command it runs.
 * - Codex: `codex exec`, which writes only in its folder.
 * - OpenCode: `opencode run`.
 * An agent of the user's own has none, so the pages do not offer it.
 */
const UNATTENDED_COMMANDS: Readonly<Record<string, string>> = {
	'Claude Code': 'claude -p --permission-mode acceptEdits --allowedTools "Bash(julia *)" {model} {prompt}',
	'Codex': 'codex exec -s workspace-write {model} {prompt}',
	'OpenCode': 'opencode run {model} {prompt}',
};

/** An agent and a model a page can run unattended: a cell of Model Tasks and Routing, with its name. */
export interface IOrchestrationCell {
	readonly agent: string;
	/** CLOUD_PREFIX and a cloud model's name, or LOCAL_PREFIX and a local model's file. */
	readonly model: string;
	/** Agent and model, as the page shows them, such as `Claude Code · Claude Sonnet`. */
	readonly label: string;
}

/** The agents that run unattended, with the command lines that do it. */
function unattendedAgents(): IAgentCommand[] {
	return CODING_AGENTS.filter(agent => UNATTENDED_COMMANDS[agent.label]).map(agent => ({ label: agent.label, command: UNATTENDED_COMMANDS[agent.label] }));
}

/**
 * The cells a page can run unattended: each agent of UNATTENDED_COMMANDS installed on this computer with each
 * cloud model it has arguments for, then with each local chat model that can call tools, when it runs local models.
 */
export async function unattendedCells(configurationService: IConfigurationService, commandService: ICommandService, terminalInstanceService: ITerminalInstanceService, fileService: IFileService): Promise<IOrchestrationCell[]> {
	const environment = await terminalEnvironment(terminalInstanceService);
	const clouds = cloudModels(configurationService);
	const installed = (await commandService.executeCommand<IInstalledModel[]>('language-julia.pollisInstalledModels') ?? []).filter(model => model.kind !== 'embedding' && model.kind !== 'reranker' && model.tools !== false);
	const cells: IOrchestrationCell[] = [];
	for (const agent of unattendedAgents()) {
		if (!await findProgram(commandWords(agent.command)[0], environment, fileService)) {
			continue;
		}
		const models = [
			...clouds.map(cloud => ({ model: CLOUD_PREFIX + cloud.name, name: cloud.name })),
			...installed.map(model => ({ model: LOCAL_PREFIX + model.file, name: model.name })),
		];
		for (const model of models) {
			if (cellAvailable(agent, model.model, clouds)) {
				cells.push({ agent: agent.label, model: model.model, label: localize('orchestration.cellLabel', "{0} · {1}", agent.label, model.name) });
			}
		}
	}
	return cells;
}

/** What a cell runs unattended: its command line, with its model's arguments, and its local model; undefined when it can run no more. */
export function unattendedRun(configurationService: IConfigurationService, cell: { readonly agent: string; readonly model: string }): ICellRun | undefined {
	return cellRun(configurationService, cell, unattendedAgents());
}

/**
 * The folder of a page's studies, `kind` such as `many-analysts`: in the folder orchestration of the open Pollis
 * Workspace, otherwise in ~/.pollis/orchestration.
 */
export async function studiesFolder(contextService: IWorkspaceContextService, fileService: IFileService, pathService: IPathService, kind: string): Promise<URI> {
	const workspace = await findPollisWorkspace(contextService, fileService);
	return workspace
		? joinPath(await pollisWorkspaceFolderPath(fileService, workspace, 'orchestration'), kind)
		: joinPath(await pathService.userHome({ preferLocal: true }), '.pollis', 'orchestration', kind);
}

/** Whether a study's name can be its folder's: letters, digits, hyphens and underscores, 1 to 60 of them. */
export function validStudyName(name: string): boolean {
	return /^[A-Za-z0-9][A-Za-z0-9_-]{0,59}$/.test(name);
}

/** The name of a study's folder: `base`, else `base-2`, `base-3`... the first of them not in `taken`. */
export function freeStudyName(base: string, taken: readonly string[]): string {
	let name = base;
	for (let index = 2; taken.includes(name); index++) {
		name = `${base}-${index}`;
	}
	return name;
}
