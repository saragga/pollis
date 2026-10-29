# Confidence Intervals

Bootstrap.jl gives five intervals from the same replicates. Write theta for the estimate on the data, theta* for a replicate, and q(p) for the p quantile of the replicates.

## Percentile
The interval from q(alpha/2) to q(1 - alpha/2): the central part of the replicates. Simple, and it respects the range of the statistic (a correlation stays within -1 and 1), but it is right only when the bootstrap distribution is centred on the estimate and the statistic is not biased.

## Basic
The percentile interval reflected around the estimate: from 2 theta - q(1 - alpha/2) to 2 theta - q(alpha/2). It assumes the distribution of theta* - theta imitates that of theta - (true value). It corrects for bias, but can step outside the range of the statistic.

## Normal
The estimate, corrected for bias, plus or minus a normal quantile times the bootstrap standard error. Good when the replicates look normal; wrong when they are skewed.

## BCa
**Bias-corrected and accelerated** (Efron, 1987): percentile endpoints moved by two corrections, **z0** for the bias (the share of replicates below the estimate) and **a**, the acceleration, for a standard error that changes with the parameter (computed from the jackknife). It is **second-order accurate**: its coverage error shrinks faster with n than that of the percentile, basic and normal intervals. The usual default.

## Studentised
The bootstrap-t: each replicate gives a t statistic, (theta* - theta) / se*, with se* the standard error of that replicate, from a **nested bootstrap** inside it. The interval uses the quantiles of these t statistics with the standard error of the data. Second-order accurate too, and often the best coverage when the standard error can be estimated well; but it needs the inner replicates, and can be unstable when se* is poorly estimated.

## Comparing Them

| Interval | Corrects bias | Handles skew | Accuracy | Cost |
|---|---|---|---|---|
| Percentile | No | Partly | First order | Low |
| Basic | Yes | No | First order | Low |
| Normal | Yes | No | First order | Low |
| BCa | Yes | Yes | Second order | Low (plus jackknife) |
| Studentised | Yes | Yes | Second order | High (nested) |

## See Also
- [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md) · [Resampling Schemes](resampling-schemes.md)
