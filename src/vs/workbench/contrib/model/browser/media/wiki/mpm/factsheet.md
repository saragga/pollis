# Multi-Objective Optimisation Performance Metrics: Factsheet

A quick reference for **Multi-Objective Optimisation Performance Metrics**: the five metrics, the inputs, the demonstration they run on, and what each action computes. The metrics come from the `PerformanceIndicators` module of `Metaheuristics.jl`, with the additive epsilon-indicator written out in the panel's code.

## The five metrics side by side

| Metric | Measures | Needs | Better |
|---|---|---|---|
| **Hypervolume** | Volume dominated by the front, up to a reference point | A reference point | Higher |
| **Generational Distance** | Mean distance from each obtained point to the reference front | A reference front | Lower |
| **Inverted Generational Distance** | Mean distance from each reference point to the obtained front | A reference front | Lower |
| **Epsilon-Indicator** | Smallest shift that makes the front weakly dominate the reference | A reference front | Lower |
| **Spacing** | Spread of the distances between neighbouring points | Nothing else | Lower |

Every metric assumes that each objective is minimised, as `Metaheuristics.jl` does throughout. [Audet, Bigeon, Cartier, Le Digabel and Salomon (2021)](#ref-ABCDS2021a) review these and many other indicators, grouping them by whether they measure cardinality, convergence, distribution, or convergence and distribution together.

## Inputs

| Input | Default | Meaning |
|---|---|---|
| **Result** | `demo_result` | The front to assess: a `Metaheuristics` result, or a matrix with one row per point |
| **Reference Front** | `demo_ref` | The true front, or a good approximation of it, in the same form |
| **Second Result** | `demo_result2` | A second front, for the Compare actions |

`as_front` turns a result into its non-dominated points with `pareto_front`, and leaves a matrix as it is. Columns are objectives and rows are points, in **Result**, **Reference Front** and **Second Result** alike.

## The demonstration

The default inputs come from two runs on ZDT1, a test problem with two objectives and a known front, from the suite of [Zitzler, Deb and Thiele (2000)](#ref-ZDT2000a). `demo_result` is NSGA-II, the algorithm of [Deb, Pratap, Agarwal and Meyarivan (2002)](#ref-DPAM2002a), and `demo_result2` is SPEA2, the algorithm of [Zitzler, Laumanns and Thiele (2001)](#ref-ZLT2001a), which improves the strength Pareto evolutionary algorithm of [Zitzler and Thiele (1999)](#ref-ZT1999a).

Both runs use 100 iterations, the seed 1, and `store_convergence=true`, so that every generation is kept for **Metric over Generations**. `demo_ref` is the known ZDT1 front supplied by the package.

## The hypervolume reference point

`refpoint` is placed 10% of the range beyond the largest value of each objective, taken over the obtained front, the second front and the reference front together. One point therefore serves all three sets, and the hypervolumes of the two fronts can be compared directly.

The choice follows the practice that [Ishibuchi, Imada, Setoguchi and Nojima (2018)](#ref-IISN2018a) describe: a point slightly worse than the nadir point, the vector of the worst values on the front, is usually used for hypervolume calculation.

## What a run prints

| Output | Meaning |
|---|---|
| `metric` | The metric chosen |
| `value` | Its value for **Result** |
| `better` | `higher` or `lower` |
| `front_size` | Number of non-dominated points in the obtained front |
| `reference_size` | Number of points in the reference front |
| `objectives` | Number of objectives |

`all_metrics` computes all five metrics for any front, and `pointwise` breaks the chosen metric into one value per point, which **Point Contributions** uses.

## Visualise, Diagnose and Predict actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Front vs Reference** | Both fronts in the first two objectives, with what the metric measures drawn on top |
| Visualise | **Metric over Generations** | The metric on the non-dominated front of every stored generation |
| Diagnose | **All Metrics** | All five values, with the direction in which each improves |
| Diagnose | **Front Statistics** | Size, dominated points, duplicates, and the objective ranges of both fronts |
| Predict | **Subsample Sensitivity** | The metric on random subsets of the front, 20 draws per size |

## Compare and Interpret actions

| Group | Action | Output |
|---|---|---|
| Compare | **Compare Two Fronts** | All five metrics for **Result** and **Second Result**, with the winner of each |
| Compare | **Coverage** | The set coverage C(A, B) and C(B, A) |
| Interpret | **Metric Guide** | What each metric rewards, its value, and what it needs |
| Interpret | **Point Contributions** | The metric point by point, with the five largest values |

Every action reads `front`, `front2` and `ref`, so changing an input and rerunning updates them all.

## Package and textbooks

`Metaheuristics.jl`, described by [Mejía-de-Dios and Mezura-Montes (2022)](#ref-MM2022a), implements metaheuristics for single- and multi-objective optimisation, with test problems and performance indicators among its utilities. [Deb (2001)](#ref-Deb2001a) is a textbook on multi-objective optimisation with evolutionary algorithms. `Plots` draws the charts, and the package's `TestProblems` module supplies ZDT1 with its true front. [Zitzler, Thiele, Laumanns, Fonseca and da Fonseca (2003)](#ref-ZTLFF2003a) develop a mathematical framework for classifying quality indicators and analyse their limitations.

## References

<a id="ref-ABCDS2021a"></a>Audet, C., Bigeon, J., Cartier, D., Le Digabel, S., & Salomon, L. (2021). Performance Indicators in Multiobjective Optimization. *European Journal of Operational Research* 292(2), 397-422. [doi:10.1016/j.ejor.2020.11.016](https://doi.org/10.1016/j.ejor.2020.11.016)

<a id="ref-Deb2001a"></a>Deb, K. (2001). *Multi-Objective Optimization Using Evolutionary Algorithms*. Wiley.

<a id="ref-DPAM2002a"></a>Deb, K., Pratap, A., Agarwal, S., & Meyarivan, T. (2002). A Fast and Elitist Multiobjective Genetic Algorithm: NSGA-II. *IEEE Transactions on Evolutionary Computation* 6(2), 182-197. [doi:10.1109/4235.996017](https://doi.org/10.1109/4235.996017)

<a id="ref-IISN2018a"></a>Ishibuchi, H., Imada, R., Setoguchi, Y., & Nojima, Y. (2018). How to Specify a Reference Point in Hypervolume Calculation for Fair Performance Comparison. *Evolutionary Computation* 26(3), 411-440. [doi:10.1162/evco_a_00226](https://doi.org/10.1162/evco_a_00226)

<a id="ref-MM2022a"></a>Mejía-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

<a id="ref-ZDT2000a"></a>Zitzler, E., Deb, K., & Thiele, L. (2000). Comparison of Multiobjective Evolutionary Algorithms: Empirical Results. *Evolutionary Computation* 8(2), 173-195. [doi:10.1162/106365600568202](https://doi.org/10.1162/106365600568202)

<a id="ref-ZLT2001a"></a>Zitzler, E., Laumanns, M., & Thiele, L. (2001). SPEA2: Improving the Strength Pareto Evolutionary Algorithm. TIK-Report 103, ETH Zurich. [doi:10.3929/ethz-a-004284029](https://doi.org/10.3929/ethz-a-004284029)

<a id="ref-ZT1999a"></a>Zitzler, E., & Thiele, L. (1999). Multiobjective Evolutionary Algorithms: A Comparative Case Study and the Strength Pareto Approach. *IEEE Transactions on Evolutionary Computation* 3(4), 257-271. [doi:10.1109/4235.797969](https://doi.org/10.1109/4235.797969)

<a id="ref-ZTLFF2003a"></a>Zitzler, E., Thiele, L., Laumanns, M., Fonseca, C. M., & da Fonseca, V. G. (2003). Performance Assessment of Multiobjective Optimizers: An Analysis and Review. *IEEE Transactions on Evolutionary Computation* 7(2), 117-132. [doi:10.1109/TEVC.2003.810758](https://doi.org/10.1109/TEVC.2003.810758)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Hypervolume](hv.md) · [Generational Distance](gd.md) · [Inverted Generational Distance](igd.md) · [Epsilon-Indicator](eps.md) · [Spacing](spacing.md)
