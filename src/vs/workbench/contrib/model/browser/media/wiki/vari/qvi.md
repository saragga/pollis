# Variational Inequalities: Quasi-Variational Inequality (QVI)

The **Quasi-Variational Inequality** model finds x* in K(x*) that solves the VI on K(x*): the constraint set moves with the solution. The panel solves it by damped fixed-point iteration, one VI solve with PATH per step.

## The condition

The decision table states the purpose: find x* in K(x*) solving the VI on K(x*). In the notation of the VI, x* is in K(x*) and F(x*)ᵀ(y − x*) ≥ 0 for every y in K(x*).

The context of the model is a constraint set that moves with the solution, K(x), as in generalised Nash equilibria with shared resources, where each player's feasible set depends on the others' decisions. The notebook on the QVI describes the same state-dependent constraint set.

## The iteration

```
function solve_qvi(F=Fop; x0=zeros(n), iters=200, tol=1e-9, damp=0.5)
    x, steps = x0, Float64[]
    for _ in 1:iters
        r = solve_vi(F; K=Kset(x), start=x)
        push!(steps, norm(r.x - x)); x = x .+ damp .* (r.x .- x)
        steps[end] < tol && break
    end
    (x = x, ok = steps[end] < 1e-6, steps = steps)
end
```

Each step solves the VI on the box at the current point, starting PATH from that point, and moves halfway, `damp = 0.5`, towards the new solution: x_{k+1} = x_k + damp · (VI(F, K(x_k)) − x_k). The loop stops after 200 steps or when a step is shorter than 10⁻⁹, and the solve counts as successful when the last step is under 10⁻⁶.

## Damping and the start

With `damp = 0.5`, each iterate moves halfway towards the solution of the VI on the current box; `damp = 1.0` takes that solution itself, as `solve` does in the code, whose comment notes that a fixed K converges in one undamped step.

The start is `x0 = zeros(n)`, and **Parametric VI** starts each shift from the solution for the previous one. **Convergence Check** plots the step lengths of the loop on a logarithmic scale, the record of how the iteration approached its fixed point.

## The default problem

The operator is the same Cournot duopoly as for the VI, costs 1 and 2 and price 10 − x1 − x2. **Moving Set K(x)** replaces the fixed capacities:

```
(zeros(2), 5.0 .- (sum(x) .- x))
```

so that the upper bound of firm i is 5 minus the output of the other firm. The tooltip describes this as a shared capacity of 5, each firm limited to 5 minus the other's output, and the decision table notes that the shared capacity x1 + x2 ≤ 5 binds.

## Actions for the QVI

The actions evaluate K at the solution, so **VI Residual**, **Gap Function**, **Operator Field** and **Equilibrium Interpretation** work on the box K(x*). The natural residual of the main code uses the same box.

**Parametric VI** calls the damped iteration for every shift t, and **Bounds vs NCP** solves the VI with the lower bounds of K(0) only, for comparison with the QVI solution.

## Background

PATH, the solver of each inner VI, is the method of [Dirkse and Ferris (1995)](#ref-DF1995a): a Newton method for the mixed complementarity problem, stabilised by a pathsearch along a piecewise linear path to the Newton point. A step length acceptance criterion and a non-monotone pathsearch choose the next iterate, and they show the algorithm to be globally convergent under assumptions that generalise those needed in the smooth case. Every step of the QVI loop is one such solve, started at the current iterate.

## References

<a id="ref-DF1995a"></a>Dirkse, S. P., & Ferris, M. C. (1995). The PATH Solver: A Nonmonotone Stabilization Scheme for Mixed Complementarity Problems. *Optimization Methods and Software* 5(2), 123-156. [doi:10.1080/10556789508805606](https://doi.org/10.1080/10556789508805606)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Variational Inequality (VI)](vi.md)
