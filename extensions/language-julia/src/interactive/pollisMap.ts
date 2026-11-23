// Pollis: maps of Pollis.webmap (application/vnd.pollis.map+json), drawn with MapLibre GL JS in the plot pane and in
// notebook outputs: a base map, and on it GeoJSON layers, each in one colour or coloured by a column, and layers of
// raster tiles (Pollis.tiles), with a legend and the attributes of a feature on a click. Layers with years get a slider
// under the map, with Play, which shows the features of one year. A map of Pollis.streetview
// is a viewer of Mapillary's street-level images, drawn with MapillaryJS, alone or beside a map of Mapillary's coverage.

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
.pollis-map .pollis-map-timed { position: absolute; top: 0; left: 0; right: 0; bottom: 40px; overflow: hidden; }
.pollis-map .pollis-map-time { position: absolute; left: 0; right: 0; bottom: 0; height: 40px; box-sizing: border-box;
    display: flex; align-items: center; gap: 10px; padding: 0 12px; background: #ffffff; color: #222;
    font: 12px/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; border-top: 1px solid #d0d0d0; }
.pollis-map .pollis-map-time button { flex: none; width: 56px; padding: 3px 0; font: inherit; color: #222;
    background: #f2f2f2; border: 1px solid #bbb; border-radius: 3px; cursor: pointer; }
.pollis-map .pollis-map-time input { flex: 1; min-width: 80px; margin: 0; }
.pollis-map .pollis-map-year { flex: none; min-width: 74px; font-size: 18px; font-weight: 600; text-align: right; }
.pollis-map .pollis-map-note { flex: 0 1 auto; min-width: 0; max-width: 45%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pollis-map .maplibregl-popup-content { color: #222; }
.pollis-map .maplibregl-popup-content table { border-collapse: collapse; font-size: 12px; }
.pollis-map .maplibregl-popup-content td { padding: 1px 6px 1px 0; vertical-align: top; }
.pollis-map .maplibregl-popup-content td:first-child { color: #666; }
.pollis-map .pollis-streetview { position: absolute; top: 0; bottom: 0; left: 0; width: 100%; }
.pollis-map .pollis-streetview-half { width: 55%; }
.pollis-map .pollis-streetview-map { position: absolute; top: 0; bottom: 0; right: 0; width: 45%; overflow: hidden;
    border-left: 2px solid #ffffff; }
.pollis-map .pollis-streetview-message { top: 10px; left: 10px; max-width: 80%; }
.pollis-map .pollis-streetview-marker { width: 0; height: 0; border-left: 8px solid transparent;
    border-right: 8px solid transparent; border-bottom: 20px solid #e15759; filter: drop-shadow(0 0 2px #ffffff); }
`

/** The element that holds a map, of class pollis-map: only what the drawing uses of it. */
interface MapHolder {
    insertAdjacentHTML(position: 'beforeend', html: string): void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly lastElementChild: any
}

/**
 * Draws a map of Pollis.webmap in `holder`, with the MapLibre GL JS of the page (`maplibregl`, which has no types
 * here), and returns what removes it. A map of Pollis.streetview is drawn with the MapillaryJS of the page
 * (`mapillary`). The function refers to nothing outside itself, as the plot pane puts its source in the page it shows.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function drawPollisMap(maplibregl: any, holder: MapHolder, spec: any, styles: Record<string, string>, mapillary?: any): { remove(): void } {
    const palette = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac']
    const ramp = ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725']
    const yearText = (y: number) => y < 0 ? -y + ' BCE' : String(y)
    // the hue of a value comes from its text alone, so that a name keeps its colour from one map to another
    const colourOf = (value: string) => {
        let hash = 2166136261
        for (let i = 0; i < value.length; i++) {
            hash = Math.imul(hash ^ value.charCodeAt(i), 16777619) >>> 0
        }
        return 'hsl(' + hash % 360 + ',55%,' + (54 + (hash >>> 12) % 3 * 8) + '%)'
    }
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
        if (layer.years && categories.length > palette.length) {
            // a layer with years can hold hundreds of names, few of them in any one year: each gets a colour
            return { ...layer, name, colour: ['match', ['to-string', ['get', layer.column]], ...categories.flatMap(c => [c, colourOf(c)]), '#999999'],
                legend: '<div class="pollis-map-legend-layer">' + escape(heading) + '</div><div>' + categories.length + ' values: point at one to read it</div>' }
        }
        const shown = categories.slice(0, palette.length)
        const colour = shown.length ? ['match', ['to-string', ['get', layer.column]], ...shown.flatMap((c, i) => [c, palette[i]]), '#999999'] : '#999999'
        const items = shown.map((c, i) => '<div><span class="pollis-map-swatch" style="background:' + palette[i] + '"></span>' + escape(c) + '</div>').join('')
            + (categories.length > shown.length ? '<div><span class="pollis-map-swatch" style="background:#999999"></span>' + (categories.length - shown.length) + ' more</div>' : '')
        return { ...layer, name, colour, legend: '<div class="pollis-map-legend-layer">' + escape(heading) + '</div>' + items }
    })
    // a street-level viewer: on its own, or on the left of a map of Mapillary's coverage
    const street = spec.streetview
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let viewer: any = null
    const say = (where: MapHolder, text: string) =>
        where.insertAdjacentHTML('beforeend', '<div class="pollis-map-box pollis-streetview-message">' + escape(text) + '</div>')
    // a move cancelled by the next one, as when the map is clicked again before the image opens, is no failure
    const failed = (where: MapHolder, id: string) => (error: { name?: string, message?: string }) =>
        error && error.name === 'CancelMapillaryError' || say(where, 'Mapillary cannot open the image ' + id + ': ' + (error && error.message || error))
    let area = holder
    if (street) {
        holder.insertAdjacentHTML('beforeend', '<div class="pollis-streetview' + (street.map ? ' pollis-streetview-half' : '') + '"></div>')
        const element = holder.lastElementChild
        if (!mapillary) {
            say(holder, 'MapillaryJS is not loaded in this page, so the street-level images cannot be shown.')
        } else if (!street.token) {
            say(holder, 'There is no Mapillary access token: set the Mapillary key, or give Pollis.streetview a token.')
        } else {
            viewer = new mapillary.Viewer({ accessToken: street.token, container: element, component: { cover: false } })
            viewer.moveTo(street.image).catch(failed(holder, street.image))
        }
        if (!street.map) {
            if (spec.title) {
                holder.insertAdjacentHTML('beforeend', '<div class="pollis-map-box pollis-map-title">' + escape(spec.title) + '</div>')
            }
            return { remove() { viewer && viewer.remove() } }
        }
        holder.insertAdjacentHTML('beforeend', '<div class="pollis-streetview-map"></div>')
        area = holder.lastElementChild
    }
    // the layers with years, and the first and last year that they name
    const timed = layers.filter(l => !l.tiles && l.years)
    let first = Infinity, last = -Infinity
    timed.forEach(l => ((l.data && l.data.features) || []).forEach(f => l.years.forEach(key => {
        const y = f.properties ? f.properties[key] : null
        if (typeof y === 'number') {
            first = Math.min(first, Math.floor(y))
            last = Math.max(last, Math.ceil(y))
        }
    })))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let bar: any = null
    let year = 0
    if (first <= last) {
        year = Math.min(last, Math.max(first, Math.round(spec.year ?? first)))
        area.insertAdjacentHTML('beforeend', '<div class="pollis-map-time"><button type="button">Play</button>'
            + '<input type="range" aria-label="Year" step="1" min="' + first + '" max="' + last + '" value="' + year + '">'
            + '<span class="pollis-map-year"></span><span class="pollis-map-note"></span></div>')
        bar = area.lastElementChild
        // the map takes the space above the slider, with its boxes and controls
        area.insertAdjacentHTML('beforeend', '<div class="pollis-map-timed"></div>')
        area = area.lastElementChild
    }
    area.insertAdjacentHTML('beforeend', '<div class="pollis-map-canvas"></div>')
    const map = new maplibregl.Map({
        container: area.lastElementChild,
        style: styles[spec.style] || spec.style || styles.positron,
        center: spec.center || [0, 20],
        zoom: spec.zoom ?? 1,
        canvasContextAttributes: { preserveDrawingBuffer: true },
    })
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')
    if (spec.title) {
        area.insertAdjacentHTML('beforeend', '<div class="pollis-map-box pollis-map-title">' + escape(spec.title) + '</div>')
    }
    if (layers.length) {
        area.insertAdjacentHTML('beforeend', '<div class="pollis-map-box pollis-map-legend">' + layers.map(l => '<div>' + l.legend + '</div>').join('') + '</div>')
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
    // a feature is shown from its first year to its last, both included, and without end on a side with no year
    const inYear = l => ['all', ['<=', ['coalesce', ['get', l.years[0]], -1e9], year], ['>=', ['coalesce', ['get', l.years[1]], 1e9], year]]
    // the MapLibre layers whose filter follows the year: the layer of the map, and the filter of their geometries
    const filtered = []
    const hover = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 8 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pinned: any = null
    let timer = null
    if (bar) {
        const button = bar.querySelector('button'), slider = bar.querySelector('input')
        const at = bar.querySelector('.pollis-map-year'), note = bar.querySelector('.pollis-map-note')
        // the years in which a feature appears, or is gone
        const changes = new Set<number>()
        timed.forEach(l => ((l.data && l.data.features) || []).forEach(f => {
            const start = f.properties ? f.properties[l.years[0]] : null
            const end = f.properties ? f.properties[l.years[1]] : null
            if (typeof start === 'number') {
                changes.add(start)
            }
            if (typeof end === 'number' && end < last) {
                changes.add(end + 1)
            }
        }))
        let drawn = null
        const show = () => {
            year = Number(slider.value)
            at.textContent = yearText(year)
            slider.setAttribute('aria-valuetext', yearText(year))
            const visible = [], counts = []
            timed.forEach(l => {
                const named = new Set<string>()
                ;((l.data && l.data.features) || []).forEach((f, i) => {
                    const p = f.properties || {}
                    if ((p[l.years[0]] ?? -1e9) <= year && (p[l.years[1]] ?? 1e9) >= year) {
                        visible.push(i)
                        named.add(String(l.column ? p[l.column] : i))
                    }
                })
                visible.push(';')
                counts.push(l.name + ': ' + named.size)
            })
            let changed = -Infinity
            changes.forEach(c => changed = c <= year ? Math.max(c, changed) : changed)
            note.textContent = counts.join(', ') + (isFinite(changed) ? '; last change in ' + yearText(changed) : '')
            note.title = note.textContent
            // most years change nothing, and a new filter makes the map redo its tiles
            const key = visible.join()
            if (key !== drawn) {
                drawn = key
                filtered.forEach(([id, l, kinds]) => map.setFilter(id, ['all', kinds, inYear(l)]))
                hover.remove()
                // the attributes held open belong to the year left
                if (pinned) {
                    pinned.remove()
                }
            }
        }
        const pause = () => {
            clearInterval(timer)
            timer = null
            button.textContent = 'Play'
        }
        button.onclick = () => {
            if (timer) {
                pause()
                return
            }
            if (Number(slider.value) >= last) {
                slider.value = first
                show()
            }
            button.textContent = 'Pause'
            timer = setInterval(() => {
                slider.value = Number(slider.value) + 1
                show()
                if (Number(slider.value) >= last) {
                    pause()
                }
            }, 120)
        }
        slider.oninput = show
        show()
    }
    map.on('load', () => {
        const base = map.getStyle().layers
        // polygons go under the base map's labels, so place names stay readable
        const labels = (base.find(layer => layer.type === 'symbol') || {}).id
        if (spec.labels === false) {
            // without the names and borders of today, as a map of the past asks
            base.forEach(layer => (layer.type === 'symbol' || layer['source-layer'] === 'boundary') && map.setLayoutProperty(layer.id, 'visibility', 'none'))
        }
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
            const follows = bar && l.years
            const is = (id: string, types: string[]) => {
                const kinds = ['in', ['geometry-type'], ['literal', types]]
                if (follows) {
                    filtered.push([source + id, l, kinds])
                    return ['all', kinds, inYear(l)]
                }
                return kinds
            }
            // neighbours of successive years are told apart by a dark line rather than by their colours alone
            const edge = follows && l.column
            map.addLayer({ id: source + '-fill', type: 'fill', source, filter: is('-fill', ['Polygon', 'MultiPolygon']), paint: { 'fill-color': l.colour, 'fill-opacity': opacity } }, labels)
            map.addLayer({ id: source + '-outline', type: 'line', source, filter: is('-outline', ['Polygon', 'MultiPolygon']), paint: { 'line-color': edge ? '#333333' : l.colour, 'line-width': edge ? 0.6 : 1 } }, labels)
            map.addLayer({ id: source + '-line', type: 'line', source, filter: is('-line', ['LineString', 'MultiLineString']), paint: { 'line-color': l.colour, 'line-width': 2.5, 'line-opacity': Math.max(opacity, 0.8) } })
            map.addLayer({ id: source + '-point', type: 'circle', source, filter: is('-point', ['Point', 'MultiPoint']), paint: { 'circle-color': l.colour, 'circle-radius': 5, 'circle-opacity': Math.max(opacity, 0.8), 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1 } })
            const drawnAs = [source + '-fill', source + '-line', source + '-point']
            clickable.push(...drawnAs)
            if (edge) {
                // pointing at a feature gives its value and years, unless a click holds its attributes open
                drawnAs.forEach(id => {
                    map.on('mousemove', id, e => {
                        if (pinned && pinned.isOpen()) {
                            return
                        }
                        const p = e.features[0].properties || {}
                        const from = p[l.years[0]], to = p[l.years[1]]
                        const span = typeof from === 'number' && typeof to === 'number' ? (from === to ? yearText(from) : yearText(from) + ' to ' + yearText(to))
                            : typeof from === 'number' ? 'from ' + yearText(from) : typeof to === 'number' ? 'until ' + yearText(to) : ''
                        hover.setLngLat(e.lngLat).setText([p[l.column] ?? '', span].filter(text => text !== '').join(', ')).addTo(map)
                    })
                    map.on('mouseleave', id, () => hover.remove())
                })
            }
        })
        clickable.forEach(id => {
            map.on('click', id, e => {
                const properties = e.features[0].properties || {}
                const rows = Object.keys(properties).map(k => '<tr><td>' + escape(k) + '</td><td>' + escape(properties[k]) + '</td></tr>').join('')
                hover.remove()
                pinned = new maplibregl.Popup({ maxWidth: '320px' }).setLngLat(e.lngLat).setHTML('<table>' + (rows || '<tr><td>No attributes</td></tr>') + '</table>').addTo(map)
            })
            map.on('mouseenter', id, () => { map.getCanvas().style.cursor = 'pointer' })
            map.on('mouseleave', id, () => { map.getCanvas().style.cursor = '' })
        })
        if (!spec.center && bounds && !viewer) {
            // a map in a tab not shown yet has no room for the layers: it fits them when the tab gives it some
            const fit = () => {
                const container = map.getContainer()
                if (container.clientWidth <= 100 || container.clientHeight <= 100) {
                    return false
                }
                map.fitBounds(bounds, { padding: 40, maxZoom: 15, duration: 0 })
                return true
            }
            if (!fit()) {
                const later = () => {
                    if (fit()) {
                        map.off('resize', later)
                    }
                }
                map.on('resize', later)
            }
        }
        if (viewer) {
            // Mapillary's vector tiles: its sequences as lines, and its images as dots from zoom 14
            map.addSource('mapillary', { type: 'vector', tiles: ['https://tiles.mapillary.com/maps/vtp/mly1_computed_public/2/{z}/{x}/{y}?access_token=' + encodeURIComponent(street.token)],
                minzoom: 6, maxzoom: 14, attribution: '© Mapillary' })
            map.addLayer({ id: 'mapillary-sequences', type: 'line', source: 'mapillary', 'source-layer': 'sequence',
                layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#05cb63', 'line-width': 2, 'line-opacity': 0.7 } })
            map.addLayer({ id: 'mapillary-images', type: 'circle', source: 'mapillary', 'source-layer': 'image', minzoom: 14,
                paint: { 'circle-color': '#05cb63', 'circle-radius': 3.5, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1 } })
            // a click opens the image clicked, or the first image of the sequence clicked
            map.on('click', e => {
                const near = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]]
                const image = map.queryRenderedFeatures(near, { layers: ['mapillary-images'] })[0]
                const sequence = image ? null : map.queryRenderedFeatures(near, { layers: ['mapillary-sequences'] })[0]
                const id = image ? image.properties.id : sequence ? sequence.properties.image_id : null
                if (id !== null && id !== undefined) {
                    viewer.moveTo(String(id)).catch(failed(area, String(id)))
                }
            })
            map.on('mouseenter', 'mapillary-images', () => { map.getCanvas().style.cursor = 'pointer' })
            map.on('mouseleave', 'mapillary-images', () => { map.getCanvas().style.cursor = '' })
            map.on('mouseenter', 'mapillary-sequences', () => { map.getCanvas().style.cursor = 'pointer' })
            map.on('mouseleave', 'mapillary-sequences', () => { map.getCanvas().style.cursor = '' })
        }
    })
    if (viewer) {
        // a marker on the map follows the viewer as it walks, pointing where it looks
        const arrow = document.createElement('div')
        arrow.className = 'pollis-streetview-marker'
        const marker = new maplibregl.Marker({ element: arrow, rotationAlignment: 'map' })
        let placed = false
        viewer.on('image', e => {
            const at = [e.image.lngLat.lng, e.image.lngLat.lat]
            marker.setLngLat(at)
            if (!placed) {
                marker.addTo(map)
                map.jumpTo({ center: at, zoom: spec.zoom ?? 17 })
                placed = true
            } else {
                map.easeTo({ center: at, duration: 400 })
            }
        })
        viewer.on('bearing', e => marker.setRotation(e.bearing))
    }
    return { remove() { clearInterval(timer); viewer && viewer.remove(); map.remove() } }
}
