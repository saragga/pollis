# Proximal Point

The **proximal point method** (Martinet, 1970; Rockafellar, 1976) is the simplest proximal algorithm: it repeatedly applies the proximal map of the whole objective, x_new = argmin over u of F(u) + ||u - x||^2 / (2 t), with t the **Step Size**.

## Why It Helps
Each subproblem is **strongly convex**, even when F is not, and better conditioned: adding ||u - x||^2 / (2 t) raises every curvature by 1 / t. The iteration converges for any t > 0, with the objective decreasing at every step and the gap falling at rate O(1 / k) in the number of outer iterations, faster for larger t.

## The Trade-Off
The catch is that each step is itself an optimisation problem, as hard as F with a strongly convex term added. Larger steps need fewer outer iterations but give harder subproblems, closer to the original; smaller steps easier subproblems but more of them. With t infinite it is the original problem; with t small, each step is close to a subgradient step.

## In This Panel
Each subproblem, min F(u) + ||u - x||^2 / (2 t), is solved by an inner loop of 50 steps of accelerated proximal gradient (FISTA), with Lipschitz constant L + 1 / t. **Iterations** counts outer steps, so the total work is 50 times larger than the iteration count suggests; the **Budget Study**'s seconds reflect it.

## Why It Matters
The proximal point method is the foundation of many others. The **augmented Lagrangian** method is the proximal point method applied to the dual; Douglas-Rachford is a proximal point method on a related operator; the bundle method is a proximal point method on a cutting-plane model; and **Catalyst** accelerates first-order methods by wrapping them in an inexact proximal point loop.

## See Also
- [Bundle Methods](bundle.md) · [Douglas-Rachford](douglas-rachford.md) · [Decision Guide](decision-guide.md)
