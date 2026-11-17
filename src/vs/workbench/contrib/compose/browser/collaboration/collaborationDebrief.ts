/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { encodeBase64, VSBuffer } from '../../../../../base/common/buffer.js';
import { basename, joinPath } from '../../../../../base/common/resources.js';
import { URI } from '../../../../../base/common/uri.js';
import { localize } from '../../../../../nls.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { parseToml, TomlValue } from '../../../model/browser/common/tomlPanelData.js';
import { cellText, columnHeading, IGameCase, IResultColumn, leaves, loadCase, roundFolder, roundName as caseRoundName } from './collaborationGame.js';

// Compose > Simulation Games > Open the Debrief: gathers a game's folder (game.toml and the rounds'
// decisions, results, news and messages between teams) into the debrief folder beside them: debrief.md, which says
// round by round what happened, five CSV tables to analyse with the ordinary panels, and a copy of the case, so the
// class can open the model and question it.

const DEBRIEF_FOLDER = 'debrief';
const PAGE = 'debrief.md';

/** A table of the debrief, as CSV, with its size. */
export interface IDebriefTable {
	readonly fileName: string;
	readonly content: string;
	readonly rows: number;
	readonly columns: number;
}

/** A debrief written: its page, its tables, and the files the players can be sent (the page, the model and case.toml), as base64. */
export interface IDebrief {
	readonly page: URI;
	readonly tables: readonly IDebriefTable[];
	readonly files: readonly { readonly fileName: string; readonly content: string }[];
}

/** What a round's folder holds: the decisions (in a Trading Floor case, each desk's position), the results once played, the news, the messages between teams and, in a Trading Floor case, the trades. */
interface IRoundRecord {
	readonly round: number;
	readonly decisions: readonly TomlValue[];
	readonly trades: readonly TomlValue[];
	readonly results?: { readonly public: readonly Record<string, unknown>[]; readonly private: Readonly<Record<string, unknown>>; readonly text?: string };
	readonly news: readonly TomlValue[];
	readonly negotiations: readonly TomlValue[];
}

/** Writes the debrief of the game in `game`, replacing an earlier one; `cases` are the folders of the installed toolboxes' cases. Throws when the folder is not a game's. */
export async function writeDebrief(fileService: IFileService, game: URI, cases: readonly URI[]): Promise<IDebrief> {
	const setup = await fileService.readFile(joinPath(game, 'game.toml')).then(content => parseToml(content.value.toString()), () => undefined);
	if (!setup) {
		throw new Error(localize('debrief.notGame', "{0} is not the folder of a game: it has no game.toml.", basename(game)));
	}
	const gameCase = await findCase(fileService, setup, cases);
	const teams = new Map((Array.isArray(setup.teams) ? setup.teams as TomlValue[] : []).flatMap(team => typeof team.team === 'number' ? [[team.team, typeof team.name === 'string' ? team.name : String(team.team)] as const] : []));
	const records: IRoundRecord[] = [];
	for (let round = 1; round <= (typeof setup.rounds === 'number' ? setup.rounds : gameCase?.rounds ?? 50); round++) {
		const record = await readRound(fileService, joinPath(game, roundFolder(round)), round);
		if (!record) {
			break;
		}
		records.push(record);
	}
	if (!records.some(record => record.results)) {
		throw new Error(localize('debrief.nothingPlayed', "No round of this game has been played yet: the debrief has nothing to show."));
	}
	const folder = joinPath(game, DEBRIEF_FOLDER);
	await fileService.del(folder, { recursive: true }).catch(() => undefined);
	const tables = debriefTables(gameCase, teams, records);
	for (const table of tables) {
		await fileService.writeFile(joinPath(folder, table.fileName), VSBuffer.fromString(table.content));
	}
	const files: { fileName: string; content: string }[] = [];
	if (gameCase) {
		await fileService.copy(gameCase.folder, joinPath(folder, 'case'), true);
		for (const name of ['model.jl', 'case.toml']) {
			const content = await fileService.readFile(joinPath(gameCase.folder, name)).catch(() => undefined);
			if (content) {
				files.push({ fileName: name, content: encodeBase64(content.value) });
			}
		}
	}
	const page = joinPath(folder, PAGE);
	const markdown = debriefPage(gameCase, setup, teams, records, tables, game);
	await fileService.writeFile(page, VSBuffer.fromString(markdown));
	files.unshift({ fileName: PAGE, content: encodeBase64(VSBuffer.fromString(markdown)) });
	return { page, tables, files };
}

