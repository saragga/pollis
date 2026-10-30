# LM Algorithm

The **Levenberg-Marquardt** algorithm (Levenberg, 1944; Marquardt, 1963) solves at each iteration the damped normal equations (J'J + lambda D) d = -J'r, where lambda >= 0 is the **damping parameter** and D is a diagonal scaling, typically the diagonal of J'J.

## The Damping
- With **lambda small**, the step is the Gauss-Newton step, fast near the solution.
- With **lambda large**, the step is a short step along the negative gradient, J'r, scaled by D: safe far from the solution.
After each trial step the algorithm compares the actual reduction in the sum of squares with the reduction predicted by the linearisation. If the step was good, it is accepted and lambda decreases; if not, it is rejected and lambda increases. It is equivalent to a **trust-region** method, with lambda controlling the region's size.

## Why It Is the Default
The damping makes J'J + lambda D positive definite even when J is rank deficient, so the step always exists, and the adaptive lambda makes the method converge from much poorer starting points than Gauss-Newton. Near a solution with small residuals lambda goes to zero and the convergence is as fast as Gauss-Newton's.

## Scaling
Marquardt's scaling by the diagonal of J'J makes the method invariant to rescaling the parameters, which matters when they differ by orders of magnitude, as an amplitude and a rate often do.

## In This Panel
The panel calls LeastSquaresOptim.LevenbergMarquardt() with forward-mode automatic differentiation for J, and tolerances of 1e-8 on x and on f. The **Tolerance Sweep** varies them.

## See Also
- [Dogleg Algorithm](dogleg-algorithm.md) · [Gauss-Newton](gauss-newton.md) · [Decision Guide](decision-guide.md)
