# Model-Based Methods: Factsheet

A quick reference for **Model-Based Methods**: the seven methods, their inputs, what stops a run and what each action computes. Five methods run through `PRIMA.jl` and two through `NLopt.jl`, and all of them work from values of f alone.

## The seven methods side by side

| Method | Call | Constraints enforced | How the next point is found |
|---|---|---|---|
| **COBYLA** | `cobyla`, `PRIMA` | c(x) ≤ 0 and the box | Linear models of f and c, trust region |
| **BOBYQA** | `bobyqa`, `PRIMA` | The box | Quadratic model, trust region inside the box |
| **NEWUOA** | `newuoa`, `PRIMA` | None | Quadratic model, trust region |
| **UOBYQA** | `uobyqa`, `PRIMA` | None | Fully determined quadratic model, trust region |
| **LINCOA** | `lincoa`, `PRIMA` | A x ≤ b and the box | Quadratic model, trust region with linear constraints |
| **PRAXIS** | `:LN_PRAXIS`, `NLopt` | None | Line searches along conjugate directions |
| **Sbplx** | `:LN_SBPLX`, `NLopt` | The box | Nelder-Mead on low-dimensional subspaces |

## Inputs and their defaults

| Input | Default | Meaning |
|---|---|---|
| **Dimension (n)** | 4 | Number of variables |
| **Objective f(x)** | Rosenbrock | Julia expression in the vector x |
| **Starting Point** | `zeros(n)` | First point of the search |
| **Lower Bounds**, **Upper Bounds** | `fill(-2.0, n)`, `fill(2.0, n)` | The box |
| **Constraints c(x) <= 0** | `[sum(x .^ 2) - 2.0]` | **COBYLA** only |
| **Constraint Matrix (A)** | `ones(1, n)` | **LINCOA** only |
| **Right-Hand Side (b)** | `[2.0]` | **LINCOA** only |
| **Max Evaluations** | 2000 | Budget of objective evaluations |
| **Initial Radius** | 0.5 | First trust-region radius, or first step size for **PRAXIS** and **Sbplx** |

**NEWUOA**, **UOBYQA** and **PRAXIS** use the box only to sample starts and to draw plots.

## How many points each model uses

| Method | Points in the model | Unknowns settled by the points |
|---|---|---|
| **COBYLA** | n + 1 | All of a linear model |
| **BOBYQA**, **NEWUOA**, **LINCOA** | 2n + 1 by default | Part of a quadratic, the rest from the previous model |
| **UOBYQA** | (n + 1)(n + 2) / 2 | All of a quadratic |

The count is also a floor on useful budgets, because the first model needs that many evaluations before it can suggest anything. **PRAXIS** and **Sbplx** keep no such set of interpolation points.

## What a run builds and prints

`search` runs the chosen method, with `recorder` wrapping f so that every evaluation is kept. The result `res` holds `x`, `fx`, `points`, `values`, `evals` and `status`, and `x_best` and `f_best` repeat the first two of those.

The printed result has `minimiser`, `minimum`, `evaluations`, `status` and `violation`. `violation` is the largest breach of the constraints the method enforces. For **NEWUOA**, **UOBYQA** and **PRAXIS** it is defined as 0.0, so it says nothing about the box on those three.

## What stops a run

Two settings sit in the code and have no input of their own.

| Package | Setting | Value | Meaning |
|---|---|---|---|
| `PRIMA` | `rhoend` | 1e-8 | Final trust-region radius |
| `NLopt` | `xtol_rel` | 1e-10 | Relative change in x treated as no change |
| Both | **Max Evaluations** | Input | `maxfun` in `PRIMA`, `maxeval` in `NLopt` |

Loosen `rhoend` or `xtol_rel` by editing the code when the objective carries noise, as a noisy function cannot support such fine differences.

## Visualise, Diagnose and Predict actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Convergence Curve** | Best value so far against evaluations, log scale |
| Visualise | **Objective Surface** | Contours over x1 and x2, the others at the minimiser |
| Visualise | **Query Scatter** | Every evaluated point in x1 and x2, by order |
| Diagnose | **Convergence Check** | `status`, `budget_exhausted`, `gradient_norm`, `projected_gradient_norm` |
| Diagnose | **Multi-Start** | 10 random starts: `minima`, `share_at_best`, `max_distance_between_minimisers` |
| Diagnose | **Bounds Feasibility** | `inside_box`, `min_slack`, `at_lower`, `at_upper` |
| Predict | **Sensitivity** | `down`, `up` for a move of 1% of each variable's range |
| Predict | **Warm Start** | `improvement`, `moved` after a restart at `rhobeg / 10` |

## Compare and Interpret actions

| Group | Action | Output |
|---|---|---|
| Compare | **Method Comparison** | `minimum`, `evaluations`, `seconds` for all seven methods and Nelder-Mead, without general constraints |
| Compare | **NLopt vs PRIMA** | Both versions of COBYLA: `minimum`, `evaluations`, `max_constraint`, `status` |
| Compare | **Budget Sweep** | `minimum` and `status` at budgets from 50 up to **Max Evaluations** |
| Interpret | **Solution Summary** | Each variable's start, value and bounds, with the run totals |
| Interpret | **Constraint Check** | `value`, `satisfied`, `active` per constraint, `box_violation`, `total_violation` |
| Interpret | **Scaling Check** | `multipliers`, `reduced_hessian_eigenvalues`, `condition_number`, `advice` |

## Packages and textbooks

`PRIMA.jl` wraps the reference implementations of Powell's methods by [Zhang (2023)](#ref-Zha2023a), and `NLopt.jl` wraps the library of [Johnson (2007)](#ref-Joh2007b). `Plots` draws the three charts.

The theory of models, geometry and trust regions is set out by [Conn, Scheinberg and Vicente (2009)](#ref-CSV2009a). Line searches, conjugate directions and the trust-region framework in the wider setting of nonlinear optimisation are in [Nocedal and Wright (2006)](#ref-NW2006a).

## References

<a id="ref-CSV2009a"></a>Conn, A. R., Scheinberg, K., & Vicente, L. N. (2009). *Introduction to Derivative-Free Optimization*. SIAM. [doi:10.1137/1.9780898718768](https://doi.org/10.1137/1.9780898718768)

<a id="ref-Joh2007b"></a>Johnson, S. G. (2007). The NLopt Nonlinear-Optimisation Package.

<a id="ref-NW2006a"></a>Nocedal, J., & Wright, S. J. (2006). *Numerical Optimization* (2nd ed.). Springer. [doi:10.1007/978-0-387-40065-5](https://doi.org/10.1007/978-0-387-40065-5)

<a id="ref-Zha2023a"></a>Zhang, Z. (2023). PRIMA: Reference Implementations for Powell's Methods with Modernization and Amelioration.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [COBYLA](cobyla.md) · [BOBYQA](bobyqa.md) · [NEWUOA](newuoa.md) · [UOBYQA](uobyqa.md) · [LINCOA](lincoa.md) · [PRAXIS](praxis.md) · [Sbplx](sbplx.md)
