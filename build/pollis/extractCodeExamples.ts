/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Extract every Julia code example of the scaffold model panels, as the panels render them.
//
//   node build/pollis/extractCodeExamples.ts
//
// For every panel TOML (src/vs/workbench/contrib/model/browser/webviews/<id>.toml) and every
// model toggle, the default code and every Next Steps action are rendered with every input at
// its default. The rendering is a port of the panel's own template code (inputRaw, holds,
// codeLine and applyInputsForModel in webviewScaffold.ts; codeLinesJs and buildCodeBranchesJs
// in scaffoldParts.ts). Output, in .build/code-examples/:
//   <id>/<model>.jl  the default code, then each action as a commented block
//   index.json       one record per snippet
//   SUMMARY.md       counts per panel and the anomalies found (nothing is fixed here)

import * as fs from 'fs';
import * as path from 'path';
import { parseToml } from '../lib/toml-to-ts.ts';

const ROOT = path.join(import.meta.dirname, '..', '..');
const WEBVIEWS_DIR = path.join(ROOT, 'src', 'vs', 'workbench', 'contrib', 'model', 'browser', 'webviews');
const OUT_DIR = path.join(ROOT, '.build', 'code-examples');

/** Expected totals, from the Pollis Polish Roadmap (task 3.1). */
const EXPECTED = { panels: 209, branches: 683, actions: 2063 };

interface InputOption {
	readonly value: string;
	readonly label?: string;
	readonly models?: string[];
	readonly when?: string;
}

interface Input {
	readonly id: string;
	readonly kind?: string;
	readonly default?: string;
	readonly options?: InputOption[];
	readonly models?: string[];
	readonly when?: string;
}

interface CodeBranch {
	readonly model: string;
	readonly code: string;
}

interface Action {
	readonly id: string;
	readonly label: string;
	readonly desc: string;
	readonly code: string;
}

interface ActionGroup {
	readonly id: string;
	readonly label: string;
	readonly actions?: Action[];
}

interface ModelToggle {
	readonly id: string;
	readonly label: string;
}

interface PanelToml {
	readonly meta?: { readonly title?: string; readonly defaultModel?: string };
	readonly packages?: { readonly name?: string }[];
	readonly requires?: { readonly packages?: string[] };
	readonly models?: ModelToggle[];
	readonly codeBranches?: CodeBranch[];
	readonly actionGroups?: ActionGroup[];
	readonly inputs?: Input[];
}

/** One rendered code example, as written to index.json. */
interface Snippet {
	readonly panel: string;
	readonly title: string;
	readonly model: string;
	readonly kind: 'default' | 'action';
	readonly group: string | null;
	readonly actionId: string | null;
	readonly label: string;
	readonly desc: string | null;
	readonly packages: string[];
	readonly code: string;
	readonly lines: number;
}

/** One anomaly: its kind, the panel, where in the panel, and what was found. */
interface Anomaly {
	readonly kind: AnomalyKind;
	readonly panel: string;
	readonly where: string;
	readonly detail: string;
}

type AnomalyKind =
	| 'placeholder-left'
	| 'guard-unknown-input'
	| 'guard-unknown-value'
	| 'default-not-an-option'
	| 'model-without-branch'
	| 'branch-without-model'
	| 'empty-action'
	| 'greek-letter'
	| 'dataframes-or-zygote'
	| 'possible-postfix-transpose';

const ANOMALY_TITLES: Record<AnomalyKind, string> = {
	'placeholder-left': 'Placeholder left after rendering (unknown input id, or a guard that is not at the start of the line)',
	'guard-unknown-input': 'Guard or `when` naming an unknown input id',
	'guard-unknown-value': 'Guard or `when` value that no option of that select (or no model) has',
	'default-not-an-option': 'Select input whose default is not one of its options',
	'model-without-branch': 'Model with no codeBranch (and no `*` fallback)',
	'branch-without-model': 'codeBranch whose model is not in [[models]]',
	'empty-action': 'Action whose code is empty after rendering for some model',
	'greek-letter': 'Literal Greek letter (U+0370 to U+03FF) in code',
	'dataframes-or-zygote': '`DataFrames` or `Zygote` in the TOML',
	'possible-postfix-transpose': 'Possible postfix transpose (identifier, `)` or `]` directly followed by `\'`)',
};

// -- Rendering: a port of the panel template code

