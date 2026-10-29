# Robust and Quantile Regression — Factsheet

**Robust regression** estimates beta by minimising the sum of rho((y_i - x_i'beta) / s), where rho grows more slowly than the square and s is a robust scale, so that outliers in the response have bounded influence. **Quantile regression** estimates the conditional tau-quantile by minimising the sum of rho_tau(y_i - x_i'beta), with rho_tau(u) = u (tau - 1{u < 0}).

| | |
|---|---|
| **Purpose** | Estimate the relationship between a response and predictors when the errors have outliers or heavy tails, or when the effects differ across the distribution of the response |
| **Input** | A table and a formula; for robust regression the loss, and optionally a ridge penalty; for quantile regression the quantile level tau |
| **Core packages** | [RobustModels.jl](https://github.com/getzze/RobustModels.jl) |
| **Models** | Robust Regression (Huber, Tukey bisquare, Hampel, Welsch, L1), Quantile Regression |
| **Output** | Coefficients, standard errors and intervals, the final IRLS weights, deviance and pseudo R-squared |
| **Key choice** | The loss (how strongly outliers are discounted) or the quantile level |

## When to Use

- **Outlying responses**: a few observations would dominate least squares, and you want the relationship for the bulk of the data.
- **Heavy-tailed or skewed errors**, where least squares is inefficient.
- **Effects that differ across the distribution**: a predictor that raises the upper tail more than the median (wages, response times, risk).
- **Heteroskedasticity** as an object of study: quantile slopes that fan out show it directly.
- **Distribution-free prediction intervals** from the 5% and 95% conditional quantiles.

## What It Is Not

M-estimators and quantile regression resist outlying **responses**, not high-leverage **predictor** values: a single point far out in x can still drive the fit (see Leverage Points). They do not fix omitted variables or endogeneity. A quantile regression coefficient describes the conditional quantile, not the effect on any individual. For mean regression with robust standard errors (which is a different meaning of "robust"), see Linear Regression.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
