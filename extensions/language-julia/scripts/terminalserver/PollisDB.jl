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
built-in databases attached and full-text search (fts) loaded; `sql` runs a query on such a
connection, and is what the `pollis>` mode of the REPL (`>` at the start of a line) runs, and SQL cells of Julia notebooks
(`cell`); it is exported, so that `sql("...")` needs no `PollisDB.` in the REPL and in notebooks. `publish`, exported
too, copies a Julia table into that connection, which `@share name = table` does too. DuckDB is built into Pollis: `install()` adds it,
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

using UUIDs: UUID, uuid4
using Dates: DateTime, now, UTC
import Sockets

export sql, publish, @share

const DBINTERFACE = Base.PkgId(UUID("a10d1c49-ce27-4219-8d33-6db1a4562965"), "DBInterface")
const DUCKDB = Base.PkgId(UUID("d2f5444f-75bc-4fdf-ac35-56f514c445e1"), "DuckDB")
const TABLES = Base.PkgId(UUID("bd369af6-aec1-5ad0-b16a-f7cc5008161c"), "Tables")

"""The Julia environment of the packages built into Pollis, one per Julia minor version."""
const ENVIRONMENT = joinpath(homedir(), ".pollis", "julia", "environments", "v$(VERSION.major).$(VERSION.minor)")

"""The packages built into Pollis: DuckDB and what the connection code loads with it."""
const PACKAGES = ["DuckDB", "DBInterface", "Tables"]

"""Pollis' fork of DuckDB.jl, without DuckDB_jll: the engine is the one in `DUCKDB_HOME`."""
const DUCKDB_URL = "https://github.com/Trumpingtons/DuckDB.jl"

"""Where the Julia extension puts the DuckDB engine and the fts extension that come with Pollis."""
const DUCKDB_HOME = joinpath(homedir(), ".pollis", "duckdb")
"""The fts extension of DuckDB, full-text search with BM25."""
const FTS = joinpath(DUCKDB_HOME, "fts.duckdb_extension")


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
"""PollisBenchmarks.jl: the published benchmarks that Benchmark Answering Models runs on the chat models of this computer, and their grading."""
const BENCHMARKS = Base.PkgId(UUID("42886f46-29ec-4b6e-a6c6-e95103b5ec0b"), "PollisBenchmarks")
const BENCHMARKS_URL = "https://github.com/Trumpingtons/PollisBenchmarks.jl"
"""The commit of PollisBenchmarks.jl installed, from GitHub."""
const BENCHMARKS_COMMIT = joinpath(ENVIRONMENT, "PollisBenchmarks.commit")
"""The PollisBenchmarks database: the catalogue of PollisBenchmarks.jl and the questions of the benchmarks built in, made by `build_benchmarks`."""
const BENCHMARKS_DB = joinpath(homedir(), ".pollis", "databases", "PollisBenchmarks.duckdb")
"""The PollisBenchmarks.jl folder, its artifact and the SQL that `BENCHMARKS_DB` was made with."""
const BENCHMARKS_STAMP = BENCHMARKS_DB * ".stamp"
"""The PollisDocuments database: the passages of Pollis' documents that Ask Pollis searches, made by ask_index.jl when the REPL starts."""
const DOCUMENTS_DB = joinpath(homedir(), ".pollis", "documents", "PollisDocuments.duckdb")
"""
The Comparisons database, of the activity of Pollis: the runs of the Evaluate and Benchmark pages, a copy Pollis makes
after each change of `~/.pollis/ask/Comparisons.duckdb`, which it writes, so that reading the copy never keeps it from
saving a run.
"""
const COMPARISONS_DB = joinpath(homedir(), ".pollis", "databases", "Comparisons.duckdb")

"""The folder of the snapshots, one `<id>.<window>.json` per connection, watched by the Databases view."""
const SESSIONS = joinpath(homedir(), ".pollis", "databases", "sessions")

"""
A connection shown in the Databases view, the name it is shown with, and the schemas whose tables were read when
opened in the view, of a database too large to read whole (`LAZY_TABLES`).
"""
struct Entry
    con::Any
    name::String
    opened::Set{String}
end
Entry(con, name::AbstractString) = Entry(con, name, Set{String}())

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

"""The query that lists the columns of `con`, or `nothing` for ODBC, whose driver lists them itself (`odbc_catalog`)."""
function introspection_sql(con)
    e = engine(con)
    e == "DuckDB" && return SQL_DUCKDB
    e == "SQLite" && return SQL_SQLITE
    e == "LibPQ" && return SQL_POSTGRES
    e == "ODBC" && return nothing
    error("PollisDB: unsupported connection type $(typeof(con))")
end

"""The schemas of the databases behind ODBC that hold the database's own tables, not the user's."""
const ODBC_SYSTEM_SCHEMAS = Set(["information_schema", "pg_catalog", "sys"])

"""
The columns of the tables and views of an ODBC connection, as the query of `introspection_sql` gives them, from the
catalog functions of its driver: the databases behind ODBC have no catalog query in common (Oracle has no
information_schema). A database without schemas (MySQL) shows its catalog in their place.
"""
function odbc_catalog(con)
    ODBC, Tables = parentmodule(typeof(con)), loaded(TABLES)
    # The names of the columns ODBC returns are upper case in the standard, lower case in some drivers
    lower(cols) = NamedTuple{Tuple(Symbol.(lowercase.(string.(keys(cols)))))}(values(cols))
    text(x) = x === missing || x === nothing ? "" : string(x)
    schema(cols, i) = isempty(text(cols.table_schem[i])) ? text(cols.table_cat[i]) : text(cols.table_schem[i])
    tables = lower(Tables.columntable(ODBC.tables(con; tabletype = "TABLE,VIEW")))
    kinds = Dict((schema(tables, i), text(tables.table_name[i])) => text(tables.table_type[i]) for i in eachindex(tables.table_name)
                 if lowercase(schema(tables, i)) ∉ ODBC_SYSTEM_SCHEMAS)
    columns = lower(Tables.columntable(ODBC.columns(con)))
    keep = [haskey(kinds, (schema(columns, i), text(columns.table_name[i]))) for i in eachindex(columns.table_name)]
    rows = findall(keep)
    return (
        table_schema = [schema(columns, i) for i in rows],
        table_name = [text(columns.table_name[i]) for i in rows],
        table_type = [kinds[(schema(columns, i), text(columns.table_name[i]))] for i in rows],
        column_name = [text(columns.column_name[i]) for i in rows],
        data_type = [text(columns.type_name[i]) for i in rows],
    )
end

"""
The number of tables above which the Databases view lists the schemas of a PostgreSQL database first, and reads the
tables of a schema when it is opened: WRDS, for one, holds thousands of tables in hundreds of schemas.
"""
const LAZY_TABLES = 500

"""The schemas of a PostgreSQL database the user may use, and the number of tables and views in each, from its catalog."""
const SQL_POSTGRES_SCHEMAS = """
    SELECT n.nspname AS table_schema, count(c.oid) AS tables
    FROM pg_namespace n
    LEFT JOIN pg_class c ON c.relnamespace = n.oid AND c.relkind IN ('r', 'v', 'm', 'p', 'f')
    WHERE n.nspname NOT LIKE 'pg\\_%' AND n.nspname <> 'information_schema' AND has_schema_privilege(n.oid, 'USAGE')
    GROUP BY n.nspname
    ORDER BY n.nspname"""

"""The columns of the tables and views of one schema of a PostgreSQL database, the schema given as `\$1`."""
const SQL_POSTGRES_SCHEMA = """
    SELECT c.table_schema, c.table_name, t.table_type, c.column_name, c.data_type
    FROM information_schema.columns c
    JOIN information_schema.tables t USING (table_catalog, table_schema, table_name)
    WHERE c.table_schema = \$1
    ORDER BY c.table_name, c.ordinal_position"""

"""
Schemas, tables and columns of `con`, as nested Dicts ready for JSON. A PostgreSQL database of more than `LAZY_TABLES`
tables gives its schemas alone, each with its number of tables and `"unread": true`, but for the schemas `opened`,
whose tables are read.
"""
function introspect(con; opened::Set{String} = Set{String}())
    DBInterface, Tables = loaded(DBINTERFACE), loaded(TABLES)
    if engine(con) == "LibPQ"
        counts = Tables.columntable(DBInterface.execute(con, SQL_POSTGRES_SCHEMAS))
        if sum(counts.tables; init = 0) > LAZY_TABLES
            return map(eachindex(counts.table_schema)) do i
                name = string(counts.table_schema[i])
                name in opened || return Dict{String,Any}("name" => name, "tables" => Any[], "tableCount" => Int(counts.tables[i]), "unread" => true)
                try
                    schema = schemas_of(Tables.columntable(DBInterface.execute(con, SQL_POSTGRES_SCHEMA, [name])))
                    isempty(schema) ? Dict{String,Any}("name" => name, "tables" => Any[]) : only(schema)
                catch err
                    Dict{String,Any}("name" => name, "tables" => Any[], "error" => sprint(showerror, err))
                end
            end
        end
    end
    query = introspection_sql(con)
    return schemas_of(query === nothing ? odbc_catalog(con) : Tables.columntable(DBInterface.execute(con, query)))
