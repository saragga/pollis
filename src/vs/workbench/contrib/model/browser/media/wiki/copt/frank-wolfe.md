# Frank-Wolfe

The **Frank-Wolfe** method (Frank and Wolfe, 1956), or **conditional gradient** method, minimises a smooth convex function over a convex set without projections. At each iteration it:
1. calls a **linear minimisation oracle** (LMO): v = argmin over the set of grad f(x)' v, the point of the set furthest in the direction of steepest descent;
2. moves towards it: x_new = x + gamma (v - x), with a step gamma in [0, 1].
Since x_new is a convex combination of points of the set, the iterates stay **feasible**.

## The Dual Gap
The quantity grad f(x)'(x - v) is an upper bound on f(x) - f*, for convex f: the **Frank-Wolfe gap**. It gives a certificate of accuracy at every step, which the panel reports in the status.

## Strengths
- **Projection-free**: for sets where minimising a linear function is easy (polytopes, norm balls, the simplex, matrices of bounded nuclear norm) the LMO is far cheaper than a projection.
- **Sparse iterates**: after k steps, x is a combination of at most k + 1 extreme points, which is useful in sparse regression and matrix completion.

## Weaknesses
Convergence is O(1/k) in the objective, slow for high accuracy, and the iterates zigzag when the solution lies on a face of the set. Away-step and pairwise variants in FrankWolfe.jl reduce the zigzag on polytopes.

## In This Panel
The panel calls FrankWolfe.frank_wolfe with an adaptive line search. Its LMO minimises the linear function over the box and the constraints by a small SLSQP problem, **exact only when the set is convex**. It starts at the extreme point of the set opposite the centre. The **Solution Path** records every iterate.

## See Also
- [Gradient Projection](gradient-projection.md) · [SLSQP](slsqp.md) · [Decision Guide](decision-guide.md)
