# Interpretation

## The Test Function
The integral actions use f(x) = product of 2 x_k, whose integral over the unit cube is exactly 1, so the error is known.

## Quasi-Monte Carlo Integral
**Quasi-Monte Carlo Integral** gives the absolute error of the average of f over the sequence and over pseudo-random points of the same size. With n = 128 in two dimensions, the QMC error is typically an order of magnitude smaller.

## Error Against Sample Size
**Error Against Sample Size** plots both errors against n from 16 to 8192 (powers of the base for Faure) on log scales, with reference lines 1 / sqrt(n) and 1 / n. The pseudo-random error follows 1 / sqrt(n) with noise; the QMC error should run along 1 / n.

## Convergence Rate
**Convergence Rate** fits the slope of log error on log n. Monte Carlo gives about -0.5; a good sequence on this smooth function gives close to -1. A slope near -0.5 for the sequence means its structure is not helping: the function is rough, the dimension too high, or n badly chosen.

## Algorithms Side by Side
**Algorithms Side by Side** ranks Sobol, Halton, Latin Hypercube, Golden, a lattice rule and pseudo-random by their L2-star discrepancy at the chosen n and dimension. Latin Hypercube usually sits between the low-discrepancy sequences and pseudo-random: even margins, random joint placement.

## Scrambled Sobol Error Bars
**Scrambled Sobol Error Bars** runs 20 independently Owen-scrambled Sobol sets at the next power of 2 and 20 pseudo-random sets, and gives the mean estimate with its standard error for each. The scrambled estimate's standard error is the honest uncertainty of QMC, typically far below that of Monte Carlo.

## Is n a Good Sample Size?
**Is n a Good Sample Size?** says whether n is balanced for the sequence, and the nearest balanced sizes below and above.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