/** The game's case: the folder game.toml names, else an installed toolbox's case of the same name (a toolbox's folder changes with its version); none when neither loads. */
async function findCase(fileService: IFileService, setup: TomlValue, cases: readonly URI[]): Promise<IGameCase | undefined> {
	const folders: URI[] = typeof setup.case_folder === 'string' ? [URI.file(setup.case_folder)] : [];
	folders.push(...cases.filter(folder => basename(folder) === setup.case));
	for (const folder of folders) {
		try {
			return await loadCase(fileService, folder);
		} catch {
			// The next, if any
		}
	}
	return undefined;
}

/** A round's folder, read: undefined when it has none of the files a round leaves. */
async function readRound(fileService: IFileService, folder: URI, round: number): Promise<IRoundRecord | undefined> {
	const read = (name: string) => fileService.readFile(joinPath(folder, name)).then(content => content.value.toString(), () => undefined);
	const [decisions, results, news, negotiations, trades] = await Promise.all([read('decisions.toml'), read('results.json'), read('news.toml'), read('negotiations.toml'), read('trades.toml')]);
	if (decisions === undefined && results === undefined && news === undefined && negotiations === undefined) {
		return undefined;
	}
	const list = (content: string | undefined, key: string) => {
		const value = content === undefined ? undefined : parseToml(content)[key];
		return Array.isArray(value) ? value as TomlValue[] : [];
	};
	let played: IRoundRecord['results'];
	try {
		const output = results === undefined ? undefined : JSON.parse(results);
		if (output && typeof output === 'object') {
			played = {
				public: Array.isArray(output.public) ? output.public.filter((row: unknown) => row && typeof row === 'object') : [],
				private: output.private && typeof output.private === 'object' ? output.private : {},
				text: typeof output.text === 'string' ? output.text : undefined,
			};
		}
	} catch {
		// A round whose results cannot be read counts as not played
	}
	return { round, decisions: list(decisions, 'teams'), results: played, news: list(news, 'news'), negotiations: list(negotiations, 'messages'), trades: list(trades, 'trades') };
}

/** The five tables: decisions, public results, each team's results, news, and messages between teams; and, in a Trading Floor case, the trades. */
function debriefTables(gameCase: IGameCase | undefined, teams: ReadonlyMap<number, string>, records: readonly IRoundRecord[]): IDebriefTable[] {
	const decisionKeys = keysOf(gameCase?.decisions.map(decision => decision.key) ?? [], records.flatMap(record => record.decisions.map(team => team.decisions)));
	const publicRows = records.flatMap(record => (record.results?.public ?? []).map(row => ({ round: record.round, row })));
	const publicKeys = keysOf(gameCase?.publicColumns.map(column => column.key) ?? [], publicRows.map(item => item.row));
	const teamRows = records.flatMap(record => [...teams.keys()].flatMap(team => {
		const rows = record.results?.private[String(team)];
		return (Array.isArray(rows) ? rows : []).filter(row => row && typeof row === 'object').map(row => ({ round: record.round, team, row: row as Record<string, unknown> }));
	}));
	const teamKeys = keysOf(gameCase?.privateColumns.map(column => column.key) ?? [], teamRows.map(item => item.row));
	return [
		table('decisions.csv', ['round', 'team', 'team_name', 'submitted_by', 'players', ...decisionKeys], records.flatMap(record => record.decisions.map(team => {
			const values = team.decisions && typeof team.decisions === 'object' ? team.decisions as TomlValue : {};
			return [record.round, team.team, team.name, team.submitted_by, Array.isArray(team.players) ? team.players.join('; ') : '', ...decisionKeys.map(key => values[key])];
		}))),
		table('results.csv', ['round', ...publicKeys], publicRows.map(item => [item.round, ...publicKeys.map(key => item.row[key])])),
		table('team_results.csv', ['round', 'team', 'team_name', ...teamKeys], teamRows.map(item => [item.round, item.team, teams.get(item.team), ...teamKeys.map(key => item.row[key])])),
		table('news.csv', ['round', 'title', 'text', 'roles', 'changes'], records.flatMap(record => record.news.map(item => [
			record.round, item.title, item.text, Array.isArray(item.roles) ? item.roles.join('; ') : '', leaves(item.parameters).map(([path, value]) => `${path} = ${value}`).join('; '),
		]))),
		table('negotiations.csv', ['round', 'time', 'from', 'from_team', 'to_team', 'text'], records.flatMap(record => record.negotiations.map(message => [
			record.round, message.time, message.from, teams.get(message.from_team as number) ?? message.from_team, teams.get(message.to_team as number) ?? message.to_team, message.text,
		]))),
		...(gameCase?.market ? [table('trades.csv', ['round', 'time', 'price', 'quantity', 'buyer', 'seller', 'buyer_by', 'seller_by'], records.flatMap(record => record.trades.map(trade => [
			record.round, trade.time, trade.price, trade.quantity, teams.get(trade.buyer as number) ?? trade.buyer, teams.get(trade.seller as number) ?? trade.seller, trade.buyer_by, trade.seller_by,
		])))] : []),
	];
}

