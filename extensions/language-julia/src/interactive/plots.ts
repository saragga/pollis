import { spawn } from 'child_process'
import * as fs from 'fs/promises'
import { homedir, tmpdir } from 'os'
import * as path from 'path'
import * as vscode from 'vscode'
import { onEvent, registerCommand, setContext } from '../utils'
import { JuliaKernel } from '../notebook/notebookKernel'
import { displayTable, shareActiveTable } from './tables'
import { drawPollisMap, MAP_CSS, MAP_STYLES } from './pollisMap'
import { MessageConnection, NotificationType } from 'vscode-jsonrpc/node'
import { browse } from '../pollisBrowse'

const c_juliaPlotPanelActiveContextKey = 'julia.plotpaneFocus'
const g_plots: Array<string> = new Array<string>()
const g_plot_id_map = new Map<string, number>()
let g_currentPlotIndex: number = 0
let g_plotPanel: vscode.WebviewPanel | undefined = undefined
let g_plotPanelInOwnWindow = false
let g_context: vscode.ExtensionContext = null
let g_plotNavigatorProvider: PlotNavigatorProvider = null

export function activate(context: vscode.ExtensionContext) {
    g_context = context

    g_plotNavigatorProvider = new PlotNavigatorProvider(context)

    context.subscriptions.push(
        registerCommand('language-julia.save-plot', requestExportPlot),
        registerCommand('language-julia.show-plotpane', async () => showPlotPane()),
        registerCommand('language-julia.plotpane-previous', async () => plotPanePrev()),
        registerCommand('language-julia.plotpane-next', async () => plotPaneNext()),
        registerCommand('language-julia.plotpane-first', async () => plotPaneFirst()),
        registerCommand('language-julia.plotpane-last', async () => plotPaneLast()),
        registerCommand('language-julia.plotpane-delete', async () => plotPaneDel()),
        registerCommand('language-julia.plotpane-delete-all', async () => plotPaneDelAll()),
        registerCommand('language-julia.shareTable', shareActiveTable),
        registerCommand(
            'language-julia.show-plot-navigator',
            async () => await g_plotNavigatorProvider.showPlotNavigator()
        ),
        vscode.window.registerWebviewViewProvider('julia-plot-navigator', g_plotNavigatorProvider),
        onEvent(vscode.workspace.onDidChangeConfiguration, (event) => {
            if (event.affectsConfiguration('pollis.plots.showChartsIn')) {
                placePlotsTab()
            }
        })
    )
    carryOverPlotPaneSetting()
}

// POLLIS: the setting pollis.plots.showChartsIn says where a chart shown in the Julia REPL goes: the Plots tab, the
// Plots tab in a window of its own, a page in Pollis' browser, or a page in another program, the external viewer of
// pollis.plots.externalViewer.

type ChartsGoTo = 'plotsTab' | 'separateWindow' | 'browserPage' | 'externalViewer'

function chartsGoTo(): ChartsGoTo {
    return vscode.workspace.getConfiguration('pollis.plots').get<ChartsGoTo>('showChartsIn', 'plotsTab')
}

/** Carries julia.usePlotPane turned off over to External Viewer once, unless Show Charts In is already set. */
async function carryOverPlotPaneSetting() {
    const key = 'pollis.plots.usePlotPaneCarriedOver'
    if (g_context.globalState.get<boolean>(key)) {
        return
    }
    const usePlotPane = vscode.workspace.getConfiguration('julia').inspect<boolean>('usePlotPane')?.globalValue
    const plots = vscode.workspace.getConfiguration('pollis.plots')
    if (usePlotPane === false && plots.inspect<string>('showChartsIn')?.globalValue === undefined) {
        await plots.update('showChartsIn', 'externalViewer', vscode.ConfigurationTarget.Global)
    }
    await g_context.globalState.update(key, true)
}

/** Moves an open Plots tab to a window of its own, or closes it when it is in one no longer wanted. */
function placePlotsTab() {
    if (!g_plotPanel) {
        return
    }
    const ownWindow = chartsGoTo() === 'separateWindow'
    if (ownWindow && !g_plotPanelInOwnWindow) {
        g_plotPanel.reveal(g_plotPanel.viewColumn, false)
        moveToOwnWindow(g_plotPanel)
    } else if (!ownWindow && g_plotPanelInOwnWindow) {
        // the tab opens again in the main window, with its plots, at the next plot
        g_plotPanel.dispose()
    }
}

