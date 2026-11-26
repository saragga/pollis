# Copyright (c) 2026 Antonio Saragga Seabra
# SPDX-License-Identifier: MIT

# Pollis: functions every Pollis Julia session has, the REPL (terminalserver.jl) and the notebook
# kernel (notebook.jl) alike. Loads no packages until one of them is called.
module Pollis

const PKG = Base.PkgId(Base.UUID("44cfe95a-1eb2-52ea-b672-e2afdf69b78f"), "Pkg")

"""The Julia environment of the packages built into Pollis (PollisDatasets, DuckDB), one per Julia minor version: PollisDB installs into it."""
const ENVIRONMENT = joinpath(homedir(), ".pollis", "julia", "environments", "v$(VERSION.major).$(VERSION.minor)")

# After the user's environments, so that their own versions of these packages come first.
ENVIRONMENT in LOAD_PATH || push!(LOAD_PATH, ENVIRONMENT)

# The Pollis registry, of Pollis's own packages (PollisDatasets, PollisTeX, EDGAR, HARE, the article methods and others), so a bare name is enough.
include(joinpath(@__DIR__, "pollis_registry.jl"))

"""
    Pollis.packages(names...; forks = (), minimum = ())

Step 0 of every workflow, notebook and Code Example: install whichever of the named packages the
active environment cannot load, upgrade those older than their `minimum`, and do nothing when all are there.

A name is a string, `"Plots"` or `"PollisDatasets"`: added by name from General or from the Pollis
registry, which is added and updated first when a name to install is in it or in no registry
reachable yet, so that an install sees the latest releases of Pollis's own packages. A package in no
registry is given with its link, `"Name" => "https://github.com/owner/Name.jl"`: added by name if a reachable
registry has it, from the link otherwise. A name in `forks` is always added from its link, since the
registered version may be the one present; it is re-added whenever anything is missing.

`minimum` gives the oldest version a package may have, `"HistoricalGeography" => "0.1.6"`: a package
installed in an older version is upgraded to that version or a later one of the same major version, for
code that calls what the older version does not have. A package this Julia has already loaded in its
older version is upgraded all the same, and Julia must be restarted to load the new one: it says so.

The packages installed keep their versions. When that is impossible, only those from the Pollis registry
are upgraded to make room; when that is not enough either, nothing is changed and the error says what
conflicts and how to install all the same, with other packages upgraded.

```julia
Pollis.packages("ARCHModels", "Plots", "PollisDatasets")
```
"""
function packages(names::Union{AbstractString, Pair{<:AbstractString, <:AbstractString}}...; forks = (), minimum = ())
	wanted = [name isa Pair ? (String(first(name)), String(last(name))) : (String(name), "") for name in names]
	least = Dict(String(first(pair)) => VersionNumber(last(pair)) for pair in minimum)
	missing_packages = filter(((name, _),) -> Base.identify_package(name) === nothing, wanted)
	outdated = filter(wanted) do (name, _)
		version = haskey(least, name) ? installed_version(name) : nothing
		return version !== nothing && version < least[name]
	end
	isempty(missing_packages) && isempty(outdated) && return nothing
	# The outdated packages this Julia has loaded: upgraded on disk, but the old version stays loaded
	loaded = [name for (name, _) in outdated if Base.root_module_exists(Base.identify_package(name))]
	to_add = unique([missing_packages; outdated; filter(((name, _),) -> name in forks, wanted)])
	# Pkg is loaded only now, so the adding runs in the newest world, where Pkg's methods exist.
	Base.invokelatest(add, Base.require(PKG), to_add, forks, least)
	isempty(loaded) || println(stderr, "Upgraded ", join(loaded, ", "), ", which this Julia has already loaded in an older version: restart the Julia REPL (or the notebook's kernel) to load the new one.")
	return nothing
end

"""The version of the package `name` that the active environments load, from its Project.toml, without loading it; `nothing` when it cannot be loaded, or has no version."""
function installed_version(name::AbstractString)
	id = Base.identify_package(name)
	id === nothing && return nothing
	source = Base.locate_package(id)
	source === nothing && return nothing
	project = joinpath(dirname(dirname(source)), "Project.toml")
	isfile(project) || return nothing
	version = get(Base.parsed_toml(project), "version", nothing)
	return version isa AbstractString ? VersionNumber(version) : nothing
end

"""
Adds each `(name, link)`: by name if a reachable registry has it and it is not a fork, from its link otherwise.
The Pollis registry is added and updated first when a name that is not a fork is in it, or in no registry reachable
yet: `Pkg.add` updates a registry at most once a day, so by itself it would miss the releases since. A name in
`least` is given its range of versions from its minimum.
"""
function add(Pkg::Module, to_add, forks, least = Dict{String, VersionNumber}())
	has(registry, name) = !isempty(Pkg.Registry.uuids_from_name(registry, name))
	registered(name) = any(registry -> has(registry, name), Pkg.Registry.reachable_registries())
	in_pollis_registry(name) = any(registry -> registry.name == "PollisRegistry" && has(registry, name), Pkg.Registry.reachable_registries())
	if any(((name, _),) -> !(name in forks) && (in_pollis_registry(name) || !registered(name)), to_add)
		add_pollis_registry(Pkg)
		Pkg.Registry.update("PollisRegistry")
	end
	sources = [(name, name in forks || !(isempty(link) || registered(name)) ? link : "") for (name, link) in to_add]
	add_keeping_versions(Pkg, sources, least)
end

