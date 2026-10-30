# Diagnostics

## Fitted vs Observed and the Residual Plot
**Fitted vs Observed** draws the data with the fitted curve; the **Residual Plot** the residuals against t. A **random scatter** around zero means the model shape fits. A curve, a trend, or runs of positive and negative residuals mean the functional form is wrong; a funnel, residuals growing with t, means the variance is not constant and weights are needed.

## Residual Analysis
**Residual Analysis** reports the mean, spread, largest residual, sum of squares and the **lag-1 autocorrelation**. For independent errors the autocorrelation is near 0; a large positive value, for data in order of t, is a sign of a misspecified shape or correlated errors. A largest residual several times the spread suggests an outlier.

## Gradient Norm
The **Gradient Norm** computes the gradient of the sum of squares, 2 J'r, at the solution. At a minimum it vanishes: a value well above the tolerance means the solver stopped early. Check it together with the **converged** flag.

## Condition Number
The **Condition Number** reports the singular values of J, its rank and the ratio of the largest to the smallest singular value. A condition number above about 1e6, or a rank below the number of parameters, means some combination of parameters is barely informed by the data: the estimates and their standard errors along it are unreliable, however well the solver converged.

## Jacobian Structure
The **Jacobian Structure** shows |dr/dp| as a heatmap, observation by parameter. A parameter whose column is small everywhere is weakly informed; one informed only by a few observations depends heavily on them.

## Starting-Point Study and Tolerance Sweep
The **Starting-Point Study** fits from 20 starts around p0 and reports the share reaching the best sum of squares: a low share means a small basin and the need for a careful start. The **Tolerance Sweep** shows that the parameters settle once the tolerance is tight enough.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Residual plot | Random scatter | Curve, trend or funnel |
| Lag-1 autocorrelation | Near 0 | Large and positive |
| Gradient norm | Near 0 | Well above the tolerance |
| Condition number | Below 1e6 | Above 1e6, or rank deficient |
| Starting points | Most reach the best SSR | Few do |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
