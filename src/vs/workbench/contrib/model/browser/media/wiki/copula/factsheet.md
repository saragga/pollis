# Copula Estimation — Factsheet

A **copula** is a multivariate distribution on the unit cube with uniform margins: it describes how variables depend on each other once their individual distributions are removed. By **Sklar's theorem**, every joint distribution splits into its margins and a copula, F(x1, ..., xd) = C(F1(x1), ..., Fd(xd)), so that each margin and the dependence can be modelled separately. Copulas.jl fits both and combines them into a SklarDist.

| | |
|---|---|
| **Purpose** | Model the dependence between variables separately from their margins, with control over the tails |
| **Input** | A d x n data matrix, a copula family, one margin per variable, the estimation method and how the margins enter |
| **Core packages** | [Copulas.jl](https://github.com/lrnv/Copulas.jl) |
| **Models** | Elliptical (Gaussian, Student's t), Archimedean (Clayton, Gumbel, Frank, Joe, AMH, BB1), extreme value (Galambos, Husler-Reiss, tEV), Marshall-Olkin, empirical (Unsmoothed, Beta, Bernstein, Checkerboard, Empirical EV) and the bounds M, Pi, W |
| **Output** | The fitted copula and margins, standard errors, goodness of fit, simulations and tail measures |
| **Key choice** | The family: it decides whether the model allows joint extremes, in which tail, and how symmetrically |

## When to Use

- **Joint risk**: losses, floods or failures that tend to happen together in the tails.
- **Non-normal margins** with dependence: insurance claims, returns, hydrology.
- **Simulation** of dependent inputs with given margins.

## What It Is Not

Not a regression: a copula describes association, not how one variable responds to another. Not causal. A correlation matrix with normal margins is the special case of the Gaussian copula; most of the value of copulas lies in departing from it.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Dependence Measures](dependence-measures.md)
