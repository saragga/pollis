# Drop

**Drop** removes the incomplete parts of a table: the **observations** (rows) that contain a missing value, or the **variables** (columns) that do. Also called complete-case or listwise deletion.

## Construction
```julia
using Impute, Tables
tbl = Tables.columntable(data)
result = Impute.dropobs(tbl)            # keep only complete rows
result = Impute.dropvars(tbl)           # keep only complete columns
```

## How It Works
`dropobs` keeps a row only if every column in it is present; `dropvars` keeps a column only if every row in it is present. Nothing is estimated, so every value left is a real observation.

## How Much Is Lost
Losses compound across columns. With 10 columns each missing 5% of values at random, only about 0.95^10, or 60%, of rows are complete. Run **Missing Summary** first: it reports the number of complete rows.

## Strengths and Limits
- **Honest**: no invented values, and the result is unbiased when the data are MCAR.
- **Wasteful**: a single gap throws away a whole row of otherwise good data.
- **Biased** when missingness depends on the data (MAR or MNAR): the complete rows are then not representative. Check with the MCAR Check.
- Breaks the regular spacing of a **time series**: prefer Interpolate or LOCF there.
- Drop fills nothing, so **Holdout Evaluation** does not apply to it.

## See Also
- [Substitute](substitute.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
