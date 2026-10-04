/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as dom from '../../../../base/browser/dom.js';
import { ActionBar, IActionViewItem } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { IDropdownMenuActionViewItemOptions } from '../../../../base/browser/ui/dropdown/dropdownActionViewItem.js';
import { IListVirtualDelegate } from '../../../../base/browser/ui/list/list.js';
import { IObjectTreeElement, ITreeContextMenuEvent, ITreeNode, ITreeRenderer } from '../../../../base/browser/ui/tree/tree.js';
import { Action, IAction } from '../../../../base/common/actions.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { localize } from '../../../../nls.js';
import { DropdownWithPrimaryActionViewItem } from '../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js';
import { createActionViewItem, getActionBarActions, getFlatContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { IMenuService, MenuId, MenuItemAction } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { WorkbenchObjectTree } from '../../../../platform/list/browser/listService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IViewPaneOptions, ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IDatabaseColumn, IDatabaseConnectionsService, IDatabaseSchema, IDatabaseSession, IDatabaseTable } from '../common/databaseConnections.js';
import './media/connectionsView.css';
import { describeConnection, getDatabaseDriver, IDatabaseConnectionProfile, isInMemoryConnection } from '../common/databaseDrivers.js';

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
/** Whether the tables of the item's connection are shown below it. */
export const DatabaseItemExpanded = new RawContextKey<boolean>('pollisDatabaseExpanded', false);

export const NEW_CONNECTION_COMMAND_ID = 'pollis.databases.newConnection';
export const CONNECT_DATABASE_COMMAND_ID = 'pollis.databases.connect';
export const DISCONNECT_DATABASE_COMMAND_ID = 'pollis.databases.disconnect';
export const REFRESH_DATABASE_COMMAND_ID = 'pollis.databases.refresh';
export const PREVIEW_TABLE_COMMAND_ID = 'pollis.databases.previewTable';

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
	| { readonly kind: 'message'; readonly id: string; readonly message: string };

function itemId(item: DatabaseItem): string {
	switch (item.kind) {
		case 'connection': return item.id;
		case 'schema': return `${item.id}/${item.schema.name}`;
		case 'table': return `${item.id}/${item.schema}/${item.table.name}`;
		case 'column': return `${item.id}/${item.schema}/${item.table}/${item.column.name}`;
		case 'message': return `${item.id}/!message`;
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

class ItemRenderer implements ITreeRenderer<DatabaseItem, void, IItemTemplate> {

	static readonly TEMPLATE_ID = 'databaseItem';
	readonly templateId = ItemRenderer.TEMPLATE_ID;

	constructor(
		private readonly itemContext: (item: DatabaseItem) => [string, string | boolean][],
		private readonly hoverService: IHoverService,
		private readonly menuService: IMenuService,
		private readonly contextKeyService: IContextKeyService,
		private readonly instantiationService: IInstantiationService,
	) { }

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
		template.row.classList.toggle('connected', item.kind === 'connection' && !!item.session);
		template.row.classList.toggle('disconnected', item.kind === 'connection' && !item.session);
		template.row.classList.toggle('message', item.kind === 'message');
		switch (item.kind) {
			case 'connection': {
				name = connectionName(item.profile, item.session);
				const { profile, session } = item;
				const inMemory = !!profile && isInMemoryConnection(profile);
				icon = inMemory ? Codicon.zap : Codicon.database;
				// The list shows only the names; the hover tells the engine, the location and the connection.
				if (profile?.builtin) {
					description = localize('connection.builtin', "built-in");
				} else if (inMemory) {
					description = localize('connection.inMemory', "in-memory");
				}
				if (profile?.builtin) {
					hover = session
						? localize('connection.builtin.hover.connected', "{0} (DuckDB)\nThe database built into Pollis: the PollisDatasets, loaded in memory.\nConnected in the Julia REPL as {1}. Click to browse its tables.", name, profile.variable)
						: localize('connection.builtin.hover', "{0} (DuckDB)\nThe database built into Pollis: the PollisDatasets, loaded in memory.\nNot connected. Click to connect in the Julia REPL as {1}.", name, profile.variable);
				} else if (profile) {
					const driver = getDatabaseDriver(profile.driver).label;
					hover = session
						? localize('connection.hover.connected', "{0} ({1})\n{2}\nConnected in the Julia REPL as {3}. Click to browse its tables.", name, driver, describeConnection(profile), profile.variable)
						: localize('connection.hover', "{0} ({1})\n{2}\nNot connected. Click to connect in the Julia REPL as {3}.", name, driver, describeConnection(profile), profile.variable);
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
				description = localize('schema.tables', "{0} tables", item.schema.tables.length);
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
		if (hover) {
			template.disposables.add(this.hoverService.setupDelayedHover(template.row, { content: hover }));
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


/** The title's New Connection button, labelled "+ New", with a dropdown that opens it on a given engine. */
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
 * The Connections view lists the saved connections and those shown from the REPL with
 * `PollisDB.show`. Expanding a connection (clicking it, its twistie or Show Tables) connects it if
 * needed and shows the tree of its schemas, tables and columns in place, below the connection.
 */
export class DatabaseConnectionsView extends ViewPane {

	static readonly ID = 'pollis.databases.connections';

	private tree: WorkbenchObjectTree<DatabaseItem> | undefined;
	private root: HTMLElement | undefined;
	/** The connection items in the tree by id, the objects the tree knows them by. */
	private readonly connections = new Map<string, DatabaseItem & { kind: 'connection' }>();
	/** Connections expanded while not connected, being connected from the view; their tables show once the REPL reports them. */
	private readonly pending = new Set<string>();
	/** The ids of the expanded items, kept across refreshes. */
	private readonly expanded = new Set<string>();
	private lastSize: { height: number; width: number } | undefined;
	/** The dropdown action of the title's "+ New" button, replaced whenever the title renders it again. */
	private readonly newConnectionDisposables = this._register(new DisposableStore());

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
	) {
		super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
		this._register(this.databaseConnectionsService.onDidChangeConnections(() => this.refresh()));
	}

	override shouldShowWelcome(): boolean {
		return this.databaseConnectionsService.getConnections().length === 0 && this.databaseConnectionsService.getSessions().length === 0;
	}

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);
		this.root = dom.append(container, dom.$('.databases-view'));

		this.tree = this._register(this.instantiationService.createInstance(
			WorkbenchObjectTree<DatabaseItem>,
			'DatabaseConnections',
			dom.append(this.root, dom.$('.databases-tree')),
			new ItemDelegate(),
			[new ItemRenderer(item => this.itemContext(item), this.hoverService, this.menuService, this.contextKeyService, this.instantiationService)],
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
			}
		}));
		this._register(this.tree.onMouseDblClick(e => {
			if (e.element?.kind === 'table') {
				this.commandService.executeCommand(PREVIEW_TABLE_COMMAND_ID, itemArg(e.element));
			}
		}));
		this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
		this.refresh();
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

	/** A single schema (DuckDB's `main`, SQLite) starts expanded. */
	private expandSingleSchema(id: string): void {
		const schemas = this.databaseConnectionsService.getSession(id)?.schemas ?? [];
		if (schemas.length === 1) {
			this.expanded.add(`${id}/${schemas[0].name}`);
		}
	}

	private refresh(): void {
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
			this.layoutTree();
		}
		this._onDidChangeViewWelcomeState.fire();
	}

	/** The saved profiles, then the connections shown from the REPL, each with its schemas below it. */
	private connectionElements(): IObjectTreeElement<DatabaseItem>[] {
		const profiles = this.databaseConnectionsService.getConnections();
		const saved = new Set(profiles.map(p => p.id));
		const shown = this.databaseConnectionsService.getSessions().filter(s => !saved.has(s.id)).sort((a, b) => a.name.localeCompare(b.name));
		this.connections.clear();
		return [...profiles.map(p => p.id), ...shown.map(s => s.id)].map(id => {
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
		return session.schemas.map(schema => collapsible({ kind: 'schema', id, schema }, schema.tables.map(table => collapsible(
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

	override createActionViewItem(action: IAction, options?: IDropdownMenuActionViewItemOptions): IActionViewItem | undefined {
		if (action instanceof MenuItemAction && action.id === NEW_CONNECTION_COMMAND_ID) {
			this.newConnectionDisposables.clear();
			const engines = getFlatContextMenuActions(this.menuService.getMenuActions(DatabasesNewConnectionMenu, this.contextKeyService));
			const dropdown = this.newConnectionDisposables.add(new Action('databases.newConnectionEngines', localize('newConnection.engines', "New Connection To..."), undefined, true));
			return this.instantiationService.createInstance(NewConnectionActionViewItem, action, dropdown, engines, '', { hoverDelegate: options?.hoverDelegate });
		}
		return super.createActionViewItem(action, options);
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