/** Whether the active tab of the window is the Plots tab. */
function plotsTabIsActive() {
    const input = vscode.window.tabGroups.activeTabGroup.activeTab?.input
    return input instanceof vscode.TabInputWebview && input.viewType.endsWith('jlplotpane')
}

/**
 * Moves the Plots tab into a new window, once it is the active tab: a new panel counts as active before its tab is
 * open, so the move waits for the tab.
 */
async function moveToOwnWindow(panel: vscode.WebviewPanel) {
    if (!plotsTabIsActive()) {
        await new Promise<void>((resolve) => {
            const done = () => {
                listeners.forEach((listener) => listener.dispose())
                resolve()
            }
            const listeners = [
                vscode.window.tabGroups.onDidChangeTabs(() => plotsTabIsActive() && done()),
                vscode.window.tabGroups.onDidChangeTabGroups(() => plotsTabIsActive() && done()),
                panel.onDidDispose(done),
            ]
        })
    }
    if (panel === g_plotPanel) {
        await vscode.commands.executeCommand('workbench.action.moveEditorToNewWindow')
        g_plotPanelInOwnWindow = true
    }
}

interface Plot {
    thumbnail_type: string
    thumbnail_data: string
    time: Date
}

class PlotNavigatorProvider implements vscode.WebviewViewProvider {
    private view?: vscode.WebviewView
    private plotsInfo?: Array<Plot>
    private context: vscode.ExtensionContext

    constructor(context: vscode.ExtensionContext) {
        this.plotsInfo = []
        this.context = context
    }

    resolveWebviewView(view: vscode.WebviewView) {
        this.view = view

        view.webview.options = {
            enableScripts: true,
            enableCommandUris: true,
        }

        onEvent(view.webview.onDidReceiveMessage, (msg) => {
            // msg.type could be used to determine messages
            switch (msg.type) {
                case 'toPlot': // switch current plot to plot at index (msg.value)
                    if (msg.value >= 0 && msg.value <= g_plots.length - 1) {
                        g_currentPlotIndex = msg.value
                        updatePlotPane()
                    }
                    break
                default:
                    console.error(`Unknown message type from WebView: ${msg.type}, value: ${msg.value}`)
            }
        })

        this.reloadPlotPane()
    }

    getWebviewHTML(innerHTML: string) {
        const extensionPath = this.context.extensionPath
        const plotterStylesheet = this.view.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'libs', 'plotter', 'plotter.css'))
        )
        const plotterJavaScript = this.view.webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, 'scripts', 'plots', 'panel_webview.js'))
        )

        return `<html lang="en" class='theme--plotter'>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Plots</title>
                <link href=${plotterStylesheet} rel="stylesheet" type="text/css">
            </head>
            <body style="padding: 10px 1em 1em 1em">
                ${innerHTML}
                <script src=${plotterJavaScript}></script>
            </body>
        </html>`
    }

    async showPlotNavigator() {
        if (this?.view?.show === undefined) {
            // this forces the webview to be resolved, but changes focus:
            await vscode.commands.executeCommand('julia-plot-navigator.focus')
        } else {
            this.view.show(true)
        }
    }

    setPlotsInfo(set_func) {
        this.plotsInfo = set_func(this.plotsInfo)
        this.reloadPlotPane()
    }

    getPlotsInfo() {
        return this.plotsInfo
    }

    plotToThumbnail(plot: Plot, index: number) {
        let thumbnailHTML: string
        switch (plot.thumbnail_type) {
            case 'image':
                thumbnailHTML = `<div class="thumbnail" onclick="toPlot(${index})">
                    <img src="${plot.thumbnail_data}" alt="Plot ${index + 1}" />
                </div>`
                break
            default:
            case 'text': // This is a fallback which shows the index of the plot
                thumbnailHTML = `<div class="thumbnail" onclick="toPlot(${index})">
                Plot ${index + 1}
                <small class="float-right">${plot.time.toLocaleTimeString()}</small>
            </div>`
                break
        }
        return thumbnailHTML
    }

    reloadPlotPane() {
        if (!this.view) {
            return
        }

        let innerHTML: string
        if (this.plotsInfo.length > 0) {
            innerHTML = `<div>
                ${this.plotsInfo.map(this.plotToThumbnail).reverse().join('\n')}
            </div>`
        } else {
            innerHTML = `<p>Use Julia to plot and your plots will appear here.</p>`
        }

        this.setHTML(this.getWebviewHTML(innerHTML))
    }

    postMessageToWebview(message: unknown) {
        if (this.view) {
            this.view.webview.postMessage(message)
        }
    }

    setHTML(html: string) {
        if (this.view) {
            this.view.webview.html = html
        }
    }
}

