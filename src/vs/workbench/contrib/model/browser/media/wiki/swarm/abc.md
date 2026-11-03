# Swarm Intelligence: ABC

The **ABC** tab runs the artificial bee colony algorithm with `ABC` of Metaheuristics.jl. Food sources are candidate solutions; employed and onlooker bees perturb them, and sources that stop improving are abandoned to scouts.

## Origin

[Karaboga and Basturk (2007)](#ref-KB2007a) present the artificial bee colony (ABC) algorithm as a powerful and efficient algorithm for numerical function optimisation. The Metaheuristics.jl documentation introduces its `ABC` type with the title of that paper and states that it implements the original parameters of the algorithm.

The bullet of the panel summarises the method as employed, onlooker and scout bee phases that balance exploitation and exploration, and the notebook on ABC uses the same words.

## Parameters in Metaheuristics.jl

The documentation gives the signature

```
ABC(; N = 50, Ne = div(N + 1, 2), No = div(N + 1, 2), limit = 10,
    information = Information(), options = Options())
```

with N the population size, Ne the number of employed bees, No the number of onlooker bees, and `limit` related to the number of times a solution is visited. The panel sets N to **Swarm Size**, so with the default of 40, Ne and No are both div(41, 2) = 20.

The **Hyperparameter Guide** of the tab lists N, the number of food sources and bees, and `limit`, 10 by default, as the number of trials without improvement before a source is abandoned to a scout.

## Food sources and bees

The decision table describes the purpose of the tab: employed and onlooker bees perturb food sources, and sources that stop improving are abandoned to scouts. In the panel, each food source is a point of the box, evaluated by f, and the final sources are what `positions(r)` returns.

The **Hyperparameter Guide** ties abandonment to `limit`: a source that has not improved in `limit` trials goes to a scout. The decision table names multimodal problems, where exploration matters more than speed, as the context of the tab.

## Evaluations

The tooltip of **Iterations** counts two evaluations per bee and iteration for ABC, against about one per particle for PSO, WOA and GSA. The comparisons of the panel therefore use evaluations: **Algorithm Shootout** gives ABC, PSO, WOA and CGSA the same number of evaluations as the current run.

The code comment explains the explicit `f_calls_limit = 1e12` of the tab: otherwise PSO and ABC stop at 10 000 n evaluations.

## Features in the package

[Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) list ABC among the single-objective algorithms of Metaheuristics.jl, citing [Karaboga and Basturk (2007)](#ref-KB2007a). In their table of implemented optimisers, and in the algorithm table of the documentation, ABC has neither constraint handling nor batch evaluation.

The panel's problems have only box constraints, which the Metaheuristics.jl tabs pass as the bounds matrix `[transpose(lb); transpose(ub)]`, lower bounds in the first row and upper bounds in the second.

## Reading an ABC run

**Population Snapshot** draws the final food sources, `positions(r)`, over the contours of f, and **Swarm Diversity** measures their spread relative to the box. **Convergence Curve** shows the best value against the evaluations, two per bee and iteration.

**Run Consistency** repeats the run with ten seeds and **Multi-Start** keeps the best of five. The panel's textbooks are [Kennedy, Eberhart and Shi (2001)](#ref-KES2001a) and [Engelbrecht (2005)](#ref-Eng2005a).

## References

<a id="ref-Eng2005a"></a>Engelbrecht, A. P. (2005). *Fundamentals of Computational Swarm Intelligence*. Wiley.

<a id="ref-KB2007a"></a>Karaboga, D., & Basturk, B. (2007). A Powerful and Efficient Algorithm for Numerical Function Optimization: Artificial Bee Colony (ABC) Algorithm. *Journal of Global Optimization* 39(3), 459-471. [doi:10.1007/s10898-007-9149-x](https://doi.org/10.1007/s10898-007-9149-x)

<a id="ref-KES2001a"></a>Kennedy, J., Eberhart, R. C., & Shi, Y. (2001). *Swarm Intelligence*. Morgan Kaufmann.

<a id="ref-MM2022a"></a>Mejía-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PSO](pso.md) · [CSO](cso.md) · [WOA](woa.md) · [GSA](gsa.md)
