# Swarm Intelligence: Decision Guide

The panel's decision table gives a context for each algorithm from its original paper or the Metaheuristics.jl documentation; the comparison actions test the choice on the user's own objective at equal numbers of evaluations.

## The decision table

| Tab | Context | Purpose in the panel |
|---|---|---|
| **PSO** | Nonlinear functions over a box, with the particle swarm concept of Kennedy and Eberhart (1995) | Particles move with inertia towards their own best and the swarm's best positions |
| **CSO** | Large scale optimisation, tested on problems of dimensionality up to 5 000; recommended for large-scale problems in the Metaheuristics.jl documentation | Random pairs compete, and the loser learns from the winner, with no personal or global bests kept |
| **ABC** | Multivariable, multimodal functions, where ABC can get out of a local minimum | Employed and onlooker bees perturb food sources; sources that stop improving are abandoned to scouts |
| **WOA** | Few parameters to adjust: A and C in the paper, N in the `WOA` type | Encircling the best solution and spiral bubble-net moves, with a decreasing coefficient |
| **GSA** | Gravitational search with chaotic gravitational constants | CGSA of Metaheuristics.jl |

## Particle swarms

[Kennedy and Eberhart (1995)](#ref-KE1995a) introduce particle swarm optimisation as a concept for the optimisation of nonlinear functions, and [Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) list it among the single-objective algorithms of Metaheuristics.jl, with the learning rates C1 and C2 and the inertia weight ω as its parameters.

The other tabs can be read against it: **Algorithm Shootout** runs PSO beside CSO, ABC, WOA and CGSA with the evaluations of the current run, three seeds each.

## Large dimensions

[Cheng and Jin (2015)](#ref-CJ2015a) propose CSO for large scale optimisation and report that it effectively solves problems of dimensionality up to 5 000. The Metaheuristics.jl documentation recommends CSO for large-scale problems, and its algorithm table marks CSO as the single-objective algorithm for large scale problems.

**Dimension Scaling** runs the selected tab for n = 2 to 40 and prints the best value, the evaluations and the run time, so the tabs can be compared as the dimension grows.

## Multimodal objectives

[Karaboga and Basturk (2007)](#ref-KB2007a) tested ABC on five high-dimensional benchmark functions with multimodality and conclude that it can get out of a local minimum and can be used for multivariable, multimodal function optimisation. In their algorithm, the scouts control exploration, and the employed and onlooker bees exploitation.

The Rastrigin function, with its global minimum 0 at the origin, is the panel's default objective and one of the four **Benchmark Functions**, beside the sphere, Rosenbrock and Ackley functions.

## Few parameters to adjust

[Mirjalili and Lewis (2016)](#ref-ML2016a) note that WOA includes only two main internal parameters to be adjusted, A and C, and the Metaheuristics.jl documentation gives `WOA` the population size N as its only parameter. ABC has the numbers of employed and onlooker bees and `limit`, and CGSA the settings of its chaos function and distance norm.

The **Hyperparameter Guide** action lists the main settings of the selected tab, with their values and their meaning in the documentation or the original paper.

## Swarm or gradient

**vs Gradient-Based** compares the swarm with L-BFGS from the box midpoint and from ten random starts, and **Local Refinement** with L-BFGS from the swarm's best point. The two actions print the swarm's value beside the local values, on the same objective and box, and **Local Refinement** also the distance the local search moved the swarm's point.

**Run Consistency** and **Multi-Start** show how far the result of a tab depends on the seed, and **Population Sensitivity** how far it depends on the swarm size at about the same number of evaluations.

## References

<a id="ref-CJ2015a"></a>Cheng, R., & Jin, Y. (2015). A Competitive Swarm Optimizer for Large Scale Optimization. *IEEE Transactions on Cybernetics* 45(2), 191-204. [doi:10.1109/TCYB.2014.2322602](https://doi.org/10.1109/TCYB.2014.2322602)

<a id="ref-KB2007a"></a>Karaboga, D., & Basturk, B. (2007). A Powerful and Efficient Algorithm for Numerical Function Optimization: Artificial Bee Colony (ABC) Algorithm. *Journal of Global Optimization* 39(3), 459-471. [doi:10.1007/s10898-007-9149-x](https://doi.org/10.1007/s10898-007-9149-x)

<a id="ref-KE1995a"></a>Kennedy, J., & Eberhart, R. C. (1995). Particle Swarm Optimization. *ICNN'95 — International Conference on Neural Networks* 4, 1942-1948. [doi:10.1109/ICNN.1995.488968](https://doi.org/10.1109/ICNN.1995.488968)

<a id="ref-MM2022a"></a>Mejía-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

<a id="ref-ML2016a"></a>Mirjalili, S., & Lewis, A. (2016). The Whale Optimization Algorithm. *Advances in Engineering Software* 95, 51-67. [doi:10.1016/j.advengsoft.2016.01.008](https://doi.org/10.1016/j.advengsoft.2016.01.008)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [PSO](pso.md) · [CSO](cso.md) · [ABC](abc.md) · [WOA](woa.md) · [GSA](gsa.md)
