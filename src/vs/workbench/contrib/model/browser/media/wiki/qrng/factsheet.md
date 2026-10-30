# Quasi-Random Numbers Generation — Factsheet

A **quasi-random** or **low-discrepancy** sequence places points in a hypercube so that they cover it more evenly than independent random draws. Used in place of random points to average a function, it gives **quasi-Monte Carlo** (QMC) integration, whose error falls close to 1 / n rather than the 1 / sqrt(n) of Monte Carlo. QuasiMonteCarlo.jl generates these sequences behind one function, sample(n, lb, ub, algorithm).

| | |
|---|---|
| **Purpose** | Generate evenly spread points for integration, simulation, design of experiments and global optimisation starts |
| **Input** | The number of points, the lower and upper bounds of each dimension, and the sequence |
| **Core packages** | [QuasiMonteCarlo.jl](https://github.com/SciML/QuasiMonteCarlo.jl) |
| **Models** | Sobol, Halton, Faure, Latin Hypercube, Kronecker, Golden, Grid |
| **Output** | A d x n matrix, one column per point |
| **Key choice** | The sequence: Sobol for most uses, Latin Hypercube for designs, Halton or Kronecker in low dimensions |

## When to Use

- **Integrals and expectations** of smooth functions in moderate dimension: option pricing, Bayesian quadrature, risk.
- **Design of experiments** and sampling a parameter space for a surrogate model.
- **Starting points** for multistart optimisation.

## What It Is Not

Not random: the points are deterministic and correlated by construction, so the usual standard errors do not apply, and statistical tests of randomness fail by design. For an error estimate, use a **randomised** sequence such as scrambled Sobol. For pseudo-random draws, see the Random Numbers Generation panel.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