function invalidator() {
    // VSCode tries to be smart and only does something if the webview HTML changed.
    // That means that our onload events aren't fired and you won't get a thumbnail
    // for repeated plots. Attaching a meaningless and random script snippet fixes that.
    return `<script>(function(){${Math.random()}})()</script>`
}

function getPlotPaneContent(webview: vscode.Webview) {
    if (g_plots.length === 0) {
        return `<html lang="en" style="padding:0;margin:0;">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Plots</title>
            <style>
            body {
                width: 100vw;
                height: 100vh;
            }
            .logo {
                width: 100%;
                height: 100%;
                opacity: 0.1;
                background: var(--vscode-foreground);
                -webkit-mask: url(${webview.asWebviewUri(
                    vscode.Uri.file(path.join(g_context.extensionPath, 'images', 'julia-dots.svg'))
                )}) 50% 50% / 200px no-repeat;
            }
        </style>
        </head>
        <body style="padding:0;margin:0;">
            <div class="logo"></div>
        </body>
        </html>`
    } else {
        const screenShotScript = `<script src="${webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'html2canvas', 'html2canvas.min.js'))
        )}"></script><script src="${webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'panzoom', 'panzoom.min.js'))
        )}"></script><script src="${webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'scripts', 'plots', 'main_plot_webview.js'))
        )}"></script>`

        return g_plots[g_currentPlotIndex] + screenShotScript + invalidator()
    }
}

function plotPanelOnMessage(msg) {
    switch (msg.type) {
        case 'thumbnail':
            {
                const thumbnailData = msg.value
                g_plotNavigatorProvider?.setPlotsInfo((plotsInfo) => {
                    plotsInfo[g_currentPlotIndex] = {
                        thumbnail_type: 'image',
                        thumbnail_data: thumbnailData,
                        time: new Date(),
                    }
                    return plotsInfo
                })
            }
            break
        case 'savePlot':
            savePlot(msg.value)
            break
        case 'copyFailed':
            if (msg.value) {
                vscode.window.showWarningMessage('Failed to copy plot: ' + msg.value)
            } else {
                vscode.window.showWarningMessage('Unknown: Failed to copy plot.')
            }
            break
        case 'copySuccess':
            vscode.window.showInformationMessage('Plot copied to clipboard.')
    }
}

export function showPlotPane(lazy = false) {
    const plotTitle = makeTitle()

    if (!g_plotPanel) {
        if (lazy) {
            return
        }

        // POLLIS: with Show Charts In set to Separate Window, the tab opens active, to be moved into a new window
        const ownWindow = chartsGoTo() === 'separateWindow'
        g_plotPanel = vscode.window.createWebviewPanel(
            'jlplotpane',
            plotTitle,
            {
                preserveFocus: !ownWindow,
                viewColumn: g_context.globalState.get('juliaPlotPanelViewColumn', vscode.ViewColumn.Two),
            },
            {
                enableScripts: true,
            }
        )

        const viewStateListener = onEvent(g_plotPanel.onDidChangeViewState, ({ webviewPanel }) => {
            // the column of a window of its own is not one to open the tab in again in the main window
            if (!g_plotPanelInOwnWindow) {
                g_context.globalState.update('juliaPlotPanelViewColumn', webviewPanel.viewColumn)
            }
            setContext(c_juliaPlotPanelActiveContextKey, webviewPanel.active)
        })

        g_plotPanel.webview.html = getPlotPaneContent(g_plotPanel.webview)
        setContext(c_juliaPlotPanelActiveContextKey, true)

        // Reset when the current panel is closed
        onEvent(
            g_plotPanel.onDidDispose,
            () => {
                viewStateListener.dispose()
                g_plotPanel = undefined
                g_plotPanelInOwnWindow = false
                setContext(c_juliaPlotPanelActiveContextKey, false)
            },
            null,
            g_context.subscriptions
        )

        onEvent(g_plotPanel.webview.onDidReceiveMessage, plotPanelOnMessage)
        if (ownWindow) {
            moveToOwnWindow(g_plotPanel)
        } else if (!g_plotPanel.visible) {
            g_plotPanel.reveal(g_plotPanel.viewColumn, true)
        }
    } else {
        g_plotPanel.title = plotTitle
        g_plotPanel.webview.html = getPlotPaneContent(g_plotPanel.webview)
        if (!lazy && !g_plotPanel.visible) {
            g_plotPanel.reveal(g_plotPanel.viewColumn, true)
        }
    }
}

