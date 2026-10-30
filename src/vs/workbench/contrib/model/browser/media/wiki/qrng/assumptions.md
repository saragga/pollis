# Assumptions

## Smoothness of the Integrand
The QMC advantage rests on the Koksma-Hlawka inequality: the integration error is at most the **variation** of the function times the **discrepancy** of the points. Low-discrepancy points make the second factor about (log n)^d / n, but only for functions of bounded variation. Discontinuities, kinks not aligned with the axes, and indicator functions reduce the gain toward the Monte Carlo rate.

## Effective Dimension
The (log n)^d factor grows quickly with d: in 50 dimensions it would swamp 1 / n for any practical n. QMC still works well in high dimension when the function depends mostly on a few variables, or on low-order interactions: its **effective dimension** is small. Ordering the variables so that the most important come first, in the early dimensions of Sobol, helps.

## Sample Size
The sequences are balanced only at particular n:
- **Sobol** at powers of 2: 128, 256, 512. An n in between breaks the net structure and can give a larger error than the power of 2 below it.
- **Faure** at multiples of powers of its prime base.
- **Halton, Kronecker, Golden and Latin Hypercube** at any n.

## Bounds
The points are generated in the unit cube and rescaled to [lb, ub]. Integration over another distribution needs a transformation, such as the inverse CDF of each margin, which must be smooth for the QMC rate to carry over.

## No Randomness, No Standard Error
A deterministic sequence gives one answer with no variance: there is no standard error to report. **Randomised QMC** (Owen scrambling, random shifts) keeps the low discrepancy and makes each replicate unbiased, so that independent replicates give a valid standard error.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
