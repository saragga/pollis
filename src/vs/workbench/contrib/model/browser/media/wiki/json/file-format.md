# File Format

JSON is defined by IETF RFC 8259 ([Bray (2017)](#ref-Bra2017a)). A JSON text is one value; files of records also come as JSON Lines, many values one after another.

## What Values Can JSON Hold?

| JSON value | Written as | Julia value (JSON.jl) | DuckDB type |
|---|---|---|---|
| Object | `{"name": value, ...}` | `JSON.Object`, or a struct | `STRUCT`, or `JSON` when keys vary |
| Array | `[value, ...]` | `Vector`, or a typed vector | a list, such as `BIGINT[]` |
| String | `"text"` in UTF-8 | `String` | `VARCHAR` |
| Number | `42`, `-1.5`, `6.02e23` | `Int64` or `Float64` | `BIGINT` or `DOUBLE` |
| Boolean | `true`, `false` | `Bool` | `BOOLEAN` |
| Null | `null` | `nothing`, or `missing` in a struct field that allows it | `NULL` |

An object's names are strings; the order of the names carries no meaning, and the specification leaves duplicate names undefined.

## What Is JSON Lines?

JSON Lines, also called newline-delimited JSON (NDJSON), puts one JSON value per line, usually one object per record, in a file ending in `.jsonl` or `.ndjson`. A program can read the file one line at a time, append a record without rewriting the file, and split the file anywhere between lines. Logs, exports of document databases and many machine learning datasets use JSON Lines. JSON.jl's `JSON.parsefile`, from version 1.0, recognises the two endings and returns a vector of the records; DuckDB's `read_json` detects the layout by itself.

## What Does JSON Leave Out?

JSON has no date type: dates travel as strings, often in the ISO 8601 form `"2024-07-01"`, and DuckDB turns such strings into `DATE` when every value fits. JSON has no way to write `NaN` or infinity, and no distinction between integers and decimals; a reader decides from the digits. A number larger than 2^53 may lose digits in JavaScript, which is why some services send large identifiers as strings.

## References

<a id="ref-Bra2017a"></a>Bray, T. (2017). The JavaScript Object Notation (JSON) data interchange format. IETF RFC 8259. [doi:10.17487/RFC8259](https://doi.org/10.17487/RFC8259)

## See Also
- [Factsheet](factsheet.md) · [Query](query.md) · [Typed Structs](structs.md)
