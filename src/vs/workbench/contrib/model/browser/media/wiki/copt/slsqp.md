# SLSQP

**SLSQP**, sequential least-squares quadratic programming (Kraft, 1988), is a sequential quadratic programming (SQP) method. At each iteration it builds a **quadratic model** of the Lagrangian, f(x) + sum lambda_i g_i(x), with a quasi-Newton (BFGS) approximation of its Hessian, and **linearises the constraints**. The resulting quadratic program gives a search direction, and a line search on a merit function, which combines the objective with a penalty on constraint violation, chooses the step.

## Why It Works Well
Near the solution, with the right active constraints identified, the QP subproblems approximate Newton's method on the KKT conditions, and convergence is **superlinear**. Few iterations are needed on smooth problems, and the method handles both equality and inequality constraints.

## Least Squares
Kraft's variant solves each QP as a least-squares problem, using an LDL' factorisation of the Hessian approximation, which keeps it positive definite and the subproblems well posed.

## Limitations
- The Hessian approximation is **dense**, n by n: SLSQP suits small to medium problems, up to a few hundred variables.
- The iterates need not be feasible: f may dip below its final value while constraints are violated, then rise as they are restored.
- On non-convex problems it finds a local solution.

## In This Panel
The panel uses NLopt's :LD_SLSQP, with gradients and the constraint Jacobian from ForwardDiff, a constraint tolerance of 1e-8 and a relative x tolerance of 1e-10. **Max Iterations** limits objective evaluations. SLSQP also serves as the inner solver of the panel's Frank-Wolfe oracle and Gradient Projection projection.

## See Also
- [MMA](mma.md) · [Interior Point](interior-point.md) · [Decision Guide](decision-guide.md)
