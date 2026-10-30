# SOCP

A **second-order cone programme** (SOCP) has constraints of the form ||u|| <= t, where u is affine in x and t is affine in x: the point (t, u) lies in the **second-order cone**, or Lorentz cone, {(t, u): ||u||_2 <= t}. It contains linear and convex quadratic programmes as special cases.

## The Panel's Model
The **Second-Order Cone** model is a norm-constrained regression:

    minimise   ||A x - b||_2   subject to   ||x||_2 <= radius.

It is written with an **epigraph** variable t: minimise t subject to [t; A x - b] in SecondOrderCone() and [r; x] in SecondOrderCone(), where r is fixed at the **Norm Radius** so that the sweep can change it.

## Relation to Ridge Regression
Constraining ||x|| <= radius is the constrained form of **ridge regression**: for every radius there is a ridge penalty giving the same solution. When the radius exceeds the norm of the ordinary least-squares coefficients, the constraint is inactive and the solution is OLS; below, it shrinks the coefficients. **vs Baseline** reports OLS's residual norm and coefficient norm beside the constrained fit.

## Other SOCP Applications
- **Portfolio risk**: sqrt(w' Sigma w) <= sigma_max, with Sigma = L L', is ||L' w|| <= sigma_max.
- **Robust least squares** under bounded data uncertainty.
- **Facility location** and Euclidean distances.
- **Chance constraints** under Gaussian uncertainty.

## Duality
The second-order cone is **self-dual**: its dual cone is itself. The dual of each cone constraint, in **Sensitivity Analysis**, is a vector (s, v) with ||v|| <= s; a non-zero dual on the radius constraint says the constraint is active.

## The Parametric Sweep
The sweep varies the radius from 0.05 to 3: the residual norm falls as the radius grows and flattens at the OLS fit.

## See Also
- [Convex Programming](convex.md) · [Power Cone](powcone.md) · [Duality](duality.md)
