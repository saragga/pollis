# Variational Inequalities: Assumptions

What the **Variational Inequalities** panel takes for granted about the set K, the operator F and the moving set K(x), and what its code expects of them.

## A box for K

The panel's sets are boxes, K = [lb, ub], with one lower and one upper bound per variable. The first bullet asks for a convex set K, and a box is one. The decision table builds the VI page on that shape: on a box, the VI is exactly the mixed complementarity problem, solved with PATH through JuMP.

In the code, each finite bound becomes a bound on the JuMP variable, and an infinite one is left out, which is how the tooltips of **Lower Bounds lb** and **Upper Bounds ub** ask for `-Inf` and `Inf` when there is no bound. JuMP then reads the interval of each complementarity pair from the bounds of its variable.

## The operator

**Operator F(x)** is a vector of n Julia expressions in `x[1]` to `x[n]`, and its tooltip asks for **Dimension n** to match its length. The code wraps the expressions in `Fop(x)` and passes `Fop(x)` to `complements(F(x), x)`, so F must accept the JuMP variables as well as numbers, as the actions evaluate it at plain vectors.

The default operator is affine in x, minus the marginal profit of each firm. [Dirkse and Ferris (1995)](#ref-DF1995a) present PATH as a stabilised Newton method for the mixed complementarity problem, globally convergent under assumptions that generalise those of the smooth case.

## Starting points

PATH starts from the values given to the variables. In `solve_vi`, every variable starts at 0.5 unless another start is passed; the QVI iteration passes its current point, so that each VI solve starts from the last iterate.

Both the VI and the QVI report whether their solves succeeded: `solved` in the output, and `ok` inside the code, which the Parametric VI action uses to mark the shifts where a solve failed.

## The moving set

**Moving Set K(x)** is a Julia expression in x that returns the tuple (lb, ub). The QVI code evaluates it at the current iterate, solves the VI on that box and moves halfway towards the new solution, so K(x) has to be defined at every point the iteration visits.

The default ties each firm's upper bound to the other's output, 5 − x_j, which the decision table describes as a shared capacity x1 + x2 ≤ 5. Its context names generalised Nash equilibria with shared resources, where each player's feasible set depends on the others' decisions.

## Uniqueness

The decision table of the QVI states that generalised Nash equilibria are typically not unique, and that the point reached depends on the start and on the damping. The QVI code starts from `x0 = zeros(n)` with `damp = 0.5`, and the decision table adds that, undamped, the default problem cycles.

The VI page runs a single solve from the start of 0.5 in every coordinate. The decision table names its contexts: Nash-Cournot equilibria with capacities, traffic equilibria, contact problems and the KKT systems of convex programmes.

## References

<a id="ref-DF1995a"></a>Dirkse, S. P., & Ferris, M. C. (1995). The PATH Solver: A Nonmonotone Stabilization Scheme for Mixed Complementarity Problems. *Optimization Methods and Software* 5(2), 123-156. [doi:10.1080/10556789508805606](https://doi.org/10.1080/10556789508805606)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Variational Inequality (VI)](vi.md) · [Quasi-Variational Inequality (QVI)](qvi.md)
