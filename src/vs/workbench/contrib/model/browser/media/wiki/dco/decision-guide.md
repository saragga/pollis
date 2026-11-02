# Decision Guide

Choose the simplest method that meets the need, and ask first whether a heuristic is needed at all. Exact solvers now handle many problems that were once out of reach.

## Which Tab Fits the Problem

| Situation | Choice | Why |
|---|---|---|
| A good greedy rule exists | **GRASP** | Starts are good, and runs parallelise |
| Several cheap neighbourhoods | **VND** | Stronger local optima at little cost |
| Descent gets stuck | **VNS** | Escapes by shaking, keeps structure |
| Only a little time | **VNS**, from a greedy start | Quick early gains |
| Very many processors | **GRASP** | Iterations are independent |

## When to Use an Exact Method Instead

Try an exact method if a proof of optimality matters, or if the instance is small. Integer programming solvers handle many combinatorial models directly, and specialist tour solvers solve very large instances to optimality, as reported by [Applegate, Bixby, Chvátal and Cook (2011)](#ref-ABCC2011a). A heuristic suits very large instances, tight time limits, odd constraints that break a solver's model, or a need for a good answer rather than a proved one. A heuristic can also supply a warm start to an exact solver.

## How to Choose the Neighbourhoods

Start with **Neighbourhoods** at 2, 2-opt and or-opt, which are a good pair for tours. Add swap only if **Neighbourhood Analysis** shows that it finds improvements. Order them from the cheapest to the costliest, and from the most to the least productive. For another problem, design moves that reflect its structure: for scheduling, shifting one job, and for assignment, exchanging two. A neighbourhood with a fast way to evaluate a move is worth far more than a fancy one with a slow evaluation.

## How to Choose Alpha and Shaking Levels

Try **Greediness (alpha)** values of 0, 0.1, 0.3 and 0.5 on **GRASP**, using **Restart Study** for each. Small values usually do best when the greedy rule is good. Reactive GRASP can set it automatically. Try **Shaking Levels** of 1, 3 and 5 on **VNS**, and raise it for large instances. Tune on a set of instances, and test on another set, to avoid fitting to one instance. Both settings often matter less than the choice of neighbourhoods.

## How to Set a Budget

Use **Budget Impact** to find where returns fall off, and use **Time Budget** if a real deadline applies. Use **Multistart** if independent runs can be parallelised, as several short runs can beat a single long run when the search stalls. Give every compared method the same time. For a problem solved repeatedly, tune the budget once on typical instances. For a one-off problem of high value, run as long as time permits, and use several methods.

## What to Report from a Heuristic Study

Report the instance or its generator, the number of cities, the method, its settings and the stopping rule. Give the best, the mean and the spread over many seeds, with times and the machine. Include a baseline and a bound, or a known optimum. Say which moves were used and how they were evaluated. Do not claim optimality without a proof, and do not claim superiority on one instance. Report on a public benchmark where possible, so that others can compare results directly.

## References

<a id="ref-ABCC2011a"></a>Applegate, D. L., Bixby, R. E., Chvátal, V. and Cook, W. J. (2011). *The Traveling Salesman Problem: A Computational Study*. Princeton University Press. [doi:10.1515/9781400841103](https://doi.org/10.1515/9781400841103)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [GRASP](grasp.md) · [VNS](vns.md)
