# Assumptions

## A Known Univariate Distribution
The distribution must be specified completely, with its parameters. Expectations.jl supports univariate distributions; the panel offers eight, including mixtures. Parameters follow Distributions.jl: Gamma by shape and scale, Exponential by its scale 1/rate, LogNormal by the mean and standard deviation of log X.

## A Smooth Function
Gaussian quadrature is exact when f times the rule's weight function is a polynomial of degree up to 2n - 1, and converges very fast, often exponentially in n, when f is **smooth**. It converges slowly when f has:
- **Kinks**: max(x - K, 0), abs(x). **Expected Excess Over Thresholds** is such a case: approximate at moderate n.
- **Jumps**: indicator functions, probabilities of intervals.
- **Rapid growth**: exp(x) under a heavy-tailed distribution.
For these, more nodes, a trapezoidal rule on a fine grid, or splitting the integral at the kink do better.

## A Finite Expectation
E[f(X)] must exist. Quadrature returns a finite number even when the true expectation is infinite: E[exp(X)] under a LogNormal, or under a Gamma with scale 1 or more, is infinite, but a 20-node rule gives a finite, meaningless answer. **Jensen's Inequality** skips exp(x) for those distributions for that reason.

## The Transformation for LogNormal
LogNormal is integrated as f(exp(Z)) with Z normal. For functions of X that grow fast, f(exp(z)) grows very fast, and Gauss-Hermite needs many nodes: check the convergence.

## Mixtures
A mixture's expectation is the weighted sum of its components' expectations. The weights must sum to 1, and each component gets n nodes, so the total cost is n times the number of components.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
