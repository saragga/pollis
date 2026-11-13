# Overview

The JSON Files panel has four tabs. Two use DuckDB ([Raasveldt and Mühleisen (2019)](#ref-RM2019a)) through DuckDB.jl, one uses JSON.jl, and the **Write** tab uses either, depending on the layout of the file. Every tab ends with `tbl`, a named tuple of column vectors, which the Next Steps use.

## Which Tab of the JSON Files Panel Does What?

| Tab | Package | What the tab does |
|---|---|---|
| **Query** | DuckDB.jl | Reads a file of records, JSON Lines or an array of objects, as a table, and runs SQL on it |
| **Flatten** | DuckDB.jl | Turns a nested document into rows and columns with `unnest`, and picks single values by their path |
| **Typed Structs** | JSON.jl | Reads a nested document into Julia structs that describe its shape |
| **Write** | DuckDB.jl, JSON.jl | Saves a Julia table as JSON Lines, as an array of records, or as arrays per column |

## Why Does the JSON Files Panel Use DuckDB for Records?

DuckDB reads JSON records straight into typed columns, inferring the type of each key from the values, and runs on files larger than memory. A filter or a grouped summary is then one SQL statement, and the rest of the file never reaches Julia. JSON.jl is the choice when the structure of the document matters more than a table: an API's answer read into Julia types, checked as it is read, or a Julia value saved as it is.

## What Does a Typical JSON Workflow Look Like?

1. Find out whether the file is records or a nested document: open it, or run **Key Check** on a file of records.
2. Query records with the **Query** tab; flatten a document with the **Flatten** tab, or read it into structs with the **Typed Structs** tab.
3. Check the column types with **Schema Check**, since JSON numbers and dates are often written as text.
4. Save results with the **Write** tab, or as Parquet or CSV from **Export**.

## References

<a id="ref-RM2019a"></a>Raasveldt, M. and Mühleisen, H. (2019). DuckDB: an embeddable analytical database. *Proceedings of the 2019 International Conference on Management of Data (SIGMOD)*, 1981–1984. [doi:10.1145/3299869.3320212](https://doi.org/10.1145/3299869.3320212)

## See Also
- [Factsheet](factsheet.md) · [File Format](file-format.md) · [Decision Guide](decision-guide.md)
