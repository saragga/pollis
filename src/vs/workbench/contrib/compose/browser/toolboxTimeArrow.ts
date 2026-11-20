/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// A panel of a toolbox in the Time Arrow style, drawn from its TOML alone, as a toolbox has no code. Its [meta] says
// style = "timeArrow" and gives the introduction (intro); [matrix] is a table shown between the introduction and the
// steps (columns, and [[matrix.rows]] with their cells); each [[steps]] is a numbered pane with a title, an optional
// text (intro), an optional dataset of Manage Challenge Datasets (dataset, its id there, and datasetText, how the
// step names it), and [[steps.sections]], each a heading with a text or a list of items. Powered by, Learn More and
// the references come from [[packages]], [[wikis]] and [[references]], as for any panel.

import { escape } from '../../../../base/common/strings.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { TomlValue } from '../../model/browser/common/tomlPanelData.js';
import { buildWebviewHtml } from '../../model/browser/webviews/webviewScaffold.js';
import { compareCss } from './compareShared.js';
import { FORECASTING_CATALOGUE_COMMAND_ID } from './forecastingActive.js';

/** The style a toolbox panel's [meta] names to be drawn in the Time Arrow style. */
const TIME_ARROW = 'timeArrow';

function table(value: unknown): TomlValue {
	return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as TomlValue : {};
}

function tables(value: unknown): TomlValue[] {
	return Array.isArray(value) ? value.map(table) : [];
}

function text(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

function texts(value: unknown): string[] {
	return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/** Whether a toolbox panel's TOML is of the Time Arrow style. */
export function isTimeArrowPanel(parsed: TomlValue): boolean {
	return table(parsed.meta).style === TIME_ARROW;
}

/** The table between the introduction and the steps, or nothing when the TOML has no [matrix]. */
function matrixHtml(parsed: TomlValue): string {
	const matrix = table(parsed.matrix);
	const columns = texts(matrix.columns);
	if (!columns.length) {
		return '';
	}
	const head = columns.map(column => `<th>${escape(column)}</th>`).join('');
	const body = tables(matrix.rows).map(row => `<tr>${texts(row.cells).map(cell => `<td>${escape(cell)}</td>`).join('')}</tr>`).join('\n');
	return `<table class="matrix"><thead><tr>${head}</tr></thead><tbody>\n${body}\n</tbody></table>`;
}

/** The body of a step: its text, its dataset, and its sections. */
function stepBodyHtml(step: TomlValue): string {
	const parts: string[] = [];
	if (text(step.intro)) {
		parts.push(`<p class="hint">${escape(text(step.intro))}</p>`);
	}
	const dataset = text(step.dataset);
	if (dataset || text(step.datasetText)) {
		const name = escape(text(step.datasetText) || dataset);
		const link = dataset
			? `<button class="link" data-dataset="${escape(dataset)}" title="${escape(localize('toolboxTimeArrow.openDataset', "Open in Manage Challenge Datasets"))}">${name}</button>`
			: name;
		parts.push(`<p class="dataset"><span class="label">${escape(localize('toolboxTimeArrow.dataset', "Dataset:"))}</span> ${link}</p>`);
	}
	for (const section of tables(step.sections)) {
		parts.push(`<h4>${escape(text(section.heading))}</h4>`);
		if (text(section.text)) {
			parts.push(`<p>${escape(text(section.text))}</p>`);
		}
		const items = texts(section.items);
		if (items.length) {
			parts.push(`<ul>${items.map(item => `<li>${escape(item)}</li>`).join('')}</ul>`);
		}
	}
	return parts.join('\n');
}

/** The page of a toolbox panel of the Time Arrow style. */
export function timeArrowPanelHtml(title: string, parsed: TomlValue, hasPackages: boolean): string {
	return buildWebviewHtml({
		title: escape(title),
		omitPoweredBy: !hasPackages,
		omitNextSteps: true,
		introHtml: escape(text(table(parsed.meta).intro)),
		beforeStepsHtml: matrixHtml(parsed),
		steps: tables(parsed.steps).map((step, index) => ({ id: `step-${index + 1}`, title: escape(text(step.title)), bodyHtml: stepBodyHtml(step) })),
		extraCss: `${compareCss}
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
`,
		pageScriptJs: `
	document.addEventListener('click', event => {
		const link = event.target.closest('button[data-dataset]');
		if (link) {
			vscode.postMessage({ command: 'openDataset', id: link.dataset.dataset });
		}
	});
`,
	});
}

/** The messages of a Time Arrow page of a toolbox: a dataset opened in Manage Challenge Datasets. */
export function onTimeArrowMessage(message: unknown, commandService: ICommandService): void {
	const { command, id } = table(message);
	if (command === 'openDataset' && typeof id === 'string') {
		void commandService.executeCommand(FORECASTING_CATALOGUE_COMMAND_ID, id);
	}
}
