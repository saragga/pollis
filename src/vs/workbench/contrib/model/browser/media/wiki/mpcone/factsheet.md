# Convex and Conic Programming — Factsheet

A **conic programme** minimises a linear objective subject to linear equalities and the condition that an affine expression lies in a **convex cone**: the non-negative orthant, the second-order cone, the exponential cone or the power cone. Almost every convex problem met in practice can be written this way, and interior-point solvers solve conic programmes reliably, with a certificate.

| | |
|---|---|
| **Purpose** | Solve convex optimisation problems to global optimality, with a certificate of optimality or infeasibility |
| **Input** | A convex objective and constraint in x, or the data A and b of a norm-constrained or p-norm regression, or a target mean for maximum entropy; the solver |
| **Core packages** | [JuMP.jl](https://github.com/jump-dev/JuMP.jl), [Clarabel.jl](https://github.com/oxfordcontrol/Clarabel.jl), [COSMO.jl](https://github.com/oxfordcontrol/COSMO.jl), [SCS.jl](https://github.com/jump-dev/SCS.jl), [ECOS.jl](https://github.com/jump-dev/ECOS.jl) |
| **Models** | Convex Programming, Second-Order Cone, Exponential Cone, Power Cone |
| **Output** | The optimal x, the optimal value, the termination status, the duality gap and the dual variables |
| **Key choice** | Which cone expresses the problem, and an interior-point (Clarabel) or first-order (COSMO, SCS) solver |

## When to Use

- **Convex problems** with norms, quadratics, logs, exponentials or powers: robust and regularised regression, portfolio risk, maximum entropy, geometric programmes.
- When a **global optimum** and a **certificate** are wanted: for a convex problem a local optimum is global, and the dual gives a bound.
- When the problem is too structured for a generic nonlinear solver to be trusted.

## What It Is Not

Not for non-convex problems: a cone cannot express them, and JuMP rejects an expression it cannot bridge to a cone. Not a modelling language for arbitrary functions: the problem must be built from convex atoms. For smooth non-convex problems, see the Nonlinear Programming panel.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Duality](duality.md)
