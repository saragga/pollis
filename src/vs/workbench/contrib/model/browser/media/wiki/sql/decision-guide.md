# Decision Guide

## Which Tab?

| Situation | Tab |
|---|---|
| The data is already in the database | [Query](query.md) |
| The data is in CSV, Parquet or JSON files | [Import File](import.md), or query the file directly |
| The data was computed in Julia | [Save Table](save.md) |
| Someone needs the result as a file | [Export](export.md) |

## Import or Query the File Directly?
DuckDB can query a file without importing it: `SELECT * FROM 'data.parquet'`. Import it when you will query it **repeatedly** (a table is faster than re-parsing a CSV), when you want to **combine** it with other tables, or when the file may change or disappear. Query it directly for a one-off look, or when the file is Parquet and large (DuckDB reads only the columns and row groups it needs).

## SQL or Julia?

| Task | Better in |
|---|---|
| Filter, join, group, sort large tables | SQL |
| Summaries of data that does not fit in memory | SQL |
| Statistical models, plots, custom algorithms | Julia |
| Row-by-row logic with complex state | Julia |

## Which File Format?

| Format | Choose when |
|---|---|
| Parquet | Data stays in analytical tools; keeps types, compresses well, fast |
| CSV | The file must open anywhere, including spreadsheets |
| JSON | The consumer is a web service or script |

## Which Database?
The built-in DuckDB database suits single-user analysis. Use a separate DuckDB file per project to keep data apart, SQLite for small application data, and PostgreSQL when several people or programs write at the same time.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md)
