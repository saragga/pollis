/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { shuffle } from '../../../../../base/common/arrays.js';
import { VSBuffer } from '../../../../../base/common/buffer.js';
import { Event } from '../../../../../base/common/event.js';
import { FileAccess } from '../../../../../base/common/network.js';
import { basename, isEqual, isEqualOrParent, joinPath } from '../../../../../base/common/resources.js';
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
import { IToolboxPanelsService } from '../../common/toolboxPanels.js';
import { IMarketSpec, MarketBook } from './collaborationMarket.js';
import { GameValues, IGameDecision, IGameNews, IGamePayload, IGameRole, IGameTable } from './collaborationProtocol.js';

// Compose > Simulation Games, on the facilitator's computer: the cases, which toolboxes bring
// (pollisToolboxes games) or the facilitator chooses, and a game's rounds.
// A case is a folder with case.toml (its rounds, teams, decisions, results, briefings and the ways its teams can
// be organised, each with its roles, and the news it brings) and model.jl, which
// media/games/game.jl runs for each round in a fresh Julia process (see that file). A game is a folder of the
// Pollis Workspace, games/<case>/<date>: game.toml with its teams and seed, and round-00, round-01... with the
// teams' decisions, the news released, the messages between teams, the model's state and the results.

const GAMES_MEDIA = 'vs/workbench/contrib/compose/browser/media/games';
const RUNNER = `${GAMES_MEDIA}/game.jl`;
const CASE_FILE = 'case.toml';
/** The longest briefing a case can give, and the longest text of a news item, in characters. */
const MAX_BRIEFING = 20_000;
export const MAX_NEWS_TEXT = 2000;

/** A column of a case's results: the key of the model's rows, its heading, unit and decimals. */
export interface IResultColumn {
	readonly key: string;
	readonly label: string;
	readonly unit?: string;
	readonly digits: number;
	/** For a column of each team's own results: the kinds of team that see it, by key, every team when missing. */
	readonly sides?: readonly string[];
}

/** A role in a team, with its briefing, read from the case's Markdown files, and the kinds of team that have it, every team when missing. */
export interface ICaseRole extends IGameRole {
	readonly briefing?: string;
	readonly sides?: readonly string[];
}

/** A kind of team in a case whose teams differ, such as the buyer and the sellers: how many teams it has, and the briefing its players read. */
export interface IGameSide {
	readonly key: string;
	readonly label: string;
	readonly teams: number;
	readonly briefing?: string;
}

/** A way of organising the teams of a case, such as Board Members or Departments: the roles each team has. */
export interface IGameStructure {
	readonly key: string;
	readonly label: string;
	readonly description: string;
	readonly roles: readonly ICaseRole[];
}

/** A change a news item makes to the model's parameters: the parameter's place in [parameters], such as bean_cost.origin, and its new value. */
export interface IParameterChange {
	readonly path: string;
	readonly value: number;
}

/** A news item: scripted by the case for a round, or written by the facilitator. */
export interface ICaseNews {
	/** The round it is released in, or, for a scripted item, the first round it can be. */
	readonly round: number;
	readonly title: string;
	readonly text: string;
	/** The roles it is for, by key; everyone when missing, or when the game's structure has none of them. */
	readonly roles?: readonly string[];
	/** The parameters it changes, from the round being decided on. */
	readonly changes: readonly IParameterChange[];
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
	/** The briefing every player reads. */
	readonly briefing?: string;
	/** The ways the teams can be organised, the facilitator choosing one when hosting the game; at least one. */
	readonly structures: readonly IGameStructure[];
	/** The model's parameters that are numbers, by their place in [parameters], which news can change. */
	readonly parameters: ReadonlyMap<string, number>;
	/** The news the case brings, in the order of case.toml. */
	readonly news: readonly ICaseNews[];
	/** Whether teams can write to each other, the facilitator reading what they write (negotiations = false in case.toml turns it off). */
	readonly negotiations: boolean;
	/** The column of the public results whose highest value, in the last round, wins: [results] winner, which ranks the teams of each side among themselves in a case with sides; the rows name their team in their team column. */
	readonly winner?: IResultColumn;
	/** The questions the case suggests for the debrief, in Markdown. */
	readonly debrief?: string;
	/** The names of the teams, in order (team_names in case.toml); a team without one is Team n, or its side's label. */
	readonly teamNames: readonly string[];
	/** The kinds of team ([[sides]] in case.toml), in order, their teams numbered one side after the other; none when every team is alike. */
	readonly sides: readonly IGameSide[];
	/** The name of each round (round_names in case.toml); a round without one is its round label and number. */
	readonly roundNames: readonly string[];
	/** The numbers of rounds the facilitator can choose from when hosting the game (round_choices in case.toml), each at most rounds; none when the game always has rounds. */
	readonly roundChoices: readonly number[];
	/** In a Trading Floor case ([market] in case.toml), the market the teams trade on in each round, a period by the clock, in place of a form of decisions. */
	readonly market?: IMarketSpec;
}

/** A team of a game, its number from 1, and its kind, by key, in a case with sides. */
export interface IGameTeam {
	readonly team: number;
	readonly name: string;
	readonly side?: string;
}

/** The results of a round: the table everyone sees, each team's own, the model's text, what it says to each team alone, the teams it says leave the game (with why), and whether it ends the game. */
export interface IRoundResults {
	readonly text?: string;
	readonly public: IGameTable;
	readonly private: ReadonlyMap<number, IGameTable>;
	readonly teamText: ReadonlyMap<number, string>;
	readonly out: ReadonlyMap<number, string>;
	readonly over: boolean;
}

