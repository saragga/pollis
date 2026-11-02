# Decision Guide

The ratio p/n and the presence of outliers settle most of the choice. Start by checking whether regularisation is needed at all, then pick a tab, then let held-out scores decide between close options.

## Whether a Covariance Needs Regularising at All

| Situation | Choice | Why |
|---|---|---|
| n far greater than p, no extreme values | `S_sample` may be enough | Regularisation changes little, as **Distance from Sample Covariance** will show |
| p comparable to n | Regularise | Sample eigenvalues are spread too widely |
| p greater than n | Regularise | The sample covariance is singular |
| The inverse is the final goal | Regularise, even at moderate p/n | Inversion magnifies noise |
| Sparse links between variables are the goal | Another method | These estimators do not set entries to zero |

## Which Regularised Covariance Tab Suits Which Data

| Situation | Tab | Why |
|---|---|---|
| A safe general start, with p comparable to n | **Linear** | Closed-form weight, and a choice of structure |
| Large p/n, with eigenvalues needing different treatment | **Nonlinear** | One map for all eigenvalues, with no inputs |
| A few strong factors over diffuse noise | **Woodbury** | Few parameters, and fast to work with |
| Outliers or heavy tails | **Biweight** | Down-weights extreme values |
| Unclear | **Compare Estimators** | Scores the main options on held-out rows |

## Which Target Suits the Linear Tab

| Belief about the data | **Target** |
|---|---|
| Similar correlations among all pairs, as with stock returns | ConstantCorrelation |
| Uncorrelated variables on one scale | DiagonalCommonVariance |
| Uncorrelated variables on different scales | DiagonalUnequalVariance |
| Standardised, uncorrelated variables | DiagonalUnitVariance |
| Exchangeable variables on one scale | CommonCovariance |
| Variables moving nearly together | PerfectPositiveCorrelation |

Choose before looking at held-out scores if possible, and compare two or three plausible targets at most.

## Which Shrinkage Method Suits the Linear Tab

Use `:lw`, the default, unless there is a reason to change. `:ss` is an alternative that is often used for genomic data with p far greater than n. Both `:oas` and `:rblw` were derived for Gaussian data, and they work only with DiagonalCommonVariance, so choosing them requires that target. Differences between rules usually shrink as n grows, so a rule rarely matters as much as the target. A failed combination of rule and target calls for a different pairing, and not for a change of data.

## How to Set Rank and Tuning Constant c

Set **Rank** at the number of eigenvalues standing clear of the rest on **Eigenvalue Spectrum**, and keep it well under p. Try the values on each side of it, and compare **Held-Out Log-Likelihood**. The default of **Tuning Constant c** is 9.0, in units of the median absolute deviation, which the tooltip calls the standard choice. Lower it to reject outliers more aggressively if **Correlation Heatmap** still shows pairs driven by a few rows. A very low value also discards genuine data in the tails.

## How to Choose for a Final Use

| Use | What to check | Note |
|---|---|---|
| Portfolio weights | Variance on later returns | **Minimum-Variance Weights** reports only the in-sample figure |
| Outlier screening | Flags on clean data | Consider **Biweight**, as outliers should not shape the estimate |
| Partial correlations | **Conditioning** | Smooth estimates shrink, but do not select |
| A plug-in for a model | The model's own held-out performance | Log-likelihood may not reflect its needs |

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
