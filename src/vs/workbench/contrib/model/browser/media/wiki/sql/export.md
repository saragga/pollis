# Export

The Export tab writes a query result to a **file**. DuckDB writes it directly; the rows never pass through Julia.

## Construction
```julia
DBInterface.execute(pollis, "COPY (SELECT * FROM sales WHERE year = 2026) TO 'sales_2026.parquet' (FORMAT parquet)")
DBInterface.execute(pollis, "COPY sales TO 'sales.csv' (FORMAT csv, HEADER, DELIMITER ';')")
```

## Formats
- **Parquet** keeps column types, compresses well and is read fast by DuckDB, Arrow, Python and R. `COMPRESSION zstd` shrinks it further.
- **CSV** opens anywhere. Add `HEADER` for column names; set `DELIMITER` and `DATEFORMAT` for the reader's locale.
- **JSON** writes one object per line; add `ARRAY true` for a single JSON array.

## Partitioned Output
`COPY sales TO 'sales' (FORMAT parquet, PARTITION_BY (year, region))` writes a folder per value, so readers can skip whole partitions.

## Strengths and Limits
- Works for results larger than memory.
- An existing file is overwritten without warning.
- The Next Steps read the written file back, so they check what was actually saved.

## See Also
- [Query](query.md) · [Decision Guide](decision-guide.md)
