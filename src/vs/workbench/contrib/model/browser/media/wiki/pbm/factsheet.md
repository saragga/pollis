# Pareto-Based Multi-Objective Optimisation: Factsheet

The panel's algorithms, inputs, outputs and sources at a glance.

## Algorithms

| Algorithm | Constructor | Specific parameter | Original paper |
|---|---|---|---|
| **NSGA-II** | `NSGA2(N = ...)` | crowding distance | [Deb, Pratap, Agarwal and Meyarivan (2002)](#ref-DPAM2002a) |
| **NSGA-III** | `NSGA3(N = ...)` | `partitions = 12` reference points by default | [Deb and Jain (2014)](#ref-DJ2014a) |
| **SPEA2** | `SPEA2(N = ...)` | strength fitness and archive | [Zitzler, Laumanns and Thiele (2001)](#ref-ZLT2001a) |
| **SMS-EMOA** | `SMS_EMOA(N = ...)` | `n_samples = 10_000` for the hypervolume with more than two objectives | [Beume, Naujoks and Emmerich (2007)](#ref-BNE2007a) |

All four share the defaults of Metaheuristics.jl for variation: crossover with η = 20 and probability 0.9, and mutation with η = 20 and probability 1/D for D decision variables.

## Inputs

| Input | Default |
|---|---|
| **Objectives** | [4x[1]^2 + 4x[2]^2, (x[1] - 5)^2 + (x[2] - 5)^2] |
| **Inequality Constraints** | [(x[1] - 5)^2 + x[2]^2 - 25, 7.7 - (x[1] - 8)^2 - (x[2] + 3)^2] |
| **Equality Constraints** | [0.0], none |
| **Bounds** | [0.0 0.0; 5.0 3.0] |
| **Population** | 100; typical 100 to 300 |
| **Iterations** | 250; typical 200 to 500 |

The seed is 1 in the main code.

## Outputs

| Output | Meaning |
|---|---|
| `front_size` | Number of non-dominated objective vectors |
| `ideal` | Smallest value of each objective on the front |
| `nadir` | Largest value of each objective on the front |
| `hypervolume` | Volume dominated by the front, up to the reference point |
| `all_feasible` | Whether every non-dominated solution satisfies the constraints |

The reference point is the nadir plus 10% of the distance from the ideal to the nadir, objective by objective.

## Actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Pareto Front Plot**, **Convergence Plot** | The front; hypervolume by generation |
| Diagnose | **Front Statistics**, **Hypervolume** | Size, ranges, spacing, violations and evaluations; mean and sd over 5 seeds |
| Predict | **Budget Sensitivity**, **Trade-Off Rates** | Hypervolume at 0.1 to 2 times the budget; −Δf₂/Δf₁ along the front |
| Compare | **Compare Algorithms**, **IGD Comparison** | Size, hypervolume, spacing and time; IGD to the joint front |
| Interpret | **Decision Space**, **Compromise Point** | The Pareto set; the point closest to the ideal after scaling |

## Further reading

| Topic | Work |
|---|---|
| The package | [Mejia-de-Dios and Mezura-Montes (2022)](#ref-MM2022a) |
| Textbooks on evolutionary multi-objective optimisation | [Deb (2001)](#ref-Deb2001a), [Coello Coello, Lamont and Van Veldhuizen (2007)](#ref-CLV2007a) |
| Pareto dominance, the four algorithms and performance assessment | [Emmerich and Deutz (2024)](#ref-ED2024a) |

The original papers of the four algorithms are listed in the table of algorithms, and each has its own page under Algorithms, with its selection mechanism and its parameters in Metaheuristics.jl.

## References

<a id="ref-BNE2007a"></a>Beume, N., Naujoks, B., & Emmerich, M. (2007). SMS-EMOA: Multiobjective Selection Based on Dominated Hypervolume. *European Journal of Operational Research* 181(3), 1653-1669. [doi:10.1016/j.ejor.2006.08.008](https://doi.org/10.1016/j.ejor.2006.08.008)

<a id="ref-CLV2007a"></a>Coello Coello, C. A., Lamont, G. B., & Van Veldhuizen, D. A. (2007). *Evolutionary Algorithms for Solving Multi-Objective Problems*. Springer (2nd ed.).

<a id="ref-Deb2001a"></a>Deb, K. (2001). *Multi-Objective Optimization Using Evolutionary Algorithms*. Wiley.

<a id="ref-DJ2014a"></a>Deb, K., & Jain, H. (2014). An Evolutionary Many-Objective Optimization Algorithm Using Reference-Point-Based Nondominated Sorting Approach, Part I: Solving Problems with Box Constraints. *IEEE Transactions on Evolutionary Computation* 18(4), 577-601. [doi:10.1109/TEVC.2013.2281535](https://doi.org/10.1109/TEVC.2013.2281535)

<a id="ref-DPAM2002a"></a>Deb, K., Pratap, A., Agarwal, S., & Meyarivan, T. (2002). A Fast and Elitist Multiobjective Genetic Algorithm: NSGA-II. *IEEE Transactions on Evolutionary Computation* 6(2), 182-197. [doi:10.1109/4235.996017](https://doi.org/10.1109/4235.996017)

<a id="ref-ED2024a"></a>Emmerich, M., & Deutz, A. (2024). Multicriteria Optimization and Decision Making: Principles, Algorithms and Case Studies. [doi:10.48550/arXiv.2407.00359](https://doi.org/10.48550/arXiv.2407.00359)

<a id="ref-MM2022a"></a>Mejia-de-Dios, J.-A., & Mezura-Montes, E. (2022). Metaheuristics: A Julia Package for Single- and Multi-Objective Optimization. *Journal of Open Source Software* 7(78), 4723. [doi:10.21105/joss.04723](https://doi.org/10.21105/joss.04723)

<a id="ref-ZLT2001a"></a>Zitzler, E., Laumanns, M., & Thiele, L. (2001). SPEA2: Improving the Strength Pareto Evolutionary Algorithm. *TIK-Report 103, ETH Zurich*.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [NSGA-II](nsga2.md) · [NSGA-III](nsga3.md) · [SPEA2](spea2.md) · [SMS-EMOA](sms.md)
