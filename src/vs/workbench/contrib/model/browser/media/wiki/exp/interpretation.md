# Interpretation

## E[f(X)]
The main output is E[f(X)]: with the default f(x) = x^2 under Normal(0, 1), the second moment, 1. The second line computes the same value as the dot product of f at the nodes with the weights, which shows what the operator is: a fixed linear map from function values to an expectation. In a model that takes the same expectation of many functions, such as a value function iteration, the nodes and weights are computed once.

## Moments and Shape
**Moments and Shape** gives the mean, variance, standard deviation, skewness and excess kurtosis, all by quadrature. Excess kurtosis is 0 for a Normal, positive for heavier tails.

## Expected Excess Over Thresholds
**Expected Excess Over Thresholds** gives E[max(X - K, 0)] for K at the 50th to 99th percentiles: the expected payoff of a call option with strike K, or the expected shortfall beyond a threshold times its probability. The payoff has a kink at K, so the values are approximate at moderate n.

## Jensen's Inequality
**Jensen's Inequality** compares E[g(X)] with g(E[X]) for x^2, abs(x), and where they are defined exp(x), log(x) and sqrt(x). For convex g the gap is non-negative, for concave g non-positive. The gap for x^2 is the variance; for log, the reason why the expected log return is below the log of the expected return.

## Certainty Equivalent
**Certainty Equivalent** gives, under exponential (CARA) utility with risk aversion a = 0.1, 0.5 and 1, the sure amount worth as much as the gamble X, -log(E[exp(-a X)]) / a, and the **risk premium**, the mean minus the certainty equivalent. The premium grows with risk aversion and, to first order, equals a times the variance over 2.

## Quadrature Methods
**Quadrature Methods** compares Gaussian quadrature with a 50-point quantile-range rule and a trapezoidal rule on a 1000-point grid. On smooth functions all agree, Gaussian with far fewer nodes; on kinked functions, the trapezoidal grid is often the most reliable.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
