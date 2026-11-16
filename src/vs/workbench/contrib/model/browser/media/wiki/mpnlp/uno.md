# Uno: A Unified Solver

**Uno** ([Vanaret and Leyffer (2026)](#ref-VL2026a)) is a solver for nonlinearly constrained optimization built on one observation: SQP methods and interior-point methods, together called **Lagrange-Newton methods**, share their key components, such as the way they compute a descent direction and the mechanism that makes them converge from a distant start. Uno abstracts their workflows into a framework of eight building blocks and combines strategies for each block into a working method, with no programming from the user. The Uno tab of the Nonlinear Programming panel calls it from JuMP through **UnoSolver.jl** ([Vanaret and Montoison (2026)](#ref-VM2026a)).

## The Building Blocks of a Lagrange-Newton Method
Every Lagrange-Newton method solves the KKT conditions iteratively with Newton's method. Uno decomposes such a method into interchangeable components: how the constraints are reformulated, how a step is computed, how convergence from a distant start is enforced, and when a trial point is accepted ([Vanaret and Montoison (2026)](#ref-VM2026a)). Choosing one strategy for each yields a classical method, such as an SQP or an interior-point method, or a hybrid of them. Uno supports sequential quadratic programming, convex and nonconvex, interior-point (barrier) methods, sequential linear programming, and unconstrained optimization.

## Presets of Uno
A **preset** fixes the strategy of every building block at once, so that Uno behaves like a known solver. The Uno tab sets the preset in its code, filtersqp by default, and names the others in a comment.

| Preset | Method |
|---|---|
| filtersqp | Sequential quadratic programming in a trust region, globalized by a filter; Uno's default |
| ipopt | An interior-point method with a filter line search, in the manner of Ipopt |
| funnelsqp | Sequential quadratic programming globalized by a funnel in place of a filter |
| filterslp | Sequential linear programming globalized by a filter |

On a smooth problem from the same start, the presets usually reach the same KKT point by different paths, in different numbers of iterations and evaluations.

## Sequential Quadratic Programming
A **sequential quadratic programming** (SQP) method replaces the problem, at each iterate, by a quadratic model of the Lagrangian subject to the linearized constraints, and steps to the solution of that subproblem ([Nocedal and Wright (2006)](#ref-NW2006a)). Its iterates may lie on the bounds, unlike those of an interior-point method, and the subproblems identify along the way which constraints are active at the solution. That makes SQP well suited to small and medium problems, and to warm starts from a nearby solution, when a sequence of similar problems is solved.

## The Filter of Fletcher and Leyffer
A **filter** ([Fletcher and Leyffer (2002)](#ref-FL2002a)) decides whether to accept a trial point without a penalty function. It treats the objective and the constraint violation as two separate goals, and keeps a list of the pairs of the two seen at earlier iterates. A trial point is accepted when no pair in the list is better than it in both goals, so a step can be taken for its progress towards feasibility or for its progress on the objective, and no penalty parameter has to be chosen to weigh one against the other.

## Uno in the Panel
- The **Uno** tab solves the model with the filtersqp preset; changing the preset in the code runs the same model with another method.
- The **Solver Comparison** runs Ipopt, MadNLP and Uno, at its default, on the same model, and reports the status, the objective and the seconds.
- **Solver Statistics** reports Uno's solve time, but no iteration count.
- The **KKT Conditions** and the **Constraint Sensitivity** read Uno's multipliers as they read those of Ipopt.

## References

<a id="ref-FL2002a"></a>Fletcher, R. and Leyffer, S. (2002). Nonlinear Programming without a Penalty Function. *Mathematical Programming* 91(2), 239–269. [doi:10.1007/s101070100244](https://doi.org/10.1007/s101070100244)

<a id="ref-NW2006a"></a>Nocedal, J. and Wright, S. J. (2006). *Numerical Optimization*. Springer (2nd ed.). [doi:10.1007/978-0-387-40065-5](https://doi.org/10.1007/978-0-387-40065-5)

<a id="ref-VL2026a"></a>Vanaret, C. and Leyffer, S. (2026). Implementing a Unified Solver for Nonlinearly Constrained Optimization. *Mathematical Programming Computation*. [doi:10.1007/s12532-026-00310-9](https://doi.org/10.1007/s12532-026-00310-9)

<a id="ref-VM2026a"></a>Vanaret, C. and Montoison, A. (2026). Uno: A Composable Framework for Nonlinearly Constrained Optimization. *Journal of Open Source Software* 11(123), 10229. [doi:10.21105/joss.10229](https://doi.org/10.21105/joss.10229)

## See Also
- [Interior-Point Methods](nlp.md) · [KKT Conditions](kkt.md) · [Decision Guide](decision-guide.md)
