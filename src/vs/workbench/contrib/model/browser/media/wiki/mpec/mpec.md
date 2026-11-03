# Mathematical Programming with Equilibrium Constraints: MPEC

The formulation the panel solves, the three ways it handles the complementarity, and the solver behind the equilibrium.

## The formulation

The panel solves the problem

- minimise F(x, y) over x and y,
- subject to G(x, y) ≤ 0,
- y ≥ 0, f(x, y) ≥ 0, and y_i f_i(x, y) = 0 for i = 1, ..., n,

where x is a scalar and n is **Equilibrium Dimension**. [Hu and Ralph (2004)](#ref-HR2004a) write the general problem with complementarity constraints with a single vector of variables z and two maps, G(z) ≥ 0 and H(z) ≥ 0, with G(z)'H(z) = 0. The panel's pair is G = y and H = f.

The last three lines are a nonlinear complementarity problem in y for each fixed x, so the equilibrium constraint is a family of complementarity problems indexed by the decision. [Luo, Pang and Ralph (1996)](#ref-LPR1996a) set this structure within the broader class of MPECs, where the inner condition can be a variational inequality.

## Regularisation

[Scholtes (2001)](#ref-Sch2001a) replaces each equation y_i f_i = 0 by the inequality y_i f_i ≤ t, for a parameter t > 0 that falls to zero; Hu and Ralph state the family with the constraints G_i(z)H_i(z) ≤ t for every i.

The panel's **Regularisation** solves the sequence t = 1, 0.1, ..., 1e-8 with Ipopt, holding t as a JuMP parameter so that the model is built once, and starts each solve from the solution for the previous t.

Hu and Ralph summarise the convergence results: a limit of stationary points as t falls to zero is feasible for the MPEC, it is C-stationary under MPCC-LICQ, M-stationary under a weak second-order necessary condition at each iterate, and B-stationary under further conditions.

## Penalty

The penalty family of [Hu and Ralph (2004)](#ref-HR2004a) keeps G(z) ≥ 0 and H(z) ≥ 0 as constraints and minimises f(z) + ρ Σ G_i(z) H_i(z), for a parameter ρ that grows without bound. In the panel's notation the objective is F(x, y) + mu y'f.

On the feasible set of each subproblem, every product y_i f_i is non-negative, so the penalty term is zero exactly at the points where the complementarity holds. The panel's **Penalty** solves mu = 1, 10, ..., 1e4 with Ipopt, each from the previous solution.

Hu and Ralph show that the framework shares convergence properties similar to those of smoothing and regularisation, and they give sufficient conditions for its limit to be feasible and B-stationary. [Ralph and Wright (2004)](#ref-RW2004a) study regularised and penalised formulations near a local solution at which strong stationarity and a second-order sufficient condition hold, with estimates of the distance of their solutions to the MPEC solution.

## Implicit programming

When the equilibrium has a unique solution y*(x) for each x, the MPEC becomes a problem in x alone: minimise F(x, y*(x)) subject to G(x, y*(x)) ≤ 0. [Luo, Pang and Ralph (1996)](#ref-LPR1996a) describe an implicit programming algorithm among the iterative methods of their book.

The panel's **Implicit (PATH)** evaluates the implicit objective at **Grid Points** values of x evenly spaced between the bounds found by `x_range`. At each it solves the equilibrium with PATH, keeps the point if PATH reports a local solution and the outer constraints hold within 1e-9, and returns the feasible point with the lowest objective.

A search on a grid uses only values of the implicit objective, with no derivatives of y*(x), and it compares points across the whole range of x.

## PATH for the equilibrium

[Dirkse and Ferris (1995)](#ref-DF1995a) describe PATH as a stabilised Newton method for the mixed complementarity problem. A path-generation procedure builds a piecewise-linear path from the current point to the Newton point, and a non-monotone path search along it chooses the next iterate. The algorithm is shown to be globally convergent under assumptions that generalise those of the smooth case.

In the panel, `equilibrium(xv)` builds a JuMP model with y ≥ 0 and the constraint `complements(f(xv, yv), yv)`, solves it with `PATHSolver.Optimizer`, and reports the solution with `ok` set when the termination status is `LOCALLY_SOLVED`.

## Stationarity

[Scheel and Scholtes (2000)](#ref-SS2000a) present several stationarity concepts for problems with complementarity constraints, based on a piecewise smooth formulation, and compare them. [Hu and Ralph (2004)](#ref-HR2004a) state them with the MPCC Lagrangian, which carries a multiplier for each outer constraint, one for each y_i ≥ 0, and one for each f_i ≥ 0, with the complementarity left out.

On a pair with y_i > 0, only the multiplier of f_i ≥ 0 can be nonzero, and on a pair with f_i > 0, only that of y_i ≥ 0. The concepts differ on the pairs where both are zero, and the [Diagnostics](diagnostics.md) page sets them out. The same authors give second-order optimality conditions and stability results for the class.

## References

<a id="ref-DF1995a"></a>Dirkse, S. P., & Ferris, M. C. (1995). PATH Solver: A Non-Monotone Stabilisation Scheme for the Solution of Nonlinear Complementarity Problems. *Optimization Methods and Software* 5(2), 123-156. [doi:10.1080/10556789508805606](https://doi.org/10.1080/10556789508805606)

<a id="ref-HR2004a"></a>Hu, X. M., & Ralph, D. (2004). Convergence of a Penalty Method for Mathematical Programming with Complementarity Constraints. *Journal of Optimization Theory and Applications* 123(2), 365-390. [doi:10.1007/s10957-004-5154-0](https://doi.org/10.1007/s10957-004-5154-0)

<a id="ref-LPR1996a"></a>Luo, Z.-Q., Pang, J.-S., & Ralph, D. (1996). *Mathematical Programs with Equilibrium Constraints*. Cambridge University Press. [doi:10.1017/CBO9780511983658](https://doi.org/10.1017/CBO9780511983658)

<a id="ref-RW2004a"></a>Ralph, D., & Wright, S. J. (2004). Some Properties of Regularization and Penalization Schemes for MPECs. *Optimization Methods and Software* 19(5), 527-556. [doi:10.1080/10556780410001709439](https://doi.org/10.1080/10556780410001709439)

<a id="ref-SS2000a"></a>Scheel, H., & Scholtes, S. (2000). Mathematical Programs with Complementarity Constraints: Stationarity, Optimality, and Sensitivity. *Mathematics of Operations Research* 25(1), 1-22. [doi:10.1287/moor.25.1.1.15213](https://doi.org/10.1287/moor.25.1.1.15213)

<a id="ref-Sch2001a"></a>Scholtes, S. (2001). Convergence Properties of a Regularization Scheme for Mathematical Programs with Complementarity Constraints. *SIAM Journal on Optimization* 11(4), 918-936. [doi:10.1137/S1052623499361233](https://doi.org/10.1137/S1052623499361233)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
