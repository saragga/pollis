/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../nls.js';
import { compareCss } from '../../../compose/browser/compareShared.js';
import { stepCodeBoxHtml, stepCodeCss, stepCodeJs, stepSetupJs } from './scaffoldSteps.js';
import { buildWebviewHtml, nextStepIcon, WebviewParts } from './webviewScaffold.js';
import { IModelInput, IModelMatrix, IModelRow, IModelStep, IModelToggle, IScaffoldPanelData } from '../common/model.types.js';

/**
 * The parts of a scaffold panel that are not in its TOML data: at least the title and the
 * default model. Any other {@link WebviewParts} field given here replaces the generated one.
 */
export type ScaffoldPanelOptions = Partial<WebviewParts> & { readonly title: string; readonly defaultModel: string };

/** The five default Next Steps groups, in their standard order. */
const STANDARD_GROUPS = ['visualise', 'diagnose', 'predict', 'compare', 'interpret'];
/** The optional action group of queries, last among the groups: Query in SQL, with the database codicon. */
const SQL_GROUP = 'sql';

/**
 * Escape a string for safe embedding in a JS single-quoted string literal inside a page's `<script>`: `</` becomes
 * `<\/` and `<!--` becomes `<\!--`, so that code holding `</script>` or `<!--` cannot end or derail the script element.
 */
function jsEscape(s: string): string {
	return s.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\r?\n/g, '\\n').replace(/<\//g, '<\\/').replace(/<!--/g, '<\\!--');
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
	// A Key Point without a detail is a sentence of its own: plain text, no dash.
	return '\n' + data.bullets.map(b => b.detail?.trim()
		? `\t\t\t\t\t<li><strong>${htmlEsc(b.text)}</strong> &#8212; ${b.detail}</li>`
		: `\t\t\t\t\t<li>${htmlEsc(b.text)}</li>`).join('\n') + '\n\t\t\t\t';
}

function buildDecisionRowsHtml(data: IScaffoldPanelData): string {
	if (!data.decisionRows?.length) { return ''; }
	return '\n' + data.decisionRows.map(r => `\t\t\t\t\t<tr><td>${htmlEsc(r.task)}</td><td>${htmlEsc(r.context)}</td><td>${htmlEsc(r.purpose)}</td></tr>`).join('\n') + '\n\t\t\t\t';
}

function buildTogglesHtml(models: IModelToggle[], defaultModel: string): string {
	return models.map(m => `\t\t\t\t<button class="toggle-btn${m.id === defaultModel ? ' active' : ''}" data-model="${m.id}">${htmlEsc(m.label)}</button>`).join('\n');
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
			// The group sql holds queries of Pollis's databases, which the panel shows with DuckDB REPL in place of Julia REPL
			const language = g.id === SQL_GROUP ? `, language: 'sql'` : '';
			return `\t\t\t{ id: '${jsEscape(a.id)}', label: '${jsEscape(a.label)}', desc: '${jsEscape(a.desc)}'${models}${when}${perModel}${language}, code: function() { return ${codeLinesJs(a.code)}; } }`;
		}).join(',\n');
		return `\t\tvar ${actionsVar(g.id)} = [\n${actions}\n\t\t];`;
	}).join('\n');
}

