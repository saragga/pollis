# Neighbourhood Search Diagnostics

A search always returns a best point, so the task is to tell a good result from a stalled one. Each check targets a different way a search can fail without saying so.

## Did the search stop for a good reason?

**Return Status** shows `return_code`, `used`, `best_first_reached_at` and `improvements`. Only **CRS** reports a real code, and a code saying the evaluation limit was reached means the budget ran out, not that the search converged. The other tabs print a note that the loop stops when the budget is used.

`best_first_reached_at` is the most telling number. A value late in the budget means improvement was still arriving, so more budget may help. A value very early means most of the budget found nothing, either because the optimum was found early or because the search got stuck. Only the checks below can separate those two cases.

## Reading the convergence curve

**Convergence Curve** plots the best value so far against evaluations, so it can only fall or stay flat. A staircase with long flats is normal for kick-and-descend methods, because most moves fail and one success drops the line.

A smooth early fall that flattens at a high level suggests premature convergence, common in **CRS** with a small population and **SA** with fast cooling. A curve still falling at the end is an unfinished run. Curves from different tabs compare directly because the horizontal axis counts the same evaluations.

## Is the main setting well chosen?

**Parameter Sensitivity** repeats the search along a grid and reports `mean_best` and `worst_best`. The grid follows the tab: population, perturbation scale, destroy fraction, reaction factor, temperature or cooling rate. On **BH** it varies the temperature only, leaving the kick scale fixed.

Look at the shape across the grid. A clear best interior value means the setting matters and the default may be improved. A flat response means the setting barely matters on this problem. A best value at the end of the grid suggests extending the range. Prefer a setting with good `worst_best`, since the mean can hide occasional failures.

## Would another seed agree?

**Seed Robustness** runs 10 seeds and reports `best_values`, `mean`, `spread` and `share_within_1e_4_of_best`. A share near 1 with a small spread means the method reaches the same value nearly every time.

The reference value is the best of those 10 runs, not the true optimum. All 10 could agree on a wrong answer, so a high share shows repeatability and not success. A low share is the clearer signal: the search is not reliable at this budget, so raise the budget, change the setting or change the tab. A single run should never be reported from such a problem.

## Is the point a real minimum?

**Solution** gives `gradient_norm` from central differences, and **Local Polish** runs a tight L-BFGS from the best point and reports `improvement`. A small gradient and a tiny improvement mean the point sits at the bottom of its valley.

A large improvement after **CRS** or **SA** is expected, since neither polishes its answer. After a descent-based tab it means the inner descents were cut short, for instance by the limit of 5 outer iterations. Note what polish cannot tell you. A perfectly polished point can still be a poor local minimum, because a descent never leaves its valley.

## Where did the search actually go?

**Objective Landscape** draws the function over the first two variables with all evaluated points. Clusters tell you where effort went. Points piled at one spot with an empty rest of the box mean the search never explored the rest, and a better valley could remain unseen.

For more than two variables, the map holds the others at the best point, so it is a slice rather than the whole function. The view needs at least two variables. Points along the edges of the map are a warning that kicks or re-samples are being clipped by the box, which **Solution Summary** can confirm through `relative_position`.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [CRS](crs.md) · [ILS](ils.md) · [LNS](lns.md) · [ALNS](alns.md) · [Basin-Hopping](bh.md) · [Simulated Annealing](sa.md)
