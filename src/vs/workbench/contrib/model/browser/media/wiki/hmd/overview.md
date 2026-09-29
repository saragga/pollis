# Overview

This webview offers five ways to deal with missing values, from the simplest (throw the incomplete data away) to a low-rank matrix completion. Every method starts from the same step:

```julia
using Impute, Tables
tbl = Tables.columntable(data)          # NamedTuple of column vectors
```

## Drop
Removes the **rows** (observations) or the **columns** (variables) that contain a missing value, with `Impute.dropobs` or `Impute.dropvars`. Nothing is invented, but data are lost. See [Drop](drop.md).

## Substitute
Replaces each missing value with a **statistic of its column**: the mean, the median or the mode. The quickest baseline for tabular data. See [Substitute](substitute.md).

## Interpolate
Fills each gap with a **straight line** between the neighbouring observed values, with `Impute.interp`. Suited to series that change smoothly. See [Interpolate](interpolate.md).

## LOCF / NOCB
**Last Observation Carried Forward** repeats the previous value; **Next Observation Carried Backward** repeats the next one. Suited to step-like series such as prices or statuses. See [LOCF / NOCB](locf.md).

## SVD
Fills the gaps from a **low-rank approximation** of the whole numeric matrix, so that each imputed value borrows strength from the correlated columns. See [SVD](svd.md).

## Common Workflow

1. Run **Missing Summary** to see how much is missing, and where.
2. Run the **MCAR Check** to see whether rows with gaps look different from complete ones.
3. Pick a method with the [Decision Guide](decision-guide.md).
4. Run **Method Comparison** to compare the holdout error of the candidate methods.
5. Check the result with **Distribution Shift** and **Sensitivity Analysis** before moving on.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Drop](drop.md)
