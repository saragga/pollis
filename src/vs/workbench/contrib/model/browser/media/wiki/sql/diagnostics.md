# Diagnostics

A query that runs is not necessarily a query that is right. The Diagnose actions check the result and the way it was computed.

## Query Plan
`EXPLAIN ANALYZE` runs the query and prints the **plan**: the tree of operators DuckDB executed, with the rows each produced and the time it took. Read it from the bottom up: table scans first, then filters, joins, aggregates. Warning signs:
- A scan returns **far more rows** than the final result: add a `WHERE` early, or select fewer columns.
- A join produces **more rows than either input**: the join key is not unique, so rows are multiplied. Check the keys with `count(DISTINCT key)`.
- One operator takes **most of the time**: that is where to optimise.

## Missing Values
The action counts `NULL`s per column **in the database**, over every row, not only over the fetched sample. Unexpected missing values usually come from:
- a `LEFT JOIN` whose keys did not match;
- an imported file with markers such as `NA` that the reader did not recognise (they become text, not NULL), or empty fields that did become NULL;
- a failed type conversion with `TRY_CAST`.

## Other Checks
- **Row counts**: after a join or import, compare `count(*)` with what you expect.
- **Duplicates**: `SELECT key, count(*) FROM t GROUP BY key HAVING count(*) > 1`.
- **Types**: `DESCRIBE t` shows whether numbers or dates were read as `VARCHAR`.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Plan | Rows shrink early | Large scans, exploding joins |
| Missing values | Plausible | Whole columns missing after a join |
| Row count | As expected | Rows multiplied or lost |
| Types | Numbers and dates typed | `VARCHAR` everywhere |

## See Also
- [SQL Basics](sql-basics.md) · [Interpretation](interpretation.md)
