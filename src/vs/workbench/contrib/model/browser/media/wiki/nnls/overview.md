# Overview

This webview solves **non-negative least squares** (NNLS): find the vector x that makes A x as close as possible to b, in the sense of the smallest sum of squared differences, with every component of x at least zero.

    minimise ||A x - b||^2   subject to   x >= 0

Each column of A is a known pattern (a component spectrum, a basis signal, a source profile), b is what was measured, and x says how much of each pattern the measurement contains. When amounts cannot be negative, ordinary least squares can still give negative values, especially when the patterns overlap; NNLS gives the best fit among the answers that make sense.

## What the Panel Does
- Solves the problem with `nonneg_lsq` from NonNegLeastSquares.jl, with one of four algorithms (see [Algorithms](algorithms.md)).
- Prints the solution, the residual norm and the number of nonzero components.
- Accepts a matrix b with k columns: k problems with the same A, solved at once, one column of the solution per column of b.

## Common Workflow

1. Solve with the default algorithm, `:pivot`.
2. Run **KKT Conditions** to confirm the solution is optimal, and **Residual Analysis** and **Fitted vs Observed** to see how well it fits.
3. Read the solution with **Active Set** and **Solution Sparsity**: which components are present, and which the constraint set to zero.
4. Compare with ordinary least squares: if it already gives no negative values, the constraint changed nothing.
5. Report the **Relative Residual**, which does not depend on the units of b.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Algorithms](algorithms.md)
