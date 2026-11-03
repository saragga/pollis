# Swarm Intelligence: WOA

The **WOA** tab runs the whale optimisation algorithm with `WOA` of Metaheuristics.jl. Whales encircle the best solution found so far or move along a spiral towards it, and a coefficient that shrinks over the run shifts the search from exploration to encircling.

## Origin

[Mirjalili and Lewis (2016)](#ref-ML2016a) present the whale optimisation algorithm in *Advances in Engineering Software*. The bullet of the panel summarises it as bubble-net attacking and spiral updating that mimic humpback whale foraging, and the notebook on WOA uses the same description.

[Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) list WOA among the single-objective algorithms of Metaheuristics.jl and mark it, in their table of implemented optimisers, as supporting constraint handling and batch evaluation.

## Parameters in Metaheuristics.jl

The documentation gives the signature

```
WOA(; N = 30, information = Information(), options = Options())
```

with N the population size, the number of whales. The panel sets N to **Swarm Size**, 40 by default, and passes `iterations`, `f_calls_limit = 1e12` and `seed` through `Options`.

The **Hyperparameter Guide** of the tab lists N, the number of whales, and the coefficient a, which decreases from 2 to 0 and, in the panel's words, controls the switch from exploration to encircling the best.

## Encircling and spirals

The decision table describes the purpose of the tab as encircling the best solution and spiral bubble-net moves, with a shrinking exploration coefficient. The coefficient is a of the **Hyperparameter Guide**: it is not an input of the panel, and it follows a fixed schedule over the iterations.

The decision table also names the context: quick exploratory runs with almost no parameters to tune. In the documentation, the population size is the only parameter of `WOA`.

## Evaluations

The tooltip of **Iterations** counts about one evaluation per whale and iteration for WOA, as for PSO and GSA. With the defaults, 40 whales and 500 iterations, the run evaluates f about 20 000 times.

The documentation's example of `WOA` on a three-variable sphere function reports 500 iterations and 15 000 function calls with the default N = 30, which matches one call per whale and iteration.

## Reading a WOA run

**Convergence Curve** shows the best value against the evaluations. **Population Snapshot** draws the final whales, `positions(r)`, over the contours of f in x1 and x2, and **Swarm Diversity** reports their spread relative to the box and their mean distance to the best point.

**Run Consistency** repeats the run with seeds 1 to 10. **Algorithm Shootout** runs WOA beside PSO, ABC and CGSA with the evaluations of the current run, and **Benchmark Functions** on the sphere, Rosenbrock, Rastrigin and Ackley functions.

## Refinement and comparison

**Local Refinement** polishes the best point of the run with box-constrained L-BFGS from Optim.jl and prints the improvement and the distance moved. **vs Gradient-Based** sets the WOA result beside L-BFGS from the box midpoint and from ten random starts.

[Kennedy, Eberhart and Shi (2001)](#ref-KES2001a) and [Engelbrecht (2005)](#ref-Eng2005a) are the panel's textbooks on swarm intelligence; the original description of the algorithm is the paper of [Mirjalili and Lewis (2016)](#ref-ML2016a).

## References

<a id="ref-Eng2005a"></a>Engelbrecht, A. P. (2005). *Fundamentals of Computational Swarm Intelligence*. Wiley.

<a id="ref-KES2001a"></a>Kennedy, J., Eberhart, R. C., & Shi, Y. (2001). *Swarm Intelligence*. Morgan Kaufmann.

<a id="ref-MM2022a"></a>Mejía-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

<a id="ref-ML2016a"></a>Mirjalili, S., & Lewis, A. (2016). The Whale Optimization Algorithm. *Advances in Engineering Software* 95, 51-67. [doi:10.1016/j.advengsoft.2016.01.008](https://doi.org/10.1016/j.advengsoft.2016.01.008)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PSO](pso.md) · [CSO](cso.md) · [ABC](abc.md) · [GSA](gsa.md)
