# Multilevel Monte Carlo — MLMC Algorithm

The algorithm decides at run time how many levels to use and how many samples to draw on each. The formulas come from [Giles (2008)](#ref-Gil2008a), and the steps in the panel are those of the package by [Robbe (2018)](#ref-Rob2018a).

## What the Multilevel Monte Carlo Estimator Computes

The estimator of E[Q] on levels 0 to L is

Y = sum for l = 0 to L of (1/N_l) sum for i = 1 to N_l of D_l(i)

where D_l(i) = Q_l(i) - Q_(l-1)(i) on the same random input, and D_0 = Q_0. Samples on different levels are independent, so Var[Y] is the sum of V_l / N_l, with V_l = Var[D_l]. Its mean squared error is Var[Y] plus the squared bias (E[Q_L] - E[Q])^2. The estimator does not lower the bias of the finest level: only a deeper L does.

## How Multilevel Monte Carlo Allocates Samples Across Levels

Minimising cost for a fixed variance gives the sample count on level l:

N_l = ceil( (1 / (theta eps^2)) sqrt(V_l / C_l) sum for k = 0 to L of sqrt(V_k C_k) )

Here eps is the tolerance, C_l is the cost of one sample and theta is the share of eps^2 given to the variance. Levels with large variance and small cost get the most samples. The package only adds samples, and never discards any.

## How the Package Splits the Tolerance Between Variance and Bias

The target is V + b^2 <= eps^2, where V is the estimator variance and b the bias. A fixed split gives half to each. MultilevelEstimators.jl computes theta = 1 - b^2 / eps^2 at each step and clamps it to the range from 0.5 to 0.99, which lets a small bias free more of the budget for variance and reduces the samples needed.

## How the Multilevel Run Adds Levels and Decides to Stop

1. Start at level 0 with 20 warm-up samples, or fewer on later levels if regression from earlier levels predicts fewer.
2. Estimate V_l, compute N_l for all current levels, and add the missing samples.
3. Estimate the bias by fitting a line to log2 |E[D_l]| over the last three levels, and reading the next level.
4. Stop when the finest level is at least 3 and the mean squared error is at most eps^2 or the squared bias is at most (1 - theta) eps^2.
5. Otherwise add a level, unless **Max Level** has been reached.

## How Continuation Works in MultilevelEstimators.jl

`run(estimator, tol)` does not start at the target tolerance. By default, the package runs a decreasing sequence of ten tolerances that ends at `tol`, and each step reuses the samples already drawn. Early, cheap steps improve the estimates of V_l and of the rates before the expensive ones are reached. The panel reads only the final entry of the history, and the total cost it prints counts all samples kept by then.

## Which Panel Inputs Affect the Multilevel Algorithm

**Relative Tolerance** sets eps, multiplied by the size of the exact answer. **Max Level** caps L. **Seed** sets the random numbers, and **Problem** sets `sample_fn` and the rates to expect. The warm-up count, the splitting range and the continuation settings stay at the package defaults, with no input for them. The cost model is fixed at 2^l in the code.

## Where Multilevel Monte Carlo Is Strong and Where It Misleads

The method is strongest when beta is greater than gamma, as the cost then grows like eps^-2 with no bias penalty. It misleads in three cases. A non-smooth quantity with weak coupling erodes beta, and the saving with it. A last level with an unusually small |E[D_L]| shrinks the bias estimate and stops the run too early. A level with few samples gives a noisy V_l, which steers the allocation. Compare with **Multilevel vs Single Level**, and use **Max Level Sweep** to see the effect of depth.

## References

<a id="ref-Gil2008a"></a>Giles, M. B. (2008). Multilevel Monte Carlo path simulation. *Operations Research* 56(3), 607–617. [doi:10.1287/opre.1070.0496](https://doi.org/10.1287/opre.1070.0496)

<a id="ref-Rob2018a"></a>Robbe, P. (2018). MultilevelEstimators.jl: a Julia toolbox for multilevel Monte Carlo methods.

## See Also

- [Overview](overview.md) · [Complexity Theorem](complexity-theorem.md) · [Quasi-Monte Carlo Extension](qmc-extension.md) · [Diagnostics](diagnostics.md)
