# Decision Guide

| Situation | Model | Setting |
|---|---|---|
| Errors close to normal, a few mild outliers | **Robust Regression** | Huber |
| Gross outliers that should be ignored | **Robust Regression** | Tukey bisquare, Hampel or Welsch |
| Heavy tails, a median relationship wanted | **Robust Regression** with L1, or **Quantile Regression** | tau = 0.5 |
| Effects on the tails of the response | **Quantile Regression** | tau = 0.1, 0.25, 0.75, 0.9 |
| Distribution-free prediction intervals | **Quantile Regression** | tau = 0.05 and 0.95 (90% Prediction Band) |
| Many or correlated predictors with outliers | **Robust Regression** | Ridge (L2) penalty |

## Decision Flow

1. **Is the question about the mean or about part of the distribution?** For the centre, robust regression; for tails or spread, quantile regression.
2. **Are there outliers in the response?** Look at the OLS residuals. A few large ones favour Huber; extreme ones, a redescending loss.
3. **Are there high-leverage points?** Neither model protects against them: check Leverage Points first.
4. **Are the results stable?** Alternative Estimators should agree on the signs and rough sizes.
5. **Heteroskedastic errors?** Use the bootstrap intervals for quantile regression.

## Rules of Thumb
- **Huber first**: about 95% as efficient as least squares under normal errors, and much safer with outliers.
- **Look at the downweighted points**; never treat them as noise without asking why they are there.
- **Report several quantiles**, not one, when the point is that the effect varies.
- **Avoid tau below 0.05 or above 0.95** unless the sample is large.

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
