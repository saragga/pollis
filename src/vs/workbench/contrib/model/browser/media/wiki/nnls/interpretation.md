# Interpretation

## The Solution
Each x_j is the **amount of pattern j** in the measurement, in the units that make column j of A times x_j comparable with b. If column j is the spectrum of a substance at unit concentration, x_j is its concentration.

## Active Set and Sparsity
**Active Set** lists the components that are positive and those held at zero; **Solution Sparsity** gives the share at zero.

- A component at **zero** means that any positive amount of it would make the fit worse: the data give no evidence for it. It does not prove that it is absent; a small amount can hide under noise or under a similar column.
- **Sparsity comes free**: there is always a solution with no more positive components than the rank of A, and under conditions on A, NNLS recovers sparse non-negative signals without the tuning parameter of the lasso (Slawski and Hein, 2013).
- If the constraint holds no component at zero, the solution equals ordinary least squares, and the constraint changed nothing.

## Residuals
- The **residual norm** ||A x - b|| is in the units of b. For pure noise with standard deviation s, expect about s times the square root of m (the number of observations, less the number of positive components).
- The **Relative Residual**, ||A x - b|| / ||b||, has no units: 0.01 means the fit misses 1% of the size of the measurement.

## Uncertainty
NNLS gives no standard errors. To see how stable the amounts are, perturb b with noise of the measured size, or resample the rows, and solve again many times. Components that move between zero and positive across the runs are not identified by the data. Intervals for components near zero are not symmetric, so report percentiles, not a plus-or-minus.

## See Also
- [Diagnostics](diagnostics.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
