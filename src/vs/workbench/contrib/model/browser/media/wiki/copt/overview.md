# Constrained Optimisation — Overview

The Constrained Optimisation panel solves min f(x) subject to g(x) <= 0 and lb <= x <= ub, with five methods from four packages. Gradients and Jacobians come from **ForwardDiff.jl**. The default problem minimises the squared distance to (1.5, 1), a point outside the unit disk, over the disk and the half-plane x2 <= x1: the solution is the point of the circle nearest (1.5, 1), about (0.832, 0.555), with the disk constraint active and the half-plane inactive.

## The Methods
- **SLSQP** (NLopt) solves a quadratic model of the problem at each step: sequential quadratic programming. See [SLSQP](slsqp.md).
- **MMA** (NLopt) replaces the problem by a convex, separable approximation at each step. See [MMA](mma.md).
- **Interior Point** (Ipopt via JuMP) follows a barrier path from inside the feasible set. See [Interior Point](interior-point.md).
- **Frank-Wolfe** (FrankWolfe.jl) moves towards the point of the set that minimises a linear model. See [Frank-Wolfe](frank-wolfe.md).
- **Gradient Projection** takes gradient steps and projects back onto the set. See [Gradient Projection](gradient-projection.md).
All start from the centre of the box, (lb + ub) / 2.

## Optimality
At a solution x* where the constraints are well behaved, the **KKT conditions** hold: the gradient of f is balanced by the gradients of the active constraints, grad f + sum lambda_i grad g_i = 0, with multipliers lambda_i >= 0, and lambda_i g_i(x*) = 0 for every constraint. The **KKT Conditions** action checks them.

## Common Workflow

1. Set the **Dimension (n)**, the **Objective f(x)**, the **Constraints g(x) <= 0**, the **Lower Bounds**, **Upper Bounds** and **Max Iterations**, choose a method, and run.
2. Look at the **Convergence Curve**, the **Constraint Violation** and the **Solution Path**.
3. Run the **Feasibility Check**, the **KKT Conditions** and **Multi-Start**.
4. Read the **Solution Summary**, the **Active Constraints** and the **Algorithm Info**.
5. Explore with **Evaluate at Solution**, **Bounds Sensitivity** and **Constraint Relaxation**.
6. **Compare Methods**, compare **vs Unconstrained**, and run the **Budget Study**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
