/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../base/common/buffer.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { CancellationError, isCancellationError } from '../../../../base/common/errors.js';
import { basename, joinPath } from '../../../../base/common/resources.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProgressService, ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { IViewContainersRegistry, IViewsRegistry, ViewContainerLocation, Extensions as ViewExtensions } from '../../../common/views.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { autoSelectJuliaKernel, sendToJuliaRepl } from '../../model/browser/handlers/model.handler.js';
import { insertCellAtIndex } from '../../notebook/browser/controller/cellOperations.js';
import { getNotebookEditorFromEditorPane, IActiveNotebookEditor } from '../../notebook/browser/notebookBrowser.js';
import { NotebookViewModel } from '../../notebook/browser/viewModel/notebookViewModelImpl.js';
import { CellKind } from '../../notebook/common/notebookCommon.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { IDatabaseConnectionsService } from '../common/databaseConnections.js';
import { DatabaseExportFormat, DatabaseTaskTarget, generateBrowseCode, generateConnectionCode, generateExportTaskCode, generateImportTaskCode, generatePreviewCode, generateQueryTaskCode, generateSaveTaskCode, generateSessionConnectCode, generateSessionDisconnectCode, generateOpenSchemaCode, generateSessionRefreshCode, getDatabaseDriver, IDatabaseConnectionProfile, isValidJuliaIdentifier, JOURNALS_DATABASE_ID, NEW_CONNECTION_COMMAND_ID, NEW_WRDS_CONNECTION_COMMAND_ID, SHOW_CONNECTIONS_COMMAND_ID, sqlName, WRDS_PRESET } from '../common/databaseDrivers.js';
import { openConnectionEditor } from './connectionEditor.js';
import './wrdsPage.js';
import { DatabaseConnectionsService } from './databaseConnectionsService.js';
import { JournalMetricsReader, readCsv, readXlsx, yearOfFileName } from './journalMetrics.js';
import './journalMetricsPage.js';
import { BuiltinDatabasesView, CONNECT_DATABASE_COMMAND_ID, DATABASES_VIEW_CONTAINER_ID, DatabaseConnectionContextMenu, DatabaseConnectionsView, DatabasesViewPaneContainer, databasesViewIdOf, UserDatabasesView, DatabaseItemConnected, DatabaseItemExpanded, DatabaseItemId, DatabaseItemInlineMenu, DatabaseItemBuiltin, DatabaseItemKind, DatabaseItemSaved, DatabaseItemWritable, DatabasesNewConnectionMenu, DISCONNECT_DATABASE_COMMAND_ID, IDatabaseItemArg, BROWSE_TABLE_COMMAND_ID, OPEN_SCHEMA_COMMAND_ID, PREVIEW_TABLE_COMMAND_ID, REFRESH_DATABASE_COMMAND_ID } from './connectionsView.js';

registerSingleton(IDatabaseConnectionsService, DatabaseConnectionsService, InstantiationType.Delayed);

// --- Databases container (secondary side bar) and its Pollis Built-In and User views

const databasesViewIcon = registerIcon('databases-view-icon', Codicon.database, localize('databasesViewIcon', "View icon of the Databases view."));

const databasesViewContainer = Registry.as<IViewContainersRegistry>(ViewExtensions.ViewContainersRegistry).registerViewContainer({
	id: DATABASES_VIEW_CONTAINER_ID,
	title: localize2('databases.viewContainer.label', "Databases"),
	icon: databasesViewIcon,
	ctorDescriptor: new SyncDescriptor(DatabasesViewPaneContainer),
	storageId: DATABASES_VIEW_CONTAINER_ID,
	// After the Julia views, which extensions register from order 101 on: session state first, then its databases.
	order: 1000,
}, ViewContainerLocation.AuxiliaryBar);