function makeTitle() {
    return g_plots.length > 0 ? `Plots (${g_currentPlotIndex + 1}/${g_plots.length})` : 'Plots (0/0)'
}

function updatePlotPane(lazy = false) {
    showPlotPane(lazy)
}

export function plotPanePrev() {
    if (g_currentPlotIndex > 0) {
        g_currentPlotIndex = g_currentPlotIndex - 1
        updatePlotPane()
    }
}

export function plotPaneNext() {
    if (g_currentPlotIndex < g_plots.length - 1) {
        g_currentPlotIndex = g_currentPlotIndex + 1
        updatePlotPane()
    }
}

export function plotPaneFirst() {
    if (g_plots.length > 0) {
        g_currentPlotIndex = 0
        updatePlotPane()
    }
}

export function plotPaneLast() {
    if (g_plots.length > 0) {
        g_currentPlotIndex = g_plots.length - 1
        updatePlotPane()
    }
}

export function plotPaneDel() {
    if (g_plots.length > 0) {
        g_plotNavigatorProvider?.setPlotsInfo((plotsInfo) => {
            plotsInfo.splice(g_currentPlotIndex, 1)
            return plotsInfo
        })
        g_plots.splice(g_currentPlotIndex, 1)
        for (const [k, v] of g_plot_id_map) {
            if (v === g_currentPlotIndex) {
                g_plot_id_map.delete(k)
            }
        }

        if (g_currentPlotIndex > g_plots.length - 1) {
            g_currentPlotIndex = g_plots.length - 1
        }
        updatePlotPane(true)
    }
}

export function plotPaneDelAll() {
    g_plotNavigatorProvider?.setPlotsInfo(() => [])
    g_plot_id_map.clear()
    if (g_plots.length > 0) {
        g_plots.splice(0, g_plots.length)
        g_currentPlotIndex = 0
        updatePlotPane(true)
    }
}

const plotElementStyle = `
#plot-element {
    max-height: 100vh;
    max-width: 100vw;
    display: block;
    position: absolute;
    image-rendering: auto;
}

img#plot-element.pixelated {
    image-rendering: pixelated;
}

#plot-element.pan-zoom {
    cursor: all-scroll !important;
}

#plot-element > svg {
    height: 100%;
    width: 100%;
}

#copy-plot-btn {
    padding: 0.4em 0.6em;
    display: inline-flex;
    align-items: center;
    gap: 0.2em;
    border: 0px;
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    background-color: transparent;
    color: var(--vscode-button-foreground);
    z-index: 1000;
    filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 1));
}

#copy-plot-btn:hover {
    background-color: var(--vscode-button-hoverBackground);
    filter: unset;
}

#copy-plot-btn-desc {
    display: none;
}

#copy-plot-btn:hover > #copy-plot-btn-desc {
    display: inline;
}
`

// wrap a source string with an <img> tag that shows the content
// scaled to fit the plot pane unless the plot pane is bigger than the image
function wrapImagelike(srcString: string) {
    const isSvg = srcString.includes('data:image/svg+xml')
    let svgTag = ''
    if (isSvg) {
        svgTag = decodeURIComponent(srcString).replace(/^data.*<\?xml version="1\.0" encoding="utf-8"\?>\n/i, '')
        svgTag = `<div id="plot-element">${svgTag}</div>`
    }

    return wrapHtml(
        isSvg
            ? svgTag
            : `<img id= "plot-element" style = "max-height: 100vh; max-width: 100vw; display:block;" src = "${srcString}" >`
    )
}

function wrapHtml(el: string) {
    return `<html lang="en" style="padding:0;margin:0;">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Plots</title>
            <style>
            ${plotElementStyle}
            </style>
        </head>
        <body style="padding:0;margin:0;">
            ${el}
        </body>
        </html>`
}

// POLLIS: the address of a file of the extension's libs as a page reaches it: the Plots tab through its webview, a page
// of Pollis' browser or of the external viewer as a file URL, as the page of a map does.
type LibUri = (folder: string, file: string) => string

function webviewLibs(webview: vscode.Webview): LibUri {
    return (folder, file) =>
        webview.asWebviewUri(vscode.Uri.file(path.join(g_context.extensionPath, 'libs', folder, file))).toString()
}

function fileLibs(): LibUri {
    return (folder, file) => vscode.Uri.file(path.join(g_context.extensionPath, 'libs', folder, file)).toString()
}

