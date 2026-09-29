# Handle Missing Data — Factsheet

**Missing-data handling** decides what to do with the empty cells of a table before analysis: remove the incomplete rows or columns, or **impute** (fill in) plausible values. Every choice changes the data a model will see, so it should be deliberate and checked.

| | |
|---|---|
| **Purpose** | Turn a table with `missing` values into one that downstream methods can use |
| **Input** | Any Tables.jl source (a CSV.File, a NamedTuple of vectors, a query result), rows in their natural order |
| **Core packages** | [Impute.jl](https://github.com/invenia/Impute.jl), [Missings.jl](https://github.com/JuliaData/Missings.jl), [Tables.jl](https://github.com/JuliaData/Tables.jl) |
| **Methods** | Drop, Substitute, Interpolate, LOCF / NOCB, SVD |
| **Output** | A NamedTuple of column vectors with the gaps removed or filled |
| **Key parameter** | The method itself; then the statistic (Substitute), the direction (LOCF / NOCB) or the rank (SVD) |

## When to Use

- A model or statistic **cannot take missing values** (most of them cannot).
- You want to **compare** how sensitive a result is to the way the gaps are treated.
- A time series has **short gaps** that should be bridged before plotting or forecasting.

## What It Is Not

Imputation does not recover the true values: it produces plausible ones, and it makes the data look more certain than it is. It is not multiple imputation either: each method here gives one filled table, so standard errors computed afterwards ignore the imputation uncertainty. And no method fixes data that are missing for a reason related to the missing value itself; see [Assumptions](assumptions.md).

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Substitute](substitute.md)
