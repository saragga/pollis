# Stochastic Search with Local Refinement: Overview

**Stochastic Search with Local Refinement** minimises a function with many local minima over a box with three global methods that combine a search of the whole box with local searches: MLSL and StoGO-R from NLopt, and TikTak from MultistartOptimization.jl.

## Global and local search

A local optimiser finds a minimum near its starting point; on a function with many local minima, which one it finds depends on where it starts. [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) describe multistart algorithms as methods that run a local optimisation from a starting point until a local optimum is found, pick the next starting point, run another, and at the end return the lowest of all the local optima as the global optimum.

They write that such algorithms typically have two stages: a global stage, which selects the starting points of new local searches, and a local stage, which runs them with a chosen local algorithm and stopping criteria. Multistart methods differ in how they choose the next starting point and how they use the history of earlier searches.

## Three methods

| Method | Global stage | Local stage | Source |
|---|---|---|---|
| **MLSL** | Low-discrepancy samples, with a clustering rule that skips points near found minima | **Local Optimiser** | [Rinnooy Kan and Timmer (1987)](#ref-KT1987a) |
| **StoGO-R** | Branch-and-bound over boxes, with random points in each box | A gradient-based local search | [Madsen and Zertchaninov (1998)](#ref-MZ1998a) |
| **TikTak** | The best Sobol points, pulled ever closer to the best minimum found | **Local Optimiser** | [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) |

[Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) benchmark all three, with other global optimisers, on difficult test functions and on the estimation of an economic model.

## The software

NLopt, documented by [Johnson (2007)](#ref-Joh2007c), provides MLSL as `G_MLSL_LDS` and the randomised StoGO as `GD_STOGO_RAND`, together with the local algorithms BOBYQA, Nelder-Mead and L-BFGS and the other global methods of **Compare Methods**. MultistartOptimization.jl implements TikTak as described by [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a), with NLopt's local methods for the local stage.

Gradients, where an algorithm asks for them, come from ForwardDiff.jl, by [Revels, Lubin and Papamarkou (2016)](#ref-RLP2016a), which differentiates the expression of **Objective f(x)** automatically.

## The default problem

**Objective f(x)** defaults to the two-dimensional Rastrigin function,

f(x) = 20 + x₁² + x₂² − 10 (cos 2πx₁ + cos 2πx₂)

with its global minimum 0 at the origin and a grid of local minima around it. [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) use the Rastrigin function among their test functions, as one of three that display a large number of local minima.

**Lower Bounds** and **Upper Bounds** set the box, [−5.12, 7] × [−5.12, 6] by default. As the tooltip of **Upper Bounds** explains, the box is deliberately not centred on the optimum, so that no method is handed the answer at its first evaluation.

## How the panel is organised

**Budget** sets the maximum number of objective evaluations, 2000 by default, and **Local Optimiser** the local algorithm of MLSL and TikTak. Every evaluation is recorded, so that the search can be inspected afterwards.

The actions fall into five groups: Visualise draws the objective with every evaluated point and the convergence of the best value; Diagnose explains the return code and repeats the search with five seeds; Predict gives the solution and a local polish; Compare runs other NLopt global methods and growing budgets; and Interpret summarises the algorithm and the solution.

## References

<a id="ref-AGK2019a"></a>Arnoud, A., Guvenen, F., & Kleineberg, T. (2019). *Benchmarking Global Optimizers*. NBER Working Paper 26340. National Bureau of Economic Research. [doi:10.3386/w26340](https://doi.org/10.3386/w26340)

<a id="ref-Joh2007c"></a>Johnson, S. G. (2007). The NLopt Nonlinear-Optimization Package. *NLopt Documentation*. [nlopt.readthedocs.io](https://nlopt.readthedocs.io/en/latest/)

<a id="ref-MZ1998a"></a>Madsen, K., & Zertchaninov, S. (1998). An Adaptive Approach to Stochastic Global Optimization. *Technical Report*.

<a id="ref-RLP2016a"></a>Revels, J., Lubin, M., & Papamarkou, T. (2016). Forward-Mode Automatic Differentiation in Julia. [arXiv:1607.07892](https://arxiv.org/abs/1607.07892)

<a id="ref-KT1987a"></a>Rinnooy Kan, A. H. G., & Timmer, G. T. (1987). Stochastic Global Optimization Methods Part I: Clustering Methods. *Mathematical Programming* 39(1), 57-78. [doi:10.1007/BF02592071](https://doi.org/10.1007/BF02592071)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [MLSL](mlsl.md) · [StoGO-R](stogo-r.md) · [TikTak](tiktak.md)
