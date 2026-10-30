# Quasi-Random Numbers Generation — Overview

Every model calls QuasiMonteCarlo.sample with **Number of Samples (n)**, **Lower Bounds (lb)** and **Upper Bounds (ub)**, one bound per dimension: zeros(2) and ones(2) give the unit square.

## The Sequences
- **Sobol**: digital (t, s)-sequences in base 2, the standard choice for integration, also in high dimension. Best balanced at n a power of 2.
- **Halton**: a van der Corput sequence in a different prime base per dimension; good up to about 10 dimensions, after which its projections on pairs of high-base dimensions become striped.
- **Faure**: one prime base, the smallest prime at least the dimension, with permuted digits per dimension; balanced when n is a multiple of a power of that base.
- **Latin Hypercube**: random stratification so that each dimension has exactly one point in each of n equal slices. Even margins, random joint placement.
- **Kronecker**: the points i x alpha modulo 1, with the **Alpha Vector (alpha)** of irrational numbers, sqrt(2) and sqrt(3) by default.
- **Golden**: a Kronecker sequence built on the golden ratio, very even in one and two dimensions.
- **Grid**: points from a regular grid of n levels per axis: a baseline, not an integration rule.

## Common Workflow

1. Set **Number of Samples (n)**, **Lower Bounds (lb)** and **Upper Bounds (ub)**, and choose a sequence.
2. Compare the **Points Against Pseudo-Random** and the **Order of Filling**.
3. Measure the **L2-Star Discrepancy** and the **One-Dimensional Projections**.
4. Integrate with the **Quasi-Monte Carlo Integral** and the **Error Against Sample Size**.
5. Compare the **Algorithms Side by Side** and the **Scrambled Sobol Error Bars**.
6. Check **Is n a Good Sample Size?** and the **Convergence Rate**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