"""
Adds each `(name, link)`, by name when the link is empty, with every installed package kept at its version: left to
itself, `Pkg.add` upgrades packages across the environment when it cannot keep them. When they cannot all be kept,
the installed packages of the Pollis registry alone are upgraded and the adding is tried again; when that fails too,
the environment's files are put back as they were, and the error gives the conflict and the command that upgrades.
"""
function add_keeping_versions(Pkg::Module, sources, least = Dict{String, VersionNumber}())
	conflict = resolver_conflict(Pkg) do
		Pkg.add(kept_specs(Pkg, sources, least); preserve = Pkg.PRESERVE_ALL)
	end
	conflict === nothing && return
	environment = Pkg.Types.EnvCache()
	upgradable = upgradable_pollis_packages(Pkg, environment)
	if !isempty(upgradable)
		println(stderr, "The installed versions cannot all be kept: upgrading only the packages of PollisRegistry (", join(sort([spec.name for spec in upgradable]), ", "), ").")
		saved = [file => read(file) for file in (environment.project_file, environment.manifest_file) if isfile(file)]
		installed = false
		try
			conflict = resolver_conflict(Pkg) do
				# Nothing is precompiled before the adding is known to work
				withenv("JULIA_PKG_PRECOMPILE_AUTO" => "0") do
					Pkg.update(upgradable; preserve = Pkg.PRESERVE_ALL, update_registry = false)
					Pkg.add(kept_specs(Pkg, sources, least); preserve = Pkg.PRESERVE_ALL)
				end
			end
			installed = conflict === nothing
		finally
			installed || foreach(((file, content),) -> write(file, content), saved)
		end
		if installed
			Pkg.precompile([name for (name, _) in sources])
			return
		end
	end
	arguments = [!isempty(link) ? "Pkg.PackageSpec(url = $(repr(link)))" :
		haskey(least, name) ? "Pkg.PackageSpec(name = $(repr(name)), version = $(repr(string(least_range(least[name])))))" :
		"Pkg.PackageSpec(name = $(repr(name)))" for (name, link) in sources]
	error("""
	Pollis did not install $(join(first.(sources), ", ")): they conflict with the installed versions, and the environment is left as it was. The conflict:

	$(sprint(showerror, conflict))

	To install all the same, letting Pkg change other packages' versions:

	    import Pkg; Pkg.add([$(join(arguments, ", "))])
	""")
end

"""The versions from `minimum` on, within its major version, as a range Pkg reads: `"0.1.6-0"` for 0.1.6."""
least_range(minimum::VersionNumber) = "$(minimum)-$(minimum.major)"

"""
The specs to add `sources` with. A name in `least` is given its range of versions from its minimum, which upgrades
it; any other name already in the manifest, as another package's dependency, is given its version there: named
without one, it would be free to move.
"""
function kept_specs(Pkg::Module, sources, least = Dict{String, VersionNumber}())
	entries = values(Pkg.Types.EnvCache().manifest.deps)
	return map(sources) do (name, link)
		isempty(link) || return Pkg.PackageSpec(url = link)
		haskey(least, name) && return Pkg.PackageSpec(name = name, version = Pkg.Types.VersionSpec(least_range(least[name])))
		for entry in entries
			if entry.name == name && entry.version !== nothing && entry.path === nothing && entry.repo.source === nothing
				return Pkg.PackageSpec(name = name, version = entry.version)
			end
		end
		return Pkg.PackageSpec(name = name)
	end
end

"The packages of `environment` from the Pollis registry that can be upgraded: not pinned, and not from a folder or a link."
function upgradable_pollis_packages(Pkg::Module, environment)
	registries = filter(registry -> registry.name == "PollisRegistry", Pkg.Registry.reachable_registries())
	upgradable(uuid, entry) = !entry.pinned && entry.path === nothing && entry.repo.source === nothing && any(registry -> haskey(registry, uuid), registries)
	return [Pkg.PackageSpec(name = entry.name, uuid = uuid) for (uuid, entry) in environment.manifest.deps if upgradable(uuid, entry)]
end

"Runs `action` and returns the conflict of versions that stopped it, or `nothing`; any other error is thrown."
function resolver_conflict(action, Pkg::Module)
	try
		action()
		return nothing
	catch err
		err isa Pkg.Resolve.ResolverError || rethrow()
		return err
	end
end

"""
    Pollis.llama_server(model; embeddings = false, thinking = false)

The address of the OpenAI-compatible API (`http://127.0.0.1:<port>/v1`) of the llama-server of
llama.cpp, which Pollis ships, running `model` on this computer: started for it if needed, and
answered once the model is loaded. `model` is the path of a GGUF file or `hf:owner/repo/file.gguf`,
a file on Hugging Face, downloaded into `~/.pollis/models` the first time. `embeddings = true` runs
an embedding model; thinking is off unless `thinking = true`, whatever the model.

```julia
url = Pollis.llama_server("hf:unsloth/Qwen3.5-0.8B-GGUF/Qwen3.5-0.8B-Q4_K_M.gguf")
```
"""
function llama_server(model::AbstractString; embeddings::Bool = false, thinking::Bool = false)
	# The connection to Pollis of this REPL or notebook, through which Pollis starts the server.
	server = isdefined(Main, :VSCodeServer) ? Main.VSCodeServer : nothing
	(server === nothing || server.conn_endpoint[] === nothing) && error("Pollis.llama_server runs only in the Julia REPL or a notebook of Pollis.")
	answer = server.JSONRPC.send_request(server.conn_endpoint[], "pollis/llamaServer", Dict("model" => model, "embeddings" => embeddings, "thinking" => thinking))
	haskey(answer, "error") && error(answer["error"])
	return answer["url"]::String
