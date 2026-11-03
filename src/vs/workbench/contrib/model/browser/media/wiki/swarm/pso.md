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

The **Hyperparameter Guide** of the tab lists the three settings: N, where more particles explore more but cost more evaluations per iteration; C1 and C2, the pull towards the personal and the global best; and the inertia, where a higher value keeps momentum and exploration and a lower one converges faster, in the panel's words.

## The tab in Julia

```
alg = PSO(N = N, options = Options(iterations = iters, f_calls_limit = 1e12, seed = seed))
r = Metaheuristics.optimize(fr, [transpose(lb); transpose(ub)], alg)
(x = minimizer(r), fx = minimum(r), pop = positions(r))
```

`fr` is f wrapped in the panel's recorder. The comment of the code explains `f_calls_limit = 1e12` as an explicit cap, since otherwise PSO and ABC stop at 10 000 n evaluations. The tooltip of **Iterations** counts about one evaluation per particle and iteration for PSO, so the default run of 40 particles and 500 iterations evaluates f about 20 000 times.

## Features in the package

[Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) list PSO among the single-objective algorithms of Metaheuristics.jl, citing [Kennedy and Eberhart (1995)](#ref-KE1995a), and mark it as supporting constraint handling and batch evaluation. They also note that Optim.jl implements particle swarm optimisation among its global optimisers.

In the panel, PSO is the standard swarm baseline of the decision table, for continuous box-constrained problems, with particles that move with inertia towards their own best and the swarm's best positions.

## Reading a PSO run

**Convergence Curve** shows the best value against the evaluations, and **Population Snapshot** the final particles over the contours of f in x1 and x2, with the best point as a star. **Swarm Diversity** reports how spread the final particles are, relative to the box.

**Population Sensitivity** varies N at about the same number of evaluations, and **Run Consistency** the seed. **Algorithm Shootout** runs PSO beside ABC, WOA and CGSA with the evaluations of the current run.

## Textbooks

[Kennedy, Eberhart and Shi (2001)](#ref-KES2001a) wrote *Swarm Intelligence*, a book by two of the authors of particle swarm optimisation with Shi, and [Engelbrecht (2005)](#ref-Eng2005a) *Fundamentals of Computational Swarm Intelligence*. The panel lists both under Textbooks.

The **CSO** tab also updates velocities, but, as [Cheng and Jin (2015)](#ref-CJ2015a) describe, it uses neither personal nor global bests: a pairwise competition decides which particle learns from which.

## References

<a id="ref-CJ2015a"></a>Cheng, R., & Jin, Y. (2015). A Competitive Swarm Optimizer for Large Scale Optimization. *IEEE Transactions on Cybernetics* 45(2), 191-204. [doi:10.1109/TCYB.2014.2322602](https://doi.org/10.1109/TCYB.2014.2322602)

<a id="ref-Eng2005a"></a>Engelbrecht, A. P. (2005). *Fundamentals of Computational Swarm Intelligence*. Wiley.

<a id="ref-KE1995a"></a>Kennedy, J., & Eberhart, R. C. (1995). Particle Swarm Optimization. *ICNN'95 — International Conference on Neural Networks* 4, 1942-1948. [doi:10.1109/ICNN.1995.488968](https://doi.org/10.1109/ICNN.1995.488968)

<a id="ref-KES2001a"></a>Kennedy, J., Eberhart, R. C., & Shi, Y. (2001). *Swarm Intelligence*. Morgan Kaufmann.

<a id="ref-MM2022a"></a>Mejía-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [CSO](cso.md) · [ABC](abc.md) · [WOA](woa.md) · [GSA](gsa.md)
