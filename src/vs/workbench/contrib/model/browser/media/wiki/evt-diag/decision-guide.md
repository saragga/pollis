# Decision Guide

The Extreme Value Diagnostics panel works as a sequence of checks more than as a choice of one method. The choices that matter are which plot answers the question at hand, how the tail is defined, and how the fit is estimated.

## Which Extreme Value Diagnostics Tab to Use for Each Question

| Situation | Tab or Next Step | Why |
|---|---|---|
| Need a threshold for a GP fit | **Mean Excess**, then **Threshold Stability** | The plot suggests where linearity begins, and the refits test that level |
| Need a sign for the tail | **Mean Excess** | A rising, flat or falling line indicates heavy, exponential-like or bounded |
| Tail believed to be Pareto-type, need alpha | **Hill Plot** | Gives xi = 1/alpha, with the number k of largest losses as the only choice |
| Have block maxima and a GEV in mind | **QQ Plot** with **GEV** | Compares the fitted GEV with the maxima |
| Have a threshold and a GP in mind | **QQ Plot** with **GP** | Compares the fitted GP with the excesses |
| Losses may be thin-tailed or bounded | Avoid **Hill Plot** | Hill(k) applies to xi above 0 only |

## Whether to Model Tails with Block Maxima or a Threshold

Block maxima keep one value per block, so they discard most of the data, but dependence within a block matters less, and blocks handle seasonality when they span a full cycle. A threshold uses all losses above u, so it usually gives more data for the same record, and requires the threshold choice and attention to clusters of large values.

Choose block maxima when the question is posed per period, such as the largest loss of a year, or when only maxima are recorded. Choose a threshold when the full series is available and tail quantiles are the aim. A comparison of the two is in [Coles (2001)](#ref-Col2001a).

## How to Choose a Threshold for the Generalised Pareto Fit

A threshold trades bias against variance. A lower u gives more excesses but risks fitting a part of the distribution that is not yet GP. A higher u has less bias but a noisier shape.

Start from the default 90th percentile in **Threshold u (GP)** only as a first guess. Move it to the lowest level where the mean excess plot is straight and **Threshold Stability** shows a steady **xi_hat** and modified scale. Then rerun with one level higher and one lower, and report how the shape changes. A result that depends strongly on the threshold is itself a finding.

## How to Choose the Number of Largest Losses in a Hill Plot

The choice of k in the **Hill Plot** tab plays the part of the threshold, since x(k+1) acts as a threshold set by the data. A small k gives high variance, and a large k brings in losses from outside the tail and adds bias.

Choose k from a flat stretch of the curve and not from the three printed values, which are fixed at 10, 50 and 100. When no flat stretch appears, do not report a single value. Report a range, or move to a GP fit, which allows any sign of xi.

## Which Estimation Method to Choose for the QQ Plot

| **Estimation method** | When to prefer it | Limit |
|---|---|---|
| **Maximum Likelihood** | Moderate to large samples and a default for comparing fits; **Threshold Stability** also uses it | Can be unstable in small samples |
| **Probability-Weighted Moments** | Small samples, with xi believed to be under 1 | Unavailable in theory for xi at or above 1 |
| **Bayesian Estimation** | A posterior for the parameters is wanted | Slower, and the panel keeps only the posterior means |

For the GEV, [Hosking, Wallis and Wood (1985)](#ref-HWW1985a) found probability-weighted moments compared favourably with maximum likelihood in small and moderate samples. For the GP, [Hosking and Wallis (1987)](#ref-HW1987a) found moments or probability-weighted moments more reliable unless the sample reached 500 or more.

## References

<a id="ref-Col2001a"></a>Coles, S. (2001). *An introduction to statistical modeling of extreme values*. Springer London. [doi:10.1007/978-1-4471-3675-0](https://doi.org/10.1007/978-1-4471-3675-0)

<a id="ref-HW1987a"></a>Hosking, J. R. M. and Wallis, J. R. (1987). Parameter and quantile estimation for the generalized Pareto distribution. *Technometrics* 29(3), 339–349. [doi:10.1080/00401706.1987.10488243](https://doi.org/10.1080/00401706.1987.10488243)

<a id="ref-HWW1985a"></a>Hosking, J. R. M., Wallis, J. R. and Wood, E. F. (1985). Estimation of the generalized extreme-value distribution by the method of probability-weighted moments. *Technometrics* 27(3), 251–261. [doi:10.1080/00401706.1985.10488049](https://doi.org/10.1080/00401706.1985.10488049)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
