# Diagnostics

## Convergence Trace
The **Convergence Trace** plots the best value found so far minus the final minimum against the number of evaluations, on a log scale. Poll methods show a staircase: flat stretches of failed polls and step halving, then a drop. Steady progress down to small values means convergence; a trace that flattens high means the method stalled, or the budget ran out.

## Contour + Path
The **Contour + Path** shows every evaluated point as a faint dot and the path of improving **incumbents** in black, on the contours of f. Pattern search's points form a cross around each incumbent, shrinking as h halves; Nelder-Mead's a trail of simplex vertices; MADS's a scatter of directions that changes from iteration to iteration. On the default problem the contours have corners along x1 = 1 and x2 = -0.5.

## Convergence Check
The **Convergence Check** reports the evaluations used and makes a **final poll**: it evaluates f at distance 1e-4 along each +/- e_i from the solution. **poll_stationary** true means no neighbour improves: locally optimal at that scale, in the coordinate directions. A positive **best_neighbour_improvement** means the method stopped before converging.

## Restart Sensitivity
**Restart Sensitivity** solves from 10 random starts around x0 and lists the solutions by objective. Agreement suggests a single minimum; different minimisers with different values reveal local minima; different minimisers with the same value, a flat region.

## Noisy Objective
**Noisy Objective** solves again with Gaussian noise of standard deviation 0.01 added to every evaluation, then reports the noisy solution, its distance from the clean one, and the clean value there. A small distance means the method is robust to that noise level.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Convergence trace | Falls to small values | Flattens high |
| Poll stationary | true | false |
| Restarts | Same solution | Several solutions |
| Noise | Solution moves little | Moves far |
| Evaluations | Within the budget | Budget exhausted |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
