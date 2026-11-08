/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as dom from '../../../../base/browser/dom.js';
import { ActionBar, IActionViewItem } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { Button } from '../../../../base/browser/ui/button/button.js';
import { IBaseActionViewItemOptions } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IListVirtualDelegate } from '../../../../base/browser/ui/list/list.js';
import { IObjectTreeElement, ITreeContextMenuEvent, ITreeNode, ITreeRenderer } from '../../../../base/browser/ui/tree/tree.js';
import { Action, IAction } from '../../../../base/common/actions.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { language } from '../../../../base/common/platform.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { localize } from '../../../../nls.js';
import { DropdownWithPrimaryActionViewItem } from '../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js';
import { createActionViewItem, getActionBarActions, getFlatContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { IMenuService, MenuId, MenuItemAction } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { WorkbenchObjectTree } from '../../../../platform/list/browser/listService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { defaultButtonStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IViewPaneOptions, ViewPane } from '../../../browser/parts/views/viewPane.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IDataPackageUpdate, JULIA_REPL_VERSION_KEY, PollisDataPackages } from '../../compose/browser/pollisDataPackages.js';
import { IDatabaseColumn, IDatabaseConnectionsService, IDatabaseSchema, IDatabaseSession, IDatabaseTable } from '../common/databaseConnections.js';
import './media/connectionsView.css';
import { BENCHMARKS_DATABASE_ID, COMPARISONS_DATABASE_ID, databaseGroupOf, DatabaseGroup, describeConnection, DOCUMENTS_DATABASE_ID, getDatabaseDriver, IDatabaseConnectionProfile, isInMemoryConnection, isWritableConnection, JOURNALS_DATABASE_ID, NEW_CONNECTION_COMMAND_ID, REFERENCES_DATABASE_ID, RSS_DATABASE_ID } from '../common/databaseDrivers.js';

/** The Databases container of the secondary side bar, with its Pollis Built-In and User views. */
export const DATABASES_VIEW_CONTAINER_ID = 'workbench.view.pollis.databases';

/** The context menu of an item in the Connections view. Its commands receive an {@link IDatabaseItemArg}. */
export const DatabaseConnectionContextMenu = new MenuId('DatabaseConnectionContext');
/** The buttons shown on an item of the Connections view while it is hovered or selected. Same argument and context keys. */
export const DatabaseItemInlineMenu = new MenuId('DatabaseItemInline');
/** The engines in the dropdown of the view title's "+ New" button. */
export const DatabasesNewConnectionMenu = new MenuId('DatabasesNewConnection');

/** The kind of the item a menu is shown for: `connection`, `schema`, `table` or `column`. */
export const DatabaseItemKind = new RawContextKey<string>('pollisDatabaseItem', undefined);
/** Whether the connection of the item is open in the Julia REPL. */
export const DatabaseItemConnected = new RawContextKey<boolean>('pollisDatabaseConnected', false);
/** Whether the connection of the item is a saved profile, rather than one shown with `PollisDB.show`. */
export const DatabaseItemSaved = new RawContextKey<boolean>('pollisDatabaseSaved', false);
/** Whether the connection of the item is the built-in Pollis database, which cannot be edited or deleted. */
export const DatabaseItemBuiltin = new RawContextKey<boolean>('pollisDatabaseBuiltin', false);
/** The id of the item's connection, which shows the commands of one built-in database on it alone. */
export const DatabaseItemId = new RawContextKey<string>('pollisDatabaseId', undefined);
/** Whether the tables of the item's connection are shown below it. */
export const DatabaseItemExpanded = new RawContextKey<boolean>('pollisDatabaseExpanded', false);
/** Whether the item's database is a saved DuckDB database, not built in and not read-only, that tables can be written to. */
export const DatabaseItemWritable = new RawContextKey<boolean>('pollisDatabaseWritable', false);

export const CONNECT_DATABASE_COMMAND_ID = 'pollis.databases.connect';
export const DISCONNECT_DATABASE_COMMAND_ID = 'pollis.databases.disconnect';
export const REFRESH_DATABASE_COMMAND_ID = 'pollis.databases.refresh';
/** Reads the tables of a schema listed without them, when it is opened. */
export const OPEN_SCHEMA_COMMAND_ID = 'pollis.databases.openSchema';
export const PREVIEW_TABLE_COMMAND_ID = 'pollis.databases.previewTable';
export const BROWSE_TABLE_COMMAND_ID = 'pollis.databases.browseTable';

/** What the menu commands receive: the connection id and, below it, the item's names. */
export interface IDatabaseItemArg {
	readonly id: string;
	readonly schema?: string;
	readonly table?: string;
	readonly column?: string;
}