/** The cases of the installed toolboxes, each with its toolbox's name. */
export function toolboxCases(toolboxPanelsService: IToolboxPanelsService): { readonly folder: URI; readonly toolbox: string }[] {
	return toolboxPanelsService.getToolboxes().flatMap(toolbox => toolbox.games.map(folder => ({ folder, toolbox: toolbox.extensionName })));
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
	// A briefing is a Markdown file of the case's folder, or several, read one after the other
	const briefing = async (value: unknown): Promise<string | undefined> => {
		if (value === undefined) {
			return undefined;
		}
		const paths = typeof value === 'string' ? [value] : Array.isArray(value) && value.every(path => typeof path === 'string') ? value as string[] : undefined;
		if (!paths?.length) {
			throw invalid('a briefing is a file of the case, or a list of them');
		}
		const parts: string[] = [];
		for (const path of paths) {
			const file = joinPath(folder, path);
			if (!isEqualOrParent(file, folder) || isEqual(file, folder)) {
				throw invalid(`the briefing ${path} is outside the case's folder`);
			}
			const content = await fileService.readFile(file).then(read => read.value.toString(), () => undefined);
			if (content === undefined) {
				throw invalid(`the briefing ${path} is missing`);
			}
			parts.push(content.trim());
		}
		const joined = parts.join('\n\n');
		if (joined.length > MAX_BRIEFING) {
			throw invalid(`a briefing is longer than ${MAX_BRIEFING} characters`);
		}
		return joined || undefined;
	};
	// The kinds of team, when they differ: then the teams are as many as the sides have
	const sides: IGameSide[] = [];
	for (const side of Array.isArray(toml.sides) ? toml.sides as TomlValue[] : []) {
		const key = text(side.key);
		const label = text(side.label);
		if (!key || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || !label || sides.some(other => other.key === key) || !isWhole(side.teams) || side.teams < 1 || side.teams > 20) {
			throw invalid('each side needs a key of its own, letters, digits and _, a label, and teams from 1 to 20');
		}
		const sideBriefing = await briefing(side.briefing);
		sides.push({ key, label, teams: side.teams, ...(sideBriefing ? { briefing: sideBriefing } : {}) });
	}
	const sideKeys = new Set(sides.map(side => side.key));
	// The sides a decision, a role or a column is for: keys of the [[sides]]
	const sidesOf = (value: unknown, what: string): { sides?: string[] } => {
		if (value === undefined) {
			return {};
		}
		if (!Array.isArray(value) || !value.length || value.some(key => typeof key !== 'string' || !sideKeys.has(key))) {
			throw invalid(`the sides of ${what} are keys of the [[sides]]`);
		}
		return { sides: [...new Set(value as string[])] };
	};
	const teams = Array.isArray(toml.teams) ? toml.teams : [];
	const sideTeams = sides.reduce((sum, side) => sum + side.teams, 0);
	const [minTeams, maxTeams] = sides.length ? [sideTeams, sideTeams] : [teams[0], teams[1]];
	if (typeof minTeams !== 'number' || typeof maxTeams !== 'number' || !Number.isInteger(minTeams) || !Number.isInteger(maxTeams) || minTeams < 1 || maxTeams < minTeams) {
		throw invalid('teams = [least, most]');
	}
	const decisions = (Array.isArray(toml.decisions) ? toml.decisions as TomlValue[] : []).map(decision => {
		const key = text(decision.key);
		const label = text(decision.label) ?? key;
		if (!key || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || !label) {
			throw invalid('each decision needs a key, letters, digits and _, and a label');
		}
		if (decision.rounds !== undefined && (!Array.isArray(decision.rounds) || !decision.rounds.length || decision.rounds.some(round => !isWhole(round) || round < 1 || round > rounds))) {
			throw invalid(`the rounds of the decision ${key} are rounds of the game`);
		}
		const scope = { ...sidesOf(decision.sides, `the decision ${key}`), ...(Array.isArray(decision.rounds) ? { rounds: [...new Set(decision.rounds as number[])] } : {}), ...(decision.rivals === true ? { rivals: true } : {}) };
		const help = text(decision.help);
		if (decision.kind === 'choice') {
			const values = Array.isArray(decision.options) ? decision.options.filter((value): value is string => typeof value === 'string') : [];
			const labels = Array.isArray(decision.labels) ? decision.labels : [];
			if (!values.length) {
				throw invalid(`the choice ${key} needs options`);
			}
			const options = values.map((value, index) => ({ value, label: text(labels[index]) ?? value }));
			const fallback = typeof decision.default === 'string' && values.includes(decision.default) ? decision.default : values[0];
			return { key, label, kind: 'choice', help, options, default: fallback, ...scope } satisfies IGameDecision;
		}
		const min = typeof decision.min === 'number' ? decision.min : undefined;
		const max = typeof decision.max === 'number' ? decision.max : undefined;
		if (min === undefined || max === undefined || max < min) {
			throw invalid(`the number ${key} needs min and max`);
		}
		const step = typeof decision.step === 'number' && decision.step > 0 ? decision.step : undefined;
		const fallback = typeof decision.default === 'number' ? Math.min(Math.max(decision.default, min), max) : min;
		return { key, label, kind: 'number', help, unit: text(decision.unit), min, max, step, default: fallback, ...scope } satisfies IGameDecision;
	});
	const market = marketSpec(toml.market, invalid);
	if (!decisions.length && !market) {
		throw invalid('no [[decisions]], and no [market]');
	}
	const keys = new Set(decisions.map(decision => decision.key));
	const role = async (value: TomlValue): Promise<ICaseRole> => {
		const key = text(value.key);
		const label = text(value.label) ?? key;
		if (!key || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || !label) {
			throw invalid('each role needs a key, letters, digits and _, and a label');
		}
		let decides: string[] | undefined;
		if (value.decides !== undefined) {
			if (!Array.isArray(value.decides) || value.decides.some(decision => typeof decision !== 'string' || !keys.has(decision))) {
				throw invalid(`the role ${key} decides only keys of the [[decisions]]`);
			}
			decides = [...new Set(value.decides as string[])];
		}
		const roleBriefing = await briefing(value.briefing);
		return { key, label, ...(decides ? { decides } : {}), ...(roleBriefing ? { briefing: roleBriefing } : {}), ...sidesOf(value.sides, `the role ${key}`) };
	};
	const structures: IGameStructure[] = [];
	for (const structure of Array.isArray(toml.structures) ? toml.structures as TomlValue[] : []) {
		const key = text(structure.key);
		const label = text(structure.label);
		if (!key || !label || structures.some(other => other.key === key)) {
			throw invalid('each structure needs a key of its own and a label');
		}
		const roles: ICaseRole[] = [];
		for (const value of Array.isArray(structure.roles) ? structure.roles as TomlValue[] : []) {
			const read = await role(value);
			if (roles.some(other => other.key === read.key)) {
				throw invalid(`the structure ${key} has two roles ${read.key}`);
			}
			roles.push(read);
		}
		const roleless = sides.find(side => roles.length && !roles.some(item => !item.sides || item.sides.includes(side.key)));
		if (roleless) {
			throw invalid(`the structure ${key} has no role for the side ${roleless.key}`);
		}
		structures.push({ key, label, description: text(structure.description) ?? '', roles: roles.length ? roles : [boardMember()] });
	}
	const parameters = new Map(leaves(toml.parameters).filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1])));
	const roleKeys = new Set(structures.flatMap(structure => structure.roles.map(role => role.key)));
	const news = (Array.isArray(toml.news) ? toml.news as TomlValue[] : []).map(item => {
		const title = text(item.title);
		const body = text(item.text);
		if (!isWhole(item.round) || item.round < 1 || item.round > rounds || !title || !body || body.length > MAX_NEWS_TEXT) {
			throw invalid(`each news item needs a round of the game, a title and a text of at most ${MAX_NEWS_TEXT} characters`);
		}
		if (item.roles !== undefined && (!Array.isArray(item.roles) || item.roles.some(key => typeof key !== 'string' || !roleKeys.has(key)))) {
			throw invalid(`the roles of the news ${title} are keys of the roles`);
		}
		const changes = leaves(item.parameters).map(([path, value]) => {
			if (!parameters.has(path) || typeof value !== 'number' || !Number.isFinite(value)) {
				throw invalid(`the news ${title} changes ${path}, which is not a number of [parameters]`);
			}
			return { path, value };
		});
		return { round: item.round, title, text: body, ...(Array.isArray(item.roles) ? { roles: item.roles as string[] } : {}), changes } satisfies ICaseNews;
	});
	if (toml.round_choices !== undefined && (!Array.isArray(toml.round_choices) || toml.round_choices.some(count => !isWhole(count) || count < 1 || count > rounds))) {
		throw invalid('round_choices are numbers of rounds from 1 to rounds');
	}
	const roundChoices = Array.isArray(toml.round_choices) ? [...new Set(toml.round_choices as number[])].sort((a, b) => a - b) : [];
	const results = (toml.results ?? {}) as TomlValue;
	const columns = (list: unknown) => (Array.isArray(list) ? list as TomlValue[] : []).map(column => {
		const key = text(column.key);
		if (!key) {
			throw invalid('each column of the results needs a key');
		}
		return { key, label: text(column.label) ?? key, unit: text(column.unit), digits: typeof column.digits === 'number' ? Math.max(0, Math.min(6, Math.round(column.digits))) : 0, ...sidesOf(column.sides, `the column ${key}`) };
	});
	const publicColumns = columns(results.public);
	const winnerKey = text(results.winner);
	const winner = winnerKey ? publicColumns.find(column => column.key === winnerKey) : undefined;
	if (winnerKey && !winner) {
		throw invalid(`the winner ${winnerKey} is not a column of [[results.public]]`);
	}
	return {
		folder,
		title,
		description: text(toml.description) ?? '',
		rounds,
		roundLabel: text(toml.round) ?? localize('game.round', "Round"),
		minTeams,
		maxTeams,
		decisions,
		publicColumns,
		privateColumns: columns(results.private),
		briefing: await briefing(toml.briefing),
		parameters,
		news,
		negotiations: toml.negotiations !== false,
		teamNames: (Array.isArray(toml.team_names) ? toml.team_names : []).map(name => text(name) ?? '').slice(0, maxTeams),
		sides,
		roundNames: (Array.isArray(toml.round_names) ? toml.round_names : []).map(name => text(name)?.slice(0, 60) ?? '').slice(0, rounds),
		roundChoices,
		...(market ? { market } : {}),
		debrief: await briefing(toml.debrief),
		winner,
		structures: structures.length ? structures : [{ key: 'board', label: localize('game.boardMembers', "Board Members"), description: localize('game.boardMembersDetail', "Every player sets every decision."), roles: [boardMember()] }],
	};
}

