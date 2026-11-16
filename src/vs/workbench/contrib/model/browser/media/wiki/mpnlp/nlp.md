# Interior-Point Methods

A **nonlinear program** is min (or max) f(x) subject to constraints g(x) <= 0, h(x) = 0 and bounds, with continuous variables and smooth nonlinear f, g and h. The Nonlinear Programming panel solves it with interior-point methods, the most widely used approach for large smooth problems.

## How an Interior-Point Method Works
An interior-point method turns each inequality into an equality with a slack variable, and keeps the slacks and the bounded variables strictly inside their bounds by adding a **logarithmic barrier**, minus mu times the sum of their logarithms, to the objective. For a fixed barrier parameter mu it takes Newton steps on the KKT conditions of the barrier problem, for the primal variables and the multipliers together, and then reduces mu towards zero. The iterates follow a **central path** through the interior of the feasible region to a KKT point of the original problem ([Nocedal and Wright (2006)](#ref-NW2006a)).

## Ipopt and Its Filter Line Search
**Ipopt** ([Wächter and Biegler (2006)](#ref-WB2006a)) is the standard open-source implementation. A **filter line search** decides whether a step is accepted: the step must reduce either the objective or the constraint violation enough, compared with the pairs of the two recorded so far, so no penalty parameter has to be tuned. When no acceptable step exists, a restoration phase looks for a less infeasible point. A sparse symmetric linear solver handles the Newton systems, so problems with hundreds of thousands of variables are within reach.

## MadNLP, an Interior-Point Solver in Julia
**MadNLP** implements the same family of methods in Julia, with the same JuMP interface. Its linear algebra can run on a **GPU**, which pays off on large problems with a regular structure, and its code can be read and extended from Julia.

## Exact Derivatives from JuMP
JuMP differentiates the objective and the constraints by automatic differentiation and passes the solver the gradient, the sparse Jacobian of the constraints and the sparse Hessian of the Lagrangian. No derivative needs to be coded by hand, and the Newton steps use exact second-order information.

## What an Interior-Point Method Finds
An interior-point method finds a point satisfying the KKT conditions: a local optimum, or occasionally a saddle point. The point it reaches depends on the start, which the panel sets at (lb + ub) / 2 for every variable; **Multi-Start** explores other starts.

## References

<a id="ref-NW2006a"></a>Nocedal, J. and Wright, S. J. (2006). *Numerical Optimization*. Springer (2nd ed.). [doi:10.1007/978-0-387-40065-5](https://doi.org/10.1007/978-0-387-40065-5)

<a id="ref-WB2006a"></a>Wächter, A. and Biegler, L. T. (2006). On the Implementation of an Interior-Point Filter Line-Search Algorithm for Large-Scale Nonlinear Programming. *Mathematical Programming* 106(1), 25–57. [doi:10.1007/s10107-004-0559-y](https://doi.org/10.1007/s10107-004-0559-y)

## See Also
- [KKT Conditions](kkt.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