const GUARD_RE = /^[{][{][?]([\w-]+)(!?=)([^}]*)[}][}] ?/;
const PLACEHOLDER_RE = /[{][{]([\w-]+)[}][}]/g;
const WHEN_RE = /^([\w-]+)(!?=)(.*)$/;

/** The input values of one panel for one model, and the placeholder ids it could not resolve. */
class InputState {
	readonly values = new Map<string, string>();
	readonly unknownIds = new Set<string>();
	readonly model: string;

	constructor(model: string) {
		this.model = model;
	}

	/** Port of inputRaw: the current model, a select's value, or a text input's value (its default when empty). */
	inputRaw(id: string): string {
		if (id === 'model') {
			return this.model;
		}
		const value = this.values.get(id);
		if (value === undefined) {
			this.unknownIds.add(id);
			return '';
		}
		return value;
	}

	/** Port of holds. */
	holds(id: string, op: string, values: string): boolean {
		return (values.split('|').indexOf(this.inputRaw(id)) >= 0) !== (op === '!=');
	}

	/** Port of whenHolds. */
	whenHolds(when: string | undefined): boolean {
		const m = when ? WHEN_RE.exec(when) : null;
		return !m || this.holds(m[1], m[2], m[3]);
	}

	/** Port of codeLine: the plain source lines one template line renders to (none when its guard fails). */
	codeLine(s: string): string[] {
		const m = GUARD_RE.exec(s);
		if (m) {
			if (!this.holds(m[1], m[2], m[3])) {
				return [];
			}
			s = s.slice(m[0].length);
		}
		if (!s) {
			return [''];
		}
		// A multi-line value (a textarea) becomes one code line per line.
		return s.replace(PLACEHOLDER_RE, (_, id: string) => this.inputRaw(id)).split('\n');
	}

	/** Port of codeLinesJs + extractCode: the plain source of a whole template. */
	render(code: string): string {
		return code.trim().split('\n').flatMap(l => this.codeLine(l.trimEnd())).join('\n');
	}
}

function availableFor(models: string[] | undefined, model: string): boolean {
	return !models?.length || models.indexOf(model) >= 0;
}

/**
 * The input values of a freshly opened panel showing `model`: a port of the initial DOM state
 * (buildInputHtml) followed by applyInputsForModel, which visits the selects in page order.
 */
function initialInputs(inputs: Input[], model: string): InputState {
	const state = new InputState(model);
	const selected = new Map<Input, number>();
	for (const input of inputs) {
		if (state.values.has(input.id)) {
			continue; // document.getElementById finds the first element with an id
		}
		const def = input.default ?? '';
		if (input.kind === 'select') {
			const options = input.options ?? [];
			// The last option marked `selected` wins; with none, the browser selects the first one
			let index = -1;
			options.forEach((o, i) => { if (o.value === input.default) { index = i; } });
			index = Math.max(index, 0);
			selected.set(input, index);
			state.values.set(input.id, options[index]?.value ?? '');
		} else if (input.kind === 'textarea') {
			state.values.set(input.id, def.trim() || def);
		} else {
			state.values.set(input.id, def);
		}
	}
	for (const input of inputs) {
		const index = selected.get(input);
		if (index === undefined) {
			continue;
		}
		const options = input.options ?? [];
		const ok = options.map(o => availableFor(o.models, model) && state.whenHolds(o.when));
		const first = ok.indexOf(true);
		if (first >= 0 && (!options[index] || !ok[index])) {
			state.values.set(input.id, options[first].value);
		}
	}
	return state;
}

/** Port of panelModels: the declared models, else one per non-`*` code branch. */
function panelModels(data: PanelToml): ModelToggle[] {
	if (data.models?.length) {
		return data.models;
	}
	return (data.codeBranches ?? []).filter(b => b.model !== '*').map(b => ({ id: b.model, label: b.model.charAt(0).toUpperCase() + b.model.slice(1) }));
}

/** Port of buildCodeBranchesJs: the first branch for the model, else the `*` fallback. */
function branchFor(data: PanelToml, model: string): CodeBranch | undefined {
	const branches = data.codeBranches ?? [];
	return branches.find(b => b.model !== '*' && b.model === model) ?? branches.find(b => b.model === '*');
}

// -- Static checks

const GREEK_RE = /[\u0370-\u03FF]/;
const BANNED_RE = /\b(?:DataFrames|Zygote)\b/;
const IDENT_CHAR_RE = /[\p{L}\p{N}_!]/u;

