# Second-Order, Exponential and Power Cones — Overview

The Second-Order, Exponential and Power Cones panel writes convex problems in **JuMP** with constraints in a cone, and solves them with a conic solver. Each of its three models shows one cone.

## The Three Models
- **Second-Order Cone**: the norm-constrained regression min ||A x - b|| subject to ||x|| <= radius. See [SOCP](socp.md).
- **Exponential Cone**: the maximum-entropy distribution on 1, ..., n with a given mean. See [Exponential Cone](expcone.md).
- **Power Cone**: the p-norm regression min sum |A x - b|^p, between least squares and least absolute deviations. See [Power Cone](powcone.md).

## Solvers
The **Solver** is **Clarabel** (interior point, accurate, every cone here), **COSMO** (ADMM, large sparse problems) or **SCS** (first-order splitting, fast, less accurate). See [Interior Point](ipm.md). Every model has a **dual** problem whose value bounds the primal: see [Duality](duality.md).

## Common Workflow

1. Choose a model and enter its inputs: the **Design Matrix A** and **Response b** with the **Norm Radius** or **p**, or **n** and the **Target Mean**; choose the **Solver**.
2. Look at the **Solution Profile** and the **Residuals and Slacks**.
3. Check **Status and Feasibility**, the **Duality Gap** and the **Solver Statistics**.
4. Read the **Dual Variables** and the **Cone Membership**.
5. Run the **Sensitivity Analysis** and the **Parametric Sweep**.
6. Compare with the **Solver Comparison** and **vs Baseline**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
