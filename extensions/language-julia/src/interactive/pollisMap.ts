// Pollis: maps of Pollis.webmap (application/vnd.pollis.map+json), drawn with MapLibre GL JS in the plot pane and in
// notebook outputs: a base map, and on it GeoJSON layers, each in one colour or coloured by a column, and layers of
// raster tiles (Pollis.tiles), with a legend and the attributes of a feature on a click.

/** The base maps: OpenStreetMap data as vector tiles of OpenFreeMap, which asks for no key. */
export const MAP_STYLES: Record<string, string> = {
    positron: 'https://tiles.openfreemap.org/styles/positron',
    bright: 'https://tiles.openfreemap.org/styles/bright',
    liberty: 'https://tiles.openfreemap.org/styles/liberty',
    dark: 'https://tiles.openfreemap.org/styles/dark',
    fiord: 'https://tiles.openfreemap.org/styles/fiord',
}

/** The look of a map's title, legend and popups, inside the element of class pollis-map that holds the map. */
export const MAP_CSS = `
.pollis-map { position: relative; overflow: hidden; }
.pollis-map .pollis-map-canvas { position: absolute; inset: 0; }
.pollis-map .pollis-map-box { position: absolute; z-index: 2; background: rgba(255, 255, 255, 0.92); color: #222;
    font: 12px/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 6px 9px;
    border-radius: 4px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25); max-width: 40%; }
.pollis-map .pollis-map-title { top: 10px; left: 10px; font-size: 14px; font-weight: 600; }
.pollis-map .pollis-map-legend { bottom: 30px; right: 10px; max-height: 60%; overflow-y: auto; }
.pollis-map .pollis-map-legend-image { display: block; max-width: 100%; margin: 2px 0 4px; }
.pollis-map .pollis-map-legend-layer { margin: 2px 0 4px; font-weight: 600; }
.pollis-map .pollis-map-swatch { display: inline-block; width: 11px; height: 11px; margin-right: 5px;
    vertical-align: -1px; border-radius: 2px; }
.pollis-map .pollis-map-ramp { height: 9px; width: 140px; border-radius: 2px; }
.pollis-map .pollis-map-range { display: flex; justify-content: space-between; width: 140px; }
.pollis-map .maplibregl-popup-content { color: #222; }
.pollis-map .maplibregl-popup-content table { border-collapse: collapse; font-size: 12px; }
.pollis-map .maplibregl-popup-content td { padding: 1px 6px 1px 0; vertical-align: top; }
.pollis-map .maplibregl-popup-content td:first-child { color: #666; }
`

/** The element that holds a map, of class pollis-map: only what the drawing uses of it. */
interface MapHolder {
    insertAdjacentHTML(position: 'beforeend', html: string): void
    readonly lastElementChild: unknown
}

