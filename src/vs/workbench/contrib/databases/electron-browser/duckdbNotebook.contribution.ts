/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AsyncIterableProducer } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { FileAccess, Schemas } from '../../../../base/common/network.js';
import { escape } from '../../../../base/common/strings.js';
import { URI } from '../../../../base/common/uri.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator, IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IUtilityProcessWorkerWorkbenchService } from '../../../services/utilityProcess/electron-browser/utilityProcessWorkerWorkbenchService.js';
import { getNotebookEditorFromEditorPane } from '../../notebook/browser/notebookBrowser.js';
import { CellExecutionUpdateType } from '../../notebook/common/notebookExecutionService.js';
import { INotebookExecutionStateService } from '../../notebook/common/notebookExecutionStateService.js';
import { IOutputDto } from '../../notebook/common/notebookCommon.js';
import { NOTEBOOK_KERNEL } from '../../notebook/common/notebookContextKeys.js';
import { INotebookKernel, INotebookKernelChangeEvent, INotebookKernelService, VariablesResult } from '../../notebook/common/notebookKernelService.js';
import { INotebookService } from '../../notebook/common/notebookService.js';
import { DUCKDB_NOTEBOOK_CHANNEL, DuckDBNotebookResult, IDuckDBNotebookEngine, IDuckDBNotebookRun } from '../common/duckdbNotebook.js';
import { sqlAssignedName } from '../common/duckdbSql.js';

/** The kernel's id, which the notebook toolbar's Restart is shown for. */
const DUCKDB_KERNEL_ID = 'pollis.duckdbSql';
/** The notebooks the kernel runs: Jupyter notebooks, .ipynb. */
const JUPYTER_NOTEBOOK = 'jupyter-notebook';

const IDuckDBNotebookEngineService = createDecorator<IDuckDBNotebookEngineService>('duckdbNotebookEngineService');

/** The DuckDB of the notebooks, run by a utility process started at the first cell, and again when it has ended. */
interface IDuckDBNotebookEngineService extends IDuckDBNotebookEngine {
	readonly _serviceBrand: undefined;
	/** Whether the process runs: a notebook has a connection only then. */
	readonly started: boolean;
	/** The execution order of the notebook's next cell: 1 at its first cell and after a restart. */
	nextExecutionOrder(notebook: string): number;
	/** A new connection for the notebook at its next cell, and the execution order from 1. */
	restart(notebook: string): Promise<void>;
}

class DuckDBNotebookEngineService extends Disposable implements IDuckDBNotebookEngineService {

	declare readonly _serviceBrand: undefined;

	// The proxy kept in an object: awaited itself, its `then` would be taken for a method of the process, never answered
	private engine: Promise<{ readonly proxy: IDuckDBNotebookEngine }> | undefined;
	/** The execution order of each notebook, by its URI. */
	private readonly order = new Map<string, number>();

	constructor(
		@IUtilityProcessWorkerWorkbenchService private readonly utilityProcessWorkerWorkbenchService: IUtilityProcessWorkerWorkbenchService,
	) {
		super();
	}

	get started(): boolean {
		return !!this.engine;
	}

	private get(): Promise<{ readonly proxy: IDuckDBNotebookEngine }> {
		this.engine ??= (async () => {
			const worker = this._register(await this.utilityProcessWorkerWorkbenchService.createWorker({
				moduleId: 'vs/workbench/contrib/databases/node/duckdbNotebookMain',
				type: 'duckdbNotebook',
				name: 'duckdb-notebook',
			}));
			worker.onDidTerminate.then(() => this.engine = undefined);
			return { proxy: ProxyChannel.toService<IDuckDBNotebookEngine>(worker.client.getChannel(DUCKDB_NOTEBOOK_CHANNEL)) };
		})();
		return this.engine;
	}

	async run(notebook: string, sql: string, file: string | undefined): Promise<IDuckDBNotebookRun> {
		return (await this.get()).proxy.run(notebook, sql, file);
	}

