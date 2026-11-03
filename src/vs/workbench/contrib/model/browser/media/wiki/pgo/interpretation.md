# Stochastic Search with Local Refinement: Interpretation

How to read the outputs: the best point and value, what a global method can and cannot promise, the comparisons between methods and budgets, and the summary of the algorithm.

## The best point and value

`best_point` and `best_value` are the lowest value of f among all the points the method evaluated, and where it was found. With the default Rastrigin function, the global minimum is 0 at the origin, so `best_value` measures directly how far the method fell short.

For an objective whose minimum is unknown, `best_value` is an upper bound on the global minimum: the true minimum is at most that low. **Local Polish** can lower it further by refining the point locally, and its `improvement` shows by how much.

## What the methods promise

**Algorithm Properties** states what the selected method assumes and guarantees. For MLSL, [Rinnooy Kan and Timmer (1987)](#ref-KT1987a) give methods that find all relevant local minima with probability 1; NLopt's documentation, by [Johnson (2007)](#ref-Joh2007c), speaks of theoretical guarantees of finding all local optima in a finite number of local minimisations.

StoGO-R bounds f in each box using gradients, and TikTak is described by **Algorithm Properties** as a heuristic, supported by the benchmarks of [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a). **Seed Robustness** and **Compare Methods** show, for the problem at hand, how stable and how good the answer is.

## Reliability in practice

[Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) name several practical considerations in judging an optimiser, the first and arguably most important being reliability, the likelihood that it finds the global optimum of the problem at hand; a further one is how close it comes when it fails.

They count a minimisation as successful when the distance between the returned and the true minimum, in function value or in parameters, is smaller than a threshold, and note that the choice of threshold is a judgement call. **Seed Robustness** gives the panel's version: the spread of the best values and the largest distance between the solutions over five seeds.

## Comparing methods

**Compare Methods** runs MLSL, StoGO-R, AGS, DIRECT-L and CRS2, and TikTak on its tab, at the same budget over three seeds, and reports the mean and the worst best value and the seconds per run. Each method first runs once on a budget of 20, so the times exclude compilation.

NLopt's documentation advises that a fair way to compare algorithms is to ask how long each takes to reach the same function value, rather than to compare their results under their own stopping tests. **Compare Methods** fixes the number of evaluations instead, and compares the values reached.

## The budget

**Budget Study** reruns the selected method with budgets of 100, 250, 500, 1000, 2000 and 5000 evaluations, plots the best value against the budget on a log scale and lists the values. The curve shows how much each further increase of the budget buys on the problem at hand.

[Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) use data profiles, which plot the fraction of test problems a solver solves against the computational budget, to compare optimisers across budgets; the panel's curve is the analogue for one problem and one method.

## The solution in the box

**Solution Summary** lists the best point and value, the return code, the evaluations used, the budget, the bounds and the relative position of the point in the box, from 0 at a lower bound to 1 at an upper one.

**Solution** adds the gradient norm at the best point. A small norm and a position strictly inside the box are consistent with an interior local minimum; whether it is the global one rests on the search that found it.

## References

<a id="ref-AGK2019a"></a>Arnoud, A., Guvenen, F., & Kleineberg, T. (2019). *Benchmarking Global Optimizers*. NBER Working Paper 26340. National Bureau of Economic Research. [doi:10.3386/w26340](https://doi.org/10.3386/w26340)

<a id="ref-Joh2007c"></a>Johnson, S. G. (2007). The NLopt Nonlinear-Optimization Package. *NLopt Documentation*. [nlopt.readthedocs.io](https://nlopt.readthedocs.io/en/latest/)

<a id="ref-KT1987a"></a>Rinnooy Kan, A. H. G., & Timmer, G. T. (1987). Stochastic Global Optimization Methods Part I: Clustering Methods. *Mathematical Programming* 39(1), 57-78. [doi:10.1007/BF02592071](https://doi.org/10.1007/BF02592071)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [MLSL](mlsl.md) · [StoGO-R](stogo-r.md) · [TikTak](tiktak.md)
