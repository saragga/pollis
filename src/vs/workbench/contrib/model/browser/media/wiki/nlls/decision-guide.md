# Decision Guide

| Situation | Solver |
|---|---|
| The default for curve fitting; uncertain start | **Levenberg-Marquardt** |
| Well-scaled problem, fewer iterations wanted | **Dogleg** |
| Small residuals and a good start | **Gauss-Newton** |
| Model linear in the parameters | Linear regression, not this panel |
| Outliers in the data | A robust loss (Huber) or Quantile Regression |
| Non-constant error variance | Weighted least squares |

## Decision Flow

1. **Choose a good p0**: from the data (the value at t = 0, a rough slope or half-life) or from a linearised fit, such as log y against t for an exponential decay.
2. **Fit with Levenberg-Marquardt** and check **converged** and the **Gradient Norm**.
3. **Inspect the residuals**: change the model if they show a pattern.
4. **Check the Condition Number** and the correlations: simplify or reparameterise if parameters are not identified.
5. **Report** the estimates with their standard errors and intervals.
6. **Confirm** with **Compare Solvers** and the **Starting-Point Study**.

## Rules of Thumb

- **Reparameterise positive parameters** as exp(q), so that the solver cannot step to invalid values.
- **Scale the parameters** to similar magnitudes; it helps Dogleg and Gauss-Newton especially.
- **Linearised intervals** are fine when the correlation between estimates is moderate and m - n is reasonable; otherwise use the bootstrap.
- **Disagreement between solvers** is a warning, not a choice to be made by SSR alone.
- **Never extrapolate far** beyond the inputs without good reason to trust the model's form.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
