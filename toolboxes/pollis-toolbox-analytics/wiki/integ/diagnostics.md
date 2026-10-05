# Integration — Diagnostics

## Convergence Study

Plot the error against the number of points on log-log axes. For smooth integrands:

| Method | Slope | Halving $h$ divides the error by |
|---|---|---|
| Trapezoid, midpoint | $-2$ | 4 |
| Simpson | $-4$ | 16 |
| Gauss-Legendre | Curves steeply down | Much more, until machine precision |
| Monte Carlo | $-1/2$ | $\sqrt{2}$ (per doubling of $N$) |

A shallower slope than expected means the integrand is less smooth than assumed: a kink, a singularity or a discontinuity.

## Error Estimates

- **QuadGK and HCubature** return an estimated absolute error; a relative error estimate far above the requested tolerance means the maximum number of evaluations was reached.
- **Monte Carlo** returns a standard error: the true value lies within two standard errors about 95% of the time.
- **Fixed rules** return no estimate. Compare $n$ and $2n$: for the trapezoid rule, $(T_{h} - T_{2h})/3$ estimates the error of $T_h$ (**Richardson extrapolation**), and $T_h + (T_h - T_{2h})/3$ is Simpson's rule.

## Integrand Check

| Symptom | Likely cause | Fix |
|---|---|---|
| `NaN` or `Inf` values | Singularity or outside the domain | Move it to a limit; check the formula |
| Many sign changes | Positive and negative area cancel | Report $\int |f|$ as well (Integral Summary) |
| Huge values near a limit | Endpoint singularity | QuadGK copes if integrable; fixed rules do not |
| Very many evaluations | Spike, kink or slow decay at infinity | Split at the difficult point |

## Cross-Checks

- One variable: evaluate an antiderivative at the limits (fundamental theorem).
- Several variables: compute iterated integrals in both orders; they must agree (Fubini's theorem).
- Data: integrate a smooth fit exactly and compare with the rule.

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