	async interrupt(notebook: string): Promise<void> {
		if (this.engine) {
			await (await this.engine).proxy.interrupt(notebook);
		}
	}

	async close(notebook: string): Promise<void> {
		if (this.engine) {
			await (await this.engine).proxy.close(notebook);
		}
	}

	nextExecutionOrder(notebook: string): number {
		const order = (this.order.get(notebook) ?? 0) + 1;
		this.order.set(notebook, order);
		return order;
	}

	async restart(notebook: string): Promise<void> {
		this.order.delete(notebook);
		await this.close(notebook);
	}
}

registerSingleton(IDuckDBNotebookEngineService, DuckDBNotebookEngineService, InstantiationType.Delayed);

/** How long a statement took: 0.024 s. */
function secondsText(ms: number): string {
	return localize('duckdbNotebook.seconds', "{0} s", (ms / 1000).toFixed(3));
}

function rowsText(rows: number): string {
	return rows === 1 ? localize('duckdbNotebook.oneRow', "1 row") : localize('duckdbNotebook.rows', "{0} rows", rows);
}

/** The style of a result table, in the colours of the theme, which the output's webview has as variables. */
const TABLE_STYLE = `<style>
.pollis-duckdb { font-family: var(--vscode-editor-font-family, monospace); font-size: 12px; }
.pollis-duckdb .scroll { overflow-x: auto; max-width: 100%; }
.pollis-duckdb table { border-collapse: collapse; }
.pollis-duckdb th { text-align: left; font-weight: 600; padding: 3px 10px; border-bottom: 1px solid var(--vscode-editorWidget-border, #8884); white-space: nowrap; vertical-align: bottom; }
.pollis-duckdb th .type { display: block; font-weight: 400; font-size: 11px; opacity: 0.6; }
.pollis-duckdb td { text-align: left; padding: 2px 10px; border-bottom: 1px solid var(--vscode-editorWidget-border, #8882); white-space: nowrap; max-width: 40em; overflow: hidden; text-overflow: ellipsis; }
.pollis-duckdb td.number { text-align: right; }
.pollis-duckdb td.null, .pollis-duckdb tr.gap td { opacity: 0.5; }
.pollis-duckdb tr.gap td { text-align: center; }
.pollis-duckdb .note { margin-top: 4px; opacity: 0.7; }
</style>`;

/** Types whose values are aligned right, as numbers are. */
const NUMBER_TYPE = /^(TINYINT|SMALLINT|INTEGER|BIGINT|HUGEINT|UTINYINT|USMALLINT|UINTEGER|UBIGINT|UHUGEINT|FLOAT|DOUBLE|DECIMAL)/;

/** A result's rows as a table, with each column's type under its name, and the count and time under the table. */
function rowsHtml(result: DuckDBNotebookResult & { kind: 'rows' }): string {
	const numeric = result.types.map(type => NUMBER_TYPE.test(type));
	const row = (values: readonly string[]) => `<tr>${values.map((value, j) => `<td class="${value === 'NULL' ? 'null' : numeric[j] ? 'number' : ''}">${escape(value)}</td>`).join('')}</tr>`;
	const head = `<tr>${result.names.map((name, j) => `<th>${escape(name)}<span class="type">${escape(result.types[j])}</span></th>`).join('')}</tr>`;
	const gap = result.last.length ? `<tr class="gap">${result.names.map(() => '<td>&#8942;</td>').join('')}</tr>` : '';
	const shown = result.first.length + result.last.length;
	const note = shown < result.count
		? localize('duckdbNotebook.shown', "{0}, the first {1} and the last {2} shown · {3}", rowsText(result.count), result.first.length, result.last.length, secondsText(result.ms))
		: `${rowsText(result.count)} · ${secondsText(result.ms)}`;
	return `<div class="pollis-duckdb">${TABLE_STYLE}<div class="scroll"><table><thead>${head}</thead><tbody>${result.first.map(row).join('')}${gap}${result.last.map(row).join('')}</tbody></table></div><div class="note">${escape(note)}</div></div>`;
}