/** The keys of the rows, those given first, then any others in the order they come. */
function keysOf(first: readonly string[], rows: readonly unknown[]): string[] {
	const keys = new Set(first);
	for (const row of rows) {
		if (row && typeof row === 'object') {
			for (const key of Object.keys(row)) {
				keys.add(key);
			}
		}
	}
	return [...keys];
}

function table(fileName: string, header: readonly string[], rows: readonly (readonly unknown[])[]): IDebriefTable {
	const line = (cells: readonly unknown[]) => cells.map(csvCell).join(',');
	return { fileName, content: [line(header), ...rows.map(line)].join('\n') + '\n', rows: rows.length, columns: header.length };
}

/** A CSV cell: quoted when it holds a comma, a quote or a line break. */
function csvCell(value: unknown): string {
	const text = value === undefined || value === null ? '' : String(value);
	return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** The debrief's page: the game, the final standings, the teams, each round, the negotiations, the tables and the model. */
function debriefPage(gameCase: IGameCase | undefined, setup: TomlValue, teams: ReadonlyMap<number, string>, records: readonly IRoundRecord[], tables: readonly IDebriefTable[], game: URI): string {
	const title = gameCase?.title ?? (typeof setup.title === 'string' ? setup.title : basename(game));
	const roundName = (round: number) => gameCase ? caseRoundName(gameCase, round) : localize('debrief.roundName', "{0} {1}", localize('debrief.round', "Round"), round);
	const structure = gameCase?.structures.find(item => item.key === setup.structure);
	const roleLabel = (key: string) => structure?.roles.find(role => role.key === key)?.label ?? key;
	const played = records.filter(record => record.results);
	const last = played[played.length - 1];
	const lines: string[] = [`# ${localize('debrief.title', "Debrief: {0}", title)}`, ''];
	lines.push(
		`- ${localize('debrief.teams', "**Teams:** {0}", [...teams.values()].join(', '))}`,
		...(structure ? [`- ${localize('debrief.structure', "**Organised as:** {0}", structure.label)}`] : []),
		`- ${localize('debrief.played', "**Played:** {0} of {1}", played.map(record => roundName(record.round)).join(', '), String(typeof setup.rounds === 'number' ? setup.rounds : gameCase?.rounds ?? '?'))}`,
		`- ${localize('debrief.folder', "**Its rounds:** {0}", game.fsPath)}`,
		'',
	);

	// The final standings, by the case's winner column, in the last round played; in a case with sides, the teams
	// of each side ranked among themselves, a side with one team standing alone
	const winner = gameCase?.winner;
	if (gameCase && winner && last?.results) {
		const ranked = last.results.public.filter(row => typeof row[winner.key] === 'number').sort((a, b) => (b[winner.key] as number) - (a[winner.key] as number));
		const sideOf = new Map((Array.isArray(setup.teams) ? setup.teams as TomlValue[] : []).flatMap(team => typeof team.name === 'string' && typeof team.side === 'string' ? [[team.name, team.side] as const] : []));
		const groups = gameCase.sides.length
			? gameCase.sides.map(side => ({ side, rows: ranked.filter(row => sideOf.get(String(row.team ?? '')) === side.key) })).filter(group => group.rows.length)
			: [{ side: undefined, rows: ranked }];
		for (const { side, rows } of groups) {
			if (!rows.length) {
				continue;
			}
			lines.push(`## ${side ? localize('debrief.sideStandings', "Standings of {0} after {1}", side.label, roundName(last.round)) : localize('debrief.standings', "Standings after {0}", roundName(last.round))}`, '');
			if (side && rows.length === 1) {
				lines.push(localize('debrief.aloneInSide', "{0} is the only team of its side: its {1} is set against what it would have had by doing nothing.", String(rows[0].team ?? ''), winner.label), '');
			}
			lines.push(...markdownTable([localize('debrief.place', "Place"), localize('debrief.team', "Team"), columnHeading(winner)], rows.map((row, index) => [String(index + 1), String(row.team ?? ''), cellText(gameCase, winner, row[winner.key])])), '');
		}
	}

	// The teams, as they were in the last round decided
	const lastDecided = [...records].reverse().find(record => record.decisions.length);
	if (lastDecided) {
		lines.push(`## ${localize('debrief.theTeams', "The Teams")}`, '');
		for (const team of lastDecided.decisions) {
			const players = Array.isArray(team.players) && team.players.length ? team.players.join(', ') : localize('debrief.nobody', "nobody");
			lines.push(`- **${String(team.name ?? team.team)}:** ${players}`);
		}
		lines.push('');
	}

	// Round by round: the model's text, the results everyone saw, the news and how many messages teams wrote
	for (const record of records) {
		lines.push(`## ${roundName(record.round)}`, '');
		if (record.results?.text) {
			lines.push(record.results.text, '');
		}
		if (record.results) {
			const columns: IResultColumn[] = gameCase?.publicColumns.length ? [...gameCase.publicColumns] : keysOf([], record.results.public).map(key => ({ key, label: key, digits: 0 }));
			lines.push(...markdownTable(columns.map(columnHeading), record.results.public.map(row => columns.map(column => gameCase ? cellText(gameCase, column, row[column.key]) : String(row[column.key] ?? '')))), '');
		} else {
			lines.push(localize('debrief.notPlayed', "Not played yet."), '');
		}
		for (const item of record.news) {
			const roles = Array.isArray(item.roles) && item.roles.length ? localize('debrief.newsFor', " (for {0})", item.roles.map(role => roleLabel(String(role))).join(', ')) : '';
			const changes = leaves(item.parameters).map(([path, value]) => `${path} = ${value}`);
			lines.push(`- ${localize('debrief.news', "**News: {0}**{1}. {2}", String(item.title ?? ''), roles, String(item.text ?? ''))}${changes.length ? ' ' + localize('debrief.newsChanges', "Changes to the model: {0}.", changes.join('; ')) : ''}`);
		}
		if (record.negotiations.length) {
			lines.push(`- ${localize('debrief.messageCount', "Messages between teams: {0}, under Negotiations below.", record.negotiations.length)}`);
		}
		lines.push('');
	}

	// Every message between teams
	const messages = records.filter(record => record.negotiations.length);
	if (messages.length) {
		lines.push(`## ${localize('debrief.negotiations', "Negotiations")}`, '');
		for (const record of messages) {
			lines.push(`### ${roundName(record.round)}`, '');
			for (const message of record.negotiations) {
				const time = typeof message.time === 'string' && !isNaN(Date.parse(message.time)) ? new Date(message.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
				const from = teams.get(message.from_team as number) ?? String(message.from_team);
				const to = teams.get(message.to_team as number) ?? String(message.to_team);
				lines.push(`- ${localize('debrief.message', "**{0} ({1}) to {2}**, {3}: {4}", String(message.from ?? ''), from, to, time, oneLine(String(message.text ?? '')))}`);
			}
			lines.push('');
		}
	}

	// The tables and the model
	const descriptions: Record<string, string> = {
		'decisions.csv': localize('debrief.decisionsTable', "each team's decisions in each round, with who submitted them and the players"),
		'results.csv': localize('debrief.resultsTable', "the results every player saw, round by round"),
		'team_results.csv': localize('debrief.teamResultsTable', "each team's own accounts, which only the team saw during the game"),
		'news.csv': localize('debrief.newsTable', "the news released, who read it and what it changed in the model"),
		'negotiations.csv': localize('debrief.negotiationsTable', "every message between teams"),
		'trades.csv': localize('debrief.tradesTable', "every trade on the market, with its price, its shares, the two desks and who placed each order"),
	};
	lines.push(`## ${localize('debrief.tables', "The Tables")}`, '');
	for (const item of tables) {
		lines.push(`- [${item.fileName}](${item.fileName}): ${descriptions[item.fileName] ?? ''} (${localize('debrief.rows', "{0} rows", item.rows)})`);
	}
	lines.push('', localize('debrief.readTables', "In Julia, CSV.File from CSV.jl reads each one as a table, ready for the panels of Pollis."), '');
	if (gameCase) {
		lines.push(`## ${localize('debrief.model', "The Model")}`, '');
		lines.push(localize('debrief.modelText', "The case is copied beside this page: [model.jl](case/model.jl) plays each round, and [case.toml](case/case.toml) holds its decisions, results, parameters and news. Open the model and find what explains the results."), '');
	}
	if (gameCase?.debrief) {
		lines.push(`## ${localize('debrief.questions', "Questions for the Debrief")}`, '', gameCase.debrief, '');
	}
	return lines.join('\n');
}

/** A Markdown table, its cells on one line with their bars escaped. */
function markdownTable(header: readonly string[], rows: readonly (readonly string[])[]): string[] {
	const line = (cells: readonly string[]) => `| ${cells.map(cell => oneLine(cell).replace(/\|/g, '\\|')).join(' | ')} |`;
	return [line(header), `|${header.map(() => ' --- ').join('|')}|`, ...rows.map(line)];
}

function oneLine(text: string): string {
	return text.replace(/\s*[\r\n]+\s*/g, ' ');
}
