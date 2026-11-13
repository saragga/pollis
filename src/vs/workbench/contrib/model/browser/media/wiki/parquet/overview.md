# Overview

The Parquet Files panel has four tabs. Three use DuckDB, the analytical database that runs inside the Julia process ([Raasveldt and Mühleisen (2019)](#ref-RM2019a)), and one uses Parquet2.jl, a Parquet reader written in Julia. Every tab ends with `tbl`, a named tuple of column vectors, which the Next Steps use.

## Which Tab of the Parquet Files Panel Does What?

| Tab | Package | What the tab does |
|---|---|---|
| **Query** | DuckDB.jl | Runs SQL on the file, reading only the columns named and the row groups the filter allows |
| **Read** | Parquet2.jl | Opens the file as a Tables.jl table and loads its columns into Julia |
| **Write** | DuckDB.jl | Saves a Julia table as a Parquet file with `COPY ... TO`, with a chosen codec |
| **Partitioned** | DuckDB.jl | Splits a table into one folder per value of a column, then reads the folders back as one table |

## Why Does the Parquet Files Panel Use DuckDB First?

DuckDB reads Parquet natively: it uses the statistics in the file to skip data, runs the query on several threads, and works on files larger than memory. Pollis uses DuckDB for its own work with files too, in the Table Viewer and the DuckDB REPL, so a query that works in one place works in the other. Parquet2.jl is the choice when a whole table is wanted in Julia without SQL.

## What Does a Typical Parquet Workflow Look Like?

1. Look at the file before reading it: **File Schema** lists the columns and their types, **Row Groups** the codecs and sizes.
2. Query only what the analysis needs with the **Query** tab, or load the whole table with the **Read** tab.
3. Check how DuckDB ran the query with **Query Plan**.
4. Save results with the **Write** tab, or split a large table with the **Partitioned** tab.

## References

<a id="ref-RM2019a"></a>Raasveldt, M. and Mühleisen, H. (2019). DuckDB: an embeddable analytical database. *Proceedings of the 2019 International Conference on Management of Data (SIGMOD)*, 1981–1984. [doi:10.1145/3299869.3320212](https://doi.org/10.1145/3299869.3320212)

## See Also
- [Factsheet](factsheet.md) · [File Format](file-format.md) · [Decision Guide](decision-guide.md)
