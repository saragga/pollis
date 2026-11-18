/// <reference lib="dom" />
// Pollis: the notebook renderer of maps of Pollis.webmap (application/vnd.pollis.map+json). It loads MapLibre GL JS from
// the extension's libs/maplibre the first time a map is shown, and draws each map with drawPollisMap, as the plot pane
// does.
import { drawPollisMap, MAP_CSS, MAP_STYLES } from '../interactive/pollisMap.js'

/** An output of a notebook cell, as the renderer API gives it: only what the renderer uses. */
interface OutputItem {
    readonly id: string
    json(): unknown
}

declare global {
    interface Window {
        maplibregl?: unknown
    }
}

/** The height of a map in a notebook output, in pixels: outputs have no height of their own. */
const MAP_HEIGHT = 480

let loading: Promise<void> | undefined

/** Loads MapLibre GL JS, its stylesheet and the maps' own styles into the notebook's page, once. */
function loadMapLibre(): Promise<void> {
    loading ??= new Promise<void>((resolve, reject) => {
        const lib = new URL('../libs/maplibre/', import.meta.url)
        const css = document.createElement('link')
        css.rel = 'stylesheet'
        css.href = new URL('maplibre-gl.css', lib).href
        const style = document.createElement('style')
        style.textContent = MAP_CSS
        const script = document.createElement('script')
        script.src = new URL('maplibre-gl.js', lib).href
        script.onload = () => window.maplibregl ? resolve() : reject(new Error('maplibregl is not defined after loading maplibre-gl.js'))
        script.onerror = () => reject(new Error(`Cannot load ${script.src}`))
        document.head.append(css, style, script)
    })
    return loading
}

export function activate() {
    const maps = new Map<string, { remove(): void }>()
    const dispose = (id: string) => {
        maps.get(id)?.remove()
        maps.delete(id)
    }
    return {
        async renderOutputItem(item: OutputItem, element: HTMLElement) {
            dispose(item.id)
            element.replaceChildren()
            await loadMapLibre()
            const holder = document.createElement('div')
            holder.className = 'pollis-map'
            holder.style.height = `${MAP_HEIGHT}px`
            element.append(holder)
            maps.set(item.id, drawPollisMap(window.maplibregl, holder, item.json(), MAP_STYLES))
        },
        disposeOutputItem(id?: string) {
            if (id) {
                dispose(id)
            } else {
                [...maps.keys()].forEach(dispose)
            }
        },
    }
}
