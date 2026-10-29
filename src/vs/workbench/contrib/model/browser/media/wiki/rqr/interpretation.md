# Interpretation

## Robust Coefficients
A robust regression coefficient reads like a least-squares slope: the change in the centre of the response for a one-unit change in the predictor, the others fixed, estimated without letting the outliers dominate. With symmetric errors it estimates the same quantity as OLS.

## Quantile Coefficients
A quantile regression coefficient at tau is the change in the **tau-quantile** of the response for a one-unit change in the predictor. At tau = 0.9 with a slope of 2, the 90th percentile of the response rises by 2 per unit of the predictor. It describes the conditional distribution, not individuals: the people at the 90th percentile at one value of the predictor are not necessarily the same people at another.

## Against OLS
**Against OLS** shows the coefficients beside least squares. A large gap means outliers or skewness are pulling the OLS estimate; a small gap means least squares was fine. For quantile regression, differences from OLS also reflect skewness: in a right-skewed distribution the median lies below the mean.

## The Quantile Process
Reading the **Quantile Process**: slopes that rise with tau mean the predictor increases the spread of the response (heteroskedasticity in the location-scale sense); a slope significant only in the upper quantiles means the predictor matters for the high outcomes alone.

## Coefficients With 95% CI
For robust regression, the **Coefficients With 95% CI** are Wald intervals from the asymptotic M-estimator standard errors, which assume homoskedastic errors. For quantile regression they are 95% percentile intervals from a 200-draw pairs bootstrap, which remain valid under heteroskedasticity, unlike the package's iid standard errors.

## Pseudo R-Squared
The **Pseudo R-Squared** is 1 - deviance / null deviance: the share of the robust or check-function loss explained by the predictors. For quantile regression it is the Koenker-Machado R1, a local measure at the chosen tau. It is not comparable with the R-squared of least squares.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
