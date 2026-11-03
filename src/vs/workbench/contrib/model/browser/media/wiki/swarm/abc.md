# Swarm Intelligence: ABC

The **ABC** tab runs the artificial bee colony algorithm with `ABC` of Metaheuristics.jl. Food sources are candidate solutions; employed and onlooker bees search around them, and sources that cannot be improved are abandoned and replaced by scouts.

## Origin

[Karaboga and Basturk (2007)](#ref-KB2007a) describe ABC as an optimisation algorithm based on the intelligent behaviour of a honey bee swarm. They use it to optimise multivariable functions and compare it with a genetic algorithm, particle swarm optimisation and a particle swarm inspired evolutionary algorithm; in their results, ABC outperforms the other algorithms.

The Metaheuristics.jl documentation introduces its `ABC` type with the title of that paper and states that it implements the original parameters of the algorithm.

## Three groups of bees

The colony has employed bees, onlookers and scouts. The first half of the colony consists of employed bees and the second half of onlookers, with one employed bee for every food source. An employed bee whose food source is exhausted by the employed and onlooker bees becomes a scout.

[Karaboga and Basturk (2007)](#ref-KB2007a) keep a new food source only if it has equal or better nectar than the old one, a greedy selection. A position that cannot be improved through a predetermined number of cycles, called `limit`, is abandoned, and a scout replaces it with a random position.

## Parameters

The documentation gives the signature

```
ABC(; N = 50, Ne = div(N + 1, 2), No = div(N + 1, 2), limit = 10,
    information = Information(), options = Options())
```

with N the population size, Ne the number of employed bees and No the number of onlooker bees. The panel sets N to **Swarm Size**, so with the default of 40, Ne and No are both div(41, 2) = 20.

[Karaboga and Basturk (2007)](#ref-KB2007a) name three control parameters of the basic ABC: the number of food sources, equal to the number of employed or onlooker bees, the value of `limit` and the maximum cycle number. The **Hyperparameter Guide** of the tab lists N and `limit`.

## Exploration and exploitation

In the paper, onlookers and employed bees carry out the exploitation of the search space, and scouts control the exploration. More scouts encourage exploration, and more onlookers on a food source increase exploitation; in their experiments, the number of scouts was one.

[Karaboga and Basturk (2007)](#ref-KB2007a) tested the algorithms on five high-dimensional benchmark functions with multimodality, and conclude that ABC can get out of a local minimum and can be used for multivariable, multimodal function optimisation. The decision table of the panel gives that context for the tab.

## Evaluations

The documentation's example of `ABC()` on a three-variable sphere function reports 595 iterations and 30 020 function calls with N = 50. The comparisons of the panel use evaluations: **Algorithm Shootout** gives ABC and the four other algorithms the same number of evaluations as the current run.

`f_calls_limit = 1e12` leaves **Iterations** as the end of the run; the documentation describes `f_calls_limit` as the maximum number of function evaluations.

## Features in the package

[Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) list ABC among the single-objective algorithms of Metaheuristics.jl, citing [Karaboga and Basturk (2007)](#ref-KB2007a). In their table of implemented optimisers, and in the algorithm table of the documentation, ABC has neither constraint handling nor batch evaluation.

The panel's problems have only box constraints, which the Metaheuristics.jl tabs pass as the bounds matrix `[transpose(lb); transpose(ub)]`, lower bounds in the first row and upper bounds in the second.

## Reading an ABC run

**Population Snapshot** draws the final food sources, `positions(r)`, over the contours of f, and **Swarm Diversity** measures their spread relative to the box. **Convergence Curve** shows the best value against the evaluations.

**Run Consistency** repeats the run with ten seeds and **Multi-Start** keeps the best of five; [Karaboga and Basturk (2007)](#ref-KB2007a) repeated each of their experiments 30 times with different random seeds.

## References

<a id="ref-KB2007a"></a>Karaboga, D., & Basturk, B. (2007). A Powerful and Efficient Algorithm for Numerical Function Optimization: Artificial Bee Colony (ABC) Algorithm. *Journal of Global Optimization* 39(3), 459-471. [doi:10.1007/s10898-007-9149-x](https://doi.org/10.1007/s10898-007-9149-x)

<a id="ref-MM2022a"></a>Mejía-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PSO](pso.md) · [CSO](cso.md) · [WOA](woa.md) · [GSA](gsa.md)
