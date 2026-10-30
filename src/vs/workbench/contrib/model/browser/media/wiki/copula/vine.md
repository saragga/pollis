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
The **Fit** tab fits single-family copulas. The **Vine Copula** tab of Example Code, from VineCopulas.jl, shows a vine at work on simulated data:
- **Build**: a three-variable D-vine with order 1, 2, 3: Gaussian for the pair (1, 2) and Clayton for (2, 3) in tree 1, Frank for (1, 3) given 2 in tree 2.
- **Simulate**: 1,000 observations on the uniform scale.
- **Fit back**: a D-vine with the same order, tree by tree, each pair's family and rotation chosen by BIC.
It prints each vine's log-likelihood, and the family and Kendall's tau of each pair copula, and plots draws from both vines for each pair of variables.

Read the families together with tau. With these data the fit recovers tree 1, and gives tree 2 a Gaussian copula in place of the Frank: tau 0.211 against 0.214, as both are symmetric and hard to tell apart at this strength. Without **order**, the fit also chooses the path, and may choose another one that fits about as well, so its pairs can no longer be compared with the known ones.

## See Also
- [Archimedean Copulas](archimedean.md) · [Elliptical Copulas](elliptical.md) · [Decision Guide](decision-guide.md)
