# Assumptions

## The Model
The model f(t, p) must be **correctly specified**: the true mean of y at t is f(t, p) for some p. A wrong functional form leaves a systematic pattern in the residuals, which no solver can remove, and the estimates then describe the best approximation, not true parameters. The **Residual Plot** is the main check.

## Smooth in the Parameters
f must be **differentiable in p**, in generic Julia code that ForwardDiff can differentiate, so that the Jacobian exists. It need not be differentiable in t.

## Errors
The statistical results, standard errors, intervals and t-statistics, rest on the classical assumptions for the errors:
- **mean zero** and **independent** across observations;
- **constant variance** (homoscedastic): otherwise weighted least squares, with weights proportional to 1 / variance, is appropriate;
- **normal**, for exact t intervals in small samples; asymptotically normality is not needed.
Under these assumptions least squares is the maximum-likelihood estimator, and the covariance s^2 (J'J)^-1 is valid **asymptotically**, as a linearisation around the estimate.

## Identifiability
The parameters must be **identifiable** from the data: different p must give different predictions at the observed t. J must have full column rank n at the solution. If two parameters can trade off (in p1 exp(-p2 t) with very few points, or a model with redundant parameters), J'J is near singular, and the standard errors explode. The **Condition Number** reports it.

## Enough Data
There must be more observations than parameters, m > n; the residual degrees of freedom m - n enter the variance estimate. Intervals from few degrees of freedom are wide and rely more on the normality of the errors.

## A Reasonable Start
The solvers are **local**: p0 should be of the right order of magnitude and sign, or they may stop in another local minimum or diverge. The **Starting-Point Study** measures the basin.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