const viewsRegistry = Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry);
// Both always shown, so the container has no Views menu to hide them
viewsRegistry.registerViews([{
	id: BuiltinDatabasesView.ID,
	name: localize2('databases.builtin', "Pollis Built-In"),
	containerIcon: databasesViewIcon,
	ctorDescriptor: new SyncDescriptor(BuiltinDatabasesView),
	canToggleVisibility: false,
	canMoveView: true,
	order: 1,
}, {
	id: UserDatabasesView.ID,
	name: localize2('databases.user', "User"),
	containerIcon: databasesViewIcon,
	ctorDescriptor: new SyncDescriptor(UserDatabasesView),
	canToggleVisibility: false,
	canMoveView: true,
	order: 2,
}], databasesViewContainer);

// --- Commands

/** The title of the Databases container, which holds the buttons of both its views. */
const databasesTitle = ContextKeyExpr.equals('viewContainer', DATABASES_VIEW_CONTAINER_ID);
const onConnection = DatabaseItemKind.isEqualTo('connection');
const onSavedConnection = ContextKeyExpr.and(onConnection, DatabaseItemSaved);
const onEditableConnection = ContextKeyExpr.and(onSavedConnection, DatabaseItemBuiltin.negate());
const onWritableConnection = ContextKeyExpr.and(onConnection, DatabaseItemWritable);
const onSavedTable = ContextKeyExpr.and(DatabaseItemKind.isEqualTo('table'), DatabaseItemSaved);

/** The view that lists connection `id`. */
function databasesViewOf(accessor: ServicesAccessor, id: string): DatabaseConnectionsView | undefined {
	const viewId = databasesViewIdOf(accessor.get(IDatabaseConnectionsService).getConnection(id));
	return accessor.get(IViewsService).getViewWithId<DatabaseConnectionsView>(viewId) ?? undefined;
}

/** The saved profile an item command was invoked on. */
function profileOf(accessor: ServicesAccessor, arg: IDatabaseItemArg | undefined): IDatabaseConnectionProfile | undefined {
	return arg ? accessor.get(IDatabaseConnectionsService).getConnection(arg.id) : undefined;
}

/** The notebook a task of the view adds its cell to: the one in the active editor, or else a visible one. */
function taskNotebook(editorService: IEditorService): IActiveNotebookEditor | undefined {
	for (const pane of [editorService.activeEditorPane, ...editorService.visibleEditorPanes]) {
		const editor = getNotebookEditorFromEditorPane(pane);
		if (editor?.hasModel() && !editor.isReadOnly) {
			return editor;
		}
	}
	return undefined;
}

/**
 * What runs a task of the view on a database: its code goes into a new Julia cell, below the active
 * cell of the open notebook, for the user to edit and run; with no notebook open, to the Julia REPL.
 */
function databaseTask(accessor: ServicesAccessor): (profile: IDatabaseConnectionProfile, code: (target: DatabaseTaskTarget, connected: boolean) => string) => Promise<void> {
	const commandService = accessor.get(ICommandService);
	const databaseConnectionsService = accessor.get(IDatabaseConnectionsService);
	const editorService = accessor.get(IEditorService);
	const notebookKernelService = accessor.get(INotebookKernelService);
	return async (profile, code) => {
		const editor = taskNotebook(editorService);
		if (!editor) {
			await sendToJuliaRepl(code('repl', !!databaseConnectionsService.getSession(profile.id)), commandService);
			return;
		}
		const viewModel = editor.getViewModel() as NotebookViewModel;
		const active = editor.getActiveCell();
		const index = active ? (editor.getCellIndex(active) ?? viewModel.length - 1) + 1 : viewModel.length;
		const cell = insertCellAtIndex(viewModel, index, code('notebook', false), 'julia', CellKind.Code, undefined, [], true, true);
		autoSelectJuliaKernel(editor.textModel, notebookKernelService);
		await editor.revealInCenterIfOutsideViewport(cell);
		await editor.focusNotebookCell(cell, 'editor');
	};
}

