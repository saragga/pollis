# Swarm Intelligence: Overview

Swarm intelligence algorithms minimise a function with a population of candidate solutions that move through the search space and share information about where good values were found. The panel runs five of them on a box-constrained problem: particle swarm optimisation, the competitive swarm optimiser, the artificial bee colony, the whale optimisation algorithm and a chaotic gravitational search algorithm.

## The problem

Each tab minimises **Objective f(x)**, a Julia expression in the vector x, over the box between **Lower Bounds** and **Upper Bounds**, with **Dimension (n)** variables. The default is the Rastrigin function

f(x) = 10n + Σᵢ (xᵢ² − 10 cos 2πxᵢ)

on [−5.12, 5.12]ⁿ, which the tooltip describes as having its global minimum 0 at the origin. The swarm has **Swarm Size** members and runs for **Iterations** iterations.

[Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) describe a metaheuristic as a stochastic algorithm that approximates optimal solutions quickly where not all of the mathematical properties of the problem are known, and define the problem as the minimisation of f(x) over a box, with optional constraints.

## Five algorithms

| Tab | Algorithm | Implementation | Original paper |
|---|---|---|---|
| **PSO** | Particle swarm optimisation | `PSO` of Metaheuristics.jl | [Kennedy and Eberhart (1995)](#ref-KE1995a) |
| **CSO** | Competitive swarm optimiser | `CSO` of Metaheuristics.jl | [Cheng and Jin (2015)](#ref-CJ2015a) |
| **ABC** | Artificial bee colony | `ABC` of Metaheuristics.jl | [Karaboga and Basturk (2007)](#ref-KB2007a) |
| **WOA** | Whale optimisation algorithm | `WOA` of Metaheuristics.jl | [Mirjalili and Lewis (2016)](#ref-ML2016a) |
| **GSA** | Chaotic gravitational search | `CGSA` of Metaheuristics.jl | [Mirjalili and Gandomi (2017)](#ref-MG2017a) |

The bullets of the panel summarise each one: social and cognitive velocity updates for PSO; pairwise competitions for CSO; employed, onlooker and scout bee phases for ABC; bubble-net attacking and spiral updating for WOA; and simulated gravity proportional to fitness mass for GSA.

## Particle swarms

[Kennedy and Eberhart (1995)](#ref-KE1995a) introduce a concept for the optimisation of nonlinear functions using particle swarm methodology, outline the evolution of several paradigms, and describe benchmark testing and applications, including nonlinear function optimisation and neural network training. They also describe the relationships between particle swarm optimisation and both artificial life and genetic algorithms.

[Cheng and Jin (2015)](#ref-CJ2015a) propose the competitive swarm optimiser for large scale optimisation, inspired by particle swarm optimisation but conceptually very different: neither the personal best of each particle nor the global best is used to update the particles; a pairwise competition lets the loser learn from the winner.

## Bees, whales and gravity

[Karaboga and Basturk (2007)](#ref-KB2007a) base the artificial bee colony algorithm on the intelligent behaviour of a honey bee swarm, with employed bees, onlookers and scouts, and use it to optimise multivariable functions. [Mirjalili and Lewis (2016)](#ref-ML2016a) propose the whale optimisation algorithm, which mimics the social behaviour of humpback whales and is inspired by their bubble-net hunting strategy.

The Metaheuristics.jl documentation describes CGSA, the algorithm of the **GSA** tab, as an extension of the gravitational search algorithm with chaotic gravitational constants, citing [Mirjalili and Gandomi (2017)](#ref-MG2017a).

## The panel in Julia

```
alg = PSO(N = N, options = Options(iterations = iters, f_calls_limit = 1e12, seed = seed))
r = Metaheuristics.optimize(fr, [transpose(lb); transpose(ub)], alg)
```

Metaheuristics.jl takes the bounds as a 2 × n matrix, lower bounds in the first row and upper bounds in the second. [Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) present the package as the first in Julia with ready-to-use metaheuristic algorithms and utility functions under a uniform API. The panel wraps f in a recorder that stores every evaluation, so that the convergence curves count evaluations rather than iterations.

## References

<a id="ref-CJ2015a"></a>Cheng, R., & Jin, Y. (2015). A Competitive Swarm Optimizer for Large Scale Optimization. *IEEE Transactions on Cybernetics* 45(2), 191-204. [doi:10.1109/TCYB.2014.2322602](https://doi.org/10.1109/TCYB.2014.2322602)

<a id="ref-KB2007a"></a>Karaboga, D., & Basturk, B. (2007). A Powerful and Efficient Algorithm for Numerical Function Optimization: Artificial Bee Colony (ABC) Algorithm. *Journal of Global Optimization* 39(3), 459-471. [doi:10.1007/s10898-007-9149-x](https://doi.org/10.1007/s10898-007-9149-x)

<a id="ref-KE1995a"></a>Kennedy, J., & Eberhart, R. C. (1995). Particle Swarm Optimization. *ICNN'95 — International Conference on Neural Networks* 4, 1942-1948. [doi:10.1109/ICNN.1995.488968](https://doi.org/10.1109/ICNN.1995.488968)

<a id="ref-MM2022a"></a>Mejía-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

<a id="ref-MG2017a"></a>Mirjalili, S., & Gandomi, A. H. (2017). Chaotic Gravitational Constants for the Gravitational Search Algorithm. *Applied Soft Computing* 53, 407-419. [doi:10.1016/j.asoc.2017.01.008](https://doi.org/10.1016/j.asoc.2017.01.008)

<a id="ref-ML2016a"></a>Mirjalili, S., & Lewis, A. (2016). The Whale Optimization Algorithm. *Advances in Engineering Software* 95, 51-67. [doi:10.1016/j.advengsoft.2016.01.008](https://doi.org/10.1016/j.advengsoft.2016.01.008)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PSO](pso.md) · [CSO](cso.md) · [ABC](abc.md) · [WOA](woa.md) · [GSA](gsa.md)
