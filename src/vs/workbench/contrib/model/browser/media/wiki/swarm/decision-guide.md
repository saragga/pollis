# Swarm Intelligence: Decision Guide

The panel's decision table gives a context for each algorithm; the comparison actions test the choice on the user's own objective at equal numbers of evaluations.

## The decision table

| Tab | Context | Purpose in the panel |
|---|---|---|
| **PSO** | Continuous box-constrained problems; the standard swarm baseline | Particles move with inertia towards their own best and the swarm's best positions |
| **CSO** | Higher-dimensional problems where PSO converges prematurely | Random pairs compete, and the loser learns from the winner and the swarm mean, with no personal or global bests kept |
| **ABC** | Multimodal problems where exploration matters more than speed | Employed and onlooker bees perturb food sources; sources that stop improving are abandoned to scouts |
| **WOA** | Quick exploratory runs with almost no parameters to tune | Encircling the best solution and spiral bubble-net moves, with a shrinking exploration coefficient |
| **GSA** | Problems where a smooth exploration-to-exploitation schedule helps | Agents attract each other with forces proportional to their fitness-derived masses; here the chaotic variant CGSA of Metaheuristics.jl |

## PSO as the baseline

The decision table names PSO the standard swarm baseline. [Kennedy and Eberhart (1995)](#ref-KE1995a) introduce particle swarm optimisation as a concept for the optimisation of nonlinear functions, and [Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) list it among the single-objective algorithms of Metaheuristics.jl, with the learning rates C1 and C2 and the inertia weight ω as its parameters.

The other tabs can be read against it: **Algorithm Shootout** runs PSO beside ABC, WOA and CGSA with the evaluations of the current run.

## Large dimensions

[Cheng and Jin (2015)](#ref-CJ2015a) propose CSO for large scale optimisation and report it solving problems of dimensionality up to 5 000; the decision table gives higher-dimensional problems where PSO converges prematurely as its context. In the Metaheuristics.jl documentation, CSO is the one single-objective algorithm marked for large scale problems without changing its defaults.

**Dimension Scaling** runs the selected tab for n = 2 to 40, and the CSO tab adds **Mean Attraction (phi)**, which the tooltip suggests at around 0.1 in moderate dimensions.

## Few parameters to tune

The decision table describes WOA as suited to quick exploratory runs with almost no parameters to tune; the Metaheuristics.jl documentation gives `WOA` the population size N as its only parameter. ABC has the numbers of employed and onlooker bees and the limit, and CGSA the settings of its chaos map and distance norm.

The **Hyperparameter Guide** action lists, for each tab, the settings the panel considers main and their effect.

## Multimodal objectives

The Rastrigin function, with its global minimum 0 at the origin, is the panel's default objective and one of the four **Benchmark Functions**, beside the sphere, Rosenbrock and Ackley functions. The decision table names ABC for multimodal problems where exploration matters more than speed, and GSA for problems that benefit from a smooth schedule from exploration to exploitation.

**Run Consistency** and **Multi-Start** show how far the result of a tab depends on the seed.

## Swarm or gradient

**vs Gradient-Based** compares the swarm with L-BFGS from the box midpoint and from ten random starts, and **Local Refinement** with L-BFGS from the swarm's best point. The two actions print the swarm's value beside the local values, on the same objective and box, and **Local Refinement** also the distance the local search moved the swarm's point.

[Kennedy, Eberhart and Shi (2001)](#ref-KES2001a) and [Engelbrecht (2005)](#ref-Eng2005a) are the panel's textbooks on swarm intelligence, and the papers of [Karaboga and Basturk (2007)](#ref-KB2007a), [Mirjalili and Lewis (2016)](#ref-ML2016a), [Rashedi, Nezamabadi-pour and Saryazdi (2009)](#ref-RNS2009a) and [Mirjalili and Gandomi (2017)](#ref-MG2017a) give the original descriptions of ABC, WOA, GSA and its chaotic variant.

## References

<a id="ref-CJ2015a"></a>Cheng, R., & Jin, Y. (2015). A Competitive Swarm Optimizer for Large Scale Optimization. *IEEE Transactions on Cybernetics* 45(2), 191-204. [doi:10.1109/TCYB.2014.2322602](https://doi.org/10.1109/TCYB.2014.2322602)

<a id="ref-Eng2005a"></a>Engelbrecht, A. P. (2005). *Fundamentals of Computational Swarm Intelligence*. Wiley.

<a id="ref-KB2007a"></a>Karaboga, D., & Basturk, B. (2007). A Powerful and Efficient Algorithm for Numerical Function Optimization: Artificial Bee Colony (ABC) Algorithm. *Journal of Global Optimization* 39(3), 459-471. [doi:10.1007/s10898-007-9149-x](https://doi.org/10.1007/s10898-007-9149-x)

<a id="ref-KE1995a"></a>Kennedy, J., & Eberhart, R. C. (1995). Particle Swarm Optimization. *ICNN'95 — International Conference on Neural Networks* 4, 1942-1948. [doi:10.1109/ICNN.1995.488968](https://doi.org/10.1109/ICNN.1995.488968)

<a id="ref-KES2001a"></a>Kennedy, J., Eberhart, R. C., & Shi, Y. (2001). *Swarm Intelligence*. Morgan Kaufmann.

<a id="ref-MM2022a"></a>Mejía-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

<a id="ref-ML2016a"></a>Mirjalili, S., & Lewis, A. (2016). The Whale Optimization Algorithm. *Advances in Engineering Software* 95, 51-67. [doi:10.1016/j.advengsoft.2016.01.008](https://doi.org/10.1016/j.advengsoft.2016.01.008)

<a id="ref-MG2017a"></a>Mirjalili, S., & Gandomi, A. H. (2017). Chaotic Gravitational Constants for the Gravitational Search Algorithm. *Applied Soft Computing* 53, 407-419. [doi:10.1016/j.asoc.2017.01.008](https://doi.org/10.1016/j.asoc.2017.01.008)

<a id="ref-RNS2009a"></a>Rashedi, E., Nezamabadi-pour, H., & Saryazdi, S. (2009). GSA: A Gravitational Search Algorithm. *Information Sciences* 179(13), 2232-2248. [doi:10.1016/j.ins.2009.03.004](https://doi.org/10.1016/j.ins.2009.03.004)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [PSO](pso.md) · [CSO](cso.md) · [ABC](abc.md) · [WOA](woa.md) · [GSA](gsa.md)
