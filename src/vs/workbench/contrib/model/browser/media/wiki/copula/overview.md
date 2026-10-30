# Copula Estimation — Overview

The main code fits a Sklar distribution in three steps: the d marginal distributions, the copula's dependence parameters, and their combination by Sklar's theorem into one d-dimensional distribution.

## Inputs
- **Data**: a d x n matrix, one column per observation. The default simulates 500 observations from a Clayton copula with theta = 2 (Kendall's tau 0.5, dependence in the lower tail) with margins Normal(0, 1) and Normal(2, 0.5).
- **Copula**: the family, Gaussian by default, which misses that lower tail; **Compare Copula Families** and **Tail Dependence** show it.
- **Marginal Distributions**: one per variable, comma-separated, such as Normal, LogNormal, Gamma; their number sets d. Bivariate-only families are fixed at d = 2.
- **Estimation Method**: **Maximum Likelihood**, or the inversion of **Kendall's Tau**, **Spearman's Rho** or **Blomqvist's Beta**, which matches the parameter to the rank correlation of the data.
- **Margins**: **Two-Stage (IFM)**, inference functions for margins, fits the parametric margins first and the copula on their CDF values; **Pseudo-Observations** uses ranks, so the copula does not depend on the margins chosen.

The empirical families fit the copula alone, from the ranks, without margins.

## Common Workflow

1. Load the **Data**; choose the **Copula** and the **Marginal Distributions**.
2. Choose the **Estimation Method** and the **Margins**; run.
3. Compare the **Data vs Simulated Dependence** and the **Fitted Marginals**.
4. Run the **Rosenblatt Goodness of Fit** and **Dependence: Data vs Model**.
5. **Compare Copula Families** and test **Against Independence**.
6. Read the **Parameter Estimates**, the **Tail Dependence** and the **Joint Exceedance Probability**; **Simulate From the Fitted Model**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
