# BOBYQA

Bound Optimisation BY Quadratic Approximation, from [Powell (2009)](#ref-Pow2009a), minimises a smooth function inside a box. Bounded parameters are the most common form of derivative-free problem, which makes **BOBYQA** the usual place to start.

## What problem does BOBYQA solve?

**BOBYQA** minimises f(x) subject to **Lower Bounds** ≤ x ≤ **Upper Bounds**. The panel calls `bobyqa(fr, x0; xl=lb, xu=ub, maxfun, rhobeg, rhoend=1e-8)`, from the package of [Zhang (2023)](#ref-Zha2023a).

The feature that sets it apart is that every evaluation satisfies the bounds, according to Powell's report. That matters when f fails or means nothing outside the box: a negative variance, a probability above 1, a simulation with an invalid setting. **COBYLA** gives no such promise during its search.

## How the quadratic model gets by with few points

A full quadratic in n variables has (n + 1)(n + 2) / 2 coefficients, and **BOBYQA** by default uses only 2n + 1 points. The points fix part of the model, and the rest comes from a rule.

Of all quadratics that pass through the current points, the method takes the one whose second-derivative matrix changes least from the previous model, measured in the Frobenius norm. The idea and its algebra are in [Powell (2004)](#ref-Pow2004a). Each new evaluation updates the model at a cost of order n², not by a fresh fit, and curvature is learned gradually as the run goes on.

## How one iteration works

1. Minimise the quadratic model over the intersection of the box and a ball of radius delta, around the best point.
2. If that step is very short, the current model is good on this scale: replace a poorly placed point, or lower the radius.
3. Otherwise evaluate f at the trial point, compare the actual and predicted reductions, and adjust delta.
4. Swap the trial point into the interpolation set in place of one of the current points.

Two radii run through the process. delta governs trial steps, and rho, starting at **Initial Radius** and ending at `rhoend`, sets a lower limit on delta and the resolution of the model. rho falls in stages, and only when the method has done what it can at the present scale.

## What the Initial Radius has to satisfy

Each box side must be at least twice **Initial Radius**, as the tooltip states, since the first points lie that far from the start along each axis and have to fit inside the box.

A start close to a bound is moved so that the first points fit, either onto the bound or a full radius inside it. The result is that **Solution Summary** can show a `start` that differs from the first point actually evaluated, as **Query Scatter** reveals. When a side of the box is narrow, rescale that variable before lowering the radius for all of them, since a very small radius slows the whole run.

## When BOBYQA struggles

The method assumes f is smooth on the scale of the radius, so noise or kinks show as a run that stops early, often with a large `projected_gradient_norm` in **Convergence Check**. Try **Sbplx**, or raise `rhoend` in the code.

Long curved valleys cost many evaluations, as the model has only limited curvature information early on, and **Warm Start** often gains from rebuilding it. A partial quadratic is also weaker than a full one in very small dimensions, which is where a look at **UOBYQA** can pay off if the box is not needed. Comparative results on bound-constrained test sets are in [Rios and Sahinidis (2013)](#ref-RS2013a).

## Reading a BOBYQA run

**Bounds Feasibility** shows which variables end on the box, through `at_lower` and `at_upper`. Each such variable contributes a row to `multipliers` in **Scaling Check**, in which a positive value is the rate at which f would fall if that bound were moved outward. A large multiplier on an arbitrary bound suggests widening the box and running again.

`inside_box` should always be `true` on **BOBYQA**, and a `false` there would indicate a problem with the inputs. The `violation` output is `bound_violation` and so should read exactly zero. The convergence theory of methods of this family is in [Conn, Scheinberg and Vicente (2009)](#ref-CSV2009a).

## References

<a id="ref-CSV2009a"></a>Conn, A. R., Scheinberg, K., & Vicente, L. N. (2009). *Introduction to Derivative-Free Optimization*. SIAM. [doi:10.1137/1.9780898718768](https://doi.org/10.1137/1.9780898718768)

<a id="ref-Pow2004a"></a>Powell, M. J. D. (2004). Least Frobenius Norm Updating of Quadratic Models That Satisfy Interpolation Conditions. *Mathematical Programming* 100(1), 183-215. [doi:10.1007/s10107-003-0490-7](https://doi.org/10.1007/s10107-003-0490-7)

<a id="ref-Pow2009a"></a>Powell, M. J. D. (2009). The BOBYQA Algorithm for Bound Constrained Optimisation Without Derivatives. Report DAMTP 2009/NA06, University of Cambridge.

<a id="ref-RS2013a"></a>Rios, L. M., & Sahinidis, N. V. (2013). Derivative-Free Optimization: A Review of Algorithms and Comparison of Software Implementations. *Journal of Global Optimization* 56(3), 1247-1293. [doi:10.1007/s10898-012-9951-y](https://doi.org/10.1007/s10898-012-9951-y)

<a id="ref-Zha2023a"></a>Zhang, Z. (2023). PRIMA: Reference Implementations for Powell's Methods with Modernization and Amelioration.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [COBYLA](cobyla.md) · [NEWUOA](newuoa.md) · [UOBYQA](uobyqa.md) · [LINCOA](lincoa.md) · [PRAXIS](praxis.md) · [Sbplx](sbplx.md)
