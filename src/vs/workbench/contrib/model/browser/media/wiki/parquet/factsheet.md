# Parquet Files — Factsheet

**Parquet** is a binary file format for tables that stores each column apart, compressed, with the schema and summary statistics in the file itself ([Apache Software Foundation (2026)](#ref-ASF2026a)). The Parquet Files panel reads and writes it from Julia with DuckDB (through DuckDB.jl) and with Parquet2.jl, and returns Tables.jl tables.

| Item | Parquet Files panel |
|---|---|
| **Purpose** | Query, read and write Parquet files from Julia |
| **Input** | A `.parquet` file, or a folder of them; for writing, any Tables.jl source |
| **Core packages** | [DuckDB.jl](https://github.com/duckdb/DuckDB.jl), [Parquet2.jl](https://gitlab.com/ExpandingMan/Parquet2.jl), [Tables.jl](https://github.com/JuliaData/Tables.jl) |
| **Tabs** | Query (DuckDB), Read (Parquet2.jl), Write (DuckDB), Partitioned (DuckDB) |
| **Output** | A named tuple of column vectors; a Parquet file or a folder of them |
| **Key choices** | Columns and filter, compression codec, partition column |

## When Is Parquet the Right Format?

Parquet suits tables that are read many times and written rarely: research datasets, exports from data warehouses, the files of data lakes, and the Hugging Face datasets. Its column types survive a round trip, so dates stay dates and integers stay integers, which a CSV file cannot promise. Compressed column by column, a Parquet file is usually several times smaller than the same table as CSV, and a query that needs three columns of a wide table reads only those three.

## What Parquet Is Not

Parquet is not a database: a file cannot be updated in place, only rewritten or added to with new files. It is not human-readable, so a text editor shows nothing useful. For a table edited by hand, use CSV Files or Excel Workbooks; for a table that changes row by row, use a database such as DuckDB or SQLite, and save it as Parquet when it is to be shared.

## References

<a id="ref-ASF2026a"></a>Apache Software Foundation (2026). Apache Parquet Format. [github.com/apache/parquet-format](https://github.com/apache/parquet-format)

## See Also
- [Overview](overview.md) · [File Format](file-format.md) · [Decision Guide](decision-guide.md)
