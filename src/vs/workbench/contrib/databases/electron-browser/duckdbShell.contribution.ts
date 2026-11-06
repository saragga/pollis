/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Codicon } from '../../../../base/common/codicons.js';
import { FileAccess } from '../../../../base/common/network.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-browser/environmentService.js';
import { ITerminalService } from '../../terminal/browser/terminal.js';
import { DATABASES_VIEW_CONTAINER_ID } from '../browser/connectionsView.js';

/** The duckdb> shell, which Electron runs as Node through bootstrap-fork. */
const DUCKDB_SHELL_ENTRYPOINT = 'vs/workbench/contrib/databases/node/duckdbShellMain';

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.databases.newDuckDBTerminal',
			title: localize2('databases.newDuckDBTerminal', "New DuckDB Terminal"),
			category: localize2('databases.category', "Databases"),
			icon: Codicon.terminal,
			f1: true,
			menu: { id: MenuId.ViewContainerTitle, when: ContextKeyExpr.equals('viewContainer', DATABASES_VIEW_CONTAINER_ID), group: 'navigation', order: 3 },
		});
	}

	/** Opens the shell on an in-memory database, or on the DuckDB file `file`. */
	async run(accessor: ServicesAccessor, file?: string): Promise<void> {
		const terminalService = accessor.get(ITerminalService);
		const environmentService = accessor.get(INativeWorkbenchEnvironmentService);
		const instance = await terminalService.createTerminal({
			config: {
				name: localize('databases.duckdbRepl', "DuckDB REPL"),
				executable: environmentService.execPath,
				args: [FileAccess.asFileUri('bootstrap-fork.js').fsPath, ...(typeof file === 'string' ? [file] : [])],
				env: { ELECTRON_RUN_AS_NODE: '1', VSCODE_ESM_ENTRYPOINT: DUCKDB_SHELL_ENTRYPOINT },
				// The icon of the button that opens it, as the Julia REPL has
				icon: Codicon.terminal,
				// Owned as the Julia REPL is, by the feature that opens it: the terminal shows no hint of its own
				// (Show suggestions) after the prompt, and never relaunches the shell when the environment changes
				isExtensionOwnedTerminal: true,
			},
		});
		terminalService.setActiveInstance(instance);
		await terminalService.revealTerminal(instance);
		await instance.focusWhenReady(true);
	}
});