end

"""The schemas, tables and columns of `cols`, the columns the query of `introspection_sql` gives, as nested Dicts."""
function schemas_of(cols)
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
    # The Shared Session, whose hover in the Databases view says what is attached to it
    entry.con === SQL_CONNECTION[] && (snapshot["shared"] = true)
    try
        snapshot["schemas"] = introspect(entry.con; opened = entry.opened)
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

Show `con`, a DBInterface connection to DuckDB, an ODBC data source, PostgreSQL or SQLite, in the Databases view, and
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
    # In the latest world: the query that changed tables may have loaded DuckDB, whose methods the caller's world
    # does not know yet.
    haskey(CONNECTIONS, id) && Base.invokelatest(write_snapshot, id, CONNECTIONS[id])
    return nothing
end

"""
    open_schema(id, schema)

Read the tables of `schema` of the connection shown as `id`, a database whose schemas the Databases view lists first,
and show them below the schema; they are read again on each refresh.
"""
function open_schema(id::AbstractString, schema::AbstractString)
    entry = CONNECTIONS[id]
    push!(entry.opened, schema)
    write_snapshot(id, entry)
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
    if entry.con === SQL_CONNECTION[]
        # The Shared Session is closed, and no longer served; the next query opens another
        unserve()
        SQL_CONNECTION[] = nothing
    end
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
    cols = first_rows(con, table, limit)
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
The first `limit` rows of `table`, a quoted and possibly schema-qualified name, as a column table. The databases
behind ODBC write a row limit each their own way (LIMIT, TOP, FETCH FIRST), so from ODBC the rows are read one at a
time, and those after the first `limit` are left unread.
"""
function first_rows(con, table::AbstractString, limit::Integer)
    DBInterface, Tables = loaded(DBINTERFACE), loaded(TABLES)
    engine(con) == "ODBC" || return Tables.columntable(DBInterface.execute(con, "SELECT * FROM $table LIMIT $limit"))
    cursor = DBInterface.execute(con, "SELECT * FROM $table"; iterate_rows = true)
    names = Tables.schema(cursor).names
    columns = [Any[] for _ in names]
    n = 0
    for row in Tables.rows(cursor)
        n >= limit && break
        foreach(j -> push!(columns[j], Tables.getcolumn(row, j)), eachindex(names))
        (n += 1) >= limit && break  # before the next row is fetched
    end
    return NamedTuple{Tuple(names)}(Tuple(columns))
end

"""
    browse(id, table; limit = 100_000, title = table)
    browse(con, table; limit = 100_000, title = table)

Open the first `limit` rows of `table`, a quoted and possibly schema-qualified name, in the Table
Viewer of the Julia extension, from the connection shown as `id` or from `con`.
"""
browse(id::AbstractString, table::AbstractString; limit::Integer = 100_000, title::AbstractString = table) = browse(CONNECTIONS[id].con, table; limit, title)
function browse(con, table::AbstractString; limit::Integer = 100_000, title::AbstractString = table)
    Tables = loaded(TABLES)
    rows = Tables.rowtable(first_rows(con, table, limit))
    Base.invokelatest(Main.VSCodeServer.vscodedisplay, rows, title)
    return nothing
end

"""Settings of every DuckDB database `connect` opens: extensions come with Pollis and are never downloaded."""
const DUCKDB_CONFIG = ["autoinstall_known_extensions" => "false", "autoload_known_extensions" => "false"]

"""The databases of Pollis, built in and of its activity, that `connect` attaches, read-only, under their own names."""
builtins() = filter(isfile, [DATASETS_DB, RSS_DB, JOURNALS_DB, REFERENCES_DB, BENCHMARKS_DB, DOCUMENTS_DB, COMPARISONS_DB])

"""
    connect(path = ":memory:"; name = "DuckDB", builtins = true, fts = true, show = true)

Open the DuckDB database `path` with the engine of Pollis and return it, ready for
`DBInterface.execute`. The built-in databases are attached read-only as `PollisDatasets`,
`PollisRSS`, `PollisJournals`, `PollisReferences`, `PollisBenchmarks` and `PollisDocuments`, and the fts extension, full-text search, is loaded. The connection is shown in the Databases
view as `name`. DuckDB never downloads extensions here: those that Pollis brings are all there is.

```julia
con = PollisDB.connect()
DBInterface.execute(con, "SELECT * FROM PollisDatasets.main.mroz LIMIT 5")
```
"""
function connect(path::AbstractString = ":memory:"; name::AbstractString = "DuckDB", builtins::Bool = true, fts::Bool = true, show::Bool = true)
    DuckDB = get(() -> Base.require(DUCKDB), Base.loaded_modules, DUCKDB)
    DBInterface = get(() -> Base.require(DBINTERFACE), Base.loaded_modules, DBINTERFACE)
    return Base.invokelatest() do
        db = DuckDB.DB(path; config = DUCKDB_CONFIG)
        if builtins
            for file in PollisDB.builtins()
                DBInterface.execute(db, "ATTACH IF NOT EXISTS '$(replace(file, "'" => "''"))' (READ_ONLY)")
            end
        end
        if fts && isfile(FTS)
            try
                DBInterface.execute(db, "LOAD '$(replace(FTS, "'" => "''"))'")
            catch err
                @warn "Pollis: could not load the fts extension of DuckDB" exception = err
            end
        end
        show && PollisDB.show(db; name)
        db
    end
end

"""
    fetch(con, query)

The result of `query` on `con` as a column table, a named tuple of vectors, with the decimal columns of PostgreSQL
(`numeric`, read as `Decimal`) made `Float64`, which DuckDB, Parquet and CSV take.

```julia
crsp = PollisDB.fetch(wrds, "SELECT permno, mthcaldt, mthret FROM crsp.msf_v2 LIMIT 10")
```
"""
function fetch(con, query::AbstractString)
    DBInterface, Tables = loaded(DBINTERFACE), loaded(TABLES)
    cols = Base.invokelatest(() -> Tables.columntable(DBInterface.execute(con, query)))
    function float(col)
        T = nonmissingtype(eltype(col))
        T === Union{} || !(T <: AbstractFloat) || T <: Union{Float64,Float32,Float16} ? col : [x === missing ? missing : Float64(x) for x in col]
    end
    return map(float, cols)
end

"""
    save(tbl, file; table = "data")

Write the column table `tbl` to `file`, by its extension: Parquet (`.parquet`), CSV (`.csv`), or a table named `table`
of a DuckDB database (`.duckdb`, made if missing, the table replaced if there), with the DuckDB engine of Pollis.
"""
function save(tbl, file::AbstractString; table::AbstractString = "data")
    DuckDB = get(() -> Base.require(DUCKDB), Base.loaded_modules, DUCKDB)
    DBInterface = loaded(DBINTERFACE)
    quoted(s) = "'" * replace(s, "'" => "''") * "'"
    extension = lowercase(splitext(file)[2])
    extension in (".parquet", ".csv", ".duckdb") || error("PollisDB: save writes .parquet, .csv or .duckdb files, not $file")
    mkpath(dirname(abspath(file)))
    duck = connect(; builtins = false, fts = false, show = false)
    try
        Base.invokelatest() do
            DuckDB.register_table(duck, tbl, "pollis_save")
            if extension == ".duckdb"
                DBInterface.execute(duck, "ATTACH $(quoted(file)) AS pollis_target")
                DBInterface.execute(duck, "CREATE OR REPLACE TABLE pollis_target.main.\"$(replace(table, "\"" => "\"\""))\" AS SELECT * FROM pollis_save")
                DBInterface.execute(duck, "DETACH pollis_target")
            else
                DBInterface.execute(duck, "COPY pollis_save TO $(quoted(file)) (FORMAT $(extension == ".parquet" ? "parquet" : "csv"))")
            end
        end
    finally
        DBInterface.close!(duck)
    end
    println("Wrote ", file, extension == ".duckdb" ? " (table $table)" : "", ": ", filesize(file), " bytes")
    return nothing
end

"""
    query_tables(query; tables...)

The result of `query`, as `fetch` gives it, in a DuckDB database in memory where each keyword is a table: a column
table, such as a named tuple of vectors, or the path of a Parquet (`.parquet`) or CSV (`.csv`) file.

