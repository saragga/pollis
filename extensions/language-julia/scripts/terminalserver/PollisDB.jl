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

The module loads no database package itself: it looks up DBInterface.jl and Tables.jl among the
packages the connection code has already loaded. DuckDB is built into Pollis: `install()` adds it,
once, to a Julia environment of Pollis' own (`ENVIRONMENT`), which PollisDB puts on the load path
so that `using DuckDB` works in any project without touching its Project.toml. The built-in Pollis
database is an in-memory DuckDB database that `seed` fills with the PollisDatasets each time it
connects.
"""
module PollisDB

using UUIDs: UUID
using Dates: now

const DBINTERFACE = Base.PkgId(UUID("a10d1c49-ce27-4219-8d33-6db1a4562965"), "DBInterface")
const TABLES = Base.PkgId(UUID("bd369af6-aec1-5ad0-b16a-f7cc5008161c"), "Tables")

"""The Julia environment of the packages built into Pollis, one per Julia minor version."""
const ENVIRONMENT = joinpath(homedir(), ".pollis", "julia", "environments", "v$(VERSION.major).$(VERSION.minor)")

"""The packages built into Pollis: DuckDB and what the connection code loads with it."""
const PACKAGES = ["DuckDB", "DBInterface", "Tables"]


"""The id of the built-in database's saved profile in the Databases view."""
const BUILTIN = "pollis"

"""PollisDatasets.jl, whose datasets `seed` loads into the built-in database."""
const DATASETS = Base.PkgId(UUID("b43d2445-bde6-43fd-b0e7-0c8ab91b08dc"), "PollisDatasets")
const DATASETS_URL = "https://github.com/Trumpingtons/PollisDatasets.jl"

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

Show `con` in the Databases view as the connection of its saved profile `id`. The built-in
database is seeded with the PollisDatasets first.
"""
function register(id::AbstractString, con; name::AbstractString = "")
    if id == BUILTIN
        try
            seed(con)
        catch err
            @warn "Pollis: could not load the PollisDatasets into the built-in database" exception = err
        end
    end
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
    seed(con)

Load every dataset of PollisDatasets.jl into the built-in database `con` as a table named after
its id, with its title, description, source and column descriptions as comments.
"""
function seed(con)
    path = Base.locate_package(DATASETS)
    path === nothing && return nothing
    data = joinpath(dirname(dirname(path)), "data")
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

"""
    install()

Install the packages built into Pollis, and the PollisDatasets, that no environment on the load path provides yet into
`ENVIRONMENT`. Runs once: afterwards it finds them and returns at once. The active project is
left as it was.
"""
function install()
    missing_packages = filter(p -> Base.identify_package(p) === nothing, PACKAGES)
    missing_datasets = Base.locate_package(DATASETS) === nothing
    isempty(missing_packages) && !missing_datasets && return nothing
    println("Pollis: installing ", join([missing_packages; missing_datasets ? [DATASETS.name] : String[]], ", "), " for the built-in database. This happens only once.")
    Pkg = Base.require(Main, :Pkg)
    active = Base.ACTIVE_PROJECT[]
    try
        Base.invokelatest(Pkg.activate, ENVIRONMENT; io = devnull)
        isempty(missing_packages) || Base.invokelatest(Pkg.add, missing_packages)
        missing_datasets && Base.invokelatest(Pkg.add; url = DATASETS_URL)
    finally
        Base.ACTIVE_PROJECT[] = active
    end
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
