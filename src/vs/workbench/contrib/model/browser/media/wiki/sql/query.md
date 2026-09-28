# Query

The Query tab runs a `SELECT` statement in the database and brings the result into Julia as **typed columns**.

## Construction
```julia
using DuckDB, DBInterface, Tables

sql = raw"""
SELECT region, avg(price) AS mean_price
FROM sales
GROUP BY region
"""
tbl = Tables.columntable(DBInterface.execute(pollis, sql))   # named tuple of column vectors
Tables.schema(tbl)
```
The SQL goes in a `raw"""..."""` string, so quotes and backslashes need no escaping. `DBInterface.execute` returns a cursor that any Tables.jl consumer can read; `Tables.columntable` materialises it as `tbl.region`, `tbl.mean_price`, ...

## Parameters
Never paste user values into SQL. Use placeholders instead, which also lets DuckDB reuse the plan:
```julia
stmt = DBInterface.prepare(pollis, "SELECT * FROM sales WHERE region = ? AND year >= ?")
tbl  = Tables.columntable(DBInterface.execute(stmt, ("north", 2025)))
```

## Strengths and Limits
- Filtering and aggregating in the database fetches only the result, however large the table.
- `Tables.columntable` holds the whole result in memory: keep a `LIMIT` while exploring.
- Statements that change data (`CREATE`, `INSERT`, `UPDATE`) run the same way but return no rows.

## See Also
- [SQL Basics](sql-basics.md) · [Export](export.md) · [Diagnostics](diagnostics.md)