end

"""
    Pollis.stop_llama_server(model; embeddings = false, thinking = false)

Stops the llama-server that `Pollis.llama_server` started for `model` with the same settings, and returns once it
has ended and its memory is free, so that the next model runs alone in memory.
"""
function stop_llama_server(model::AbstractString; embeddings::Bool = false, thinking::Bool = false)
	server = isdefined(Main, :VSCodeServer) ? Main.VSCodeServer : nothing
	(server === nothing || server.conn_endpoint[] === nothing) && error("Pollis.stop_llama_server runs only in the Julia REPL or a notebook of Pollis.")
	server.JSONRPC.send_request(server.conn_endpoint[], "pollis/stopLlamaServer", Dict("model" => model, "embeddings" => embeddings, "thinking" => thinking))
	return nothing
end

"""
    Pollis.browse(page)

Opens `page` in Pollis' browser: an HTML file, such as the report of a profiler, or a link starting
with `http://` or `https://`. Opened again, the page reloads in the same tab. Outside Pollis, prints
where the page is.

```julia
Pollis.browse(ProfileCanvas.html_file(joinpath(mktempdir(), "flamegraph.html")))
```
"""
function browse(page::AbstractString)
	link = occursin(r"^https?://"i, page)
	!link && !isfile(page) && error("Pollis.browse: there is no file $page.")
	target = link ? String(page) : abspath(page)
	server = isdefined(Main, :VSCodeServer) ? Main.VSCodeServer : nothing
	if server === nothing || server.conn_endpoint[] === nothing
		println("Open ", target)
	else
		server.JSONRPC.send_notification(server.conn_endpoint[], "pollis/browse", Dict("page" => target))
	end
	return nothing
end

"""A map of [`Pollis.webmap`](@ref) or [`Pollis.streetview`](@ref): its JSON, which a page in Pollis' browser and notebook outputs draw."""
struct WebMap
	json::String
end

const MAP_MIME = "application/vnd.pollis.map+json"
Base.show(io::IO, ::MIME{Symbol(MAP_MIME)}, map::WebMap) = print(io, map.json)
Base.show(io::IO, ::MIME"text/plain", ::WebMap) = print(io, "Pollis.webmap: a map, drawn from the REPL on a page in Pollis' browser or in the Plots tab, or in a notebook output")

"""The folder of the Julia extension, whose `libs` and `dist` hold the scripts the page of a map loads."""
const EXTENSION_DIR = normpath(joinpath(@__DIR__, "..", ".."))

"""The folder of this session's map pages, made when the first map is shown and removed when Julia exits."""
const MAP_PAGES = Ref("")

"""The `file://` address of a local file, with the characters an address cannot hold percent-encoded."""
function file_url(path::AbstractString)
	unreserved(c) = isascii(c) && (isletter(c) || isdigit(c) || c in "/:-_.~")
	encoded = join(unreserved(c) ? string(c) : join("%" * uppercase(string(b; base = 16, pad = 2)) for b in codeunits(string(c)))
		for c in replace(abspath(path), '\\' => '/'))
	return startswith(encoded, "/") ? "file://" * encoded : "file:///" * encoded
end

"""
    Pollis.mappage(map; open = true)

Writes the page of a map of [`Pollis.webmap`](@ref) or [`Pollis.streetview`](@ref), which draws it with MapLibre GL JS
and MapillaryJS and says in text what it shows, and opens it in Pollis' browser with [`Pollis.browse`](@ref). The
REPL shows every map this way, or in the Plots tab, as the setting Plots: Show Maps In says; a notebook draws it in
the cell's output instead. The page is named after the map's
title, so a map shown again with the same title replaces it in its tab, while maps of other titles open beside it.
The pages are kept in a temporary folder, removed when Julia exits. Returns the path of the page.
"""
function mappage(map::WebMap; open::Bool = true)
	script = joinpath(EXTENSION_DIR, "dist", "pollisMapPage.js")
	isfile(script) || error("Pollis.mappage: $(script) is missing: the Julia extension has not been built")
	isempty(MAP_PAGES[]) && (MAP_PAGES[] = mktempdir(; prefix = "pollis-maps-"))
	title = match(r"\"title\":\"((?:[^\"\\]|\\.)*)\"", map.json)
	slug = lowercase(join(eachmatch(r"[A-Za-z0-9]+", title === nothing ? "" : title[1]) .|> (m -> m.match), "-"))
	street = occursin("\"streetview\":{", map.json)
	beside = street && occursin(r"\"streetview\":\{.*\"map\":true"s, map.json)
	name = first(isempty(slug) ? (street ? "viewer" : "map") : slug, 80) * (street ? (beside ? "-viewer-and-map" : "-viewer") : "")
	lib(parts...) = file_url(joinpath(EXTENSION_DIR, parts...))
	mapillary = street ? """
<link rel="stylesheet" href="$(lib("libs", "mapillary", "mapillary.css"))">
<script src="$(lib("libs", "mapillary", "mapillary.js"))"></script>""" : ""
	page = joinpath(MAP_PAGES[], name * ".html")
	# the map's JSON goes into a script: a </script> in a value must not end it
	write(page, """
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Map</title>
<link rel="stylesheet" href="$(lib("libs", "maplibre", "maplibre-gl.css"))">
<script src="$(lib("libs", "maplibre", "maplibre-gl.js"))"></script>$(mapillary)
<script src="$(file_url(script))"></script>
<style>
html, body { margin: 0; height: 100%; background: #ffffff; }
#pollis-map { position: absolute; inset: 0; }
.pollis-map-text { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
</head>
<body>
<main id="pollis-map" class="pollis-map"></main>
<section id="pollis-map-text" class="pollis-map-text" aria-label="What the map shows"></section>
<script>
PollisMap.draw(document.getElementById("pollis-map"), document.getElementById("pollis-map-text"), $(replace(map.json, "</" => "<\\/")))
</script>
</body>
</html>
""")
	open && browse(page)
	return page
