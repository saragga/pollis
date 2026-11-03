# Mathematical Programming with Equilibrium Constraints: Factsheet

A quick reference for **Mathematical Programming with Equilibrium Constraints**: the problem it solves, the three methods, their inputs, and what each action computes. JuMP builds every model, Ipopt solves the nonlinear programs, and PATH, through `PATHSolver.jl`, solves the equilibrium on its own.

## The problem in the code

| Part | Code | Meaning |
|---|---|---|
| Outer variable | `x` | One scalar decision |
| Equilibrium variable | `y` | A vector of length **Equilibrium Dimension** |
| Objective | `F(x, y)` | The quantity minimised |
| Outer constraints | `Gc(x, y) .<= 0` | Each entry of **Constraints G(x, y) <= 0** at most zero |
| Equilibrium | `f(x, y)` | y ≥ 0, f ≥ 0, and y_i f_i = 0 for every i |

The equilibrium is a complementarity condition: each pair has y_i or f_i equal to zero, and both are non-negative. In the inner solves it is written for JuMP as `complements(f(xv, yv), yv)`.

## The three methods side by side

| Method | Complementarity handled by | Solver | Sequence |
|---|---|---|---|
| **Regularisation** | The relaxed constraint y_i f_i ≤ t | Ipopt | t = 1, 0.1, ..., 1e-8 |
| **Penalty** | The term mu y'f added to the objective | Ipopt | mu = 1, 10, ..., 1e4 |
| **Implicit (PATH)** | Solving the equilibrium for each x | PATH on a grid | **Grid Points** values of x |

