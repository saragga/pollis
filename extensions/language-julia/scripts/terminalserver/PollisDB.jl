# ---------------------------------------------------------------------------------------------
#  Copyright (c) 2026 Antonio Saragga Seabra
#  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
# ---------------------------------------------------------------------------------------------

"""
    PollisDB

Pollis' bridge between the Julia REPL and the Databases view, loaded when the REPL starts. A
connection shows up in the view once it is handed to PollisDB: `PollisDB.show(con)` for any
connection you opened yourself, `register` for the saved connections the view connects. PollisDB
then writes a JSON snapshot of its schemas, tables and columns to `SESSIONS`, which the view
watches. Snapshots are removed on `disconnect` and when Julia exits, so the view shows only the
connections this session holds; those of a Julia that died without exiting are removed when the
next REPL starts.

The module looks up DBInterface.jl and Tables.jl among the packages the connection code has
already loaded; only `build` loads DuckDB itself. DuckDB is built into Pollis: `install()` adds it,
once, to a Julia environment of Pollis' own (`ENVIRONMENT`), which PollisDB puts on the load path
so that `using DuckDB` works in any project without touching its Project.toml. The built-in Pollis
database is a DuckDB file, `DATASETS_DB`, that `build` makes from the PollisDatasets CSV files and
remakes only when the package changes. Nothing writes to it otherwise, so the REPL and any other
program, such as a database extension, open it read-only, side by side.
"""
module PollisDB

using UUIDs: UUID
using Dates: now

const DBINTERFACE = Base.PkgId(UUID("a10d1c49-ce27-4219-8d33-6db1a4562965"), "DBInterface")
const DUCKDB = Base.PkgId(UUID("d2f5444f-75bc-4fdf-ac35-56f514c445e1"), "DuckDB")
const TABLES = Base.PkgId(UUID("bd369af6-aec1-5ad0-b16a-f7cc5008161c"), "Tables")

"""The Julia environment of the packages built into Pollis, one per Julia minor version."""
const ENVIRONMENT = joinpath(homedir(), ".pollis", "julia", "environments", "v$(VERSION.major).$(VERSION.minor)")

"""The packages built into Pollis: DuckDB and what the connection code loads with it."""
const PACKAGES = ["DuckDB", "DBInterface", "Tables"]


"""The id of the built-in database's saved profile in the Databases view."""
const BUILTIN = "pollis"

"""PollisDatasets.jl, whose datasets `build` makes the built-in database from."""
const DATASETS = Base.PkgId(UUID("b43d2445-bde6-43fd-b0e7-0c8ab91b08dc"), "PollisDatasets")
const DATASETS_URL = "https://github.com/Trumpingtons/PollisDatasets.jl"
"""The commit of PollisDatasets.jl that `install()` last installed into `ENVIRONMENT`."""
const DATASETS_COMMIT = joinpath(ENVIRONMENT, "PollisDatasets.commit")

"""The built-in database: a DuckDB file of the PollisDatasets, made by `build` and only read afterwards."""
const DATASETS_DB = joinpath(homedir(), ".pollis", "databases", "PollisDatasets.duckdb")
"""The version of PollisDatasets.jl that `DATASETS_DB` was made from, as `datasets_stamp` gives it."""
const DATASETS_STAMP = DATASETS_DB * ".stamp"
"""The ids and titles of the installed PollisDatasets, read by the welcome page to announce new datasets."""
const DATASETS_CATALOGUE = joinpath(homedir(), ".pollis", "databases", "PollisDatasets.json")

"""The folder of the snapshots, one `<id>.json` per connection, watched by the Databases view."""
const SESSIONS = joinpath(homedir(), ".pollis", "databases", "sessions")

"""A connection shown in the Databases view, and the name it is shown with."""
struct Entry
    con::Any
    name::String
end

const CONNECTIONS = Dict{String,Entry}()
const COUNTER = Ref(0)

snapshot_path(id::AbstractString) = joinpath(SESSIONS, "$id.json")

loaded(id::Base.PkgId) = get(Base.loaded_modules, id) do
    error("PollisDB: $(id.name).jl is not loaded; run the connection code first")
end

"""The engine behind a connection, from the package that defines its type."""
engine(con) = string(nameof(parentmodule(typeof(con))))

