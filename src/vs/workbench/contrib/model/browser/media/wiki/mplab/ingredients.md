# The Ingredients of a Solver

SQP and interior-point methods, the **Lagrange-Newton methods**, share their key algorithmic components. [Vanaret and Leyffer (2026)](#ref-VL2026a) abstract their workflows into a framework of eight building blocks, and Uno, their solver, combines a strategy for each block into a working method. The Mathematical Programming Lab exposes four of these ingredients as inputs, **Inequality Handling**, **Hessian Model**, **Globalization Mechanism** and **Globalization Strategy**, and leaves the others as the tab's preset sets them.

## Inequality Handling: Subproblems or a Barrier
**Inequality-Constrained Subproblems** keep the inequalities in each subproblem: a quadratic program in SQP, a linear program in SLP, solved by an active-set solver that decides which inequalities hold as equalities. **Interior Point** replaces the inequalities by a logarithmic barrier, so that each iteration solves one Newton system and the iterates stay strictly inside the bounds ([Nocedal and Wright (2006)](#ref-NW2006a)). The first identifies the active constraints along the way; the second has a cost per iteration that does not depend on how many constraints are active.

## Hessian Model: Exact, Quasi-Newton or None
The **Hessian Model** is the second-order information in the subproblem. **Exact** uses the Hessian of the Lagrangian, which JuMP computes from the expressions. **L-BFGS** and **L-SR1** build a limited-memory quasi-Newton approximation from the changes in the gradients, for problems whose second derivatives are unavailable or costly ([Nocedal and Wright (2006)](#ref-NW2006a)). **Identity** uses the identity matrix, a steepest-descent model. **Zero** drops the second-order term altogether, which turns a quadratic subproblem into a linear one: the Filter SLP tab is the filtersqp method with a zero Hessian.

## Globalization Mechanism and Strategy
The **Globalization Mechanism** decides how a step is shortened, a trust region or a line search, and the **Globalization Strategy** decides whether a trial point is accepted: Fletcher's filter, Wächter's filter, a funnel or a merit function. Both are described in [Filters, Funnels and Merit Functions](globalization.md).

## Constraint Relaxation: Feasibility Restoration
When a subproblem has no feasible point, which happens far from the solution as the linearized constraints may be inconsistent, the method needs a way forward. Every preset of the Lab uses **feasibility restoration**: the method switches to a phase that minimizes the constraint violation, and returns to the original problem once it has found a point the globalization strategy accepts ([Kiessling, Leyffer and Vanaret (2025)](#ref-KLV2025a)). The Lab keeps this ingredient as the preset sets it.

## What Each Preset Sets
The four tabs differ in these ingredients only. An override changes one ingredient and keeps the preset's other settings, such as its inertia correction and its norms, so a tab whose four ingredients are set to those of another tab need not behave like that tab.

| Tab (preset) | Inequality handling | Hessian model | Mechanism | Strategy |
|---|---|---|---|---|
| Interior Point (ipopt) | Interior point | Exact | Line search | Wächter's filter |
| Filter SQP (filtersqp) | Inequality-constrained | Exact | Trust region | Fletcher's filter |
| Funnel SQP (funnelsqp) | Inequality-constrained | Exact | Trust region | Funnel |
| Filter SLP (filterslp) | Inequality-constrained | Zero | Trust region | Fletcher's filter |

## Combinations Uno Does Not Accept
Uno has no trust-region interior-point method: with **Interior Point** as the Inequality Handling, the Globalization Mechanism must be **Line Search**. Uno does not report such a combination as an error but stops the Julia session, so the code of every tab checks the ingredients first, with a function, `supported`, and stops with a message instead. **Hessian Models** and **Globalization Strategies** skip the combinations it rejects and mark them as rejected by Uno.

## Combinations That Run but Rarely Converge
A **Zero** Hessian removes the curvature from the subproblem, and a linear subproblem has nothing to bound its step but a trust region ([Nocedal and Wright (2006)](#ref-NW2006a)). With a Zero Hessian, a line search or an interior-point method usually runs to the iteration limit, and the status is max_iter rather than first_order; sequential linear programming works with a trust region, as in the Filter SLP tab.

## References

<a id="ref-KLV2025a"></a>Kiessling, D., Leyffer, S. and Vanaret, C. (2025). A Unified Funnel Restoration SQP Algorithm. *Mathematical Programming* 217(1-2), 323–367. [doi:10.1007/s10107-025-02284-3](https://doi.org/10.1007/s10107-025-02284-3)

<a id="ref-NW2006a"></a>Nocedal, J. and Wright, S. J. (2006). *Numerical Optimization*. Springer (2nd ed.). [doi:10.1007/978-0-387-40065-5](https://doi.org/10.1007/978-0-387-40065-5)

<a id="ref-VL2026a"></a>Vanaret, C. and Leyffer, S. (2026). Implementing a Unified Solver for Nonlinearly Constrained Optimization. *Mathematical Programming Computation*. [doi:10.1007/s12532-026-00310-9](https://doi.org/10.1007/s12532-026-00310-9)

## See Also
- [Filters, Funnels and Merit Functions](globalization.md) · [Overview](overview.md) · [Reading the Comparison](comparison.md)
