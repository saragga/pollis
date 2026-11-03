# Swarm Intelligence: CSO

The **CSO** tab runs the competitive swarm optimiser with `CSO` of Metaheuristics.jl: random pairs of particles compete, and the loser of each pair learns from the winner.

## Origin

[Cheng and Jin (2015)](#ref-CJ2015a) propose CSO for large scale optimisation. The algorithm is inspired by particle swarm optimisation but conceptually very different: neither the personal best position of each particle nor the global best position, or neighbourhood best positions, is involved in updating the particles. Instead, a pairwise competition mechanism is introduced, in which the particle that loses the competition updates its position by learning from the winner.

They provide a theoretical proof of convergence and an empirical analysis of exploration and exploitation, and report that CSO can effectively solve problems of dimensionality up to 5 000.

## Parameters in Metaheuristics.jl

The documentation gives the signature

```
CSO(; N = 400, φ = 0.1, information = Information(), options = Options())
```

and describes the type as a competitive swarm optimiser for large scale optimisation. The panel sets N to **Swarm Size**, 40 by default, and φ to **Phi**, 0.1 by default, and keeps the other defaults. The documentation's second example sets N = 100 and φ = 0.4 and stops after 476 iterations and 23 850 function calls, by its convergence termination criterion.

## The tab in Julia

```
alg = CSO(N = N, φ = phi, options = Options(iterations = iters, f_calls_limit = 1e12, seed = seed))
r = Metaheuristics.optimize(fr, [transpose(lb); transpose(ub)], alg)
(x = minimizer(r), fx = minimum(r), pop = positions(r))
```

`fr` is f wrapped in the panel's recorder, which stores every evaluation, so that the convergence curves and the comparisons count evaluations. The bounds go in as a 2 × n matrix, lower bounds in the first row and upper bounds in the second, as in the four other tabs.

## Evaluations

The documentation's first example runs `CSO()` with N = 400 on a three-variable sphere function and stops after 149 iterations and 30 000 function calls, with the reason "Maximum objective function calls exceeded". In the panel, `f_calls_limit = 1e12` leaves **Iterations** as the end of the run.

**Population Sensitivity** keeps N times the iterations about constant, and **Algorithm Shootout** gives CSO and the four other algorithms the number of evaluations of the current run.

## When the tab applies

The decision table gives the context of CSO from [Cheng and Jin (2015)](#ref-CJ2015a), large scale optimisation tested up to dimensionality 5 000, and from the Metaheuristics.jl documentation, which recommends CSO for large-scale problems. The algorithm table of the documentation marks CSO as the single-objective algorithm for large scale problems.

**Dimension Scaling** re-runs the tab for n = 2, 5, 10, 20 and 40 and prints the best value, the evaluations and the run time.

## Reading a CSO run

**Population Snapshot** draws the final swarm, `positions(r)`, over the contours of f in x1 and x2, and **Swarm Diversity** measures its spread relative to the box. [Cheng and Jin (2015)](#ref-CJ2015a) report that their empirical analysis shows a good balance between exploration and exploitation.

**Run Consistency** repeats the run with ten seeds, and **Local Refinement** polishes the best point with L-BFGS from Optim.jl.

## References

<a id="ref-CJ2015a"></a>Cheng, R., & Jin, Y. (2015). A Competitive Swarm Optimizer for Large Scale Optimization. *IEEE Transactions on Cybernetics* 45(2), 191-204. [doi:10.1109/TCYB.2014.2322602](https://doi.org/10.1109/TCYB.2014.2322602)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PSO](pso.md) · [ABC](abc.md) · [WOA](woa.md) · [GSA](gsa.md)