/**
 * The lines of a Julia source with a likely postfix transpose (an identifier character, `)` or
 * `]` directly followed by `'`, outside strings, character literals, commands and comments),
 * with the number of matches on each line.
 */
function findPostfixTransposes(source: string): { line: number; text: string; count: number }[] {
	const found: { line: number; text: string; count: number }[] = [];
	const lines = source.split('\n');
	let inString: '"' | '"""' | '`' | null = null;
	let inBlockComment = 0;
	for (let li = 0; li < lines.length; li++) {
		const s = lines[li];
		for (let i = 0; i < s.length; i++) {
			const c = s[i];
			if (inBlockComment) {
				if (s.startsWith('=#', i)) { inBlockComment--; i++; }
				else if (s.startsWith('#=', i)) { inBlockComment++; i++; }
				continue;
			}
			if (inString) {
				if (c === '\\') { i++; }
				else if (inString === '"""' ? s.startsWith('"""', i) : c === inString) {
					i += inString.length - 1;
					inString = null;
				}
				continue;
			}
			if (s.startsWith('#=', i)) { inBlockComment = 1; i++; continue; }
			if (c === '#') { break; }
			if (s.startsWith('"""', i)) { inString = '"""'; i += 2; continue; }
			if (c === '"' || c === '`') { inString = c; continue; }
			if (c === '\'') {
				const prev = i > 0 ? s[i - 1] : '';
				if (prev === ')' || prev === ']' || (prev && IDENT_CHAR_RE.test(prev))) {
					const last = found[found.length - 1];
					if (last?.line === li + 1) {
						last.count++;
					} else {
						found.push({ line: li + 1, text: s.trim(), count: 1 });
					}
					continue;
				}
				// A character literal: skip to its closing quote
				let j = i + 1;
				while (j < s.length && s[j] !== '\'') {
					j += s[j] === '\\' ? 2 : 1;
				}
				i = j;
			}
		}
	}
	return found;
}

/** Strip the guard of each template line, keeping the line count. */
function unguarded(code: string): string {
	return code.split('\n').map(l => l.replace(GUARD_RE, '')).join('\n');
}

/** Guards, `when` conditions and select defaults of a panel; selects without a default go to `withoutDefault`. */
function checkInputs(panel: string, data: PanelToml, models: ModelToggle[], anomalies: Anomaly[], withoutDefault: string[]): void {
	const inputs = data.inputs ?? [];
	const byId = new Map<string, Input>();
	for (const input of inputs) {
		if (!byId.has(input.id)) {
			byId.set(input.id, input);
		}
	}
	const modelIds = new Set(models.map(m => m.id));

	const checkCondition = (where: string, id: string, values: string) => {
		if (id === 'model') {
			const unknown = values.split('|').filter(v => !modelIds.has(v));
			if (unknown.length) {
				anomalies.push({ kind: 'guard-unknown-value', panel, where, detail: `model has no ${unknown.map(v => `\`${v}\``).join(', ')}` });
			}
			return;
		}
		const input = byId.get(id);
		if (!input) {
			anomalies.push({ kind: 'guard-unknown-input', panel, where, detail: `unknown input \`${id}\`` });
			return;
		}
		if (input.kind === 'select') {
			const optionValues = new Set((input.options ?? []).map(o => o.value));
			const unknown = values.split('|').filter(v => !optionValues.has(v));
			if (unknown.length) {
				anomalies.push({ kind: 'guard-unknown-value', panel, where, detail: `select \`${id}\` has no option ${unknown.map(v => `\`${v}\``).join(', ')}` });
			}
		}
	};
	const checkWhen = (where: string, when: string | undefined) => {
		const m = when ? WHEN_RE.exec(when) : null;
		if (m) {
			checkCondition(where, m[1], m[3]);
		}
	};
	const checkCode = (where: string, code: string) => {
		for (const line of code.trim().split('\n')) {
			const m = GUARD_RE.exec(line.trimEnd());
			if (m) {
				checkCondition(`${where}: \`${line.trim()}\``, m[1], m[3]);
			}
		}
	};

	for (const input of inputs) {
		checkWhen(`input \`${input.id}\` when`, input.when);
		if (input.kind === 'select') {
			const options = input.options ?? [];
			if (input.default === undefined) {
				withoutDefault.push(`\`${panel}\` \`${input.id}\``);
			} else if (!options.some(o => o.value === input.default)) {
				anomalies.push({ kind: 'default-not-an-option', panel, where: `input \`${input.id}\``, detail: `default \`${input.default}\` is not among ${options.map(o => `\`${o.value}\``).join(', ')}` });
			}
			for (const o of options) {
				checkWhen(`input \`${input.id}\` option \`${o.value}\` when`, o.when);
			}
		}
	}
	for (const b of data.codeBranches ?? []) {
		checkCode(`codeBranch \`${b.model}\``, b.code);
	}
	for (const g of data.actionGroups ?? []) {
		for (const a of g.actions ?? []) {
			checkCode(`action ${g.id}/${a.id}`, a.code);
		}
	}
}