const SQL_DUCKDB = """
    SELECT c.table_schema, c.table_name, t.table_type, c.column_name, c.data_type, t.table_comment AS table_comment, c.column_comment AS column_comment
    FROM information_schema.columns c
    JOIN information_schema.tables t USING (table_catalog, table_schema, table_name)
    WHERE c.table_catalog = current_database()
    ORDER BY c.table_schema, c.table_name, c.ordinal_position"""

const SQL_POSTGRES = """
    SELECT c.table_schema, c.table_name, t.table_type, c.column_name, c.data_type
    FROM information_schema.columns c
    JOIN information_schema.tables t USING (table_catalog, table_schema, table_name)
    WHERE c.table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY c.table_schema, c.table_name, c.ordinal_position"""

const SQL_SQLITE = """
    SELECT 'main' AS table_schema, m.name AS table_name, m.type AS table_type, p.name AS column_name, p.type AS data_type
    FROM sqlite_master m JOIN pragma_table_info(m.name) p
    WHERE m.type IN ('table', 'view') AND m.name NOT LIKE 'sqlite_%'
    ORDER BY m.name, p.cid"""

function introspection_sql(con)
    e = engine(con)
    e == "DuckDB" && return SQL_DUCKDB
    e == "SQLite" && return SQL_SQLITE
    e == "LibPQ" && return SQL_POSTGRES
    error("PollisDB: unsupported connection type $(typeof(con))")
end

"""Schemas, tables and columns of `con`, as nested Dicts ready for JSON."""
function introspect(con)
    DBInterface, Tables = loaded(DBINTERFACE), loaded(TABLES)
    cols = Tables.columntable(DBInterface.execute(con, introspection_sql(con)))
    text(x) = x === missing ? "" : string(x)
    commented = hasproperty(cols, :table_comment)  # DuckDB only
    schemas = Dict{String,Any}[]
    for i in eachindex(cols.table_name)
        schema, table = text(cols.table_schema[i]), text(cols.table_name[i])
        if isempty(schemas) || schemas[end]["name"] != schema
            push!(schemas, Dict{String,Any}("name" => schema, "tables" => Dict{String,Any}[]))
        end
        tables = schemas[end]["tables"]
        if isempty(tables) || tables[end]["name"] != table
            kind = occursin("VIEW", uppercase(text(cols.table_type[i]))) ? "view" : "table"
            push!(tables, Dict{String,Any}("name" => table, "kind" => kind, "columns" => Dict{String,Any}[]))
            commented && !isempty(text(cols.table_comment[i])) && (tables[end]["comment"] = text(cols.table_comment[i]))
        end
        column = Dict{String,Any}("name" => text(cols.column_name[i]), "type" => text(cols.data_type[i]))
        commented && !isempty(text(cols.column_comment[i])) && (column["comment"] = text(cols.column_comment[i]))
        push!(tables[end]["columns"], column)
    end
    return schemas
end

json(io::IO, x::AbstractString) = (print(io, '"'); escape_json(io, x); print(io, '"'))
json(io::IO, x::Union{Integer,AbstractFloat}) = print(io, x)
json(io::IO, x::Bool) = print(io, x ? "true" : "false")
json(io::IO, ::Nothing) = print(io, "null")
function json(io::IO, v::AbstractVector)
    print(io, '[')
    for (i, x) in enumerate(v)
        i > 1 && print(io, ',')
        json(io, x)
    end
    print(io, ']')
end
function json(io::IO, d::AbstractDict)
    print(io, '{')
    for (i, (k, v)) in enumerate(d)
        i > 1 && print(io, ',')
        json(io, string(k))
        print(io, ':')
        json(io, v)
    end
    print(io, '}')
end
function escape_json(io::IO, s::AbstractString)
    for c in s
        if c == '"' || c == '\\'
            print(io, '\\', c)
        elseif c < ' '
            print(io, "\\u", string(UInt16(c); base = 16, pad = 4))
        else
            print(io, c)
        end
    end
end

"""Write the snapshot of connection `id`, or of its introspection error. Written atomically."""
function write_snapshot(id::AbstractString, entry::Entry)
    snapshot = Dict{String,Any}("id" => id, "name" => entry.name, "engine" => engine(entry.con), "updated" => string(now()), "pid" => getpid())
    try
        snapshot["schemas"] = introspect(entry.con)
    catch err
        snapshot["schemas"] = Any[]
        snapshot["error"] = sprint(showerror, err)
    end
    mkpath(SESSIONS)
    path = snapshot_path(id)
    tmp = path * ".tmp"
    open(io -> json(io, snapshot), tmp, "w")
    mv(tmp, path; force = true)
    return nothing
