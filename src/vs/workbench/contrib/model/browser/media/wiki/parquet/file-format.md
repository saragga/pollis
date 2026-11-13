# File Format

A Parquet file is laid out for reading columns, not rows. Its specification is kept by the Apache Software Foundation ([Apache Software Foundation (2026)](#ref-ASF2026a)), and its way of storing nested data comes from Google's Dremel ([Melnik, Gubarev, Long, Romer, Shivakumar, Tolton and Vassilakis (2010)](#ref-MGLRS...2010a)).

## How Is a Parquet File Organised Inside?

| Level | What the level holds |
|---|---|
| **Row group** | A block of rows, typically from a hundred thousand to a few million |
| **Column chunk** | The values of one column within one row group, stored together |
| **Page** | The unit a column chunk is compressed and encoded in |
| **Footer** | The schema, the place of every column chunk, and each chunk's statistics |

A reader opens the footer first, at the end of the file. From it, the reader knows where each column chunk lies and can fetch only the chunks a query needs.

## What Are Row Group Statistics For?

The footer records, for every column chunk, the minimum, the maximum and the number of missing values. A filter such as `temp > 85` can then skip a whole row group whose maximum temperature is below 85, without reading it. The skipping works best when the file is sorted on the filtered column, so that each row group covers a narrow range of values.

## Which Types Can a Parquet Column Have?

Each column has a **physical type**, how the values are stored: `BOOLEAN`, `INT32`, `INT64`, `FLOAT`, `DOUBLE`, `BYTE_ARRAY` or `FIXED_LEN_BYTE_ARRAY`. A **logical type** says what the stored values mean: a `DATE` is stored as an `INT32` count of days, a string as a `BYTE_ARRAY` in UTF-8, a `DECIMAL` as an integer with a scale. Each column is also `REQUIRED` (never missing) or `OPTIONAL` (missing values allowed). The **File Schema** action of the Parquet Files panel shows all three for every column.

## How Does Parquet Store Nested Data?

Lists and structs are stored as columns too, one per leaf field. Two small integers per value, the repetition level and the definition level, record where each list starts and at which depth a value is missing, so that the nesting can be rebuilt on reading ([Melnik, Gubarev, Long, Romer, Shivakumar, Tolton and Vassilakis (2010)](#ref-MGLRS...2010a)). DuckDB reads nested Parquet columns as its `STRUCT` and list types.

## How Are Parquet Columns Compressed?

Values are first encoded, by dictionary (each distinct value once, then small codes), by run length (a repeated value once with its count) or by deltas between neighbours. The encoded pages are then compressed with a codec: `zstd`, `snappy`, `gzip`, `lz4` or `brotli`. Since a column holds values of one type, often repeated or close to each other, it compresses much better than rows of mixed values. The **Row Groups** action shows each column's codec, its size on disk and its size uncompressed.

## References

<a id="ref-ASF2026a"></a>Apache Software Foundation (2026). Apache Parquet Format. [github.com/apache/parquet-format](https://github.com/apache/parquet-format)

<a id="ref-MGLRS...2010a"></a>Melnik, S., Gubarev, A., Long, J. J., Romer, G., Shivakumar, S., Tolton, M. and Vassilakis, T. (2010). Dremel: interactive analysis of web-scale datasets. *Proceedings of the VLDB Endowment*, 3(1-2), 330–339. [doi:10.14778/1920841.1920886](https://doi.org/10.14778/1920841.1920886)

## See Also
- [Factsheet](factsheet.md) · [Query](query.md) · [Write](write.md)