```julia
merged = PollisDB.query_tables("SELECT * FROM a JOIN b USING (id)"; a = (id = [1, 2], x = [0.5, 0.7]), b = "b.parquet")
```
"""
function query_tables(query::AbstractString; tables...)
    DuckDB = get(() -> Base.require(DUCKDB), Base.loaded_modules, DUCKDB)
    DBInterface = loaded(DBINTERFACE)
    quoted(s) = "'" * replace(s, "'" => "''") * "'"
    duck = connect(; builtins = false, fts = false, show = false)
    try
        Base.invokelatest() do
            for (name, tbl) in tables
                if tbl isa AbstractString
                    extension = lowercase(splitext(tbl)[2])
                    extension in (".parquet", ".csv") || error("PollisDB: query_tables reads .parquet or .csv files, not $tbl")
                    reader = extension == ".parquet" ? "read_parquet" : "read_csv_auto"
                    DBInterface.execute(duck, "CREATE VIEW \"$name\" AS SELECT * FROM $reader($(quoted(tbl)))")
                else
                    DuckDB.register_table(duck, tbl, String(name))
                end
            end
        end
        return fetch(duck, query)
    finally
        DBInterface.close!(duck)
    end
end

"""The connection of the REPL, Shared Session in the Databases view: the `pollis>` mode, `sql` and `publish` share it."""
const SQL_CONNECTION = Ref{Any}(nothing)

"""Whether this Julia is the kernel of a notebook, whose connection the Databases view does not show."""
const NOTEBOOK = Ref(false)

"""Statements that change what the Databases view shows, and the rows a `Table` holds."""
const CHANGING = r"\b(create|drop|alter|attach|detach|insert|update|delete|copy|import)\b"i

"""How many queries of `sql` have changed tables: a `Table` reads its rows again when the count has moved since."""
const GENERATION = Ref(0)

"""The connection of the REPL, Shared Session, opened now if it is not yet, and served to the window's DuckDB."""
function sql_connection()
    return lock(SQL_LOCK) do
        if SQL_CONNECTION[] === nothing
            SQL_CONNECTION[] = connect(; show = false)
            # Shown once it is the Shared Session, so that its snapshot says so
            NOTEBOOK[] || show(SQL_CONNECTION[]; name = "Shared Session")
            NOTEBOOK[] || serve(SQL_CONNECTION[])
        end
        SQL_CONNECTION[]
    end
end

"""
One query at a time on the Shared Session, which the REPL and the Pollis REPL terminal, on another thread, both use;
reentrant, so that a query may run another, as `publish` runs `sql`.
"""
const SQL_LOCK = ReentrantLock()

"""The quack extension of DuckDB, its client and server, which Pollis ships with fts."""
const QUACK = joinpath(DUCKDB_HOME, "quack.duckdb_extension")
"""The httpfs extension of DuckDB, on which quack runs: loaded before it, as DuckDB would otherwise download it."""
const HTTPFS = joinpath(DUCKDB_HOME, "httpfs.duckdb_extension")

"""
Where the Shared Session's database is served: its address and token, in a file only the user can read, one for each
window, from which the duckdb> terminal and the DuckDB notebooks of the window attach it as `SharedSession`.
"""
const SERVED = joinpath(DUCKDB_HOME, "served", isempty(WINDOW) ? "julia.json" : "julia.$WINDOW.json")

"""The ports tried, in turn, for the Shared Session's database: quack's own, 9494, and the next ones."""
const QUACK_PORTS = 9494:9593

