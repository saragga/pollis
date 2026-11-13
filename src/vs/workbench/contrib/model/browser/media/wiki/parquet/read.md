# Read

The **Read** tab of the Parquet Files panel opens a Parquet file with Parquet2.jl, a Parquet reader and writer written in Julia ([Expanding Man (2026)](#ref-EM2026a)), and loads its columns as Julia vectors.

## How Do I Read a Parquet File into Julia with Parquet2.jl?

```julia
using Parquet2, Tables

ds = Parquet2.Dataset("data.parquet")   # reads the footer: schema and row groups
Tables.schema(ds)                       # column names and Julia types
tbl = Tables.columntable(ds)            # every column as a vector
```

`Parquet2.Dataset` reads only the footer when it opens the file. The data is read when the columns are asked for, which `Tables.columntable` does for all of them. A `Parquet2.Dataset` is itself a Tables.jl table, so it can also be passed directly to a package that accepts tables.

## Which Julia Types Do Parquet Columns Become?

Parquet2.jl maps the file's types to Julia's: `INT64` to `Int64`, `DOUBLE` to `Float64`, strings to `String`, dates to `Date`, timestamps to `DateTime`. A column the file marks `OPTIONAL` becomes a vector of `Union{Missing, T}`, even when it holds no missing value; DuckDB marks every column it writes that way. The **File Schema** action shows the types recorded in the file, which helps when a column comes back with a type that was not expected.

## When Is the Read Tab Better Than the Query Tab?

The **Read** tab suits a file that fits in memory when every column is needed in Julia, and code that should run without SQL. For part of a file, for files larger than memory, or for a grouped summary, the **Query** tab reads less and does the work in DuckDB. Parquet2.jl also writes Parquet, with `Parquet2.writefile(path, tbl)`, which the **Read** tab uses to make its example file.

## References

<a id="ref-EM2026a"></a>Expanding Man (2026). Parquet2.jl: (another) pure Julia implementation of the parquet tabular data binary format. [gitlab.com/ExpandingMan/Parquet2.jl](https://gitlab.com/ExpandingMan/Parquet2.jl)

## See Also
- [Query](query.md) · [File Format](file-format.md) · [Decision Guide](decision-guide.md)
