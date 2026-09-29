# SVD

**SVD imputation** fills the gaps of a numeric matrix with a **low-rank approximation** of it, built from the singular value decomposition. Each imputed value draws on the patterns shared by all the columns.

## Construction
```julia
using Impute, Tables
tbl = Tables.columntable(data)
X = Matrix{Union{Float64, Missing}}(Tables.matrix(tbl))
M = Impute.svd(X; rank=2)              # completed matrix
result = Tables.columntable(Tables.table(M; header=collect(keys(tbl))))
```

All columns must be numeric, and the rank must be smaller than the number of columns.

## How It Works
1. Start by filling the gaps with a simple guess (the column means).
2. Compute the SVD of the filled matrix and keep only the first `rank` components.
3. Replace the imputed cells with the values of that low-rank reconstruction; keep the observed cells as they are.
4. Repeat until the imputed values stop changing.

## Choosing the Rank
The rank is the number of underlying patterns assumed to drive the columns. Low ranks (1 to 3) give smooth, conservative fills; higher ranks follow the data more closely but can overfit the noise. Use **Holdout Evaluation** at a few ranks and keep the one with the lowest RMSE.

## Strengths and Limits
- Uses the **relations between variables**, so it preserves correlations far better than Substitute.
- Works well for many correlated measurements: sensor arrays, panels of economic indicators, ratings.
- Needs all-numeric columns on comparable scales; standardise them first if their units differ widely.
- Gives little benefit when the columns are unrelated, and struggles when most of a row is missing.

## See Also
- [Substitute](substitute.md) · [Interpolate](interpolate.md) · [Diagnostics](diagnostics.md)
