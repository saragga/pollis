# Swarm Intelligence: PSO

The **PSO** tab runs particle swarm optimisation with `PSO` of Metaheuristics.jl: particles move through the box with velocities pulled towards their own best positions and the best position of the swarm.

## Origin

[Kennedy and Eberhart (1995)](#ref-KE1995a) introduce a concept for the optimisation of nonlinear functions using particle swarm methodology. They outline the evolution of several paradigms, discuss an implementation of one of them, describe benchmark testing, and propose applications that include nonlinear function optimisation and neural network training. They also relate particle swarm optimisation to artificial life and to genetic algorithms.

The bullet of the panel summarises the method as social and cognitive velocity updates that drive particles towards the global best.

## Parameters in Metaheuristics.jl

The Metaheuristics.jl documentation gives the signature

```
PSO(; N = 0, C1 = 2.0, C2 = 2.0, ω = 0.8, information = Information(), options = Options())
```

with C1 and C2 the learning rates, N the population size and ω the parameter that controls the inertia weight. The panel sets N to **Swarm Size** and keeps the other defaults.

The **Hyperparameter Guide** of the tab lists the three settings with the meaning the documentation gives them: N, the population size; C1 and C2, the learning rates; and ω, which controls the inertia weight, at its default of 0.8.

## The tab in Julia

```
alg = PSO(N = N, options = Options(iterations = iters, f_calls_limit = 1e12, seed = seed))
r = Metaheuristics.optimize(fr, [transpose(lb); transpose(ub)], alg)
(x = minimizer(r), fx = minimum(r), pop = positions(r))
```

`fr` is f wrapped in the panel's recorder. `f_calls_limit = 1e12` leaves **Iterations** as the end of the run. The documentation's example of `PSO()` on a three-variable sphere function reports 1 000 iterations and 30 000 function calls.

## Features in the package

[Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) list PSO among the single-objective algorithms of Metaheuristics.jl, citing [Kennedy and Eberhart (1995)](#ref-KE1995a), and mark it as supporting constraint handling and batch evaluation. They also note that Optim.jl implements particle swarm optimisation among its global optimisers.

In the panel, PSO is the standard swarm baseline of the decision table, for continuous box-constrained problems, with particles that move with inertia towards their own best and the swarm's best positions.

## Reading a PSO run

**Convergence Curve** shows the best value against the evaluations, and **Population Snapshot** the final particles over the contours of f in x1 and x2, with the best point as a star. **Swarm Diversity** reports how spread the final particles are, relative to the box.

**Population Sensitivity** varies N at about the same number of evaluations, and **Run Consistency** the seed. **Algorithm Shootout** runs PSO beside CSO, ABC, WOA and CGSA with the evaluations of the current run.

## Particle swarms without bests

[Cheng and Jin (2015)](#ref-CJ2015a) describe CSO as fundamentally inspired by particle swarm optimisation but conceptually very different: neither the personal best position of each particle nor the global best position is involved in updating the particles. Instead, in a pairwise competition, the particle that loses updates its position by learning from the winner. The **CSO** tab runs it with `CSO` of Metaheuristics.jl, on the same box, with the same swarm size and iterations as the PSO tab.

## References

<a id="ref-CJ2015a"></a>Cheng, R., & Jin, Y. (2015). A Competitive Swarm Optimizer for Large Scale Optimization. *IEEE Transactions on Cybernetics* 45(2), 191-204. [doi:10.1109/TCYB.2014.2322602](https://doi.org/10.1109/TCYB.2014.2322602)

<a id="ref-KE1995a"></a>Kennedy, J., & Eberhart, R. C. (1995). Particle Swarm Optimization. *ICNN'95 — International Conference on Neural Networks* 4, 1942-1948. [doi:10.1109/ICNN.1995.488968](https://doi.org/10.1109/ICNN.1995.488968)

<a id="ref-MM2022a"></a>Mejía-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [CSO](cso.md) · [ABC](abc.md) · [WOA](woa.md) · [GSA](gsa.md)