type DatabaseItem =
	| { readonly kind: 'connection'; readonly id: string; readonly profile: IDatabaseConnectionProfile | undefined; readonly session: IDatabaseSession | undefined }
	| { readonly kind: 'schema'; readonly id: string; readonly schema: IDatabaseSchema }
	| { readonly kind: 'table'; readonly id: string; readonly schema: string; readonly table: IDatabaseTable }
	| { readonly kind: 'column'; readonly id: string; readonly schema: string; readonly table: string; readonly column: IDatabaseColumn }
	| { readonly kind: 'message'; readonly id: string; readonly message: string; readonly schema?: string };

function itemId(item: DatabaseItem): string {
	switch (item.kind) {
		case 'connection': return item.id;
		case 'schema': return `${item.id}/${item.schema.name}`;
		case 'table': return `${item.id}/${item.schema}/${item.table.name}`;
		case 'column': return `${item.id}/${item.schema}/${item.table}/${item.column.name}`;
		case 'message': return item.schema === undefined ? `${item.id}/!message` : `${item.id}/${item.schema}/!message`;
	}
}

function itemArg(item: DatabaseItem): IDatabaseItemArg {
	switch (item.kind) {
		case 'schema': return { id: item.id, schema: item.schema.name };
		case 'table': return { id: item.id, schema: item.schema, table: item.table.name };
		case 'column': return { id: item.id, schema: item.schema, table: item.table, column: item.column.name };
		default: return { id: item.id };
	}
}

/** The name users know an engine by: PostgreSQL rather than the LibPQ package that talks to it. */
function engineLabel(engine: string): string {
	return engine === 'LibPQ' ? 'PostgreSQL' : engine;
}

/** What a schema holds, its tables and its views counted apart: "4 views", "2 tables, 3 views". */
function describeSchemaContents(tables: readonly IDatabaseTable[]): string {
	const views = tables.filter(table => table.kind === 'view').length;
	const count = tables.length - views;
	const tablesText = count === 1 ? localize('schema.oneTable', "1 table") : localize('schema.tables', "{0} tables", count);
	const viewsText = views === 1 ? localize('schema.oneView', "1 view") : localize('schema.views', "{0} views", views);
	if (!views) {
		return tablesText;
	}
	return count ? localize('schema.tablesAndViews', "{0}, {1}", tablesText, viewsText) : viewsText;
}

function connectionName(profile: IDatabaseConnectionProfile | undefined, session: IDatabaseSession | undefined): string {
	return profile?.name ?? session?.name ?? '';
}

interface IItemTemplate {
	readonly row: HTMLElement;
	readonly icon: HTMLElement;
	readonly name: HTMLElement;
	readonly description: HTMLElement;
	readonly actions: HTMLElement;
	readonly actionBar: ActionBar;
	readonly disposables: DisposableStore;
}

class ItemDelegate implements IListVirtualDelegate<DatabaseItem> {
	getHeight(): number {
		return 22;
	}
	/** Messages (errors, "No tables yet") wrap onto as many lines as they need instead of being cut off. */
	hasDynamicHeight(item: DatabaseItem): boolean {
		return item.kind === 'message';
	}
	getTemplateId(): string {
		return ItemRenderer.TEMPLATE_ID;
	}
}

/** The command of the Julia extension (pollisTerminal.ts) that says what is attached to the Shared Session. */
const SHARED_SESSION_ATTACHED_COMMAND_ID = 'language-julia.sharedSessionAttached';

/** A client of the window attached to the Shared Session, the duckdb> terminal or a notebook: its last query, and since when. */
interface IAttachedClient {
	readonly query: string;
	readonly running: boolean;
	readonly seconds: number;
}

/** What the hover of the Shared Session says of `clients`, or that the Julia REPL did not answer. */
function describeAttached(clients: readonly IAttachedClient[] | undefined): string {
	if (!clients) {
		return localize('connection.shared.unknown', "What is attached could not be read from the Julia REPL.");
	}
	if (!clients.length) {
		return localize('connection.shared.none', "Nothing of this window is attached to it now.");
	}
	const lines = [clients.length === 1
		? localize('connection.shared.one', "Attached by 1 client: the duckdb> terminal or a notebook.")
		: localize('connection.shared.many', "Attached by {0} clients: the duckdb> terminal and notebooks.", clients.length)];
	for (const client of clients.filter(client => client.running)) {
		const query = client.query.replace(/\s+/g, ' ').trim();
		lines.push(localize('connection.shared.running', "Running for {0} s: {1}", client.seconds, query.length > 80 ? `${query.slice(0, 79)}…` : query));
	}
	return lines.join('\n');
}

class ItemRenderer implements ITreeRenderer<DatabaseItem, void, IItemTemplate> {

	static readonly TEMPLATE_ID = 'databaseItem';
	readonly templateId = ItemRenderer.TEMPLATE_ID;

	constructor(
		private readonly itemContext: (item: DatabaseItem) => [string, string | boolean][],
		private readonly updateOf: (name: string) => IDataPackageUpdate | undefined,
		private readonly hoverService: IHoverService,
		private readonly menuService: IMenuService,
		private readonly contextKeyService: IContextKeyService,
		private readonly instantiationService: IInstantiationService,
		private readonly commandService: ICommandService,
	) { }

