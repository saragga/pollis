# Query (DuckDB)

The **Query (DuckDB)** tab of the Excel Workbooks panel runs SQL on a sheet of a workbook with DuckDB's `excel` extension, through DuckDB.jl ([Raasveldt and Mühleisen (2026)](#ref-RM2026a)), and saves the result as a new workbook with XLSX.jl.

## How Do I Query an Excel Sheet with SQL from Julia?

```julia
using DuckDB, Tables

con = DBInterface.connect(DuckDB.DB)
DBInterface.execute(con, "INSTALL excel")   # once: DuckDB downloads the extension
DBInterface.execute(con, "LOAD excel")
tbl = Tables.columntable(DBInterface.execute(con, """
SELECT * FROM read_xlsx('book.xlsx', sheet = 'readings')
WHERE temp > 85
"""))
```

`read_xlsx` reads one sheet as a table, the first row giving the column names. `sheet` names the sheet, and `range = 'B2:F200'` limits the read to a block of cells. `INSTALL` downloads the extension the first time and needs a network; `LOAD` is then needed once per connection.

## Which Types Does read_xlsx Give Excel Columns?

Excel stores every number as a floating-point value, so `read_xlsx` gives numeric columns the type `DOUBLE`, and whole numbers arrive in Julia as `Float64`. Casting in the query restores integers: `SELECT month::INTEGER AS month`. Text cells give `VARCHAR`, cells formatted as dates give `DATE` or `TIMESTAMP`, and empty cells give `NULL`, which arrives in Julia as `missing`. A formula cell gives the value Excel last computed and saved, not the formula.

## When Is DuckDB Better Than XLSX.jl for a Workbook?

DuckDB suits a sheet that holds a table: filtering, grouping and joining it with other files in one SQL statement, without loading the workbook into Julia first. XLSX.jl suits everything that belongs to the workbook rather than to a table: cells and ranges, several sheets written one by one, formulas, defined names, fonts and fills. The **Query (DuckDB)** tab uses both, reading with DuckDB and writing the result with `XLSX.writetable`.

## References

<a id="ref-RM2026a"></a>Raasveldt, M. and Mühleisen, H. (2026). DuckDB.jl: the DuckDB Julia package. [github.com/duckdb/DuckDB.jl](https://github.com/duckdb/DuckDB.jl)

## See Also
- [Overview](overview.md) · [Constraints](constraints.md) · [Interpretation](interpretation.md)
