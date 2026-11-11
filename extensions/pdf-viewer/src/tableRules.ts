/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Normalise Table: the rules that rewrite the cells of a table taken from a PDF, as a program reads numbers. The rules
// of Pollis can each be turned off, and the user adds rules of their own, in ~/.pollis/pdf-table-rules.toml.

import * as vscode from 'vscode';

/** The rules of Pollis, by their key in the rules file. */
type PollisRule = 'minus' | 'stars' | 'thousands' | 'powers' | 'cutPowers';

const POLLIS_RULES: readonly PollisRule[] = ['minus', 'stars', 'thousands', 'powers', 'cutPowers'];

/** A rule of the user's: every match of `find` in a cell is replaced by `replace`. */
interface IUserRule {
	readonly name: string;
	readonly find: RegExp;
	readonly replace: string;
	readonly firstColumn: boolean;
}

/** The rules of a rules file: which rules of Pollis are on, and the user's own, in order. */
export interface ITableRules {
	readonly pollis: Readonly<Record<PollisRule, boolean>>;
	readonly rules: readonly IUserRule[];
}

/** The cells after Normalise Table: the cells it changed, and those it flagged as cut off by the area. */
export interface INormalised {
	readonly cells: string[][];
	readonly changed: readonly (readonly [number, number])[];
	readonly flagged: readonly (readonly [number, number])[];
	readonly notNumbers: number;
}

/** The rules file a new user starts from: the rules of Pollis on, and an example of a rule of their own. */
export const RULES_TEMPLATE = `# The rules of Normalise Table, in the PDF Viewer: they rewrite the cells of a table taken from a PDF
# as programs read numbers. Your rules run first, in order, then the rules of Pollis that are on.
# The first column, the row labels, is left as it is, unless a rule of yours says firstColumn = true.

# The rules of Pollis: set one to false to turn it off.
[pollis]
# Minus signs and dashes as a hyphen joined to the number: \u2212 .00045 is -.00045
minus = true
# Significance stars dropped: 0.123*** is 0.123
stars = true
# No thousands separators: 82,502 is 82502
thousands = true
# Powers of ten as exponents: 1.1699 × 10 \u2212 2 and 1.1699 * 10 ^ (-2) are 1.1699e-2
powers = true
# A value that ends in × 10 is flagged: the area cut off its raised exponent
cutPowers = true

# Your rules, each a [[rule]]. find is a JavaScript regular expression, in single quotes so that a backslash
# needs no doubling; replace may use $1, $2 or $<name> for the groups found. Every match in a cell is replaced.
# flags = 'i' ignores case.
#
# [[rule]]
# name = "Percent signs dropped"
# find = '^(.*\\d)\\s*%$'
# replace = '$1'
`;

/** The rules when there is no rules file: those of Pollis, all on. */
export const DEFAULT_RULES: ITableRules = { pollis: { minus: true, stars: true, thousands: true, powers: true, cutPowers: true }, rules: [] };

/** A value of the rules file: a string in single quotes, as it is, or in double quotes, with escapes; or true or false. */
function parseValue(text: string): { readonly value: string | boolean; readonly rest: string } | undefined {
	const literal = /^'(?<value>[^']*)'(?<rest>.*)$/.exec(text);
	if (literal?.groups) {
		return { value: literal.groups.value, rest: literal.groups.rest };
	}
	const basic = /^"(?<value>(?:[^"\\]|\\.)*)"(?<rest>.*)$/.exec(text);
	if (basic?.groups) {
		const escapes: Record<string, string> = { n: '\n', t: '\t', '"': '"', '\\': '\\' };
		return { value: basic.groups.value.replace(/\\(?<character>.)/g, (_match, character: string) => escapes[character] ?? character), rest: basic.groups.rest };
	}
	const boolean = /^(?<value>true|false)\b(?<rest>.*)$/.exec(text);
	return boolean?.groups ? { value: boolean.groups.value === 'true', rest: boolean.groups.rest } : undefined;
}

/**
 * The rules of a rules file, written in the part of TOML it needs: a `[pollis]` table of true or false, and `[[rule]]`
 * tables of strings and true or false. Throws an error that names the line of a mistake.
 */
