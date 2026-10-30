# Gauss-Newton

The **Gauss-Newton** method linearises the residuals at the current parameters, r(p + d) about r + J d, and takes the step that minimises the linearised sum of squares: the solution of J'J d = -J'r, computed in practice from a QR factorisation of J rather than by forming J'J.

## Relation to Newton
The Hessian of the sum of squares is 2 (J'J + sum r_i H_i), with H_i the Hessian of the i-th residual. Gauss-Newton keeps only J'J. When the residuals at the solution are **small**, or the model nearly linear, the dropped term is small and the convergence is close to quadratic; with zero residuals it is quadratic. With **large residuals** and a strongly nonlinear model, the convergence is only linear and may fail.

## Far From the Solution
The undamped step can be far too long, or point in a poor direction when J is nearly rank deficient. NonlinearSolve's GaussNewton() therefore adds a line search along the step. It is still less robust than Levenberg-Marquardt from a poor start; the **Starting-Point Study** shows the difference.

## When It Shines
On well-posed problems with a good start and small residuals, Gauss-Newton is the fastest of the three, with no damping or radius to adapt. It is also the basis of the standard errors: the covariance s^2 (J'J)^-1 is the inverse of the Gauss-Newton Hessian approximation.

## In This Panel
The panel builds a NonlinearLeastSquaresProblem from the residual function and solves it with NonlinearSolve.GaussNewton(), with an absolute tolerance of 1e-8; the iterations reported are the solver's steps.

## See Also
- [LM Algorithm](lm-algorithm.md) · [Dogleg Algorithm](dogleg-algorithm.md) · [Decision Guide](decision-guide.md)
