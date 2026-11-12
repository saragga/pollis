/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// No runtime imports: the build (build/lib/toml-to-ts.ts) runs this file directly under Node.
import type { IModelFaq, IModelFaqItem, IModelWiki, IScaffoldPanelData } from './model.types.js';

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

			// An array over several lines: the lines that follow, comments left out, until its brackets close
			if (valueStart.startsWith('[') && openBrackets(valueStart) > 0) {
				const parts = [valueStart];
				i++;
				while (i < lines.length && openBrackets(parts.join(' ')) > 0) {
					const next = lines[i].trim();
					if (next && !next.startsWith('#')) {
						parts.push(next);
					}
					i++;
				}
				currentSection[key] = parseValue(parts.join(' '));
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

/** How many of the brackets of `text` are still open, those inside strings not counted. */
function openBrackets(text: string): number {
	let open = 0;
	let quote = '';
	for (let index = 0; index < text.length; index++) {
		const character = text[index];
		if (quote) {
			if (character === '\\' && quote === '"') {
				index++;
			} else if (character === quote) {
				quote = '';
			}
		} else if (character === '"' || character === `'`) {
			quote = character;
		} else if (character === '[') {
			open++;
		} else if (character === ']') {
			open--;
		}
	}
	return open;
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

/** The fewest and the most options of a hidden question of the FAQ, the right one among them. */
export const FAQ_FEWEST_CHOICES = 4;
export const FAQ_MOST_CHOICES = 10;
/** The longest option of a hidden question, in characters. */
const FAQ_LONGEST_CHOICE = 200;
/** Options that do not choose: they let a model answer without knowing which option is right. */
const FAQ_NOT_CHOOSING = /\b(?:all|none) of the (?:above|others)\b|\bboth [a-j] and [a-j]\b|\bneither [a-j] nor [a-j]\b/i;

const faqText = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const faqList = (value: unknown) => Array.isArray(value) ? value.map(item => typeof item === 'string' ? item.trim() : '') : undefined;

/**
 * What is wrong with the `[[faq]]` entries of a parsed panel TOML, each named by its question: errors, which stop the
 * build, and warnings. A shown entry has an answer and no options; a hidden one is a closed question, with its right
 * option, `right`, from 3 to 9 wrong ones, `wrong`, and an optional `explanation`, and no answer.
 */
export function faqProblems(data: TomlValue): { readonly errors: string[]; readonly warnings: string[] } {
	const errors: string[] = [];
	const warnings: string[] = [];
	const entries = Array.isArray(data.faq) ? data.faq as TomlValue[] : [];
	for (const [index, entry] of entries.entries()) {
		const question = faqText(entry.question);
		const name = question ? `"${question}"` : `FAQ entry ${index + 1}`;
		if (!question) {
			errors.push(`${name} has no question`);
		}
		if (entry.hidden !== true) {
			if (!faqText(entry.answer)) {
				errors.push(`${name} is shown and has no answer`);
			}
			if (entry.right !== undefined || entry.wrong !== undefined) {
				errors.push(`${name} is shown and has options: only a hidden question is closed`);
			}
			continue;
		}
		if (entry.answer !== undefined) {
			errors.push(`${name} is hidden and has an answer: a hidden question has its options, right and wrong`);
		}
		const right = faqText(entry.right);
		const wrong = faqList(entry.wrong);
		if (!right || !wrong) {
			errors.push(`${name} is hidden and has no ${!right ? 'right option' : 'wrong options'}`);
			continue;
		}
		const choices = [right, ...wrong];
		if (choices.length < FAQ_FEWEST_CHOICES || choices.length > FAQ_MOST_CHOICES) {
			errors.push(`${name} has ${choices.length} options: from ${FAQ_FEWEST_CHOICES} to ${FAQ_MOST_CHOICES}, the right one among them`);
		}
		if (choices.some(choice => !choice)) {
			errors.push(`${name} has an empty option`);
		}
		const normal = choices.map(choice => choice.toLowerCase().replace(/\s+/g, ' '));
		if (new Set(normal).size < normal.length) {
			errors.push(`${name} has the same option twice`);
		}
		for (const choice of choices.filter(choice => FAQ_NOT_CHOOSING.test(choice))) {
			errors.push(`${name} has an option that does not choose: "${choice}"`);
		}
		for (const choice of choices.filter(choice => choice.length > FAQ_LONGEST_CHOICE)) {
			errors.push(`${name} has an option longer than ${FAQ_LONGEST_CHOICE} characters: "${choice.slice(0, 40)}..."`);
		}
		if (entry.explanation !== undefined && typeof entry.explanation !== 'string') {
			errors.push(`${name} has an explanation that is not text`);
		}
		// A right option much the longest is a clue that models learn
		if (wrong.length && right.length > 1.5 * Math.max(...wrong.map(choice => choice.length))) {
			warnings.push(`${name}: the right option is much the longest`);
		}
		if (!faqText(entry.explanation)) {
			warnings.push(`${name} has no explanation`);
		}
	}
	return { errors, warnings };
}

/**
 * The questions of the `[[faq]]` table of a parsed panel TOML, those without a question or an answer left out: a
 * hidden one with its right option as its answer and its wrong options.
 */
export function panelFaq(data: TomlValue): IModelFaq[] {
	const entries = Array.isArray(data.faq) ? data.faq as TomlValue[] : [];
	return entries.flatMap(entry => {
		const question = faqText(entry.question);
		const hidden = entry.hidden === true;
		const answer = hidden ? faqText(entry.right) : faqText(entry.answer);
		const wrong = hidden ? faqList(entry.wrong)?.filter(choice => choice) : undefined;
		const explanation = hidden ? faqText(entry.explanation) : '';
		if (!question || !answer || (hidden && !wrong?.length)) {
			return [];
		}
		return [{
			question,
			answer,
			...(typeof entry.wiki === 'string' && entry.wiki.trim() ? { wiki: entry.wiki.trim() } : {}),
			...(hidden ? { hidden: true, wrong } : {}),
			...(explanation ? { explanation } : {}),
		}];
	});
}

/**
 * `choices` in an order of their own, the same each time for the same `question`: the options of a closed question,
 * so that the right one is not where its author wrote it, and every run asks them in the same order.
 */
function shuffledChoices(choices: readonly string[], question: string): string[] {
	// FNV-1a of the question seeds mulberry32, which draws the Fisher-Yates shuffle
	let seed = 0x811c9dc5;
	for (const character of question) {
		seed = Math.imul(seed ^ character.codePointAt(0)!, 0x01000193);
	}
	const random = () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
	const shuffled = [...choices];
	for (let index = shuffled.length - 1; index > 0; index--) {
		const other = Math.floor(random() * (index + 1));
		[shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
	}
	return shuffled;
}

/** A label or text of a panel as plain text: without its tags, its character references read. */
function plainText(text: string): string {
	return text.replace(/<[^>]+>/g, '')
		.replace(/&#x(?<hex>[0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
		.replace(/&#(?<decimal>\d+);/g, (_, decimal: string) => String.fromCodePoint(Number(decimal)))
		.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
		.replace(/\s+/g, ' ').trim();
}

/** The Key Points of a panel as plain text, each its words and, after a colon, what the panel says of them. */
export function panelKeyPoints(data: IScaffoldPanelData): string[] {
	return (data.bullets ?? []).map(bullet => bullet.detail?.trim() ? `${plainText(bullet.text)}: ${plainText(bullet.detail)}` : plainText(bullet.text));
}

/** The keys in PollisReferences of the works a panel cites: those of its References and the papers of its packages. */
export function panelCitedKeys(data: IScaffoldPanelData): string[] {
	const keys = [
		...data.references.map(reference => (reference as { readonly key?: string }).key),
		...data.packages.flatMap(pkg => pkg.papers.map(paper => paper.key)),
	];
	return [...new Set(keys.filter((key): key is string => !!key))];
}

/** Whether `wiki` is a page of Learn More, bundled or online, rather than a separator between them. */
function isWikiPage(wiki: IModelWiki): wiki is Exclude<IModelWiki, { readonly separator: true }> {
	return (wiki as { readonly separator?: boolean }).separator !== true;
}

/**
 * The hidden questions of the FAQ of a panel, closed questions, as the Panel FAQ test set of Evaluate Answering Models
 * holds them: each asked in the panel `title` with its options in an order of their own, with the file of the wiki
 * that answers it when the panel bundles it. The shown questions are for Learn More only: their answers are in view.
 */
export function panelFaqItems(data: TomlValue, title: string): IModelFaqItem[] {
	const panel = tomlToPanelData(data);
	return panelFaq(data).filter(entry => entry.hidden && entry.wrong).map(entry => {
		const wiki = entry.wiki ? panel.wikis.filter(isWikiPage).find(candidate => candidate.name === entry.wiki) : undefined;
		const choices = shuffledChoices([entry.answer, ...entry.wrong!], entry.question);
		return {
			source: `Panel FAQ, ${title}${entry.wiki ? `, ${entry.wiki}` : ''}`,
			context: '',
			question: entry.question,
			answer: entry.answer,
			panel: { title, packages: panel.packages.map(pkg => pkg.name), references: panelCitedKeys(panel) },
			...(wiki?.bundled ? { wikiFile: wiki.file } : {}),
			hidden: true,
			choices,
			rightChoice: choices.indexOf(entry.answer),
			...(entry.explanation ? { explanation: entry.explanation } : {}),
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
		['faq', panelFaq(data).filter(entry => !entry.hidden).map(({ question, answer, wiki }) => ({ question, answer, ...(wiki ? { wiki } : {}) }))],
	];
	for (const [key, value] of optional) {
		if (Array.isArray(value) ? value.length : value) {
			panel[key] = value;
		}
	}
	return panel as unknown as IScaffoldPanelData;
}
