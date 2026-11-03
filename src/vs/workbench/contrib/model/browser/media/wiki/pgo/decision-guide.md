# Stochastic Search with Local Refinement: Decision Guide

Which method to run, how to set the budget and the local optimiser, and how to check the answer.

## Choosing a method

| Situation | Method | Why |
|---|---|---|
| Smooth multimodal problems with a good local solver | **MLSL** | Low-discrepancy samples, local searches only from points not near a found basin |
| Smooth problems with cheap gradients | **StoGO-R** | Branch and bound over boxes, with gradient-based local searches in each |
| Economic models estimated by minimising a loss, with affordable local searches | **TikTak** | The best Sobol points, pulled ever closer to the best minimum; deterministic |

The table follows the panel's decision table.

## What the benchmark found

[Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) benchmark seven global optimisers, five from NLopt, among them MLSL and StoGO, and two versions of TikTak, on four test functions and on the estimation of an earnings-dynamics model by simulated moments. TikTak with a derivative-free least-squares local stage had the strongest performance on both, in reliability and speed, followed by TikTak with Nelder-Mead.

The relative performance of the NLopt algorithms varied across the test functions and the economic application: MLSL did better on the economic application, and StoGO performed well on the test functions.

## The local optimiser

**Local Optimiser**, for MLSL and TikTak, chooses BOBYQA, the default, Nelder-Mead or L-BFGS. BOBYQA and Nelder-Mead are derivative-free; L-BFGS uses gradients from ForwardDiff, by [Revels, Lubin and Papamarkou (2016)](#ref-RLP2016a). [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) use Nelder-Mead in the local stage of MLSL and of one TikTak version.

They point out a trade-off in the stopping tolerance of each local search: a loose tolerance gives shorter, cheaper local searches that may stop before exploring their region, a tight one the opposite. The panel's local searches stop at a relative step tolerance of 10⁻⁶, and **Local Polish** refines the final answer at 10⁻¹².

## The budget

**Budget** sets the maximum number of evaluations, 2000 by default. **Budget Study** shows the best value for budgets from 100 to 5000, and **Convergence Curve** at which evaluation the best value was found; together they show whether more evaluations would pay.

For TikTak, a quarter of the budget goes to the Sobol points; [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) write that their number should grow with the dimension of the problem.

## Checking the answer

| Question | Action |
|---|---|
| Does the answer depend on the seed? | **Seed Robustness** |
| Is it an interior minimum? | **Solution**, **Solution Summary** |
| Can it be refined? | **Local Polish** |
| Would another method do better here? | **Compare Methods** |
| Where did the method search? | **Objective Landscape** |

NLopt's documentation, by [Johnson (2007)](#ref-Joh2007c), recommends polishing the result of a global optimisation with a local one, since many global algorithms devote more effort to searching the space than to locating the optimum precisely.

## Other global methods

**Compare Methods** adds three further NLopt global methods: AGS, DIRECT-L and CRS2. NLopt's documentation describes DIRECT-L as a deterministic search that divides the domain into smaller and smaller hyper-rectangles, biased towards local search, CRS2 as a controlled random search that evolves a random population of points by heuristic rules, and AGS as a derivative-free method that reduces the problem to one dimension along a Hilbert curve.

[Rinnooy Kan and Timmer (1987)](#ref-KT1987a), [Madsen and Zertchaninov (1998)](#ref-MZ1998a) and [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) are the original sources for the three methods of the panel.

## References

<a id="ref-AGK2019a"></a>Arnoud, A., Guvenen, F., & Kleineberg, T. (2019). *Benchmarking Global Optimizers*. NBER Working Paper 26340. National Bureau of Economic Research. [doi:10.3386/w26340](https://doi.org/10.3386/w26340)

<a id="ref-Joh2007c"></a>Johnson, S. G. (2007). The NLopt Nonlinear-Optimization Package. *NLopt Documentation*. [nlopt.readthedocs.io](https://nlopt.readthedocs.io/en/latest/)

<a id="ref-MZ1998a"></a>Madsen, K., & Zertchaninov, S. (1998). An Adaptive Approach to Stochastic Global Optimization. *Technical Report*.

<a id="ref-RLP2016a"></a>Revels, J., Lubin, M., & Papamarkou, T. (2016). Forward-Mode Automatic Differentiation in Julia. [arXiv:1607.07892](https://arxiv.org/abs/1607.07892)

<a id="ref-KT1987a"></a>Rinnooy Kan, A. H. G., & Timmer, G. T. (1987). Stochastic Global Optimization Methods Part I: Clustering Methods. *Mathematical Programming* 39(1), 57-78. [doi:10.1007/BF02592071](https://doi.org/10.1007/BF02592071)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [MLSL](mlsl.md) · [StoGO-R](stogo-r.md) · [TikTak](tiktak.md)
