# Variational Inequalities: Variational Inequality (VI)

The **Variational Inequality** model finds x* in a fixed box K = [lb, ub] with F(x*)ᵀ(y − x*) ≥ 0 for every y in K. The panel writes it as a mixed complementarity problem in JuMP and solves it with PATH.

## The condition

The decision table gives the purpose: find x* in K with F(x*)ᵀ(y − x*) ≥ 0 for every y in K. The first bullet reads it as a point where the operator F points inward, so that no feasible direction improves the objective.

On a box, the decision table goes on, this is exactly the mixed complementarity problem. Following the JuMP documentation, each pair F_i(x) ⟂ x_i requires F_i = 0 when x_i lies strictly between its bounds, F_i ≥ 0 when x_i is at its lower bound, and F_i ≤ 0 when x_i is at its upper bound.

## The code

```
function solve_vi(F=Fop; K=Kset(zeros(n)), start=fill(0.5, n))
    lb, ub = K
    m = Model(PATHSolver.Optimizer); set_silent(m)
    @variable(m, x[i=1:n], start = start[i])
    for i in 1:n
        isfinite(lb[i]) && set_lower_bound(x[i], lb[i])
        isfinite(ub[i]) && set_upper_bound(x[i], ub[i])
    end
    @constraint(m, complements(F(x), x))
    optimize!(m)
    ...
end
```

The function returns the solution, whether the termination status is `LOCALLY_SOLVED`, and the raw status of the solver. For the VI, `solve()` makes a single call, since, as the code comment says, a fixed K needs a single VI solve.

## PATH

[Dirkse and Ferris (1995)](#ref-DF1995a) present PATH as a stabilised Newton method for the mixed complementarity problem. A path-generation procedure constructs a piecewise linear path from the current point to the Newton point, and a step length acceptance criterion with a non-monotone pathsearch picks the next iterate.

In the JuMP tutorial on mixed complementarity problems, PATHSolver solves linear complementarity, transportation, insurance and electricity market equilibria written with the ⟂ operator or `complements`, the same syntax the panel uses.

## The default problem

The default is a Cournot duopoly with costs 1 and 2, price 10 − x1 − x2 and a capacity of 3 for each firm. The operator is minus the marginal profit of each firm,

F_i(x) = c_i − (10 − x1 − x2) + x_i,

with the box [0, 3] × [0, 3]. The decision table lists further contexts: traffic equilibria, contact problems and KKT systems of convex programmes.

## Actions for the VI

**VI Residual** checks the inequality on random points of the box, and **Bounds vs NCP** removes the upper bounds and solves again. **Parametric VI** shifts F down by t from −3 to 3, starts each solve at the previous solution and plots the path. **Equilibrium Interpretation** then labels each component as interior or at a bound. **Operator Field** draws −F over the box in the first two coordinates, and **Gap Function** compares the gap at the start point with the gap at x*.

## Background

[Dafermos and Sparrow (1969)](#ref-DS1969a) formulate traffic assignment on a general network under two criteria, total cost minimisation by a central authority and user optimisation, where each user takes the cheapest route given the others, and construct algorithms for both. They recall that the two criteria lead in general to different traffic patterns, as Pigou first observed in an example of a simple network with two nodes and two links, and that Wardrop calculated both patterns for two nodes joined by n independent paths.

## References

<a id="ref-DS1969a"></a>Dafermos, S. C., & Sparrow, F. T. (1969). The Traffic Assignment Problem for a General Network. *Journal of Research of the National Bureau of Standards, Section B* 73B(2), 91-118. [doi:10.6028/jres.073B.010](https://doi.org/10.6028/jres.073B.010)

<a id="ref-DF1995a"></a>Dirkse, S. P., & Ferris, M. C. (1995). The PATH Solver: A Nonmonotone Stabilization Scheme for Mixed Complementarity Problems. *Optimization Methods and Software* 5(2), 123-156. [doi:10.1080/10556789508805606](https://doi.org/10.1080/10556789508805606)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Quasi-Variational Inequality (QVI)](qvi.md)