end

# The REPL's display writes a map's page and sends it to Pollis with the map, which shows one of them, on its page in
# Pollis' browser or in the Plots tab, as the setting Plots: Show Maps In says; a notebook kernel has a display of its
# own, which draws the map in the cell's output.
function showmap(map::WebMap)
	page = mappage(map; open = false)
	server = isdefined(Main, :VSCodeServer) ? Main.VSCodeServer : nothing
	if server === nothing || server.conn_endpoint[] === nothing
		println("Open ", page)
	else
		server.JSONRPC.send_notification(server.conn_endpoint[], "pollis/map", Dict("page" => page, "json" => map.json))
	end
	return nothing
end
if isdefined(Main, :VSCodeServer) && isdefined(Main.VSCodeServer, :InlineDisplay)
	@eval Base.display(::Main.VSCodeServer.InlineDisplay, map::WebMap) = showmap(map)
end

"""The versions of MapLibre GL JS and MapillaryJS in the extension's `libs`, which a Pluto notebook loads from jsDelivr."""
const MAPLIBRE_VERSION = "5.24.0"
const MAPILLARY_VERSION = "4.1.2"

"""
The HTML of a map of [`Pollis.webmap`](@ref) or [`Pollis.streetview`](@ref) in the output of a cell of a Pluto notebook,
drawn as on its page, with the text of what it shows. A Pluto notebook's page cannot read the extension's files, so it
loads MapLibre GL JS and MapillaryJS from jsDelivr, at the versions the extension bundles, as Pluto loads its own page.
"""
function plutomap(map::WebMap)
	script = joinpath(EXTENSION_DIR, "dist", "pollisMapPage.js")
	isfile(script) || error("Pollis: $(script) is missing: the Julia extension has not been built")
	cdn(package, version, file) = "https://cdn.jsdelivr.net/npm/$(package)@$(version)/dist/$(file)"
	street = occursin("\"streetview\":{", map.json)
	scripts = [cdn("maplibre-gl", MAPLIBRE_VERSION, "maplibre-gl.js"); street ? [cdn("mapillary-js", MAPILLARY_VERSION, "mapillary.js")] : String[]]
	styles = [cdn("maplibre-gl", MAPLIBRE_VERSION, "maplibre-gl.css"); street ? [cdn("mapillary-js", MAPILLARY_VERSION, "mapillary.css")] : String[]]
	id = "pollis-map-" * string(rand(UInt64); base = 16)
	# a </script> in the script or in a value of the map must not end the script it is in
	safe(text) = replace(text, "</" => "<\\/")
	return """
$(join(("<link rel=\"stylesheet\" href=\"$(s)\">" for s in styles), "\n"))
<div id="$(id)" style="position: relative; height: 480px;">
<div class="pollis-map" style="position: absolute; inset: 0;"></div>
<section aria-label="What the map shows" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap;"></section>
</div>
<script>$(safe(read(script, String)))</script>
<script>
(async () => {
	const output = document.getElementById("$(id)")
	const load = src => (window.pollisScripts ??= {})[src] ??= new Promise((resolve, reject) => {
		const element = document.createElement("script")
		element.src = src
		element.onload = resolve
		element.onerror = () => reject(new Error("Cannot load " + src))
		document.head.append(element)
	})
	try {
		for (const src of [$(join(json_text.(scripts), ", "))]) {
			await load(src)
		}
		const map = window.PollisMap.output(output.firstElementChild, output.lastElementChild, $(safe(map.json)))
		if (typeof invalidation !== "undefined") {
			invalidation.then(() => map.remove())
		}
	} catch (error) {
		output.firstElementChild.textContent = String(error && error.message || error)
	}
})()
</script>
"""
end

# A Pluto notebook runs in a process of its own, which shows the HTML of a map in the cell's output
if isdefined(Main, :PlutoRunner)
	Base.show(io::IO, ::MIME"text/html", map::WebMap) = print(io, plutomap(map))
end

"""
    Pollis.layer(geojson; name = "", color = nothing, column = nothing, opacity = 0.6, years = nothing, side = nothing)

A layer of [`Pollis.webmap`](@ref): `geojson` is a GeoJSON text or the path of a GeoJSON file, in
longitude and latitude on WGS 84. The features are drawn in `color` (a CSS colour such as `"#e15759"`;
by default one of the map's palette), or coloured by the property `column`: a scale for numbers, a
colour per value for text. `opacity` is that of polygons, from 0 to 1.

`years` names the two properties that give the first and last year of a feature, such as
`("starts", "ends")`: the map then has a year slider with Play, and shows each feature in its years,
both included. Years are whole numbers, negative for BCE, and a year left null sets no limit on that
side; for events, name one property twice. Coloured by a column of text, such a layer colours every
value by its text, so two values can look alike, and pointing at a feature shows its value and years.

`side = "left"` or `"right"` draws the layer only on that side of a line that the reader drags across the map (a
swipe); see [`Pollis.webmap`](@ref).
"""
function layer(geojson::AbstractString; name::AbstractString = "", color::Union{AbstractString, Nothing} = nothing,
		column::Union{AbstractString, Nothing} = nothing, opacity::Real = 0.6,
		years::Union{Tuple{AbstractString, AbstractString}, Nothing} = nothing, side::Union{AbstractString, Nothing} = nothing)
	text = geojson_text(geojson)
	# a name mistyped in years would otherwise give a map without its slider
	for key in something(years, ())
		occursin(json_text(key), text) || error("Pollis.layer: the GeoJSON has no property $(key), which years names.")
	end
	return (geojson = text, name = String(name), color = color, column = column, opacity = Float64(opacity), years = years, side = map_side(side))
