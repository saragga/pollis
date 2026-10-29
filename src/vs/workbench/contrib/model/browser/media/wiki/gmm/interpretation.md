# Interpretation

## Coefficient Table
The **Coefficient Table** gives the estimates with standard errors, z statistics and two-sided p-values. The coefficients have the same meaning as in 2SLS: the coefficient on an endogenous regressor is its structural effect, the change in the response caused by a one-unit change in the regressor. GMM changes how efficiently it is estimated, not what it means.

## Standard Errors
The two-step estimator reports **sandwich** standard errors, (G' W G)^-1 G' W S W G (G' W G)^-1, which reduce to (G' S^-1 G)^-1 at the efficient weight; they allow for heteroskedasticity. The cluster option replaces them with **cluster Bayesian bootstrap** errors, which allow for correlation within clusters. The tests use the normal distribution (z statistics), as large-sample results.

## OLS vs GMM
**OLS vs GMM** shows how far the estimate moves when the endogenous regressor is instrumented. The direction should agree with the reason for endogeneity; a GMM estimate many times OLS suggests weak instruments.

## Efficiency vs 2SLS
When the errors are homoskedastic, 2SLS is already efficient and the two estimators agree. Two-step GMM pays off when the variance differs across observations; the gain shows as smaller standard errors in **Efficiency vs 2SLS**.

## Confidence Intervals
The **Confidence Intervals** are large-sample 95% intervals, the estimate plus or minus 1.96 standard errors. The **Bootstrap Confidence Intervals** give percentile and basic intervals from 200 pairs resamples; when they differ from the large-sample ones, prefer the bootstrap in small samples.

## The J Statistic
A J test that does not reject is a necessary, not sufficient, condition for valid instruments: report it, but defend each instrument on its own grounds.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
