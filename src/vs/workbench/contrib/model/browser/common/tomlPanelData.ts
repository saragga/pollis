/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// No runtime imports: the build (build/lib/toml-to-ts.ts) runs this file directly under Node.
import type { IModelFaq, IModelFaqItem, IScaffoldPanelData } from './model.types.js';

/** A table of a parsed TOML file. */
export interface TomlValue {
	[key: string]: unknown;
}

/**
 * Navigate a dotted path in an object, creating intermediate objects as needed.
 * Returns the parent object and the final key.
 */
function navigatePath(root: TomlValue, dotPath: string): { parent: TomlValue; key: string } {
	const parts = dotPath.split('.');
	let current: TomlValue = root;
	for (let i = 0; i < parts.length - 1; i++) {
		const part = parts[i];
		if (!Object.hasOwn(current, part)) {
			current[part] = {};
		}
		current = current[part] as TomlValue;
	}
	return { parent: current, key: parts[parts.length - 1] };
}

/**
 * Parse a subset of TOML sufficient for Pollis webview metadata files.
 * Supports: [section], [[array-of-tables]], dotted keys in section names,
 * multiline strings (triple-quoted), inline arrays, booleans, integers, floats.
 */
export function parseToml(content: string): TomlValue {
	const result: TomlValue = {};
	// currentSection is where key=value pairs go
	let currentSection: TomlValue = result;
	// Track the last element added for each array path so nested [[a.b]] appends to last a element
	const lastArrayElement = new Map<string, TomlValue>();

	// Normalize line endings
	const lines = content.replace(/\r\n/g, '\n').split('\n');
	let i = 0;

	while (i < lines.length) {
		const raw = lines[i];
		const line = raw.trim();

		// Skip empty lines and comments
		if (!line || line.startsWith('#')) {
			i++;
			continue;
		}

		// [[array-of-tables]]
		if (line.startsWith('[[') && line.endsWith(']]')) {
			const arrayPath = line.slice(2, -2).trim();
			const parts = arrayPath.split('.');

			// Find the longest prefix that is a known array, to support [[parent.child]]
			// e.g. [[notebookSections.notebooks]] -> parent path is "notebookSections", child is "notebooks"
			let parentPath = '';
			let parentEl: TomlValue | null = null;
			for (let p = parts.length - 1; p >= 1; p--) {
				const prefix = parts.slice(0, p).join('.');
				if (lastArrayElement.has(prefix)) {
					parentPath = prefix;
					parentEl = lastArrayElement.get(prefix)!;
					break;
				}
			}

			if (parentEl !== null) {
				// Nested array: append under the last element of the parent array
				const childKey = parts.slice(parentPath.split('.').length).join('.');
				const { parent, key } = navigatePath(parentEl, childKey);
				if (!Array.isArray(parent[key])) {
					parent[key] = [];
				}
				const arr = parent[key] as TomlValue[];
				const newObj: TomlValue = {};
				arr.push(newObj);
				currentSection = newObj;
				lastArrayElement.set(arrayPath, newObj);
			} else {
				// Top-level array: navigate from root
				const { parent, key } = navigatePath(result, arrayPath);
				if (!Array.isArray(parent[key])) {
					parent[key] = [];
				}
				const arr = parent[key] as TomlValue[];
				const newObj: TomlValue = {};
				arr.push(newObj);
				currentSection = newObj;
				lastArrayElement.set(arrayPath, newObj);
			}
			i++;
			continue;
		}

		// [section]
		if (line.startsWith('[') && line.endsWith(']') && !line.startsWith('[[')) {
			const sectionPath = line.slice(1, -1).trim();

			const { parent, key } = navigatePath(result, sectionPath);
			if (!Object.hasOwn(parent, key)) {
				parent[key] = {};
			}
			currentSection = parent[key] as TomlValue;
			i++;
			continue;
		}

		// Key = value
		const eqIndex = line.indexOf('=');
		if (eqIndex > 0) {
			const key = line.slice(0, eqIndex).trim();
			const valueStart = line.slice(eqIndex + 1).trim();

			// Multiline string: triple single or double quotes
			if (valueStart === `'''` || valueStart === '"""') {
				const quote = valueStart;
				i++;
				const mlLines: string[] = [];
				while (i < lines.length) {
					if (lines[i].trimEnd() === quote) {
						i++;
						break;
					}
					mlLines.push(lines[i]);
					i++;
				}
				currentSection[key] = mlLines.join('\n');
				continue;
			}

			// Value on the same line as key (might start with triple-quote inline)
			if (valueStart.startsWith(`'''`) && valueStart !== `'''` && valueStart.endsWith(`'''`) && valueStart.length > 6) {
				currentSection[key] = valueStart.slice(3, -3);
				i++;
				continue;
			}
			if (valueStart.startsWith('"""') && valueStart !== '"""' && valueStart.endsWith('"""') && valueStart.length > 6) {
				currentSection[key] = valueStart.slice(3, -3);
				i++;
				continue;
			}

			currentSection[key] = parseValue(valueStart);
			i++;
			continue;
		}

		i++;
	}

	return result;
}

