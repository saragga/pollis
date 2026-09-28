# Decision Guide

| Situation | Method | Why |
|---|---|---|
| File fits in memory, analysis follows | **Read** ([read](read.md)) | Typed columns, fastest overall, multithreaded |
| Save results for other tools | **Write** ([write](write.md)) | Any Tables.jl source, optional gzip |
| Larger than memory, one pass (count, filter, sum) | **Stream Rows** ([rows](rows.md)) | Constant memory, one row at a time |
| Larger than memory, column-wise work | **Chunks** ([chunks](chunks.md)) | Typed blocks, combine per-chunk results |
| Repeated queries on large data | SQL Databases (DuckDB) | Query the CSV in place with SQL |

## Decision Flow

1. **Does the file fit comfortably in memory** (well under half the RAM)? Read it with `CSV.File`.
2. **If not, what do you need?**
   - A single pass per row (counting, filtering to a smaller file, running totals): Stream Rows.
   - Column statistics or typed computations: Chunks, keeping one small summary per chunk.
3. **Will you query it many times?** Load it once into a database or convert it to Parquet or Arrow instead of re-parsing text.

## Rules of Thumb
- **Look at the first lines** before choosing options.
- **Always check the schema** after reading.
- **List every missing-value marker** in `missingstring`, including `""`.
- **Select only the columns you need** (`select = [:a, :b]`) on wide files.
- **Compress archives** with `compress = true`; CSV.jl reads `.gz` files directly.

## See Also
- [Overview](overview.md) · [Factsheet](factsheet.md)