end

"""
    Pollis.tiles(url; name = "", opacity = 1.0, attribution = "", legend = nothing, tilesize = 256, maxzoom = 22, side = nothing)

A layer of raster tiles for [`Pollis.webmap`](@ref): imagery, or a map that a tile server draws. `url` is the
address of one tile, with `{z}`, `{x}` and `{y}` in it (an XYZ service, or WMTS in its REST form), or a WMS
GetMap request in EPSG:3857 whose box is `{bbox-epsg-3857}`. The tiles are drawn under the base map's labels,
at `opacity` from 0 to 1, and `attribution` is shown in the corner of the map, as the service asks. `legend`
is the address of an image the legend shows under the layer's name, such as a WMS GetLegendGraphic request.
`tilesize` is the width of a tile in pixels, and `maxzoom` the highest zoom the service has tiles for: the
map enlarges those beyond it. `side = "left"` or `"right"` draws the layer only on that side of a line that the
reader drags across the map (a swipe), as an old map beside today's; see [`Pollis.webmap`](@ref).

```julia
Pollis.webmap(Pollis.tiles("https://tile.openstreetmap.org/{z}/{x}/{y}.png"; name = "OpenStreetMap",
	attribution = "© OpenStreetMap contributors", maxzoom = 19); center = (11.34, 44.49), zoom = 12)
```
"""
function tiles(url::AbstractString; name::AbstractString = "", opacity::Real = 1.0, attribution::AbstractString = "",
		legend::Union{AbstractString, Nothing} = nothing, tilesize::Integer = 256, maxzoom::Integer = 22, side::Union{AbstractString, Nothing} = nothing)
	occursin(r"\{bbox-epsg-3857\}|\{z\}.*\{[xy]\}"s, url) ||
		error("Pollis.tiles: the address has neither {z}, {x} and {y} nor {bbox-epsg-3857} in it: $(first(url, 120))")
	return (tiles = String(url), name = String(name), opacity = Float64(opacity), attribution = String(attribution),
		legend = legend === nothing ? nothing : String(legend), tilesize = Int(tilesize), maxzoom = Int(maxzoom), side = map_side(side))
end

"""The side of the swipe a layer is drawn on: `nothing` for both, else `"left"` or `"right"`."""
function map_side(side::Union{AbstractString, Nothing})
	side === nothing || side in ("left", "right") || error("Pollis: side is \"left\", \"right\" or nothing, not \"$(side)\"")
	return side === nothing ? nothing : String(side)
end

"""
    Pollis.picture(url; name = "", attribution = "")

An image to stand on the left of a map of [`Pollis.webmap`](@ref), given as its `beside`: an image without
coordinates, such as a scan of an old map, which can be moved and enlarged on its own while the map on the right
shows the same region today. `url` is the address of a JPEG or PNG image on a server that lets web pages read it
(as IIIF image servers and Wikimedia Commons do), at most about 4,000 pixels wide; `name` and `attribution` are
shown under it.

```julia
Pollis.webmap(; beside = Pollis.picture("https://example.org/iiif/map/full/4000,/0/default.jpg"; name = "A map of 1569"),
	center = (0, 20), zoom = 1)
```
"""
function picture(url::AbstractString; name::AbstractString = "", attribution::AbstractString = "")
	startswith(url, r"https?://") || error("Pollis.picture: the address is not of a web page: $(first(url, 120))")
	return (picture = String(url), name = String(name), attribution = String(attribution))
end

