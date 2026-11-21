# Reading the Comparison

## The Counts of Compare the Methods
**Compare the Methods** runs Uno's four presets and Ipopt on the same problem, from the same start, and reports for each:
- **status**: `first_order` for a KKT point found within the tolerances, `max_iter` when the iteration limit was reached first, and other values for failures;
- **objective**: the objective at the point returned;
- **iterations**: the outer iterations of the method;
- **subproblems**: the quadratic or linear subproblems, or Newton systems, solved, which can exceed the iterations when steps are rejected or the method enters feasibility restoration;
- **objective**, **constraint**, **gradient** and **Jacobian evaluations**: how often the method evaluated the functions and their first derivatives;
- **seconds**: the time of a second run, which leaves out Julia's compilation.
Ipopt reports its iterations and seconds through JuMP, and no evaluation counts.

## Iterations Are Not the Same Unit Across Methods
An iteration of an interior-point method solves one Newton system; an iteration of an SQP method solves a quadratic program, which may itself take many steps of an active-set solver; an iteration of an SLP method solves a linear program. Fewer iterations therefore do not always mean less work. The evaluations are closer to a common unit when the functions are expensive, as in models built on simulations, and the seconds are the common unit on the computer at hand, though on small problems they are dominated by overheads.

## Typical Patterns in the Comparison
The patterns below are the usual ones for these families of methods ([Nocedal and Wright (2006)](#ref-NW2006a)); a particular problem can depart from them.
- **SQP and interior point**: on small, well-posed problems SQP methods usually take fewer iterations, as each quadratic subproblem finds the active constraints; interior-point methods take a steadier number of iterations as the problem grows.
- **SLP**: without second derivatives, the iterations of an SLP method converge slowly near the solution, so it usually needs many more of them, each cheap.
- **Filter and funnel**: on a well-scaled problem the two often take the same path, as every trial point is accepted; they differ when steps are rejected.
- **Degenerate problems**: when no constraint qualification holds, interior-point methods tend to slow down near the solution, and different methods may stop at different solutions of the same problem.

## Random Starts and Robustness
**Random Starts** runs the tab's method from 20 points drawn in the box of the bounds, from -3 to 3 where a variable has none, and draws the iterations of the starts that were solved, with their number in the title. A method that solves every start in a narrow range of iterations is robust on that problem; failures or a long tail mean that the standard start flatters it. On a nonconvex problem, different starts may also reach different KKT points.

## Optimality Measures and the Iteration Log
**Optimality Measures** reports the primal infeasibility, the stationarity and the complementarity at the point returned, which all go to 0 at a KKT point, with the status and the iterations. The **Iteration Log** repeats the solve with Uno's log, one line per iteration, in which a run of rejected steps, a switch to feasibility restoration or a stalling infeasibility shows where a method struggles.

## References

<a id="ref-NW2006a"></a>Nocedal, J. and Wright, S. J. (2006). *Numerical Optimization*. Springer (2nd ed.). [doi:10.1007/978-0-387-40065-5](https://doi.org/10.1007/978-0-387-40065-5)

## See Also
- [Overview](overview.md) · [Filters, Funnels and Merit Functions](globalization.md) · [The Ingredients of a Solver](ingredients.md)
