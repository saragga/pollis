# LOCF / NOCB

**Last Observation Carried Forward (LOCF)** fills each missing value with the most recent observed value above it. **Next Observation Carried Backward (NOCB)** fills it with the next observed value below it.

## Construction
```julia
using Impute, Tables
tbl = Tables.columntable(data)
result = Impute.locf(tbl)               # carry the last value forward
result = Impute.nocb(tbl)               # carry the next value backward
```

## How It Works
The column is read from top to bottom (LOCF) or from bottom to top (NOCB), and every gap takes the last value seen. The filled series is a staircase: flat through each gap, then a jump.

## Edge Gaps

| Direction | Cannot fill |
|---|---|
| LOCF | Leading gaps (nothing observed before them) |
| NOCB | Trailing gaps (nothing observed after them) |

Chain them to fill both ends: `Impute.locf(tbl) |> Impute.nocb`, which is what the **Chain Fill** action does.

## When It Fits
- **Step-like data**: prices between trades, account balances, a patient's status, a setting that stays until changed.
- **Short gaps** in any ordered series.
- **Real-time use**: LOCF uses only the past, so it never leaks future information into a forecast; NOCB does.

## Strengths and Limits
- Simple, and the filled values are values that really occurred.
- Long gaps become long flat stretches that understate variability.
- In longitudinal studies LOCF is known to bias estimates of change over time; use it with care there.

## See Also
- [Interpolate](interpolate.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
