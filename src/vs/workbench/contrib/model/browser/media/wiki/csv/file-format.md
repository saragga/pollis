# File Format

CSV looks simple, but there is no single standard. RFC 4180 describes the common core; everything else (delimiter, decimal mark, dates, missing values, encoding) varies by the tool that wrote the file. CSV.jl detects what it can and relies on options for the rest.

## What CSV.jl Assumes
- **Encoding**: UTF-8 (ASCII is a subset). Files from older Windows tools may be Latin-1 or UTF-16 and show garbled characters; convert them first.
- **One delimiter** throughout the file. Without `delim`, it is detected from the first lines among comma, tab, semicolon, pipe and space.
- **Quoting**: fields that contain the delimiter or a line break are wrapped in double quotes, and a quote inside a quoted field is doubled (`""`). Set `quotechar` and `escapechar` for other conventions.
- **Header**: the first line holds the column names (`header = 1`). Use `header = false` for files without one, or `header = n` if junk lines come first. Names that are not valid Julia identifiers are kept as they are unless `normalizenames = true`.
- **Same number of fields** on every row. Short rows are padded with `missing`; long rows add extra columns (`Column4`, ...) filled with `missing` elsewhere. Both print a warning.

## Regional Conventions
Many European exports use a **semicolon delimiter** and a **decimal comma** (`1,5`). Read them with `delim = ';'` and `decimal = ','`. Never combine a decimal comma with a comma delimiter: the two are indistinguishable.

## Missing Values
An empty field is `missing` by default. Other markers (`NA`, `NULL`, `-999`, `.`) must be listed in `missingstring`, for example `missingstring = ["", "NA"]`. Listing a marker replaces the default, so include `""` if empty fields should stay missing.

## Dates
Columns are parsed as `Date` or `DateTime` only if they match `dateformat` (ISO `yyyy-mm-dd` by default). A column of `dd/mm/yyyy` dates read without the right format stays a string column.

## Type Inference
Each column gets the narrowest type that fits every sampled value: `Int64`, `Float64`, `Bool`, `Date`, `DateTime`, `Time` or a string. If a single value does not fit (a stray `n/a` in a number column), the whole column becomes a string. Fix it with `missingstring`, or force a type with `types = Dict(:price => Float64)`.

## See Also
- [Diagnostics](diagnostics.md) · [Read](read.md) · [Interpretation](interpretation.md)
