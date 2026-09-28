# Chunks

`CSV.Chunks` splits a file into `ntasks` **byte ranges** and parses each one lazily as a typed `CSV.File`. Only one chunk is in memory at a time.

## Construction
```julia
using CSV, Tables

sums = map(CSV.Chunks("big.csv"; ntasks = 8)) do chunk
	v = collect(skipmissing(Tables.getcolumn(chunk, :price)))
	(n = length(v), total = sum(v))
end
mean_price = sum(s.total for s in sums) / sum(s.n for s in sums)
```
Compute a **small summary per chunk** (counts, sums, minima, a filtered subset) and combine the summaries at the end, in the style of map-reduce.

## Choosing ntasks
More chunks means less memory per chunk: pick `ntasks` so that the file size divided by `ntasks`, expanded a few times once parsed, fits comfortably in memory. Type inference runs on each chunk separately, so make sure every chunk infers the same types (set `types` if not).

## Strengths and Limits
- Typed columns like [Read](read.md), with bounded memory.
- Fails on files too small to split into `ntasks` pieces: read those with `CSV.File` (the panel code falls back automatically).
- Rows are split by bytes, so chunk sizes differ slightly.

## See Also
- [Stream Rows](rows.md) · [Read](read.md) · [Decision Guide](decision-guide.md)
