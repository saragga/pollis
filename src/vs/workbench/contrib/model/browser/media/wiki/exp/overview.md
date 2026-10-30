# Expectations — Overview

Expectations.jl's expectation(dist; n) builds an **operator** E: a set of n nodes x_i and weights w_i such that E(f) = sum of w_i f(x_i) approximates E[f(X)]. The operator is built once and applied to any function, so computing many expectations of the same distribution costs only the function evaluations; dot(f.(nodes(E)), weights(E)) is the same sum written out.

## The Quadrature Rule
The rule is chosen by the distribution's support:
- **Gauss-Hermite** for the real line: Normal, and LogNormal through its underlying Normal.
- **Gauss-Laguerre** for the half-line: Gamma, Exponential, ChiSq.
- **Gauss-Legendre** for a bounded interval: Beta, Uniform.
An n-node Gaussian rule is exact for polynomials of degree up to 2n - 1 in the variable it integrates over. A **MixtureModel** gets one rule per component, combined with the mixing weights.

## Inputs
The **Distribution** with its **Parameters**, comma-separated, or for a MixtureModel the **Components** and their **Weights**; the **Function f(x)**, by default x -> x^2; and the **Nodes (n)**, 20 by default.

## Common Workflow

1. Choose the **Distribution** and its **Parameters**, enter **Function f(x)** and the **Nodes (n)**.
2. Look at the **Quadrature Nodes and Weights** and **f(x) Weighted by the Density**.
3. Check the **Convergence in the Number of Nodes** and **Check Against Known Moments**.
4. Cross-check with the **Monte Carlo Cross-Check**; compute the **Expected Excess Over Thresholds**.
5. Compare **Quadrature Methods** and look at **Jensen's Inequality**.
6. Read the **Moments and Shape** and the **Certainty Equivalent**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