/** Custom Next Steps buttons, unless a Classical panel's groups are exactly the five standard ones, which the scaffold draws. */
function buildNextSteps(panelId: string, data: IScaffoldPanelData): Pick<WebviewParts, 'nextStepsHtml' | 'nextStepsWiringJs'> {
	const groups = data.actionGroups ?? [];
	if (data.style !== 'timeArrow' && groups.map(g => g.id).join() === STANDARD_GROUPS.join()) {
		return {};
	}
	const btnId = (id: string) => `btn-${panelId}-${id}`;
	// A group none of whose actions the current tab and inputs offer is hidden, as a group made for one tab (e.g. Advanced Methods) would open empty on the others
	const groupButtons = groups.map(g => `['${btnId(g.id)}', ${actionsVar(g.id)}]`).join(', ');
	return {
		nextStepsHtml: groups.map(g => `\t\t\t\t\t<li><button class="list-btn panel-toggle" id="${btnId(g.id)}">${nextStepIcon(g.id)}${htmlEsc(g.label)}</button></li>`).join('\n'),
		nextStepsWiringJs: groups.map(g => `\t\tdocument.getElementById('${btnId(g.id)}').addEventListener('click', function() { showRightPanel(${actionsVar(g.id)}, '${jsEscape(g.label)}', '${btnId(g.id)}'); });`).join('\n')
			+ `\n\t\tfunction refreshStepGroups() { [${groupButtons}].forEach(function(g) { var none = !g[1].some(actionShown); document.getElementById(g[0]).parentElement.hidden = none; if (none && currentPanelId === g[0]) { hideRightPanel(); } }); }\n\t\trefreshStepGroups();`,
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
		? `<select id="in-${input.id}" class="form-input">\n${(input.options ?? []).map(o => `\t\t\t\t\t<option value="${htmlEsc(o.value)}"${modelsAttr(o.models, o.when)}${o.disabled ? ' data-disabled disabled' : ''}${o.value === input.default && !o.disabled ? ' selected' : ''}>${htmlEsc(o.label)}</option>`).join('\n')}\n\t\t\t\t</select>`
		: `<input type="text" id="in-${input.id}" class="form-input" spellcheck="false" placeholder="${htmlEsc(input.default ?? '')}" data-default="${htmlEsc(input.default ?? '')}">`;
	// A symbol (or company) input with Alert Me... beside it, which opens Add Alert with its value
	const alertTitle = input.alertMe === 'filings'
		? 'Open Add Alert with this company: Pollis looks at its filings at the SEC while it is open, and tells you when a new one of the forms you choose is published'
		: input.alertMe === 'quote'
		? 'Open Add Alert with this symbol: Pollis looks up its quote while it is open, and warns when it crosses a level you set'
		: 'Open Add Alert with this series: Pollis looks it up every hour while it is open, and tells you when a new value is published';
	const alertValue = input.alertValue ? ` data-value="${htmlEsc(input.alertValue)}"` : '';
	// A local model input with Choose... beside it, which opens the picker of models
	const modelTitle = input.modelFile === 'embedding'
		? 'Choose an embedding model on this computer or from Hugging Face, or a GGUF file'
		: 'Choose a chat model on this computer or from Hugging Face, or a GGUF file';
	const fieldWithAction = input.alertMe && !input.kind
		? `<div class="input-with-action">${field}<button class="input-action-btn alert-me-btn" data-input="${input.id}" data-alert="${input.alertMe}"${alertValue} title="${alertTitle}">Alert Me...</button></div>`
		: input.modelFile && !input.kind
		? `<div class="input-with-action">${field}<button class="input-action-btn choose-model-btn" data-input="${input.id}" data-model-kind="${input.modelFile}" title="${modelTitle}">Choose...</button></div>`
		: input.folder && !input.kind && input.chooseFolder !== false
		? `<div class="input-with-action">${field}<button class="input-action-btn choose-folder-btn" data-input="${input.id}" title="Choose the folder">Choose...</button></div>`
		: field;
	return `\t\t\t<div class="form-group scaffold-input"${modelsAttr(input.models, input.when)}>
				<label class="form-label form-label-with-tooltip" for="in-${input.id}">${htmlEsc(input.label)}${tooltip}
				</label>
				${fieldWithAction}
			</div>`;
}

function buildInputsHtml(inputs: readonly IModelInput[]): string {
	const rows: IModelInput[][] = [];
	for (const input of inputs.filter(i => i.kind !== 'tabs')) {
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

/** The CSS of a Time Arrow panel drawn from its TOML, beside the CSS the Time Arrow pages share. */
const TIME_ARROW_CSS = `${compareCss}
		table.matrix { border-collapse: collapse; margin: 4px 0 18px 0; font-size: 12px; }
		table.matrix th, table.matrix td { text-align: left; vertical-align: top; padding: 4px 12px 4px 0; border-bottom: 1px solid var(--vscode-widget-border); }
		table.matrix th { font-weight: 600; color: var(--vscode-descriptionForeground); }
		.step-pane h4 { font-size: 13px; font-weight: 600; margin: 14px 0 4px 0; }
		.step-pane ul { margin: 0; padding-left: 20px; }
		.step-pane li { margin: 3px 0; line-height: 1.45; }
		p.dataset { margin: 4px 0; }
		p.dataset .label { font-weight: 600; }
		button.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; text-align: left; }
		button.link:hover { text-decoration: underline; }
`;

/** The script of a Time Arrow panel drawn from its TOML: a step's dataset link, which the scaffold's handler answers. */
const TIME_ARROW_JS = `
	document.addEventListener('click', event => {
		const link = event.target.closest('button[data-dataset]');
		if (link) {
			vscode.postMessage({ command: 'openDataset', id: link.dataset.dataset });
		}
	});
`;

/** The table between the introduction and the steps, or nothing for a table without columns. */
function buildMatrixHtml(matrix: IModelMatrix | undefined): string {
	if (!matrix?.columns.length) {
		return '';
	}
	const head = matrix.columns.map(column => `<th>${htmlEsc(column)}</th>`).join('');
	const body = matrix.rows.map(cells => `<tr>${cells.map(cell => `<td>${htmlEsc(cell)}</td>`).join('')}</tr>`).join('\n');
	return `<table class="matrix"><thead><tr>${head}</tr></thead><tbody>\n${body}\n</tbody></table>`;
}

/** The body of step `number`: its text, its dataset, its sections, its inputs, and its code and actions. */
function buildStepBodyHtml(step: IModelStep, number: number): string {
	const parts: string[] = [];
	if (step.intro) {
		parts.push(`<p class="hint">${htmlEsc(step.intro)}</p>`);
	}
	if (step.dataset || step.datasetText) {
		const name = htmlEsc(step.datasetText || step.dataset);
		const link = step.dataset
			? `<button class="link" data-dataset="${htmlEsc(step.dataset)}" title="${htmlEsc(localize('scaffold.timeArrow.openDataset', "Open in Manage Challenge Datasets"))}">${name}</button>`
			: name;
		parts.push(`<p class="dataset"><span class="label">${htmlEsc(localize('scaffold.timeArrow.dataset', "Dataset:"))}</span> ${link}</p>`);
	}
	for (const section of step.sections) {
		parts.push(`<h4>${htmlEsc(section.heading)}</h4>`);
		if (section.text) {
			parts.push(`<p>${htmlEsc(section.text)}</p>`);
		}
		if (section.items.length) {
			parts.push(`<ul>${section.items.map(item => `<li>${htmlEsc(item)}</li>`).join('')}</ul>`);
		}
	}
	if (step.inputs.length) {
		parts.push(`<div class="scaffold-inputs">\n${buildInputsHtml(step.inputs)}\n</div>`);
	}
	if (step.code.trim()) {
		parts.push(stepCodeBoxHtml(htmlEsc(stepKey(step)), htmlEsc(localize('scaffold.timeArrow.code', "Code of Step {0}", number)), ''));
	}
	for (const action of step.actions) {
		parts.push(stepCodeBoxHtml(htmlEsc(action.id), htmlEsc(action.label), htmlEsc(action.desc)));
	}
	return parts.join('\n');
}

/** The key of the code of a step, beside those of the actions, which are their ids. */
function stepKey(step: IModelStep): string {
	return `step-${step.id}`;
}

/** `STEP_CODE`, the code boxes of the steps as `stepCodeJs` reads them. */
function buildStepCodeJs(steps: readonly IModelStep[]): string {
	const entries = steps.flatMap((step, index) => {
		const entry = (key: string, own: boolean, name: string, code: string, when = '') =>
			`\t\t\t{ key: '${jsEscape(key)}', step: ${index + 1}, own: ${own}, name: '${jsEscape(name)}', when: '${jsEscape(when)}', code: function() { return ${codeLinesJs(code)}; } }`;
		return [
			...(step.code.trim() ? [entry(stepKey(step), true, `Step ${index + 1}`, step.code)] : []),
			...step.actions.map(action => entry(action.id, false, action.label, action.code, action.when)),
		];
	});
	return `\t\tvar STEP_CODE = [\n${entries.join(',\n')}\n\t\t];`;
}

/**
 * Build the HTML of a Time Arrow panel from its TOML data: introduction, table, numbered steps, and Next Steps when
 * it has action groups. The script of the steps is there only when they have inputs or code, or there are Next Steps.
 */
function buildTimeArrowHtml(panelId: string, data: IScaffoldPanelData, title: string): string {
	const steps = data.steps ?? [];
	const hasNextSteps = !!data.actionGroups?.length;
	const hasCode = hasNextSteps || steps.some(step => step.inputs.length || step.code.trim() || step.actions.length);
	return buildWebviewHtml({
		title: htmlEsc(title),
		omitPoweredBy: !data.packages.length,
		...(hasNextSteps ? { actionsJs: buildActionsJs(data), ...buildNextSteps(panelId, data) } : { omitNextSteps: true }),
		introHtml: htmlEsc(data.intro ?? ''),
		beforeStepsHtml: buildMatrixHtml(data.matrix),
		steps: steps.map((step, index) => ({ id: `step-${index + 1}`, title: htmlEsc(step.title), bodyHtml: buildStepBodyHtml(step, index + 1) })),
		extraCss: hasCode ? TIME_ARROW_CSS + stepCodeCss : TIME_ARROW_CSS,
		...(hasCode ? {
			stepSetupJs,
			inputsChangedJs: '\t\t\trefreshStepCode();\n',
			extraJs: `${buildStepCodeJs(steps)}\n${stepCodeJs()}`,
		} : {}),
		pageScriptJs: TIME_ARROW_JS,
	});
}

const MINIMAL_CSS = `${compareCss}
		.minimal-search { width: 100%; max-width: 420px; margin: 4px 0 8px 0; padding: 4px 6px; font: inherit; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, var(--vscode-widget-border)); border-radius: 2px; }
		.minimal-search:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
		table.minimal-table { border-collapse: collapse; width: 100%; margin: 4px 0 18px 0; font-size: 13px; }
		table.minimal-table th, table.minimal-table td { text-align: left; vertical-align: top; padding: 6px 12px 6px 0; border-bottom: 1px solid var(--vscode-widget-border); }
		table.minimal-table th { font-size: 12px; font-weight: 600; color: var(--vscode-descriptionForeground); }
		.row-title { font: inherit; font-weight: 600; color: var(--vscode-foreground); background: none; border: none; padding: 0; text-align: left; }
		button.row-title { cursor: pointer; }
		button.row-title:hover { text-decoration: underline; }
		.row-sub { color: var(--vscode-descriptionForeground); margin: 2px 0 0 0; }
		.row-desc { color: var(--vscode-descriptionForeground); margin: 4px 0 0 0; line-height: 1.4; max-width: 720px; }
		tr.row-details > td { padding: 0 0 12px 0; }
		button.link { color: var(--vscode-textLink-foreground); cursor: pointer; background: none; border: none; padding: 0; font: inherit; text-align: left; }
		button.link:hover { text-decoration: underline; }
`;

/** The script of a Minimal panel's table: the search, a row's code opened under it, and the links of its values. */
const MINIMAL_JS = `
	document.addEventListener('click', event => {
		const link = event.target.closest('button[data-url]');
		if (link) {
			vscode.postMessage({ command: 'openUrl', url: link.dataset.url });
			return;
		}
		const title = event.target.closest('button[data-row]');
		const details = title && document.querySelector('tr.row-details[data-details="' + CSS.escape(title.dataset.row) + '"]');
		if (details) {
			details.hidden = !details.hidden;
			title.setAttribute('aria-expanded', String(!details.hidden));
		}
	});
	const minimalSearch = document.querySelector('.minimal-search');
	if (minimalSearch) {
		minimalSearch.addEventListener('input', () => {
			const query = minimalSearch.value.trim().toLowerCase();
			let shown = 0;
			document.querySelectorAll('tr.row').forEach(row => {
				const match = !query || row.dataset.search.includes(query);
				row.hidden = !match;
				shown += match ? 1 : 0;
				const details = row.nextElementSibling;
				if (!match && details && details.classList.contains('row-details')) {
					details.hidden = true;
					const title = row.querySelector('button[data-row]');
					if (title) { title.setAttribute('aria-expanded', 'false'); }
				}
			});
			document.querySelector('.minimal-none').hidden = shown > 0;
		});
	}
`;

/** The key of a row's code box, apart from those of steps and actions. */
function rowKey(row: IModelRow): string {
	return `row-${row.id}`;
}

/**
 * The table of a Minimal panel: a search box, then a row per `[[rows]]`, its title (which opens its code under it, in
 * a code box as that of a step), the line under it and its description, and its values in the columns.
 */
function buildRowsHtml(data: IScaffoldPanelData): string {
	const rows = data.rows ?? [];
	if (!rows.length) {
		return '';
	}
	const columns = data.columns ?? [];
	const search = htmlEsc(localize('scaffold.minimal.search', "Search"));
	const head = `<tr><th>${htmlEsc(data.rowTitle || localize('scaffold.minimal.name', "Name"))}</th>${columns.map(column => `<th>${htmlEsc(column.label)}</th>`).join('')}</tr>`;
	const body = rows.map(row => {
		const searched = [row.title, row.subtitle, row.description, ...row.cells.map(cell => cell.text)].join(' ').toLowerCase();
		const title = row.code
			? `<button class="row-title" data-row="${htmlEsc(row.id)}" aria-expanded="false">${htmlEsc(row.title)}</button>`
			: `<span class="row-title">${htmlEsc(row.title)}</span>`;
		const name = `<td>${title}${row.subtitle ? `<div class="row-sub">${htmlEsc(row.subtitle)}</div>` : ''}${row.description ? `<p class="row-desc">${htmlEsc(row.description)}</p>` : ''}</td>`;
		const cells = row.cells.map(cell => `<td>${cell.url ? `<button class="link" data-url="${htmlEsc(cell.url)}">${htmlEsc(cell.text)}</button>` : htmlEsc(cell.text)}</td>`).join('');
		const details = row.code
			? `\n\t\t\t<tr class="row-details" data-details="${htmlEsc(row.id)}" hidden><td colspan="${columns.length + 1}">${stepCodeBoxHtml(htmlEsc(rowKey(row)), htmlEsc(localize('scaffold.minimal.code', "Code")), '')}</td></tr>`
			: '';
		return `\t\t\t<tr class="row" data-search="${htmlEsc(searched)}">${name}${cells}</tr>${details}`;
	});
	return `<input class="minimal-search" type="search" placeholder="${search}" aria-label="${search}">
		<table class="minimal-table">
			<thead>${head}</thead>
			<tbody>
${body.join('\n')}
			</tbody>
		</table>
		<p class="hint minimal-none" hidden>${htmlEsc(localize('scaffold.minimal.noMatch', "Nothing matches the search."))}</p>`;
}

/**
 * Build the HTML of a Minimal panel from its TOML data: introduction and table, then Next Steps when it has action
 * groups and Learn More when it has wikis, notebooks, references or questions. A row's code box sends its code alone.
 */
function buildMinimalHtml(panelId: string, data: IScaffoldPanelData, title: string): string {
	const rows = (data.rows ?? []).filter(row => row.code);
	const hasNextSteps = !!data.actionGroups?.length;
	const hasLearnMore = !!(data.wikis.length || data.notebooks.length || data.references.length || data.faq?.length);
	const hasCode = hasNextSteps || rows.length > 0;
	const entries = rows.map(row => `\t\t\t{ key: '${jsEscape(rowKey(row))}', step: 0, own: false, name: '${jsEscape(row.title)}', when: '', code: function() { return ${codeLinesJs(row.code)}; } }`);
	return buildWebviewHtml({
		title: htmlEsc(title),
		omitPoweredBy: !data.packages.length,
		...(hasNextSteps ? { actionsJs: buildActionsJs(data), ...buildNextSteps(panelId, data) } : { omitNextSteps: true }),
		omitLearnMore: !hasLearnMore,
		introHtml: htmlEsc(data.intro ?? ''),
		bodyHtml: buildRowsHtml(data),
		extraCss: hasCode ? MINIMAL_CSS + stepCodeCss : MINIMAL_CSS,
		...(hasCode ? {
			stepSetupJs,
			inputsChangedJs: '\t\t\trefreshStepCode();\n',
			extraJs: `\t\tvar STEP_CODE = [\n${entries.join(',\n')}\n\t\t];\n${stepCodeJs()}`,
		} : {}),
		pageScriptJs: MINIMAL_JS,
	});
}

/**
 * Build the HTML of a panel on the shared scaffold from its TOML data, in the style it names. Classical, the default:
 * key points, decision table, model toggles, parameter inputs, declarative code and Next Steps. Time Arrow
 * (`style = "timeArrow"`): introduction, table, numbered steps with their inputs and code, and Next Steps. Minimal
 * (`style = "minimal"`): introduction and a table of rows, each with its code, Next Steps and Learn More only when the
 * TOML has them. Time Arrow and Minimal use only the title of `options`.
 */
export function buildScaffoldHtml(panelId: string, data: IScaffoldPanelData, options: ScaffoldPanelOptions): string {
	if (data.style === 'timeArrow') {
		return buildTimeArrowHtml(panelId, data, options.title);
	}
	if (data.style === 'minimal') {
		return buildMinimalHtml(panelId, data, options.title);
	}
	const models = panelModels(data);
	return buildWebviewHtml({
		modelsLiteral: `[${models.map(m => `'${m.id}'`).join(', ')}]`,
		togglesJs: buildTogglesHtml(models, options.defaultModel),
		bullets: buildBulletsHtml(data),
		decisionRows: buildDecisionRowsHtml(data),
		codeBranchesJs: buildCodeBranchesJs(data),
		actionsJs: buildActionsJs(data),
		inputsHtml: buildInputsHtml(data.inputs ?? []),
		subtabsHtml: buildSubtabsHtml(data),
		...buildNextSteps(panelId, data),
		...options,
	});
}
