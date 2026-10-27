# Decision Guide

| Situation | Method | Why |
|---|---|---|
| Amounts that cannot be negative, a linear model | **NNLS** | The best fit among the answers that make sense |
| Signs free | **Ordinary least squares** | No constraint needed; standard errors available |
| Amounts that must also sum to one (proportions, portfolio weights) | **Simplex-constrained least squares** | NNLS constrains signs only |
| Lower and upper limits on each amount | **Bound-constrained least squares** | A general box constraint |
| Many candidate patterns, few observations | **Non-negative lasso** | A penalty chooses among similar columns |
| Patterns unknown, many measurements | **Non-negative matrix factorisation** | Learns A and x together, alternating NNLS problems |

## Decision Flow

1. **Is the sign constraint physical?** If the amounts can be negative, use ordinary least squares.
2. **Fit ordinary least squares first.** If no coefficient is negative, NNLS gives the same answer.
3. **Solve NNLS** with `:pivot`, and check the KKT conditions.
4. **Are there other constraints**, a sum or upper bounds? Move to a general constrained solver, such as JuMP with a quadratic solver.
5. **Many right-hand sides?** Pass b as a matrix and use variant `:comb`.

## Rules of Thumb
- **Weight the rows** by the inverse of their noise level before solving, when it varies.
- **Remove baselines** from b before solving, or add a column for them: there is no free intercept.
- **Distrust the split between nearly identical columns**: when two patterns look alike, read their sum, not their parts.
- **The algorithm changes the speed, not the answer**: if two algorithms disagree, A is rank deficient.

## See Also
- [Overview](overview.md) · [Factsheet](factsheet.md) · [Algorithms](algorithms.md)