end

"""
    register(id, con; name = "")

Show `con` in the Databases view as the connection of its saved profile `id`.
"""
function register(id::AbstractString, con; name::AbstractString = "")
    entry = Entry(con, name)
    CONNECTIONS[id] = entry
    write_snapshot(id, entry)
    return nothing
end

"""
    show(con; name = "<engine> Connection")

Show `con`, a DBInterface connection to DuckDB, SQLite or PostgreSQL, in the Databases view, and
return it. Showing it again renames it and re-reads its schemas.

```julia
con = PollisDB.show(DBInterface.connect(DuckDB.DB, "sales.duckdb"); name = "Sales")
```
"""
function show(con; name::AbstractString = "$(engine(con)) Connection")
    engine(con) # fail early on a connection type PollisDB cannot read
    introspection_sql(con)
    id = something(findfirst(e -> e.con === con, CONNECTIONS), string("repl-", getpid(), "-", COUNTER[] += 1))
    register(id, con; name)
    return con
end

"""
    refresh()
    refresh(id)

Re-read the schemas of every registered connection, or of one, e.g. after `CREATE TABLE`.
"""
refresh() = foreach(refresh, collect(keys(CONNECTIONS)))
function refresh(id::AbstractString)
    haskey(CONNECTIONS, id) && write_snapshot(id, CONNECTIONS[id])
    return nothing
end

"""
    disconnect(id)
    disconnect(con)

Close the connection shown as `id`, or the connection `con`, and remove it from the Databases view.
"""
function disconnect(con)
    id = findfirst(e -> e.con === con, CONNECTIONS)
    id === nothing ? loaded(DBINTERFACE).close!(con) : disconnect(id)
    return nothing
end
function disconnect(id::AbstractString)
    entry = pop!(CONNECTIONS, id, nothing)
    entry === nothing && return nothing
    try
        loaded(DBINTERFACE).close!(entry.con)
    catch
    end
    rm(snapshot_path(id); force = true)
    return nothing
end

"""
    preview(id, table; limit = 100)
    preview(con, table; limit = 100)

Print the first `limit` rows of `table`, a quoted and possibly schema-qualified name, from the
connection shown as `id` or from `con`.
"""
preview(id::AbstractString, table::AbstractString; limit::Integer = 100) = preview(CONNECTIONS[id].con, table; limit)
function preview(con, table::AbstractString; limit::Integer = 100)
    DBInterface, Tables = loaded(DBINTERFACE), loaded(TABLES)
    cols = Tables.columntable(DBInterface.execute(con, "SELECT * FROM $table LIMIT $limit"))
    names = collect(string.(keys(cols)))
    cells = [[x === missing ? "missing" : string(x) for x in col] for col in values(cols)]
    width(j) = min(40, maximum(length, cells[j]; init = length(names[j])))
    fit(s, w) = length(s) > w ? first(s, w - 3) * "..." : rpad(s, w)
    widths = [width(j) for j in eachindex(names)]
    println(join((fit(names[j], widths[j]) for j in eachindex(names)), "  "))
    println(join((repeat('-', widths[j]) for j in eachindex(names)), "  "))
    nrows = isempty(cells) ? 0 : length(cells[1])
    for i in 1:nrows
        println(join((fit(cells[j][i], widths[j]) for j in eachindex(names)), "  "))
    end
    println("($nrows rows)")
    return nothing
end

"""
    browse(id, table; limit = 100_000, title = table)
    browse(con, table; limit = 100_000, title = table)

Open the first `limit` rows of `table`, a quoted and possibly schema-qualified name, in the Table
Viewer of the Julia extension, from the connection shown as `id` or from `con`.
"""
browse(id::AbstractString, table::AbstractString; limit::Integer = 100_000, title::AbstractString = table) = browse(CONNECTIONS[id].con, table; limit, title)
function browse(con, table::AbstractString; limit::Integer = 100_000, title::AbstractString = table)
    DBInterface, Tables = loaded(DBINTERFACE), loaded(TABLES)
    rows = Tables.rowtable(DBInterface.execute(con, "SELECT * FROM $table LIMIT $limit"))
    Base.invokelatest(Main.VSCodeServer.vscodedisplay, rows, title)
    return nothing
