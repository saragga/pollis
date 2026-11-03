# Sbplx

`NLopt`'s version of the Subplex method of [Rowan (1990)](#ref-Row1990a) runs Nelder-Mead on small groups of variables in turn. It fits no model, so a noisy or kinked objective does far less damage than it does to the interpolation methods.

## What problem does Sbplx solve?

**Sbplx** minimises f(x) inside the box given by **Lower Bounds** and **Upper Bounds**. The panel runs `NLopt.Opt(:LN_SBPLX, n)` from the package of [Johnson (2007)](#ref-Joh2007a), with `lower_bounds`, `upper_bounds`, `maxeval`, `xtol_rel = 1e-10` and `initial_step = fill(rhobeg, n)`.

Johnson's code is a reimplementation of Rowan's method and not a wrapper of the original. **Initial Radius** sets the first step of the search, and it has no connection with a trust region here. The bounds apply in the main run, so the method's `violation` is `bound_violation`.

## What Nelder-Mead does and where it fails

The method of [Nelder and Mead (1965)](#ref-NM1965a) keeps a simplex of n + 1 points. It repeatedly replaces the worst vertex with a point found by reflecting it through the centre of the others, and expands or contracts the simplex according to the result.

Only the order of the values matters, which explains its tolerance of noise and kinks. Two weaknesses limit it. In many dimensions the simplex loses its shape and stalls, and the theory is thin even in low dimensions: [Lagarias, Reeds, Wright and Wright (1998)](#ref-LRWW1998a) prove convergence for strictly convex functions only in dimension 1 and limited results in dimension 2, and report a counterexample of McKinnon in which it converges to a point that is not a minimiser.

## How the Subplex idea helps

Rowan's approach is to split the variables into small groups and run Nelder-Mead on each group's subspace, with the other variables held fixed.

1. Rank the variables by how much they have moved lately.
2. Split them into subspaces of low dimension, with the most active variables first.
3. Run Nelder-Mead on each subspace in turn, from a simplex sized by recent progress.
4. Test for convergence, and rebuild the groups from the new progress vector.

The low dimension keeps every simplex in the range where Nelder-Mead behaves well. Reassigning groups lets interacting variables meet in one subspace when they matter together. Rowan's thesis developed the method for the stability analysis of numerical algorithms, where f is the kind of rough quantity that defeats a smooth model.

## When should Sbplx be the choice?

| Objective | Is **Sbplx** suited? | Comment |
|---|---|---|
| Smooth, with bounds | Works, but not first choice | **BOBYQA** normally costs fewer evaluations |
| Noisy | Yes | Comparisons are less disturbed by noise than fitted curvature is |
| Kinked or piecewise | Yes | No model has to represent the kink |
| Many variables, rough | Yes | Plain Nelder-Mead tends to stall in this setting |
| Discontinuous | With care | Can get stuck on a step, so use **Multi-Start** |

A wide empirical comparison including non-smooth problems is in [Rios and Sahinidis (2013)](#ref-RS2013a).

## Comparing Sbplx with plain Nelder-Mead

**Method Comparison** includes both, through `:LN_SBPLX` and `:LN_NELDERMEAD`, with the same start, budget and box.

As n grows, the gap in `minimum` usually widens in favour of **Sbplx**. At very small n the two nearly coincide, since a subspace can hold most of the variables. A review of the wider family of direct-search methods is in [Conn, Scheinberg and Vicente (2009)](#ref-CSV2009a), and more of them are in the **Direct Search Methods** panel.

## Reading a Sbplx run

`status` comes from `NLopt`, and `XTOL_REACHED` means that the simplex steps have become tiny relative to x. A stop there is not a proof of a minimum, so **Convergence Check** and **Warm Start** matter more for **Sbplx** than for the model-based methods. On a kinked objective, `gradient_norm` from central differences is often large even at a good point, and it has little meaning there.

**Convergence Curve** generally falls in staircase fashion, each flat stretch a subspace with little to offer. **Query Scatter** shows that some stretches move only one of the two plotted variables, or neither, because they belong to other subspaces. Treat `reduced_hessian_eigenvalues` with similar caution when f is not smooth.

## References

<a id="ref-CSV2009a"></a>Conn, A. R., Scheinberg, K., & Vicente, L. N. (2009). *Introduction to Derivative-Free Optimization*. SIAM. [doi:10.1137/1.9780898718768](https://doi.org/10.1137/1.9780898718768)

<a id="ref-Joh2007a"></a>Johnson, S. G. (2007). The NLopt Nonlinear-Optimization Package. [github.com/stevengj/nlopt](https://github.com/stevengj/nlopt)

<a id="ref-LRWW1998a"></a>Lagarias, J. C., Reeds, J. A., Wright, M. H., & Wright, P. E. (1998). Convergence Properties of the Nelder-Mead Simplex Method in Low Dimensions. *SIAM Journal on Optimization* 9(1), 112-147. [doi:10.1137/S1052623496303470](https://doi.org/10.1137/S1052623496303470)

<a id="ref-NM1965a"></a>Nelder, J. A., & Mead, R. (1965). A Simplex Method for Function Minimization. *The Computer Journal* 7(4), 308-313. [doi:10.1093/comjnl/7.4.308](https://doi.org/10.1093/comjnl/7.4.308)

<a id="ref-RS2013a"></a>Rios, L. M., & Sahinidis, N. V. (2013). Derivative-Free Optimization: A Review of Algorithms and Comparison of Software Implementations. *Journal of Global Optimization* 56(3), 1247-1293. [doi:10.1007/s10898-012-9951-y](https://doi.org/10.1007/s10898-012-9951-y)

<a id="ref-Row1990a"></a>Rowan, T. H. (1990). Functional Stability Analysis of Numerical Algorithms. PhD Thesis, University of Texas at Austin.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [COBYLA](cobyla.md) · [BOBYQA](bobyqa.md) · [NEWUOA](newuoa.md) · [UOBYQA](uobyqa.md) · [LINCOA](lincoa.md) · [PRAXIS](praxis.md)
