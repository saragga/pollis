/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as dom from '../../../../base/browser/dom.js';
import { IListRenderer, IListVirtualDelegate } from '../../../../base/browser/ui/list/list.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { fromNow } from '../../../../base/common/date.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { FileChangeType, IFileService } from '../../../../platform/files/common/files.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { WorkbenchList } from '../../../../platform/list/browser/listService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IQuickInputService, IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IViewPaneOptions, ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import './media/connectionsView.css';
import { DUCKDB_QUERY_LOG, IQueryHistoryEntry, parseDuckDBQueryLog, parseJuliaSqlHistory, RUN_IN_DUCKDB_TERMINAL_COMMAND_ID } from '../common/duckdbSql.js';

/** The queries the view lists, the newest first. */
const SHOWN_QUERIES = 500;

interface IQueryTemplate {
	readonly row: HTMLElement;
	readonly icon: HTMLElement;
	readonly sql: HTMLElement;
	readonly description: HTMLElement;
	readonly disposables: DisposableStore;
}

class QueryDelegate implements IListVirtualDelegate<IQueryHistoryEntry> {
	getHeight(): number {
		return 22;
	}
	getTemplateId(): string {
		return QueryRenderer.TEMPLATE_ID;
	}
}

/** Where a query was run: the prompt it was typed at, or a notebook. */
function sourceLabel(entry: IQueryHistoryEntry): string {
	switch (entry.source) {
		case 'duckdb': return 'duckdb>';
		case 'notebook': return localize('queryHistory.notebook', "notebook");
		case 'sql': return 'sql>';
	}
}

/** Where a query was run, as the hover says it. */
function sourceSentence(entry: IQueryHistoryEntry): string {
	switch (entry.source) {
		case 'duckdb': return localize('queryHistory.fromDuckDB', "Run in the DuckDB terminal, on {0}", entry.database ?? localize('queryHistory.memory', "an in-memory database"));
		case 'notebook': return entry.database
			? localize('queryHistory.fromNotebook', "Run in the notebook {0}", entry.database)
			: localize('queryHistory.fromUnsavedNotebook', "Run in an unsaved notebook");
		case 'sql': return localize('queryHistory.fromSqlMode', "Run in the sql> mode of the Julia REPL");
	}
}

/** How long a query took: 0.024 s. */
function durationLabel(ms: number): string {
	return localize('queryHistory.seconds', "{0} s", (ms / 1000).toFixed(3));
}

function rowsLabel(rows: number): string {
	return rows === 1 ? localize('queryHistory.oneRow', "1 row") : localize('queryHistory.rows', "{0} rows", rows);
}

class QueryRenderer implements IListRenderer<IQueryHistoryEntry, IQueryTemplate> {

	static readonly TEMPLATE_ID = 'queryHistoryItem';
	readonly templateId = QueryRenderer.TEMPLATE_ID;

	constructor(private readonly hoverService: IHoverService) { }

	renderTemplate(container: HTMLElement): IQueryTemplate {
		const row = dom.append(container, dom.$('.database-item.query-item'));
		const icon = dom.append(row, dom.$('span.icon'));
		const sql = dom.append(row, dom.$('span.name.query-sql'));
		const description = dom.append(row, dom.$('span.description'));
		return { row, icon, sql, description, disposables: new DisposableStore() };
	}

	renderElement(entry: IQueryHistoryEntry, _index: number, template: IQueryTemplate): void {
		template.disposables.clear();
		// A tick for a query that ran, a cross for one that failed; the sql> mode does not say, so a plain prompt
		const icon = entry.error ? Codicon.error : entry.source !== 'sql' ? Codicon.check : Codicon.terminal;
		template.icon.className = `icon ${ThemeIcon.asClassName(icon)}`;
		template.row.classList.toggle('failed', !!entry.error);
		template.row.classList.toggle('succeeded', entry.source !== 'sql' && !entry.error);
		template.sql.textContent = entry.sql.replace(/\s+/g, ' ').trim();
		const details = [sourceLabel(entry)];
		if (entry.rows !== undefined && !entry.error) {
			details.push(rowsLabel(entry.rows));
		}
		if (entry.durationMs !== undefined) {
			details.push(durationLabel(entry.durationMs));
		}
		details.push(fromNow(entry.time, true));
		template.description.textContent = details.join(' · ');

		const hover = new MarkdownString();
		hover.appendCodeblock('sql', entry.sql);
		const facts = [sourceSentence(entry), new Date(entry.time).toLocaleString()];
		if (entry.rows !== undefined && !entry.error) {
			facts.push(rowsLabel(entry.rows));
		}
		if (entry.durationMs !== undefined) {
			facts.push(durationLabel(entry.durationMs));
		}
		hover.appendText(facts.join(' · '));
		if (entry.error) {
			hover.appendText('\n\n').appendText(entry.error);
		}
		hover.appendText('\n\n').appendText(localize('queryHistory.click', "Click to run it again, copy it or open it in an editor."));
		template.disposables.add(this.hoverService.setupDelayedHover(template.row, { content: hover }));
	}

	disposeTemplate(template: IQueryTemplate): void {
		template.disposables.dispose();
	}
}

/**
 * The History view of the Databases view: the queries run in the duckdb> terminal, from the log it keeps in
 * ~/.pollis/duckdb, and in the sql> mode of the Julia REPL, from the history of the REPL; the newest first.
 */
export class QueryHistoryView extends ViewPane {

	static readonly ID = 'pollis.databases.history';

