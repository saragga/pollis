# Diagnostics

## J-Statistic (Hansen Test)
The **J-Statistic** is n times the two-step objective, n g' S^-1 g, at the efficient estimate. Under the null that all moment conditions hold it is chi-square with degrees of freedom equal to the number of instruments minus the number of parameters. A small p-value means at least one instrument looks invalid, or the model is misspecified. A large p-value is consistent with valid instruments but cannot prove it: the test has low power, and assumes at least one set of valid instruments to begin with. It is the heteroskedasticity-robust version of the Sargan test. Not available when the model is just identified (J is zero).

## First-Stage Analysis
The **First-Stage Analysis** gives, for each endogenous regressor, the partial F of the excluded instruments in its first-stage regression. The rule of thumb is F above 10; weaker instruments bias GMM toward OLS and make its standard errors unreliable.

## Residual Diagnostics
**Residual Diagnostics** shows the structural residuals and the sample moments at the estimate. In an overidentified model they are not all zero; a moment far from zero relative to the others points to the instrument that disagrees.

## Efficiency vs 2SLS
**Efficiency vs 2SLS** compares one-step GMM (2SLS) with two-step efficient GMM, both with robust standard errors. Under heteroskedasticity, two-step GMM should have smaller standard errors; if the estimates differ by much more than their standard errors, the instruments may identify different things, or the weight is poorly estimated.

## Bootstrap Confidence Intervals
The **Bootstrap Confidence Intervals** refit the model 200 times on pairs resamples (Bootstrap.jl), and compare the bootstrap standard errors with the sandwich ones. Bootstrap errors much larger than the sandwich errors mean the asymptotic approximation is poor in this sample.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Hansen's J | Large p-value | Small p-value |
| First-stage F | Well above 10 | Below 10 |
| Moments at the estimate | All small | One far from zero |
| Two-step vs 2SLS | Close estimates, smaller errors | Estimates far apart |
| Bootstrap vs sandwich errors | Close | Bootstrap much larger |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
