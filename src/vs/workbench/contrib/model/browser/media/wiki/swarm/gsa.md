# Swarm Intelligence: GSA

The **GSA** tab runs the chaotic gravitational search algorithm, `CGSA` of Metaheuristics.jl. Agents attract each other with forces proportional to masses derived from their fitness, and a chaotic schedule of the gravitational constant moves the search from exploration to exploitation.

## Origin

[Rashedi, Nezamabadi-pour and Saryazdi (2009)](#ref-RNS2009a) introduce the gravitational search algorithm, GSA, in *Information Sciences*. [Mirjalili and Gandomi (2017)](#ref-MG2017a) extend it with chaotic gravitational constants, the variant that Metaheuristics.jl implements as `CGSA` and that the decision table of the panel names for the tab.

The bullet of the panel summarises GSA as agents that attract each other via simulated gravity proportional to fitness mass, and the decision table describes the purpose of the tab as agents that attract each other with forces proportional to their fitness-derived masses.

## Parameters in Metaheuristics.jl

The documentation gives the signature

```
CGSA(; N = 30, chValueInitial = 20, chaosIndex = 9, ElitistCheck = 1,
    Rpower = 1, Rnorm = 2, wMax = chValueInitial, wMin = 1e-10,
    information = Information(), options = Options())
```

with N the population size, `chValueInitial` the initial value of the chaos value, `chaosIndex` an integer from 1 to 10 that selects the function modelling the chaos, `Rpower` the power of the distance, norm(x)^Rpower, and `Rnorm` the order of the norm. The documentation describes CGSA as an extension of GSA with chaotic gravitational constants, citing [Mirjalili and Gandomi (2017)](#ref-MG2017a).

## The schedule

The decision table gives the context of the tab as problems where a smooth exploration-to-exploitation schedule helps. The **Hyperparameter Guide** lists N, the number of agents, and the chaos map, at the Metaheuristics.jl default, as the chaotic schedule of the gravitational constant, from exploration to exploitation.

The panel sets N to **Swarm Size** and keeps all other settings at their defaults, so the chaos map is the one with `chaosIndex = 9`.

## Evaluations

The tooltip of **Iterations** counts about one evaluation per agent and iteration for GSA, as for PSO and WOA. The documentation's example of `CGSA` on a three-variable sphere function reports 500 iterations and 15 000 function calls with N = 30.

With the panel's defaults, 40 agents and 500 iterations, the run evaluates f about 20 000 times. **Algorithm Shootout** runs CGSA beside PSO, ABC and WOA with the evaluations of the current run.

## Features in the package

[Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) list GSA among the single-objective algorithms of Metaheuristics.jl, attributed to [Mirjalili and Gandomi (2017)](#ref-MG2017a), and in their table of implemented optimisers it supports batch evaluation but not constraint handling. The algorithm table of the documentation marks CGSA as supporting neither constraints nor large scale problems.

The panel's problems have only the bounds of the box, passed as the matrix `[transpose(lb); transpose(ub)]`.

## Reading a GSA run

**Convergence Curve** shows the best value against the evaluations, and **Population Snapshot** and **Swarm Diversity** the final agents, `positions(r)`, and their spread. **Local Refinement** starts L-BFGS from the best agent, and **Benchmark Functions** runs CGSA on the sphere, Rosenbrock, Rastrigin and Ackley functions.

For swarm intelligence in general, the panel lists the books of [Kennedy, Eberhart and Shi (2001)](#ref-KES2001a) and [Engelbrecht (2005)](#ref-Eng2005a).

## References

<a id="ref-Eng2005a"></a>Engelbrecht, A. P. (2005). *Fundamentals of Computational Swarm Intelligence*. Wiley.

<a id="ref-KES2001a"></a>Kennedy, J., Eberhart, R. C., & Shi, Y. (2001). *Swarm Intelligence*. Morgan Kaufmann.

<a id="ref-MM2022a"></a>Mejía-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

<a id="ref-MG2017a"></a>Mirjalili, S., & Gandomi, A. H. (2017). Chaotic Gravitational Constants for the Gravitational Search Algorithm. *Applied Soft Computing* 53, 407-419. [doi:10.1016/j.asoc.2017.01.008](https://doi.org/10.1016/j.asoc.2017.01.008)

<a id="ref-RNS2009a"></a>Rashedi, E., Nezamabadi-pour, H., & Saryazdi, S. (2009). GSA: A Gravitational Search Algorithm. *Information Sciences* 179(13), 2232-2248. [doi:10.1016/j.ins.2009.03.004](https://doi.org/10.1016/j.ins.2009.03.004)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PSO](pso.md) · [CSO](cso.md) · [ABC](abc.md) · [WOA](woa.md)
