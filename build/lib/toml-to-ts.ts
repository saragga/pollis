/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';

interface TomlValue {
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

function toTypeScriptLiteral(value: unknown, indent: string = ''): string {
	if (value === null || value === undefined) {
		return 'undefined';
	}

	if (typeof value === 'boolean') {
		return value ? 'true' : 'false';
	}

	if (typeof value === 'number') {
		return String(value);
	}

	if (typeof value === 'string') {
		const escaped = value
			.replace(/\\/g, '\\\\')
			.replace(/'/g, '\\\'')
			.replace(/\n/g, '\\n')
			.replace(/\r/g, '\\r')
			.replace(/\t/g, '\\t');
		return `'${escaped}'`;
	}

	if (Array.isArray(value)) {
		if (value.length === 0) { return '[]'; }

		const isSimple = value.every(v => typeof v !== 'object' || v === null);
		if (isSimple) {
			return `[${value.map(v => toTypeScriptLiteral(v, indent)).join(', ')}]`;
		}

		const nextIndent = indent + '\t';
		return `[\n${nextIndent}${value.map(v => toTypeScriptLiteral(v, nextIndent)).join(`,\n${nextIndent}`)}\n${indent}]`;
	}

	if (typeof value === 'object') {
		const obj = value as TomlValue;
		const keys = Object.keys(obj);
		if (keys.length === 0) { return '{}'; }

		const nextIndent = indent + '\t';
		const entries = keys.map(key => {
			const val = toTypeScriptLiteral(obj[key], nextIndent);
			return `${nextIndent}${key}: ${val}`;
		});

		return `{\n${entries.join(',\n')}\n${indent}}`;
	}

	return String(value);
}

export function generateTypeScriptFromToml(tomlPath: string, acronym: string): string {
	const content = fs.readFileSync(tomlPath, 'utf-8');
	const data = parseToml(content);

	const acronymUpper = acronym.toUpperCase();
	const interfaceName = `I${acronym.charAt(0).toUpperCase()}${acronym.slice(1)}Metadata`;

	// Extract sections — add required `papers: []` default to each package
	const packages = ((data.packages as TomlValue[] | undefined) ?? []).map(pkg => ({ ...pkg, papers: [] }));
	const notebookSections = (data.notebookSections as unknown[] | undefined) ?? [];
	// Derive notebooks flat list from notebookSections
	const notebooks = notebookSections.flatMap(s => {
		const section = s as TomlValue;
		return Array.isArray(section.notebooks) ? section.notebooks : [];
	});
	const wikis = (data.wikis as unknown[] | undefined) ?? [];
	const references = (data.references as unknown[] | undefined) ?? [];
	// [requires] packages = [...]: further packages the examples use, for the install indicator only
	const requires = ((data.requires as TomlValue | undefined)?.packages as unknown[] | undefined) ?? [];
	const bullets = (data.bullets as unknown[] | undefined) ?? [];
	const decisionRows = (data.decisionRows as unknown[] | undefined) ?? [];
	const notes = (data.notes as TomlValue | undefined) ?? null;
	const explore = (data.explore as TomlValue | undefined) ?? null;
	const codeBranches = (data.codeBranches as unknown[] | undefined) ?? [];
	const actionGroups = (data.actionGroups as unknown[] | undefined) ?? [];
	const inputs = (data.inputs as unknown[] | undefined) ?? [];
	const models = (data.models as unknown[] | undefined) ?? [];

	// miniCharts: stored as [miniCharts.modelName] sections — convert to array
	const miniChartsRaw = (data.miniCharts as TomlValue | undefined) ?? {};
	const miniCharts = Object.entries(miniChartsRaw).map(([model, val]) => ({
		model,
		svg: (val as TomlValue).svg as string ?? '',
	}));

	const optionalFields = [
		requires.length ? `\n\t\trequires: ${toTypeScriptLiteral(requires, '\t\t')},` : '',
		models.length ? `\n\t\tmodels: ${toTypeScriptLiteral(models, '\t\t')},` : '',
		bullets.length ? `\n\t\tbullets: ${toTypeScriptLiteral(bullets, '\t\t')},` : '',
		decisionRows.length ? `\n\t\tdecisionRows: ${toTypeScriptLiteral(decisionRows, '\t\t')},` : '',
		notes ? `\n\t\tnotes: ${toTypeScriptLiteral(notes, '\t\t')},` : '',
		explore ? `\n\t\texplore: ${toTypeScriptLiteral(explore, '\t\t')},` : '',
		miniCharts.length ? `\n\t\tminiCharts: ${toTypeScriptLiteral(miniCharts, '\t\t')},` : '',
		codeBranches.length ? `\n\t\tcodeBranches: ${toTypeScriptLiteral(codeBranches, '\t\t')},` : '',
		actionGroups.length ? `\n\t\tactionGroups: ${toTypeScriptLiteral(actionGroups, '\t\t')},` : '',
		inputs.length ? `\n\t\tinputs: ${toTypeScriptLiteral(inputs, '\t\t')},` : '',
	].join('');

	const ts = `/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// This file is auto-generated by build/lib/toml-to-ts.ts from ${acronym}.toml
// Do not edit manually — run: npm run gulp compile-toml

import { ${interfaceName} } from '../common/${acronym}.types.js';

export const ${acronymUpper}_METADATA: ${interfaceName} = {
\t${acronym}: {
\t\tpackages: ${toTypeScriptLiteral(packages, '\t\t')},
\t\tnotebooks: ${toTypeScriptLiteral(notebooks, '\t\t')},
\t\tnotebookSections: ${toTypeScriptLiteral(notebookSections, '\t\t')},
\t\twikis: ${toTypeScriptLiteral(wikis, '\t\t')},
\t\treferences: ${toTypeScriptLiteral(references, '\t\t')},${optionalFields}
\t},
};
`;

	return ts;
}

export function transformTomlFiles(tomlDir: string, outDir: string): void {
	const files = fs.readdirSync(tomlDir).filter(f => f.endsWith('.toml'));

	for (const file of files) {
		const acronym = file.replace('.toml', '');
		const tomlPath = path.join(tomlDir, file);
		const outPath = path.join(outDir, `${acronym}.data.ts`);

		console.log(`Transforming ${file} → ${path.relative(tomlDir, outPath)}`);

		const ts = generateTypeScriptFromToml(tomlPath, acronym);
		fs.writeFileSync(outPath, ts, 'utf-8');
	}
}