/** Greek letters and possible postfix transposes in every code template and input value of a panel. */
function checkCodeText(panel: string, data: PanelToml, anomalies: Anomaly[]): void {
	const sources: { where: string; code: string }[] = [
		...(data.codeBranches ?? []).map(b => ({ where: `codeBranch \`${b.model}\``, code: b.code })),
		...(data.actionGroups ?? []).flatMap(g => (g.actions ?? []).map(a => ({ where: `action ${g.id}/${a.id}`, code: a.code }))),
		...(data.inputs ?? []).flatMap(i => [
			{ where: `input \`${i.id}\` default`, code: i.default ?? '' },
			...(i.options ?? []).map(o => ({ where: `input \`${i.id}\` option`, code: o.value })),
		]),
	];
	for (const { where, code } of sources) {
		const lines = unguarded(code.trim()).split('\n');
		lines.forEach((line, i) => {
			if (GREEK_RE.test(line)) {
				anomalies.push({ kind: 'greek-letter', panel, where: `${where} line ${i + 1}`, detail: `\`${line.trim()}\`` });
			}
		});
		for (const t of findPostfixTransposes(lines.join('\n'))) {
			anomalies.push({ kind: 'possible-postfix-transpose', panel, where: `${where} line ${t.line}`, detail: `\`${t.text}\`${t.count > 1 ? ` (${t.count} matches)` : ''}` });
		}
	}
}

/** `DataFrames` or `Zygote` anywhere in the TOML file, with its line number. */
function checkBannedPackages(panel: string, content: string, anomalies: Anomaly[]): void {
	content.replace(/\r\n/g, '\n').split('\n').forEach((line, i) => {
		if (BANNED_RE.test(line)) {
			anomalies.push({ kind: 'dataframes-or-zygote', panel, where: `${panel}.toml:${i + 1}`, detail: `\`${line.trim()}\`` });
		}
	});
}

// -- Extraction

interface PanelCounts {
	readonly panel: string;
	readonly title: string;
	readonly models: number;
	readonly branches: number;
	readonly actions: number;
	readonly defaultSnippets: number;
	readonly actionSnippets: number;
	anomalies: number;
}

function commentLines(text: string): string {
	return text.split('\n').map(l => l ? `# ${l}` : '#').join('\n');
}