end

"""The folder of the PollisDatasets.jl package on the load path, or `nothing`."""
function datasets_root()
    path = Base.locate_package(DATASETS)
    return path === nothing ? nothing : dirname(dirname(path))
end

"""
What `DATASETS_DB` is made from: the package folder, which changes with each installed version, and
the latest change to its catalogue and CSV files, which covers a package under development.
"""
function datasets_stamp(root::AbstractString)
    files = [joinpath(root, "datasets.toml"); readdir(joinpath(root, "data"); join = true)]
    return string(root, "\n", maximum(mtime, files))
end

"""
    build()

Make the built-in database `DATASETS_DB` from the PollisDatasets CSV files when it is missing or
PollisDatasets.jl has changed since it was made. The file is written under a temporary name and then
moved into place, so a connection never sees it half-made, and one still open on the previous file
keeps reading that one.
"""
function build()
    root = datasets_root()
    root === nothing && return nothing
    stamp = datasets_stamp(root)
    isfile(DATASETS_DB) && isfile(DATASETS_STAMP) && read(DATASETS_STAMP, String) == stamp && return nothing
    println("Pollis: building the PollisDatasets database. This happens only when PollisDatasets.jl changes.")
    DuckDB = get(() -> Base.require(DUCKDB), Base.loaded_modules, DUCKDB)
    get(() -> Base.require(DBINTERFACE), Base.loaded_modules, DBINTERFACE)
    mkpath(dirname(DATASETS_DB))
    tmp = "$DATASETS_DB.$(getpid()).tmp"
    rm(tmp; force = true)
    try
        Base.invokelatest() do
            con = loaded(DBINTERFACE).connect(DuckDB.DB, tmp)
            try
                seed(con, root)
                loaded(DBINTERFACE).execute(con, "CHECKPOINT")
            finally
                loaded(DBINTERFACE).close!(con)
            end
        end
        mv(tmp, DATASETS_DB; force = true)
        write(DATASETS_STAMP, stamp)
    catch err
        rm(tmp; force = true)
        isfile(DATASETS_DB) || rethrow()
        @warn "Pollis: could not rebuild the PollisDatasets database; the previous one is kept" exception = err
    end
    return nothing
end

"""
    seed(con, root)

Load every dataset of the PollisDatasets.jl package in folder `root` into `con` as a table named
after its id, with its title, description, source and column descriptions as comments.
"""
function seed(con, root::AbstractString)
    data = joinpath(root, "data")
    DBInterface = loaded(DBINTERFACE)
    TOML = Base.require(Base.PkgId(UUID("fa267f1f-6049-4f14-aa54-33bafae1ed76"), "TOML"))
    entries = TOML.parsefile(joinpath(dirname(data), "datasets.toml"))["datasets"]
    quoted(x) = "'" * replace(string(x), "'" => "''") * "'"
    sql(statement) = DBInterface.execute(con, statement)
    for entry in entries
        id = entry["id"]
        file = joinpath(data, id * ".csv")
        isfile(file) || continue
        sql("CREATE OR REPLACE TABLE main.\"$id\" AS SELECT * FROM read_csv($(quoted(file)))")
        sql("COMMENT ON TABLE main.\"$id\" IS " * quoted("$(entry["title"]): $(entry["description"]) Source: $(entry["source"]). Licence: $(entry["licence"])."))
        for column in entry["columns"]
            sql("COMMENT ON COLUMN main.\"$id\".\"$(column["name"])\" IS " * quoted(column["description"]))
        end
    end
    return nothing
end

"""The commit at the head of PollisDatasets.jl's main branch on GitHub, or `nothing` when GitHub cannot be reached."""
function latest_datasets_commit()
    try
        Downloads = Base.require(Base.PkgId(UUID("f43a241f-c20a-4ad4-852c-f6b1247861c6"), "Downloads"))
        io = IOBuffer()
        url = replace(DATASETS_URL, "https://github.com/" => "https://api.github.com/repos/") * "/commits/main"
        response = Base.invokelatest(Downloads.request, url; output = io, headers = ["Accept" => "application/vnd.github.sha"], timeout = 3)
        return response.status == 200 ? String(take!(io)) : nothing
    catch
        return nothing
    end
end

