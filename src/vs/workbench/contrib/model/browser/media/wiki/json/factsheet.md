# JSON Files — Factsheet

**JSON** (JavaScript Object Notation) is a text format for structured data: objects of named values, arrays, strings, numbers, `true`, `false` and `null`, nested to any depth ([Bray (2017)](#ref-Bra2017a)). Web services answer in JSON, and many datasets come as JSON Lines, one record per line. The JSON Files panel reads and writes both from Julia, with DuckDB (through DuckDB.jl) and with JSON.jl.

| Item | JSON Files panel |
|---|---|
| **Purpose** | Query, flatten, read into Julia types, and write JSON files |
| **Input** | A `.json` document, or a `.jsonl` file of records; for writing, any Tables.jl source |
| **Core packages** | [DuckDB.jl](https://github.com/duckdb/DuckDB.jl), [JSON.jl](https://github.com/JuliaIO/JSON.jl), [Tables.jl](https://github.com/JuliaData/Tables.jl) |
| **Tabs** | Query (DuckDB), Flatten (DuckDB), Typed Structs (JSON.jl), Write (DuckDB and JSON.jl) |
| **Output** | A named tuple of column vectors; Julia structs; a JSON file |
| **Key choices** | Records or nested document, SQL or Julia types, layout of the file written |

## When Does JSON Need a Table and When a Tree?

JSON holds two kinds of data. **Records**, many objects with the same keys, are a table in all but name: DuckDB reads them as one, in the **Query** tab. **Documents**, one object with objects and arrays inside, such as an API's answer, are a tree: the **Flatten** tab turns the tree into a table with SQL, and the **Typed Structs** tab keeps the tree, as Julia structs.

## What JSON Is Not

JSON has no types beyond text, numbers, booleans and `null`: no dates, no missing value apart from `null`, no integers distinct from decimals. Every key is repeated in every record, so a large table takes much more space than as CSV, and far more than as Parquet. For tables kept and queried often, Parquet Files is the better format, and a JSON file read once can be saved as Parquet with the **Save as Parquet** action.

## References

<a id="ref-Bra2017a"></a>Bray, T. (2017). The JavaScript Object Notation (JSON) data interchange format. IETF RFC 8259. [doi:10.17487/RFC8259](https://doi.org/10.17487/RFC8259)

## See Also
- [Overview](overview.md) · [File Format](file-format.md) · [Decision Guide](decision-guide.md)