function extractPanel(panel: string, content: string, snippets: Snippet[], anomalies: Anomaly[], withoutDefault: string[]): PanelCounts {
	const data = parseToml(content) as PanelToml;
	const title = data.meta?.title ?? panel;
	const models = panelModels(data);
	const inputs = data.inputs ?? [];
	const groups = data.actionGroups ?? [];
	const branches = data.codeBranches ?? [];
	const packages = [...new Set([
		...(data.packages ?? []).map(p => p.name).filter((n): n is string => !!n),
		...(data.requires?.packages ?? []),
	])];
	const before = anomalies.length;

	const modelIds = new Set(models.map(m => m.id));
	for (const b of branches) {
		if (b.model !== '*' && !modelIds.has(b.model)) {
			anomalies.push({ kind: 'branch-without-model', panel, where: `codeBranch \`${b.model}\``, detail: `models are ${models.map(m => `\`${m.id}\``).join(', ')}` });
		}
	}
	checkInputs(panel, data, models, anomalies, withoutDefault);
	checkCodeText(panel, data, anomalies);
	checkBannedPackages(panel, content, anomalies);

	let defaultSnippets = 0;
	let actionSnippets = 0;
	const emptyActions = new Map<string, string[]>();
	const leftovers = new Map<string, Set<string>>();
	const noteLeftover = (where: string, what: string) => {
		const set = leftovers.get(where) ?? new Set<string>();
		set.add(what);
		leftovers.set(where, set);
	};

	for (const model of models) {
		const branch = branchFor(data, model.id);
		if (!branch) {
			anomalies.push({ kind: 'model-without-branch', panel, where: `model \`${model.id}\``, detail: 'no codeBranch and no `*` fallback' });
		}
		const state = initialInputs(inputs, model.id);
		const render = (where: string, code: string) => {
			state.unknownIds.clear();
			const out = state.render(code);
			for (const id of state.unknownIds) {
				noteLeftover(where, `\`{{${id}}}\` (no such input; renders as empty)`);
			}
			for (const line of out.split('\n')) {
				if (line.includes('{{')) {
					noteLeftover(where, `\`${line.trim()}\``);
				}
			}
			return out;
		};

		const blocks: string[] = [];
		if (branch) {
			const code = render(`codeBranch \`${branch.model}\``, branch.code);
			snippets.push({ panel, title, model: model.id, kind: 'default', group: null, actionId: null, label: model.label, desc: null, packages, code, lines: code.split('\n').length });
			blocks.push(code);
			defaultSnippets++;
		}
		for (const g of groups) {
			for (const a of g.actions ?? []) {
				const where = `action ${g.id}/${a.id}`;
				const code = render(where, a.code);
				if (!code.trim()) {
					const list = emptyActions.get(where) ?? [];
					list.push(model.id);
					emptyActions.set(where, list);
				}
				snippets.push({ panel, title, model: model.id, kind: 'action', group: g.id, actionId: a.id, label: a.label, desc: a.desc, packages, code, lines: code.split('\n').length });
				blocks.push(`# --- ${g.id} / ${a.label} (${a.id})\n${commentLines(a.desc ?? '')}\n${code}`);
				actionSnippets++;
			}
		}
		const dir = path.join(OUT_DIR, panel);
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(path.join(dir, `${model.id}.jl`), blocks.join('\n\n') + '\n', 'utf-8');
	}

	for (const [where, list] of emptyActions) {
		anomalies.push({ kind: 'empty-action', panel, where, detail: `empty for ${list.map(m => `\`${m}\``).join(', ')}` });
	}
	for (const [where, set] of leftovers) {
		anomalies.push({ kind: 'placeholder-left', panel, where, detail: [...set].join('; ') });
	}

	return {
		panel,
		title,
		models: models.length,
		branches: branches.length,
		actions: groups.reduce((n, g) => n + (g.actions?.length ?? 0), 0),
		defaultSnippets,
		actionSnippets,
		anomalies: anomalies.length - before,
	};
}

function escapeCell(s: string): string {
	return s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function buildSummary(counts: PanelCounts[], anomalies: Anomaly[], withoutDefault: string[]): string {
	const sum = (f: (c: PanelCounts) => number) => counts.reduce((n, c) => n + f(c), 0);
	const totals = {
		panels: counts.length,
		models: sum(c => c.models),
		branches: sum(c => c.branches),
		actions: sum(c => c.actions),
		defaultSnippets: sum(c => c.defaultSnippets),
		actionSnippets: sum(c => c.actionSnippets),
	};
	const kinds = Object.keys(ANOMALY_TITLES) as AnomalyKind[];
	const byKind = new Map(kinds.map(k => [k, anomalies.filter(a => a.kind === k)]));
	const check = (actual: number, expected: number) => actual === expected ? 'matches' : `**differs** (expected ${expected})`;
	const starPanels = counts.filter(c => c.branches > c.defaultSnippets || c.defaultSnippets > c.branches);

	const out: string[] = [];
	out.push('# Code examples: extraction summary', '');
	out.push('Generated by `node build/pollis/extractCodeExamples.ts`. Every panel TOML in `src/vs/workbench/contrib/model/browser/webviews/` is rendered for every model with every input at its default, reproducing the panel template (`inputRaw`, `holds`, `codeLine`, `applyInputsForModel`). Output: `.build/code-examples/<panel>/<model>.jl`, `index.json` (one record per snippet; `packages` is the panel\'s `[[packages]]` plus `[requires]`) and this file.', '');
	out.push('Out of scope: the `epi-ude` panel and the 7 gallery panels have no TOML file, so they are not extracted.', '');
	out.push('## Totals', '');
	out.push('| | Found | Check |', '|---|---:|---|');
	out.push(`| Panels (TOML files) | ${totals.panels} | ${check(totals.panels, EXPECTED.panels)} |`);
	out.push(`| Default code branches (\`[[codeBranches]]\`) | ${totals.branches} | ${check(totals.branches, EXPECTED.branches)} |`);
	out.push(`| Next Steps actions (\`[[actionGroups.actions]]\`) | ${totals.actions} | ${check(totals.actions, EXPECTED.actions)} |`);
	out.push(`| Model toggles | ${totals.models} | |`);
	out.push(`| Rendered default snippets (one per model) | ${totals.defaultSnippets} | |`);
	out.push(`| Rendered action snippets (every action for every model) | ${totals.actionSnippets} | |`);
	out.push(`| Snippets in \`index.json\` | ${totals.defaultSnippets + totals.actionSnippets} | |`, '');
	out.push('The declared counts are what the TOML files contain. The rendered counts differ from them by design: a panel renders its default code once per model, so a `*` fallback branch is rendered for every model it covers, and every action is rendered once per model (the panel shows each action with the current model\'s inputs).');
	if (starPanels.length) {
		out.push('', `Panels where branches and rendered default snippets differ: ${starPanels.map(c => `\`${c.panel}\` (${c.branches} branches, ${c.defaultSnippets} models rendered)`).join(', ')}.`);
	}
	out.push('');

	out.push('## Anomalies by kind', '');
	out.push('| Kind | Count |', '|---|---:|');
	for (const k of kinds) {
		out.push(`| ${ANOMALY_TITLES[k]} | ${byKind.get(k)!.length} |`);
	}
	out.push(`| **Total** | ${anomalies.length} |`, '');
	out.push('Greek letters and possible transposes are checked in the code templates (all lines, whatever the guards) and in input defaults and option values; placeholders and empty actions in the rendered output; `DataFrames`/`Zygote` in the whole TOML file. The transpose check skips strings, character literals, commands and comments, and is heuristic: its matches are possible, not certain.', '');

	out.push('## Per panel', '');
	out.push('| Panel | Title | Models | Branches | Actions | Snippets | Anomalies |', '|---|---|---:|---:|---:|---:|---:|');
	for (const c of counts) {
		out.push(`| \`${c.panel}\` | ${escapeCell(c.title)} | ${c.models} | ${c.branches} | ${c.actions} | ${c.defaultSnippets + c.actionSnippets} | ${c.anomalies} |`);
	}
	out.push('');

	out.push('## Anomalies', '');
	for (const k of kinds) {
		const list = byKind.get(k)!;
		out.push(`### ${ANOMALY_TITLES[k]} (${list.length})`, '');
		if (!list.length) {
			out.push('None.', '');
			continue;
		}
		for (const a of list) {
			out.push(`- \`${a.panel}\`, ${a.where}: ${escapeCell(a.detail)}`);
		}
		out.push('');
	}
	if (withoutDefault.length) {
		out.push('### Not an anomaly: selects without a default', '');
		out.push(`These start on the first option available for the model, as \`IModelInput.default\` documents: ${withoutDefault.join(', ')}.`, '');
	}
	return out.join('\n');
}

