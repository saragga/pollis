/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Codicon } from '../../../../base/common/codicons.js';
import { KeyCode, KeyMod } from '../../../../base/common/keyCodes.js';
import { Disposable, DisposableMap } from '../../../../base/common/lifecycle.js';
import { FileAccess } from '../../../../base/common/network.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { KeybindingsRegistry, KeybindingWeight } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { IQuickInputService, IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-browser/environmentService.js';
import { IStatusbarEntry, IStatusbarEntryAccessor, IStatusbarService, StatusbarAlignment } from '../../../services/statusbar/browser/statusbar.js';
import { ITerminalInstance, ITerminalService } from '../../terminal/browser/terminal.js';
import { DATABASES_VIEW_CONTAINER_ID } from '../browser/connectionsView.js';
import { JULIA_POLLIS_WINDOW_KEY, RUN_IN_DUCKDB_TERMINAL_COMMAND_ID, runnableSql, sqlStatementAt } from '../common/duckdbSql.js';

/** The duckdb> shell, which Electron runs as Node through bootstrap-fork. */
const DUCKDB_SHELL_ENTRYPOINT = 'vs/workbench/contrib/databases/node/duckdbShellMain';

/** The command of the status bar item: starts the shell, or offers to show, restart or stop it. */
const DUCKDB_REPL_ACTIONS_COMMAND_ID = 'pollis.databases.duckdbReplActions';

/**
 * Opens the shell on an in-memory database, or on the DuckDB file `file`, and shows it, focused unless `focus` is
 * false. The shell attaches the Julia Session of this window, whose id it is given.
 */
async function openDuckDBTerminal(terminalService: ITerminalService, environmentService: INativeWorkbenchEnvironmentService, contextKeyService: IContextKeyService, file: string | undefined, focus = true): Promise<ITerminalInstance> {
	const window = contextKeyService.getContextKeyValue<string>(JULIA_POLLIS_WINDOW_KEY);
	const instance = await terminalService.createTerminal({
		config: {
			name: localize('databases.duckdbRepl', "DuckDB REPL"),
			executable: environmentService.execPath,
			args: [FileAccess.asFileUri('bootstrap-fork.js').fsPath, ...(file ? [file] : [])],
			env: { ELECTRON_RUN_AS_NODE: '1', VSCODE_ESM_ENTRYPOINT: DUCKDB_SHELL_ENTRYPOINT, ...(window ? { POLLIS_WINDOW: window } : {}) },
			// The icon of the button that opens it, as the Julia REPL has
			icon: Codicon.terminal,
			// Owned as the Julia REPL is, by the feature that opens it: the terminal shows no hint of its own
			// (Show suggestions) after the prompt, and never relaunches the shell when the environment changes
			isExtensionOwnedTerminal: true,
		},
	});
	await showTerminal(terminalService, instance, focus);
	return instance;
}

async function showTerminal(terminalService: ITerminalService, instance: ITerminalInstance, focus = true): Promise<void> {
	terminalService.setActiveInstance(instance);
	await terminalService.revealTerminal(instance, !focus);
	if (focus) {
		await instance.focusWhenReady(true);
	}
}

/** The SQL of the active editor to run: its selection, or the statement at the cursor. */
function sqlOfEditor(codeEditorService: ICodeEditorService): string | undefined {
	const editor = codeEditorService.getFocusedCodeEditor() ?? codeEditorService.getActiveCodeEditor();
	const model = editor?.getModel();
	const selection = editor?.getSelection();
	if (!model || !selection) {
		return undefined;
	}
	return selection.isEmpty()
		? sqlStatementAt(model.getValue(), model.getOffsetAt(selection.getPosition()))
		: runnableSql(model.getValueInRange(selection));
}

/** Whether a terminal runs the duckdb> shell. */
function isDuckDBTerminal(instance: ITerminalInstance): boolean {
	return instance.shellLaunchConfig.env?.VSCODE_ESM_ENTRYPOINT === DUCKDB_SHELL_ENTRYPOINT;
}

/** The DuckDB file a shell opened, or undefined for an in-memory database: the argument after bootstrap-fork. */
function databaseFileOf(instance: ITerminalInstance): string | undefined {
	const args = instance.shellLaunchConfig.args;
	return Array.isArray(args) && args.length > 1 ? args[1] : undefined;
}

