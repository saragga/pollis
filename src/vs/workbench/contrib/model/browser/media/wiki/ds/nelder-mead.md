# Nelder-Mead

The **Nelder-Mead** method (Nelder and Mead, 1965) keeps a **simplex** of n + 1 points in n dimensions, a triangle in two, and changes its shape according to the function values at its vertices. At each iteration it replaces the worst vertex:
1. **Reflect** the worst vertex through the centroid of the others.
2. If the reflected point is the best so far, **expand** further in the same direction.
3. If it is no better than the second worst, **contract** towards the centroid.
4. If contraction fails too, **shrink** the whole simplex towards the best vertex.

## Behaviour
The simplex stretches along valleys and contracts across them, adapting to the local shape of f without derivatives. In two or three dimensions it is often the quickest of the direct search methods, and it uses one or two evaluations per iteration, except after a shrink.

## No Guarantee
Nelder-Mead has **no general convergence theory**. McKinnon (1998) gave a smooth, strictly convex function in two dimensions on which the simplex collapses onto a non-stationary point. In higher dimensions it degrades: the simplex can become nearly flat and stall. The practical remedy is to **restart** from the best point with a fresh simplex.

## On Non-Smooth Problems
On the default objective, whose minimum lies at a corner, Nelder-Mead usually gets close but can slow down near the kinks, since the simplex must shrink to fit the corner. The **Convergence Check**'s final poll shows whether it stopped at a stationary point.

## In This Panel
The panel uses Optim.jl's NelderMead() with its adaptive parameters (Gao and Han, 2012), which scale the reflection, expansion and contraction with the dimension, and its default initial simplex around x0. **Max Iterations** limits the iterations; the **Initial Step** does not apply.

## See Also
- [Pattern Search](pattern-search.md) · [MADS](mads.md) · [Decision Guide](decision-guide.md)