/** The same rows as text, separated by tabs, for a renderer that does not show HTML. */
function rowsPlainText(result: DuckDBNotebookResult & { kind: 'rows' }): string {
	return [result.names, ...result.first, ...(result.last.length ? [result.names.map(() => '...'), ...result.last] : [])].map(values => values.join('\t')).join('\n')
		+ `\n${rowsText(result.count)} · ${secondsText(result.ms)}`;
}

/** The outputs of a cell: a table for each result with rows, a line for each that changed rows, the error last. */
function outputsOf(run: IDuckDBNotebookRun): IOutputDto[] {
	const outputs: IOutputDto[] = [];
	if (run.problems?.length) {
		outputs.push({ outputId: generateUuid(), outputs: [{ mime: 'application/vnd.code.notebook.stderr', data: VSBuffer.fromString(run.problems.join('\n') + '\n') }] });
	}
	for (const result of run.results) {
		if (result.kind === 'rows') {
			outputs.push({
				outputId: generateUuid(), outputs: [
					{ mime: 'text/html', data: VSBuffer.fromString(rowsHtml(result)) },
					{ mime: 'text/plain', data: VSBuffer.fromString(rowsPlainText(result)) },
				]
			});
		} else {
			const text = result.rows === 1
				? localize('duckdbNotebook.oneRowChanged', "1 row changed · {0}", secondsText(result.ms))
				: localize('duckdbNotebook.rowsChanged', "{0} rows changed · {1}", result.rows, secondsText(result.ms));
			outputs.push({ outputId: generateUuid(), outputs: [{ mime: 'application/vnd.code.notebook.stdout', data: VSBuffer.fromString(text + '\n') }] });
		}
	}
	if (run.error) {
		outputs.push({ outputId: generateUuid(), outputs: [{ mime: 'application/vnd.code.notebook.error', data: VSBuffer.fromString(JSON.stringify({ name: 'DuckDB', message: run.error, stack: '' })) }] });
	}
	return outputs;
}

/**
 * DuckDB SQL (Pollis), a kernel of Jupyter notebooks: it runs their SQL cells on DuckDB, the cells of a notebook on one
 * connection, so that a table one cell creates is there for the next.
 */
class DuckDBNotebookKernel extends Disposable implements INotebookKernel {

	readonly id = DUCKDB_KERNEL_ID;
	readonly viewType = JUPYTER_NOTEBOOK;
	readonly extension = new ExtensionIdentifier('pollis.duckdb');
	readonly localResourceRoot = FileAccess.asFileUri('vs/workbench/contrib/databases');
	readonly preloadUris: URI[] = [];
	readonly preloadProvides: string[] = [];
	private readonly onDidChangeEmitter = this._register(new Emitter<INotebookKernelChangeEvent>());
	readonly onDidChange: Event<INotebookKernelChangeEvent> = this.onDidChangeEmitter.event;

	label = localize('duckdbNotebook.label', "DuckDB SQL (Pollis)");
	description = localize('duckdbNotebook.description', "SQL cells on DuckDB, with the databases of Pollis");
	detail = localize('duckdbNotebook.detail', "The cells of a notebook share one in-memory database; the databases of Pollis are attached read-only.");
	supportedLanguages = ['sql'];
	implementsInterrupt = true;
	implementsExecutionOrder = true;
	hasVariableProvider = false;

	/** Notebooks whose cells were cancelled: the rest of the cells asked for are not run. */
	private readonly cancelled = new Set<string>();

	constructor(
		@IDuckDBNotebookEngineService private readonly engine: IDuckDBNotebookEngineService,
		@INotebookExecutionStateService private readonly executionStateService: INotebookExecutionStateService,
		@INotebookService private readonly notebookService: INotebookService,
	) {
		super();
		// A notebook closed: its connection, and its in-memory database, go with it
		this._register(notebookService.onWillRemoveNotebookDocument(notebook => {
			if (this.engine.started) {
				this.engine.restart(notebook.uri.toString());
			}
		}));
	}

