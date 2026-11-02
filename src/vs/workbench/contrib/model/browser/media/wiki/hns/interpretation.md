# Reading Neighbourhood Search Results

The output of a search is a point and a value, plus some records of how they were found. Reading them well means separating what the run established from what it merely did not contradict.

## Best value and best point

`best_value` is the lowest objective value evaluated, and it is a fact about that point. Any point elsewhere with a lower value simply was not visited, so read the number as an upper bound on the global minimum.

`best_point` needs more care than the value. On a flat valley floor, many points give nearly the same value, so two runs can agree on the value but differ widely in the point. If the point itself carries meaning, such as a parameter estimate, compare the points across seeds and not only the values.

## Position inside the box

**Solution Summary** reports `relative_position`, (x − lb) / (ub − lb), for each variable. A value of 0 means the lower bound and 1 the upper bound, while 0.5 is the centre, which is where the default objective's optimum lies.

Entries at or very near 0 or 1 say the optimum wants to leave the box. Widen the box and run again before trusting such a solution, unless the bound is a real limit, such as a share that cannot go below zero. Entries inside the box say nothing against the solution but do not confirm it either.

## Evaluations and timing

`evaluations` is the true cost of the run, and it may overshoot **Budget** in the descent-based tabs. Comparing two methods is fair only at similar counts, so check it before declaring a winner.

`seconds_per_run` in **Compare vs CRS and SA** adds the overhead that evaluations miss. With a cheap objective, an algorithm's bookkeeping or line search can take more time than the function itself. With an expensive objective, evaluations dominate and seconds add nothing new. Which measure matters depends on what limits you in practice.

## Comparison tables across methods

**Compare vs CRS and SA** gives `mean_best` and `worst_best` over 5 seeds at the same budget. A lower mean with a far higher worst describes a method that wins often and fails badly, which may or may not suit you.

Five seeds separate large differences only, so a small gap between two means is no evidence of a real ranking. The ranking also belongs to this objective and budget. A different function, dimension or budget can reverse it, which is why a method should be judged on functions resembling your own problem and not on the default.

## Tab-specific facts

**Algorithm Properties** prints what is special to each tab. `hops_accepted` on **BH** counts accepted moves: near zero suggests a temperature too low, so the walk behaves like **ILS**. `final_weights` and `times_used` on **ALNS** record how operators fared, and the usage counts are the steadier record, as the [ALNS](alns.md) wiki explains.

The `guarantee` line on **SA** states that global convergence needs infinitely slow cooling. Read it as a warning rather than a reassurance, since no finite run cools that slowly.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [CRS](crs.md) · [ILS](ils.md) · [LNS](lns.md) · [ALNS](alns.md) · [Basin-Hopping](bh.md) · [Simulated Annealing](sa.md)