// Pollis: a chart of ECharts.jl carries its own copy of ECharts (1.1 MB), which runs only when the page has none.
// The plot pane keeps every plot, so the copy is left out and the pane's own libs/echarts (the same version) is
// loaded instead. A chart whose HTML is not as expected keeps its copy.
const ECHARTS_INLINE = "if (typeof echarts === 'undefined') {"

function withSharedECharts(html: string, lib: LibUri) {
    if (!html.includes('echarts.init(')) {
        return html
    }
    const start = html.indexOf(ECHARTS_INLINE)
    const next = start < 0 ? -1 : html.indexOf('(function() {', start)
    const end = next < 0 ? -1 : html.lastIndexOf('}', next)
    const chart = start >= 0 && end > start ? html.slice(0, start) + html.slice(end + 1) : html
    return `<script src="${lib('echarts', 'echarts.min.js')}"></script>\n${chart}`
}

// Pollis: a map of Pollis.webmap (application/vnd.pollis.map+json), drawn with MapLibre GL JS by drawPollisMap, whose
// source goes into the page, as in a notebook output. A map of Pollis.streetview loads MapillaryJS too.
function mapHtml(lib: LibUri, payload: string) {
    // the map's JSON goes into a script: a </script> in a value must not end it
    const spec = payload.replace(/<\//g, '<\\/')
    const street = payload.includes('"streetview":{')
        ? `<link rel="stylesheet" href="${lib('mapillary', 'mapillary.css')}">
            <script src="${lib('mapillary', 'mapillary.js')}"></script>`
        : ''
    return `<html lang="en">
        <head>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="${lib('maplibre', 'maplibre-gl.css')}">
            <script src="${lib('maplibre', 'maplibre-gl.js')}"></script>
            ${street}
            <style>
                html, body { margin: 0; padding: 0; height: 100%; }
                #plot-element { position: absolute; inset: 0; }
                ${MAP_CSS}
            </style>
        </head>
        <body>
            <div id="plot-element" class="pollis-map"></div>
            <script>
                (${drawPollisMap.toString()})(maplibregl, document.getElementById('plot-element'), ${spec}, ${JSON.stringify(MAP_STYLES)},
                    typeof mapillary === 'undefined' ? undefined : mapillary)
            </script>
        </body>
        </html>`
}

/** A chart of Vega or Vega-Lite, drawn by vega-embed with the given versions of the libraries. */
function vegaHtml(lib: LibUri, mode: 'vega' | 'vega-lite', payload: string, vega: string, vegaLite?: string) {
    const vegaLiteScript = vegaLite ? `<script src="${lib(vegaLite, 'vega-lite.min.js')}"></script>` : ''
    return `
            <html>
                <head>
                    <script src="${lib('panzoom', 'panzoom.min.js')}"></script>
                    <script src="${lib(vega, 'vega.min.js')}"></script>
                    ${vegaLiteScript}
                    <script src="${lib('vega-embed', 'vega-embed.min.js')}"></script>
                </head>
                <body>
                    <div id="plot-element" style="position: absolute; max-width: 100%; max-height: 100vh; top: 0; left: 0;"></div>
                </body>
                <style media="screen">
                    .vega-actions a {
                        margin-right: 10px;
                        font-family: sans-serif;
                        font-size: x-small;
                        font-style: italic;
                    }
                    ${plotElementStyle}
                </style>
                <script type="text/javascript">
                    var opt = {
                        mode: "${mode}",
                        actions: false,
                        renderer: "svg"
                    }
                    var spec = ${payload}
                    vegaEmbed('#plot-element', spec, opt);
                </script>
            </html>`
}

function plotlyHtml(lib: LibUri, payload: string) {
    return `
        <html>
        <head>
            <script src="${lib('plotly', 'plotly.min.js')}"></script>
        </head>
        <body>
            <div id="plot-element" style="position: absolute; max-width: 100%; max-height: 100vh; top: 0; left: 0;"></div>
        </body>
        <script type="text/javascript">
            function onResize () {
                const update = {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
                Plotly.relayout('plot-element', update)
            }
            const spec = ${payload};
            Plotly.newPlot('plot-element', spec.data, spec.layout, spec.config);
            if (!(spec.layout.width || spec.layout.height)) {
                onResize()
                window.addEventListener('resize', onResize);
            }
        </script>
        </html>`
}

/**
 * The HTML of a chart or a map of the given kind, with the libraries it loads from `lib`, or undefined for a kind
 * that is not a chart. In the Plots tab, a chart of ECharts.jl uses the tab's ECharts; on a page, it keeps its own.
 */
function chartHtml(kind: string, payload: string, lib: LibUri, inPlotsTab: boolean): string | undefined {
    switch (kind) {
        case 'image/svg+xml':
            // the xmlns attribute has to be present for data:image/svg+xml to work (https://stackoverflow.com/questions/18467982)
            // encodeURIComponent is needed to replace all special characters from the SVG string
            // which could break the HTML; otherwise the svg is shown directly, as it is not straightforward to
            // scale it correctly if it's not in an img tag
            return payload.includes('xmlns=') ? wrapImagelike(`data:image/svg+xml,${encodeURIComponent(payload)}`) : payload
        case 'image/png':
            return wrapImagelike(`data:image/png;base64,${payload}`)
        case 'image/gif':
            return wrapImagelike(`data:image/gif;base64,${payload}`)
        case 'juliavscode/html':
        case 'application/vnd.julia-vscode.plotpane+html':
            // the wrapper doesn't do anything visually, just lets us pick up the plot pane content via the id later
            return wrapHtml(inPlotsTab ? withSharedECharts(payload, lib) : payload)
        case 'application/vnd.pollis.map+json':
            return mapHtml(lib, payload)
        case 'application/vnd.vegalite.v2+json':
            return vegaHtml(lib, 'vega-lite', payload, 'vega-3', 'vega-lite-2')
        case 'application/vnd.vegalite.v3+json':
            return vegaHtml(lib, 'vega-lite', payload, 'vega-5', 'vega-lite-3')
        case 'application/vnd.vegalite.v4+json':
            return vegaHtml(lib, 'vega-lite', payload, 'vega-5', 'vega-lite-4')
        case 'application/vnd.vegalite.v5+json':
            return vegaHtml(lib, 'vega-lite', payload, 'vega-5', 'vega-lite-5')
        case 'application/vnd.vega.v3+json':
            return vegaHtml(lib, 'vega', payload, 'vega-3')
        case 'application/vnd.vega.v4+json':
            return vegaHtml(lib, 'vega', payload, 'vega-4')
        case 'application/vnd.vega.v5+json':
            return vegaHtml(lib, 'vega', payload, 'vega-5')
        case 'application/vnd.plotly.v1+json':
            return plotlyHtml(lib, payload)
    }
    return undefined
}

function keepLatest() {
    return Math.max(1, vscode.workspace.getConfiguration('pollis.plots').get<number>('keepLatest', 50))
}

// POLLIS: the tab keeps only the latest plots, as many as the setting pollis.plots.keepLatest says (50 by default),
// so that a long session does not hold every image it has shown
function dropOldestPlots() {
    const extra = g_plots.length - keepLatest()
    if (extra <= 0) {
        return
    }
    g_plots.splice(0, extra)
    g_plotNavigatorProvider?.setPlotsInfo((plotsInfo) => {
        plotsInfo.splice(0, extra)
        return plotsInfo
    })
    for (const [key, index] of g_plot_id_map) {
        if (index < extra) {
            g_plot_id_map.delete(key)
        } else {
            g_plot_id_map.set(key, index - extra)
        }
    }
    g_currentPlotIndex = Math.max(0, g_currentPlotIndex - extra)
}

function addOrUpdatePlot(plotPaneContent: string, id?: string) {
    if (id && g_plot_id_map.has(id)) {
        const ind = g_plot_id_map.get(id)
        g_plots[ind] = plotPaneContent
        g_currentPlotIndex = ind
        g_plotNavigatorProvider?.setPlotsInfo((plotsInfo) => {
            plotsInfo[ind] = {
                thumbnail_type: 'text',
                thumbnail_data: null,
                time: new Date(),
            }
            return plotsInfo
        })
        showPlotPane()
        return
    }

    g_currentPlotIndex = g_plots.push(plotPaneContent) - 1

    g_plotNavigatorProvider?.setPlotsInfo((plotsInfo) => {
        plotsInfo.push({
            thumbnail_type: 'text',
            thumbnail_data: null,
            time: new Date(),
        })
        return plotsInfo
    })

    if (id) {
        g_plot_id_map.set(id, g_currentPlotIndex)
    }
    dropOldestPlots()

    showPlotPane()
}

// POLLIS: a map of Pollis.webmap or Pollis.streetview shown in the REPL comes as `pollis/map`, with its page, which
// Pollis.jl has written, and its JSON. The setting pollis.plots.showMapsIn says where it goes: its page in Pollis'
// browser, one tab for each title, the Plots tab, where it takes the tab's one page as a chart does, or its page in
// the external viewer.
const notifyTypeMap = new NotificationType<{ page: string; json: string }>('pollis/map')

/** Answers the notification `pollis/map` of the REPL's Julia process. */
export function answerMapRequests(connection: MessageConnection) {
    connection.onNotification(notifyTypeMap, async ({ page, json }) => {
        const mapsGoTo = vscode.workspace.getConfiguration('pollis.plots').get<string>('showMapsIn', 'browserPage')
        if (mapsGoTo === 'plotsTab') {
            showInPlotsTab('application/vnd.pollis.map+json', json)
            return
        }
        try {
            await (mapsGoTo === 'externalViewer' ? openInExternalViewer(page) : browse(page))
        } catch (error) {
            vscode.window.showErrorMessage(`Pollis could not open ${page}: ${error instanceof Error ? error.message : String(error)}`)
        }
    })
}

export function displayPlot(params: { kind: string; data: string; id?: string; title?: string }, kernel?: JuliaKernel) {
    const { kind, data: payload, id, title } = params

    if (kind === 'application/vnd.dataresource+json') {
        return displayTable(payload, g_context, false, kernel)
    } else if (kind === 'application/vnd.dataresource+lazy') {
        return displayTable(payload, g_context, true, kernel)
    } else if (kind === 'application/vnd.julia-vscode.custompane+html') {
        return displayCustom(payload, id, title)
    }

    const goTo = chartsGoTo()
    if (goTo === 'browserPage' || goTo === 'externalViewer') {
        const html = chartHtml(kind, payload, fileLibs(), false)
        if (html === undefined) {
            throw new Error()
        }
        return showChartPage(html, id, goTo)
    }
    showInPlotsTab(kind, payload, id)
}

/** Shows a chart or a map in the Plots tab. */
function showInPlotsTab(kind: string, payload: string, id?: string) {
    showPlotPane()
    const html = chartHtml(kind, payload, webviewLibs(g_plotPanel.webview), true)
    if (html === undefined) {
        throw new Error()
    }
    addOrUpdatePlot(html, id)

    if (vscode.workspace.getConfiguration('julia').get('focusPlotNavigator')) {
        g_plotNavigatorProvider?.showPlotNavigator()
    }
}

// POLLIS: with Show Charts In set to Browser Page or External Viewer, each chart is a page of its own in a folder of
// this session, which keeps the latest pages, as many as Plots: Keep Latest says. A chart shown again with the same
// id replaces its page.
let g_chartPages: string | undefined = undefined
let g_chartCount = 0

async function showChartPage(html: string, id: string | undefined, goTo: 'browserPage' | 'externalViewer') {
    const name = id ? `Chart ${id}` : `Chart ${++g_chartCount}`
    const file = id ? `chart-${id.replace(/[^A-Za-z0-9_-]/g, '_')}.html` : `chart-${g_chartCount}.html`
    try {
        g_chartPages ??= await fs.mkdtemp(path.join(tmpdir(), 'pollis-charts-'))
        const page = path.join(g_chartPages, file)
        const titled = /<title>[^<]*<\/title>/i.test(html)
            ? html.replace(/<title>[^<]*<\/title>/i, `<title>${name}</title>`)
            : `<title>${name}</title>\n${html}`
        await fs.writeFile(page, titled)
        await dropOldestPages(g_chartPages)
        await (goTo === 'externalViewer' ? openInExternalViewer(page) : browse(page))
    } catch (error) {
        vscode.window.showErrorMessage(`Pollis could not show the chart: ${error instanceof Error ? error.message : String(error)}`)
    }
}

/** Removes the oldest pages of the folder beyond those Plots: Keep Latest keeps. */
async function dropOldestPages(folder: string) {
    const files = await fs.readdir(folder)
    const extra = files.length - keepLatest()
    if (extra <= 0) {
        return
    }
    const dated = await Promise.all(
        files.map(async (file) => ({ file, time: (await fs.stat(path.join(folder, file))).mtimeMs }))
    )
    dated.sort((a, b) => a.time - b.time)
    await Promise.all(dated.slice(0, extra).map(({ file }) => fs.rm(path.join(folder, file), { force: true })))
}

/**
 * Opens a page in the program of Plots: External Viewer: a browser by its name on macOS (open -a), or by its command
 * or path elsewhere; when empty, the system's default program for HTML files, which is the default browser.
 */
function openInExternalViewer(page: string): Promise<void> {
    const program = vscode.workspace.getConfiguration('pollis.plots').get<string>('externalViewer', '').trim()
    const macOS = process.platform === 'darwin'
    const command = macOS ? 'open' : program || (process.platform === 'win32' ? 'explorer.exe' : 'xdg-open')
    const args = macOS && program ? ['-a', program, page] : [page]
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { detached: !macOS, stdio: 'ignore' })
        child.once('error', reject)
        if (macOS) {
            // open returns at once, with an error code when there is no application of that name
            child.once('exit', (code) =>
                code === 0 ? resolve() : reject(new Error(`there is no application named ${program || 'for HTML files'}`))
            )
        } else {
            child.once('spawn', () => {
                child.unref()
                resolve()
            })
        }
    })
}

