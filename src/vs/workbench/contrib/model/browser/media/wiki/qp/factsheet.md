# Quadratic Programming — Factsheet

A **quadratic programme** minimises x'Qx/2 + c'x subject to linear constraints Ax <= b; it is **convex** when Q is positive semidefinite, and then every local optimum is global. Quadratic constraints give a **QCQP**, and integer variables a **mixed-integer QP**.

| | |
|---|---|
| **Purpose** | Optimise a quadratic objective under linear or quadratic constraints, with or without discrete choices; the example is the mean-variance portfolio |
| **Input** | A vector of expected returns, a covariance matrix, and a target return, a volatility cap or a maximum number of assets |
| **Core packages** | [JuMP.jl](https://github.com/jump-dev/JuMP.jl), [Clarabel.jl](https://github.com/oxfordcontrol/Clarabel.jl), [OSQP.jl](https://github.com/oxfordcontrol/OSQP.jl), [Ipopt.jl](https://github.com/jump-dev/Ipopt.jl), [SCIP.jl](https://github.com/scipopt/SCIP.jl), [Juniper.jl](https://github.com/lanl-ansi/Juniper.jl) |
| **Models** | Quadratic Programming (QP), Quadratic Constraints QP (QCQP), Mixed-Integer QP (MIQP) |
| **Output** | Termination status, optimal objective, weights, expected return and volatility; dual prices, reduced costs and variance shares |
| **Key choice** | What goes in the objective and what in the constraints, and whether the problem stays convex |

## When to Use

- **Mean-variance portfolios**: minimum variance for a return, maximum return for a risk, index tracking.
- **Least squares with constraints**: non-negative or bounded coefficients, coefficients summing to one (synthetic-control weights, mixture proportions).
- **Model predictive control** and other problems where a quadratic cost is minimised under linear dynamics and limits.
- **Discrete choices on top**: a limited number of positions, minimum holdings, on/off decisions (MIQP).

## What It Is Not

Not a general nonlinear optimiser: other nonlinear objectives or constraints belong to a nonlinear solver (Ipopt through JuMP), and smooth unconstrained problems to Quasi-Newton Methods. A non-convex quadratic (an indefinite Q) loses the guarantee of a global optimum unless solved by a global solver such as SCIP. The optimum is only as good as the inputs: in portfolios, estimation error in mu and Sigma dominates.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