function parseValue(str: string): unknown {
	// Multiline / triple-quoted strings that are complete on one token
	if (str.startsWith(`'''`) && str.endsWith(`'''`) && str.length >= 6) {
		return str.slice(3, -3);
	}
	if (str.startsWith('"""') && str.endsWith('"""') && str.length >= 6) {
		return str.slice(3, -3);
	}

	// Double-quoted string
	if (str.startsWith('"') && str.endsWith('"') && str.length >= 2) {
		return str.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
	}

	// Single-quoted string (literal — no escapes)
	if (str.startsWith('\'') && str.endsWith('\'') && str.length >= 2) {
		return str.slice(1, -1);
	}

	// Boolean
	if (str === 'true') { return true; }
	if (str === 'false') { return false; }

	// Number
	if (/^-?\d+$/.test(str)) { return parseInt(str, 10); }
	if (/^-?\d+\.\d+$/.test(str)) { return parseFloat(str); }

	// Inline array
	if (str.startsWith('[') && str.endsWith(']')) {
		const inner = str.slice(1, -1).trim();
		if (!inner) { return []; }
		// Split respecting quoted strings
		const items: unknown[] = [];
		let current = '';
		let inQuote: string | null = null;
		for (const ch of inner) {
			if (inQuote) {
				current += ch;
				if (ch === inQuote) { inQuote = null; }
			} else if (ch === '"' || ch === '\'') {
				inQuote = ch;
				current += ch;
			} else if (ch === ',') {
				items.push(parseValue(current.trim()));
				current = '';
			} else {
				current += ch;
			}
		}
		if (current.trim()) { items.push(parseValue(current.trim())); }
		return items;
	}

	return str;
}

/** The questions of the `[[faq]]` table of a parsed panel TOML, those without a question or an answer left out. */
export function panelFaq(data: TomlValue): IModelFaq[] {
	const entries = Array.isArray(data.faq) ? data.faq as TomlValue[] : [];
	return entries.flatMap(entry => {
		const question = typeof entry.question === 'string' ? entry.question.trim() : '';
		const answer = typeof entry.answer === 'string' ? entry.answer.trim() : '';
		if (!question || !answer) {
			return [];
		}
		return [{
			question,
			answer,
			...(typeof entry.wiki === 'string' && entry.wiki.trim() ? { wiki: entry.wiki.trim() } : {}),
			...(entry.hidden === true ? { hidden: true } : {}),
		}];
	});
}

