# Query (DuckDB)

The **Query (DuckDB)** tab of the CSV Files panel runs SQL on a CSV file with DuckDB's `read_csv`, through DuckDB.jl ([Raasveldt and Mühleisen (2026)](#ref-RM2026a)). Only the rows and columns the query keeps reach Julia.

## How Do I Query a CSV File with SQL from Julia?

```julia
using DuckDB, Tables

con = DBInterface.connect(DuckDB.DB)
tbl = Tables.columntable(DBInterface.execute(con, """
SELECT month, avg(temp) AS mean_temp
FROM read_csv('data.csv', nullstr = ['', 'NA'])
GROUP BY month
"""))
```

`read_csv` detects the delimiter, the header, the quoting and the type of every column from a sample of the file, as `CSV.File` does. The fields of the tab pass the same choices on when the detection needs help: **Delimiter** as `delim`, **Header** as `header = false`, **Decimal Mark** as `decimal_separator`, and **Missing Strings** as `nullstr`.

## When Is DuckDB Better Than CSV.jl for a CSV File?

DuckDB suits a question about part of a file: a filter, a few columns, a total per group, or a join of the file with another file or with a Julia table. DuckDB answers it without holding the file in memory, so the file can be larger than memory, and runs on several threads. CSV.jl suits loading the whole file into Julia, and reading row by row with **Stream Rows** or in pieces with **Chunks** when the work is Julia code rather than SQL.

## Does DuckDB Read Dates in CSV Files?

`read_csv` recognises dates and timestamps written in common forms, such as `2024-07-01`, and gives the column a `DATE` or `TIMESTAMP` type, which arrives in Julia as `Date` or `DateTime`. Another form needs a format in DuckDB's notation, not Julia's: `read_csv('data.csv', dateformat = '%d/%m/%Y')` where the **Read** tab would take `dd/mm/yyyy`. The **Date Format** field of the panel therefore does not apply to this tab.

## References

<a id="ref-RM2026a"></a>Raasveldt, M. and Mühleisen, H. (2026). DuckDB.jl: the DuckDB Julia package. [github.com/duckdb/DuckDB.jl](https://github.com/duckdb/DuckDB.jl)

## See Also
- [Read](read.md) · [Chunks](chunks.md) · [Decision Guide](decision-guide.md)
