# Interpretation

A filled table looks complete, but part of it is guesswork. Read the results with that in mind.

## Imputed Values Are Estimates
An imputed value is a best guess, not an observation. Keep a record of which cells were filled, so that you can report it and check whether the conclusions depend on them:

```julia
imputed = map(col -> ismissing.(col), Tables.columntable(data))   # Boolean mask per column
```

## Single Imputation Understates Uncertainty
Every method here fills each gap with one value. Standard errors and p-values computed from the filled table treat those values as if they had been observed, so they are too small. The more you impute, the larger the understatement.

## Effect on Statistics

| Method | Mean | Variance | Correlations |
|---|---|---|---|
| Drop (MCAR) | Unbiased | Unbiased, less precise | Unbiased |
| Substitute (mean) | Unchanged | Shrunk | Weakened |
| Interpolate | Close | Slightly shrunk | Smoothed |
| LOCF / NOCB | Can drift | Shrunk | Can be inflated by repeated values |
| SVD | Close | Slightly shrunk | Largely preserved |

## Sensitivity Analysis
The **Sensitivity Analysis** action recomputes the mean and standard deviation under Drop rows, Substitute (mean), Interpolate and LOCF. If they agree, the conclusion does not depend on how the gaps were handled. If they differ, report the range and explain your choice.

## Holdout RMSE
The RMSE from **Holdout Evaluation** and **Method Comparison** is in the units of the column. Compare it with the column's standard deviation: an RMSE of half the standard deviation means the method recovers hidden values much better than guessing the mean would.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