"""
    Pollis.webmap(layers...; style = "positron", center = nothing, zoom = nothing, title = "", year = nothing, labels = true, beside = nothing)

A web map drawn with MapLibre GL JS, on a page in Pollis' browser or in the Plots tab from the REPL (see
[`Pollis.mappage`](@ref)), or in a notebook output: an OpenStreetMap base map, from
OpenFreeMap's vector tiles, with layers on it, drawn in the order given. Each layer is a [`Pollis.layer`](@ref) of
GeoJSON features, a [`Pollis.tiles`](@ref) of raster tiles, or a GeoJSON text or file drawn with the defaults.
`style` is `"positron"` (light grey), `"bright"`, `"liberty"`, `"dark"` or `"fiord"`, or the address of a MapLibre
style. Without `center` (longitude, latitude) the map fits the GeoJSON layers; `zoom` runs from 0 (the world) to
about 18 (a street). Clicking a feature shows its attributes, with the picture of an attribute `image` that is
the address of one (`https://...`), such as a painting of a stage of a journey, above them.

When a layer has `years`, a slider under the map moves through them, with Play, and opens on `year`, by
default the first. `labels = false` takes the names and borders of today off the base map.

When a layer has `side = "left"` or `"right"`, a line divides the map, which the reader drags, or moves with the
arrow keys: the layers of each side show on that side of it, and the others on both, so an old map can be swiped
over today's. `beside` is a [`Pollis.picture`](@ref), an image that stands on the left of the map.

```julia
Pollis.webmap(Pollis.layer("municipalities.geojson"; column = "population"); style = "bright")
Pollis.webmap(Pollis.layer("states.geojson"; column = "name", years = ("starts", "ends")); year = 1500, labels = false)
Pollis.webmap(Pollis.tiles(old_map_tiles; name = "1830", side = "left"), Pollis.tiles(aerial_tiles; name = "Today", side = "right");
	center = (2.35, 48.86), zoom = 13)
```
"""
function webmap(layers::Union{AbstractString, NamedTuple}...; style::AbstractString = "positron",
		center::Union{Tuple{Real, Real}, AbstractVector{<:Real}, Nothing} = nothing, zoom::Union{Real, Nothing} = nothing,
		title::AbstractString = "", year::Union{Real, Nothing} = nothing, labels::Bool = true, beside::Union{NamedTuple, Nothing} = nothing)
	beside === nothing || haskey(beside, :picture) || error("Pollis.webmap: beside is a Pollis.picture")
	parts = [layer isa NamedTuple ? layer : Pollis.layer(layer) for layer in layers]
	side_json(part) = get(part, :side, nothing) === nothing ? "" : ",\"side\":" * json_text(part.side)
	layer_json(part, index) = haskey(part, :tiles) ?
		string("{\"name\":", json_text(isempty(part.name) ? "Layer $(index)" : part.name), ",\"tiles\":", json_text(part.tiles),
			",\"opacity\":", json_text(part.opacity), ",\"attribution\":", json_text(part.attribution),
			",\"legendImage\":", json_text(part.legend), ",\"tileSize\":", json_text(part.tilesize), ",\"maxzoom\":", json_text(part.maxzoom), side_json(part), "}") :
		string("{\"name\":", json_text(isempty(part.name) ? "Layer $(index)" : part.name),
			",\"color\":", json_text(part.color), ",\"column\":", json_text(part.column),
			",\"opacity\":", json_text(part.opacity),
			part.years === nothing ? "" : ",\"years\":[$(join(json_text.(part.years), ","))]", side_json(part), ",\"data\":", part.geojson, "}")
	json_layers = join([layer_json(part, index) for (index, part) in enumerate(parts)], ",")
	return WebMap(string("{\"style\":", json_text(style), ",\"center\":", json_text(center === nothing ? nothing : collect(Float64, center)),
		",\"zoom\":", json_text(zoom), ",\"title\":", json_text(title),
		year === nothing ? "" : string(",\"year\":", json_text(year)), labels ? "" : ",\"labels\":false",
		beside === nothing ? "" : string(",\"picture\":{\"url\":", json_text(beside.picture), ",\"name\":", json_text(beside.name),
			",\"attribution\":", json_text(beside.attribution), "}"),
		",\"layers\":[", json_layers, "]}"))
end

"""
    Pollis.streetview(image, layers...; token = ENV["MAPILLARY_ACCESS_TOKEN"], map = false, style = "positron",
        center = nothing, zoom = 17, title = "")

A street-level viewer of Mapillary's images, drawn with MapillaryJS on a page in Pollis' browser or in the Plots tab
from the REPL (see [`Pollis.mappage`](@ref)), or in a notebook output: it opens on the image whose id is `image`; dragging looks around, the arrows walk along the
sequence, and a panorama turns all the way round. `token` is a Mapillary access token (the Mapillary key of
Settings > Credentials sets `MAPILLARY_ACCESS_TOKEN`). The token goes into the output, so a notebook saved with
it keeps the token.

With `map = true`, a map of Mapillary's coverage stands beside the viewer, drawn as [`Pollis.webmap`](@ref) draws
one, with `layers`, `style`, `center` and `zoom`: its lines are the sequences and its dots the images, and a click
on one opens it in the viewer, while a marker on the map follows the viewer as it walks and turns. `title` is shown
over the map, or over the viewer when it stands alone.

```julia
Pollis.streetview("<image id>"; map = true)
```
"""
function streetview(image::Union{AbstractString, Integer}, layers::Union{AbstractString, NamedTuple}...;
		token::AbstractString = get(ENV, "MAPILLARY_ACCESS_TOKEN", ""), map::Bool = false, style::AbstractString = "positron",
		center::Union{Tuple{Real, Real}, AbstractVector{<:Real}, Nothing} = nothing, zoom::Union{Real, Nothing} = 17,
		title::AbstractString = "")
	id = strip(string(image))
	occursin(r"^\d+$", id) || error("Pollis.streetview: $(first(id, 80)) is not the id of a Mapillary image, which is a number.")
	base = webmap(layers...; style, center, zoom, title).json
	return WebMap(string(chop(base), ",\"streetview\":{\"image\":", json_text(id), ",\"token\":", json_text(token),
		",\"map\":", json_text(map), "}}"))
end

"""A GeoJSON text as it is, or the text of the GeoJSON file at that path."""
function geojson_text(geojson::AbstractString)
	text = startswith(lstrip(geojson), "{") ? String(geojson) : isfile(geojson) ? read(geojson, String) :
		error("Pollis.layer: $(first(geojson, 80)) is neither GeoJSON nor the path of a GeoJSON file.")
	return text
end

