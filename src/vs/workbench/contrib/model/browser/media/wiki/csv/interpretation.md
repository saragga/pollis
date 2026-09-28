# Interpretation

## The Schema
`Tables.schema(file)` lists every column name with its element type:
- `Int64`, `Float64`, `Bool`: parsed numbers and booleans (`true`/`false`, or other words listed in `truestrings` and `falsestrings`).
- `Union{Missing, Float64}`: numbers with at least one missing value.
- `String1` to `String255`: **fixed-size inline strings** from InlineStrings.jl. CSV.jl uses them for short text because they are stored without pointers and are much faster. They behave like `String`; convert with `String.(col)` if a package insists on `String`. Pass `stringtype = String` to disable them.
- `Date`, `DateTime`, `Time`: values that matched `dateformat`.

## Pooled Columns
Text columns with few distinct values (under 20% of the rows and at most 500 values) are **pooled**: each value is stored once and the column holds small integer codes. This saves memory and speeds up grouping. Set `pool = false` to disable.

## Stream Rows Output
`CSV.Rows` returns **untyped** values, `PosLenString` views into the file buffer, which are only valid until the next row is read when `reusebuffer = true`. Pass `types` to get typed values (much faster than calling `parse` on each string), or copy the strings you keep with `String(row.city)`.

## Chunk Sizes
`CSV.Chunks` splits the file by **bytes**, not rows, so chunks have slightly different row counts. Every row belongs to exactly one chunk; the sizes always add up to the total.

## Timings
The first call to any CSV.jl function includes compilation. Compare timings on the second call (the Reader Comparison action does this). Parallel parsing only helps when Julia is started with several threads (`julia --threads=auto`).

## See Also
- [Diagnostics](diagnostics.md) · [Overview](overview.md)
