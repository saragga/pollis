# SQL Databases — Factsheet

A **SQL database** stores tables and answers questions about them in SQL, the standard language for filtering, joining and aggregating tables. Pollis has one built in: **DuckDB**, an analytical database that runs inside the Julia process and keeps everything in a single file, `~/.pollis/pollis.duckdb`. DBInterface.jl sends it SQL, and Tables.jl brings the results back as Julia columns.

| | |
|---|---|
| **Purpose** | Store tables across sessions, query them with SQL, move data between files, databases and Julia |
| **Input** | A DuckDB connection (by default the built-in Pollis database), a SQL query, a file or a Julia table |
| **Core packages** | [DuckDB.jl](https://github.com/duckdb/duckdb), [DBInterface.jl](https://github.com/JuliaDatabases/DBInterface.jl), [Tables.jl](https://github.com/JuliaData/Tables.jl) |
| **Methods** | Query (`DBInterface.execute`), Import File (`read_csv`, `read_parquet`, `read_json`), Save Table (`DuckDB.register_table`), Export (`COPY ... TO`) |
| **Output** | Typed Julia columns (Query), a database table (Import File, Save Table), a file (Export) |
| **Key choices** | Connection, SQL statement, table name, replace or append, file format |

## When to Use

- The data is **larger than you want to hold in Julia**: DuckDB filters and aggregates it first, so only the result is fetched.
- You want tables to **persist** between sessions without re-reading the source files.
- The work is naturally **relational**: joins, group-bys, window functions.
- You are converting between **CSV, Parquet and JSON**: DuckDB reads and writes all three directly.

## What It Is Not

DuckDB is built for analysis, not for many users writing at once: only **one process** can open a database file for writing. For shared, transactional data use a server database such as PostgreSQL (add it in the Databases view). For quick one-off reads of a single file, CSV Files may be simpler.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [SQL Basics](sql-basics.md)
