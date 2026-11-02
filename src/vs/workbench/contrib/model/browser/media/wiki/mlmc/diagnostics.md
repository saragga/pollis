# Multilevel Monte Carlo — Diagnostics

A small estimated RMSE says only that the estimator believes its own error model. These checks test that model level by level, and the known exact answer of both problems gives a further test that real applications would lack.

## How to Check That Multilevel Corrections Lose Variance

**Variance Decay** prints Var[Q_l - Q_(l-1)] for each level, its ratio to the previous level, and the fitted beta next to the theoretical one. A steady ratio near 2^beta is what a good coupling gives. Ratios close to 1 mean that fine levels stay expensive: look for a coupling error in `sample_fn`. On **MLQMC**, the variance shown is over the points of a shift, so it does not reflect the gain of the lattice.

## How to Check the Weak Convergence of Multilevel Corrections

**Mean Decay** prints |E[Q_l - Q_(l-1)]|, its ratio, the fitted alpha next to the theoretical one, the bias estimate and |estimate - exact|. Steady ratios near 2^alpha support the extrapolation behind the bias estimate. Erratic ratios on fine levels usually mean that the mean of the correction is smaller than its sampling noise, and a tighter tolerance reduces that noise.

## How to Compare the Cost Model with the Measured Time per Level

**Cost per Level** plots the cost model 2^l against the measured time per sample, on a log2 scale and relative to level 0. Parallel lines on fine levels support the model. Coarse levels often sit apart, since there the overhead of `pmap` exceeds the arithmetic. A measured slope far from the model on fine levels means that the true gamma differs from 1, and that the allocation is not optimal for the time spent.

## Why a Multilevel Run Stopped at Its Finest Level

**Levels Used** lists |E[Q_l - Q_(l-1)]| and the samples per level, then L, the bias estimate, the mean squared error and tol^2. Its text always places the sign <= between the last two, so compare the numbers rather than trust the sign. A warning appears when L has reached **Max Level**, as the bias may then exceed its share of the tolerance, and the remedy is a larger **Max Level**.

## How to Test Whether the Multilevel Error Budget Holds

**MSE Decomposition** splits the mean squared error into estimator variance and squared bias, against tol^2, and adds the actual squared error of this run. A budget at or under tol^2 is the aim. One actual error proves little, as it is a single draw with a wide spread. Actual errors far above the budget across several values of **Seed** are a warning about the bias estimate.

## How to Measure the Saving over Single-Level Monte Carlo

**Multilevel vs Single Level** runs plain sampling at the same finest level and tolerance, and prints both costs, both errors and their ratio. The package's single-level run always gives half of tol^2 to the variance, while the multilevel run may give it up to 0.99 of tol^2. The printed ratio can therefore favour the multilevel side by up to a factor of about 2, and **Cost vs Tolerance** and **Complexity Check** carry the same caveat.

## How to Test the Sensitivity of a Multilevel Run to Max Level

**Max Level Sweep** caps the finest level at 1, 2 and so on, up to L + 2 or **Max Level**, and prints levels used, cost, estimated RMSE and actual error. Results that settle once the cap passes L show that the ladder is deep enough. An actual error that keeps falling as the cap rises means that the uncapped run stopped too early.

## How to See the Random Spread of a Multilevel Estimate

The Next Steps of the panel offer no repeated-run check, and a single run hides the spread of its own error. Change **Seed**, run a few times, and compare the estimates with the estimated RMSE. A spread much wider than the estimated RMSE means that the variance estimate is not to be trusted, which can happen when fine levels hold very few samples.

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Complexity Theorem](complexity-theorem.md)
