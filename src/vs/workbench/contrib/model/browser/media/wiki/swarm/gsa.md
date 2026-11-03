# Swarm Intelligence: GSA

The **GSA** tab runs the gravitational search algorithm with chaotic gravitational constants, `CGSA` of Metaheuristics.jl.

## Origin

The Metaheuristics.jl documentation describes CGSA as an extension of the gravitational search algorithm with chaotic gravitational constants, citing [Mirjalili and Gandomi (2017)](#ref-MG2017a), and the decision table of the panel names that variant for the tab.

[Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) list GSA among the single-objective algorithms of Metaheuristics.jl, citing [Mirjalili and Gandomi (2017)](#ref-MG2017a), and in their table of implemented optimisers it supports batch evaluation but not constraint handling. The algorithm table of the documentation marks CGSA as supporting neither constraints nor large scale problems.

## Parameters in Metaheuristics.jl

The documentation gives the signature

```
CGSA(; N = 30, chValueInitial = 20, chaosIndex = 9, ElitistCheck = 1,
    Rpower = 1, Rnorm = 2, wMax = chValueInitial, wMin = 1e-10,
    information = Information(), options = Options())
```

with N the population size, `chValueInitial` the initial value of the chaos value, `chaosIndex` an integer from 1 to 10 that selects the function modelling the chaos, `Rpower` the power of the distance, norm(x)^Rpower, and `Rnorm` the order of the norm.

## The tab's settings

The panel sets N to **Swarm Size** and keeps all other settings at their defaults, so the chaos function is the one with `chaosIndex = 9`. The **Hyperparameter Guide** lists N and `chaosIndex` with the meaning the documentation gives them.

Every call passes `iterations`, `f_calls_limit = 1e12` and `seed` through `Options`. The documentation describes `f_calls_limit` as the maximum number of function evaluations and `iterations` as the maximum number of iterations, so the run ends at **Iterations**.

## Evaluations

The documentation's example of `CGSA` on a three-variable sphere function reports 500 iterations and 15 000 function calls with N = 30.

**Algorithm Shootout** runs CGSA beside PSO, CSO, ABC and WOA with the evaluations of the current run, three seeds each, so that the five algorithms are compared at equal cost. The panel's recorder counts the evaluations of the run, which **Best Solution** and **Solution Summary** print.

## Reading a GSA run

**Convergence Curve** shows the best value against the evaluations, and **Population Snapshot** and **Swarm Diversity** the final agents, `positions(r)`, and their spread. The panel's problems have only the bounds of the box, passed as the matrix `[transpose(lb); transpose(ub)]`.

**Local Refinement** starts L-BFGS from the best agent, and **Benchmark Functions** runs CGSA on the sphere, Rosenbrock, Rastrigin and Ackley functions. **Run Consistency** repeats the run with seeds 1 to 10, and **Multi-Start** keeps the best of five runs.

## References

<a id="ref-MM2022a"></a>Mejía-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

<a id="ref-MG2017a"></a>Mirjalili, S., & Gandomi, A. H. (2017). Chaotic Gravitational Constants for the Gravitational Search Algorithm. *Applied Soft Computing* 53, 407-419. [doi:10.1016/j.asoc.2017.01.008](https://doi.org/10.1016/j.asoc.2017.01.008)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PSO](pso.md) · [CSO](cso.md) · [ABC](abc.md) · [WOA](woa.md)
