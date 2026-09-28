# Diagnostics

Most CSV problems are **silent**: the file loads, but with the wrong types, merged columns or lost rows. Check the result before analysing it.

## Schema Check
Look at the type of every column. Warning signs:
- A column you expected to be numeric is a **string**: the decimal mark or delimiter is wrong, or a missing-value marker is not in `missingstring`. The Schema Check action flags text columns whose values look like numbers.
- A date column is a **string**: `dateformat` does not match. The action flags text columns that look like dates.
- There is **only one column**: the delimiter was not detected. Set `delim`.
- A column has **far more missing values** than expected: a missing marker or the decimal mark is wrong.

## Row Count Check
Compare the number of lines in the file with the number of rows parsed. They should differ by exactly the number of header lines. A gap means blank lines, **quoted line breaks** inside fields (legitimate, but worth knowing), comment lines or a footer (skip it with `footerskip`).

## Strict Parse
By default CSV.jl turns values it cannot parse into `missing` and prints a warning. Re-reading with `strict = true` stops at the **first bad value** and reports its row and column, so you can see exactly what broke.

## Round-Trip Check
Write the table and read it back. Every column should come back identical. Differences reveal values that CSV cannot represent faithfully: string columns that look like numbers (leading zeros in postal codes are lost), floating-point formatting, or time zones.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Schema | Expected types | Numbers or dates read as strings; one column |
| Missing counts | Plausible | A whole column missing |
| Row count | Lines = rows + header | Rows lost or merged |
| Strict parse | No errors | First bad value reported |
| Round trip | All identical | Changed columns |

## See Also
- [File Format](file-format.md) · [Interpretation](interpretation.md)