	/**
	 * The hover of the Shared Session: `text`, then what the window's DuckDB clients have attached to it, which the Julia
	 * extension asks the REPL for each time the hover shows.
	 */
	private sharedSessionHover(text: string): HTMLElement {
		const element = dom.$('.database-hover', undefined, text);
		const attached = dom.append(element, dom.$('.database-hover-attached', undefined, localize('connection.shared.reading', "Reading what is attached...")));
		this.commandService.executeCommand<readonly IAttachedClient[]>(SHARED_SESSION_ATTACHED_COMMAND_ID).then(
			clients => attached.textContent = describeAttached(clients),
			() => attached.textContent = describeAttached(undefined));
		return element;
	}

	renderTemplate(container: HTMLElement): IItemTemplate {
		const row = dom.append(container, dom.$('.database-item'));
		const icon = dom.append(row, dom.$('span.icon'));
		const name = dom.append(row, dom.$('span.name'));
		const description = dom.append(row, dom.$('span.description'));
		const actions = dom.append(row, dom.$('.actions'));
		const actionBar = new ActionBar(actions, {
			actionViewItemProvider: (action, options) => createActionViewItem(this.instantiationService, action, options),
		});
		return { row, icon, name, description, actions, actionBar, disposables: new DisposableStore() };
	}

