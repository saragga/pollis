# Vine Copulas

## The Problem They Solve
In d dimensions, a Gaussian or t copula allows a different correlation for every pair, but the same tail behaviour everywhere; an Archimedean copula allows tails but the same dependence for every pair. A **vine copula**, or pair-copula construction, builds the d-dimensional copula from d(d - 1) / 2 bivariate copulas, each chosen freely, so that every pair can have its own family and its own tails.

## The Construction
The density factorises into bivariate copula densities arranged in a sequence of trees:
- **Tree 1** joins d - 1 pairs of variables with unconditional pair copulas.
- **Tree 2** joins pairs conditional on one variable, through their conditional distributions (the h-functions of tree 1).
- **Tree k** conditions on k - 1 variables, up to tree d - 1.
Bedford and Cooke (2002) formalised vines; Aas, Czado, Frigessi and Bakken (2009) made them a practical tool.

## Types
- **C-vine**: each tree has one central node, suited to data with a dominant variable.
- **D-vine**: each tree is a path, suited to ordered variables such as maturities.
- **R-vine**: any regular vine, chosen from the data, commonly by maximum spanning trees of absolute Kendall's tau (Dissmann et al., 2013).

## The Simplifying Assumption
Most vine models assume the conditional pair copulas in higher trees do not depend on the values of the conditioning variables, only their parameters are fixed. This makes estimation feasible and is usually a good approximation, but it is an assumption.

## Estimation
Sequentially, tree by tree, choosing each pair's family by AIC; then optionally jointly by maximum likelihood. Higher trees often carry weak dependence and can be truncated to independence.

## In This Panel
This panel fits single-family copulas and does not fit vines. Its bivariate results, the family that fits each pair best, are the building blocks of tree 1.

## See Also
- [Archimedean Copulas](archimedean.md) · [Elliptical Copulas](elliptical.md) · [Decision Guide](decision-guide.md)
