# Gradient Projection

The **gradient projection** method (Goldstein, 1964; Levitin and Polyak, 1966) extends gradient descent to a convex feasible set C: it takes a gradient step and projects the result back onto C, x_new = P(x - t grad f(x)), where P(z) is the point of C nearest to z.

## The Step
The panel uses **Armijo backtracking along the projection arc**: starting with step t, it halves t until f(P(x - t grad f(x))) is at most f(x) + 1e-4 grad f(x)'(y - x), a sufficient decrease. After a successful step it tries a step twice as long next time, up to 1. It stops when the projected step moves x by less than 1e-9, or after **Max Iterations** iterations.

## Fixed Points
A point x* with P(x* - t grad f(x*)) = x* is a stationary point of the constrained problem: the negative gradient points out of C, perpendicular to its boundary, which is the KKT condition. For convex f and C it is the global solution.

## When It Pays
Gradient projection is effective when the **projection is cheap**: for bounds it is a clamp, for a Euclidean ball a rescaling, for the simplex a sort. Bound-constrained problems are the classic case, where it identifies the active bounds quickly, and L-BFGS-B builds on the same idea.

## Convergence
Like gradient descent, it converges at O(1/k) for convex f and linearly for strongly convex f, slowed by poor conditioning.

## In This Panel
For a general set of constraints there is no closed-form projection, so the panel computes P(z) by solving the small problem min ||y - z||^2 over the box and g(y) <= 0 with SLSQP, **unique only when the set is convex**. This keeps the method general but costs an inner solve per trial step.

## See Also
- [Frank-Wolfe](frank-wolfe.md) · [SLSQP](slsqp.md) · [Decision Guide](decision-guide.md)
