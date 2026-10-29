# Decision Guide

| Data and errors | Model | Estimator |
|---|---|---|
| Independent observations, constant variance | **Standard** | Classical OLS |
| Independent, variance changes with the predictors | **HC0-HC3** | HC3 for small samples, HC1 to match Stata's robust |
| Time series, autocorrelated errors | **HAC** | Newey-West (Bartlett kernel), Parzen, Andrews quadratic spectral |
| Grouped observations (firms, states, schools) | **Clustered** | CR1 by the cluster identifier |
| Panel with common shocks across entities | **Driscoll-Kraay** | HAC on the cross-sectional averages |

## Decision Flow

1. **Are the observations independent?** If yes, use HC standard errors unless the residual plot shows constant variance; robust errors cost little when they are not needed.
2. **Is there a time order?** Use HAC, and check that the kernels agree.
3. **Are there groups?** Cluster at the level at which the errors may be correlated, normally the coarsest plausible level, as long as there are enough clusters.
4. **Panel data with shocks that hit all entities at once** (macroeconomic news, a common policy)? Use Driscoll-Kraay.
5. **Few clusters** (below about 30 to 50)? Treat clustered p-values with caution; consider a wild cluster bootstrap.

## Choosing the HAC Bandwidth
The number of lags sets how much autocorrelation is allowed for. The data-driven bandwidths (Newey-West, Andrews) choose it from the data; a common fixed rule is about T^(1/4) lags for T periods.

## Rules of Thumb
- **Robust by default**: HC3 for cross-sections, clustered for grouped data.
- **Cluster where the treatment varies**: if a policy is set by state, cluster by state.
- **Check the residuals first**: no standard error fixes a misspecified mean.

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
