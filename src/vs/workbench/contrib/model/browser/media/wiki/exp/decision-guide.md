# Decision Guide

| Situation | Method |
|---|---|
| Smooth f, one-dimensional, known distribution | **Gaussian quadrature**, 10 to 20 nodes |
| Kinked f, such as option payoffs | More nodes, a **trapezoidal** grid, or split at the kink |
| Discontinuous f, such as probabilities | The CDF directly, or a fine grid |
| Heavy tails or LogNormal with fast-growing f | Check the convergence; more nodes |
| A mixture of distributions | **MixtureModel**, one rule per component |
| Many dimensions | Monte Carlo, quasi-Monte Carlo or sparse grids |

## Decision Flow

1. **Compute with the default 20 nodes**.
2. **Run the convergence check**: if the error falls to machine precision, fewer nodes may do.
3. **If the error falls slowly**, look at f(x) p(x) for a kink or heavy tails.
4. **Cross-check with Monte Carlo** when in doubt.
5. **For repeated use**, build the operator E once and apply it.

## Rules of Thumb

- **Smooth f**: 5 to 10 nodes are often exact to 1e-10.
- **Kinked f**: errors fall like a power of n; 100 nodes may give only 3 or 4 digits.
- **Never trust a finite answer** for an expectation that may be infinite: check the tails.
- **Polynomials** of degree up to 2n - 1 are integrated exactly.
- **Quadrature beats Monte Carlo** in one dimension by orders of magnitude.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