function main(): void {
	fs.rmSync(OUT_DIR, { recursive: true, force: true });
	fs.mkdirSync(OUT_DIR, { recursive: true });

	const files = fs.readdirSync(WEBVIEWS_DIR).filter(f => f.endsWith('.toml')).sort();
	const snippets: Snippet[] = [];
	const anomalies: Anomaly[] = [];
	const counts: PanelCounts[] = [];
	const withoutDefault: string[] = [];
	for (const file of files) {
		const panel = file.slice(0, -'.toml'.length);
		const content = fs.readFileSync(path.join(WEBVIEWS_DIR, file), 'utf-8');
		counts.push(extractPanel(panel, content, snippets, anomalies, withoutDefault));
	}

	fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(snippets, null, '\t') + '\n', 'utf-8');
	fs.writeFileSync(path.join(OUT_DIR, 'SUMMARY.md'), buildSummary(counts, anomalies, withoutDefault), 'utf-8');

	const branches = counts.reduce((n, c) => n + c.branches, 0);
	const actions = counts.reduce((n, c) => n + c.actions, 0);
	console.log(`${counts.length} panels, ${branches} code branches, ${actions} actions -> ${snippets.length} snippets, ${anomalies.length} anomalies`);
	console.log(`Written to ${path.relative(ROOT, OUT_DIR)}/ (index.json, SUMMARY.md, <panel>/<model>.jl)`);
}

main();