	private list: WorkbenchList<IQueryHistoryEntry> | undefined;
	private empty: HTMLElement | undefined;
	private readonly refreshScheduler = this._register(new RunOnceScheduler(() => this.refresh(), 500));
	private files: { readonly duckdbLog: URI; readonly juliaHistory: URI } | undefined;
	private size: { readonly height: number; readonly width: number } | undefined;

	constructor(
		options: IViewPaneOptions,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IOpenerService openerService: IOpenerService,
		@IThemeService themeService: IThemeService,
		@IHoverService hoverService: IHoverService,
		@IFileService private readonly fileService: IFileService,
		@IPathService private readonly pathService: IPathService,
		@IQuickInputService private readonly quickInputService: IQuickInputService,
		@ICommandService private readonly commandService: ICommandService,
		@IClipboardService private readonly clipboardService: IClipboardService,
		@IEditorService private readonly editorService: IEditorService,
	) {
		super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
	}

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);
		const root = dom.append(container, dom.$('.databases-view'));
		this.empty = dom.append(root, dom.$('.welcome-view-content.databases-empty'));
		dom.append(this.empty, dom.$('p')).textContent = localize('queryHistory.empty', "No queries yet. The queries you run in the DuckDB terminal, and in the sql> mode of the Julia REPL, show here.");
		const listContainer = dom.append(root, dom.$('.databases-tree'));
		this.list = this._register(this.instantiationService.createInstance(
			WorkbenchList<IQueryHistoryEntry>,
			'QueryHistory',
			listContainer,
			new QueryDelegate(),
			[new QueryRenderer(this.hoverService)],
			{
				accessibilityProvider: {
					getAriaLabel: (entry: IQueryHistoryEntry) => `${sourceLabel(entry)} ${entry.sql}`,
					getWidgetAriaLabel: () => localize('queryHistory.aria', "Query History"),
				},
			},
		));
		this._register(this.list.onDidOpen(e => {
			if (e.element) {
				this.pickAction(e.element);
			}
		}));
		this._register(this.onDidChangeBodyVisibility(visible => {
			if (visible) {
				this.refreshScheduler.schedule(0);
			}
		}));
		this.watch();
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
		this.size = { height, width };
		// The message, while there are no queries, takes the place of the list
		this.list?.layout(height - (this.empty && !this.empty.classList.contains('hidden') ? this.empty.offsetHeight : 0), width);
	}

	/** Watches the folders of the two files, which may not exist yet, and reads them again when they change. */
	private async watch(): Promise<void> {
		const home = await this.pathService.userHome();
		if (this._store.isDisposed) {
			return;
		}
		const files = this.files = {
			duckdbLog: joinPath(home, '.pollis', 'duckdb', DUCKDB_QUERY_LOG),
			juliaHistory: joinPath(home, '.julia', 'logs', 'repl_history.jl'),
		};
		for (const file of [files.duckdbLog, files.juliaHistory]) {
			const folder = joinPath(file, '..');
			const watcher = this._register(this.fileService.createWatcher(folder, { recursive: false, excludes: [] }));
			this._register(watcher.onDidChange(e => {
				if (e.contains(file, FileChangeType.ADDED, FileChangeType.UPDATED, FileChangeType.DELETED) && this.isBodyVisible()) {
					this.refreshScheduler.schedule();
				}
			}));
		}
		this.refreshScheduler.schedule(0);
	}

	private async read(file: URI): Promise<string> {
		try {
			return (await this.fileService.readFile(file)).value.toString();
		} catch {
			return '';
		}
	}

	private async refresh(): Promise<void> {
		if (!this.files || !this.list) {
			return;
		}
		const [log, history] = await Promise.all([this.read(this.files.duckdbLog), this.read(this.files.juliaHistory)]);
		const entries = [...parseDuckDBQueryLog(log), ...parseJuliaSqlHistory(history)]
			.sort((a, b) => b.time - a.time)
			.slice(0, SHOWN_QUERIES);
		this.list.splice(0, this.list.length, entries);
		this.empty?.classList.toggle('hidden', entries.length > 0);
		if (this.size) {
			this.layoutBody(this.size.height, this.size.width);
		}
	}

	/** Run Again, Copy SQL or Open in Editor, for a query clicked. */
	private async pickAction(entry: IQueryHistoryEntry): Promise<void> {
		type Action = 'run' | 'copy' | 'open';
		const items: (IQuickPickItem & { readonly action: Action })[] = [
			{ label: `$(play) ${localize('queryHistory.runAgain', "Run Again")}`, description: localize('queryHistory.runAgain.description', "in the DuckDB terminal"), action: 'run' },
			{ label: `$(copy) ${localize('queryHistory.copy', "Copy SQL")}`, action: 'copy' },
			{ label: `$(go-to-file) ${localize('queryHistory.open', "Open in Editor")}`, action: 'open' },
		];
		const pick = await this.quickInputService.pick(items, { placeHolder: entry.sql.replace(/\s+/g, ' ').trim() });
		switch (pick?.action) {
			case 'run':
				await this.commandService.executeCommand(RUN_IN_DUCKDB_TERMINAL_COMMAND_ID, entry.sql);
				break;
			case 'copy':
				await this.clipboardService.writeText(entry.sql);
				break;
			case 'open':
				// A new SQL file holding the query, as New File > SQL File makes it
				await this.editorService.openEditor({ resource: undefined, contents: `${entry.sql}\n`, languageId: 'sql' });
				break;
		}
	}
}