/** A label or text of a panel as plain text: without its tags, its character references read. */
function plainText(text: string): string {
	return text.replace(/<[^>]+>/g, '')
		.replace(/&#x(?<hex>[0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
		.replace(/&#(?<decimal>\d+);/g, (_, decimal: string) => String.fromCodePoint(Number(decimal)))
		.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
		.replace(/\s+/g, ' ').trim();
}

/**
 * What a panel holds, for a model answering a question asked in it (the Panel Aware style of Ask Pollis): its models,
 * Key Points, decision table, inputs and packages, as plain text. Never its FAQ, whose questions test Ask Pollis.
 */
export function panelCard(data: IScaffoldPanelData): string {
	const lines: string[] = [];
	const models = (data.models ?? []).map(model => plainText(model.label));
	if (models.length > 1) {
		lines.push(`Its models, each a tab: ${models.join('; ')}.`);
	}
	const bullets = (data.bullets ?? []).map(bullet => `- ${plainText(bullet.text)}: ${plainText(bullet.detail)}`);
	if (bullets.length) {
		lines.push('Its Key Points:', ...bullets);
	}
	const rows = (data.decisionRows ?? []).map(row => `- ${plainText(row.task)}: ${plainText(row.context)}. ${plainText(row.purpose)}`);
	if (rows.length) {
		lines.push('Which to choose, as its decision table says:', ...rows);
	}
	const inputs = [...new Set((data.inputs ?? []).map(input => plainText(input.label)).filter(label => label))];
	if (inputs.length) {
		lines.push(`Its inputs, which fill in its Example Code: ${inputs.join('; ')}.`);
	}
	const packages = data.packages.map(pkg => pkg.name);
	if (packages.length) {
		lines.push(`Powered by: ${packages.join(', ')}.`);
	}
	return lines.join('\n');
}

/**
 * The questions of the FAQ of a panel, the hidden ones too, as the Panel FAQ test set of Evaluate Answering Models
 * holds them: each asked in the panel `title`, with the file of the wiki that answers it when the panel bundles it.
 */
export function panelFaqItems(data: TomlValue, title: string): IModelFaqItem[] {
	const panel = tomlToPanelData(data);
	return panelFaq(data).map(entry => {
		const wiki = entry.wiki ? panel.wikis.find(candidate => 'name' in candidate && candidate.name === entry.wiki) : undefined;
		return {
			source: `Panel FAQ, ${title}${entry.wiki ? `, ${entry.wiki}` : ''}`,
			context: '',
			question: entry.question,
			answer: entry.answer,
			panel: { title, packages: panel.packages.map(pkg => pkg.name), card: panelCard(panel) },
			...(wiki && 'bundled' in wiki && wiki.bundled ? { wikiFile: wiki.file } : {}),
			...(entry.hidden ? { hidden: true } : {}),
		};
	});
}

/**
 * The panel data of a parsed panel TOML, with its fields in the order the generated `*.data.ts`
 * files list them; the optional fields are present only when the TOML gives them.
 */
export function tomlToPanelData(data: TomlValue): IScaffoldPanelData {
	// Each package gets the required `papers: []` default
	const packages = ((data.packages as TomlValue[] | undefined) ?? []).map(pkg => ({ ...pkg, papers: [] }));
	const notebookSections = (data.notebookSections as TomlValue[] | undefined) ?? [];
	// The flat list of notebooks comes from the notebook sections
	const notebooks = notebookSections.flatMap(section => Array.isArray(section.notebooks) ? section.notebooks : []);
	const panel: TomlValue = {
		packages,
		notebooks,
		notebookSections,
		wikis: (data.wikis as unknown[] | undefined) ?? [],
		references: (data.references as unknown[] | undefined) ?? [],
	};
	// miniCharts: stored as [miniCharts.modelName] sections, converted to an array
	const miniCharts = Object.entries((data.miniCharts as TomlValue | undefined) ?? {}).map(([model, value]) => ({
		model,
		svg: (value as TomlValue).svg as string ?? '',
	}));
	const optional: [string, unknown][] = [
		// [requires] packages = [...]: further packages the examples use, for the install indicator only
		['requires', (data.requires as TomlValue | undefined)?.packages],
		['models', data.models],
		['bullets', data.bullets],
		['decisionRows', data.decisionRows],
		['notes', data.notes],
		['explore', data.explore],
		['miniCharts', miniCharts],
		['codeBranches', data.codeBranches],
		['actionGroups', data.actionGroups],
		['inputs', data.inputs],
		// [[faq]]: the hidden questions are for the Panel FAQ test set only, never in the panel's data
		['faq', panelFaq(data).filter(entry => !entry.hidden)],
	];
	for (const [key, value] of optional) {
		if (Array.isArray(value) ? value.length : value) {
			panel[key] = value;
		}
	}
	return panel as unknown as IScaffoldPanelData;
}
