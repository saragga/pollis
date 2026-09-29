# Interpolate

**Interpolate** fills each gap in a column with values on the **straight line** between the last observed value before it and the first one after it.

## Construction
```julia
using Impute, Tables
tbl = Tables.columntable(data)
result = Impute.interp(tbl)
```

## How It Works
For a gap of k values between observed values a and b, the filled values step evenly from a to b in k + 1 equal increments. A single missing value between 10 and 14 becomes 12. The interpolation uses the **row position**, not a time column, so the rows should be ordered and evenly spaced.

## Leading and Trailing Gaps
There is nothing to interpolate towards before the first observed value or after the last one, so those gaps remain missing. Close them with LOCF / NOCB, as the **Chain Fill** action does:

```julia
result = Impute.interp(tbl) |> Impute.locf |> Impute.nocb
```

## Strengths and Limits
- Follows the local trend, so it suits smoothly changing series (temperatures, levels, cumulative totals).
- Uses only the neighbours in the same column; it ignores the other variables.
- Smooths away genuine variation inside long gaps, and makes no sense for unordered rows.
- For curved interpolation, or irregularly spaced times, see the Interpolate Data webview.

## See Also
- [LOCF / NOCB](locf.md) · [Substitute](substitute.md) · [Decision Guide](decision-guide.md)
