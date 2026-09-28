# CSV Files — Factsheet

**CSV** (comma-separated values) is the most common plain-text format for tables: one line per row, fields separated by a delimiter, an optional first line of column names. CSV.jl reads and writes it fast, infers a type for every column and returns a table that any Tables.jl consumer can use.

| | |
|---|---|
| **Purpose** | Load delimited text files into Julia, or save Julia tables as delimited text |
| **Input** | A file path (or IO), optionally gzip-compressed; for writing, any Tables.jl source |
| **Core packages** | [CSV.jl](https://github.com/JuliaData/CSV.jl), [Tables.jl](https://github.com/JuliaData/Tables.jl) |
| **Methods** | Read (`CSV.File`), Write (`CSV.write`), Stream Rows (`CSV.Rows`), Chunks (`CSV.Chunks`) |
| **Output** | Typed columns (Read, Chunks), string rows (Stream Rows), a text file (Write) |
| **Key choices** | Delimiter, header row, missing strings, decimal mark, date format |

## When to Use

- The data arrives as **.csv, .tsv or .txt** exports from spreadsheets, databases or other languages.
- You need a **portable, human-readable** file that any tool can open.
- The file is **larger than memory**: stream it with Stream Rows or Chunks instead of loading it whole.

## What It Is Not

CSV has no types, no schema and no standard for dates, decimals or missing values: every reader guesses. For repeated analysis of large data, a typed columnar format (Arrow, Parquet) or a SQL engine such as DuckDB (see SQL Databases) is faster and safer. For formatted spreadsheets use Excel Workbooks.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Read](read.md)
