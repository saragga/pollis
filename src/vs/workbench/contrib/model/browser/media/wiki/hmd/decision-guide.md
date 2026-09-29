# Decision Guide

| Situation | Method | Why |
|---|---|---|
| Few missing values in a large dataset, plausibly MCAR | **Drop** ([Drop](drop.md)) | Nothing is invented; little data is lost |
| A column that is mostly empty | **Drop** (columns) | Too little information to impute it |
| A fast baseline for tabular data | **Substitute** ([Substitute](substitute.md)) | Simple, never fails |
| Categorical columns | **Substitute** (mode) | Mean and median need numbers |
| A time series that changes smoothly | **Interpolate** ([Interpolate](interpolate.md)) | Bridges gaps along the trend |
| Short gaps in step-like data (prices, statuses) | **LOCF / NOCB** ([LOCF / NOCB](locf.md)) | The last known value is the best guess |
| Many correlated numeric variables | **SVD** ([SVD](svd.md)) | Borrows strength across columns |

## Decision Flow

1. **How much is missing?** A few percent of rows, and the MCAR Check is clean: Drop is fine.
2. **Are the rows ordered in time?** Use Interpolate for smooth series, LOCF / NOCB for step-like ones; finish with Chain Fill to close the ends.
3. **Are there several correlated numeric columns?** Try SVD.
4. **Otherwise**, use Substitute, preferring the median for skewed columns and the mode for categorical ones.
5. **Not sure?** Run Method Comparison and pick the lowest holdout RMSE, then confirm with Sensitivity Analysis.

## Rules of Thumb
- **Never impute the outcome variable** you are about to model, unless you know what you are doing.
- **Substitute shrinks variance and weakens correlations**: avoid it when relations between variables are the point of the analysis.
- **Report what you did**: how many values were missing, which method filled them, and whether the results change with another method.

## See Also
- [Drop](drop.md) · [Substitute](substitute.md) · [Interpolate](interpolate.md)
