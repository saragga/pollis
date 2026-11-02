# Assumptions

Each plot in the Extreme Value Diagnostics panel rests on conditions that the plot itself may not reveal. The same data can look acceptable on a QQ plot while breaking the conditions that give the tail model its meaning.

## Why Extreme Value Diagnostics Need Losses as Positive Numbers

All three tabs read the upper tail of the **Data series**, so larger values must mean worse outcomes. A series of returns has to be turned into `losses = -returns` first, otherwise the diagnostics describe the largest gains.

The **Hill Plot** tab also needs positive values, since it takes logarithms of ratios. The code drops every value that is not positive, so gains disappear without a message. A location shift changes Hill(k), because the estimator is not shift invariant. Subtracting a mean or adding a constant to the losses therefore alters the Hill plot, while the mean excess slope stays the same.

## What Independence Means for Tail Diagnostics on Clustered Losses

The limit results for excesses and maxima are simplest for independent, identically distributed observations. Financial and environmental series often have large values arriving in runs. [Leadbetter (1983)](#ref-Lea1983a) showed how local dependence affects the extremes of stationary sequences, and the extremal index measures the clustering.

Clustered excesses do not stop the panel from running. Point estimates can remain usable, but the effective sample is smaller than the count of exceedances, so any plot looks more settled than the data justify. The panel has no clustering check. A plot of the exceedance times in the original order shows runs, and `getcluster` in Extremes.jl groups exceedances into clusters whose peaks can be fitted instead.

## How Changes Over Time Break a Single Tail Fit

All the panel's fits assume one set of parameters for the whole series. A trend, a seasonal pattern or a change in volatility mixes different tails, and the mixture can look heavier than any of its parts. Such a series may produce a curved mean excess plot or a Hill plot with no flat stretch, but a straight plot does not prove stability.

To check, repeat the tabs on separate periods and compare. Extremes.jl accepts covariates through `locationcov`, `logscalecov` and `shapecov`, which the panel does not use. Volatility filtering before the tail analysis is another route, and the conclusions then concern the filtered series.

## Why the GEV Fit Requires Block Maxima and the GP Fit a High Threshold

The GEV is a limit for maxima, so **GEV** in the **QQ Plot** tab needs a series of block maxima, such as monthly maximum losses. The code cannot verify that, and it fits whatever it receives. A GEV fitted to every loss answers a different question.

The GP is a limit for excesses as the threshold rises. A threshold set too low gives bias, since the excesses are not yet GP. A threshold set too high leaves few excesses and a large variance. No threshold removes both errors, and the 90th percentile default in **Threshold u (GP)** is only a starting point. The default also refers to a variable named `losses`, so it has to be rewritten when the **Data series** has another name.

## When the Hill Estimator Applies to a Tail

The Hill estimator assumes a Pareto-type tail, where xi is above 0 and P(X > x) behaves like a power of x times a slowly varying function. Applied to a thin or bounded tail, Hill(k) still returns a positive number, which says nothing about a power law. The slowly varying part also brings bias as k grows, even when the tail is Pareto-type. Check the sign of the tail first, using the direction of the mean excess plot or the shape from a GP fit.

## What Each Estimation Method Assumes About the Shape

| **Estimation method** | Condition | What happens outside the condition |
|---|---|---|
| **Maximum Likelihood** | Usual large-sample theory for xi above −0.5 | Standard errors and their intervals lose their basis |
| **Probability-Weighted Moments** | Needs a finite mean, so xi under 1 | The moments used do not exist in the population |
| **Bayesian Estimation** | The Extremes.jl sampler uses a flat prior on its parameters | Small samples can give a wide or unstable posterior |

Details of the first condition are in [Coles (2001)](#ref-Col2001a).

## References

<a id="ref-Col2001a"></a>Coles, S. (2001). *An introduction to statistical modeling of extreme values*. Springer London. [doi:10.1007/978-1-4471-3675-0](https://doi.org/10.1007/978-1-4471-3675-0)

<a id="ref-Lea1983a"></a>Leadbetter, M. R. (1983). Extremes and local dependence in stationary sequences. *Zeitschrift für Wahrscheinlichkeitstheorie und Verwandte Gebiete* 65(2), 291–306. [doi:10.1007/BF00532484](https://doi.org/10.1007/BF00532484)

## See Also

- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
