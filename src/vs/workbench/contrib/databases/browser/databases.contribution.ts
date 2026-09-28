/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Codicon } from '../../../../base/common/codicons.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import { IViewContainersRegistry, IViewsRegistry, ViewContainerLocation, Extensions as ViewExtensions } from '../../../common/views.js';
import { sendToJuliaRepl } from '../../model/browser/handlers/model.handler.js';
import { IDatabaseConnectionsService } from '../common/databaseConnections.js';
import { generateConnectionCode, generatePreviewCode, generateSessionConnectCode, generateSessionDisconnectCode, generateSessionRefreshCode, IDatabaseConnectionProfile, quoteSqlName } from '../common/databaseDrivers.js';
import { openConnectionEditor } from './connectionEditor.js';
import { DatabaseConnectionsService } from './databaseConnectionsService.js';
import { CONNECT_DATABASE_COMMAND_ID, DatabaseConnectionContextMenu, DatabaseConnectionsView, DatabaseItemConnected, DatabaseItemInlineMenu, DatabaseItemKind, DatabaseItemSaved, DISCONNECT_DATABASE_COMMAND_ID, IDatabaseItemArg, PREVIEW_TABLE_COMMAND_ID, REFRESH_DATABASE_COMMAND_ID } from './connectionsView.js';

registerSingleton(IDatabaseConnectionsService, DatabaseConnectionsService, InstantiationType.Delayed);

// --- Databases container (secondary side bar) and Connections view

const DATABASES_VIEW_CONTAINER_ID = 'workbench.view.pollis.databases';
const NEW_CONNECTION_COMMAND_ID = 'pollis.databases.newConnection';

const databasesViewIcon = registerIcon('databases-view-icon', Codicon.database, localize('databasesViewIcon', "View icon of the Databases view."));

const databasesViewContainer = Registry.as<IViewContainersRegistry>(ViewExtensions.ViewContainersRegistry).registerViewContainer({
	id: DATABASES_VIEW_CONTAINER_ID,
	title: localize2('databases.viewContainer.label', "Databases"),
	icon: databasesViewIcon,
	ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [DATABASES_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
	storageId: DATABASES_VIEW_CONTAINER_ID,
	order: 2,
}, ViewContainerLocation.AuxiliaryBar);

const viewsRegistry = Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry);
viewsRegistry.registerViews([{
	id: DatabaseConnectionsView.ID,
	name: localize2('databases.connections', "Connections"),
	containerIcon: databasesViewIcon,
	ctorDescriptor: new SyncDescriptor(DatabaseConnectionsView),
	canToggleVisibility: false,
	canMoveView: true,
}], databasesViewContainer);

viewsRegistry.registerViewWelcomeContent(DatabaseConnectionsView.ID, {
	content: localize('databases.welcome', "No database connections yet. Connections open in the Julia REPL through DBInterface.jl: DuckDB, SQLite and PostgreSQL. Once connected, their tables and columns appear here.\n[New Connection](command:{0})", NEW_CONNECTION_COMMAND_ID),
});

// --- Commands

const connectionsViewTitle = ContextKeyExpr.equals('view', DatabaseConnectionsView.ID);
const onConnection = DatabaseItemKind.isEqualTo('connection');
const onSavedConnection = ContextKeyExpr.and(onConnection, DatabaseItemSaved);

/** The saved profile an item command was invoked on. */
function profileOf(accessor: ServicesAccessor, arg: IDatabaseItemArg | undefined): IDatabaseConnectionProfile | undefined {
	return arg ? accessor.get(IDatabaseConnectionsService).getConnection(arg.id) : undefined;
}

/** `name`, quoted only when SQL needs it. */
function sqlName(name: string): string {
	return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : quoteSqlName(name);
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: NEW_CONNECTION_COMMAND_ID,
			title: localize2('databases.newConnection', "New Connection"),
			category: localize2('databases.category', "Databases"),
			icon: Codicon.add,
			f1: true,
			menu: { id: MenuId.ViewTitle, when: connectionsViewTitle, group: 'navigation', order: 1 },
		});
	}
	run(accessor: ServicesAccessor): void {
		openConnectionEditor(accessor);
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
				{ id: MenuId.ViewTitle, when: connectionsViewTitle, group: 'navigation', order: 2 },
				{ id: DatabaseConnectionContextMenu, when: ContextKeyExpr.and(onConnection, DatabaseItemConnected), group: '1_connect', order: 3 },
				{ id: DatabaseItemInlineMenu, when: ContextKeyExpr.and(onConnection, DatabaseItemConnected), group: 'inline', order: 1 },
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
				{ id: DatabaseItemInlineMenu, when: ContextKeyExpr.and(onConnection, DatabaseItemConnected), group: 'inline', order: 2 },
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
			id: PREVIEW_TABLE_COMMAND_ID,
			title: localize2('databases.preview', "Preview Rows in Julia REPL"),
			icon: Codicon.openPreview,
			menu: [
				{ id: DatabaseConnectionContextMenu, when: DatabaseItemKind.isEqualTo('table'), group: '1_connect', order: 1 },
				{ id: DatabaseItemInlineMenu, when: DatabaseItemKind.isEqualTo('table'), group: 'inline', order: 1 },
			],
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
			menu: { id: DatabaseConnectionContextMenu, when: onSavedConnection, group: '2_copy', order: 2 },
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
			menu: { id: DatabaseConnectionContextMenu, when: onSavedConnection, group: '3_edit', order: 1 },
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
			menu: { id: DatabaseConnectionContextMenu, when: onSavedConnection, group: '3_edit', order: 2 },
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
