import * as path from 'path'
import * as vscode from 'vscode'
import * as rpc from 'vscode-jsonrpc/node'
import { JuliaKernel } from '../notebook/notebookKernel'
import { g_connection } from './repl'
import { onEvent } from '../utils'

const requestTypeGetTableData = new rpc.RequestType<
    {
        id: string
        startRow: number
        endRow: number
        filterModel: object
        sortModel: object
    },
    string,
    void
>('repl/getTableData')
const clearLazyTable = new rpc.NotificationType<{
    id: string
}>('repl/clearLazyTable')

// Pollis Collaboration: the open table viewers, so that Share Dataset can write the active one out as CSV.
// A table travels as plain CSV text, never as a Julia object; the workbench confirms before sending it.

/** The largest dataset a Collaboration session shares, as in the workbench's collaborationProtocol.ts. */
const MAX_DATASET_BYTES = 5 * 1024 * 1024
/** The rows a lazy table is fetched in, when shared. */
const SHARE_BLOCK_ROWS = 5000

interface TableField {
    name: string
    title?: string
}

interface TableSource {
    name: string
    fields: TableField[]
    /** The rows of a table sent whole. */
    data?: object[]
    /** The rows of a lazy table, fetched from the REPL as the viewer pages through it. */
    fetch?: (startRow: number, endRow: number) => Promise<object[]>
}

const tableSources = new Map<vscode.WebviewPanel, TableSource>()

