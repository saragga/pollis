# Diagnostics

The checks in the panel test whether a study is long enough and large enough, and whether its parameters interact. None tests whether the model describes a real system.

## How to Find the Burn-in of an Agent-Based Model

**Burn-in Detection** draws the ensemble mean against step, with a dashed red line as a candidate burn-in. The line is fixed at step 10 in the code, whatever the model does, so nothing is detected automatically: move it by editing `vlines!`. A curve that has flattened by the line supports it. A curve still moving means that later steps are needed, and that **Steps (T)** may be too short. A flat mean can hide runs that are still moving in opposite directions, so read it alongside **Ensemble Trajectories**.

## How to Read the Spread of Ensemble Trajectories

**Ensemble Trajectories** draws the mean with a band of plus or minus one standard deviation across runs. That band shows the spread of single runs, and it is not a confidence interval for the mean, which would be 1.96 s / sqrt(R) on each side. A band that narrows over time means that runs converge to a common outcome, and one that widens means that runs diverge. A band reaching past 0 or 1 for a share is only an artefact of the formula, and suggests a skewed outcome.

## How to Measure Stochastic Noise Across Replications

**Variance Across Runs** prints the number of replications with the mean, the standard deviation and the standard error at the last step. Compare the standard error with the size of effect that matters. If an effect of interest is about as large as twice the standard error, or smaller, more replications are needed before reading it. A standard deviation of exactly 0 is suspicious in a stochastic model unless every run has reached the same absorbing state, and it can point to seeds that are not reaching the model.

## How to Check Whether the Number of Replications Is Enough

**Larger Ensemble** prints the standard error for 10, 20, 50 and 100 replications. The figure should fall roughly with the square root of the count, and a very different pattern suggests heavy tails or a mistake in the seeds. Each count reuses seeds from 1 upward, so the smaller ensembles are subsets of the larger ones and the figures are not independent. Stop adding replications once the standard error is small against the differences being studied, as the cost grows in direct proportion.

## How to Check the Resolution of a Parameter Scan

**Finer Parameter Grid** runs one parameter at a coarse and a fine spacing, and prints the number of points and the range of the outcome for each. A fine range wider than the coarse one means that the coarse grid has missed part of the response. The step prints no location, so plot the fine scan to see where a change occurs. With one seed per point, a jagged fine curve may show noise and not structure, so add a `:seed` list before reading detail.

## How to Check Whether Parameters of an Agent-Based Model Interact

**OAT vs Factorial** gives a quick signal, comparing the variance of the outcome under each one-at-a-time design with its variance under the factorial design. A factorial variance well above the sum suggests interaction, though the designs cover different points, so this is a hint only. [Ten Broeke, van Voorn and Ligtenberg (2016)](#ref-BVL2016a) discuss the limits of classical methods for models with emergent behaviour. **Sobol Sensitivity** gives the formal split through the gap between ST and S1.

## References

<a id="ref-BVL2016a"></a>Ten Broeke, G., van Voorn, G. and Ligtenberg, A. (2016). Which sensitivity analysis method should I use for my agent-based model? *Journal of Artificial Societies and Social Simulation* 19(1). [doi:10.18564/jasss.2857](https://doi.org/10.18564/jasss.2857)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Sensitivity Analysis](sensitivity.md)
