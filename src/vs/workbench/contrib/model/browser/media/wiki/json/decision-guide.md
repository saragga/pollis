# Decision Guide

## Which Tab of the JSON Files Panel Should I Use?

| Situation | Tab | Why that tab |
|---|---|---|
| A file of records with the same keys, JSON Lines or an array | **Query** | DuckDB reads the records as a table and filters them with SQL |
| A file of records larger than memory | **Query** | DuckDB reads the file in pieces and keeps only what the query needs |
| A nested answer to be analysed as a table | **Flatten** | `unnest` turns each array into rows, in one SQL statement |
| A nested answer whose structure the code works with | **Typed Structs** | JSON.jl reads the document into structs and stops at the first field that does not fit |
| A table to be saved for a web service or another language | **Write** | JSON Lines or an array of records, as the receiving side expects |

## Should Nested JSON Be Flattened or Read into Structs?

Flatten the document with DuckDB when the next step is a table: a plot, a regression, a join with other data. Read the document into Julia structs with JSON.jl when the code follows its structure, for example a function that takes one `Month` at a time, or when a document of the wrong shape should be refused at once rather than produce empty columns. The **Typed Structs** tab ends with a flattened table too, so both tabs can feed the same Next Steps.

## Which Layout Should a Written JSON File Have?

| Layout | Shape | When to choose the layout |
|---|---|---|
| **JSON Lines** | One object per line | Large tables, appending, tools that read line by line |
| **Array of records** | `[{...}, {...}]` | Web services and JavaScript code that expect one JSON value |
| **Columns** | `{"col": [...], ...}` | Compact files of numbers, read by plotting libraries in the browser |

## When Is JSON the Wrong Format for a Table?

For a table that will be read many times, Parquet is smaller, faster and keeps the column types, and CSV is smaller and opens in a spreadsheet. JSON is worth its size when the receiving side expects JSON, when the data is nested, or when the records differ in their keys. The **Save as Parquet** action in **Export** converts the table once it is read.

## See Also
- [Overview](overview.md) · [Flatten](flatten.md) · [Typed Structs](structs.md)
