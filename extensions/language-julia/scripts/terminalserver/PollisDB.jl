# ---------------------------------------------------------------------------------------------
#  Copyright (c) 2026 Antonio Saragga Seabra
#  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
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
already loaded; only `build`, `connect` and `sql` load DuckDB themselves. `connect` opens a DuckDB with the
built-in databases attached and Lance loading in the background; `sql` runs a query on such a
connection, and is what the `sql>` mode of the REPL (`>` at the start of a line) runs. DuckDB is built into Pollis: `install()` adds it,
once, to a Julia environment of Pollis' own (`ENVIRONMENT`), which PollisDB puts on the load path
so that `using DuckDB` works in any project without touching its Project.toml. That DuckDB is Pollis'
fork of DuckDB.jl (`DUCKDB_URL`), which brings no engine of its own: it loads the one Pollis ships, which
the Julia extension copies into `DUCKDB_HOME` and names in `JULIA_DUCKDB_LIBRARY`. The built-in Pollis
database is a DuckDB file, `DATASETS_DB`, that `build` makes from the PollisDatasets CSV files and
remakes only when the package changes; PollisJournals, `JOURNALS_DB`, is made by `build_journals` from the
artifact of PollisJournals.jl, the journals of OpenAlex and of the Norwegian register, in the same way. Nothing writes to it otherwise, so the REPL and any other
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

"""Pollis' fork of DuckDB.jl, without DuckDB_jll: the engine is the one in `DUCKDB_HOME`."""
const DUCKDB_URL = "https://github.com/Trumpingtons/DuckDB.jl"

"""Where the Julia extension puts the DuckDB engine and the Lance extension that come with Pollis."""
const DUCKDB_HOME = joinpath(homedir(), ".pollis", "duckdb")
"""The Lance extension, on the platforms DuckDB builds it for."""
const LANCE = joinpath(DUCKDB_HOME, "lance.duckdb_extension")
"""The modification time of the `LANCE` that `warm_lance` last loaded."""
const LANCE_STAMP = LANCE * ".loaded"


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

"""The archive of the RSS feeds: a JSON Lines file per month, `YYYY-MM.jsonl`, that Pollis adds every item it receives to."""
const RSS_ITEMS = joinpath(homedir(), ".pollis", "rss", "items")
"""The items of the RSS feeds added to Zotero, a line of JSON each, which Pollis adds to."""
const RSS_ZOTERO = joinpath(homedir(), ".pollis", "rss", "zotero.jsonl")
"""The podcast episodes downloaded to `~/.pollis/rss/episodes`, a line of JSON each, which Pollis adds to."""
const RSS_EPISODES = joinpath(homedir(), ".pollis", "rss", "episodes.jsonl")
"""The PollisRSS database: views over `RSS_ITEMS`, made by `build_rss`, so it always shows the archive as it is."""
const RSS_DB = joinpath(homedir(), ".pollis", "databases", "PollisRSS.duckdb")
"""The SQL that `RSS_DB` was made with."""
const RSS_STAMP = RSS_DB * ".stamp"
"""PollisRSS.jl: the feeds Pollis offers in Explore > RSS > RSS Feeds, by topic; the feed list only, never the items."""
const RSS = Base.PkgId(UUID("a90e8467-7a07-416a-86f1-fcffab5faf31"), "PollisRSS")
const RSS_URL = "https://github.com/Trumpingtons/PollisRSS.jl"
"""The commit of PollisRSS.jl installed, from GitHub."""
const RSS_COMMIT = joinpath(ENVIRONMENT, "PollisRSS.commit")
"""
The feeds of the installed PollisRSS.jl, copied by `copy_package_data`: Pollis offers them instead of those it was
built with, so that a feed added or corrected reaches Pollis without a new Pollis.
"""
const RSS_CATALOGUE = joinpath(homedir(), ".pollis", "rss", "catalogue.json")

"""PollisJournals.jl, whose artifact, the journals of OpenAlex (CC0) and of the Norwegian register (NLOD 2.0) as Parquet files, `build_journals` makes PollisJournals from."""
const JOURNALS = Base.PkgId(UUID("ce11f1ff-ffd7-4bd8-a843-f266dced2fa5"), "PollisJournals")
const JOURNALS_URL = "https://github.com/Trumpingtons/PollisJournals.jl"
"""The commit of PollisJournals.jl that `install()` last installed into `ENVIRONMENT`."""
const JOURNALS_COMMIT = joinpath(ENVIRONMENT, "PollisJournals.commit")
"""What Pollis adds to PollisJournals: the metrics imported."""
const JOURNALS_HOME = joinpath(homedir(), ".pollis", "journals")
"""The journal metrics imported (JIF, CiteScore, SJR, SNIP), a JSON Lines file per import, which Pollis writes."""
const JOURNALS_METRICS = joinpath(JOURNALS_HOME, "metrics")
"""
The articles of the email alerts' items and of the works saved from Literature Radar, looked up in Crossref and OpenAlex:
a JSON Lines file that Pollis appends to, where the last line of an article wins.
"""
const JOURNALS_ARTICLES = joinpath(JOURNALS_HOME, "articles.jsonl")
"""
The levels and indicators of the journals, a CSV row per journal that the RSS Feeds page and the welcome page read
to tag journal items, written by `build_journals`: the journal's ISSNs, space-separated, its latest Norwegian level
and the year of it, and OpenAlex's 2-year mean citedness, h-index, open access and DOAJ (1 or 0).
"""
const JOURNALS_SCORES = joinpath(JOURNALS_HOME, "scores.csv")
"""The PollisJournals database: the journals of OpenAlex and of the Norwegian register as tables, and views over `JOURNALS_HOME`, made by `build_journals`."""
const JOURNALS_DB = joinpath(homedir(), ".pollis", "databases", "PollisJournals.duckdb")
"""The PollisJournals.jl folder and the SQL that `JOURNALS_DB` was made with."""
const JOURNALS_STAMP = JOURNALS_DB * ".stamp"

"""
The references of Pollis and of the user: `pollis.json`, those that come with Pollis, which the Julia extension copies
there from each new Pollis; and what the user adds, a line of JSON each, which Pollis appends to (the last line of a row wins):
`references.jsonl`, `counts.jsonl`, `versions.jsonl` and `panels.jsonl`.
"""
const REFERENCES_HOME = joinpath(homedir(), ".pollis", "references")
"""PollisReferences.jl: the references of Pollis and their counts, which may be newer than those this Pollis came with."""
const REFERENCES = Base.PkgId(UUID("16fe3122-f013-44bd-a8ad-a8555e1fbab1"), "PollisReferences")
const REFERENCES_URL = "https://github.com/Trumpingtons/PollisReferences.jl"
"""The commit of PollisReferences.jl installed, from GitHub."""
const REFERENCES_COMMIT = joinpath(ENVIRONMENT, "PollisReferences.commit")
"""
The references of the installed PollisReferences.jl, copied by `copy_package_data` beside `pollis.json`: used instead of
the references of `pollis.json` when they have every key its panels cite, so that a correction reaches Pollis without
a new Pollis. The References pages of Pollis read it too.
"""
const REFERENCES_PACKAGE = joinpath(REFERENCES_HOME, "package.json")
"""The PollisReferences database: the references of Pollis as tables and the user's as views over `REFERENCES_HOME`, made by `build_references`."""
const REFERENCES_DB = joinpath(homedir(), ".pollis", "databases", "PollisReferences.duckdb")
"""The SQL that `REFERENCES_DB` was made with, and the size and time of the `pollis.json` and `REFERENCES_PACKAGE` it was made from."""
const REFERENCES_STAMP = REFERENCES_DB * ".stamp"

