# Truncated Newton

**Truncated Newton**, or Newton-CG, solves the Newton system H d = -g only **approximately**, by a few iterations of the conjugate-gradient method. Conjugate gradients never need H itself, only products H v, which can be computed from gradients alone, so the method avoids forming, storing and factorising the n by n Hessian.

## The Inner Loop
The conjugate-gradient iterations are stopped, or truncated, early: when the residual of the Newton system is small relative to the gradient, or when a direction of negative curvature is found. Far from the minimum a rough step is enough; near it the inner loop is run more accurately, and the convergence approaches that of Newton (superlinear, rather than exactly quadratic).

## In This Panel
The panel uses NLopt's **LD_TNEWTON_PRECOND_RESTART**, Dembo and Steihaug's preconditioned truncated Newton with restarts, in Svanberg's implementation. It takes the gradient from ForwardDiff and approximates the Hessian-vector products by differences of gradients, preconditioned by a low-memory quasi-Newton approximation. It runs up to 2000 evaluations, with a relative tolerance of 1e-12 on f. The **Derivatives** setting does not apply.

## What the Panel Reports
NLopt reports no iteration count, so the panel counts **function evaluations**, and the path records the points that improved on the best value so far, not iterates. The **Convergence Check**'s observed order is therefore only indicative for this method.

## When It Pays
For n in the thousands or more, where the full Hessian is too large to form or factorise, Truncated Newton keeps Newton's fast convergence with memory and work per iteration proportional to n. For small n, Newton or the trust region is simpler and as fast.

## See Also
- [Newton](newton.md) · [Newton Trust Region](newton-trust-region.md) · [Decision Guide](decision-guide.md)
