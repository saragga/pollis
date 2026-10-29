# BFGS

**BFGS**, named after Broyden, Fletcher, Goldfarb and Shanno, who published it independently in 1970, is the most widely used quasi-Newton method.

## The Update
After a step s = x_new - x with gradient change y = g_new - g, BFGS replaces the inverse-Hessian approximation H by

H_new = (I - rho s y') H (I - rho y s') + rho s s',  with rho = 1 / (y's).

H_new satisfies the secant condition H_new y = s, is symmetric, and is the closest such matrix to H in a weighted norm. If H is positive definite and **y's > 0**, H_new is positive definite too, so the direction -H g is always a descent direction.

## The Curvature Condition
y's > 0 says the gradient increases along the step: curvature is positive in that direction. A line search that satisfies the **Wolfe conditions**, sufficient decrease and a reduced slope at the new point, guarantees it. When it fails, Optim skips the update for that step and keeps H.

## The Starting Matrix
Optim starts from the identity, so the first step is a steepest-descent step, scaled by the line search. An initial step norm can be set instead, which scales the identity by the size of the first gradient. A poor start costs some early iterations: BFGS corrects H as it goes, and its **self-correcting** property recovers from bad approximations far better than other updates.

## Convergence
Near a minimum with a positive-definite Hessian, BFGS converges **superlinearly**: the ratio of successive errors tends to zero. It does not converge quadratically like Newton's method, but the extra iterations are cheap, since each costs O(n^2) operations and one gradient, against Newton's Hessian and O(n^3) solve.

## Cost and Size
The n by n matrix costs O(n^2) memory: 8 MB at n = 1000, 800 MB at n = 10000. Above a few thousand variables, use L-BFGS.

## See Also
- [L-BFGS](lbfgs.md) · [Overview](overview.md) · [Decision Guide](decision-guide.md)