"""The folder of the snapshots, one `<id>.<window>.json` per connection, watched by the Databases view."""
const SESSIONS = joinpath(homedir(), ".pollis", "databases", "sessions")

"""A connection shown in the Databases view, and the name it is shown with."""
struct Entry
    con::Any
    name::String
end

const CONNECTIONS = Dict{String,Entry}()
const COUNTER = Ref(0)

# The Pollis window whose REPL this is: each window's Databases view shows only the snapshots of its own REPL.
const WINDOW = get(ENV, "POLLIS_WINDOW", "")
snapshot_path(id::AbstractString) = joinpath(SESSIONS, isempty(WINDOW) ? "$id.json" : "$id.$WINDOW.json")

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
    snapshot = Dict{String,Any}("id" => id, "name" => entry.name, "engine" => engine(entry.con), "updated" => string(now()), "pid" => getpid(), "window" => WINDOW)
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

"""Settings of every DuckDB database `connect` opens: extensions come with Pollis and are never downloaded."""
const DUCKDB_CONFIG = ["autoinstall_known_extensions" => "false", "autoload_known_extensions" => "false"]

"""The built-in databases that `connect` attaches, read-only, under their own names."""
builtins() = filter(isfile, [DATASETS_DB, RSS_DB, JOURNALS_DB, REFERENCES_DB])

"""The task loading Lance into each database `connect` opened, by database."""
const LANCE_TASKS = IdDict{Any,Task}()

