# Assumptions

## Independent, Identically Distributed Observations
Each column of the data is one draw from the same joint distribution, independent of the others. Time series must be filtered first, for example to the standardised residuals of a GARCH model; otherwise serial dependence is mistaken for cross-sectional dependence and the standard errors are too small.

## Continuous Margins
Sklar's decomposition is unique only when the margins are continuous. With discrete margins, counts or heavily tied data, many copulas fit the same distribution, ranks are ambiguous, and the rank correlations are biased toward zero. The Poisson and NegativeBinomial margins are available, but their copula should be read with care.

## The Margins Are Right, or Ignored
- **Two-Stage (IFM)** feeds the copula the fitted marginal CDFs: a wrong margin distorts the dependence estimate, most in the tails.
- **Pseudo-Observations** uses the ranks, divided by n + 1, so the copula estimate is free of the margins; the margins are then fitted separately and only matter for the joint distribution.
When the margins are uncertain, pseudo-observations are the safer route.

## The Family Fits the Dependence
Each family has a fixed dependence structure:
- **Symmetry**: Gaussian, t and Frank treat both tails alike; Clayton, Gumbel and Joe do not.
- **Tail dependence**: present only in t, Clayton, Gumbel, Joe, BB1 and the extreme value families.
- **Range**: AMH reaches Kendall's tau of only -0.18 to 1/3; Clayton, Gumbel and Joe allow only positive dependence in these forms.
- **Exchangeability**: one-parameter Archimedean copulas treat all pairs alike in d > 2.

## Sample Size
Tail behaviour is estimated from the few observations in the corners: with 500 observations and a 5% corner, about 25 in each tail. Tail dependence estimates are noisy below several hundred observations.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
