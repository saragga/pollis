# Diagnostics

## Quadrature Nodes and Weights
**Quadrature Nodes and Weights** plots the density with the nodes as red sticks whose heights are the weights, one plot per component for a mixture. The nodes concentrate where the density has mass, and the outer nodes carry tiny weights: with 20 Gauss-Hermite nodes, the outermost lie beyond 7 standard deviations, with weights of about 1e-13.

## f(x) Weighted by the Density
**f(x) Weighted by the Density** plots f(x) p(x), whose area is E[f(X)], with the value in the title. Where the curve has its mass is where the nodes must be; a curve still large at the edge of the plot means that the tails matter, and convergence will be slow.

## Convergence in the Number of Nodes
**Convergence in the Number of Nodes** computes E[f(X)] with 2, 4, ..., 64 nodes and plots the absolute error against a 200-node reference, on log scales.
- A **steep fall** to machine precision: f is smooth, and a few nodes suffice.
- A **slow, straight decline**: f has a kink or a jump; the error falls like a power of n.
- **No decline**: the expectation may not exist, or the reference itself is inaccurate.

## Check Against Known Moments
**Check Against Known Moments** compares the quadrature mean and variance with Distributions.jl's exact values. They should agree to many digits; a discrepancy means too few nodes for the distribution, most often for a skewed LogNormal.

## Monte Carlo Cross-Check
**Monte Carlo Cross-Check** draws a million values, computes the sample mean of f and its standard error. The quadrature value should lie within two or three standard errors. Monte Carlo is slower and less precise, but makes no smoothness assumption: when they disagree, trust neither until the convergence plot is clean.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Convergence | Error falls to 1e-12 or below | Slow or no decline |
| Known moments | Agree to many digits | Disagree |
| Monte Carlo | Within 2-3 standard errors | Outside |
| Weighted integrand | Vanishes at the edges | Large at the edges |
| Quadrature methods | Agree | Disagree |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
