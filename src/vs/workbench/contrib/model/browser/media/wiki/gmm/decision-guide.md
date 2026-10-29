# Decision Guide

| Situation | Estimator |
|---|---|
| Overidentified, heteroskedastic errors | **Two-Step Efficient GMM** |
| Just identified, or homoskedastic errors | **One-Step GMM (2SLS Weights)**: the same as 2SLS, with robust errors |
| Observations grouped in clusters | **Two-Step GMM, Cluster Bootstrap SEs** |
| Many instruments, small sample | One-step (2SLS) weights: the estimated optimal weight is unreliable |
| Weak instruments | Two-Stage Least Squares with the Anderson-Rubin interval |

## Decision Flow

1. **Write down the moment conditions** and the argument for each instrument's validity.
2. **Just identified?** Every weight gives the same estimate; GMM equals 2SLS (IV), and there is nothing to test.
3. **Overidentified?** Fit two-step GMM, and look at Hansen's J.
4. **Check the first stage**: GMM inherits the weak-instrument problem of 2SLS.
5. **Compare with 2SLS**: similar estimates with smaller standard errors are the expected outcome; very different estimates call for a closer look at the instruments.
6. **Clusters?** Use the cluster bootstrap for the standard errors, and read J with caution.

## Rules of Thumb
- **Keep the number of moments modest** relative to the sample.
- **Start from OLS** (the panel does) or 2SLS: GMM's objective is easy here, but nonlinear models need good starting values.
- **Report J with its degrees of freedom**, and the first-stage F.
- **Check with the bootstrap** in samples of a few hundred observations or fewer.

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
