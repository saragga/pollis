# Interpretation

The outputs of the panel describe how a model's result depends on chance and on its parameters. Most of them are summaries across runs, and each has a limit on what it can support.

## How to Read the Mean and Spread of an Ensemble

The mean across replications estimates the outcome expected at the chosen step, and the standard deviation shows how far single runs fall from it. A small spread relative to the mean means that one run is nearly as informative as many. A large spread means that the model's history matters, and a single run should not be reported. Look at the distribution before trusting the two numbers, since a model with two typical endings has a mean that no run shows.

## How to Read the Standard Error of an Ensemble Mean

The standard error measures how precisely the mean is known, and differs from the spread of runs. It shrinks with more replications, so it can always be made small, and a small value says only that the mean of this model at these settings is well estimated. A difference between two settings counts as a real difference in the model if it is large against the standard errors. Whether such a difference matters is a separate judgement. With enough replications, any tiny difference can be detected.

## How to Read a Parameter Heatmap

**Parameter Heatmap** colours the last-step outcome over 81 pairs of `threshold` and `density`, from one run at each pair. Broad regions of one colour show where the outcome is stable, and a band of rapid change shows a transition. Single odd cells may be chance. In the example, read the outcome with care: at low density a resident often has no neighbours and counts as happy, so a high share says little about mixing. A high share of happy residents is also not the same as low segregation, a different quantity that the example does not record.

## How to Read an Equilibrium Summary

**Equilibrium Summary** prints one row per combination with `threshold`, `density`, `eq_mean`, `eq_std` and `runs`. **eq_mean** is the mean of the last-step outcome across seeds, and **eq_std** the spread between them. A high **eq_std** marks combinations where chance decides the result, and those often lie near a transition. The name assumes a settled state, so a combination still moving at **Steps (T)** gets a value that is not an equilibrium. Differences between rows should be judged against **eq_std** / sqrt(**runs**).

## How to Read First-Order and Total Sobol Indices

**Sobol Sensitivity** prints S1 and ST for each parameter. A large S1 means the parameter moves the output on its own, averaged over the other. A large gap between ST and S1 means that its effect depends on the other parameter, and in that case the first-order figure understates it. An ST near 0 means that the parameter can be fixed without much loss. Small negative values come from estimation error and can be read as 0. All values hold only within the ranges in `bounds`, as [Sobol (2001)](#ref-Sob2001a) defines the indices over a given domain.

## What a Replicated Agent-Based Study Can Support

A careful ensemble and scan support statements about the model: what it usually does, how much chance matters, and which parameters drive the outcome within given ranges. They do not support statements about a real system, unless the model has also been calibrated and validated. [Wilensky and Rand (2015)](#ref-WR2015a) treat those later steps. A precise figure from many runs is still a figure about the rules that were assumed.

## References

<a id="ref-Sob2001a"></a>Sobol, I. M. (2001). Global sensitivity indices for nonlinear mathematical models and their Monte Carlo estimates. *Mathematics and Computers in Simulation* 55(1–3), 271–280. [doi:10.1016/s0378-4754(00)00270-6](https://doi.org/10.1016/s0378-4754(00)00270-6)

<a id="ref-WR2015a"></a>Wilensky, U. and Rand, W. (2015). *An Introduction to Agent-Based Modeling*. MIT Press.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
