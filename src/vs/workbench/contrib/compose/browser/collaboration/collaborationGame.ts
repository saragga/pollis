/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../../base/common/buffer.js';
import { Event } from '../../../../../base/common/event.js';
import { FileAccess } from '../../../../../base/common/network.js';
import { basename, joinPath } from '../../../../../base/common/resources.js';
import { URI } from '../../../../../base/common/uri.js';
import { localize } from '../../../../../nls.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IProgressService, ProgressLocation } from '../../../../../platform/progress/common/progress.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { parseToml, TomlValue } from '../../../model/browser/common/tomlPanelData.js';
import { findPollisWorkspace, pollisWorkspaceFolder } from '../../../pollisWorkspace/browser/pollisWorkspace.contribution.js';
import { ITerminalService } from '../../../terminal/browser/terminal.js';
import { GameValues, IGameDecision, IGamePayload, IGameTable } from './collaborationProtocol.js';

// Compose > Collaboration > Simulation Games, on the facilitator's computer: the cases, and a game's rounds.
// A case is a folder with case.toml (its rounds, teams, decisions and results) and model.jl, which
// media/games/game.jl runs for each round in a fresh Julia process (see that file). A game is a folder of the
// Pollis Workspace, games/<case>/<date>: game.toml with its teams and seed, and round-00, round-01... with the
// teams' decisions, the model's state and the results.

const GAMES_MEDIA = 'vs/workbench/contrib/compose/browser/media/games';
const RUNNER = `${GAMES_MEDIA}/game.jl`;
const CASE_FILE = 'case.toml';

/** A column of a case's results: the key of the model's rows, its heading, unit and decimals. */
interface IResultColumn {
	readonly key: string;
	readonly label: string;
	readonly unit?: string;
	readonly digits: number;
}

/** A case, as its case.toml describes it. */
export interface IGameCase {
	readonly folder: URI;
	readonly title: string;
	readonly description: string;
	readonly rounds: number;
	/** What a round is called, such as Year. */
	readonly roundLabel: string;
	readonly minTeams: number;
	readonly maxTeams: number;
	readonly decisions: readonly IGameDecision[];
	readonly publicColumns: readonly IResultColumn[];
	readonly privateColumns: readonly IResultColumn[];
}

/** A team of a game, its number from 1. */
export interface IGameTeam {
	readonly team: number;
	readonly name: string;
}

/** The results of a round: the table everyone sees, each team's own, and the model's text. */
export interface IRoundResults {
	readonly text?: string;
	readonly public: IGameTable;
	readonly private: ReadonlyMap<number, IGameTable>;
}

/** The cases that come with Pollis: each folder of media/games with a case.toml. */
export async function builtInCases(fileService: IFileService): Promise<URI[]> {
	const root = FileAccess.asFileUri(GAMES_MEDIA);
	const stat = await fileService.resolve(root).catch(() => undefined);
	const folders = (stat?.children ?? []).filter(child => child.isDirectory).map(child => child.resource);
	const cases: URI[] = [];
	for (const folder of folders) {
		if (await fileService.exists(joinPath(folder, CASE_FILE))) {
			cases.push(folder);
		}
	}
	return cases;
}

