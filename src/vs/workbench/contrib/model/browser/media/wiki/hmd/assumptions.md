# Assumptions

Whether a missing-data method gives sensible results depends mostly on **why** the values are missing. Statisticians distinguish three mechanisms.

## Missing Completely at Random (MCAR)
The chance that a value is missing has nothing to do with the data: a sensor drops readings at random, a page of a form is lost. Under MCAR, dropping rows loses precision but does not bias the result, and every method here is reasonable.

## Missing at Random (MAR)
The chance of missingness depends on **other, observed** variables: older respondents skip an online question more often, and age is recorded. Dropping rows is now biased; methods that use the other columns (SVD) or the order of the rows (Interpolate, LOCF) can do better.

## Missing Not at Random (MNAR)
The chance of missingness depends on the **missing value itself**: people with high incomes decline to report their income. No method in this webview can correct for this, because the data carry no trace of the mechanism. Say so in your report, and consider a sensitivity analysis.

The **MCAR Check** action gives a quick hint (see [Diagnostics](diagnostics.md)), but no test can prove MCAR, and none can tell MAR from MNAR.

## Method-Specific Assumptions

| Method | Assumes |
|---|---|
| Drop | MCAR, and enough data left afterwards |
| Substitute | The column's centre is a fair guess for any missing entry |
| Interpolate | Rows are in time (or spatial) order and the series changes smoothly |
| LOCF / NOCB | Rows are ordered and values stay constant until they change |
| SVD | Numeric columns that are correlated (an approximately low-rank matrix) |

## Rows in Natural Order
Interpolate and LOCF / NOCB work down each column in the order the rows arrive. Sort the table by time first:

```julia
using Tables
tbl = Tables.columntable(data)
p = sortperm(tbl.date)
tbl = map(col -> col[p], tbl)           # every column reordered by date
```

## See Also
- [Diagnostics](diagnostics.md) · [Drop](drop.md) · [Decision Guide](decision-guide.md)