/** A case's [market]: the asset, its currency, the minutes of a period, the tick, each desk's cash and shares, and the most shares and highest price of an order. */
function marketSpec(value: unknown, invalid: (what: string) => Error): IMarketSpec | undefined {
	if (value === undefined) {
		return undefined;
	}
	const market = (value && typeof value === 'object' ? value : {}) as TomlValue;
	const number = (key: string) => typeof market[key] === 'number' && Number.isFinite(market[key]) ? market[key] as number : NaN;
	const asset = text(market.asset);
	const spec = { asset: asset ?? '', unit: text(market.unit) ?? '', minutes: number('minutes'), tick: number('tick'), cash: number('cash'), shares: number('shares'), maxOrder: number('max_order'), maxPrice: number('max_price') };
	if (!asset || !(spec.minutes >= 0.5 && spec.minutes <= 60) || !(spec.tick > 0) || !(spec.cash >= 0) || !isWhole(spec.shares) || spec.shares < 0 || !isWhole(spec.maxOrder) || spec.maxOrder < 1 || !(spec.maxPrice > spec.tick)) {
		throw invalid('[market] needs asset, minutes from 0.5 to 60, a tick above 0, cash, whole shares, a whole max_order and a max_price above the tick');
	}
	return spec;
}

/** A case played in fewer rounds than it has, as the facilitator chose among its round_choices: its rounds, their names and the news that fit in them. */
export function withRounds(gameCase: IGameCase, rounds: number): IGameCase {
	return { ...gameCase, rounds, roundNames: gameCase.roundNames.slice(0, rounds), news: gameCase.news.filter(item => item.round <= rounds) };
}

