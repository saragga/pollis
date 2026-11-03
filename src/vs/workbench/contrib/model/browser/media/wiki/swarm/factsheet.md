# Swarm Intelligence: Factsheet

The panel's problem, algorithms, inputs and actions at a glance.

## The default problem

| Item | Setting |
|---|---|
| Objective | Rastrigin, 10n + Σ(xᵢ² − 10 cos 2πxᵢ) |
| Box | [−5.12, 5.12] in every variable |
| Dimension | 10 |
| Global minimum | 0 at the origin, as the tooltip states |
| Swarm size | 40 |
| Iterations | 500 |
| Seed | 1 for the main run |

## Algorithms

| Tab | Call | Settings in the documentation |
|---|---|---|
| **PSO** | `PSO(N = NP, ...)` | C1 = 2.0, C2 = 2.0, ω = 0.8 |
| **CSO** | `CSO(N = NP, φ = PHI, ...)` | N = 400, φ = 0.1 |
| **ABC** | `ABC(N = NP, ...)` | Ne = No = div(N + 1, 2), limit = 10 |
| **WOA** | `WOA(N = NP, ...)` | N only |
| **GSA** | `CGSA(N = NP, ...)` | chValueInitial = 20, chaosIndex = 9, Rpower = 1, Rnorm = 2 |

Every call passes `iterations = budget`, `f_calls_limit = 1e12` and `seed`. The papers are [Kennedy and Eberhart (1995)](#ref-KE1995a) for PSO, [Cheng and Jin (2015)](#ref-CJ2015a) for CSO, [Karaboga and Basturk (2007)](#ref-KB2007a) for ABC, [Mirjalili and Lewis (2016)](#ref-ML2016a) for WOA, and [Mirjalili and Gandomi (2017)](#ref-MG2017a) for CGSA; the package is described by [Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a).

## Inputs

| Input | Default | Tabs | Meaning |
|---|---|---|---|
| **Dimension (n)** | 10 | All | Number of decision variables |
| **Objective f(x)** | Rastrigin | All | Julia expression in x to minimise |
| **Lower Bounds** | fill(−5.12, n) | All | One lower bound per variable |
| **Upper Bounds** | fill(5.12, n) | All | One upper bound per variable |
| **Swarm Size** | 40 | All | Particles, bees, whales or agents |
| **Iterations** | 500 | All | Number of iterations |
| **Phi** | 0.1 | CSO | The φ parameter of `CSO` |

The tooltip of **Iterations** notes that the number of evaluations per iteration differs between the algorithms, so the comparisons use evaluations. The panel's recorder counts every evaluation.

## Actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Convergence Curve** | Best value against evaluations, log scale |
| Visualise | **Population Snapshot** | Final swarm over the contours of f in x1 and x2 |
| Visualise | **Fitness Landscape** | Heatmap of f in x1 and x2, the others at the best point |
| Diagnose | **Swarm Diversity** | Relative spread per variable, mean distance to the best |
| Diagnose | **Population Sensitivity** | Best value for N = 10 to 160 at about the same evaluations |
| Diagnose | **Run Consistency** | Best values over 10 seeds |
| Predict | **Best Solution** | Best point, reported and re-evaluated value |
| Predict | **Multi-Start** | Best of 5 runs |
| Predict | **Local Refinement** | Box-constrained L-BFGS from the best point |
| Compare | **vs Gradient-Based** | L-BFGS from the midpoint and from 10 random starts |
| Compare | **Algorithm Shootout** | PSO, CSO, ABC, WOA and CGSA at equal evaluations |
| Compare | **Benchmark Functions** | Sphere, Rosenbrock, Rastrigin and Ackley |
| Interpret | **Solution Summary** | Each variable with its bounds and position in the box |
| Interpret | **Hyperparameter Guide** | Main settings of the algorithm, their values and their meaning |
| Interpret | **Dimension Scaling** | Best value and run time for n = 2 to 40 |

## Further reading

| Topic | Source |
|---|---|
| The five algorithms | [Kennedy and Eberhart (1995)](#ref-KE1995a), [Cheng and Jin (2015)](#ref-CJ2015a), [Karaboga and Basturk (2007)](#ref-KB2007a), [Mirjalili and Lewis (2016)](#ref-ML2016a), [Mirjalili and Gandomi (2017)](#ref-MG2017a) |
| Metaheuristics.jl | [Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) |

The Metaheuristics.jl documentation lists the parameters and defaults of every algorithm, the `Options` type and the result accessors `minimizer`, `minimum` and `positions`.

## References

<a id="ref-CJ2015a"></a>Cheng, R., & Jin, Y. (2015). A Competitive Swarm Optimizer for Large Scale Optimization. *IEEE Transactions on Cybernetics* 45(2), 191-204. [doi:10.1109/TCYB.2014.2322602](https://doi.org/10.1109/TCYB.2014.2322602)

<a id="ref-KB2007a"></a>Karaboga, D., & Basturk, B. (2007). A Powerful and Efficient Algorithm for Numerical Function Optimization: Artificial Bee Colony (ABC) Algorithm. *Journal of Global Optimization* 39(3), 459-471. [doi:10.1007/s10898-007-9149-x](https://doi.org/10.1007/s10898-007-9149-x)

<a id="ref-KE1995a"></a>Kennedy, J., & Eberhart, R. C. (1995). Particle Swarm Optimization. *ICNN'95 — International Conference on Neural Networks* 4, 1942-1948. [doi:10.1109/ICNN.1995.488968](https://doi.org/10.1109/ICNN.1995.488968)

<a id="ref-MM2022a"></a>Mejía-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

<a id="ref-MG2017a"></a>Mirjalili, S., & Gandomi, A. H. (2017). Chaotic Gravitational Constants for the Gravitational Search Algorithm. *Applied Soft Computing* 53, 407-419. [doi:10.1016/j.asoc.2017.01.008](https://doi.org/10.1016/j.asoc.2017.01.008)

<a id="ref-ML2016a"></a>Mirjalili, S., & Lewis, A. (2016). The Whale Optimization Algorithm. *Advances in Engineering Software* 95, 51-67. [doi:10.1016/j.advengsoft.2016.01.008](https://doi.org/10.1016/j.advengsoft.2016.01.008)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PSO](pso.md) · [CSO](cso.md) · [ABC](abc.md) · [WOA](woa.md) · [GSA](gsa.md)
