# NLP

A **nonlinear program** is min (or max) f(x) subject to constraints g(x) <= 0, h(x) = 0 and bounds, with continuous variables and smooth, nonlinear f, g and h. In the Nonlinear Programming panel it is solved locally by an interior-point method.

## Ipopt
**Ipopt** (Wachter and Biegler, 2006) is the standard open-source solver for smooth NLPs. It turns inequalities into equalities with slack variables, keeps the slacks and bounded variables strictly inside their bounds with a **logarithmic barrier**, and takes Newton steps on the KKT conditions of the barrier problem for the primal and dual variables together, reducing the barrier parameter towards zero. A filter line search ensures progress, and a sparse linear solver handles the Newton systems, so problems with hundreds of thousands of variables are within reach.

## MadNLP
**MadNLP** is a pure-Julia interior-point solver with the same algorithm family and interface. It can run its linear algebra on a **GPU**, which pays off on large problems, and is easier to extend from Julia.

## Exact Derivatives from JuMP
JuMP differentiates the objective and constraints symbolically and by automatic differentiation, and passes the solver the gradient, the sparse Jacobian of the constraints and the sparse Hessian of the Lagrangian. No derivative needs to be coded by hand.

## What It Finds
A point satisfying the KKT conditions: a local optimum, or occasionally a saddle point. For **convex** problems it is global. The panel starts every variable at (lb + ub) / 2, 0 by default, and on the default nonconvex problem the result depends on that start, which **Multi-Start** explores.

## See Also
- [KKT Conditions](kkt.md) · [Global NLP](gnlp.md) · [Decision Guide](decision-guide.md)