"""A value as JSON: `nothing` as null, true and false, numbers, text and vectors of numbers."""
json_text(::Nothing) = "null"
json_text(value::Bool) = value ? "true" : "false"
json_text(value::Real) = isfinite(value) ? string(Float64(value)) : "null"
json_text(values::AbstractVector{<:Real}) = string("[", join(json_text.(values), ","), "]")
function json_text(text::AbstractString)
	io = IOBuffer()
	print(io, '"')
	for c in text
		if c == '"' || c == '\\'
			print(io, '\\', c)
		elseif c < ' '
			print(io, "\\u", string(UInt16(c), base = 16, pad = 4))
		else
			print(io, c)
		end
	end
	print(io, '"')
	return String(take!(io))
end

"""
    Pollis.replicate(title, rows; results = "results.csv")

Compares results with published values that are exact to the digits printed: estimates, test
statistics, a model solved. Prints each value in full, rounded to the published precision and beside
the published value, with the number of decimals they share ("same to 2 decimals"), "one in the last
digit" when not even the units agree but the last printed digit is one off (14016 against 14017), or
"DIFFERENT".

Each row is `(label, value, published)`, `published` written as in the source, `"1,794.3"`, `"-.002"`
or `"2.5e-4"`: its decimals give the published precision. The rows also go to `results`, a CSV file
beside the notebook, replacing those of an earlier run of the same `title`; `results = nothing` writes
none.

```julia
Pollis.replicate("Table 1, column 2", [("intercept", coef(model)[1], "5.085"), ("temperature", coef(model)[2], "-.1156")])
```
"""
function replicate(title::AbstractString, rows; results::Union{AbstractString, Nothing} = "results.csv")
	width = max(26, maximum((length(first(row)) for row in rows); init = 0) + 2)
	println("\n", title, "\n", rpad("", width), lpad("Julia", 16), lpad("rounded", 14), lpad("published", 14))
	records = Vector{Vector{String}}()
	for (label, value, published) in rows
		p, d = printed(published)
		k = findlast(j -> round(value; digits = j) == round(p; digits = j), 0:max(d, 0))  # position in 0:d
		# Not even the units agree: one in the last printed digit (14016 against 14017), or different
		last = abs(round(value; digits = d) - p) <= 1.5 * 10.0^-d
		verdict = k !== nothing ? "same to $(k - 1) decimals" : last ? "one in the last digit" : "DIFFERENT"
		rounded = d < 0 ? string(round(Int, round(value; digits = d))) : fixed(value, d)
		println(rpad(label, width), lpad(fixed(value, max(8, d + 2)), 16), lpad(rounded, 14), lpad(published, 14), "  ", verdict)
		push!(records, [title, string(label), "exact", published, repr(Float64(value)), "", string(d), k === nothing ? "" : string(k - 1), "", verdict])
	end
	record(results, title, records)
	return nothing
end

"""
    Pollis.compare(title, rows; runs = nothing, published_runs = nothing, noisy = true, results = "results.csv")

Compares results with published values that are themselves estimates of a random quantity:
simulations, bootstrap, random forests or neural networks such as LSTNet, rerun with other random
numbers, so that no rerun gives the digits printed. Prints each value with its standard error, rounded
to the published precision and beside the published value, with "within noise" when the two are less
than two standard errors of their difference apart, or "DIFFERENT" and how many. The published value is
known only to the digits printed, so the gap counted is the one beyond half a unit of its last digit:
Julia's 0.1849 is 0.0001 from a published 0.18.

Each row is `(label, value, se, published)`: `value` the mean of Julia's runs, each with its own seed,
and `se` its Monte Carlo standard error, the standard deviation of the runs over the square root of
their number. The standard error of the difference depends on how many runs each value averages:

- `runs` and `published_runs`: Julia's value averages `runs` runs and the published one
  `published_runs`, one when the article reports a single run; the published value's standard error is
  then `se * sqrt(runs / published_runs)`, and that of the difference `se * sqrt(1 + runs / published_runs)`.
- `noisy = true`, without `published_runs`: the published value averages as many runs as Julia's,
  against `sqrt(2) * se`.
- `noisy = false`: the published value is exact, a quantity known without noise, against `se`.

`runs` and `published_runs` can also count the samples of a simulation whose value is their median, as
the standard error of a median falls with the square root of their number as well.

The rows go to `results` as for `Pollis.replicate`.

```julia
errors = [test_error(seed) for seed in 1:20]
Pollis.compare("Table 2, test set error (%)", [("waveform", mean(errors), std(errors) / sqrt(20), "17.2")]; runs = 20, published_runs = 1)
```
"""
function compare(title::AbstractString, rows; runs::Union{Integer, Nothing} = nothing, published_runs::Union{Integer, Nothing} = nothing, noisy::Bool = true, results::Union{AbstractString, Nothing} = "results.csv")
	published_runs === nothing || runs !== nothing || throw(ArgumentError("Pollis.compare: published_runs needs runs, the number of Julia's runs"))
	published_runs === nothing || published_runs >= 1 || throw(ArgumentError("Pollis.compare: published_runs is 1 or more, not $published_runs"))
	# The standard error of the difference, in units of Julia's standard error
	scale = published_runs !== nothing ? sqrt(1 + runs / published_runs) : noisy ? sqrt(2) : 1.0
	noise = published_runs !== nothing ? "Julia: $runs runs; published: $(published_runs == 1 ? "a single run" : "$published_runs runs")" :
		noisy ? "Julia and published: the means of as many runs" : "Julia: the mean of its runs; published: exact"
	width = max(16, maximum((length(first(row)) for row in rows); init = 0) + 2)
	println("\n", title, "  (", noise, ")\n", rpad("", width), lpad("Julia", 10), lpad("se", 8), lpad("rounded", 10), lpad("published", 11))
	records = Vector{Vector{String}}()
	for (label, value, se, published) in rows
		p, d = printed(published)
		# The gap beyond the rounding of the published value, half a unit of its last printed digit
		gap = value - p
		z = sign(gap) * max(abs(gap) - 0.5 * 10.0^-d, 0) / (scale * se)
		verdict = abs(z) < 2 ? "within noise" : "DIFFERENT ($(fixed(z, 1)) se)"
		rounded = d < 0 ? string(round(Int, round(value; digits = d))) : fixed(value, d)
		println(rpad(label, width), lpad(fixed(value, 3), 10), lpad(fixed(se, 3), 8), lpad(rounded, 10), lpad(published, 11), "  ", verdict)
		push!(records, [title, string(label), "noise", published, repr(Float64(value)), repr(Float64(se)), string(d), "", repr(z), verdict])
	end
	record(results, title, records)
	return nothing
