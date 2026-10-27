# Diagnostics

## KKT Conditions
The **Karush-Kuhn-Tucker conditions** say exactly when x solves the problem. With w = A'(b - A x), the direction in which the fit would improve:

- **Primal feasibility**: every x_j >= 0.
- **Dual feasibility**: every w_j <= 0. No component could be increased to improve the fit.
- **Complementary slackness**: w_j x_j = 0 for every j. A positive component has w_j = 0 (it is at its least-squares value); a component at zero has w_j <= 0 (pushing it up would make the fit worse).

The action prints all three. Its tolerance, 1e-8, is absolute: when A or b are large in magnitude, a w_j slightly above it can be rounding, not a failure; compare it with the size of A'b.

## Residual Analysis
The residual norm ||A x - b||, the largest single error, and the mean absolute error. Plot the residuals against the observation index (the wavelength, the time): **noise** scatters evenly; **structure**, such as a peak or a slope, means a missing pattern in A or a baseline not removed.

## Fitted vs Observed
A x against b. Points on the dashed line mean a good fit; points bending away from it at large values point to saturation or a non-linear response.

## Quick Checklist

| Check | Action | Good sign | Warning sign |
|---|---|---|---|
| Optimality | KKT Conditions | All three hold | Dual feasibility fails: the solver stopped early |
| Fit | Relative Residual | Small, close to the noise level | Large |
| Missing patterns | Residual Analysis | Residuals look like noise | Peaks or trends in the residuals |
| Linearity | Fitted vs Observed | Points on the line | A curve |
| Effect of the constraint | Active Set, against ordinary least squares | Zeros where expected | Many zeros among nearly identical columns |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Algorithms](algorithms.md)
