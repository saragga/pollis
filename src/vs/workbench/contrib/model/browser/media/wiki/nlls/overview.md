# Nonlinear Least Squares — Overview

The Nonlinear Least Squares panel fits a model f(t, p) to observations y at inputs t. The residuals are r(p) = y - f(t, p); the solvers minimise ||r(p)||^2. The Jacobian of the residuals, J, is computed by **ForwardDiff.jl**. The default example is an exponential decay, p1 exp(-p2 t), fitted to eleven points.

## The Gauss-Newton Idea
Linearising the residuals around the current p, r(p + d) is about r + J d, and the least-squares problem in d is linear: its solution solves the **normal equations** J'J d = -J'r. J'J approximates the Hessian of the sum of squares, ignoring the term with second derivatives weighted by the residuals, which is small when the residuals are small. That gives Newton-like steps from first derivatives only.

## The Solvers
- **Levenberg-Marquardt** (LeastSquaresOptim.jl) adds a damping term to J'J, shifting between Gauss-Newton and gradient descent. See [LM Algorithm](lm-algorithm.md).
- **Dogleg** (LeastSquaresOptim.jl) takes a trust-region step along a path between the steepest-descent and Gauss-Newton points. See [Dogleg Algorithm](dogleg-algorithm.md).
- **Gauss-Newton** (NonlinearSolve.jl) takes the undamped step with a line search. See [Gauss-Newton](gauss-newton.md).

## Common Workflow

1. Enter the **Model f(t, p)**, the **Initial Parameters p0**, the **Inputs t** and the **Observations y**, choose a solver, and run.
2. Check the **Fitted vs Observed** plot and the **Residual Plot**.
3. Run the **Residual Analysis**, the **Gradient Norm** and the **Condition Number**; look at the **Jacobian Structure**.
4. Read the **Summary**, the **Parameter Estimates** and the **Goodness of Fit**; compute the **Parameter CI**.
5. Predict with **Fitted Values** and **New-Point Eval**.
6. **Compare Solvers**, run the **Starting-Point Study** and the **Tolerance Sweep**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
