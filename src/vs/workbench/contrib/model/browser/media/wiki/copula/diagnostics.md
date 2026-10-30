# Diagnostics

## Data vs Simulated Dependence
**Data vs Simulated Dependence** plots the pseudo-observations of the data beside the same number of draws from the fitted copula, both on the uniform scale. The shapes should match, especially in the corners: a cluster of data in the lower-left corner that the model spreads out is a missed lower tail.

## Fitted Marginals
**Fitted Marginals** overlays each fitted margin on the histogram of its variable. A margin that misses skewness or tails will distort a two-stage fit.

## Rosenblatt Goodness of Fit
**Rosenblatt Goodness of Fit** applies the Rosenblatt transform of the fitted model, which turns data from the model into independent uniforms. It reports:
- A **Kolmogorov-Smirnov** p-value for each transformed coordinate against Uniform(0, 1).
- The **Kendall correlations** between the transformed coordinates, which should be near 0.
- A **parametric bootstrap** p-value (GOFCopulaTest, 200 replicates) that refits on each replicate.
The KS p-values treat the fitted parameters as known and are conservative, too large; the bootstrap p-value is the one to report.

## Dependence: Data vs Model
**Dependence: Data vs Model** prints the Kendall and Spearman matrices of the data and of 10,000 draws from the model. With rank inversion they agree by construction for the inverted measure; with maximum likelihood, a gap shows that the family cannot reach the data's dependence.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Scatter on uniforms | Same shape, same corners | Corner clusters missed |
| Margins | Follow the histograms | Skew or tails missed |
| Rosenblatt | Uniform, uncorrelated | Small p, correlations |
| Bootstrap GOF | p > 0.05 | p < 0.05 |
| Rank correlations | Data and model agree | Gaps |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Dependence Measures](dependence-measures.md)
