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

**Convergence Check** runs, for the VI, the projection method x ← P_K(x − γF(x)) with γ = 0.2 from the origin and plots its step lengths, while the solution itself comes from PATH.

**Bounds vs NCP** removes the upper bounds and solves again, and **Parametric VI** shifts F down by t from −3 to 3 and plots the path of the solution. **Equilibrium Interpretation** then labels each component as interior or at a bound.

## Background

[Dafermos and Sparrow (1969)](#ref-DS1969a) formulate traffic assignment on a general network under two criteria, total cost minimisation by a central authority and user optimisation, where each user takes the cheapest route given the others, and construct algorithms for both. The panel lists the textbooks of [Facchinei and Pang (2003)](#ref-FP2003a) and [Kinderlehrer and Stampacchia (1980)](#ref-KS1980a) for the theory of the VI.

## References

<a id="ref-DS1969a"></a>Dafermos, S. C., & Sparrow, F. T. (1969). The Traffic Assignment Problem for a General Network. *Journal of Research of the National Bureau of Standards, Section B* 73B(2), 91-118. [doi:10.6028/jres.073B.010](https://doi.org/10.6028/jres.073B.010)

<a id="ref-DF1995a"></a>Dirkse, S. P., & Ferris, M. C. (1995). The PATH Solver: A Nonmonotone Stabilization Scheme for Mixed Complementarity Problems. *Optimization Methods and Software* 5(2), 123-156. [doi:10.1080/10556789508805606](https://doi.org/10.1080/10556789508805606)

<a id="ref-FP2003a"></a>Facchinei, F., & Pang, J.-S. (2003). *Finite-Dimensional Variational Inequalities and Complementarity Problems* (Vols. I and II). Springer. [doi:10.1007/b97543](https://doi.org/10.1007/b97543), [doi:10.1007/b97544](https://doi.org/10.1007/b97544)

<a id="ref-KS1980a"></a>Kinderlehrer, D., & Stampacchia, G. (1980). *An Introduction to Variational Inequalities and Their Applications*. Academic Press; SIAM reprint, 2000. [doi:10.1137/1.9780898719451](https://doi.org/10.1137/1.9780898719451)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Quasi-Variational Inequality (QVI)](qvi.md)