Each step of the first two methods starts from the solution of the step before. The relaxation is the one studied by [Scholtes (2001)](#ref-Sch2001a), and the penalty is the standard form analysed by [Hu and Ralph (2004)](#ref-HR2004a). PATH is described by [Dirkse and Ferris (1995)](#ref-DF1995a).

## Inputs

| Input | Default | Meaning |
|---|---|---|
| **Objective F(x, y)** | `-x * (10 - x - sum(y)) + x` | Minus the profit of a leader |
| **Constraints G(x, y) <= 0** | `[x - 10, -x]` | x between 0 and 10 |
| **Equilibrium Map f(x, y)** | Two Cournot followers, unit costs 1 and 2 | Marginal cost minus marginal revenue |
| **Equilibrium Dimension** | 2 | Length of y and of f |
| **Grid Points** | 201 | Values of x tried, for **Implicit (PATH)** only |

## The default example

A leader chooses its output x first, facing the inverse demand 10 - Q, where Q is total output, at a unit cost of 1. **Objective F(x, y)** is minus the leader's profit, so minimising it maximises profit.

Two followers then choose y_1 and y_2 as Cournot competitors, with unit costs 1 and 2. For follower k, f_k is its unit cost minus its marginal revenue, 10 - Q - y_k. Complementarity says that a follower either produces with marginal revenue equal to cost, or produces nothing with marginal revenue at most its cost.

The market with one leader and N Cournot followers is the one studied by [Sherali, Soyster and Murphy (1983)](#ref-SSM1983a), where the leader, a Stackelberg firm, takes the followers' reaction into account.

## What a run builds and prints

`x_range` first finds the smallest and largest x allowed by the outer constraints with y ≥ 0, using Ipopt. The interval `xlo` to `xhi` sets the grid of **Implicit (PATH)** and the axes of several charts.

`nlp_model` builds the outer problem with y ≥ 0 and f ≥ 0 as ordinary constraints, and `solve_reg`, `solve_pen` and `solve_imp` add the complementarity in their own way. `solve_mpec` calls the chosen method and takes a keyword `xmax`, an extra cap x ≤ `xmax`, which **Parametric MPEC** uses.

| Printed | Meaning |
|---|---|
| `x` | The outer decision |
| `y` | The equilibrium at that decision |
| `objective` | F(x, y) |
| `complementarity_violation` | The largest absolute y_i f_i |
| `solved` | Ipopt's success at the last step, or a feasible grid point for the implicit method |

## Visualise, Diagnose and Predict actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Implicit Objective** | F(x, y*(x)) over the feasible range of x, with the solution |
| Visualise | **Solution Path** | Objective and complementarity along t or mu, or the grid evaluations |
| Diagnose | **Complementarity Check** | `min_y`, `min_f`, `max_complementarity`, `y_dot_f`, `outer_feasible` |
| Diagnose | **Stationarity Check** | `right_slope`, `left_slope`, `at_lower_bound`, `at_upper_bound`, `equilibrium_matches` |
| Predict | **Parametric MPEC** | Objective and y as a cap x ≤ t tightens, over 20 caps |
| Predict | **Equilibrium Response** | y*(x) of every component over the feasible range |

## Compare and Interpret actions

| Group | Action | Output |
|---|---|---|
| Compare | **Relaxed Bound** | `relaxed_bound`, `relaxed_x`, `relaxed_y`, `complementarity_violation`, `mpec_objective` |
| Compare | **Method Comparison** | x, objective, complementarity and seconds for all three methods |
| Interpret | **Value of Commitment** | `mpec_objective`, `nash_objective`, `value_of_commitment` |
| Interpret | **Active Constraints** | The status of each complementarity pair |

Every action reads `sol` or calls `equilibrium` and `solve_mpec` again, so changing an input and rerunning updates them all.

## Packages and textbooks

`Complementarity.jl`, by [Kwon (2023)](#ref-Kwo2023a), provides modelling for mixed complementarity problems and MPECs through JuMP, and `PATHSolver.jl` wraps the PATH solver, with an interface through which JuMP passes complementarity problems to it. `Plots` draws the charts.

[Luo, Pang and Ralph (1996)](#ref-LPR1996a) is the monograph on MPECs, covering optimality conditions, exact penalisation and algorithms. [Facchinei and Pang (2003)](#ref-FP2003a) treat variational inequalities and complementarity problems in two volumes.

## References

<a id="ref-DF1995a"></a>Dirkse, S. P., & Ferris, M. C. (1995). PATH Solver: A Non-Monotone Stabilisation Scheme for the Solution of Nonlinear Complementarity Problems. *Optimization Methods and Software* 5(2), 123-156. [doi:10.1080/10556789508805606](https://doi.org/10.1080/10556789508805606)

<a id="ref-FP2003a"></a>Facchinei, F., & Pang, J.-S. (2003). *Finite-Dimensional Variational Inequalities and Complementarity Problems*. Springer.

<a id="ref-HR2004a"></a>Hu, X. M., & Ralph, D. (2004). Convergence of a Penalty Method for Mathematical Programming with Complementarity Constraints. *Journal of Optimization Theory and Applications* 123(2), 365-390. [doi:10.1007/s10957-004-5154-0](https://doi.org/10.1007/s10957-004-5154-0)

<a id="ref-Kwo2023a"></a>Kwon, C. (2023). Complementarity.jl: Modeling and Solving Complementarity Problems in Julia. [github.com/chkwon/Complementarity.jl](https://github.com/chkwon/Complementarity.jl)

<a id="ref-LPR1996a"></a>Luo, Z.-Q., Pang, J.-S., & Ralph, D. (1996). *Mathematical Programs with Equilibrium Constraints*. Cambridge University Press. [doi:10.1017/CBO9780511983658](https://doi.org/10.1017/CBO9780511983658)

<a id="ref-Sch2001a"></a>Scholtes, S. (2001). Convergence Properties of a Regularization Scheme for Mathematical Programs with Complementarity Constraints. *SIAM Journal on Optimization* 11(4), 918-936. [doi:10.1137/S1052623499361233](https://doi.org/10.1137/S1052623499361233)

<a id="ref-SSM1983a"></a>Sherali, H. D., Soyster, A. L., & Murphy, F. H. (1983). Stackelberg-Nash-Cournot Equilibria: Characterizations and Computations. *Operations Research* 31(2), 253-276. [doi:10.1287/opre.31.2.253](https://doi.org/10.1287/opre.31.2.253)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [MPEC](mpec.md)
