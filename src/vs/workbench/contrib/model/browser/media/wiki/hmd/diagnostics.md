# Diagnostics

Check the data before choosing a method, and check the filled table after.

## Before: How Much Is Missing, and Where?
The **Missing Summary** action counts the missing values in each column and the number of complete rows. The **Missing Heatmap** shows the pattern: scattered dots suggest random gaps; whole rows or blocks suggest a systematic cause (a sensor outage, a question added later).

```julia
using Tables
tbl = Tables.columntable(data)
for (name, col) in pairs(tbl)
	println(name, ": ", count(ismissing, col), " missing")
end
```

## Before: MCAR Check
For each column with gaps, the **MCAR Check** compares every other numeric column between the rows where that value is missing and the rows where it is present, as a standardised mean difference d. |d| > 0.5 is flagged: the incomplete rows look different, so the data are probably not MCAR and dropping rows would bias the result. This is a heuristic, not Little's formal MCAR test.

## After: Holdout Evaluation
The **Holdout Evaluation** action hides 20% of the observed values, fills them with the chosen method, and reports the RMSE against the hidden truth, next to the column's standard deviation. An RMSE well below the standard deviation means the method is doing better than a blind guess. It does not apply to Drop, which fills nothing.

## After: Leftover Gaps
Interpolate cannot fill leading or trailing gaps, LOCF cannot fill leading gaps and NOCB cannot fill trailing ones. Count the missing values again after imputing; the **Chain Fill** action closes both ends with `Impute.locf` followed by `Impute.nocb`.

## After: Distribution Shift
The **Distribution Shift** action overlays the histograms before and after. A tall spike at the column mean is the signature of Substitute; a narrower distribution means the variance has shrunk.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Missing Summary | A few percent, spread over columns | Most of one column, or few complete rows |
| MCAR Check | All \|d\| < 0.5 | Several \|d\| > 0.5 |
| Holdout RMSE | Well below the column std | Close to or above the std |
| Leftover gaps | None | Missing values at the ends |
| Distribution Shift | Similar shape | Spike or narrowing |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Substitute](substitute.md)
