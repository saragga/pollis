# Swarm Intelligence: Assumptions

The swarm algorithms of the panel ask little of the objective: a value for every point of a box, and nothing else. What they assume instead concerns the box, the budget of evaluations, the randomness of each run and the scale of the variables.

## Only function values

The five algorithms are called with f alone: no gradient is passed or computed. [Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) describe metaheuristics as stochastic algorithms that approximate optimal solutions where not all of the mathematical properties of the problem are known.

**Objective f(x)** can therefore be any Julia expression in x that returns a number. The **Local Refinement** and **vs Gradient-Based** actions are the exceptions: they call L-BFGS with ForwardDiff gradients from Optim.jl, so for them f must be differentiable by ForwardDiff.

## A box

Every variable has a lower and an upper bound, from **Lower Bounds** and **Upper Bounds**. [Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) write the problem of Metaheuristics.jl as the minimisation of f over the product of intervals [x_min, x_max], with optional inequality and equality constraints that the panel does not use.

All five tabs pass the box to Metaheuristics.jl as the 2 × n matrix `[transpose(lb); transpose(ub)]`, lower bounds in the first row and upper bounds in the second.

## Objectives in any dimension

**Dimension (n)** sets the length of x and the default bounds `fill(−5.12, n)` and `fill(5.12, n)`. The description of **Dimension Scaling** notes that the objective must accept any length of x, like the default, since the action re-runs the search for n = 2, 5, 10, 20 and 40 with bounds of that length.

**Population Snapshot** and **Fitness Landscape** draw the first two variables and hold the others at the best point, so they need n ≥ 2.

## A budget of evaluations

Each run stops after **Iterations** iterations; the code passes `f_calls_limit = 1e12`, so that the number of iterations ends the run. The number of evaluations per iteration depends on the algorithm, as the tooltip of **Iterations** notes, so the comparisons of the panel use evaluations: **Algorithm Shootout** gives every algorithm the number of evaluations of the current run.

The Metaheuristics.jl documentation describes `f_calls_limit` as the maximum number of function evaluations and `iterations` as the maximum number of iterations allowed.

## Randomness and seeds

The algorithms are stochastic: each run draws random initial positions and random coefficients. The main run uses seed 1; **Run Consistency** uses seeds 1 to 10, **Multi-Start** seeds 1 to 5, and **Population Sensitivity** and **Algorithm Shootout** seeds 1 to 3.

The Metaheuristics.jl documentation describes `seed` as a non-negative integer for the random generator. Every tab passes `seed` through `Options`.

## Scale of the variables

**Swarm Diversity** reports the spread of each variable relative to the width of its box, and **Solution Summary** the relative position of each variable of the best point between its bounds, so that variables on different scales can be compared.

[Kennedy and Eberhart (1995)](#ref-KE1995a) describe benchmark testing of their paradigm, and [Cheng and Jin (2015)](#ref-CJ2015a) test CSO on a set of widely used large scale optimisation problems, with dimensionality up to 5 000. **Benchmark Functions** runs the selected algorithm on four standard test functions over the same box.

## References

<a id="ref-CJ2015a"></a>Cheng, R., & Jin, Y. (2015). A Competitive Swarm Optimizer for Large Scale Optimization. *IEEE Transactions on Cybernetics* 45(2), 191-204. [doi:10.1109/TCYB.2014.2322602](https://doi.org/10.1109/TCYB.2014.2322602)

<a id="ref-KE1995a"></a>Kennedy, J., & Eberhart, R. C. (1995). Particle Swarm Optimization. *ICNN'95 — International Conference on Neural Networks* 4, 1942-1948. [doi:10.1109/ICNN.1995.488968](https://doi.org/10.1109/ICNN.1995.488968)

<a id="ref-MM2022a"></a>Mejía-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PSO](pso.md) · [CSO](cso.md) · [ABC](abc.md) · [WOA](woa.md) · [GSA](gsa.md)
