# Extreme Value Copulas

## Definition
An extreme value copula is the possible limiting copula of componentwise maxima. If (X, Y) are independent pairs, the copula of (max of n X's, max of n Y's), suitably normalised, converges to one, and every such limit is **max-stable**: C(u1^t, u2^t) = C(u1, u2)^t for all t > 0.

## Pickands Dependence Function
Every bivariate extreme value copula has the form C(u, v) = exp(log(uv) A(log v / log(uv))), where A, the **Pickands dependence function**, is convex on [0, 1] with max(t, 1 - t) <= A(t) <= 1. A(t) = 1 is independence; A(t) = max(t, 1 - t) is perfect dependence. The upper tail dependence is 2 (1 - A(1/2)).

## The Families
- **Gumbel**: the only family that is both Archimedean and extreme value; symmetric.
- **Galambos**: symmetric, with a negative-logistic form; close to Gumbel in practice.
- **Husler-Reiss**: the limit of Gaussian maxima as the correlation tends to 1 at the right rate; symmetric.
- **tEV**: the limit of the Student's t copula's maxima, with the degrees of freedom as a second parameter.
- **Empirical EV**: a nonparametric estimate of A from the data.
These are bivariate in the Copula Estimation panel, fixed at d = 2.

## Properties
- **Upper tail dependence** whenever they are not independence; **no lower tail dependence**.
- **Positive dependence only**: Kendall's tau between 0 and 1.

## When They Fit
Annual maxima of river flows at two gauges, maximum wind speeds at two sites, the largest losses of two lines of business per year: any data that are already maxima over blocks. They pair naturally with GEV margins; see the Generalized Extreme Value panel. For data that are not maxima, they are just one more family with an upper tail.

## See Also
- [Archimedean Copulas](archimedean.md) · [Marshall-Olkin Copulas](marshall-olkin.md) · [Decision Guide](decision-guide.md)