// The REPLs of Pollis in the terminal's + menu, after its profiles: Julia REPL and Pollis REPL, its pollis> mode, start
// or show the window's Julia REPL, of the Julia extension; DuckDB REPL opens a duckdb> terminal.
MenuRegistry.appendMenuItems([
	{ id: MenuId.TerminalNewDropdownContext, item: { command: { id: 'language-julia.startREPL', title: localize('databases.terminalMenu.julia', "Julia REPL") }, group: '2_pollis', order: 1 } },
	{ id: MenuId.TerminalNewDropdownContext, item: { command: { id: 'language-julia.startPollisREPL', title: localize('databases.terminalMenu.pollis', "Pollis REPL") }, group: '2_pollis', order: 2 } },
	{ id: MenuId.TerminalNewDropdownContext, item: { command: { id: 'pollis.databases.newDuckDBTerminal', title: localize('databases.terminalMenu.duckdb', "DuckDB REPL") }, group: '2_pollis', order: 3 } },
]);

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
		await openDuckDBTerminal(accessor.get(ITerminalService), accessor.get(INativeWorkbenchEnvironmentService), accessor.get(IContextKeyService), typeof file === 'string' ? file : undefined);
	}
});

/**
 * The DuckDB REPL item of the status bar, after those of the Julia REPL: it starts the duckdb> shell when none
 * is open, and otherwise names in its tooltip the database of the shell used last and offers to show, restart or stop it.
 */
class DuckDBReplStatus extends Disposable implements IWorkbenchContribution {
	static readonly ID = 'workbench.contrib.pollisDuckDBReplStatus';

	/** The duckdb> terminals, the one used last at the end. */
	private readonly shells: ITerminalInstance[] = [];
	private readonly exitListeners = this._register(new DisposableMap<ITerminalInstance>());
	private readonly entry: IStatusbarEntryAccessor;

	constructor(
		@ITerminalService private readonly terminalService: ITerminalService,
		@INativeWorkbenchEnvironmentService private readonly environmentService: INativeWorkbenchEnvironmentService,
		@IContextKeyService private readonly contextKeyService: IContextKeyService,
		@IQuickInputService private readonly quickInputService: IQuickInputService,
		@IStatusbarService statusbarService: IStatusbarService,
		@ICodeEditorService codeEditorService: ICodeEditorService,
	) {
		super();
		// Priority -1: to the right of the items of the Julia extension, which have 0
		this.entry = this._register(statusbarService.addEntry(this.entryOf(), 'pollis.duckdbRepl', StatusbarAlignment.LEFT, -1));
		this._register(CommandsRegistry.registerCommand(DUCKDB_REPL_ACTIONS_COMMAND_ID, () => this.runActions()));
		this._register(CommandsRegistry.registerCommand(RUN_IN_DUCKDB_TERMINAL_COMMAND_ID, (_accessor, sql?: unknown) => this.runSql(typeof sql === 'string' ? runnableSql(sql) : sqlOfEditor(codeEditorService))));
		for (const instance of terminalService.instances) {
			this.track(instance);
		}
		this._register(terminalService.onDidCreateInstance(instance => this.track(instance)));
		this._register(terminalService.onDidDisposeInstance(instance => this.forget(instance)));
		this._register(terminalService.onDidChangeActiveInstance(instance => {
			if (instance && this.shells.includes(instance)) {
				this.shells.splice(this.shells.indexOf(instance), 1);
				this.shells.push(instance);
				this.update();
			}
		}));
	}

	private get current(): ITerminalInstance | undefined {
		return this.shells.at(-1);
	}

	private track(instance: ITerminalInstance): void {
		if (!isDuckDBTerminal(instance) || this.shells.includes(instance)) {
			return;
		}
		this.shells.push(instance);
		// .quit ends the shell before its terminal closes
		this.exitListeners.set(instance, instance.onExit(() => this.forget(instance)));
		this.update();
	}

	private forget(instance: ITerminalInstance): void {
		const index = this.shells.indexOf(instance);
		if (index >= 0) {
			this.shells.splice(index, 1);
			this.exitListeners.deleteAndDispose(instance);
			this.update();
		}
	}

	private update(): void {
		this.entry.update(this.entryOf());
	}

