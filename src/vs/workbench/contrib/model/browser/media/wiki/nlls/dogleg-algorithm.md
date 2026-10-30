# Dogleg Algorithm

The **Dogleg** method (Powell, 1970) is a trust-region method: at each iteration it seeks the step d that minimises the linearised sum of squares ||r + J d||^2 subject to ||d|| <= Delta, where Delta is the trust-region radius.

## The Dogleg Path
Instead of solving this subproblem exactly, it follows a path made of two straight segments:
1. From the current point to the **Cauchy point**, the minimum of the linearised model along the steepest-descent direction -J'r.
2. From the Cauchy point to the **Gauss-Newton point**, the unconstrained minimum of the model, -(J'J)^(-1) J'r.
The step is where this bent path, shaped like a dog's hind leg, leaves the trust region. If the Gauss-Newton point lies inside the region, it is the step.

## The Radius
As in Levenberg-Marquardt, the actual reduction is compared with the predicted one: a good step enlarges Delta, a poor one shrinks it and is retried. Near the solution the region contains the Gauss-Newton point and the method takes Gauss-Newton steps.

## Strengths and Weaknesses
Each iteration costs one factorisation, and the path is cheap to compute, so Dogleg often needs fewer function evaluations than Levenberg-Marquardt on **well-scaled problems with small residuals**. It is less robust when J is nearly rank deficient, since the Gauss-Newton point is then unreliable, and more sensitive to parameter scaling, since the trust region is a sphere.

## In This Panel
The panel calls LeastSquaresOptim.Dogleg() with ForwardDiff for J and tolerances of 1e-8.

## See Also
- [LM Algorithm](lm-algorithm.md) · [Gauss-Newton](gauss-newton.md) · [Decision Guide](decision-guide.md)
