# Integration — Decision Guide

## Which Method?

| Situation | Method | Why |
|---|---|---|
| A formula in one variable, any limits | **Adaptive Gauss-Kronrod** (QuadGK) | Error control, handles infinite limits and endpoint singularities |
| Smooth $f$, finite limits, many integrals of the same kind | **Gauss-Legendre** | Fixed cost, very accurate for analytic $f$ |
| Teaching, or matching a textbook formula | **Trapezoid**, **Midpoint**, **Simpson** | Transparent; show the convergence rates |
| 2 to about 5 variables, smooth $f$ | **Adaptive cubature** (HCubature) | Accurate with an error estimate |
| Many variables, or a rough integrand | **Monte Carlo** | Error $N^{-1/2}$ whatever the dimension |
| Values at points only | **Trapezoid** (any spacing) or **Simpson** (equal spacing, even intervals) | No formula to evaluate |
| You want the formula of the antiderivative | Symbolic integration | See the Symbolic Math panel |

## Special Cases

- **Expectations over a normal distribution:** Gauss-Hermite nodes (`gausshermite` in FastGaussQuadrature) are far more efficient than generic rules.
- **Integrals over $[0, \infty)$ with an exponential weight:** Gauss-Laguerre (`gausslaguerre`).
- **A family of integrals with a parameter:** the SciML package Integrals.jl wraps QuadGK, HCubature and others behind one `IntegralProblem` interface and supports differentiating the result with respect to the parameter.

## Related Panels

- **Differentiation**: the inverse operation, and the Leibniz rule for moving limits.
- **Symbolic Math**: exact antiderivatives.
- **Density Estimation** and the distribution panels: integrals of densities are probabilities.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
