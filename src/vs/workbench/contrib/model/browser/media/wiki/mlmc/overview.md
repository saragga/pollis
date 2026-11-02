# Multilevel Monte Carlo — Overview

Plain Monte Carlo on a fine grid pays the full price of that grid for every sample. Multilevel Monte Carlo draws many samples on coarse grids and a few on fine ones, and reaches the same accuracy at far lower cost when the difference between neighbouring grids has small variance.

## Where Multilevel Monte Carlo Comes From

[Heinrich (1998)](#ref-Hei1998a) used a multilevel variance reduction for integral equations, in a study of Monte Carlo complexity. [Kebaier (2005)](#ref-Keb2005a) applied a two-level version to the weak approximation of stochastic differential equations and option pricing. [Giles (2008)](#ref-Gil2008a) extended the idea to a full ladder of time steps, gave the complexity theorem, and showed the saving on path simulation. The survey by [Giles (2015)](#ref-Gil2015a) sets out the theory and the applications that followed. The panel uses the Julia package of [Robbe (2018)](#ref-Rob2018a).

## How the Telescoping Sum of Multilevel Monte Carlo Works

Let Q_l be the quantity computed on level l, with 2^l grid points or time steps. The expected value on the finest level L splits into a coarse term and corrections:

E[Q_L] = E[Q_0] + sum for l = 1 to L of E[Q_l - Q_(l-1)]

Each term is estimated by its own independent set of samples. Within one sample, Q_l and Q_(l-1) use the same random input, so their difference is small and has small variance. Corrections on fine levels then need few samples. The error has two parts: sampling variance, and the bias left by stopping at level L.

## How the MLMC Tab of the Multilevel Panel Works

**MLMC** builds an estimator with `Estimator(ML(), MC(), sample_fn, distributions; ...)` and calls `run(estimator, tol)`, where `tol` is **Relative Tolerance** times the size of the exact answer. `sample_fn` returns the correction and the fine value for one input. The package adds levels from 0 upward, measures each level's variance, and places samples where they lower the variance most per unit of cost. The cost of one sample on level l is set to 2^l in the code, for both problems.

## How the MLQMC Tab of the Multilevel Panel Works

**MLQMC** keeps the same levels and the same `sample_fn`, and replaces the independent samples with a rank-1 lattice rule under **n Shifts** random shifts. [Giles and Waterhouse (2009)](#ref-GW2009a) introduced lattice points on the levels of a path simulation. The mean over the points of one shift gives one estimate per shift, and the spread of those estimates gives the error bar. On smooth problems the error per level falls faster than the N^(-1/2) of independent sampling. The analysis of [Kuo, Scheichl, Schwab, Sloan and Ullmann (2017)](#ref-KSSSU2017a) gives conditions for this gain on lognormal diffusion problems.

## What the Multilevel Monte Carlo Panel Does Not Do

The panel has no input for a user's own model or data. Its two problems exist to show the method where the answer is known, and **Relative Tolerance** is scaled by that known answer. A problem of your own means rewriting `sample_fn`, `distributions`, the cost model and the scale of the tolerance in the code. The cost model does not measure the time of the code: **Cost per Level** compares the two. The panel applies no Milstein scheme, antithetic coupling or multi-index levels.

## A Common Workflow for Multilevel Monte Carlo

1. Choose **Problem**, a tab and **Relative Tolerance**, and leave **Max Level** at its default.
2. Read the estimate, the error and the estimated RMSE that the run prints.
3. Check the rates with **Level Decay Plot**, **Variance Decay** and **Mean Decay**.
4. See where the work went through **Level Table** and **Sample Allocation**.
5. Measure the saving with **Multilevel vs Single Level** and **Complexity Check**.
6. Change **Seed** and run again, to see how much the result moves.

## References

<a id="ref-Gil2008a"></a>Giles, M. B. (2008). Multilevel Monte Carlo path simulation. *Operations Research* 56(3), 607–617. [doi:10.1287/opre.1070.0496](https://doi.org/10.1287/opre.1070.0496)

<a id="ref-Gil2015a"></a>Giles, M. B. (2015). Multilevel Monte Carlo methods. *Acta Numerica* 24, 259–328. [doi:10.1017/S096249291500001X](https://doi.org/10.1017/S096249291500001X)

<a id="ref-GW2009a"></a>Giles, M. B. and Waterhouse, B. J. (2009). Multilevel quasi-Monte Carlo path simulation. *Advanced Financial Modelling*, 165–182. [doi:10.1515/9783110213140.165](https://doi.org/10.1515/9783110213140.165)

<a id="ref-Hei1998a"></a>Heinrich, S. (1998). Monte Carlo complexity of global solution of integral equations. *Journal of Complexity* 14(2), 151–175. [doi:10.1006/jcom.1998.0471](https://doi.org/10.1006/jcom.1998.0471)

<a id="ref-Keb2005a"></a>Kebaier, A. (2005). Statistical Romberg extrapolation: a new variance reduction method and applications to option pricing. *The Annals of Applied Probability* 15(4), 2681–2705. [doi:10.1214/105051605000000511](https://doi.org/10.1214/105051605000000511)

<a id="ref-KSSSU2017a"></a>Kuo, F. Y., Scheichl, R., Schwab, C., Sloan, I. H. and Ullmann, E. (2017). Multilevel quasi-Monte Carlo methods for lognormal diffusion problems. *Mathematics of Computation* 86(308), 2827–2860. [doi:10.1090/mcom/3207](https://doi.org/10.1090/mcom/3207)

<a id="ref-Rob2018a"></a>Robbe, P. (2018). MultilevelEstimators.jl: a Julia toolbox for multilevel Monte Carlo methods.

## See Also

- [Factsheet](factsheet.md) · [MLMC Algorithm](mlmc-algorithm.md) · [Complexity Theorem](complexity-theorem.md) · [Quasi-Monte Carlo Extension](qmc-extension.md)