/** The values of a table and of the tables in it, by their place, such as bean_cost.origin. */
export function leaves(value: unknown, prefix = ''): [string, unknown][] {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return [];
	}
	return Object.entries(value).flatMap(([key, item]): [string, unknown][] => item && typeof item === 'object' && !Array.isArray(item) ? leaves(item, prefix + key + '.') : [[prefix + key, item]]);
}

/** The one role of a team that has no others: it sets every decision. */
function boardMember(): ICaseRole {
	return { key: 'board', label: localize('game.boardMember', "Board Member") };
}

/** Whether a role sets any decision. */
function decidesAny(role: IGameRole): boolean {
	return !role.decides || role.decides.length > 0;
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
	const submittedBy = shortText(game.submittedBy, 400);
	const keys = new Set(decisions.map(decision => decision.key));
	const roles = (Array.isArray(game.roles) ? game.roles : []).slice(0, 20).flatMap(role => checkedRole(role, keys));
	const yourRoles = team ? texts(game.yourRoles, 20, 60).filter(key => roles.some(role => role.key === key)) : [];
	const given = game.roleBriefings && typeof game.roleBriefings === 'object' ? game.roleBriefings as Record<string, unknown> : {};
	const roleBriefings = Object.fromEntries(yourRoles.flatMap(key => {
		const briefing = shortText(given[key], MAX_BRIEFING);
		return briefing ? [[key, briefing]] : [];
	}));
	const structure = shortText(game.structure, 60);
	const briefing = shortText(game.briefing, MAX_BRIEFING);
	const roundNames = texts(game.roundNames, rounds, 60);
	const otherTeams = (Array.isArray(game.otherTeams) ? game.otherTeams : []).slice(0, 100).flatMap(item => {
		const entry = item && typeof item === 'object' ? item as Record<string, unknown> : {};
		const name = shortText(entry.name, 60);
		return isWhole(entry.team) && entry.team >= 1 && entry.team !== team && name ? [{ team: entry.team, name }] : [];
	});
	const news = (Array.isArray(game.news) ? game.news : []).slice(0, 100).flatMap(item => {
		if (!item || typeof item !== 'object') {
			return [];
		}
		const entry = item as Record<string, unknown>;
		const title = shortText(entry.title, 200);
		const body = shortText(entry.text, MAX_NEWS_TEXT);
		return title && body && isWhole(entry.round) ? [{ round: entry.round, title, text: body, ...(Array.isArray(entry.for) ? { for: texts(entry.for, 20, 60) } : {}) }] : [];
	});
	return {
		title,
		description: shortText(game.description, 2000) ?? '',
		roundLabel: shortText(game.roundLabel, 40) ?? localize('game.round', "Round"),
		rounds,
		round,
		...(roundNames.length ? { roundNames } : {}),
		decisions,
		...(team ? { team, teamName: shortText(game.teamName, 60) ?? localize('game.team', "Team {0}", team), values: checkedValues(decisions, game.values, defaultValues(decisions)) } : {}),
		...(submittedBy ? { submittedBy } : {}),
		...(structure ? { structure } : {}),
		...(briefing ? { briefing } : {}),
		...(roles.length ? { roles } : {}),
		...(yourRoles.length ? { yourRoles, roleBriefings } : {}),
		...(team ? { members: texts(game.members, 30, 200), waitingFor: texts(game.waitingFor, 20, 60) } : {}),
		...(news.length ? { news } : {}),
		...(game.negotiations === true ? { negotiations: true } : {}),
		...(team && shortText(game.out, 500) ? { out: shortText(game.out, 500) } : {}),
		...(team && otherTeams.length ? { otherTeams } : {}),
		...(game.market === true ? { market: true } : {}),
	};
}

function checkedRole(value: unknown, keys: ReadonlySet<string>): IGameRole[] {
	if (!value || typeof value !== 'object') {
		return [];
	}
	const role = value as Record<string, unknown>;
	const key = shortText(role.key, 60);
	const label = shortText(role.label, 60);
	if (!key || !label) {
		return [];
	}
	return [Array.isArray(role.decides) ? { key, label, decides: texts(role.decides, 50, 60).filter(decision => keys.has(decision)) } : { key, label }];
}

