# Overview

The panel writes Julia code that talks to a DuckDB database through **DBInterface.jl**, the common interface of Julia's SQL packages. Every tab starts the same way:

```julia
using DuckDB, DBInterface, Tables

if !isdefined(Main, :pollis)
	pollis = DBInterface.connect(DuckDB.DB, ":memory:")
end
```

It connects only if the connection variable does not exist yet, so running the code again reuses the open connection. The built-in database lives in memory: each Julia session gets its own, filled with the PollisDatasets when it connects, so it is never locked by another process. The Databases view connects it under the same name, `pollis`, and the code registers its own connection with the view, so both see the same tables. Your own tables belong in a database file of your own: a DuckDB file can be opened for writing by **one process at a time**.

## The Four Tabs

| Tab | SQL it runs | Result |
|---|---|---|
| [Query](query.md) | Your `SELECT` | `tbl`, a named tuple of columns |
| [Import File](import.md) | `CREATE TABLE ... AS SELECT * FROM read_csv(...)` | A table in the database |
| [Save Table](save.md) | `CREATE TABLE ... AS SELECT * FROM julia_data` | A table in the database |
| [Export](export.md) | `COPY (query) TO 'file'` | A CSV, Parquet or JSON file |

Each tab also defines `relation`, the query, table or file it produced, as SQL. The Next Steps use it to preview, diagnose and summarise the result **inside the database**, so they work however many rows there are.

## Another Database

To work with another DuckDB file, connect it in the Databases view (+ New Connection) and type its variable name in **Connection**. The panel's code is written for DuckDB; SQLite and PostgreSQL connections accept the Query tab's SQL, but not DuckDB's file readers or `COPY`.

## See Also
- [Factsheet](factsheet.md) · [SQL Basics](sql-basics.md) · [Decision Guide](decision-guide.md)
