# Decision Guide

| Situation | Method |
|---|---|
| Integration in any dimension; the default | **Sobol** at a power of 2 |
| An error estimate for QMC | Scrambled Sobol, independent replicates |
| Low dimension (up to about 10), any n | **Halton** or **Kronecker** |
| One or two dimensions, very even spacing | **Golden** |
| Design of experiments, surrogate training | **Latin Hypercube** |
| Equal treatment of all axes in a prime base | **Faure** |
| A baseline or a plot | **Grid** |
| Rough or discontinuous integrand | Pseudo-random Monte Carlo may be as good |

## Decision Flow

1. **Is the integrand smooth?** If not, the QMC gain is small.
2. **Choose Sobol** unless the dimension is low and n must be arbitrary.
3. **Pick n** as a power of 2 for Sobol.
4. **Randomise** with scrambling when an error bar is needed.
5. **Check the convergence rate** on a test function of the same kind.

## Rules of Thumb

- **Powers of 2 for Sobol**: never 1000, use 1024.
- **Important variables first**: the early dimensions are the most even.
- **Do not drop the first point** of Sobol out of habit; scrambling is the better fix.
- **QMC in place of MC** wherever the function is smooth: the cost is the same.
- **No randomness tests**: a low-discrepancy sequence fails them by design.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
