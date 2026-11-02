# Infinite-Dimensional Optimisation: Factsheet

A quick reference for **Infinite-Dimensional Optimisation**: the problem form, the inputs with their defaults, and the outputs of each action. The panel runs on `InfiniteOpt`, with `Ipopt` or `HiGHS` as the solver.

## Inputs and defaults

| Input | Default | Meaning |
|---|---|---|
| **Dynamics dx/dt** | `[x[2], u[1]]` | Right-hand side of the ODE |
| **Running Cost f(x, u, t)** | `u[1]^2` | Integrand of the objective |
| **States** | 2 | Length of `x` |
| **Controls** | 1 | Length of `u` |
| **Initial State** | `[1.0, 0.0]` | Fixed x(t0) |
| **Terminal State** | `[0.0, 0.0]` | Fixed x(T), an equality |
| **Control Bound** | 5.0 | −umax ≤ u(t) ≤ umax; `Inf` removes it |
| **t0** | 0.0 | Start of the horizon |
| **T** | 2.0 | End of the horizon |
| **Supports** | 50 | Points of t in the transcription |
| **Derivative Method** | Orthogonal Collocation (3) | Approximation between supports |
| **Solver** | Ipopt | Ipopt or HiGHS |

## Options for two key settings

| **Derivative Method** option | Order on paper | Notes |
|---|---|---|
| Orthogonal Collocation (3) | High | 3 Lobatto nodes per interval |
| Orthogonal Collocation (4) | Higher | 4 Lobatto nodes per interval |
| Finite Difference (Backward) | First | Implicit Euler, the `InfiniteOpt` default |
| Finite Difference (Central) | Second | Uses both neighbouring supports |

| **Solver** | Handles |
|---|---|
| Ipopt | General nonlinear dynamics and costs, to a local optimum |
| HiGHS | Linear dynamics with a convex quadratic cost |

## Objects after a run

| Name | Meaning | Shape |
|---|---|---|
| `ts` | Time grid | One entry per support |
| `X` | State values | Supports × **States** |
| `U` | Control values | Supports × **Controls** |
| `model` | Solved model | Holds `:x`, `:u`, `:ode`, `:initial`, `:terminal` |

The run also prints `status`, `objective`, `supports` and `solve_seconds`. The function `build(; T, N, method, x_init)` makes a fresh model, and the actions use it to re-solve with changed settings.

## Actions by group

| Group | Action | Output |
|---|---|---|
| Visualise | **Optimal Trajectory** | States and controls against time |
| Visualise | **Phase Portrait** | Path in the (x1, x2) plane; needs two states |
| Diagnose | **Dynamics Residuals** | `max_ode_residual`, `initial_error`, `terminal_error`, statuses |
| Diagnose | **Mesh Refinement** | Objective and seconds at 10, 20, 50, 100, 200 supports |
| Predict | **Open-Loop Simulation** | `simulated_final_state` and `miss` from a 2,000-step RK4 |
| Predict | **State at Time** | Interpolated state and control, at the mid-horizon by default |
| Compare | **Compare Derivative Methods** | Objective, status and seconds for four methods |
| Compare | **Horizon Sweep** | Optimal cost at 8 horizons from 0.5 to 2T |
| Interpret | **Costates** | Duals of the dynamics against time |
| Interpret | **Initial-State Sensitivity** | `finite_difference` beside `initial_condition_dual`, with step 0.01 |

## References for the panel's tools

The modelling abstraction comes from [John A. Pulsipher, Weiqi Zhang, Tyler J. Hongisto and Victor M. Zavala (2022)](#ref-PZHZ2022a). `Ipopt` is an interior-point method for large sparse nonlinear problems ([Andreas Wächter and Lorenz T. Biegler (2006)](#ref-WB2006a)), and `HiGHS` grew out of dual simplex work on linear programs ([Qi Huangfu and J. A. Julian Hall (2018)](#ref-HH2018a)).

## References

<a id="ref-HH2018a"></a>Huangfu, Q., & Hall, J. A. J. (2018). Parallelizing the Dual Revised Simplex Method. *Mathematical Programming Computation* 10(1), 119-142. [doi:10.1007/s12532-017-0130-5](https://doi.org/10.1007/s12532-017-0130-5)

<a id="ref-PZHZ2022a"></a>Pulsipher, J. A., Zhang, W., Hongisto, T. J., & Zavala, V. M. (2022). A Unifying Modeling Abstraction for Infinite-Dimensional Optimization. *Computers & Chemical Engineering* 156, 107567. [doi:10.1016/j.compchemeng.2021.107567](https://doi.org/10.1016/j.compchemeng.2021.107567)

<a id="ref-WB2006a"></a>Wächter, A., & Biegler, L. T. (2006). On the Implementation of an Interior-Point Filter Line-Search Algorithm for Large-Scale Nonlinear Programming. *Mathematical Programming* 106(1), 25-57. [doi:10.1007/s10107-004-0559-y](https://doi.org/10.1007/s10107-004-0559-y)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