end

"""A published value as printed, `"1,794.3"` or `"2.5e-4"`: its value, and its decimals (negative for `"2.5e4"`)."""
function printed(published::AbstractString)
	text = replace(strip(published), "," => "")
	mantissa, exponent = occursin(r"[eE]", text) ? split(text, r"[eE]") : (text, "0")
	decimals = (occursin('.', mantissa) ? length(split(mantissa, '.')[2]) : 0) - parse(Int, exponent)
	return parse(Float64, text), decimals
end

const PRINTF = Base.PkgId(Base.UUID("de0858da-6303-5e67-8744-51eddeeeb8d7"), "Printf")

"""`value` with `digits` decimals, as `@printf("%.2f")` writes it; Printf is loaded the first time."""
function fixed(value::Real, digits::Integer)
	Printf = Base.require(PRINTF)
	return Base.invokelatest(Printf.format, Base.invokelatest(Printf.Format, "%.$(digits)f"), Float64(value))
end

"""The columns of results.csv, one row for each value compared."""
const RESULT_COLUMNS = ["table", "row", "kind", "published", "julia", "se", "printed_decimals", "same_decimals", "z", "verdict"]

"""Writes `records` to the CSV file `path` in place of the rows of an earlier run of `title`; warns and goes on when it cannot."""
function record(path::Union{AbstractString, Nothing}, title::AbstractString, records)
	path === nothing && return nothing
	quoted(field) = occursin(r"[\",\n]", field) ? "\"" * replace(field, "\"" => "\"\"") * "\"" : field
	try
		kept = isfile(path) ? filter(line -> !startswith(line, quoted(title) * ","), readlines(path)[2:end]) : String[]
		lines = [join(RESULT_COLUMNS, ","); kept; [join(quoted.(fields), ",") for fields in records]]
		write(path, join(lines, "\n") * "\n")
	catch error
		@warn "The results were not written to $(abspath(path))" exception = error
	end
	return nothing
end

const REPL_ID = Base.PkgId(Base.UUID("3fa0cd96-eef1-5676-8a61-b3b8758bbffb"), "REPL")

"""
    Pollis.run_first(example, step; first = "the Code Example", then = "this Next Step")

What a Next Step sends to the Julia REPL when the Code Example of its tab has not run there yet, or
has changed since: run the Code Example, then the Next Step, which uses its results. A step of a Time
Arrow panel sends the steps before it as `example`, named by `first` (`Steps 1 to 4`), and itself as
`step`, named by `then` (`Step 6`). Each statement runs in `Main` as if typed at the REPL, its value
shown unless it ends with `;`. When `example` stops with an error, the error is shown and `step` does not run.
"""
function run_first(example::AbstractString, step::AbstractString; first::AbstractString = "the Code Example", then::AbstractString = "this Next Step")
	printstyled("Running $first first, so that $then can use the results…\n"; color = :cyan)
	if !run_statements(example, uppercasefirst(first))
		printstyled("$(uppercasefirst(then)) did not run, since $first stopped with an error.\n"; color = :red)
		return nothing
	end
	printstyled("Running $then…\n"; color = :cyan)
	run_statements(step, uppercasefirst(then))
	return nothing
end

"""Runs each statement of `code` in `Main` as the REPL would; shows the first error and returns false at it."""
function run_statements(code::AbstractString, name::AbstractString)
	REPL = get(Base.loaded_modules, REPL_ID, nothing)
	position = 1
	while position <= ncodeunits(code)
		statement, next = Meta.parse(code, position; filename = name)
		text = code[position:prevind(code, next)]
		# The line the statement starts on, for the errors: after the line breaks before it.
		line = count('\n', SubString(code, 1, prevind(code, position))) + count('\n', text[1:length(text) - length(lstrip(text))]) + 1
		position = next
		statement === nothing && continue
		try
			# The REPL's soft scope, so that a loop at top level assigns the globals it names.
			REPL === nothing || (statement = Base.invokelatest(REPL.softscope, statement))
			value = Base.invokelatest(Core.eval, Main, Expr(:toplevel, LineNumberNode(line, Symbol(name)), statement))
			value === nothing || (REPL !== nothing && Base.invokelatest(REPL.ends_with_semicolon, text)) || Base.invokelatest(display, value)
		catch error
			# The backtrace up to the statement, without the frames of Pollis that ran it.
			trace = stacktrace(catch_backtrace())
			cut = something(findfirst(frame -> frame.func === :run_statements, trace), length(trace) + 1)
			printstyled(stderr, "ERROR: "; color = :red, bold = true)
			Base.invokelatest(showerror, stderr, error, trace[1:max(cut - 2, 0)])
			println(stderr)
			return false
		end
	end
	return true
end

end
