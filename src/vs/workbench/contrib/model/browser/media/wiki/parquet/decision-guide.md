# Decision Guide

## Which Tab of the Parquet Files Panel Should I Use?

| Situation | Tab | Why that tab |
|---|---|---|
| A question about part of the file: some columns, some rows, a total per group | **Query** | DuckDB reads only what the question needs and returns the answer, not the file |
| The file is larger than memory | **Query** | DuckDB streams the file and spills to disk when it must |
| The whole table is wanted in Julia, as vectors | **Read** | Parquet2.jl loads the columns with no SQL in between |
| A Julia table is to be saved | **Write** | DuckDB writes Parquet with the codec chosen, from any Tables.jl source |
| A large table is filtered on one column again and again | **Partitioned** | One folder per value of that column, so a filter on it opens only the folders it needs |

## Should Parquet Be Queried with DuckDB or Read with Parquet2.jl?

Query the file with DuckDB when the analysis needs less than the whole file, when the file is larger than memory, or when the work is a join or a grouped summary that SQL says in a few lines. Read the file with Parquet2.jl when every column is needed in Julia anyway and no SQL is wanted. Both return a Tables.jl table, so the choice can change later without touching the code that comes after.

## Which Compression Codec Should a Parquet File Use?

| Codec | Size | Speed | When to choose the codec |
|---|---|---|---|
| **zstd** | Smallest of the common codecs | Fast to read, a little slower to write | The default choice for files kept and shared |
| **snappy** | Larger | Fastest to write | Files written often and read soon, such as intermediate results |
| **gzip** | Small | Slow to write and read | Files for older tools that read nothing else |
| **none** | Largest | No decompression | Columns that are already compressed, such as images |

## When Is a Table Worth Partitioning?

Partition a table when it is large, when most queries filter on one column, and when that column has few distinct values, such as a year, a month, a country or a category. A column with thousands of values makes thousands of small files, and reading many small files is slower than reading one large one. For a table of a few million rows, one sorted file is often better than any partitioning.

## See Also
- [Overview](overview.md) · [Query](query.md) · [Partitioned](partitioned.md)
