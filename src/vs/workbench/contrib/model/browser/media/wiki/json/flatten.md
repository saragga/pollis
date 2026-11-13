# Flatten

The **Flatten** tab of the JSON Files panel turns a nested JSON document into a table with DuckDB: arrays become rows with `unnest`, objects become columns with dot access, and single values are picked by their path with `->>`.

## How Does DuckDB See a Nested JSON Document?

`read_json` reads a JSON object as a `STRUCT`, with a field per key, and a JSON array as a list. `DESCRIBE SELECT * FROM read_json('data.json')` prints the shape, for example `months STRUCT(month BIGINT, days STRUCT(day BIGINT, ozone BIGINT)[])[]`: `months` is a list of structs, each with a list `days` inside. Reading the shape first tells which arrays must be unnested to reach the values.

## How Do I Turn Nested Arrays into Rows?

```sql
SELECT m.month, d.day, d.ozone
FROM read_json('data.json') AS doc,
	unnest(doc.months) AS u(m),
	unnest(m.days) AS v(d)
```

Each `unnest` in the `FROM` clause turns one array into rows, repeating the values of the levels above: the first gives one row per month, the second one row per day of each month. `m.month` and `d.day` read fields of the structs with a dot. A table with one row per element of the deepest array is the result. An element whose array is empty gives no row; `unnest` drops it.

## How Do I Pick One Value from a JSON Document by Its Path?

`read_json_objects` reads each JSON value as text of type `JSON`, on which the path operators work: `json -> '$.months[0]'` returns JSON, and `json ->> '$.source'` returns text. Paths start at `$`, go into objects with `.name` and into arrays with `[index]`, counting from 0. The operators suit values that sit at a fixed place, such as a status or a page count, and documents whose keys vary too much to read as structs.

## See Also
- [Query](query.md) · [Typed Structs](structs.md) · [Decision Guide](decision-guide.md)
