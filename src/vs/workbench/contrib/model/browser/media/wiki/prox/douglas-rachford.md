# Douglas-Rachford

**Douglas-Rachford splitting** (Douglas and Rachford, 1956; Lions and Mercier, 1979) minimises a sum f(x) + g(x) of two convex functions using only their proximal maps. It works on an auxiliary sequence z:
1. u = prox of t f at z;
2. x = prox of t g at 2u - z, the **reflection** of z through u;
3. z = z + x - u.
The x (or u) sequence converges to a minimiser of f + g.

## In This Panel
f is the least-squares loss, whose prox is a linear solve with I + t A'A, factorised once by Cholesky; g is the penalty, whose prox is closed form. t is the **Step Size**.

## Convergence for Any Step
Douglas-Rachford converges for **every positive step** t, without a Lipschitz constant or a condition like Chambolle-Pock's. The step changes only the speed: too small and progress is slow, too large and the iterates oscillate between the two proxes. **Step Size Sensitivity** shows the trade-off, typically best near t of the order of 1 / sqrt of a typical curvature.

## Relation to ADMM
The **alternating direction method of multipliers** (ADMM) is Douglas-Rachford applied to the dual problem, and is equivalent to it on problems with the constraint x = z. ADMM is widely used for distributed and consensus optimisation, and the same tuning advice applies.

## Not a Descent Method
F(x_k) need not decrease at every iteration, though in practice it usually does after the first ones. The **Descent Check** counts the increases.

## In ProximalAlgorithms.jl
**Compare with ProximalAlgorithms** runs ProximalAlgorithms.DouglasRachford with the same step, gamma = step, on LeastSquares(A, b) and the penalty, as a check of the panel's hand-written loop.

## See Also
- [Chambolle-Pock](chambolle-pock.md) · [Proximal Point](proximal-point.md) · [Decision Guide](decision-guide.md)