	async executeNotebookCellsRequest(uri: URI, cellHandles: number[]): Promise<void> {
		const notebook = this.notebookService.getNotebookTextModel(uri);
		if (!notebook) {
			return;
		}
		const key = uri.toString();
		this.cancelled.delete(key);
		const file = uri.scheme === Schemas.file ? uri.fsPath : undefined;
		for (const handle of cellHandles) {
			const execution = this.executionStateService.createCellExecution(uri, handle);
			const cell = notebook.cells.find(candidate => candidate.handle === handle);
			if (!cell || this.cancelled.has(key)) {
				execution.complete({});
				continue;
			}
			execution.confirm();
			const order = this.engine.nextExecutionOrder(key);
			const started = Date.now();
			execution.update([
				{ editType: CellExecutionUpdateType.ExecutionState, executionOrder: order, runStartTime: started },
				{ editType: CellExecutionUpdateType.Output, cellHandle: handle, outputs: [] },
			]);
			const sql = cell.getValue();
			const assigned = sqlAssignedName(sql);
			let run: IDuckDBNotebookRun;
			try {
				run = assigned
					? { results: [], error: localize('duckdbNotebook.assignment', "`{0} :=` hands a result to Julia and runs in Julia notebooks; here, write `CREATE TEMP TABLE {0} AS SELECT ...`", assigned) }
					: await this.engine.run(key, sql, file);
			} catch (err) {
				// The process ended under the cell
				run = { results: [], error: String((err as Error)?.message ?? err) };
			}
			execution.update([{ editType: CellExecutionUpdateType.Output, cellHandle: handle, outputs: outputsOf(run) }]);
			execution.complete({ runEndTime: Date.now(), lastRunSuccess: !run.error });
		}
	}

	async cancelNotebookCellExecution(uri: URI, _cellHandles: number[]): Promise<void> {
		this.cancelled.add(uri.toString());
		await this.engine.interrupt(uri.toString());
	}

	provideVariables(_notebookUri: URI, _parentId: number | undefined, _kind: 'named' | 'indexed', _start: number, _token: CancellationToken): AsyncIterableProducer<VariablesResult> {
		return AsyncIterableProducer.EMPTY;
	}
}

/** Registers DuckDB SQL (Pollis) among the kernels of Jupyter notebooks. */
class DuckDBNotebookKernelContribution extends Disposable implements IWorkbenchContribution {
	static readonly ID = 'workbench.contrib.pollisDuckDBNotebookKernel';

	constructor(
		@INotebookKernelService notebookKernelService: INotebookKernelService,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super();
		const kernel = this._register(instantiationService.createInstance(DuckDBNotebookKernel));
		this._register(notebookKernelService.registerKernel(kernel));
	}
}

registerWorkbenchContribution2(DuckDBNotebookKernelContribution.ID, DuckDBNotebookKernelContribution, WorkbenchPhase.AfterRestored);

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.duckdbNotebook.restart',
			title: localize2('duckdbNotebook.restart', "Restart"),
			tooltip: localize('duckdbNotebook.restartTooltip', "Restart DuckDB SQL (Pollis): a new, empty in-memory database for this notebook"),
			icon: Codicon.debugRestart,
			menu: { id: MenuId.NotebookToolbar, group: 'navigation/execute', order: 2, when: ContextKeyExpr.equals(NOTEBOOK_KERNEL.key, DUCKDB_KERNEL_ID) },
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const uri = getNotebookEditorFromEditorPane(accessor.get(IEditorService).activeEditorPane)?.textModel?.uri;
		if (uri) {
			await accessor.get(IDuckDBNotebookEngineService).restart(uri.toString());
		}
	}
});
