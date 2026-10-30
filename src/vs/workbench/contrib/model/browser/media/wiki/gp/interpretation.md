# Interpretation

## The Parameters
- **sigma, the scale**: the typical size of an excess. With xi = 0, the excesses are exponential with mean sigma.
- **xi, the shape**: the tail. With xi = 0.3, the tail falls like y^(-1/0.3), so only moments below order 3.3 exist; financial losses often give xi between 0.1 and 0.4.
For the rainfall above 30 mm, 152 exceedances, Coles (2001) reports about sigma = 7.44 and xi = 0.18; the 95% interval of xi, about -0.01 to 0.38, just contains 0, so **Tail Behaviour** cannot tell the tail from exponential.

## Tail Behaviour
For a fitted Generalized Pareto distribution, **Tail Behaviour** classifies the tail from the 95% interval of xi:
- **Heavy (Pareto-type)** if the whole interval is above 0.
- **Bounded** if it is below 0.
- **Not distinguishable from exponential** if it contains 0, common with few exceedances, since an interval of width 0.4 is usual.

## Tail Probabilities
For x above u, P(X > x) = zeta_u (1 + xi (x - u) / sigma)^(-1/xi), where zeta_u is the share of observations above u. **Tail Probability** applies it at u plus the largest excess.

## Quantiles and Value at Risk
The p-quantile for p above 1 - zeta_u is u + (sigma / xi) (((1 - p) / zeta_u)^(-xi) - 1). This is the POT value at risk; for xi < 1, the expected shortfall above it is (VaR + sigma - xi u) / (1 - xi). These extrapolate beyond the data, and their uncertainty grows quickly with p.

## Return Levels
With m observations per year, the level exceeded once in N years on average is the quantile at p = 1 - 1 / (N m).

## Evaluate
**Evaluate** gives the density and CDF of a GP at x, and the quantile at p, for the excess distribution starting at mu: P(X > x | X > mu) is 1 - cdf.

## Sample
**Sample** shows how variable GP data are: with xi = 0.1, a few draws well above the rest; as xi approaches 0.5, the sample standard deviation stops settling, as the variance becomes infinite.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
