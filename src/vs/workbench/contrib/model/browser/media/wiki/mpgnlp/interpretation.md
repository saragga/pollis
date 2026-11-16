# Interpretation

## What a Certified Global Optimum Means
A global solver's answer with status OPTIMAL is the **certified global optimum** within its tolerance: no point in the box, satisfying the constraints, is better by more than the gap. Unlike a local optimum, it does not depend on the starting point. The certificate covers the problem as written, its bounds included, and the tolerance of the solver; both belong with the result when it is reported.

## Local Against Global
**Local Against Global** solves the problem with Ipopt from 20 random starts and draws the objective values it reaches, with the global optimum as a vertical line. The bars show the local optima a local solver can stop at, and how often; their distance from the line is what trusting a single local solve could cost. A histogram concentrated on the line means the problem is benign for local solvers despite its nonconvexity.

## KKT at the Global Optimum
Global solvers usually return no multipliers. **KKT at the Global Optimum** starts Ipopt at the global optimum, where it stays, and lists each constraint's value, multiplier and the product multiplier times slack, from Ipopt. The multipliers say how the global optimum would move if a constraint were relaxed slightly, as long as the same basin stays the best; a large change can make another basin global.

## Constraint Activity
**Constraint Activity** lists the constraints and bounds with their slack and whether they bind (slack below 1e-6) at the global optimum. A bound that binds deserves a second look: if it is not part of the problem but a bound added for the solver, the true optimum may lie outside the box, and the bound should be widened.

## Objective Contours Around the Global Optimum
The **Objective Contours** draw the objective over x[1] and x[2], the other variables held at their optimal values, with the global optimum as a star. Other low regions in the picture are the basins where a local solver can stop.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Spatial Branch and Bound](gnlp.md)
