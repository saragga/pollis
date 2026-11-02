# Factsheet

**Complementarity Problems** solves linear, nonlinear and mixed complementarity problems with PATH through JuMP, and checks the solutions it finds.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Find x and F(x) satisfying bounds, sign conditions and complementarity |
| Julia stack | `JuMP.jl` for modelling, `PATHSolver.jl` for the solve, `Ipopt.jl` for the merit comparison, `Plots.jl` for figures |
| Tabs | **Linear Complementarity**, **Nonlinear Complementarity**, **Mixed Complementarity** |
| Printed result | `x`, `F_at_x`, `residual`, `solved` |
| Main functions | `solve_cp`, `Fop`, `residual`, `mid` |

The modelling package `Complementarity.jl` comes from [Kwon (2023)](#ref-Kwo2023a), and the generated code uses the JuMP form directly.

## What the Inputs of the Panel Default To

| Input | Default | Tabs |
|---|---|---|
| **Matrix M (n x n)** | [2 1 0; 1 2 1; 0 1 2] | **Linear Complementarity** |
| **Vector q** | [−3, −2, 1] | **Linear Complementarity** |
| **Dimension n** | 4 | **Nonlinear Complementarity**, **Mixed Complementarity** |
| **Operator F(x)** | Kojima-Shindo test problem | **Nonlinear Complementarity**, **Mixed Complementarity** |
| **Lower Bounds lb** | `zeros(4)` | **Mixed Complementarity** |
| **Upper Bounds ub** | [1.0, Inf, Inf, Inf] | **Mixed Complementarity** |

## What the Solve Sets by Default

| Setting | Value |
|---|---|
| Start | All ones |
| Solved test | `termination_status(m) == MOI.LOCALLY_SOLVED` |
| Tolerance in the checks | 1e-6 |
| Jacobian in **Solver Status** | Finite differences, step 1e-6 |
| Shift in **Sensitivity Analysis** | 1e-4 for each component |
| Random starts in **Solution Multiplicity** | 50, seed 1 |
| Shifts in **Parametric Solve** | −1 to 1, in 41 steps |
| Smoothing in the merit function | 1e-12 |

## What Each Next Step in the Panel Shows

| Action | Result |
|---|---|
| **Residual Plot** | Residual after 0 to 15 major iterations |
| **Complementarity Pairs** | Bars of x_i next to F_i(x) |
| **Complementarity Check** | Bounds, signs and largest violation |
| **Solver Status** | Message, residual, smallest eigenvalue of the symmetric Jacobian |
| **Parametric Solve** | Path of x as F shifts by t |
| **Solution Multiplicity** | Distinct solutions, with counts |
| **Merit Function Reformulation** | PATH against Fischer-Burmeister with Ipopt |
| **Dual Interpretation** | Regime of each pair |
| **Sensitivity Analysis** | Matrix of responses to shifts in F |

## References

<a id="ref-Kwo2023a"></a>Kwon, C. (2023). Complementarity.jl: modeling and solving complementarity problems in Julia. [github.com/chkwon/Complementarity.jl](https://github.com/chkwon/Complementarity.jl)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