/** At most `count` texts of a list, each at most `length` characters. */
function texts(value: unknown, count: number, length: number): string[] {
	return (Array.isArray(value) ? value : []).slice(0, count).map(item => shortText(item, length)).filter(item => item !== undefined);
}

function checkedDecision(value: unknown): IGameDecision | undefined {
	if (!value || typeof value !== 'object') {
		return undefined;
	}
	const decision = value as Record<string, unknown>;
	const key = shortText(decision.key, 60);
	const label = shortText(decision.label, 160);
	// A decision made for each rival has the rival's number after its key, such as bid.2
	if (!key || !/^[A-Za-z_][A-Za-z0-9_]*(\.\d+)?$/.test(key) || !label) {
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
 * A game, on the facilitator's computer: its folder, its teams and rounds, the roles of the players, the decisions
 * submitted for the round being decided, and the model run for each round.
 */
export class GameRun {

	/** The round being decided: 0 before the game starts, rounds + 1 once it is over. */
	private _round = 0;
	private _teams: readonly IGameTeam[] = [];
	private folder: URI | undefined;
	private running = false;
	/** This round's submissions, by team: the values, who submitted them and for which roles; and the values each team played last. */
	private readonly submitted = new Map<number, { values: GameValues; readonly by: string[]; readonly roles: Set<string> }>();
	private readonly played = new Map<number, GameValues>();
	/** Each player's team and roles, by Trystero's id. */
	private readonly players = new Map<string, { readonly team: number; readonly roles: readonly string[] }>();
	/** The news released, oldest first, and which of the case's scripted items are among them. */
	private readonly released: ICaseNews[] = [];
	private readonly releasedScripted = new Set<number>();
	/** The teams that have left the game, with why, as the model said it. */
	private readonly out = new Map<number, string>();
	/** In a Trading Floor case, the market the teams trade on. */
	private _market: MarketBook | undefined;
	/** The messages between teams, by the round being decided when they were written. */
	private readonly negotiations: { readonly round: number; readonly time: Date; readonly from: string; readonly fromTeam: number; readonly toTeam: number; readonly text: string }[] = [];

	constructor(
		readonly gameCase: IGameCase,
		readonly structure: IGameStructure,
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

	/** In a Trading Floor case, the market, once the game has started. */
	get market(): MarketBook | undefined {
		return this._market;
	}

	/** Where the game's rounds are kept, once it has started. */
	get folderPath(): string {
		return this.folder?.fsPath ?? '';
	}

	get folderUri(): URI | undefined {
		return this.folder;
	}

	/** The name of a team, such as Team 2. */
	teamName(team: number): string {
		return this._teams.find(item => item.team === team)?.name ?? localize('game.team', "Team {0}", team);
	}

	/** A round's name, such as Year 2, or the case's name for it, such as Due Diligence. */
	roundName(round: number): string {
		return roundName(this.gameCase, round);
	}

	/** A team's kind, by key, in a case with sides. */
	sideOf(team: number): string | undefined {
		return this._teams.find(item => item.team === team)?.side;
	}

	/** Whether something for these sides (every side when missing) is for a team. */
	private isFor(sides: readonly string[] | undefined, team: number): boolean {
		return !sides || sides.includes(this.sideOf(team) ?? '');
	}

	/** The roles of the structure a team has: those of its side. */
	teamRoles(team: number): readonly ICaseRole[] {
		return this.structure.roles.filter(role => this.isFor(role.sides, team));
	}

	/** The briefings a team's players read: the case's, then their side's. */
	briefingFor(team: number): string | undefined {
		const side = this.gameCase.sides.find(item => item.key === this.sideOf(team));
		return [this.gameCase.briefing, side?.briefing].filter(Boolean).join('\n\n') || undefined;
	}

	/**
	 * A team's decisions in the round being decided: the case's for its side and made in this round, with each one
	 * made for each rival repeated for every other team still in the game.
	 */
	decisionsOf(team: number): IGameDecision[] {
		const open = this._round >= 1 && this._round <= this.gameCase.rounds;
		return this.gameCase.decisions.filter(decision => this.isFor(decision.sides, team) && (!open || !decision.rounds || decision.rounds.includes(this._round))).flatMap(decision => decision.rivals
			? this._teams.filter(other => other.team !== team && !this.out.has(other.team)).map(other => ({ ...decision, key: `${decision.key}.${other.team}`, label: localize('game.rivalDecision', "{0}: {1}", decision.label, other.name), rivals: undefined }))
			: [decision]);
	}

	/** A team's values for the round being decided: submitted, else those it played last, else the case's defaults. */
	values(team: number): GameValues {
		const submitted = this.submitted.get(team)?.values;
		const played = this.played.get(team);
		return Object.fromEntries(this.decisionsOf(team).map(decision => [decision.key, submitted?.[decision.key] ?? played?.[decision.key] ?? decision.default]));
	}

	/** Why a team has left the game, when it has. */
	outReason(team: number): string | undefined {
		return this.out.get(team);
	}

	/** Who in a team has submitted this round, one after the other. */
	submittedBy(team: number): string | undefined {
		return this.submitted.get(team)?.by.join(', ') || undefined;
	}

	/** Whether a team has more roles than one, so that each player's is worth naming. */
	get hasRoles(): boolean {
		const sides = this.gameCase.sides.map(side => side.key);
		return sides.length ? sides.some(side => this.structure.roles.filter(role => !role.sides || role.sides.includes(side)).length > 1) : this.structure.roles.length > 1;
	}

	/** The case's news that can be released now: scripted for this round or an earlier one, and not released yet. */
	pendingNews(): { readonly index: number; readonly item: ICaseNews }[] {
		if (this._round < 1 || this.isOver) {
			return [];
		}
		return this.gameCase.news.flatMap((item, index) => item.round <= this._round && !this.releasedScripted.has(index) ? [{ index, item }] : []);
	}

	/** A parameter's value for the round being decided: the case's, as the news released so far changed it. */
	parameter(path: string): number | undefined {
		const change = this.released.flatMap(item => item.changes).filter(item => item.path === path).at(-1);
		return change ? change.value : this.gameCase.parameters.get(path);
	}

	/** Releases a news item in the round being decided, written to its folder for the model, which reads its changes when it plays the round. */
	async release(item: Omit<ICaseNews, 'round'>, scripted?: number): Promise<ICaseNews> {
		if (this._round < 1 || this.isOver || this.running) {
			throw new Error(localize('game.cannotRelease', "News can be released only while a round is being decided."));
		}
		const news: ICaseNews = { ...item, round: this._round };
		this.released.push(news);
		if (scripted !== undefined) {
			this.releasedScripted.add(scripted);
		}
		const lines: string[] = [];
		for (const entry of this.released.filter(other => other.round === this._round)) {
			lines.push('[[news]]', `title = ${tomlString(entry.title)}`, `text = ${tomlString(entry.text)}`);
			if (entry.roles) {
				lines.push(`roles = [${entry.roles.map(tomlString).join(', ')}]`);
			}
			if (entry.changes.length) {
				lines.push('[news.parameters]', ...entry.changes.map(change => `${tomlKey(change.path)} = ${change.value}`));
			}
			lines.push('');
		}
		await this.write(`${roundFolder(this._round)}/news.toml`, lines.join('\n'));
		return news;
	}

	/** Keeps a message between teams in the folder of the round being decided, negotiations.toml, for the debrief. */
	async recordNegotiation(from: string, fromTeam: number, toTeam: number, text: string): Promise<void> {
		if (!this.folder || this._round < 1) {
			return;
		}
		const round = Math.min(this._round, this.gameCase.rounds);
		this.negotiations.push({ round, time: new Date(), from, fromTeam, toTeam, text });
		const lines: string[] = [];
		for (const message of this.negotiations.filter(item => item.round === round)) {
			lines.push('[[messages]]', `time = ${tomlString(message.time.toISOString())}`, `from = ${tomlString(message.from)}`, `from_team = ${message.fromTeam}`, `to_team = ${message.toTeam}`, `text = ${tomlString(message.text)}`, '');
		}
		await this.write(`${roundFolder(round)}/negotiations.toml`, lines.join('\n'));
	}

	/** The news a player reads, or, without one, all of it, for the facilitator. */
	news(peerId?: string): IGameNews[] {
		const held = peerId === undefined ? undefined : new Set(this.players.get(peerId)?.roles ?? []);
		return this.released.flatMap(item => {
			const roles = this.structure.roles.filter(role => item.roles?.includes(role.key));
			if (held && roles.length && !roles.some(role => held.has(role.key))) {
				return [];
			}
			return [{ round: item.round, title: item.title, text: item.text, ...(roles.length ? { for: roles.map(role => role.label) } : {}) }];
		});
	}

	/** A player's roles, in the order of the structure. */
	rolesOf(peerId: string): readonly ICaseRole[] {
		const roles = this.players.get(peerId)?.roles ?? [];
		return this.structure.roles.filter(role => roles.includes(role.key));
	}

	/** The decisions a player's roles set, among their team's; a role's decides names a decision made for each rival by its key. */
	decidesFor(peerId: string): ReadonlySet<string> {
		const player = this.players.get(peerId);
		if (!player) {
			return new Set();
		}
		const keys = new Set(this.rolesOf(peerId).flatMap(role => role.decides ?? this.gameCase.decisions.map(decision => decision.key)));
		return new Set(this.decisionsOf(player.team).filter(decision => keys.has(baseKey(decision.key))).map(decision => decision.key));
	}

	/** The roles held in a team that set decisions and have not submitted them this round, by name; none for a team that has left. */
	waitingFor(team: number): string[] {
		if (this.out.has(team)) {
			return [];
		}
		const held = new Set([...this.players.values()].filter(player => player.team === team).flatMap(player => player.roles));
		const submitted = this.submitted.get(team)?.roles;
		const open = this.decisionsOf(team).map(decision => baseKey(decision.key));
		return this.teamRoles(team).filter(role => held.has(role.key) && open.some(key => !role.decides || role.decides.includes(key)) && !submitted?.has(role.key)).map(role => role.label);
	}

	/**
	 * Deals the roles of the structure in each team, from the players' teams: a player keeps their roles while they
	 * stay in their team; newcomers, in random order, take a role nobody in their team holds, else share the one
	 * fewest hold; a role still unheld goes to the player with fewest roles. Players in no team have none.
	 */
	dealRoles(teams: ReadonlyMap<string, number>): void {
		const dealt = new Map<string, { readonly team: number; readonly roles: readonly string[] }>();
		for (const team of new Set(teams.values())) {
			const order = this.teamRoles(team).map(role => role.key);
			const held = new Map<string, string[]>();
			const newcomers: string[] = [];
			for (const [peerId, member] of teams) {
				if (member !== team) {
					continue;
				}
				const before = this.players.get(peerId);
				const kept = before?.team === team ? before.roles.filter(role => order.includes(role)) : [];
				if (kept.length) {
					held.set(peerId, kept);
				} else {
					newcomers.push(peerId);
				}
			}
			const holders = (role: string) => [...held.values()].filter(roles => roles.includes(role)).length;
			shuffle(newcomers);
			for (const peerId of newcomers) {
				const role = order.find(key => !holders(key)) ?? order.reduce((fewest, key) => holders(key) < holders(fewest) ? key : fewest);
				held.set(peerId, [role]);
			}
			for (const role of order) {
				if (!holders(role) && held.size) {
					const [, roles] = [...held].reduce((fewest, player) => player[1].length < fewest[1].length ? player : fewest);
					roles.push(role);
				}
			}
			for (const [peerId, roles] of held) {
				dealt.set(peerId, { team, roles: order.filter(key => roles.includes(key)) });
			}
		}
		this.players.clear();
		for (const [peerId, player] of dealt) {
			this.players.set(peerId, player);
		}
	}

	/**
	 * A player submits decisions for their team: those their roles set replace the team's for the round, the last
	 * submitted before the round is played counting; false when the player cannot submit.
	 */
	submit(team: number, values: unknown, by: string, peerId: string): boolean {
		const allowed = this.decidesFor(peerId);
		if (this._round < 1 || this.isOver || this.out.has(team) || !this._teams.some(item => item.team === team) || this.players.get(peerId)?.team !== team || !allowed.size) {
			return false;
		}
		const decisions = this.decisionsOf(team);
		const current = this.values(team);
		const given = checkedValues(decisions, values, current);
		const merged = Object.fromEntries(decisions.map(decision => [decision.key, allowed.has(decision.key) ? given[decision.key] : current[decision.key]]));
		const entry = this.submitted.get(team) ?? { values: merged, by: [], roles: new Set<string>() };
		entry.values = merged;
		entry.by.splice(0, entry.by.length, ...entry.by.filter(name => name !== by), by);
		for (const role of this.rolesOf(peerId)) {
			if (decidesAny(role)) {
				entry.roles.add(role.key);
			}
		}
		this.submitted.set(team, entry);
		return true;
	}

	/** Starts the game with its teams: writes game.toml and the model's state before round 1, and returns what the model says the teams see before it, if anything. */
	async start(count: number): Promise<IRoundResults | undefined> {
		// In a case with sides, each side's teams one after the other, named after the side when they have no name
		const sides = this.gameCase.sides.flatMap(side => Array.from({ length: side.teams }, (_, index) => ({ side, index })));
		this._teams = Array.from({ length: sides.length || count }, (_, index) => {
			const side = sides[index];
			const fallback = side ? (side.side.teams > 1 ? localize('game.sideTeam', "{0} {1}", side.side.label, side.index + 1) : side.side.label) : localize('game.team', "Team {0}", index + 1);
			return { team: index + 1, name: this.gameCase.teamNames[index] || fallback, ...(side ? { side: side.side.key } : {}) };
		});
		this.folder = await this.newFolder();
		const seed = Math.floor(Math.random() * 1_000_000_000);
		await this.write('game.toml', [
			`case = ${tomlString(basename(this.gameCase.folder))}`,
			`case_folder = ${tomlString(this.gameCase.folder.fsPath)}`,
			`title = ${tomlString(this.gameCase.title)}`,
			`structure = ${tomlString(this.structure.key)}`,
			`rounds = ${this.gameCase.rounds}`,
			`seed = ${seed}`,
			// A case whose length the facilitator chooses reads it as the parameter rounds
			...(this.gameCase.roundChoices.length ? ['', '[parameters]', `rounds = ${this.gameCase.rounds}`] : []),
			...this._teams.flatMap(team => ['', '[[teams]]', `team = ${team.team}`, `name = ${tomlString(team.name)}`, ...(team.side ? [`side = ${tomlString(team.side)}`] : [])]),
			'',
		].join('\n'));
		if (this.gameCase.market) {
			this._market = new MarketBook(this.gameCase.market, this._teams.map(team => team.team));
		}
		const output = await this.run(0);
		this._round = 1;
		this._market?.openPeriod(1);
		const opening = this.tables(0, output);
		return opening.public.rows.length || opening.text || opening.teamText.size ? opening : undefined;
	}

	/** Plays the round being decided with every team's decisions, and opens the next; `players` are each team's, with their roles, for the round's folder. */
	async play(players: ReadonlyMap<number, readonly string[]>): Promise<IRoundResults> {
		const round = this._round;
		// In a Trading Floor case, the period closes, and each desk's position is what the model reads as its decisions
		this._market?.closePeriod();
		const summary = this._market?.summary();
		const positions = this._market?.positions();
		const values = new Map(this._teams.map((team): [number, GameValues] => {
			const position = positions?.get(team.team);
			return [team.team, position && summary ? {
				cash: position.cash, shares: position.shares, bought: position.bought, sold: position.sold, average_buy: position.averageBuy, average_sell: position.averageSell,
				last_price: summary.last, average_price: summary.average, high: summary.high, low: summary.low, volume: summary.volume,
			} : this.values(team.team)];
		}));
		const lines = [`round = ${round}`];
		for (const team of this._teams) {
			lines.push('', '[[teams]]', `team = ${team.team}`, `name = ${tomlString(team.name)}`, ...(team.side ? [`side = ${tomlString(team.side)}`] : []), `submitted_by = ${tomlString(this.submittedBy(team.team) ?? '')}`, `players = [${(players.get(team.team) ?? []).map(tomlString).join(', ')}]`, '[teams.decisions]');
			for (const [key, value] of Object.entries(values.get(team.team)!)) {
				lines.push(`${tomlKey(key)} = ${typeof value === 'number' ? String(value) : tomlString(value)}`);
			}
		}
		await this.write(`${roundFolder(round)}/decisions.toml`, lines.join('\n') + '\n');
		if (summary && this._market) {
			const market = this._market;
			await this.write(`${roundFolder(round)}/trades.toml`, summary.fills.map(fill => [
				'[[trades]]', `time = ${tomlString(new Date(fill.time).toISOString())}`, `price = ${market.money(fill.price)}`, `quantity = ${fill.quantity}`,
				`buyer = ${fill.buyer}`, `seller = ${fill.seller}`, `buyer_by = ${tomlString(fill.buyerBy)}`, `seller_by = ${tomlString(fill.sellerBy)}`, '',
			].join('\n')).join('\n'));
		}
		const output = await this.run(round);
		this.submitted.clear();
		for (const [team, played] of values) {
			this.played.set(team, played);
		}
		this._round = round + 1;
		const results = this.tables(round, output);
		for (const [team, reason] of results.out) {
			this.out.set(team, reason);
		}
		// The model can end the game early, or by leaving no more than one team in it
		if (results.over || this._teams.filter(team => !this.out.has(team.team)).length < 2) {
			this._round = this.gameCase.rounds + 1;
		}
		if (!this.isOver) {
			this._market?.openPeriod(this._round);
		}
		return results;
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
		const results = output && typeof output === 'object' ? output as { public?: unknown; private?: unknown; text?: unknown; private_text?: unknown; out?: unknown; over?: unknown } : {};
		const name = round ? this.roundName(round) : localize('game.opening', "Before {0}", this.roundName(1));
		const publicRows = Array.isArray(results.public) ? results.public : [];
		const privateRows = results.private && typeof results.private === 'object' ? results.private as Record<string, unknown> : {};
		const table = (title: string, columns: readonly IResultColumn[], rows: readonly unknown[]): IGameTable => {
			const cells = rows.map(row => columns.map(column => cellText(this.gameCase, column, row && typeof row === 'object' ? (row as Record<string, unknown>)[column.key] : undefined)));
			const headings = columns.map(columnHeading);
			return cells.length === 1
				? { title, columns: [localize('game.item', "Item"), localize('game.value', "Value")], rows: headings.map((heading, index) => [heading, cells[0][index]]) }
				: { title, columns: headings, rows: cells };
		};
		const own = new Map<number, IGameTable>();
		for (const team of this._teams) {
			const rows = privateRows[String(team.team)];
			const columns = this.gameCase.privateColumns.filter(column => this.isFor(column.sides, team.team));
			if (Array.isArray(rows) && rows.length && columns.length) {
				own.set(team.team, table(localize('game.teamTable', "{0}: {1}", name, team.name), columns, rows));
			}
		}
		// What the model says to each team alone, and the teams that leave the game, by team number
		const byTeam = (value: unknown) => new Map(Object.entries(value && typeof value === 'object' ? value as Record<string, unknown> : {}).flatMap(([team, item]) => {
			const number = Number(team);
			return typeof item === 'string' && item.trim() && this._teams.some(other => other.team === number) ? [[number, item.trim().slice(0, 2000)] as const] : [];
		}));
		const out = byTeam(results.out);
		for (const team of this.out.keys()) {
			out.delete(team);
		}
		return {
			text: typeof results.text === 'string' ? results.text : undefined,
			public: table(localize('game.publicTable', "{0}: Results", name), this.gameCase.publicColumns, publicRows),
			private: own,
			teamText: byTeam(results.private_text),
			out,
			over: results.over === true,
		};
	}

}

/** A cell of a case's results: a number with its decimals, a choice by its label, anything else as text. */
export function cellText(gameCase: IGameCase, column: IResultColumn, value: unknown): string {
	if (typeof value === 'number') {
		return value.toLocaleString(undefined, { minimumFractionDigits: column.digits, maximumFractionDigits: column.digits });
	}
	if (typeof value === 'string') {
		const choice = gameCase.decisions.find(decision => decision.key === column.key && decision.kind === 'choice');
		return choice?.options?.find(option => option.value === value)?.label ?? value;
	}
	return value === undefined || value === null ? '' : String(value);
}

/** A column's heading, with its unit. */
export function columnHeading(column: IResultColumn): string {
	return column.unit ? localize('game.heading', "{0} ({1})", column.label, column.unit) : column.label;
}

/** A round's name: the case's for it, such as Due Diligence, else its round label and number, such as Year 2. */
export function roundName(gameCase: Pick<IGameCase, 'roundLabel' | 'roundNames'>, round: number): string {
	return gameCase.roundNames[round - 1] || localize('game.roundName', "{0} {1}", gameCase.roundLabel, round);
}

/** The key of a decision as the case gives it: a decision made for each rival without the rival's number, such as bid for bid.2. */
export function baseKey(key: string): string {
	return key.split('.')[0];
}

/** The folder of a round within a game's, such as round-03. */
export function roundFolder(round: number): string {
	return `round-${String(round).padStart(2, '0')}`;
}

/** A dotted TOML key, such as bean_cost.origin, each part quoted when it needs to be. */
function tomlKey(path: string): string {
	return path.split('.').map(part => /^[A-Za-z0-9_-]+$/.test(part) ? part : tomlString(part)).join('.');
}

/** A TOML basic string: JSON's escapes are TOML's. */
function tomlString(value: string): string {
	return JSON.stringify(value);
}
