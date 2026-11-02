# Ensemble Runs

An ensemble is a set of runs that differ only in their random numbers. It estimates what the model usually does, and how far a single run can stray from that.

## What an Ensemble of Agent-Based Runs Computes

**Ensemble Runs** creates one model per seed and runs all of them for **Steps (T)** with `ensemblerun!`, collecting the mean of `mood` over agents at every step. The result is a table with `time`, `mean_mood` and `ensemble`, so each replication can be read on its own. The code then takes the last-step value of each run, and prints their mean and standard deviation. [Datseris, Vahdati and DuBois (2022)](#ref-DVD2022a) describe the package behind the call. The mean estimates the expected outcome at that step, and the deviation measures the variation between runs.

## What Formulas Summarise an Ensemble

With final values y_1 to y_R from R independent seeds:

- Ensemble mean: m = (1/R) sum of y_r
- Spread across runs: s = sqrt( sum of (y_r − m)² / (R − 1) )
- Standard error of the mean: SE = s / sqrt(R)
- Approximate 95% confidence interval for the mean: m ± 1.96 SE

The spread s is a property of the model, and does not shrink as R grows. The standard error does shrink, and falls by half when R is multiplied by four.

## Which Inputs the Ensemble Runs Tab Uses

**Model initializer** names the function called as `initialize_model(seed = i)` for each replication. **Replications (R)** sets how many are made, and so the precision of the mean. **Steps (T)** sets the step at which the outcome is read. Parameters of the example stay at their keyword defaults, and are changed in the code. Seeds are always 1 to R, so a repeat of the tab gives the same numbers, and a different set of seeds means editing the line that builds `models`.

## Where Ensemble Runs Are Strong

An ensemble makes no assumption about the form of the outcome, and asks only for independent runs of the model. It gives a direct picture of chance, which is the baseline for judging any parameter's effect. Each run is cheap to write, as the replication logic is one line, and trajectories show when and how runs diverge as well as where they end. [Miller and Page (2007)](#ref-MP2007a) stress that complex systems can behave very differently from their averages, and the run-level table keeps that information.

## Where Ensemble Summaries Mislead

A mean and a standard deviation describe one cluster of outcomes. A model with two typical endings, such as an epidemic that either dies out or spreads, has a mean that no run resembles. With small R, the standard deviation itself is imprecise. Interval formulas with 1.96 rest on a normal approximation that can be poor for shares near 0 or 1. An ensemble also covers only the parameter values used, so a tight spread says nothing about robustness to other settings. Runs that have not settled by the last step give a figure that depends on **Steps (T)**.

## What to Compare an Ensemble With

**Ensemble vs Single Run** draws the ensemble mean with the run for seed 1, as a reminder of how far one history can sit from the average. **Larger Ensemble** prints the standard error at 10, 20, 50 and 100 replications. **Parameter Scanning** extends the design across parameter values, and a `:seed` list there gives an ensemble at each point. Differences between two settings are best read against the spread measured here.

## References

<a id="ref-DVD2022a"></a>Datseris, G., Vahdati, A. R. and DuBois, T. C. (2022). Agents.jl: a performant and feature-full agent based modelling software of minimal code complexity. *SIMULATION* 100(10), 1019–1031. [doi:10.1177/00375497211068820](https://doi.org/10.1177/00375497211068820)

<a id="ref-MP2007a"></a>Miller, J. H. and Page, S. E. (2007). *Complex Adaptive Systems: An Introduction to Computational Models of Social Life*. Princeton University Press.

## See Also

- [Factsheet](factsheet.md) · [Parameter Scanning](parameter-scanning.md) · [Sensitivity Analysis](sensitivity.md) · [Diagnostics](diagnostics.md)
