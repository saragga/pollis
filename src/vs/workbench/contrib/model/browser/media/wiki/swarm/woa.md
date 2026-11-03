# Swarm Intelligence: WOA

The **WOA** tab runs the whale optimisation algorithm with `WOA` of Metaheuristics.jl. Whales encircle the best solution found so far or move along a spiral towards it, and a coefficient that decreases over the run moves the search from exploration to exploitation.

## Origin

[Mirjalili and Lewis (2016)](#ref-ML2016a) propose WOA as a nature-inspired metaheuristic that mimics the social behaviour of humpback whales and is inspired by their bubble-net hunting strategy. They test it on 29 mathematical optimisation problems and 6 structural design problems, and report it as very competitive with state-of-the-art metaheuristics and conventional methods.

[Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) list WOA among the single-objective algorithms of Metaheuristics.jl, citing [Mirjalili and Lewis (2016)](#ref-ML2016a), and mark it, in their table of implemented optimisers, as supporting constraint handling and batch evaluation.

## Parameters in Metaheuristics.jl

The documentation gives the signature

```
WOA(; N = 30, information = Information(), options = Options())
```

with N the population size, the number of whales. The panel sets N to **Swarm Size**, 40 by default, and passes `iterations`, `f_calls_limit = 1e12` and `seed` through `Options`. The documentation describes WOA as a nature-inspired metaheuristic algorithm that mimics the social behaviour of humpback whales.

## The coefficient a

[Mirjalili and Lewis (2016)](#ref-ML2016a) compute the coefficient vectors A = 2a · r − a and C = 2 · r, with r a random vector in [0, 1] and a linearly decreased from 2 to 0 over the course of the iterations. As A decreases, some iterations are devoted to exploration, |A| ≥ 1, and the rest to exploitation, |A| < 1.

They note that WOA includes only two main internal parameters to be adjusted, A and C. The **Hyperparameter Guide** of the tab lists N and a; a is not an input of the panel.

## When the tab applies

The decision table gives the context of the tab as few parameters to adjust: the two main internal parameters of [Mirjalili and Lewis (2016)](#ref-ML2016a), and N as the only parameter of the `WOA` type. Its purpose is encircling the best solution and spiral bubble-net moves, with a decreasing coefficient.

They also observe that the search agents change abruptly in the early stages of the optimisation and then gradually converge, which **Convergence Curve** shows for the current objective.

## Evaluations

The documentation's example of `WOA` on a three-variable sphere function reports 500 iterations and 15 000 function calls with the default N = 30, and 50 000 calls with N = 100.

**Algorithm Shootout** runs WOA beside PSO, CSO, ABC and CGSA with the evaluations of the current run, three seeds each, and **Benchmark Functions** on the sphere, Rosenbrock, Rastrigin and Ackley functions.

## Reading a WOA run

**Population Snapshot** draws the final whales, `positions(r)`, over the contours of f in x1 and x2, and **Swarm Diversity** reports their spread relative to the box and their mean distance to the best point. **Run Consistency** repeats the run with seeds 1 to 10.

**Local Refinement** polishes the best point of the run with box-constrained L-BFGS from Optim.jl and prints the improvement and the distance moved. **vs Gradient-Based** sets the WOA result beside L-BFGS from the box midpoint and from ten random starts.

## References

<a id="ref-MM2022a"></a>Mejía-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

<a id="ref-ML2016a"></a>Mirjalili, S., & Lewis, A. (2016). The Whale Optimization Algorithm. *Advances in Engineering Software* 95, 51-67. [doi:10.1016/j.advengsoft.2016.01.008](https://doi.org/10.1016/j.advengsoft.2016.01.008)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PSO](pso.md) · [CSO](cso.md) · [ABC](abc.md) · [GSA](gsa.md)
