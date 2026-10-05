/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildWebviewHtml, nextStepIcon, WebviewParts } from './webviewScaffold.js';
import { IModelInput, IModelToggle, IScaffoldPanelData } from '../common/model.types.js';

/**
 * The parts of a scaffold panel that are not in its TOML data: at least the title and the
 * default model. Any other {@link WebviewParts} field given here replaces the generated one.
 */
export type ScaffoldPanelOptions = Pick<WebviewParts, 'title' | 'defaultModel'> & Partial<WebviewParts>;

/** The five default Next Steps groups, in their standard order. */
const STANDARD_GROUPS = ['visualise', 'diagnose', 'predict', 'compare', 'interpret'];

/** Escape a string for safe embedding in a JS single-quoted string literal. */
function jsEscape(s: string): string {
	return s.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\r?\n/g, '\\n');
}

/** Escape HTML special characters. */
function htmlEsc(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function actionsVar(groupId: string): string {
	return groupId.toUpperCase().replace(/-/g, '_') + '_ACTIONS';
}

/** Declarative code as a JS expression: one `codeLine('...')` call per source line. */
function codeLinesJs(code: string): string {
	return code.trim().split('\n').map(l => `codeLine('${jsEscape(l.trimEnd())}')`).join(' + ');
}

function panelModels(data: IScaffoldPanelData): IModelToggle[] {
	if (data.models?.length) {
		return data.models;
	}
	return (data.codeBranches ?? []).filter(b => b.model !== '*').map(b => ({ id: b.model, label: b.model.charAt(0).toUpperCase() + b.model.slice(1) }));
}

function buildBulletsHtml(data: IScaffoldPanelData): string {
	if (!data.bullets?.length) { return ''; }
	return '\n' + data.bullets.map(b => `\t\t\t\t\t<li><strong>${htmlEsc(b.text)}</strong> &#8212; ${b.detail}</li>`).join('\n') + '\n\t\t\t\t';
}

function buildDecisionRowsHtml(data: IScaffoldPanelData): string {
	if (!data.decisionRows?.length) { return ''; }
	return '\n' + data.decisionRows.map(r => `\t\t\t\t\t<tr><td>${htmlEsc(r.task)}</td><td>${htmlEsc(r.context)}</td><td>${htmlEsc(r.purpose)}</td></tr>`).join('\n') + '\n\t\t\t\t';
}

function buildTogglesHtml(models: IModelToggle[], defaultModel: string): string {
	return models.map(m => `\t\t\t\t<button class="toggle-btn${m.id === defaultModel ? ' active' : ''}" data-model="${m.id}">${htmlEsc(m.label)}</button>`).join('\n');
}

function buildMiniChartsJs(data: IScaffoldPanelData, models: IModelToggle[]): string {
	// model ids may contain '-', which is not valid in a JS function name
	const fnName = (id: string) => `mini_${id.replace(/[^A-Za-z0-9_]/g, '_')}`;
	const charts = data.miniCharts ?? [];
	if (!charts.length) { return 'var MINI_CHARTS = []; var MINI_LABELS = [];'; }
	const fns = charts.map(c => {
		const body = c.svg.trim().split('\n').map(l => '\t\t\t\t\t' + l.trim()).join('\n');
		return `\t\t\t\tfunction ${fnName(c.model)}() {\n${body}\n\t\t\t\t}`;
	}).join('\n');
	const miniArr = models.map(m => fnName(m.id)).join(', ');
	const labelArr = models.map(m => `'${jsEscape(m.label)}'`).join(', ');
	return `${fns}\n\t\t\t\tvar MINI_CHARTS = [${miniArr}];\n\t\t\t\tvar MINI_LABELS = [${labelArr}];`;
}

function buildCodeBranchesJs(data: IScaffoldPanelData): string {
	const branches = data.codeBranches ?? [];
	const specific = branches.filter(b => b.model !== '*');
	const fallback = branches.find(b => b.model === '*');
	const cases = specific.map((b, i) => `\t\t\t${i === 0 ? '' : 'else '}if (currentModel === '${b.model}') { c += ${codeLinesJs(b.code)}; }`);
	if (fallback) {
		cases.push(specific.length ? `\t\t\telse { c += ${codeLinesJs(fallback.code)}; }` : `\t\t\tc += ${codeLinesJs(fallback.code)};`);
	}
	return cases.join('\n');
}

function buildActionsJs(data: IScaffoldPanelData): string {
	return (data.actionGroups ?? []).map(g => {
		const actions = g.actions.map(a => {
			const models = a.models?.length ? `, models: [${a.models.map(m => `'${jsEscape(m)}'`).join(', ')}]` : '';
			const when = a.when ? `, when: '${jsEscape(a.when)}'` : '';
			// Code that depends on the tab is not offered in a tab the user added
			const perModel = /\{\{\??!?model\b/.test(a.code) ? ', perModel: true' : '';
			return `\t\t\t{ id: '${jsEscape(a.id)}', label: '${jsEscape(a.label)}', desc: '${jsEscape(a.desc)}'${models}${when}${perModel}, code: function() { return ${codeLinesJs(a.code)}; } }`;
		}).join(',\n');
		return `\t\tvar ${actionsVar(g.id)} = [\n${actions}\n\t\t];`;
	}).join('\n');
}

/** Custom Next Steps buttons, unless the groups are exactly the five standard ones (which keep their icons). */
function buildNextSteps(panelId: string, data: IScaffoldPanelData): Pick<WebviewParts, 'nextStepsHtml' | 'nextStepsWiringJs'> {
	const groups = data.actionGroups ?? [];
	if (groups.map(g => g.id).join() === STANDARD_GROUPS.join()) {
		return {};
	}
	const btnId = (id: string) => `btn-${panelId}-${id}`;
	return {
		nextStepsHtml: groups.map(g => `\t\t\t\t\t<li><button class="list-btn panel-toggle" id="${btnId(g.id)}">${nextStepIcon(g.id)}${htmlEsc(g.label)}</button></li>`).join('\n'),
		nextStepsWiringJs: groups.map(g => `\t\tdocument.getElementById('${btnId(g.id)}').addEventListener('click', function() { showRightPanel(${actionsVar(g.id)}, '${jsEscape(g.label)}', '${btnId(g.id)}'); });`).join('\n'),
	};
}

function modelsAttr(models: string[] | undefined, when?: string): string {
	return (models?.length ? ` data-models="${htmlEsc(models.join(' '))}"` : '') + (when ? ` data-when="${htmlEsc(when)}"` : '');
}

function buildInputHtml(input: IModelInput): string {
	const tooltip = input.tooltip ? `\n\t\t\t\t\t<span class="tooltip-icon">?</span>\n\t\t\t\t\t<span class="tooltip-text">${htmlEsc(input.tooltip)}</span>` : '';
	const field = input.kind === 'textarea'
		? `<textarea id="in-${input.id}" class="form-input multiline" rows="${(input.default ?? '').split('\n').length + 1}" spellcheck="false" data-default="${htmlEsc(input.default ?? '')}">${htmlEsc(input.default ?? '')}</textarea>`
		: input.kind === 'select'
		? `<select id="in-${input.id}" class="form-input">\n${(input.options ?? []).map(o => `\t\t\t\t\t<option value="${htmlEsc(o.value)}"${modelsAttr(o.models, o.when)}${o.value === input.default ? ' selected' : ''}>${htmlEsc(o.label)}</option>`).join('\n')}\n\t\t\t\t</select>`
		: `<input type="text" id="in-${input.id}" class="form-input" spellcheck="false" placeholder="${htmlEsc(input.default ?? '')}" data-default="${htmlEsc(input.default ?? '')}">`;
	return `\t\t\t<div class="form-group scaffold-input"${modelsAttr(input.models, input.when)}>
				<label class="form-label form-label-with-tooltip" for="in-${input.id}">${htmlEsc(input.label)}${tooltip}
				</label>
				${field}
			</div>`;
}

function buildInputsHtml(data: IScaffoldPanelData): string {
	const rows: IModelInput[][] = [];
	for (const input of (data.inputs ?? []).filter(i => i.kind !== 'tabs')) {
		if (!rows.length || input.newRow) {
			rows.push([]);
		}
		rows[rows.length - 1].push(input);
	}
	return rows.map(r => `\t\t<div class="form-row">\n${r.map(buildInputHtml).join('\n')}\n\t\t</div>`).join('\n');
}

/** The `tabs` inputs: a hidden select (read like any other) driven by a row of tabs above the code box. */
function buildSubtabsHtml(data: IScaffoldPanelData): string {
	return (data.inputs ?? []).filter(i => i.kind === 'tabs').map(input => {
		const options = (input.options ?? []).map(o => `\t\t\t\t<option value="${htmlEsc(o.value)}"${modelsAttr(o.models, o.when)}${o.value === input.default ? ' selected' : ''}>${htmlEsc(o.label)}</option>`).join('\n');
		const buttons = (input.options ?? []).map(o => `\t\t\t\t<button class="subtab-btn" data-value="${htmlEsc(o.value)}">${htmlEsc(o.label)}</button>`).join('\n');
		return `\t\t<div class="scaffold-input scaffold-subtabs"${modelsAttr(input.models, input.when)} aria-label="${htmlEsc(input.label)}">
			<select id="in-${input.id}" hidden>
${options}
			</select>
${buttons}
		</div>`;
	}).join('\n');
}

/**
 * Build the HTML of a panel on the shared scaffold from its TOML data: key points, decision
 * table, model toggles, parameter inputs, mini-chart gallery, declarative code and Next Steps.
 */
export function buildScaffoldHtml(panelId: string, data: IScaffoldPanelData, options: ScaffoldPanelOptions): string {
	const models = panelModels(data);
	return buildWebviewHtml({
		modelsLiteral: `[${models.map(m => `'${m.id}'`).join(', ')}]`,
		chartW: 54,
		togglesJs: buildTogglesHtml(models, options.defaultModel),
		bullets: buildBulletsHtml(data),
		decisionRows: buildDecisionRowsHtml(data),
		miniChartsJs: buildMiniChartsJs(data, models),
		codeBranchesJs: buildCodeBranchesJs(data),
		actionsJs: buildActionsJs(data),
		inputsHtml: buildInputsHtml(data),
		subtabsHtml: buildSubtabsHtml(data),
		...buildNextSteps(panelId, data),
		omitIllustration: !data.miniCharts?.length && !options.illustrationOverrideJs,
		...options,
	});
}
