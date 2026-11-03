# Variational Inequalities: Factsheet

A summary of the **Variational Inequalities** panel: its two problems, its inputs with their defaults, what the main code returns and the packages it loads.

## At a glance

| Item | Value |
| --- | --- |
| Problems | Variational Inequality (VI), Quasi-Variational Inequality (QVI) |
| Constraint set | box K = [lb, ub], or K(x) for the QVI |
| Formulation | mixed complementarity, `complements(F(x), x)` in JuMP |
| Solver | PATH, through PATHSolver.jl |
| QVI method | damped fixed-point iteration over VI solves |
| Default | Cournot duopoly, costs 1 and 2, price 10 − x1 − x2 |
| Action groups | Visualise, Diagnose, Predict, Compare, Interpret |

The panel lists JuMP.jl, PATHSolver.jl, LinearAlgebra.jl and Plots.jl as its packages, and the PATH paper of [Dirkse and Ferris (1995)](#ref-DF1995a) under Software.

## Inputs

| Input | Problem | Default |
| --- | --- | --- |
| **Dimension n** | both | `2` |
| **Operator F(x)** | both | `[1.0 - (10 - sum(x)) + x[1], 2.0 - (10 - sum(x)) + x[2]]` |
| **Lower Bounds lb** | VI | `zeros(2)` |
| **Upper Bounds ub** | VI | `[3.0, 3.0]` |
| **Moving Set K(x)** | QVI | `(zeros(2), 5.0 .- (sum(x) .- x))` |

**Dimension n** must match the length of F. **Operator F(x)** is a vector of Julia expressions in `x[1]` to `x[n]`; its default is, in the tooltip's words, minus the marginal profit of each Cournot firm, c_i − (10 − x1 − x2) + x_i. The bounds take `-Inf` or `Inf` for none, and **Moving Set K(x)** returns the tuple (lb, ub) of the box at x.

## The defaults as a game

Firm i chooses its output x_i, at cost c_i per unit, with c = (1, 2), and sells at the price 10 − x1 − x2. In the VI, each firm has a capacity of 3, the upper bound of its box.

In the QVI, the decision table speaks of a shared capacity x1 + x2 ≤ 5, which binds: the tooltip of **Moving Set K(x)** limits each firm to 5 minus the other's output, so that each firm's upper bound depends on the decision of the other.

## Output

The main code returns a named tuple:

| Field | Content |
| --- | --- |
| `x` | the solution, rounded to six digits |
| `F_at_x` | the operator at the solution |
| `K_at_x` | the box (lb, ub) at the solution |
| `residual` | the natural residual, ‖x − P_K(x − F(x))‖ |
| `solved` | whether the solve succeeded |

For the VI, `solved` is true when PATH ends with the status `LOCALLY_SOLVED`; for the QVI, when the last step of the fixed-point iteration is shorter than 10⁻⁶.

## Packages and licence

The code loads JuMP, PATHSolver, LinearAlgebra and Random, and the plotting actions add Plots. The PATHSolver.jl README explains that PATH itself is closed source and requires a licence: without one it solves instances with up to 300 variables and 2000 non-zeros, and a temporary licence for larger problems, valid for a year, is linked from the README.

The licence string can be stored in the `PATH_LICENSE_STRING` environment variable or passed with `PATHSolver.c_api_License_SetString` right after the package is imported.

## References

<a id="ref-DF1995a"></a>Dirkse, S. P., & Ferris, M. C. (1995). The PATH Solver: A Nonmonotone Stabilization Scheme for Mixed Complementarity Problems. *Optimization Methods and Software* 5(2), 123-156. [doi:10.1080/10556789508805606](https://doi.org/10.1080/10556789508805606)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Variational Inequality (VI)](vi.md) · [Quasi-Variational Inequality (QVI)](qvi.md)
