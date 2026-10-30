# Dependence Measures

Copula-based measures depend only on the copula, not on the margins: they are unchanged by any increasing transformation of the variables. The Pearson correlation is not.

## Kendall's Tau
The probability of concordance minus the probability of discordance between two independent pairs of observations: tau = 4 E[C(U, V)] - 1. It ranges from -1 to 1 and has closed forms for most families: (2 / pi) arcsin(rho) for elliptical, theta / (theta + 2) for Clayton, 1 - 1 / theta for Gumbel. Its inversion is the most common rank-based estimator.

## Spearman's Rho
The Pearson correlation of the ranks: rho_S = 12 E[UV] - 3. For the Gaussian copula, (6 / pi) arcsin(rho / 2), close to rho. Spearman's rho and Kendall's tau usually satisfy |rho_S| about 1.5 |tau| for moderate dependence.

## Blomqvist's Beta
The medial correlation: beta = 4 C(1/2, 1/2) - 1, the probability that both variables are on the same side of their medians, rescaled. Simple and robust, but it uses only the centre of the copula.

## Tail Dependence
The lower and upper tail dependence coefficients:
- lambda_L = limit as q goes to 0 of P(V < q | U < q).
- lambda_U = limit as q goes to 1 of P(V > q | U > q).
They are zero for the Gaussian, Frank and AMH copulas, positive for t, Clayton (lower), Gumbel and Joe (upper), BB1 (both). The panel's **Tail Dependence** estimates them at q = 0.05 and 0.95, finite-threshold versions that are positive even for the Gaussian.

## Pearson Correlation
Measures linear dependence and depends on the margins: the same copula with different margins gives different Pearson correlations, and not every value in [-1, 1] is attainable for given margins. It summarises a copula poorly outside the Gaussian case.

## The Bounds
Every copula lies between the **lower Frechet bound** W (perfect negative dependence, tau = -1, bivariate only), the **independence copula** Pi (tau = 0) and the **upper Frechet bound** M (perfect positive dependence, tau = 1).

## See Also
- [Interpretation](interpretation.md) · [Elliptical Copulas](elliptical.md) · [Archimedean Copulas](archimedean.md)
