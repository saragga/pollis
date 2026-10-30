# Second-Order Methods — Overview

This webview minimises f(x) with Newton-type methods from **Optim.jl** and **NLopt.jl**. The gradient and Hessian come from **ForwardDiff.jl** (exact, by automatic differentiation) or **FiniteDiff.jl**, chosen by **Derivatives**. The default objective is the Rosenbrock function from (-1.2, 1), whose minimum at (1, 1) lies at the end of a narrow curved valley.

## The Newton Step
At the point x, with gradient g and Hessian H, the quadratic model f(x) + g'd + d'Hd/2 is minimised by the step d = -H^(-1) g. When H is positive definite, that step points downhill and, near the minimum, lands almost exactly on it. Far from the minimum, or where H is indefinite, it can point the wrong way or be far too long, and each method guards against that differently.

## The Methods
- **Newton** modifies H to be positive definite when needed and adds a line search along d. See [Newton](newton.md).
- **Newton Trust Region** minimises the model only within a radius it trusts, enlarging or shrinking it as the model proves accurate. See [Newton Trust Region](newton-trust-region.md).
- **IPNewton** adds a barrier that keeps the iterates inside the box bounds. See [IPNewton](ipnewton.md).
- **Truncated Newton** solves the Newton system only approximately, by conjugate gradients, with Hessian-vector products. See [Truncated Newton](truncated-newton.md).

## Common Workflow

1. Enter the **Objective f(x)** and the **Initial Guess x0**, choose the method and **Derivatives**, and run.
2. Look at the **Convergence Trace** for the quadratic plunge, and the **Contour + Path**.
3. Run the **Convergence Check**, the **Gradient Check** and the **Hessian Conditioning**.
4. Check the **Quadratic Model** and **Evaluate at New Point**.
5. **Compare Methods**, against BFGS too, and test **Start Robustness**.
6. Read the **Solution Summary** and the **Local Curvature**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
