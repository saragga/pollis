# Model-Based Methods: Assumptions

Going without derivatives removes one requirement and leaves several others. The methods still assume a good deal about the objective, about the scale of the variables and about how far the budget can stretch, and a breach usually shows up as a run that ends quietly at a poor point.

## Is the objective smooth enough?

Fitting a linear or quadratic model only helps if a linear or quadratic function describes f well over a small region. **COBYLA**, **BOBYQA**, **NEWUOA**, **UOBYQA** and **LINCOA** assume that, and **PRAXIS** assumes it too through its line searches.

The assumption is local. A rugged landscape at large scale is fine as long as f is smooth on the scale of the final radius. Kinks are the real problem, such as a maximum, an absolute value or a rounded output, because no quadratic represents them and the radius may collapse at a point that is not a minimum. **Sbplx** compares values and fits nothing, so it is the panel's method for such objectives. Its convergence is not guaranteed either, since the theory of Nelder-Mead itself is thin, as [Lagarias, Reeds, Wright and Wright (1998)](#ref-LRWW1998a) set out.

## What noise does to the methods

Noise here means an objective that returns a slightly different or a jagged value at nearly the same point, as a simulation or an adaptive integrator often does. Differences in f below the noise level are meaningless, yet a model built on a very small radius consists of nothing but those differences.

The default `rhoend` of 1e-8 and `xtol_rel` of 1e-10 assume values accurate almost to machine precision. With noise, the final stages of a run chase nothing, spending evaluations and reporting a `minimum` that is partly luck. Raise the two settings in the code to a scale where f changes clearly more than its noise, and use a fixed seed inside f if it is random. The noisy problem sets of [Moré and Wild (2009)](#ref-MW2009a) show that model-based solvers can still work at that coarser level.

## Are the variables on similar scales?

One radius applies to every variable. A variable measured in thousands and another in thousandths share the same trust region, so a step that suits the first is enormous for the second, and the model loses its balance.

The methods are not invariant to rescaling, which makes rescaling a modelling decision. Choose units in which a change of **Initial Radius** is meaningful for each variable, usually by dividing each by its typical size or by the width of its box. **Scaling Check** reports `variable_magnitudes`, `box_sides` and the curvature in the free directions, which together show whether that has been done. A trust-region theory in which the region is reshaped by a scaling matrix is discussed by [Nocedal and Wright (2006)](#ref-NW2006a), but the panel's calls take no such matrix, so the rescaling has to be written into **Objective f(x)**.

## How many variables can the budget support?

A model needs points before it can suggest anything. **UOBYQA** evaluates (n + 1)(n + 2) / 2 points first, which grows quickly with n, and **BOBYQA**, **NEWUOA** and **LINCOA** evaluate 2n + 1 by default.

**Max Evaluations** has to leave room after that for the iterations that do the actual work, and hard valleys take many of those. With few evaluations per variable, a method can only return the best point it has seen, not a converged minimum. Dimension also raises the cost of the method's own arithmetic, which becomes visible when f is cheap. [Rios and Sahinidis (2013)](#ref-RS2013a) report how solvers compare across problems of different sizes, and **Budget Sweep** shows the budget effect directly on the problem in hand.

## A local answer, not a global one

All seven methods look for a local minimiser near **Starting Point**. A trust-region method can escape a shallow dip while its radius is large, and that is the extent of its global behaviour.

Nothing in `status` or in `gradient_norm` separates a local minimiser from the global one, because both satisfy the same conditions. **Multi-Start** repeats the search from random points in the box and is the panel's only evidence on this point. Agreement among ten starts is encouraging but proves nothing, and a problem with many minima needs a method from **Global Optimisation**.

## What each method assumes about constraints

| Method | Assumes | Consequence if not met |
|---|---|---|
| **COBYLA** | f and c can be computed at infeasible points | The search needs them, so an error there stops it |
| **BOBYQA** | Each box side is at least twice **Initial Radius** | The call cannot proceed as asked |
| **LINCOA** | Constraints are truly linear in x | A nonlinear rule cannot be stated in **Constraint Matrix (A)** |
| **Sbplx** | Limits are simple bounds | Others have to go into **Objective f(x)** as a penalty |
| **NEWUOA**, **UOBYQA**, **PRAXIS** | No constraints at all | The minimiser may lie outside the box |

Only inequalities are available. An equality constraint is best removed by substituting it into **Objective f(x)**.

## Where f must be defined

The solvers and several actions call f at points that may lie outside the region of interest, and a domain error there stops the action with a message.

**BOBYQA** keeps its evaluations inside the box. **COBYLA** does not promise that during the search, and **NEWUOA**, **UOBYQA** and **PRAXIS** ignore the box altogether. **Sensitivity**, **Convergence Check** and **Scaling Check** also step beyond the minimiser, and so past a bound or a constraint when the minimiser is on one. If f involves `log` or `sqrt` of something that can turn negative, guard it in the expression. An objective returning `NaN` or `Inf` gives a model nothing to work with, so a large finite value is the safer choice.

## References

<a id="ref-LRWW1998a"></a>Lagarias, J. C., Reeds, J. A., Wright, M. H., & Wright, P. E. (1998). Convergence Properties of the Nelder-Mead Simplex Method in Low Dimensions. *SIAM Journal on Optimization* 9(1), 112-147. [doi:10.1137/S1052623496303470](https://doi.org/10.1137/S1052623496303470)

<a id="ref-MW2009a"></a>Moré, J. J., & Wild, S. M. (2009). Benchmarking Derivative-Free Optimization Algorithms. *SIAM Journal on Optimization* 20(1), 172-191. [doi:10.1137/080724083](https://doi.org/10.1137/080724083)

<a id="ref-NW2006a"></a>Nocedal, J., & Wright, S. J. (2006). *Numerical Optimization* (2nd ed.). Springer. [doi:10.1007/978-0-387-40065-5](https://doi.org/10.1007/978-0-387-40065-5)

<a id="ref-RS2013a"></a>Rios, L. M., & Sahinidis, N. V. (2013). Derivative-Free Optimization: A Review of Algorithms and Comparison of Software Implementations. *Journal of Global Optimization* 56(3), 1247-1293. [doi:10.1007/s10898-012-9951-y](https://doi.org/10.1007/s10898-012-9951-y)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [COBYLA](cobyla.md) · [BOBYQA](bobyqa.md) · [NEWUOA](newuoa.md) · [UOBYQA](uobyqa.md) · [LINCOA](lincoa.md) · [PRAXIS](praxis.md) · [Sbplx](sbplx.md)
