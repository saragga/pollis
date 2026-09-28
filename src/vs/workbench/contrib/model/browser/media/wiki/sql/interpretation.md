# Interpretation

## Column Summary
The Interpret action runs DuckDB's `SUMMARIZE`, which describes every column of the result in one pass:

| Field | Meaning |
|---|---|
| `column_type` | The SQL type: `BIGINT`, `DOUBLE`, `VARCHAR`, `DATE`, ... |
| `min`, `max` | Range of the values (alphabetical for text) |
| `approx_unique` | Approximate number of distinct values (HyperLogLog), cheap on large tables |
| `avg`, `std`, quartiles | For numeric columns |
| `null_percentage` | Share of missing values |

Read it as a sanity check before any analysis: is the range plausible, is a column that should be an identifier really unique (`approx_unique` close to the row count), is a category column small?

## SQL vs Julia
The Compare action times the same mean computed in DuckDB and in Julia. DuckDB wins when the rows would have to be **fetched** first: it aggregates where the data lives and returns a single number. Julia wins once the columns are already in memory, and for anything SQL cannot express. A good default is: **filter and aggregate in SQL, model in Julia**.

## Result Types
DuckDB types map to Julia types: `BIGINT` → `Int64`, `DOUBLE` → `Float64`, `VARCHAR` → `String`, `DATE` → `Dates.Date`, `DECIMAL` → `FixedDecimal`, and every nullable column → `Union{Missing, T}`. Use `nonmissingtype(eltype(col))` to get `T`.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
