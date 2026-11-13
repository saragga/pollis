# Query

The **Query** tab of the JSON Files panel reads a file of JSON records as a table with DuckDB's `read_json`, through DuckDB.jl ([Raasveldt and Mühleisen (2026)](#ref-RM2026a)), and runs SQL on it.

## How Do I Query a JSON Lines File from Julia?

```julia
using DuckDB, Tables

con = DBInterface.connect(DuckDB.DB)
tbl = Tables.columntable(DBInterface.execute(con, """
SELECT * FROM read_json('data.jsonl')
WHERE temp > 85
"""))
```

`read_json` detects whether the file is JSON Lines or an array of objects, and makes one column per key. A pattern such as `'logs/*.jsonl'` reads many files as one table. The **Filter** field of the tab takes any SQL condition on the columns, such as `month = 7 AND ozone IS NOT NULL`.

## How Does DuckDB Choose the Column Types of JSON Records?

`read_json` samples records from the file and gives each key the narrowest type that holds every sampled value: `BIGINT` when all are whole numbers, `DOUBLE` when some have decimals, `DATE` or `TIMESTAMP` when all strings are dates, `VARCHAR` otherwise. Nested objects become `STRUCT` columns and arrays become lists. To fix the types instead, pass them: `read_json('data.jsonl', columns = {month: 'INTEGER', temp: 'DOUBLE'})`. A key missing from a record gives `NULL` in that row.

## What If the JSON Records Have Different Keys?

Records from an API or a log often differ: a key appears only in some records, or is spelt two ways. DuckDB makes a column for every key it finds, with `NULL` where a record lacks it. The **Key Check** action counts how many records have each key, which shows keys that are rare or misspelt. When a pattern such as `'logs/*.jsonl'` reads several files, DuckDB matches their columns by name, so a key found in only some files still gets its column.

## References

<a id="ref-RM2026a"></a>Raasveldt, M. and Mühleisen, H. (2026). DuckDB.jl: the DuckDB Julia package. [github.com/duckdb/DuckDB.jl](https://github.com/duckdb/DuckDB.jl)

## See Also
- [File Format](file-format.md) · [Flatten](flatten.md) · [Write](write.md)
