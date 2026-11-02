# Sensitivity Analysis

Sensitivity analysis asks which inputs drive the variation in a model's output. The panel offers a variance-based method and a simpler check for interactions.

## What Sobol Indices Measure in an Agent-Based Model

Sobol indices divide the variance of an output across its inputs, as these are varied together over given ranges. The first-order index of an input is the share of variance due to that input alone. The total-effect index adds every interaction involving it. [Sobol (2001)](#ref-Sob2001a) gives the indices and their Monte Carlo estimates. **Sobol Sensitivity** calls `gsa(happy_at_end, Sobol(), bounds; samples = 256)` from `GlobalSensitivity.jl` and prints both indices for `threshold` and `density`. The output here is the share of happy residents at the last step, averaged over five seeds.

## What Formulas Define Sobol Indices

For an output Y and independent inputs X_1 to X_d, over their ranges:

- First-order index: S_i = Var( E[Y | X_i] ) / Var(Y)
- Total-effect index: ST_i = E[ Var(Y | all inputs but X_i) ] / Var(Y)
- Interaction share of X_i: ST_i − S_i

The first-order indices sum to at most 1, and the gap to 1 is due to interactions. An ST_i near 0 means the input can be fixed anywhere in its range with little effect on the output.

## How Much a Sobol Analysis of an Agent-Based Model Costs

The code comments give the size of the design: 256 × (2 + 2) points, or 1024, for two parameters. Each point runs five seeds, set by `K`, so the step runs 5120 simulations of **Steps (T)** each. More parameters raise the number of points in proportion, and more seeds raise the cost in proportion too. This is the costliest Next Step in the panel, and it pays to test it with a small `samples` and a short **Steps (T)** first. The indices become more stable as `samples` grows.

## Why Seeds Need Averaging in a Sobol Analysis

A stochastic model gives a different output at the same parameters, and the analysis could count that noise as parameter importance. Averaging `K` runs at each point shrinks the noise, and the code uses the same seeds at every point, so that points differ only in their parameters. Fixing the seeds means that the indices describe the model under those seeds, not under all possible ones. With few seeds the estimates still carry noise, which appears as small negative indices or as a total that does not add up. Those are estimation errors, and not findings.

## Where Sensitivity Analysis of Agent-Based Models Misleads

Indices depend on the ranges in `bounds`, which are written in the code, and a narrow range makes any input look unimportant. The method also assumes independent inputs, while real parameters can be linked. It reduces the output to one number, so a model that changes in pattern but not in that number shows no sensitivity. [Ten Broeke, van Voorn and Ligtenberg (2016)](#ref-BVL2016a) find that classical methods carry limited information for models with multiple levels and emergent behaviour. A high index says that a parameter matters in the model, and nothing about the real system.

## How OAT Compares with a Factorial Design

**OAT vs Factorial** prints the variance of the outcome under two one-at-a-time designs and under the full factorial. A one-at-a-time design moves one input from a fixed base, so it cannot detect an effect that appears only at some value of another input. A factorial variance far above the sum of the two one-at-a-time variances hints at interaction. Those variances are measures over the listed points and are not shares explained. Use the step as a quick warning, and the Sobol step for a formal split.

## References

<a id="ref-Sob2001a"></a>Sobol, I. M. (2001). Global sensitivity indices for nonlinear mathematical models and their Monte Carlo estimates. *Mathematics and Computers in Simulation* 55(1–3), 271–280. [doi:10.1016/s0378-4754(00)00270-6](https://doi.org/10.1016/s0378-4754(00)00270-6)

<a id="ref-BVL2016a"></a>Ten Broeke, G., van Voorn, G. and Ligtenberg, A. (2016). Which sensitivity analysis method should I use for my agent-based model? *Journal of Artificial Societies and Social Simulation* 19(1). [doi:10.18564/jasss.2857](https://doi.org/10.18564/jasss.2857)

## See Also

- [Factsheet](factsheet.md) · [Ensemble Runs](ensemble.md) · [Parameter Scanning](parameter-scanning.md) · [Decision Guide](decision-guide.md)
