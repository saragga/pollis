# NEWUOA

The method of [Powell (2006)](#ref-Pow2006a) minimises an unconstrained smooth function with a quadratic model built from far fewer points than a full quadratic needs. Its low cost per iteration lets it handle far more variables than a full quadratic model could.

## What problem does NEWUOA solve?

**NEWUOA** minimises f(x) with no limits on x. The panel calls `newuoa(fr, x0; maxfun, rhobeg, rhoend=1e-8)`, from the package of [Zhang (2023)](#ref-Zha2023a), and **Lower Bounds** and **Upper Bounds** play no part in the search.

The box still has two uses: **Multi-Start** samples from it, and **Objective Surface** draws within it. The minimiser may lie outside, and the printed `violation` is defined as 0.0 for this method, so check `inside_box` in **Bounds Feasibility** when the box has a meaning for the problem. A method that respects limits is usually the better choice if the limits matter.

## What is the least-change update?

The default model passes through 2n + 1 points, which leaves many coefficients of a quadratic undetermined. Those are settled by asking for the smallest change in the second-derivative matrix compared with the previous model, in the Frobenius norm, the rule studied by [Powell (2004)](#ref-Pow2004a).

The first model, from x0 and x0 ± **Initial Radius** along each axis, has a diagonal second-derivative matrix. Later points add off-diagonal curvature as they arrive. With 2n + 1 points, routine work per iteration grows as n², where the full model of **UOBYQA** costs of order n⁴.

## How one iteration works

1. Minimise the quadratic model within a ball of radius delta around the best point, by truncated conjugate gradients.
2. Evaluate f at the trial point, compare the reductions, and adjust delta.
3. Add the new point in place of an existing one, then apply the least-change update.
4. When steps turn short or results disappoint, move a distant interpolation point to improve the geometry of the set, or reduce rho.

As on the other Powell methods, rho starts at **Initial Radius**, ends at `rhoend`, and limits delta from below. Most iterations cost a single evaluation of f.

## How many variables can it handle?

The panel's table describes **NEWUOA** as scaling to a few hundred variables. The arithmetic stays modest, and the first model takes only 2n + 1 evaluations.

The harder limit is the number of evaluations itself, since it takes many more to learn a large curvature matrix one point at a time. A function that is fast to compute suits large n, while an expensive one may leave the method with little more than a slope estimate by the end of the budget. In that situation **Convergence Curve** falls slowly and **Budget Sweep** keeps improving at every step, as a sign that the budget is what limits the answer.

## Choosing between NEWUOA and its neighbours

| Situation | Choice | Reason |
|---|---|---|
| Unconstrained, n in the tens or more | **NEWUOA** | Cost per iteration stays low |
| Unconstrained, very small n | **UOBYQA** | A full model pays off |
| Bounds matter | **BOBYQA** | Same update rule, keeps to the box |
| Linear limits matter | **LINCOA** | Same model, handles A x ≤ b |
| Rough or noisy f | **Sbplx** | No model to mislead |

The solver family is compared with direct search by [Moré and Wild (2009)](#ref-MW2009a), and the framework is explained by [Conn, Scheinberg and Vicente (2009)](#ref-CSV2009a).

## Reading a NEWUOA run

An unconstrained minimum has a small `gradient_norm` in **Convergence Check**, and `projected_gradient_norm` equals it because `active_constraints` is 0. **Scaling Check** shows the eigenvalues of the full Hessian in that case, all of which should be positive.

**Warm Start** tells whether the first run stopped at a true minimum. A partial model can stall with poorly placed points, and the restart builds a new set around the solution, often for a modest number of `extra_evaluations`.

## References

<a id="ref-CSV2009a"></a>Conn, A. R., Scheinberg, K., & Vicente, L. N. (2009). *Introduction to Derivative-Free Optimization*. SIAM. [doi:10.1137/1.9780898718768](https://doi.org/10.1137/1.9780898718768)

<a id="ref-MW2009a"></a>Moré, J. J., & Wild, S. M. (2009). Benchmarking Derivative-Free Optimization Algorithms. *SIAM Journal on Optimization* 20(1), 172-191. [doi:10.1137/080724083](https://doi.org/10.1137/080724083)

<a id="ref-Pow2004a"></a>Powell, M. J. D. (2004). Least Frobenius Norm Updating of Quadratic Models That Satisfy Interpolation Conditions. *Mathematical Programming* 100(1), 183-215. [doi:10.1007/s10107-003-0490-7](https://doi.org/10.1007/s10107-003-0490-7)

<a id="ref-Pow2006a"></a>Powell, M. J. D. (2006). The NEWUOA Software for Unconstrained Optimisation Without Derivatives. In *Large-Scale Nonlinear Optimization*, 255-297. Springer. [doi:10.1007/0-387-30065-1_16](https://doi.org/10.1007/0-387-30065-1_16)

<a id="ref-Zha2023a"></a>Zhang, Z. (2023). PRIMA: Reference Implementations for Powell's Methods with Modernization and Amelioration.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [COBYLA](cobyla.md) · [BOBYQA](bobyqa.md) · [UOBYQA](uobyqa.md) · [LINCOA](lincoa.md) · [PRAXIS](praxis.md) · [Sbplx](sbplx.md)