/** A cell as CSV: missing and nothing left empty, quoted when it holds the delimiter, a quote or a line break. */
function csvField(value: unknown): string {
    const text = value === null || value === undefined || value === 'missing' || value === 'nothing' ? '' : String(value)
    return /[",\r\n]/.test(text) || text !== text.trim() ? `"${text.replace(/"/g, '""')}"` : text
}

/** Shares the active table viewer's table in the Pollis Collaboration session, as CSV. */
export async function shareActiveTable() {
    const source = [...tableSources].find(([panel]) => panel.active)?.[1]
    if (!source) {
        vscode.window.showInformationMessage('Open a Julia table (vscodedisplay) to share it.')
        return
    }
    const lines = [source.fields.map((f) => csvField(f.title ?? f.name)).join(',')]
    let bytes = Buffer.byteLength(lines[0]) + 1
    const add = (rows: object[]) => {
        for (const row of rows) {
            const line = source.fields.map((f) => csvField(row[f.name])).join(',')
            bytes += Buffer.byteLength(line) + 1
            lines.push(line)
        }
        return bytes <= MAX_DATASET_BYTES
    }
    let withinCap = true
    if (source.data) {
        withinCap = add(source.data)
    } else if (source.fetch) {
        try {
            for (let start = 0; withinCap; start += SHARE_BLOCK_ROWS) {
                const rows = await source.fetch(start, start + SHARE_BLOCK_ROWS - 1)
                withinCap = add(rows.slice(0, SHARE_BLOCK_ROWS))
                if (rows.length < SHARE_BLOCK_ROWS) {
                    break
                }
            }
        } catch (err) {
            vscode.window.showWarningMessage('Could not read the table from Julia. The object might have been deleted, or the Julia process is no longer available.')
            return
        }
    }
    if (!withinCap) {
        vscode.window.showInformationMessage(`This table is too large to share in a session (the limit is ${MAX_DATASET_BYTES / 1024 / 1024} MB as CSV): save it as a file and send it the usual way.`)
        return
    }
    const fileName = `${(source.name || 'table').replace(/[\\/:*?"<>|]/g, '_')}.csv`
    await vscode.commands.executeCommand('pollis.collaboration.shareDataset', { fileName, content: lines.join('\n') + '\n' })
}

export function displayTable(payload, context, isLazy = false, kernel?: JuliaKernel) {
    const parsedPayload = JSON.parse(payload)
    const title = parsedPayload.name

    const panel = vscode.window.createWebviewPanel(
        'jlgrid',
        title ? 'Julia Table: ' + title : 'Julia Table',
        {
            preserveFocus: true,
            viewColumn: vscode.ViewColumn.Active,
        },
        {
            enableScripts: true,
            retainContextWhenHidden: true,
        }
    )

    tableSources.set(panel, {
        name: title,
        fields: parsedPayload.schema.fields,
        data: isLazy ? undefined : parsedPayload.data,
        fetch: isLazy
            ? async (startRow, endRow) => {
                const conn = kernel?._msgConnection || g_connection
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data: any = await conn.sendRequest(requestTypeGetTableData, {
                    id: parsedPayload.id,
                    startRow,
                    endRow,
                    filterModel: {},
                    sortModel: [],
                })
                return Array.isArray(data?.rows) ? data.rows : []
            }
            : undefined,
    })
    onEvent(panel.onDidDispose, () => tableSources.delete(panel))

    const uriAgGrid = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'libs', 'ag-grid', 'ag-grid.js'))
    )
    const uriAgGridCSS = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'libs', 'ag-grid', 'ag-grid.css'))
    )
    const theme = vscode.window.activeColorTheme.kind === 1 ? '' : '-dark'
    const uriAgGridThemeCSS = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'libs', 'ag-grid', `ag-grid-balham${theme}.css`))
    )

    let script = `
    <script type="text/javascript">
        const vscodeAPI = acquireVsCodeApi()
        const payload = ${payload};

        function headerTemplateWithLabel(label) {
            return \`
            <div class="ag-cell-label-container" role="presentation">
                <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button" aria-hidden="true"></span>
                <div ref="eLabel" class="ag-header-cell-label" role="presentation">
                    <div class="header-cell-title-container">
                        <span ref="eText" class="ag-header-cell-text">b</span>
                        \${label ? \`<small class="header-cell-subtitle">\${label}</small>\` : ''}
                    </div>
                    <span ref="eFilter" class="ag-header-icon ag-header-label-icon ag-filter-icon" aria-hidden="true"></span>
                    <span ref="eSortOrder" class="ag-header-icon ag-header-label-icon ag-sort-order" aria-hidden="true"></span>
                    <span ref="eSortAsc" class="ag-header-icon ag-header-label-icon ag-sort-ascending-icon" aria-hidden="true"></span>
                    <span ref="eSortDesc" class="ag-header-icon ag-header-label-icon ag-sort-descending-icon" aria-hidden="true"></span>
                    <span ref="eSortNone" class="ag-header-icon ag-header-label-icon ag-sort-none-icon" aria-hidden="true"></span>
                </div>
            </div>
            \`
        }

        const coldefs = payload.schema.fields.map(f => {
            return {
                field: f.name,
                headerName: f.name,
                type: f.ag_type,
                headerTooltip: f.jl_type,
                filter: f.ag_filter,
                sortable: true,
                resizable: true,
                headerComponentParams: {
                    template: headerTemplateWithLabel(f.jl_label)
                }
            }
        });
        coldefs.unshift({
            headerName: 'Row',
            editable: false,
            headerTooltip: '',
            field: '__row__',
            sortable: false,
            type: 'numericColumn',
            cellRenderer: 'rowNumberRenderer',
            resizable: true,
            filter: false,
            pinned: 'left',
            lockPinned: true,
            suppressNavigable: true,
            lockPosition: true,
            suppressMovable: true,
            cellClass: 'row-number-cell'
        })
    `

    if (isLazy) {
        const objectId = parsedPayload.id

        onEvent(panel.onDidDispose, async () => {
            try {
                await g_connection.sendNotification(clearLazyTable, {
                    id: objectId,
                })
            } catch (err) {
                console.debug('Could not dispose of lazy table object on the Julia side: ', err)
            }
        })

        onEvent(panel.webview.onDidReceiveMessage, async (message) => {
            if (message.type === 'getRows') {
                let response
                const conn = kernel?._msgConnection || g_connection
                try {
                    const data = await conn.sendRequest(requestTypeGetTableData, {
                        id: objectId,
                        startRow: message.content.startRow,
                        endRow: message.content.endRow,
                        filterModel: message.content.filterModel,
                        sortModel: message.content.sortModel,
                    })
                    response = {
                        type: 'getRows',
                        id: message.id,
                        data: data,
                    }
                } catch (err) {
                    console.debug('Error while processing message: ', err)

                    let warning: Thenable<string | undefined>
                    const button = 'Close table'
                    if (conn) {
                        warning = vscode.window.showWarningMessage(
                            'Could not fetch table data. The object might have been deleted or modified.',
                            button
                        )
                    } else {
                        warning = vscode.window.showWarningMessage(
                            'Could not fetch table data. The Julia process is no longer available.',
                            button
                        )
                    }

                    warning.then((r) => {
                        if (r === button) {
                            panel.dispose()
                        }
                    })

                    response = {
                        type: 'getRows',
                        id: message.id,
                        data: {
                            error: true,
                        },
                    }
                }
                try {
                    panel.webview.postMessage(response)
                } catch (err) {
                    console.debug('Error while processing message: ', err)
                }
            } else {
                console.debug('invalid message received: ', message)
            }
        })
        script += `
                const requests = {}

                function getRows({startRow, endRow, filterModel, sortModel, successCallback, failCallback}) {
                    const id  = Math.random()
                    vscodeAPI.postMessage({
                        type: 'getRows',
                        id: id,
                        content: {
                            startRow, endRow, filterModel, sortModel
                        }
                    })
                    requests[id] = {
                        success: successCallback,
                        failure: failCallback
                    }
                }
                let didResize = false
                window.addEventListener('message', event => {
                    const message = event.data

                    if (message.type === 'getRows') {
                        const callback = requests[message.id]
                        if (callback !== undefined) {
                            if (message.data.error) {
                                callback.failure()
                            } else {
                                callback.success(message.data.rows, message.data.lastRow)
                                if (!didResize) {
                                    didResize = true
                                    gridOptions.columnApi.autoSizeAllColumns()
                                }
                            }
                            delete requests[message.id]
                        }
                    } else {
                        console.error('invalid message received: ', message)
                    }
                })

                // make sure the block size scales with col number
                const cacheBlockSize = Math.max(Math.round(2000/coldefs.length), 50);
                const gridOptions = {
                    columnDefs: coldefs,
                    maxConcurrentDatasourceRequests: 1,
                    cacheBlockSize: cacheBlockSize,
                    maxBlocksInCache: 100,
                    rowModelType: 'infinite',
                    rowSelection: 'multiple',
                    enableCellTextSelection: true, // to ensure copy events work as expected; text selection is disabled with user-select: none
                    datasource: {
                        getRows,
                        rowCount: payload.rowCount
                    },
                    onFirstDataRendered: event => setTimeout(event.columnApi.autoSizeAllColumns(undefined, false), 200),
                    components: {
                        rowNumberRenderer: RowNumberRenderer
                    },
                    onSortChanged: event => refreshRowRenderer(event),
                    onFilterChanged: event => refreshRowRenderer(event)
                };
                const eGridDiv = document.querySelector('#myGrid');
                new agGrid.Grid(eGridDiv, gridOptions);
            </script>
        `
    } else {
        script += `
                const gridOptions = {
                    columnDefs: coldefs,
                    rowData: payload.data,
                    rowSelection: 'multiple',
                    enableCellTextSelection: true,
                    onFirstDataRendered: event => event.columnApi.autoSizeAllColumns(),
                    components: {
                        rowNumberRenderer: RowNumberRenderer
                    },
                    onSortChanged: event => refreshRowRenderer(event),
                    onFilterChanged: event => refreshRowRenderer(event)
                };
                const eGridDiv = document.querySelector('#myGrid');
                new agGrid.Grid(eGridDiv, gridOptions);
            </script>
        `
    }

    panel.webview.html = `
        <html>
            <head>
                <script src="${uriAgGrid}"></script>
                <link rel="stylesheet" href="${uriAgGridCSS}">
                <link rel="stylesheet" href="${uriAgGridThemeCSS}">
                <style type="text/css">
                    .header-cell-title-container {
                        display: flex;
                        flex-direction: column;
                        align-items: end;
                    }
                    .header-cell-subtitle {
                        font-size: 0.8em;
                        opacity: 0.8;
                    }
                    .row-number {
                        user-select: none;
                        font-weight: bold;
                    }
                    .row-number-cell {
                        background-color: var(--ag-header-background-color);
                    }
                    .row-number-cell .ag-cell-value {
                        flex-grow: 1;
                        text-align: right;
                    }

                    .ag-cell-value {
                        -moz-user-select: none!important;
                        -webkit-user-select: none!important;
                        -ms-user-select: none!important;
                        user-select: none!important;
                    }
                    .ag-root-wrapper {
                        border: 0!important;
                    }
                    .ag-ltr .ag-cell.ag-cell {
                        border-right: 1px solid var(--ag-border-color);
                    }
                    .ag-menu {
                        border-radius: 0!important;
                    }
                    .ag-picker-field-wrapper {
                        border-radius: 0!important;
                    }
                    .ag-picker-field-wrapper:focus {
                        box-shadow: none!important;
                        border: 1px solid var(--ag-input-focus-border-color);
                    }

                    input:focus {
                        box-shadow: none!important;
                    }
                    input {
                        padding: 4px!important;
                    }
                    #myGrid {
                        --ag-header-background-color: var(--vscode-panelSectionHeader-background);
                        --ag-background-color: var(--vscode-panel-background);
                        --ag-odd-row-background-color: rgba(120, 120, 120, 0.03);
                        --ag-row-hover-color: var(--vscode-list-hoverBackground);
                        --ag-header-foreground-color: var(--vscode-foreground);
                        --ag-foreground-color: var(--vscode-foreground);
                        --ag-row-border-color: var(--vscode-panel-border);
                        --ag-border-color: var(--vscode-panel-border);
                        --ag-range-selection-border-color: var(--vscode-inputValidation-infoBorder);
                        --ag-selected-row-background-color: var(--vscode-editor-selectionBackground);
                        --ag-input-focus-border-color: var(--vscode-inputValidation-infoBorder);
                        --ag-input-border-color: var(--vscode-editorWidget-border);
                    }
                </style>
            </head>
            <body style="padding:0;">
                <div id="myGrid" style="height: 100vh; width: 100vw;" class="ag-theme-balham${theme}"></div>
            </body>
            <script type="text/javascript">
                function RowNumberRenderer() {}

                RowNumberRenderer.prototype.init = function (params) {
                    this.eGui = document.createElement('span');
                    this.eGui.classList.add('row-number');
                    this.eGui.innerHTML = params.rowIndex + 1;
                };

                RowNumberRenderer.prototype.getGui = function() {
                    return this.eGui;
                };

                function refreshRowRenderer(event) {
                    setTimeout(event.api.refreshCells({
                        columns: ['__row__'],
                        force: true
                    }), 0)
                };
            </script>
            ${script}
            <script type="text/javascript">
                eGridDiv.addEventListener('copy', ev => {
                    const nodes = gridOptions.api.getSelectedNodes()
                    const text = nodes.map(n => Object.values(n.data).join('\\t')).join('\\n')
                    ev.clipboardData.setData('text/plain', text);
                    ev.preventDefault();
                })
            </script>
        </html>
        `
}
