# Decision Guide

| Situation | Method |
|---|---|
| Low dimension, smooth or mildly noisy, quickest to try | **Nelder-Mead** |
| Simple, predictable search, cheap evaluations | **Pattern Search** |
| Black-box, non-smooth or simulation-based, guarantees wanted | **MADS** |
| Smooth, fewer polls per iteration, step expansion | **GSS** |
| Gradients available | BFGS or Newton (Local Optimisation) |
| Many local minima | Global optimisation (Global Optimisation panel) |

## Decision Flow

1. **Try Nelder-Mead** first: it is fast on small problems.
2. **If it stalls**, or the problem is non-smooth, switch to **MADS**.
3. **Check the Convergence Check's** final poll and the **Restart Sensitivity**.
4. **If f is smooth**, compare with BFGS: if BFGS works, use it.
5. **Budget the evaluations** with the **Evaluation Budget** when each one is expensive.

## Rules of Thumb

- **Scale the variables** to similar ranges before searching.
- **Initial Step about a tenth** of the expected distance to the solution.
- **Expect hundreds of evaluations** for a few digits in a few dimensions, thousands beyond five or ten.
- **Restart Nelder-Mead** from its solution: a restart rebuilds a collapsed simplex and often improves the result.
- **Under noise**, stop when the step falls below the scale at which the noise dominates.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