	renderElement(node: ITreeNode<DatabaseItem, void>, _index: number, template: IItemTemplate): void {
		const item = node.element;
		let icon: ThemeIcon;
		let name: string;
		let description = '';
		let hover: string | undefined;
		// A built-in database whose package Pollis has updated lately: the date after its name, and in its hover
		let update: IDataPackageUpdate | undefined;
		template.row.classList.toggle('connected', item.kind === 'connection' && !!item.session);
		template.row.classList.toggle('disconnected', item.kind === 'connection' && !item.session);
		template.row.classList.toggle('builtin', item.kind === 'connection' && !!item.profile?.builtin);
		template.row.classList.toggle('message', item.kind === 'message');
		switch (item.kind) {
			case 'connection': {
				name = connectionName(item.profile, item.session);
				const { profile, session } = item;
				const inMemory = !!profile && isInMemoryConnection(profile);
				icon = inMemory ? Codicon.zap : Codicon.database;
				// The list shows only the names; the hover tells the engine, the location and the connection
				// (and, for PollisDatasets, that the database is built into Pollis).
				if (inMemory) {
					description = localize('connection.inMemory', "in-memory");
				}
				update = profile?.builtin ? this.updateOf(profile.name) : undefined;
				if (update) {
					description = localize('connection.updated', "Updated {0}", new Date(update.date).toLocaleDateString(language, { day: 'numeric', month: 'short' }));
				}
				if (profile?.builtin && profile.id === RSS_DATABASE_ID) {
					hover = session
						? localize('connection.rss.hover.connected', "{0} (DuckDB)\nRecorded by Pollis: every item of the RSS feeds received, read-only, in {1}.\nConnected in the Julia REPL as {2}. Click to browse its views.", name, describeConnection(profile), profile.variable)
						: localize('connection.rss.hover', "{0} (DuckDB)\nRecorded by Pollis: every item of the RSS feeds received, read-only, in {1}.\nNot connected. Click to connect in the Julia REPL as {2}.", name, describeConnection(profile), profile.variable);
				} else if (profile?.builtin && profile.id === COMPARISONS_DATABASE_ID) {
					hover = session
						? localize('connection.comparisons.hover.connected', "{0} (DuckDB)\nRecorded by Pollis: the runs of the Evaluate and Benchmark pages, read-only, in {1}, a copy Pollis makes after each run. Connect again for the runs made since.\nConnected in the Julia REPL as {2}. Click to browse its tables.", name, describeConnection(profile), profile.variable)
						: localize('connection.comparisons.hover', "{0} (DuckDB)\nRecorded by Pollis: the runs of the Evaluate and Benchmark pages, read-only, in {1}, a copy Pollis makes after each run.\nNot connected. Click to connect in the Julia REPL as {2}.", name, describeConnection(profile), profile.variable);
				} else if (profile?.builtin && profile.id === JOURNALS_DATABASE_ID) {
					hover = session
						? localize('connection.journals.hover.connected', "{0} (DuckDB)\nBuilt into Pollis: the journals of OpenAlex and the journal metrics you imported, read-only, in {1}.\nConnected in the Julia REPL as {2}. Click to browse its tables.", name, describeConnection(profile), profile.variable)
						: localize('connection.journals.hover', "{0} (DuckDB)\nBuilt into Pollis: the journals of OpenAlex and the journal metrics you imported, read-only, in {1}.\nNot connected. Click to connect in the Julia REPL as {2}.", name, describeConnection(profile), profile.variable);
				} else if (profile?.builtin && profile.id === REFERENCES_DATABASE_ID) {
					hover = session
						? localize('connection.references.hover.connected', "{0} (DuckDB)\nBuilt into Pollis: the references of Pollis and those you added, read-only, in {1}.\nConnected in the Julia REPL as {2}. Click to browse its tables.", name, describeConnection(profile), profile.variable)
						: localize('connection.references.hover', "{0} (DuckDB)\nBuilt into Pollis: the references of Pollis and those you added, read-only, in {1}.\nNot connected. Click to connect in the Julia REPL as {2}.", name, describeConnection(profile), profile.variable);
				} else if (profile?.builtin && profile.id === BENCHMARKS_DATABASE_ID) {
					hover = session
						? localize('connection.benchmarks.hover.connected', "{0} (DuckDB)\nBuilt into Pollis: the published benchmarks of Pollis, their catalogue and the questions of those built in, read-only, in {1}.\nConnected in the Julia REPL as {2}. Click to browse its tables.", name, describeConnection(profile), profile.variable)
						: localize('connection.benchmarks.hover', "{0} (DuckDB)\nBuilt into Pollis: the published benchmarks of Pollis, their catalogue and the questions of those built in, read-only, in {1}.\nNot connected. Click to connect in the Julia REPL as {2}.", name, describeConnection(profile), profile.variable);
				} else if (profile?.builtin && profile.id === DOCUMENTS_DATABASE_ID) {
					hover = session
						? localize('connection.documents.hover.connected', "{0} (DuckDB)\nBuilt into Pollis: the passages of its documents that Ask Pollis searches, read-only, in {1}.\nConnected in the Julia REPL as {2}. Click to browse its tables.", name, describeConnection(profile), profile.variable)
						: localize('connection.documents.hover', "{0} (DuckDB)\nBuilt into Pollis: the passages of its documents that Ask Pollis searches, read-only, in {1}.\nNot connected. Click to connect in the Julia REPL as {2}.", name, describeConnection(profile), profile.variable);
				} else if (profile?.builtin) {
					hover = session
						? localize('connection.builtin.hover.connected', "{0} (DuckDB)\nThe database built into Pollis: the PollisDatasets, read-only, in {1}.\nConnected in the Julia REPL as {2}. Click to browse its tables.", name, describeConnection(profile), profile.variable)
						: localize('connection.builtin.hover', "{0} (DuckDB)\nThe database built into Pollis: the PollisDatasets, read-only, in {1}.\nNot connected. Click to connect in the Julia REPL as {2}.", name, describeConnection(profile), profile.variable);
				} else if (profile) {
					const driver = getDatabaseDriver(profile.driver).label;
					hover = session
						? localize('connection.hover.connected', "{0} ({1})\n{2}\nConnected in the Julia REPL as {3}. Click to browse its tables.", name, driver, describeConnection(profile), profile.variable)
						: localize('connection.hover', "{0} ({1})\n{2}\nNot connected. Click to connect in the Julia REPL as {3}.", name, driver, describeConnection(profile), profile.variable);
				} else if (session?.shared) {
					hover = localize('connection.shared.hover', "{0} (DuckDB)\nThe database of the Julia REPL, in memory: pollis>, the Pollis REPL terminal, sql and @share use it, and the duckdb> terminal and the notebooks of this window attach it as SharedSession. Its tables are lost when the Julia REPL restarts. Click to browse them.", name);
				} else if (session) {
					hover = localize('connection.hover.shown', "{0} ({1})\nShown with PollisDB.show in the Julia REPL. Click to browse its tables.", name, engineLabel(session.engine));
				}
				if (inMemory && hover && !profile?.builtin) {
					hover = localize('connection.hover.inMemory', "{0}\nIn-memory: its data is lost when you disconnect or the Julia REPL restarts.", hover);
				}
				break;
			}
			case 'schema':
				icon = Codicon.symbolNamespace;
				name = item.schema.name;
				description = item.schema.unread ? localize('schema.tables', "{0} tables", item.schema.tableCount ?? 0) : describeSchemaContents(item.schema.tables);
				break;
			case 'table':
				icon = item.table.kind === 'view' ? Codicon.eye : Codicon.table;
				name = item.table.name;
				description = localize('table.columns', "{0} columns", item.table.columns.length);
				hover = item.table.comment;
				break;
			case 'column':
				icon = Codicon.symbolField;
				name = item.column.name;
				description = item.column.type;
				hover = item.column.comment;
				break;
			case 'message':
				icon = Codicon.info;
				name = item.message;
				hover = item.message;
				break;
		}
		template.icon.className = `icon ${ThemeIcon.asClassName(icon)}`;
		template.name.textContent = name;
		template.description.textContent = description;
		if (hover && item.kind === 'connection' && item.session?.shared) {
			const text = hover;
			template.disposables.add(this.hoverService.setupDelayedHover(template.row, () => ({ content: this.sharedSessionHover(text) })));
		} else if (hover) {
			const content = update
				? new MarkdownString().appendText(hover).appendText('\n').appendText(localize('connection.updated.hover', "Updated from GitHub on {0}:", new Date(update.date).toLocaleDateString(language, { day: 'numeric', month: 'long', year: 'numeric' }))).appendText(' ').appendLink(update.url, localize('connection.whatChanged', "What Changed"))
				: hover;
			template.disposables.add(this.hoverService.setupDelayedHover(template.row, { content }));
		}
		template.actionBar.clear();
		if (item.kind !== 'message') {
			const contextKeyService = this.contextKeyService.createOverlay(this.itemContext(item));
			const groups = this.menuService.getMenuActions(DatabaseItemInlineMenu, contextKeyService, { arg: itemArg(item), shouldForwardArgs: true });
			template.actionBar.push(getActionBarActions(groups, 'inline').primary, { icon: true, label: false });
		}
	}

