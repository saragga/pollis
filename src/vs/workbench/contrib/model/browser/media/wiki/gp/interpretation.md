# Interpretation

## The Parameters
- **sigma, the scale**: the typical size of an excess. With xi = 0, the excesses are exponential with mean sigma.
- **xi, the shape**: the tail. With xi = 0.3, the tail falls like y^(-1/0.3), so only moments below order 3.3 exist; financial losses often give xi between 0.1 and 0.4.

## Tail Behaviour
**Tail Behaviour** classifies the tail as heavy (xi > 0.05), exponential (between -0.05 and 0.05) or bounded (xi < -0.05). The classification uses the point estimate: check the uncertainty of xi before relying on it, since a 95% interval of width 0.4 is common.

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
