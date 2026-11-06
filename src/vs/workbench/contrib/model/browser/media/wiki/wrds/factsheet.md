# Wharton Research Data Services (WRDS) — Factsheet

**Wharton Research Data Services (WRDS)** serves the databases of finance, accounting and economics research from a PostgreSQL server. Pollis connects to it with **LibPQ.jl**, through **DBInterface.jl**, as it connects to any PostgreSQL database.

| | |
|---|---|
| **Purpose** | Read WRDS data into the Julia REPL with SQL |
| **Access** | A WRDS account of a subscribing institution |
| **Server** | `wrds-pgdata.wharton.upenn.edu` |
| **Port** | `9737` |
| **Database** | `wrds` |
| **SSL mode** | `require` |
| **Sign-in** | The WRDS password, then a Duo push approved on the phone |
| **Password file** | `~/.pgpass` on macOS and Linux, `%APPDATA%\postgresql\pgpass.conf` on Windows |
| **Core packages** | [LibPQ.jl](https://github.com/JuliaDatabases/LibPQ.jl), [DBInterface.jl](https://github.com/JuliaDatabases/DBInterface.jl), [Tables.jl](https://github.com/JuliaData/Tables.jl) |

## Key Functions for WRDS in Julia

| Function | Task |
|---|---|
| `DBInterface.connect(LibPQ.Connection, conninfo)` | Open the connection, with the settings above as `key=value` pairs |
| `DBInterface.execute(wrds, sql)` | Run a query on WRDS |
| `Tables.columntable(result)` | Bring a query's result into Julia as columns |
| `DBInterface.close!(wrds)` | Close the connection |
| `PollisDB.open_schema(id, library)` | Read the tables of one WRDS library into the Databases view |
| `PollisDB.fetch(wrds, sql)` | Bring a query's result into Julia, its decimal columns as `Float64` |
| `PollisDB.save(tbl, file)` | Write a table to a Parquet, CSV or DuckDB file |
| `PollisDB.query_tables(sql; stocks, firms)` | Join tables, Julia variables or files, with DuckDB on the computer |

## The Line of WRDS in a Password File

A password file holds one line per server, `host:port:database:username:password`. For WRDS the line reads `wrds-pgdata.wharton.upenn.edu:9737:wrds:your_username:your_password`. LibPQ.jl reads the file when the connection gives no password, which is what **Read It from ~/.pgpass** in the Connect step of the Wharton Research Data Services (WRDS) page does. On macOS and Linux, libpq ignores the file unless only its owner can read it (`chmod 600 ~/.pgpass`).

## See Also
- [Overview](overview.md) · [Choosing Data](choosing-data.md) · [Extracting Data](extracting-data.md) · [Merging Data](merging-data.md)
