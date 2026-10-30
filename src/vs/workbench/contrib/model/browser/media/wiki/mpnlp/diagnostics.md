# Diagnostics

## Status and Feasibility
**Status and Feasibility** reports the termination status, the primal and dual status, and the constraints violated by more than 1e-6 at the reported solution; an empty Dict means feasible. Typical termination statuses:
- **LOCALLY_SOLVED**: a KKT point was found (Ipopt, MadNLP);
- **OPTIMAL**: proven optimal within the solver's gap (SCIP, EAGO);
- **LOCALLY_INFEASIBLE** or **INFEASIBLE**: no feasible point found, or proof of infeasibility;
- **ITERATION_LIMIT**, **TIME_LIMIT**: stopped early.
For a local solver, LOCALLY_INFEASIBLE does not prove the problem infeasible: another start may succeed.

## Solver Statistics
**Solver Statistics** reports the solve time, barrier iterations, branch-and-bound nodes, the relative gap and the objective bound, where the solver provides them; missing means the solver does not report that attribute. For global and MINLP solvers, the **relative gap** between the best solution and the bound is the measure of how far from proven the result is; 0 means optimality is proven.

## Multi-Start
**Multi-Start** re-solves from 20 random starting points in the box and draws the histogram of the objective values found. With a local solver on the default problem, the starts split between the two local minima, about -0.54 and 1.69. A single value suggests one optimum, or a dominant basin; the original start is restored afterwards.

## Optimality Gap Check
The **Optimality Gap Check** compares, for NLP and Global NLP, the local Ipopt optimum with EAGO's global one: equal values mean the local optimum is global. For MINLP it compares the integer optimum with the **continuous relaxation**, the binaries allowed to be fractional, which is a bound on the integer optimum; the difference is the price of the integrality.

## Objective Contours and Solution Profile
The **Objective Contours** draw f over x[1] and x[2], with the others held at the optimum, and the optimum as a star. The **Solution Profile** shows each variable against the bounds: variables on a bound or at zero, under MINLP, are the active decisions.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Termination | LOCALLY_SOLVED or OPTIMAL | INFEASIBLE, a limit reached |
| Feasibility report | Empty | Violated constraints |
| Multi-Start | One objective value | Several |
| Relative gap | 0 | Large |
| Local vs global | Equal | Local worse |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