	disposeElement(_node: ITreeNode<DatabaseItem, void>, _index: number, template: IItemTemplate): void {
		template.disposables.clear();
	}

	disposeTemplate(template: IItemTemplate): void {
		template.actionBar.dispose();
		template.disposables.dispose();
	}
}


/** The container title's New Connection button, labelled "+ New", with a dropdown that opens it on a given engine. */
class NewConnectionActionViewItem extends DropdownWithPrimaryActionViewItem {

	override render(container: HTMLElement): void {
		super.render(container);
		container.classList.add('databases-new-connection');
		// The primary action renders into the first child, before the dropdown's.
		const primary = container.firstElementChild;
		if (dom.isHTMLElement(primary)) {
			dom.append(primary, dom.$('span.databases-new-label', undefined, localize('newConnection.label', "New")));
		}
	}
}

/**
 * The Databases container. Its title holds the buttons of both views (New Connection, Refresh Schemas,
 * Learn More and the DuckDB REPL), always shown, and New Connection renders as "+ New" with the engines.
 */
export class DatabasesViewPaneContainer extends ViewPaneContainer {

	/** The dropdown action of the title's "+ New" button, replaced whenever the title renders it again. */
	private readonly newConnectionDisposables = this._register(new DisposableStore());

	constructor(
		@IMenuService private readonly menuService: IMenuService,
		@IContextKeyService private readonly contextKeyService: IContextKeyService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IConfigurationService configurationService: IConfigurationService,
		@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IExtensionService extensionService: IExtensionService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IWorkspaceContextService contextService: IWorkspaceContextService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@ILogService logService: ILogService,
	) {
		super(DATABASES_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService, logService);
	}

	override getActionViewItem(action: IAction, options: IBaseActionViewItemOptions): IActionViewItem | undefined {
		if (action instanceof MenuItemAction && action.id === NEW_CONNECTION_COMMAND_ID) {
			this.newConnectionDisposables.clear();
			const engines = getFlatContextMenuActions(this.menuService.getMenuActions(DatabasesNewConnectionMenu, this.contextKeyService));
			const dropdown = this.newConnectionDisposables.add(new Action('databases.newConnectionEngines', localize('newConnection.engines', "New Connection To..."), undefined, true));
			return this.instantiationService.createInstance(NewConnectionActionViewItem, action, dropdown, engines, '', { hoverDelegate: options.hoverDelegate });
		}
		return super.getActionViewItem(action, options);
	}
}

/**
 * A view of the Databases container. It lists saved connections and, in the User view, those shown
 * from the REPL with `PollisDB.show`. Expanding a connection (clicking it, its twistie or Show Tables)
 * connects it if needed and shows the tree of its schemas, tables and columns in place, below it.
 */
export abstract class DatabaseConnectionsView extends ViewPane {

	private tree: WorkbenchObjectTree<DatabaseItem> | undefined;
	private root: HTMLElement | undefined;
	private treeContainer: HTMLElement | undefined;
	/** The message of the User view while it lists nothing. */
	private empty: HTMLElement | undefined;
	/** The connection items in the tree by id, the objects the tree knows them by. */
	private readonly connections = new Map<string, DatabaseItem & { kind: 'connection' }>();
	/** Connections expanded while not connected, being connected from the view; their tables show once the REPL reports them. */
	private readonly pending = new Set<string>();
	/** The ids of the schemas opened while unread, whose tables the REPL is reading. */
	private readonly pendingSchemas = new Set<string>();
	/** The ids of the expanded items, kept across refreshes. */
	private readonly expanded = new Set<string>();
	private lastSize: { height: number; width: number } | undefined;
	/** The data packages Pollis installed, and those of their databases it has updated lately, by name. */
	private readonly dataPackages: PollisDataPackages;
	private updates = new Map<string, IDataPackageUpdate>();
	private readonly updatesCheck = this._register(new RunOnceScheduler(() => this.checkUpdates(), 1000));
	/** The watcher of the commit files of the data packages, beside their environment. */
	private readonly environmentWatcher = this._register(new MutableDisposable<DisposableStore>());
	private watchedEnvironment: string | undefined;

