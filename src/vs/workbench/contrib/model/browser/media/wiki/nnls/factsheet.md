# Non-Negative Least Squares — Factsheet

**Non-negative least squares** fits a linear model by least squares with every coefficient constrained to be zero or positive. It is a convex problem, so any local solution is a global one, and it is solved exactly by active-set methods in a finite number of steps. Unlike ordinary least squares it often sets some coefficients exactly to zero, which makes its solutions sparse without any tuning parameter.

| | |
|---|---|
| **Purpose** | Find the non-negative combination of known patterns that best reproduces a measurement |
| **Input** | A matrix A (m x n: rows are observations, columns are patterns) and a vector b of length m, or a matrix B (m x k) for k problems at once |
| **Core package** | [NonNegLeastSquares.jl](https://github.com/JuliaLinearAlgebra/NonNegLeastSquares.jl) |
| **Algorithms** | `:pivot` (Kim and Park, default), `:nnls` (Lawson and Hanson), `:fnnls` (Bro and De Jong), `:pivot` with variant `:comb` |
| **Output** | The solution x (n x 1, or n x k), with the residual norm and the number of nonzero components |
| **Key choice** | The algorithm, which changes the speed, not the answer |

## When to Use

- **Unmixing**: a measured spectrum, signal or profile is a sum of known components in unknown non-negative amounts (spectroscopy, mass spectrometry, remote sensing, sediment and pollution sources).
- **Deconvolution and recovery** of signals that cannot be negative, such as intensities, concentrations or counts.
- **Inside other methods**: non-negative matrix factorisation alternates NNLS problems with many right-hand sides.

## What It Is Not

NNLS gives a point estimate, with no standard errors or tests; the usual least-squares formulas do not hold when coefficients sit at zero. It constrains signs only: weights that must also sum to one, or lie below a ceiling, need a more general constrained solver. And it does not choose the patterns: a wrong or missing column of A biases every amount.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