export function parseRules(text: string): ITableRules {
	const pollis: Record<PollisRule, boolean> = { ...DEFAULT_RULES.pollis };
	const rules: IUserRule[] = [];
	let section: 'top' | 'pollis' | Record<string, string | boolean> = 'top';
	const tables: { readonly line: number; readonly fields: Record<string, string | boolean> }[] = [];
	const lines = text.split(/\r?\n/);
	for (const [index, raw] of lines.entries()) {
		const line = raw.trim();
		const fail = (problem: string) => new Error(vscode.l10n.t("Line {0} of the rules: {1}", index + 1, problem));
		if (!line || line.startsWith('#')) {
			continue;
		}
		if (/^\[\s*pollis\s*\](\s*#.*)?$/.test(line)) {
			section = 'pollis';
			continue;
		}
		if (/^\[\[\s*rule\s*\]\](\s*#.*)?$/.test(line)) {
			section = {};
			tables.push({ line: index + 1, fields: section });
			continue;
		}
		const pair = /^(?<key>[A-Za-z][A-Za-z0-9_-]*)\s*=\s*(?<value>.*)$/.exec(line);
		if (!pair?.groups) {
			throw fail(vscode.l10n.t("expected [pollis], [[rule]] or a key = value"));
		}
		const parsed = parseValue(pair.groups.value);
		if (!parsed || !/^\s*(#.*)?$/.test(parsed.rest)) {
			throw fail(vscode.l10n.t("the value of {0} is not a string in quotes, true or false", pair.groups.key));
		}
		if (section === 'top') {
			throw fail(vscode.l10n.t("{0} is outside [pollis] and [[rule]]", pair.groups.key));
		} else if (section === 'pollis') {
			if (!(POLLIS_RULES as readonly string[]).includes(pair.groups.key) || typeof parsed.value !== 'boolean') {
				throw fail(vscode.l10n.t("[pollis] takes {0}, each true or false", POLLIS_RULES.join(', ')));
			}
			pollis[pair.groups.key as PollisRule] = parsed.value;
		} else {
			section[pair.groups.key] = parsed.value;
		}
	}
	for (const { line, fields } of tables) {
		const fail = (problem: string) => new Error(vscode.l10n.t("The rule of line {0}: {1}", line, problem));
		const name = typeof fields.name === 'string' ? fields.name : vscode.l10n.t("of line {0}", line);
		if (typeof fields.find !== 'string' || !fields.find) {
			throw fail(vscode.l10n.t("find, a regular expression in quotes, is missing"));
		}
		const flags = typeof fields.flags === 'string' ? fields.flags.replace(/g/g, '') : '';
		let find: RegExp;
		try {
			find = new RegExp(fields.find, `${flags}g`);
		} catch (error) {
			throw fail(error instanceof Error ? error.message : String(error));
		}
		rules.push({ name, find, replace: typeof fields.replace === 'string' ? fields.replace : '', firstColumn: fields.firstColumn === true });
	}
	return { pollis, rules };
}

const NUMBER = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i;

/** A cell rewritten by the rules of Pollis that are on. */
function pollisRules(cell: string, on: Readonly<Record<PollisRule, boolean>>): string {
	let value = cell.trim();
	if (on.minus) {
		value = value.replace(/[\u2212\u2010-\u2014\ufe63\uff0d]/g, '-').replace(/^([-+])\s+(?=[\d.])/, '$1');
	}
	if (on.stars) {
		value = value.replace(/(?<=[\d.)])\s*\*{1,3}$/, '');
	}
	if (on.thousands && /^[-+]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(value)) {
		value = value.replace(/,/g, '');
	}
	if (on.powers) {
		const power = /^(?<mantissa>[-+]?(?:\d+\.?\d*|\.\d+))\s*[×x·*]\s*10\s*(?:\^|\*\*)?\s*\(?\s*(?<sign>[-+\u2212]?)\s*(?<exponent>\d+)\s*\)?$/.exec(value);
		if (power?.groups) {
			value = `${power.groups.mantissa}e${power.groups.sign && power.groups.sign !== '+' ? '-' : ''}${power.groups.exponent}`;
		}
	}
	return value;
}

/** The cells rewritten by the user's rules, then by the rules of Pollis that are on; the first column only by rules that ask for it. */
export function normaliseCells(cells: readonly (readonly string[])[], rules: ITableRules): INormalised {
	const changed: [number, number][] = [];
	const flagged: [number, number][] = [];
	let notNumbers = 0;
	const result = cells.map((row, i) => row.map((cell, j) => {
		let value = cell;
		for (const rule of rules.rules) {
			if (j > 0 || rule.firstColumn) {
				value = value.replace(rule.find, rule.replace);
			}
		}
		if (j > 0) {
			value = pollisRules(value, rules.pollis);
			if (rules.pollis.cutPowers && /^[-+]?(?:\d+\.?\d*|\.\d+)\s*[×x·*]\s*10$/.test(value)) {
				flagged.push([i, j]);
			}
			if (value && !NUMBER.test(value)) {
				notNumbers++;
			}
		}
		if (value !== cell) {
			changed.push([i, j]);
		}
		return value;
	}));
	return { cells: result, changed, flagged, notNumbers };
}
