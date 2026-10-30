# Convex Programming

A **convex programme** minimises a convex function over a convex set. The panel's model is

    minimise   f(x)   subject to   a constraint in x,   x >= 0,

with the default f(x) = sum((x - (1:n)/n)^2), the squared distance to the point (1/n, 2/n, ..., 1), under sum(x) == 1.

## Why Convexity Matters
For a convex problem, every **local minimum is global**, the optimality (KKT) conditions are sufficient, and the dual gives a bound on the optimal value. A solver that returns OPTIMAL with a small duality gap has solved the problem, not found one of many local minima.

## From Expression to Cone
Solvers do not handle a quadratic objective as such. JuMP **bridges** it: it introduces an epigraph variable t, minimises t, and adds the constraint that (t, 1/2, the square-root factor of the quadratic times x) lies in a **rotated second-order cone**. The user writes the natural expression; the solver sees a conic programme. That bridging works only for expressions JuMP recognises as convex: a non-convex quadratic is rejected.

## The Default Problem
The default is the **projection** of (1/n, ..., 1) onto the **probability simplex** {x >= 0, sum(x) = 1}. Since that point sums to more than 1, the solution shifts every coordinate down by the same amount and sets the small ones to 0: the bounds on the lowest coordinates are active, visible in **Residuals and Slacks**.

## The Parametric Sweep
The sweep varies the constraint's right-hand side from half to twice its value. The optimal value is convex in the right-hand side, and its slope is the constraint's **shadow price**.

## vs Baseline
**vs Baseline** deletes the constraint and solves again: the difference in optimal value is the cost of the constraint. The model must be rebuilt afterwards to restore it.

## See Also
- [SOCP](socp.md) · [Duality](duality.md) · [Decision Guide](decision-guide.md)