"""
    install()

Install the packages built into Pollis, and the PollisDatasets, that no environment on the load path provides yet into
`ENVIRONMENT`. The first time, it adds them; afterwards it keeps the PollisDatasets installed there up to
date with GitHub, so that new datasets reach the built-in database. Pkg runs (and precompiles) only when
something is missing or GitHub has a newer commit than `DATASETS_COMMIT`; offline, the installed copy is
kept. The active project is left as it was.
"""
function install()
    missing_packages = filter(p -> Base.identify_package(p) === nothing, PACKAGES)
    missing_datasets = Base.locate_package(DATASETS) === nothing
    manifest = joinpath(ENVIRONMENT, "Manifest.toml")
    # Installed by Pollis, so ours to update; a copy in the user's own environment is left alone.
    ours = missing_datasets || (isfile(manifest) && occursin(string(DATASETS.uuid), read(manifest, String)))
    latest = ours ? latest_datasets_commit() : nothing
    installed = isfile(DATASETS_COMMIT) ? strip(read(DATASETS_COMMIT, String)) : ""
    outdated = !missing_datasets && latest !== nothing && latest != installed
    isempty(missing_packages) && !missing_datasets && !outdated && return nothing
    if !isempty(missing_packages) || missing_datasets
        println("Pollis: installing ", join([missing_packages; missing_datasets ? [DATASETS.name] : String[]], ", "), " for the built-in database. This happens only once.")
    end
    Pkg = Base.require(Main, :Pkg)
    active = Base.ACTIVE_PROJECT[]
    try
        Base.invokelatest(Pkg.activate, ENVIRONMENT; io = devnull)
        isempty(missing_packages) || Base.invokelatest(Pkg.add, missing_packages)
        if missing_datasets
            Base.invokelatest(Pkg.add; url = DATASETS_URL)
        elseif outdated
            try
                # One git fetch, without the registry; Pkg then precompiles the new version.
                Base.invokelatest(Pkg.update, DATASETS.name; update_registry = false, io = devnull)
            catch err
                @debug "Pollis: PollisDatasets not updated" exception = err
                latest = nothing
            end
        end
        latest === nothing || write(DATASETS_COMMIT, latest)
    finally
        Base.ACTIVE_PROJECT[] = active
    end
    return nothing
end

"""
    catalogue()

Write `DATASETS_CATALOGUE`, the id and title of every dataset of the installed PollisDatasets.jl, as
JSON, when it has changed. The welcome page compares it with the ids the user has seen and announces
the new ones.
"""
function catalogue()
    root = datasets_root()
    root === nothing && return nothing
    TOML = Base.require(Base.PkgId(UUID("fa267f1f-6049-4f14-aa54-33bafae1ed76"), "TOML"))
    entries = Base.invokelatest(TOML.parsefile, joinpath(root, "datasets.toml"))["datasets"]
    quoted(x) = "\"" * escape_string(string(x)) * "\""
    items = ["{\"id\":$(quoted(e["id"])),\"title\":$(quoted(e["title"]))}" for e in entries]
    json = "{\"datasets\":[" * join(items, ",") * "]}\n"
    isfile(DATASETS_CATALOGUE) && read(DATASETS_CATALOGUE, String) == json && return nothing
    mkpath(dirname(DATASETS_CATALOGUE))
    tmp = "$DATASETS_CATALOGUE.$(getpid()).tmp"
    write(tmp, json)
    mv(tmp, DATASETS_CATALOGUE; force = true)
    return nothing
end

"""Whether process `pid` is running. Assumed on Windows, which has no `kill(pid, 0)`."""
alive(pid::Integer) = Sys.iswindows() || ccall(:kill, Cint, (Cint, Cint), pid, 0) == 0

"""Remove the snapshots of Julia processes that died without exiting, which left them behind."""
function prune()
    isdir(SESSIONS) || return nothing
    for file in readdir(SESSIONS; join = true)
        endswith(file, ".json") || continue
        m = match(r"\"pid\":(?<pid>\d+)", read(file, String))
        (m === nothing || !alive(parse(Int, m[:pid]))) && rm(file; force = true)
    end
    return nothing
end

try
    prune()
catch
end

# After the user's environments, so that their own versions of these packages come first.
ENVIRONMENT in LOAD_PATH || push!(LOAD_PATH, ENVIRONMENT)

# Remove the snapshots when Julia exits, so the view does not show dead connections.
atexit(() -> foreach(id -> rm(snapshot_path(id); force = true), keys(CONNECTIONS)))

end # module
