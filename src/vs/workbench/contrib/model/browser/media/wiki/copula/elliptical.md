# Elliptical Copulas

## Definition
An elliptical copula is the copula of an elliptical distribution, a multivariate normal or Student's t, extracted by applying each margin's CDF. It is parametrised by a correlation matrix, one coefficient per pair, so it handles any pattern of pairwise dependence in any dimension.

## Gaussian Copula
C(u) = Phi_R(Phi^-1(u1), ..., Phi^-1(ud)), where Phi_R is the multivariate normal CDF with correlation matrix R.
- **Rank correlations**: Kendall's tau = (2 / pi) arcsin(rho), Spearman's rho = (6 / pi) arcsin(rho / 2).
- **No tail dependence** for any rho < 1: extremes become independent as they become more extreme.
- **Symmetric**: the lower and upper tails behave alike, and so do positive and negative dependence.
Its lack of tail dependence underestimated the joint default risk of mortgage pools before 2008.

## Student's t Copula
The copula of a multivariate t with correlation matrix R and nu degrees of freedom.
- **Same rank correlations** as the Gaussian for the same R.
- **Symmetric tail dependence**: lambda = 2 t_(nu+1)(-sqrt((nu + 1)(1 - rho) / (1 + rho))), positive even for rho = 0. Small nu gives strong joint extremes; as nu grows it tends to the Gaussian.
- **Radial symmetry**: crashes and booms are equally likely to coincide.

## Estimation
The correlation matrix can be estimated by inverting Kendall's tau pair by pair, which is fast and robust, then nu by maximum likelihood; or all at once by maximum likelihood. Inverted pairwise correlations may need adjusting to a positive definite matrix.

## When They Fit
Elliptical copulas suit many variables with heterogeneous pairwise dependence and roughly symmetric tails: portfolios, multivariate returns. They cannot represent asymmetry between the tails; for that, see the Archimedean families.

## See Also
- [Archimedean Copulas](archimedean.md) · [Dependence Measures](dependence-measures.md) · [Decision Guide](decision-guide.md)