/** Reads a case's case.toml; throws, saying what is wrong, when it is not a case. */
export async function loadCase(fileService: IFileService, folder: URI): Promise<IGameCase> {
	const name = basename(folder);
	if (!await fileService.exists(joinPath(folder, 'model.jl'))) {
		throw new Error(localize('game.noModel', "{0} is not a case: it has no model.jl.", name));
	}
	let toml: TomlValue;
	try {
		toml = parseToml((await fileService.readFile(joinPath(folder, CASE_FILE))).value.toString());
	} catch (error) {
		throw new Error(localize('game.badToml', "The case.toml of {0} could not be read: {1}", name, String(error?.message ?? error)));
	}
	const invalid = (what: string) => new Error(localize('game.invalid', "The case.toml of {0} is not valid: {1}", name, what));
	const title = text(toml.title);
	const rounds = toml.rounds;
	if (!title || typeof rounds !== 'number' || !Number.isInteger(rounds) || rounds < 1 || rounds > 50) {
		throw invalid('title, and rounds from 1 to 50');
	}
	const teams = Array.isArray(toml.teams) ? toml.teams : [];
	const [minTeams, maxTeams] = [teams[0], teams[1]];
	if (typeof minTeams !== 'number' || typeof maxTeams !== 'number' || !Number.isInteger(minTeams) || !Number.isInteger(maxTeams) || minTeams < 1 || maxTeams < minTeams) {
		throw invalid('teams = [least, most]');
	}
	const decisions = (Array.isArray(toml.decisions) ? toml.decisions as TomlValue[] : []).map(decision => {
		const key = text(decision.key);
		const label = text(decision.label) ?? key;
		if (!key || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || !label) {
			throw invalid('each decision needs a key, letters, digits and _, and a label');
		}
		const help = text(decision.help);
		if (decision.kind === 'choice') {
			const values = Array.isArray(decision.options) ? decision.options.filter((value): value is string => typeof value === 'string') : [];
			const labels = Array.isArray(decision.labels) ? decision.labels : [];
			if (!values.length) {
				throw invalid(`the choice ${key} needs options`);
			}
			const options = values.map((value, index) => ({ value, label: text(labels[index]) ?? value }));
			const fallback = typeof decision.default === 'string' && values.includes(decision.default) ? decision.default : values[0];
			return { key, label, kind: 'choice', help, options, default: fallback } satisfies IGameDecision;
		}
		const min = typeof decision.min === 'number' ? decision.min : undefined;
		const max = typeof decision.max === 'number' ? decision.max : undefined;
		if (min === undefined || max === undefined || max < min) {
			throw invalid(`the number ${key} needs min and max`);
		}
		const step = typeof decision.step === 'number' && decision.step > 0 ? decision.step : undefined;
		const fallback = typeof decision.default === 'number' ? Math.min(Math.max(decision.default, min), max) : min;
		return { key, label, kind: 'number', help, unit: text(decision.unit), min, max, step, default: fallback } satisfies IGameDecision;
	});
	if (!decisions.length) {
		throw invalid('no [[decisions]]');
	}
	const results = (toml.results ?? {}) as TomlValue;
	const columns = (list: unknown) => (Array.isArray(list) ? list as TomlValue[] : []).map(column => {
		const key = text(column.key);
		if (!key) {
			throw invalid('each column of the results needs a key');
		}
		return { key, label: text(column.label) ?? key, unit: text(column.unit), digits: typeof column.digits === 'number' ? Math.max(0, Math.min(6, Math.round(column.digits))) : 0 };
	});
	return {
		folder,
		title,
		description: text(toml.description) ?? '',
		rounds,
		roundLabel: text(toml.round) ?? localize('game.round', "Round"),
		minTeams,
		maxTeams,
		decisions,
		publicColumns: columns(results.public),
		privateColumns: columns(results.private),
	};
}