	private entryOf(): IStatusbarEntry {
		const name = localize('databases.duckdbRepl.status.name', "DuckDB REPL");
		const shell = this.current;
		if (!shell) {
			const text = localize('databases.duckdbRepl.status.idle', "DuckDB REPL");
			return { name, text: `$(circle-outline) ${text}`, ariaLabel: text, tooltip: localize('databases.duckdbRepl.status.start', "Start the DuckDB REPL"), command: DUCKDB_REPL_ACTIONS_COMMAND_ID };
		}
		// The database is in the tooltip, as the Julia REPL's threads are, so that the REPLs' items stay short.
		const file = databaseFileOf(shell);
		const text = name;
		const tooltip = file
			? localize('databases.duckdbRepl.status.runningFileTooltip', "DuckDB REPL running on {0}: click for actions (show / restart / stop)", file)
			: localize('databases.duckdbRepl.status.runningTooltip', "DuckDB REPL running on an in-memory database: click for actions (show / restart / stop)");
		return { name, text: `$(circle-filled) ${text}`, ariaLabel: text, tooltip, command: DUCKDB_REPL_ACTIONS_COMMAND_ID };
	}

	/** Runs `sql` in the DuckDB terminal used last, opened on an in-memory database when there is none; the focus stays where it is. */
	private async runSql(sql: string | undefined): Promise<void> {
		if (!sql) {
			return;
		}
		const shell = this.current ?? await openDuckDBTerminal(this.terminalService, this.environmentService, this.contextKeyService, undefined, false);
		if (shell === this.current) {
			await showTerminal(this.terminalService, shell, false);
		}
		await shell.sendText(sql, true);
	}

	private async runActions(): Promise<void> {
		const shell = this.current;
		if (!shell) {
			await openDuckDBTerminal(this.terminalService, this.environmentService, this.contextKeyService, undefined);
			return;
		}
		type Action = 'show' | 'restart' | 'stop';
		const items: (IQuickPickItem & { readonly action: Action })[] = [
			{ label: `$(terminal) ${localize('databases.duckdbRepl.show', "Show REPL")}`, action: 'show' },
			{ label: `$(debug-restart) ${localize('databases.duckdbRepl.restart', "Restart REPL")}`, action: 'restart' },
			{ label: `$(debug-stop) ${localize('databases.duckdbRepl.stop', "Stop REPL")}`, action: 'stop' },
		];
		const pick = await this.quickInputService.pick(items, { placeHolder: localize('databases.duckdbRepl.placeholder', "DuckDB REPL") });
		if (!pick || shell.isDisposed) {
			return;
		}
		switch (pick.action) {
			case 'show':
				await showTerminal(this.terminalService, shell);
				break;
			case 'restart': {
				// Reopened on the same database
				const file = databaseFileOf(shell);
				shell.dispose();
				await openDuckDBTerminal(this.terminalService, this.environmentService, this.contextKeyService, file);
				break;
			}
			case 'stop':
				shell.dispose();
				break;
		}
	}
}

registerWorkbenchContribution2(DuckDBReplStatus.ID, DuckDBReplStatus, WorkbenchPhase.AfterRestored);

const onSqlEditor = ContextKeyExpr.and(ContextKeyExpr.equals('editorLangId', 'sql'), ContextKeyExpr.equals('activeEditor', 'workbench.editor.notebook').negate());

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: { id: RUN_IN_DUCKDB_TERMINAL_COMMAND_ID, title: localize2('databases.runInDuckDBTerminal', "Run in DuckDB Terminal"), category: localize2('databases.category', "Databases") },
	when: onSqlEditor,
});

// The run button of an SQL file, as Julia files have theirs
MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
	command: { id: RUN_IN_DUCKDB_TERMINAL_COMMAND_ID, title: localize2('databases.runInDuckDBTerminal', "Run in DuckDB Terminal"), icon: Codicon.play },
	when: onSqlEditor,
	group: 'navigation',
	order: 1,
});

// Ctrl+Enter, as Julia sends the code at the cursor to its REPL
KeybindingsRegistry.registerKeybindingRule({
	id: RUN_IN_DUCKDB_TERMINAL_COMMAND_ID,
	weight: KeybindingWeight.WorkbenchContrib,
	when: ContextKeyExpr.and(onSqlEditor, ContextKeyExpr.has('editorTextFocus')),
	primary: KeyMod.WinCtrl | KeyCode.Enter,
	win: { primary: KeyMod.CtrlCmd | KeyCode.Enter },
	linux: { primary: KeyMod.CtrlCmd | KeyCode.Enter },
});