	constructor(
		options: IViewPaneOptions,
		@IDatabaseConnectionsService private readonly databaseConnectionsService: IDatabaseConnectionsService,
		@IMenuService private readonly menuService: IMenuService,
		@ICommandService private readonly commandService: ICommandService,
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
	) {
		super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
		this.dataPackages = instantiationService.createInstance(PollisDataPackages);
		this._register(this.databaseConnectionsService.onDidChangeConnections(() => this.refresh()));
	}

	/** The group of databases the view lists: those built into Pollis, those of its activity, or the user's own. */
	protected abstract group(): DatabaseGroup;

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);
		this.root = dom.append(container, dom.$('.databases-view'));
		if (this.group() === 'user') {
			this.empty = this.renderEmpty(this.root);
		}
		this.treeContainer = dom.append(this.root, dom.$('.databases-tree'));

		this.tree = this._register(this.instantiationService.createInstance(
			WorkbenchObjectTree<DatabaseItem>,
			'DatabaseConnections',
			this.treeContainer,
			new ItemDelegate(),
			[new ItemRenderer(item => this.itemContext(item), name => this.updates.get(name), this.hoverService, this.menuService, this.contextKeyService, this.instantiationService, this.commandService)],
			{
				identityProvider: { getId: itemId },
				supportDynamicHeights: true,
				accessibilityProvider: {
					getAriaLabel: (item: DatabaseItem) => item.kind === 'connection' ? connectionName(item.profile, item.session) : itemId(item),
					getWidgetAriaLabel: () => localize('connections.aria', "Database Connections"),
				},
			},
		));
		this._register(this.tree.onDidChangeCollapseState(e => {
			const item = e.node.element;
			if (!item) {
				return;
			}
			if (e.node.collapsed) {
				this.expanded.delete(itemId(item));
			} else {
				this.expanded.add(itemId(item));
			}
			if (item.kind === 'connection') {
				this.onDidToggleConnection(item, !e.node.collapsed);
			} else if (item.kind === 'schema' && !e.node.collapsed && item.schema.unread) {
				this.openSchema(item.id, item.schema.name);
			}
		}));
		this._register(this.tree.onMouseDblClick(e => {
			if (e.element?.kind === 'table') {
				this.commandService.executeCommand(BROWSE_TABLE_COMMAND_ID, itemArg(e.element));
			}
		}));
		this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
		this.refresh();
		// The databases of the data packages, which Pollis updates at the start of the Julia REPL, are built in
		if (this.group() !== 'user') {
			this._register(this.contextKeyService.onDidChangeContext(e => {
				if (e.affectsSome(new Set([JULIA_REPL_VERSION_KEY]))) {
					this.updatesCheck.schedule();
				}
			}));
			this.updatesCheck.schedule(0);
		}
	}

	/**
	 * Find the data packages Pollis has updated lately, watching the commit files it writes beside their environment
	 * for the next update.
	 */
	private async checkUpdates(): Promise<void> {
		const juliaVersion = this.contextKeyService.getContextKeyValue<string>(JULIA_REPL_VERSION_KEY);
		const environment = await this.dataPackages.environment(juliaVersion);
		if (environment?.toString() !== this.watchedEnvironment) {
			this.watchedEnvironment = environment?.toString();
			const store = this.environmentWatcher.value = new DisposableStore();
			if (environment) {
				const watcher = store.add(this.fileService.createWatcher(environment, { recursive: false, excludes: [] }));
				store.add(watcher.onDidChange(e => {
					if (e.rawUpdated.concat(e.rawAdded).some(file => file.path.endsWith('.commit'))) {
						this.updatesCheck.schedule();
					}
				}));
			}
		}
		this.updates = new Map((await this.dataPackages.updates(juliaVersion)).map(update => [update.name, update]));
		this.refresh();
	}

	/**
	 * The message of the User view while it lists nothing, and New Connection, drawn as a welcome view is
	 * (whose text cannot be coloured): the names of the package and the engines in the Pollis yellow.
	 */
	private renderEmpty(parent: HTMLElement): HTMLElement {
		const empty = dom.append(parent, dom.$('.welcome-view-content.databases-empty'));
		const message = dom.append(empty, dom.$('p'));
		const names = ['DBInterface.jl', 'DuckDB', 'ODBC', 'PostgreSQL', 'SQLite'];
		const text = localize('databases.empty', "No databases of your own yet. They open in the Julia REPL through {0}: {1}, {2}, {3} and {4}. Once connected, their tables and columns appear here.", '{0}', '{1}', '{2}', '{3}', '{4}');
		// The split keeps the placeholders' numbers at the odd places
		for (const [index, part] of text.split(/\{(?<name>\d)\}/).entries()) {
			if (index % 2) {
				dom.append(message, dom.$('span.package-name', undefined, names[Number(part)]));
			} else if (part) {
				message.append(part);
			}
		}
		const button = this._register(new Button(dom.append(empty, dom.$('.button-container')), { ...defaultButtonStyles }));
		button.label = localize('databases.empty.newConnection', "New Connection");
		this._register(button.onDidClick(() => this.commandService.executeCommand(NEW_CONNECTION_COMMAND_ID)));
		return empty;
	}

	/** Show the tables of connection `id` below it, connecting it first if the REPL does not hold it. */
	showTables(id: string): void {
		const item = this.connections.get(id);
		if (this.tree && item) {
			this.tree.expand(item);
			this.tree.setFocus([item]);
		}
	}

	/** Hide the tables of connection `id`. */
	hideTables(id: string): void {
		const item = this.connections.get(id);
		if (this.tree && item) {
			this.tree.collapse(item);
		}
	}

	private onDidToggleConnection(item: DatabaseItem & { kind: 'connection' }, expanded: boolean): void {
		// A database opened is no longer marked updated
		const name = item.profile?.name;
		if (expanded && name && this.updates.delete(name)) {
			this.dataPackages.markOpened(name);
		}
		if (!expanded) {
			this.pending.delete(item.id);
		} else if (item.session) {
			this.expandSingleSchema(item.id);
		} else if (item.profile && !this.pending.has(item.id)) {
			this.pending.add(item.id);
			this.commandService.executeCommand(CONNECT_DATABASE_COMMAND_ID, itemArg(item));
			this.refresh();
			return;
		}
		// The row's Show / Hide Tables button follows the new state.
		if (this.tree?.hasElement(item)) {
			this.tree.rerender(item);
		}
	}

	/** A single schema (DuckDB's `main`, SQLite) starts expanded, its tables read if they are not. */
	private expandSingleSchema(id: string): void {
		const schemas = this.databaseConnectionsService.getSession(id)?.schemas ?? [];
		if (schemas.length === 1) {
			this.expanded.add(`${id}/${schemas[0].name}`);
			if (schemas[0].unread) {
				this.openSchema(id, schemas[0].name);
			}
		}
	}

	/** Have the REPL read the tables of `schema` of connection `id`, which show below it once it has. */
	private openSchema(id: string, schema: string): void {
		const key = `${id}/${schema}`;
		if (!this.pendingSchemas.has(key)) {
			this.pendingSchemas.add(key);
			this.commandService.executeCommand(OPEN_SCHEMA_COMMAND_ID, { id, schema } satisfies IDatabaseItemArg);
			this.refresh();
		}
	}

	private refresh(): void {
		// A schema whose tables the REPL has read, or that is gone, is no longer waited for.
		for (const key of this.pendingSchemas) {
			const [id, ...name] = key.split('/');
			const schema = this.databaseConnectionsService.getSession(id)?.schemas.find(s => s.name === name.join('/'));
			if (!schema?.unread) {
				this.pendingSchemas.delete(key);
			}
		}
		for (const id of this.pending) {
			if (this.databaseConnectionsService.getSession(id)) {
				this.pending.delete(id);
				this.expandSingleSchema(id);
			}
		}
		// A connection the REPL lets go folds back up.
		for (const id of this.expanded) {
			if (!id.includes('/') && !this.pending.has(id) && !this.databaseConnectionsService.getSession(id)) {
				this.expanded.delete(id);
			}
		}
		if (this.tree && this.root) {
			this.tree.setChildren(null, this.connectionElements());
			const listsNothing = !!this.empty && !this.connections.size;
			this.empty?.classList.toggle('hidden', !listsNothing);
			this.treeContainer?.classList.toggle('hidden', listsNothing);
			this.layoutTree();
		}
	}

	/**
	 * The ids of the connections the view lists: the built-in databases, in alphabetical order, those of the activity of
	 * Pollis, or the user's saved profiles followed by the connections shown from the REPL.
	 */
	private connectionIds(): string[] {
		const profiles = this.databaseConnectionsService.getConnections().filter(p => databaseGroupOf(p) === this.group());
		const listed = (this.group() === 'builtin' ? [...profiles].sort((a, b) => a.name.localeCompare(b.name)) : profiles).map(p => p.id);
		if (this.group() !== 'user') {
			return listed;
		}
		const saved = new Set(profiles.map(p => p.id));
		const shown = this.databaseConnectionsService.getSessions().filter(s => !saved.has(s.id)).sort((a, b) => a.name.localeCompare(b.name));
		return [...listed, ...shown.map(s => s.id)];
	}

	/** The connections of {@link connectionIds}, each with its schemas below it. */
	private connectionElements(): IObjectTreeElement<DatabaseItem>[] {
		this.connections.clear();
		return this.connectionIds().map(id => {
			const item: DatabaseItem & { kind: 'connection' } = { kind: 'connection', id, profile: this.databaseConnectionsService.getConnection(id), session: this.databaseConnectionsService.getSession(id) };
			this.connections.set(id, item);
			const children: IObjectTreeElement<DatabaseItem>[] = item.session
				? this.schemaElements(id, item.session)
				: this.pending.has(id) ? [{ element: { kind: 'message', id, message: localize('connection.connecting', "Connecting in the Julia REPL...") } }] : [];
			return { element: item, children, collapsible: !!item.session || !!item.profile, collapsed: !this.expanded.has(id) };
		});
	}

	private schemaElements(id: string, session: IDatabaseSession): IObjectTreeElement<DatabaseItem>[] {
		if (session.error) {
			return [{ element: { kind: 'message', id, message: session.error } }];
		}
		if (!session.schemas.length) {
			return [{ element: { kind: 'message', id, message: localize('connection.empty', "No tables yet. Create one in the REPL, then click Refresh.") } }];
		}
		const collapsible = (item: DatabaseItem, children: IObjectTreeElement<DatabaseItem>[]): IObjectTreeElement<DatabaseItem> =>
			children.length ? { element: item, children, collapsible: true, collapsed: !this.expanded.has(itemId(item)) } : { element: item };
		return session.schemas.map(schema => schema.unread || schema.error
			// Its tables are read when it is opened; until then, or if they could not be, a line says so
			? {
				element: { kind: 'schema', id, schema },
				children: schema.error
					? [{ element: { kind: 'message', id, schema: schema.name, message: schema.error } }]
					: this.pendingSchemas.has(`${id}/${schema.name}`) ? [{ element: { kind: 'message', id, schema: schema.name, message: localize('schema.reading', "Reading its tables in the Julia REPL...") } }] : [],
				collapsible: true,
				collapsed: !this.expanded.has(`${id}/${schema.name}`),
			}
			: collapsible({ kind: 'schema', id, schema }, schema.tables.map(table => collapsible(
				{ kind: 'table', id, schema: schema.name, table },
				table.columns.map(column => ({ element: { kind: 'column', id, schema: schema.name, table: table.name, column } })),
			))));
	}

	private itemContext(item: DatabaseItem): [string, string | boolean][] {
		return [
			[DatabaseItemKind.key, item.kind],
			[DatabaseItemConnected.key, !!this.databaseConnectionsService.getSession(item.id)],
			[DatabaseItemSaved.key, !!this.databaseConnectionsService.getConnection(item.id)],
			[DatabaseItemBuiltin.key, !!this.databaseConnectionsService.getConnection(item.id)?.builtin],
			[DatabaseItemExpanded.key, this.expanded.has(item.id)],
			[DatabaseItemId.key, item.id],
			[DatabaseItemWritable.key, isWritableConnection(this.databaseConnectionsService.getConnection(item.id))],
		];
	}

	private onContextMenu(e: ITreeContextMenuEvent<DatabaseItem | null>): void {
		if (e.element && e.element.kind !== 'message') {
			this.showItemMenu(e.element, e.anchor);
		}
	}

	private showItemMenu(item: DatabaseItem, anchor: ITreeContextMenuEvent<DatabaseItem>['anchor']): void {
		const contextKeyService = this.contextKeyService.createOverlay(this.itemContext(item));
		const actions = getFlatContextMenuActions(this.menuService.getMenuActions(DatabaseConnectionContextMenu, contextKeyService, { arg: itemArg(item), shouldForwardArgs: true }));
		this.contextMenuService.showContextMenu({
			getAnchor: () => anchor,
			getActions: () => actions,
		});
	}

	override focus(): void {
		super.focus();
		this.tree?.domFocus();
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
		this.lastSize = { height, width };
		this.layoutTree();
	}

	private layoutTree(): void {
		if (this.lastSize) {
			this.tree?.layout(this.lastSize.height, this.lastSize.width);
		}
	}
}