function text(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/** A team's values for the decisions, each within its case's bounds or among its options; what is missing from `fallback`. */
export function checkedValues(decisions: readonly IGameDecision[], values: unknown, fallback: GameValues): GameValues {
	const given = values && typeof values === 'object' ? values as Record<string, unknown> : {};
	const checked: Record<string, number | string> = {};
	for (const decision of decisions) {
		const value = given[decision.key];
		if (decision.kind === 'choice') {
			checked[decision.key] = typeof value === 'string' && decision.options!.some(option => option.value === value) ? value : fallback[decision.key] ?? decision.default;
		} else {
			const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
			checked[decision.key] = Number.isFinite(number) ? Math.min(Math.max(number, decision.min!), decision.max!) : fallback[decision.key] ?? decision.default;
		}
	}
	return checked;
}

/** On a player's side, the game as the facilitator sent it, checked: undefined when it is not one. */
export function checkedGame(payload: unknown): IGamePayload | undefined {
	if (!payload || typeof payload !== 'object') {
		return undefined;
	}
	const game = payload as Record<string, unknown>;
	const title = shortText(game.title, 200);
	const { rounds, round } = game;
	if (!title || !isWhole(rounds) || !isWhole(round) || rounds < 1 || rounds > 50 || round < 0 || round > rounds + 1 || !Array.isArray(game.decisions)) {
		return undefined;
	}
	const decisions = game.decisions.slice(0, 50).map(checkedDecision).filter(decision => decision !== undefined);
	const team = isWhole(game.team) && game.team >= 1 && game.team <= 100 ? game.team : undefined;
	const submittedBy = shortText(game.submittedBy, 40);
	return {
		title,
		description: shortText(game.description, 2000) ?? '',
		roundLabel: shortText(game.roundLabel, 40) ?? localize('game.round', "Round"),
		rounds,
		round,
		decisions,
		...(team ? { team, teamName: shortText(game.teamName, 60) ?? localize('game.team', "Team {0}", team), values: checkedValues(decisions, game.values, defaultValues(decisions)) } : {}),
		...(submittedBy ? { submittedBy } : {}),
	};
}

function checkedDecision(value: unknown): IGameDecision | undefined {
	if (!value || typeof value !== 'object') {
		return undefined;
	}
	const decision = value as Record<string, unknown>;
	const key = shortText(decision.key, 60);
	const label = shortText(decision.label, 100);
	if (!key || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || !label) {
		return undefined;
	}
	const help = shortText(decision.help, 500);
	if (decision.kind === 'choice') {
		const options = (Array.isArray(decision.options) ? decision.options : []).slice(0, 50).flatMap(option => {
			const optionValue = option && typeof option === 'object' ? shortText((option as Record<string, unknown>).value, 100) : undefined;
			return optionValue ? [{ value: optionValue, label: shortText((option as Record<string, unknown>).label, 100) ?? optionValue }] : [];
		});
		if (!options.length) {
			return undefined;
		}
		const fallback = typeof decision.default === 'string' && options.some(option => option.value === decision.default) ? decision.default : options[0].value;
		return { key, label, kind: 'choice', help, options, default: fallback };
	}
	const { min, max, step } = decision;
	if (typeof min !== 'number' || typeof max !== 'number' || !Number.isFinite(min) || !Number.isFinite(max) || max < min) {
		return undefined;
	}
	const fallback = typeof decision.default === 'number' && Number.isFinite(decision.default) ? Math.min(Math.max(decision.default, min), max) : min;
	return { key, label, kind: 'number', help, unit: shortText(decision.unit, 40), min, max, step: typeof step === 'number' && step > 0 && Number.isFinite(step) ? step : undefined, default: fallback };
}

/** On a player's side, the tables of a round's results, checked: at most 10 tables of 30 columns and 200 rows. */
export function checkedTables(value: unknown): IGameTable[] {
	return (Array.isArray(value) ? value : []).slice(0, 10).flatMap(table => {
		if (!table || typeof table !== 'object') {
			return [];
		}
		const { title, columns, rows } = table as Record<string, unknown>;
		if (typeof title !== 'string' || !Array.isArray(columns) || !Array.isArray(rows)) {
			return [];
		}
		const cells = (list: unknown[]) => list.slice(0, 30).map(cell => typeof cell === 'string' ? cell.slice(0, 200) : '');
		return [{ title: title.slice(0, 200), columns: cells(columns), rows: rows.slice(0, 200).map(row => cells(Array.isArray(row) ? row : [])) }];
	});
}

function isWhole(value: unknown): value is number {
	return typeof value === 'number' && Number.isInteger(value);
}

function shortText(value: unknown, length: number): string | undefined {
	return typeof value === 'string' && value.trim() ? value.trim().slice(0, length) : undefined;
}

/** The case's default values. */
export function defaultValues(decisions: readonly IGameDecision[]): GameValues {
	return Object.fromEntries(decisions.map(decision => [decision.key, decision.default]));
}

/**
 * A game, on the facilitator's computer: its folder, its teams and rounds, the decisions submitted for the round
 * being decided, and the model run for each round.
 */
export class GameRun {

	/** The round being decided: 0 before the game starts, rounds + 1 once it is over. */
	private _round = 0;
	private _teams: readonly IGameTeam[] = [];
	private folder: URI | undefined;
	private running = false;
	/** This round's submissions, and the values each team played last, by team. */
	private readonly submitted = new Map<number, { readonly values: GameValues; readonly by: string }>();
	private readonly played = new Map<number, GameValues>();

	constructor(
		readonly gameCase: IGameCase,
		@IFileService private readonly fileService: IFileService,
		@ITerminalService private readonly terminalService: ITerminalService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IProgressService private readonly progressService: IProgressService,
		@IWorkspaceContextService private readonly contextService: IWorkspaceContextService,
		@IPathService private readonly pathService: IPathService,
	) { }

	get round(): number {
		return this._round;
	}

	get teams(): readonly IGameTeam[] {
		return this._teams;
	}

	get isOver(): boolean {
		return this._round > this.gameCase.rounds;
	}

	get isRunning(): boolean {
		return this.running;
	}

	/** Where the game's rounds are kept, once it has started. */
	get folderPath(): string {
		return this.folder?.fsPath ?? '';
	}

	/** The name of a team, such as Team 2. */
	teamName(team: number): string {
		return this._teams.find(item => item.team === team)?.name ?? localize('game.team', "Team {0}", team);
	}

	/** A round's name, such as Year 2. */
	roundName(round: number): string {
		return localize('game.roundName', "{0} {1}", this.gameCase.roundLabel, round);
	}

	/** A team's values for the round being decided: submitted, else those it played last, else the case's defaults. */
	values(team: number): GameValues {
		return this.submitted.get(team)?.values ?? this.played.get(team) ?? defaultValues(this.gameCase.decisions);
	}

	submittedBy(team: number): string | undefined {
		return this.submitted.get(team)?.by;
	}

	/** A player submits their team's decisions; the last submitted before the round is played counts. */
	submit(team: number, values: unknown, by: string): void {
		if (this._round >= 1 && !this.isOver && this._teams.some(item => item.team === team)) {
			this.submitted.set(team, { values: checkedValues(this.gameCase.decisions, values, this.values(team)), by });
		}
	}

	/** Starts the game with its teams: writes game.toml and the model's state before round 1. */
	async start(count: number): Promise<void> {
		this._teams = Array.from({ length: count }, (_, index) => ({ team: index + 1, name: localize('game.team', "Team {0}", index + 1) }));
		this.folder = await this.newFolder();
		const seed = Math.floor(Math.random() * 1_000_000_000);
		await this.write('game.toml', [
			`case = ${tomlString(basename(this.gameCase.folder))}`,
			`title = ${tomlString(this.gameCase.title)}`,
			`seed = ${seed}`,
			...this._teams.flatMap(team => ['', '[[teams]]', `team = ${team.team}`, `name = ${tomlString(team.name)}`]),
			'',
		].join('\n'));
		await this.run(0);
		this._round = 1;
	}

	/** Plays the round being decided with every team's decisions, and opens the next. */
	async play(): Promise<IRoundResults> {
		const round = this._round;
		const values = new Map(this._teams.map(team => [team.team, this.values(team.team)]));
		const lines = [`round = ${round}`];
		for (const team of this._teams) {
			lines.push('', '[[teams]]', `team = ${team.team}`, `name = ${tomlString(team.name)}`, `submitted_by = ${tomlString(this.submittedBy(team.team) ?? '')}`, '[teams.decisions]');
			for (const [key, value] of Object.entries(values.get(team.team)!)) {
				lines.push(`${key} = ${typeof value === 'number' ? String(value) : tomlString(value)}`);
			}
		}
		await this.write(`${roundFolder(round)}/decisions.toml`, lines.join('\n') + '\n');
		const output = await this.run(round);
		this.submitted.clear();
		for (const [team, played] of values) {
			this.played.set(team, played);
		}
		this._round = round + 1;
		return this.tables(round, output);
	}

	/** The folder of a new game: games/<case>/<date and time> in the Pollis Workspace, else in ~/.pollis/games. */
	private async newFolder(): Promise<URI> {
		const workspace = await findPollisWorkspace(this.contextService, this.fileService);
		const games = workspace
			? await pollisWorkspaceFolder(this.fileService, workspace, 'games')
			: joinPath(await this.pathService.userHome({ preferLocal: true }), '.pollis', 'games');
		const now = new Date();
		const pad = (n: number) => String(n).padStart(2, '0');
		const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
		const folder = joinPath(games, basename(this.gameCase.folder), stamp);
		await this.fileService.createFolder(folder);
		return folder;
	}

	private async write(path: string, content: string): Promise<void> {
		await this.fileService.writeFile(joinPath(this.folder!, path), VSBuffer.fromString(content));
	}

	/** Runs game.jl for a round in a fresh Julia process and reads what it wrote: its results, or why it failed. */
	private async run(round: number): Promise<unknown> {
		if (this.running) {
			throw new Error(localize('game.busy', "A round is being played already."));
		}
		this.running = true;
		const folder = joinPath(this.folder!, roundFolder(round));
		const julia = this.configurationService.getValue<string>('julia.executablePath') || 'julia';
		try {
			return await this.progressService.withProgress({ location: ProgressLocation.Notification, delay: 1500, title: round ? localize('game.playing', "Playing {0} with Julia...", this.roundName(round)) : localize('game.starting', "Starting the game with Julia...") }, async () => {
				for (const file of ['results.json', 'error.txt']) {
					await this.fileService.del(joinPath(folder, file)).catch(() => undefined);
				}
				const instance = await this.terminalService.createTerminal({
					config: {
						name: localize('game.terminal', "Simulation Game"),
						executable: julia,
						args: ['--startup-file=no', FileAccess.asFileUri(RUNNER).fsPath, this.gameCase.folder.fsPath, this.folder!.fsPath, String(round)],
						cwd: this.folder!,
						hideFromUser: true,
						isTransient: true,
					},
				});
				try {
					const exit = instance.exitCode ?? await Event.toPromise(instance.onExit);
					const error = await this.fileService.readFile(joinPath(folder, 'error.txt')).then(content => content.value.toString(), () => undefined);
					if (error !== undefined) {
						throw new Error(localize('game.modelFailed', "The model of {0} failed: {1}", this.gameCase.title, error));
					}
					const results = await this.fileService.readFile(joinPath(folder, 'results.json')).then(content => content.value.toString(), () => undefined);
					if (results === undefined) {
						const reason = typeof exit === 'object' ? exit.message : localize('game.exitCode', "exit code {0}", String(exit));
						throw new Error(localize('game.juliaFailed', "Julia could not play the round ({0}). Check that Julia is installed, or set its path in the julia.executablePath setting.", reason));
					}
					return JSON.parse(results);
				} finally {
					instance.dispose();
				}
			});
		} finally {
			this.running = false;
		}
	}

	/** The model's results as tables: the public one, and each team's own, with one row shown as a column. */
	private tables(round: number, output: unknown): IRoundResults {
		const results = output && typeof output === 'object' ? output as { public?: unknown; private?: unknown; text?: unknown } : {};
		const name = this.roundName(round);
		const publicRows = Array.isArray(results.public) ? results.public : [];
		const privateRows = results.private && typeof results.private === 'object' ? results.private as Record<string, unknown> : {};
		const table = (title: string, columns: readonly IResultColumn[], rows: readonly unknown[]): IGameTable => {
			const cells = rows.map(row => columns.map(column => this.cell(column, row && typeof row === 'object' ? (row as Record<string, unknown>)[column.key] : undefined)));
			const headings = columns.map(column => column.unit ? localize('game.heading', "{0} ({1})", column.label, column.unit) : column.label);
			return cells.length === 1
				? { title, columns: [localize('game.item', "Item"), localize('game.value', "Value")], rows: headings.map((heading, index) => [heading, cells[0][index]]) }
				: { title, columns: headings, rows: cells };
		};
		const own = new Map<number, IGameTable>();
		for (const team of this._teams) {
			const rows = privateRows[String(team.team)];
			if (Array.isArray(rows) && rows.length && this.gameCase.privateColumns.length) {
				own.set(team.team, table(localize('game.teamTable', "{0}: {1}", name, team.name), this.gameCase.privateColumns, rows));
			}
		}
		return {
			text: typeof results.text === 'string' ? results.text : undefined,
			public: table(localize('game.publicTable', "{0}: Results", name), this.gameCase.publicColumns, publicRows),
			private: own,
		};
	}

	/** A cell: a number with its decimals, a choice by its label, anything else as text. */
	private cell(column: IResultColumn, value: unknown): string {
		if (typeof value === 'number') {
			return value.toLocaleString(undefined, { minimumFractionDigits: column.digits, maximumFractionDigits: column.digits });
		}
		if (typeof value === 'string') {
			const choice = this.gameCase.decisions.find(decision => decision.key === column.key && decision.kind === 'choice');
			return choice?.options?.find(option => option.value === value)?.label ?? value;
		}
		return value === undefined || value === null ? '' : String(value);
	}
}

function roundFolder(round: number): string {
	return `round-${String(round).padStart(2, '0')}`;
}

/** A TOML basic string: JSON's escapes are TOML's. */
function tomlString(value: string): string {
	return JSON.stringify(value);
}
