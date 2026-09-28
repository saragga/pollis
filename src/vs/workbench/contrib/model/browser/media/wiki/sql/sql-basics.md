# SQL Basics

SQL describes **what** result you want, and the database decides how to compute it. A query reads like a sentence, but is executed in a different order:

```sql
SELECT region, avg(price) AS mean_price   -- 5. choose and compute the output columns
FROM sales                                -- 1. start from a table
WHERE year = 2026                         -- 2. keep matching rows
GROUP BY region                           -- 3. form groups
HAVING count(*) > 10                      -- 4. keep matching groups
ORDER BY mean_price DESC                  -- 6. sort
LIMIT 5                                   -- 7. keep the first rows
```

## The Essentials
- **Filter** rows with `WHERE`; combine conditions with `AND`, `OR`, `NOT`; test for missing values with `IS NULL`, never `= NULL`.
- **Aggregate** with `count(*)`, `sum`, `avg`, `min`, `max`, `median`, together with `GROUP BY`.
- **Join** tables on matching keys: `FROM orders JOIN customers USING (customer_id)`. `LEFT JOIN` keeps rows without a match.
- **Window functions** compute per-row values over a group without collapsing it: `avg(price) OVER (PARTITION BY region)`, `row_number() OVER (ORDER BY date)`.
- **Subqueries and CTEs** name intermediate results: `WITH recent AS (SELECT ...) SELECT ... FROM recent`.

## DuckDB Conveniences
- Query a file as if it were a table: `SELECT * FROM 'data.parquet'`.
- `SELECT * EXCLUDE (id)`, `GROUP BY ALL`, `ORDER BY ALL` save repeating column lists.
- `DESCRIBE tbl` lists columns and types; `SUMMARIZE tbl` gives a statistical summary.

## NULL and missing
SQL `NULL` arrives in Julia as `missing`, and aggregates skip it just like `skipmissing`. `count(col)` counts non-missing values; `count(*)` counts rows.

## Names
Unquoted names are case-insensitive. A name with spaces, capitals you want to keep, or a reserved word needs double quotes: `"Sales 2026"`. Strings use single quotes: `'north'`.

## See Also
- [Query](query.md) · [Overview](overview.md)