/**
 * The databases built into Pollis, which come with it and change only when Pollis rebuilds them: PollisDatasets,
 * PollisJournals, PollisReferences, PollisBenchmarks and PollisDocuments.
 */
export class BuiltinDatabasesView extends DatabaseConnectionsView {

	static readonly ID = 'pollis.databases.builtin';

	protected override group(): DatabaseGroup {
		return 'builtin';
	}
}

/** The databases of the activity of Pollis, which it records as you work: PollisRSS and Comparisons. */
export class ActivityDatabasesView extends DatabaseConnectionsView {

	static readonly ID = 'pollis.databases.activity';

	protected override group(): DatabaseGroup {
		return 'activity';
	}
}

/** The user's own databases: the saved connections and those shown from the REPL with `PollisDB.show`. */
export class UserDatabasesView extends DatabaseConnectionsView {

	static readonly ID = 'pollis.databases.connections';

	protected override group(): DatabaseGroup {
		return 'user';
	}
}

/** The view that lists the connection of `profile`: Pollis Built-In, Pollis Activity or User. */
export function databasesViewIdOf(profile: IDatabaseConnectionProfile | undefined): string {
	const group = databaseGroupOf(profile);
	return group === 'builtin' ? BuiltinDatabasesView.ID : group === 'activity' ? ActivityDatabasesView.ID : UserDatabasesView.ID;
}
