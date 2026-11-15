/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Next Steps in SQL for a Time Arrow or Minimal page of the scaffold: each opens, in the panel on the right, a query
// of DuckDB over Pollis's databases, which the duckdb> shell attaches read only by their names (PollisJournals,
// PollisRSS...), coloured as Example Code is, with Copy, DuckDB REPL (runs it there) and Send to Editor (an
// untitled SQL file, to change it first).

import { DisposableStore, IDisposable } from '../../../../../base/common/lifecycle.js';
import { TokenizationRegistry } from '../../../../../editor/common/languages.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { generateTokensCSSForColorMap } from '../../../../../editor/common/languages/supports/tokenization.js';
import { tokenizeToString } from '../../../../../editor/common/languages/textToHtmlTokenizer.js';
import { localize } from '../../../../../nls.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { nextStepIcon, openPageStepJs } from './webviewScaffold.js';
import { IOverlayWebview } from '../../../webview/browser/webview.js';
import { RUN_IN_DUCKDB_TERMINAL_COMMAND_ID } from '../../../databases/common/duckdbSql.js';

/** A Next Step that is a query: its id, its label, what it shows, and its SQL. */
export interface ISqlNextStep {
	readonly id: string;
	readonly label: string;
	readonly description: string;
	readonly sql: string;
}

type SqlNextStepMessage =
	| { readonly command: 'sqlStepsReady' }
	| { readonly command: 'copySqlStep' | 'runSqlStep' | 'editSqlStep'; readonly id: string };

/** `nextStepsHtml` and `nextStepsWiringJs` of `buildWebviewHtml` for the steps, each with the database codicon, which `registerSqlNextSteps` answers. */
export function sqlNextStepsParts(steps: readonly ISqlNextStep[]): { readonly nextStepsHtml: string; readonly nextStepsWiringJs: string } {
	const text = {
		copy: localize('sqlNextSteps.copy', "Copy"),
		copied: localize('sqlNextSteps.copied', "Copied"),
		run: localize('sqlNextSteps.run', "DuckDB REPL"),
		runTitle: localize('sqlNextSteps.runTitle', "Run the query in a duckdb> terminal, where Pollis's databases are attached by their names"),
		edit: localize('sqlNextSteps.edit', "Send to Editor"),
		editTitle: localize('sqlNextSteps.editTitle', "Open the query in a new SQL file, to change it before running it"),
	};
	return {
		nextStepsHtml: steps.map(step => `					<li><button class="list-btn panel-toggle" id="btn-sql-${step.id}">${nextStepIcon('sql')}${step.label}</button></li>`).join('\n'),
		nextStepsWiringJs: `${openPageStepJs}
		var SQL_STEPS = ${JSON.stringify(steps.map(({ id, label, description, sql }) => ({ id, label, description, sql })))};
		var SQL_TEXT = ${JSON.stringify(text)};
		var sqlStepHtml = {};
		// The panel of a step: what it shows, its SQL (coloured once the colours arrive), and its buttons
		function fillSqlStep(step) {
			var panel = document.getElementById('sqlStep-' + step.id);
			if (!panel) { return; }
			panel.innerHTML = '<div class="panel-code-desc"></div>'
				+ '<div class="code-preview-wrapper"><div class="code-preview sql-step-code"></div>'
				+ '<div class="code-btn-bar code-btn-bar-bottom"><span class="code-btn-group">'
				+ '<button class="code-action-btn" data-sql-act="copySqlStep"></button>'
				+ '<button class="code-action-btn" data-sql-act="runSqlStep"></button>'
				+ '<button class="code-action-btn" data-sql-act="editSqlStep"></button>'
				+ '</span></div></div>';
			panel.querySelector('.panel-code-desc').textContent = step.description;
			var box = panel.querySelector('.code-preview');
			box.style.whiteSpace = 'pre';
			if (sqlStepHtml[step.id]) { box.innerHTML = sqlStepHtml[step.id]; } else { box.textContent = step.sql; }
			panel.querySelectorAll('[data-sql-act]').forEach(function(button) {
				var act = button.dataset.sqlAct;
				button.textContent = act === 'copySqlStep' ? SQL_TEXT.copy : act === 'runSqlStep' ? SQL_TEXT.run : SQL_TEXT.edit;
				if (act === 'runSqlStep') { button.title = SQL_TEXT.runTitle; }
				if (act === 'editSqlStep') { button.title = SQL_TEXT.editTitle; }
				button.addEventListener('click', function() {
					vscode.postMessage({ command: act, id: step.id });
					if (act === 'copySqlStep') {
						button.textContent = SQL_TEXT.copied;
						setTimeout(function() { button.textContent = SQL_TEXT.copy; }, 1500);
					}
				});
			});
		}
		SQL_STEPS.forEach(function(step) {
			document.getElementById('btn-sql-' + step.id).addEventListener('click', function() {
				openPageStep(this, 'sqlStep-' + step.id, step.label, 'pollis-sql-step-' + step.id);
			});
			window.addEventListener('pollis-sql-step-' + step.id, function() { fillSqlStep(step); });
		});
		window.addEventListener('message', function(event) {
			var message = event.data;
			if (message && message.command === 'sqlStepColors') {
				document.getElementById('mtk-theme').textContent = message.css;
				sqlStepHtml = message.html;
				SQL_STEPS.forEach(function(step) { fillSqlStep(step); });
			}
		});
		vscode.postMessage({ command: 'sqlStepsReady' });`,
	};
}

/**
 * Answers the Next Steps of `sqlNextStepsParts` on a page's webview: sends their SQL coloured in the theme's colours
 * when the page is ready and when the theme changes, and copies a query, runs it in the duckdb> terminal, or opens it
 * in an untitled SQL file.
 */
export function registerSqlNextSteps(webview: IOverlayWebview, steps: readonly ISqlNextStep[], languageService: ILanguageService, themeService: IThemeService, commandService: ICommandService, clipboardService: IClipboardService, editorService: IEditorService): IDisposable {
	const disposables = new DisposableStore();
	const sqlOf = (id: string) => steps.find(step => step.id === id)?.sql;
	const sendColors = async () => {
		const html: Record<string, string> = {};
		for (const step of steps) {
			html[step.id] = await tokenizeToString(languageService, step.sql, 'sql');
		}
		const colorMap = TokenizationRegistry.getColorMap();
		webview.postMessage({ command: 'sqlStepColors', html, css: colorMap ? generateTokensCSSForColorMap(colorMap) : '' });
	};
	disposables.add(themeService.onDidColorThemeChange(() => sendColors()));
	disposables.add(webview.onMessage(async (e: { message: SqlNextStepMessage }) => {
		const message = e.message;
		if (message.command === 'sqlStepsReady') {
			await sendColors();
			return;
		}
		const sql = message.command === 'copySqlStep' || message.command === 'runSqlStep' || message.command === 'editSqlStep' ? sqlOf(message.id) : undefined;
		if (sql === undefined) {
			return;
		}
		if (message.command === 'copySqlStep') {
			await clipboardService.writeText(sql);
		} else if (message.command === 'runSqlStep') {
			await commandService.executeCommand(RUN_IN_DUCKDB_TERMINAL_COMMAND_ID, sql);
		} else {
			await editorService.openEditor({ resource: undefined, contents: sql, languageId: 'sql' });
		}
	}));
	return disposables;
}
