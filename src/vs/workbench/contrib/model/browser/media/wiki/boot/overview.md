# Overview

The Bootstrap Resampling panel estimates the sampling distribution of a statistic by the **bootstrap**: instead of deriving the distribution from a formula, it recomputes the statistic on many samples drawn from the data (or from a model fitted to them), and reads the standard error, the bias and confidence intervals from the spread of these **replicates**. The panel offers three ways of drawing the samples, all through Bootstrap.jl, and five confidence intervals for each.

## Nonparametric
Resample the observations **with replacement**, each replicate the size of the data. The schemes are **Basic** (independent draws), **Balanced** (each observation used equally often over all replicates) and **Antithetic** (draws paired to reduce variance). See [Resampling Schemes](resampling-schemes.md).

## Parametric
Fit a distribution (Normal, Log-Normal, Gamma or Exponential) to the data by maximum likelihood and draw the replicates from the fit. More efficient when the distribution is right, misleading when it is not.

## Time Series
Resampling single observations destroys the dependence in a series. The **maximum entropy bootstrap** builds replicates that keep the time order and shape of the series, for statistics such as the mean, the standard deviation and the lag-1 autocorrelation. See [Maximum Entropy Bootstrap](maximum-entropy.md).

## Confidence Intervals
Each model gives the **percentile**, **basic**, **normal**, **BCa** and **studentised** intervals, the last from a nested bootstrap of the standard error. See [Confidence Intervals](confidence-intervals.md).

## Common Workflow

1. Choose the data, the statistic, the scheme and the number of replicates, and look at the **Replicate Histogram** and the **Interval Plot**.
2. Check the **Replicate Shape** and the **Jackknife Influence** of each observation.
3. Plan with **Width vs Sample Size** and **Required Replicates**.
4. Compare intervals by **Interval Coverage**, and schemes with **Compare Schemes**.
5. Choose and explain the interval with **Interval Choice** and **Bias Correction**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Confidence Intervals](confidence-intervals.md)
