# Overview

CSV.jl offers four entry points. All of them parse the same format with the same options (delimiter, header, missing strings, decimal mark, date format); they differ in **how much of the file is in memory at once** and in **what you get back**.

## Read
`CSV.File` parses the whole file into **typed columns**. It samples rows to infer each column type, uses several threads on large files and returns an object that is itself a Tables.jl table. Convert it with `Tables.columntable` to get a named tuple of vectors. See [Read](read.md).

## Write
`CSV.write` takes **any Tables.jl source** (a named tuple of vectors, a `CSV.File`, a query result) and writes it as delimited text, optionally compressed. See [Write](write.md).

## Stream Rows
`CSV.Rows` iterates **one row at a time**, reusing a single buffer. Values come back as strings (or `missing`) unless you give `types`. Memory use stays constant however large the file. See [Stream Rows](rows.md).

## Chunks
`CSV.Chunks` splits the file into **byte ranges** and parses each one as a typed `CSV.File`. You process one chunk, keep a small summary, and move on. See [Chunks](chunks.md).

## Common Workflow

1. Look at the first lines of the file (delimiter, header, decimal mark, how missing values are written).
2. Read it with matching options, or stream it if it does not fit in memory.
3. Check the schema: every column should have the type you expect (**Schema Check**).
4. Check that no rows were lost or merged (**Row Count Check**, **Strict Parse**).
5. Convert to a named tuple of vectors with `Tables.columntable` and pass it on.

## See Also
- [File Format](file-format.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
