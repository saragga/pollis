# Marshall-Olkin Copulas

## The Shock Model
Marshall and Olkin (1967) modelled two components that fail from three independent shocks: one that kills the first, one that kills the second, and a common one that kills both at once. The lifetimes are exponential, and the common shock gives a positive probability that **both fail at the same instant**. The copula of these lifetimes is the Marshall-Olkin copula: C(u, v) = min(u^(1 - alpha1) v, u v^(1 - alpha2)), with alpha1, alpha2 in [0, 1] the shares of each component's failure rate due to the common shock.

## Properties
- **A singular component**: positive probability on the curve u^alpha1 = v^alpha2, the diagonal when alpha1 = alpha2. Simulated data show points exactly on that curve, besides a scattered cloud.
- **Kendall's tau** = alpha1 alpha2 / (alpha1 + alpha2 - alpha1 alpha2).
- **Upper tail dependence** = min(alpha1, alpha2); no lower tail dependence.
- **Asymmetric** when alpha1 differs from alpha2.
- It is also an extreme value copula.

## When It Fits
- **Credit risk**: defaults triggered by a common economic shock.
- **Reliability**: systems with common-cause failures.
- **Insurance**: catastrophes that cause claims in several lines at once.
- **Data with ties**: simultaneous events that a continuous copula cannot reproduce.

## Estimation
The singular component makes the likelihood unusual: it has a density part and a part on the curve. Rank-based inversion of Kendall's tau is the straightforward route; maximum likelihood must handle observations that lie on the curve. In this panel the family is bivariate, fixed at d = 2.

## See Also
- [Extreme Value Copulas](extreme-value.md) · [Dependence Measures](dependence-measures.md) · [Decision Guide](decision-guide.md)
