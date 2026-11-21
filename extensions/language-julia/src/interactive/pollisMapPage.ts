/// <reference lib="dom" />
// Pollis: a map of Pollis.webmap, or a viewer of Pollis.streetview, on a page of its own, which Pollis.jl writes and
// opens in Pollis' browser. The page loads MapLibre GL JS (and MapillaryJS for a viewer) from the extension's libs, and
// this script, which draws the map with drawPollisMap, as notebook outputs do, and writes what the map shows as text,
// for screen readers and for agents that read the page.
import { drawPollisMap, MAP_CSS, MAP_STYLES } from './pollisMap'

declare global {
    interface Window {
        maplibregl?: unknown
        mapillary?: unknown
        PollisMap?: { draw(holder: HTMLElement, text: HTMLElement, spec: unknown): { remove(): void } }
    }
}

/** A layer of a map as its JSON gives it: only what the text uses. */
interface LayerSpec {
    readonly name?: string
    readonly tiles?: string
    readonly attribution?: string
    readonly opacity?: number
    readonly column?: string | null
    readonly data?: { readonly features?: ReadonlyArray<{ readonly geometry?: { readonly type?: string } | null, readonly properties?: Record<string, unknown> | null }> }
}

/** A map as its JSON gives it: only what the text uses. */
interface MapSpec {
    readonly title?: string
    readonly style?: string
    readonly center?: readonly number[] | null
    readonly zoom?: number | null
    readonly layers?: readonly LayerSpec[]
    readonly streetview?: { readonly image?: string, readonly map?: boolean }
}

/** The lines of text that say what the map shows: its title, base map, view, layers and viewer. */
function describe(spec: MapSpec): string[] {
    const lines: string[] = []
    if (spec.streetview) {
        lines.push(`A street-level viewer of Mapillary, opened on the image ${spec.streetview.image}` + (spec.streetview.map ? ', beside a map of Mapillary\'s coverage.' : '.'))
        if (!spec.streetview.map) {
            return lines
        }
    }
    lines.push(`Base map: OpenStreetMap data, style ${spec.style || 'positron'}.`)
    lines.push(spec.center ? `Centre: longitude ${spec.center[0]}, latitude ${spec.center[1]}, zoom ${spec.zoom ?? 'not given'}.`
        : spec.streetview ? 'The map is centred on the image the viewer shows, and follows it.'
            : spec.layers && spec.layers.length ? 'The view fits the layers.' : 'The view shows the whole world.')
    ;(spec.layers || []).forEach((layer, index) => {
        const name = layer.name || `Layer ${index + 1}`
        if (layer.tiles) {
            let host = layer.tiles
            try {
                host = new URL(layer.tiles.replace(/\{[^}]*\}/g, '0')).host
            } catch {
                // the address as it is
            }
            lines.push(`Layer ${name}: raster tiles from ${host}, opacity ${layer.opacity ?? 1}` + (layer.attribution ? `; ${layer.attribution}.` : '.'))
            return
        }
        const features = (layer.data && layer.data.features) || []
        const kinds = new Map<string, number>()
        features.forEach(f => {
            const kind = (f.geometry && f.geometry.type) || 'no geometry'
            kinds.set(kind, (kinds.get(kind) || 0) + 1)
        })
        const counts = [...kinds].map(([kind, n]) => `${n} ${kind}`).join(', ')
        let colour = ''
        if (layer.column) {
            const values = features.map(f => f.properties && f.properties[layer.column as string]).filter(v => v !== null && v !== undefined)
            const numbers = values.filter((v): v is number => typeof v === 'number')
            colour = values.length && numbers.length === values.length
                ? `, coloured by ${layer.column} from ${Math.min(...numbers)} to ${Math.max(...numbers)}`
                : `, coloured by ${layer.column}, ${new Set(values.map(String)).size} values`
        }
        lines.push(`Layer ${name}: ${features.length} features (${counts || 'none'})${colour}.`)
    })
    return lines
}

/** Draws the map of `spec` in `holder`, and writes what it shows into `text`. */
function draw(holder: HTMLElement, text: HTMLElement, spec: MapSpec): { remove(): void } {
    const style = document.createElement('style')
    style.textContent = MAP_CSS
    document.head.append(style)
    document.title = spec.title || (spec.streetview ? 'Street-Level Viewer' : 'Map')
    const list = document.createElement('ul')
    for (const line of describe(spec)) {
        const item = document.createElement('li')
        item.textContent = line
        list.append(item)
    }
    const heading = document.createElement('h1')
    heading.textContent = document.title
    text.replaceChildren(heading, list)
    return drawPollisMap(window.maplibregl, holder, spec, MAP_STYLES, window.mapillary)
}

window.PollisMap = { draw }
