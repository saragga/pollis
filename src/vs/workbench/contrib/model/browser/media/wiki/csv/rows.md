# Stream Rows

`CSV.Rows` iterates over a file **one row at a time**. With `reusebuffer = true` it reuses a single row buffer, so memory stays constant however large the file is.

## Construction
```julia
using CSV

function total_price(path)
	total = 0.0
	for row in CSV.Rows(path; types = [Int, Float64, String], reusebuffer = true)  # one type per column
		ismissing(row.price) || (total += row.price)
	end
	total
end
total_price("big.csv")
```
Without `types`, values are **untyped**: each is a string view (`PosLenString`) or `missing`. Pass `types` whenever you compute with the values: calling `parse` on each string yourself is many times slower. Wrapping the loop in a function keeps the running total local and fast.

## Typical Uses
- **Count** rows, or rows that satisfy a condition.
- **Filter** a huge file into a smaller one without loading it: `CSV.write("small.csv", Iterators.filter(row -> row.city == "Porto", CSV.Rows("big.csv")))`.
- **Running totals** and other one-pass summaries.

## Strengths and Limits
- Constant memory; works on files of any size.
- No type inference and no multithreading, so it is slower per row than [Read](read.md). For column-wise statistics, [Chunks](chunks.md) is usually faster.
- With `reusebuffer = true`, a row is only valid until the next one is read: copy what you keep.

## See Also
- [Chunks](chunks.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