/** The names of the tables of a database open in the Julia REPL, in lower case: SQL names are not case-sensitive. */
function tableNames(accessor: ServicesAccessor, id: string): Set<string> {
	return new Set(accessor.get(IDatabaseConnectionsService).getSession(id)?.schemas.flatMap(schema => schema.tables.map(table => table.name.toLowerCase())) ?? []);
}

/** Whether rows go into the table `table` that exists already, rather than replacing it; undefined when the user cancels. */
async function askAppend(quickInputService: IQuickInputService, table: string): Promise<boolean | undefined> {
	const pick = await quickInputService.pick([
		{ label: localize('databases.task.replace', "Replace the Table"), append: false },
		{ label: localize('databases.task.append', "Add the Rows to the Table"), append: true },
	], { placeHolder: localize('databases.task.exists', "The table {0} exists already", table) });
	return pick?.append;
}

/** A table name made of `name`, e.g. of a file name: letters, digits and underscores, not starting with a digit. */
function tableNameOf(name: string): string {
	const table = name.replace(/\.[^.]*$/, '').replace(/\W+/g, '_').replace(/^_+|_+$/g, '');
	return !table ? 'data' : /^\d/.test(table) ? '_' + table : table;
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: NEW_CONNECTION_COMMAND_ID,
			title: localize2('databases.newConnection', "New Connection"),
			category: localize2('databases.category', "Databases"),
			icon: Codicon.plus,
			f1: true,
			// The view shows it as "+ New", with a dropdown of the engines (DatabasesNewConnectionMenu).
			menu: { id: MenuId.ViewContainerTitle, when: databasesTitle, group: 'navigation', order: 1 },
		});
	}
	run(accessor: ServicesAccessor): void {
		openConnectionEditor(accessor);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: NEW_WRDS_CONNECTION_COMMAND_ID,
			title: localize2('databases.newWrdsConnection', "New WRDS Connection"),
			category: localize2('databases.category', "Databases"),
			f1: true,
		});
	}
	run(accessor: ServicesAccessor): void {
		openConnectionEditor(accessor, undefined, WRDS_PRESET);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: SHOW_CONNECTIONS_COMMAND_ID,
			title: localize2('databases.showConnections', "Show Connections"),
			category: localize2('databases.category', "Databases"),
			f1: true,
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		await accessor.get(IViewsService).openView(UserDatabasesView.ID, true);
	}
});

for (const [order, driver] of (['duckdb', 'odbc', 'postgres', 'sqlite'] as const).entries()) {
	const label = getDatabaseDriver(driver).label;
	registerAction2(class extends Action2 {
		constructor() {
			super({
				id: `${NEW_CONNECTION_COMMAND_ID}.${driver}`,
				title: localize2('databases.newConnectionOf', "New {0} Connection", label),
				category: localize2('databases.category', "Databases"),
				f1: true,
			});
		}
		run(accessor: ServicesAccessor): void {
			openConnectionEditor(accessor, undefined, driver);
		}
	});
	// The menu lists only the engine names.
	MenuRegistry.appendMenuItem(DatabasesNewConnectionMenu, { command: { id: `${NEW_CONNECTION_COMMAND_ID}.${driver}`, title: label }, group: 'navigation', order });
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.databases.showTables',
			title: localize2('databases.showTables', "Show Tables"),
			icon: Codicon.table,
			menu: { id: DatabaseItemInlineMenu, when: ContextKeyExpr.and(onConnection, DatabaseItemExpanded.negate()), group: 'inline', order: 2 },
		});
	}
	run(accessor: ServicesAccessor, arg: IDatabaseItemArg): void {
		databasesViewOf(accessor, arg.id)?.showTables(arg.id);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.databases.hideTables',
			title: localize2('databases.hideTables', "Hide Tables"),
			icon: Codicon.collapseAll,
			menu: { id: DatabaseItemInlineMenu, when: ContextKeyExpr.and(onConnection, DatabaseItemExpanded), group: 'inline', order: 2 },
		});
	}
	run(accessor: ServicesAccessor, arg: IDatabaseItemArg): void {
		databasesViewOf(accessor, arg.id)?.hideTables(arg.id);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: REFRESH_DATABASE_COMMAND_ID,
			title: localize2('databases.refresh', "Refresh Schemas"),
			category: localize2('databases.category', "Databases"),
			icon: Codicon.refresh,
			f1: true,
			menu: [
				{ id: MenuId.ViewContainerTitle, when: databasesTitle, group: 'navigation', order: 2 },
				{ id: DatabaseConnectionContextMenu, when: ContextKeyExpr.and(onConnection, DatabaseItemConnected), group: '1_connect', order: 3 },
				{ id: DatabaseItemInlineMenu, when: ContextKeyExpr.and(onConnection, DatabaseItemConnected), group: 'inline', order: 3 },
			],
		});
	}
	async run(accessor: ServicesAccessor, arg?: IDatabaseItemArg): Promise<void> {
		// Only a REPL that holds connections has anything to refresh; do not start one for nothing.
		if (accessor.get(IDatabaseConnectionsService).getSessions().length) {
			await sendToJuliaRepl(generateSessionRefreshCode(arg?.id), accessor.get(ICommandService));
		}
	}
});

