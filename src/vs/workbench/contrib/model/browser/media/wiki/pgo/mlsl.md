# Stochastic Search with Local Refinement: MLSL

**MLSL**, multi-level single-linkage, by [Rinnooy Kan and Timmer (1987)](#ref-KT1987a), runs local searches from sample points, but skips any point that lies close to a better sample point, so that the same basin is not searched again and again.

## A clustering method

[Rinnooy Kan and Timmer (1987)](#ref-KT1987a) describe two stochastic methods for global optimisation that, with probability 1, find all relevant local minima of the objective function with the smallest possible number of local searches, and examine their computational performance analytically and empirically.

The NLopt documentation of [Johnson (2007)](#ref-Joh2007c) describes MLSL as a multistart algorithm, which runs a sequence of local optimisations from random or low-discrepancy starting points, distinguished by a clustering heuristic that helps it avoid repeated searches of the same local optima, and by theoretical guarantees of finding all local optima in a finite number of local minimisations.

## The steps

[Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) give the steps of the version they benchmark:

1. Draw N points from the Sobol sequence over the box and add them to the sample S.
2. Rank the points of S by their function values and keep the best fraction γ.
3. From each kept point x, run a local search, unless x is a local minimum already found, or another sample point xⱼ has f(xⱼ) < f(x) and lies within a distance r of x.
4. Add each minimum found to the set of local minima, and repeat until a stopping rule is met.

They use N = 4 and γ = 0.3; NLopt's documentation also notes that each iteration of MLSL samples 4 new trial points by default.

## Low-discrepancy sampling

NLopt offers MLSL with pseudorandom points, `G_MLSL`, and with a Sobol low-discrepancy sequence, `G_MLSL_LDS`, which its documentation reports was argued to improve the convergence rate. [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) use the Sobol version, since Sobol sequences cover the search space more efficiently.

The panel runs `G_MLSL_LDS`. Its random numbers are seeded with `NLopt.srand(seed)`, so that a run can be repeated, and **Seed Robustness** reruns it with seeds 1 to 5.

## The local optimiser

The local searches of MLSL can use any NLopt algorithm, gradient-based or derivative-free, set with the local optimiser of the outer one. **Local Optimiser** chooses among BOBYQA and Nelder-Mead, both derivative-free, and L-BFGS, which takes its gradients from ForwardDiff, by [Revels, Lubin and Papamarkou (2016)](#ref-RLP2016a). The local searches stop at a relative step tolerance of 10⁻⁶.

The NLopt documentation notes that a relatively large tolerance for the local searches is reasonable, followed at the end by another local optimisation with a lower tolerance from the MLSL result, to polish the optimum to high precision. **Local Polish** does that with L-BFGS.

## Stopping

The NLopt documentation warns that MLSL runs indefinitely without a maximum number of evaluations or a maximum run time. The panel sets `maxeval` to **Budget**, so a run normally ends with `MAXEVAL_REACHED`.

**Budget Study** reruns MLSL with budgets from 100 to 5000 evaluations, and **Convergence Curve** shows at which evaluation the best value was found. **Return Status** reports the evaluation at which the final best value was first reached, so the share of the budget spent after the last improvement can be read directly.

## When to use it

The panel's decision table suggests **MLSL** for smooth multimodal problems where a good local solver is available. [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) cite earlier work finding MLSL very effective with a fast gradient-based local search on smooth problems, and in their benchmark MLSL performed better on the economic application than on the test functions.

NLopt supports only bound-constrained problems for MLSL, which matches the box of **Lower Bounds** and **Upper Bounds**.

## References

<a id="ref-AGK2019a"></a>Arnoud, A., Guvenen, F., & Kleineberg, T. (2019). *Benchmarking Global Optimizers*. NBER Working Paper 26340. National Bureau of Economic Research. [doi:10.3386/w26340](https://doi.org/10.3386/w26340)

<a id="ref-Joh2007c"></a>Johnson, S. G. (2007). The NLopt Nonlinear-Optimization Package. *NLopt Documentation*. [nlopt.readthedocs.io](https://nlopt.readthedocs.io/en/latest/)

<a id="ref-RLP2016a"></a>Revels, J., Lubin, M., & Papamarkou, T. (2016). Forward-Mode Automatic Differentiation in Julia. [arXiv:1607.07892](https://arxiv.org/abs/1607.07892)

<a id="ref-KT1987a"></a>Rinnooy Kan, A. H. G., & Timmer, G. T. (1987). Stochastic Global Optimization Methods Part I: Clustering Methods. *Mathematical Programming* 39(1), 57-78. [doi:10.1007/BF02592071](https://doi.org/10.1007/BF02592071)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [StoGO-R](stogo-r.md) · [TikTak](tiktak.md)