const CUSTOM_PANELS = new Map<string, vscode.WebviewPanel>()
function displayCustom(payload, id, title?: string) {
    const panelTitle = title || id
    let panel: vscode.WebviewPanel
    if (CUSTOM_PANELS.has(id)) {
        panel = CUSTOM_PANELS.get(id)
        panel.title = panelTitle
    } else {
        panel = vscode.window.createWebviewPanel(
            `julia.custom_pane.${id}`,
            panelTitle,
            {
                preserveFocus: true,
                viewColumn: g_context.globalState.get('juliaPlotPanelViewColumn', vscode.ViewColumn.Two),
            },
            {
                enableScripts: true,
            }
        )
        CUSTOM_PANELS.set(id, panel)
    }

    panel.webview.html = payload
    // Reset when the current panel is closed
    onEvent(
        panel.onDidDispose,
        () => {
            CUSTOM_PANELS.delete(id)
        },
        null,
        g_context.subscriptions
    )

    if (!panel.visible) {
        panel.reveal(panel.viewColumn, true)
    }
}

/**
 * Send export request(message) to the plot pane.
 */
async function requestExportPlot() {
    await g_plotPanel.webview.postMessage({
        type: 'requestSavePlot',
        body: { index: g_currentPlotIndex },
    })
}

interface ExportedPlot {
    svg?: string
    png?: string
    gif?: string
    index: number
}