"""
    connect(path = ":memory:"; name = "DuckDB", builtins = true, lance = true, show = true)

Open the DuckDB database `path` with the engine of Pollis and return it, ready for
`DBInterface.execute`. The built-in databases are attached read-only as `PollisDatasets`,
`PollisRSS`, `PollisJournals` and `PollisReferences`; the Lance extension is loaded in the background, on a thread of its own, so the
connection is ready at once (`wait_lance(con)` waits for it). The connection is shown in the Databases
view as `name`. DuckDB never downloads extensions here: those that Pollis brings are all there is.

```julia
con = PollisDB.connect()
DBInterface.execute(con, "SELECT * FROM PollisDatasets.main.mroz LIMIT 5")
```
"""
function connect(path::AbstractString = ":memory:"; name::AbstractString = "DuckDB", builtins::Bool = true, lance::Bool = true, show::Bool = true)
    DuckDB = get(() -> Base.require(DUCKDB), Base.loaded_modules, DUCKDB)
    DBInterface = get(() -> Base.require(DBINTERFACE), Base.loaded_modules, DBINTERFACE)
    return Base.invokelatest() do
        db = DuckDB.DB(path; config = DUCKDB_CONFIG)
        if builtins
            for file in PollisDB.builtins()
                DBInterface.execute(db, "ATTACH IF NOT EXISTS '$(replace(file, "'" => "''"))' (READ_ONLY)")
            end
        end
        lance && isfile(LANCE) && (LANCE_TASKS[db] = Threads.@spawn :default load_lance(DBInterface, db))
        show && PollisDB.show(db; name)
        db
    end
end

"""Load Lance into `db` through a connection of its own, so that the user's queries are not held up."""
function load_lance(DBInterface::Module, db)
    con = DBInterface.connect(db)
    try
        DBInterface.execute(con, "LOAD '$(replace(LANCE, "'" => "''"))'")
    finally
        DBInterface.close!(con)
    end
    return nothing
end

"""
    wait_lance(con)

Wait until the Lance extension is loaded into `con`, a database opened by `connect`; return whether it is.
"""
function wait_lance(con)
    task = get(LANCE_TASKS, con, nothing)
    task === nothing && return false
    try
        wait(task)
        return true
    catch err
        @warn "Pollis: could not load the Lance extension of DuckDB" exception = err
        delete!(LANCE_TASKS, con)
        return false
    end
end

"""The connection of the `sql>` mode, opened by its first query."""
const SQL_CONNECTION = Ref{Any}(nothing)

"""
    sql(query; con = <the connection of the sql> mode>)

Run `query`, one or more statements separated by `;`, and return the result of the last one as a
`Result`, a Tables.jl table. Without `con`, this is what the `sql>` mode of the REPL runs (type `>` at
the start of a line to enter it); the connection is an in-memory DuckDB from `connect`, opened at the
first query.
"""
function sql(query::AbstractString; con = nothing)
    if con === nothing
        SQL_CONNECTION[] === nothing && (SQL_CONNECTION[] = connect(; name = "sql> Mode"))
        con = SQL_CONNECTION[]
    end
    # A query about Lance must wait for it; any other runs at once.
    occursin(r"lance"i, query) && wait_lance(con)
    DBInterface, Tables = loaded(DBINTERFACE), loaded(TABLES)
    tables_interface(Tables)
    started = time()
    columns = Base.invokelatest() do
        result = nothing
        # DBInterface.execute runs one statement at a time.
        for statement in statements(query)
            result = DBInterface.execute(con, statement)
        end
        result === nothing ? NamedTuple() : Tables.columntable(result)
    end
    # Statements such as CREATE TABLE change what the Databases view shows.
    occursin(r"\b(create|drop|alter|attach|detach|insert|update|delete|copy|import)\b"i, query) && refresh()
    return Result(columns, time() - started)
end

"""
The pieces of `query` between the semicolons outside quotes, dollar-quoted strings and comments,
blank ones included: the last is what follows the last semicolon.
"""
function pieces(query::AbstractString)
    found = String[]
    start = 1
    i = firstindex(query)
    n = lastindex(query)
    skip(close, from) = something(findnext(close, query, from), n:n)[end]
    while i <= n
        c = query[i]
        if c == '\'' || c == '"'
            i = skip(string(c), nextind(query, i))
        elseif c == '-' && startswith(SubString(query, i), "--")
            i = skip("\n", i)
        elseif c == '/' && startswith(SubString(query, i), "/*")
            i = skip("*/", i + 2)
        elseif c == '$' && (m = match(r"^\$[A-Za-z_]*\$", SubString(query, i))) !== nothing
            i = skip(m.match, i + ncodeunits(m.match))
        elseif c == ';'
            push!(found, query[start:prevind(query, i)])
            start = nextind(query, i)
        end
        i = nextind(query, i)
    end
    push!(found, query[start:end])
    return found
end

"""Whether `piece` of SQL holds nothing but blanks and comments."""
blank(piece::AbstractString) = isempty(strip(replace(piece, r"--[^\n]*|/\*.*?\*/"s => "")))

"""The statements of `query`, one or more separated by semicolons."""
statements(query::AbstractString) = filter(!blank, pieces(query))

"""Whether `query` is blank or ends with a semicolon outside quotes and comments: the `sql>` mode runs it then."""
complete(query::AbstractString) = blank(query) || blank(last(pieces(query)))

"""The result of a query of `sql`: its columns, a Tables.jl column table, and the seconds it took."""
struct Result
    columns::NamedTuple
    seconds::Float64
end

const TABLES_INTERFACE = Ref(false)

"""Make `Result` a Tables.jl table, once Tables.jl is loaded (DuckDB loads it)."""
function tables_interface(Tables::Module)
    TABLES_INTERFACE[] && return nothing
    @eval begin
        $Tables.istable(::Type{Result}) = true
        $Tables.columnaccess(::Type{Result}) = true
        $Tables.columns(r::Result) = r.columns
    end
    TABLES_INTERFACE[] = true
    return nothing
end

"""The rows of a `Result` that the REPL shows: the first and the last, when there are more."""
const SHOWN_ROWS = 40

function Base.show(io::IO, ::MIME"text/plain", r::Result)
    names = collect(string.(keys(r.columns)))
    nrows = isempty(names) ? 0 : length(first(r.columns))
    timing = string(round(r.seconds; digits = 3), " s")
    if isempty(names)
        print(io, "(", timing, ")")
        return nothing
    end
    shown = nrows <= SHOWN_ROWS ? collect(1:nrows) : [1:SHOWN_ROWS÷2; nrows-SHOWN_ROWS÷2+1:nrows]
    cell(x) = x === missing ? "NULL" : replace(string(x), r"\s" => " ")
    cells = [[cell(col[i]) for i in shown] for col in values(r.columns)]
    width(j) = min(40, maximum(textwidth, cells[j]; init = textwidth(names[j])))
    widths = [width(j) for j in eachindex(names)]
    fit(s, w) = textwidth(s) > w ? first(s, w - 1) * "…" : rpad(s, w)
    line(l, m, r) = string(l, join((repeat('─', w + 2) for w in widths), m), r)
    row(values) = string("│ ", join((fit(values[j], widths[j]) for j in eachindex(names)), " │ "), " │")
    println(io, line('┌', '┬', '┐'))
    println(io, row(names))
    println(io, line('├', '┼', '┤'))
    for (k, i) in enumerate(shown)
        nrows > SHOWN_ROWS && k == SHOWN_ROWS ÷ 2 + 1 && println(io, row(fill("⋮", length(names))))
        println(io, row([cells[j][k] for j in eachindex(names)]))
    end
    println(io, line('└', '┴', '┘'))
    print(io, "(", nrows, nrows == 1 ? " row" : " rows", ", ", timing, ")")
    return nothing
end

"""
Add the `sql>` mode to the REPL: `>` at the start of a line enters it, backspace on an empty line
leaves it. A query ends with `;`; until then, Enter starts a new line. The result is shown as a table
and is `ans` afterwards.
"""
function sql_mode(repl)
    REPL = parentmodule(typeof(repl))
    LineEdit = REPL.LineEdit
    # Wait for the REPL to set up its interface, as VSCodeServer does.
    for _ in 1:100
        isdefined(repl, :interface) && break
        sleep(0.1)
    end
    isdefined(repl, :interface) || return nothing
    main = repl.interface.modes[1]
    any(m -> m isa LineEdit.Prompt && m.prompt == "sql> ", repl.interface.modes) && return nothing
    mode = LineEdit.Prompt("sql> ";
        prompt_prefix = repl.options.hascolor ? Base.text_colors[:yellow] : "",
        prompt_suffix = "",
        sticky = true,
        on_enter = s -> complete(String(take!(copy(LineEdit.buffer(s))))))
    mode.repl = repl
    hp = main.hist
    hp.mode_mapping[:sql] = mode
    mode.hist = hp
    mode.on_done = REPL.respond(repl, mode; suppress_on_semicolon = false) do line
        :($sql($line))
    end
    _, prefix_keymap = LineEdit.setup_prefix_keymap(hp, mode)
    keymaps = Dict{Any,Any}[REPL.mode_keymap(main), prefix_keymap, LineEdit.history_keymap, LineEdit.default_keymap, LineEdit.escape_defaults]
    isdefined(REPL, :History) || pushfirst!(keymaps, last(LineEdit.setup_search_keymap(hp)))
    mode.keymap_dict = LineEdit.keymap(keymaps)
    push!(repl.interface.modes, mode)
    enter = Dict{Any,Any}('>' => function (s, args...)
        if isempty(s) || position(LineEdit.buffer(s)) == 0
            buf = copy(LineEdit.buffer(s))
            return LineEdit.transition(s, mode) do
                LineEdit.state(s, mode).input_buffer = buf
            end
        end
        LineEdit.edit_insert(s, '>')
        isdefined(LineEdit, :check_show_hint) && LineEdit.check_show_hint(s)
        return nothing
    end)
    main.keymap_dict = LineEdit.keymap_merge(main.keymap_dict, enter)
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

"""
The SQL statements of the PollisRSS views. `items` has each item once, as first received (two windows may both add
it to the archive); `feeds` has one row per feed; `zotero` has the items added to Zotero; `episodes` the podcast
episodes downloaded. The times are in UTC.
"""
function rss_sql()
    files = replace(joinpath(RSS_ITEMS, "*.jsonl"), "\\" => "/", "'" => "''")
    zotero = replace(RSS_ZOTERO, "\\" => "/", "'" => "''")
    episodes = replace(RSS_EPISODES, "\\" => "/", "'" => "''")
    return ["""
    CREATE OR REPLACE VIEW items AS
    SELECT * EXCLUDE (copy) FROM (
        SELECT *, row_number() OVER (PARTITION BY id ORDER BY received) AS copy
        FROM read_json('$files', format = 'newline_delimited', ignore_errors = true, columns = {
            id: 'VARCHAR', feed: 'VARCHAR', feed_title: 'VARCHAR', topic: 'VARCHAR', title: 'VARCHAR', link: 'VARCHAR',
            published: 'TIMESTAMP', received: 'TIMESTAMP', summary: 'VARCHAR', image: 'VARCHAR', media: 'VARCHAR', media_type: 'VARCHAR'
        })
    ) WHERE copy = 1""",
    "COMMENT ON VIEW items IS 'Every item of the RSS feeds Pollis has received, once each; published and received are in UTC'",
    """
    CREATE OR REPLACE VIEW feeds AS
    SELECT feed, any_value(feed_title) AS feed_title, any_value(topic) AS topic, count(*) AS items,
           min(published) AS first_published, max(published) AS last_published, max(received) AS last_received
    FROM items GROUP BY feed""",
    "COMMENT ON VIEW feeds IS 'The RSS feeds of the archive, with their numbers of items'",
    """
    CREATE OR REPLACE VIEW zotero AS
    SELECT * FROM read_json('$zotero', format = 'newline_delimited', ignore_errors = true, columns = {
        id: 'VARCHAR', feed: 'VARCHAR', title: 'VARCHAR', link: 'VARCHAR', added: 'TIMESTAMP', collection: 'VARCHAR'
    })""",
    "COMMENT ON VIEW zotero IS 'The items of the RSS feeds added to Zotero, with the library or collection; join items on id; added is in UTC'",
    """
    CREATE OR REPLACE VIEW episodes AS
    SELECT * FROM read_json('$episodes', format = 'newline_delimited', ignore_errors = true, columns = {
        id: 'VARCHAR', feed: 'VARCHAR', title: 'VARCHAR', link: 'VARCHAR', media: 'VARCHAR', file: 'VARCHAR', downloaded: 'TIMESTAMP'
    })""",
    "COMMENT ON VIEW episodes IS 'The podcast episodes downloaded, with the file each was saved to; join items on id; downloaded is in UTC'"]
end

"""
    build_rss()

Make the PollisRSS database `RSS_DB`, views that read the archive `RSS_ITEMS` whenever they are queried,
when it is missing or was made with other SQL. Pollis adds the items it receives to the archive, so the
database needs no updating. Written under a temporary name and moved into place, as `build` does.
"""
function build_rss()
    statements = rss_sql()
    sql = join(statements, ";\n")
    isfile(RSS_DB) && isfile(RSS_STAMP) && read(RSS_STAMP, String) == sql && return nothing
    # The views need a file to read: the month's, which Pollis then adds to
    mkpath(RSS_ITEMS)
    any(endswith(".jsonl"), readdir(RSS_ITEMS)) || touch(joinpath(RSS_ITEMS, string(now())[1:7] * ".jsonl"))
    isfile(RSS_ZOTERO) || touch(RSS_ZOTERO)
    isfile(RSS_EPISODES) || touch(RSS_EPISODES)
    DuckDB = get(() -> Base.require(DUCKDB), Base.loaded_modules, DUCKDB)
    get(() -> Base.require(DBINTERFACE), Base.loaded_modules, DBINTERFACE)
    mkpath(dirname(RSS_DB))
    tmp = "$RSS_DB.$(getpid()).tmp"
    rm(tmp; force = true)
    try
        Base.invokelatest() do
            con = loaded(DBINTERFACE).connect(DuckDB.DB, tmp)
            try
                foreach(statement -> loaded(DBINTERFACE).execute(con, statement), statements)
                loaded(DBINTERFACE).execute(con, "CHECKPOINT")
            finally
                loaded(DBINTERFACE).close!(con)
            end
        end
        mv(tmp, RSS_DB; force = true)
        write(RSS_STAMP, sql)
    catch err
        rm(tmp; force = true)
        isfile(RSS_DB) || rethrow()
        @warn "Pollis: could not rebuild the PollisRSS database; the previous one is kept" exception = err
    end
    return nothing
end

"""
The SQL statements of the PollisJournals views, over what Pollis adds to `JOURNALS_HOME`: `metrics` the rows of the
metrics imported; `journal_metrics` those rows with the OpenAlex journal their ISSN names; `articles` the articles
looked up, the latest line of each.
"""
function journals_sql()
    metrics = replace(joinpath(JOURNALS_METRICS, "*.jsonl"), "\\" => "/", "'" => "''")
    articles = replace(JOURNALS_ARTICLES, "\\" => "/", "'" => "''")
    return ["""
    CREATE OR REPLACE VIEW metrics AS
    SELECT * FROM read_json('$metrics', format = 'newline_delimited', ignore_errors = true, columns = {
        title: 'VARCHAR', category: 'VARCHAR', issn: 'VARCHAR', eissn: 'VARCHAR', year: 'INTEGER', source: 'VARCHAR',
        jif: 'DOUBLE', jif_5year: 'DOUBLE', jif_quartile: 'VARCHAR', jci: 'DOUBLE',
        citescore: 'DOUBLE', citescore_quartile: 'VARCHAR', sjr: 'DOUBLE', sjr_quartile: 'VARCHAR', h_index: 'INTEGER',
        snip: 'DOUBLE', ipp: 'DOUBLE', abdc_rating: 'VARCHAR', imported: 'TIMESTAMP'
    })""",
    "COMMENT ON VIEW metrics IS 'The journal metrics imported from JCR, Scopus, SCImago and CWTS files, and the ABDC Journal Quality List''s ratings (A*, A, B, C; category is its Field of Research code), a row per journal, year and subject category as the file has them'",
    """
    CREATE OR REPLACE VIEW journal_metrics AS
    SELECT m.title, m.category, m.issn, m.eissn, coalesce(p.id, e.id) AS journal_id, m.year, m.source,
        m.* EXCLUDE (title, category, issn, eissn, year, source)
    FROM metrics m
    LEFT JOIN journal_issns p ON p.issn = m.issn
    LEFT JOIN journal_issns e ON e.issn = m.eissn""",
    "COMMENT ON VIEW journal_metrics IS 'The metrics imported, with the id of the journal in journals that their ISSN names'",
    """
    CREATE OR REPLACE VIEW articles AS
    SELECT * EXCLUDE (copy, line) FROM (
        SELECT *, row_number() OVER (PARTITION BY id ORDER BY line DESC) AS copy FROM (
            SELECT *, row_number() OVER () AS line FROM read_json('$articles', format = 'newline_delimited', ignore_errors = true, columns = {
                id: 'VARCHAR', title: 'VARCHAR', link: 'VARCHAR', doi: 'VARCHAR', openalex: 'VARCHAR', matched_title: 'VARCHAR',
                journal_id: 'VARCHAR', journal: 'VARCHAR', issn_l: 'VARCHAR', year: 'INTEGER', type: 'VARCHAR',
                cited_by_count: 'INTEGER', fwci: 'DOUBLE', citation_percentile: 'DOUBLE', top_1_percent: 'BOOLEAN',
                top_10_percent: 'BOOLEAN', is_oa: 'BOOLEAN', looked_up: 'TIMESTAMPTZ', source: 'VARCHAR', work: 'VARCHAR',
                version: 'VARCHAR'
            }))
    ) WHERE copy = 1""",
    "COMMENT ON VIEW articles IS 'The articles of the email alerts'' items and of the works saved from Literature Radar, looked up in Crossref and OpenAlex, the latest lookup of each: doi is empty when none was found; journal_id is the id of the journal in journals; fwci is OpenAlex''s field-weighted citation impact (1 is the average) and citation_percentile, from 0 to 1, the percentile of its citations among the works of the same field, year and type; source is literature radar for a work saved there, with its work and version; looked_up is in UTC'"]
end

"""
The Parquet file of the journals in the artifact of the installed PollisJournals.jl, with the package's folder,
which changes with each installed version; `nothing` when it is not installed or its artifact is missing.
"""
function journals_parquet()
    path = Base.locate_package(JOURNALS)
    path === nothing && return nothing
    root = dirname(dirname(path))
    toml = joinpath(root, "Artifacts.toml")
    isfile(toml) || return nothing
    Artifacts = Base.require(Base.PkgId(UUID("56f22d72-fd6d-98f1-02f0-08ddc0907c33"), "Artifacts"))
    hash = Base.invokelatest(Artifacts.artifact_hash, "journals", toml)
    hash === nothing && return nothing
    file = joinpath(Base.invokelatest(Artifacts.artifact_path, hash), "journals.parquet")
    return isfile(file) ? (; root, file) : nothing
end

"""
The rows of `JOURNALS_SCORES`: every journal of OpenAlex with an ISSN, and every journal of the Norwegian register,
joined where the register's ISSN names an OpenAlex journal; the level is the register's latest.
"""
const SCORES_SQL = """
    WITH latest AS (SELECT id, arg_max(level, year) AS level, max(year) AS level_year FROM norwegian_levels GROUP BY id),
    register AS (SELECT r.journal_id, r.issn, r.eissn, latest.level, latest.level_year FROM norwegian_register r JOIN latest USING (id)),
    openalex AS (SELECT id, issn, round(mean_citedness_2yr, 2) AS cited, h_index, is_oa::INTEGER AS oa, is_in_doaj::INTEGER AS doaj FROM journals WHERE len(issn) > 0)
    SELECT array_to_string(list_distinct(list_filter(coalesce(o.issn, []) || [r.issn, r.eissn], x -> x IS NOT NULL)), ' ') AS issns,
        r.level, r.level_year, o.cited, o.h_index, o.oa, o.doaj
    FROM openalex o FULL JOIN register r ON r.journal_id = o.id"""
"""`SCORES_SQL` for an artifact without the Norwegian register."""
const SCORES_SQL_OPENALEX = """
    SELECT array_to_string(issn, ' ') AS issns, NULL AS level, NULL AS level_year, round(mean_citedness_2yr, 2) AS cited,
        h_index, is_oa::INTEGER AS oa, is_in_doaj::INTEGER AS doaj
    FROM journals WHERE len(issn) > 0"""

"""
    build_journals()

Make the PollisJournals database `JOURNALS_DB` when it is missing, or PollisJournals.jl or the SQL of its
views has changed since it was made. The artifact of PollisJournals.jl is copied into tables: the journals of
OpenAlex into `journals`, `journal_years` and `journal_issns`, and the Norwegian register into
`norwegian_register` and `norwegian_levels`; the views over `JOURNALS_HOME` read what
Pollis adds there whenever they are queried, as `build_rss`'s. Written under a temporary name and moved into
place, as `build` does, with `JOURNALS_SCORES`, which is remade too when it is missing.
"""
function build_journals()
    source = journals_parquet()
    source === nothing && return nothing
    statements = journals_sql()
    stamp = journals_stamp(source)
    isfile(JOURNALS_DB) && isfile(JOURNALS_STAMP) && isfile(JOURNALS_SCORES) && read(JOURNALS_STAMP, String) == stamp && return nothing
    println("Pollis: building the PollisJournals database. This happens only when PollisJournals.jl changes.")
    mkpath(JOURNALS_METRICS)
    # The view needs a file to read before any import
    touch(joinpath(JOURNALS_METRICS, ".placeholder.jsonl"))
    isfile(JOURNALS_ARTICLES) || touch(JOURNALS_ARTICLES)
    DuckDB = get(() -> Base.require(DUCKDB), Base.loaded_modules, DUCKDB)
    get(() -> Base.require(DBINTERFACE), Base.loaded_modules, DBINTERFACE)
    mkpath(dirname(JOURNALS_DB))
    tmp = "$JOURNALS_DB.$(getpid()).tmp"
    scores = "$JOURNALS_SCORES.$(getpid()).tmp"
    rm(tmp; force = true)
    try
        Base.invokelatest() do
            con = loaded(DBINTERFACE).connect(DuckDB.DB, tmp)
            execute(statement) = loaded(DBINTERFACE).execute(con, statement)
            try
                file = replace(source.file, "\\" => "/", "'" => "''")
                execute("CREATE TABLE journals AS SELECT * EXCLUDE (counts_by_year) FROM read_parquet('$file')")
                execute("CREATE TABLE journal_years AS SELECT * FROM (SELECT id, unnest(counts_by_year, recursive := true) FROM read_parquet('$file')) ORDER BY id, year")
                execute("CREATE TABLE journal_issns AS SELECT issn, min(id) AS id FROM (SELECT id, unnest(issn) AS issn FROM journals) GROUP BY issn")
                execute("COMMENT ON TABLE journals IS 'The journals, repositories, conferences and book series of OpenAlex with at least one work, and OpenAlex''s indicators of them. Source: OpenAlex. Licence: CC0'")
                execute("COMMENT ON COLUMN journals.mean_citedness_2yr IS 'The mean citations, this year, of the works of the two years before: OpenAlex''s analogue of the impact factor'")
                execute("COMMENT ON COLUMN journals.field IS 'The field of the most frequent topic of its works'")
                execute("COMMENT ON TABLE journal_years IS 'The works and citations of each journal of journals by year. Source: OpenAlex. Licence: CC0'")
                execute("COMMENT ON TABLE journal_issns IS 'Every ISSN of the journals, print and electronic, with the id of its journal'")
                # The Norwegian register, in the artifacts of PollisJournals.jl released since 2026-10-20
                norwegian = joinpath(dirname(source.file), "norwegian.parquet")
                if isfile(norwegian)
                    file = replace(norwegian, "\\" => "/", "'" => "''")
                    execute("""
                    CREATE TABLE norwegian_register AS
                    SELECT n.id, n.title, n.international_title, n.issn, n.eissn, coalesce(p.id, e.id) AS journal_id,
                        n.* EXCLUDE (id, title, international_title, issn, eissn, levels)
                    FROM read_parquet('$file') n
                    LEFT JOIN journal_issns p ON p.issn = n.issn
                    LEFT JOIN journal_issns e ON e.issn = n.eissn""")
                    execute("CREATE TABLE norwegian_levels AS SELECT * FROM (SELECT id, unnest(levels, recursive := true) FROM read_parquet('$file')) ORDER BY id, year")
                    execute("COMMENT ON TABLE norwegian_register IS 'The journals and series of the Norwegian Register for Scientific Journals, Series and Publishers, with the id of the journal in journals that their ISSN names. Source: HK-dir. Licence: NLOD 2.0'")
                    execute("COMMENT ON TABLE norwegian_levels IS 'The level of each journal or series of norwegian_register by year: 0 not academic, 1 academic, 2 leading, X under review. Source: HK-dir. Licence: NLOD 2.0'")
                end
                foreach(execute, statements)
                path = replace(scores, "\\" => "/", "'" => "''")
                execute("COPY ($(isfile(norwegian) ? SCORES_SQL : SCORES_SQL_OPENALEX)) TO '$path' (FORMAT CSV, HEADER true)")
                execute("CHECKPOINT")
            finally
                loaded(DBINTERFACE).close!(con)
            end
        end
        mv(tmp, JOURNALS_DB; force = true)
        mv(scores, JOURNALS_SCORES; force = true)
        write(JOURNALS_STAMP, stamp)
    catch err
        rm(tmp; force = true)
        rm(scores; force = true)
        isfile(JOURNALS_DB) || rethrow()
        @warn "Pollis: could not rebuild the PollisJournals database; the previous one is kept" exception = err
    end
    return nothing
end

"""The columns of a reference, of Pollis or of the user; `pollis_key`, `merged_into`, `saved` and `removed` are the user's only."""
const REFERENCE_COLUMNS = """
    key: 'VARCHAR', type: 'VARCHAR', title: 'VARCHAR', authors: 'VARCHAR[]', author_kind: 'VARCHAR', authors_complete: 'BOOLEAN',
    year: 'INTEGER', released: 'TIMESTAMPTZ', journal: 'VARCHAR', booktitle: 'VARCHAR', editors: 'VARCHAR[]', publisher: 'VARCHAR',
    address: 'VARCHAR', edition: 'VARCHAR', volume: 'VARCHAR', number: 'VARCHAR', pages: 'VARCHAR', institution: 'VARCHAR',
    report_number: 'VARCHAR', isbn: 'VARCHAR', issn: 'VARCHAR', doi: 'VARCHAR', arxiv: 'VARCHAR', openalex: 'VARCHAR', url: 'VARCHAR',
    oa_url: 'VARCHAR', abstract: 'VARCHAR', abstract_source: 'VARCHAR', keywords: 'VARCHAR[]', keywords_source: 'VARCHAR',
    legacy_key: 'VARCHAR', source: 'VARCHAR', retrieved: 'DATE', checked: 'BOOLEAN', open_access: 'BOOLEAN',
    pollis_key: 'VARCHAR', merged_into: 'VARCHAR', saved: 'TIMESTAMPTZ', removed: 'BOOLEAN'"""
"""The columns of a citation count: `record` is the index's id of the version counted (none for those of Pollis)."""
const COUNT_COLUMNS = "key: 'VARCHAR', count: 'INTEGER', source: 'VARCHAR', date: 'DATE', record: 'VARCHAR'"
"""The columns of a citation count of the user's: one `removed` when its version was removed from the user's references."""
const USER_COUNT_COLUMNS = COUNT_COLUMNS * ", removed: 'BOOLEAN'"
"""The columns of a version of a work: its record in an index (OpenAlex or Semantic Scholar) and what that record says."""
const VERSION_COLUMNS = """
    key: 'VARCHAR', record: 'VARCHAR', index: 'VARCHAR', kind: 'VARCHAR', doi: 'VARCHAR', title: 'VARCHAR', venue: 'VARCHAR',
    year: 'INTEGER', url: 'VARCHAR', added: 'TIMESTAMPTZ', removed: 'BOOLEAN'"""
"""The columns of a choice of the user about a reference in the References of a panel's Learn More."""
const PANEL_COLUMNS = "panel: 'VARCHAR', key: 'VARCHAR', shown: 'BOOLEAN', changed: 'TIMESTAMPTZ'"

"""
The SQL statements of PollisReferences. The references of Pollis, from `pollis.json`, are tables, replaced when Pollis
brings new ones; the user's are views over the JSON Lines files of `REFERENCES_HOME`, the last line of each row winning,
so they always show what Pollis has appended. `all_references` has each work once: a user's row whose key is a reference
of Pollis corrects it, and one with a `pollis_key` (a work the user had before Pollis brought it) gives way to Pollis'.
"""
function references_sql(source::AbstractString = joinpath(REFERENCES_HOME, "pollis.json"))
    file(name) = replace(joinpath(REFERENCES_HOME, name), "\\" => "/", "'" => "''")
    lines(name, columns) = "read_json('$(file(name))', format = 'newline_delimited', ignore_errors = true, columns = {$columns})"
    # Each row with its line, so that the last line of a row wins, as the files are appended to
    numbered(name, columns) = "(SELECT *, row_number() OVER () AS line FROM $(lines(name, columns)))"
    fields(columns) = join(["\"$(m[:name])\" $(m[:type])" for m in eachmatch(r"(?<name>\w+): '(?<type>[^']+)'", columns)], ", ")
    pollis = replace(source, "\\" => "/", "'" => "''")
    return ["""
    CREATE TABLE pollis_references AS
    SELECT r.* FROM (SELECT unnest("references") AS r FROM read_json('$pollis', columns = {"references": 'STRUCT($(fields(REFERENCE_COLUMNS)))[]'}))""",
    "COMMENT ON TABLE pollis_references IS 'The references of Pollis, those of its panels, notebooks and methods, from PollisReferences.jl, or those Pollis came with; replaced when either brings new ones. pollis_key, merged_into, saved and removed are empty: they are the user''s'",
    """
    CREATE TABLE pollis_counts AS
    SELECT c.* FROM (SELECT unnest(counts) AS c FROM read_json('$pollis', columns = {counts: 'STRUCT($(fields(COUNT_COLUMNS)))[]'}))""",
    "COMMENT ON TABLE pollis_counts IS 'The citation counts of the references of Pollis, from Crossref and OpenAlex, dated when observed'",
    "CREATE TABLE pollis_versions AS SELECT * FROM $(lines("versions.jsonl", VERSION_COLUMNS)) LIMIT 0",
    "COMMENT ON TABLE pollis_versions IS 'The versions of the references of Pollis (none yet), as user_versions has them'",
    """
    CREATE VIEW user_references AS
    SELECT * EXCLUDE (copy, line) FROM (
        SELECT *, row_number() OVER (PARTITION BY key ORDER BY line DESC) AS copy FROM $(numbered("references.jsonl", REFERENCE_COLUMNS))
    ) WHERE copy = 1 AND NOT coalesce(removed, false)""",
    "COMMENT ON VIEW user_references IS 'The references the user added, from Literature Radar or the References of a panel, and their corrections of references of Pollis (the same key); pollis_key names the reference of Pollis that a work added before Pollis brought it is; merged_into, the work a duplicate was merged into; saved is in UTC'",
    """
    CREATE VIEW user_aliases AS
    WITH RECURSIVE chain(key, target, depth) AS (
        SELECT key, merged_into, 1 FROM user_references WHERE merged_into IS NOT NULL
        UNION ALL
        SELECT c.key, u.merged_into, c.depth + 1 FROM chain c JOIN user_references u ON u.key = c.target
        WHERE u.merged_into IS NOT NULL AND c.depth < 32
    )
    SELECT key, arg_max(target, depth) AS merged_into FROM chain GROUP BY key""",
    "COMMENT ON VIEW user_aliases IS 'The keys of the works the user merged into another, each with the key of all_references it now is'",
    """
    CREATE VIEW user_counts AS
    SELECT key, count, source, date, record FROM (
        SELECT *, row_number() OVER (PARTITION BY key, source, date, record ORDER BY line DESC) AS copy FROM $(numbered("counts.jsonl", USER_COUNT_COLUMNS))
    ) WHERE copy = 1 AND NOT coalesce(removed, false)""",
    "COMMENT ON VIEW user_counts IS 'The citation counts observed for the user, of any reference, dated; record is the index''s id of the version counted'",
    """
    CREATE VIEW user_versions AS
    SELECT * EXCLUDE (copy, line) FROM (
        SELECT *, row_number() OVER (PARTITION BY key, record ORDER BY line DESC) AS copy FROM $(numbered("versions.jsonl", VERSION_COLUMNS))
    ) WHERE copy = 1 AND NOT coalesce(removed, false)""",
    "COMMENT ON VIEW user_versions IS 'The versions of the works the user saved from Literature Radar, of any reference: the published article, a preprint, a working paper, as an index (openalex or semantic scholar) records them; added is in UTC'",
    """
    CREATE VIEW user_panels AS
    SELECT * EXCLUDE (copy, line) FROM (
        SELECT *, row_number() OVER (PARTITION BY panel, key ORDER BY line DESC) AS copy FROM $(numbered("panels.jsonl", PANEL_COLUMNS))
    ) WHERE copy = 1""",
    "COMMENT ON VIEW user_panels IS 'The references the user added to (shown) or hid from (not shown) the References of a panel''s Learn More; changed is in UTC'",
    """
    CREATE VIEW all_references AS
    SELECT *, 'pollis' AS origin FROM pollis_references p WHERE NOT EXISTS (SELECT 1 FROM user_references u WHERE u.key = p.key)
    UNION ALL BY NAME
    SELECT *, CASE WHEN key IN (SELECT key FROM pollis_references) THEN 'corrected' ELSE 'user' END AS origin
    FROM user_references WHERE pollis_key IS NULL AND merged_into IS NULL""",
    "COMMENT ON VIEW all_references IS 'Every reference once: those of Pollis, as the user corrected them, and those the user added that Pollis does not have, but for those merged into another; origin is pollis, corrected or user'",
    """
    CREATE VIEW all_counts AS
    SELECT coalesce(a.merged_into, c.key) AS key, c.count, c.source, c.date, c.record FROM pollis_counts c LEFT JOIN user_aliases a USING (key)
    UNION ALL
    SELECT coalesce(a.merged_into, u.pollis_key, c.key) AS key, c.count, c.source, c.date, c.record
    FROM user_counts c LEFT JOIN user_references u USING (key) LEFT JOIN user_aliases a USING (key)""",
    "COMMENT ON VIEW all_counts IS 'The citation counts of Pollis and of the user, under the keys of all_references'",
    """
    CREATE VIEW all_versions AS
    SELECT * FROM pollis_versions
    UNION ALL BY NAME
    SELECT v.* REPLACE (coalesce(a.merged_into, u.pollis_key, v.key) AS key)
    FROM user_versions v LEFT JOIN user_references u USING (key) LEFT JOIN user_aliases a USING (key)""",
    "COMMENT ON VIEW all_versions IS 'The versions of Pollis and of the user, under the keys of all_references'"]
end

"""What `REFERENCES_STAMP` holds when `REFERENCES_DB` is up to date; `nothing` when there are no references of Pollis yet."""
function references_stamp()
    pollis = joinpath(REFERENCES_HOME, "pollis.json")
    isfile(pollis) || return nothing
    package = isfile(REFERENCES_PACKAGE) ? "$(filesize(REFERENCES_PACKAGE)) $(mtime(REFERENCES_PACKAGE))" : "none"
    return "$(filesize(pollis)) $(mtime(pollis)) $package\n" * join(references_sql(), ";\n")
end

"""
The file to take the references of Pollis from: `REFERENCES_PACKAGE` when it has every key the panels of `pollis.json`
cite, else `pollis.json`; asked through `con`, a DuckDB connection.
"""
function references_source(con)
    pollis = joinpath(REFERENCES_HOME, "pollis.json")
    isfile(REFERENCES_PACKAGE) || return pollis
    quoted(path) = replace(path, "\\" => "/", "'" => "''")
    missing_keys = first(loaded(DBINTERFACE).execute(con, """
        SELECT count(*) AS n FROM (SELECT unnest(p.keys) AS key FROM (SELECT unnest(panels) AS p FROM read_json('$(quoted(pollis))', columns = {panels: 'STRUCT(keys VARCHAR[])[]'})))
        WHERE key NOT IN (SELECT r.key FROM (SELECT unnest("references") AS r FROM read_json('$(quoted(REFERENCES_PACKAGE))', columns = {"references": 'STRUCT(key VARCHAR)[]'})))""")).n
    return missing_keys == 0 ? REFERENCES_PACKAGE : pollis
end

"""The data files of `DATA_PACKAGES` that Pollis reads: the package, its file in `data`, and where it is copied."""
const PACKAGE_COPIES = [(pkg = REFERENCES, file = "references.json", copy = REFERENCES_PACKAGE), (pkg = RSS, file = "feeds.json", copy = RSS_CATALOGUE)]

"""
    copy_package_data()

Copy the data files of the installed PollisReferences.jl and PollisRSS.jl (`PACKAGE_COPIES`) where Pollis reads them,
when they differ from those there.
"""
function copy_package_data()
    for (; pkg, file, copy) in PACKAGE_COPIES
        source = package_data_file(pkg, file)
        source === nothing && continue
        text = read(source, String)
        isfile(copy) && read(copy, String) == text && continue
        mkpath(dirname(copy))
        tmp = "$copy.$(getpid()).tmp"
        write(tmp, text)
        mv(tmp, copy; force = true)
    end
    return nothing
end

"""The file `file` of the data folder of the installed package `pkg`; `nothing` when it is not installed."""
function package_data_file(pkg::Base.PkgId, file::AbstractString)
    path = Base.locate_package(pkg)
    path === nothing && return nothing
    data = joinpath(dirname(dirname(path)), "data", file)
    return isfile(data) ? data : nothing
end

"""Whether a data file of `PACKAGE_COPIES` installed is not yet the one copied."""
function package_data_uncopied()
    return any(PACKAGE_COPIES) do (; pkg, file, copy)
        source = package_data_file(pkg, file)
        source !== nothing && (!isfile(copy) || filesize(copy) != filesize(source) || read(copy, String) != read(source, String))
    end
end

"""What `JOURNALS_DB` is made from: the folder of PollisJournals.jl, and the SQL of its views and of `JOURNALS_SCORES`."""
journals_stamp(source) = source.root * "\n" * join(journals_sql(), ";\n") * "\n" * SCORES_SQL

"""Whether `JOURNALS_DB` is older than the installed PollisJournals.jl or its SQL; `false` when it is not installed."""
function journals_outdated()
    source = journals_parquet()
    source === nothing && return false
    return !isfile(JOURNALS_STAMP) || read(JOURNALS_STAMP, String) != journals_stamp(source)
end

"""Whether `REFERENCES_DB` is missing, or older than the references of Pollis or its SQL."""
function references_outdated()
    stamp = references_stamp()
    stamp === nothing && return false
    return !isfile(REFERENCES_DB) || !isfile(REFERENCES_STAMP) || read(REFERENCES_STAMP, String) != stamp
end

"""
    build_references()

Make the PollisReferences database `REFERENCES_DB` when it is missing, or the references of Pollis (`pollis.json`
in `REFERENCES_HOME`, which the Julia extension copies from each Pollis, and `REFERENCES_PACKAGE`, from PollisReferences.jl,
taken instead when it has every key the panels cite) or the SQL of `references_sql` have changed since it was made.
The references of Pollis are replaced; the user's, in the JSON Lines files beside them, are
never touched: the views read them whenever they are queried. Written under a temporary name and moved into place,
as `build` does.
"""
function build_references()
    references_outdated() || return nothing
    stamp = references_stamp()
    # The views need files to read before the user adds anything
    foreach(name -> (file = joinpath(REFERENCES_HOME, name); isfile(file) || touch(file)), ["references.jsonl", "counts.jsonl", "versions.jsonl", "panels.jsonl"])
    DuckDB = get(() -> Base.require(DUCKDB), Base.loaded_modules, DUCKDB)
    get(() -> Base.require(DBINTERFACE), Base.loaded_modules, DBINTERFACE)
    mkpath(dirname(REFERENCES_DB))
    tmp = "$REFERENCES_DB.$(getpid()).tmp"
    rm(tmp; force = true)
    try
        Base.invokelatest() do
            con = loaded(DBINTERFACE).connect(DuckDB.DB, tmp)
            try
                source = references_source(con)
                foreach(statement -> loaded(DBINTERFACE).execute(con, statement), references_sql(source))
                loaded(DBINTERFACE).execute(con, "CHECKPOINT")
            finally
                loaded(DBINTERFACE).close!(con)
            end
        end
        mv(tmp, REFERENCES_DB; force = true)
        write(REFERENCES_STAMP, stamp)
    catch err
        rm(tmp; force = true)
        isfile(REFERENCES_DB) || rethrow()
        @warn "Pollis: could not rebuild the PollisReferences database; the previous one is kept" exception = err
    end
    return nothing
end

"""The commit at the head of the main branch of the GitHub repository `url`, or `nothing` when GitHub cannot be reached."""
function latest_commit(url::AbstractString)
    try
        Downloads = Base.require(Base.PkgId(UUID("f43a241f-c20a-4ad4-852c-f6b1247861c6"), "Downloads"))
        io = IOBuffer()
        api = replace(url, "https://github.com/" => "https://api.github.com/repos/") * "/commits/main"
        response = Base.invokelatest(Downloads.request, api; output = io, headers = ["Accept" => "application/vnd.github.sha"], timeout = 3)
        return response.status == 200 ? String(take!(io)) : nothing
    catch
        return nothing
    end
end

"""The packages of Pollis installed from GitHub, the data of the built-in databases, with the file of the commit installed."""
const DATA_PACKAGES = [(pkg = DATASETS, url = DATASETS_URL, commit = DATASETS_COMMIT), (pkg = JOURNALS, url = JOURNALS_URL, commit = JOURNALS_COMMIT),
    (pkg = REFERENCES, url = REFERENCES_URL, commit = REFERENCES_COMMIT), (pkg = RSS, url = RSS_URL, commit = RSS_COMMIT)]

"""
    pending()

What `install()` has to do: the packages built into Pollis that no environment on the load path provides
yet, and, for each of `DATA_PACKAGES`, whether it is missing, and whether GitHub has a newer commit of it
than the one installed (`latest`; `nothing` offline, or when the package is the user's own).
"""
function pending()
    missing_packages = filter(p -> Base.identify_package(p) === nothing, PACKAGES)
    manifest = joinpath(ENVIRONMENT, "Manifest.toml")
    # A DuckDB that Pollis installed from the registry, before the fork: replaced by the fork.
    registry_duckdb = !(DUCKDB.name in missing_packages) && from_registry(manifest)
    data = map(DATA_PACKAGES) do (; pkg, url, commit)
        missing = Base.locate_package(pkg) === nothing
        # Installed by Pollis, so ours to update; a copy in the user's own environment is left alone.
        ours = missing || (isfile(manifest) && occursin(string(pkg.uuid), read(manifest, String)))
        latest = ours ? latest_commit(url) : nothing
        installed = isfile(commit) ? strip(read(commit, String)) : ""
        outdated = !missing && latest !== nothing && latest != installed
        return (; pkg, url, commit, missing, outdated, latest)
    end
    return (; missing_packages, data, registry_duckdb)
end

"""Whether the `manifest` of `ENVIRONMENT` has DuckDB from the registry rather than from `DUCKDB_URL`."""
function from_registry(manifest::AbstractString)
    isfile(manifest) || return false
    TOML = Base.require(Base.PkgId(UUID("fa267f1f-6049-4f14-aa54-33bafae1ed76"), "TOML"))
    entries = get(Base.invokelatest(TOML.parsefile, manifest)["deps"], DUCKDB.name, [])
    return any(e -> get(e, "uuid", "") == string(DUCKDB.uuid) && get(e, "repo-url", "") != DUCKDB_URL, entries)
end

"""Whether the `LANCE` that Pollis brought has not been loaded once yet (see `warm_lance`)."""
function lance_unloaded()
    isfile(LANCE) || return false
    return !isfile(LANCE_STAMP) || read(LANCE_STAMP, String) != string(mtime(LANCE))
end

"""
    needs_install()

Whether `install()` has something to do, or a built-in database, PollisDatasets, PollisRSS, PollisJournals or
PollisReferences, is not made yet, or PollisReferences is older than the references of Pollis. The REPL asks at start, and when it does, Pollis runs `install_pollisdb.jl` in a terminal of
its own, as it installs Revise, so the REPL never waits for Pkg.
"""
function needs_install()
    todo = pending()
    return !isempty(todo.missing_packages) || any(d -> d.missing || d.outdated, todo.data) || todo.registry_duckdb ||
        !isfile(DATASETS_DB) || !isfile(RSS_DB) || !isfile(JOURNALS_DB) || journals_outdated() || package_data_uncopied() || references_outdated() || lance_unloaded()
end

"""
    install()

Install the packages built into Pollis, and the PollisDatasets, PollisJournals, PollisReferences and PollisRSS (`DATA_PACKAGES`),
that no environment on the load path provides yet into `ENVIRONMENT`. The first time, it adds them; afterwards it
keeps the PollisDatasets, PollisJournals, PollisReferences and PollisRSS installed there up to date with GitHub, so that new data reaches
the built-in databases. Pkg runs (and precompiles) only when something is missing or GitHub has a newer
commit than the one installed; offline, the installed copy is kept. The active project is left as it was.
Run by `install_pollisdb.jl`, outside the REPL.
"""
function install()
    (; missing_packages, data, registry_duckdb) = pending()
    missing_data = filter(d -> d.missing, data)
    outdated = filter(d -> d.outdated, data)
    isempty(missing_packages) && isempty(missing_data) && isempty(outdated) && !registry_duckdb && return nothing
    if !isempty(missing_packages) || !isempty(missing_data)
        println("Pollis: installing ", join([missing_packages; [d.pkg.name for d in missing_data]], ", "), " for the built-in databases. This happens only once.")
    elseif registry_duckdb
        println("Pollis: replacing DuckDB with the version that uses the DuckDB engine of Pollis. This happens only once.")
    else
        println("Pollis: updating ", join([d.pkg.name for d in outdated], " and "), ", which has new data.")
    end
    Pkg = Base.require(Main, :Pkg)
    active = Base.ACTIVE_PROJECT[]
    try
        Base.invokelatest(Pkg.activate, ENVIRONMENT; io = devnull)
        # One Pkg.add for them all, so the versions are resolved together: added one after the other,
        # the PollisDatasets (through CSV.jl) force a downgrade of what DuckDB brought, which Pkg fails on.
        specs = [Base.invokelatest(Pkg.PackageSpec; name) for name in missing_packages if name != DUCKDB.name]
        (DUCKDB.name in missing_packages || registry_duckdb) && push!(specs, Base.invokelatest(Pkg.PackageSpec; url = DUCKDB_URL))
        append!(specs, [Base.invokelatest(Pkg.PackageSpec; url = d.url) for d in missing_data])
        # identity. gives the vector the element type Pkg.add needs; built from nothing, it has none.
        if !isempty(specs)
            # Precompiled afterwards, the whole environment: Julia 1.13.2's precompile after an add fails
            # ("Unknown package: CSV") when DuckDB is replaced by the fork.
            withenv(() -> Base.invokelatest(Pkg.add, identity.(specs)), "JULIA_PKG_PRECOMPILE_AUTO" => "0")
            Base.invokelatest(Pkg.precompile)
        end
        for d in data
            latest = d.latest
            if d.outdated
                try
                    # One git fetch, without the registry; Pkg then precompiles the new version and downloads its artifacts.
                    Base.invokelatest(Pkg.update, d.pkg.name; update_registry = false, io = devnull)
                catch err
                    @debug "Pollis: $(d.pkg.name) not updated" exception = err
                    latest = nothing
                end
            end
            latest === nothing || write(d.commit, latest)
        end
    finally
        Base.ACTIVE_PROJECT[] = active
    end
    return nothing
end

"""
    warm_lance()

Load the Lance extension once, at install, so that DuckDB checks its signature and macOS scans it (some
seconds) here rather than the first time a connection of the user needs it. Nothing to do where DuckDB
has no Lance, or once this `LANCE` has been loaded.
"""
function warm_lance()
    lance_unloaded() || return nothing
    DuckDB = get(() -> Base.require(DUCKDB), Base.loaded_modules, DUCKDB)
    get(() -> Base.require(DBINTERFACE), Base.loaded_modules, DBINTERFACE)
    try
        Base.invokelatest() do
            con = loaded(DBINTERFACE).connect(DuckDB.DB)
            try
                loaded(DBINTERFACE).execute(con, "LOAD '$(replace(LANCE, "'" => "''"))'")
            finally
                loaded(DBINTERFACE).close!(con)
            end
        end
        write(LANCE_STAMP, string(mtime(LANCE)))
    catch err
        @warn "Pollis: could not load the Lance extension of DuckDB" exception = err
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

# The sql> mode, in the REPL of Pollis' terminal; notebooks do not load PollisDB.
function add_sql_mode(repl)
    @async try
        sql_mode(repl)
    catch err
        @debug "Pollis: sql> mode not added" exception = err
    end
end
isdefined(Base, :active_repl) ? add_sql_mode(Base.active_repl) : atreplinit(add_sql_mode)

# Remove the snapshots when Julia exits, so the view does not show dead connections.
atexit(() -> foreach(id -> rm(snapshot_path(id); force = true), keys(CONNECTIONS)))

end # module