// Opening a schema listed without its tables, in the Connections view, has the REPL read them
CommandsRegistry.registerCommand(OPEN_SCHEMA_COMMAND_ID, async (accessor: ServicesAccessor, arg: IDatabaseItemArg) => {
	if (arg.schema !== undefined) {
		await sendToJuliaRepl(generateOpenSchemaCode(arg.id, arg.schema), accessor.get(ICommandService));
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: CONNECT_DATABASE_COMMAND_ID,
			title: localize2('databases.connect', "Connect in Julia REPL"),
			icon: Codicon.plug,
			menu: [
				{ id: DatabaseConnectionContextMenu, when: ContextKeyExpr.and(onSavedConnection, DatabaseItemConnected.negate()), group: '1_connect', order: 1 },
				{ id: DatabaseItemInlineMenu, when: ContextKeyExpr.and(onSavedConnection, DatabaseItemConnected.negate()), group: 'inline', order: 1 },
			],
		});
	}
	async run(accessor: ServicesAccessor, arg: IDatabaseItemArg): Promise<void> {
		const profile = profileOf(accessor, arg);
		if (profile) {
			await sendToJuliaRepl(generateSessionConnectCode(profile, false), accessor.get(ICommandService));
		}
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: DISCONNECT_DATABASE_COMMAND_ID,
			title: localize2('databases.disconnect', "Disconnect"),
			icon: Codicon.debugDisconnect,
			menu: [
				{ id: DatabaseConnectionContextMenu, when: ContextKeyExpr.and(onConnection, DatabaseItemConnected), group: '1_connect', order: 2 },
				{ id: DatabaseItemInlineMenu, when: ContextKeyExpr.and(onConnection, DatabaseItemConnected), group: 'inline', order: 1 },
			],
		});
	}
	async run(accessor: ServicesAccessor, arg: IDatabaseItemArg): Promise<void> {
		if (arg?.id) {
			await sendToJuliaRepl(generateSessionDisconnectCode(arg.id), accessor.get(ICommandService));
		}
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: BROWSE_TABLE_COMMAND_ID,
			title: localize2('databases.browse', "Open in Table Viewer"),
			icon: Codicon.openPreview,
			menu: [
				{ id: DatabaseConnectionContextMenu, when: DatabaseItemKind.isEqualTo('table'), group: '1_connect', order: 1 },
				{ id: DatabaseItemInlineMenu, when: DatabaseItemKind.isEqualTo('table'), group: 'inline', order: 1 },
			],
		});
	}
	async run(accessor: ServicesAccessor, arg: IDatabaseItemArg): Promise<void> {
		if (arg?.schema !== undefined && arg.table !== undefined) {
			await sendToJuliaRepl(generateBrowseCode(arg.id, arg.schema, arg.table), accessor.get(ICommandService));
		}
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: PREVIEW_TABLE_COMMAND_ID,
			title: localize2('databases.preview', "Preview Rows in Julia REPL"),
			menu: { id: DatabaseConnectionContextMenu, when: DatabaseItemKind.isEqualTo('table'), group: '1_connect', order: 2 },
		});
	}
	async run(accessor: ServicesAccessor, arg: IDatabaseItemArg): Promise<void> {
		if (arg?.schema !== undefined && arg.table !== undefined) {
			await sendToJuliaRepl(generatePreviewCode(arg.id, arg.schema, arg.table), accessor.get(ICommandService));
		}
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.databases.copyName',
			title: localize2('databases.copyName', "Copy Name"),
			menu: { id: DatabaseConnectionContextMenu, when: ContextKeyExpr.or(DatabaseItemKind.isEqualTo('schema'), DatabaseItemKind.isEqualTo('table'), DatabaseItemKind.isEqualTo('column')), group: '2_copy', order: 1 },
		});
	}
	async run(accessor: ServicesAccessor, arg: IDatabaseItemArg): Promise<void> {
		const name = arg.column !== undefined
			? sqlName(arg.column)
			: arg.table !== undefined && arg.schema !== undefined
				? `${sqlName(arg.schema)}.${sqlName(arg.table)}`
				: arg.schema !== undefined ? sqlName(arg.schema) : undefined;
		if (name) {
			await accessor.get(IClipboardService).writeText(name);
		}
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.databases.copyConnectionCode',
			title: localize2('databases.copyCode', "Copy Connection Code"),
			icon: Codicon.copy,
			menu: [
				{ id: DatabaseConnectionContextMenu, when: onSavedConnection, group: '2_copy', order: 2 },
				// The code opens the connection, so the row offers it only while the database is not connected.
				{ id: DatabaseItemInlineMenu, when: ContextKeyExpr.and(onSavedConnection, DatabaseItemConnected.negate()), group: 'inline', order: 5 },
			],
		});
	}
	async run(accessor: ServicesAccessor, arg: IDatabaseItemArg): Promise<void> {
		const profile = profileOf(accessor, arg);
		if (profile) {
			await accessor.get(IClipboardService).writeText(generateConnectionCode(profile));
		}
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.databases.editConnection',
			title: localize2('databases.edit', "Edit Connection"),
			icon: Codicon.edit,
			menu: [
				{ id: DatabaseConnectionContextMenu, when: onEditableConnection, group: '3_edit', order: 1 },
				{ id: DatabaseItemInlineMenu, when: onEditableConnection, group: 'inline', order: 4 },
			],
		});
	}
	run(accessor: ServicesAccessor, arg: IDatabaseItemArg): void {
		const profile = profileOf(accessor, arg);
		if (profile) {
			openConnectionEditor(accessor, profile);
		}
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.databases.deleteConnection',
			title: localize2('databases.delete', "Delete Connection"),
			icon: Codicon.close,
			menu: [
				{ id: DatabaseConnectionContextMenu, when: onEditableConnection, group: '3_edit', order: 2 },
				{ id: DatabaseItemInlineMenu, when: onEditableConnection, group: 'inline', order: 9 },
			],
		});
	}
	async run(accessor: ServicesAccessor, arg: IDatabaseItemArg): Promise<void> {
		const databaseConnectionsService = accessor.get(IDatabaseConnectionsService);
		const profile = profileOf(accessor, arg);
		if (!profile) {
			return;
		}
		const { confirmed } = await accessor.get(IDialogService).confirm({
			message: localize('databases.delete.confirm', "Delete the connection '{0}'?", profile.name),
			detail: databaseConnectionsService.getSession(profile.id)
				? localize('databases.delete.detailConnected', "Only the saved profile is removed. The database itself is not touched, and the connection stays open in the Julia REPL.")
				: localize('databases.delete.detail', "Only the saved profile is removed. The database itself is not touched."),
			primaryButton: localize({ key: 'databases.delete.button', comment: ['&& denotes a mnemonic'] }, "&&Delete"),
		});
		if (confirmed) {
			databaseConnectionsService.deleteConnection(profile.id);
		}
	}
});