type FileLike = string | Buffer
/**
 * Write svg file of the plot to the plots directory.
 * @param plot
 */
function savePlot(plot: ExportedPlot) {
    const plotName = `plot_${plot.index + 1}`

    if (plot.svg !== null) {
        const fileName = `${plotName}.svg`
        _writePlotFile(fileName, plot.svg)
    } else if (plot.png !== null) {
        const fileName = `${plotName}.png`
        const buffer = Buffer.from(plot.png, 'base64')
        _writePlotFile(fileName, buffer)
    } else if (plot.gif !== null) {
        const fileName = `${plotName}.gif`
        const buffer = Buffer.from(plot.gif, 'base64')
        _writePlotFile(fileName, buffer)
    } else {
        vscode.window.showWarningMessage('Failed to save plot, supported formats are svg, png, and gif.')
    }
}

/**
 * Write the plot file to disk.
 * @param fileName
 * @param data
 * @param encoding
 */
async function _writePlotFile(fileName: string, data: FileLike) {
    const rootPath =
        vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
            ? vscode.workspace.workspaceFolders[0].uri?.fsPath
            : null
    // If the default `plots.path` isn't in `settings.json` use the root:
    const defaultPlotsDir: string = vscode.workspace.getConfiguration('julia').get('plots.path') ?? ''

    let plotsDirFullPath: string = null
    if (rootPath) {
        plotsDirFullPath = path.isAbsolute(defaultPlotsDir) ? defaultPlotsDir : path.join(rootPath, defaultPlotsDir)
    }

    try {
        let isFile = true
        try {
            await fs.access(plotsDirFullPath)
        } catch {
            isFile = false
        }
        if (!isFile) {
            const action = await vscode.window.showWarningMessage(
                'The default plot path does not exist.',
                'Create',
                'Change'
            )
            if (action === 'Create') {
                await fs.mkdir(plotsDirFullPath, { recursive: true })
            } else if (action === 'Change') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'julia.plots.path')
                return
            } else {
                plotsDirFullPath = homedir()
            }
        }
        const plotFileFullPath = path.join(plotsDirFullPath, fileName)
        vscode.window.showSaveDialog({ defaultUri: vscode.Uri.file(plotFileFullPath) }).then((saveURI) => {
            if (saveURI) {
                fs.writeFile(saveURI.fsPath, data)
            }
        })
    } catch (e) {
        console.error(e)
        vscode.window.showWarningMessage('Failed to save plot.')
    }
}