"""
Serve the database of `con`, the Shared Session, with quack on localhost, on the first free port of `QUACK_PORTS`, with
a token made now, and write both to `SERVED`. Without quack, or without a free port, the database is not served.
"""
function serve(con)
    isfile(QUACK) && isfile(HTTPFS) || return nothing
    DBInterface = loaded(DBINTERFACE)
    token = replace(string(uuid4()), "-" => "")
    try
        Base.invokelatest() do
            DBInterface.execute(con, "LOAD '$(replace(HTTPFS, "'" => "''"))'")
            DBInterface.execute(con, "LOAD '$(replace(QUACK, "'" => "''"))'")
            for port in QUACK_PORTS
                uri = "quack:localhost:$port"
                served = try
                    DBInterface.execute(con, "CALL quack_serve('$uri', token = '$token')")
                    true
                catch
                    false
                end
                served || continue
                write_private(SERVED, Dict{String,Any}("uri" => uri, "token" => token, "pid" => getpid()))
                return nothing
            end
            @debug "Pollis: no free port for the Shared Session's database" ports = QUACK_PORTS
        end
    catch err
        @debug "Pollis: the Shared Session's database is not served" exception = err
    end
    return nothing
end

"""The name under which a notebook's connection attaches the Shared Session of the window's REPL."""
const SHARED_DATABASE = "SharedSession"

"""
The way round the error of a query that reads a table of the attached Shared Session twice, a self-join say: quack
reads such a table only once in a query (duckdbPollis.ts, withHint, says the same in duckdb> and DuckDB SQL notebooks).
"""
const STREAMING_SCANS_HINT = "A table of $SHARED_DATABASE is read only once in a query. Name it once, WITH t AS MATERIALIZED (SELECT * FROM $SHARED_DATABASE.t) SELECT ... FROM t a JOIN t b ..., or copy it first, CREATE TEMP TABLE t AS SELECT * FROM $SHARED_DATABASE.t, then use t."

"""
The notebook's connection that last attached the Shared Session, or tried to, and the text of `SERVED` it read then,
`nothing` while there was none.
"""
const ATTACHED = Ref{Tuple{Any,Union{Nothing,String}}}((nothing, nothing))

"""
Keep `con`, the connection of a notebook, attached to the Shared Session that the window's REPL serves, as
`SharedSession`: attached again when `SERVED` changes, a new REPL say, and detached when it is gone. Should the attach
fail, a warning says why, once for each version of `SERVED`.
"""
function attach_session(con)
    text = try
        isfile(SERVED) ? read(SERVED, String) : nothing
    catch
        nothing
    end
    last_con, last_text = ATTACHED[]
    last_con === con && last_text == text && return nothing
    ATTACHED[] = (con, text)
    DBInterface = loaded(DBINTERFACE)
    quoted(s) = "'" * replace(s, "'" => "''") * "'"
    try
        Base.invokelatest() do
            DBInterface.execute(con, "DETACH DATABASE IF EXISTS $SHARED_DATABASE")
            (text === nothing || !isfile(QUACK) || !isfile(HTTPFS)) && return nothing
            uri = match(r"\"uri\":\"(?<uri>[^\"]*)\"", text)
            token = match(r"\"token\":\"(?<token>[^\"]*)\"", text)
            (uri === nothing || token === nothing) && error("$SERVED holds no address and token")
            DBInterface.execute(con, "LOAD $(quoted(HTTPFS))")
            DBInterface.execute(con, "LOAD $(quoted(QUACK))")
            DBInterface.execute(con, "ATTACH $(quoted(uri[:uri])) AS $SHARED_DATABASE (TOKEN $(quoted(token[:token])))")
        end
    catch err
        @warn "The Shared Session of the REPL could not be attached as $SHARED_DATABASE: $(sprint(showerror, err))"
    end
    return nothing
end

"""Write `values` to `path` as JSON, in a file only the user can read, whole or not at all."""
function write_private(path::AbstractString, values::AbstractDict)
    mkpath(dirname(path))
    temporary = "$path.$(getpid()).tmp"
    touch(temporary)
    chmod(temporary, 0o600)
    open(io -> json(io, values), temporary, "w")
    mv(temporary, path; force = true)
    return nothing
end

"""
Where the window's Pollis REPL terminal finds this Julia: the socket it connects to and the token it sends first, in
a file only the user can read, which goes when Julia exits.
"""
const TERMINAL = joinpath(dirname(SERVED), isempty(WINDOW) ? "pollis.json" : "pollis.$WINDOW.json")

"""The server of `serve_terminal`, while it listens."""
const TERMINAL_SERVER = Ref{Any}(nothing)

"""
The socket of the Pollis REPL terminal: a named pipe on Windows; elsewhere a file beside `TERMINAL`, only the user's,
or in the temporary folder when that path is too long for a socket.
"""
function terminal_socket()
    name = isempty(WINDOW) ? "pollis.$(getpid())" : "pollis.$WINDOW"
    Sys.iswindows() && return "\\\\.\\pipe\\$name"
    path = joinpath(dirname(TERMINAL), "$name.sock")
    return sizeof(path) < 100 ? path : joinpath(tempdir(), "$name.sock")
end

"""
Listen for the Pollis REPL terminal of the window, on `terminal_socket()`, and write `TERMINAL`. Each terminal that
connects, with the token, is served by `serve_client`, on threads of their own, so that it answers while the REPL
runs Julia code.
"""
function serve_terminal()
    TERMINAL_SERVER[] === nothing || return nothing
    try
        path = terminal_socket()
        Sys.iswindows() || rm(path; force = true)
        mkpath(dirname(TERMINAL))
        server = Sockets.listen(path)
        Sys.iswindows() || chmod(path, 0o600)
        TERMINAL_SERVER[] = server
        token = replace(string(uuid4()), "-" => "")
        write_private(TERMINAL, Dict{String,Any}("socket" => path, "token" => token, "pid" => getpid()))
        Threads.@spawn while isopen(server)
            client = try
                Sockets.accept(server)
            catch
                break
            end
            Threads.@spawn serve_client(client, token)
        end
    catch err
        @debug "Pollis: the Pollis REPL terminal cannot reach this Julia" exception = err
    end
    return nothing
end

"""Stop listening for the Pollis REPL terminal, and remove `TERMINAL` and the socket, if this Julia made them."""
function unserve_terminal()
    server = TERMINAL_SERVER[]
    server === nothing && return nothing
    TERMINAL_SERVER[] = nothing
    try
        close(server)
        isfile(TERMINAL) && occursin("\"pid\":$(getpid())", read(TERMINAL, String)) && rm(TERMINAL; force = true)
        Sys.iswindows() || rm(terminal_socket(); force = true)
    catch
    end
    return nothing
end

"""
Serve a Pollis REPL terminal on `io`, which sends `token` first. Requests are lines, with the text they carry after
them: `query <width> <bytes>` runs a query as the pollis> mode does, `complete <bytes>` asks whether a query ends,
`browse <bytes>` opens a table of the Shared Session in the Table Viewer, `attached` asks what the window's DuckDB
clients have attached to it (`attached`), and `interrupt` stops the query running.
Answers are `<kind> <bytes>` and their text: `ready`, once the Shared Session is open; `ok` or `error`, with the
result drawn in `width` characters or the error; `complete` or `incomplete`.
"""
function serve_client(io, token::AbstractString)
    running = Ref{Any}(nothing)
    writing = ReentrantLock()
    reply(kind, text = "") = lock(writing) do
        data = codeunits(text)
        write(io, "$kind $(length(data))\n")
        write(io, data)
        flush(io)
    end
    try
        readline(io) == "token $token" || return nothing
        sql_connection()
        reply("ready")
        while isopen(io) && !eof(io)
            header = split(readline(io))
            isempty(header) && continue
            if header[1] == "interrupt"
                interrupt_terminal(running[])
            elseif header[1] == "complete" && length(header) == 2
                reply(complete(String(read(io, parse(Int, header[2])))) ? "complete" : "incomplete")
            elseif header[1] == "query" && length(header) == 3
                width = parse(Int, header[2])
                query = String(read(io, parse(Int, header[3])))
                # In the latest world, which knows DuckDB, loaded after this task began: its errors' showerror too
                running[] = Threads.@spawn reply(Base.invokelatest(terminal_query, query, width)...)
            elseif header[1] == "browse" && length(header) == 2
                name = String(read(io, parse(Int, header[2])))
                Threads.@spawn reply(Base.invokelatest(terminal_browse, name)...)
            elseif header[1] == "attached"
                Threads.@spawn reply(Base.invokelatest(attached)...)
            end
        end
    catch err
        @debug "Pollis: a Pollis REPL terminal was served until an error" exception = err
    finally
        close(io)
    end
    return nothing
end

"""
Run `query` for the Pollis REPL terminal, as the pollis> mode runs it, and log it in the History of the Databases view
without its `name :=`; return `("ok", the result drawn in width characters)` or `("error", the error)`.
"""
function terminal_query(query::AbstractString, width::Integer)
    begun = now(UTC)
    started = time()
    logged = String[]
    for statement in statements(query)
        m = match(ASSIGNMENT, statement)
        push!(logged, strip(m === nothing ? statement : string(m[:lead], m[:query])))
    end
    result = nothing
    failure = nothing
    try
        result = Base.invokelatest(pollis_mode, query)
    catch err
        failure = error_text(err)
    end
    rows = result isa Result ? nrows(result.columns) : nothing
    log_cell(join(logged, ";\n") * ";", begun, time() - started, rows, failure, ""; source = "pollis")
    failure === nothing || return ("error", failure)
    try
        context = (:displaysize => (40, max(width, 20)), :color => true)
        return ("ok", sprint(io -> Base.show(IOContext(io, context...), MIME"text/plain"(), kept(result))))
    catch err
        return ("error", error_text(err))
    end
end

"""
What is attached to the Shared Session through the quack extension, for its hover in the Databases view: `("ok", json)`
with one entry for each client attached, the duckdb> terminal or a notebook, `query`, its last query, `running`, and
`seconds` since it began; or `("error", the error)`. Read on a connection of its own, so that it never waits for a
query of the REPL.
"""
function attached()
    con = SQL_CONNECTION[]
    con === nothing && return ("ok", "[]")
    DBInterface, Tables = loaded(DBINTERFACE), loaded(TABLES)
    try
        rows = Base.invokelatest() do
            own = DBInterface.connect(con)
            try
                Tables.columntable(DBInterface.execute(own, "SELECT query, state, query_started_at FROM quack_active_connections()"))
            finally
                DBInterface.close!(own)
            end
        end
        clients = [Dict{String,Any}("query" => coalesce(q, ""), "running" => isequal(s, "active"),
            "seconds" => started isa DateTime ? max(0, round(Int, (now() - started).value / 1000)) : 0)
            for (q, s, started) in zip(rows.query, rows.state, rows.query_started_at)]
        return ("ok", sprint(json, clients))
    catch err
        return ("error", error_text(err))
    end
end

"""Open the table `name` of the Shared Session in the Table Viewer, for the link under a table that `name :=` keeps."""
function terminal_browse(name::AbstractString)
    try
        lock(() -> browse(sql_connection(), identifier(name); title = name), SQL_LOCK)
        return ("ok", "")
    catch err
        return ("error", error_text(err))
    end
end

"""What went wrong, as the terminal says it."""
error_text(err) = sprint(showerror, err)

"""
Stop `task`, the query of a Pollis REPL terminal, with DuckDB's interrupt, while it holds the Shared Session: an
interrupt stops whatever the connection runs, so not a query of the REPL that the terminal's query waits for.
"""
function interrupt_terminal(task)
    (task === nothing || istaskdone(task)) && return nothing
    con = SQL_CONNECTION[]
    con === nothing && return nothing
    owner = try
        getfield(SQL_LOCK, :locked_by)
    catch
        nothing
    end
    owner === task || return nothing
    DuckDB = loaded(DUCKDB)
    handle = con isa DuckDB.DB ? con.main_connection.handle : con.handle
    Base.invokelatest(DuckDB.duckdb_interrupt, handle)
    return nothing
end

"""Remove `SERVED`, if this Julia wrote it: the Shared Session's database is no longer served."""
function unserve()
    try
        isfile(SERVED) && occursin("\"pid\":$(getpid())", read(SERVED, String)) && rm(SERVED; force = true)
    catch
    end
    return nothing
end

"""
    sql(query; con = <Shared Session>)

Run `query`, one or more statements separated by `;`, and return the result of the last one as a
`Result`, a Tables.jl table. Without `con`, this is what the `pollis>` mode of the REPL runs (type `>` at
the start of a line to enter it); the connection is an in-memory DuckDB from `connect`, opened at the
first query.
"""
function sql(query::AbstractString; con = nothing)
    if con === nothing
        con = sql_connection()
        # In a notebook, the REPL's tables are read and written as SharedSession.name.
        NOTEBOOK[] && attach_session(con)
    end
    DBInterface, Tables = loaded(DBINTERFACE), loaded(TABLES)
    DuckDB = get(() -> Base.require(DUCKDB), Base.loaded_modules, DUCKDB)
    tables_interface(Tables)
    started = time()
    run() = Base.invokelatest() do
        result = nothing
        # DBInterface.execute runs one statement at a time; a PRAGMA such as create_fts_index runs several, which
        # only DuckDB.query can.
        for statement in statements(query)
            pragma = occursin(r"^\s*pragma\b"i, statement) && (con isa DuckDB.DB || con isa DuckDB.Connection)
            result = pragma ? DuckDB.query(con, statement) : DBInterface.execute(con, statement)
        end
        result === nothing ? NamedTuple() : Tables.columntable(result)
    end
    columns = lock(run, SQL_LOCK)
    # Statements such as CREATE TABLE change what the Databases view shows, and the rows of tables.
    if occursin(CHANGING, query)
        GENERATION[] += 1
        refresh()
    end
    return Result(columns, time() - started)
end

"""
    sql(name, query; con = <Shared Session>)

Run `query`, one statement, into the table `name` of the connection's database in memory, made again if it is there,
and return it as a `Table`: Julia reads it as a Tables.jl table, and SQL takes it by its name, in an interpolation too.
In an SQL cell of a Julia notebook, `feeds := SELECT * FROM PollisRSS.feeds` does the same. The table is an ordinary
one, not a temporary one, so that whatever reads the connection's tables sees it, the Databases view among them; it
goes with the connection, as the database in memory does.

```julia
feeds = sql("feeds", "SELECT * FROM PollisRSS.feeds")
length(feeds), feeds.title
sql("SELECT count(*) FROM \$feeds")
```
"""
function sql(name::AbstractString, query::AbstractString; con = nothing)
    found = statements(query)
    length(found) == 1 || error("PollisDB: a table is made from one statement, and the query of $name has $(length(found))")
    sql("CREATE OR REPLACE TABLE $(identifier(name)) AS $(only(found))"; con)
    return Table(name, con === nothing ? SQL_CONNECTION[] : con)
end

"""`name` quoted as an SQL identifier."""
identifier(name::AbstractString) = "\"" * replace(name, "\"" => "\"\"") * "\""

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

"""Whether `query` is blank or ends with a semicolon outside quotes and comments: the `pollis>` mode runs it then."""
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
        $Tables.istable(::Type{Table}) = true
        $Tables.columnaccess(::Type{Table}) = true
        $Tables.columns(t::Table) = table_columns(t)
    end
    TABLES_INTERFACE[] = true
    return nothing
end

"""The rows of a `Result` that the REPL shows: the first and the last, when there are more."""
const SHOWN_ROWS = 40

"""
What a table shows: the names and types of its columns, the text of its first rows and of its last, with a gap
between them when there are more than `SHOWN_ROWS`, its number of rows, and the line under it in a notebook.
"""
struct Grid
    names::Vector{String}
    types::Vector{String}
    numeric::Vector{Bool}
    first::Vector{Vector{String}}
    last::Vector{Vector{String}}
    count::Int
    note::String
end

cell_text(x) = x === missing ? "NULL" : replace(string(x), r"\s" => " ")
rows_text(n::Integer) = n == 1 ? "1 row" : "$n rows"
seconds_text(seconds::Real) = string(round(seconds; digits = 3), " s")

"""The rows `range` of the column table `columns`, each as the text of its values."""
row_texts(columns::NamedTuple, range) = [[cell_text(col[i]) for col in values(columns)] for i in range]

"""
The grid of `columns`, a column table of `count` rows when `tail` is `nothing`; otherwise `columns` holds the first
rows and `tail` the last. `parts` come before the number of rows in the note, `after` after it.
"""
function grid(columns::NamedTuple, tail, count::Integer; parts = String[], after = String[])
    types = [nonmissingtype(eltype(col)) for col in values(columns)]
    if tail === nothing
        head = count <= SHOWN_ROWS ? (1:count) : (1:SHOWN_ROWS÷2)
        first_rows = row_texts(columns, head)
        last_rows = count <= SHOWN_ROWS ? Vector{String}[] : row_texts(columns, count-SHOWN_ROWS÷2+1:count)
    else
        first_rows = row_texts(columns, 1:length(Base.first(columns)))
        last_rows = row_texts(tail, 1:length(Base.first(tail)))
    end
    shown = length(first_rows) + length(last_rows)
    rows = shown < count ? "$(rows_text(count)), the first $(length(first_rows)) and the last $(length(last_rows)) shown" : rows_text(count)
    return Grid(collect(string.(keys(columns))), [T === Union{} ? "Missing" : string(T) for T in types],
        [T <: Real && !(T <: Bool) for T in types], first_rows, last_rows, count, join([parts; rows; after], " · "))
end

"""
`grid` drawn in a box, with `footer` under it, as the REPL shows a table: the columns that fit in the width of `io`,
the others named after `footer`.
"""
function draw(io::IO, g::Grid, footer::AbstractString)
    rows = [g.first; g.last]
    width(j) = min(40, maximum(r -> textwidth(r[j]), rows; init = textwidth(g.names[j])))
    # A column takes its width and three more, "│ " before it and " " after it; the box ends with "│".
    available = displaysize(io)[2] - 1
    shown = 0
    used = 0
    for j in eachindex(g.names)
        used += width(j) + 3
        used > available && j > 1 && break
        shown = j
    end
    columns = 1:shown
    widths = [min(width(j), max(1, available - 3)) for j in columns]
    fit(s, w) = textwidth(s) > w ? Base.first(s, max(0, w - 1)) * "…" : rpad(s, w)
    line(l, m, r) = string(l, join((repeat('─', w + 2) for w in widths), m), r)
    row(values) = string("│ ", join((fit(values[j], widths[k]) for (k, j) in enumerate(columns)), " │ "), " │")
    println(io, line('┌', '┬', '┐'))
    println(io, row(g.names))
    println(io, line('├', '┼', '┤'))
    foreach(r -> println(io, row(r)), g.first)
    isempty(g.last) || println(io, row(fill("⋮", length(g.names))))
    foreach(r -> println(io, row(r)), g.last)
    println(io, line('└', '┴', '┘'))
    print(io, footer)
    hidden = g.names[shown+1:end]
    isempty(hidden) || print(io, "\n", length(hidden) == 1 ? "1 more column: " : "$(length(hidden)) more columns: ", join(hidden, ", "))
    return nothing
end

"""The style of a table in a notebook, that of the DuckDB SQL (Pollis) kernel, in the colours of the theme."""
const TABLE_STYLE = """<style>
.pollis-duckdb { font-family: var(--vscode-editor-font-family, monospace); font-size: 12px; }
.pollis-duckdb .scroll { overflow-x: auto; max-width: 100%; }
.pollis-duckdb table { border-collapse: collapse; }
.pollis-duckdb th { text-align: left; font-weight: 600; padding: 3px 10px; border-bottom: 1px solid var(--vscode-editorWidget-border, #8884); white-space: nowrap; vertical-align: bottom; }
.pollis-duckdb th .type { display: block; font-weight: 400; font-size: 11px; opacity: 0.6; }
.pollis-duckdb td { text-align: left; padding: 2px 10px; border-bottom: 1px solid var(--vscode-editorWidget-border, #8882); white-space: nowrap; max-width: 40em; overflow: hidden; text-overflow: ellipsis; }
.pollis-duckdb td.number { text-align: right; }
.pollis-duckdb td.null, .pollis-duckdb tr.gap td { opacity: 0.5; }
.pollis-duckdb tr.gap td { text-align: center; }
.pollis-duckdb .note { margin-top: 4px; opacity: 0.7; }
</style>"""

html_escape(s::AbstractString) = replace(s, '&' => "&amp;", '<' => "&lt;", '>' => "&gt;", '"' => "&quot;")

"""`grid` as an HTML table, each column's type under its name, and its note under it."""
function html(io::IO, g::Grid)
    print(io, "<div class=\"pollis-duckdb\">", TABLE_STYLE, "<div class=\"scroll\"><table><thead><tr>")
    for (name, type) in zip(g.names, g.types)
        print(io, "<th>", html_escape(name), "<span class=\"type\">", html_escape(type), "</span></th>")
    end
    print(io, "</tr></thead><tbody>")
    function row(values)
        print(io, "<tr>")
        for (j, value) in enumerate(values)
            print(io, "<td class=\"", value == "NULL" ? "null" : g.numeric[j] ? "number" : "", "\">", html_escape(value), "</td>")
        end
        print(io, "</tr>")
    end
    foreach(row, g.first)
    isempty(g.last) || print(io, "<tr class=\"gap\">", repeat("<td>&#8942;</td>", length(g.names)), "</tr>")
    foreach(row, g.last)
    print(io, "</tbody></table></div><div class=\"note\">", html_escape(g.note), "</div></div>")
    return nothing
end

nrows(columns::NamedTuple) = isempty(columns) ? 0 : length(Base.first(columns))

function Base.show(io::IO, ::MIME"text/plain", r::Result)
    timing = seconds_text(r.seconds)
    isempty(r.columns) && return print(io, "(", timing, ")")
    n = nrows(r.columns)
    return draw(io, grid(r.columns, nothing, n), string("(", rows_text(n), ", ", timing, ")"))
end

function Base.show(io::IO, ::MIME"text/html", r::Result)
    timing = seconds_text(r.seconds)
    isempty(r.columns) && return print(io, "<div class=\"pollis-duckdb\">", TABLE_STYLE, "<div class=\"note\">", timing, "</div></div>")
    return html(io, grid(r.columns, nothing, nrows(r.columns); after = [timing]))
end

"""
    Table

A table of DuckDB held by its name and its connection: what `sql(name, query)` returns, and what `name := query` in an
SQL cell of a Julia notebook binds `name` to. Julia reads it as a Tables.jl table, `table.column` being a column and
`length(table)` its number of rows; its rows are read at their first use and again after a query that changes tables.
Printed, it is its quoted name, so that `sql("SELECT * FROM \$table")` composes. Should the table be gone, dropped or
closed with its connection, using it says to run again the cell that made it.
"""
mutable struct Table
    const name::String
    const con::Any
    columns::Union{Nothing,NamedTuple}
    generation::Int
end
Table(name::AbstractString, con) = Table(String(name), con, nothing, -1)

"""Run `query` on the connection of `table`; should it fail because the table is gone, say to make it again."""
function query_table(table::Table, query::AbstractString)
    DBInterface, Tables = loaded(DBINTERFACE), loaded(TABLES)
    con = getfield(table, :con)
    name = getfield(table, :name)
    try
        return lock(() -> Base.invokelatest(() -> Tables.columntable(DBInterface.execute(con, query))), SQL_LOCK)
    catch
        there = try
            literal = replace(name, "'" => "''")
            found = Base.invokelatest(() -> Tables.columntable(DBInterface.execute(con, "SELECT count(*) AS n FROM information_schema.tables WHERE table_name = '$literal'")))
            Base.first(found.n) > 0
        catch
            false
        end
        there && rethrow()
        error("PollisDB: the table $name is gone, dropped or closed with its connection; run again the cell that made it")
    end
end

"""The columns of `table` if they are read and no query has changed tables since, or `nothing`."""
function cached(table::Table)
    columns = getfield(table, :columns)
    return columns !== nothing && getfield(table, :generation) == GENERATION[] ? columns : nothing
end

"""The columns of `table`, a column table, read once and again after a query that changes tables."""
function table_columns(table::Table)
    columns = cached(table)
    columns === nothing || return columns
    generation = GENERATION[]
    columns = query_table(table, "SELECT * FROM $table")
    setfield!(table, :columns, columns)
    setfield!(table, :generation, generation)
    return columns
end

"""The number of rows of `table`: of the rows read, or counted by DuckDB."""
function Base.length(table::Table)
    columns = cached(table)
    columns === nothing || return nrows(columns)
    return Int(Base.first(query_table(table, "SELECT count(*) AS n FROM $table").n))
end

Base.getproperty(table::Table, name::Symbol) = getproperty(table_columns(table), name)
Base.propertynames(table::Table, private::Bool = false) = keys(table_columns(table))
Base.print(io::IO, table::Table) = print(io, identifier(getfield(table, :name)))
Base.show(io::IO, table::Table) = print(io, "PollisDB.Table(", repr(getfield(table, :name)), ")")

"""The grid of `table`, which reads only the rows it shows unless they are read already."""
function grid(table::Table)
    name = getfield(table, :name)
    columns = cached(table)
    columns === nothing || return grid(columns, nothing, nrows(columns); parts = [name])
    n = length(table)
    n <= SHOWN_ROWS && return grid(query_table(table, "SELECT * FROM $table"), nothing, n; parts = [name])
    head = query_table(table, "SELECT * FROM $table LIMIT $(SHOWN_ROWS ÷ 2)")
    tail = query_table(table, "SELECT * FROM $table OFFSET $(n - SHOWN_ROWS ÷ 2)")
    return grid(head, tail, n; parts = [name])
end

function Base.show(io::IO, ::MIME"text/plain", table::Table)
    g = grid(table)
    return draw(io, g, string("(", getfield(table, :name), ", ", rows_text(g.count), ")"))
end

Base.show(io::IO, ::MIME"text/html", table::Table) = html(io, grid(table))

"""
A table that `name :=` keeps, as the pollis> mode and the Pollis REPL terminal show it: its name and size, and the
link by which the terminal opens it in the Table Viewer, there to browse all of it.
"""
struct Kept
    table::Table
end

"""What the pollis> mode shows of `result`: a table that `name :=` keeps summed up, any other result as it is."""
kept(result) = result isa Table ? Kept(result) : result

function Base.show(io::IO, ::MIME"text/plain", kept::Kept)
    table = kept.table
    name = getfield(table, :name)
    n = length(keys(query_table(table, "SELECT * FROM $table LIMIT 0")))
    color = get(io, :color, false)
    # The name in the terminal's yellow, Pollis' yellow (terminalColorRegistry.ts); the link blue and underlined, as a
    # link is: the terminal opens it with one click (TerminalLink, oneClick)
    shown = color ? "\e[33m$name\e[39m" : name
    link = color ? "\e[4;34mOpen in Table Viewer\e[24;39m" : "Open in Table Viewer"
    print(io, "Table ", shown, ", in the Shared Session and in Julia: ", rows_text(length(table)), ", ", n == 1 ? "1 column" : "$n columns")
    print(io, "\nBrowse ", shown, ": ", link)
    return nothing
end

"""`name :=` at the start of a statement, after blanks and comments: the statement makes the table `name`."""
const ASSIGNMENT = r"^(?<lead>(?:\s|--[^\n]*(?:\n|$)|/\*.*?\*/)*)(?<name>[A-Za-z_][A-Za-z0-9_]*)\s*:=(?<query>.*)$"s

"""The log of the duckdb> terminal and of the notebooks, which the History of the Databases view reads."""
const QUERY_LOG = joinpath(DUCKDB_HOME, "query_log.jsonl")

"""Add to `QUERY_LOG` the queries of an SQL cell of the notebook `file`, begun at `begun`."""
function log_cell(query::AbstractString, begun, seconds::Real, rows, failure, file::AbstractString; source::AbstractString = "notebook")
    line = Dict{String,Any}("sql" => query, "time" => string(begun) * "Z", "ms" => round(Int, 1000 * seconds), "source" => source)
    rows === nothing || (line["rows"] = rows)
    failure === nothing || (line["error"] = failure)
    isempty(file) || (line["database"] = file)
    try
        mkpath(DUCKDB_HOME)
        open(io -> (json(io, line); println(io)), QUERY_LOG; append = true)
    catch err
        @debug "Pollis: the query of an SQL cell was not logged" exception = err
    end
    return nothing
end

"""
    cell(code; file = "")

Run `code`, an SQL cell of a Julia notebook, on the connection of `sql`: each statement in turn, its table shown under
the cell. A statement that starts with `name :=`, such as `feeds := SELECT * FROM PollisRSS.feeds`, makes the
table `feeds`, as `sql("feeds", query)` does, and binds the Julia variable `feeds` to it, a `Table`. While the
window's Julia REPL runs, its Shared Session is attached as `SharedSession`: `SELECT * FROM SharedSession.stock_returns`
reads a table made in the REPL, and `CREATE TABLE SharedSession.results AS ...` makes one there. The cell's
statements, without their `name :=`, are logged in the History of the Databases view, with the notebook `file`.
"""
function cell(code::AbstractString; file::AbstractString = "")
    begun = now(UTC)
    started = time()
    logged = String[]
    rows = nothing
    try
        for statement in statements(code)
            m = match(ASSIGNMENT, statement)
            if m === nothing
                push!(logged, strip(statement))
                result = sql(statement)
                isempty(result.columns) && continue
                rows = nrows(result.columns)
                Base.invokelatest(display, result)
            else
                push!(logged, strip(string(m[:lead], m[:query])))
                table = sql(m[:name], m[:query])
                Core.eval(Main, Expr(:global, Expr(:(=), Symbol(m[:name]), table)))
                rows = length(table)
                Base.invokelatest(display, table)
            end
        end
    catch err
        message = sprint(showerror, err)
        log_cell(join(logged, ";\n") * ";", begun, time() - started, rows, message, file)
        occursin("Multiple streaming scans", message) && error(message, "\n", STREAMING_SCANS_HINT)
        rethrow()
    end
    log_cell(join(logged, ";\n") * ";", begun, time() - started, rows, nothing, file)
    return nothing
end

"""The name under which `publish` hands a Julia table to DuckDB, while it copies it."""
const INCOMING = "pollis_incoming"

"""
    publish(table, name; con = <Shared Session>)

Copy `table`, a Tables.jl table such as a named tuple of vectors, into the table `name` of DuckDB, made again if it is
there, and return `table`. SQL then takes it by its name, while Julia keeps `table` as it is: a change to it reaches
DuckDB when it is published again. `@share stock_returns = table` does the same and binds `stock_returns` to `table`.

```julia
@share stock_returns = (ticker = ["AAPL", "MSFT"], returns = [0.12, 0.08])
sql("SELECT avg(returns) FROM stock_returns")
```
"""
function publish(table, name::AbstractString; con = nothing)
    con === nothing && (con = sql_connection())
    if table isa Table && getfield(table, :con) === con
        # A table of DuckDB already: copied there, without reading its rows into Julia
        getfield(table, :name) == name || sql(name, "SELECT * FROM $table"; con)
        return table
    end
    DuckDB = get(() -> Base.require(DUCKDB), Base.loaded_modules, DUCKDB)
    Tables = loaded(TABLES)
    Base.invokelatest(Tables.istable, table) ||
        error("PollisDB: DuckDB takes tables, such as a named tuple of vectors, and $name is a $(typeof(table)); bind other values with `=`")
    lock(SQL_LOCK) do
        Base.invokelatest(DuckDB.register_table, con, table, INCOMING)
        try
            sql(name, "SELECT * FROM $(identifier(INCOMING))"; con)
        finally
            Base.invokelatest(DuckDB.unregister_table, con, INCOMING)
        end
    end
    # The copy refreshed the Databases view while INCOMING was there; once more, without it
    refresh()
    return table
end

"""
    @share name = table
    @share name

Copy `table`, a Tables.jl table such as a named tuple of vectors, into the table `name` of the Shared Session, and
bind the Julia variable `name` to it, as `name = publish(table, "name")` does; `@share name` copies again the table
that `name` holds, after a change to it. SQL then takes it by its name: the `pollis>` mode, the Pollis REPL terminal,
`sql`, and the duckdb> terminal and the notebooks of the window as `SharedSession.name`.

```julia
@share stock_returns = (ticker = ["AAPL", "MSFT"], returns = [0.12, 0.08])
sql("SELECT avg(returns) FROM stock_returns")
```
"""
macro share(ex)
    if ex isa Symbol
        return :($publish($(esc(ex)), $(string(ex))))
    elseif Meta.isexpr(ex, :(=), 2) && ex.args[1] isa Symbol
        name = ex.args[1]
        return :($(esc(name)) = $publish($(esc(ex.args[2])), $(string(name))))
    end
    throw(ArgumentError("@share takes `name = table` or `name`, such as `@share stock_returns = (ticker = [\"AAPL\"], returns = [0.12])`"))
end

"""
    pollis_mode(query)

What the `pollis>` mode runs: `query`, one or more statements, as `sql` does, where a statement that starts with
`name :=`, such as `feeds := SELECT * FROM PollisRSS.feeds`, makes the table `name`, as `sql(name, query)` does, and
binds the Julia variable `name` to it, as in an SQL cell of a Julia notebook. The result is that of the last statement.
"""
function pollis_mode(query::AbstractString)
    found = statements(query)
    any(statement -> match(ASSIGNMENT, statement) !== nothing, found) || return sql(query)
    result = nothing
    for statement in found
        m = match(ASSIGNMENT, statement)
        if m === nothing
            result = sql(statement)
        else
            result = sql(m[:name], m[:query])
            Core.eval(Main, Expr(:global, Expr(:(=), Symbol(m[:name]), result)))
        end
    end
    return result
end

"""
Add the `pollis>` mode to the REPL: `>` at the start of a line enters it, backspace on an empty line
leaves it. A query ends with `;`; until then, Enter starts a new line. The result is shown as a table
and is `ans` afterwards; a table that `name :=` keeps is summed up, with a link that opens it in the Table Viewer. In the history of the REPL, the mode is named `sql`, the name its queries are recorded
under there.
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
    any(m -> m isa LineEdit.Prompt && m.prompt == "pollis> ", repl.interface.modes) && return nothing
    mode = LineEdit.Prompt("pollis> ";
        # The colour of julia>, bold green, as duckdb> is: a terminal's colours do not follow the theme as Pollis' yellow does.
        prompt_prefix = repl.options.hascolor ? repl.prompt_color : "",
        prompt_suffix = "",
        sticky = true,
        on_enter = s -> complete(String(take!(copy(LineEdit.buffer(s))))))
    mode.repl = repl
    hp = main.hist
    hp.mode_mapping[:sql] = mode
    mode.hist = hp
    mode.on_done = REPL.respond(repl, mode; suppress_on_semicolon = false) do line
        :($kept($pollis_mode($line)))
    end
    _, prefix_keymap = LineEdit.setup_prefix_keymap(hp, mode)
    keymaps = Dict{Any,Any}[REPL.mode_keymap(main), prefix_keymap, LineEdit.history_keymap, LineEdit.default_keymap, LineEdit.escape_defaults]
    isdefined(REPL, :History) || pushfirst!(keymaps, last(LineEdit.setup_search_keymap(hp)))
    mode.keymap_dict = LineEdit.keymap(keymaps)
    push!(repl.interface.modes, mode)
    enter = Dict{Any,Any}('>' => function (s, args...)
        if isempty(s) || position(LineEdit.buffer(s)) == 0
            # The text of julia> goes to pollis>; from an empty julia>, pollis> keeps what was typed there.
            buf = copy(LineEdit.buffer(s))
            return LineEdit.transition(s, mode) do
                buf.size > 0 && (LineEdit.state(s, mode).input_buffer = buf)
            end
        end
        LineEdit.edit_insert(s, '>')
        isdefined(LineEdit, :check_show_hint) && LineEdit.check_show_hint(s)
        return nothing
    end)
    main.keymap_dict = LineEdit.keymap_merge(main.keymap_dict, enter)
    # The code Pollis sends follows TO_JULIA, which takes every other mode to julia>, whose paste runs it; what is
    # typed in that mode stays there. julia> binds it too, to nothing, so that none of its keys reach the line.
    to_julia = Dict{Any,Any}(TO_JULIA => function (s, args...)
        LineEdit.mode(s) === main && return nothing
        return LineEdit.transition(s, main)
    end)
    for other in repl.interface.modes
        other isa LineEdit.Prompt && (other.keymap_dict = LineEdit.keymap_merge(other.keymap_dict, to_julia))
    end
    # The Pollis REPL terminal reaches this Julia through a socket of its own.
    serve_terminal()
    return nothing
end

"""
The keys that come before the code Pollis sends to the REPL, `ESC [ 6 9 ~`, which `sql_mode` binds in every mode:
to going to julia>, and in julia> to nothing. A Julia that does not bind them ignores them, as all keys `ESC [ 6`
and two more.
"""
const TO_JULIA = "\e[69~"

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

"""
The installed PollisBenchmarks.jl: its folder, its catalogue, `data/catalogue.toml`, and the folder of its artifact
`benchmarks`, the questions of the benchmarks built in; `nothing` when it is not installed or has no artifact.
"""
function benchmarks_source()
    path = Base.locate_package(BENCHMARKS)
    path === nothing && return nothing
    root = dirname(dirname(path))
    toml = joinpath(root, "Artifacts.toml")
    catalogue = joinpath(root, "data", "catalogue.toml")
    (isfile(toml) && isfile(catalogue)) || return nothing
    Artifacts = Base.require(Base.PkgId(UUID("56f22d72-fd6d-98f1-02f0-08ddc0907c33"), "Artifacts"))
    hash = Base.invokelatest(Artifacts.artifact_hash, "benchmarks", toml)
    hash === nothing && return nothing
    folder = Base.invokelatest(Artifacts.artifact_path, hash)
    return isdir(folder) ? (; root, folder, catalogue) : nothing
end

"""The columns of the table `catalogue` of PollisBenchmarks: the fields of `data/catalogue.toml`, with their type and description."""
const BENCHMARKS_CATALOGUE = [
    ("id", "VARCHAR", "The id of the benchmark in PollisBenchmarks.jl, and the name of the table of its questions in this database, for a benchmark Built In"),
    ("benchmark", "VARCHAR", "Its name"),
    ("component", "VARCHAR", "What it measures, such as Closed Book Answering, the answers of a chat model from what it learned in training alone, or Embedding, the documents an embedding model finds"),
    ("domain", "VARCHAR", "What its questions are about"),
    ("layout", "VARCHAR", "questions, questions and their answers, or retrieval, queries and the documents they search"),
    ("availability", "VARCHAR", "Built In, its questions in a table of this database, or Download, not in this database, by its licence or its size, and fetched from its source by a page that runs it"),
    ("questions", "INTEGER", "The number of its questions, for a benchmark Built In the rows of its table whose split is test; empty where it is not confirmed"),
    ("documents", "INTEGER", "The number of its documents, for a benchmark that searches documents"),
    ("size_mb", "DOUBLE", "The size of its questions in MB: for a benchmark Built In, its Parquet files in PollisBenchmarks.jl; for one to Download, the files of its source that hold them, as fetched; empty where it is not confirmed"),
    ("released", "VARCHAR", "The month it was published, YYYY-MM, or the year"),
    ("licence", "VARCHAR", "The licence of its questions, as its source states it"),
    ("licence_url", "VARCHAR", "Where its source states its licence"),
    ("source", "VARCHAR[]", "Where its questions come from: each of its sources"),
    ("revision", "VARCHAR[]", "The revision of each of its sources, in the same order, fixed so that its questions never change"),
    ("grading", "VARCHAR", "How an answer is graded"),
    ("page", "VARCHAR", "The page of Pollis that runs it, when there is one"),
    ("reference", "VARCHAR", "The key of the work that published it, in the references of Pollis (PollisReferences)"),
]

"""The columns of the tables of PollisBenchmarks of layout questions, with their descriptions."""
const BENCHMARKS_QUESTION_COLUMNS = [
    ("id", "The id of the question in its benchmark, unique within its split"),
    ("split", "test, a question of the benchmark, or example, a solved question that a prompt with examples can show before it"),
    ("stratum", "The group of the question that a stratified sample draws from, such as the subject; empty for a benchmark without strata"),
    ("question", "The question, as the model is asked it"),
    ("choices", "The options of the question, in order, the first one A; empty for a question without options"),
    ("answer", "The right answer: the letter of the right option, the number or the words"),
    ("worked", "The worked answer of the source, which a prompt with examples shows; empty when the source has none"),
]

"""The columns of the tables of PollisBenchmarks of layout retrieval, with their descriptions."""
const BENCHMARKS_RETRIEVAL_COLUMNS = [
    ("id", "The id of the query, or of the document, in its benchmark"),
    ("split", "test, a query of the benchmark, or document, a document that the queries search"),
    ("title", "The title of the document; empty for a query"),
    ("text", "The text of the query, or of the document"),
    ("relevant", "The ids of the documents relevant to the query, as the relevance labels of the benchmark give them; empty for a document"),
]

"""The files of the artifact of PollisBenchmarks that make the table of a benchmark, and the split of each."""
const BENCHMARKS_FILES = [("test", ""), ("example", "-examples"), ("document", "-documents")]

"""
The SQL that makes PollisBenchmarks from `source` (`benchmarks_source`): the table `catalogue`, a row per entry of
`data/catalogue.toml`; and, for each benchmark Built In, its questions, its examples and its documents, copied from the
artifact into one table, named by its id, the column `split` telling them apart; each table and
column with its description, those of a benchmark's own columns from its entry.
"""
function benchmarks_sql(source)
    TOML = Base.require(Base.PkgId(UUID("fa267f1f-6049-4f14-aa54-33bafae1ed76"), "TOML"))
    entries = Base.invokelatest(TOML.parsefile, source.catalogue)["benchmarks"]
    quoted(x) = x === nothing ? "NULL" : x isa Real ? string(x) : x isa AbstractVector ? "[" * join(quoted.(x), ", ") * "]" :
        "'" * replace(string(x), "'" => "''") * "'"
    statements = String[]
    push!(statements, "CREATE TABLE catalogue (" * join(["$name $type" for (name, type, _) in BENCHMARKS_CATALOGUE], ", ") * ")")
    # The size of a benchmark Built In: its files in the artifact
    function size_mb(entry)
        get(entry, "availability", "") == "Built In" || return get(entry, "size_mb", nothing)
        files = [joinpath(source.folder, entry["id"] * suffix * ".parquet") for (_, suffix) in BENCHMARKS_FILES]
        return round(sum(filesize, filter(isfile, files); init = 0) / 1e6; digits = 2)
    end
    for entry in entries
        values = [quoted(name == "size_mb" ? size_mb(entry) : get(entry, name, nothing)) for (name, _, _) in BENCHMARKS_CATALOGUE]
        push!(statements, "INSERT INTO catalogue VALUES (" * join(values, ", ") * ")")
    end
    push!(statements, "COMMENT ON TABLE catalogue IS 'The benchmarks of PollisBenchmarks.jl: what each measures, its sources, revisions and licence, how an answer is graded, and whether it is built in, its questions in a table of this database. Source: PollisBenchmarks.jl. Licence: MIT'")
    append!(statements, ["COMMENT ON COLUMN catalogue.$name IS $(quoted(description))" for (name, _, description) in BENCHMARKS_CATALOGUE])
    for entry in entries
        get(entry, "availability", "") == "Built In" || continue
        id = table = entry["id"]
        parts = String[]
        for (split, suffix) in BENCHMARKS_FILES
            path = joinpath(source.folder, "$id$suffix.parquet")
            isfile(path) || continue
            push!(parts, "SELECT id, '$split' AS split, * EXCLUDE (id) FROM read_parquet($(quoted(replace(path, "\\" => "/"))))")
        end
        isempty(parts) && continue
        retrieval = get(entry, "layout", "questions") == "retrieval"
        what = retrieval ? "The queries and documents of $(entry["benchmark"]): $(entry["domain"]). The split test holds its queries, each with the documents relevant to it; document, the documents they search." :
            "The questions of $(entry["benchmark"]): $(entry["domain"]). The split test holds its questions; example, when it has examples, the solved questions a prompt can show before a question."
        sources = join(["$source, revision $revision" for (source, revision) in zip(entry["source"], entry["revision"])], "; ")
        push!(statements, "CREATE TABLE $table AS " * join(parts, " UNION ALL BY NAME "))
        push!(statements, "COMMENT ON TABLE $table IS $(quoted("$what From $sources, converted to DuckDB. Licence: $(entry["licence"])"))")
        own = get(entry, "columns", Dict{String, Any}())
        common = retrieval ? BENCHMARKS_RETRIEVAL_COLUMNS : BENCHMARKS_QUESTION_COLUMNS
        descriptions = vcat([(column, get(own, column, text)) for (column, text) in common],
            [(column, text) for (column, text) in own if !any(c -> c[1] == column, common)])
        append!(statements, ["COMMENT ON COLUMN $table.$column IS $(quoted(text))" for (column, text) in descriptions])
    end
    return statements
end

benchmarks_stamp(source) = source.root * "\n" * source.folder * "\n" * join(benchmarks_sql(source), ";\n")

"""Whether `BENCHMARKS_DB` is missing or older than the installed PollisBenchmarks.jl or its SQL; `false` when it is not installed."""
function benchmarks_outdated(database::AbstractString = BENCHMARKS_DB)
    source = benchmarks_source()
    source === nothing && return false
    stamp = database * ".stamp"
    return !isfile(database) || !isfile(stamp) || read(stamp, String) != benchmarks_stamp(source)
end

"""
    build_benchmarks(database = BENCHMARKS_DB)

Make the PollisBenchmarks database when it is missing, or PollisBenchmarks.jl or the SQL of `benchmarks_sql` have
changed since it was made: the catalogue of the benchmarks and their questions, copied from the package's
artifact. Nothing else writes to it. Written under a temporary name and moved into place, as `build` does.
"""
function build_benchmarks(database::AbstractString = BENCHMARKS_DB)
    benchmarks_outdated(database) || return nothing
    source = benchmarks_source()
    println("Pollis: building the PollisBenchmarks database. This happens only when PollisBenchmarks.jl changes.")
    DuckDB = get(() -> Base.require(DUCKDB), Base.loaded_modules, DUCKDB)
    get(() -> Base.require(DBINTERFACE), Base.loaded_modules, DBINTERFACE)
    mkpath(dirname(database))
    tmp = "$database.$(getpid()).tmp"
    rm(tmp; force = true)
    try
        Base.invokelatest() do
            con = loaded(DBINTERFACE).connect(DuckDB.DB, tmp)
            try
                foreach(statement -> loaded(DBINTERFACE).execute(con, statement), benchmarks_sql(source))
                loaded(DBINTERFACE).execute(con, "CHECKPOINT")
            finally
                loaded(DBINTERFACE).close!(con)
            end
        end
        mv(tmp, database; force = true)
        write(database * ".stamp", benchmarks_stamp(source))
    catch err
        rm(tmp; force = true)
        isfile(database) || rethrow()
        @warn "Pollis: could not rebuild the PollisBenchmarks database; the previous one is kept" exception = err
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

"""The packages of Pollis installed from GitHub, the data of the built-in databases and PollisBenchmarks.jl, with the file of the commit installed."""
const DATA_PACKAGES = [(pkg = DATASETS, url = DATASETS_URL, commit = DATASETS_COMMIT), (pkg = JOURNALS, url = JOURNALS_URL, commit = JOURNALS_COMMIT),
    (pkg = REFERENCES, url = REFERENCES_URL, commit = REFERENCES_COMMIT), (pkg = RSS, url = RSS_URL, commit = RSS_COMMIT),
    (pkg = BENCHMARKS, url = BENCHMARKS_URL, commit = BENCHMARKS_COMMIT)]

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

"""
    needs_install()

Whether `install()` has something to do, or a built-in database, PollisDatasets, PollisRSS, PollisJournals,
PollisReferences or PollisBenchmarks, is not made yet, or PollisReferences is older than the references of Pollis, or
PollisBenchmarks than PollisBenchmarks.jl. The REPL asks at start, and when it does, Pollis runs `install_pollisdb.jl` in a terminal of
its own, as it installs Revise, so the REPL never waits for Pkg.
"""
function needs_install()
    todo = pending()
    return !isempty(todo.missing_packages) || any(d -> d.missing || d.outdated, todo.data) || todo.registry_duckdb ||
        !isfile(DATASETS_DB) || !isfile(RSS_DB) || !isfile(JOURNALS_DB) || journals_outdated() || package_data_uncopied() || references_outdated() ||
        benchmarks_outdated()
end

"""
    install()

Install the packages built into Pollis, and the PollisDatasets, PollisJournals, PollisReferences, PollisRSS and PollisBenchmarks (`DATA_PACKAGES`),
that no environment on the load path provides yet into `ENVIRONMENT`. The first time, it adds them; afterwards it
keeps the PollisDatasets, PollisJournals, PollisReferences, PollisRSS and PollisBenchmarks installed there up to date with GitHub, so that new data reaches
the built-in databases and new benchmarks reach Benchmark Answering Models. Pkg runs (and precompiles) only when something is missing or GitHub has a newer
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

"""
Remove the snapshots, and the addresses of served databases, of Julia processes that died without exiting, which left
them behind.
"""
function prune()
    for folder in (SESSIONS, dirname(SERVED))
        isdir(folder) || continue
        for file in readdir(folder; join = true)
            endswith(file, ".json") || continue
            m = match(r"\"pid\":(?<pid>\d+)", read(file, String))
            (m === nothing || !alive(parse(Int, m[:pid]))) && rm(file; force = true)
        end
    end
    # The sockets of the Pollis REPL terminals of Julias gone
    folder = dirname(SERVED)
    if isdir(folder)
        for file in readdir(folder; join = true)
            endswith(file, ".sock") && !isfile(chop(file; tail = 5) * ".json") && rm(file; force = true)
        end
    end
    return nothing
end

try
    prune()
catch
end

# After the user's environments, so that their own versions of these packages come first.
ENVIRONMENT in LOAD_PATH || push!(LOAD_PATH, ENVIRONMENT)

# The pollis> mode, in the REPL of Pollis' terminal; a notebook has no REPL, and runs SQL cells with `cell`.
function add_sql_mode(repl)
    @async try
        sql_mode(repl)
    catch err
        @debug "Pollis: pollis> mode not added" exception = err
    end
end
isdefined(Base, :active_repl) ? add_sql_mode(Base.active_repl) : atreplinit(add_sql_mode)

# Remove the snapshots when Julia exits, so the view does not show dead connections.
atexit(() -> (foreach(id -> rm(snapshot_path(id); force = true), keys(CONNECTIONS)); unserve(); unserve_terminal()))

end # module
