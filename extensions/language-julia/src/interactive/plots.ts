import * as fs from 'fs/promises'
import { homedir } from 'os'
import * as path from 'path'
import * as vscode from 'vscode'
import { onEvent, registerCommand, setContext } from '../utils'
import { JuliaKernel } from '../notebook/notebookKernel'
import { displayTable, shareActiveTable } from './tables'

const c_juliaPlotPanelActiveContextKey = 'julia.plotpaneFocus'
const g_plots: Array<string> = new Array<string>()
const g_plot_id_map = new Map<string, number>()
let g_currentPlotIndex: number = 0
let g_plotPanel: vscode.WebviewPanel | undefined = undefined
let g_context: vscode.ExtensionContext = null
let g_plotNavigatorProvider: PlotNavigatorProvider = null

export function activate(context: vscode.ExtensionContext) {
    g_context = context

    g_plotNavigatorProvider = new PlotNavigatorProvider(context)

    context.subscriptions.push(
        registerCommand('language-julia.save-plot', requestExportPlot),
        registerCommand('language-julia.show-plotpane', async () => showPlotPane()),
        registerCommand('language-julia.plotpane-enable', enablePlotPane),
        registerCommand('language-julia.plotpane-disable', disablePlotPane),
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
        vscode.window.registerWebviewViewProvider('julia-plot-navigator', g_plotNavigatorProvider)
    )
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
                <title>Julia Plots</title>
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
            <title>Julia Plots</title>
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

        g_plotPanel = vscode.window.createWebviewPanel(
            'jlplotpane',
            plotTitle,
            {
                preserveFocus: true,
                viewColumn: g_context.globalState.get('juliaPlotPanelViewColumn', vscode.ViewColumn.Two),
            },
            {
                enableScripts: true,
            }
        )

        const viewStateListener = onEvent(g_plotPanel.onDidChangeViewState, ({ webviewPanel }) => {
            g_context.globalState.update('juliaPlotPanelViewColumn', webviewPanel.viewColumn)
            setContext(c_juliaPlotPanelActiveContextKey, webviewPanel.active)
        })

        g_plotPanel.webview.html = getPlotPaneContent(g_plotPanel.webview)
        setContext(c_juliaPlotPanelActiveContextKey, true)

        const configListener = onEvent(vscode.workspace.onDidChangeConfiguration, (config) => {
            if (config.affectsConfiguration('julia') && g_plotPanel) {
                g_plotPanel.title = makeTitle()
            }
        })
        // Reset when the current panel is closed
        onEvent(
            g_plotPanel.onDidDispose,
            () => {
                configListener.dispose()
                viewStateListener.dispose()
                g_plotPanel = undefined
                setContext(c_juliaPlotPanelActiveContextKey, false)
            },
            null,
            g_context.subscriptions
        )

        onEvent(g_plotPanel.webview.onDidReceiveMessage, plotPanelOnMessage)
        if (!g_plotPanel.visible) {
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
    let plotTitle = 'Julia Plots'
    if (vscode.workspace.getConfiguration('julia').get('usePlotPane')) {
        plotTitle += g_plots.length > 0 ? ` (${g_currentPlotIndex + 1}/${g_plots.length})` : ' (0/0)'
    } else {
        plotTitle += ' (disabled)'
    }
    return plotTitle
}

async function enablePlotPane() {
    const conf = vscode.workspace.getConfiguration('julia')
    await conf.update('usePlotPane', true, vscode.ConfigurationTarget.Global)
}

async function disablePlotPane() {
    const conf = vscode.workspace.getConfiguration('julia')
    await conf.update('usePlotPane', false, vscode.ConfigurationTarget.Global)
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
            <title>Julia Plots</title>
            <style>
            ${plotElementStyle}
            </style>
        </head>
        <body style="padding:0;margin:0;">
            ${el}
        </body>
        </html>`
}

// Pollis: a chart of ECharts.jl carries its own copy of ECharts (1.1 MB), which runs only when the page has none.
// The plot pane keeps every plot, so the copy is left out and the pane's own libs/echarts (the same version) is
// loaded instead. A chart whose HTML is not as expected keeps its copy.
const ECHARTS_INLINE = "if (typeof echarts === 'undefined') {"

function withSharedECharts(html: string) {
    if (!html.includes('echarts.init(')) {
        return html
    }
    const start = html.indexOf(ECHARTS_INLINE)
    const next = start < 0 ? -1 : html.indexOf('(function() {', start)
    const end = next < 0 ? -1 : html.lastIndexOf('}', next)
    const chart = start >= 0 && end > start ? html.slice(0, start) + html.slice(end + 1) : html
    showPlotPane()
    const uriECharts = g_plotPanel.webview.asWebviewUri(
        vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'echarts', 'echarts.min.js'))
    )
    return `<script src="${uriECharts}"></script>\n${chart}`
}

// Pollis: the base maps of Pollis.webmap, OpenStreetMap data as vector tiles of OpenFreeMap, which asks for no key.
const MAP_STYLES: Record<string, string> = {
    positron: 'https://tiles.openfreemap.org/styles/positron',
    bright: 'https://tiles.openfreemap.org/styles/bright',
    liberty: 'https://tiles.openfreemap.org/styles/liberty',
    dark: 'https://tiles.openfreemap.org/styles/dark',
    fiord: 'https://tiles.openfreemap.org/styles/fiord',
}

// Pollis: a map of Pollis.webmap (application/vnd.pollis.map+json), drawn with MapLibre GL JS: a base map, and on it
// GeoJSON layers, each in one colour or coloured by a column, with a legend and the attributes of a feature on a click.
function mapHtml(webview: vscode.Webview, payload: string) {
    const lib = (file: string) =>
        webview.asWebviewUri(vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'maplibre', file)))
    // the map's JSON goes into a script: a </script> in a value must not end it
    const spec = payload.replace(/<\//g, '<\\/')
    return `<html lang="en">
        <head>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="${lib('maplibre-gl.css')}">
            <script src="${lib('maplibre-gl.js')}"></script>
            <style>
                html, body { margin: 0; padding: 0; height: 100%; }
                #plot-element { position: absolute; inset: 0; }
                .pollis-map-box { position: absolute; z-index: 2; background: rgba(255, 255, 255, 0.92); color: #222;
                    font: 12px/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 6px 9px;
                    border-radius: 4px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25); max-width: 40%; }
                #pollis-map-title { top: 10px; left: 10px; font-size: 14px; font-weight: 600; }
                #pollis-map-legend { bottom: 30px; right: 10px; }
                .pollis-map-legend-layer { margin: 2px 0 4px; font-weight: 600; }
                .pollis-map-swatch { display: inline-block; width: 11px; height: 11px; margin-right: 5px;
                    vertical-align: -1px; border-radius: 2px; }
                .pollis-map-ramp { height: 9px; width: 140px; border-radius: 2px; }
                .pollis-map-range { display: flex; justify-content: space-between; width: 140px; }
                .maplibregl-popup-content table { border-collapse: collapse; font-size: 12px; }
                .maplibregl-popup-content td { padding: 1px 6px 1px 0; vertical-align: top; }
                .maplibregl-popup-content td:first-child { color: #666; }
            </style>
        </head>
        <body>
            <div id="plot-element"></div>
            <script>
                const spec = ${spec};
                const styles = ${JSON.stringify(MAP_STYLES)};
                const palette = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac'];
                const ramp = ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725'];
                const escape = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
                const layers = (spec.layers || []).map((layer, index) => {
                    const features = (layer.data && layer.data.features) || [];
                    const name = layer.name || 'Layer ' + (index + 1);
                    const fixed = layer.color || palette[index % palette.length];
                    if (!layer.column) {
                        return { ...layer, name, colour: fixed, legend: '<span class="pollis-map-swatch" style="background:' + fixed + '"></span>' + escape(name) };
                    }
                    const values = features.map(f => f.properties && f.properties[layer.column]).filter(v => v !== null && v !== undefined);
                    if (values.length && values.every(v => typeof v === 'number')) {
                        const low = Math.min(...values), high = Math.max(...values);
                        const colour = low === high ? ramp[2] : ['interpolate', ['linear'], ['to-number', ['get', layer.column]],
                            ...ramp.flatMap((c, i) => [low + (high - low) * i / (ramp.length - 1), c])];
                        const format = v => Number(v.toPrecision(4)).toLocaleString();
                        return { ...layer, name, colour, legend: '<div class="pollis-map-legend-layer">' + escape(name + ': ' + layer.column) + '</div>'
                            + '<div class="pollis-map-ramp" style="background:linear-gradient(to right,' + ramp.join(',') + ')"></div>'
                            + '<div class="pollis-map-range"><span>' + format(low) + '</span><span>' + format(high) + '</span></div>' };
                    }
                    const categories = [...new Set(values.map(String))];
                    const shown = categories.slice(0, palette.length);
                    const colour = shown.length ? ['match', ['to-string', ['get', layer.column]], ...shown.flatMap((c, i) => [c, palette[i]]), '#999999'] : '#999999';
                    const items = shown.map((c, i) => '<div><span class="pollis-map-swatch" style="background:' + palette[i] + '"></span>' + escape(c) + '</div>').join('')
                        + (categories.length > shown.length ? '<div><span class="pollis-map-swatch" style="background:#999999"></span>' + (categories.length - shown.length) + ' more</div>' : '');
                    return { ...layer, name, colour, legend: '<div class="pollis-map-legend-layer">' + escape(name + ': ' + layer.column) + '</div>' + items };
                });
                const map = new maplibregl.Map({
                    container: 'plot-element',
                    style: styles[spec.style] || spec.style || styles.positron,
                    center: spec.center || [0, 20],
                    zoom: spec.zoom ?? 1,
                    canvasContextAttributes: { preserveDrawingBuffer: true },
                });
                map.addControl(new maplibregl.NavigationControl(), 'top-right');
                map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
                if (spec.title) {
                    document.body.insertAdjacentHTML('beforeend', '<div id="pollis-map-title" class="pollis-map-box">' + escape(spec.title) + '</div>');
                }
                if (layers.length) {
                    document.body.insertAdjacentHTML('beforeend', '<div id="pollis-map-legend" class="pollis-map-box">' + layers.map(l => '<div>' + l.legend + '</div>').join('') + '</div>');
                }
                // the box around every coordinate of the layers, which the map fits when it is given no centre
                let bounds = null;
                const extend = c => {
                    if (typeof c[0] === 'number') {
                        bounds = bounds ? bounds.extend(c) : new maplibregl.LngLatBounds(c, c);
                    } else {
                        c.forEach(extend);
                    }
                };
                layers.forEach(l => ((l.data && l.data.features) || []).forEach(f => f.geometry && f.geometry.coordinates && extend(f.geometry.coordinates)));
                const clickable = [];
                map.on('load', () => {
                    // polygons go under the base map's labels, so place names stay readable
                    const labels = (map.getStyle().layers.find(layer => layer.type === 'symbol') || {}).id;
                    layers.forEach((l, i) => {
                        const source = 'pollis-layer-' + i;
                        const opacity = l.opacity ?? 0.6;
                        map.addSource(source, { type: 'geojson', data: l.data || { type: 'FeatureCollection', features: [] } });
                        const is = types => ['in', ['geometry-type'], ['literal', types]];
                        map.addLayer({ id: source + '-fill', type: 'fill', source, filter: is(['Polygon', 'MultiPolygon']), paint: { 'fill-color': l.colour, 'fill-opacity': opacity } }, labels);
                        map.addLayer({ id: source + '-outline', type: 'line', source, filter: is(['Polygon', 'MultiPolygon']), paint: { 'line-color': l.colour, 'line-width': 1 } }, labels);
                        map.addLayer({ id: source + '-line', type: 'line', source, filter: is(['LineString', 'MultiLineString']), paint: { 'line-color': l.colour, 'line-width': 2.5, 'line-opacity': Math.max(opacity, 0.8) } });
                        map.addLayer({ id: source + '-point', type: 'circle', source, filter: is(['Point', 'MultiPoint']), paint: { 'circle-color': l.colour, 'circle-radius': 5, 'circle-opacity': Math.max(opacity, 0.8), 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1 } });
                        clickable.push(source + '-fill', source + '-line', source + '-point');
                    });
                    clickable.forEach(id => {
                        map.on('click', id, e => {
                            const properties = e.features[0].properties || {};
                            const rows = Object.keys(properties).map(k => '<tr><td>' + escape(k) + '</td><td>' + escape(properties[k]) + '</td></tr>').join('');
                            new maplibregl.Popup({ maxWidth: '320px' }).setLngLat(e.lngLat).setHTML('<table>' + (rows || '<tr><td>No attributes</td></tr>') + '</table>').addTo(map);
                        });
                        map.on('mouseenter', id, () => { map.getCanvas().style.cursor = 'pointer'; });
                        map.on('mouseleave', id, () => { map.getCanvas().style.cursor = ''; });
                    });
                    if (!spec.center && bounds) {
                        map.fitBounds(bounds, { padding: 40, maxZoom: 15, duration: 0 });
                    }
                });
            </script>
        </body>
        </html>`
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

    showPlotPane()
}

export function displayPlot(params: { kind: string; data: string; id?: string; title?: string }, kernel?: JuliaKernel) {
    const { kind, data: payload, id, title } = params

    if (kind === 'image/svg+xml') {
        const has_xmlns_attribute = payload.includes('xmlns=')
        let plotPaneContent: string
        if (has_xmlns_attribute) {
            // the xmlns attribute has to be present for data:image/svg+xml to work (https://stackoverflow.com/questions/18467982)
            // encodeURIComponent is needed to replace all special characters from the SVG string
            // which could break the HTML
            plotPaneContent = wrapImagelike(`data:image/svg+xml,${encodeURIComponent(payload)}`)
        } else {
            // otherwise we just show the svg directly as it's not straightforward to scale it
            // correctly if it's not in an img tag
            plotPaneContent = payload
        }

        addOrUpdatePlot(plotPaneContent, id)
    } else if (kind === 'image/png') {
        const plotPaneContent = wrapImagelike(`data:image/png;base64,${payload}`)
        addOrUpdatePlot(plotPaneContent, id)
    } else if (kind === 'image/gif') {
        const plotPaneContent = wrapImagelike(`data:image/gif;base64,${payload}`)
        addOrUpdatePlot(plotPaneContent, id)
    } else if (kind === 'juliavscode/html' || kind === 'application/vnd.julia-vscode.plotpane+html') {
        // the wrapper doesn't do anything visually, just lets us pick up the plot pane content via the id later
        addOrUpdatePlot(wrapHtml(withSharedECharts(payload)), id)
    } else if (kind === 'application/vnd.pollis.map+json') {
        showPlotPane()
        addOrUpdatePlot(mapHtml(g_plotPanel.webview, payload), id)
    } else if (kind === 'application/vnd.vegalite.v2+json') {
        showPlotPane()
        const uriPanZoom = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'panzoom', 'panzoom.min.js'))
        )
        const uriVegaEmbed = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-embed', 'vega-embed.min.js'))
        )
        const uriVegaLite = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-lite-2', 'vega-lite.min.js'))
        )
        const uriVega = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-3', 'vega.min.js'))
        )
        const plotPaneContent = `
            <html>
                <head>
                    <script src="${uriPanZoom}"></script>
                    <script src="${uriVega}"></script>
                    <script src="${uriVegaLite}"></script>
                    <script src="${uriVegaEmbed}"></script>
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
                        mode: "vega-lite",
                        actions: false,
                        renderer: "svg"
                    }
                    var spec = ${payload}
                    vegaEmbed('#plot-element', spec, opt);
                </script>
            </html>`
        addOrUpdatePlot(plotPaneContent, id)
    } else if (kind === 'application/vnd.vegalite.v3+json') {
        showPlotPane()
        const uriPanZoom = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'panzoom', 'panzoom.min.js'))
        )
        const uriVegaEmbed = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-embed', 'vega-embed.min.js'))
        )
        const uriVegaLite = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-lite-3', 'vega-lite.min.js'))
        )
        const uriVega = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-5', 'vega.min.js'))
        )
        const plotPaneContent = `
            <html>
                <head>
                    <script src="${uriPanZoom}"></script>
                    <script src="${uriVega}"></script>
                    <script src="${uriVegaLite}"></script>
                    <script src="${uriVegaEmbed}"></script>
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
                        mode: "vega-lite",
                        actions: false,
                        renderer: "svg"
                    }
                    var spec = ${payload}
                    vegaEmbed('#plot-element', spec, opt);
                </script>
            </html>`
        addOrUpdatePlot(plotPaneContent, id)
    } else if (kind === 'application/vnd.vegalite.v4+json') {
        showPlotPane()
        const uriPanZoom = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'panzoom', 'panzoom.min.js'))
        )
        const uriVegaEmbed = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-embed', 'vega-embed.min.js'))
        )
        const uriVegaLite = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-lite-4', 'vega-lite.min.js'))
        )
        const uriVega = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-5', 'vega.min.js'))
        )
        const plotPaneContent = `
            <html>
                <head>
                    <script src="${uriPanZoom}"></script>
                    <script src="${uriVega}"></script>
                    <script src="${uriVegaLite}"></script>
                    <script src="${uriVegaEmbed}"></script>
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
                        mode: "vega-lite",
                        actions: false,
                        renderer: "svg"
                    }
                    var spec = ${payload}
                    vegaEmbed('#plot-element', spec, opt);
                </script>
            </html>`
        addOrUpdatePlot(plotPaneContent, id)
    } else if (kind === 'application/vnd.vegalite.v5+json') {
        showPlotPane()
        const uriPanZoom = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'panzoom', 'panzoom.min.js'))
        )
        const uriVegaEmbed = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-embed', 'vega-embed.min.js'))
        )
        const uriVegaLite = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-lite-5', 'vega-lite.min.js'))
        )
        const uriVega = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-5', 'vega.min.js'))
        )
        const plotPaneContent = `
            <html>
                <head>
                    <script src="${uriPanZoom}"></script>
                    <script src="${uriVega}"></script>
                    <script src="${uriVegaLite}"></script>
                    <script src="${uriVegaEmbed}"></script>
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
                        mode: "vega-lite",
                        actions: false,
                        renderer: "svg"
                    }
                    var spec = ${payload}
                    vegaEmbed('#plot-element', spec, opt);
                </script>
            </html>`
        g_currentPlotIndex = g_plots.push(plotPaneContent) - 1
        showPlotPane()
    } else if (kind === 'application/vnd.vega.v3+json') {
        showPlotPane()
        const uriPanZoom = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'panzoom', 'panzoom.min.js'))
        )
        const uriVegaEmbed = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-embed', 'vega-embed.min.js'))
        )
        const uriVega = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-3', 'vega.min.js'))
        )
        const plotPaneContent = `
            <html>
                <head>
                    <script src="${uriPanZoom}"></script>
                    <script src="${uriVega}"></script>
                    <script src="${uriVegaEmbed}"></script>
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
                        mode: "vega",
                        actions: false,
                        renderer: "svg"
                    }
                    var spec = ${payload}
                    vegaEmbed('#plot-element', spec, opt);
                </script>
            </html>`
        addOrUpdatePlot(plotPaneContent, id)
    } else if (kind === 'application/vnd.vega.v4+json') {
        showPlotPane()
        const uriPanZoom = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'panzoom', 'panzoom.min.js'))
        )
        const uriVegaEmbed = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-embed', 'vega-embed.min.js'))
        )
        const uriVega = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-4', 'vega.min.js'))
        )
        const plotPaneContent = `
            <html>
                <head>
                    <script src="${uriPanZoom}"></script>
                    <script src="${uriVega}"></script>
                    <script src="${uriVegaEmbed}"></script>
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
                        mode: "vega",
                        actions: false,
                        renderer: "svg"
                    }
                    var spec = ${payload}
                    vegaEmbed('#plot-element', spec, opt);
                </script>
            </html>`
        addOrUpdatePlot(plotPaneContent, id)
    } else if (kind === 'application/vnd.vega.v5+json') {
        showPlotPane()
        const uriPanZoom = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'panzoom', 'panzoom.min.js'))
        )
        const uriVegaEmbed = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-embed', 'vega-embed.min.js'))
        )
        const uriVega = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'vega-5', 'vega.min.js'))
        )
        const plotPaneContent = `
            <html>
                <head>
                    <script src="${uriPanZoom}"></script>
                    <script src="${uriVega}"></script>
                    <script src="${uriVegaEmbed}"></script>
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
                        mode: "vega",
                        actions: false,
                        renderer: "svg"
                    }
                    var spec = ${payload}
                    vegaEmbed('#plot-element', spec, opt);
                </script>
            </html>`
        addOrUpdatePlot(plotPaneContent, id)
    } else if (kind === 'application/vnd.plotly.v1+json') {
        showPlotPane()
        const uriPlotly = g_plotPanel.webview.asWebviewUri(
            vscode.Uri.file(path.join(g_context.extensionPath, 'libs', 'plotly', 'plotly.min.js'))
        )
        const plotPaneContent = `
        <html>
        <head>
            <script src="${uriPlotly}"></script>
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
        addOrUpdatePlot(plotPaneContent, id)
    } else if (kind === 'application/vnd.dataresource+json') {
        return displayTable(payload, g_context, false, kernel)
    } else if (kind === 'application/vnd.dataresource+lazy') {
        return displayTable(payload, g_context, true, kernel)
    } else if (kind === 'application/vnd.julia-vscode.custompane+html') {
        return displayCustom(payload, id, title)
    } else {
        throw new Error()
    }

    if (vscode.workspace.getConfiguration('julia').get('focusPlotNavigator')) {
        g_plotNavigatorProvider?.showPlotNavigator()
    }
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