// --- Tasks: Query, Import File, Save Table and Export, as notebook cells

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.databases.learnMore',
			title: localize2('databases.learnMore', "Learn More: SQL Databases"),
			icon: Codicon.book,
			menu: { id: MenuId.ViewContainerTitle, when: databasesTitle, group: 'navigation', order: 3 },
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		// The SQL Databases panel, with the Example Code, Next Steps and Learn More of the tasks
		await accessor.get(ICommandService).executeCommand('chiara.explore.conn.sql');
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.databases.query',
			title: localize2('databases.query', "Query"),
			icon: Codicon.search,
			menu: [
				{ id: DatabaseConnectionContextMenu, when: ContextKeyExpr.or(onSavedConnection, onSavedTable), group: '0_tasks', order: 1 },
				{ id: DatabaseItemInlineMenu, when: onSavedConnection, group: 'inline', order: 6 },
				{ id: DatabaseItemInlineMenu, when: onSavedTable, group: 'inline', order: 2 },
			],
		});
	}
	async run(accessor: ServicesAccessor, arg: IDatabaseItemArg): Promise<void> {
		const profile = profileOf(accessor, arg);
		if (profile) {
			await databaseTask(accessor)(profile, (target, connected) => generateQueryTaskCode(profile, target, connected, arg.schema, arg.table));
		}
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.databases.importFile',
			title: localize2('databases.importFile', "Import File..."),
			icon: Codicon.desktopDownload,
			menu: [
				{ id: DatabaseConnectionContextMenu, when: onWritableConnection, group: '0_tasks', order: 2 },
				{ id: DatabaseItemInlineMenu, when: onWritableConnection, group: 'inline', order: 7 },
			],
		});
	}
	async run(accessor: ServicesAccessor, arg: IDatabaseItemArg): Promise<void> {
		const profile = profileOf(accessor, arg);
		if (!profile) {
			return;
		}
		const fileDialogService = accessor.get(IFileDialogService);
		const quickInputService = accessor.get(IQuickInputService);
		const tables = tableNames(accessor, profile.id);
		const task = databaseTask(accessor);
		const [file] = await fileDialogService.showOpenDialog({
			title: localize('databases.importFile.title', "Import a File into {0}", profile.name),
			openLabel: localize({ key: 'databases.importFile.open', comment: ['&& denotes a mnemonic'] }, "&&Import"),
			canSelectFiles: true,
			canSelectMany: false,
			filters: [{ name: localize('databases.importFile.filter', "CSV, Parquet or JSON File"), extensions: ['csv', 'tsv', 'txt', 'parquet', 'json', 'jsonl', 'ndjson'] }],
		}) ?? [];
		if (!file) {
			return;
		}
		const table = (await quickInputService.input({
			prompt: localize('databases.importFile.table', "The table of {0} the rows of {1} go into", profile.name, basename(file)),
			value: tableNameOf(basename(file)),
			validateInput: async value => value.trim() ? undefined : localize('databases.task.tableRequired', "A table name"),
		}))?.trim();
		if (!table) {
			return;
		}
		const append = tables.has(table.toLowerCase()) ? await askAppend(quickInputService, table) : false;
		if (append !== undefined) {
			await task(profile, (target, connected) => generateImportTaskCode(profile, target, connected, file.fsPath, table, append));
		}
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.databases.saveTable',
			title: localize2('databases.saveTable', "Save Table..."),
			icon: Codicon.save,
			menu: [
				{ id: DatabaseConnectionContextMenu, when: onWritableConnection, group: '0_tasks', order: 3 },
				{ id: DatabaseItemInlineMenu, when: onWritableConnection, group: 'inline', order: 8 },
			],
		});
	}
	async run(accessor: ServicesAccessor, arg: IDatabaseItemArg): Promise<void> {
		const profile = profileOf(accessor, arg);
		if (!profile) {
			return;
		}
		const quickInputService = accessor.get(IQuickInputService);
		const tables = tableNames(accessor, profile.id);
		const task = databaseTask(accessor);
		const variable = (await quickInputService.input({
			prompt: localize('databases.saveTable.variable', "The Julia table to save in {0}, such as a named tuple of columns", profile.name),
			value: 'tbl',
			validateInput: async value => isValidJuliaIdentifier(value.trim()) ? undefined : localize('databases.saveTable.variableInvalid', "The name of a Julia variable"),
		}))?.trim();
		if (!variable) {
			return;
		}
		const table = (await quickInputService.input({
			prompt: localize('databases.saveTable.table', "The table of {0} that {1} is saved as", profile.name, variable),
			value: variable,
			validateInput: async value => value.trim() ? undefined : localize('databases.task.tableRequired', "A table name"),
		}))?.trim();
		if (!table) {
			return;
		}
		const append = tables.has(table.toLowerCase()) ? await askAppend(quickInputService, table) : false;
		if (append !== undefined) {
			await task(profile, (target, connected) => generateSaveTaskCode(profile, target, connected, variable, table, append));
		}
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.databases.export',
			title: localize2('databases.export', "Export..."),
			icon: Codicon.export,
			menu: [
				{ id: DatabaseConnectionContextMenu, when: onSavedTable, group: '0_tasks', order: 2 },
				{ id: DatabaseItemInlineMenu, when: onSavedTable, group: 'inline', order: 3 },
			],
		});
	}
	async run(accessor: ServicesAccessor, arg: IDatabaseItemArg): Promise<void> {
		const profile = profileOf(accessor, arg);
		const { schema, table } = arg;
		if (!profile || schema === undefined || table === undefined) {
			return;
		}
		const fileDialogService = accessor.get(IFileDialogService);
		const task = databaseTask(accessor);
		// DuckDB writes Parquet, CSV and JSON itself; from the other engines, CSV.jl writes CSV.
		const duckdb = profile.driver === 'duckdb';
		const file = await fileDialogService.showSaveDialog({
			title: localize('databases.export.title', "Export {0}", table),
			defaultUri: joinPath(await fileDialogService.defaultFilePath(), `${tableNameOf(table)}.${duckdb ? 'parquet' : 'csv'}`),
			filters: duckdb
				? [{ name: 'Parquet', extensions: ['parquet'] }, { name: 'CSV', extensions: ['csv'] }, { name: 'JSON', extensions: ['json'] }]
				: [{ name: 'CSV', extensions: ['csv'] }],
		});
		if (!file) {
			return;
		}
		const format: DatabaseExportFormat = !duckdb || /\.csv$/i.test(file.path) ? 'csv' : /\.json$/i.test(file.path) ? 'json' : 'parquet';
		await task(profile, (target, connected) => generateExportTaskCode(profile, target, connected, schema, table, file.fsPath, format));
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.databases.importJournalMetrics',
			title: localize2('databases.importJournalMetrics', "Import Journal Metrics..."),
			category: localize2('databases.category', "Databases"),
			f1: true,
			menu: [{ id: DatabaseConnectionContextMenu, when: ContextKeyExpr.and(onConnection, DatabaseItemId.isEqualTo(JOURNALS_DATABASE_ID)), group: '4_import', order: 1 }],
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const fileDialogService = accessor.get(IFileDialogService);
		const fileService = accessor.get(IFileService);
		const notificationService = accessor.get(INotificationService);
		const progressService = accessor.get(IProgressService);
		const quickInputService = accessor.get(IQuickInputService);
		const folder = joinPath(accessor.get(IPathService).userHome({ preferLocal: true }), '.pollis', 'journals', 'metrics');
		const [file] = await fileDialogService.showOpenDialog({
			title: localize('databases.importJournalMetrics.title', "Import Journal Metrics"),
			openLabel: localize({ key: 'databases.importJournalMetrics.open', comment: ['&& denotes a mnemonic'] }, "&&Import"),
			canSelectFiles: true,
			canSelectMany: false,
			filters: [{ name: localize('databases.importJournalMetrics.filter', "Journal Citation Reports, Scopus, SCImago, CWTS or ABDC Export"), extensions: ['csv', 'xlsx'] }],
		}) ?? [];
		if (!file) {
			return;
		}
		const name = basename(file);
		// Written under a name the metrics view does not read (it reads *.jsonl), then moved into place
		const tmp = joinPath(folder, `.import-${Date.now()}.tmp`);
		try {
			const { source, count } = await progressService.withProgress({ location: ProgressLocation.Notification, title: localize('databases.importJournalMetrics.progress', "Importing {0}", name) }, async progress => {
				const content = (await fileService.readFile(file)).value;
				const xlsx = /\.xlsx$/i.test(name);
				const csv = xlsx ? undefined : readCsv(content.toString().replace(/^\ufeff/, ''));
				// SCImago's CSV files separate with semicolons and write decimal commas
				const reader = new JournalMetricsReader(csv?.delimiter === ';');
				reader.defaultYear = yearOfFileName(name);
				let lines: string[] = [];
				let count = 0;
				let askedYear = false;
				await fileService.writeFile(tmp, VSBuffer.fromString(''));
				const flush = async () => {
					await fileService.writeFile(tmp, VSBuffer.fromString(lines.join('')), { append: true });
					lines = [];
					progress.report({ message: localize('databases.importJournalMetrics.rows', "{0} rows", count) });
				};
				const onRow = async (row: string[]) => {
					const line = reader.read(row);
					// Once the header is found: the year of a file that has none, asked for once
					if (reader.detected && !askedYear && !reader.hasYear && reader.defaultYear === undefined) {
						askedYear = true;
						const year = await quickInputService.input({
							prompt: localize('databases.importJournalMetrics.year', "The year of the metrics in {0}", name),
							placeHolder: String(new Date().getFullYear() - 1),
							validateInput: async value => /^(19|20)\d{2}$/.test(value.trim()) ? undefined : localize('databases.importJournalMetrics.yearInvalid', "A year, such as 2024"),
						});
						if (year === undefined) {
							throw new CancellationError();
						}
						reader.defaultYear = Number(year.trim());
					}
					if (line) {
						lines.push(JSON.stringify(line) + '\n');
						if (++count % 20000 === 0) {
							await flush();
						}
					}
				};
				if (csv) {
					for (const row of csv.rows) {
						await onRow(row);
					}
				} else {
					await readXlsx(content.buffer, onRow);
				}
				if (!reader.detected) {
					throw new Error('header');
				}
				await flush();
				const target = joinPath(folder, `${reader.detected}-${name.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '-')}.jsonl`);
				await fileService.move(tmp, target, true);
				return { source: reader.detected, count };
			});
			notificationService.info(localize('databases.importJournalMetrics.done', "Imported {0} rows of {1} metrics from {2}. They are in the metrics and journal_metrics views of PollisJournals.", count, source, name));
		} catch (error) {
			await fileService.del(tmp).catch(() => undefined);
			if (isCancellationError(error)) {
				return;
			}
			const message = error instanceof Error ? error.message : '';
			notificationService.error(message === 'header'
				? localize('databases.importJournalMetrics.unknown', "{0} is not a file Pollis can import: it reads the exports of Journal Citation Reports (JIF), Scopus (CiteScore), SCImago (SJR) and CWTS (SNIP), and the ABDC Journal Quality List, as CSV or Excel files.", name)
				: message === 'zip' || message === 'sheet'
					? localize('databases.importJournalMetrics.notExcel', "{0} could not be read as an Excel file.", name)
					: localize('databases.importJournalMetrics.failed', "{0} could not be imported: {1}", name, message));
		}
	}
});