/**
 * Draws a map of Pollis.webmap in `holder`, with the MapLibre GL JS of the page (`maplibregl`, which has no types
 * here), and returns the MapLibre map. The function refers to nothing outside itself, as the plot pane puts its
 * source in the page it shows.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function drawPollisMap(maplibregl: any, holder: MapHolder, spec: any, styles: Record<string, string>): { remove(): void } {
    const palette = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac']
    const ramp = ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725']
    const escape = (text: unknown) => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
    const layers = (spec.layers || []).map((layer, index) => {
        const features = (layer.data && layer.data.features) || []
        const name = layer.name || 'Layer ' + (index + 1)
        if (layer.tiles) {
            // a layer of raster tiles: its name, and the image of its legend when the service gives one
            return { ...layer, name, legend: '<div class="pollis-map-legend-layer">' + escape(name) + '</div>'
                + (layer.legendImage ? '<img class="pollis-map-legend-image" alt="" src="' + escape(layer.legendImage) + '">' : '') }
        }
        const fixed = layer.color || palette[index % palette.length]
        if (!layer.column) {
            return { ...layer, name, colour: fixed, legend: '<span class="pollis-map-swatch" style="background:' + fixed + '"></span>' + escape(name) }
        }
        const heading = name === layer.column ? name : name + ': ' + layer.column
        const values = features.map(f => f.properties && f.properties[layer.column]).filter(v => v !== null && v !== undefined)
        if (values.length && values.every(v => typeof v === 'number')) {
            const low = Math.min(...values), high = Math.max(...values)
            // a feature without a number in the column is grey, not the colour of 0
            const colour = ['case', ['==', ['typeof', ['get', layer.column]], 'number'],
                low === high ? ramp[2] : ['interpolate', ['linear'], ['get', layer.column], ...ramp.flatMap((c, i) => [low + (high - low) * i / (ramp.length - 1), c])],
                '#999999']
            const format = (v: number) => Number(v.toPrecision(4)).toLocaleString()
            return { ...layer, name, colour, legend: '<div class="pollis-map-legend-layer">' + escape(heading) + '</div>'
                + '<div class="pollis-map-ramp" style="background:linear-gradient(to right,' + ramp.join(',') + ')"></div>'
                + '<div class="pollis-map-range"><span>' + format(low) + '</span><span>' + format(high) + '</span></div>' }
        }
        // the most common values first: the first ten get a colour each, the rest one grey
        const counts = new Map<string, number>()
        values.forEach(v => counts.set(String(v), (counts.get(String(v)) || 0) + 1))
        const categories = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a))
        const shown = categories.slice(0, palette.length)
        const colour = shown.length ? ['match', ['to-string', ['get', layer.column]], ...shown.flatMap((c, i) => [c, palette[i]]), '#999999'] : '#999999'
        const items = shown.map((c, i) => '<div><span class="pollis-map-swatch" style="background:' + palette[i] + '"></span>' + escape(c) + '</div>').join('')
            + (categories.length > shown.length ? '<div><span class="pollis-map-swatch" style="background:#999999"></span>' + (categories.length - shown.length) + ' more</div>' : '')
        return { ...layer, name, colour, legend: '<div class="pollis-map-legend-layer">' + escape(heading) + '</div>' + items }
    })
    holder.insertAdjacentHTML('beforeend', '<div class="pollis-map-canvas"></div>')
    const map = new maplibregl.Map({
        container: holder.lastElementChild,
        style: styles[spec.style] || spec.style || styles.positron,
        center: spec.center || [0, 20],
        zoom: spec.zoom ?? 1,
        canvasContextAttributes: { preserveDrawingBuffer: true },
    })
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')
    if (spec.title) {
        holder.insertAdjacentHTML('beforeend', '<div class="pollis-map-box pollis-map-title">' + escape(spec.title) + '</div>')
    }
    if (layers.length) {
        holder.insertAdjacentHTML('beforeend', '<div class="pollis-map-box pollis-map-legend">' + layers.map(l => '<div>' + l.legend + '</div>').join('') + '</div>')
    }
    // the box around every coordinate of the layers, which the map fits when it is given no centre
    let bounds = null
    const extend = c => {
        if (typeof c[0] === 'number') {
            bounds = bounds ? bounds.extend(c) : new maplibregl.LngLatBounds(c, c)
        } else {
            c.forEach(extend)
        }
    }
    layers.forEach(l => ((l.data && l.data.features) || []).forEach(f => f.geometry && f.geometry.coordinates && extend(f.geometry.coordinates)))
    const clickable = []
    map.on('load', () => {
        // polygons go under the base map's labels, so place names stay readable
        const labels = (map.getStyle().layers.find(layer => layer.type === 'symbol') || {}).id
        layers.forEach((l, i) => {
            const source = 'pollis-layer-' + i
            if (l.tiles) {
                // imagery goes under the base map's labels too, in the order of the layers
                map.addSource(source, { type: 'raster', tiles: [l.tiles], tileSize: l.tileSize || 256, maxzoom: l.maxzoom ?? 22, attribution: l.attribution || undefined })
                map.addLayer({ id: source + '-raster', type: 'raster', source, paint: { 'raster-opacity': l.opacity ?? 1 } }, labels)
                return
            }
            const opacity = l.opacity ?? 0.6
            map.addSource(source, { type: 'geojson', data: l.data || { type: 'FeatureCollection', features: [] } })
            const is = (types: string[]) => ['in', ['geometry-type'], ['literal', types]]
            map.addLayer({ id: source + '-fill', type: 'fill', source, filter: is(['Polygon', 'MultiPolygon']), paint: { 'fill-color': l.colour, 'fill-opacity': opacity } }, labels)
            map.addLayer({ id: source + '-outline', type: 'line', source, filter: is(['Polygon', 'MultiPolygon']), paint: { 'line-color': l.colour, 'line-width': 1 } }, labels)
            map.addLayer({ id: source + '-line', type: 'line', source, filter: is(['LineString', 'MultiLineString']), paint: { 'line-color': l.colour, 'line-width': 2.5, 'line-opacity': Math.max(opacity, 0.8) } })
            map.addLayer({ id: source + '-point', type: 'circle', source, filter: is(['Point', 'MultiPoint']), paint: { 'circle-color': l.colour, 'circle-radius': 5, 'circle-opacity': Math.max(opacity, 0.8), 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1 } })
            clickable.push(source + '-fill', source + '-line', source + '-point')
        })
        clickable.forEach(id => {
            map.on('click', id, e => {
                const properties = e.features[0].properties || {}
                const rows = Object.keys(properties).map(k => '<tr><td>' + escape(k) + '</td><td>' + escape(properties[k]) + '</td></tr>').join('')
                new maplibregl.Popup({ maxWidth: '320px' }).setLngLat(e.lngLat).setHTML('<table>' + (rows || '<tr><td>No attributes</td></tr>') + '</table>').addTo(map)
            })
            map.on('mouseenter', id, () => { map.getCanvas().style.cursor = 'pointer' })
            map.on('mouseleave', id, () => { map.getCanvas().style.cursor = '' })
        })
        if (!spec.center && bounds) {
            map.fitBounds(bounds, { padding: 40, maxZoom: 15, duration: 0 })
        }
    })
    return map
}
