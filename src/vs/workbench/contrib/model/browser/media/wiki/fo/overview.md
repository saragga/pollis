# Overview

The First-Order Methods panel minimises a smooth function f(x) of several variables with **first-order methods**: methods that use only the value of f and its **gradient**, the vector of partial derivatives, and never the matrix of second derivatives (the Hessian). Each iteration picks a **search direction** from the gradient, then a **step length** along it by a **line search**. The methods come from Optim.jl; the gradient is computed by automatic differentiation (ForwardDiff) or by finite differences.

## Gradient Descent
The **steepest descent** direction, minus the gradient, with a line search for the step. Simple and cheap per iteration, but slow when the function is much more curved in some directions than in others: the iterates **zig-zag** across a narrow valley. See [Gradient Descent](gradient-descent.md).

## Conjugate Gradient
Each direction combines minus the gradient with the previous direction, so that successive steps do not undo each other. Optim's ConjugateGradient uses the **Hager-Zhang** update, which guarantees a descent direction. On ill-conditioned problems it needs far fewer iterations than gradient descent, at the same cost per iteration and the same small memory. See [Conjugate Gradient](conjugate-gradient.md).

## Line Searches
The line search chooses how far to go along the direction. **HagerZhang** (Optim's default) and **MoreThuente** find a step satisfying the Wolfe conditions precisely; **StrongWolfe** enforces the strong Wolfe conditions; **BackTracking** starts with a full step and shrinks it until f decreases enough, cheaper per iteration but less precise.

## Common Workflow

1. Write the **objective f(x)** and an **initial guess x0**; choose automatic or finite-difference derivatives.
2. Run, and read the **Convergence Check**: did it converge, in how many iterations and gradient calls?
3. Look at the **Convergence Trace** and, for two variables, the **Contour + Path**.
4. Run the **Gradient Check** if the gradient is hand-written or finite-difference.
5. If convergence is slow, read the **Conditioning**, and try the other method or line search with **Compare Methods** and **Compare Line Searches**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Gradient Descent](gradient-descent.md) · [Conjugate Gradient](conjugate-gradient.md)
